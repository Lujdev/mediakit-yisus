"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Shirt, Palmtree, Clapperboard, Briefcase } from "lucide-react";

const pillars = [
  {
    icon: Shirt,
    title: "Moda",
    desc: "Outfits que conectan y looks con personalidad propia.",
  },
  {
    icon: Palmtree,
    title: "Lifestyle",
    desc: "Contenido real, momentos auténticos y vida cotidiana.",
  },
  {
    icon: Clapperboard,
    title: "Storytelling",
    desc: "Historias que se sienten, no solo se ven.",
  },
  {
    icon: Briefcase,
    title: "Marcas",
    desc: "Colaboraciones estratégicas con resultados reales.",
  },
];

export default function About() {
  return (
    <section id="about" className="relative py-24 md:py-32 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="relative aspect-[4/5] rounded-2xl overflow-hidden"
          >
            <Image
              src="/images/1.jpeg"
              alt="Yisus Contreras"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/60 to-transparent" />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-accent-lime text-sm tracking-[0.3em] uppercase mb-4">
              Sobre mí
            </p>
            <h2 className="font-display text-5xl md:text-7xl text-text-primary mb-6">
              CREATIVIDAD
              <br />
              <span className="gradient-text">CON IDENTIDAD</span>
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed mb-6">
              Soy Yisus, creador de contenido y storyteller visual. Mezclo
              estrategia, estilo y autenticidad para transformar ideas en piezas
              que conectan con audiencias y marcas.
            </p>
            <p className="text-text-secondary leading-relaxed mb-10">
              Mi enfoque une moda, lifestyle y creatividad con una mirada fresca,
              visual y comercial. Me interesa que cada contenido se sienta real,
              tenga intención y represente bien a la marca sin perder
              personalidad. Trabajo desde la creatividad, el styling y la
              dirección visual para generar contenido con criterio estético,
              presencia digital y valor para colaboraciones.
            </p>

            {/* Pillars */}
            <div className="grid grid-cols-2 gap-4">
              {pillars.map((pillar, i) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="glass rounded-xl p-4 hover:border-accent-lime/30 transition-colors"
                >
                  <pillar.icon className="text-accent-lime mb-2" size={24} />
                  <h3 className="font-semibold text-text-primary mb-1">
                    {pillar.title}
                  </h3>
                  <p className="text-text-secondary text-sm">{pillar.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
