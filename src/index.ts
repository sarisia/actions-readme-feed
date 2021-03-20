import * as core from '@actions/core'
import * as rss from 'rss-parser'
import { getFeedItems, sortItems } from './feed'
import { getLines, writeLines, updateFeed, isChanged, write } from './markdown'
import { formatFeeds } from './format'

async function run() {
    // getting inputs
    const sort = core.getInput('sort').toLowerCase() === 'true'
    const maxEntry = parseInt(core.getInput('max_entry'), 10) || 5
    if (maxEntry < 0) {
        core.setFailed("cannot set `maxEntry` to lower than 0")
        return
    }
    // DO NOT USE core.getInput since it trims spaces/breaks at the end of line
    const format = process.env['INPUT_FORMAT'] || '- ${monthshort} ${02day} - [${title}](${url})'
    const startFlag = core.getInput('start_flag') || '<!-- feed start -->'
    const endFlag = core.getInput('end_flag') || '<!-- feed end -->'
    const locale = core.getInput('locale') || 'en-US'
    const timezone = core.getInput('timezone') || 'UTC'
    const nowrite = core.getInput('nowrite').toLowerCase() === 'true'
    const retry = parseInt(core.getInput('retry'), 10) || 3
    if (retry < 0) {
        core.setFailed("cannot set `retry` to lower than 0")
        return
    }
    const retryBackoff = parseInt(core.getInput('retry_backoff'), 10) || 5
    if (retryBackoff < 0) {
        core.setFailed("cannot set `retryBackoff` to lower than 0")
        return
    }
    const ensureAll = core.getInput('ensure_all').toLowerCase() === 'true'

    const url = core.getInput('url') || ''
    const urls: string[] = url.split('\n').filter(x => x || false)
    // prevent urls from leak
    urls.forEach((u) => {
        core.setSecret(u)
    })

    if (!urls.length) {
        core.setFailed('url is missing.')
        return
    }
    
    const file = core.getInput('file')
    if (!file) {
        if (nowrite) {
            core.warning('file is missing, but nowrite is set. Continue...')
        } else {
            core.setFailed('file is missing.')
            return
        }
    }

    // ger current markdown, parse them
    let lines: string[] = []
    if (file) {
        try {
            lines = await getLines(file)
        } catch(e) {
            core.setFailed(`failed to read file: ${e.message}`)
            return
        }
    }

    // get entries from feed
    // don't do Array.prototype.forEach! It won't wait promises!
    const fetchers = urls.map((u, i) => {
        return async function() {
            for (let trycount = 0; trycount < retry; ++trycount) {
                if (trycount) {
                    // retry backoff
                    // synchronous sleep
                    await new Promise(resolve => setTimeout(resolve, retryBackoff * 1000))
                }

                try {
                    return await getFeedItems(u)
                } catch (e) {
                    core.error(`[feed ${i + 1}/${urls.length}][try ${trycount+1}/${retry}] failed to get feed: ${e}`)
                }
            }

            core.error(`[feed ${i + 1}/${urls.length}] max retry count exceeded. Abort.`)
            if (ensureAll) {
                throw new Error("failed to fetch some feeds.")
            }

            return []
        }
    })

    let allItems: rss.Item[] = []
    try {
        const results = await Promise.all(fetchers.map(f => f()))
        allItems = allItems.concat(...results)
    } catch(e) {
        core.setFailed(e)
        return
    }

    if (!allItems.length) {
        core.setFailed('Nothing was fetched')
        return
    }

    // sort
    if (sort) {
        try {
            allItems = sortItems(allItems)
        } catch (e) {
            core.setFailed(`failed to sort feed items: ${e.message}`)
            return
        }
    }

    // construct feed lines
    const items = allItems.slice(0, maxEntry)
    const newLines = formatFeeds(items, format, startFlag, endFlag, locale, timezone)
    const joinedNewLines = newLines.join('\n')
    core.startGroup('Dump feeds block')
        core.info(joinedNewLines)
    core.endGroup()

    const result = updateFeed(lines, newLines, startFlag, endFlag)
    const joinedResult = result.join('\n')
    core.startGroup('Dump result document')
        core.info(joinedResult)
    core.endGroup()
    
    // write result to file if nowrite is not set
    if (!nowrite) {
        try {
            await write(file, joinedResult)
        } catch (e) {
            core.setFailed(`failed to write file: ${e.message}`)
            return
        }
    }

    core.info('Generating outputs...')
    core.setOutput('items', items)
    core.setOutput('newlines', joinedNewLines)
    core.setOutput('result', joinedResult)
    core.setOutput('changed', isChanged(lines, result) ? '1' : '0')
    core.info('Done!')
}

run()
