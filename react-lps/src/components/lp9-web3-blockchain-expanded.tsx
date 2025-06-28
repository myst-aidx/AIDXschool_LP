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
    box-shadow: 0 0 20px rgba(147, 51, 234, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(147, 51, 234, 0.8);
  }
`

const chainLink = keyframes`
  from {
    stroke-dashoffset: 100;
  }
  to {
    stroke-dashoffset: 0;
  }
`

const mining = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
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

const neonGlow = keyframes`
  0%, 100% {
    text-shadow: 0 0 10px rgba(147, 51, 234, 0.5);
  }
  50% {
    text-shadow: 0 0 20px rgba(147, 51, 234, 1), 0 0 30px rgba(236, 72, 153, 0.8);
  }
`

const slideInFromLeft = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`

const slideInFromRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`

const digitalRain = keyframes`
  0% {
    transform: translateY(-100vh);
  }
  100% {
    transform: translateY(100vh);
  }
`

// スタイルコンポーネント
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #0a0a0a 0%,
    #1a1a2e 15%,
    #16213e 30%,
    #0f3460 45%,
    #533483 60%,
    #7209b7 75%,
    #16213e 90%,
    #0a0a0a 100%
  );
  position: relative;
  overflow-x: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23147cd6' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
    pointer-events: none;
  }
`

const BlockchainContainer = styled.div`
  position: relative;
  padding: 2rem;
  margin-bottom: 3rem;
  
  .blockchain-scroll {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    padding-bottom: 1rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(147, 51, 234, 0.5) transparent;
    
    &::-webkit-scrollbar {
      height: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(147, 51, 234, 0.5);
      border-radius: 4px;
      
      &:hover {
        background: rgba(147, 51, 234, 0.7);
      }
    }
  }
`

const BlockStyled = styled(motion.div)`
  position: relative;
  min-width: 200px;
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  
  &.genesis {
    border-color: ${colors.accent};
    box-shadow: 0 0 20px rgba(255, 217, 61, 0.3);
  }
  
  &.mined {
    border-color: ${colors.secondary};
    animation: ${glow} 2s infinite;
  }
  
  .block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    
    .block-id {
      font-size: 0.875rem;
      font-weight: bold;
      color: ${colors.primary};
    }
    
    .genesis-badge {
      font-size: 0.75rem;
      background: rgba(255, 217, 61, 0.2);
      color: ${colors.accent};
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }
  }
  
  .block-details {
    color: #cbd5e0;
    font-size: 0.75rem;
    
    .detail-row {
      margin-bottom: 0.5rem;
      
      .label {
        color: #a0aec0;
        display: block;
        margin-bottom: 0.25rem;
      }
      
      .value {
        font-family: 'Monaco', 'Menlo', monospace;
        color: #e2e8f0;
        word-break: break-all;
      }
    }
  }
  
  .mined-indicator {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 32px;
    height: 32px;
    background: ${colors.secondary};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    animation: ${sparkle} 2s infinite;
  }
  
  .chain-connection {
    position: absolute;
    left: -24px;
    top: 50%;
    width: 24px;
    height: 4px;
    background: linear-gradient(90deg, ${colors.purple}, ${colors.pink});
    transform: translateY(-50%);
    border-radius: 2px;
    animation: ${chainLink} 1s ease-in-out;
  }
`

const WalletStyled = styled(motion.div)`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 50;
  
  .wallet-button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    background: rgba(26, 26, 46, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }
    
    &.connected {
      border-color: ${colors.secondary};
      background: rgba(56, 193, 114, 0.1);
    }
    
    .wallet-icon {
      font-size: 1.5rem;
    }
    
    .wallet-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      
      .balance-label {
        font-size: 0.75rem;
        color: #a0aec0;
      }
      
      .balance-value {
        font-family: 'Monaco', 'Menlo', monospace;
        font-weight: bold;
      }
    }
    
    .wallet-avatar {
      width: 32px;
      height: 32px;
      background: ${colors.gradient};
      border-radius: 50%;
    }
  }
  
  .wallet-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    width: 320px;
    background: rgba(26, 26, 46, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    
    .dropdown-section {
      margin-bottom: 1rem;
      
      .section-label {
        font-size: 0.75rem;
        color: #a0aec0;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        font-weight: 600;
      }
      
      .section-value {
        color: white;
        font-weight: 500;
        
        &.address {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.875rem;
        }
      }
    }
    
    .disconnect-button {
      width: 100%;
      padding: 0.75rem;
      background: rgba(255, 107, 107, 0.2);
      color: ${colors.danger};
      border: 1px solid rgba(255, 107, 107, 0.3);
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(255, 107, 107, 0.3);
      }
    }
  }
`

