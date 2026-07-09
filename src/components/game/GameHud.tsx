"use client";

import { AnimatePresence, motion } from "framer-motion";
import { getVehicleOption } from "@/features/racing-game/data/vehicleOptions";
import { useGameStore } from "@/features/racing-game/game/useGameStore";

function formatLapTime(time: number | null) {
  if (time === null) {
    return "--:--.---";
  }

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60).toString().padStart(2, "0");
  const milliseconds = Math.floor((time % 1) * 1000).toString().padStart(3, "0");

  return `${minutes}:${seconds}.${milliseconds}`;
}

export function GameHud() {
  const bestLapTime = useGameStore((state) => state.bestLapTime);
  const currentLapTime = useGameStore((state) => state.currentLapTime);
  const lapCount = useGameStore((state) => state.lapCount);
  const lastLapTime = useGameStore((state) => state.lastLapTime);
  const nitroActive = useGameStore((state) => state.nitroActive);
  const nitroCharge = useGameStore((state) => state.nitroCharge);
  const nitroPickupVersion = useGameStore((state) => state.nitroPickupVersion);
  const playerSpeed = useGameStore((state) => state.playerSpeed);
  const requestRespawn = useGameStore((state) => state.requestRespawn);
  const selectedVehicleId = useGameStore((state) => state.selectedVehicleId);
  const setGamePhase = useGameStore((state) => state.setGamePhase);
  const selectedVehicle = getVehicleOption(selectedVehicleId);
  const speedKmh = Math.round(Math.abs(playerSpeed) * 18);

  function returnToMenu() {
    requestRespawn();
    setGamePhase("intro");
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 text-sm text-[#f8f3e8] md:p-6">
      <div className="flex items-start justify-between gap-3">
        <motion.div
          className="flex flex-wrap gap-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.06,
              },
            },
          }}
        >
          <HudPanel className="px-4 py-3">
            <strong className="block text-base">Circuito Nitro</strong>
            <span className="text-[#f8f3e8]/75">Veiculo: {selectedVehicle.name}</span>
          </HudPanel>
          <HudPanel className="grid w-[23rem] grid-cols-4 gap-3 px-4 py-2.5">
            <div>
              <span className="block text-[0.62rem] uppercase text-[#f8f3e8]/45">Volta</span>
              <motion.strong
                key={lapCount}
                className="block"
                initial={{ color: "#66cfb2", scale: 1.18 }}
                animate={{ color: "#f8f3e8", scale: 1 }}
                transition={{ duration: 0.35 }}
              >
                {lapCount + 1}
              </motion.strong>
            </div>
            <div className="col-span-1">
              <span className="block text-[0.62rem] uppercase text-[#f8f3e8]/45">Tempo</span>
              <strong className="tabular-nums">{formatLapTime(currentLapTime)}</strong>
            </div>
            <div>
              <span className="block text-[0.62rem] uppercase text-[#f8f3e8]/45">Ultima</span>
              <motion.strong
                key={lastLapTime ?? "empty-last"}
                className="block tabular-nums"
                initial={lastLapTime ? { color: "#f6d365", y: -2 } : false}
                animate={{ color: "#f8f3e8", y: 0 }}
                transition={{ duration: 0.35 }}
              >
                {formatLapTime(lastLapTime)}
              </motion.strong>
            </div>
            <div>
              <span className="block text-[0.62rem] uppercase text-[#f8f3e8]/45">Melhor</span>
              <motion.strong
                key={bestLapTime ?? "empty-best"}
                className="block tabular-nums"
                initial={bestLapTime ? { color: "#66cfb2", y: -2 } : false}
                animate={{ color: "#f8f3e8", y: 0 }}
                transition={{ duration: 0.35 }}
              >
                {formatLapTime(bestLapTime)}
              </motion.strong>
            </div>
          </HudPanel>
        </motion.div>
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.25 }}
        >
          <motion.button
            className="pointer-events-auto rounded-full bg-[#111418]/80 px-4 py-2 text-xs text-[#f8f3e8]/75 shadow-lg backdrop-blur transition hover:bg-[#222832]"
            onClick={returnToMenu}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            Esc - Menu
          </motion.button>
          <motion.button
            className="pointer-events-auto rounded-full bg-[#111418]/80 px-4 py-2 text-xs text-[#f8f3e8]/75 shadow-lg backdrop-blur transition hover:bg-[#222832]"
            onClick={requestRespawn}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            R - Respawn
          </motion.button>
          <div className="rounded-full bg-[#111418]/80 px-4 py-2 text-xs text-[#f8f3e8]/75 shadow-lg backdrop-blur">
            W/S - Acelera/Freia · A/D - Vira · Espaço - Nitro
          </div>
        </motion.div>
      </div>

      <div className="absolute left-1/2 top-24 -translate-x-1/2">
        <AnimatePresence>
          {nitroPickupVersion > 0 ? (
            <motion.div
              key={`nitro-${nitroPickupVersion}`}
              className="rounded-full border border-[#66cfb2]/40 bg-[#111418]/85 px-5 py-2 text-sm font-bold uppercase tracking-wide text-[#66cfb2] shadow-xl backdrop-blur"
              initial={{ opacity: 0, scale: 0.82, y: 12 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.82, 1.08, 1, 0.98], y: [12, 0, 0, -10] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.05, times: [0, 0.18, 0.72, 1] }}
            >
              Nitro +25%
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="absolute left-1/2 top-40 -translate-x-1/2">
        <AnimatePresence>
          {lapCount > 0 ? (
            <motion.div
              key={`lap-${lapCount}`}
              className="rounded-2xl border border-[#f6d365]/40 bg-[#111418]/85 px-6 py-3 text-center shadow-xl backdrop-blur"
              initial={{ opacity: 0, scale: 0.88, y: 16 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.88, 1.04, 1, 0.98], y: [16, 0, 0, -12] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.3, times: [0, 0.16, 0.76, 1] }}
            >
              <span className="block text-[0.64rem] font-semibold uppercase text-[#f6d365]">
                Volta completa
              </span>
              <strong className="tabular-nums">{formatLapTime(lastLapTime)}</strong>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <motion.div
        className="absolute bottom-5 left-1/2 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#111418]/82 px-4 py-3 shadow-2xl backdrop-blur"
        key={nitroPickupVersion}
        initial={{ y: 18, scale: 0.96, boxShadow: "0 0 0 0 rgb(102 207 178 / 0)" }}
        animate={{
          y: 0,
          scale: 1,
          boxShadow:
            nitroPickupVersion > 0
              ? "0 0 32px 0 rgb(102 207 178 / 0.36)"
              : "0 0 0 0 rgb(102 207 178 / 0)",
        }}
        transition={{ duration: 0.28 }}
      >
        <div className="mb-2 flex items-center justify-between text-xs uppercase text-[#f8f3e8]/55">
          <span>Nitro</span>
          <motion.strong
            className="text-[#f8f3e8]"
            animate={{ color: nitroActive ? "#66cfb2" : "#f8f3e8" }}
          >
            {Math.round(nitroCharge)}%
          </motion.strong>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="relative h-full rounded-full bg-[#66cfb2]"
            initial={false}
            animate={{
              width: `${nitroCharge}%`,
              boxShadow: nitroActive
                ? "0 0 20px 3px rgb(102 207 178 / 0.65)"
                : "0 0 0 0 rgb(102 207 178 / 0)",
            }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
          >
            <motion.span
              className="absolute inset-y-0 right-0 w-10 bg-white/35 blur-sm"
              animate={{ opacity: nitroActive ? [0.25, 0.85, 0.25] : 0 }}
              transition={{ duration: 0.65, repeat: nitroActive ? Infinity : 0 }}
            />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-5 right-5 min-w-32 rounded-3xl border border-white/10 bg-[#111418]/82 px-5 py-4 text-right shadow-2xl backdrop-blur"
        initial={{ opacity: 0, x: 18, y: 8 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.2, duration: 0.25 }}
      >
        <span className="block text-[0.62rem] uppercase text-[#f8f3e8]/45">Km/h</span>
        <motion.strong
          className="block text-4xl leading-none tabular-nums"
          animate={{
            color: nitroActive ? "#66cfb2" : "#f8f3e8",
            scale: nitroActive ? 1.08 : 1,
          }}
          transition={{ duration: 0.18 }}
        >
          {speedKmh}
        </motion.strong>
      </motion.div>
    </div>
  );
}

function HudPanel({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <motion.div
      className={`rounded-2xl border border-white/10 bg-[#111418]/80 shadow-lg backdrop-blur ${className}`}
      variants={{
        hidden: { opacity: 0, y: -10, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1 },
      }}
      transition={{ duration: 0.24 }}
    >
      {children}
    </motion.div>
  );
}
