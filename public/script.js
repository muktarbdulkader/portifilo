// ==========================
// Portfolio Website - Enhanced Version
// ==========================

// Configuration
const CONFIG = {
  apiCheckTimeout: 5000,
  maxParticles: 50,
  scrollThreshold: 50,
  mobileBreakpoint: 768,
  particleCount: 60,
  animationDuration: { min: 25, max: 40 }
};

// State Management
const APP_STATE = {
  isMobileMenuOpen: false,
  isBackendConnected: false,
  activeTheme: 'dark',
  activeFilter: 'all',
  particlesEnabled: true,
  mouseTrailEnabled: false,
  initialized: false
};

// DOM Elements
const DOM = {
  navbar: document.getElementById("navbar"),
  menuToggle: document.getElementById("menuToggle"),
  navMenu: document.getElementById("navMenu"),
  contactForm: document.getElementById("contactForm"),
  themeToggle: document.getElementById("themeToggle"),
  blogModal: document.getElementById("blogModal"),
  blogModal2: document.getElementById("blogModal2"),
  closeBlogModal: document.getElementById("closeBlogModal"),
  particlesContainer: document.getElementById("particles"),
  downloadCVBtn: document.getElementById("downloadCV"),
  filterButtons: document.querySelectorAll(".bt-n"),
  projectCards: document.querySelectorAll(".project-card"),
  blogToggles: document.querySelectorAll(".blog-toggle"),
  imageButtons: document.querySelectorAll(".image"),
  statValues: document.querySelectorAll(".stat-value")
};

// API Configuration
function getApiUrl() {
  // Check if backend URL is explicitly set
  if (window.BACKEND_URL) {
    return window.BACKEND_URL;
  }

  // Development environment
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:3000";
  }

  // For production - both frontend and backend on same domain
  const hostname = window.location.hostname;

  // Vercel deployment
  if (hostname.includes("vercel.app")) {
    return `https://${hostname}`;
  }

  // Render deployment
  if (hostname.includes("onrender.com")) {
    return `https://${hostname}`;
  }

  // Default to same origin
  return window.location.origin;
}

const API_URL = getApiUrl();

// ==========================
// Initialization
// ==========================
function initializeApp() {
  if (APP_STATE.initialized) return;

  console.log("%c🚀 Portfolio Initializing...", "font-size: 16px; font-weight: bold; color: #4F46E5;");

  // Load saved theme
  loadSavedTheme();

  // Ensure page is scrollable
  document.body.style.overflow = "";
  document.body.style.overflowX = "hidden";
  document.body.style.overflowY = "auto";

  // Initialize components
  initializeNavigation();
  initializeScrollEffects();
  initializeAnimations();
  initializeFormValidation();
  initializeParticleSystem();
  initializeEventListeners();

  // Test backend connection silently
  testBackendConnection().then(connected => {
    APP_STATE.isBackendConnected = connected;
  });

  // Load stats
  loadStats();

  APP_STATE.initialized = true;
  console.log("%c✅ Portfolio Initialized!", "font-size: 16px; font-weight: bold; color: #10B981;");

  // Developer message
  showDeveloperMessage();
}

// ==========================
// Navigation System
// ==========================
function initializeNavigation() {
  if (!DOM.menuToggle || !DOM.navMenu) return;

  // Initialize ARIA attributes
  DOM.menuToggle.setAttribute("aria-controls", "navMenu");
  DOM.menuToggle.setAttribute("aria-expanded", "false");
  DOM.navMenu.setAttribute("role", "menu");
  DOM.navMenu.setAttribute("aria-hidden", "true");

  // Mobile menu functions
  function openMobileMenu() {
    DOM.menuToggle.classList.add("active");
    DOM.navMenu.classList.add("active");
    DOM.menuToggle.setAttribute("aria-expanded", "true");
    DOM.navMenu.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    APP_STATE.isMobileMenuOpen = true;
  }

  function closeMobileMenu() {
    DOM.menuToggle.classList.remove("active");
    DOM.navMenu.classList.remove("active");
    DOM.menuToggle.setAttribute("aria-expanded", "false");
    DOM.navMenu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    APP_STATE.isMobileMenuOpen = false;
  }

  function toggleMobileMenu() {
    if (DOM.navMenu.classList.contains("active")) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  // Event listeners
  DOM.menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMobileMenu();
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!APP_STATE.isMobileMenuOpen) return;
    if (!DOM.navMenu.contains(e.target) && !DOM.menuToggle.contains(e.target)) {
      closeMobileMenu();
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && APP_STATE.isMobileMenuOpen) {
      closeMobileMenu();
    }
  });

  // Close on window resize (desktop view)
  window.addEventListener("resize", debounce(() => {
    if (window.innerWidth > CONFIG.mobileBreakpoint && APP_STATE.isMobileMenuOpen) {
      closeMobileMenu();
    }
  }, 250));

  // Close mobile menu when clicking on links
  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      if (APP_STATE.isMobileMenuOpen) {
        closeMobileMenu();
      }
    });
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth"
        });
      }
    });
  });
}

