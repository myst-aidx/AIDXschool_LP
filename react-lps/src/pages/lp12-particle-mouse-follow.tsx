// LP12: 3Dパーティクルマウス追従 - インタラクティブな起業の可能性を視覚化
// AIDXschoolの革新的な学習体験を、10,000個のパーティクルで表現

import { useRef, useMemo, Suspense, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, PerspectiveCamera, Stars, Float } from '@react-three/drei'
import * as THREE from 'three'
import styled from 'styled-components'
import { gsap } from 'gsap'

// スタイルコンポーネント
const Container = styled.div`
  position: relative;
  width: 100vw;
  min-height: 100vh;
  background: radial-gradient(ellipse at center, #0a0e27 0%, #000000 100%);
  overflow-x: hidden;
  cursor: none; /* デフォルトカーソルを非表示 */
`

const Header = styled.header`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 2rem;
  text-align: center;
  pointer-events: none; /* マウスイベントを透過 */
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent);
`

const Title = styled.h1`
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 900;
  color: #ffffff;
  margin: 0;
  letter-spacing: 0.05em;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
  font-family: 'Noto Sans JP', sans-serif;
`

const Subtitle = styled.p`
  font-size: clamp(1rem, 2vw, 1.5rem);
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.5rem;
  font-family: 'Noto Sans JP', sans-serif;
`

const CustomCursor = styled.div<{ x: number; y: number; isHovering: boolean }>`
  position: fixed;
  width: ${props => props.isHovering ? '40px' : '20px'};
  height: ${props => props.isHovering ? '40px' : '20px'};
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  transform: translate(${props => props.x}px, ${props => props.y}px) translate(-50%, -50%);
  pointer-events: none;
  z-index: 9999;
  transition: width 0.3s, height 0.3s, border-color 0.3s;
  ${props => props.isHovering && `
    border-color: #4EB5FF;
    box-shadow: 0 0 20px rgba(78, 181, 255, 0.5);
  `}
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 4px;
    height: 4px;
    background: ${props => props.isHovering ? '#4EB5FF' : 'white'};
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
`

const CanvasContainer = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
`

const InfoPanel = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 300px;
  z-index: 10;
  pointer-events: auto;
`

const InfoTitle = styled.h3`
  color: #4EB5FF;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-family: 'Noto Sans JP', sans-serif;
`

const InfoText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
  font-family: 'Noto Sans JP', sans-serif;
`

// フローティングナビゲーション
const FloatingNav = styled.nav`
  position: fixed;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const NavDot = styled.button<{ active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid ${props => props.active ? '#4EB5FF' : 'rgba(255, 255, 255, 0.3)'};
  background: ${props => props.active ? '#4EB5FF' : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: auto;
  
  &:hover {
    border-color: #4EB5FF;
    transform: scale(1.2);
  }
`

// セクションコンテナ
const Section = styled.section`
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  pointer-events: auto;
`

const SectionContent = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
`

const SectionTitle = styled.h2`
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 900;
  color: #ffffff;
  text-align: center;
  margin-bottom: 3rem;
  text-shadow: 0 0 30px rgba(78, 181, 255, 0.3);
  font-family: 'Noto Sans JP', sans-serif;
`

// テクノロジー比較カード
const TechCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.08);
    border-color: #4EB5FF;
    box-shadow: 0 10px 30px rgba(78, 181, 255, 0.3);
  }
`

// プライシングカード
const PricingCard = styled(TechCard)<{ featured?: boolean }>`
  ${props => props.featured && `
    background: rgba(78, 181, 255, 0.1);
    border-color: #4EB5FF;
    transform: scale(1.05);
    
    &:hover {
      transform: scale(1.05) translateY(-5px);
    }
  `}
`

// CTA ボタン
const CTAButton = styled.button`
  background: linear-gradient(135deg, #4EB5FF 0%, #38C172 100%);
  color: white;
  border: none;
  padding: 1rem 3rem;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 20px rgba(78, 181, 255, 0.3);
  font-family: 'Noto Sans JP', sans-serif;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(78, 181, 255, 0.5);
  }
