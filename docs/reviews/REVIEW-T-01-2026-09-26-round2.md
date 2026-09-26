# Review: T-01 — Criar a solução e os quatro projetos com referências de projeto (round 2)

> **Plano de referência:** `docs/plans/PLAN-001-painel-indicadores-saude.md`
> **PRD de referência:** `docs/prds/PRD-001-painel-indicadores-saude.md`
> **Arquitetura de referência:** `docs/architecture/proposta-arquitetural.md`
> **Reviewer:** opencode (skill `reviewer-leanwork`)
> **Data:** 2026-09-26
> **Round:** 2
> **Round anterior comparado:** `docs/reviews/REVIEW-T-01-2026-09-26.md`
> **Recomendação final:** ⚠️ Aprovado com ressalvas

---

## Sumário executivo

Este round não encontrou nenhum defeito no que T-01 entregou. Os três critérios de aceite foram reexecutados de forma independente e passam agora sob a letra, não apenas sob o espírito: o build sai com 0 avisos e 0 erros, o `dotnet test` sai com código 0 e a DLL de testes é descoberta, e o grafo de referências é exatamente `Application → ∅`, `Infrastructure → Application`, `Web → Infrastructure`, `Tests → os três`. O critério 3, que no round 1 era insatisfazível junto com a própria descrição da tarefa, foi reescrito no plano para distinguir projeto de produção de projeto de teste — e a distinção corresponde ao grafo real. A coerência entre descrição, critérios e `Status: Concluído` está restabelecida, e a rastreabilidade `ADR-001 → T-01 → review → findings` está fechada: o plano referencia o review, e os seis findings do round 1 estão registrados com estado individual.

Os três findings Importantes do round 1 foram resolvidos no plano e verifiquei cada uma das resolutions: o critério reescrito, a nota de desvio corrigida preservando os 63 arquivos de `wwwroot`, e a atribuição de `MapStaticAssets()` a T-17 com critério de aceite e teste de regressão em T-30. Nenhum arquivo de código foi alterado neste round — a verificação por timestamp confirma que o último write em `src/` e `tests/` é de 15:15:13, anterior a qualquer trabalho documental.

O que resta são quatro achados, nenhum deles sobre a qualidade do que T-01 construiu. O mais relevante é de outra ordem: **a entrega de T-01 não está versionada**. O plano marca a tarefa como `Concluído`, mas a coluna Commit do Histórico está vazia e o repositório não tem nenhum commit do projeto — todo o entregável existe apenas na árvore de trabalho, sem versionar. Some-se a isso que a resolução de R-03 (round 1) tornou finalmente alcançável o `site.css` e o `site.js` do template, o que ativa um risco que estava latente desde o round 1. Os dois achados Importantes e as duas Sugestões remanescentes não impedem o encerramento formal de T-01.

**Findings por severidade:**

| Severidade | IDs | Quantidade |
|------------|-----|------------|
| 🔴 Bloqueante | — | 0 |
| 🟡 Importante | R-01, R-02 | 2 |
| 🟢 Sugestão | R-03, R-04 | 2 |
| **Total** | | **4** |

> **Sobre a numeração.** Este é o round 2, então a numeração recomeça. O `R-01` deste relatório **não** tem relação com o `R-01` do round 1 — são findings distintos. Toda citação a um achado do round anterior traz o qualificador: `R-04 (round 1)`. A comparação completa está na seção "Round anterior".

**Cobertura da tarefa:**

| Item | Esperado | Entregue | Status |
|------|----------|----------|--------|
| Regras implementadas (RN) | `-` (nenhuma) | `-` | ✅ não aplicável |
| Cenários validados (CA) | `-` (nenhum) | `-` | ✅ não aplicável |
| Decisões base (ADR) | ADR-001 | ADR-001 materializada e verificável | ✅ |
| Critérios de aceite da tarefa | 3 | 3 atendidos e verificados neste round | ✅ |
| Telas e estados (UI) | `-` (campo não preenchido) | `-` | ✅ não aplicável |
| Testes prometidos | "Não aplicável — suíte em T-29 e T-30" | nenhum criado; `dotnet test` com 0 testes | ✅ |
| Registro de review no plano | referência ao relatório | campo `Review:` + tabela de findings | ✅ |
| Versionamento da entrega | commit registrado | coluna Commit vazia, sem commit | ❌ ver R-01 |

