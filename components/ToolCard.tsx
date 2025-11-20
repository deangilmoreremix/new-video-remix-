import React from 'react';
import { ToolConfig } from '../types';
import * as Icons from 'lucide-react';

interface ToolCardProps {
  tool: ToolConfig;
  isLocked: boolean;
  onClick: (tool: ToolConfig) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, isLocked, onClick }) => {
  // Dynamically get icon
  // @ts-ignore
  const IconComponent = Icons[tool.icon] || Icons.Sparkles;

  return (
    <div
      onClick={() => onClick(tool)}
      className="group relative overflow-hidden rounded-xl p-6 transition-all duration-300 cursor-pointer flex flex-col h-full border bg-gray-850 border-gray-800 hover:border-brand-500/50 hover:bg-gray-800"
    >
      <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
         <Icons.ArrowUpRight className="w-5 h-5 text-brand-500" />
      </div>

      <div className="mb-4 p-3 rounded-lg w-fit transition-transform group-hover:scale-110 bg-gray-900 text-brand-500">
        <IconComponent className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold mb-2 text-white">{tool.title}</h3>
      <p className="text-gray-400 text-sm flex-grow mb-4 line-clamp-3">{tool.description}</p>

      <div className="mt-auto pt-4 border-t border-gray-800">
        <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">{tool.category}</span>
      </div>
    </div>
  );
};