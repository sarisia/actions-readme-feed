import * as core from '@actions/core'
import * as rss from 'rss-parser'
import { getFeedItems } from './feed'
import { getLines, writeLines, updateFeed, isChanged } from './markdown'
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

    const maxEntry = parseInt(core.getInput('max_entry')) || 5
    // DO NOT USE core.getInput cuz it trims spaces / breaks at the end of line
    const format = process.env['INPUT_FORMAT'] || '- ${monthshort} ${02day} - [${title}](${url})'
    const startFlag = core.getInput('start_flag') || '<!-- feed start -->'
    const endFlag = core.getInput('end_flag') || '<!-- feed end -->'

    // dump config
    core.startGroup('Dump config')
        core.info(`url: ${url}`)
        core.info(`file: ${file}`)
        core.info(`max_entry: ${maxEntry}`)
        core.info(`format: ${format}`)
        core.info(`start_flag: ${startFlag}`)
        core.info(`end_flag: ${endFlag}`)
    core.endGroup()

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

    // construct feed lines
    const items = allItems.slice(0, maxEntry)
    const newLines = formatFeeds(items, format, startFlag, endFlag)
    const fnewLines = newLines.join('\n')
    core.startGroup('Dump feeds block')
        core.info(fnewLines)
    core.endGroup()

    const result = updateFeed(lines, newLines, startFlag, endFlag)
    const fresult = result.join('\n')
    core.startGroup('Dump result document')
        core.info(fresult)
    core.endGroup()
    
    // write result to file
    try {
        await writeLines(file, result)
    } catch (e) {
        core.error(`failed to write file: ${e.message}`)
        return
    }

    core.info('Generating outputs...')
    core.setOutput('items', items)
    core.setOutput('newlines', fnewLines)
    core.setOutput('result', fresult)
    core.setOutput('changed', isChanged(lines, result) ? '1' : '0')
    core.info('Done!')
}

run()
