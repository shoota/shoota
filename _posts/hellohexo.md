---
title: Hexoにした
excerpt: 'あああ'
coverImage:
  url: '/assets/blog/keyboard.jpg'
  provider: 'Ken Suarez'
  providerUrl: https://unsplash.com/@kensuarez
date: '2018-01-24'
ogImage:
  url: '/assets/blog/keyboard.jpg'

---


あまり気に入ってはないが、あまりにも放置状態でblog環境が死んでいたのでさっと移行できそうなHexoに移行した

### 気に入ってないポイント
- templateがejs
- themeにjQueryが使われてたりする
- 割りとメジャー

### 楽だったポイント
- gh-pageへの[deploy plugin](https://github.com/hexojs/hexo-deployer-git)がある
- RSSも実装できる(atom.xml)
- wintersmithと同じMarkdownフォーマット
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
