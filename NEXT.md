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

| Variable                | Purpose                                                                                                                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BLOB_READ_WRITE_TOKEN` | Injected by the Vercel Blob integration. When it is missing the feed builds with an empty state, except on the dev server (`npm run dev`), which shows about twenty mock ideas instead. |
| `IDEAS_BLOB_ACCESS`     | `public` or `private`, matching how the Blob store was created. Defaults to `private`.                                                                                                  |
| `IDEAS_POST_SECRET`     | Shared secret for `POST /api/ideas`. Production only, marked Sensitive. When it is missing every write is rejected.                                                                     |

The mock ideas live in `lib/ideas/mock.ts` and cover the Markdown the feed renders (headings, lists, code, tables, quotes, long unbroken text), so the pages can be styled without store access. Once `.env.local` provides a token, the dev server reads the real store instead. Writes always need the token, so the mock never reaches a store.

### Posting an idea

`POST /api/ideas` appends one idea and regenerates `/ideas` and the new idea's page `/ideas/<id>`. Keep the secret in a shell variable rather than typing it into the command:

```bash
curl -sS -X POST https://shoota.work/api/ideas \
  -H "Authorization: Bearer $IDEAS_POST_SECRET" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Title","body":"Markdown body"}'
```

An idea has a `title` (plain text) and a `body` (Markdown). Both are nullable in the stored data, but the API requires a title on every post and edit. The title is stored on one line: runs of whitespace, line breaks included, collapse into one space and the ends are trimmed, and the result may be at most 100 characters. The body is optional: a missing, `null`, or blank body is stored as `null`, anything else is kept exactly as sent. Ideas saved before titles existed have no `title` in the snapshot (read as `null`); they stay readable and are fixed by hand or gain a title the next time they are edited.

Responses: `201 { id, createdAt, revalidated }` on success, `401` for a missing or wrong secret, `415` for a non-JSON content type, `400` with `title_required`, `title_too_long`, or `body_invalid` (a body that is not a string) for an invalid field, `413` when the request exceeds 20 KB. `revalidated` is `false` when regenerating either page failed; the idea is saved either way and the pages catch up within an hour.

### Editing and deleting an idea

`PUT /api/ideas/<id>` replaces the title and body of one idea (`id` and `createdAt` never change, `updatedAt` is set to now) and `DELETE /api/ideas/<id>` removes it. Both require the same Bearer secret and regenerate `/ideas` and `/ideas/<id>`; after a delete the detail page becomes a 404.

```bash
curl -sS -X PUT "https://shoota.work/api/ideas/<id>" \
  -H "Authorization: Bearer $IDEAS_POST_SECRET" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Edited","body":"Markdown body"}'

curl -sS -X DELETE "https://shoota.work/api/ideas/<id>" \
  -H "Authorization: Bearer $IDEAS_POST_SECRET"
```

Responses: `200 { id, updatedAt, revalidated }` for PUT and `200 { id, revalidated }` for DELETE, `401` for a missing or wrong secret, `404` for an id that is malformed or does not exist (checked after the secret, so an unauthenticated caller learns nothing about which ids exist), `415` / `400` / `413` for PUT with the same meaning as when posting, `405` for any other method.

Both accept an optional `X-Ideas-Expected-Updated-At: <updatedAt>` header carrying the `updatedAt` you last saw (unquoted). When the idea has changed since, the write is refused with `409 { error: "conflict" }` and nothing is saved; an empty or repeated header is `400`. The admin page always sends it, so a list loaded on one device cannot silently overwrite an edit made on another. Without the header the write goes through unconditionally. This is deliberately not the standard `If-Match` header: Vercel's CDN evaluates `If-Match` against the response ETag and would turn a successful write into a `412` on its way back to the client.

### Snapshot retention

Every save writes a new `ideas/<timestamp>.json`, so after each successful save the API lists the prefix and deletes the snapshots the retention policy (`SNAPSHOT_RETENTION` in `lib/ideas/store.ts`) no longer keeps:

- the newest 5 snapshots are always kept, as a safety net against data loss on the store's side;
- beyond those, a snapshot is deleted once it is 30 days old or older, or falls outside the newest 30.

At one post a week nothing is deleted for about a month, and the store settles at 5 to 30 snapshots. Only the newest snapshot is ever read; the rest are history. If pruning fails the request still succeeds (the new snapshot is already stored) and the failure is only logged; the next save prunes again. For a real backup use the admin page's download button.

### Idea pages

`/ideas/<id>` shows one idea. Ids are generated by the server and must match `[0-9A-Za-z-]` with at most 64 characters; anything else is a 404 without reading the store. Pages for ids created after the last build are rendered on first request (`fallback: 'blocking'`).

### Admin page

`/ideas/new` is a small form for posting from a phone. It is not linked from the navigation and carries `<meta name="robots" content="noindex">`; the path itself is not a secret, the API's Bearer check is the boundary. The page keeps the secret in that browser's `localStorage` (enter it once per device, clear it from the same page) and sends it as the `Authorization` header. The "download snapshot" button calls `GET /api/ideas/snapshot`, which requires the same Bearer secret and returns the latest snapshot as a JSON array, because the Blob store is private and cannot be linked directly.

The form has a required title field and an optional Markdown body field; posting is enabled once the title is filled in.

Once a secret is stored, the page also offers a list of posted ideas (loaded on demand through the same snapshot endpoint, newest first). Each row shows the title and the first line of the body; ideas without a title are marked `(タイトルなし)` and ideas without a body `(本文なし)`. Each row can be edited inline (title and body) or deleted after an inline confirmation; both go through `PUT` / `DELETE /api/ideas/<id>`. Editing an untitled idea requires giving it a title. The list is not refreshed automatically after posting a new idea; use the reload button.

On `/ideas` and `/ideas/<id>` the title is shown above the body as plain text (never as HTML); an idea without a title shows only its timestamp and body, and an idea without a body shows only its timestamp and title. The detail page uses the title as the page title, falling back to the timestamp.

### Tests

Unit tests use [Vitest](https://vitest.dev/), which requires Node.js 22.12 or later. Test files live next to the code they cover as `*.test.ts`, and `vitest.config.ts` resolves the `@/` path alias from `tsconfig.json`.

```bash
npm test
```
