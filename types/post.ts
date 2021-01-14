type PostType = {
  slug: string
  title: string
  date: string
  coverImage: {
    url: string
    provider: string
    providerUrl: string
  }
  excerpt: string
  ogImage: {
    url: string
  }
  content: string
}

export default PostType
