// ============================================================================
// EVENTS
// ============================================================================
// This is the only file you need to edit to post a new event.
//
// TO ADD AN EVENT:
//   1. Copy one whole block below, from the opening { to the closing },
//   2. Paste it anywhere inside the "const EVENTS = [ ... ]" list - they
//      sort by date automatically, you don't need to order them.
//   3. Give it a unique "id" (just bump the highest existing id by 1).
//   4. Fill in your own details.
//   5. Save this file and push to GitHub - that's it, no build step.
//
// REGISTRATION (no backend needed - uses Google Forms):
//   1. Create a Google Form for the event (Google Forms -> Blank form).
//   2. Add whatever fields you want to collect (name, email, department...).
//   3. Click Send -> the link icon -> copy the link.
//   4. Paste that link into "registrationUrl" below.
//   5. The event page will embed the form directly on the page. Leave
//      registrationUrl as "" to show "Registration opening soon" instead.
//
// TO REMOVE AN EVENT: delete its whole { ... } block, including the
// comma after it.
//
// FIELDS:
//   id                    - unique number, used in the event's URL
//   title                 - event name
//   tagline               - short line shown on the card, optional ("")
//   description           - full description shown on the event page
//   date                  - "YYYY-MM-DDTHH:mm", 24-hour time, e.g. "14:30" = 2:30 PM
//   location              - e.g. "Seminar Hall, AI & DS Block" or "Online"
//   capacity              - a number, or null for unlimited
//   registrationDeadline  - "YYYY-MM-DDTHH:mm", or "" for no deadline
//   registrationUrl       - your Google Form link, or "" if not open yet
//   isOpen                - false manually closes registration early
//   image                 - path to a photo, e.g. "assets/events/photo1.jpg"
//                           leave as "" for no image
// ============================================================================

const EVENTS = [
  {
    id: 1,
    title: "Design Your Future - Portfolio Creation",
    tagline: "Create a Portfolio that represents You!",
    description: " Personal Portfolio is one of the most valuable assets for students, enabling them to showcase their skills, projects, achievements, and technical journey beyond a traditional resume. Participants are expected to create a digital version of themself to complete the event.",
    date: "2026-07-19T10:00",
    location: "Online",
    capacity: "all students",
    registrationDeadline: "2026-07-17T23:59",
    registrationUrl: "",
    isOpen: true,
    image: "assets/events/portfolio.jpeg",
  },
];
