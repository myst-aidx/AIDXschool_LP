import dynamic from 'next/dynamic'
import React from 'react'

// SSRを無効化してstyle-componentsエラーを回避
const LP18TimelineExperience = dynamic(
  () => import('../components/lp18-timeline-experience'),
  { ssr: false }
)

export default function LP18TimelineExperiencePage() {
  return <LP18TimelineExperience />
}