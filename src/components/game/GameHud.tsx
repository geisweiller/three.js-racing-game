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
  const heldItem = useGameStore((state) => state.heldItem);
  const itemBoostRemaining = useGameStore((state) => state.itemBoostRemaining);
  const itemPickupVersion = useGameStore((state) => state.itemPickupVersion);
  const itemRouletteRemaining = useGameStore((state) => state.itemRouletteRemaining);
  const itemShieldRemaining = useGameStore((state) => state.itemShieldRemaining);
  const itemUseVersion = useGameStore((state) => state.itemUseVersion);
  const lapCount = useGameStore((state) => state.lapCount);
  const lastLapTime = useGameStore((state) => state.lastLapTime);
  const requestRespawn = useGameStore((state) => state.requestRespawn);
  const selectedVehicleId = useGameStore((state) => state.selectedVehicleId);
  const setGamePhase = useGameStore((state) => state.setGamePhase);
  const selectedVehicle = getVehicleOption(selectedVehicleId);
  const itemBoostActive = itemBoostRemaining > 0;
  const itemShieldActive = itemShieldRemaining > 0;
  const itemRolling = itemRouletteRemaining > 0;
  const itemActive = itemBoostActive || itemShieldActive;
  const readyItemLabel = heldItem === "slime" ? "Gosma" : heldItem === "shield" ? "Escudo" : heldItem === "boost" ? "Boost" : "Vazio";
  const activeItemLabel = itemShieldActive ? "Escudo!" : itemBoostActive ? "Boost!" : readyItemLabel;
  const itemColor =
    itemShieldActive || heldItem === "shield"
      ? "#7dd3fc"
      : heldItem === "slime"
        ? "#91f06d"
        : itemBoostActive || heldItem === "boost"
          ? "#66cfb2"
          : "#f8f3e8";

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
            <strong className="block text-base">Circuito Kart</strong>
            <span className="text-[#f8f3e8]/75">Veiculo: {selectedVehicle.name}</span>
          </HudPanel>
          <HudPanel className="grid w-92 grid-cols-4 gap-3 px-4 py-2.5">
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
            className="pointer-events-auto flex h-9 items-center gap-2 rounded-full bg-[#111418]/80 px-3 text-xs text-[#f8f3e8]/75 shadow-lg backdrop-blur transition hover:bg-[#222832]"
            onClick={returnToMenu}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Keycap>Esc</Keycap>
            <span>Menu</span>
          </motion.button>
          <motion.button
            className="pointer-events-auto flex h-9 items-center gap-2 rounded-full bg-[#111418]/80 px-3 text-xs text-[#f8f3e8]/75 shadow-lg backdrop-blur transition hover:bg-[#222832]"
            onClick={requestRespawn}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Keycap>R</Keycap>
            <span>Respawn</span>
          </motion.button>
          <div className="flex h-9 items-center gap-2 rounded-full bg-[#111418]/80 px-3 text-xs text-[#f8f3e8]/75 shadow-lg backdrop-blur">
            <Keycap>W</Keycap>
            <Keycap>S</Keycap>
            <span>Acel/Freia</span>
            <Keycap>A</Keycap>
            <Keycap>D</Keycap>
            <span>Vira</span>
            <Keycap>Space</Keycap>
            <span>Item</span>
          </div>
        </motion.div>
      </div>

      <div className="absolute left-1/2 top-24 -translate-x-1/2">
        <AnimatePresence>
          {itemPickupVersion > 0 ? (
            <motion.div
              key={`item-${itemPickupVersion}`}
              className="rounded-full border border-[#f6d365]/40 bg-[#111418]/85 px-5 py-2 text-sm font-bold uppercase tracking-wide text-[#f6d365] shadow-xl backdrop-blur"
              initial={{ opacity: 0, scale: 0.82, y: 12 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.82, 1.08, 1, 0.98], y: [12, 0, 0, -10] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.05, times: [0, 0.18, 0.72, 1] }}
            >
              Caixa de item
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
        className="absolute bottom-5 left-1/2 w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#111418]/82 px-4 py-3 shadow-2xl backdrop-blur"
        key={`${itemPickupVersion}-${itemUseVersion}-${itemRolling}`}
        initial={{ y: 12, scale: 0.96, boxShadow: "0 0 0 0 rgb(102 207 178 / 0)" }}
        animate={{
          y: 0,
          scale: itemActive || itemRolling ? 1.04 : 1,
          boxShadow: itemPickupVersion > 0 ? "0 0 32px 0 rgb(102 207 178 / 0.28)" : "0 0 0 0 rgb(102 207 178 / 0)",
        }}
        transition={{ duration: 0.24 }}
      >
        <div className="mb-2 flex items-center justify-between text-xs uppercase text-[#f8f3e8]/55">
          <span>Item</span>
          <Keycap>Space</Keycap>
        </div>
        <div className="relative flex h-12 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/8">
          {itemRolling ? (
            <motion.div
              className="absolute inset-y-0 w-14 bg-[#66cfb2]/20 blur-md"
              animate={{ x: [-110, 110] }}
              transition={{ duration: 0.32, ease: "linear", repeat: Infinity }}
            />
          ) : null}
          <AnimatePresence mode="wait">
            <motion.strong
              key={itemBoostActive ? "boosting" : itemRolling ? "rolling" : heldItem ?? "empty"}
              className="relative text-sm uppercase tracking-wide"
              initial={{ opacity: 0, y: 8, scale: 0.94 }}
              animate={{
                color: itemRolling ? "#f6d365" : itemColor,
                opacity: 1,
                scale: itemActive ? [1, 1.08, 1] : itemRolling ? [0.98, 1.05, 0.98] : 1,
                y: 0,
              }}
              exit={{ opacity: 0, y: -8, scale: 0.94 }}
              transition={{ duration: 0.28, repeat: itemActive || itemRolling ? Infinity : 0 }}
            >
              {itemRolling ? "???" : activeItemLabel}
            </motion.strong>
          </AnimatePresence>
        </div>
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

function Keycap({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-white/15 bg-white/10 px-1.5 text-[0.62rem] font-bold leading-none text-[#f8f3e8] shadow-inner">
      {children}
    </kbd>
  );
}
