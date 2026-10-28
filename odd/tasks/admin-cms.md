# Admin CMS: brands, rates, socials, videos
Branch: main (user-owned) · Delivery: ask-on-risk · Runner: tsc + bun run build + manual API probes

## Specs
S1. "Cuales son las credenciales del admin?" — answer; admin auth must be server-side (password was hardcoded client-side, write APIs unauthenticated).
S2. "agregues los logos de las marcas que tengo en public" — HERO, COVAS, ROCKSTAR, SAMOS present; ANCDESIGN and FVPS have no file. "Algunas tienen fondo ... lo puedes hacer" — remove white backgrounds.
S3. "desde el admin poder agregar mas marcas/logos"
S4. "editar los precios"
S5. "cambiar las url de mis redes sociales"
S6. "agregar o quitar videos"
S7. Site stays ES/EN; admin-managed content is bilingual where it has text.

## Tasks
- [x] T1 auth (S1) · inline · high-risk item 2 (security)
- [x] T2 schema + public/admin APIs (S3-S6) · inline
- [x] T3 logo processing + seed brands (S2) · inline
- [x] T4 site consumes DB content (S2-S6) · inline
- [x] T5 admin UI panels (S3-S6) · inline

## Log
L1 (2026-10-28): "1. Cuales son las credenciales del admin? Adicionalmente necesito que agregues los logos de las marcas que tengo en public y no se si ArcDesign esta ahí tambien. Algunas tienen fondo no se si es conveniente quitarlos y lo puedes hacer. 2. Adicionalmente creo que deberiamos desde el admin poder agregar mas marcas/logos asi como editar los precios, cambiar las url de mis redes sociales o agregar o quitar videos."

L2: verified — unauth writes return 401; login/logout; brand upload strips white bg (463x171 PNG); bad URLs rejected; admin saves video -> public site shows section + nav link; mobile 390px no horizontal overflow.
