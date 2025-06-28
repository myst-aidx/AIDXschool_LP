import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
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

const skillGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(78, 181, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(78, 181, 255, 0.8);
  }
`

const levelUp = keyframes`
  0% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.2) rotate(5deg);
  }
  50% {
    transform: scale(1.4) rotate(-5deg);
  }
  75% {
    transform: scale(1.2) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
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

const slideIn = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
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

const orbitRotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const breathe = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
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
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
    pointer-events: none;
  }
`

const SkillNodeStyled = styled(motion.div)`
  position: absolute;
  z-index: 10;
  
  .skill-button {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: 4px solid;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    position: relative;
    transition: all 0.3s ease;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    
    &.can-upgrade {
      border-color: ${colors.primary};
      background: rgba(78, 181, 255, 0.2);
      animation: ${skillGlow} 2s infinite;
      
      &:hover {
        transform: scale(1.1);
        box-shadow: 0 0 30px rgba(78, 181, 255, 0.6);
      }
    }
    
    &.unlocked {
      border-color: ${colors.secondary};
      background: rgba(56, 193, 114, 0.2);
      animation: ${breathe} 3s infinite;
    }
    
    &.maxed {
      border-color: ${colors.accent};
      background: rgba(255, 217, 61, 0.3);
      animation: ${levelUp} 0.5s ease-in-out;
      box-shadow: 0 0 25px rgba(255, 217, 61, 0.5);
    }
    
    &.locked {
      border-color: #4a5568;
      background: rgba(74, 85, 104, 0.2);
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
  
  .skill-cost {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    background: ${colors.primary};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    color: white;
    animation: ${pulse} 1.5s infinite;
    box-shadow: 0 0 10px rgba(78, 181, 255, 0.5);
  }
  
  .level-dots {
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 4px;
    
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      transition: all 0.3s ease;
      
      &.filled {
        background: ${colors.accent};
        box-shadow: 0 0 8px rgba(255, 217, 61, 0.5);
        animation: ${sparkle} 2s infinite;
      }
      
      &.empty {
        background: #4a5568;
        opacity: 0.6;
      }
    }
  }
  
  .skill-particles {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    pointer-events: none;
    
    .particle {
      position: absolute;
      width: 3px;
      height: 3px;
      background: ${colors.primary};
      border-radius: 50%;
      animation: ${orbitRotate} 8s linear infinite;
      
      &:nth-child(1) { animation-delay: 0s; transform: rotate(0deg) translateX(40px); }
      &:nth-child(2) { animation-delay: -2s; transform: rotate(90deg) translateX(40px); }
      &:nth-child(3) { animation-delay: -4s; transform: rotate(180deg) translateX(40px); }
      &:nth-child(4) { animation-delay: -6s; transform: rotate(270deg) translateX(40px); }
    }
  }
`

const TooltipStyled = styled(motion.div)`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 12px;
  width: 320px;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 20px;
  z-index: 20;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  
  .tooltip-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    
    .tooltip-icon {
      font-size: 2rem;
    }
    
    .tooltip-title {
      color: white;
      font-weight: bold;
      font-size: 18px;
      margin: 0;
    }
  }
  
  .tooltip-description {
    color: #cbd5e0;
    font-size: 14px;
    margin-bottom: 16px;
    line-height: 1.5;
  }
  
  .tooltip-benefits {
    margin-bottom: 12px;
    
    .benefits-title {
      color: ${colors.secondary};
      font-weight: bold;
      font-size: 12px;
      margin-bottom: 6px;
      text-transform: uppercase;
    }
    
    .benefits-list {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      
      .benefit-tag {
        background: rgba(56, 193, 114, 0.2);
        color: ${colors.secondary};
        padding: 2px 6px;
        border-radius: 8px;
        font-size: 10px;
      }
    }
  }
  
  .tooltip-stats {
    color: #a0aec0;
    font-size: 12px;
    margin-bottom: 12px;
    
    p {
      margin: 3px 0;
      display: flex;
      justify-content: space-between;
    }
    
    .stat-value {
      color: white;
      font-weight: bold;
    }
  }
  
  .tooltip-application {
    background: rgba(147, 51, 234, 0.1);
    border: 1px solid rgba(147, 51, 234, 0.3);
    border-radius: 8px;
    padding: 8px;
    margin-bottom: 12px;
    
    .application-title {
      color: ${colors.purple};
      font-weight: bold;
      font-size: 10px;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    
    .application-text {
      color: #cbd5e0;
      font-size: 11px;
      line-height: 1.4;
    }
  }
  
  .tooltip-category {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: bold;
    text-transform: uppercase;
    
    &.ai {
      background: rgba(78, 181, 255, 0.2);
      color: ${colors.primary};
      border: 1px solid rgba(78, 181, 255, 0.3);
    }
    
    &.dx {
      background: rgba(147, 51, 234, 0.2);
      color: ${colors.purple};
      border: 1px solid rgba(147, 51, 234, 0.3);
    }
    
    &.business {
      background: rgba(56, 193, 114, 0.2);
      color: ${colors.secondary};
      border: 1px solid rgba(56, 193, 114, 0.3);
    }
    
    &.marketing {
      background: rgba(236, 72, 153, 0.2);
      color: ${colors.pink};
      border: 1px solid rgba(236, 72, 153, 0.3);
    }
  }
  
  .tooltip-progress {
    margin-top: 12px;
    
    .progress-bar {
      width: 100%;
      height: 6px;
      background: #2d3748;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 4px;
      
      .progress-fill {
        height: 100%;
        background: ${colors.gradient};
        transition: width 0.3s ease;
      }
    }
    
    .progress-text {
      color: #a0aec0;
      font-size: 10px;
      text-align: center;
    }
  }
`

const PlayerStatusStyled = styled(motion.div)`
  position: fixed;
  left: 0;
  top: 80px;
  width: 340px;
  height: calc(100vh - 80px);
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
  z-index: 40;
  overflow-y: auto;
  
  .character-section {
    text-align: center;
    margin-bottom: 24px;
    
    .character-avatar {
      width: 96px;
      height: 96px;
      margin: 0 auto 16px;
      background: ${colors.gradient};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      animation: ${float} 3s infinite;
      box-shadow: 0 0 30px rgba(78, 181, 255, 0.3);
    }
    
    .character-title {
      color: white;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .character-subtitle {
      color: #a0aec0;
      margin-bottom: 8px;
    }
    
    .character-level-badge {
      display: inline-block;
      background: ${colors.gradient};
      padding: 4px 12px;
      border-radius: 16px;
      color: white;
      font-weight: bold;
      font-size: 12px;
    }
  }
  
  .exp-section {
    margin-bottom: 24px;
    
    .exp-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      .level {
        font-size: 18px;
        font-weight: bold;
        color: white;
      }
      
      .exp-text {
        font-size: 14px;
        color: #a0aec0;
      }
    }
    
    .exp-bar {
      width: 100%;
      height: 12px;
      background: #2d3748;
      border-radius: 6px;
      overflow: hidden;
      position: relative;
      
      .exp-fill {
        height: 100%;
        background: ${colors.gradient};
        transition: width 0.5s ease;
        position: relative;
        
        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: ${slideIn} 2s infinite;
        }
      }
    }
  }
  
  .skill-points-card {
    background: rgba(78, 181, 255, 0.1);
    border: 1px solid rgba(78, 181, 255, 0.3);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
      animation: ${slideIn} 3s infinite;
    }
    
    .points-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 1;
      
      .points-label {
        font-weight: bold;
        color: white;
      }
      
      .points-value {
        font-size: 24px;
        font-weight: bold;
        color: ${colors.primary};
        animation: ${pulse} 2s infinite;
      }
    }
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;
    
    .stat-card {
      background: #2d3748;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      }
      
      .stat-value {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 4px;
        
        &.green {
          color: ${colors.secondary};
        }
        
        &.yellow {
          color: ${colors.accent};
        }
        
        &.blue {
          color: ${colors.primary};
        }
        
        &.purple {
          color: ${colors.purple};
        }
      }
      
      .stat-label {
        font-size: 11px;
        color: #a0aec0;
        text-transform: uppercase;
      }
    }
  }
  
  .achievements-preview {
    background: rgba(255, 217, 61, 0.1);
    border: 1px solid rgba(255, 217, 61, 0.3);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
    
    .achievements-title {
      color: ${colors.accent};
      font-weight: bold;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      
      .title-icon {
        font-size: 1.2rem;
      }
    }
    
    .achievements-list {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      
      .achievement-badge {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(255, 217, 61, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        
        &.unlocked {
          background: ${colors.accent};
          animation: ${sparkle} 2s infinite;
        }
        
        &.locked {
          opacity: 0.4;
          filter: grayscale(100%);
        }
      }
    }
  }
  
  .action-buttons {
    margin-bottom: 24px;
    
    .action-button {
      width: 100%;
      padding: 12px;
      border-radius: 8px;
      font-weight: bold;
      margin-bottom: 12px;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s ease;
      }
      
      &:hover::before {
        left: 100%;
      }
      
      &.primary {
        background: ${colors.gradient};
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(78, 181, 255, 0.3);
        }
      }
      
      &.secondary {
        background: #4a5568;
        color: white;
        
        &:hover {
          background: #718096;
        }
      }
      
      &.quest {
        background: rgba(255, 217, 61, 0.2);
        border: 1px solid rgba(255, 217, 61, 0.3);
        color: ${colors.accent};
        
        &:hover {
          background: rgba(255, 217, 61, 0.3);
        }
      }
    }
  }
  
  .cta-section {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 24px;
    
    .cta-button {
      width: 100%;
      padding: 16px;
      background: ${colors.gradient};
      border: none;
      border-radius: 8px;
      color: white;
      font-weight: bold;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 8px;
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        transition: left 0.5s ease;
      }
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(78, 181, 255, 0.4);
      }
      
      &:hover::before {
        left: 100%;
      }
    }
    
    .cta-description {
      text-align: center;
      font-size: 12px;
      color: #a0aec0;
    }
  }
