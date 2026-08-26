#!/usr/bin/env python3
"""
Parse MC block models + blockstates → generate blocks.json with face textures.
For each block: resolve parent chain, extract textures for up/north/east faces.
"""
import json, os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE, 'assets', 'extracted', 'assets', 'minecraft', 'models', 'block')
BLOCKSTATE_DIR = os.path.join(BASE, 'assets', 'extracted', 'assets', 'minecraft', 'blockstates')
TEX_DIR = os.path.join(BASE, 'public', 'textures')  # texture files are under block/
OUTPUT = os.path.join(BASE, 'src', 'data', 'blocks.json')

# ── Load all models ────────────────────────────────────────────────────
print('Loading block models...')
model_data = {}
model_parent = {}

for f in os.listdir(MODEL_DIR):
    if not f.endswith('.json'):
        continue
    name = f[:-5]
    with open(os.path.join(MODEL_DIR, f)) as fh:
        model_data[name] = json.load(fh)
    parent = model_data[name].get('parent', '').replace('minecraft:block/', '').replace('block/', '')
    model_parent[name] = parent

# ── Resolve parent chain ───────────────────────────────────────────────
_resolved_cache = {}

def resolve_model(name, visited=None):
    if name in _resolved_cache:
        return _resolved_cache[name]
    if visited is None:
        visited = set()
    if name in visited or name not in model_data:
        return None
    visited.add(name)
    data = model_data[name]
    parent_name = model_parent.get(name, '')
    if not parent_name:
        _resolved_cache[name] = data
        return data
    parent_data = resolve_model(parent_name, visited)
    if parent_data is None:
        _resolved_cache[name] = data
        return data
    merged = dict(parent_data)
    merged.update({k: v for k, v in data.items() if k != 'textures'})
    if 'textures' in parent_data and 'textures' in data:
        mt = dict(parent_data['textures'])
        mt.update(data['textures'])
        merged['textures'] = mt
    elif 'textures' in data:
        merged['textures'] = data['textures']
    if 'elements' in data:
        merged['elements'] = data['elements']
    _resolved_cache[name] = merged
    return merged


def resolve_tex(tex, textures):
    """Resolve a texture reference to a file path like 'block/stone'."""
    if not tex:
        return None
    if isinstance(tex, dict):
        tex = tex.get('sprite', '')
    if not tex or not isinstance(tex, str):
        return None
    if tex.startswith('#'):
        return resolve_tex(textures.get(tex[1:]), textures)
    # Strip minecraft namespace, keep block/ prefix
    tex = tex.replace('minecraft:', '')
    return tex  # e.g. 'block/stone' or 'block/oak_planks'


def tex_exists(tex_name):
    """Check if a resolved texture file exists."""
    if not tex_name:
        return False, None
    path = os.path.join(TEX_DIR, f'{tex_name}.png')
    return os.path.isfile(path), tex_name


def get_face_tex(resolved, face):
    """Get the texture path for a face (up/down/north/south/east/west)."""
    textures = resolved.get('textures', {})
    elements = resolved.get('elements', [])
    
    if not elements:
        # No own elements — resolve from texture variable names
        if 'all' in textures:
            return resolve_tex(textures['all'], textures)
        if face in ('up', 'down'):
            for k in ('up', 'down', 'end', 'top', 'bottom'):
                if k in textures:
                    return resolve_tex(textures[k], textures)
        else:
            for k in ('north', 'south', 'east', 'west', 'side'):
                if k in textures:
                    return resolve_tex(textures[k], textures)
        return None
    
    # Get texture from first element that has this face
    for elem in elements:
        faces = elem.get('faces', {})
        if face in faces:
            t = faces[face].get('texture', '')
            if t:
                if isinstance(t, dict):
                    t = t.get('sprite', '')
                return resolve_tex(t, textures)
    return None


# ── Process blockstates ────────────────────────────────────────────────
print('Processing blockstates...')
blocks = []

if os.path.isdir(BLOCKSTATE_DIR):
    for f in sorted(os.listdir(BLOCKSTATE_DIR)):
        if not f.endswith('.json'):
            continue
        block_id = f[:-5]
        with open(os.path.join(BLOCKSTATE_DIR, f)) as fh:
            bs = json.load(fh)

        # Pick the first variant's first model
        model_name = None
        if 'variants' in bs:
            variants = bs['variants']
            first = next(iter(variants.values()))
            if isinstance(first, list):
                first = first[0]
            model_name = first.get('model', '').replace('minecraft:block/', '')
        elif 'multipart' in bs:
            for case in bs['multipart']:
                apply = case.get('apply', [])
                if apply:
                    first = apply[0] if isinstance(apply, list) else apply
                    model_name = first.get('model', '').replace('minecraft:block/', '')
                    break

        if not model_name or model_name not in model_data:
            continue

        resolved = resolve_model(model_name)
        if not resolved:
            continue

        up_raw = get_face_tex(resolved, 'up')
        north_raw = get_face_tex(resolved, 'north')
        east_raw = get_face_tex(resolved, 'east')

        # Check existence
        up_ok, up_path = tex_exists(up_raw)
        n_ok, n_path = tex_exists(north_raw)
        e_ok, e_path = tex_exists(east_raw)

        # Fallback: if north/east missing (cube_all), copy up
        if not n_ok and up_ok:
            n_path = up_path
            n_ok = True
        if not e_ok and n_ok:
            e_path = n_path
            e_ok = True

        if not (up_ok or n_ok or e_ok):
            continue

        blocks.append({
            'id': block_id,
            'up': up_path,
            'north': n_path,
            'east': e_path,
        })

# Deduplicate by (up, north, east) texture combo
seen = set()
unique = []
for b in blocks:
    key = (b['up'], b['north'], b['east'])
    if key not in seen:
        seen.add(key)
        unique.append(b)

print(f'From blockstates: {len(blocks)}, unique combos: {len(unique)}')

with open(OUTPUT, 'w', encoding='utf-8') as f:
    json.dump(unique, f, ensure_ascii=False, indent=2)

print(f'Wrote {OUTPUT} ({len(unique)} blocks)')
