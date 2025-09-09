// PDF Export functionality for Design Analyzer
// Note: This is a basic implementation. For production, consider using libraries like jsPDF or Puppeteer

interface VisualElements {
  logo_position: string;
  primary_colors: string[];
  text_hierarchy: string;
  featured_claims: string[];
  design_style: string;
}

interface MetaInfo {
  category?: string;
  shelfType?: string;
  claims?: string;
  analysisFocus?: string;
  targetDemographics?: string;
  retailEnvironment?: string;
}

interface PDPAnalysisResult {
  mainAnalysis: {
    label: string;
    scores: Record<string, number>;
    analysis: Record<string, string>;
    visualElements: VisualElements;
  };
  competitorAnalyses: Array<{
    label: string;
    scores: Record<string, number>;
    analysis: Record<string, string>;
    visualElements: VisualElements;
  }>;
  normalizedScores?: Record<string, {
    raw_score: number;
    z_score: number;
    percentile: number;
    interpretation: string;
  }>;
  recommendations: {
    priority_improvements: Array<{
      metric: string;
      current_score: number;
      target_score: number;
      recommendation: string;
      example: string;
    }>;
    overall_strategy: string;
    quick_wins: string[];
    competitive_advantages: string[];
  };
  timestamp: number;
}

export const exportToPDF = (results: PDPAnalysisResult, metaInfo: MetaInfo) => {
  // Create HTML content for PDF
  const htmlContent = generatePDFHTML(results, metaInfo);
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Close the window after printing (optional)
        setTimeout(() => printWindow.close(), 1000);
      }, 500);
    };
  }
};

