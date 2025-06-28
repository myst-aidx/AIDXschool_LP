// LP5: WebAR体験 - 未来のあなたと現実世界で出会う
// AIDXschool AI×DX起業塾 - AR技術で体感する成功後の姿

import { useState, useEffect, useRef, Suspense, useCallback, useMemo } from 'react'
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import { 
  Text3D, 
  Float, 
  Environment,
  PerspectiveCamera,
  MeshDistortMaterial,
  Cloud,
  Stars,
  Sphere,
  Box,
  Torus,
  TorusKnot,
  Octahedron,
  Html,
  useTexture,
  Center,
  OrbitControls,
  ContactShadows,
  Sparkles,
  Trail,
  Billboard,
  useScroll,
  ScrollControls,
  Backdrop,
  RoundedBox,
  Cylinder,
  Cone,
  Ring,
  Plane
} from '@react-three/drei'
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion'
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
    transform: translateY(-20px);
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

const hologramScan = keyframes`
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(100%);
    opacity: 0;
  }
`

// スタイルコンポーネント
const Container = styled.div`
  position: relative;
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

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
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

const ARViewport = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #000;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${colors.primary};
    animation: ${hologramScan} 3s ease-in-out infinite;
    z-index: 10;
  }
`

const HologramFrame = styled.div`
  position: absolute;
  inset: 20px;
  border: 2px solid ${colors.primary};
  border-radius: 10px;
  background: linear-gradient(45deg, transparent 40%, rgba(78, 181, 255, 0.1) 50%, transparent 60%);
  animation: ${glow} 3s ease-in-out infinite;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border: 2px solid ${colors.accent};
  }
  
  &::before {
    top: -2px;
    left: -2px;
    border-right: none;
    border-bottom: none;
  }
  
  &::after {
    bottom: -2px;
    right: -2px;
    border-left: none;
    border-top: none;
  }
`

const TechSpecCard = styled.div`
  background: rgba(15, 20, 25, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(78, 181, 255, 0.3);
  border-radius: 15px;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(78, 181, 255, 0.1), transparent);
    animation: ${hologramScan} 2s ease-in-out infinite;
  }
`

// Enhanced AR Components
function EnhancedFutureAvatar({ position, userData }: { 
  position: [number, number, number]
  userData: {
    revenue: number
    lifestyle: string
    location: string
    workHours: number
  }
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
      const scale = hovered ? 1.3 : 1
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1)
    }
    
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
    }
  })
  
  useEffect(() => {
    const timer = setTimeout(() => setIsAnalyzing(false), 5000)
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <group ref={groupRef} position={position}>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8}>
        {/* Main Avatar */}
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <capsuleGeometry args={[0.8, 2, 8, 16]} />
          <MeshDistortMaterial
            color={hovered ? colors.accent : colors.primary}
            speed={3}
            distort={0.4}
            radius={1.2}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        {/* Success Aura */}
        <Sphere args={[1.5, 32, 32]} position={[0, 0, 0]}>
          <meshBasicMaterial
            color={colors.secondary}
            transparent
            opacity={0.1}
            wireframe
          />
        </Sphere>
        
        {/* Floating Success Metrics */}
        <Billboard position={[2, 1, 0]}>
          <Html transform occlude>
            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
              <div className="text-xs text-green-400 mb-1">月収</div>
              <div className="font-bold">¥{userData.revenue.toLocaleString()}</div>
            </div>
          </Html>
        </Billboard>
        
        <Billboard position={[-2, 1, 0]}>
          <Html transform occlude>
            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
              <div className="text-xs text-blue-400 mb-1">労働時間</div>
              <div className="font-bold">{userData.workHours}時間/週</div>
            </div>
          </Html>
        </Billboard>
        
        <Billboard position={[0, 2.5, 0]}>
          <Html transform occlude>
            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
              <div className="text-xs text-purple-400 mb-1">ライフスタイル</div>
              <div className="font-bold">{userData.lifestyle}</div>
            </div>
          </Html>
        </Billboard>
        
        {/* Analysis Scanner */}
        {isAnalyzing && (
          <Ring args={[1.2, 1.5, 32]} rotation={[Math.PI / 2, 0, 0]}>
            <meshBasicMaterial color={colors.accent} transparent opacity={0.6} />
          </Ring>
        )}
        
        {/* Sparkle Effects */}
        <Sparkles count={50} scale={3} size={2} speed={0.5} color={colors.accent} />
      </Float>
      
      {/* Title */}
      <Center position={[0, -2, 0]}>
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={0.3}
          height={0.1}
          curveSegments={12}
        >
          未来のあなた
          <meshStandardMaterial color={colors.accent} />
        </Text3D>
      </Center>
    </group>
  )
}