---

## Contexto da implementação

### Stack detectada

- **Backend:** .NET 10 (SDK 10.0.204, runtime 10.0.8), ASP.NET Core Razor Pages
- **Banco:** EF Core 10.0.12 com provider SQLite (referência de pacote criada em T-01; uso real em T-02)
- **Frontend:** Bootstrap 5 e jQuery versionados localmente em `wwwroot/lib/` — 63 arquivos, confirmados por inspeção neste round
- **Fonte:** proposta arquitetural (seção 6 e ADR-001/ADR-006) mais inspeção do repositório (`*.csproj`, `wwwroot/lib/`)

### Padrões específicos aplicados (lidos do projeto)

- ADR-001: solução única em camadas, sem mediator, sem projeto de domínio, separação por projeto
- ADR-006: Chart.js e Bootstrap servidos localmente, sem CDN e sem etapa de build de frontend

> ⚠️ **Continua não existindo `CLAUDE.md` no repositório.** Nenhuma convenção de time está documentada, então foram aplicados apenas os critérios universais de qualidade mais os das ADRs do projeto. A recomendação de `/leanwork-context raiz` permanece válida e agora tem mais a detectar: o layout de pastas corrigido em T-01 e o padrão de mapeamento estático que T-17 passa a carregar.

### Escopo da revisão

Este round **não** revisou uma implementação nova — T-01 não foi tocada desde o round 1. O que se revisou foi o **estado do plano após o saneamento do review, a propagação de G-1 e a resolução de R-01, R-02 e R-03**, mais a reconfirmação independente dos três critérios de aceite contra o código atual.

- **Arquivos de código modificados neste round:** 0
- **Arquivos de documentação modificados:** `PLAN-001` (resolução de R-01/R-02/R-03 e registros), `REVIEW-T-01-2026-09-26.md` (saneamento de contagem e fusão de R-05, feito antes deste round)
- **Commits:** 0 — nada commitado, conforme instrução do responsável

### Evidência de ausência de alteração indevida no código

| Verificação | Resultado |
|---|---|
| Arquivos de código sob `src/` e `tests/` (sem `bin`/`obj`) | 82 |
| Timestamp do arquivo de código mais recente | `2026-09-26 15:15:13` — anterior ao saneamento do review (15:58:39) e a todas as edições de plano |
| `Program.cs` contém `MapStaticAssets()` | Não — intacto, como esperado, porque T-17 é que vai introduzi-lo |
| `Program.cs` contém `MapRazorPages()` | Sim — o conteúdo mínimo autorizado |
| `wwwroot` | 63 arquivos — o mesmo número registrado no round 1, nenhum removido |
| Boilerplate de R-04 | 8 de 8 arquivos ainda presentes, nenhum removido sem autorização |
| `wwwroot/css/painel.css` | Não existe — correto, T-17 está `Pendente` |
| `git status` | Nada rastreado; nenhum commit novo |

---

## Findings detalhados

### 🔴 Bloqueantes

Nenhum. **Não há bloqueante que impeça o encerramento formal de T-01.**

### 🟡 Importantes

#### R-01 — A entrega de T-01 está marcada como concluída e não está versionada

