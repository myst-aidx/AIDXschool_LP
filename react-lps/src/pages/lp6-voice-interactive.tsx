import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { create } from 'zustand'
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

const voiceWave = keyframes`
  0% {
    transform: scaleY(0.5);
  }
  50% {
    transform: scaleY(1.5);
  }
  100% {
    transform: scaleY(0.5);
  }
`

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 10px rgba(78, 181, 255, 0.5);
  }
  50% {
    box-shadow: 0 0 30px rgba(78, 181, 255, 1);
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

// スタイルコンポーネント
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    180deg,
    #0a0a0a 0%,
    #1a1a2e 15%,
    #16213e 30%,
    #0f3460 45%,
    #533483 60%,
    #7209b7 75%,
    #16213e 90%,
    #0a0a0a 100%
  );
  overflow-x: hidden;
  position: relative;
`

const VoiceWaveContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: 120px;
  
  .wave-bar {
    width: 4px;
    background: ${colors.gradient};
    border-radius: 2px;
    animation: ${voiceWave} 0.5s ease-in-out infinite;
    
    &:nth-child(2n) {
      animation-delay: 0.1s;
    }
    
    &:nth-child(3n) {
      animation-delay: 0.2s;
    }
    
    &:nth-child(4n) {
      animation-delay: 0.3s;
    }
  }
`

const MicButton = styled(motion.button)`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: none;
  background: ${colors.gradient};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  position: relative;
  animation: ${glow} 2s ease-in-out infinite;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &.listening {
    background: linear-gradient(135deg, #FF6B6B 0%, #EC4899 100%);
    animation: ${pulse} 1s ease-in-out infinite;
  }
`

const CoachCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
  }
  
  &.active {
    border-color: ${colors.primary};
    background: rgba(78, 181, 255, 0.1);
  }
`

const ModuleCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 12px;
  
  .progress-bar {
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 8px;
    
    .progress-fill {
      height: 100%;
      background: ${colors.gradient};
      transition: width 0.3s ease;
    }
  }
`

const AnalyticsCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  .metric {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
    }
    
    .value {
      color: ${colors.primary};
      font-size: 18px;
      font-weight: bold;
    }
  }
