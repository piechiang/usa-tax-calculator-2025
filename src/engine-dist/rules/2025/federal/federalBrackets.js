"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEDERAL_BRACKETS_2025 = void 0;
exports.FEDERAL_BRACKETS_2025 = {
    single: [
        { min: 0, max: 1192500, rate: 0.10 },
        { min: 1192500, max: 4847500, rate: 0.12 },
        { min: 4847500, max: 10335000, rate: 0.22 },
        { min: 10335000, max: 19730000, rate: 0.24 },
        { min: 19730000, max: 25052500, rate: 0.32 },
        { min: 25052500, max: 62635000, rate: 0.35 },
        { min: 62635000, max: Infinity, rate: 0.37 }, // $626,350+
    ],
    marriedJointly: [
        { min: 0, max: 2385000, rate: 0.10 },
        { min: 2385000, max: 9695000, rate: 0.12 },
        { min: 9695000, max: 20670000, rate: 0.22 },
        { min: 20670000, max: 39460000, rate: 0.24 },
        { min: 39460000, max: 50105000, rate: 0.32 },
        { min: 50105000, max: 75160000, rate: 0.35 },
        { min: 75160000, max: Infinity, rate: 0.37 }, // $751,600+
    ],
    marriedSeparately: [
        { min: 0, max: 1192500, rate: 0.10 },
        { min: 1192500, max: 4847500, rate: 0.12 },
        { min: 4847500, max: 10335000, rate: 0.22 },
        { min: 10335000, max: 19730000, rate: 0.24 },
        { min: 19730000, max: 25052500, rate: 0.32 },
        { min: 25052500, max: 37580000, rate: 0.35 },
        { min: 37580000, max: Infinity, rate: 0.37 }, // $375,800+
    ],
    headOfHousehold: [
        { min: 0, max: 1700000, rate: 0.10 },
        { min: 1700000, max: 6485000, rate: 0.12 },
        { min: 6485000, max: 10335000, rate: 0.22 },
        { min: 10335000, max: 19730000, rate: 0.24 },
        { min: 19730000, max: 25050000, rate: 0.32 },
        { min: 25050000, max: 62635000, rate: 0.35 },
        { min: 62635000, max: Infinity, rate: 0.37 }, // $626,350+
    ],
};
//# sourceMappingURL=federalBrackets.js.map