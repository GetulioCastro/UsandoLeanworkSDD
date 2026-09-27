# Convenção de contexto do agente — OpenCode

> Este arquivo é o ponto de entrada das regras para o runtime **OpenCode** neste repositório.
> Ele **não** substitui nem duplica `CLAUDE.md`: aponta para ele. Não é gerado pela skill
> `context-leanwork` e não leva os marcadores `<!-- leanwork-context:start/end -->` — quem mantém
> `CLAUDE.md` é `/leanwork-context`.

## Fonte única de verdade

**`CLAUDE.md`, na raiz do repositório, é a única fonte de verdade** de stack, comandos de build e teste,
convenções, restrições e pendências de alinhamento deste projeto.

**Leia `CLAUDE.md` antes de qualquer tarefa** — implementar, revisar, planejar ou responder sobre este
código. As seções Resumo, Stack, Comandos, Convenções, Restrições, Documentação, Pendências de
alinhamento conhecidas e Como trabalhar neste projeto são normativas e obrigatórias.

> **Por que este arquivo existe.** O OpenCode carrega **um único** arquivo de regras por diretório, com
> precedência `AGENTS.md` → `CLAUDE.md`. Com `AGENTS.md` presente, `CLAUDE.md` deixa de ser carregado
> automaticamente — antes ele era, por compatibilidade com Claude Code. Este arquivo restaura o acesso
> ao `CLAUDE.md` de forma explícita, em vez de criar uma segunda cópia dele.
> Fonte: <https://opencode.ai/docs/rules/> — seções "Claude Code Compatibility" e "Precedence".

## Regras de coexistência

- Contexto novo entra **em `CLAUDE.md`**, dentro dos marcadores, via `/leanwork-context raiz`. Não entra aqui.
- Se a mesma informação aparecer nos dois arquivos, **o `CLAUDE.md` prevalece**.
- **Não renomear nem apagar `CLAUDE.md`**: `/leanwork-next`, `/leanwork-review` e `/leanwork-execute`
  procuram esse nome e não conhecem `AGENTS.md`.
- **Não criar `OPENCODE.md`.** O workflow Leanwork instalado não o reconheceria, e seria um terceiro
  arquivo sem dono.

## O que o `CLAUDE.md` não cobre — convenção do OpenCode neste projeto

- **Os comandos do pipeline são custom commands do OpenCode**, definidos em `.opencode/command/*.md`:
  `/leanwork-start`, `/leanwork-next`, `/leanwork-execute`, `/leanwork-review`, `/leanwork-context`,
  `/leanwork-prototype`, `/leanwork-trace`. Não são comandos de terminal — não tente executá-los no shell.
- **Plugin Leanwork SDD habilitado** em `opencode.json` (`enabledPlugins.leanwork-sdd@leanwork`), com as
  skills em `.opencode/skills` (`skills.paths`). Os custom commands invocam as skills correspondentes.
- **O workflow do plugin continua chamando o contexto de `CLAUDE.md`** — em todas as skills e em
  `references/stack-detection.md` do `reviewer-leanwork`, que usa o `CLAUDE.md` da raiz como fonte de
  stack e de padrões. A compatibilidade de nome é intencional e vale manter dos dois lados.
- **Permissões de agente ainda não configuradas:** não existe `.claude/settings.json`. Rodar
  `/leanwork-context permissoes` quando a base amadurecer — a skill calibra pelo que detectar no
  repositório, e hoje quase nada de código existe além do scaffolding de T-01.
- **Ambiente:** Windows, PowerShell, VS Code, .NET SDK 10.0.204. Restrições e comandos em `CLAUDE.md`.
