import rss from 'rss-parser'


interface MatchedPlaceholder {
    raw: string
    flag: string
    verb: string
}


const placeholderRe = /(?<raw>\$\{(?<flag>\d*)(?<verb>.+?)\})/g

export function formatFeeds(
    feeds: Array<rss.Item>, format: string, startFlag: string, endFlag: string,
    locale: string, timezone: string
): Array<string> {
    const fields = [...format.matchAll(placeholderRe)].map((e) => e.groups) as unknown as MatchedPlaceholder[]
    return [
        startFlag,
        ...feeds.map((feed) => formatFeed(feed, format, fields, locale, timezone)),
        endFlag
    ]
}

function formatFeed(
    feed: rss.Item, format: string, fields: MatchedPlaceholder[],
    locale: string, timezone: string): string {
    const feedDate = feed.isoDate ? new Date(feed.isoDate) : undefined

    // TODO: more memory-friendly arg initialize
    const args: { [k: string]: string | undefined } = {
        title: feed.title || '(no title)',
        url: feed.link,
        year: feedDate?.toLocaleString(locale, { timeZone: timezone, year: 'numeric' }),
        month: feedDate?.toLocaleString(locale, { timeZone: timezone, month: 'numeric' }),
        monthshort: feedDate?.toLocaleString(locale, { timeZone: timezone, month: 'short' }),
        monthlong: feedDate?.toLocaleString(locale, { timeZone: timezone, month: 'long' }),
        day: feedDate?.toLocaleString(locale, { timeZone: timezone, day: 'numeric' }),
        date: feedDate?.toLocaleString(locale, { timeZone: timezone }),
        guid: feed.guid,
        description: feed.description,
    }

    return fields.reduce((acc: string, cur: MatchedPlaceholder) => {
        // flag: 2 -> pad to length 2 with space (' ')
        // flag:02 -> pad to length 2 with zero('0')
        const padstring = cur.flag.startsWith('0') ? '0' : ' '
        const padlength = parseInt(cur.flag)
        const argraw = args[cur.verb]
        const arg = padlength ? argraw?.padStart(padlength, padstring) : argraw

        return acc.replace(cur.raw, arg || '')
    }
        , format)
}
