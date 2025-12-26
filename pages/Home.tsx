
import React, { useState } from 'react';
import { TOOLS } from '../constants';
import ToolCard from '../components/ToolCard';

const Home: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'organize' | 'convert' | 'optimize' | 'ai'>('all');

  const filteredTools = TOOLS.filter(tool => filter === 'all' || tool.category === filter);

  const scrollToTools = () => {
    document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-24 md:py-32 lg:px-8">
      <div className="flex flex-col items-center text-center mb-16 md:mb-24">
        <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 md:mb-8 border border-indigo-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
          </span>
          Next-Gen Document Workspace
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-[900] text-slate-900 mb-6 md:mb-8 tracking-tighter leading-[1] md:leading-[0.9]">
          The only toolset <br className="hidden sm:block"/>
          <span className="text-indigo-600">you'll ever need.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 md:12 font-medium px-4">
          AlliTool streamlines your document workflow with a professional suite of PDF and image tools 
          powered by industry-leading AI intelligence.
        </p>

        <div id="tools-section" className="flex flex-wrap justify-center gap-1.5 md:gap-2 p-1.5 bg-slate-100 rounded-2xl scroll-mt-28 w-full max-w-lg mx-auto">
          {['all', 'organize', 'convert', 'optimize', 'ai'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={`flex-grow sm:flex-initial px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                filter === cat 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bento-grid">
        {filteredTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      <div className="mt-24 md:40 p-8 md:p-12 bg-slate-900 rounded-[2rem] md:rounded-[3rem] text-center text-white overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 md:mb-6 tracking-tight">Ready to transform your workflow?</h2>
          <p className="text-slate-400 text-base md:text-lg mb-8 md:10 max-w-xl mx-auto">Experience the professional workspace built for speed and privacy.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={scrollToTools}
              className="w-full sm:w-auto bg-white text-slate-900 px-10 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-xl active:scale-95"
            >
              Explore All Tools
            </button>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-[120px] opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-500 rounded-full blur-[120px] opacity-10 translate-x-1/2 translate-y-1/2"></div>
      </div>
    </div>
  );
};

export default Home;
