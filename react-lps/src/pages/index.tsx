import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

const lpData = [
  {
    id: 'lp1-3d-interactive',
    title: '3Dインタラクティブ体験',
    description: 'Three.jsを使用した没入型3D体験で起業の世界を探索',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    emoji: '🌐'
  },
  {
    id: 'lp2-rpg-skill-tree',
    title: 'RPGスキルツリー',
    description: 'ゲーム感覚で起業スキルを習得する革新的な学習体験',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    emoji: '🎮'
  },
  {
    id: 'lp3-data-visualization',
    title: 'データビジュアライゼーション',
    description: 'リアルタイムデータで起業の成功を可視化',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    emoji: '📊'
  },
  {
    id: 'lp4-interactive-storybook',
    title: 'インタラクティブ絵本',
    description: '選択式ストーリーで自分だけの起業物語を作成',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    emoji: '📖'
  },
  {
    id: 'lp5-web-ar',
    title: 'WebAR体験',
    description: '拡張現実で未来の起業家としての自分を体験',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    emoji: '🔮'
  },
  {
    id: 'lp6-voice-interactive',
    title: '音声インタラクティブ',
    description: '音声認識技術で対話しながら起業を学ぶ',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    emoji: '🎙️'
  },
  {
    id: 'lp7-multiverse-selection',
    title: 'マルチバース選択',
    description: '複数の起業の道を探索する多次元体験',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    emoji: '🌌'
  },
  {
    id: 'lp8-neuromorphic',
    title: 'ニューロモーフィック',
    description: '脳の仕組みを模した革新的な学習インターフェース',
    gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    emoji: '🧠'
  },
  {
    id: 'lp9-web3-blockchain',
    title: 'Web3ブロックチェーン',
    description: 'ブロックチェーン技術で証明される起業スキル',
    gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    emoji: '⛓️'
  },
  {
    id: 'lp10-ai-generated-content',
    title: 'AI生成コンテンツ',
    description: 'AIが生成するパーソナライズされた起業プラン',
    gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    emoji: '🤖'
  }
]

export default function Home() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#0A0E27] overflow-hidden">
      {/* Background Animation */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center py-20"
        >
          <h1 className="text-6xl font-bold mb-4">
            <span className="text-gradient">AIDXschool</span>
          </h1>
          <p className="text-2xl text-gray-300">React Landing Pages Collection</p>
          <p className="text-lg text-gray-400 mt-4">10種類のインタラクティブ体験をお選びください</p>
        </motion.header>

        {/* LP Grid */}
        <div className="container mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {lpData.map((lp, index) => (
              <motion.div
                key={lp.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
              >
                <Link href={`/${lp.id}`}>
                  <motion.div
                    className="relative overflow-hidden rounded-2xl cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: hoveredIndex === index ? lp.gradient : 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      transition: 'background 0.3s ease'
                    }}
                  >
                    <div className="p-8">
                      <div className="text-5xl mb-4">{lp.emoji}</div>
                      <h3 className="text-xl font-bold mb-2 text-white">
                        {lp.title}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {lp.description}
                      </p>
                    </div>
                    
                    {/* Hover Effect */}
                    <motion.div
                      className="absolute inset-0 bg-white/10"
                      initial={{ x: '-100%' }}
                      animate={{ x: hoveredIndex === index ? '100%' : '-100%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center py-10 text-gray-400"
        >
          <p>© 2024 AIDXschool. All rights reserved.</p>
          <p className="mt-2">Built with React, Next.js, and ❤️</p>
        </motion.footer>
      </div>
    </div>
  )
}