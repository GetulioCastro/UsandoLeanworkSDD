# Plano de Execução: Painel de Indicadores de Saúde — MVP com dados demonstrativos

**PRD de referência:** `docs/prds/PRD-001-painel-indicadores-saude.md`
**Arquitetura de referência:** `docs/architecture/proposta-arquitetural.md`
**SPEC-UI de referência:** `docs/prototype/SPEC-UI-001-painel-indicadores-saude.md`
**Cliente/Produto:** Projeto de laboratório (autoral) — Etapa 1, dados demonstrativos
**Stack:** .NET 10, ASP.NET Core Razor Pages, EF Core 10 + SQLite, Bootstrap 5, Chart.js local, xUnit
**Autor:** Anderson (via skill `planner-leanwork`)
**Data:** 2026-09-26
**Status:** Rascunho

---

## 1. Resumo executivo

Implementar um painel de leitura de sete indicadores de um serviço de saúde, alimentado por uma fonte
demonstrativa local em SQLite e sem nenhuma integração com o banco real da instituição. A quebra é **horizontal por
camada técnica** — Fundação, Contratos e lógica de leitura, Comparação e estados, Interface, Qualidade — porque a
entrega é uma Etapa 1 autocontida, sem dependência externa e sem necessidade de demonstrabilidade parcial: nada
dentro de um indicador é útil antes do seed existir, e nada no seed é útil antes das telas existirem. Cada tarefa
é uma fatia pequena (1 commit) com critério de aceite verificável, e o plano fecha a matriz
`ADR → RN → CA → UI → T → teste`, com `Telas:` preenchido em todas as tarefas de interface a partir da SPEC-UI.

## 2. Estratégia de entrega

**Modelo de entrega:** incremental por fase, sem feature flag e sem dark launch. Não há bandeira porque não há
produção: a Etapa 1 roda no notebook do autor, sobre arquivo local, e o único "deploy" é abrir a aplicação. Cada
fase é um estado coerente do sistema — dá para parar ao fim de qualquer fase sem deixar nada quebrado.

**Critério geral de "pronto":** os 26 cenários de aceite com interface verificáveis estão verdes, o badge de origem
demonstrativa aparece em toda tela com indicador, a suíte de testes passa, e um humano navigou do login às nove
telas em cada estado previsto na SPEC-UI. `CA-02` é o único cenário sem verificação manual de interface: ele é
verificado por teste de integração sobre o seed.

**Ordem não negociável:** o seed (T-04) vem antes de qualquer query, e o objeto de filtro (T-07) vem antes de
qualquer tela. A reversal de um card com valor errado é sempre resultado de filtro ou de query, nunca de tela.

## 3. Premissas e decisões

> ⚠️ **Premissa:** o SDK .NET 10 e o EF Core 10 estão disponíveis na máquina de desenvolvimento.
> ⚠️ **Premissa:** SQLite roda em arquivo local; os testes de integração usam arquivo temporário por teste, não
> provedor `InMemory` — o `InMemory` não traduz LINQ para SQL e esconderia justamente o problema que este projeto
> precisa enfrentar.
> ⚠️ **Premissa:** Chart.js é versionado localmente no repositório, sem CDN e sem etapa de build de frontend.
> ⚠️ **Premissa:** a data de referência de todo fato é a coluna `DataReferencia` do seed, porque `RN-10` é
> `[PENDENTE]` e a data de referência real ainda não foi descoberta. Se `RN-10` for respondida na Etapa 2, o nome da
> coluna é o ponto de troca.
> ⚠️ **Premissa:** as lacunas 4 a 9 e 11 a 12 da SPEC-UI estão aceitas como fora de escopo da Etapa 1. As lacunas 3 e
> 10 foram decididas com o responsável pelo produto e estão registradas nas decisões abaixo.
> ⚠️ **Premissa:** os valores de cor do wireframe são Direction C proposta, não identidade visual do cliente.

**Decisões técnicas relevantes já tomadas:**

- **Decisão:** solução única em quatro projetos — `PainelIndicadores.Web`, `PainelIndicadores.Application`,
  `PainelIndicadores.Infrastructure` e `PainelIndicadores.Tests` — sem projeto de domínio, porque a lógica de regra
  ainda não existe para morar em um. Promover o que tiver natureza de domínio é trabalho da Etapa 2 —
  *referência: ADR-001, D-01*
- **Decisão:** a fronteira entre o que a tela pode ver e o que existe é o contrato de leitura, não a view. As
  consultas são traduzidas para SQL e executadas no banco, nunca em memória — *referência: ADR-002, ADR-004*
- **Decisão:** a fonte demonstrativa é um arquivo SQLite criado por script de seed versionado, e a aplicação é
  somente leitura sobre ele — *referência: ADR-003, ADR-004*
- **Decisão:** autenticação por cookie do ASP.NET Core Identity com dois papéis, `Gestor` e `Administrador` —
  *referência: ADR-005*
- **Decisão:** gráficos com Chart.js local alimentado por ilhas `<script type="application/json">`, sem npm de
  frontend, sem bundler — *referência: ADR-006*
- **Decisão:** sem cache e sem job incremental; a leitura é sob demanda e o custo é medido — *referência: ADR-007*
- **Decisão:** o rótulo do filtro de Exames permanece **"Médico"**, sem qualificador de função. A atribuição
  semântica — solicitante, executor, responsável ou outra — é `[PENDENTE]` para a Etapa 2, e a tela declara isso. O
  filtro da Etapa 1 agrupa pelo atributo `medico` do conjunto demonstrativo, por coincidência de nomenclatura com a
  palavra usada em `RN-28`; `medicoSolicitante` existe no conjunto e fica sem uso, reservado para a descoberta.
  `RN-28` não foi alterada — *referência: SPEC-UI seção 3, decisão 3*
- **Decisão:** a acessibilidade do MVP é **operabilidade básica** — rótulo associado a todo campo de formulário e toda
  tarefa concluível por teclado, com foco visível. Contraste medido e conformidade formal com WCAG 2.1/2.2 AA
  **não** são exigido na Etapa 1, porque dependem de auditoria e de decisão institucional, e a direção visual ainda
  é proposta — *referência: SPEC-UI seção 3, decisão 4*

## 4. Mapa de dependências

```mermaid
graph TD
    T01[T-01 Solução e projetos] --> T02[T-02 DbContext SQLite]
    T02 --> T03[T-03 Entidades e mapeamento]
    T03 --> T04[T-04 Seed 36 meses]
    T01 --> T05[T-05 Identity e papéis]
    T05 --> T06[T-06 Bloqueio anônimo]

    T01 --> T07[T-07 Objeto de filtro]
    T07 --> T08[T-08 Período anterior equivalente]
    T01 --> T09[T-09 Contratos e DTOs]
    T03 --> T10[T-10 Queries assistenciais]
    T03 --> T11[T-11 Queries financeiras]
    T03 --> T12[T-12 Queries produção e repasse]
    T09 --> T10
    T09 --> T11
    T09 --> T12

    T08 --> T13[T-13 Variação e base zero]
    T10 --> T13
    T11 --> T13
    T12 --> T13
    T10 --> T14[T-14 Agregação dashboard]
    T11 --> T14
    T12 --> T14
    T09 --> T15[T-15 Vazio versus erro]
    T10 --> T15
    T11 --> T15
    T12 --> T15
    T05 --> T16[T-16 Restrição por papel no contrato]
    T12 --> T16
    T09 --> T16

    T06 --> T17[T-17 Layout, navegação e badge]
    T14 --> T19[T-19 Componentes de visualização]
    T13 --> T18[T-18 Componentes de indicador]
    T15 --> T20[T-20 Esqueleto e bloco de estado]
    T18 --> T22[T-22 Tela do painel]
    T19 --> T22
    T20 --> T22
    T17 --> T21[T-21 Tela de login]
    T13 --> T22
    T14 --> T22
    T16 --> T22
    T22 --> T23[T-23 Tela de Atendimentos]
    T18 --> T23
    T19 --> T23
    T23 --> T24[T-24 Telas de Consultas e Exames]
    T24 --> T25[T-25 Tela de Produtividade]
    T16 --> T25
    T25 --> T26[T-26 Telas de Faturamento]
    T26 --> T27[T-27 Tela de Despesas]
    T22 --> T28[T-28 Responsividade e acessibilidade]

    T04 --> T29[T-29 Testes de integração das leituras]
    T29 --> T30[T-30 Testes de integração das telas]
    T17 --> T30
    T21 --> T30
    T28 --> T31[T-31 Revisão de integridade da marcação]
    T30 --> T31
    T13 --> T32[T-32 Logging e duração das consultas]
    T31 --> T33[T-33 Checklist de prontidão e revisão cruzada]
    T32 --> T33
```

## 5. Fases

### Fase 1 — Fundação: solução, dados demonstrativos e acesso

**Objetivo da fase:** ter um banco SQLite populado com 36 meses de dados fictícios e um login com dois papéis.

**Critério de conclusão da fase:** `dotnet run` sobe a aplicação, o seed criou o arquivo, um usuário `Gestor` e um
`Administrador` autenticam, e uma requisição a `/` sem cookie vai para o login.

---

#### T-01 — Criar a solução e os quatro projetos com referências de projeto

- **Status:** Concluído
- **Complexidade:** Baixa
- **Depende de:** nenhuma
- **Implementa:** —
- **Valida:** —
- **Decisões base:** ADR-001 *(solução única em camadas, enforcement por separação de projeto)*
- **Review:** `docs/reviews/REVIEW-T-01-2026-09-26.md` *(round 1, 2026-09-26 — ⚠️ Aprovado com ressalvas; 0 Bloqueantes, 4 Importantes, 2 Sugestões; R-01/R-02/R-03 resolvidos neste plano, R-04/R-06/R-07 abertos)*
- **Camadas/arquivos afetados:**
  - `PainelIndicadores.sln` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/PainelIndicadores.Web.csproj` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Application/PainelIndicadores.Application.csproj` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Infrastructure/PainelIndicadores.Infrastructure.csproj` *(novo)*
  - `tests/PainelIndicadores/PainelIndicadores.Tests/PainelIndicadores.Tests.csproj` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/Program.cs` *(novo)*

**Descrição:** criar a solução e os três projetos de código executável mais o de testes, com as referências
`Application` ← `Infrastructure` ← `Web`, e `Tests` referenciando os três. Nenhum `Domain` — a decisão D-01 é
explícita: hoje não existe regra de negócio com natureza de domínio que justifique o quinto projeto, e criar um
projeto vazio é dívida. Configurar em `Web` o `Microsoft.NET.Sdk.Web` e o `AddRazorPages`, e em `Infrastructure` o
`Microsoft.EntityFrameworkCore.Sqlite`.

**Critério de aceite (testável):**
- [x] `dotnet build` na raiz compila os quatro projetos sem erro nem aviso
- [x] `dotnet test` executa e reporta zero testes, sem falha de descoberta
- [x] `Web` referencia `Infrastructure`, `Infrastructure` referencia `Application`, e nenhum projeto **de produção** referencia `Web` — apenas `Tests` o referencia, para os testes de integração de tela de T-30

**Testes a escrever:**
- *Não aplicável* - tarefa estrutural. A suíte é criada em T-29 e T-30.

**Riscos / pontos de atenção:**
- `.NET 10` em canal de prévia exige `--prerelease` no `dotnet new`; confirmar a versão instalada antes de gerar os
  arquivos de projeto.

