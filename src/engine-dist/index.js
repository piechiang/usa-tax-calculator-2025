"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMDLocalRate = exports.getMarylandCounties = exports.isMarylandResident = exports.computeMD2025 = exports.computeFederal2025 = exports.MD_RULES_2025 = exports.LLC_2025 = exports.AOTC_2025 = exports.EITC_2025 = exports.CTC_2025 = exports.SALT_CAP_2025 = exports.ADDITIONAL_STANDARD_DEDUCTION_2025 = exports.STANDARD_DEDUCTION_2025 = exports.FEDERAL_BRACKETS_2025 = void 0;
// Main engine exports
__exportStar(require("./types"), exports);
__exportStar(require("./util/money"), exports);
__exportStar(require("./util/math"), exports);
// Rules exports
var federalBrackets_1 = require("./rules/2025/federal/federalBrackets");
Object.defineProperty(exports, "FEDERAL_BRACKETS_2025", { enumerable: true, get: function () { return federalBrackets_1.FEDERAL_BRACKETS_2025; } });
var deductions_1 = require("./rules/2025/federal/deductions");
Object.defineProperty(exports, "STANDARD_DEDUCTION_2025", { enumerable: true, get: function () { return deductions_1.STANDARD_DEDUCTION_2025; } });
Object.defineProperty(exports, "ADDITIONAL_STANDARD_DEDUCTION_2025", { enumerable: true, get: function () { return deductions_1.ADDITIONAL_STANDARD_DEDUCTION_2025; } });
Object.defineProperty(exports, "SALT_CAP_2025", { enumerable: true, get: function () { return deductions_1.SALT_CAP_2025; } });
var credits_1 = require("./rules/2025/federal/credits");
Object.defineProperty(exports, "CTC_2025", { enumerable: true, get: function () { return credits_1.CTC_2025; } });
Object.defineProperty(exports, "EITC_2025", { enumerable: true, get: function () { return credits_1.EITC_2025; } });
Object.defineProperty(exports, "AOTC_2025", { enumerable: true, get: function () { return credits_1.AOTC_2025; } });
Object.defineProperty(exports, "LLC_2025", { enumerable: true, get: function () { return credits_1.LLC_2025; } });
var md_1 = require("./rules/2025/states/md");
Object.defineProperty(exports, "MD_RULES_2025", { enumerable: true, get: function () { return md_1.MD_RULES_2025; } });
// Calculator exports - using v2 as main implementation
var computeFederal2025_v2_1 = require("./federal/2025/computeFederal2025_v2");
Object.defineProperty(exports, "computeFederal2025", { enumerable: true, get: function () { return computeFederal2025_v2_1.computeFederal2025; } });
var computeMD2025_1 = require("./states/md/2025/computeMD2025");
Object.defineProperty(exports, "computeMD2025", { enumerable: true, get: function () { return computeMD2025_1.computeMD2025; } });
Object.defineProperty(exports, "isMarylandResident", { enumerable: true, get: function () { return computeMD2025_1.isMarylandResident; } });
Object.defineProperty(exports, "getMarylandCounties", { enumerable: true, get: function () { return computeMD2025_1.getMarylandCounties; } });
Object.defineProperty(exports, "getMDLocalRate", { enumerable: true, get: function () { return computeMD2025_1.getMDLocalRate; } });
//# sourceMappingURL=index.js.map