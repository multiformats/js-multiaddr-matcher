/* eslint-disable no-console */

import { multiaddr } from '@multiformats/multiaddr'
import { TCP } from '@multiformats/multiaddr-matcher'
import { TCP as TCP_172 } from '@multiformats/multiaddr-matcher-1.7.2'
import { Bench } from 'tinybench'

const ITERATIONS = parseInt(process.env.ITERATIONS ?? '50000')
const MIN_TIME = parseInt(process.env.MIN_TIME ?? '1')
const RESULT_PRECISION = 2

function bench (m: typeof TCP | typeof TCP_172): void {
  const ma = multiaddr('/ip4/127.0.0.1/tcp/1234')

  m.exactMatch(ma)
}

async function main (): Promise<void> {
  const suite = new Bench({
    iterations: ITERATIONS,
    time: MIN_TIME
  })
  suite.add('head', () => {
    bench(TCP)
  })
  suite.add('@multiformats/multiaddr-matcher-1.7.2', () => {
    bench(TCP_172)
  })

  await suite.run()

  console.table(suite.tasks.map(({ name, result }) => {
    if (result?.error != null) {
      console.error(result.error)

      return {
        Implementation: name,
        'ops/s': 'error',
        'ms/op': 'error',
        runs: 'error',
        p99: 'error'
      }
    }

    return {
      Implementation: name,
      'ops/s': result?.hz.toFixed(RESULT_PRECISION),
      'ms/op': result?.period.toFixed(RESULT_PRECISION),
      runs: result?.samples.length,
      p99: result?.p99.toFixed(RESULT_PRECISION)
    }
  }))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
