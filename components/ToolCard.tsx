
import React from 'react';
import { Link } from 'react-router-dom';
import { ToolMetadata, ToolType } from '../types';

interface Props {
  tool: ToolMetadata;
}

const ToolCard: React.FC<Props> = ({ tool }) => {
  const isLarge = tool.id === ToolType.MERGE || tool.id === ToolType.AI_SUMMARY;
  
  return (
    <Link 
      to={`/tool/${tool.id}`}
      className={`group relative bg-white p-8 rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 tool-card-hover overflow-hidden flex flex-col h-full ${isLarge ? (tool.id === ToolType.MERGE ? 'span-2-col' : 'span-2-row') : ''}`}
    >
      <div className={`w-16 h-16 ${tool.color} rounded-3xl flex items-center justify-center text-white mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl`}>
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tool.icon} />
        </svg>
      </div>
      
      <div className="flex-grow">
        <h3 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight group-hover:text-indigo-600 transition-colors">
          {tool.title}
        </h3>
        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 max-w-[240px]">
          {tool.description}
        </p>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs uppercase tracking-widest font-black text-slate-300 group-hover:text-indigo-200 transition-colors">
          {tool.category}
        </span>
        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>

      {/* Decorative background accent */}
      <div className={`absolute -bottom-10 -right-10 w-40 h-40 ${tool.color} opacity-[0.03] rounded-full blur-3xl group-hover:opacity-10 transition-opacity`}></div>
    </Link>
  );
};

export default ToolCard;
