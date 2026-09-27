# Painel de Indicadores de Saúde

<!-- leanwork-context:start -->

## Resumo

Painel web de leitura de sete indicadores gerenciais de um serviço de saúde — atendimentos, consultas, exames,
produtividade médica, faturamento por convênio, faturamento particular e despesas — com filtros por período e
comparação entre períodos. Esta é a **Etapa 1**: a aplicação roda sobre uma fonte demonstrativa local em SQLite, e a
Etapa 2 (integração com o banco real da instituição) está fora de escopo. Regra de ouro do projeto: nenhum cálculo
demonstrativo é promovido a regra de negócio sem passar por `RN-05`.

## Stack

- **Backend:** .NET 10 (SDK 10.0.204, runtime ASP.NET Core 10.0.8) com ASP.NET Core Razor Pages. Sem SPA, sem Blazor,
  sem mediator, sem projeto de domínio (ADR-001)
- **Frontend:** Bootstrap 5 e Chart.js **versionados localmente**; JavaScript apenas para ler a ilha JSON e desenhar o
  gráfico. Sem npm de frontend, sem bundler, sem etapa de build (ADR-006, restrição do cliente)
- **Banco:** SQLite em arquivo local, via EF Core 10.0.12 com tipos de entidade sem chave. Provedor `InMemory` é
  **proibido** — ele não traduz LINQ para SQL e esconde exatamente o problema que este projeto precisa enfrentar
  (ADR-003)
- **Infra:** nenhuma. Aplicação local no notebook, sem hosting, sem cache, sem fila, sem job em background (ADR-007)
- **Testes:** xUnit 2.9.3, Microsoft.NET.Test.Sdk 17.14.1, coverlet.collector 6.0.4
- **Solução:** três projetos de produção (`Web`, `Application`, `Infrastructure`) mais `Tests`

## Comandos

Verificados neste repositório em 2026-09-26 (SDK 10.0.204):

```bash
# Build — compila os quatro projetos
dotnet build

# Testes — hoje reporta zero testes; a suíte nasce em T-29/T-30
dotnet test

# Rodar local
dotnet run --project src/PainelIndicadores/PainelIndicadores.Web
```

- **Migrations:** ⚠️ não usar `dotnet ef` ainda. A ferramenta global instalada é **8.0.0** e o runtime de EF Core é
  **10.0.12**, e não há manifesto `.config/dotnet-tools.json`. O plano trabalha com `EnsureCreated` (T-02, T-29), não
  com migrations — alinhar a versão da ferramenta antes de introduzir migration.
- **Lint / format:** ⚠️ não há ferramenta de lint ou formatação configurada no repositório. O critério "build sem
  aviso" existe, mas nada o torna invariante — `TreatWarningsAsErrors` foi sugerido e não adotado (R-03, round 2).

## Convenções

- **Contrato de leitura por indicador**, declarado na `Application` e implementado na `Infrastructure` — um contrato
  por indicador de negócio ("faturamento por convênio"), nunca por entidade de banco. Nenhum contrato carrega tipo de
  EF Core, e nenhum DTO sem papel auto-protege: contrato que carrega dado individual ou repasse **declara o papel que
  o originou** (ADR-002)
- **Derivar o contrato do conceito gerencial, não do schema do seed.** Se um método do contrato só faz sentido em
  termo de SQLite, o contrato está errado (R-06)
- **Consulta de indicador em LINQ traduzida para SQL.** SQL cru e função específica de SGBD são proibidos — é o que
  torna a troca de fonte da Etapa 2 real, e não teórica (ADR-003)
- **Normalizar o período uma vez por requisição**, antes de virar filtro; intervalo semiaberto; aritmética de dia em
  `DateOnly`, nunca em `DateTime` (fluxo 7.1 da arquitetura, T-07/T-08)
