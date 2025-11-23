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


Tables:

transit_events.csv

shipment_id,event_ts,location_type,event_status
SH-00145406,2023-01-01 00:00:00,On Vehicle,Picked
SH-00074867,2023-01-01 00:00:00,Regional Hub,Out for Delivery
SH-00132727,2023-01-01 00:00:00,Destination,In Transit


purchase_orders.csv

po_id,supplier_id,sku_id,order_qty,unit_price_usd,order_date,promised_date,region,country,status
PO-0000001,S-0161,SKU-02137,14,305.99,2024-02-17,2024-03-15,EMEA,France,Closed
PO-0000002,S-0043,SKU-04868,6,197.63,2024-12-31,2025-01-23,EMEA,UK,Open
PO-0000003,S-0055,SKU-02915,9,140.06,2023-05-04,2023-05-26,EMEA,UK,Closed

skus.csv

sku_id,vendor,category,technology,unit_weight_kg,unit_volume_m3,std_cost_usd,supplier_nominal_lead_time_days
SKU-00001,Juniper,Cabling,5G,11.01,0.1236,360.72,27
SKU-00002,ZTE,Power,5G,8.82,0.098,965.54,81
SKU-00003,Ciena,Microwave,4G,26.61,0.284,1022.4,20

deployments.csv

project_id,site_id,operator,sku_id,phase,planned_date,actual_date
PJ-0000001,ST-01502,Telefónica,SKU-03396,Materials Ready,2024-02-11,
PJ-0000002,ST-01637,Telia,SKU-02125,Materials Ready,2024-01-01,
PJ-0000003,ST-01988,Bharti Airtel,SKU-00348,Materials Ready,2025-01-01,
PJ-0000004,ST-01992,Telia,SKU-04214,Materials Ready,2023-08-22,

rma_returns.csv

rma_id,sku_id,site_id,reason_code,rma_date,under_warranty
RMA-0000001,SKU-00206,ST-01094,DOA,2024-10-15,True
RMA-0000002,SKU-02303,ST-01174,RF_FAULT,2023-11-05,False
RMA-0000003,SKU-04015,ST-01643,RF_FAULT,2025-03-26,True

inventory_snapshots.csv

site_id,sku_id,snapshot_date,on_hand_qty,allocated_qty,in_transit_qty
ST-01489,SKU-03098,2025-10-03,9,4,2
ST-00841,SKU-00755,2025-01-08,18,2,3
ST-00771,SKU-01482,2025-04-08,7,2,4

sites.csv

site_id,region,country,site_type,operator,latitude,longitude
ST-00001,EMEA,Italy,Cell Site,Three,44.65748,-3.44596
ST-00002,APAC,South Korea,Cell Site,Singtel,19.46501,122.29595
ST-00003,EMEA,Austria,Warehouse,,41.41491,27.7507

shipments.csv

shipment_id,po_id,ship_qty,mode,incoterm,origin_country,dest_site_id,ship_date,eta_date,status
SH-00000001,PO-0104861,6,Road,CIF,Mexico,ST-00452,2025-02-03,2025-02-10,Delivered
SH-00000002,PO-0099598,3,Sea,EXW,India,ST-00086,2024-08-21,2024-09-27,Delayed
SH-00000003,PO-0110843,8,Road,FOB,Italy,ST-00252,2023-01-21,2023-01-30,In Transit