// LP1: 3Dインタラクティブ起業体験 - AIDXschoolの革新的な学習プラットフォーム
// 3D空間で体験する、AI×DX起業の可能性

import { Canvas, useFrame } from '@react-three/fiber'
import { 
  OrbitControls, 
  Text3D, 
  Center, 
  Float, 
  Stars,
  MeshReflectorMaterial,
  Environment,
  PerspectiveCamera,
  useScroll,
  ScrollControls,
  Sparkles,
  Cloud,
  Sphere,
  Box,
  Torus,
  TorusKnot,
  Cylinder,
  Cone,
  Dodecahedron,
  useTexture,
  Html,
  PresentationControls,
  ContactShadows
} from '@react-three/drei'
import { useRef, useState, Suspense, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

// カラーテーマ
const colors = {
  primary: '#4A90E2',
  secondary: '#FF6B9D',
  accent: '#00D4AA',
  dark: '#0A0E27',
  light: '#ffffff',
  gradient: 'linear-gradient(135deg, #4A90E2 0%, #FF6B9D 100%)'
}

// 3D Components
function FloatingCube({ position, color, onClick, label }: { 
  position: [number, number, number], 
  color: string,
  onClick?: () => void,
  label?: string 
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.01
      meshRef.current.scale.setScalar(hovered ? 1.5 : 1)
    }
  })
  
  return (
    <Float speed={4} rotationIntensity={1} floatIntensity={2}>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
        {label && hovered && (
          <Html center>
            <div className="bg-black/80 text-white px-3 py-1 rounded-full text-sm whitespace-nowrap">
              {label}
            </div>
          </Html>
        )}
      </mesh>
    </Float>
  )
}

// 技術スタックの3Dビジュアライゼーション
function TechStack3D() {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })
  
  const technologies = [
    { name: 'AI/ChatGPT', position: [0, 0, 0], color: '#FF6B9D', shape: 'sphere' },
    { name: 'NoCode', position: [3, 0, 0], color: '#4A90E2', shape: 'box' },
    { name: 'Automation', position: [-3, 0, 0], color: '#00D4AA', shape: 'torus' },
    { name: 'Data Analysis', position: [0, 3, 0], color: '#FFD93D', shape: 'cone' },
    { name: 'Cloud', position: [0, -3, 0], color: '#9B59B6', shape: 'cylinder' }
  ]
  
  return (
    <group ref={groupRef} position={[0, 0, -5]}>
      {technologies.map((tech, index) => {
        const Shape = tech.shape === 'sphere' ? Sphere :
                     tech.shape === 'box' ? Box :
                     tech.shape === 'torus' ? Torus :
                     tech.shape === 'cone' ? Cone : Cylinder
        
        return (
          <Float key={index} speed={2 + index * 0.5} floatIntensity={1}>
            <mesh position={tech.position as [number, number, number]}>
              <Shape args={[0.8, 0.8, 0.8]}>
                <meshStandardMaterial
                  color={tech.color}
                  emissive={tech.color}
                  emissiveIntensity={0.2}
                  metalness={0.8}
                  roughness={0.2}
                />
              </Shape>
              <Html center>
                <div className="bg-black/80 text-white px-2 py-1 rounded text-xs">
                  {tech.name}
                </div>
              </Html>
            </mesh>
          </Float>
        )
      })}
    </group>
  )
}

// カリキュラムの3D表現
function Curriculum3D() {
  const phases = [
    {
      title: 'Foundation',
      weeks: '1-4週',
      color: '#4A90E2',
      position: [-3, 0, 0],
      rotation: [0, 0, 0]
    },
    {
      title: 'Advanced',
      weeks: '5-12週',
      color: '#FF6B9D',
      position: [0, 0, 0],
      rotation: [0, Math.PI / 4, 0]
    },
    {
      title: 'Business',
      weeks: '13-20週',
      color: '#00D4AA',
      position: [3, 0, 0],
      rotation: [0, Math.PI / 2, 0]
    }
  ]
  
  return (
    <group position={[0, 0, -10]}>
      {phases.map((phase, index) => (
        <Float key={index} speed={1.5} floatIntensity={0.5}>
          <mesh
            position={phase.position as [number, number, number]}
            rotation={phase.rotation as [number, number, number]}
          >
            <TorusKnot args={[1, 0.3, 100, 16]}>
              <meshStandardMaterial
                color={phase.color}
                emissive={phase.color}
                emissiveIntensity={0.3}
                metalness={0.9}
                roughness={0.1}
              />
            </TorusKnot>
            <Html center>
              <div className="text-center">
                <div className="bg-black/90 text-white px-3 py-2 rounded-lg">
                  <div className="font-bold text-sm">{phase.title}</div>
                  <div className="text-xs opacity-80">{phase.weeks}</div>
                </div>
              </div>
            </Html>
          </mesh>
        </Float>
      ))}
    </group>
  )
}

