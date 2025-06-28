// LP16: SVGパスアニメーション - 起業の道筋を視覚的に描く
// AIDXschool AI×DX起業塾 - インタラクティブなパスドローイング体験

import React, { useLayoutEffect, useRef, useState, useCallback, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'

// GSAPプラグインの登録
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, DrawSVGPlugin, MorphSVGPlugin)

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

const pathDraw = keyframes`
  from {
    stroke-dashoffset: 1000;
  }
  to {
    stroke-dashoffset: 0;
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

const glow = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 5px rgba(78, 181, 255, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(78, 181, 255, 1));
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

// スタイルコンポーネント
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    180deg,
    #0a0a0a 0%,
    #1a1a2e 15%,
    #16213e 30%,
    #0f3460 45%,
    #533483 60%,
    #7209b7 75%,
    #16213e 90%,
    #0a0a0a 100%
  );
  overflow-x: hidden;
  position: relative;
`

const Section = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 2rem;
`

const HeroSection = styled(Section)`
  height: 100vh;
  background: radial-gradient(ellipse at center, rgba(78, 181, 255, 0.1) 0%, transparent 70%);
`

const AnimatedBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 2px,
      rgba(78, 181, 255, 0.03) 2px,
      rgba(78, 181, 255, 0.03) 4px
    );
    animation: ${rotate} 100s linear infinite;
  }
`

const Title = styled.h1`
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 900;
  color: #ffffff;
  text-align: center;
  margin: 0 0 2rem 0;
  text-shadow: 0 0 40px rgba(78, 181, 255, 0.5);
  position: relative;
  z-index: 10;
  animation: ${fadeIn} 1s ease-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, transparent, rgba(78, 181, 255, 0.1), transparent);
    animation: ${float} 4s ease-in-out infinite;
    border-radius: 10px;
    z-index: -1;
  }
`

const Subtitle = styled.p`
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin: 0 0 3rem 0;
  position: relative;
  z-index: 10;
  animation: ${fadeIn} 1s ease-out 0.3s both;
`

const InteractivePrompt = styled.div`
  position: absolute;
  bottom: 5%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 10;
  animation: ${pulse} 2s infinite;
  
  .icon {
    font-size: 2rem;
    color: ${colors.primary};
    display: block;
    margin-bottom: 0.5rem;
  }
  
  .text {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
  }
`

const SVGContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  
  &.interactive {
    cursor: pointer;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.02);
    }
  }
`

const DrawingCanvas = styled.div`
  position: relative;
  width: 100%;
  height: 600px;
  background: rgba(255, 255, 255, 0.02);
  border: 2px dashed rgba(78, 181, 255, 0.3);
  border-radius: 20px;
  margin: 2rem 0;
  overflow: hidden;
  
  .drawing-instruction {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    font-size: 1.2rem;
    pointer-events: none;
    z-index: 5;
  }
`

const InteractiveSVG = styled.svg`
  width: 100%;
  height: auto;
  filter: drop-shadow(0 0 20px rgba(78, 181, 255, 0.3));
  transition: filter 0.3s ease;
  
  &.active {
    filter: drop-shadow(0 0 30px rgba(78, 181, 255, 0.8));
  }
  
  .interactive-element {
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      filter: brightness(1.3);
      transform: scale(1.1);
    }
  }
`

const PathProgress = styled.div`
  position: relative;
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin: 2rem 0;
  overflow: hidden;
  
  .progress-fill {
    height: 100%;
    background: ${colors.gradient};
    border-radius: 4px;
    transition: width 0.5s ease;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      animation: ${float} 2s ease-in-out infinite;
    }
  }
`

const PathSection = styled(Section)`
  padding: 4rem 2rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(ellipse at center, rgba(56, 193, 114, 0.05) 0%, transparent 70%);
    pointer-events: none;
  }
`

const InteractiveSection = styled(Section)`
  padding: 6rem 2rem;
  background: linear-gradient(
    135deg,
    rgba(78, 181, 255, 0.05) 0%,
    rgba(56, 193, 114, 0.05) 50%,
    rgba(255, 217, 61, 0.05) 100%
  );
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background: ${colors.gradient};
  }
