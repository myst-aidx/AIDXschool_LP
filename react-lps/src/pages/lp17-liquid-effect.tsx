// LP17: リキッドエフェクト - 流動的で有機的なインタラクション
// AIDXschool AI×DX起業塾 - 変化に適応する次世代起業家を育成

import { useEffect, useRef, useState, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'
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

const liquidMove = keyframes`
  0%, 100% {
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    transform: scale(1) rotate(0deg);
  }
  25% {
    border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
    transform: scale(1.1) rotate(90deg);
  }
  50% {
    border-radius: 50% 60% 30% 60% / 60% 40% 60% 30%;
    transform: scale(0.9) rotate(180deg);
  }
  75% {
    border-radius: 60% 40% 60% 30% / 30% 60% 40% 70%;
    transform: scale(1.05) rotate(270deg);
  }
`

const flow = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100vw);
  }
`

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
`

const morphing = keyframes`
  0% {
    filter: blur(0px) hue-rotate(0deg);
    transform: scale(1);
  }
  25% {
    filter: blur(5px) hue-rotate(90deg);
    transform: scale(1.1);
  }
  50% {
    filter: blur(3px) hue-rotate(180deg);
    transform: scale(0.9);
  }
  75% {
    filter: blur(7px) hue-rotate(270deg);
    transform: scale(1.05);
  }
  100% {
    filter: blur(0px) hue-rotate(360deg);
    transform: scale(1);
  }
`

// スタイルコンポーネント
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    180deg,
    ${colors.dark} 0%,
    #0f0f23 10%,
    #1a1a2e 20%,
    #16213e 30%,
    #0f3460 40%,
    #533483 50%,
    #e94560 60%,
    #ff6b6b 70%,
    #ffb74d 80%,
    ${colors.accent} 90%,
    ${colors.secondary} 100%
  );
  overflow-x: hidden;
  position: relative;
`

const LiquidCanvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
  pointer-events: none;
`

const Section = styled.section<{ bgColor?: string }>`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  padding: 4rem 2rem;
  background: ${props => props.bgColor || 'transparent'};
  
  &[data-section-id] {
    scroll-margin-top: 100px;
  }
`

const Title = styled.h1`
  font-size: clamp(3rem, 10vw, 8rem);
  font-weight: 900;
  color: #ffffff;
  text-align: center;
  margin: 0 0 2rem 0;
  mix-blend-mode: difference;
  position: relative;
  z-index: 20;
  animation: ${liquidMove} 8s ease-in-out infinite;
  background: ${colors.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 30px rgba(78, 181, 255, 0.3));
`

const SectionTitle = styled.h2`
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 800;
  color: ${colors.light};
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  
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
    animation: ${flow} 3s ease-in-out infinite;
  }
`

const LiquidText = styled.div`
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 900;
  color: transparent;
  -webkit-text-stroke: 2px ${colors.primary};
  text-stroke: 2px ${colors.primary};
  text-align: center;
  position: relative;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation: ${morphing} 6s ease-in-out infinite;
  
  &:hover {
    -webkit-text-stroke: 2px ${colors.secondary};
    text-stroke: 2px ${colors.secondary};
    transform: scale(1.1);
  }
`

const BlobContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 5;
  pointer-events: none;
  filter: blur(40px);
`

const Blob = styled.div<{ color: string; size: number }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: ${props => props.color};
  border-radius: 50%;
  mix-blend-mode: screen;
  will-change: transform;
  animation: ${liquidMove} 10s ease-in-out infinite;
  
  &:nth-child(2) {
    animation-delay: -2s;
  }
  &:nth-child(3) {
    animation-delay: -4s;
  }
  &:nth-child(4) {
    animation-delay: -6s;
  }
  &:nth-child(5) {
    animation-delay: -8s;
  }
`

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  padding: 3rem;
  margin: 2rem;
  max-width: 500px;
  position: relative;
  overflow: hidden;
  z-index: 20;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(78, 181, 255, 0.1) 0%, transparent 70%);
    animation: ${liquidMove} 20s linear infinite;
  }
  
  &:hover {
    transform: translateY(-10px) scale(1.05);
    border-color: ${colors.primary};
    box-shadow: 0 20px 40px rgba(78, 181, 255, 0.2);
  }
