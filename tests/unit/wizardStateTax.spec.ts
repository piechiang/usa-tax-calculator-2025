import { createWizardSteps } from '../../src/components/wizard/wizardSteps';
import { WizardAnswers } from '../../src/components/wizard/types';

describe('Wizard State Tax Steps', () => {
  const steps = createWizardSteps();
  const stateTaxStep = steps.find((s) => s.id === 'state-tax');

  it('should have a State Tax step', () => {
    expect(stateTaxStep).toBeDefined();
    expect(stateTaxStep?.title).toBe('State Tax Details');
  });

  it('should be hidden when no state is selected', () => {
    const answers: WizardAnswers = { personalInfo: {} };
    // Based on my implementation: condition checks data.state
    // Wait, I updated implementation to check !!data.state
    expect(stateTaxStep?.condition?.({} as WizardAnswers)).toBeFalsy();
  });

  it('should be hidden for non-supported state (e.g. TX)', () => {
    const answers: WizardAnswers = { state: 'TX' };
    expect(stateTaxStep?.condition?.(answers)).toBeFalsy();
  });

  it('should be visible for CA', () => {
    const answers: WizardAnswers = { state: 'CA' };
    expect(stateTaxStep?.condition?.(answers)).toBeTruthy();
  });

  it('should be visible for NY', () => {
    const answers: WizardAnswers = { state: 'NY' };
    expect(stateTaxStep?.condition?.(answers)).toBeTruthy();
  });

  describe('CA Specifics', () => {
    const caSubsection = stateTaxStep?.subsections?.find((s) => s.id === 'ca-specifics');

    it('should exist', () => {
      expect(caSubsection).toBeDefined();
    });

    it('should be visible only when state is CA', () => {
      expect(caSubsection?.condition?.({ state: 'CA' } as WizardAnswers)).toBeTruthy();
      expect(caSubsection?.condition?.({ state: 'NY' } as WizardAnswers)).toBeFalsy();
    });

    it('should have youngChildrenUnder6 question', () => {
      const q = caSubsection?.questions.find((q) => q.id === 'youngChildrenUnder6');
      expect(q).toBeDefined();
      expect(q?.type).toBe('number');
    });
  });

  describe('NY Specifics', () => {
    const nySubsection = stateTaxStep?.subsections?.find((s) => s.id === 'ny-specifics');

    it('should exist', () => {
      expect(nySubsection).toBeDefined();
    });

    it('should be visible only when state is NY', () => {
      expect(nySubsection?.condition?.({ state: 'NY' } as WizardAnswers)).toBeTruthy();
      expect(nySubsection?.condition?.({ state: 'CA' } as WizardAnswers)).toBeFalsy();
    });

    it('should have yonkersResident question', () => {
      const q = nySubsection?.questions.find((q) => q.id === 'yonkersResident');
      expect(q).toBeDefined();
      expect(q?.type).toBe('radio');
    });
  });
});
