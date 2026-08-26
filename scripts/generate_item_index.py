#!/usr/bin/env python3
"""
Parse item models + language files to generate a unified item data index.
Output: src/data/items.json
"""
import json, os, re

BASE = "/home/z/my-project/MCToolKit/assets/extracted/assets/minecraft"
MODEL_DIR = os.path.join(BASE, "models", "item")
TEXTURE_DIR = os.path.join(BASE, "textures", "item")
LANG_DIR = os.path.join(BASE, "lang")
OUTPUT = "/home/z/my-project/MCToolKit/src/data/items.json"

def load_lang(filename):
    path = os.path.join(LANG_DIR, filename)
    if not os.path.exists(path):
        return {}
    with open(path, encoding='utf-8') as f:
        return json.load(f)

def get_texture_path(model_data):
    """Extract layer0 texture from model, return relative path."""
    textures = model_data.get("textures", {})
    layer0 = textures.get("layer0", "")
    if not layer0:
        return None
    # Convert "minecraft:item/diamond_sword" -> "textures/item/diamond_sword.png"
    return "textures/" + layer0.replace("minecraft:", "") + ".png"

def main():
    langs = {code: load_lang(f"{code}.json") for code in ["zh_cn", "en_us", "zh_tw", "ja_jp", "ko_kr", "de_de", "fr_fr"]}
    
    items = []
    no_texture = []
    no_translation = []

    for filename in sorted(os.listdir(MODEL_DIR)):
        if not filename.endswith(".json"):
            continue
        
        item_id = filename[:-5]  # remove .json
        
        with open(os.path.join(MODEL_DIR, filename)) as f:
            model = json.load(f)
        
        # Get texture path
        texture_rel = get_texture_path(model)
        if not texture_rel:
            no_texture.append(item_id)
            continue
        
        # Check if texture file exists
        texture_full = os.path.join(BASE, texture_rel)
        if not os.path.exists(texture_full):
            no_texture.append(item_id)
            continue

        # Get translations - try item key first, fallback to block key
        translations = {}
        for code, lang_data in langs.items():
            name = lang_data.get(f"item.minecraft.{item_id}")
            if not name:
                name = lang_data.get(f"block.minecraft.{item_id}", item_id)
            translations[code] = name

        items.append({
            "id": item_id,
            "texture": texture_rel,
            "name": translations
        })

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

    print(f"Total items: {len(items)}")
    print(f"No texture: {len(no_texture)}")
    if no_texture:
        print(f"  Samples: {no_texture[:10]}")
    print(f"No translation: {len(no_translation)}")
    if no_translation:
        print(f"  Samples: {no_translation[:10]}")
    print(f"Output: {OUTPUT}")

if __name__ == "__main__":
    main()
