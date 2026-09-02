import io
import csv
import pandas as pd
from typing import Dict, Any, List, Tuple

COMPANY_REQUIRED_COLS = ["name", "ticker", "industry"]
TECH_REQUIRED_COLS = ["name", "category"]
COMPANY_METRIC_REQUIRED_COLS = ["ticker", "year", "revenue", "revenue_growth", "profit", "profit_margin", "market_cap", "rd_spending", "investment", "patents"]
TECH_METRIC_REQUIRED_COLS = ["technology_name", "year", "investment", "patent_count", "research_papers", "adoption_rate", "market_size", "market_growth"]

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 # 5 MB

def validate_csv_upload(
    file_bytes: bytes,
    filename: str,
    dataset_type: str
) -> Tuple[bool, List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Validates CSV structure, columns, data types, and value constraints.
    Returns: (is_valid, records_parsed, errors_list)
    """
    errors = []

    if not filename.lower().endswith(".csv"):
        errors.append({"row": 0, "column": "file", "message": "Only .csv format is supported."})
        return False, [], errors

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        errors.append({"row": 0, "column": "file", "message": "File exceeds maximum permitted size (5MB)."})
        return False, [], errors

    try:
        content_str = file_bytes.decode("utf-8-sig")
    except UnicodeDecodeError:
        try:
            content_str = file_bytes.decode("latin-1")
        except Exception:
            errors.append({"row": 0, "column": "file", "message": "Failed to decode CSV text encoding."})
            return False, [], errors

    try:
        df = pd.read_csv(io.StringIO(content_str))
    except Exception as e:
        errors.append({"row": 0, "column": "file", "message": f"Malformed CSV syntax: {str(e)}"})
        return False, [], errors

    # Check required columns
    required_cols_map = {
        "companies": COMPANY_REQUIRED_COLS,
        "technologies": TECH_REQUIRED_COLS,
        "company_metrics": COMPANY_METRIC_REQUIRED_COLS,
        "technology_metrics": TECH_METRIC_REQUIRED_COLS,
    }

    req_cols = required_cols_map.get(dataset_type, [])
    missing_cols = [col for col in req_cols if col not in df.columns]
    if missing_cols:
        errors.append({
            "row": 0,
            "column": "headers",
            "message": f"Missing required column(s): {', '.join(missing_cols)}"
        })
        return False, [], errors

    records = []
    seen_keys = set()

    for idx, row in df.iterrows():
        row_num = idx + 2 # 1-based + 1 header line

        if dataset_type == "companies":
            ticker = str(row.get("ticker", "")).strip().upper()
            if not ticker:
                errors.append({"row": row_num, "column": "ticker", "message": "Ticker cannot be empty."})
            if ticker in seen_keys:
                errors.append({"row": row_num, "column": "ticker", "message": f"Duplicate ticker '{ticker}'."})
            seen_keys.add(ticker)

        elif dataset_type == "company_metrics":
            ticker = str(row.get("ticker", "")).strip().upper()
            try:
                yr = int(row.get("year"))
                if yr < 2000 or yr > 2050:
                    errors.append({"row": row_num, "column": "year", "message": f"Year '{yr}' is out of realistic range (2000-2050)."})
            except (ValueError, TypeError):
                errors.append({"row": row_num, "column": "year", "message": "Year must be a valid integer."})
                yr = 0

            pair = (ticker, yr)
            if pair in seen_keys:
                errors.append({"row": row_num, "column": "year", "message": f"Duplicate metric record for {ticker} in {yr}."})
            seen_keys.add(pair)

            # Check numeric types
            for col in ["revenue", "revenue_growth", "profit", "profit_margin", "market_cap", "rd_spending", "investment", "patents"]:
                val = row.get(col)
                try:
                    float(val)
                except (ValueError, TypeError):
                    errors.append({"row": row_num, "column": col, "message": f"Value '{val}' must be numeric."})

        records.append(row.to_dict())

    is_valid = len(errors) == 0
    return is_valid, records, errors