// 成功事例の3Dカード
function SuccessStory3D({ story, position }: { story: any, position: [number, number, number] }) {
  const [hovered, setHovered] = useState(false)
  
  return (
    <Float speed={1} floatIntensity={0.3}>
      <group position={position}>
        <mesh
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <boxGeometry args={[2, 3, 0.1]} />
          <meshStandardMaterial
            color={hovered ? '#FFD93D' : '#ffffff'}
            emissive={hovered ? '#FFD93D' : '#ffffff'}
            emissiveIntensity={hovered ? 0.3 : 0.1}
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>
        <Html center transform occlude>
          <div className={`w-48 p-4 bg-white/90 rounded-lg shadow-lg transition-all ${hovered ? 'scale-110' : ''}`}>
            <div className="text-2xl mb-2">{story.icon}</div>
            <h4 className="font-bold text-gray-800 text-sm mb-1">{story.name}</h4>
            <p className="text-xs text-gray-600 mb-2">{story.business}</p>
            <p className="text-lg font-bold text-blue-600">{story.revenue}</p>
          </div>
        </Html>
      </group>
    </Float>
  )
}

function Hero3D() {
  const textRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (textRef.current) {
      textRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1
    }
  })
  
  return (
    <Center>
      <group ref={textRef}>
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={0.8}
          height={0.2}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
        >
          AIDXschool
          <meshStandardMaterial 
            color="#4A90E2"
            emissive="#4A90E2"
            emissiveIntensity={0.2}
            metalness={0.8}
            roughness={0.2}
          />
        </Text3D>
        <pointLight position={[0, 0, 1]} intensity={2} color="#4A90E2" />
      </group>
    </Center>
  )
}

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null)
  const particleCount = 1000
  
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20
    
    colors[i * 3] = Math.random()
    colors[i * 3 + 1] = Math.random()
    colors[i * 3 + 2] = Math.random()
  }
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001
      particlesRef.current.rotation.x += 0.0005
    }
  })
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// インタラクティブな起業ロードマップ
function RoadMap3D() {
  const steps = [
    { title: 'アイデア発見', position: [-4, 0, 0], color: '#4A90E2' },
    { title: 'スキル習得', position: [-2, 1, 0], color: '#FF6B9D' },
    { title: 'プロトタイプ', position: [0, 0, 0], color: '#00D4AA' },
    { title: 'ローンチ', position: [2, -1, 0], color: '#FFD93D' },
    { title: 'スケール', position: [4, 0, 0], color: '#9B59B6' }
  ]
  
  return (
    <group position={[0, -5, -15]}>
      {/* パスライン */}
      <mesh>
        <tubeGeometry args={[
          new THREE.CatmullRomCurve3(
            steps.map(s => new THREE.Vector3(...s.position))
          ),
          64, 0.1, 8, false
        ]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.2}
          opacity={0.5}
          transparent
        />
      </mesh>
      
      {/* ステップノード */}
      {steps.map((step, index) => (
        <Float key={index} speed={1.5} floatIntensity={0.3}>
          <mesh position={step.position as [number, number, number]}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial
              color={step.color}
              emissive={step.color}
              emissiveIntensity={0.3}
              metalness={0.8}
              roughness={0.2}
            />
            <Html center>
              <div className="bg-black/80 text-white px-3 py-1 rounded-full text-xs whitespace-nowrap">
                {step.title}
              </div>
            </Html>
          </mesh>
        </Float>
      ))}
    </group>
  )
}