**Desvios registrados nesta execução:**

- **Layout dos `.csproj` corrigido no plano.** O plano declarava os `.csproj` achatados em `src/PainelIndicadores/`
  (`X.csproj`) mas todo o código em subpastas por projeto (`X/...`). Um `.csproj` no diretório pai tem glob `**/*.cs`
  sobre as três subpastas, então `Application` e `Infrastructure` compilavam também o código do `Web` — verificado com
  `dotnet msbuild -getItem:Compile`, que listava `Program.cs` e `Pages/*.cshtml.cs` dentro de `Application`. Isso anulava
  o enforcement por separação de projeto da ADR-001. Os quatro `.csproj` passaram para dentro de sua própria subpasta
  (layout padrão do .NET); os ~40 caminhos de código declarados em T-02 a T-32 ficaram corretos sem alteração.
- **`Program.cs` criado fora da lista original**, com autorização do responsável. `Microsoft.NET.Sdk.Web` gera
  `OutputType=Exe` e um projeto Web sem `Program.cs` não compila (CS5001), o que impediria o primeiro critério de aceite.
  Conteúdo mínimo: `CreateBuilder` + `AddRazorPages` + `MapRazorPages` + `Run`. T-04, T-06 e T-32 o editam a partir daqui.
- **Sem `MapStaticAssets()` no `Program.cs`.** O template do SDK 10 inclui esse mapeamento, e ele ficou de fora
  porque o conteúdo mínimo autorizado para T-01 não previa edição de pipeline. `wwwroot` **não** está vazio: o
  `dotnet new webapp` entregou **63 arquivos** de Bootstrap 5 e jQuery em `wwwroot/lib/`, que já atendem à ADR-006
  e passam a ser servidos assim que o mapeamento existir. A introdução de `app.MapStaticAssets();` é responsabilidade
  de **T-17**, primeira tarefa a entregar asset próprio da aplicação — resolvido em `R-03` do
  `docs/reviews/REVIEW-T-01-2026-09-26.md`. T-19 herda o mapeamento ao versionar o Chart.js em
  `wwwroot/vendor/chartjs/`.
- **`dotnet new sln` do SDK 10 cria `.slnx` por padrão.** Gerado com `--format sln` para respeitar o nome declarado.
- **`UnitTest1.cs` do template do xunit removido** — o primeiro critério exige que `dotnet test` reporte zero testes.

**Review e findings (round 1):**

- **Relatório:** `docs/reviews/REVIEW-T-01-2026-09-26.md` — recomendação final ⚠️ **Aprovado com ressalvas**, nenhum Bloqueante. O código de T-01 está correto e a ADR-001 foi verificada mecanicamente (`dotnet msbuild -getItem:Compile` mostra `Application` compilando zero arquivos); as ressalvas são de **texto do plano**, não de código.
- **Contagem:** 6 findings — 0 Bloqueantes, 4 Importantes, 2 Sugestões. **R-01, R-02 e R-03 foram resolvidos neste plano** (ver a coluna Estado abaixo); **R-04, R-06 e R-07 seguem abertos.** A evidência e a sugestão de correção de cada um estão no relatório.
- **`R-05` não é um finding independente.** Foi fundido em `R-01` por descrever o mesmo defeito. O ID fica deliberadamente não utilizado no relatório, para não quebrar as referências a `R-06` e `R-07`.

| Finding | Severidade | Assunto | Tarefas / ADRs relacionadas | Estado |
|---------|-----------|---------|-----------------------------|--------|
| R-01 | 🟡 Importante | Critério 3 é insatisfazível junto com a descrição da própria tarefa | T-01, ADR-001 | **Resolvido** — critério reescrito para distinguir projeto de produção de projeto de teste |
| R-02 | 🟡 Importante | Bloco de desvios afirma que `wwwroot` está vazio, e não está (há 63 arquivos) | T-01, ADR-006 | **Resolvido** — nota corrigida: 63 arquivos de Bootstrap 5 e jQuery preservados, dono apontado como T-17 |
| R-03 | 🟡 Importante | Nenhuma tarefa designada para introduzir `MapStaticAssets()` | T-17, T-19, T-30, ADR-006 | **Resolvido** — T-17 atribuída como dona; `Program.cs` nos arquivos afetados, critério novo em T-17 e teste de regressão em T-30 |
| R-04 | 🟡 Importante | Oito arquivos boilerplate do template sem tarefa dona | T-01, T-17 | Aberto |
| R-06 | 🟢 Sugestão | `TreatWarningsAsErrors` tornaria o critério "sem aviso" invariante do build | T-01 | Aberto |
| R-07 | 🟢 Sugestão | Convenção de pasta de vendor inconsistente entre `lib/` e `vendor/` | T-19, ADR-006 | Aberto |

> **R-01 e R-02 foram corrigidos; R-03 foi resolvido por atribuição.** R-03 é o único que ainda pode produzir falha invisível: sem `MapStaticAssets()`, nenhum CSS ou JS é servido. A responsabilidade foi atribuída a **T-17**, com critério de aceite próprio e teste de regressão em T-30, de modo que a remoção do mapeamento não possa passar despercebida. Nenhuma tarefa foi executada como parte desta resolução.

---

#### T-02 — Configurar o `DbContext` com SQLite e a conexão da fonte demonstrativa

- **Status:** Pendente
- **Complexidade:** Baixa
- **Depende de:** T-01
- **Implementa:** —
- **Valida:** —
- **Decisões base:** ADR-003 *(SQLite como fonte demonstrativa)*, ADR-004 *(somente leitura)*
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Infrastructure/Persistence/PainelIndicadoresContext.cs` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Infrastructure/Persistence/DbContextFactory.cs` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/appsettings.json` *(editado)*

**Descrição:** criar o `DbContext` e a fábrica usada pelo design-time, com a string de conexão apontando para um
arquivo SQLite local. Registrar o `DbContext` com um `IDbContextFactory` no container, para que o seed e os testes
consigam criar o banco sem depender do escopo de requisição. Marcar explicitamente o contexto como somente leitura
para a aplicação, reserving escrita apenas para o seed.

**Critério de aceite (testável):**
- [ ] O banco é criado no arquivo indicado pela configuração ao rodar `dotnet ef database update` ou o seed
- [ ] A resolução de `PainelIndicadoresContext` funciona fora do escopo HTTP, pelo factory
- [ ] Nenhuma entidade de negócio é gravada por código de requisição

**Testes a escrever:**
- *Não aplicável* — tarefa estrutural. A verificação do schema vem em T-03.

**Riscos / pontos de atenção:**
- O arquivo SQLite é artefato local e reconstruível; adicioná-lo ao `.gitignore` desde esta tarefa evita versionar
  dado gerado.

---

#### T-03 — Mapear as seis entidades demonstrativas e suas chaves

- **Status:** Pendente
- **Complexidade:** Média
- **Depende de:** T-02
- **Implementa:** RN-01
- **Valida:** —
- **Decisões base:** ADR-003 *(entidades da fonte demonstrativa)*
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Infrastructure/Persistence/Entidades/Atendimento.cs` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Infrastructure/Persistence/Entidades/Exame.cs` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Infrastructure/Persistence/Entidades/Medico.cs` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Infrastructure/Persistence/Entidades/Convenio.cs` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Infrastructure/Persistence/Entidades/Despesa.cs` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Infrastructure/Persistence/Entidades/Repasse.cs` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Infrastructure/Persistence/Configuracoes/*.cs` *(novos)*

**Descrição:** mapear exatamente as entidades da seção 11.2 do PRD, sem acrescentar coluna. `Atendimento` carrega
data de referência, tipo, sexo, convênio, médico, indicador de particular e valor faturado; `Exame` carrega data de
referência, sexo, convênio, médico e médico solicitante; `Despesa` carrega data, categoria e valor; `Repasse` carrega
data, médico e valor. Nenhuma entidade descreve a instituição real — os nomes são os da fonte demonstrativa, e o
`README` do seed precisa dizer isso de forma explícita.

**Critério de aceite (testável):**
- [ ] As seis entidades existem com os atributos da seção 11.2 do PRD e nenhuma coluna extra
- [ ] As chaves primárias são geradas no seed, não por identidade do banco
- [ ] As migrações geram um schema cujas tabelas correspondem uma a uma às seis entidades

**Testes a escrever:**
- *Unit:* "o schema aplicado contém exatamente as seis tabelas esperadas" — asserção sobre as tabelas do
  `EnsureCreated`, protecting contra entidade acidental.

**Riscos / pontos de atenção:**
- `Exame` tem `Medico` e `MedicoSolicante` como propriedades distintas. Colapsá-las em uma só agora resolve a
  ambiguidade da lacuna 3 da SPEC-UI na Etapa 2 e é o caminho de menor resistência.

---

#### T-04 — Implementar o seed versionado de 36 meses diários

- **Status:** Pendente
- **Complexidade:** Alta
- **Depende de:** T-03
- **Implementa:** RN-01, RN-06
- **Valida:** CA-02
- **Decisões base:** ADR-003 *(seed versionado)*
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Infrastructure/Seed/SeedDemonstrativo.cs` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Infrastructure/Seed/PerfilacaoGerador.cs` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/Program.cs` *(editado)*

**Descrição:** gerar 36 meses de histórico com granularidade diária, em torno de 23 médicos, 5 convênios, 5 tipos de
atendimento, volume diário variável e determinístico. O gerador usa semente fixa, então duas execuções produzem o
mesmo conjunto — isso é o que torna `CA-02` verificável. O volume precisa produzir dezenas de milhares de registros:
é o que exercita filtro, agrupamento, comparação e série histórica ao mesmo tempo. A execução do seed só é
idempotente se o banco já tiver o conjunto.

**Critério de aceite (testável):**
- [ ] `CA-02` verde: o seed cria 36 meses de dados diários com variety de tipo, sexo, convênio e médico, e o total
  fica na ordem de dezenas de milhares de registros
- [ ] Duas execuções com a mesma semente produzem o mesmo conjunto, byte a byte nas somas agregadas
- [ ] Executar o seed duas vezes em sequência não duplica registros nem falha
- [ ] A soma dos atendimentos por médico no período é igual ao total de atendimentos do mesmo período

**Testes a escrever:**
- *Integration:* `Seed_36_meses_diarios_cobre_o_periodo_esperado` — confere a data mínima, a data máxima, a contagem
  de registros e a existência de mais de um valor em cada dimensão (CA-02)
- *Integration:* `Seed_e_idempotente` — roda duas vezes e confere que a contagem não mudou
- *Integration:* `Soma_dos_atendimentos_por_medico_igual_ao_total` — a invariante que o painel vai exibir

**Riscos / pontos de atenção:**
- Popular o SQLite registro a registro com `SaveChanges` por lote é_orders de magnitude mais lento que `InsertRange`
  em blocos; o seed precisa de `AddRange` por lote para não demorar minutos.
- A semente fixa é requisito de `CA-02`, não conveniência: sem ela o cenário não é reproduzível.

> **Ponto de validação humana sugerido:** revisar o volume e a variedade gerados antes de seguir. Todo o plano
> depende de o seed produzir um conjunto que exercite filtro, agrupamento e comparação — um seed magro torna as
> telas seguintes impossíveis de validar.

---

#### T-05 — Configurar o Identity com os papéis `Gestor` e `Administrador`

- **Status:** Pendente
- **Complexidade:** Média
- **Depende de:** T-01
- **Implementa:** RN-17
- **Valida:** —
- **Decisões base:** ADR-005 *(Identity com dois papéis)*
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Web/Areas/Identity/Pages/Account/Login.cshtml` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/Areas/Identity/Pages/Account/Logout.cshtml` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Infrastructure/Seed/SeedUsuarios.cs` *(novo)*