- **Severidade:** 🟡 Importante
- **Eixo:** 2. Rastreabilidade
- **Referência cruzada:** T-01, seção 11 do plano
- **Evidência:** `docs/plans/PLAN-001-painel-indicadores-saude.md` — linha da tabela de Histórico de T-01, coluna `Commit` com valor `-`. `git status --porcelain` retorna `?? src/`, `?? tests/`, `?? docs/`, `?? PainelIndicadores.sln` — o projeto inteiro está não rastreado, e `git log` mostra apenas `0941bb8` e `62e3222`, nenhum deles do projeto.
- **Descrição:** T-01 carrega `Status: Concluído` e cumpre os três critérios, mas nada do que ela entregou está em um commit. A solução, os quatro `.csproj`, o `Program.cs` e os 63 arquivos de `wwwroot` existem apenas na árvore de trabalho. Isso cria dois problemas concretos. O primeiro é de **rastreabilidade**: o histórico do plano tem uma coluna Commit precisamente para registrar o que foi entregue, e para T-01 ela está vazia, o que torna impossível responder "qual código correspondia a T-01 em 26/09/2026" — que é a função do registro. O segundo é de **risco**: um `git clean -fd`, um `git checkout` de outra branch, ou a perda do diretório de trabalho apaga a entrega inteira sem que exista qualquer cópia. A tarefa está registrada como feita em um lugar que não é recuperável.

  Vale registrar que o critério de aceite de T-33 exige "O histórico de execução registra as tarefas concluídas com o respectivo commit". Esse critério já nasce violado por T-01, e nenhuma tarefa do plano fecha isso — T-33 vai encontrá-lo na auditoria final, quando será tarde para versionar com fidelidade.

- **Por que é Importante e não Bloqueante:** o código está correto e verificado, e nenhum critério de aceite falha por causa disso. Não é defeito de implementação, é lacuna de registro com consequência de perda. Bloquear o encerramento por um problema de versionamento puniria a tarefa pela minha própria omissão processual — a entrega existe, está certa e não está commitada porque foi instruído a não commitar.
- **Sugestão de correção:** commitar T-01 isoladamente, com mensagem que cite `T-01`, e preencher a coluna Commit do Histórico com o hash resultante. Fica a critério do responsável a decisão de commitar — o que este review registra é que, enquanto a coluna estiver vazia, o estado `Concluído` não é auditável.

#### R-02 — A resolução de R-03 (round 1) tornou alcançável o `site.css` e o `site.js` do template, e o plano não decidiu sobre eles

- **Severidade:** 🟡 Importante
- **Eixo:** 1. Aderência ao plano
- **Referência cruzada:** R-04 (round 1), R-03 (round 1), T-17
- **Evidência:** `src/PainelIndicadores/PainelIndicadores.Web/Pages/Shared/_Layout.cshtml:9` referencia `~/css/site.css` e, na linha 48, `~/js/site.js`. Ambos os arquivos existem, com 667 e 231 bytes respectivamente. O `Program.cs` **não** tem `app.MapStaticAssets()`.
- **Descrição:** este achado é consequência direta de uma correção aplicada depois do round 1, e é o tipo de efeito colateral que nenhum checklist prévia. Até aqui, `site.css` e `site.js` estavam no disco mas **mortos**: sem `MapStaticAssets()` no pipeline, nenhum arquivo estático era servido, e o round 1 registrou isso como parte de R-03. A resolução de R-03 atribuiu a T-17 a introdução de `app.MapStaticAssets()`. A partir do momento em que T-17 executar, o `site.css` e o `site.js` do template serão servidos pela **primeira vez** — e o `_Layout.cshtml` que T-17 vai construir deriva do `_Layout.cshtml` do template, que já os referencia nas linhas 9 e 48.

  O resultado é que o risco que R-04 (round 1) descrevia como latente passa a ser ativo sem que ninguém o tenha decidido: dois estilos vão competir pelo mesmo formulário — o `site.css` do template, com as regras de demonstração que ele traz, e o `painel.css` real que T-17 cria. O plano não diz se o `site.css` deve ser removido, declarado em T-17, ou sobrescrito. A ordem de precedência de CSS decide quem vence, e essa decisão não está em lugar nenhum.