function Scene() {
  const scroll = useScroll()
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  
  useFrame((state) => {
    const offset = scroll.offset
    if (cameraRef.current) {
      cameraRef.current.position.z = 5 - offset * 20
      cameraRef.current.position.y = 2 - offset * 10
      cameraRef.current.lookAt(0, 0, -offset * 15)
    }
  })
  
  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 2, 5]} />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
      <pointLight position={[-10, -10, -10]} color="#ff6b9d" intensity={1} />
      <pointLight position={[0, 5, 0]} color="#4A90E2" intensity={1} />
      
      {/* Background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={20} size={2} speed={0.4} color="#4A90E2" />
      
      {/* Section 1: Hero */}
      <group position={[0, 0, 0]}>
        <Suspense fallback={null}>
          <Hero3D />
        </Suspense>
        <FloatingCube position={[-3, 2, 0]} color="#FF6B9D" label="AI活用" />
        <FloatingCube position={[3, 2, 0]} color="#4A90E2" label="NoCode" />
        <FloatingCube position={[0, -2, 2]} color="#00D4AA" label="自動化" />
      </group>
      
      {/* Section 2: Tech Stack */}
      <TechStack3D />
      
      {/* Section 3: Curriculum */}
      <Curriculum3D />
      
      {/* Section 4: Roadmap */}
      <RoadMap3D />
      
      {/* Section 5: Success Stories */}
      <group position={[0, 0, -20]}>
        <SuccessStory3D
          story={{
            icon: '👩‍💼',
            name: '田中 美咲',
            business: 'AI英会話スクール',
            revenue: '月商¥2.4M'
          }}
          position={[-3, 0, 0]}
        />
        <SuccessStory3D
          story={{
            icon: '👨‍💻',
            name: '山本 健太',
            business: 'EC自動化',
            revenue: '月商¥8.5M'
          }}
          position={[0, 0, 0]}
        />
        <SuccessStory3D
          story={{
            icon: '👩‍🏫',
            name: '鈴木 由美',
            business: 'AI不動産',
            revenue: '月商¥15M'
          }}
          position={[3, 0, 0]}
        />
      </group>
      
      {/* Particle Field */}
      <ParticleField />
      
      {/* Clouds */}
      <Cloud position={[-4, -2, -5]} speed={0.2} opacity={0.1} />
      <Cloud position={[4, -2, -5]} speed={0.2} opacity={0.1} />
      <Cloud position={[0, 3, -10]} speed={0.3} opacity={0.15} />
      
      {/* Reflective Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <planeGeometry args={[100, 100]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={2048}
          mixBlur={1}
          mixStrength={50}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#101010"
          metalness={0.5}
          mirror={0}
        />
      </mesh>
      
      <ContactShadows position={[0, -3, 0]} opacity={0.5} scale={20} blur={2} />
      <Environment preset="city" />
    </>
  )
}

// UI Components
function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + 10
      })
    }, 100)
    
    return () => clearInterval(timer)
  }, [])
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0E27]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-xl mb-2">3D世界を構築中...</p>
        <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white/60 text-sm mt-2">{progress}%</p>
      </motion.div>
    </div>
  )
}

// 技術比較パネル
function TechComparisonPanel() {
  const technologies = [
    {
      name: 'ChatGPT/Claude',
      description: '最先端AIによる自動化',
      features: ['コンテンツ生成', 'カスタマーサポート', 'データ分析', 'プログラミング支援'],
      difficulty: 2,
      potential: 5
    },
    {
      name: 'Bubble/Adalo',
      description: 'ノーコードアプリ開発',
      features: ['Webアプリ構築', 'モバイルアプリ', 'データベース管理', 'API連携'],
      difficulty: 3,
      potential: 4
    },
    {
      name: 'Zapier/Make',
      description: '業務自動化プラットフォーム',
      features: ['ワークフロー自動化', 'アプリ連携', 'データ同期', 'トリガー設定'],
      difficulty: 2,
      potential: 4
    },
    {
      name: 'Shopify/WooCommerce',
      description: 'ECプラットフォーム',
      features: ['オンラインストア', '在庫管理', '決済処理', 'マーケティング'],
      difficulty: 2,
      potential: 5
    }
  ]
  
  return (
    <div className="space-y-4">
      {technologies.map((tech, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass p-4 rounded-xl"
        >
          <h4 className="text-lg font-semibold text-blue-400 mb-2">{tech.name}</h4>
          <p className="text-sm text-gray-300 mb-3">{tech.description}</p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>学習難易度</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < tech.difficulty ? 'bg-orange-500' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span>ビジネス可能性</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < tech.potential ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-1">
            {tech.features.map((feature, i) => (
              <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded">
                {feature}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// カリキュラム詳細パネル
function CurriculumDetailPanel() {
  const curriculum = {
    phase1: {
      title: 'Foundation Phase',
      duration: '4週間',
      description: 'AI×DXの基礎を完全マスター',
      modules: [
        {
          week: 1,
          title: 'AI/DX概論と環境構築',
          topics: ['ChatGPT/Claude活用法', 'プロンプトエンジニアリング', 'AI倫理とガイドライン']
        },
        {
          week: 2,
          title: 'ノーコード開発基礎',
          topics: ['Bubble入門', 'データベース設計', 'UI/UXデザイン基礎']
        },
        {
          week: 3,
          title: '業務自動化入門',
          topics: ['Zapier/Make基礎', 'ワークフロー設計', 'API連携の基本']
        },
        {
          week: 4,
          title: '実践プロジェクト①',
          topics: ['ミニアプリ開発', 'AI統合', 'デプロイメント']
        }
      ]
    },
    phase2: {
      title: 'Advanced Phase',
      duration: '8週間',
      description: '実践的なビジネス構築スキル',
      modules: [
        {
          week: 5,
          title: '高度なAI活用',
          topics: ['カスタムGPT開発', 'AIエージェント構築', 'マルチモーダルAI']
        },
        {
          week: 8,
          title: 'スケーラブルシステム',
          topics: ['マイクロサービス設計', 'セキュリティ対策', 'パフォーマンス最適化']
        },
        {
          week: 12,
          title: '実践プロジェクト②',
          topics: ['フルスタックアプリ開発', 'ユーザーテスト', 'ローンチ準備']
        }
      ]
    },
    phase3: {
      title: 'Business Phase',
      duration: '8週間',
      description: '起業実践とビジネス成長',
      modules: [
        {
          week: 13,
          title: 'ビジネスモデル構築',
          topics: ['市場分析', '収益モデル設計', 'MVP開発']
        },
        {
          week: 16,
          title: 'マーケティング戦略',
          topics: ['デジタルマーケティング', 'グロースハック', 'コンテンツ戦略']
        },
        {
          week: 20,
          title: '卒業プロジェクト',
          topics: ['実ビジネス立ち上げ', '投資家プレゼン', '継続サポート']
        }
      ]
    }
  }
  
  return (
    <div className="space-y-6">
      {Object.values(curriculum).map((phase, phaseIndex) => (
        <motion.div
          key={phaseIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: phaseIndex * 0.2 }}
          className="glass p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gradient">{phase.title}</h3>
            <span className="text-sm bg-white/10 px-3 py-1 rounded-full">{phase.duration}</span>
          </div>
          
          <p className="text-gray-300 mb-4">{phase.description}</p>
          
          <div className="space-y-3">
            {phase.modules.map((module, moduleIndex) => (
              <div key={moduleIndex} className="bg-white/5 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                    {module.week}
                  </div>
                  <h4 className="font-semibold">{module.title}</h4>
                </div>
                <ul className="ml-11 space-y-1">
                  {module.topics.map((topic, topicIndex) => (
                    <li key={topicIndex} className="text-sm text-gray-400">• {topic}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// 料金プランパネル
function PricingPanel() {
  const plans = [
    {
      name: 'スタータープラン',
      price: '¥298,000',
      duration: '4週間',
      features: [
        '基礎カリキュラム完全版',
        '週1回の個別メンタリング',
        'Slackサポート（平日）',
        '修了証明書発行',
        '卒業生コミュニティ参加権'
      ],
      recommended: false
    },
    {
      name: 'プロフェッショナルプラン',
      price: '¥698,000',
      duration: '12週間',
      features: [
        'フルカリキュラムアクセス',
        '週2回の個別メンタリング',
        '24時間Slackサポート',
        '実案件紹介（3件保証）',
        '起業サポート6ヶ月',
        'ツール利用料6ヶ月無料'
      ],
      recommended: true
    },
    {
      name: 'マスタープラン',
      price: '¥1,480,000',
      duration: '20週間',
      features: [
        '完全カスタマイズカリキュラム',
        '毎日の個別サポート',
        'プライベートコンサル月2回',
        '実案件紹介（10件保証）',
        '起業資金調達サポート',
        '永続的メンターサポート',
        '全ツール永久無料'
      ],
      recommended: false
    }
  ]
  
  return (
    <div className="space-y-4">
      {plans.map((plan, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`glass p-6 rounded-xl ${plan.recommended ? 'border-2 border-blue-500' : ''}`}
        >
          {plan.recommended && (
            <div className="text-center mb-2">
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full">
                おすすめ
              </span>
            </div>
          )}
          
          <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-gradient">{plan.price}</span>
            <span className="text-gray-400">/ {plan.duration}</span>
          </div>
          
          <ul className="space-y-2 mt-4">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-full mt-6 py-3 rounded-full font-semibold transition-all ${
              plan.recommended
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            申し込む
          </motion.button>
        </motion.div>
      ))}
      
      <div className="glass p-4 rounded-xl text-center">
        <p className="text-sm text-gray-400 mb-2">全プラン共通</p>
        <p className="text-yellow-400 font-semibold">30日間全額返金保証</p>
      </div>
    </div>
  )
}

function InfoPanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('overview')
  
  const tabs = [
    { id: 'overview', label: '概要', icon: '🎯' },
    { id: 'tech', label: '技術', icon: '⚡' },
    { id: 'curriculum', label: 'カリキュラム', icon: '📚' },
    { id: 'pricing', label: '料金', icon: '💎' },
    { id: 'faq', label: 'FAQ', icon: '❓' }
  ]
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-black/90 backdrop-blur-xl border-l border-white/10 z-40 overflow-hidden"
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <h2 className="text-2xl font-bold text-gradient mb-4">AIDXschool 3D起業体験</h2>
              
              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="glass p-6 rounded-xl">
                    <h3 className="text-xl font-semibold mb-3 text-blue-400">🎮 3D操作ガイド</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>• マウスドラッグ: 視点を回転</li>
                      <li>• スクロール: ズームイン/アウト</li>
                      <li>• ダブルクリック: オブジェクトにフォーカス</li>
                      <li>• スペースキー: リセット</li>
                    </ul>
                  </div>
                  
                  <div className="glass p-6 rounded-xl">
                    <h3 className="text-xl font-semibold mb-3 text-purple-400">🚀 起業への3ステップ</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          1
                        </div>
                        <div>
                          <p className="font-semibold mb-1">AI×DXスキルを習得</p>
                          <p className="text-sm text-gray-400">最新技術を基礎から実践まで体系的に学習</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          2
                        </div>
                        <div>
                          <p className="font-semibold mb-1">ビジネスアイデアを形に</p>
                          <p className="text-sm text-gray-400">メンターと一緒にMVPを開発・検証</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          3
                        </div>
                        <div>
                          <p className="font-semibold mb-1">収益化とスケール</p>
                          <p className="text-sm text-gray-400">実践的なマーケティングと成長戦略</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                    <h3 className="text-xl font-semibold mb-3 text-green-400">✨ AIDXschoolの特徴</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>✓ 完全オンライン・自分のペースで学習</li>
                      <li>✓ 現役起業家による実践的メンタリング</li>
                      <li>✓ 3,000名以上の卒業生ネットワーク</li>
                      <li>✓ 平均月商280万円の実績</li>
                      <li>✓ 30日間全額返金保証</li>
                    </ul>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full font-semibold text-white shadow-lg"
                  >
                    無料相談を予約する
                  </motion.button>
                </div>
              )}
              
              {activeTab === 'tech' && <TechComparisonPanel />}
              {activeTab === 'curriculum' && <CurriculumDetailPanel />}
              {activeTab === 'pricing' && <PricingPanel />}
              
              {activeTab === 'faq' && (
                <div className="space-y-4">
                  {[
                    {
                      q: 'プログラミング経験は必要ですか？',
                      a: 'いいえ、必要ありません。ノーコード・ローコードツールを中心に学習するため、技術的な知識がなくても問題ありません。'
                    },
                    {
                      q: '働きながら受講できますか？',
                      a: 'はい、可能です。完全オンラインで自分のペースで学習でき、録画された講義はいつでも視聴可能です。'
                    },
                    {
                      q: 'どのくらいで起業できますか？',
                      a: '個人差はありますが、多くの受講生が3-6ヶ月以内に最初のビジネスを立ち上げています。'
                    },
                    {
                      q: '受講料以外に費用はかかりますか？',
                      a: '基本的にはかかりません。ただし、一部の有料ツール（月額数千円程度）を使用する場合があります。'
                    },
                    {
                      q: 'サポート体制は？',
                      a: '専任メンター、24時間Slackサポート、週次グループセッション、卒業生コミュニティなど充実したサポートを提供しています。'
                    }
                  ].map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass p-4 rounded-xl"
                    >
                      <h4 className="font-semibold mb-2 text-yellow-400">Q: {faq.q}</h4>
                      <p className="text-gray-300 text-sm">A: {faq.a}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Main Component
export default function LP1_3DInteractive() {
  const [loading, setLoading] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0A0E27]">
      <style jsx global>{`
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #4A90E2 0%, #FF6B9D 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
      
      {loading && <LoadingScreen />}
      
      {/* 3D Canvas */}
      <Canvas
        onCreated={() => setTimeout(() => setLoading(false), 1000)}
        className="absolute inset-0"
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ScrollControls damping={0.2} pages={5}>
          <Scene />
        </ScrollControls>
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minDistance={2}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="container mx-auto px-4 h-full flex flex-col justify-between py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="pointer-events-auto"
          >
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">AIDXschool</h1>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowInfo(true)}
                  className="px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
                >
                  詳細を見る
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white font-semibold"
                >
                  無料相談
                </motion.button>
              </div>
            </div>
          </motion.div>
          
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="text-center pointer-events-auto"
          >
            <motion.h2
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.7, duration: 0.5 }}
              className="text-5xl md:text-7xl font-bold mb-4"
            >
              <span className="text-gradient">3D空間で体験する</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="text-xl md:text-2xl text-gray-300 mb-8"
            >
              AI×DX起業の新しい可能性
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.3 }}
              className="flex gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full font-semibold text-white shadow-lg"
                onClick={() => setShowInfo(true)}
              >
                起業の旅を始める
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-full font-semibold text-white border border-white/20"
              >
                デモを見る
              </motion.button>
            </motion.div>
          </motion.div>
          
          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="text-center text-gray-400 pointer-events-auto"
          >
            <p className="mb-2">スクロールして3D世界を探索</p>
            <div className="animate-bounce">
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <div className="mt-8 flex justify-center gap-8 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">3,000+</p>
                <p>卒業生</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">¥2.8M</p>
                <p>平均月商</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">96%</p>
                <p>満足度</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Info Panel */}
      <InfoPanel isOpen={showInfo} onClose={() => setShowInfo(false)} />
      
      {/* Mobile Menu */}
      <MobileMenu />
      
      {/* Performance Monitor */}
      {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
    </div>
  )
}

