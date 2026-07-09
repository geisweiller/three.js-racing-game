import type { VehicleTrail } from "../data/vehicleOptions";
import type { Vector3Tuple } from "./vector";

export type RearAxlePoints = {
  left: Vector3Tuple;
  right: Vector3Tuple;
};

export function getRearAxlePoints(
  position: Vector3Tuple,
  heading: number,
  trail: Pick<VehicleTrail, "rearAxleOffset" | "wheelHalfWidth">,
  y = position[1],
): RearAxlePoints {
  const forwardX = Math.sin(heading);
  const forwardZ = Math.cos(heading);
  const rightX = Math.cos(heading);
  const rightZ = -Math.sin(heading);

  // Os GLBs atuais ficam visualmente com a frente oposta ao vetor usado pela
  // simulacao para mover o carro. Por isso a traseira visual fica no sentido do
  // heading de movimento, que e onde as marcas/fumaca devem nascer.
  const rearCenterX = position[0] + forwardX * trail.rearAxleOffset;
  const rearCenterZ = position[2] + forwardZ * trail.rearAxleOffset;

  return {
    left: [
      rearCenterX - rightX * trail.wheelHalfWidth,
      y,
      rearCenterZ - rightZ * trail.wheelHalfWidth,
    ],
    right: [
      rearCenterX + rightX * trail.wheelHalfWidth,
      y,
      rearCenterZ + rightZ * trail.wheelHalfWidth,
    ],
  };
}
