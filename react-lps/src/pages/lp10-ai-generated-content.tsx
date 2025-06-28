import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { create } from 'zustand'

// Types
interface GeneratedContent {
  id: string
  type: 'business-idea' | 'course-outline' | 'marketing-copy' | 'landing-page'
  prompt: string
  content: string
  style: ContentStyle
  timestamp: Date
}

interface ContentStyle {
  tone: 'professional' | 'casual' | 'inspirational' | 'technical'
  length: 'short' | 'medium' | 'long'
  creativity: number // 0-100
  focus: string[]
}

interface AIPersona {
  name: string
  avatar: string
  specialty: string
  personality: string
  greeting: string
}

interface UserProfile {
  interests: string[]
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  goals: string[]
  preferredStyle: ContentStyle
}

// Zustand Store
interface AIContentStore {
  generatedContents: GeneratedContent[]
  currentPrompt: string
  isGenerating: boolean
  selectedPersona: AIPersona
  userProfile: UserProfile
  contentStyle: ContentStyle
  generateContent: (type: GeneratedContent['type']) => void
  setPrompt: (prompt: string) => void
  setPersona: (persona: AIPersona) => void
  updateStyle: (style: Partial<ContentStyle>) => void
  updateProfile: (profile: Partial<UserProfile>) => void
}

const useAIContentStore = create<AIContentStore>((set, get) => ({
  generatedContents: [],
  currentPrompt: '',
  isGenerating: false,
  selectedPersona: {
    name: 'AIメンター',
    avatar: '🤖',
    specialty: 'ビジネス戦略',
    personality: 'friendly',
    greeting: 'こんにちは！あなたの起業の夢を実現するお手伝いをします。'
  },
  userProfile: {
    interests: [],
    skillLevel: 'beginner',
    goals: [],
    preferredStyle: {
      tone: 'casual',
      length: 'medium',
      creativity: 50,
      focus: []
    }
  },
  contentStyle: {
    tone: 'casual',
    length: 'medium',
    creativity: 50,
    focus: []
  },
  
  generateContent: async (type) => {
    set({ isGenerating: true })
    
    // Simulate AI generation
    setTimeout(() => {
      const { currentPrompt, contentStyle } = get()
      const contents = {
        'business-idea': [
          `【AIペットケアサービス】\n\nペットの健康状態をAIカメラで24時間モニタリングし、異常を検知したら飼い主に通知。獣医とのオンライン相談も可能。\n\n収益モデル：月額サブスクリプション\n予想月収：初年度100万円〜`,
          `【ノーコード教育プラットフォーム】\n\n子供向けのプログラミング教育をノーコードツールで実現。ゲーム感覚で学べるカリキュラムを提供。\n\n収益モデル：コース販売＋月額会員\n予想月収：200万円〜`
        ],
        'course-outline': [
          `【Week 1: AI基礎とChatGPT入門】\n• AIの基本概念を理解\n• ChatGPTの基本操作\n• プロンプトエンジニアリング入門\n\n【Week 2: ビジネスへの応用】\n• 業務自動化の設計\n• コンテンツ生成術\n• カスタマーサポートAI構築`,
          `【Module 1: ノーコード基礎】\n• Bubbleの基本操作\n• データベース設計\n• UI/UXの基礎\n\n【Module 2: 実践開発】\n• MVPの構築\n• 決済システム統合\n• ローンチ戦略`
        ],
        'marketing-copy': [
          `もう、時間と場所に縛られる必要はありません。\n\nAI×DXの力で、あなたのビジネスを完全自動化。\n週15時間の労働で月収200万円を実現した受講生続出！\n\n今なら無料相談で、あなた専用の起業プランをご提案。`,
          `「起業したいけど、何から始めれば...」\n\nそんなあなたに朗報です。\nAIDXschoolなら、ゼロから3ヶ月で起業家デビュー。\n\n✓ AIツールを使いこなす\n✓ ノーコードで開発\n✓ 自動化で収益最大化`
        ],
        'landing-page': [
          `<Hero Section>\n見出し: "AIで起業を、もっとシンプルに"\nサブ: "技術知識ゼロから3ヶ月で月収100万円へ"\nCTA: "無料相談を予約"\n\n<Features>\n• 実践的カリキュラム\n• 1対1メンタリング\n• 成功保証付き`,
          `<Above the Fold>\nキャッチ: "あなたの起業アイデアを、AIが現実に"\n証拠: "受講生の92%が起業成功"\nCTA: "今すぐ始める"\n\n<Social Proof>\n• 成功事例インタビュー\n• 実績データ\n• メディア掲載`
        ]
      }
      
      const contentArray = contents[type]
      const randomContent = contentArray[Math.floor(Math.random() * contentArray.length)]
      
      const newContent: GeneratedContent = {
        id: Date.now().toString(),
        type,
        prompt: currentPrompt || `${type}を生成`,
        content: randomContent,
        style: contentStyle,
        timestamp: new Date()
      }
      
      set((state) => ({
        generatedContents: [newContent, ...state.generatedContents].slice(0, 10),
        isGenerating: false
      }))
    }, 2000)
  },
  
  setPrompt: (prompt) => set({ currentPrompt: prompt }),
  setPersona: (persona) => set({ selectedPersona: persona }),
  updateStyle: (style) => set((state) => ({
    contentStyle: { ...state.contentStyle, ...style }
  })),
  updateProfile: (profile) => set((state) => ({
    userProfile: { ...state.userProfile, ...profile }
  }))
}))