`

const FeatureTitle = styled.h3`
  font-size: 2rem;
  color: ${colors.primary};
  margin: 0 0 1rem 0;
  position: relative;
  font-weight: 700;
`

const FeatureText = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.8;
  position: relative;
`

const LiquidButton = styled.button`
  font-size: 1.2rem;
  font-weight: 600;
  padding: 1.5rem 3rem;
  background: transparent;
  color: ${colors.primary};
  border: 2px solid ${colors.primary};
  border-radius: 50px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 20;
  margin: 2rem;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: ${colors.primary};
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    z-index: -1;
  }
  
  &:hover {
    color: ${colors.dark};
    transform: scale(1.1);
    
    &::before {
      width: 300px;
      height: 300px;
    }
  }
  
  span {
    position: relative;
    z-index: 1;
  }
`

const GooeyFilter = styled.svg`
  position: absolute;
  width: 0;
  height: 0;
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

const FlowingParticle = styled.div`
  position: absolute;
  width: 4px;
  height: 4px;
  background: ${colors.primary};
  border-radius: 50%;
  opacity: 0.7;
  animation: ${flow} 8s linear infinite;
  
  &:nth-child(odd) {
    background: ${colors.secondary};
    animation-duration: 12s;
  }
  
  &:nth-child(3n) {
    background: ${colors.accent};
    animation-duration: 10s;
  }
`

const LiquidShape = styled.div`
  position: absolute;
  width: 200px;
  height: 200px;
  background: linear-gradient(45deg, ${colors.primary}40, ${colors.secondary}40);
  border-radius: 50%;
  animation: ${liquidMove} 15s ease-in-out infinite;
  mix-blend-mode: multiply;
  filter: blur(20px);
`

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    animation: ${flow} 3s ease-in-out infinite;
  }
`

const StatNumber = styled.div`
  font-size: 3rem;
  font-weight: 900;
  color: ${colors.primary};
  margin-bottom: 0.5rem;
  animation: ${pulse} 2s ease-in-out infinite;
`

const StatLabel = styled.div`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
`

const PriceCard = styled.div<{ featured?: boolean }>`
  background: ${props => props.featured 
    ? 'linear-gradient(135deg, rgba(78, 181, 255, 0.1), rgba(56, 193, 114, 0.1))'
    : 'rgba(255, 255, 255, 0.05)'
  };
  backdrop-filter: blur(20px);
  border: 2px solid ${props => props.featured ? colors.primary : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 30px;
  padding: 3rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform: ${props => props.featured ? 'scale(1.05)' : 'scale(1)'};
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: ${props => props.featured ? colors.gradient : 'transparent'};
    border-radius: 30px;
    z-index: -1;
    opacity: ${props => props.featured ? 1 : 0};
    animation: ${props => props.featured ? `${liquidMove} 8s ease-in-out infinite` : 'none'};
  }
  
  &:hover {
    transform: translateY(-10px) scale(1.05);
    border-color: ${colors.primary};
  }
`

const Price = styled.div`
  font-size: 3rem;
  font-weight: 900;
  color: ${colors.primary};
  margin: 1rem 0;
  
  span {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.6);
  }
`

const ToolsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
`

const ToolCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
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
  
  &:hover {
    transform: translateY(-5px);
    border-color: ${colors.primary};
    
    &::before {
      transform: scaleX(1);
    }
  }
`

const TestimonialCard = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  padding: 2.5rem;
  margin: 1rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '"';
    position: absolute;
    top: -10px;
    left: 20px;
    font-size: 8rem;
    color: ${colors.primary};
    opacity: 0.3;
    font-family: serif;
  }
`

const TimelineContainer = styled.div`
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${colors.gradient};
    transform: translateX(-50%);
  }
