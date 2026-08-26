#!/usr/bin/env python3
"""Parse MC block models + blockstates + lang files -> blocks.json.

Only includes blocks that have at least one full-cube model variant
(from=[0,0,0] to=[16,16,16]). Scans ALL variants, not just the first.
"""
import json, os

BASE = '/home/z/my-project/MCToolKit'
MODEL_DIR = os.path.join(BASE, 'assets', 'extracted', 'assets', 'minecraft', 'models', 'block')
BLOCKSTATE_DIR = os.path.join(BASE, 'assets', 'extracted', 'assets', 'minecraft', 'blockstates')
LANG_DIR = os.path.join(BASE, 'assets', 'extracted', 'assets', 'minecraft', 'lang')
TEX_DIR = os.path.join(BASE, 'public', 'textures')
OUTPUT = os.path.join(BASE, 'src', 'data', 'blocks.json')

SUPPORTED_LANGS = ['zh_cn', 'en_us', 'zh_tw', 'ja_jp', 'ko_kr', 'de_de', 'fr_fr']

# -- Load lang files --
print('Loading lang files...')
lang_data = {}
for lc in SUPPORTED_LANGS:
    lpath = os.path.join(LANG_DIR, f'{lc}.json')
    if not os.path.isfile(lpath):
        print(f'  {lc}: FILE NOT FOUND')
        continue
    with open(lpath, encoding='utf-8') as fh:
        raw = json.load(fh)
    mapped = {}
    PREFIX = 'block.minecraft.'
    for key, val in raw.items():
        if key.startswith(PREFIX):
            mapped[key[len(PREFIX):]] = val
    lang_data[lc] = mapped
    print(f'  {lc}: {len(mapped)} block translations')

# -- Load all models --
print('Loading block models...')
model_data = {}
model_parent = {}

for f in os.listdir(MODEL_DIR):
    if not f.endswith('.json'):
        continue
    name = f[:-5]
    with open(os.path.join(MODEL_DIR, f)) as fh:
        model_data[name] = json.load(fh)
    model_parent[name] = model_data[name].get('parent', '').replace('minecraft:block/', '').replace('block/', '')

# -- Resolve model chain --
_cache = {}

def resolve_model(name, visited=None):
    if name in _cache:
        return _cache[name]
    if visited is None:
        visited = set()
    if name in visited or name not in model_data:
        return None
    visited.add(name)
    data = model_data[name]
    pname = model_parent.get(name, '')
    if not pname:
        _cache[name] = data
        return data
    pdata = resolve_model(pname, visited)
    if pdata is None:
        _cache[name] = data
        return data
    merged = dict(pdata)
    merged.update({k: v for k, v in data.items() if k != 'textures'})
    if 'textures' in pdata and 'textures' in data:
        mt = dict(pdata['textures'])
        mt.update(data['textures'])
        merged['textures'] = mt
    elif 'textures' in data:
        merged['textures'] = data['textures']
    if 'elements' in data:
        merged['elements'] = data['elements']
    _cache[name] = merged
    return merged


def is_full_cube(resolved):
    """Check if resolved model has at least one full-cube element [0,0,0]->[16,16,16]."""
    elements = resolved.get('elements', [])
    if not elements:
        return False
    for elem in elements:
        fr = elem.get('from', [])
        to = elem.get('to', [])
        if fr == [0, 0, 0] and to == [16, 16, 16]:
            return True
    return False


def resolve_tex(tex, textures):
    if not tex:
        return None
    if isinstance(tex, dict):
        tex = tex.get('sprite', '')
    if not tex or not isinstance(tex, str):
        return None
    if tex.startswith('#'):
        return resolve_tex(textures.get(tex[1:]), textures)
    return tex.replace('minecraft:', '')


def tex_exists(tex_name):
    if not tex_name:
        return False, None
    fpath = os.path.join(TEX_DIR, f'{tex_name}.png')
    return os.path.isfile(fpath), tex_name


def get_face_tex(resolved, face):
    textures = resolved.get('textures', {})
    elements = resolved.get('elements', [])
    if not elements:
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
    for elem in elements:
        faces = elem.get('faces', {})
        if face in faces:
            t = faces[face].get('texture', '')
            if t:
                if isinstance(t, dict):
                    t = t.get('sprite', '')
                return resolve_tex(t, textures)
    return None


def collect_model_names(bs):
    """Extract all model names from a blockstate JSON."""
    names = []
    if 'variants' in bs:
        for key, val in bs['variants'].items():
            if isinstance(val, list):
                for v in val:
                    mn = v.get('model', '').replace('minecraft:block/', '')
                    if mn:
                        names.append(mn)
            else:
                mn = val.get('model', '').replace('minecraft:block/', '')
                if mn:
                    names.append(mn)
    elif 'multipart' in bs:
        for case in bs['multipart']:
            apply = case.get('apply', [])
            if isinstance(apply, list):
                for a in apply:
                    mn = a.get('model', '').replace('minecraft:block/', '')
                    if mn:
                        names.append(mn)
            elif isinstance(apply, dict):
                mn = apply.get('model', '').replace('minecraft:block/', '')
                if mn:
                    names.append(mn)
    return names


# -- Process blockstates --
print('Processing blockstates...')
blocks = []
skipped_no_tex = 0
skipped_no_translate = 0
skipped_not_cube = 0

if os.path.isdir(BLOCKSTATE_DIR):
    for f in sorted(os.listdir(BLOCKSTATE_DIR)):
        if not f.endswith('.json'):
            continue
        block_id = f[:-5]

        # Require at least zh_cn translation
        if block_id not in lang_data.get('zh_cn', {}):
            skipped_no_translate += 1
            continue

        with open(os.path.join(BLOCKSTATE_DIR, f)) as fh:
            bs = json.load(fh)

        # Collect ALL model names from all variants/multipart cases
        model_names = collect_model_names(bs)
        if not model_names:
            continue

        # Find the first model that resolves to a full cube
        cube_model_name = None
        cube_resolved = None
        for mn in model_names:
            if mn not in model_data:
                continue
            resolved = resolve_model(mn)
            if resolved and is_full_cube(resolved):
                cube_model_name = mn
                cube_resolved = resolved
                break

        if not cube_resolved:
            skipped_not_cube += 1
            continue

        up_raw = get_face_tex(cube_resolved, 'up')
        north_raw = get_face_tex(cube_resolved, 'north')
        east_raw = get_face_tex(cube_resolved, 'east')

        up_ok, up_path = tex_exists(up_raw)
        n_ok, n_path = tex_exists(north_raw)
        e_ok, e_path = tex_exists(east_raw)

        if not n_ok and up_ok:
            n_path = up_path
            n_ok = True
        if not e_ok and n_ok:
            e_path = n_path
            e_ok = True

        if not (up_ok and n_ok and e_ok):
            skipped_no_tex += 1
            continue

        name = {}
        for lc in SUPPORTED_LANGS:
            name[lc] = lang_data.get(lc, {}).get(block_id, block_id)

        blocks.append({
            'id': block_id,
            'up': up_path,
            'north': n_path,
            'east': e_path,
            'name': name,
        })

print(f'Total: {len(blocks)} (skipped {skipped_no_translate} no trans, {skipped_no_tex} no tex, {skipped_not_cube} not full cube)')

with open(OUTPUT, 'w', encoding='utf-8') as f:
    json.dump(blocks, f, ensure_ascii=False, indent=2)
print(f'Wrote {OUTPUT}')
