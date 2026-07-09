export type VehicleId = "kart" | "formula-1" | "race-car";

export type VehicleOption = {
  id: VehicleId;
  name: string;
  description: string;
  handling: VehicleHandling;
  modelPath: string;
  scale: number;
  previewScale: number;
};

export type VehicleHandling = {
  maxForwardSpeed: number;
  maxReverseSpeed: number;
  acceleration: number;
  reverseAcceleration: number;
  friction: number;
  steerRate: number;
  offroadSpeedMultiplier: number;
  offroadGripMultiplier: number;
};

export const vehicleOptions: VehicleOption[] = [
  {
    id: "kart",
    name: "Kart",
    description: "Leve, agil e facil de virar.",
    handling: {
      maxForwardSpeed: 5.4,
      maxReverseSpeed: -2.4,
      acceleration: 9.5,
      reverseAcceleration: 5.4,
      friction: 7.2,
      steerRate: 4.2,
      offroadSpeedMultiplier: 0.52,
      offroadGripMultiplier: 0.72,
    },
    modelPath: "/game-assets/cars/kart.glb",
    scale: 0.3,
    previewScale: 1.7,
  },
  {
    id: "formula-1",
    name: "Formula 1",
    description: "Mais rapido, exige curvas mais precisas.",
    handling: {
      maxForwardSpeed: 8.4,
      maxReverseSpeed: -2.6,
      acceleration: 11.2,
      reverseAcceleration: 5.2,
      friction: 5.6,
      steerRate: 3.05,
      offroadSpeedMultiplier: 0.42,
      offroadGripMultiplier: 0.54,
    },
    modelPath: "/game-assets/cars/race-future.glb",
    scale: 0.4,
    previewScale: 1.5,
  },
  {
    id: "race-car",
    name: "Carro de corrida",
    description: "Equilibrado, rapido e mais estavel que a F1.",
    handling: {
      maxForwardSpeed: 6.6,
      maxReverseSpeed: -2.2,
      acceleration: 8.2,
      reverseAcceleration: 4.6,
      friction: 5.2,
      steerRate: 2.75,
      offroadSpeedMultiplier: 0.48,
      offroadGripMultiplier: 0.58,
    },
    modelPath: "/game-assets/cars/sedan-sports.glb",
    scale: 0.4,
    previewScale: 1.25,
  },
];

export const defaultVehicle = vehicleOptions[0];

export function getVehicleOption(id: VehicleId) {
  return vehicleOptions.find((vehicle) => vehicle.id === id) ?? defaultVehicle;
}
