import { useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useAnimation, useInView } from "framer-motion";
import { AuthContext as AppAuthContext } from "../App";
import { FiUsers, FiTarget, FiShield, FiTrendingUp, FiHeart, FiAward, FiZap, FiStar, FiCheckCircle, FiGlobe } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
        y: [0, -8, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }}
    >
      {children}
    </motion.div>
  );
}

export default function About() {
  const { token } = useContext(AppAuthContext) || {};
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 page-transition">
      <Navbar />

      <main>
        {/* Simple Hero Section */}
        <section className="py-2 md:py-8">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <FiStar />
              About Smart Finance
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Empowering Financial Freedom
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
              We're revolutionizing personal finance management by making it simple, secure, and accessible to everyone. 
              Smart Finance empowers you to take control of your financial future with confidence.
            </p>

            {/* Simple Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {[
                { number: "10K+", label: "Users" },
                { number: "₹50L+", label: "Tracked" },
                { number: "99.9%", label: "Uptime" },
                { number: "24/7", label: "Support" }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Mission Section */}
        <ScrollAnimatedSection className="py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center mb-16">
              <motion.h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6">
                Our Mission & Vision
              </motion.h2>
              <motion.p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Transforming the way people manage their finances through innovation, security, and simplicity
              </motion.p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <ScrollAnimatedSection delay={0.2}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
                  <div className="relative bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-8">
                      <FiTarget className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Our Mission</h3>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      To democratize financial literacy by providing intuitive tools that help individuals 
                      understand, track, and optimize their personal finances without complexity or jargon.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      We believe everyone deserves access to powerful financial management tools that are 
                      both secure and easy to use, regardless of their financial background or technical expertise.
                    </p>
                  </div>
                </div>
              </ScrollAnimatedSection>

              <ScrollAnimatedSection delay={0.4}>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { 
                      title: "Clear Goals", 
                      desc: "Set and track your financial objectives with precision and clarity", 
                      icon: FiTarget,
                      gradient: "from-blue-500 to-cyan-500"
                    },
                    { 
                      title: "Bank-Grade Security", 
                      desc: "Your data is protected with enterprise-level encryption and security", 
                      icon: FiShield,
                      gradient: "from-green-500 to-emerald-500"
                    },
                    { 
                      title: "Smart Insights", 
                      desc: "AI-powered analytics to optimize your spending and savings", 
                      icon: FiTrendingUp,
                      gradient: "from-purple-500 to-pink-500"
                    },
                    { 
                      title: "User-Focused", 
                      desc: "Designed with real users' needs and feedback in mind", 
                      icon: FiUsers,
                      gradient: "from-orange-500 to-red-500"
                    }
                  ].map((feature, i) => (
                    <motion.div
                      key={feature.title}
                      whileHover={{ y: -5, scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                      className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {feature.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </ScrollAnimatedSection>
            </div>
          </div>
        </ScrollAnimatedSection>

        {/* Enhanced Values Section */}
        <ScrollAnimatedSection className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center mb-16">
              <motion.h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6">
                Our Core Values
              </motion.h2>
              <motion.p className="text-xl text-gray-600 max-w-3xl mx-auto">
                These fundamental principles guide everything we do and every decision we make
              </motion.p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
              {[
                {
                  title: "Empathy First",
                  desc: "We understand that managing finances can be stressful. Our platform is designed with compassion and understanding.",
                  icon: FiHeart,
                  gradient: "from-pink-500 to-rose-500",
                  bgGradient: "from-pink-50 to-rose-50"
                },
                {
                  title: "Trust & Security",
                  desc: "Your financial data is sacred. We implement the highest security standards and never compromise on protecting your privacy.",
                  icon: FiShield,
                  gradient: "from-green-500 to-emerald-500",
                  bgGradient: "from-green-50 to-emerald-50"
                },
                {
                  title: "Excellence",
                  desc: "We're committed to delivering exceptional user experiences through continuous innovation and attention to detail.",
                  icon: FiAward,
                  gradient: "from-purple-500 to-indigo-500",
                  bgGradient: "from-purple-50 to-indigo-50"
                }
              ].map((value, i) => (
                <ScrollAnimatedSection key={value.title} delay={i * 0.2}>
                  <motion.div
                    whileHover={{ y: -5, scale: 1.01 }}
                    transition={{ duration: 0.3 }}
                    className={`group relative text-center aspect-square flex flex-col justify-center p-4 rounded-xl bg-gradient-to-br ${value.bgGradient} border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden w-full max-w-xs mx-auto`}
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative flex flex-col justify-center h-full">
                      <FloatingElement delay={i * 0.3}>
                        <div className={`w-14 h-14 bg-gradient-to-r ${value.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <value.icon className="w-7 h-7 text-white" />
                        </div>
                      </FloatingElement>
                      
                      <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4 group-hover:text-blue-600 transition-colors duration-300">
                        {value.title}
                      </h3>
                      
                      <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                        {value.desc}
                      </p>
                    </div>
                  </motion.div>
                </ScrollAnimatedSection>
              ))}
            </div>
          </div>
        </ScrollAnimatedSection>

        {/* Enhanced CTA Section */}
        <ScrollAnimatedSection className="relative py-12">
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl mx-4 md:mx-8 p-8 md:p-10 text-center overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-30 translate-y-30"></div>
              <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
            </div>
            
            <div className="relative max-w-4xl mx-auto">
              <motion.div
                className="inline-flex items-center gap-2 bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-medium mb-4"
              >
                <FiCheckCircle className="animate-pulse" />
                Join Our Community
              </motion.div>

              <motion.h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to Transform Your Financial Future?
              </motion.h2>
              
              <motion.p className="text-base text-blue-100 mb-6 max-w-xl mx-auto leading-relaxed">
                Join thousands of users who have already taken control of their finances with Smart Finance. 
                Start your journey to financial freedom today.
              </motion.p>
              
              <motion.div className="flex flex-row gap-2 sm:gap-3 justify-center">
                {token ? (
                  <Link 
                    to="/dashboard" 
                    className="group relative bg-white text-blue-600 hover:bg-blue-50 px-3 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg font-semibold text-xs sm:text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    <span className="flex items-center gap-1 sm:gap-2">
                      <FiTrendingUp size={16} className="sm:hidden" />
                      <FiTrendingUp className="hidden sm:inline" />
                      <span className="hidden sm:inline">Go to Dashboard</span>
                      <span className="sm:hidden">Dashboard</span>
                    </span>
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/register" 
                      className="group relative bg-white text-blue-600 hover:bg-blue-50 px-3 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg font-semibold text-xs sm:text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      <span className="flex items-center gap-1 sm:gap-2">
                        <FiZap size={16} className="sm:hidden" />
                        <FiZap className="hidden sm:inline" />
                        <span className="hidden sm:inline">Get Started Free</span>
                        <span className="sm:hidden">Get Started</span>
                      </span>
                    </Link>
                    <Link 
                      to="/login" 
                      className="group border-2 border-white text-white hover:bg-white hover:text-blue-600 px-3 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg font-semibold text-xs sm:text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
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

              {/* Trust Indicators */}
              <motion.div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-xl mx-auto">
                {[
                  { icon: FiShield, text: "Secure" },
                  { icon: FiUsers, text: "10K+ Users" },
                  { icon: FiGlobe, text: "Global" },
                  { icon: FiHeart, text: "Trusted" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-center gap-1 text-blue-100">
                    <item.icon className="w-3 h-3" />
                    <span className="text-xs font-medium">{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </ScrollAnimatedSection>
      </main>

      <Footer />
    </div>
  );
}