const TransactionPanelStyled = styled.div`
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  
  .panel-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
    margin-bottom: 1.5rem;
    animation: ${neonGlow} 3s infinite;
  }
  
  .transaction-form {
    margin-bottom: 2rem;
    
    .form-group {
      margin-bottom: 1rem;
      
      .input-field {
        width: 100%;
        padding: 0.75rem 1rem;
        background: rgba(45, 55, 72, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: white;
        font-size: 0.875rem;
        transition: all 0.3s ease;
        
        &:focus {
          outline: none;
          border-color: ${colors.primary};
          box-shadow: 0 0 0 2px rgba(78, 181, 255, 0.2);
        }
        
        &::placeholder {
          color: #a0aec0;
        }
      }
    }
    
    .form-row {
      display: flex;
      gap: 0.5rem;
      
      .send-button {
        padding: 0.75rem 1.5rem;
        background: ${colors.gradient};
        border: none;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(78, 181, 255, 0.3);
        }
      }
    }
  }
  
  .pending-transactions {
    margin-bottom: 1.5rem;
    
    .section-header {
      font-size: 0.875rem;
      color: #a0aec0;
      margin-bottom: 1rem;
    }
    
    .transaction-item {
      background: rgba(45, 55, 72, 0.6);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 0.5rem;
      animation: ${slideInFromLeft} 0.5s ease-out;
      
      .transaction-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .addresses {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.75rem;
          color: #cbd5e0;
        }
        
        .amount {
          font-weight: bold;
          color: ${colors.accent};
        }
      }
      
      .transaction-meta {
        margin-top: 0.5rem;
        font-size: 0.75rem;
        color: #a0aec0;
        display: flex;
        justify-content: space-between;
        
        .gas-fee {
          color: ${colors.primary};
        }
      }
    }
  }
  
  .mine-button {
    width: 100%;
    padding: 1rem;
    background: ${colors.gradient};
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    &:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(56, 193, 114, 0.3);
    }
    
    &.mining {
      animation: ${pulse} 1.5s infinite;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: ${slideInFromLeft} 2s infinite;
      }
    }
  }
`

const NFTShowcaseStyled = styled.div`
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  
  .showcase-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    
    .showcase-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: white;
      animation: ${neonGlow} 3s infinite;
    }
    
    .mint-button {
      padding: 0.5rem 1rem;
      background: rgba(147, 51, 234, 0.8);
      border: 1px solid ${colors.purple};
      border-radius: 8px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(147, 51, 234, 1);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
      }
    }
  }
  
  .nft-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
    
    .nft-card {
      background: rgba(147, 51, 234, 0.1);
      border: 1px solid rgba(147, 51, 234, 0.3);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      
      &:hover {
        transform: translateY(-4px) scale(1.02);
        box-shadow: 0 8px 25px rgba(147, 51, 234, 0.3);
      }
      
      .nft-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        animation: ${float} 3s infinite;
      }
      
      .nft-name {
        font-weight: 600;
        color: white;
        margin-bottom: 0.5rem;
      }
      
      .nft-attributes {
        font-size: 0.75rem;
        color: #a0aec0;
        
        .attribute {
          margin-bottom: 0.25rem;
        }
      }
      
      .rarity-badge {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        padding: 0.25rem 0.5rem;
        background: ${colors.accent};
        color: ${colors.dark};
        border-radius: 12px;
        font-size: 0.625rem;
        font-weight: bold;
      }
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        transition: left 0.5s ease;
      }
      
      &:hover::before {
        left: 100%;
      }
    }
    
    .empty-slot {
      background: rgba(45, 55, 72, 0.3);
      border: 2px dashed rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #a0aec0;
      font-size: 0.875rem;
      
      &:hover {
        border-color: rgba(255, 255, 255, 0.4);
      }
    }
  }
  
  .nft-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    
    .stat-card {
      background: rgba(45, 55, 72, 0.6);
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
      
      .stat-value {
        font-size: 1.5rem;
        font-weight: bold;
        color: ${colors.accent};
        margin-bottom: 0.25rem;
      }
      
      .stat-label {
        font-size: 0.75rem;
        color: #a0aec0;
        text-transform: uppercase;
      }
    }
  }
`

const TokenEconomicsStyled = styled.div`
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  
  .economics-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
    margin-bottom: 2rem;
    animation: ${neonGlow} 3s infinite;
  }
  
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
    
    .metric-card {
      background: rgba(45, 55, 72, 0.6);
      border-radius: 12px;
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
      
      &.price {
        border: 1px solid rgba(56, 193, 114, 0.3);
        
        .metric-value {
          color: ${colors.secondary};
        }
      }
      
      &.market-cap {
        border: 1px solid rgba(78, 181, 255, 0.3);
        
        .metric-value {
          color: ${colors.primary};
        }
      }
      
      &.supply {
        border: 1px solid rgba(255, 217, 61, 0.3);
        
        .metric-value {
          color: ${colors.accent};
        }
      }
      
      &.holders {
        border: 1px solid rgba(147, 51, 234, 0.3);
        
        .metric-value {
          color: ${colors.purple};
        }
      }
      
      .metric-label {
        font-size: 0.875rem;
        color: #a0aec0;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        font-weight: 600;
      }
      
      .metric-value {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 0.25rem;
      }
      
      .metric-change {
        font-size: 0.75rem;
        
        &.positive {
          color: ${colors.secondary};
        }
        
        &.negative {
          color: ${colors.danger};
        }
      }
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
        animation: ${slideInFromLeft} 4s infinite;
      }
    }
  }
  
  .token-info {
    background: rgba(78, 181, 255, 0.1);
    border: 1px solid rgba(78, 181, 255, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    
    .info-text {
      color: ${colors.primary};
      font-size: 0.875rem;
      line-height: 1.5;
    }
  }
  
  .price-chart {
    height: 120px;
    background: rgba(45, 55, 72, 0.6);
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    
    .chart-line {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50%;
      background: linear-gradient(to right, ${colors.secondary}, ${colors.primary});
      opacity: 0.6;
      animation: ${pulse} 2s infinite;
    }
    
    .chart-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      background: rgba(0, 0, 0, 0.3);
    }
  }
`

