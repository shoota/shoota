---
title: Cabin.jsでのブログ運用を保留した話
excerpt: 'あああ'
coverImage:
  url: '/assets/blog/keyboard.jpg'
  provider: 'Ken Suarez'
  providerUrl: https://unsplash.com/@kensuarez
date: '2014-03-28'
ogImage:
  url: '/assets/blog/keyboard.jpg'
---

ブログ生成をNode.jsベースのstatic site generator、[Cabin](http://www.cabinjs.com/)に乗換えようとしたが、すぐに移行したいほどでなかった。

<span class="more"></span>

### 発端

このブログは[wintersmith](http://wintersmith.io/)というNode.js製のstatic site generatorを使って、Markdownで書いている。
[記事はこちら](http://blog.anaguma.org/articles/2013-12-02/)


不満というほどではないが、懸念はいくつかある。

* あまり活発に動いていないっぽい
 * 本家の更新がしばらく止まってる
 * プラグインが全然増えてない
* masterにpushしてからgh-pagesにpushするデプロイステップがない
 * werckerを使って自動化しているが、使っているデプロイステップは自前のものじゃない
 * wercker待ちになるときがある
 * werckerを毎回見に行くのが面倒
* Node.jsのうまみをもっと引き出した拡張性が欲しい
 * gh-pagesにpushするならGruntがよさそう
 * Gruntは活発に更新されているし、プラグインもたくさんでている
 * デザインもいろいろ選べるといい


### Cabin.js

Cabinは、"ブログを書く"ことに注力したNode.jsベースのツールで、Octopressのようにgh-pagesデプロイが標準装備されている。
このデプロイはgrant-gh-pagesをつかって、Gruntファイルつきで用意される（後述）。

CIサービスを使ってデプロイするのも当然便利ではあるのだが、Gruntを使うことでpushとデプロイを分離できるメリットがある。
ブログを途中まで書いてpushしておき、別の場所で続きを書き始めるときなどは、push=デプロイじゃないほうが嬉しい。
また、CIサービスは待たされることがあるのも仕方ない。

***

Cabinは新規作成時に対話的にブログコンテンツのひな形をつくれるところも非常によい。
付属するGruntfileがこれを実現しているようだ。
`npm init`のように、何をつくるのか、どういう設定にするかを聞いてくれるので、それに答えるだけで設定が完了する。
ブログのデプロイ先としてgh-pagesを使うようにすると、`grunt deploy`をgh-pages用としてGruntFileを作成してくれる。

また、テンプレートとしてjadeとejsが選べたり、デフォルトでデザインテーマが3つついて来たりする。
CSSもStylusを使ってライブリロードしてくれるので、デザインもストレスなく変更できる。
Disqusも**標準で**実装されているので、本当にすぐにブログが始められる。


### でも移行は保留

非常に便利で素敵で使いやすくて、ブログを最初から作るなら迷わずこれを使っていただろう、とおもう。
だが現状のWintersmithから移行するか、となると話は別であった。

* RubyとPythonが必要
 * Compassのインストールが必要なので、Rubyを動かす必要がある。（ライブリロードはcompass -wで動いているっぽい。）
 * Syntax highlightのために、Pygmentsを使うので、Pythonが必要。Pygmentsは非常に多くの言語をサポートしているので、好きではあるが。
* Stylusの学習コストと用意されているコード理解のコストがそこそこかかる
 * そもそも普段はデザインをしないので、いまのところStylusの学習は優先度を上げたくないし、コストもかけたくない。
 * 用意されているStylusの内容を理解するのも結構大変
* 環境が複数あると面倒
 * すでに複数環境でnpm installするのさえ面倒なくらい（怠惰）
 * ちょっと直したいなと思ってもRuby/gem(Compass)、Python、Node/npmまでやって、やっとのことできたのはHTMLの修正だとちょっと不釣合
 * 今のままでGruntからgh-pagesにpushできるようにした方がスマートな気がする
* これまでのブログがちゃんと表示されるかチェックしいなといけない
 * Markdown基本の記法は一緒だが、generatorが認識するヘッダ部分とかが違う。デザインが違うので、微妙なずれとかもやっぱり出ちゃう。
 * Markdown意外にも、Google Analyticsとかtweetボタンとかもviewテンプレートに移行する必要がある。


それでもまだ、そのうち移行したいとは思っているが、移行コストほど困っているわけでもないので、とりあえず保留とした。
そのうち時間があれば、そしてGruntやStylusがメインストリームとしてもっと発展したら、移行する。かも。


---
