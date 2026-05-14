import { Content } from '@/components/blog/content'
import { GlobalStyles } from '@/components/blog/global-styles'

type Props = {
  content: string
}

const PostBody: React.FC<Props> = ({ content }) => {
  return (
    <Content className='leading-[1.85]'>
      <GlobalStyles />
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </Content>
  )
}

export default PostBody
