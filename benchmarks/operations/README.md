# multiaddr Benchmark

Benchmarks multiaddr performance during common operations - parsing strings,
encapsulating/decapsulating addresses, turning to bytes, decoding bytes, etc.

## Running the benchmarks

```console
% npm start

> benchmarks-add-dir@1.0.0 start
> npm run build && node dist/src/index.js


> benchmarks-add-dir@1.0.0 build
> aegir build --bundle false

[06:10:56] tsc [started]
[06:10:56] tsc [completed]
┌─────────┬─────────────────────────────────────────┬──────────────┬────────┬───────┬────────┐
│ (index) │ Implementation                          │ ops/s        │ ms/op  │ runs  │ p99    │
├─────────┼─────────────────────────────────────────┼──────────────┼────────┼───────┼────────┤
│ 0       │ 'head'                                  │ '2427997.80' │ '0.00' │ 50000 │ '0.00' │
│ 1       │ '@multiformats/multiaddr-matcher-1.7.2' │ '1098132.24' │ '0.00' │ 50000 │ '0.00' │
└─────────┴─────────────────────────────────────────┴──────────────┴────────┴───────┴────────┘
```