// ==========================
// Scroll Effects & Animations
// ==========================
function initializeScrollEffects() {
  let ticking = false;

  function handleScroll() {
    // Navbar scroll effect
    if (window.scrollY > CONFIG.scrollThreshold) {
      DOM.navbar?.classList.add("scrolled");
    } else {
      DOM.navbar?.classList.remove("scrolled");
    }

    // Parallax effect
    const blobs = document.querySelectorAll(".blob");
    if (blobs.length > 0) {
      const scrolled = window.pageYOffset;
      blobs.forEach((blob, index) => {
        const speed = 0.5 + index * 0.1;
        blob.style.transform = `translateY(${scrolled * speed}px)`;
      });
    }

    // Active navigation based on scroll
    updateActiveNavigation();
  }

  // Optimized scroll handler with requestAnimationFrame
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Initial call
  handleScroll();
}

function updateActiveNavigation() {
  const sections = document.querySelectorAll("section[id]");
  const scrollY = window.pageYOffset;

  sections.forEach((section) => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 100;
    const sectionId = section.getAttribute("id");

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      document.querySelectorAll(".nav-link").forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${sectionId}`) {
          link.classList.add("active");
        }
      });
    }
  });
}

function initializeAnimations() {
  // Intersection Observer for reveal animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe all animated elements
  const animatedElements = document.querySelectorAll(
    ".stat-card, .skill-card, .project-card, .testimonial-card, " +
    ".highlight-card, .service-card, .timeline-item, .blog-card, section"
  );

  animatedElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });

  // Stats counter animation
  if (DOM.statValues.length > 0) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.dataset.animated) {
            entry.target.dataset.animated = "true";
            animateCounter(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    DOM.statValues.forEach((stat) => statsObserver.observe(stat));
  }

  // Typing animation
  const typingElement = document.querySelector(".typing");
  if (typingElement) {
    startTypingAnimation(typingElement);
  }
}

function animateCounter(element) {
  const target = element.textContent;
  if (target === "∞") return;

  const numericTarget = parseInt(target);
  if (isNaN(numericTarget)) return;

  const duration = 2000;
  const increment = numericTarget / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= numericTarget) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current) + "+";
    }
  }, 16);
}

function startTypingAnimation(element) {
  const texts = [
    "Muktar Abdi",
    "Web Developer",
    "Software Engineer",
    "Coding Enthusiast"
  ];
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentText = texts[textIndex];
    element.textContent = isDeleting
      ? currentText.substring(0, charIndex - 1)
      : currentText.substring(0, charIndex + 1);

    charIndex += isDeleting ? -1 : 1;

    if (!isDeleting && charIndex === currentText.length) {
      isDeleting = true;
      setTimeout(type, 1500);
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      setTimeout(type, 500);
    } else {
      setTimeout(type, isDeleting ? 50 : 100);
    }
  }

  setTimeout(type, 1000);
}

// ==========================
// Form Handling
// ==========================
function initializeFormValidation() {
  if (!DOM.contactForm) return;

  // Real-time validation
  const formInputs = DOM.contactForm.querySelectorAll('input, textarea');
  formInputs.forEach(input => {
    input.addEventListener('blur', (e) => {
      const target = e.target;
      const isValid = target.checkValidity();

      if (target.value.trim() !== '') {
        target.classList.toggle('valid', isValid);
        target.classList.toggle('invalid', !isValid);
      }
    });
  });

  // Form submission
  DOM.contactForm.addEventListener("submit", handleFormSubmit);
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(DOM.contactForm);
  const data = Object.fromEntries(formData);

  // Client-side validation
  if (!validateFormData(data)) return;

  // Show loading state
  showLoading();
  const submitButton = DOM.contactForm.querySelector('button[type="submit"]');
  submitButton.classList.add("loading");
  submitButton.disabled = true;

  try {
    const response = await fetch(`${API_URL}/api/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        subject: data.subject || '',
        message: data.message
      })
    });

    let result;
    try {
      result = await response.json();
    } catch (error) {
      result = {
        success: false,
        message: 'Error processing server response'
      };
    }

    if (!response.ok) {
      throw new Error(result.message || `Server error (${response.status})`);
    }

    if (result.success) {
      showToast(result.message || "Message sent successfully!", "success");
      DOM.contactForm.reset();

      DOM.contactForm.classList.add("animate__animated", "animate__pulse");
      setTimeout(() => {
        DOM.contactForm.classList.remove("animate__animated", "animate__pulse");
      }, 1000);
    } else {
      showToast(result.message || "Failed to send message", "error");
    }

  } catch (error) {
    // Save form data locally when offline
    saveFormDataLocally(data);
    showToast('Message saved locally!', 'success');
    DOM.contactForm.reset();

    DOM.contactForm.classList.add("animate__animated", "animate__pulse");
    setTimeout(() => {
      DOM.contactForm.classList.remove("animate__animated", "animate__pulse");
    }, 1000);

  } finally {
    hideLoading();
    submitButton.classList.remove("loading");
    submitButton.disabled = false;
  }
}