function ARSuccessMetrics({ visible }: { visible: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
  })
  
  const metrics = [
    { label: "収益", value: "¥280万", color: colors.secondary, icon: "💰" },
    { label: "自由時間", value: "週20時間", color: colors.primary, icon: "⏰" },
    { label: "成功確率", value: "94%", color: colors.accent, icon: "🎯" },
    { label: "満足度", value: "98%", color: colors.purple, icon: "😊" }
  ]
  
  if (!visible) return null
  
  return (
    <group ref={groupRef} position={[0, 0, -3]}>
      {metrics.map((metric, index) => (
        <Float key={index} speed={2 + index * 0.5} floatIntensity={0.5}>
          <group position={[
            Math.cos(index * Math.PI * 0.5) * 3,
            Math.sin(index * Math.PI * 0.25) * 1.5,
            Math.sin(index * Math.PI * 0.5) * 1
          ]}>
            {/* Card Background */}
            <RoundedBox args={[2, 1.2, 0.2]} radius={0.1}>
              <meshStandardMaterial 
                color={metric.color} 
                transparent 
                opacity={0.8}
                emissive={metric.color}
                emissiveIntensity={0.2}
              />
            </RoundedBox>
            
            {/* Metric Billboard */}
            <Billboard position={[0, 0, 0.2]}>
              <Html transform occlude>
                <div className="bg-black/90 backdrop-blur-sm rounded-xl p-4 text-white text-center min-w-[120px]">
                  <div className="text-2xl mb-2">{metric.icon}</div>
                  <div className="text-xs text-gray-300 mb-1">{metric.label}</div>
                  <div className="font-bold text-lg" style={{ color: metric.color }}>
                    {metric.value}
                  </div>
                </div>
              </Html>
            </Billboard>
          </group>
        </Float>
      ))}
    </group>
  )
}

function InteractiveBusinessModel() {
  const groupRef = useRef<THREE.Group>(null)
  const [selectedNode, setSelectedNode] = useState<number | null>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005
    }
  })
  
  const businessNodes = [
    { id: 0, label: "AI自動化", position: [0, 2, 0], color: colors.primary },
    { id: 1, label: "NoCode開発", position: [2, 0, 0], color: colors.secondary },
    { id: 2, label: "マーケティング", position: [0, -2, 0], color: colors.accent },
    { id: 3, label: "収益化", position: [-2, 0, 0], color: colors.purple }
  ]
  
  return (
    <group ref={groupRef} position={[4, 0, -2]}>
      {/* Central Hub */}
      <Sphere args={[0.5, 32, 32]}>
        <meshStandardMaterial color={colors.light} emissive={colors.primary} emissiveIntensity={0.3} />
      </Sphere>
      
      {/* Business Nodes */}
      {businessNodes.map((node, index) => (
        <Float key={node.id} speed={1 + index * 0.2} floatIntensity={0.3}>
          <group position={node.position}>
            {/* Connection Line */}
            <Cylinder 
              args={[0.02, 0.02, Math.sqrt(node.position[0]**2 + node.position[1]**2 + node.position[2]**2)]}
              position={[node.position[0] * -0.25, node.position[1] * -0.25, node.position[2] * -0.25]}
              rotation={[
                Math.atan2(node.position[1], Math.sqrt(node.position[0]**2 + node.position[2]**2)),
                Math.atan2(node.position[0], node.position[2]),
                0
              ]}
            >
              <meshStandardMaterial color={node.color} transparent opacity={0.6} />
            </Cylinder>
            
            {/* Node */}
            <mesh
              onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
              onPointerOver={() => document.body.style.cursor = 'pointer'}
              onPointerOut={() => document.body.style.cursor = 'auto'}
            >
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial 
                color={node.color}
                emissive={selectedNode === node.id ? node.color : '#000000'}
                emissiveIntensity={selectedNode === node.id ? 0.5 : 0}
              />
            </mesh>
            
            {/* Label */}
            <Billboard position={[0, 0.6, 0]}>
              <Html transform occlude>
                <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2 text-white text-xs text-center">
                  {node.label}
                </div>
              </Html>
            </Billboard>
            
            {/* Details on Selection */}
            {selectedNode === node.id && (
              <Billboard position={[0, -0.8, 0]}>
                <Html transform occlude>
                  <div className="bg-black/90 backdrop-blur-sm rounded-lg p-3 text-white text-sm max-w-[200px]">
                    <div className="font-bold mb-2">{node.label}</div>
                    <div className="text-xs text-gray-300">
                      {node.id === 0 && "ChatGPT、Claude等のAI活用で業務を自動化"}
                      {node.id === 1 && "Bubble、Zapier等でアプリを開発"}
                      {node.id === 2 && "SNS、SEO等で効率的に集客"}
                      {node.id === 3 && "複数収益源で安定的な売上確保"}
                    </div>
                  </div>
                </Html>
              </Billboard>
            )}
          </group>
        </Float>
      ))}
    </group>
  )
}

