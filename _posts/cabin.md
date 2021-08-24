---
title: Cabin.jsでのブログ運用を保留した話
excerpt: 'ブログシステムに迷っているときの話'
coverImage:
  url: '/assets/blog/preview/cover.jpg'
date: '2014-03-28'
ogImage:
  url: '/assets/blog/keyboard.jpg'
---

ブログ生成を Node.js ベースの static site generator、[Cabin](http://www.cabinjs.com/)に乗換えようとしたが、すぐに移行したいほどでなかった。

<span class="more"></span>

### 発端

このブログは[wintersmith](http://wintersmith.io/)という Node.js 製の static site generator を使って、Markdown で書いている。
[記事はこちら](http://blog.anaguma.org/articles/2013-12-02/)

不満というほどではないが、懸念はいくつかある。

- あまり活発に動いていないっぽい
- 本家の更新がしばらく止まってる
- プラグインが全然増えてない
- master に push してから gh-pages に push するデプロイステップがない
- wercker を使って自動化しているが、使っているデプロイステップは自前のものじゃない
- wercker 待ちになるときがある
- wercker を毎回見に行くのが面倒
- Node.js のうまみをもっと引き出した拡張性が欲しい
- gh-pages に push するなら Grunt がよさそう
- Grunt は活発に更新されているし、プラグインもたくさんでている
- デザインもいろいろ選べるといい

### Cabin.js

Cabin は、"ブログを書く"ことに注力した Node.js ベースのツールで、Octopress のように gh-pages デプロイが標準装備されている。
このデプロイは grant-gh-pages をつかって、Grunt ファイルつきで用意される（後述）。

CI サービスを使ってデプロイするのも当然便利ではあるのだが、Grunt を使うことで push とデプロイを分離できるメリットがある。
ブログを途中まで書いて push しておき、別の場所で続きを書き始めるときなどは、push=デプロイじゃないほうが嬉しい。
また、CI サービスは待たされることがあるのも仕方ない。

---

Cabin は新規作成時に対話的にブログコンテンツのひな形をつくれるところも非常によい。
付属する Gruntfile がこれを実現しているようだ。
`npm init`のように、何をつくるのか、どういう設定にするかを聞いてくれるので、それに答えるだけで設定が完了する。
ブログのデプロイ先として gh-pages を使うようにすると、`grunt deploy`を gh-pages 用として GruntFile を作成してくれる。

また、テンプレートとして jade と ejs が選べたり、デフォルトでデザインテーマが 3 つついて来たりする。
CSS も Stylus を使ってライブリロードしてくれるので、デザインもストレスなく変更できる。
Disqus も**標準で**実装されているので、本当にすぐにブログが始められる。

### でも移行は保留

非常に便利で素敵で使いやすくて、ブログを最初から作るなら迷わずこれを使っていただろう、とおもう。
だが現状の Wintersmith から移行するか、となると話は別であった。

- Ruby と Python が必要
- Compass のインストールが必要なので、Ruby を動かす必要がある。（ライブリロードは compass -w で動いているっぽい。）
- Syntax highlight のために、Pygments を使うので、Python が必要。Pygments は非常に多くの言語をサポートしているので、好きではあるが。
- Stylus の学習コストと用意されているコード理解のコストがそこそこかかる
- そもそも普段はデザインをしないので、いまのところ Stylus の学習は優先度を上げたくないし、コストもかけたくない。
- 用意されている Stylus の内容を理解するのも結構大変
- 環境が複数あると面倒
- すでに複数環境で npm install するのさえ面倒なくらい（怠惰）
- ちょっと直したいなと思っても Ruby/gem(Compass)、Python、Node/npm までやって、やっとのことできたのは HTML の修正だとちょっと不釣合
- 今のままで Grunt から gh-pages に push できるようにした方がスマートな気がする
- これまでのブログがちゃんと表示されるかチェックしいなといけない
- Markdown 基本の記法は一緒だが、generator が認識するヘッダ部分とかが違う。デザインが違うので、微妙なずれとかもやっぱり出ちゃう。
- Markdown 意外にも、Google Analytics とか tweet ボタンとかも view テンプレートに移行する必要がある。

それでもまだ、そのうち移行したいとは思っているが、移行コストほど困っているわけでもないので、とりあえず保留とした。
そのうち時間があれば、そして Grunt や Stylus がメインストリームとしてもっと発展したら、移行する。かも。

---
