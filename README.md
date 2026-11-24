# Dhuraj Interiors

One-page marketing site for Dhuraj Interiors, Thanjavur — interior design, modular
kitchens, wardrobes, flooring and custom woodwork.

Built with React 19, Vite 7, Tailwind CSS 4, Express 5 and SQLite (via
`node:sqlite`).

## Running it

```bash
npm install
npm run dev      # API on :4000 plus the Vite site on :5173
npm run build    # typecheck (tsc -b) and build to dist/
npm start        # serve the built site and API together on :4000
npm test         # end-to-end projects workflow test
```

The projects gallery reads from the API, so during development run `npm run dev`
(or `npm start`) rather than `vite` alone. Vite proxies `/api` and `/uploads` to
the API server.

Configuration lives in `.env` (copy `.env.example`). `ADMIN_EMAIL` and
`ADMIN_PASSWORD` create or update the admin account on startup; `DATA_DIR`
(default `data`) holds `dhuraj.sqlite` and uploaded project photos.

## Projects gallery & admin dashboard

`/#projects` on the website is driven entirely by the database — nothing in the
component is hardcoded. Visitors can filter published projects by category, open
a project to read its full description and browse the gallery images, and start a
WhatsApp enquiry about a similar design.

Sign in at `/admin` to manage everything:

- Add a project with a main image, optional gallery images, category, short and
  full descriptions, status, display order and a featured flag.
- Search, filter and paginate the project table; edit, preview, publish or
  unpublish, and delete projects (with confirmation).
- Set the WhatsApp number used by the enquiry buttons on project pages.

Only published projects are served by the public API. Images are re-encoded to
WebP, resized to at most 2000px and stored under `data/uploads/projects/`;
replaced or deleted projects clean up their files. Uploads accept JPG, PNG and
WebP up to 10 MB.

API routes: public `GET /api/projects`, `/api/projects/featured`,
`/api/projects/:slug`, `/api/project-categories`, `/api/settings`; admin (cookie
auth) `/api/admin/projects` with create, update, status, delete and
`/api/admin/settings`.

## Changing the photos

This section covers the static site imagery (hero, about, gallery, services).
Project photographs are managed in the admin dashboard instead — see above.

Every static photo on the site is listed once, in the `images` map at the top of
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

## The enquiry form

Form submissions are emailed through [Web3Forms](https://web3forms.com) — no mail
server is needed. The access key lives in `src/data/site.ts` as `web3formsAccessKey`, and
enquiries land in the inbox that key was created for.

Web3Forms keys are public, client-side keys by design. In the Web3Forms dashboard,
restrict the key to the site's domain so nobody else can post enquiries with it. To
send enquiries somewhere else, create a key for the new inbox and replace the value
in `src/data/site.ts`.

The "Send on WhatsApp" button is separate: it opens WhatsApp with the same details
for people who would rather chat.

## Content

All copy — services, process steps, strengths, gallery captions, testimonials,
enquiry types and business details (phone, email, address, hours) — lives in
`src/data/site.ts`.
