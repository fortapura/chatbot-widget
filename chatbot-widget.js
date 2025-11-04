(function() {
    // ==================== WIDGET INITIALIZATION ====================
    const ChatbotWidget = {
        config: null,
        sessionId: null,
        isOpen: false,
        apiKey: null,
        apiEndpoint: null,
        useWidgetMode: false,

        init: function(options) {
            this.useWidgetMode = !!(options.apiKey && options.apiEndpoint);
            
            if (this.useWidgetMode) {
                // Widget mode: inject into any website
                this.apiKey = options.apiKey;
                this.apiEndpoint = options.apiEndpoint || 'https://api.yourdomain.com/v1';
                this.sessionId = this.generateSessionId();
                
                // Fetch client configuration
                this.fetchConfig().then(() => {
                    this.injectStyles();
                    this.injectHTML();
                    this.attachEventListeners();
                    this.startAttentionFeatures();
                }).catch(error => {
                    console.error('Failed to initialize widget:', error);
                });
            } else {
                // Full-page mode: use existing HTML elements
                this.sessionId = this.generateSessionId();
                this.initializeFullPage();
            }
        },

        generateSessionId: function() {
            let sessionId = localStorage.getItem('chatbot_session_id');
            if (!sessionId) {
                sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('chatbot_session_id', sessionId);
            }
            return sessionId;
        },

        fetchConfig: async function() {
            const response = await fetch(`${this.apiEndpoint}/config`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch config');
            this.config = await response.json();
        },

        injectStyles: function() {
            const style = document.createElement('style');
            const primaryColor = this.config?.primary_color || '#00A8CC';
            const secondaryColor = this.config?.secondary_color || '#0A2540';
            
            // Include all the widget styles here (from original widget version)
            style.textContent = `
                /* Chat widget styles - full CSS would go here */
                #chatbot-container, #chat-container {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    z-index: 9999;
                    font-family: 'Roboto', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                }
                /* Add remaining widget-specific styles */
            `;
            document.head.appendChild(style);
        },

        injectHTML: function() {
            // Check if widget HTML already exists
            if (document.getElementById('chatbot-container') || document.getElementById('chat-container')) {
                return; // Already injected
            }
            
            // Inject widget HTML structure
            const container = document.createElement('div');
            container.id = 'chatbot-container';
            // Add widget HTML structure here
            document.body.appendChild(container);
        },

        attachEventListeners: function() {
            // Widget-specific event listeners
        },

        startAttentionFeatures: function() {
            // Widget attention features
        },

        initializeFullPage: function() {
            // For full-page apps, wait for DOM and initialize
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.setupFullPageFeatures();
                });
            } else {
                this.setupFullPageFeatures();
            }
        },

        setupFullPageFeatures: function() {
            // Setup full-page features when DOM is ready
            // This will be called after the script loads
        }
    };

    // Expose widget globally
    window.ChatbotWidget = ChatbotWidget;

    // Auto-initialize if script is loaded in widget mode (via data attributes)
    const scriptTag = document.currentScript || document.querySelector('script[data-api-key]');
    if (scriptTag && scriptTag.dataset.apiKey) {
        ChatbotWidget.init({
            apiKey: scriptTag.dataset.apiKey,
            apiEndpoint: scriptTag.dataset.apiEndpoint
        });
    }

// ==================== EXISTING SCRIPT CONTENT ====================

// Predefined responses (hardcoded for simplicity, could fetch from backend)
const infoResponses = {
    faq: 'Frequently Asked Questions:<br>- Our FAQ section is covered on the home page of this website.',
    contact: 'You can reach us at:<br>• Email: info@fortapura.com<br>• Phone: 07709 536967<br><br>Or type your enquiry here and I can collect your details and send them to our team!',
    booking: 'Booking Help:<br>- To book a demo: Visit <a href="https://calendly.com/fortapurauk/30min" target="blank">Book a Meeting</a> or call us.',
    products: 'Product/Services Info:<br>- All of our bots are tailored to your specification with multiple integration options, including email, SMS, booking systems and more.',
    pricing: 'Pricing:<br>-Each chatbot is unique so pricing can vary based on the complexity and ability you require in your chatbot.'
};

