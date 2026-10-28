# MediaKit Yisus Contreras

MediaKit web interactivo y de alto impacto visual para **Yisus Contreras** (@yisus_contreras / @yisus_20).

## URL en vivo

> Deployado en Vercel: [https://mediakit-yisus.vercel.app](https://mediakit-yisus.vercel.app)

## Características

- **Preloader cinematográfico** "YISUS" con glow neón animado
- **Hero** con tipografía grande y gradiente lime → naranja
- **Secciones:** Sobre mí, Métricas, Servicios, Marcas, Galería, Contacto
- **Métricas animadas** con contadores que suben al hacer scroll
- **Panel de administración** en `/admin` para editar métricas
- **Formulario de contacto** conectado a API
- **Diseño responsive** mobile-first

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS 3 |
| Animaciones | Framer Motion |
| Fuentes | Inter + Bebas Neue (Google Fonts) |
| Email | Resend API |
| Hosting | Vercel |

## Paleta de Colores: "Neón Caracas"

| Token | Hex | Uso |
|-------|-----|-----|
| Fondo principal | `#0A0A0A` | Background |
| Fondo secundario | `#2A2A2A` | Cards |
| Lima eléctrico | `#C8FF00` | Acentos, neón |
| Naranja quemado | `#FF6B35` | CTAs |
| Texto principal | `#F5F5F0` | Headings |
| Texto secundario | `#A0A0A0` | Body |

## Admin Panel

- URL: `/admin`
- Password: `yisus2026`
- Funcionalidades: editar métricas de Instagram y TikTok

## Scripts

```bash
bun dev      # Desarrollo local
bun run build    # Build de producción
```

## Estructura

```
app/
├── page.tsx              # Landing principal
├── layout.tsx            # Root layout + fuentes
├── globals.css           # Tailwind + custom CSS
├── sections/             # Secciones del site
│   ├── Hero.tsx
│   ├── About.tsx
│   ├── Metrics.tsx
│   ├── Services.tsx
│   ├── Brands.tsx
│   ├── Gallery.tsx
│   └── Contact.tsx
├── components/           # Componentes reutilizables
│   ├── Preloader.tsx
│   ├── Navigation.tsx
│   └── InstagramIcon.tsx
├── api/                  # API Routes
│   ├── contact/route.ts
│   └── metrics/route.ts
└── admin/
    └── page.tsx          # Panel de admin
```

## Creado por

Yisus Contreras · Content Creator · Venezuela 🇻🇪
