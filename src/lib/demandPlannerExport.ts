interface DemandResult {
  packageType: string;
  baseQty: number;
  usagePercent: number;
  safetyStockPercent: number;
  finalQty: number;
  estimatedCost: number;
  estimatedWeight: number;
}

interface DemandPlanResults {
  results: DemandResult[];
  totalPackages: number;
  totalCost: number;
  totalWeight: number;
  insights: string[];
}

// Export demand planning data to CSV
export function exportToCSV(
  results: DemandPlanResults,
  totalOrders: number,
  forecastPeriod: string,
  safetyStock: number
): void {
  const headers = [
    'Package Type',
    'Usage %',
    'Base Qty',
    'Safety Stock %',
    'Final Qty',
    'Est. Cost ($)',
    'Est. Weight (lbs)'
  ];

  const csvData = [
    // Headers
    headers.join(','),
    
    // Data rows
    ...results.results.map(item => [
      `"${item.packageType}"`,
      item.usagePercent.toFixed(2),
      item.baseQty.toString(),
      item.safetyStockPercent.toFixed(1),
      item.finalQty.toString(),
      item.estimatedCost.toFixed(2),
      item.estimatedWeight.toFixed(2)
    ].join(',')),

    // Summary row
    '',
    'SUMMARY',
    `"Total Orders: ${totalOrders.toLocaleString()}"`,
    `"Forecast Period: ${forecastPeriod}"`,
    `"Total Packages: ${results.totalPackages.toLocaleString()}"`,
    `"Total Cost: $${results.totalCost.toFixed(2)}"`,
    `"Total Weight: ${results.totalWeight.toFixed(1)} lbs"`,
    `"Safety Stock: ${safetyStock}%"`
  ];

  // Create and download file
  const csvContent = csvData.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `demand-plan-${forecastPeriod.replace(/\s+/g, '-')}-${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export demand planning report to PDF
export async function exportToPDF(
  results: DemandPlanResults,
  totalOrders: number,
  forecastPeriod: string,
  safetyStock: number
): Promise<void> {
  // Create comprehensive HTML report
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Packaging Demand Plan - ${forecastPeriod}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.4; color: #333; }
        .header { text-align: center; border-bottom: 3px solid #f59e0b; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #f59e0b; margin: 0; font-size: 28px; }
        .header p { color: #666; margin: 5px 0; }
        .summary { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .summary-item { text-align: center; background: white; padding: 15px; border-radius: 6px; border: 1px solid #fbbf24; }
        .summary-value { font-size: 24px; font-weight: bold; color: #f59e0b; }
        .summary-label { font-size: 14px; color: #666; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f8f9fa; font-weight: bold; color: #333; }
        tr:nth-child(even) { background-color: #f8f9fa; }
        .insights { background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .insights h3 { color: #1d4ed8; margin-top: 0; }
        .insight-item { background: white; padding: 12px; margin: 8px 0; border-radius: 4px; border-left: 4px solid #3b82f6; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
        .page-break { page-break-before: always; }
        @media print { .page-break { page-break-before: always; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📦 Packaging Demand Plan</h1>
        <p>Forecast Period: ${forecastPeriod}</p>
        <p>Generated on: ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', month: 'long', day: 'numeric', 
          hour: '2-digit', minute: '2-digit'
        })}</p>
      </div>

      <div class="summary">
        <h2>📊 Executive Summary</h2>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-value">${totalOrders.toLocaleString()}</div>
            <div class="summary-label">Forecasted Orders</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${results.totalPackages.toLocaleString()}</div>
            <div class="summary-label">Total Packages Needed</div>
          </div>
          ${results.totalCost > 0 ? `
          <div class="summary-item">
            <div class="summary-value">$${results.totalCost.toFixed(2)}</div>
            <div class="summary-label">Estimated Cost</div>
          </div>
          ` : ''}
          ${results.totalWeight > 0 ? `
          <div class="summary-item">
            <div class="summary-value">${results.totalWeight.toFixed(1)} lbs</div>
            <div class="summary-label">Total Weight</div>
          </div>
          ` : ''}
          <div class="summary-item">
            <div class="summary-value">${safetyStock}%</div>
            <div class="summary-label">Safety Stock Buffer</div>
          </div>
        </div>
      </div>

      <h2>📋 Detailed Breakdown</h2>
      <table>
        <thead>
          <tr>
            <th>Package Type</th>
            <th>Usage %</th>
            <th>Base Qty</th>
            <th>Safety Stock %</th>
            <th>Final Qty</th>
            <th>Est. Cost</th>
            <th>Est. Weight</th>
          </tr>
        </thead>
        <tbody>
          ${results.results.map(item => `
            <tr>
              <td><strong>${item.packageType}</strong></td>
              <td>${item.usagePercent.toFixed(1)}%</td>
              <td>${item.baseQty.toLocaleString()}</td>
              <td>${item.safetyStockPercent.toFixed(1)}%</td>
              <td><strong>${item.finalQty.toLocaleString()}</strong></td>
              <td>${item.estimatedCost > 0 ? '$' + item.estimatedCost.toFixed(2) : 'N/A'}</td>
              <td>${item.estimatedWeight > 0 ? item.estimatedWeight.toFixed(1) + ' lbs' : 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="insights">
        <h3>🤖 AI Insights & Recommendations</h3>
        ${results.insights.map(insight => `
          <div class="insight-item">✓ ${insight}</div>
        `).join('')}
      </div>

      <div class="footer">
        <p>Generated by QuantiPackAI Packaging Demand Planner</p>
        <p>This report contains proprietary business information and should be treated as confidential.</p>
      </div>
    </body>
    </html>
  `;

  // Create and download PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }
}