- **Restrição por papel no contrato, não na view.** `Gestor` não recebe dado individual nem valor de repasse — nem no
  HTML renderizado. "Transporta vazio" não é a resposta; transporta marcação de acesso restrito (ADR-005, T-16)
- **O retorno da leitura enumera quatro situações**: dado presente, período sem registro, combinação de filtros sem
  resultado e falha de fonte. Falha de fonte **nunca** vira zero, e o DTO distingue valor `0` de valor ausente
  (RN-12, T-15)
- **A separação de camadas é por projeto, não por convenção.** O `.csproj` fica dentro da própria subpasta do projeto:
  um `.csproj` no diretório pai tem glob `**/*.cs` sobre as subpastas e anula o enforcement da ADR-001. Verificar com
  `dotnet msbuild <projeto>.csproj -getItem:Compile` — `Application` deve compilar zero arquivos
- **Assets locais e versionados; sem CDN.** `app.MapStaticAssets()` é responsabilidade de **T-17** e tem teste de
  regressão em T-30 — sem ele nenhum arquivo de `wwwroot` é servido, e a falha é visual e silenciosa
- **Testes de integração rodam contra SQLite em arquivo temporário por teste**, nunca contra `InMemory` e nunca
  contra dublê do contrato de leitura. Nomear o teste pelo comportamento observável e citar o cenário:
  `Requisicao_anonima_a_indicador_redireciona_para_login` (CA-10), `Periodo_anterior_zero_produz_percentual_nao_calculavel`
- **Vocabulário de `Status:` da tarefa** é fechado: `Pendente`, `Em andamento`, `Concluído`, `Bloqueado`. O campo
  `Status:` e a coluna Status da tabela de Histórico de execução precisam concordar

## Restrições

- **Stack imposta pelo cliente:** C# / ASP.NET Core / .NET, Razor Pages, Bootstrap 5, JavaScript apenas quando
  necessário. **Sem React ou qualquer outro framework frontend SPA**
- **Banco real:** acesso somente leitura, sem DDL, sem DML, sem tabela de apoio. Nenhum nome de tabela, coluna,
  relacionamento ou regra do banco real pode ser inventado. No banco real, a restrição é imposta pela permissão
  `SELECT` do usuário de banco, não pelo código (ADR-004)
- **Segredos e credenciais** fora do código e fora do Git; connection string em User Secrets do .NET
- **Sem dado clínico identificável de paciente.** Dados de médicos e valores de repasse são de acesso restrito
- **Relatórios existentes são evidência de validação, não regra de negócio**
- **Regras `[DEMO]`, `[PENDENTE]` e `[VALIDAR]` do PRD não podem ser preenchidas por suposição.** Onde há ausência de
  conhecimento, a marca permanece — nenhuma hipótese foi convertida em regra
- **A Etapa 1 não valida desempenho** (R-01): o SQLite é local e rápido por natureza, então número rápido não diz
  que a consulta é boa. Ela serve para detectar consulta patológica, não para satisfazer as metas declaradas
- **Ambiente:** Windows, PowerShell, VS Code. Sem conexão, VPN ou remote desktop com a instituição; sem infraestrutura
  de produção; hospedagem indefinida

## Documentação

- **Arquitetura:** `docs/architecture/proposta-arquitetural.md` — ADRs 001 a 007 na seção 5, C4 nas seções 6.1 a 6.3,
  dívidas conscientes na seção 9, riscos na seção 10
- **PRD:** `docs/prds/PRD-001-painel-indicadores-saude.md` — `RN-XX` (com marca de status) e `CA-XX` em Gherkin
- **SPEC-UI:** `docs/prototype/SPEC-UI-001-painel-indicadores-saude.md` — telas `UI-01` a `UI-09`; wireframe navegável
  em `docs/prototype/wireframe/index.html`