- **Por que é Importante:** `site.css` contém regras de layout e cor que o template do ASP.NET Core aplica a `body`, formulários e tabelas — exatamente o que o painel vai substituir. Se for servido depois do `painel.css`, sobrescreve o design; se for servido antes, some por cascata. Nenhum dos dois resultados é detectável por teste automatizado, e nenhum critério de T-17 verifica ausência de estilo conflitante. É a mesma classe de falha que R-03 (round 1) descreveu: um artefato de frontend que falha de forma visual e silenciosa.
- **Sugestão de correção:** decidir em T-17, junto com `app.MapStaticAssets()`, entre (a) remover `site.css` e `site.js` e suas duas linhas de `<link>`/`<script>` do layout, ou (b) declará-los em `Camadas/arquivos afetados` como `*(editado)*` e esvaziá-los deliberadamente. A opção (a) é a mais limpa e resolve simultaneamente R-04 (round 1) para estes dois arquivos. A decisão deve ser registrada no plano antes de T-17 partir, não durante a execução.

### 🟢 Sugestões

#### R-03 — `TreatWarningsAsErrors` continua sem dono (persiste do round 1)

- **Severidade:** 🟢 Sugestão
- **Eixo:** 1. Aderência ao plano
- **Referência cruzada:** R-06 (round 1)
- **Evidência:** `src/PainelIndicadores/PainelIndicadores.Web/PainelIndicadores.Web.csproj` — os quatro `.csproj` carregam apenas `net10.0`, `Nullable=enable` e `ImplicitUsings=enable`.
- **Descrição:** o primeiro critério de T-01 diz "compila os quatro projetos sem erro nem **aviso**", e reexecutei o build neste round: 0 avisos, 0 erros. O critério é satisfeito. O que continua verdade é que nada no projeto impede um warning novo de aparecer e passar, o que torna o critério dependente de disciplina em vez de invariante. Reitero o achado do round 1 sem alteração de gravidade: o build está limpo, e a sugestão é preventiva.
- **Sugestão de correção:** um `Directory.Build.props` na raiz com `<TreatWarningsAsErrors>true</TreatWarningsAsErrors>`, ou a mesma propriedade nos quatro `.csproj`. Quatro linhas. Pode ser adotado em qualquer momento, inclusive agora que o build está limpo.

#### R-04 — Convenção de pasta de vendor segue inconsistente entre `lib/` e `vendor/` (persiste do round 1)

- **Severidade:** 🟢 Sugestão
- **Eixo:** 5. Qualidade do código
- **Referência cruzada:** R-07 (round 1), T-19
- **Evidência:** `wwwroot/lib/bootstrap/…` e `wwwroot/lib/jquery/…` (entregues pelo template, confirmados neste round) vs. `docs/plans/PLAN-001-painel-indicadores-saude.md` → `wwwroot/vendor/chartjs/` declarado por T-19.
- **Descrição:** duas pastas para o mesmo conceito no mesmo `wwwroot`. Com a atribuição de `MapStaticAssets()` a T-17, o mapeamento passa a servir ambas, o que torna a inconsistência visível ao navegador em vez de apenas estética de repositório. Sem qualquer efeito funcional hoje.
- **Sugestão de correção:** decidir `lib/` ou `vendor/` e ajustar T-19. `lib/` é o padrão do framework já presente no repositório e o caminho de menor resistência.

---

## Cobertura por RN (Implementa)

`Implementa: -` — T-01 não promete concretizar regra de negócio. É o nó raiz da cadeia de rastreabilidade: entra por ADR-001, não por RN. Não aplicável, e coerente com o que o `/leanwork-trace` registrou.

## Cobertura por CA (Valida)

`Valida: -` — T-01 não promete validar cenário Gherkin. O critério 2 da tarefa verifica que a suíte **reporta zero testes sem falha de descoberta**, e não que qualquer CA passa. Nenhum CA do PRD referencia T-01. Não aplicável.

## Cobertura por UI (Telas)

Campo `Telas:` não preenchido em T-01 — tarefa estrutural, sem interface. Não aplicável. Ressalva: a ausência do campo é coerente com a tarefa, mas o plano não distingue "campo ausente por não se aplicar" de "campo esquecido". Em T-01 é legitimately a primeira hipótese; em outras tarefas seria lacuna.

