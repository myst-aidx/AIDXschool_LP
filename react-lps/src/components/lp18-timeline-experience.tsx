// LP18: タイムライン体験 - 起業の道のりを時系列で体験
// AIDXschool AI×DX起業塾 - 90日間のトランスフォーメーション・ジャーニー

import { useLayoutEffect, useRef, useState, useCallback, useEffect } from 'react'
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

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
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

const progressGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 10px rgba(78, 181, 255, 0.6);
  }
  50% {
    box-shadow: 0 0 20px rgba(78, 181, 255, 1), 0 0 30px rgba(78, 181, 255, 0.8);
  }
`

// スタイルコンポーネント
const Container = styled.div`
  position: relative;
  background: linear-gradient(180deg, 
    #0a0a0a 0%, 
    #1a1a2e 20%,
    #16213e 40%,
    #0f3460 60%,
    #533483 80%,
    #0a0a0a 100%
  );
  overflow-x: hidden;
`

const Section = styled.section<{ bgColor?: string }>`
  min-height: 100vh;
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

const TimelineContainer = styled.div`
  position: relative;
  padding: 8rem 0;
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
`

const TimelinePath = styled.div`
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, transparent, ${colors.primary}, transparent);
  transform: translateX(-50%);
  
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 50%;
    width: 20px;
    height: 20px;
    background: ${colors.primary};
    border-radius: 50%;
    transform: translateX(-50%);
    box-shadow: 0 0 20px rgba(78, 181, 255, 0.8);
    animation: ${pulse} 2s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 50%;
    width: 20px;
    height: 20px;
    background: ${colors.secondary};
    border-radius: 50%;
    transform: translateX(-50%);
    box-shadow: 0 0 20px rgba(56, 193, 114, 0.8);
    animation: ${pulse} 2s ease-in-out infinite 1s;
  }
  
  @media (max-width: 768px) {
    left: 30px;
  }
`

const TimelineProgress = styled.div`
  position: absolute;
  left: 50%;
  top: 0;
  width: 4px;
  height: 0%;
  background: linear-gradient(to bottom, ${colors.primary}, ${colors.secondary});
  transform: translateX(-50%);
  transition: height 0.1s ease-out;
  animation: ${progressGlow} 3s ease-in-out infinite;
  
  @media (max-width: 768px) {
    left: 30px;
  }
`

const TimelineItem = styled.div<{ align: 'left' | 'right' }>`
  position: relative;
  display: flex;
  justify-content: ${props => props.align === 'left' ? 'flex-end' : 'flex-start'};
  padding: 4rem 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 30px;
    height: 30px;
    background: #1a1a2e;
    border: 4px solid ${colors.primary};
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    transition: all 0.3s ease;
  }
  
  &.active::before {
    background: ${colors.primary};
    box-shadow: 0 0 30px rgba(78, 181, 255, 0.8);
    transform: translate(-50%, -50%) scale(1.2);
    border-color: ${colors.secondary};
  }
  
  @media (max-width: 768px) {
    justify-content: flex-start;
    padding-left: 80px;
    
    &::before {
      left: 30px;
    }
    
    &.active::before {
      left: 30px;
    }
  }
`

const TimelineContent = styled.div<{ align: 'left' | 'right' }>`
  width: 45%;
  padding: ${props => props.align === 'left' ? '0 3rem 0 0' : '0 0 0 3rem'};
  opacity: 0;
  transform: ${props => props.align === 'left' ? 'translateX(50px)' : 'translateX(-50px)'};
  
  @media (max-width: 768px) {
    width: calc(100% - 80px);
    padding: 0;
    transform: translateX(-50px);
  }
`

const TimelineCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(78, 181, 255, 0.5);
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, ${colors.primary}, ${colors.secondary}, ${colors.accent});
    border-radius: 20px;
    opacity: 0;
    z-index: -1;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 0.3;
  }
`

const TimelineDate = styled.div`
  font-size: 0.9rem;
  color: ${colors.primary};
  margin-bottom: 0.5rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`

const TimelineTitle = styled.h3`
  font-size: 1.8rem;
  color: #ffffff;
  margin: 0 0 1rem 0;
  font-weight: 700;
