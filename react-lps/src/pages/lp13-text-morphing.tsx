// LP13: テキストモーフィング - 言葉が生きているような体験
// AIDXschoolで学ぶ、言葉とテクノロジーの融合

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import styled, { keyframes, css } from 'styled-components'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'
import { motion, AnimatePresence } from 'framer-motion'

// GSAPプラグインの登録
gsap.registerPlugin(ScrollTrigger, TextPlugin)

// カラーパレット
const colors = {
  primary: '#4EB5FF',
  secondary: '#38C172',
  accent: '#FFD93D',
  danger: '#FF6B6B',
  purple: '#9333EA',
  pink: '#EC4899',
  dark: '#0a0e27',
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

const float = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(5deg);
  }
  66% {
    transform: translateY(10px) rotate(-5deg);
  }
`

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
`

const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

const typewriter = keyframes`
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
`

const blink = keyframes`
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0;
  }
`

// スタイルコンポーネント
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, 
    ${colors.dark} 0%, 
    #1a1f3a 25%, 
    #2a2f4a 50%, 
    #1a1f3a 75%, 
    ${colors.dark} 100%
  );
  overflow-x: hidden;
  position: relative;
  font-family: 'Noto Sans JP', sans-serif;
`

const ParticleBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
`

const Section = styled.section<{ bgColor?: string; minHeight?: string }>`
  min-height: ${props => props.minHeight || '100vh'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 4rem 2rem;
  background: ${props => props.bgColor || 'transparent'};
  z-index: 2;
`

const HeroText = styled.h1`
  font-size: clamp(3rem, 10vw, 8rem);
  font-weight: 900;
  text-align: center;
  line-height: 1.1;
  margin: 0;
  position: relative;
  z-index: 10;
  
  .char {
    display: inline-block;
    will-change: transform, opacity, color;
    transition: color 0.3s ease;
    
    &:hover {
      color: ${colors.primary};
      transform: scale(1.2) rotate(5deg);
    }
  }
`

const MorphingTextContainer = styled.div`
  position: relative;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4rem 0;
  min-width: 600px;
  
  @media (max-width: 768px) {
    min-width: 90vw;
    height: 100px;
  }
`

const MorphingText = styled.h2`
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 700;
  position: absolute;
  color: transparent;
  background: linear-gradient(45deg, #4EB5FF, #FF6B6B, #38C172, #FFD93D);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  background-clip: text;
  white-space: nowrap;
  transform-origin: center;
  
  &.active {
    animation: ${gradientShift} 3s ease infinite;
  }
`

const TypewriterText = styled.div`
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: 600;
  color: ${colors.primary};
  margin: 2rem 0;
  position: relative;
  
  &::after {
    content: '|';
    position: absolute;
    right: -10px;
    animation: ${blink} 1s infinite;
    color: ${colors.accent};
  }
`

const FeatureCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 3rem;
  margin: 2rem 0;
  max-width: 800px;
  width: 100%;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(78, 181, 255, 0.1) 0%, transparent 70%);
    animation: ${pulse} 4s ease-in-out infinite;
  }
  
  &:hover {
    border-color: ${colors.primary};
    transform: translateY(-5px);
    transition: all 0.3s ease;
  }
`

const FeatureTitle = styled.h3`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${colors.primary};
  position: relative;
  z-index: 1;
  
  .highlight {
    color: ${colors.accent};
    text-shadow: 0 0 20px rgba(255, 217, 61, 0.5);
  }
`

const FeatureText = styled.p`
  font-size: 1.1rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 1;
  
  .word {
    display: inline-block;
    will-change: transform, opacity;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-3px);
      color: ${colors.accent};
    }
  }
`

const FloatingParticle = styled.div<{ delay: number; duration: number; size: number }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  animation: float ${props => props.duration}s ease-in-out ${props => props.delay}s infinite;
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0) translateX(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateY(-100vh) translateX(${() => (Math.random() - 0.5) * 200}px);
      opacity: 0;
    }
  }
`

