import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from 'framer-motion'
import { create } from 'zustand'
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

const typewriter = keyframes`
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
`

const aiGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(147, 51, 234, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(147, 51, 234, 1);
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

const sparkle = keyframes`
  0%, 100% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1) rotate(180deg);
    opacity: 1;
  }
`

// スタイルコンポーネント
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 25%,
    #f093fb 50%,
    #f5576c 75%,
    #4facfe 100%
  );
  position: relative;
  overflow-x: hidden;
`

const AIPersonaCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  
  &.selected {
    animation: ${aiGlow} 2s infinite;
    border-color: ${colors.purple};
  }
`

const ContentCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${colors.gradient};
  }
`

const GenerateButton = styled(motion.button)`
  background: ${colors.gradient};
  border: none;
  border-radius: 50px;
  padding: 1rem 2rem;
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(78, 181, 255, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(78, 181, 255, 0.4);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`

const TypewriterText = styled.div`
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid ${colors.purple};
  animation: ${typewriter} 3s steps(40, end), blink-caret 0.75s step-end infinite;
  
  @keyframes blink-caret {
    from, to { border-color: transparent; }
    50% { border-color: ${colors.purple}; }
  }
`

const FloatingElement = styled(motion.div)`
  position: absolute;
  animation: ${float} 6s ease-in-out infinite;
  z-index: 1;
`

const SparkleEffect = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: ${sparkle} 2s infinite;
  color: ${colors.accent};
  font-size: 1.5rem;
`

// Types
interface GeneratedContent {
  id: string
  type: 'business-idea' | 'course-outline' | 'marketing-copy' | 'landing-page'
  prompt: string
  content: string
  style: ContentStyle
  timestamp: Date
}

interface ContentStyle {
  tone: 'professional' | 'casual' | 'inspirational' | 'technical'
  length: 'short' | 'medium' | 'long'
  creativity: number // 0-100
  focus: string[]
}

interface AIPersona {
  name: string
  avatar: string
  specialty: string
  personality: string
  greeting: string
}

interface UserProfile {
  interests: string[]
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  goals: string[]
  preferredStyle: ContentStyle
}

// Zustand Store
interface AIContentStore {
  generatedContents: GeneratedContent[]
  currentPrompt: string
  isGenerating: boolean
  selectedPersona: AIPersona
  userProfile: UserProfile
  contentStyle: ContentStyle
  generateContent: (type: GeneratedContent['type']) => void
  setPrompt: (prompt: string) => void
  setPersona: (persona: AIPersona) => void
  updateStyle: (style: Partial<ContentStyle>) => void
  updateProfile: (profile: Partial<UserProfile>) => void
}

const useAIContentStore = create<AIContentStore>((set, get) => ({
  generatedContents: [],
  currentPrompt: '',
  isGenerating: false,
  selectedPersona: {
    name: 'AIビジネスコーチ',
    avatar: '🤖',
    specialty: 'ビジネス戦略・収益化',
    personality: 'analytical',
    greeting: 'データドリブンなアプローチで、あなたのビジネスを最適化します。'
  },
  userProfile: {
    interests: [],
    skillLevel: 'beginner',
    goals: [],
    preferredStyle: {
      tone: 'casual',
      length: 'medium',
      creativity: 50,
      focus: []
    }
  },
  contentStyle: {
    tone: 'casual',
    length: 'medium',
    creativity: 50,
    focus: []
  },
  
  generateContent: async (type) => {
    set({ isGenerating: true })
    
    // Simulate AI generation
    setTimeout(() => {
      const { currentPrompt, contentStyle } = get()
      const contents = {
        'business-idea': [
          `【AIペットケアサービス】

ペットの健康状態をAIカメラで24時間モニタリングし、異常を検知したら飼い主に通知。獣医とのオンライン相談も可能。

🎯 ターゲット: ペットオーナー（特に共働き世帯）
📊 市場規模: 年間15億円（成長率20%）
💰 収益モデル: 月額サブスクリプション（基本プラン2,980円、プレミアム5,980円）
🚀 予想月収: 初年度100万円〜300万円

🔧 必要な技術:
• AIカメラ（Raspberry Pi + カメラモジュール）
• 画像認識AI（TensorFlow/PyTorch）
• モバイルアプリ（Flutter/React Native）
• クラウドサーバー（AWS/Google Cloud）

📈 マーケティング戦略:
• インスタグラム/TikTokでのペット動画投稿
• 獣医師との提携プログラム
• ペットショップでの体験デモ設置
• インフルエンサーマーケティング`,

          `【ノーコード教育プラットフォーム】

子供向けのプログラミング教育をノーコードツールで実現。ゲーム感覚で学べるカリキュラムを提供。

🎯 ターゲット: 小学生〜中学生の保護者
📊 市場規模: プログラミング教育市場300億円
💰 収益モデル: コース販売（19,800円/3ヶ月）＋月額会員（2,980円）
🚀 予想月収: 200万円〜500万円

📚 カリキュラム例:
Week 1-2: Scratchでアニメーション作成
Week 3-4: Bubbleでシンプルなアプリ作成
Week 5-6: Zapierで自動化ワークフロー
Week 7-8: Notionでプロジェクト管理
Week 9-12: 最終プロジェクト発表

🎮 ゲーミフィケーション要素:
• 進捗バッジシステム
• リーダーボード
• 作品コンテスト
• 仮想通貨報酬システム`,

          `【AIライティングアシスタント for 中小企業】

中小企業向けのマーケティングコンテンツを自動生成するAIサービス。ブログ記事、SNS投稿、メルマガなどを一括作成。

🎯 ターゲット: 従業員10-50人の中小企業
📊 市場規模: 中小企業マーケティング支援市場500億円
💰 収益モデル: 月額サブスク（基本19,800円、プロ39,800円、エンタープライズ79,800円）
🚀 予想月収: 初年度150万円〜400万円

🤖 AI機能:
• 業界特化型コンテンツ生成
• SEO最適化記事作成
• 競合分析レポート自動生成
• SNSスケジューリング機能
• 効果測定ダッシュボード

💡 差別化要因:
• 日本語特化の高精度AI
• 業界別テンプレート1000種類以上
• 専属マーケティングアドバイザー
• 無制限リライト機能`
        ],
        'course-outline': [
          `【AI×ノーコード起業マスターコース】

期間: 3ヶ月（12週間）
形式: オンライン + 月1回リアル勉強会

📅 Week 1-2: AI基礎とChatGPT完全マスター
• AIの基本概念と歴史
• ChatGPT/Claude/Geminiの使い分け
• プロンプトエンジニアリング実践
• 実習: AIを使った市場調査レポート作成

📅 Week 3-4: ノーコード開発入門
• Bubble基本操作とデータベース設計
• Figmaでのプロトタイプ作成
• レスポンシブデザインの基礎
• 実習: シンプルなToDoアプリ作成

📅 Week 5-6: ビジネスアイデア発想と検証
• アイデア発想フレームワーク
• リーンスタートアップ手法
• MVPの作り方と検証方法
• 実習: 自分のビジネスアイデアをMVPで検証

📅 Week 7-8: マーケティング自動化
• Zapierでワークフロー自動化
• メールマーケティング（Mailchimp連携）
• SNS自動投稿システム構築
• 実習: 完全自動化されたマーケティングファネル構築

📅 Week 9-10: 決済システムと収益化
• Stripe決済システム導入
• サブスクリプションモデル設計
• アフィリエイトプログラム構築
• 実習: 実際に販売可能なサービス完成

📅 Week 11-12: スケーリングと最適化
• データ分析とKPI設定
• A/Bテスト手法
• カスタマーサポート自動化
• 最終発表: 3ヶ月間の成果プレゼンテーション

🎁 特典:
• 個別メンタリング（月2回x3ヶ月）
• 専用Slackコミュニティ参加権
• 優秀者には投資家紹介
• 卒業後6ヶ月間のサポート継続`,

          `【声優・ナレーター向けAI活用講座】

期間: 2ヶ月（8週間）
形式: 完全オンライン

📅 Module 1: AI音声合成の理解と活用
• AI音声技術の現状と未来
• ElevenLabs、Murf、TTSの使い方
• 自分の声のクローニング技術
• 実習: オリジナル音声ライブラリ作成

📅 Module 2: 音声コンテンツ制作ワークフロー
• Audacityでの音声編集基礎
• AIを使った音声品質向上
• BGM自動生成と著作権対策
• 実習: ポッドキャスト番組制作

📅 Module 3: 声優ビジネスのデジタル化
• オンライン収録システム構築
• 顧客管理とスケジューリング自動化
• 音声サンプルの効果的な見せ方
• 実習: プロフェッショナルなポートフォリオサイト作成

📅 Module 4: 新市場開拓とマネタイズ
• AIコンテンツ制作代行サービス
• 音声教材・オーディオブック制作
• バーチャルアシスタント音声提供
• 実習: 新サービスの企画・提案書作成

📅 Module 5: ブランディングとマーケティング
• SNSでの効果的な発信方法
• 音声SNS（Clubhouse、Twitter Spaces）活用
• YouTubeでの音声コンテンツ展開
• 実習: 1ヶ月間のマーケティング計画実行

📅 Module 6: クライアントワーク最適化
• 効率的なディレクション受け方
• リテイクを減らす確認フロー
• 価格設定と交渉術
• 実習: 実際のクライアントとの模擬プロジェクト

📅 Module 7: 収益拡大戦略
• 定期収入の作り方（サブスク型サービス）
• パッシブインカムの構築法
• チーム化・外注化のノウハウ
• 実習: 6ヶ月後の売上目標設定と行動計画

📅 Module 8: 最終プロジェクト
• これまでの学習内容を活用した総合課題
• 個別フィードバックセッション
• 卒業制作発表会
• 今後のキャリアプラン策定`
        ],
        'marketing-copy': [
          `【Instagram集客完全攻略テンプレート】

🔥 フォロワー1000人突破の黄金ルール

投稿タイミング: 平日19-21時、土日14-16時
ハッシュタグ戦略: #起業 #副業 #AI活用 #ノーコード #フリーランス
投稿頻度: 1日1-2投稿（フィード1回、ストーリー3-5回）

📸 投稿コンテンツテンプレート:

【月曜日】週間目標設定
キャプション例:
"今週の目標を設定しました✨
1. 新しいAIツールを3つ試す
2. ノーコードでプロトタイプ完成
3. 見込み客5人との面談

皆さんの今週の目標は何ですか？
コメントで教えてください👇

#起業 #目標設定 #AI活用"

【火曜日】Tips・ノウハウ共有
キャプション例:
"ChatGPTで時間を80%短縮する方法🤖

プロンプトのコツ:
1. 具体的な役割を指定
2. 期待する出力形式を明記
3. 例文を含める

詳細はストーリーで解説中！

#ChatGPT #AI #時短術"

【水曜日】プロセス・作業風景
キャプション例:
"深夜のコーディング時間⏰
今日はBubbleでダッシュボード機能を実装中

プログラミング未経験でも
ノーコードツールがあれば
こんなアプリが作れちゃいます💪

#ノーコード #Bubble #起業"

【木曜日】失敗談・学び
キャプション例:
"今日は大失敗でした😅
3時間かけて作ったワークフローが
設定ミスで全部消えてしまいました...

でもこの失敗から学んだこと:
・バックアップの重要性
・小さく始めて段階的に拡張
・定期的な動作確認

失敗も財産です✨

#失敗 #学び #成長"

【金曜日】週間振り返り
【土曜日】インサイト・データ分析
【日曜日】次週の計画・プレビュー

🎯 エンゲージメント向上テクニック:
• 投稿から1時間以内にコメント返信
• ストーリーでのアンケート活用
• リール動画で最新トレンド活用
• IGTVでの詳細解説コンテンツ
• ライブ配信で質問回答セッション`,

          `【メルマガ読者1万人獲得テンプレート】

件名パターン集（開封率30%以上保証）:

❌ 避けるべき件名:
"お得情報です"
"限定オファー"
"今すぐクリック"

✅ 効果的な件名:
"［実証済み］3ヶ月で月収50万円達成した具体的手順"
"なぜ90%の起業家が1年以内に挫折するのか？"
"［緊急］明日締切：無料相談枠残り3名"
"あなたは知っていますか？AIで時間を10分の1にする方法"

📧 メール構成テンプレート:

【導入】
件名の続きで興味を引く
読者の悩みに共感する表現
今日のメールで得られるベネフィット明示

【本文】
問題提起 → 解決策提示 → 具体例・実証データ
読者の行動を促すCTA
次回予告で継続読者化

【署名】
個人的なエピソード追加
SNSリンク
配信停止リンク（必須）

🎯 読者獲得施策:

1. リードマグネット作成
「AI×ノーコード起業チェックリスト50項目」
「月収100万円達成者の作業時間割表」
「失敗しないビジネスアイデア検証シート」

2. ランディングページ最適化
ヘッドライン: "登録者の78%が3ヶ月以内に副収入を獲得"
社会的証明: 実際の成功事例3-5件掲載
登録フォーム: 項目はメールアドレスのみ

3. 口コミ促進施策
紹介特典: 友達1人紹介で限定セミナー招待
シェア特典: SNSシェアで特別レポートプレゼント

📊 効果測定指標:
• 登録率: ランディングページ訪問者の20%以上
• 開封率: 30%以上維持
• クリック率: 5%以上
• 配信停止率: 2%以下
• 売上転換率: 登録者の10%以上`
        ],
        'landing-page': [
          `【Hero Section】
メインキャッチ: "AI×DXで月収100万円を実現する起業塾"
サブヘッドライン: "技術知識ゼロから3ヶ月で自動化ビジネスを構築"
CTA: "今すぐ無料相談を予約する"

【Problem Section】
見出し: "こんな悩みありませんか？"
• 副業で稼ぎたいけど時間がない
• スキルがなくて起業できない
• アイデアはあるけど実現方法が分からない
• 一人で始めるのが不安
• 失敗するリスクを最小限にしたい

【Solution Section】
見出し: "AIDXschoolなら全て解決します"
サブテキスト: "AI×ノーコードで誰でも起業家になれる時代です"

特長:
🤖 最新AI技術を活用した自動化システム
🛠 プログラミング不要のノーコード開発
💰 実証済みの収益化ノウハウ
👥 同志と切磋琢磨できるコミュニティ
📊 データに基づく意思決定支援

【Social Proof】
成功事例:
"3ヶ月で月収150万円達成！AIコンサルで独立できました"
- 田中さん（30代・元会社員）

"ノーコードでSaaSを作り、月額収入200万円！"
- 佐藤さん（20代・学生）

"主婦でも在宅で月100万円稼げるように！"
- 鈴木さん（40代・主婦）

数字での実績:
• 受講生満足度: 97.3%
• 3ヶ月後の平均売上: 89万円
• 卒業生の継続率: 94.1%
• サポート回数: 無制限

【Course Features】
🤖 AIマスターコース
• ChatGPT・Claude完全攻略
• プロンプトエンジニアリング
• AIを使った業務自動化

🛠️ ノーコード開発コース
• Bubbleでアプリ開発
• Zapierでワークフロー自動化
• 決済システム連携

💰 ビジネス実践コース
• マネタイズ戦略
• マーケティング自動化
• スケールアップ方法

【Pricing】
基本プラン: 198,000円（3ヶ月）
プレミアム: 398,000円（6ヶ月・個別メンタリング付）
VIP: 798,000円（12ヶ月・完全マンツーマン）

特別特典:
• 30日間返金保証
• 卒業後6ヶ月間サポート
• 専用コミュニティ永続参加権
• 月1回のオフライン交流会

【FAQ】
Q: プログラミング経験がなくても大丈夫？
A: 95%の受講生が未経験からスタートしています

Q: 仕事をしながらでも受講可能？
A: オンライン形式なので自分のペースで学習できます

Q: 本当に3ヶ月で収益が出るの？
A: 平均的な売上達成期間は2.8ヶ月です

【Final CTA】
"今すぐ無料相談を予約して、あなたの起業プランを相談してください"
ボタン: "無料相談を予約する（残り3枠）"
電話: "03-1234-5678"
LINE: "LINEで気軽に相談"`,

          `【Above the Fold】
キャッチコピー: "あなたの起業アイデアを、AIが現実にします"
サブヘッド: "受講生の92%が起業成功。平均月収127万円達成"
CTA: "今すぐ始める"

【Trust Indicators】
• 経済産業省認定スクール
• 1,247名の起業家を輩出
• メディア掲載70回以上
• 著名起業家推薦多数

【Video Section】
メインビデオ: "3分で分かるAIDXschool"
内容:
• 実際の受講生の声
• 具体的な成功事例
• 学習プロセスの紹介
• 卒業後のサポート体制

【Comparison Table】
"従来の起業 vs AIDXschool"

従来の起業:
❌ 多額の初期投資が必要
❌ プログラミングスキル必須
❌ 失敗リスクが高い
❌ 一人で全て対応
❌ 収益化まで1年以上

AIDXschool:
✅ 初期投資10万円以下
✅ ノーコードで開発可能
✅ 実証済みノウハウで失敗回避
✅ 専門家チームサポート
✅ 平均3ヶ月で収益化

【Detailed Curriculum】
Phase 1: 基礎習得（1ヶ月目）
Week 1: AI基礎とChatGPT活用
Week 2: ノーコードツール入門
Week 3: ビジネスモデル設計
Week 4: 市場調査と検証

Phase 2: 実践開発（2ヶ月目）
Week 5-6: MVPプロトタイプ作成
Week 7-8: テストマーケティング実施

Phase 3: 収益化（3ヶ月目）
Week 9-10: 本格ローンチ準備
Week 11-12: 売上最適化・スケーリング

【Guarantee Section】
30日間完全返金保証
「もし30日以内にAIスキルが身につかなければ、理由を問わず全額返金します」

6ヶ月売上保証
「正しく実践すれば6ヶ月以内に月10万円以上の売上達成を保証。達成できなければ追加サポート無料提供」

【Contact Information】
📞 電話相談: 平日10-20時、土日10-18時
💬 LINE相談: 24時間受付（返信は営業時間内）
📧 メール: 24時間受付
🏢 説明会: 毎週土曜14時（オンライン・オフライン同時開催）

【Urgency Creator】
"今月限定：早期申込み特典"
• 受講料20%OFF
• 個別メンタリング回数2倍
• 特別セミナー参加権
• 先着20名限定

カウントダウンタイマー設置
"締切まで残り: XX日XX時間XX分"`
        ]
      }
      
      const contentArray = contents[type]
      const randomContent = contentArray[Math.floor(Math.random() * contentArray.length)]
      
      const newContent: GeneratedContent = {
        id: Date.now().toString(),
        type,
        prompt: currentPrompt || `${type}を生成`,
        content: randomContent,
        style: contentStyle,
        timestamp: new Date()
      }
      
      set((state) => ({
        generatedContents: [newContent, ...state.generatedContents].slice(0, 10),
        isGenerating: false
      }))
    }, 2000 + Math.random() * 3000) // 2-5秒のランダム生成時間
  },
  
  setPrompt: (prompt) => set({ currentPrompt: prompt }),
  
  setPersona: (persona) => set({ selectedPersona: persona }),
  
  updateStyle: (style) => set((state) => ({
    contentStyle: { ...state.contentStyle, ...style }
  })),
  
  updateProfile: (profile) => set((state) => ({
    userProfile: { ...state.userProfile, ...profile }
  }))
}))

// AI Personas
const aiPersonas: AIPersona[] = [
  {
    name: 'AIビジネスコーチ',
    avatar: '🤖',
    specialty: 'ビジネス戦略・収益化',
    personality: 'analytical',
    greeting: 'データドリブンなアプローチで、あなたのビジネスを最適化します。'
  },
  {
    name: 'クリエイティブAI',
    avatar: '🎨',
    specialty: 'マーケティング・コンテンツ',
    personality: 'creative',
    greeting: '創造性豊かなアイデアで、あなたのブランドを際立たせます。'
  },
  {
    name: 'テックメンター',
    avatar: '💻',
    specialty: 'AI技術・ノーコード開発',
    personality: 'technical',
    greeting: '最新テクノロジーを使って、効率的なソリューションを提案します。'
  },
  {
    name: 'マインドコーチ',
    avatar: '🧠',
    specialty: 'マインドセット・成長戦略',
    personality: 'motivational',
    greeting: '成功への道筋を明確にし、あなたの可能性を最大限に引き出します。'
  }
]

// Utility Functions
function getContentTypeIcon(type: GeneratedContent['type']) {
  const icons = {
    'business-idea': '💡',
    'course-outline': '📚',
    'marketing-copy': '📝',
    'landing-page': '🚀'
  }
  return icons[type]
}

function getContentTypeLabel(type: GeneratedContent['type']) {
  const labels = {
    'business-idea': 'ビジネスアイデア',
    'course-outline': 'コース構成',
    'marketing-copy': 'マーケティングコピー',
    'landing-page': 'ランディングページ'
  }
  return labels[type]
}

// Advanced Animation Components
function TypingAnimation({ text, speed = 50 }: { text: string, speed?: number }) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text, speed])
  
  return (
    <span>
      {displayedText}
      {currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-purple-500"
        >
          |
        </motion.span>
      )}
    </span>
  )
}

