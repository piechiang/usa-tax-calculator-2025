# Manual Testing Guide - Secure Client Storage

## Overview
This guide walks through manual testing of the encrypted client storage feature to ensure it works correctly in real browser usage.

**Last Updated**: 2025-11-28
**Phase**: 1 (Secure Storage) - Post-Implementation Validation

---

## Pre-Test Setup

### 1. Start Development Server
```bash
npm run dev
```

Expected: Server starts on http://localhost:5173 (or similar)

### 2. Clear Browser Storage (Fresh Start)
1. Open browser DevTools (F12)
2. Go to Application tab → Storage
3. Clear all:
   - Local Storage
   - Session Storage
4. Refresh page

**Why**: Start with clean slate to test first-time user experience

---

## Test Suite 1: First-Time User Experience

### Test 1.1: Passphrase Setup (No Existing Data)

**Steps**:
1. Enter some test data in the calculator (any values)
2. Click "Client Manager" or equivalent button to open storage UI
3. Click "Save" to save a new client

**Expected Behavior**:
- ✅ Passphrase modal should appear (setup mode)
- ✅ Should show: "Set Up Encryption" title
- ✅ Should show blue info box: "Create a strong passphrase..."
- ✅ Should show warning: "If you forget your passphrase..."
- ✅ Password field with visibility toggle (👁️)
- ✅ Confirm password field

**Test Actions**:
- Try submitting with empty passphrase → Should show error: "Please enter a passphrase"
- Try short passphrase (e.g., "short") → Should show error: "Passphrase must be at least 12 characters"
- Try mismatched passwords → Should show error: "Passphrases do not match"
- Enter valid passphrase (12+ chars) in both fields → Should succeed

**Success Criteria**:
- ✅ Client saved with encryption
- ✅ Modal closes
- ✅ Client appears in list with 🔒 Encrypted badge
- ✅ Status shows "🔓 Unlocked" in header

**Check Browser Storage**:
```javascript
// In DevTools Console:
JSON.parse(localStorage.getItem('utc:client:SOME-ID'))
```
Expected: Should see `version: 1`, `encryptedFields` with base64 data

---

### Test 1.2: Save Multiple Clients (Encrypted)

**Steps**:
1. Still unlocked from Test 1.1
2. Change some data in calculator
3. Save another client with different name

**Expected**:
- ✅ No passphrase prompt (still unlocked)
- ✅ Client saved immediately
- ✅ Both clients show 🔒 Encrypted badge

---

## Test Suite 2: Lock/Unlock Flow

### Test 2.1: Manual Lock

**Steps**:
1. With clients saved and unlocked
2. Click "Lock" button in header

**Expected**:
- ✅ Status changes to "🔒 Locked"
- ✅ Lock button disappears
- ✅ Client list still visible
- ✅ Clients still show 🔒 Encrypted badges

---

### Test 2.2: Unlock with Passphrase

**Steps**:
1. Click "Load" on an encrypted client

**Expected**:
- ✅ Passphrase modal appears (unlock mode)
- ✅ Shows "Unlock Client Data" title
- ✅ Shows "Enter your passphrase to decrypt..."
- ✅ Single password field (no confirm)

**Test Actions**:
- Try wrong passphrase → Should show error: "Invalid passphrase"
- Enter correct passphrase → Should load client and show data

**Success Criteria**:
- ✅ Client data loaded correctly
- ✅ Status shows "🔓 Unlocked"
- ✅ Modal closes
- ✅ Calculator populated with client data

---

### Test 2.3: Session Persistence

**Steps**:
1. While unlocked, refresh the page (F5)

**Expected**:
- ✅ Status shows "🔒 Locked" (key cleared on refresh)
- ✅ Must enter passphrase again to load encrypted clients

**Why**: Encryption key is stored in sessionStorage, which persists only within the same tab session until refresh.

---

### Test 2.4: Browser Close/Reopen

**Steps**:
1. Unlock with passphrase
2. Close entire browser (not just tab)
3. Reopen browser and navigate back to app

**Expected**:
- ✅ Status shows "🔒 Locked"
- ✅ Must enter passphrase to access encrypted data

**Why**: SessionStorage is cleared when browser closes.

---

