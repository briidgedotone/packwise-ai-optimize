import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ArrowDownTrayIcon as Download,
  ArrowLeftIcon as ArrowLeft,
  ArrowPathIcon as RefreshCw,
  CheckCircleIcon as CheckCircle,
  ChartBarIcon as BarChart,
  LightBulbIcon as Lightbulb,
  ExclamationTriangleIcon as AlertTriangle
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { exportPDPAnalysisToPDF } from '@/lib/pdpAnalysisExport';

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

const PDPAnalysisResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<PDPAnalysisResult | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  useEffect(() => {
    const storedResults = sessionStorage.getItem('pdpAnalysisResults');
    const storedImages = sessionStorage.getItem('pdpAnalysisImages');

    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
    if (storedImages) {
      setImageData(JSON.parse(storedImages));
    }
  }, []);

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading analysis...</p>
        </div>
      </div>
    );
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
    const metricNames = {
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
    return metricNames[metric as keyof typeof metricNames] || metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

  const overallScore = calculateWeightedScore(results.mainAnalysis.scores);

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-green-600';
    if (score >= 7) return 'text-blue-600';
    if (score >= 5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8.5) return 'Excellent';
    if (score >= 7) return 'Good';
    if (score >= 5) return 'Fair';
    return 'Needs Improvement';
  };

  const exportPDF = async () => {
    if (!results) {
      toast.error('No analysis results to export');
      return;
    }

    try {
      toast.info('Generating PDF report...');
      await exportPDPAnalysisToPDF(results, imageData);
      toast.success('PDF report downloaded successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to generate PDF report');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">PDP Analysis Results</h1>
                <p className="text-sm text-gray-500">
                  {new Date(results.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
              <Button
                onClick={exportPDF}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Score Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Overall Score: <span className={getScoreColor(overallScore)}>{overallScore.toFixed(1)}</span>/10
              </h2>
              <p className="text-gray-600">{getScoreLabel(overallScore)} — Your Design</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Compared against</div>
              <div className="text-2xl font-bold text-gray-900">{results.competitorAnalyses.length}</div>
              <div className="text-sm text-gray-500">competitor{results.competitorAnalyses.length !== 1 ? 's' : ''}</div>
            </div>
          </div>

          {/* Performance Summary Bar */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">
                <span className="font-semibold">{Object.values(results.mainAnalysis.scores).filter(s => s >= 7).length}</span> strong metrics
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="text-gray-700">
                <span className="font-semibold">{results.recommendations.priority_improvements.length}</span> areas to improve
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700">
                <span className="font-semibold">{results.recommendations.quick_wins.length}</span> quick wins
              </span>
            </div>
          </div>
        </div>

        {/* Images Comparison */}
        {imageData?.mainPDP && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Visual Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Your Design */}
              <div className="border-2 border-blue-600 rounded-lg overflow-hidden">
                <div className="bg-blue-600 text-white px-4 py-2 text-sm font-medium">
                  Your Design — {overallScore.toFixed(1)}/10
                </div>
                <div className="p-4 bg-gray-50">
                  <img
                    src={imageData.mainPDP.dataUrl}
                    alt="Your Design"
                    className="w-full h-48 object-contain"
                  />
                </div>
              </div>

              {/* Competitors */}
              {imageData.competitors.map((comp, index) => {
                const compScore = calculateWeightedScore(results.competitorAnalyses[index].scores);
                return (
                  <div key={index} className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-700 text-white px-4 py-2 text-sm font-medium">
                      Competitor {index + 1} — {compScore.toFixed(1)}/10
                    </div>
                    <div className="p-4 bg-gray-50">
                      <img
                        src={comp.dataUrl}
                        alt={`Competitor ${index + 1}`}
                        className="w-full h-48 object-contain"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart className="h-6 w-6 text-gray-900" />
            <h2 className="text-lg font-semibold text-gray-900">Detailed Metrics</h2>
          </div>

          <div className="space-y-4">
            {Object.entries(results.mainAnalysis.scores)
              .sort(([, a], [, b]) => b - a)
              .map(([metric, score]) => {
                const weight = criteriaWeights[metric as keyof typeof criteriaWeights] || 0;
                const isExpanded = selectedMetric === metric;

                return (
                  <div
                    key={metric}
                    className={`border rounded-lg transition-all ${
                      isExpanded ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedMetric(isExpanded ? null : metric)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{getMetricDisplayName(metric)}</span>
                          <span className="text-xs text-gray-500">Weight: {(weight * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right mr-4">
                          <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                            {score.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500">{getScoreLabel(score)}</div>
                        </div>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${(score / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-4 border-t border-gray-200">
                        <p className="text-sm text-gray-700 mt-4 leading-relaxed">
                          {results.mainAnalysis.analysis[metric]}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="h-6 w-6 text-gray-900" />
            <h2 className="text-lg font-semibold text-gray-900">Recommendations</h2>
          </div>

          {/* Overall Strategy */}
          <div className="mb-8">
            <h3 className="font-medium text-gray-900 mb-3">Overall Strategy</h3>
            <p className="text-gray-700 leading-relaxed">{results.recommendations.overall_strategy}</p>
          </div>

          {/* Quick Wins */}
          {results.recommendations.quick_wins.length > 0 && (
            <div className="mb-8">
              <h3 className="font-medium text-gray-900 mb-3">Quick Wins</h3>
              <div className="space-y-2">
                {results.recommendations.quick_wins.map((win, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 text-sm">{win}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Priority Improvements */}
          {results.recommendations.priority_improvements.length > 0 && (
            <div className="mb-8">
              <h3 className="font-medium text-gray-900 mb-3">Priority Improvements</h3>
              <div className="space-y-4">
                {results.recommendations.priority_improvements.map((improvement, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{getMetricDisplayName(improvement.metric)}</h4>
                      <div className="text-sm text-gray-600">
                        {improvement.current_score.toFixed(1)} → {improvement.target_score.toFixed(1)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{improvement.recommendation}</p>
                    {improvement.example && (
                      <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                        <p className="text-xs text-gray-600 font-medium mb-1">Example:</p>
                        <p className="text-sm text-gray-700">{improvement.example}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competitive Advantages */}
          {results.recommendations.competitive_advantages.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Your Competitive Advantages</h3>
              <div className="space-y-2">
                {results.recommendations.competitive_advantages.map((advantage, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm">{advantage}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDPAnalysisResults;