---

## Verificação da Decisão Arquitetural

### ADR-001 — Monolito em camadas .NET 10 com Razor Pages, sem mediator e sem camada de domínio separada

- **Decisão original:** solução única em três projetos (`Web`, `Application`, `Infrastructure`) mais `Tests`; sem projeto de domínio; separação entre apresentação e acesso a dados *por projeto*, não por convenção.
- **Implementação verificada neste round:**

  | Verificação | Comando | Resultado |
  |---|---|---|
  | Build dos quatro projetos | `dotnet build` | exit 0 — **0 Aviso(s)**, **0 Erro(s)** ✅ |
  | Descoberta de testes | `dotnet test` | exit 0 — "1 arquivos de teste no total corresponderam ao padrão especificado" ✅ |
  | Grafo de referências | leitura dos quatro `.csproj` | `Application → ∅`, `Infrastructure → Application`, `Web → Infrastructure`, `Tests → Application, Infrastructure, Web` ✅ |
  | Separação de fato, não de papel | `dotnet msbuild Application.csproj -getItem:Compile` | `Compile` items: **0** — `Application` não compila `Program.cs` nem nenhum `Pages/*.cshtml.cs` ✅ |
  | Sem mediator | inspeção de pacotes | nenhum `MediatR`, nenhum `FluentValidation` ✅ |
  | Razor Pages, sem SPA | `Web.csproj` | `Microsoft.NET.Sdk.Web`; sem `Blazor`, sem `package.json` ✅ |

- **Conformidade:** ✅ A ADR-001 está materializada e verificável mecanicamente, e o verificado é o mesmo do round 1 — a separação de camadas não é aspiracional, é propriedade do build. O `-getItem:Compile` continua sendo a prova decisiva: o layout de pastas que T-01 criou é o que garante que `Application` não compila o código de `Web`, e é exatamente o layout achatado que o plano declarava que anularia o enforcement da ADR-001 silenciosamente.

- **Verificação do critério 3 na forma reescrita.** O critério agora diz "nenhum projeto **de produção** referencia `Web` — apenas `Tests` o referencia, para os testes de integração de tela de T-30". Confirmei os três pontos contra o grafo real: nenhum dos três projetos de produção referencia `Web` ✅; `Tests` referencia `Web` ✅; e T-30 é de fato a tarefa de testes de integração de tela — seu campo `Depende de:` lista T-17, T-21 e T-29, e seu objetivo declarado é "testar as telas pelo comportamento observável" ✅. O critério é agora satisfazível **e** satisfeito, o que o round 1 apontava como impossível.

---

## Notas ao processo (não-findings)

