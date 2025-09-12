import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Eye, Download, ArrowLeft, RefreshCw, TrendingUp, Award,
  Target, Zap, Package,
  AlertTriangle, CheckCircle, Star, BarChart3,
  Palette, Type, Image as ImageIcon, ArrowRight, ArrowUpRight, Sparkles,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { exportPDPAnalysisToPDF } from '@/lib/pdpAnalysisExport';
import { designSystem } from '@/lib/design-system';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'recommendations'>('overview');
  const [results, setResults] = useState<PDPAnalysisResult | null>(null);
  // const [metaInfo, setMetaInfo] = useState<any>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);

  useEffect(() => {
    const storedResults = sessionStorage.getItem('pdpAnalysisResults');
    // const storedMetaInfo = sessionStorage.getItem('pdpAnalysisMetaInfo');
    const storedImages = sessionStorage.getItem('pdpAnalysisImages');
    
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
    // if (storedMetaInfo) {
    //   setMetaInfo(JSON.parse(storedMetaInfo));
    // }
    if (storedImages) {
      setImageData(JSON.parse(storedImages));
    }
  }, []);

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9FBFC' }}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: designSystem.colors.primary }} />
          <p className="text-gray-600">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  // Apply updated 10-criteria packaging artwork scoring system
  const criteriaWeights = {
    hierarchy: 0.15,          // Visual Hierarchy
    branding: 0.15,           // Brand Prominence & Placement  
    typography: 0.12,         // Typography & Readability
    color: 0.12,              // Color Strategy & Contrast
    imagery: 0.10,            // Imagery Integration & Quality
    messaging: 0.10,          // Messaging Clarity & Claim Placement
    simplicity: 0.08,         // Simplicity & Focus
    balance: 0.08,            // Balance & Composition
    shelf_performance: 0.05,  // Shelf & Omni-Channel Performance
    consistency: 0.05         // Design Consistency & Cohesion
  };

  // Map metric keys to proper display names
  const getMetricDisplayName = (metric: string): string => {
    const metricNames = {
      hierarchy: 'Visual Hierarchy',
      branding: 'Brand Prominence & Placement',
      typography: 'Typography & Readability', 
      color: 'Color Strategy & Contrast',
      imagery: 'Imagery Integration & Quality',
      messaging: 'Messaging Clarity & Claim Placement',
      simplicity: 'Simplicity & Focus',
      balance: 'Balance & Composition',
      shelf_performance: 'Shelf & Omni-Channel Performance',
      consistency: 'Design Consistency & Cohesion'
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
    
    // Calculate weighted score (individual scores are already 0-10, weights sum to 1.0)
    const weightedScore = usedWeight > 0 ? weightedTotal / usedWeight : 0;
    
    return weightedScore;
  };

  const overallScore = Math.round(calculateWeightedScore(results.mainAnalysis.scores) * 10) / 10;
  
  const getScoreGradient = (score: number) => {
    if (score >= 8.5) return 'from-green-500 to-emerald-600';
    if (score >= 7) return 'from-blue-500 to-indigo-600';
    if (score >= 5) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
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
    <div className="min-h-screen" style={{ backgroundColor: '#F9FBFC' }}>
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              className="text-gray-600 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Analyzer
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              className="text-gray-600 hover:bg-gray-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              New Analysis
            </Button>
            <Button
              onClick={exportPDF}
              className="hover:opacity-90 text-white rounded-full"
              style={{ backgroundColor: designSystem.colors.primary }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: designSystem.colors.primary }}>
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-medium text-gray-900">Design Analysis Results</h1>
              <p className="text-sm text-gray-500 mt-1">
                Analysis completed with {results.competitorAnalyses.length} competitor{results.competitorAnalyses.length !== 1 ? 's' : ''} • {new Date(results.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Overall Score */}
          <div className="rounded-xl p-4 border border-gray-200" style={{ backgroundColor: designSystem.colors.primaryLight }}>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">{overallScore.toFixed(1)}</div>
              <div className="text-gray-600 text-lg mb-4">Overall Performance Score</div>
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {Object.values(results.mainAnalysis.scores).filter(s => s >= 7).length}
                  </div>
                  <div className="text-gray-500 text-sm">Above Average</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {results.recommendations.priority_improvements.length}
                  </div>
                  <div className="text-gray-500 text-sm">Priority Areas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {results.recommendations.quick_wins.length}
                  </div>
                  <div className="text-gray-500 text-sm">Quick Wins</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-4">
        <div className="flex items-center gap-2">
          {[
            { id: 'overview', label: 'Visual Overview', icon: ImageIcon },
            { id: 'detailed', label: 'Detailed Analysis', icon: BarChart3 },
            { id: 'recommendations', label: 'Recommendations', icon: Target },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={activeTab === tab.id ? { backgroundColor: designSystem.colors.primary } : {}}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* PDP Visual Comparison */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                  <Package className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">
                  Package Design Analysis
                </h2>
              </div>

              <div>
                {/* Main PDP */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Your PDP</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      {imageData?.mainPDP ? (
                        <img
                          src={imageData.mainPDP.dataUrl}
                          alt="Main PDP"
                          className="w-full rounded-xl shadow-lg"
                        />
                      ) : (
                        <div className="w-full h-96 bg-gray-100 rounded-xl flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">PDP Image</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {/* Score Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(results.mainAnalysis.scores)
                          .slice(0, 4)
                          .map(([metric, score]) => (
                            <div key={metric} className="bg-gray-50 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">
                                  {metric.replace(/_/g, ' ')}
                                </span>
                                <span className={`text-lg font-bold ${score >= 7 ? 'text-green-600' : score >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {score.toFixed(1)}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full bg-gradient-to-r ${getScoreGradient(score)}`}
                                  style={{ width: `${(score / 10) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Visual Elements */}
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Visual Elements</h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Palette className="h-5 w-5 text-indigo-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Primary Colors</p>
                              <div className="flex gap-2 mt-1">
                                {results.mainAnalysis.visualElements.primary_colors.map((color, i) => (
                                  <span key={i} className="px-2 py-1 bg-white rounded text-xs">
                                    {color}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Type className="h-5 w-5 text-indigo-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Design Style</p>
                              <p className="text-sm text-gray-600 mt-1">{results.mainAnalysis.visualElements.design_style}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Competitor PDPs */}
                {results.competitorAnalyses.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Competitive Benchmark</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {results.competitorAnalyses.map((competitor, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
                        >
                          {imageData?.competitors[index] ? (
                            <img
                              src={imageData.competitors[index].dataUrl}
                              alt={competitor.label}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                              <ImageIcon className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                          <div className="p-3">
                            <h4 className="font-semibold text-gray-900 mb-2">{competitor.label}</h4>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Overall</span>
                              <span className="text-lg font-bold text-indigo-600">
                                {(Math.round(calculateWeightedScore(competitor.scores) * 10) / 10).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Insights */}
            <div className="grid md:grid-cols-3 gap-3">
              {/* Strengths */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-base font-medium text-gray-900">Key Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {results.recommendations.competitive_advantages.slice(0, 3).map((advantage, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{advantage}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-base font-medium text-gray-900">Priority Areas</h3>
                </div>
                <ul className="space-y-2">
                  {results.recommendations.priority_improvements.slice(0, 3).map((improvement, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowUpRight className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{improvement.metric.replace(/_/g, ' ')}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Wins */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-base font-medium text-gray-900">Quick Wins</h3>
                </div>
                <ul className="space-y-2">
                  {results.recommendations.quick_wins.slice(0, 3).map((win, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{win}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Analysis Tab */}
        {activeTab === 'detailed' && (
          <div className="space-y-6">
            {/* Comprehensive Scores */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">Comprehensive Score Analysis</h2>
              </div>
              
              <div>
                <div className="space-y-6">
                  {Object.entries(results.mainAnalysis.scores).map(([metric, score]) => (
                    <div key={metric}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {getMetricDisplayName(metric)}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {results.mainAnalysis.analysis[metric]}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-indigo-600">{score.toFixed(1)}</div>
                          {results.normalizedScores && (
                            <div className="text-sm text-gray-500">
                              {results.normalizedScores[metric]?.interpretation}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full bg-gradient-to-r ${getScoreGradient(score)}`}
                            style={{ width: `${(score / 10) * 100}%` }}
                          />
                        </div>
                        {results.competitorAnalyses.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">vs competitors:</span>
                            {results.competitorAnalyses.map((comp, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded">
                                {comp.label}: {comp.scores[metric]?.toFixed(1) || 'N/A'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {/* Overall Strategy */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">Strategic Recommendations</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">{results.recommendations.overall_strategy}</p>
            </div>

            {/* Priority Improvements */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">Priority Improvements</h2>
              </div>
              
              <div className="space-y-6">
                {results.recommendations.priority_improvements.map((improvement, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {getMetricDisplayName(improvement.metric)}
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Current:</span>
                            <span className="text-lg font-bold text-red-600">{improvement.current_score.toFixed(1)}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Target:</span>
                            <span className="text-lg font-bold text-green-600">{improvement.target_score.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{improvement.recommendation}</p>
                    
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Example:</h4>
                      <p className="text-sm text-gray-700 italic">{improvement.example}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Wins */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-base font-medium text-gray-900">Quick Wins</h3>
                </div>
                <div>
                  <ul className="space-y-3">
                    {results.recommendations.quick_wins.map((win, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-gray-700">{win}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-base font-medium text-gray-900">Competitive Advantages</h3>
                </div>
                <div>
                  <ul className="space-y-3">
                    {results.recommendations.competitive_advantages.map((advantage, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Star className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-gray-700">{advantage}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDPAnalysisResults;