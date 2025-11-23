PO - Pucharse orders
Region: 
EMEA: Europe, Middle East, and Africa
APAC: Asia-Pacific
AMER: Americas   

#### Shippment status

```{mermaid}
stateDiagram-v2
    Created --> In_Transit
    In_Transit --> Delivered
    In_Transit --> Delayed
    In_Transit --> Lost
    Delayed --> Delivered
    Delayed --> Lost
```



#### Incoterms (rules for responsibilities between buyer and seller)

| Term | Full name | Responsibility summary |
|---|---|---|
| FOB | Free On Board | Seller responsible until goods are on board the ship; buyer bears costs/risks thereafter. |
| DAP | Delivered At Place | Seller delivers to a named destination ready for unloading and bears risks until that point. |
| CIF | Cost, Insurance and Freight | Seller pays cost, insurance and freight to destination port; risk transfers to buyer once goods are on board. |
| DDP | Delivered Duty Paid | Seller handles all costs and risks, including import duties, to final destination. |
| EXW | Ex Works | Seller makes goods available at their premises; buyer handles transport costs and risks from there. |

#### RMA - Return Merchandise Authorization
po polsku - Autoryzacja Zwrotu Towaru, czyli zgoda udzielona przez Nokie na zwrot zakupionego towaru.

| Code | Description |
|---|---|
| RF_FAULT | Fault related to Radio Frequency components or functionality (most frequent). |
| OTHER | General category for reasons not covered by specific codes. |
| FIRMWARE | Issues related to the device's embedded software. |
| DOA | Dead On Arrival — non-functional upon initial receipt. |
| INTERMITTENT | Problems that occur sporadically or inconsistently. |
| MECH_DAMAGE | Mechanical damage to the product. |
| NO_POWER | Device fails to power on. |
| OVERHEAT | Device experiences excessive heat, potentially causing malfunction. |


#### SKU - Stock Keeping Unit


| Category | Short description |
|---|---|
| Microwave | Wireless backhaul links for data/voice/video between sites where fiber is impractical. |
| Optical Transport | Equipment (WDM/DWDM) that carries multiple data streams over fiber for backbone transport. |
| Edge Router | High-capacity router at the network edge handling routing, security and QoS to external networks. |
| Cabling | Physical cables and supporting infrastructure (fiber, copper, power trays, connectors). |
| Small Cell | Low-power compact base stations that boost coverage/capacity in localized areas. |
| Fiber | Fiber optic cables and passive components (cables, connectors, PON elements). |
| Core | Central network infrastructure that aggregates traffic and connects to other networks/Internet. |
| Antenna | Radio transmit/receive hardware for base stations, microwave links and other wireless systems. |
| Power | Power systems (batteries, rectifiers, UPS) that ensure continuous equipment operation. |
| RAN | Radio Access Network: base stations, antennas and controllers that connect devices to the network. |



## Four Date/Lead Time Fields Explained

| Field | Source | What It Means |
|-------|--------|----------------|
| **`promised_date`** | **PURCHASE_ORDERS** | The delivery date the **supplier promised** when the PO was placed. This is the supplier's commitment. |
| **`supplier_nominal_lead_time_days`** | **SKUS** | The **typical lead time** (in days) for that SKU according to the supplier's standard. It's a baseline expectation. |
| **`ship_date`** | **SHIPMENTS** | When the goods **actually left the origin** (supplier's warehouse). This is when the shipment starts its journey. |
| **`eta_date`** | **SHIPMENTS** | The **expected/planned arrival date** at the destination. This is the shipment's target delivery date. |

---

## Timeline Visualization

```
ORDER PLACED                GOODS SHIPPED              EXPECTED ARRIVAL          ACTUAL DELIVERY
order_date                  ship_date                  eta_date                  delivery_date
   |                            |                           |                         |
   |<--- Mfg/Prep Time -------->|                           |                         |
   |   (supplier_nominal_       |<------- Transit Time ----->|                         |
   |    lead_time_days)         |                           |                         |
   |                            |                           |<---- Late/On-Time ---->|
   |<------------ promised_date ---------->|               |
   |                                       (supplier's    |
   |                                        commitment)   |
```

## !IMPORTANT
sometimes `order date` is after `ship date` due to data quality issues.




- Forecast site-level inventory for each SKU for the next 30/60/90 days

ile jakiego produktu(SKU) jest w danym magazynie

inventory snapshot mowi nam ile go bylo w poszczegolnych dniach

na podstawie #pucharse_orders - wiemy kiedy ile zamowilismy `qty_ordered` i kiedy powinno do nas dotrzec `promised_date`