- **O saneramento do review round 1 funcionou como mecanismo.** A fusão de R-05 em R-01 e a classificação individual dos sete findings originais não foram cosméticas: foi a classificação individual que permitiu a este review conferir se R-01, R-02 e R-03 foram de fato resolvidos, em vez de confiar numa contagem agregada. O round 1 declarava 4 Importantes sem dizer quais — impossível auditar.
- **R-03 (round 1) produziu efeito colateral que nenhum checklist previa.** Ver R-02 deste round. Vale registrar no pipeline: atribuir responsabilidade a uma tarefa que estava sem dono **ativa** riscos que estavam dormentes. A revisão de um achado não termina quando o achado fecha.
- **Plano ainda precisa de atualização — `_Layout` e componentes com caminho inválido.** T-17 declara `Web/Shared/_Layout.cshtml` e T-19 declara `Web/Shared/Componentes/*.cshtml`, sem o prefixo `Pages/`. O template gerou `Pages/Shared/_Layout.cshtml`, que é o caminho correto — quem está errado é o plano. T-17 e T-19 vão falhar ao escrever nesses caminhos. Este achado veio do round 1, não foi convertido em finding porque não é regressão, mas continua valendo e agora convive com uma complicação adicional: o `_Layout.cshtml` real do template, em `Pages/Shared/`, é o que referencia `site.css` e `site.js`, o que é a base factual de R-02 deste round.
- **Plano ainda precisa de atualização — `Index.cshtml` marcado como "novo" em T-22.** O template já criou `Pages/Index.cshtml` e `Pages/Index.cshtml.cs`; o marcador deveria ser `*(editado)*`.
- **Plano ainda precisa de atualização — T-33 audita uma lista de regras-gate desatualizada.** O critério de T-33 enumera `RN-05`, `RN-16`, `RN-34` e `RN-36` como as regras sem tarefa, mas o conjunto real sem tarefa é `RN-10`, `RN-16`, `RN-19`, `RN-34` e `RN-47`; `RN-05` e `RN-36` têm tarefa (T-31). A conferência de fechamento vai comparar contra a lista errada.
- **A rastreabilidadeADR → T → R está fechada; a seta T → R continua de mão única.** O plano agora cita o review e lista os findings, mas T-17 e T-19 não sabem que R-03 foi atribuido a elas — T-17 tem a atribuição em `Riscos / pontos de atenção`, o que é o suficiente para quem lê a tarefa. Um agente executando T-19 não tem como saber que herda o mapeamento, e um executando T-17 só encontra se ler os riscos.
- **Sugestão de `/leanwork-context raiz`.** Já recomendada no round 1 e agora com mais material: existe `dotnet build` e `dotnet test` reais para o skill detectar, mais o layout de pastas corrigido e o padrão de mapeamento estático. Sem `CLAUDE.md`, reviews futuros continuam degradados.
- **Verificação positiva:** `.gitignore` cobre `bin/` e `obj/` corretamente — `git status` não lista nenhum artefato de build entre os arquivos não rastreados.

---

## Round anterior

Comparação com `docs/reviews/REVIEW-T-01-2026-09-26.md`. A numeração daquele relatório recomeçou em `R-01` e não tem relação com a deste round. O `R-05` do round 1 foi fundido em `R-01` durante o saneamento, portanto não aparece como linha própria.

| Item anterior | Status | Comentário |
|---------------|--------|------------|
| R-01 (round 1) — Critério 3 insatisfazível junto com a descrição da tarefa | ✅ **Resolvido** | Critério reescrito para "nenhum projeto **de produção** referencia `Web`; apenas `Tests` o referencia, para os testes de integração de tela de T-30". Verificado contra o grafo real: satisfazível e satisfeito. O `[x]` e o `Status: Concluído` agora são coerentes com a letra do critério. |
| R-02 (round 1) — Bloco de desvios afirma que `wwwroot` está vazio | ✅ **Resolvido** | Nota reescrita: `wwwroot` não está vazio, tem 63 arquivos de Bootstrap 5 e jQuery entregues pelo template, que atendem à ADR-006. O erro de dono (apontava T-22) foi removido e substituído por T-17. Conferi por inspeção: 63 arquivos, `lib/bootstrap` presente. |
| R-03 (round 1) — Nenhuma tarefa dona de `MapStaticAssets()` | ✅ **Resolvido** | T-17 atribuída como dona: `Program.cs` em `Camadas/arquivos afetados`, critério de aceite exigindo `200` com `content-type` de CSS, parágrafo de posse em `Riscos`, e teste de regressão `Assets_estaticos_sao_servidos` em T-30. Nenhuma tarefa nova foi criada; seguem 33. **Ressalva:** a resolução ativou o risco de R-04 — ver R-02 deste round. |
| R-04 (round 1) — Oito arquivos boilerplate sem tarefa dona | ⚠️ **Persiste e agravou** | Os 8 arquivos seguem presentes e sem dono. A agravação é nova: com o mapeamento atribuído a T-17, `site.css` e `site.js` passam a ser servidos pela primeira vez e competem com `painel.css`. Ver R-02 deste round. |
| R-06 (round 1) — `TreatWarningsAsErrors` fixaria o critério "sem aviso" | ⚠️ **Persiste** | Sem mudança de gravidade. Build reconfirmado com 0 avisos; a sugestão é preventiva. Ver R-03 deste round. |
| R-07 (round 1) — Convenção de vendor inconsistente entre `lib/` e `vendor/` | ⚠️ **Persiste** | Sem mudança de gravidade. Ver R-04 deste round. |

