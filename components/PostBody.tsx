import React from 'react'

import { Content } from 'gymnopedies'
import markdownStyles from './markdown-styles.module.css'

type Props = {
  content: string
}

const PostBody: React.FC<Props> = ({ content }) => {
  return (
    <Content>
      <div
        className={markdownStyles.markdown}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </Content>
  )
}

export default PostBody
