import next from 'eslint-config-next'
import prettier from 'eslint-config-prettier'

const config = [
  ...next,
  prettier,
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**'],
  },
]

export default config
