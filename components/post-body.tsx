import React from 'react'

import markdownStyles from './markdown-styles.module.css'

type Props = {
  content: string
}

const PostBody: React.FC<Props> = ({ content }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={markdownStyles.markdown}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}

export default PostBody
