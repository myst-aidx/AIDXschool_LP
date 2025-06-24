# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a landing page project for an AI×ノーコード (AI & No-Code) automation business course. The project consists of static HTML files with embedded CSS and JavaScript.

## Project Structure

- `ai-biz-freemium-lp.html` - Main landing page promoting AI and no-code automation services
- `lp-visual-assets.html` - Visual assets and design components collection page

## Key Features

The landing page includes:
- LINE integration for user registration
- Google Tag Manager and Twitter Pixel tracking
- Structured data for SEO
- Open Graph and Twitter Card meta tags
- Mobile-responsive design with floating CTAs
- CSS custom properties for consistent theming

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
- LINE registration URL: `https://lin.ee/abc123` (placeholder in current code)
- GTM Container ID: `GTM-XXXX` (placeholder)
- Twitter Pixel ID: `o12345` (placeholder)

## Important Considerations

1. This is a static HTML project with no build process or package management
2. All styles and scripts are embedded within the HTML files
3. Tracking codes and LINE URLs appear to be placeholders and need to be replaced with actual values for production
4. The project is optimized for Japanese language content (lang="ja")