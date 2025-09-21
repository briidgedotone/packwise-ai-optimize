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
      // Execute the analysis first
      const result = await executeAnalysis();
      
      // If analysis succeeded, consume the token
      try {
        await consumeToken({
          analysisType,
          analysisId: result?.analysisId
        });

        // Notify about successful token consumption
        console.log('Token consumed successfully, triggering refresh');

        // Force refresh of token balance queries by triggering a re-render
        setRefreshTrigger(prev => prev + 1);

        // Dispatch a custom event to notify dashboard of token consumption
        window.dispatchEvent(new CustomEvent('tokenConsumed', {
          detail: { analysisType, timestamp: Date.now() }
        }));

        // Show remaining tokens (calculate manually since we just consumed one)
        const remaining = (tokenBalance?.remainingTokens || 1) - 1;
        if (remaining <= 2 && remaining > 0) {
          toast.warning(`Only ${remaining} token${remaining === 1 ? '' : 's'} remaining`);
        } else if (remaining === 0) {
          toast.warning('That was your last token! Please purchase more to continue.');
        }

        // Add a small delay to ensure backend updates propagate and trigger another refresh
        setTimeout(() => {
          setRefreshTrigger(prev => prev + 1);
          window.dispatchEvent(new CustomEvent('tokenConsumed', {
            detail: { analysisType, timestamp: Date.now() }
          }));
        }, 1000);
      } catch (tokenError) {
        console.error('Failed to consume token:', tokenError);
        // Analysis succeeded but token consumption failed - let it pass
      }
      
      return { success: true, result };
    } catch (error: any) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed', {
        description: error.message || 'An error occurred during analysis'
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