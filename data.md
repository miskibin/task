# Supply Chain Data Intelligence Summary

## Data Coverage Snapshot
- **Transactions**: 150k purchase orders linked to 217.5k shipments and 365 days of transit-event history.
- **Inventory**: 365 consecutive daily snapshots across 2,000 sites and 5,000 SKUs (~1.0B USD cumulative on-hand value this year).
- **Quality & RMAs**: 40k return cases with reason codes, warranty flags, and site/SKU context.
- **Deployments**: 80k project milestones (Planning > Materials Ready > Installation > Go-Live) tied to sites and SKUs.

## Supply Chain Performance
- **Lead Times**: Median supplier-to-delivery time is **313 days** (mean 353). Transit alone consumes **187 days** (median), indicating structural shipping latency rather than manufacturing.
- **Supplier vs. Ship Dates**: 108,981 POs (72.7%) show `order_date > ship_date`. Treat these as suspect before modeling; they overpower true early shipments.
- **On-Time Delivery**: Only **11%** of shipments hit or beat the promised date after reconciling actual delivery timestamps from `transit_events`. Median delay vs. promise is +35 days, and even the “best” suppliers in the dataset top out near 13% OTP, meaning the promise process lacks credibility.

## Supplier Reliability
- **Early Deliverers**: Suppliers `S-0165` (Juniper, USA) and `S-0108` (NEC, Mexico) deliver on average ~60 days before promise, explaining the rare OTP positives.
- **Chronic Laggards**: `S-0110` (Cisco, Austria) and `S-0185` (Cisco, Australia) run **+58-63 days** late on average despite strong contractual OTP scores (`on_time_performance` > 0.92). This gap between reported vs. observed OTP should feed vendor scorecard reviews.

## Inventory Health
- **Cash Position**: Average daily on-hand value is **$2.73M** (95th percentile $3.05M). Volatility is modest; variance stems more from category mix than macro swings.
- **Category Concentration**: RAN accounts for **18%** of carrying value (~$181M), followed by Power (12%), Antenna (11%), Core (10%), and Fiber (10%). Six categories already represent 71% of tied-up cash, so focused policy changes there will move the needle fastest.
- **Network Coverage**: Inventory snapshots consistently cover every day of the year, 2k sites, and 5k SKUs, enabling site-level forecasting without interpolation.

## Quality & RMA Dynamics
- **Volume & Warranty**: 40k RMAs with a **70.4%** in-warranty rate flag genuine reliability challenges rather than aging hardware.
- **Top Failure Modes**: `RF_FAULT` (7.7k) dominates, then `OTHER` (6.1k) and `FIRMWARE` (6.0k). Firmware issues that close as RMAs are nearly as common as outright DOA cases (4.9k).
- **Impacted Categories**: RAN (7.5k), Power (4.5k), and Antenna (4.3k) drive most returns, matching the inventory mix and reinforcing where design/QA should focus.
- **Regional Burden**: EMEA sites generate **57%** of all RMAs, APAC 24%, AMER 19%. Pairing this with shipment mode and supplier mix can expose local handling vs. vendor defects.

## Deployment Execution
- **Schedule Drift**: Average `actual_date - planned_date` is **+10.3 days**, with only **27.7%** of phases finishing on or before plan.
- **Data Gaps**: 41% of deployment rows never record an `actual_date`, preventing a full lifecycle analysis. Prioritize upstream completion logging or inference rules (e.g., first related shipment delivery) before automating SLA dashboards.

## Data Quality Watch-outs
- `order_date > ship_date` records dominate; either fix ingestion logic or filter before analytics.
- Deployment actuals missing for 31.9k records; any delay KPI must transparently report coverage.
- `sites` records for Warehouses/Integration Centers omit `operator`, so joins that expect a carrier will mislabel facilities.
- Transit feeds supply real delivery timestamps; shipments without a `Delivered` event keep `actual_delivery_date` null and should be excluded from lead-time stats.

## Recommended Next Analyses
1. **Lead-Time Decomposition**: Separate manufacturing vs. customs vs. inland transit by joining `transit_events` milestones to pinpoint the 187-day transit burden.
2. **Inventory Forecasting**: Use the daily 2k-site snapshots plus PO inbound schedules to predict 30/60/90-day stockouts per SKU, highlighting high-value categories (RAN/Power).
3. **RMA Cost of Quality**: Combine RMA counts with `std_cost_usd` to monetize warranty exposure, then track by supplier to negotiate make-goods.
4. **Deployment Readiness Signals**: Blend shipment ETA, inventory levels, and RMA backlog to explain which sites miss their planned go-live and how much pre-build buffer is needed.

_Analyses performed in `research/comprehensive_analysis.ipynb`, which consolidates all CSV sources and cross-validates with transit events._