**Descrição:** registrar o Identity com cookie e claims de papel, e criar dois usuários de seed, um por papel, com a
senha em texto no material de demonstração. A tela de login é a do Identity com layout do projeto; não há
registro, nem recuperação de senha, nem tela de gestão de usuários — está fora de escopo por lacuna 4 da SPEC-UI. A
origem dos usuários é o seed, e isso precisa estar escrito em algum lugar visível.

**Critério de aceite (testável):**
- [ ] Um usuário com papel `Gestor` e outro com papel `Administrador` autenticam e a página de origem é preservada
- [ ] O cookie de autenticação carrega a claim de papel correta
- [ ] Não existe rota de registro público nem de recuperação de senha

**Testes a escrever:**
- *Integration:* `Login_com_papeis_distintos_define_a_claim_de_papel` — autentica os dois usuários e compara as
  claims.

**Riscos / pontos de atenção:**
- A senha de seed em texto no repositório é aceitável porque o conjunto é inteiramente demonstrativo, mas a
  senha precisa ser obviamente falsa para não ser confundida com credencial real.

---

#### T-06 — Bloquear acesso anônimo e redirecionar ao login

- **Status:** Pendente
- **Complexidade:** Baixa
- **Depende de:** T-05
- **Implementa:** RN-17
- **Valida:** CA-10
- **Decisões base:** ADR-005 *(exigência de usuário autenticado)*
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Web/Program.cs` *(editado)*

**Descrição:** configurar a política de autorização padrão como exigindo usuário autenticado em toda rota, exceto o
login e o endpoint de acesso negado. O redirecionamento ao login precisa levar a URL de retorno, para que o gestor
caia na tela que pretendia após autenticar.

**Critério de aceite (testável):**
- [ ] `CA-10` verde: uma requisição anônima a qualquer indicador recebe redirecionamento para o login, e não o
  conteúdo do indicador
- [ ] Após autenticar, o usuário é devolvido à URLoriginally requisitada
- [ ] A página de login é a única rota acessível sem cookie

**Testes a escrever:**
- *Integration:* `Requisicao_anonima_a_indicador_redireciona_para_login` (CA-10)
- *Integration:* `Login_devolve_usuario_a_url_de_origem`

**Riscos / pontos de atenção:**
- A pasta `Areas/Identity` precisa ficar fora da exigência de autenticação; exigir o login no próprio login gera
  redirecionamento infinito.

---

### Fase 2 — Contratos de leitura e lógica de consulta

**Objetivo da fase:** transformar filtro e papel em contratos testáveis, com as consultas executadas no banco.

**Critério de conclusão da fase:** os contratos de leitura dos sete indicadores respondem corretamente para um
período com dados, para um período vazio e para uma combinação de filtros sem resultado.

---

#### T-07 — Definir o objeto de filtro e sua normalização de período

- **Status:** Pendente
- **Complexidade:** Média
- **Depende de:** T-01
- **Implementa:** RN-07, RN-08, RN-09
- **Valida:** —
- **Decisões base:** ADR-002 *(contrato de leitura como fronteira)*
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Application/Filtros/FiltroIndicador.cs` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Application/Filtros/NormalizadorPeriodo.cs` *(novo)*

**Descrição:** definir o objeto de filtro com período, dimensões aplicáveis e base de comparação, mais o
normalizador que resolve o período padrão e o intervalo semiaberto em um único ponto. A regra de ouro é que o
normalizador é chamado uma vez por requisição e toda consulta downstream recebe o intervalo já resolvido — é o que
impede que um card e um gráfico da mesma tela discordem sobre o período. A comparação com o ano anterior é um
campo opcional do filtro, não um substituto.

**Critério de aceite (testável):**
- [ ] Sem filtro informado, o período normalizado são os 12 meses encerrados na data corrente
- [ ] O intervalo é semiaberto `[início, fim]` sobre a data de referência do registro
- [ ] Uma data final anterior à inicial é rejeitada com erro de validação explícito
- [ ] O período normalizado é o mesmo para todos os indicadores da mesma requisição

**Testes a escrever:**
- *Unit:* `Periodo_padrao_sao_12_meses_encerrados_na_data_corrente`
- *Unit:* `Intervalo_e_semiaberto_e_inclui_a_data_final`
- *Unit:* `Data_final_anterior_a_inicial_e_rejeitada`
- *Unit:* `Comparacao_com_ano_anterior_e_opcional_e_nao_substitui_a_padrao`

**Riscos / pontos de atenção:**
- "12 meses encerrados na data corrente" é mais direto de calcular por diferença de dias do que por calendário
  mensal; escolher o método errado faz o período variar com meses de tamanhos diferentes entre os dois anos.

---

#### T-08 — Calcular o período anterior equivalente e o do ano anterior

- **Status:** Pendente
- **Complexidade:** Baixa
- **Depende de:** T-07
- **Implementa:** RN-13, RN-15
- **Valida:** CA-08, CA-09
- **Decisões base:** —
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Application/Filtros/CalculadorPeriodoComparacao.cs` *(novo)*

**Descrição:** calcular o período anterior com o mesmo número de dias do período selecionado, encerrando no dia
anterior ao início do selecionado. O período do ano anterior é calculado à parte, como opção adicional, mantendo a
comparação padrão disponível. Ambos sãoRN-13 e RN-15 são comportamento de dashboard decidido nesta entrega, não
regra de negócio do serviço de saúde.

**Critério de aceite (testável):**
- [ ] `CA-08` verde: o período anterior tem o mesmo número de dias e termina no dia anterior ao início do
  selecionado
- [ ] `CA-09` verde: o mesmo período do ano anterior é oferecida como opção adicional, e a opção padrão continua
  disponível
- [ ] Os dois intervalos não se sobrepõem

**Testes a escrever:**
- *Unit:* `Periodo_anterior_tem_o_mesmo_numero_de_dias_e_encerra_no_dia_anterior` (CA-08), incluindo um período que
  atravessa ano bissexto
- *Unit:* `Periodo_do_ano_anterior_nao_sobrepoe_o_selecionado` (CA-09)

**Riscos / pontos de atenção:**
- Aritmética de dia a dia em `DateOnly` diverge da aritmética de `DateTime` em horário de verão; usar `DateOnly`
  desde o começo evita a classe inteira do bug.

---

#### T-09 — Definir os contratos de leitura e os DTOs dos sete indicadores