// モバイルメニューコンポーネント
function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center md:hidden z-50 shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 bg-black/95 backdrop-blur-xl border-t border-white/10 z-40 md:hidden rounded-t-3xl"
          >
            <div className="p-6">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-white/50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <h3 className="text-xl font-bold text-white mb-6">メニュー</h3>
              
              <nav className="space-y-4">
                <a href="#overview" className="block py-3 px-4 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors">
                  概要
                </a>
                <a href="#tech" className="block py-3 px-4 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors">
                  技術スタック
                </a>
                <a href="#curriculum" className="block py-3 px-4 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors">
                  カリキュラム
                </a>
                <a href="#pricing" className="block py-3 px-4 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors">
                  料金プラン
                </a>
                <button className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-semibold">
                  無料相談を予約
                </button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// パフォーマンスモニター（開発用）
function PerformanceMonitor() {
  const [fps, setFps] = useState(0)
  const [memory, setMemory] = useState(0)
  
  useEffect(() => {
    let lastTime = performance.now()
    let frames = 0
    
    const updateStats = () => {
      frames++
      const currentTime = performance.now()
      
      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frames * 1000) / (currentTime - lastTime)))
        frames = 0
        lastTime = currentTime
        
        if ((performance as any).memory) {
          const used = (performance as any).memory.usedJSHeapSize
          const total = (performance as any).memory.totalJSHeapSize
          setMemory(Math.round((used / total) * 100))
        }
      }
      
      requestAnimationFrame(updateStats)
    }
    
    requestAnimationFrame(updateStats)
  }, [])
  
  return (
    <div className="fixed top-4 left-4 bg-black/80 text-white text-xs p-2 rounded-lg font-mono z-50">
      <div>FPS: {fps}</div>
      <div>Memory: {memory}%</div>
    </div>
  )
}