`

const PathCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 3rem;
  max-width: 600px;
  margin: 2rem auto;
  text-align: center;
  position: relative;
  overflow: hidden;
  animation: ${fadeIn} 0.8s ease-out;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #4EB5FF, #38C172, #FF6B6B, #FFD93D);
    border-radius: 20px;
    opacity: 0;
    z-index: -1;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 0.3;
  }
  
  &:hover {
    transform: translateY(-5px);
    transition: transform 0.3s ease;
  }
`

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 4rem 0;
  max-width: 1200px;
`

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    background: rgba(255, 255, 255, 0.08);
    border-color: ${colors.primary};
  }
  
  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    background: ${colors.gradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .title {
    font-size: 1.5rem;
    color: ${colors.light};
    margin-bottom: 1rem;
    font-weight: 600;
  }
  
  .description {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
  }
`

const PathTitle = styled.h3`
  font-size: 2rem;
  color: #4EB5FF;
  margin: 0 0 1rem 0;
  animation: ${fadeIn} 0.6s ease-out;
`

const PathDescription = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.8;
  animation: ${fadeIn} 0.6s ease-out 0.2s both;
`

const TimelineContainer = styled.div`
  position: relative;
  max-width: 800px;
  margin: 4rem auto;
  
  .timeline-line {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${colors.gradient};
    transform: translateX(-50%);
    border-radius: 2px;
  }