function validateFormData(data) {
  const { name, email, message } = data;

  if (!name || !email || !message) {
    showToast("Please fill in all fields", "error");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast("Please enter a valid email address", "error");
    return false;
  }

  return true;
}

// ==========================
// Particle System
// ==========================
function initializeParticleSystem() {
  if (!APP_STATE.particlesEnabled || !DOM.particlesContainer) return;

  // Clear existing particles
  DOM.particlesContainer.innerHTML = "";

  // Create background particles
  for (let i = 0; i < CONFIG.particleCount; i++) {
    createBackgroundParticle();
  }

  // Mouse trail particles (optional)
  if (APP_STATE.mouseTrailEnabled) {
    setupMouseTrailParticles();
  }
}

function createBackgroundParticle() {
  const particle = document.createElement("div");
  particle.classList.add("particle");

  // Random position
  particle.style.left = `${Math.random() * 100}%`;
  particle.style.top = `${Math.random() * 100}%`;

  // Tiny particles
  const size = Math.random() * 3 + 2;
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;

  // Random animation
  particle.style.animationDelay = `${Math.random() * -30}s`;
  particle.style.animationDuration = `${CONFIG.animationDuration.min + Math.random() * (CONFIG.animationDuration.max - CONFIG.animationDuration.min)}s`;

  DOM.particlesContainer.appendChild(particle);
}

function setupMouseTrailParticles() {
  let particles = [];

  document.addEventListener("mousemove", (e) => {
    if (Math.random() > 0.7 && particles.length < CONFIG.maxParticles) {
      const particle = createMouseTrailParticle(e.clientX, e.clientY);
      particles.push(particle);

      // Limit particles
      if (particles.length > CONFIG.maxParticles) {
        const oldest = particles.shift();
        oldest.remove();
      }
    }
  });
}

function createMouseTrailParticle(x, y) {
  const particle = document.createElement("div");
  const size = Math.random() * 6 + 4;

  particle.style.position = "fixed";
  particle.style.left = x + "px";
  particle.style.top = y + "px";
  particle.style.width = size + "px";
  particle.style.height = size + "px";
  particle.style.background = `radial-gradient(circle, #4F46E5, #7C3AED)`;
  particle.style.borderRadius = "50%";
  particle.style.pointerEvents = "none";
  particle.style.zIndex = "9999";
  particle.style.opacity = "0.8";
  particle.style.filter = "blur(2px)";
  particle.style.transform = `translate(0, 0) scale(1)`;
  particle.style.transition = "all 1s ease-out";

  document.body.appendChild(particle);

  // Animate
  setTimeout(() => {
    const xMove = Math.random() * 120 - 60;
    const yMove = Math.random() * 120 - 60;
    const scale = Math.random() * 1.5 + 0.5;

    particle.style.transform = `translate(${xMove}px, ${yMove}px) scale(${scale})`;
    particle.style.opacity = "0";
  }, 10);

  // Remove after animation
  setTimeout(() => particle.remove(), 1000);

  return particle;
}

// ==========================
// Theme System
// ==========================
function loadSavedTheme() {
  const savedTheme = localStorage.getItem("portfolioTheme");
  const themes = ["light", "dark"];

  if (savedTheme && themes.includes(savedTheme)) {
    document.body.classList.add(savedTheme);
    APP_STATE.activeTheme = savedTheme;
  } else {
    document.body.classList.add("dark");
    APP_STATE.activeTheme = "dark";
  }
}

