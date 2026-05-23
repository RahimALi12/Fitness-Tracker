import React, { useState, useRef, useEffect } from 'react';
import axios from '../utils/axios';
import './FloatingChatbots.css';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your AI fitness assistant. Ask me anything about workouts, nutrition, or health tips! 💪",
      sender: 'bot',
      timestamp: new Date(),
      replyTo: null
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [, setConversationContext] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // 🔥 NEW: API request cancellation
  const abortControllerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus input after AI response is complete
  useEffect(() => {
    if (!isLoading && !isTyping && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300);
    }
  }, [isLoading, isTyping]);

  const buildConversationContext = (currentMessage, replyToMessage = null) => {
    let context = [];
    
    if (replyToMessage) {
      context.push(`Previous context: "${replyToMessage.text}"`);
    }
    
    // Add last 3 message pairs for context
    const recentMessages = messages.slice(-6);
    for (let i = 0; i < recentMessages.length; i += 2) {
      const userMsg = recentMessages[i];
      const botMsg = recentMessages[i + 1];
      if (userMsg && botMsg && userMsg.sender === 'user' && botMsg.sender === 'bot') {
        context.push(`Previous Q: "${userMsg.text}" A: "${botMsg.text}"`);
      }
    }
    
    context.push(`Current question: "${currentMessage}"`);
    return context.join('\n');
  };

