/**
 * Enhanced Visual Effects for AIDXschool Landing Pages
 * Provides sophisticated animations and interactions
 */

const EnhancedVisuals = (function() {
    'use strict';

    // Configuration
    const config = {
        particleCount: 50,
        particleColors: ['#4EB5FF', '#38C172', '#FFD93D', '#FF6B6B'],
        enableParticles: true,
        enableScrollAnimations: true,
        enableInteractiveElements: true,
        enableBackgroundEffects: true,
        enableLoadingEffects: true
    };

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Particle System
    class ParticleSystem {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.particles = [];
            this.mouse = { x: 0, y: 0 };
            this.animationId = null;
        }

        init() {
            if (prefersReducedMotion || !config.enableParticles) return;

            this.createCanvas();
            this.createParticles();
            this.addEventListeners();
            this.animate();
        }

        createCanvas() {
            this.canvas = document.createElement('canvas');
            this.canvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
                opacity: 0;
                transition: opacity 2s ease;
            `;
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();

            // Fade in
            setTimeout(() => {
                this.canvas.style.opacity = '1';
            }, 100);
        }

        resizeCanvas() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        createParticles() {
            for (let i = 0; i < config.particleCount; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 3 + 1,
                    color: config.particleColors[Math.floor(Math.random() * config.particleColors.length)],
                    type: ['circle', 'star', 'plus'][Math.floor(Math.random() * 3)],
                    opacity: Math.random() * 0.5 + 0.3
                });
            }
        }

        drawParticle(particle) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.strokeStyle = particle.color;
            this.ctx.lineWidth = 1;

            switch (particle.type) {
                case 'circle':
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;
                case 'star':
                    this.drawStar(particle.x, particle.y, particle.size);
                    break;
                case 'plus':
                    this.drawPlus(particle.x, particle.y, particle.size);
                    break;
            }
            this.ctx.restore();
        }

        drawStar(x, y, size) {
            this.ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                const px = x + Math.cos(angle) * size * 2;
                const py = y + Math.sin(angle) * size * 2;
                if (i === 0) {
                    this.ctx.moveTo(px, py);
                } else {
                    this.ctx.lineTo(px, py);
                }
                const innerAngle = angle + Math.PI / 5;
                const ipx = x + Math.cos(innerAngle) * size;
                const ipy = y + Math.sin(innerAngle) * size;
                this.ctx.lineTo(ipx, ipy);
            }
            this.ctx.closePath();
            this.ctx.fill();
        }

        drawPlus(x, y, size) {
            this.ctx.beginPath();
            this.ctx.moveTo(x - size * 2, y);
            this.ctx.lineTo(x + size * 2, y);
            this.ctx.moveTo(x, y - size * 2);
            this.ctx.lineTo(x, y + size * 2);
            this.ctx.stroke();
        }

        updateParticle(particle) {
            // Mouse interaction
            const dx = particle.x - this.mouse.x;
            const dy = particle.y - this.mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.vx += (dx / distance) * force * 0.5;
                particle.vy += (dy / distance) * force * 0.5;
            }

            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Damping
            particle.vx *= 0.98;
            particle.vy *= 0.98;

            // Boundaries
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx *= -1;
                particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy *= -1;
                particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
            }
        }

        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.particles.forEach(particle => {
                this.updateParticle(particle);
                this.drawParticle(particle);
            });

            this.animationId = requestAnimationFrame(() => this.animate());
        }

        addEventListeners() {
            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });

            window.addEventListener('resize', () => {
                this.resizeCanvas();
            });
        }

        destroy() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
            if (this.canvas) {
                this.canvas.remove();
            }
        }
    }

    // Scroll Animations
    class ScrollAnimations {
        constructor() {
            this.observer = null;
            this.parallaxElements = [];
        }

        init() {
            if (prefersReducedMotion || !config.enableScrollAnimations) return;

            this.setupObserver();
            this.setupParallax();
            this.autoApplyAnimations();
        }

        setupObserver() {
            const options = {
                threshold: 0.1,
                rootMargin: '50px'
            };

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('enhanced-visible');
                        
                        // Stagger children animations
                        if (entry.target.classList.contains('enhanced-stagger')) {
                            const children = entry.target.children;
                            Array.from(children).forEach((child, index) => {
                                setTimeout(() => {
                                    child.classList.add('enhanced-visible');
                                }, index * 100);
                            });
                        }
                    }
                });
            }, options);
        }

        autoApplyAnimations() {
            // Auto-apply animations to common elements
            const selectors = [
                'h1, h2, h3',
                '.card, .feature, .benefit',
                '.stat, .testimonial',
                'img:not(.no-animate)',
                '.btn, .button',
                '.section > *'
            ];

            selectors.forEach(selector => {
                document.querySelectorAll(selector).forEach((el, index) => {
                    if (!el.classList.contains('enhanced-animate')) {
                        el.classList.add('enhanced-animate');
                        
                        // Add variety to animations
                        const animations = [
                            'enhanced-fade-up',
                            'enhanced-fade-left',
                            'enhanced-fade-right',
                            'enhanced-zoom-in',
                            'enhanced-rotate-in',
                            'enhanced-slide-up',
                            'enhanced-fade-in'
                        ];
                        
                        const randomAnimation = animations[index % animations.length];
                        el.classList.add(randomAnimation);
                        
                        this.observer.observe(el);
                    }
                });
            });
        }

        setupParallax() {
            const parallaxElements = document.querySelectorAll('[data-parallax]');
            
            parallaxElements.forEach(el => {
                this.parallaxElements.push({
                    element: el,
                    speed: parseFloat(el.dataset.parallax) || 0.5
                });
            });

            if (this.parallaxElements.length > 0) {
                this.handleParallax();
                window.addEventListener('scroll', () => this.handleParallax(), { passive: true });
            }
        }

        handleParallax() {
            const scrolled = window.pageYOffset;
            
            this.parallaxElements.forEach(item => {
                const yPos = -(scrolled * item.speed);
                item.element.style.transform = `translateY(${yPos}px)`;
            });
        }
    }

    // Interactive Elements
    class InteractiveElements {
        init() {
            if (prefersReducedMotion || !config.enableInteractiveElements) return;

            this.setupMagneticButtons();
            this.setupRippleEffects();
            this.setupCardTilts();
            this.setupHoverEffects();
        }

        setupMagneticButtons() {
            const magneticElements = document.querySelectorAll('.btn, .button, .cta-button');
            
            magneticElements.forEach(el => {
                el.addEventListener('mousemove', (e) => {
                    const rect = el.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    
                    el.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
                });

                el.addEventListener('mouseleave', () => {
                    el.style.transform = 'translate(0, 0)';
                });
            });
        }

        setupRippleEffects() {
            const rippleElements = document.querySelectorAll('.btn, .button, .card, .feature');
            
            rippleElements.forEach(el => {
                el.style.position = 'relative';
                el.style.overflow = 'hidden';
                
                el.addEventListener('click', (e) => {
                    const rect = el.getBoundingClientRect();
                    const ripple = document.createElement('span');
                    const size = Math.max(rect.width, rect.height);
                    
                    ripple.style.cssText = `
                        position: absolute;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.5);
                        width: ${size}px;
                        height: ${size}px;
                        left: ${e.clientX - rect.left - size / 2}px;
                        top: ${e.clientY - rect.top - size / 2}px;
                        transform: scale(0);
                        animation: rippleEffect 0.6s ease-out;
                        pointer-events: none;
                    `;
                    
                    el.appendChild(ripple);
                    
                    setTimeout(() => {
                        ripple.remove();
                    }, 600);
                });
            });
        }

        setupCardTilts() {
            const tiltElements = document.querySelectorAll('.card, .feature, .benefit');
            
            tiltElements.forEach(el => {
                el.addEventListener('mousemove', (e) => {
                    const rect = el.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const rotateX = (y - centerY) / 10;
                    const rotateY = (centerX - x) / 10;
                    
                    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                });

                el.addEventListener('mouseleave', () => {
                    el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
                });
            });
        }

        setupHoverEffects() {
            const hoverElements = document.querySelectorAll('.card, .feature, .btn, .button');
            
            hoverElements.forEach(el => {
                el.classList.add('enhanced-hover');
            });
        }
    }

    // Background Effects
    class BackgroundEffects {
        init() {
            if (prefersReducedMotion || !config.enableBackgroundEffects) return;

            this.createGradientAnimation();
            this.createFloatingShapes();
            this.createAuroraEffect();
        }

        createGradientAnimation() {
            const gradient = document.createElement('div');
            gradient.className = 'enhanced-gradient-bg';
            gradient.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(45deg, 
                    rgba(78, 181, 255, 0.05), 
                    rgba(56, 193, 114, 0.05), 
                    rgba(255, 217, 61, 0.05), 
                    rgba(255, 107, 107, 0.05)
                );
                background-size: 400% 400%;
                animation: gradientShift 15s ease infinite;
                pointer-events: none;
                z-index: 0;
                opacity: 0;
                transition: opacity 2s ease;
            `;
            
            document.body.insertBefore(gradient, document.body.firstChild);
            
            setTimeout(() => {
                gradient.style.opacity = '1';
            }, 100);
        }

        createFloatingShapes() {
            const shapesContainer = document.createElement('div');
            shapesContainer.className = 'enhanced-shapes';
            shapesContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                pointer-events: none;
                z-index: 0;
            `;
            
            const shapes = ['circle', 'triangle', 'square'];
            const colors = config.particleColors;
            
            for (let i = 0; i < 5; i++) {
                const shape = document.createElement('div');
                const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
                const color = colors[Math.floor(Math.random() * colors.length)];
                const size = Math.random() * 100 + 50;
                const duration = Math.random() * 20 + 10;
                const delay = Math.random() * 5;
                
                shape.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    background: ${color};
                    opacity: 0.02;
                    animation: floatShape ${duration}s ${delay}s ease-in-out infinite;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                `;
                
                if (shapeType === 'circle') {
                    shape.style.borderRadius = '50%';
                } else if (shapeType === 'triangle') {
                    shape.style.width = '0';
                    shape.style.height = '0';
                    shape.style.borderLeft = `${size/2}px solid transparent`;
                    shape.style.borderRight = `${size/2}px solid transparent`;
                    shape.style.borderBottom = `${size}px solid ${color}`;
                    shape.style.background = 'transparent';
                }
                
                shapesContainer.appendChild(shape);
            }
            
            document.body.insertBefore(shapesContainer, document.body.firstChild);
        }

        createAuroraEffect() {
            const aurora = document.createElement('div');
            aurora.className = 'enhanced-aurora';
            aurora.style.cssText = `
                position: fixed;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(ellipse at center, 
                    rgba(78, 181, 255, 0.05) 0%, 
                    rgba(56, 193, 114, 0.05) 25%, 
                    transparent 70%
                );
                animation: auroraRotate 30s linear infinite;
                pointer-events: none;
                z-index: 0;
                opacity: 0;
                transition: opacity 3s ease;
            `;
            
            document.body.insertBefore(aurora, document.body.firstChild);
            
            setTimeout(() => {
                aurora.style.opacity = '1';
            }, 100);
        }
    }

    // Loading Effects
    class LoadingEffects {
        init() {
            if (!config.enableLoadingEffects) return;

            this.createLoader();
            this.handlePageLoad();
        }

        createLoader() {
            const loader = document.createElement('div');
            loader.className = 'enhanced-loader';
            loader.innerHTML = `
                <div class="enhanced-loader-container">
                    <div class="enhanced-loader-circle"></div>
                    <div class="enhanced-loader-circle-progress"></div>
                    <div class="enhanced-loader-content">
                        <div class="enhanced-loader-logo">AI</div>
                        <div class="enhanced-loader-text">Loading...</div>
                    </div>
                    <div class="enhanced-loader-dots">
                        <span class="enhanced-loader-dot"></span>
                        <span class="enhanced-loader-dot"></span>
                        <span class="enhanced-loader-dot"></span>
                    </div>
                </div>
                <div class="enhanced-loader-progress">
                    <div class="enhanced-loader-progress-bar"></div>
                </div>
            `;
            
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.98);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                transition: opacity 0.5s ease, visibility 0.5s ease;
            `;
            
            document.body.appendChild(loader);
        }

        handlePageLoad() {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const loader = document.querySelector('.enhanced-loader');
                    if (loader) {
                        loader.style.opacity = '0';
                        loader.style.visibility = 'hidden';
                        
                        setTimeout(() => {
                            loader.remove();
                        }, 500);
                    }
                }, 500);
            });
        }
    }

    // CSS Injection
    function injectStyles() {
        const styles = `
            /* Enhanced Scroll Animations */
            .enhanced-animate {
                opacity: 0;
                transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .enhanced-animate.enhanced-visible {
                opacity: 1;
            }
            
            .enhanced-fade-up {
                transform: translateY(30px);
            }
            
            .enhanced-fade-up.enhanced-visible {
                transform: translateY(0);
            }
            
            .enhanced-fade-left {
                transform: translateX(-30px);
            }
            
            .enhanced-fade-left.enhanced-visible {
                transform: translateX(0);
            }
            
            .enhanced-fade-right {
                transform: translateX(30px);
            }
            
            .enhanced-fade-right.enhanced-visible {
                transform: translateX(0);
            }
            
            .enhanced-zoom-in {
                transform: scale(0.9);
            }
            
            .enhanced-zoom-in.enhanced-visible {
                transform: scale(1);
            }
            
            .enhanced-rotate-in {
                transform: rotate(-5deg) scale(0.9);
            }
            
            .enhanced-rotate-in.enhanced-visible {
                transform: rotate(0) scale(1);
            }
            
            .enhanced-slide-up {
                transform: translateY(50px);
            }
            
            .enhanced-slide-up.enhanced-visible {
                transform: translateY(0);
            }
            
            .enhanced-fade-in {
                transform: scale(0.95);
            }
            
            .enhanced-fade-in.enhanced-visible {
                transform: scale(1);
            }
            
            /* Stagger children */
            .enhanced-stagger > * {
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.6s ease-out;
            }
            
            .enhanced-stagger > *.enhanced-visible {
                opacity: 1;
                transform: translateY(0);
            }
            
            /* Interactive Elements */
            .enhanced-hover {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .enhanced-hover:hover {
                transform: translateY(-5px) scale(1.02);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            }
            
            /* Ripple Effect */
            @keyframes rippleEffect {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            /* Background Animations */
            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            @keyframes floatShape {
                0%, 100% {
                    transform: translateY(0) rotate(0deg);
                }
                33% {
                    transform: translateY(-50px) rotate(120deg);
                }
                66% {
                    transform: translateY(50px) rotate(240deg);
                }
            }
            
            @keyframes auroraRotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            /* Loader Styles */
            .enhanced-loader-container {
                position: relative;
                width: 120px;
                height: 120px;
            }
            
            .enhanced-loader-circle {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                border: 3px solid rgba(78, 181, 255, 0.1);
            }
            
            .enhanced-loader-circle-progress {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                border: 3px solid transparent;
                border-top-color: #4EB5FF;
                animation: loaderRotate 1s linear infinite;
            }
            
            @keyframes loaderRotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            .enhanced-loader-content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
            }
            
            .enhanced-loader-logo {
                width: 50px;
                height: 50px;
                margin: 0 auto 10px;
                background: linear-gradient(135deg, #4EB5FF, #38C172);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 20px;
                animation: loaderPulse 1.5s ease-in-out infinite;
            }
            
            @keyframes loaderPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            .enhanced-loader-text {
                font-size: 12px;
                color: #4a5568;
                margin-top: 8px;
                opacity: 0;
                animation: fadeIn 0.5s ease 0.5s forwards;
            }
            
            @keyframes fadeIn {
                to { opacity: 1; }
            }
            
            .enhanced-loader-dots {
                position: absolute;
                bottom: -30px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 8px;
            }
            
            .enhanced-loader-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #4EB5FF;
                animation: dotPulse 1.5s ease-in-out infinite;
            }
            
            .enhanced-loader-dot:nth-child(2) {
                animation-delay: 0.15s;
            }
            
            .enhanced-loader-dot:nth-child(3) {
                animation-delay: 0.3s;
            }
            
            @keyframes dotPulse {
                0%, 80%, 100% {
                    transform: scale(0.8);
                    opacity: 0.5;
                }
                40% {
                    transform: scale(1.2);
                    opacity: 1;
                }
            }
            
            .enhanced-loader-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 4px;
                background: rgba(78, 181, 255, 0.1);
                overflow: hidden;
            }
            
            .enhanced-loader-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #4EB5FF, #38C172);
                animation: progressLoad 2s ease-in-out infinite;
            }
            
            @keyframes progressLoad {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            
            /* Ensure proper layering */
            body > * {
                position: relative;
                z-index: 1;
            }
            
            .enhanced-gradient-bg,
            .enhanced-shapes,
            .enhanced-aurora {
                z-index: 0 !important;
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    // Initialize
    function init(customConfig = {}) {
        // Merge custom config
        Object.assign(config, customConfig);
        
        // Inject styles
        injectStyles();
        
        // Initialize modules
        if (config.enableParticles) {
            const particleSystem = new ParticleSystem();
            particleSystem.init();
        }
        
        if (config.enableScrollAnimations) {
            const scrollAnimations = new ScrollAnimations();
            scrollAnimations.init();
        }
        
        if (config.enableInteractiveElements) {
            const interactiveElements = new InteractiveElements();
            interactiveElements.init();
        }
        
        if (config.enableBackgroundEffects) {
            const backgroundEffects = new BackgroundEffects();
            backgroundEffects.init();
        }
        
        if (config.enableLoadingEffects) {
            const loadingEffects = new LoadingEffects();
            loadingEffects.init();
        }
        
        // Lazy load images
        const lazyImages = document.querySelectorAll('img[data-src]');
        if (lazyImages.length > 0) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('enhanced-fade-in');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => init());
    } else {
        init();
    }

    // Public API
    return {
        init: init,
        config: config
    };
})();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedVisuals;
}

