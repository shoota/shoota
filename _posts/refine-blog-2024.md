---
title: ブログをちょっとずつ良くしている
excerpt: '最近よく見てもらえているようなのでブログを直したりしています。'
coverImage:
  url: '/assets/blog/renovation.jpg'
  provider: 'Chris Montgomery'
  providerUrl: https://unsplash.com/ja/@karlsolano
date: '2024-04-07'
ogImage:
  url: '/assets/blog/renovation.jpg'
---

最近よくこのブログをみてもらったり拡散してもらったりする機会が増えてきたので、フロントエンドエンジニアとして雑なブログはちょっとはずかしいなと思い始めた。
ちょいと時間を見つけては少しずつなおしたり拡張したりしていて、結構まなびがあったのでまとめておく。

---

## レスポンシブ対応した

ブログを構築したのは2020年7月なので4年弱くらい前。

当初の目的としては「Next.jsのSSGでいい感じのデザインシステムを使いながらブログを書く」だったので、PCくらいの画面幅で適当に始めて満足していた。
だがブログを書いたらTwitter(現状はXだけどTwitterって表記する)でつぶやいたりしているのでせめてiPhoneサイズくらいではちゃんと表示されるようにしようと思った。

だいたいがFlex boxを当ててまわったり折り返し設定周りをCSSでいじるだけだったが、そこそこ数が多かった。

---

## Markdown解釈の拡張（GFM対応など）

コードブロック（\`\`\`で囲んだ部分）の Syntax Highlightをちゃんとしたいというのがもともとの目的だった。
だが直そうとして調べているうちにいろいろ不便があることに気づいたのでパースロジックをいじった。

[remarkjs](https://github.com/remarkjs)と[rehypejs](https://github.com/rehypejs)のストリームをガチョンとつなげて、markdownパースとhtmlパースの解釈をいい感じなるようにした。拡張できたのは以下。

- GFM サポート: remark-gfm
- 改行をbrタグに変換: remark-breaks
- HTMLをmarkdownに直接書けるように: rehypeRaw
- Syntax Highlight + カラースキーマに導入: rehype-pretty-code

現状のコードは[こんな感じ](https://github.com/shoota/shoota/blob/master/lib/markdownToHtml.ts)になっている。

修正にあたっては[Zennの記事](https://zenn.dev/yoshiishunichi/articles/667120b3d0c9d2#%E6%9C%AC%E5%BD%93%E3%81%AB%E6%B0%97%E6%8C%81%E3%81%A1%E3%81%AE%E3%81%84%E3%81%84-markdown-%E5%A4%89%E6%8F%9B%E5%87%A6%E7%90%86)や[こちらの記事](https://osgsm.io/posts/introducing-rehype-pretty-code)が非常に参考になった。特に `rehype-pretty-code` はカラースキーマライブラリの[shiki](https://shiki.style/)を使えるので、おおよそどんなサイトでも使いやすくなりそうだった。

またコードブロックの行数が長くなってしまう場合にどんな表現がいいのかは、QiitaのCSSを参考にさせてもらった。

GFMサポートで嬉しかったのはTable表現ができるようになったこと。
ここ最近の記事は比較したり数字をまとめるものが多かったので、表を書けるようになって楽になった。

---

## 被リンク（SNS）対策

`og:image`の設定くらいは最低限しとこう、と思っていたが、`og:title`などはかなり適当にしていたので、この辺も改善した。
特にTwitterのOGPは旧来のタグでは動かなくなっていて、Twitterでブログを書いたよ、とポストしてもOGP画像がでなくなっていてとても悲しかった。

OGPの確認は[このサイト](https://ogp.buta3.net/)でやるとわかりやすかった。
ただTwitter用OGPは上に書いた古い仕様のままのようで、このサイトでは表示できていてもTwitterではうまく表示されなかったので、Twitter用のOGPチェックを[このチェッカー](https://cards-dev.twitter.com/validator)を使ってやった。

---

## favicon

4年弱もの間、faviconがテンプレに同梱されているNext.jsのロゴのままだった（気づいてたけど後回しにしていた）ので、これも直した。複数サイズをつくらなきゃいけなくて面倒だったのが放置の原因だったのだけれど、一度の作成してくれるジェネレータをみつけたのでこれで作った。

512pxのpngを作って、[ここ](https://realfavicongenerator.net/)にアップロードして、微調整などしたら 「Favicon package」と書かれたボタンを押すとzipが落ちてくる。うれしい。

---

## その他

ちょっとずつCSSを直したり改善しているとさらに直したいところを見つけたり、エフェクトを入れたくなったりするのでお遊びがてらにチマチマと直したりしていた。普段はtoBシステムのUIによく触れているので、あまり書かないCSSやデザインを作るのは勉強になった。
