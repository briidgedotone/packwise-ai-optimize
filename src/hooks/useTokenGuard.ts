import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useTokenGuard = () => {
  const navigate = useNavigate();
  const tokenBalance = useQuery(api.tokens.getTokenBalance);
  const canUseToken = useQuery(api.tokens.canUseToken);
  const consumeToken = useMutation(api.tokens.consumeToken);
  const subscriptionStatus = useQuery(api.tokens.getSubscriptionStatus);

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
        
        // Show remaining tokens
        const remaining = (tokenBalance?.remainingTokens || 1) - 1;
        if (remaining <= 2 && remaining > 0) {
          toast.warning(`Only ${remaining} token${remaining === 1 ? '' : 's'} remaining`);
        } else if (remaining === 0) {
          toast.warning('That was your last token! Please purchase more to continue.');
        }
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

  return {
    checkAndConsumeToken,
    showTokenStatus,
    tokenBalance,
    canUseToken,
    subscriptionStatus
  };
};