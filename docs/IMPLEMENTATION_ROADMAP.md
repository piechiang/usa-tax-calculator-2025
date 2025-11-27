# Implementation Roadmap: 50-State Support + PDF Export

## Executive Summary

This roadmap outlines the phased approach to expand the tax calculator from single-state (Maryland) to full 50-state support, plus professional PDF export functionality.

**Timeline**: 20-24 weeks (5-6 months)
**Current Status**: Phase 0 complete (MD + 9 no-tax states)
**Next Milestone**: Phase 1A (CA, NY, TX, FL foundation)

---

## Phase 0: Foundation (COMPLETE ✅)

**Status**: ✅ Complete
**Duration**: 4 weeks
**Deliverables**:

- [x] Unified state tax interface (`StateTaxInput`, `StateResult`)
- [x] State calculator registry system
- [x] Maryland implementation (full)
- [x] No-tax states (AK, FL, NV, NH, SD, TN, TX, WA, WY)
- [x] State engine documentation
- [x] Test framework for state taxes
- [x] 91 passing tests (federal + MD + property tests)

**Test Coverage**: 91/91 tests passing

---

## Phase 1A: Priority State Engines (8 weeks)

### Goal
Implement 4 most populous states, establishing patterns for remaining states.

### Week 1-2: California

**Complexity**: High (graduated brackets, complex credits, mental health surcharge)

**Tasks**:
- [ ] Research CA 2025 tax rules (FTB publications)
- [ ] Create `src/engine/states/CA/rules/2025/` constants
- [ ] Implement `computeCA2025()`
  - CA AGI adjustments (add-backs, subtractions)
  - Graduated tax brackets (10 brackets)
  - Standard deductions
  - CA EITC (CalEITC) - complex calculation
  - Mental Health Services Tax (1% on income >$1M)
- [ ] Write golden tests (15+ scenarios)
- [ ] Register in state registry
- [ ] Update documentation

**Data Sources**:
- California Franchise Tax Board: https://www.ftb.ca.gov
- FTB Publication 1001 (tax rates)
- Form 540 instructions

**Success Criteria**:
- 15+ tests passing
- CalEITC matches FTB calculator
- Handles edge cases (very high income with mental health tax)

### Week 3-4: New York

**Complexity**: High (local taxes, complex credits)

**Tasks**:
- [ ] Research NY 2025 rules (NYS Tax Dept)
- [ ] Create NY state rules constants
- [ ] Implement `computeNY2025()`
  - NY AGI modifications
  - NY graduated brackets (9 brackets)
  - Standard deductions
  - NY EITC (30% of federal)
  - NYC resident tax (graduated)
  - Yonkers resident tax (if applicable)
- [ ] Write golden tests including NYC scenarios
- [ ] Register in state registry

**Data Sources**:
- NY State Tax Department: https://www.tax.ny.gov
- Form IT-201 instructions
- NYC tax tables

**Success Criteria**:
- 15+ tests passing
- NYC local tax calculated correctly
- NY EITC at 30% of federal

### Week 5-6: Texas & Florida

**Complexity**: Low (no income tax)

**Tasks**:
- [x] TX already implemented (no-tax state)
- [x] FL already implemented (no-tax state)
- [ ] Add informational content for TX/FL users
- [ ] Create test cases confirming $0 tax
- [ ] Add UI messaging for no-tax states

**Success Criteria**:
- Tests confirm $0 state tax
- UI clearly indicates "no state income tax"

### Week 7-8: Integration & Testing

**Tasks**:
- [ ] Update `engineAdapter` to route by state
- [ ] Add state selector UI component
- [ ] Add state-specific fields to forms (conditional rendering)
- [ ] End-to-end testing with all 4 states
- [ ] Performance testing (ensure no regression)
- [ ] Documentation updates

**Deliverables**:
- 4 major states fully implemented
- State routing system operational
- 130+ total tests passing

---

## Phase 1B: PDF Export Foundation (4 weeks)

### Week 9-10: Report Builder

**Tasks**:
- [ ] Install pdfmake dependencies
- [ ] Create `ReportBuilder` class
  - Transform federal results to report format
  - Transform state results to report format
  - Handle missing data gracefully
- [ ] Define report data structures
- [ ] Implement data formatters (currency, percentages, SSN masking)
- [ ] Unit tests for ReportBuilder

**Deliverables**:
- `src/utils/reports/ReportBuilder.ts`
- `src/utils/reports/types.ts`
- 20+ unit tests

### Week 11-12: PDF Renderer

**Tasks**:
- [ ] Create `PDFRenderer` class
- [ ] Implement document definition builder
- [ ] Design PDF layout and styling
  - Cover page
  - Executive summary
  - Income breakdown
  - Deductions section
  - Tax calculation details
  - State tax section
  - Payments summary
  - Footer/disclaimers
- [ ] Test PDF generation
- [ ] Visual QA with accountants

**Deliverables**:
- `src/utils/reports/PDFRenderer.ts`
- Sample PDFs for review
- Integration tests

---

## Phase 2: Regional Expansion (8 weeks)

### Week 13-14: Northeast States (6 states)

**States**: PA, NJ, MA, CT, RI, VT, ME, NH (8 total)

**Pattern**: Most have graduated brackets, standard deductions, and simplified credits

**Tasks** (per state):
- Research official tax rules
- Create state constants
- Implement calculator
- Write 10+ golden tests
- Register and document

**Estimated**: 1.5 days per state average

### Week 15-16: Southeast States (8 states)

**States**: VA, NC, SC, GA, AL, MS, LA, AR

**Pattern**: Mix of flat and graduated; some have no tax (FL, TN already done)