`

const TimelineItem = styled.div<{ align: 'left' | 'right' }>`
  display: flex;
  justify-content: ${props => props.align === 'left' ? 'flex-end' : 'flex-start'};
  padding: 2rem 0;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 2.5rem;
    width: 20px;
    height: 20px;
    background: ${colors.primary};
    border: 3px solid ${colors.dark};
    border-radius: 50%;
    transform: translateX(-50%);
    animation: ${pulse} 2s ease-in-out infinite;
  }
`

const TimelineContent = styled.div<{ align: 'left' | 'right' }>`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 2rem;
  width: 45%;
  margin-${props => props.align}: 3rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 2rem;
    ${props => props.align}: -10px;
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-${props => props.align === 'left' ? 'left' : 'right'}: 10px solid rgba(255, 255, 255, 0.05);
  }
`

const FAQItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  margin: 1rem 0;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${colors.primary};
  }
`

const FAQQuestion = styled.button`
  width: 100%;
  padding: 1.5rem 2rem;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`

const FAQAnswer = styled.div<{ isOpen: boolean }>`
  max-height: ${props => props.isOpen ? '200px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  padding: ${props => props.isOpen ? '0 2rem 1.5rem' : '0 2rem'};
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
`

// リキッドアニメーションのカスタムフック
const useLiquidEffect = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // キャンバスサイズの設定
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    
    // パーティクルクラス
    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      color: string
      hue: number
      
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * 3
        this.vy = (Math.random() - 0.5) * 3
        this.radius = Math.random() * 80 + 30
        this.hue = Math.random() * 360
        this.color = `hsla(${this.hue}, 70%, 60%, 0.4)`
      }
      
      update() {
        this.x += this.vx
        this.y += this.vy
        
        // 画面端で反射
        if (this.x < this.radius || this.x > canvas.width - this.radius) {
          this.vx *= -1
        }
        if (this.y < this.radius || this.y > canvas.height - this.radius) {
          this.vy *= -1
        }
        
        // 色相を徐々に変化
        this.hue += 0.5
        this.color = `hsla(${this.hue}, 70%, 60%, 0.4)`
      }
      
      draw() {
        if (!ctx) return
        
        // グラデーションの作成
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.radius
        )
        gradient.addColorStop(0, this.color.replace('0.4', '0.8'))
        gradient.addColorStop(0.5, this.color.replace('0.4', '0.4'))
        gradient.addColorStop(1, this.color.replace('0.4', '0'))
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fill()
        
        // メタボール効果のためのブラー
        ctx.filter = 'blur(5px)'
        ctx.globalCompositeOperation = 'screen'
      }
    }
    
    // パーティクルの配列
    const particles: Particle[] = []
    for (let i = 0; i < 8; i++) {
      particles.push(new Particle())
    }
    
    // アニメーションループ
    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.filter = 'none'
      ctx.globalCompositeOperation = 'source-over'
      
      // パーティクルの更新と描画
      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })
      
      animationId = requestAnimationFrame(animate)
    }
    animate()
    
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [canvasRef])
}