// 追加の3Dコンポーネント：学習ツールの可視化
function LearningTools3D() {
  const tools = [
    { name: 'ChatGPT', icon: '🤖', position: [-2, 0, 0], color: '#10B981' },
    { name: 'Bubble', icon: '🫧', position: [0, 0, 0], color: '#3B82F6' },
    { name: 'Zapier', icon: '⚡', position: [2, 0, 0], color: '#F59E0B' },
    { name: 'Figma', icon: '🎨', position: [-1, 2, 0], color: '#F24E1E' },
    { name: 'Notion', icon: '📝', position: [1, 2, 0], color: '#000000' }
  ]
  
  return (
    <group position={[0, 0, -25]}>
      <Text3D
        font="/fonts/helvetiker_bold.typeface.json"
        size={0.5}
        height={0.1}
        position={[0, 3, 0]}
      >
        学習ツール
        <meshStandardMaterial color="#ffffff" />
      </Text3D>
      
      {tools.map((tool, index) => (
        <Float key={index} speed={2} floatIntensity={1}>
          <group position={tool.position as [number, number, number]}>
            <Dodecahedron args={[0.5]}>
              <meshStandardMaterial
                color={tool.color}
                emissive={tool.color}
                emissiveIntensity={0.3}
                metalness={0.8}
                roughness={0.2}
              />
            </Dodecahedron>
            <Html center>
              <div className="text-center">
                <div className="text-2xl mb-1">{tool.icon}</div>
                <div className="bg-black/80 text-white px-2 py-1 rounded text-xs">
                  {tool.name}
                </div>
              </div>
            </Html>
          </group>
        </Float>
      ))}
    </group>
  )
}

