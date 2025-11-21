Keys & joins
- sku_id joins across all operational tables.
- supplier_id ⇄ purchase_orders.
- po_id ⇄ shipments.
- shipment_id ⇄ transit_events.
- site_id joins with inventory, deployments, RMA, and shipments’ dest_site_id

Assignment
Use any model to provide valuable information to business users that will help improve their performance. 
You can answer one or more of the following problem statements:
- Given a new purchase order, what is the predicted actual lead time?
- What is the probability this shipment will be delayed?
- Forecast site-level inventory for each SKU for the next 30/60/90 days
- Predict the probability that a SKU will be returned under warranty.
- Detect abnormal shipment transit times (e.g., lost shipments).
- Detect sites with abnormal failure rates (RMA spike detection).
- Which Incoterm tends to minimize total cost for each region?
Or come up with your own. 
Feel free to create UI, visualize, document, or enrich the data. 
