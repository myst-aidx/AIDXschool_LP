// LP15: スクロール同期3Dシーン - スクロールで展開する起業ストーリー
// AIDXschoolの革新的な学習体験を3D空間で表現

import { useRef, useLayoutEffect, useState, Suspense, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  Box, 
  Sphere,
  Text,
  Torus,
  TorusKnot,
  MeshDistortMaterial,
  PerspectiveCamera,
  Environment,
  Float,
  Cloud,
  Stars,
  Html,
  ContactShadows,
  Octahedron,
  Cone,
  Cylinder,
  Ring,
  Plane,
  MeshReflectorMaterial,
  useScroll,
  ScrollControls,
  Sparkles,
  Trail,
  RoundedBox,
  Text3D,
  Center,
  PresentationControls,
  useTexture,
  Edges,
  GradientTexture,
  MeshTransmissionMaterial
} from '@react-three/drei'
import * as THREE from 'three'
import styled from 'styled-components'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, AnimatePresence } from 'framer-motion'

// GSAPプラグインの登録
gsap.registerPlugin(ScrollTrigger)

// カラーパレット
const colors = {
  primary: '#4EB5FF',
  secondary: '#38C172',
  accent: '#FFD93D',
  danger: '#FF6B6B',
  dark: '#0a0a0a',
  light: '#ffffff',
  purple: '#9333EA',
  pink: '#EC4899',
  indigo: '#6366F1',
  teal: '#14B8A6'
}

// スタイルコンポーネント
const Container = styled.div`
  position: relative;
  height: 800vh;
  background: linear-gradient(to bottom, 
    ${colors.dark} 0%,
    #1a1a2e 15%,
    #16213e 30%,
    #0f3460 45%,
    #533483 60%,
    #e94560 75%,
    #ff6b6b 90%,
    ${colors.accent} 100%
  );
  overflow-x: hidden;
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
`

const Section = styled.section`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  position: relative;
`

const SectionTitle = styled.h2`
  font-size: clamp(2.5rem, 7vw, 5rem);
  font-weight: 900;
  color: #ffffff;
  text-align: center;
  margin: 0;
  text-shadow: 0 0 40px rgba(255, 255, 255, 0.5);
  opacity: 0;
  transform: translateY(50px);
  pointer-events: auto;
  font-family: 'Noto Sans JP', sans-serif;
`

const SectionText = styled.p`
  font-size: clamp(1rem, 2vw, 1.5rem);
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  max-width: 800px;
  margin: 2rem auto 0;
  line-height: 1.8;
  opacity: 0;
  transform: translateY(30px);
  pointer-events: auto;
  font-family: 'Noto Sans JP', sans-serif;
`

const ProgressBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  z-index: 100;
`

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, ${colors.primary}, ${colors.secondary}, ${colors.accent});
  width: 0%;
  transition: width 0.1s ease-out;
  box-shadow: 0 0 10px rgba(78, 181, 255, 0.5);
`

const FloatingNav = styled.nav`
  position: fixed;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  pointer-events: auto;
  
  @media (max-width: 768px) {
    right: 1rem;
  }
`

const NavDot = styled.button<{ active: boolean; 'data-label'?: string }>`
  width: ${props => props.active ? '40px' : '12px'};
  height: 12px;
  border-radius: 6px;
  border: none;
  background: ${props => props.active ? colors.primary : 'rgba(255, 255, 255, 0.3)'};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    background: ${props => props.active ? colors.primary : 'rgba(255, 255, 255, 0.5)'};
    width: 40px;
  }
  
  &::after {
    content: '${props => props['data-label'] || ''}';
    position: absolute;
    right: calc(100% + 1rem);
    top: 50%;
    transform: translateY(-50%);
    color: white;
    font-size: 0.875rem;
    white-space: nowrap;
    opacity: ${props => props.active ? 1 : 0};
    transition: opacity 0.3s ease;
    pointer-events: none;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }
  
  &:hover::after {
    opacity: 1;
  }
`

