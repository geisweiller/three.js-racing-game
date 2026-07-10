"use client";

import { Button, Card, Chip } from "@heroui/react";
import { Html } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Suspense } from "react";
import {
  getVehicleVariant,
  vehicleOptions,
  type VehicleOption,
  type VehicleVariantOption,
} from "@/features/racing-game/data/vehicleOptions";
import { useGameStore } from "@/features/racing-game/game/useGameStore";
import { GlbModel } from "@/features/racing-game/scene/GlbModel";

const statMax = {
  acceleration: Math.max(...vehicleOptions.map((vehicle) => vehicle.handling.acceleration)),
  grip: Math.max(...vehicleOptions.map((vehicle) => vehicle.handling.offroadGripMultiplier)),
  speed: Math.max(...vehicleOptions.map((vehicle) => vehicle.handling.maxForwardSpeed)),
  steering: Math.max(...vehicleOptions.map((vehicle) => vehicle.handling.steerRate)),
};

function ModelLoading() {
  return (
    <Html center>
      <div
        aria-label="Carregando modelo"
        className="grid h-10 w-10 place-items-center rounded-full bg-[#111418]/85 shadow-lg backdrop-blur"
        role="status"
      >
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#f8f3e8]/25 border-t-[#f6d365]" />
      </div>
    </Html>
  );
}

function VehiclePreview({ variant, vehicle }: { variant: VehicleVariantOption; vehicle: VehicleOption }) {
  return (
    <Canvas camera={{ position: [0, 2.9, 6.2], fov: 32 }} dpr={[1, 2]}>
      <color attach="background" args={["#202833"]} />
      <ambientLight intensity={1.8} />
      <directionalLight intensity={2.2} position={[3, 5, 4]} />
      <Suspense fallback={<ModelLoading />}>
        <group rotation={[0, -0.55, 0]} position={[0, -0.55, 0]}>
          <GlbModel
            path={variant.modelPath}
            modelScale={variant.previewScale ?? vehicle.previewScale}
          />
        </group>
      </Suspense>
    </Canvas>
  );
}

