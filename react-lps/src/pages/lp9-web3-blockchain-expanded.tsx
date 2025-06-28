import dynamic from 'next/dynamic'
import React from 'react'

// SSRを無効化してstyle-componentsエラーを回避
const LP9Web3BlockchainExpanded = dynamic(
  () => import('../components/lp9-web3-blockchain-expanded'),
  { ssr: false }
)

export default function LP9Web3BlockchainExpandedPage() {
  return <LP9Web3BlockchainExpanded />
}