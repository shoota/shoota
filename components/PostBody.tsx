import { Content } from '@/components/blog/content'
import { GlobalStyles } from '@/components/blog/global-styles'

type Props = {
  content: string
}

const PostBody: React.FC<Props> = ({ content }) => {
  return (
    <Content className='post-body mx-auto max-w-5xl leading-[1.85]'>
      <GlobalStyles scope='.post-body' />
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </Content>
  )
}

export default PostBody