const generatePDFHTML = (results: PDPAnalysisResult, metaInfo: MetaInfo): string => {
  const timestamp = new Date(results.timestamp).toLocaleDateString();
  const overallScore = (Object.values(results.mainAnalysis.scores).reduce((a, b) => a + b, 0) / Object.values(results.mainAnalysis.scores).length).toFixed(1);
  
  const metricNames: Record<string, string> = {
    hierarchy: 'Hierarchy',
    readability: 'Readability',
    color_impact: 'Color Impact',
    logo_visibility: 'Logo Visibility',
    emotional_appeal: 'Emotional Appeal',
    claims_communication: 'Claims Communication',
    font_choice: 'Font Choice',
    white_space_balance: 'White Space Balance'
  };

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Design Analysis Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #4f46e5;
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .header .subtitle {
            color: #666;
            font-size: 16px;
        }
        
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        
        .section h2 {
            color: #4f46e5;
            font-size: 20px;
            margin-bottom: 15px;
            border-left: 4px solid #4f46e5;
            padding-left: 10px;
        }
        
        .section h3 {
            color: #333;
            font-size: 16px;
            margin-bottom: 10px;
        }
        
        .meta-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .meta-info .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .meta-info .label {
            font-weight: 600;
            color: #4f46e5;
        }
        
        .score-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .score-card {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        
        .score-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #4f46e5;
        }
        
        .score-card .label {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }
        
        .scores-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .scores-table th,
        .scores-table td {
            padding: 12px 8px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .scores-table th {
            background: #f1f5f9;
            font-weight: 600;
            color: #4f46e5;
        }
        
        .score-bar {
            width: 100px;
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
            display: inline-block;
            margin-left: 8px;
        }
        
        .score-fill {
            height: 100%;
            border-radius: 4px;
        }
        
        .score-high { background: #10b981; }
        .score-medium { background: #f59e0b; }
        .score-low { background: #ef4444; }
        
        .analysis-section {
            margin-bottom: 15px;
        }
        
        .analysis-section .metric-title {
            font-weight: 600;
            color: #4f46e5;
            margin-bottom: 5px;
        }
        
        .analysis-section .metric-text {
            color: #666;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        .recommendations {
            background: #fef3c7;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
        }
        
        .recommendations h3 {
            color: #92400e;
            margin-bottom: 15px;
        }
        
        .recommendations ul {
            list-style-type: none;
            padding-left: 0;
        }
        
        .recommendations li {
            margin-bottom: 10px;
            padding-left: 20px;
            position: relative;
        }
        
        .recommendations li::before {
            content: "→";
            position: absolute;
            left: 0;
            color: #f59e0b;
            font-weight: bold;
        }
        
        .competitive-advantages {
            background: #d1fae5;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #10b981;
            margin-top: 15px;
        }
        
        .competitive-advantages h3 {
            color: #065f46;
            margin-bottom: 15px;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #666;
            font-size: 12px;
        }
        
        @media print {
            body { margin: 0; }
            .container { padding: 20px; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>Design Analysis Report</h1>
            <div class="subtitle">AI-Powered Principal Display Panel Analysis</div>
            <div class="subtitle">Generated on ${timestamp}</div>
        </div>
        
        <!-- Meta Information -->
        ${metaInfo && (metaInfo.category || metaInfo.shelfType || metaInfo.retailEnvironment) ? `
        <div class="section">
            <h2>Analysis Context</h2>
            <div class="meta-info">
                ${metaInfo.category ? `<div class="row"><span class="label">Product Category:</span><span>${metaInfo.category}</span></div>` : ''}
                ${metaInfo.shelfType ? `<div class="row"><span class="label">Shelf Type:</span><span>${metaInfo.shelfType}</span></div>` : ''}
                ${metaInfo.retailEnvironment ? `<div class="row"><span class="label">Retail Environment:</span><span>${metaInfo.retailEnvironment}</span></div>` : ''}
                ${metaInfo.targetDemographics ? `<div class="row"><span class="label">Target Demographics:</span><span>${metaInfo.targetDemographics}</span></div>` : ''}
                <div class="row"><span class="label">Competitors Analyzed:</span><span>${results.competitorAnalyses.length}</span></div>
            </div>
        </div>
        ` : ''}
        
        <!-- Score Summary -->
        <div class="section">
            <h2>Performance Summary</h2>
            <div class="score-summary">
                <div class="score-card">
                    <div class="value">${overallScore}</div>
                    <div class="label">Overall Score</div>
                </div>
                ${results.normalizedScores ? `
                <div class="score-card">
                    <div class="value">${Object.values(results.normalizedScores).filter(score => score.z_score > 0).length}</div>
                    <div class="label">Above Average</div>
                </div>
                ` : ''}
                <div class="score-card">
                    <div class="value">${results.recommendations.priority_improvements.length}</div>
                    <div class="label">Priority Areas</div>
                </div>
                <div class="score-card">
                    <div class="value">${results.recommendations.quick_wins.length}</div>
                    <div class="label">Quick Wins</div>
                </div>
            </div>
        </div>
        
        <!-- Detailed Scores -->
        <div class="section">
            <h2>Score Breakdown</h2>
            <table class="scores-table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Score</th>
                        <th>Performance</th>
                        ${results.normalizedScores ? '<th>vs Competitors</th>' : ''}
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(results.mainAnalysis.scores).map(([metric, score]) => `
                    <tr>
                        <td>${metricNames[metric] || metric.replace('_', ' ')}</td>
                        <td><strong>${score.toFixed(1)}/10</strong></td>
                        <td>
                            <div class="score-bar">
                                <div class="score-fill ${score >= 8 ? 'score-high' : score >= 6 ? 'score-medium' : 'score-low'}" 
                                     style="width: ${(score / 10) * 100}%"></div>
                            </div>
                        </td>
                        ${results.normalizedScores && results.normalizedScores[metric] ? `
                        <td>${results.normalizedScores[metric].interpretation}</td>
                        ` : ''}
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <!-- Detailed Analysis -->
        <div class="section">
            <h2>Detailed Analysis</h2>
            ${Object.entries(results.mainAnalysis.analysis).map(([metric, analysis]) => `
            <div class="analysis-section">
                <div class="metric-title">${metricNames[metric] || metric.replace('_', ' ')} (${results.mainAnalysis.scores[metric].toFixed(1)}/10)</div>
                <div class="metric-text">${analysis}</div>
            </div>
            `).join('')}
        </div>
        
        <!-- Recommendations -->
        <div class="section">
            <h2>Strategic Recommendations</h2>
            
            <div class="recommendations">
                <h3>Overall Strategy</h3>
                <p>${results.recommendations.overall_strategy}</p>
            </div>
            
            ${results.recommendations.priority_improvements.length > 0 ? `
            <div class="recommendations" style="margin-top: 15px;">
                <h3>Priority Improvements</h3>
                <ul>
                    ${results.recommendations.priority_improvements.map(improvement => `
                    <li>
                        <strong>${metricNames[improvement.metric] || improvement.metric.replace('_', ' ')}</strong> 
                        (${improvement.current_score.toFixed(1)} → ${improvement.target_score.toFixed(1)}): 
                        ${improvement.recommendation}
                        ${improvement.example ? ` <em>Example: ${improvement.example}</em>` : ''}
                    </li>
                    `).join('')}
                </ul>
            </div>
            ` : ''}
            
            ${results.recommendations.quick_wins.length > 0 ? `
            <div class="recommendations" style="margin-top: 15px;">
                <h3>Quick Wins</h3>
                <ul>
                    ${results.recommendations.quick_wins.map(win => `<li>${win}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            
            ${results.recommendations.competitive_advantages.length > 0 ? `
            <div class="competitive-advantages">
                <h3>Competitive Advantages</h3>
                <ul style="list-style-type: none; padding-left: 0;">
                    ${results.recommendations.competitive_advantages.map(advantage => `
                    <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">
                        <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">★</span>
                        ${advantage}
                    </li>
                    `).join('')}
                </ul>
            </div>
            ` : ''}
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>Generated by QuantiPackAI Design Analyzer | ${timestamp}</p>
            <p>This report provides AI-generated recommendations based on visual analysis. Results should be considered alongside professional design expertise.</p>
        </div>
    </div>
</body>
</html>
  `;
};