const CTAButton = styled(motion.button)`
  padding: 1.5rem 3rem;
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(78, 181, 255, 0.3);
  transition: all 0.3s ease;
  pointer-events: auto;
  margin-top: 2rem;
  font-family: 'Noto Sans JP', sans-serif;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(78, 181, 255, 0.4);
  }
`

const FeatureCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  max-width: 400px;
  pointer-events: auto;
  opacity: 0;
  transform: translateY(50px);
  
  h3 {
    font-size: 1.5rem;
    color: ${colors.accent};
    margin-bottom: 1rem;
  }
  
  p {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
  }
`

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 3rem auto;
  pointer-events: auto;
`

const StatCard = styled(motion.div)`
  text-align: center;
  opacity: 0;
  transform: translateY(30px);
  
  .number {
    font-size: 3rem;
    font-weight: bold;
    color: ${colors.accent};
    text-shadow: 0 0 20px rgba(255, 217, 61, 0.5);
  }
  
  .label {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    margin-top: 0.5rem;
  }
`

// 3D Utility Functions
const lerp = (start: number, end: number, factor: number) => {
  return start + (end - start) * factor
}

const getColorFromProgress = (progress: number) => {
  const colorStops = [
    { at: 0, color: colors.primary },
    { at: 0.25, color: colors.secondary },
    { at: 0.5, color: colors.purple },
    { at: 0.75, color: colors.pink },
    { at: 1, color: colors.accent }
  ]
  
  for (let i = 0; i < colorStops.length - 1; i++) {
    if (progress >= colorStops[i].at && progress <= colorStops[i + 1].at) {
      const localProgress = (progress - colorStops[i].at) / (colorStops[i + 1].at - colorStops[i].at)
      return new THREE.Color(colorStops[i].color).lerp(new THREE.Color(colorStops[i + 1].color), localProgress)
    }
  }
  
  return new THREE.Color(colorStops[colorStops.length - 1].color)
}

