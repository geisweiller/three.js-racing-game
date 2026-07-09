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
  const selectedVehicle = vehicleOptions.find((vehicle) => vehicle.id === selectedVehicleId);
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

  return (
    <main className="min-h-dvh overflow-y-auto bg-[#111418] px-4 py-6 text-[#f8f3e8] md:px-8">
      <section className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-6xl flex-col justify-center gap-6">
        <div className="max-w-2xl">
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[#f6d365]">
            Racing game prototype
          </p>
          <h1 className="text-4xl font-bold md:text-6xl">Escolha seu carro</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#f8f3e8]/75">
            Escolha um veiculo, pegue caixas de nitro e tente melhorar seu tempo de volta no circuito.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {vehicleOptions.map((vehicle, index) => {
            const isSelected = vehicle.id === selectedVehicleId;
            const selectedVariant = getVehicleVariant(vehicle, selectedVehicleVariantId);

            return (
              <motion.div
                key={vehicle.id}
                aria-label={`Selecionar ${vehicle.name}`}
                className={`overflow-hidden rounded-3xl text-left shadow-xl transition ${
                  isSelected
                    ? "ring-2 ring-[#f6d365]/45"
                    : "hover:ring-2 hover:ring-white/20"
                  }`}
                onClick={() => {
                  setSelectedVehicleId(vehicle.id);
                  setSelectedVehicleVariantId(selectedVariant.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedVehicleId(vehicle.id);
                    setSelectedVehicleVariantId(selectedVariant.id);
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
                  className={`h-full overflow-hidden rounded-3xl border bg-[#171d24] ${
                    isSelected ? "border-[#f6d365]" : "border-white/10"
                  }`}
                >
                  <div className="h-64 md:h-72">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={`${vehicle.id}-${selectedVariant.id}`}
                        className="h-full"
                        initial={{ opacity: 0, rotate: -1.2, scale: 0.96, x: -18 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1, x: 0 }}
                        exit={{ opacity: 0, rotate: 1.2, scale: 0.98, x: 18 }}
                        transition={{ duration: 0.24, ease: "easeOut" }}
                      >
                        <VehiclePreview variant={selectedVariant} vehicle={vehicle} />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <Card.Content className="p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h2 className="text-xl font-semibold">{vehicle.name}</h2>
                      <Chip
                        className={
                          isSelected
                            ? "rounded-full bg-[#f6d365] px-3 py-1 text-[#111418]"
                            : "rounded-full bg-white/10 px-3 py-1 text-[#f8f3e8]/70"
                        }
                        size="sm"
                        variant="soft"
                      >
                        {isSelected ? "Selecionado" : "Escolher"}
                      </Chip>
                    </div>
                    <p className="min-h-12 text-sm leading-6 text-[#f8f3e8]/68">
                      {vehicle.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-xs text-[#f8f3e8]/55">Modelo</span>
                      <div className="flex gap-2">
                        {vehicle.variants.map((variant) => {
                          const variantIsSelected = selectedVariant.id === variant.id;

                          return (
                            <button
                              key={variant.id}
                              aria-label={`Selecionar modelo ${variant.name} para ${vehicle.name}`}
                              className={`h-7 w-7 rounded-full border transition ${
                                variantIsSelected
                                  ? "border-[#f6d365] ring-2 ring-[#f6d365]/45"
                                  : "border-white/25 hover:border-white/60"
                              }`}
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedVehicleId(vehicle.id);
                                setSelectedVehicleVariantId(variant.id);
                              }}
                              style={{ backgroundColor: variant.swatch }}
                              title={variant.name}
                              type="button"
                            />
                          );
                        })}
                      </div>
                    </div>
                    <dl className="mt-4 grid grid-cols-3 gap-2 text-xs text-[#f8f3e8]/62">
                      <div>
                        <dt>Vel.</dt>
                        <dd className="font-semibold text-[#f8f3e8]">
                          {vehicle.handling.maxForwardSpeed.toFixed(1)}
                        </dd>
                      </div>
                      <div>
                        <dt>Curva</dt>
                        <dd className="font-semibold text-[#f8f3e8]">
                          {vehicle.handling.steerRate.toFixed(1)}
                        </dd>
                      </div>
                      <div>
                        <dt>Acel.</dt>
                        <dd className="font-semibold text-[#f8f3e8]">
                          {vehicle.handling.acceleration.toFixed(1)}
                        </dd>
                      </div>
                    </dl>
                  </Card.Content>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            className="w-64 rounded-full bg-[#f6d365] px-6 py-3 font-semibold text-[#111418] shadow-lg transition hover:bg-[#ffe08a]"
            onClick={startGame}
            size="lg"
            variant="primary"
          >
            Jogar com {selectedVehicle?.name}
          </Button>
        </div>
      </section>
    </main>
  );
}
