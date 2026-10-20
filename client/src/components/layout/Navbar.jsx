import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { useAuth, getRoleRedirectPath } from '../../context/AuthContext';
import { PRODUCT_CATEGORIES } from '../../constants/categories';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'customer') {
      navigate(getRoleRedirectPath(user?.role));
      return;
    }
    if (searchQuery.trim()) {
      navigate(`/customer/dashboard?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/customer/dashboard');
    }
  };

  const getNavLink = (searchParam = '') => {
    if (!isAuthenticated) return '/login';
    if (user?.role === 'customer') {
      return searchParam ? `/customer/dashboard?search=${searchParam}` : '/customer/dashboard';
    }
    return getRoleRedirectPath(user?.role);
  };

  const navLinks = [
    { name: 'About', href: '/#about' },
    { name: 'Catalog', href: getNavLink() },
    { name: 'Special Offers', href: getNavLink('special') },
    { name: 'Bestsellers', href: getNavLink('bestseller') },
    { name: 'Categories', href: getNavLink() },
  ];

  return (
    <header className="w-full bg-white font-sans sticky top-0 z-50 border-b border-stone-200/60 shadow-2xs">
      
      {/* Editorial Luxury Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        
        {/* Left: Serif Editorial Logo (inspired by perf. in reference) */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <span className="font-serif font-extrabold text-2xl sm:text-3xl tracking-tight text-[#0F291E] lowercase group-hover:opacity-80 transition-opacity">
            brand.
          </span>
          <span className="text-[10px] font-sans font-bold tracking-widest text-[#0F382C] uppercase bg-[#E8F5E9] px-2 py-0.5 rounded-full border border-[#C4E1D4]">
            sports
          </span>
        </Link>

        {/* Center: Search input (collapsible/expandable on hover) */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-sm relative items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trekking, workout, gear..."
            className="w-full bg-[#FAF8F5] border border-stone-200/80 text-xs text-stone-900 rounded-full pl-4 pr-10 py-2 outline-none focus:border-[#0F382C] focus:bg-white transition-all font-medium placeholder-stone-400"
          />
          <button
            type="submit"
            className="absolute right-2 text-stone-400 hover:text-[#0F382C] p-1 transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Right: Reference Horizontal Navigation Links */}
        <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-stone-800">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="hover:text-[#0F382C] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#0F382C] hover:after:w-full after:transition-all"
            >
              {link.name}
            </Link>
          ))}

          {/* User Account / Role Redirect */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to={getRoleRedirectPath(user?.role)}
                className="px-4 py-2 rounded-full bg-[#0F382C] text-white font-bold text-xs hover:bg-[#08221B] transition-all shadow-xs flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={logout}
                className="px-3 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-full bg-[#FAF8F5] hover:bg-[#F4EFE6] text-[#0F291E] border border-stone-200 font-bold text-xs transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-full bg-[#0F382C] hover:bg-[#08221B] text-white font-bold text-xs transition-all shadow-xs"
              >
                Register
              </Link>
            </div>
          )}

          {/* Cart Counter */}
          <Link
            to={isAuthenticated ? (user?.role === 'customer' ? "/customer/dashboard?tab=cart" : getRoleRedirectPath(user?.role)) : "/login"}
            className="font-bold text-[#0F291E] hover:text-emerald-700 flex items-center gap-1 bg-[#FAF8F5] px-3.5 py-2 rounded-full border border-stone-200"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#0F382C]" />
            <span>Cart</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-3 md:hidden">
          <Link
            to={isAuthenticated ? (user?.role === 'customer' ? "/customer/dashboard?tab=cart" : getRoleRedirectPath(user?.role)) : "/login"}
            className="font-bold text-xs text-[#0F291E] flex items-center gap-1 bg-[#FAF8F5] px-3 py-1.5 rounded-full border border-stone-200"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Cart</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-800 hover:text-[#0F382C]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 p-5 space-y-4 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="flex relative items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gear & products..."
              className="w-full bg-[#FAF8F5] border border-stone-200 text-xs rounded-full pl-4 pr-10 py-2.5 outline-none"
            />
            <button type="submit" className="absolute right-2 text-stone-600 p-1">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <nav className="flex flex-col space-y-3 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-stone-800 hover:text-[#0F382C] py-2 border-b border-stone-100 flex items-center justify-between"
              >
                <span>{link.name}</span>
                <ArrowUpRight className="w-4 h-4 text-stone-400" />
              </Link>
            ))}

            {isAuthenticated ? (
              <Link
                to={getRoleRedirectPath(user?.role)}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 bg-[#0F382C] text-white text-center font-bold text-xs rounded-xl mt-2 block"
              >
                Go to Workspace ({user?.role})
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center bg-stone-100 text-stone-800 font-bold text-xs rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center bg-[#0F382C] text-white font-bold text-xs rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}

    </header>
  );
};