// 3Dオブジェクトコンポーネント
function ScrollSyncedObject({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const groupRef = useRef<THREE.Group>(null!)
  const trailRef = useRef<THREE.Group>(null!)
  
  useFrame((state) => {
    if (meshRef.current && groupRef.current) {
      // スクロール進行度に基づいてオブジェクトを変形
      meshRef.current.rotation.x = scrollProgress * Math.PI * 4
      meshRef.current.rotation.y = scrollProgress * Math.PI * 2
      
      // カメラの位置もスクロールに同期
      const cameraZ = 5 - scrollProgress * 3
      const cameraY = scrollProgress * 2
      const cameraX = Math.sin(scrollProgress * Math.PI * 2) * 3
      
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, cameraX, 0.1)
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, cameraY, 0.1)
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, cameraZ, 0.1)
      state.camera.lookAt(0, 0, 0)
      
      // グループ全体の回転
      groupRef.current.rotation.y = scrollProgress * Math.PI * 0.5
    }
  })
  
  // スクロール位置に応じて表示するオブジェクトを切り替え
  const objectStage = Math.floor(scrollProgress * 7)
  const stageProgress = (scrollProgress * 7) % 1
  const currentColor = getColorFromProgress(scrollProgress)
  
  return (
    <group ref={groupRef}>
      {/* Stage 0: 初期状態 - シンプルなキューブ */}
      {objectStage === 0 && (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <Box ref={meshRef} args={[2, 2, 2]}>
            <MeshDistortMaterial
              color={currentColor}
              speed={2}
              distort={0.3 + stageProgress * 0.2}
              radius={1}
              metalness={0.8}
              roughness={0.2}
            />
            <Edges color="white" linewidth={2} />
          </Box>
        </Float>
      )}
      
      {/* Stage 1: 成長 - 複雑な形状へ */}
      {objectStage === 1 && (
        <Float speed={3} rotationIntensity={0.7} floatIntensity={1.5}>
          <TorusKnot ref={meshRef} args={[1.5, 0.5, 128, 16]}>
            <MeshDistortMaterial
              color={currentColor}
              speed={3}
              distort={0.4 + stageProgress * 0.2}
              radius={1}
              metalness={0.6}
              roughness={0.3}
            />
          </TorusKnot>
          <Sparkles count={100} scale={5} size={2} speed={0.5} color={currentColor} />
        </Float>
      )}
      
      {/* Stage 2: 変革 - 有機的な形状 */}
      {objectStage === 2 && (
        <Float speed={4} rotationIntensity={1} floatIntensity={2}>
          <Sphere ref={meshRef} args={[2, 64, 64]}>
            <MeshDistortMaterial
              color={currentColor}
              speed={5}
              distort={0.6 + stageProgress * 0.3}
              radius={1}
              metalness={0.4}
              roughness={0.4}
            />
          </Sphere>
          <Trail
            width={5}
            length={20}
            color={currentColor}
            attenuation={(t) => t * t}
          >
            <Sphere args={[0.3]}>
              <meshBasicMaterial color={currentColor} />
            </Sphere>
          </Trail>
        </Float>
      )}
      
      {/* Stage 3: 結晶化 - 多面体 */}
      {objectStage === 3 && (
        <Float speed={5} rotationIntensity={1.2} floatIntensity={2.5}>
          <mesh ref={meshRef}>
            <icosahedronGeometry args={[2, 0]} />
            <meshStandardMaterial
              color={currentColor}
              metalness={0.9}
              roughness={0.1}
              emissive={currentColor}
              emissiveIntensity={0.5}
            />
          </mesh>
          <Octahedron args={[3, 0]} position={[0, 0, 0]}>
            <meshBasicMaterial color={currentColor} wireframe opacity={0.3} transparent />
          </Octahedron>
        </Float>
      )}
      
      {/* Stage 4: 拡張 - 複合構造 */}
      {objectStage === 4 && (
        <group>
          <Float speed={2} rotationIntensity={0.5}>
            <RoundedBox ref={meshRef} args={[2, 2, 2]} radius={0.2}>
              <MeshTransmissionMaterial
                backside
                samples={16}
                resolution={512}
                transmission={0.98}
                roughness={0.0}
                thickness={0.5}
                ior={1.5}
                chromaticAberration={0.06}
                color={currentColor}
              />
            </RoundedBox>
          </Float>
          <Ring args={[2.5, 3, 32]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color={currentColor} metalness={0.8} roughness={0.2} />
          </Ring>
        </group>
      )}
      
      {/* Stage 5: 進化 - 抽象的な形状 */}
      {objectStage === 5 && (
        <group>
          <Float speed={3} floatIntensity={2}>
            <Cone ref={meshRef} args={[1.5, 3, 8]} rotation={[0, 0, Math.PI]}>
              <GradientTexture
                stops={[0, 0.5, 1]}
                colors={[colors.primary, currentColor.getStyle(), colors.accent]}
              />
            </Cone>
          </Float>
          <Cylinder args={[0.5, 2, 3, 32]} position={[0, -2, 0]}>
            <meshStandardMaterial color={currentColor} metalness={0.7} roughness={0.3} />
          </Cylinder>
        </group>
      )}
      
      {/* Stage 6+: 完成 - 輝く結晶群 */}
      {objectStage >= 6 && (
        <group>
          <Float speed={5} rotationIntensity={1.5} floatIntensity={3}>
            <mesh ref={meshRef}>
              <dodecahedronGeometry args={[2, 0]} />
              <meshStandardMaterial
                color={colors.accent}
                metalness={0.95}
                roughness={0.05}
                emissive={colors.accent}
                emissiveIntensity={0.7}
              />
            </mesh>
          </Float>
          {/* 周回する小さな結晶 */}
          {[...Array(6)].map((_, i) => (
            <mesh key={i} position={[
              Math.cos(i * Math.PI / 3) * 4,
              Math.sin(i * Math.PI / 3) * 0.5,
              Math.sin(i * Math.PI / 3) * 4
            ]}>
              <tetrahedronGeometry args={[0.5, 0]} />
              <meshStandardMaterial
                color={colors.accent}
                metalness={0.9}
                roughness={0.1}
                emissive={colors.accent}
                emissiveIntensity={0.3}
              />
            </mesh>
          ))}
        </group>
      )}
      
      {/* パーティクル効果 */}
      {scrollProgress > 0.3 && (
        <Sparkles
          count={200}
          scale={10}
          size={3}
          speed={1}
          color={currentColor}
          opacity={scrollProgress}
        />
      )}
      
      {/* 背景の星 */}
      {scrollProgress > 0.5 && (
        <Stars
          radius={30}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={scrollProgress * 2}
        />
      )}
    </group>
  )
}

