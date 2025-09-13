import { useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext as AppAuthContext } from "../App";
import heroImg from "../assets/herosec.png";
import { FiBarChart2, FiLock, FiTag } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Home() {
  const { token } = useContext(AppAuthContext) || {};
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-16">
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

      <Footer />
    </div>
  );
}