let hasAIInteraction = false;
// Global variable to track current section
let currentSection = 'welcome';

let isChatProcessing = false;

// Maximum character limit for user messages
const MAX_USER_MESSAGE_LENGTH = 1000;

// Modal for Demo
function openDemoModal() {
    const modal = document.getElementById('demo-modal');
    modal.style.display = 'block';
    toggleChat();  // Open chat
    setTimeout(() => {
        document.getElementById('userInput').value = 'I want a demo for roofing lead gen';
        sendMessage();  // Pre-fill message
    }, 500);
}

function closeDemoModal() {
    document.getElementById('demo-modal').style.display = 'none';
}

// Testimonial Slider (Safe Check)
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.dot');
    if (slides.length > 0 && dots.length > 0) {
        let currentSlide = 0;
        function showSlide(index) {
            slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
            dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
        }
        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }
        setInterval(nextSlide, 5000);
        dots.forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));
    }
});

// Homepage Contact Form
document.addEventListener('DOMContentLoaded', function() {
    // Enhanced Scroll Animations with better options and logging
    const observerOptions = {
        threshold: 0.1,  // Trigger when 10% of element is visible
        rootMargin: '0px 0px -50px 0px'  // Trigger 50px before entering viewport
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log('Observed and adding visible to:', entry.target.className);  // Debug log
                entry.target.classList.add('visible');
                // Optional: Unobserve after animation to save perf
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe features, mission, and value cards (staggered)
    document.querySelectorAll('.feature, .mission, .mission-item, .value-card, .values').forEach((el, index) => {
        observer.observe(el);
        // Stagger delays for value cards (optional)
        if (el.classList.contains('value-card')) {
            el.style.transitionDelay = `${index * 0.1}s`;
        }
    });

    const contactForm = document.getElementById('main-contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = {
                name: formData.get('name'),
                business_name: formData.get('business_name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                message: formData.get('message')
            };
            fetch('/submit_contact', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            })
            .then(response => {
                return response.json().then(json => ({
                    ok: response.ok,
                    data: json
                }));
            })
            .then(({ok, data}) => {
                if (!ok) {
                    throw data;
                }
                const responseEl = document.getElementById('form-response');
                responseEl.textContent = data.message;
                responseEl.className = 'success';
                this.reset();
            })
            .catch(error => {
                const responseEl = document.getElementById('form-response');
                responseEl.textContent = error.error || 'Error submitting form. Please try again.';
                responseEl.className = 'error';
                this.reset();
            });
        });
    }

    // ADDED BACK: beforeunload listener - Saves session on tab close/reload
    window.addEventListener('beforeunload', function() {
        if (hasAIInteraction) {
            saveCurrentSessionToServer();  // Sync save using sendBeacon
        }
    });

    // Chat button attention features
    let jumpCounter = 0;

    setInterval(() => {
        if (isChatClosed()) {
            jumpCounter++;
            if (jumpCounter % 3 !== 0){
                const chatButton = document.getElementById('chat-button');
                chatButton.classList.add('bouncing');
                setTimeout(() => {
                    chatButton.classList.remove('bouncing');
                }, 1600);  // Animation duration - two smooth jumps
            }
        }
    }, 12000);  // Every 12 seconds

    setInterval(() => {
        if (isChatClosed()) {
            const chatBubble = document.getElementById('chat-bubble');
            chatBubble.style.display = 'block';
            setTimeout(() => {
                chatBubble.style.display = 'none';
            }, 5000);  // Show for 5 seconds
        }
    }, 36000);  // Every 60 seconds

    // FAQ Scroll Animation (now safely inside DOMContentLoaded)
    const faqObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: faqObserver.unobserve(entry.target); // Uncomment if you want one-time only
            }
        });
    }, { threshold: 0.1 });

    const faqSection = document.querySelector('.faq-section');
    if (faqSection) {
        faqObserver.observe(faqSection);
    }

    // UPDATED: Enable Enter key for AI chat (now with textarea support and auto-resize)
    const userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {  // No shift = send; shift = new line
                e.preventDefault();
                debouncedSendMessage();
            }
        });
        // NEW: Auto-resize textarea on input for smoother multi-line feel
        userInput.addEventListener('input', function() {
            this.style.height = 'auto';  // Reset height
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';  // Grow to content or max (120px ~3 lines)
        });
    }
});

