#!/usr/bin/env python3
"""
Fix state tax computation files to properly use convertToFullBrackets
"""

import os
import re

# States that need fixing
states_to_fix = ['DE', 'HI', 'ID', 'KS', 'MS', 'MT', 'ND', 'OK', 'RI', 'UT', 'VT', 'WV']

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

for state in states_to_fix:
    file_path = os.path.join(project_root, 'src', 'engine', 'states', state, '2025', f'compute{state}2025.ts')

    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        continue

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the pattern: calculateTaxFromBrackets(variable, STATE_RULES_2025.brackets[filingStatus])
    pattern = rf'calculateTaxFromBrackets\((\w+Taxable(?:Income)?),\s*{state}_RULES_2025\.brackets\[filingStatus\]\)'

    match = re.search(pattern, content)
    if not match:
        print(f"⚠️  Pattern not found in {state}, trying alternate pattern")
        # Try alternate variable names
        pattern = rf'calculateTaxFromBrackets\((\w+),\s*{state}_RULES_2025\.brackets\[filingStatus\]\)'
        match = re.search(pattern, content)

    if match:
        taxable_var = match.group(1)

        # Replace with correct pattern
        replacement = f'''const fullBrackets = convertToFullBrackets({state}_RULES_2025.brackets[filingStatus]);
  const taxBeforeCredits = calculateTaxFromBrackets({taxable_var}, fullBrackets)'''

        # Find and replace the original line
        old_pattern = rf'const taxBeforeCredits = calculateTaxFromBrackets\({taxable_var},\s*{state}_RULES_2025\.brackets\[filingStatus\]\);'

        new_content = re.sub(old_pattern, replacement, content)

        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✅ Fixed {state}")
        else:
            print(f"⚠️  No changes made to {state} (already fixed?)")
    else:
        print(f"❌ Could not find bracket calculation in {state}")

print("\n✨ Bracket fix complete!")