`

const ConnectionsStyled = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
  
  .skill-connection {
    stroke-width: 3;
    stroke-dasharray: 0;
    transition: all 0.5s ease;
    
    &.active {
      stroke: ${colors.secondary};
      filter: drop-shadow(0 0 6px rgba(56, 193, 114, 0.6));
      animation: ${pathDraw} 2s ease-in-out;
    }
    
    &.inactive {
      stroke: #4a5568;
      stroke-dasharray: 5,5;
      opacity: 0.5;
    }
  }
`

const HeaderStyled = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 50;
  
  .header-content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    
    .logo {
      font-size: 24px;
      font-weight: bold;
      
      .logo-text {
        background: ${colors.gradient};
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
    
    .nav-menu {
      display: flex;
      gap: 24px;
      
      .nav-item {
        color: #a0aec0;
        text-decoration: none;
        font-weight: 500;
        transition: all 0.3s ease;
        position: relative;
        
        &:hover {
          color: white;
        }
        
        &.active {
          color: ${colors.primary};
          
          &::after {
            content: '';
            position: absolute;
            bottom: -6px;
            left: 0;
            right: 0;
            height: 2px;
            background: ${colors.primary};
            border-radius: 1px;
          }
        }
      }
    }
    
    .header-controls {
      display: flex;
      gap: 12px;
      align-items: center;
      
      .control-button {
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        color: white;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        &.active {
          background: ${colors.primary};
          border-color: ${colors.primary};
        }
      }
    }
  }
`

const QuestModalStyled = styled(motion.div)`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 360px;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 217, 61, 0.3);
  border-radius: 16px;
  padding: 20px;
  z-index: 60;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  
  .quest-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    
    .quest-icon {
      font-size: 2rem;
      animation: ${float} 2s infinite;
    }
    
    .quest-title {
      color: ${colors.accent};
      font-weight: bold;
      font-size: 16px;
    }
  }
  
  .quest-description {
    color: #cbd5e0;
    font-size: 14px;
    margin-bottom: 16px;
    line-height: 1.5;
  }
  
  .quest-progress {
    margin-bottom: 16px;
    
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #2d3748;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
      
      .progress-fill {
        height: 100%;
        background: ${colors.gradient};
        transition: width 0.5s ease;
      }
    }
    
    .progress-text {
      color: #a0aec0;
      font-size: 12px;
      text-align: center;
    }
  }
  
  .quest-rewards {
    background: rgba(255, 217, 61, 0.1);
    border: 1px solid rgba(255, 217, 61, 0.3);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 16px;
    
    .rewards-title {
      color: ${colors.accent};
      font-weight: bold;
      font-size: 12px;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    
    .rewards-list {
      display: flex;
      gap: 12px;
      
      .reward-item {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #cbd5e0;
        font-size: 12px;
        
        .reward-icon {
          font-size: 14px;
        }
      }
    }
  }
  
  .quest-actions {
    display: flex;
    gap: 8px;
    
    .quest-button {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 6px;
      font-weight: bold;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &.complete {
        background: ${colors.accent};
        color: #0a0a0a;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(255, 217, 61, 0.3);
        }
      }
      
      &.dismiss {
        background: #4a5568;
        color: white;
        
        &:hover {
          background: #718096;
        }
      }
    }
  }