// FIXED: Attach menu button event listener (robust, overrides inline if needed)
const menuBtn = document.getElementById('menu-btn');
if (menuBtn) {
    menuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });
}

// Enhanced: Smooth scroll to bottom after adding messages
function scrollToBottom() {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.scrollTo({
        top: chatWindow.scrollHeight,
        behavior: 'smooth'
    });
}

// Override addBotMessage and addOptionButton to use smooth scroll
const originalAddBotMessage = window.addBotMessage;
window.addBotMessage = function(text, isSection = false) {
    originalAddBotMessage(text, isSection);
    setTimeout(scrollToBottom, 100); // Slight delay for smooth effect
};

const originalAddOptionButton = window.addOptionButton;
window.addOptionButton = function(sectionId, text) {
    originalAddOptionButton(sectionId, text);
    setTimeout(scrollToBottom, 100);
};

// Enhanced typing indicator with fade
const originalShowTypingIndicator = window.showTypingIndicator;
window.showTypingIndicator = function() {
    originalShowTypingIndicator();
    const typing = document.getElementById('typing-indicator');
    if (typing) {
        typing.style.opacity = '0';
        typing.style.transition = 'opacity 0.3s ease';
        setTimeout(() => typing.style.opacity = '1', 10);
    }
    scrollToBottom();
};

// Check if chat is closed
function isChatClosed() {
    return document.getElementById('chat-container').style.display === 'none';
}

// UPDATED: Toggle chat window - Fresh start on open, log & clear on close
function toggleChat() {
    // Prevent spam: if already processing, ignore
    if (isChatProcessing) return;

    const chatContainer = document.getElementById('chat-container');
    const isOpening = chatContainer.style.display === 'none';
    chatContainer.style.display = isOpening ? 'block' : 'none';
    if (isOpening) {
        isChatProcessing = true;
        // Disable chat button visually
        const chatButton = document.getElementById('chat-button');
        chatButton.style.pointerEvents = 'none';
        chatButton.style.opacity = '0.6';

        // Disable input field and send button during welcome animation
        const userInput = document.getElementById('userInput');
        const sendButton = document.querySelector('#chat-input-container .btn');
        userInput.disabled = true;
        userInput.placeholder = 'Please wait...';
        userInput.style.opacity = '0.6';
        if (sendButton) {
            sendButton.disabled = true;
            sendButton.style.opacity = '0.6';
            sendButton.style.cursor = 'not-allowed';
        }

        // Clear server-side history to start fresh session
        fetch('/clear_history', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        }).catch(error => {
            console.error('Error clearing history:', error);
        });

        // Always start fresh: Clear DOM and show welcome
        const chatWindow = document.getElementById('chat-window');
        chatWindow.innerHTML = '';  // Clear any lingering content
        currentSection = 'welcome';
        showSection('welcome', true);  // Fresh open: clear and build

        // Reset textarea height on open
        userInput.style.height = 'auto';

        // Re-enable after full animation (approx 4s buffer)
        setTimeout(() => {
            isChatProcessing = false;
            chatButton.style.pointerEvents = 'auto';
            chatButton.style.opacity = '1';
            
            // Re-enable input field and send button
            userInput.disabled = false;
            userInput.placeholder = 'Ask us anything...';
            userInput.style.opacity = '1';
            if (sendButton) {
                sendButton.disabled = false;
                sendButton.style.opacity = '1';
                sendButton.style.cursor = 'pointer';
            }
        }, 4000);
    } else {
        // Closing: instant, no processing delay needed
        isChatProcessing = false;
        const chatButton = document.getElementById('chat-button');
        chatButton.style.pointerEvents = 'auto';
        chatButton.style.opacity = '1';

        // On close: Log current session to server, then clear DOM
        if (hasAIInteraction) {
            saveCurrentSessionToServer();  // Save before close
        }
        hasAIInteraction = false;
        const chatWindow = document.getElementById('chat-window');
        chatWindow.innerHTML = '';  // Reset for next open
        document.getElementById('chat-bubble').style.display = 'none';  // Hide bubble if open
        // Close dropdown if open
        const dropdown = document.getElementById('menu-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
            dropdown.classList.remove('show');
        }
    }
}

