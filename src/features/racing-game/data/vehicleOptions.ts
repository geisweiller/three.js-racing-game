export type VehicleId = "kart" | "formula-1" | "race-car";

export type VehicleVariantId = string;

export type VehicleVariantOption = {
  id: VehicleVariantId;
  modelPath: string;
  name: string;
  previewScale?: number;
  scale?: number;
  swatch: string;
  wheelOutset?: number;
};

export type VehicleOption = {
  // Identificador usado pelo estado global e pela tela de selecao.
  id: VehicleId;
  // Nome exibido no card e HUD.
  name: string;
  // Texto curto do card explicando a sensacao do veiculo.
  description: string;
  // Parametros da simulacao: velocidade, aceleracao, freio natural e direcao.
  handling: VehicleHandling;
  // Caminho publico do GLB carregado pelo useGLTF.
  modelPath: string;
  // Variantes visuais reais. Cada swatch troca o GLB usado no jogo e no preview.
  variants: VehicleVariantOption[];
  // Tamanho do modelo dentro da cena jogavel.
  scale: number;
  // Tamanho do modelo na tela de selecao; separado porque a camera do card e diferente.
  previewScale: number;
  // Ajuste visual lateral das rodas no GLB, usado quando o modelo clipa com a carroceria.
  wheelOutset?: number;
  // Ajustes visuais das marcas de pneu para alinhar com as rodas traseiras do modelo.
  trail: VehicleTrail;
};

export type VehicleHandling = {
  // Velocidade maxima andando para frente, em unidades do mundo por segundo.
  // Aumentar deixa o carro mais rapido em retas e tambem aumenta a velocidade exigida nas curvas.
  maxForwardSpeed: number;
  // Velocidade maxima de re. Fica negativa porque andar de re move contra a frente do carro.
  maxReverseSpeed: number;
  // Quanta rapidez o carro busca a velocidade maxima ao acelerar.
  // Maior = arranca mais forte; menor = carro mais pesado/lento para responder.
  acceleration: number;
  // Quanta rapidez o carro busca a velocidade maxima de re.
  reverseAcceleration: number;
  // Quanto o carro perde velocidade sozinho quando o jogador solta o acelerador.
  // Maior = para rapido; menor = desliza/embala por mais tempo.
  friction: number;
  // Forca da direcao. Maior vira mais rapido, mas pode deixar o carro nervoso em alta velocidade.
  steerRate: number;
  // Multiplicador do drift calculado com a formula do Starter Kit Racing.
  // Maior = derrapa e gera marcas/fumaca/som mais cedo; menor = carro mais plantado.
  driftMultiplier: number;
  // Multiplicador da velocidade maxima quando estiver fora da pista.
  // Ex: 0.5 significa que fora da pista o carro so alcanca metade da velocidade.
  offroadSpeedMultiplier: number;
  // Multiplicador da aderencia/direcao fora da pista.
  // Menor = carro vira pior na grama/fora do asfalto.
  offroadGripMultiplier: number;
};

export type VehicleTrail = {
  // Largura visual de cada faixa escura desenhada no chao.
  // Deve acompanhar o tamanho do pneu: carros maiores podem usar marcas mais largas.
  markWidth: number;
  // Distancia positiva do centro do carro ate o eixo traseiro visual.
  // Aumentar empurra marcas/fumaca para tras do modelo; diminuir aproxima do centro.
  rearAxleOffset: number;
  // Metade da distancia lateral entre as rodas traseiras.
  // Aumentar separa as duas marcas; diminuir aproxima as marcas do centro do carro.
  wheelHalfWidth: number;
};

export const vehicleOptions: VehicleOption[] = [
  // Kart: menor, leve e com direcao alta. Bom para aprender a pista e fazer curvas fechadas.
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
      driftMultiplier: 1.2,
      offroadSpeedMultiplier: 0.52,
      offroadGripMultiplier: 0.72,
    },
    modelPath: "/game-assets/cars/kart.glb",
    variants: [
      { id: "kart-oobi", modelPath: "/game-assets/cars/kart-oobi.glb", name: "Oobi", swatch: "#bca7ff" },
      { id: "kart-oodi", modelPath: "/game-assets/cars/kart-oodi.glb", name: "Oodi", swatch: "#f5a6bb" },
      { id: "kart-ooli", modelPath: "/game-assets/cars/kart-ooli.glb", name: "Ooli", swatch: "#f6d365" },
      { id: "kart-oopi", modelPath: "/game-assets/cars/kart-oopi.glb", name: "Oopi", swatch: "#66cfb2" },
      { id: "kart-oozi", modelPath: "/game-assets/cars/kart-oozi.glb", name: "Oozi", swatch: "#e8cdb7" },
    ],
    // Escala do modelo durante o jogo.
    scale: 0.3,
    // Escala do modelo nos cards da tela inicial.
    previewScale: 1.7,
    // Ajusta onde as marcas de pneu nascem para bater com o tamanho deste modelo.
    trail: {
      markWidth: 0.028,
      rearAxleOffset: 0.22,
      wheelHalfWidth: 0.085,
    },
  },
  // Formula 1 futuristica: mais rapida, com menos margem de erro nas curvas.
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
      driftMultiplier: 0.95,
      offroadSpeedMultiplier: 0.42,
      offroadGripMultiplier: 0.54,
    },
    modelPath: "/game-assets/cars/race-future.glb",
    variants: [
      { id: "future-blue", modelPath: "/game-assets/cars/race-future.glb", name: "Azul futuristica", swatch: "#6f8df6" },
      {
        id: "classic-red",
        modelPath: "/game-assets/cars/formula-1.glb",
        name: "Vermelha",
        previewScale: 1.45,
        scale: 0.38,
        swatch: "#ff5a52",
        wheelOutset: 0.05,
      },
    ],
    scale: 0.4,
    previewScale: 1.5,
    wheelOutset: 0.1,
    trail: {
      markWidth: 0.06,
      rearAxleOffset: 0.52,
      wheelHalfWidth: 0.2,
    },
  },
  // Sedan esportivo: meio termo entre velocidade e estabilidade.
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
      driftMultiplier: 0.75,
      offroadSpeedMultiplier: 0.48,
      offroadGripMultiplier: 0.58,
    },
    modelPath: "/game-assets/cars/sedan-sports.glb",
    variants: [
      { id: "sedan-orange", modelPath: "/game-assets/cars/sedan-sports.glb", name: "Laranja", swatch: "#ff884d" },
      {
        id: "sport-hatch",
        modelPath: "/game-assets/cars/hatchback-sports.glb",
        name: "Sport hatch",
        swatch: "#66cf9a",
      },
    ],
    scale: 0.4,
    previewScale: 1.25,
    trail: {
      markWidth: 0.06,
      rearAxleOffset: 0.68,
      wheelHalfWidth: 0.2,
    },
  },
];

export const defaultVehicle = vehicleOptions[0];

export function getVehicleOption(id: VehicleId) {
  return vehicleOptions.find((vehicle) => vehicle.id === id) ?? defaultVehicle;
}

export function getVehicleVariant(vehicle: VehicleOption, variantId: VehicleVariantId) {
  return vehicle.variants.find((variant) => variant.id === variantId) ?? vehicle.variants[0];
}
