#!/usr/bin/env node

import { readFileSync } from 'fs';
import { resolve } from 'path';

const COVERAGE_FILE = resolve('coverage', 'coverage-summary.json');
const THRESHOLD = {
  lines: 70,
  branches: 70,
  functions: 70,
  statements: 70,
};

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

try {
  const summaryRaw = readFileSync(COVERAGE_FILE, 'utf8');
  const summary = JSON.parse(summaryRaw);
  const total = summary.total;

  if (!total) {
    fail('Coverage summary missing "total" section.');
  }

  for (const [metric, threshold] of Object.entries(THRESHOLD)) {
    const value = total[metric];
    if (!value || typeof value.pct !== 'number') {
      fail(`Coverage metric "${metric}" missing in summary.`);
    }

    if (value.pct < threshold) {
      fail(`Coverage for ${metric} is ${value.pct.toFixed(2)}% (required: ${threshold}%).`);
    } else {
      console.log(`Coverage for ${metric}: ${value.pct.toFixed(2)}% (threshold ${threshold}%)`);
    }
  }

  console.log('Coverage thresholds met.');
} catch (error) {
  fail(`Unable to read coverage summary: ${error instanceof Error ? error.message : String(error)}`);
}
