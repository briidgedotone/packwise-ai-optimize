# QuantiPackAI – Packaging Demand Planner Update

## 🎯 Purpose

The Packaging Demand Planner helps operations and procurement teams forecast packaging needs based on a projected number of total shipments. It supports two flexible methods for determining the packaging mix: either by uploading historical usage logs or manually entering percentage splits. The planner then calculates how many of each packaging type will be needed, including an optional safety stock buffer, along with cost and material usage estimates.

## 📥 INPUTS

### 1. Total Order Forecast File (Required)
Defines how many shipments are expected in the forecast period.

**Required fields:**
- Total Forecasted Orders (e.g., 40,000)
- Forecast Period (e.g., Q4 2025)

### 2. Packaging Mix Source (One Required)
You must provide either of the following:

#### 📁 Option A: Packaging Usage Log File (Recommended)
Upload historical usage data to automatically calculate the percentage mix of packaging types. I want this to be able to be a on going percentage as they upload data over time.

Each row = one usage record

**Required columns:**
- Date (YYYY-MM-DD)
- Package Type (e.g., Small Mailer)
- Quantity Used (integer)

The platform will:
- Aggregate total usage across all packaging types
- Calculate % of usage per type
- Update mix each time new data is added

#### 📁 Option B: Manual Packaging Mix File (Use only if usage log is not provided or manual override is needed)
Manually enter the expected packaging mix percentages.

Each row = one packaging type

**Required columns:**
- Package Type (e.g., Medium Box)
- Usage % (e.g., 0.36 or 36%)

⚠️ If uploaded, this file will override any calculated values from the usage logs.

### 3. Packaging Suite File (Required)
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

### 4. Safety Stock % (Optional)
Add a buffer to prevent packaging shortages by automatically inflating packaging demand.

**Input field (single value):**
- Safety Stock % (e.g., 10%)

**Effect on calculation:**
```
Final Quantity Needed = Base Quantity × (1 + Safety Stock %)
```

## ⚙️ PROCESS FLOW

1. Upload total order forecast.
2. Choose mix source:
   - Upload usage logs to calculate historical mix (Option A), OR
   - Upload a manual mix file (Option B).
3. Upload packaging suite with specs and cost/weight data.
4. Enter optional safety stock %.
5. QuantiPackAI calculates total packaging demand, cost, and weight per type.
6. Output files and charts are generated.

## 📤 OUTPUTS

### 1. Packaging Demand Summary Table

| Package Type | Base Qty | Usage % | Safety Stock % | Final Qty | Est. Cost | Est. Weight |
|-------------|----------|---------|----------------|-----------|-----------|-------------|
| Small Mailer | 14,000 | 35% | 10% | 15,400 | $1,848 | 231 lbs |
| Medium Box | 21,500 | 53.75% | 10% | 23,650 | $3,070 | 410 lbs |
| Large Carton | 4,500 | 11.25% | 10% | 4,950 | $720 | 150 lbs |

### 2. Visual Charts
- Pie chart: Packaging mix (% of total)
- Bar chart: Cost by packaging type
- Bar chart: Weight by packaging type

### 3. AI-Generated Insights
- "You are forecasted to use 44,000 packages with your safety stock buffer."
- "Small Mailer represents 35% of demand — consider early bulk ordering."
- "Upload new usage logs monthly to keep your mix percentages accurate."

### 4. Export Options
- 📄 Full demand report (PDF)
- 📊 Data table export (CSV)
- 🔄 Integration-ready feed for:
  - Suite Optimizer
  - Procurement or supplier ordering tools

## 🔁 QuantiPackAI Demand Planner Flow Diagram

```
           +-------------------------+
            | Total Order Forecast    |
            | (e.g., 40,000 orders)   |
            +-----------+-------------+
                        |
                        v
      +------------------------+
      |   Packaging Mix Source |
      +------------------------+
      |                        |
  +---v---+              +-----v------+
  |Usage  |              | Manual Mix |
  | Log   |              | % Upload   |
  +---+---+              +-----+------+
      |                        |
      +----------+-------------+
                 |
                 v
      +-------------------------------+
      | Packaging Suite File          |
      | (Size, Cost, Weight, etc.)    |
      +---------------+---------------+
                      |
                      v
            +----------------------+
            | Safety Stock Input   |
            | (e.g., +10%)         |
            +----------+-----------+
                       |
                       v
      +--------------------------------------------+
      | Calculate Quantity, Cost, and Material Use |
      +--------------------------------------------+
                       |
                       v
     +---------------------------------------------+
     | Final Outputs: Tables, Charts, PDF/CSV, API |
     +---------------------------------------------+
```