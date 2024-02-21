import rehypePrettyCode from 'rehype-pretty-code'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import { remark } from 'remark'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'

// theme: https://github.com/shikijs/textmate-grammars-themes/tree/main/packages/tm-themes
export default async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkRehype, {
      allowDangerousHtml: true,
    })
    .use(rehypeRaw)
    .use(rehypePrettyCode, {
      theme: 'poimandres',
      keepBackground: true,
    })
    .use(rehypeStringify)
    .process(markdown)
  return result.toString()
}