`

// Types
interface VoiceState {
  isListening: boolean
  transcript: string
  language: 'ja' | 'en'
  volume: number
  error: string | null
}

interface Conversation {
  id: string
  type: 'user' | 'ai'
  text: string
  timestamp: Date
}

// Voice Store
interface LearningModule {
  id: string
  title: string
  progress: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  skills: string[]
  estimatedTime: string
  unlocked: boolean
}

interface VoiceCoach {
  id: string
  name: string
  personality: string
  expertise: string[]
  avatar: string
  voice: 'male' | 'female'
  active: boolean
}

interface VoiceAnalytics {
  sessionTime: number
  wordsSpoken: number
  questionsAsked: number
  topicsDiscussed: string[]
  confidenceLevel: number
  engagementScore: number
}

interface VoiceStore {
  voiceState: VoiceState
  conversations: Conversation[]
  modules: LearningModule[]
  coaches: VoiceCoach[]
  analytics: VoiceAnalytics
  selectedCoach: string
  currentModule: string | null
  setListening: (isListening: boolean) => void
  setTranscript: (transcript: string) => void
  setVolume: (volume: number) => void
  setError: (error: string | null) => void
  addConversation: (type: 'user' | 'ai', text: string) => void
  clearConversations: () => void
  updateProgress: (moduleId: string, progress: number) => void
  selectCoach: (coachId: string) => void
  updateAnalytics: (updates: Partial<VoiceAnalytics>) => void
  setCurrentModule: (moduleId: string) => void
}

const useVoiceStore = create<VoiceStore>((set, get) => ({
  voiceState: {
    isListening: false,
    transcript: '',
    language: 'ja',
    volume: 0,
    error: null
  },
  conversations: [],
  modules: [
    {
      id: 'basics',
      title: 'AI×DX起業の基礎',
      progress: 0,
      difficulty: 'beginner',
      skills: ['AI理解', 'DX戦略', 'ビジネスモデル'],
      estimatedTime: '2週間',
      unlocked: true
    },
    {
      id: 'automation',
      title: 'ノーコード自動化',
      progress: 0,
      difficulty: 'intermediate',
      skills: ['Zapier', 'Make', 'Bubble'],
      estimatedTime: '3週間',
      unlocked: false
    },
    {
      id: 'scaling',
      title: 'スケーリング戦略',
      progress: 0,
      difficulty: 'advanced',
      skills: ['チーム構築', 'システム化', '資金調達'],
      estimatedTime: '4週間',
      unlocked: false
    }
  ],
  coaches: [
    {
      id: 'takeshi',
      name: '田中武志',
      personality: 'friendly',
      expertise: ['AI戦略', 'スタートアップ'],
      avatar: '👨‍💼',
      voice: 'male',
      active: true
    },
    {
      id: 'yuki',
      name: '佐藤雪',
      personality: 'analytical',
      expertise: ['DX推進', 'データ分析'],
      avatar: '👩‍💻',
      voice: 'female',
      active: false
    }
  ],
  analytics: {
    sessionTime: 0,
    wordsSpoken: 0,
    questionsAsked: 0,
    topicsDiscussed: [],
    confidenceLevel: 50,
    engagementScore: 0
  },
  selectedCoach: 'takeshi',
  currentModule: null,
  setListening: (isListening) => set((state) => ({
    voiceState: { ...state.voiceState, isListening }
  })),
  setTranscript: (transcript) => set((state) => ({
    voiceState: { ...state.voiceState, transcript }
  })),
  setVolume: (volume) => set((state) => ({
    voiceState: { ...state.voiceState, volume }
  })),
  setError: (error) => set((state) => ({
    voiceState: { ...state.voiceState, error }
  })),
  addConversation: (type, text) => set((state) => ({
    conversations: [...state.conversations, {
      id: Date.now().toString(),
      type,
      text,
      timestamp: new Date()
    }]
  })),
  clearConversations: () => set({ conversations: [] }),
  updateProgress: (moduleId, progress) => set((state) => ({
    modules: state.modules.map(module => 
      module.id === moduleId ? { ...module, progress } : module
    )
  })),
  selectCoach: (coachId) => set((state) => ({
    selectedCoach: coachId,
    coaches: state.coaches.map(coach => ({
      ...coach,
      active: coach.id === coachId
    }))
  })),
  updateAnalytics: (updates) => set((state) => ({
    analytics: { ...state.analytics, ...updates }
  })),
  setCurrentModule: (moduleId) => set({ currentModule: moduleId })
}))

// 高度なコンポーネント
function LearningModulesList() {
  const { modules, updateProgress, setCurrentModule } = useVoiceStore()
  
  const handleModuleClick = (moduleId: string) => {
    setCurrentModule(moduleId)
    // デモ用に進捗を少し進める
    const currentProgress = modules.find(m => m.id === moduleId)?.progress || 0
    if (currentProgress < 100) {
      updateProgress(moduleId, Math.min(currentProgress + 10, 100))
    }
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">
        🎓 学習モジュール
      </h3>
      {modules.map((module) => (
        <ModuleCard
          key={module.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => handleModuleClick(module.id)}
          className="cursor-pointer hover:scale-105 transition-transform"
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-white font-semibold">{module.title}</h4>
            <span className={`px-2 py-1 rounded text-xs ${
              module.difficulty === 'beginner' ? 'bg-green-500/20 text-green-300' :
              module.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
              'bg-red-500/20 text-red-300'
            }`}>
              {module.difficulty}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-2">
            ⏱️ {module.estimatedTime}
          </p>
          <div className="flex flex-wrap gap-1 mb-3">
            {module.skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded"
              >
                {skill}
              </span>
            ))}
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${module.progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            進捗: {module.progress}%
          </p>
        </ModuleCard>
      ))}
    </div>
  )
}

function CoachPersonalitySelector() {
  const { coaches, selectedCoach, selectCoach } = useVoiceStore()
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">
        🤖 AIコーチ選択
      </h3>
      <div className="grid gap-4">
        {coaches.map((coach) => (
          <CoachCard
            key={coach.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => selectCoach(coach.id)}
            className={coach.active ? 'active' : ''}
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">{coach.avatar}</div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">{coach.name}</h4>
                <p className="text-sm text-gray-400 capitalize">
                  {coach.personality} タイプ
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {coach.expertise.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              {coach.active && (
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              )}
            </div>
          </CoachCard>
        ))}
      </div>
    </div>
  )
}

function VoiceAnalyticsDashboard() {
  const { analytics } = useVoiceStore()
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <AnalyticsCard>
      <h3 className="text-xl font-bold text-white mb-6">
        📊 音声分析ダッシュボード
      </h3>
      
      <div className="metric">
        <span className="label">セッション時間</span>
        <span className="value">{formatTime(analytics.sessionTime)}</span>
      </div>
      
      <div className="metric">
        <span className="label">発話単語数</span>
        <span className="value">{analytics.wordsSpoken.toLocaleString()}</span>
      </div>
      
      <div className="metric">
        <span className="label">質問回数</span>
        <span className="value">{analytics.questionsAsked}</span>
      </div>
      
      <div className="metric">
        <span className="label">エンゲージメント</span>
        <span className="value">{analytics.engagementScore}%</span>
      </div>
      
      <div className="metric">
        <span className="label">理解度</span>
        <span className="value">{analytics.confidenceLevel}%</span>
      </div>
      
      {analytics.topicsDiscussed.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-400 mb-2">討論トピック:</p>
          <div className="flex flex-wrap gap-1">
            {analytics.topicsDiscussed.map((topic, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </AnalyticsCard>
  )
}

function AdvancedVoiceVisualizer({ isActive, volume }: { isActive: boolean, volume: number }) {
  return (
    <VoiceWaveContainer>
      {[...Array(50)].map((_, i) => {
        const height = isActive 
          ? Math.sin((i / 50) * Math.PI * 4) * (volume / 100) * 80 + 20
          : 20
        
        return (
          <motion.div
            key={i}
            className="wave-bar"
            animate={{
              height: `${height}px`,
              opacity: isActive ? 1 : 0.3
            }}
            transition={{
              duration: 0.1,
              ease: "easeOut"
            }}
          />
        )
      })}
    </VoiceWaveContainer>
  )
}

function InteractiveVoiceCommands() {
  const [expandedCommand, setExpandedCommand] = useState<string | null>(null)
  
  const advancedCommands = [
    {
      category: "学習相談",
      commands: [
        { command: "カリキュラムを教えて", description: "3ヶ月間の詳細カリキュラム説明", example: "どんなことを学ぶの？" },
        { command: "進捗状況確認", description: "現在の学習進捗とアドバイス", example: "今どこまで進んだ？" },
        { command: "次のステップ", description: "次に学ぶべき内容の提案", example: "次は何をすればいい？" }
      ]
    },
    {
      category: "起業相談",
      commands: [
        { command: "ビジネスアイデア", description: "AI×DXを活用したアイデア提案", example: "どんなビジネスができる？" },
        { command: "市場分析方法", description: "効果的な市場調査のやり方", example: "市場をどう分析する？" },
        { command: "収益化戦略", description: "月収100万円への道筋", example: "どうやって稼ぐの？" }
      ]
    },
    {
      category: "技術相談",
      commands: [
        { command: "ツール選定", description: "最適なノーコードツール選び", example: "どのツールがいい？" },
        { command: "自動化設計", description: "業務自動化の設計方法", example: "自動化はどう作る？" },
        { command: "AI活用法", description: "具体的なAI活用事例", example: "AIをどう使う？" }
      ]
    }
  ]
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">
        🎤 音声コマンド集
      </h3>
      {advancedCommands.map((category, categoryIndex) => (
        <div key={category.category} className="mb-6">
          <h4 className="text-lg font-semibold text-purple-300 mb-3">
            {category.category}
          </h4>
          <div className="space-y-2">
            {category.commands.map((cmd, index) => (
              <motion.div
                key={`${categoryIndex}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (categoryIndex * 3 + index) * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 cursor-pointer hover:bg-gray-700/50 transition-colors"
                onClick={() => setExpandedCommand(
                  expandedCommand === `${categoryIndex}-${index}` 
                    ? null 
                    : `${categoryIndex}-${index}`
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-blue-300">
                    「{cmd.command}」
                  </span>
                  <span className="text-xs text-gray-400">
                    {expandedCommand === `${categoryIndex}-${index}` ? '▼' : '▶'}
                  </span>
                </div>
                <AnimatePresence>
                  {expandedCommand === `${categoryIndex}-${index}` && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 pt-2 border-t border-gray-600"
                    >
                      <p className="text-xs text-gray-300 mb-1">
                        {cmd.description}
                      </p>
                      <p className="text-xs text-purple-300">
                        例: 「{cmd.example}」
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Components
function VoiceVisualizer({ isActive, volume }: { isActive: boolean, volume: number }) {
  const bars = 40
  const controls = useAnimation()
  
  useEffect(() => {
    if (isActive) {
      controls.start({
        scaleY: [1, 1.5, 1],
        transition: {
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse"
        }
      })
    } else {
      controls.stop()
      controls.set({ scaleY: 1 })
    }
  }, [isActive, controls])
  
  return (
    <div className="flex items-center justify-center gap-1 h-32">
      {[...Array(bars)].map((_, i) => {
        const height = isActive 
          ? Math.sin((i / bars) * Math.PI) * (volume / 100) * 80 + 20
          : 20
        
        return (
          <motion.div
            key={i}
            className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
            style={{
              width: '4px',
              height: `${height}%`
            }}
            animate={{
              height: `${height}%`,
              opacity: isActive ? 1 : 0.3
            }}
            transition={{
              duration: 0.1,
              ease: "easeOut"
            }}
          />
        )
      })}
    </div>
  )
}

function SpeechBubble({ conversation }: { conversation: Conversation }) {
  const isUser = conversation.type === 'user'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-xs lg:max-w-md ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
              : 'bg-gray-800 text-gray-100'
          }`}
        >
          <p className="text-sm lg:text-base">{conversation.text}</p>
        </div>
        <p className="text-xs text-gray-500 mt-1 px-2">
          {conversation.timestamp.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        isUser ? 'order-1 mr-3' : 'order-2 ml-3'
      } ${isUser ? 'bg-blue-500' : 'bg-purple-500'}`}>
        {isUser ? '👤' : '🤖'}
      </div>
    </motion.div>
  )
}

