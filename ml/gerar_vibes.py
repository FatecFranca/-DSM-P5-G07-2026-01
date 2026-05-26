"""
Uso:
python gerar_vibes.py --input data/original.csv --outdir data
"""
import os
import argparse
from collections import defaultdict, Counter

import pandas as pd
import numpy as np


FEATURE_COLS = [
    "danceability",
    "energy",
    "valence",
    "acousticness",
    "instrumentalness",
    "speechiness",
    "tempo",
]


def safe_float(value, default=0.0):
    try:
        if pd.isna(value):
            return default
        return float(value)
    except Exception:
        return default


def compute_scores(row):
    e = safe_float(row.get("energy"))
    d = safe_float(row.get("danceability"))
    v = safe_float(row.get("valence"))
    a = safe_float(row.get("acousticness"))
    inst = safe_float(row.get("instrumentalness"))
    s = safe_float(row.get("speechiness"))
    tempo = safe_float(row.get("tempo"), 120.0)

    tempo_norm = np.clip((tempo - 60) / 120, 0, 1)

    score_focus = 0.55 * inst + 0.20 * a + 0.15 * (1 - e) + 0.10 * (1 - d)
    score_workout = 0.55 * e + 0.35 * tempo_norm + 0.10 * d + 0.10 * v
    score_party = 0.55 * d + 0.25 * e + 0.15 * v + 0.05 * s
    score_relax = 0.55 * a + 0.30 * (1 - e) + 0.15 * (1 - v)
    score_chill = 0.30 * a + 0.30 * (1 - e) + 0.20 * v + 0.20 * (1 - d)
    score_romantic = 0.45 * v + 0.35 * a + 0.10 * (1 - d) + 0.05 * (1 - s)

    return {
        "focus": score_focus,
        "workout": score_workout,
        "party": score_party,
        "relax": score_relax,
        "chill": score_chill,
        "romantic": score_romantic,
    }


def assign_vibe_from_scores(scores, threshold=0.35):
    vibe = max(scores, key=scores.get)

    if scores[vibe] < threshold:
        return "chill", scores

    return vibe, scores


def is_suspect(row, vibe):
    d = safe_float(row.get("danceability"))
    e = safe_float(row.get("energy"))
    val = safe_float(row.get("valence"))
    a = safe_float(row.get("acousticness"))
    inst = safe_float(row.get("instrumentalness"))
    tempo = safe_float(row.get("tempo"))

    if vibe == "party" and (d < 0.45 or e < 0.45):
        return True, f"party_low_d_or_e d={d:.2f}, e={e:.2f}"

    if vibe == "workout" and (e < 0.55 or tempo < 100):
        return True, f"workout_low_e_or_tempo e={e:.2f}, tempo={tempo:.1f}"

    if vibe == "relax" and (e > 0.60 or d > 0.70):
        return True, f"relax_high_e_or_d e={e:.2f}, d={d:.2f}"

    if vibe == "romantic" and (val < 0.25 or a < 0.20):
        return True, f"romantic_low_val_or_acoustic val={val:.2f}, acoustic={a:.2f}"

    if vibe == "focus" and (inst < 0.40 or e > 0.50):
        return True, f"focus_low_inst_or_high_e inst={inst:.2f}, e={e:.2f}"

    return False, ""


def process(input_csv, outdir, chunk_size=20000, sample_per_class=500, threshold=0.35):
    os.makedirs(outdir, exist_ok=True)

    out_clean = os.path.join(outdir, "dataset_final.csv")
    out_suspect = os.path.join(outdir, "casos_revisao.csv")
    out_sample = os.path.join(outdir, "amostra.csv")

    first_write = True
    class_samples = defaultdict(list)
    suspect_rows = []
    counts = Counter()
    total = 0

    needed_cols = ["track_id"] + FEATURE_COLS

    for chunk in pd.read_csv(input_csv, chunksize=chunk_size):
        existing_needed = [col for col in needed_cols if col in chunk.columns]

        chunk = chunk.dropna(subset=existing_needed).copy()

        vibes = []

        for _, row in chunk.iterrows():
            scores = compute_scores(row)
            vibe, scores = assign_vibe_from_scores(scores, threshold)

            vibes.append(vibe)
            counts[vibe] += 1
            total += 1

            if len(class_samples[vibe]) < sample_per_class:
                sample_row = row.to_dict()
                sample_row["vibe"] = vibe
                sample_row["vibe_score"] = scores[vibe]
                class_samples[vibe].append(sample_row)

            suspect_flag, reason = is_suspect(row, vibe)

            if suspect_flag:
                suspect_rows.append({
                    "track_id": row.get("track_id", ""),
                    "track_name": row.get("track_name", ""),
                    "artists": row.get("artists", ""),
                    "vibe_suggested": vibe,
                    "vibe_score": scores[vibe],
                    "reason": reason,
                    "danceability": row.get("danceability", np.nan),
                    "energy": row.get("energy", np.nan),
                    "valence": row.get("valence", np.nan),
                    "acousticness": row.get("acousticness", np.nan),
                    "instrumentalness": row.get("instrumentalness", np.nan),
                    "speechiness": row.get("speechiness", np.nan),
                    "tempo": row.get("tempo", np.nan),
                })

        chunk["vibe"] = vibes

        if first_write:
            chunk.to_csv(out_clean, index=False, mode="w", encoding="utf-8")
            first_write = False
        else:
            chunk.to_csv(out_clean, index=False, mode="a", header=False, encoding="utf-8")

    if suspect_rows:
        pd.DataFrame(suspect_rows).to_csv(out_suspect, index=False, encoding="utf-8")

    samples = []
    for rows in class_samples.values():
        samples.extend(rows)

    if samples:
        pd.DataFrame(samples).to_csv(out_sample, index=False, encoding="utf-8")

    print(f"Processed {total} rows.")
    print("Counts per vibe:")

    for vibe, count in counts.most_common():
        print(f"  {vibe}: {count}")

    print("\nOutputs:")
    print(f" - cleaned with vibes: {out_clean}")
    print(f" - suspect examples: {out_suspect}")
    print(f" - stratified sample: {out_sample}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument("--input", required=True)
    parser.add_argument("--outdir", default="data")
    parser.add_argument("--chunk-size", type=int, default=20000)
    parser.add_argument("--sample-per-class", type=int, default=500)
    parser.add_argument("--threshold", type=float, default=0.35)

    args = parser.parse_args()

    process(
        input_csv=args.input,
        outdir=args.outdir,
        chunk_size=args.chunk_size,
        sample_per_class=args.sample_per_class,
        threshold=args.threshold,
    )