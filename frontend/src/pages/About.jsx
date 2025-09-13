import { useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext as AppAuthContext } from "../App";
import { FiUsers, FiTarget, FiShield, FiTrendingUp, FiHeart, FiAward } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function About() {
  const { token } = useContext(AppAuthContext) || {};
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="mx-auto max-w-4xl px-4 py-12 md:py-20 text-center">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            About Fin Tracker
          </motion.h1>
          <motion.p 
            initial={{ y: 24, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            We're on a mission to make personal finance management simple, secure, and accessible to everyone. 
            Our platform empowers you to take control of your financial future with confidence.
          </motion.p>
        </section>

        {/* Mission Section */}
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  To democratize financial literacy by providing intuitive tools that help individuals 
                  understand, track, and optimize their personal finances without complexity or jargon.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  We believe everyone deserves access to powerful financial management tools that are 
                  both secure and easy to use, regardless of their financial background or technical expertise.
                </p>
              </motion.div>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-6"
              >
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <FiTarget className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Clear Goals</h3>
                  <p className="text-sm text-gray-600">Set and track your financial objectives with precision</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <FiShield className="w-8 h-8 text-green-600 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Bank-Grade Security</h3>
                  <p className="text-sm text-gray-600">Your data is protected with enterprise-level encryption</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <FiTrendingUp className="w-8 h-8 text-purple-600 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Smart Insights</h3>
                  <p className="text-sm text-gray-600">AI-powered analytics to optimize your spending</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <FiUsers className="w-8 h-8 text-orange-600 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">User-Focused</h3>
                  <p className="text-sm text-gray-600">Designed with real users' needs in mind</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                These core principles guide everything we do and every decision we make
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center p-8 rounded-xl bg-blue-50"
              >
                <FiHeart className="w-12 h-12 text-blue-600 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Empathy First</h3>
                <p className="text-gray-600 leading-relaxed">
                  We understand that managing finances can be stressful. Our platform is designed 
                  with compassion and understanding, making financial management feel less overwhelming.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center p-8 rounded-xl bg-green-50"
              >
                <FiShield className="w-12 h-12 text-green-600 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Trust & Security</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your financial data is sacred. We implement the highest security standards and 
                  never compromise on protecting your privacy and sensitive information.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center p-8 rounded-xl bg-purple-50"
              >
                <FiAward className="w-12 h-12 text-purple-600 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Excellence</h3>
                <p className="text-gray-600 leading-relaxed">
                  We're committed to delivering exceptional user experiences through continuous 
                  innovation, attention to detail, and relentless pursuit of improvement.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 py-16">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-white mb-6"
            >
              Ready to Take Control of Your Finances?
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
            >
              Join thousands of users who have already transformed their financial management 
              with our intuitive and secure platform.
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {token ? (
                <Link 
                  to="/dashboard" 
                  className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    to="/register" 
                    className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Get Started Free
                  </Link>
                  <Link 
                    to="/login" 
                    className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
