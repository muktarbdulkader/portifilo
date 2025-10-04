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

// Mobile Menu Toggle
menuToggle.addEventListener("click", () => {
  menuToggle.classList.toggle("active");
  navMenu.classList.toggle("active");
});

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.classList.remove("active");
    navMenu.classList.remove("active");
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

// Create Floating Particles
const particlesContainer = document.getElementById("particles");
const particleCount = 50;

function createParticle() {
  const particle = document.createElement("div");
  particle.classList.add("particle");

  particle.style.left = `${Math.random() * 100}%`;
  particle.style.top = `${Math.random() * 100}%`;

  const size = Math.random() * 6 + 4;
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;

  particle.style.animationDelay = `${Math.random() * 3}s`;
  particle.style.animationDuration = `${4 + Math.random() * 6}s`;

  particlesContainer.appendChild(particle);
}

// Generate all particles
for (let i = 0; i < particleCount; i++) {
  createParticle();
}

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
// If the page is opened via file:// (no origin) or origin is 'null', fall back to localhost
const DEFAULT_API = "http://localhost:3000";
// Allow an explicit API URL to be injected by the hosting environment or an
// inline script (e.g. window.API_URL = 'https://portifilo.onrender.com').
// Otherwise prefer the current origin when served from the same host, and
// finally fall back to localhost for local development.
const API_URL =
  typeof window !== "undefined" && window.API_URL
    ? window.API_URL
    : window.location &&
      window.location.origin &&
      window.location.origin !== "null"
    ? window.location.origin
    : DEFAULT_API;

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
      // Distinguish likely causes
      if (API_URL === DEFAULT_API) {
        showToast(
          "Cannot reach server. Make sure you've started the local server (npm start) and opened the site via http://localhost:3000",
          "error"
        );
      } else {
        showToast(`Network error: ${error.message}`, "error");
      }
    }
  });
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
