import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, Send, Sparkles, Package,
  Calculator, TrendingUp, Eye, FileText,
  Lightbulb, ArrowRight, Loader2, Bot,
  User, RefreshCw, Trash2, Copy
} from 'lucide-react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  actionItems?: string[];
  timestamp: number;
}

export const DashboardAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'assistant',
      content: "Welcome to your AI Packaging Assistant! I'm here to help you optimize your packaging strategies, analyze results, and answer any questions you have about your packaging operations. What would you like to know?",
      suggestions: [
        "How can I optimize my packaging costs?",
        "What's the best way to analyze my suite results?", 
        "Help me choose sustainable packaging materials",
        "Explain packaging fill rates and efficiency"
      ],
      actionItems: [],
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const askAssistant = useAction(api.aiAssistant.askAssistant);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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
        actionItems: response.actionItems,
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
    if (e.key === 'Enter' && !e.shiftKey) {
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
        content: "Chat cleared! I'm ready to help you with any packaging questions you have.",
        suggestions: [
          "How can I optimize my packaging costs?",
          "What's the best way to analyze my suite results?", 
          "Help me choose sustainable packaging materials",
          "Explain packaging fill rates and efficiency"
        ],
        actionItems: [],
        timestamp: Date.now()
      }
    ]);
    toast.success('Chat cleared');
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Packaging Assistant</h1>
                <p className="text-sm text-gray-600">Get expert advice and insights for your packaging optimization</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Online
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="text-gray-600 hover:text-gray-800"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-4">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'assistant' 
                    ? 'bg-blue-100' 
                    : 'bg-gray-100'
                }`}>
                  {message.type === 'assistant' ? (
                    <Bot className="h-5 w-5 text-blue-600" />
                  ) : (
                    <User className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                
                {/* Message Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {message.type === 'assistant' ? 'AI Assistant' : 'You'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className={`rounded-lg p-4 relative group ${
                    message.type === 'assistant' 
                      ? 'bg-white border border-gray-200 shadow-sm' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    <p className={`text-sm leading-relaxed ${
                      message.type === 'assistant' ? 'text-gray-700' : 'text-white'
                    }`}>
                      {message.content}
                    </p>
                    
                    {/* Copy button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyMessage(message.content)}
                      className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                        message.type === 'assistant' ? 'hover:bg-gray-100' : 'hover:bg-blue-700 text-white'
                      }`}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-gray-600">Suggested questions:</p>
                      <div className="grid gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-left text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg border border-blue-200 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Items */}
                  {message.actionItems && message.actionItems.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-green-600" />
                        <p className="text-sm font-medium text-green-700">Recommended Actions:</p>
                      </div>
                      <div className="space-y-2">
                        {message.actionItems.map((action, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                            <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 flex-1 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <p className="text-sm text-gray-500">AI is thinking...</p>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about packaging optimization, analysis results, material selection, or cost reduction strategies..."
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 resize-none min-h-[60px] max-h-32"
                  rows={2}
                />
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Press Enter to send, Shift + Enter for new line
                  </p>
                  <p className="text-xs text-gray-400">
                    {inputValue.length}/1000 characters
                  </p>
                </div>
              </div>
              <Button 
                size="lg"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || inputValue.length > 1000}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};