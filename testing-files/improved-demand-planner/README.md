# Improved Demand Planner Testing Files

This directory contains sample CSV files to test the new Improved Packaging Demand Planner.

## Test Scenario: E-commerce Business

**Business Context**: Mid-size e-commerce company shipping various products with different packaging needs.

### Files Provided:

#### 1. `packaging-types.csv`
- **Purpose**: Upload in Step 1 - Packaging Types
- **Contains**: 8 different packaging options with dimensions, costs, and weights
- **Format**: Package Type, Length (inches), Width (inches), Height (inches), Cost ($), Weight (lbs)

#### 2. Quarterly Usage Files (Historical Method)
- **Purpose**: Upload in Step 2 - Historical Tracking method
- **Files**: 
  - `q1-2024-usage.csv` (1,270 total packages)
  - `q2-2024-usage.csv` (1,480 total packages) 
  - `q3-2024-usage.csv` (1,450 total packages)
  - `q4-2024-usage.csv` (1,935 total packages)

### Expected Results After Uploading All Quarters:

**Total Historical Usage**: 6,135 packages across 4 quarters

**Expected Mix Percentages**:
- Small Box: ~19.4% (1,230 units)
- Medium Box: ~14.1% (850 units)
- Large Box: ~9.5% (580 units)
- Extra Large Box: ~4.1% (250 units)
- Envelope: ~21.8% (1,320 units)
- Tube: ~2.4% (150 units)
- Poly Mailer: ~17.0% (1,040 units)
- Bubble Mailer: ~11.7% (715 units)

### Test Scenarios:

#### Scenario 1: Historical Method Test
1. **Step 1**: Upload `packaging-types.csv`
2. **Step 2**: Choose "Historical Tracking" → Upload all 4 quarterly files
3. **Step 3**: Enter forecast parameters:
   - Total Orders: `10000`
   - Safety Buffer: `15%`
4. **Expected Output**: 
   - Small Box: 1,940 units, ~$2,425 cost
   - Envelope: 2,180 units, ~$1,853 cost
   - Poly Mailer: 1,700 units, ~$765 cost

#### Scenario 2: Manual Method Test
1. **Step 1**: Upload `packaging-types.csv`
2. **Step 2**: Choose "Manual Percentages" → Set:
   - Small Box: 25%
   - Medium Box: 15%
   - Large Box: 10%
   - Envelope: 30%
   - Poly Mailer: 20%
3. **Step 3**: Same forecast parameters as above
4. **Expected Output**:
   - Envelope: 3,450 units, ~$2,933 cost
   - Small Box: 2,875 units, ~$3,594 cost

#### Scenario 3: Mix Evolution Test
1. Upload quarters incrementally (Q1 → Q1+Q2 → Q1+Q2+Q3 → All)
2. Watch how percentages change as more data is added
3. Verify that newer quarters influence the mix calculation

### Key Features to Test:

✅ **CSV Flexibility**: Files use different column names (Quantity, Quantity Used, Count)
✅ **Real-time Mix Updates**: Percentages update as quarters are added
✅ **Method Switching**: Can switch between Historical and Manual methods
✅ **Validation**: Total percentages validation in manual mode
✅ **Results Export**: CSV and PDF export functionality
✅ **Cost Calculations**: Accurate cost and weight estimations
✅ **Safety Buffer**: Proper application of safety stock percentage

### Business Intelligence Insights Expected:

- **Dominant Package**: Envelope (highest usage)
- **Most Expensive**: Small Box (due to quantity × unit cost)
- **Growth Trends**: Q4 shows 35% increase over Q1
- **Cost Optimization**: Poly Mailers provide best cost efficiency
- **Weight Considerations**: Extra Large Boxes contribute most to shipping weight

### Performance Testing:

- Test with larger datasets (multiply quantities by 10x)
- Upload files with 100+ rows
- Test with missing optional columns (cost, weight)
- Test with malformed CSV data