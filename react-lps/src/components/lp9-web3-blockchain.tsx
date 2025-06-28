import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { create } from 'zustand'

// Types
interface Block {
  id: number
  hash: string
  previousHash: string
  timestamp: number
  data: Transaction[]
  nonce: number
  mined: boolean
}

interface Transaction {
  id: string
  from: string
  to: string
  amount: number
  type: 'transfer' | 'mint' | 'burn'
}

interface NFTCertificate {
  id: string
  name: string
  image: string
  attributes: {
    skill: string
    level: number
    date: string
  }[]
  owner: string
}

interface TokenMetrics {
  totalSupply: number
  circulatingSupply: number
  price: number
  marketCap: number
  holders: number
}

// Zustand Store
interface Web3Store {
  blocks: Block[]
  pendingTransactions: Transaction[]
  wallet: {
    address: string
    balance: number
    nfts: NFTCertificate[]
    connected: boolean
  }
  tokenMetrics: TokenMetrics
  miningDifficulty: number
  isMining: boolean
  addBlock: (block: Block) => void
  addTransaction: (transaction: Transaction) => void
  connectWallet: () => void
  disconnectWallet: () => void
  mintNFT: (nft: NFTCertificate) => void
  startMining: () => void
  updateTokenPrice: (price: number) => void
}

const useWeb3Store = create<Web3Store>((set, get) => ({
  blocks: [
    {
      id: 0,
      hash: '000000',
      previousHash: '0',
      timestamp: Date.now(),
      data: [],
      nonce: 0,
      mined: true
    }
  ],
  pendingTransactions: [],
  wallet: {
    address: '',
    balance: 0,
    nfts: [],
    connected: false
  },
  tokenMetrics: {
    totalSupply: 1000000,
    circulatingSupply: 500000,
    price: 1.5,
    marketCap: 750000,
    holders: 1234
  },
  miningDifficulty: 2,
  isMining: false,
  
  addBlock: (block) => set((state) => ({
    blocks: [...state.blocks, block],
    pendingTransactions: []
  })),
  
  addTransaction: (transaction) => set((state) => ({
    pendingTransactions: [...state.pendingTransactions, transaction]
  })),
  
  connectWallet: () => set({
    wallet: {
      address: '0x' + Math.random().toString(16).substr(2, 40),
      balance: 100,
      nfts: [],
      connected: true
    }
  }),
  
  disconnectWallet: () => set({
    wallet: {
      address: '',
      balance: 0,
      nfts: [],
      connected: false
    }
  }),
  
  mintNFT: (nft) => set((state) => ({
    wallet: {
      ...state.wallet,
      nfts: [...state.wallet.nfts, nft]
    }
  })),
  
  startMining: () => {
    set({ isMining: true })
    
    // Simulate mining
    setTimeout(() => {
      const state = get()
      const newBlock: Block = {
        id: state.blocks.length,
        hash: Math.random().toString(16).substr(2, 8),
        previousHash: state.blocks[state.blocks.length - 1].hash,
        timestamp: Date.now(),
        data: state.pendingTransactions,
        nonce: Math.floor(Math.random() * 1000000),
        mined: true
      }
      
      get().addBlock(newBlock)
      set({ isMining: false })
      
      // Reward miner
      if (state.wallet.connected) {
        set((state) => ({
          wallet: {
            ...state.wallet,
            balance: state.wallet.balance + 10
          }
        }))
      }
    }, 3000)
  },
  
  updateTokenPrice: (price) => set((state) => ({
    tokenMetrics: {
      ...state.tokenMetrics,
      price,
      marketCap: price * state.tokenMetrics.circulatingSupply
    }
  }))
}))

