/* ================================================================
   MATHEW VARGHESE - PORTFOLIO SCRIPTS
   Interactive 3D effects, animations, and UI logic
   ================================================================ */

(function () {
    'use strict';

    // ===== PRELOADER =====
    const preloader = document.getElementById('preloader');
    const loaderStatus = document.getElementById('loaderStatus');
    const loaderProgress = document.getElementById('loaderProgress');

    const loaderMessages = [
        'Initializing systems...',
        'Loading assets...',
        'Compiling shaders...',
        'Establishing connection...',
        'Almost there...',
        'Ready.'
    ];

    let loaderStep = 0;
    let progress = 0;

    function advanceLoader() {
        if (loaderStep < loaderMessages.length) {
            loaderStatus.textContent = loaderMessages[loaderStep];
            loaderStep++;
        }
        progress = Math.min(progress + Math.random() * 25 + 10, 100);
        loaderProgress.style.width = progress + '%';

        if (progress < 100) {
            setTimeout(advanceLoader, 400 + Math.random() * 300);
        }
    }

    advanceLoader();

    window.addEventListener('load', function () {
        // Ensure minimum display time
        setTimeout(function () {
            progress = 100;
            loaderProgress.style.width = '100%';
            loaderStatus.textContent = 'Ready.';
            setTimeout(function () {
                preloader.classList.add('hidden');
                document.body.classList.remove('loading');
                // Trigger hero animations
                document.body.classList.add('loaded');
            }, 400);
        }, 1800);
    });

    document.body.classList.add('loading');

    // ===== CUSTOM CURSOR =====
    const cursorDot = document.getElementById('cursorDot');
    const cursorOutline = document.getElementById('cursorOutline');
    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) {
        document.addEventListener('mousemove', function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';

            if (!document.body.classList.contains('cursor-ready')) {
                document.body.classList.add('cursor-ready');
            }
        });

        function animateCursor() {
            outlineX += (mouseX - outlineX) * 0.12;
            outlineY += (mouseY - outlineY) * 0.12;
            cursorOutline.style.left = outlineX + 'px';
            cursorOutline.style.top = outlineY + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Cursor hover effect on interactive elements
        const hoverTargets = document.querySelectorAll('a, button, .skill-card, .project-card, .contact-link-item, .stat-card, .game-tag, .btn');
        hoverTargets.forEach(function (el) {
            el.addEventListener('mouseenter', function () {
                cursorOutline.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', function () {
                cursorOutline.classList.remove('cursor-hover');
            });
        });
    }

    // ===== SCROLL PROGRESS =====
    const scrollProgress = document.getElementById('scrollProgress');

    function updateScrollProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollProgress.style.width = scrollPercent + '%';
    }

    // ===== NAVBAR SCROLL EFFECT =====
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');

    function handleScroll() {
        const scrollY = window.scrollY;

        // Navbar background
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top button
        if (scrollY > 600) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        updateScrollProgress();
        updateActiveNavLink();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Back to top
    backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ===== MOBILE MENU =====
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    navToggle.addEventListener('click', function () {
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
    });

    mobileMenuClose.addEventListener('click', closeMobileMenu);

    mobileLinks.forEach(function (link) {
        link.addEventListener('click', closeMobileMenu);
    });

    function closeMobileMenu() {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    }

    // ===== ACTIVE NAV LINK =====
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveNavLink() {
        const scrollY = window.scrollY + 200;

        sections.forEach(function (section) {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollY >= top && scrollY < top + height) {
                navLinks.forEach(function (link) {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // ===== TYPEWRITER EFFECT =====
    const heroRole = document.getElementById('heroRole');
    const roles = ['Gamer', 'Ethical Hacker', 'Developer', 'Creator', 'Security Researcher', 'Tech Enthusiast'];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function typeRole() {
        const current = roles[roleIndex];

        if (isDeleting) {
            heroRole.textContent = current.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            heroRole.textContent = current.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }

        if (!isDeleting && charIndex === current.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 400; // Pause before typing new word
        }

        setTimeout(typeRole, typeSpeed);
    }

    typeRole();

    // ===== SCROLL REVEAL (Intersection Observer) =====
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(function (el) {
        revealObserver.observe(el);
    });

    // ===== STATS COUNTER ANIMATION =====
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');

    const statsObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                animateCount(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(function (el) {
        statsObserver.observe(el);
    });

    function animateCount(el) {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            el.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target;
            }
        }

        requestAnimationFrame(update);
    }

    // ===== 3D TILT EFFECT ON PROJECT CARDS =====
    const tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.02)';
        });

        card.addEventListener('mouseleave', function () {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
        });
    });

    // ===== HERO SHAPES PARALLAX (Mouse Movement) =====
    const heroShapes = document.getElementById('heroShapes');

    if (!isTouchDevice && heroShapes) {
        document.addEventListener('mousemove', function (e) {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;

            const shapes = heroShapes.querySelectorAll('.floating-shape');
            shapes.forEach(function (shape, i) {
                const speed = (i + 1) * 5;
                const offsetX = x * speed;
                const offsetY = y * speed;
                shape.style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px)' + (shape._baseTransform || '');
            });
        });
    }

    // ===== TERMINAL TYPING ANIMATION =====
    const terminalTyping = document.getElementById('terminalTyping');
    const terminalCommands = [
        'echo "Building the future..."',
        'sudo apt update && sudo apt upgrade',
        'python3 exploit_scanner.py --target suspicious.net',
        'git commit -m "another day, another fix"',
        'nmap -sS -O 192.168.1.0/24',
        'cat /etc/shadow | grep root',
        'ssh admin@secure-server.local'
    ];
    let termCmdIndex = 0;
    let termCharIndex = 0;
    let termIsDeleting = false;

    function typeTerminal() {
        if (!terminalTyping) return;

        const current = terminalCommands[termCmdIndex];

        if (termIsDeleting) {
            terminalTyping.textContent = current.substring(0, termCharIndex - 1);
            termCharIndex--;
        } else {
            terminalTyping.textContent = current.substring(0, termCharIndex + 1);
            termCharIndex++;
        }

        let speed = termIsDeleting ? 30 : 60;

        if (!termIsDeleting && termCharIndex === current.length) {
            speed = 3000;
            termIsDeleting = true;
        } else if (termIsDeleting && termCharIndex === 0) {
            termIsDeleting = false;
            termCmdIndex = (termCmdIndex + 1) % terminalCommands.length;
            speed = 500;
        }

        setTimeout(typeTerminal, speed);
    }

    typeTerminal();

    // ===== SMOOTH SCROLL FOR NAV LINKS =====
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const navHeight = navbar.offsetHeight + 32;
                const targetTop = target.offsetTop - navHeight;
                window.scrollTo({
                    top: targetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== CONTACT FORM - Google Forms Integration =====
    const contactForm = document.getElementById('contactForm');
    const formSubmit = document.getElementById('formSubmit');

    // Google Form field entry IDs
    const GFORM_ACTION = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSc7d4alBVcWKFV3DNV36bR_Zct5iIJVDGPbfbZMrRGx_kGk3w/formResponse';
    const GFORM_FIELDS = {
        name: 'entry.1595713906',
        email: 'entry.2048836942',
        message: 'entry.1551310253',
        others: 'entry.1413127767'
    };

    // Gather device/browser details
    function getDeviceInfo() {
        var ua = navigator.userAgent;
        var platform = navigator.platform || navigator.userAgentData?.platform || 'Unknown';
        var lang = navigator.language || navigator.userLanguage || 'Unknown';
        var screen = window.screen;
        var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
        var now = new Date();

        var info = [
            '--- Device & Browser Info ---',
            'User-Agent: ' + ua,
            'Platform: ' + platform,
            'Language: ' + lang,
            'Screen: ' + screen.width + 'x' + screen.height + ' (' + screen.colorDepth + '-bit)',
            'Viewport: ' + window.innerWidth + 'x' + window.innerHeight,
            'Timezone: ' + tz,
            'Local Time: ' + now.toLocaleString(),
            'Online: ' + navigator.onLine,
            'Cookies Enabled: ' + navigator.cookieEnabled,
            'Touch Device: ' + isTouchDevice,
            'Device Memory: ' + (navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'N/A'),
            'CPU Cores: ' + (navigator.hardwareConcurrency || 'N/A'),
            'Connection: ' + (navigator.connection ? navigator.connection.effectiveType : 'N/A'),
            'Referrer: ' + (document.referrer || 'Direct')
        ];

        return info.join('\n');
    }

    // Fetch visitor IP address
    function getVisitorIP() {
        return fetch('https://ipapi.co/json/', { mode: 'cors' })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                return [
                    '--- IP & Location ---',
                    'IP: ' + (data.ip || 'N/A'),
                    'City: ' + (data.city || 'N/A'),
                    'Region: ' + (data.region || 'N/A'),
                    'Country: ' + (data.country_name || 'N/A'),
                    'ISP: ' + (data.org || 'N/A'),
                    'Lat/Lon: ' + (data.latitude || '') + ', ' + (data.longitude || '')
                ].join('\n');
            })
            .catch(function () {
                return '--- IP & Location ---\nIP: Could not be determined';
            });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var submitBtn = formSubmit;
            var submitSpan = submitBtn.querySelector('span');
            var originalText = submitSpan.textContent;

            // Disable button and show loading state
            submitBtn.disabled = true;
            submitSpan.textContent = 'Sending...';
            submitBtn.style.opacity = '0.7';

            var formName = document.getElementById('formName').value.trim();
            var formEmail = document.getElementById('formEmail').value.trim();
            var formMessage = document.getElementById('formMessage').value.trim();

            // Collect device info + IP, then submit
            getVisitorIP().then(function (ipInfo) {
                var deviceInfo = getDeviceInfo();
                var othersData = deviceInfo + '\n\n' + ipInfo;

                // Build form data
                var formData = new URLSearchParams();
                formData.append(GFORM_FIELDS.name, formName);
                formData.append(GFORM_FIELDS.email, formEmail);
                formData.append(GFORM_FIELDS.message, formMessage);
                formData.append(GFORM_FIELDS.others, othersData);

                // Submit via fetch (no-cors to avoid CORS issues with Google Forms)
                return fetch(GFORM_ACTION, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: formData.toString()
                });
            }).then(function () {
                // Success state (no-cors always returns opaque response, so we assume success)
                submitSpan.textContent = 'Message Sent!';
                submitBtn.style.background = 'var(--accent-lime)';
                submitBtn.style.opacity = '1';
                contactForm.reset();

                setTimeout(function () {
                    submitSpan.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
            }).catch(function () {
                // Error state
                submitSpan.textContent = 'Failed - Try Again';
                submitBtn.style.background = 'var(--accent-magenta)';
                submitBtn.style.opacity = '1';

                setTimeout(function () {
                    submitSpan.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
            });
        });
    }

    // ===== SKILL CARDS - Touch support for mobile =====
    if (isTouchDevice) {
        document.querySelectorAll('.skill-card').forEach(function (card) {
            card.addEventListener('click', function () {
                // Toggle flipped state
                const inner = card.querySelector('.skill-card-inner');
                if (inner.style.transform === 'rotateY(180deg)') {
                    inner.style.transform = '';
                } else {
                    inner.style.transform = 'rotateY(180deg)';
                }
            });
        });
    }

    // ===== INITIAL SCROLL CHECK =====
    handleScroll();

})();