`

const TimelineItem = styled.div`
  position: relative;
  margin: 4rem 0;
  display: flex;
  align-items: center;
  
  &:nth-child(odd) {
    flex-direction: row;
    
    .content {
      margin-left: 2rem;
      text-align: left;
    }
  }
  
  &:nth-child(even) {
    flex-direction: row-reverse;
    
    .content {
      margin-right: 2rem;
      text-align: right;
    }
  }
  
  .marker {
    width: 20px;
    height: 20px;
    background: ${colors.primary};
    border-radius: 50%;
    border: 4px solid ${colors.dark};
    z-index: 2;
    animation: ${pulse} 2s infinite;
  }
  
  .content {
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    padding: 1.5rem;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    
    .title {
      font-size: 1.2rem;
      color: ${colors.light};
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
    
    .description {
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.6;
    }
  }
`

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin: 4rem 0;
  max-width: 800px;
`

const StatCard = styled.div`
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const StatNumber = styled.div`
  font-size: 3rem;
  font-weight: 900;
  color: #4EB5FF;
  margin-bottom: 0.5rem;
`

const StatLabel = styled.div`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
`

const CTAButton = styled.button`
  font-size: 1.2rem;
  font-weight: 600;
  padding: 1.5rem 3rem;
  background: linear-gradient(135deg, #4EB5FF 0%, #38C172 100%);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease;
  margin-top: 3rem;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50px;
    transform: translate(-50%, -50%) scale(0);
    transition: transform 0.6s ease;
  }
  
  &:hover::after {
    transform: translate(-50%, -50%) scale(2);
  }
`

// 起業の成功パスを表すSVGパス
const SuccessPathSVG = () => {
  const pathRef = useRef<SVGPathElement>(null)
  const groupRef = useRef<SVGGElement>(null)
  
  useLayoutEffect(() => {
    if (!pathRef.current) return
    
    const path = pathRef.current
    const pathLength = path.getTotalLength()
    
    // パスの初期設定
    gsap.set(path, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength
    })
    
    // パス描画アニメーション
    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 3,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: path,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1
      }
    })
    
    // マイルストーンのアニメーション
    const milestones = groupRef.current?.querySelectorAll('.milestone')
    if (milestones) {
      gsap.fromTo(milestones,
        {
          scale: 0,
          opacity: 0
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: 0.3,
          scrollTrigger: {
            trigger: groupRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    }
    
  }, [])
  
  return (
    <InteractiveSVG viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4EB5FF" />
          <stop offset="33%" stopColor="#38C172" />
          <stop offset="66%" stopColor="#FFD93D" />
          <stop offset="100%" stopColor="#FF6B6B" />
        </linearGradient>
        
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* メインパス */}
      <path
        ref={pathRef}
        d="M 50,300 Q 200,200 250,250 T 400,150 Q 500,100 600,120 T 750,50"
        stroke="url(#pathGradient)"
        strokeWidth="4"
        fill="none"
        filter="url(#glow)"
      />
      
      {/* マイルストーン */}
      <g ref={groupRef}>
        {/* スタート地点 */}
        <g className="milestone" transform="translate(50, 300)">
          <circle r="15" fill="#4EB5FF" />
          <text y="-25" textAnchor="middle" fill="#fff" fontSize="14">Start</text>
        </g>
        
        {/* 学習フェーズ */}
        <g className="milestone" transform="translate(250, 250)">
          <circle r="15" fill="#38C172" />
          <text y="-25" textAnchor="middle" fill="#fff" fontSize="14">学習</text>
        </g>
        
        {/* 実践フェーズ */}
        <g className="milestone" transform="translate(400, 150)">
          <circle r="15" fill="#FFD93D" />
          <text y="-25" textAnchor="middle" fill="#fff" fontSize="14">実践</text>
        </g>
        
        {/* 成長フェーズ */}
        <g className="milestone" transform="translate(600, 120)">
          <circle r="15" fill="#FF6B6B" />
          <text y="-25" textAnchor="middle" fill="#fff" fontSize="14">成長</text>
        </g>
        
        {/* 成功地点 */}
        <g className="milestone" transform="translate(750, 50)">
          <circle r="20" fill="#9B59B6" />
          <text y="-30" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold">Success!</text>
        </g>
      </g>
    </InteractiveSVG>
  )
}

// ネットワーク図SVG
const NetworkDiagram = () => {
  const svgRef = useRef<SVGSVGElement>(null)
  
  useLayoutEffect(() => {
    if (!svgRef.current) return
    
    const nodes = svgRef.current.querySelectorAll('.network-node')
    const connections = svgRef.current.querySelectorAll('.network-connection')
    
    // 接続線のアニメーション
    gsap.fromTo(connections,
      {
        strokeDasharray: '5,5',
        strokeDashoffset: 10
      },
      {
        strokeDashoffset: 0,
        duration: 2,
        repeat: -1,
        ease: 'linear',
        stagger: 0.1
      }
    )
    
    // ノードのパルスアニメーション
    gsap.to(nodes, {
      scale: 1.2,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
      stagger: {
        each: 0.2,
        from: 'center'
      }
    })
    
  }, [])
  
  return (
    <InteractiveSVG ref={svgRef} viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
      {/* 接続線 */}
      <g stroke="#4EB5FF" strokeWidth="2" fill="none" opacity="0.5">
        <line className="network-connection" x1="200" y1="150" x2="100" y2="50" />
        <line className="network-connection" x1="200" y1="150" x2="300" y2="50" />
        <line className="network-connection" x1="200" y1="150" x2="100" y2="250" />
        <line className="network-connection" x1="200" y1="150" x2="300" y2="250" />
        <line className="network-connection" x1="100" y1="50" x2="300" y2="50" />
        <line className="network-connection" x1="100" y1="250" x2="300" y2="250" />
      </g>
      
      {/* ノード */}
      <g>
        {/* 中心ノード */}
        <g className="network-node" transform="translate(200, 150)">
          <circle r="30" fill="#4EB5FF" />
          <text textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">YOU</text>
        </g>
        
        {/* 周辺ノード */}
        <g className="network-node" transform="translate(100, 50)">
          <circle r="20" fill="#38C172" />
          <text textAnchor="middle" fill="#fff" fontSize="10">AI</text>
        </g>
        
        <g className="network-node" transform="translate(300, 50)">
          <circle r="20" fill="#FF6B6B" />
          <text textAnchor="middle" fill="#fff" fontSize="10">DX</text>
        </g>
        
        <g className="network-node" transform="translate(100, 250)">
          <circle r="20" fill="#FFD93D" />
          <text textAnchor="middle" fill="#fff" fontSize="10">自動化</text>
        </g>
        
        <g className="network-node" transform="translate(300, 250)">
          <circle r="20" fill="#9B59B6" />
          <text textAnchor="middle" fill="#fff" fontSize="10">収益化</text>
        </g>
      </g>
    </InteractiveSVG>
  )
}

// メインコンポーネント
export default function SVGPathAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [stats, setStats] = useState({
    students: 0,
    successRate: 0,
    avgIncome: 0
  })
  
  useLayoutEffect(() => {
    // 統計数値のカウントアップアニメーション
    const ctx = gsap.context(() => {
      gsap.to(stats, {
        students: 1234,
        successRate: 92,
        avgIncome: 186,
        duration: 3,
        ease: 'power2.out',
        onUpdate: function() {
          setStats({
            students: Math.floor(this.targets()[0].students),
            successRate: Math.floor(this.targets()[0].successRate),
            avgIncome: Math.floor(this.targets()[0].avgIncome)
          })
        },
        scrollTrigger: {
          trigger: '.stats-container',
          start: 'top 80%',
          once: true
        }
      })
    }, containerRef)
    
    return () => ctx.revert()
  }, [])
  
  return (
    <Container ref={containerRef}>
      {/* ヒーローセクション */}
      <HeroSection>
        <Title>道を描く、成功を創る</Title>
        <Subtitle>AIDXschoolで、あなただけの起業ストーリーを</Subtitle>
        
        <SVGContainer>
          <SuccessPathSVG />
        </SVGContainer>
      </HeroSection>
      
      {/* ネットワークセクション */}
      <PathSection>
        <PathCard>
          <PathTitle>つながりが生む価値</PathTitle>
          <PathDescription>
            AI、DX、自動化、収益化。
            すべての要素が有機的につながり、
            あなたのビジネスを加速させます。
          </PathDescription>
          
          <SVGContainer style={{ marginTop: '2rem' }}>
            <NetworkDiagram />
          </SVGContainer>
        </PathCard>
      </PathSection>
      
      {/* 統計セクション */}
      <Section>
        <Title style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
          数字が証明する成功
        </Title>
        
        <StatsContainer className="stats-container">
          <StatCard>
            <StatNumber>{stats.students}+</StatNumber>
            <StatLabel>受講生数</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.successRate}%</StatNumber>
            <StatLabel>起業成功率</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.avgIncome}万円</StatNumber>
            <StatLabel>平均月収</StatLabel>
          </StatCard>
        </StatsContainer>
        
        <CTAButton>
          あなたの成功パスを描き始める
        </CTAButton>
      </Section>
    </Container>
  )
}

// 成功事例コンポーネント
const SuccessStories = () => {
  const [currentStory, setCurrentStory] = useState(0)
  const storiesRef = useRef<HTMLDivElement>(null)
  
  const stories = [
    {
      name: '田中 健太',
      age: 34,
      background: 'サラリーマン',
      business: 'AI自動化ツール',
      revenue: '月収180万円',
      period: '6ヶ月',
      image: '/api/placeholder/100/100',
      story: 'プログラミング未経験から始めて、ノーコードツールを活用したAI自動化サービスで成功。今では複数の企業との契約を獲得しています。',
      path: 'M 50,200 Q 150,100 250,150 T 450,80'
    },
    {
      name: '佐藤 美樹',
      age: 29,
      background: 'デザイナー',
      business: 'AI×マーケティング',
      revenue: '月収220万円',
      period: '4ヶ月',
      image: '/api/placeholder/100/100',
      story: 'デザインスキルにAIを組み合わせて、中小企業向けのマーケティング自動化を提供。短期間で大きな成果を上げました。',
      path: 'M 50,250 Q 200,150 350,100 T 550,120'
    },
    {
      name: '山田 裕介',
      age: 41,
      background: '営業職',
      business: 'チャットボット開発',
      revenue: '月収150万円',
      period: '8ヶ月',
      image: '/api/placeholder/100/100',
      story: '営業経験を活かし、顧客対応自動化のチャットボットを開発。業界の課題を解決するサービスで安定収益を実現。',
      path: 'M 50,180 Q 180,250 300,180 T 500,140'
    }
  ]
  
  useLayoutEffect(() => {
    const interval = setInterval(() => {
      setCurrentStory((prev) => (prev + 1) % stories.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <InteractiveSection ref={storiesRef}>
      <Title style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '3rem' }}>
        成功者の軌跡
      </Title>
      
      <FeatureGrid>
        {stories.map((story, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            animate={{ 
              opacity: currentStory === index ? 1 : 0.7, 
              y: 0,
              scale: currentStory === index ? 1.05 : 1
            }}
            transition={{ duration: 0.5 }}
          >
            <FeatureCard style={{
              background: currentStory === index ? 'rgba(78, 181, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
              border: currentStory === index ? `2px solid ${colors.primary}` : '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: colors.gradient,
                  marginRight: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  👤
                </div>
                <div>
                  <div style={{ color: colors.light, fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {story.name} ({story.age})
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                    元{story.background}
                  </div>
                </div>
              </div>
              
              <div className="title">{story.business}</div>
              <div className="description">{story.story}</div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '1rem',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: colors.accent, fontWeight: 'bold' }}>{story.revenue}</div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>収益</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: colors.secondary, fontWeight: 'bold' }}>{story.period}</div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>期間</div>
                </div>
              </div>
              
              {/* 成功パス */}
              <SVGContainer style={{ marginTop: '1rem', height: '80px' }}>
                <InteractiveSVG viewBox="0 0 600 300" style={{ height: '80px' }}>
                  <path
                    d={story.path}
                    stroke={colors.primary}
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="5,5"
                    style={{
                      animation: currentStory === index ? `${pathDraw} 2s ease-in-out infinite` : 'none'
                    }}
                  />
                  <circle r="8" fill={colors.primary}>
                    <animateMotion dur="3s" repeatCount="indefinite" rotate="auto">
                      <mpath href={`#path-${index}`} />
                    </animateMotion>
                  </circle>
                </InteractiveSVG>
              </SVGContainer>
            </FeatureCard>
          </motion.div>
        ))}
      </FeatureGrid>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        {stories.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentStory(index)}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: currentStory === index ? colors.primary : 'rgba(255, 255, 255, 0.3)',
              margin: '0 0.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
    </InteractiveSection>
  )
}