- **Planos:** `docs/plans/PLAN-001-painel-indicadores-saude.md` — tarefas `T-01` a `T-33`, seções 10 e 11
- **Reviews:** `docs/reviews/` — findings `R-XX`. **A numeração reinicia a cada arquivo e a cada round**: citar
  sempre o nome do relatório junto com o ID (`R-01 do round 2` ≠ `R-01 do round 1`)

## Pendências de alinhamento conhecidas

Divergências entre artefatos detectadas em 2026-09-26. **Não decidir nenhuma sem o responsável:**

- **Seed em SQL ou em C#?** ADR-003 e o diagrama 7.2 pedem seed em **script SQL versionado**; T-04 do PLAN-001 descreve `SeedDemonstrativo.cs` + `PerfilacaoGerador.cs`. Decidir antes de T-04.
- **Caminhos de view sem `Pages/`:** T-17 declara `Web/Shared/_Layout.cshtml` e T-19 declara `Web/Shared/Componentes/*.cshtml`, mas o template gerou `Web/Pages/Shared/...`; T-22 marca `Index.cshtml` como `*(novo)*` quando já existe. Bate a próxima vez que T-17/T-19/T-22 executarem.
- **`dotnet ef` desatualizado** (ferramenta 8.0.0 contra EF Core 10.0.12) e sem tool manifest.
- **`lib/` ou `vendor/`:** o template entregou `wwwroot/lib/` (63 arquivos); T-19 declara `wwwroot/vendor/chartjs/`.
- **`site.css` e `site.js` do template sem decisão** (R-02 do round 2): referenciados em `Pages/Shared/_Layout.cshtml:9` e `:48`, passarão a ser servidos quando T-17 introduzir o mapeamento estático, competindo com o `painel.css`.
- **Round 2 do review de T-01 não registrado no plano:** campo `Review:` e tabela de findings de T-01 só conhecem o round 1, e a coluna `Commit` do Histórico está `—` apesar de o commit `0c76774` existir.
- **T-33 audita a lista de regras-gate errada:** declara `RN-05`, `RN-16`, `RN-34`, `RN-36`; o conjunto real sem tarefa é `RN-10`, `RN-16`, `RN-19`, `RN-34`, `RN-47`.

## Como trabalhar neste projeto

Este projeto usa o pipeline SDD Leanwork. Antes de implementar qualquer feature:

1. Verifique se existe um plano em `docs/plans/PLAN-XXX-*.md`
2. Identifique a próxima tarefa pendente sem bloqueio: `Status: Pendente` e todas as tarefas de `Depende de:` com
   `Status: Concluído`
3. Leia a tarefa inteira, incluindo os campos `Implementa:`, `Valida:` e `Decisões base:`
4. Abra os artefatos referenciados:
   - Regras de negócio (`RN-XX`) → o PRD indicado no cabeçalho do plano
   - Critérios de aceite (`CA-XX`) → seção Gherkin do mesmo PRD
   - Decisões arquiteturais (`ADR-XX`) → `docs/architecture/`
   - Telas e estados (`UI-XX`) → a SPEC-UI
5. Respeite os pontos de validação humana marcados no plano
6. Nomeie os testes pelo comportamento observável, em português, citando o `CA-XX` quando houver
7. Atualize o estado ao terminar: campo `Status:` da tarefa (`Pendente` → `Em andamento` → `Concluído`) e uma linha na
   tabela de Histórico de execução, com o commit. O plano é a fonte de verdade do estado — tarefa concluída que
   continua `Pendente` fica invisível para quem retomar o trabalho
8. Execute **uma tarefa por vez** e peça review antes de seguir para a próxima

> Com o plugin Leanwork SDD instalado, `/leanwork-execute` faz os passos 1 a 8 e `/leanwork-review T-XX` faz a
> revisão. Sem o plugin, seguir os passos manualmente — eles não dependem de ferramenta.

<!-- leanwork-context:end -->

<!-- Conteúdo abaixo desta linha é mantido manualmente e não é alterado pela skill context-leanwork. -->
