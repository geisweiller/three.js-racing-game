export type PortfolioSectionId =
  | "home"
  | "about"
  | "experience"
  | "projects"
  | "skills"
  | "contact";

type PortfolioSection = {
  id: PortfolioSectionId;
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
};

export const portfolioSections: Record<PortfolioSectionId, PortfolioSection> = {
  home: {
    id: "home",
    eyebrow: "Casa",
    title: "Arthur Geisweiller",
    description:
      "Frontend engineer focado em React, Next.js, TypeScript, arquitetura de front-end e experiencias digitais bem cuidadas.",
    items: ["React", "Next.js", "TypeScript", "Design Systems"],
  },
  about: {
    id: "about",
    eyebrow: "Praca central",
    title: "Sobre mim",
    description:
      "Resumo profissional do portfolio: construcao de interfaces robustas, colaboracao com produto e atencao forte a qualidade da experiencia.",
    items: ["UI engineering", "Produto", "Acessibilidade", "Qualidade"],
  },
  experience: {
    id: "experience",
    eyebrow: "Avenida da carreira",
    title: "Experiencia",
    description:
      "A timeline profissional sera representada por marcos urbanos. Nesta primeira versao, deixamos a estrutura pronta para receber o CV detalhado.",
    items: ["Timeline urbana", "Empresas", "Entregas", "Impacto"],
  },
  projects: {
    id: "projects",
    eyebrow: "Distrito de projetos",
    title: "Projetos",
    description:
      "Predios e portais vao abrir detalhes de projetos relevantes, com foco inicial em mTab, Jobylon, W3lcome e Privy.",
    items: ["mTab", "Jobylon", "W3lcome", "Privy"],
  },
  skills: {
    id: "skills",
    eyebrow: "Quadra de basquete",
    title: "Skills",
    description:
      "A quadra organiza fundamentos e tecnologias: React, Next.js, TypeScript, testing, i18n e arquitetura de front-end.",
    items: ["React", "Testing", "i18n", "Frontend Architecture"],
  },
  contact: {
    id: "contact",
    eyebrow: "Estacao de contato",
    title: "Contato",
    description:
      "Canais principais para conversa, codigo e historico profissional.",
    items: ["geisweiller@gmail.com", "LinkedIn: geisweiller", "GitHub: geisweiller"],
  },
};
