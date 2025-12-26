
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY < 10 || isMobileMenuOpen) {
          setIsVisible(true);
        } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
          setIsMobileMenuOpen(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY, isMobileMenuOpen]);

  const handleStartProcessing = () => {
    setIsMobileMenuOpen(false);
    if (location.pathname === '/') {
      const toolsSection = document.getElementById('tools-section');
      if (toolsSection) {
        toolsSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Privacy', path: '/privacy' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] py-6 px-4 md:px-8 lg:px-12 pointer-events-none transition-all duration-500 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
      <div className="max-w-[1400px] mx-auto pointer-events-auto">
        <div className="relative glass-modern rounded-[2.5rem] px-8 py-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-white/40 flex items-center justify-between transition-all duration-300">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-4 group" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-xl shadow-indigo-500/30">
                  A
                </div>
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full border-[3px] border-indigo-500 animate-pulse flex items-center justify-center">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                </div>
              </div>
              <span className="hidden sm:block text-2xl font-[1000] tracking-tight text-slate-900 leading-none">
                AlliTool<span className="text-indigo-600">.</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center bg-white/40 backdrop-blur-md px-8 py-3 rounded-3xl gap-10 border border-white/50 shadow-inner">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`relative text-base font-bold transition-all duration-300 hover:text-indigo-600 ${location.pathname === link.path ? 'text-indigo-600' : 'text-slate-600 hover:translate-y-[-1px]'}`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                )}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleStartProcessing}
              className="hidden sm:flex items-center gap-2.5 bg-slate-900 text-white text-base font-[900] px-8 py-3.5 rounded-[1.5rem] transition-all hover:bg-indigo-600 hover:scale-[1.03] hover:shadow-2xl hover:shadow-indigo-500/40 active:scale-95 whitespace-nowrap"
            >
              Get Started
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-14 h-14 flex items-center justify-center rounded-2xl bg-white/80 border border-slate-100 text-slate-900 transition-all hover:bg-white shadow-sm"
            >
              {isMobileMenuOpen ? (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
              ) : (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7"/></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`md:hidden absolute top-full left-4 right-4 mt-6 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isMobileMenuOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-8 scale-95 pointer-events-none'}`}>
          <div className="bg-white/95 backdrop-blur-3xl rounded-[3rem] p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)] border border-slate-100">
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-8 py-5 rounded-2xl text-xl font-black transition-all ${location.pathname === link.path ? 'bg-indigo-50 text-indigo-600' : 'text-slate-900 hover:bg-slate-50'}`}
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-slate-100 my-2" />
              <button 
                onClick={handleStartProcessing}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-6 rounded-2xl font-black text-xl shadow-xl shadow-indigo-500/30 active:scale-95"
              >
                Start Processing
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
