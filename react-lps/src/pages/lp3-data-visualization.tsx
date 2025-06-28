// LP3: データビジュアライゼーション - 数字で証明するAIDXschoolの圧倒的成果
// AIDXschool AI×DX起業塾 - データドリブンな成功への道筋

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useInView } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ReferenceLine, ComposedChart,
  Treemap, Sankey, FunnelChart, Funnel, LabelList
} from 'recharts'
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

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(78, 181, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(78, 181, 255, 0.8);
  }
`

const dataFlow = keyframes`
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
`

// スタイルコンポーネント
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    180deg,
    #0a0a0a 0%,
    #0f1419 20%,
    #1a1f2e 40%,
    #0f1419 60%,
    #0a0a0a 80%,
    #000000 100%
  );
  position: relative;
  overflow-x: hidden;
`

const Section = styled.section<{ bgColor?: string }>`
  position: relative;
  padding: 4rem 2rem;
  background: ${props => props.bgColor || 'transparent'};
  
  &[data-section-id] {
    scroll-margin-top: 100px;
  }
`

const SectionTitle = styled.h2`
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 800;
  color: ${colors.light};
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  background: ${colors.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 4px;
    background: ${colors.gradient};
    border-radius: 2px;
  }
`

const FloatingNavigation = styled.nav`
  position: fixed;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`

