import React from 'react';
import { ModelConfig, ModelId } from '../types';
import { BrainCircuit, Zap, Feather, RefreshCw, Search } from 'lucide-react';

interface ModelSettingsProps {
  config: ModelConfig;
  onUpdateConfig: (newConfig: ModelConfig) => void;
  disabled?: boolean;
}

const ModelSettings: React.FC<ModelSettingsProps> = ({ config, onUpdateConfig, disabled = false }) => {
  const handleChange = (key: keyof ModelConfig, value: any) => {
    if (disabled) return;
    onUpdateConfig({ ...config, [key]: value });
  };

  return (
    <div className={`flex flex-col gap-3 p-3 bg-ink-900/50 rounded-lg border border-ink-800 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      
      {/* Model Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-ink-500 font-bold uppercase tracking-wider text-[10px]">Story Engine</label>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => handleChange('modelId', ModelId.PRO)}
            className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-all ${
              config.modelId === ModelId.PRO 
                ? 'bg-indigo-600/90 text-white shadow-sm' 
                : 'text-ink-400 hover:bg-ink-800 hover:text-ink-200'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            Storyteller Pro
          </button>
          <button
             onClick={() => handleChange('modelId', ModelId.FLASH)}
             className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-all ${
              config.modelId === ModelId.FLASH 
                ? 'bg-amber-600/90 text-white shadow-sm' 
                : 'text-ink-400 hover:bg-ink-800 hover:text-ink-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Flash
          </button>
          <button
             onClick={() => handleChange('modelId', ModelId.LITE)}
             className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-all ${
              config.modelId === ModelId.LITE 
                ? 'bg-emerald-600/90 text-white shadow-sm' 
                : 'text-ink-400 hover:bg-ink-800 hover:text-ink-200'
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            Lite
          </button>
        </div>
      </div>

      <div className="h-px bg-ink-800/50" />

      {/* Toggles */}
      <div className="flex flex-col gap-1">
          <label className="text-ink-500 font-bold uppercase tracking-wider text-[10px] mb-1">Capabilities</label>
          
          <button
            onClick={() => handleChange('autoSwitch', !config.autoSwitch)}
            className={`flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${
              config.autoSwitch
                ? 'text-indigo-300'
                : 'text-ink-500 hover:text-ink-400'
            }`}
          >
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3 h-3" /> Auto-Switch
            </span>
            <div className={`w-1.5 h-1.5 rounded-full ${config.autoSwitch ? 'bg-indigo-400 shadow-[0_0_5px_rgba(129,140,248,0.5)]' : 'bg-ink-800'}`} />
          </button>

          <button
            onClick={() => handleChange('deepThinking', !config.deepThinking)}
            disabled={config.modelId === ModelId.LITE}
            className={`flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${
              config.deepThinking
                ? 'text-purple-300'
                : 'text-ink-500 hover:text-ink-400'
            } ${config.modelId === ModelId.LITE ? 'opacity-50' : ''}`}
          >
            <span className="flex items-center gap-2">
              <BrainCircuit className="w-3 h-3" /> Deep Thinking
            </span>
            <div className={`w-1.5 h-1.5 rounded-full ${config.deepThinking ? 'bg-purple-400 shadow-[0_0_5px_rgba(192,132,252,0.5)]' : 'bg-ink-800'}`} />
          </button>

          <button
            onClick={() => handleChange('enableSearch', !config.enableSearch)}
            disabled={config.modelId === ModelId.LITE}
            className={`flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${
              config.enableSearch
                ? 'text-blue-300'
                : 'text-ink-500 hover:text-ink-400'
            } ${config.modelId === ModelId.LITE ? 'opacity-50' : ''}`}
          >
            <span className="flex items-center gap-2">
              <Search className="w-3 h-3" /> Research Mode
            </span>
            <div className={`w-1.5 h-1.5 rounded-full ${config.enableSearch ? 'bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.5)]' : 'bg-ink-800'}`} />
          </button>
      </div>
      
      {config.deepThinking && config.modelId !== ModelId.LITE && (
         <div className="flex flex-col gap-1 px-2 pt-1">
           <div className="flex justify-between text-[10px] text-ink-400">
             <span>Thinking Budget</span>
             <span>{config.thinkingBudget}</span>
           </div>
           <input 
             type="range" 
             min="1024" 
             max="32768" 
             step="1024" 
             value={config.thinkingBudget} 
             onChange={(e) => handleChange('thinkingBudget', parseInt(e.target.value))}
             className="w-full h-1 bg-ink-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
           />
         </div>
      )}

    </div>
  );
};

export default ModelSettings;
