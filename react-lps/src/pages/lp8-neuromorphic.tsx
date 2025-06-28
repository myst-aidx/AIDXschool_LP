// LP8: ニューラルモーフィック - AI思考を再現するインタラクティブUI
// AIDXschool AI×DX起業塾 - 人工知能と人間の学習を融合

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useInView } from 'framer-motion'
import { create } from 'zustand'
import styled, { keyframes, css } from 'styled-components'

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
  gradient: 'linear-gradient(135deg, #4EB5FF 0%, #38C172 50%, #FFD93D 100%)',
  neuralGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  synapseGlow: 'rgba(78, 181, 255, 0.6)'
}

// アニメーション定義
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

const neuralPulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(78, 181, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 30px rgba(78, 181, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(78, 181, 255, 0);
  }
`

const synapseFlow = keyframes`
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: 0;
  }
`

const thoughtRipple = keyframes`
  0% {
    transform: scale(0.5);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.4;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
`

const brainWave = keyframes`
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
`

// Types
interface Neuron {
  id: string
  label: string
  x: number
  y: number
  activated: boolean
  connections: string[]
  category: 'input' | 'hidden' | 'output'
  activationLevel: number
  learningWeight: number
  specialty?: string
}

interface Synapse {
  from: string
  to: string
  strength: number
  active: boolean
}

interface ThoughtPattern {
  id: string
  name: string
  description: string
  neurons: string[]
  color: string
  complexity: number
  businessValue: string
  learningPath: string[]
  prerequisites: string[]
  outcomes: string[]
}

interface LearningModule {
  id: string
  title: string
  description: string
  duration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  skills: string[]
  neuralActivation: string[]
  progress: number
  unlocked: boolean
}

// Zustand Store
interface NeuralState {
  neurons: Record<string, Neuron>
  synapses: Synapse[]
  activeThought: ThoughtPattern | null
  learningProgress: number
  brainActivity: number
  neuralConnections: number
  thoughtSpeed: number
  modules: LearningModule[]
  currentLevel: number
  totalExperience: number
  activateNeuron: (id: string) => void
  activateThought: (thought: ThoughtPattern) => void
  increaseLearning: (amount: number) => void
  unlockModule: (moduleId: string) => void
  completeModule: (moduleId: string) => void
  enhanceConnection: (from: string, to: string) => void
  simulateThinking: () => void
  reset: () => void
}

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
  overflow-x: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      45deg,
      rgba(78, 181, 255, 0.03) 0%,
      rgba(56, 193, 114, 0.03) 50%,
      rgba(255, 217, 61, 0.03) 100%
    );
    background-size: 400% 400%;
    animation: ${brainWave} 15s ease-in-out infinite;
    pointer-events: none;
  }
`

const Section = styled.section`
  position: relative;
  padding: 4rem 2rem;
  
  &.neural-section {
    background: radial-gradient(ellipse at center, rgba(78, 181, 255, 0.1) 0%, transparent 70%);
  }
`

const NeumorphicCard = styled(motion.div)<{ activated?: boolean }>`
  background: ${props => props.activated ? 
    'linear-gradient(145deg, #2a2a3e, #1e1e2e)' : 
    'linear-gradient(145deg, #2e2e42, #1a1a2e)'
  };
  border-radius: 20px;
  padding: 2rem;
  margin: 1rem;
  box-shadow: ${props => props.activated ?
    'inset 8px 8px 16px #16162a, inset -8px -8px 16px #3e3e52, 0 0 30px rgba(78, 181, 255, 0.3)' :
    '8px 8px 16px #16162a, -8px -8px 16px #3e3e52'
  };
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.activated ?
      'inset 8px 8px 16px #16162a, inset -8px -8px 16px #3e3e52, 0 0 40px rgba(78, 181, 255, 0.5)' :
      '12px 12px 24px #16162a, -12px -12px 24px #3e3e52, 0 0 20px rgba(78, 181, 255, 0.2)'
    };
  }
`

const NeuralGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`

const BrainVisualization = styled.div`
  position: relative;
  width: 100%;
  height: 600px;
  background: radial-gradient(ellipse at center, rgba(78, 181, 255, 0.05) 0%, transparent 70%);
  border-radius: 20px;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(78, 181, 255, 0.1) 50%,
      transparent 70%
    );
    background-size: 200% 200%;
    animation: ${brainWave} 8s ease-in-out infinite;
  }