const CTAButton = styled(motion.button)`
  font-size: 1.2rem;
  font-weight: 600;
  padding: 1.5rem 3rem;
  border: none;
  border-radius: 50px;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
  color: white;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease;
  margin-top: 3rem;
  z-index: 10;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  &:hover::before {
    width: 300px;
    height: 300px;
  }
`

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 50px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 8px;
  z-index: 10;
  
  &::before {
    content: '';
    width: 4px;
    height: 10px;
    background: ${colors.primary};
    border-radius: 2px;
    animation: scroll 2s infinite;
  }
  
  @keyframes scroll {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    50% {
      transform: translateY(15px);
      opacity: 0.5;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 3rem auto;
`

const ServiceCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, transparent, rgba(78, 181, 255, 0.1), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s;
  }
  
  &:hover::before {
    transform: translateX(100%);
  }
  
  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    display: block;
    animation: ${float} 3s ease-in-out infinite;
  }
  
  h4 {
    font-size: 1.5rem;
    color: ${colors.primary};
    margin-bottom: 1rem;
  }
  
  p {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
  }
`

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 2rem;
  max-width: 1000px;
  margin: 4rem auto;
`

const StatCard = styled(motion.div)`
  text-align: center;
  padding: 2rem;
  
  .number {
    font-size: clamp(3rem, 5vw, 4rem);
    font-weight: 900;
    color: ${colors.accent};
    text-shadow: 0 0 30px rgba(255, 217, 61, 0.5);
    margin-bottom: 0.5rem;
    
    span {
      font-size: 0.7em;
      color: ${colors.primary};
    }
  }
  
  .label {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.8);
  }
`

const TestimonialCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
  margin: 1rem;
  max-width: 400px;
  position: relative;
  
  &::before {
    content: '"';
    position: absolute;
    top: -20px;
    left: 20px;
    font-size: 5rem;
    color: ${colors.primary};
    opacity: 0.3;
  }
  
  .content {
    font-style: italic;
    margin-bottom: 1.5rem;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.9);
  }
  
  .author {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    .avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.5rem;
      color: white;
    }
    
    .info {
      .name {
        font-weight: 600;
        color: ${colors.primary};
        margin-bottom: 0.25rem;
      }
      
      .role {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }
`

const TimelineContainer = styled.div`
  max-width: 1000px;
  margin: 4rem auto;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 100%;
    background: linear-gradient(to bottom, ${colors.primary}, ${colors.secondary});
    
    @media (max-width: 768px) {
      left: 30px;
    }
  }
`

const TimelineItem = styled(motion.div)<{ align: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  margin: 3rem 0;
  position: relative;
  
  ${props => props.align === 'left' ? css`
    justify-content: flex-start;
    text-align: right;
    
    .content {
      padding-right: 3rem;
    }
  ` : css`
    justify-content: flex-end;
    text-align: left;
    
    .content {
      padding-left: 3rem;
    }
  `}
  
  .content {
    width: 45%;
    
    @media (max-width: 768px) {
      width: calc(100% - 80px);
      margin-left: 80px;
      text-align: left;
      padding: 0 !important;
    }
  }
  
  .marker {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 20px;
    background: ${colors.primary};
    border-radius: 50%;
    box-shadow: 0 0 20px rgba(78, 181, 255, 0.5);
    
    @media (max-width: 768px) {
      left: 30px;
    }
  }
  
  h4 {
    font-size: 1.5rem;
    color: ${colors.accent};
    margin-bottom: 0.5rem;
  }
  
  p {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
  }
`

const FAQContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`

const FAQItem = styled(motion.details)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  margin: 1rem 0;
  padding: 1.5rem;
  cursor: pointer;
  
  &[open] {
    border-color: ${colors.primary};
    
    summary::after {
      transform: rotate(180deg);
    }
  }
  
  summary {
    font-size: 1.2rem;
    font-weight: 600;
    color: ${colors.primary};
    display: flex;
    justify-content: space-between;
    align-items: center;
    list-style: none;
    
    &::-webkit-details-marker {
      display: none;
    }
    
    &::after {
      content: '▼';
      color: ${colors.accent};
      transition: transform 0.3s;
    }
  }
  
  p {
    margin-top: 1rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.8;
  }
`

const PricingCard = styled(motion.div)<{ featured?: boolean }>`
  background: ${props => props.featured 
    ? 'linear-gradient(135deg, rgba(78, 181, 255, 0.1), rgba(56, 193, 114, 0.1))' 
    : 'rgba(255, 255, 255, 0.05)'};
  backdrop-filter: blur(10px);
  border: ${props => props.featured ? '2px' : '1px'} solid ${props => props.featured ? colors.primary : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  position: relative;
  transform: ${props => props.featured ? 'scale(1.05)' : 'scale(1)'};
  
  ${props => props.featured && css`
    &::before {
      content: '人気No.1';
      position: absolute;
      top: -15px;
      left: 50%;
      transform: translateX(-50%);
      background: ${colors.accent};
      color: ${colors.dark};
      padding: 0.5rem 2rem;
      border-radius: 20px;
      font-weight: bold;
      font-size: 0.9rem;
    }
  `}
  
  .plan-name {
    font-size: 1.5rem;
    color: ${colors.primary};
    margin-bottom: 1rem;
  }
  
  .price {
    font-size: 3rem;
    font-weight: 900;
    color: ${colors.accent};
    margin: 1rem 0;
    
    span {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.6);
    }
  }
  
  .features {
    list-style: none;
    padding: 0;
    margin: 2rem 0;
    
    li {
      padding: 0.75rem 0;
      color: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      
      &::before {
        content: '✓';
        color: ${colors.secondary};
        font-weight: bold;
      }
    }
  }
`

const FloatingNav = styled.nav`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  padding: 1rem 2rem;
  display: flex;
  gap: 1.5rem;
  z-index: 100;
  
  @media (max-width: 768px) {
    top: auto;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    right: auto;
  }
  
  a {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s;
    
    &:hover {
      color: ${colors.primary};
    }
  }
`

// モーフィングするテキストの配列
const morphingWords = [
  "イノベーション",
  "トランスフォーメーション",
  "ディスラプション",
  "エボリューション",
  "レボリューション",
  "クリエイション",
  "オートメーション"
]

// タイプライターテキスト
const typewriterTexts = [
  "AIで起業の常識を覆す",
  "週15時間で月収200万円",
  "ノーコードで即実践",
  "自動化で自由を手に入れる"
]

// 特徴セクションのデータ
const features = [
  {
    title: "AIが変える未来",
    text: "ChatGPTやClaudeなどの最新AI技術を活用し、ビジネスプロセスを根本から変革。人間の創造性とAIの処理能力を組み合わせ、これまでにない価値を生み出します。"
  },
  {
    title: "ノーコードの力",
    text: "プログラミング知識なしで、アイデアを即座に形に。Bubble、Zapier、Makeなどのツールを駆使し、開発期間を90%短縮しながら、柔軟性の高いシステムを構築します。"
  },
  {
    title: "起業の新しい形",
    text: "固定費を最小限に抑え、自動化を最大限に活用。週15時間の労働で月収200万円を実現する、次世代の起業モデルをAIDXschoolで学びましょう。"
  }
]

// サービスデータ
const services = [
  {
    icon: "🤖",
    title: "AI活用講座",
    description: "ChatGPT、Claude、Midjourney等の最新AIツールを実践的に学習"
  },
  {
    icon: "🔧",
    title: "ノーコード開発",
    description: "Bubble、Zapier、Makeを使った高速プロトタイピング"
  },
  {
    icon: "⚡",
    title: "自動化構築",
    description: "業務プロセスを自動化し、効率を10倍に向上"
  },
  {
    icon: "📊",
    title: "データ分析",
    description: "AIを活用したデータドリブンな意思決定"
  },
  {
    icon: "🎯",
    title: "マーケティング",
    description: "AI×SNSで効果的な集客システムを構築"
  },
  {
    icon: "💰",
    title: "収益化戦略",
    description: "サブスクリプションモデルで安定収入を実現"
  }
]

// 統計データ
const stats = [
  { number: "1,200", suffix: "+", label: "受講生数" },
  { number: "95", suffix: "%", label: "満足度" },
  { number: "150", suffix: "万円", label: "平均月収" },
  { number: "3", suffix: "ヶ月", label: "収益化まで" }
]

// お客様の声
const testimonials = [
  {
    content: "AIツールの活用で業務時間が1/10に。空いた時間で新規事業を立ち上げ、月収300万円を達成しました。",
    name: "田中 一郎",
    role: "AIコンサルタント",
    initial: "T"
  },
  {
    content: "プログラミング経験ゼロでしたが、ノーコードで自社サービスを開発。3ヶ月で黒字化に成功しました。",
    name: "佐藤 花子",
    role: "ECサイト運営",
    initial: "S"
  },
  {
    content: "自動化システムの構築により、週15時間の労働で月収200万円を実現。家族との時間が増えました。",
    name: "鈴木 太郎",
    role: "自動化エンジニア",
    initial: "S"
  }
]

// タイムラインデータ
const timeline = [
  {
    title: "Week 1-2",
    description: "AI基礎とツールの使い方を習得",
    align: "left" as const
  },
  {
    title: "Week 3-4",
    description: "ノーコード開発でプロトタイプ作成",
    align: "right" as const
  },
  {
    title: "Week 5-6",
    description: "自動化システムの構築",
    align: "left" as const
  },
  {
    title: "Week 7-8",
    description: "実践プロジェクトの立ち上げ",
    align: "right" as const
  },
  {
    title: "Week 9-12",
    description: "収益化とスケーリング",
    align: "left" as const
  }
]

// FAQデータ
const faqs = [
  {
    question: "プログラミング経験がなくても大丈夫ですか？",
    answer: "はい、全く問題ありません。AIDXschoolではノーコードツールを中心に学習するため、プログラミング経験は不要です。実際に受講生の80%以上がプログラミング未経験者です。"
  },
  {
    question: "どれくらいの期間で成果が出ますか？",
    answer: "個人差はありますが、多くの受講生が3-6ヶ月で最初の収益を上げています。カリキュラムに沿って実践すれば、着実に成果を出すことができます。"
  },
  {
    question: "仕事をしながら受講できますか？",
    answer: "はい、可能です。オンデマンド形式の講座なので、自分のペースで学習できます。週10時間程度の学習時間を確保できれば、十分に成果を出すことができます。"
  },
  {
    question: "サポート体制はどうなっていますか？",
    answer: "専任メンターによる個別サポート、24時間対応のコミュニティ、週次のグループセッションなど、充実したサポート体制を整えています。"
  },
  {
    question: "返金保証はありますか？",
    answer: "30日間の返金保証があります。カリキュラムに満足いただけない場合は、理由を問わず全額返金いたします。"
  }
]

// 料金プラン
const pricingPlans = [
  {
    name: "ベーシックプラン",
    price: "198,000",
    features: [
      "基礎カリキュラム完全アクセス",
      "AIツール基本講座",
      "月2回のグループコンサル",
      "専用Slackコミュニティ",
      "30日間返金保証"
    ]
  },
  {
    name: "プロフェッショナルプラン",
    price: "498,000",
    features: [
      "全カリキュラム完全アクセス",
      "1対1個別コンサル月4回",
      "実践プロジェクト支援",
      "ビジネスマッチング機会",
      "優先サポート",
      "60日間返金保証"
    ],
    featured: true
  },
  {
    name: "エンタープライズプラン",
    price: "1,980,000",
    features: [
      "完全カスタマイズカリキュラム",
      "週次個別コンサル",
      "事業立ち上げ完全支援",
      "投資家ネットワークアクセス",
      "専属メンター配置",
      "90日間返金保証"
    ]
  }
]

// カスタムSplitTextの実装
const splitTextToSpans = (text: string, className: string = 'char') => {
  return text.split('').map((char, index) => (
    <span key={index} className={className}>
      {char === ' ' ? '\u00A0' : char}
    </span>
  ))
}

const splitTextToWords = (text: string) => {
  return text.split(' ').map((word, index) => (
    <span key={index} className="word">
      {word}{index < text.split(' ').length - 1 ? '\u00A0' : ''}
    </span>
  ))
}

// パーティクルコンポーネント
function Particles() {
  return (
    <ParticleBackground>
      {[...Array(50)].map((_, i) => (
        <FloatingParticle
          key={i}
          delay={i * 0.2}
          duration={20 + Math.random() * 10}
          size={Math.random() * 4 + 1}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.2
          }}
        />
      ))}
    </ParticleBackground>
  )
}

// メインコンポーネント
export default function TextMorphing() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroTextRef = useRef<HTMLHeadingElement>(null)
  const morphingContainerRef = useRef<HTMLDivElement>(null)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentTypewriterIndex, setCurrentTypewriterIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const featureRefs = useRef<(HTMLDivElement | null)[]>([])
  const serviceRefs = useRef<(HTMLDivElement | null)[]>([])
  const statsRef = useRef<HTMLDivElement>(null)
  const timelineRefs = useRef<(HTMLDivElement | null)[]>([])

  // アニメーション設定
  useEffect(() => {
    const ctx = gsap.context(() => {
      // ヒーローテキストのアニメーション
      const chars = heroTextRef.current?.querySelectorAll('.char')
      if (chars) {
        gsap.fromTo(chars,
          {
            opacity: 0,
            y: 100,
            rotationX: -90,
            scale: 0.5
          },
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            scale: 1,
            duration: 1.2,
            stagger: {
              each: 0.05,
              from: 'random'
            },
            ease: 'power3.out',
            onComplete: () => {
              // ホバーアニメーションを有効化
              chars.forEach(char => {
                char.addEventListener('mouseenter', () => {
                  gsap.to(char, {
                    scale: 1.2,
                    rotation: 5,
                    color: colors.primary,
                    duration: 0.3
                  })
                })
                char.addEventListener('mouseleave', () => {
                  gsap.to(char, {
                    scale: 1,
                    rotation: 0,
                    color: '#ffffff',
                    duration: 0.3
                  })
                })
              })
            }
          }
        )
      }

      // スクロールトリガーでのフィーチャーアニメーション
      featureRefs.current.forEach((ref, index) => {
        if (!ref) return

        const title = ref.querySelector('h3')
        const words = ref.querySelectorAll('.word')

        gsap.fromTo(ref,
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
            scrollTrigger: {
              trigger: ref,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        )

        gsap.fromTo(title,
          {
            opacity: 0,
            x: -100
          },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            delay: 0.2,
            scrollTrigger: {
              trigger: ref,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        )

        gsap.fromTo(words,
          {
            opacity: 0,
            y: 20,
            rotationX: -90
          },
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.6,
            stagger: 0.02,
            scrollTrigger: {
              trigger: ref,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      })

      // サービスカードのアニメーション
      serviceRefs.current.forEach((ref, index) => {
        if (!ref) return

        gsap.fromTo(ref,
          {
            opacity: 0,
            y: 50,
            scale: 0.8
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            delay: index * 0.1,
            scrollTrigger: {
              trigger: ref,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      })

      // 統計アニメーション
      if (statsRef.current) {
        const numbers = statsRef.current.querySelectorAll('.number')
        numbers.forEach(number => {
          const value = parseInt(number.textContent || '0')
          const obj = { value: 0 }
          
          gsap.to(obj, {
            value: value,
            duration: 2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: number,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            },
            onUpdate: () => {
              const suffix = number.querySelector('span')?.textContent || ''
              number.textContent = Math.floor(obj.value).toString()
              if (suffix) {
                const span = document.createElement('span')
                span.textContent = suffix
                number.appendChild(span)
              }
            }
          })
        })
      }

      // タイムラインアニメーション
      timelineRefs.current.forEach((ref, index) => {
        if (!ref) return

        gsap.fromTo(ref,
          {
            opacity: 0,
            x: index % 2 === 0 ? -100 : 100
          },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            scrollTrigger: {
              trigger: ref,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      })

    }, containerRef)

    return () => ctx.revert()
  }, [])

  // モーフィングテキストのアニメーション
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % morphingWords.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // タイプライターエフェクト
  useEffect(() => {
    const typeInterval = setInterval(() => {
      if (isTyping) {
        setTimeout(() => {
          setIsTyping(false)
        }, 3000)
      } else {
        setCurrentTypewriterIndex((prev) => (prev + 1) % typewriterTexts.length)
        setIsTyping(true)
      }
    }, 4000)

    return () => clearInterval(typeInterval)
  }, [isTyping])

  // モーフィングアニメーション
  useEffect(() => {
    const texts = morphingContainerRef.current?.querySelectorAll('h2')
    if (!texts) return

    texts.forEach((text, index) => {
      if (index === currentWordIndex) {
        gsap.to(text, {
          opacity: 1,
          scale: 1,
          rotationY: 0,
          duration: 0.5,
          ease: 'power2.inOut'
        })
        text.classList.add('active')
      } else {
        gsap.to(text, {
          opacity: 0,
          scale: 0.8,
          rotationY: 90,
          duration: 0.5,
          ease: 'power2.inOut'
        })
        text.classList.remove('active')
      }
    })
  }, [currentWordIndex])

  return (
    <Container ref={containerRef}>
      <Particles />
      
      {/* ナビゲーション */}
      <FloatingNav>
        <a href="#features">特徴</a>
        <a href="#services">サービス</a>
        <a href="#testimonials">実績</a>
        <a href="#pricing">料金</a>
        <a href="#contact">お問い合わせ</a>
      </FloatingNav>

      {/* ヒーローセクション */}
      <Section>
        <HeroText ref={heroTextRef}>
          {splitTextToSpans('言葉が踊り出す')}
        </HeroText>
        
        {/* モーフィングテキスト */}
        <MorphingTextContainer ref={morphingContainerRef}>
          {morphingWords.map((word, index) => (
            <MorphingText
              key={index}
              style={{
                opacity: index === 0 ? 1 : 0,
                transform: index === 0 ? 'scale(1) rotateY(0)' : 'scale(0.8) rotateY(90deg)'
              }}
            >
              {word}
            </MorphingText>
          ))}
        </MorphingTextContainer>

        {/* タイプライターテキスト */}
        <TypewriterText>
          {isTyping ? typewriterTexts[currentTypewriterIndex] : ''}
        </TypewriterText>

        <CTAButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          無料で体験を始める
        </CTAButton>

        <ScrollIndicator />
      </Section>

      {/* 特徴セクション */}
      <Section id="features">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            marginBottom: '3rem',
            textAlign: 'center',
            color: colors.primary
          }}
        >
          AIDXschoolの特徴
        </motion.h2>
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            ref={(el) => {
              if (el) featureRefs.current[index] = el
            }}
            whileHover={{ scale: 1.02 }}
          >
            <FeatureTitle>
              {feature.title.split('').map((char, i) => (
                <span key={i} className={char === 'A' || char === 'I' ? 'highlight' : ''}>
                  {char}
                </span>
              ))}
            </FeatureTitle>
            <FeatureText>
              {splitTextToWords(feature.text)}
            </FeatureText>
          </FeatureCard>
        ))}
      </Section>

      {/* サービスセクション */}
      <Section id="services" bgColor="rgba(0, 0, 0, 0.3)">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            marginBottom: '3rem',
            textAlign: 'center',
            color: colors.primary
          }}
        >
          提供サービス
        </motion.h2>
        <Grid>
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              ref={(el) => {
                if (el) serviceRefs.current[index] = el
              }}
              whileHover={{ y: -10 }}
            >
              <span className="icon">{service.icon}</span>
              <h4>{service.title}</h4>
              <p>{service.description}</p>
            </ServiceCard>
          ))}
        </Grid>
      </Section>

      {/* 統計セクション */}
      <Section minHeight="auto">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            marginBottom: '3rem',
            textAlign: 'center',
            color: colors.primary
          }}
        >
          実績とデータ
        </motion.h2>
        <StatsContainer ref={statsRef}>
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="number">
                {stat.number}<span>{stat.suffix}</span>
              </div>
              <div className="label">{stat.label}</div>
            </StatCard>
          ))}
        </StatsContainer>
      </Section>

      {/* お客様の声 */}
      <Section id="testimonials" bgColor="rgba(0, 0, 0, 0.2)">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            marginBottom: '3rem',
            textAlign: 'center',
            color: colors.primary
          }}
        >
          受講生の成功事例
        </motion.h2>
        <Grid>
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="content">{testimonial.content}</div>
              <div className="author">
                <div className="avatar">{testimonial.initial}</div>
                <div className="info">
                  <div className="name">{testimonial.name}</div>
                  <div className="role">{testimonial.role}</div>
                </div>
              </div>
            </TestimonialCard>
          ))}
        </Grid>
      </Section>

      {/* タイムライン */}
      <Section minHeight="auto">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            marginBottom: '3rem',
            textAlign: 'center',
            color: colors.primary
          }}
        >
          学習の流れ
        </motion.h2>
        <TimelineContainer>
          {timeline.map((item, index) => (
            <TimelineItem
              key={index}
              ref={(el) => {
                if (el) timelineRefs.current[index] = el
              }}
              align={item.align}
              initial={{ opacity: 0, x: item.align === 'left' ? -100 : 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="content">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
              <div className="marker" />
            </TimelineItem>
          ))}
        </TimelineContainer>
      </Section>

      {/* 料金プラン */}
      <Section id="pricing" bgColor="rgba(0, 0, 0, 0.3)">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            marginBottom: '3rem',
            textAlign: 'center',
            color: colors.primary
          }}
        >
          料金プラン
        </motion.h2>
        <Grid>
          {pricingPlans.map((plan, index) => (
            <PricingCard
              key={index}
              featured={plan.featured}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="plan-name">{plan.name}</div>
              <div className="price">
                ¥{plan.price}<span>/一括</span>
              </div>
              <ul className="features">
                {plan.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
              <CTAButton
                style={{ marginTop: '2rem', width: '100%' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                このプランを選ぶ
              </CTAButton>
            </PricingCard>
          ))}
        </Grid>
      </Section>

      {/* FAQ */}
      <Section minHeight="auto">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            marginBottom: '3rem',
            textAlign: 'center',
            color: colors.primary
          }}
        >
          よくあるご質問
        </motion.h2>
        <FAQContainer>
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </FAQItem>
          ))}
        </FAQContainer>
      </Section>

      {/* CTA セクション */}
      <Section id="contact" bgColor={`linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', maxWidth: '800px' }}
        >
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            marginBottom: '2rem',
            color: colors.primary
          }}>
            今すぐ始めよう
          </h2>
          <p style={{
            fontSize: '1.2rem',
            marginBottom: '3rem',
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: 1.8
          }}>
            AIDXschoolで、AIとノーコードの力を使って
            <br />
            あなたの起業の夢を現実にしましょう。
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <CTAButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              無料相談を予約する
            </CTAButton>
            <CTAButton
              style={{
                background: 'transparent',
                border: `2px solid ${colors.primary}`
              }}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(78, 181, 255, 0.1)' }}
              whileTap={{ scale: 0.95 }}
            >
              資料をダウンロード
            </CTAButton>
          </div>
        </motion.div>
      </Section>
    </Container>
  )
}