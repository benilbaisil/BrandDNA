import React from 'react';
import { Outlet } from 'react-router-dom';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#EAF4F7] text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col">
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
};
