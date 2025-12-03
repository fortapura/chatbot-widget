(function() {
    const ChatbotWidget = {
      config: null,
      sessionId: null,
      isOpen: false,
  
      init: function(options) {
        this.apiKey = options.apiKey;
        this.apiEndpoint = options.apiEndpoint || 'https://chatbot-cloud-backend.onrender.com/v1';
        this.sessionId = this.generateSessionId();
        
        // Store demo parameters if provided
        this.demoParams = {
          primaryColor: options.primaryColor || null,
          secondaryColor: options.secondaryColor || null,
          businessName: options.businessName || null,
          knowledgeBase: options.knowledgeBase || null
        };
        
        // Fetch client configuration with error handling
        this.fetchConfig().then(() => {
          this.injectStyles();
          this.injectHTML();
          this.updateAssistantName();
          // Apply filled icon after HTML is injected
          this.applyIcon();
        }).catch((error) => {
          // If config fetch fails, use fallback defaults and still initialize chatbot
          console.warn('Failed to fetch chatbot config, using defaults:', error);
          this.config = this.getDefaultConfig();
          this.injectStyles();
          this.injectHTML();
          this.updateAssistantName();
          this.applyIcon();
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
        // Build request body with demo parameters if provided
        const requestBody = {};
        if (this.demoParams.primaryColor) {
          requestBody.primary_color = this.demoParams.primaryColor;
        }
        if (this.demoParams.secondaryColor) {
          requestBody.secondary_color = this.demoParams.secondaryColor;
        }
        if (this.demoParams.businessName) {
          requestBody.business_name = this.demoParams.businessName;
        }
        if (this.demoParams.knowledgeBase) {
          requestBody.knowledge_base = this.demoParams.knowledgeBase;
        }
        
        const fetchOptions = {
          method: Object.keys(requestBody).length > 0 ? 'POST' : 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        };
        
        if (Object.keys(requestBody).length > 0) {
          fetchOptions.body = JSON.stringify(requestBody);
        }
        
        const response = await fetch(`${this.apiEndpoint}/config`, fetchOptions);
        this.config = await response.json();
      },
  
      injectStyles: function() {
        const style = document.createElement('style');
        style.textContent = `
          #fortapura-widget-root {
            position: relative;
            width: auto;
            height: auto;
            max-width: none;
            max-height: none;
          }
          
          #fortapura-widget-root #fortapura-chat-button {
            position: fixed;
            bottom: 24px;
                right: 24px;
                background: linear-gradient(135deg, ${this.config.primary_color} 0%, color-mix(in srgb, ${this.config.primary_color} 90%, black) 100%);
                color: white;
                padding: 22px;
                    border-radius: 50%;
                    box-shadow: 0 8px 24px color-mix(in srgb, ${this.config.primary_color} 50%, black)99;
                    cursor: pointer;
                    z-index: 1000;
                    width: 97px !important;
                    height: 97px !important;
                    min-width: 97px !important;
                    min-height: 97px !important;
                    max-width: 97px !important;
                    max-height: 97px !important;
                    box-sizing: border-box !important;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0 !important;
                    font-size: 38px;
                    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    border: none;
        }

        #fortapura-chat-button::before {
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
            animation: fortapura-subtlePulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        #fortapura-chat-button::after {
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
            animation: fortapura-subtlePulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite 1.5s;
        }

        @keyframes fortapura-subtlePulse {
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

        #fortapura-chat-button:hover {
            transform: scale(1.15) translateY(-4px) rotate(5deg);
            box-shadow: 0 16px 40px color-mix(in srgb, ${this.config.primary_color} 50%, white)99;
            background: linear-gradient(135deg, ${this.config.primary_color} 0%, color-mix(in srgb, ${this.config.primary_color} 80%, black) 100%);
        }
  
        #fortapura-chat-button.fortapura-bouncing {
            animation: fortapura-doubleJump 1.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
  
        @keyframes fortapura-doubleJump {
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
  
  #fortapura-chat-container {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 360px;
      max-height: 70vh;
      background: color-mix(in srgb, ${this.config.secondary_color} 5%, white);
      border-radius: 20px;
      box-shadow: 0 16px 48px color-mix(in srgb, ${this.config.primary_color} 50%, black)33;
      z-index: 1000;
      display: none;
      overflow: hidden;
      font-family: 'Roboto', sans-serif;
      backdrop-filter: blur(10px);
      border: 1px solid color-mix(in srgb, ${this.config.primary_color} 50%, black)1a;
      flex-direction: column;
  }

  #fortapura-chat-header {
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
      flex-shrink: 0;
  }
  
  .fortapura-header-actions-left,
  .fortapura-header-actions-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
  }
  
  .fortapura-chat-title {
      flex: 1;
      text-align: center;
      margin: 0 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
  }
  
  .fortapura-header-btn {
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
  
  .fortapura-header-btn svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
  }
  
  #fortapura-chat-button svg {
      width: 38px;
      height: 38px;
      flex-shrink: 0;
  }
  
  .fortapura-header-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
  }
  
  .fortapura-menu-dropdown {
      background: color-mix(in srgb, ${this.config.primary_color} 20%, black);
      backdrop-filter: blur(20px);
      border: 1px solid ${this.config.primary_color}66;
      border-radius: 12px;
      min-width: 160px;
      box-shadow: 0 12px 32px color-mix(in srgb, ${this.config.secondary_color} 30%, transparent);
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

  .fortapura-menu-dropdown::before {
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
  
  .fortapura-menu-dropdown.fortapura-show {
      opacity: 1;
      transform: translateY(0) scale(1);
      display: block !important;
  }
  
  .fortapura-menu-item {
      display: block;
      padding: 14px 20px;
      color: white;
      text-decoration: none;
      font-size: 0.95em;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
      white-space: nowrap;
  }
  
  .fortapura-menu-item:hover {
      background: ${this.config.primary_color}4d;
      padding-left: 24px;
  }
  
  .fortapura-menu-item:last-child {
      border-bottom: none;
  }
  
  #fortapura-chat-window {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 20px;
      background: white;
      scrollbar-width: thin;
      scrollbar-color: ${this.config.primary_color} color-mix(in srgb, ${this.config.secondary_color} 10%, white);
  }

  #fortapura-chat-window::-webkit-scrollbar {
      width: 6px;
  }

  #fortapura-chat-window::-webkit-scrollbar-track {
      background: color-mix(in srgb, ${this.config.secondary_color} 10%, white);
      border-radius: 3px;
  }

  #fortapura-chat-window::-webkit-scrollbar-thumb {
      background: ${this.config.primary_color};
      border-radius: 3px;
  }
  
  #fortapura-chat-input-container {
      display: flex;
      gap: 12px;
      padding: 20px;
      border-top: 1px solid color-mix(in srgb, ${this.config.secondary_color} 15%, white);
      background: color-mix(in srgb, ${this.config.secondary_color} 5%, white);
      align-items: center;
      box-shadow: 0 -4px 12px color-mix(in srgb, ${this.config.secondary_color} 10%, transparent);
      flex-shrink: 0;
  }
  
  #fortapura-userInput {
      flex: 1;
      min-height: 48px;
      max-height: 140px;
      padding: 12px 16px;
      border: 2px solid color-mix(in srgb, ${this.config.secondary_color} 15%, white);
      border-radius: 24px;
      font-family: inherit;
      font-size: 14px;
      resize: none;
      overflow-y: auto;
      word-wrap: break-word;
      line-height: 1.5;
      transition: all 0.3s ease;
      box-sizing: border-box;
      background: color-mix(in srgb, ${this.config.secondary_color} 3%, white);
  }
  
  #fortapura-userInput:focus {
      outline: none;
      border-color: ${this.config.primary_color};
      box-shadow: 0 0 0 4px ${this.config.primary_color}1a;
      background: white;
  }

  #fortapura-chat-input-container .fortapura-btn {
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
      width: auto;
      flex-shrink: 0;
  }

  #fortapura-chat-input-container .fortapura-btn:hover {
      background: color-mix(in srgb, ${this.config.primary_color} 90%, black);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px color-mix(in srgb, ${this.config.primary_color} 30%, transparent);
  }
  
  .fortapura-message {
      margin: 12px 0;
      padding: 14px 18px;
      border-radius: 18px;
      max-width: 85%;
      font-size: 0.95em;
      line-height: 1.5;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      animation: fortapura-messageSlide 0.3s ease;
      overflow: hidden;
  }
  
  @keyframes fortapura-messageSlide {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
  }
  
  .fortapura-user {
      background: linear-gradient(135deg, ${this.config.primary_color} 0%, color-mix(in srgb, ${this.config.primary_color} 90%, black) 100%);
      color: white;
      align-self: flex-end;
      margin-left: auto;
      border-bottom-right-radius: 6px;
      font-weight: 400;
  }

  .fortapura-bot {
      background: white;
      color: color-mix(in srgb, ${this.config.primary_color} 50%, black);
      align-self: flex-start;
      margin-right: auto;
      border-bottom-left-radius: 6px;
      display: flex;
      align-items: flex-start;
      font-weight: 400;
      box-shadow: 0 2px 8px color-mix(in srgb, ${this.config.secondary_color} 10%, transparent);
      overflow: hidden;
      max-width: 85%;
  }
  
  .fortapura-profile-img {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 10px;
      flex-shrink: 0;
      box-shadow: 0 2px 8px color-mix(in srgb, ${this.config.secondary_color} 20%, transparent);
  }
  
  .fortapura-message-content {
      flex: 1;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      max-width: 100%;
  }
  
  .fortapura-message-content a {
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-all;
      display: inline-block;
      max-width: 100%;
      color: ${this.config.primary_color};
      text-decoration: underline;
      transition: color 0.2s ease;
  }

  .fortapura-message-content a:hover {
      color: color-mix(in srgb, ${this.config.primary_color} 90%, black);
      text-decoration: underline;
  }

  .fortapura-bot-name {
      font-weight: 600;
      font-size: 0.85em;
      margin-bottom: 6px;
      color: color-mix(in srgb, ${this.config.primary_color} 50%, black);
  }
  
  .fortapura-contact-form-widget {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 15px;
      width: 100%;
      max-width: 100%;
  }
  
  .fortapura-contact-form-widget label {
      display: block;
      font-size: 0.85em;
      font-weight: 500;
      color: color-mix(in srgb, ${this.config.primary_color} 40%, black);
      margin-bottom: 0;
  }
  
  .fortapura-contact-form-widget input,
  .fortapura-contact-form-widget textarea {
      width: 100%;
      max-width: 100%;
      padding: 8px 10px;
      margin-top: 4px;
      border: 1px solid color-mix(in srgb, ${this.config.secondary_color} 15%, white);
      border-radius: 6px;
      font-family: 'Roboto', sans-serif;
      font-size: 0.85em;
      background: color-mix(in srgb, ${this.config.secondary_color} 5%, white);
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
      box-sizing: border-box;
      display: block;
  }
  
  .fortapura-contact-form-widget input:focus,
  .fortapura-contact-form-widget textarea:focus {
      outline: none;
      border-color: ${this.config.primary_color};
      box-shadow: 0 0 0 3px color-mix(in srgb, ${this.config.primary_color} 10%, transparent);
  }
  
  .fortapura-contact-form-widget textarea {
      min-height: 80px;
      resize: vertical;
  }
  
  .fortapura-contact-form-widget button {
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

  .fortapura-contact-form-widget button:hover {
      background: color-mix(in srgb, ${this.config.primary_color} 90%, black);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px color-mix(in srgb, ${this.config.primary_color} 30%, transparent);
  }
  
  .fortapura-contact-form-widget .fortapura-contact-response {
      margin-top: 10px;
      padding: 10px;
      border-radius: 8px;
      font-size: 0.9em;
      text-align: center;
  }
  
  .fortapura-typing-indicator {
      background: white;
      color: color-mix(in srgb, ${this.config.secondary_color} 80%, black);
      align-self: flex-start;
      margin-right: auto;
      padding: 14px 18px;
      border-radius: 18px;
      max-width: 85%;
      font-size: 0.95em;
      display: flex;
      align-items: center;
      border-bottom-left-radius: 6px;
      box-shadow: 0 2px 8px color-mix(in srgb, ${this.config.secondary_color} 10%, transparent);
  }
  
  .fortapura-typing-indicator span {
      display: inline-block;
      width: 8px;
      height: 8px;
      margin: 0 2px;
      background: color-mix(in srgb, ${this.config.primary_color} 70%, black);
      border-radius: 50%;
      animation: fortapura-typing 1.4s infinite ease-in-out;
  }
  
  .fortapura-typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
  }
  
  .fortapura-typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
  }
  
  @keyframes fortapura-typing {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
  }
  
  .fortapura-option-btn {
      background: white;
      color: color-mix(in srgb, ${this.config.primary_color} 50%, black);
      padding: 12px 16px;
      margin: 6px 0;
      border: 1px solid color-mix(in srgb, ${this.config.secondary_color} 20%, white);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.5s ease;
      font-size: 0.9em;
      font-weight: 500;
      display: block;
      width: 90%;
      text-align: left;
      box-shadow: 0 2px 8px color-mix(in srgb, ${this.config.secondary_color} 10%, transparent);
  }

  .fortapura-option-btn:hover {
      background: linear-gradient(135deg, ${this.config.primary_color} 0%, color-mix(in srgb, ${this.config.primary_color} 90%, black) 100%);
      color: white;
      transform: none; /* Removed transform for subtler effect */
      box-shadow: 0 2px 6px ${this.config.primary_color}36; /* Softer shadow */
      border-color: ${this.config.primary_color};
  }

  .fortapura-section-response {
      background: white !important;
      border-left: 4px solid ${this.config.primary_color};
      margin-top: 8px !important;
  }

  #fortapura-chat-bubble {
      position: fixed;
      bottom: 90px;
      right: 50px;
      background: color-mix(in srgb, ${this.config.secondary_color} 5%, white);
      color: color-mix(in srgb, ${this.config.secondary_color} 80%, black);
      padding: 12px 20px;
      border-radius: 24px;
      box-shadow: 0 8px 24px ${this.config.primary_color}4d;
      font-size: 0.95em;
      font-weight: 500;
      display: none;
      z-index: 1001;
      animation: fortapura-bubbleFloat 0.6s ease-in-out;
      outline: 6px solid transparent;
  }
  
  @keyframes fortapura-bubbleFloat {
      0% { transform: translateY(10px) scale(0.9); opacity: 0; }
      100% { transform: translateY(0) scale(1); opacity: 1; }
  }
  
  @media (max-width: 768px) {
      #fortapura-chat-container {
          width: 95%;
          max-width: 340px;
          right: 2.5%;
          bottom: 16px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
      }
  
      #fortapura-chat-button {
          bottom: 16px;
          right: 16px;
          width: 86px !important;
          height: 86px !important;
          min-width: 86px !important;
          min-height: 86px !important;
          max-width: 86px !important;
          max-height: 86px !important;
          font-size: 32px;
      }
  
      #fortapura-chat-header {
          padding: 16px;
          flex-shrink: 0;
      }
  
      .fortapura-header-btn {
          width: 36px;
          height: 36px;
          font-size: 1em;
      }
  
      #fortapura-chat-window {
          padding: 16px;
          flex: 1;
          min-height: 0;
      }
  
      #fortapura-chat-input-container {
          padding: 16px;
          gap: 8px;
          flex-shrink: 0;
      }
  
      #fortapura-userInput {
          min-height: 44px;
          padding: 10px 14px;
          font-size: 16px; /* Prevent zoom on iOS */
      }
  
      .fortapura-message {
          max-width: 90%;
          padding: 12px 16px;
      }
  
      .fortapura-option-btn {
          width: 95%;
          padding: 10px 14px;
          font-size: 0.95em;
      }
  
      /* Contact Form Widget Mobile Styles */
      .fortapura-contact-form-widget {
          gap: 8px;
          margin-top: 10px;
      }
  
      .fortapura-contact-form-widget label {
          font-size: 13px;
          margin-bottom: 0;
      }
  
      .fortapura-contact-form-widget input,
      .fortapura-contact-form-widget textarea {
          padding: 10px;
          font-size: 14px;
          margin-top: 3px;
          border-radius: 6px;
      }
  
      .fortapura-contact-form-widget textarea {
          min-height: 70px;
      }
  
      .fortapura-contact-form-widget button {
          width: 100%;
          padding: 12px;
          font-size: 14px;
          font-weight: 600;
          margin-top: 4px;
      }
  
      .fortapura-contact-response {
          font-size: 13px;
      }
  }
  
  
        `;
        document.head.appendChild(style);
      },
  
      updateAssistantName: function() {
        // Update assistant name in UI after config is loaded
        const chatTitle = document.getElementById('fortapura-chat-title');
        if (chatTitle && this.config && this.config.assistant_name) {
          chatTitle.textContent = `Chat with ${this.config.assistant_name}`;
        }
      },

      injectHTML: function() {
        const container = document.createElement('div');
        container.id = 'fortapura-widget-root';
        container.innerHTML = `
          <div id="fortapura-chat-button" onclick="toggleChat()">
          <i class="fas fa-message-circle"></i>
      </div>
      <div id="fortapura-chat-container" style="display: none;">
          <div id="fortapura-chat-header">
              <div class="fortapura-header-actions-left">
                  <button id="fortapura-menu-btn" class="fortapura-header-btn" title="More Options">
                      <i class="fas fa-ellipsis-v"></i>
                  </button>
                  <button id="fortapura-back-btn" class="fortapura-header-btn fortapura-back-btn" style="display: none;" onclick="showSection('welcome')" title="Back to Welcome">
                      <i class="fas fa-arrow-left"></i>
                  </button>
              </div>
              <div class="fortapura-chat-title" id="fortapura-chat-title">Chat with Alex</div>
              <div class="fortapura-header-actions-right">
                  <button id="fortapura-reset-btn" class="fortapura-header-btn fortapura-reset-btn" onclick="resetChat()" title="Reset Chat">
                      <i class="fas fa-sync-alt"></i>
                  </button>
              </div>
          </div>
          <div id="fortapura-chat-window"></div>
          <div id="fortapura-chat-input-container">
              <textarea id="fortapura-userInput" placeholder="Ask us anything..." rows="1" onkeydown="if(event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); debouncedSendMessage(); }"></textarea>
              <button onclick="sendMessage()" class="fortapura-btn">Send</button>
          </div>
      </div>
      <!-- NEW: Menu Dropdown (positioned dynamically by JS) -->
      <div id="fortapura-menu-dropdown" class="fortapura-menu-dropdown">
          <a href="#" class="fortapura-menu-item" onclick="showSection('report-issue'); toggleMenu(); return false;" title="Report Issue">
              <i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i>Report Issue
          </a>
          <a href="#" class="fortapura-menu-item" onclick="showSection('find-out-more'); toggleMenu(); return false;" title="Find Out More">
              <i class="fas fa-info-circle" style="margin-right: 8px;"></i>Find Out More
          </a>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 0;">
          <a href="#" class="fortapura-menu-item" onclick="toggleChat(); return false;" title="Close Chat">
              <i class="fas fa-times" style="margin-right: 8px;"></i>Close Chat
          </a>
      </div>
      <div id="fortapura-chat-bubble" style="display: none;">Try me!</div>
        `;
        document.body.appendChild(container);
        
        // Attach menu button event listener after HTML is injected
        const menuBtn = document.getElementById('fortapura-menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleMenu();
            });
        }
        
        // Check if Font Awesome loaded and fallback to SVG if needed
        this.checkFontAwesomeAndFallback();
      },
      
      // Check if Font Awesome loaded, fallback to SVG if not
      checkFontAwesomeAndFallback: function() {
        // Wait a bit for Font Awesome to potentially load
        setTimeout(() => {
          // Method 1: Check if Font Awesome stylesheet is loaded
          let fontAwesomeStylesheet = false;
          try {
            fontAwesomeStylesheet = Array.from(document.styleSheets).some(sheet => {
              try {
                return sheet.href && (
                  sheet.href.includes('font-awesome') || 
                  sheet.href.includes('fontawesome') ||
                  sheet.href.includes('all.min.css')
                );
              } catch (e) {
                return false;
              }
            });
          } catch (e) {
            // Cross-origin stylesheet access might fail, continue with other checks
          }
          
          // Method 2: Check if icon actually renders by testing with a hidden element
          const testIcon = document.createElement('i');
          testIcon.className = 'fas fa-message-circle';
          testIcon.style.position = 'absolute';
          testIcon.style.visibility = 'hidden';
          testIcon.style.fontSize = '16px';
          testIcon.style.left = '-9999px';
          testIcon.style.top = '-9999px';
          document.body.appendChild(testIcon);
          
          // Force a reflow to ensure styles are applied
          testIcon.offsetHeight;
          
          // Check if the icon has content (Font Awesome icons have content in :before pseudo-element)
          let isFontAwesomeLoaded = false;
          try {
            const beforeStyle = window.getComputedStyle(testIcon, ':before');
            const content = beforeStyle.getPropertyValue('content');
            const fontFamily = beforeStyle.getPropertyValue('font-family');
            
            // Font Awesome is loaded if:
            // 1. Stylesheet is found, OR
            // 2. Content is not empty/none and font-family contains Font Awesome
            isFontAwesomeLoaded = fontAwesomeStylesheet || (
              content && 
              content !== 'none' && 
              content !== '""' &&
              content !== '\'\'' &&
              fontFamily && (
                fontFamily.includes('Font Awesome') || 
                fontFamily.includes('FontAwesome')
              )
            );
          } catch (e) {
            // If we can't check computed styles, assume Font Awesome is loaded if stylesheet exists
            isFontAwesomeLoaded = fontAwesomeStylesheet;
          }
          
          document.body.removeChild(testIcon);
          
          // If Font Awesome didn't load, replace all icons with SVG fallbacks
          if (!isFontAwesomeLoaded) {
            this.replaceIconsWithSVG();
          }
        }, 500); // Wait 500ms for Font Awesome to load
      },
      
      // Chat button icon - filled message circle with three holes
      chatButtonIcon: '<svg width="38" height="38" viewBox="0 0 24 24" fill="none"><defs><mask id="chatBubbleMask"><rect width="24" height="24" fill="white"/><circle cx="9" cy="12" r="1.5" fill="black"/><circle cx="12.5" cy="12" r="1.5" fill="black"/><circle cx="16" cy="12" r="1.5" fill="black"/></mask></defs><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fill="currentColor" mask="url(#chatBubbleMask)"/></svg>',
      
      // Apply the filled message circle icon
      applyIcon: function() {
        const chatButton = document.getElementById('fortapura-chat-button');
        if (chatButton) {
          const icon = chatButton.querySelector('i, svg');
          if (icon) {
            icon.outerHTML = this.chatButtonIcon;
          }
        }
      },
      
      // Replace Font Awesome icons with SVG fallbacks
      replaceIconsWithSVG: function() {
        // Chat button icon - use filled message circle
        const chatButton = document.getElementById('fortapura-chat-button');
        if (chatButton) {
          const icon = chatButton.querySelector('i, svg');
          if (icon) {
            icon.outerHTML = this.chatButtonIcon;
          }
        }
        
        // Menu button icon
        const menuBtn = document.getElementById('fortapura-menu-btn');
        if (menuBtn) {
          const icon = menuBtn.querySelector('i.fa-ellipsis-v');
          if (icon) {
            icon.outerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>';
          }
        }
        
        // Back button icon
        const backBtn = document.getElementById('fortapura-back-btn');
        if (backBtn) {
          const icon = backBtn.querySelector('i.fa-arrow-left');
          if (icon) {
            icon.outerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>';
          }
        }
        
        // Reset button icon
        const resetBtn = document.getElementById('fortapura-reset-btn');
        if (resetBtn) {
          const icon = resetBtn.querySelector('i.fa-sync-alt');
          if (icon) {
            icon.outerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>';
          }
        }
        
        // Menu dropdown icons
        const menuItems = document.querySelectorAll('#fortapura-menu-dropdown .fortapura-menu-item i');
        menuItems.forEach(icon => {
          if (icon.classList.contains('fa-exclamation-triangle')) {
            icon.outerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: middle; display: inline-block;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
          } else if (icon.classList.contains('fa-info-circle')) {
            icon.outerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: middle; display: inline-block;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
          } else if (icon.classList.contains('fa-times')) {
            icon.outerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: middle; display: inline-block;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
          }
        });
      }
    };
  
    // Get info responses from config (fallback to empty object if not provided)
    function getInfoResponses() {
      return ChatbotWidget.config?.info_responses || {};
    }
  
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
                      const chatButton = document.getElementById('fortapura-chat-button');
                      if (chatButton) {
                          chatButton.classList.add('fortapura-bouncing');
                          setTimeout(() => {
                              if (chatButton) {
                                  chatButton.classList.remove('fortapura-bouncing');
                              }
                          }, 1600);  // Animation duration - two smooth jumps
                      }
                  }
              }
          }, 12000);  // Every 12 seconds
  
          setInterval(() => {
              if (isChatClosed()) {
                  const chatBubble = document.getElementById('fortapura-chat-bubble');
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
          const userInput = document.getElementById('fortapura-userInput');
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
  
  // Enhanced: Smooth scroll to bottom after adding messages
  function scrollToBottom() {
      const chatWindow = document.getElementById('fortapura-chat-window');
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
      const typing = document.getElementById('fortapura-typing-indicator');
      if (typing) {
          typing.style.opacity = '0';
          typing.style.transition = 'opacity 0.3s ease';
          setTimeout(() => typing.style.opacity = '1', 10);
      }
      scrollToBottom();
  };
  
  // Check if chat is closed
  function isChatClosed() {
      const chatContainer = document.getElementById('fortapura-chat-container');
      if (!chatContainer || !chatContainer.style) {
          return true;
      }
      return chatContainer.style.display === 'none';
  }
  
  // UPDATED: Toggle chat window - Fresh start on open, log & clear on close
  function toggleChat() {
      // Prevent spam: if already processing, ignore
      if (isChatProcessing) return;
  
      const chatContainer = document.getElementById('fortapura-chat-container');
      if (!chatContainer || !chatContainer.style) return;
      
      const isOpening = chatContainer.style.display === 'none';
      chatContainer.style.display = isOpening ? 'flex' : 'none';
      if (isOpening) {
          isChatProcessing = true;
          // Disable chat button visually
          const chatButton = document.getElementById('fortapura-chat-button');
          if (chatButton) {
              chatButton.style.pointerEvents = 'none';
              chatButton.style.opacity = '0.6';
          }
  
          // Hide menu and reset buttons during welcome animation
          const menuBtn = document.getElementById('fortapura-menu-btn');
          const resetBtn = document.getElementById('fortapura-reset-btn');
          if (menuBtn) {
              menuBtn.style.display = 'none';
          }
          if (resetBtn) {
              resetBtn.style.display = 'none';
          }

          // Disable input field and send button during welcome animation
          const userInput = document.getElementById('fortapura-userInput');
          const sendButton = document.querySelector('#fortapura-chat-input-container .fortapura-btn');
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
          fetch(`${ChatbotWidget.apiEndpoint}/history?session_id=${ChatbotWidget.sessionId}`, {
              method: 'DELETE',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${ChatbotWidget.apiKey}`
              }
          }).catch(error => {
              console.error('Error clearing history:', error);
          });
  
          // Always start fresh: Clear DOM and show welcome
          const chatWindow = document.getElementById('fortapura-chat-window');
          chatWindow.innerHTML = '';  // Clear any lingering content
          currentSection = 'welcome';
          
          // Calculate timing based on number of welcome options
          const welcomeOptions = getWelcomeOptions();
          const numOptions = welcomeOptions.length;
          // Timing breakdown: 800ms initial + 300ms after typing + (250ms * numOptions) + 150ms final + 200ms buffer
          const totalWelcomeTime = 800 + 300 + (250 * numOptions) + 150 + 200;
          
          showSection('welcome', true);  // Fresh open: clear and build

          // Reset textarea height on open
          if (userInput) {
              userInput.style.height = 'auto';
          }

          // Re-enable after full animation (dynamically calculated based on welcome options)
          setTimeout(() => {
              isChatProcessing = false;
              if (chatButton) {
                  chatButton.style.pointerEvents = 'auto';
                  chatButton.style.opacity = '1';
              }
              
              // Show menu and reset buttons after welcome is complete
              if (menuBtn) {
                  menuBtn.style.display = 'flex';
              }
              if (resetBtn) {
                  resetBtn.style.display = 'flex';
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
          }, totalWelcomeTime);
      } else {
          // Closing: instant, no processing delay needed
          isChatProcessing = false;
          const chatButton = document.getElementById('fortapura-chat-button');
          if (chatButton) {
              chatButton.style.pointerEvents = 'auto';
              chatButton.style.opacity = '1';
          }
  
          // On close: Log current session to server, then clear DOM
          if (hasAIInteraction) {
              saveCurrentSessionToServer();  // Save before close
          }
          hasAIInteraction = false;
          const chatWindow = document.getElementById('fortapura-chat-window');
          if (chatWindow) {
              chatWindow.innerHTML = '';  // Reset for next open
          }
          const chatBubble = document.getElementById('fortapura-chat-bubble');
          if (chatBubble && chatBubble.style) {
              chatBubble.style.display = 'none';  // Hide bubble if open
          }
          // Close dropdown if open
          const dropdown = document.getElementById('fortapura-menu-dropdown');
          if (dropdown && dropdown.style) {
              dropdown.style.display = 'none';
              dropdown.classList.remove('fortapura-show');
          }
      }
  }
  
  // UPDATED: Extract and send current session history to server on close (async fetch)
  function saveCurrentSessionToServer() {
      const chatWindow = document.getElementById('fortapura-chat-window');
      if (!chatWindow) return;
      
      const messages = [];
      chatWindow.querySelectorAll('.fortapura-message').forEach(msg => {
          const role = msg.classList.contains('fortapura-user') ? 'user' : 'assistant';
          const content = msg.textContent.trim();
          if (content) messages.push({ role, content });
      });
      
      if (messages.length === 0) return;  // No content to save
      
      // Use fetch with keepalive for reliable unload requests (supports headers unlike sendBeacon)
      fetch(`${ChatbotWidget.apiEndpoint}/log_history`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${ChatbotWidget.apiKey}`
          },
          body: JSON.stringify({ 
              session_messages: messages,
              session_id: ChatbotWidget.sessionId
          }),
          keepalive: true  // Ensures request completes even on page unload
      }).catch(error => {
          console.error('Error logging history on unload:', error);
      });
      console.log('Session saved on unload');  // Optional debug (may not log if unload is abrupt)
  }
  
  // Get welcome options from config (fallback to empty array if not provided)
  function getWelcomeOptions() {
    return ChatbotWidget.config?.welcome_options || [];
  }
  
  // Show specific section
  async function showSection(sectionId, isFresh = false) {
      currentSection = sectionId;
      const chatWindow = document.getElementById('fortapura-chat-window');
      const backBtn = document.getElementById('fortapura-back-btn');
  
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
                  await delay(300);
                  const assistantName = ChatbotWidget.config?.assistant_name || 'Alex';
                  addBotMessage(`Hello! I'm ${assistantName}, your AI assistant. How can I help?`);
                  const welcomeOptions = getWelcomeOptions();
                  for (let option of welcomeOptions) {
                      await delay(250);
                      addOptionButton(option.id, option.text);
                  }
                  await delay(150);
                  addBotMessage('Or type a request to begin a chat');
                  if (chatWindow) {
                      chatWindow.scrollTop = chatWindow.scrollHeight;
                  }
              }, 800);
          } else {
              // Back navigation: remove section response if present
              if (chatWindow) {
                  const sectionMsg = chatWindow.querySelector('.fortapura-section-response');
                  if (sectionMsg) {
                      sectionMsg.remove();
                  }
                  // Rebuild full welcome if no greeting or buttons (since cleared on section nav)
                  if (!chatWindow.querySelector('.fortapura-message') || !chatWindow.querySelector('.fortapura-option-btn')) {
                      const assistantName = ChatbotWidget.config?.assistant_name || 'Alex';
                      addBotMessage(`Hello! I'm ${assistantName}, your AI assistant. How can I help?`);
                      const welcomeOptions = getWelcomeOptions();
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
              <form class="fortapura-report-form-widget">
                  <label>Message: <textarea class="fortapura-report-message" required></textarea></label>
                  <button type="submit" class="fortapura-btn">Submit Report</button>
                  <p class="fortapura-report-response"></p>
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
        // Handle "Find Out More" - Open about page in new tab
        window.open('https://www.fortapura.com/about', '_blank');
          return;  // No further processing
      } else {
          // Predefined sections (faq, contact, etc.) - "Open new space" by clearing window
          if (chatWindow) {
              chatWindow.innerHTML = '';
          }
          // Remove option buttons (already cleared)
          const infoResponses = getInfoResponses();
          const responseText = infoResponses[sectionId];
          if (responseText) {
              addBotMessage(responseText, true);  // Mark as section response
          } else {
              addBotMessage('Sorry, this section is not available.', true);
          }
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
      const chatWindow = document.getElementById('fortapura-chat-window');
      if (!chatWindow) return;
      
      const botMsg = document.createElement('div');
      botMsg.classList.add('fortapura-message', 'fortapura-bot');
      if (isSection) {
          botMsg.classList.add('fortapura-section-response');
      }
      
      // Convert links to clickable HTML
      const processedText = convertLinksToHTML(text);
      
      const assistantName = ChatbotWidget.config?.assistant_name || 'Alex';
      const assistantAvatar = ChatbotWidget.config?.assistant_avatar_url || '/static/alex-profile.png';
      botMsg.innerHTML = `
          <img src="${assistantAvatar}" alt="${assistantName} Profile Picture" class="fortapura-profile-img">
          <div class="fortapura-message-content">
              <div class="fortapura-bot-name">${assistantName}</div>
              ${processedText}
          </div>
      `;
      chatWindow.appendChild(botMsg);
      chatWindow.scrollTop = chatWindow.scrollHeight;
  
      // Attach form listener if the contact form is present in this message
      const form = botMsg.querySelector('.fortapura-contact-form-widget');
      if (form) {
          submitContactForm(form);  // Pass the specific form instance
      }
  }
  
  // Helper to add option button
  function addOptionButton(sectionId, text) {
      const chatWindow = document.getElementById('fortapura-chat-window');
      if (!chatWindow) return;
      
      const optionBtn = document.createElement('button');
      optionBtn.classList.add('fortapura-option-btn');
      optionBtn.innerHTML = text;
      // Updated onclick: pass false for non-fresh (back nav)
      optionBtn.onclick = () => showSection(sectionId, false);
      chatWindow.appendChild(optionBtn);
      chatWindow.scrollTop = chatWindow.scrollHeight;
  }
  
  // Show typing indicator
  function showTypingIndicator() {
      const chatWindow = document.getElementById('fortapura-chat-window');
      if (!chatWindow) return;
      
      const typing = document.createElement('div');
      typing.id = 'fortapura-typing-indicator';
      typing.classList.add('fortapura-typing-indicator');
      const assistantAvatar = ChatbotWidget.config?.assistant_avatar_url || '/static/alex-profile.png';
      const assistantName = ChatbotWidget.config?.assistant_name || 'Alex';
      typing.innerHTML = `
          <img src="${assistantAvatar}" alt="${assistantName} Profile Picture" class="fortapura-profile-img">
          <span></span><span></span><span></span>
      `;
      chatWindow.appendChild(typing);
      chatWindow.scrollTop = chatWindow.scrollHeight;
  }
  
  // Remove typing indicator
  function removeTypingIndicator() {
      const typing = document.getElementById('fortapura-typing-indicator');
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
      const userInput = document.getElementById('fortapura-userInput');
      
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
      const chatWindow = document.getElementById('fortapura-chat-window');
      if (!chatWindow) return;
      
      const userMsg = document.createElement('div');
      userMsg.classList.add('fortapura-message', 'fortapura-user');
      userMsg.innerHTML = `<strong>You:</strong> ${message}`;
      chatWindow.appendChild(userMsg);
      chatWindow.scrollTop = chatWindow.scrollHeight;
  
      // Show typing indicator
      showTypingIndicator();
  
      // Send to backend with minimal delay for typing effect
      setTimeout(() => {
          // Build request body
          const requestBody = {
              message: message,
              session_id: ChatbotWidget.sessionId
          };
          
          // Include demo knowledge base key if available
          if (ChatbotWidget.config && ChatbotWidget.config.demo_kb_key) {
              requestBody.demo_kb_key = ChatbotWidget.config.demo_kb_key;
          }
          
          fetch(`${ChatbotWidget.apiEndpoint}/chat`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${ChatbotWidget.apiKey}`
              },
              body: JSON.stringify(requestBody)
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
      }, 200);  // Reduced delay for faster response
  
      if (userInput) {
          userInput.value = '';
          // Reset height after send
          userInput.style.height = 'auto';
      }
  }
  // Contact Form Submission (for widget)
  // Updated to accept an optional form parameter for targeted attachment
  function submitContactForm(targetForm = null) {
      const form = targetForm || document.querySelector('.fortapura-contact-form-widget');
      if (!form) return;  // Form might not exist
      form.addEventListener('submit', function(e) {
          e.preventDefault();
          const name = form.querySelector('.fortapura-contact-name').value;
          const business_name = form.querySelector('.fortapura-contact-business-name').value;
          const email = form.querySelector('.fortapura-contact-email').value;
          const phone = form.querySelector('.fortapura-contact-phone').value;
          const message = form.querySelector('.fortapura-contact-message').value;
  
          fetch(`${ChatbotWidget.apiEndpoint}/contact`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${ChatbotWidget.apiKey}`
              },
              body: JSON.stringify({
                  name, 
                  business_name, 
                  email, 
                  phone, 
                  message,
                  session_id: ChatbotWidget.sessionId
              })
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
              const responseEl = form.querySelector('.fortapura-contact-response');
              responseEl.textContent = data.message;
              responseEl.className = 'fortapura-success';
              form.reset();
          })
          .catch(error => {
              console.error('Error:', error);
              const responseEl = form.querySelector('.fortapura-contact-response');
              responseEl.textContent = error.error || 'Error submitting form. Please try again.';
              responseEl.className = 'fortapura-error';
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
      fetch(`${ChatbotWidget.apiEndpoint}/history?session_id=${ChatbotWidget.sessionId}`, {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${ChatbotWidget.apiKey}`
          }
      }).catch(error => {
          console.error('Error clearing history:', error);
      });
      
      const chatWindow = document.getElementById('fortapura-chat-window');
      if (chatWindow) {
          chatWindow.innerHTML = '';
      }
      currentSection = 'welcome';
      hasAIInteraction = false;
      showSection('welcome');
  }
  
  // Report Form Submission
  function submitReportForm(targetForm = null) {
      const form = targetForm || document.querySelector('.fortapura-report-form-widget');
      if (!form) return;  // Form might not exist
      form.addEventListener('submit', function(e) {
          e.preventDefault();
          const message = form.querySelector('.fortapura-report-message').value;
  
          // Fetch current chat history from backend
          fetch(`${ChatbotWidget.apiEndpoint}/history?session_id=${ChatbotWidget.sessionId}`, {
              headers: {
                  'Authorization': `Bearer ${ChatbotWidget.apiKey}`
              }
          })
              .then(response => response.json())
              .then(data => {
                  // Format history as a string
                  const history = data.messages || [];
                  const formattedHistory = history.map(msg => `[${msg.role.toUpperCase()}]: ${msg.content}`).join('\n\n');

                  // Send to backend
                  fetch(`${ChatbotWidget.apiEndpoint}/report`, {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${ChatbotWidget.apiKey}`
                      },
                      body: JSON.stringify({
                          message, 
                          history: formattedHistory,
                          session_id: ChatbotWidget.sessionId
                      })
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
                      const responseEl = form.querySelector('.fortapura-report-response');
                      responseEl.textContent = data.message;
                      responseEl.className = 'fortapura-success';
                      form.reset();
                  })
                  .catch(error => {
                      console.error('Error:', error);
                      const responseEl = form.querySelector('.fortapura-report-response');
                      responseEl.textContent = error.error || 'Error submitting report. Please try again.';
                      responseEl.className = 'fortapura-error';
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
      const dropdown = document.getElementById('fortapura-menu-dropdown');
      const menuBtn = document.getElementById('fortapura-menu-btn');
      if (!dropdown || !menuBtn || !dropdown.style) return;
  
      const isVisible = dropdown.classList.contains('fortapura-show');
      
      if (isVisible) {
          // Close
          dropdown.style.display = 'none';
          dropdown.classList.remove('fortapura-show');
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
          
          setTimeout(() => dropdown.classList.add('fortapura-show'), 10);
      }
  }
  
  // FIXED: Close on Outside Click (enhanced to include menuBtn check and only if open)
  document.addEventListener('click', function(event) {
      const menuBtn = document.getElementById('fortapura-menu-btn');
      const dropdown = document.getElementById('fortapura-menu-dropdown');
      
      if (dropdown && dropdown.style && dropdown.style.display === 'block' && menuBtn && !menuBtn.contains(event.target) && !dropdown.contains(event.target)) {
          dropdown.style.display = 'none';
          dropdown.classList.remove('fortapura-show');
          dropdown.style.position = '';
          dropdown.style.top = '';
          dropdown.style.left = '';
          dropdown.style.width = '';
      }
  });
  
  // FIXED: Escape Close (only if open)
  document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
          const dropdown = document.getElementById('fortapura-menu-dropdown');
          if (dropdown && dropdown.style && dropdown.style.display === 'block') {
              dropdown.style.display = 'none';
              dropdown.classList.remove('fortapura-show');
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
      
    // Expose ChatbotWidget to global scope
    window.ChatbotWidget = ChatbotWidget;
    
    // Expose functions needed by inline HTML handlers to global scope
    window.toggleChat = toggleChat;
    window.sendMessage = sendMessage;
    window.resetChat = resetChat;
    window.showSection = showSection;
    window.toggleMenu = toggleMenu;
    window.debouncedSendMessage = debouncedSendMessage;
  })();
