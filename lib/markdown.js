"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeLines = exports.updateFeed = exports.getLines = void 0;
const core = __importStar(require("@actions/core"));
const fs_1 = require("fs");
const lineBraekRe = /\r?\n/;
function getLines(file) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield fs_1.promises.readFile(file, 'utf8')).split(lineBraekRe);
    });
}
exports.getLines = getLines;
function updateFeed(lines, newlines, startFlag, endFlag) {
    const startFlagPos = lines.findIndex(l => l === startFlag);
    const endFlagPos = lines.findIndex(l => l === endFlag);
    core.info(`start_flag position: ${startFlagPos}`);
    core.info(`end_flag position: ${endFlagPos}`);
    return insertLines(lines, newlines, startFlagPos, endFlagPos);
}
exports.updateFeed = updateFeed;
function insertLines(lines, newlines, startFlagPos, endFlagPos) {
    const flagMax = Math.max(startFlagPos, endFlagPos);
    const flagMin = Math.min(startFlagPos, endFlagPos);
    let newStartPos = startFlagPos;
    let newEndPos = endFlagPos;
    if (flagMax < 0) {
        return [...lines, ...newlines];
    }
    if (flagMin < 0) {
        newStartPos = newEndPos = flagMax;
    }
    else if (startFlagPos > endFlagPos) {
        newStartPos = newEndPos = endFlagPos;
    }
    return [
        ...lines.slice(0, newStartPos),
        ...newlines,
        ...lines.slice(newEndPos + 1)
    ];
}
function writeLines(file, lines) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs_1.promises.writeFile(file, lines.join('\n'));
    });
}
exports.writeLines = writeLines;
