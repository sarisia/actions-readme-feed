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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
const core = __importStar(require("@actions/core"));
const feed_1 = require("./feed");
const markdown_1 = require("./markdown");
const format_1 = require("./format");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = core.getInput('url');
        if (!url) {
            core.error('url is missing.');
            return;
        }
        const file = core.getInput('file');
        if (!file) {
            core.error('file is missing.');
            return;
        }
        const sort = core.getInput('sort').toLowerCase() === 'true';
        const maxEntry = parseInt(core.getInput('max_entry')) || 5;
        const format = process.env['INPUT_FORMAT'] || '- ${monthshort} ${02day} - [${title}](${url})';
        const startFlag = core.getInput('start_flag') || '<!-- feed start -->';
        const endFlag = core.getInput('end_flag') || '<!-- feed end -->';
        const locale = core.getInput('locale') || 'en-US';
        const timezone = core.getInput('timezone') || 'UTC';
        let lines;
        try {
            lines = yield markdown_1.getLines(file);
        }
        catch (e) {
            core.error(`failed to read file: ${e.message}`);
            return;
        }
        let allItems;
        try {
            allItems = yield feed_1.getFeedItems(url);
        }
        catch (e) {
            core.error(`failed to get feed: ${e.message}`);
            return;
        }
        if (sort) {
            try {
                allItems = feed_1.sortItems(allItems);
            }
            catch (e) {
                core.error(`failed to sort feed items: ${e.message}`);
                return;
            }
        }
        const items = allItems.slice(0, maxEntry);
        const newLines = format_1.formatFeeds(items, format, startFlag, endFlag, locale, timezone);
        const joinedNewLines = newLines.join('\n');
        core.startGroup('Dump feeds block');
        core.info(joinedNewLines);
        core.endGroup();
        const result = markdown_1.updateFeed(lines, newLines, startFlag, endFlag);
        const joinedResult = result.join('\n');
        core.startGroup('Dump result document');
        core.info(joinedResult);
        core.endGroup();
        try {
            yield markdown_1.write(file, joinedResult);
        }
        catch (e) {
            core.error(`failed to write file: ${e.message}`);
            return;
        }
        core.info('Generating outputs...');
        core.setOutput('items', items);
        core.setOutput('newlines', joinedNewLines);
        core.setOutput('result', joinedResult);
        core.setOutput('changed', markdown_1.isChanged(lines, result) ? '1' : '0');
        core.info('Done!');
    });
}
run();
