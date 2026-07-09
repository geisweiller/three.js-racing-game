# Direcao inspirada em Bruno Simon e Starter Kit Racing

Esta etapa muda a sensacao principal do projeto. A referencia deixa de ser um mapa caminhavel e passa a ser um jogo de corrida arcade.

## Referencias

- Bruno Simon: https://bruno-simon.com/
- Starter Kit Racing: https://mrdoob.github.io/Starter-Kit-Racing/
- Repositorio do Starter Kit Racing: https://github.com/mrdoob/Starter-Kit-Racing

## O que queremos aprender com essas referencias

Do site do Bruno Simon:

- Experiencia web como brinquedo exploravel, nao como pagina linear.
- Mundo com areas interativas e segredos.
- Controles claros, opcoes simples e botao de respawn.

Do Starter Kit Racing:

- Controle de veiculo como base da experiencia.
- Camera seguindo o carro.
- Cenario low-poly com leitura rapida.
- Assets simples e muita clareza de direcao.

## Decisao para este projeto

Vamos seguir uma versao menor e mais didatica:

- O jogador escolhe um veiculo e dirige em um circuito fechado.
- `W` acelera, `S` freia/re, `A` e `D` viram.
- `Espaco` usa nitro quando a barra tiver carga.
- A camera fica atras e acima do carro.
- No MVP, a fisica e arcade e caseira. Antes de adicionar uma engine como Rapier, queremos entender aceleracao, direcao, atrito e camera follow.

## Implementacao atual

`movement.ts` agora tem duas camadas:

- `getMovementVector`, mantido por enquanto para explicar movimento direto.
- `updateVehicle`, usado pelo jogo para aplicar aceleracao, freio, atrito, curva, limite de mapa e diferenca entre pista/grama.

`Player.tsx` ainda tem esse nome porque ele representa o jogador, mas visualmente agora renderiza um carro simples com `boxGeometry` e rodas com `cylinderGeometry`.

`FollowCamera.tsx` usa o `heading` do carro para ficar atras do veiculo, criando uma sensacao mais proxima de jogo de corrida.

`RacingTrack.tsx` renderiza uma pista em loop com modelos do Starter Kit Racing. A pista e guiada por `trackData.ts`, que tambem permite saber se o carro esta dentro da area dirigivel.

## Proximos passos

1. Renomear `Player` para `Vehicle` quando a base estiver mais firme.
2. Adicionar checkpoints e contador de volta.
3. Criar pickups e power-ups alem do nitro.
4. Melhorar a leitura visual do circuito com boxes, arquibancada e marcadores de volta.
5. Avaliar Rapier quando precisarmos de colisao real, rampas ou objetos empurraveis.
