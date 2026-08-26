#!/usr/bin/env python3
"""
Download ALL Minecraft 26.2 assets from Mojang CDN and merge into extracted resources.
Asset URL pattern: https://resources.download.minecraft.net/{hash[:2]}/{hash}
"""
import json
import os
import hashlib
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import urllib.request
import sys

ASSET_INDEX_PATH = "/home/z/my-project/MCToolKit/assets/asset-index/32.json"
OUTPUT_BASE = "/home/z/my-project/MCToolKit/assets/extracted"
CDN_BASE = "https://resources.download.minecraft.net"

KEEP_LANGS = {"zh_cn", "en_us", "zh_tw", "ja_jp", "ko_kr", "de_de", "fr_fr"}


def load_index():
    with open(ASSET_INDEX_PATH) as f:
        return json.load(f)


def filter_assets(objects):
    """Filter: keep all non-lang assets + only 7 selected langs."""
    filtered = {}
    skipped_langs = set()
    for key, info in objects.items():
        if "/lang/" in key:
            lang_code = key.split("/")[-1].replace(".json", "")
            if lang_code in KEEP_LANGS:
                filtered[key] = info
            else:
                skipped_langs.add(lang_code)
        else:
            filtered[key] = info

    print(f"Filtered: {len(objects)} -> {len(filtered)} assets")
    print(f"Skipped {len(skipped_langs)} language files")
    print(f"Keeping langs: {sorted(KEEP_LANGS)}")
    return filtered


def get_output_path(key):
    """Convert asset key to output path under extracted dir."""
    parts = key.split("/")
    if parts[0] == "minecraft":
        return os.path.join(OUTPUT_BASE, "assets", *parts)
    elif parts[0] == "realms":
        return os.path.join(OUTPUT_BASE, "assets", *parts)
    elif parts[0] == "icons":
        return os.path.join(OUTPUT_BASE, *parts)
    else:
        return os.path.join(OUTPUT_BASE, key)


def download_one(key, info):
    """Download a single asset, verify hash, return (key, success, error_msg)."""
    h = info["hash"]
    url = f"{CDN_BASE}/{h[:2]}/{h}"
    out_path = get_output_path(key)

    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    try:
        urllib.request.urlretrieve(url, out_path)
        sha1 = hashlib.sha1()
        with open(out_path, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                sha1.update(chunk)
        if sha1.hexdigest() != h:
            return (key, False, f"hash mismatch: expected {h}, got {sha1.hexdigest()}")
        return (key, True, None)
    except Exception as e:
        return (key, False, str(e))


def main():
    print("Loading asset index...")
    index = load_index()
    objects = index["objects"]
    print(f"Total assets in index: {len(objects)}")

    assets = filter_assets(objects)

    total_size = sum(info["size"] for info in assets.values())
    print(f"Total download size: {total_size / 1024 / 1024:.1f} MB")

    max_workers = 32
    downloaded = 0
    failed = []
    total = len(assets)

    print(f"\nStarting download with {max_workers} threads...")

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(download_one, key, info): key for key, info in assets.items()}

        for future in as_completed(futures):
            key, success, error = future.result()
            downloaded += 1
            if not success:
                failed.append((key, error))

            if downloaded % 200 == 0 or downloaded == total:
                print(f"  Progress: {downloaded}/{total} ({downloaded*100//total}%) - Failed: {len(failed)}")

    print(f"\n=== DONE ===")
    print(f"Downloaded: {downloaded - len(failed)}/{total}")
    if failed:
        print(f"\nFailed ({len(failed)}):")
        for key, err in failed[:20]:
            print(f"  {key}: {err}")
        if len(failed) > 20:
            print(f"  ... and {len(failed) - 20} more")


if __name__ == "__main__":
    main()