`

const TimelineDescription = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.8;
  margin: 0;
`

const TimelineIcon = styled.div`
  position: absolute;
  top: 2rem;
  right: 2rem;
  font-size: 2.5rem;
  opacity: 0.3;
  transition: all 0.3s ease;
  
  ${TimelineCard}:hover & {
    opacity: 0.8;
    transform: scale(1.1);
  }
`

const HeroSection = styled.section`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 2rem;
  background: radial-gradient(circle at center, rgba(78, 181, 255, 0.1) 0%, transparent 70%);
`

const HeroTitle = styled.h1`
  font-size: clamp(3rem, 10vw, 8rem);
  font-weight: 900;
  color: #ffffff;
  text-align: center;
  margin: 0 0 2rem 0;
  opacity: 0;
  transform: translateY(50px);
  background: ${colors.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 30px rgba(78, 181, 255, 0.3));
`

const HeroSubtitle = styled.p`
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin: 0 0 3rem 0;
  max-width: 800px;
  opacity: 0;
  transform: translateY(30px);
  line-height: 1.6;
`

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  opacity: 0;
  animation: ${float} 3s ease-in-out infinite;
  
  &::after {
    content: '';
    width: 1px;
    height: 50px;
    background: linear-gradient(to bottom, ${colors.primary}, transparent);
    animation: scrollDown 2s ease-in-out infinite;
  }
  
  @keyframes scrollDown {
    0% { transform: scaleY(0); transform-origin: top; }
    50% { transform: scaleY(1); transform-origin: top; }
    50.1% { transform-origin: bottom; }
    100% { transform: scaleY(0); transform-origin: bottom; }
  }
`

const CTASection = styled.section`
  padding: 6rem 2rem;
  text-align: center;
  position: relative;
  background: rgba(0, 0, 0, 0.5);
