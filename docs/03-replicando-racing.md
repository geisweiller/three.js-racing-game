# Replicando a base do Starter Kit Racing

O objetivo aqui e replicar a experiencia base do Starter Kit Racing dentro do jogo, nao copiar o projeto inteiro.

O Starter Kit Racing separa responsabilidades em modulos como `Vehicle`, `Camera`, `Controls`, `Track`, `Physics`, `LapTimer`, particulas e audio. No nosso projeto, a primeira replica fica menor:

- `movement.ts`: regras puras do veiculo.
- `trackData.ts`: dados da pista e verificacao de pista/grama.
- `RacingTrack.tsx`: renderizacao visual da pista com modelos `.glb`.
- `Player.tsx`: carro jogavel usando modelo `.glb`.
- `FollowCamera.tsx`: camera atras do carro.
- `GameHud.tsx`: comandos e respawn.

## Pista

A pista agora usa as mesmas pecas `.glb` do Starter Kit Racing.

Os assets ficam em:

- `public/starter-kit-racing/models`
- `public/starter-kit-racing/sprites`
- `public/starter-kit-racing/audio`

Tambem copiamos `LICENSE` e `README.md` para `public/starter-kit-racing/`, mantendo a referencia e os creditos perto dos arquivos usados.

A pista e composta por `trackCells`, inspiradas no array `TRACK_CELLS` do Starter Kit Racing.

Cada celula tem:

- `gx` e `gz`: posicao no grid;
- `modelKey`: nome do modelo, como `track-straight`, `track-corner` ou `track-finish`;
- `orient`: codigo de orientacao usado pela referencia.

`RacingTrack.tsx` usa `useGLTF` do `@react-three/drei` para carregar cada modelo, clonar a cena e ativar sombras nos meshes.

## Pista vs grama

`isPointOnTrack(position)` responde se uma posicao esta sobre algum segmento da pista.

O carro usa essa resposta dentro de `Player.tsx`:

- se esta na pista, usa velocidade e grip normais;
- se esta na grama, reduz velocidade maxima e capacidade de curva.

Essa e uma primeira aproximacao de superficie. Mais tarde, isso pode virar materiais de fisica reais com Rapier ou outra engine.

## Modelos

`Player.tsx` carrega `vehicle-truck-purple.glb` com `useGLTF`.

O modelo fica dentro do grupo controlado pela nossa fisica arcade. Isso separa duas ideias:

- o grupo do jogador define posicao e rotacao;
- o `.glb` define a aparencia do carro.

Essa separacao e importante: podemos trocar o modelo por outro carro depois sem reescrever movimento, camera ou interacao.

## Respawn

`R` chama `requestRespawn()` no store.

O store incrementa `respawnVersion`, e `Player.tsx` observa esse valor para recolocar o carro na largada. Essa abordagem e util porque o carro tem estado interno em `useRef`, fora do React render normal.

## Por que ainda nao usar fisica real

Para aprendizado, a primeira versao usa fisica arcade escrita em helpers puros. Isso permite entender:

- aceleracao;
- freio e re;
- direcao dependente de velocidade;
- atrito;
- limite de velocidade;
- diferenca de superficie;
- camera follow.

Quando entrarmos em colisao real, rampas, objetos empurraveis ou capotagem, faz sentido adicionar uma engine como Rapier.

## Proxima camada para ficar mais parecido

1. Checkpoints na pista.
2. Contador de volta/tempo.
3. Sinalizacao de curva, boxes e checkpoints.
4. Boost curto.
5. Particulas simples de poeira quando sair da pista.
6. Modelos `.glb` low-poly para carro e cenario.
