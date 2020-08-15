# Actions Doc Feed

Add latest entries from RSS feed to your document.

# Usage

First, add flag comments to anywhere you want in your document:

```markdown
### Latest Posts
<!-- feed start -->
<!-- feed end -->
```

Then add following steps to your workflow:

```yaml
steps:
  - uses: actions/checkout@v2
  - uses: sarisia/actions-doc-feed@v1
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

The result looks like:

### Latest Posts
<!-- usage start -->
- Aug 10 - [fish スクリプトのデバッグ](https://note.sarisia.cc/entry/debugging-fish-script/)
- Aug 08 - [Arch Linux Install Battle](https://note.sarisia.cc/entry/arch-linux-install-battle/)
- Aug 05 - [Linuxbrew で emscripten を導入する](https://note.sarisia.cc/entry/linuxbrew-emscripten/)
- Jul 29 - [UWP アプリは localhost へ接続できない](https://note.sarisia.cc/entry/uwp-localhost/)
- Jul 22 - [Linuxbrew で入れた Go でビルドしたバイナリは可搬性が無い](https://note.sarisia.cc/entry/linuxbrew-go/)
<!-- usage end -->

# Inputs

| Key | Required | Value | Default | Description |
| :-: | :-: | :-: | - | - |
| `url` | Yes | String | | URL of RSS feed (XML) |
| `file` | Yes | String | | Path to document file to process.<br>Can be relative path from repository root, or absolute path of Actions Runner. |
| `max_entry` | | Number | `5` | Number of feed entries to show |
| `format` | | String | `- ${monthshort} ${02day} - [${title}](${url})` | Feed entry format string.<br>See [Formatting](#formatting) for details. |
| `start_flag` | | String | `<!-- feed start -->` | Flag string to declare start of feed block |
| `end_flag` | | String | `<!-- feed end -->` | Flag string to declare end of feed block |

# Formatting

Example uses following RSS feed item:

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
| `year` | `2020` | **UTC** |
| `month` | `8` | **UTC** |
| `monthshort` | `Aug` | **UTC** |
| `monthlong` | `August` | **UTC** |
| `day` | `5` | **UTC** |
| `date` | `8/5/2020, 12:00:00 AM` | **UTC** |

For details, see [`src/format.ts`](src/format.ts)

## Padding

You can padding variables with zeros or spaces.

| Format | Output | Description |
| :-: | :-: | - |
| `${2day}` | ` 5` | Pads to length 2 with spaces |
| `${05month}` | `00008` | Pads to length 5 with zeros |

# Examples

## Qiita

Not only Qiita, you can use any RSS feeds that [`rss-parser`](https://github.com/rbren/rss-parser) supports.

```yaml
- uses: sarisia/actions-doc-feed@v1
  with:
    url: 'https://qiita.com/sarisia/feed'
    file: 'README.md'
```

<!-- qiitaex start -->
- Jul 07 - [ローカルでも CI でも使える卒論ビルド環境](https://qiita.com/sarisia/items/bd306a064a8a5c2ab843)
- Jun 21 - [Go Module Mirror から壊れたパッケージが落ちてくる](https://qiita.com/sarisia/items/6a0c2fdb7fa8a253b0de)
- Jun 06 - [WSL2 Docker が PC のディスクを圧迫する](https://qiita.com/sarisia/items/5c53c078ab30eb26bc3b)
<!-- qiitaex end -->

## Multiple feeds

Make sure to change `start_flag` and `end_flag` for each feed.

```yaml
- name: blog
  uses: sarisia/actions-doc-feed@v1
  with:
    url: 'https://note.sarisia.cc/index.xml'
    file: 'README.md'
    start_flag: "<!-- blog start -->"
    end_flag: "<!-- blog end -->"
- name: qiita
  uses: sarisia/actions-doc-feed@v1
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
