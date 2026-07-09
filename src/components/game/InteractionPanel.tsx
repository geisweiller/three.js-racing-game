"use client";

import { motion } from "framer-motion";
import { portfolioSections } from "@/features/portfolio-game/data/portfolioData";
import { useGameStore } from "@/features/portfolio-game/game/useGameStore";

export function InteractionPanel() {
  const openedSectionId = useGameStore((state) => state.openedSectionId);
  const setOpenedSectionId = useGameStore((state) => state.setOpenedSectionId);
  const section = openedSectionId ? portfolioSections[openedSectionId] : null;

  if (!section) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-20 flex items-end justify-center bg-[#111418]/30 p-4 md:items-center">
      <motion.section
        aria-modal="true"
        className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#151a20] p-5 text-[#f8f3e8] shadow-2xl md:p-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.16em] text-[#f6d365]">
              {section.eyebrow}
            </p>
            <h1 className="text-2xl font-bold">{section.title}</h1>
          </div>
          <button
            aria-label="Fechar painel"
            className="rounded-full border border-white/15 px-4 py-1 text-sm text-[#f8f3e8]/80 transition hover:bg-white/10"
            onClick={() => setOpenedSectionId(null)}
          >
            Esc
          </button>
        </div>

        <p className="mb-4 leading-7 text-[#f8f3e8]/82">{section.description}</p>

        <ul className="grid gap-2 sm:grid-cols-2">
          {section.items.map((item) => (
            <li key={item} className="rounded-2xl bg-white/8 px-3 py-2 text-sm">
              {item}
            </li>
          ))}
        </ul>
      </motion.section>
    </div>
  );
}
