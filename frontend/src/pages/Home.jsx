import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext as AppAuthContext } from "../App";
import { motion } from "framer-motion";
import logo from "../assets/web_logo.png";
import heroImg from "../assets/herosec.png";
import { FiBarChart2, FiLock, FiTag } from "react-icons/fi";

export default function Home() {
  const { token } = useContext(AppAuthContext) || {};
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className={`w-full sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200 ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Fin Tracker" className="w-[100px] h-[40px] object-contain" width={100} height={40} loading="eager" />
          </div>
          <nav className="hidden sm:flex items-center gap-4 text-sm">
            <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
            <a href="#features" className="text-gray-700 hover:text-blue-600">Features</a>
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
        {menuOpen && (
          <div className="sm:hidden border-t border-gray-200">
            <div className="px-4 py-3 flex flex-col gap-3 text-sm">
              <Link to="/" className="text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Home</Link>
              <a href="#features" className="text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Features</a>
              {token ? (
                <Link to="/dashboard" className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-center" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-center" onClick={() => setMenuOpen(false)}>Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-6 md:py-10 grid gap-6 md:grid-cols-2 items-center">
          <div>
            <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="text-3xl md:text-5xl font-extrabold leading-tight text-gray-900">
              Track your finances with clarity
            </motion.h1>
            <motion.p initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.05 }} className="mt-3 text-gray-600 md:text-lg">
              Monitor income, expenses, and balance in a clean, modern dashboard.
            </motion.p>
            <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-4 flex gap-3">
              {token ? (
                <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg">
                    Get Started
                  </Link>
                  <Link to="/login" className="border border-gray-300 hover:bg-gray-50 text-gray-800 px-5 py-2.5 rounded-lg">
                    Login
                  </Link>
                </>
              )}
            </motion.div>
          </div>
          <div className="border rounded-lg">
            <motion.img initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.7, delay: 0.1 }} src={heroImg} alt="Dashboard preview" className="w-full h-auto rounded-lg max-w-md mx-auto" width={800} height={450} loading="lazy" />
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-12 md:py-20">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 md:mb-10">Features</h2>
          <div className="grid gap-5 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Intuitive Dashboard", desc: "Understand your finances at a glance.", Icon: FiBarChart2 },
              { title: "Secure Authentication", desc: "Protected routes and JWT-based access.", Icon: FiLock },
              { title: "Smart Categories", desc: "Organize spending for better insights.", Icon: FiTag },
            ].map((f, i) => (
              <div key={f.title} data-aos="fade-up" data-aos-delay={i * 100} className="rounded-xl border bg-white shadow p-5">
                <div className="w-9 h-9 rounded-lg bg-blue-600/10 text-blue-700 grid place-items-center mb-3">
                  <f.Icon size={20} />
                </div>
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-600 flex flex-col gap-6">
          <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex flex-col gap-2">
              <img src={logo} alt="Fin Tracker" className="w-[100px] h-[40px] object-contain" width={100} height={40} loading="lazy" />
              <span className="text-gray-500">Track income and expenses effortlessly</span>
            </div>
            <div className="flex flex-col gap-2 min-w-[160px]">
              <span className="text-gray-800 font-medium">Quick links</span>
              <nav className="flex flex-col gap-1">
                <Link to="/" className="hover:text-blue-600">Home</Link>
                <a href="#features" className="hover:text-blue-600">Features</a>
                <Link to="/register" className="hover:text-blue-600">Register</Link>
                {token ? (
                  <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
                ) : (
                  <Link to="/login" className="hover:text-blue-600">Login</Link>
                )}
              </nav>
            </div>
          </div>
          <div className="w-full border-t border-gray-200 pt-3"></div>
          <div className="w-full text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} Fin Tracker. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}