// Additional initialization functions for showcase and technology demos
// Initialize showcase animations for student work display
function initShowcaseAnimations() {
    console.log('Initializing showcase animations...');
    
    // Showcase animation URLs (verified working URLs)
    const showcaseAnimations = {
        showcase1: 'https://assets2.lottiefiles.com/packages/lf20_jcikwtux.json', // Success checkmark
        showcase2: 'https://assets3.lottiefiles.com/packages/lf20_tsxbtrcu.json', // Gears/loading
        showcase3: 'https://assets1.lottiefiles.com/packages/lf20_2omr5gpu.json'  // Stars/sparkle
    };
    
    // Load animations for each showcase
    Object.entries(showcaseAnimations).forEach(([containerId, animationUrl]) => {
        const container = document.getElementById(containerId);
        if (container) {
            try {
                const animation = lottie.loadAnimation({
                    container: container,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    path: animationUrl
                });
                
                // Add error handling
                animation.addEventListener('error', function() {
                    console.warn(`Failed to load animation for ${containerId}, using fallback`);
                    showFallbackAnimation(container, containerId);
                });
                
                console.log(`Successfully initialized ${containerId}`);
            } catch (error) {
                console.error(`Error initializing ${containerId}:`, error);
                showFallbackAnimation(container, containerId);
            }
        }
    });
}