`

const Title = styled.h1`
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 900;
  color: #ffffff;
  text-align: center;
  margin: 0 0 2rem 0;
  text-shadow: 0 0 30px rgba(78, 181, 255, 0.5);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 4px;
    background: ${colors.gradient};
    border-radius: 2px;
  }
`

const Subtitle = styled.p`
  font-size: clamp(1.1rem, 2.5vw, 1.4rem);
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin: 0 0 3rem 0;
  line-height: 1.6;
`

const ControlPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin: 2rem 0;
`

const NeuralButton = styled(motion.button)<{ active?: boolean }>`
  padding: 1rem 2rem;
  border: none;
  border-radius: 25px;
  background: ${props => props.active ? 
    'linear-gradient(145deg, #3B82F6, #1D4ED8)' :
    'linear-gradient(145deg, #374151, #1F2937)'
  };
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ?
    'inset 2px 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(59, 130, 246, 0.5)' :
    '4px 4px 8px rgba(0,0,0,0.3), -2px -2px 6px rgba(255,255,255,0.1)'
  };
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.active ?
      'inset 2px 2px 4px rgba(0,0,0,0.3), 0 0 30px rgba(59, 130, 246, 0.7)' :
      '6px 6px 12px rgba(0,0,0,0.4), -3px -3px 9px rgba(255,255,255,0.15)'
    };
  }
  
  &:active {
    transform: translateY(0);
  }
`

const ProgressRing = styled.div<{ progress: number }>`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    ${colors.primary} 0deg,
    ${colors.primary} ${props => props.progress * 3.6}deg,
    rgba(255, 255, 255, 0.1) ${props => props.progress * 3.6}deg,
    rgba(255, 255, 255, 0.1) 360deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '';
    position: absolute;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(145deg, #2e2e42, #1a1a2e);
  }
  
  .progress-text {
    position: relative;
    z-index: 1;
    color: white;
    font-weight: bold;
    font-size: 1.2rem;
  }
`