const DigitalRainStyled = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  opacity: 0.1;
  
  .rain-column {
    position: absolute;
    top: 0;
    width: 2px;
    height: 100vh;
    background: linear-gradient(to bottom, transparent, ${colors.primary}, transparent);
    animation: ${digitalRain} 3s linear infinite;
  }
`

const MiningAnimationStyled = styled(motion.div)`
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
  
  .mining-ring {
    position: absolute;
    border: 3px solid transparent;
    border-top: 3px solid ${colors.primary};
    border-radius: 50%;
    animation: ${mining} 2s linear infinite;
    
    &:nth-child(1) {
      width: 60px;
      height: 60px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    
    &:nth-child(2) {
      width: 100px;
      height: 100px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-top-color: ${colors.purple};
      animation-duration: 3s;
      animation-direction: reverse;
    }
    
    &:nth-child(3) {
      width: 140px;
      height: 140px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-top-color: ${colors.secondary};
      animation-duration: 4s;
    }
  }
  
  .mining-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 2rem;
    animation: ${pulse} 1.5s infinite;
  }
`

const ModalStyled = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  
  .modal-content {
    background: rgba(26, 26, 46, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    
    .modal-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: white;
      margin-bottom: 2rem;
      text-align: center;
    }
    
    .nft-options {
      display: grid;
      gap: 1rem;
      
      .nft-option {
        display: flex;
        align-items: center;
        gap: 1rem;
        background: rgba(45, 55, 72, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(45, 55, 72, 0.8);
          border-color: ${colors.purple};
          transform: translateX(8px);
        }
        
        .nft-icon {
          font-size: 2rem;
        }
        
        .nft-details {
          flex: 1;
          
          .nft-name {
            font-weight: 600;
            color: white;
            margin-bottom: 0.25rem;
          }
          
          .nft-level {
            font-size: 0.875rem;
            color: #a0aec0;
          }
        }
        
        .nft-rarity {
          padding: 0.25rem 0.5rem;
          background: ${colors.accent};
          color: ${colors.dark};
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: bold;
        }
      }
    }
    
    .modal-actions {
      margin-top: 2rem;
      display: flex;
      gap: 1rem;
      
      .cancel-button {
        flex: 1;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }
  }
`

// Types
interface Block {
  id: number
  hash: string
  previousHash: string
  timestamp: number
  data: Transaction[]
  nonce: number
  mined: boolean
  validator?: string
  gasUsed?: number
  gasLimit?: number
  size?: number
}

interface Transaction {
  id: string
  from: string
  to: string
  amount: number
  type: 'transfer' | 'mint' | 'burn' | 'stake' | 'unstake'
  gasPrice?: number
  gasLimit?: number
  status: 'pending' | 'confirmed' | 'failed'
  timestamp?: number
}

interface NFTCertificate {
  id: string
  name: string
  image: string
  attributes: {
    skill: string
    level: number
    date: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
  }[]
  owner: string
  metadata: {
    description: string
    external_url?: string
    animation_url?: string
  }
  minted_at: number
  collection: string
}

interface TokenMetrics {
  totalSupply: number
  circulatingSupply: number
  price: number
  marketCap: number
  holders: number
  volume24h: number
  priceChange24h: number
  stakingRewards: number
  burnedTokens: number
}

interface DeFiPool {
  id: string
  name: string
  token1: string
  token2: string
  liquidity: number
  apr: number
  volume24h: number
  userStaked?: number
}

interface Web3Analytics {
  totalTransactions: number
  successRate: number
  averageGasPrice: number
  networkHashrate: number
  activeValidators: number
  stakingRatio: number
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
    stakedTokens: number
    rewards: number
  }
  tokenMetrics: TokenMetrics
  defiPools: DeFiPool[]
  analytics: Web3Analytics
  miningDifficulty: number
  isMining: boolean
  networkStatus: 'online' | 'offline' | 'maintenance'
  addBlock: (block: Block) => void
  addTransaction: (transaction: Transaction) => void
  connectWallet: () => void
  disconnectWallet: () => void
  mintNFT: (nft: NFTCertificate) => void
  startMining: () => void
  updateTokenPrice: (price: number) => void
  stakeTokens: (amount: number) => void
  unstakeTokens: (amount: number) => void
  provideLiquidity: (poolId: string, amount: number) => void
  removeLiquidity: (poolId: string, amount: number) => void
}

