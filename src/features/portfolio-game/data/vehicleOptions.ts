export type VehicleId = "kart" | "formula-1" | "ambulance";

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
    scale: 0.72,
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
    modelPath: "/game-assets/cars/formula-1.glb",
    scale: 0.78,
    previewScale: 1.5,
  },
  {
    id: "ambulance",
    name: "Ambulancia",
    description: "Mais lenta, pesada e estavel.",
    handling: {
      maxForwardSpeed: 4.2,
      maxReverseSpeed: -1.8,
      acceleration: 5.4,
      reverseAcceleration: 3.6,
      friction: 4.4,
      steerRate: 2.2,
      offroadSpeedMultiplier: 0.46,
      offroadGripMultiplier: 0.48,
    },
    modelPath: "/game-assets/cars/ambulance.glb",
    scale: 0.82,
    previewScale: 1.25,
  },
];

export const defaultVehicle = vehicleOptions[0];

export function getVehicleOption(id: VehicleId) {
  return vehicleOptions.find((vehicle) => vehicle.id === id) ?? defaultVehicle;
}
