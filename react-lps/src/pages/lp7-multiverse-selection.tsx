import { useState, useEffect, useRef, Suspense, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  Stars, 
  Text3D,
  MeshDistortMaterial,
  Environment,
  Portal,
  MeshPortalMaterial,
  RoundedBox,
  Float,
  PerspectiveCamera,
  useTexture,
  Sparkles,
  Trail,
  Sphere,
  Ring,
  Torus,
  Box
} from '@react-three/drei'
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion'
import { create } from 'zustand'
import * as THREE from 'three'
import styled, { keyframes } from 'styled-components'

// カラーパレット
const colors = {
  primary: '#4EB5FF',
  secondary: '#38C172',
  accent: '#FFD93D',
  danger: '#FF6B6B',
  purple: '#9333EA',
  pink: '#EC4899',
  dark: '#0a0a0a',
  darker: '#000000',
  light: '#ffffff',
  gradient: 'linear-gradient(135deg, #4EB5FF 0%, #38C172 50%, #FFD93D 100%)'
}

// アニメーション定義
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
`

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`

const universeOrbit = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const cosmicGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(147, 51, 234, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(147, 51, 234, 1);
  }
`

// スタイルコンポーネント
const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 35%, #0f3460 100%);
`

const UIOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
`

const UniverseCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
`

const ProgressRing = styled(motion.div)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, ${colors.purple}, ${colors.pink}, ${colors.primary}, ${colors.purple});
  animation: ${universeOrbit} 10s linear infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '';
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: #1a1a2e;
  }
`

const NavigationDot = styled(motion.div)`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.active ? colors.primary : 'rgba(255, 255, 255, 0.3)'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.2);
    background: ${colors.primary};
  }
