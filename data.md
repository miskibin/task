Data Dictionary — human-friendly

Purpose: quick, easy-to-read explanations of the CSV files in `data/`. For each file I list columns and only explain fields that could be unclear to a human reader. I also include up to five real sample rows to make each field concrete.

Note: a technical JSON summary with full counts and types is saved at `tmp_schema_summary.json` in the repo root.

---

deployments.csv (80,000 rows)
- Columns: `project_id`, `site_id`, `operator`, `sku_id`, `phase`, `planned_date`, `actual_date`.
- Quick notes:
  - `operator`: telecom/customer running the site (e.g., 'Telefónica'). Use when slicing by customer.
  - `phase`: deployment stage. Common values and meanings: Materials Ready, Planning, Integration, Commissioning, On-Air, Blocked, Cancelled.
  - `planned_date`: intended date. `actual_date`: observed completion (often blank for future/in-progress items).

Sample rows (first 5):
project_id | site_id  | operator      | sku_id   | phase           | planned_date | actual_date
PJ-0000001 | ST-01502 | Telefónica    | SKU-03396| Materials Ready | 2024-02-11   | (null)
PJ-0000002 | ST-01637 | Telia         | SKU-02125| Materials Ready | 2024-01-01   | (null)
PJ-0000003 | ST-01988 | Bharti Airtel | SKU-00348| Materials Ready | 2025-01-01   | (null)
PJ-0000004 | ST-01992 | Telia         | SKU-04214| Materials Ready | 2023-08-22   | (null)
PJ-0000005 | ST-00840 | Rogers        | SKU-01585| Integration     | 2024-04-12   | 2024-04-22

---

inventory_snapshots.csv (200,000 rows)
- Columns: `site_id`, `sku_id`, `snapshot_date`, `on_hand_qty`, `allocated_qty`, `in_transit_qty`.
- Quick notes:
  - `snapshot_date`: date of the inventory snapshot.
  - `allocated_qty`: reserved units; `in_transit_qty`: units en route.

Sample rows (first 5):
site_id  | sku_id   | snapshot_date | on_hand_qty | allocated_qty | in_transit_qty
ST-01489 | SKU-03098| 2025-10-03    | 9           | 4             | 2
ST-00841 | SKU-00755| 2025-01-08    | 18          | 2             | 3
ST-00771 | SKU-01482| 2025-04-08    | 7           | 2             | 4
ST-01017 | SKU-00406| 2024-12-22    | 9           | 6             | 2
ST-01897 | SKU-02690| 2025-01-31    | 10          | 4             | 2

---

purchase_orders.csv (150,000 rows)
- Columns: `po_id`, `supplier_id`, `sku_id`, `order_qty`, `unit_price_usd`, `order_date`, `promised_date`, `region`, `country`, `status`.
- Quick notes:
  - `region`: one of EMEA / APAC / AMER (used across datasets).
  - `promised_date`: supplier's promised delivery date (may differ from shipment ETA).
  - `status`: PO lifecycle: Closed, Open, Partially Received, Cancelled.
  - Compute order value as `order_qty * unit_price_usd` when needed.

Sample rows (first 5):
po_id      | supplier_id | sku_id   | order_qty | unit_price_usd | order_date  | promised_date | region | country | status
PO-0000001 | S-0161      | SKU-02137| 14        | 305.99         | 2024-02-17  | 2024-03-15    | EMEA   | France  | Closed
PO-0000002 | S-0043      | SKU-04868| 6         | 197.63         | 2024-12-31  | 2025-01-23    | EMEA   | UK      | Open
PO-0000003 | S-0055      | SKU-02915| 9         | 140.06         | 2023-05-04  | 2023-05-26    | EMEA   | UK      | Closed
PO-0000004 | S-0051      | SKU-03909| 12        | 760.98         | 2025-06-21  | 2025-07-20    | APAC   | Vietnam | Closed
PO-0000005 | S-0098      | SKU-03079| 13        | 754.72         | 2024-05-19  | 2024-06-04    | AMER   | Chile   | Closed

