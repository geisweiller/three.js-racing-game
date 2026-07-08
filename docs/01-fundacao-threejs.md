# Fundacao do portfolio Three.js

Esta etapa cria o primeiro MVP tecnico do portfolio 3D. A meta nao e ter o visual final, mas montar uma base jogavel e facil de estudar.

## O que foi criado

- Next.js com App Router, TypeScript e Tailwind.
- `@react-three/fiber` para usar Three.js dentro de componentes React.
- `@react-three/drei` esta instalado para helpers futuros de cena, camera, modelos e textos.
- Zustand para guardar estado pequeno do jogo.
- Framer Motion para animar o painel React.
- Vitest para testar regras puras de movimento e proximidade.

## Como as camadas se dividem

Three.js cuida do mundo 3D:

- `src/components/game/GameCanvas.tsx` cria o `<Canvas>`, que e o ponto de entrada da cena 3D.
- `src/features/portfolio-game/scene/ExperienceScene.tsx` compoe luzes, chao, objetos, personagem, camera e marcadores.
- `src/features/portfolio-game/scene/Player.tsx` atualiza a posicao do veiculo a cada frame.
- `src/features/portfolio-game/scene/FollowCamera.tsx` faz a camera seguir o jogador com interpolacao.

React cuida da interface textual:

- `src/components/game/GameHud.tsx` mostra instrucoes e a dica de interacao.
- `src/components/game/InteractionPanel.tsx` abre conteudo profissional fora do canvas.

Dados e regras ficam separados:

- `src/features/portfolio-game/data/portfolioData.ts` guarda textos do portfolio.
- `src/features/portfolio-game/data/pointsOfInterest.ts` define os pontos interativos do mapa.
- `src/features/portfolio-game/game/movement.ts` calcula aceleracao, freio, direcao, atrito e limites do mapa.
- `src/features/portfolio-game/game/proximity.ts` descobre se o jogador esta perto de algum ponto.

## Conceitos de Three.js usados aqui

`Canvas` e a ponte entre React e Three.js. Tudo dentro dele vira parte de uma cena 3D.

`mesh` e um objeto visivel. Ele combina:

- geometria, como `boxGeometry`, `sphereGeometry`, `capsuleGeometry`;
- material, como `meshStandardMaterial`;
- transformacoes, como `position`, `rotation` e `scale`.

`ambientLight` ilumina tudo de forma suave. `directionalLight` simula uma luz distante, parecida com sol, e permite sombras.

`useFrame` roda em todo frame renderizado. Aqui ele move o veiculo e suaviza a camera.

## Como rodar

```bash
npm run dev
```

Depois abra `http://localhost:3000`.

## Como testar

```bash
npm test
```

Os primeiros testes cobrem regras puras porque elas sao mais estaveis e mais faceis de aprender antes de testar renderizacao 3D.

## Proximas etapas sugeridas

1. Pausar movimento quando o painel estiver aberto.
2. Melhorar o mapa com pistas, rampas e objetos low-poly.
3. Separar cada area da cidade em componentes proprios.
4. Adicionar PT/EN com `react-intl`.
5. Trazer a timeline real do CV e conteudo detalhado dos projetos.
