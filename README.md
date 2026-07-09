# Circuito Nitro

Circuito Nitro e um jogo de corrida 3D feito com Next.js, React, Three.js e React Three Fiber. O jogador escolhe um veiculo, troca variantes visuais, corre em um circuito low-poly, coleta caixas de nitro e tenta melhorar seus tempos de volta.

## Gameplay

- Escolha entre Kart, Formula 1 e Carro de corrida.
- Cada veiculo tem handling proprio: velocidade, aceleracao, curva, grip fora da pista e escala visual.
- Variantes trocam o modelo 3D real usado no preview e durante a corrida.
- A pista usa assets do Starter Kit Racing, com colisao mantendo o carro dentro do circuito.
- Caixas de nitro aparecem na pista e carregam a barra em 25%.
- `Espaco` consome nitro para aumentar a velocidade enquanto houver carga.
- O HUD mostra volta, tempo atual, ultima volta, melhor volta, barra de nitro e velocimetro.
- Efeitos incluem marcas de pneu, fumaca, som de motor, skid, impacto e coleta de nitro.

## Controles

| Tecla | Acao |
| --- | --- |
| `W` | Acelerar |
| `S` | Frear / re |
| `A` | Virar para esquerda |
| `D` | Virar para direita |
| `Espaco` | Usar nitro |
| `R` | Respawn |
| `Esc` | Voltar ao menu |

## Stack

- Next.js App Router
- React
- Three.js
- `@react-three/fiber`
- `@react-three/drei`
- Zustand
- Framer Motion
- HeroUI
- Vitest
- ESLint

## Estrutura Principal

```text
src/components/game/
  GameCanvas.tsx      # Canvas 3D
  GameHud.tsx         # HUD de corrida
  IntroScreen.tsx     # Selecao de veiculo

src/features/racing-game/
  data/               # pista e opcoes de veiculos
  game/               # estado, input, movimento e helpers
  scene/              # cena Three.js, player, pista, audio e efeitos

public/
  game-assets/        # modelos de carros, predios e props
  starter-kit-racing/ # modelos, sprites e audio vindos do Starter Kit Racing
```

## Desenvolvimento

Instale as dependencias:

```bash
npm ci
```

Rode o servidor local:

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Qualidade

```bash
npm run lint
npm test -- --run
npm run build
```

## Deploy no GitHub Pages

O projeto esta configurado para export estatico do Next.js (`output: "export"`) e possui o workflow:

```text
.github/workflows/deploy-pages.yml
```

O workflow roda em push para `main` e faz:

1. checkout do repositorio;
2. install com `npm ci`;
3. lint;
4. testes;
5. build estatico com `GITHUB_PAGES=true`;
6. upload da pasta `out`;
7. deploy pelo GitHub Pages.

No GitHub, configure o repositorio em `Settings -> Pages -> Build and deployment -> Source` como `GitHub Actions`.

URL esperada depois do deploy:

```text
https://geisweiller.github.io/three.js-game-portfolio/
```

## Assets e Creditos

Parte da pista, decoracoes, sprites e audio vem do projeto `mrdoob/Starter-Kit-Racing`. Os arquivos e licenca ficam em `public/starter-kit-racing/`.

Os modelos em `public/game-assets/` sao usados para os veiculos, estruturas e objetos da pista.
