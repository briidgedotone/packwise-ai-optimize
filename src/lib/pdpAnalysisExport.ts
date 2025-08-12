import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDPAnalysisResult {
  mainAnalysis: {
    label: string;
    scores: Record<string, number>;
    analysis: Record<string, string>;
    visualElements: {
      logo_position: string;
      primary_colors: string[];
      text_hierarchy: string;
      featured_claims: string[];
      design_style: string;
    };
  };
  competitorAnalyses: Array<{
    label: string;
    scores: Record<string, number>;
    analysis: Record<string, string>;
    visualElements: {
      logo_position: string;
      primary_colors: string[];
      text_hierarchy: string;
      featured_claims: string[];
      design_style: string;
    };
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

interface ImageData {
  mainPDP?: {
    file: {
      name: string;
      size: number;
      type: string;
    };
    dataUrl: string;
  };
  competitors: Array<{
    file: {
      name: string;
      size: number;
      type: string;
    };
    dataUrl: string;
  }>;
}

export const exportPDPAnalysisToPDF = async (
  results: PDPAnalysisResult,
  imageData: ImageData | null
): Promise<void> => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add page breaks
    const checkPageBreak = (neededHeight: number) => {
      if (yPosition + neededHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
    };

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return lines.length * (fontSize * 0.35); // Return height used
    };

    // Title Page
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PDP Analysis Report', pageWidth / 2, yPosition + 20, { align: 'center' });
    
    yPosition += 40;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated on: ${new Date(results.timestamp).toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 20;
    const overallScore = Object.values(results.mainAnalysis.scores).reduce((a, b) => a + b, 0) / Object.keys(results.mainAnalysis.scores).length;
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Overall Performance Score: ${overallScore.toFixed(1)}/10`, pageWidth / 2, yPosition, { align: 'center' });

    // Summary Statistics
    yPosition += 30;
    checkPageBreak(60);
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', margin, yPosition);
    yPosition += 15;

    const aboveAverage = Object.values(results.mainAnalysis.scores).filter(s => s >= 7).length;
    const totalMetrics = Object.keys(results.mainAnalysis.scores).length;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const summaryText = `
• Analyzed ${totalMetrics} key performance metrics
• ${aboveAverage} metrics performing above average (7.0+)
• ${results.recommendations.priority_improvements.length} priority improvement areas identified
• ${results.recommendations.quick_wins.length} quick wins available
• ${results.competitorAnalyses.length} competitor${results.competitorAnalyses.length !== 1 ? 's' : ''} analyzed for benchmarking
    `.trim();
    
    const summaryHeight = addWrappedText(summaryText, margin, yPosition, contentWidth);
    yPosition += summaryHeight + 20;

    // Main PDP Analysis
    checkPageBreak(80);
    pdf.addPage();
    yPosition = margin;
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Main PDP Performance Analysis', margin, yPosition);
    yPosition += 20;

    // Add main PDP image if available
    if (imageData?.mainPDP) {
      try {
        const imgWidth = 60;
        const imgHeight = 60;
        pdf.addImage(imageData.mainPDP.dataUrl, 'JPEG', margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      } catch (error) {
        console.warn('Could not add main PDP image to PDF:', error);
      }
    }

    // Performance Scores
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Performance Scores', margin, yPosition);
    yPosition += 15;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    Object.entries(results.mainAnalysis.scores).forEach(([metric, score]) => {
      checkPageBreak(20);
      
      const metricName = metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      pdf.text(`${metricName}: ${score.toFixed(1)}/10`, margin, yPosition);
      
      // Score bar visualization
      const barWidth = 50;
      const barHeight = 3;
      const scorePercent = score / 10;
      
      // Background bar
      pdf.setFillColor(230, 230, 230);
      pdf.rect(margin + 80, yPosition - 2, barWidth, barHeight, 'F');
      
      // Score bar
      const color = score >= 7 ? [34, 197, 94] : score >= 5 ? [251, 191, 36] : [239, 68, 68];
      pdf.setFillColor(color[0], color[1], color[2]);
      pdf.rect(margin + 80, yPosition - 2, barWidth * scorePercent, barHeight, 'F');
      
      yPosition += 12;
    });

    // Visual Elements Analysis
    yPosition += 15;
    checkPageBreak(80);
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Visual Elements Analysis', margin, yPosition);
    yPosition += 15;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const visualElements = [
      `Design Style: ${results.mainAnalysis.visualElements.design_style}`,
      `Logo Position: ${results.mainAnalysis.visualElements.logo_position}`,
      `Primary Colors: ${results.mainAnalysis.visualElements.primary_colors.join(', ')}`,
      `Text Hierarchy: ${results.mainAnalysis.visualElements.text_hierarchy}`,
      `Featured Claims: ${results.mainAnalysis.visualElements.featured_claims.join(', ')}`
    ];

    visualElements.forEach(element => {
      checkPageBreak(10);
      const height = addWrappedText(`• ${element}`, margin, yPosition, contentWidth, 10);
      yPosition += height + 5;
    });

    // Competitor Analysis
    if (results.competitorAnalyses.length > 0) {
      yPosition += 20;
      checkPageBreak(60);
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Competitive Benchmark', margin, yPosition);
      yPosition += 20;

      results.competitorAnalyses.forEach((competitor, index) => {
        checkPageBreak(40);
        
        const competitorScore = Object.values(competitor.scores).reduce((a, b) => a + b, 0) / Object.keys(competitor.scores).length;
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${competitor.label}`, margin, yPosition);
        pdf.text(`Score: ${competitorScore.toFixed(1)}/10`, margin + 100, yPosition);
        yPosition += 15;

        // Add competitor image if available
        if (imageData?.competitors[index]) {
          try {
            const imgWidth = 30;
            const imgHeight = 30;
            pdf.addImage(imageData.competitors[index].dataUrl, 'JPEG', margin, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 10;
          } catch (error) {
            console.warn(`Could not add competitor ${index} image to PDF:`, error);
          }
        } else {
          yPosition += 10;
        }
      });
    }

    // Recommendations
    pdf.addPage();
    yPosition = margin;
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Strategic Recommendations', margin, yPosition);
    yPosition += 20;

    // Overall Strategy
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Overall Strategy', margin, yPosition);
    yPosition += 15;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const strategyHeight = addWrappedText(results.recommendations.overall_strategy, margin, yPosition, contentWidth, 10);
    yPosition += strategyHeight + 20;

    // Priority Improvements
    checkPageBreak(40);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Priority Improvements', margin, yPosition);
    yPosition += 15;

    results.recommendations.priority_improvements.forEach((improvement, index) => {
      checkPageBreak(60);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      const improvementTitle = `${index + 1}. ${improvement.metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
      pdf.text(improvementTitle, margin, yPosition);
      yPosition += 12;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Current Score: ${improvement.current_score.toFixed(1)} → Target Score: ${improvement.target_score.toFixed(1)}`, margin + 5, yPosition);
      yPosition += 10;

      const recHeight = addWrappedText(improvement.recommendation, margin + 5, yPosition, contentWidth - 5, 10);
      yPosition += recHeight + 5;

      pdf.setFont('helvetica', 'italic');
      const exampleHeight = addWrappedText(`Example: ${improvement.example}`, margin + 5, yPosition, contentWidth - 5, 9);
      yPosition += exampleHeight + 15;
    });

    // Quick Wins
    checkPageBreak(60);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Quick Wins', margin, yPosition);
    yPosition += 15;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    results.recommendations.quick_wins.forEach((win, index) => {
      checkPageBreak(15);
      const winHeight = addWrappedText(`${index + 1}. ${win}`, margin, yPosition, contentWidth, 10);
      yPosition += winHeight + 8;
    });

    // Competitive Advantages
    yPosition += 10;
    checkPageBreak(60);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Competitive Advantages', margin, yPosition);
    yPosition += 15;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    results.recommendations.competitive_advantages.forEach((advantage, index) => {
      checkPageBreak(15);
      const advHeight = addWrappedText(`${index + 1}. ${advantage}`, margin, yPosition, contentWidth, 10);
      yPosition += advHeight + 8;
    });

    // Footer on last page
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Generated by QuantiPackAI - PDP Visual Intelligence', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Save the PDF
    const fileName = `PDP_Analysis_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
};