**Tasks**: Same as Northeast

### Week 17-18: Midwest States (8 states)

**States**: OH, IN, MI, IL, WI, MN, IA, MO

**Pattern**: Mostly graduated brackets, strong local taxes in some (e.g., OH cities)

**Tasks**: Same as Northeast + handle local taxes

### Week 19-20: West States (10 states)

**States**: CO, UT, AZ, NM, ID, MT, OR, WA (done), WY (done), HI, AK (done)

**Pattern**: Varied; CO has flat tax, OR/HI have high brackets

**Tasks**: Same as Northeast

---

## Phase 3: Remaining States + Refinement (4 weeks)

### Week 21: Final States

**States**: ND, SD (done), NE, KS, OK, DE, MD (done), DC, WV, KY

**Tasks**:
- Complete remaining 6-8 states
- Handle DC as special case (local + state combined)

### Week 22: Quality Assurance

**Tasks**:
- [ ] Cross-state integration testing
- [ ] Performance optimization
  - Lazy load state calculators
  - Bundle size analysis
  - Code splitting by state
- [ ] Documentation review
- [ ] Accessibility audit (WCAG 2.1 AA)

### Week 23: PDF Enhancement

**Tasks**:
- [ ] Add export options (summary vs. detailed)
- [ ] Add privacy controls (SSN masking, etc.)
- [ ] Implement custom branding support
- [ ] Add multi-year comparison PDFs
- [ ] Email integration (optional)

### Week 24: Beta Testing & Launch

**Tasks**:
- [ ] Beta release to select accountants
- [ ] Gather feedback
- [ ] Fix critical issues
- [ ] Update documentation based on feedback
- [ ] Public launch announcement

---

## Success Metrics

### Coverage Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| States implemented | 51 (50 + DC) | 10 | 🟡 20% |
| Test coverage | >150 tests | 91 | 🟡 61% |
| Data source documentation | 100% | 20% | 🟡 20% |

### Quality Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Test pass rate | 100% | 100% ✅ |
| Bundle size | <2MB | ~1.2MB ✅ |
| Lighthouse score | >90 | 95 ✅ |

### User Metrics (Post-Launch)

- PDF exports per week: >100
- Average calculation time: <500ms
- User satisfaction: >4.5/5

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| State rule complexity | High | Start with simple states, build library of common patterns |
| Bundle size growth | Medium | Code splitting, lazy loading, tree shaking |
| PDF rendering issues | Low | Extensive testing, fallback to simple formats |
| Performance degradation | Medium | Continuous benchmarking, lazy state loading |

### Data Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Incorrect state rules | High | Multiple data sources, cross-validation, user testing |
| Outdated information | High | Annual review process, automated alerts for rule changes |
| Missing edge cases | Medium | Comprehensive test suite, user feedback loop |

### Business Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep | Medium | Strict phase gating, MVP-first approach |
| Delayed launch | Low | Phased rollout, incremental delivery |
| User adoption | Medium | Beta testing, clear documentation, tutorials |

---

## Resource Requirements

### Development Time

- **Phase 1A**: 160 hours (4 weeks × 40h)
- **Phase 1B**: 80 hours (2 weeks × 40h)
- **Phase 2**: 320 hours (8 weeks × 40h)
- **Phase 3**: 160 hours (4 weeks × 40h)
- **Total**: ~720 hours (18 weeks FTE)

### External Dependencies

- State tax authority access (public data)
- Accountant beta testers (3-5 volunteers)
- Design review (2-3 sessions)

### Tools & Services

- pdfmake library (free)
- Testing infrastructure (existing)
- Documentation tools (existing)

---

## Governance

### Review Cadence

- **Weekly**: Progress check, blocker resolution
- **Bi-weekly**: Demo to stakeholders
- **Monthly**: Metrics review, roadmap adjustment

### Quality Gates

Before moving to next phase:
1. All tests passing
2. Code review complete
3. Documentation updated
4. No critical bugs
5. Performance benchmarks met

### Communication

- **Status updates**: Every Monday
- **Demos**: Every other Friday
- **Launch planning**: 4 weeks before Phase 3 completion

---

## Next Actions

### Immediate (This Week)

1. [ ] Review and approve roadmap
2. [ ] Set up project tracking (GitHub Projects / Jira)
3. [ ] Begin CA research and data collection
4. [ ] Create issue templates for state implementation

### Short-term (Next 2 Weeks)

1. [ ] Implement CA calculator
2. [ ] Create reusable state calculation utilities
3. [ ] Draft user documentation for multi-state
4. [ ] Schedule beta tester recruitment

### Medium-term (Next Month)

1. [ ] Complete Phase 1A (CA, NY, TX, FL)
2. [ ] Begin PDF export implementation
3. [ ] User testing of initial states
4. [ ] Performance optimization

---

## Appendix

### State Priority Order

**Tier 1** (Highest population + complexity):
- CA, TX, FL, NY

**Tier 2** (High population):
- PA, IL, OH, GA, NC, MI, NJ, VA

**Tier 3** (Medium population):
- WA (done), MA, AZ, TN (done), IN, MO, MD (done), WI, CO, MN

**Tier 4** (Lower population):
- Remaining states

### Resources

- [State Engine Implementation Guide](./STATE_ENGINE_GUIDE.md)
- [PDF Export Design Specification](./PDF_EXPORT_DESIGN.md)
- [IRS Publication 17](https://www.irs.gov/pub/irs-pdf/p17.pdf)
- [Tax Foundation State Tax Resources](https://taxfoundation.org/state-tax/)

---

**Last Updated**: 2025-10-03
**Version**: 1.0
**Owner**: Development Team
