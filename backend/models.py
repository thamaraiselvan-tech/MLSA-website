from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class Admin(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    name: str = "MLSA Admin"


class Update(SQLModel, table=True):
    """A daily update / announcement post."""
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    body: str
    category: str = "General"  # General, Workshop, Achievement, Announcement
    created_at: datetime = Field(default_factory=datetime.utcnow)
    pinned: bool = False
    image_url: Optional[str] = None


class Event(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    location: str = "Online"
    event_date: datetime
    registration_deadline: Optional[datetime] = None
    capacity: Optional[int] = None  # None = unlimited
    banner_note: str = ""  # short tagline shown on card
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_open: bool = True
    image_url: Optional[str] = None


class Registration(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    event_id: int = Field(foreign_key="event.id")
    full_name: str
    email: str
    phone: Optional[str] = None
    college: Optional[str] = None
    department: Optional[str] = None
    year_of_study: Optional[str] = None
    registered_at: datetime = Field(default_factory=datetime.utcnow)
    confirmation_sent: bool = False
    attended: bool = False
