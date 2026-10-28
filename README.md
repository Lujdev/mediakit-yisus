# MediaKit Yisus Contreras

MediaKit web interactivo y de alto impacto visual para **Yisus Contreras** (@yisus_contreras / @yisus_20).

## URL en vivo

> Deployado en Vercel: [https://yisuscontreras.vercel.app](https://yisuscontreras.vercel.app)

## Características

- **Preloader cinematográfico** "YISUS" con glow neón animado
- **Hero** con tipografía grande y gradiente lime → naranja
- **Secciones:** Sobre mí, Métricas, Servicios, Marcas, Galería, Contacto
- **Métricas animadas** con contadores que suben al hacer scroll
- **Panel de administración** (ruta secreta, ver abajo) para editar métricas
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

- URL: `/<ADMIN_PATH>`. La ruta se define con la variable de entorno `ADMIN_PATH` (por defecto `yc-studio`); `/admin` devuelve 404. Es oscuridad adicional: la protección real es la sesión del servidor.
- Auth: contraseña definida en la variable de entorno `ADMIN_PASSWORD` (sesión en cookie httpOnly firmada, 7 días). En producción, sin esa variable el login queda bloqueado. En local, sin variable, se usa una contraseña de desarrollo.
- Opcional: `ADMIN_SESSION_SECRET` para firmar la sesión con un secreto distinto.
- Pestañas: Métricas, Visitas, Marcas (logos), Tarifas (ES/EN), Videos, Redes, Mensajes.
- Visitas: guarda IP, ubicación aproximada (país y ciudad, la resuelve Vercel a partir de la IP, sin servicios de terceros), dispositivo, navegador, idioma y origen **30 días** (se borran solas: al arrancar, en cada visita con baja probabilidad, al abrir la pestaña y con un cron diario en `vercel.json`). No cuenta bots, recargas repetidas (30 min) ni los dispositivos donde inicias sesión en el admin.
- Logos: al subir una imagen con fondo blanco, el fondo se elimina automáticamente (`lib/logo.ts`). El sitio los muestra en blanco.
- Videos: enlaces de YouTube (se reproducen en el sitio), TikTok/Instagram (abren en su app) o `.mp4` directo. Sin videos, la sección no aparece.
- Contenido editable (marcas, tarifas, redes, videos) vive en la base de datos (Turso en producción) y se siembra con valores por defecto la primera vez.

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
