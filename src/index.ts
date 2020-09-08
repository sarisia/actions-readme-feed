import * as core from '@actions/core'
import * as rss from 'rss-parser'
import { getFeedItems, sortItems } from './feed'
import { getLines, writeLines, updateFeed, isChanged, write } from './markdown'
import { formatFeeds } from './format'

async function run() {
    // getting inputs
    const url = core.getInput('url')
    if (!url) {
        core.error('url is missing.')
        return
    }

    const file = core.getInput('file')
    if (!file) {
        core.error('file is missing.')
        return
    }

    const sort = core.getInput('sort').toLowerCase() === 'true'
    const maxEntry = parseInt(core.getInput('max_entry')) || 5
    // DO NOT USE core.getInput since it trims spaces/breaks at the end of line
    const format = process.env['INPUT_FORMAT'] || '- ${monthshort} ${02day} - [${title}](${url})'
    const startFlag = core.getInput('start_flag') || '<!-- feed start -->'
    const endFlag = core.getInput('end_flag') || '<!-- feed end -->'
    const locale = core.getInput('locale') || 'en-US'
    const timezone = core.getInput('timezone') || 'UTC'

    // ger current markdown, parse them
    let lines: string[]
    try {
        lines = await getLines(file)
    } catch(e) {
        core.error(`failed to read file: ${e.message}`)
        return
    }

    // get entries from feed
    let allItems: rss.Item[]
    try {
        allItems = await getFeedItems(url)
    } catch (e) {
        core.error(`failed to get feed: ${e.message}`)
        return
    }

    // sort
    if (sort) {
        try {
            allItems = sortItems(allItems)
        } catch (e) {
            core.error(`failed to sort feed items: ${e.message}`)
            return
        }
    }

    // construct feed lines
    const items = allItems.slice(0, maxEntry)
    const newLines = formatFeeds(items, format, startFlag, endFlag)
    const joinedNewLines = newLines.join('\n')
    core.startGroup('Dump feeds block')
        core.info(joinedNewLines)
    core.endGroup()

    const result = updateFeed(lines, newLines, startFlag, endFlag)
    const joinedResult = result.join('\n')
    core.startGroup('Dump result document')
        core.info(joinedResult)
    core.endGroup()
    
    // write result to file
    try {
        await write(file, joinedResult)
    } catch (e) {
        core.error(`failed to write file: ${e.message}`)
        return
    }

    core.info('Generating outputs...')
    core.setOutput('items', items)
    core.setOutput('newlines', joinedNewLines)
    core.setOutput('result', joinedResult)
    core.setOutput('changed', isChanged(lines, result) ? '1' : '0')
    core.info('Done!')
}

run()
