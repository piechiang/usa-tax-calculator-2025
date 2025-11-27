---
name: State Tax Engine Implementation
about: Track implementation of a new state tax calculator
title: 'Implement [STATE] 2025 Tax Calculator'
labels: ['enhancement', 'state-engine', 'phase-1A']
assignees: ''
---

## State Information

- **State Code**: [e.g., CA, NY]
- **State Name**: [e.g., California, New York]
- **Tax Type**: [flat / graduated / none]
- **Has Local Tax**: [yes / no]
- **Priority Tier**: [1 / 2 / 3 / 4]
- **Estimated Complexity**: [Low / Medium / High]

## Data Collection

### Official Sources
- [ ] State tax authority website identified: [URL]
- [ ] 2025 tax brackets documented: [URL to official publication]
- [ ] Standard deduction amounts verified: [URL]
- [ ] Personal exemption rules (if applicable): [URL]
- [ ] State credits documented (EITC, child, education, etc.): [URL]
- [ ] AGI modifications (additions/subtractions) listed: [URL]
- [ ] Local tax information collected (if applicable): [URL]

### Cross-Validation
- [ ] Compared against Tax Foundation data
- [ ] Verified with official state calculator (if available)
- [ ] Checked Federation of Tax Administrators

## Implementation Checklist

### Code Structure
- [ ] Create `src/engine/states/[STATE]/2025/` directory
- [ ] Create `src/engine/states/[STATE]/rules/2025/` directory
- [ ] Implement `compute[STATE]2025.ts` main calculator
- [ ] Create `brackets.ts` with official tax brackets
- [ ] Create `deductions.ts` with standard deduction amounts
- [ ] Create `credits.ts` with state-specific credits
- [ ] Create `exemptions.ts` (if applicable)

### Calculation Components
- [ ] Implement state AGI calculation
  - [ ] Federal AGI starting point
  - [ ] State additions
  - [ ] State subtractions
- [ ] Implement deduction calculation
  - [ ] Standard deduction
  - [ ] Itemized deduction (if different from federal)
  - [ ] Personal exemptions (if applicable)
- [ ] Implement tax calculation
  - [ ] Regular tax from brackets
  - [ ] Alternative minimum tax (if applicable)
  - [ ] Special taxes/surcharges
- [ ] Implement credits
  - [ ] State EITC (as % of federal or independent calculation)
  - [ ] Child/dependent credits
  - [ ] Education credits
  - [ ] Renter's credit (if applicable)
  - [ ] Property tax credit (if applicable)
  - [ ] Other state-specific credits
- [ ] Implement local tax (if applicable)
  - [ ] County tax
  - [ ] City tax
  - [ ] School district tax

### Testing
- [ ] Create `tests/golden/states/[state]/2025/` directory
- [ ] Write basic scenarios test suite
  - [ ] Single filer, low income ($30k)
  - [ ] Single filer, medium income ($75k)
  - [ ] Single filer, high income ($200k)
  - [ ] Married filing jointly ($100k)
  - [ ] With dependents
  - [ ] With itemized deductions
- [ ] Write edge case tests
  - [ ] Zero income
  - [ ] Very high income (>$1M)
  - [ ] At bracket boundaries
  - [ ] Maximum standard deduction
- [ ] Write credit-specific tests
  - [ ] State EITC qualification
  - [ ] Credit phaseouts
- [ ] Verify against official state examples
  - [ ] Document example sources
  - [ ] All test cases match official calculations

### Integration
- [ ] Add state config to `src/engine/states/registry.ts`
- [ ] Mark state as `implemented: true` in `STATE_CONFIGS`
- [ ] Export calculator from `src/engine/index.ts`
- [ ] Update `getSupportedStates()` output

### Documentation
- [ ] Document data sources in code comments
- [ ] Add implementation notes to `STATE_ENGINE_GUIDE.md`
- [ ] Document any special cases or limitations
- [ ] Add state-specific examples to guide

### Quality Gates
- [ ] All tests passing (minimum 10 test cases)
- [ ] Code review completed
- [ ] Bundle size impact measured (<50KB per state)
- [ ] Performance benchmark (calculation <100ms)
- [ ] Documentation peer-reviewed

## Test Results

### Golden Test Summary
```
Total tests: X
Passing: X
Failing: X
Coverage: X%
```

### Official Calculator Comparison
- [ ] Test case 1: Our result: $XXX, Official: $XXX, Diff: $X
- [ ] Test case 2: Our result: $XXX, Official: $XXX, Diff: $X
- [ ] Test case 3: Our result: $XXX, Official: $XXX, Diff: $X

## Known Limitations
<!-- List any known limitations, edge cases not handled, or areas needing future work -->

## Related Issues
<!-- Link to related issues, dependencies, or blockers -->

## References
<!-- List all official sources, publications, and documentation used -->

---

**Acceptance Criteria:**
- [ ] All implementation checklist items complete
- [ ] Minimum 10 golden tests passing
- [ ] Differences from official calculator <$5 or <0.5%
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] No performance regressions