`

const CTAButton = styled.button`
  font-size: 1.3rem;
  font-weight: 600;
  padding: 1.5rem 3rem;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  margin: 0 1rem;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(78, 181, 255, 0.4);
  }
  
  &:active {
    transform: translateY(-1px);
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

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  color: ${colors.primary};
  margin-bottom: 1rem;
  font-weight: 700;
`

const FeatureText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  font-size: 1rem;
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
    animation: shimmer 3s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
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
  transition: all 0.5s ease;
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
    animation: ${props => props.featured ? `${pulse} 3s ease-in-out infinite` : 'none'};
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

const DetailModal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 1000;
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  padding: 2rem;
`

const ModalContent = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  position: relative;
`

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`

// 拡張タイムラインデータ
const timelineData = [
  {
    date: "Day 1-7",
    title: "AI基礎マスター",
    description: "ChatGPT、Claude、Geminiの基本的な使い方から、プロンプトエンジニアリングの極意まで。AIとの対話方法を徹底的に学びます。",
    icon: "🤖",
    align: "left" as const,
    details: {
      skills: ["プロンプトエンジニアリング", "AI活用戦略", "業界別AI活用法"],
      tools: ["ChatGPT Pro", "Claude 3", "Gemini Ultra"],
      outcome: "AI活用による作業効率300%向上"
    }
  },
  {
    date: "Day 8-21",
    title: "ノーコード開発入門",
    description: "Bubble、FlutterFlow、Glideを使った実践的なアプリ開発。コードを書かずに、あなたのアイデアを形にする技術を習得。",
    icon: "🔧",
    align: "right" as const,
    details: {
      skills: ["Webアプリ開発", "モバイルアプリ開発", "データベース設計"],
      tools: ["Bubble", "FlutterFlow", "Glide", "Airtable"],
      outcome: "プロトタイプから本格アプリまで開発可能"
    }
  },
  {
    date: "Day 22-35",
    title: "自動化システム構築",
    description: "Zapier、Make、n8nを活用した業務自動化。24時間働き続ける仕組みを構築し、時間を創出します。",
    icon: "⚡",
    align: "left" as const,
    details: {
      skills: ["ワークフロー自動化", "API連携", "データ処理自動化"],
      tools: ["Zapier", "Make.com", "n8n", "Google Apps Script"],
      outcome: "週40時間の作業を週10時間に短縮"
    }
  },
  {
    date: "Day 36-50",
    title: "ビジネスモデル設計",
    description: "サブスクリプション、デジタルプロダクト、オンラインコース。複数の収益源を組み合わせた安定的なビジネスモデルを構築。",
    icon: "💡",
    align: "right" as const,
    details: {
      skills: ["収益モデル設計", "価格戦略", "顧客セグメント分析"],
      tools: ["Stripe", "PayPal", "Gumroad", "Teachable"],
      outcome: "月額収益50万円以上の安定収入"
    }
  },
  {
    date: "Day 51-70",
    title: "マーケティング実践",
    description: "SNS、SEO、コンテンツマーケティングを統合的に活用。AIを使った効率的な集客システムの構築と運用。",
    icon: "📈",
    align: "left" as const,
    details: {
      skills: ["デジタルマーケティング", "コンテンツ戦略", "SEO最適化"],
      tools: ["Google Analytics", "Hootsuite", "Buffer", "Semrush"],
      outcome: "月間10万PV達成とコンバージョン率5%向上"
    }
  },
  {
    date: "Day 71-90",
    title: "スケール戦略",
    description: "事業の拡大と最適化。チーム構築、システム化、そして月収100万円達成への具体的なロードマップ。",
    icon: "🚀",
    align: "right" as const,
    details: {
      skills: ["チームマネジメント", "スケーリング戦略", "投資計画"],
      tools: ["Slack", "Notion", "Asana", "QuickBooks"],
      outcome: "月収100万円突破と持続的成長の仕組み構築"
    }
  }
]

// メインコンポーネント
export default function TimelineExperience() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progressHeight, setProgressHeight] = useState(0)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [selectedDetail, setSelectedDetail] = useState<any>(null)
  const [activeSection, setActiveSection] = useState(0)
  
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // ヒーローアニメーション
      const heroTl = gsap.timeline()
      heroTl
        .to('.hero-title', {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: 'power3.out'
        })
        .to('.hero-subtitle', {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out'
        }, '-=0.8')
        .to('.scroll-indicator', {
          opacity: 1,
          duration: 1
        }, '-=0.5')
      
      // タイムラインプログレスバー
      ScrollTrigger.create({
        trigger: '.timeline-container',
        start: 'top center',
        end: 'bottom center',
        scrub: true,
        onUpdate: (self) => {
          setProgressHeight(self.progress * 100)
          
          // アクティブなアイテムの判定
          const currentActive = Math.floor(self.progress * timelineData.length)
          setActiveIndex(currentActive)
        }
      })
      
      // タイムラインアイテムのアニメーション
      gsap.utils.toArray('.timeline-content').forEach((content: any, index) => {
        const item = content.parentElement
        
        gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        })
        .to(content, {
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: 'power3.out'
        })
        .to(item.querySelector('.timeline-card'), {
          scale: 1.05,
          duration: 0.3,
          ease: 'power2.out'
        }, '-=0.5')
        .to(item.querySelector('.timeline-card'), {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        })
      })
      
      // 要素の段階的表示
      gsap.utils.toArray('.feature-card').forEach((card: any, index) => {
        gsap.fromTo(card,
          {
            opacity: 0,
            y: 50,
            scale: 0.9
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      })
      
    }, containerRef)
    
    return () => ctx.revert()
  }, [])
  
  // ナビゲーション
  const scrollToSection = (index: number) => {
    const sections = document.querySelectorAll('[data-section-id]')
    sections[index]?.scrollIntoView({ behavior: 'smooth' })
    setActiveSection(index)
  }
  
  // モーダル制御
  const openDetail = (item: any) => {
    setSelectedDetail(item)
  }
  
  const closeDetail = () => {
    setSelectedDetail(null)
  }
  
  return (
    <Container ref={containerRef}>
      {/* フローティングナビゲーション */}
      <FloatingNavigation>
        {['ホーム', 'タイムライン', '特徴', 'ツール', '成果', '料金'].map((label, index) => (
          <NavDot
            key={index}
            active={activeSection === index}
            data-tooltip={label}
            onClick={() => scrollToSection(index)}
          />
        ))}
      </FloatingNavigation>
      
      {/* ヒーローセクション */}
      <HeroSection data-section-id="hero">
        <HeroTitle className="hero-title">
          90日で変わる、<br />あなたの未来
        </HeroTitle>
        <HeroSubtitle className="hero-subtitle">
          AIDXschool AI×DX起業塾の体系的カリキュラムで、
          <br />
          確実にステップアップする起業への道のり
        </HeroSubtitle>
        <ScrollIndicator className="scroll-indicator">
          <span style={{ color: colors.primary, fontSize: '0.9rem', fontWeight: '600' }}>SCROLL</span>
        </ScrollIndicator>
      </HeroSection>
      
      {/* タイムライン */}
      <Section data-section-id="timeline">
        <SectionTitle>学習ロードマップ</SectionTitle>
        <TimelineContainer className="timeline-container">
          <TimelinePath>
            <TimelineProgress style={{ height: `${progressHeight}%` }} />
          </TimelinePath>
          
          {timelineData.map((item, index) => (
            <TimelineItem
              key={index}
              align={item.align}
              className={`timeline-item ${activeIndex >= index ? 'active' : ''}`}
            >
              <TimelineContent align={item.align} className="timeline-content">
                <TimelineCard 
                  className="timeline-card"
                  onClick={() => openDetail(item)}
                >
                  <TimelineDate>{item.date}</TimelineDate>
                  <TimelineTitle>{item.title}</TimelineTitle>
                  <TimelineDescription>{item.description}</TimelineDescription>
                  <TimelineIcon>{item.icon}</TimelineIcon>
                </TimelineCard>
              </TimelineContent>
            </TimelineItem>
          ))}
        </TimelineContainer>
      </Section>
      
      {/* 特徴セクション */}
      <Section data-section-id="features" bgColor="rgba(78, 181, 255, 0.05)">
        <SectionTitle>学習の特徴</SectionTitle>
        <Grid>
          <FeatureCard className="feature-card">
            <FeatureTitle>🎯 個別最適化学習</FeatureTitle>
            <FeatureText>
              あなたの目標、経験、学習スタイルに合わせてカリキュラムをカスタマイズ。
              最短距離で目標達成へ導きます。
            </FeatureText>
          </FeatureCard>
          
          <FeatureCard className="feature-card">
            <FeatureTitle>🤝 専属メンター制度</FeatureTitle>
            <FeatureText>
              経験豊富な現役起業家があなた専属のメンターとして、
              90日間しっかりとサポートします。
            </FeatureText>
          </FeatureCard>
          
          <FeatureCard className="feature-card">
            <FeatureTitle>🛠️ 実践中心の学習</FeatureTitle>
            <FeatureText>
              理論だけでなく、実際に手を動かして学ぶ実践形式。
              学んだことをすぐにビジネスに活用できます。
            </FeatureText>
          </FeatureCard>
          
          <FeatureCard className="feature-card">
            <FeatureTitle>📈 段階的レベルアップ</FeatureTitle>
            <FeatureText>
              基礎から応用まで段階的に学習。無理なく確実に
              スキルアップできる仕組みを提供します。
            </FeatureText>
          </FeatureCard>
          
          <FeatureCard className="feature-card">
            <FeatureTitle>💰 収益化保証</FeatureTitle>
            <FeatureText>
              90日以内に月収10万円を達成できない場合は、
              達成まで無料で継続サポートいたします。
            </FeatureText>
          </FeatureCard>
          
          <FeatureCard className="feature-card">
            <FeatureTitle>🌐 コミュニティ力</FeatureTitle>
            <FeatureText>
              同じ目標を持つ仲間たちとのネットワーク構築。
              卒業後も続く貴重な人脈を手に入れられます。
            </FeatureText>
          </FeatureCard>
        </Grid>
      </Section>
      
      {/* ツール・技術セクション */}
      <Section data-section-id="tools" bgColor="rgba(56, 193, 114, 0.05)">
        <SectionTitle>習得技術・ツール</SectionTitle>
        <ToolsGrid>
          <ToolCard>
            <h4 style={{ color: colors.primary, marginBottom: '1rem' }}>🤖 AI活用技術</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              ChatGPT、Claude、Gemini等の最新AI活用法
            </p>
          </ToolCard>
          <ToolCard>
            <h4 style={{ color: colors.secondary, marginBottom: '1rem' }}>📱 NoCodeアプリ開発</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              Bubble、FlutterFlow等でのアプリ制作
            </p>
          </ToolCard>
          <ToolCard>
            <h4 style={{ color: colors.accent, marginBottom: '1rem' }}>⚡ 業務自動化</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              Zapier、Make.com等による自動化システム
            </p>
          </ToolCard>
          <ToolCard>
            <h4 style={{ color: colors.purple, marginBottom: '1rem' }}>📊 データ分析</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              Google Analytics、Tableau等の分析ツール
            </p>
          </ToolCard>
          <ToolCard>
            <h4 style={{ color: colors.primary, marginBottom: '1rem' }}>💰 決済システム</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              Stripe、PayPal等の決済連携技術
            </p>
          </ToolCard>
          <ToolCard>
            <h4 style={{ color: colors.secondary, marginBottom: '1rem' }}>📈 マーケティング</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              SEO、SNS、広告運用の実践技術
            </p>
          </ToolCard>
        </ToolsGrid>
      </Section>
      
      {/* 成果・実績セクション */}
      <Section data-section-id="results" bgColor="rgba(255, 217, 61, 0.05)">
        <SectionTitle>受講生の成果</SectionTitle>
        <Grid>
          <StatCard>
            <StatNumber>¥156万</StatNumber>
            <StatLabel>平均月収達成額</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>92%</StatNumber>
            <StatLabel>90日以内収益化率</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>58日</StatNumber>
            <StatLabel>平均収益化達成日数</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>450%</StatNumber>
            <StatLabel>平均作業効率向上率</StatLabel>
          </StatCard>
        </Grid>
        
        <div style={{ marginTop: '4rem' }}>
          <h3 style={{ color: colors.light, textAlign: 'center', marginBottom: '3rem' }}>
            受講生の成功ストーリー
          </h3>
          <Grid>
            <TestimonialCard>
              <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                「プログラミング未経験でしたが、90日でAI活用の自動化システムを構築し、
                月収180万円を達成。人生が変わりました。」
              </p>
              <div style={{ color: colors.primary, fontWeight: '600' }}>
                田中太郎様 (元会社員 → AIコンサルタント)
              </div>
            </TestimonialCard>
            
            <TestimonialCard>
              <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                「子育て中の主婦でも、スキマ時間の学習で2ヶ月目から月収50万円を達成。
                時間の自由も手に入れられました。」
              </p>
              <div style={{ color: colors.secondary, fontWeight: '600' }}>
                佐藤花子様 (主婦 → オンラインビジネス運営)
              </div>
            </TestimonialCard>
            
            <TestimonialCard>
              <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                「従来のビジネスにAI・DXを導入し、売上が3倍に。
                競合他社との差別化にも成功しています。」
              </p>
              <div style={{ color: colors.accent, fontWeight: '600' }}>
                山田一郎様 (中小企業経営者)
              </div>
            </TestimonialCard>
          </Grid>
        </div>
      </Section>
      
      {/* 料金プランセクション */}
      <Section data-section-id="pricing" bgColor="rgba(147, 51, 234, 0.05)">
        <SectionTitle>投資プラン</SectionTitle>
        <Grid>
          <PriceCard>
            <h3 style={{ color: colors.primary, marginBottom: '1rem' }}>⚡ スタンダード</h3>
            <Price>¥398,000 <span>/90日</span></Price>
            <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '2', listStyle: 'none', padding: 0 }}>
              <li>✓ 全カリキュラムアクセス</li>
              <li>✓ 週1回グループ相談</li>
              <li>✓ コミュニティ参加権</li>
              <li>✓ 基本ツール利用権</li>
              <li>✓ 学習進捗管理</li>
            </ul>
            <CTAButton style={{ marginTop: '2rem', fontSize: '1rem', padding: '1rem 2rem' }}>
              プランを選択
            </CTAButton>
          </PriceCard>
          
          <PriceCard featured>
            <h3 style={{ color: colors.secondary, marginBottom: '1rem' }}>🔥 プレミアム</h3>
            <Price>¥798,000 <span>/90日</span></Price>
            <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '2', listStyle: 'none', padding: 0 }}>
              <li>✓ 全機能 + 専属メンター</li>
              <li>✓ 週2回個別コンサル</li>
              <li>✓ 24時間質問サポート</li>
              <li>✓ 収益化保証制度</li>
              <li>✓ プレミアムツール提供</li>
              <li>✓ 卒業後3ヶ月サポート</li>
            </ul>
            <CTAButton style={{ marginTop: '2rem', fontSize: '1rem', padding: '1rem 2rem' }}>
              推奨プラン
            </CTAButton>
          </PriceCard>
          
          <PriceCard>
            <h3 style={{ color: colors.accent, marginBottom: '1rem' }}>👑 VIP</h3>
            <Price>¥1,580,000 <span>/90日</span></Price>
            <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '2', listStyle: 'none', padding: 0 }}>
              <li>✓ 全機能 + VIP特典</li>
              <li>✓ 毎日個別指導</li>
              <li>✓ 代表直接指導</li>
              <li>✓ ビジネス共同開発権</li>
              <li>✓ 投資家紹介サービス</li>
              <li>✓ 永続サポート権</li>
            </ul>
            <CTAButton style={{ marginTop: '2rem', fontSize: '1rem', padding: '1rem 2rem' }}>
              特別プラン
            </CTAButton>
          </PriceCard>
        </Grid>
      </Section>
      
      {/* CTA */}
      <CTASection>
        <HeroTitle style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', marginBottom: '2rem' }}>
          あなたの起業ストーリーを<br />今すぐ始めよう
        </HeroTitle>
        <HeroSubtitle style={{ fontSize: 'clamp(1rem, 2vw, 1.3rem)', marginBottom: '3rem' }}>
          90日後、あなたは全く違う景色を見ています
          <br />
          変化への第一歩を踏み出すのは、今この瞬間です
        </HeroSubtitle>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <CTAButton>
            無料カウンセリングを予約
          </CTAButton>
          <CTAButton style={{ background: 'transparent', border: `2px solid ${colors.secondary}`, color: colors.secondary }}>
            詳細資料をダウンロード
          </CTAButton>
        </div>
        
        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
            ※ 無料カウンセリングでは、あなたに最適な学習プランをご提案
            <br />
            ※ 詳細資料には、成功事例やカリキュラム詳細を掲載
          </p>
        </div>
      </CTASection>
      
      {/* 詳細モーダル */}
      <DetailModal isOpen={!!selectedDetail}>
        <ModalContent>
          <CloseButton onClick={closeDetail}>×</CloseButton>
          {selectedDetail && (
            <div>
              <h3 style={{ color: colors.primary, marginBottom: '1rem', fontSize: '2rem' }}>
                {selectedDetail.title}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', lineHeight: '1.6' }}>
                {selectedDetail.description}
              </p>
              
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: colors.secondary, marginBottom: '1rem' }}>習得スキル</h4>
                <ul style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.8' }}>
                  {selectedDetail.details?.skills.map((skill: string, index: number) => (
                    <li key={index}>• {skill}</li>
                  ))}
                </ul>
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: colors.accent, marginBottom: '1rem' }}>使用ツール</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedDetail.details?.tools.map((tool: string, index: number) => (
                    <span key={index} style={{
                      background: 'rgba(255,255,255,0.1)',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '15px',
                      fontSize: '0.8rem',
                      color: colors.light
                    }}>
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 style={{ color: colors.primary, marginBottom: '1rem' }}>期待成果</h4>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>
                  {selectedDetail.details?.outcome}
                </p>
              </div>
            </div>
          )}
        </ModalContent>
      </DetailModal>
    </Container>
  )
}