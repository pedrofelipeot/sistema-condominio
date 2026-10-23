# Tarefa: estilização geral do sistema (visual formal)

## Contexto

Sistema de condomínio em Next.js (App Router), com duas áreas: `/morador` e `/admin`. A organização das telas já está boa e **não deve ser alterada**. O componente `PageHeader` já existe e foi aprovado. Agora o objetivo é dar mais cor, destaque e consistência ao sistema, mantendo um visual **formal e sóbrio**.

## Como usar este arquivo

O trabalho é dividido em **etapas numeradas**. Execute **somente a(s) etapa(s) que eu pedir no prompt**. Ao terminar uma etapa, pare e me avise, para eu conferir o resultado antes de seguir. Não adiante etapas futuras.

## Regras gerais (valem para todas as etapas)

- **Sem gradientes.** Use apenas cores sólidas.
- **Sem ícones decorativos.** Só use ícone quando ele for necessário para entender a ação (e, se usar, pequeno e discreto). Não instale dependências novas.
- **Sem animações ou efeitos chamativos.** Apenas transições simples de hover/foco (`transition-colors`).
- **Não altere** lógica, dados, rotas, textos, nem a estrutura/ordem do conteúdo das páginas.
- **Mantenha consistência:** o mesmo padrão visual para o mesmo tipo de elemento em todas as telas (morador e admin).
- **Acessibilidade:** bom contraste, corpo de texto com no mínimo 16px (`text-base`), foco visível em elementos interativos. Parte dos usuários é idosa.
- Antes de começar, confira como o projeto estiliza (Tailwind v3, v4 ou outro) e onde ficam os componentes, e siga os padrões existentes. Os exemplos abaixo usam classes do Tailwind; adapte se o projeto usar outra abordagem, mantendo o mesmo visual.

## Paleta (referência)

- **Primária:** azul (`blue-700` para botões e destaques, `blue-800` para hover e cabeçalho).
- **Neutros:** `slate` para fundo, bordas e textos.
- **Status (somente para estado, nunca como decoração):**
  - verde: pago / em dia (`emerald`)
  - âmbar: a vencer / atenção (`amber`)
  - vermelho: atrasado / erro / ação perigosa (`red`)

Se o projeto permitir, defina essas cores uma vez como tokens do tema (por exemplo `primary`, `surface`, `border`) em vez de repetir classes em todo lugar. Se isso exigir mudança grande, mantenha as classes diretas e me avise.

---

## Etapa 1: cabeçalho sólido, fundo e cards

**1.1 Cabeçalho (`PageHeader`)**
- Remova o gradiente. Use fundo sólido `bg-blue-800` (ou `bg-slate-900`, se ficar mais sóbrio; escolha um e me diga qual).
- Mantenha título branco, eyebrow, descrição e o badge (ex.: "Casa 1") como estão.

**1.2 Fundo da página**
- Fundo geral das telas: `bg-slate-100` (hoje é quase branco e se confunde com os cards).

**1.3 Cards**
- Fundo branco, `rounded-xl`, `border border-slate-200`, `shadow-sm`.
- Faixa de destaque sutil no topo: `border-t-4 border-t-blue-700`.
- Título do card em `font-semibold text-slate-900`; texto secundário em `text-slate-600` (substitua os cinzas claros que dificultam a leitura).
- Padding interno consistente em todos os cards (`p-6`).
- Quando o texto principal de um card indicar status positivo (ex.: "Em dia"), use `text-emerald-700`. Se houver pendência, use âmbar ou vermelho conforme a situação.

**Pronto quando:** cabeçalho sólido, cards com contraste claro contra o fundo, textos secundários legíveis, nenhuma mudança de conteúdo.

---

## Etapa 2: botões e links de ação

Crie (ou padronize, se já existirem) estilos de botão reutilizáveis:

- **Primário:** `bg-blue-700 hover:bg-blue-800 text-white rounded-lg px-4 py-2 font-medium transition-colors`
- **Secundário:** `bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 rounded-lg px-4 py-2 font-medium transition-colors`
- **Perigoso (excluir, desligar morador etc.):** `bg-red-600 hover:bg-red-700 text-white` com o mesmo formato. Use só em ações destrutivas.
- **Foco visível em todos:** `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2`
- Estado desabilitado: `disabled:opacity-50 disabled:cursor-not-allowed`

