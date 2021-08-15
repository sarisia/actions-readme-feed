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
        const sort = core.getInput('sort').toLowerCase() === 'true';
        const maxEntry = parseInt(core.getInput('max_entry'), 10) || 5;
        if (maxEntry < 0) {
            core.setFailed("cannot set `maxEntry` to lower than 0");
            return;
        }
        const format = process.env['INPUT_FORMAT'] || '- ${monthshort} ${02day} - [${title}](${url})';
        const startFlag = core.getInput('start_flag') || '<!-- feed start -->';
        const endFlag = core.getInput('end_flag') || '<!-- feed end -->';
        const locale = core.getInput('locale') || 'en-US';
        const timezone = core.getInput('timezone') || 'UTC';
        const nowrite = core.getInput('nowrite').toLowerCase() === 'true';
        const retry = parseInt(core.getInput('retry'), 10) || 3;
        if (retry < 0) {
            core.setFailed("cannot set `retry` to lower than 0");
            return;
        }
        const retryBackoff = parseInt(core.getInput('retry_backoff'), 10) || 5;
        if (retryBackoff < 0) {
            core.setFailed("cannot set `retryBackoff` to lower than 0");
            return;
        }
        const ensureAll = core.getInput('ensure_all').toLowerCase() === 'true';
        const allowEmpty = core.getBooleanInput('allow_empty');
        const url = core.getInput('url') || '';
        const urls = url.split('\n').filter(x => x || false);
        urls.forEach((u) => {
            core.setSecret(u);
        });
        if (!urls.length) {
            core.setFailed('url is missing.');
            return;
        }
        const file = core.getInput('file');
        if (!file) {
            if (nowrite) {
                core.warning('file is missing, but nowrite is set. Continue...');
            }
            else {
                core.setFailed('file is missing.');
                return;
            }
        }
        let lines = [];
        if (file) {
            try {
                lines = yield markdown_1.getLines(file);
            }
            catch (e) {
                core.setFailed(`failed to read file: ${e.message}`);
                return;
            }
        }
        const fetchers = urls.map((u, i) => {
            return function () {
                return __awaiter(this, void 0, void 0, function* () {
                    for (let trycount = 0; trycount < retry; ++trycount) {
                        if (trycount) {
                            yield new Promise(resolve => setTimeout(resolve, retryBackoff * 1000));
                        }
                        try {
                            return yield feed_1.getFeedItems(u);
                        }
                        catch (e) {
                            core.error(`[feed ${i + 1}/${urls.length}][try ${trycount + 1}/${retry}] failed to get feed: ${e}`);
                        }
                    }
                    core.error(`[feed ${i + 1}/${urls.length}] max retry count exceeded. Abort.`);
                    if (ensureAll) {
                        throw new Error("failed to fetch some feeds.");
                    }
                    return [];
                });
            };
        });
        let allItems = [];
        try {
            const results = yield Promise.all(fetchers.map(f => f()));
            allItems = allItems.concat(...results);
        }
        catch (e) {
            core.setFailed("Aborted by ensure_all");
            return;
        }
        if (!allItems.length && !allowEmpty) {
            core.setFailed('Nothing was fetched');
            return;
        }
        if (sort) {
            try {
                allItems = feed_1.sortItems(allItems);
            }
            catch (e) {
                core.setFailed(`failed to sort feed items: ${e.message}`);
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
        if (!nowrite) {
            try {
                yield markdown_1.write(file, joinedResult);
            }
            catch (e) {
                core.setFailed(`failed to write file: ${e.message}`);
                return;
            }
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
