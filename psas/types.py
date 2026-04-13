from dataclasses import dataclass


@dataclass
class ZoneProfile:
    pm25: float
    pm10: float
    nox: float
    sox: float
    co2: float
    soil: str
    rainfall_mm: float
    temperature_c: float
    zone_type: str