Aplicação:
- Os links "Acessar pagamentos" e "Acessar avisos" (e equivalentes) passam a ter aparência de botão secundário com borda e texto azul (`border-blue-700 text-blue-700 hover:bg-blue-50`).
- Ações principais de formulários e telas usam o botão primário.

**Pronto quando:** todos os botões e links de ação seguem os mesmos padrões, com hover e foco visíveis.

---

## Etapa 3: faixa de resumo (Aluguel mensal, Vencimento etc.)

- Rótulo pequeno em maiúsculas (`text-xs font-semibold uppercase tracking-wide text-slate-600`), como já é hoje.
- **Valor maior e mais forte:** `text-xl` ou `text-2xl font-semibold text-slate-900`. Valores em R$ com `tabular-nums`.
- Mesmo padrão de card da Etapa 1 (borda, sombra, fundo branco).
- Se houver informação urgente (ex.: vencimento próximo), pode usar texto âmbar. Sem ícones.
- Aumente o texto muito pequeno (como "Aluguel mensal de R$ 400,00") para pelo menos `text-sm`, de preferência `text-base`.

**Pronto quando:** os valores importantes são os elementos mais legíveis da faixa.

---

## Etapa 4: tabelas e badges de status

**Tabelas** (lista de casas, cobranças, histórico, moradores etc.). Padronize, de preferência com um componente reutilizável:
- Container: `rounded-xl border border-slate-200 bg-white overflow-hidden` (com `overflow-x-auto` interno para telas pequenas).
- Cabeçalho: `bg-slate-50`, células com `px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600`.
- Linhas: `divide-y divide-slate-200`, células com `px-4 py-3 text-slate-800`, `hover:bg-slate-50`. Sem bordas verticais.
- Valores em R$: alinhados à direita, com `tabular-nums`.
- Estado vazio: mensagem centralizada em `text-slate-600` (ex.: "Nenhum registro encontrado") dentro da própria tabela.

**Badges de status.** Um componente `StatusBadge` (ou padronize os existentes), com formato `inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold`:
- Verde: `bg-emerald-50 text-emerald-700` (pago, em dia, ocupada)
- Âmbar: `bg-amber-50 text-amber-700` (a vencer, pendente)
- Vermelho: `bg-red-50 text-red-700` (atrasado, cancelado)
- Neutro: `bg-slate-100 text-slate-700` (vaga, inativo)

Use os mesmos badges em qualquer tela que mostre status, inclusive os já existentes nos cards ("Nenhuma pendência", "8 avisos").

**Pronto quando:** todas as listagens e status do sistema têm o mesmo padrão.

---

## Etapa 5: navegação e formulários

**Navegação**
- Se não existir menu, crie uma barra superior: nome do sistema à esquerda, links à direita (morador: Início, Pagamentos, Avisos; admin: os itens que já existem nas rotas), e botão "Sair".
- Barra em fundo branco com `border-b border-slate-200` ou na cor `blue-800` com texto branco (escolha a que combinar melhor com o cabeçalho e me diga).
- Item da tela atual destacado (ex.: `bg-blue-50 text-blue-700 font-semibold` na barra clara).
- Na área `/admin`, se a organização atual já usa menu lateral, mantenha e estilize com fundo `slate-900`. Não mude a estrutura.

**Formulários** (login, cadastro de morador, edição de casa etc.)
- Label acima do campo: `block text-sm font-medium text-slate-700 mb-1`.
- Input: `w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600`.
- Erro: borda `border-red-500` no campo e mensagem `text-sm text-red-600` logo abaixo.
- Botões de ação do formulário alinhados à direita, com o primário por último.

**Pronto quando:** navegação clara com item ativo e formulários seguindo o mesmo padrão.

---

## Ao terminar cada etapa

Responda com:

1. Os arquivos criados e alterados.
2. Decisões que você tomou diferente do descrito aqui, e o motivo (inclusive as escolhas que pedi para você informar).
3. Qualquer ponto fora do escopo que você notou, **sem aplicar**.

Depois pare e aguarde meu retorno antes de iniciar a próxima etapa.