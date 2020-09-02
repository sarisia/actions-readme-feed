import { sortItems } from '../src/feed'
import rss from 'rss-parser'

describe('sortItems', () => {
    test('2 items', () => {
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
        const want = [
            {
                link: "https://blog.example.com/entry2",
                title: "example blog entry 2",
                isoDate: "2020-08-01T00:11:22.000Z"
            },
            {
                link: "https://blog.example.com/entry1",
                title: "example blog entry",
                isoDate: "2015-11-12T21:16:39.000Z"
            }
        ]

        const got = sortItems(feeds)
        expect(got).toStrictEqual(want)
    })

    test('3 items', () => {
        const feeds: Array<rss.Item> = [
            {
                link: "https://blog.example.com/entry1",
                title: "example blog entry",
                isoDate: "2015-11-12T21:16:39.000Z"
            },
            {
                link: "https://blog.example.com/entry3",
                title: "example blog entry 3",
                isoDate: "2020-08-01T00:11:22.000Z"
            },
            {
                link: "https://blog.example.com/entry2",
                title: "example blog entry 2",
                isoDate: "2019-12-10T00:11:22.000Z"
            }
        ]
        const want: Array<rss.Item> = [
            {
                link: "https://blog.example.com/entry3",
                title: "example blog entry 3",
                isoDate: "2020-08-01T00:11:22.000Z"
            },
            {
                link: "https://blog.example.com/entry2",
                title: "example blog entry 2",
                isoDate: "2019-12-10T00:11:22.000Z"
            },
            {
                link: "https://blog.example.com/entry1",
                title: "example blog entry",
                isoDate: "2015-11-12T21:16:39.000Z"
            }
        ]

        const got = sortItems(feeds)
        expect(got).toStrictEqual(want)
    })

    test('mixed timezone', () => {
        const feeds: Array<rss.Item> = [
            {
                link: "https://blog.example.com/pdt",
                title: "example blog entry pdt",
                isoDate: "2019-12-10T00:11:22.000-07:00"
            },
            {
                link: "https://blog.example.com/jst",
                title: "example blog entry jst",
                isoDate: "2019-12-10T00:11:22.000+09:00"
            },
            {
                link: "https://blog.example.com/entry2",
                title: "example blog entry 2",
                isoDate: "2019-12-10T00:11:22.000Z"
            }
        ]
        const want: Array<rss.Item> = [
            {
                link: "https://blog.example.com/pdt",
                title: "example blog entry pdt",
                isoDate: "2019-12-10T00:11:22.000-07:00"
            },
            {
                link: "https://blog.example.com/entry2",
                title: "example blog entry 2",
                isoDate: "2019-12-10T00:11:22.000Z"
            },
            {
                link: "https://blog.example.com/jst",
                title: "example blog entry jst",
                isoDate: "2019-12-10T00:11:22.000+09:00"
            }
        ]

        const got = sortItems(feeds)
        expect(got).toStrictEqual(want)
    })

    test('no date in feed', () => {
        const feeds: Array<rss.Item> = [
            {
                link: "https://blog.example.com/pdt",
                title: "example blog entry pdt",
                isoDate: "2019-12-10T00:11:22.000-07:00"
            },
            {
                link: "https://blog.example.com/jst",
                title: "example blog entry jst",
                isoDate: "2019-12-10T00:11:22.000+09:00"
            },
            {
                link: "https://blog.example.com/entry2",
                title: "example blog entry 2"
            }
        ]

        expect(() => { sortItems(feeds) }).toThrow()
    })
})
