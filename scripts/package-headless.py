"""Build a deterministic source-only WordPress plugin ZIP; never deploy it."""
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import hashlib, re
root = Path(__file__).resolve().parents[1]
source = root / 'wordpress-plugin/shams-headless'
version = re.search(r'\* Version: ([0-9.]+)', (source/'shams-headless.php').read_text()).group(1)
output = source.parent / f'shams-headless-{version}.zip'
with ZipFile(output, 'w', compression=ZIP_DEFLATED) as archive:
    for path in sorted(source.rglob('*')):
        if path.is_file() and (path.suffix == '.php' or path.name == 'readme.txt'):
            info = ZipInfo('shams-headless/' + path.relative_to(source).as_posix(), (2026, 9, 19, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, path.read_bytes())
with ZipFile(output) as archive:
    assert archive.testzip() is None
    print(f'{output.name}: {len(archive.namelist())} files; integrity passed')
print('SHA256:', hashlib.sha256(output.read_bytes()).hexdigest())
