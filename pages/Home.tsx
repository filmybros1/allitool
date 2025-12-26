
import React, { useState } from 'react';
import { TOOLS } from '../constants';
import ToolCard from '../components/ToolCard';

const Home: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'organize' | 'convert' | 'optimize' | 'ai'>('all');

  const filteredTools = TOOLS.filter(tool => filter === 'all' || tool.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 lg:px-8">
      <div className="flex flex-col items-center text-center mb-24">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-indigo-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
          </span>
          Next-Gen PDF Workspace
        </div>
        <h1 className="text-6xl md:text-8xl font-[900] text-slate-900 mb-8 tracking-tighter leading-[0.9]">
          The only PDF tool <br/>
          <span className="text-indigo-600">you'll ever need.</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium">
          AlliTool streamlines your document workflow with a professional suite of tools and 
          unprecedented AI intelligence. Simple, secure, and fast.
        </p>

        <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
          {['all', 'organize', 'convert', 'optimize', 'ai'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
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

      <div className="mt-40 p-12 bg-slate-900 rounded-[3rem] text-center text-white overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Ready to transform your workflow?</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">Join 50,000+ professionals who trust AlliTool for their daily document tasks.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-colors shadow-xl">Get Started Now</button>
            <button className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-700 transition-colors">Contact Sales</button>
          </div>
        </div>
        {/* Abstract background shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-[120px] opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-500 rounded-full blur-[120px] opacity-10 translate-x-1/2 translate-y-1/2"></div>
      </div>
    </div>
  );
};

export default Home;
