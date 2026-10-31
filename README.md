# Sistema Condomínio

[![CI](https://github.com/pedrofelipeot/sistema-condominio/actions/workflows/ci.yml/badge.svg)](https://github.com/pedrofelipeot/sistema-condominio/actions/workflows/ci.yml)

Sistema web para a gestão de um condomínio pequeno de bairro, com 20 casas, sem porteiro e sem taxa de condomínio, onde o que se cobra é o **aluguel de cada casa**. Antes dele, as cobranças viviam num caderno e eram feitas pelo WhatsApp.

Um sistema de condomínio não é uma ideia nova. O que importa aqui são as decisões: cada regra foi modelada a partir de como esse condomínio realmente funciona, e não de um CRUD genérico. Por exemplo, não existe rota para criar casa, porque as 20 casas são fixas, e o morador novo não enxerga o histórico do anterior, porque cada período de moradia é registrado à parte. O resto deste README explica essas escolhas e o motivo de cada uma.

**Demo:** https://sistema-condominio-mu.vercel.app

| Perfil  | E-mail | Senha |
| ------- | ------ | ----- |
| Admin   | `testeadmin@teste.com` | `12345678` |
| Morador | `maria@exemplo.com` | `12345678` |

| Login | Painel do admin | Área do morador |
| ----- | --------------- | ------------------------ |
| ![Login](docs/img/login.png) | ![Admin](docs/img/admin.png) | ![Morador](docs/img/morador.png) |

## O que o sistema faz

- **Admin (`/admin`):** lista, busca e edita as casas; cadastra moradores vinculados a uma casa; desliga e admite moradores; registra pagamentos; consulta o histórico completo de cada casa; publica avisos.
- **Morador (`/morador`):** vê as próprias cobranças e pagamentos e lê os avisos, com interface pensada para o celular.
- **Automático:** uma rotina mensal gera as cobranças das casas ocupadas.
- Um único login para os dois perfis, com redirecionamento para a área correta.

## Rodando localmente

**Pré-requisitos:** Node.js (versão LTS recente) e um PostgreSQL (local ou Neon).

```bash
git clone https://github.com/pedrofelipeot/sistema-condominio
cd sistema-condominio
npm install

cp .env.example .env     # preencha as variáveis
npm run db:migrate       # aplica as migrations
npm run db:seed          # cria as 20 casas e os dados iniciais
npm run dev
```

Acesse http://localhost:3000.

Variáveis principais (a lista completa está em `.env.example`):

| Variável | Para que serve |
| -------- | -------------- |
| `DATABASE_URL` | URL do Postgres (no Neon, a URL *pooled*) |
| `DIRECT_URL` | URL direta, usada nas migrations |
| `SESSION_SECRET` | Segredo que assina os tokens de sessão (use um valor longo e aleatório) |
| `CRON_SECRET` | Protege a rota que gera as cobranças mensais |
| `APP_URL` | URL pública, usada nos links de convite |

## Decisões de projeto e por quê

**As 20 casas são fixas e não existe "criar casa".**
Alternativa descartada: um CRUD completo de casas. Motivo: o condomínio tem 20 casas e isso não muda no dia a dia, então o admin só lista, busca e edita. Se uma casa nova um dia existir, é uma operação de manutenção feita direto no banco (seed ou migration), e não uma tela que qualquer admin possa usar por engano.

**Ocupação é uma entidade separada, e a cobrança pertence à casa.**
Alternativa descartada: guardar só o "morador atual" dentro da casa. Motivo: o admin precisa do histórico completo da casa (quem morou, quando, o que foi cobrado), e o morador novo não pode ver nada do anterior. Cada período de moradia é uma Ocupação; a cobrança fica na casa (uma por casa e competência) e o morador só enxerga as cujo vencimento cai dentro do seu período.

**O status da casa (ocupada ou vaga) não é um campo: é inferido pela existência de uma ocupação ativa.**
Motivo: um campo a mais seria uma segunda fonte de verdade, que poderia ficar inconsistente com as ocupações.

**Convite de uso único para o morador definir a própria senha.**
Alternativa descartada: o admin definir a senha do morador. Motivo: privacidade, para que o admin nunca saiba a senha de ninguém. O envio automático do convite por e-mail ficou de fora por não haver domínio próprio configurado; hoje o admin gera o link e entrega ao morador.

**Sistema interno, sem cadastro público.**
Só o admin cria contas. Não há tela de "criar conta", então não há como alguém de fora se cadastrar.

**Pagamento registrado manualmente pelo admin.**
Parte dos pagamentos é em dinheiro, então o registro manual é necessário de qualquer forma. O sistema gera um QR Code Pix com os dados da conta do condomínio, mas não confirma o pagamento sozinho: isso exigiria um provedor de pagamentos gerando as cobranças Pix e recebendo o dinheiro, o que mudaria o fluxo do condomínio.

**Cobrança única por casa e competência, gerada só para casas ocupadas.**
A unicidade fica no banco, então a geração mensal não consegue duplicar uma cobrança. Casas vagas não recebem cobrança. A rotina mensal roda como cron da Vercel, com a rota protegida por `CRON_SECRET`.

**Um login, duas áreas.**
Em vez de dois sistemas, um login único redireciona para `/admin` ou `/morador` conforme o perfil, e o resto da lógica (cobranças, avisos) é compartilhado.

## Segurança e autorização

- **Autenticação:** senhas com hash (`bcryptjs`) e sessão em JWT assinado (HS256, `jose`) guardado em cookie `httpOnly`, `secure` em produção e `sameSite=lax`, com validade de 7 dias. O JWT evita uma tabela de sessões, mas não é a única fonte de verdade: a cada requisição o sistema confere no banco se o usuário existe e está ativo, e lê o perfil de lá, não do token. Assim, um usuário desativado perde o acesso na hora, sem esperar o token expirar. O custo é uma consulta a mais por requisição, aceitável para este porte. O segredo de assinatura (`SESSION_SECRET`) é obrigatório: sem ele a aplicação nem inicia.
- **Duas camadas de proteção:** o `proxy.ts` redireciona quem não está logado, e cada rota da API verifica o perfil e a propriedade dos dados. Esconder uma tela não protege os dados, então a autorização que vale é a das rotas, e ela tem testes automatizados.
- **Isolamento entre moradores:** o morador só acessa as próprias cobranças, e o novo morador não vê nada do anterior. Um usuário desativado perde o acesso imediatamente.
- **Validação de entrada:** todos os dados que entram pela API passam por schemas Zod (`validators/schemas.ts`). Foi assim que o campo de avisos, que aceitava qualquer conteúdo de qualquer usuário, passou a ter permissão e limite de tamanho.
- **Convite de uso único** para definição de senha e **rota do cron** protegida por segredo.
- **Varredura com OWASP ZAP** nos perfis admin e morador: nenhum alerta de severidade alta. O único ponto fraco encontrado foi justamente a rota de avisos, já corrigida.
- **Dependências:** auditadas com `npm audit`; as vulnerabilidades de severidade alta foram corrigidas. O que resta é de severidade moderada e vem da cadeia de ferramentas de lint, sem relação com o que roda em produção.

## Estratégia de testes

Segui a pirâmide clássica, sem exagero, porque o objetivo era proteger as regras de negócio e não perseguir um número de cobertura:

| Nível | Ferramenta | O que cobre |
| ----- | ---------- | ----------- |
| Unidade | Vitest | Services e validators (ex.: regras de admissão e desligamento) |
| Integração | Vitest + **PostgreSQL real** | Repositories e regras que dependem do banco, como a visibilidade do morador |
| Autorização | Vitest | Cada rota protegida responde corretamente para admin, morador e visitante |
| Ponta a ponta | Playwright | 4 fluxos principais no navegador |
| CI | GitHub Actions | Roda tudo a cada push, em dois jobs (testes e E2E) |

**Por que banco real e não mock:** regras como a unicidade da cobrança e o filtro por período de ocupação vivem no banco. Um mock aceitaria o que o banco recusaria. Os testes usam uma branch separada do Neon, só com o esquema.

**Os testes encontraram bugs de verdade:** um morador podia ter duas ocupações ativas ao mesmo tempo, a geração de cobranças percorria também casas vagas, e duas rotas tinham falhas de autorização. Os testes provaram os problemas e as correções foram feitas depois.

**Fora de propósito:** testes de componentes visuais e testes de carga. Para 20 casas e um sistema formal sem interface sofisticada, o custo não se paga.

## Tecnologias e por quê

| Tecnologia | Por que |
| ---------- | ------- |
| **Next.js 16 + React 19 + TypeScript** | Front e API em um projeto só, com um deploy só. Para 20 casas não faz sentido manter dois serviços. Se o sistema crescesse, a API poderia ser separada. |
| **Tailwind CSS 4** | Estilização rápida e consistente, com um visual sóbrio, adequado a um sistema formal. |
| **PostgreSQL + Prisma 7** | Modelo relacional (casa, ocupação, cobrança) com tipagem de ponta a ponta e migrations versionadas. |
| **Zod** | Valida na borda tudo o que entra pela API e serve de contrato entre front e back. |
| **bcryptjs + jose** | Hash de senha e JWT assinado em cookie `httpOnly`, sem tabela de sessões; o usuário é conferido no banco a cada requisição. |
| **Vitest + Playwright** | Testes rápidos para as regras e testes de navegador para os fluxos críticos. |
| **Vercel + Neon** | Custo zero, Next com deploy nativo, cron incluído e banco em São Paulo. Antes testei o Render, mas a hibernação do plano gratuito deixava o sistema lento para abrir. |

## Estrutura do projeto

```
app/           telas (admin, morador, login) e rotas da API
services/      regras de negócio (ex.: admissão e desligamento de morador)
repositories/  acesso ao banco via Prisma
validators/    schemas Zod
errors/        erros de domínio (AppError)
lib/           utilitários
prisma/        schema, migrations e seeds
tests/         testes unitários, de integração e de autorização
e2e/           testes ponta a ponta (Playwright)
```

O modelo de dados (com diagrama), as regras de negócio e o fluxo do convite estão em [`docs/arquitetura.md`](docs/arquitetura.md).

## Limitações e próximos passos

- **Confirmação automática de pagamento:** hoje o admin marca o pagamento manualmente. Automatizar exigiria um provedor que gere os Pix e notifique o sistema.
- **Convite por e-mail:** depende de ter um domínio próprio para o envio. Hoje o link é gerado e entregue pelo admin.
- **Mais de um condomínio:** exigiria uma tabela `Condominio` agrupando as casas, ajustes na área do admin e, principalmente, filtrar toda consulta e toda autorização por condomínio.
- **Casa nova:** hoje é feita direto no banco, por seed ou migration, de propósito.

## Autor

**Pedro** · [GitHub](https://github.com/pedrofelipeot) · [LinkedIn](www.linkedin.com/in/pedrofelipeot)