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
        /* Chat widget styles with dynamic colors */
        #chatbot-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        #chatbot-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: ${this.config.primary_color};
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: transform 0.2s;
        }
        #chatbot-button:hover {
          transform: scale(1.1);
        }
        #chatbot-window {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 380px;
          height: 600px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          display: none;
          flex-direction: column;
        }
        #chatbot-window.open {
          display: flex;
        }
        #chatbot-header {
          background: ${this.config.primary_color};
          color: white;
          padding: 16px;
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        #chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        .message {
          margin-bottom: 12px;
          padding: 10px 14px;
          border-radius: 8px;
          max-width: 80%;
        }
        .message.user {
          background: ${this.config.secondary_color};
          color: white;
          margin-left: auto;
        }
        .message.bot {
          background: #f0f0f0;
          color: #333;
        }
        #chatbot-input-container {
          padding: 12px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 8px;
        }
        #chatbot-input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 20px;
          outline: none;
        }
        #chatbot-send {
          padding: 10px 20px;
          background: ${this.config.primary_color};
          color: white;
          border: none;
          border-radius: 20px;
          cursor: pointer;
        }
      `;
      document.head.appendChild(style);
    },

    injectHTML: function() {
      const container = document.createElement('div');
      container.id = 'chatbot-container';
      container.innerHTML = `
        <button id="chatbot-button" aria-label="Open chat">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
        </button>
        <div id="chatbot-window">
          <div id="chatbot-header">
            <div>
              <strong>${this.config.assistant_name}</strong>
              <div style="font-size: 12px;">Online now</div>
            </div>
            <button id="chatbot-close" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">&times;</button>
          </div>
          <div id="chatbot-messages"></div>
          <div id="chatbot-input-container">
            <input type="text" id="chatbot-input" placeholder="Type a message..." />
            <button id="chatbot-send">Send</button>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    },

    attachEventListeners: function() {
      document.getElementById('chatbot-button').addEventListener('click', () => this.toggleChat());
      document.getElementById('chatbot-close').addEventListener('click', () => this.toggleChat());
      document.getElementById('chatbot-send').addEventListener('click', () => this.sendMessage());
      document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
    },

    toggleChat: function() {
      const window = document.getElementById('chatbot-window');
      this.isOpen = !this.isOpen;
      window.classList.toggle('open', this.isOpen);
      
      if (this.isOpen) {
        this.loadHistory();
      }
    },

    loadHistory: async function() {
      const response = await fetch(`${this.apiEndpoint}/history?session_id=${this.sessionId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      const data = await response.json();
      
      const messagesContainer = document.getElementById('chatbot-messages');
      messagesContainer.innerHTML = '';
      
      if (data.messages.length === 0) {
        this.addMessage('bot', this.config.welcome_message || 'Hello! How can I help you today?');
      } else {
        data.messages.forEach(msg => {
          this.addMessage(msg.role, msg.content);
        });
      }
    },

    sendMessage: async function() {
      const input = document.getElementById('chatbot-input');
      const message = input.value.trim();
      if (!message) return;

      // Add user message to UI
      this.addMessage('user', message);
      input.value = '';

      // Show typing indicator
      this.showTyping();

      // Send to API
      try {
        const response = await fetch(`${this.apiEndpoint}/chat`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            session_id: this.sessionId,
            message: message,
            user_metadata: {
              page_url: window.location.href,
              user_agent: navigator.userAgent
            }
          })
        });

        const data = await response.json();
        this.hideTyping();
        this.addMessage('bot', data.reply);
      } catch (error) {
        this.hideTyping();
        this.addMessage('bot', 'Sorry, something went wrong. Please try again.');
      }
    },

    addMessage: function(role, content) {
      const messagesContainer = document.getElementById('chatbot-messages');
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${role}`;
      messageDiv.innerHTML = content;
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    showTyping: function() {
      this.addMessage('bot', '<span class="typing-indicator">...</span>');
    },

    hideTyping: function() {
      const typing = document.querySelector('.typing-indicator');
      if (typing) typing.parentElement.remove();
    }
  };

  window.ChatbotWidget = ChatbotWidget;
})();
