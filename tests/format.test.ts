import { formatFeeds } from '../src/format'
import rss from 'rss-parser'

const startFlag = "<!-- feed start -->"
const endFlag = "<!-- feed end -->"
const locale = 'en-US'
const timezone = 'UTC'

describe("formatFeeds", () => {
    test("full", () => {
        const feeds: Array<rss.Item> = [
            {
                link: "https://blog.example.com/entry1",
                title: "example blog entry",
                isoDate: "2015-11-12T21:16:39.000Z"
            },
            {
                link: "https://blog.example.com/entry2",
                title: "example blog entry 2",
                isoDate: "2020-08-01T00:11:22.000Z"
            }
        ]
        const format = "${title}:${url}:${year}:${month}:${monthshort}:${monthlong}:${day}:${date}"
        const want = [
            "<!-- feed start -->",
            "example blog entry:https://blog.example.com/entry1:2015:11:Nov:November:12:11/12/2015, 9:16:39 PM",
            "example blog entry 2:https://blog.example.com/entry2:2020:8:Aug:August:1:8/1/2020, 12:11:22 AM",
            "<!-- feed end -->"
        ]
        const got = formatFeeds(feeds, format, startFlag, endFlag, locale, timezone)
        expect(got).toStrictEqual(want)
    })

    test("full with empty feeds", () => {
        const feeds: Array<rss.Item> = [
            {},
            {}
        ]
        const format = "title:${title},url:${url},month:${month},day:${day},date:${date}"
        const want = [
            "<!-- feed start -->",
            "title:(no title),url:,month:,day:,date:",
            "title:(no title),url:,month:,day:,date:",
            "<!-- feed end -->"
        ]
        const got = formatFeeds(feeds, format, startFlag, endFlag, locale, timezone)
        expect(got).toStrictEqual(want)
    })

    test("different locale and timezone", () => {
        const feeds: Array<rss.Item> = [
            {
                link: "https://blog.example.com/entry1",
                title: "example blog entry",
                isoDate: "2015-11-12T21:16:39.000Z"
            },
            {
                link: "https://blog.example.com/entry2",
                title: "example blog entry 2",
                isoDate: "2020-08-01T00:11:22.000Z"
            }
        ]
        const format = "${title}:${url}:${year}:${month}:${monthshort}:${monthlong}:${day}:${date}"
        const want = [
            "<!-- feed start -->",
            "example blog entry:https://blog.example.com/entry1:2015年:11月:11月:11月:13日:2015/11/13 6:16:39",
            "example blog entry 2:https://blog.example.com/entry2:2020年:8月:8月:8月:1日:2020/8/1 9:11:22",
            "<!-- feed end -->"
        ]
        const got = formatFeeds(feeds, format, startFlag, endFlag, 'ja-JP', 'Asia/Tokyo')
        expect(got).toStrictEqual(want)
    })

    test("same directive twice", () => {
        const feeds: Array<rss.Item> = [
            {
                link: "https://blog.example.com/entry1",
                title: "example blog entry",
                isoDate: "2015-11-12T21:16:39.000Z"
            },
            {
                link: "https://blog.example.com/entry2",
                title: "example blog entry 2",
                isoDate: "2020-08-01T00:11:22.000Z"
            }
        ]
        const format = "title:${title},title2:${title}"
        const want = [
            "<!-- feed start -->",
            "title:example blog entry,title2:example blog entry",
            "title:example blog entry 2,title2:example blog entry 2",
            "<!-- feed end -->"
        ]
        const got = formatFeeds(feeds, format, startFlag, endFlag, locale, timezone)
        expect(got).toStrictEqual(want)
    })

    test("missing directive", () => {
        const feeds: Array<rss.Item> = [
            {
                link: "https://blog.example.com/entry1",
                title: "example blog entry",
                isoDate: "2015-11-12T21:16:39.000Z"
            },
            {
                link: "https://blog.example.com/entry2",
                title: "example blog entry 2",
                isoDate: "2020-08-01T00:11:22.000Z"
            }
        ]
        const format = "missing:${thisismissingdirective}"
        const want = [
            "<!-- feed start -->",
            "missing:",
            "missing:",
            "<!-- feed end -->"
        ]
        const got = formatFeeds(feeds, format, startFlag, endFlag, locale, timezone)
        expect(got).toStrictEqual(want)
    })

    test("ignore field", () => {
        const feeds: Array<rss.Item> = [
            {
                link: "https://blog.example.com/entry1",
                title: "example blog entry",
                isoDate: "2015-11-12T21:16:39.000Z"
            },
            {
                link: "https://blog.example.com/entry2",
                title: "example blog entry 2",
                isoDate: "2020-08-01T00:11:22.000Z"
            }
        ]
        const format = "{title}:{url}:{${year}}"
        const want = [
            "<!-- feed start -->",
            "{title}:{url}:{2015}",
            "{title}:{url}:{2020}",
            "<!-- feed end -->"
        ]
        const got = formatFeeds(feeds, format, startFlag, endFlag, locale, timezone)
        expect(got).toStrictEqual(want)
    })

    test("zero padding", () => {
        const feeds: Array<rss.Item> = [
            {
                link: "https://blog.example.com/entry1",
                title: "example blog entry",
                isoDate: "2015-11-12T21:16:39.000Z"
            },
            {
                link: "https://blog.example.com/entry2",
                title: "example blog entry 2",
                isoDate: "2020-08-01T00:11:22.000Z"
            }
        ]
        const format = "day:${05day}"
        const want = [
            "<!-- feed start -->",
            "day:00012",
            "day:00001",
            "<!-- feed end -->"
        ]
        const got = formatFeeds(feeds, format, startFlag, endFlag, locale, timezone)
        expect(got).toStrictEqual(want)
    })

    test("space padding", () => {
        const feeds: Array<rss.Item> = [
            {
                link: "https://blog.example.com/entry1",
                title: "example blog entry",
                isoDate: "2015-11-12T21:16:39.000Z"
            },
            {
                link: "https://blog.example.com/entry2",
                title: "example blog entry 2",
                isoDate: "2020-08-01T00:11:22.000Z"
            }
        ]
        const format = "day:${8day}"
        const want = [
            "<!-- feed start -->",
            "day:      12",
            "day:       1",
            "<!-- feed end -->"
        ]
        const got = formatFeeds(feeds, format, startFlag, endFlag, locale, timezone)
        expect(got).toStrictEqual(want)
    })

    test("invalid padding flag (length is 0)", () => {
        const feeds: Array<rss.Item> = [
            {
                link: "https://blog.example.com/entry1",
                title: "example blog entry",
                isoDate: "2015-11-12T21:16:39.000Z"
            },
            {
                link: "https://blog.example.com/entry2",
                title: "example blog entry 2",
                isoDate: "2020-08-01T00:11:22.000Z"
            }
        ]
        const format = "day:${0day}"
        const want = [
            "<!-- feed start -->",
            "day:12",
            "day:1",
            "<!-- feed end -->"
        ]
        const got = formatFeeds(feeds, format, startFlag, endFlag, locale, timezone)
        expect(got).toStrictEqual(want)
    })
})
