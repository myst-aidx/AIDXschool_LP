# AIDXschool React Landing Pages

10種類の革新的なReactベースのランディングページコレクション。最新のWeb技術を活用し、インタラクティブで魅力的な起業教育体験を提供します。

## 🚀 LPリスト

1. **3Dインタラクティブ体験** (`lp1-3d-interactive`)
   - Three.js/React Three Fiberによる3D空間
   - インタラクティブな3Dオブジェクト
   - パーティクルエフェクトと環境マッピング

2. **RPGスキルツリー** (`lp2-rpg-skill-tree`)
   - ゲーミフィケーション学習体験
   - スキルポイントシステム
   - レベルアップとクエスト機能

3. **データビジュアライゼーション** (`lp3-data-visualization`)
   - Rechartsによるリアルタイムチャート
   - ライブデータ更新
   - 成功事例スライダー

4. **インタラクティブ絵本** (`lp4-interactive-storybook`)
   - 分岐ストーリーシステム
   - カスタムSVGイラストレーション
   - 選択式ナラティブ

5. **WebAR体験** (`lp5-web-ar`)
   - カメラアクセスとAR表示
   - デバイス方向検出
   - 3Dフォールバック対応

6. **音声インタラクティブ** (`lp6-voice-interactive`)
   - Web Speech API統合
   - リアルタイム音声認識
   - AI会話シミュレーション

7. **マルチバース選択** (`lp7-multiverse-selection`)
   - 3Dポータルインターフェース
   - 複数の起業パス探索
   - インタラクティブ宇宙選択

8. **ニューロモーフィック** (`lp8-neuromorphic`)
   - ニューラルネットワーク可視化
   - シナプス接続アニメーション
   - 思考パターン選択

9. **Web3ブロックチェーン** (`lp9-web3-blockchain`)
   - ブロックチェーン可視化
   - ウォレット接続シミュレーション
   - NFT証明書とトークンエコノミー

10. **AI生成コンテンツ** (`lp10-ai-generated-content`)
    - AIコンテンツ生成シミュレーション
    - パーソナライズ機能
    - 複数のAIペルソナ

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **アニメーション**: Framer Motion
- **3Dグラフィックス**: Three.js, @react-three/fiber, @react-three/drei
- **状態管理**: Zustand
- **データ可視化**: Recharts
- **その他**: react-spring, Web APIs (Speech, Camera, Device Orientation)

## 📦 セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバーの起動
npm start
```

## 🎨 特徴

- **完全レスポンシブ**: すべてのデバイスで最適な表示
- **高度なインタラクション**: マウス、タッチ、音声、カメラ入力対応
- **パフォーマンス最適化**: React.lazy、Suspense、コード分割
- **アクセシビリティ**: WCAG準拠を意識した設計
- **SEO対応**: Next.jsのメタデータAPI活用

## 🏗️ プロジェクト構造

```
react-lps/
├── src/
│   ├── pages/
│   │   ├── index.tsx                    # LPギャラリー
│   │   ├── lp1-3d-interactive.tsx      # 3D体験LP
│   │   ├── lp2-rpg-skill-tree.tsx      # RPGスキルツリーLP
│   │   ├── lp3-data-visualization.tsx  # データ可視化LP
│   │   ├── lp4-interactive-storybook.tsx # 絵本LP
│   │   ├── lp5-web-ar.tsx              # WebAR LP
│   │   ├── lp6-voice-interactive.tsx   # 音声対話LP
│   │   ├── lp7-multiverse-selection.tsx # マルチバースLP
│   │   ├── lp8-neuromorphic.tsx        # ニューロモーフィックLP
│   │   ├── lp9-web3-blockchain.tsx     # Web3 LP
│   │   └── lp10-ai-generated-content.tsx # AI生成LP
│   └── styles/
│       └── globals.css                  # グローバルスタイル
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 起業塾としての価値

各LPは、AI×DXを活用した起業教育の異なる側面を表現しています：

- **エンゲージメント向上**: ゲーミフィケーションとインタラクティブ要素
- **学習効果の可視化**: データビジュアライゼーションとプログレス表示
- **パーソナライゼーション**: AI生成コンテンツと音声対話
- **最新技術の活用**: Web3、AR、3Dなど先進的な技術の実装
- **多様な学習スタイル対応**: 視覚的、聴覚的、体験的な学習方法

## 📄 ライセンス

© 2024 AIDXschool. All rights reserved.