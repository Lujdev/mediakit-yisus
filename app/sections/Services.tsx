"use client";

import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";

const packages = [
  {
    name: "Combo #1",
    price: "$300",
    description: "Reel + TikTok + Ráfaga de 5 Stories",
    features: [
      "1 Reel profesional",
      "1 Video TikTok",
      "5 Stories con diseño",
      "Edición con música tendencia",
      "Entrega en 5 días",
    ],
    popular: true,
  },
  {
    name: "Combo #2",
    price: "$250",
    description: "Carrusel + Ráfaga de 3 Stories",
    features: [
      "1 Carrusel de 5-10 slides",
      "3 Stories con diseño",
      "Copywriting incluido",
      "Diseño alineado a tu marca",
      "Entrega en 5 días",
    ],
    popular: false,
  },
  {
    name: "Combo #3",
    price: "$200",
    description: "TikTok + Ráfaga de 3 Stories",
    features: [
      "1 Video TikTok",
      "3 Stories con diseño",
      "Edición dinámica",
      "Concepto creativo",
      "Entrega en 5 días",
    ],
    popular: false,
  },
];

export default function Services() {
  return (
    <section id="services" className="relative py-24 md:py-32 px-4">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-accent-lime text-sm tracking-[0.3em] uppercase mb-4">
            Servicios
          </p>
          <h2 className="font-display text-5xl md:text-7xl text-text-primary mb-4">
            TARIFAS
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Paquetes base para empezar a trabajar juntos. También armamos
            propuestas personalizadas según tu objetivo.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`relative rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] ${
                pkg.popular
                  ? "bg-gradient-to-b from-accent-orange/20 to-bg-secondary border-2 border-accent-orange"
                  : "glass border border-white/10 hover:border-accent-lime/30"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent-orange text-bg-primary text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                  <Star size={12} fill="currentColor" />
                  MÁS POPULAR
                </div>
              )}

              <h3 className="font-display text-2xl text-text-primary mb-2">
                {pkg.name}
              </h3>
              <p className="text-text-secondary text-sm mb-6">
                {pkg.description}
              </p>

              <div className="font-display text-5xl text-accent-lime mb-8">
                {pkg.price}
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-text-secondary text-sm"
                  >
                    <Check
                      className="text-accent-lime shrink-0 mt-0.5"
                      size={16}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`block w-full text-center py-3 rounded-full font-semibold transition-colors ${
                  pkg.popular
                    ? "bg-accent-orange text-bg-primary hover:bg-accent-lime"
                    : "bg-text-primary/10 text-text-primary hover:bg-accent-lime hover:text-bg-primary"
                }`}
              >
                Solicitar propuesta
              </a>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-text-secondary text-sm mt-8"
        >
          Tarifas referenciales. Consulta propuestas personalizadas para
          campañas mayores.
        </motion.p>
      </div>
    </section>
  );
}
