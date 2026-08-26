#!/usr/bin/env python3
"""Generate blocks.json and sounds.json for the MCToolKit website."""
import json
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLOCK_DIR = os.path.join(BASE, 'assets', 'extracted', 'assets', 'minecraft', 'textures', 'block')
SOUND_ROOT = os.path.join(BASE, 'assets', 'extracted', 'assets', 'minecraft', 'sounds')
DATA_DIR = os.path.join(BASE, 'src', 'data')

# ── Blocks ──────────────────────────────────────────────────────────────
print('Generating blocks.json ...')
blocks = []
for fname in sorted(os.listdir(BLOCK_DIR)):
    if not fname.endswith('.png'):
        continue
    block_id = fname[:-4]  # strip .png
    blocks.append({
        'id': block_id,
        'texture': f'block/{fname}',
    })

with open(os.path.join(DATA_DIR, 'blocks.json'), 'w', encoding='utf-8') as f:
    json.dump(blocks, f, ensure_ascii=False, indent=2)
print(f'  {len(blocks)} blocks')

# ── Sounds ──────────────────────────────────────────────────────────────
print('Generating sounds.json ...')
sounds = []
for dirpath, _, filenames in os.walk(SOUND_ROOT):
    for fname in sorted(filenames):
        if not fname.endswith('.ogg'):
            continue
        full = os.path.join(dirpath, fname)
        rel = os.path.relpath(full, SOUND_ROOT)
        # category = rel.split('/')[0] if '/' in rel else 'root'
        # display name: use filename without extension
        name = fname[:-4]
        sounds.append({
            'id': name,
            'path': f'sounds/{rel}',
            'category': rel.split('/')[0] if '/' in rel else 'other',
        })

with open(os.path.join(DATA_DIR, 'sounds.json'), 'w', encoding='utf-8') as f:
    json.dump(sounds, f, ensure_ascii=False, indent=2)
print(f'  {len(sounds)} sounds')

# ── Category summary for sounds ─────────────────────────────────────────
cats = {}
for s in sounds:
    cats[s['category']] = cats.get(s['category'], 0) + 1
print('  Categories:')
for cat, cnt in sorted(cats.items(), key=lambda x: -x[1]):
    print(f'    {cat}: {cnt}')
