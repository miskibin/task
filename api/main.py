from pathlib import Path
from datetime import date

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from loguru import logger
from pydantic import BaseModel

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
MODELS_DIR = ROOT / "models"
MODELS_DIR.mkdir(exist_ok=True)
MODEL_FILES = sorted(MODELS_DIR.glob("lead_time_*.joblib"))
if not MODEL_FILES:
    raise RuntimeError("Model artifact missing in models/")
MODEL_PATH = MODEL_FILES[0]
MODEL = joblib.load(MODEL_PATH)
logger.info("Loaded {}", MODEL_PATH.name)

suppliers_df = pd.read_csv(DATA_DIR / "suppliers.csv")
sites_df = pd.read_csv(DATA_DIR / "sites.csv")
skus_df = pd.read_csv(DATA_DIR / "skus.csv")
SUPPLIER_LIST = suppliers_df[
    ["supplier_id", "region", "country", "primary_vendor", "on_time_performance", "iso_certified"]
].to_dict("records")
SITE_LIST = sites_df[
    ["site_id", "region", "country", "site_type", "operator"]
].to_dict("records")
SUPPLIER_MAP = suppliers_df.set_index("supplier_id").to_dict("index")
SITE_MAP = sites_df.set_index("site_id").to_dict("index")
SKU_MAP = skus_df.set_index("sku_id").to_dict("index")

NUMERIC_FEATURES = [
    "order_qty",
    "unit_price_usd",
    "value_usd",
    "ship_qty",
    "promised_lead_time_days",
    "ship_lag_from_order_days",
    "planned_transit_days",
    "eta_slip_days",
    "sku_nominal_lead_time_days",
    "supplier_on_time_performance",
]
CATEGORICAL_FEATURES = [
    "region",
    "country",
    "status_po",
    "status_ship",
    "mode",
    "incoterm",
    "origin_country",
    "dest_region",
    "dest_country",
    "dest_site_type",
    "supplier_region",
    "supplier_country",
    "supplier_primary_vendor",
    "sku_category",
    "sku_technology",
]
FEATURE_COLS = NUMERIC_FEATURES + CATEGORICAL_FEATURES


class PredictPayload(BaseModel):
    supplier_id: str
    sku_id: str
    dest_site_id: str
    order_qty: float
    unit_price_usd: float
    order_date: date
    promised_date: date
    region: str | None = None
    country: str | None = None
    status_po: str = "Open"
    status_ship: str | None = None
    mode: str | None = None
    incoterm: str | None = None
    origin_country: str | None = None
    ship_qty: float | None = None
    ship_lag_from_order_days: float | None = None
    planned_transit_days: float | None = None
    eta_slip_days: float | None = None


app = FastAPI()


def build_features(payload: PredictPayload):
    supplier = SUPPLIER_MAP.get(payload.supplier_id)
    if not supplier:
        raise HTTPException(404, f"Unknown supplier {payload.supplier_id}")
    site = SITE_MAP.get(payload.dest_site_id)
    if not site:
        raise HTTPException(404, f"Unknown site {payload.dest_site_id}")
    sku = SKU_MAP.get(payload.sku_id)
    if not sku:
        raise HTTPException(404, f"Unknown sku {payload.sku_id}")
    row = {
        "order_qty": payload.order_qty,
        "unit_price_usd": payload.unit_price_usd,
        "value_usd": payload.order_qty * payload.unit_price_usd,
        "ship_qty": payload.ship_qty,
        "promised_lead_time_days": (payload.promised_date - payload.order_date).days,
        "ship_lag_from_order_days": payload.ship_lag_from_order_days,
        "planned_transit_days": payload.planned_transit_days,
        "eta_slip_days": payload.eta_slip_days,
        "sku_nominal_lead_time_days": sku["supplier_nominal_lead_time_days"],
        "supplier_on_time_performance": supplier["on_time_performance"],
        "region": payload.region or site["region"],
        "country": payload.country or site["country"],
        "status_po": payload.status_po,
        "status_ship": payload.status_ship,
        "mode": payload.mode,
        "incoterm": payload.incoterm,
        "origin_country": payload.origin_country or supplier["country"],
        "dest_region": site["region"],
        "dest_country": site["country"],
        "dest_site_type": site["site_type"],
        "supplier_region": supplier["region"],
        "supplier_country": supplier["country"],
        "supplier_primary_vendor": supplier["primary_vendor"],
        "sku_category": sku["category"],
        "sku_technology": sku["technology"],
    }
    for col in FEATURE_COLS:
        if col not in row:
            row[col] = None
    return pd.DataFrame([row], columns=FEATURE_COLS), row


@app.get("/suppliers")
def suppliers():
    return SUPPLIER_LIST


@app.get("/sites")
def sites():
    return SITE_LIST


@app.post("/predict")
def predict(payload: PredictPayload):
    df, features = build_features(payload)
    prediction = float(MODEL.predict(df)[0])
    return {"predicted_lead_time_days": prediction, "features": features}
