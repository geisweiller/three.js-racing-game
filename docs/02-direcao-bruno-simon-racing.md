# Direcao inspirada em Bruno Simon e Starter Kit Racing

Esta etapa muda a sensacao principal do portfolio. A referencia deixa de ser apenas um mapa caminhavel e passa a ser um pequeno mundo dirigivel.

## Referencias

- Bruno Simon: https://bruno-simon.com/
- Starter Kit Racing: https://mrdoob.github.io/Starter-Kit-Racing/
- Repositorio do Starter Kit Racing: https://github.com/mrdoob/Starter-Kit-Racing

## O que queremos aprender com essas referencias

Do portfolio do Bruno Simon:

- Portfolio como brinquedo exploravel, nao como pagina linear.
- Mundo com areas interativas e segredos.
- Controles claros, opcoes simples e botao de respawn.
- Conteudo profissional aparecendo quando o visitante chega a lugares especificos.

Do Starter Kit Racing:

- Controle de veiculo como base da experiencia.
- Camera seguindo o carro.
- Cenario low-poly com leitura rapida.
- Assets simples e muita clareza de direcao.

## Decisao para este projeto

Vamos seguir uma versao menor e mais didatica:

- O visitante dirige um carrinho pela cidade-portfolio.
- `W` acelera, `S` freia/re, `A` e `D` viram.
- A camera fica atras e acima do carro.
- Pontos de interesse continuam abrindo paineis React.
- No MVP, a fisica e arcade e caseira. Antes de adicionar uma engine como Rapier, queremos entender aceleracao, direcao, atrito e camera follow.

## Implementacao atual

`movement.ts` agora tem duas camadas:

- `getMovementVector`, mantido por enquanto para explicar movimento direto.
- `updateVehicle`, usado pelo jogo para aplicar aceleracao, freio, atrito, curva, limite de mapa e diferenca entre pista/grama.

`Player.tsx` ainda tem esse nome porque ele representa o jogador, mas visualmente agora renderiza um carro simples com `boxGeometry` e rodas com `cylinderGeometry`.

`FollowCamera.tsx` usa o `heading` do carro para ficar atras do veiculo, criando uma sensacao mais proxima de jogo de corrida.

`RacingTrack.tsx` renderiza uma pista em loop com pecas simples. A pista e guiada por `trackData.ts`, que tambem permite saber se o carro esta no asfalto ou fora dele.

## Proximos passos

1. Renomear `Player` para `Vehicle` quando a base estiver mais firme.
2. Adicionar checkpoints e contador de volta.
3. Criar uma pista principal conectando Home, Projetos, Skills e Contato.
4. Melhorar a direcao visual das areas com placas e marcos.
5. Avaliar Rapier quando precisarmos de colisao real, rampas ou objetos empurraveis.
