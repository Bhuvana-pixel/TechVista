import numpy as np
from typing import List, Dict, Union

def min_max_scale(value: float, min_val: float, max_val: float, target_min: float = 0.0, target_max: float = 100.0) -> float:
    """Scales a single value to [target_min, target_max] based on min_val and max_val."""
    if max_val <= min_val:
        return (target_min + target_max) / 2.0
    scaled = (value - min_val) / (max_val - min_val)
    clamped = max(0.0, min(1.0, scaled))
    return target_min + clamped * (target_max - target_min)

def log_transform_scale(value: float, min_val: float, max_val: float, target_min: float = 0.0, target_max: float = 100.0) -> float:
    """Logarithmic transform for heavily skewed positive variables like Market Cap and Revenue."""
    val_pos = max(0.01, float(value))
    min_pos = max(0.01, float(min_val))
    max_pos = max(0.01, float(max_val))

    log_v = np.log10(val_pos)
    log_min = np.log10(min_pos)
    log_max = np.log10(max_pos)

    return min_max_scale(log_v, log_min, log_max, target_min, target_max)

def sentiment_to_100(sentiment_score: float) -> float:
    """Converts a [-1.0, 1.0] sentiment score into a [0, 100] scale."""
    clamped = max(-1.0, min(1.0, float(sentiment_score)))
    return round((clamped + 1.0) * 50.0, 2)

def clamp_100(score: float) -> float:
    """Clamps any score strictly between 0.0 and 100.0."""
    return max(0.0, min(100.0, round(float(score), 2)))
