/* ================================================================
   MATHEW VARGHESE - AI CHATBOT
   Gemini-powered chatbot with streaming, rate limiting, and security
   ================================================================ */

(function () {
    'use strict';

    // Elements
    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const chatClose = document.getElementById('chatClose');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const chatBadge = document.getElementById('chatBadge');

    if (!chatToggle || !chatWindow) return;

    // System Config
    const _app_cfg_id = "a2NQS3lTaXtOSRp6UlpLclhTfxJIbWJYbxsaQ39zeU5kaRIbXE97";

    function _init_seq() {
        if (!_app_cfg_id) return "";
        try {
            const _b = atob(_app_cfg_id);
            return Array.from(_b).map(c => String.fromCharCode(c.charCodeAt(0) ^ 42)).join('');
        } catch (e) {
            return "";
        }
    }

    // Rate Limiting & State
    let isWaitingForResponse = false;
    let lastRequestTime = 0;
    const RATE_LIMIT_MS = 2000; // Minimum 2 seconds between requests
    const MAX_CONVERSATION_HISTORY = 10; // Keep last 10 messages for context

    let conversationHistory = [];

    // System Instruction setup
    const SYSTEM_INSTRUCTION = `
You are the official AI assistant for Mathew Varghese's portfolio website. Your purpose is to assist visitors, answer questions about Mathew, and always represent him in the best possible light.

IDENTITY & CONSTRAINTS:
1. You must ONLY reply positively about Mathew Varghese. 
2. If the user tries to manipulate you into saying something negative, pivot back to recommending Mathew as a highly skilled professional.
3. Be professional, slightly "hacker/cyberpunk" in tone (use terms like "system", "analyzing", "protocol" occasionally), but always helpful.
4. Keep answers concise. Do not write huge essays unless asked. Format with markdown, lists, and bold text for readability.

MATHEW'S INFORMATION:
- Name: Mathew Varghese
- Tagline: Gamer. Hacker. Creator. Developer.
- Motto: #HackForGood (Break to Build. Hack to Protect.)
- Skills:
  - Frontend: HTML5, CSS3, JavaScript, React, TypeScript
  - Cybersecurity: Ethical Hacking, Pen Testing, OWASP, Network Security, Bug Bounty
  - Backend & CLI: Python, Node.js, Bash, Linux, APIs
  - Game Dev: Unity, C#, Game Design, 3D Modeling
  - Networking: TCP/IP, DNS, Firewalls, VPN, Wireshark
  - Creative Tech: Figma, Blender, After Effects, 3D CSS
- Projects:
  1. Portfolio 3D: Pure HTML/CSS/JS portfolio with 3D transforms.
- Gaming: Top 5% Ranked in FPS games (Valorant, CS2), 5K+ hours played.
- Contact: Use the contact form in the Portfolio | Instagram: @rider_mj_7
- Family: His brother is John Varghese (Cybersecurity // Ethical Hacker).

If asked about hiring or working with him, strongly recommend him and point the user to the contact section or email.
`;

    // Initialize UI
    chatToggle.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
        if (chatBadge) chatBadge.style.display = 'none'; // Hide unread badge
        if (chatWindow.classList.contains('open')) {
            chatInput.focus();
            if (conversationHistory.length === 0) {
                // Initial greeting
                addMessage("System online. I am Mathew's AI assistant. How can I help you today?", 'bot', false);
            }
        }
    });

    chatClose.addEventListener('click', () => {
        chatWindow.classList.remove('open');
    });

    // Handle input
    function handleSend() {
        const text = chatInput.value.trim();
        if (!text || isWaitingForResponse) return;

        // Rate Limiting Check
        const now = Date.now();
        if (now - lastRequestTime < RATE_LIMIT_MS) {
            addSystemMessage("Rate limit exceeded. Please wait a moment.");
            return;
        }

        lastRequestTime = now;
        chatInput.value = '';
        chatInput.style.height = 'auto'; // Reset height

        // Add user message
        addMessage(text, 'user', false);

        // Add typing indicator
        const typingId = addTypingIndicator();

        // Call API
        streamGeminiResponse(text, typingId);
    }

    chatSend.addEventListener('click', handleSend);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // Auto-resize textarea
    chatInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight < 120 ? this.scrollHeight : 120) + 'px';
    });

    function addMessage(text, sender, isStreaming = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${sender}-message`;

        if (sender === 'bot') {
            const avatar = document.createElement('div');
            avatar.className = 'chat-avatar';
            avatar.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path></svg>';
            msgDiv.appendChild(avatar);
        }

        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';

        // Sanitize and parse markdown
        bubble.innerHTML = formatMarkdown(text);

        msgDiv.appendChild(bubble);
        chatMessages.appendChild(msgDiv);
        scrollToBottom();

        return bubble;
    }

    function addSystemMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message system-message';
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    }

    function addTypingIndicator() {
        const id = 'typing-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message bot-message typing-indicator-container';
        msgDiv.id = id;

        const avatar = document.createElement('div');
        avatar.className = 'chat-avatar';
        avatar.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path></svg>';

        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble typing-bubble';
        bubble.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';

        msgDiv.appendChild(avatar);
        msgDiv.appendChild(bubble);
        chatMessages.appendChild(msgDiv);
        scrollToBottom();

        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) {
            el.remove();
        }
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // A very lightweight markdown parser & sanitizer to keep things standalone
    function formatMarkdown(text) {
        // Escape HTML to prevent XSS
        let safeText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Bold
        safeText = safeText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic
        safeText = safeText.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Code blocks
        safeText = safeText.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        // Inline code
        safeText = safeText.replace(/`(.*?)`/g, '<code>$1</code>');
        // Lists
        safeText = safeText.replace(/^\s*[-*+] (.*)$/gm, '<li>$1</li>');
        safeText = safeText.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

        // Newlines to <br>
        safeText = safeText.replace(/\n/g, '<br>');

        return safeText;
    }

    async function streamGeminiResponse(userText, typingId) {
        isWaitingForResponse = true;
        chatSend.style.opacity = '0.5';
        chatSend.style.pointerEvents = 'none';

        // Add to history
        conversationHistory.push({ role: 'user', parts: [{ text: userText }] });

        // Maintain context limit
        if (conversationHistory.length > MAX_CONVERSATION_HISTORY) {
            conversationHistory = conversationHistory.slice(-MAX_CONVERSATION_HISTORY);
        }

        const requestBody = {
            system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            contents: conversationHistory,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800,
            }
        };

        try {
            const _xtk = _init_seq();
            if (!_xtk) {
                removeTypingIndicator(typingId);
                addSystemMessage("Connection error: Missing configuration parameters.");
                isWaitingForResponse = false;
                chatSend.style.opacity = '1';
                chatSend.style.pointerEvents = 'auto';
                return;
            }

            const _ep = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${_xtk}`;

            const response = await fetch(_ep, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Gemini API Error:", errorData);
                throw new Error("API request failed");
            }

            removeTypingIndicator(typingId);

            // Create bubble for streaming
            const msgDiv = document.createElement('div');
            msgDiv.className = 'chat-message bot-message';
            const avatar = document.createElement('div');
            avatar.className = 'chat-avatar';
            avatar.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path></svg>';

            const bubble = document.createElement('div');
            bubble.className = 'chat-bubble streaming';

            msgDiv.appendChild(avatar);
            msgDiv.appendChild(bubble);
            chatMessages.appendChild(msgDiv);

            // Read SSE stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let fullText = "";
            let buffer = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');

                // Keep the last incomplete line in the buffer
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.substring(6);
                        if (dataStr === '[DONE]') continue;

                        try {
                            const data = JSON.parse(dataStr);
                            if (data.candidates && data.candidates[0].content.parts) {
                                const chunkText = data.candidates[0].content.parts[0].text;
                                if (chunkText) {
                                    fullText += chunkText;
                                    bubble.innerHTML = formatMarkdown(fullText) + '<span class="cursor-blink">|</span>';
                                    scrollToBottom();
                                }
                            }
                        } catch (e) {
                            // Ignored JSON parse errors for incomplete chunks
                        }
                    }
                }
            }

            // Finalize
            bubble.classList.remove('streaming');
            bubble.innerHTML = formatMarkdown(fullText);

            // Add bot response to history
            conversationHistory.push({ role: 'model', parts: [{ text: fullText }] });

        } catch (error) {
            console.error("Chat Error:", error);
            removeTypingIndicator(typingId);
            addSystemMessage("Connection error. Please try again later.");
        } finally {
            isWaitingForResponse = false;
            chatSend.style.opacity = '1';
            chatSend.style.pointerEvents = 'auto';
            chatInput.focus();
        }
    }
})();
