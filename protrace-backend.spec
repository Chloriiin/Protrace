# -*- mode: python ; coding: utf-8 -*-
import os

a = Analysis(
    ['api/index.py'],
    pathex=['.', 'src'],
    binaries=[],
    datas=[
        ('src/*.py', 'src'),
    ],
    hiddenimports=[
        'flask',
        'flask_cors',
        'pandas',
        'numpy',
        'matplotlib',
        'matplotlib.pyplot',
        'matplotlib.backends.backend_agg',
        'Sample',
        'Preprocessing', 
        'ProtPlotting',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='protrace-backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