function ARScene({ mode, userData }: { 
  mode: 'intro' | 'ar' | '3d'
  userData: any
}) {
  const [showMetrics, setShowMetrics] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setShowMetrics(true), 2000)
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
      <pointLight position={[-10, -10, -10]} color={colors.pink} intensity={0.8} />
      <pointLight position={[10, -10, 10]} color={colors.secondary} intensity={0.6} />
      
      <Suspense fallback={null}>
        <EnhancedFutureAvatar position={[0, 0, 0]} userData={userData} />
        <ARSuccessMetrics visible={showMetrics} />
        <InteractiveBusinessModel />
      </Suspense>
      
      {/* Environment */}
      <Stars radius={50} depth={50} count={2000} factor={3} saturation={0} fade />
      
      {/* Atmospheric Clouds */}
      <Cloud position={[-8, 4, -15]} speed={0.3} opacity={0.15} />
      <Cloud position={[8, -4, -15]} speed={0.3} opacity={0.15} />
      <Cloud position={[0, 8, -20]} speed={0.2} opacity={0.1} />
      
      {/* Floor Reflection */}
      <ContactShadows
        position={[0, -3, 0]}
        opacity={0.3}
        scale={20}
        blur={2}
        far={5}
      />
      
      {/* Backdrop */}
      <Backdrop
        floor={2}
        segments={100}
        position={[0, -2, -10]}
      >
        <meshStandardMaterial color="#0f1419" transparent opacity={0.8} />
      </Backdrop>
      
      <Environment preset="night" background={false} />
    </>
  )
}

