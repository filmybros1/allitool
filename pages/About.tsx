
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">The AlliTool Mission</h1>
        <p className="text-xl text-slate-500 font-medium">Reimagining document management for the modern era.</p>
      </div>

      <div className="space-y-12">
        <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Why AlliTool?</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            In a world overflowing with digital documents, handling PDFs shouldn't be a chore. 
            AlliTool was built to provide a high-performance, aesthetically pleasing, and 
            privacy-focused workspace where professionals can manage their documents 
            with confidence and speed.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-2xl">
              <h3 className="font-bold text-indigo-600 mb-2">Privacy First</h3>
              <p className="text-sm text-slate-500 text-balance">We leverage browser-side processing and secure AI protocols to ensure your data stays where it belongs: with you.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl">
              <h3 className="font-bold text-rose-500 mb-2">AI Intelligence</h3>
              <p className="text-sm text-slate-500 text-balance">Our integration with Gemini AI allows for unprecedented document understanding, from summaries to interactive chats.</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <h4 className="font-black text-slate-900 mb-2">Speed</h4>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Instant Operations</p>
          </div>
          <div>
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            </div>
            <h4 className="font-black text-slate-900 mb-2">Security</h4>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Encrypted Streams</p>
          </div>
          <div>
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
            </div>
            <h4 className="font-black text-slate-900 mb-2">Control</h4>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Precise Tooling</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