function initializeThemeToggle() {
  if (!DOM.themeToggle) return;

  const themes = ["light", "dark"];

  DOM.themeToggle.addEventListener("click", () => {
    // Remove current theme
    document.body.classList.remove(APP_STATE.activeTheme);

    // Switch to next theme
    const currentIndex = themes.indexOf(APP_STATE.activeTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    APP_STATE.activeTheme = themes[nextIndex];

    // Apply new theme
    document.body.classList.add(APP_STATE.activeTheme);
    localStorage.setItem("portfolioTheme", APP_STATE.activeTheme);

    // Animation
    DOM.themeToggle.style.transform = "rotate(360deg) scale(1.2)";
    setTimeout(() => {
      DOM.themeToggle.style.transform = "";
    }, 300);

    // Show notification
    showThemeToast(APP_STATE.activeTheme);

    // Close mobile menu if open
    if (APP_STATE.isMobileMenuOpen) {
      DOM.menuToggle.classList.remove("active");
      DOM.navMenu.classList.remove("active");
      document.body.style.overflow = "";
      APP_STATE.isMobileMenuOpen = false;
    }
  });
}

function showThemeToast(theme) {
  const themeNames = {
    light: "Light Theme ☀️",
    dark: "Dark Theme 🌙"
  };

  const toast = document.createElement("div");
  toast.className = "toast success show";
  toast.innerHTML = `
    <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
    </svg>
    <span>${themeNames[theme] || "Theme"} activated!</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// ==========================
// Project Filtering
// ==========================
function initializeProjectFilter() {
  if (!DOM.filterButtons.length || !DOM.projectCards.length) return;

  // Show frontend projects by default
  DOM.projectCards.forEach(project => {
    project.style.display = project.classList.contains("frontend") ? "block" : "none";
  });

  // Filter buttons
  DOM.filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const filterValue = button.getAttribute("data-filter");
      APP_STATE.activeFilter = filterValue;

      // Update project visibility
      DOM.projectCards.forEach(project => {
        if (filterValue === "all" || project.classList.contains(filterValue)) {
          project.style.display = "block";
        } else {
          project.style.display = "none";
        }
      });
    });
  });
}

// ==========================
// Modal Systems
// ==========================
function initializeModals() {
  // Blog Modal
  if (DOM.blogModal && DOM.closeBlogModal) {
    DOM.closeBlogModal.addEventListener("click", () => closeModal(DOM.blogModal));
    DOM.blogModal.addEventListener("click", (e) => {
      if (e.target === DOM.blogModal) closeModal(DOM.blogModal);
    });
  }

  // Image Modal
  if (DOM.blogModal2) {
    const closeBtn2 = DOM.blogModal2.querySelector(".close");
    if (closeBtn2) {
      closeBtn2.addEventListener("click", () => closeModal(DOM.blogModal2));
    }

    DOM.blogModal2.addEventListener("click", (e) => {
      if (e.target === DOM.blogModal2) closeModal(DOM.blogModal2);
    });
  }

  // Image button handlers
  DOM.imageButtons?.forEach(button => {
    button.addEventListener("click", () => {
      const projectCard = button.closest(".project-card");
      const firstImage = projectCard?.querySelector(".project-image img");
      const modalImage2 = document.getElementById("modalImage2");

      if (firstImage && modalImage2 && DOM.blogModal2) {
        modalImage2.src = firstImage.src;
        openModal(DOM.blogModal2);
      }
    });
  });

  // Blog toggle handlers
  DOM.blogToggles?.forEach((toggle, index) => {
    toggle.addEventListener("click", () => {
      openBlogModal(index);
    });
  });

  // Escape key for all modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllModals();
    }
  });
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "auto";
}

function closeAllModals() {
  document.querySelectorAll(".modal").forEach(modal => {
    closeModal(modal);
  });
}

function openBlogModal(index) {
  const blogData = {
    0: {
      category: "Web Development",
      title: "Building Scalable Web Applications with Node.js",
      date: "Oct 5, 2025",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      content: `
        <h3>Introduction</h3>
        <p>Building scalable web applications is crucial in today's digital landscape.</p>
        <h3>Microservices Architecture</h3>
        <p>One of the key principles in building scalable applications...</p>
      `
    },
    1: {
      category: "AI & ML",
      title: "Introduction to Recommendation Systems with Python",
      date: "Sep 28, 2025",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      content: `<h3>What are Recommendation Systems?</h3><p>Recommendation systems are algorithms...</p>`
    },
    2: {
      category: "Cybersecurity",
      title: "Essential Web Security Practices for Developers",
      date: "Sep 15, 2025",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      content: `<h3>Understanding Web Vulnerabilities</h3><p>Web applications face numerous security threats...</p>`
    }
  };

  const data = blogData[index];
  if (data && DOM.blogModal) {
    document.getElementById("modalCategory").textContent = data.category;
    document.getElementById("modalTitle").textContent = data.title;
    document.getElementById("modalDate").textContent = data.date;
    document.getElementById("modalReadTime").textContent = data.readTime;
    document.getElementById("modalImage").src = data.image;
    document.getElementById("modalBody").innerHTML = data.content;

    openModal(DOM.blogModal);
  }
}

// ==========================
// Backend Connection
// ==========================
async function testBackendConnection() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.apiCheckTimeout);

    const response = await fetch(`${API_URL}/api/health`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

// ==========================
// Utility Functions
// ==========================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showToast(message, type = "success") {
  const existingToast = document.querySelector(".toast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const successIcon = `
    <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>`;

  const errorIcon = `
    <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>`;

  toast.innerHTML = `${type === "success" ? successIcon : errorIcon}<span>${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);

  if (type === "success") spawnConfetti(18);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 320);
  }, 5500);
}

