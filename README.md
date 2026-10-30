# Ibn Sina Trust: website concept

Next.js (App Router, JavaScript) + MongoDB native driver + Tailwind CSS.

```bash
npm install
cp .env.example .env.local   # optional: the site runs on seed data without MongoDB
npm run seed                 # loads units, doctors, services into MongoDB
npm run dev
```

Pages linked in the nav (/doctors, /units, /appointment, ...) are next on the build list.
