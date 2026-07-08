"use client";

import { pointsOfInterest } from "@/features/portfolio-game/data/pointsOfInterest";
import { useGameStore } from "@/features/portfolio-game/game/useGameStore";

export function GameHud() {
  const activePointId = useGameStore((state) => state.activePointId);
  const requestRespawn = useGameStore((state) => state.requestRespawn);
  const setOpenedSectionId = useGameStore((state) => state.setOpenedSectionId);
  const activePoint = pointsOfInterest.find((point) => point.id === activePointId);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 text-sm text-[#f8f3e8] md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-md bg-[#111418]/80 px-4 py-3 shadow-lg backdrop-blur">
          <strong className="block text-base">Arthur Geisweiller</strong>
          <span className="text-[#f8f3e8]/75">Racing portfolio prototype</span>
        </div>
        <div className="flex gap-2">
          <button
            className="pointer-events-auto rounded-md bg-[#111418]/80 px-3 py-2 text-xs text-[#f8f3e8]/75 shadow-lg backdrop-blur transition hover:bg-[#222832]"
            onClick={requestRespawn}
          >
            R respawn
          </button>
          <div className="rounded-md bg-[#111418]/80 px-3 py-2 text-xs text-[#f8f3e8]/75 shadow-lg backdrop-blur">
            W/S acelera/freia · A/D vira
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        {activePoint ? (
          <button
            className="pointer-events-auto rounded-md bg-[#f6d365] px-4 py-3 font-semibold text-[#111418] shadow-lg transition hover:bg-[#ffe08a]"
            onClick={() => setOpenedSectionId(activePoint.id)}
          >
            {activePoint.hint}
          </button>
        ) : (
          <div className="rounded-md bg-[#111418]/70 px-4 py-3 text-[#f8f3e8]/75 shadow-lg backdrop-blur">
            Dirija pela cidade para encontrar secoes do portfolio
          </div>
        )}
      </div>
    </div>
  );
}
