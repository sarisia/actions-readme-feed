import { updateFeed } from '../src/markdown'

const newLines = [
    "<!-- newline start -->",
    "newline 1",
    "newline 2",
    "newline 3",
    "<!-- newline end -->"
]
const startFlag = "<!-- feed start -->"
const endFlag = "<!-- feed end -->"

describe('insertLines', () => {
    test('both start and end', () => {
        const lines = [
            "line 1",
            "line 2",
            "<!-- feed start -->",
            "<!-- feed end -->",
            "line 3"
        ]
        const want = [
            "line 1",
            "line 2",
            "<!-- newline start -->",
            "newline 1",
            "newline 2",
            "newline 3",
            "<!-- newline end -->",
            "line 3"
        ]
        const got = updateFeed(lines, newLines, startFlag, endFlag)
        expect(got).toStrictEqual(want)
    })

    test('both start and end, has previous feeds', () => {
        const lines = [
            "line 1",
            "line 2",
            "<!-- feed start -->",
            "feed 1",
            "feed 2",
            "feed 3",
            "<!-- feed end -->",
            "line 3"
        ]
        const want = [
            "line 1",
            "line 2",
            "<!-- newline start -->",
            "newline 1",
            "newline 2",
            "newline 3",
            "<!-- newline end -->",
            "line 3"
        ]
        const got = updateFeed(lines, newLines, startFlag, endFlag)
        expect(got).toStrictEqual(want)
    })


    test('only start', () => {
        const lines = [
            "line 1",
            "line 2",
            "<!-- feed start -->",
            "line 3"
        ]
        const want = [
            "line 1",
            "line 2",
            "<!-- newline start -->",
            "newline 1",
            "newline 2",
            "newline 3",
            "<!-- newline end -->",
            "line 3"
        ]
        const got = updateFeed(lines, newLines, startFlag, endFlag)
        expect(got).toStrictEqual(want)
    })

    test('only end', () => {
        const lines = [
            "line 1",
            "line 2",
            "<!-- feed end -->",
            "line 3"
        ]
        const want = [
            "line 1",
            "line 2",
            "<!-- newline start -->",
            "newline 1",
            "newline 2",
            "newline 3",
            "<!-- newline end -->",
            "line 3"
        ]
        const got = updateFeed(lines, newLines, startFlag, endFlag)
        expect(got).toStrictEqual(want)
    })

    test('neither start nor end', () => {
        const lines = [
            "line 1",
            "line 2",
            "line 3"
        ]
        const want = [
            "line 1",
            "line 2",
            "line 3",
            "<!-- newline start -->",
            "newline 1",
            "newline 2",
            "newline 3",
            "<!-- newline end -->"
        ]
        const got = updateFeed(lines, newLines, startFlag, endFlag)
        expect(got).toStrictEqual(want)
    })

    test('start and end are reversed', () => {
        const lines = [
            "line 1",
            "line 2",
            "<!-- feed end -->",
            "<!-- feed start -->",
            "line 3"
        ]
        const want = [
            "line 1",
            "line 2",
            "<!-- newline start -->",
            "newline 1",
            "newline 2",
            "newline 3",
            "<!-- newline end -->",
            "<!-- feed start -->",
            "line 3"
        ]
        const got = updateFeed(lines, newLines, startFlag, endFlag)
        expect(got).toStrictEqual(want)
    })
})
