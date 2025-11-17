// ==========================================
// LUMÈRE JOAILLERIE - INTERACTIVE JEWELS
// Dual Mode System + Animations
// Performance Optimized v1.0
// ==========================================

(function() {
    'use strict';

    // === CONSTANTS ===
    const STORAGE_KEY = 'lumere-mode';
    const DEFAULT_MODE = 'light-mode';
    const CURSOR_SPEED = 0.15;
    const SCROLL_THROTTLE = 100;
    
    // === UTILITIES ===
    const throttle = (func, delay) => {
        let timeoutId;
        let lastExec = 0;
        
        return function(...args) {
            const elapsed = Date.now() - lastExec;
            
            const exec = () => {
                lastExec = Date.now();
                func.apply(this, args);
            };
            
            clearTimeout(timeoutId);
            
            if (elapsed > delay) {
                exec();
            } else {
                timeoutId = setTimeout(exec, delay - elapsed);
            }
        };
    };

    // === INIT ===
    document.addEventListener('DOMContentLoaded', function() {

    // === MODE TOGGLE (Crystal White / Black Diamond) ===
    const modeToggle = document.querySelector('.mode-toggle');
    const body = document.body;
    
    // Check for saved mode preference or system preference
    const savedMode = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialMode = savedMode || (prefersDark ? 'dark-mode' : DEFAULT_MODE);
    body.className = initialMode;
    
    if (modeToggle) {
        modeToggle.addEventListener('click', () => {
            const isLight = body.classList.contains('light-mode');
            const newMode = isLight ? 'dark-mode' : 'light-mode';
            
            body.classList.remove('light-mode', 'dark-mode');
            body.classList.add(newMode);
            localStorage.setItem(STORAGE_KEY, newMode);
        }, { passive: true });
    }

    // === CUSTOM CURSOR ===
    const cursor = document.querySelector('.custom-cursor');
    
    if (cursor && window.matchMedia('(pointer: fine)').matches) {
        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;
        let rafId;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            if (!rafId) {
                rafId = requestAnimationFrame(animateCursor);
            }
        }, { passive: true });
        
        function animateCursor() {
            const distX = mouseX - cursorX;
            const distY = mouseY - cursorY;
            
            cursorX += distX * CURSOR_SPEED;
            cursorY += distY * CURSOR_SPEED;
            
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            
            if (Math.abs(distX) > 0.1 || Math.abs(distY) > 0.1) {
                rafId = requestAnimationFrame(animateCursor);
            } else {
                rafId = null;
            }
        }
        
        // Cursor hover effects
        const hoverElements = document.querySelectorAll('a, button, .signature__item, .collection-card, .gemstone-card');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.width = '50px';
                cursor.style.height = '50px';
            }, { passive: true });
            el.addEventListener('mouseleave', () => {
                cursor.style.width = '20px';
                cursor.style.height = '20px';
            }, { passive: true });
        });
    }

    // === NAVIGATION ===
    const nav = document.querySelector('.main-nav');
    
    // Sticky nav with smooth transition
    window.addEventListener('scroll', throttle(() => {
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }, 100));

    // Mobile menu toggle
    const menuToggle = document.querySelector('.main-nav__toggle');
    const navMenu = document.querySelector('.main-nav__menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
            body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu on link click
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                body.style.overflow = '';
            });
        });
        
        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                body.style.overflow = '';
            }
        });
    }

    // === SMOOTH SCROLL ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 100;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // === SCROLL ANIMATIONS (AOS-like) ===
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    };

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
                // Optionally unobserve after animation
                // animationObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with data-aos
    document.querySelectorAll('[data-aos]').forEach(el => {
        animationObserver.observe(el);
    });

    // === GEMSTONE SHIMMER ON SCROLL ===
    const shimmerElements = document.querySelectorAll('.signature__shimmer, .gemstone-card__visual');
    
    if (shimmerElements.length > 0) {
        const shimmerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                } else {
                    entry.target.style.animationPlayState = 'paused';
                }
            });
        }, { threshold: 0.3 });
        
        shimmerElements.forEach(el => shimmerObserver.observe(el));
    }

    // === PARALLAX HERO SHIMMER ===
    const heroShimmer = document.querySelector('.hero__shimmer');
    
    if (heroShimmer) {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    const heroHeight = document.querySelector('.hero').offsetHeight;
                    
                    if (scrolled < heroHeight) {
                        const opacity = 1 - (scrolled / heroHeight);
                        heroShimmer.style.opacity = opacity;
                    }
                    
                    ticking = false;
                });
                
                ticking = true;
            }
        });
    }

    // === SIGNATURE PIECES HOVER EFFECT ===
    const signatureItems = document.querySelectorAll('.signature__item');
    
    signatureItems.forEach(item => {
        const shimmer = item.querySelector('.signature__shimmer');
        
        item.addEventListener('mouseenter', () => {
            if (shimmer) {
                shimmer.style.opacity = '1';
                shimmer.style.animation = 'gemstoneShine 2s ease-out';
            }
        });
        
        item.addEventListener('mouseleave', () => {
            if (shimmer) {
                setTimeout(() => {
                    shimmer.style.opacity = '0';
                }, 2000);
            }
        });
    });

    // === CONTACT FORM HANDLING ===
    const contactForm = document.querySelector('.contact__form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Show loading state
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                // Create success message
                const successDiv = document.createElement('div');
                successDiv.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: var(--color-accent);
                    color: var(--color-bg);
                    padding: 40px 60px;
                    text-align: center;
                    z-index: 10000;
                    font-size: 18px;
                    box-shadow: 0 20px 60px var(--color-shadow);
                `;
                successDiv.innerHTML = `
                    <h3 style="font-family: var(--font-display); font-size: 28px; margin-bottom: 16px;">Thank You</h3>
                    <p style="margin: 0;">We'll be in touch shortly to arrange your private consultation.</p>
                `;
                
                document.body.appendChild(successDiv);
                
                // Reset form
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                // Remove success message after 4 seconds
                setTimeout(() => {
                    successDiv.style.opacity = '0';
                    successDiv.style.transition = 'opacity 0.5s';
                    setTimeout(() => successDiv.remove(), 500);
                }, 4000);
                
            }, 1500);
        });
        
        // Form field focus effects
        const formInputs = contactForm.querySelectorAll('input, select, textarea');
        formInputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.style.transform = 'translateX(5px)';
                input.parentElement.style.transition = 'transform 0.3s';
            });
            
            input.addEventListener('blur', () => {
                input.parentElement.style.transform = 'translateX(0)';
            });
        });
    }

    // === HERO SCROLL INDICATOR PULSE ===
    const scrollIndicator = document.querySelector('.hero__scroll-indicator');
    
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const firstSection = document.querySelector('.signature');
            if (firstSection) {
                firstSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        // Hide on scroll
        window.addEventListener('scroll', throttle(() => {
            if (window.scrollY > 200) {
                scrollIndicator.style.opacity = '0';
            } else {
                scrollIndicator.style.opacity = '1';
            }
        }, 100));
    }

    // === COLLECTION CARDS 3D TILT EFFECT ===
    const collectionCards = document.querySelectorAll('.collection-card, .journal-card, .exhibition-card');
    
    collectionCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // === GEMSTONE ROTATION ANIMATION ===
    const gemstones = document.querySelectorAll('.gemstone-card__visual');
    
    gemstones.forEach(gem => {
        // Randomize animation delay for more organic feel
        const randomDelay = Math.random() * 2;
        gem.style.animationDelay = `${randomDelay}s`;
    });

    // === HIGH JEWELRY SPOTLIGHT EFFECT ===
    const spotlight = document.querySelector('.high-jewelry__spotlight');
    const highJewelrySection = document.querySelector('.high-jewelry');
    
    if (spotlight && highJewelrySection) {
        highJewelrySection.addEventListener('mousemove', throttle((e) => {
            const rect = highJewelrySection.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            spotlight.style.left = x + 'px';
            spotlight.style.top = y + 'px';
        }, 50));
    }

    // === PROGRESSIVE IMAGE LOADING ===
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    images.forEach(img => {
        // Add load event listener
        img.addEventListener('load', function() {
            this.classList.add('loaded');
        });
        
        // If already loaded (cached)
        if (img.complete && img.naturalHeight !== 0) {
            img.classList.add('loaded');
        }
    });
    
    // === LAZY LOADING IMAGES WITH DATA-SRC ===
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if (lazyImages.length > 0) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    
                    img.addEventListener('load', function() {
                        this.classList.add('loaded');
                    });
                    
                    imageObserver.unobserve(img);
                }
            });
        }, { rootMargin: '100px' });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // === PERFORMANCE MONITORING ===
    if ('PerformanceObserver' in window) {
        // Log Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // === UTILITY FUNCTIONS ===
    
    // Throttle for performance optimization
    function throttle(func, wait) {
        let timeout;
        let previous = 0;
        
        return function executedFunction(...args) {
            const now = Date.now();
            const remaining = wait - (now - previous);
            
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                func.apply(this, args);
            } else if (!timeout) {
                timeout = setTimeout(() => {
                    previous = Date.now();
                    timeout = null;
                    func.apply(this, args);
                }, remaining);
            }
        };
    }

    // Debounce for input fields
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // === KEYBOARD NAVIGATION ===
    document.addEventListener('keydown', (e) => {
        // ESC to close mobile menu
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            body.style.overflow = '';
        }
        
        // M key to toggle mode
        if (e.key === 'm' && !e.target.matches('input, textarea')) {
            modeToggle.click();
        }
    });

    // === PRELOAD CRITICAL RESOURCES ===
    const preloadImages = [
        // Add your hero/critical images here
        // 'path/to/critical-image.jpg'
    ];
    
    preloadImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });

    // === PREVENT FOUC (Flash of Unstyled Content) ===
    document.body.style.visibility = 'visible';

    // === INITIALIZE NOTIFICATION ===
    if (console && console.log) {
        console.log('%c💎 LUMÈRE JOAILLERIE', 'font-size: 16px; font-weight: bold; color: #D4AF37;');
        console.log(`%c🎨 Mode: ${body.classList.contains('dark-mode') ? 'Black Diamond' : 'Crystal White'}`, 'color: #888;');
        console.log('%c✨ Press "M" to toggle light/dark mode', 'color: #888;');
    }
    
    });

})();
