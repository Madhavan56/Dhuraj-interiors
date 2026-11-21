# Dhuraj Interiors

One-page marketing site for Dhuraj Interiors, Thanjavur — interior design, modular
kitchens, wardrobes, flooring and custom woodwork.

Built with React 19, Vite 7 and Tailwind CSS 4.

## Running it

```bash
npm install
npm run dev      # local dev server
npm run build    # typecheck (tsc -b) and build to dist/
npm run preview  # serve the built site
```

## Changing the photos

Every photo on the site is listed once, in the `images` map at the top of
`src/data/site.ts`:

| Key           | Where it appears            | File                            |
| ------------- | --------------------------- | ------------------------------- |
| `hero`        | Home hero, social share tag | `public/images/hero.jpg`        |
| `aboutStudio` | About, large portrait image | `public/images/about-studio.png`|
| `courtyard`   | About inset + gallery tile  | `public/images/gallery-courtyard.jpg` |
| `living`      | Gallery — living & lounge   | `public/images/lounge.jpg`      |
| `kitchen`     | Gallery — modular kitchens  | `public/images/gallery-kitchen.jpg` |
| `wardrobe`    | Gallery — wardrobes         | `public/images/gallery-wardrobe.jpg` |
| `flooring`    | Gallery — flooring          | `public/images/living.jpg`      |
| `colour`      | Gallery — colour & material | `public/images/gallery-yellow.jpg` |
| `woodwork`    | Gallery — custom woodwork   | `public/images/craft.jpg`       || `finishes`    | Gallery — finishes      | `public/images/gallery-green.jpg` |
| `ceiling`     | Services — false ceilings | `public/images/service-ceiling.jpg` |
| `netlon`      | Services — mosquito netlon | `public/images/service-netlon.jpg` |

There are two ways to swap a photo, both without touching a component:

1. **Replace the file** in `public/images/`, keeping the same file name. Nothing else
   changes.
2. **Point the key at a new file** — drop the new image into `public/images/` and edit
   its line in `images`, e.g. `kitchen: "/images/my-new-kitchen.jpg"`.

Keep photos landscape (roughly 4:3 or wider) and around 1200–2000px on the long edge;
the gallery crops to fit its tiles, and the hero is full-bleed. Where an image needs
its own alt text or gallery caption, edit that entry in the `gallery` array just below
the map.

The services section also shows one photo per service: each entry in the `services`
array points at a key from the map above plus its own alt text, so a new photo means
adding a key and updating that entry.

`service-ceiling.jpg` (false ceilings) and `service-netlon.jpg` (mosquito netlon) are
Unsplash photos standing in until studio photography for those two services exists —
the Unsplash licence allows commercial use without attribution. Drop the real photos
into `public/images/` and point `images.ceiling` / `images.netlon` at them.

The social-share image (`og:image`) in `index.html` is static HTML, so it still points
at `/images/hero.jpg` directly — replacing that file updates it too.

## Content

All copy — services, process steps, strengths, gallery captions, testimonials,
enquiry types and business details (phone, email, address, hours) — lives in
`src/data/site.ts`.
