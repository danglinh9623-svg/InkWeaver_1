import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import CharacterBuilder from './components/CharacterBuilder';
import { ChatSession, Message, DEFAULT_MODEL_CONFIG, ModelConfig, Character } from './types';
import { generateStoryContent, generateSessionTitle } from './services/geminiService';
import { Menu } from 'lucide-react';

const STORAGE_KEY = 'inkweaver_sessions_v1';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCharacterBuilderOpen, setIsCharacterBuilderOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSessions(parsed);
        if (parsed.length > 0) {
          setCurrentSessionId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to load sessions", e);
      }
    }
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: 'New Story Idea',
      messages: [],
      lastUpdated: Date.now(),
      modelConfig: { ...DEFAULT_MODEL_CONFIG }
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(null);
    }
  }, [currentSessionId]);

  const updateSessionConfig = useCallback((newConfig: ModelConfig) => {
    if (!currentSessionId) return;
    setSessions(prev => prev.map(s => 
      s.id === currentSessionId ? { ...s, modelConfig: newConfig } : s
    ));
  }, [currentSessionId]);

  const handleExportSession = useCallback((id: string) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;

    let content = `# ${session.title || 'Untitled Story'}\n\n`;
    content += `Exported from InkWeaver on ${new Date().toLocaleDateString()}\n\n`;
    content += `---\n\n`;

    session.messages.forEach(msg => {
      const role = msg.role === 'user' ? 'USER' : 'INKWEAVER';
      content += `### ${role}:\n${msg.text}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(session.title || 'story').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [sessions]);

  const handleInstallApp = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!currentSessionId) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
      timestamp: Date.now()
    };

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          messages: [...s.messages, userMsg],
          lastUpdated: Date.now()
        };
      }
      return s;
    }));

    setIsGenerating(true);

    try {
      const aiMsgId = crypto.randomUUID();
      const aiMsgPlaceholder: Message = {
        id: aiMsgId,
        role: 'model',
        text: '',
        timestamp: Date.now()
      };

      setSessions(prev => prev.map(s => 
        s.id === currentSessionId 
          ? { ...s, messages: [...s.messages, aiMsgPlaceholder] } 
          : s
      ));

      const activeSession = sessions.find(s => s.id === currentSessionId);
      const historyForApi = activeSession ? [...activeSession.messages, userMsg] : [userMsg];

      const onStream = (text: string) => {
        setSessions(prev => prev.map(s => {
           if (s.id === currentSessionId) {
             const msgs = [...s.messages];
             const lastMsgIndex = msgs.findIndex(m => m.id === aiMsgId);
             if (lastMsgIndex !== -1) {
               msgs[lastMsgIndex] = { ...msgs[lastMsgIndex], text };
             }
             return { ...s, messages: msgs };
           }
           return s;
        }));
      };

      const config = activeSession ? activeSession.modelConfig : DEFAULT_MODEL_CONFIG;
      
      const result = await generateStoryContent(
        historyForApi.slice(0, -1),
        text,
        config,
        onStream
      );

      const currentTitle = activeSession?.title;
      const isDefaultTitle = currentTitle === 'New Story Idea' || currentTitle?.endsWith('...');
      
      if ((isDefaultTitle || historyForApi.length <= 3) && result.text.length > 20) {
        const newAiMsg = { ...aiMsgPlaceholder, text: result.text };
        const updatedHistory = [...historyForApi, newAiMsg];
        
        generateSessionTitle(updatedHistory).then(newTitle => {
          if (newTitle && newTitle !== "Untitled Story") {
            setSessions(prev => prev.map(s => 
              s.id === currentSessionId ? { ...s, title: newTitle } : s
            ));
          }
        });
      }

    } catch (error) {
      console.error("Generation failed", error);
       setSessions(prev => prev.map(s => {
           if (s.id === currentSessionId) {
             const msgs = [...s.messages];
             msgs.pop(); 
             msgs.push({
               id: crypto.randomUUID(),
               role: 'model',
               text: `**System Error:** Failed to generate content. Please check your network or API quota. \n\nDetails: ${error instanceof Error ? error.message : 'Unknown error'}`,
               timestamp: Date.now()
             });
             return { ...s, messages: msgs };
           }
           return s;
        }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!currentSessionId) return;
    const session = sessions.find(s => s.id === currentSessionId);
    if (!session || session.messages.length < 2) return;

    const lastMsg = session.messages[session.messages.length - 1];
    if (lastMsg.role !== 'model') return; 

    const userMsg = session.messages[session.messages.length - 2];
    if (!userMsg || userMsg.role !== 'user') return;

    setSessions(prev => prev.map(s => 
       s.id === currentSessionId 
       ? { ...s, messages: s.messages.slice(0, -1) } 
       : s
    ));

    setIsGenerating(true);
    try {
        const aiMsgId = crypto.randomUUID();
        const aiMsgPlaceholder: Message = { id: aiMsgId, role: 'model', text: '', timestamp: Date.now() };
        
        setSessions(prev => prev.map(s => 
            s.id === currentSessionId 
            ? { ...s, messages: [...s.messages, aiMsgPlaceholder] } 
            : s
        ));

        const historyForApi = session.messages.slice(0, -2);
        
        const onStream = (text: string) => {
            setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                const msgs = [...s.messages];
                const lastMsgIndex = msgs.findIndex(m => m.id === aiMsgId);
                if (lastMsgIndex !== -1) msgs[lastMsgIndex] = { ...msgs[lastMsgIndex], text };
                return { ...s, messages: msgs };
            }
            return s;
            }));
        };

        await generateStoryContent(historyForApi, userMsg.text, session.modelConfig, onStream);

    } catch (error) {
        console.error(error);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleCharacterPrompt = (char: Partial<Character>) => {
    const prompt = `I am developing a character for a story. Please help me flesh them out based on these details:
    
    Name: ${char.name}
    Role: ${char.role}
    Appearance: ${char.appearance}
    Personality: ${char.personality}
    Backstory: ${char.backstory}
    Goals: ${char.goals}
    Relationships: ${char.relationships}
    
    Please provide:
    1. A psychological profile.
    2. Unique quirks or mannerisms.
    3. Potential character arcs or conflicts.
    4. A short sample scene featuring this character.`;
    
    if (!currentSessionId) createNewSession();
    setTimeout(() => handleSendMessage(prompt), 100);
  };

  return (
    <div className="flex h-screen bg-ink-950 text-ink-100 overflow-hidden font-sans">
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-ink-800 rounded-lg text-white shadow-lg md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:relative z-40 h-full transition-transform duration-300 md:translate-x-0`}>
         <Sidebar 
            isOpen={true} 
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={(id) => { setCurrentSessionId(id); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
            onNewSession={createNewSession}
            onDeleteSession={deleteSession}
            onToggleCharacterPanel={() => setIsCharacterBuilderOpen(true)}
            onInstallApp={handleInstallApp}
            onExportSession={handleExportSession}
            showInstallButton={!!deferredPrompt}
         />
         {isSidebarOpen && (
           <div 
             className="fixed inset-0 bg-black/50 z-[-1] md:hidden"
             onClick={() => setIsSidebarOpen(false)}
           />
         )}
      </div>

      <div className="flex-1 flex flex-col relative w-full">
        <ChatInterface 
          session={currentSession}
          onSendMessage={handleSendMessage}
          onRegenerate={handleRegenerate}
          onUpdateConfig={updateSessionConfig}
          isGenerating={isGenerating}
        />
      </div>

      {isCharacterBuilderOpen && (
        <CharacterBuilder 
          onClose={() => setIsCharacterBuilderOpen(false)}
          onGeneratePrompt={handleCharacterPrompt}
        />
      )}
    </div>
  );
};

export default App;
