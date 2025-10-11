// Navigation Scroll Effect
const navbar = document.getElementById("navbar");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Mobile Menu Toggle - improved accessibility and behavior
function openMobileMenu() {
  if (!menuToggle || !navMenu) return;
  menuToggle.classList.add("active");
  navMenu.classList.add("active");
  menuToggle.setAttribute("aria-expanded", "true");
  navMenu.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden"; // lock body scroll
}

function closeMobileMenu() {
  if (!menuToggle || !navMenu) return;
  menuToggle.classList.remove("active");
  navMenu.classList.remove("active");
  menuToggle.setAttribute("aria-expanded", "false");
  navMenu.setAttribute("aria-hidden", "true");
  document.body.style.overflow = ""; // restore scroll
}

function toggleMobileMenu() {
  if (!menuToggle || !navMenu) return;
  if (navMenu.classList.contains("active")) closeMobileMenu();
  else openMobileMenu();
}

if (menuToggle) {
  // initialize aria attributes
  menuToggle.setAttribute("aria-controls", "navMenu");
  menuToggle.setAttribute(
    "aria-expanded",
    navMenu && navMenu.classList.contains("active") ? "true" : "false"
  );
}

if (navMenu) {
  navMenu.setAttribute("role", "menu");
  navMenu.setAttribute(
    "aria-hidden",
    navMenu.classList.contains("active") ? "false" : "true"
  );
}

if (menuToggle) {
  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMobileMenu();
  });

  // Close menu when clicking outside the menu
  document.addEventListener("click", (e) => {
    if (!navMenu || !menuToggle) return;
    if (!navMenu.classList.contains("active")) return;
    const target = e.target;
    if (!navMenu.contains(target) && !menuToggle.contains(target)) {
      closeMobileMenu();
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || e.key === "Esc") {
      if (navMenu && navMenu.classList.contains("active")) closeMobileMenu();
    }
  });

  // Ensure menu resets on resize (desktop -> mobile toggles)
  window.addEventListener("resize", () => {
    try {
      if (window.innerWidth > 768 && navMenu.classList.contains("active")) {
        // close mobile menu when switching to desktop view
        closeMobileMenu();
      }
    } catch (err) {
      // noop
    }
  });
}

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.classList.remove("active");
    navMenu.classList.remove("active");
    document.body.style.overflow = ""; // Restore body scroll
  });
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      const offsetTop = target.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  });
});

// Particle container reference (particles created at the end of script)
const particlesContainer = document.getElementById("particles");

// Scroll Reveal Animation
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Observe all cards and sections
const animatedElements = document.querySelectorAll(
  ".stat-card, .skill-card, .project-card, .testimonial-card, .highlight-card"
);
animatedElements.forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(20px)";
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  observer.observe(el);
});

// Contact Form Handling with Backend Integration
const contactForm = document.getElementById("contactForm");

// API URL Configuration
// Check if we're running locally or on a deployed server
function getApiUrl() {
  // Check if window.API_URL is set (from index.html script)
  if (window.API_URL) {
    return window.API_URL;
  }

  // Check if we're running on localhost (development)
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return "http://localhost:3000";
  }

  // For production deployment, try to detect the backend URL
  // This handles common deployment scenarios
  const hostname = window.location.hostname;

  // If deployed on the same domain but different port
  if (hostname.includes("render.com")) {
    return "https://portifilo.onrender.com";
  }

  // If deployed on Heroku
  if (hostname.includes("herokuapp.com")) {
    return `https://${hostname}`;
  }

  // If deployed on Netlify/Vercel (frontend) with separate backend
  if (hostname.includes("netlify.app") || hostname.includes("vercel.app")) {
    // You need to set this to your actual backend URL
    return "https://your-backend-url.com";
  }

  // Default fallback - use same origin
  return window.location.origin;
}

const API_URL = getApiUrl();

// Debug logging for deployment troubleshooting
console.log("🌐 API Configuration:");
console.log("📍 Current URL:", window.location.href);
console.log("🔗 API URL:", API_URL);
console.log("🏠 Hostname:", window.location.hostname);

if (!contactForm) {
  console.warn(
    "contactForm element not found on this page. Contact handler disabled."
  );
}