`

// Types
interface Universe {
  id: string
  name: string
  description: string
  color: string
  income: string
  workStyle: string
  skills: string[]
  position: [number, number, number]
  rotation: [number, number, number]
  portalTexture: string
  features: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  timeToLaunch: string
  successStories: SuccessStory[]
  marketSize: string
  competitionLevel: 'low' | 'medium' | 'high'
}

interface SuccessStory {
  name: string
  achievement: string
  timeframe: string
  revenue: string
}

interface DecisionNode {
  id: string
  question: string
  options: DecisionOption[]
  weightings: Record<string, number>
}

interface DecisionOption {
  text: string
  universeWeights: Record<string, number>
  nextNode?: string
}

interface PersonalityProfile {
  riskTolerance: number
  creativityLevel: number
  technicalSkill: number
  leadershipStyle: number
  workLifeBalance: number
}

interface UniverseMatch {
  universe: Universe
  matchScore: number
  reasons: string[]
  challenges: string[]
  recommendations: string[]
}

interface MultiverseState {
  selectedUniverse: Universe | null
  visitedUniverses: string[]
  isTransitioning: boolean
  personalityProfile: PersonalityProfile
  decisionPath: string[]
  currentNode: string
  universeMatches: UniverseMatch[]
  showPersonalityTest: boolean
  testCompleted: boolean
  interactionHistory: string[]
  cameraMode: 'explore' | 'focus' | 'compare'
  setSelectedUniverse: (universe: Universe | null) => void
  addVisitedUniverse: (id: string) => void
  setTransitioning: (value: boolean) => void
  updatePersonalityProfile: (updates: Partial<PersonalityProfile>) => void
  addDecisionPath: (nodeId: string) => void
  setCurrentNode: (nodeId: string) => void
  calculateMatches: () => void
  setShowPersonalityTest: (show: boolean) => void
  setTestCompleted: (completed: boolean) => void
  addInteraction: (interaction: string) => void
  setCameraMode: (mode: 'explore' | 'focus' | 'compare') => void
}

// Zustand Store
const useMultiverseStore = create<MultiverseState>((set, get) => ({
  selectedUniverse: null,
  visitedUniverses: [],
  isTransitioning: false,
  personalityProfile: {
    riskTolerance: 50,
    creativityLevel: 50,
    technicalSkill: 50,
    leadershipStyle: 50,
    workLifeBalance: 50
  },
  decisionPath: [],
  currentNode: 'start',
  universeMatches: [],
  showPersonalityTest: false,
  testCompleted: false,
  interactionHistory: [],
  cameraMode: 'explore',
  setSelectedUniverse: (universe) => set({ selectedUniverse: universe }),
  addVisitedUniverse: (id) => set((state) => ({
    visitedUniverses: [...new Set([...state.visitedUniverses, id])]
  })),
  setTransitioning: (value) => set({ isTransitioning: value }),
  updatePersonalityProfile: (updates) => set((state) => ({
    personalityProfile: { ...state.personalityProfile, ...updates }
  })),
  addDecisionPath: (nodeId) => set((state) => ({
    decisionPath: [...state.decisionPath, nodeId]
  })),
  setCurrentNode: (nodeId) => set({ currentNode: nodeId }),
  calculateMatches: () => {
    const state = get()
    const matches = universes.map(universe => {
      const profile = state.personalityProfile
      let score = 0
      let reasons: string[] = []
      let challenges: string[] = []
      let recommendations: string[] = []
      
      // スコア計算ロジック
      switch (universe.id) {
        case 'ai-consultant':
          score += profile.technicalSkill * 0.3
          score += profile.riskTolerance * 0.2
          score += (100 - profile.workLifeBalance) * 0.2
          score += profile.leadershipStyle * 0.3
          break
        case 'saas-founder':
          score += profile.riskTolerance * 0.4
          score += profile.technicalSkill * 0.2
          score += profile.creativityLevel * 0.2
          score += profile.leadershipStyle * 0.2
          break
        case 'content-creator':
          score += profile.creativityLevel * 0.4
          score += profile.workLifeBalance * 0.3
          score += (100 - profile.technicalSkill) * 0.2
          score += (100 - profile.leadershipStyle) * 0.1
          break
        case 'automation-expert':
          score += profile.technicalSkill * 0.4
          score += profile.workLifeBalance * 0.3
          score += (100 - profile.riskTolerance) * 0.2
          score += profile.creativityLevel * 0.1
          break
        case 'digital-agency':
          score += profile.leadershipStyle * 0.4
          score += profile.riskTolerance * 0.3
          score += profile.technicalSkill * 0.2
          score += (100 - profile.workLifeBalance) * 0.1
          break
      }
      
      return {
        universe,
        matchScore: Math.round(score),
        reasons,
        challenges,
        recommendations
      }
    }).sort((a, b) => b.matchScore - a.matchScore)
    
    set({ universeMatches: matches })
  },
  setShowPersonalityTest: (show) => set({ showPersonalityTest: show }),
  setTestCompleted: (completed) => set({ testCompleted: completed }),
  addInteraction: (interaction) => set((state) => ({
    interactionHistory: [...state.interactionHistory, interaction]
  })),
  setCameraMode: (mode) => set({ cameraMode: mode })
}))

// 拡張された宇宙データ
const universes: Universe[] = [
  {
    id: 'ai-consultant',
    name: 'AIコンサルタント宇宙',
    description: '最先端AI技術を駆使して企業の課題を解決',
    color: '#4A90E2',
    income: '月収200万円〜',
    workStyle: 'リモート中心・週3稼働',
    skills: ['ChatGPT', 'Claude', 'Python', 'データ分析'],
    position: [-4, 0, 0],
    rotation: [0, 0.5, 0],
    portalTexture: '#4A90E2',
    features: ['高収入', 'リモートワーク', '専門性重視', '企業課題解決'],
    difficulty: 'intermediate',
    timeToLaunch: '3-6ヶ月',
    marketSize: '1兆円市場',
    competitionLevel: 'medium',
    successStories: [
      {
        name: '田中 健一さん',
        achievement: '大手企業のAI導入支援で年収2400万円達成',
        timeframe: '開始から8ヶ月',
        revenue: '月収200万円'
      },
      {
        name: '佐藤 美穂さん',
        achievement: 'AIチャットボット専門コンサルとして独立',
        timeframe: '開始から1年',
        revenue: '月収180万円'
      }
    ]
  },
  {
    id: 'saas-founder',
    name: 'SaaS起業家宇宙',
    description: 'ノーコードでSaaSサービスを構築・運営',
    color: '#9B59B6',
    income: '月収300万円〜',
    workStyle: '完全自由・世界中どこでも',
    skills: ['Bubble', 'Zapier', 'マーケティング', 'UI/UX'],
    position: [0, 0, 0],
    rotation: [0, -0.5, 0],
    portalTexture: '#9B59B6',
    features: ['スケーラブル', '受動的収入', 'グローバル展開', '高成長可能性'],
    difficulty: 'advanced',
    timeToLaunch: '6-12ヶ月',
    marketSize: '10兆円市場',
    competitionLevel: 'high',
    successStories: [
      {
        name: '山田 太郎さん',
        achievement: 'HR管理SaaSで月間売上500万円達成',
        timeframe: '開始から2年',
        revenue: '月収350万円'
      },
      {
        name: '鈴木 花子さん',
        achievement: '小規模店舗向け在庫管理SaaSを展開',
        timeframe: '開始から18ヶ月',
        revenue: '月収280万円'
      }
    ]
  },
  {
    id: 'content-creator',
    name: 'コンテンツクリエイター宇宙',
    description: 'AI活用で高品質コンテンツを量産',
    color: '#E74C3C',
    income: '月収150万円〜',
    workStyle: '自分のペースで創作活動',
    skills: ['動画編集', 'AI画像生成', 'SNS運用', 'ライティング'],
    position: [4, 0, 0],
    rotation: [0, 0.3, 0],
    portalTexture: '#E74C3C',
    features: ['創作活動', '自由な時間', '多様な収入源', '影響力拡大'],
    difficulty: 'beginner',
    timeToLaunch: '1-3ヶ月',
    marketSize: '5兆円市場',
    competitionLevel: 'medium',
    successStories: [
      {
        name: '高橋 みなみさん',
        achievement: 'AI活用ビジネス系YouTuberとして月収200万円',
        timeframe: '開始から10ヶ月',
        revenue: '月収160万円'
      },
      {
        name: '伊藤 慎一さん',
        achievement: 'AIアート×NFTで新ジャンル開拓',
        timeframe: '開始から6ヶ月',
        revenue: '月収120万円'
      }
    ]
  },
  {
    id: 'automation-expert',
    name: '自動化エキスパート宇宙',
    description: '業務プロセスを自動化して効率を最大化',
    color: '#2ECC71',
    income: '月収180万円〜',
    workStyle: '週15時間の超効率ワーク',
    skills: ['Make', 'n8n', 'API連携', 'ワークフロー設計'],
    position: [-2, 2.5, -2],
    rotation: [0.3, 0, 0],
    portalTexture: '#2ECC71',
    features: ['時間効率', '安定収入', '技術専門性', '企業支援'],
    difficulty: 'intermediate',
    timeToLaunch: '2-4ヶ月',
    marketSize: '3兆円市場',
    competitionLevel: 'low',
    successStories: [
      {
        name: '中村 雄介さん',
        achievement: '中小企業向け業務自動化で週20時間労働',
        timeframe: '開始から5ヶ月',
        revenue: '月収190万円'
      },
      {
        name: '林 恵子さん',
        achievement: 'EC事業者向け在庫管理自動化ツール開発',
        timeframe: '開始から7ヶ月',
        revenue: '月収150万円'
      }
    ]
  },
  {
    id: 'digital-agency',
    name: 'デジタルエージェンシー宇宙',
    description: 'AI×DXで企業のデジタル変革を支援',
    color: '#F39C12',
    income: '月収500万円〜',
    workStyle: 'チーム運営・プロジェクト型',
    skills: ['プロジェクト管理', 'セールス', 'AI実装', 'DX戦略'],
    position: [2, -2.5, -2],
    rotation: [-0.3, 0, 0],
    portalTexture: '#F39C12',
    features: ['高収入', 'チーム成長', '大型案件', '社会貢献'],
    difficulty: 'advanced',
    timeToLaunch: '6-9ヶ月',
    marketSize: '15兆円市場',
    competitionLevel: 'medium',
    successStories: [
      {
        name: '吉田 拓海さん',
        achievement: '従業員20名のDXエージェンシー経営',
        timeframe: '開始から3年',
        revenue: '月収600万円'
      },
      {
        name: '小林 さくらさん',
        achievement: '地方企業のDX支援に特化したエージェンシー設立',
        timeframe: '開始から2年',
        revenue: '月収420万円'
      }
    ]
  }
]

// 決定木データ
const decisionTree: Record<string, DecisionNode> = {
  start: {
    id: 'start',
    question: 'あなたの理想的な働き方は？',
    options: [
      {
        text: '自由な時間を重視したい',
        universeWeights: {
          'content-creator': 3,
          'automation-expert': 2,
          'saas-founder': 1
        },
        nextNode: 'workstyle'
      },
      {
        text: '高収入を最優先したい',
        universeWeights: {
          'digital-agency': 3,
          'saas-founder': 2,
          'ai-consultant': 2
        },
        nextNode: 'income_focus'
      },
      {
        text: 'バランス重視で安定したい',
        universeWeights: {
          'ai-consultant': 2,
          'automation-expert': 2,
          'content-creator': 1
        },
        nextNode: 'stability'
      }
    ],
    weightings: {}
  },
  workstyle: {
    id: 'workstyle',
    question: '技術的な学習についてどう思いますか？',
    options: [
      {
        text: '新しい技術を学ぶのが好き',
        universeWeights: {
          'automation-expert': 2,
          'ai-consultant': 1
        }
      },
      {
        text: 'クリエイティブな作業が好き',
        universeWeights: {
          'content-creator': 3,
          'saas-founder': 1
        }
      },
      {
        text: 'あまり技術は覚えたくない',
        universeWeights: {
          'content-creator': 2,
          'digital-agency': 1
        }
      }
    ],
    weightings: {}
  },
  income_focus: {
    id: 'income_focus',
    question: 'チームでの働き方について',
    options: [
      {
        text: '一人で完結したい',
        universeWeights: {
          'saas-founder': 2,
          'ai-consultant': 2
        }
      },
      {
        text: 'チームを率いたい',
        universeWeights: {
          'digital-agency': 3,
          'saas-founder': 1
        }
      },
      {
        text: 'どちらでも構わない',
        universeWeights: {
          'ai-consultant': 1,
          'saas-founder': 1,
          'digital-agency': 1
        }
      }
    ],
    weightings: {}
  },
  stability: {
    id: 'stability',
    question: 'リスクに対する考え方は？',
    options: [
      {
        text: '安定性を最重視',
        universeWeights: {
          'automation-expert': 3,
          'ai-consultant': 2
        }
      },
      {
        text: '適度なリスクは取れる',
        universeWeights: {
          'ai-consultant': 2,
          'content-creator': 2,
          'automation-expert': 1
        }
      },
      {
        text: '大きなリスクも恐れない',
        universeWeights: {
          'saas-founder': 2,
          'digital-agency': 1
        }
      }
    ],
    weightings: {}
  }
}

// 高度なコンポーネント
function PersonalityTestModal() {
  const { showPersonalityTest, setShowPersonalityTest, personalityProfile, updatePersonalityProfile, setTestCompleted, calculateMatches } = useMultiverseStore()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  
  const questions = [
    {
      question: 'リスクを取ることについて',
      description: '新しい挑戦に対するあなたの姿勢は？',
      lowLabel: '安定志向',
      highLabel: 'リスク愛好家',
      key: 'riskTolerance' as keyof PersonalityProfile
    },
    {
      question: '創造性・アイデア',
      description: '新しいアイデアを生み出すことは得意ですか？',
      lowLabel: '論理重視',
      highLabel: '創造性重視',
      key: 'creativityLevel' as keyof PersonalityProfile
    },
    {
      question: '技術的スキル',
      description: 'プログラミングや技術的な学習に興味がありますか？',
      lowLabel: '非技術志向',
      highLabel: '技術志向',
      key: 'technicalSkill' as keyof PersonalityProfile
    },
    {
      question: 'リーダーシップ',
      description: 'チームを率いたり、人を導くことは好きですか？',
      lowLabel: '個人作業派',
      highLabel: 'リーダー志向',
      key: 'leadershipStyle' as keyof PersonalityProfile
    },
    {
      question: 'ワークライフバランス',
      description: 'プライベートな時間をどれくらい重視しますか？',
      lowLabel: '仕事重視',
      highLabel: 'プライベート重視',
      key: 'workLifeBalance' as keyof PersonalityProfile
    }
  ]
  
  const handleSliderChange = (value: number) => {
    updatePersonalityProfile({ [questions[currentQuestion].key]: value })
  }
  
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setTestCompleted(true)
      calculateMatches()
      setShowPersonalityTest(false)
    }
  }
  
  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }
  
  if (!showPersonalityTest) return null
  
  const currentQ = questions[currentQuestion]
  const currentValue = personalityProfile[currentQ.key]
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/90 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-2xl w-full bg-gray-900/95 rounded-2xl p-8 border border-purple-500/30"
      >
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">性格診断</h2>
            <span className="text-purple-300">{currentQuestion + 1} / {questions.length}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            />
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-2">{currentQ.question}</h3>
          <p className="text-gray-300">{currentQ.description}</p>
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-4">
            <span>{currentQ.lowLabel}</span>
            <span>{currentQ.highLabel}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={currentValue}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="text-center mt-2">
            <span className="text-purple-300 font-semibold">{currentValue}%</span>
          </div>
        </div>
        
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium"
          >
            戻る
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-medium"
          >
            {currentQuestion === questions.length - 1 ? '診断完了' : '次へ'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function UniverseComparison() {
  const { universeMatches, cameraMode } = useMultiverseStore()
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([])
  
  const toggleComparison = (universeId: string) => {
    setSelectedForComparison(prev => 
      prev.includes(universeId) 
        ? prev.filter(id => id !== universeId)
        : prev.length < 3 ? [...prev, universeId] : prev
    )
  }
  
  const comparisonUniverses = universeMatches.filter(match => 
    selectedForComparison.includes(match.universe.id)
  )
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      <h3 className="text-xl font-bold text-white mb-4">🔄 宇宙比較ツール</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {universeMatches.slice(0, 5).map(match => (
          <motion.div
            key={match.universe.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => toggleComparison(match.universe.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedForComparison.includes(match.universe.id)
                ? 'border-purple-400 bg-purple-500/10'
                : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-white text-sm">{match.universe.name}</h4>
              <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: match.universe.color }}>
                {match.matchScore}%
              </span>
            </div>
            <p className="text-xs text-gray-400">{match.universe.income}</p>
          </motion.div>
        ))}
      </div>
      
      {comparisonUniverses.length > 1 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 text-gray-400">項目</th>
                {comparisonUniverses.map(match => (
                  <th key={match.universe.id} className="text-center py-2 text-white min-w-32">
                    {match.universe.name.replace('宇宙', '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800">
                <td className="py-2 text-gray-400">マッチ度</td>
                {comparisonUniverses.map(match => (
                  <td key={match.universe.id} className="text-center py-2 font-bold" style={{ color: match.universe.color }}>
                    {match.matchScore}%
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 text-gray-400">収入目安</td>
                {comparisonUniverses.map(match => (
                  <td key={match.universe.id} className="text-center py-2 text-white">
                    {match.universe.income}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 text-gray-400">難易度</td>
                {comparisonUniverses.map(match => (
                  <td key={match.universe.id} className="text-center py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      match.universe.difficulty === 'beginner' ? 'bg-green-500/20 text-green-300' :
                      match.universe.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {match.universe.difficulty}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 text-gray-400">立ち上げ期間</td>
                {comparisonUniverses.map(match => (
                  <td key={match.universe.id} className="text-center py-2 text-gray-300">
                    {match.universe.timeToLaunch}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
      
      {selectedForComparison.length === 0 && (
        <p className="text-center text-gray-500 py-4">
          比較したい宇宙を選択してください（最大3つまで）
        </p>
      )}
    </motion.div>
  )
}

function SuccessStoriesCarousel({ universe }: { universe: Universe }) {
  const [currentStory, setCurrentStory] = useState(0)
  
  const nextStory = () => {
    setCurrentStory((prev) => (prev + 1) % universe.successStories.length)
  }
  
  const prevStory = () => {
    setCurrentStory((prev) => (prev - 1 + universe.successStories.length) % universe.successStories.length)
  }
  
  const story = universe.successStories[currentStory]
  
  return (
    <div className="bg-gray-800/50 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">🏆</span>
        成功事例
      </h3>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStory}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-3"
        >
          <h4 className="font-semibold text-white">{story.name}</h4>
          <p className="text-gray-300 text-sm">{story.achievement}</p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{story.timeframe}</span>
            <span className="font-bold" style={{ color: universe.color }}>{story.revenue}</span>
          </div>
        </motion.div>
      </AnimatePresence>
      
      <div className="flex justify-between items-center mt-4">
        <button onClick={prevStory} className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600">
          ←
        </button>
        <div className="flex gap-2">
          {universe.successStories.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentStory ? 'bg-purple-400' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
        <button onClick={nextStory} className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600">
          →
        </button>
      </div>
    </div>
  )
}

function RecommendationEngine() {
  const { universeMatches, testCompleted } = useMultiverseStore()
  
  if (!testCompleted || universeMatches.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center"
      >
        <div className="text-4xl mb-4">🎯</div>
        <h3 className="text-xl font-bold text-white mb-2">パーソナライズされた推薦</h3>
        <p className="text-gray-400">性格診断を完了すると、あなたに最適な宇宙を推薦します</p>
      </motion.div>
    )
  }
  
  const topMatch = universeMatches[0]
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-2xl">🎯</span>
        あなたへの推薦
      </h3>
      
      <div className="space-y-4">
        <div className="text-center">
          <h4 className="text-2xl font-bold text-white mb-2">{topMatch.universe.name}</h4>
          <div className="text-4xl font-bold mb-2" style={{ color: topMatch.universe.color }}>
            {topMatch.matchScore}% マッチ
          </div>
          <p className="text-gray-300">{topMatch.universe.description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h5 className="font-semibold text-green-300 mb-2">🟢 おすすめポイント</h5>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• 高収入の可能性: {topMatch.universe.income}</li>
              <li>• 働き方: {topMatch.universe.workStyle}</li>
              <li>• 市場規模: {topMatch.universe.marketSize}</li>
            </ul>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h5 className="font-semibold text-yellow-300 mb-2">⚠️ 注意点</h5>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• 難易度: {topMatch.universe.difficulty}</li>
              <li>• 立ち上げ期間: {topMatch.universe.timeToLaunch}</li>
              <li>• 競争レベル: {topMatch.universe.competitionLevel}</li>
            </ul>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-lg font-bold text-lg"
          style={{ 
            background: `linear-gradient(135deg, ${topMatch.universe.color} 0%, ${topMatch.universe.color}aa 100%)` 
          }}
        >
          {topMatch.universe.name}で起業を始める
        </motion.button>
      </div>
    </motion.div>
  )
}

// Components
function EnhancedUniversePortal({ universe }: { universe: Universe }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const portalRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const [activated, setActivated] = useState(false)
  const { setSelectedUniverse, addVisitedUniverse, setTransitioning, addInteraction, visitedUniverses } = useMultiverseStore()
  
  const isVisited = visitedUniverses.includes(universe.id)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002
      if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1)
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1)
      }
    }
    
    if (portalRef.current) {
      portalRef.current.rotation.z += 0.001
      if (activated) {
        portalRef.current.scale.lerp(new THREE.Vector3(1.3, 1.3, 1.3), 0.05)
      } else {
        portalRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.05)
      }
    }
  })
  
  const handleClick = () => {
    setActivated(true)
    setTransitioning(true)
    addVisitedUniverse(universe.id)
    addInteraction(`Visited ${universe.name}`)
    
    setTimeout(() => {
      setSelectedUniverse(universe)
      setTransitioning(false)
      setActivated(false)
    }, 1500)
  }
  
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.8}>
      <group ref={portalRef} position={universe.position} rotation={universe.rotation}>
        {/* Outer Portal Ring */}
        <mesh>
          <torusGeometry args={[2.8, 0.1, 8, 50]} />
          <meshStandardMaterial
            color={universe.color}
            emissive={universe.color}
            emissiveIntensity={0.3}
            transparent
            opacity={0.6}
          />
        </mesh>
        
        {/* Main Portal Frame */}
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={handleClick}
        >
          <torusGeometry args={[2, 0.3, 16, 100]} />
          <meshStandardMaterial
            color={universe.color}
            emissive={universe.color}
            emissiveIntensity={hovered ? 0.8 : 0.4}
          />
        </mesh>
        
        {/* Portal Content */}
        <mesh>
          <circleGeometry args={[1.8, 64]} />
          <MeshDistortMaterial
            color={universe.color}
            speed={activated ? 10 : 5}
            distort={activated ? 0.6 : 0.3}
            radius={1}
            opacity={activated ? 0.9 : 0.7}
            transparent
          />
        </mesh>
        
        {/* Inner Energy Ring */}
        <mesh>
          <torusGeometry args={[1.5, 0.05, 8, 32]} />
          <meshStandardMaterial
            color={"#ffffff"}
            emissive={"#ffffff"}
            emissiveIntensity={hovered ? 0.5 : 0.2}
          />
        </mesh>
        
        {/* Sparkles around portal */}
        <Sparkles
          count={hovered ? 50 : 30}
          scale={hovered ? 4 : 3}
          size={hovered ? 3 : 2}
          speed={hovered ? 1 : 0.5}
          color={universe.color}
        />
        
        {/* Orbiting Elements */}
        {universe.skills.slice(0, 3).map((skill, index) => (
          <Float key={skill} speed={3 + index} rotationIntensity={0.5} floatIntensity={0.3}>
            <mesh position={[Math.cos((index * Math.PI * 2) / 3) * 3.5, Math.sin((index * Math.PI * 2) / 3) * 3.5, 0]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color={universe.color} emissive={universe.color} emissiveIntensity={0.5} />
            </mesh>
          </Float>
        ))}
        
        {/* Universe Name */}
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={0.25}
          height={0.05}
          position={[0, -3, 0]}
          rotation={[-universe.rotation[0], -universe.rotation[1], -universe.rotation[2]]}
        >
          {universe.name}
          <meshStandardMaterial 
            color={isVisited ? "#00ff00" : "#ffffff"} 
            emissive={isVisited ? "#00ff00" : "#ffffff"} 
            emissiveIntensity={0.3} 
          />
        </Text3D>
        
        {/* Visited Indicator */}
        {isVisited && (
          <mesh position={[0, -3.8, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.8} />
          </mesh>
        )}
        
        {/* Difficulty Indicator */}
        <group position={[0, 2.8, 0]}>
          {[...Array(universe.difficulty === 'beginner' ? 1 : universe.difficulty === 'intermediate' ? 2 : 3)].map((_, i) => (
            <mesh key={i} position={[i * 0.3 - 0.3, 0, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial 
                color={universe.difficulty === 'beginner' ? '#00ff00' : universe.difficulty === 'intermediate' ? '#ffff00' : '#ff0000'}
                emissive={universe.difficulty === 'beginner' ? '#00ff00' : universe.difficulty === 'intermediate' ? '#ffff00' : '#ff0000'}
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}
        </group>
        
        {/* Hover Info Panel */}
        {hovered && (
          <group position={[0, 4, 0]}>
            <RoundedBox args={[5, 2.5, 0.1]} radius={0.1}>
              <meshStandardMaterial 
                color="#000000" 
                opacity={0.9} 
                transparent 
              />
            </RoundedBox>
            <Text3D
              font="/fonts/helvetiker_regular.typeface.json"
              size={0.15}
              height={0.02}
              position={[-2.2, 0.5, 0.1]}
            >
              {universe.income}
              <meshStandardMaterial color="#ffffff" />
            </Text3D>
            <Text3D
              font="/fonts/helvetiker_regular.typeface.json"
              size={0.12}
              height={0.02}
              position={[-2.2, 0, 0.1]}
            >
              {universe.workStyle}
              <meshStandardMaterial color="#cccccc" />
            </Text3D>
            <Text3D
              font="/fonts/helvetiker_regular.typeface.json"
              size={0.1}
              height={0.02}
              position={[-2.2, -0.5, 0.1]}
            >
              {universe.timeToLaunch}
              <meshStandardMaterial color="#aaaaaa" />
            </Text3D>
          </group>
        )}
      </group>
    </Float>
  )
}

function EnhancedMultiverseScene() {
  const { camera } = useThree()
  const { cameraMode, selectedUniverse } = useMultiverseStore()
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    switch (cameraMode) {
      case 'explore':
        camera.position.z = 10 + Math.sin(time * 0.1) * 2
        camera.position.y = Math.sin(time * 0.05) * 0.5
        break
      case 'focus':
        if (selectedUniverse) {
          camera.position.lerp(
            new THREE.Vector3(selectedUniverse.position[0], selectedUniverse.position[1], 8),
            0.02
          )
        }
        break
      case 'compare':
        camera.position.z = 15
        camera.position.y = 5
        break
    }
  })
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      <OrbitControls
        enablePan={cameraMode === 'explore'}
        enableZoom={cameraMode === 'explore'}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
        maxDistance={20}
        minDistance={5}
      />
      
      {/* Enhanced Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} color="#ff6b9d" intensity={0.8} />
      <pointLight position={[0, 15, 0]} color="#4EB5FF" intensity={0.6} />
      <spotLight 
        position={[0, 0, 20]} 
        angle={0.3} 
        penumbra={0.5} 
        intensity={1} 
        color="#ffffff"
        castShadow
      />
      
      {/* Universe Portals */}
      <Suspense fallback={null}>
        {universes.map(universe => (
          <EnhancedUniversePortal key={universe.id} universe={universe} />
        ))}
      </Suspense>
      
      {/* Enhanced Background */}
      <Stars radius={200} depth={100} count={8000} factor={6} saturation={0} fade speed={0.5} />
      
      {/* Cosmic Dust Particles */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        {[...Array(20)].map((_, i) => (
          <mesh key={i} position={[
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 30
          ]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial 
              color={colors.primary} 
              emissive={colors.primary} 
              emissiveIntensity={0.3}
              transparent
              opacity={0.6}
            />
          </mesh>
        ))}
      </Float>
      
      {/* Central Energy Core */}
      <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
        <group position={[0, 0, -8]}>
          <mesh>
            <sphereGeometry args={[1.2, 32, 32]} />
            <MeshDistortMaterial
              color="#ffd700"
              speed={8}
              distort={0.8}
              radius={1.5}
              emissive="#ffd700"
              emissiveIntensity={0.8}
            />
          </mesh>
          
          {/* Energy Rings */}
          {[...Array(3)].map((_, i) => (
            <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]}>
              <torusGeometry args={[2 + i * 0.5, 0.05, 8, 32]} />
              <meshStandardMaterial 
                color="#ffffff" 
                emissive="#ffffff" 
                emissiveIntensity={0.5}
                transparent
                opacity={0.7}
              />
            </mesh>
          ))}
        </group>
      </Float>
      
      {/* Connection Lines between Universes */}
      {universes.map((universe, i) => 
        universes.slice(i + 1).map((otherUniverse, j) => (
          <line key={`${i}-${j}`}>
            <bufferGeometry attach="geometry">
              <bufferAttribute
                attach="attributes-position"
                array={new Float32Array([
                  ...universe.position,
                  ...otherUniverse.position
                ])}
                count={2}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial 
              attach="material" 
              color="#ffffff" 
              transparent 
              opacity={0.1}
            />
          </line>
        ))
      )}
    </>
  )
}

function EnhancedUniverseDetails({ universe }: { universe: Universe }) {
  const { setSelectedUniverse, universeMatches } = useMultiverseStore()
  const [activeTab, setActiveTab] = useState('overview')
  
  const matchData = universeMatches.find(match => match.universe.id === universe.id)
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="max-w-6xl w-full bg-gray-900/95 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ borderColor: universe.color, borderWidth: 2 }}
      >
        {/* Header */}
        <div 
          className="p-8 text-white relative"
          style={{ background: `linear-gradient(135deg, ${universe.color}22 0%, transparent 100%)` }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-4xl font-bold mb-2">{universe.name}</h2>
              <p className="text-xl opacity-90 mb-4">{universe.description}</p>
              {matchData && (
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold" style={{ color: universe.color }}>
                    {matchData.matchScore}% マッチ
                  </div>
                  <div className="flex gap-2">
                    {universe.features.slice(0, 3).map(feature => (
                      <span key={feature} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedUniverse(null)}
              className="text-white/70 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-800">
          <div className="flex px-8">
            {[
              { id: 'overview', label: '概要', icon: '🎯' },
              { id: 'success', label: '成功事例', icon: '🏆' },
              { id: 'roadmap', label: 'ロードマップ', icon: '🗺️' },
              { id: 'market', label: '市場分析', icon: '📊' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? 'border-purple-400 text-white' 
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {/* Income & Work Style */}
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    収入目安
                  </h3>
                  <p className="text-2xl font-bold mb-2" style={{ color: universe.color }}>
                    {universe.income}
                  </p>
                  <p className="text-sm text-gray-400">市場規模: {universe.marketSize}</p>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="text-2xl">🏖️</span>
                    ワークスタイル
                  </h3>
                  <p className="text-gray-300 mb-2">{universe.workStyle}</p>
                  <p className="text-sm text-gray-400">立ち上げ期間: {universe.timeToLaunch}</p>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    難易度 & 競争
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">難易度</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        universe.difficulty === 'beginner' ? 'bg-green-500/20 text-green-300' :
                        universe.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {universe.difficulty}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">競争レベル</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        universe.competitionLevel === 'low' ? 'bg-green-500/20 text-green-300' :
                        universe.competitionLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {universe.competitionLevel}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Skills - Full Width */}
                <div className="md:col-span-2 lg:col-span-3 bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    習得スキル
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {universe.skills.map((skill, index) => (
                      <motion.div
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg"
                      >
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: universe.color }}
                        />
                        <span className="text-gray-300 text-sm">{skill}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Features */}
                <div className="md:col-span-2 lg:col-span-3 bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    特徴・メリット
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {universe.features.map((feature, index) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center p-3 bg-gray-700/30 rounded-lg border border-gray-600"
                      >
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <SuccessStoriesCarousel universe={universe} />
              </motion.div>
            )}
            
            {activeTab === 'roadmap' && (
              <motion.div
                key="roadmap"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-white mb-4">🗺️ 起業ロードマップ</h3>
                <div className="space-y-4">
                  {[
                    { phase: 'Phase 1', title: '基礎学習期間', duration: '1-2ヶ月', description: '必要なスキルの習得と市場理解' },
                    { phase: 'Phase 2', title: 'プロトタイプ作成', duration: '1-3ヶ月', description: 'MVP開発と初期顧客獲得' },
                    { phase: 'Phase 3', title: '本格ローンチ', duration: '2-4ヶ月', description: 'サービス改善と売上拡大' },
                    { phase: 'Phase 4', title: 'スケーリング', duration: '6ヶ月〜', description: '組織化と市場拡大' }
                  ].map((step, index) => (
                    <motion.div
                      key={step.phase}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg"
                    >
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: universe.color }}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white">{step.title}</h4>
                          <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                            {step.duration}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">{step.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            
            {activeTab === 'market' && (
              <motion.div
                key="market"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    市場分析
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">市場規模</span>
                      <span className="font-semibold" style={{ color: universe.color }}>
                        {universe.marketSize}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">成長率</span>
                      <span className="text-green-400 font-semibold">年率15-25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">参入障壁</span>
                      <span className={`font-semibold ${
                        universe.difficulty === 'beginner' ? 'text-green-400' :
                        universe.difficulty === 'intermediate' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {universe.difficulty === 'beginner' ? '低' :
                         universe.difficulty === 'intermediate' ? '中' : '高'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    ターゲット分析
                  </h3>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="text-gray-400">主要顧客:</span>
                      <span className="text-white ml-2">中小企業・個人事業主</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">課題:</span>
                      <span className="text-white ml-2">デジタル化の遅れ</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">ニーズ:</span>
                      <span className="text-white ml-2">効率化・自動化</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Enhanced CTA */}
        <div className="p-8 border-t border-gray-800 bg-gray-800/30">
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${universe.color}50` }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-4 px-6 rounded-lg font-bold text-lg text-white"
              style={{ 
                background: `linear-gradient(135deg, ${universe.color} 0%, ${universe.color}cc 100%)` 
              }}
            >
              🚀 {universe.name}で起業を始める
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-white border border-gray-600"
            >
              📋 詳細資料をダウンロード
            </motion.button>
          </div>
          
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <span>✓ 無料カウンセリング</span>
            <span>✓ 30日間返金保証</span>
            <span>✓ 専属メンター付き</span>
            <span>✓ コミュニティアクセス</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center p-8 bg-black"
    >
      <div className="text-center max-w-3xl">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 1 }}
          className="text-8xl mb-8"
        >
          🌌
        </motion.div>
        
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-5xl md:text-7xl font-bold mb-6"
        >
          <span className="text-gradient">マルチバース</span>
          <br />
          起業の選択
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xl text-gray-300 mb-12"
        >
          無限の可能性が広がる5つの宇宙から、
          あなたの理想の起業スタイルを選択してください
        </motion.p>
        
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="px-12 py-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-bold text-xl"
        >
          マルチバースへ進む
        </motion.button>
      </div>
    </motion.div>
  )
}

function TransitionEffect() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 pointer-events-none"
    >
      <div className="absolute inset-0 bg-white">
        <motion.div
          animate={{
            scale: [1, 20],
            opacity: [1, 0]
          }}
          transition={{ duration: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
        </motion.div>
      </div>
    </motion.div>
  )
}

function EnhancedProgressIndicator() {
  const { visitedUniverses, testCompleted, universeMatches } = useMultiverseStore()
  const progress = (visitedUniverses.length / universes.length) * 100
  const topMatch = universeMatches.length > 0 ? universeMatches[0] : null
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-8 left-1/2 transform -translate-x-1/2 z-30"
    >
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl px-8 py-4 border border-gray-700">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-xs text-gray-400 block">探索進捗</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-40 bg-gray-700 rounded-full h-3 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </motion.div>
              </div>
              <span className="text-sm font-bold text-white">
                {visitedUniverses.length}/{universes.length}
              </span>
            </div>
          </div>
          
          {testCompleted && topMatch && (
            <div className="text-center border-l border-gray-600 pl-6">
              <span className="text-xs text-gray-400 block">推薦宇宙</span>
              <div className="flex items-center gap-2 mt-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: topMatch.universe.color }}
                />
                <span className="text-sm font-semibold text-white">
                  {topMatch.universe.name.replace('宇宙', '')}
                </span>
                <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: topMatch.universe.color }}>
                  {topMatch.matchScore}%
                </span>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            {visitedUniverses.map(id => {
              const universe = universes.find(u => u.id === id)
              return universe ? (
                <div
                  key={id}
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: universe.color }}
                  title={universe.name}
                />
              ) : null
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Main Component
export default function LP7_MultiverseSelection() {
  const [showIntro, setShowIntro] = useState(true)
  const { 
    selectedUniverse, 
    isTransitioning, 
    showPersonalityTest, 
    testCompleted,
    visitedUniverses,
    setCameraMode
  } = useMultiverseStore()
  const [showComparison, setShowComparison] = useState(false)
  const [showRecommendation, setShowRecommendation] = useState(false)
  
  // Show recommendation when test is completed and user has visited some universes
  useEffect(() => {
    if (testCompleted && visitedUniverses.length >= 2) {
      setShowRecommendation(true)
    }
  }, [testCompleted, visitedUniverses.length])
  
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <AnimatePresence>
        {showIntro ? (
          <IntroScreen onStart={() => setShowIntro(false)} />
        ) : (
          <>
            {/* Main 3D Scene */}
            <Canvas className="absolute inset-0">
              <MultiverseScene />
            </Canvas>
            
            {/* UI Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <ProgressIndicator />
              
              {/* Instructions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center pointer-events-auto"
              >
                <p className="text-gray-400 mb-2">
                  ポータルをクリックして各宇宙を探索
                </p>
                <p className="text-sm text-gray-500">
                  ドラッグで視点を回転 • すべての宇宙を訪れて理想の道を見つけよう
                </p>
              </motion.div>
              
              {/* Back to Home */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-8 right-8 px-6 py-3 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700 pointer-events-auto"
              >
                ホームへ戻る
              </motion.button>
            </div>
            
            {/* Universe Details Modal */}
            <AnimatePresence>
              {selectedUniverse && (
                <UniverseDetails universe={selectedUniverse} />
              )}
            </AnimatePresence>
            
            {/* Transition Effect */}
            <AnimatePresence>
              {isTransitioning && <TransitionEffect />}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}