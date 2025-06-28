import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from 'framer-motion'
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

const skillGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(78, 181, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(78, 181, 255, 0.8);
  }
`

const levelUp = keyframes`
  0% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.2) rotate(5deg);
  }
  50% {
    transform: scale(1.4) rotate(-5deg);
  }
  75% {
    transform: scale(1.2) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
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

const slideIn = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`

const pathDraw = keyframes`
  from {
    stroke-dashoffset: 1000;
  }
  to {
    stroke-dashoffset: 0;
  }
`

// スタイルコンポーネント
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #0a0a0a 0%,
    #1a1a2e 15%,
    #16213e 30%,
    #0f3460 45%,
    #533483 60%,
    #7209b7 75%,
    #16213e 90%,
    #0a0a0a 100%
  );
  position: relative;
  overflow: hidden;
`

const SkillNodeStyled = styled(motion.div)`
  position: absolute;
  z-index: 10;
  
  .skill-button {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: 4px solid;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    position: relative;
    transition: all 0.3s ease;
    cursor: pointer;
    
    &.can-upgrade {
      border-color: ${colors.primary};
      background: rgba(78, 181, 255, 0.2);
      animation: ${skillGlow} 2s infinite;
      
      &:hover {
        transform: scale(1.1);
        box-shadow: 0 0 30px rgba(78, 181, 255, 0.6);
      }
    }
    
    &.unlocked {
      border-color: ${colors.secondary};
      background: rgba(56, 193, 114, 0.2);
    }
    
    &.maxed {
      border-color: ${colors.accent};
      background: rgba(255, 217, 61, 0.2);
      animation: ${pulse} 3s infinite;
    }
    
    &.locked {
      border-color: #4a5568;
      background: rgba(74, 85, 104, 0.2);
      opacity: 0.6;
    }
  }
  
  .skill-cost {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    background: ${colors.primary};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    color: white;
    animation: ${pulse} 1.5s infinite;
  }
  
  .level-dots {
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 4px;
    
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      
      &.filled {
        background: ${colors.accent};
        box-shadow: 0 0 8px rgba(255, 217, 61, 0.5);
      }
      
      &.empty {
        background: #4a5568;
      }
    }
  }
`

const TooltipStyled = styled(motion.div)`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 12px;
  width: 280px;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  z-index: 20;
  
  .tooltip-title {
    color: white;
    font-weight: bold;
    margin-bottom: 4px;
    font-size: 16px;
  }
  
  .tooltip-description {
    color: #cbd5e0;
    font-size: 14px;
    margin-bottom: 12px;
  }
  
  .tooltip-stats {
    color: #a0aec0;
    font-size: 12px;
    
    p {
      margin: 2px 0;
    }
  }
  
  .tooltip-category {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: bold;
    margin-top: 8px;
    
    &.ai {
      background: rgba(78, 181, 255, 0.2);
      color: ${colors.primary};
    }
    
    &.dx {
      background: rgba(147, 51, 234, 0.2);
      color: ${colors.purple};
    }
    
    &.business {
      background: rgba(56, 193, 114, 0.2);
      color: ${colors.secondary};
    }
    
    &.marketing {
      background: rgba(236, 72, 153, 0.2);
      color: ${colors.pink};
    }
  }
`

const PlayerStatusStyled = styled(motion.div)`
  position: fixed;
  left: 0;
  top: 80px;
  width: 320px;
  height: calc(100vh - 80px);
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
  z-index: 40;
  
  .character-avatar {
    width: 96px;
    height: 96px;
    margin: 0 auto 16px;
    background: ${colors.gradient};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    animation: ${float} 3s infinite;
  }
  
  .character-title {
    text-align: center;
    color: white;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 4px;
  }
  
  .character-subtitle {
    text-align: center;
    color: #a0aec0;
    margin-bottom: 24px;
  }
  
  .exp-bar-container {
    margin-bottom: 24px;
    
    .exp-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      .level {
        font-size: 18px;
        font-weight: bold;
        color: white;
      }
      
      .exp-text {
        font-size: 14px;
        color: #a0aec0;
      }
    }
    
    .exp-bar {
      width: 100%;
      height: 12px;
      background: #2d3748;
      border-radius: 6px;
      overflow: hidden;
      
      .exp-fill {
        height: 100%;
        background: ${colors.gradient};
        transition: width 0.5s ease;
      }
    }
  }
  
  .skill-points-card {
    background: rgba(78, 181, 255, 0.1);
    border: 1px solid rgba(78, 181, 255, 0.3);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
    
    .points-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .points-label {
        font-weight: bold;
        color: white;
      }
      
      .points-value {
        font-size: 24px;
        font-weight: bold;
        color: ${colors.primary};
      }
    }
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;
    
    .stat-card {
      background: #2d3748;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
      
      .stat-value {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 4px;
        
        &.green {
          color: ${colors.secondary};
        }
        
        &.yellow {
          color: ${colors.accent};
        }
      }
      
      .stat-label {
        font-size: 12px;
        color: #a0aec0;
      }
    }
  }
  
  .action-buttons {
    margin-bottom: 24px;
    
    .action-button {
      width: 100%;
      padding: 12px;
      border-radius: 8px;
      font-weight: bold;
      margin-bottom: 12px;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &.primary {
        background: ${colors.gradient};
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(78, 181, 255, 0.3);
        }
      }
      
      &.secondary {
        background: #4a5568;
        color: white;
        
        &:hover {
          background: #718096;
        }
      }
    }
  }
  
  .cta-section {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 24px;
    
    .cta-button {
      width: 100%;
      padding: 16px;
      background: ${colors.gradient};
      border: none;
      border-radius: 8px;
      color: white;
      font-weight: bold;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 8px;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(78, 181, 255, 0.4);
      }
    }
    
    .cta-description {
      text-align: center;
      font-size: 12px;
      color: #a0aec0;
    }
  }
`

// Types
interface Skill {
  id: string
  name: string
  description: string
  maxLevel: number
  currentLevel: number
  requiredLevel: number
  requiredSkills: string[]
  icon: string
  position: { x: number; y: number }
  category: 'ai' | 'dx' | 'business' | 'marketing'
  benefits: string[]
  realWorldApplication: string
  timeToMaster: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  relatedCareers: string[]
}

interface PlayerStats {
  level: number
  exp: number
  expToNext: number
  skillPoints: number
  unlockedSkills: string[]
  achievements: string[]
  totalTimeSpent: number
  questsCompleted: number
  favoriteCategory: 'ai' | 'dx' | 'business' | 'marketing' | null
  streakDays: number
  completionPercentage: number
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  condition: (stats: PlayerStats, skills: Record<string, Skill>) => boolean
  reward: {
    exp?: number
    skillPoints?: number
    title?: string
  }
  unlocked: boolean
  unlockedAt?: Date
}

interface Quest {
  id: string
  title: string
  description: string
  icon: string
  type: 'skill' | 'level' | 'achievement' | 'category'
  target: string | number
  reward: {
    exp: number
    skillPoints?: number
    special?: string
  }
  completed: boolean
  progress: number
  maxProgress: number
}

interface SkillAnalytics {
  totalSkillsLearned: number
  favoriteCategory: string
  timePerCategory: Record<string, number>
  skillMasteryRate: number
  learningEfficiency: number
  recommendedNextSkills: string[]
}

interface SkillTreeState {
  currentView: 'tree' | 'achievements' | 'analytics' | 'quests'
  selectedSkill: string | null
  showTutorial: boolean
  soundEnabled: boolean
  animationsEnabled: boolean
  compactMode: boolean
}

// Zustand Store
interface GameStore {
  playerStats: PlayerStats
  skills: Record<string, Skill>
  achievements: Record<string, Achievement>
  quests: Quest[]
  analytics: SkillAnalytics
  uiState: SkillTreeState
  addExp: (amount: number) => void
  upgradeSkill: (skillId: string) => void
  resetSkills: () => void
  unlockAchievement: (achievementId: string) => void
  completeQuest: (questId: string) => void
  generateNewQuests: () => void
  updateAnalytics: () => void
  setCurrentView: (view: SkillTreeState['currentView']) => void
  toggleSettings: (setting: keyof Pick<SkillTreeState, 'soundEnabled' | 'animationsEnabled' | 'compactMode'>) => void
}

const useGameStore = create<GameStore>((set, get) => ({
  playerStats: {
    level: 1,
    exp: 0,
    expToNext: 100,
    skillPoints: 3,
    unlockedSkills: [],
    achievements: []
  },
  skills: {
    'ai-basics': {
      id: 'ai-basics',
      name: 'AI基礎',
      description: 'AIの基本概念とChatGPTの活用法を学ぶ',
      maxLevel: 5,
      currentLevel: 0,
      requiredLevel: 1,
      requiredSkills: [],
      icon: '🤖',
      position: { x: 50, y: 20 },
      category: 'ai'
    },
    'prompt-engineering': {
      id: 'prompt-engineering',
      name: 'プロンプトエンジニアリング',
      description: '効果的なプロンプトの作成技術をマスター',
      maxLevel: 5,
      currentLevel: 0,
      requiredLevel: 2,
      requiredSkills: ['ai-basics'],
      icon: '💬',
      position: { x: 30, y: 35 },
      category: 'ai'
    },
    'ai-automation': {
      id: 'ai-automation',
      name: 'AI自動化',
      description: 'AIを使った業務自動化システムの構築',
      maxLevel: 5,
      currentLevel: 0,
      requiredLevel: 3,
      requiredSkills: ['prompt-engineering'],
      icon: '⚡',
      position: { x: 20, y: 50 },
      category: 'ai'
    },
    'nocode-basics': {
      id: 'nocode-basics',
      name: 'ノーコード基礎',
      description: 'Bubble, Zapierなどの基本操作',
      maxLevel: 5,
      currentLevel: 0,
      requiredLevel: 1,
      requiredSkills: [],
      icon: '🔧',
      position: { x: 70, y: 35 },
      category: 'dx'
    },
    'app-development': {
      id: 'app-development',
      name: 'アプリ開発',
      description: 'ノーコードでWebアプリを開発',
      maxLevel: 5,
      currentLevel: 0,
      requiredLevel: 3,
      requiredSkills: ['nocode-basics'],
      icon: '📱',
      position: { x: 80, y: 50 },
      category: 'dx'
    },
    'business-model': {
      id: 'business-model',
      name: 'ビジネスモデル設計',
      description: '収益性の高いビジネスモデルを構築',
      maxLevel: 5,
      currentLevel: 0,
      requiredLevel: 2,
      requiredSkills: [],
      icon: '💼',
      position: { x: 50, y: 50 },
      category: 'business'
    },
    'digital-marketing': {
      id: 'digital-marketing',
      name: 'デジタルマーケティング',
      description: 'SNSとWeb広告の効果的な活用',
      maxLevel: 5,
      currentLevel: 0,
      requiredLevel: 2,
      requiredSkills: [],
      icon: '📈',
      position: { x: 30, y: 65 },
      category: 'marketing'
    },
    'sales-automation': {
      id: 'sales-automation',
      name: 'セールス自動化',
      description: 'AIを活用した営業プロセスの自動化',
      maxLevel: 5,
      currentLevel: 0,
      requiredLevel: 4,
      requiredSkills: ['ai-automation', 'digital-marketing'],
      icon: '🎯',
      position: { x: 50, y: 80 },
      category: 'business'
    }
  },
  addExp: (amount) => set((state) => {
    let newExp = state.playerStats.exp + amount
    let newLevel = state.playerStats.level
    let newSkillPoints = state.playerStats.skillPoints
    let expToNext = state.playerStats.expToNext
    
    while (newExp >= expToNext) {
      newExp -= expToNext
      newLevel++
      newSkillPoints += 2
      expToNext = newLevel * 100
    }
    
    return {
      playerStats: {
        ...state.playerStats,
        exp: newExp,
        level: newLevel,
        skillPoints: newSkillPoints,
        expToNext
      }
    }
  }),
  upgradeSkill: (skillId) => set((state) => {
    const skill = state.skills[skillId]
    if (!skill || state.playerStats.skillPoints <= 0) return state
    
    // Check requirements
    if (skill.currentLevel >= skill.maxLevel) return state
    if (state.playerStats.level < skill.requiredLevel) return state
    if (skill.requiredSkills.some(reqId => state.skills[reqId].currentLevel === 0)) return state
    
    return {
      skills: {
        ...state.skills,
        [skillId]: {
          ...skill,
          currentLevel: skill.currentLevel + 1
        }
      },
      playerStats: {
        ...state.playerStats,
        skillPoints: state.playerStats.skillPoints - 1,
        unlockedSkills: skill.currentLevel === 0 
          ? [...state.playerStats.unlockedSkills, skillId]
          : state.playerStats.unlockedSkills
      }
    }
  }),
  resetSkills: () => set((state) => {
    const totalSkillsUsed = Object.values(state.skills).reduce((sum, skill) => sum + skill.currentLevel, 0)
    const resetSkills = Object.entries(state.skills).reduce((acc, [id, skill]) => ({
      ...acc,
      [id]: { ...skill, currentLevel: 0 }
    }), {})
    
    return {
      skills: resetSkills,
      playerStats: {
        ...state.playerStats,
        skillPoints: state.playerStats.skillPoints + totalSkillsUsed,
        unlockedSkills: []
      }
    }
  })
}))

// Components
function SkillNode({ skill }: { skill: Skill }) {
  const { playerStats, upgradeSkill } = useGameStore()
  const [showTooltip, setShowTooltip] = useState(false)
  
  const canUpgrade = useMemo(() => {
    if (playerStats.skillPoints <= 0) return false
    if (skill.currentLevel >= skill.maxLevel) return false
    if (playerStats.level < skill.requiredLevel) return false
    if (skill.requiredSkills.some(reqId => {
      const reqSkill = useGameStore.getState().skills[reqId]
      return reqSkill.currentLevel === 0
    })) return false
    return true
  }, [playerStats, skill])
  
  const isUnlocked = skill.currentLevel > 0
  const isMaxed = skill.currentLevel === skill.maxLevel
  
  return (
    <motion.div
      className="absolute"
      style={{ left: `${skill.position.x}%`, top: `${skill.position.y}%` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: skill.position.y * 0.01 }}
    >
      <motion.button
        className={`relative w-20 h-20 rounded-full border-4 transition-all ${
          isMaxed ? 'border-yellow-500 bg-yellow-900/50' :
          isUnlocked ? 'border-green-500 bg-green-900/50' :
          canUpgrade ? 'border-blue-500 bg-blue-900/50 hover:scale-110' :
          'border-gray-600 bg-gray-900/50'
        }`}
        whileHover={canUpgrade ? { scale: 1.1 } : {}}
        whileTap={canUpgrade ? { scale: 0.95 } : {}}
        onClick={() => canUpgrade && upgradeSkill(skill.id)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={!canUpgrade}
      >
        <span className="text-3xl">{skill.icon}</span>
        
        {/* Level Indicator */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          {Array.from({ length: skill.maxLevel }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < skill.currentLevel ? 'bg-yellow-400' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
        
        {/* Skill Points Cost */}
        {canUpgrade && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold"
          >
            1
          </motion.div>
        )}
      </motion.button>
      
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64 p-4 bg-gray-900 rounded-lg border border-gray-700 z-10"
          >
            <h4 className="font-bold text-white mb-1">{skill.name}</h4>
            <p className="text-sm text-gray-300 mb-2">{skill.description}</p>
            <div className="text-xs text-gray-400">
              <p>レベル: {skill.currentLevel}/{skill.maxLevel}</p>
              <p>必要レベル: {skill.requiredLevel}</p>
              {skill.requiredSkills.length > 0 && (
                <p>前提スキル: {skill.requiredSkills.join(', ')}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function SkillConnections() {
  const skills = useGameStore(state => state.skills)
  
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {Object.values(skills).map(skill => 
        skill.requiredSkills.map(reqId => {
          const reqSkill = skills[reqId]
          if (!reqSkill) return null
          
          const isActive = skill.currentLevel > 0 && reqSkill.currentLevel > 0
          
          return (
            <motion.line
              key={`${reqId}-${skill.id}`}
              x1={`${reqSkill.position.x}%`}
              y1={`${reqSkill.position.y}%`}
              x2={`${skill.position.x}%`}
              y2={`${skill.position.y}%`}
              stroke={isActive ? '#10b981' : '#374151'}
              strokeWidth="2"
              strokeDasharray={isActive ? "0" : "5,5"}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          )
        })
      )}
    </svg>
  )
}

function PlayerStatus() {
  const { playerStats, addExp, resetSkills } = useGameStore()
  const expPercentage = (playerStats.exp / playerStats.expToNext) * 100
  
  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-20 w-80 bg-gray-900/95 backdrop-blur-lg border-r border-gray-700 p-6 h-[calc(100vh-5rem)]"
    >
      <div className="space-y-6">
        {/* Character Info */}
        <div className="text-center">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-4xl mb-4">
            👨‍💻
          </div>
          <h3 className="text-2xl font-bold text-white">起業家見習い</h3>
          <p className="text-gray-400">AIDXschool 受講生</p>
        </div>
        
        {/* Level & EXP */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold">レベル {playerStats.level}</span>
            <span className="text-sm text-gray-400">{playerStats.exp}/{playerStats.expToNext} EXP</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${expPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        
        {/* Skill Points */}
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold">スキルポイント</span>
            <span className="text-2xl font-bold text-blue-400">{playerStats.skillPoints}</span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-300">習得スキル</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-800 rounded p-3 text-center">
              <div className="text-2xl font-bold text-green-400">
                {playerStats.unlockedSkills.length}
              </div>
              <div className="text-xs text-gray-400">解放済み</div>
            </div>
            <div className="bg-gray-800 rounded p-3 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {Object.values(useGameStore.getState().skills).filter(s => s.currentLevel === s.maxLevel).length}
              </div>
              <div className="text-xs text-gray-400">マスター</div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => addExp(50)}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold"
          >
            クエスト完了 (+50 EXP)
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetSkills}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            スキルリセット
          </motion.button>
        </div>
        
        {/* CTA */}
        <div className="border-t border-gray-700 pt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-bold text-lg"
          >
            実際に学習を始める
          </motion.button>
          <p className="text-xs text-gray-400 text-center mt-2">
            無料相談で詳しいカリキュラムをご案内
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function QuestNotification() {
  const [show, setShow] = useState(false)
  const { addExp } = useGameStore()
  
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 3000)
    return () => clearTimeout(timer)
  }, [])
  
  const completeQuest = () => {
    addExp(100)
    setShow(false)
  }
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 right-8 w-96 bg-gray-900 border border-yellow-500 rounded-lg p-6 shadow-2xl"
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">📜</div>
            <div className="flex-1">
              <h4 className="font-bold text-yellow-400 mb-2">新しいクエスト！</h4>
              <p className="text-sm text-gray-300 mb-4">
                「AIの基礎を学ぶ」スキルをレベル1にアップグレードしよう
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={completeQuest}
                  className="px-4 py-2 bg-yellow-500 text-gray-900 rounded font-semibold text-sm"
                >
                  達成 (+100 EXP)
                </motion.button>
                <button
                  onClick={() => setShow(false)}
                  className="px-4 py-2 bg-gray-700 rounded font-semibold text-sm"
                >
                  後で
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Main Component
export default function LP2_RPGSkillTree() {
  const skills = useGameStore(state => state.skills)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center"></div>
      </div>
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-gray-900/80 backdrop-blur-lg border-b border-gray-700 z-50">
        <div className="h-full flex items-center justify-between px-8">
          <h1 className="text-2xl font-bold">
            <span className="text-gradient">AIDXschool</span> スキルツリー
          </h1>
          <nav className="flex gap-6">
            <button className="text-gray-300 hover:text-white transition-colors">ホーム</button>
            <button className="text-gray-300 hover:text-white transition-colors">実績</button>
            <button className="text-gray-300 hover:text-white transition-colors">ランキング</button>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex">
        <PlayerStatus />
        
        <main className="flex-1 ml-80 mt-20 p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative min-h-[800px] max-w-6xl mx-auto"
          >
            {/* Skill Tree Container */}
            <div className="relative w-full h-full">
              <SkillConnections />
              {Object.values(skills).map(skill => (
                <SkillNode key={skill.id} skill={skill} />
              ))}
            </div>
            
            {/* Legend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute top-8 right-8 bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 border border-gray-700"
            >
              <h3 className="font-semibold mb-3">カテゴリ</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>AI スキル</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>DX スキル</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>ビジネススキル</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>マーケティング</span>
                </div>
              </div>
            </motion.div>
            
            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
            >
              <p className="text-gray-400 mb-2">
                スキルポイントを使って起業に必要な能力を習得しよう
              </p>
              <p className="text-sm text-gray-500">
                クリックでスキルをアップグレード • ホバーで詳細表示
              </p>
            </motion.div>
          </motion.div>
        </main>
      </div>
      
      {/* Quest Notification */}
      <QuestNotification />
    </div>
  )
}