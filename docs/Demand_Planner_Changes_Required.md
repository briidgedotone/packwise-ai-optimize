# Packaging Demand Planner - Required Changes

## Overview
The client has identified that the current Demand Planner implementation too closely mirrors the Suite Analyzer logic. The new approach better reflects real-world demand planning where companies forecast based on total orders and historical packaging mix percentages.

## Key Conceptual Changes

### Current Approach (Incorrect)
- Expects product-level forecast data (Product Name, Quantity, Dimensions)
- Similar to Suite Analyzer - analyzing individual products
- Includes fallback dimensions for missing product specs

### New Approach (Correct)
- Total order forecast only (e.g., 40,000 orders for Q4 2025)
- Historical packaging mix percentages drive the calculation
- No product-level details needed
- Simpler and more realistic

## Required UI/UX Changes

### 1. Replace Forecast File Upload
**Current:** "Forecasted Product Orders" with product details
**New:** "Total Order Forecast" with only:
- Total Forecasted Orders (number)
- Forecast Period (text)

### 2. Add Packaging Mix Options
Create two mutually exclusive options:

#### Option A: Packaging Usage Log (Recommended)
- Date (YYYY-MM-DD)
- Package Type
- Quantity Used
- System calculates percentages automatically
- Updates mix as new data is uploaded

#### Option B: Manual Mix Entry
- Package Type
- Usage % (e.g., 35%)
- Overrides calculated values if provided

### 3. Remove Fallback Dimensions
- No longer needed since we're not dealing with product-level data
- Simplifies the interface significantly

### 4. Update Analysis Options
**Keep:**
- Safety Stock %

**Remove:**
- Planning Horizon (months) - now part of forecast file
- Lead Time (days) - not in new requirements

### 5. Visual Changes
- Change color scheme from emerald to match the forecast-focused nature
- Update icons to reflect percentage-based calculations
- Add visual indicators for Option A vs Option B selection

## New UI Components Needed

### 1. Mix Source Selector
- Radio buttons or tabs to choose between:
  - "Calculate from Usage History" (Option A)
  - "Enter Mix Manually" (Option B)

### 2. Usage Log Upload Section
- File upload for historical usage data
- Preview of calculated percentages
- "Update Mix" button for ongoing updates

### 3. Manual Mix Entry Form
- Dynamic form to add package types and percentages
- Validation to ensure percentages total 100%
- Clear indication this overrides calculated values

### 4. Simplified Forecast Input
- Could be a simple form instead of file upload:
  - Total Orders input field
  - Forecast Period selector/input

## Data Flow Changes

### Current Flow:
```
Product Forecast → Match to Packages → Calculate Quantities
```

### New Flow:
```
Total Orders → Apply Mix % → Calculate Quantities → Apply Safety Stock
```

## Benefits of New Approach
1. **Simpler UI** - Fewer inputs required
2. **More Realistic** - Matches actual business processes
3. **Easier Implementation** - No complex product matching logic
4. **Better UX** - Clear choice between historical data or manual entry

## Implementation Priority
1. Update the input section to support new file types
2. Add mix source selector (Option A/B)
3. Remove fallback dimensions section
4. Update processing logic (backend consideration)
5. Adjust output displays to show percentage-based calculations