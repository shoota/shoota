---
title: Hexoにした
excerpt: 'Hexoにブログシステムを以降したときのログ'
coverImage:
  url: '/assets/blog/preview/cover.jpg'
date: '2018-01-24'
ogImage:
  url: '/assets/blog/keyboard.jpg'
---

あまり気に入ってはないが、あまりにも放置状態で blog 環境が死んでいたのでさっと移行できそうな Hexo に移行した

### 気に入ってないポイント

- template が ejs
- theme に jQuery が使われてたりする
- 割りとメジャー

### 楽だったポイント

- gh-page への[deploy plugin](https://github.com/hexojs/hexo-deployer-git)がある
- RSS も実装できる(atom.xml)
- wintersmith と同じ Markdown フォーマット
  - 過去記事がコピペで済む
- CNAME

日本語フォントが割りときれいなのは良いと思った。

### TODO

- customize theme
  - code (syntax highlight)
  - color
- 3rd party
  - google analytics
  - SNS link

#### markdown sample

normal text
**bold**
_italic_
`code`

```javascirpt
const message = "hello hexo"
console.log(message)
```