// カリキュラムパスビジュアライザー
const CurriculumPathVisualizer = () => {
  const [activeModule, setActiveModule] = useState(0)
  const [completedModules, setCompletedModules] = useState<number[]>([])
  const pathRef = useRef<SVGPathElement>(null)
  
  const modules = [
    {
      id: 0,
      title: 'AI基礎理解',
      duration: '2週間',
      description: 'AI技術の基本概念と起業への応用可能性を学習',
      skills: ['ChatGPT活用', 'プロンプトエンジニアリング', 'AI倫理'],
      position: { x: 100, y: 200 },
      color: colors.primary
    },
    {
      id: 1,
      title: 'ノーコード開発',
      duration: '3週間',
      description: 'プログラミング不要でアプリケーションを構築',
      skills: ['Bubble', 'Zapier', 'Airtable'],
      position: { x: 250, y: 150 },
      color: colors.secondary
    },
    {
      id: 2,
      title: 'ビジネスモデル設計',
      duration: '2週間',
      description: '持続可能な収益モデルの構築方法',
      skills: ['リーンキャンバス', 'MVP開発', 'ユーザー検証'],
      position: { x: 400, y: 180 },
      color: colors.accent
    },
    {
      id: 3,
      title: 'マーケティング自動化',
      duration: '3週間',
      description: 'AI活用したマーケティング施策の実装',
      skills: ['SNS自動化', 'コンテンツ生成', 'データ分析'],
      position: { x: 550, y: 120 },
      color: colors.danger
    },
    {
      id: 4,
      title: 'スケールアップ戦略',
      duration: '2週間',
      description: 'ビジネスの拡大と継続的成長の実現',
      skills: ['チーム構築', '投資調達', 'グローバル展開'],
      position: { x: 700, y: 100 },
      color: colors.purple
    }
  ]
  
  const connections = [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 }
  ]
  
  const handleModuleClick = (moduleId: number) => {
    setActiveModule(moduleId)
    if (!completedModules.includes(moduleId)) {
      setCompletedModules(prev => [...prev, moduleId])
    }
  }
  
  useLayoutEffect(() => {
    if (!pathRef.current) return
    
    const path = pathRef.current
    const pathLength = path.getTotalLength()
    
    gsap.set(path, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength
    })
    
    gsap.to(path, {
      strokeDashoffset: pathLength * (1 - (completedModules.length / modules.length)),
      duration: 1,
      ease: 'power2.out'
    })
  }, [completedModules])
  
  return (
    <InteractiveSection>
      <Title style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '2rem' }}>
        学習カリキュラムパス
      </Title>
      
      <SVGContainer style={{ height: '400px', marginBottom: '3rem' }}>
        <InteractiveSVG viewBox="0 0 800 300">
          <defs>
            <linearGradient id="curriculumGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.primary} />
              <stop offset="25%" stopColor={colors.secondary} />
              <stop offset="50%" stopColor={colors.accent} />
              <stop offset="75%" stopColor={colors.danger} />
              <stop offset="100%" stopColor={colors.purple} />
            </linearGradient>
          </defs>
          
          {/* メインパス */}
          <path
            ref={pathRef}
            d="M 100,200 Q 200,150 250,150 T 400,180 Q 500,120 550,120 T 700,100"
            stroke="url(#curriculumGradient)"
            strokeWidth="6"
            fill="none"
            filter="url(#glow)"
          />
          
          {/* 接続線 */}
          {connections.map((conn, index) => {
            const fromModule = modules.find(m => m.id === conn.from)
            const toModule = modules.find(m => m.id === conn.to)
            if (!fromModule || !toModule) return null
            
            return (
              <line
                key={index}
                x1={fromModule.position.x}
                y1={fromModule.position.y}
                x2={toModule.position.x}
                y2={toModule.position.y}
                stroke={completedModules.includes(conn.from) && completedModules.includes(conn.to) ? 
                  colors.primary : 'rgba(255, 255, 255, 0.2)'}
                strokeWidth="2"
                strokeDasharray={completedModules.includes(conn.from) ? 'none' : '5,5'}
              />
            )
          })}
          
          {/* モジュールノード */}
          {modules.map((module) => (
            <g
              key={module.id}
              className="interactive-element"
              transform={`translate(${module.position.x}, ${module.position.y})`}
              onClick={() => handleModuleClick(module.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* グローエフェクト */}
              {activeModule === module.id && (
                <circle
                  r="45"
                  fill={module.color}
                  opacity="0.3"
                >
                  <animate attributeName="r" values="35;50;35" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              
              {/* メインサークル */}
              <circle
                r="30"
                fill={completedModules.includes(module.id) ? module.color : 'rgba(255, 255, 255, 0.1)'}
                stroke={module.color}
                strokeWidth="3"
              />
              
              {/* モジュール番号 */}
              <text
                textAnchor="middle"
                fill="#fff"
                fontSize="16"
                fontWeight="bold"
                y="5"
              >
                {module.id + 1}
              </text>
              
              {/* 完了マーク */}
              {completedModules.includes(module.id) && (
                <text
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="20"
                  y="8"
                >
                  ✓
                </text>
              )}
              
              {/* タイトル */}
              <text
                textAnchor="middle"
                fill="#fff"
                fontSize="12"
                fontWeight="bold"
                y="-40"
              >
                {module.title}
              </text>
              
              {/* 期間 */}
              <text
                textAnchor="middle"
                fill="rgba(255, 255, 255, 0.7)"
                fontSize="10"
                y="55"
              >
                {module.duration}
              </text>
            </g>
          ))}
        </InteractiveSVG>
      </SVGContainer>
      
      {/* 詳細情報 */}
      <PathCard>
        <PathTitle>{modules[activeModule].title}</PathTitle>
        <PathDescription>
          {modules[activeModule].description}
        </PathDescription>
        
        <div style={{ marginTop: '2rem' }}>
          <h4 style={{ color: colors.primary, marginBottom: '1rem' }}>習得スキル:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {modules[activeModule].skills.map((skill, index) => (
              <span
                key={index}
                style={{
                  background: 'rgba(78, 181, 255, 0.2)',
                  color: colors.primary,
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  border: `1px solid ${colors.primary}`
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        <div style={{ marginTop: '2rem' }}>
          <PathProgress>
            <div 
              className="progress-fill" 
              style={{ width: `${(completedModules.length / modules.length) * 100}%` }} 
            />
          </PathProgress>
          <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
            進捗: {completedModules.length}/{modules.length} モジュール完了
          </div>
        </div>
      </PathCard>
    </InteractiveSection>
  )
}

// AIアシスタントチャット風コンポーネント
const AIAssistantChat = () => {
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: 'こんにちは！AIDXschoolのAIアシスタントです。起業について何でもお気軽にお聞きください！' },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  
  const responses = [
    'それは素晴らしいアイデアですね！AIDXschoolでは、そのようなビジネスモデルの実現方法を詳しく学べます。',
    'AIを活用した起業は今最も注目される分野です。具体的にどのような業界に興味がありますか？',
    '技術的な知識がなくても大丈夫です。ノーコードツールを使えば、誰でもアプリケーションを作れるようになります。',
    'マーケティングは起業成功の鍵です。AIを使った自動化で効率的に顧客獲得ができますよ。',
    'まずは小さく始めて、段階的にスケールアップしていくのが成功の秘訣です。'
  ]
  
  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    
    const userMessage = {
      id: messages.length + 1,
      type: 'user' as const,
      text: inputValue
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)
    
    // AIレスポンスをシミュレート
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'ai' as const,
        text: responses[Math.floor(Math.random() * responses.length)]
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])
  
  return (
    <InteractiveSection>
      <Title style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '2rem' }}>
        AIアシスタントに相談
      </Title>
      
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '20px',
        padding: '2rem',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* チャットメッセージ */}
        <div
          ref={chatRef}
          style={{
            height: '400px',
            overflowY: 'auto',
            marginBottom: '1rem',
            padding: '1rem',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '15px'
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '1rem'
              }}
            >
              <div style={{
                maxWidth: '80%',
                padding: '1rem',
                borderRadius: '15px',
                background: message.type === 'user' ? colors.primary : 'rgba(255, 255, 255, 0.1)',
                color: '#fff'
              }}>
                {message.type === 'ai' && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    opacity: 0.8
                  }}>
                    🤖 AIDXschool AI
                  </div>
                )}
                {message.text}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
              <div style={{
                padding: '1rem',
                borderRadius: '15px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  🤖 AIDXschool AI
                  <div style={{ marginLeft: '0.5rem' }}>
                    <span style={{ animation: `${pulse} 1.5s infinite` }}>●</span>
                    <span style={{ animation: `${pulse} 1.5s infinite 0.5s` }}>●</span>
                    <span style={{ animation: `${pulse} 1.5s infinite 1s` }}>●</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 入力エリア */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="起業について質問してみてください..."
            style={{
              flex: 1,
              padding: '1rem',
              borderRadius: '25px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontSize: '1rem'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            style={{
              padding: '1rem 1.5rem',
              borderRadius: '25px',
              border: 'none',
              background: inputValue.trim() ? colors.primary : 'rgba(255, 255, 255, 0.2)',
              color: '#fff',
              cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease'
            }}
          >
            送信
          </button>
        </div>
        
        <div style={{ 
          marginTop: '1rem', 
          textAlign: 'center', 
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.9rem'
        }}>
          ※ これはデモ用のAIチャットです。実際のコースでは更に高度なAIサポートを提供します。
        </div>
      </div>
    </InteractiveSection>
  )
}

// コンポーネントのメモ化でパフォーマンス最適化
export const MemoizedSVGPathAnimation = React.memo(SVGPathAnimation)