// テキスト3Dコンポーネント
function Text3DElement({ scrollProgress }: { scrollProgress: number }) {
  const textRef = useRef<THREE.Mesh>(null!)
  const messages = [
    "DREAM",
    "BUILD",
    "INNOVATE",
    "TRANSFORM",
    "SUCCEED",
    "INSPIRE",
    "CREATE"
  ]
  
  const currentMessage = messages[Math.floor(scrollProgress * messages.length)] || messages[0]
  
  useFrame((state) => {
    if (textRef.current) {
      textRef.current.rotation.y = state.clock.elapsedTime * 0.1
      textRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2
    }
  })
  
  return (
    <Center position={[0, 3, -5]}>
      <Text3D
        ref={textRef}
        font="/fonts/helvetiker_bold.typeface.json"
        size={1}
        height={0.2}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.02}
        bevelSize={0.02}
        bevelOffset={0}
        bevelSegments={5}
      >
        {currentMessage}
        <meshStandardMaterial
          color={getColorFromProgress(scrollProgress)}
          metalness={0.8}
          roughness={0.2}
          emissive={getColorFromProgress(scrollProgress)}
          emissiveIntensity={0.3}
        />
      </Text3D>
    </Center>
  )
}

// 背景環境コンポーネント
function ScrollEnvironment({ scrollProgress }: { scrollProgress: number }) {
  const cloudsRef = useRef<THREE.Group>(null!)
  const planesRef = useRef<THREE.Group>(null!)
  
  useFrame((state) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.001
      cloudsRef.current.position.y = -5 + scrollProgress * 10
    }
    if (planesRef.current) {
      planesRef.current.rotation.z = state.clock.elapsedTime * 0.05
    }
  })
  
  return (
    <>
      {/* 動的な照明 */}
      <ambientLight intensity={0.3 + scrollProgress * 0.5} />
      <spotLight
        position={[10, 10, 5]}
        angle={0.15}
        penumbra={1}
        intensity={scrollProgress * 2}
        color={colors.primary}
        castShadow
      />
      <pointLight
        position={[-10, -10, -10]}
        intensity={scrollProgress * 1.5}
        color={colors.danger}
      />
      <pointLight
        position={[0, 10, 0]}
        intensity={scrollProgress * 1}
        color={colors.accent}
      />
      
      {/* 反射する床 */}
      <Plane args={[50, 50]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
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
          mirror={0}
        />
      </Plane>
      
      {/* 雲のレイヤー */}
      <group ref={cloudsRef}>
        <Cloud
          position={[0, -5, -10]}
          opacity={0.5}
          speed={0.4}
        />
        <Cloud
          position={[10, -3, -5]}
          opacity={0.3}
          speed={0.5}
        />
        <Cloud
          position={[-10, -4, -8]}
          opacity={0.4}
          speed={0.3}
        />
      </group>
      
      {/* 装飾的な平面 */}
      <group ref={planesRef}>
        {[...Array(5)].map((_, i) => (
          <Plane
            key={i}
            args={[2, 2]}
            position={[
              Math.cos(i * Math.PI * 0.4) * 15,
              Math.sin(i * Math.PI * 0.4) * 5,
              -10 - i * 2
            ]}
            rotation={[0, Math.PI * i * 0.2, 0]}
          >
            <meshStandardMaterial
              color={getColorFromProgress((scrollProgress + i * 0.1) % 1)}
              metalness={0.7}
              roughness={0.3}
              opacity={0.3}
              transparent
            />
          </Plane>
        ))}
      </group>
      
      {/* 環境マップ */}
      <Environment preset={scrollProgress < 0.5 ? "night" : "sunset"} />
      
      {/* コンタクトシャドウ */}
      <ContactShadows
        position={[0, -5, 0]}
        opacity={0.6}
        scale={20}
        blur={2}
        far={10}
      />
    </>
  )
}

