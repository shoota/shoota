import { handlePostIdea } from '@/lib/ideas/api'

// Next.js reads this export statically, so the values must be literals.
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20kb',
    },
  },
}

export default handlePostIdea
