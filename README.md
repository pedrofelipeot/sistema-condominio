[![CI](https://github.com/pedrofelipeot/sistema-condominio/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/pedrofelipeot/sistema-condominio/actions/workflows/ci.yml)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Geração automática de cobranças

O cron configurado em `vercel.json` chama `/api/cron/gerar-cobrancas` no primeiro dia de cada mês, às 06:00 UTC (03:00 no horário de Brasília). Ele gera as cobranças da competência do mês da execução.

Configure `CRON_SECRET` como variável de ambiente na Vercel com um valor aleatório e forte, nos mesmos ambientes em que o projeto será executado. A rota exige esse segredo no cabeçalho `Authorization: Bearer <CRON_SECRET>`. Não exponha esse valor no frontend nem o versione no repositório.

Em desenvolvimento local, o agendamento da Vercel não executa. Para testar a rota, configure `CRON_SECRET` no ambiente local e faça uma requisição `GET` para `/api/cron/gerar-cobrancas` com o cabeçalho de autorização correspondente.
