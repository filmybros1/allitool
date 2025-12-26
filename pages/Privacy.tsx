
import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-emerald-100">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Privacy First Architecture
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">Our Privacy Mission</h1>
        <p className="text-xl text-slate-500 font-medium">Your documents are your business. We keep it that way.</p>
      </div>

      <div className="space-y-8">
        <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-indigo-600 rounded-full"></span>
            Browser-Side Processing
          </h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Unlike traditional PDF tools that upload your files to a remote server for processing, AlliTool performs most operations—like merging, splitting, and rotating—directly within your web browser. 
          </p>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="text-sm font-bold text-slate-700 italic">
              "This means your sensitive data never leaves your device unless you choose to use our cloud-powered AI features."
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/30">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-4">AI Security</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              When using Gemini AI for summaries or chats, your data is sent via encrypted channels to Google's professional-grade API. We do not use your documents to train models.
            </p>
          </section>

          <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/30">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-4">Zero Storage</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              We have a strict "no-storage" policy. Once you close your browser tab or navigate away, the working memory of your files is cleared. We do not maintain any permanent archives of user content.
            </p>
          </section>
        </div>

        <section className="bg-slate-900 p-12 rounded-[3rem] text-white">
          <h2 className="text-3xl font-black mb-6">Transparency Matters</h2>
          <p className="text-slate-400 font-medium leading-relaxed mb-8">
            Our goal is to build the most trusted document workspace on the web. If you have questions about how we handle data or want to learn more about our technical architecture, we're always here to chat.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-300">Contact us at: </span>
            <a href="mailto:support@allitool.com" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
              support@allitool.com
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
