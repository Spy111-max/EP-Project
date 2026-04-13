from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
ENRICHED_DATA_DIR = DATA_DIR / "enriched"
ENV_DATA_DIR = DATA_DIR / "environment"
MODEL_DIR = BASE_DIR / "models"
MODEL_FILE = MODEL_DIR / "species_recommender.pkl"
MODEL_META_FILE = MODEL_DIR / "species_recommender_meta.json"
