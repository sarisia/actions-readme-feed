"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatFeeds = void 0;
const placeholderRe = /(?<raw>\$\{(?<flag>\d*)(?<verb>.+?)\})/g;
function formatFeeds(feeds, format, startFlag, endFlag, locale, timezone) {
    const fields = [...format.matchAll(placeholderRe)].map((e) => e.groups);
    return [
        startFlag,
        ...feeds.map((feed) => formatFeed(feed, format, fields, locale, timezone)),
        endFlag
    ];
}
exports.formatFeeds = formatFeeds;
function formatFeed(feed, format, fields, locale, timezone) {
    const feedDate = feed.isoDate ? new Date(feed.isoDate) : undefined;
    const args = {
        title: feed.title || '(no title)',
        url: feed.link,
        year: feedDate === null || feedDate === void 0 ? void 0 : feedDate.toLocaleString(locale, { timeZone: timezone, year: 'numeric' }),
        month: feedDate === null || feedDate === void 0 ? void 0 : feedDate.toLocaleString(locale, { timeZone: timezone, month: 'numeric' }),
        monthshort: feedDate === null || feedDate === void 0 ? void 0 : feedDate.toLocaleString(locale, { timeZone: timezone, month: 'short' }),
        monthlong: feedDate === null || feedDate === void 0 ? void 0 : feedDate.toLocaleString(locale, { timeZone: timezone, month: 'long' }),
        day: feedDate === null || feedDate === void 0 ? void 0 : feedDate.toLocaleString(locale, { timeZone: timezone, day: 'numeric' }),
        date: feedDate === null || feedDate === void 0 ? void 0 : feedDate.toLocaleString(locale, { timeZone: timezone })
    };
    return fields.reduce((acc, cur) => {
        const padstring = cur.flag.startsWith('0') ? '0' : ' ';
        const padlength = parseInt(cur.flag);
        const argraw = args[cur.verb];
        const arg = padlength ? argraw === null || argraw === void 0 ? void 0 : argraw.padStart(padlength, padstring) : argraw;
        return acc.replace(cur.raw, arg || '');
    }, format);
}
