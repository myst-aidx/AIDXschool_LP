import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from 'framer-motion'
import { useSpring, animated } from 'react-spring'
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

const bookOpen = keyframes`
  from {
    transform: rotateY(-90deg);
  }
  to {
    transform: rotateY(0deg);
  }
`

const pageFlip = keyframes`
  0% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(-90deg);
  }
  100% {
    transform: rotateY(0deg);
  }
`

const sparkle = keyframes`
  0%, 100% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1) rotate(180deg);
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

// スタイルコンポーネント
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #1e1b4b 0%,
    #581c87 25%,
    #7c2d12 50%,
    #9d174d 75%,
    #1e1b4b 100%
  );
  position: relative;
  overflow: hidden;
`

const BookContainer = styled(motion.div)`
  perspective: 1000px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
`

const BookCoverStyled = styled(motion.div)`
  width: 400px;
  height: 600px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transform-style: preserve-3d;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 0;
    bottom: 0;
    width: 20px;
    background: linear-gradient(90deg, rgba(0,0,0,0.3), transparent);
    border-radius: 12px 0 0 12px;
    transform: translateZ(-10px);
  }
`

const PageContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  min-height: 700px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${colors.gradient};
  }
`

const IllustrationContainer = styled(motion.div)`
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  
  &:hover {
    transform: scale(1.02);
    transition: transform 0.3s ease;
  }
`

const ChoiceButton = styled(motion.button)`
  padding: 12px 24px;
  background: ${colors.gradient};
  border: none;
  border-radius: 25px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(78, 181, 255, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(78, 181, 255, 0.4);
  }
`

const NavigationButton = styled(motion.button)`
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.primary {
    background: ${colors.purple};
    color: white;
    
    &:hover:not(:disabled) {
      background: ${colors.pink};
    }
  }
  
  &.secondary {
    background: #f3f4f6;
    color: #374151;
    
    &:hover:not(:disabled) {
      background: #e5e7eb;
    }
  }
`

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin: 1rem 0;
  
  .fill {
    height: 100%;
    background: ${colors.gradient};
    transition: width 0.5s ease;
  }
`

// Types
interface Page {
  id: number
  title: string
  content: string
  illustration: JSX.Element
  interactive?: {
    type: 'click' | 'hover' | 'choice'
    action: () => void
  }
  choices?: {
    text: string
    nextPage: number
    consequence?: string
  }[]
  type?: 'intro' | 'story' | 'choice' | 'ending'
  character?: {
    name: string
    emotion: 'happy' | 'sad' | 'excited' | 'thoughtful' | 'determined'
  }
  backgroundMusic?: string
  soundEffect?: string
}

interface StoryState {
  currentPage: number
  visitedPages: number[]
  choices: Record<number, number>
  readingTime: number
  bookmarks: number[]
  achievements: Achievement[]
  personalityProfile: PersonalityProfile
  userProgress: UserProgress
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: Date
}

interface PersonalityProfile {
  riskTaking: number
  creativity: number
  leadership: number
  techSavvy: number
  socialSkills: number
}

interface UserProgress {
  pagesRead: number
  choicesMade: number
  timeSpent: number
  completionRate: number
  favoriteEnding?: number
}

interface StoryStore {
  storyState: StoryState
  soundEnabled: boolean
  animationsEnabled: boolean
  readingSpeed: 'slow' | 'normal' | 'fast'
  setCurrentPage: (page: number) => void
  addVisitedPage: (page: number) => void
  addChoice: (pageId: number, choice: number) => void
  updateReadingTime: (time: number) => void
  addBookmark: (page: number) => void
  removeBookmark: (page: number) => void
  unlockAchievement: (achievementId: string) => void
  updatePersonalityProfile: (updates: Partial<PersonalityProfile>) => void
  updateUserProgress: (updates: Partial<UserProgress>) => void
  setSoundEnabled: (enabled: boolean) => void
  setAnimationsEnabled: (enabled: boolean) => void
  setReadingSpeed: (speed: 'slow' | 'normal' | 'fast') => void
  resetStory: () => void
}

