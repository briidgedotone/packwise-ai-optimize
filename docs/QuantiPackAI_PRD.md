# QuantiPackAI Product Requirements Document

## 🌍 Landing Page: QuantiPackAI 

**The World's First Packaging Analysis AI**

**The Smartest Packaging Decisions You've Ever Made**

QuantiPackAI uses AI to analyze, generate, and forecast packaging strategies that cut cost, reduce waste, and give you an edge from warehouse to shelf.

## 💥 One Platform. Four Powerful Functions. All Results.

### ✅ Packaging Suite Analyzer

**Fix your packaging mix. Save big.**

Upload your order history and packaging types. Instantly see how each order should've been packed, where you're losing money, and what changes would drive efficiency.

🎯 **Used by:** Logistics, Operations, Packaging, Procurement

📈 **Delivers:**
- Optimized packaging allocation
- Fill rate analysis
- Cost, volume, and material savings
- Packaging improvement suggestions
- Executive export (CSV/PDF)

### ✅ Spec Generator

**No dimensions? No delay.**

Upload a product list. QuantiPackAI uses industry logic + your size range to generate realistic packaging specs instantly.

🎯 **Used by:** Packaging, Design, Sourcing, Analytics

📈 **Delivers:**
- AI-estimated L×W×H and CUIN
- Notes on each estimate
- Clean spec table (CSV/PDF)
- Ready for modeling, quoting, planning

### ✅ Packaging Demand Planner

**Know exactly how much packaging you need.**

Upload your forecasted product volumes — QuantiPackAI calculates packaging quantities based on fit, volume, and efficiency.

🎯 **Used by:** Fulfillment, DCs, 3PLs, Supply Chain

📈 **Delivers:**
- Quantity needed per package type
- Fill rate + cost efficiency
- Packaging waste + material impact
- Forecast-ready demand report

### ✅ PDP Analyzer

**Win on shelf. Beat the competition.**

Upload your principal display panel and compare it against competitors. QuantiPackAI scores and explains your design's strengths — and tells you exactly how to improve it.

🎯 **Used by:** Brand, Creative, Packaging Design, Marketing

📈 **Delivers:**
- 0–10 visual performance scores
- Competitor benchmarking
- Heatmap + radar visuals
- GPT-backed design fixes
- Shareable PDF report

## 🌱 Make Every Packaging Decision a Sustainability Win

**Reduce excess volume. Cut material waste. Improve fit.**

Every function in QuantiPackAI helps you:
- ✔️ Eliminate packaging bloat
- ✔️ Lower packaging emissions
- ✔️ Track real waste reduction in CUIN, lbs, and dollars
- ✔️ Meet your packaging sustainability goals — with proof

## 🔐 Data Stays Private. Always.

**Your data is your IP — and we treat it that way.**
- 🔒 We never sell, share, or scrape your files
- ✅ Every recommendation is explainable and logic-driven
- 🤝 We believe in AI that works for you, not behind your back

## 🧠 Smart Enough to Handle Messy Data

**Don't have perfect specs? No problem.**

QuantiPackAI fills in missing fields using industry benchmarks, real-world product logic, and your reference dimensions — so you get answers even when the spreadsheet isn't perfect.

## 🔥 Subscription Options - Smarter Packaging Starts Now

---

# Core Features Detailed Requirements

## 1. ✅ Packaging Suite Analyzer

### 🎯 Function Purpose:
Analyze historical order data to:
- Identify the optimal packaging allocation from a given suite
- Compare this to baseline usage
- Forecast cost, volume, and material (lbs) savings
- Recommend improvements to the packaging suite

### 📥 INPUTS

#### 1. Order History File (Required)
Each row = one product in one order