// 追加の3Dコンポーネント：収益モデルの可視化
function RevenueModel3D() {
  const models = [
    { type: 'SaaS', revenue: '¥500K/月', position: [-3, 0, 0] },
    { type: 'コンサル', revenue: '¥1M/月', position: [0, 0, 0] },
    { type: 'EC', revenue: '¥2M/月', position: [3, 0, 0] }
  ]
  
  return (
    <group position={[0, 0, -30]}>
      {models.map((model, index) => (
        <Float key={index} speed={1.5} floatIntensity={0.5}>
          <group position={model.position as [number, number, number]}>
            <Cylinder args={[1, 1, 2 + index, 32]}>
              <meshStandardMaterial
                color={`hsl(${index * 120}, 70%, 50%)`}
                metalness={0.7}
                roughness={0.3}
              />
            </Cylinder>
            <Html center>
              <div className="bg-white/90 text-black p-3 rounded-lg text-center">
                <div className="font-bold">{model.type}</div>
                <div className="text-lg text-blue-600">{model.revenue}</div>
              </div>
            </Html>
          </group>
        </Float>
      ))}
    </group>
  )
}

// 拡張されたScene関数
function ExtendedScene() {
  return (
    <>
      <Scene />
      <LearningTools3D />
      <RevenueModel3D />
    </>
  )
}

