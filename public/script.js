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
  activeTheme: 'blue',
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

// API Configuration - FIXED VERSION
function getApiUrl() {
  // Check if backend URL is explicitly set
  if (window.BACKEND_URL) {
    return window.BACKEND_URL;
  }

  // Development environment
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:3000";  // Backend runs on port 3000
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

  // Heroku deployment
  if (hostname.includes("herokuapp.com")) {
    return `https://${hostname}`;
  }

  // Netlify deployment (need separate backend)
  if (hostname.includes("netlify.app")) {
    // You need to set window.BACKEND_URL in your HTML for Netlify
    console.warn("Backend URL not set for Netlify. Please add: <script>window.BACKEND_URL = 'https://your-backend-url.com';</script>");
    return window.location.origin;
  }

  // Default to same origin
  return window.location.origin;
}

const API_URL = getApiUrl();

// Debug: Log API configuration
console.log("🌐 API Configuration:");
console.log("API_URL:", API_URL);
console.log("Frontend Host:", window.location.hostname);
console.log("Full Frontend URL:", window.location.href);

// ==========================
// Initialization
// ==========================
function initializeApp() {
  if (APP_STATE.initialized) return;

  console.log("%c🚀 Portfolio Initializing...", "font-size: 16px; font-weight: bold; color: #4F46E5;");

  // Load saved theme
  loadSavedTheme();

  // Initialize components
  initializeNavigation();
  initializeScrollEffects();
  initializeAnimations();
  initializeFormValidation();
  initializeParticleSystem();
  initializeEventListeners();

  // Test backend connection
  testBackendConnection().then(connected => {
    APP_STATE.isBackendConnected = connected;
    if (!connected) showBackendWarning();
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

    // Floating CTA visibility
    updateFloatingCTA();
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
// Form Handling - FIXED VERSION
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
    console.log("📤 Sending contact form to:", `${API_URL}/api/contact`);
    console.log("Data being sent:", {
      name: data.name,
      email: data.email,
      subject: data.subject || '',
      message: data.message
    });

    // FIXED: Using correct API endpoint
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
      console.log("📥 Server response:", result);
    } catch (error) {
      console.error('❌ Error parsing JSON response:', error);
      result = {
        success: false,
        message: 'Error processing server response'
      };
    }

    if (!response.ok) {
      throw new Error(result.message || `Server error (${response.status})`);
    }

    if (result.success) {
      // Success
      showToast(result.message || "Message sent successfully!", "success");
      DOM.contactForm.reset();

      // Success animation
      DOM.contactForm.classList.add("animate__animated", "animate__pulse");
      setTimeout(() => {
        DOM.contactForm.classList.remove("animate__animated", "animate__pulse");
      }, 1000);

      // Log success
      console.log("✅ Message sent successfully. Message ID:", result.data?.id);
    } else {
      // Server returned success: false
      showToast(result.message || "Failed to send message", "error");
    }

  } catch (error) {
    console.error('❌ Form submission error:', error);
    showToast(error.message || 'Failed to send message. Please try again later.', 'error');
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
  const themes = ["blue", "black"];

  if (savedTheme && themes.includes(savedTheme)) {
    document.body.classList.add(savedTheme);
    APP_STATE.activeTheme = savedTheme;
  } else {
    document.body.classList.add("blue");
    APP_STATE.activeTheme = "blue";
  }
}

function initializeThemeToggle() {
  if (!DOM.themeToggle) return;

  const themes = ["blue", "black"];

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
    blue: "Ocean Blue Theme",
    black: "Dark Theme"
  };

  const toast = document.createElement("div");
  toast.className = "toast success show";
  toast.innerHTML = `
    <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
    </svg>
    <span>${themeNames[theme] || "Theme"} activated! 🎨</span>
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

      // Update active button (optional)
      // DOM.filterButtons.forEach(btn => btn.classList.remove("active"));
      // button.classList.add("active");
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
// Floating CTA
// ==========================
function initializeFloatingCTA() {
  if (document.querySelector(".floating-cta") || localStorage.getItem("ctaDismissed") === "1") return;

  const cta = document.createElement("a");
  cta.href = "#contact";
  cta.className = "floating-cta pulse-glow hide";
  cta.setAttribute("aria-label", "Call Muktar");
  cta.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.07-8.63A2 2 0 0 1 4.09 2h3a2 2 0 0 1 2 1.72c.12 1.21.38 2.39.76 3.5a2 2 0 0 1-.45 2.11L8.91 11.09a16 16 0 0 0 6 6l1.76-1.8a2 2 0 0 1 2.11-.45c1.11.38 2.29.64 3.5.76A2 2 0 0 1 22 16.92z"/>
    </svg>
  `;

  cta.addEventListener("click", openContactModal);
  document.body.appendChild(cta);

  // Intersection Observer for contact section
  const contactSection = document.getElementById("contact");
  if (contactSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            cta.classList.add("hide");
          } else if (window.scrollY > 120) {
            cta.classList.remove("hide");
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(contactSection);
  }
}

function updateFloatingCTA() {
  const cta = document.querySelector(".floating-cta");
  if (!cta) return;

  if (window.scrollY < 120) {
    cta.classList.add("hide");
  } else {
    const contactSection = document.getElementById("contact");
    if (!contactSection) {
      cta.classList.remove("hide");
    }
  }
}

