import { parseHints } from './api'
import getStdin from 'get-stdin'

(async () => {
  const hints = parseHints(await getStdin())
  console.log(hints)
})()