// 追加のユーティリティ関数
const utils = {
  // イージング関数
  easing: {
    easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeOut: (t: number) => t * (2 - t),
    easeIn: (t: number) => t * t
  },
  
  // カラーユーティリティ
  colors: {
    hexToRgb: (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    },
    
    rgbToHex: (r: number, g: number, b: number) => {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
    }
  },
  
  // アニメーションヘルパー
  animation: {
    lerp: (start: number, end: number, t: number) => {
      return start + (end - start) * t
    },
    
    bounce: (t: number) => {
      if (t < 0.36364) {
        return 7.5625 * t * t
      } else if (t < 0.72728) {
        t = t - 0.54545
        return 7.5625 * t * t + 0.75
      } else if (t < 0.90909) {
        t = t - 0.81818
        return 7.5625 * t * t + 0.9375
      } else {
        t = t - 0.95455
        return 7.5625 * t * t + 0.984375
      }
    }
  }
}

// 成功事例の詳細データ
const detailedSuccessStories = [
  {
    id: 1,
    name: '田中 美咲',
    age: 28,
    previousJob: '英語教師',
    currentBusiness: 'AI英会話スクール「SpeakAI」',
    monthlyRevenue: '¥2,400,000',
    timeToRevenue: '起業6ヶ月',
    story: `教育現場でのもどかしさから、テクノロジーを活用した新しい教育の形を模索していました。
    AIDXschoolでChatGPTとBubbleを学び、AIが生徒一人ひとりに最適化された学習プランを
    自動生成するシステムを開発。現在は月間300名以上の生徒が利用しています。`,
    keyTechnologies: ['ChatGPT API', 'Bubble', 'Zapier', 'Stripe'],
    achievements: [
      '月間アクティブユーザー300名突破',
      '顧客満足度95%',
      'リピート率80%以上',
      '完全自動化により週20時間の労働で運営'
    ],
    advice: 'AIは教育を変える力があります。恐れずに挑戦してください。'
  },
  {
    id: 2,
    name: '山本 健太',
    age: 35,
    previousJob: 'ECサイト運営マネージャー',
    currentBusiness: 'EC自動化コンサルティング',
    monthlyRevenue: '¥8,500,000',
    timeToRevenue: '起業1年',
    story: `大手ECサイトでの経験を活かし、中小企業向けのEC自動化サービスを立ち上げ。
    Make（旧Integromat）を駆使して、在庫管理から発送まで完全自動化するシステムを構築。
    現在は30社以上のクライアントを抱え、業務効率を平均70%改善しています。`,
    keyTechnologies: ['Make', 'Shopify API', 'Google Analytics', 'Slack'],
    achievements: [
      'クライアント企業30社以上',
      '平均業務効率改善率70%',
      '年間経費削減額1億円以上（全クライアント合計）',
      '業界内での認知度向上'
    ],
    advice: '自分の経験×最新技術で、唯一無二のサービスが生まれます。'
  },
  {
    id: 3,
    name: '鈴木 由美',
    age: 42,
    previousJob: '不動産営業20年',
    currentBusiness: 'AI不動産査定サービス「SmartEstate」',
    monthlyRevenue: '¥15,000,000',
    timeToRevenue: '起業1年半',
    story: `20年の不動産業界経験とAI技術を融合させ、瞬時に適正価格を算出するサービスを開発。
    GPT-4を活用した市場分析と、独自のデータベースにより、査定精度95%以上を実現。
    大手不動産会社3社と業務提携し、業界標準ツールとして採用されています。`,
    keyTechnologies: ['GPT-4 API', 'Airtable', 'Retool', 'Tableau'],
    achievements: [
      '査定精度95%以上',
      '大手不動産会社3社と提携',
      '月間査定件数10,000件突破',
      '業界イノベーション賞受賞'
    ],
    advice: '長年の経験は、AIと組み合わせることで最強の武器になります。'
  }
]