// Components
function BlockchainVisualizer() {
  const { blocks, isMining } = useWeb3Store()
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (containerRef.current && blocks.length > 3) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth
    }
  }, [blocks])
  
  return (
    <div className="relative">
      <h3 className="text-2xl font-bold mb-6 text-white">ブロックチェーン</h3>
      <div 
        ref={containerRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700"
      >
        {blocks.map((block, index) => (
          <motion.div
            key={block.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* Chain Link */}
            {index > 0 && (
              <motion.div
                className="absolute left-0 top-1/2 w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ transform: 'translateX(-100%) translateY(-50%)' }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              />
            )}
            
            {/* Block */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-blue-400">Block #{block.id}</span>
                {block.id === 0 && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                    GENESIS
                  </span>
                )}
              </div>
              
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-500">Hash:</span>
                  <p className="font-mono text-gray-300">{block.hash}</p>
                </div>
                <div>
                  <span className="text-gray-500">Previous:</span>
                  <p className="font-mono text-gray-300">{block.previousHash}</p>
                </div>
                <div>
                  <span className="text-gray-500">Transactions:</span>
                  <p className="text-gray-300">{block.data.length} txns</p>
                </div>
                <div>
                  <span className="text-gray-500">Nonce:</span>
                  <p className="text-gray-300">{block.nonce}</p>
                </div>
              </div>
              
              {block.mined && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                >
                  ✓
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        ))}
        
        {/* Mining Animation */}
        {isMining && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-48 h-full flex items-center justify-center"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center text-sm">
                Mining...
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function WalletConnect() {
  const { wallet, connectWallet, disconnectWallet } = useWeb3Store()
  const [showDetails, setShowDetails] = useState(false)
  
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-4 right-4 z-20"
    >
      {!wallet.connected ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={connectWallet}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold flex items-center gap-2"
        >
          <span className="text-xl">🦊</span>
          ウォレット接続
        </motion.button>
      ) : (
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowDetails(!showDetails)}
            className="px-6 py-3 bg-gray-800 rounded-lg font-semibold flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
            <div className="text-left">
              <p className="text-xs text-gray-400">残高</p>
              <p className="font-mono">{wallet.balance} EDU</p>
            </div>
          </motion.button>
          
          {/* Wallet Details Dropdown */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 right-0 w-80 bg-gray-900 rounded-lg border border-gray-700 p-4"
              >
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400">アドレス</p>
                    <p className="font-mono text-xs">{wallet.address.substr(0, 10)}...{wallet.address.substr(-8)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">保有NFT</p>
                    <p>{wallet.nfts.length} 個</p>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="w-full py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                  >
                    切断
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

function TransactionPanel() {
  const { pendingTransactions, addTransaction, wallet, startMining, isMining } = useWeb3Store()
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  
  const handleSendTransaction = () => {
    if (!wallet.connected || !amount || !recipient) return
    
    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      from: wallet.address,
      to: recipient,
      amount: parseFloat(amount),
      type: 'transfer'
    }
    
    addTransaction(transaction)
    setAmount('')
    setRecipient('')
  }
  
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold mb-4">トランザクション</h3>
      
      {/* Send Transaction Form */}
      {wallet.connected && (
        <div className="space-y-3 mb-6">
          <input
            type="text"
            placeholder="受信者アドレス (0x...)"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="送信量"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendTransaction}
              className="px-6 py-2 bg-blue-500 rounded-lg font-semibold"
            >
              送信
            </motion.button>
          </div>
        </div>
      )}
      
      {/* Pending Transactions */}
      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-400">保留中のトランザクション ({pendingTransactions.length})</p>
        {pendingTransactions.map(tx => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 rounded-lg p-3 text-sm"
          >
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs">
                {tx.from.substr(0, 6)}...{tx.from.substr(-4)} → {tx.to.substr(0, 6)}...{tx.to.substr(-4)}
              </span>
              <span className="font-bold">{tx.amount} EDU</span>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Mine Button */}
      {pendingTransactions.length > 0 && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startMining}
          disabled={isMining}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold disabled:opacity-50"
        >
          {isMining ? 'マイニング中...' : 'ブロックをマイニング'}
        </motion.button>
      )}
    </div>
  )
}

function NFTShowcase() {
  const { wallet, mintNFT } = useWeb3Store()
  const [showMintModal, setShowMintModal] = useState(false)
  
  const sampleNFTs = [
    {
      name: 'AI マスター認定',
      skill: 'AI活用',
      level: 5,
      image: '🤖'
    },
    {
      name: 'ノーコード開発者',
      skill: 'ノーコード',
      level: 4,
      image: '🔧'
    },
    {
      name: 'DXコンサルタント',
      skill: 'DX戦略',
      level: 3,
      image: '💡'
    }
  ]
  
  const handleMintNFT = (nft: typeof sampleNFTs[0]) => {
    if (!wallet.connected) return
    
    const newNFT: NFTCertificate = {
      id: Math.random().toString(36).substr(2, 9),
      name: nft.name,
      image: nft.image,
      attributes: [
        { skill: nft.skill, level: nft.level, date: new Date().toISOString() }
      ],
      owner: wallet.address
    }
    
    mintNFT(newNFT)
    setShowMintModal(false)
  }
  
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">スキル証明NFT</h3>
        {wallet.connected && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMintModal(true)}
            className="px-4 py-2 bg-purple-500 rounded-lg text-sm font-semibold"
          >
            NFTを獲得
          </motion.button>
        )}
      </div>
      
      {/* NFT Grid */}
      <div className="grid grid-cols-3 gap-4">
        {wallet.nfts.map(nft => (
          <motion.div
            key={nft.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-4 border border-purple-500/30"
          >
            <div className="text-4xl text-center mb-2">{nft.image}</div>
            <p className="text-sm font-semibold text-center">{nft.name}</p>
            <div className="mt-2 text-xs text-gray-400">
              {nft.attributes.map((attr, i) => (
                <p key={i}>Lv.{attr.level} {attr.skill}</p>
              ))}
            </div>
          </motion.div>
        ))}
        
        {/* Empty Slots */}
        {[...Array(Math.max(0, 6 - wallet.nfts.length))].map((_, i) => (
          <div
            key={`empty-${i}`}
            className="bg-gray-800/30 rounded-lg border-2 border-dashed border-gray-700 h-32"
          />
        ))}
      </div>
      
      {/* Mint Modal */}
      <AnimatePresence>
        {showMintModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
            onClick={() => setShowMintModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-gray-900 rounded-xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-6">NFTを選択</h3>
              <div className="space-y-3">
                {sampleNFTs.map((nft, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ x: 10 }}
                    onClick={() => handleMintNFT(nft)}
                    className="w-full flex items-center gap-4 bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-3xl">{nft.image}</span>
                    <div className="text-left">
                      <p className="font-semibold">{nft.name}</p>
                      <p className="text-sm text-gray-400">レベル {nft.level}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TokenEconomics() {
  const { tokenMetrics, updateTokenPrice } = useWeb3Store()
  
  useEffect(() => {
    const interval = setInterval(() => {
      const variation = (Math.random() - 0.5) * 0.1
      updateTokenPrice(tokenMetrics.price * (1 + variation))
    }, 3000)
    return () => clearInterval(interval)
  }, [tokenMetrics.price, updateTokenPrice])
  
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold mb-6">EDUトークン経済</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">現在価格</p>
          <p className="text-2xl font-bold text-green-400">
            ${tokenMetrics.price.toFixed(3)}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">時価総額</p>
          <p className="text-2xl font-bold">
            ${(tokenMetrics.marketCap / 1000).toFixed(1)}K
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">流通供給量</p>
          <p className="text-xl font-bold">
            {(tokenMetrics.circulatingSupply / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">ホルダー数</p>
          <p className="text-xl font-bold">
            {tokenMetrics.holders.toLocaleString()}
          </p>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
        <p className="text-sm text-blue-400">
          EDUトークンは学習進捗に応じて獲得でき、
          特別講座の受講やNFT購入に使用できます
        </p>
      </div>
    </div>
  )
}

// Main Component
export default function LP9_Web3Blockchain() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-500 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Wallet Connect */}
      <WalletConnect />
      
      {/* Header */}
      <header className="relative z-10 p-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold mb-4"
        >
          <span className="text-gradient">Web3</span> 起業塾
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-300 max-w-2xl mx-auto"
        >
          ブロックチェーン技術で証明される、次世代の起業スキル
        </motion.p>
      </header>
      
      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 pb-32">
        {/* Blockchain Visualizer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <BlockchainVisualizer />
        </motion.div>
        
        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <TransactionPanel />
            <NFTShowcase />
          </div>
          <div>
            <TokenEconomics />
          </div>
        </div>
        
        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <h2 className="text-3xl font-bold mb-6">
            ブロックチェーンで証明される起業力
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            学習成果をNFTで証明し、EDUトークンで新たな学びに投資。
            Web3時代の起業家として、分散型ビジネスモデルを構築しましょう。
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-bold text-lg"
          >
            Web3起業を始める
          </motion.button>
        </motion.div>
      </main>
    </div>
  )
}