import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import type { Id } from '../../convex/_generated/dataModel';
import { designSystem } from '@/lib/design-system';

interface ProcessingProgress {
  stage: 'parsing' | 'validation' | 'optimization' | 'analysis' | 'complete';
  progress: number;
  currentItem: number;
  totalItems: number;
  message: string;
  timeElapsed: number;
  estimatedTimeRemaining: number;
}

const SuiteAnalysisLoading = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();
  
  const analysisData = useQuery(api.suiteAnalyzerBackend.getAnalysis, 
    analysisId ? { analysisId: analysisId as Id<"analyses"> } : "skip"
  );
  const progressData = useQuery(api.suiteAnalyzerBackend.getAnalysisProgress, 
    analysisId ? { analysisId: analysisId as Id<"analyses"> } : "skip"
  );

  const progress = progressData as ProcessingProgress | null;

  // Navigate to results when analysis completes
  useEffect(() => {
    if (analysisId && analysisData?.status === 'completed') {
      navigate(`/suite-analysis/${analysisId}`);
    }
  }, [analysisId, analysisData?.status, navigate]);

  // Handle failed analysis
  if (analysisData?.status === 'failed') {
    const error = (analysisData.results as any)?.error || 'Analysis failed';
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFBFC' }}>
        <Card className="max-w-md rounded-3xl border-gray-200">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Analysis Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFBFC' }}>
      <div className="max-w-md mx-auto px-4">
        <Card className="bg-white border border-gray-200 rounded-3xl">
          <CardContent className="p-6 text-center">
            {progress ? (
              <div className="space-y-4">
                {/* Loading Icon */}
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: designSystem.colors.primaryLight }}>
                  <Loader2 className="h-8 w-8 animate-spin" style={{ color: designSystem.colors.primary }} />
                </div>
                
                {/* Title and Progress */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Suite</h2>
                  <p className="text-gray-600 text-sm mb-4">{progress.message}</p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ backgroundColor: designSystem.colors.primary }}
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                  
                  {/* Percentage */}
                  <div className="text-sm text-gray-500">{Math.round(progress.progress)}% complete</div>
                </div>
              </div>
            ) : (
              // Initial loading state
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: designSystem.colors.primaryLight }}>
                  <Loader2 className="h-8 w-8 animate-spin" style={{ color: designSystem.colors.primary }} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Starting Analysis</h2>
                  <p className="text-gray-600 text-sm">Please wait while we process your data...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuiteAnalysisLoading;