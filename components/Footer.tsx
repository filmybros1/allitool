
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const scrollToTools = (e: React.MouseEvent) => {
    e.preventDefault();
    const toolsSection = document.getElementById('tools-section');
    if (toolsSection) {
      toolsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#tools-section';
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 py-16 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-6 text-white">
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold">A</div>
              <span className="text-xl font-extrabold tracking-tight">AlliTool</span>
            </div>
            <p className="text-sm leading-relaxed">
              Your professional partner for all document needs. Secure, fast, and intelligent processing right in your browser.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-12">
            <div>
              <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Explore</h4>
              <ul className="space-y-4 text-sm font-bold">
                <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link></li>
                <li><Link to="/about" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
                <li><button onClick={scrollToTools} className="hover:text-indigo-400 transition-colors text-left">All Tools</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Support</h4>
              <ul className="space-y-4 text-sm font-bold">
                <li><Link to="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Mission</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em]">
          <p>© 2024 AlliTool. Built for the modern web.</p>
          <div className="flex gap-6">
            <span>Security First</span>
            <span className="text-indigo-500">Privacy Guaranteed</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
