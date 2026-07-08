import type { PortfolioSectionId } from "./portfolioData";

export type PointOfInterest = {
  id: PortfolioSectionId;
  position: [number, number, number];
  radius: number;
  title: string;
  hint: string;
};

export const pointsOfInterest: PointOfInterest[] = [
  {
    id: "home",
    position: [0, 0, -5.6],
    radius: 2.2,
    title: "Casa",
    hint: "Pressione E para abrir a Home",
  },
  {
    id: "about",
    position: [-7, 0, 0],
    radius: 2,
    title: "Praca",
    hint: "Pressione E para ler Sobre",
  },
  {
    id: "experience",
    position: [0, 0, 7],
    radius: 2,
    title: "Carreira",
    hint: "Pressione E para ver Experiencia",
  },
  {
    id: "projects",
    position: [7, 0, 0],
    radius: 2.4,
    title: "Projetos",
    hint: "Pressione E para abrir Projetos",
  },
  {
    id: "skills",
    position: [-7, 0, -4],
    radius: 2.2,
    title: "Skills",
    hint: "Pressione E para abrir Skills",
  },
  {
    id: "contact",
    position: [7, 0, 4],
    radius: 2,
    title: "Contato",
    hint: "Pressione E para abrir Contato",
  },
];
