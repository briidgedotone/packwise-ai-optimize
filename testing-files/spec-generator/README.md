# Spec Generator Test Files

This directory contains sample CSV files to test the Spec Generator functionality.

## Test Files

### 1. `sample-products.csv`
- **Format**: Simple product list
- **Products**: 20 diverse products (exactly the processing limit)
- **Use Case**: Testing basic product specification generation

### 2. `sample-orders.csv`
- **Format**: Order-based format with Order ID and Product Name columns
- **Products**: 19 products across 7 different orders
- **Use Case**: Testing order-grouped product processing

### 3. `small-test.csv`
- **Format**: Simple product list
- **Products**: 5 common products
- **Use Case**: Quick testing and validation

## Testing Instructions

### Step 1: Navigate to Spec Generator
1. Go to the Dashboard
2. Click on "Spec Generator" in the navigation

### Step 2: Upload Test File
1. In Step 1, upload one of the test CSV files
2. The system supports both formats automatically

### Step 3: Set Bounding Dimensions
Use these recommended test dimensions:

**Minimum Dimensions:**
- Length: 1.0 inches
- Width: 1.0 inches  
- Height: 0.5 inches

**Average Dimensions:**
- Length: 6.0 inches
- Width: 4.0 inches
- Height: 2.5 inches

**Maximum Dimensions:**
- Length: 15.0 inches
- Width: 12.0 inches
- Height: 8.0 inches

### Step 4: Optional Settings (Step 3)
You can leave these blank or use:
- **Default Category**: Electronics
- **Default Material**: Plastic
- **Default Size**: Medium

### Step 5: Generate Specs
Click "Generate Product Specifications" and wait for AI processing.

## Expected Results

The AI should generate realistic packaging dimensions for each product:
- **Small items** (lip balm, phone accessories): Close to minimum bounds
- **Medium items** (mugs, phone cases): Near average bounds
- **Large items** (yoga mat, water bottles): Approaching maximum bounds

## Validation Checklist

✅ All products processed (up to 20 limit)  
✅ Dimensions within specified bounds  
✅ CUIN calculations correct (L × W × H)  
✅ Confidence levels assigned  
✅ Order grouping works (for order format)  
✅ Export to CSV functions  
✅ Results page displays properly  

## Notes

- The 20-product limit is enforced at the backend
- AI estimation quality depends on product name clarity
- More descriptive product names yield better results
- Processing time: ~10-30 seconds depending on product count