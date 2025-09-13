import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext as AppAuthContext } from "../App";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/web_logo.png";

export default function Navbar() {
  const { token } = useContext(AppAuthContext) || {};
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsNavbarVisible(true);
        setScrolled(false);
      } else {
        setScrolled(true);
        
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsNavbarVisible(false);
        } else {
          setIsNavbarVisible(true);
        }
      }
      
      lastScrollY = currentScrollY;
    };
    
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header 
      className={`w-full fixed top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200 transition-transform duration-300 ease-in-out ${scrolled ? 'shadow-sm' : ''} ${isNavbarVisible ? 'translate-y-0' : '-translate-y-full'}`}
      style={{ transform: isNavbarVisible ? 'translateY(0)' : 'translateY(-100%)' }}
    >
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/">
            <img src={logo} alt="Fin Tracker" className="w-[100px] h-[40px] object-contain" width={100} height={40} loading="eager" />
          </Link>
        </div>
        <nav className="hidden sm:flex items-center gap-4 text-sm">
          <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
          <Link to="/about" className="text-gray-700 hover:text-blue-600">About</Link>
          {token ? (
            <Link to="/dashboard" className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
              <Link to="/register" className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded">Get Started</Link>
            </>
          )}
        </nav>
        <button
          className="sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            {menuOpen ? (
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 110-2zm0 4h14a1 1 0 010 2H3a1 1 0 110-2zm0 4h14a1 1 0 010 2H3a1 1 0 110-2z" clipRule="evenodd" />
            )}
          </svg>
        </button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            className="sm:hidden border-t border-gray-200 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <motion.div 
              className="px-4 py-3 flex flex-col gap-3 text-sm"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
            >
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors duration-200" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors duration-200" onClick={() => setMenuOpen(false)}>About</Link>
              {token ? (
                <Link to="/dashboard" className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-center transition-colors duration-200" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors duration-200" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-center transition-colors duration-200" onClick={() => setMenuOpen(false)}>Get Started</Link>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
