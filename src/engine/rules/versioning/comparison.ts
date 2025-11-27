/**
 * Rule Comparison Utilities
 *
 * Compare rules across tax years
 */

import type { RuleChange, RuleComparison } from './types';
import { getRegistry, getConstant, getFederalBrackets } from './registry';

/**
 * Compare constants across years
 */
export function compareConstant(
  constantId: string,
  years: number[]
): RuleComparison {
  const changes: RuleChange[] = [];

  for (let i = 0; i < years.length - 1; i++) {
    const fromYear = years[i]!;
    const toYear = years[i + 1]!;

    const oldValue = getConstant(fromYear, constantId);
    const newValue = getConstant(toYear, constantId);

    if (oldValue === null && newValue === null) {
      continue;
    }

    let changeType: RuleChange['changeType'];
    let description: string;

    if (oldValue === null && newValue !== null) {
      changeType = 'added';
      description = `Constant added in ${toYear}`;
    } else if (oldValue !== null && newValue === null) {
      changeType = 'removed';
      description = `Constant removed in ${toYear}`;
    } else if (oldValue !== newValue) {
      changeType = 'modified';
      const delta = newValue! - oldValue!;
      const pctChange = ((delta / oldValue!) * 100).toFixed(2);
      const oldFormatted = (oldValue! / 100).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      const newFormatted = (newValue! / 100).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      description = `Constant changed from $${oldFormatted} to $${newFormatted} (${pctChange}% change)`;
    } else {
      changeType = 'unchanged';
      description = 'No change';
    }

    changes.push({
      ruleId: constantId,
      fromYear,
      toYear,
      changeType,
      description,
      oldValue,
      newValue,
      source: 'IRS Rev. Proc.',
    });
  }

  const summary = {
    totalChanges: changes.filter((c) => c.changeType !== 'unchanged').length,
    added: changes.filter((c) => c.changeType === 'added').length,
    modified: changes.filter((c) => c.changeType === 'modified').length,
    removed: changes.filter((c) => c.changeType === 'removed').length,
  };

  return {
    ruleId: constantId,
    years,
    changes,
    summary,
  };
}

/**
 * Compare tax brackets across years
 */
export function compareBrackets(
  filingStatus: string,
  years: number[]
): RuleComparison {
  const changes: RuleChange[] = [];

  for (let i = 0; i < years.length - 1; i++) {
    const fromYear = years[i]!;
    const toYear = years[i + 1]!;

    const oldBrackets = getFederalBrackets(fromYear, filingStatus);
    const newBrackets = getFederalBrackets(toYear, filingStatus);

    if (!oldBrackets || !newBrackets) {
      continue;
    }

    // Compare bracket thresholds
    for (let j = 0; j < oldBrackets.brackets.length; j++) {
      const oldBracket = oldBrackets.brackets[j]!;
      const newBracket = newBrackets.brackets[j];

      if (!newBracket) {
        changes.push({
          ruleId: `brackets.${filingStatus}.${j}`,
          fromYear,
          toYear,
          changeType: 'removed',
          description: `Bracket ${j + 1} removed`,
          oldValue: oldBracket,
          newValue: null,
          source: newBrackets.metadata.source,
        });
        continue;
      }

      if (oldBracket.max !== newBracket.max) {
        const oldMax =
          oldBracket.max === Infinity ? 'Infinity' : `$${(oldBracket.max / 100).toFixed(2)}`;
        const newMax =
          newBracket.max === Infinity ? 'Infinity' : `$${(newBracket.max / 100).toFixed(2)}`;

        changes.push({
          ruleId: `brackets.${filingStatus}.${j}.max`,
          fromYear,
          toYear,
          changeType: 'modified',
          description: `${(oldBracket.rate * 100).toFixed(0)}% bracket threshold changed from ${oldMax} to ${newMax}`,
          oldValue: oldBracket.max,
          newValue: newBracket.max,
          source: newBrackets.metadata.source,
        });
      }
    }
  }

  const summary = {
    totalChanges: changes.filter((c) => c.changeType !== 'unchanged').length,
    added: changes.filter((c) => c.changeType === 'added').length,
    modified: changes.filter((c) => c.changeType === 'modified').length,
    removed: changes.filter((c) => c.changeType === 'removed').length,
  };

  return {
    ruleId: `brackets.${filingStatus}`,
    years,
    changes,
    summary,
  };
}

/**
 * Get all changes between two years
 */
export function compareYears(fromYear: number, toYear: number): RuleChange[] {
  const registry = getRegistry();
  const changes: RuleChange[] = [];

  // Compare all constants
  const constantsFrom = registry.constants[fromYear] || {};
  const constantsTo = registry.constants[toYear] || {};

  const allConstantIds = new Set([
    ...Object.keys(constantsFrom),
    ...Object.keys(constantsTo),
  ]);

  for (const constantId of allConstantIds) {
    const comparison = compareConstant(constantId, [fromYear, toYear]);
    changes.push(...comparison.changes.filter((c) => c.changeType !== 'unchanged'));
  }

  // Compare brackets
  const filingStatuses = ['single', 'marriedJointly', 'marriedSeparately', 'headOfHousehold'];
  for (const status of filingStatuses) {
    const comparison = compareBrackets(status, [fromYear, toYear]);
    changes.push(...comparison.changes.filter((c) => c.changeType !== 'unchanged'));
  }

  return changes;
}

/**
 * Format changes for display
 */
export function formatChanges(changes: RuleChange[]): string {
  let output = `\nRule Changes Summary\n${'='.repeat(60)}\n`;

  const byType = {
    added: changes.filter((c) => c.changeType === 'added'),
    modified: changes.filter((c) => c.changeType === 'modified'),
    removed: changes.filter((c) => c.changeType === 'removed'),
  };

  output += `\nTotal Changes: ${changes.length}\n`;
  output += `  Added:    ${byType.added.length}\n`;
  output += `  Modified: ${byType.modified.length}\n`;
  output += `  Removed:  ${byType.removed.length}\n`;

  if (byType.added.length > 0) {
    output += `\n📈 Added Rules\n${'-'.repeat(60)}\n`;
    for (const change of byType.added) {
      output += `  • ${change.description} (${change.fromYear} → ${change.toYear})\n`;
    }
  }

  if (byType.modified.length > 0) {
    output += `\n📝 Modified Rules\n${'-'.repeat(60)}\n`;
    for (const change of byType.modified) {
      output += `  • ${change.description}\n`;
    }
  }

  if (byType.removed.length > 0) {
    output += `\n📉 Removed Rules\n${'-'.repeat(60)}\n`;
    for (const change of byType.removed) {
      output += `  • ${change.description} (${change.fromYear} → ${change.toYear})\n`;
    }
  }

  return output;
}
