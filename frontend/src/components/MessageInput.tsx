import { Send, Brain, MessageSquare } from 'lucide-react';

interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  handleSend: () => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isThinking: boolean;
  mode: 'reflection' | 'answer';
  setMode: (mode: 'reflection' | 'answer') => void;
  handleGiveAnswer: () => void;
  giveAnswerRequested: boolean;
  messages: any[];
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export default function MessageInput({ message, setMessage, handleSend, handleKeyPress, isThinking, mode, setMode, handleGiveAnswer, giveAnswerRequested, messages, textareaRef }: MessageInputProps) {
  return (
    <div className="sticky bottom-0 border-t border-gray-800 p-2 sm:p-3 bg-black">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-gray-900 rounded-2xl border border-gray-700 focus-within:border-gray-600 transition-colors">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question..."
            className="w-full bg-transparent text-white placeholder-gray-400 px-4 py-3 pr-16 resize-none border-none outline-none text-base min-h-[40px] max-h-40"
            rows={1}
            disabled={isThinking}
            style={{
              resize: 'none',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || isThinking}
            className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
              message.trim() && !isThinking
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-between mt-2 gap-2">
          <div className="flex flex-wrap justify-center items-center gap-2">
            <button
              onClick={() => setMode('reflection')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === 'reflection'
                  ? 'bg-purple-900/50 text-purple-200 border border-purple-700'
                  : 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>Reflection</span>
            </button>

            <button
              onClick={() => setMode('answer')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === 'answer'
                  ? 'bg-blue-900/50 text-blue-200 border border-blue-700'
                  : 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Answer</span>
            </button>

            {mode === 'reflection' && messages.length > 0 && !isThinking && (
              <button
                onClick={handleGiveAnswer}
                disabled={isThinking || giveAnswerRequested}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isThinking || giveAnswerRequested
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-teal-900/50 text-teal-200 border border-teal-700 hover:bg-teal-800/50'
                }`}
              >
                <span>Give me the answer</span>
              </button>
            )}
          </div>

          <div className="hidden sm:block mt-2 text-center sm:text-right">
            <p className="text-gray-500 text-xs">
              {mode === 'reflection'
                ? 'Reflection mode: Guiding questions to help you think.'
                : 'Answer mode: Direct answers with explanations.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
