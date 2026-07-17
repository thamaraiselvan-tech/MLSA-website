import csv
import io
import os
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import BackgroundTasks, Depends, FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select

from auth import create_access_token, get_current_admin, hash_password, verify_password
from database import get_session, init_db
from email_utils import send_confirmation_email
from models import Admin, Event, Registration, Update

app = FastAPI(title="MLSA Chapter Platform API")

origins = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploaded images (update/event photos) are served from here.
# NOTE: on most hosts (including Render's free tier) this directory is wiped on every
# redeploy. Fine for local dev and light use; for durable uploads in production, attach
# a persistent disk (Render) or switch to object storage (e.g. Cloudinary's free tier).
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5MB


@app.on_event("startup")
def on_startup():
    init_db()
    # Bootstrap a default admin if none exists yet, using env vars.
    from sqlmodel import Session as _S
    from database import engine
    with _S(engine) as session:
        existing = session.exec(select(Admin)).first()
        if not existing:
            bootstrap_email = os.getenv("ADMIN_EMAIL")
            bootstrap_password = os.getenv("ADMIN_PASSWORD")
            if bootstrap_email and bootstrap_password:
                admin = Admin(
                    email=bootstrap_email,
                    hashed_password=hash_password(bootstrap_password),
                    name=os.getenv("ADMIN_NAME", "MLSA Admin"),
                )
                session.add(admin)
                session.commit()
                print(f"Bootstrapped admin account: {bootstrap_email}")


# ---------- Schemas ----------

class UpdateCreate(BaseModel):
    title: str
    body: str
    category: str = "General"
    pinned: bool = False
    image_url: Optional[str] = None


class EventCreate(BaseModel):
    title: str
    description: str
    location: str = "Online"
    event_date: datetime
    registration_deadline: Optional[datetime] = None
    capacity: Optional[int] = None
    banner_note: str = ""
    is_open: bool = True
    image_url: Optional[str] = None


class RegistrationCreate(BaseModel):
    event_id: int
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    college: Optional[str] = None
    department: Optional[str] = None
    year_of_study: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str
    admin_name: str


class AdminCreate(BaseModel):
    email: EmailStr
    password: str
    name: str


class AdminOut(BaseModel):
    id: int
    email: str
    name: str


# ---------- Auth ----------

