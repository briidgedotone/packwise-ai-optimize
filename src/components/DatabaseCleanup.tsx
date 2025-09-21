import React, { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Trash2, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

interface DatabaseCleanupProps {
  isBackendUnavailable?: boolean;
}

export function DatabaseCleanup({ isBackendUnavailable = false }: DatabaseCleanupProps) {
  const [isCleaningOld, setIsCleaningOld] = useState(false);
  const [isCleaningFailed, setIsCleaningFailed] = useState(false);
  const [isEmergencyCleanup, setIsEmergencyCleanup] = useState(false);
  const [autoCleanupDone, setAutoCleanupDone] = useState(false);

  const cleanupOld = useMutation(api.cleanup.cleanupOldAnalyses);
  const cleanupFailed = useMutation(api.cleanup.cleanupFailedAnalyses);
  const emergencyCleanup = useMutation(api.cleanup.emergencyCleanupAllAnalyses);

  // Disable auto-cleanup when backend is unavailable
  // useEffect(() => {
  //   if (!autoCleanupDone) {
  //     handleCleanupFailed(true); // Pass true to indicate auto-cleanup
  //     setAutoCleanupDone(true);
  //   }
  // }, []);

  const handleCleanupOld = async () => {
    if (isBackendUnavailable) {
      toast.error('Backend is unavailable. Please upgrade your plan or contact support.');
      return;
    }
    
    setIsCleaningOld(true);
    try {
      const result = await cleanupOld({});
      toast.success(result.message);
    } catch (error) {
      toast.error('Backend unavailable - cannot clean data. Please upgrade your plan.');
      console.error(error);
    } finally {
      setIsCleaningOld(false);
    }
  };

  const handleCleanupFailed = async (isAutoCleanup = false) => {
    if (isBackendUnavailable) {
      toast.error('Backend is unavailable. Please upgrade your plan or contact support.');
      return;
    }
    
    setIsCleaningFailed(true);
    try {
      const result = await cleanupFailed({});
      if (!isAutoCleanup) {
        toast.success(result.message);
      } else {
        console.log('Auto-cleanup:', result.message);
      }
    } catch (error) {
      if (!isAutoCleanup) {
        toast.error('Backend unavailable - cannot clean data. Please upgrade your plan.');
      }
      console.error(error);
    } finally {
      setIsCleaningFailed(false);
    }
  };

  const handleEmergencyCleanup = async () => {
    if (isBackendUnavailable) {
      toast.error('Backend is unavailable. Cannot perform cleanup operations.');
      return;
    }
    
    const confirmed = window.confirm(
      'This will delete ALL your analyses to restore backend functionality. This cannot be undone. Continue?'
    );
    
    if (!confirmed) return;
    
    setIsEmergencyCleanup(true);
    try {
      const result = await emergencyCleanup({});
      toast.success(result.message);
      toast.info('Please click "Test Connection" to check if backend is restored');
    } catch (error) {
      toast.error('Backend unavailable - cannot perform emergency cleanup. Please upgrade your plan.');
      console.error(error);
    } finally {
      setIsEmergencyCleanup(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <AlertTriangle className="w-5 h-5" />
            Database Storage Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isBackendUnavailable ? (
              <div className="space-y-3">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ Backend Currently Unavailable
                </p>
                <p className="text-sm text-red-700">
                  Database cleanup functions cannot run when the backend is disabled due to free plan limits. 
                  You need to upgrade to a Pro plan to restore functionality and clean up data.
                </p>
                <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                  <p className="text-sm text-red-800">
                    <strong>To resolve this:</strong> Upgrade to Convex Pro plan ($25/month) which includes:
                  </p>
                  <ul className="text-sm text-red-700 mt-2 list-disc list-inside space-y-1">
                    <li>50GB database storage (100x increase)</li>
                    <li>50GB monthly bandwidth (50x increase)</li>
                    <li>Ability to clean up data and restore functionality</li>
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-orange-800">
                Free up database storage by removing old and failed analyses. This will help keep the application running smoothly within Convex free plan limits.
              </p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-orange-900">Clean Old Analyses</h4>
                <p className="text-xs text-orange-700">Remove analyses older than 60 days</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCleanupOld}
                  disabled={isCleaningOld || isBackendUnavailable}
                  className="w-full border-orange-300 hover:bg-orange-100"
                >
                  {isCleaningOld ? (
                    <>Cleaning...</>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clean Old Data
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-orange-900">Clean Failed Analyses</h4>
                <p className="text-xs text-orange-700">Remove ALL failed analyses immediately</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCleanupFailed()}
                  disabled={isCleaningFailed || isBackendUnavailable}
                  className="w-full border-orange-300 hover:bg-orange-100"
                >
                  {isCleaningFailed ? (
                    <>Cleaning...</>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clean Failed Data
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Emergency Cleanup */}
            <div className="border-t border-orange-300 pt-4">
              <div className="space-y-2">
                <h4 className="font-medium text-red-900">🚨 Emergency Cleanup</h4>
                <p className="text-xs text-red-700">Delete ALL analyses to restore backend immediately (use as last resort)</p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleEmergencyCleanup}
                  disabled={isEmergencyCleanup || isBackendUnavailable}
                  className="w-full"
                >
                  {isEmergencyCleanup ? (
                    <>Cleaning...</>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Emergency Cleanup - Delete All Data
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-orange-100 border border-orange-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-orange-800">
                  <p className="font-medium mb-1">Optimization Tips:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Regularly clean old data to prevent hitting storage limits</li>
                    <li>Consider upgrading to Pro plan for larger projects</li>
                    <li>Use smaller CSV files for testing to reduce data usage</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}