## Test Suite 3: Migration Flow

### Test 3.1: Create Unencrypted Client (Simulate Legacy)

**Steps**:
1. Open DevTools Console
2. Run this code to simulate old unencrypted client:
```javascript
const legacyClient = {
  personalInfo: { ssn: '123-45-6789', filingStatus: 'single' },
  incomeData: { wages: '50000' },
  deductions: {},
  paymentsData: {},
  spouseInfo: {}
};
const clientId = crypto.randomUUID();
localStorage.setItem(`utc:client:${clientId}`, JSON.stringify(legacyClient));

// Add to index
const index = JSON.parse(localStorage.getItem('utc:clients:index') || '[]');
index.push({
  id: clientId,
  name: 'Legacy Client (Unencrypted)',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isEncrypted: false
});
localStorage.setItem('utc:clients:index', JSON.stringify(index));
console.log('Created unencrypted client:', clientId);
```
3. Refresh page
4. Open Client Manager

**Expected**:
- ✅ Blue banner appears: "🔐 Enhance Security - You have unencrypted client data"
- ✅ Legacy client shows in list WITHOUT 🔒 badge
- ✅ Encrypted clients show WITH 🔒 badge

---

### Test 3.2: Migrate Single Client

**Steps**:
1. Select the unencrypted client
2. Click "🔒 Encrypt" button

**Expected**:
- ✅ If locked, passphrase modal appears (setup mode)
- ✅ Enter passphrase (or use existing if unlocked)
- ✅ Client migrates successfully
- ✅ Client list refreshes
- ✅ Client now shows 🔒 Encrypted badge

**Verify**:
```javascript
// In console:
const clients = JSON.parse(localStorage.getItem('utc:clients:index'));
clients.forEach(c => console.log(c.name, '→', c.isEncrypted ? 'Encrypted' : 'Unencrypted'));
```

---

### Test 3.3: Migrate All Clients

**Steps**:
1. Create 2-3 unencrypted clients (repeat Test 3.1 code)
2. Click "Migrate All" button in blue banner

**Expected**:
- ✅ Confirmation dialog: "Migrate all unencrypted clients..."
- ✅ All clients migrate
- ✅ Blue banner disappears
- ✅ All clients show 🔒 Encrypted badge

---

## Test Suite 4: Loading Encrypted Data

### Test 4.1: Load When Unlocked

**Steps**:
1. Ensure unlocked (🔓 status)
2. Select encrypted client
3. Click "Load"

**Expected**:
- ✅ No passphrase prompt
- ✅ Data loads immediately
- ✅ Calculator populated correctly
- ✅ SSN decrypted and visible (if entered)

---

### Test 4.2: Load When Locked

**Steps**:
1. Click "Lock" button
2. Select encrypted client
3. Click "Load"

**Expected**:
- ✅ Passphrase prompt appears
- ✅ After correct passphrase, data loads
- ✅ Status changes to 🔓 Unlocked

---

## Test Suite 5: Delete Operations

### Test 5.1: Delete Encrypted Client

**Steps**:
1. Select an encrypted client
2. Click "Delete"

**Expected**:
- ✅ Confirmation dialog: "Are you sure you want to delete..."
- ✅ After confirmation, client removed from list
- ✅ No errors in console

---

### Test 5.2: Delete While Locked

**Steps**:
1. Lock the storage
2. Delete a client

**Expected**:
- ✅ Deletion works even when locked
- ✅ No passphrase required for deletion

**Why**: Deletion only needs the client ID, not decryption.

---

## Test Suite 6: Error Handling

### Test 6.1: Wrong Passphrase

**Steps**:
1. Lock storage
2. Try to load with wrong passphrase

**Expected**:
- ✅ Error message: "Failed to decrypt client data..."
- ✅ Modal stays open
- ✅ Can retry with correct passphrase

---

### Test 6.2: Forgotten Passphrase

**Scenario**: User genuinely forgot passphrase

**Steps**:
1. Close all browser tabs
2. Reopen application
3. Try to load encrypted client with wrong passphrase

**Expected**:
- ✅ Error message shown
- ✅ No recovery option (by design - zero knowledge)

