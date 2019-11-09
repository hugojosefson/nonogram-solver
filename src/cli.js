import { parse } from './api'
import getStdin from 'get-stdin'

(async () => {
  parse(await getStdin())
})()
