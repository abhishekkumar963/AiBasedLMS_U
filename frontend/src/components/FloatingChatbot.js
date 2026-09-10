import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User,
  Minimize2,
  Maximize2
} from 'lucide-react';
import api from '../utils/api';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hi! I'm your AI learning assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/api/ai/chat', {
        message: inputMessage.trim()
      });

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: response.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: "Sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-neon-500 to-purple-600 hover:from-neon-400 hover:to-purple-500 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 neon-glow-blue"
          title="Chat with AI Assistant"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] glass-card rounded-2xl shadow-2xl border border-glass-border flex flex-col">
      {/* Header */}
      <div className="gradient-neon text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center">
          <Bot className="w-5 h-5 mr-2" />
          <span className="font-bold">AI Assistant</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-white/20 p-1 rounded transition-colors"
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 p-1 rounded transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start max-w-xs ${
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-primary-600 ml-2' 
                      : 'bg-secondary-600 mr-2'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  <div className={`px-3 py-2 rounded-xl ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-neon-500 to-purple-600 text-white'
                      : 'glass text-white'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-white/80' : 'text-gray-300'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start max-w-xs">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-600 mr-2 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-3 py-2 rounded-xl glass">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-neon-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-neonGreen-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-glass-border p-4">
            <form onSubmit={sendMessage} className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                className="flex-1 px-3 py-2 glass border border-glass-border rounded-xl focus:outline-none focus:border-neon-400 focus:neon-glow-blue text-white placeholder-gray-400 text-sm"
                placeholder="Ask me anything..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="btn-neon-blue p-2 rounded-xl disabled:opacity-50 transition-all duration-300"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default FloatingChatbot;