function spawnConfetti(count = 12) {
  const colors = ["#FF6AB6", "#7C3AED", "#06B6D4", "#FFD166", "#60D394"];

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.background = colors[i % colors.length];
    const startX = window.innerWidth / 2 + (Math.random() * 240 - 120);
    const startY = window.innerHeight - 80;
    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;
    document.body.appendChild(el);

    const velocityX = (Math.random() - 0.5) * 600;
    const velocityY = -(200 + Math.random() * 600);
    const rotate = (Math.random() - 0.5) * 720;
    const duration = 1800 + Math.random() * 900;

    el.animate(
      [
        { transform: `translate(0,0) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${velocityX}px, ${velocityY}px) rotate(${rotate}deg)`, opacity: 1 },
        { transform: `translate(${velocityX * 1.4}px, ${velocityY * 1.8}px) rotate(${rotate * 1.2}deg)`, opacity: 0 }
      ],
      { duration, easing: "cubic-bezier(.2,.8,.2,1)" }
    );

    setTimeout(() => el.remove(), duration + 100);
  }
}

function showLoading() {
  let overlay = document.querySelector(".loading-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "loading-overlay";
    overlay.innerHTML = `<div class="spinner"></div><p>Sending your message...</p>`;
    document.body.appendChild(overlay);
  }
  setTimeout(() => overlay.classList.add("active"), 10);
}

function hideLoading() {
  const overlay = document.querySelector(".loading-overlay");
  if (overlay) {
    overlay.classList.remove("active");
    setTimeout(() => overlay.remove(), 300);
  }
}