---

rma_returns.csv (40,000 rows)
- Columns: `rma_id`, `sku_id`, `site_id`, `reason_code`, `rma_date`, `under_warranty`.
- Quick notes (reason_code decoding):
  - DOA — Dead on Arrival (hardware failed on receipt)
  - RF_FAULT — radio-frequency fault
  - MECH_DAMAGE — physical/mechanical damage
  - FIRMWARE — firmware/software issue
  - INTERMITTENT — non-deterministic/occasional faults
  - OVERHEAT — thermal failure
  - NO_POWER — device does not power on
  - OTHER — misc/unclassified
  - `under_warranty` — boolean: True when item is under warranty.

Sample rows (first 5):
rma_id     | sku_id   | site_id | reason_code | rma_date   | under_warranty
RMA-0000001 | SKU-00206| ST-01094| DOA         | 2024-10-15 | True
RMA-0000002 | SKU-02303| ST-01174| RF_FAULT    | 2023-11-05 | False
RMA-0000003 | SKU-04015| ST-01643| RF_FAULT    | 2025-03-26 | True
RMA-0000004 | SKU-00438| ST-01539| DOA         | 2025-02-25 | True
RMA-0000005 | SKU-02819| ST-00776| MECH_DAMAGE | 2023-06-02 | True

---

shipments.csv (217,500 rows)
- Columns: `shipment_id`, `po_id`, `ship_qty`, `mode`, `incoterm`, `origin_country`, `dest_site_id`, `ship_date`, `eta_date`, `status`.
- Quick notes:
  - `mode`: Road, Sea, Rail, Air.
  - `incoterm`: common values and what they generally mean:
    - EXW — buyer picks up goods; minimal seller responsibilities.
    - FOB — seller responsible until goods are on board.
    - CIF — seller pays cost, insurance, freight to arrival port.
    - DAP — seller delivers to place; buyer unloads.
    - DDP — seller delivers and pays duties.
  - `status`: Created, In Transit, Delivered, Delayed, Lost.
  - `ship_date` is departure; `eta_date` is expected arrival (may be planned ETA).

Sample rows (first 5):
shipment_id | po_id      | ship_qty | mode | incoterm | origin_country | dest_site_id | ship_date  | eta_date   | status
SH-00000001 | PO-0104861 | 6        | Road | CIF      | Mexico         | ST-00452     | 2025-02-03 | 2025-02-10 | Delivered
SH-00000002 | PO-0099598 | 3        | Sea  | EXW      | India          | ST-00086     | 2024-08-21 | 2024-09-27 | Delayed
SH-00000003 | PO-0110843 | 8        | Road | FOB      | Italy          | ST-00252     | 2023-01-21 | 2023-01-30 | In Transit
SH-00000004 | PO-0047627 | 6        | Sea  | FOB      | Argentina      | ST-00800     | 2023-07-03 | 2023-08-05 | In Transit
SH-00000005 | PO-0003236 | 6        | Road | DAP      | Brazil         | ST-01995     | 2025-06-19 | 2025-06-27 | Delivered

---

sites.csv (2,000 rows)
- Columns: `site_id`, `region`, `country`, `site_type`, `operator`, `latitude`, `longitude`.
- Quick notes:
  - `region`: EMEA / APAC / AMER.
  - `site_type`: Cell Site, Warehouse, Integration Center, Data Center.
  - `operator`: may be missing for some sites.

Sample rows (first 5):
site_id  | region | country     | site_type        | operator | latitude  | longitude
ST-00001 | EMEA   | Italy       | Cell Site        | Three    | 44.65748  | -3.44596
ST-00002 | APAC   | South Korea | Cell Site        | Singtel  | 19.46501  | 122.29595
ST-00003 | EMEA   | Austria     | Warehouse        | (null)   | 41.41491  | 27.75070
ST-00004 | EMEA   | Italy       | Integration Ctr. | (null)   | 51.17115  | -1.20329
ST-00005 | AMER   | Canada      | Cell Site        | Verizon  | -19.96994 | -93.20117

