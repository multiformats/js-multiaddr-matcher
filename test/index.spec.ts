/* eslint-env mocha */
import { multiaddr } from '@multiformats/multiaddr'
import { expect } from 'aegir/chai'
import * as mafmt from '../src/index.js'
import type { MultiaddrMatcher } from '../src/index.js'

describe('multiaddr matcher', () => {
  const exactDNS = [
    '/dns/ipfs.io',
    '/dnsaddr/ipfs.io',
    '/dns4/ipfs.io',
    '/dns4/libp2p.io',
    '/dns6/protocol.ai',
    '/dns6/protocol.ai/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79'
  ]

  const goodDNS = [
    ...exactDNS,
    '/dns/ipfs.io/tcp/80',
    '/dnsaddr/ipfs.io/tcp/199/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79',
    '/dns4/ipfs.io/tcp/199/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79/p2p-circuit/p2p/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64'
  ]

  const badDNS = [
    '/ip4/127.0.0.1'
  ]

  const exactIP = [
    '/ip4/0.0.0.0',
    '/ip6/fc00::',
    '/ip6/fe80::8cb1:25ff:fec5:28e3'
    // https://github.com/ChainSafe/is-ip/issues/9
    // '/ip6/fe80::8cb1:25ff:fec5:28e3%llw0'
  ]

  const goodIP = [
    ...exactIP,
    '/ip4/123.123.123.123/tcp/80',
    '/ip6/fe80::1cc1:a3b8:322f:cf22/udp/4921/wss'
    // https://github.com/ChainSafe/is-ip/issues/9
    // '/ip6/fe80::1cc1:a3b8:322f:cf22%utun0/udp/4921/wss'
  ]

  const badIP = [
    '/udp/789/ip6/fc00::'
  ]

  const exactTCP = [
    '/ip4/0.0.7.6/tcp/1234',
    '/ip4/0.0.7.6/tcp/1234/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79',
    '/ip6/::/tcp/0',
    '/dns4/protocol.ai/tcp/80',
    '/dns6/protocol.ai/tcp/80',
    '/dnsaddr/protocol.ai/tcp/80'
  ]

  const goodTCP = [
    ...exactTCP,
    '/ip4/0.0.7.6/tcp/wss',
    '/ip6/::/tcp/0/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79/p2p-circuit/p2p/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
    '/dns4/protocol.ai/tcp/80/webrtc'
  ]

  const badTCP = [
    '/tcp/12345',
    '/ip6/fc00::/udp/5523/tcp/9543',
    '/dns4/protocol.ai'
  ]

  const exactUDP = [
    '/ip4/0.0.7.6/udp/1234',
    '/ip6/::/udp/0'
  ]

  const goodUDP = [
    ...exactUDP,
    '/ip4/0.0.7.6/udp/1234/p2p/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
    '/ip6/::/udp/0/wss'
  ]

  const badUDP = [
    '/udp/12345',
    '/ip6/fc00::/tcp/5523/udp/9543'
  ]

  const exactQUIC = [
    '/ip4/1.2.3.4/udp/1234/quic',
    '/ip6/::/udp/1234/quic'
  ]

  const goodQUIC = [
    ...exactQUIC,
    '/ip4/1.2.3.4/udp/1234/quic/webtransport/certhash/uEiAeP0OEmBbGVTH5Bhnm3WopwRNSQ0et46xNkn2dIagnGw',
    '/dns/google.com/udp/1234/quic/p2p/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64'
  ]

  const badQUIC = [
    '/ip4/0.0.0.0/tcp/12345/quic',
    '/ip6/1.2.3.4/ip4/0.0.0.0/udp/1234/quic',
    '/quic'
  ]

  const exactWS = [
    '/dnsaddr/ipfs.io/ws',
    '/dns4/ipfs.io/ws',
    '/dns6/ipfs.io/ws',
    '/ip4/1.2.3.4/tcp/3456/ws',
    '/ip6/::/tcp/0/ws',
    '/dnsaddr/ipfs.io/ws/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79',
    '/dns4/ipfs.io/ws/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79',
    '/dns6/ipfs.io/ws/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79',
    '/ip4/1.2.3.4/tcp/3456/ws/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79',
    '/ip6/::/tcp/3456/ws/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79'
  ]

  const goodWS = [
    ...exactWS,
    '/ip4/127.0.0.1/tcp/59119/ws/p2p/12D3KooWAzabxK2xhwGQuTUYjbcFT9SZcNvPS1cvj7bPMe2Rh9qF'
  ]

  const exactWSS = [
    '/dnsaddr/ipfs.io/wss',
    '/dns4/ipfs.io/wss',
    '/dns6/ipfs.io/wss',
    '/ip4/1.2.3.4/tcp/3456/wss',
    '/ip6/::/tcp/0/wss',
    '/dnsaddr/ipfs.io/tls/ws',
    '/dns4/ipfs.io/tls/ws',
    '/dns6/ipfs.io/tls/ws',
    '/ip4/1.2.3.4/tcp/3456/tls/ws',
    '/ip6/::/tcp/0/tls/ws',
    '/dnsaddr/ipfs.io/wss/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79',
    '/dns4/ipfs.io/wss/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79',
    '/dns6/ipfs.io/wss/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79',
    '/ip4/1.2.3.4/tcp/3456/wss/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79',
    '/ip6/::/tcp/3456/wss/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79',
    '/dnsaddr/ipfs.io/tls/ws/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79',
    '/dns4/ipfs.io/tls/ws/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79',
    '/dns6/ipfs.io/tls/ws/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79',
    '/ip4/1.2.3.4/tcp/3456/tls/ws/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79',
    '/ip6/::/tcp/3456/tls/ws/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79'
  ]

  const goodWSS = [
    ...exactWSS
  ]

  const badWS = [
    '/ip4/0.0.0.0/tcp/12345/udp/2222/ws',
    '/ip6/::/ip4/0.0.0.0/udp/1234/ws',
    '/ip4/127.0.0.1/tcp/24642/p2p-webrtc-star/ws'
  ]

  const badWSS = [
    '/ip4/0.0.0.0/tcp/12345/udp/2222/wss',
    '/ip6/::/ip4/0.0.0.0/udp/1234/wss',
    '/ip4/127.0.0.1/tcp/24642/p2p-webrtc-star/wss'
  ]

  const goodCircuit = [
    '/ip4/0.0.0.0/tcp/12345/ipfs/QmUjNmr8TgJCn1Ao7DvMy4cjoZU15b9bwSCBLE3vwXiwgj/p2p-circuit/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79',
    '/ip4/0.0.0.0/tcp/12345/p2p-circuit/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79',
    '/dns/example.org/ws/ipfs/QmUjNmr8TgJCn1Ao7DvMy4cjoZU15b9bwSCBLE3vwXiwgj/p2p-circuit/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79',
    '/ip4/1.2.3.4/tcp/3456/wss/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4/p2p-circuit/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79',
    '/ip4/1.2.3.4/tcp/3456/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4/p2p-circuit/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79',
    '/ip4/127.0.0.1/tcp/4002/ipfs/QmddWMcQX6orJGHpETYMyPgXrCXCtYANMFVDCvhKoDwLqA/p2p-circuit/p2p/QmTysQQiTGMdfRsDQp516oZ9bR3FiSCDnicUnqny2q1d79',
    '/ip6/::/tcp/20008/ws/ipfs/QmUjNmr8TgJCn1Ao7DvMy4cjoZU15b9bwSCBLE3vwXiwgj/p2p-circuit/ipfs/QmUjNmr8TgJCn1Ao7DvMy4cjoZU15b9bwSCBLE3vwXiwgj',
    '/ip4/127.0.0.1/tcp/59119/ws/p2p/12D3KooWAzabxK2xhwGQuTUYjbcFT9SZcNvPS1cvj7bPMe2Rh9qF/p2p-circuit/p2p/12D3KooWA6L4J1yRwqLwdXPZBxz3UL4E8pEE6AEhFkqDH5LTQyfq'
  ]

  const badCircuit = [
    '/ip4/0.0.0.0/tcp/12345/udp/2222/wss',
    '/ip4/0.0.7.6/udp/1234',
    '/ip6/::/udp/0/utp',
    '/dnsaddr/ipfs.io/ws',
    '/ip4/1.2.3.4/tcp/3456/http/p2p-webrtc-star'
  ]

  const goodIPFS = [
    ...goodCircuit,
    '/ip4/127.0.0.1/tcp/20008/ws/ipfs/QmUjNmr8TgJCn1Ao7DvMy4cjoZU15b9bwSCBLE3vwXiwgj',
    '/ip4/1.2.3.4/tcp/3456/ws/p2p-webrtc-star/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4',
    '/ip4/127.0.0.1/tcp/9090/http/p2p-webrtc-direct/p2p/QmPj9ZZ6notLfV9khV1FtxH1Goe5sVaUyqgoXrTYQWp382',
    '/ip4/1.2.3.4/tcp/3456/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4',
    '/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4/p2p-circuit',
    '/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4/p2p-circuit/ipfs/QmUjNmr8TgJCn1Ao7DvMy4cjoZU15b9bwSCBLE3vwXiwgj',
    '/ip4/127.0.0.1/tcp/20008/ws/p2p/QmUjNmr8TgJCn1Ao7DvMy4cjoZU15b9bwSCBLE3vwXiwgj',
    '/ip4/1.2.3.4/tcp/3456/ws/p2p-webrtc-star/p2p/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4',
    '/ip4/1.2.3.4/tcp/3456/p2p/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4',
    '/ip4/1.2.3.4/udp/1234/quic/p2p/QmUjNmr8TgJCn1Ao7DvMy4cjoZU15b9bwSCBLE3vwXiwgj',
    '/ipfs/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4',
    '/p2p/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4',
    '/p2p/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4/p2p-circuit',
    '/p2p/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSoooo4/p2p-circuit/p2p/QmUjNmr8TgJCn1Ao7DvMy4cjoZU15b9bwSCBLE3vwXiwgj',
    '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
    '/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
    '/dns6/nyc-2.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64'
  ]

  const goodWebRTCDirect = [
    '/ip4/0.0.0.0/udp/4004/webrtc-direct',
    '/ip4/0.0.0.0/udp/4004/webrtc-direct/certhash/uEiAeP0OEmBbGVTH5Bhnm3WopwRNSQ0et46xNkn2dIagnGw',
    '/ip4/0.0.0.0/udp/4004/webrtc-direct/certhash/uEiAeP0OEmBbGVTH5Bhnm3WopwRNSQ0et46xNkn2dIagnGw/p2p/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
    '/ip4/0.0.0.0/udp/4004/webrtc-direct/certhash/uEiAeP0OEmBbGVTH5Bhnm3WopwRNSQ0et46xNkn2dIagnGw/certhash/uEiAeP0OEmBbGVTH5Bhnm3WopwRNSQ0et46xNkn2dIagnGw/p2p/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64'
  ]

  const badWebRTCDirect = [
    '/ip4/0.0.0.0/tcp/4004/webrtc-direct',
    '/ip4/0.0.0.0/tcp/4004/webrtc-direct/certhash/uEiAeP0OEmBbGVTH5Bhnm3WopwRNSQ0et46xNkn2dIagnGw',
    '/ip4/0.0.0.0/tcp/4004/webrtc-direct/certhash/uEiAeP0OEmBbGVTH5Bhnm3WopwRNSQ0et46xNkn2dIagnGw/p2p/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
    '/ip4/0.0.0.0/tcp/4004/webrtc-direct/certhash/uEiAeP0OEmBbGVTH5Bhnm3WopwRNSQ0et46xNkn2dIagnGw/certhash/uEiAeP0OEmBbGVTH5Bhnm3WopwRNSQ0et46xNkn2dIagnGw/p2p/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64'
  ]

  const goodWebRTC = [
    '/ip4/195.201.24.91/udp/4001/quic-v1/webtransport/certhash/uEiCsrVjg8IHCNqD-5x91Rv6CiOQmvCZBGdjxZQBoFYVo9g/certhash/uEiBdh-sKr7lCAwlJRWkmOM-LwW5jGhqq5J4jM-EEvNLucg/p2p/12D3KooWLBjadARix9eMbThfGjCYTdB3Jq6LZVzkReEYqBCaZPiA/p2p-circuit/webrtc/p2p/12D3KooWHHdY2cWY7HKsTuQeBgDydapRVxy1XGUSzeZXv52vsdav',
    '/ip4/195.201.24.91/udp/4001/quic-v1/webtransport/certhash/uEiCsrVjg8IHCNqD-5x91Rv6CiOQmvCZBGdjxZQBoFYVo9g/certhash/uEiBdh-sKr7lCAwlJRWkmOM-LwW5jGhqq5J4jM-EEvNLucg/p2p/12D3KooWLBjadARix9eMbThfGjCYTdB3Jq6LZVzkReEYqBCaZPiA/p2p-circuit/webrtc',
    '/dnsaddr/example.org/wss/p2p/12D3KooWAzabxK2xhwGQuTUYjbcFT9SZcNvPS1cvj7bPMe2Rh9qF/p2p-circuit/webrtc/p2p/12D3KooWA6L4J1yRwqLwdXPZBxz3UL4E8pEE6AEhFkqDH5LTQyfq',
    '/ip4/127.0.0.1/tcp/59119/ws/p2p/12D3KooWAzabxK2xhwGQuTUYjbcFT9SZcNvPS1cvj7bPMe2Rh9qF/p2p-circuit/webrtc/p2p/12D3KooWA6L4J1yRwqLwdXPZBxz3UL4E8pEE6AEhFkqDH5LTQyfq',
    '/ip4/0.0.0.0/udp/4004/webrtc-direct/certhash/uEiAeP0OEmBbGVTH5Bhnm3WopwRNSQ0et46xNkn2dIagnGw/webrtc',
    '/webrtc'
  ]

  const badWebRTC = [
    '/ip4/0.0.0.0/udp/webrtc',
    '/ip4/0.0.0.0/tcp/12345/udp/2222/wss/webrtc'
  ]

  const goodWebTransport = [
    '/ip4/10.5.0.2/udp/4001/quic-v1/webtransport',
    '/ip4/10.5.0.2/udp/4001/quic-v1/webtransport/p2p/12D3KooWQF6Q3i1QkziJQ9mkNNcyFD8GPQz6R6oEvT75wgsVXm4v',
    '/ip4/10.5.0.2/udp/4001/quic-v1/webtransport/certhash/uEiDWmsTxXe55Mbwnvd1qrPZAcE5Jtc0tE9WtGXD_NpMERg/certhash/uEiCoik2HBeT5oc9Jib3SQJzNjn9AnznMDpQWcOeKSuEc9A/p2p/12D3KooWQF6Q3i1QkziJQ9mkNNcyFD8GPQz6R6oEvT75wgsVXm4v',
    '/ip4/127.0.0.1/udp/4001/quic-v1/webtransport/certhash/uEiDWmsTxXe55Mbwnvd1qrPZAcE5Jtc0tE9WtGXD_NpMERg/certhash/uEiCoik2HBeT5oc9Jib3SQJzNjn9AnznMDpQWcOeKSuEc9A/p2p/12D3KooWQF6Q3i1QkziJQ9mkNNcyFD8GPQz6R6oEvT75wgsVXm4v',
    '/ip4/97.126.16.119/udp/4001/quic-v1/webtransport/certhash/uEiDWmsTxXe55Mbwnvd1qrPZAcE5Jtc0tE9WtGXD_NpMERg/certhash/uEiCoik2HBeT5oc9Jib3SQJzNjn9AnznMDpQWcOeKSuEc9A/p2p/12D3KooWQF6Q3i1QkziJQ9mkNNcyFD8GPQz6R6oEvT75wgsVXm4v',
    '/ip6/::1/udp/4001/quic-v1/webtransport/certhash/uEiDWmsTxXe55Mbwnvd1qrPZAcE5Jtc0tE9WtGXD_NpMERg/certhash/uEiCoik2HBeT5oc9Jib3SQJzNjn9AnznMDpQWcOeKSuEc9A/p2p/12D3KooWQF6Q3i1QkziJQ9mkNNcyFD8GPQz6R6oEvT75wgsVXm4v'
  ]

  const badWebTransport = [
    // quic instead of quic-v1
    '/ip4/10.5.0.2/udp/4001/quic/webtransport/certhash/uEiDWmsTxXe55Mbwnvd1qrPZAcE5Jtc0tE9WtGXD_NpMERg/certhash/uEiCoik2HBeT5oc9Jib3SQJzNjn9AnznMDpQWcOeKSuEc9A/p2p/12D3KooWQF6Q3i1QkziJQ9mkNNcyFD8GPQz6R6oEvT75wgsVXm4v'
  ]

  const exactIPorDomain = [
    ...exactDNS,
    ...exactIP
  ]

  const goodIPorDomain = [
    ...exactIPorDomain,
    ...exactDNS,
    ...exactIP
  ]

  const badIPorDomain = [
    '/webrtc/p2p/12D3KooWQF6Q3i1QkziJQ9mkNNcyFD8GPQz6R6oEvT75wgsVXm4v',
    '/quic',
    '/unix/var/log'
  ]

  const exactHTTP = [
    '/ip4/0.0.0.0/tcp/80/http',
    '/ip6/fc00::/tcp/80/http',
    '/dns4/example.org/tcp/80/http',
    '/dns6/example.org/tcp/80/http',
    '/dnsaddr/example.org/tcp/80/http',
    '/dns/example.org/tcp/7777/http',
    '/dns/example.org/tcp/7777/http/p2p/12D3KooWQF6Q3i1QkziJQ9mkNNcyFD8GPQz6R6oEvT75wgsVXm4v'
  ]

  const goodHTTP = [
    ...exactHTTP
  ]

  const badHTTP = [
    '/ip4/0.0.0.0/udp/80/http'
  ]

  const exactHTTPS = [
    '/ip4/0.0.0.0/tcp/0/https',
    '/ip6/fc00::/tcp/0/https',
    '/dns4/example.org/tcp/80/https',
    '/dns6/example.org/tcp/80/https',
    '/dnsaddr/example.org/tcp/80/https',
    '/dns/example.org/tcp/7777/https',
    '/dns4/example.org/tcp/443/http',
    '/dns6/example.org/tcp/443/http',
    '/dnsaddr/example.org/tcp/443/http',
    '/dns/example.org/tcp/443/http',
    '/dns4/example.org/tls/http',
    '/dns/example.org/tls/http/p2p/12D3KooWQF6Q3i1QkziJQ9mkNNcyFD8GPQz6R6oEvT75wgsVXm4v'
  ]

  const goodHTTPS = [
    ...exactHTTPS
  ]

  const badHTTPS = [
    '/ip4/0.0.0.0/udp/80/http'
  ]

  function assertMatches (p: MultiaddrMatcher, ...tests: string[][]): void {
    tests.forEach((test) => {
      test.forEach((testcase) => {
        expect(p.matches(multiaddr(testcase))).to.equal(true, `${testcase} did not match`)
      })
    })
  }

  function assertExactMatches (p: MultiaddrMatcher, ...tests: string[][]): void {
    tests.forEach((test) => {
      test.forEach((testcase) => {
        expect(p.exactMatch(multiaddr(testcase))).to.equal(true, `${testcase} did not exact match`)
      })
    })
  }

  function assertMismatches (p: MultiaddrMatcher, ...tests: string[][]): void {
    tests.forEach((test) => {
      test.forEach((testcase) => {
        expect(p.matches(multiaddr(testcase))).to.equal(false, `${testcase} matched when it should not have`)
      })
    })
  }

  it('DNS addresses', () => {
    assertMatches(mafmt.DNS, goodDNS)
    assertExactMatches(mafmt.DNS, exactDNS)
    assertMismatches(mafmt.DNS, badDNS, badIP)
  })

  it('IP addresses', () => {
    assertMatches(mafmt.IP, goodIP)
    assertExactMatches(mafmt.IP, exactIP)
    assertMismatches(mafmt.IP, badIP)
  })

  it('TCP addresses', () => {
    assertMatches(mafmt.TCP, goodTCP)
    assertExactMatches(mafmt.TCP, exactTCP)
    assertMismatches(mafmt.TCP, badTCP)
  })

  it('UDP addresses', () => {
    assertMatches(mafmt.UDP, goodUDP)
    assertExactMatches(mafmt.UDP, exactUDP)
    assertMismatches(mafmt.UDP, badUDP)
  })

  it('QUIC addresses', () => {
    assertMatches(mafmt.QUIC, goodQUIC)
    assertExactMatches(mafmt.QUIC, exactQUIC)
    assertMismatches(mafmt.QUIC, badQUIC)
  })

  it('WebSockets addresses', () => {
    assertMatches(mafmt.WebSockets, goodWS)
    assertExactMatches(mafmt.WebSockets, exactWS)
    assertMismatches(mafmt.WebSockets, goodIP, goodUDP, badWS)
  })

  it('WebSocketsSecure addresses', () => {
    assertMatches(mafmt.WebSocketsSecure, goodWSS)
    assertExactMatches(mafmt.WebSocketsSecure, exactWSS)
    assertMismatches(mafmt.WebSocketsSecure, badWSS)
  })

  it('Circuit addresses', () => {
    assertMatches(mafmt.Circuit, goodCircuit)
    assertMismatches(mafmt.Circuit, badCircuit)
  })

  it('P2P addresses', () => {
    assertMatches(mafmt.P2P, goodIPFS)
  })

  it('WebRTCDirect addresses', () => {
    assertMatches(mafmt.WebRTCDirect, goodWebRTCDirect)
    assertMismatches(mafmt.WebRTCDirect, badWebRTCDirect)
  })

  it('WebRTC addresses', () => {
    assertMatches(mafmt.WebRTC, goodWebRTC)
    assertMismatches(mafmt.WebRTC, badWebRTC)
  })

  it('WebTransport addresses', () => {
    assertMatches(mafmt.WebTransport, goodWebTransport)
    assertMismatches(mafmt.WebTransport, badWebTransport)
  })

  it('IP or Domain addresses', () => {
    assertMatches(mafmt.IP_OR_DOMAIN, goodIPorDomain)
    assertExactMatches(mafmt.IP_OR_DOMAIN, exactIPorDomain)
    assertMismatches(mafmt.IP_OR_DOMAIN, badIPorDomain)
  })

  it('HTTP addresses', () => {
    assertMatches(mafmt.HTTP, goodHTTP)
    assertExactMatches(mafmt.HTTP, exactHTTP)
    assertMismatches(mafmt.HTTP, badHTTP)
  })

  it('HTTPS addresses', () => {
    assertMatches(mafmt.HTTPS, goodHTTPS)
    assertExactMatches(mafmt.HTTPS, exactHTTPS)
    assertMismatches(mafmt.HTTPS, badHTTPS)
  })
})