// AI Personas
const aiPersonas: AIPersona[] = [
  {
    name: 'ビジネスメンター',
    avatar: '👔',
    specialty: 'ビジネス戦略・収益化',
    personality: 'professional',
    greeting: 'ビジネスの成功に向けて、戦略的なアドバイスをご提供します。'
  },
  {
    name: 'テックコーチ',
    avatar: '💻',
    specialty: 'AI・ノーコード技術',
    personality: 'technical',
    greeting: '最新のテクノロジーを活用した起業をサポートします。'
  },
  {
    name: 'クリエイティブディレクター',
    avatar: '🎨',
    specialty: 'マーケティング・ブランディング',
    personality: 'creative',
    greeting: 'あなたのビジネスを魅力的に見せる方法をお教えします。'
  }
]

// Components
function AIAvatar({ persona }: { persona: AIPersona }) {
  const [speaking, setSpeaking] = useState(false)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeaking(prev => !prev)
    }, 3000)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="relative"
    >
      <motion.div
        animate={speaking ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: speaking ? Infinity : 0 }}
        className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-6xl shadow-2xl"
      >
        {persona.avatar}
      </motion.div>
      
      {/* Speaking Indicator */}
      {speaking && (
        <motion.div
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white rounded-full"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
            />
          ))}
        </motion.div>
      )}
      
      {/* Info Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-gray-800 px-3 py-1 rounded-full text-sm"
      >
        {persona.name}
      </motion.div>
    </motion.div>
  )
}

function ContentGenerator() {
  const { 
    currentPrompt, 
    setPrompt, 
    generateContent, 
    isGenerating,
    contentStyle,
    updateStyle 
  } = useAIContentStore()
  
  const contentTypes = [
    { id: 'business-idea', label: 'ビジネスアイデア', icon: '💡' },
    { id: 'course-outline', label: 'カリキュラム', icon: '📚' },
    { id: 'marketing-copy', label: 'マーケティング文', icon: '📝' },
    { id: 'landing-page', label: 'LPの構成', icon: '🖥️' }
  ] as const
  
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-2xl font-bold mb-6">AIコンテンツ生成</h3>
      
      {/* Prompt Input */}
      <div className="mb-6">
        <textarea
          value={currentPrompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="生成したい内容を詳しく説明してください..."
          className="w-full h-24 px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 outline-none resize-none"
        />
      </div>
      
      {/* Style Controls */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">トーン</label>
          <select
            value={contentStyle.tone}
            onChange={(e) => updateStyle({ tone: e.target.value as ContentStyle['tone'] })}
            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
          >
            <option value="professional">プロフェッショナル</option>
            <option value="casual">カジュアル</option>
            <option value="inspirational">インスピレーション</option>
            <option value="technical">テクニカル</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm text-gray-400 mb-2 block">長さ</label>
          <select
            value={contentStyle.length}
            onChange={(e) => updateStyle({ length: e.target.value as ContentStyle['length'] })}
            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
          >
            <option value="short">短い</option>
            <option value="medium">普通</option>
            <option value="long">長い</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm text-gray-400 mb-2 block">
            創造性: {contentStyle.creativity}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={contentStyle.creativity}
            onChange={(e) => updateStyle({ creativity: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Content Type Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {contentTypes.map(type => (
          <motion.button
            key={type.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => generateContent(type.id)}
            disabled={isGenerating}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-2xl">{type.icon}</span>
            <span>{type.label}を生成</span>
          </motion.button>
        ))}
      </div>
      
      {/* Generating Animation */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center"
        >
          <div className="inline-flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
            />
            <span className="text-gray-400">AI が生成中...</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function GeneratedContentDisplay() {
  const { generatedContents } = useAIContentStore()
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null)
  
  if (generatedContents.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700 text-center">
        <div className="text-6xl mb-4">🎯</div>
        <p className="text-gray-400">
          上のボタンからコンテンツを生成してみましょう
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">生成されたコンテンツ</h3>
      
      {/* Content List */}
      <div className="space-y-3">
        {generatedContents.map((content) => (
          <motion.div
            key={content.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: 5 }}
            onClick={() => setSelectedContent(content)}
            className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 cursor-pointer hover:border-blue-500 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {content.type === 'business-idea' && '💡'}
                  {content.type === 'course-outline' && '📚'}
                  {content.type === 'marketing-copy' && '📝'}
                  {content.type === 'landing-page' && '🖥️'}
                </span>
                <span className="font-semibold">
                  {content.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(content.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm text-gray-300 line-clamp-2">
              {content.content}
            </p>
          </motion.div>
        ))}
      </div>
      
      {/* Content Modal */}
      <AnimatePresence>
        {selectedContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
            onClick={() => setSelectedContent(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-gray-900 rounded-xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold">
                  {selectedContent.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h3>
                <button
                  onClick={() => setSelectedContent(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <pre className="whitespace-pre-wrap font-sans">
                  {selectedContent.content}
                </pre>
              </div>
              
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-3 bg-blue-500 rounded-lg font-semibold"
                >
                  このコンテンツを使用
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gray-700 rounded-lg font-semibold"
                >
                  コピー
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PersonaSelector() {
  const { selectedPersona, setPersona } = useAIContentStore()
  
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold mb-4">AIアシスタントを選択</h3>
      
      <div className="grid grid-cols-3 gap-4">
        {aiPersonas.map(persona => (
          <motion.button
            key={persona.name}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPersona(persona)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedPersona.name === persona.name
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="text-3xl mb-2">{persona.avatar}</div>
            <p className="font-semibold text-sm">{persona.name}</p>
            <p className="text-xs text-gray-400 mt-1">{persona.specialty}</p>
          </motion.button>
        ))}
      </div>
      
      <motion.div
        key={selectedPersona.name}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 p-4 bg-gray-800 rounded-lg"
      >
        <p className="text-sm text-gray-300">{selectedPersona.greeting}</p>
      </motion.div>
    </div>
  )
}

// Main Component
export default function LP10_AIGeneratedContent() {
  const { selectedPersona } = useAIContentStore()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900/10 to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(79, 70, 229, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.1) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>
      
      {/* Header */}
      <header className="relative z-10 p-8">
        <div className="container mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-4"
          >
            <span className="text-gradient">AI</span>があなたの
            <br />
            起業を<span className="text-gradient">創造</span>する
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            最先端のAI技術で、パーソナライズされた起業プランを瞬時に生成
          </motion.p>
        </div>
      </header>
      
      {/* AI Avatar Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 flex justify-center mb-12"
      >
        <AIAvatar persona={selectedPersona} />
      </motion.div>
      
      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ContentGenerator />
            <GeneratedContentDisplay />
          </div>
          <div>
            <PersonaSelector />
          </div>
        </div>
        
        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <h2 className="text-3xl font-bold mb-6">
            AIの力で、起業を加速させる
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            AIDXschoolのAI活用カリキュラムで、
            あなたもAIを味方につけた起業家になれます。
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full font-bold text-lg"
          >
            AIで起業を始める
          </motion.button>
        </motion.div>
      </main>
    </div>
  )
}