function LoadingDots() {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-purple-500 rounded-full"
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  )
}

function ParticleEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full opacity-50"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100],
            opacity: [0.5, 0],
            scale: [1, 0]
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  )
}

// Enhanced UI Components
function StatCard({ icon, value, label }: { icon: string, value: string, label: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-center text-white"
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </motion.div>
  )
}

function ProgressIndicator({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) {
  const progress = (currentStep / totalSteps) * 100
  
  return (
    <div className="w-full bg-white/20 rounded-full h-2 mb-4">
      <motion.div
        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  )
}

// Advanced Content Components
function AIThinkingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="bg-white rounded-2xl p-4 shadow-lg max-w-sm"
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-2xl"
        >
          🤖
        </motion.div>
        <div>
          <div className="font-semibold text-gray-800">考え中...</div>
          <LoadingDots />
        </div>
      </div>
    </motion.div>
  )
}

function ContentPreview({ content, type }: { content: string, type: GeneratedContent['type'] }) {
  const [showFull, setShowFull] = useState(false)
  const previewLength = 150
  
  return (
    <div className="bg-gray-50 border-l-4 border-purple-500 p-4 rounded">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{getContentTypeIcon(type)}</span>
        <span className="font-semibold text-gray-700">
          {getContentTypeLabel(type)}のプレビュー
        </span>
      </div>
      
      <div className="text-gray-600">
        {showFull || content.length <= previewLength ? (
          <pre className="whitespace-pre-wrap font-sans">{content}</pre>
        ) : (
          <>
            <pre className="whitespace-pre-wrap font-sans">
              {content.substring(0, previewLength)}...
            </pre>
            <button
              onClick={() => setShowFull(true)}
              className="text-purple-600 hover:text-purple-800 text-sm mt-2 underline"
            >
              続きを読む
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function ContentRating({ contentId }: { contentId: string }) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">評価:</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            onClick={() => setRating(star)}
            onHoverStart={() => setHoveredRating(star)}
            onHoverEnd={() => setHoveredRating(0)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className={`text-lg ${
              star <= (hoveredRating || rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ⭐
          </motion.button>
        ))}
      </div>
      {rating > 0 && (
        <span className="text-sm text-gray-500">({rating}/5)</span>
      )}
    </div>
  )
}

function ContentActions({ content }: { content: GeneratedContent }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(content.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `AI生成コンテンツ: ${getContentTypeLabel(content.type)}`,
        text: content.content,
        url: window.location.href
      })
    }
  }
  
  const handleExport = () => {
    const blob = new Blob([content.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${content.type}-${content.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className="flex gap-2 flex-wrap">
      <motion.button
        onClick={handleCopy}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-3 py-1 rounded text-sm transition-colors ${
          copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {copied ? '✓ コピー完了' : '📋 コピー'}
      </motion.button>
      
      <motion.button
        onClick={handleShare}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
      >
        🔗 シェア
      </motion.button>
      
      <motion.button
        onClick={handleExport}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
      >
        💾 エクスポート
      </motion.button>
    </div>
  )
}

// AI Avatar Component
function AIAvatar({ persona }: { persona: AIPersona }) {
  const [speaking, setSpeaking] = useState(false)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeaking(prev => !prev)
    }, 3000)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="relative"
    >
      <motion.div
        animate={speaking ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: speaking ? Infinity : 0 }}
        className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-6xl shadow-2xl"
      >
        {persona.avatar}
      </motion.div>
      
      {/* Speaking Indicator */}
      {speaking && (
        <motion.div
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white rounded-full"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
            />
          ))}
        </motion.div>
      )}
      
      {/* Persona Info Tooltip */}
      <motion.div
        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg p-3 text-center min-w-max z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <h4 className="font-semibold text-gray-800">{persona.name}</h4>
        <p className="text-sm text-gray-600 mb-1">{persona.specialty}</p>
        <p className="text-xs text-gray-500 italic max-w-xs">{persona.greeting}</p>
      </motion.div>
    </motion.div>
  )
}

// Analytics and Insights Component
function ContentAnalytics() {
  const { generatedContents } = useAIContentStore()
  
  const stats = {
    total: generatedContents.length,
    businessIdeas: generatedContents.filter(c => c.type === 'business-idea').length,
    courseOutlines: generatedContents.filter(c => c.type === 'course-outline').length,
    marketingCopy: generatedContents.filter(c => c.type === 'marketing-copy').length,
    landingPages: generatedContents.filter(c => c.type === 'landing-page').length
  }
  
  return (
    <ContentCard className="mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">📊 コンテンツ生成統計</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard icon="📄" value={stats.total.toString()} label="総コンテンツ数" />
        <StatCard icon="💡" value={stats.businessIdeas.toString()} label="ビジネスアイデア" />
        <StatCard icon="📚" value={stats.courseOutlines.toString()} label="コース構成" />
        <StatCard icon="📝" value={stats.marketingCopy.toString()} label="マーケコピー" />
        <StatCard icon="🚀" value={stats.landingPages.toString()} label="LP" />
      </div>
      
      {stats.total > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span className="text-green-700 font-medium">
              これまでに{stats.total}個のコンテンツを生成しました！
            </span>
          </div>
        </div>
      )}
    </ContentCard>
  )
}

// Content Template Suggestions
function TemplateSuggestions({ onSelectTemplate }: { onSelectTemplate: (template: string) => void }) {
  const templates = [
    {
      title: "AIサービスのビジネスアイデア",
      prompt: "ペットの健康管理をAIで自動化するサービス。カメラで状態を監視し、異常を検知したら飼い主に通知。獣医とのオンライン相談も提供。",
      type: "business-idea" as const,
      icon: "🐕"
    },
    {
      title: "ノーコードコース構成",
      prompt: "初心者向けのノーコードアプリ開発コース。Bubbleを使ってシンプルなToDoアプリから ECサイトまでを作成できるようになるまでのカリキュラム。",
      type: "course-outline" as const,
      icon: "🛠️"
    },
    {
      title: "インスタグラム集客投稿",
      prompt: "インスタグラムでフォロワーを増やし、ビジネスにつなげるための投稿テンプレート。ハッシュタグ、キャプション、ストーリーズの活用法を含む。",
      type: "marketing-copy" as const,
      icon: "📱"
    },
    {
      title: "AIコンサルタントLP",
      prompt: "AIコンサルタントサービスのランディングページ。企業の業務効率化、コスト削減、生産性向上をAIで実現するサービスをアピール。",
      type: "landing-page" as const,
      icon: "🤖"
    }
  ]
  
  return (
    <ContentCard className="mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">📝 テンプレート一覧</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template, index) => (
          <motion.div
            key={index}
            onClick={() => onSelectTemplate(template.prompt)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{template.icon}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">{template.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{template.prompt.substring(0, 100)}...</p>
                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                  {getContentTypeLabel(template.type)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </ContentCard>
  )
}

// Enhanced Content Generator
function ContentGenerator() {
  const { currentPrompt, setPrompt, generateContent, isGenerating, selectedPersona } = useAIContentStore()
  const [selectedType, setSelectedType] = useState<GeneratedContent['type']>('business-idea')
  const [showPreview, setShowPreview] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)
  
  const contentTypes = [
    { value: 'business-idea', label: '💡 ビジネスアイデア', icon: '💡' },
    { value: 'course-outline', label: '📚 コース構成', icon: '📚' },
    { value: 'marketing-copy', label: '📝 マーケティングコピー', icon: '📝' },
    { value: 'landing-page', label: '🚀 ランディングページ', icon: '🚀' }
  ]
  
  const handleGenerate = async () => {
    setGenerationStep(1)
    await generateContent(selectedType)
    setGenerationStep(0)
  }
  
  const generationSteps = [
    "プロンプトを解析中...",
    "AIが悩みを理解中...",
    "アイデアを生成中...",
    "コンテンツを最適化中...",
    "最終調整中..."
  ]
  
  useEffect(() => {
    if (isGenerating && generationStep < generationSteps.length) {
      const timer = setTimeout(() => {
        setGenerationStep(prev => prev + 1)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [isGenerating, generationStep])
  
  return (
    <div className="space-y-8">
      {/* Template Suggestions */}
      <TemplateSuggestions onSelectTemplate={setPrompt} />
      
      {/* Content Analytics */}
      <ContentAnalytics />
      
      {/* Persona Display */}
      <div className="text-center">
        <AIAvatar persona={selectedPersona} />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-white/80 italic max-w-md mx-auto"
        >
          「{selectedPersona.greeting}」
        </motion.p>
      </div>
      
      {/* Content Type Selection */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 relative">
        <ParticleEffect />
        
        <h3 className="text-2xl font-semibold text-white mb-6 text-center relative z-10">
          ✨ どのコンテンツを生成しますか？
        </h3>
        
        {/* Content Types Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
          {contentTypes.map((type) => (
            <motion.button
              key={type.value}
              onClick={() => setSelectedType(type.value as any)}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={`p-6 rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${
                selectedType === type.value
                  ? 'border-white bg-white/20 text-white'
                  : 'border-white/30 bg-white/10 text-white/80 hover:border-white/50 hover:bg-white/15'
              }`}
            >
              {selectedType === type.value && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              <div className="relative z-10">
                <motion.div 
                  className="text-4xl mb-3"
                  animate={selectedType === type.value ? { rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {type.icon}
                </motion.div>
                <div className="font-semibold text-sm">
                  {type.label.replace(/^[\d\w\s]*\s/, '')}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
        
        {/* Prompt Input */}
        <div className="relative mb-8 z-10">
          <label className="block text-white/90 text-lg font-semibold mb-4">
            💬 詳しいリクエストを入力してください
          </label>
          <motion.textarea
            value={currentPrompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              selectedType === 'business-idea' 
                ? "例：ペットの健康管理をAIで自動化するサービスのアイデアを教えてください\n\nターゲット：ペットオーナー\n機能：24時間モニタリング、異常検知、獣医相談\nマネタイズ：月額サブスクリプション"
                : selectedType === 'course-outline'
                ? "例：初心者向けのノーコードアプリ開発コースのカリキュラムを作成してください\n\n期間：3ヶ月\nツール：Bubble、Zapier、Airtable\nゴール：シンプルなToDoappからECサイトまで作成できるスキル習得"
                : selectedType === 'marketing-copy'
                ? "例：インスタグラムでフォロワーを増やすための投稿テンプレートを作成してください\n\nターゲット：20-30代の起業家志望\nジャンル：AI×ビジネス\n目的：フォロワー数増加、エンゲージメント向上"
                : "例：AIコンサルタントサービスのランディングページを作成してください\n\nサービス：企業の業務効率化、コスト削減\nターゲット：中小企業のCEO、情報システム部長\n特徴：10時間の作業を1時間に短縮、ROI300%以上"
            }
            className="w-full p-6 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 resize-none h-40 focus:border-white/50 focus:bg-white/25 transition-all duration-300 backdrop-blur-sm"
            whileFocus={{ scale: 1.02 }}
          />
          
          {isGenerating && (
            <motion.div
              className="absolute inset-0 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center text-white">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-6xl mb-4"
                >
                  🤖
                </motion.div>
                <ProgressIndicator currentStep={generationStep} totalSteps={generationSteps.length} />
                <div className="text-lg font-semibold mb-2">
                  {generationSteps[generationStep] || "完了しました！"}
                </div>
                <LoadingDots />
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Generate Button */}
        <div className="text-center relative z-10">
          <motion.button
            onClick={handleGenerate}
            disabled={isGenerating || !currentPrompt.trim()}
            whileHover={{ scale: isGenerating ? 1 : 1.05, y: isGenerating ? 0 : -2 }}
            whileTap={{ scale: isGenerating ? 1 : 0.95 }}
            className={`px-12 py-6 rounded-full text-xl font-bold transition-all duration-300 relative overflow-hidden ${
              isGenerating || !currentPrompt.trim()
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-2xl hover:shadow-pink-500/25'
            }`}
          >
            {!isGenerating && !currentPrompt.trim() && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            )}
            
            <span className="relative z-10">
              {isGenerating ? (
                <span className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    🔄
                  </motion.div>
                  AIが作業中...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  🚀 AIでコンテンツ生成
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ✨
                  </motion.span>
                </span>
              )}
            </span>
          </motion.button>
          
          {!currentPrompt.trim() && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-white/60 text-sm"
            >
              上記のテキストエリアにリクエストを入力してください
            </motion.p>
          )}
        </div>
      </div>
      
      {/* AI Thinking Bubble */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            className="fixed bottom-8 right-8 z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <AIThinkingBubble />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Enhanced Persona Selector
function PersonaSelector() {
  const { selectedPersona, setPersona } = useAIContentStore()
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {aiPersonas.map((persona) => (
        <AIPersonaCard
          key={persona.name}
          onClick={() => setPersona(persona)}
          className={selectedPersona.name === persona.name ? 'selected' : ''}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">{persona.avatar}</div>
            <h3 className="text-white font-semibold mb-2">{persona.name}</h3>
            <p className="text-white/80 text-sm mb-3">{persona.specialty}</p>
            <p className="text-white/60 text-xs italic">{persona.greeting}</p>
          </div>
        </AIPersonaCard>
      ))}
    </div>
  )
}

// Content Style Settings
function ContentStyleSettings() {
  const { contentStyle, updateStyle } = useAIContentStore()
  
  return (
    <ContentCard className="mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">🎛️ コンテンツスタイル設定</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">トーン</label>
          <select
            value={contentStyle.tone}
            onChange={(e) => updateStyle({ tone: e.target.value as any })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="professional">プロフェッショナル</option>
            <option value="casual">カジュアル</option>
            <option value="inspirational">インスピレーショナル</option>
            <option value="technical">テクニカル</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">長さ</label>
          <select
            value={contentStyle.length}
            onChange={(e) => updateStyle({ length: e.target.value as any })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="short">短文（100文字以内）</option>
            <option value="medium">中文（300文字程度）</option>
            <option value="long">長文（500文字以上）</option>
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            創造性レベル: {contentStyle.creativity}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={contentStyle.creativity}
            onChange={(e) => updateStyle({ creativity: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>保守的</span>
            <span>バランス</span>
            <span>革新的</span>
          </div>
        </div>
      </div>
    </ContentCard>
  )
}

// Enhanced Prompt Input
function PromptInput() {
  const { currentPrompt, setPrompt, generateContent, isGenerating } = useAIContentStore()
  const [selectedType, setSelectedType] = useState<GeneratedContent['type']>('business-idea')
  
  const contentTypes = [
    { value: 'business-idea', label: '💡 ビジネスアイデア', icon: '💡' },
    { value: 'course-outline', label: '📚 コース構成', icon: '📚' },
    { value: 'marketing-copy', label: '📝 マーケティングコピー', icon: '📝' },
    { value: 'landing-page', label: '🚀 ランディングページ', icon: '🚀' }
  ]
  
  return (
    <ContentCard className="mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">⚡ AIコンテンツ生成</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {contentTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setSelectedType(type.value as any)}
            className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              selectedType === type.value
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
            }`}
          >
            <div className="text-2xl mb-1">{type.icon}</div>
            <div className="text-sm font-medium">
              {type.label.replace(/^[\d\w\s]*\s/, '')}
            </div>
          </button>
        ))}
      </div>
      
      <div className="relative mb-4">
        <textarea
          value={currentPrompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="どんなコンテンツを生成したいか詳しく教えてください...\n\n例：\n- AI×ノーコードでSaaSを作りたい\n- 主婦向けの在宅ワーク講座を企画したい\n- インスタグラムでフォロワーを増やす方法を知りたい"
          className="w-full p-4 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        {isGenerating && (
          <SparkleEffect>
            ✨
          </SparkleEffect>
        )}
      </div>
      
      <div className="flex justify-center">
        <GenerateButton
          onClick={() => generateContent(selectedType)}
          disabled={isGenerating || !currentPrompt.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                🔄
              </motion.div>
              生成中...
            </span>
          ) : (
            '🚀 AIでコンテンツ生成'
          )}
        </GenerateButton>
      </div>
    </ContentCard>
  )
}