// Toast notification function
function showToast(message, type = "success") {
  // Remove existing toast if any
  const existingToast = document.querySelector(".toast");
  if (existingToast) existingToast.remove();

  // Create new toast
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

  toast.innerHTML = `${
    type === "success" ? successIcon : errorIcon
  }<span>${message}</span>`;
  document.body.appendChild(toast);

  // Show toast
  setTimeout(() => toast.classList.add("show"), 100);

  // spawn confetti for success
  if (type === "success") spawnConfetti(18);

  // Hide and remove toast after 5.5 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 320);
  }, 5500);
}

// simple confetti implementation
function spawnConfetti(count = 12) {
  const colors = ["#FF6AB6", "#7C3AED", "#06B6D4", "#FFD166", "#60D394"];
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.background = colors[i % colors.length];
    // start near center-bottom (above toast)
    const startX = window.innerWidth / 2 + (Math.random() * 240 - 120);
    const startY = window.innerHeight - 80;
    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;
    document.body.appendChild(el);

    // random velocity and rotation
    const velocityX = (Math.random() - 0.5) * 600; // px/s
    const velocityY = -(200 + Math.random() * 600); // upward
    const rotate = (Math.random() - 0.5) * 720;
    const duration = 1800 + Math.random() * 900;

    el.animate(
      [
        { transform: `translate(0,0) rotate(0deg)`, opacity: 1 },
        {
          transform: `translate(${velocityX}px, ${velocityY}px) rotate(${rotate}deg)`,
          opacity: 1,
        },
        {
          transform: `translate(${velocityX * 1.4}px, ${
            velocityY * 1.8
          }px) rotate(${rotate * 1.2}deg)`,
          opacity: 0,
        },
      ],
      { duration, easing: "cubic-bezier(.2,.8,.2,1)" }
    );

    setTimeout(() => {
      el.remove();
    }, duration + 100);
  }
}

// Loading overlay
function showLoading() {
  let overlay = document.querySelector(".loading-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "loading-overlay";
    overlay.innerHTML = `
            <div class="spinner"></div>
            <p>Sending your message...</p>
        `;
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

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    // Client-side validation
    if (!name || !email || !message) {
      showToast("Please fill in all fields", "error");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    // Show loading state
    showLoading();
    const submitButton = contactForm.querySelector('button[type="submit"]');
    submitButton.classList.add("loading");

    try {
      // Send to backend
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      // try to parse JSON, fallback to plain text
      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        const txt = await response.text();
        data = { success: response.ok, message: txt };
      }

      hideLoading();
      submitButton.classList.remove("loading");

      if (!response.ok) {
        console.error("Server returned non-OK response", response.status, data);
        showToast(data.message || `Server error (${response.status})`, "error");
        return;
      }

      if (data && data.success) {
        showToast(data.message, "success");
        contactForm.reset();

        // Add success animation to form
        contactForm.classList.add("animate__animated", "animate__pulse");
        setTimeout(() => {
          contactForm.classList.remove("animate__animated", "animate__pulse");
        }, 1000);
      } else {
        showToast(
          data.message || "Failed to send message. Please try again.",
          "error"
        );
      }
    } catch (error) {
      hideLoading();
      submitButton.classList.remove("loading");
      console.error("Contact form submission failed:", error);

      // Provide helpful error messages based on the error type
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        showToast(
          "Cannot connect to server. Please make sure the backend server is running (npm start) and try again.",
          "error"
        );
      } else if (error.name === "AbortError") {
        showToast("Request was cancelled. Please try again.", "error");
      } else {
        showToast(`Network error: ${error.message}`, "error");
      }
    }
  });
}

