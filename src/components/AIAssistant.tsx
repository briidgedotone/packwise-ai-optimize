import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, X, Send, Sparkles, Package,
  Calculator, TrendingUp, Eye, Scale, FileText,
  Lightbulb, ArrowRight, Loader2
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

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentFeature?: string;
  analysisResults?: any;
}

export const AIAssistant = ({ 
  isOpen, 
  onClose, 
  currentFeature,
  analysisResults 
}: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'assistant',
      content: "Hi! I'm your AI assistant for packaging optimization. How can I help you today?",
      suggestions: [
        "Suite analysis questions",
        "Spec generation guidance", 
        "Demand planning insights",
        "PDP optimization tips",
        "Design comparison analysis"
      ],
      actionItems: [],
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const askAssistant = useAction(api.aiAssistant.askAssistant);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

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
          currentFeature,
          userHistory: messages.filter(m => m.type === 'user').slice(-3).map(m => m.content),
          analysisResults: analysisResults || undefined
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const getFeatureIcon = (feature?: string) => {
    switch (feature) {
      case 'suite-analyzer-backend': return Package;
      case 'spec-generator': return Calculator;
      case 'demand-planner': return TrendingUp;
      case 'pdp-analyzer': return Eye;
      case 'design-comparator': return Scale;
      case 'reports': return FileText;
      default: return Sparkles;
    }
  };

  const getFeatureLabel = (feature?: string) => {
    switch (feature) {
      case 'suite-analyzer-backend': return 'Suite Analyzer';
      case 'spec-generator': return 'Spec Generator';
      case 'demand-planner': return 'Demand Planner';
      case 'pdp-analyzer': return 'PDP Analyzer';
      case 'design-comparator': return 'Design Comparator';
      case 'reports': return 'Reports';
      default: return 'General';
    }
  };

  if (!isOpen) return null;

  const FeatureIcon = getFeatureIcon(currentFeature);

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* AI Assistant Panel */}
      <div className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-w-md h-[500px] bg-white border border-gray-200 rounded-lg shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              {currentFeature && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <FeatureIcon className="h-3 w-3" />
                  <span>{getFeatureLabel(currentFeature)}</span>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost" 
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50/30">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'assistant' 
                    ? 'bg-blue-100' 
                    : 'bg-gray-100'
                }`}>
                  {message.type === 'assistant' ? (
                    <Sparkles className="h-3 w-3 text-blue-600" />
                  ) : (
                    <div className="w-3 h-3 bg-gray-500 rounded-full" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className={`rounded-lg p-3 ${
                    message.type === 'assistant' 
                      ? 'bg-white border border-gray-100' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    <p className={`text-sm ${
                      message.type === 'assistant' ? 'text-gray-700' : 'text-white'
                    }`}>
                      {message.content}
                    </p>
                  </div>

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200 transition-colors"
                        >
                          • {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Action Items */}
                  {message.actionItems && message.actionItems.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1 text-xs font-medium text-green-700">
                        <Lightbulb className="h-3 w-3" />
                        Next Steps:
                      </div>
                      {message.actionItems.map((action, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                          <ArrowRight className="h-3 w-3" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Loader2 className="h-3 w-3 text-blue-600 animate-spin" />
                </div>
                <div className="bg-white border border-gray-100 rounded-lg p-3 flex-1">
                  <p className="text-sm text-gray-500">Thinking...</p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input Area */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about packaging..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            <Button 
              size="sm" 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {currentFeature && (
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <FeatureIcon className="h-3 w-3" />
              Context: {getFeatureLabel(currentFeature)}
            </div>
          )}
        </div>
      </div>
    </>
  );
};