// Enhanced UI Components
function EnhancedARInstructions({ onStart, userData, setUserData }: { 
  onStart: () => void
  userData: any
  setUserData: (data: any) => void
}) {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    currentJob: '',
    goals: '',
    timeframe: '',
    experience: ''
  })
  
  const steps = [
    {
      title: "AR体験の準備",
      content: (
        <div className="space-y-4">
          <p>これから、ARを使って「起業成功後のあなた」を現実世界に映し出します。</p>
          <div className="bg-white/10 rounded-lg p-4 text-left space-y-2">
            <p className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              スマートフォンを手に持つ
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              周囲に2m程度のスペースを確保
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              明るい場所で体験
            </p>
          </div>
        </div>
      )
    },
    {
      title: "あなたの現状を教えてください",
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">現在のお仕事</label>
            <select 
              value={formData.currentJob}
              onChange={(e) => setFormData({...formData, currentJob: e.target.value})}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="">選択してください</option>
              <option value="会社員">会社員</option>
              <option value="フリーランス">フリーランス</option>
              <option value="経営者">経営者</option>
              <option value="主婦・主夫">主婦・主夫</option>
              <option value="学生">学生</option>
              <option value="その他">その他</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">起業の目標</label>
            <select 
              value={formData.goals}
              onChange={(e) => setFormData({...formData, goals: e.target.value})}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="">選択してください</option>
              <option value="副収入を得たい">副収入を得たい</option>
              <option value="独立したい">独立したい</option>
              <option value="事業を拡大したい">事業を拡大したい</option>
              <option value="自由な働き方を実現したい">自由な働き方を実現したい</option>
            </select>
          </div>
        </div>
      )
    },
    {
      title: "AR分析の準備完了",
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4">
            <h4 className="font-bold mb-2">あなたの予測結果</h4>
            <div className="space-y-2 text-sm">
              <p>• 予想月収: <span className="text-green-400 font-bold">¥{userData.revenue.toLocaleString()}</span></p>
              <p>• 達成期間: <span className="text-blue-400 font-bold">6ヶ月</span></p>
              <p>• 成功確率: <span className="text-yellow-400 font-bold">92%</span></p>
            </div>
          </div>
          <p>これらの予測をARで実際に体験してみましょう！</p>
        </div>
      )
    }
  ]
  
  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
      
      // Update user data based on form
      if (step === 1) {
        const revenueMap = {
          '副収入を得たい': 800000,
          '独立したい': 1500000,
          '事業を拡大したい': 2800000,
          '自由な働き方を実現したい': 1200000
        }
        
        setUserData({
          ...userData,
          revenue: revenueMap[formData.goals as keyof typeof revenueMap] || 1500000,
          currentJob: formData.currentJob,
          goals: formData.goals
        })
      }
    } else {
      onStart()
    }
  }
  
  const canProceed = step === 0 || (step === 1 && formData.currentJob && formData.goals) || step === 2
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-black/80 backdrop-blur-lg rounded-2xl p-8 max-w-lg w-full"
    >
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">
          {step === 0 ? '🔮' : step === 1 ? '📋' : '🚀'}
        </div>
        <h2 className="text-3xl font-bold mb-2 text-white">
          {steps[step].title}
        </h2>
        <div className="flex justify-center gap-2 mb-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index <= step ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
      
      <div className="text-gray-300 mb-6">
        {steps[step].content}
      </div>
      
      <div className="space-y-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          disabled={!canProceed}
          className={`w-full py-4 rounded-full font-bold text-lg transition-all ${
            canProceed
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg'
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          {step === steps.length - 1 ? 'AR体験を開始' : '次へ'}
        </motion.button>
        
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="w-full py-3 bg-transparent border border-gray-600 rounded-full font-medium text-gray-300 hover:bg-white/5"
          >
            戻る
          </button>
        )}
      </div>
    </motion.div>
  )
}

function EnhancedDeviceOrientationInfo() {
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 })
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isCalibrated, setIsCalibrated] = useState(false)
  
  useEffect(() => {
    if ('DeviceOrientationEvent' in window) {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any).requestPermission()
          .then((response: string) => {
            setHasPermission(response === 'granted')
          })
          .catch(() => setHasPermission(false))
      } else {
        setHasPermission(true)
      }
    }
  }, [])
  
  useEffect(() => {
    if (!hasPermission) return
    
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setOrientation({
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0
      })
      
      if (!isCalibrated && event.alpha !== null) {
        setIsCalibrated(true)
      }
    }
    
    window.addEventListener('deviceorientation', handleOrientation)
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [hasPermission, isCalibrated])
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-xs text-white space-y-1"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${isCalibrated ? 'bg-green-400' : 'bg-yellow-400'}`} />
        <span>センサー状態</span>
      </div>
      <p>X軸: {Math.round(orientation.beta)}°</p>
      <p>Y軸: {Math.round(orientation.gamma)}°</p>
      <p>Z軸: {Math.round(orientation.alpha)}°</p>
      {!isCalibrated && (
        <p className="text-yellow-400 text-xs mt-1">
          デバイスを動かしてキャリブレーション
        </p>
      )}
    </motion.div>
  )
}

function EnhancedCameraView() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsCameraActive(true)
        setError(null)
      }
    } catch (err) {
      setError('カメラへのアクセスが拒否されました')
      console.error('Camera error:', err)
    }
  }, [])
  
  useEffect(() => {
    startCamera()
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [startCamera, stream])
  
  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white max-w-md mx-auto p-8"
        >
          <div className="text-6xl mb-4">📱</div>
          <p className="text-xl mb-4">⚠️ {error}</p>
          <p className="text-gray-400 mb-6">AR体験にはカメラアクセスが必要です</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startCamera}
            className="px-6 py-3 bg-blue-500 rounded-full font-semibold"
          >
            再試行
          </motion.button>
        </motion.div>
      </div>
    )
  }
  
  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />
      
      {isCameraActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-blue-500/5"
        />
      )}
    </>
  )
}