// ==========================
// Hover Effects
// ==========================
function initializeHoverEffects() {
  // Project cards
  document.querySelectorAll(".project-card").forEach(card => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-8px)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0)";
    });
  });

  // Buttons
  document.querySelectorAll(".btn").forEach(button => {
    button.addEventListener("mouseenter", () => {
      button.style.transform = "scale(1.05)";
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "scale(1)";
    });
  });

  // Magnetic cursor effect
  document.querySelectorAll(".btn, .social-icon, .contact-social-icon").forEach(element => {
    element.addEventListener("mousemove", (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      element.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    element.addEventListener("mouseleave", () => {
      element.style.transform = "translate(0, 0)";
    });
  });
}

// ==========================
// Download CV
// ==========================
function initializeDownloadCV() {
  if (!DOM.downloadCVBtn) return;

  DOM.downloadCVBtn.addEventListener("click", function (e) {
    e.preventDefault();

    showToast("Opening CV in new tab...", "success");

    // Open CV in new tab
    setTimeout(() => {
      window.open("image/muktar abdulkader_cv.pdf", "_blank");
    }, 500);
  });
}

// ==========================
// Social Sharing
// ==========================
function initializeSocialSharing() {
  // Share functions
  window.shareOnTwitter = function () {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent("Check out this amazing portfolio by Muktar Abdulkader!");
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
  };

  window.shareOnLinkedIn = function () {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  window.shareOnFacebook = function () {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  window.shareOnTelegram = function () {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent("Check out this amazing portfolio! 🚀");
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
  };

  window.copyLink = function () {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => showToast("Link copied to clipboard! 📋", "success"))
      .catch(() => showToast("Failed to copy link", "error"));
  };
}

// ==========================
// Local Storage for Offline Forms
// ==========================
function saveFormDataLocally(data) {
  try {
    const savedForms = JSON.parse(localStorage.getItem('pendingForms') || '[]');

    savedForms.push({
      ...data,
      timestamp: new Date().toISOString(),
      id: Date.now()
    });

    localStorage.setItem('pendingForms', JSON.stringify(savedForms));

  } catch (error) {
    console.error('Error saving form locally:', error);
  }
}

// ==========================
// Load Stats
// ==========================
async function loadStats() {
  try {
    const response = await fetch(`${API_URL}/api/stats`);

    if (!response.ok) {
      throw new Error(`Failed to load stats: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      return data.stats;
    } else {
      return getStaticStats();
    }
  } catch (error) {
    return getStaticStats();
  }
}

function getStaticStats() {
  return {
    projectsCompleted: 15,
    yearsExperience: 3,
    happyClients: 10,
    cupsOfCoffee: "∞",
    messages: {
      total: 0,
      new: 0,
      sent: 0
    },
    technologies: [
      "HTML", "CSS", "JavaScript", "React",
      "Node.js", "PHP", "Python", "Kotlin",
    ],
  };
}

// ==========================
// Easter Egg & Fun Features
// ==========================
function initializeEasterEgg() {
  let konami = [];
  const konamiCode = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "b", "a"
  ];

  document.addEventListener("keydown", (e) => {
    konami.push(e.key);
    konami = konami.slice(-konamiCode.length);

    if (konami.join("") === konamiCode.join("")) {
      document.body.style.animation = "rainbow 2s linear infinite";
      showToast("🎮 Konami code activated! 🎉", "success");

      setTimeout(() => {
        document.body.style.animation = "";
      }, 5000);

      konami = [];
    }
  });

  // Add rainbow animation keyframes
  if (!document.querySelector('#rainbow-styles')) {
    const style = document.createElement('style');
    style.id = 'rainbow-styles';
    style.textContent = `
      @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

function showDeveloperMessage() {
  console.log(
    "%c👋 Hello Developer!",
    "font-size: 20px; font-weight: bold; color: #4F46E5;"
  );
  console.log(
    "%cThis portfolio is built with vanilla HTML, CSS, and JavaScript!",
    "font-size: 14px; color: #7C3AED;"
  );
}

// ==========================
// Event Listeners Setup
// ==========================
function initializeEventListeners() {
  // Window resize
  window.addEventListener("resize", debounce(() => {
    if (window.innerWidth > CONFIG.mobileBreakpoint && APP_STATE.isMobileMenuOpen) {
      DOM.menuToggle?.classList.remove("active");
      DOM.navMenu?.classList.remove("active");
      document.body.style.overflow = "";
      APP_STATE.isMobileMenuOpen = false;
    }
  }, 250));

  // Lazy loading for images
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
          }
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll("img[data-src]").forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// ==========================
// Main Initialization
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  initializeThemeToggle();
  initializeProjectFilter();
  initializeModals();
  initializeHoverEffects();
  initializeDownloadCV();
  initializeSocialSharing();
  initializeEasterEgg();
});

// Make functions available globally for HTML onclick attributes
window.toggleMobileMenu = function () {
  if (!DOM.menuToggle || !DOM.navMenu) return;

  if (DOM.navMenu.classList.contains("active")) {
    DOM.menuToggle.classList.remove("active");
    DOM.navMenu.classList.remove("active");
    document.body.style.overflow = "";
    APP_STATE.isMobileMenuOpen = false;
  } else {
    DOM.menuToggle.classList.add("active");
    DOM.navMenu.classList.add("active");
    document.body.style.overflow = "hidden";
    APP_STATE.isMobileMenuOpen = true;
  }
};

// ==========================
// AI-POWERED FEATURES
// ==========================

// Load AI Chat and Features
function loadAIFeatures() {
  // Create script elements for AI features
  const aiChatScript = document.createElement('script');
  aiChatScript.src = 'ai-chat.js';
  aiChatScript.async = true;
  document.head.appendChild(aiChatScript);

  const aiFeaturesScript = document.createElement('script');
  aiFeaturesScript.src = 'ai-features.js';
  aiFeaturesScript.async = true;
  document.head.appendChild(aiFeaturesScript);

  console.log('🤖 AI features loaded successfully');
}

// AI-Powered Content Recommendations
class AIContentRecommendations {
  constructor() {
    this.userInteractions = JSON.parse(localStorage.getItem('userInteractions')) || {};
    this.recommendations = [];
    this.init();
  }

  init() {
    this.trackInteractions();
    this.generateRecommendations();
    this.displayRecommendations();
  }

  trackInteractions() {
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      maxScroll = Math.max(maxScroll, scrollPercent);
      this.userInteractions.maxScroll = maxScroll;
      this.saveInteractions();
    });

    // Track section time
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          this.userInteractions.sectionTime = this.userInteractions.sectionTime || {};
          this.userInteractions.sectionTime[sectionId] = Date.now();
        }
      });
    });

    sections.forEach(section => observer.observe(section));

    // Track clicks
    document.addEventListener('click', (e) => {
      const element = e.target;
      const clickData = {
        tag: element.tagName,
        class: element.className,
        text: element.textContent?.substring(0, 30),
        timestamp: Date.now()
      };

      this.userInteractions.clicks = this.userInteractions.clicks || [];
      this.userInteractions.clicks.push(clickData);
      
      // Keep only last 50 clicks
      if (this.userInteractions.clicks.length > 50) {
        this.userInteractions.clicks = this.userInteractions.clicks.slice(-50);
      }
      
      this.saveInteractions();
    });
  }

  generateRecommendations() {
    const interests = this.analyzeInterests();
    this.recommendations = [];

    // AI/ML interest
    if (interests.ai > 0.3) {
      this.recommendations.push({
        type: 'project',
        title: 'AI Recommender System',
        description: 'Explore the intelligent recommendation engine built with Python and TensorFlow',
        action: 'View AI Projects',
        link: '#projects',
        confidence: Math.round(interests.ai * 100)
      });
    }

    // Technical skills interest
    if (interests.technical > 0.4) {
      this.recommendations.push({
        type: 'skills',
        title: 'Technical Expertise',
        description: 'Dive deep into the technical skills and frameworks mastered',
        action: 'Explore Skills',
        link: '#skills',
        confidence: Math.round(interests.technical * 100)
      });
    }

    // Contact interest
    if (interests.contact > 0.2 || this.userInteractions.maxScroll > 80) {
      this.recommendations.push({
        type: 'contact',
        title: 'Ready to Connect?',
        description: 'Start a conversation about your next project',
        action: 'Get in Touch',
        link: '#contact',
        confidence: 85
      });
    }
  }

  analyzeInterests() {
    const clicks = this.userInteractions.clicks || [];
    const sectionTime = this.userInteractions.sectionTime || {};
    
    return {
      ai: this.calculateInterest(clicks, ['ai', 'ml', 'intelligent', 'smart']) + 
          (sectionTime.projects ? 0.2 : 0),
      technical: this.calculateInterest(clicks, ['skill', 'tech', 'code', 'development']) + 
                 (sectionTime.skills ? 0.3 : 0),
      contact: this.calculateInterest(clicks, ['contact', 'hire', 'email']) + 
               (sectionTime.contact ? 0.4 : 0)
    };
  }

  calculateInterest(clicks, keywords) {
    const relevantClicks = clicks.filter(click => 
      keywords.some(keyword => 
        click.text?.toLowerCase().includes(keyword) || 
        click.class?.toLowerCase().includes(keyword)
      )
    );
    return Math.min(relevantClicks.length / 10, 1);
  }

  displayRecommendations() {
    if (this.recommendations.length === 0) return;

    const container = document.createElement('div');
    container.className = 'ai-recommendations-banner';
    container.innerHTML = `
      <div class="ai-rec-content">
        <div class="ai-rec-header">
          <span class="ai-badge">🤖 AI</span>
          <h3>Personalized for You</h3>
        </div>
        <div class="ai-rec-items">
          ${this.recommendations.slice(0, 2).map(rec => `
            <div class="ai-rec-item" data-link="${rec.link}">
              <div class="ai-rec-text">
                <strong>${rec.title}</strong>
                <p>${rec.description}</p>
              </div>
              <button class="ai-rec-btn">${rec.action}</button>
            </div>
          `).join('')}
        </div>
        <button class="ai-rec-close">×</button>
      </div>
    `;

    document.body.appendChild(container);

    // Add event listeners
    container.querySelectorAll('.ai-rec-item').forEach(item => {
      item.addEventListener('click', () => {
        const link = item.dataset.link;
        document.querySelector(link)?.scrollIntoView({ behavior: 'smooth' });
        container.remove();
      });
    });

    container.querySelector('.ai-rec-close').addEventListener('click', () => {
      container.remove();
    });

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (container.parentNode) {
        container.remove();
      }
    }, 10000);
  }

  saveInteractions() {
    localStorage.setItem('userInteractions', JSON.stringify(this.userInteractions));
  }
}

