"""Pinned light D14 colours shared by the two preview pages and their films."""
import json
import re
from pathlib import Path

COLORS = json.loads(Path(__file__).with_name('palette.json').read_text())

def stylesheet():
    return ':root {\n' + ''.join(f'  --family-{role}: {color};\n' for role,color in COLORS.items()) + '}\n'

def adapt_reference(css):
    roles = {
        'accent': '4dc5e5 63ad45 e9d352 f9abff ff3333',
        'text-1': '0a0909 0f0f0f 151515 1e1e1e 212121 2e2e2e',
        'text-2': '3c3c3c', 'edge-1': 'b6b6b6 d6d6d6',
        'surface-3': 'e2e2e2 ebebeb', 'canvas':'ededed',
        'surface-2': 'f7f7f7', 'surface-1':'fafafa',
    }
    names={color:role for role,colors in roles.items() for color in colors.split()}
    return re.sub(r'#[0-9a-fA-F]{6}\b',lambda m:'var(--family-'+names[m[0][1:].lower()]+')',css)
