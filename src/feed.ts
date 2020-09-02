import Parser, * as rss from 'rss-parser'

const parser = new Parser({
    timeout: 5000
})

export async function getFeedItems(url:string): Promise<rss.Item[]> {
    const feed = await parser.parseURL(url)
    if (!feed.items) {
        throw new Error('item not found in feed.') 
    }

    return feed.items
}

export function sortItems(items: rss.Item[]): rss.Item[] {
    // to avoid instantiate `Date` every time,
    // we make sort map first
    const mapped = items.map((v, i) => {
        if (!v.isoDate) {
            throw new Error('cannot perform sort without `date` in your feed')
        }

        return {
            index: i,
            date: new Date(v.isoDate)
        }
    })

    mapped.sort((a, b) => 
        b.date.getTime() - a.date.getTime()
    )

    return mapped.map((v) => items[v.index])
}
