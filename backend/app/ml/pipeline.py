import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, List, Optional
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from app.ml.feature_engineering import (
    COMPANY_FEATURE_COLUMNS,
    TECH_FEATURE_COLUMNS,
    engineer_company_features,
    engineer_technology_features,
)
from app.ml.explainability import generate_factor_attribution

SAVED_MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
os.makedirs(SAVED_MODELS_DIR, exist_ok=True)

class MLPipeline:
    """Production ML pipeline comparing multiple models, chronological splitting, and saving best model."""

    @staticmethod
    def train_company_model(df_metrics: pd.DataFrame) -> Dict[str, Any]:
        """
        Trains company future leadership regressor using chronological split:
        Train: <= 2021
        Val: 2022 - 2023
        Test: >= 2024
        """
        df = engineer_company_features(df_metrics)

        # Target: Next-period composite leadership index
        # Leadership index approximation: 0.3*rev_growth + 0.3*margin + 0.2*rd_intensity + 0.2*tech_adoption
        df["target"] = (
            0.25 * df["revenue_growth"].clip(0, 50) +
            0.25 * df["profit_margin"].clip(0, 40) +
            0.25 * df["technology_adoption"] +
            0.25 * df["rd_intensity"].clip(0, 35)
        )

        features = COMPANY_FEATURE_COLUMNS

        # Chronological split to prevent data leakage
        train_mask = df["year"] <= 2021
        val_mask = (df["year"] >= 2022) & (df["year"] <= 2023)
        test_mask = df["year"] >= 2024

        X_train, y_train = df.loc[train_mask, features], df.loc[train_mask, "target"]
        X_val, y_val = df.loc[val_mask, features], df.loc[val_mask, "target"]
        X_test, y_test = df.loc[test_mask, features], df.loc[test_mask, "target"]

        # If data is small, fallback to 70/30 chronological
        if len(X_train) < 5 or len(X_val) < 2:
            years = sorted(df["year"].unique())
            split_yr = years[int(len(years) * 0.7)]
            X_train, y_train = df.loc[df["year"] <= split_yr, features], df.loc[df["year"] <= split_yr, "target"]
            X_val, y_val = df.loc[df["year"] > split_yr, features], df.loc[df["year"] > split_yr, "target"]
            X_test, y_test = X_val, y_val

        candidate_models = {
            "GradientBoosting": GradientBoostingRegressor(n_estimators=60, max_depth=3, random_state=42),
            "RandomForest": RandomForestRegressor(n_estimators=50, max_depth=4, random_state=42),
            "Ridge": Ridge(alpha=1.0)
        }

        best_name = None
        best_model = None
        best_r2 = -float("inf")
        best_metrics = {}

        for name, model in candidate_models.items():
            model.fit(X_train, y_train)
            preds_val = model.predict(X_val)
            r2 = r2_score(y_val, preds_val)
            mae = mean_absolute_error(y_val, preds_val)
            rmse = np.sqrt(mean_squared_error(y_val, preds_val))

            if r2 > best_r2 or best_model is None:
                best_r2 = r2
                best_name = name
                best_model = model
                best_metrics = {
                    "val_r2": round(float(r2), 3),
                    "val_mae": round(float(mae), 3),
                    "val_rmse": round(float(rmse), 3)
                }

        # Final evaluation on test set
        test_preds = best_model.predict(X_test)
        best_metrics["test_r2"] = round(float(r2_score(y_test, test_preds)), 3)
        best_metrics["test_mae"] = round(float(mean_absolute_error(y_test, test_preds)), 3)
        best_metrics["test_rmse"] = round(float(np.sqrt(mean_squared_error(y_test, test_preds))), 3)

        version = f"v{datetime.utcnow().strftime('%Y%m%d.%H%M')}"
        model_filename = f"company_leadership_{version}.joblib"
        model_path = os.path.join(SAVED_MODELS_DIR, model_filename)
        joblib.dump(best_model, model_path)

        # Baseline mean values for explainability
        baseline_means = X_train.mean().to_dict()
        importances = getattr(best_model, "feature_importances_", [1.0 / len(features)] * len(features))

        return {
            "model_name": "CompanyLeadershipModel",
            "version": version,
            "algorithm": best_name,
            "metrics": best_metrics,
            "features": features,
            "dataset_size": len(df),
            "model_path": model_path,
            "baseline_means": baseline_means,
            "feature_importances": [round(float(x), 4) for x in importances]
        }

    @staticmethod
    def train_technology_model(df_metrics: pd.DataFrame) -> Dict[str, Any]:
        """
        Trains technology future leadership regressor with chronological split.
        """
        df = engineer_technology_features(df_metrics)

        # Target: Tech composite acceleration index
        df["target"] = (
            0.3 * df["market_growth"].clip(0, 60) +
            0.3 * df["adoption_rate"] +
            0.2 * df["industry_interest"] +
            0.2 * df["patent_growth"].clip(0, 50)
        )

        features = TECH_FEATURE_COLUMNS

        train_mask = df["year"] <= 2021
        val_mask = (df["year"] >= 2022) & (df["year"] <= 2023)
        test_mask = df["year"] >= 2024

        X_train, y_train = df.loc[train_mask, features], df.loc[train_mask, "target"]
        X_val, y_val = df.loc[val_mask, features], df.loc[val_mask, "target"]
        X_test, y_test = df.loc[test_mask, features], df.loc[test_mask, "target"]

        if len(X_train) < 5 or len(X_val) < 2:
            years = sorted(df["year"].unique())
            split_yr = years[int(len(years) * 0.7)]
            X_train, y_train = df.loc[df["year"] <= split_yr, features], df.loc[df["year"] <= split_yr, "target"]
            X_val, y_val = df.loc[df["year"] > split_yr, features], df.loc[df["year"] > split_yr, "target"]
            X_test, y_test = X_val, y_val

        candidate_models = {
            "GradientBoosting": GradientBoostingRegressor(n_estimators=60, max_depth=3, random_state=42),
            "RandomForest": RandomForestRegressor(n_estimators=50, max_depth=4, random_state=42),
            "Ridge": Ridge(alpha=1.0)
        }

        best_name = None
        best_model = None
        best_r2 = -float("inf")
        best_metrics = {}

        for name, model in candidate_models.items():
            model.fit(X_train, y_train)
            preds_val = model.predict(X_val)
            r2 = r2_score(y_val, preds_val)
            mae = mean_absolute_error(y_val, preds_val)
            rmse = np.sqrt(mean_squared_error(y_val, preds_val))

            if r2 > best_r2 or best_model is None:
                best_r2 = r2
                best_name = name
                best_model = model
                best_metrics = {
                    "val_r2": round(float(r2), 3),
                    "val_mae": round(float(mae), 3),
                    "val_rmse": round(float(rmse), 3)
                }

        test_preds = best_model.predict(X_test)
        best_metrics["test_r2"] = round(float(r2_score(y_test, test_preds)), 3)
        best_metrics["test_mae"] = round(float(mean_absolute_error(y_test, test_preds)), 3)
        best_metrics["test_rmse"] = round(float(np.sqrt(mean_squared_error(y_test, test_preds))), 3)

        version = f"v{datetime.utcnow().strftime('%Y%m%d.%H%M')}"
        model_filename = f"tech_leadership_{version}.joblib"
        model_path = os.path.join(SAVED_MODELS_DIR, model_filename)
        joblib.dump(best_model, model_path)

        baseline_means = X_train.mean().to_dict()
        importances = getattr(best_model, "feature_importances_", [1.0 / len(features)] * len(features))

        return {
            "model_name": "TechLeadershipModel",
            "version": version,
            "algorithm": best_name,
            "metrics": best_metrics,
            "features": features,
            "dataset_size": len(df),
            "model_path": model_path,
            "baseline_means": baseline_means,
            "feature_importances": [round(float(x), 4) for x in importances]
        }