// UPDATED: Extract and send current session history to server on close (async fetch)
function saveCurrentSessionToServer() {
    const chatWindow = document.getElementById('chat-window');
    const messages = [];
    chatWindow.querySelectorAll('.message').forEach(msg => {
        const role = msg.classList.contains('user') ? 'user' : 'assistant';
        const content = msg.textContent.trim();
        if (content) messages.push({ role, content });
    });
    
    if (messages.length === 0) return;  // No content to save
    
    // Create payload as Blob for sendBeacon
    const payload = new Blob([JSON.stringify({ session_messages: messages })], { type: 'application/json' });
    
    // sendBeacon is reliable even on unload
    navigator.sendBeacon('/log_history', payload);
    console.log('Session saved on unload');  // Optional debug (may not log if unload is abrupt)
}

// Welcome options (static for re-adding on back)
const welcomeOptions = [
    { id: 'faq', text: 'Frequently Asked Questions' },
    { id: 'contact', text: 'Contact Us' },
    { id: 'booking', text: 'Booking Help' },
    { id: 'products', text: 'Products & Services' },
    { id: 'pricing', text: 'Pricing' }
];

// Show specific section
async function showSection(sectionId, isFresh = false) {
    currentSection = sectionId;
    const chatWindow = document.getElementById('chat-window');
    const backBtn = document.getElementById('back-btn');

    if (sectionId === 'welcome') {
        backBtn.style.display = 'none';
        if (isFresh) {
            // Fresh open: clear and build full welcome
            chatWindow.innerHTML = '';
            showTypingIndicator();
            setTimeout(async () => {
                removeTypingIndicator();
                await delay(500);
                addBotMessage('Hello! I\'m Alex, your AI assistant. How can I help?');
                for (let option of welcomeOptions) {
                    await delay(400);
                    addOptionButton(option.id, option.text);
                }
                await delay(200);
                addBotMessage('Or type a request to begin a chat');
                chatWindow.scrollTop = chatWindow.scrollHeight;
            }, 1500);
        } else {
            // Back navigation: remove section response if present
            const sectionMsg = chatWindow.querySelector('.section-response');
            if (sectionMsg) {
                sectionMsg.remove();
            }
            // Rebuild full welcome if no greeting or buttons (since cleared on section nav)
            if (!chatWindow.querySelector('.message') || !chatWindow.querySelector('.option-btn')) {
                addBotMessage('Hello! I\'m Alex, your AI assistant. How can I help?');
                for (let option of welcomeOptions) {
                    addOptionButton(option.id, option.text);
                }
                addBotMessage('Or type a request to begin a chat');
            }
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    } else if (sectionId === 'ai-chat') {
        // Clear welcome messages and option buttons for AI chat
        chatWindow.innerHTML = '';
        addBotMessage('How can I assist you today?');
        backBtn.style.display = 'none';
        chatWindow.scrollTop = chatWindow.scrollHeight;
    } else if (sectionId === 'report-issue') {
        // Clear window to "open new space"
        chatWindow.innerHTML = '';
        // Remove option buttons (already cleared)
        addBotMessage(`
            Please describe the issue:<br>
            <form class="report-form-widget">
                <label>Message: <textarea class="report-message" required></textarea></label>
                <button type="submit" class="btn">Submit Report</button>
                <p class="report-response"></p>
            </form>
        `, true);  // Mark as section response
        submitReportForm();
        backBtn.style.display = 'block';
        chatWindow.scrollTop = chatWindow.scrollHeight;
    } else if (sectionId === 'find-out-more') {
        // Handle "Find Out More" - Navigate to about page in same tab
        window.location.href = '/about';
        return;  // No further processing
    } else {
        // Predefined sections (faq, contact, etc.) - "Open new space" by clearing window
        chatWindow.innerHTML = '';
        // Remove option buttons (already cleared)
        addBotMessage(infoResponses[sectionId], true);  // Mark as section response
        backBtn.style.display = 'block';
        if (sectionId === 'contact') {
            submitContactForm();
        }
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
}
// Helper function to convert markdown links and plain URLs to clickable HTML links
function convertLinksToHTML(text) {
    // First, convert markdown-style links [text](url) to HTML <a> tags
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Then, convert plain URLs to clickable links (but avoid double-converting already wrapped URLs)
    text = text.replace(/(?<!href="|">)(https?:\/\/[^\s<]+)(?![^<]*<\/a>)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    
    return text;
}

// Helper to add bot message (with optional section flag)
function addBotMessage(text, isSection = false) {
    const chatWindow = document.getElementById('chat-window');
    const botMsg = document.createElement('div');
    botMsg.classList.add('message', 'bot');
    if (isSection) {
        botMsg.classList.add('section-response');
    }
    
    // Convert links to clickable HTML
    const processedText = convertLinksToHTML(text);
    
    botMsg.innerHTML = `
        <img src="/static/alex-profile.png" alt="Alex Profile Picture" class="profile-img">
        <div class="message-content">
            <div class="bot-name">Alex</div>
            ${processedText}
        </div>
    `;
    chatWindow.appendChild(botMsg);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Attach form listener if the contact form is present in this message
    const form = botMsg.querySelector('.contact-form-widget');
    if (form) {
        submitContactForm(form);  // Pass the specific form instance
    }
}

// Helper to add option button
function addOptionButton(sectionId, text) {
    const chatWindow = document.getElementById('chat-window');
    const optionBtn = document.createElement('button');
    optionBtn.classList.add('option-btn');
    optionBtn.innerHTML = text;
    // Updated onclick: pass false for non-fresh (back nav)
    optionBtn.onclick = () => showSection(sectionId, false);
    chatWindow.appendChild(optionBtn);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const chatWindow = document.getElementById('chat-window');
    const typing = document.createElement('div');
    typing.id = 'typing-indicator';
    typing.classList.add('typing-indicator');
    typing.innerHTML = `
        <img src="/static/alex-profile.png" alt="Alex Profile Picture" class="profile-img">
        <span></span><span></span><span></span>
    `;
    chatWindow.appendChild(typing);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
}

// Utility: Delay helper
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Debounce helper (simple implementation if lodash not available)
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

// Debounce sendMessage to prevent rapid fires (e.g., 1 second cooldown)
const debouncedSendMessage = debounce(sendMessage, 1000);  // 1-second debounce

// Chat Functionality (AI mode)
function sendMessage() {
    const userInput = document.getElementById('userInput');
    
    // Prevent sending during welcome animation or processing
    if (isChatProcessing || userInput.disabled) {
        return;
    }
    
    const message = userInput.value.trim();
    if (!message) return;

    // Enforce max character limit on user message
    if (message.length > MAX_USER_MESSAGE_LENGTH) {
        addBotMessage(`Message too long. Maximum ${MAX_USER_MESSAGE_LENGTH} characters allowed.`);
        return;
    }

    // Switch to AI chat section only if not already in it
    if (currentSection !== 'ai-chat') {
        showSection('ai-chat');
    }

    // Add user message
    const chatWindow = document.getElementById('chat-window');
    const userMsg = document.createElement('div');
    userMsg.classList.add('message', 'user');
    userMsg.innerHTML = `<strong>You:</strong> ${message}`;
    chatWindow.appendChild(userMsg);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Show typing indicator
    showTypingIndicator();

    // Send to backend with delay simulation
    setTimeout(() => {
        fetch('/chat', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({message: message})
        })
        .then(response => {
            return response.json().then(json => ({
                ok: response.ok,
                data: json
            }));
        })
        .then(({ok, data}) => {
            if (!ok) {
                throw data;
            }
            removeTypingIndicator();
            addBotMessage(data.reply);
            hasAIInteraction = true;
        })
        .catch(error => {
            removeTypingIndicator();
            addBotMessage(error.reply || error.error || 'Sorry, something went wrong. Please try again.');
        });
    }, 1000);  // 1-second delay for typing effect

    userInput.value = '';
    // Reset height after send
    userInput.style.height = 'auto';
}

// Contact Form Submission (for widget)
// Updated to accept an optional form parameter for targeted attachment
function submitContactForm(targetForm = null) {
    const form = targetForm || document.querySelector('.contact-form-widget');
    if (!form) return;  // Form might not exist
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = form.querySelector('.contact-name').value;
        const business_name = form.querySelector('.contact-business-name').value;
        const email = form.querySelector('.contact-email').value;
        const phone = form.querySelector('.contact-phone').value;
        const message = form.querySelector('.contact-message').value;

        fetch('/submit_contact', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, business_name, email, phone, message})
        })
        .then(response => {
            return response.json().then(json => ({
                ok: response.ok,
                data: json
            }));
        })
        .then(({ok, data}) => {
            if (!ok) {
                throw data;
            }
            const responseEl = form.querySelector('.contact-response');
            responseEl.textContent = data.message;
            responseEl.className = 'success';
            form.reset();
        })
        .catch(error => {
            console.error('Error:', error);
            const responseEl = form.querySelector('.contact-response');
            responseEl.textContent = error.error || 'Error submitting form. Please try again.';
            responseEl.className = 'error';
            form.reset();
        });
    });
}

