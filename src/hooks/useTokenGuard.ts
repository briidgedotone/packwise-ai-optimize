import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';

export const useTokenGuard = () => {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Force refresh queries after token consumption
  const tokenBalance = useQuery(api.tokens.getTokenBalance, {}, { skip: false });
  const canUseToken = useQuery(api.tokens.canUseToken, {}, { skip: false });
  const consumeToken = useMutation(api.tokens.consumeToken);
  const subscriptionStatus = useQuery(api.tokens.getSubscriptionStatus, {}, { skip: false });

  const checkAndConsumeToken = async (
    analysisType: 'suite_analyzer' | 'spec_generator' | 'demand_planner' | 'pdp_analyzer',
    executeAnalysis: () => Promise<any>
  ) => {
    // Check if user has tokens
    if (!canUseToken) {
      toast.error(
        'No tokens available',
        {
          description: 'You need tokens to run analyses. Please upgrade your plan.',
          action: {
            label: 'Upgrade',
            onClick: () => navigate('/onboarding')
          }
        }
      );
      return { success: false, error: 'NO_TOKENS' };
    }

    try {
      // CONSUME TOKEN FIRST (before running analysis) to prevent race conditions
      let tokenConsumed = false;
      try {
        await consumeToken({
          analysisType,
          analysisId: undefined // Will be set later if needed
        });
        tokenConsumed = true;
        console.log('Token consumed successfully before analysis');
      } catch (tokenError: any) {
        console.error('Failed to consume token:', tokenError);
        toast.error(
          'Unable to consume token',
          {
            description: tokenError.message || 'Please try again or upgrade your plan.',
            action: {
              label: 'Upgrade',
              onClick: () => navigate('/onboarding')
            }
          }
        );
        return { success: false, error: tokenError.message || 'TOKEN_CONSUMPTION_FAILED' };
      }

      // Now execute the analysis (only if token was successfully consumed)
      try {
        const result = await executeAnalysis();

        // Notify about successful analysis
        console.log('Analysis completed successfully, triggering refresh');

        // Force refresh of token balance queries
        setRefreshTrigger(prev => prev + 1);

        // Dispatch a custom event to notify dashboard of token consumption
        window.dispatchEvent(new CustomEvent('tokenConsumed', {
          detail: { analysisType, timestamp: Date.now() }
        }));

        // Show remaining tokens
        const remaining = Math.max(0, (tokenBalance?.remainingTokens || 0) - 1);
        if (remaining <= 2 && remaining > 0) {
          toast.warning(`Only ${remaining} token${remaining === 1 ? '' : 's'} remaining`);
        } else if (remaining === 0) {
          toast.warning('That was your last token! Please purchase more to continue.');
        }

        // Add a small delay to ensure backend updates propagate
        setTimeout(() => {
          setRefreshTrigger(prev => prev + 1);
          window.dispatchEvent(new CustomEvent('tokenConsumed', {
            detail: { analysisType, timestamp: Date.now() }
          }));
        }, 1000);

        return { success: true, result };
      } catch (error: any) {
        console.error('Analysis failed after token consumption:', error);
        toast.error('Analysis failed', {
          description: 'Your token was consumed but the analysis failed. Please contact support if this persists.'
        });
        return { success: false, error: error.message };
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast.error('Analysis failed', {
        description: error.message || 'An unexpected error occurred'
      });
      return { success: false, error: error.message };
    }
  };

  const showTokenStatus = () => {
    if (!tokenBalance) return;

    const remaining = tokenBalance.remainingTokens;
    const total = tokenBalance.monthlyTokens + tokenBalance.additionalTokens;

    return {
      remaining,
      total,
      used: tokenBalance.usedTokens,
      percentage: (tokenBalance.usedTokens / total) * 100,
      isLow: remaining <= 5,
      isEmpty: remaining === 0
    };
  };

  // Manual refresh function to force re-query
  const refreshTokenBalance = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return {
    checkAndConsumeToken,
    showTokenStatus,
    refreshTokenBalance,
    tokenBalance,
    canUseToken,
    subscriptionStatus
  };
};