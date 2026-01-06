import React, { useMemo } from 'react';
import { ChatSession, ModelConfig, DEFAULT_MODEL_CONFIG } from '../types';
import { Plus, MessageSquare, Users, Trash2, BookOpen, Download, Smartphone } from 'lucide-react';
import ModelSettings from './ModelSettings';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  currentModelConfig?: ModelConfig;
  onUpdateModelConfig: (config: ModelConfig) => void;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onToggleCharacterPanel: () => void;
  onInstallApp?: () => void;
  onExportSession?: (id: string) => void;
  showInstallButton: boolean;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  currentModelConfig,
  onUpdateModelConfig,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onToggleCharacterPanel,
  onInstallApp,
  onExportSession,
  showInstallButton,
  isOpen
}) => {
  
  // Group sessions by date category
  const groupedSessions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const groups = {
      'Today': [] as ChatSession[],
      'Yesterday': [] as ChatSession[],
      'Previous 7 Days': [] as ChatSession[],
      'Older Stories': [] as ChatSession[],
    };

    sessions.forEach(session => {
      const date = new Date(session.lastUpdated);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);

      if (checkDate.getTime() === today.getTime()) {
        groups['Today'].push(session);
      } else if (checkDate.getTime() === yesterday.getTime()) {
        groups['Yesterday'].push(session);
      } else if (date > weekAgo) {
        groups['Previous 7 Days'].push(session);
      } else {
        groups['Older Stories'].push(session);
      }
    });

    return groups;
  }, [sessions]);

  if (!isOpen) return null;

  const renderSessionItem = (session: ChatSession) => (
    <div
      key={session.id}
      className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors relative ${
        session.id === currentSessionId
          ? 'bg-ink-800 text-white shadow-md'
          : 'text-ink-300 hover:bg-ink-800/50 hover:text-ink-100'
      }`}
      onClick={() => onSelectSession(session.id)}
    >
      <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
      <div className="flex-1 truncate text-sm font-medium pr-8">
        {session.title || "Untitled Story"}
      </div>
      
      <div className="absolute right-2 flex items-center gap-1">
        {onExportSession && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExportSession(session.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-ink-500 hover:text-indigo-400 transition-all"
            title="Export Story"
          >
            <Download className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteSession(session.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-ink-500 hover:text-red-400 transition-all"
          title="Delete Story"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  const groupKeys: (keyof typeof groupedSessions)[] = ['Today', 'Yesterday', 'Previous 7 Days', 'Older Stories'];

  return (
    <div className="w-72 bg-ink-950 border-r border-ink-800 flex flex-col h-full shrink-0 transition-all duration-300 shadow-2xl z-50">
      {/* Header */}
      <div className="p-4 border-b border-ink-800 bg-ink-950/50">
        <h1 className="text-xl font-serif font-bold text-white flex items-center gap-2 mb-4">
          <BookOpen className="w-6 h-6 text-indigo-400" />
          InkWeaver
        </h1>
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors font-medium text-sm shadow-lg shadow-indigo-900/20"
        >
          <Plus className="w-4 h-4" />
          New Story
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 min-h-0">
        {sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-ink-500 space-y-2">
            <BookOpen className="w-8 h-8 opacity-20" />
            <div className="text-xs italic">No stories yet. Start weaving!</div>
          </div>
        )}

        {groupKeys.map(key => {
          const group = groupedSessions[key];
          if (group.length === 0) return null;
          
          return (
             <div key={key}>
                <div className="px-2 mb-1 text-[10px] font-bold text-ink-500 uppercase tracking-widest flex items-center gap-1">
                  {key}
                </div>
                <div className="space-y-0.5">
                  {group.map(renderSessionItem)}
                </div>
             </div>
          );
        })}
      </div>

      {/* Settings & Tools Footer */}
      <div className="p-3 border-t border-ink-800 bg-ink-900/30 space-y-3">
        
        {/* Model Settings Embedded */}
        <div className="space-y-1">
           <ModelSettings 
              config={currentModelConfig || DEFAULT_MODEL_CONFIG} 
              onUpdateConfig={onUpdateModelConfig} 
              disabled={!currentSessionId}
           />
        </div>

        <div className="flex flex-col gap-1 pt-1">
          {showInstallButton && onInstallApp && (
            <button
              onClick={onInstallApp}
              className="w-full flex items-center gap-2 text-emerald-400 hover:text-white hover:bg-emerald-900/30 p-2 rounded-lg transition-colors text-xs font-medium border border-emerald-900/50"
            >
              <Smartphone className="w-3.5 h-3.5" />
              Install App
            </button>
          )}
          <button
            onClick={onToggleCharacterPanel}
            className="w-full flex items-center gap-2 text-ink-300 hover:text-white hover:bg-ink-800 p-2 rounded-lg transition-colors text-xs font-medium border border-transparent hover:border-ink-700"
          >
            <Users className="w-3.5 h-3.5" />
            Character Workshop
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
