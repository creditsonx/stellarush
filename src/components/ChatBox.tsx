'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWallet } from '@solana/wallet-adapter-react';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: number;
  type: 'chat' | 'system' | 'bet' | 'cashout';
}

export function ChatBox() {
  const { connected, publicKey } = useWallet();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      user: 'System',
      message: 'Welcome to STELLARUSH! Connect your wallet to start playing.',
      timestamp: 1704067200000,
      type: 'system',
    },
    {
      id: '2',
      user: 'CryptoBro2024',
      message: 'bruh just lost 2 SOL on 1.01x crash... pain 😤',
      timestamp: 1704067260000,
      type: 'chat',
    },
    {
      id: '3',
      user: 'System',
      message: 'DegenTrader cashed out at 3.45x for 2.1 SOL',
      timestamp: 1704067320000,
      type: 'cashout',
    },
    {
      id: '4',
      user: 'SolanaWhale',
      message: 'lfg 50 SOL this round, need that 10x energy 🚀🚀',
      timestamp: 1704067380000,
      type: 'chat',
    },
    {
      id: '5',
      user: 'DegenTrader',
      message: '@CryptoBro2024 rip bro, happens to the best of us',
      timestamp: 1704067440000,
      type: 'chat',
    },
    {
      id: '6',
      user: 'System',
      message: 'SolanaWhale placed a bet of 50 SOL',
      timestamp: 1704067500000,
      type: 'bet',
    },
    {
      id: '7',
      user: 'MoonFarmer',
      message: 'yoo this guy really betting 50 SOL 💀 absolute unit',
      timestamp: 1704067560000,
      type: 'chat',
    },
    {
      id: '8',
      user: 'CryptoBro2024',
      message: 'going conservative 0.5 SOL @ 2x, need to rebuild stack',
      timestamp: 1704067620000,
      type: 'chat',
    },
    {
      id: '9',
      user: 'GigaChad_Sol',
      message: 'ez money when it hits 5x+ 📈 just gotta time it right',
      timestamp: 1704067680000,
      type: 'chat',
    },
    {
      id: '10',
      user: 'PaperHands99',
      message: 'always cash out at 2x, slow and steady wins the race 🐢',
      timestamp: 1704067740000,
      type: 'chat',
    },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  // Auto-chat messages
  const autoMessages = [
    { user: 'DiamondHands_', message: 'holding until 5x minimum 💎 this time fr', type: 'chat' },
    { user: 'SolMaxi', message: 'just yoloed my entire bag lmao 😅', type: 'chat' },
    { user: 'CrashKing420', message: 'crashed at 1.08x three times in a row... rigged? 🤔', type: 'chat' },
    { user: 'NotFinancialAdvice', message: 'guys never bet more than you can afford to lose!!!', type: 'chat' },
    { user: 'DegenLife', message: 'wen 100x? 😂 asking for a friend', type: 'chat' },
    { user: 'SafePlayer', message: 'cashing out at 1.5x every time, boring but profitable', type: 'chat' },
    { user: 'YoloMaster', message: 'LFG 20 SOL let\'s get this bread 🍞', type: 'chat' },
    { user: 'CryptoNoob_', message: 'how does this work? just started playing crash games', type: 'chat' },
    { user: 'RektAgain', message: 'down 50 SOL today but we move 📉➡️📈', type: 'chat' },
    { user: 'SmartMoney', message: '@CryptoNoob_ cash out before it crashes, timing is everything', type: 'chat' },
    { user: 'GrindDaily', message: 'been grinding all week, up 15 SOL 📊', type: 'chat' },
    { user: 'FearAndGreed', message: 'always cash out when my hands start shaking 😰', type: 'chat' },
    { user: 'MoonOrBust', message: 'either 10x or 0, no in between 🌙', type: 'chat' },
    { user: 'TechnicalAnalyst', message: 'chart looking bullish for a high multi 📈', type: 'chat' },
    { user: 'LuckOfTheIrish', message: 'feeling lucky today, gonna send it 🍀', type: 'chat' },
    { user: 'ConservativeGuy', message: 'small bets, consistent profits. this is the way', type: 'chat' },
    { user: 'YoloQueen', message: 'rent money on red... wait wrong game 😂', type: 'chat' },
    { user: 'PatientPlayer', message: 'waiting for the perfect setup... 👀', type: 'chat' },
    { user: 'AdrenalineJunkie', message: 'heart racing every single round, love this game', type: 'chat' },
    { user: 'SolanaVibes', message: 'SOL network so fast, perfect for crash games ⚡', type: 'chat' },
  ];

  // Handle scroll detection to prevent auto-scroll when user scrolls up
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollHeight - clientHeight <= scrollTop + 10;
      setUserScrolledUp(!isAtBottom);
    }
  };

  // FIXED auto-scroll behavior - only scroll if user is at bottom
  useEffect(() => {
    if (!userScrolledUp && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [userScrolledUp]);

  // Auto-chat system
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.4) { // 40% chance every interval
        const randomMessage = autoMessages[Math.floor(Math.random() * autoMessages.length)];
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          user: randomMessage.user,
          message: randomMessage.message,
          timestamp: Date.now(),
          type: randomMessage.type as 'chat' | 'system' | 'bet' | 'cashout',
        };
        setMessages(prev => [...prev.slice(-25), newMessage]); // Keep last 25 messages
      }
    }, 8000 + Math.random() * 12000); // Random 8-20 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !connected || !publicKey) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      user: `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-3)}`,
      message: newMessage.trim(),
      timestamp: Date.now(),
      type: 'chat',
    };

    setMessages(prev => [...prev.slice(-25), message]);
    setNewMessage('');
    setUserScrolledUp(false); // Force scroll to bottom when user sends message
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'system':
        return 'text-blue-400 text-sm italic';
      case 'cashout':
        return 'text-green-400 text-sm';
      case 'bet':
        return 'text-orange-400 text-sm';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-96 flex flex-col">
      <h3 className="text-white text-lg font-bold mb-4">Chat</h3>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-2 mb-4 scroll-smooth"
        onScroll={handleScroll}
      >
        {messages.map((msg) => (
          <div key={msg.id} className="text-sm">
            <div className="flex items-start gap-2">
              <span className="text-gray-500 text-xs min-w-[3rem] flex-shrink-0">
                {formatTime(msg.timestamp)}
              </span>
              <div className="flex-1 break-words">
                {msg.type === 'chat' && (
                  <span className="text-gray-400 font-mono text-xs">
                    {msg.user}:{' '}
                  </span>
                )}
                <span className={getMessageStyle(msg.type)}>
                  {msg.message}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom indicator */}
      {userScrolledUp && (
        <div className="text-center mb-2">
          <button
            onClick={() => {
              setUserScrolledUp(false);
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs text-blue-400 hover:text-blue-300 bg-gray-700 px-2 py-1 rounded"
          >
            ↓ New messages
          </button>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={connected ? "Type a message..." : "Connect wallet to chat"}
          disabled={!connected}
          className="bg-gray-700 border-gray-600 text-white text-sm"
          maxLength={200}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!connected || !newMessage.trim()}
          size="sm"
          className="bg-orange-600 hover:bg-orange-700"
        >
          Send
        </Button>
      </div>
    </div>
  );
}
