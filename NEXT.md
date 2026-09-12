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

Variables used by the ideas feed (`/ideas`):

| Variable                | Purpose                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `BLOB_READ_WRITE_TOKEN` | Injected by the Vercel Blob integration. When it is missing the feed builds with an empty state.                    |
| `IDEAS_BLOB_ACCESS`     | `public` or `private`, matching how the Blob store was created. Defaults to `private`.                              |
| `IDEAS_POST_SECRET`     | Shared secret for `POST /api/ideas`. Production only, marked Sensitive. When it is missing every write is rejected. |

### Posting an idea

`POST /api/ideas` appends one idea and regenerates `/ideas`. Keep the secret in a shell variable rather than typing it into the command:

```bash
curl -sS -X POST https://shoota.work/api/ideas \
  -H "Authorization: Bearer $IDEAS_POST_SECRET" \
  -H 'Content-Type: application/json' \
  -d '{"body":"# Title\n\nMarkdown body"}'
```

Responses: `201 { id, createdAt, revalidated }` on success, `401` for a missing or wrong secret, `415` for a non-JSON content type, `400` for an empty `body`, `413` when the body exceeds 20 KB.

### Tests

Unit tests use [Vitest](https://vitest.dev/), which requires Node.js 22.12 or later. Test files live next to the code they cover as `*.test.ts`, and `vitest.config.ts` resolves the `@/` path alias from `tsconfig.json`.

```bash
npm test
```
