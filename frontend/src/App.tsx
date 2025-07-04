import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen';
import ChatMessages from './components/ChatMessages';
import MessageInput from './components/MessageInput';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  mode?: 'reflection' | 'answer';
}

export default function App() {
  const [mode, setMode] = useState<'reflection' | 'answer'>('reflection');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId, setSessionId] = useState<string>(crypto.randomUUID());
  const [giveAnswerRequested, setGiveAnswerRequested] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const currentMessage = message.trim();
    if (!currentMessage && !giveAnswerRequested) return;

    if (currentMessage) {
      const newUserMessage: Message = {
        id: Date.now(),
        text: currentMessage,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, newUserMessage]);
      setMessage('');
    }

    setIsThinking(true);

    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"}/chat`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: currentMessage,
          mode,
          give_answer_requested: giveAnswerRequested,
        }),
      });

      if (giveAnswerRequested) {
        setGiveAnswerRequested(false);
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage: Message = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'bot',
        mode: data.mode.toLowerCase(),
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: `Error: Could not connect to the backend. Please check the console for details. (${error})`,
        sender: 'bot',
        mode: 'answer',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = async () => {
    setIsThinking(true);
    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/clear_chat`;
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      setMessages([]);
      setSessionId(crypto.randomUUID());
      setGiveAnswerRequested(false);
    } catch (error) {
      console.error('Error clearing chat:', error);
    } finally {
      setIsThinking(false);
    }
  };

  const handleGiveAnswer = () => {
    setGiveAnswerRequested(true);
    handleSend();
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col overflow-hidden max-w-full">
      <Header clearChat={clearChat} />
      <main className="flex-1 flex flex-col">
        {messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <ChatMessages
            messages={messages}
            isThinking={isThinking}
            mode={mode}
            messagesContainerRef={messagesContainerRef}
            messagesEndRef={messagesEndRef}
          />
        )}
        <MessageInput
          message={message}
          setMessage={setMessage}
          handleSend={handleSend}
          handleKeyPress={handleKeyPress}
          isThinking={isThinking}
          mode={mode}
          setMode={setMode}
          handleGiveAnswer={handleGiveAnswer}
          giveAnswerRequested={giveAnswerRequested}
          messages={messages}
          textareaRef={textareaRef}
        />
      </main>
    </div>
  );
}