// Enhanced Content Display with Filter and Sort
function EnhancedContentDisplay() {
  const { generatedContents } = useAIContentStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'type'>('newest')
  const [filterBy, setFilterBy] = useState<GeneratedContent['type'] | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredAndSortedContents = generatedContents
    .filter(content => {
      const matchesFilter = filterBy === 'all' || content.type === filterBy
      const matchesSearch = searchTerm === '' || 
        content.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.prompt.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesFilter && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        case 'type':
          return a.type.localeCompare(b.type)
        default:
          return 0
      }
    })
  
  if (generatedContents.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 text-center text-white relative overflow-hidden">
        <ParticleEffect />
        
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-8xl mb-6 relative z-10"
        >
          🤖
        </motion.div>
        
        <h3 className="text-2xl font-semibold mb-4 relative z-10">まだコンテンツがありません</h3>
        
        <p className="text-white/70 text-lg mb-8 relative z-10">
          上記のフォームを使って、AIコンテンツを生成してみましょう！
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
          {[
            { icon: '💡', label: 'アイデア発散' },
            { icon: '📚', label: 'カリキュラム作成' },
            { icon: '📝', label: 'コピーライティング' },
            { icon: '🚀', label: 'LP設計' }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
              className="text-center"
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-sm text-white/80">{item.label}</div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-4xl relative z-10"
        >
          ↗️
        </motion.div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
        <h2 className="text-3xl font-bold text-white">
          📄 生成されたコンテンツ ({filteredAndSortedContents.length}件)
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 コンテンツを検索..."
            className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 backdrop-blur-sm"
          />
          
          {/* Filter */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white backdrop-blur-sm"
          >
            <option value="all" className="text-gray-800">すべて</option>
            <option value="business-idea" className="text-gray-800">ビジネスアイデア</option>
            <option value="course-outline" className="text-gray-800">コース構成</option>
            <option value="marketing-copy" className="text-gray-800">マーケコピー</option>
            <option value="landing-page" className="text-gray-800">ランディングページ</option>
          </select>
          
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white backdrop-blur-sm"
          >
            <option value="newest" className="text-gray-800">新しい順</option>
            <option value="oldest" className="text-gray-800">古い順</option>
            <option value="type" className="text-gray-800">タイプ別</option>
          </select>
        </div>
      </div>
      
      {/* Content Grid */}
      <div className="grid gap-6">
        {filteredAndSortedContents.map((content, index) => (
          <motion.div
            key={content.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300 relative overflow-hidden"
          >
            {/* Background gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            
            {/* Header */}
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 15 }}
                  className="text-4xl"
                >
                  {getContentTypeIcon(content.type)}
                </motion.div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {getContentTypeLabel(content.type)}
                  </h3>
                  <p className="text-white/70 text-sm">
                    プロンプト: {content.prompt.slice(0, 80)}...
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 bg-white/20 text-white text-xs rounded">
                      {content.style.tone}
                    </span>
                    <span className="px-2 py-1 bg-white/20 text-white text-xs rounded">
                      {content.style.length}
                    </span>
                    <span className="px-2 py-1 bg-white/20 text-white text-xs rounded">
                      創造性: {content.style.creativity}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right text-white/60 text-sm">
                <div>{content.timestamp.toLocaleDateString()}</div>
                <div>{content.timestamp.toLocaleTimeString()}</div>
              </div>
            </div>
            
            {/* Content */}
            <div className="mb-6 relative z-10">
              <div className={`${expandedId === content.id ? '' : 'max-h-48 overflow-hidden'} transition-all duration-300 relative`}>
                <pre className="whitespace-pre-wrap text-white/90 leading-relaxed font-sans">
                  {content.content}
                </pre>
                {!expandedId && content.content.length > 300 && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
                )}
              </div>
              
              {content.content.length > 300 && (
                <motion.button
                  onClick={() => setExpandedId(expandedId === content.id ? null : content.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 flex items-center gap-2"
                >
                  <motion.span
                    animate={{ rotate: expandedId === content.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {expandedId === content.id ? '📤' : '📂'}
                  </motion.span>
                  {expandedId === content.id ? '折りたたむ' : '全文を表示'}
                </motion.button>
              )}
            </div>
            
            {/* Actions and Rating */}
            <div className="space-y-4 pt-6 border-t border-white/20 relative z-10">
              <ContentRating contentId={content.id} />
              <ContentActions content={content} />
            </div>
          </motion.div>
        ))}
      </div>
      
      {filteredAndSortedContents.length === 0 && generatedContents.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center text-white">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">検索条件に一致するコンテンツがありません</h3>
          <p className="text-white/70">フィルターや検索条件を変更してみてください。</p>
        </div>
      )}
    </div>
  )
}

function BackgroundAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <FloatingElement
          key={i}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`
          }}
        >
          <div className="text-2xl opacity-30">
            {['🤖', '✨', '💡', '🚀', '📊', '🎯'][i % 6]}
          </div>
        </FloatingElement>
      ))}
    </div>
  )
}

// Main Component Export
export default function LP10_AIGeneratedContent() {
  const [showWelcome, setShowWelcome] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000)
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <Container>
      {/* Welcome Animation */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center text-white"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              <motion.div
                className="text-8xl mb-4"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, ease: "easeInOut" }}
              >
                🤖
              </motion.div>
              <motion.h1
                className="text-4xl font-bold mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                AI Content Studio
              </motion.h1>
              <motion.p
                className="text-xl text-white/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                あなたのアイデアをAIが形にします
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Background Effects */}
      <BackgroundAnimation />
      
      <div className="relative z-10 p-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: showWelcome ? 3 : 0 }}
          className="text-center mb-16"
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold text-white mb-8"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              background: 'linear-gradient(45deg, #4EB5FF, #38C172, #FFD93D, #FF6B6B, #9333EA)',
              backgroundSize: '400% 400%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            🤖 AI Content Studio
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-white/80 mb-8 max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: showWelcome ? 3.5 : 0.5 }}
          >
            あなたの起業アイデアを、専門AIがコンテンツに変換します
            <br />
            ビジネスアイデアからランディングページまで、何でも生成できます
          </motion.p>
          
          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: showWelcome ? 4 : 1 }}
          >
            <StatCard icon="✨" value="1000+" label="生成コンテンツ" />
            <StatCard icon="🚀" value="3秒" label="平均生成時間" />
            <StatCard icon="🎯" value="95%" label="満足度" />
            <StatCard icon="🤖" value="4体" label="AIコーチ" />
          </motion.div>
        </motion.div>
        
        <motion.div
          className="max-w-6xl mx-auto space-y-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: showWelcome ? 4.5 : 1.5 }}
        >
          <PersonaSelector />
          <ContentStyleSettings />
          <PromptInput />
          <EnhancedContentDisplay />
        </motion.div>
        
        {/* Enhanced CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: showWelcome ? 5 : 2 }}
          className="text-center mt-20 bg-white/10 backdrop-blur-md rounded-2xl p-12 relative overflow-hidden"
        >
          <ParticleEffect />
          
          <motion.h2
            className="text-4xl font-bold text-white mb-6 relative z-10"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🚀 もっと本格的なAI活用を学びませんか？
          </motion.h2>
          
          <p className="text-xl text-white/80 mb-8 relative z-10">
            AIDXschoolでは、このようなAIツールを使いこなして
            <br />
            実際にビジネスで収益を上げる方法を体系的に学べます。
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 relative z-10">
            {[
              {
                icon: "🤖",
                title: "AI活用マスター",
                description: "ChatGPT、Claude、MidjourneyなどのAIツールを業務に活用",
                delay: 0
              },
              {
                icon: "🛠️",
                title: "ノーコード開発",
                description: "Bubble、Zapier、Notionでビジネスシステムを構築",
                delay: 0.2
              },
              {
                icon: "💰",
                title: "収益化戦略",
                description: "自動化されたビジネスモデルで継続的な収入を実現",
                delay: 0.4
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: feature.delay }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
            <GenerateButton
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              🎓 30日間無料で体験する
            </GenerateButton>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-6 border-2 border-white text-white rounded-full text-xl font-bold hover:bg-white hover:text-purple-900 transition-all duration-300 relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-white"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10">
                📞 無料相談を予約
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </Container>
  )
}