**Accepted Columns:**
- Order ID (required, can be created with GPT)
- L x W x H of each item (optional)
- Total Order Volume (CUIN) (optional)
- Quantity (optional but client may include otherwise GPT should know to group matching order ID's)
- Product Description (optional)

➡️ **If Total Order Volume (CUIN) is missing:**
- Calculate CUIN per item using L×W×H × Quantity
- If L×W×H is missing, GPT use real-world product profiles (If unknown, apply fallback dimensions (see input #4))

#### 2. Packaging Suite File (Required)
Each row = one packaging type

**Required Columns:**
- Package Name
- L x W x H
- Cost per unit
- Package Weight (lbs) (optional, but needed to calculate material waste savings in lbs)

➡️ CUIN is calculated as: L × W × H
➡️ Fill rate is calculated as: Order CUIN ÷ Package CUIN

#### 3. Baseline Packaging Mix (Optional)
- Upload as excel .csv or manually input % breakdown
- Example: Small = 20%, Medium = 30%, Large = 50%
- Or give qty per package type and GPT can convert to percentages to understand the baseline

#### 4. Fallback Dimensions (Optional, used only if item specs are missing)
Manual user entry fields:
- Smallest Product Dimensions (L×W×H)
- Average Product Dimensions
- Largest Product Dimensions

### 📤 OUTPUTS

#### 1. Cleaned & Calculated Order Volume Table
- Final total CUIN per Order ID
- Method of estimation flagged (actual, product-based, or fallback)

#### 2. Optimized Packaging Allocation
Each order is matched to the smallest packaging type it fits into

**Output:**
- Order ID | CUIN | Assigned Package | Fill Rate (%)
- Optimized Allocation Chart:
  - % of orders by packaging type
  - Average fill rate per type

#### 3. Baseline vs. Optimized Comparison
Visual comparison of:
- Current packaging mix (baseline)
- Optimized packaging mix (model output)

**Key metrics:**
- ⚖️ Cost Savings (Total & Per Order)
- 📦 Volume Savings (CUIN)
- 🏋️ Material Weight Savings (lbs) (Requires package weight input)

#### 4. Smart Recommendations
Detect CUIN "gaps" where current suite underperforms

**Suggest new package type(s):**
- Dimensions (L×W×H)
- CUIN range it would cover
- % of orders that would shift to it
- Cost & material savings
- Fill rate improvement

#### 5. Exportable Report
**Summary Dashboard:**
- Savings overview (cost, volume, material)
- Current vs optimal packaging usage
- Order-by-order allocation
- Suggested suite improvements
- Export Options: PDF or CSV

### ⚙️ Summary Flow:
```
UPLOAD ORDER HISTORY + PACK SUITE
        ⬇
   CLEAN + COMBINE ORDERS
        ⬇
CALCULATE TOTAL CUIN PER ORDER
        ⬇
ALLOCATE TO OPTIMAL PACKAGE SIZE
        ⬇
COMPARE TO BASELINE + CALCULATE SAVINGS
        ⬇
IDENTIFY SUITE GAPS + SUGGEST IMPROVEMENTS
        ⬇
       EXPORT RESULTS
```

---

## 2. ✅ Spec Generator

### 🎯 Function Purpose:
Generate estimated L×W×H and CUIN (cubic inches) for a list of product names or descriptions, using a combination of:
- GPT's packaging & product knowledge
- User-supplied dimensional boundaries

This output can be used for packaging modeling, allocation testing, or spec documentation when direct dimensions are missing.

### 📥 INPUTS

#### 1. Product List File (Required)
Each row = one product

**Accepted Fields:**
- Product Name or Description
- Examples: "Toothbrush", "Bluetooth Headphones", "Silicone Spatula"

#### 2. Bounding Dimensions (Required)
To help constrain and calibrate GPT predictions:
- Min Dimensions (L×W×H in inches)
- Average Dimensions (L×W×H)
- Max Dimensions (L×W×H)

**Example:**
- Min: 1×1×0.5
- Avg: 6×3×2
- Max: 15×12×5

📝 **Note to User:** "These should reflect the smallest, average, and largest products in your list based on outer packaging. They're used to keep estimates in a realistic range."

#### 3. Optional Fields (If Available)
To improve accuracy:
- Category or Subcategory (e.g., Accessories, Electronics, Cosmetics)
- Material Type (e.g., plastic, metal)
- Size: examples: S,M,L etc

### 📤 OUTPUTS

Each row returned for each product will include:

| Product Name | Estimated L | Estimated W | Estimated H | Total CUIN |
|-------------|------------|------------|------------|-----------|
| Hair Clip | 2.5 | 1.5 | 0.5 | 1.88 |
| Toothbrush | 8.0 | 1.0 | 1.0 | 8.0 |
| Phone Case | 7.0 | 4.0 | 0.6 | 16.8 |

### 🧠 Output Logic (Behind the Scenes)
For each product:
1. GPT scans the name/description and matches to:
   - Common retail packaging profiles (e.g., blister, pouch, folding carton)
   - Product category benchmarks
2. Uses provided min/avg/max to:
   - Scale predictions appropriately
   - Avoid under/overestimating niche products
3. Notes estimation assumptions (optional but recommended)

### 🧾 Export Format
- Table view in UI
- Downloadable CSV
- PDF summary

---

## 3. ✅ Packaging Demand Planner

### 🎯 Purpose
The Packaging Demand Planner helps operations and procurement teams forecast packaging needs based on a projected number of total shipments. It supports two flexible methods for determining the packaging mix: either by uploading historical usage logs or manually entering percentage splits. The planner then calculates how many of each packaging type will be needed, including an optional safety stock buffer, along with cost and material usage estimates.

### 📥 INPUTS

#### 1. Total Order Forecast File (Required)
Defines how many shipments are expected in the forecast period.

**Required fields:**
- Total Forecasted Orders (e.g., 40,000)
- Forecast Period (e.g., Q4 2025)

#### 2. Packaging Mix Source (One Required)
You must provide either of the following:

##### 📁 Option A: Packaging Usage Log File (Recommended)
Upload historical usage data to automatically calculate the percentage mix of packaging types. This can be updated over time as new data becomes available.

Each row = one usage record

**Required columns:**
- Date (YYYY-MM-DD)
- Package Type (e.g., Small Mailer)
- Quantity Used (integer)

The platform will:
- Aggregate total usage across all packaging types
- Calculate % of usage per type
- Update mix each time new data is added

##### 📁 Option B: Manual Packaging Mix File
Manually enter the expected packaging mix percentages (use only if usage log is not provided or manual override is needed).

Each row = one packaging type

**Required columns:**
- Package Type (e.g., Medium Box)
- Usage % (e.g., 0.36 or 36%)

⚠️ If uploaded, this file will override any calculated values from the usage logs.

#### 3. Packaging Suite File (Required)
Defines packaging specifications, costs, and material weights.

Each row = one packaging type

**Required columns:**
- Package Type (must match usage file)
- Length (in inches)
- Width (in inches)
- Height (in inches)
- Internal Volume (CUIN) (optional — auto-calculated if missing)
- Cost per Unit (USD) (optional — used in cost forecast)
- Weight per Unit (lbs) (optional — used in material weight forecast)

#### 4. Safety Stock % (Optional)
Add a buffer to prevent packaging shortages by automatically inflating packaging demand.

**Input field (single value):**
- Safety Stock % (e.g., 10%)

**Effect on calculation:**
```
Final Quantity Needed = Base Quantity × (1 + Safety Stock %)
```

### 📤 OUTPUTS

#### 1. Packaging Demand Summary Table

| Package Type | Base Qty | Usage % | Safety Stock % | Final Qty | Est. Cost | Est. Weight |
|-------------|----------|---------|----------------|-----------|-----------|-------------|
| Small Mailer | 14,000 | 35% | 10% | 15,400 | $1,848 | 231 lbs |
| Medium Box | 21,500 | 53.75% | 10% | 23,650 | $3,070 | 410 lbs |
| Large Carton | 4,500 | 11.25% | 10% | 4,950 | $720 | 150 lbs |

#### 2. Visual Charts
- Pie chart: Packaging mix (% of total)
- Bar chart: Cost by packaging type
- Bar chart: Weight by packaging type

#### 3. AI-Generated Insights
- "You are forecasted to use 44,000 packages with your safety stock buffer."
- "Small Mailer represents 35% of demand — consider early bulk ordering."
- "Upload new usage logs monthly to keep your mix percentages accurate."

#### 4. Export Options
- 📄 Full demand report (PDF)
- 📊 Data table export (CSV)
- 🔄 Integration-ready feed for:
  - Suite Optimizer
  - Procurement or supplier ordering tools

### ⚙️ Flow Summary:
```
           UPLOAD TOTAL ORDER FORECAST
                        ⬇
            CHOOSE PACKAGING MIX SOURCE
      +------------------------+------------------------+
      |                                                 |
UPLOAD USAGE LOG                              UPLOAD MANUAL MIX
(Calculate % automatically)                    (Override with %)
      |                                                 |
      +------------------------+------------------------+
                        ⬇
             UPLOAD PACKAGING SUITE FILE
                        ⬇
              ENTER SAFETY STOCK % (Optional)
                        ⬇
         CALCULATE QUANTITY, COST, AND MATERIAL USE
                        ⬇
          GENERATE OUTPUTS: TABLES, CHARTS, REPORTS
```

---

## 4. ✅ PDP Analyzer

### 🧠 Purpose:
Analyze and score the effectiveness of a product's Principal Display Panel (PDP) based on real-world shelf visibility and marketing psychology principles.
Compare it against competitors and receive actionable, data-backed design improvement suggestions.

### 📥 INPUTS

#### 1. Upload Your PDP
- Accepts JPG, PNG, or PDF
- One image required
- Front-facing image of your product/package

#### 2. Upload Competitor PDPs (Optional)
- Up to 4 competitor PDPs
- Same format
- Shown side-by-side in comparison view

#### 3. Optional Meta Info (Improves Results):
- Product Category (e.g., snacks, cosmetics)
- Intended Shelf Type (e.g., vertical peg, laydown box, upright box)
- Primary Claims (optional text input)

### 🧠 PROCESSING & SCORING

AI analyzes all PDPs using image recognition and layout parsing.
It scores each image on the following 8 Shelf Visibility Factors (0–10 scale):

| Metric | Definition |
|--------|------------|
| Hierarchy | How well the visual flow guides the eye |
| Readability | Clarity of key messaging at distance |
| Color Impact | Contrast and eye-catching use of color |
| Logo Visibility | Size, clarity, and positioning of the logo |
| Emotional Appeal | Visual storytelling and resonance with target market |
| Claims Communication | Clarity and effectiveness of featured claims |
| Font Choice | Appropriateness and legibility of typography |
| White Space Balance | Use of spacing to avoid clutter and boost visibility |

### 📊 Z-SCORE NORMALIZATION (if competitors are uploaded)
- Score distributions are normalized
- Shows how the user's PDP performs relative to the field

**Example:**
- "Your Readability score is 1.8 SD above the average — great job!"
- "Your Emotional Appeal is 2.1 SD below competitors — worth improving."

### 📤 OUTPUTS

#### 1. Score Table

| Metric | You | Competitor A | Competitor B | Competitor C | Competitor D |
|--------|-----|--------------|--------------|--------------|--------------|
| Hierarchy | 7.5 | 6.2 | 7.8 | 5.9 | 6.4 |
| Readability | 8.1 | 5.6 | 6.2 | 7.0 | 6.8 |
| Logo | 5.8 | 6.5 | 6.0 | 7.1 | 6.2 |
| Emotional Appeal | 4.9 | 7.3 | 6.5 | 7.5 | 7.1 |
| Claims | 6.2 | 6.0 | 7.2 | 5.8 | 6.3 |
| White Space | 7.0 | 5.2 | 6.1 | 4.8 | 5.9 |
| Fonts | 7.3 | 6.1 | 6.5 | 7.0 | 6.2 |
| Color Impact | 6.8 | 5.9 | 7.8 | 6.1 | 5.7 |

#### 2. Visualizations
- 📊 Bar chart comparison per category
- 📈 Radar chart to compare overall profiles
- 🔥 PDP Heatmap — visual output showing:
  - Eye flow zones
  - Logo clarity zones
  - Claim hotspots
  - White space balance

#### 3. GPT Actionable Recommendations
Each metric comes with:
- Explanation of score
- Suggested fix
- Example reference (when possible)

🧠 **Sample Output:**

**Emotional Appeal: 4.9/10**
Your packaging uses clinical colors and lacks lifestyle imagery.
**Fix:** Add human element or emotion-triggering cues (e.g., happy user photo, vibrant background scene).

**Logo: 5.8/10**
Your logo is slightly under-emphasized relative to competitors.
**Fix:** Increase contrast, reposition it above eye line, or size it 15% larger.

#### 4. PDF Report Export
- Full score table
- Visuals (heatmap + radar)
- Z-score summary (if competitors were uploaded)
- All GPT design suggestions
- Ideal for sharing with design or marketing teams

### ⚙️ Flow Summary:
```
UPLOAD PDP + OPTIONAL COMPETITORS
        ⬇
IMAGE ANALYSIS + TEXT/LAYOUT DETECTION
        ⬇
SCORE ACROSS 8 VISIBILITY METRICS (0–10)
        ⬇
Z-SCORE + COMPETITOR BENCHMARKING
        ⬇
GPT DESIGN RECOMMENDATIONS + VISUAL HEATMAPS
        ⬇
EXPORT REPORT + NEXT STEPS
```