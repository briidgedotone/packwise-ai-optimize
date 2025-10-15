import jsPDF from 'jspdf';

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

const criteriaWeights = {
  hierarchy: 0.15,
  branding: 0.15,
  typography: 0.12,
  color: 0.12,
  imagery: 0.10,
  messaging: 0.10,
  simplicity: 0.08,
  balance: 0.08,
  shelf_performance: 0.05,
  consistency: 0.05
};

const getMetricDisplayName = (metric: string): string => {
  const metricNames: Record<string, string> = {
    hierarchy: 'Visual Hierarchy',
    branding: 'Brand Prominence',
    typography: 'Typography',
    color: 'Color Strategy',
    imagery: 'Imagery Quality',
    messaging: 'Messaging Clarity',
    simplicity: 'Simplicity',
    balance: 'Balance',
    shelf_performance: 'Shelf Performance',
    consistency: 'Consistency'
  };
  return metricNames[metric] || metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const calculateWeightedScore = (scores: Record<string, number>) => {
  let weightedTotal = 0;
  let usedWeight = 0;

  Object.entries(scores).forEach(([criterion, score]) => {
    const weight = criteriaWeights[criterion as keyof typeof criteriaWeights] || 0;
    if (weight > 0) {
      weightedTotal += score * weight;
      usedWeight += weight;
    }
  });

  return usedWeight > 0 ? weightedTotal / usedWeight : 0;
};

const getScoreLabel = (score: number) => {
  if (score >= 8.5) return 'Excellent';
  if (score >= 7) return 'Good';
  if (score >= 5) return 'Fair';
  return 'Needs Improvement';
};

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
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return lines.length * (fontSize * 0.35); // Return height used
    };

    const overallScore = calculateWeightedScore(results.mainAnalysis.scores);

    // ============ PAGE 1: COVER & OVERVIEW ============
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Design Analysis Report', pageWidth / 2, yPosition + 30, { align: 'center' });

    yPosition += 50;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated on ${new Date(results.timestamp).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })}`, pageWidth / 2, yPosition, { align: 'center' });

    // Overall Score Box
    yPosition += 30;
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(0.5);
    pdf.rect(margin + 20, yPosition, contentWidth - 40, 40);

    yPosition += 15;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Overall Score', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 12;
    pdf.setFontSize(32);
    pdf.setTextColor(59, 130, 246);
    pdf.text(`${overallScore.toFixed(1)}/10`, pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 10;
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(getScoreLabel(overallScore), pageWidth / 2, yPosition, { align: 'center' });

    // Summary Statistics
    yPosition += 40;
    const strongMetrics = Object.values(results.mainAnalysis.scores).filter(s => s >= 7).length;

    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      `✓ ${strongMetrics} strong metrics`,
      `⚠ ${results.recommendations.priority_improvements.length} areas to improve`,
      `🏆 ${results.recommendations.competitive_advantages.length} competitive advantages`
    ];

    const statStartY = yPosition;
    stats.forEach((stat, index) => {
      const xPos = index % 2 === 0 ? margin + 10 : pageWidth / 2 + 10;
      const yPos = statStartY + Math.floor(index / 2) * 10;
      pdf.text(stat, xPos, yPos);
    });

    yPosition += 30;
    if (results.competitorAnalyses.length > 0) {
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Compared against ${results.competitorAnalyses.length} competitor${results.competitorAnalyses.length !== 1 ? 's' : ''}`, pageWidth / 2, yPosition, { align: 'center' });
    }

    // ============ PAGE 2: VISUAL COMPARISON ============
    if (imageData?.mainPDP) {
      pdf.addPage();
      yPosition = margin;

      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Visual Comparison', margin, yPosition);
      yPosition += 15;

      // Main design
      try {
        const imgWidth = 70;
        const imgHeight = 70;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(59, 130, 246);
        pdf.text('Your Design', margin, yPosition);
        yPosition += 5;

        pdf.setDrawColor(59, 130, 246);
        pdf.setLineWidth(1);
        pdf.rect(margin - 2, yPosition - 2, imgWidth + 4, imgHeight + 4);

        pdf.addImage(imageData.mainPDP.dataUrl, 'JPEG', margin, yPosition, imgWidth, imgHeight);

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Score: ${overallScore.toFixed(1)}/10`, margin, yPosition + imgHeight + 8);

        yPosition += imgHeight + 20;
      } catch (error) {
        console.warn('Could not add main PDP image to PDF:', error);
      }

      // Competitors
      if (imageData.competitors.length > 0) {
        yPosition += 10;
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text('Competitors', margin, yPosition);
        yPosition += 10;

        imageData.competitors.forEach((comp, index) => {
          checkPageBreak(65);

          try {
            const imgWidth = 50;
            const imgHeight = 50;
            const compScore = calculateWeightedScore(results.competitorAnalyses[index].scores);

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(70, 70, 70);
            pdf.text(`Competitor ${index + 1}`, margin, yPosition);
            yPosition += 5;

            pdf.setDrawColor(200, 200, 200);
            pdf.setLineWidth(0.5);
            pdf.rect(margin - 2, yPosition - 2, imgWidth + 4, imgHeight + 4);

            pdf.addImage(comp.dataUrl, 'JPEG', margin, yPosition, imgWidth, imgHeight);

            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(0, 0, 0);
            pdf.text(`Score: ${compScore.toFixed(1)}/10`, margin, yPosition + imgHeight + 7);

            yPosition += imgHeight + 15;
          } catch (error) {
            console.warn(`Could not add competitor ${index} image to PDF:`, error);
          }
        });
      }
    }

    // ============ PAGE 3: DETAILED METRICS ============
    pdf.addPage();
    yPosition = margin;

    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Detailed Metrics', margin, yPosition);
    yPosition += 15;

    const sortedMetrics = Object.entries(results.mainAnalysis.scores)
      .sort(([, a], [, b]) => b - a);

    sortedMetrics.forEach(([metric, score]) => {
      checkPageBreak(40);

      // Metric name and score
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(getMetricDisplayName(metric), margin, yPosition);

      const weight = criteriaWeights[metric as keyof typeof criteriaWeights] || 0;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(120, 120, 120);
      pdf.text(`Weight: ${(weight * 100).toFixed(0)}%`, margin, yPosition + 5);

      // Score display
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      const scoreColor = score >= 7 ? [37, 99, 235] : score >= 5 ? [234, 88, 12] : [220, 38, 38];
      pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      pdf.text(`${score.toFixed(1)}`, pageWidth - margin - 30, yPosition + 3);

      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      pdf.text(getScoreLabel(score), pageWidth - margin - 30, yPosition + 9);

      // Progress bar
      yPosition += 12;
      const barWidth = contentWidth - 40;
      const barHeight = 4;
      const scorePercent = score / 10;

      pdf.setFillColor(229, 231, 235);
      pdf.rect(margin, yPosition, barWidth, barHeight, 'F');

      pdf.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      pdf.rect(margin, yPosition, barWidth * scorePercent, barHeight, 'F');

      // Analysis text
      yPosition += 8;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      const analysisHeight = addWrappedText(results.mainAnalysis.analysis[metric], margin, yPosition, contentWidth - 5, 9);
      yPosition += analysisHeight + 10;

      // Check if there's a potential improvement for this metric
      const improvement = results.recommendations.priority_improvements.find(
        imp => imp.metric === metric
      );

      if (improvement) {
        checkPageBreak(35);

        // Potential Improvement box
        const boxPadding = 5;
        const boxStartY = yPosition;

        // Draw box background
        pdf.setFillColor(254, 243, 199); // Light amber background
        pdf.setDrawColor(251, 191, 36); // Amber border
        pdf.setLineWidth(0.3);

        // Calculate box height dynamically
        pdf.setFontSize(9);
        const improvementLines = pdf.splitTextToSize(improvement.recommendation, contentWidth - 15);
        const boxHeight = 15 + (improvementLines.length * 3.2);

        pdf.roundedRect(margin, boxStartY, contentWidth - 5, boxHeight, 2, 2, 'FD');

        // Icon and title
        yPosition += boxPadding + 4;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(146, 64, 14); // Amber-800
        pdf.text('💡 Potential Improvement', margin + boxPadding, yPosition);

        yPosition += 6;

        // Improvement recommendation
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60);
        const impHeight = addWrappedText(improvement.recommendation, margin + boxPadding, yPosition, contentWidth - 15, 9);
        yPosition += impHeight + 3;

        // Target score
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(146, 64, 14);
        pdf.text(`Target Score: ${improvement.current_score.toFixed(1)} → ${improvement.target_score.toFixed(1)}`, margin + boxPadding, yPosition);

        yPosition += boxPadding + 10;
      }

      yPosition += 5;
    });

    // ============ PAGE 4: RECOMMENDATIONS ============
    pdf.addPage();
    yPosition = margin;

    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Recommendations', margin, yPosition);
    yPosition += 15;

    // Overall Strategy
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Overall Strategy', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(40, 40, 40);
    const strategyHeight = addWrappedText(results.recommendations.overall_strategy, margin, yPosition, contentWidth, 10);
    yPosition += strategyHeight + 20;

    // Priority Improvements
    checkPageBreak(50);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Priority Improvements', margin, yPosition);
    yPosition += 10;

    results.recommendations.priority_improvements.forEach((improvement, index) => {
      checkPageBreak(50);

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${index + 1}. ${getMetricDisplayName(improvement.metric)}`, margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Current: ${improvement.current_score.toFixed(1)} → Target: ${improvement.target_score.toFixed(1)}`, margin + 3, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setTextColor(40, 40, 40);
      const recHeight = addWrappedText(improvement.recommendation, margin + 3, yPosition, contentWidth - 3, 10);
      yPosition += recHeight + 5;

      if (improvement.example) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(80, 80, 80);
        const exampleHeight = addWrappedText(`Example: ${improvement.example}`, margin + 3, yPosition, contentWidth - 3, 9);
        yPosition += exampleHeight + 10;
      }
    });

    // Competitive Advantages
    if (results.recommendations.competitive_advantages.length > 0) {
      yPosition += 15;
      checkPageBreak(50);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Your Competitive Advantages', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(40, 40, 40);
      results.recommendations.competitive_advantages.forEach((advantage, index) => {
        checkPageBreak(20);
        const advHeight = addWrappedText(`${index + 1}. ${advantage}`, margin + 3, yPosition, contentWidth - 3, 10);
        yPosition += advHeight + 6;
      });
    }

    // Footer on all pages
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(150, 150, 150);
      pdf.text('QuantiPackAI - Design Analysis Report', margin, pageHeight - 10);
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, pageHeight - 10);
    }

    // Save the PDF
    const fileName = `Design_Analysis_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
};