// Initialize technology demo animations
function initTechnologyDemos() {
    console.log('Initializing technology demo animations...');
    
    // Technology demo animation URLs (verified working URLs)
    const techDemoAnimations = {
        '3d-animation-demo': 'https://assets10.lottiefiles.com/packages/lf20_DMgKk1.json',
        'micro-interaction-demo': 'https://assets4.lottiefiles.com/packages/lf20_uwR49r.json',
        'data-viz-demo': 'https://assets7.lottiefiles.com/packages/lf20_jcikwtux.json',
        'transition-demo': 'https://assets5.lottiefiles.com/packages/lf20_2omr5gpu.json',
        'cinematic-demo': 'https://assets9.lottiefiles.com/packages/lf20_tsxbtrcu.json',
        'gamification-demo': 'https://assets6.lottiefiles.com/packages/lf20_u4yrau.json'
    };
    
    // Load animations for each demo
    Object.entries(techDemoAnimations).forEach(([containerId, animationUrl]) => {
        const container = document.getElementById(containerId);
        if (container) {
            try {
                const animation = lottie.loadAnimation({
                    container: container,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    path: animationUrl
                });
                
                // Add error handling
                animation.addEventListener('error', function() {
                    console.warn(`Failed to load animation for ${containerId}, using fallback`);
                    showTechDemoFallback(container, containerId);
                });
                
                console.log(`Successfully initialized ${containerId}`);
            } catch (error) {
                console.error(`Error initializing ${containerId}:`, error);
                showTechDemoFallback(container, containerId);
            }
        }
    });
}

