import type { Lang } from "../i18n/dictionary";

type L = Record<Lang, string>;

export type DetailStat = { label: L; value: string };
export type DetailBar = { label: L; value: string; pct: number };
export type MetricDetail = { stats?: DetailStat[]; bars?: DetailBar[]; barsTitle?: L; note?: L };

export type Shot = { src: string; caption: L };

/**
 * Figures transcribed from the analytics screenshots in public/metricas (captured 22 Oct).
 * The headline numbers come from the database (editable in the admin panel); this extra detail is static.
 */
export const PERIOD: Record<string, L> = {
  instagram: { es: "23 sep – 22 oct · 30 días", en: "Sep 23 – Oct 22 · 30 days" },
  tiktok: { es: "25 sep – 22 oct · 28 días", en: "Sep 25 – Oct 22 · 28 days" },
};

export const DETAILS: Record<string, MetricDetail> = {
  "instagram.followers": {
    stats: [
      { label: { es: "Publicaciones", en: "Posts" }, value: "483" },
      { label: { es: "Siguiendo", en: "Following" }, value: "5,659" },
    ],
    note: {
      es: "Perfil de moda y estilo con contenido propio de marcas y colaboraciones.",
      en: "Fashion and style profile with original brand and collaboration content.",
    },
  },
  "instagram.views": {
    barsTitle: { es: "Visualizaciones por tipo de contenido", en: "Views by content type" },
    bars: [
      { label: { es: "Reels", en: "Reels" }, value: "1.2M", pct: 58 },
      { label: { es: "Historias", en: "Stories" }, value: "733K", pct: 36 },
      { label: { es: "Publicaciones", en: "Posts" }, value: "92.5K", pct: 5 },
    ],
    stats: [{ label: { es: "Espectadores", en: "Viewers" }, value: "299,324" }],
  },
  "instagram.new_followers": {
    stats: [
      { label: { es: "Seguidores netos", en: "Net followers" }, value: "+1,610" },
      { label: { es: "Espectadores alcanzados", en: "Viewers reached" }, value: "299,324" },
    ],
  },
  "tiktok.followers": {
    stats: [
      { label: { es: "Me gusta totales", en: "Total likes" }, value: "690.1K" },
      { label: { es: "Siguiendo", en: "Following" }, value: "756" },
    ],
    note: {
      es: "Audiencia principalmente femenina (86%), más activa los jueves de 7 a 8 pm.",
      en: "Mostly female audience (86%), most active on Thursdays from 7 to 8 pm.",
    },
  },
  "tiktok.views": {
    barsTitle: { es: "De dónde llegan las visualizaciones", en: "Where views come from" },
    bars: [
      { label: { es: "Para ti", en: "For You" }, value: "88.8%", pct: 88.8 },
      { label: { es: "Perfil personal", en: "Personal profile" }, value: "8.3%", pct: 8.3 },
      { label: { es: "Búsqueda", en: "Search" }, value: "2.7%", pct: 2.7 },
    ],
    stats: [{ label: { es: "Visitas al perfil", en: "Profile views" }, value: "26.4K (+8.9%)" }],
  },
  "tiktok.likes": {
    stats: [
      { label: { es: "Crecimiento de likes", en: "Likes growth" }, value: "+82.7K (+93.1%)" },
      { label: { es: "Comentarios", en: "Comments" }, value: "2.1K" },
      { label: { es: "Compartidos", en: "Shares" }, value: "3.7K" },
      { label: { es: "Espectadores", en: "Viewers" }, value: "296.2K" },
    ],
  },
};

export const SHOTS: Record<string, Shot[]> = {
  instagram: [
    { src: "/metricas/ig-perfil.jpg", caption: { es: "Perfil de Instagram", en: "Instagram profile" } },
    { src: "/metricas/ig-resumen.jpg", caption: { es: "Resumen · 30 días", en: "Overview · 30 days" } },
    { src: "/metricas/ig-contenido.jpg", caption: { es: "Visualizaciones por tipo de contenido", en: "Views by content type" } },
    { src: "/metricas/ig-destacado.jpg", caption: { es: "Contenido destacado", en: "Top content" } },
  ],
  tiktok: [
    { src: "/metricas/tt-perfil.jpg", caption: { es: "Perfil de TikTok", en: "TikTok profile" } },
    { src: "/metricas/tt-resumen.jpg", caption: { es: "Métricas clave · 28 días", en: "Key metrics · 28 days" } },
    { src: "/metricas/tt-trafico.jpg", caption: { es: "Fuente de tráfico", en: "Traffic source" } },
    { src: "/metricas/tt-espectadores.jpg", caption: { es: "Espectadores", en: "Viewers" } },
    { src: "/metricas/tt-audiencia.jpg", caption: { es: "Sexo y horario de mayor actividad", en: "Gender and peak activity" } },
  ],
};