const useWeb3Store = create<Web3Store>((set, get) => ({
  blocks: [
    {
      id: 0,
      hash: '0x000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
      previousHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      timestamp: Date.now() - 86400000,
      data: [],
      nonce: 2083236893,
      mined: true,
      validator: 'Genesis',
      gasUsed: 0,
      gasLimit: 15000000,
      size: 285
    }
  ],
  pendingTransactions: [],
  wallet: {
    address: '',
    balance: 0,
    nfts: [],
    connected: false,
    stakedTokens: 0,
    rewards: 0
  },
  tokenMetrics: {
    totalSupply: 21000000,
    circulatingSupply: 18500000,
    price: 2.45,
    marketCap: 45325000,
    holders: 15789,
    volume24h: 2340000,
    priceChange24h: 5.67,
    stakingRewards: 125000,
    burnedTokens: 340000
  },
  defiPools: [
    {
      id: 'edu-eth',
      name: 'EDU/ETH',
      token1: 'EDU',
      token2: 'ETH',
      liquidity: 1200000,
      apr: 15.6,
      volume24h: 340000
    },
    {
      id: 'edu-usdc',
      name: 'EDU/USDC',
      token1: 'EDU',
      token2: 'USDC',
      liquidity: 890000,
      apr: 12.3,
      volume24h: 250000
    }
  ],
  analytics: {
    totalTransactions: 1234567,
    successRate: 99.2,
    averageGasPrice: 0.000035,
    networkHashrate: 156.7,
    activeValidators: 21,
    stakingRatio: 65.4
  },
  miningDifficulty: 4,
  isMining: false,
  networkStatus: 'online',
  
  addBlock: (block) => set((state) => ({
    blocks: [...state.blocks, block],
    pendingTransactions: []
  })),
  
  addTransaction: (transaction) => set((state) => ({
    pendingTransactions: [...state.pendingTransactions, { 
      ...transaction, 
      status: 'pending',
      timestamp: Date.now(),
      gasPrice: 0.000021,
      gasLimit: 21000
    }]
  })),
  
  connectWallet: () => set({
    wallet: {
      address: '0x' + Math.random().toString(16).substr(2, 40),
      balance: 1000 + Math.floor(Math.random() * 5000),
      nfts: [],
      connected: true,
      stakedTokens: Math.floor(Math.random() * 500),
      rewards: Math.floor(Math.random() * 50)
    }
  }),
  
  disconnectWallet: () => set({
    wallet: {
      address: '',
      balance: 0,
      nfts: [],
      connected: false,
      stakedTokens: 0,
      rewards: 0
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
    
    setTimeout(() => {
      const state = get()
      const newBlock: Block = {
        id: state.blocks.length,
        hash: '0x' + Math.random().toString(16).substr(2, 64),
        previousHash: state.blocks[state.blocks.length - 1].hash,
        timestamp: Date.now(),
        data: state.pendingTransactions.map(tx => ({ ...tx, status: 'confirmed' as const })),
        nonce: Math.floor(Math.random() * 4294967296),
        mined: true,
        validator: state.wallet.address || 'Anonymous',
        gasUsed: Math.floor(Math.random() * 10000000),
        gasLimit: 15000000,
        size: 1024 + Math.floor(Math.random() * 512)
      }
      
      get().addBlock(newBlock)
      set({ isMining: false })
      
      if (state.wallet.connected) {
        set((state) => ({
          wallet: {
            ...state.wallet,
            balance: state.wallet.balance + 50 + Math.floor(Math.random() * 50),
            rewards: state.wallet.rewards + 10
          }
        }))
      }
    }, 5000 + Math.floor(Math.random() * 3000))
  },
  
  updateTokenPrice: (price) => set((state) => {
    const priceChange = ((price - state.tokenMetrics.price) / state.tokenMetrics.price) * 100
    return {
      tokenMetrics: {
        ...state.tokenMetrics,
        price,
        marketCap: price * state.tokenMetrics.circulatingSupply,
        priceChange24h: priceChange
      }
    }
  }),
  
  stakeTokens: (amount) => set((state) => ({
    wallet: {
      ...state.wallet,
      balance: state.wallet.balance - amount,
      stakedTokens: state.wallet.stakedTokens + amount
    }
  })),
  
  unstakeTokens: (amount) => set((state) => ({
    wallet: {
      ...state.wallet,
      balance: state.wallet.balance + amount,
      stakedTokens: state.wallet.stakedTokens - amount
    }
  })),
  
  provideLiquidity: (poolId, amount) => set((state) => {
    const poolIndex = state.defiPools.findIndex(p => p.id === poolId)
    if (poolIndex === -1) return state
    
    const updatedPools = [...state.defiPools]
    updatedPools[poolIndex] = {
      ...updatedPools[poolIndex],
      liquidity: updatedPools[poolIndex].liquidity + amount,
      userStaked: (updatedPools[poolIndex].userStaked || 0) + amount
    }
    
    return {
      defiPools: updatedPools,
      wallet: {
        ...state.wallet,
        balance: state.wallet.balance - amount
      }
    }
  }),
  
  removeLiquidity: (poolId, amount) => set((state) => {
    const poolIndex = state.defiPools.findIndex(p => p.id === poolId)
    if (poolIndex === -1) return state
    
    const updatedPools = [...state.defiPools]
    updatedPools[poolIndex] = {
      ...updatedPools[poolIndex],
      liquidity: updatedPools[poolIndex].liquidity - amount,
      userStaked: Math.max(0, (updatedPools[poolIndex].userStaked || 0) - amount)
    }
    
    return {
      defiPools: updatedPools,
      wallet: {
        ...state.wallet,
        balance: state.wallet.balance + amount
      }
    }
  })
}))

// Components
function DigitalRain() {
  return (
    <DigitalRainStyled>
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="rain-column"
          style={{
            left: `${i * 5}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        />
      ))}
    </DigitalRainStyled>
  )
}

function BlockchainVisualizer() {
  const { blocks, isMining } = useWeb3Store()
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (containerRef.current && blocks.length > 3) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth
    }
  }, [blocks])
  
  return (
    <BlockchainContainer>
      <motion.h3
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8 text-white text-center"
      >
        ブロックチェーンエクスプローラー
      </motion.h3>
      
      <div ref={containerRef} className="blockchain-scroll">
        {blocks.map((block, index) => (
          <motion.div
            key={block.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            style={{ position: 'relative' }}
          >
            {index > 0 && <div className="chain-connection" />}
            
            <BlockStyled
              className={`${block.id === 0 ? 'genesis' : ''} ${block.mined ? 'mined' : ''}`}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="block-header">
                <span className="block-id">Block #{block.id}</span>
                {block.id === 0 && (
                  <span className="genesis-badge">GENESIS</span>
                )}
              </div>
              
              <div className="block-details">
                <div className="detail-row">
                  <span className="label">Hash:</span>
                  <p className="value">{block.hash.substr(0, 16)}...</p>
                </div>
                <div className="detail-row">
                  <span className="label">Previous:</span>
                  <p className="value">{block.previousHash.substr(0, 16)}...</p>
                </div>
                <div className="detail-row">
                  <span className="label">Transactions:</span>
                  <p className="value">{block.data.length} txns</p>
                </div>
                <div className="detail-row">
                  <span className="label">Gas Used:</span>
                  <p className="value">{block.gasUsed?.toLocaleString() || 0}</p>
                </div>
                <div className="detail-row">
                  <span className="label">Size:</span>
                  <p className="value">{block.size || 0} bytes</p>
                </div>
                <div className="detail-row">
                  <span className="label">Nonce:</span>
                  <p className="value">{block.nonce}</p>
                </div>
              </div>
              
              {block.mined && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mined-indicator"
                >
                  ✓
                </motion.div>
              )}
            </BlockStyled>
          </motion.div>
        ))}
        
        {isMining && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ 
              minWidth: '200px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <MiningAnimationStyled>
              <div className="mining-ring" />
              <div className="mining-ring" />
              <div className="mining-ring" />
              <div className="mining-icon">⛏️</div>
            </MiningAnimationStyled>
          </motion.div>
        )}
      </div>
    </BlockchainContainer>
  )
}

function WalletConnect() {
  const { wallet, connectWallet, disconnectWallet } = useWeb3Store()
  const [showDetails, setShowDetails] = useState(false)
  
  return (
    <WalletStyled
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {!wallet.connected ? (
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={connectWallet}
          className="wallet-button"
        >
          <span className="wallet-icon">🦊</span>
          <span>ウォレット接続</span>
        </motion.button>
      ) : (
        <div style={{ position: 'relative' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowDetails(!showDetails)}
            className="wallet-button connected"
          >
            <div className="wallet-avatar" />
            <div className="wallet-info">
              <span className="balance-label">残高</span>
              <span className="balance-value">{wallet.balance.toLocaleString()} EDU</span>
            </div>
          </motion.button>
          
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="wallet-dropdown"
                style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem' }}
              >
                <div className="dropdown-section">
                  <div className="section-label">アドレス</div>
                  <div className="section-value address">
                    {wallet.address.substr(0, 10)}...{wallet.address.substr(-8)}
                  </div>
                </div>
                <div className="dropdown-section">
                  <div className="section-label">保有NFT</div>
                  <div className="section-value">{wallet.nfts.length} 個</div>
                </div>
                <div className="dropdown-section">
                  <div className="section-label">ステーキング</div>
                  <div className="section-value">{wallet.stakedTokens.toLocaleString()} EDU</div>
                </div>
                <div className="dropdown-section">
                  <div className="section-label">リワード</div>
                  <div className="section-value">{wallet.rewards.toLocaleString()} EDU</div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="disconnect-button"
                >
                  切断
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </WalletStyled>
  )
}

function TransactionPanel() {
  const { pendingTransactions, addTransaction, wallet, startMining, isMining } = useWeb3Store()
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [transactionType, setTransactionType] = useState<'transfer' | 'stake' | 'unstake'>('transfer')
  
  const handleSendTransaction = () => {
    if (!wallet.connected || !amount) return
    
    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      from: wallet.address,
      to: recipient || '0x' + Math.random().toString(16).substr(2, 40),
      amount: parseFloat(amount),
      type: transactionType,
      status: 'pending'
    }
    
    addTransaction(transaction)
    setAmount('')
    setRecipient('')
  }
  
  return (
    <TransactionPanelStyled>
      <h3 className="panel-title">🔗 トランザクション センター</h3>
      
      {wallet.connected && (
        <div className="transaction-form">
          <div className="form-group">
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value as any)}
              className="input-field"
            >
              <option value="transfer">送金</option>
              <option value="stake">ステーキング</option>
              <option value="unstake">アンステーキング</option>
            </select>
          </div>
          
          {transactionType === 'transfer' && (
            <div className="form-group">
              <input
                type="text"
                placeholder="受信者アドレス (0x...)"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="input-field"
              />
            </div>
          )}
          
          <div className="form-row">
            <input
              type="number"
              placeholder="数量"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field"
              style={{ flex: 1 }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendTransaction}
              className="send-button"
            >
              実行
            </motion.button>
          </div>
        </div>
      )}
      
      <div className="pending-transactions">
        <p className="section-header">
          ⏳ 保留中のトランザクション ({pendingTransactions.length})
        </p>
        {pendingTransactions.map(tx => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="transaction-item"
          >
            <div className="transaction-info">
              <span className="addresses">
                {tx.from.substr(0, 6)}...{tx.from.substr(-4)} → {tx.to.substr(0, 6)}...{tx.to.substr(-4)}
              </span>
              <span className="amount">{tx.amount} EDU</span>
            </div>
            <div className="transaction-meta">
              <span>タイプ: {tx.type}</span>
              <span className="gas-fee">Gas: {tx.gasPrice?.toFixed(6)} ETH</span>
            </div>
          </motion.div>
        ))}
      </div>
      
      {pendingTransactions.length > 0 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={startMining}
          disabled={isMining}
          className={`mine-button ${isMining ? 'mining' : ''}`}
        >
          {isMining ? '⛏️ マイニング中...' : '⚡ ブロックをマイニング'}
        </motion.button>
      )}
    </TransactionPanelStyled>
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
      image: '🤖',
      rarity: 'legendary' as const,
      description: 'AIを使いこなす最高レベルの証明'
    },
    {
      name: 'ノーコード開発者',
      skill: 'ノーコード',
      level: 4,
      image: '🔧',
      rarity: 'epic' as const,
      description: 'ノーコードツールのエキスパート'
    },
    {
      name: 'DXコンサルタント',
      skill: 'DX戦略',
      level: 3,
      image: '💡',
      rarity: 'rare' as const,
      description: 'デジタル変革のスペシャリスト'
    },
    {
      name: 'Web3起業家',
      skill: 'ブロックチェーン',
      level: 5,
      image: '⚡',
      rarity: 'legendary' as const,
      description: '分散型ビジネスモデルの構築者'
    },
    {
      name: 'メタバース建築士',
      skill: 'バーチャル空間',
      level: 4,
      image: '🏗️',
      rarity: 'epic' as const,
      description: '仮想世界のクリエイター'
    },
    {
      name: 'NFTアーティスト',
      skill: 'デジタルアート',
      level: 3,
      image: '🎨',
      rarity: 'rare' as const,
      description: 'ブロックチェーン上のアート作品制作者'
    }
  ]
  
  const handleMintNFT = (nft: typeof sampleNFTs[0]) => {
    if (!wallet.connected) return
    
    const newNFT: NFTCertificate = {
      id: Math.random().toString(36).substr(2, 9),
      name: nft.name,
      image: nft.image,
      attributes: [
        { 
          skill: nft.skill, 
          level: nft.level, 
          date: new Date().toISOString(),
          rarity: nft.rarity
        }
      ],
      owner: wallet.address,
      metadata: {
        description: nft.description,
        external_url: 'https://aidxschool.com'
      },
      minted_at: Date.now(),
      collection: 'AIDXschool Skills'
    }
    
    mintNFT(newNFT)
    setShowMintModal(false)
  }
  
  const getTotalValue = () => {
    return wallet.nfts.reduce((total, nft) => {
      const rarity = nft.attributes[0]?.rarity || 'common'
      const values = { common: 10, rare: 50, epic: 200, legendary: 1000 }
      return total + values[rarity]
    }, 0)
  }
  
  return (
    <NFTShowcaseStyled>
      <div className="showcase-header">
        <h3 className="showcase-title">🏆 スキル証明NFTコレクション</h3>
        {wallet.connected && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMintModal(true)}
            className="mint-button"
          >
            NFTを獲得
          </motion.button>
        )}
      </div>
      
      <div className="nft-grid">
        {wallet.nfts.map(nft => (
          <motion.div
            key={nft.id}
            initial={{ scale: 0, rotateY: 180 }}
            animate={{ scale: 1, rotateY: 0 }}
            whileHover={{ scale: 1.05, rotateY: 10 }}
            className="nft-card"
          >
            <div className="rarity-badge">
              {nft.attributes[0]?.rarity?.toUpperCase() || 'COMMON'}
            </div>
            <div className="nft-icon">{nft.image}</div>
            <p className="nft-name">{nft.name}</p>
            <div className="nft-attributes">
              {nft.attributes.map((attr, i) => (
                <div key={i} className="attribute">
                  Lv.{attr.level} {attr.skill}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
        
        {[...Array(Math.max(0, 9 - wallet.nfts.length))].map((_, i) => (
          <div key={`empty-${i}`} className="empty-slot">
            空きスロット
          </div>
        ))}
      </div>
      
      <div className="nft-stats">
        <div className="stat-card">
          <div className="stat-value">{wallet.nfts.length}</div>
          <div className="stat-label">所有NFT</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{getTotalValue().toLocaleString()}</div>
          <div className="stat-label">推定価値 (EDU)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {wallet.nfts.filter(nft => nft.attributes[0]?.rarity === 'legendary').length}
          </div>
          <div className="stat-label">レジェンダリー</div>
        </div>
      </div>
      
      <AnimatePresence>
        {showMintModal && (
          <ModalStyled
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMintModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="modal-title">🎁 NFTを選択してミント</h3>
              <div className="nft-options">
                {sampleNFTs.map((nft, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ x: 10 }}
                    onClick={() => handleMintNFT(nft)}
                    className="nft-option"
                  >
                    <span className="nft-icon">{nft.image}</span>
                    <div className="nft-details">
                      <p className="nft-name">{nft.name}</p>
                      <p className="nft-level">レベル {nft.level} • {nft.skill}</p>
                    </div>
                    <div className="nft-rarity">{nft.rarity.toUpperCase()}</div>
                  </motion.button>
                ))}
              </div>
              <div className="modal-actions">
                <button
                  onClick={() => setShowMintModal(false)}
                  className="cancel-button"
                >
                  キャンセル
                </button>
              </div>
            </motion.div>
          </ModalStyled>
        )}
      </AnimatePresence>
    </NFTShowcaseStyled>
  )
}

function TokenEconomics() {
  const { tokenMetrics, updateTokenPrice } = useWeb3Store()
  const [priceHistory, setPriceHistory] = useState<number[]>([])
  
  useEffect(() => {
    const interval = setInterval(() => {
      const variation = (Math.random() - 0.5) * 0.2
      const newPrice = Math.max(0.1, tokenMetrics.price * (1 + variation))
      updateTokenPrice(newPrice)
      
      setPriceHistory(prev => [...prev.slice(-29), newPrice])
    }, 4000)
    
    return () => clearInterval(interval)
  }, [tokenMetrics.price, updateTokenPrice])
  
  const formatLargeNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }
  
  return (
    <TokenEconomicsStyled>
      <h3 className="economics-title">💰 EDUトークン経済システム</h3>
      
      <div className="metrics-grid">
        <div className="metric-card price">
          <div className="metric-label">現在価格</div>
          <div className="metric-value">
            ${tokenMetrics.price.toFixed(4)}
          </div>
          <div className={`metric-change ${tokenMetrics.priceChange24h >= 0 ? 'positive' : 'negative'}`}>
            {tokenMetrics.priceChange24h >= 0 ? '+' : ''}{tokenMetrics.priceChange24h.toFixed(2)}%
          </div>
        </div>
        
        <div className="metric-card market-cap">
          <div className="metric-label">時価総額</div>
          <div className="metric-value">
            ${formatLargeNumber(tokenMetrics.marketCap)}
          </div>
          <div className="metric-change positive">
            Rank #247
          </div>
        </div>
        
        <div className="metric-card supply">
          <div className="metric-label">流通供給量</div>
          <div className="metric-value">
            {formatLargeNumber(tokenMetrics.circulatingSupply)}
          </div>
          <div className="metric-change">
            Max: {formatLargeNumber(tokenMetrics.totalSupply)}
          </div>
        </div>
        
        <div className="metric-card holders">
          <div className="metric-label">ホルダー数</div>
          <div className="metric-value">
            {tokenMetrics.holders.toLocaleString()}
          </div>
          <div className="metric-change positive">
            +{Math.floor(Math.random() * 50)} (24h)
          </div>
        </div>
      </div>
      
      <div className="token-info">
        <p className="info-text">
          🎓 EDUトークンは学習進捗とスキル習得に応じて獲得できる教育特化型トークンです。
          ステーキングによる報酬、DeFi流動性マイニング、NFT購入、特別講座の受講権利として活用できます。
        </p>
      </div>
      
      <div className="price-chart">
        <div className="chart-line" />
        <div className="chart-overlay">
          📈 24時間チャート (Coming Soon)
        </div>
      </div>
      
      <div className="metrics-grid" style={{ marginTop: '1.5rem' }}>
        <div className="metric-card">
          <div className="metric-label">24時間取引量</div>
          <div className="metric-value" style={{ color: colors.secondary }}>
            ${formatLargeNumber(tokenMetrics.volume24h)}
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">ステーキング報酬</div>
          <div className="metric-value" style={{ color: colors.accent }}>
            {formatLargeNumber(tokenMetrics.stakingRewards)}
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">バーン済み</div>
          <div className="metric-value" style={{ color: colors.danger }}>
            {formatLargeNumber(tokenMetrics.burnedTokens)}
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">APY</div>
          <div className="metric-value" style={{ color: colors.purple }}>
            12.5%
          </div>
        </div>
      </div>
    </TokenEconomicsStyled>
  )
}

function DeFiPools() {
  const { defiPools, wallet, provideLiquidity, removeLiquidity } = useWeb3Store()
  const [selectedPool, setSelectedPool] = useState<string | null>(null)
  const [liquidityAmount, setLiquidityAmount] = useState('')
  
  const handleProvideLiquidity = () => {
    if (!selectedPool || !liquidityAmount) return
    provideLiquidity(selectedPool, parseFloat(liquidityAmount))
    setLiquidityAmount('')
    setSelectedPool(null)
  }
  
  return (
    <div style={{
      background: 'rgba(26, 26, 46, 0.9)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '2rem'
    }}>
      <h3 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'white',
        marginBottom: '2rem',
        animation: `${neonGlow} 3s infinite`
      }}>
        🏊 DeFi 流動性プール
      </h3>
      
      <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
        {defiPools.map(pool => (
          <motion.div
            key={pool.id}
            whileHover={{ scale: 1.02 }}
            style={{
              background: 'rgba(45, 55, 72, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.5rem',
              cursor: 'pointer'
            }}
            onClick={() => setSelectedPool(pool.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ color: 'white', fontWeight: 'bold' }}>{pool.name}</h4>
              <span style={{ 
                background: colors.gradient,
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }}>
                APR {pool.apr}%
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontSize: '0.875rem' }}>
              <div>
                <div style={{ color: '#a0aec0', marginBottom: '0.25rem' }}>流動性</div>
                <div style={{ color: 'white', fontWeight: 'bold' }}>
                  ${(pool.liquidity / 1000).toFixed(0)}K
                </div>
              </div>
              <div>
                <div style={{ color: '#a0aec0', marginBottom: '0.25rem' }}>24h取引量</div>
                <div style={{ color: 'white', fontWeight: 'bold' }}>
                  ${(pool.volume24h / 1000).toFixed(0)}K
                </div>
              </div>
              <div>
                <div style={{ color: '#a0aec0', marginBottom: '0.25rem' }}>あなたの投資</div>
                <div style={{ color: colors.accent, fontWeight: 'bold' }}>
                  ${(pool.userStaked || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {selectedPool && wallet.connected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(78, 181, 255, 0.1)',
            border: '1px solid rgba(78, 181, 255, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}
        >
          <h4 style={{ color: 'white', marginBottom: '1rem' }}>流動性を提供</h4>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="number"
              placeholder="提供する金額"
              value={liquidityAmount}
              onChange={(e) => setLiquidityAmount(e.target.value)}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: 'rgba(45, 55, 72, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white'
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleProvideLiquidity}
              style={{
                padding: '0.75rem 1.5rem',
                background: colors.gradient,
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              提供
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Main Component
export default function LP9_Web3BlockchainExpanded() {
  const { networkStatus } = useWeb3Store()
  
  return (
    <Container>
      <DigitalRain />
      <WalletConnect />
      
      {/* Hero Section */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ 
          position: 'relative', 
          zIndex: 10, 
          padding: '4rem 2rem', 
          textAlign: 'center' 
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: 'bold',
            marginBottom: '2rem',
            background: colors.gradient,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: `${neonGlow} 4s infinite`
          }}
        >
          Web3 起業アカデミー
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{
            fontSize: '1.25rem',
            color: '#cbd5e0',
            maxWidth: '800px',
            margin: '0 auto 3rem',
            lineHeight: 1.6
          }}
        >
          🚀 ブロックチェーン技術で証明される次世代起業スキル<br />
          NFT証明書、DeFi報酬、トークン経済で学習成果を資産化
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{
            padding: '0.5rem 1rem',
            background: networkStatus === 'online' ? 'rgba(56, 193, 114, 0.2)' : 'rgba(255, 107, 107, 0.2)',
            border: `1px solid ${networkStatus === 'online' ? colors.secondary : colors.danger}`,
            borderRadius: '20px',
            fontSize: '0.875rem',
            color: networkStatus === 'online' ? colors.secondary : colors.danger
          }}>
            🌐 ネットワーク: {networkStatus === 'online' ? 'オンライン' : 'オフライン'}
          </div>
          <div style={{
            padding: '0.5rem 1rem',
            background: 'rgba(147, 51, 234, 0.2)',
            border: `1px solid ${colors.purple}`,
            borderRadius: '20px',
            fontSize: '0.875rem',
            color: colors.purple
          }}>
            ⚡ ガス料金: 低
          </div>
        </motion.div>
      </motion.header>
      
      {/* Main Content */}
      <main style={{ position: 'relative', zIndex: 10, maxWidth: '1400px', margin: '0 auto', padding: '0 2rem 4rem' }}>
        <BlockchainVisualizer />
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          <TransactionPanel />
          <TokenEconomics />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          <NFTShowcase />
          <DeFiPools />
        </div>
        
        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          style={{
            textAlign: 'center',
            background: 'rgba(26, 26, 46, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '4rem 2rem',
            margin: '4rem 0'
          }}
        >
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '2rem',
            color: 'white',
            animation: `${neonGlow} 3s infinite`
          }}>
            🌟 未来の起業家への招待状
          </h2>
          
          <p style={{
            fontSize: '1.125rem',
            color: '#cbd5e0',
            maxWidth: '800px',
            margin: '0 auto 3rem',
            lineHeight: 1.6
          }}>
            学習成果をNFTで証明し、EDUトークンで新たな学びに投資。<br />
            DeFi流動性マイニング、ステーキング報酬、ガバナンス参加で<br />
            Web3時代の分散型ビジネスモデルを構築しましょう。
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '1rem 2rem',
                background: colors.gradient,
                border: 'none',
                borderRadius: '50px',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.125rem',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(78, 181, 255, 0.3)'
              }}
            >
              🚀 Web3起業を始める
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '1rem 2rem',
                background: 'transparent',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50px',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.125rem',
                cursor: 'pointer'
              }}
            >
              📚 ホワイトペーパー
            </motion.button>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginTop: '3rem'
          }}>
            {[
              { icon: '🎓', title: 'スキル証明NFT', desc: '学習成果をブロックチェーンで永続的に証明' },
              { icon: '💰', title: 'トークン報酬', desc: 'EDUトークンで学習モチベーションを資産化' },
              { icon: '🏊', title: 'DeFi参加', desc: '流動性プールとステーキングで収益創出' },
              { icon: '🗳️', title: 'ガバナンス', desc: 'DAOでカリキュラムと運営方針を決定' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                style={{
                  textAlign: 'center',
                  padding: '1.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{ color: 'white', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#a0aec0', fontSize: '0.875rem', lineHeight: 1.5 }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>
    </Container>
  )
}