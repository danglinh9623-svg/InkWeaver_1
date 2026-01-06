import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatSession, ModelConfig } from '../types';
import { Send, RefreshCw, Loader2, Sparkles, Book, Copy, Check } from 'lucide-react';
import ModelSettings from './ModelSettings';

interface ChatInterfaceProps {
  session: ChatSession | null;
  onSendMessage: (text: string) => Promise<void>;
  onRegenerate: () => Promise<void>;
  onUpdateConfig: (config: ModelConfig) => void;
  isGenerating: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  session, 
  onSendMessage, 
  onRegenerate, 
  onUpdateConfig,
  isGenerating 
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;
    const text = input;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (text: string, msgId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-ink-950">
        <div className="w-24 h-24 bg-ink-900 rounded-full flex items-center justify-center mb-6 ring-4 ring-ink-800 shadow-xl">
          <Book className="w-10 h-10 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-white mb-2">Welcome to InkWeaver</h1>
        <p className="text-ink-300 max-w-md">
          Start a new story to begin weaving your narrative. Create deep characters, brainstorm plots, or just write.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-ink-950 relative">
      
      <div className="h-16 border-b border-ink-800 flex items-center justify-between px-6 bg-ink-950/80 backdrop-blur-md z-10 sticky top-0">
         <h2 className="font-serif font-semibold text-white truncate max-w-md">
           {session.title || "Untitled Story"}
         </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {session.messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-ink-500 gap-4">
             <Sparkles className="w-8 h-8 opacity-50" />
             <p>The page is blank. What happens next?</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs w-full max-w-lg">
                <button onClick={() => onSendMessage("Create a dark fantasy plot outline about a fallen paladin.")} className="p-3 border border-ink-800 hover:bg-ink-800 rounded text-left transition-colors">
                  Create a dark fantasy plot...
                </button>
                <button onClick={() => onSendMessage("Analyze the pacing of a slow-burn romance.")} className="p-3 border border-ink-800 hover:bg-ink-800 rounded text-left transition-colors">
                  Analyze slow-burn romance pacing...
                </button>
             </div>
          </div>
        )}

        {session.messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`relative group max-w-[90%] lg:max-w-[75%] rounded-2xl p-6 shadow-md ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-ink-900 text-ink-100 rounded-tl-sm border border-ink-800'
              }`}
            >
              {msg.isThinking && (
                 <div className="flex items-center gap-2 text-xs text-purple-300 mb-3 bg-purple-900/20 p-2 rounded border border-purple-500/20 animate-pulse">
                    <span>Thinking intensely...</span>
                 </div>
              )}
              
              <div className={`prose prose-invert prose-p:leading-relaxed max-w-none ${msg.role === 'model' ? 'font-serif' : 'font-sans'}`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>

              <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-transparent group-hover:border-ink-800/50 transition-colors">
                <button
                  onClick={() => copyToClipboard(msg.text, msg.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-ink-400 hover:text-white"
                  title="Copy text"
                >
                  {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>

                {msg.role === 'model' && idx === session.messages.length - 1 && !isGenerating && (
                  <button
                    onClick={onRegenerate}
                    className="flex items-center gap-1 text-xs text-ink-400 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isGenerating && (
           <div className="flex justify-start w-full">
             <div className="bg-ink-900 border border-ink-800 p-4 rounded-2xl rounded-tl-sm flex items-center gap-3">
               <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
               <span className="text-sm text-ink-300 font-serif italic">The InkWeaver is writing...</span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-ink-950 border-t border-ink-800">
        <div className="max-w-4xl mx-auto flex flex-col gap-2">
            
            <div className="flex justify-end">
               <ModelSettings config={session.modelConfig} onUpdateConfig={onUpdateConfig} />
            </div>

            <div className="relative flex items-end gap-2 bg-ink-900 rounded-xl border border-ink-700 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all p-2 shadow-lg">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Describe your scene, ask for ideas, or paste a draft..."
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-ink-500 resize-none max-h-[200px] min-h-[24px] py-2 px-2"
                rows={1}
                disabled={isGenerating}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className={`p-2 rounded-lg mb-1 transition-all ${
                  input.trim() && !isGenerating
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'
                    : 'bg-ink-800 text-ink-600 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center text-[10px] text-ink-600">
               InkWeaver may generate creative fiction.
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
