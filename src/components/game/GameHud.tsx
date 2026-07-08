"use client";

import { getVehicleOption } from "@/features/portfolio-game/data/vehicleOptions";
import { useGameStore } from "@/features/portfolio-game/game/useGameStore";

export function GameHud() {
  const requestRespawn = useGameStore((state) => state.requestRespawn);
  const selectedVehicleId = useGameStore((state) => state.selectedVehicleId);
  const setGamePhase = useGameStore((state) => state.setGamePhase);
  const selectedVehicle = getVehicleOption(selectedVehicleId);

  function returnToMenu() {
    requestRespawn();
    setGamePhase("intro");
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 text-sm text-[#f8f3e8] md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-md bg-[#111418]/80 px-4 py-3 shadow-lg backdrop-blur">
          <strong className="block text-base">Arthur Geisweiller</strong>
          <span className="text-[#f8f3e8]/75">Veiculo: {selectedVehicle.name}</span>
        </div>
        <div className="flex gap-2">
          <button
            className="pointer-events-auto rounded-md bg-[#111418]/80 px-3 py-2 text-xs text-[#f8f3e8]/75 shadow-lg backdrop-blur transition hover:bg-[#222832]"
            onClick={returnToMenu}
          >
            Menu
          </button>
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
        <div className="rounded-md bg-[#111418]/70 px-4 py-3 text-[#f8f3e8]/75 shadow-lg backdrop-blur">
          Dirija pela cidade para testar carro, camera e estradas
        </div>
      </div>
    </div>
  );
}