function openContactModal() {
  if (document.querySelector(".contact-modal-overlay")) return;

  const overlay = document.createElement("div");
  overlay.className = "contact-modal-overlay";

  const modal = document.createElement("div");
  modal.className = "contact-modal";

  const title = document.createElement("h3");
  title.textContent = "Contact Muktar";

  const nameItem = document.createElement("div");
  nameItem.className = "contact-item";
  nameItem.innerHTML = `<strong>Name</strong><span>Muktar</span>`;

  const phoneNumber = "+251916662982";
  const tgLink = "https://t.me/MuktiAbdu";

  const actions = document.createElement("div");
  actions.className = "contact-actions";

  const callAnchor = document.createElement("a");
  callAnchor.className = "call";
  callAnchor.href = `tel:${phoneNumber}`;
  callAnchor.textContent = "Call";

  const tgAnchor = document.createElement("a");
  tgAnchor.className = "tg";
  tgAnchor.href = tgLink;
  tgAnchor.target = "_blank";
  tgAnchor.rel = "noopener noreferrer";
  tgAnchor.textContent = "Open Telegram";

  const copyBtn = document.createElement("button");
  copyBtn.className = "copy";
  copyBtn.textContent = "Copy Number";
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      showToast("Phone number copied to clipboard", "success");
    } catch (err) {
      showToast("Copy failed. Please copy manually.", "error");
    }
  });

  const closeBtn = document.createElement("button");
  closeBtn.className = "modal-close";
  closeBtn.innerHTML = "&times;";
  closeBtn.addEventListener("click", () => {
    overlay.classList.remove("show");
    setTimeout(() => overlay.remove(), 200);
  });

  actions.appendChild(callAnchor);
  actions.appendChild(tgAnchor);
  actions.appendChild(copyBtn);

  modal.appendChild(closeBtn);
  modal.appendChild(title);
  modal.appendChild(nameItem);
  modal.appendChild(actions);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => overlay.classList.add("show"));

  overlay.addEventListener("click", (ev) => {
    if (ev.target === overlay) {
      overlay.classList.remove("show");
      setTimeout(() => overlay.remove(), 200);
    }
  });

  function onKey(e) {
    if (e.key === "Escape") {
      overlay.classList.remove("show");
      document.removeEventListener("keydown", onKey);
      setTimeout(() => overlay.remove(), 200);
    }
  }

  document.addEventListener("keydown", onKey);
}

// ==========================
// Backend Connection - FIXED VERSION
// ==========================
async function testBackendConnection() {
  try {
    console.log("🔍 Testing backend connection to:", `${API_URL}/api/health`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.apiCheckTimeout);

    const response = await fetch(`${API_URL}/api/health`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Backend connection successful:", data);
      return true;
    } else {
      console.error("❌ Backend connection failed:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ Backend connection error:", error.message);
    return false;
  }
}

function showBackendWarning() {
  const contactSection = document.querySelector("#contact");
  if (!contactSection) return;

  const warning = document.createElement("div");
  warning.className = "backend-warning";
  warning.innerHTML = `
    <p>⚠️ Backend server connection failed.</p>
    <small>Running in offline mode. Contact form submissions will be saved locally.</small>
  `;

  contactSection.prepend(warning);

  // Auto-remove after 10 seconds
  setTimeout(() => {
    warning.style.opacity = "0";
    setTimeout(() => warning.remove(), 300);
  }, 10000);
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
      window.open("image/MUKTAR-ABDULKADER.pdf", "_blank");
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

      konami = []; // Reset
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
  console.log(
    "%cAPI Endpoints:",
    "font-size: 14px; font-weight: bold; color: #7C3AED;"
  );
  console.log(
    "%c  GET  /api/health    - Health check",
    "font-size: 12px; color: #666;"
  );
  console.log(
    "%c  GET  /api/stats     - Portfolio statistics",
    "font-size: 12px; color: #666;"
  );
  console.log(
    "%c  GET  /api/projects  - Projects list",
    "font-size: 12px; color: #666;"
  );
  console.log(
    "%c  POST /api/contact   - Contact form",
    "font-size: 12px; color: #666;"
  );
  console.log(
    "%c  POST /api/subscribe - Newsletter",
    "font-size: 12px; color: #666;"
  );
  console.log(
    "%cCurrent API URL: " + API_URL,
    "font-size: 12px; color: #666; font-weight: bold;"
  );
}

// ==========================
// Load Stats from Backend - FIXED VERSION
// ==========================
async function loadStats() {
  try {
    console.log("📊 Loading portfolio stats from:", `${API_URL}/api/stats`);
    const response = await fetch(`${API_URL}/api/stats`);

    if (!response.ok) {
      throw new Error(`Failed to load stats: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      console.log("✅ Portfolio stats loaded:", data.stats);
      // You can update the UI with these stats if needed
      return data.stats;
    } else {
      console.log("⚠️ Using static stats (server returned success: false)");
      return getStaticStats();
    }
  } catch (error) {
    console.log("❌ Using static stats (fetch failed):", error.message);
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
// Service Worker for Offline Support
// ==========================
function registerServiceWorker() {
  if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }
}

// ==========================
// Test API Connection Function
// ==========================
async function testAPIConnection() {
  console.log("🧪 Testing all API endpoints...");

  const endpoints = [
    '/api/health',
    '/api/stats',
    '/api/projects'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`);
      console.log(`${endpoint}: ${response.ok ? '✅ OK' : '❌ Failed'} (${response.status})`);
    } catch (error) {
      console.log(`${endpoint}: ❌ Error - ${error.message}`);
    }
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
  initializeFloatingCTA();
  initializeHoverEffects();
  initializeDownloadCV();
  initializeSocialSharing();
  initializeEasterEgg();
  registerServiceWorker();

  // Optional: Test API connection
  // setTimeout(() => testAPIConnection(), 2000);
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

// Export for debugging
if (window) {
  window.portfolioAPI = {
    url: API_URL,
    testConnection: testBackendConnection,
    loadStats: loadStats,
    submitForm: handleFormSubmit
  };
}