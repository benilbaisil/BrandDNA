import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F291E]/90 font-sans flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};