export function IntroScreen() {
  const selectedVehicleId = useGameStore((state) => state.selectedVehicleId);
  const selectedVehicleVariantId = useGameStore((state) => state.selectedVehicleVariantId);
  const requestRespawn = useGameStore((state) => state.requestRespawn);
  const resetLapTimer = useGameStore((state) => state.resetLapTimer);
  const setGamePhase = useGameStore((state) => state.setGamePhase);
  const setSelectedVehicleId = useGameStore((state) => state.setSelectedVehicleId);
  const setSelectedVehicleVariantId = useGameStore((state) => state.setSelectedVehicleVariantId);
  const selectedVehicle =
    vehicleOptions.find((vehicle) => vehicle.id === selectedVehicleId) ?? vehicleOptions[0];
  const selectedVariant = getVehicleVariant(selectedVehicle, selectedVehicleVariantId);
  const cardIntroVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 10,
    },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.08 + index * 0.08,
        duration: 0.22,
        ease: "easeOut",
      },
    }),
  };

  function startGame() {
    resetLapTimer();
    requestRespawn();
    setGamePhase("playing");
  }

  function selectVehicle(vehicle: VehicleOption) {
    setSelectedVehicleId(vehicle.id);
    setSelectedVehicleVariantId(vehicle.variants[0].id);
  }

  return (
    <main className="min-h-dvh overflow-y-auto bg-[#111418] px-4 py-6 text-[#f8f3e8] md:px-8">
      <section className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-6xl flex-col justify-center gap-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[#f6d365]">
              Circuito Kart
            </p>
            <h1 className="text-4xl font-bold md:text-6xl">Escolha seu kart</h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#f8f3e8]/68 md:text-right">
            Selecione seu kart, compare os atributos e prepare a largada.
          </p>
        </div>

        <div className="grid min-h-104 overflow-hidden rounded-3xl border border-white/10 bg-[#171d24] shadow-2xl md:grid-cols-[1.35fr_0.9fr]">
          <div className="relative min-h-72 border-b border-white/10 md:border-b-0 md:border-r">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${selectedVehicle.id}-${selectedVariant.id}`}
                className="absolute inset-0"
                initial={{ opacity: 0, x: -24, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.98 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
              >
                <VehiclePreview variant={selectedVariant} vehicle={selectedVehicle} />
              </motion.div>
            </AnimatePresence>
            <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-[#f6d365]/35 bg-[#111418]/70 px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#f6d365] backdrop-blur">
              Player 1
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 p-5 md:p-6">
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs uppercase tracking-[0.18em] text-[#f6d365]">
                    Kart selecionado
                  </span>
                  <h2 className="mt-1 text-4xl font-bold">{selectedVehicle.name}</h2>
                </div>
                <Chip
                  className="rounded-full bg-[#f6d365] px-3 py-1 text-[#111418]"
                  size="sm"
                  variant="soft"
                >
                  Pronto
                </Chip>
              </div>
              <p className="text-sm leading-6 text-[#f8f3e8]/68">{selectedVehicle.description}</p>
            </div>

            <div className="space-y-3">
              <StatBar
                label="Velocidade"
                value={selectedVehicle.handling.maxForwardSpeed}
                max={statMax.speed}
              />
              <StatBar
                label="Aceleracao"
                value={selectedVehicle.handling.acceleration}
                max={statMax.acceleration}
              />
              <StatBar
                label="Curva"
                value={selectedVehicle.handling.steerRate}
                max={statMax.steering}
              />
              <StatBar
                label="Aderencia"
                value={selectedVehicle.handling.offroadGripMultiplier}
                max={statMax.grip}
              />
            </div>

            <Button
              className="w-full rounded-full bg-[#f6d365] px-6 py-3 font-semibold text-[#111418] shadow-lg transition hover:bg-[#ffe08a]"
              onClick={startGame}
              size="lg"
              variant="primary"
            >
              Correr com {selectedVehicle.name}
            </Button>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[#f8f3e8]/55">
              Garagem
            </h2>
            <span className="text-xs text-[#f8f3e8]/42">Enter ou clique para escolher</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {vehicleOptions.map((vehicle, index) => {
            const isSelected = vehicle.id === selectedVehicleId;
            const vehicleVariant = vehicle.variants[0];

            return (
              <motion.div
                key={vehicle.id}
                aria-label={`Selecionar ${vehicle.name}`}
                className={`overflow-hidden rounded-3xl text-left shadow-xl transition ${
                  isSelected
                    ? "ring-2 ring-[#f6d365]/45"
                    : "hover:ring-2 hover:ring-white/20"
                  }`}
                onClick={() => selectVehicle(vehicle)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectVehicle(vehicle);
                  }
                }}
                role="button"
                tabIndex={0}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={cardIntroVariants}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`h-full overflow-hidden rounded-2xl border bg-[#171d24] ${
                    isSelected ? "border-[#f6d365]" : "border-white/10"
                  }`}
                >
                  <div className="h-36">
                    <VehiclePreview variant={vehicleVariant} vehicle={vehicle} />
                  </div>
                  <Card.Content className="flex items-center justify-between gap-2 p-3">
                    <div>
                      <h3 className="font-semibold leading-tight">{vehicle.name}</h3>
                      <span className="text-xs text-[#f8f3e8]/50">
                        {isSelected ? "Selecionado" : "Escolher"}
                      </span>
                    </div>
                    <span
                      className="h-5 w-5 rounded-full border border-white/20"
                      style={{ backgroundColor: vehicleVariant.swatch }}
                    />
                  </Card.Content>
                </Card>
              </motion.div>
            );
          })}
          </div>
        </div>
      </section>
    </main>
  );
}

function StatBar({ label, max, value }: { label: string; max: number; value: number }) {
  const percentage = `${Math.min(100, Math.max(0, (value / max) * 100))}%`;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 text-[0.64rem] uppercase text-[#f8f3e8]/52">
        <span>{label}</span>
        <span className="font-semibold text-[#f8f3e8]/75">{Math.round((value / max) * 100)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-[#f6d365]"
          initial={{ width: 0 }}
          animate={{ width: percentage }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
