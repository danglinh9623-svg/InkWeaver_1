import React from 'react';
import { ModelConfig, ModelId } from '../types';
import { BrainCircuit, Zap, Feather, RefreshCw, Search } from 'lucide-react';

interface ModelSettingsProps {
  config: ModelConfig;
  onUpdateConfig: (newConfig: ModelConfig) => void;
}

const ModelSettings: React.FC<ModelSettingsProps> = ({ config, onUpdateConfig }) => {
  const handleChange = (key: keyof ModelConfig, value: any) => {
    onUpdateConfig({ ...config, [key]: value });
  };

  return (
    <div className="bg-ink-900 border border-ink-700 rounded-lg p-3 mb-4 text-xs text-ink-200 shadow-xl">
      <div className="flex flex-col gap-3">
        
        <div className="flex flex-col gap-1">
          <label className="text-ink-400 font-semibold uppercase tracking-wider text-[10px]">Story Engine</label>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => handleChange('modelId', ModelId.PRO)}
              className={`flex items-center justify-center gap-1 p-2 rounded border ${
                config.modelId === ModelId.PRO 
                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                  : 'bg-ink-800 border-ink-700 text-ink-400 hover:bg-ink-700'
              }`}
            >
              <BrainCircuit className="w-3 h-3" />
              Storyteller Pro
            </button>
            <button
               onClick={() => handleChange('modelId', ModelId.FLASH)}
               className={`flex items-center justify-center gap-1 p-2 rounded border ${
                config.modelId === ModelId.FLASH 
                  ? 'bg-amber-600 border-amber-500 text-white' 
                  : 'bg-ink-800 border-ink-700 text-ink-400 hover:bg-ink-700'
              }`}
            >
              <Zap className="w-3 h-3" />
              Flash
            </button>
            <button
               onClick={() => handleChange('modelId', ModelId.LITE)}
               className={`flex items-center justify-center gap-1 p-2 rounded border ${
                config.modelId === ModelId.LITE 
                  ? 'bg-emerald-600 border-emerald-500 text-white' 
                  : 'bg-ink-800 border-ink-700 text-ink-400 hover:bg-ink-700'
              }`}
            >
              <Feather className="w-3 h-3" />
              Lite
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleChange('autoSwitch', !config.autoSwitch)}
              className={`flex items-center justify-between p-2 rounded border transition-colors ${
                config.autoSwitch
                  ? 'bg-ink-800 border-indigo-500/50 text-indigo-300'
                  : 'bg-ink-950 border-ink-800 text-ink-500'
              }`}
            >
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3 h-3" /> Auto-Switch
              </span>
              <div className={`w-2 h-2 rounded-full ${config.autoSwitch ? 'bg-indigo-400' : 'bg-ink-700'}`} />
            </button>

            <button
              onClick={() => handleChange('deepThinking', !config.deepThinking)}
              disabled={config.modelId === ModelId.LITE}
              className={`flex items-center justify-between p-2 rounded border transition-colors ${
                config.deepThinking
                  ? 'bg-ink-800 border-purple-500/50 text-purple-300'
                  : 'bg-ink-950 border-ink-800 text-ink-500'
              } ${config.modelId === ModelId.LITE ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="flex items-center gap-2">
                <BrainCircuit className="w-3 h-3" /> Deep Thinking
              </span>
              <div className={`w-2 h-2 rounded-full ${config.deepThinking ? 'bg-purple-400' : 'bg-ink-700'}`} />
            </button>

            <button
              onClick={() => handleChange('enableSearch', !config.enableSearch)}
              disabled={config.modelId === ModelId.LITE}
              className={`col-span-2 flex items-center justify-between p-2 rounded border transition-colors ${
                config.enableSearch
                  ? 'bg-ink-800 border-blue-500/50 text-blue-300'
                  : 'bg-ink-950 border-ink-800 text-ink-500'
              } ${config.modelId === ModelId.LITE ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="flex items-center gap-2">
                <Search className="w-3 h-3" /> Research Mode (Wattpad/Ao3 Search)
              </span>
              <div className={`w-2 h-2 rounded-full ${config.enableSearch ? 'bg-blue-400' : 'bg-ink-700'}`} />
            </button>
        </div>
        
        {config.deepThinking && config.modelId !== ModelId.LITE && (
           <div className="flex items-center gap-2 mt-1">
             <span className="text-ink-400">Budget:</span>
             <input 
               type="range" 
               min="1024" 
               max="32768" 
               step="1024" 
               value={config.thinkingBudget} 
               onChange={(e) => handleChange('thinkingBudget', parseInt(e.target.value))}
               className="flex-1 h-1 bg-ink-700 rounded-lg appearance-none cursor-pointer"
             />
             <span className="text-ink-300 w-12 text-right">{config.thinkingBudget}</span>
           </div>
        )}

      </div>
    </div>
  );
};

export default ModelSettings;
