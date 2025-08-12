import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';

export const TestAPIConnection = () => {
  const [result, setResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const testAPI = useAction(api.specGenerator.testAPIConnection);

  const handleTest = async () => {
    setTesting(true);
    try {
      const response = await testAPI();
      setResult(response);
    } catch (error) {
      setResult({ success: false, error: error instanceof Error ? error.message : 'Test failed' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">API Connection Test</h3>
      
      <Button 
        onClick={handleTest} 
        disabled={testing}
        className="mb-4"
      >
        {testing ? 'Testing...' : 'Test OpenAI API'}
      </Button>

      {result && (
        <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
          <p className={`font-semibold ${result.success ? 'text-green-700' : 'text-red-700'}`}>
            {result.success ? '✅ Success' : '❌ Failed'}
          </p>
          <p className="text-sm mt-2">
            {result.success ? result.message : result.error}
          </p>
          {result.response && (
            <p className="text-sm mt-2 text-gray-600">
              Response: {result.response}
            </p>
          )}
        </div>
      )}
    </div>
  );
};