**Recovery Path**:
- User must delete encrypted clients
- Re-enter data and save with new passphrase
- *Future enhancement: Export reminder before encryption*

---

## Test Suite 7: Browser Compatibility

### Test 7.1: Modern Browser (Chrome/Edge/Firefox)

**Steps**:
1. Test all above scenarios in Chrome/Edge
2. Repeat in Firefox

**Expected**:
- ✅ All features work
- ✅ Web Crypto API available
- ✅ Encryption successful

---

### Test 7.2: Insecure Context (HTTP)

**Note**: Only if you deploy to HTTP (not HTTPS/localhost)

**Steps**:
1. Access app over HTTP (e.g., via LAN IP)
2. Try to save a client

**Expected**:
- ✅ Yellow warning: "Encryption Unavailable - Your browser doesn't support encryption"
- ✅ Option to "Continue Unencrypted"
- ✅ Data saves but NOT encrypted
- ✅ Client shows in list WITHOUT 🔒 badge

---

## Test Suite 8: Audit Log Verification

### Test 8.1: Check Audit Trail

**Steps**:
1. Perform various operations (save, load, delete, migrate)
2. Check console logs or localStorage

**Expected**:
```javascript
// In console:
const auditLog = JSON.parse(localStorage.getItem('utc:audit:log') || '[]');
console.table(auditLog.slice(-10)); // Last 10 entries
```

Should see entries for:
- ✅ SAVE_CLIENT (with encrypted: true/false)
- ✅ LOAD_CLIENT (with decrypted: true/false)
- ✅ DELETE_CLIENT
- ✅ MIGRATE_CLIENT

---

## Test Suite 9: Edge Cases

### Test 9.1: Empty Passphrase Field

**Steps**: Try to submit passphrase modal with empty field

**Expected**: ✅ Error: "Please enter a passphrase"

---

### Test 9.2: Special Characters in Passphrase

**Steps**: Use passphrase with special chars: `P@ssw0rd!2025#$%`

**Expected**: ✅ Should work correctly

---

### Test 9.3: Very Long Client Name

**Steps**: Save client with 100+ character name

**Expected**: ✅ Should save and display (may truncate in UI)

---

### Test 9.4: Rapid Save/Load

**Steps**: Quickly save and load multiple clients

**Expected**: ✅ No race conditions or errors

---

## Common Issues & Troubleshooting

### Issue: "Encryption key required. Please unlock your data."

**Cause**: Session lost encryption key
**Fix**: Enter passphrase again

---

### Issue: Modal doesn't close after save

**Cause**: Possible error in save operation
**Fix**: Check browser console for errors, report bug

---

### Issue: Client list not refreshing

**Cause**: State not updating
**Fix**: Close and reopen Client Manager modal

---

### Issue: Can't decrypt old clients

**Cause**: Passphrase changed or corrupted data
**Fix**: No recovery possible - delete and re-enter

---

## Success Criteria - Overall

**Phase 1 is successfully validated if**:
- ✅ All Test Suite 1-5 tests pass
- ✅ Encryption/decryption works correctly
- ✅ Lock/unlock flow works as expected
- ✅ Migration from unencrypted to encrypted works
- ✅ Passphrase validation prevents weak passwords
- ✅ Session management works correctly
- ✅ No errors in browser console
- ✅ No PII visible in localStorage (check manually)

---

## Reporting Issues

If you find bugs during testing:

1. **Check browser console** for errors
2. **Note steps to reproduce**
3. **Check localStorage** state:
   ```javascript
   // Dump all storage
   console.log('Clients:', localStorage.getItem('utc:clients:index'));
   console.log('Key hash:', localStorage.getItem('utc:encryption:keyHash'));
   console.log('Session key:', sessionStorage.getItem('utc:encryption:key'));
   ```
4. **Report** with:
   - Browser & version
   - Steps to reproduce
   - Expected vs actual behavior
   - Console errors (if any)

---

## Next Steps After Testing

Once manual testing is complete:

1. **Document any issues found**
2. **Fix critical bugs** before proceeding
3. **Move to Phase 3**: Production Infrastructure
   - Build Tailwind locally
   - Web Worker for calculations
   - Playwright E2E tests (automate this manual test suite!)

---

**Happy Testing! 🧪**