// Test backend connection
async function testBackendConnection() {
  try {
    console.log("🔍 Testing backend connection...");
    const response = await fetch(`${API_URL}/api/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Backend connection successful:", data);
      return true;
    } else {
      console.error(
        "❌ Backend connection failed:",
        response.status,
        response.statusText
      );
      return false;
    }
  } catch (error) {
    console.error("❌ Backend connection error:", error.message);
    console.log("💡 Troubleshooting tips:");
    console.log("   - Check if the backend server is running");
    console.log("   - Verify the API_URL is correct:", API_URL);
    console.log("   - Check browser console for CORS errors");
    console.log("   - Ensure the backend is accessible from your domain");
    return false;
  }
}

// Load Stats from Backend
async function loadStats() {
  try {
    const response = await fetch(`${API_URL}/api/stats`);
    const data = await response.json();

    if (data.success) {
      // Stats are already in the HTML, but we could update them dynamically
      console.log("Portfolio stats loaded:", data.stats);
    }
  } catch (error) {
    console.log("Using static stats");
  }
}

// Stats Counter Animation
const statValues = document.querySelectorAll(".stat-value");

const animateCounter = (element) => {
  const target = element.textContent;

  // Check if it's a number
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
};

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

statValues.forEach((stat) => {
  statsObserver.observe(stat);
});

// Load stats on page load
loadStats();

// Test backend connection on page load
testBackendConnection();

// Add hover effect to project cards
const projectCards = document.querySelectorAll(".project-card");
projectCards.forEach((card) => {
  card.addEventListener("mouseenter", function () {
    this.style.transform = "translateY(-8px)";
  });

  card.addEventListener("mouseleave", function () {
    this.style.transform = "translateY(0)";
  });
});

// Add hover effect to buttons
const buttons = document.querySelectorAll(".btn");
buttons.forEach((button) => {
  button.addEventListener("mouseenter", function () {
    this.style.transform = "scale(1.05)";
  });

  button.addEventListener("mouseleave", function () {
    this.style.transform = "scale(1)";
  });
});

// Typing Effect for Hero Title (Optional)
function typeWriter(element, text, speed = 100) {
  let i = 0;
  element.textContent = "";

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}

// Parallax Effect for Hero Background
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  const blobs = document.querySelectorAll(".blob");

  blobs.forEach((blob, index) => {
    const speed = 0.5 + index * 0.1;
    blob.style.transform = `translateY(${scrolled * speed}px)`;
  });
});

// Add active state to navigation based on scroll position
window.addEventListener("scroll", () => {
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
});

// Lazy loading for images
if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
        }
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll("img[data-src]").forEach((img) => {
    imageObserver.observe(img);
  });
}

// Typing animation
const typingElement = document.querySelector(".typing");
if (typingElement) {
  const texts = [
    "Muktar Abdi",
    "Web Developer",
    "Software Engineer",
    "Coding Enthusiast",
  ];
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentText = texts[textIndex];

    typingElement.textContent = isDeleting
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

// Performance optimization: Debounce scroll events
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

const debouncedScroll = debounce(() => {}, 10);

window.addEventListener("scroll", debouncedScroll);

// Magnetic cursor effect for buttons
const magneticElements = document.querySelectorAll(
  ".btn, .social-icon, .contact-social-icon"
);

magneticElements.forEach((element) => {
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

// Add shimmer effect to cards on hover
const cards = document.querySelectorAll(
  ".stat-card, .skill-card, .project-card, .testimonial-card, .highlight-card"
);
cards.forEach((card) => {
  card.classList.add("shimmer");
});

// Smooth section reveal on scroll
const revealElements = document.querySelectorAll("section");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  },
  { threshold: 0.1 }
);

revealElements.forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(20px)";
  el.style.transition = "opacity 0.8s ease, transform 0.8s ease";
  revealObserver.observe(el);
});

// Particle trail effect on mouse move
let particles = [];
const maxParticles = 50;

document.addEventListener("mousemove", (e) => {
  if (Math.random() > 0.7) {
    // higher chance to create particles
    const particle = document.createElement("div");
    const size = Math.random() * 6 + 4; // size variation

    particle.style.position = "fixed";
    particle.style.left = e.clientX + "px";
    particle.style.top = e.clientY + "px";
    particle.style.width = size + "px";
    particle.style.height = size + "px";
    particle.style.background = `radial-gradient(circle, #4F46E5, #7C3AED)`;
    particle.style.borderRadius = "50%";
    particle.style.pointerEvents = "none";
    particle.style.zIndex = "9999";
    particle.style.opacity = "0.8";
    particle.style.filter = "blur(2px)"; // glow effect
    particle.style.transform = `translate(0, 0) scale(1) rotate(0deg)`;
    particle.style.transition = "all 1s ease-out";

    document.body.appendChild(particle);
    particles.push(particle);

    setTimeout(() => {
      const xMove = Math.random() * 120 - 60;
      const yMove = Math.random() * 120 - 60;
      const scale = Math.random() * 1.5 + 0.5;
      const rotate = Math.random() * 360;

      particle.style.transform = `translate(${xMove}px, ${yMove}px) scale(${scale}) rotate(${rotate}deg)`;
      particle.style.opacity = "0";
    }, 10);

    setTimeout(() => {
      particle.remove();
      particles.shift();
    }, 1000);

    // Limit particles
    if (particles.length > maxParticles) {
      const oldest = particles.shift();
      oldest.remove();
    }
  }
});

// Limit particles
if (particles.length > maxParticles) {
  const oldest = particles.shift();
  oldest.remove();
}

// Console message for developers
console.log(
  "%c👋 Hello Developer!",
  "font-size: 20px; font-weight: bold; color: #4F46E5;"
);
console.log(
  "%cInterested in how this portfolio was built?",
  "font-size: 14px; color: #7C3AED;"
);
console.log(
  "%cBuilt with vanilla HTML, CSS, and JavaScript + Node.js backend!",
  "font-size: 12px; color: #666;"
);
console.log(
  "%c🚀 API Endpoints:",
  "font-size: 14px; font-weight: bold; color: #7C3AED;"
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

// Add easter egg
let konami = [];
const konamiCode = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

document.addEventListener("keydown", (e) => {
  konami.push(e.key);
  konami = konami.slice(-konamiCode.length);

  if (konami.join("") === konamiCode.join("")) {
    document.body.style.animation = "rainbow 2s linear infinite";
    setTimeout(() => {
      document.body.style.animation = "";
    }, 5000);
  }
});

// Add rainbow animation keyframes dynamically
const style = document.createElement("style");
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Floating "Let's Talk" CTA
(function () {
  // Prevent duplicate insertion or if user dismissed previously
  if (document.querySelector(".floating-cta")) return;
  if (localStorage.getItem("ctaDismissed") === "1") return;

  // Create CTA element (phone icon only)
  const cta = document.createElement("a");
  cta.href = "#contact";
  cta.className = "floating-cta pulse-glow hide";
  cta.setAttribute("aria-label", "Call Muktar");
  cta.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.07-8.63A2 2 0 0 1 4.09 2h3a2 2 0 0 1 2 1.72c.12 1.21.38 2.39.76 3.5a2 2 0 0 1-.45 2.11L8.91 11.09a16 16 0 0 0 6 6l1.76-1.8a2 2 0 0 1 2.11-.45c1.11.38 2.29.64 3.5.76A2 2 0 0 1 22 16.92z"/></svg>
  `;

  // no internal dismiss button — keep CTA minimal (phone icon only)

  // Instead of scrolling, open a contact modal with phone & telegram
  cta.addEventListener("click", function (e) {
    e.preventDefault();
    openContactModal();
  });

  document.body.appendChild(cta);

  // Contact modal creation and behavior
  function openContactModal() {
    if (document.querySelector(".contact-modal-overlay")) return;

    const overlay = document.createElement("div");
    overlay.className = "contact-modal-overlay";

    const modal = document.createElement("div");
    modal.className = "contact-modal";

    // (modal close button removed — modal can still be closed via overlay or Escape)

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
        // small toast feedback
        showToast("Phone number copied to clipboard", "success");
      } catch (err) {
        showToast("Copy failed. Please copy manually.", "error");
      }
    });

    actions.appendChild(callAnchor);
    actions.appendChild(tgAnchor);
    actions.appendChild(copyBtn);

    modal.appendChild(title);
    modal.appendChild(nameItem);
    modal.appendChild(actions);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // show with transition
    requestAnimationFrame(() => overlay.classList.add("show"));

    // close on overlay click (but not when clicking inside modal)
    overlay.addEventListener("click", (ev) => {
      if (ev.target === overlay) closeModal();
    });

    // close on Esc
    function onKey(e) {
      if (e.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", onKey);

    function closeModal() {
      overlay.classList.remove("show");
      document.removeEventListener("keydown", onKey);
      setTimeout(() => overlay.remove(), 200);
    }
  }

  // Hide CTA when contact section is visible
  const contact = document.getElementById("contact");
  if (contact && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            cta.classList.add("hide");
          } else if (window.scrollY > 120) {
            cta.classList.remove("hide");
          }
        });
      },
      { threshold: 0.25 }
    );

    io.observe(contact);
  }

  // Also hide at top of page, show after scrolling down
  window.addEventListener("scroll", () => {
    if (window.scrollY < 120) {
      cta.classList.add("hide");
    } else if (!contact || (contact && !cta.classList.contains("hide"))) {
      cta.classList.remove("hide");
    }
  });
})();

// Download CV Button Functionality
const downloadCVBtn = document.getElementById("downloadCV");
if (downloadCVBtn) {
  downloadCVBtn.addEventListener("click", function (e) {
    e.preventDefault();

    // Show a message to the user
    const toast = document.createElement("div");
    toast.className = "toast success show";
    toast.innerHTML = `
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>CV download will be available soon! Please contact me directly.</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 4000);

    // Optional: You can replace this with actual CV download link
    window.open("image/MUKTAR-ABDULKADER.pdf", "_blank");
  });
}

