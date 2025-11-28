const fs = require('fs');
const path = require('path');

const states = ['DE', 'HI', 'ID', 'KS', 'MS', 'MT', 'ND', 'OK', 'RI', 'UT', 'VT', 'WV'];

states.forEach(state => {
  const file = path.join(__dirname, '..', 'src', 'engine', 'states', state, '2025', `compute${state}2025.ts`);

  if (!fs.existsSync(file)) {
    console.log(`❌ File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(file, 'utf-8');

  // Pattern to find: const taxBeforeCredits = calculateTaxFromBrackets(variable, STATE_RULES_2025.brackets[filingStatus]);
  const pattern = new RegExp(`const taxBeforeCredits = calculateTaxFromBrackets\\\\((\\\\w+),\\\\s*${state}_RULES_2025\\\\.brackets\\\\[filingStatus\\\\]\\\\);`);
  const match = content.match(pattern);

  if (match) {
    const taxableVar = match[1];
    const oldLine = `const taxBeforeCredits = calculateTaxFromBrackets(${taxableVar}, ${state}_RULES_2025.brackets[filingStatus]);`;
    const newLines = `const fullBrackets = convertToFullBrackets(${state}_RULES_2025.brackets[filingStatus]);
  const taxBeforeCredits = calculateTaxFromBrackets(${taxableVar}, fullBrackets);`;

    content = content.replace(oldLine, newLines);
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`✅ Fixed ${state}`);
  } else {
    console.log(`⚠️  Pattern not found in ${state}, checking if already fixed...`);
    // Check if it's already using fullBrackets
    if (content.includes('convertToFullBrackets') && content.includes('fullBrackets')) {
      console.log(`   ✓ ${state} already fixed`);
    } else {
      console.log(`   ❌ ${state} needs manual review`);
    }
  }
});

console.log('\n✨ Fix complete!');