// インタラクティブオブジェクト
function InteractiveElements({ scrollProgress }: { scrollProgress: number }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  const skills = [
    { name: "AI活用", icon: "🤖", position: [-5, 2, 0] as [number, number, number] },
    { name: "NoCode", icon: "🔧", position: [5, 2, 0] as [number, number, number] },
    { name: "自動化", icon: "⚡", position: [0, 2, 5] as [number, number, number] },
    { name: "データ分析", icon: "📊", position: [-3, -2, 3] as [number, number, number] },
    { name: "マーケティング", icon: "📈", position: [3, -2, 3] as [number, number, number] }
  ]
  
  return (
    <group visible={scrollProgress > 0.4}>
      {skills.map((skill, index) => (
        <Float key={index} speed={2 + index * 0.5} floatIntensity={1}>
          <mesh
            position={skill.position}
            onPointerOver={() => setHoveredIndex(index)}
            onPointerOut={() => setHoveredIndex(null)}
            scale={hoveredIndex === index ? 1.5 : 1}
          >
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial
              color={hoveredIndex === index ? colors.accent : colors.primary}
              metalness={0.7}
              roughness={0.3}
              emissive={hoveredIndex === index ? colors.accent : colors.primary}
              emissiveIntensity={hoveredIndex === index ? 0.5 : 0.2}
            />
            {hoveredIndex === index && (
              <Html center>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  whiteSpace: 'nowrap'
                }}>
                  <span style={{ fontSize: '20px', marginRight: '8px' }}>{skill.icon}</span>
                  {skill.name}
                </div>
              </Html>
            )}
          </mesh>
        </Float>
      ))}
    </group>
  )
}

// 3Dシーンコンポーネント
function Scene({ scrollProgress }: { scrollProgress: number }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
      <Suspense fallback={null}>
        <ScrollSyncedObject scrollProgress={scrollProgress} />
        <ScrollEnvironment scrollProgress={scrollProgress} />
        <InteractiveElements scrollProgress={scrollProgress} />
        {scrollProgress > 0.2 && <Text3DElement scrollProgress={scrollProgress} />}
      </Suspense>
    </>
  )
}

