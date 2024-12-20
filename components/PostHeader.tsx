import PostType from '../types/post'

import { PostTitle } from './PostTitle'
import { Content, DateTime, Picture } from 'gymnopedies'

type Props = {
  title: string
  coverImage: PostType['coverImage']
  date: string
}

const PostHeader = ({
  title,
  coverImage: { url, provider, providerUrl },
  date,
}: Props) => {
  return (
    <Content>
      <PostTitle>{title}</PostTitle>
      <Picture
        image={{ src: url, transition: true, height: '20vh' }}
        imageCaption={
          <>
            Photo by{' '}
            <a target='_blank' href={providerUrl} rel='noreferrer'>
              {provider}
            </a>
          </>
        }
      />
      <DateTime dateString={date} />
    </Content>
  )
}

export default PostHeader