const sendMessage = async (messageText = null, isEdit = false, originalMessageId = null) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    let userMessage;
    
    if (isEdit && originalMessageId) {
      setMessages(prev => prev.map(msg => 
        msg.id === originalMessageId 
          ? { ...msg, text: textToSend, timestamp: new Date() }
          : msg
      ));
      userMessage = messages.find(msg => msg.id === originalMessageId);
    } else {
      userMessage = {
        id: Date.now(),
        text: textToSend,
        sender: 'user',
        timestamp: new Date(),
        replyTo: replyingTo?.id || null
      };
      setMessages(prev => [...prev, userMessage]);
    }

    setInputMessage('');
    setEditingMessage(null);
    setReplyingTo(null);
    setIsLoading(true);
    setIsTyping(true);

    if (isEdit && originalMessageId) {
      setMessages(prev => prev.filter(msg => 
        !(msg.sender === 'bot' && msg.replyTo === originalMessageId)
      ));
    }

    // 🔥 Create abort controller for this request
    abortControllerRef.current = new AbortController();

    setTimeout(async () => {
      try {
        const contextualMessage = buildConversationContext(textToSend, replyingTo);
        
        console.log('Sending contextual message to chatbot API:', contextualMessage);
        
        const response = await axios.post('/chatbot', {
          message: contextualMessage,
          isContextual: true
        }, {
          timeout: 20000,
          headers: {
            'Content-Type': 'application/json'
          },
          signal: abortControllerRef.current?.signal
        });

        console.log('Chatbot API response:', response.data);

        // 🔥 Check if request was cancelled
        if (abortControllerRef.current?.signal.aborted) {
          console.log('Request was cancelled');
          return;
        }

        setTimeout(() => {
          // 🔥 Double check if request was cancelled before adding bot message
          if (abortControllerRef.current?.signal.aborted) {
            console.log('Bot response cancelled');
            return;
          }

          // Response ke andar se text nikalne ka secure tareeqa
          let botReplyText = "";

          if (response.data) {
            if (typeof response.data === 'string') {
              botReplyText = response.data;
            } else if (response.data.reply) {
              botReplyText = response.data.reply;
            } else if (response.data.text) {
              botReplyText = response.data.text;
            } else if (response.data.candidates && response.data.candidates[0]?.content?.parts[0]?.text) {
              // Google Generative AI raw structure check
              botReplyText = response.data.candidates[0].content.parts[0].text;
            } else if (response.data.message && typeof response.data.message === 'string') {
              botReplyText = response.data.message;
            } else if (response.data.message && response.data.message.content) {
              // OpenAI standard structure check
              botReplyText = response.data.message.content;
            } else {
              botReplyText = JSON.stringify(response.data);
            }
          }

          if (!botReplyText || botReplyText === "{}") {
            botReplyText = "I'm having trouble generating a response. Please try again!";
          }

          const botMessage = {
            id: Date.now() + 1,
            text: botReplyText,
            sender: 'bot',
            timestamp: new Date(),
            replyTo: userMessage ? userMessage.id : null
          };

          setMessages(prev => [...prev, botMessage]);
          setIsTyping(false);
        }, 1000);

      } catch (error) {
        // 🔥 Check if error is due to cancellation
        if (error.name === 'CanceledError' || abortControllerRef.current?.signal.aborted) {
          console.log('Request was cancelled by user');
          return;
        }

        console.error('Chatbot error details:', error);
        
        setTimeout(() => {
          if (abortControllerRef.current?.signal.aborted) {
            console.log('Error response cancelled');
            return;
          }

          const errorMessage = {
            id: Date.now() + 1,
            text: "I'm having trouble connecting right now. Please try again or ask me a specific fitness question!",
            sender: 'bot',
            timestamp: new Date(),
            replyTo: userMessage ? userMessage.id : null
          };
          
          setMessages(prev => [...prev, errorMessage]);
          setIsTyping(false);
        }, 1000);

      } finally {
        setIsLoading(false);
      }
    }, 500);
  };
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingMessage) {
        sendMessage(inputMessage, true, editingMessage.id);
      } else {
        sendMessage();
      }
    }
    if (e.key === 'Escape') {
      setEditingMessage(null);
      setReplyingTo(null);
      setInputMessage('');
    }
  };

  const getSuggestions = () => [
    "Best exercises for weight gain",
    "High protein foods for muscle building", 
    "Beginner workout routine",
    "How much protein do I need daily?",
    "Best time to eat after workout",
    "Home workout without equipment"
  ];

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // 🔥 ENHANCED: Clear chat with complete request cancellation
  const clearChat = () => {
    // Cancel any ongoing API request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log('Cancelled ongoing API request');
    }
    
    // Cancel any ongoing loading/typing immediately
    setIsLoading(false);
    setIsTyping(false);
    
    setMessages([
      {
        id: 1,
        text: "Chat cleared! How can I help you with your fitness goals today? 💪",
        sender: 'bot',
        timestamp: new Date(),
        replyTo: null
      }
    ]);
    setEditingMessage(null);
    setReplyingTo(null);
    setConversationContext([]);
  };

  const startEdit = (message) => {
    setEditingMessage(message);
    setInputMessage(message.text);
    setReplyingTo(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const startReply = (message) => {
    setReplyingTo(message);
    setEditingMessage(null);
    setInputMessage('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const deleteMessage = (messageId) => {
    setMessages(prev => prev.filter(msg => {
      if (msg.id === messageId) return false;
      if (msg.replyTo === messageId) return false;
      return true;
    }));
  };

  const getReplyToMessage = (replyToId) => {
    return messages.find(msg => msg.id === replyToId);
  };

  const canDeleteMessage = (messageId) => {
    if (!isLoading && !isTyping) return true;
    
    const userMessages = messages.filter(msg => msg.sender === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1];
    
    if (lastUserMessage && lastUserMessage.id === messageId) {
      return false;
    }
    
    return true;
  };

  return (
    <>
      {/* 🔥 UPDATED: Message Square Icon */}
      <div 
        className={`premium-chat-icon ${isOpen ? 'chat-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="icon-container">
          <div className="icon-background"></div>
          <div className="icon-content">
            {isOpen ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            ) : (
              // 🔥 NEW: Message Square Icon
  <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"/>
</svg>
            )}
          </div>
          <div className="ripple-effect"></div>
        </div>
        
        {!isOpen && messages.length === 1 && (
          <div className="notification-badge">
            <span>START</span>
          </div>
        )}
      </div>

      {/* Premium Full-Size Chat Window */}
      {isOpen && (
        <>
          <div className="chat-overlay" onClick={() => setIsOpen(false)}></div>
          
          <div className="premium-chat-window">
            {/* Header with Clear + Minimize */}
            <div className="premium-chat-header">
              <div className="header-background"></div>
              <div className="header-content">
                <div className="chat-header-left">
                  <div className="premium-avatar">
                    <div className="avatar-ring"></div>
                    <div className="avatar-content">
                      <span>🤖</span>
                    </div>
                    <div className="status-indicator"></div>
                  </div>
                  <div className="chat-info">
                    <h3>AI Fitness Coach</h3>
                    <div className="status-text">
                      <div className="online-dot"></div>
                      <span>Online & Ready to Help</span>
                    </div>
                  </div>
                </div>
                
                <div className="header-actions">
                  <button 
                    className="action-btn clear-btn"
                    onClick={clearChat}
                    title="Clear conversation"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6H5H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  <button 
                    className="action-btn minimize-btn"
                    onClick={() => setIsOpen(false)}
                    title="Minimize chat"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Premium Messages Area */}
            <div className="premium-messages-container">
              <div className="messages-background"></div>
              <div className={`premium-messages ${messages.length <= 1 ? 'hide-scrollbar' : ''}`}>
                {messages.map((message, index) => {
                  const replyToMessage = message.replyTo ? getReplyToMessage(message.replyTo) : null;
                  
                  return (
                    <div 
                      key={message.id} 
                      className={`premium-message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                      style={{
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <div className="message-wrapper">
                        {replyToMessage && (
                          <div className="reply-reference">
                            <div className="reply-line"></div>
                            <div className="reply-content">
                              <span className="reply-author">
                                {replyToMessage.sender === 'user' ? 'You' : 'AI Coach'}
                              </span>
                              <p className="reply-text">
                                {replyToMessage.text.length > 50 
                                  ? `${replyToMessage.text.substring(0, 50)}...` 
                                  : replyToMessage.text}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <div className="message-content">
                          <div className="message-text">
                            <p>{message.text}</p>
                          </div>
                          <div className="message-meta">
                            <span className="message-time">
                              {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            
                            <div className="message-actions">
                              <button 
                                className="message-action-btn reply-btn"
                                onClick={() => startReply(message)}
                                title="Reply to message"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M3 10H13C17.4183 10 21 13.5817 21 18V20M3 10L9 4M3 10L9 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                              
                              {message.sender === 'user' && (
                                <button 
                                  className="message-action-btn edit-btn"
                                  onClick={() => startEdit(message)}
                                  title="Edit message"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17 3C17.2626 2.73735 17.5744 2.52901 17.9176 2.38687C18.2608 2.24473 18.6286 2.17157 19 2.17157C19.3714 2.17157 19.7392 2.24473 20.0824 2.38687C20.4256 2.52901 20.7374 2.73735 21 3C21.2626 3.26264 21.471 3.57444 21.6131 3.9176C21.7553 4.26077 21.8284 4.62856 21.8284 5C21.8284 5.37143 21.7553 5.73923 21.6131 6.08239C21.471 6.42555 21.2626 6.73735 21 7L7.5 20.5L2 22L3.5 16.5L17 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              )}
                              
                              {message.sender === 'user' && (
                                <button 
                                  className={`message-action-btn delete-btn ${!canDeleteMessage(message.id) ? 'disabled' : ''}`}
                                  onClick={() => canDeleteMessage(message.id) && deleteMessage(message.id)}
                                  title={canDeleteMessage(message.id) ? "Delete message" : "Wait for AI response to complete"}
                                  disabled={!canDeleteMessage(message.id)}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 6H5H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {(isLoading || isTyping) && (
                  <div className="premium-message bot-message typing-message">
                    <div className="message-wrapper">
                      <div className="message-content">
                        <div className="premium-typing-indicator">
                          <div className="typing-animation">
                            <div className="typing-dots">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                            <div className="ai-brain">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </div>
                          <div className="typing-status">AI is analyzing your question...</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Premium Suggestions */}
            {messages.length === 1 && (
              <div className="premium-suggestions">
                <div className="suggestions-header">
                  <h4>💡 Popular Questions</h4>
                  <p>Get started with these common fitness topics</p>
                </div>
                <div className="suggestions-grid">
                  {getSuggestions().map((suggestion, index) => (
                    <button
                      key={index}
                      className="premium-suggestion-btn"
                      onClick={() => handleSuggestionClick(suggestion)}
                      style={{
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <div className="suggestion-icon">💪</div>
                      <div className="suggestion-text">{suggestion}</div>
                      <div className="suggestion-arrow">→</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Premium Input Area */}
            <div className="premium-input-area">
              <div className="input-background"></div>
              <div className="input-container">
                {(editingMessage || replyingTo) && (
                  <div className="input-context">
                    {editingMessage && (
                      <div className="edit-context">
                        <div className="context-header">
                          <span>✏️ Editing message</span>
                          <button 
                            className="context-close"
                            onClick={() => {
                              setEditingMessage(null);
                              setInputMessage('');
                            }}
                          >×</button>
                        </div>
                        <div className="context-content">{editingMessage.text}</div>
                      </div>
                    )}
                    
                    {replyingTo && (
                      <div className="reply-context">
                        <div className="context-header">
                          <span>↩️ Replying to {replyingTo.sender === 'user' ? 'You' : 'AI Coach'}</span>
                          <button 
                            className="context-close"
                            onClick={() => setReplyingTo(null)}
                          >×</button>
                        </div>
                        <div className="context-content">
                          {replyingTo.text.length > 100 
                            ? `${replyingTo.text.substring(0, 100)}...` 
                            : replyingTo.text}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="input-wrapper">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      editingMessage 
                        ? "Edit your message..." 
                        : replyingTo 
                          ? "Reply to message..." 
                          : "Ask me anything about fitness, nutrition, workouts, or health tips..."
                    }
                    className="premium-input"
                    rows="3"
                    disabled={isLoading}
                    maxLength="500"
                  />
                  <div className="input-actions">
                    <div className="input-info">
                      <span>{inputMessage.length}/500</span>
                    </div>
                    <button 
                      onClick={() => {
                        if (editingMessage) {
                          sendMessage(inputMessage, true, editingMessage.id);
                        } else {
                          sendMessage();
                        }
                      }}
                      className={`premium-send-btn ${isLoading ? 'sending' : ''}`}
                      disabled={!inputMessage.trim() || isLoading}
                    >
                      <div className="btn-content">
                        {isLoading ? (
                          <div className="loading-spinner">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3"/>
                              <path d="M2 12C2 6.477 6.477 2 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </div>
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className="btn-text">
                        {editingMessage ? 'Update' : 'Send'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FloatingChatbot;





















































// import React, { useState, useRef, useEffect } from 'react';
// import axios from '../utils/axios';
// import './FloatingChatbots.css';

// const FloatingChatbot = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       text: "Hi! I'm your AI fitness assistant. Ask me anything about workouts, nutrition, or health tips! 💪",
//       sender: 'bot',
//       timestamp: new Date(),
//       replyTo: null
//     }
//   ]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const [editingMessage, setEditingMessage] = useState(null);
//   const [replyingTo, setReplyingTo] = useState(null);
//   const [, setConversationContext] = useState([]);
//   const messagesEndRef = useRef(null);
//   const inputRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Auto-focus input after AI response is complete
//   useEffect(() => {
//     if (!isLoading && !isTyping && inputRef.current) {
//       setTimeout(() => {
//         inputRef.current.focus();
//       }, 300);
//     }
//   }, [isLoading, isTyping]);

//   const buildConversationContext = (currentMessage, replyToMessage = null) => {
//     let context = [];
    
//     if (replyToMessage) {
//       context.push(`Previous context: "${replyToMessage.text}"`);
//     }
    
//     // Add last 3 message pairs for context
//     const recentMessages = messages.slice(-6);
//     for (let i = 0; i < recentMessages.length; i += 2) {
//       const userMsg = recentMessages[i];
//       const botMsg = recentMessages[i + 1];
//       if (userMsg && botMsg && userMsg.sender === 'user' && botMsg.sender === 'bot') {
//         context.push(`Previous Q: "${userMsg.text}" A: "${botMsg.text}"`);
//       }
//     }
    
//     context.push(`Current question: "${currentMessage}"`);
//     return context.join('\n');
//   };

//   const sendMessage = async (messageText = null, isEdit = false, originalMessageId = null) => {
//     const textToSend = messageText || inputMessage.trim();
//     if (!textToSend || isLoading) return;

//     let userMessage;
    
//     if (isEdit && originalMessageId) {
//       setMessages(prev => prev.map(msg => 
//         msg.id === originalMessageId 
//           ? { ...msg, text: textToSend, timestamp: new Date() }
//           : msg
//       ));
//       userMessage = messages.find(msg => msg.id === originalMessageId);
//     } else {
//       userMessage = {
//         id: Date.now(),
//         text: textToSend,
//         sender: 'user',
//         timestamp: new Date(),
//         replyTo: replyingTo?.id || null
//       };
//       setMessages(prev => [...prev, userMessage]);
//     }

//     setInputMessage('');
//     setEditingMessage(null);
//     setReplyingTo(null);
//     setIsLoading(true);
//     setIsTyping(true);

//     if (isEdit && originalMessageId) {
//       setMessages(prev => prev.filter(msg => 
//         !(msg.sender === 'bot' && msg.replyTo === originalMessageId)
//       ));
//     }

//     setTimeout(async () => {
//       try {
//         const contextualMessage = buildConversationContext(textToSend, replyingTo);
        
//         console.log('Sending contextual message to chatbot API:', contextualMessage);
        
//         const response = await axios.post('/chatbot', {
//           message: contextualMessage,
//           isContextual: true
//         }, {
//           timeout: 20000,
//           headers: {
//             'Content-Type': 'application/json'
//           }
//         });

//         console.log('Chatbot API response:', response.data);

//         setTimeout(() => {
//           const botMessage = {
//             id: Date.now() + 1,
//             text: response.data.reply || "I'm having trouble generating a response. Please try asking your fitness question again!",
//             sender: 'bot',
//             timestamp: new Date(),
//             replyTo: userMessage.id
//           };

//           setMessages(prev => [...prev, botMessage]);
//           setIsTyping(false);
//         }, 1000);

//       } catch (error) {
//         console.error('Chatbot error details:', error);
        
//         setTimeout(() => {
//           const errorMessage = {
//             id: Date.now() + 1,
//             text: "I'm having trouble connecting right now. Please try again or ask me a specific fitness question!",
//             sender: 'bot',
//             timestamp: new Date(),
//             replyTo: userMessage.id
//           };
          
//           setMessages(prev => [...prev, errorMessage]);
//           setIsTyping(false);
//         }, 1000);
//       } finally {
//         setIsLoading(false);
//       }
//     }, 500);
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       if (editingMessage) {
//         sendMessage(inputMessage, true, editingMessage.id);
//       } else {
//         sendMessage();
//       }
//     }
//     if (e.key === 'Escape') {
//       setEditingMessage(null);
//       setReplyingTo(null);
//       setInputMessage('');
//     }
//   };

//   const getSuggestions = () => [
//     "Best exercises for weight gain",
//     "High protein foods for muscle building", 
//     "Beginner workout routine",
//     "How much protein do I need daily?",
//     "Best time to eat after workout",
//     "Home workout without equipment"
//   ];

//   const handleSuggestionClick = (suggestion) => {
//     setInputMessage(suggestion);
//     if (inputRef.current) {
//       inputRef.current.focus();
//     }
//   };

//   // 🔥 ENHANCED: Clear chat with loading cancellation
//   const clearChat = () => {
//     // Cancel any ongoing loading/typing
//     setIsLoading(false);
//     setIsTyping(false);
    
//     setMessages([
//       {
//         id: 1,
//         text: "Chat cleared! How can I help you with your fitness goals today? 💪",
//         sender: 'bot',
//         timestamp: new Date(),
//         replyTo: null
//       }
//     ]);
//     setEditingMessage(null);
//     setReplyingTo(null);
//     setConversationContext([]);
//   };

//   const startEdit = (message) => {
//     setEditingMessage(message);
//     setInputMessage(message.text);
//     setReplyingTo(null);
//     if (inputRef.current) {
//       inputRef.current.focus();
//     }
//   };

//   const startReply = (message) => {
//     setReplyingTo(message);
//     setEditingMessage(null);
//     setInputMessage('');
//     if (inputRef.current) {
//       inputRef.current.focus();
//     }
//   };

//   const deleteMessage = (messageId) => {
//     setMessages(prev => prev.filter(msg => {
//       if (msg.id === messageId) return false;
//       if (msg.replyTo === messageId) return false;
//       return true;
//     }));
//   };

//   const getReplyToMessage = (replyToId) => {
//     return messages.find(msg => msg.id === replyToId);
//   };

//   const canDeleteMessage = (messageId) => {
//     if (!isLoading && !isTyping) return true;
    
//     const userMessages = messages.filter(msg => msg.sender === 'user');
//     const lastUserMessage = userMessages[userMessages.length - 1];
    
//     if (lastUserMessage && lastUserMessage.id === messageId) {
//       return false;
//     }
    
//     return true;
//   };

//   return (
//     <>
//       {/* 🔥 NEW: Updated Chat Icon */}
//       <div 
//         className={`premium-chat-icon ${isOpen ? 'chat-open' : ''}`}
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         <div className="icon-container">
//           <div className="icon-background"></div>
//           <div className="icon-content">
//             {isOpen ? (
//               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
//               </svg>
//             ) : (
//               // 🔥 NEW: Support/Headset Icon
//               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M3 18V12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12V18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
//                 <path d="M21 19C21 20.1046 20.1046 21 19 21H18C16.8954 21 16 20.1046 16 19V16C16 14.8954 16.8954 14 18 14H21V19Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
//                 <path d="M3 19C3 20.1046 3.89543 21 5 21H6C7.10457 21 8 20.1046 8 19V16C8 14.8954 7.10457 14 6 14H3V19Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
//               </svg>
//             )}
//           </div>
//           <div className="ripple-effect"></div>
//         </div>
        
//         {!isOpen && messages.length === 1 && (
//           <div className="notification-badge">
//             <span>START</span>
//           </div>
//         )}
//       </div>

//       {/* Premium Full-Size Chat Window */}
//       {isOpen && (
//         <>
//           <div className="chat-overlay" onClick={() => setIsOpen(false)}></div>
          
//           <div className="premium-chat-window">
//             {/* 🔥 UPDATED: Header with only 2 buttons */}
//             <div className="premium-chat-header">
//               <div className="header-background"></div>
//               <div className="header-content">
//                 <div className="chat-header-left">
//                   <div className="premium-avatar">
//                     <div className="avatar-ring"></div>
//                     <div className="avatar-content">
//                       <span>🤖</span>
//                     </div>
//                     <div className="status-indicator"></div>
//                   </div>
//                   <div className="chat-info">
//                     <h3>AI Fitness Coach</h3>
//                     <div className="status-text">
//                       <div className="online-dot"></div>
//                       <span>Online & Ready to Help</span>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="header-actions">
//                   <button 
//                     className="action-btn clear-btn"
//                     onClick={clearChat}
//                     title="Clear conversation"
//                   >
//                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                       <path d="M3 6H5H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                     </svg>
//                   </button>
                  
//                   <button 
//                     className="action-btn minimize-btn"
//                     onClick={() => setIsOpen(false)}
//                     title="Minimize chat"
//                   >
//                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                       <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                     </svg>
//                   </button>
                  
//                   {/* 🔥 REMOVED: Close button deleted */}
//                 </div>
//               </div>
//             </div>

//             {/* Premium Messages Area */}
//             <div className="premium-messages-container">
//               <div className="messages-background"></div>
//               <div className={`premium-messages ${messages.length <= 1 ? 'hide-scrollbar' : ''}`}>
//                 {messages.map((message, index) => {
//                   const replyToMessage = message.replyTo ? getReplyToMessage(message.replyTo) : null;
                  
//                   return (
//                     <div 
//                       key={message.id} 
//                       className={`premium-message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
//                       style={{
//                         animationDelay: `${index * 0.1}s`
//                       }}
//                     >
//                       <div className="message-wrapper">
//                         {replyToMessage && (
//                           <div className="reply-reference">
//                             <div className="reply-line"></div>
//                             <div className="reply-content">
//                               <span className="reply-author">
//                                 {replyToMessage.sender === 'user' ? 'You' : 'AI Coach'}
//                               </span>
//                               <p className="reply-text">
//                                 {replyToMessage.text.length > 50 
//                                   ? `${replyToMessage.text.substring(0, 50)}...` 
//                                   : replyToMessage.text}
//                               </p>
//                             </div>
//                           </div>
//                         )}
                        
//                         <div className="message-content">
//                           <div className="message-text">
//                             <p>{message.text}</p>
//                           </div>
//                           <div className="message-meta">
//                             <span className="message-time">
//                               {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
//                             </span>
                            
//                             <div className="message-actions">
//                               {/* Reply button for ALL messages */}
//                               <button 
//                                 className="message-action-btn reply-btn"
//                                 onClick={() => startReply(message)}
//                                 title="Reply to message"
//                               >
//                                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                                   <path d="M3 10H13C17.4183 10 21 13.5817 21 18V20M3 10L9 4M3 10L9 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                                 </svg>
//                               </button>
                              
//                               {/* 🔥 UPDATED: Simple pencil edit icon */}
//                               {message.sender === 'user' && (
//                                 <button 
//                                   className="message-action-btn edit-btn"
//                                   onClick={() => startEdit(message)}
//                                   title="Edit message"
//                                 >
//                                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                                     <path d="M17 3C17.2626 2.73735 17.5744 2.52901 17.9176 2.38687C18.2608 2.24473 18.6286 2.17157 19 2.17157C19.3714 2.17157 19.7392 2.24473 20.0824 2.38687C20.4256 2.52901 20.7374 2.73735 21 3C21.2626 3.26264 21.471 3.57444 21.6131 3.9176C21.7553 4.26077 21.8284 4.62856 21.8284 5C21.8284 5.37143 21.7553 5.73923 21.6131 6.08239C21.471 6.42555 21.2626 6.73735 21 7L7.5 20.5L2 22L3.5 16.5L17 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                                   </svg>
//                                 </button>
//                               )}
                              
//                               {/* Delete button for user messages only */}
//                               {message.sender === 'user' && (
//                                 <button 
//                                   className={`message-action-btn delete-btn ${!canDeleteMessage(message.id) ? 'disabled' : ''}`}
//                                   onClick={() => canDeleteMessage(message.id) && deleteMessage(message.id)}
//                                   title={canDeleteMessage(message.id) ? "Delete message" : "Wait for AI response to complete"}
//                                   disabled={!canDeleteMessage(message.id)}
//                                 >
//                                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                                     <path d="M3 6H5H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                                   </svg>
//                                 </button>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
                
//                 {(isLoading || isTyping) && (
//                   <div className="premium-message bot-message typing-message">
//                     <div className="message-wrapper">
//                       <div className="message-content">
//                         <div className="premium-typing-indicator">
//                           <div className="typing-animation">
//                             <div className="typing-dots">
//                               <span></span>
//                               <span></span>
//                               <span></span>
//                             </div>
//                             <div className="ai-brain">
//                               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                                 <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                                 <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                                 <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                               </svg>
//                             </div>
//                           </div>
//                           <div className="typing-status">AI is analyzing your question...</div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
                
//                 <div ref={messagesEndRef} />
//               </div>
//             </div>

//             {/* Premium Suggestions */}
//             {messages.length === 1 && (
//               <div className="premium-suggestions">
//                 <div className="suggestions-header">
//                   <h4>💡 Popular Questions</h4>
//                   <p>Get started with these common fitness topics</p>
//                 </div>
//                 <div className="suggestions-grid">
//                   {getSuggestions().map((suggestion, index) => (
//                     <button
//                       key={index}
//                       className="premium-suggestion-btn"
//                       onClick={() => handleSuggestionClick(suggestion)}
//                       style={{
//                         animationDelay: `${index * 0.1}s`
//                       }}
//                     >
//                       <div className="suggestion-icon">💪</div>
//                       <div className="suggestion-text">{suggestion}</div>
//                       <div className="suggestion-arrow">→</div>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Premium Input Area */}
//             <div className="premium-input-area">
//               <div className="input-background"></div>
//               <div className="input-container">
//                 {(editingMessage || replyingTo) && (
//                   <div className="input-context">
//                     {editingMessage && (
//                       <div className="edit-context">
//                         <div className="context-header">
//                           <span>✏️ Editing message</span>
//                           <button 
//                             className="context-close"
//                             onClick={() => {
//                               setEditingMessage(null);
//                               setInputMessage('');
//                             }}
//                           >×</button>
//                         </div>
//                         <div className="context-content">{editingMessage.text}</div>
//                       </div>
//                     )}
                    
//                     {replyingTo && (
//                       <div className="reply-context">
//                         <div className="context-header">
//                           <span>↩️ Replying to {replyingTo.sender === 'user' ? 'You' : 'AI Coach'}</span>
//                           <button 
//                             className="context-close"
//                             onClick={() => setReplyingTo(null)}
//                           >×</button>
//                         </div>
//                         <div className="context-content">
//                           {replyingTo.text.length > 100 
//                             ? `${replyingTo.text.substring(0, 100)}...` 
//                             : replyingTo.text}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}
                
//                 <div className="input-wrapper">
//                   <textarea
//                     ref={inputRef}
//                     value={inputMessage}
//                     onChange={(e) => setInputMessage(e.target.value)}
//                     onKeyPress={handleKeyPress}
//                     placeholder={
//                       editingMessage 
//                         ? "Edit your message..." 
//                         : replyingTo 
//                           ? "Reply to message..." 
//                           : "Ask me anything about fitness, nutrition, workouts, or health tips..."
//                     }
//                     className="premium-input"
//                     rows="3"
//                     disabled={isLoading}
//                     maxLength="500"
//                   />
//                   <div className="input-actions">
//                     <div className="input-info">
//                       <span>{inputMessage.length}/500</span>
//                     </div>
//                     <button 
//                       onClick={() => {
//                         if (editingMessage) {
//                           sendMessage(inputMessage, true, editingMessage.id);
//                         } else {
//                           sendMessage();
//                         }
//                       }}
//                       className={`premium-send-btn ${isLoading ? 'sending' : ''}`}
//                       disabled={!inputMessage.trim() || isLoading}
//                     >
//                       <div className="btn-content">
//                         {isLoading ? (
//                           <div className="loading-spinner">
//                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                               <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3"/>
//                               <path d="M2 12C2 6.477 6.477 2 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
//                             </svg>
//                           </div>
//                         ) : (
//                           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                             <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                           </svg>
//                         )}
//                       </div>
//                       <span className="btn-text">
//                         {editingMessage ? 'Update' : 'Send'}
//                       </span>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </>
//   );
// };

// export default FloatingChatbot;

