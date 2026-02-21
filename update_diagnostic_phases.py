#!/usr/bin/env python3
"""
Script to add phase information to diagnostic calls in computeFederal2025.ts
"""

import re

# Define the phase mapping based on line numbers and context
PHASE_MAPPINGS = [
    # Self-employment tax (lines 64-76)
    (64, 76, 'self-employment'),
    # QBI deduction (lines 87-104)
    (87, 104, 'qbi'),
    # NOL deduction (lines 109-127)
    (109, 127, 'nol'),
    # Income tax calculation (lines 132-144)
    (132, 200, 'income-tax'),
    # Schedule 1 adjustments / AGI (lines 253-410)
    (253, 410, 'agi'),
    # Deductions (lines 600-700)
    (600, 700, 'deductions'),
    # Additional taxes (lines 750-850)
    (750, 850, 'additional-taxes'),
    # Credits (lines 1000-1100)
    (1000, 1100, 'credits'),
    # Input validation (lines 1100-1150)
    (1100, 1150, 'input-validation'),
]

def get_phase_for_line(line_num):
    """Determine the appropriate phase for a given line number."""
    for start, end, phase in PHASE_MAPPINGS:
        if start <= line_num <= end:
            return phase
    return None

def add_phase_to_diagnostic(match, line_num):
    """Add phase parameter to a diagnostic call if it doesn't have one."""
    full_call = match.group(0)

    # Check if phase is already present
    if 'phase:' in full_call:
        return full_call

    # Get the appropriate phase
    phase = get_phase_for_line(line_num)
    if not phase:
        return full_call

    # Find the closing }) or }); pattern
    if full_call.rstrip().endswith('});'):
        # Multi-line call
        insert_pos = full_call.rfind('}')
        updated_call = full_call[:insert_pos] + f", phase: '{phase}'" + full_call[insert_pos:]
    elif full_call.rstrip().endswith(');'):
        # Single-line call
        insert_pos = full_call.rfind(')')
        # Check if there are existing options
        if '{' in full_call:
            # Has options object
            brace_pos = full_call.rfind('}')
            updated_call = full_call[:brace_pos] + f", phase: '{phase}'" + full_call[brace_pos:]
        else:
            # No options object
            code_match = re.search(r"'[A-Z]+-[EW]-\d+'", full_call)
            if code_match:
                code_end = code_match.end()
                updated_call = full_call[:code_end] + f", {{ phase: '{phase}' }}" + full_call[code_end:]
            else:
                return full_call
    else:
        return full_call

    return updated_call

def main():
    file_path = r'c:\Users\Shadow\Desktop\usa-tax-calculator-2025\src\engine\federal\2025\computeFederal2025.ts'

    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    updated_lines = []
    in_push_call = False
    push_call_lines = []
    push_call_start_line = 0

    for i, line in enumerate(lines, 1):
        # Check if this line starts a pushWarning or pushError call
        if re.search(r'pushWarning\(|pushError\(', line):
            in_push_call = True
            push_call_start_line = i
            push_call_lines = [line]
        elif in_push_call:
            push_call_lines.append(line)
            # Check if this line closes the call
            if ');' in line:
                in_push_call = False
                # Process the complete call
                full_call = ''.join(push_call_lines)
                # Create a match object
                class FakeMatch:
                    def __init__(self, text):
                        self.text = text
                    def group(self, n):
                        return self.text

                updated_call = add_phase_to_diagnostic(FakeMatch(full_call), push_call_start_line)
                updated_lines.extend(updated_call.splitlines(True))
                push_call_lines = []
        else:
            updated_lines.append(line)

    # Write updated file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(updated_lines)

    print(f"Updated {file_path}")

if __name__ == '__main__':
    main()
