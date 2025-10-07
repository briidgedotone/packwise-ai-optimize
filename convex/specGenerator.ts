import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

// Simple test action to verify API connectivity
export const testAPIConnection = action({
  args: {},
  handler: async () => {
    console.log('Starting API test...');
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return { success: false, error: "No API key found" };
    }
    
    try {
      // Test 1: Simple message
      console.log("Test 1: Simple API call...");
      const simpleResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Say test' }],
          max_tokens: 10,
        }),
      });
      
      if (!simpleResponse.ok) {
        return { success: false, error: `Simple test failed: ${simpleResponse.status}` };
      }
      
      // Test 2: JSON format request (like spec generator)
      console.log("Test 2: JSON format request...");
      const jsonPrompt = `Estimate dimensions for this product: Water Bottle\n\nRespond in JSON: {\"product\": \"name\", \"length\": 0, \"width\": 0, \"height\": 0}`;
      
      const jsonResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: jsonPrompt }],
          max_tokens: 100,
          response_format: { type: "json_object" }
        }),
      });
      
      const jsonStatus = jsonResponse.status;
      console.log(`JSON test status: ${jsonStatus}`);
      
      if (jsonResponse.ok) {
        const data = await jsonResponse.json();
        return { 
          success: true, 
          message: "Both tests passed! API is working correctly.",
          response: data.choices?.[0]?.message?.content || "No content"
        };
      } else {
        const errorText = await jsonResponse.text();
        return { 
          success: false, 
          error: `JSON test failed with ${jsonStatus}: ${errorText.substring(0, 200)}` 
        };
      }
    } catch (error) {
      console.error("API test error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  },
});

// Main spec generation action
export const generateSpecs = action({
  args: {
    productData: v.string(),
    boundingDimensions: v.object({
      min: v.object({ l: v.number(), w: v.number(), h: v.number() }),
      max: v.object({ l: v.number(), w: v.number(), h: v.number() }),
    }),
    additionalInfo: v.optional(v.object({
      category: v.optional(v.string()),
      material: v.optional(v.string()),
      size: v.optional(v.string()),
    })),
    startIndex: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      // Get user
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }

      const user = await ctx.runQuery(api.users.getUserByClerkId, {
        clerkId: identity.subject
      });

      if (!user) {
        throw new Error("User not found");
      }

      // First, test API connectivity with a simple request
      console.log('Testing API connectivity...');
      await testAPIConnectivity();
      console.log('API connectivity test passed');

      // Parse CSV data
      const products = parseProductCSV(args.productData);

      // Generate specifications
      const results = await generateSpecsForProducts(
        products,
        args.boundingDimensions,
        args.additionalInfo,
        args.startIndex || 0
      );

      // Save analysis record (just tracking usage, no results)
      await ctx.runMutation(api.analyses.create, {
        type: "spec_generator",
        name: `Spec Generation - ${products.length} products`,
        status: "completed",
        results: { productCount: products.length }, // Just track count, not actual data
      });

      return results;
    } catch (error) {
      console.error('Error generating specs:', error);
      throw new Error(error instanceof Error ? error.message : "Failed to generate specifications");
    }
  },
});

// Helper function to parse CSV
function parseProductCSV(csvContent: string): Array<{ orderId?: string; productName: string; category?: string }> {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error("CSV must contain header and at least one data row");
  }

  const firstLine = lines[0];
  const isTabSeparated = firstLine.includes('\t');
  const delimiter = isTabSeparated ? '\t' : ',';
  
  const headers = firstLine.toLowerCase().split(delimiter).map(h => h.trim());
  const products: Array<{ orderId?: string; productName: string; category?: string }> = [];

  // Detect column mappings
  const orderIdIndex = headers.findIndex(h => 
    h.includes('order') && (h.includes('id') || h.includes('number'))
  );
  const productNameIndex = headers.findIndex(h => 
    h.includes('product') || h.includes('name') || h.includes('description') || h.includes('item')
  );
  const categoryIndex = headers.findIndex(h => 
    h.includes('category') || h.includes('type')
  );

  if (productNameIndex === -1) {
    throw new Error("Could not find product name column in CSV");
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(delimiter).map(cell => cell.trim());
    
    if (row[productNameIndex]) {
      products.push({
        orderId: orderIdIndex !== -1 ? row[orderIdIndex] : undefined,
        productName: row[productNameIndex],
        category: categoryIndex !== -1 ? row[categoryIndex] : undefined,
      });
    }
  }

  return products;
}