// セクションデータ
const sections = [
  {
    id: 'start',
    title: "起業の旅が始まる",
    text: "一つのアイデアから、無限の可能性へ。AIDXschoolで、あなたの起業ストーリーが今、動き出します。",
    features: [
      { title: "AIツール習得", description: "ChatGPT、Claude、Midjourney等の最新AIツールをマスター" },
      { title: "ノーコード開発", description: "Bubble、Zapier、Makeを使った高速開発手法" },
      { title: "自動化戦略", description: "業務効率を10倍にする自動化システムの構築" }
    ]
  },
  {
    id: 'skills',
    title: "スキルが形を成す",
    text: "AI、ノーコード、自動化。最新テクノロジーを習得し、あなたのビジネスアイデアに命を吹き込みます。",
    stats: [
      { number: "50+", label: "習得可能なツール" },
      { number: "200+", label: "実践的なレッスン" },
      { number: "1000+", label: "成功事例" }
    ]
  },
  {
    id: 'transform',
    title: "変革の瞬間",
    text: "学んだ知識が実践力に変わる瞬間。プロトタイプから実際のビジネスへ、大きな飛躍を遂げます。",
    testimonials: [
      { name: "山田太郎", role: "AIコンサルタント", text: "3ヶ月で月収150万円を達成。AIツールの活用で業務効率が劇的に向上しました。" },
      { name: "佐藤花子", role: "ECサイト運営", text: "ノーコードで構築したECサイトが月商500万円を突破。開発コストは90%削減できました。" }
    ]
  },
  {
    id: 'success',
    title: "成功への到達",
    text: "月収100万円を超え、時間と場所に縛られない自由な生活。あなたの努力が結実する瞬間です。",
    achievements: [
      "時間的自由の獲得",
      "経済的自立の実現",
      "社会的インパクトの創出",
      "次世代スキルの習得"
    ]
  },
  {
    id: 'future',
    title: "新たな地平線",
    text: "成功は終わりではなく、始まり。次世代の起業家として、新たな価値を創造し続けます。",
    nextSteps: [
      "AIビジネスのスケーリング",
      "グローバル市場への展開",
      "新規事業の立ち上げ",
      "起業家コミュニティの形成"
    ]
  },
  {
    id: 'pricing',
    title: "投資対効果の最大化",
    text: "あなたの成功に必要な全てを、最適な価格でご提供します。",
    plans: [
      {
        name: "ベーシックプラン",
        price: "198,000円",
        features: [
          "基礎カリキュラム完全アクセス",
          "AIツール基本講座",
          "月2回のグループコンサル",
          "専用Slackコミュニティ"
        ]
      },
      {
        name: "プロフェッショナルプラン",
        price: "498,000円",
        features: [
          "全カリキュラム完全アクセス",
          "1対1個別コンサル月4回",
          "実践プロジェクト支援",
          "ビジネスマッチング機会"
        ]
      },
      {
        name: "エンタープライズプラン",
        price: "1,980,000円",
        features: [
          "完全カスタマイズカリキュラム",
          "週次個別コンサル",
          "事業立ち上げ完全支援",
          "投資家ネットワークアクセス"
        ]
      }
    ]
  },
  {
    id: 'action',
    title: "今すぐ始めよう",
    text: "あなたの起業の夢を、今この瞬間から現実に変えましょう。",
    cta: {
      primary: "無料相談を予約する",
      secondary: "資料をダウンロード"
    }
  },
  {
    id: 'faq',
    title: "よくあるご質問",
    text: "起業への第一歩を踏み出す前に、疑問を解消しましょう。",
    items: [
      {
        question: "プログラミング経験がなくても大丈夫ですか？",
        answer: "はい、全く問題ありません。AIDXschoolではノーコードツールを中心に学ぶため、プログラミング経験は不要です。"
      },
      {
        question: "どれくらいの期間で成果が出ますか？",
        answer: "個人差はありますが、多くの受講生が3-6ヶ月で最初の収益を上げています。継続的な学習と実践が鍵となります。"
      },
      {
        question: "サポート体制はどうなっていますか？",
        answer: "専任メンターによる個別サポート、24時間対応のコミュニティ、定期的なグループセッションなど、充実したサポート体制を整えています。"
      }
    ]
  }
]

