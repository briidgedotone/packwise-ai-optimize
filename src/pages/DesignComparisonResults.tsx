import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AIAssistant } from '@/components/AIAssistant';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { Button } from '@/components/ui/button';
import {
  Award, Trophy, FileDown, ArrowLeft, Eye,
  BarChart3, Target, TrendingUp, AlertCircle,
  CheckCircle2, Download, Copy, MessageSquare,
  Scale, Star, Zap, Shield, Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';

interface ComparisonResults {
  category: string;
  assumptions: string[];
  weights_used: Record<string, number>;
  designs: Array<{
    id: string;
    scores: Record<string, number>;
    weighted_total: number;
    strengths: string[];
    risks: string[];
    recommendations: string[];
  }>;
  winner: {
    id: string;
    reason: string;
  };
  opportunities_shared_across_designs: string[];
  confidence: number;
}

interface DesignImage {
  id: string;
  preview: string;
  variant?: string;
  productName?: string;
}

const DesignComparisonResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<ComparisonResults | null>(null);
  const [images, setImages] = useState<DesignImage[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed' | 'json'>('summary');
  const { isOpen: isAIOpen, openAssistant, closeAssistant, toggleAssistant } = useAIAssistant();

  useEffect(() => {
    const storedResults = sessionStorage.getItem('designComparisonResults');
    const storedImages = sessionStorage.getItem('designComparisonImages');
    if (storedResults && storedImages) {
      setResults(JSON.parse(storedResults));
      setImages(JSON.parse(storedImages));
    } else {
      toast.error('No comparison results found');
      navigate('/');
    }
  }, [navigate]);

  const downloadJSON = () => {
    if (!results) return;
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `design-comparison-${results.category.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('JSON results downloaded');
  };

  const copyJSONToClipboard = () => {
    if (!results) return;
    
    navigator.clipboard.writeText(JSON.stringify(results, null, 2));
    toast.success('JSON copied to clipboard');
  };

  const generateExecutiveSummary = (results: ComparisonResults) => {
    const winner = results.designs.find(d => d.id === results.winner.id);
    const sortedDesigns = [...results.designs].sort((a, b) => b.weighted_total - a.weighted_total);
    
    return [
      `${winner?.id.replace('_', ' ').toUpperCase()} wins with ${winner?.weighted_total.toFixed(1)}/10 overall score, ${results.winner.reason.toLowerCase()}`,
      `Analysis covers ${results.designs.length} designs in ${results.category} category with ${results.confidence * 100}% confidence`,
      `Key differentiators: ${Object.entries(results.weights_used).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([key, weight]) => `${key} (${Math.round(weight * 100)}%)`).join(', ')}`,
      `Biggest gaps: ${sortedDesigns[0].recommendations.slice(0, 2).join(', ').toLowerCase()}`,
      `Universal opportunity: ${results.opportunities_shared_across_designs[0]?.toLowerCase() || 'Optimize for omni-channel performance'}`
    ];
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    if (score >= 4) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <CheckCircle2 className="h-4 w-4" />;
    if (score >= 6) return <Target className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  if (!results || !images) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading comparison results...</p>
        </div>
      </div>
    );
  }

  const executiveSummary = generateExecutiveSummary(results);
  const winnerDesign = results.designs.find(d => d.id === results.winner.id);
  const winnerImage = images.find(img => img.id === results.winner.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-medium text-gray-900">Design Comparison Results</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {results.category} • {results.designs.length} designs analyzed • {results.confidence * 100}% confidence
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={copyJSONToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copy JSON
              </Button>
              <Button variant="outline" onClick={openAssistant}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Ask AI
              </Button>
              <Button onClick={downloadJSON}>
                <Download className="h-4 w-4 mr-2" />
                Download Results
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Winner Announcement */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {results.winner.id.replace(/_/g, ' ').toUpperCase()} WINS
                </h2>
                <p className="text-gray-700 mt-1">{results.winner.reason}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium text-gray-900">
                    {winnerDesign?.weighted_total.toFixed(1)}/10 Overall Score
                  </span>
                </div>
              </div>
            </div>
            {winnerImage && (
              <div className="relative">
                <img
                  src={winnerImage.preview}
                  alt="Winner"
                  className="w-24 h-24 object-cover rounded-lg shadow-lg border-2 border-yellow-300"
                />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Award className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-100 mb-6">
          <div className="border-b border-gray-100">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'summary', label: 'Executive Summary', icon: Eye },
                { id: 'detailed', label: 'Detailed Scores', icon: BarChart3 },
                { id: 'json', label: 'JSON Export', icon: FileDown }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'summary' && (
              <div className="space-y-6">
                {/* Executive Summary */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Executive Summary
                  </h3>
                  <ul className="space-y-2">
                    {executiveSummary.map((point, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Design Overview */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Scale className="h-5 w-5 text-indigo-500" />
                    Design Rankings
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {results.designs
                      .sort((a, b) => b.weighted_total - a.weighted_total)
                      .map((design, index) => {
                        const image = images.find(img => img.id === design.id);
                        return (
                          <div key={design.id} className={`relative p-4 rounded-lg border-2 ${
                            design.id === results.winner.id 
                              ? 'border-yellow-300 bg-yellow-50' 
                              : 'border-gray-200 bg-white'
                          }`}>
                            {design.id === results.winner.id && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                                <Award className="h-3 w-3 text-white" />
                              </div>
                            )}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="text-lg font-bold text-gray-600">#{index + 1}</div>
                              {image && (
                                <img
                                  src={image.preview}
                                  alt={design.id}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {design.id.replace(/_/g, ' ').toUpperCase()}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {image?.variant || 'Design variant'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-gray-900">
                                {design.weighted_total.toFixed(1)}
                              </span>
                              <span className="text-sm text-gray-500">/10</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Shared Opportunities */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Universal Improvements
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {results.opportunities_shared_across_designs.map((opportunity, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Zap className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-green-800">{opportunity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'detailed' && (
              <div className="space-y-6">
                {/* Scoring Criteria Weights */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Scoring Weights Used</h3>
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 text-sm">
                    {Object.entries(results.weights_used)
                      .sort((a, b) => b[1] - a[1])
                      .map(([criterion, weight]) => (
                        <div key={criterion} className="flex justify-between p-2 bg-gray-50 rounded">
                          <span className="capitalize font-medium">{criterion}</span>
                          <span className="text-indigo-600">{Math.round(weight * 100)}%</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Detailed Scores */}
                {results.designs
                  .sort((a, b) => b.weighted_total - a.weighted_total)
                  .map((design) => {
                    const image = images.find(img => img.id === design.id);
                    return (
                      <div key={design.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            {image && (
                              <img
                                src={image.preview}
                                alt={design.id}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            )}
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">
                                {design.id.replace('_', ' ').toUpperCase()}
                              </h3>
                              <p className="text-gray-600">{image?.variant || 'Design variant'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900">
                              {design.weighted_total.toFixed(1)}
                            </div>
                            <div className="text-sm text-gray-500">Overall Score</div>
                          </div>
                        </div>

                        {/* Individual Scores */}
                        <div className="grid gap-3 md:grid-cols-2 mb-6">
                          {Object.entries(design.scores).map(([criterion, score]) => (
                            <div key={criterion} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                {getScoreIcon(score)}
                                <span className="font-medium capitalize">{criterion}</span>
                              </div>
                              <div className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(score)}`}>
                                {score.toFixed(1)}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Strengths, Risks, Recommendations */}
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              Strengths
                            </h4>
                            <ul className="space-y-1 text-sm">
                              {design.strengths.map((strength, index) => (
                                <li key={index} className="text-green-800">• {strength}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-orange-700 mb-2 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              Risks
                            </h4>
                            <ul className="space-y-1 text-sm">
                              {design.risks.map((risk, index) => (
                                <li key={index} className="text-orange-800">• {risk}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4" />
                              Recommendations
                            </h4>
                            <ul className="space-y-1 text-sm">
                              {design.recommendations.map((rec, index) => (
                                <li key={index} className="text-blue-800">• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {activeTab === 'json' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">JSON Export</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={copyJSONToClipboard}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadJSON}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">{JSON.stringify(results, null, 2)}</pre>
                </div>
                <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <strong>Schema Validation:</strong> This JSON follows the exact Product Packaging Design Comparator v1.3 specification and can be parsed by downstream code for automated workflows.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Assumptions */}
        {results.assumptions.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Analysis Assumptions
            </h3>
            <ul className="space-y-1 text-sm text-amber-700">
              {results.assumptions.map((assumption, index) => (
                <li key={index}>• {assumption}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Floating AI Assistant Button */}
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
          <Button
            onClick={toggleAssistant}
            className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </div>

        {/* AI Assistant */}
        <AIAssistant 
          isOpen={isAIOpen}
          onClose={closeAssistant}
          currentFeature="design-comparator"
          analysisResults={results}
        />
      </div>
    </div>
  );
};

export default DesignComparisonResults;