import dynamic from 'next/dynamic'
import React from 'react'

// SSRを無効化してwindowエラーを回避
const LP6VoiceInteractive = dynamic(
  () => import('../components/lp6-voice-interactive'),
  { ssr: false }
)

export default function LP6VoiceInteractivePage() {
  return <LP6VoiceInteractive />
}