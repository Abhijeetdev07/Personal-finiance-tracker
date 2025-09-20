import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useAnimation, useInView } from "framer-motion";
import { AuthContext as AppAuthContext } from "../App";
import heroImg from "../assets/herosec.png";
import { FiBarChart2, FiLock, FiTag, FiTrendingUp, FiDollarSign, FiPieChart, FiShield, FiZap, FiStar } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useRef } from "react";

// Scroll Animation Component
function ScrollAnimatedSection({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Floating Animation Component
function FloatingElement({ children, delay = 0 }) {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const { token } = useContext(AppAuthContext) || {};
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 page-transition">
      <Navbar />

      <main>
        {/* Enhanced Hero Section */}
        <section className="relative w-full">
          {/* Background Decorations */}
          <div className="absolute inset-0 w-full overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative mx-auto max-w-7xl px-4 py-2 md:py-8">
            <div className="relative grid gap-8 lg:grid-cols-2 items-center">
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6"
              >
                <FiStar className="animate-pulse" />
                Smart Finance Tracker
              </motion.div>

              <motion.h1 
                initial={{ y: 50, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ duration: 0.8, delay: 0.2 }} 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
              >
                Track Your Finances With Clarity
              </motion.h1>

              <motion.p 
                initial={{ y: 30, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ duration: 0.8, delay: 0.4 }} 
                className="mt-4 text-lg text-gray-600 max-w-xl mx-auto lg:mx-0"
              >
                Transform your financial life with our intelligent dashboard. Monitor income, track expenses, and achieve your financial goals with powerful insights and beautiful visualizations.
              </motion.p>

              <motion.div 
                initial={{ y: 30, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ duration: 0.8, delay: 0.6 }} 
                className="mt-6 flex flex-row gap-2 sm:gap-3 justify-center lg:justify-start"
              >
                {token ? (
                  <Link 
                    to="/dashboard" 
                    className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg font-semibold text-xs sm:text-base transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  >
                    <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                      <FiTrendingUp size={16} className="sm:hidden" />
                      <FiTrendingUp className="hidden sm:inline" />
                      <span className="hidden sm:inline">Go to Dashboard</span>
                      <span className="sm:hidden">Dashboard</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/register" 
                      className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg font-semibold text-xs sm:text-base transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                    >
                      <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                        <FiZap size={16} className="sm:hidden" />
                        <FiZap className="hidden sm:inline" />
                        <span className="hidden sm:inline">Get Started Free</span>
                        <span className="sm:hidden">Get Started</span>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                    <Link 
                      to="/login" 
                      className="group border-2 border-gray-300 hover:border-blue-500 bg-white hover:bg-blue-50 text-gray-800 hover:text-blue-700 px-3 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg font-semibold text-xs sm:text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      <span className="flex items-center gap-1 sm:gap-2">
                        <FiShield size={16} className="sm:hidden" />
                        <FiShield className="hidden sm:inline" />
                        <span className="hidden sm:inline">Sign In</span>
                        <span className="sm:hidden">Sign In</span>
                      </span>
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Stats */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ duration: 0.8, delay: 0.8 }} 
                className="mt-8 grid grid-cols-3 gap-4 max-w-sm mx-auto lg:mx-0"
              >
                {[
                  { number: "10K+", label: "Users" },
                  { number: "₹50L+", label: "Tracked" },
                  { number: "99.9%", label: "Uptime" }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-lg font-bold text-gray-900">{stat.number}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="relative">
              <FloatingElement delay={0.5}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0, rotateY: -30 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-2xl transform rotate-6"></div>
                  <img 
                    src={heroImg} 
                    alt="Dashboard preview" 
                    className="relative w-full h-auto rounded-xl shadow-xl border border-white/20 backdrop-blur-sm max-w-lg mx-auto" 
                    width={800} 
                    height={450} 
                    loading="lazy" 
                  />
                </motion.div>
              </FloatingElement>
            </div>
          </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <ScrollAnimatedSection className="mx-auto max-w-7xl px-4 py-20">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4"
            >
              Powerful Features
            </motion.h2>
            <motion.p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to take control of your finances and build a better financial future
            </motion.p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { 
                title: "Smart Dashboard", 
                desc: "Get instant insights with beautiful charts and real-time analytics that help you understand your spending patterns.", 
                Icon: FiBarChart2,
                gradient: "from-blue-500 to-cyan-500"
              },
              { 
                title: "Bank-Level Security", 
                desc: "Your data is protected with enterprise-grade encryption and secure authentication protocols.", 
                Icon: FiShield,
                gradient: "from-green-500 to-emerald-500"
              },
              { 
                title: "Smart Categories", 
                desc: "Automatically categorize transactions and get personalized insights to optimize your spending.", 
                Icon: FiTag,
                gradient: "from-purple-500 to-pink-500"
              },
              { 
                title: "Expense Tracking", 
                desc: "Monitor every rupee with detailed expense tracking and customizable budget alerts.", 
                Icon: FiDollarSign,
                gradient: "from-orange-500 to-red-500"
              },
              { 
                title: "Visual Analytics", 
                desc: "Beautiful pie charts and graphs that make your financial data easy to understand and act upon.", 
                Icon: FiPieChart,
                gradient: "from-indigo-500 to-purple-500"
              },
              { 
                title: "Growth Insights", 
                desc: "Track your financial growth over time with trend analysis and predictive insights.", 
                Icon: FiTrendingUp,
                gradient: "from-teal-500 to-green-500"
              },
            ].map((feature, i) => (
              <ScrollAnimatedSection key={feature.title} delay={i * 0.1}>
                <motion.div 
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="group relative bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl p-8 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                      <feature.Icon size={28} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              </ScrollAnimatedSection>
            ))}
          </div>
        </ScrollAnimatedSection>
      </main>

      <Footer />
    </div>
  );
}


