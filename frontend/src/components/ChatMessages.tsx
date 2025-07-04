import ReactMarkdown from 'react-markdown';
import { Brain, MessageSquare } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  mode?: 'reflection' | 'answer';
}

interface ChatMessagesProps {
  messages: Message[];
  isThinking: boolean;
  mode: 'reflection' | 'answer';
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function ChatMessages({ messages, isThinking, mode, messagesContainerRef, messagesEndRef }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-8" ref={messagesContainerRef}>
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-2xl px-4 sm:px-6 py-3 sm:py-4 max-w-[90%] sm:max-w-[80%] ${
                msg.sender === 'user'
                  ? 'bg-black text-white border border-white-700 font-mono'
                  : msg.mode === 'reflection'
                  ? 'bg-purple-900/50 border border-purple-700 font-mono'
                  : 'bg-blue-900/50 border border-blue-700 font-mono'
              }`}
            >
              {msg.sender === 'bot' && (
                <div className="flex items-center space-x-2 mb-2">
                  {msg.mode === 'reflection' ? (
                    <Brain className="w-4 h-4 text-purple-400" />
                  ) : (
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                  )}
                  <span className="text-xs text-gray-400 uppercase font-medium">
                    {msg.mode}
                  </span>
                </div>
              )}
              <ReactMarkdown
                components={{
                  p: ({node, ...props}) => <p className="prose prose-invert prose-sm sm:prose-base" {...props} />,
                }}
              >
                {msg.text}
              </ReactMarkdown>
              <div className="text-xs text-gray-400 mt-2 text-right">
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className={`max-w-[70%] rounded-2xl px-6 py-4 ${
              mode === 'reflection'
                ? 'bg-purple-900/50 border border-purple-700'
                : 'bg-blue-900/50 border border-blue-700'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {mode === 'reflection' ? (
                  <Brain className="w-4 h-4 text-purple-400" />
                ) : (
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                )}
                <span className="text-xs text-gray-400 uppercase font-medium">
                  {mode}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm text-gray-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}