function toggleFaq(questionElement) {
    const answer = questionElement.nextElementSibling;
    const toggle = questionElement.querySelector('.faq-toggle');
    if (answer.style.display === 'block') {
        answer.style.display = 'none';
        toggle.textContent = '+';
    } else {
        answer.style.display = 'block';
        toggle.textContent = '−';
    }
}

// UPDATED: Reset chat - Log before reset and clear server history
function resetChat() {
    if (hasAIInteraction) {
        saveCurrentSessionToServer();  // Only save if there was an AI interaction
    }
    
    // Clear server-side history for fresh start
    fetch('/clear_history', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    }).catch(error => {
        console.error('Error clearing history:', error);
    });
    
    const chatWindow = document.getElementById('chat-window');
    chatWindow.innerHTML = '';
    currentSection = 'welcome';
    hasAIInteraction = false;
    showSection('welcome');
}

// Report Form Submission
function submitReportForm(targetForm = null) {
    const form = targetForm || document.querySelector('.report-form-widget');
    if (!form) return;  // Form might not exist
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const message = form.querySelector('.report-message').value;

        // Fetch current chat history from backend
        fetch('/get_history')
            .then(response => response.json())
            .then(history => {
                // Format history as a string
                const formattedHistory = history.map(msg => `[${msg.role.toUpperCase()}]: ${msg.content}`).join('\n\n');

                // Send to backend
                fetch('/submit_report', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({message, history: formattedHistory})
                })
                .then(response => {
                    return response.json().then(json => ({
                        ok: response.ok,
                        data: json
                    }));
                })
                .then(({ok, data}) => {
                    if (!ok) {
                        throw data;
                    }
                    const responseEl = form.querySelector('.report-response');
                    responseEl.textContent = data.message;
                    responseEl.className = 'success';
                    form.reset();
                })
                .catch(error => {
                    console.error('Error:', error);
                    const responseEl = form.querySelector('.report-response');
                    responseEl.textContent = error.error || 'Error submitting report. Please try again.';
                    responseEl.className = 'error';
                    form.reset();
                });
            })
            .catch(error => {
                console.error('Error fetching history:', error);
                alert('Could not fetch chat history. Please try again.');
            });
    });
}
// NEW: Observer for Nebula Nodes (staggered reveal)
const nebulaObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 300); // Stagger by 300ms per node for nebula "ignition"
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }); // Earlier trigger for dramatic entrance

