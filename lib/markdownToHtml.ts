import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import { remark } from 'remark'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'

export default async function markdownToHtml(markdown: string) {
  // const result = await remark().use(remarkGfm).use(remarkHtml).process(markdown)
  const result = await remark()
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkRehype, {
      allowDangerousHtml: true,
    })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(markdown)
  return result.toString()
}
