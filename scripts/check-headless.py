"""Run PHP checks, including runtimes that incorrectly return zero after a fatal error.

Usage: python3 scripts/check-headless.py [php executable and prefix arguments]
"""
from pathlib import Path
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
runtime = sys.argv[1:] or ['php']

def check(args, marker):
    result = subprocess.run(runtime + args, cwd=root, capture_output=True, text=True)
    output = result.stdout + result.stderr
    if result.returncode or marker not in output or 'Fatal error:' in output or 'Parse error:' in output:
        print(output)
        raise SystemExit('PHP check failed: ' + ' '.join(args))

files = sorted((root / 'wordpress-plugin/shams-headless').rglob('*.php'))
for file in files:
    check(['-l', str(file)], 'No syntax errors detected')
check(['tests/headless-bootstrap.php'], 'Headless bootstrap contracts passed')
check(['tests/headless-payment-sessions.php'], 'Payment coordination contracts passed')
print(f'{len(files)} PHP syntax checks, plugin bootstrap and payment coordination passed')
