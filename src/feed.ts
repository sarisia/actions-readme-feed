import Parser, * as rss from 'rss-parser'

const parser = new Parser({
    timeout: 5000
})

export async function getFeedItems(url:string): Promise<Array<rss.Item>> {
    const feed = await parser.parseURL(url)
    if (!feed.items) {
        throw new Error('item not found in feed.') 
    }

    return feed.items
}
