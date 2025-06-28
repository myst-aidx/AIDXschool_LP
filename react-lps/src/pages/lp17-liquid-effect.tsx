import dynamic from 'next/dynamic'
import React from 'react'

// SSRを無効化してstyle-componentsエラーを回避
const LP17LiquidEffect = dynamic(
  () => import('../components/lp17-liquid-effect'),
  { ssr: false }
)

export default function LP17LiquidEffectPage() {
  return <LP17LiquidEffect />
}