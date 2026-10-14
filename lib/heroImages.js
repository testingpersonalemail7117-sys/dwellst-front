// HERO IMAGES: this is the only file you need to edit to change the pictures on the home page.
//
// 1. Copy your photos into the  public/hero/  folder.
// 2. Add one line per photo below. Add as many as you like; they change automatically.
//
//    { src: "/hero/room-1.jpg", alt: "A bright furnished room with a window" },
//
//    src       the file name inside public/hero/ (starts with "/hero/"). A full https:// link also works.
//    alt       a short description of the photo, for screen readers (use "" if it is purely decorative)
//    position  optional: which part of the photo stays visible when it is cropped on small screens,
//              for example "center", "top", "center 30%" or "left center". Default is "center".
//
// Tips for good-looking photos:
//   - landscape, at least 1600 x 900 px (1920 x 1080 is ideal)
//   - JPG or WebP, ideally under 500 KB each
//   - keep the subject near the middle, because phones show a narrower crop
//   - avoid text inside the photo (the page puts its own text on top)
//
// While this list is empty, development mode shows empty placeholder slides so you can see the
// carousel working. A live site with no photos shows a plain green background instead.
export const HERO_IMAGES = [
  { src: "/hero/room-1-bedroom.jpg", alt: "A bright furnished room with a window" },
  { src: "/hero/room-2-bedspace.jpg", alt: "A cozy bedspace with a study desk" },
  { src: "/hero/room-3-apartment.jpg", alt: "An apartment living room" },
];

// How long each photo stays on screen, in milliseconds (5000 = 5 seconds)
export const HERO_INTERVAL_MS = 5000;