const newSectionElements = document.querySelectorAll(
  ".service-card, .timeline-item, .blog-card"
);

newSectionElements.forEach((el) => {
  observer.observe(el);
});

// ==========================
// Theme Toggle Functionality
// ==========================

const themeToggle = document.getElementById("themeToggle");
const themes = ["blue", "black"];
let currentThemeIndex = 0;
document.body.classList.remove(themes[currentThemeIndex]);
currentThemeIndex = (currentThemeIndex + 1) % themes.length;
document.body.classList.add(themes[currentThemeIndex]);
localStorage.setItem("portfolioTheme", themes[currentThemeIndex]);

if (themeToggle) {
  // Load saved theme
  const savedTheme = localStorage.getItem("portfolioTheme");
  if (savedTheme && themes.includes(savedTheme)) {
    document.body.classList.add(savedTheme);
    currentThemeIndex = themes.indexOf(savedTheme);
  }

  themeToggle.addEventListener("click", () => {
    if (themes[currentThemeIndex]) {
      document.body.classList.remove(themes[currentThemeIndex]);
    }

    currentThemeIndex = (currentThemeIndex + 1) % themes.length;

    document.body.classList.add(themes[currentThemeIndex]);

    localStorage.setItem("portfolioTheme", themes[currentThemeIndex]);

    themeToggle.style.transform = "rotate(360deg) scale(1.2)";
    setTimeout(() => {
      themeToggle.style.transform = "";
    }, 300);

    showThemeToast(themes[currentThemeIndex]);

    // Close mobile menu when theme toggle is clicked
    if (window.innerWidth <= 768) {
      menuToggle.classList.remove("active");
      navMenu.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
}

function showThemeToast(theme) {
  const themeNames = {
    blue: "Ocean Blue Theme",
    black: "Dark Theme",
  };

  const toast = document.createElement("div");
  toast.className = "toast success show";
  toast.innerHTML = `
    <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
// Blog Modal System
// ==========================
const blogModal = document.getElementById("blogModal");
const closeBlogModal = document.getElementById("closeBlogModal");
const blogToggles = document.querySelectorAll(".blog-toggle");

// Blog data
const blogData = {
  0: {
    category: "Web Development",
    title: "Building Scalable Web Applications with Node.js",
    date: "Oct 5, 2025",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    content: `
      <h3>Introduction</h3>
      <p>Building scalable web applications is crucial in today's digital landscape. Node.js has emerged as a powerful platform for creating high-performance, scalable applications that can handle millions of concurrent users.</p>
      
      <h3>Microservices Architecture</h3>
      <p>One of the key principles in building scalable applications is adopting a microservices architecture. This approach breaks down your application into smaller, independent services that can be developed, deployed, and scaled independently.</p>
      
      <h3>Load Balancing Strategies</h3>
      <p>Implementing effective load balancing is essential for distributing traffic across multiple servers. We'll explore various load balancing techniques including round-robin, least connections, and IP hash methods.</p>
      
      <h3>Caching and Performance</h3>
      <p>Caching is a critical component of scalable applications. Learn how to implement Redis caching, CDN integration, and database query optimization to dramatically improve your application's performance.</p>
      
      <h3>Deployment Best Practices</h3>
      <p>Finally, we'll cover modern deployment strategies including containerization with Docker, orchestration with Kubernetes, and CI/CD pipelines for automated deployments.</p>
    `,
  },
  1: {
    category: "AI & ML",
    title: "Introduction to Recommendation Systems with Python",
    date: "Sep 28, 2025",
    readTime: "8 min read",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    content: `
      <h3>What are Recommendation Systems?</h3>
      <p>Recommendation systems are algorithms designed to suggest relevant items to users. They power features like "You might also like" on e-commerce sites and "Recommended for you" on streaming platforms.</p>
      
      <h3>Content-Based Filtering</h3>
      <p>This approach recommends items similar to what a user has liked in the past. We'll implement this using TF-IDF vectorization and cosine similarity in Python.</p>
      
      <h3>Collaborative Filtering</h3>
      <p>Learn how to build recommendation engines based on user behavior patterns. We'll explore both user-based and item-based collaborative filtering techniques using scikit-learn.</p>
      
      <h3>Hybrid Approaches</h3>
      <p>Discover how to combine multiple recommendation strategies to create more accurate and robust systems. We'll implement a hybrid model using TensorFlow.</p>
      
      <h3>Real-World Applications</h3>
      <p>See practical examples from Netflix, Amazon, and Spotify, and learn how to apply these techniques to your own projects.</p>
    `,
  },
  2: {
    category: "Cybersecurity",
    title: "Essential Web Security Practices for Developers",
    date: "Sep 15, 2025",
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    content: `
      <h3>Understanding Web Vulnerabilities</h3>
      <p>Web applications face numerous security threats. Understanding common vulnerabilities is the first step in building secure applications.</p>
      
      <h3>SQL Injection Prevention</h3>
      <p>Learn how to protect your database from SQL injection attacks using parameterized queries, prepared statements, and ORM frameworks.</p>
      
      <h3>Cross-Site Scripting (XSS) Protection</h3>
      <p>Implement proper input validation, output encoding, and Content Security Policy (CSP) headers to prevent XSS attacks.</p>
      
      <h3>Authentication & Authorization</h3>
      <p>Explore best practices for implementing secure authentication systems, including password hashing with bcrypt, JWT tokens, and OAuth 2.0.</p>
      
      <h3>Security Testing Tools</h3>
      <p>Get hands-on with industry-standard security testing tools like OWASP ZAP, Burp Suite, and automated security scanners to identify vulnerabilities in your applications.</p>
    `,
  },
};

blogToggles.forEach((toggle, index) => {
  toggle.addEventListener("click", function () {
    // Open modal with blog data
    const data = blogData[index];
    if (data) {
      document.getElementById("modalCategory").textContent = data.category;
      document.getElementById("modalTitle").textContent = data.title;
      document.getElementById("modalDate").textContent = data.date;
      document.getElementById("modalReadTime").textContent = data.readTime;
      document.getElementById("modalImage").src = data.image;
      document.getElementById("modalBody").innerHTML = data.content;

      blogModal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  });
});

// Close modal
closeBlogModal.addEventListener("click", () => {
  blogModal.classList.remove("active");
  document.body.style.overflow = "auto";
});

// Close on background click
blogModal.addEventListener("click", (e) => {
  if (e.target === blogModal) {
    blogModal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
});

// Close on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && blogModal.classList.contains("active")) {
    blogModal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
});

// ==========================
// Enhanced Particle System - Tiny & Slow
// ==========================
function createEnhancedParticle() {
  const particle = document.createElement("div");
  particle.classList.add("particle");

  // Random position
  particle.style.left = `${Math.random() * 100}%`;
  particle.style.top = `${Math.random() * 100}%`;

  // Tiny particles (2-5px)
  const size = Math.random() * 3 + 2;
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;

  // Random animation delay
  particle.style.animationDelay = `${Math.random() * -30}s`;

  // Slow animation duration (25-40s)
  particle.style.animationDuration = `${25 + Math.random() * 15}s`;

  particlesContainer.appendChild(particle);
}

// Clear existing particles and create enhanced ones
if (particlesContainer) {
  particlesContainer.innerHTML = "";
  for (let i = 0; i < 60; i++) {
    createEnhancedParticle();
  }
}