---

skus.csv (5,000 rows)
- Columns: `sku_id`, `vendor`, `category`, `technology`, `unit_weight_kg`, `unit_volume_m3`, `std_cost_usd`, `supplier_nominal_lead_time_days`.
- Quick notes:
  - `technology`: 5G / 4G / Dual (4G/5G).
  - `supplier_nominal_lead_time_days`: typical supplier lead-time in days.

Sample rows (first 5):
sku_id   | vendor  | category         | technology | unit_weight_kg | unit_volume_m3 | std_cost_usd | supplier_nominal_lead_time_days
SKU-00001| Juniper | Cabling          | 5G         | 11.01          | 0.1236         | 360.72       | 27
SKU-00002| ZTE     | Power            | 5G         | 8.82           | 0.0980         | 965.54       | 81
SKU-00003| Ciena   | Microwave        | 4G         | 26.61          | 0.2840         | 1022.40      | 20
SKU-00004| Samsung | Microwave        | 4G         | 4.89           | 0.0684         | 544.35       | 85
SKU-00005| Juniper | Optical Transport| 4G         | 31.83          | 0.3347         | 1566.84      | 22

---

suppliers.csv (200 rows)
- Columns: `supplier_id`, `region`, `country`, `primary_vendor`, `on_time_performance`, `iso_certified`.
- Quick notes:
  - `on_time_performance`: fraction (0–1) of historical on-time deliveries.
  - `iso_certified`: boolean flag for ISO certification.

Sample rows (first 5):
supplier_id | region | country  | primary_vendor | on_time_performance | iso_certified
S-0001      | APAC   | Malaysia | Huawei         | 0.882               | True
S-0002      | EMEA   | Germany  | NEC            | 0.842               | True
S-0003      | EMEA   | Austria  | Cisco          | 0.933               | True
S-0004      | APAC   | S Korea  | Ericsson       | 0.959               | True
S-0005      | EMEA   | Spain    | Nokia          | 0.873               | True

---

transit_events.csv (400,000 rows)
- Columns: `shipment_id`, `event_ts`, `location_type`, `event_status`.
- Quick notes:
  - `event_ts`: timestamp for event (YYYY-MM-DD HH:MM:SS format in source).
  - `location_type`: where the event occurred (On Vehicle, Regional Hub, Seaport, Airport, Origin DC, Final DC, Rail Yard, Customs, Destination).
  - `event_status`: event-level state (Picked, Departed Origin, Arrived Hub, Out for Delivery, Delivered, Customs Hold, Created, etc.).

Sample rows (first 5):
shipment_id  | event_ts            | location_type | event_status
SH-00145406  | 2023-01-01 00:00:00 | On Vehicle    | Picked
SH-00074867  | 2023-01-01 00:00:00 | Regional Hub  | Out for Delivery
SH-00132727  | 2023-01-01 00:00:00 | Destination   | In Transit
SH-00196731  | 2023-01-01 00:00:00 | Seaport       | Out for Delivery
SH-00061224  | 2023-01-01 00:00:00 | Airport       | In Transit

---

Next steps I can do for you (pick one):
- Export a `data_dictionary.json` with types, null counts and sample values (machine readable).
- Save the sample rows per dataset as separate CSVs under `examples/`.
- Create cleaned copies with date columns normalized to ISO datetimes.

Reply with which follow-up you want and I'll implement it.

# Dataset Notes — plain English

This document explains the datasets in `data/`. For each file I list columns, and only explain fields that could be unclear or need decoding for a human reader. If a field is straightforward (IDs, dates, numeric counts) I leave it implicit.

Files scanned: 9. If you want a full technical schema (types, null counts, sample values), the notebook `research/explore_data_schema.ipynb` contains that output.

---

