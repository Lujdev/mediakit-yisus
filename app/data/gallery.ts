export type GalleryCategory = "Outfit" | "Moda" | "Lifestyle" | "Portrait" | "Editorial";

export type GalleryImage = {
  src: string;
  category: GalleryCategory;
  /** CSS object-position used when a card crops the photo (keeps the face in frame). */
  focal: string;
  alt: { es: string; en: string };
};

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: "/images/1.jpeg",
    category: "Outfit",
    focal: "35% 25%",
    alt: {
      es: "Yisus con gorra roja y camiseta amarilla, en cuclillas mirando hacia un lado",
      en: "Yisus in a red cap and yellow tee, crouching and looking to the side",
    },
  },
  {
    src: "/images/5.jpeg",
    category: "Moda",
    focal: "45% 25%",
    alt: {
      es: "Yisus con sombrero negro, chaleco y pantalón de denim claro, apoyado en un muro de ladrillo",
      en: "Yisus in a black hat with a light denim vest and jeans, leaning on a brick wall",
    },
  },
  {
    src: "/images/6.jpeg",
    category: "Lifestyle",
    focal: "55% 22%",
    alt: {
      es: "Yisus con camiseta rosa, short amarillo y calcetas blancas frente a una pared blanca",
      en: "Yisus in a pink tee, yellow shorts and white socks in front of a white wall",
    },
  },
  {
    src: "/images/7.jpeg",
    category: "Outfit",
    focal: "60% 22%",
    alt: {
      es: "Yisus con chaleco verde menta y pantalón blanco, con una mano en el cabello, frente a ladrillo",
      en: "Yisus in a mint-green vest and white trousers, hand in his hair, against a brick wall",
    },
  },
  {
    src: "/images/9.jpeg",
    category: "Lifestyle",
    focal: "50% 25%",
    alt: {
      es: "Yisus con sombrero y camiseta amarilla, flexionando los brazos en plena calle",
      en: "Yisus in a hat and yellow tee flexing both arms in the street",
    },
  },
  {
    src: "/images/_DSC7567 (1).jpg.jpeg",
    category: "Editorial",
    focal: "50% 35%",
    alt: {
      es: "Retrato nocturno de Yisus sentado, con camiseta blanca sin mangas, apoyando la cabeza en la mano",
      en: "Night portrait of Yisus seated in a white sleeveless top, resting his head on his hand",
    },
  },
  {
    src: "/images/IMG_20260903_132153_056.jpg.jpeg",
    category: "Portrait",
    focal: "50% 40%",
    alt: {
      es: "Yisus de frente con camisa de estampado de leopardo entre plantas tropicales de noche",
      en: "Yisus facing the camera in a leopard-print shirt among tropical plants at night",
    },
  },
  {
    src: "/images/IMG_20260903_132153_220.jpg.jpeg",
    category: "Outfit",
    focal: "50% 40%",
    alt: {
      es: "Yisus con camisa de estampado de leopardo, mirando hacia un lado, entre plantas tropicales de noche",
      en: "Yisus in a leopard-print shirt looking to the side among tropical plants at night",
    },
  },
];