const useNeuralStore = create<NeuralState>((set, get) => ({
  neurons: {
    // Input Layer - 入力層（学習インプット）
    'in1': { id: 'in1', label: 'AI基礎', x: 100, y: 120, activated: false, connections: ['h1', 'h2'], category: 'input', activationLevel: 0, learningWeight: 1.0, specialty: 'ChatGPT活用' },
    'in2': { id: 'in2', label: 'ノーコード', x: 100, y: 200, activated: false, connections: ['h2', 'h3'], category: 'input', activationLevel: 0, learningWeight: 1.0, specialty: 'Bubble開発' },
    'in3': { id: 'in3', label: 'ビジネス', x: 100, y: 280, activated: false, connections: ['h3', 'h4'], category: 'input', activationLevel: 0, learningWeight: 1.0, specialty: 'リーンキャンバス' },
    'in4': { id: 'in4', label: 'マーケティング', x: 100, y: 360, activated: false, connections: ['h4', 'h5'], category: 'input', activationLevel: 0, learningWeight: 1.0, specialty: 'SNS自動化' },
    'in5': { id: 'in5', label: 'データ分析', x: 100, y: 440, activated: false, connections: ['h5', 'h6'], category: 'input', activationLevel: 0, learningWeight: 1.0, specialty: 'Google Analytics' },
    
    // Hidden Layer - 隠れ層（知識統合・思考処理）
    'h1': { id: 'h1', label: '自動化', x: 300, y: 100, activated: false, connections: ['out1', 'out2'], category: 'hidden', activationLevel: 0, learningWeight: 1.2, specialty: 'Zapier連携' },
    'h2': { id: 'h2', label: '効率化', x: 300, y: 180, activated: false, connections: ['out1', 'out3'], category: 'hidden', activationLevel: 0, learningWeight: 1.2, specialty: 'ワークフロー最適化' },
    'h3': { id: 'h3', label: '収益化', x: 300, y: 260, activated: false, connections: ['out2', 'out3'], category: 'hidden', activationLevel: 0, learningWeight: 1.2, specialty: 'サブスクモデル' },
    'h4': { id: 'h4', label: 'スケール', x: 300, y: 340, activated: false, connections: ['out3', 'out4'], category: 'hidden', activationLevel: 0, learningWeight: 1.2, specialty: 'チーム構築' },
    'h5': { id: 'h5', label: 'イノベーション', x: 300, y: 420, activated: false, connections: ['out4', 'out5'], category: 'hidden', activationLevel: 0, learningWeight: 1.2, specialty: '新技術導入' },
    'h6': { id: 'h6', label: 'リーダーシップ', x: 300, y: 500, activated: false, connections: ['out5'], category: 'hidden', activationLevel: 0, learningWeight: 1.2, specialty: '組織運営' },
    
    // Output Layer - 出力層（起業成果）
    'out1': { id: 'out1', label: 'AIコンサル', x: 500, y: 120, activated: false, connections: [], category: 'output', activationLevel: 0, learningWeight: 1.5, specialty: '企業向けAI導入' },
    'out2': { id: 'out2', label: 'SaaS起業', x: 500, y: 220, activated: false, connections: [], category: 'output', activationLevel: 0, learningWeight: 1.5, specialty: 'B2Bソフトウェア' },
    'out3': { id: 'out3', label: '自動化事業', x: 500, y: 320, activated: false, connections: [], category: 'output', activationLevel: 0, learningWeight: 1.5, specialty: '業務プロセス改善' },
    'out4': { id: 'out4', label: 'DXコンサル', x: 500, y: 420, activated: false, connections: [], category: 'output', activationLevel: 0, learningWeight: 1.5, specialty: 'デジタル変革' },
    'out5': { id: 'out5', label: 'インフルエンサー', x: 500, y: 520, activated: false, connections: [], category: 'output', activationLevel: 0, learningWeight: 1.5, specialty: '思想リーダー' }
  },
  synapses: [],
  activeThought: null,
  learningProgress: 0,
  brainActivity: 0,
  neuralConnections: 15,
  thoughtSpeed: 1,
  modules: [],
  currentLevel: 1,
  totalExperience: 0,
  
  activateNeuron: (id) => set((state) => {
    const neuron = state.neurons[id]
    if (!neuron) return state
    
    // Activate neuron
    const updatedNeurons = {
      ...state.neurons,
      [id]: { ...neuron, activated: true }
    }
    
    // Propagate activation
    setTimeout(() => {
      neuron.connections.forEach(connId => {
        get().activateNeuron(connId)
      })
    }, 300)
    
    return { neurons: updatedNeurons }
  }),
  
  activateThought: (thought) => set((state) => {
    // Reset all neurons
    const resetNeurons = Object.entries(state.neurons).reduce((acc, [id, neuron]) => ({
      ...acc,
      [id]: { ...neuron, activated: false }
    }), {})
    
    // Activate thought pattern neurons
    thought.neurons.forEach((neuronId, index) => {
      setTimeout(() => {
        get().activateNeuron(neuronId)
      }, index * 200)
    })
    
    return { 
      neurons: resetNeurons,
      activeThought: thought 
    }
  }),
  
  increaseLearning: (amount) => set((state) => ({
    learningProgress: Math.min(100, state.learningProgress + amount)
  })),
  
  reset: () => set((state) => {
    const resetNeurons = Object.entries(state.neurons).reduce((acc, [id, neuron]) => ({
      ...acc,
      [id]: { ...neuron, activated: false }
    }), {})
    
    return {
      neurons: resetNeurons,
      activeThought: null,
      learningProgress: 0,
      brainActivity: 0,
      neuralConnections: 15,
      thoughtSpeed: 1,
      currentLevel: 1,
      totalExperience: 0
    }
  }),
  
  unlockModule: (moduleId) => set((state) => ({
    modules: state.modules.map(m => 
      m.id === moduleId ? { ...m, unlocked: true } : m
    )
  })),
  
  completeModule: (moduleId) => set((state) => ({
    modules: state.modules.map(m => 
      m.id === moduleId ? { ...m, progress: 100 } : m
    ),
    totalExperience: state.totalExperience + 100
  })),
  
  enhanceConnection: (from, to) => set((state) => ({
    synapses: state.synapses.map(s => 
      s.from === from && s.to === to 
        ? { ...s, strength: Math.min(s.strength + 0.1, 1) }
        : s
    )
  })),
  
  simulateThinking: () => set((state) => ({
    brainActivity: Math.min(state.brainActivity + 10, 100),
    thoughtSpeed: Math.min(state.thoughtSpeed * 1.1, 5)
  }))
}))