**Placar do ciclo:** 3 de 6 findings do round 1 resolvidos, 3 persistem. Os 3 persistentes já estavam classificados como Importante-ou-menos e nenhum é Bloqueante. Nenhum finding do round 1 regrediu.

---

## Conclusão

T-01 pode ser formalmente encerrada. Os três critérios de aceite foram reexecutados neste round e passam todos, o terceiro agora sob a letra do enunciado e não apenas sob a intenção. A coerência entre a descrição da tarefa, seus critérios e o `Status: Concluído` está restabelecida — essa era a lacuna que o round 1 identificou, e ela não está mais. A cadeia de rastreabilidade `ADR-001 → T-01 → REVIEW-T-01 → R-01..R-07` está fechada e navegável a partir do plano, e as três resoluções aplicadas foram conferidas uma a uma contra o grafo de projetos, o conteúdo de `wwwroot` e o layout do template, não apenas aceitas por declaração.

O que este review acrescenta é de outra natureza, e vale ser explícito sobre o peso. **R-01 é o achado que mais importa, e não é sobre a qualidade do código.** A entrega de T-01 está registrada como concluída em um documento que afirma versioná-la, e não está versionada em lugar nenhum: coluna Commit vazia, árvore de trabalho sem rastrear. Nada disso foi faute do trabalho — fui eu que não commitei, por instrução sua —, mas o efeito é o mesmo: um `git clean` apaga T-01. É a única recomendação deste relatório que eu trataria como urge, e é uma ação de dois minutos.

**R-02 é o achado que este round descobriu e o round 1 não podia ver.** Corrigir R-03 foi o certo, e a atribuição a T-17 é sólida. Mas atribuir o mapeamento estático a uma tarefa que estava sem dono **acordou** o `site.css` e o `site.js` do template, que estavam dormentes desde T-01 e agora serão servidos pela primeira vez, competindo com o `painel.css` que T-17 cria. Ninguém decidiu isso, e o modo de falha é visual e silencioso. Convém decidir antes de T-17 partir, não durante.

R-03 e R-04 deste relatório são as duas Sugestões do round 1 reconfirmadas, sem mudança de gravidade. Não merecem interromper o ciclo.

**Próximos passos sugeridos:**

- **Commitar T-01 e preencher a coluna Commit do Histórico** (R-01 deste round). Única ação que eu trataria como imediata.
- **Decidir o destino de `site.css` e `site.js` em T-17**, antes de T-17 executar (R-02). A opção de remover os dois e suas referências no layout resolve este achado e duas das pendências de R-04 (round 1) de uma vez.
- **Atualizar o campo `Review:` de T-01** para citar também este round 2, e marcar R-04, R-06 e R-07 como adiados ou abertos no plano — o registro de estado no plano está completo para o round 1 e ainda não conhece o round 2.
- **Corrigir os caminhos de `_Layout.cshtml` e `Componentes/*.cshtml`** em T-17 e T-19, e o marcador `*(novo)*` de `Index.cshtml` em T-22, antes que essas tarefas executem e falhem.
- **Atualizar a lista de regras-gate do critério de T-33** para `RN-10`, `RN-16`, `RN-19`, `RN-34` e `RN-47`, antes da auditoria de fechamento.
- **Adotar `TreatWarningsAsErrors`** em um `Directory.Build.props` (R-03) — quatro linhas, agora que o build está limpo.
- **Considerar `/leanwork-context raiz`** para documentar convenções e completar reviews futuros.
- **Depois dessas correções de plano, T-02 pode iniciar** (`Configurar o DbContext com SQLite`), que é a primeira tarefa de valor de negócio e a primeira dependente de T-01.
