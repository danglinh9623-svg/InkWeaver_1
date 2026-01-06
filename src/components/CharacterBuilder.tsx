import React, { useState } from 'react';
import { Character } from '../types';
import { User, Sparkles, X } from 'lucide-react';

interface CharacterBuilderProps {
  onClose: () => void;
  onGeneratePrompt: (character: Partial<Character>) => void;
}

const CharacterBuilder: React.FC<CharacterBuilderProps> = ({ onClose, onGeneratePrompt }) => {
  const [char, setChar] = useState<Partial<Character>>({
    name: '',
    role: 'Protagonist',
    appearance: '',
    personality: '',
    backstory: '',
    goals: '',
    relationships: ''
  });

  const handleChange = (key: keyof Character, value: string) => {
    setChar(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = () => {
    onGeneratePrompt(char);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-ink-900 border border-ink-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        <div className="p-6 border-b border-ink-800 flex justify-between items-center sticky top-0 bg-ink-900 z-10">
          <div>
            <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
              <User className="text-indigo-400" /> Character Forge
            </h2>
            <p className="text-ink-400 text-sm mt-1">Define your character deeply. InkWeaver will help bring them to life.</p>
          </div>
          <button onClick={onClose} className="text-ink-400 hover:text-white transition-colors">
            <X />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-300">Name</label>
              <input
                type="text"
                value={char.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-ink-950 border border-ink-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="E.g. Elara Vance"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-300">Role/Archetype</label>
              <select
                value={char.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full bg-ink-950 border border-ink-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option>Protagonist</option>
                <option>Antagonist</option>
                <option>Love Interest</option>
                <option>Mentor</option>
                <option>Sidekick</option>
                <option>Rival</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-300">Appearance</label>
            <textarea
              value={char.appearance}
              onChange={(e) => handleChange('appearance', e.target.value)}
              className="w-full bg-ink-950 border border-ink-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
              placeholder="Physical traits, style, distinctive marks..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-300">Personality & Traits</label>
            <textarea
              value={char.personality}
              onChange={(e) => handleChange('personality', e.target.value)}
              className="w-full bg-ink-950 border border-ink-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
              placeholder="Strengths, weaknesses, fears, habits..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-300">Backstory</label>
            <textarea
              value={char.backstory}
              onChange={(e) => handleChange('backstory', e.target.value)}
              className="w-full bg-ink-950 border border-ink-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
              placeholder="Key events that shaped them..."
            />
          </div>
          
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-300">Goals/Motivations</label>
              <input
                type="text"
                value={char.goals}
                onChange={(e) => handleChange('goals', e.target.value)}
                className="w-full bg-ink-950 border border-ink-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="What do they want most?"
              />
            </div>
             <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-300">Key Relationships</label>
              <input
                type="text"
                value={char.relationships}
                onChange={(e) => handleChange('relationships', e.target.value)}
                className="w-full bg-ink-950 border border-ink-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Family, friends, enemies..."
              />
            </div>
           </div>

        </div>

        <div className="p-6 border-t border-ink-800 bg-ink-900 sticky bottom-0 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-ink-300 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Weave Character
          </button>
        </div>

      </div>
    </div>
  );
};

export default CharacterBuilder;