- **Status:** Pendente
- **Complexidade:** Média
- **Depende de:** T-01
- **Implementa:** —
- **Valida:** —
- **Decisões base:** ADR-002 *(contrato de leitura, DTOs e objeto de filtro)*
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Application/Contratos/Indicadores/*.cs` *(novos)*
  - `src/PainelIndicadores/PainelIndicadores.Application/Contratos/Comum/SerieMensal.cs` *(novo)*

**Descrição:** definir um contrato por indicador, com o valor do período, a variação, as séries e as quebras por
dimensão, mais o papel que os originou. O contrato recebe o papel porque a restrição de dado individual é da
fronteira, e um DTO sem papel não consegue se auto-proteger. Nenhum contrato carrega entidade de EF Core para
cruzamento — é a fronteira que garante que a tela não pergunte à fonte o que ela não deveria ver.

**Critério de aceite (testável):**
- [ ] Sete contratos existem, um por indicador, e nenhum referencia tipo de EF Core
- [ ] Todo contrato que carrega dado individual ou repasse declara o papel que o originou
- [ ] Todo contrato distingue explicitamente valor zero de valor ausente

**Testes a escrever:**
- *Não aplicável* — tarefa estrutural. Os contratos são exercitados em T-29.

**Riscos / pontos de atenção:**
- A distinção entre zero e ausente é a que implementa `RN-12`; se o DTO não a tiver, a tela precisa adivinhá-la e
  vai mostrar "—" onde deveria mostrar `0`.

---

#### T-10 — Implementar as consultas de volume assistencial

- **Status:** Pendente
- **Complexidade:** Alta
- **Depende de:** T-03, T-09
- **Implementa:** RN-11, RN-20, RN-21, RN-24, RN-25, RN-27, RN-28
- **Valida:** —
- **Decisões base:** ADR-002 *(consultas no banco, não em memória)*, ADR-004 *(somente leitura)*
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Infrastructure/Consultas/ConsultaAtendimentos.cs` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Infrastructure/Consultas/ConsultaConsultas.cs` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Infrastructure/Consultas/ConsultaExames.cs` *(novo)*

**Descrição:** implementar as três consultas de volume em LINQ traduzido para SQL, com filtro de período e
dimensões cumulativas por conjunção. Atendimentos conta todos os registros sem exclusão por status; Consultas
conta atendimentos cujo tipo é consulta; Exames conta registros de exame. As dimensões são diferentes por
indicador e essa diferença é requisito: Atendimentos aceita tipo, sexo, convênio e médico; Consultas e Exames não
aceitam tipo, porque o tipo já é fixo. O agrupamento é o mesmo mecanismo usado pelas tabelas de detalhamento.

**Critério de aceite (testável):**
- [ ] A soma das linhas de um agrupamento é igual ao total do indicador para o mesmo filtro
- [ ] Múltiplas dimensões aplicadas simultaneamente restringem o resultado por conjunção
- [ ] Nenhuma consulta executa agregação em memória após materializar o resultado
- [ ] As consultas de Consultas e Exames não aceitam dimensão de tipo de atendimento

**Testes a escrever:**
- *Integration:* `Total_de_atendimentos_conta_todos_os_registros_do_periodo`
- *Integration:* `Filtros_de_categoria_sao_cumulativos_por_conjuncao`
- *Integration:* `Consulta_gerada_vira_SQL_e_nao_roda_em_memoria` — asserção sobre a forma da consulta, para travar a
  decisão de arquitetura
- *Integration:* `Consulta_consultas_fixa_o_tipo_e_recusa_a_dimensao_tipo`

**Riscos / pontos de atenção:**
- `GroupBy` seguido de `Count()` no EF Core costuma ser executado no cliente em versões antigas; a asserção de
  SQL é o que impede a arquitetura de regredir para o provedor `InMemory` por acidente.

---

#### T-11 — Implementar as consultas dos indicadores financeiros

- **Status:** Pendente
- **Complexidade:** Alta
- **Depende de:** T-03, T-09
- **Implementa:** RN-37, RN-39, RN-42, RN-43, RN-45, RN-46
- **Valida:** —
- **Decisões base:** ADR-002, ADR-004
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Infrastructure/Consultas/ConsultaFaturamentoConvenios.cs` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Infrastructure/Consultas/ConsultaFaturamentoParticular.cs` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Infrastructure/Consultas/ConsultaDespesas.cs` *(novo)*

**Descrição:** implementar as três consultas financeiras. Faturamento por convênios agrupa por convênio e aceita
filtro de convênio e tipo; particular agrega apenas o indicador de particular, separado dos convênios, e aceita tipo
e médico; despesas soma os valores do período e aceita apenas período, sem recorte por sexo, paciente ou médico. A
decisão registrada de adiar a categoria de despesa para a Etapa 2 significa que a consulta de despesas não tem
dimensão de categoria neste momento.

**Critério de aceite (testável):**
- [ ] A participação percentual de cada convênio soma 100% quando o total é diferente de zero
- [ ] Faturamento particular e faturamento por convênios não se sobrepõem: a soma dos dois é o faturamento total
- [ ] A consulta de despesas não aceita dimensão de sexo, paciente ou médico
- [ ] Nenhuma consulta usa carga antecipada de entidade completa

**Testes a escrever:**
- *Integration:* `Participacao_dos_convenios_soma_100_por_cento`
- *Integration:* `Faturamento_particular_nao_entra_no_faturamento_por_convenios`
- *Integration:* `Consulta_de_despesas_soma_apenas_valores_do_periodo`

**Riscos / pontos de atenção:**
- A participação percentual exige o total como denominador; com total zero a resposta não existe e o contrato
  precisa sinalizar "não calculável" em vez de `0%`.

---

#### T-12 — Implementar as consultas de produção médica e de repasse

- **Status:** Pendente
- **Complexidade:** Alta
- **Depende de:** T-03, T-09
- **Implementa:** RN-30, RN-31, RN-32
- **Valida:** —
- **Decisões base:** ADR-002, ADR-004, ADR-005
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Infrastructure/Consultas/ConsultaProducaoMedica.cs` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Infrastructure/Consultas/ConsultaRepasse.cs` *(novo)*

**Descrição:** implementar a contagem de atendimentos por médico no período, com recorte por médico, série mensal e
o Top 6 por volume, mais a consulta de repasse como informação separada. A métrica exibida sob o nome de negócio é
`RN-30` e não é produtividade — a marcação de métrica provisória é obrigatória e a série é por médico, não por
critério de produtividade. A consulta de repasse recebe o papel porque a restrição não pode depender só da tela.

**Critério de aceite (testável):**
- [ ] A métrica é a contagem de atendimentos por médico, sem ponderação por tipo
- [ ] A série mensal existe para cada médico do resultado
- [ ] O Top 6 é ordenado por volume no período e desempata por nome
- [ ] A consulta de repasse não é executada quando o papel não é `Administrador`

**Testes a escrever:**
- *Integration:* `Producao_medica_conta_atendimentos_por_medico_no_periodo`
- *Integration:* `Serie_mensal_tem_um_ponto_por_mes_do_periodo`
- *Integration:* `Top_6_vem_ordenado_por_volume`
- *Integration:* `Repasse_nao_e_consultado_para_o_papel_Gestor`

**Riscos / pontos de atenção:**
- A métrica por médico precisa reconciliar com o total de atendimentos do painel; essa invariante é o que impede
  que o card e a tela de produção contem coisas diferentes.

---

### Fase 3 — Comparação, agregação e estados de retorno

**Objetivo da fase:** fechar o cálculo de variação, o agregado do dashboard e a distinção entre zero e erro.

**Critério de conclusão da fase:** um contrato de indicador completo chega pronto para a tela, com valor, variação,
séries e quebras, nos casos de dado, de zero e de sem resultado para o filtro.

---

#### T-13 — Calcular variação percentual e absoluta, tratando base zero

- **Status:** Pendente
- **Complexidade:** Média
- **Depende de:** T-08, T-10, T-11, T-12
- **Implementa:** RN-12, RN-14
- **Valida:** CA-07, CA-08
- **Decisões base:** —
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Application/Comparacao/CalculadoraVariacao.cs` *(novo)*

**Descrição:** calcular a variação percentual e absoluta contra o período de referência. O caso que precisa de
decisão explícita é o período anterior igual a zero: a variação percentual não existe, e a resposta correta é
"não calculável" com a absoluta ainda exibida. Tratar base zero como `0%` ou como infinito é o erro clássico de
comparação e é o que a tela de estado vazio vai expor primeiro.

**Critério de aceite (testável):**
- [ ] `CA-08` verde: com ambos os períodos não nulos, a variação percentual e a absoluta são calculadas
- [ ] Com período anterior zero, a percentual é marcada como não calculável e a absoluta é exibida
- [ ] `CA-07` verde: período sem registros gera valor `0` e comparação não calculável, não erro

**Testes a escrever:**
- *Unit:* `Variacao_percentual_e_absoluta_calculadas_sobre_periodo_referencia`
- *Unit:* `Periodo_anterior_zero_produz_percentual_nao_calculavel`
- *Unit:* `Periodo_sem_registros_produz_zero_e_nao_erro` (CA-07)

**Riscos / pontos de atenção:**
- Arredondamento: a variação percentual exibida com uma casa precisa ser arredondada na apresentação, não no
  cálculo, senão a soma das quebras não bate com o total exibido.

---

#### T-14 — Implementar a agregação do dashboard: séries, participação e agrupamento

- **Status:** Pendente
- **Complexidade:** Alta
- **Depende de:** T-10, T-11, T-12
- **Implementa:** RN-14, RN-31, RN-37, RN-38
- **Valida:** CA-26
- **Decisões base:** ADR-002 *(agregação no banco)*
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Infrastructure/Consultas/AgregacaoDashboard.cs` *(novo)*

**Descrição:** montar os agregados que a tela do painel e as tabelas de detalhamento consomem: série de atendimentos
por mês, participação por convênio, e o agrupamento por dimensão com a linha de total. A linha de total não é
calculada em memória a partir das linhas — ela vem da mesma consulta, porque a soma das linhas presentation e o
card do total precisam concordar, e duas consultas independentes é a forma mais barata de eles divergirem.

**Critério de aceite (testável):**
- [ ] `CA-26` verde: o painel entrega os sete totais, a série mensal, a participação por convênio e o agrupamento com
  total
- [ ] A linha de total de cada agrupamento coincide com o card do mesmo indicador
- [ ] A participação de cada quebra soma 100% quando o total é diferente de zero
- [ ] A série mensal tem um ponto por mês do período, inclusive meses sem dado, com valor zero

**Testes a escrever:**
- *Integration:* `Linha_de_total_do_agrupamento_igual_ao_card_do_indicador`
- *Integration:* `Serie_mensal_tem_um_ponto_por_mes_inclusive_mes_vazio`
- *Integration:* `Painel_entrega_os_sete_totais_no_mesmo_periodo` (CA-26)

**Riscos / pontos de atenção:**
- Um mês sem dado no meio do período é o caso que faz a linha do gráfico "pular"; a série precisa ser preenchida
  com zero no servidor, não com JavaScript no cliente.

---

#### T-15 — Distinguir resultado vazio, sem resultado de filtro e erro na fronteira

- **Status:** Pendente
- **Complexidade:** Média
- **Depende de:** T-09, T-10, T-11, T-12
- **Implementa:** RN-11, RN-12
- **Valida:** CA-07
- **Decisões base:** ADR-002
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Application/Contratos/Comum/RetornoLeitura.cs` *(novo)*

**Descrição:** definir o envelope de retorno que distingue quatro situações: dado presente, período sem registro,
combinação de filtros sem resultado e falha de fonte. A distinção entre as duas formas de vazio é o que permite à
tela dizer "não há dado no período" e "o período tem dados, mas sua combinação de filtros não retornou" — que são
respostas diferentes para o gestor. Falha de fonte nunca pode chegar como zero.

**Critério de aceite (testável):**
- [ ] As quatro situações são distinguíveis a partir do envelope, sem inspeção do valor
- [ ] Período sem registro retorna valor `0` com comparação não calculável
- [ ] Combinação de filtros sem resultado retorna o total do período, para que a tela possa dizer que há dado
- [ ] Falha de fonte propaga como erro, nunca como envelope de vazio

**Testes a escrever:**
- *Integration:* `Periodo_sem_registro_distinguido_de_combinacao_de_filtros_sem_resultado` (CA-07)
- *Integration:* `Falha_de_fonte_nao_vira_envelope_de_vazio`

**Riscos / pontos de atenção:**
- A tentação de normalizar exceção em `null` no repositório é o caminho mais curto para um bug que só aparece em
  produção: a tela mostra "0 atendimentos" quando a fonte caiu.

---

#### T-16 — Aplicar a restrição de dado individual e repasse no contrato

- **Status:** Pendente
- **Complexidade:** Média
- **Depende de:** T-05, T-09, T-12
- **Implementa:** RN-18
- **Valida:** CA-11, CA-12
- **Decisões base:** ADR-005 *(papéis)*, ADR-002 *(restrição na fronteira, não na view)*
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Application/Papeis/PapelAtual.cs` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Application/Contratos/Indicadores/IndicadorProducaoMedica.cs` *(editado)*

**Descrição:** aplicar a restrição no contrato, e não na view. Para o papel `Gestor`, o contrato de produção médica
não transporta dado individual nem valor de repasse — não "transporta vazio", transporta a marcação de acesso
restrito. A alternativa de popular a view e esconder na renderização foi descartada porque deixa o dado no HTML de
uma página que o gestor não deveria ter recebido.

**Critério de aceite (testável):**
- [ ] `CA-12` verde: o papel `Administrador` recebe dado individual e valores de repasse
- [ ] `CA-11` verde: o papel `Gestor` recebe indicação de acesso restrito e nenhum valor, inclusive no HTML
- [ ] A consulta de repasse não é executada para o `Gestor`
- [ ] A tela do gestor continua exibindo a produção agregada, apenas sem o individual

**Testes a escrever:**
- *Integration:* `Administrador_acessa_dado_individual_e_repasse` (CA-12)
- *Integration:* `Gestor_recebe_acesso_restrito_e_nenhum_valor` (CA-11) — asserção sobre o conteúdo do HTML
  renderizado, não apenas sobre o contrato
- *Integration:* `Contrato_do_Gestor_nao_serializa_o_valor_de_repasse`

**Riscos / pontos de atenção:**
- A asserção sobre o HTML é a que pega o vazamento: um contrato corretamente restrito pode vazar por serialização
  de view model ou por campo de layout.

---

### Fase 4 — Interface

**Objetivo da fase:** as nove telas da SPEC-UI, com os 42 estados, sem duplicar implementação de componente.

**Critério de conclusão da fase:** um humano autenticado navega do login às nove telas e alterna cada estado
previsto, vendo o mesmo dado que o contrato devolve.

---

#### T-17 — Implementar layout, navegação superior e badge de origem demonstrativa

- **Status:** Pendente
- **Complexidade:** Média
- **Depende de:** T-06
- **Implementa:** RN-02
- **Valida:** CA-01
- **Decisões base:** ADR-006 *(Chart.js local)*, ADR-005
- **Telas:** UI-01 a UI-09 (todos os estados)
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Web/Shared/_Layout.cshtml` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/Shared/_NavIndicadores.cshtml` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/Shared/_BadgeDemo.cshtml` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/wwwroot/css/painel.css` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/Program.cs` *(editado — recebe `app.MapStaticAssets();`)*

**Descrição:** montar o layout compartilhado com cabeçalho, navegação superior dos sete indicadores, nome e papel do
usuário, ação de sair, e o badge de origem demonstrativa. O badge é requisito de negócio e por isso tem cor reservada
e componente próprio — não é decoração. A navegação é uma partial só, para que adicionar indicador não signifique
editar nove telas.

**Critério de aceite (testável):**
- [ ] `CA-01` verde: toda tela com indicador exibe, de forma visível, o texto "Dados demonstrativos — regras reais
  pendentes de validação"
- [ ] A navegação superior lista os sete indicadores e marca a página atual
- [ ] O cabeçalho mostra o papel do usuário autenticado
- [ ] O badge não aparece na tela de login, que não exibe indicador
- [ ] `app.MapStaticAssets();` está no pipeline e `GET /css/painel.css` responde `200` com `content-type` de CSS —
      **dono: T-17** por `R-03` do `docs/reviews/REVIEW-T-01-2026-09-26.md`. Sem este mapeamento nenhum asset de
      `wwwroot` é servido, e o critério do badge acima pode ser cumprido com a página inteira sem estilo

**Testes a escrever:**
- *Integration:* `Toda_tela_com_indicador_exibe_o_badge_de_origem_demonstrativa` (CA-01) — varre as nove telas
  autenticado e confere presença e texto
- *Integration:* `Tela_de_login_nao_exibe_badge_de_indicador`
- *Manual:* abrir uma tela autenticado e confirmar que o Bootstrap de `wwwroot/lib/` e o `painel.css` são
  aplicados. A suíte de integração que automatiza isso só existe a partir de T-29/T-30

**Riscos / pontos de atenção:**
- O badge precisa sobreviver a qualquer estrutura de layout; se ficar dentro de um bloco condicional, some justamente
  na tela que o gestor mais precisa do aviso.
- **T-17 é a dona de `app.MapStaticAssets()`** (`R-03` do review de T-01). O mapeamento não existia porque o
  `Program.cs` mínimo de T-01 o deixou de fora, e nenhuma tarefa o declarei. Sem ele, `painel.css`, o Bootstrap e o
  Chart.js ficam no disco e não chegam ao navegador: T-17 e T-19 poderiam ser marcadas como concluídas com o arquivo
  no lugar certo e a página sem estilo, o que nenhum critério visual automatizado detectaria. T-04, T-06 e T-32 também
  editam `Program.cs`, mas são tarefas de seed, de autenticação e de logging — nenhuma delas é dona de `wwwroot` nem
  invoca ADR-006, então o mapeamento fica aqui, junto com o layout que o consome. T-19 e T-30 herdam a decisão.

---

#### T-18 — Implementar os componentes reutilizáveis de indicador

- **Status:** Pendente
- **Complexidade:** Média
- **Depende de:** T-13
- **Implementa:** RN-07, RN-08, RN-14, RN-15
- **Valida:** CA-04, CA-05, CA-08, CA-09
- **Decisões base:** —
- **Telas:** UI-02 (default), UI-03 a UI-09 (default)
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Web/Shared/Componentes/CardIndicador.cshtml` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/Shared/Componentes/BarraPeriodo.cshtml` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/Shared/Componentes/BarraFiltros.cshtml` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/Shared/Componentes/ChaveComparacao.cshtml` *(novo)*

**Descrição:** implementar os quatro componentes que se repetem nas oito telas de indicador, a partir da seção 5 da
SPEC-UI. `BarraFiltros` recebe as dimensões declaradas por cada tela, porque o conjunto muda por indicador e essa
diferença é requisito. `CardIndicador` trata valor zero e comparação não calculável, que é a diferença entre `0` e
`—`. A barra de período carrega a ação de "Últimos 12 meses" e a ação de aplicar.

**Critério de aceite (testável):**
- [ ] `CA-04` verde: sem filtro informado, o painel abre nos 12 meses encerrados na data corrente
- [ ] `CA-05` verde: um período explícito restringe todos os indicadores da tela
- [ ] `CA-08` e `CA-09` verdes: a chave de comparação oferece as duas bases, com a padrão selecionada
- [ ] `CardIndicador` exibe `0` com comparação `—` quando o período não tem dado
- [ ] Nenhuma tela replica a marcação do card; todas consomem a partial

**Testes a escrever:**
- *Integration:* `Painel_abre_no_periodo_padrao_de_12_meses` (CA-04)
- *Integration:* `Periodo_explicito_restringe_todos_os_indicadores_da_tela` (CA-05)
- *Integration:* `Card_com_periodo_vazio_exibe_zero_e_comparacao_nao_calculavel`

**Riscos / pontos de atenção:**
- A barra de período precisa submeter por GET com a query string preservada nos demais filtros; sem isso, aplicar
  período limpa a seleção de filtro sem avisar.

---

#### T-19 — Implementar os componentes de visualização com Chart.js local

- **Status:** Pendente
- **Complexidade:** Média
- **Depende de:** T-14
- **Implementa:** —
- **Valida:** CA-22
- **Decisões base:** ADR-006 *(Chart.js local, ilha JSON, sem build step)*
- **Telas:** UI-02 (default), UI-03 a UI-09 (default)
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Web/Shared/Componentes/GraficoLinha.cshtml` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/Shared/Componentes/GraficoBarras.cshtml` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/Shared/Componentes/GraficoDonut.cshtml` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/wwwroot/js/graficos.js` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/wwwroot/vendor/chartjs/` *(novo)*

**Descrição:** implementar os três componentes de gráfico da seção 5 da SPEC-UI, alimentados por ilha
`<script type="application/json">` serializada no servidor. O JavaScript faz duas coisas: ler a ilha e chamar o
Chart.js. Não há bundler, nem npm de frontend, nem passo de build — a biblioteca fica versionada no repositório. O
donut precisa tratar o caso de total zero sem tentar renderizar uma divisão por zero.

**Critério de aceite (testável):**
- [ ] `CA-22` verde: a participação percentual de cada convênio é exibida no donut e na tabela, somando 100%
- [ ] Nenhum gráfico é alimentado por CDN nem por arquivo gerado em build
- [ ] A ilha JSON do gráfico é válida e corresponde ao contrato devolvido
- [ ] Um gráfico com total zero não produz erro de JavaScript nem exibe `0%`

**Testes a escrever:**
- *Integration:* `Grafico_recebe_ilha_JSON_valida_e_correspondente_ao_contrato`
- *Integration:* `Donut_com_total_zero_nao_exibe_participacao` — asserção sobre o HTML renderizado

**Riscos / pontos de atenção:**
- A ilha JSON precisa de escape adequado ao ser embutida em `<script>`; um valor com `</script>` no conteúdo quebra a
  página. Usar serialização com escape de `<` resolve.
- A versão do Chart.js fica fixada no repositório; atualizá-la é tarefa própria, não improviso no meio da sprint.

---

#### T-20 — Implementar esqueleto de carregamento e bloco de estado

- **Status:** Pendente
- **Complexidade:** Baixa
- **Depende de:** T-15
- **Implementa:** RN-12
- **Valida:** CA-07
- **Decisões base:** —
- **Telas:** UI-02 (carregando, vazio, erro), UI-03 a UI-08 (vazioFiltro), UI-09 (carregando, vazio, erro)
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Web/Shared/Componentes/BlocoEstado.cshtml` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/Shared/Componentes/Esqueleto.cshtml` *(novo)*

**Descrição:** implementar o componente que cobre os quatro estados não feliz: vazio, vazio por filtro, erro e
sem permissão, mais o esqueleto de carregamento. Cada estado declara a ação de recuperação — "Tentar novamente"
para erro, "Limpar filtros" para vazio por filtro, retorno ao período padrão para vazio. `.vazio` e `.erro` são
distintos e obrigatórios em toda tela que busca dado: erro nunca aparece como zero.

**Critério de aceite (testável):**
- [ ] `CA-07` verde: período sem dado exibe `0` no card e o bloco de vazio com ação de retorno
- [ ] Período com dado e filtro sem resultado exibe o total do período no texto do bloco
- [ ] Falha de consulta exibe o bloco de erro com "Tentar novamente" e não o bloco de vazio
- [ ] A tela de despesa não tem estado de vazio por filtro, porque não tem filtro além do período

**Testes a escrever:**
- *Integration:* `Periodo_vazio_exibe_zero_e_botao_de_retorno` (CA-07)
- *Integration:* `Filtro_sem_resultado_exibe_o_total_do_periodo_no_texto`
- *Integration:* `Erro_de_consulta_nao_exibe_o_bloco_de_vazio`

**Riscos / pontos de atenção:**
- Um mesmo componente com muitas variantes condicionais fica difícil de manter; a variante entra por parâmetro
  explícito, não por detecção de conteúdo.

---

#### T-21 — Implementar a tela de login

- **Status:** Pendente
- **Complexidade:** Baixa
- **Depende de:** T-17
- **Implementa:** RN-17
- **Valida:** CA-10
- **Decisões base:** ADR-005
- **Telas:** UI-01 (default, validacao, enviando, erroEnvio)
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Web/Areas/Identity/Pages/Account/Login.cshtml` *(editado)*

**Descrição:** ajustar a tela de login do Identity aos quatro estados da SPEC-UI, com os quatro campos de rótulo
associado. Não há link de criar conta nem de recuperar senha, porque não existem essas rotas. A mensagem de
credencial inválida não revela se o e-mail existe.

**Critério de aceite (testável):**
- [ ] `CA-10` verde: sem autenticação, nenhuma tela de indicador é acessível
- [ ] Credencial inválida exibe "E-mail ou senha inválidos" e preserva os valores digitados
- [ ] Falha do serviço de autenticação exibe estado de erro com "Tentar novamente", distinto de credencial inválida
- [ ] Durante o envio, os campos e o botão ficam desabilitados

**Testes a escrever:**
- *Integration:* `Login_invalido_exibe_mensagem_sem_revelar_se_o_email_existe`
- *Integration:* `Login_valido_redireciona_para_a_url_de_origem` (CA-10)

**Riscos / pontos de atenção:**
- Os quatro estados são da SPEC-UI, mas três deles não são estado de página do Identity: precisam ser modelados
  com `ModelState` e uma marca de falha de serviço, não com JavaScript de front.

---

#### T-22 — Implementar a tela do painel com os sete indicadores

- **Status:** Pendente
- **Complexidade:** Média
- **Depende de:** T-13, T-14, T-16, T-17, T-18, T-19, T-20
- **Implementa:** RN-01, RN-14, RN-15, RN-30
- **Valida:** CA-03, CA-26, CA-27
- **Decisões base:** ADR-006
- **Telas:** UI-02 (default)
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Web/Pages/Index.cshtml` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/Pages/Index.cshtml.cs` *(novo)*

**Descrição:** montar o painel com os sete cards, o gráfico de linha de atendimentos, o donut de participação por
convênio e a tabela de resumo. Cada card carrega o link para a tela do seu indicador. O card de produtividade médica
repete a marcação de métrica provisória, porque a tela que explica a métrica é a outra. Nenhum conteúdo da tela é
restrito por papel — dado individual e repasse não aparecem aqui.

**Critério de aceite (testável):**
- [ ] `CA-26` verde: o painel exibe cards, gráficos e tabelas dos sete indicadores
- [ ] `CA-03` verde: o card de produtividade médica declara que a métrica é provisória e não é produtividade
- [ ] Cada card navega para a tela do seu indicador
- [ ] Nenhum dado individual de profissional nem valor de repasse aparece no painel
- [ ] A tela não tem estado de acesso restrito, porque nenhum de seus elementos é restrito

**Testes a escrever:**
- *Integration:* `Painel_exibe_os_sete_indicadores_com_valor_e_variacao` (CA-26)
- *Integration:* `Card_de_produtividade_declara_metrica_provisoria` (CA-03)
- *Integration:* `Cada_card_aponta_para_a_tela_do_seu_indicador`

**Riscos / pontos de atenção:**
- Os sete cards precisam vir de uma única leitura normalizada; sete leituras independentes podem discordar sobre o
  período e produzir um painel que não fecha.

---

#### T-23 — Implementar a tela de Atendimentos

- **Status:** Pendente
- **Complexidade:** Média
- **Depende de:** T-18, T-19, T-20, T-22
- **Implementa:** RN-20, RN-21, RN-22, RN-23
- **Valida:** CA-13, CA-14
- **Decisões base:** —
- **Telas:** UI-03 (default)
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Web/Pages/Indicadores/Atendimentos.cshtml` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/Pages/Indicadores/Atendimentos.cshtml.cs` *(novo)*

**Descrição:** montar a tela de Atendimentos com as quatro dimensões — tipo, sexo, convênio e médico —, o seletor de
agrupamento pelas mesmas quatro dimensões, o card de total com contador de filtros ativos, o donut por sexo e a
tabela agrupada com linha de total. Os avisos de pendência de `RN-22` e `RN-23` aparecem na tela, porque o que não se
sabe sobre o dado precisa ser visível para quem lê o número.

**Critério de aceite (testável):**
- [ ] `CA-13` verde: o total de atendimentos do período é exibido com variação
- [ ] `CA-14` verde: os recortes por tipo, sexo, convênio e médico funcionam e a seleção é cumulativa
- [ ] O seletor de agrupamento oferece as mesmas quatro dimensões dos filtros
- [ ] A linha de total da tabela coincide com o card
- [ ] A tela exibe os avisos de pendência de `RN-22` e `RN-23`

**Testes a escrever:**
- *Integration:* `Total_de_atendimentos_igual_a_soma_das_linhas_do_agrupamento` (CA-13)
- *Integration:* `Cada_dimensao_filtrando_altera_o_total_para_o_valor_esperado` (CA-14)
- *Integration:* `Filtros_aplicados_em_conjuncao_restringem_junto` (CA-14)

**Riscos / pontos de atenção:**
- A tela é a primeira a exercitar quatro dimensões simultâneas; se o agrupamento e o filtro compartilharem
  predicado por engano, o total e a tabela divergem e o bug aparece como "número errado" sem indicação de onde.

---

#### T-24 — Implementar as telas de Consultas e Exames

- **Status:** Pendente
- **Complexidade:** Média
- **Depende de:** T-18, T-19, T-20, T-23
- **Implementa:** RN-24, RN-25, RN-26, RN-27, RN-28, RN-29
- **Valida:** CA-15, CA-16, CA-17
- **Decisões base:** —
- **Telas:** UI-04 (default), UI-05 (default)
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Web/Pages/Indicadores/Consultas.cshtml` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/Pages/Indicadores/Consultas.cshtml.cs` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/Pages/Indicadores/Exames.cshtml` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/Pages/Indicadores/Exames.cshtml.cs` *(novo)*

**Descrição:** as duas telas são estruturalmente iguais e diferem na fonte da consulta e no texto dos avisos, então
compartilham a partial de estrutura em vez de duplicar a página. A diferença de requisito está em `RN-25`: Consultas
não oferece a dimensão de tipo, porque o tipo já é fixo no indicador, e a tela exibe um selo dizendo isso. Exames
aceita sexo, convênio e médico, com o rótulo neutro **"Médico"** — sem qualificador de função — e a tela declara
visivelmente que a atribuição semântica (solicitante, executor, responsável ou outra) é `[PENDENTE]` para a Etapa 2,
conforme a decisão 3 da SPEC-UI. O filtro da Etapa 1 agrupa pelo atributo `medico` do conjunto demonstrativo, por
coincidência de nomenclatura com a palavra de `RN-28`; `medicoSolicitante` fica sem uso, reservado para quando a
semântica for descoberta. `RN-28` **não** foi alterada para atribuir função ao médico — inventá-la violaria `RN-04`.

**Critério de aceite (testável):**
- [ ] `CA-15` verde: o total de consultas do período é exibido com variação
- [ ] `CA-16` verde: a tela de consultas não oferece recorte por tipo de atendimento
- [ ] `CA-17` verde: o total de exames do período é exibido com variação
- [ ] A tela de exames oferece sexo, convênio e médico
- [ ] A tela de consultas exibe o selo de tipo fixo
- [ ] O rótulo do filtro de médico é "Médico", sem qualificador de solicitante, executor ou responsável
- [ ] A tela de exames declara que a atribuição semântica do médico é `[PENDENTE]` para a Etapa 2

**Testes a escrever:**
- *Integration:* `Total_de_consultas_igual_a_soma_das_linhas_do_agrupamento` (CA-15)
- *Integration:* `Tela_de_consultas_nao_oferece_a_dimensao_tipo` (CA-16)
- *Integration:* `Total_de_exames_igual_a_soma_das_linhas_do_agrupamento` (CA-17)
- *Integration:* `Filtro_de_medico_em_exames_usa_rotulo_neutro_e_declara_atribuicao_pendente` — verifica o rótulo
  renderizado e a presença da declaração de pendência na página

**Riscos / pontos de atenção:**
- Reaproveitar a partial entre as duas telas é tentador e correto, mas a partial não pode receber o filtro de tipo
  como opcional — se receber, a dimensão reaparece por acidente em Consultas e quebra `CA-16`.
- O rótulo neutro pode ser lido pelo gestor como afirmação de que a atribuição já foi definida. A declaração
  explícita de pendência na tela existe para impedir essa leitura; se alguém remover a nota para simplificar a
  tela, a tela volta a mentir e este critério de aceite falha.

---

#### T-25 — Implementar a tela de Produtividade médica

- **Status:** Pendente
- **Complexidade:** Alta
- **Depende de:** T-16, T-24
- **Implementa:** RN-18, RN-30, RN-31, RN-32, RN-33, RN-35
- **Valida:** CA-11, CA-12, CA-18, CA-19, CA-20
- **Decisões base:** ADR-005
- **Telas:** UI-06 (default, semPermissao)
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Web/Pages/Indicadores/Produtividade.cshtml` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/Pages/Indicadores/Produtividade.cshtml.cs` *(novo)*

**Descrição:** montar a tela com o aviso de métrica provisória antes de qualquer número, os filtros de período e
médico, o gráfico de linha do Top 6 por volume, o gráfico de barras de distribuição, a tabela mensal por
profissional e a tabela de repasse condicional ao papel. O Top 6 é a decisão registrada: 23 séries no mesmo eixo
ficam ilegíveis, e o filtro de médico é o seletor que isola a série de um profissional. A restrição de repasse é do
elemento, não da tela — o Gestor continua vendo a produção agregada.

**Critério de aceite (testável):**
- [ ] `CA-18` verde: a tela declara que a métrica é provisória e não é produtividade
- [ ] `CA-19` verde: a evolução mensal da métrica é exibida, e o Top 6 vem ordenado por volume
- [ ] `CA-20` verde: o valor de repasse é exibido para o `Administrador` e para nenhum outro papel
- [ ] `CA-11` verde: para o `Gestor`, a seção de repasse é substituída por acesso restrito, sem nenhum valor
- [ ] `CA-12` verde: o `Administrador` recebe dado individual de profissional
- [ ] O aviso de métrica provisória aparece antes de qualquer número, inclusive no estado de carregamento

**Testes a escrever:**
- *Integration:* `Tela_declare_a_metrica_provisoria_antes_dos_numeros` (CA-18)
- *Integration:* `Evolucao_mensal_e_exibida_com_o_Top_6_ordenado_por_volume` (CA-19)
- *Integration:* `Repasse_visivel_para_administrador_e_ausente_para_gestor` (CA-20, CA-11, CA-12)
- *Integration:* `Gestor_continua_vendo_a_producao_agregada`

**Riscos / pontos de atenção:**
- O aviso de métrica provisória é o requisito mais fácil de quebrar por conveniência: se alguém mover o aviso para
  baixo da tabela para "arrumar o layout", `CA-18` falha e a tela volta a apresentar número provisório como
  produtividade.
- A produção agregada por profissional e a série mensal precisam reconciliar com o card; são leituras diferentes e a
  divergência aparece como número que não fecha.

---

#### T-26 — Implementar as telas de Faturamento por convênios e Faturamento particular

- **Status:** Pendente
- **Complexidade:** Média
- **Depende de:** T-18, T-19, T-20, T-25
- **Implementa:** RN-37, RN-38, RN-39, RN-40, RN-41, RN-42, RN-43, RN-44
- **Valida:** CA-21, CA-22, CA-23
- **Decisões base:** —
- **Telas:** UI-07 (default), UI-08 (default)
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Web/Pages/Indicadores/FaturamentoConvenios.cshtml` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/Pages/Indicadores/FaturamentoConvenios.cshtml.cs` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/Pages/Indicadores/FaturamentoParticular.cshtml` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/Pages/Indicadores/FaturamentoParticular.cshtml.cs` *(novo)*

**Descrição:** a tela de convênios traz o total, as barras por convênio, o donut de participação e a tabela com
coluna de participação, e aceita filtro de convênio e tipo — sem sexo e sem médico, porque essas dimensões não têm
significado no faturamento. A tela de particular traz o total e a composição contra convênios, e aceita tipo e
médico. No estado de período sem dado, a participação percentual não é exibida, porque dividir por total zero não
tem resposta.

**Critério de aceite (testável):**
- [ ] `CA-21` verde: o faturamento é agrupado por convênio no período
- [ ] `CA-22` verde: a participação percentual de cada convênio é exibida e soma 100%
- [ ] `CA-23` verde: o faturamento particular é exibido separado do faturamento por convênios
- [ ] Período sem dado não exibe participação percentual
- [ ] Nenhuma das duas telas oferece recorte por sexo

**Testes a escrever:**
- *Integration:* `Faturamento_agrupado_por_convenio_soma_o_total` (CA-21)
- *Integration:* `Participacao_por_convenio_soma_100_por_cento` (CA-22)
- *Integration:* `Faturamento_particular_nao_se_soma_ao_de_convenios` (CA-23)

**Riscos / pontos de atenção:**
- A participação percentual de cada convênio é o mesmo número em três lugares — donut, coluna da tabela e rótulo
  do card. Se cada um arredondar de um jeito, "não fecha".

---

#### T-27 — Implementar a tela de Despesas

- **Status:** Pendente
- **Complexidade:** Baixa
- **Depende de:** T-18, T-19, T-20, T-26
- **Implementa:** RN-45, RN-46
- **Valida:** CA-24, CA-25
- **Decisões base:** —
- **Telas:** UI-09 (default)
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Web/Pages/Indicadores/Despesas.cshtml` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/Pages/Indicadores/Despesas.cshtml.cs` *(novo)*

**Descrição:** montar a tela mais simples do conjunto: período como única dimensão, card de total, média mensal, mês
mais alto e a linha de evolução. A tela declara em texto que não oferece recorte por sexo, paciente nem médico, e
que a composição por categoria fica para a Etapa 2 por decisão registrada — `RN-47` é `[PENDENTE]` e `RN-46` já
condiciona a categoria a "quando a categoria existir". Não há estado de vazio por filtro, porque não existe filtro
além do período.

**Critério de aceite (testável):**
- [ ] `CA-24` verde: as despesas do período são exibidas com variação
- [ ] `CA-25` verde: a tela não oferece recorte por sexo, por paciente nem por médico
- [ ] A tela declara que a categoria de despesa não está disponível e por quê
- [ ] Não existe filtro de categoria nem estado de vazio por filtro nesta tela

**Testes a escrever:**
- *Integration:* `Despesas_do_periodo_sao_exibidas_com_variacao` (CA-24)
- *Integration:* `Tela_de_despesas_nao_oferece_sexo_paciente_nem_medico` (CA-25)
- *Integration:* `Tela_de_despesas_nao_oferece_filtro_de_categoria`

**Riscos / pontos de atenção:**
- A Entity `Despesa` tem coluna de categoria porque `RN-46` a prevê; a tela não oferecê-lo é decisão, e não deve ser
  "corrigido" depois por alguém que leia o schema e ache a coluna órfã.

---

#### T-28 — Implementar responsividade e a operabilidade básica por teclado

- **Status:** Pendente
- **Complexidade:** Média
- **Depende de:** T-22
- **Implementa:** —
- **Valida:** CA-27
- **Decisões base:** —
- **Telas:** UI-01 a UI-09 (todos os estados)
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Web/wwwroot/css/painel.css` *(editado)*

**Descrição:** fazer a grade de cards e gráficos reorganizar em coluna única abaixo de 900 px, e atender o requisito de
operabilidade básica adotado na decisão 4 da SPEC-UI: rótulo associado a todo campo de formulário e toda tarefa concluível
por teclado, com foco visível. O Bootstrap 5 já entrega rótulo e navegação por teclado na maior parte dos casos, então o
trabalho aqui é **não remover** o que a biblioteca oferece ao escrever markup e CSS customizados, e não adicionar
mecanismo. Contraste medido e conformidade formal com WCAG 2.1/2.2 AA **não** são critério desta tarefa: dependem de
auditoria e de decisão institucional, e a direção visual do wireframe ainda é proposta, não identidade do cliente.

**Critério de aceite (testável):**
- [ ] `CA-27` verde: as nove telas são utilizáveis em largura de desktop e em largura estreita, sem rolagem
  horizontal nem conteúdo sobreposto
- [ ] Todo campo de formulário tem rótulo associado
- [ ] Todo elemento interativo é alcançável por teclado e tem foco visível

**Testes a escrever:**
- *Manual:* percorrer as nove telas em largura estreita e em desktop, conferindo layout, foco e ordem de tabulação
- *Integration:* `Todo_campo_de_formulario_tem_rotulo_associado` — verificação automatizada sobre o HTML
- *Integration:* `Todo_elemento_interativo_e_alcancavel_por_teclado` — verificação automatizada sobre a ordem de
  tabulação e a ausência de `tabindex` positivo indevido

**Riscos / pontos de atenção:**
- A grade de cards em coluna única empurra a linha do gráfico para fora da dobra; a altura dos cards precisa ser
  limitada para o cartão não dominating a tela inteira no mobile.
- Estilo customizado em `painel.css` pode remover o anel de foco do Bootstrap por aesthetic. Como não há medição de
  contraste na Etapa 1, o foco visível é o único sinal perceptível de posição para quem usa teclado — não remover
  `outline` sem substituto equivalente.

---

### Fase 5 — Qualidade, validação e integridade

**Objetivo da fase:** provar o comportamento por teste automatizado e conferir que nada do conjunto se apresenta
como regra real.

**Critério de conclusão da fase:** suíte verde, com os 26 cenários de interface cobertos por teste ou por ponto de
validação manual registrado, e o checklist de prontidão inteiro verificado.

---

#### T-29 — Escrever os testes de integração dos contratos de leitura

- **Status:** Pendente
- **Complexidade:** Média
- **Depende de:** T-04
- **Implementa:** —
- **Valida:** CA-02, CA-06, CA-07, CA-08, CA-13, CA-14, CA-15, CA-16, CA-17, CA-19, CA-21, CA-22, CA-23, CA-24
- **Decisões base:** ADR-002 *(preferir a costura mais alta que já existe — o contrato de leitura)*
- **Camadas/arquivos afetados:**
  - `tests/PainelIndicadores/PainelIndicadores.Tests/Integracao/Contratos/*.cs` *(novos)*

**Descrição:** montar a base de teste de integração: um `WebApplicationFactory` com banco SQLite em arquivo
temporário por teste, seed aplicado uma vez e contrato de leitura como costura de teste. A base é o que torna as
tarefas seguintes triviais, então ela vem antes delas. SQLite em arquivo temporário, nunca `InMemory` — o provedor
em memória não traduz LINQ para SQL e um teste verde nele não prova que a consulta roda no banco real.

**Critério de aceite (testável):**
- [ ] A base monta um banco com seed aplicado e o mesmo conjunto em todos os testes
- [ ] Os testes de contrato rodam contra a consulta real, não contra dublê
- [ ] Nenhum teste usa provedor `InMemory`
- [ ] O seed é aplicado uma vez por execução de teste, e o custo é aceitável

**Testes a escrever:**
- *Integration:* `Contrato_de_indicador_sobre_o_seed_produz_o_total_do_periodo`
- *Integration:* `Total_do_agrupamento_igual_ao_card` — a invariante de T-14

**Riscos / pontos de atenção:**
- Sem banco compartilhado entre testes, cada um paga o seed; com 30 testes isso vira minutos. A base precisa
  reaproveitar o arquivo do seed entre testes de leitura, que não escrevem nada.

---

#### T-30 — Escrever os testes de integração das telas e do acesso por papel

- **Status:** Pendente
- **Complexidade:** Média
- **Depende de:** T-17, T-21, T-29
- **Implementa:** —
- **Valida:** CA-01, CA-04, CA-05, CA-07, CA-10, CA-11, CA-12, CA-18, CA-20, CA-26
- **Decisões base:** ADR-005
- **Camadas/arquivos afetados:**
  - `tests/PainelIndicadores/PainelIndicadores.Tests/Integracao/Telas/*.cs` *(novos)*

**Descrição:** testar as telas pelo comportamento observável: a requisição responde, o conteúdo esperado está no
HTML, e o conteúdo proibido não está. O teste de badge varre as nove telas autenticado, porque é o único cenário
que depende de layout compartilhado. O teste de papel compara o HTML dos dois papéis, e não apenas o status, porque
o vazamento que importa é o valor na marcação gerada.

**Critério de aceite (testável):**
- [ ] `CA-01` verde: as nove telas com indicador contêm o texto de origem demonstrativa
- [ ] `CA-10` verde: as nove telas redirecionam usuário anônimo para o login
- [ ] `CA-11` e `CA-12` verdes: o HTML do Gestor não contém nenhum valor de repasse, e o do Administrador contém
- [ ] A tela de produção médica renderiza os dois papéis a partir do mesmo caminho de código
- [ ] `GET /css/painel.css` e `GET /js/graficos.js` respondem `200` — guarda de regressão de `R-03`, cujo dono é T-17

**Testes a escrever:**
- *Integration:* `Nove_telas_exibem_o_badge_de_origem_demonstrativa` (CA-01)
- *Integration:* `Telas_de_indicador_redirecionam_usuario_anonimo` (CA-10)
- *Integration:* `Html_do_gestor_nao_contem_valor_de_repasse` (CA-11)
- *Integration:* `Html_do_administrador_contem_valor_de_repasse` (CA-12)
- *Integration:* `Assets_estaticos_sao_servidos` — faz `GET` de `/css/painel.css` e `/js/graficos.js` e exige
  `200` com `content-type` de CSS/JavaScript. Cobre `R-03` do review de T-01: é o teste que impede a remoção de
  `app.MapStaticAssets();` de passar despercebida, porque nenhum critério de T-17 ou T-19 depende de o arquivo
  estar sendo de fato servido

**Riscos / pontos de atenção:**
- O teste de badge por varredura é o que impede a regressão silenciosa: o badge é requisito e a forma mais comum de
  perdê-lo é mexer no layout sem rodar o teste.

---

#### T-31 — Revisar a integridade da marcação e a ausência de regra apresentada como real

- **Status:** Pendente
- **Complexidade:** Média
- **Depende de:** T-28, T-30
- **Implementa:** RN-01, RN-02, RN-03, RN-04, RN-05, RN-36
- **Valida:** CA-01, CA-03
- **Decisões base:** ADR-003, ADR-004
- **Camadas/arquivos afetados:**
  - `docs/README.md` *(novo)*

**Descrição:** conferir, tela por tela, que nenhum número demonstrativo aparece sem marcação e que nenhum texto
apresenta cálculo demonstrativo como regra do serviço de saúde. Esta tarefa existe porque `RN-03` proíbe a promoção
silenciosa: um cálculo que funciona e tem nome bonito é exatamente o que vai ser copiado para a Etapa 2 como se fosse
regra. O README do projeto registra a origem do conjunto, a lista de regras `[DEMO]`, `[PENDENTE]` e `[VALIDAR]`, e
o caminho para o PRD.

**Critério de aceite (testável):**
- [ ] `CA-01` e `CA-03` verdes: nenhuma tela exibe indicador sem a marcação de origem demonstrativa
- [ ] Nenhum texto de interface apresenta cálculo demonstrativo como regra definitiva do serviço de saúde
- [ ] O README declara a origem demonstrativa do conjunto e lista as regras pendentes
- [ ] Toda regra marcada `[PENDENTE]` aparece registrada como pendência, e nenhuma foi preenchida por suposição
- [ ] Nenhuma métrica demonstrativa foi promovida a nome de negócio definitivo: `RN-05` e `RN-36` continuam em aberto,
  porque `RN-36` só se cumpre após validação numérica contra o dado real, que é Etapa 2

**Testes a escrever:**
- *Integration:* reaproveitar o teste de badge com uma lista explícita de rotas a auditar
- *Manual:* leitura do texto de cada uma das nove telas contra a seção 8 do PRD

**Riscos / pontos de atenção:**
- A tela de produtividade médica é o caso de maior risco: o nome "Produtividade médica" é o nome de negócio real, e
  o número é uma contagem. Sem a marcação de métrica provisória, a tela afirma uma regra que `RN-33` diz não existir.

---

#### T-32 — Implementar logging estruturado e instrumentação de duração das consultas

- **Status:** Pendente
- **Complexidade:** Média
- **Depende de:** T-13
- **Implementa:** —
- **Valida:** —
- **Decisões base:** ADR-007 *(sem cache; instrumentar duração)*
- **Camadas/arquivos afetados:**
  - `src/PainelIndicadores/PainelIndicadores.Infrastructure/Persistencia/InterceptorDuracaoConsulta.cs` *(novo)*
  - `src/PainelIndicadores/PainelIndicadores.Web/Program.cs` *(editado)*

**Descrição:** registrar o tempo de cada consulta e o erro de cada falha, em log estruturado, com o indicador e o
período como contexto. Como `ADR-007` opta por não usar cache, a duração da consulta é a única evidência de que o
modelo de leitura sob demanda aguenta. O log de acesso é separado do log técnico: `RN-19` é `[PENDENTE]` e não existe
exigência de auditoria de acesso, então não se inventa um.

**Critério de aceite (testável):**
- [ ] Cada consulta executada emite uma entrada de log com duração, indicador e período
- [ ] Falha de consulta emite log de erro com a exceção e o contexto do filtro
- [ ] Nenhum log contém dado individual de profissional nem valor de repasse
- [ ] Nenhum log de auditoria de acesso é produzido

**Testes a escrever:**
- *Integration:* `Consulta_emite_log_com_duracao_e_contexto`
- *Integration:* `Falha_de_consulta_emite_log_de_erro`

**Riscos / pontos de atenção:**
- O interceptor de duração registra a consulta por padrão do EF Core; capturar o SQL completo em log pode despejar
  dado no arquivo de log. Manter o SQL fora, ou registrado só em nível de depuração.

---

#### T-33 — Executar o checklist de prontidão e a revisão cruzada dos artefatos

- **Status:** Pendente
- **Complexidade:** Média
- **Depende de:** T-31, T-32
- **Implementa:** RN-01, RN-02
- **Valida:** CA-01, CA-02, CA-26, CA-27
- **Decisões base:** —
- **Camadas/arquivos afetados:**
  - `docs/plans/PLAN-001-painel-indicadores-saude.md` *(editado)*

**Descrição:** percorrer o checklist de prontidão inteiro e conferir a matriz de rastreabilidade
`ADR → RN → CA → UI → T → teste`: toda regra do PRD tem pelo menos uma tarefa, todo cenário com interface tem um
ponto de verificação, e toda tela da SPEC-UI tem tarefa. A conferência é o que fecha a última inconsistência entre os
artefatos, que só aparece quando os cinco existem.

**Critério de aceite (testável):**
- [ ] Toda regra do PRD aparece em pelo menos um campo `Implementa:` de tarefa, ou em "Questões em aberto" quando é
  gate de transição para a Etapa 2 — `RN-05`, `RN-16`, `RN-34` e `RN-36` são desse segundo tipo, por definição
- [ ] Todo cenário com interface aparece em pelo menos um campo `Valida:` ou em um ponto de validação manual
- [ ] Toda tela da SPEC-UI aparece em pelo menos um campo `Telas:`
- [ ] O checklist de prontidão está inteiro verificado
- [ ] O histórico de execução registra as tarefas concluídas com o respective commit

**Testes a escrever:**
- *Não aplicável* — tarefa de conferência documental, não de código.

**Riscos / pontos de atenção:**
- Requisito do PRD sem tarefa é o modo mais silencioso desterilizar a entrega: o código compila, os testes passam, e
  a regra simplesmente não existe. A conferência precisa ser feita contra o PRD, não contra a memória do que foi
  implementado.

## 6. Testes transversais

- [ ] **Smoke end-to-end:** autenticar como `Gestor`, percorrer as sete telas de indicador, confirmar o acesso
  restrito na de produtividade, sair, autenticar como `Administrador`, confirmar o repasse visível
- [ ] **Varredura de estados:** percorrer os 42 estados da SPEC-UI e confirmar que cada um produz a resposta descrita
  na seção 4 da SPEC-UI
- [ ] **Regressão de reconciliação:** o total do painel, a soma das linhas de cada tabela e o card do indicador
  continuam coincidindo para todo filtro
- [ ] **Regressão de marcação:** as nove telas continuam exibindo o texto de origem demonstrativa
- [ ] **Teste de volume:** o seed produz um conjunto na ordem de dezenas de milhares de registros e a tela do painel
  responde com o mesmo orçamento de tempo ao aplicá-lo — é o que valida `RN-06`
- [ ] **Regressão de vazio versus erro:** período sem dado exibe `0`, e falha de fonte exibe erro, nas nove telas

## 7. Checklist de prontidão para produção

O termo "produção" aqui é Etapa 1: não há deploy de produção, há aplicação local. Os itens que dependem de
ambiente compartilhado foram adaptados em vez de marcados como não aplicáveis.

- [ ] Os 27 critérios de aceite do PRD verificados — 26 por teste ou inspeção, `CA-02` por teste de integração
- [ ] Cobertura de testes conforme o padrão adotado, com os contratos de leitura cobertos por teste de integração
- [ ] Code review aprovado por pelo menos 1 par
- [ ] Seed executado e inspecionado: 36 meses, dezenas de milhares de registros, variedade de dimensões
- [ ] Logging estruturado nos pontos críticos, sem dado individual nem valor de repasse no log
- [ ] Nenhuma regra `[PENDENTE]` preenchida por suposição durante a implementação
- [ ] Badge de origem demonstrativa presente nas nove telas com indicador
- [ ] README e documentação interna atualizados, com a lista de regras `[DEMO]`, `[PENDENTE]` e `[VALIDAR]`
- [ ] Validação manual das nove telas por humano, em cada estado previsto na SPEC-UI
- [ ] Matriz `ADR → RN → CA → UI → T → teste` conferida sem lacuna
- [ ] Rollback documentado — neste caso, apagar o arquivo SQLite e reexecutar o seed

## 8. Rollback e contingência

- **Escopo real:** a Etapa 1 não toca o banco da instituição, não grava dado de negócio e não tem ambiente
  compartilhado. Não há migração a reverter nem dado real em risco — `ADR-004` é o que torna isso verdade.
- **Fonte demonstrativa:** o arquivo SQLite é forward-only e reconstruível. O rollback é apagar o arquivo e
  reexecutar o seed, que é determinístico pela semente fixa, então o conjunto volta exatamente ao mesmo estado.
- **Usuários do Identity:** o seed recria os dois usuários de demonstração. Apagar o banco de autenticação apaga
  também os registros técnicos de login, o que é aceitável porque não são dado de negócio.
- **Código:** cada tarefa é uma mudança isolada, então o rollback é reverter o commit correspondente. Não há
  refactor de alto impacto previsto — não há nome de coluna nem tipo compartilhado que este plano renomeie.
- **Se uma regra `[PENDENTE]` for respondida no meio da execução:** o ajuste é na tarefa que implementa a regra
  correspondente, e não nas telas. A matriz de rastreabilidade existe para localizar essa tarefa sem varrer o
  código.

## 9. Pontos de validação humana

- [ ] Após **T-04** (seed gerado) — revisar volume e variedade antes de seguir. Todo o plano depende de o seed
  produzir um conjunto que exercite filtro, agrupamento, comparação e série histórica
- [ ] Após **T-05** (Identity e papéis) — confirmar os dois papéis e as credenciais de demonstração antes de
  construir tela que dependa deles
- [ ] Após **Fase 2** (contratos e consultas prontos) — revisar com o PO os números que os contratos devolvem
  contra o conjunto seedado, antes de expor em tela
- [ ] Antes de **T-27** (tela de Despesas) — confirmar que a remoção do card "Resultado do período" e a ausência
  de filtro de categoria estão aceitas
- [ ] Antes de **T-28** (operabilidade básica) — a decisão 4 da SPEC-UI já está registrada: rótulo associado e tarefa
  concluível por teclado são o requisito do MVP, sem contraste medido e sem certificação formal
- [ ] Após **Fase 4** (telas prontas) — comparar as nove telas implementadas com o wireframe, estado a estado
- [ ] Antes de **T-33** (fechamento) — nenhum cálculo demonstrativo pode ter sido promovido a regra do serviço de
  saúde durante a implementação

## 10. Questões em aberto

- [ ] A data de referência real de cada fato — *responsável: negócio da instituição* — *sem impacto na Etapa 1,
  bloqueia a Etapa 2 inteira* (`RN-10`)
- [ ] O que conta como atendimento, e com que status um registro é excluído — *responsável: negócio* — *bloqueia a
  validação numérica de `RN-20` na Etapa 2* (`RN-22`)
- [ ] A definição real de consulta e de exame — *responsável: negócio* — *bloqueia a validação de `RN-24` e `RN-27`*
  (`RN-26`, `RN-29`)
- [ ] O critério real de produtividade médica e a regra de repasse — *responsável: negócio e financeiro* — *bloqueia
  a substituição da métrica provisória* (`RN-33`, `RN-35`)
- [ ] A composição da produção médica — o que entra na métrica e com que peso — *responsável: negócio* — *bloqueia a
  validação de `RN-30` contra o dado real* (`RN-34`)
- [ ] O significado gerencial de comparar períodos: queda contra período anterior, ou sazonalidade contra o ano
  anterior — *responsável: negócio* — *bloqueia a validação de `RN-13` a `RN-15` como regra do serviço de saúde*
  (`RN-16`)
- [ ] As categorias de despesa e a possibilidade de rateio — *responsável: financeiro* — *bloqueia a categoria na
  tela de Despesas* (`RN-47`)
- [ ] A atribuição semântica do "Médico" no indicador de Exames — solicitante, executor, responsável ou outra função —
  *responsável: negócio* — *não bloqueia a Etapa 1: a tela entrega rótulo neutro e declara a pendência*; bloqueia a
  substituição do filtro demonstrativo pelo dado real (decisão 3 da SPEC-UI, `T-24`)
- [ ] A política institucional real de acesso e a exigência de auditoria — *responsável: governança* — *bloqueia o
  refinamento da restrição por papel* (`RN-19`)
- [ ] Se a instituição exigir conformidade formal com WCAG 2.1/2.2 AA, e não apenas operabilidade básica —
  *responsável: cliente* — *fora do escopo da Etapa 1*; exige auditoria e decisão institucional, e a direção visual
  ainda é proposta (decisão 4 da SPEC-UI, `T-28`)
- [ ] Confirmação da remoção do card "Resultado do período" — *responsável: cliente* — *bloqueia `T-27`*
  (lacuna 12 da SPEC-UI)

## 11. Histórico de execução

| Tarefa | Status | Concluída em | Commit | Observação |
|--------|--------|--------------|--------|------------|
| T-01 | Concluído | 2026-09-26 | — | Build 0 erros / 0 avisos; `dotnet test` exit 0 com zero testes. Desvios autorizados: `Program.cs` criado (necessário ao build) e 4 `.csproj` movidos para subpasta própria. **Review round 1:** `docs/reviews/REVIEW-T-01-2026-09-26.md` — ⚠️ Aprovado com ressalvas, **6 findings**: R-01/R-02/R-03 **resolvidos** (critério 3 reescrito, nota do desvio nº 3 corrigida, `MapStaticAssets()` atribuída a T-17), R-04/R-06/R-07 **abertos**. Detalhes em T-01. |
| T-02 | Pendente | — | — | — |
| T-03 | Pendente | — | — | — |
| T-04 | Pendente | — | — | — |
| T-05 | Pendente | — | — | — |
| T-06 | Pendente | — | — | — |
| T-07 | Pendente | — | — | — |
| T-08 | Pendente | — | — | — |
| T-09 | Pendente | — | — | — |
| T-10 | Pendente | — | — | — |
| T-11 | Pendente | — | — | — |
| T-12 | Pendente | — | — | — |
| T-13 | Pendente | — | — | — |
| T-14 | Pendente | — | — | — |
| T-15 | Pendente | — | — | — |
| T-16 | Pendente | — | — | — |
| T-17 | Pendente | — | — | — |
| T-18 | Pendente | — | — | — |
| T-19 | Pendente | — | — | — |
| T-20 | Pendente | — | — | — |
| T-21 | Pendente | — | — | — |
| T-22 | Pendente | — | — | — |
| T-23 | Pendente | — | — | — |
| T-24 | Pendente | — | — | — |
| T-25 | Pendente | — | — | — |
| T-26 | Pendente | — | — | — |
| T-27 | Pendente | — | — | — |
| T-28 | Pendente | — | — | — |
| T-29 | Pendente | — | — | — |
| T-30 | Pendente | — | — | — |
| T-31 | Pendente | — | — | — |
| T-32 | Pendente | — | — | — |
| T-33 | Pendente | — | — | — |