const NavDot = styled.button<{ active?: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid ${colors.primary};
  background: ${props => props.active ? colors.primary : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: scale(1.5);
    background: ${colors.secondary};
    border-color: ${colors.secondary};
  }
  
  &::after {
    content: attr(data-tooltip);
    position: absolute;
    right: 120%;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.8rem;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }
  
  &:hover::after {
    opacity: 1;
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`

const DataCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    border-color: ${colors.primary};
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: ${colors.gradient};
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:hover::before {
    transform: scaleX(1);
  }
`

const ChartContainer = styled.div`
  background: rgba(15, 20, 25, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(78, 181, 255, 0.3);
  border-radius: 20px;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  animation: ${glow} 4s ease-in-out infinite;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(78, 181, 255, 0.1), transparent);
    animation: ${dataFlow} 3s ease-in-out infinite;
  }
`

const StatNumber = styled.div`
  font-size: 3rem;
  font-weight: 900;
  color: ${colors.primary};
  margin-bottom: 0.5rem;
  animation: ${pulse} 2s ease-in-out infinite;
  font-family: 'Courier New', monospace;
`

const StatLabel = styled.div`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
`

// Types
interface DataPoint {
  month: string
  revenue: number
  users: number
  growth: number
  satisfaction: number
  courses: number
  completionRate: number
}

interface ComparisonData {
  category: string
  traditional: number
  aidxschool: number
  improvement: number
}

interface SkillData {
  skill: string
  before: number
  after: number
  category: string
}

interface GrowthProjection {
  period: string
  conservative: number
  realistic: number
  optimistic: number
}

interface StudentSuccessData {
  name: string
  age: number
  previousJob: string
  currentRevenue: number
  timeToSuccess: number
  industry: string
  tools: string[]
}

interface IndustryData {
  industry: string
  averageRevenue: number
  studentCount: number
  successRate: number
  growthRate: number
}

interface ToolUsageData {
  tool: string
  category: string
  usageRate: number
  successImpact: number
  learningCurve: number
}

// Enhanced Mock Data Generators
const generateEnhancedRevenueData = (): DataPoint[] => {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  let revenue = 50000
  let users = 10
  let courses = 5
  
  return months.map((month, index) => {
    revenue += Math.floor(Math.random() * 100000) + index * 25000
    users += Math.floor(Math.random() * 15) + index * 3
    courses += Math.floor(Math.random() * 3) + 1
    const growth = index === 0 ? 0 : Math.floor((revenue / (revenue - 50000)) * 100 - 100)
    const satisfaction = 88 + Math.random() * 8
    const completionRate = 85 + Math.random() * 10
    
    return { month, revenue, users, growth, satisfaction, courses, completionRate }
  })
}

const enhancedComparisonData: ComparisonData[] = [
  { category: '起業成功率', traditional: 15, aidxschool: 94, improvement: 520 },
  { category: '平均収益達成', traditional: 25, aidxschool: 87, improvement: 248 },
  { category: '学習効率', traditional: 35, aidxschool: 96, improvement: 174 },
  { category: 'ROI向上', traditional: 30, aidxschool: 89, improvement: 197 },
  { category: '満足度', traditional: 55, aidxschool: 98, improvement: 78 },
  { category: '継続率', traditional: 40, aidxschool: 92, improvement: 130 },
  { category: 'スキル習得速度', traditional: 28, aidxschool: 91, improvement: 225 },
  { category: 'ネットワーク構築', traditional: 20, aidxschool: 85, improvement: 325 }
]

const enhancedSkillRadarData: SkillData[] = [
  { skill: 'AI活用', before: 12, after: 92, category: 'テクニカル' },
  { skill: 'ノーコード開発', before: 8, after: 87, category: 'テクニカル' },
  { skill: 'データ分析', before: 15, after: 83, category: 'アナリティクス' },
  { skill: 'マーケティング', before: 25, after: 88, category: 'ビジネス' },
  { skill: 'ビジネスモデル設計', before: 18, after: 89, category: 'ビジネス' },
  { skill: '自動化システム', before: 10, after: 94, category: 'テクニカル' },
  { skill: 'プロジェクト管理', before: 30, after: 82, category: 'マネジメント' },
  { skill: 'チーム構築', before: 22, after: 79, category: 'マネジメント' },
  { skill: 'セールス', before: 28, after: 86, category: 'ビジネス' },
  { skill: 'ファイナンス', before: 20, after: 78, category: 'ビジネス' }
]

const growthProjectionData: GrowthProjection[] = [
  { period: '3ヶ月', conservative: 150000, realistic: 300000, optimistic: 500000 },
  { period: '6ヶ月', conservative: 400000, realistic: 800000, optimistic: 1500000 },
  { period: '12ヶ月', conservative: 1000000, realistic: 2500000, optimistic: 5000000 },
  { period: '24ヶ月', conservative: 3000000, realistic: 8000000, optimistic: 15000000 }
]

const studentSuccessStories: StudentSuccessData[] = [
  { name: '田中太郎', age: 32, previousJob: '会社員（営業）', currentRevenue: 1800000, timeToSuccess: 4, industry: 'SaaS', tools: ['ChatGPT', 'Bubble', 'Zapier'] },
  { name: '佐藤花子', age: 28, previousJob: '主婦', currentRevenue: 1200000, timeToSuccess: 3, industry: 'オンライン教育', tools: ['Claude', 'Notion', 'Stripe'] },
  { name: '山田一郎', age: 45, previousJob: 'IT企業管理職', currentRevenue: 3500000, timeToSuccess: 2, industry: 'コンサルティング', tools: ['Gemini', 'Make.com', 'Airtable'] },
  { name: '鈴木美智子', age: 35, previousJob: '看護師', currentRevenue: 2200000, timeToSuccess: 5, industry: 'ヘルスケア', tools: ['ChatGPT', 'FlutterFlow', 'Calendly'] },
  { name: '高橋健', age: 29, previousJob: 'フリーター', currentRevenue: 1500000, timeToSuccess: 6, industry: 'Eコマース', tools: ['Claude', 'Shopify', 'Hootsuite'] }
]

const industryPerformanceData: IndustryData[] = [
  { industry: 'SaaS・IT', averageRevenue: 2800000, studentCount: 145, successRate: 96, growthRate: 340 },
  { industry: 'オンライン教育', averageRevenue: 1900000, studentCount: 123, successRate: 94, growthRate: 280 },
  { industry: 'コンサルティング', averageRevenue: 3200000, studentCount: 98, successRate: 98, growthRate: 420 },
  { industry: 'Eコマース', averageRevenue: 2100000, studentCount: 156, successRate: 91, growthRate: 260 },
  { industry: 'ヘルスケア', averageRevenue: 2500000, studentCount: 87, successRate: 93, growthRate: 310 },
  { industry: 'マーケティング', averageRevenue: 2300000, studentCount: 134, successRate: 95, growthRate: 290 }
]

const toolUsageData: ToolUsageData[] = [
  { tool: 'ChatGPT Pro', category: 'AI', usageRate: 98, successImpact: 92, learningCurve: 15 },
  { tool: 'Claude 3', category: 'AI', usageRate: 87, successImpact: 89, learningCurve: 12 },
  { tool: 'Bubble', category: 'NoCode', usageRate: 76, successImpact: 85, learningCurve: 35 },
  { tool: 'Zapier', category: '自動化', usageRate: 94, successImpact: 88, learningCurve: 20 },
  { tool: 'Make.com', category: '自動化', usageRate: 68, successImpact: 91, learningCurve: 28 },
  { tool: 'Notion AI', category: '生産性', usageRate: 89, successImpact: 76, learningCurve: 10 },
  { tool: 'Midjourney', category: 'デザイン', usageRate: 72, successImpact: 68, learningCurve: 18 },
  { tool: 'Stripe', category: '決済', usageRate: 85, successImpact: 82, learningCurve: 22 }
]

// Zustand Store
interface DashboardStore {
  selectedMetric: 'revenue' | 'users' | 'growth' | 'satisfaction'
  timeRange: '3months' | '6months' | '1year'
  liveMode: boolean
  selectedIndustry: string
  data: DataPoint[]
  setSelectedMetric: (metric: 'revenue' | 'users' | 'growth' | 'satisfaction') => void
  setTimeRange: (range: '3months' | '6months' | '1year') => void
  setSelectedIndustry: (industry: string) => void
  toggleLiveMode: () => void
  updateData: () => void
}

const useDashboardStore = create<DashboardStore>((set, get) => ({
  selectedMetric: 'revenue',
  timeRange: '1year',
  liveMode: false,
  selectedIndustry: 'all',
  data: generateEnhancedRevenueData(),
  setSelectedMetric: (metric) => set({ selectedMetric: metric }),
  setTimeRange: (range) => set({ timeRange: range }),
  setSelectedIndustry: (industry) => set({ selectedIndustry: industry }),
  toggleLiveMode: () => set((state) => ({ liveMode: !state.liveMode })),
  updateData: () => set({ data: generateEnhancedRevenueData() })
}))

// Enhanced Components
function AnimatedNumber({ 
  value, 
  prefix = '', 
  suffix = '', 
  duration = 2000,
  format = 'number'
}: { 
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  format?: 'number' | 'currency' | 'percentage'
}) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  
  useEffect(() => {
    if (!isInView) return
    
    const steps = 60
    const increment = value / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        current = value
        clearInterval(timer)
      }
      setDisplayValue(Math.floor(current))
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [value, duration, isInView])
  
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return val.toLocaleString()
      case 'percentage':
        return val.toFixed(1)
      default:
        return val.toLocaleString()
    }
  }
  
  return (
    <span ref={ref} className="font-mono" style={{ color: colors.primary }}>
      {prefix}{formatValue(displayValue)}{suffix}
    </span>
  )
}

function EnhancedMetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  color,
  trend,
  description
}: { 
  title: string
  value: number
  change: number
  icon: string
  color: string
  trend?: number[]
  description?: string
}) {
  const isPositive = change >= 0
  
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <DataCard>
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl" style={{ fontSize: '3rem' }}>{icon}</div>
          <div className={`text-sm font-semibold flex items-center gap-1 px-2 py-1 rounded-full ${
            isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {isPositive ? '↗' : '↘'} {Math.abs(change)}%
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold" style={{ color }}>
            <AnimatedNumber 
              value={value} 
              prefix={title.includes('収益') ? '¥' : ''} 
              format={title.includes('率') ? 'percentage' : title.includes('収益') ? 'currency' : 'number'}
            />
          </p>
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
        {trend && (
          <div className="mt-4 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend.map((val, idx) => ({ value: val, index: idx }))}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </DataCard>
    </motion.div>
  )
}

function LiveIndicator() {
  const { liveMode, toggleLiveMode } = useDashboardStore()
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLiveMode}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors backdrop-blur-sm ${
        liveMode 
          ? 'bg-red-500/20 border border-red-500 text-red-400' 
          : 'bg-gray-700/50 border border-gray-600 text-gray-400'
      }`}
    >
      <motion.div
        animate={{ scale: liveMode ? [1, 1.2, 1] : 1 }}
        transition={{ repeat: liveMode ? Infinity : 0, duration: 1.5 }}
        className={`w-2 h-2 rounded-full ${liveMode ? 'bg-red-500' : 'bg-gray-500'}`}
      />
      <span className="text-sm font-medium">
        {liveMode ? 'LIVE' : 'ライブモード'}
      </span>
    </motion.button>
  )
}