// AI-Powered Smart Navigation
class SmartNavigation {
  constructor() {
    this.navigationPatterns = JSON.parse(localStorage.getItem('navigationPatterns')) || {};
    this.init();
  }

  init() {
    this.addSmartSuggestions();
    this.optimizeNavigation();
  }

  addSmartSuggestions() {
    const nav = document.querySelector('.nav-menu');
    if (!nav) return;

    // Add smart navigation hints
    const smartHints = document.createElement('div');
    smartHints.className = 'smart-nav-hints';
    smartHints.innerHTML = `
      <div class="smart-hint" id="smart-hint">
        <span class="hint-icon">💡</span>
        <span class="hint-text">Try using Ctrl+K to search!</span>
      </div>
    `;

    nav.appendChild(smartHints);

    // Show hint occasionally
    if (Math.random() > 0.7) {
      setTimeout(() => {
        const hint = document.getElementById('smart-hint');
        if (hint) {
          hint.style.display = 'flex';
          setTimeout(() => {
            hint.style.display = 'none';
          }, 3000);
        }
      }, 5000);
    }
  }

  optimizeNavigation() {
    // Track most visited sections
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        const section = link.getAttribute('href').replace('#', '');
        this.navigationPatterns[section] = (this.navigationPatterns[section] || 0) + 1;
        localStorage.setItem('navigationPatterns', JSON.stringify(this.navigationPatterns));
      });
    });

    // Highlight popular sections
    this.highlightPopularSections();
  }

  highlightPopularSections() {
    const sortedSections = Object.entries(this.navigationPatterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2);

    sortedSections.forEach(([section]) => {
      const link = document.querySelector(`[href="#${section}"]`);
      if (link) {
        link.classList.add('popular-section');
      }
    });
  }
}

// AI-Enhanced Contact Form
class AIContactForm {
  constructor() {
    this.suggestions = {
      'web development': 'I\'m interested in web development services',
      'mobile app': 'I need help with mobile app development',
      'ai project': 'I have an AI/ML project in mind',
      'freelance': 'I\'m looking for freelance development work',
      'consultation': 'I need technical consultation'
    };
    this.init();
  }

  init() {
    const messageField = document.querySelector('#message');
    if (!messageField) return;

    this.addSmartSuggestions(messageField);
    this.addAutoComplete(messageField);
  }