**`deployments.csv`** (80,000 rows)
- Columns present: `project_id`, `site_id`, `operator`, `sku_id`, `phase`, `planned_date`, `actual_date`.
- Explanations for unclear fields:
	- **`operator`**: the telecom or customer company operating the site (e.g., Telefónica, Verizon). Use this when you want to slice deployments by customer/operator.
	- **`phase`**: deployment lifecycle stage. Observed values include "Materials Ready", "Integration", "Planning", "Commissioning", "On-Air", "Blocked", "Cancelled". Rough meanings:
		- Materials Ready: parts have arrived and are ready for build.
		- Planning: scheduling/approval stage.
		- Integration: on-site installation and integration work.
		- Commissioning: testing and handover activities.
		- On-Air: deployment completed and service active.
		- Blocked: deployment cannot proceed (dependencies/issues).
		- Cancelled: deployment was cancelled.
	- **`planned_date` vs `actual_date`**: `planned_date` is the intended finish or start date; `actual_date` is the real completion (often null for future or incomplete projects).

---

**`inventory_snapshots.csv`** (200,000 rows)
- Columns present: `site_id`, `sku_id`, `snapshot_date`, `on_hand_qty`, `allocated_qty`, `in_transit_qty`.
- Explanations:
	- **`snapshot_date`**: the date the inventory counts were observed (one snapshot per date per site/sku).
	- `on_hand_qty`, `allocated_qty`, `in_transit_qty` are numeric counts. `allocated_qty` is reserved for orders; `in_transit_qty` is stock currently moving to the site.

---

**`purchase_orders.csv`** (150,000 rows)
- Columns present: `po_id`, `supplier_id`, `sku_id`, `order_qty`, `unit_price_usd`, `order_date`, `promised_date`, `region`, `country`, `status`.
- Explanations for fields that matter:
	- **`region`**: coarse geographic region used across datasets: `EMEA` = Europe/Middle East/Africa, `APAC` = Asia Pacific, `AMER` = Americas. Useful for regional spend or lead-time analysis.
	- **`promised_date`**: supplier promised delivery date (not necessarily the ETA recorded in shipments).
	- **`status`**: PO life-state; observed values include `Closed`, `Open`, `Partially Received`, `Cancelled`. "Partially Received" means some lines/quantities were delivered but the PO is not fully closed.
	- `unit_price_usd` and `order_qty` are used to compute order value (`order_qty * unit_price_usd`).

---

**`rma_returns.csv`** (40,000 rows)
- Columns present: `rma_id`, `sku_id`, `site_id`, `reason_code`, `rma_date`, `under_warranty`.
- Explanations / decoding:
	- **`reason_code`**: short codes for why the unit was returned. Observed values and typical meanings:
		- `DOA`: Dead On Arrival (device failed immediately on receipt).
		- `RF_FAULT`: Radio-frequency related fault.
		- `MECH_DAMAGE`: Mechanical damage (physical breakage).
		- `FIRMWARE`: Firmware/software issue causing return.
		- `INTERMITTENT`: Intermittent failure (sporadic behavior).
		- `OVERHEAT`: Thermal issue causing failure.
		- `NO_POWER`: Unit does not power on.
		- `OTHER`: Miscellaneous/unclassified reasons.
	- **`under_warranty`**: boolean flag (True/False) indicating whether the returned item was covered by warranty.

---

**`shipments.csv`** (217,500 rows)
- Columns present: `shipment_id`, `po_id`, `ship_qty`, `mode`, `incoterm`, `origin_country`, `dest_site_id`, `ship_date`, `eta_date`, `status`.
- Explanations / decoding:
	- **`mode`**: transport mode — `Road`, `Sea`, `Rail`, `Air`.
	- **`incoterm`**: international commercial terms indicating seller/buyer responsibilities. Common values observed:
		- `EXW` (Ex Works): buyer picks up goods; minimal seller responsibility.
		- `FOB` (Free On Board): seller responsible until goods loaded on vessel.
		- `CIF` (Cost, Insurance & Freight): seller pays cost, insurance and freight to arrival port.
		- `DAP` (Delivered At Place): seller delivers to destination, buyer unloads.
		- `DDP` (Delivered Duty Paid): seller pays all costs to delivery and duties.
	- **`status`**: shipment lifecycle label. Observed: `Created` (record created), `In Transit`, `Delivered`, `Delayed`, `Lost`.
	- **`eta_date` vs `ship_date`**: `ship_date` is when goods left origin; `eta_date` is expected arrival. The analysis computes `delivery_days = eta_date - ship_date` to measure transit time (note: these are sometimes planned ETA values, not actual arrival timestamps).

