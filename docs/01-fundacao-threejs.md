# Fundacao do jogo de corrida Three.js

Esta etapa cria o primeiro MVP tecnico do jogo de corrida 3D. A meta nao e ter o visual final, mas montar uma base jogavel e facil de estudar.

## O que foi criado

- Next.js com App Router, TypeScript e Tailwind.
- `@react-three/fiber` para usar Three.js dentro de componentes React.
- `@react-three/drei` esta instalado para helpers futuros de cena, camera, modelos e textos.
- Zustand para guardar estado pequeno do jogo.
- Framer Motion para animacoes de interface.
- Vitest para testar regras puras de movimento e pista.

## Como as camadas se dividem

Three.js cuida do mundo 3D:

- `src/components/game/GameCanvas.tsx` cria o `<Canvas>`, que e o ponto de entrada da cena 3D.
- `src/features/racing-game/scene/ExperienceScene.tsx` compoe luzes, pista, cenario, veiculo, camera, efeitos e audio.
- `src/features/racing-game/scene/Player.tsx` atualiza a posicao do veiculo a cada frame.
- `src/features/racing-game/scene/FollowCamera.tsx` faz a camera acompanhar o jogador com angulo fixo.

React cuida da interface textual:

- `src/components/game/GameHud.tsx` mostra tempo, voltas, item atual e comandos.
- `src/components/game/IntroScreen.tsx` permite escolher o veiculo e a variante antes de jogar.

Dados e regras ficam separados:

- `src/features/racing-game/data/trackData.ts` guarda o desenho da pista, decoracoes e segmentos dirigiveis.
- `src/features/racing-game/data/vehicleOptions.ts` define veiculos, variantes e handling.
- `src/features/racing-game/game/movement.ts` calcula aceleracao, freio, direcao, atrito, efeitos de pneu e boost temporario.
- `src/features/racing-game/game/useGameStore.ts` centraliza estado de partida, HUD, respawn, voltas e item de boost.

## Conceitos de Three.js usados aqui

`Canvas` e a ponte entre React e Three.js. Tudo dentro dele vira parte de uma cena 3D.

`mesh` e um objeto visivel. Ele combina:

- geometria, como `boxGeometry`, `sphereGeometry`, `capsuleGeometry`;
- material, como `meshStandardMaterial`;
- transformacoes, como `position`, `rotation` e `scale`.

`ambientLight` ilumina tudo de forma suave. `directionalLight` simula uma luz distante, parecida com sol, e permite sombras.

`useFrame` roda em todo frame renderizado. Aqui ele move o veiculo, atualiza a camera, detecta colisao com a pista e cria efeitos.

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

1. Melhorar o layout do circuito e pontos de ultrapassagem.
2. Adicionar checkpoints intermediarios para validar voltas com mais precisao.
3. Criar IA simples para adversarios.
4. Adicionar tela de resultados e ranking local.
5. Refinar audio, particulas e feedback dos itens.
