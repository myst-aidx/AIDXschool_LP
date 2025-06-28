// components/HorizontalParallax.tsx
// GSAP横スクロールパララックス - AIDXschool起業塾の革新的な学習体験

import { useLayoutEffect, useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// GSAPプラグインの登録
// ScrollTriggerはGSAPのスクロール連動アニメーションを可能にする強力なプラグインです
gsap.registerPlugin(ScrollTrigger)

// スタイルコンポーネント定義
// styled-componentsを使用することで、コンポーネントスコープのCSSを実現し、
// スタイルの再利用性と保守性を高めています

const Container = styled.div`
  /* ルートコンテナ: スクロール領域を確保する要素
   * height: 300vhにより、縦スクロールできる領域を作成
   * これがScrollTriggerのアニメーション範囲となります */
  height: 300vh;
  position: relative;
  background: linear-gradient(to bottom, #0a0e27, #1a1f3a);
  overflow: hidden;
`

const HorizontalTrack = styled.div`
  /* 水平スクロールトラック: 実際に横に動く要素
   * position: stickyで画面上部に固定され、
   * GSAPによって水平方向に移動します */
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  will-change: transform; /* パフォーマンス最適化: transformの変更を予告 */
`

const Section = styled.section<{ bgColor: string }>`
  /* 個別セクション: 各画面を構成する要素
   * 画面幅いっぱい(100vw)のサイズで、横に並びます */
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  background: ${props => props.bgColor};
  flex-shrink: 0; /* flexboxでの縮小を防ぐ */
`

const SectionTitle = styled.h2`
  /* セクションタイトル: パララックス効果の対象となる見出し
   * z-indexで装飾要素より前面に配置 */
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 900;
  color: #ffffff;
  text-shadow: 0 0 40px rgba(255, 255, 255, 0.5);
  z-index: 2;
  position: relative;
  letter-spacing: 0.05em;
  
  /* 日本語フォントの美しい表示のための設定 */
  font-family: 'Noto Sans JP', sans-serif;
  font-feature-settings: "palt"; /* プロポーショナルメトリクスを有効化 */
`

const FloatingElement = styled.div<{ 
  top: string; 
  left: string; 
  size: string;
  color: string;
}>`
  /* 装飾要素: パララックス効果で異なる速度で動く要素
   * position: absoluteで各セクション内に自由配置 */
  position: absolute;
  top: ${props => props.top};
  left: ${props => props.left};
  width: ${props => props.size};
  height: ${props => props.size};
  background: ${props => props.color};
  border-radius: 50%;
  opacity: 0.6;
  filter: blur(40px);
  will-change: transform; /* パフォーマンス最適化 */
  pointer-events: none; /* クリックイベントを透過 */
`

const InfoPanel = styled.div`
  /* 情報パネル: 各セクションの説明文を表示 */
  position: absolute;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  padding: 0 2rem;
  
  p {
    font-size: 1.2rem;
    line-height: 1.8;
    margin-top: 1rem;
  }
`

const CTAButton = styled.button`
  /* CTAボタン: 各セクションのアクションボタン */
  position: absolute;
  bottom: 5%;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 3rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateX(-50%) translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
`

const NavigationDots = styled.div`
  /* ナビゲーションドット: 現在位置を示すインジケーター */
  position: fixed;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Dot = styled.button<{ $active: boolean }>`
  /* 個別ドット: クリックで該当セクションへ移動 */
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: ${props => props.$active ? '#ffffff' : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.5);
    transform: scale(1.2);
  }
`

const FloatingNav = styled.nav`
  /* フローティングナビゲーション: 技術比較セクションへのアクセス */
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
`

const FloatingNavButton = styled.button`
  /* フローティングナビボタン */
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 30px rgba(102, 126, 234, 0.6);
  }
`

const TechComparisonSection = styled.div<{ $isOpen: boolean }>`
  /* 技術比較セクション: 常に100vw幅を保つ */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${props => props.$isOpen ? '80vh' : '0'};
  background: rgba(20, 20, 40, 0.98);
  backdrop-filter: blur(20px);
  transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  z-index: 2000;
  width: 100vw;
`

const TechComparisonContent = styled.div`
  /* 技術比較コンテンツ */
  height: 100%;
  overflow-y: auto;
  padding: 3rem;
  max-width: 1400px;
  margin: 0 auto;
`

const TechGrid = styled.div`
  /* 技術グリッド: 各技術の比較カードを配置 */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`

const TechCard = styled.div`
  /* 技術カード: 個別技術の詳細情報 */
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #ffffff;
  }
  
  p {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  
  .tech-stats {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
    
    span {
      display: flex;
      justify-content: space-between;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9rem;
      
      strong {
        color: #667eea;
      }
    }
  }
`

const CloseButton = styled.button`
  /* 閉じるボタン */
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }
`

const HeaderSection = styled.header`
  /* ヘッダーセクション: ファーストビュー */
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
  position: relative;
  overflow: hidden;
