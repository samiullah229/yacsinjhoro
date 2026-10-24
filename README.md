# Youth Action Committee — Sinjhoro Website

A multi-page, responsive website for Youth Action Committee (YAC) Sinjhoro, built with plain HTML, CSS and vanilla JavaScript (no frameworks or build step required).

## Structure

```
YAC-Sinjhoro/
├── index.html      Homepage — welcome intro, hero, moments carousel, values,
│                     impact counters, road safety, CTA
├── about.html        Mission, vision, principles, timeline
├── leadership.html    Leadership grid (data-driven, see below)
├── events.html         7 events, each with an 8-photo gallery + lightbox
├── gallery.html          Filterable masonry gallery with lightbox
├── join.html              "Why join" + "Become a Part of Our Journey" form
├── contact.html            Contact cards + map placeholder
├── css/style.css            Shared stylesheet (all design tokens at the top)
├── js/main.js                 Shared behaviour: navbar, ticker, mobile menu,
│                               scroll reveal, counters, welcome intro,
│                               moments carousel, join popup, event/gallery
│                               lightboxes, form
├── images/
│   ├── logo.png                  Official YAC Sinjhoro logo
│   ├── members/                   Add leadership photos here
│   ├── events/                     Add event photos here (7 events × 8 photos)
│   └── gallery/                     Add gallery photos here
└── README.md
```

Open `index.html` in any browser to view the site — no server or build step is required.

## Recent additions

- **Announcement ticker** — a slow-scrolling strip below the navbar on every page (pauses on hover, freezes for reduced motion).
- **Full-screen hero carousel** — the homepage hero is now a full-viewport auto-advancing image carousel with an overlaid heading, supporting detail, an inspirational quote, and calls to action.
- **About page logo reveal** — the animated "logo emerges" moment now lives permanently in the About page's "Who We Are" section (plays once when scrolled into view, not as a one-time overlay).
- **About page focus-area carousel** — a 3-slide carousel at the end of About, styled like a featured campaign section, cycling through Road Safety, Youth Empowerment, and Community Service.
- **Per-event photo galleries** — `events.html` has 7 events, each with 8 photo thumbnails. Clicking any thumbnail opens a fullscreen lightbox scoped to that event's own photos (next/previous/keyboard supported).
- **Leadership page** — `members.html` was renamed to `leadership.html`; the "Members" nav label and links now read "Leadership" everywhere.
- **Navbar simplified & polished** — the "Join Us" button was removed from the navbar (the "Join Us" page link remains in the main menu); smoother blur/shadow transitions and a gold accent line on scroll.
- **Join popup removed** — the "Be Part of the Change" popup and all its code (HTML, CSS, JS) have been removed site-wide.
- **Restyled Join form section** — heading changed to "Become a Part of Our Journey", centered, with a gold divider accent.
- **Generic carousel engine** — one shared carousel component (`.carousel-generic` in `js/main.js`) now powers both the homepage hero and the About page's focus-area slider.

## IMPORTANT — content still needed

**Member names and designations:** The 10 leadership cards on `leadership.html` are currently placeholders ("Name to be confirmed" / "Designation to be confirmed"). The source poster/photos provided did not contain clearly legible, individually labeled names and roles for each of the 10 members, so no names were invented. Edit the `members` array near the bottom of `leadership.html` with verified names and designations, and add each member's photo to `images/members/`.

**Photos:** Every image on the site is currently a styled placeholder (a gradient block with an icon and caption), not a real photograph, per the "do not use unverified images" requirement. Replace these by adding real image files to the `images/` folders and swapping the `.image-placeholder` `<div>` for an `<img>` tag — each placeholder has an HTML comment directly above it noting what to replace.

**Contact details:** Phone, email and social media links are placeholders ("To be added"). Update them in `contact.html` and in the footer of every page once official details are available.

**Form backend:** The membership form on `join.html` is not connected to any backend. It currently shows an on-page confirmation message only. Connect it to Google Forms, Formspree, a PHP endpoint, or another service — see the `BACKEND PLACEHOLDER` comment above the `<form>` tag.

**Google Map:** `contact.html` has a placeholder where an embedded Google Map should go once the official YAC Sinjhoro location/address is confirmed.

## Customizing

- **Colors, fonts, spacing:** all defined as CSS custom properties at the top of `css/style.css` under `:root`.
- **Navigation links / footer:** repeated at the top and bottom of every page — update in each file, or convert to includes if you introduce a build step later.
- **Join popup:** appears once per visitor (after a short delay) and remembers via `localStorage` that it has been dismissed, so it won't repeat on every page load.
