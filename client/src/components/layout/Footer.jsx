import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Globe, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Footer = () => {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="bg-[#060D1A] text-slate-300 text-xs sm:text-sm pt-16 pb-8 border-t border-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-serif font-extrabold text-3xl tracking-tight text-white flex items-center gap-1">
                BrandDNA<span className="text-sky-400 font-sans text-3xl leading-none">.</span>
              </span>
              <span className="text-[10px] font-sans font-bold tracking-widest text-sky-300 uppercase bg-[#0B192C] px-2.5 py-0.5 rounded-full border border-sky-700/50">
                Official Store
              </span>
            </Link>
            <p className="text-slate-400 max-w-sm leading-relaxed text-xs">
              Crafted for high performance, workout discipline, outdoor expeditions, and active lifestyles. Quality products engineered with precision.
            </p>
            <div>
              <Link to="/about" className="text-xs font-bold text-sky-400 hover:text-white transition-colors inline-flex items-center gap-1">
                <span>About our brand & craft</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-widest font-mono">Catalog</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/products?category=Workout%20Essentials" className="hover:text-white transition-colors">Workout Essentials</Link></li>
              <li><Link to="/products?category=Hiking%20%26%20Trekking" className="hover:text-white transition-colors">Hiking & Trekking</Link></li>
              <li><Link to="/products?category=Shoes" className="hover:text-white transition-colors">Shoes & Footwear</Link></li>
              <li><Link to="/products?category=Bags%20%26%20Backpacks" className="hover:text-white transition-colors">Bags & Backpacks</Link></li>
              <li><Link to="/products?category=Sport%20Accessories" className="hover:text-white transition-colors">Sport Accessories</Link></li>
              <li><Link to="/products?category=Nutrition%20%26%20Care" className="hover:text-white transition-colors">Nutrition & Care</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-widest font-mono">Support</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to={isAuthenticated ? "/customer/dashboard?tab=orders" : "/login"} className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link to={isAuthenticated ? "/customer/dashboard?tab=orders" : "/login"} className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
              <li><a href="#shipping" className="hover:text-white transition-colors">Shipping Policy</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Portal Links */}
          <div>
            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-widest font-mono">Portals</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/login" className="hover:text-white transition-colors">Account Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Customer Register</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-white transition-colors">Admin Workspace</Link></li>
              <li><Link to="/inventory/dashboard" className="hover:text-white transition-colors">Inventory Workspace</Link></li>
              <li><Link to="/marketing/dashboard" className="hover:text-white transition-colors">Marketing AI Studio</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
          <p>© {new Date().getFullYear()} BrandDNA. All rights reserved.</p>
          <div className="flex items-center gap-6 text-[11px]">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