---

**`sites.csv`** (2,000 rows)
- Columns present: `site_id`, `region`, `country`, `site_type`, `operator`, `latitude`, `longitude`.
- Explanations:
	- **`region`**: same high-level regions as above (`EMEA`, `APAC`, `AMER`).
	- **`site_type`**: classification of the physical location. Observed types: `Cell Site`, `Warehouse`, `Integration Center`, `Data Center`.
	- **`operator`**: the customer/operator that owns or runs the site; some sites have no operator value (missing).

---

**`skus.csv`** (5,000 rows)
- Columns present: `sku_id`, `vendor`, `category`, `technology`, `unit_weight_kg`, `unit_volume_m3`, `std_cost_usd`, `supplier_nominal_lead_time_days`.
- Explanations:
	- **`technology`**: network generation / intended tech: `5G`, `4G`, or `Dual (4G/5G)`.
	- **`supplier_nominal_lead_time_days`**: typical supplier lead-time in days (useful for procurement planning).
	- `vendor` and `category` are descriptive (manufacturer/part family).

---

**`suppliers.csv`** (200 rows)
- Columns present: `supplier_id`, `region`, `country`, `primary_vendor`, `on_time_performance`, `iso_certified`.
- Explanations:
	- **`on_time_performance`**: numeric rate (0–1) representing the supplier's historical on-time delivery performance; higher is better.
	- **`iso_certified`**: boolean indicating whether the supplier has ISO certification on record.
	- **`primary_vendor`**: the vendor brand the supplier typically supplies (e.g., Nokia, Huawei).

---

**`transit_events.csv`** (400,000 rows)
- Columns present: `shipment_id`, `event_ts`, `location_type`, `event_status`.
- Explanations and common values:
	- **`location_type`**: where the event occurred, e.g., `On Vehicle`, `Regional Hub`, `Origin DC` (distribution center), `Final DC`, `Seaport`, `Airport`, `Rail Yard`, `Customs`. Use this to understand where delays happen.
	- **`event_status`**: granular event state for the shipment. Examples and meanings:
		- `Created`: event record created in system.
		- `Picked`: items picked from origin/warehouse.
		- `Departed Origin`: left origin distribution center.
		- `Arrived Hub`: arrived at a regional hub.
		- `Released`: cleared customs or released for next leg.
		- `Out for Delivery`: final delivery leg started.
		- `Delivered`: delivery completed.
		- `Customs Hold`: shipment held at customs (possible delay).

---

If you'd like, I can now:
- add short example rows inline for each file (3 rows) to make fields concrete,
- produce a `data_dictionary.json` with types, null counts and example values,
- or convert date-like columns to ISO datetimes in a copy for easier analysis.

Tell me which of the follow-ups you'd like and I'll proceed.
---

## File: `deployments.csv` (80,000 rows)
Columns:
- `project_id` (object) — 0 nulls, 80,000 unique
- `site_id` (object) — 0 nulls, 1,299 unique
- `operator` (object) — 0 nulls, 23 unique
- `sku_id` (object) — 0 nulls, 5,000 unique
- `phase` (object) — 0 nulls, 7 unique (not an enum by our <=5 rule)
- `planned_date` (object) — 0 nulls, 1,034 unique (date strings)
- `actual_date` (object) — 32,893 nulls, 1,087 unique (date strings)

