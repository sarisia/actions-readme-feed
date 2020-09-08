import * as core from '@actions/core'
import { promises as fs } from 'fs'

const lineBraekRe = /\r?\n/

export async function getLines(file:string): Promise<Array<string>> {
    return (await fs.readFile(file, 'utf8')).split(lineBraekRe)
}

export function updateFeed(lines: Array<string>, newlines: Array<string>, startFlag: string, endFlag: string) {
    const startFlagPos = lines.indexOf(startFlag)
    const endFlagPos = lines.indexOf(endFlag, Math.max(startFlagPos, 0))
    core.info(`start_flag position: ${startFlagPos}`)
    core.info(`end_flag position: ${endFlagPos}`)

    return insertLines(lines, newlines, startFlagPos, endFlagPos)
}

function insertLines(
    lines: Array<string>, 
    newlines: Array<string>,
    startFlagPos: number,
    endFlagPos: number
) {
    const flagMax = Math.max(startFlagPos, endFlagPos)
    const flagMin = Math.min(startFlagPos, endFlagPos)
    let newStartPos = startFlagPos
    let newEndPos = endFlagPos

    if (flagMax < 0) {
        // we do not have neither startFlag nor endFlag
        // append to last
        return [...lines, ...newlines]
    }

    if (flagMin < 0) {
        // we only have one of each
        // use that flag pos
        newStartPos = newEndPos = flagMax
    }

    return [
        ...lines.slice(0, newStartPos),
        ...newlines,
        ...lines.slice(newEndPos+1)
    ]
}

export async function writeLines(file:string, lines:Array<string>) {
    await fs.writeFile(file, lines.join('\n'))
}

export async function write(file:string, data:string) {
    await fs.writeFile(file, data)
}

export function isChanged(orig: string[], curr: string[]): boolean {
    if (orig.length !== curr.length) {
        return true
    }

    return !orig.every((l, i) => l === curr[i])
}