// Generate specifications for products
async function generateSpecsForProducts(
  products: Array<{ orderId?: string; productName: string; category?: string }>,
  boundingDimensions: {
    min: { l: number; w: number; h: number };
    max: { l: number; w: number; h: number };
  },
  additionalInfo: {
    category?: string;
    material?: string;
    size?: string;
  } | undefined,
  startIndex: number = 0
): Promise<{
  results: Array<{
    orderId?: string;
    productName: string;
    estimatedL: number;
    estimatedW: number;
    estimatedH: number;
    totalCUIN: number;
    confidence: string;
    notes: string;
  }>;
  totalProducts: number;
  processedProducts: number;
  hasMoreProducts: boolean;
  remainingProducts: number;
}> {
  
  // Dynamic batching based on total products
  const calculateOptimalBatchSize = (totalProducts: number): number => {
    // Much smaller batches to avoid timeouts
    if (totalProducts <= 50) {
      return 5; // Very small files: 5 per batch
    } else if (totalProducts <= 200) {
      return 8; // Small files: 8 per batch
    } else {
      return 10; // Larger files: 10 per batch max
    }
  };
  
  const BATCH_SIZE = calculateOptimalBatchSize(products.length);
  const totalBatches = Math.ceil(products.length / BATCH_SIZE);
  
  // Handle chunked processing for large files
  const CHUNK_SIZE = 50; // Fixed chunk size that works reliably
  const allProductsCount = products.length;
  
  // Calculate which chunk to process based on startIndex
  const endIndex = Math.min(startIndex + CHUNK_SIZE, allProductsCount);
  const productsToProcess = products.slice(startIndex, endIndex);
  
  console.log(
    `📦 Chunked processing: Products ${startIndex + 1}-${endIndex} of ${allProductsCount} total ` +
    `(processing ${productsToProcess.length} in this chunk)`
  );
  
  if (productsToProcess.length === 0) {
    console.warn('⚠️ No products to process in this chunk');
    return {
      results: [],
      totalProducts: allProductsCount,
      processedProducts: startIndex,
      hasMoreProducts: false,
      remainingProducts: 0
    };
  }
  
  // Replace products array with the chunk to process
  products = productsToProcess;
  
  const allResults: Array<{
    orderId?: string;
    productName: string;
    estimatedL: number;
    estimatedW: number;
    estimatedH: number;
    totalCUIN: number;
    confidence: string;
    notes: string;
  }> = [];
  
  const actualProductCount = products.length;
  const actualBatches = Math.ceil(actualProductCount / BATCH_SIZE);
  
  console.log(`📦 Processing ${actualProductCount} products in ${actualBatches} batches of ${BATCH_SIZE} each`);
  
  const processedSoFar = startIndex + actualProductCount;
  const remaining = Math.max(0, allProductsCount - processedSoFar);
  console.log(`📊 Progress: Will have ${processedSoFar} of ${allProductsCount} products processed after this chunk (${remaining} remaining)`);
  
  // More conservative time estimate
  const estimatedTime = actualBatches * 2.5; // ~2.5s per batch average
  console.log(`⏱️ Estimated processing time: ${Math.ceil(estimatedTime)} seconds`);
  
  if (products.length < allProductsCount) {
    console.warn(`⚠️ Processing truncated to ${actualProductCount} products due to size limits`);
  }
  
  let successfulBatches = 0;
  
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, Math.min(i + BATCH_SIZE, products.length));
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const actualBatchCount = Math.ceil(products.length / BATCH_SIZE);
    
    const progress = Math.round((batchNumber / actualBatchCount) * 100);
    console.log(`🔄 Processing batch ${batchNumber}/${actualBatchCount} (${progress}%) - Products ${i + 1}-${Math.min(i + BATCH_SIZE, products.length)}`);
    
    try {
      // Process this batch through GPT
      const prompt = buildGPTPrompt(batch, boundingDimensions, additionalInfo);
      const response = await callOpenAI(prompt);
      const results = parseGPTResponse(response, batch);
      allResults.push(...results);
      successfulBatches++;
      console.log(`✅ Batch ${batchNumber} completed: ${results.length} products analyzed`);
      
      // Adaptive delay between batches
      if (i + BATCH_SIZE < products.length) {
        // Longer delay for larger files to avoid rate limiting
        const delay = products.length > 300 ? 500 : 200;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(`❌ AI API error for batch ${batchNumber}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if it's an API key or connectivity issue
      if (errorMessage.includes('401') || errorMessage.includes('Invalid API key')) {
        throw new Error('Invalid OpenAI API key. Please check your API key configuration.');
      } else if (errorMessage.includes('429')) {
        throw new Error('OpenAI API rate limit exceeded. Please wait a few minutes and try again.');
      } else if (errorMessage.includes('timeout')) {
        throw new Error('OpenAI API is not responding. Please check your internet connection and try again.');
      }
      
      // Fail immediately - no fallback
      throw new Error(
        `Failed to process batch ${batchNumber}/${actualBatchCount} (products ${i + 1}-${Math.min(i + BATCH_SIZE, products.length)}). ` +
        `Error: ${errorMessage}. ` +
        `The OpenAI API is required for this feature to work.`
      );
    }
  }
  
  const processedTotal = startIndex + products.length;
  const hasMore = processedTotal < allProductsCount;
  const remainingCount = Math.max(0, allProductsCount - processedTotal);
  
  console.log(`✅ Successfully processed ${products.length} products from this chunk`);
  console.log(`📈 Total progress: ${processedTotal}/${allProductsCount} products (${remainingCount} remaining)`);
  
  return {
    results: allResults,
    totalProducts: allProductsCount,
    processedProducts: products.length, // This chunk's count
    hasMoreProducts: hasMore,
    remainingProducts: remainingCount
  };
}

// Build GPT prompt for dimension estimation
function buildGPTPrompt(
  products: Array<{ orderId?: string; productName: string; category?: string }>,
  boundingDimensions: {
    min: { l: number; w: number; h: number };
    max: { l: number; w: number; h: number };
  },
  additionalInfo: {
    category?: string;
    material?: string;
    size?: string;
  } | undefined
): string {
  // Include all products in the batch (no artificial limit)
  const productList = products.map(p => `- ${p.productName}${p.category ? ` (${p.category})` : ''}`).join('\n');
  
  return `As a packaging expert, estimate the outer packaging dimensions (Length × Width × Height) in inches for these retail products. Consider typical retail packaging like blister packs, boxes, pouches, etc.

PRODUCTS TO ANALYZE:
${productList}

DIMENSIONAL CONSTRAINTS:
- Minimum: ${boundingDimensions.min.l}" × ${boundingDimensions.min.w}" × ${boundingDimensions.min.h}"
- Maximum: ${boundingDimensions.max.l}" × ${boundingDimensions.max.w}" × ${boundingDimensions.max.h}"

${additionalInfo?.category ? `CONTEXT: Product category is ${additionalInfo.category}` : ''}
${additionalInfo?.material ? `MATERIAL: Primary material is ${additionalInfo.material}` : ''}
${additionalInfo?.size ? `SIZE RANGE: Products are generally ${additionalInfo.size} sized` : ''}

INSTRUCTIONS:
1. Estimate retail packaging dimensions for each product
2. Stay within the dimensional constraints
3. Confidence: HIGH (certain), MEDIUM (likely), LOW (guess)

RESPOND IN THIS EXACT JSON FORMAT:
{
  "estimates": [
    {
      "product": "Product Name",
      "length": 0.0,
      "width": 0.0,
      "height": 0.0,
      "confidence": "HIGH/MEDIUM/LOW",
      "reasoning": "Brief explanation of packaging assumption"
    }
  ]
}`;
}

// Call OpenAI API for GPT analysis with retry logic
async function callOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenAI API key not configured. Please set OPENAI_API_KEY in environment variables.");
  }
  
  // Better API key validation
  if (!apiKey.startsWith('sk-') || apiKey.length < 40) {
    throw new Error("Invalid OpenAI API key format. Key should start with 'sk-' and be at least 40 characters.");
  }
  
  console.log("Making OpenAI API call with GPT-4o-mini");
  console.log(`API Key validation: ${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`);
  
  // Retry logic with exponential backoff
  const maxRetries = 2; // Reduced retries for faster failure
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error(`Request timeout after 25 seconds for attempt ${attempt}`);
        controller.abort();
      }, 25000); // 25 second timeout per request
      
      console.log(`Attempt ${attempt}: Sending request to OpenAI API...`);
      console.log(`Request URL: https://api.openai.com/v1/chat/completions`);
      console.log(`Using model: gpt-4o-mini`);
      
      const requestBody = {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a packaging expert specializing in retail product dimensions and packaging standards. Provide accurate, realistic estimates based on typical retail packaging practices.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      };
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`Attempt ${attempt}: Received response with status ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error response');
        
        // Check for specific error codes
        if (response.status === 401) {
          throw new Error("Invalid OpenAI API key. Please check your configuration.");
        } else if (response.status === 429) {
          throw new Error("OpenAI API rate limit exceeded. Using fallback pattern matching.");
        } else if (response.status >= 500) {
          // Server error, worth retrying
          lastError = new Error(`OpenAI server error (${response.status}): ${errorText}`);
          console.log(`Attempt ${attempt}/${maxRetries} failed with server error, retrying...`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000)); // Exponential backoff
          continue;
        }
        
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error("Invalid response format from OpenAI API");
      }
      
      console.log(`✅ OpenAI API call successful on attempt ${attempt}`);
      return data.choices[0].message.content;
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new Error('OpenAI API request timed out. The API is not responding.');
        console.error(`Timeout on attempt ${attempt}`);
      } else if (error instanceof Error) {
        lastError = error;
      } else {
        lastError = new Error('Unknown error occurred');
      }
      
      // If it's a configuration error, don't retry
      if (lastError?.message?.includes('Invalid OpenAI API key') || 
          lastError?.message?.includes('rate limit')) {
        throw lastError;
      }
      
      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        console.error(`All ${maxRetries} attempts failed:`, lastError);
        throw lastError;
      }
      
      const errorMessage = lastError?.message || 'Unknown error';
      console.log(`Attempt ${attempt}/${maxRetries} failed: ${errorMessage}, retrying...`);
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw lastError || new Error('Failed to call OpenAI API after multiple attempts');
}

// Test API connectivity with a simple request
async function testAPIConnectivity(): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenAI API key not configured in environment variables");
  }
  
  try {
    console.log('Sending test request to OpenAI...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for test
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: 'Say "test"' }
        ],
        max_tokens: 10,
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read error');
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait and try again.');
      } else {
        throw new Error(`API test failed with status ${response.status}: ${errorText}`);
      }
    }
    
    console.log('API test successful');
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Cannot connect to OpenAI API - request timed out. Check your internet connection.');
    }
    throw error;
  }
}

// Parse GPT response into structured data
function parseGPTResponse(
  gptResponse: string,
  originalProducts: Array<{ orderId?: string; productName: string; category?: string }>
): Array<{
  orderId?: string;
  productName: string;
  estimatedL: number;
  estimatedW: number;
  estimatedH: number;
  totalCUIN: number;
  confidence: string;
  notes: string;
}> {
  try {
    const parsed = JSON.parse(gptResponse);
    const results = [];
    
    // Create a map for easier matching by product name
    const estimateMap = new Map();
    if (parsed.estimates && Array.isArray(parsed.estimates)) {
      for (const est of parsed.estimates) {
        if (est.product) {
          // Store by lowercase product name for case-insensitive matching
          estimateMap.set(est.product.toLowerCase().trim(), est);
        }
      }
    }
    
    for (const product of originalProducts) {
      // Try to find estimate by product name (case-insensitive)
      const productNameLower = product.productName.toLowerCase().trim();
      let estimate = estimateMap.get(productNameLower);
      
      // If not found, try partial matching
      if (!estimate) {
        for (const [key, value] of estimateMap.entries()) {
          if (key.includes(productNameLower) || productNameLower.includes(key)) {
            estimate = value;
            break;
          }
        }
      }
      
      if (estimate && estimate.length && estimate.width && estimate.height) {
        results.push({
          orderId: product.orderId,
          productName: product.productName,
          estimatedL: parseFloat(estimate.length),
          estimatedW: parseFloat(estimate.width),
          estimatedH: parseFloat(estimate.height),
          totalCUIN: parseFloat(estimate.length) * parseFloat(estimate.width) * parseFloat(estimate.height),
          confidence: (estimate.confidence || 'medium').toLowerCase(),
          notes: estimate.reasoning || "AI packaging analysis",
        });
      } else {
        // If GPT didn't provide an estimate, throw an error
        throw new Error(`AI did not provide dimensions for product: ${product.productName}`);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error parsing GPT response:', error);
    console.error('GPT Response was:', gptResponse);
    throw new Error(`Failed to parse GPT response: ${error}`);
  }
}

