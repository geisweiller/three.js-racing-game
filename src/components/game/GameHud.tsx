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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
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
  const cameraMode = useGameStore((state) => state.cameraMode);
  const setGamePhase = useGameStore((state) => state.setGamePhase);
  const toggleCameraMode = useGameStore((state) => state.toggleCameraMode);
  const selectedVehicle = getVehicleOption(selectedVehicleId);
  const speedKmh = Math.round(Math.abs(playerSpeed) * 18);
  const maxSpeedKmh = Math.ceil((selectedVehicle.handling.maxForwardSpeed * 18 * 1.45) / 10) * 10;

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
            aria-label="Alternar camera"
            className="pointer-events-auto w-32 rounded-full bg-[#111418]/80 px-4 py-2 text-xs text-[#f8f3e8]/75 shadow-lg backdrop-blur transition hover:bg-[#222832]"
            onClick={toggleCameraMode}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            {cameraMode === "top" ? "Camera: Topo" : "Camera: Tras"}
          </motion.button>
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
        className="absolute bottom-28 right-4 md:bottom-5 md:right-5"
        initial={{ opacity: 0, x: 18, y: 8 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.2, duration: 0.25 }}
      >
        <Speedometer maxSpeed={maxSpeedKmh} nitroActive={nitroActive} speed={speedKmh} />
      </motion.div>
    </div>
  );
}

function Speedometer({
  maxSpeed,
  nitroActive,
  speed,
}: {
  maxSpeed: number;
  nitroActive: boolean;
  speed: number;
}) {
  const startAngle = -118;
  const endAngle = 118;
  const angleRange = endAngle - startAngle;
  const centerX = 100;
  const centerY = 112;
  const radius = 72;
  const progress = clamp(speed / maxSpeed, 0, 1);
  const needleAngle = startAngle + progress * angleRange;
  const activeArc = describeArc(centerX, centerY, radius, startAngle, needleAngle);
  const baseArc = describeArc(centerX, centerY, radius, startAngle, endAngle);
  const ticks = Array.from({ length: 9 }, (_, index) => {
    const tickProgress = index / 8;
    const angle = startAngle + tickProgress * angleRange;
    const outer = polarToCartesian(centerX, centerY, radius + 7, angle);
    const inner = polarToCartesian(centerX, centerY, index % 2 === 0 ? radius - 10 : radius - 5, angle);

    return {
      angle,
      inner,
      label: Math.round(maxSpeed * tickProgress),
      outer,
      showLabel: index % 2 === 0,
    };
  });

  return (
    <div className="relative h-44 w-52 rounded-3xl border border-white/10 bg-[#111418]/84 p-2 shadow-2xl backdrop-blur">
      <svg aria-label={`Velocimetro ${speed} km/h`} className="h-full w-full" role="img" viewBox="0 0 200 168">
        <path d={baseArc} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeLinecap="round" strokeWidth="10" />
        <motion.path
          d={activeArc}
          fill="none"
          stroke={nitroActive ? "#66cfb2" : "#f6d365"}
          strokeLinecap="round"
          strokeWidth="10"
          transition={{ duration: 0.16 }}
        />
        {ticks.map((tick) => (
          <g key={tick.angle}>
            <line
              stroke="rgb(248 243 232 / 0.45)"
              strokeLinecap="round"
              strokeWidth={tick.showLabel ? 2 : 1}
              x1={tick.inner.x}
              x2={tick.outer.x}
              y1={tick.inner.y}
              y2={tick.outer.y}
            />
            {tick.showLabel ? (
              <text
                fill="rgb(248 243 232 / 0.52)"
                fontSize="8"
                fontWeight="700"
                textAnchor="middle"
                x={polarToCartesian(centerX, centerY, radius - 26, tick.angle).x}
                y={polarToCartesian(centerX, centerY, radius - 26, tick.angle).y + 3}
              >
                {tick.label}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
      <div className="absolute inset-x-0 bottom-3 text-center">
        <motion.strong
          className="block text-3xl leading-none tabular-nums"
          animate={{
            color: nitroActive ? "#66cfb2" : "#f8f3e8",
            scale: nitroActive ? 1.06 : 1,
          }}
          transition={{ duration: 0.18 }}
        >
          {speed}
        </motion.strong>
        <span className="text-[0.58rem] font-semibold uppercase text-[#f8f3e8]/45">Km/h</span>
      </div>
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
