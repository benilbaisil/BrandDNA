import React from 'react';

export const TrustedBySection = () => {
  const companies = [
    { name: 'Acme Corp', text: 'ACME' },
    { name: 'Linear', text: 'LINEAR' },
    { name: 'Vercel', text: 'VERCEL' },
    { name: 'Stripe', text: 'STRIPE' },
    { name: 'OpenAI', text: 'OPENAI' },
    { name: 'Notion', text: 'NOTION' },
  ];

  return (
    <section className="py-12 bg-slate-50/70 border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">
          TRUSTED BY INNOVATIVE FOUNDERS & FORWARD-THINKING TEAMS
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
          {companies.map((company, index) => (
            <div key={index} className="flex items-center gap-2 font-bold text-slate-700 text-lg tracking-tighter hover:text-blue-600 transition-colors">
              <div className="w-5 h-5 rounded-md bg-slate-300/80 flex items-center justify-center text-slate-900 text-xs font-extrabold">
                {company.text[0]}
              </div>
              <span>{company.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