// Thought Patterns
const thoughtPatterns: ThoughtPattern[] = [
  {
    id: 'ai-mastery',
    name: 'AIマスタリー',
    description: 'AI技術を完全に理解し活用',
    neurons: ['in1', 'h1', 'h2', 'out1'],
    color: '#3B82F6',
    complexity: 3,
    businessValue: '月収100万円以上',
    learningPath: ['AI基礎', 'プロンプトエンジニアリング', 'AI自動化'],
    prerequisites: ['基本的なPC操作'],
    outcomes: ['AI専門家', 'コンサルタント']
  },
  {
    id: 'business-automation',
    name: 'ビジネス自動化',
    description: '業務プロセスを完全自動化',
    neurons: ['in2', 'h2', 'h3', 'out3'],
    color: '#10B981',
    complexity: 4,
    businessValue: '作業時間90%削減',
    learningPath: ['ノーコード基礎', '自動化設計', 'システム統合'],
    prerequisites: ['業務理解'],
    outcomes: ['自動化専門家', '効率化コンサルタント']
  },
  {
    id: 'saas-creation',
    name: 'SaaS構築',
    description: 'ノーコードでSaaSを開発',
    neurons: ['in2', 'in3', 'h3', 'h4', 'out2'],
    color: '#8B5CF6',
    complexity: 5,
    businessValue: '継続収入の獲得',
    learningPath: ['ノーコード開発', 'UI/UX設計', 'ビジネスモデル'],
    prerequisites: ['基本的なビジネス知識'],
    outcomes: ['SaaS起業家', 'プロダクトオーナー']
  }
]

