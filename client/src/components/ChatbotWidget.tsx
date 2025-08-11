import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  userId?: string;
  message: string;
  sender: 'user' | 'bot' | 'doctor';
  timestamp: Date;
  createdAt?: any;
}

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { userData } = useAuth();
  const { t } = useTranslation();
  
  const { data: messages, add: addMessage } = useFirestore<Message>('chat_messages',
    userData ? [{ field: 'userId', operator: '==', value: userData.id }] : undefined
  );

  const sendMessage = async () => {
    if (!message.trim() || !userData) return;

    try {
      // Add user message
      await addMessage({
        userId: userData.id,
        message: message,
        sender: 'user',
        timestamp: new Date(),
      });

      const userMessage = message;
      setMessage('');

      // Simulate bot response
      setTimeout(async () => {
        const botResponse = getBotResponse(userMessage);
        await addMessage({
          userId: userData.id,
          message: botResponse,
          sender: 'bot',
          timestamp: new Date(),
        });
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getBotResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('upload') || msg.includes('report')) {
      return t('botResponseUpload');
    } else if (msg.includes('dose') || msg.includes('medication')) {
      return t('botResponseDose');
    } else if (msg.includes('appointment')) {
      return t('botResponseAppointment');
    } else if (msg.includes('family')) {
      return t('botResponseFamily');
    } else if (msg.includes('ai') || msg.includes('analysis')) {
      return t('botResponseAi');
    } else if (msg.includes('hello') || msg.includes('hi')) {
      return t('botResponseHello');
    } else {
      return t('botResponseDefault');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Sort messages by timestamp
  const sortedMessages = messages.sort((a, b) => {
    const timeA = a.createdAt?.toDate?.() || new Date(a.timestamp);
    const timeB = b.createdAt?.toDate?.() || new Date(b.timestamp);
    return timeA - timeB;
  });

  return (
    <div className="fixed bottom-6 right-6 z-[9998]">
      {/* Chatbot Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full shadow-2xl text-white hover:bg-blue-700 border-2 border-white"
        style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}
      >
        <span className="material-icons">
          {isOpen ? 'close' : 'chat'}
        </span>
      </Button>
      
      {/* Chatbot Window */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 h-96 shadow-2xl border-2 border-blue-200 bg-white">
          <CardHeader className="text-white rounded-t-xl" style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <span className="material-icons">support_agent</span>
              <span>{t('healthcareAssistant')}</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="flex flex-col h-full">
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {/* Welcome message */}
                {sortedMessages.length === 0 && (
                  <div className="flex items-start space-x-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}
                    >
                      <span className="material-icons text-sm">smart_toy</span>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 max-w-64">
                      <p className="text-sm text-gray-800">{t('botWelcomeMessage')}</p>
                    </div>
                  </div>
                )}

                {sortedMessages.map((msg) => (
                  <div key={msg.id} className={`flex items-start space-x-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                    {msg.sender === 'bot' && (
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}
                      >
                        <span className="material-icons text-sm">smart_toy</span>
                      </div>
                    )}
                    <div className={`rounded-lg p-3 max-w-64 ${
                      msg.sender === 'user' 
                        ? 'text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                    style={msg.sender === 'user' ? { backgroundColor: 'hsl(207, 90%, 54%)' } : {}}
                    >
                      <p className="text-sm">{msg.message}</p>
                    </div>
                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="material-icons text-sm">person</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t('typeYourMessage')}
                    className="text-sm"
                  />
                  <Button 
                    onClick={sendMessage} 
                    size="sm" 
                    className="text-white hover:bg-blue-700"
                    style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}
                  >
                    <span className="material-icons text-sm">send</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChatbotWidget;