// メインコンポーネント
export default function LiquidEffect() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [activeSection, setActiveSection] = useState(0)
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  
  // リキッドエフェクトの初期化
  useLiquidEffect(canvasRef)
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      // ブロブのアニメーション
      const blobs = containerRef.current?.querySelectorAll('.blob')
      if (blobs) {
        blobs.forEach((blob, index) => {
          gsap.to(blob, {
            x: `random(-300, 300)`,
            y: `random(-300, 300)`,
            duration: `random(15, 25)`,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: index * 0.7
          })
        })
      }
      
      // スクロールトリガーアニメーション
      gsap.utils.toArray('.feature-card').forEach((card: any, index) => {
        gsap.fromTo(card,
          {
            opacity: 0,
            y: 100,
            scale: 0.8,
            rotation: 10
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotation: 0,
            duration: 1.2,
            ease: 'elastic.out(1, 0.8)',
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      })
      
      // テキストの波動アニメーション
      const liquidTexts = containerRef.current?.querySelectorAll('.liquid-text')
      if (liquidTexts) {
        liquidTexts.forEach((text) => {
          gsap.to(text, {
            skewX: 'random(-15, 15)',
            skewY: 'random(-8, 8)',
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          })
        })
      }
      
      // フローティングパーティクル
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div')
        particle.className = 'flowing-particle'
        particle.style.cssText = `
          position: absolute;
          width: ${Math.random() * 6 + 2}px;
          height: ${Math.random() * 6 + 2}px;
          background: ${Math.random() > 0.5 ? colors.primary : colors.secondary};
          border-radius: 50%;
          top: ${Math.random() * 100}%;
          left: -10px;
          opacity: ${Math.random() * 0.8 + 0.2};
          animation: flow ${Math.random() * 10 + 5}s linear infinite;
          animation-delay: ${Math.random() * 5}s;
        `
        containerRef.current?.appendChild(particle)
      }
      
    }, containerRef)
    
    return () => ctx.revert()
  }, [])
  
  // マウストラッキング
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }, [])
  
  // ナビゲーション
  const scrollToSection = (index: number) => {
    const sections = document.querySelectorAll('[data-section-id]')
    sections[index]?.scrollIntoView({ behavior: 'smooth' })
    setActiveSection(index)
  }
  
  // FAQ切り替え
  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }
  
  return (
    <Container ref={containerRef} onMouseMove={handleMouseMove}>
      {/* Gooeyフィルター */}
      <GooeyFilter>
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -15" result="gooey" />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </GooeyFilter>
      
      {/* リキッドキャンバス */}
      <LiquidCanvas ref={canvasRef} />
      
      {/* フローティングナビゲーション */}
      <FloatingNavigation>
        {['ホーム', '特徴', 'ツール', 'コース', '成果', '料金', 'FAQ'].map((label, index) => (
          <NavDot
            key={index}
            active={activeSection === index}
            data-tooltip={label}
            onClick={() => scrollToSection(index)}
          />
        ))}
      </FloatingNavigation>
      
      {/* ブロブ背景 */}
      <BlobContainer>
        <Blob className="blob" color="rgba(78, 181, 255, 0.4)" size={400} style={{ top: '10%', left: '10%' }} />
        <Blob className="blob" color="rgba(56, 193, 114, 0.4)" size={350} style={{ top: '60%', right: '20%' }} />
        <Blob className="blob" color="rgba(255, 107, 107, 0.4)" size={300} style={{ bottom: '20%', left: '30%' }} />
        <Blob className="blob" color="rgba(255, 217, 61, 0.4)" size={280} style={{ top: '40%', right: '40%' }} />
        <Blob className="blob" color="rgba(147, 51, 234, 0.4)" size={320} style={{ bottom: '40%', right: '10%' }} />
      </BlobContainer>
      
      {/* ヒーローセクション */}
      <Section data-section-id="hero">
        <Title>流れるように、変化する</Title>
        <LiquidText className="liquid-text">
          AI×DX起業塾
        </LiquidText>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.8)', 
          fontSize: '1.5rem', 
          textAlign: 'center', 
          marginTop: '2rem',
          maxWidth: '800px',
          lineHeight: '1.8'
        }}>
          変化に柔軟に対応し、新しい形を創造する次世代起業家育成プログラム
          <br />
          流動的なビジネスモデルで、時代の波に乗り続ける
        </p>
        <LiquidButton>
          <span>流れに身を任せる</span>
        </LiquidButton>
      </Section>
      
      {/* 特徴セクション */}
      <Section data-section-id="features" bgColor="rgba(0, 0, 0, 0.3)">
        <SectionTitle>流動する学習体験</SectionTitle>
        <Grid>
          <FeatureCard className="feature-card">
            <FeatureTitle>🌊 アダプティブ・ラーニング</FeatureTitle>
            <FeatureText>
              AIが学習者の進捗と特性を分析し、最適な学習パスを動的に生成。
              従来の固定カリキュラムではなく、あなたに合わせて変化し続ける学習体験。
            </FeatureText>
          </FeatureCard>
          
          <FeatureCard className="feature-card">
            <FeatureTitle>🔄 フレキシブル・ビジネス</FeatureTitle>
            <FeatureText>
              市場の変化に素早く対応できる、流動的なビジネスモデルの構築方法。
              ピボットも成長も、すべてが自然な流れの中で実現可能。
            </FeatureText>
          </FeatureCard>
          
          <FeatureCard className="feature-card">
            <FeatureTitle>💧 リキッド・オートメーション</FeatureTitle>
            <FeatureText>
              硬直化した自動化ではなく、状況に応じて形を変える柔軟な自動化システム。
              NoCodeツールを組み合わせた有機的なワークフロー設計。
            </FeatureText>
          </FeatureCard>
          
          <FeatureCard className="feature-card">
            <FeatureTitle>⚡ リアルタイム・フィードバック</FeatureTitle>
            <FeatureText>
              学習進捗やビジネス指標をリアルタイムで分析し、即座に軌道修正。
              データに基づいた意思決定で、常に最適な方向へ導きます。
            </FeatureText>
          </FeatureCard>
        </Grid>
      </Section>
      
      {/* ツールセクション */}
      <Section data-section-id="tools" bgColor="rgba(78, 181, 255, 0.05)">
        <SectionTitle>流動的ツールエコシステム</SectionTitle>
        <ToolsGrid>
          <ToolCard>
            <h4 style={{ color: colors.primary, marginBottom: '1rem' }}>🤖 ChatGPT Pro</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              高度なプロンプトエンジニアリングと戦略的AI活用
            </p>
          </ToolCard>
          <ToolCard>
            <h4 style={{ color: colors.secondary, marginBottom: '1rem' }}>🔮 Claude 3</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              複雑な分析と長文コンテンツ生成の専門活用
            </p>
          </ToolCard>
          <ToolCard>
            <h4 style={{ color: colors.accent, marginBottom: '1rem' }}>💎 Gemini Ultra</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              マルチモーダルAIによる革新的アプローチ
            </p>
          </ToolCard>
          <ToolCard>
            <h4 style={{ color: colors.purple, marginBottom: '1rem' }}>🎨 Midjourney V6</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              ブランド構築のためのビジュアルアセット生成
            </p>
          </ToolCard>
          <ToolCard>
            <h4 style={{ color: colors.primary, marginBottom: '1rem' }}>🔄 Zapier Advanced</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              数千のアプリ連携による業務完全自動化
            </p>
          </ToolCard>
          <ToolCard>
            <h4 style={{ color: colors.secondary, marginBottom: '1rem' }}>🛠️ Make.com Pro</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              視覚的ワークフロー設計とAPI統合
            </p>
          </ToolCard>
          <ToolCard>
            <h4 style={{ color: colors.accent, marginBottom: '1rem' }}>💬 Bubble Enterprise</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              コードレスWebアプリケーション開発
            </p>
          </ToolCard>
          <ToolCard>
            <h4 style={{ color: colors.danger, marginBottom: '1rem' }}>📊 Notion AI</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              知識管理とプロジェクト運営の一元化
            </p>
          </ToolCard>
        </ToolsGrid>
      </Section>
      
      {/* カリキュラムセクション */}
      <Section data-section-id="curriculum" bgColor="rgba(56, 193, 114, 0.05)">
        <SectionTitle>液状化学習プログラム</SectionTitle>
        <TimelineContainer>
          <TimelineItem align="left">
            <TimelineContent align="left">
              <h4 style={{ color: colors.primary, marginBottom: '1rem' }}>Phase 1: 基盤流動化</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
                固定観念を溶かし、柔軟な思考基盤を構築。AI理解とマインドセット変革から開始。
              </p>
            </TimelineContent>
          </TimelineItem>
          
          <TimelineItem align="right">
            <TimelineContent align="right">
              <h4 style={{ color: colors.secondary, marginBottom: '1rem' }}>Phase 2: ツール融合</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
                各種AIツールとNoCodeプラットフォームを組み合わせた、流動的なワークフロー設計。
              </p>
            </TimelineContent>
          </TimelineItem>
          
          <TimelineItem align="left">
            <TimelineContent align="left">
              <h4 style={{ color: colors.accent, marginBottom: '1rem' }}>Phase 3: ビジネス実装</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
                学んだ技術を実際のビジネスに適用し、収益化フローを構築。
              </p>
            </TimelineContent>
          </TimelineItem>
          
          <TimelineItem align="right">
            <TimelineContent align="right">
              <h4 style={{ color: colors.purple, marginBottom: '1rem' }}>Phase 4: スケール展開</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
                システム化と自動化により、ビジネスの規模拡大と持続的成長を実現。
              </p>
            </TimelineContent>
          </TimelineItem>
        </TimelineContainer>
      </Section>
      
      {/* 成果・実績セクション */}
      <Section data-section-id="results" bgColor="rgba(255, 217, 61, 0.05)">
        <SectionTitle>流動的成果指標</SectionTitle>
        <Grid>
          <StatCard>
            <StatNumber>¥2.8M</StatNumber>
            <StatLabel>平均月商達成額</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>94%</StatNumber>
            <StatLabel>収益化成功率</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>67日</StatNumber>
            <StatLabel>平均収益化期間</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>320%</StatNumber>
            <StatLabel>業務効率化率</StatLabel>
          </StatCard>
        </Grid>
        
        <div style={{ marginTop: '4rem' }}>
          <h3 style={{ color: colors.light, textAlign: 'center', marginBottom: '3rem' }}>
            受講生の流動的成功事例
          </h3>
          <Grid>
            <TestimonialCard>
              <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                「固定概念にとらわれていた私が、3ヶ月で月商450万円の自動化ビジネスを構築。
                AIとNoCodeの組み合わせで、時間に縛られない働き方を実現できました。」
              </p>
              <div style={{ color: colors.primary, fontWeight: '600' }}>
                田中様 (コンサルタント → AI活用事業)
              </div>
            </TestimonialCard>
            
            <TestimonialCard>
              <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                「技術知識ゼロから始めて、2ヶ月目には月収200万円突破。
                柔軟性のあるシステム設計で、市場変化にも素早く対応できています。」
              </p>
              <div style={{ color: colors.secondary, fontWeight: '600' }}>
                佐藤様 (主婦 → AIツール販売)
              </div>
            </TestimonialCard>
            
            <TestimonialCard>
              <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                「従来の硬直的なビジネスモデルから脱却し、流動的なアプローチで年商5000万円を達成。
                常に進化し続けるビジネスを構築できました。」
              </p>
              <div style={{ color: colors.accent, fontWeight: '600' }}>
                山田様 (IT企業経営者)
              </div>
            </TestimonialCard>
          </Grid>
        </div>
      </Section>
      
      {/* 料金プランセクション */}
      <Section data-section-id="pricing" bgColor="rgba(147, 51, 234, 0.05)">
        <SectionTitle>流動的投資プラン</SectionTitle>
        <Grid>
          <PriceCard>
            <h3 style={{ color: colors.primary, marginBottom: '1rem' }}>💧 ベーシック流</h3>
            <Price>¥298,000 <span>/3ヶ月</span></Price>
            <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '2', listStyle: 'none', padding: 0 }}>
              <li>✓ AI基礎マスタリー</li>
              <li>✓ NoCode入門〜実践</li>
              <li>✓ 月2回個別相談</li>
              <li>✓ コミュニティアクセス</li>
              <li>✓ 基本ツール利用権</li>
            </ul>
            <LiquidButton style={{ marginTop: '2rem' }}>
              <span>流れに参加する</span>
            </LiquidButton>
          </PriceCard>
          
          <PriceCard featured>
            <h3 style={{ color: colors.secondary, marginBottom: '1rem' }}>🌊 アドバンス流</h3>
            <Price>¥698,000 <span>/6ヶ月</span></Price>
            <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '2', listStyle: 'none', padding: 0 }}>
              <li>✓ 全AI・NoCodeツール完全習得</li>
              <li>✓ 個別ビジネス設計支援</li>
              <li>✓ 週1回マンツーマン指導</li>
              <li>✓ 収益化まで徹底サポート</li>
              <li>✓ プレミアムツール提供</li>
              <li>✓ 案件獲得サポート</li>
            </ul>
            <LiquidButton style={{ marginTop: '2rem' }}>
              <span>本流に飛び込む</span>
            </LiquidButton>
          </PriceCard>
          
          <PriceCard>
            <h3 style={{ color: colors.accent, marginBottom: '1rem' }}>🌀 マスター流</h3>
            <Price>¥1,280,000 <span>/12ヶ月</span></Price>
            <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '2', listStyle: 'none', padding: 0 }}>
              <li>✓ 企業級システム構築</li>
              <li>✓ 独自AIソリューション開発</li>
              <li>✓ 無制限個別コンサル</li>
              <li>✓ 投資家ネットワーク紹介</li>
              <li>✓ 事業売却サポート</li>
              <li>✓ 終身コミュニティ参加</li>
            </ul>
            <LiquidButton style={{ marginTop: '2rem' }}>
              <span>流れを創造する</span>
            </LiquidButton>
          </PriceCard>
        </Grid>
      </Section>
      
      {/* FAQ セクション */}
      <Section data-section-id="faq" bgColor="rgba(255, 107, 107, 0.05)">
        <SectionTitle>よくある質問</SectionTitle>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {[
            {
              q: "プログラミング経験がなくても大丈夫ですか？",
              a: "はい、全く問題ありません。当プログラムはNoCodeツールを中心とした内容で、コーディング不要でビジネスシステムを構築できます。"
            },
            {
              q: "どの程度の収益が期待できますか？",
              a: "個人差はありますが、受講生の平均月商は280万円です。早い方では2ヶ月目から月収100万円を超える実績もあります。"
            },
            {
              q: "サポート体制はどうなっていますか？",
              a: "プランに応じて個別相談やマンツーマン指導を提供。さらに24時間アクセス可能なコミュニティで、いつでも質問・相談が可能です。"
            },
            {
              q: "ツールの利用料金は別途必要ですか？",
              a: "基本的なツールの利用権は受講料に含まれています。より高度な機能が必要な場合のみ、個別にご相談いたします。"
            },
            {
              q: "返金保証はありますか？",
              a: "30日間の無条件返金保証をご用意しています。プログラム内容にご満足いただけない場合は、全額返金いたします。"
            }
          ].map((faq, index) => (
            <FAQItem key={index}>
              <FAQQuestion onClick={() => toggleFAQ(index)}>
                {faq.q}
                <span style={{ transform: openFAQ === index ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s ease' }}>
                  ▼
                </span>
              </FAQQuestion>
              <FAQAnswer isOpen={openFAQ === index}>
                {faq.a}
              </FAQAnswer>
            </FAQItem>
          ))}
        </div>
      </Section>
      
      {/* 最終CTAセクション */}
      <Section bgColor="rgba(0, 0, 0, 0.8)">
        <Title style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', marginBottom: '2rem' }}>
          流れに身を任せ、<br />新しい未来を創造しよう
        </Title>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          fontSize: '1.3rem', 
          textAlign: 'center', 
          marginBottom: '3rem',
          maxWidth: '700px',
          lineHeight: '1.8'
        }}>
          変化の激しい時代だからこそ、固定概念にとらわれない柔軟性が成功の鍵。
          <br />
          AIDXschoolで、あなたも流動的な起業家として新たな時代を切り開きませんか？
        </p>
        
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <LiquidButton style={{ fontSize: '1.4rem', padding: '2rem 4rem' }}>
            <span>今すぐ無料相談を申し込む</span>
          </LiquidButton>
          <LiquidButton style={{ 
            fontSize: '1.2rem', 
            padding: '1.5rem 3rem',
            borderColor: colors.secondary,
            color: colors.secondary
          }}>
            <span>資料をダウンロード</span>
          </LiquidButton>
        </div>
        
        <div style={{ marginTop: '4rem', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
            ※ 無料相談では、あなたの状況に合わせた最適な学習プランをご提案します
            <br />
            ※ 資料請求いただいた方には、限定動画コンテンツもプレゼント
          </p>
        </div>
      </Section>
    </Container>
  )
}