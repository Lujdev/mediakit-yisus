"use client";

import { motion } from "framer-motion";

const brands = [
  "COVAS",
  "SAMOS",
  "ANCDESIGN",
  "FVPS",
  "ROCKSTAR",
];

export default function Brands() {
  return (
    <section id="brands" className="relative py-24 md:py-32 px-4 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-accent-lime text-sm tracking-[0.3em] uppercase mb-4">
            Confían en mí
          </p>
          <h2 className="font-display text-5xl md:text-7xl text-text-primary mb-4">
            MARCAS
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Colaboraciones que reflejan versatilidad, estilo y resultados.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {brands.map((brand, i) => (
            <motion.div
              key={brand}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass rounded-xl p-6 flex items-center justify-center h-24 hover:border-accent-lime/30 transition-all duration-300 group"
            >
              <span className="font-display text-2xl text-text-secondary group-hover:text-accent-lime transition-colors duration-300 tracking-wider">
                {brand}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