@app.post("/api/admin/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    admin = session.exec(select(Admin).where(Admin.email == form_data.username)).first()
    if not admin or not verify_password(form_data.password, admin.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token({"sub": admin.email})
    return Token(access_token=token, token_type="bearer", admin_name=admin.name)


@app.get("/api/admin/list", response_model=List[AdminOut])
def list_admins(session: Session = Depends(get_session), admin: Admin = Depends(get_current_admin)):
    admins = session.exec(select(Admin)).all()
    return [AdminOut(id=a.id, email=a.email, name=a.name) for a in admins]


@app.post("/api/admin/register", response_model=AdminOut)
def register_admin(payload: AdminCreate, session: Session = Depends(get_session),
                    admin: Admin = Depends(get_current_admin)):
    existing = session.exec(select(Admin).where(Admin.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="An admin with this email already exists")
    new_admin = Admin(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        name=payload.name,
    )
    session.add(new_admin)
    session.commit()
    session.refresh(new_admin)
    return AdminOut(id=new_admin.id, email=new_admin.email, name=new_admin.name)


@app.delete("/api/admin/{admin_id}")
def delete_admin(admin_id: int, session: Session = Depends(get_session),
                  admin: Admin = Depends(get_current_admin)):
    if admin_id == admin.id:
        raise HTTPException(status_code=400, detail="You can't remove your own account while signed in as it")
    target = session.get(Admin, admin_id)
    if not target:
        raise HTTPException(status_code=404, detail="Admin not found")
    total = len(session.exec(select(Admin)).all())
    if total <= 1:
        raise HTTPException(status_code=400, detail="At least one admin account must remain")
    session.delete(target)
    session.commit()
    return {"ok": True}


# ---------- Image uploads (admin only) ----------

@app.post("/api/uploads")
async def upload_image(file: UploadFile = File(...), admin: Admin = Depends(get_current_admin)):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WEBP, or GIF images are allowed")

    contents = await file.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="Image must be 5MB or smaller")

    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(contents)

    return {"url": f"/uploads/{filename}"}


# ---------- Updates (public read, admin write) ----------

@app.get("/api/updates", response_model=List[Update])
def list_updates(session: Session = Depends(get_session)):
    updates = session.exec(select(Update).order_by(Update.pinned.desc(), Update.created_at.desc())).all()
    return updates


@app.post("/api/updates", response_model=Update)
def create_update(payload: UpdateCreate, session: Session = Depends(get_session),
                   admin: Admin = Depends(get_current_admin)):
    update = Update(**payload.dict())
    session.add(update)
    session.commit()
    session.refresh(update)
    return update


@app.delete("/api/updates/{update_id}")
def delete_update(update_id: int, session: Session = Depends(get_session),
                   admin: Admin = Depends(get_current_admin)):
    update = session.get(Update, update_id)
    if not update:
        raise HTTPException(status_code=404, detail="Update not found")
    session.delete(update)
    session.commit()
    return {"ok": True}


# ---------- Events (public read, admin write) ----------

@app.get("/api/events", response_model=List[Event])
def list_events(session: Session = Depends(get_session)):
    events = session.exec(select(Event).order_by(Event.event_date.asc())).all()
    return events


@app.get("/api/events/{event_id}", response_model=Event)
def get_event(event_id: int, session: Session = Depends(get_session)):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@app.post("/api/events", response_model=Event)
def create_event(payload: EventCreate, session: Session = Depends(get_session),
                  admin: Admin = Depends(get_current_admin)):
    event = Event(**payload.dict())
    session.add(event)
    session.commit()
    session.refresh(event)
    return event


@app.patch("/api/events/{event_id}", response_model=Event)
def update_event(event_id: int, payload: EventCreate, session: Session = Depends(get_session),
                  admin: Admin = Depends(get_current_admin)):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    for key, value in payload.dict().items():
        setattr(event, key, value)
    session.add(event)
    session.commit()
    session.refresh(event)
    return event


@app.delete("/api/events/{event_id}")
def delete_event(event_id: int, session: Session = Depends(get_session),
                  admin: Admin = Depends(get_current_admin)):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    session.delete(event)
    session.commit()
    return {"ok": True}


# ---------- Registrations ----------

@app.post("/api/registrations", response_model=Registration)
def create_registration(payload: RegistrationCreate, background_tasks: BackgroundTasks,
                         session: Session = Depends(get_session)):
    event = session.get(Event, payload.event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if not event.is_open:
        raise HTTPException(status_code=400, detail="Registration is closed for this event")
    if event.registration_deadline and datetime.utcnow() > event.registration_deadline:
        raise HTTPException(status_code=400, detail="Registration deadline has passed")

    if event.capacity is not None:
        count = len(session.exec(select(Registration).where(Registration.event_id == event.id)).all())
        if count >= event.capacity:
            raise HTTPException(status_code=400, detail="Event is at full capacity")

    existing = session.exec(
        select(Registration).where(
            Registration.event_id == payload.event_id, Registration.email == payload.email
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="This email is already registered for this event")

    registration = Registration(**payload.dict())
    session.add(registration)
    session.commit()
    session.refresh(registration)

    def _send(reg_id: int, to_email: str, name: str):
        from database import engine
        with Session(engine) as s:
            reg = s.get(Registration, reg_id)
            ev = s.get(Event, reg.event_id)
            sent = send_confirmation_email(
                to_email, name, ev.title, ev.event_date.strftime("%B %d, %Y at %I:%M %p"), ev.location
            )
            reg.confirmation_sent = sent
            s.add(reg)
            s.commit()

    background_tasks.add_task(_send, registration.id, registration.email, registration.full_name)
    return registration


@app.get("/api/events/{event_id}/registrations", response_model=List[Registration])
def list_registrations(event_id: int, session: Session = Depends(get_session),
                        admin: Admin = Depends(get_current_admin)):
    return session.exec(select(Registration).where(Registration.event_id == event_id)).all()


@app.get("/api/events/{event_id}/registrations/export")
def export_registrations(event_id: int, session: Session = Depends(get_session),
                          admin: Admin = Depends(get_current_admin)):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    regs = session.exec(select(Registration).where(Registration.event_id == event_id)).all()

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["Name", "Email", "Phone", "College", "Department", "Year",
                      "Registered At", "Confirmation Sent", "Attended"])
    for r in regs:
        writer.writerow([r.full_name, r.email, r.phone, r.college, r.department, r.year_of_study,
                          r.registered_at, r.confirmation_sent, r.attended])
    buffer.seek(0)
    filename = f"{event.title.replace(' ', '_')}_registrations.csv"
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@app.get("/api/health")
def health():
    return {"status": "ok"}
