
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Privacy from './pages/Privacy';
import ToolWorkspace from './pages/ToolWorkspace';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        {/* Added pt-16 to handle fixed navbar spacing */}
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/tool/:toolId" element={<ToolWorkspace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
