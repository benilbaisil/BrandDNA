/**
 * Executive PDF Generator & Print Utility for BrandDNA AI Platform Reports
 */

export const exportReportToPDF = (report) => {
  if (!report) return;

  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) {
    alert('Pop-up blocker prevented opening PDF export window. Please allow pop-ups for this site.');
    return;
  }

  const compName = report.companyName || report.company || 'BrandDNA Startup';
  const reportTitle = report.title || `${compName} Executive Strategy Blueprint`;
  const owner = report.ownerName || report.owner || 'Startup Founder';
  const ownerEmail = report.ownerEmail || 'founder@branddna.ai';
  const dateStr = report.date || new Date().toISOString().split('T')[0];
  const industry = report.industry || 'Business Services & Technology';

  const brand = report.brandIdentity || {};
  const strategy = report.productStrategy || {};
  const personas = report.personas || [];

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${compName} - Executive Brand DNA Report (PDF)</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=JetBrains+Mono:wght@500;700&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
          color: #0f172a;
          background: #ffffff;
          line-height: 1.6;
          padding: 40px;
          max-width: 850px;
          margin: 0 auto;
        }

        @media print {
          body { padding: 0; max-width: 100%; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
        }

        .header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .brand-logo {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.5px;
        }
        .brand-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          background: #0f172a;
          color: #ffffff;
          padding: 4px 10px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .report-title-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 28px;
          margin-bottom: 30px;
        }
        .report-title-card h1 {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          color: #0f172a;
          margin-bottom: 8px;
        }
        .report-meta-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #cbd5e1;
          font-size: 11px;
        }
        .meta-item label {
          font-family: 'JetBrains Mono', monospace;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 700;
          display: block;
          margin-bottom: 2px;
          font-size: 9px;
        }
        .meta-item p {
          font-weight: 700;
          color: #0f172a;
        }

        .section-title {
          font-size: 14px;
          font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase;
          font-weight: 800;
          color: #2563eb;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
          margin-top: 28px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-title::before {
          content: '';
          display: inline-block;
          width: 8px;
          height: 8px;
          background: #2563eb;
          border-radius: 2px;
        }

        .card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px 22px;
          margin-bottom: 16px;
        }
        .card-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        .card-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .card-value {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
        }

        .usp-list {
          list-style: none;
          padding: 0;
        }
        .usp-item {
          padding: 10px 14px;
          background: #f1f5f9;
          border-radius: 8px;
          margin-bottom: 8px;
          font-size: 12px;
        }
        .usp-item strong {
          color: #0f172a;
          display: block;
          margin-bottom: 2px;
        }

        .persona-card {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          font-size: 12px;
        }
        .persona-name {
          font-weight: 800;
          font-size: 14px;
          color: #1e3a8a;
          margin-bottom: 6px;
        }

        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          color: #94a3b8;
          font-family: 'JetBrains Mono', monospace;
        }

        .btn-print {
          background: #0f172a;
          color: #ffffff;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>

      <button class="btn-print no-print" onclick="window.print()">📥 Save / Print PDF Report</button>

      <div class="header-bar">
        <div class="brand-logo">BrandDNA AI Platform</div>
        <div class="brand-badge">CONFIDENTIAL EXECUTIVE REPORT</div>
      </div>

      <div class="report-title-card">
        <h1>${reportTitle}</h1>
        <p style="font-size: 13px; color: #475569;">Official Brand Analysis & Product Strategy Deliverable compiled by BrandDNA Platform Admin Control Center.</p>
        
        <div class="report-meta-grid">
          <div class="meta-item">
            <label>Company / Brand</label>
            <p>${compName}</p>
          </div>
          <div class="meta-item">
            <label>Industry</label>
            <p>${industry}</p>
          </div>
          <div class="meta-item">
            <label>Startup Owner</label>
            <p>${owner}</p>
          </div>
          <div class="meta-item">
            <label>Generated Date</label>
            <p>${dateStr}</p>
          </div>
        </div>
      </div>

      <!-- SECTION 1: BRAND ANALYSIS IDENTITY -->
      <div class="section-title">01. Brand Identity & Analysis</div>
      
      <div class="card-grid">
        <div class="card">
          <div class="card-label">Brand Name</div>
          <div class="card-value">${brand.brandName || compName}</div>
        </div>
        <div class="card">
          <div class="card-label">Brand Tagline</div>
          <div class="card-value">${brand.tagline || 'N/A'}</div>
        </div>
      </div>

      ${brand.missionStatement ? `
        <div class="card">
          <div class="card-label">Mission Statement</div>
          <div class="card-value">${brand.missionStatement}</div>
        </div>
      ` : ''}

      ${brand.visionStatement ? `
        <div class="card">
          <div class="card-label">Vision Statement</div>
          <div class="card-value">${brand.visionStatement}</div>
        </div>
      ` : ''}

      ${brand.brandStory ? `
        <div class="card">
          <div class="card-label">Brand Origin Story</div>
          <div class="card-value" style="font-style: italic; color: #334155;">"${brand.brandStory}"</div>
        </div>
      ` : ''}

      <!-- SECTION 2: PRODUCT STRATEGY -->
      <div class="section-title">02. Product Strategy & Positioning</div>
      
      <div class="card-grid">
        <div class="card">
          <div class="card-label">Active Product Name</div>
          <div class="card-value">${strategy.productName || compName}</div>
        </div>
        <div class="card">
          <div class="card-label">Target Segment</div>
          <div class="card-value">${strategy.targetSegment || report.targetAudience || 'Modern Consumers & Enterprises'}</div>
        </div>
      </div>

      ${strategy.shortDescription ? `
        <div class="card">
          <div class="card-label">Product Short Pitch</div>
          <div class="card-value">${strategy.shortDescription}</div>
        </div>
      ` : ''}

      ${strategy.positioningStatement ? `
        <div class="card" style="background: #fdf4ff; border-color: #f0abfc;">
          <div class="card-label" style="color: #7e22ce;">Strategic Positioning Statement</div>
          <div class="card-value" style="color: #581c87;">"${strategy.positioningStatement}"</div>
        </div>
      ` : ''}

      ${strategy.usps && strategy.usps.length > 0 ? `
        <div class="card">
          <div class="card-label">Defensible USPs (Unique Selling Propositions)</div>
          <ul class="usp-list" style="margin-top: 8px;">
            ${strategy.usps.map((u) => `
              <li class="usp-item">
                <strong>• ${u.title || 'Core Advantage'}</strong>
                <span>${u.description || ''}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- SECTION 3: CUSTOMER PERSONAS -->
      ${personas && personas.length > 0 ? `
        <div class="section-title">03. Ideal Customer Persona Analysis</div>
        ${personas.map((p) => `
          <div class="persona-card">
            <div class="persona-name">👤 ${p.personaName}</div>
            <p style="color: #334155; margin-bottom: 4px;"><strong>Age / Occupation:</strong> ${p.demographics?.age || 'N/A'} • ${p.demographics?.occupation || 'Professional'}</p>
            <p style="color: #334155; margin-bottom: 4px;"><strong>Income Level:</strong> ${p.demographics?.income || 'N/A'}</p>
            <p style="color: #1e293b; margin-top: 6px;"><strong>Primary Challenge:</strong> ${p.painPoints?.primaryChallenge || 'Needs streamlined high-performance solutions.'}</p>
          </div>
        `).join('')}
      ` : ''}

      <div class="footer">
        <span>BrandDNA AI Intelligence System</span>
        <span>Report Hash: ${report.id || 'BDNA-2026-PDF'}</span>
        <span>Generated for ${ownerEmail}</span>
      </div>

    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

export const exportAllReportsToPDF = (reportsList = []) => {
  if (!reportsList || reportsList.length === 0) return;

  const printWindow = window.open('', '_blank', 'width=950,height=1000');
  if (!printWindow) {
    alert('Pop-up blocker prevented opening PDF export window.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>BrandDNA AI Platform - Master Reports Executive Audit (PDF)</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Playfair+Display:wght@700&family=JetBrains+Mono:wght@500;700&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 40px; color: #0f172a; max-width: 900px; margin: 0 auto; }
        @media print { .no-print { display: none !important; } }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
        .title { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; }
        .report-row { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px; page-break-inside: avoid; }
        .comp-title { font-size: 16px; font-weight: 800; color: #0f172a; }
        .meta { font-size: 11px; color: #64748b; font-family: 'JetBrains Mono', monospace; margin: 4px 0 10px 0; }
        .btn-print { background: #0f172a; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; margin-bottom: 20px; }
        .tag { display: inline-block; background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; }
      </style>
    </head>
    <body>
      <button class="btn-print no-print" onclick="window.print()">📥 Export Master Reports Summary (PDF)</button>
      
      <div class="header">
        <div class="title">BrandDNA AI Platform Master Audit</div>
        <div style="font-family:'JetBrains Mono', monospace; font-size: 11px; font-weight:700;">TOTAL REPORTS: ${reportsList.length}</div>
      </div>

      <p style="font-size: 12px; color: #475569; margin-bottom: 20px;">
        Complete Master Portfolio Audit of all generated startup strategy reports, brand identities, and product positioning.
      </p>

      ${reportsList.map((r, idx) => `
        <div class="report-row">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <span class="tag">REPORT #${idx + 1}</span>
              <div class="comp-title">${r.companyName || r.company}</div>
            </div>
            <span style="font-size: 11px; font-weight: 700; color: #2563eb;">${r.date || 'Active'}</span>
          </div>
          <div class="meta">Owner: ${r.ownerName || 'Startup Founder'} • Industry: ${r.industry || 'Tech'}</div>
          
          ${r.brandIdentity?.tagline ? `<p style="font-size: 12px; color: #334155; margin-bottom: 4px;"><strong>Tagline:</strong> ${r.brandIdentity.tagline}</p>` : ''}
          ${r.productStrategy?.productName ? `<p style="font-size: 12px; color: #334155; margin-bottom: 4px;"><strong>Product:</strong> ${r.productStrategy.productName}</p>` : ''}
          <p style="font-size: 11px; color: #64748b;">${r.summary || 'Compiled Executive Brand DNA Deliverable'}</p>
        </div>
      `).join('')}
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
