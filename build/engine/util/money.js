"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCents = exports.safeCurrencyToCents = exports.isValidCurrency = exports.roundToCents = exports.percentOf = exports.max0 = exports.multiplyCents = exports.subtractCents = exports.addCents = exports.centsToDollars = exports.dollarsToCents = exports.cents = exports.toCents = exports.C = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
// Configure Decimal.js for financial calculations
decimal_js_1.default.set({
    precision: 20,
    rounding: decimal_js_1.default.ROUND_HALF_UP,
    toExpNeg: -15,
    toExpPos: 15,
    modulo: decimal_js_1.default.ROUND_FLOOR,
    crypto: false
});
// Core utility functions for money calculations
const C = (n) => new decimal_js_1.default(n);
exports.C = C;
// Convert Decimal to cents (integer)
const toCents = (d) => Number(d.toDecimalPlaces(0, decimal_js_1.default.ROUND_HALF_UP).toString());
exports.toCents = toCents;
// Create Decimal from cents
const cents = (n) => new decimal_js_1.default(n);
exports.cents = cents;
// Convert dollars to cents
const dollarsToCents = (dollars) => Math.round(dollars * 100);
exports.dollarsToCents = dollarsToCents;
// Convert cents to dollars
const centsToDollars = (cents) => cents / 100;
exports.centsToDollars = centsToDollars;
// Add multiple cent values safely
const addCents = (...vals) => {
    return (0, exports.toCents)(vals.reduce((acc, v) => acc.plus(v || 0), (0, exports.C)(0)));
};
exports.addCents = addCents;
// Subtract cents safely
const subtractCents = (a, b) => {
    return (0, exports.toCents)((0, exports.C)(a).minus(b));
};
exports.subtractCents = subtractCents;
// Multiply cents by rate safely
const multiplyCents = (cents, rate) => {
    return (0, exports.toCents)((0, exports.C)(cents).times(rate));
};
exports.multiplyCents = multiplyCents;
// Ensure non-negative result
const max0 = (n) => Math.max(0, n);
exports.max0 = max0;
// Calculate percentage of amount
const percentOf = (amount, percentage) => {
    return (0, exports.toCents)((0, exports.C)(amount).times(percentage));
};
exports.percentOf = percentOf;
// Round to nearest cent
const roundToCents = (amount) => {
    return Math.round(amount);
};
exports.roundToCents = roundToCents;
// Validate currency amount
const isValidCurrency = (amount) => {
    if (amount === null || amount === undefined)
        return true;
    if (typeof amount === 'string') {
        const num = parseFloat(amount);
        return !isNaN(num) && isFinite(num);
    }
    return typeof amount === 'number' && isFinite(amount);
};
exports.isValidCurrency = isValidCurrency;
// Safe currency conversion with validation
const safeCurrencyToCents = (amount) => {
    if (amount === null || amount === undefined || amount === '')
        return 0;
    if (typeof amount === 'string') {
        // Remove currency symbols and commas
        const cleaned = amount.replace(/[$,\s]/g, '');
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : (0, exports.dollarsToCents)(num);
    }
    if (typeof amount === 'number') {
        return isFinite(amount) ? (0, exports.dollarsToCents)(amount) : 0;
    }
    return 0;
};
exports.safeCurrencyToCents = safeCurrencyToCents;
// Format cents as currency string
const formatCents = (cents) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format((0, exports.centsToDollars)(cents));
};
exports.formatCents = formatCents;
//# sourceMappingURL=money.js.map