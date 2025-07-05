import { Plus, Menu } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  clearChat: () => void;
}

export default function Header({ clearChat }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-800">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold tracking-wide text-center bg-gradient-to-b from-white to-black text-transparent bg-clip-text">#ProjectThinkk</h1>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={clearChat}
          className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors"
          title="New Chat"
        >
          <Plus className="w-4 h-4" />
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10">
              <button
                onClick={() => { clearChat(); setIsMenuOpen(false); }}
                className="block sm:hidden w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800"
              >
                New Chat
              </button>
              <a 
                href="https://github.com/Vivesh-G/ProjectThinkk"
                target="_blank" 
                rel="noopener noreferrer"
                className="block px-4 py-2 text-sm text-white hover:bg-gray-800"
              >
                GitHub
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
