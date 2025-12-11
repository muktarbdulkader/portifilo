/**
 * AI Chatbot - Personal Assistant about Muktar Abdulkader
 * Similar to Gemini AI, answers questions about the portfolio owner
 */

class AIChatbot {
    constructor() {
        this.knowledgeBase = this.initializeKnowledgeBase();
        this.conversationHistory = [];
        this.isOpen = false;
        this.sessionId = null;
        this.userId = null;
        this.backendEnabled = false;
        this.init();
    }

    initializeKnowledgeBase() {
        return {
            personal: {
                name: "Muktar Abdulkader",
                title: "Full Stack Software Engineer",
                education: "4th year Software Engineering student at Haramaya University, Ethiopia",
                location: "Ethiopia",
                email: "muktarabdulkader957@gmail.com",
                phone: "+251916662982",
                availability: "Available for hire",
                responseTime: "Responds within 24 hours",
                bio: "Software Engineering student specializing in frontend development, Canva design, and AI-powered solutions. Currently in 4th year at Haramaya University, building innovative projects that solve real-world problems."
            },

            experience: {
                years: "3+",
                projectsCompleted: "15+",
                clientSatisfaction: "95%",
                areas: [
                    "Frontend Development",
                    "Canva Design",
                    "Freelancing",
                    "Web Development",
                    "Mobile App Development",
                    "AI/ML Solutions",
                    "Cybersecurity"
                ]
            },

            skills: {
                frontend: ["HTML", "CSS", "JavaScript", "React", "Tailwind CSS", "Bootstrap"],
                backend: ["Node.js", "PHP", "Python", "MySQL", "MongoDB"],
                mobile: ["Kotlin", "Android Development"],
                design: ["Canva", "Graphic Design", "UI/UX"],
                tools: ["Git", "VS Code", "Figma", "Postman"],
                other: ["AI/ML", "Cybersecurity", "RESTful APIs"]
            },

            projects: [
                {
                    name: "Course Registration System",
                    description: "A comprehensive web-based system for managing course registrations",
                    technologies: ["React", "PHP", "MySQL"],
                    type: "Web Application"
                },
                {
                    name: "Staff Evaluation App",
                    description: "Mobile application for evaluating staff performance",
                    technologies: ["Kotlin", "Firebase", "Android"],
                    type: "Mobile Application"
                },
                {
                    name: "AI Recommender System",
                    description: "Intelligent recommendation engine using machine learning",
                    technologies: ["Python", "Flask", "TensorFlow"],
                    type: "AI/ML Project"
                },
                {
                    name: "Intelligent Time Management Assistant",
                    description: "AI-powered assistant for managing time and tasks efficiently",
                    technologies: ["Python", "AI/ML"],
                    type: "AI Application"
                }
            ],

            services: [
                "Web Development - Building responsive and modern websites",
                "Mobile App Development - Creating Android applications",
                "Canva Design - Professional graphic design services",
                "AI Solutions - Implementing AI/ML powered features",
                "Freelance Services - Custom software solutions",
                "Consulting - Technical consultation and guidance"
            ],

            socialLinks: {
                github: "https://github.com/muktarbdulkader",
                linkedin: "https://linkedin.com/in/muktar-abdulkader",
                telegram: "https://t.me/MuktiAbdu",
                email: "muktarabdulkader957@gmail.com"
            },

            achievements: [
                "Top performer in academic projects",
                "Successful freelance engagements",
                "Multiple deployed applications serving real users",
                "15+ completed projects",
                "95% client satisfaction rate"
            ]
        };
    }

    init() {
        this.createChatbotUI();
        this.attachEventListeners();
        this.initializeSession();
        this.loadConversationHistory();
        this.initializeBackendConnection();
    }

    initializeSession() {
        // Generate a unique session ID for this visit
        this.sessionId = this.generateUniqueId();

        // Get or create a persistent user ID
        let userId = localStorage.getItem('chatbot_user_id');
        if (!userId) {
            userId = this.generateUniqueId();
            localStorage.setItem('chatbot_user_id', userId);
        }
        this.userId = userId;

        console.log(`🤖 Session initialized: Session ID - ${this.sessionId}, User ID - ${this.userId}`);
    }