`

// パーティクルシステムコンポーネント（改良版）
function ParticleSystem() {
  const { size, viewport, mouse } = useThree()
  const particlesRef = useRef<THREE.Points>(null!)
  const mouseRef = useRef(new THREE.Vector2())
  const initialPositionsRef = useRef<Float32Array>()
  
  // パーティクル数（パフォーマンスを考慮して調整）
  const particleCount = 15000

  // パーティクルの初期位置を生成
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // より複雑な分布パターンを作成
      const distributionType = Math.random()
      
      if (distributionType < 0.33) {
        // 球体分布
        const radius = Math.random() * 15
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos((Math.random() * 2) - 1)
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        positions[i3 + 2] = radius * Math.cos(phi)
      } else if (distributionType < 0.66) {
        // 螺旋分布
        const t = i / particleCount * 10
        const radius = t * 1.5
        positions[i3] = radius * Math.cos(t * 2)
        positions[i3 + 1] = t * 2 - 10
        positions[i3 + 2] = radius * Math.sin(t * 2)
      } else {
        // ランダム分布
        positions[i3] = (Math.random() - 0.5) * 30
        positions[i3 + 1] = (Math.random() - 0.5) * 30
        positions[i3 + 2] = (Math.random() - 0.5) * 30
      }
      
      // グラデーションカラーの設定（AIDXschoolのブランドカラーを反映）
      const colorType = Math.random()
      if (colorType < 0.33) {
        // ブルー系
        colors[i3] = 0.3
        colors[i3 + 1] = 0.7
        colors[i3 + 2] = 1.0
      } else if (colorType < 0.66) {
        // グリーン系
        colors[i3] = 0.2
        colors[i3 + 1] = 0.9
        colors[i3 + 2] = 0.4
      } else {
        // パープル系
        colors[i3] = 0.6
        colors[i3 + 1] = 0.3
        colors[i3 + 2] = 0.9
      }
    }
    
    return { positions, colors }
  }, [particleCount])

  // 初期位置を保存
  useEffect(() => {
    initialPositionsRef.current = positions.slice()
  }, [positions])

  // アニメーションループ
  useFrame((state) => {
    if (!particlesRef.current || !initialPositionsRef.current) return
    
    // マウス位置を正規化（-1 〜 1の範囲）
    mouseRef.current.lerp(mouse, 0.1)
    
    const positionsAttribute = particlesRef.current.geometry.attributes.position
    const positions = positionsAttribute.array as Float32Array
    
    // 各パーティクルの位置を更新
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // パーティクルの現在位置
      const x = positions[i3]
      const y = positions[i3 + 1]
      const z = positions[i3 + 2]
      
      // マウスからの3D空間での位置
      const mouseX = mouseRef.current.x * viewport.width / 2
      const mouseY = mouseRef.current.y * viewport.height / 2
      
      // マウスからの距離を計算
      const distanceToMouse = Math.sqrt(
        (x - mouseX) ** 2 + 
        (y - mouseY) ** 2 + 
        z ** 2
      )
      
      // インタラクション範囲
      const interactionRadius = 5
      
      if (distanceToMouse < interactionRadius) {
        // マウスに近いパーティクルを反発させる
        const repulsionForce = (interactionRadius - distanceToMouse) / interactionRadius
        const angle = Math.atan2(y - mouseY, x - mouseX)
        const angleZ = Math.atan2(z, Math.sqrt((x - mouseX) ** 2 + (y - mouseY) ** 2))
        
        positions[i3] = x + Math.cos(angle) * repulsionForce * 2
        positions[i3 + 1] = y + Math.sin(angle) * repulsionForce * 2
        positions[i3 + 2] = z + Math.sin(angleZ) * repulsionForce * 1.5
      } else {
        // 元の位置に戻す（スプリング効果）
        const originalX = initialPositionsRef.current[i3]
        const originalY = initialPositionsRef.current[i3 + 1]
        const originalZ = initialPositionsRef.current[i3 + 2]
        
        const springStrength = 0.02
        positions[i3] = THREE.MathUtils.lerp(x, originalX, springStrength)
        positions[i3 + 1] = THREE.MathUtils.lerp(y, originalY, springStrength)
        positions[i3 + 2] = THREE.MathUtils.lerp(z, originalZ, springStrength)
      }
      
      // 時間に基づく微細な動き
      const time = state.clock.elapsedTime
      positions[i3] += Math.sin(time + i * 0.1) * 0.01
      positions[i3 + 1] += Math.cos(time + i * 0.1) * 0.01
      positions[i3 + 2] += Math.sin(time * 0.5 + i * 0.1) * 0.01
    }
    
    // パーティクルシステムをゆっくり回転
    particlesRef.current.rotation.y += 0.0005
    particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    
    // ジオメトリの更新を通知
    positionsAttribute.needsUpdate = true
  })

  return (
    <>
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
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* 背景の星 */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
    </>
  )
}

// 3Dテキストコンポーネント（複数配置）
function FloatingTexts() {
  const texts = [
    { text: "可能性は無限大", position: [0, 0, -2], size: 0.5 },
    { text: "AI×起業", position: [-5, 3, -5], size: 0.3 },
    { text: "ノーコード革命", position: [5, -2, -4], size: 0.3 },
    { text: "未来を創造", position: [-3, -3, -3], size: 0.35 },
    { text: "AIDXschool", position: [4, 2, -6], size: 0.4 }
  ]
  
  return (
    <>
      {texts.map((item, index) => (
        <Float
          key={index}
          speed={1.5}
          rotationIntensity={0.5}
          floatIntensity={0.5}
        >
          <Text
            position={item.position as [number, number, number]}
            fontSize={item.size}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            font="/fonts/NotoSansJP-Bold.otf"
          >
            {item.text}
          </Text>
        </Float>
      ))}
    </>
  )
}

// 技術比較データ
const techComparisonData = [
  {
    name: 'Three.js + React Three Fiber',
    description: '3Dウェブグラフィックスの最先端',
    features: {
      'パフォーマンス': 95,
      '学習曲線': 70,
      '表現力': 100,
      'エコシステム': 90,
      'モバイル対応': 85
    },
    pros: [
      'リアルタイムレンダリング',
      'Reactとの完璧な統合',
      '豊富なヘルパー機能',
      'デバッグツール充実'
    ],
    useCase: '没入型体験、インタラクティブなプレゼンテーション'
  },
  {
    name: 'WebGL (ネイティブ)',
    description: '究極のパフォーマンスと制御',
    features: {
      'パフォーマンス': 100,
      '学習曲線': 30,
      '表現力': 100,
      'エコシステム': 60,
      'モバイル対応': 90
    },
    pros: [
      '最高のパフォーマンス',
      '完全なカスタマイズ',
      '軽量な実装',
      'GPUの直接制御'
    ],
    useCase: '高度なビジュアライゼーション、ゲーム開発'
  },
  {
    name: 'CSS 3D Transforms',
    description: 'シンプルで軽量な3D表現',
    features: {
      'パフォーマンス': 70,
      '学習曲線': 90,
      '表現力': 60,
      'エコシステム': 95,
      'モバイル対応': 95
    },
    pros: [
      '実装が簡単',
      'SEOフレンドリー',
      'アクセシビリティ対応',
      'フォールバック不要'
    ],
    useCase: 'シンプルな3D効果、カード回転、視差効果'
  }
]

// カリキュラムデータ
const curriculumData = {
  phase1: {
    title: 'Foundation Phase（基礎編）',
    duration: '4週間',
    modules: [
      {
        week: 1,
        title: '3D Web技術の基礎',
        topics: [
          '3D空間の概念理解',
          'WebGLとThree.jsの基礎',
          'React Three Fiberの導入',
          'ジオメトリとマテリアル'
        ]
      },
      {
        week: 2,
        title: 'インタラクティブ要素の実装',
        topics: [
          'マウス・タッチイベント処理',
          'カメラコントロール',
          'アニメーション基礎',
          'パーティクルシステム'
        ]
      },
      {
        week: 3,
        title: 'パフォーマンス最適化',
        topics: [
          'レンダリング最適化',
          'メモリ管理',
          'モバイル対応',
          'プログレッシブエンハンスメント'
        ]
      },
      {
        week: 4,
        title: '実践プロジェクト',
        topics: [
          'ポートフォリオサイト制作',
          'インタラクティブなプレゼン',
          'データビジュアライゼーション',
          'パフォーマンステスト'
        ]
      }
    ]
  },
  phase2: {
    title: 'Advanced Phase（応用編）',
    duration: '6週間',
    modules: [
      {
        week: 5,
        title: 'シェーダープログラミング',
        topics: [
          'GLSLの基礎',
          'カスタムシェーダー',
          'ポストプロセッシング',
          'ビジュアルエフェクト'
        ]
      },
      {
        week: 6,
        title: '物理シミュレーション',
        topics: [
          '物理エンジンの統合',
          'リアルな動きの実装',
          'パーティクル物理',
          'コリジョン検出'
        ]
      }
    ]
  },
  phase3: {
    title: 'Business Phase（ビジネス実装編）',
    duration: '6週間',
    modules: [
      {
        week: 11,
        title: '商用プロジェクト開発',
        topics: [
          'クライアントワーク',
          'プロジェクト管理',
          'チーム開発',
          'デプロイメント'
        ]
      },
      {
        week: 16,
        title: 'ビジネス展開',
        topics: [
          '料金設定戦略',
          '営業・マーケティング',
          'ポートフォリオ構築',
          'フリーランス起業'
        ]
      }
    ]
  }
}

// 成功事例データ
const successStories = [
  {
    name: '佐藤 健太',
    age: 32,
    background: 'Webデザイナー',
    achievement: '3Dウェブ制作会社設立',
    revenue: '月商¥3,500,000',
    period: '起業8ヶ月',
    story: 'Three.jsを活用した没入型ウェブサイト制作で差別化。大手企業のキャンペーンサイトを多数手がける。',
    keyPoints: [
      'インタラクティブな商品展示',
      'VRショールーム開発',
      '3Dプロダクトコンフィギュレーター'
    ]
  },
  {
    name: '鈴木 美香',
    age: 28,
    background: '元ゲーム開発者',
    achievement: 'エデュテック起業',
    revenue: '月商¥5,200,000',
    period: '起業1年',
    story: '3D技術を活用した革新的な教育コンテンツを開発。学習効果を可視化するプラットフォームが教育機関で採用。',
    keyPoints: [
      '3D学習シミュレーター',
      'インタラクティブ教材',
      'VR/AR教育コンテンツ'
    ]
  },
  {
    name: '田中 翔',
    age: 35,
    background: '建築デザイナー',
    achievement: '不動産ビジュアライゼーション',
    revenue: '月商¥8,000,000',
    period: '起業1年半',
    story: 'WebGLを使った不動産の3Dビューアーで業界に革命。内覧の手間を削減し、成約率を大幅向上。',
    keyPoints: [
      'バーチャル内覧システム',
      'リアルタイムカスタマイズ',
      'AR家具配置シミュレーター'
    ]
  }
]

// 料金プラン
const pricingPlans = [
  {
    name: 'スタータープラン',
    price: '¥298,000',
    duration: '4週間集中コース',
    features: [
      'Three.js基礎マスター',
      'React Three Fiber完全習得',
      '10個の実践プロジェクト',
      '週1回の個別メンタリング',
      'Slackサポート（平日）',
      '修了証明書発行'
    ],
    isPopular: false
  },
  {
    name: 'プロフェッショナルプラン',
    price: '¥698,000',
    duration: '12週間完全習得コース',
    features: [
      'スタータープランの全内容',
      'シェーダープログラミング',
      '物理エンジン実装',
      'ビジネス戦略講座',
      '週2回の個別メンタリング',
      '24時間Slackサポート',
      '案件紹介（3件保証）',
      '起業サポート6ヶ月'
    ],
    isPopular: true
  },
  {
    name: 'マスタープラン',
    price: '¥1,480,000',
    duration: '20週間起業家育成コース',
    features: [
      'プロフェッショナルプランの全内容',
      'VR/AR開発講座',
      'AIとの統合技術',
      'チーム開発実践',
      '毎日の個別サポート',
      'スタートアップ支援',
      '初期案件10件保証',
      '投資家ネットワーク紹介',
      '永続的なコミュニティアクセス'
    ],
    isPopular: false
  }
]

// メインコンポーネント
export default function ParticleMouseFollow() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  
  // カスタムカーソルの位置を更新
  const handleMouseMove = (e: React.MouseEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY })
  }
  
  // セクション監視
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      const newActiveSection = Math.floor(scrollPosition / windowHeight)
      setActiveSection(newActiveSection)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // セクションへスクロール
  const scrollToSection = (index: number) => {
    const element = document.getElementById(`section-${index}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }
  
  return (
    <Container onMouseMove={handleMouseMove}>
      {/* カスタムカーソル */}
      <CustomCursor x={cursorPos.x} y={cursorPos.y} isHovering={isHovering} />
      
      {/* フローティングナビゲーション */}
      <FloatingNav>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <NavDot
            key={index}
            active={activeSection === index}
            onClick={() => scrollToSection(index)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          />
        ))}
      </FloatingNav>
      
      {/* ヒーローセクション（3Dシーン） */}
      <div id="section-0" style={{ position: 'relative' }}>
        <Header>
          <Title>無限の可能性を探索</Title>
          <Subtitle>マウスを動かして、起業の新しい次元を体験</Subtitle>
        </Header>
        
        <InfoPanel
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <InfoTitle>インタラクティブ体験</InfoTitle>
          <InfoText>
            15,000個のパーティクルがあなたのマウスに反応。
            AIDXschoolで学ぶ3D Web技術の可能性は、まさに無限大です。
          </InfoText>
        </InfoPanel>
        
        <CanvasContainer>
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={75} />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enableRotate={true}
              autoRotate={true}
              autoRotateSpeed={0.5}
              maxPolarAngle={Math.PI * 0.8}
              minPolarAngle={Math.PI * 0.2}
            />
            
            {/* ライティング */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4EB5FF" />
            
            <Suspense fallback={null}>
              <ParticleSystem />
              <FloatingTexts />
            </Suspense>
          </Canvas>
        </CanvasContainer>
      </div>
      
      {/* テクノロジー比較セクション */}
      <Section id="section-1">
        <SectionContent>
          <SectionTitle>3D Web技術の選択肢</SectionTitle>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
            {techComparisonData.map((tech, index) => (
              <TechCard
                key={index}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <h3 style={{ 
                  color: '#4EB5FF', 
                  fontSize: '1.5rem', 
                  marginBottom: '0.5rem' 
                }}>
                  {tech.name}
                </h3>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  marginBottom: '1.5rem' 
                }}>
                  {tech.description}
                </p>
                
                {/* パフォーマンスチャート */}
                <div style={{ marginBottom: '1.5rem' }}>
                  {Object.entries(tech.features).map(([key, value]) => (
                    <div key={key} style={{ marginBottom: '0.5rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '0.25rem'
                      }}>
                        <span style={{ fontSize: '0.9rem' }}>{key}</span>
                        <span style={{ fontSize: '0.9rem' }}>{value}%</span>
                      </div>
                      <div style={{
                        height: '4px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${value}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #4EB5FF, #38C172)',
                          transition: 'width 1s ease'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* メリット */}
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ 
                    color: '#38C172', 
                    fontSize: '1rem', 
                    marginBottom: '0.5rem' 
                  }}>
                    主なメリット
                  </h4>
                  <ul style={{ 
                    listStyle: 'none', 
                    padding: 0 
                  }}>
                    {tech.pros.map((pro, i) => (
                      <li key={i} style={{ 
                        fontSize: '0.9rem', 
                        marginBottom: '0.25rem' 
                      }}>
                        ✓ {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <p style={{ 
                  fontSize: '0.85rem', 
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontStyle: 'italic'
                }}>
                  最適な用途: {tech.useCase}
                </p>
              </TechCard>
            ))}
          </div>
        </SectionContent>
      </Section>
      
      {/* カリキュラムセクション */}
      <Section id="section-2">
        <SectionContent>
          <SectionTitle>体系的な学習カリキュラム</SectionTitle>
          
          {/* フェーズ1 */}
          <div style={{ marginBottom: '4rem' }}>
            <h3 style={{ 
              color: '#4EB5FF', 
              fontSize: '2rem', 
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              {curriculumData.phase1.title}
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {curriculumData.phase1.modules.map((module, index) => (
                <TechCard
                  key={index}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <div style={{ 
                    background: 'linear-gradient(135deg, #4EB5FF, #38C172)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    display: 'inline-block',
                    marginBottom: '1rem'
                  }}>
                    Week {module.week}
                  </div>
                  <h4 style={{ 
                    fontSize: '1.3rem', 
                    marginBottom: '1rem' 
                  }}>
                    {module.title}
                  </h4>
                  <ul style={{ 
                    listStyle: 'none', 
                    padding: 0 
                  }}>
                    {module.topics.map((topic, i) => (
                      <li key={i} style={{ 
                        fontSize: '0.9rem', 
                        marginBottom: '0.5rem',
                        paddingLeft: '1.5rem',
                        position: 'relative'
                      }}>
                        <span style={{
                          position: 'absolute',
                          left: 0,
                          color: '#38C172'
                        }}>▸</span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </TechCard>
              ))}
            </div>
          </div>
          
          {/* その他のフェーズの概要 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <p style={{ 
              fontSize: '1.2rem', 
              marginBottom: '2rem' 
            }}>
              さらに12週間の応用・ビジネス実装フェーズで
              実践的なスキルと起業ノウハウを習得
            </p>
            <CTAButton 
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              詳細なカリキュラムを見る
            </CTAButton>
          </div>
        </SectionContent>
      </Section>
      
      {/* 成功事例セクション */}
      <Section id="section-3">
        <SectionContent>
          <SectionTitle>卒業生の成功ストーリー</SectionTitle>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
            {successStories.map((story, index) => (
              <TechCard
                key={index}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                {/* 背景グラデーション */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '150px',
                  height: '150px',
                  background: 'radial-gradient(circle at center, rgba(78, 181, 255, 0.1), transparent)',
                  borderRadius: '50%',
                  transform: 'translate(50%, -50%)'
                }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ 
                      fontSize: '1.5rem', 
                      marginBottom: '0.5rem' 
                    }}>
                      {story.name}（{story.age}歳）
                    </h3>
                    <p style={{ 
                      color: 'rgba(255, 255, 255, 0.6)', 
                      fontSize: '0.9rem' 
                    }}>
                      元{story.background} → {story.achievement}
                    </p>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem'
                  }}>
                    <div>
                      <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: 'bold',
                        color: '#FFD93D'
                      }}>
                        {story.revenue}
                      </p>
                      <p style={{ 
                        fontSize: '0.8rem', 
                        color: 'rgba(255, 255, 255, 0.6)' 
                      }}>
                        {story.period}
                      </p>
                    </div>
                  </div>
                  
                  <p style={{ 
                    fontSize: '0.95rem', 
                    lineHeight: '1.6',
                    marginBottom: '1.5rem'
                  }}>
                    {story.story}
                  </p>
                  
                  <div>
                    <h4 style={{ 
                      color: '#38C172', 
                      fontSize: '1rem', 
                      marginBottom: '0.5rem' 
                    }}>
                      主な実績
                    </h4>
                    <ul style={{ 
                      listStyle: 'none', 
                      padding: 0 
                    }}>
                      {story.keyPoints.map((point, i) => (
                        <li key={i} style={{ 
                          fontSize: '0.85rem', 
                          marginBottom: '0.25rem',
                          opacity: 0.8
                        }}>
                          • {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TechCard>
            ))}
          </div>
        </SectionContent>
      </Section>
      
      {/* 料金プランセクション */}
      <Section id="section-4">
        <SectionContent>
          <SectionTitle>あなたに最適なプランを選択</SectionTitle>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {pricingPlans.map((plan, index) => (
              <PricingCard
                key={index}
                featured={plan.isPopular}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {plan.isPopular && (
                  <div style={{
                    background: 'linear-gradient(135deg, #4EB5FF, #38C172)',
                    color: 'white',
                    padding: '0.5rem',
                    textAlign: 'center',
                    marginTop: '-2rem',
                    marginLeft: '-2rem',
                    marginRight: '-2rem',
                    marginBottom: '1.5rem',
                    borderRadius: '20px 20px 0 0',
                    fontWeight: 'bold'
                  }}>
                    人気No.1
                  </div>
                )}
                
                <h3 style={{ 
                  fontSize: '1.8rem', 
                  marginBottom: '0.5rem' 
                }}>
                  {plan.name}
                </h3>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: 'bold',
                    color: plan.isPopular ? '#4EB5FF' : '#FFD93D'
                  }}>
                    {plan.price}
                  </p>
                  <p style={{ 
                    fontSize: '0.9rem', 
                    color: 'rgba(255, 255, 255, 0.6)' 
                  }}>
                    {plan.duration}
                  </p>
                </div>
                
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0,
                  marginBottom: '2rem'
                }}>
                  {plan.features.map((feature, i) => (
                    <li key={i} style={{ 
                      fontSize: '0.9rem', 
                      marginBottom: '0.75rem',
                      paddingLeft: '1.5rem',
                      position: 'relative'
                    }}>
                      <span style={{
                        position: 'absolute',
                        left: 0,
                        color: '#38C172'
                      }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <CTAButton
                  style={{
                    width: '100%',
                    background: plan.isPopular 
                      ? 'linear-gradient(135deg, #4EB5FF, #38C172)'
                      : 'transparent',
                    border: plan.isPopular 
                      ? 'none'
                      : '2px solid #4EB5FF'
                  }}
                >
                  {plan.isPopular ? '今すぐ申し込む' : '詳細を見る'}
                </CTAButton>
              </PricingCard>
            ))}
          </div>
          
          {/* 返金保証 */}
          <div style={{
            background: 'rgba(255, 107, 107, 0.1)',
            border: '2px solid #FF6B6B',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              color: '#FF6B6B', 
              fontSize: '1.5rem', 
              marginBottom: '1rem' 
            }}>
              30日間全額返金保証
            </h3>
            <p style={{ 
              fontSize: '1rem', 
              lineHeight: '1.6' 
            }}>
              プログラムの内容にご満足いただけない場合は、
              理由を問わず全額返金いたします。
              安心してスタートできます。
            </p>
          </div>
        </SectionContent>
      </Section>
      
      {/* 最終CTAセクション */}
      <Section id="section-5">
        <SectionContent>
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <SectionTitle>
              3D Webの世界で、
              新しいキャリアを始めませんか？
            </SectionTitle>
            
            <p style={{ 
              fontSize: '1.3rem', 
              lineHeight: '1.8',
              marginBottom: '3rem',
              opacity: 0.9
            }}>
              今、このページで体験したような
              インタラクティブな3D表現を、
              あなたも作れるようになります。
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2rem',
              marginBottom: '3rem'
            }}>
              {[
                { number: '2,500+', label: '卒業生数' },
                { number: '¥4.2M', label: '平均月商' },
                { number: '98%', label: '満足度' }
              ].map((stat, index) => (
                <div 
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '20px',
                    padding: '2rem'
                  }}
                >
                  <p style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: 'bold',
                    color: '#4EB5FF',
                    marginBottom: '0.5rem'
                  }}>
                    {stat.number}
                  </p>
                  <p style={{ 
                    fontSize: '1rem',
                    opacity: 0.8
                  }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            
            <CTAButton
              style={{
                fontSize: '1.3rem',
                padding: '1.5rem 4rem'
              }}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              無料相談を予約する →
            </CTAButton>
            
            <p style={{ 
              marginTop: '1.5rem', 
              fontSize: '0.9rem',
              opacity: 0.7
            }}>
              ※ 完全無料・強引な勧誘は一切ありません
            </p>
          </div>
        </SectionContent>
      </Section>
      
      {/* FAQ セクション */}
      <Section id="section-6" style={{ background: 'linear-gradient(135deg, #0a0e27, #1a1f3a)' }}>
        <SectionContent>
          <SectionTitle>よくあるご質問</SectionTitle>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                category: '技術について',
                faqs: [
                  {
                    q: 'Three.jsやWebGLの知識は必要ですか？',
                    a: 'いいえ、基礎から丁寧に学習します。プログラミング経験があれば十分です。React Three Fiberを使用することで、より直感的に3D開発ができます。'
                  },
                  {
                    q: '数学が苦手でも大丈夫ですか？',
                    a: 'はい、大丈夫です。3D開発に必要な数学的概念は、実践的な例を通じて理解できるようカリキュラムを設計しています。'
                  },
                  {
                    q: 'どんなPCスペックが必要ですか？',
                    a: '一般的なノートPCで十分です。推奨：RAM 8GB以上、グラフィックカード搭載（統合GPUでも可）。詳細な要件は無料相談でご確認ください。'
                  }
                ]
              },
              {
                category: 'キャリアについて',
                faqs: [
                  {
                    q: '3D Web開発の需要はありますか？',
                    a: '非常に高い需要があります。メタバース、VR/AR、インタラクティブマーケティングなど、多くの分野で3D技術者が求められています。'
                  },
                  {
                    q: 'フリーランスとして活動できますか？',
                    a: 'はい、多くの卒業生がフリーランスとして成功しています。3Dウェブサイト制作は高単価案件が多く、月収100万円以上も十分可能です。'
                  },
                  {
                    q: '就職・転職サポートはありますか？',
                    a: '充実したキャリアサポートを提供しています。ポートフォリオ作成支援、面接対策、企業紹介など、あなたのキャリア目標に合わせてサポートします。'
                  }
                ]
              }
            ].map((category, idx) => (
              <TechCard
                key={idx}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <h3 style={{
                  color: '#4EB5FF',
                  fontSize: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  {category.category}
                </h3>
                {category.faqs.map((faq, faqIdx) => (
                  <div key={faqIdx} style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{
                      fontSize: '1.1rem',
                      marginBottom: '0.5rem',
                      color: '#FFD93D'
                    }}>
                      Q: {faq.q}
                    </h4>
                    <p style={{
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                      opacity: 0.9
                    }}>
                      A: {faq.a}
                    </p>
                  </div>
                ))}
              </TechCard>
            ))}
          </div>
        </SectionContent>
      </Section>
      
      {/* 学習ツールとリソース */}
      <Section id="section-7">
        <SectionContent>
          <SectionTitle>充実した学習環境</SectionTitle>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {[
              {
                title: 'オンライン学習プラットフォーム',
                icon: '🖥️',
                features: [
                  '動画講座300本以上',
                  'インタラクティブなコード演習',
                  'リアルタイムプレビュー',
                  '進捗トラッキング'
                ]
              },
              {
                title: '専用開発環境',
                icon: '⚡',
                features: [
                  'クラウドIDE完備',
                  '事前設定済みの環境',
                  'GPU対応インスタンス',
                  'バージョン管理統合'
                ]
              },
              {
                title: 'コミュニティ & サポート',
                icon: '🤝',
                features: [
                  '24/7 Slackサポート',
                  '週次グループセッション',
                  'ペアプログラミング',
                  '卒業生ネットワーク'
                ]
              },
              {
                title: 'プロジェクトリソース',
                icon: '📚',
                features: [
                  'テンプレート集',
                  '3Dアセットライブラリ',
                  'コードスニペット',
                  'ベストプラクティス集'
                ]
              }
            ].map((resource, idx) => (
              <TechCard
                key={idx}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <div style={{
                  fontSize: '3rem',
                  textAlign: 'center',
                  marginBottom: '1rem'
                }}>
                  {resource.icon}
                </div>
                <h3 style={{
                  fontSize: '1.3rem',
                  textAlign: 'center',
                  marginBottom: '1.5rem',
                  color: '#4EB5FF'
                }}>
                  {resource.title}
                </h3>
                <ul style={{
                  listStyle: 'none',
                  padding: 0
                }}>
                  {resource.features.map((feature, fIdx) => (
                    <li key={fIdx} style={{
                      fontSize: '0.9rem',
                      marginBottom: '0.5rem',
                      paddingLeft: '1.5rem',
                      position: 'relative'
                    }}>
                      <span style={{
                        position: 'absolute',
                        left: 0,
                        color: '#38C172'
                      }}>▸</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </TechCard>
            ))}
          </div>
          
          {/* 特別な学習機能 */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(78, 181, 255, 0.1), rgba(56, 193, 114, 0.1))',
            borderRadius: '20px',
            padding: '3rem',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '2rem',
              marginBottom: '1.5rem',
              color: '#FFD93D'
            }}>
              AIDXschool独自の学習メソッド
            </h3>
            <p style={{
              fontSize: '1.1rem',
              lineHeight: '1.8',
              marginBottom: '2rem',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              実践的なプロジェクトベース学習により、
              理論と実装を同時に習得。
              各フェーズで実際の案件レベルの
              作品を完成させながら学びます。
            </p>
          </div>
        </SectionContent>
      </Section>
      
      {/* 講師詳細プロフィール */}
      <Section id="section-8" style={{ background: 'linear-gradient(135deg, #1a1f3a, #0a0e27)' }}>
        <SectionContent>
          <SectionTitle>業界トップクラスの講師陣</SectionTitle>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                name: '高橋 裕太',
                title: 'Lead 3D Developer',
                avatar: '👨‍🎨',
                company: '元Google Creative Lab',
                bio: 'WebGL黎明期から3D Web開発に携わる第一人者。Google、Nike、Adobeなど世界的企業のキャンペーンサイトを多数制作。',
                skills: ['WebGL', 'Three.js', 'GLSL', 'React'],
                awards: [
                  'Awwwards Site of the Year',
                  'FWA Site of the Month x5',
                  'Webby Awards Best Visual Design'
                ],
                message: '3Dは難しそうと思われがちですが、正しいアプローチで学べば誰でも習得できます。一緒に新しい表現の世界を探求しましょう。'
              },
              {
                name: '山田 さくら',
                title: 'Creative Technologist',
                avatar: '👩‍💻',
                company: '元Adobe',
                bio: 'インタラクティブアート作家として活動後、商業プロジェクトに転向。感性と技術を融合させた独自の表現手法を確立。',
                skills: ['Creative Coding', 'Shaders', 'Motion Design', 'UX'],
                awards: [
                  'Tokyo Interactive Award',
                  'CSS Design Awards',
                  'Adobe MAX Sneaks出展'
                ],
                message: '技術は表現のための道具。あなたの創造性を最大限に引き出すお手伝いをします。'
              },
              {
                name: '佐々木 健',
                title: 'Technical Director',
                avatar: '👨‍🏫',
                company: 'フリーランス',
                bio: '大手ゲーム会社でグラフィックスエンジン開発を経験後、Web3D分野へ。パフォーマンス最適化のスペシャリスト。',
                skills: ['Performance', 'WebAssembly', 'GPU Programming', 'Math'],
                awards: [
                  'Unity認定エキスパート',
                  'GitHub Stars 10k+',
                  '技術書執筆3冊'
                ],
                message: '美しいだけでなく、高速で安定した3Dコンテンツ制作の秘訣をお教えします。'
              }
            ].map((instructor, idx) => (
              <TechCard
                key={idx}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                style={{ position: 'relative' }}
              >
                <div style={{
                  textAlign: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    fontSize: '4rem',
                    marginBottom: '0.5rem'
                  }}>
                    {instructor.avatar}
                  </div>
                  <h3 style={{
                    fontSize: '1.5rem',
                    marginBottom: '0.25rem'
                  }}>
                    {instructor.name}
                  </h3>
                  <p style={{
                    color: '#4EB5FF',
                    fontSize: '1rem',
                    marginBottom: '0.25rem'
                  }}>
                    {instructor.title}
                  </p>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.85rem'
                  }}>
                    {instructor.company}
                  </p>
                </div>
                
                <p style={{
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  marginBottom: '1.5rem',
                  opacity: 0.9
                }}>
                  {instructor.bio}
                </p>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{
                    color: '#38C172',
                    fontSize: '1rem',
                    marginBottom: '0.5rem'
                  }}>
                    専門スキル
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    {instructor.skills.map((skill, sIdx) => (
                      <span key={sIdx} style={{
                        background: 'rgba(78, 181, 255, 0.2)',
                        color: '#4EB5FF',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '15px',
                        fontSize: '0.8rem'
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{
                    color: '#FFD93D',
                    fontSize: '1rem',
                    marginBottom: '0.5rem'
                  }}>
                    受賞歴
                  </h4>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    fontSize: '0.85rem'
                  }}>
                    {instructor.awards.map((award, aIdx) => (
                      <li key={aIdx} style={{ marginBottom: '0.25rem' }}>
                        🏆 {award}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <blockquote style={{
                  borderLeft: '3px solid #4EB5FF',
                  paddingLeft: '1rem',
                  fontStyle: 'italic',
                  fontSize: '0.9rem',
                  opacity: 0.9
                }}>
                  "{instructor.message}"
                </blockquote>
              </TechCard>
            ))}
          </div>
        </SectionContent>
      </Section>
      
      {/* お申し込みの流れ */}
      <Section id="section-9">
        <SectionContent>
          <SectionTitle>お申し込みから受講開始まで</SectionTitle>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {[
              {
                step: 1,
                title: '無料相談の予約',
                description: 'フォームから希望日時を選択。オンラインで30分の個別相談を実施します。',
                icon: '📅'
              },
              {
                step: 2,
                title: 'カウンセリング',
                description: 'あなたの目標、現在のスキル、学習可能時間などをヒアリング。最適なプランをご提案。',
                icon: '💬'
              },
              {
                step: 3,
                title: 'お申し込み',
                description: 'プランを決定後、オンラインで簡単にお申し込み。各種支払い方法に対応。',
                icon: '✍️'
              },
              {
                step: 4,
                title: '学習環境の準備',
                description: 'アカウント発行、開発環境セットアップのサポート。すぐに学習を開始できます。',
                icon: '🚀'
              },
              {
                step: 5,
                title: 'オリエンテーション',
                description: '学習の進め方、サポートの使い方を説明。仲間との顔合わせも実施。',
                icon: '🎯'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '2rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  setIsHovering(true)
                  e.currentTarget.style.transform = 'translateX(10px)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                }}
                onMouseLeave={(e) => {
                  setIsHovering(false)
                  e.currentTarget.style.transform = 'translateX(0)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <div style={{
                  fontSize: '2.5rem',
                  marginRight: '1.5rem',
                  minWidth: '60px',
                  textAlign: 'center'
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontSize: '1.3rem',
                    marginBottom: '0.5rem',
                    color: '#4EB5FF'
                  }}>
                    STEP {item.step}: {item.title}
                  </h4>
                  <p style={{
                    fontSize: '0.95rem',
                    opacity: 0.9,
                    lineHeight: '1.5'
                  }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{
            textAlign: 'center',
            marginTop: '3rem'
          }}>
            <CTAButton
              style={{
                fontSize: '1.2rem',
                padding: '1.2rem 3rem'
              }}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              今すぐ無料相談を予約
            </CTAButton>
          </div>
        </SectionContent>
      </Section>
      
      {/* フッター */}
      <Section id="section-10" style={{ 
        background: '#000000',
        minHeight: 'auto',
        padding: '3rem 2rem'
      }}>
        <SectionContent>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '3rem',
            marginBottom: '3rem'
          }}>
            <div>
              <h3 style={{
                fontSize: '1.5rem',
                marginBottom: '1rem',
                color: '#4EB5FF'
              }}>
                AIDXschool
              </h3>
              <p style={{
                fontSize: '0.9rem',
                lineHeight: '1.6',
                opacity: 0.8,
                marginBottom: '1.5rem'
              }}>
                3D×Web×AIで、新しい時代の
                クリエイターを育成します。
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {['Twitter', 'YouTube', 'GitHub', 'Discord'].map((social, idx) => (
                  <button
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      color: 'white',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#4EB5FF'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {social}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 style={{
                fontSize: '1.2rem',
                marginBottom: '1rem'
              }}>
                プログラム
              </h4>
              <ul style={{
                listStyle: 'none',
                fontSize: '0.9rem'
              }}>
                {[
                  '3D Web開発コース',
                  'インタラクティブデザイン',
                  'パフォーマンス最適化',
                  'ビジネス実装講座'
                ].map((item, idx) => (
                  <li key={idx} style={{
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    opacity: 0.8,
                    transition: 'opacity 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 style={{
                fontSize: '1.2rem',
                marginBottom: '1rem'
              }}>
                サポート
              </h4>
              <ul style={{
                listStyle: 'none',
                fontSize: '0.9rem'
              }}>
                {[
                  'よくある質問',
                  'お問い合わせ',
                  '利用規約',
                  'プライバシーポリシー'
                ].map((item, idx) => (
                  <li key={idx} style={{
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    opacity: 0.8,
                    transition: 'opacity 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 style={{
                fontSize: '1.2rem',
                marginBottom: '1rem'
              }}>
                最新情報を受け取る
              </h4>
              <form onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="メールアドレス"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    marginBottom: '0.5rem'
                  }}
                />
                <CTAButton
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '0.9rem'
                  }}
                >
                  登録する
                </CTAButton>
              </form>
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '2rem',
            textAlign: 'center',
            opacity: 0.6
          }}>
            <p>© 2024 AIDXschool. All rights reserved.</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
              〒150-0001 東京都渋谷区神宮前1-1-1 | support@aidxschool.com
            </p>
          </div>
        </SectionContent>
      </Section>
      
    </Container>
  )
}