// Observe nodes on load
document.querySelectorAll('.node').forEach(node => {
    nebulaObserver.observe(node);
});

// Nebula Interactivity: Hover/Click for Expansions & Line Highlights
document.querySelectorAll('.node').forEach(node => {
    const value = node.dataset.value;
    
    // Hover: Highlight connected synapses
    node.addEventListener('mouseenter', () => {
        document.querySelectorAll('.synapse').forEach(line => {
            if (line.dataset.from.includes(value) || line.dataset.to.includes(value)) {
                line.classList.add('active');
            }
        });
        node.classList.add('active'); // Trigger expand for desktop
    });
    
    node.addEventListener('mouseleave', () => {
        document.querySelectorAll('.synapse').forEach(line => line.classList.remove('active'));
        node.classList.remove('active');
    });
    
    // Click: Toggle expansion (for touch/mobile)
    node.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        node.classList.toggle('active');
        // Close others
        document.querySelectorAll('.node').forEach(other => {
            if (other !== node) other.classList.remove('active');
        });
    });
});

// Close node-expand when clicking outside or on the backdrop
document.addEventListener('click', (e) => {
    if (!e.target.closest('.node') && !e.target.closest('.node-expand')) {
        document.querySelectorAll('.node').forEach(node => {
            node.classList.remove('active');
        });
    }
});

