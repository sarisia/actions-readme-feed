# Actions Readme Feed

Display and auto-update RSS feed in your [GitHub Profile README](https://docs.github.com/en/github/setting-up-and-managing-your-github-profile/managing-your-profile-readme)

![image](https://user-images.githubusercontent.com/33576079/111362737-8191c400-86d2-11eb-9647-f29273d871b8.png)

> :warning: If you're reading this document in Marketplace page,
> please refer to the [latest document here](https://github.com/sarisia/actions-readme-feed).

- [Usage](#usage)
- [Inputs](#inputs)
- [Outputs](#outputs)
- [Examples](#examples)
- [Remarks](#remarks)

# Usage

First, add flag comments to where you want in your document:

```markdown
### Latest Posts
<!-- feed start -->
<!-- feed end -->
```

Then add following steps to your workflow:

```yaml
steps:
  - uses: actions/checkout@v2
  - uses: sarisia/actions-readme-feed@v1
    with:
      url: 'https://note.sarisia.cc/index.xml'
      file: 'README.md'
  - uses: sarisia/actions-commit@master
```

<details>
<summary>Or commit manually...</summary>
  
```yaml
steps:
  - uses: actions/checkout@v2
  - uses: sarisia/actions-readme-feed@v1
    with:
      url: 'https://note.sarisia.cc/index.xml'
      file: 'README.md'
  - run: |
      git config --global user.name "${{ github.actor }}"
      git config --global user.email "${{ github.actor }}@users.noreply.github.com"
      git add .
      git commit -m "docs: update feed" || true
      git push
```

</details>

The result looks like:

### Latest Posts
<!-- usage start -->
- Aug 21 - [C.UTF-8 とは何だったのか](https://note.sarisia.cc/entry/what-is-c-utf8/)
- Aug 17 - [RSS フィードを GitHub プロフィールに表示する](https://note.sarisia.cc/entry/actions-readme-feed/)
- Aug 10 - [fish スクリプトのデバッグ](https://note.sarisia.cc/entry/debugging-fish-script/)
- Aug 08 - [Arch Linux Install Battle](https://note.sarisia.cc/entry/arch-linux-install-battle/)
- Aug 05 - [Linuxbrew で emscripten を導入する](https://note.sarisia.cc/entry/linuxbrew-emscripten/)
<!-- usage end -->

# Inputs

| Key | Required | Value | Default | Description |
| :-: | :-: | :-: | - | - |
| `url` | Yes | String | | URL of RSS feed (XML) |
| `file` | Yes | String | | Path to document file to process.<br>Can be relative path from repository root, or absolute path of Actions Runner. |
| `sort` | | Boolean | `true` | Sort feed entries by date in decending order. |
| `max_entry` | | Number | `5` | Number of feed entries to show |
| `format` | | String | `- ${monthshort} ${02day} - [${title}](${url})` | Feed entry format string.<br>See [Formatting](#formatting) for details. |
| `start_flag` | | String | `<!-- feed start -->` | Flag string to declare start of feed block |
| `end_flag` | | String | `<!-- feed end -->` | Flag string to declare end of feed block |
| `locale` | | String | `en-US` | Locale used to format date<br>**NEEDS ADDITIONAL CONFIGURATION.** See [remarks](#locale-option-needs-additional-operation) |
| `timezone` | | String | `UTC` | Timezone (e.g. `Asia/Tokyo`) used to format date |
| `nowrite` | | Boolean | `false` | Do not write results to the file specified as `file` input |
| `retry` | | Number | `3` | Number of retries for fetching feeds |
| `retry_backoff` | | Number | `5` | Retry backoff (seconds) |
| `ensure_all` | | Boolean | `false` | Ensure that all feeds specified as `url` input are fetched correctly (== does not skip fetch errors) |
| `allow_empty` | | Boolean | `false` | Don't fail action if feed has no items |

# Formatting

Examples below uses following RSS feed item:

```xml
<item>
  <title>Blog Post</title>
  <link>https://blog.example.com/blog-post</link>
  <pubDate>Sat, 05 Aug 2020 00:00:00 +0000</pubDate>
</item>
```

## Variables

| Key | Example | Note |
| :-: | :-: | - |
| `title` | `Blog Post` | |
| `url` | `https://blog.example.com/blog-post` | |
| `year` | `2020` | [`timezone`](#inputs) affects |
| `month` | `8` | [`timezone`](#inputs) affects. |
| `monthshort` | `Aug` | [`timezone`](#inputs) affects. |
| `monthlong` | `August` | [`timezone`](#inputs) affects. |
| `day` | `5` | [`timezone`](#inputs) affects. |
| `date` | `8/5/2020, 12:00:00 AM` | [`timezone`](#inputs) affects. |

For details, see [`src/format.ts`](src/format.ts)

## Padding

You can padding variables with zeros or spaces.

| Format | Output | Description |
| :-: | :-: | - |
| `${2day}` | ` 5` | Pads to length 2 with spaces |
| `${05month}` | `00008` | Pads to length 5 with zeros |

# Outputs

- `changed`: Whether the document is changed while this actions's run. `1` if changed, `0` else.

- `items`: Raw feed entry from [`rssparser`](https://www.npmjs.com/package/rss-parser).
  ```json
  [
    {
      "title":"C.UTF-8 とは何だったのか",
      "link":"https://note.sarisia.cc/entry/what-is-c-utf8/","pubDate":"Fri, 21 Aug 2020 00:00:00 +0000",
      "content":"TL;DR 全ての Linux ディス...",
      "guid":"https://note.sarisia.cc/entry/what-is-c-utf8/",
      "isoDate":"2020-08-21T00:00:00.000Z"
    },
    ...
  ]
  ```

- `newlines`: New lines inserted to the document specified as `file`. Lines are joined
with `\n`.
  ```
  <!-- feed start -->
  - Aug 10 - [fish スクリプトのデバッグ](https://note.sarisia.cc/entry/debugging-fish-script/)
  - Aug 08 - [Arch Linux Install Battle](https://note.sarisia.cc/entry/arch-linux-install-battle/)
  - Aug 05 - [Linuxbrew で emscripten を導入する](https://note.sarisia.cc/entry/linuxbrew-emscripten/)
  - Jul 29 - [UWP アプリは localhost へ接続できない](https://note.sarisia.cc/entry/uwp-localhost/)
  - Jul 22 - [Linuxbrew で入れた Go でビルドしたバイナリは可搬性が無い](https://note.sarisia.cc/entry/linuxbrew-go/)
  <!-- feed end -->
  ```

- `result`: Result document with feed lines inserted. Lines are joined with `\n`
  ```
  # Actions Readme Feed

  Display RSS feed in your [GitHub Profile README](https://docs.github.com/en/github/setting-up-and-managing-your-github-profile/managing-your-profile-readme)
  ...
  ```

# Examples

## Other sources (e.g. Qiita)

Not only Qiita, you can use any RSS feeds which [`rss-parser`](https://github.com/rbren/rss-parser) supports.

```yaml
- uses: sarisia/actions-readme-feed@v1
  with:
    url: 'https://qiita.com/sarisia/feed'
    file: 'README.md'
```

<!-- qiitaex start -->
- Aug 24 - [GitHubプロフィールにブログやQiitaの最新記事を表示する](https://qiita.com/sarisia/items/630d53cee7976e36faa3)
- Jul 07 - [ローカルでも CI でも使える卒論ビルド環境](https://qiita.com/sarisia/items/bd306a064a8a5c2ab843)
- Jun 21 - [Go Module Mirror から壊れたパッケージが落ちてくる](https://qiita.com/sarisia/items/6a0c2fdb7fa8a253b0de)
- Jun 06 - [WSL2 Docker が PC のディスクを圧迫する](https://qiita.com/sarisia/items/5c53c078ab30eb26bc3b)
<!-- qiitaex end -->

## Update GitHub Profile README automatically

Make your workflow with `schedule` trigger.

```yaml
on:
  schedule:
    - cron: '0 */6 * * *'

jobs:
  readme:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: sarisia/actions-readme-feed@v1
        id: feed
        with:
          url: 'https://note.sarisia.cc/index.xml'
          file: 'README.md'
      - if: ${{ steps.feed.outputs.changed == true }}
        uses: sarisia/actions-commit@master
```

## Using `changed` output

`changed` output can be used directly in the `if` conditional.

```yaml
steps:
  - uses: sarisia/actions-readme-feed@v1
    id: feed
    with:
      url: 'https://blog.example.com/feed.xml'
      file: 'README.md'
  - if: ${{ steps.feed.outputs.changed == true }}
    run: echo "changed!"
```

## Multiple feeds (merged)

You can pass multiple URLs to `url` and get results with
all feeds merged & sorted by date!

```yaml
- name: merged feed
  uses: sarisia/actions-readme-feed@v1
  with:
    file: 'README.md'
    url: |
      https://note.sarisia.cc/index.xml
      https://qiita.com/sarisia/feed
      https://zenn.dev/sarisia/feed
```

## Multiple feeds (separated)

Make sure to change `start_flag` and `end_flag` for each feed.

```yaml
- name: blog
  uses: sarisia/actions-readme-feed@v1
  with:
    url: 'https://note.sarisia.cc/index.xml'
    file: 'README.md'
    start_flag: "<!-- blog start -->"
    end_flag: "<!-- blog end -->"
- name: qiita
  uses: sarisia/actions-readme-feed@v1
  with:
    url: 'https://qiita.com/sarisia/feed'
    file: 'README.md'
    start_flag: "<!-- qiita start -->"
    end_flag: "<!-- qiita end -->"
```

```markdown
### Blog
<!-- blog start -->
<!-- blog end -->

### Qiita
<!-- qiita start -->
<!-- qiita end -->
```

## Using Deploy Key or Personal Access Token

[`actions/checkout`](https://github.com/actions/checkout) action can handle this.

For deploy key:

```yaml
- uses: actions/checkout@v2
  with:
    ssh-key: ${{ secrets.DEPLOY_KEY }}
- uses: sarisia/actions-readme-feed@v1
```

For Personal Access Token:

```yaml
- uses: actions/checkout@v2
  with:
    token: ${{ secrets.PAT }}
- uses: sarisia/actions-readme-feed@v1
```

# Remarks

## `locale` option needs additional operation

Setting `locale` option is not working correctly due to the limitation of
Node.js shipped with GitHub Actions runner.

If you want this to work, you need to set up ICU data set manually.

You can use the helper action [`sarisia/setup-icu`](https://github.com/sarisia/setup-icu) to do this:

```yaml
steps:
  - uses: sarisia/setup-icu@v1
  - uses: sarisia/actions-readme-feed@v1
    with:
      url: https://note.sarisia.cc/index.xml
      file: README.md
      locale: 'ja-JP'
```

<details>
<summary>Also you can do this manually...</summary>

```yaml
steps:
  - run: npm install icu4c-data@64l
  - uses: sarisia/actions-readme-feed@v1
    with:
      url: https://note.sarisia.cc/index.xml
      file: README.md
      locale: 'ja-JP'
    env:
      NODE_ICU_DATA: node_modules/icu4c-data
```

</details>
