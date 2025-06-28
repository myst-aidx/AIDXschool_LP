import dynamic from 'next/dynamic'
import React from 'react'

// SSRを無効化してwindowエラーを回避
const LP9Web3Blockchain = dynamic(
  () => import('../components/lp9-web3-blockchain'),
  { ssr: false }
)

export default function LP9Web3BlockchainPage() {
  return <LP9Web3Blockchain />
}