// Zustand Store
const useStoryStore = create<StoryStore>((set, get) => ({
  storyState: {
    currentPage: 0,
    visitedPages: [0],
    choices: {},
    readingTime: 0,
    bookmarks: [],
    achievements: [],
    personalityProfile: {
      riskTaking: 50,
      creativity: 50,
      leadership: 50,
      techSavvy: 50,
      socialSkills: 50
    },
    userProgress: {
      pagesRead: 1,
      choicesMade: 0,
      timeSpent: 0,
      completionRate: 0
    }
  },
  soundEnabled: true,
  animationsEnabled: true,
  readingSpeed: 'normal',
  setCurrentPage: (page) => set((state) => ({
    storyState: { ...state.storyState, currentPage: page }
  })),
  addVisitedPage: (page) => set((state) => ({
    storyState: {
      ...state.storyState,
      visitedPages: [...new Set([...state.storyState.visitedPages, page])],
      pagesRead: state.storyState.visitedPages.length + 1
    }
  })),
  addChoice: (pageId, choice) => set((state) => ({
    storyState: {
      ...state.storyState,
      choices: { ...state.storyState.choices, [pageId]: choice },
      choicesMade: Object.keys(state.storyState.choices).length + 1
    }
  })),
  updateReadingTime: (time) => set((state) => ({
    storyState: { ...state.storyState, readingTime: time }
  })),
  addBookmark: (page) => set((state) => ({
    storyState: {
      ...state.storyState,
      bookmarks: [...state.storyState.bookmarks, page]
    }
  })),
  removeBookmark: (page) => set((state) => ({
    storyState: {
      ...state.storyState,
      bookmarks: state.storyState.bookmarks.filter(p => p !== page)
    }
  })),
  unlockAchievement: (achievementId) => set((state) => ({
    storyState: {
      ...state.storyState,
      achievements: state.storyState.achievements.map(a =>
        a.id === achievementId ? { ...a, unlocked: true, unlockedAt: new Date() } : a
      )
    }
  })),
  updatePersonalityProfile: (updates) => set((state) => ({
    storyState: {
      ...state.storyState,
      personalityProfile: { ...state.storyState.personalityProfile, ...updates }
    }
  })),
  updateUserProgress: (updates) => set((state) => ({
    storyState: {
      ...state.storyState,
      userProgress: { ...state.storyState.userProgress, ...updates }
    }
  })),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  setAnimationsEnabled: (enabled) => set({ animationsEnabled: enabled }),
  setReadingSpeed: (speed) => set({ readingSpeed: speed }),
  resetStory: () => set((state) => ({
    storyState: {
      currentPage: 0,
      visitedPages: [0],
      choices: {},
      readingTime: 0,
      bookmarks: [],
      achievements: state.storyState.achievements.map(a => ({ ...a, unlocked: false, unlockedAt: undefined })),
      personalityProfile: {
        riskTaking: 50,
        creativity: 50,
        leadership: 50,
        techSavvy: 50,
        socialSkills: 50
      },
      userProgress: {
        pagesRead: 1,
        choicesMade: 0,
        timeSpent: 0,
        completionRate: 0
      }
    }
  }))
}))

// 実績システム
const defaultAchievements: Achievement[] = [
  {
    id: 'first_choice',
    title: '最初の選択',
    description: '初めて選択肢を選びました',
    icon: '🎯',
    unlocked: false
  },
  {
    id: 'ai_path',
    title: 'AIマスター',
    description: 'AI学習の道を選択しました',
    icon: '🤖',
    unlocked: false
  },
  {
    id: 'business_path',
    title: 'ビジネス構築者',
    description: 'ビジネス構築の道を選択しました',
    icon: '💼',
    unlocked: false
  },
  {
    id: 'marketing_path',
    title: 'マーケター',
    description: 'マーケティング自動化の道を選択しました',
    icon: '📈',
    unlocked: false
  },
  {
    id: 'story_complete',
    title: '物語完走',
    description: 'ストーリーを最後まで読みました',
    icon: '🏆',
    unlocked: false
  },
  {
    id: 'explorer',
    title: '探検家',
    description: 'すべてのページを訪問しました',
    icon: '🗺️',
    unlocked: false
  }
]

// 高度なコンポーネント
function AchievementNotification({ achievement }: { achievement: Achievement }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      className="fixed top-8 right-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{achievement.icon}</span>
        <div>
          <h4 className="font-bold">{achievement.title}</h4>
          <p className="text-sm opacity-90">{achievement.description}</p>
        </div>
      </div>
    </motion.div>
  )
}

function ProgressDashboard() {
  const { storyState } = useStoryStore()
  const { userProgress, achievements } = storyState
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4"
    >
      <h3 className="text-white font-semibold mb-3">📊 読書進捗</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="text-white">
          <div className="text-2xl font-bold text-blue-300">{userProgress.pagesRead}</div>
          <div className="text-xs opacity-75">ページ読了</div>
        </div>
        <div className="text-white">
          <div className="text-2xl font-bold text-green-300">{userProgress.choicesMade}</div>
          <div className="text-xs opacity-75">選択実行</div>
        </div>
        <div className="text-white">
          <div className="text-2xl font-bold text-yellow-300">{Math.floor(userProgress.timeSpent / 60)}分</div>
          <div className="text-xs opacity-75">読書時間</div>
        </div>
        <div className="text-white">
          <div className="text-2xl font-bold text-purple-300">{achievements.filter(a => a.unlocked).length}</div>
          <div className="text-xs opacity-75">実績解除</div>
        </div>
      </div>
    </motion.div>
  )
}

function BookmarkButton({ pageId }: { pageId: number }) {
  const { storyState, addBookmark, removeBookmark } = useStoryStore()
  const isBookmarked = storyState.bookmarks.includes(pageId)
  
  const handleBookmark = () => {
    if (isBookmarked) {
      removeBookmark(pageId)
    } else {
      addBookmark(pageId)
    }
  }
  
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleBookmark}
      className={`p-2 rounded-full transition-colors ${
        isBookmarked ? 'bg-yellow-500 text-white' : 'bg-white/20 text-yellow-300'
      }`}
    >
      {isBookmarked ? '⭐' : '☆'}
    </motion.button>
  )
}