// Close node-expand when clicking on the backdrop (::before pseudo-element area)
document.querySelectorAll('.node-expand').forEach(expand => {
    expand.addEventListener('click', (e) => {
        // Only close if clicking directly on the expand (not on content inside)
        if (e.target === expand) {
            document.querySelectorAll('.node').forEach(node => {
                node.classList.remove('active');
            });
        }
    });
});

// Synapse lines visibility on nebula load
const lines = document.querySelectorAll('.synapse');
setTimeout(() => {
    lines.forEach((line, index) => {
        setTimeout(() => line.classList.add('visible'), index * 500);
    });
}, 1000); // Delayed entrance for "forming" effect

// FIXED: Toggle Menu (Dynamic Under Dots) - Precise positioning under menu button
function toggleMenu() {
    const dropdown = document.getElementById('menu-dropdown');
    const menuBtn = document.getElementById('menu-btn');
    if (!dropdown || !menuBtn) return;

    const isVisible = dropdown.classList.contains('show');
    
    if (isVisible) {
        // Close
        dropdown.style.display = 'none';
        dropdown.classList.remove('show');
        dropdown.style.position = '';
        dropdown.style.top = '';
        dropdown.style.left = '';
        dropdown.style.width = '';
        dropdown.style.removeProperty('--arrow-offset');  // Reset custom property
    } else {
        // Open: Position dynamically under the button (fixed for overlay)
        const btnRect = menuBtn.getBoundingClientRect();
        
        dropdown.style.position = 'fixed';
        dropdown.style.top = `${btnRect.bottom + 5}px`;
        dropdown.style.left = `${btnRect.left}px`;
        dropdown.style.width = `${btnRect.width}px`;
        dropdown.style.zIndex = '1002';
        dropdown.style.display = 'block';
        
        // NEW: Calculate arrow offset to center above button
        const arrowOffset = (btnRect.width / 2) - 6;  // 6px = half arrow width (12px total)
        dropdown.style.setProperty('--arrow-offset', `${arrowOffset}px`);
        
        setTimeout(() => dropdown.classList.add('show'), 10);
    }
}
// FIXED: Close on Outside Click (enhanced to include menuBtn check and only if open)
document.addEventListener('click', function(event) {
    const menuBtn = document.getElementById('menu-btn');
    const dropdown = document.getElementById('menu-dropdown');
    
    if (dropdown && dropdown.style.display === 'block' && !menuBtn.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.style.display = 'none';
        dropdown.classList.remove('show');
        dropdown.style.position = '';
        dropdown.style.top = '';
        dropdown.style.left = '';
        dropdown.style.width = '';
    }
});

