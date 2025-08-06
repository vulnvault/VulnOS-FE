// script.js - VulnOS Site-wide Scripts

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // --- Element Cache ---
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const navLinksContainer = document.getElementById('nav-links');
    const landingHeader = document.getElementById('landing-header');
    const currentYearSpan = document.getElementById('current-year');
    const contactForm = document.getElementById('contactForm'); // ID from your final contact.html

    // --- 1. Theme Toggle Functionality ---
    if (themeToggle) {
        const applyTheme = (theme) => {
            body.classList.remove('light-theme', 'dark-theme');
            body.classList.add(`${theme}-theme`);
            localStorage.setItem('vulnos_theme', theme);
            themeToggle.setAttribute('aria-pressed', theme === 'dark');
        };

        let currentTheme = localStorage.getItem('vulnos_theme');
        if (!currentTheme) {
            currentTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        applyTheme(currentTheme);

        themeToggle.addEventListener('click', () => {
            const newTheme = body.classList.contains('dark-theme') ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('vulnos_theme_explicit_choice', 'true');
        });

        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                if (!localStorage.getItem('vulnos_theme_explicit_choice')) {
                    applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    // --- 2. Mobile Navigation Toggle ---
    if (mobileNavToggle && navLinksContainer) {
        mobileNavToggle.addEventListener('click', () => {
            const isActive = navLinksContainer.classList.toggle('active');
            mobileNavToggle.classList.toggle('active');
            mobileNavToggle.setAttribute('aria-expanded', isActive);
            document.body.classList.toggle('no-scroll', isActive);
        });

        navLinksContainer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                if (navLinksContainer.classList.contains('active')) {
                    navLinksContainer.classList.remove('active');
                    mobileNavToggle.classList.remove('active');
                    mobileNavToggle.setAttribute('aria-expanded', 'false');
                    document.body.classList.remove('no-scroll');
                }
            });
        });
    }

    // --- 3. Sticky Header Background on Scroll ---
    if (landingHeader) {
        const handleScrollHeader = () => {
            if (window.scrollY > 30) {
                landingHeader.classList.add('scrolled');
            } else {
                landingHeader.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', handleScrollHeader, { passive: true });
        handleScrollHeader();
    }

    // --- 4. Dynamic Footer Year ---
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- 5. Smooth Scroll & Active Nav Link Highlighting (Homepage Specific) ---
    if (document.body.classList.contains('homepage')) {
        const navLinkItemsForScroll = document.querySelectorAll('#nav-links > li > a.nav-link-item[href^="index.html#"], #nav-links > li > a.nav-link-item[href^="#"]');
        const sectionsForNavHighlight = Array.from(navLinkItemsForScroll)
            .map(link => {
                const href = link.getAttribute('href');
                const sectionId = href.includes('#') ? href.substring(href.lastIndexOf('#')) : null;
                if (sectionId && sectionId.length > 1) {
                    try { return document.querySelector(sectionId); } catch (e) { return null; }
                }
                return null;
            })
            .filter(section => section !== null);

        if (sectionsForNavHighlight.length > 0 && landingHeader && navLinksContainer) {
            const headerOffsetForNav = (landingHeader.offsetHeight || 64) + 20;
            let currentActiveNavLink = navLinksContainer.querySelector('.nav-link-item.active-nav-link');

            const observerOptionsNav = {
                root: null,
                rootMargin: `-${headerOffsetForNav}px 0px -${window.innerHeight - headerOffsetForNav - 150}px 0px`,
                threshold: 0.01
            };

            const observerNav = new IntersectionObserver(entries => {
                let intersectingSections = [];
                entries.forEach(entry => {
                    if (entry.isIntersecting) intersectingSections.push(entry.target);
                });

                if (intersectingSections.length > 0) {
                    intersectingSections.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
                    const topMostVisibleSectionId = intersectingSections[0].id;
                    const newActiveLink = navLinksContainer.querySelector(`.nav-link-item[href$="#${topMostVisibleSectionId}"]`);
                    if (newActiveLink && newActiveLink !== currentActiveNavLink) {
                        if (currentActiveNavLink) currentActiveNavLink.classList.remove('active-nav-link');
                        newActiveLink.classList.add('active-nav-link');
                        currentActiveNavLink = newActiveLink;
                    }
                } else if (window.scrollY < sectionsForNavHighlight[0].offsetTop - headerOffsetForNav) {
                    const homeLink = navLinksContainer.querySelector('.nav-link-item[href="index.html"], .nav-link-item[href="index.html#hero"]');
                    if (currentActiveNavLink && currentActiveNavLink !== homeLink) currentActiveNavLink.classList.remove('active-nav-link');
                    if (homeLink && !homeLink.classList.contains('active-nav-link')) {
                        homeLink.classList.add('active-nav-link');
                        currentActiveNavLink = homeLink;
                    }
                }
            }, observerOptionsNav);
            sectionsForNavHighlight.forEach(section => observerNav.observe(section));
        }

        document.querySelectorAll('a[href^="index.html#"], a[href^="#"]').forEach(anchor => {
            const href = anchor.getAttribute('href');
            const targetId = href.includes('#') ? href.substring(href.lastIndexOf('#')) : null;

            if (targetId && targetId.length > 1) {
                try {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        anchor.addEventListener('click', function(e) {
                            e.preventDefault();
                            const headerOffset = landingHeader?.offsetHeight || 64;
                            let elementPosition = targetElement.getBoundingClientRect().top;
                            let offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                            if (targetId === "#hero") offsetPosition = 0;
                            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                        });
                    }
                } catch (e) { console.warn(`Smooth scroll target error for: ${targetId}`, e); }
            }
        });
    }

    // --- 6. Intersection Observer for Scroll Animations (Fade/Slide In) ---
    const elementsToAnimate = document.querySelectorAll('.section-to-animate, .el-to-animate');
    if ("IntersectionObserver" in window && elementsToAnimate.length > 0) {
        const elementObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.animDelay || '0';
                    entry.target.style.transitionDelay = `${delay}s`;
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
        elementsToAnimate.forEach(el => elementObserver.observe(el));
    } else {
        elementsToAnimate.forEach(el => el.classList.add('in-view'));
    }

    // --- 7. Testimonial Carousel Functionality (If on homepage) ---
    if (document.getElementById('testimonial-carousel')) {
        const carousel = document.getElementById('testimonial-carousel');
        const prevButton = document.getElementById('testimonial-prev');
        const nextButton = document.getElementById('testimonial-next');
        const dotsContainer = document.getElementById('carousel-dots');

        if (carousel && prevButton && nextButton && dotsContainer) {
            const items = carousel.querySelectorAll('.testimonial-card-outer');
            const totalItems = items.length;
            let itemsPerView = 3;

            let currentIndex = 0;
            let autoSlideInterval;
            const slideDuration = 5000;

            function updateItemsPerView() {
                if (window.innerWidth < 768) itemsPerView = 1;
                else if (window.innerWidth < 992) itemsPerView = 2;
                else itemsPerView = 3;
            }

            function updateCarousel() {
                const totalSlides = Math.ceil(totalItems / itemsPerView);
                carousel.style.transform = `translateX(-${currentIndex * (100 / (totalItems / itemsPerView))}%)`;

                const dots = dotsContainer.querySelectorAll('.dot');
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentIndex);
                });

                prevButton.disabled = currentIndex === 0;
                nextButton.disabled = currentIndex >= totalSlides - 1;
            }

            function createDots() {
                dotsContainer.innerHTML = '';
                const numDots = Math.ceil(totalItems / itemsPerView);
                if (numDots <= 1) return;

                for (let i = 0; i < numDots; i++) {
                    const dot = document.createElement('button');
                    dot.classList.add('dot');
                    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                    dot.addEventListener('click', () => {
                        currentIndex = i;
                        updateCarousel();
                        resetAutoSlide();
                    });
                    dotsContainer.appendChild(dot);
                }
            }

            function setupCarousel() {
                updateItemsPerView();
                items.forEach(item => {
                    item.style.flex = `0 0 ${100 / itemsPerView}%`;
                });
                createDots();
                updateCarousel();
            }

            nextButton.addEventListener('click', () => {
                const totalSlides = Math.ceil(totalItems / itemsPerView);
                if (currentIndex < totalSlides - 1) {
                    currentIndex++;
                    updateCarousel();
                    resetAutoSlide();
                }
            });

            prevButton.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateCarousel();
                    resetAutoSlide();
                }
            });

            function startAutoSlide() {
                stopAutoSlide();
                if (Math.ceil(totalItems / itemsPerView) <= 1) return;
                autoSlideInterval = setInterval(() => {
                    const totalSlides = Math.ceil(totalItems / itemsPerView);
                    currentIndex = (currentIndex + 1) % totalSlides;
                    updateCarousel();
                }, slideDuration);
            }

            function stopAutoSlide() {
                clearInterval(autoSlideInterval);
            }

            function resetAutoSlide() {
                stopAutoSlide();
                startAutoSlide();
            }

            const carouselWrapper = document.querySelector('.testimonial-carousel-wrapper');
            if (carouselWrapper) {
                carouselWrapper.addEventListener('mouseenter', stopAutoSlide);
                carouselWrapper.addEventListener('mouseleave', startAutoSlide);
            }

            setupCarousel();
            startAutoSlide();

            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    const oldItemsPerView = itemsPerView;
                    updateItemsPerView();
                    if (oldItemsPerView !== itemsPerView) {
                        currentIndex = 0;
                        setupCarousel();
                    }
                    resetAutoSlide();
                }, 250);
            });
        }
    }

    // --- 8. Custom Popup Functionality (Globally available) ---
    const customPopupOverlay = document.getElementById('custom-popup-overlay');
    const customPopup = document.getElementById('custom-popup');
    const customPopupTitle = document.getElementById('custom-popup-title');
    const customPopupMessage = document.getElementById('custom-popup-message');
    const customPopupCloseBtn = document.getElementById('custom-popup-close-btn');

    window.showCustomPopup = function(message, title = "Notification", type = "info") {
        if (!customPopupOverlay || !customPopup || !customPopupTitle || !customPopupMessage) {
            console.warn("Custom popup elements not found. Falling back to alert.");
            alert(`${title}: ${message}`);
            return;
        }
        customPopupTitle.textContent = title;
        customPopupMessage.innerHTML = message;
        customPopup.className = 'custom-popup';
        if (type) customPopup.classList.add(`popup-${type}`);

        customPopupOverlay.style.display = 'flex';
        requestAnimationFrame(() => {
            customPopupOverlay.classList.add('active');
        });
    };

    function hideCustomPopup() {
        if (!customPopupOverlay) return;
        customPopupOverlay.classList.remove('active');
    }

    if (customPopupCloseBtn) customPopupCloseBtn.addEventListener('click', hideCustomPopup);
    if (customPopupOverlay) {
        customPopupOverlay.addEventListener('click', (event) => {
            if (event.target === customPopupOverlay) hideCustomPopup();
        });
    }

    // --- 9. FAQ Accordion Logic (If on a page with FAQs) ---
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const questionButton = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');

            if (questionButton && answer) {
                questionButton.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    item.classList.toggle('active');
                    questionButton.setAttribute('aria-expanded', String(!isActive));

                    if (!isActive) {
                        answer.style.maxHeight = answer.scrollHeight + "px";
                    } else {
                        answer.style.maxHeight = null;
                    }
                });
            }
        });
    }

    // --- 10. Contact Form Submission Logic (Updated for PHP) ---
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner"></span> Sending...';

            const formData = {
                name: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                subject: document.getElementById('contact-subject').value,
                message: document.getElementById('contact-message').value,
            };

            try {
                const response = await fetch('contact-handler.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                const result = await response.json();

                if (response.ok) {
                    const successMessage = `${result.message}<br><br>Your reference ticket number is: <strong>${result.ticketNumber}</strong>`;
                    showCustomPopup(successMessage, 'Message Sent!', 'success');
                    contactForm.reset();
                } else {
                    showCustomPopup(result.message || 'An unknown error occurred.', 'Submission Failed', 'error');
                }
            } catch (error) {
                console.error('Contact form submission error:', error);
                showCustomPopup('Could not connect to the server. Please check your connection and try again.', 'Connection Error', 'error');
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        });
    }

    // --- 11. Page Load/Exit Animations ---
    document.body.classList.add('page-visible');

    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const target = this.getAttribute('target');
            const download = this.hasAttribute('download');
            const isMailtoOrTel = href && (href.startsWith('mailto:') || href.startsWith('tel:'));
            const isJavascriptVoid = href && href.toLowerCase().startsWith('javascript:void');
            let isSamePageHashLink = href && href.startsWith('#');

            if (href && !isSamePageHashLink) {
                try {
                    const linkUrl = new URL(href, window.location.origin);
                    if (linkUrl.pathname === window.location.pathname && linkUrl.hash) {
                        isSamePageHashLink = true;
                    }
                } catch (err) {}
            }

            if (href && !isSamePageHashLink && !isMailtoOrTel && target !== '_blank' && !download && !isJavascriptVoid) {
                let isInternal = false;
                try {
                    isInternal = new URL(href, window.location.origin).hostname === window.location.hostname;
                } catch (error) {
                    if (!href.match(/^https?:\/\//) && !href.match(/^\/\//)) {
                        isInternal = true;
                    }
                }

                if (isInternal) {
                    e.preventDefault();
                    document.body.classList.remove('page-visible');
                    setTimeout(() => {
                        window.location.href = href;
                    }, 400);
                }
            }
        });
    });

    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            document.body.classList.add('page-visible');
        }
    });

    // --- 12. Active Page Navigation Link Highlighting ---
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a.nav-link-item');
    
    navLinks.forEach(link => link.classList.remove('active-nav-link'));

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop() || 'index.html';
        if (linkPage === currentPage) {
            link.classList.add('active-nav-link');
        }
    });
});