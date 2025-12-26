
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleStartProcessing = () => {
    if (location.pathname === '/') {
      const toolsSection = document.getElementById('tools-section');
      if (toolsSection) {
        toolsSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      // Timeout to allow navigation before scrolling if needed, 
      // though just navigating home is usually enough as the tools are top-of-mind.
    }
  };

  return (
    <nav className="sticky top-0 z-50 py-4 px-6 lg:px-12 pointer-events-none">
      <div className="max-w-7xl mx-auto flex justify-between items-center glass rounded-2xl px-6 py-3 shadow-sm border border-slate-200 pointer-events-auto">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-xl transition-transform group-hover:rotate-6">
                A
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white"></div>
            </div>
            <span className="text-xl font-extrabold tracking-tighter text-slate-900">
              AlliTool
            </span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-10">
          <Link to="/" className="text-slate-500 hover:text-slate-900 text-sm font-semibold transition-colors">Home</Link>
          <Link to="/about" className="text-slate-500 hover:text-slate-900 text-sm font-semibold transition-colors">About AlliTool</Link>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleStartProcessing}
            className="text-slate-900 text-sm font-bold bg-slate-100 px-6 py-2.5 rounded-xl transition-all hover:bg-slate-200"
          >
            Start Processing
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
