# Omegason Energy website

React + Vite + Tailwind CSS v4 + Framer Motion + React Router.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
```

The catalogue admin at `/auth/admin` calls the API in `C:\omegason-api`. Start that as well (see that folder's README). The site reads the address from `VITE_API_URL` in `.env`. Locally:

```
VITE_API_URL=http://localhost:5050
```

On Netlify, set `VITE_API_URL` to the public API URL before the build. Vite bakes that value into the site, so change it and rebuild when the API address changes.

## Deploy on Netlify

1. Push this folder to GitHub and import the repo in Netlify (build settings are read from `netlify.toml`),
   or drag the `dist` folder after `npm run build`.
2. Reloading `/products` or opening a shared `/products/some-slug` link works because
   `netlify.toml` and `public/_redirects` send every unknown path to `index.html`.
3. The contact form uses Netlify Forms. It is detected from the hidden form in `index.html`.
   After the first deploy, submissions appear under Forms in the Netlify dashboard.
   It does not work on the local dev server.

## Add or edit products

Open `src/data/products.js`, copy an object, give it a unique `slug`, save. The Products page,
detail page (`/products/<slug>`), home page highlights, search and filters update automatically.

- Real photos: put images in `public/products/` and set `image: "/products/panel.jpg"`.
  With `image: null`, a built-in illustration is used.
- Prices: set `price: 185000` to show a naira price, or `null` for "Request a quote".
- The six listings are samples and carry a "Sample listing" tag. Delete `sample: true` from each real one.
- To use a database later (Supabase, an API, a CMS), change the two fetch functions in `src/lib/api.js`.

## Edit company content

`src/data/site.js` holds phone numbers, offices, services, values, Phase One stories and the chairman profile.
Fill in `email` and the `social` URLs there and they appear automatically.

## Structure

```
src/
  components/  Hero (scroll-driven sun), Navbar, Footer, ProductCard, ProductArt, ...
  pages/       Home, About, Services, Products, ProductDetail, Projects, Contact, NotFound
  data/        site.js, products.js
  lib/api.js   product data access (swap for a backend here)
```
