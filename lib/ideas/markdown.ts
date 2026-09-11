import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import { remark } from 'remark'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'

/**
 * Renders idea Markdown to HTML. Unlike `lib/markdownToHtml.ts`, which trusts
 * committed blog posts and passes raw HTML through, idea bodies arrive at
 * runtime, so raw HTML is never enabled and the output is sanitized with the
 * GitHub-flavoured default schema.
 */
export async function ideaMarkdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkRehype)
    .use(rehypeSanitize, defaultSchema)
    .use(rehypeStringify)
    .process(markdown)
  return result.toString()
}
