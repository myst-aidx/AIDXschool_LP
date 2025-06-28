# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a landing page project for AIDXschool, an online entrepreneurship school that teaches students how to launch small businesses using AI and DX (Digital Transformation) technologies. AIDXschool focuses on AI×ノーコード (AI & No-Code) automation to help entrepreneurs build and scale their businesses efficiently.

### About AIDXschool
- **Purpose**: Online entrepreneurship school (起業塾) for small business creation
- **Focus**: Teaching AI and no-code automation tools for business efficiency
- **Target**: Aspiring entrepreneurs, small business owners, freelancers
- **Goal**: Help students launch and scale businesses using AI/DX technologies

The project consists of multiple landing page variations (V1-V8) designed to acquire new students for the school, each with different psychological approaches and target personas.

## Project Structure

### Landing Pages (Student Acquisition)
- `ai-biz-freemium-lp.html` - V1: Traditional information-based LP
- `ai-biz-freemium-lp-v2.html` - V2: Visually enhanced version
- `ai-biz-freemium-lp-v3.html` - V3: Complete version with all visual assets
- `ai-biz-freemium-lp-v4.html` - V4: Interactive diagnostic LP
- `ai-biz-freemium-lp-v4-improved.html` - V4 improved: Compact layout version
- `ai-biz-freemium-lp-v5.html` - V5: Storytelling immersive LP
- `ai-biz-freemium-lp-v6.html` - V6: Empathy-driven storytelling LP
- `ai-biz-freemium-lp-v7.html` - V7: Real-time success experience LP
- `ai-biz-freemium-lp-v8.html` - V8: Forbidden automation LP (reverse psychology)

### Utility Pages
- `lp-visual-assets.html` - Visual assets and design components collection
- `visual-dashboard.html` - Dashboard to view all project assets
- `company.html` - Company information page
- `privacy-policy.html` - Privacy policy
- `terms.html` - Terms of service

### Documentation
- `LP-Strategy-Documentation.md` - Comprehensive LP strategy documentation
- `LP-V6-Strategy.md` - Detailed V6 strategy
- `LP-V7-Strategy.md` - Detailed V7 strategy
- `LP-V8-Strategy.md` - Detailed V8 strategy

## Key Features

### Core Functionality
- Student enrollment system for AIDXschool
- Multiple conversion points (free consultation, guide downloads, LINE registration)
- Various psychological approaches to attract different entrepreneur personas
- Interactive elements (diagnostic tools, live demos, AI chat)

### Technical Features
- LINE integration for user registration and nurturing
- Google Tag Manager and Twitter Pixel tracking
- Structured data for SEO
- Open Graph and Twitter Card meta tags
- Mobile-responsive design with floating CTAs
- CSS custom properties for consistent theming
- Real-time updates and counters (V7)
- Gamification elements (V4, V8)
- AI chatbot integration (V7)

## Development Notes

### CSS Variables
The project uses CSS custom properties defined in `:root`:
- Primary colors: `--primary-blue: #4EB5FF`, `--primary-green: #38C172`
- Accent colors: `--accent-red: #FF6B6B`, `--accent-yellow: #FFD93D`
- Text colors: `--text-dark: #1a202c`, `--text-gray: #4a5568`
- Background and shadow utilities

### External Dependencies
- Google Fonts: Noto Sans JP
- Google Tag Manager
- Twitter Pixel tracking

### Key Integration Points
- LINE registration URL: `https://lin.ee/abc123` (placeholder - needs actual AIDXschool LINE account)
- GTM Container ID: `GTM-XXXX` (placeholder - needs AIDXschool GTM container)
- Twitter Pixel ID: `o12345` (placeholder - needs AIDXschool pixel)
- Student enrollment system (to be integrated with AIDXschool backend)
- Payment processing for course fees (to be integrated)
- LMS (Learning Management System) connection (to be integrated)

## Important Considerations

1. This is a static HTML project with no build process or package management
2. All styles and scripts are embedded within the HTML files
3. Tracking codes and LINE URLs appear to be placeholders and need to be replaced with actual AIDXschool values for production
4. The project is optimized for Japanese language content (lang="ja")
5. Each LP version targets different entrepreneur personas and uses different psychological approaches
6. The goal is student acquisition for the AIDXschool entrepreneurship program
7. Conversion metrics should track enrollment in the school, not just lead generation

## Target Audience

### Primary Personas
1. **Traditional Business Owners** (35-50 years) - V1, V2, V3
2. **Aspiring Entrepreneurs** (30-45 years) - V4, V6
3. **Creative Professionals** (35-50 years) - V5
4. **Young Freelancers** (20-30 years) - V7
5. **Challenge-Seeking Innovators** (25-45 years) - V8

### Common Pain Points
- Time-consuming manual tasks
- Lack of technical skills
- Limited resources for scaling
- Need for business automation
- Desire to launch AI-powered businesses