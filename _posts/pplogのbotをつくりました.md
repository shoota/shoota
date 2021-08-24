---
title: pplogのbotをつくりました
excerpt: 'pplogすきよ'
coverImage:
  url: '/assets/blog/preview/cover.jpg'
date: '2014-02-14'
ogImage:
  url: '/assets/blog/keyboard.jpg'
---

[pplog](https://www.pplog.net)が楽しすぎて、最近は twitter より見てる時間が長い。愛が高まりすぎるとなにか作ってみたくなるのがプログラマの性というもの。
というわけで、そんな今もっともホットなインターネット、pplog 用 bot を node.js でつくった。

<span class="more"></span>

### コンセプト的な話

pplog の 3 大「できない」を守った bot にしなければならない。
愛着のあるサービスの根幹を技術でつぶすことは許されないからだ。

#### 「つながれない」

統計、その他のポエムへのリンクを入れるなどはよくない。poem analytics とか考えたけど没にした。

#### 「残せない」

スクレイピングして保存するようなシステムはいけない。どんなポエムが流行っているか、ポエムを形態素解析するってのを考えたけど、没にした。

#### 「しゃべれない」

連投して足あとを稼ぐような結果になるとつまらない。むしろ読んだ人のタメになったり、感心してもらえるようなことがいい。

しばらくの間、色々なポエム生成機、すなわちポエみエンジンを考え続けた結果、辞書的なものをランダムに投稿するものがいいんじゃないか、と思い至った。
淡々と投稿を続ける bot のイメージと、辞書の無機質な文調がマッチする。辞書のジャンルを絞ってあげれば bot の特徴も出しやすい。

ポエみのあるジャンル、もう寿司しか思いつかなかった。実際、寿司に関するポエムは非常に多い。寿司が嫌いなひとにも出会ったことがないし、実際、自分が寿司がすきで
寿司がすきでどうしようもない。寿司というものはかなり奥が深く、基本動作が作り終えた後に、機能拡張もしやすい。

ということで、寿司ロボットを作ることにしました。

### 開発する

ソースにアカウント情報とかいろいろ含まれているので、リポジトリは Bitbucket のプライベート Git を使った。寿司ネタ情報を保存するデータストアとして MongoDB を使い、
取得した寿司ネタをもとにゴニョゴニョしてポエムを生成する。そして pplog に投稿するためにメール送信をする。

package.json でもさらしておこう。

```javascript
{
  "name": "sushi_poem",
  "version": "0.0.0",
  "description": "sushi poem bot",
  "main": "sushi.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": "",
  "keywords": [
    "pplog"
  ],
  "author": "shoota",
  "license": "MIT",
  "dependencies": {
    "mongoose": "~3.8.7",
    "nodemailer": "~0.6.0",
    "request": "~2.33.0",
    "cheerio": "~0.13.1"
  }
}
```

`npm init` で無意識に MIT ライセンスにしてるのはご愛嬌。

### bot 起動

<div class="lg-img">![gists_capture](/img/sushi_pedia.png)</div>

どう複雑にしようとメール一個送るだけなのでバッチとして作った。今のところ 6 時間おきに cron が起動して pplog にポエムメールを送る。

###　 issue

- ポエムの内容をもうちょっと厚く、パターンを増やす
- twitter アイコンも同時に変更し、投稿した寿司ネタのイラストが表示されるようにしたい。ただし寿司画像が足りない。
- どんな寿司ネタが登録されているか一覧する Web ページをつくり~~たい。~~ ました。 [おしながき](http://anaguma.org/sushi)

というわけで、どうぞご一読ください。
[@sushi_pedia](https://www.pplog.net/u/sushi_pedia)

---