// Components
function NeuronNode({ neuron }: { neuron: Neuron }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const { activateNeuron } = useNeuralStore()
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }
  
  const rotateX = useTransform(mouseY, [-50, 50], [10, -10])
  const rotateY = useTransform(mouseX, [-50, 50], [-10, 10])
  
  const categoryColors = {
    input: '#3B82F6',
    hidden: '#8B5CF6',
    output: '#10B981'
  }
  
  return (
    <motion.div
      className="absolute transform -translate-x-1/2 -translate-y-1/2"
      style={{ left: neuron.x, top: neuron.y }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: neuron.x * 0.001 }}
    >
      <motion.div
        className="relative cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          mouseX.set(0)
          mouseY.set(0)
        }}
        onClick={() => activateNeuron(neuron.id)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Neumorphic Circle */}
        <motion.div
          className={`w-24 h-24 rounded-full flex items-center justify-center relative ${
            neuron.activated 
              ? 'shadow-inner' 
              : 'shadow-neumorphic'
          }`}
          style={{
            backgroundColor: neuron.activated ? categoryColors[neuron.category] : '#1F2937',
            boxShadow: neuron.activated
              ? `inset 4px 4px 8px rgba(0, 0, 0, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.1)`
              : '8px 8px 16px rgba(0, 0, 0, 0.3), -8px -8px 16px rgba(255, 255, 255, 0.05)'
          }}
          animate={{
            backgroundColor: neuron.activated ? categoryColors[neuron.category] : '#1F2937'
          }}
        >
          {/* Pulse Effect */}
          {neuron.activated && (
            <motion.div
              className="absolute inset-0 rounded-full"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ backgroundColor: categoryColors[neuron.category] }}
            />
          )}
          
          {/* Icon */}
          <div className="text-3xl z-10">
            {neuron.category === 'input' && '📥'}
            {neuron.category === 'hidden' && '🧠'}
            {neuron.category === 'output' && '🚀'}
          </div>
        </motion.div>
        
        {/* Label */}
        <motion.div
          className="absolute top-full mt-2 whitespace-nowrap text-sm font-medium"
          style={{
            color: neuron.activated ? categoryColors[neuron.category] : '#9CA3AF',
            transform: 'translateZ(20px)'
          }}
        >
          {neuron.label}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function SynapseConnection({ from, to }: { from: Neuron, to: Neuron }) {
  const isActive = from.activated && to.activated
  
  return (
    <motion.svg
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <defs>
        <linearGradient id={`gradient-${from.id}-${to.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={isActive ? '#3B82F6' : '#374151'} />
          <stop offset="100%" stopColor={isActive ? '#10B981' : '#374151'} />
        </linearGradient>
      </defs>
      
      <motion.path
        d={`M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${(from.y + to.y) / 2 - 50} ${to.x} ${to.y}`}
        stroke={`url(#gradient-${from.id}-${to.id})`}
        strokeWidth={isActive ? 3 : 1}
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: from.x * 0.001 }}
      />
      
      {/* Signal Animation */}
      {isActive && (
        <motion.circle
          r="4"
          fill="#FFD700"
          initial={{ offsetDistance: '0%' }}
          animate={{ offsetDistance: '100%' }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <animateMotion
            dur="1s"
            repeatCount="indefinite"
            path={`M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${(from.y + to.y) / 2 - 50} ${to.x} ${to.y}`}
          />
        </motion.circle>
      )}
    </motion.svg>
  )
}

function ThoughtSelector() {
  const { activateThought, activeThought } = useNeuralStore()
  
  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="absolute left-8 top-1/2 transform -translate-y-1/2 space-y-4"
    >
      <h3 className="text-xl font-bold mb-4 text-gray-300">思考パターン</h3>
      {thoughtPatterns.map(thought => (
        <motion.button
          key={thought.id}
          whileHover={{ x: 10 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => activateThought(thought)}
          className={`block w-64 p-4 rounded-2xl text-left transition-all ${
            activeThought?.id === thought.id
              ? 'shadow-inner bg-gray-800'
              : 'shadow-neumorphic-button bg-gray-900'
          }`}
          style={{
            boxShadow: activeThought?.id === thought.id
              ? 'inset 4px 4px 8px rgba(0, 0, 0, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.05)'
              : '6px 6px 12px rgba(0, 0, 0, 0.3), -6px -6px 12px rgba(255, 255, 255, 0.05)'
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: thought.color }}
            />
            <h4 className="font-semibold text-white">{thought.name}</h4>
          </div>
          <p className="text-sm text-gray-400">{thought.description}</p>
        </motion.button>
      ))}
    </motion.div>
  )
}

function LearningProgress() {
  const { learningProgress, increaseLearning } = useNeuralStore()
  
  useEffect(() => {
    const interval = setInterval(() => {
      increaseLearning(1)
    }, 1000)
    return () => clearInterval(interval)
  }, [increaseLearning])
  
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-96"
    >
      <div className="bg-gray-900 rounded-full p-6 shadow-neumorphic">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300 font-medium">学習進捗</span>
          <span className="text-2xl font-bold text-white">{Math.round(learningProgress)}%</span>
        </div>
        <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${learningProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        {learningProgress >= 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center"
          >
            <p className="text-green-400 font-semibold mb-2">学習完了！</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full font-bold"
            >
              起業を始める
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

function FloatingInsights() {
  const insights = [
    '思考の速度が上昇中...',
    'シナプス接続を最適化...',
    '新しいパターンを発見...',
    '学習効率が向上中...'
  ]
  
  const [currentInsight, setCurrentInsight] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentInsight((prev) => (prev + 1) % insights.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [insights.length])
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentInsight}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="absolute top-8 right-8 bg-gray-900 rounded-2xl px-6 py-3 shadow-neumorphic"
      >
        <p className="text-gray-300">{insights[currentInsight]}</p>
      </motion.div>
    </AnimatePresence>
  )
}

// Main Component
function LP8_Neuromorphic() {
  const { neurons, reset } = useNeuralStore()
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Create synapse connections
  const synapses = Object.values(neurons).flatMap(neuron =>
    neuron.connections.map(connId => ({
      from: neuron,
      to: neurons[connId]
    })).filter(conn => conn.to)
  )
  
  return (
    <div className="min-h-screen bg-gray-900 overflow-hidden" ref={containerRef}>
      {/* Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/10 to-gray-900" />
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {/* Header */}
      <header className="relative z-10 p-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold mb-4"
        >
          <span className="text-gradient">Neural</span> Learning
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-300"
        >
          脳の仕組みで学ぶ、次世代の起業教育
        </motion.p>
      </header>
      
      {/* Neural Network Visualization */}
      <div className="relative h-[600px] mt-12">
        {/* Synapses */}
        {synapses.map((synapse, index) => (
          <SynapseConnection
            key={`${synapse.from.id}-${synapse.to.id}`}
            from={synapse.from}
            to={synapse.to}
          />
        ))}
        
        {/* Neurons */}
        {Object.values(neurons).map(neuron => (
          <NeuronNode key={neuron.id} neuron={neuron} />
        ))}
      </div>
      
      {/* UI Components */}
      <ThoughtSelector />
      <LearningProgress />
      <FloatingInsights />
      
      {/* Reset Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={reset}
        className="absolute top-8 left-8 px-6 py-3 bg-gray-800 rounded-2xl shadow-neumorphic-button"
      >
        リセット
      </motion.button>
      
      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-center"
      >
        <p className="text-gray-400 mb-4">
          思考パターンを選択して、ニューラルネットワークの動作を体験
        </p>
      </motion.div>
    </div>
  )
}
// Enhanced component exports
export const MemoizedNeuroMorphicLP = React.memo(LP8_Neuromorphic)
export default LP8_Neuromorphic
// 成功事例ニューラルネットワーク表示
function SuccessNeuralNetwork() {
  const [activeCase, setActiveCase] = useState(0)
  
  const successCases = [
    {
      name: '田中健太',
      age: 34,
      background: 'サラリーマン',
      achievement: 'AIコンサル月収180万円',
      neuralPattern: ['in1', 'h1', 'h2', 'out1'],
      story: 'プログラミング未経験から6ヶ月でAI自動化コンサルタントとして独立。企業のDX支援で安定収益を実現。',
      skills: ['ChatGPT活用', 'ワークフロー設計', '企業コンサル'],
      timeline: '6ヶ月'
    },
    {
      name: '佐藤美樹',
      age: 29,
      background: 'デザイナー',
      achievement: 'SaaS起業月収220万円',
      neuralPattern: ['in2', 'h2', 'h3', 'out2'],
      story: 'ノーコードツールを駆使してデザイナー向けSaaSを開発。ユーザー数1000人突破で黒字化達成。',
      skills: ['Bubble開発', 'UI/UX設計', 'マーケティング'],
      timeline: '8ヶ月'
    },
    {
      name: '山田裕介',
      age: 41,
      background: '営業職',
      achievement: '自動化事業月収250万円',
      neuralPattern: ['in3', 'h3', 'h4', 'out3'],
      story: '営業経験を活かし、中小企業向け業務自動化サービスを展開。リカーリング収益で事業安定化。',
      skills: ['Zapier連携', 'プロセス分析', '顧客開拓'],
      timeline: '10ヶ月'
    }
  ]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCase((prev) => (prev + 1) % successCases.length)
    }, 4000)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <Section>
      <Title style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
        成功者のニューラルパターン解析
      </Title>
      
      <Subtitle>
        実際の成功者の思考パターンを分析し、あなたのニューラルネットワーク構築の参考にしましょう
      </Subtitle>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* ニューラルネットワーク表示 */}
        <div className="relative">
          <BrainVisualization style={{ height: '500px' }}>
            <svg className="w-full h-full" viewBox="0 0 600 500">
              {/* 成功パターンのパス */}
              {successCases[activeCase].neuralPattern.map((neuronId, index) => {
                if (index === successCases[activeCase].neuralPattern.length - 1) return null
                
                return (
                  <motion.line
                    key={`${neuronId}-${index}`}
                    x1={100 + index * 120}
                    y1={250}
                    x2={220 + index * 120}
                    y2={250}
                    stroke={colors.accent}
                    strokeWidth="4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.3 }}
                    style={{
                      filter: `drop-shadow(0 0 8px ${colors.accent})`
                    }}
                  />
                )
              })}
              
              {/* アクティブニューロン */}
              {successCases[activeCase].neuralPattern.map((neuronId, index) => (
                <motion.circle
                  key={neuronId}
                  cx={100 + index * 120}
                  cy={250}
                  r={25}
                  fill={colors.accent}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.3
                  }}
                />
              ))}
            </svg>
          </BrainVisualization>
        </div>
        
        {/* 成功事例詳細 */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCase}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <NeumorphicCard activated>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl mr-4">
                    👤
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {successCases[activeCase].name} ({successCases[activeCase].age})
                    </h3>
                    <p className="text-gray-400">
                      元{successCases[activeCase].background}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-lg mb-4 font-bold text-center">
                  {successCases[activeCase].achievement}
                </div>
                
                <p className="text-gray-300 mb-4 leading-relaxed">
                  {successCases[activeCase].story}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-blue-400 mb-2">習得スキル</h4>
                    <div className="space-y-1">
                      {successCases[activeCase].skills.map((skill, index) => (
                        <div key={index} className="text-xs bg-blue-900 bg-opacity-50 px-2 py-1 rounded text-blue-300">
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-green-400 mb-2">達成期間</h4>
                    <div className="text-2xl font-bold text-green-400">
                      {successCases[activeCase].timeline}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  活性化パターン: {successCases[activeCase].neuralPattern.join(' → ')}
                </div>
              </NeumorphicCard>
            </motion.div>
          </AnimatePresence>
          
          {/* ケース選択 */}
          <div className="flex justify-center space-x-2">
            {successCases.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveCase(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  activeCase === index 
                    ? 'bg-yellow-400 scale-125' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}

// インタラクティブな脳トレーニング
function BrainTrainingGame() {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'completed'>('waiting')
  const [sequence, setSequence] = useState<string[]>([])
  const [userSequence, setUserSequence] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  
  const neurons = ['in1', 'in2', 'in3', 'h1', 'h2', 'out1']
  const { activateNeuron, increaseLearning } = useNeuralStore()
  
  const generateSequence = useCallback(() => {
    const newSequence = Array.from({ length: level + 2 }, () => 
      neurons[Math.floor(Math.random() * neurons.length)]
    )
    setSequence(newSequence)
    setUserSequence([])
  }, [level])
  
  const startGame = () => {
    setGameState('playing')
    generateSequence()
  }
  
  const handleNeuronClick = (neuronId: string) => {
    if (gameState !== 'playing') return
    
    activateNeuron(neuronId)
    const newUserSequence = [...userSequence, neuronId]
    setUserSequence(newUserSequence)
    
    // Check if correct
    if (newUserSequence[newUserSequence.length - 1] !== sequence[newUserSequence.length - 1]) {
      // Wrong! Game over
      setGameState('completed')
      return
    }
    
    // Check if complete
    if (newUserSequence.length === sequence.length) {
      setScore(score + level * 10)
      setLevel(level + 1)
      increaseLearning(level * 5)
      
      setTimeout(() => {
        generateSequence()
      }, 1000)
    }
  }
  
  const resetGame = () => {
    setGameState('waiting')
    setScore(0)
    setLevel(1)
    setSequence([])
    setUserSequence([])
  }
  
  return (
    <Section>
      <Title style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
        ニューラル記憶トレーニング
      </Title>
      
      <Subtitle>
        ニューロンの点滅パターンを記憶し、正確に再現してあなたの脳を鍛えましょう
      </Subtitle>
      
      <div className="max-w-4xl mx-auto">
        {/* ゲーム統計 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <NeumorphicCard className="text-center p-4">
            <div className="text-2xl font-bold text-blue-400">{score}</div>
            <div className="text-sm text-gray-300">スコア</div>
          </NeumorphicCard>
          <NeumorphicCard className="text-center p-4">
            <div className="text-2xl font-bold text-green-400">{level}</div>
            <div className="text-sm text-gray-300">レベル</div>
          </NeumorphicCard>
          <NeumorphicCard className="text-center p-4">
            <div className="text-2xl font-bold text-purple-400">{sequence.length}</div>
            <div className="text-sm text-gray-300">パターン長</div>
          </NeumorphicCard>
        </div>
        
        {/* ゲームエリア */}
        <BrainVisualization style={{ height: '400px' }}>
          <svg className="w-full h-full" viewBox="0 0 600 400">
            {neurons.map((neuronId, index) => {
              const isHighlighted = gameState === 'playing' && sequence[userSequence.length] === neuronId
              const isCorrect = userSequence.includes(neuronId) && sequence.slice(0, userSequence.length).includes(neuronId)
              
              return (
                <motion.circle
                  key={neuronId}
                  cx={100 + (index % 3) * 200}
                  cy={150 + Math.floor(index / 3) * 150}
                  r={30}
                  fill={isHighlighted ? colors.accent : isCorrect ? colors.secondary : colors.primary}
                  opacity={isHighlighted ? 1 : 0.7}
                  onClick={() => handleNeuronClick(neuronId)}
                  style={{ cursor: gameState === 'playing' ? 'pointer' : 'default' }}
                  animate={{
                    scale: isHighlighted ? [1, 1.3, 1] : 1,
                    opacity: isHighlighted ? [0.7, 1, 0.7] : 0.7
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: isHighlighted ? Infinity : 0
                  }}
                />
              )
            })}
          </svg>
        </BrainVisualization>
        
        {/* ゲームコントロール */}
        <div className="text-center mt-8">
          {gameState === 'waiting' && (
            <NeuralButton onClick={startGame}>
              トレーニング開始
            </NeuralButton>
          )}
          
          {gameState === 'playing' && (
            <div className="space-y-4">
              <div className="text-lg text-white">
                パターンを記憶して再現してください
              </div>
              <div className="text-sm text-gray-400">
                進行: {userSequence.length} / {sequence.length}
              </div>
            </div>
          )}
          
          {gameState === 'completed' && (
            <div className="space-y-4">
              <div className="text-xl text-white">
                ゲーム終了！最終スコア: {score}
              </div>
              <NeuralButton onClick={resetGame}>
                再挑戦
              </NeuralButton>
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}

// AIコーチング体験
function AICoachingExperience() {
  const [messages, setMessages] = useState<Array<{ id: number; type: 'ai' | 'user'; text: string }>>([
    { 
      id: 1, 
      type: 'ai', 
      text: 'こんにちは！私はAIDXschoolのニューラルAIコーチです。あなたの起業家思考パターンを分析し、最適な学習プランを提案します。' 
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const { brainActivity, currentLevel } = useNeuralStore()
  
  const coachingResponses = [
    `現在のニューラル活動レベル${brainActivity}%は${brainActivity > 70 ? '非常に高い' : brainActivity > 40 ? '中程度' : '低い'}状態です。`,
    `レベル${currentLevel}の学習者として、次は${currentLevel < 3 ? 'AI基礎の強化' : currentLevel < 5 ? 'ビジネスモデル設計' : 'スケーリング戦略'}に集中することをお勧めします。`,
    'あなたの思考パターンから、創造性と論理性のバランスが取れていることが分かります。この特性を活かしたAI×クリエイティブ分野での起業が適しているでしょう。',
    'ニューラルネットワークの接続強度から判断すると、チームリーダーシップよりも個人的な専門性を深める方向性が成功確率を高めそうです。',
    '学習進捗データを分析した結果、実践的なプロジェクトを通じた学習スタイルがあなたに最も適しています。次のモジュールでは具体的なケーススタディに取り組みましょう。'
  ]
  
  const sendMessage = () => {
    if (!inputValue.trim()) return
    
    const userMessage = {
      id: messages.length + 1,
      type: 'user' as const,
      text: inputValue
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)
    
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'ai' as const,
        text: coachingResponses[Math.floor(Math.random() * coachingResponses.length)]
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 2000)
  }
  
  return (
    <Section>
      <Title style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
        AIニューラルコーチング
      </Title>
      
      <Subtitle>
        AIコーチがあなたのニューラルネットワーク状態を分析し、
        パーソナライズされた学習アドバイスを提供します
      </Subtitle>
      
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* チャット画面 */}
          <NeumorphicCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              🤖 AIコーチ
              <span className="ml-2 text-sm bg-green-500 text-white px-2 py-1 rounded-full">オンライン</span>
            </h3>
            
            <div className="h-80 overflow-y-auto mb-4 bg-black bg-opacity-30 rounded-lg p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="AIコーチに質問してみましょう..."
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <NeuralButton onClick={sendMessage}>
                送信
              </NeuralButton>
            </div>
          </NeumorphicCard>
          
          {/* 分析データ */}
          <NeumorphicCard className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">リアルタイム分析</h3>
            
            <div className="space-y-4">
              <div className="bg-black bg-opacity-30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">ニューラル活動</h4>
                <div className="flex justify-between items-center">
                  <span className="text-white">活性度</span>
                  <span className="text-2xl font-bold text-blue-400">{brainActivity}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <motion.div
                    className="h-2 bg-blue-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${brainActivity}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
              
              <div className="bg-black bg-opacity-30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-400 mb-2">学習プロファイル</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">現在レベル</span>
                    <span className="text-green-400 font-bold">{currentLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">優勢思考</span>
                    <span className="text-green-400">論理・創造バランス型</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">推奨分野</span>
                    <span className="text-green-400">AI×クリエイティブ</span>
                  </div>
                </div>
              </div>
            </div>
          </NeumorphicCard>
        </div>
      </div>
    </Section>
  )
}

// 最終的なCTAコンポーネント
function FinalCTA() {
  return (
    <Section className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <Title style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
          あなたの脳をAI時代にアップグレード
        </Title>
        
        <Subtitle>
          AIDXschoolで、高度なニューラルネットワークを構築し、
          次世代の起業家へと進化しましょう
        </Subtitle>
        
        <NeuralButton
          style={{ 
            fontSize: '1.25rem',
            padding: '1.5rem 3rem',
            background: colors.gradient,
            boxShadow: `0 10px 30px ${colors.primary}40`
          }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: `0 15px 40px ${colors.primary}60`
          }}
          whileTap={{ scale: 0.95 }}
        >
          ニューラルネットワーク学習を開始
        </NeuralButton>
        
        <motion.div 
          className="mt-8 text-gray-400 text-sm max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          ※ このニューラルモーフィックデザインは、実際の脳科学とAI技術を組み合わせた
          革新的な学習体験を提供します。あなたの思考パターンを次世代レベルにアップグレードしましょう。
        </motion.div>
      </motion.div>
    </Section>
  )
}