Notes: `phase` has several categorical values (e.g., "Materials Ready", "Integration", "Planning", "Commissioning", "On-Air", "Blocked", "Cancelled") but exceeds the 5-value enum threshold. Many `actual_date` are missing (future/planned deployments).

---

## File: `inventory_snapshots.csv` (200,000 rows)
Columns:
- `site_id` (object) — 0 nulls, 2,000 unique
- `sku_id` (object) — 0 nulls, 5,000 unique
- `snapshot_date` (object) — 0 nulls, 365 unique
- `on_hand_qty` (int) — 0 nulls, 29 unique
- `allocated_qty` (int) — 0 nulls, 16 unique
- `in_transit_qty` (int) — 0 nulls, 15 unique

Notes: Quantities are small-integer distributions (likely aggregated counts). No enum candidates here by the <=5 rule.

---

## File: `purchase_orders.csv` (150,000 rows)
Columns:
- `po_id` (object) — 0 nulls, 150,000 unique
- `supplier_id` (object) — 0 nulls, 200 unique
- `sku_id` (object) — 0 nulls, 5,000 unique
- `order_qty` (int) — 0 nulls, 24 unique
- `unit_price_usd` (float) — 0 nulls, 84,454 unique
- `order_date` (object) — 0 nulls, 1,034 unique
- `promised_date` (object) — 0 nulls, 1,088 unique
- `region` (object) — 0 nulls, 3 unique — ENUM
- `country` (object) — 0 nulls, 27 unique
- `status` (object) — 0 nulls, 4 unique — ENUM

Enums and explanations:
- `region`: ["EMEA", "APAC", "AMER"] — standard region grouping (Europe / Middle East & Africa, Asia Pacific, Americas).
- `status`: ["Closed", "Open", "Partially Received", "Cancelled"] — PO lifecycle state. "Partially Received" means partial deliveries have been accepted against the PO.

Derived fields used in analysis:
- `total_value` = `order_qty` * `unit_price_usd` (computed during analysis to get PO value by region/supplier).

---

## File: `rma_returns.csv` (40,000 rows)
Columns:
- `rma_id` (object) — 0 nulls, 40,000 unique
- `sku_id` (object) — 0 nulls, 4,998 unique
- `site_id` (object) — 0 nulls, 2,000 unique
- `reason_code` (object) — 0 nulls, 8 unique (DOA, RF_FAULT, MECH_DAMAGE, FIRMWARE, INTERMITTENT, OVERHEAT, OTHER, NO_POWER)
- `rma_date` (object) — 0 nulls, 1,034 unique
- `under_warranty` (bool) — 0 nulls, 2 unique — ENUM

Enums and explanations:
- `under_warranty`: [true, false] — whether the returned unit was under warranty at time of return.

Notes: `reason_code` has 8 distinct values (slightly above the enum threshold) but the values are standard RMA reason codes.

---

## File: `shipments.csv` (217,500 rows)
Columns:
- `shipment_id` (object) — 0 nulls, 217,500 unique
- `po_id` (object) — 0 nulls, 115,005 unique
- `ship_qty` (int) — 0 nulls, 17 unique
- `mode` (object) — 0 nulls, 4 unique — ENUM
- `incoterm` (object) — 0 nulls, 5 unique — ENUM
- `origin_country` (object) — 0 nulls, 27 unique
- `dest_site_id` (object) — 0 nulls, 2,000 unique
- `ship_date` (object) — 0 nulls, 1,034 unique
- `eta_date` (object) — 0 nulls, 1,074 unique
- `status` (object) — 0 nulls, 5 unique — ENUM

Enums and explanations:
- `mode`: ["Road", "Sea", "Rail", "Air"] — primary transport mode.
- `incoterm`: ["CIF", "EXW", "FOB", "DAP", "DDP"] — common Incoterms used in international shipping:
	- `EXW` (Ex Works): buyer bears most costs/risks after collection.
	- `FOB` (Free On Board): seller responsible until goods on board vessel.
	- `CIF` (Cost, Insurance & Freight): seller pays cost, insurance and freight to destination port.
	- `DAP` (Delivered At Place): seller delivers when goods are ready for unloading at destination.
	- `DDP` (Delivered Duty Paid): seller delivers and pays all duties and costs.
