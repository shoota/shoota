# TypeScript & Styled Components Next.js example

This is a really simple project that show the usage of Next.js with TypeScript and Styled Components.

## Deploy your own

Deploy the example using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/vercel/next.js/tree/canary/examples/with-typescript-styled-components)

## How to use it?

### Using `create-next-app`

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init) or [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/) to bootstrap the example:

```bash
npx create-next-app --example with-typescript-styled-components with-typescript-app
# or
yarn create next-app --example with-typescript-styled-components with-typescript-app
```

### Download manually

Download the example:

```bash
curl https://codeload.github.com/vercel/next.js/tar.gz/canary | tar -xz --strip=2 next.js-canary/examples/with-typescript-styled-components
cd with-typescript-styled-components
```

Install it and run:

```bash
npm install
npm run dev
# or
yarn
yarn dev
```

Deploy it to the cloud with [Vercel](https://vercel.com/import?filter=next.js&utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).

## Notes

This is an amalgamation of the 2 existing examples:

- [with-typescript](https://github.com/vercel/next.js/tree/canary/examples/with-typescript)
- [with-styled-components](https://github.com/vercel/next.js/tree/canary/examples/with-styled-components)

## Local development

### Environment variables

Runtime secrets are managed on Vercel and are not committed to this repository.
Pull them into `.env.local` with the Vercel CLI:

```bash
npx vercel env pull .env.local
```

`.env.local` (and any other `.env*.local` file) is ignored by git. Never commit it, and never paste its contents into an Issue, PR, or log.

### Tests

Unit tests use [Vitest](https://vitest.dev/), which requires Node.js 22.12 or later. Test files live next to the code they cover as `*.test.ts`, and `vitest.config.ts` resolves the `@/` path alias from `tsconfig.json`.

```bash
npm test
```