`

// Types
interface Skill {
  id: string
  name: string
  description: string
  maxLevel: number
  currentLevel: number
  requiredLevel: number
  requiredSkills: string[]
  icon: string
  position: { x: number; y: number }
  category: 'ai' | 'dx' | 'business' | 'marketing'
  benefits: string[]
  realWorldApplication: string
  timeToMaster: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  relatedCareers: string[]
}

interface PlayerStats {
  level: number
  exp: number
  expToNext: number
  skillPoints: number
  unlockedSkills: string[]
  achievements: string[]
  totalTimeSpent: number
  questsCompleted: number
  favoriteCategory: 'ai' | 'dx' | 'business' | 'marketing' | null
  streakDays: number
  completionPercentage: number
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  condition: (stats: PlayerStats, skills: Record<string, Skill>) => boolean
  reward: {
    exp?: number
    skillPoints?: number
    title?: string
  }
  unlocked: boolean
  unlockedAt?: Date
}

interface Quest {
  id: string
  title: string
  description: string
  icon: string
  type: 'skill' | 'level' | 'achievement' | 'category'
  target: string | number
  reward: {
    exp: number
    skillPoints?: number
    special?: string
  }
  completed: boolean
  progress: number
  maxProgress: number
}

interface SkillAnalytics {
  totalSkillsLearned: number
  favoriteCategory: string
  timePerCategory: Record<string, number>
  skillMasteryRate: number
  learningEfficiency: number
  recommendedNextSkills: string[]
}

interface SkillTreeState {
  currentView: 'tree' | 'achievements' | 'analytics' | 'quests'
  selectedSkill: string | null
  showTutorial: boolean
  soundEnabled: boolean
  animationsEnabled: boolean
  compactMode: boolean
}

// Zustand Store
interface GameStore {
  playerStats: PlayerStats
  skills: Record<string, Skill>
  achievements: Record<string, Achievement>
  quests: Quest[]
  analytics: SkillAnalytics
  uiState: SkillTreeState
  addExp: (amount: number) => void
  upgradeSkill: (skillId: string) => void
  resetSkills: () => void
  unlockAchievement: (achievementId: string) => void
  completeQuest: (questId: string) => void
  generateNewQuests: () => void
  updateAnalytics: () => void
  setCurrentView: (view: SkillTreeState['currentView']) => void
  toggleSettings: (setting: keyof Pick<SkillTreeState, 'soundEnabled' | 'animationsEnabled' | 'compactMode'>) => void
}

const useGameStore = create<GameStore>((set, get) => ({
  playerStats: {
    level: 1,
    exp: 0,
    expToNext: 100,
    skillPoints: 3,
    unlockedSkills: [],
    achievements: [],
    totalTimeSpent: 0,
    questsCompleted: 0,
    favoriteCategory: null,
    streakDays: 1,
    completionPercentage: 0
  },
  skills: {
    'ai-basics': {
      id: 'ai-basics',
      name: 'AI基礎',
      description: 'AIの基本概念とChatGPTの活用法を学ぶ',
      maxLevel: 5,
      currentLevel: 0,
      requiredLevel: 1,
      requiredSkills: [],
      icon: '🤖',
      position: { x: 50, y: 20 },
      category: 'ai',
      benefits: ['効率的なAI活用', '基礎知識の習得', '実践的スキル'],
      realWorldApplication: 'ChatGPTを使った業務効率化、文章作成、アイデア発想',
      timeToMaster: '1-2週間',
      difficulty: 'beginner',
      relatedCareers: ['AIコンサルタント', 'デジタルマーケター', 'プロダクトマネージャー']
    },
    'prompt-engineering': {
      id: 'prompt-engineering',
      name: 'プロンプトエンジニアリング',
      description: '効果的なプロンプトの作成技術をマスター',
      maxLevel: 5,
      currentLevel: 0,
      requiredLevel: 2,
      requiredSkills: ['ai-basics'],
      icon: '💬',
      position: { x: 30, y: 35 },
      category: 'ai',
      benefits: ['高品質なAI出力', 'コミュニケーション向上', '問題解決力'],
      realWorldApplication: '複雑なタスクのAI指示、クリエイティブ制作、技術文書作成',
      timeToMaster: '2-3週間',
      difficulty: 'intermediate',
      relatedCareers: ['AIエンジニア', 'コンテンツクリエイター', 'システムアナリスト']
    },
    'ai-automation': {
      id: 'ai-automation',
      name: 'AI自動化',
      description: 'AIを使った業務自動化システムの構築',
      maxLevel: 5,
      currentLevel: 0,
      requiredLevel: 3,
      requiredSkills: ['prompt-engineering'],
      icon: '⚡',
      position: { x: 20, y: 50 },
      category: 'ai',
      benefits: ['業務効率化', '時間節約', 'スケーラビリティ'],
      realWorldApplication: '顧客対応、データ分析、レポート生成の自動化',
      timeToMaster: '3-4週間',
      difficulty: 'advanced',
      relatedCareers: ['オートメーションエンジニア', 'ビジネスアナリスト', 'ITコンサルタント']
    },
    'nocode-basics': {
      id: 'nocode-basics',
      name: 'ノーコード基礎',
      description: 'Bubble, Zapierなどの基本操作',
      maxLevel: 5,
      currentLevel: 0,
      requiredLevel: 1,
      requiredSkills: [],
      icon: '🔧',
      position: { x: 70, y: 35 },
      category: 'dx',
      benefits: ['迅速な開発', 'コスト削減', '技術的制約の解放'],
      realWorldApplication: 'ワークフロー自動化、簡単なアプリ開発、データ連携',
      timeToMaster: '1-2週間',
      difficulty: 'beginner',
      relatedCareers: ['ノーコード開発者', 'プロセス改善担当', 'デジタル担当者']
    },
    'app-development': {
      id: 'app-development',
      name: 'アプリ開発',
      description: 'ノーコードでWebアプリを開発',
      maxLevel: 5,
      currentLevel: 0,
      requiredLevel: 3,
      requiredSkills: ['nocode-basics'],
      icon: '📱',
      position: { x: 80, y: 50 },
      category: 'dx',
      benefits: ['製品開発力', 'ユーザー体験設計', 'テクニカルスキル'],
      realWorldApplication: 'MVPアプリ開発、社内ツール作成、顧客向けプラットフォーム',
      timeToMaster: '4-6週間',
      difficulty: 'intermediate',
      relatedCareers: ['プロダクトマネージャー', 'アプリ開発者', 'UX/UIデザイナー']
    },
    'business-model': {
      id: 'business-model',
      name: 'ビジネスモデル設計',
      description: '収益性の高いビジネスモデルを構築',
      maxLevel: 5,
      currentLevel: 0,
      requiredLevel: 2,
      requiredSkills: [],
      icon: '💼',
      position: { x: 50, y: 50 },
      category: 'business',
      benefits: ['収益性向上', '戦略的思考', '市場理解'],
      realWorldApplication: 'サブスクリプション、フリーミアム、マーケットプレイス設計',
      timeToMaster: '2-3週間',
      difficulty: 'intermediate',
      relatedCareers: ['起業家', 'ビジネス戦略担当', 'コンサルタント']
    },
    'digital-marketing': {
      id: 'digital-marketing',
      name: 'デジタルマーケティング',
      description: 'SNSとWeb広告の効果的な活用',
      maxLevel: 5,
      currentLevel: 0,
      requiredLevel: 2,
      requiredSkills: [],
      icon: '📈',
      position: { x: 30, y: 65 },
      category: 'marketing',
      benefits: ['顧客獲得', 'ブランド構築', 'データ分析'],
      realWorldApplication: 'Facebook広告、Google広告、SNSマーケティング',
      timeToMaster: '3-4週間',
      difficulty: 'intermediate',
      relatedCareers: ['デジタルマーケター', 'SNS運用担当', 'グロースハッカー']
    },
    'sales-automation': {
      id: 'sales-automation',
      name: 'セールス自動化',
      description: 'AIを活用した営業プロセスの自動化',
      maxLevel: 5,
      currentLevel: 0,
      requiredLevel: 4,
      requiredSkills: ['ai-automation', 'digital-marketing'],
      icon: '🎯',
      position: { x: 50, y: 80 },
      category: 'business',
      benefits: ['売上向上', '営業効率化', '顧客満足度向上'],
      realWorldApplication: 'CRM自動化、リード育成、パーソナライズド営業',
      timeToMaster: '4-6週間',
      difficulty: 'advanced',
      relatedCareers: ['セールスエンジニア', 'CRMスペシャリスト', '営業マネージャー']
    }
  },
  achievements: {
    'first-skill': {
      id: 'first-skill',
      name: '最初の一歩',
      description: '初めてのスキルを習得する',
      icon: '🌟',
      condition: (stats) => stats.unlockedSkills.length >= 1,
      reward: { exp: 50, skillPoints: 1 },
      unlocked: false
    },
    'ai-specialist': {
      id: 'ai-specialist',
      name: 'AIスペシャリスト',
      description: 'AIカテゴリのスキルを3つ習得する',
      icon: '🤖',
      condition: (stats, skills) => {
        const aiSkills = Object.values(skills).filter(s => s.category === 'ai' && s.currentLevel > 0)
        return aiSkills.length >= 3
      },
      reward: { exp: 200, skillPoints: 2, title: 'AIマスター' },
      unlocked: false
    },
    'level-master': {
      id: 'level-master',
      name: 'レベルマスター',
      description: 'レベル10に到達する',
      icon: '⭐',
      condition: (stats) => stats.level >= 10,
      reward: { exp: 500, skillPoints: 5 },
      unlocked: false
    },
    'perfectionist': {
      id: 'perfectionist',
      name: '完璧主義者',
      description: 'スキルを1つマスターレベルまで上げる',
      icon: '💎',
      condition: (stats, skills) => Object.values(skills).some(s => s.currentLevel === s.maxLevel),
      reward: { exp: 300, skillPoints: 3 },
      unlocked: false
    },
    'well-rounded': {
      id: 'well-rounded',
      name: 'バランス型',
      description: '全カテゴリのスキルを1つずつ習得する',
      icon: '⚖️',
      condition: (stats, skills) => {
        const categories = ['ai', 'dx', 'business', 'marketing']
        return categories.every(cat => 
          Object.values(skills).some(s => s.category === cat && s.currentLevel > 0)
        )
      },
      reward: { exp: 400, skillPoints: 4 },
      unlocked: false
    },
    'speedrun': {
      id: 'speedrun',
      name: 'スピードランナー',
      description: '1日で5つのスキルを習得する',
      icon: '🏃',
      condition: (stats) => stats.questsCompleted >= 5,
      reward: { exp: 250, skillPoints: 2 },
      unlocked: false
    }
  },
  quests: [
    {
      id: 'first-ai-skill',
      title: 'AI入門クエスト',
      description: 'AI基礎スキルをレベル1まで上げよう',
      icon: '🎯',
      type: 'skill',
      target: 'ai-basics',
      reward: { exp: 100, skillPoints: 1 },
      completed: false,
      progress: 0,
      maxProgress: 1
    },
    {
      id: 'reach-level-3',
      title: 'レベルアップクエスト',
      description: 'プレイヤーレベルを3まで上げよう',
      icon: '📈',
      type: 'level',
      target: 3,
      reward: { exp: 150, skillPoints: 2 },
      completed: false,
      progress: 1,
      maxProgress: 3
    }
  ],
  analytics: {
    totalSkillsLearned: 0,
    favoriteCategory: 'ai',
    timePerCategory: { ai: 0, dx: 0, business: 0, marketing: 0 },
    skillMasteryRate: 0,
    learningEfficiency: 85,
    recommendedNextSkills: ['ai-basics', 'nocode-basics']
  },
  uiState: {
    currentView: 'tree',
    selectedSkill: null,
    showTutorial: true,
    soundEnabled: true,
    animationsEnabled: true,
    compactMode: false
  },
  addExp: (amount) => set((state) => {
    let newExp = state.playerStats.exp + amount
    let newLevel = state.playerStats.level
    let newSkillPoints = state.playerStats.skillPoints
    let expToNext = state.playerStats.expToNext
    const leveledUp = []
    
    while (newExp >= expToNext) {
      newExp -= expToNext
      newLevel++
      newSkillPoints += 2
      expToNext = newLevel * 100
      leveledUp.push(newLevel)
    }
    
    const totalSkills = Object.values(state.skills).length
    const learnedSkills = Object.values(state.skills).filter(s => s.currentLevel > 0).length
    const completionPercentage = (learnedSkills / totalSkills) * 100
    
    return {
      playerStats: {
        ...state.playerStats,
        exp: newExp,
        level: newLevel,
        skillPoints: newSkillPoints,
        expToNext,
        completionPercentage,
        totalTimeSpent: state.playerStats.totalTimeSpent + 30
      }
    }
  }),
  upgradeSkill: (skillId) => set((state) => {
    const skill = state.skills[skillId]
    if (!skill || state.playerStats.skillPoints <= 0) return state
    
    // Check requirements
    if (skill.currentLevel >= skill.maxLevel) return state
    if (state.playerStats.level < skill.requiredLevel) return state
    if (skill.requiredSkills.some(reqId => state.skills[reqId].currentLevel === 0)) return state
    
    const wasFirstTime = skill.currentLevel === 0
    const newSkillLevel = skill.currentLevel + 1
    const updatedUnlockedSkills = wasFirstTime 
      ? [...state.playerStats.unlockedSkills, skillId]
      : state.playerStats.unlockedSkills
    
    // Update analytics
    const categoryTime = { ...state.analytics.timePerCategory }
    categoryTime[skill.category] += 60 // Add 1 hour of learning time
    
    const totalSkills = Object.values(state.skills).length
    const learnedSkills = wasFirstTime 
      ? state.analytics.totalSkillsLearned + 1
      : state.analytics.totalSkillsLearned
    
    return {
      skills: {
        ...state.skills,
        [skillId]: {
          ...skill,
          currentLevel: newSkillLevel
        }
      },
      playerStats: {
        ...state.playerStats,
        skillPoints: state.playerStats.skillPoints - 1,
        unlockedSkills: updatedUnlockedSkills,
        completionPercentage: (learnedSkills / totalSkills) * 100
      },
      analytics: {
        ...state.analytics,
        totalSkillsLearned: learnedSkills,
        timePerCategory: categoryTime,
        skillMasteryRate: (Object.values({...state.skills, [skillId]: {...skill, currentLevel: newSkillLevel}}).filter(s => s.currentLevel === s.maxLevel).length / totalSkills) * 100
      }
    }
  }),
  resetSkills: () => set((state) => {
    const totalSkillsUsed = Object.values(state.skills).reduce((sum, skill) => sum + skill.currentLevel, 0)
    const resetSkills = Object.entries(state.skills).reduce((acc, [id, skill]) => ({
      ...acc,
      [id]: { ...skill, currentLevel: 0 }
    }), {})
    
    return {
      skills: resetSkills,
      playerStats: {
        ...state.playerStats,
        skillPoints: state.playerStats.skillPoints + totalSkillsUsed,
        unlockedSkills: [],
        completionPercentage: 0
      },
      analytics: {
        ...state.analytics,
        totalSkillsLearned: 0,
        timePerCategory: { ai: 0, dx: 0, business: 0, marketing: 0 },
        skillMasteryRate: 0
      }
    }
  }),
  unlockAchievement: (achievementId) => set((state) => {
    const achievement = state.achievements[achievementId]
    if (!achievement || achievement.unlocked) return state
    
    return {
      achievements: {
        ...state.achievements,
        [achievementId]: {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date()
        }
      },
      playerStats: {
        ...state.playerStats,
        achievements: [...state.playerStats.achievements, achievementId]
      }
    }
  }),
  completeQuest: (questId) => set((state) => {
    const questIndex = state.quests.findIndex(q => q.id === questId)
    if (questIndex === -1) return state
    
    const quest = state.quests[questIndex]
    const updatedQuests = [...state.quests]
    updatedQuests[questIndex] = { ...quest, completed: true, progress: quest.maxProgress }
    
    return {
      quests: updatedQuests,
      playerStats: {
        ...state.playerStats,
        questsCompleted: state.playerStats.questsCompleted + 1
      }
    }
  }),
  generateNewQuests: () => set((state) => {
    const newQuests = [
      {
        id: `daily-${Date.now()}`,
        title: 'デイリーチャレンジ',
        description: 'スキルを2つレベルアップしよう',
        icon: '📅',
        type: 'skill' as const,
        target: 'any',
        reward: { exp: 100, skillPoints: 1 },
        completed: false,
        progress: 0,
        maxProgress: 2
      }
    ]
    
    return {
      quests: [...state.quests.filter(q => !q.completed), ...newQuests]
    }
  }),
  updateAnalytics: () => set((state) => {
    const totalSkills = Object.values(state.skills).length
    const learnedSkills = Object.values(state.skills).filter(s => s.currentLevel > 0).length
    const masteredSkills = Object.values(state.skills).filter(s => s.currentLevel === s.maxLevel).length
    
    // Calculate favorite category
    const categoryStats = { ai: 0, dx: 0, business: 0, marketing: 0 }
    Object.values(state.skills).forEach(skill => {
      if (skill.currentLevel > 0) {
        categoryStats[skill.category] += skill.currentLevel
      }
    })
    
    const favoriteCategory = Object.entries(categoryStats).reduce((a, b) => 
      categoryStats[a[0] as keyof typeof categoryStats] > categoryStats[b[0] as keyof typeof categoryStats] ? a : b
    )[0] as keyof typeof categoryStats
    
    // Generate recommendations
    const unlockedSkills = Object.values(state.skills).filter(s => s.currentLevel > 0).map(s => s.id)
    const availableSkills = Object.values(state.skills).filter(s => {
      if (s.currentLevel > 0) return false
      if (state.playerStats.level < s.requiredLevel) return false
      if (s.requiredSkills.some(reqId => state.skills[reqId].currentLevel === 0)) return false
      return true
    })
    
    const recommendedNextSkills = availableSkills.slice(0, 3).map(s => s.id)
    
    return {
      analytics: {
        totalSkillsLearned: learnedSkills,
        favoriteCategory,
        timePerCategory: state.analytics.timePerCategory,
        skillMasteryRate: (masteredSkills / totalSkills) * 100,
        learningEfficiency: Math.min(95, 70 + (learnedSkills * 2)),
        recommendedNextSkills
      }
    }
  }),
  setCurrentView: (view) => set((state) => ({
    uiState: { ...state.uiState, currentView: view }
  })),
  toggleSettings: (setting) => set((state) => ({
    uiState: { ...state.uiState, [setting]: !state.uiState[setting] }
  }))
}))

// Components
function SkillNode({ skill }: { skill: Skill }) {
  const { playerStats, upgradeSkill, uiState } = useGameStore()
  const [showTooltip, setShowTooltip] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  
  const canUpgrade = useMemo(() => {
    if (playerStats.skillPoints <= 0) return false
    if (skill.currentLevel >= skill.maxLevel) return false
    if (playerStats.level < skill.requiredLevel) return false
    if (skill.requiredSkills.some(reqId => {
      const reqSkill = useGameStore.getState().skills[reqId]
      return reqSkill.currentLevel === 0
    })) return false
    return true
  }, [playerStats, skill])
  
  const isUnlocked = skill.currentLevel > 0
  const isMaxed = skill.currentLevel === skill.maxLevel
  
  const handleUpgrade = useCallback(() => {
    if (!canUpgrade) return
    setIsAnimating(true)
    upgradeSkill(skill.id)
    setTimeout(() => setIsAnimating(false), 500)
  }, [canUpgrade, skill.id, upgradeSkill])
  
  const getSkillClass = () => {
    if (isMaxed) return 'maxed'
    if (isUnlocked) return 'unlocked'
    if (canUpgrade) return 'can-upgrade'
    return 'locked'
  }
  
  const progressPercentage = (skill.currentLevel / skill.maxLevel) * 100
  
  return (
    <SkillNodeStyled
      style={{ left: `${skill.position.x}%`, top: `${skill.position.y}%` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isAnimating ? [1, 1.2, 1] : 1, 
        opacity: 1 
      }}
      transition={{ 
        delay: skill.position.y * 0.01,
        duration: isAnimating ? 0.5 : 0.3
      }}
    >
      <motion.div
        className={`skill-button ${getSkillClass()}`}
        whileHover={canUpgrade ? { scale: 1.1 } : {}}
        whileTap={canUpgrade ? { scale: 0.95 } : {}}
        onClick={handleUpgrade}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="skill-icon">{skill.icon}</span>
        
        {/* Skill Particles for unlocked skills */}
        {isUnlocked && uiState.animationsEnabled && (
          <div className="skill-particles">
            <div className="particle" />
            <div className="particle" />
            <div className="particle" />
            <div className="particle" />
          </div>
        )}
        
        {/* Level Indicator Dots */}
        <div className="level-dots">
          {Array.from({ length: skill.maxLevel }).map((_, i) => (
            <div
              key={i}
              className={`dot ${i < skill.currentLevel ? 'filled' : 'empty'}`}
            />
          ))}
        </div>
        
        {/* Skill Points Cost */}
        {canUpgrade && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="skill-cost"
          >
            1
          </motion.div>
        )}
      </motion.div>
      
      {/* Enhanced Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <TooltipStyled
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="tooltip-header">
              <span className="tooltip-icon">{skill.icon}</span>
              <h4 className="tooltip-title">{skill.name}</h4>
            </div>
            
            <p className="tooltip-description">{skill.description}</p>
            
            <div className="tooltip-benefits">
              <div className="benefits-title">主なメリット</div>
              <div className="benefits-list">
                {skill.benefits.map((benefit, index) => (
                  <span key={index} className="benefit-tag">{benefit}</span>
                ))}
              </div>
            </div>
            
            <div className="tooltip-application">
              <div className="application-title">実際の活用例</div>
              <div className="application-text">{skill.realWorldApplication}</div>
            </div>
            
            <div className="tooltip-stats">
              <p>
                <span>現在レベル:</span>
                <span className="stat-value">{skill.currentLevel}/{skill.maxLevel}</span>
              </p>
              <p>
                <span>必要レベル:</span>
                <span className="stat-value">{skill.requiredLevel}</span>
              </p>
              <p>
                <span>習得期間:</span>
                <span className="stat-value">{skill.timeToMaster}</span>
              </p>
              <p>
                <span>難易度:</span>
                <span className="stat-value">{skill.difficulty}</span>
              </p>
              {skill.requiredSkills.length > 0 && (
                <p>
                  <span>前提スキル:</span>
                  <span className="stat-value">{skill.requiredSkills.join(', ')}</span>
                </p>
              )}
            </div>
            
            <div className="tooltip-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="progress-text">
                進捗: {progressPercentage.toFixed(0)}%
              </div>
            </div>
            
            <div className={`tooltip-category ${skill.category}`}>
              {skill.category.toUpperCase()}
            </div>
          </TooltipStyled>
        )}
      </AnimatePresence>
    </SkillNodeStyled>
  )
}

function SkillConnections() {
  const skills = useGameStore(state => state.skills)
  const uiState = useGameStore(state => state.uiState)
  
  if (!uiState.animationsEnabled) return null
  
  return (
    <ConnectionsStyled>
      {Object.values(skills).map(skill => 
        skill.requiredSkills.map(reqId => {
          const reqSkill = skills[reqId]
          if (!reqSkill) return null
          
          const isActive = skill.currentLevel > 0 && reqSkill.currentLevel > 0
          
          return (
            <motion.line
              key={`${reqId}-${skill.id}`}
              className={`skill-connection ${isActive ? 'active' : 'inactive'}`}
              x1={`${reqSkill.position.x}%`}
              y1={`${reqSkill.position.y + 4}%`}
              x2={`${skill.position.x}%`}
              y2={`${skill.position.y + 4}%`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1, 
                opacity: isActive ? 1 : 0.5 
              }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          )
        })
      )}
    </ConnectionsStyled>
  )
}

function PlayerStatus() {
  const { playerStats, achievements, addExp, resetSkills, generateNewQuests } = useGameStore()
  const expPercentage = (playerStats.exp / playerStats.expToNext) * 100
  
  const unlockedAchievements = Object.values(achievements).filter(a => a.unlocked)
  const totalAchievements = Object.values(achievements).length
  
  return (
    <PlayerStatusStyled
      initial={{ x: -340 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Character Section */}
      <div className="character-section">
        <div className="character-avatar">
          👨‍💻
        </div>
        <h3 className="character-title">起業家見習い</h3>
        <p className="character-subtitle">AIDXschool 受講生</p>
        <div className="character-level-badge">
          Lv.{playerStats.level}
        </div>
      </div>
      
      {/* EXP Section */}
      <div className="exp-section">
        <div className="exp-info">
          <span className="level">レベル {playerStats.level}</span>
          <span className="exp-text">{playerStats.exp}/{playerStats.expToNext} EXP</span>
        </div>
        <div className="exp-bar">
          <motion.div
            className="exp-fill"
            initial={{ width: 0 }}
            animate={{ width: `${expPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      
      {/* Skill Points */}
      <div className="skill-points-card">
        <div className="points-info">
          <span className="points-label">スキルポイント</span>
          <span className="points-value">{playerStats.skillPoints}</span>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value green">
            {playerStats.unlockedSkills.length}
          </div>
          <div className="stat-label">解放済み</div>
        </div>
        <div className="stat-card">
          <div className="stat-value yellow">
            {Object.values(useGameStore.getState().skills).filter(s => s.currentLevel === s.maxLevel).length}
          </div>
          <div className="stat-label">マスター</div>
        </div>
        <div className="stat-card">
          <div className="stat-value blue">
            {playerStats.streakDays}
          </div>
          <div className="stat-label">連続日数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value purple">
            {Math.round(playerStats.completionPercentage)}%
          </div>
          <div className="stat-label">完了率</div>
        </div>
      </div>
      
      {/* Achievements Preview */}
      <div className="achievements-preview">
        <div className="achievements-title">
          <span className="title-icon">🏆</span>
          実績 ({unlockedAchievements.length}/{totalAchievements})
        </div>
        <div className="achievements-list">
          {Object.values(achievements).slice(0, 6).map(achievement => (
            <div 
              key={achievement.id}
              className={`achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'}`}
              title={achievement.name}
            >
              {achievement.icon}
            </div>
          ))}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="action-buttons">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => addExp(50)}
          className="action-button primary"
        >
          レッスン完了 (+50 EXP)
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateNewQuests}
          className="action-button quest"
        >
          新しいクエスト
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={resetSkills}
          className="action-button secondary"
        >
          スキルリセット
        </motion.button>
      </div>
      
      {/* CTA Section */}
      <div className="cta-section">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="cta-button"
        >
          実際に学習を始める
        </motion.button>
        <p className="cta-description">
          無料相談で詳しいカリキュラムをご案内
        </p>
      </div>
    </PlayerStatusStyled>
  )
}