    generateUniqueId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    async initializeBackendConnection() {
        try {
            const response = await fetch(`/api/chatbot/conversation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    userId: this.userId,
                    metadata: this.knowledgeBase.personal
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('🤖 Connected to backend:', data);
                this.backendEnabled = true;
            }
        } catch (error) {
            console.warn('Backend not available, using local mode:', error);
            this.backendEnabled = false;
        }
    }

    createChatbotUI() {
        const chatbotHTML = `
            <div class="ai-chatbot-container" id="aiChatbot">
                <button class="chatbot-toggle" id="chatbotToggle" aria-label="Toggle AI Assistant">
                    <svg class="chatbot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span class="chatbot-badge">AI</span>
                </button>
                
                <div class="chatbot-window" id="chatbotWindow">
                    <div class="chatbot-header">
                        <div class="chatbot-header-info">
                            <div class="chatbot-avatar">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                                </svg>
                            </div>
                            <div>
                                <h3>Muktar AI Assistant</h3>
                                <p class="chatbot-status">
                                    <span class="status-dot"></span>
                                    Online - Ask me anything!
                                </p>
                            </div>
                        </div>
                        <button class="chatbot-close" id="chatbotClose" aria-label="Close chat">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="chatbot-messages" id="chatbotMessages">
                        <div class="chatbot-welcome">
                            <div class="welcome-icon">👋</div>
                            <h4>Hi! I'm Muktar's AI Assistant</h4>
                            <p>I can answer questions about Muktar's skills, projects, experience, and more!</p>
                            <div class="quick-questions">
                                <button class="quick-question" data-question="What are your skills?">
                                    💻 What are your skills?
                                </button>
                                <button class="quick-question" data-question="Tell me about your projects">
                                    🚀 Tell me about your projects
                                </button>
                                <button class="quick-question" data-question="What services do you offer?">
                                    🛠️ What services do you offer?
                                </button>
                                <button class="quick-question" data-question="How can I contact you?">
                                    📧 How can I contact you?
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="chatbot-input-container">
                        <div class="chatbot-typing" id="chatbotTyping" style="display: none;">
                            <span></span><span></span><span></span>
                        </div>
                        <form class="chatbot-input-form" id="chatbotForm">
                            <input 
                                type="text" 
                                class="chatbot-input" 
                                id="chatbotInput" 
                                placeholder="Ask me anything about Muktar..."
                                autocomplete="off"
                            />
                            <button type="submit" class="chatbot-send" aria-label="Send message">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="22" y1="2" x2="11" y2="13"/>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    attachEventListeners() {
        const toggle = document.getElementById('chatbotToggle');
        const close = document.getElementById('chatbotClose');
        const form = document.getElementById('chatbotForm');
        const input = document.getElementById('chatbotInput');

        toggle?.addEventListener('click', () => this.toggleChat());
        close?.addEventListener('click', () => this.toggleChat());
        form?.addEventListener('submit', (e) => this.handleSubmit(e));

        // Quick questions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-question')) {
                const question = e.target.dataset.question;
                this.handleUserMessage(question);
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.toggleChat();
            }
        });

        // End conversation on page unload
        window.addEventListener('beforeunload', () => {
            if (this.conversationHistory.length > 0) {
                this.endConversation();
            }
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const chatbot = document.getElementById('aiChatbot');
        const window = document.getElementById('chatbotWindow');

        if (this.isOpen) {
            chatbot?.classList.add('active');
            window?.classList.add('active');
            document.getElementById('chatbotInput')?.focus();
        } else {
            chatbot?.classList.remove('active');
            window?.classList.remove('active');
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        const input = document.getElementById('chatbotInput');
        const message = input?.value.trim();

        if (message) {
            this.handleUserMessage(message);
            input.value = '';
        }
    }

    async handleUserMessage(message) {
        this.addMessage(message, 'user');
        this.conversationHistory.push({ role: 'user', content: message });

        // Save to backend
        if (this.backendEnabled) {
            await this.saveMessageToBackend('user', message);
        }

        // Show typing indicator
        this.showTyping();

        // Generate AI response
        setTimeout(async () => {
            const response = this.generateResponse(message);
            this.hideTyping();
            this.addMessage(response, 'bot');
            this.conversationHistory.push({ role: 'bot', content: response });
            this.saveConversationHistory();

            // Save bot response to backend
            if (this.backendEnabled) {
                await this.saveMessageToBackend('bot', response);
            }
        }, 1000 + Math.random() * 1000); // Random delay for realism
    }

    async saveMessageToBackend(role, content) {
        try {
            await fetch(`/api/chatbot/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    userId: this.userId,
                    role: role,
                    content: content
                })
            });
        } catch (error) {
            console.warn('Could not save message to backend:', error);
        }
    }

    generateResponse(message) {
        const lowerMessage = message.toLowerCase();

        // Greeting responses
        if (this.matchesPattern(lowerMessage, ['hi', 'hello', 'hey', 'greetings'])) {
            return `Hello! 👋 I'm Muktar's AI assistant. I can tell you about his skills, projects, experience, and how to get in touch. What would you like to know?`;
        }

        // Skills questions
        if (this.matchesPattern(lowerMessage, ['skill', 'technology', 'tech stack', 'what can', 'programming'])) {
            return this.getSkillsResponse();
        }

        // Projects questions
        if (this.matchesPattern(lowerMessage, ['project', 'work', 'portfolio', 'built', 'created'])) {
            return this.getProjectsResponse();
        }

        // Experience questions
        if (this.matchesPattern(lowerMessage, ['experience', 'background', 'years', 'worked'])) {
            return this.getExperienceResponse();
        }

        // Education questions
        if (this.matchesPattern(lowerMessage, ['education', 'university', 'study', 'degree', 'student'])) {
            return this.getEducationResponse();
        }

        // Services questions
        if (this.matchesPattern(lowerMessage, ['service', 'offer', 'do', 'help', 'hire'])) {
            return this.getServicesResponse();
        }

        // Contact questions
        if (this.matchesPattern(lowerMessage, ['contact', 'email', 'phone', 'reach', 'get in touch'])) {
            return this.getContactResponse();
        }

        // About questions
        if (this.matchesPattern(lowerMessage, ['who', 'about', 'tell me'])) {
            return this.getAboutResponse();
        }

        // Availability questions
        if (this.matchesPattern(lowerMessage, ['available', 'hire', 'freelance', 'work'])) {
            return this.getAvailabilityResponse();
        }

        // Achievements questions
        if (this.matchesPattern(lowerMessage, ['achievement', 'award', 'accomplishment', 'success'])) {
            return this.getAchievementsResponse();
        }

        // Default response
        return this.getDefaultResponse();
    }

    matchesPattern(message, keywords) {
        return keywords.some(keyword => message.includes(keyword));
    }

    getSkillsResponse() {
        const kb = this.knowledgeBase;
        return `💻 **Muktar's Technical Skills:**

**Frontend:** ${kb.skills.frontend.join(', ')}

**Backend:** ${kb.skills.backend.join(', ')}

**Mobile:** ${kb.skills.mobile.join(', ')}

**Design:** ${kb.skills.design.join(', ')}

**Tools:** ${kb.skills.tools.join(', ')}

**Other:** ${kb.skills.other.join(', ')}

He's particularly strong in frontend development and Canva design! Would you like to know more about any specific skill?`;
    }

    getProjectsResponse() {
        const projects = this.knowledgeBase.projects;
        let response = `🚀 **Muktar has completed ${this.knowledgeBase.experience.projectsCompleted} projects!** Here are some highlights:\n\n`;

        projects.forEach((project, index) => {
            response += `**${index + 1}. ${project.name}**\n`;
            response += `${project.description}\n`;
            response += `Technologies: ${project.technologies.join(', ')}\n`;
            response += `Type: ${project.type}\n\n`;
        });

        response += `Want to see more projects? Check out the Projects section on the website!`;
        return response;
    }

    getExperienceResponse() {
        const exp = this.knowledgeBase.experience;
        return `📊 **Muktar's Experience:**

• **${exp.years} years** of professional experience
• **${exp.projectsCompleted} projects** completed successfully
• **${exp.clientSatisfaction}** client satisfaction rate

**Areas of Expertise:**
${exp.areas.map(area => `• ${area}`).join('\n')}

He has experience in freelancing, academic projects, and real-world client work. Would you like to know about specific projects?`;
    }

    getEducationResponse() {
        const personal = this.knowledgeBase.personal;
        return `🎓 **Education:**

${personal.education}

Muktar is currently specializing in:
• Web Development
• Mobile Applications
• Artificial Intelligence
• Cybersecurity

He maintains excellent academic performance with hands-on project experience. GPA and certifications will be added soon!`;
    }

    getServicesResponse() {
        const services = this.knowledgeBase.services;
        return `🛠️ **Services Muktar Offers:**

${services.map((service, index) => `${index + 1}. ${service}`).join('\n')}

He's currently **${this.knowledgeBase.personal.availability}** and responds within 24 hours. Would you like to discuss a project?`;
    }

    getContactResponse() {
        const contact = this.knowledgeBase.personal;
        const social = this.knowledgeBase.socialLinks;
        return `📧 **Get in Touch with Muktar:**

**Email:** ${contact.email}
**Phone:** ${contact.phone}
**Location:** ${contact.location}

**Social Media:**
• GitHub: ${social.github}
• LinkedIn: ${social.linkedin}
• Telegram: ${social.telegram}

**Response Time:** ${contact.responseTime}

Feel free to reach out for project inquiries, collaborations, or just to say hi! 👋`;
    }

    getAboutResponse() {
        const personal = this.knowledgeBase.personal;
        return `👨‍💻 **About Muktar Abdulkader:**

${personal.bio}

**Current Status:** ${personal.education}

**Specializations:**
• Frontend Development
• Canva Design & Graphics
• AI-Powered Solutions
• Web & Mobile Applications

With ${this.knowledgeBase.experience.years} years of experience and ${this.knowledgeBase.experience.projectsCompleted} completed projects, Muktar brings both technical expertise and creative problem-solving to every project.

What else would you like to know?`;
    }

    getAvailabilityResponse() {
        return `✅ **Availability Status:**

Muktar is currently **${this.knowledgeBase.personal.availability}**!

• **Response Time:** ${this.knowledgeBase.personal.responseTime}
• **Client Satisfaction:** ${this.knowledgeBase.experience.clientSatisfaction}
• **Projects Completed:** ${this.knowledgeBase.experience.projectsCompleted}

He's open to:
• Freelance projects
• Full-time opportunities
• Collaborations
• Consulting work

Ready to start a project? Contact him at ${this.knowledgeBase.personal.email}`;
    }

    getAchievementsResponse() {
        const achievements = this.knowledgeBase.achievements;
        return `🏆 **Muktar's Achievements:**

${achievements.map((achievement, index) => `${index + 1}. ${achievement}`).join('\n')}

He's passionate about delivering high-quality work and maintaining excellent client relationships. Want to know more about specific projects?`;
    }

    getDefaultResponse() {
        return `I'm here to help! I can answer questions about:

• 💻 Muktar's skills and technologies
• 🚀 His projects and portfolio
• 📊 His experience and background
• 🎓 His education
• 🛠️ Services he offers
• 📧 How to contact him
• ✅ His availability

What would you like to know?`;
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}-message`;

        if (sender === 'bot') {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                        <line x1="9" y1="9" x2="9.01" y2="9"/>
                        <line x1="15" y1="9" x2="15.01" y2="9"/>
                    </svg>
                </div>
                <div class="message-content">${this.formatMessage(content)}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">${this.escapeHtml(content)}</div>
                <div class="message-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                </div>
            `;
        }

        messagesContainer?.appendChild(messageDiv);
        messagesContainer?.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    }

    formatMessage(content) {
        // Convert markdown-like formatting to HTML
        let formatted = this.escapeHtml(content);

        // Bold text
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Line breaks
        formatted = formatted.replace(/\n/g, '<br>');

        // Links
        formatted = formatted.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        return formatted;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showTyping() {
        const typing = document.getElementById('chatbotTyping');
        if (typing) typing.style.display = 'flex';
    }

    hideTyping() {
        const typing = document.getElementById('chatbotTyping');
        if (typing) typing.style.display = 'none';
    }

    saveConversationHistory() {
        try {
            localStorage.setItem('chatbot_history', JSON.stringify(this.conversationHistory));
        } catch (error) {
            console.warn('Could not save conversation history:', error);
        }
    }

    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('chatbot_history');
            if (saved) {
                this.conversationHistory = JSON.parse(saved);
                // Optionally restore messages in UI
            }
        } catch (error) {
            console.warn('Could not load conversation history:', error);
        }
    }

    async endConversation(satisfaction = null) {
        if (!this.backendEnabled) return;

        try {
            await fetch(`/api/chatbot/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    userId: this.userId,
                    satisfaction: satisfaction
                })
            });
            console.log('🤖 Conversation ended');
        } catch (error) {
            console.warn('Could not end conversation:', error);
        }
    }
}

// Initialize chatbot when DOM is loaded
// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🤖 Loading chatbot on:', window.location.pathname);
    new AIChatbot();
    window.aiChatbotLoaded = true;
});
console.log('🤖 AI Chatbot initialized');

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIChatbot;
}
