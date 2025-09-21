import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, Send,
  User, Loader2, RefreshCw, Minimize2,
  Maximize2, Copy
} from 'lucide-react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  timestamp: number;
}

export const EmbeddedAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'assistant',
      content: "Hi! I'm your AI assistant. Ask me anything about packaging optimization, cost reduction, or analysis insights!",
      suggestions: [
        "How can I optimize my packaging costs?",
        "What's the best way to analyze my results?", 
        "Help me choose sustainable materials",
        "Explain packaging fill rates"
      ],
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const askAssistant = useAction(api.aiAssistant.askAssistant);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for custom events to pre-fill input
  useEffect(() => {
    const handleFillInput = (event: CustomEvent) => {
      if (event.detail) {
        setInputValue(event.detail);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    window.addEventListener('fillDashboardAIInput', handleFillInput as EventListener);
    
    return () => {
      window.removeEventListener('fillDashboardAIInput', handleFillInput as EventListener);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await askAssistant({
        message: userMessage.content,
        context: {
          currentFeature: 'dashboard',
          userHistory: messages.filter(m => m.type === 'user').slice(-3).map(m => m.content),
          analysisResults: undefined
        }
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.response,
        suggestions: response.suggestions,
        timestamp: response.timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get AI response');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        type: 'assistant',
        content: "Chat cleared! How can I help you with your packaging optimization?",
        suggestions: [
          "How can I optimize my packaging costs?",
          "What's the best way to analyze my results?", 
          "Help me choose sustainable materials",
          "Explain packaging fill rates"
        ],
        timestamp: Date.now()
      }
    ]);
    toast.success('Chat cleared');
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
      {/* Minimal Header - ChatGPT Style */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">AI Assistant</h3>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md p-1.5"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md p-1.5"
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area - ChatGPT Style */}
      <div className={`overflow-y-auto bg-white ${isExpanded ? 'h-96' : 'h-80'}`}>
        <div className="space-y-0">
          {messages.map((message) => (
            <div key={message.id} className={`group hover:bg-gray-50/50 ${
              message.type === 'assistant' ? 'bg-gray-50/30' : 'bg-white'
            }`}>
              <div className="max-w-none mx-auto px-6 py-6">
                <div className="flex gap-4">
                  {/* Avatar - ChatGPT Style */}
                  <div className={`w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0 ${
                    message.type === 'assistant' 
                      ? 'bg-green-500' 
                      : 'bg-blue-500'
                  }`}>
                    {message.type === 'assistant' ? (
                      <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                        <span className="text-green-500 text-xs font-bold">AI</span>
                      </div>
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </div>

                    {/* Suggestions - ChatGPT Style */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {message.suggestions.slice(0, 2).map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full border border-gray-200 transition-all duration-150"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Copy button - ChatGPT Style */}
                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyMessage(message.content)}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 h-7 px-2 rounded-md"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        <span className="text-xs">Copy</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="bg-gray-50/30 hover:bg-gray-50/50">
              <div className="max-w-none mx-auto px-6 py-6">
                <div className="flex gap-4">
                  <div className="w-7 h-7 bg-green-500 rounded-sm flex items-center justify-center flex-shrink-0">
                    <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                      <Loader2 className="h-2.5 w-2.5 text-green-500 animate-spin" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - ChatGPT Style */}
      <div className="p-4 bg-white">
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm focus-within:shadow-md focus-within:border-gray-300 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message AI Assistant..."
              disabled={isLoading}
              className="flex-1 resize-none bg-transparent text-sm focus:outline-none disabled:opacity-50 placeholder-gray-400"
            />
            <Button 
              size="sm" 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className={`p-2 rounded-lg transition-all duration-150 ${
                inputValue.trim() && !isLoading 
                  ? 'bg-black hover:bg-gray-800 text-white' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 px-2">
            <p className="text-xs text-gray-500 text-center">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};