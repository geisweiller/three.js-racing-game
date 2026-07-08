import type { PortfolioSectionId } from "./portfolioData";
import { gridToWorld } from "./trackData";

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
    position: gridToWorld(0, 0),
    radius: 2.2,
    title: "Casa",
    hint: "Pressione E para abrir a Home",
  },
  {
    id: "about",
    position: gridToWorld(-2, 2),
    radius: 2,
    title: "Praca",
    hint: "Pressione E para ler Sobre",
  },
  {
    id: "experience",
    position: gridToWorld(-1, -3),
    radius: 2,
    title: "Carreira",
    hint: "Pressione E para ver Experiencia",
  },
  {
    id: "projects",
    position: gridToWorld(0, -2),
    radius: 2.4,
    title: "Projetos",
    hint: "Pressione E para abrir Projetos",
  },
  {
    id: "skills",
    position: gridToWorld(-3, -1),
    radius: 2.2,
    title: "Skills",
    hint: "Pressione E para abrir Skills",
  },
  {
    id: "contact",
    position: gridToWorld(0, 2),
    radius: 2,
    title: "Contato",
    hint: "Pressione E para abrir Contato",
  },
];
