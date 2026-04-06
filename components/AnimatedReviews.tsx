"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Alex Chen",
    role: "Software Engineer",
    image: "/alex_ai.png",
    review: "PrepEdge changed the game for me. The AI feedback on my body language and tone was spot on. Highly recommended for any dev!",
  },
  {
    id: 2,
    name: "Sara Miller",
    role: "Product Lead",
    image: "/sara_pm.png",
    review: "I was nervous about my PM interviews, but after 5 sessions here, I felt unstoppable. The role-specific questions are realistic.",
  },
  {
    id: 3,
    name: "Liam Johnson",
    role: "Data Scientist",
    image: "/liam_data.png",
    review: "The best part is the instant analytics. Seeing my score trend upwards gave me the confidence I needed to land my dream job.",
  },
];

const AnimatedReviews = () => {
  return (
    <section className="py-24 px-6 relative overflow-hidden bg-[var(--surface-base)]">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            Success Stories
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-4"
          >
            What Our <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Power Users</span> Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto font-medium"
          >
            Join thousands of professionals who have mastered their interviews with PrepEdge.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative bg-[var(--surface-card)] border border-[var(--border-subtle)] p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300"
            >
              {/* Character Image container */}
              <div className="relative mb-6 flex justify-center">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 2 }}
                  className="relative w-32 h-32 rounded-3xl overflow-hidden border-2 border-white/10 shadow-lg"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              </div>

              {/* Content */}
              <div className="text-center">
                <div className="flex justify-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" />
                    </motion.div>
                  ))}
                </div>

                <p className="text-[var(--text-primary)] italic font-medium leading-relaxed mb-6 px-2">
                  "{item.review}"
                </p>

                <div className="pt-4 border-t border-[var(--border-subtle)]">
                  <h4 className="text-lg font-bold text-[var(--text-primary)]">
                    {item.name}
                  </h4>
                  <p className="text-sm font-bold text-blue-500 uppercase tracking-wider">
                    {item.role}
                  </p>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-4 right-6 text-6xl font-serif text-blue-400/5 select-none font-bold">
                "
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnimatedReviews;
