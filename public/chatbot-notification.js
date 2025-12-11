/**
 * Chatbot Notification System
 * Shows a welcome notification when user first visits
 */

(function() {
    'use strict';
    
    // Check if user has seen the notification
    const hasSeenNotification = localStorage.getItem('chatbot_notification_seen');
    
    if (!hasSeenNotification) {
        // Wait for page to load
        window.addEventListener('load', () => {
            setTimeout(() => {
                showChatbotNotification();
            }, 3000); // Show after 3 seconds
        });
    }
    
    function showChatbotNotification() {
        const notification = document.createElement('div');
        notification.className = 'chatbot-notification';
        notification.innerHTML = `
            <div class="chatbot-notification-content">
                <div class="chatbot-notification-icon">🤖</div>
                <div class="chatbot-notification-text">
                    <strong>Hi! I'm Muktar's AI Assistant</strong>
                    <p>Ask me anything about skills, projects, or experience!</p>
                </div>
                <button class="chatbot-notification-close" aria-label="Close notification">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto-hide after 8 seconds
        setTimeout(() => {
            hideNotification(notification);
        }, 8000);
        
        // Close button
        const closeBtn = notification.querySelector('.chatbot-notification-close');
        closeBtn?.addEventListener('click', () => {
            hideNotification(notification);
        });
        
        // Click to open chatbot
        notification.addEventListener('click', (e) => {
            if (!e.target.closest('.chatbot-notification-close')) {
                hideNotification(notification);
                // Open chatbot
                if (window.aiChatbot) {
                    window.aiChatbot.toggleChat();
                }
            }
        });
        
        // Mark as seen
        localStorage.setItem('chatbot_notification_seen', 'true');
    }
    
    function hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .chatbot-notification {
            position: fixed;
            bottom: 100px;
            right: 20px;
            z-index: 9998;
            max-width: 320px;
            opacity: 0;
            transform: translateY(20px) scale(0.95);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
        }
        
        .chatbot-notification.show {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        
        .chatbot-notification-content {
            background: white;
            border-radius: 16px;
            padding: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            display: flex;
            gap: 12px;
            align-items: flex-start;
            position: relative;
        }
        
        .chatbot-notification-icon {
            font-size: 32px;
            flex-shrink: 0;
        }
        
        .chatbot-notification-text {
            flex: 1;
        }
        
        .chatbot-notification-text strong {
            display: block;
            color: #1a202c;
            font-size: 14px;
            margin-bottom: 4px;
        }
        
        .chatbot-notification-text p {
            color: #718096;
            font-size: 13px;
            margin: 0;
            line-height: 1.4;
        }
        
        .chatbot-notification-close {
            background: transparent;
            border: none;
            width: 24px;
            height: 24px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.2s;
            flex-shrink: 0;
        }
        
        .chatbot-notification-close:hover {
            background: #f7fafc;
        }
        
        .chatbot-notification-close svg {
            width: 16px;
            height: 16px;
            color: #718096;
        }
        
        @media (max-width: 480px) {
            .chatbot-notification {
                bottom: 80px;
                right: 10px;
                left: 10px;
                max-width: none;
            }
        }
        
        @media (prefers-color-scheme: dark) {
            .chatbot-notification-content {
                background: #2d3748;
            }
            
            .chatbot-notification-text strong {
                color: #e2e8f0;
            }
            
            .chatbot-notification-text p {
                color: #a0aec0;
            }
            
            .chatbot-notification-close:hover {
                background: #4a5568;
            }
            
            .chatbot-notification-close svg {
                color: #a0aec0;
            }
        }
    `;
    document.head.appendChild(style);
})();