// メインコンポーネント
export default function ScrollSync3DScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [progressWidth, setProgressWidth] = useState(0)
  const [activeSection, setActiveSection] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  // スムーズスクロール関数
  const scrollToSection = useCallback((index: number) => {
    const targetY = (index / (sections.length - 1)) * (containerRef.current?.scrollHeight || 0)
    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    })
  }, [])
  
  useEffect(() => {
    // ローディング完了
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])
  
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // スクロール進行度の追跡
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          setScrollProgress(self.progress)
          setProgressWidth(self.progress * 100)
          setActiveSection(Math.floor(self.progress * (sections.length - 1)))
        }
      })
      
      // 各セクションのアニメーション
      sections.forEach((_, index) => {
        const sectionEl = containerRef.current?.querySelector(`#section-${index}`)
        const titleEl = sectionEl?.querySelector('h2')
        const textEl = sectionEl?.querySelector('p')
        const featuresEl = sectionEl?.querySelectorAll('.feature-card')
        const statsEl = sectionEl?.querySelectorAll('.stat-card')
        
        if (titleEl && textEl) {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionEl,
              start: 'top center',
              end: 'bottom center',
              toggleActions: 'play reverse play reverse'
            }
          })
          
          tl.to(titleEl, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out'
          })
          .to(textEl, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out'
          }, '-=0.5')
          
          // フィーチャーカードのアニメーション
          if (featuresEl?.length) {
            featuresEl.forEach((el, i) => {
              tl.to(el, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out'
              }, `-=0.6`)
            })
          }
          
          // 統計カードのアニメーション
          if (statsEl?.length) {
            statsEl.forEach((el, i) => {
              tl.to(el, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out'
              }, `-=0.6`)
            })
          }
        }
      })
      
      // パララックス効果
      gsap.utils.toArray('.parallax-element').forEach((el: any) => {
        gsap.to(el, {
          yPercent: -50,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        })
      })
      
    }, containerRef)
    
    return () => ctx.revert()
  }, [])
  
  if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: colors.dark,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{
            width: '100px',
            height: '100px',
            border: `4px solid ${colors.primary}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </motion.div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }
  
  return (
    <Container ref={containerRef}>
      {/* プログレスバー */}
      <ProgressBar>
        <ProgressFill style={{ width: `${progressWidth}%` }} />
      </ProgressBar>
      
      {/* ナビゲーションドット */}
      <FloatingNav>
        {sections.map((section, index) => (
          <NavDot
            key={section.id}
            active={activeSection === index}
            onClick={() => scrollToSection(index)}
            data-label={section.title}
            aria-label={section.title}
          />
        ))}
      </FloatingNav>
      
      {/* 3Dシーン（固定） */}
      <CanvasContainer>
        <Canvas shadows dpr={[1, 2]}>
          <Scene scrollProgress={scrollProgress} />
        </Canvas>
      </CanvasContainer>
      
      {/* コンテンツオーバーレイ */}
      <ContentOverlay>
        {sections.map((section, index) => (
          <Section key={index} id={`section-${index}`}>
            <SectionTitle>{section.title}</SectionTitle>
            <SectionText>{section.text}</SectionText>
            
            {/* フィーチャーカード */}
            {section.features && (
              <div style={{
                display: 'flex',
                gap: '2rem',
                marginTop: '3rem',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                {section.features.map((feature, i) => (
                  <FeatureCard
                    key={i}
                    className="feature-card"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </FeatureCard>
                ))}
              </div>
            )}
            
            {/* 統計情報 */}
            {section.stats && (
              <StatsContainer>
                {section.stats.map((stat, i) => (
                  <StatCard key={i} className="stat-card">
                    <div className="number">{stat.number}</div>
                    <div className="label">{stat.label}</div>
                  </StatCard>
                ))}
              </StatsContainer>
            )}
            
            {/* お客様の声 */}
            {section.testimonials && (
              <div style={{
                display: 'grid',
                gap: '2rem',
                marginTop: '3rem',
                maxWidth: '800px',
                margin: '3rem auto'
              }}>
                {section.testimonials.map((testimonial, i) => (
                  <FeatureCard key={i} className="feature-card">
                    <p style={{ fontStyle: 'italic', marginBottom: '1rem' }}>
                      "{testimonial.text}"
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 'bold'
                      }}>
                        {testimonial.name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{testimonial.name}</div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>{testimonial.role}</div>
                      </div>
                    </div>
                  </FeatureCard>
                ))}
              </div>
            )}
            
            {/* 達成項目 */}
            {section.achievements && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginTop: '3rem',
                maxWidth: '800px',
                margin: '3rem auto'
              }}>
                {section.achievements.map((achievement, i) => (
                  <motion.div
                    key={i}
                    className="feature-card"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      padding: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <div style={{
                      fontSize: '2rem',
                      width: '50px',
                      height: '50px',
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      ✓
                    </div>
                    <span style={{ flex: 1 }}>{achievement}</span>
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* 次のステップ */}
            {section.nextSteps && (
              <div style={{
                display: 'grid',
                gap: '1rem',
                marginTop: '3rem',
                maxWidth: '600px',
                margin: '3rem auto'
              }}>
                {section.nextSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    className="feature-card"
                    style={{
                      background: `linear-gradient(135deg, rgba(78, 181, 255, 0.1), rgba(56, 193, 114, 0.1))`,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(78, 181, 255, 0.3)',
                      borderRadius: '15px',
                      padding: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      cursor: 'pointer'
                    }}
                    whileHover={{ x: 10, borderColor: 'rgba(78, 181, 255, 0.5)' }}
                  >
                    <div style={{
                      fontSize: '1.5rem',
                      color: colors.primary
                    }}>
                      {i + 1}.
                    </div>
                    <span style={{ flex: 1, fontSize: '1.1rem' }}>{step}</span>
                    <div style={{ color: colors.primary }}>→</div>
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* 料金プラン */}
            {section.plans && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginTop: '3rem',
                maxWidth: '1200px',
                margin: '3rem auto'
              }}>
                {section.plans.map((plan, i) => (
                  <motion.div
                    key={i}
                    className="feature-card"
                    style={{
                      background: i === 1 
                        ? `linear-gradient(135deg, rgba(78, 181, 255, 0.2), rgba(56, 193, 114, 0.2))`
                        : 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: i === 1
                        ? '2px solid rgba(78, 181, 255, 0.5)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '20px',
                      padding: '2.5rem',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    whileHover={{ y: -10, borderColor: 'rgba(78, 181, 255, 0.7)' }}
                  >
                    {i === 1 && (
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '-2rem',
                        background: colors.accent,
                        color: colors.dark,
                        padding: '0.5rem 3rem',
                        transform: 'rotate(45deg)',
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}>
                        人気No.1
                      </div>
                    )}
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{plan.name}</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: colors.primary, marginBottom: '2rem' }}>
                      {plan.price}
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {plan.features.map((feature, j) => (
                        <li key={j} style={{
                          padding: '0.75rem 0',
                          borderBottom: j < plan.features.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span style={{ color: colors.secondary }}>✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <CTAButton
                      style={{ marginTop: '2rem', width: '100%' }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      このプランを選ぶ
                    </CTAButton>
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* CTA */}
            {section.cta && (
              <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <CTAButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {section.cta.primary}
                </CTAButton>
                <motion.button
                  style={{
                    padding: '1.5rem 3rem',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: 'white',
                    background: 'transparent',
                    border: `2px solid ${colors.primary}`,
                    borderRadius: '50px',
                    cursor: 'pointer',
                    marginLeft: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                  whileHover={{
                    backgroundColor: 'rgba(78, 181, 255, 0.1)',
                    borderColor: colors.secondary
                  }}
                >
                  {section.cta.secondary}
                </motion.button>
              </div>
            )}
            
            {/* FAQ */}
            {section.items && (
              <div style={{
                maxWidth: '800px',
                margin: '3rem auto'
              }}>
                {section.items.map((item, i) => (
                  <motion.details
                    key={i}
                    className="feature-card"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '15px',
                      padding: '1.5rem',
                      marginBottom: '1rem',
                      cursor: 'pointer'
                    }}
                    whileHover={{ borderColor: 'rgba(78, 181, 255, 0.3)' }}
                  >
                    <summary style={{
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      marginBottom: '1rem',
                      listStyle: 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      {item.question}
                      <span style={{ fontSize: '1.5rem', color: colors.primary }}>+</span>
                    </summary>
                    <p style={{ lineHeight: 1.8, opacity: 0.8 }}>{item.answer}</p>
                  </motion.details>
                ))}
              </div>
            )}
          </Section>
        ))}
      </ContentOverlay>
    </Container>
  )
}