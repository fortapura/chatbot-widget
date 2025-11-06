(function() {
    const ChatbotWidget = {
      config: null,
      sessionId: null,
      isOpen: false,
  
      init: function(options) {
        this.apiKey = options.apiKey;
        this.apiEndpoint = options.apiEndpoint || 'https://chatbot-cloud-backend.onrender.com/v1';
        this.sessionId = this.generateSessionId();
        
        // Fetch client configuration
        this.fetchConfig().then(() => {
          this.injectStyles();
          this.injectHTML();
          this.attachEventListeners();
        });
      },
  
      generateSessionId: function() {
        // Check localStorage for existing session
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
        this.config = await response.json();
      },
  
      injectStyles: function() {
        const style = document.createElement('style');
        style.textContent = `
          #chat-button {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: linear-gradient(135deg, color-mix(in srgb, ${this.config.primary_color} 20%, black) 0%, color-mix(in srgb, ${this.config.primary_color} 20%, black) 100%);
            color: white;
            padding: 16px;
            border-radius: 50%;
            box-shadow: 0 8px 24px color-mix(in srgb, ${this.config.primary_color} 50%, black)99;
            cursor: pointer;
            z-index: 1000;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            border: none;
        }

        #chat-button::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 3px solid ${this.config.primary_color};
            opacity: 0;
            animation: subtlePulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        #chat-button::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 3px solid ${this.config.primary_color}99;
            opacity: 0;
            animation: subtlePulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite 1.5s;
        }

        @keyframes subtlePulse {
            0% {
                width: 100%;
                height: 100%;
                opacity: 0.8;
            }
            50% {
                width: 140%;
                height: 140%;
                opacity: 0;
            }
            100% {
                width: 140%;
                height: 140%;
                opacity: 0;
            }
        }

        #chat-button:hover {
            transform: scale(1.15) translateY(-4px) rotate(5deg);
            box-shadow: 0 16px 40px color-mix(in srgb, ${this.config.primary_color} 50%, white)99;
            background: linear-gradient(135deg, ${this.config.primary_color} 0%, color-mix(in srgb, ${this.config.primary_color} 80%, black) 100%);
        }
  
        #chat-button.bouncing {
            animation: doubleJump 1.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
  
        @keyframes doubleJump {
            0% { 
                transform: translateY(0);
      }
      12% {
          transform: translateY(-18px);
      }
      24% {
          transform: translateY(0);
      }
      30% {
          transform: translateY(0);
      }
      42% {
          transform: translateY(-18px);
      }
      54% {
          transform: translateY(0);
      }
      100% {
          transform: translateY(0);
      }
  }
  
  #chat-container {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 360px;
      max-height: 70vh;
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 16px 48px color-mix(in srgb, ${this.config.primary_color} 50%, black)33;
      z-index: 1000;
      display: none;
      overflow: hidden;
      font-family: 'Roboto', sans-serif;
      backdrop-filter: blur(10px);
      border: 1px solid color-mix(in srgb, ${this.config.primary_color} 50%, black)1a;
  }

  #chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: linear-gradient(135deg, ${this.config.primary_color} 0%, ${this.config.secondary_color} 100%);
      color: white;
      font-size: 1.1em;
      font-weight: 500;
      position: relative;
      box-shadow: 0 4px 12px color-mix(in srgb, ${this.config.primary_color} 50%, black)33;
  }
  
  .header-actions-left,
  .header-actions-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
  }
  
  .chat-title {
      flex: 1;
      text-align: center;
      margin: 0 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
  }
  
  .header-btn {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 8px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1.1em;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      line-height: 1;
  }
  
  .header-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
  }
  
  .menu-dropdown {
      background: color-mix(in srgb, ${this.config.primary_color} 20%, black);
      backdrop-filter: blur(20px);
      border: 1px solid ${this.config.primary_color}66;
      border-radius: 12px;
      min-width: 160px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
      z-index: 1002;
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
      transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 8px;
  }

  .menu-dropdown::before {
      content: '';
      position: absolute;
      top: -6px;
      left: 20px;
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 6px solid color-mix(in srgb, ${this.config.primary_color} 20%, black);
  }
  
  .menu-dropdown.show {
      opacity: 1;
      transform: translateY(0) scale(1);
      display: block !important;
  }
  
  .menu-item {
      display: block;
      padding: 14px 20px;
      color: white;
      text-decoration: none;
      font-size: 0.95em;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
      white-space: nowrap;
  }
  
  .menu-item:hover {
      background: ${this.config.primary_color}4d;
      padding-left: 24px;
  }
  
  .menu-item:last-child {
      border-bottom: none;
  }
  
  #chat-window {
      flex: 1;
      max-height: 400px;
      overflow-y: auto;
      padding: 20px;
      background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
      scrollbar-width: thin;
      scrollbar-color: ${this.config.primary_color} #e2e8f0;
  }

  #chat-window::-webkit-scrollbar {
      width: 6px;
  }

  #chat-window::-webkit-scrollbar-track {
      background: #e2e8f0;
      border-radius: 3px;
  }

  #chat-window::-webkit-scrollbar-thumb {
      background: ${this.config.primary_color};
      border-radius: 3px;
  }
  
  #chat-input-container {
      display: flex;
      gap: 12px;
      padding: 20px;
      border-top: 1px solid #e2e8f0;
      background: white;
      align-items: flex-end;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
  }
  
  #userInput {
      flex: 1;
      min-height: 48px;
      max-height: 140px;
      padding: 12px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 24px;
      font-family: inherit;
      font-size: 14px;
      resize: none;
      overflow-y: auto;
      word-wrap: break-word;
      line-height: 1.5;
      transition: all 0.3s ease;
      box-sizing: border-box;
      background: #f8f9fa;
  }
  
  #userInput:focus {
      outline: none;
      border-color: ${this.config.primary_color};
      box-shadow: 0 0 0 4px ${this.config.primary_color}1a;
      background: white;
  }

  #chat-input-container .btn {
      background: ${this.config.primary_color}; /* Solid blue—change this hex to your preferred color! */
      color: white;
      border: none;
      transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
      padding: 12px 20px;
      border-radius: 24px;
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
      min-width: 80px;
  }

  #chat-input-container .btn:hover {
      background: color-mix(in srgb, ${this.config.primary_color} 90%, black); /* Slightly darker blue on hover for feedback—tweak if needed */
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 168, 204, 0.3);
  }
  
  .message {
      margin: 12px 0;
      padding: 14px 18px;
      border-radius: 18px;
      max-width: 85%;
      font-size: 0.95em;
      line-height: 1.5;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      animation: messageSlide 0.3s ease;
      overflow: hidden;
  }
  
  @keyframes messageSlide {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
  }
  
  .user {
      background: linear-gradient(135deg, ${this.config.primary_color} 0%, color-mix(in srgb, ${this.config.primary_color} 90%, black) 100%);
      color: white;
      align-self: flex-end;
      margin-left: auto;
      border-bottom-right-radius: 6px;
      font-weight: 400;
  }

  .bot {
      background: #f1f5f9;
      color: color-mix(in srgb, ${this.config.primary_color} 50%, black);
      align-self: flex-start;
      margin-right: auto;
      border-bottom-left-radius: 6px;
      display: flex;
      align-items: flex-start;
      font-weight: 400;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      overflow: hidden;
      max-width: 85%;
  }
  
  .profile-img {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 10px;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .message-content {
      flex: 1;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      max-width: 100%;
  }
  
  .message-content a {
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-all;
      display: inline-block;
      max-width: 100%;
      color: ${this.config.primary_color};
      text-decoration: underline;
      transition: color 0.2s ease;
  }

  .message-content a:hover {
      color: color-mix(in srgb, ${this.config.primary_color} 90%, black);
      text-decoration: underline;
  }

  .bot-name {
      font-weight: 600;
      font-size: 0.85em;
      margin-bottom: 6px;
      color: color-mix(in srgb, ${this.config.primary_color} 50%, black);
  }
  
  .contact-form-widget {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 15px;
      width: 100%;
      max-width: 100%;
  }
  
  .contact-form-widget label {
      display: block;
      font-size: 0.85em;
      font-weight: 500;
      color: color-mix(in srgb, ${this.config.primary_color} 40%, black);
      margin-bottom: 0;
  }
  
  .contact-form-widget input,
  .contact-form-widget textarea {
      width: 100%;
      max-width: 100%;
      padding: 8px 10px;
      margin-top: 4px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-family: 'Roboto', sans-serif;
      font-size: 0.85em;
      background: white;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
      box-sizing: border-box;
      display: block;
  }
  
  .contact-form-widget input:focus,
  .contact-form-widget textarea:focus {
      outline: none;
      border-color: ${this.config.primary_color};
      box-shadow: 0 0 0 3px rgba(0, 168, 204, 0.1);
  }
  
  .contact-form-widget textarea {
      min-height: 80px;
      resize: vertical;
  }
  
  .contact-form-widget button {
      width: 100%;
      background: ${this.config.primary_color};
      color: white;
      border: none;
      padding: 12px 20px;
      margin-top: 6px;
      border-radius: 8px;
      font-size: 0.9em;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-sizing: border-box;
  }

  .contact-form-widget button:hover {
      background: color-mix(in srgb, ${this.config.primary_color} 90%, black);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 168, 204, 0.3);
  }
  
  .contact-form-widget .contact-response {
      margin-top: 10px;
      padding: 10px;
      border-radius: 8px;
      font-size: 0.9em;
      text-align: center;
  }
  
  .typing-indicator {
      background: #f1f5f9;
      color: #000000;
      align-self: flex-start;
      margin-right: auto;
      padding: 14px 18px;
      border-radius: 18px;
      max-width: 85%;
      font-size: 0.95em;
      display: flex;
      align-items: center;
      border-bottom-left-radius: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .typing-indicator span {
      display: inline-block;
      width: 8px;
      height: 8px;
      margin: 0 2px;
      background: linear-gradient(135deg, #000000 0%, #000000 100%);
      border-radius: 50%;
      animation: typing 1.4s infinite ease-in-out;
  }
  
  .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
  }
  
  .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
  }
  
  @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
  }
  
  .option-btn {
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      color: color-mix(in srgb, ${this.config.primary_color} 50%, black);
      padding: 12px 16px;
      margin: 6px 0;
      border: 1px solid #cbd5e0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.5s ease; /* Increased transition duration for less reactivity */
      font-size: 0.9em;
      font-weight: 500;
      display: block;
      width: 90%;
      text-align: left;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .option-btn:hover {
      background: linear-gradient(135deg, ${this.config.primary_color} 0%, color-mix(in srgb, ${this.config.primary_color} 90%, black) 100%);
      color: white;
      transform: none; /* Removed transform for subtler effect */
      box-shadow: 0 2px 6px ${this.config.primary_color}36; /* Softer shadow */
      border-color: ${this.config.primary_color};
  }

  .section-response {
      background: #f8fafc !important;
      border-left: 4px solid ${this.config.primary_color};
      margin-top: 8px !important;
  }

  #chat-bubble {
      position: fixed;
      bottom: 90px;
      right: 50px;
      background: linear-gradient(135deg, #ffffff 0%, #ffffff 100%);
      color: rgb(0, 0, 0);
      padding: 12px 20px;
      border-radius: 24px;
      box-shadow: 0 8px 24px ${this.config.primary_color}4d;
      font-size: 0.95em;
      font-weight: 500;
      display: none;
      z-index: 1001;
      animation: bubbleFloat 0.6s ease-in-out;
      outline: 6px solid #0000 ;
  }
  
  @keyframes bubbleFloat {
      0% { transform: translateY(10px) scale(0.9); opacity: 0; }
      100% { transform: translateY(0) scale(1); opacity: 1; }
  }
  
  @media (max-width: 768px) {
  #chat-container {
          width: 95%;
          max-width: 340px;
          right: 2.5%;
          bottom: 16px;
          max-height: 80vh;
      }
  
      #chat-button {
          bottom: 16px;
          right: 16px;
          width: 56px;
          height: 56px;
          font-size: 20px;
      }
  
      #chat-header {
          padding: 16px;
      }
  
      .header-btn {
          width: 36px;
          height: 36px;
          font-size: 1em;
      }
  
      #chat-window {
          padding: 16px;
          max-height: 300px;
      }
  
      #chat-input-container {
          padding: 16px;
          gap: 8px;
      }
  
      #userInput {
          min-height: 44px;
          padding: 10px 14px;
          font-size: 16px; /* Prevent zoom on iOS */
      }
  
      .message {
          max-width: 90%;
          padding: 12px 16px;
      }
  
      .option-btn {
          width: 95%;
          padding: 10px 14px;
          font-size: 0.95em;
      }
  
      /* Contact Form Widget Mobile Styles */
      .contact-form-widget {
          gap: 8px;
          margin-top: 10px;
      }
  
      .contact-form-widget label {
          font-size: 13px;
          margin-bottom: 0;
      }
  
      .contact-form-widget input,
      .contact-form-widget textarea {
          padding: 10px;
          font-size: 14px;
          margin-top: 3px;
          border-radius: 6px;
      }
  
      .contact-form-widget textarea {
          min-height: 70px;
      }
  
      .contact-form-widget button {
          width: 100%;
          padding: 12px;
          font-size: 14px;
          font-weight: 600;
          margin-top: 4px;
      }
  
      .contact-response {
          font-size: 13px;
      }
  }
  
  
        `;
        document.head.appendChild(style);
      },
  
      injectHTML: function() {
        const container = document.createElement('div');
        container.id = 'chatbot-container';
        container.innerHTML = `
          <div id="chat-button" onclick="toggleChat()">
          <i class="fas fa-comment-dots"></i>
      </div>
      <div id="chat-container" style="display: none;">
          <div id="chat-header">
              <div class="header-actions-left">
                  <button id="menu-btn" class="header-btn" title="More Options">
                      <i class="fas fa-ellipsis-v"></i>
                  </button>
                  <button id="back-btn" class="header-btn back-btn" style="display: none;" onclick="showSection('welcome')" title="Back to Welcome">
                      <i class="fas fa-arrow-left"></i>
                  </button>
              </div>
              <div class="chat-title">Chat with Alex</div>
              <div class="header-actions-right">
                  <button id="reset-btn" class="header-btn reset-btn" onclick="resetChat()" title="Reset Chat">
                      <i class="fas fa-sync-alt"></i>
                  </button>
              </div>
          </div>
          <div id="chat-window"></div>
          <div id="chat-input-container">
              <textarea id="userInput" placeholder="Ask us anything..." rows="1" onkeydown="if(event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); debouncedSendMessage(); }"></textarea>
              <button onclick="sendMessage()" class="btn">Send</button>
          </div>
      </div>
      <!-- NEW: Menu Dropdown (positioned dynamically by JS) -->
      <div id="menu-dropdown" class="menu-dropdown">
          <a href="#" class="menu-item" onclick="showSection('report-issue'); toggleMenu(); return false;" title="Report Issue">
              <i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i>Report Issue
          </a>
          <a href="#" class="menu-item" onclick="showSection('find-out-more'); toggleMenu(); return false;" title="Find Out More">
              <i class="fas fa-info-circle" style="margin-right: 8px;"></i>Find Out More
          </a>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 0;">
          <a href="#" class="menu-item" onclick="toggleChat(); return false;" title="Close Chat">
              <i class="fas fa-times" style="margin-right: 8px;"></i>Close Chat
          </a>
      </div>
      <div id="chat-bubble" style="display: none;">Try me!</div>
        `;
        document.body.appendChild(container);
      }
    };
  
    // Predefined responses (hardcoded for simplicity, could fetch from backend)
    const infoResponses = {
      faq: 'Frequently Asked Questions:<br>- Our FAQ section is covered on the home page of this website.',
      contact: 'You can reach us at:<br>📧 Email: info@fortapura.com<br>📞 Phone: 07709 536967<br><br>Or type your enquiry here and I can collect your details and send them to our team!',
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
  
    document.addEventListener('DOMContentLoaded', function() {
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
                      if (chatButton) {
                          chatButton.classList.add('bouncing');
                          setTimeout(() => {
                              if (chatButton) {
                                  chatButton.classList.remove('bouncing');
                              }
                          }, 1600);  // Animation duration - two smooth jumps
                      }
                  }
              }
          }, 12000);  // Every 12 seconds
  
          setInterval(() => {
              if (isChatClosed()) {
                  const chatBubble = document.getElementById('chat-bubble');
                  if (chatBubble && chatBubble.style) {
                      chatBubble.style.display = 'block';
                      setTimeout(() => {
                          if (chatBubble && chatBubble.style) {
                              chatBubble.style.display = 'none';
                          }
                      }, 5000);  // Show for 5 seconds
                  }
              }
          }, 36000);  // Every 60 seconds
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
      const chatContainer = document.getElementById('chat-container');
      if (!chatContainer || !chatContainer.style) {
          return true;
      }
      return chatContainer.style.display === 'none';
  }
  
  // UPDATED: Toggle chat window - Fresh start on open, log & clear on close
  function toggleChat() {
      // Prevent spam: if already processing, ignore
      if (isChatProcessing) return;
  
      const chatContainer = document.getElementById('chat-container');
      if (!chatContainer || !chatContainer.style) return;
      
      const isOpening = chatContainer.style.display === 'none';
      chatContainer.style.display = isOpening ? 'block' : 'none';
      if (isOpening) {
          isChatProcessing = true;
          // Disable chat button visually
          const chatButton = document.getElementById('chat-button');
          if (chatButton) {
              chatButton.style.pointerEvents = 'none';
              chatButton.style.opacity = '0.6';
          }
  
          // Disable input field and send button during welcome animation
          const userInput = document.getElementById('userInput');
          const sendButton = document.querySelector('#chat-input-container .btn');
          if (userInput) {
              userInput.disabled = true;
              userInput.placeholder = 'Please wait...';
              userInput.style.opacity = '0.6';
          }
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
          if (userInput) {
              userInput.style.height = 'auto';
          }
  
          // Re-enable after full animation (approx 4s buffer)
          setTimeout(() => {
              isChatProcessing = false;
              if (chatButton) {
                  chatButton.style.pointerEvents = 'auto';
                  chatButton.style.opacity = '1';
              }
              
              // Re-enable input field and send button
              if (userInput) {
                  userInput.disabled = false;
                  userInput.placeholder = 'Ask us anything...';
                  userInput.style.opacity = '1';
              }
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
          if (chatButton) {
              chatButton.style.pointerEvents = 'auto';
              chatButton.style.opacity = '1';
          }
  
          // On close: Log current session to server, then clear DOM
          if (hasAIInteraction) {
              saveCurrentSessionToServer();  // Save before close
          }
          hasAIInteraction = false;
          const chatWindow = document.getElementById('chat-window');
          if (chatWindow) {
              chatWindow.innerHTML = '';  // Reset for next open
          }
          const chatBubble = document.getElementById('chat-bubble');
          if (chatBubble && chatBubble.style) {
              chatBubble.style.display = 'none';  // Hide bubble if open
          }
          // Close dropdown if open
          const dropdown = document.getElementById('menu-dropdown');
          if (dropdown && dropdown.style) {
              dropdown.style.display = 'none';
              dropdown.classList.remove('show');
          }
      }
  }
  
  // UPDATED: Extract and send current session history to server on close (async fetch)
  function saveCurrentSessionToServer() {
      const chatWindow = document.getElementById('chat-window');
      if (!chatWindow) return;
      
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
          if (backBtn) {
              backBtn.style.display = 'none';
          }
          if (isFresh) {
              // Fresh open: clear and build full welcome
              if (chatWindow) {
                  chatWindow.innerHTML = '';
              }
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
                  if (chatWindow) {
                      chatWindow.scrollTop = chatWindow.scrollHeight;
                  }
              }, 1500);
          } else {
              // Back navigation: remove section response if present
              if (chatWindow) {
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
          }
      } else if (sectionId === 'ai-chat') {
          // Clear welcome messages and option buttons for AI chat
          if (chatWindow) {
              chatWindow.innerHTML = '';
          }
          addBotMessage('How can I assist you today?');
          if (backBtn) {
              backBtn.style.display = 'none';
          }
          if (chatWindow) {
              chatWindow.scrollTop = chatWindow.scrollHeight;
          }
      } else if (sectionId === 'report-issue') {
          // Clear window to "open new space"
          if (chatWindow) {
              chatWindow.innerHTML = '';
          }
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
          if (backBtn) {
              backBtn.style.display = 'block';
          }
          if (chatWindow) {
              chatWindow.scrollTop = chatWindow.scrollHeight;
          }
      } else if (sectionId === 'find-out-more') {
          // Handle "Find Out More" - Navigate to about page in same tab
          window.location.href = '/about';
          return;  // No further processing
      } else {
          // Predefined sections (faq, contact, etc.) - "Open new space" by clearing window
          if (chatWindow) {
              chatWindow.innerHTML = '';
          }
          // Remove option buttons (already cleared)
          addBotMessage(infoResponses[sectionId], true);  // Mark as section response
          if (backBtn) {
              backBtn.style.display = 'block';
          }
          if (sectionId === 'contact') {
              submitContactForm();
          }
          if (chatWindow) {
              chatWindow.scrollTop = chatWindow.scrollHeight;
          }
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
      if (!chatWindow) return;
      
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
      if (!chatWindow) return;
      
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
      if (!chatWindow) return;
      
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
  
  // Debounce helper function (native JavaScript implementation)
  function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
          const later = () => {
              clearTimeout(timeout);
              func.apply(this, args);
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
      if (!chatWindow) return;
      
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
  
      if (userInput) {
          userInput.value = '';
          // Reset height after send
          userInput.style.height = 'auto';
      }
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
      if (chatWindow) {
          chatWindow.innerHTML = '';
      }
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
  
  // FIXED: Toggle Menu (Dynamic Under Dots) - Precise positioning under menu button
  function toggleMenu() {
      const dropdown = document.getElementById('menu-dropdown');
      const menuBtn = document.getElementById('menu-btn');
      if (!dropdown || !menuBtn || !dropdown.style) return;
  
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
      
      if (dropdown && dropdown.style && dropdown.style.display === 'block' && menuBtn && !menuBtn.contains(event.target) && !dropdown.contains(event.target)) {
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
          if (dropdown && dropdown.style && dropdown.style.display === 'block') {
              dropdown.style.display = 'none';
              dropdown.classList.remove('show');
              dropdown.style.position = '';
              dropdown.style.top = '';
              dropdown.style.left = '';
              dropdown.style.width = '';
          }
      }
  });
  
  // For altering retrieved colors:
  function lightenColor(hex, percent) {
    // Remove the # if present
    hex = hex.replace(/^#/, '');
    // Convert to RGB
    let num = parseInt(hex, 16);
    let r = (num >> 16) + Math.round(2.55 * percent);
    let g = ((num >> 8) & 0x00FF) + Math.round(2.55 * percent);
    let b = (num & 0x0000FF) + Math.round(2.55 * percent);
    // Clamp values and reassemble
    return (
      '#' +
      (
        0x1000000 +
        (r < 255 ? (r < 0 ? 0 : r) : 255) * 0x10000 +
        (g < 255 ? (g < 0 ? 0 : g) : 255) * 0x100 +
        (b < 255 ? (b < 0 ? 0 : b) : 255)
      )
        .toString(16)
        .slice(1)
    );
  }
      
    window.ChatbotWidget = ChatbotWidget;
  })();
  
  