function QuestNotification() {
  const { quests, completeQuest, addExp } = useGameStore()
  const [currentQuestIndex, setCurrentQuestIndex] = useState(0)
  const [showQuest, setShowQuest] = useState(false)
  
  const activeQuests = quests.filter(q => !q.completed)
  const currentQuest = activeQuests[currentQuestIndex]
  
  useEffect(() => {
    if (activeQuests.length > 0) {
      const timer = setTimeout(() => setShowQuest(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [activeQuests.length])
  
  const handleCompleteQuest = () => {
    if (currentQuest) {
      completeQuest(currentQuest.id)
      addExp(currentQuest.reward.exp)
      if (currentQuest.reward.skillPoints) {
        // Add skill points logic here if needed
      }
      setShowQuest(false)
    }
  }
  
  const handleDismiss = () => {
    setShowQuest(false)
  }
  
  const progressPercentage = currentQuest 
    ? (currentQuest.progress / currentQuest.maxProgress) * 100 
    : 0
  
  if (!currentQuest) return null
  
  return (
    <AnimatePresence>
      {showQuest && (
        <QuestModalStyled
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="quest-header">
            <div className="quest-icon">{currentQuest.icon}</div>
            <h4 className="quest-title">{currentQuest.title}</h4>
          </div>
          
          <p className="quest-description">
            {currentQuest.description}
          </p>
          
          <div className="quest-progress">
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="progress-text">
              進捗: {currentQuest.progress}/{currentQuest.maxProgress}
            </div>
          </div>
          
          <div className="quest-rewards">
            <div className="rewards-title">報酬</div>
            <div className="rewards-list">
              <div className="reward-item">
                <span className="reward-icon">⭐</span>
                <span>{currentQuest.reward.exp} EXP</span>
              </div>
              {currentQuest.reward.skillPoints && (
                <div className="reward-item">
                  <span className="reward-icon">🔮</span>
                  <span>{currentQuest.reward.skillPoints} SP</span>
                </div>
              )}
              {currentQuest.reward.special && (
                <div className="reward-item">
                  <span className="reward-icon">🎁</span>
                  <span>{currentQuest.reward.special}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="quest-actions">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCompleteQuest}
              className="quest-button complete"
            >
              達成！
            </motion.button>
            <button
              onClick={handleDismiss}
              className="quest-button dismiss"
            >
              後で
            </button>
          </div>
        </QuestModalStyled>
      )}
    </AnimatePresence>
  )
}

function Header() {
  const { uiState, setCurrentView, toggleSettings } = useGameStore()
  
  return (
    <HeaderStyled>
      <div className="header-content">
        <div className="logo">
          <span className="logo-text">AIDXschool</span> スキルツリー
        </div>
        
        <nav className="nav-menu">
          <a 
            href="#" 
            className={`nav-item ${uiState.currentView === 'tree' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              setCurrentView('tree')
            }}
          >
            スキルツリー
          </a>
          <a 
            href="#" 
            className={`nav-item ${uiState.currentView === 'achievements' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              setCurrentView('achievements')
            }}
          >
            実績
          </a>
          <a 
            href="#" 
            className={`nav-item ${uiState.currentView === 'analytics' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              setCurrentView('analytics')
            }}
          >
            分析
          </a>
          <a 
            href="#" 
            className={`nav-item ${uiState.currentView === 'quests' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              setCurrentView('quests')
            }}
          >
            クエスト
          </a>
        </nav>
        
        <div className="header-controls">
          <button 
            className={`control-button ${uiState.soundEnabled ? 'active' : ''}`}
            onClick={() => toggleSettings('soundEnabled')}
          >
            🔊
          </button>
          <button 
            className={`control-button ${uiState.animationsEnabled ? 'active' : ''}`}
            onClick={() => toggleSettings('animationsEnabled')}
          >
            ✨
          </button>
          <button 
            className={`control-button ${uiState.compactMode ? 'active' : ''}`}
            onClick={() => toggleSettings('compactMode')}
          >
            📱
          </button>
        </div>
      </div>
    </HeaderStyled>
  )
}

// Main Component
export default function LP2_RPGSkillTreeExpanded() {
  const { skills, uiState } = useGameStore()
  
  useEffect(() => {
    // Initialize tutorial or other setup logic
    if (uiState.showTutorial) {
      // Could show tutorial modal here
    }
  }, [uiState.showTutorial])
  
  return (
    <Container>
      <Header />
      
      <div className="main-layout" style={{ display: 'flex' }}>
        <PlayerStatus />
        
        <main style={{ 
          flex: 1, 
          marginLeft: '340px', 
          marginTop: '80px',
          padding: '24px',
          minHeight: 'calc(100vh - 80px)'
        }}>
          {uiState.currentView === 'tree' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{ 
                position: 'relative', 
                minHeight: '900px', 
                maxWidth: '1200px', 
                margin: '0 auto' 
              }}
            >
              <SkillConnections />
              {Object.values(skills).map(skill => (
                <SkillNode key={skill.id} skill={skill} />
              ))}
              
              {/* Legend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'rgba(26, 26, 46, 0.9)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
              >
                <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 'bold' }}>
                  カテゴリ
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      background: colors.primary, 
                      borderRadius: '50%' 
                    }} />
                    <span>AI スキル</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      background: colors.purple, 
                      borderRadius: '50%' 
                    }} />
                    <span>DX スキル</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      background: colors.secondary, 
                      borderRadius: '50%' 
                    }} />
                    <span>ビジネススキル</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      background: colors.pink, 
                      borderRadius: '50%' 
                    }} />
                    <span>マーケティング</span>
                  </div>
                </div>
              </motion.div>
              
              {/* Instructions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  textAlign: 'center',
                  color: '#a0aec0'
                }}
              >
                <p style={{ marginBottom: '8px', fontSize: '14px' }}>
                  スキルポイントを使って起業に必要な能力を習得しよう
                </p>
                <p style={{ fontSize: '12px', opacity: 0.7 }}>
                  クリックでスキルをアップグレード • ホバーで詳細表示
                </p>
              </motion.div>
            </motion.div>
          )}
        </main>
      </div>
      
      <QuestNotification />
    </Container>
  )
}