function EnhancedRevenueChart() {
  const { data, timeRange, selectedMetric } = useDashboardStore()
  const filteredData = useMemo(() => {
    const monthsToShow = timeRange === '3months' ? 3 : timeRange === '6months' ? 6 : 12
    return data.slice(-monthsToShow)
  }, [data, timeRange])
  
  const getMetricData = () => {
    switch (selectedMetric) {
      case 'revenue': return { key: 'revenue', color: colors.primary, name: '月間収益' }
      case 'users': return { key: 'users', color: colors.secondary, name: 'アクティブユーザー' }
      case 'growth': return { key: 'growth', color: colors.accent, name: '成長率' }
      case 'satisfaction': return { key: 'satisfaction', color: colors.purple, name: '満足度' }
      default: return { key: 'revenue', color: colors.primary, name: '月間収益' }
    }
  }
  
  const metric = getMetricData()
  
  return (
    <ChartContainer>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">{metric.name}推移</h3>
        <div className="flex gap-2">
          {(['revenue', 'users', 'growth', 'satisfaction'] as const).map((key) => (
            <button
              key={key}
              onClick={() => useDashboardStore.getState().setSelectedMetric(key)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                selectedMetric === key 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {key === 'revenue' ? '収益' : key === 'users' ? 'ユーザー' : key === 'growth' ? '成長率' : '満足度'}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={filteredData}>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={metric.color} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={metric.color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="month" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#ffffff'
            }}
          />
          <Area
            type="monotone"
            dataKey={metric.key}
            stroke={metric.color}
            fillOpacity={1}
            fill="url(#colorGradient)"
            strokeWidth={3}
          />
          <Line
            type="monotone"
            dataKey={metric.key}
            stroke={metric.color}
            strokeWidth={2}
            dot={{ fill: metric.color, strokeWidth: 2, r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

function ComparisonChart() {
  return (
    <ChartContainer>
      <h3 className="text-xl font-bold mb-6 text-white">従来手法 vs AIDXschool</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={enhancedComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="category" 
            stroke="#9CA3AF" 
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis stroke="#9CA3AF" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#ffffff'
            }}
            formatter={(value, name) => [
              `${value}%`,
              name === 'traditional' ? '従来手法' : 'AIDXschool'
            ]}
          />
          <Legend />
          <Bar dataKey="traditional" fill="#EF4444" name="従来手法" radius={[4, 4, 0, 0]} />
          <Bar dataKey="aidxschool" fill="#10B981" name="AIDXschool" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

function EnhancedSkillRadarChart() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const categories = ['all', 'テクニカル', 'ビジネス', 'マネジメント', 'アナリティクス']
  
  const filteredData = useMemo(() => {
    if (selectedCategory === 'all') return enhancedSkillRadarData
    return enhancedSkillRadarData.filter(item => item.category === selectedCategory)
  }, [selectedCategory])
  
  return (
    <ChartContainer>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">スキル習得レベル</h3>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? '全カテゴリ' : cat}
            </option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart data={filteredData}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="skill" stroke="#9CA3AF" fontSize={12} />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            stroke="#9CA3AF"
            fontSize={10}
          />
          <Radar
            name="受講前"
            dataKey="before"
            stroke="#EF4444"
            fill="#EF4444"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Radar
            name="受講後"
            dataKey="after"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

function GrowthProjectionChart() {
  return (
    <ChartContainer>
      <h3 className="text-xl font-bold mb-6 text-white">収益成長予測</h3>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={growthProjectionData}>
          <defs>
            <linearGradient id="conservative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFA500" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#FFA500" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="realistic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4EB5FF" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#4EB5FF" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="optimistic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="period" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#ffffff'
            }}
            formatter={(value: number) => [`¥${value.toLocaleString()}`, '']}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="conservative"
            stackId="1"
            stroke="#FFA500"
            fill="url(#conservative)"
            name="保守的予測"
          />
          <Area
            type="monotone"
            dataKey="realistic"
            stackId="2"
            stroke="#4EB5FF"
            fill="url(#realistic)"
            name="現実的予測"
          />
          <Area
            type="monotone"
            dataKey="optimistic"
            stackId="3"
            stroke="#10B981"
            fill="url(#optimistic)"
            name="楽観的予測"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

function StudentSuccessSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % studentSuccessStories.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])
  
  const currentStudent = studentSuccessStories[currentIndex]
  
  return (
    <ChartContainer>
      <h3 className="text-xl font-bold mb-6 text-center text-white">受講生の成功事例</h3>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="text-center space-y-6"
        >
          <div className="text-6xl mb-4">🎯</div>
          <div>
            <h4 className="text-2xl font-bold" style={{ color: colors.primary }}>
              {currentStudent.name} ({currentStudent.age}歳)
            </h4>
            <p className="text-gray-400 mt-2">前職: {currentStudent.previousJob}</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-white mb-2">
              <AnimatedNumber value={currentStudent.currentRevenue} prefix="¥" format="currency" />
              <span className="text-lg text-gray-400 ml-2">/月</span>
            </p>
            <p className="text-gray-400">
              {currentStudent.timeToSuccess}ヶ月で達成 | {currentStudent.industry}
            </p>
          </div>
          <div className="flex justify-center gap-2 flex-wrap">
            {currentStudent.tools.map((tool, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
              >
                {tool}
              </span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-center gap-2 mt-6">
        {studentSuccessStories.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </ChartContainer>
  )
}

function IndustryPerformanceChart() {
  return (
    <ChartContainer>
      <h3 className="text-xl font-bold mb-6 text-white">業界別パフォーマンス</h3>
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart data={industryPerformanceData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            type="number" 
            dataKey="successRate" 
            stroke="#9CA3AF"
            domain={[85, 100]}
            name="成功率"
          />
          <YAxis 
            type="number" 
            dataKey="averageRevenue" 
            stroke="#9CA3AF"
            name="平均収益"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#ffffff'
            }}
            formatter={(value, name) => {
              if (name === 'averageRevenue') return [`¥${value.toLocaleString()}`, '平均収益']
              if (name === 'successRate') return [`${value}%`, '成功率']
              return [value, name]
            }}
          />
          <Scatter name="業界" dataKey="averageRevenue" fill={colors.primary}>
            {industryPerformanceData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors.primary} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

function ToolEffectivenessChart() {
  return (
    <ChartContainer>
      <h3 className="text-xl font-bold mb-6 text-white">ツール効果分析</h3>
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart data={toolUsageData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            type="number" 
            dataKey="usageRate" 
            stroke="#9CA3AF"
            domain={[60, 100]}
            name="使用率"
          />
          <YAxis 
            type="number" 
            dataKey="successImpact" 
            stroke="#9CA3AF"
            domain={[60, 100]}
            name="成功への影響"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#ffffff'
            }}
            formatter={(value, name, props) => {
              const data = props.payload
              return [
                <div key="tooltip">
                  <p><strong>{data.tool}</strong></p>
                  <p>使用率: {data.usageRate}%</p>
                  <p>成功への影響: {data.successImpact}%</p>
                  <p>学習難易度: {data.learningCurve}%</p>
                </div>
              ]
            }}
            labelFormatter={() => ''}
          />
          <Scatter name="ツール" dataKey="successImpact" fill={colors.secondary}>
            {toolUsageData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.category === 'AI' ? colors.primary : 
                      entry.category === 'NoCode' ? colors.secondary :
                      entry.category === '自動化' ? colors.accent :
                      colors.purple} 
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

// Main Component
export default function LP3_DataVisualization() {
  const { data, liveMode, updateData } = useDashboardStore()
  const [activeSection, setActiveSection] = useState(0)
  
  // Live mode data update
  useEffect(() => {
    if (!liveMode) return
    
    const interval = setInterval(() => {
      updateData()
    }, 3000)
    
    return () => clearInterval(interval)
  }, [liveMode, updateData])
  
  // Calculate enhanced summary metrics
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)
  const totalUsers = data.reduce((sum, d) => sum + d.users, 0)
  const avgGrowth = data.reduce((sum, d) => sum + d.growth, 0) / data.length
  const avgSatisfaction = data.reduce((sum, d) => sum + d.satisfaction, 0) / data.length
  const totalCourses = data.reduce((sum, d) => sum + d.courses, 0)
  const avgCompletionRate = data.reduce((sum, d) => sum + d.completionRate, 0) / data.length
  
  // Navigation function
  const scrollToSection = (index: number) => {
    const sections = document.querySelectorAll('[data-section-id]')
    sections[index]?.scrollIntoView({ behavior: 'smooth' })
    setActiveSection(index)
  }
  
  return (
    <Container>
      {/* Floating Navigation */}
      <FloatingNavigation>
        {['ダッシュボード', 'メトリクス', '比較分析', 'スキル', '成功事例', '業界分析', 'ツール', 'CTA'].map((label, index) => (
          <NavDot
            key={index}
            active={activeSection === index}
            data-tooltip={label}
            onClick={() => scrollToSection(index)}
          />
        ))}
      </FloatingNavigation>
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-gray-800 backdrop-blur-sm bg-gray-900/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">
                <span style={{ background: colors.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  AIDXschool
                </span> データダッシュボード
              </h1>
              <p className="text-gray-400 mt-2 text-lg">数字が証明する圧倒的な成果 - リアルタイム成功指標</p>
            </div>
            <LiveIndicator />
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        {/* Enhanced Metrics Grid */}
        <Section data-section-id="dashboard">
          <SectionTitle>リアルタイム成果指標</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <EnhancedMetricCard
              title="総収益"
              value={totalRevenue}
              change={15.8}
              icon="💰"
              color={colors.secondary}
              description="全受講生の月間総収益"
            />
            <EnhancedMetricCard
              title="アクティブ起業家"
              value={totalUsers}
              change={22.4}
              icon="👥"
              color={colors.primary}
              description="現在活動中の起業家数"
            />
            <EnhancedMetricCard
              title="平均成長率"
              value={Math.round(avgGrowth)}
              change={avgGrowth}
              icon="📈"
              color={colors.purple}
              description="月次売上成長率"
            />
            <EnhancedMetricCard
              title="満足度スコア"
              value={Math.round(avgSatisfaction)}
              change={2.1}
              icon="⭐"
              color={colors.accent}
              description="受講生満足度評価"
            />
            <EnhancedMetricCard
              title="開講コース数"
              value={totalCourses}
              change={8.3}
              icon="📚"
              color={colors.danger}
              description="累計提供コース数"
            />
            <EnhancedMetricCard
              title="完了率"
              value={Math.round(avgCompletionRate)}
              change={5.7}
              icon="✅"
              color={colors.pink}
              description="コース完了率"
            />
          </div>
        </Section>
        
        {/* Enhanced Charts Grid */}
        <Section data-section-id="metrics">
          <SectionTitle>詳細パフォーマンス分析</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <EnhancedRevenueChart />
            <GrowthProjectionChart />
          </div>
        </Section>
        
        <Section data-section-id="comparison">
          <SectionTitle>競合比較分析</SectionTitle>
          <div className="grid grid-cols-1 gap-6 mb-12">
            <ComparisonChart />
          </div>
        </Section>
        
        <Section data-section-id="skills">
          <SectionTitle>スキル習得分析</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <EnhancedSkillRadarChart />
            <ToolEffectivenessChart />
          </div>
        </Section>
        
        <Section data-section-id="success">
          <SectionTitle>成功事例ケーススタディ</SectionTitle>
          <div className="grid grid-cols-1 gap-6 mb-12">
            <StudentSuccessSlider />
          </div>
        </Section>
        
        <Section data-section-id="industry">
          <SectionTitle>業界別実績分析</SectionTitle>
          <div className="grid grid-cols-1 gap-6 mb-12">
            <IndustryPerformanceChart />
          </div>
          
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-center mb-6 text-white">業界別詳細データ</h3>
            <Grid>
              {industryPerformanceData.map((industry, index) => (
                <DataCard key={index}>
                  <h4 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>
                    {industry.industry}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">平均収益:</span>
                      <span className="font-bold text-white">
                        ¥<AnimatedNumber value={industry.averageRevenue} format="currency" />
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">受講生数:</span>
                      <span className="font-bold text-white">
                        <AnimatedNumber value={industry.studentCount} />人
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">成功率:</span>
                      <span className="font-bold" style={{ color: colors.secondary }}>
                        <AnimatedNumber value={industry.successRate} />%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">成長率:</span>
                      <span className="font-bold" style={{ color: colors.accent }}>
                        <AnimatedNumber value={industry.growthRate} />%
                      </span>
                    </div>
                  </div>
                </DataCard>
              ))}
            </Grid>
          </div>
        </Section>
        
        <Section data-section-id="tools">
          <SectionTitle>ツール効果分析</SectionTitle>
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-center mb-6 text-white">使用ツール詳細</h3>
            <Grid>
              {toolUsageData.map((tool, index) => (
                <DataCard key={index}>
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xl font-bold" style={{ color: colors.primary }}>
                      {tool.tool}
                    </h4>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                      {tool.category}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400 text-sm">使用率</span>
                        <span className="text-white font-bold">
                          <AnimatedNumber value={tool.usageRate} />%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          className="h-2 rounded-full"
                          style={{ backgroundColor: colors.primary }}
                          initial={{ width: 0 }}
                          animate={{ width: `${tool.usageRate}%` }}
                          transition={{ duration: 1.5, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400 text-sm">成功への影響</span>
                        <span className="text-white font-bold">
                          <AnimatedNumber value={tool.successImpact} />%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          className="h-2 rounded-full"
                          style={{ backgroundColor: colors.secondary }}
                          initial={{ width: 0 }}
                          animate={{ width: `${tool.successImpact}%` }}
                          transition={{ duration: 1.5, delay: index * 0.1 + 0.3 }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400 text-sm">学習難易度</span>
                        <span className="text-white font-bold">
                          <AnimatedNumber value={tool.learningCurve} />%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          className="h-2 rounded-full"
                          style={{ backgroundColor: colors.accent }}
                          initial={{ width: 0 }}
                          animate={{ width: `${tool.learningCurve}%` }}
                          transition={{ duration: 1.5, delay: index * 0.1 + 0.6 }}
                        />
                      </div>
                    </div>
                  </div>
                </DataCard>
              ))}
            </Grid>
          </div>
        </Section>
        
        {/* Enhanced CTA Section */}
        <Section data-section-id="cta">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center py-12"
          >
            <h2 className="text-5xl font-bold mb-6">
              データが証明する、<br />
              <span style={{ background: colors.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                圧倒的な成果
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              AIDXschoolの受講生は、データが示すとおり平均3ヶ月で月収100万円を達成。
              <br />
              94%という驚異的な成功率で、あなたも確実に次の成功者となれます。
              <br />
              数字に裏付けられた確実な成功への道筋を今すぐ歩み始めませんか？
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full font-bold text-lg shadow-2xl"
              >
                無料データ分析セッションを予約
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-transparent border-2 border-green-500 text-green-400 rounded-full font-bold text-lg hover:bg-green-500 hover:text-white transition-colors"
              >
                詳細レポートをダウンロード
              </motion.button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: colors.primary }}>
                  <AnimatedNumber value={94} />%
                </div>
                <div className="text-gray-400 mt-1">成功率</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: colors.secondary }}>
                  ¥<AnimatedNumber value={1800000} format="currency" />
                </div>
                <div className="text-gray-400 mt-1">平均月収</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: colors.accent }}>
                  <AnimatedNumber value={3.2} format="percentage" />ヶ月
                </div>
                <div className="text-gray-400 mt-1">平均達成期間</div>
              </div>
            </div>
            
            <p className="text-sm text-gray-400 mt-8 max-w-2xl mx-auto">
              ※ 無料データ分析セッションでは、あなたの現状を詳細に分析し、最適化された成功ルートをデータに基づいてご提案します
              <br />
              ※ 詳細レポートには、業界別成功事例、ツール効果分析、ROI予測などの貴重なデータが含まれます
            </p>
          </motion.div>
        </Section>
      </main>
    </Container>
  )
}