`

const HeroTitle = styled.h1`
  /* メインタイトル */
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 900;
  color: #ffffff;
  text-align: center;
  margin-bottom: 1rem;
  z-index: 2;
  position: relative;
`

const HeroSubtitle = styled.p`
  /* サブタイトル */
  font-size: clamp(1rem, 2vw, 1.5rem);
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  max-width: 600px;
  line-height: 1.6;
  z-index: 2;
  position: relative;
`

const ScrollIndicator = styled.div`
  /* スクロールインジケーター */
  position: absolute;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  animation: bounce 2s infinite;
  
  @keyframes bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(10px); }
  }
  
  span {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
  }
  
  svg {
    width: 30px;
    height: 30px;
    fill: rgba(255, 255, 255, 0.6);
  }
`

// 技術比較データ: 横スクロール実装技術
const techComparisonData = [
  {
    name: 'GSAP ScrollTrigger',
    description: 'プロフェッショナルなスクロールアニメーション',
    stats: {
      'パフォーマンス': '最高',
      '学習コスト': '中',
      'ブラウザサポート': '全て',
      '機能性': '完璧',
      '料金': '有料'
    }
  },
  {
    name: 'CSS Scroll Snap',
    description: 'ネイティブCSSによるシンプルな実装',
    stats: {
      'パフォーマンス': '高',
      '学習コスト': '低',
      'ブラウザサポート': 'モダン',
      '機能性': '基本',
      '料金': '無料'
    }
  },
  {
    name: 'Swiper.js',
    description: 'モバイルフレンドリーなスライダー',
    stats: {
      'パフォーマンス': '良',
      '学習コスト': '低',
      'ブラウザサポート': '全て',
      '機能性': '豊富',
      '料金': '無料'
    }
  },
  {
    name: 'Framer Motion',
    description: 'React専用の宣言的アニメーション',
    stats: {
      'パフォーマンス': '良',
      '学習コスト': '中',
      'ブラウザサポート': '全て',
      '機能性': '高',
      '料金': '無料'
    }
  },
  {
    name: 'Locomotive Scroll',
    description: 'スムーススクロールとパララックス',
    stats: {
      'パフォーマンス': '中',
      '学習コスト': '中',
      'ブラウザサポート': 'モダン',
      '機能性': '高',
      '料金': '無料'
    }
  },
  {
    name: 'AOS (Animate On Scroll)',
    description: 'シンプルなスクロールアニメーション',
    stats: {
      'パフォーマンス': '良',
      '学習コスト': '最低',
      'ブラウザサポート': '全て',
      '機能性': '基本',
      '料金': '無料'
    }
  }
]

// セクションデータ: AIDXschoolの学習ステップ
const sections = [
  {
    title: '基礎習得',
    subtitle: 'Foundation',
    bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: 'Web技術の基礎からビジネスの本質まで、起業に必要なすべてを学びます',
    details: [
      'HTML/CSS/JavaScriptの基礎',
      'ノーコードツールの活用法',
      'AIツールの基本操作',
      'ビジネスモデル設計'
    ],
    cta: '基礎カリキュラムを確認',
    floatingElements: [
      { top: '20%', left: '10%', size: '150px', color: 'rgba(102, 126, 234, 0.5)' },
      { top: '60%', left: '70%', size: '100px', color: 'rgba(118, 75, 162, 0.5)' },
      { top: '40%', left: '40%', size: '200px', color: 'rgba(255, 255, 255, 0.1)' },
    ]
  },
  {
    title: '実践開発',
    subtitle: 'Development',
    bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    description: '実際に動くプロダクトを開発しながら、現場で使えるスキルを習得します',
    details: [
      'ランディングページ制作',
      'Webアプリケーション開発',
      '自動化ワークフロー構築',
      'データ分析ダッシュボード'
    ],
    cta: '実践プロジェクトを見る',
    floatingElements: [
      { top: '15%', left: '80%', size: '120px', color: 'rgba(240, 147, 251, 0.5)' },
      { top: '70%', left: '20%', size: '180px', color: 'rgba(245, 87, 108, 0.5)' },
      { top: '35%', left: '50%', size: '150px', color: 'rgba(255, 255, 255, 0.1)' },
    ]
  },
  {
    title: 'ビジネス実践',
    subtitle: 'Business',
    bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    description: '実際のクライアントワークを通じて、ビジネスの現場を体験します',
    details: [
      'クライアント獲得手法',
      '価格設定と提案術',
      'プロジェクトマネジメント',
      '継続的な成長戦略'
    ],
    cta: '卒業生の成功事例を見る',
    floatingElements: [
      { top: '25%', left: '15%', size: '140px', color: 'rgba(79, 172, 254, 0.5)' },
      { top: '55%', left: '75%', size: '160px', color: 'rgba(0, 242, 254, 0.5)' },
      { top: '45%', left: '35%', size: '130px', color: 'rgba(255, 255, 255, 0.1)' },
    ]
  },
  {
    title: '独立成功',
    subtitle: 'Success',
    bgColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    description: 'AIDXschoolで得たスキルを活かして、あなただけのビジネスを立ち上げます',
    details: [
      '月収100万円超の卒業生多数',
      '起業3ヶ月で黒字化達成',
      '継続的な案件紹介',
      '卒業後も続くサポート'
    ],
    cta: '無料相談に申し込む',
    floatingElements: [
      { top: '30%', left: '25%', size: '170px', color: 'rgba(250, 112, 154, 0.5)' },
      { top: '65%', left: '65%', size: '110px', color: 'rgba(254, 225, 64, 0.5)' },
      { top: '20%', left: '55%', size: '190px', color: 'rgba(255, 255, 255, 0.1)' },
    ]
  }
]

// カリキュラムの詳細
const curriculumPhases = [
  {
    phase: 'Phase 1',
    title: '基礎構築期',
    duration: '4週間',
    topics: [
      'Web開発の基礎 (HTML/CSS/JS)',
      'ノーコードツール入門',
      'AIツールの活用法',
      'ビジネスモデル設計'
    ]
  },
  {
    phase: 'Phase 2',
    title: '実践開発期',
    duration: '4週間',
    topics: [
      'ランディングページ制作',
      'Webアプリ開発',
      '自動化システム構築',
      'データ分析ダッシュボード'
    ]
  },
  {
    phase: 'Phase 3',
    title: 'ビジネス実践期',
    duration: '4週間',
    topics: [
      '実クライアントプロジェクト',
      '価格設定と営業術',
      'ポートフォリオ作成',
      '独立準備と案件獲得'
    ]
  }
]

// 成功事例データ
const successStories = [
  {
    name: '田中 美紀さん',
    age: '32歳',
    background: '元事務職',
    achievement: '月収140万円達成',
    period: '卒業後3ヶ月',
    comment: '未経験から始めて、今では大手企業のLP制作を任されるまでに成長できました。'
  },
  {
    name: '佐藤 健太さん',
    age: '28歳',
    background: '元営業職',
    achievement: '月収250万円達成',
    period: '卒業後6ヶ月',
    comment: 'AIツールを活用した効率的な制作フローで、短期間で多数の案件をこなせるようになりました。'
  },
  {
    name: '鈴木 さゆりさん',
    age: '35歳',
    background: '元主婦',
    achievement: '月収80万円達成',
    period: '卒業後2ヶ月',
    comment: '子育てしながら在宅でできる仕事を探していました。AIDXschoolのおかげで理想の働き方を実現できました。'
  }
]

// 料金プラン
const pricingPlans = [
  {
    name: 'ベーシック',
    price: '¥298,000',
    duration: '3ヶ月間',
    features: [
      '全カリキュラムアクセス',
      '週次ライブ授業',
      'Slackサポート',
      '録画教材視聴可能',
      '基礎テンプレート提供'
    ],
    isPopular: false
  },
  {
    name: 'プロフェッショナル',
    price: '¥498,000',
    duration: '3ヶ月間',
    features: [
      'ベーシックの全て',
      '個別メンタリング',
      '案件紹介保証(3件)',
      '実案件ワーク',
      '優先サポート'
    ],
    isPopular: true
  },
  {
    name: 'エンタープライズ',
    price: '¥980,000',
    duration: '6ヶ月間',
    features: [
      'プロフェッショナルの全て',
      '無制限メンタリング',
      '大手案件紹介',
      'チーム開発支援',
      '起業コンサルティング'
    ],
    isPopular: false
  }
]

export default function HorizontalParallax() {
  // Refの定義: DOM要素への参照を保持
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState(0)
  const [isTechComparisonOpen, setIsTechComparisonOpen] = useState(false)

  useLayoutEffect(() => {
    // GSAPコンテキストの作成
    // これにより、コンポーネントのアンマウント時にアニメーションをクリーンアップできます
    const ctx = gsap.context(() => {
      // メインの水平スクロールアニメーション
      // xPercentを使用することで、要素の幅に対する相対的な移動を実現
      // これにより、異なる画面サイズでも一貫した動作を保証します
      gsap.to(trackRef.current, {
        xPercent: -100 * (sections.length - 1), // 最後のセクションまでスクロール
        ease: 'none', // スクロールに完全に同期させるため、イージングなし
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true, // スクロール中、トラックを画面に固定
          scrub: 1, // スクロールとアニメーションを滑らかに同期（1秒の遅延）
          end: () => '+=' + (trackRef.current?.scrollWidth || 0), // トラックの全幅分スクロール
          // markers: true, // デバッグ用（開発時のみ有効化）
          onUpdate: (self) => {
            const progress = self.progress
            const currentSection = Math.floor(progress * sections.length)
            setActiveSection(currentSection)
          }
        }
      })

      // セクションタイトルのパララックスアニメーション
      // 各タイトルが背景より少し遅れて動くことで、奥行き感を演出
      gsap.utils.toArray('.section-title').forEach((title: any, index) => {
        gsap.to(title, {
          x: -200, // 左に200px移動（背景より遅い速度）
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            scrub: 1,
            start: 'top top',
            end: 'bottom top',
          }
        })
      })

      // 装飾要素のパララックスアニメーション
      // 各要素がランダムな速度で動くことで、自然な奥行き感を創出
      gsap.utils.toArray('.floating-element').forEach((element: any) => {
        // ランダムな移動量を生成（-500px〜-100px）
        // 負の値が大きいほど速く動き、手前にあるように見えます
        const randomX = gsap.utils.random(-500, -100)
        
        gsap.to(element, {
          x: randomX,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            scrub: 1.5, // より滑らかな追従のため、少し大きめの値
            start: 'top top',
            end: 'bottom top',
          }
        })
      })

    }, containerRef) // コンテキストのスコープを指定

    // クリーンアップ関数
    // コンポーネントのアンマウント時にすべてのアニメーションを削除
    return () => ctx.revert()
  }, [])
  
  // ナビゲーションドットのクリックハンドラー
  const scrollToSection = (index: number) => {
    const scrollHeight = window.innerHeight * 2 // コンテナの高さ - 100vh
    const scrollPosition = (scrollHeight / (sections.length - 1)) * index
    window.scrollTo({ top: scrollPosition, behavior: 'smooth' })
  }

  return (
    <>
      {/* ヘッダーセクション */}
      <HeaderSection>
        <HeroTitle>AIDXschool起業塾</HeroTitle>
        <HeroSubtitle>
          横スクロールで体験する、あなたの起業ストーリー<br />
          AI×ノーコードで、今日から始まる新しい未来
        </HeroSubtitle>
        <ScrollIndicator>
          <span>スクロールして始める</span>
          <svg viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </ScrollIndicator>
      </HeaderSection>
      
      <Container ref={containerRef}>
        <HorizontalTrack ref={trackRef}>
          {sections.map((section, index) => (
            <Section key={index} bgColor={section.bgColor}>
              {/* パララックス効果の装飾要素 */}
              {section.floatingElements.map((element, elemIndex) => (
                <FloatingElement
                  key={elemIndex}
                  className="floating-element"
                  {...element}
                />
              ))}
              
              {/* セクションタイトル */}
              <SectionTitle className="section-title">
                {section.title}
                {section.subtitle && <span style={{ fontSize: '0.5em', display: 'block', opacity: 0.8, marginTop: '0.5rem' }}>{section.subtitle}</span>}
              </SectionTitle>
              
              {/* 情報パネル */}
              <InfoPanel>
                <p>{section.description}</p>
                {section.details && (
                  <ul style={{ listStyle: 'none', marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
                    {section.details.map((detail, i) => (
                      <li key={i} style={{ margin: '0.5rem 0' }}>✓ {detail}</li>
                    ))}
                  </ul>
                )}
              </InfoPanel>
              
              {/* CTAボタン */}
              {section.cta && (
                <CTAButton onClick={() => alert('AIDXschoolへお問い合わせいただきありがとうございます！')}>
                  {section.cta}
                </CTAButton>
              )}
            </Section>
          ))}
        </HorizontalTrack>
      </Container>
    
    {/* ナビゲーションドット */}
    <NavigationDots>
      {sections.map((_, index) => (
        <Dot
          key={index}
          $active={activeSection === index}
          onClick={() => scrollToSection(index)}
          aria-label={`Go to section ${index + 1}`}
        />
      ))}
    </NavigationDots>
    
    {/* フローティングナビゲーション */}
    <FloatingNav>
      <FloatingNavButton onClick={() => setIsTechComparisonOpen(!isTechComparisonOpen)}>
        <span>📊</span>
        <span>技術比較</span>
      </FloatingNavButton>
    </FloatingNav>
    
    {/* 技術比較セクション */}
    <TechComparisonSection $isOpen={isTechComparisonOpen}>
      <CloseButton onClick={() => setIsTechComparisonOpen(false)}>×</CloseButton>
      <TechComparisonContent>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>
          横スクロール実装技術の比較
        </h2>
        <p style={{ textAlign: 'center', marginBottom: '2rem', opacity: 0.8 }}>
          AIDXschoolでは、最新の横スクロール技術をマスターできます
        </p>
        
        <TechGrid>
          {techComparisonData.map((tech, index) => (
            <TechCard key={index}>
              <h3>{tech.name}</h3>
              <p>{tech.description}</p>
              <div className="tech-stats">
                {Object.entries(tech.stats).map(([key, value]) => (
                  <span key={key}>
                    {key}: <strong>{value}</strong>
                  </span>
                ))}
              </div>
            </TechCard>
          ))}
        </TechGrid>
        
        <div style={{ marginTop: '4rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', marginBottom: '2rem' }}>カリキュラム詳細</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            {curriculumPhases.map((phase, index) => (
              <div key={index} style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '2rem', borderRadius: '16px' }}>
                <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>{phase.phase}: {phase.title}</h4>
                <p style={{ marginBottom: '1rem', opacity: 0.8 }}>期間: {phase.duration}</p>
                <ul style={{ listStyle: 'none', opacity: 0.9 }}>
                  {phase.topics.map((topic, i) => (
                    <li key={i} style={{ margin: '0.5rem 0' }}>• {topic}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <h3 style={{ fontSize: '2rem', marginBottom: '2rem' }}>卒業生の成功事例</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            {successStories.map((story, index) => (
              <div key={index} style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '2rem', borderRadius: '16px' }}>
                <h4 style={{ color: '#f093fb', marginBottom: '0.5rem' }}>
                  {story.name} ({story.age})
                </h4>
                <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.5rem' }}>{story.background}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4facfe', marginBottom: '0.5rem' }}>
                  {story.achievement}
                </p>
                <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1rem' }}>{story.period}</p>
                <p style={{ fontStyle: 'italic', opacity: 0.9 }}>'{story.comment}'</p>
              </div>
            ))}
          </div>
          
          <h3 style={{ fontSize: '2rem', marginBottom: '2rem' }}>料金プラン</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {pricingPlans.map((plan, index) => (
              <div key={index} style={{ 
                background: plan.isPopular ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                padding: '2rem', 
                borderRadius: '16px',
                border: plan.isPopular ? '2px solid #667eea' : '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative'
              }}>
                {plan.isPopular && (
                  <span style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#667eea',
                    padding: '4px 16px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    人気No.1
                  </span>
                )}
                <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{plan.name}</h4>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#667eea', marginBottom: '0.5rem' }}>
                  {plan.price}
                </p>
                <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>{plan.duration}</p>
                <ul style={{ listStyle: 'none', marginBottom: '2rem' }}>
                  {plan.features.map((feature, i) => (
                    <li key={i} style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>✓ {feature}</li>
                  ))}
                </ul>
                <button style={{
                  width: '100%',
                  padding: '1rem',
                  background: plan.isPopular ? '#667eea' : 'transparent',
                  border: plan.isPopular ? 'none' : '2px solid #667eea',
                  color: plan.isPopular ? 'white' : '#667eea',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                onClick={() => alert('お申し込みありがとうございます！担当者よりご連絡させていただきます。')}
                >
                  申し込む
                </button>
              </div>
            ))}
          </div>
        </div>
      </TechComparisonContent>
    </TechComparisonSection>

    {/* 詳細なFAQセクション */}
    <Section bgColor="linear-gradient(135deg, #1a1f3a, #0a0e27)" data-section-id="faq">
      <SectionTitle>よくあるご質問</SectionTitle>
      <div style={{ maxWidth: '1200px', width: '100%', padding: '0 2rem' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '2rem',
          marginTop: '3rem'
        }}>
          {[
            {
              category: 'プログラムについて',
              questions: [
                {
                  q: 'プログラミング経験がなくても大丈夫ですか？',
                  a: 'はい、全く問題ありません。AIDXschoolはノーコード・ローコードツールを中心に学習するため、プログラミング経験は不要です。AIツールの活用により、技術的な知識がなくても高度なシステムを構築できます。'
                },
                {
                  q: '学習期間はどのくらいですか？',
                  a: '基本的には12週間（3ヶ月）のプログラムですが、個人のペースに合わせて最大20週間まで延長可能です。週10時間程度の学習時間を確保いただければ、着実にスキルを身につけることができます。'
                },
                {
                  q: 'どのような業界・ビジネスに応用できますか？',
                  a: 'EC、教育、コンサルティング、不動産、医療、飲食など、あらゆる業界に応用可能です。特に、業務効率化、顧客対応の自動化、データ分析、マーケティング自動化などの分野で大きな成果を上げています。'
                }
              ]
            },
            {
              category: 'サポートについて',
              questions: [
                {
                  q: 'どのようなサポートが受けられますか？',
                  a: '専任メンターによる週1回の個別面談、24時間対応のチャットサポート、受講生限定のコミュニティでの相互サポート、月2回のグループコンサルティングなど、充実したサポート体制を整えています。'
                },
                {
                  q: '卒業後のサポートはありますか？',
                  a: 'はい、卒業後も3ヶ月間の無料アフターサポートがあります。また、卒業生コミュニティへの永続的なアクセス権、最新情報の共有、ビジネスマッチングの機会提供など、長期的なサポートを行っています。'
                },
                {
                  q: '返金保証はありますか？',
                  a: '30日間の全額返金保証があります。プログラムの内容にご満足いただけない場合は、理由を問わず全額返金いたします。ただし、教材の50%以上を消化された場合は対象外となります。'
                }
              ]
            },
            {
              category: '料金・支払いについて',
              questions: [
                {
                  q: '分割払いは可能ですか？',
                  a: 'はい、最大24回までの分割払いに対応しています。クレジットカード、銀行振込、PayPalなど、様々な支払い方法をご用意しています。法人様向けの請求書払いも可能です。'
                },
                {
                  q: '追加費用はかかりますか？',
                  a: '基本的に追加費用はかかりません。ただし、一部の高度なAIツール（GPT-4 API、専門的な自動化ツールなど）を本格的に使用する場合は、別途利用料金が必要になる場合があります。'
                },
                {
                  q: '法人での申し込みは可能ですか？',
                  a: 'はい、法人様向けのプランもご用意しています。複数名での受講割引、カスタマイズ研修、出張研修なども承っています。詳細はお問い合わせください。'
                }
              ]
            }
          ].map((category, idx) => (
            <div key={idx} style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '2rem',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{ 
                fontSize: '1.5rem', 
                marginBottom: '1.5rem',
                color: '#38C172'
              }}>
                {category.category}
              </h3>
              {category.questions.map((item, qIdx) => (
                <details key={qIdx} style={{ marginBottom: '1rem' }}>
                  <summary style={{
                    cursor: 'pointer',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}>
                    {item.q}
                  </summary>
                  <p style={{
                    padding: '1rem',
                    marginTop: '0.5rem',
                    lineHeight: '1.8',
                    opacity: 0.9
                  }}>
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Section>

    {/* 特別オファーセクション */}
    <Section bgColor="linear-gradient(135deg, #FF6B6B, #FFD93D)" data-section-id="special-offer">
      <div style={{
        textAlign: 'center',
        maxWidth: '800px',
        padding: '0 2rem'
      }}>
        <h2 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: '#1a202c'
        }}>
          期間限定特別オファー
        </h2>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '3rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#FF6B6B',
            marginBottom: '1rem'
          }}>
            今なら最大50%OFF
          </div>
          <div style={{
            fontSize: '1.2rem',
            color: '#4a5568',
            marginBottom: '2rem',
            lineHeight: '1.8'
          }}>
            先着100名様限定で、全コースが特別価格でご受講いただけます。<br/>
            さらに、以下の特典も無料でプレゼント！
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {[
              { icon: '🎁', title: 'AI活用事例集', value: '¥50,000相当' },
              { icon: '📚', title: '起業実践ガイド', value: '¥30,000相当' },
              { icon: '🤝', title: '個別コンサル1回', value: '¥100,000相当' },
              { icon: '💎', title: 'VIPコミュニティ', value: '¥priceless' }
            ].map((bonus, idx) => (
              <div key={idx} style={{
                padding: '1rem',
                background: 'rgba(255, 107, 107, 0.1)',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{bonus.icon}</div>
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{bonus.title}</div>
                <div style={{ fontSize: '0.9rem', color: '#FF6B6B' }}>{bonus.value}</div>
              </div>
            ))}
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1a202c',
            marginBottom: '2rem'
          }}>
            残り<span style={{ color: '#FF6B6B', fontSize: '2rem' }}>23</span>名
          </div>
          <button style={{
            background: 'linear-gradient(135deg, #FF6B6B, #FFD93D)',
            color: 'white',
            padding: '1.5rem 4rem',
            borderRadius: '50px',
            border: 'none',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(255, 107, 107, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 107, 107, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 107, 107, 0.4)'
          }}
          onClick={() => alert('特別オファーページへ移動します')}
          >
            今すぐ特別価格で申し込む
          </button>
        </div>
      </div>
      <FloatingElement
        top="10%"
        left="5%"
        size="150px"
        color="rgba(255, 255, 255, 0.3)"
      />
      <FloatingElement
        top="70%"
        left="85%"
        size="200px"
        color="rgba(255, 217, 61, 0.3)"
      />
    </Section>

    {/* 講師紹介セクション */}
    <Section bgColor="linear-gradient(135deg, #667eea, #764ba2)" data-section-id="instructors">
      <SectionTitle>講師陣のご紹介</SectionTitle>
      <div style={{ maxWidth: '1200px', width: '100%', padding: '0 2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          marginTop: '3rem'
        }}>
          {[
            {
              name: '山田 太郎',
              title: 'AI起業戦略担当',
              image: '👨‍💼',
              bio: '元大手IT企業のAI事業部長。10年以上のAI開発経験を持ち、複数のAIスタートアップの立ち上げに成功。',
              achievements: [
                'AI関連特許15件保有',
                '累計調達額50億円超',
                'Forbes Japan 30 Under 30選出'
              ],
              specialties: ['ChatGPT活用', 'AI戦略立案', 'ビジネスモデル設計']
            },
            {
              name: '佐藤 花子',
              title: 'ノーコード開発担当',
              image: '👩‍💻',
              bio: 'ノーコード開発の第一人者。Bubble、Adalo、Zapierなど主要ツールの公認エキスパート。',
              achievements: [
                '開発アプリ200本以上',
                '指導実績1,000名超',
                'ノーコード開発書籍3冊出版'
              ],
              specialties: ['Bubble開発', 'Zapier自動化', 'Webflow制作']
            },
            {
              name: '鈴木 一郎',
              title: 'DXコンサルティング担当',
              image: '👨‍🏫',
              bio: '大手コンサルティングファーム出身。中小企業のDX支援で数多くの成功事例を創出。',
              achievements: [
                'DX支援企業300社以上',
                '平均売上向上率180%',
                '経済産業省DX認定講師'
              ],
              specialties: ['業務自動化', 'データ分析', '組織変革']
            }
          ].map((instructor, idx) => (
            <div key={idx} style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '2rem',
              backdropFilter: 'blur(10px)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem'
              }}>
                {instructor.image}
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                marginBottom: '0.5rem'
              }}>
                {instructor.name}
              </h3>
              <p style={{
                color: '#FFD93D',
                marginBottom: '1rem'
              }}>
                {instructor.title}
              </p>
              <p style={{
                fontSize: '0.9rem',
                lineHeight: '1.6',
                marginBottom: '1.5rem',
                opacity: 0.9
              }}>
                {instructor.bio}
              </p>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <h4 style={{
                  fontSize: '1rem',
                  marginBottom: '0.5rem',
                  color: '#38C172'
                }}>
                  実績
                </h4>
                <ul style={{
                  listStyle: 'none',
                  fontSize: '0.85rem'
                }}>
                  {instructor.achievements.map((achievement, aIdx) => (
                    <li key={aIdx} style={{ margin: '0.25rem 0' }}>
                      ✓ {achievement}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                {instructor.specialties.map((specialty, sIdx) => (
                  <span key={sIdx} style={{
                    background: 'rgba(56, 193, 114, 0.2)',
                    color: '#38C172',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem'
                  }}>
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>

    {/* 受講生の声（詳細版） */}
    <Section bgColor="linear-gradient(135deg, #0a0e27, #1a1f3a)" data-section-id="testimonials">
      <SectionTitle>受講生の成功ストーリー</SectionTitle>
      <div style={{ maxWidth: '1000px', width: '100%', padding: '0 2rem' }}>
        {[
          {
            name: '田中 美咲',
            age: 28,
            business: 'オンライン英会話スクール',
            revenue: '月商¥2,400,000',
            period: '起業6ヶ月',
            story: 'もともと英語教師として働いていましたが、時間と場所に縛られない働き方を求めてAIDXschoolに入学。ChatGPTを活用した学習プラン自動生成システムと、Bubbleで開発した予約管理システムにより、完全自動化されたオンライン英会話スクールを立ち上げました。',
            tools: ['ChatGPT', 'Bubble', 'Zapier', 'Stripe'],
            keySuccess: '生徒一人ひとりに最適化された学習プランをAIが自動生成',
            quote: 'AIの力で、教育の質を保ちながら、自分の時間も確保できるようになりました。'
          },
          {
            name: '山本 健太',
            age: 35,
            business: 'EC自動化コンサルティング',
            revenue: '月商¥8,500,000',
            period: '起業1年',
            story: '大手ECサイトの運営経験を活かし、中小企業向けのEC自動化コンサルティング事業を開始。Make（旧Integromat）を使った在庫管理・発送自動化システムの構築により、クライアント企業の業務効率を平均70%改善。',
            tools: ['Make', 'Shopify', 'Google Analytics', 'Slack'],
            keySuccess: '完全自動化により、1人で30社以上のクライアントを管理',
            quote: '技術的な知識がなくても、ノーコードツールで高度なシステムが構築できることに驚きました。'
          },
          {
            name: '鈴木 由美',
            age: 42,
            business: 'AI不動産査定サービス',
            revenue: '月商¥15,000,000',
            period: '起業1年半',
            story: '不動産業界20年の経験とAI技術を融合。物件情報を入力するだけで適正価格を算出するAI査定システムを開発。大手不動産会社との提携も実現し、業界に革新をもたらしています。',
            tools: ['GPT-4 API', 'Airtable', 'Retool', 'Tableau'],
            keySuccess: '査定精度95%以上を実現し、業界標準ツールとして採用',
            quote: 'AIDXschoolで学んだAI活用法が、20年のキャリアに新しい価値を生み出しました。'
          }
        ].map((testimonial, idx) => (
          <div key={idx} style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            padding: '3rem',
            marginBottom: '2rem',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: '2rem',
              alignItems: 'start'
            }}>
              <div>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  {idx === 0 ? '👩‍💼' : idx === 1 ? '👨‍💻' : '👩‍🏫'}
                </div>
                <h3 style={{
                  fontSize: '1.3rem',
                  marginBottom: '0.5rem'
                }}>
                  {testimonial.name}（{testimonial.age}歳）
                </h3>
                <p style={{
                  color: '#38C172',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
                  {testimonial.business}
                </p>
                <p style={{
                  fontSize: '1.8rem',
                  color: '#FFD93D',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
                  {testimonial.revenue}
                </p>
                <p style={{
                  opacity: 0.8,
                  fontSize: '0.9rem'
                }}>
                  {testimonial.period}
                </p>
              </div>
              <div>
                <p style={{
                  lineHeight: '1.8',
                  marginBottom: '1.5rem',
                  opacity: 0.9
                }}>
                  {testimonial.story}
                </p>
                <div style={{
                  background: 'rgba(56, 193, 114, 0.1)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{
                    fontSize: '1rem',
                    marginBottom: '0.5rem',
                    color: '#38C172'
                  }}>
                    成功のポイント
                  </h4>
                  <p style={{ fontSize: '0.9rem' }}>{testimonial.keySuccess}</p>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  marginBottom: '1.5rem'
                }}>
                  {testimonial.tools.map((tool, tIdx) => (
                    <span key={tIdx} style={{
                      background: 'rgba(102, 126, 234, 0.2)',
                      color: '#667eea',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem'
                    }}>
                      {tool}
                    </span>
                  ))}
                </div>
                <blockquote style={{
                  borderLeft: '3px solid #FFD93D',
                  paddingLeft: '1rem',
                  fontStyle: 'italic',
                  opacity: 0.9
                }}>
                  "{testimonial.quote}"
                </blockquote>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>

    {/* 最終CTA */}
    <Section bgColor="linear-gradient(135deg, #38C172, #4EB5FF)" data-section-id="final-cta">
      <div style={{
        textAlign: 'center',
        maxWidth: '800px',
        padding: '0 2rem'
      }}>
        <h2 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          color: 'white'
        }}>
          あなたの起業の夢を、今すぐ現実に
        </h2>
        <p style={{
          fontSize: '1.3rem',
          marginBottom: '3rem',
          lineHeight: '1.8',
          opacity: 0.95
        }}>
          AI時代の起業に必要なすべてがここにあります。<br/>
          技術革新の波に乗り遅れる前に、今すぐ行動を起こしましょう。
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {[
            { number: '3,000+', label: '卒業生数' },
            { number: '¥2.8M', label: '平均月商' },
            { number: '96%', label: '満足度' }
          ].map((stat, idx) => (
            <div key={idx} style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '1.5rem'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem'
              }}>
                {stat.number}
              </div>
              <div style={{ opacity: 0.9 }}>{stat.label}</div>
            </div>
          ))}
        </div>
        <button style={{
          background: 'white',
          color: '#38C172',
          padding: '1.5rem 4rem',
          borderRadius: '50px',
          border: 'none',
          fontSize: '1.3rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'
          e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)'
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)'
        }}
        onClick={() => alert('無料相談フォームへ移動します')}
        >
          無料相談を予約する →
        </button>
        <p style={{
          marginTop: '1.5rem',
          fontSize: '0.9rem',
          opacity: 0.8
        }}>
          ※ 完全無料・強引な勧誘は一切ありません
        </p>
      </div>
      <FloatingElement
        top="20%"
        left="10%"
        size="100px"
        color="rgba(255, 255, 255, 0.3)"
      />
      <FloatingElement
        top="60%"
        left="80%"
        size="150px"
        color="rgba(78, 181, 255, 0.3)"
      />
    </Section>

    {/* フッター */}
    <Section bgColor="#0a0e27" data-section-id="footer">
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        padding: '0 2rem'
      }}>
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
              color: '#38C172'
            }}>
              AIDXschool
            </h3>
            <p style={{
              fontSize: '0.9rem',
              lineHeight: '1.6',
              opacity: 0.8,
              marginBottom: '1.5rem'
            }}>
              AI×ノーコードで、誰もが起業家になれる時代を創造します。
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {['📧', '🐦', '📘', '📺'].map((icon, idx) => (
                <span key={idx} style={{
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {icon}
                </span>
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
              {['スタータープラン', 'プロフェッショナルプラン', 'マスタープラン', '法人研修', 'オンデマンド講座'].map((item, idx) => (
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
              {['よくある質問', 'お問い合わせ', '利用規約', 'プライバシーポリシー', '特定商取引法'].map((item, idx) => (
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
              メールマガジン
            </h4>
            <p style={{
              fontSize: '0.9rem',
              marginBottom: '1rem',
              opacity: 0.8
            }}>
              最新のAI起業情報をお届けします
            </p>
            <form style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                placeholder="メールアドレス"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.9rem'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#38C172',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#2F855A'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#38C172'}
              >
                登録
              </button>
            </form>
          </div>
        </div>
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '2rem',
          textAlign: 'center',
          opacity: 0.6,
          fontSize: '0.9rem'
        }}>
          <p>© 2024 AIDXschool. All rights reserved.</p>
          <p style={{ marginTop: '0.5rem' }}>
            〒100-0001 東京都千代田区千代田1-1 | TEL: 03-1234-5678
          </p>
        </div>
      </div>
    </Section>
      </TechComparisonContent>
    </TechComparisonSection>
    </>
  )
}