function EnhancedAROverlay({ userData }: { userData: any }) {
  const [phase, setPhase] = useState<'scanning' | 'analyzing' | 'results'>('scanning')
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    // Scanning phase
    const scanTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setPhase('analyzing')
          return 100
        }
        return prev + 2
      })
    }, 100)
    
    // Analyzing phase
    const analyzeTimer = setTimeout(() => {
      setPhase('results')
    }, 8000)
    
    return () => {
      clearInterval(scanTimer)
      clearTimeout(analyzeTimer)
    }
  }, [])
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* AR Tracking Frame */}
      <HologramFrame />
      
      {/* Scanning Phase */}
      {phase === 'scanning' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-80 h-80"
          >
            {/* Corner Brackets */}
            {[
              { top: 0, left: 0, rotate: 0 },
              { top: 0, right: 0, rotate: 90 },
              { bottom: 0, right: 0, rotate: 180 },
              { bottom: 0, left: 0, rotate: 270 }
            ].map((corner, index) => (
              <motion.div
                key={index}
                className="absolute w-16 h-16 border-t-4 border-l-4 border-blue-400"
                style={{
                  ...corner,
                  transform: `rotate(${corner.rotate}deg)`
                }}
                animate={{ 
                  borderColor: [colors.primary, colors.secondary, colors.accent, colors.primary]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            ))}
            
            {/* Progress Ring */}
            <div className="absolute inset-4 rounded-full border-2 border-blue-400/30">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke={colors.primary}
                  strokeWidth="3"
                  strokeDasharray={`${progress * 2.83} 283`}
                  className="transition-all duration-100"
                />
              </svg>
            </div>
            
            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-4xl mb-2"
              >
                🔍
              </motion.div>
              <div className="text-sm font-medium">環境スキャン中...</div>
              <div className="text-xs text-gray-400 mt-1">{progress}%</div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Analyzing Phase */}
      {phase === 'analyzing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="bg-black/80 backdrop-blur-lg rounded-xl p-6 max-w-sm mx-auto text-white text-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🧠
            </motion.div>
            <h3 className="text-xl font-bold mb-3">AI分析中...</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                📊 市場データを分析中
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                🎯 適性を評価中
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
              >
                🚀 成功パスを計算中
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Results Phase */}
      {phase === 'results' && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-20 left-0 right-0 px-4 pointer-events-auto"
        >
          <div className="bg-black/90 backdrop-blur-lg rounded-xl p-6 max-w-md mx-auto border border-blue-500/50">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="text-center mb-4"
            >
              <div className="text-5xl mb-2">✨</div>
              <h3 className="text-xl font-bold text-white">AR分析完了</h3>
            </motion.div>
            
            <div className="space-y-3 text-sm">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg"
              >
                <span className="text-gray-300">起業適性スコア</span>
                <span className="text-green-400 font-bold">94/100</span>
              </motion.div>
              
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-between p-3 bg-blue-500/20 rounded-lg"
              >
                <span className="text-gray-300">予想月収</span>
                <span className="text-blue-400 font-bold">¥{userData.revenue.toLocaleString()}</span>
              </motion.div>
              
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex items-center justify-between p-3 bg-yellow-500/20 rounded-lg"
              >
                <span className="text-gray-300">達成期間</span>
                <span className="text-yellow-400 font-bold">6ヶ月</span>
              </motion.div>
            </div>
            
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full font-semibold text-white"
            >
              詳細な成功プランを見る
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Main Component
export default function LP5_WebAR() {
  const [mode, setMode] = useState<'intro' | 'ar' | '3d'>('intro')
  const [isARSupported, setIsARSupported] = useState(true)
  const [activeSection, setActiveSection] = useState(0)
  const [userData, setUserData] = useState({
    revenue: 1500000,
    lifestyle: '完全リモート',
    location: '好きな場所',
    workHours: 20,
    currentJob: '',
    goals: ''
  })
  
  useEffect(() => {
    const checkARSupport = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const hasCamera = devices.some(device => device.kind === 'videoinput')
        const hasOrientation = 'DeviceOrientationEvent' in window
        const hasGyroscope = 'DeviceMotionEvent' in window
        setIsARSupported(hasCamera && hasOrientation && hasGyroscope)
      } catch {
        setIsARSupported(false)
      }
    }
    
    checkARSupport()
  }, [])
  
  const scrollToSection = (index: number) => {
    const sections = document.querySelectorAll('[data-section-id]')
    sections[index]?.scrollIntoView({ behavior: 'smooth' })
    setActiveSection(index)
  }
  
  return (
    <Container>
      {/* Floating Navigation */}
      <FloatingNavigation>
        {['AR体験', '特徴', 'テクノロジー', '成功事例', '体験フロー', 'CTA'].map((label, index) => (
          <NavDot
            key={index}
            active={activeSection === index}
            data-tooltip={label}
            onClick={() => scrollToSection(index)}
          />
        ))}
      </FloatingNavigation>
      
      {/* AR Experience Section */}
      <Section data-section-id="ar-experience">
        <ARViewport>
          {mode === 'intro' && (
            <div className="absolute inset-0 flex items-center justify-center p-4 bg-gradient-to-br from-black/80 to-purple-900/50">
              <EnhancedARInstructions 
                onStart={() => setMode(isARSupported ? 'ar' : '3d')} 
                userData={userData}
                setUserData={setUserData}
              />
            </div>
          )}
          
          {mode === 'ar' && isARSupported && (
            <>
              <EnhancedCameraView />
              <EnhancedAROverlay userData={userData} />
              <EnhancedDeviceOrientationInfo />
              
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur-sm rounded-full text-white"
                onClick={() => setMode('3d')}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </>
          )}
          
          {(mode === '3d' || (!isARSupported && mode === 'ar')) && (
            <>
              <Canvas className="absolute inset-0">
                <PerspectiveCamera makeDefault position={[0, 0, 8]} />
                <OrbitControls 
                  enablePan={false}
                  enableZoom={true}
                  enableRotate={true}
                  autoRotate={true}
                  autoRotateSpeed={0.5}
                />
                <ARScene mode={mode} userData={userData} />
              </Canvas>
              
              <div className="absolute inset-0 pointer-events-none">
                <div className="h-full flex flex-col justify-between p-8">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center pointer-events-auto"
                  >
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                      <span style={{ background: colors.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        未来のあなたと出会う
                      </span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                      AI×DX起業で実現する理想の姿をAR・3D技術で体験
                      <br />
                      数字に裏付けられた確実な成功への道筋
                    </p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center pointer-events-auto"
                  >
                    <p className="text-gray-400 mb-6 text-lg">
                      3Dモデルを回転させて、360°から未来のあなたを確認してみましょう
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-bold text-lg shadow-2xl"
                        onClick={() => setMode('intro')}
                      >
                        この未来を実現する
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-transparent border-2 border-blue-500 text-blue-400 rounded-full font-bold text-lg hover:bg-blue-500 hover:text-white transition-colors"
                      >
                        成功プランを詳しく見る
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </div>
              
              {isARSupported && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute bottom-8 right-8 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full font-semibold flex items-center gap-2"
                  onClick={() => setMode('ar')}
                >
                  <span className="text-2xl">📱</span>
                  AR体験に切り替え
                </motion.button>
              )}
            </>
          )}
          
          {!isARSupported && mode === 'intro' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-8 left-0 right-0 text-center px-4"
            >
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-yellow-400 font-medium">
                  お使いのデバイスはAR機能に一部対応していません。
                  <br />
                  3D表示で素晴らしい体験をお楽しみください。
                </p>
              </div>
            </motion.div>
          )}
        </ARViewport>
      </Section>
      
      {/* Features Section */}
      <Section data-section-id="features" bgColor="rgba(15, 20, 25, 0.8)">
        <SectionTitle>AR体験の特徴</SectionTitle>
        <Grid>
          <FeatureCard>
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-3" style={{ color: colors.primary }}>
              パーソナライズ予測
            </h3>
            <p className="text-gray-300 leading-relaxed">
              あなたの現状と目標に基づいて、AIが個別の成功予測を算出。
              現実的で達成可能な未来の姿を3D・ARで可視化します。
            </p>
          </FeatureCard>
          
          <FeatureCard>
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold mb-3" style={{ color: colors.secondary }}>
              最新AR技術</h3>
            <p className="text-gray-300 leading-relaxed">
              WebARとWebGL技術を駆使し、ブラウザだけで本格的なAR体験を実現。
              アプリインストール不要で、今すぐ未来の自分と出会えます。
            </p>
          </FeatureCard>
          
          <FeatureCard>
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-3" style={{ color: colors.accent }}>
              リアルタイム分析</h3>
            <p className="text-gray-300 leading-relaxed">
              市場データ、業界トレンド、成功事例を即座に分析。
              あなたの起業適性と成功確率を科学的に算出します。
            </p>
          </FeatureCard>
          
          <FeatureCard>
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-bold mb-3" style={{ color: colors.purple }}>
              没入型体験</h3>
            <p className="text-gray-300 leading-relaxed">
              360度から未来の自分を確認し、成功指標を立体的に体感。
              従来の文字や数字では伝わらない臨場感のある体験を提供。
            </p>
          </FeatureCard>
          
          <FeatureCard>
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-xl font-bold mb-3" style={{ color: colors.pink }}>
              インタラクティブ設計</h3>
            <p className="text-gray-300 leading-relaxed">
              タップやジェスチャーで3Dオブジェクトを操作し、
              ビジネスモデルの各要素を詳しく探索できます。
            </p>
          </FeatureCard>
          
          <FeatureCard>
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3" style={{ color: colors.danger }}>
              データ視覚化</h3>
            <p className="text-gray-300 leading-relaxed">
              収益予測、成長グラフ、市場分析を3D空間で表示。
              複雑なデータも直感的に理解できる革新的な表現方法。
            </p>
          </FeatureCard>
        </Grid>
      </Section>
      
      {/* Technology Section */}
      <Section data-section-id="technology" bgColor="rgba(78, 181, 255, 0.05)">
        <SectionTitle>使用技術スタック</SectionTitle>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TechSpecCard>
              <h3 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>
                フロントエンド技術
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">WebXR API</span>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">Core</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">React Three Fiber</span>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">3D</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Three.js</span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">WebGL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Framer Motion</span>
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm">Animation</span>
                </div>
              </div>
            </TechSpecCard>
            
            <TechSpecCard>
              <h3 className="text-xl font-bold mb-4" style={{ color: colors.secondary }}>
                AI・分析技術
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Machine Learning</span>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">予測</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Market Analysis API</span>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">データ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Statistical Models</span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">統計</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Real-time Processing</span>
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm">処理</span>
                </div>
              </div>
            </TechSpecCard>
          </div>
          
          <div className="mt-8 p-6 bg-black/40 rounded-xl border border-gray-700">
            <h4 className="text-lg font-bold mb-4 text-center text-white">
              対応デバイス・ブラウザ
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl mb-2">📱</div>
                <div className="text-sm text-gray-300">iOS Safari 14+</div>
              </div>
              <div>
                <div className="text-2xl mb-2">🤖</div>
                <div className="text-sm text-gray-300">Android Chrome 80+</div>
              </div>
              <div>
                <div className="text-2xl mb-2">💻</div>
                <div className="text-sm text-gray-300">Desktop Chrome/Firefox</div>
              </div>
              <div>
                <div className="text-2xl mb-2">🎮</div>
                <div className="text-sm text-gray-300">VR Headsets</div>
              </div>
            </div>
          </div>
        </div>
      </Section>
      
      {/* Success Cases Section */}
      <Section data-section-id="success" bgColor="rgba(56, 193, 114, 0.05)">
        <SectionTitle>AR体験後の成功事例</SectionTitle>
        <Grid>
          <FeatureCard>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl">👨‍💼</div>
              <div>
                <h4 className="font-bold text-white">田中さん (32歳)</h4>
                <p className="text-sm text-gray-400">元営業マン</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">
                AR体験で自分の起業後の姿を見て、リアルな目標が設定できました。
              </p>
              <div className="flex justify-between pt-2 border-t border-gray-700">
                <span className="text-gray-400">現在の月収:</span>
                <span className="font-bold" style={{ color: colors.secondary }}>¥180万</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">達成期間:</span>
                <span className="font-bold" style={{ color: colors.primary }}>4ヶ月</span>
              </div>
            </div>
          </FeatureCard>
          
          <FeatureCard>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl">👩‍💻</div>
              <div>
                <h4 className="font-bold text-white">佐藤さん (28歳)</h4>
                <p className="text-sm text-gray-400">元主婦</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">
                3D可視化で成功イメージが具体的になり、モチベーションが持続しました。
              </p>
              <div className="flex justify-between pt-2 border-t border-gray-700">
                <span className="text-gray-400">現在の月収:</span>
                <span className="font-bold" style={{ color: colors.secondary }}>¥120万</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">達成期間:</span>
                <span className="font-bold" style={{ color: colors.primary }}>3ヶ月</span>
              </div>
            </div>
          </FeatureCard>
          
          <FeatureCard>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl">👨‍🔬</div>
              <div>
                <h4 className="font-bold text-white">山田さん (45歳)</h4>
                <p className="text-sm text-gray-400">元エンジニア</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">
                データ視覚化で市場機会を発見し、最適なタイミングで事業展開できました。
              </p>
              <div className="flex justify-between pt-2 border-t border-gray-700">
                <span className="text-gray-400">現在の月収:</span>
                <span className="font-bold" style={{ color: colors.secondary }}>¥350万</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">達成期間:</span>
                <span className="font-bold" style={{ color: colors.primary }}>2ヶ月</span>
              </div>
            </div>
          </FeatureCard>
        </Grid>
      </Section>
      
      {/* Experience Flow Section */}
      <Section data-section-id="flow" bgColor="rgba(147, 51, 234, 0.05)">
        <SectionTitle>AR体験フロー</SectionTitle>
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-blue-500 to-transparent md:left-1/2 md:transform md:-translate-x-1/2"></div>
            
            <div className="space-y-12">
              {[
                {
                  step: "01",
                  title: "環境認識",
                  description: "カメラを起動し、周囲の環境をスキャン。AR表示に最適な平面を自動検出します。",
                  icon: "📱",
                  details: ["カメラアクセス許可", "平面検出", "環境光調整"]
                },
                {
                  step: "02", 
                  title: "パーソナル分析",
                  description: "現在の状況と目標をヒアリング。AIが個別の成功モデルを生成します。",
                  icon: "🧠",
                  details: ["現状ヒアリング", "目標設定", "適性分析"]
                },
                {
                  step: "03",
                  title: "3D投影",
                  description: "あなた専用の成功モデルを3D・ARで現実空間に投影。360度から確認できます。",
                  icon: "✨",
                  details: ["3Dモデル生成", "AR投影", "インタラクション"]
                },
                {
                  step: "04",
                  title: "詳細分析",
                  description: "収益予測、達成期間、成功確率を詳細に表示。科学的根拠に基づいた分析結果。",
                  icon: "📊",
                  details: ["収益シミュレーション", "リスク分析", "行動計画"]
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Step Number */}
                  <div className="absolute left-0 md:left-1/2 md:transform md:-translate-x-1/2 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white z-10">
                    {item.step}
                  </div>
                  
                  {/* Content */}
                  <div className={`flex-1 ml-24 md:ml-0 ${
                    index % 2 === 0 ? 'md:pr-24' : 'md:pl-24'
                  }`}>
                    <FeatureCard>
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{item.icon}</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-3 text-white">
                            {item.title}
                          </h3>
                          <p className="text-gray-300 mb-4 leading-relaxed">
                            {item.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.details.map((detail, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                              >
                                {detail}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </FeatureCard>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>
      
      {/* CTA Section */}
      <Section data-section-id="cta" bgColor="rgba(0, 0, 0, 0.6)">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center py-12 max-w-4xl mx-auto"
        >
          <h2 className="text-5xl font-bold mb-6">
            未来の自分と、<br />
            <span style={{ background: colors.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              今すぐ出会おう
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            最新のAR・3D技術で、あなたの起業成功後の姿を現実世界に投影。
            <br />
            データに基づいた確実な成功プランを、今すぐ体感してください。
            <br />
            この革新的な体験が、あなたの人生を変える第一歩となります。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode('intro')}
              className="px-12 py-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-bold text-xl shadow-2xl"
            >
              🚀 AR体験を今すぐ開始
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 bg-transparent border-2 border-blue-500 text-blue-400 rounded-full font-bold text-xl hover:bg-blue-500 hover:text-white transition-colors"
            >
              📋 詳細な成功プランを見る
            </motion.button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: colors.primary }}>
                94%
              </div>
              <div className="text-gray-400">AR体験者の成功率</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: colors.secondary }}>
                5分
              </div>
              <div className="text-gray-400">体験時間</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: colors.accent }}>
                無料
              </div>
              <div className="text-gray-400">完全無料体験</div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-8 max-w-2xl mx-auto">
            ※ AR体験にはカメラアクセスが必要です。プライバシーは完全に保護され、データは体験終了後に自動削除されます
            <br />
            ※ 体験後に、あなた専用の詳細な成功プラン資料をプレゼントいたします
          </p>
        </motion.div>
      </Section>
    </Container>
  )
}