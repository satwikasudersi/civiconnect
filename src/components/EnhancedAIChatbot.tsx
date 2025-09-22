import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Bot, User, X, Minimize2, Maximize2, Sparkles, FileText, Mic, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAIComplaintAssistant } from '@/hooks/useAIComplaintAssistant';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'guidance';
  metadata?: any;
}

interface StepByStepData {
  title?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  location?: string;
  priority?: string;
}

export default function EnhancedAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI civic assistant. I can help you:\n\n• Report complaints step by step\n• Categorize your issues automatically\n• Assess priority levels\n• Answer questions about civic services in Telangana\n\nHow can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
      type: 'guidance'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [stepByStepMode, setStepByStepMode] = useState(false);
  const [stepByStepData, setStepByStepData] = useState<StepByStepData>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const {
    chatStep,
    getNextGuidance,
    setChatStep,
    setChatContext
  } = useAIComplaintAssistant();

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: speechSupported
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && isVoiceMode) {
      setInputMessage(transcript);
    }
  }, [transcript, isVoiceMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      let aiResponse: string;

      if (stepByStepMode) {
        // Handle step-by-step guidance
        const guidance = await getNextGuidance(currentInput);
        
        // Update step data based on current step
        if (chatStep === 'category' && currentInput) {
          setStepByStepData(prev => ({ ...prev, category: currentInput }));
        } else if (chatStep === 'description' && currentInput) {
          setStepByStepData(prev => ({ ...prev, description: currentInput }));
        } else if (chatStep === 'location' && currentInput) {
          setStepByStepData(prev => ({ ...prev, location: currentInput }));
        }

        aiResponse = guidance.message;

        // Add suggested actions as separate message if available
        if (guidance.suggestedActions && guidance.suggestedActions.length > 0) {
          const actionsMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: 'Quick actions:',
            sender: 'ai',
            timestamp: new Date(),
            type: 'suggestion',
            metadata: { actions: guidance.suggestedActions }
          };
          
          setTimeout(() => {
            setMessages(prev => [...prev, actionsMessage]);
          }, 500);
        }
      } else {
        // Regular AI chat
        const { data, error } = await supabase.functions.invoke('ai-chatbot', {
          body: {
            message: currentInput,
            conversationId: conversationId,
            context: 'enhanced_chatbot'
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        aiResponse = data.response;
        if (data.conversationId) {
          setConversationId(data.conversationId);
        }
      }

      const aiMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        type: stepByStepMode ? 'guidance' : 'text'
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Enhanced fallback response based on user input
      let fallbackResponse = 'I apologize, but I am currently experiencing technical difficulties. Here are some quick answers:';
      
      const lowerInput = currentInput.toLowerCase();
      if (lowerInput.includes('submit') || lowerInput.includes('report') || lowerInput.includes('complaint')) {
        fallbackResponse = `📝 **How to Submit a Complaint:**

1. Click on "Report Issues" in the main dashboard
2. Select your issue category (🚧 Roads, 💧 Water, 🗑️ Waste, ⚡ Electricity)
3. Provide detailed description and location
4. Upload photos if available
5. Submit and get your tracking ID

I'll be back online soon to provide more personalized help! 😊`;
      } else if (lowerInput.includes('track') || lowerInput.includes('status')) {
        fallbackResponse = `📊 **Track Your Complaint:**

1. Go to "My Reports" section
2. Use your tracking ID to check status
3. Status flow: Pending → In Progress → Resolved
4. Get SMS/email notifications for updates

Currently offline, but tracking system is always available! 🔍`;
      } else if (lowerInput.includes('category') || lowerInput.includes('type')) {
        fallbackResponse = `🏢 **Issue Categories:**

• 🚧 Roads & Infrastructure
• 💧 Water Supply Issues  
• 🗑️ Waste Management
• ⚡ Electricity & Streetlights
• 🚰 Drainage Problems
• 💰 Corruption Cases

Each gets routed to the right authority automatically! ⚡`;
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: fallbackResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startStepByStepMode = () => {
    setStepByStepMode(true);
    setChatStep('start');
    setStepByStepData({});
    
    const guidanceMessage: Message = {
      id: Date.now().toString(),
      content: 'Great! I\'ll guide you through reporting your complaint step by step. Let\'s start - what type of issue would you like to report?',
      sender: 'ai',
      timestamp: new Date(),
      type: 'guidance',
      metadata: { 
        actions: ['Municipal issue (roads, water, waste)', 'Political corruption case', 'Not sure - describe the problem'] 
      }
    };
    
    setMessages(prev => [...prev, guidanceMessage]);
  };

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
    setTimeout(() => sendMessage(), 100);
  };

  const toggleVoiceMode = () => {
    if (isListening) {
      stopListening();
    } else if (speechSupported) {
      resetTranscript();
      startListening();
      setIsVoiceMode(true);
      toast({
        title: "Voice Mode Active",
        description: "Speak your message. It will be sent automatically when you stop talking.",
      });
    } else {
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice input.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'guidance':
        return <Sparkles className="h-4 w-4" />;
      case 'suggestion':
        return <FileText className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-16 w-16 shadow-glow bg-gradient-primary hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <MessageCircle className="h-8 w-8" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-96 transition-all duration-300 shadow-card bg-gradient-card backdrop-blur-sm border-primary/20 ${
        isMinimized ? 'h-16' : 'h-[600px]'
      }`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-gradient-primary text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <CardTitle className="text-lg font-semibold">AI Civic Assistant</CardTitle>
            {stepByStepMode && (
              <Badge variant="secondary" className="text-xs">
                Step-by-Step
              </Badge>
            )}
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex flex-col h-[520px] p-0">
            {/* Quick Actions Bar */}
            <div className="p-3 bg-muted/30 border-b">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startStepByStepMode}
                  className="text-xs"
                  disabled={stepByStepMode}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Report Issue
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStepByStepMode(false)}
                  className="text-xs"
                  disabled={!stepByStepMode}
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Free Chat
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div
                      className={`flex items-start space-x-2 ${
                        message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === 'user' 
                          ? 'bg-primary text-white' 
                          : 'bg-accent text-white'
                      }`}>
                        {message.sender === 'user' ? <User className="h-4 w-4" /> : getMessageIcon(message.type)}
                      </div>
                      <div className={`max-w-[80%] ${message.sender === 'user' ? 'text-right' : ''}`}>
                        <div className={`rounded-lg p-3 shadow-soft ${
                          message.sender === 'user'
                            ? 'bg-primary text-white ml-auto'
                            : message.type === 'guidance' 
                              ? 'bg-gradient-subtle border border-primary/20'
                              : 'bg-white border border-border'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 px-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Quick Action Buttons */}
                    {message.type === 'suggestion' && message.metadata?.actions && (
                      <div className="flex flex-wrap gap-2 ml-10">
                        {message.metadata.actions.map((action: string, index: number) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickAction(action)}
                            className="text-xs"
                          >
                            {action}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-white border border-border rounded-lg p-3 shadow-soft">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="border-t bg-background p-4">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={stepByStepMode ? "Answer the current question..." : "Ask me about civic issues, report complaints..."}
                  disabled={isLoading}
                  className="flex-1"
                />
                {speechSupported && (
                  <Button
                    onClick={toggleVoiceMode}
                    disabled={isLoading}
                    size="sm"
                    variant={isListening ? "destructive" : "outline"}
                    className="px-3"
                  >
                    {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                )}
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="px-3 bg-gradient-primary hover:shadow-glow transition-all"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {stepByStepMode 
                  ? 'Step-by-step complaint reporting mode' 
                  : 'AI assistant for Telangana civic reporting'
                }
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}