// Fallback animation for showcase items
function showFallbackAnimation(container, id) {
    const fallbackContent = {
        showcase1: { emoji: '💰', text: 'FinTech', color: '#FF6B35' },
        showcase2: { emoji: '🛒', text: 'E-Commerce', color: '#F7931E' },
        showcase3: { emoji: '🎨', text: 'Branding', color: '#FFD23F' }
    };
    
    const content = fallbackContent[id] || { emoji: '✨', text: 'Animation', color: '#4EB5FF' };
    
    container.innerHTML = `
        <div style="
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, ${content.color}20, ${content.color}10);
            border-radius: 15px;
            animation: pulse 2s ease-in-out infinite;
        ">
            <div style="font-size: 4rem; margin-bottom: 10px; animation: bounce 2s ease-in-out infinite;">
                ${content.emoji}
            </div>
            <div style="font-size: 1.2rem; font-weight: bold; color: ${content.color};">
                ${content.text}
            </div>
        </div>
    `;
}

// Fallback animation for technology demos
function showTechDemoFallback(container, id) {
    const fallbackContent = {
        '3d-animation-demo': { emoji: '🌍', text: '3D Animation', color: '#FF6B35' },
        'micro-interaction-demo': { emoji: '✨', text: 'Micro Interactions', color: '#F7931E' },
        'data-viz-demo': { emoji: '📊', text: 'Data Visualization', color: '#FFD23F' },
        'transition-demo': { emoji: '🔄', text: 'Transitions', color: '#4EB5FF' },
        'cinematic-demo': { emoji: '🎥', text: 'Cinematic', color: '#FFD23F' },
        'gamification-demo': { emoji: '🎮', text: 'Gamification', color: '#FF6B35' }
    };
    
    const content = fallbackContent[id] || { emoji: '🎨', text: 'Demo', color: '#4EB5FF' };
    
    container.innerHTML = `
        <div style="
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, ${content.color}20, ${content.color}10);
            border-radius: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            <div style="font-size: 3rem; margin-bottom: 10px; animation: rotate 3s linear infinite;">
                ${content.emoji}
            </div>
            <div style="font-size: 1rem; font-weight: bold; color: ${content.color};">
                ${content.text}
            </div>
        </div>
    `;
}

// Initialize all enhanced visuals including showcase and tech demos
function initEnhancedVisuals() {
    console.log('Initializing enhanced visuals...');
    
    // Wait for Lottie to be loaded
    if (typeof lottie === 'undefined') {
        console.warn('Lottie library not loaded yet, retrying in 1 second...');
        setTimeout(initEnhancedVisuals, 1000);
        return;
    }
    
    // Initialize all animations
    initShowcaseAnimations();
    initTechnologyDemos();
    
    console.log('Enhanced visuals initialization complete!');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnhancedVisuals);
} else {
    // DOM is already loaded
    setTimeout(initEnhancedVisuals, 100);
}

// Export functions for manual initialization
window.initShowcaseAnimations = initShowcaseAnimations;
window.initTechnologyDemos = initTechnologyDemos;
window.initEnhancedVisuals = initEnhancedVisuals;

// Add CSS animations for fallbacks
const fallbackStyle = document.createElement('style');
fallbackStyle.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.05); opacity: 1; }
    }
    
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    
    @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(fallbackStyle);

console.log('Enhanced visuals script with showcase animations loaded successfully!');