function SmartVoiceCommands() {
  const { selectedCoach, coaches } = useVoiceStore()
  const activeCoach = coaches.find(c => c.id === selectedCoach)
  
  const basicCommands = [
    { command: "こんにちは", description: "AIコーチとの会話開始" },
    { command: "カリキュラムを教えて", description: "学習内容の詳細説明" },
    { command: "進捗状況確認", description: "現在の学習進捗チェック" },
    { command: "次のステップ", description: "次に学ぶべき内容提案" },
    { command: "料金を教えて", description: "受講料金の詳細案内" },
    { command: "申し込み方法", description: "入学手続きの説明" }
  ]
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4 text-purple-400">
        🎯 音声コマンド（{activeCoach?.name}モード）
      </h3>
      <div className="space-y-2">
        {basicCommands.map((cmd, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col p-3 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors cursor-pointer"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm text-blue-300">「{cmd.command}」</span>
              <span className="text-xs text-green-400">✓</span>
            </div>
            <span className="text-xs text-gray-400">{cmd.description}</span>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
        <p className="text-xs text-purple-300">
          💡 ヒント: 自然な日本語で話しかけてください。AIが文脈を理解して適切に回答します。
        </p>
      </div>
    </div>
  )
}

function EnhancedMicrophoneButton() {
  const { voiceState, setListening, setError, updateAnalytics } = useVoiceStore()
  const recognitionRef = useRef<any>(null)
  const sessionStartTime = useRef<number>(Date.now())
  
  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('お使いのブラウザは音声認識に対応していません')
      return
    }
    
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.lang = 'ja-JP'
    recognition.continuous = true
    recognition.interimResults = true
    
    recognition.onstart = () => {
      setListening(true)
      setError(null)
      sessionStartTime.current = Date.now()
    }
    
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('')
      
      useVoiceStore.getState().setTranscript(transcript)
      
      // Check if the result is final
      if (event.results[event.results.length - 1].isFinal) {
        processVoiceCommand(transcript)
        
        // Update analytics
        const wordCount = transcript.split(' ').length
        updateAnalytics({
          wordsSpoken: useVoiceStore.getState().analytics.wordsSpoken + wordCount,
          sessionTime: Math.floor((Date.now() - sessionStartTime.current) / 1000)
        })
      }
    }
    
    recognition.onerror = (event: any) => {
      setError(`音声認識エラー: ${event.error}`)
      setListening(false)
    }
    
    recognition.onend = () => {
      setListening(false)
      const sessionDuration = Math.floor((Date.now() - sessionStartTime.current) / 1000)
      updateAnalytics({ sessionTime: sessionDuration })
    }
    
    recognition.start()
    recognitionRef.current = recognition
  }, [setListening, setError, updateAnalytics])
  
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setListening(false)
    }
  }, [setListening])
  
  const processVoiceCommand = (command: string) => {
    const { addConversation, updateAnalytics, selectedCoach, coaches } = useVoiceStore.getState()
    
    // Add user message
    addConversation('user', command)
    
    // Update analytics
    const isQuestion = command.includes('？') || command.includes('?') || 
                      command.includes('どう') || command.includes('なに') || 
                      command.includes('いつ') || command.includes('どこ')
    
    if (isQuestion) {
      updateAnalytics({
        questionsAsked: useVoiceStore.getState().analytics.questionsAsked + 1
      })
    }
    
    // Advanced response logic with coach personality
    const activeCoach = coaches.find(c => c.id === selectedCoach)
    let response = ''
    let topics: string[] = []
    
    if (command.includes('こんにちは') || command.includes('ハロー')) {
      response = `こんにちは！私は${activeCoach?.name}です。AIDXschoolでAI×DX起業をサポートします。何かご質問はありますか？`
      topics = ['挨拶']
    } else if (command.includes('カリキュラム') || command.includes('学習内容')) {
      response = 'AIDXschoolでは3ヶ月で起業スキルを身につけます。1ヶ月目：基礎知識、2ヶ月目：ツール習得、3ヶ月目：実践とローンチ。具体的にどの部分について詳しく知りたいですか？'
      topics = ['カリキュラム', '学習計画']
    } else if (command.includes('進捗') || command.includes('どこまで')) {
      const modules = useVoiceStore.getState().modules
      const totalProgress = modules.reduce((sum, m) => sum + m.progress, 0) / modules.length
      response = `現在の学習進捗は${Math.round(totalProgress)}%です。${totalProgress < 30 ? '基礎固めの段階ですね' : totalProgress < 70 ? '順調に進んでいます' : '素晴らしい進捗です！'}。次は何を学習しましょうか？`
      topics = ['進捗確認', '学習状況']
    } else if (command.includes('起業') || command.includes('ビジネス')) {
      response = 'AIDXschoolでは、AI×DXを活用した起業方法を実践的に学べます。ノーコードツールを使って、最短3ヶ月で月収100万円を目指します。どのような分野での起業をお考えですか？'
      topics = ['起業', 'ビジネスモデル']
    } else if (command.includes('料金') || command.includes('価格') || command.includes('費用')) {
      response = '受講料は月額制で、基本コース29,800円、プレミアムコース49,800円をご用意しています。無料体験期間もありますので、まずはお試しください。'
      topics = ['料金', '費用']
    } else if (command.includes('申し込み') || command.includes('申込') || command.includes('入学')) {
      response = '申し込みは簡単3ステップです！1.無料相談予約、2.カウンセリング、3.コース選択。今すぐ無料相談から始めませんか？'
      topics = ['申込手続き', '入学']
    } else if (command.includes('ツール') || command.includes('技術')) {
      response = 'Zapier、Make、Bubble、Notion、ChatGPTなど、最新のノーコードツールとAIを組み合わせて効率的なビジネスを構築します。具体的にどのツールについて知りたいですか？'
      topics = ['ツール', '技術スタック']
    } else if (command.includes('成功事例') || command.includes('実績')) {
      response = '受講生の90%が3ヶ月以内に収益化に成功しています。例えば、AI チャットボット事業で月収50万円、自動化コンサルで月収80万円など、多様な成功例があります。'
      topics = ['成功事例', '実績']
    } else {
      response = `${activeCoach?.name}です。ご質問ありがとうございます。より詳しくお答えするために、無料相談をご利用ください。どのような分野について詳しく知りたいですか？`
      topics = ['一般的な質問']
    }
    
    // Update topics discussed
    const currentTopics = useVoiceStore.getState().analytics.topicsDiscussed
    const newTopics = [...new Set([...currentTopics, ...topics])]
    updateAnalytics({ topicsDiscussed: newTopics })
    
    // Add AI response with delay
    setTimeout(() => {
      addConversation('ai', response)
      speak(response)
      
      // Update engagement score based on interaction
      const currentEngagement = useVoiceStore.getState().analytics.engagementScore
      updateAnalytics({
        engagementScore: Math.min(currentEngagement + 5, 100)
      })
    }, 1000)
  }
  
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ja-JP'
      utterance.rate = 1.0
      utterance.pitch = 1.0
      speechSynthesis.speak(utterance)
    }
  }
  
  return (
    <MicButton
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={voiceState.isListening ? stopListening : startListening}
      className={voiceState.isListening ? 'listening' : ''}
    >
      <motion.div
        animate={voiceState.isListening ? { 
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0]
        } : { scale: 1 }}
        transition={{ 
          duration: 1, 
          repeat: voiceState.isListening ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {voiceState.isListening ? '🔴' : '🎙️'}
      </motion.div>
      
      {voiceState.isListening && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-white"
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-red-300"
            initial={{ scale: 1.2, opacity: 0.5 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </>
      )}
    </MicButton>
  )
}

function TranscriptDisplay() {
  const { voiceState } = useVoiceStore()
  
  return (
    <AnimatePresence>
      {voiceState.transcript && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 max-w-lg mx-auto"
        >
          <p className="text-gray-300 text-sm">認識中のテキスト:</p>
          <p className="text-white text-lg mt-2">{voiceState.transcript}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Main Component
export default function LP6_VoiceInteractive() {
  const { conversations, voiceState, setVolume, updateAnalytics } = useVoiceStore()
  const conversationEndRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to latest message
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversations])
  
  // Enhanced Volume meter with analytics
  useEffect(() => {
    if (!voiceState.isListening) return
    
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const audioContext = new AudioContext()
        const analyser = audioContext.createAnalyser()
        const microphone = audioContext.createMediaStreamSource(stream)
        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        
        microphone.connect(analyser)
        analyser.fftSize = 512
        
        let volumeHistory: number[] = []
        
        const checkVolume = () => {
          analyser.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          setVolume(average)
          
          // Track volume history for confidence analysis
          volumeHistory.push(average)
          if (volumeHistory.length > 100) volumeHistory.shift()
          
          // Update confidence level based on voice clarity
          const avgVolume = volumeHistory.reduce((a, b) => a + b, 0) / volumeHistory.length
          const confidenceLevel = Math.min(Math.max((avgVolume / 50) * 100, 20), 100)
          updateAnalytics({ confidenceLevel })
          
          if (voiceState.isListening) {
            requestAnimationFrame(checkVolume)
          }
        }
        
        checkVolume()
        
        return () => {
          stream.getTracks().forEach(track => track.stop())
          audioContext.close()
        }
      })
      .catch(err => {
        console.error('Microphone access error:', err)
        updateAnalytics({ confidenceLevel: 0 })
      })
  }, [voiceState.isListening, setVolume, updateAnalytics])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 p-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-white mb-4"
        >
          <span className="text-gradient">声で対話する</span>
          <br />
          起業相談AI
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-300"
        >
          マイクボタンを押して、AIアドバイザーと話してみましょう
        </motion.p>
      </header>
      
      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 pb-32">
        {/* Learning Modules Section */}
        <Container>
          <div className="max-w-4xl mx-auto mb-12">
            <LearningModulesList />
          </div>
        </Container>
        
        {/* Interactive Voice Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Left Panel - Enhanced Features */}
          <div className="lg:col-span-1 space-y-6">
            <SmartVoiceCommands />
            <CoachPersonalitySelector />
          </div>
          
          {/* Center - Enhanced Voice Interface */}
          <div className="lg:col-span-1 flex flex-col items-center">
            <AdvancedVoiceVisualizer isActive={voiceState.isListening} volume={voiceState.volume} />
            
            <div className="my-8">
              <EnhancedMicrophoneButton />
            </div>
            
            <p className="text-gray-400 text-center mb-4">
              {voiceState.isListening ? 'お話しください...' : 'マイクをタップして開始'}
            </p>
            
            <TranscriptDisplay />
            
            {voiceState.error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300"
              >
                {voiceState.error}
              </motion.div>
            )}
          </div>
          
          {/* Right Panel - Analytics & Conversation */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 h-64 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 text-purple-400">
                💬 AI対話履歴
              </h3>
              <div className="space-y-4">
                {conversations.length === 0 ? (
                  <p className="text-gray-500 text-center text-sm">
                    音声でAIコーチと対話してみましょう
                  </p>
                ) : (
                  conversations.map(conv => (
                    <SpeechBubble key={conv.id} conversation={conv} />
                  ))
                )}
                <div ref={conversationEndRef} />
              </div>
            </div>
            
            <VoiceAnalyticsDashboard />
          </div>
        </div>
        
        {/* Interactive Voice Commands Guide */}
        <div className="max-w-4xl mx-auto mt-12">
          <InteractiveVoiceCommands />
        </div>
        
        {/* Enhanced CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              🎆 未来の起業家になりませんか？
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              音声でAIコーチと対話し、あなたの起業プランを一緒に練り上げましょう。
              AI×DXを活用した最新の起業手法を3ヶ月でマスターし、月収100万円を目指しませんか？
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(78, 181, 255, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full font-bold text-lg text-white shadow-lg"
              >
                📞 無料音声相談を予約
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-transparent border-2 border-purple-400 rounded-full font-bold text-lg text-purple-300 hover:bg-purple-400/10 transition-colors"
              >
                📄 詳細資料をダウンロード
              </motion.button>
            </div>
            
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <span>✓ 無料体験期間あり</span>
              <span>✓ 24時間サポート</span>
              <span>✓ 成功まで徹底サポート</span>
            </div>
          </div>
        </motion.div>
      </main>
      
      {/* Enhanced Feature Pills */}
      <div className="fixed bottom-8 left-8 right-8 flex justify-center gap-3 flex-wrap z-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-purple-500/30 hover:border-purple-400 transition-colors cursor-pointer"
          whileHover={{ scale: 1.05, y: -2 }}
        >
          🔒 プライバシー保護
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-blue-500/30 hover:border-blue-400 transition-colors cursor-pointer"
          whileHover={{ scale: 1.05, y: -2 }}
        >
          🌐 日本語・英語対応
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-green-500/30 hover:border-green-400 transition-colors cursor-pointer"
          whileHover={{ scale: 1.05, y: -2 }}
        >
          ♿ アクセシビリティ対応
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-yellow-500/30 hover:border-yellow-400 transition-colors cursor-pointer"
          whileHover={{ scale: 1.05, y: -2 }}
        >
          🤖 AIコーチ常駐
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-pink-500/30 hover:border-pink-400 transition-colors cursor-pointer"
          whileHover={{ scale: 1.05, y: -2 }}
        >
          📈 リアルタイム分析
        </motion.div>
      </div>
      
      {/* Floating Success Stories */}
      <div className="fixed top-1/2 right-8 transform -translate-y-1/2 z-40 hidden xl:block">
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-400/30 max-w-xs"
        >
          <h4 className="text-sm font-bold text-green-300 mb-2">
            🎆 最新成果
          </h4>
          <p className="text-xs text-gray-300 mb-1">
            田中さん（IT業界）
          </p>
          <p className="text-xs text-gray-400">
            AIチャットボット事業で月収<span className="text-green-300 font-bold">85万円</span>達成！
          </p>
        </motion.div>
      </div>
      
      {/* Floating Learning Progress */}
      <div className="fixed top-1/3 left-8 z-40 hidden xl:block">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-4 border border-purple-400/30 max-w-xs"
        >
          <h4 className="text-sm font-bold text-purple-300 mb-2">
            📊 リアルタイム状況
          </h4>
          <div className="space-y-2">
            <div className="text-xs">
              <span className="text-gray-400">オンライン中:</span>
              <span className="text-green-300 font-bold ml-1">127名</span>
            </div>
            <div className="text-xs">
              <span className="text-gray-400">今日の相談:</span>
              <span className="text-blue-300 font-bold ml-1">43件</span>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Global Styles for Text Gradient */}
      <style jsx global>{`
        .text-gradient {
          background: linear-gradient(135deg, #4EB5FF 0%, #38C172 50%, #FFD93D 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .wave-bar {
          background: linear-gradient(135deg, #4EB5FF 0%, #38C172 50%, #FFD93D 100%);
        }
        
        /* カスタムスクロールバー */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #4EB5FF, #9333EA);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #38C172, #EC4899);
        }
      `}</style>
    </div>
  )
}