- `status`: ["Delivered", "Delayed", "In Transit", "Created", "Lost"] — shipment lifecycle states; "Created" = record created, "Lost" = missing.

Derived/computed field used in analysis:
- `delivery_days` = (`eta_date` - `ship_date`).days

---

## File: `sites.csv` (2,000 rows)
Columns:
- `site_id` (object) — 0 nulls, 2,000 unique
- `region` (object) — 0 nulls, 3 unique — ENUM
- `country` (object) — 0 nulls, 27 unique
- `site_type` (object) — 0 nulls, 4 unique — ENUM
- `operator` (object) — 701 nulls, 23 unique
- `latitude` (float) — 0 nulls
- `longitude` (float) — 0 nulls

Enums and explanations:
- `region`: ["EMEA", "APAC", "AMER"] — same region grouping used across datasets.
- `site_type`: ["Cell Site", "Warehouse", "Integration Center", "Data Center"] — high-level site classification.

Notes: `operator` is often missing for many sites (701 nulls).

---

## File: `skus.csv` (5,000 rows)
Columns:
- `sku_id` (object) — 0 nulls, 5,000 unique
- `vendor` (object) — 0 nulls, 10 unique
- `category` (object) — 0 nulls, 10 unique
- `technology` (object) — 0 nulls, 3 unique — ENUM
- `unit_weight_kg` (float) — 0 nulls
- `unit_volume_m3` (float) — 0 nulls
- `std_cost_usd` (float) — 0 nulls
- `supplier_nominal_lead_time_days` (int) — 0 nulls

Enums and explanations:
- `technology`: ["5G", "4G", "Dual (4G/5G)"] — indicates the target network technology for the SKU.

---

## File: `suppliers.csv` (200 rows)
Columns:
- `supplier_id` (object) — 0 nulls, 200 unique
- `region` (object) — 0 nulls, 3 unique — ENUM
- `country` (object) — 0 nulls, 27 unique
- `primary_vendor` (object) — 0 nulls, 10 unique
- `on_time_performance` (float) — 0 nulls
- `iso_certified` (bool) — 0 nulls, 2 unique — ENUM

Enums and explanations:
- `region`: ["APAC", "EMEA", "AMER"] — supplier geographic region.
- `iso_certified`: [true, false] — indicates ISO certification status.

---

## File: `transit_events.csv` (400,000 rows)
Columns:
- `shipment_id` (object) — 0 nulls, 182,959 unique
- `event_ts` (object) — 0 nulls, 24,816 unique (timestamps)
- `location_type` (object) — 0 nulls, 9 unique (e.g., "On Vehicle", "Regional Hub", "Destination", "Seaport", "Airport", "Origin DC", "Final DC", "Rail Yard", "Customs")
- `event_status` (object) — 0 nulls, 9 unique (e.g., "Picked", "Out for Delivery", "In Transit", "Delivered", "Arrived Hub", "Released", "Departed Origin", "Customs Hold", "Created")

Notes: Event-level stream for shipments. `location_type` and `event_status` give granular progress states but exceed the 5-value enum threshold.

---

## Recommendations / Next steps
- I can (option A) update this file to include exact sample rows and typed suggestions (e.g., convert date columns to ISO datetimes) — I can extract 3 sample rows per file.
- Or (option B) produce a `data_dictionary.json` with schema entries (name, dtype, nulls, unique_count, example_values).
- I can also create a small notebook `research/explore_data_schema.ipynb` that runs the same inspection and displays summary tables and example rows (recommended for reproducibility).

Which option do you want me to do next? If you want the notebook and/or the JSON dictionary, I can create them now and update the repo.
