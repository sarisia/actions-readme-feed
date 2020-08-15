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
        const maxEntry = parseInt(core.getInput('max_entry')) || 5;
        const format = process.env['INPUT_FORMAT'] || '- ${monthshort} ${02day} - [${title}](${url})';
        const startFlag = core.getInput('start_flag') || '<!-- feed start -->';
        const endFlag = core.getInput('end_flag') || '<!-- feed end -->';
        core.startGroup('Dump config');
        core.info(`url: ${url}`);
        core.info(`file: ${file}`);
        core.info(`max_entry: ${maxEntry}`);
        core.info(`format: ${format}`);
        core.info(`start_flag: ${startFlag}`);
        core.info(`end_flag: ${endFlag}`);
        core.endGroup();
        let lines;
        try {
            lines = yield markdown_1.getLines(file);
        }
        catch (e) {
            core.error(`failed to read file: ${e.message}`);
            return;
        }
        let items;
        try {
            items = yield feed_1.getFeedItems(url);
        }
        catch (e) {
            core.error(`failed to get feed: ${e.message}`);
            return;
        }
        const newLines = format_1.formatFeeds(items.slice(0, maxEntry), format, startFlag, endFlag);
        core.startGroup('Dump feeds');
        core.info(newLines.join('\n'));
        core.endGroup();
        const result = markdown_1.updateFeed(lines, newLines, startFlag, endFlag);
        core.startGroup('Dump result');
        core.info(result.join('\n'));
        core.endGroup();
        try {
            yield markdown_1.writeLines(file, result);
        }
        catch (e) {
            core.error(`failed to write file: ${e.message}`);
            return;
        }
        core.info('Done!');
    });
}
run();
