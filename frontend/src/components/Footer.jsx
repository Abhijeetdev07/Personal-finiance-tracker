import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext as AppAuthContext } from "../App";
import logo from "../assets/web_logo.png";

export default function Footer() {
  const { token } = useContext(AppAuthContext) || {};

  return (
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
              <Link to="/about" className="hover:text-blue-600">About</Link>
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
  );
}