function ReadingSettings() {
  const { soundEnabled, animationsEnabled, readingSpeed, setSoundEnabled, setAnimationsEnabled, setReadingSpeed } = useStoryStore()
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4"
    >
      <h3 className="text-white font-semibold mb-3">⚙️ 読書設定</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white text-sm">音響効果</span>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-12 h-6 rounded-full transition-colors ${
              soundEnabled ? 'bg-green-500' : 'bg-gray-400'
            } relative`}
          >
            <motion.div
              animate={{ x: soundEnabled ? 24 : 0 }}
              className="w-6 h-6 bg-white rounded-full absolute"
            />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white text-sm">アニメーション</span>
          <button
            onClick={() => setAnimationsEnabled(!animationsEnabled)}
            className={`w-12 h-6 rounded-full transition-colors ${
              animationsEnabled ? 'bg-green-500' : 'bg-gray-400'
            } relative`}
          >
            <motion.div
              animate={{ x: animationsEnabled ? 24 : 0 }}
              className="w-6 h-6 bg-white rounded-full absolute"
            />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white text-sm">読書速度</span>
          <select
            value={readingSpeed}
            onChange={(e) => setReadingSpeed(e.target.value as 'slow' | 'normal' | 'fast')}
            className="bg-white/20 text-white rounded px-2 py-1 text-sm"
          >
            <option value="slow">ゆっくり</option>
            <option value="normal">普通</option>
            <option value="fast">高速</option>
          </select>
        </div>
      </div>
    </motion.div>
  )
}


// 拡張されたイラストコンポーネント
function Illustration1() {
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([])
  const [characterMood, setCharacterMood] = useState<'neutral' | 'happy' | 'excited'>('neutral')
  const { soundEnabled } = useStoryStore()
  
  const addSparkle = (e: React.MouseEvent<SVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const newSparkle = { id: Date.now(), x, y }
    setSparkles(prev => [...prev, newSparkle])
    setCharacterMood('excited')
    
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => s.id !== newSparkle.id))
      setCharacterMood('happy')
    }, 1000)
    
    setTimeout(() => {
      setCharacterMood('neutral')
    }, 2000)
  }
  
  return (
    <IllustrationContainer>
      <svg viewBox="0 0 400 300" className="w-full h-full cursor-pointer" onClick={addSparkle}>
        <defs>
          <radialGradient id="bgGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#4338ca" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>
        </defs>
        
        <rect width="400" height="300" fill="url(#bgGradient)" />
        
        {[...Array(30)].map((_, i) => (
          <motion.circle
            key={i}
            cx={Math.random() * 400}
            cy={Math.random() * 200}
            r={Math.random() * 2 + 1}
            fill="#ffd700"
            filter="url(#glow)"
            animate={{ 
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{ 
              duration: Math.random() * 3 + 2, 
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
        
        <motion.g
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 20, duration: 1 }}
        >
          <defs>
            <radialGradient id="charGradient">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </radialGradient>
          </defs>
          
          <motion.circle 
            cx="200" 
            cy="200" 
            r="40" 
            fill="url(#charGradient)"
            filter="url(#glow)"
            animate={characterMood === 'excited' ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          />
          
          <motion.circle 
            cx="185" 
            cy="190" 
            r="5" 
            fill="#000"
            animate={characterMood === 'happy' ? { scaleY: [1, 0.1, 1] } : {}}
            transition={{ duration: 0.2, repeat: characterMood === 'happy' ? 3 : 0 }}
          />
          <motion.circle 
            cx="215" 
            cy="190" 
            r="5" 
            fill="#000"
            animate={characterMood === 'happy' ? { scaleY: [1, 0.1, 1] } : {}}
            transition={{ duration: 0.2, repeat: characterMood === 'happy' ? 3 : 0 }}
          />
          
          <motion.path 
            d={characterMood === 'excited' ? "M 175 210 Q 200 230 225 210" : 
               characterMood === 'happy' ? "M 180 210 Q 200 225 220 210" :
               "M 180 210 Q 200 220 220 210"}
            stroke="#000" 
            strokeWidth="3" 
            fill="none"
          />
          
          {characterMood === 'excited' && (
            <motion.circle
              cx="200"
              cy="200"
              r="50"
              fill="none"
              stroke="#ffd700"
              strokeWidth="2"
              opacity="0.5"
              animate={{ r: [40, 60, 40], opacity: [0.5, 0.1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.g>
        
        <AnimatePresence>
          {sparkles.map(sparkle => (
            <motion.g key={sparkle.id}>
              <motion.text
                x={sparkle.x}
                y={sparkle.y}
                fontSize="24"
                initial={{ scale: 0, opacity: 1, rotate: 0 }}
                animate={{ 
                  scale: [0, 1.5, 0], 
                  opacity: [1, 1, 0], 
                  y: sparkle.y - 50,
                  rotate: [0, 360]
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                ✨
              </motion.text>
              
              {[...Array(5)].map((_, i) => (
                <motion.circle
                  key={i}
                  cx={sparkle.x}
                  cy={sparkle.y}
                  r="2"
                  fill="#ffd700"
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [1, 0.5, 0],
                    x: sparkle.x + (Math.random() - 0.5) * 80,
                    y: sparkle.y + (Math.random() - 0.5) * 80
                  }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                />
              ))}
            </motion.g>
          ))}
        </AnimatePresence>
        
        <motion.text 
          x="200" 
          y="280" 
          textAnchor="middle" 
          fill="#fff" 
          fontSize="16" 
          fontFamily="sans-serif"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          魔法の力でクリックして夢を叶えよう！✨
        </motion.text>
      </svg>
    </IllustrationContainer>
  )
}

// Illustrations Components
function Illustration2() {
  const [isFlying, setIsFlying] = useState(false)
  const [rocketTrail, setRocketTrail] = useState<{x: number, y: number, id: number}[]>([])
  const { soundEnabled } = useStoryStore()
  
  const handleRocketInteraction = () => {
    setIsFlying(true)
    
    const trailInterval = setInterval(() => {
      setRocketTrail(prev => [
        ...prev,
        { x: 200, y: 200 + Math.random() * 10, id: Date.now() }
      ])
    }, 100)
    
    setTimeout(() => {
      clearInterval(trailInterval)
      setIsFlying(false)
      setRocketTrail([])
    }, 2000)
  }
  
  return (
    <IllustrationContainer>
      <svg viewBox="0 0 400 300" className="w-full h-full">
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="50%" stopColor="#98d8e8" />
            <stop offset="100%" stopColor="#FFE4B5" />
          </linearGradient>
          <filter id="cloudFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1"/>
          </filter>
        </defs>
        
        <rect width="400" height="300" fill="url(#skyGradient)" />
        
        <motion.g animate={{ x: [-50, 450] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}>
          <ellipse cx="50" cy="50" rx="40" ry="20" fill="#fff" opacity="0.8" filter="url(#cloudFilter)" />
          <ellipse cx="80" cy="45" rx="30" ry="15" fill="#fff" opacity="0.9" filter="url(#cloudFilter)" />
        </motion.g>
        
        <motion.g animate={{ x: [-100, 500] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
          <ellipse cx="150" cy="80" rx="50" ry="25" fill="#fff" opacity="0.7" filter="url(#cloudFilter)" />
          <ellipse cx="180" cy="75" rx="35" ry="18" fill="#fff" opacity="0.8" filter="url(#cloudFilter)" />
        </motion.g>
        
        {[...Array(3)].map((_, i) => (
          <motion.path
            key={i}
            d="M 0 0 Q 5 -3 10 0 Q 15 -3 20 0"
            stroke="#333"
            strokeWidth="2"
            fill="none"
            initial={{ x: -20, y: 60 + i * 20 }}
            animate={{ x: 420, y: 60 + i * 20 + Math.sin(i) * 10 }}
            transition={{ duration: 15 + i * 2, repeat: Infinity, ease: "linear" }}
          />
        ))}
        
        <AnimatePresence>
          {rocketTrail.map(particle => (
            <motion.circle
              key={particle.id}
              cx={particle.x}
              cy={particle.y}
              r="3"
              fill="#ff6b6b"
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 0.1, y: particle.y + 20 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          ))}
        </AnimatePresence>
        
        <motion.g
          animate={isFlying ? { y: -200, x: 100, rotate: -15 } : { y: 0, x: 0, rotate: 0 }}
          transition={{ duration: 2, type: "spring", bounce: 0.3 }}
          onHoverStart={handleRocketInteraction}
          className="cursor-pointer"
        >
          <g transform="translate(200, 200)">
            <ellipse cx="5" cy="25" rx="20" ry="8" fill="rgba(0,0,0,0.2)" />
            
            <defs>
              <linearGradient id="rocketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff6b6b" />
                <stop offset="100%" stopColor="#ff4444" />
              </linearGradient>
            </defs>
            
            <path d="M 0 -40 L -15 10 L -10 20 L 10 20 L 15 10 Z" fill="url(#rocketGradient)" />
            <path d="M 0 -40 L -10 -20 L 10 -20 Z" fill="#ff4444" />
            
            <circle cx="0" cy="-20" r="8" fill="#4a90e2" />
            <circle cx="0" cy="-20" r="6" fill="#87CEEB" opacity="0.7" />
            
            <path d="M -15 10 L -20 15 L -10 15 Z" fill="#ff4444" />
            <path d="M 15 10 L 20 15 L 10 15 Z" fill="#ff4444" />
            
            {isFlying && (
              <motion.g>
                <motion.path 
                  d="M -8 20 L 0 45 L 8 20" 
                  fill="#ffa500"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    d: [
                      "M -8 20 L 0 45 L 8 20",
                      "M -10 20 L 0 50 L 10 20",
                      "M -8 20 L 0 45 L 8 20"
                    ]
                  }}
                  transition={{ duration: 0.1, repeat: Infinity }}
                />
                <motion.path 
                  d="M -5 20 L 0 40 L 5 20" 
                  fill="#ffff00"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.8, 1]
                  }}
                  transition={{ duration: 0.15, repeat: Infinity }}
                />
                <motion.path 
                  d="M -3 20 L 0 35 L 3 20" 
                  fill="#ffffff"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ duration: 0.2, repeat: Infinity }}
                />
              </motion.g>
            )}
            
            {isFlying && (
              <motion.circle
                cx="0"
                cy="-5"
                r="25"
                fill="none"
                stroke="#4a90e2"
                strokeWidth="2"
                opacity="0.5"
                animate={{ r: [20, 35, 20], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </g>
        </motion.g>
        
        <motion.text 
          x="200" 
          y="280" 
          textAnchor="middle" 
          fill="#333" 
          fontSize="16" 
          fontFamily="sans-serif"
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🚀 ロケットにホバーして起業の旅へ飛び立とう！
        </motion.text>
        
        <AnimatePresence>
          {isFlying && (
            <motion.text
              x="200"
              y="100"
              textAnchor="middle"
              fill="#ff6b6b"
              fontSize="20"
              fontWeight="bold"
              initial={{ opacity: 0, y: 120 }}
              animate={{ opacity: 1, y: 100 }}
              exit={{ opacity: 0, y: 80 }}
            >
              🌟 素晴らしい！夢に向かって飛び立ちました！
            </motion.text>
          )}
        </AnimatePresence>
      </svg>
    </IllustrationContainer>
  )
}

function Illustration3() {
  const [selectedPath, setSelectedPath] = useState<number | null>(null)
  const [hoveredPath, setHoveredPath] = useState<number | null>(null)
  const { updatePersonalityProfile, addChoice, unlockAchievement } = useStoryStore()
  
  const paths = [
    {
      id: 1,
      title: 'AIマスター',
      icon: '🤖',
      description: '最新AI技術を習得',
      color: '#4a90e2',
      personality: { techSavvy: 80, creativity: 60 },
      details: ['ChatGPT活用', 'Python基礎', 'データ分析', 'AI実装']
    },
    {
      id: 2,
      title: 'ビジネス構築',
      icon: '💼',
      description: '収益モデル設計',
      color: '#48bb78',
      personality: { leadership: 80, riskTaking: 70 },
      details: ['ビジネスモデル', 'マネタイズ', '事業計画', '投資戦略']
    },
    {
      id: 3,
      title: 'マーケティング',
      icon: '📈',
      description: '集客自動化',
      color: '#ed8936',
      personality: { socialSkills: 80, creativity: 70 },
      details: ['SNS運用', 'コンテンツ制作', '広告運用', 'ブランディング']
    }
  ]
  
  const handlePathSelection = (pathId: number) => {
    setSelectedPath(pathId)
    const selectedPathData = paths.find(p => p.id === pathId)
    if (selectedPathData) {
      updatePersonalityProfile(selectedPathData.personality)
      addChoice(2, pathId)
      
      switch (pathId) {
        case 1:
          unlockAchievement('ai_path')
          break
        case 2:
          unlockAchievement('business_path')
          break
        case 3:
          unlockAchievement('marketing_path')
          break
      }
      
      if (!useStoryStore.getState().storyState.choices[2]) {
        unlockAchievement('first_choice')
      }
    }
  }
  
  return (
    <IllustrationContainer>
      <svg viewBox="0 0 400 300" className="w-full h-full">
        <defs>
          <radialGradient id="pathBg" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#4c1d95" />
            <stop offset="100%" stopColor="#1e293b" />
          </radialGradient>
          <filter id="pathGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>
        </defs>
        
        <rect width="400" height="300" fill="url(#pathBg)" />
        
        {[...Array(15)].map((_, i) => (
          <motion.circle
            key={i}
            cx={Math.random() * 400}
            cy={Math.random() * 300}
            r={Math.random() * 3 + 1}
            fill="#ffd700"
            opacity="0.6"
            animate={{
              y: [0, -20, 0],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
        
        <motion.text 
          x="200" 
          y="40" 
          textAnchor="middle" 
          fill="#fff" 
          fontSize="22" 
          fontWeight="bold"
          filter="url(#pathGlow)"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          ✨ あなたの運命の道を選ぼう ✨
        </motion.text>
        
        {paths.map((path, index) => (
          <motion.g
            key={path.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePathSelection(path.id)}
            onHoverStart={() => setHoveredPath(path.id)}
            onHoverEnd={() => setHoveredPath(null)}
            className="cursor-pointer"
          >
            <motion.rect 
              x={50 + index * 100} 
              y="70" 
              width="90" 
              height="160" 
              rx="15" 
              fill={selectedPath === path.id ? path.color : hoveredPath === path.id ? '#6366f1' : '#4a5568'}
              stroke={selectedPath === path.id ? '#ffd700' : 'transparent'}
              strokeWidth="3"
              filter={selectedPath === path.id ? "url(#pathGlow)" : "none"}
            />
            
            <motion.text 
              x={50 + index * 100 + 45} 
              y="130" 
              textAnchor="middle" 
              fontSize="35"
              animate={{
                scale: hoveredPath === path.id ? [1, 1.2, 1] : [1],
                rotate: selectedPath === path.id ? [0, 10, -10, 0] : [0]
              }}
              transition={{ duration: 0.5, repeat: selectedPath === path.id ? Infinity : 0 }}
            >
              {path.icon}
            </motion.text>
            
            <text 
              x={50 + index * 100 + 45} 
              y="95" 
              textAnchor="middle" 
              fill="#fff" 
              fontSize="12" 
              fontWeight="bold"
            >
              {path.title}
            </text>
            
            <text 
              x={50 + index * 100 + 45} 
              y="160" 
              textAnchor="middle" 
              fill="#e2e8f0" 
              fontSize="10"
            >
              {path.description}
            </text>
            
            <g>
              {path.details.slice(0, 2).map((skill, skillIndex) => (
                <text
                  key={skillIndex}
                  x={50 + index * 100 + 45}
                  y={180 + skillIndex * 12}
                  textAnchor="middle"
                  fill="#cbd5e1"
                  fontSize="8"
                >
                  {skill}
                </text>
              ))}
            </g>
            
            {selectedPath === path.id && (
              <motion.circle
                cx={50 + index * 100 + 45}
                cy="240"
                r="8"
                fill="#ffd700"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            )}
          </motion.g>
        ))}
        
        <AnimatePresence>
          {selectedPath && (
            <motion.g
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <rect
                x="50"
                y="260"
                width="300"
                height="30"
                rx="15"
                fill="rgba(255, 215, 0, 0.2)"
                stroke="#ffd700"
                strokeWidth="2"
              />
              <text
                x="200"
                y="280"
                textAnchor="middle"
                fill="#ffd700"
                fontSize="16"
                fontWeight="bold"
              >
                🎉 素晴らしい選択です！あなたの旅が始まります！
              </text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </IllustrationContainer>
  )
}

// 拡張されたストーリーページデータ
const enhancedStoryPages: Page[] = [
  {
    id: 0,
    title: "ある人の夢の始まり",
    content: "毎日満員電車に揺られ、同じルーチンを繰り返す生活。\n\n「このままでいいのかな...」\n\n心の奥で、小さな声がささやいていました。\nでも今日も、変わらない一日が始まります。",
    illustration: <Illustration1 />,
    type: 'intro',
    character: {
      name: '主人公',
      emotion: 'thoughtful'
    }
  },
  {
    id: 1,
    title: "運命を変える出会い",
    content: "いつものようにスマートフォンを見ていると、不思議な広告が表示されました。\n\n「AI×DXで、あなたの人生を変える起業塾」\n\nなぜか心が打ち震え、思わずクリックしてしまいました。\nそれは、新しい世界への扉が開かれる瞬間でした。",
    illustration: <Illustration2 />,
    type: 'story',
    character: {
      name: '主人公',
      emotion: 'excited'
    }
  },
  {
    id: 2,
    title: "運命の選択の時",
    content: "AIDXschoolのウェブサイトを開くと、3つの輝くパスが目の前に現れました。\n\n「どの道を選んでも、月収100万円以上の収入を得られる可能性があります」\n\nあなたの心が最も動かされるのは、どの道でしょうか？",
    illustration: <Illustration3 />,
    type: 'choice',
    choices: [
      { text: "AIの力で世界を変えたい", nextPage: 3, consequence: "AI技術を極め、企業のコンサルタントとして活躍" },
      { text: "自分のサービスで世に価値を提供したい", nextPage: 4, consequence: "ノーコードでサービスを構築し、起業家として成功" },
      { text: "人とのつながりでビジネスを広げたい", nextPage: 5, consequence: "マーケティングを自動化し、複数の収入源を築く" }
    ],
    character: {
      name: '主人公',
      emotion: 'determined'
    }
  },
  {
    id: 3,
    title: "AIマスターへの道 - 新しい世界の開拓者",
    content: "3ヶ月後、あなたはChatGPT、Claude、そしてPythonを駆使して、企業の業務を革命的に改善するAIコンサルタントとして活躍していました。\n\n「このAIソリューションで、10時間かかっていた作業が1時間で終わります」\n\n今では月収200万円を超え、週に3日だけ働く理想的なライフスタイルを実現しています。",
    illustration: <Illustration1 />,
    type: 'ending',
    character: {
      name: 'AIコンサルタント',
      emotion: 'happy'
    }
  },
  {
    id: 4,
    title: "サービス構築の道 - イノベーターの誕生",
    content: "Bubble、Zapier、Notionなどのノーコードツールを駆使し、あなたは独自のSaaSサービスを立ち上げました。\n\n「たった6ヶ月で、月間ユーザー数が1000人を突破しました！」\n\nサブスクリプションモデルで月収300万円を達成。\n世界中のユーザーに価値を提供しながら、完全に自由なライフスタイルを手に入れました。",
    illustration: <Illustration2 />,
    type: 'ending',
    character: {
      name: 'SaaS起業家',
      emotion: 'excited'
    }
  },
  {
    id: 5,
    title: "マーケティング自動化の道 - 情報発信の革命家",
    content: "SNS、メールマーケティング、コンテンツ制作を完全に自動化し、あなたは複数の収入源を構築しました。\n\n「毎日数百人の新しいフォロワーが、自動で増えていきます」\n\n1年後、アフィリエイト、コンサルティング、オンラインコースなどから月収300万円を達成。\n時間と場所に縛られない、真の自由を手に入れました。",
    illustration: <Illustration3 />,
    type: 'ending',
    character: {
      name: 'マーケティングエキスパート',
      emotion: 'happy'
    }
  },
  {
    id: 6,
    title: "物語の終わり、そして新しい始まり",
    content: "あなたが選んだ道がどんなものであっても、一つのことは共通しています。\n\n「あなたは、勇気を出して一歩を踏み出した」\n\nそして、その一歩が、新しい世界への扉を開いたのです。\n\nさあ、あなたもこの物語の主人公のように、新しい人生を始めませんか？",
    illustration: <Illustration1 />,
    type: 'ending',
    character: {
      name: 'ナレーター',
      emotion: 'determined'
    }
  }
]

// Story Pages
const storyPages: Page[] = [
  {
    id: 0,
    title: "むかしむかし、ある場所に...",
    content: "毎日の仕事に追われ、夢を忘れかけていた一人の会社員がいました。\n\n「このままでいいのかな...」\n\nそんな疑問を抱えながら、今日も満員電車に揺られていました。",
    illustration: <Illustration1 />
  },
  {
    id: 1,
    title: "運命の出会い",
    content: "ある日、スマートフォンに不思議な広告が表示されました。\n\n「AI×DXで、あなたの人生を変える起業塾」\n\nなぜか心に引っかかるその言葉。思わずクリックしてしまいました。",
    illustration: <Illustration2 />
  },
  {
    id: 2,
    title: "選択の時",
    content: "AIDXschoolでは、3つの道から選ぶことができました。\n\nAIを極める道、ビジネスを構築する道、マーケティングを自動化する道。\n\nあなたならどれを選びますか？",
    illustration: <Illustration3 />,
    choices: [
      { text: "AIを極める道へ", nextPage: 3 },
      { text: "ビジネス構築の道へ", nextPage: 4 },
      { text: "マーケティング自動化の道へ", nextPage: 5 }
    ]
  },
  {
    id: 3,
    title: "AIマスターへの道",
    content: "ChatGPTやClaudeを使いこなし、業務を自動化する技術を学びました。\n\n3ヶ月後、AIコンサルタントとして独立。\n\n今では月収200万円を超え、週3日だけ働く生活を実現しています。",
    illustration: <Illustration1 />
  },
  {
    id: 4,
    title: "ビジネス構築の道",
    content: "ノーコードツールを活用し、自分のサービスを立ち上げました。\n\n半年後、月間利用者1000人を突破。\n\nサブスクリプションモデルで、安定した収益を生み出しています。",
    illustration: <Illustration2 />
  },
  {
    id: 5,
    title: "マーケティング自動化の道",
    content: "SNSとメールマーケティングを自動化し、集客の仕組みを構築。\n\n1年後、複数の収入源から月収300万円を達成。\n\n時間と場所に縛られない、理想の生活を手に入れました。",
    illustration: <Illustration3 />
  }
]

// Components
function PageContent({ page, onChoice }: { page: Page, onChoice: (nextPage: number) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col"
    >
      <h2 className="text-3xl font-bold mb-6 text-center font-serif">{page.title}</h2>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex items-center">
          <p className="text-lg leading-relaxed whitespace-pre-line">
            {page.content}
          </p>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            {page.illustration}
          </div>
        </div>
      </div>
      
      {page.choices && (
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          {page.choices.map((choice, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChoice(choice.nextPage)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-semibold"
            >
              {choice.text}
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function BookCover({ onOpen }: { onOpen: () => void }) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <motion.div
      initial={{ rotateY: -90 }}
      animate={{ rotateY: 0 }}
      transition={{ duration: 1, type: "spring" }}
      className="relative w-full max-w-md mx-auto"
      style={{ perspective: "1000px" }}
    >
      <motion.div
        animate={{ rotateY: isHovered ? 10 : 0 }}
        transition={{ duration: 0.3 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow-2xl p-8 cursor-pointer"
        onClick={onOpen}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4 font-serif">
            あなたの起業物語
          </h1>
          <div className="text-6xl mb-4">📖</div>
          <p className="text-xl mb-8">
            〜 AIDXschoolで始まる新しい人生 〜
          </p>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block"
          >
            <span className="text-lg bg-white/20 px-6 py-3 rounded-full">
              クリックして物語を始める
            </span>
          </motion.div>
        </div>
        
        {/* Book spine effect */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-black/20 rounded-l-lg" 
          style={{ transform: "translateZ(-20px)" }} />
      </motion.div>
    </motion.div>
  )
}

function NavigationDots({ currentPage, totalPages, onPageChange }: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  return (
    <div className="flex justify-center gap-2 mt-8">
      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          onClick={() => onPageChange(index)}
          className={`w-3 h-3 rounded-full transition-all ${
            index === currentPage 
              ? 'bg-purple-500 w-8' 
              : 'bg-gray-600 hover:bg-gray-500'
          }`}
        />
      ))}
    </div>
  )
}

// Main Component
export default function LP4_InteractiveStorybook() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [visitedPages, setVisitedPages] = useState<number[]>([0])
  const [showCTA, setShowCTA] = useState(false)
  
  const handleChoice = (nextPage: number) => {
    setCurrentPage(nextPage)
    if (!visitedPages.includes(nextPage)) {
      setVisitedPages([...visitedPages, nextPage])
    }
    
    // Show CTA after reaching any ending
    if ([3, 4, 5].includes(nextPage)) {
      setTimeout(() => setShowCTA(true), 2000)
    }
  }
  
  const nextPage = () => {
    if (currentPage < storyPages.length - 1) {
      setCurrentPage(currentPage + 1)
    }
  }
  
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>
      
      {!isOpen ? (
        <div className="min-h-screen flex items-center justify-center p-8">
          <BookCover onOpen={() => setIsOpen(true)} />
        </div>
      ) : (
        <div className="min-h-screen p-8">
          <ProgressDashboard />
          <ReadingSettings />
          
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <NavigationButton
                onClick={prevPage}
                disabled={currentPage === 0}
                className="secondary"
              >
                ← 前のページ
              </NavigationButton>
              
              <div className="flex items-center gap-4">
                <BookmarkButton pageId={currentPage} />
                <span className="text-white text-sm">
                  {currentPage + 1} / {storyPages.length}
                </span>
              </div>
              
              <NavigationButton
                onClick={nextPage}
                disabled={currentPage === storyPages.length - 1}
                className="primary"
              >
                次のページ →
              </NavigationButton>
            </div>
            
            <PageContainer>
              <PageContent page={storyPages[currentPage]} />
              
              {storyPages[currentPage].choices && (
                <ChoiceSelector
                  choices={storyPages[currentPage].choices!}
                  onChoice={(choice) => handleChoice(choice.nextPage)}
                />
              )}
              
              <ProgressBar>
                <div 
                  className="fill" 
                  style={{ width: `${((currentPage + 1) / storyPages.length) * 100}%` }} 
                />
              </ProgressBar>
            </PageContainer>
            
            <NavigationDots
              currentPage={currentPage}
              totalPages={storyPages.length}
              onPageChange={setCurrentPage}
            />
          </div>
          
          {/* CTA Section */}
          <AnimatePresence>
            {showCTA && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 shadow-2xl"
              >
                <div className="max-w-4xl mx-auto text-center text-white">
                  <h3 className="text-2xl font-bold mb-4">
                    🎆 あなたもこの物語の主人公になりませんか？
                  </h3>
                  <p className="mb-6">
                    AIDXschoolでは、あなたの起業の夢を現実にするためのサポートを提供しています。
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      🚀 30日間無料体験を始める
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="border-2 border-white text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-white hover:text-purple-600 transition-all"
                    >
                      📞 無料相談を予約する
                    </motion.button>
                  </div>
                  <button
                    onClick={() => setShowCTA(false)}
                    className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <BookCover key="cover" onOpen={() => setIsOpen(true)} />
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-full max-w-5xl mx-auto"
            >
              {/* Book Pages */}
              <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl p-8 md:p-12 min-h-[600px]">
                <AnimatePresence mode="wait">
                  <PageContent
                    key={currentPage}
                    page={storyPages[currentPage]}
                    onChoice={handleChoice}
                  />
                </AnimatePresence>
                
                {/* Navigation */}
                <div className="flex justify-between items-center mt-8">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      currentPage === 0 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-purple-500 text-white hover:bg-purple-600'
                    }`}
                  >
                    ← 前のページ
                  </button>
                  
                  <span className="text-gray-600">
                    {currentPage + 1} / {storyPages.length}
                  </span>
                  
                  <button
                    onClick={nextPage}
                    disabled={currentPage === storyPages.length - 1 || storyPages[currentPage].choices}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      currentPage === storyPages.length - 1 || storyPages[currentPage].choices
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-purple-500 text-white hover:bg-purple-600'
                    }`}
                  >
                    次のページ →
                  </button>
                </div>
                
                <NavigationDots
                  currentPage={currentPage}
                  totalPages={storyPages.length}
                  onPageChange={setCurrentPage}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* CTA Modal */}
      <AnimatePresence>
        {showCTA && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8"
            onClick={() => setShowCTA(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-3xl font-bold mb-4">
                素晴らしい物語でした！
              </h3>
              <p className="text-gray-600 mb-6">
                あなたも主人公のように、新しい人生の物語を始めませんか？
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold text-lg mb-3"
              >
                無料相談で物語を始める
              </motion.button>
              <button
                onClick={() => setShowCTA(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                もう少し考える
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}