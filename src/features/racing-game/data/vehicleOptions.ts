export type VehicleId = "kart-oobi" | "kart-oodi" | "kart-ooli" | "kart-oopi" | "kart-oozi";

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
  // Modelo visual usado no jogo e no preview. Mantemos como lista para o player
  // reaproveitar o fluxo de carregamento de variantes.
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
  // Distancia do centro do carro ate o eixo traseiro, no eixo local frente/traseira.
  // Negativo fica atras do centro; se a marca nasce no meio do carro, deixe mais negativo.
  rearAxleOffset: number;
  // Metade da distancia lateral entre as rodas traseiras.
  // Aumentar separa as duas marcas; diminuir aproxima as marcas do centro do carro.
  wheelHalfWidth: number;
};

export const vehicleOptions: VehicleOption[] = [
  {
    id: "kart-oobi",
    name: "Oobi",
    description: "Kart equilibrado para aprender a pista.",
    handling: {
      maxForwardSpeed: 5.6,
      maxReverseSpeed: -2.4,
      acceleration: 9.2,
      reverseAcceleration: 5.4,
      friction: 7.1,
      steerRate: 4.0,
      offroadSpeedMultiplier: 0.52,
      offroadGripMultiplier: 0.72,
    },
    modelPath: "/game-assets/cars/kart-oobi.glb",
    variants: [
      { id: "kart-oobi", modelPath: "/game-assets/cars/kart-oobi.glb", name: "Oobi", swatch: "#bca7ff" },
    ],
    scale: 0.3,
    previewScale: 1.7,
    trail: {
      markWidth: 0.028,
      rearAxleOffset: -0.11,
      wheelHalfWidth: 0.085,
    },
  },
  {
    id: "kart-oodi",
    name: "Oodi",
    description: "Mais leve, acelera rapido e responde cedo.",
    handling: {
      maxForwardSpeed: 5.2,
      maxReverseSpeed: -2.4,
      acceleration: 10.4,
      reverseAcceleration: 5.7,
      friction: 7.8,
      steerRate: 4.45,
      offroadSpeedMultiplier: 0.54,
      offroadGripMultiplier: 0.76,
    },
    modelPath: "/game-assets/cars/kart-oodi.glb",
    variants: [
      { id: "kart-oodi", modelPath: "/game-assets/cars/kart-oodi.glb", name: "Oodi", swatch: "#f5a6bb" },
    ],
    scale: 0.3,
    previewScale: 1.7,
    trail: {
      markWidth: 0.028,
      rearAxleOffset: -0.11,
      wheelHalfWidth: 0.085,
    },
  },
  {
    id: "kart-ooli",
    name: "Ooli",
    description: "O mais veloz, bom para retas longas.",
    handling: {
      maxForwardSpeed: 6.1,
      maxReverseSpeed: -2.35,
      acceleration: 8.5,
      reverseAcceleration: 5.1,
      friction: 6.5,
      steerRate: 3.65,
      offroadSpeedMultiplier: 0.5,
      offroadGripMultiplier: 0.68,
    },
    modelPath: "/game-assets/cars/kart-ooli.glb",
    variants: [
      { id: "kart-ooli", modelPath: "/game-assets/cars/kart-ooli.glb", name: "Ooli", swatch: "#f6d365" },
    ],
    scale: 0.3,
    previewScale: 1.7,
    trail: {
      markWidth: 0.028,
      rearAxleOffset: -0.11,
      wheelHalfWidth: 0.085,
    },
  },
  {
    id: "kart-oopi",
    name: "Oopi",
    description: "Aderente, perdoa erros fora da linha ideal.",
    handling: {
      maxForwardSpeed: 5.35,
      maxReverseSpeed: -2.4,
      acceleration: 9.0,
      reverseAcceleration: 5.4,
      friction: 7.5,
      steerRate: 4.25,
      offroadSpeedMultiplier: 0.58,
      offroadGripMultiplier: 0.82,
    },
    modelPath: "/game-assets/cars/kart-oopi.glb",
    variants: [
      { id: "kart-oopi", modelPath: "/game-assets/cars/kart-oopi.glb", name: "Oopi", swatch: "#66cfb2" },
    ],
    scale: 0.3,
    previewScale: 1.7,
    trail: {
      markWidth: 0.028,
      rearAxleOffset: -0.11,
      wheelHalfWidth: 0.085,
    },
  },
  {
    id: "kart-oozi",
    name: "Oozi",
    description: "Mais pesado, estavel e previsivel em curvas.",
    handling: {
      maxForwardSpeed: 5.75,
      maxReverseSpeed: -2.25,
      acceleration: 8.4,
      reverseAcceleration: 4.9,
      friction: 6.9,
      steerRate: 3.8,
      offroadSpeedMultiplier: 0.5,
      offroadGripMultiplier: 0.7,
    },
    modelPath: "/game-assets/cars/kart-oozi.glb",
    variants: [
      { id: "kart-oozi", modelPath: "/game-assets/cars/kart-oozi.glb", name: "Oozi", swatch: "#e8cdb7" },
    ],
    scale: 0.3,
    previewScale: 1.7,
    trail: {
      markWidth: 0.028,
      rearAxleOffset: -0.11,
      wheelHalfWidth: 0.085,
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