  addSmartSuggestions(messageField) {
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'ai-message-suggestions';
    suggestionsContainer.innerHTML = `
      <p>💡 Quick message templates:</p>
      <div class="suggestion-chips">
        ${Object.keys(this.suggestions).map(key => `
          <button class="suggestion-chip" data-template="${key}">${key}</button>
        `).join('')}
      </div>
    `;

    messageField.parentNode.insertBefore(suggestionsContainer, messageField.nextSibling);

    // Add click handlers
    suggestionsContainer.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        const template = chip.dataset.template;
        messageField.value = this.suggestions[template];
        messageField.focus();
      });
    });
  }

  addAutoComplete(messageField) {
    let timeout;
    messageField.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.analyzeMessage(messageField.value);
      }, 500);
    });
  }

  analyzeMessage(message) {
    const lowerMessage = message.toLowerCase();
    let suggestion = '';

    if (lowerMessage.includes('web') && lowerMessage.includes('site')) {
      suggestion = 'It sounds like you need web development services. I can help with modern, responsive websites!';
    } else if (lowerMessage.includes('mobile') || lowerMessage.includes('app')) {
      suggestion = 'Mobile app development is one of my specialties. I work with Android and cross-platform solutions.';
    } else if (lowerMessage.includes('ai') || lowerMessage.includes('machine learning')) {
      suggestion = 'AI and ML projects are exciting! I have experience with Python, TensorFlow, and intelligent systems.';
    }

    if (suggestion) {
      this.showSuggestion(suggestion);
    }
  }

  showSuggestion(suggestion) {
    // Remove existing suggestion
    const existing = document.querySelector('.ai-form-suggestion');
    if (existing) existing.remove();

    const suggestionDiv = document.createElement('div');
    suggestionDiv.className = 'ai-form-suggestion';
    suggestionDiv.innerHTML = `
      <div class="suggestion-content">
        <span class="suggestion-icon">🤖</span>
        <p>${suggestion}</p>
        <button class="suggestion-dismiss">×</button>
      </div>
    `;

    const form = document.querySelector('#contactForm');
    if (form) {
      form.appendChild(suggestionDiv);

      suggestionDiv.querySelector('.suggestion-dismiss').addEventListener('click', () => {
        suggestionDiv.remove();
      });

      // Auto-hide after 8 seconds
      setTimeout(() => {
        if (suggestionDiv.parentNode) {
          suggestionDiv.remove();
        }
      }, 8000);
    }
  }
}

// Initialize AI Features
function initializeAI() {
  console.log('🤖 Initializing AI features...');
  
  // Load external AI scripts
  loadAIFeatures();
  
  // Initialize AI components
  new AIContentRecommendations();
  new SmartNavigation();
  new AIContactForm();
  
  console.log('✅ AI features initialized successfully');
}

// Add AI styles
const aiStyles = `
<style>
/* AI Recommendations Banner */
.ai-recommendations-banner {
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  z-index: 999;
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.ai-rec-content {
  position: relative;
}

.ai-rec-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.ai-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.ai-rec-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.ai-rec-items {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.ai-rec-item {
  flex: 1;
  min-width: 250px;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-rec-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.ai-rec-text strong {
  display: block;
  margin-bottom: 5px;
}

.ai-rec-text p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.ai-rec-btn {
  background: white;
  color: #667eea;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ai-rec-btn:hover {
  transform: scale(1.05);
}

.ai-rec-close {
  position: absolute;
  top: -5px;
  right: -5px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Smart Navigation Hints */
.smart-nav-hints {
  position: relative;
}

.smart-hint {
  position: absolute;
  top: 100%;
  right: 0;
  background: #333;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
  display: none;
  align-items: center;
  gap: 5px;
  z-index: 1000;
}

.smart-hint::before {
  content: '';
  position: absolute;
  top: -5px;
  right: 20px;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid #333;
}

.popular-section {
  position: relative;
}

.popular-section::after {
  content: '🔥';
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 12px;
}

/* AI Message Suggestions */
.ai-message-suggestions {
  margin: 10px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e9ecef;
}

.ai-message-suggestions p {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
}

.suggestion-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.suggestion-chip {
  background: #e9ecef;
  border: none;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #495057;
}

.suggestion-chip:hover {
  background: #667eea;
  color: white;
  transform: translateY(-1px);
}

/* AI Form Suggestions */
.ai-form-suggestion {
  margin-top: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px;
  border-radius: 10px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.suggestion-content {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.suggestion-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.suggestion-content p {
  margin: 0;
  flex: 1;
  line-height: 1.4;
}

.suggestion-dismiss {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  margin-left: auto;
  flex-shrink: 0;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .ai-recommendations-banner {
    left: 10px;
    right: 10px;
    padding: 15px;
  }
  
  .ai-rec-items {
    flex-direction: column;
  }
  
  .ai-rec-item {
    min-width: auto;
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  
  .suggestion-chips {
    justify-content: center;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .ai-message-suggestions {
    background: #2d2d2d;
    border-color: #444;
    color: white;
  }
  
  .ai-message-suggestions p {
    color: #ccc;
  }
  
  .suggestion-chip {
    background: #444;
    color: #ccc;
  }
  
  .suggestion-chip:hover {
    background: #667eea;
    color: white;
  }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', aiStyles);

// Initialize AI when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAI);
} else {
  initializeAI();
}