// FIXED: Escape Close (only if open)
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('menu-dropdown');
        if (dropdown && dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
            dropdown.classList.remove('show');
            dropdown.style.position = '';
            dropdown.style.top = '';
            dropdown.style.left = '';
            dropdown.style.width = '';
        }
    }
});
/* ====================================================
   REVOLUTIONARY HERO INTERACTIVE FEATURES
   ==================================================== */

// Animated Mesh Background
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('mesh-canvas');
    
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        
        // Particle system
        const particles = [];
        const particleCount = 50;
        const connectionDistance = 150;
        
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = 2;
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 168, 204, 0.6)';
                ctx.fill();
            }
        }
        
        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        
        function connectParticles() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < connectionDistance) {
                        const opacity = 1 - (distance / connectionDistance);
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 168, 204, ${opacity * 0.3})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }
        
        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            connectParticles();
            requestAnimationFrame(animate);
        }
        
        animate();
        
        // Resize handler
        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });
    }
});

// Stat Counter Animation
document.addEventListener('DOMContentLoaded', function() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    if (statNumbers.length > 0) {
        const animateCounter = (element) => {
            const target = parseInt(element.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const step = target / (duration / 16); // 60fps
            let current = 0;
            
            const updateCounter = () => {
                current += step;
                if (current < target) {
                    element.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target;
                }
            };
            
            updateCounter();
        };
        
        // Intersection Observer to trigger animation when in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statNumbers.forEach(stat => observer.observe(stat));
    }
});

    // Make sendMessage use widget API when in widget mode
    const originalSendMessage = window.sendMessage;
    window.sendMessage = function() {
        if (ChatbotWidget.useWidgetMode && ChatbotWidget.apiEndpoint) {
            // Widget mode: use API endpoints
            const userInput = document.getElementById('userInput');
            if (!userInput) return;
            
            if (isChatProcessing || userInput.disabled) return;
            
            const message = userInput.value.trim();
            if (!message) return;

            if (message.length > MAX_USER_MESSAGE_LENGTH) {
                addBotMessage(`Message too long. Maximum ${MAX_USER_MESSAGE_LENGTH} characters allowed.`);
                return;
            }

            if (currentSection !== 'ai-chat') {
                showSection('ai-chat');
            }

            const chatWindow = document.getElementById('chat-window');
            const userMsg = document.createElement('div');
            userMsg.classList.add('message', 'user');
            userMsg.innerHTML = `<strong>You:</strong> ${message}`;
            chatWindow.appendChild(userMsg);
            chatWindow.scrollTop = chatWindow.scrollHeight;

            showTypingIndicator();

            setTimeout(() => {
                fetch(`${ChatbotWidget.apiEndpoint}/chat`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${ChatbotWidget.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: message,
                        session_id: ChatbotWidget.sessionId
                    })
                })
                .then(response => response.json())
                .then(({ok, data}) => {
                    if (!ok) throw data;
                    removeTypingIndicator();
                    addBotMessage(data.reply);
                    hasAIInteraction = true;
                })
                .catch(error => {
                    removeTypingIndicator();
                    addBotMessage(error.reply || error.error || 'Sorry, something went wrong. Please try again.');
                });
            }, 1000);

            userInput.value = '';
            userInput.style.height = 'auto';
        } else {
            // Full-page mode: use original function
            originalSendMessage();
        }
    };

})(); // Close IIFE
