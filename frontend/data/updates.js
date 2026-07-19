// ============================================================================
// DAILY UPDATES
// ============================================================================
// This is the only file you need to edit to post a new update.
//
// TO ADD AN UPDATE:
//   1. Copy one whole block below, from the opening { to the closing },
//   2. Paste it right after the "const UPDATES = [" line (newest on top
//      doesn't actually matter - pinned items always show first, and the
//      rest sort by date automatically).
//   3. Fill in your own title/body/date.
//   4. Save this file and push to GitHub - that's it, no build step.
//
// TO REMOVE AN UPDATE: delete its whole { ... } block, including the
// comma after it.
//
// FIELDS:
//   title    - short headline
//   body     - the main text. Use \n for a line break if you want one.
//   category - one of: "General", "Workshop", "Achievement", "Announcement"
//   date     - "YYYY-MM-DD", used only for sorting and the displayed date
//   pinned   - true keeps it at the top of the feed regardless of date
//   image    - path to a photo, e.g. "assets/updates/photo1.jpg"
//              (put the actual image file in assets/updates/ first)
//              leave as "" for no image
// ============================================================================

const UPDATES = [
  {
    title: "Welcome to the MLSA Chapter Platform",
    body: "This is the new official home for the Microsoft Learn Student Ambassador chapter at Saranathan College of Engineering. We'll post workshop announcements, certification wins, and general updates here — check back often, or bookmark this page.",
    category: "Announcement",
    date: "2026-07-18",
    pinned: true,
    image: "",
  },
];
