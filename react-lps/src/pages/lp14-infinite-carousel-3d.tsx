// LP14: インフィニットカルーセル3D - 無限に広がる学習の可能性
// AIDXschoolで体験する、革新的な3D学習プラットフォーム

import { useRef, useState, Suspense, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import { 
  Box, 
  Text, 
  Image, 
  RoundedBox,
  PerspectiveCamera,
  Environment,
  ContactShadows,
  Float,
  Stars,
  Cloud,
  Sparkles,
  Trail,
  MeshReflectorMaterial,
  Plane,
  Html,
  useScroll,
  ScrollControls,
  GradientTexture,
  Edges,
  MeshDistortMaterial,
  Sphere,
  Torus,
  TorusKnot,
  Cone,
  useTexture,
  Text3D,
  Center,
  Outlines,
  shaderMaterial
} from '@react-three/drei'
import * as THREE from 'three'
import styled, { keyframes, css } from 'styled-components'
import { gsap } from 'gsap'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { extend, useFrame as useFrameExtended } from '@react-three/fiber'

// カラーパレット
const colors = {
  primary: '#4EB5FF',
  secondary: '#38C172',
  accent: '#FFD93D',
  danger: '#FF6B6B',
  purple: '#9B59B6',
  orange: '#E74C3C',
  dark: '#000428',
  darker: '#004e92',
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

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
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

// スタイルコンポーネント
const Container = styled.div`
  position: relative;
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(to bottom, ${colors.dark}, ${colors.darker});
  overflow-x: hidden;
  font-family: 'Noto Sans JP', sans-serif;
`

const CanvasContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
`

const ContentOverlay = styled.div`
  position: relative;
  z-index: 10;
  pointer-events: none;
  min-height: 400vh;
`

const Section = styled.section<{ bgColor?: string }>`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  position: relative;
  background: ${props => props.bgColor || 'transparent'};
  
  > * {
    pointer-events: auto;
  }
`

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  text-align: center;
  z-index: 100;
  background: linear-gradient(to bottom, rgba(0, 4, 40, 0.9), transparent);
  pointer-events: none;
`

const Title = styled(motion.h1)`
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 900;
  color: ${colors.light};
  margin: 0;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
  letter-spacing: 0.05em;
  background: ${colors.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${pulse} 3s ease-in-out infinite;
`

const Subtitle = styled(motion.p)`
  font-size: clamp(1rem, 2vw, 1.3rem);
  color: rgba(255, 255, 255, 0.8);
  margin-top: 0.5rem;
  animation: ${fadeIn} 1s ease-out 0.5s both;
`

const InfoCard = styled(motion.div)<{ isActive: boolean }>`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  opacity: ${props => props.isActive ? 1 : 0};
  transform: translateX(-50%) translateY(${props => props.isActive ? '0' : '20px'});
  transition: all 0.5s ease;
  pointer-events: auto;
  z-index: 100;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    bottom: 1rem;
  }
`

const CardTitle = styled.h3`
  font-size: 1.5rem;
  color: ${colors.primary};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const CardDescription = styled.p`
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
`

const CTAButton = styled(motion.button)`
  background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(78, 181, 255, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(78, 181, 255, 0.4);
  }
`

const NavigationDots = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: auto;
  z-index: 100;
  
  @media (max-width: 768px) {
    flex-direction: row;
    right: 50%;
    transform: translateX(50%);
    bottom: auto;
    top: 6rem;
  }
`

const Dot = styled(motion.button)<{ isActive: boolean }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: ${props => props.isActive ? colors.primary : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    background: rgba(78, 181, 255, 0.5);
    transform: scale(1.2);
  }
  
  &::after {
    content: attr(data-label);
    position: absolute;
    right: calc(100% + 1rem);
    top: 50%;
    transform: translateY(-50%);
    color: white;
    font-size: 0.875rem;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.3s;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    
    @media (max-width: 768px) {
      display: none;
    }
  }
  
  &:hover::after {
    opacity: 1;
  }
`

const FeatureSection = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
  text-align: center;
`

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`

const FeatureCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    border-color: ${colors.primary};
    box-shadow: 0 20px 40px rgba(78, 181, 255, 0.2);
  }
  
  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    display: block;
  }
  
  h4 {
    font-size: 1.5rem;
    color: ${colors.primary};
    margin-bottom: 1rem;
  }
  
  p {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
  }
`

const StatsSection = styled.div`
  background: rgba(0, 0, 0, 0.5);
  padding: 3rem 2rem;
  margin: 4rem 0;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
`

const StatCard = styled(motion.div)`
  text-align: center;
  
  .number {
    font-size: 3rem;
    font-weight: 900;
    color: ${colors.accent};
    text-shadow: 0 0 20px rgba(255, 217, 61, 0.5);
  }
  
  .label {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 0.5rem;
  }
`

const FloatingNav = styled.nav`
  position: fixed;
  left: 2rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  
  @media (max-width: 768px) {
    display: none;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  a {
    display: block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
    position: relative;
    
    &:hover, &.active {
      background: ${colors.primary};
      transform: scale(1.5);
    }
    
    span {
      position: absolute;
      left: calc(100% + 1rem);
      top: 50%;
      transform: translateY(-50%);
      color: white;
      font-size: 0.875rem;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
    }
    
    &:hover span {
      opacity: 1;
    }
  }
`

const LoadingScreen = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: ${colors.dark};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  .loader {
    width: 80px;
    height: 80px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top-color: ${colors.primary};
    border-radius: 50%;
    animation: ${rotate} 1s linear infinite;
  }
`

// カルーセルアイテムのデータ（拡張版）
const carouselItems = [
  {
    id: 1,
    title: "AI活用マスタリー",
    description: "ChatGPT、Claude、Geminiなど最新のAIツールを使いこなし、業務効率を10倍に。プロンプトエンジニアリングから実装まで完全網羅。",
    color: "#4EB5FF",
    icon: "🤖",
    details: {
      duration: "8週間",
      level: "初級〜上級",
      tools: ["ChatGPT", "Claude", "Gemini", "Midjourney", "Stable Diffusion"],
      outcomes: [
        "AIプロンプトの最適化技術",
        "業務自動化システムの構築",
        "AIを活用したコンテンツ生成",
        "チャットボット開発"
      ]
    }
  },
  {
    id: 2,
    title: "ノーコード開発",
    description: "Bubble、FlutterFlow、Makeを活用し、アイデアを即座にアプリケーションに。開発期間を90%短縮する実践的スキル。",
    color: "#38C172",
    icon: "🔧",
    details: {
      duration: "10週間",
      level: "初級〜中級",
      tools: ["Bubble", "FlutterFlow", "Webflow", "Airtable", "Glide"],
      outcomes: [
        "ウェブアプリケーション開発",
        "モバイルアプリ作成",
        "データベース設計",
        "API連携実装"
      ]
    }
  },
  {
    id: 3,
    title: "自動化システム構築",
    description: "Zapier、n8n、Integomatを駆使して、ビジネスプロセスを完全自動化。24時間働く仕組みを構築します。",
    color: "#FF6B6B",
    icon: "⚡",
    details: {
      duration: "6週間",
      level: "中級",
      tools: ["Zapier", "Make", "n8n", "IFTTT", "Microsoft Power Automate"],
      outcomes: [
        "業務プロセスの自動化",
        "データ同期システム",
        "通知・アラートシステム",
        "レポート自動生成"
      ]
    }
  },
  {
    id: 4,
    title: "デジタルマーケティング",
    description: "SNS、SEO、コンテンツマーケティングを統合的に活用。AIを使った効率的な集客システムの構築方法。",
    color: "#FFD93D",
    icon: "📈",
    details: {
      duration: "12週間",
      level: "初級〜上級",
      tools: ["Google Analytics", "Meta Business", "Canva", "Buffer", "Hootsuite"],
      outcomes: [
        "SNSマーケティング戦略",
        "SEO最適化技術",
        "コンテンツ戦略立案",
        "広告運用スキル"
      ]
    }
  },
  {
    id: 5,
    title: "収益化戦略",
    description: "サブスクリプション、デジタルプロダクト、オンラインコースなど、複数の収益源を構築する実践的手法。",
    color: "#9B59B6",
    icon: "💰",
    details: {
      duration: "8週間",
      level: "中級〜上級",
      tools: ["Stripe", "Gumroad", "Teachable", "ConvertKit", "Memberful"],
      outcomes: [
        "サブスクモデル構築",
        "デジタル商品販売",
        "オンラインコース作成",
        "収益最適化"
      ]
    }
  },
  {
    id: 6,
    title: "起業家マインドセット",
    description: "失敗を恐れず、継続的に学び、成長する起業家精神。メンタルモデルと実践的な習慣形成。",
    color: "#E74C3C",
    icon: "🚀",
    details: {
      duration: "4週間",
      level: "全レベル",
      tools: ["Notion", "Todoist", "Miro", "Slack", "Zoom"],
      outcomes: [
        "目標設定と達成法",
        "時間管理術",
        "ストレス管理",
        "ネットワーキング"
      ]
    }
  },
  {
    id: 7,
    title: "データ分析＆可視化",
    description: "ビジネスデータを分析し、意思決定に活用。Excel、Tableau、Power BIを使った実践的分析手法。",
    color: "#00BCD4",
    icon: "📊",
    details: {
      duration: "10週間",
      level: "中級",
      tools: ["Excel", "Tableau", "Power BI", "Google Data Studio", "Python"],
      outcomes: [
        "データ分析基礎",
        "ダッシュボード作成",
        "KPI設計と追跡",
        "予測分析"
      ]
    }
  },
  {
    id: 8,
    title: "コミュニティ構築",
    description: "オンラインコミュニティを立ち上げ、運営する方法。Discord、Circle、Slackを活用した実践ガイド。",
    color: "#FF5722",
    icon: "👥",
    details: {
      duration: "6週間",
      level: "初級〜中級",
      tools: ["Discord", "Circle", "Slack", "Facebook Groups", "Mighty Networks"],
      outcomes: [
        "コミュニティ戦略",
        "エンゲージメント向上",
        "モデレーション",
        "収益化手法"
      ]
    }
  }
]

// 特徴データ
const features = [
  {
    icon: "🎯",
    title: "実践的カリキュラム",
    description: "理論だけでなく、実際のプロジェクトを通じて学ぶ実践型学習"
  },
  {
    icon: "👨‍🏫",
    title: "専門メンター",
    description: "各分野のエキスパートが個別指導。困ったときはいつでも相談可能"
  },
  {
    icon: "🌐",
    title: "グローバルコミュニティ",
    description: "世界中の起業家と繋がり、アイデアを共有し、共に成長"
  },
  {
    icon: "📱",
    title: "モバイル対応",
    description: "いつでもどこでも学習可能。スマホ、タブレット、PCに完全対応"
  },
  {
    icon: "🔄",
    title: "継続的アップデート",
    description: "最新のツールとトレンドを常に反映。一度入会すれば永続的にアクセス可能"
  },
  {
    icon: "🏆",
    title: "修了証明書",
    description: "各コース修了時に証明書を発行。LinkedInやポートフォリオに活用可能"
  }
]

// 統計データ
const stats = [
  { number: "15,000+", label: "受講生数" },
  { number: "95%", label: "満足度" },
  { number: "200+", label: "コース数" },
  { number: "50+", label: "専門メンター" }
]

// カスタムシェーダーマテリアル
const GlowMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0.2, 0.0, 0.1)
  },
  // vertex shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment shader
  `
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;
    void main() {
      float glow = sin(vUv.x * 10.0 + time) * 0.5 + 0.5;
      gl_FragColor = vec4(color, glow);
    }
  `
)

extend({ GlowMaterial })

// 背景パーティクルコンポーネント
function BackgroundParticles() {
  const count = 1000
  const particlesRef = useRef<THREE.Points>(null!)
  
  const positions = new Float32Array(count * 3)
  const colorArray = new Float32Array(count * 3)
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50
    positions[i * 3 + 1] = (Math.random() - 0.5) * 50
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50
    
    const color = new THREE.Color(colors.primary)
    colorArray[i * 3] = color.r
    colorArray[i * 3 + 1] = color.g
    colorArray[i * 3 + 2] = color.b
  }
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.03
    }
  })
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colorArray}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} vertexColors sizeAttenuation={false} />
    </points>
  )
}

// カルーセルアイテムコンポーネント（拡張版）
function CarouselItem({ item, angle, radius, isActive, onClick, index, totalItems }: {
  item: typeof carouselItems[0]
  angle: number
  radius: number
  isActive: boolean
  onClick: () => void
  index: number
  totalItems: number
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const groupRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    if (meshRef.current && groupRef.current) {
      // ホバー時のスケールアニメーション
      const targetScale = hovered ? 1.15 : (isActive ? 1.1 : 1)
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      )
      
      // アクティブ時の微細な動き
      if (isActive) {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.05
        meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 1.5) * 0.03
      }
      
      // 浮遊アニメーション
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime + index) * 0.1
    }
  })
  
  // 位置の計算
  const x = Math.sin(angle) * radius
  const z = Math.cos(angle) * radius
  
  return (
    <Float
      speed={2}
      rotationIntensity={0.1}
      floatIntensity={0.2}
      floatingRange={[-0.1, 0.1]}
    >
      <group
        ref={groupRef}
        position={[x, 0, z]}
        onClick={onClick}
      >
        {/* カードの背景 */}
        <RoundedBox
          ref={meshRef}
          args={[3, 4, 0.5]}
          radius={0.2}
          smoothness={4}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <meshStandardMaterial
            color={item.color}
            metalness={0.1}
            roughness={0.3}
            emissive={item.color}
            emissiveIntensity={isActive ? 0.3 : 0.1}
          />
          {hovered && <Edges color="white" linewidth={2} />}
        </RoundedBox>
        
        {/* グラデーション面 */}
        <mesh position={[0, 0, 0.26]}>
          <planeGeometry args={[2.8, 3.8]} />
          <meshBasicMaterial transparent opacity={0.3}>
            <GradientTexture
              stops={[0, 0.5, 1]}
              colors={['#000000', item.color, '#000000']}
              size={1024}
            />
          </meshBasicMaterial>
        </mesh>
        
        {/* アイコン */}
        <Text
          position={[0, 1, 0.3]}
          fontSize={1}
          anchorX="center"
          anchorY="middle"
        >
          {item.icon}
        </Text>
        
        {/* タイトル */}
        <Center position={[0, -0.5, 0.3]}>
          <Text
            fontSize={0.3}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            maxWidth={2.5}
            textAlign="center"
            font="/fonts/NotoSansJP-Bold.otf"
          >
            {item.title}
          </Text>
        </Center>
        
        {/* ツール表示 */}
        {isActive && item.details && (
          <Html
            center
            position={[0, -1.8, 0]}
            style={{
              fontSize: '10px',
              color: 'white',
              textAlign: 'center',
              width: '150px'
            }}
          >
            <div style={{
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '5px 10px',
              borderRadius: '10px',
              backdropFilter: 'blur(10px)'
            }}>
              {item.details.tools.slice(0, 3).join(' • ')}
            </div>
          </Html>
        )}
        
        {/* グロー効果 */}
        {isActive && (
          <>
            <pointLight
              position={[0, 0, 1]}
              intensity={2}
              color={item.color}
              distance={5}
            />
            <Sparkles
              count={20}
              scale={4}
              size={2}
              speed={0.5}
              color={item.color}
            />
          </>
        )}
        
        {/* ホバー時のアウトライン */}
        {hovered && (
          <mesh position={[0, 0, -0.1]}>
            <planeGeometry args={[3.2, 4.2]} />
            <meshBasicMaterial color={item.color} transparent opacity={0.2} />
          </mesh>
        )}
      </group>
    </Float>
  )
}

// カルーセルコンポーネント（拡張版）
function Carousel({ activeIndex, onItemClick }: {
  activeIndex: number
  onItemClick: (index: number) => void
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const centerRef = useRef<THREE.Mesh>(null!)
  const { camera } = useThree()
  const [autoRotate, setAutoRotate] = useState(true)
  
  useFrame((state) => {
    if (groupRef.current) {
      // 自動回転
      if (autoRotate) {
        groupRef.current.rotation.y -= 0.002
      }
      
      // アクティブアイテムに向けて回転
      const targetRotation = -(activeIndex / carouselItems.length) * Math.PI * 2
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation,
        0.05
      )
      
      // カメラの微細な動き
      camera.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.5
      camera.position.y = 3 + Math.sin(state.clock.elapsedTime * 0.3) * 0.3
      camera.lookAt(0, 0, 0)
    }
    
    // 中心オブジェクトの回転
    if (centerRef.current) {
      centerRef.current.rotation.x += 0.01
      centerRef.current.rotation.y += 0.01
      centerRef.current.rotation.z += 0.005
    }
  })
  
  const radius = 8
  
  return (
    <>
      <group ref={groupRef}>
        {carouselItems.map((item, index) => {
          const angle = (index / carouselItems.length) * Math.PI * 2
          
          return (
            <CarouselItem
              key={item.id}
              item={item}
              angle={angle}
              radius={radius}
              isActive={index === activeIndex}
              onClick={() => {
                onItemClick(index)
                setAutoRotate(false)
                setTimeout(() => setAutoRotate(true), 5000)
              }}
              index={index}
              totalItems={carouselItems.length}
            />
          )
        })}
        
        {/* 中心の装飾（拡張版） */}
        <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh ref={centerRef} position={[0, 0, 0]}>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial
              color="#ffffff"
              metalness={0.8}
              roughness={0.2}
              emissive={colors.primary}
              emissiveIntensity={0.5}
              wireframe
            />
          </mesh>
          
          {/* 内側の球体 */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.7, 32, 32]} />
            <MeshDistortMaterial
              color={colors.accent}
              speed={2}
              distort={0.3}
              radius={1}
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>
          
          {/* 軌道リング */}
          {[0, 45, 90].map((rotation, i) => (
            <mesh key={i} rotation={[0, 0, THREE.MathUtils.degToRad(rotation)]}>
              <torusGeometry args={[1.5, 0.02, 16, 100]} />
              <meshBasicMaterial color={colors.primary} opacity={0.3} transparent />
            </mesh>
          ))}
        </Float>
        
        {/* パーティクルリング */}
        <Sparkles
          count={100}
          scale={radius * 2}
          size={1.5}
          speed={0.5}
          color={colors.primary}
          opacity={0.5}
        />
      </group>
      
      {/* 床の反射 */}
      <Plane args={[50, 50]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={2048}
          mixBlur={1}
          mixStrength={50}
          roughness={0.8}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#101010"
          metalness={0.5}
        />
      </Plane>
    </>
  )
}

// 背景エフェクト
function BackgroundEffects() {
  return (
    <>
      {/* 星空 */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      
      {/* 雲 */}
      <Cloud
        position={[20, 10, -30]}
        opacity={0.3}
        speed={0.4}
        width={30}
        depth={5}
        segments={20}
      />
      <Cloud
        position={[-20, 5, -20]}
        opacity={0.2}
        speed={0.3}
        width={25}
        depth={3}
        segments={15}
      />
      
      {/* パーティクル */}
      <BackgroundParticles />
    </>
  )
}

// メインコンポーネント
export default function InfiniteCarousel3D() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const controls = useAnimation()
  
  useEffect(() => {
    // ローディング完了
    const timer = setTimeout(() => {
      setIsLoading(false)
      controls.start({ opacity: 1, scale: 1 })
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [controls])
  
  const handleItemClick = (index: number) => {
    setActiveIndex(index)
    setShowDetails(true)
  }
  
  const handleDotClick = (index: number) => {
    setActiveIndex(index)
    setShowDetails(true)
  }
  
  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % carouselItems.length)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  if (isLoading) {
    return (
      <LoadingScreen
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="loader" />
      </LoadingScreen>
    )
  }
  
  return (
    <Container>
      {/* 3Dシーン */}
      <CanvasContainer>
        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera
            makeDefault
            position={[0, 3, 15]}
            fov={60}
          />
          
          {/* ライティング */}
          <ambientLight intensity={0.5} />
          <spotLight
            position={[10, 10, 5]}
            angle={0.15}
            penumbra={1}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color={colors.accent} />
          
          <Suspense fallback={null}>
            <Carousel
              activeIndex={activeIndex}
              onItemClick={handleItemClick}
            />
            
            <BackgroundEffects />
            
            {/* 環境 */}
            <Environment preset="night" />
            <ContactShadows
              position={[0, -3, 0]}
              opacity={0.5}
              scale={20}
              blur={2}
              far={10}
            />
          </Suspense>
        </Canvas>
      </CanvasContainer>
      
      {/* コンテンツオーバーレイ */}
      <ContentOverlay>
        {/* ヘッダー */}
        <Header>
          <Title
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            無限に広がる学びの世界
          </Title>
          <Subtitle
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            回転するカードをクリックして、詳細を確認
          </Subtitle>
        </Header>
        
        {/* フローティングナビゲーション */}
        <FloatingNav>
          <ul>
            <li>
              <a href="#hero" className="active">
                <span>トップ</span>
              </a>
            </li>
            <li>
              <a href="#features">
                <span>特徴</span>
              </a>
            </li>
            <li>
              <a href="#curriculum">
                <span>カリキュラム</span>
              </a>
            </li>
            <li>
              <a href="#pricing">
                <span>料金</span>
              </a>
            </li>
          </ul>
        </FloatingNav>
        
        {/* 情報カード */}
        <AnimatePresence>
          {showDetails && (
            <InfoCard
              isActive={showDetails}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <CardTitle>
                <span style={{ fontSize: '2rem' }}>{carouselItems[activeIndex].icon}</span>
                {carouselItems[activeIndex].title}
              </CardTitle>
              <CardDescription>
                {carouselItems[activeIndex].description}
              </CardDescription>
              
              {carouselItems[activeIndex].details && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <strong style={{ color: colors.primary }}>期間:</strong> {carouselItems[activeIndex].details.duration}
                    </div>
                    <div>
                      <strong style={{ color: colors.primary }}>レベル:</strong> {carouselItems[activeIndex].details.level}
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: colors.primary }}>使用ツール:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {carouselItems[activeIndex].details.tools.map((tool, i) => (
                        <span key={i} style={{
                          background: 'rgba(78, 181, 255, 0.2)',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '15px',
                          fontSize: '0.875rem'
                        }}>
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <CTAButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                詳細を見る
              </CTAButton>
            </InfoCard>
          )}
        </AnimatePresence>
        
        {/* ナビゲーションドット */}
        <NavigationDots>
          {carouselItems.map((item, index) => (
            <Dot
              key={index}
              isActive={index === activeIndex}
              onClick={() => handleDotClick(index)}
              data-label={item.title}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </NavigationDots>
        
        {/* ヒーローセクション（スクロール用スペーサー） */}
        <Section id="hero" style={{ height: '100vh' }} />
        
        {/* 特徴セクション */}
        <Section id="features" bgColor="rgba(0, 0, 0, 0.5)">
          <FeatureSection>
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              style={{
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 900,
                color: colors.primary,
                marginBottom: '1rem'
              }}
            >
              AIDXschoolの特徴
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              viewport={{ once: true }}
              style={{
                fontSize: '1.2rem',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '3rem'
              }}
            >
              最先端の技術と実践的なカリキュラムで、あなたの起業を成功に導きます
            </motion.p>
            
            <FeatureGrid>
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                  <span className="icon">{feature.icon}</span>
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </FeatureCard>
              ))}
            </FeatureGrid>
          </FeatureSection>
        </Section>
        
        {/* 統計セクション */}
        <StatsSection>
          <StatsGrid>
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="number">{stat.number}</div>
                <div className="label">{stat.label}</div>
              </StatCard>
            ))}
          </StatsGrid>
        </StatsSection>
        
        {/* カリキュラムセクション */}
        <Section id="curriculum">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', maxWidth: '1200px' }}
          >
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 900,
              color: colors.primary,
              marginBottom: '2rem'
            }}>
              包括的なカリキュラム
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '3rem',
              maxWidth: '800px',
              margin: '0 auto 3rem'
            }}>
              基礎から応用まで、段階的に学べる構成。
              各コースは実践的なプロジェクトを含み、即戦力となるスキルを身につけます。
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              marginTop: '3rem'
            }}>
              {carouselItems.slice(0, 6).map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '15px',
                    padding: '2rem',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{item.icon}</div>
                  <h4 style={{ color: item.color, marginBottom: '0.5rem' }}>{item.title}</h4>
                  {item.details && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {item.details.outcomes.slice(0, 3).map((outcome, i) => (
                        <li key={i} style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.9rem',
                          marginBottom: '0.25rem',
                          paddingLeft: '1rem',
                          position: 'relative'
                        }}>
                          <span style={{
                            position: 'absolute',
                            left: 0,
                            color: colors.secondary
                          }}>•</span>
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>
        
        {/* 料金セクション */}
        <Section id="pricing" bgColor="rgba(0, 0, 0, 0.5)">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', maxWidth: '1200px' }}
          >
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 900,
              color: colors.primary,
              marginBottom: '2rem'
            }}>
              料金プラン
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              marginTop: '3rem'
            }}>
              {[
                {
                  name: 'スターター',
                  price: '¥9,800',
                  period: '/月',
                  features: [
                    '基本コース3つまでアクセス',
                    'コミュニティ参加',
                    'メール サポート',
                    '修了証明書'
                  ],
                  color: colors.secondary
                },
                {
                  name: 'プロフェッショナル',
                  price: '¥19,800',
                  period: '/月',
                  features: [
                    '全コース無制限アクセス',
                    '1対1メンタリング月2回',
                    '優先サポート',
                    'プロジェクトレビュー',
                    '就職・転職支援'
                  ],
                  color: colors.primary,
                  featured: true
                },
                {
                  name: 'エンタープライズ',
                  price: '¥49,800',
                  period: '/月',
                  features: [
                    '全機能アクセス',
                    '専属メンター',
                    'カスタムカリキュラム',
                    'チーム研修対応',
                    '成果保証'
                  ],
                  color: colors.purple
                }
              ].map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  style={{
                    background: plan.featured 
                      ? `linear-gradient(135deg, ${plan.color}20, ${plan.color}10)`
                      : 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: plan.featured ? `2px solid ${plan.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    padding: '2.5rem',
                    textAlign: 'center',
                    position: 'relative',
                    transform: plan.featured ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  {plan.featured && (
                    <div style={{
                      position: 'absolute',
                      top: '-15px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: plan.color,
                      color: 'white',
                      padding: '0.5rem 2rem',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: 'bold'
                    }}>
                      おすすめ
                    </div>
                  )}
                  
                  <h3 style={{
                    fontSize: '1.5rem',
                    color: plan.color,
                    marginBottom: '1rem'
                  }}>
                    {plan.name}
                  </h3>
                  
                  <div style={{ marginBottom: '2rem' }}>
                    <span style={{
                      fontSize: '3rem',
                      fontWeight: 'bold',
                      color: colors.accent
                    }}>
                      {plan.price}
                    </span>
                    <span style={{
                      fontSize: '1rem',
                      color: 'rgba(255, 255, 255, 0.6)'
                    }}>
                      {plan.period}
                    </span>
                  </div>
                  
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 2rem 0'
                  }}>
                    {plan.features.map((feature, i) => (
                      <li key={i} style={{
                        padding: '0.5rem 0',
                        color: 'rgba(255, 255, 255, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{ color: colors.secondary }}>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <CTAButton
                    style={{
                      background: plan.featured
                        ? `linear-gradient(135deg, ${plan.color}, ${colors.secondary})`
                        : 'transparent',
                      border: plan.featured ? 'none' : `2px solid ${plan.color}`
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    プランを選択
                  </CTAButton>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>
        
        {/* CTA セクション */}
        <Section style={{ paddingBottom: '8rem' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', maxWidth: '800px' }}
          >
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 900,
              color: colors.primary,
              marginBottom: '2rem'
            }}>
              今すぐ始めよう
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '3rem',
              lineHeight: 1.8
            }}>
              AIDXschoolで、AIとノーコードの力を使って
              あなたの起業の夢を現実にしましょう。
              7日間の無料トライアルで、すべての機能をお試しください。
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <CTAButton
                style={{ fontSize: '1.2rem', padding: '1.5rem 3rem' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                無料で始める
              </CTAButton>
              <CTAButton
                style={{
                  background: 'transparent',
                  border: `2px solid ${colors.primary}`,
                  fontSize: '1.2rem',
                  padding: '1.5rem 3rem'
                }}
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: 'rgba(78, 181, 255, 0.1)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                資料をダウンロード
              </CTAButton>
            </div>
          </motion.div>
        </Section>
      </ContentOverlay>
    </Container>
  )
}