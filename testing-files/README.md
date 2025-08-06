# Suite Analyzer Test Files

This directory contains comprehensive test datasets for validating the Suite Analyzer functionality. These files include realistic e-commerce order data with proper dimensions, weights, and shipping information.

## 📁 Available Test Files

### Small Datasets (Quick Testing)
- **`order-history-sample.csv`** (50 orders) - Sample order history with diverse products
- **`packaging-suite-sample.csv`** (50 packages) - Complete packaging options catalog
- **`baseline-mix-sample.csv`** (10 packages) - Current packaging usage baseline

### Large Datasets (Performance Testing)
- **`order-history-large.csv`** (1,000 orders) - Large dataset for performance testing
- **`packaging-suite-comprehensive.csv`** (30 packages) - Full packaging suite
- **`baseline-mix-realistic.csv`** (7 packages) - Realistic baseline mix data

## 🧪 How to Test the Suite Analyzer

### Step 1: Basic Test (Recommended First)
1. Navigate to Suite Analyzer in the app
2. Upload **`order-history-sample.csv`** as Order History File
3. Upload **`packaging-suite-sample.csv`** as Packaging Suite File
4. Upload **`baseline-mix-sample.csv`** as Baseline Mix (optional)
5. Fill in fallback dimensions:
   - **Smallest**: L=4, W=3, H=2
   - **Average**: L=8, W=6, H=4  
   - **Largest**: L=16, W=12, H=8
6. Click "Analyze Suite"

### Step 2: Performance Test
1. Use **`order-history-large.csv`** (1,000 orders)
2. Use **`packaging-suite-comprehensive.csv`**
3. Use **`baseline-mix-realistic.csv`**
4. Same fallback dimensions as above
5. Monitor processing speed and memory usage

## 📊 Expected Results

### Key Metrics to Validate:
- **Processing Speed**: 50+ orders/second
- **Fill Rate Improvement**: 20-40% average
- **Cost Reduction**: 15-35% typical savings
- **Success Rate**: 95%+ successful allocations

### Expected Recommendations:
- Package consolidation opportunities
- Dimensional weight optimization
- Fill rate improvements
- Cost reduction strategies

## 🔍 Test Data Characteristics

### Product Categories Included:
- **Electronics**: Laptops, phones, headphones, accessories
- **Kitchen**: Mugs, cutting boards, appliances, utensils
- **Office**: Organizers, lamps, supplies, furniture
- **Home**: Decor, storage, lighting, textiles
- **Sports**: Equipment, apparel, accessories
- **Fashion**: Clothing, shoes, accessories

### Shipping Zones:
- Domestic, Zone 2-5, International
- Standard, Express, Overnight priorities

### Package Types:
- Cardboard boxes (various sizes)
- Poly mailers (small to large)
- Bubble mailers
- Specialty containers (electronics, fragile)

## 🐛 Troubleshooting

### Common Issues:
1. **"Missing required columns"** - Check CSV headers match expected format
2. **"Invalid dimensions"** - Ensure fallback dimensions are filled in
3. **"No valid orders found"** - Check file format and data integrity
4. **Processing timeout** - Try smaller dataset first

### File Format Requirements:

**Order History CSV Headers:**
```
Order ID, Product Name, Length, Width, Height, Unit, Quantity, Weight, Category, Priority, Zone
```

**Packaging Suite CSV Headers:**
```
Package Name, Package ID, Length, Width, Height, Unit, Cost per Unit, Package Weight, Max Weight, Material, Type
```

**Baseline Mix CSV Headers:**
```
Package Name, Package ID, Usage Percent, Monthly Volume, Average Cost
```

## 🚀 Advanced Testing

### Stress Testing:
- Generate even larger datasets using `create-large-datasets.cjs`
- Test with 5,000+ orders
- Monitor memory usage and processing time

### Edge Cases:
- Very small products (electronics accessories)
- Very large products (furniture, appliances)
- High-value fragile items
- Unusual dimensions (very long, very flat)

### Custom Scenarios:
- Modify the generator script to create specific test cases
- Add products with missing dimensions (tests fallback logic)
- Create unrealistic dimensions (tests validation)

## 📈 Performance Benchmarks

| Dataset Size | Expected Time | Memory Usage | Success Rate |
|--------------|---------------|--------------|--------------|
| 50 orders    | <2 seconds    | <10MB       | >98%         |
| 500 orders   | <10 seconds   | <50MB       | >95%         |
| 1,000 orders | <20 seconds   | <100MB      | >95%         |
| 5,000 orders | <60 seconds   | <300MB      | >90%         |

## 📋 Test Checklist

- [ ] Small dataset processes successfully
- [ ] Large dataset completes without errors  
- [ ] Progress indicators show correctly
- [ ] Results display proper metrics
- [ ] Recommendations are actionable
- [ ] Cost savings calculations are realistic
- [ ] Fill rate improvements make sense
- [ ] Package allocations are logical
- [ ] Error handling works for invalid data
- [ ] Performance meets benchmarks

Happy testing! 🎉