// 詳細なカリキュラム構成
const detailedCurriculum = {
  overview: {
    totalDuration: '20週間（5ヶ月）',
    weeklyCommitment: '週10-15時間',
    format: '完全オンライン',
    support: '24時間チャットサポート + 週次メンタリング'
  },
  phases: [
    {
      phase: 1,
      title: 'Foundation Phase - 基礎構築',
      duration: '4週間',
      goal: 'AI×DXの基礎概念を理解し、主要ツールの基本操作をマスター',
      modules: [
        {
          week: 1,
          title: 'AI時代の起業戦略',
          topics: [
            'AI/DXトレンドと市場機会',
            'ChatGPT/Claude基礎',
            'プロンプトエンジニアリング',
            'AIツール総覧'
          ],
          assignments: [
            'ChatGPTで簡単なビジネスアイデア生成',
            'プロンプト作成演習'
          ]
        },
        {
          week: 2,
          title: 'ノーコード開発入門',
          topics: [
            'Bubble基礎操作',
            'データベース設計',
            'UI/UXの基本原則',
            'レスポンシブデザイン'
          ],
          assignments: [
            '簡単なWebアプリ作成',
            'データベース設計課題'
          ]
        },
        {
          week: 3,
          title: '業務自動化の基礎',
          topics: [
            'Zapier/Make入門',
            'ワークフロー設計',
            'API基礎知識',
            'トリガーとアクション'
          ],
          assignments: [
            '3つ以上のアプリを連携',
            '自動化フロー構築'
          ]
        },
        {
          week: 4,
          title: '統合プロジェクト',
          topics: [
            'AI×ノーコード×自動化',
            'MVP開発',
            'テストとデバッグ',
            'デプロイメント'
          ],
          assignments: [
            'ミニプロジェクト完成',
            'プレゼンテーション'
          ]
        }
      ]
    },
    {
      phase: 2,
      title: 'Advanced Phase - 応用展開',
      duration: '8週間',
      goal: '実践的なビジネスアプリケーションを開発し、収益化の基礎を学ぶ',
      modules: [
        {
          week: 5,
          title: '高度なAI活用',
          topics: [
            'カスタムGPT開発',
            'AIエージェント構築',
            'マルチモーダルAI',
            'Fine-tuning基礎'
          ]
        },
        {
          week: 6,
          title: '高度なノーコード開発',
          topics: [
            'Bubble高度機能',
            'プラグイン開発',
            'カスタムコード統合',
            'パフォーマンス最適化'
          ]
        },
        {
          week: 7,
          title: 'データ分析と可視化',
          topics: [
            'Google Analytics活用',
            'Tableau/Power BI',
            'KPI設定と追跡',
            'A/Bテスト'
          ]
        },
        {
          week: 8,
          title: 'セキュリティとスケーラビリティ',
          topics: [
            'セキュリティベストプラクティス',
            'GDPR/個人情報保護',
            'スケーラブル設計',
            'バックアップ戦略'
          ]
        }
      ]
    },
    {
      phase: 3,
      title: 'Business Phase - ビジネス実装',
      duration: '8週間',
      goal: '実際のビジネスを立ち上げ、成長戦略を実行',
      modules: [
        {
          week: 13,
          title: 'ビジネスモデル設計',
          topics: [
            '市場調査手法',
            'ペルソナ設定',
            '価格戦略',
            'ビジネスモデルキャンバス'
          ]
        },
        {
          week: 14,
          title: 'マーケティング戦略',
          topics: [
            'デジタルマーケティング',
            'コンテンツマーケティング',
            'SEO/SEM',
            'ソーシャルメディア戦略'
          ]
        },
        {
          week: 15,
          title: '営業とカスタマーサクセス',
          topics: [
            'セールスファネル構築',
            'CRM活用',
            'カスタマーサポート自動化',
            'リテンション戦略'
          ]
        },
        {
          week: 20,
          title: '卒業プロジェクト',
          topics: [
            '実ビジネスローンチ',
            '投資家向けピッチ',
            '成長戦略立案',
            '継続的改善'
          ]
        }
      ]
    }
  ]
}

// 料金プランの詳細比較
const detailedPricingComparison = {
  features: [
    {
      category: '学習コンテンツ',
      items: [
        { feature: '基礎カリキュラム', starter: '✓', pro: '✓', master: '✓' },
        { feature: '応用カリキュラム', starter: '一部', pro: '✓', master: '✓' },
        { feature: 'ビジネスカリキュラム', starter: '×', pro: '✓', master: '✓' },
        { feature: '録画講義アクセス', starter: '3ヶ月', pro: '1年', master: '永久' },
        { feature: '最新コンテンツ更新', starter: '×', pro: '✓', master: '✓' }
      ]
    },
    {
      category: 'サポート',
      items: [
        { feature: '個別メンタリング', starter: '週1回', pro: '週2回', master: '毎日' },
        { feature: 'Slackサポート', starter: '平日のみ', pro: '24時間', master: '24時間' },
        { feature: 'グループセッション', starter: '月2回', pro: '週1回', master: '週2回' },
        { feature: '緊急サポート', starter: '×', pro: '△', master: '✓' },
        { feature: '専任メンター', starter: '×', pro: '×', master: '✓' }
      ]
    },
    {
      category: 'ビジネス支援',
      items: [
        { feature: '案件紹介', starter: '×', pro: '3件保証', master: '10件保証' },
        { feature: '起業サポート期間', starter: '×', pro: '6ヶ月', master: '無期限' },
        { feature: '資金調達支援', starter: '×', pro: '×', master: '✓' },
        { feature: '法人設立サポート', starter: '×', pro: '△', master: '✓' },
        { feature: 'ビジネスマッチング', starter: '×', pro: '✓', master: '✓' }
      ]
    },
    {
      category: 'ツール・リソース',
      items: [
        { feature: 'ツール利用料補助', starter: '×', pro: '6ヶ月', master: '永久' },
        { feature: 'テンプレート集', starter: '基本のみ', pro: '全て', master: '全て+カスタム' },
        { feature: 'APIクレジット', starter: '×', pro: '$100/月', master: '$500/月' },
        { feature: 'クラウドリソース', starter: '×', pro: '△', master: '✓' },
        { feature: '専用開発環境', starter: '×', pro: '×', master: '✓' }
      ]
    }
  ]
}