---
title: プログラマの終わりとアカルイミライ
excerpt: 開発生産性Conference 2025 Report
coverImage:
  url: '/assets/blog/potato.jpg'
  provider: 'Javad Esmaeili'
  providerUrl: https://unsplash.com/ja/@javad_esmaeili
date: '2025-07-13'
ogImage:
  url: '/assets/blog/potato.jpg'
---

## TL;DR

2025年7月3日、4日に行われた[開発生産性Conference 2025](https://dev-productivity-con.findy-code.io/2025) にファインディとして参加してきたのでまとめます。

> 🚨 注意 🚨
> このブログはshoota個人のブログですので、ファインディとしての見解や思想とかならずしも一致するものではありません。
> 記事の内容と、ファインディが提供するサービスや方針、その他の活動については一切関連しません。

---

# 参加までにしてきたこと

今回で3回目となる開発生産性Conference ですが、当日までにいくつかのアクションをしたので、さきにここから振り返りたいと思います。

#### 'Tidy First?' にほれる

最初のKeynoteを飾ってくださったKent Beck 氏の著書、 [Tidy First?](https://www.oreilly.co.jp/books/9784814400911/) が2024年の12月25日に発売されました。
事前に「超良書」との評判から迷わず予約購入、届いてすぐに読み始めました。自分の人生の中でも間違いなく上位に入るほど印象深く、すぐに読了した一冊です。

リファクタリングを主務としている自分の為になることが多く、また普段から感じていたことをうまく言語化されていたので、自分も読んで感じたことを言語化したいと思いました。
そこでファインディのテックブログで[記事](https://tech.findy.co.jp/entry/2025/02/17/070000) を書きました。いろいろと整理するために公開まで少し時間がかかってしまいましたが、書いてよかったです。

記事公開の翌週には ["Tidy First?" 翻訳者陣に聞く！Kent Beck氏の新刊で学ぶ、コード整頓術のススメ](https://findy.connpass.com/event/343790/)のイベントがあり、Ryuzee氏をはじめとした訳者の方々の話も聞けました。
すっかり本書のファンになり、「カンファレンスにいって生のKent氏をみるぞ！！」と心に決めました。

#### 参加直前の準備

4ホール並行でさまざまなセッションが行われることもあり、どのセッションを聴講するかを選ぶだけでもひと苦労でした。どれも興味があるし、タイトルだけじゃわからない魅力があるかも、などと。
またファインディのメンバーは一般の参加申し込みをせず、セッションの登録もしていなかったので、自分がどこに行けばいいか迷いそうでした。
「みんなどこいくのかな？」とか「自分が行く予定のセッションはどれだっけ？」となっていたので、Notionにカンファレンスのタイムテーブルを作って共有するようにしました。

**Notionで予定共有**
![Notion](/assets/blog/dpe-con-2025-notion.jpg)

---

それでは今回のカンファレンスのまとめを書いていきたいと思います。
複数のセッションで話題になっていたものや、個人的に刺さった言葉を選んでいます。

## 指標計測と評価のジレンマ（グッドハートの法則）

開発生産性の（中立的な）評価にはジレンマがありました。

その１つがグッドハートの法則です。開発が健康的であるかを知るために定量・定性にかかわらず指標は計測しなければならないが、これを目標にしてはいけません。また健康状態を測る単一の指標（もしくは指標セット）というものはありませんが、一方で全体評価のために使用する指標の数（変数）が増えることで個々の指標が全体に与える影響がわかりにくくなります。
例えばプルリクエストの数が多いことはよいことですが、多いことが組織が健康であると示すわけではないと考えるべきです。

ソフトウェア開発はそのEffort / Output / Outcome / Impact、

物的生産性（Effort）の量がおおく、サービス（Output）の質がよくても契約（Outcome）や売上（Impact）が必ずしも高くなるわけではありません。逆に売れているプロダクトが物的生産性が高いとは限りません。指標は計測することに意味がありますが、行動原理の主軸を計測値にしはじめたときにその意味を失うということです。

## 開発生産性とはなにか

`開発生産性` のConferenceでありながらその明確な定義はなく、月日を重ねるごとにその解釈や議論が行われてきました。
これまでの `開発生産性` へのアプローチをひもときながら、2025年の議論を俯瞰していこうと思います。

#### Four Keys (2023)

最初の開発生産性カンファレンスである2023の回では、開発者がいかにパフォーマンスを発揮するかに焦点を当てた議論が多くなされていたように思います。
その代表格が `Four Keys` です。DevOps Research and Assessment（DORA）が2019年に発表した研究レポートにより、以下の4つの指標が開発における生産性に重要な因子であることが共有されました。(_[エリート DevOps チームであることを Four Keys プロジェクトで確認する](https://cloud.google.com/blog/ja/products/gcp/using-the-four-keys-to-measure-your-devops-performance) より抜粋_)

1. デプロイの頻度 - 組織による正常な本番環境へのリリースの頻度
2. 変更のリードタイム - commit から本番環境稼働までの所要時間
3. 変更障害率 - デプロイが原因で本番環境で障害が発生する割合（%）
4. サービス復元時間 - 組織が本番環境での障害から回復するのにかかる時間

世はまさに大開発生産性時代に突入し、これらの指標を計測・注視することが求められていました。

Four Keysはソフトウェア開発の状態を表すのに非常に適しており、開発の健康状態を外的な結果つまりはOutputを主体として計測することでその効果を共有できました。反面、ソフトウェアの開発に集中した定量指標であり、開発チームのEffortによりすぎていたため、人間の活動に関してはブラックボックスになってしまっていました。
そのためFour Keysの変化や改善を元に、組織やチーム構成、スタッフエンジニアリングなどの組織論やその手がかりに関する議論が活発化していたように思います。

#### SPACEフレームワーク (2024)

これらをより具体的に測るため、定性指標として台頭してきたのがSPACEフレームワークであったと解釈しています。
『LeanとDevOpsの科学』の著者、Nicole Forsgren氏が [The SPACE of Developer Productivity](https://queue.acm.org/detail.cfm?id=3454124) の中で発表した以下の指標です。

1. Satisfaction and Well-being
2. Performance
3. Activity
4. Communication and Collaboration
5. Efficiency and Flow

注目すべきはFour Keysのような結果指標、定量指標ではなく、プロセスに着目した定性指標が開発チームの健全性を表すと提唱された部分ではないでしょうか。

SPACEの浸透によって特に大きく変わったのが指標の捉え方だったように思います。定量指標ではどうしても外部との比較や絶対評価によって高い / 低いを判断してしまいますが、定性評価では評価対象（母集団）間での比較にあまり意味がないと早い段階で結論付けられていたと思います。

例えば `Communication and Collaboration` をサーベイなどで定量化するとそのチーム内での変動には意味を求めることができます。しかしチームAとチームBでこれらの値を比較して健全性を評価することは難しいでしょう。

この事実をもとにFour Keysなどの定量指標も単純な比較ではなく、条件付けが必要だということが知られてきました。たとえば組織規模や開発しているソフトウェアの特性（業種）などの前提条件が近似した組織やチーム間の比較がより具体的な示唆を得られると考えられます。
開発生産性カンファレンス 2024では、このような「プロセス指標と組織構造」から、より高度な指標（※下記補足）を計測すべきとの声が増えていたと記憶しています。これらの声とともに、「ビルドトラップを避ける」などの物的生産性と価値の関連性についても議論が多くなされるようになっていました。

_高度な指標とは物的生産性から得られる内的数値ではなく、外部からの評価価値（Outcome）を表す指標です_
_Ryuzee氏は「付加価値生産性」、広木大地氏は「開発生産性レベル2」のような言葉で表現しているものを想定しています_

#### AIと開発生産性 (2025)

2024年の終盤からGithub CopilotなどのAIコーディングが開発現場において急速に活発になり、超加速度で進化、半年間が過ぎました。
そしてこの強力な開発ツールは、2024年に追われていた開発プロセスでの人間的な定性指標（SPACE）の計測の外で、AIコーディングという別のプロセスと指標を生みしたと言えます。
誤解すべきでないのは、Four KeysもSPACEも開発組織の健全性指標としての重要度はなんら変わっていないことです。依然としてDevOpsやエンジニアリング組織へのアプローチは重要です。

そこで改めて `開発生産性とはなにか` が問われたのが今回だったと感じました。AIが超加速した物的生産速度がどのような価値を生み、生産性を育むのか、それらをどう解釈するべきかが話題に多かったと思います。

このヒントはt-wada氏のKeynoteからも得られました。

> ・AIはものすごく「足し算指向」
> ・レビュー負荷はどうするか。Behavior ChangeとStructure Changeのレビューコストは異なる。
> ・労力は外注できるが、能力は外注できない
> ・AIから引き出せる性能は、組織の能力にそのまま比例する (原文はmizchi氏)

またRyuzee氏のSessionでもヒントがありました。

> ・チームや組織で、自分たちの「開発生産性」が何を指すのかを定義しなければならない
> ・重要なのは「各チームが、自分たちにとって意味ある生産性を定義し、改善していける」こと

そして当然、Kent Beck氏のKeynoteでも。

> ・プレッシャーを開発のプロセスにもちこむことで改善が改悪になる
> ・10時間の開発プロセスをAIが1時間にすることはすばらしいが、そこにプレッシャーが生まれたときに歪みになる
> ・Productivityは誰のためのものか。CFOが納得する指標を持ち込めば現場は歪む。ではCTOのためか？
> ・Observe later / Encourage awareness / Avoid pressure / Instill purpose

2025年現在の `開発生産性`をひとことであらわすならば、「組織と組織がひきだすAIの総合力を測り、価値最大化のために自己で定義、変更、改善する複数の定量定性指標」と言えそうです。やはり大事なのはチームが会話し、組織をより良い状態に持ち上げるための活動と変化でした。銀の弾丸とおなじく、開発生産性も一義的なくくりは存在しません。

もしかしたら`開発生産性`という概念が、より具体的で個別の概念に分化していく時期が近づいているのかもしれません。

## 開発組織とエンジニアリング組織

「組織の能力」が「AIの能力」であり、「組織の開発生産性」に関与していくということをここまでまとめてきました。
では「組織」とはなにか？も考えるべきだろうという議論もいくつかありました。
この中でもハッと気づきがあった言葉を残しておこうと思います。

#### 無意味な開発生産性の議論から抜け出すための予兆検知とお金とAI

<iframe style="max-width: 100%;" width="560" height="315" class="speakerdeck-iframe" frameborder="0" src="https://speakerdeck.com/player/1a2bf35b2d3d406a94658c0fbdd01f2a" title="無意味な開発生産性の議論から抜け出すための予兆検知とお金とAI" allowfullscreen="true" style="border: 0px; background: padding-box padding-box rgba(0, 0, 0, 0.1); margin: 0px; padding: 0px; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.2) 0px 5px 40px; width: 100%; height: auto; aspect-ratio: 560 / 315;" data-ratio="1.7777777777777777"></iframe>

[Speaker Deck](https://speakerdeck.com/i35_267/wu-yi-wei-nakai-fa-sheng-chan-xing-noyi-lun-karaba-kechu-sutamenoyu-zhao-jian-zhi-toojin-toai)

> ・「とにかく早く」とういう重圧の中、要件定義が不十分なまま開発が進む
> ・重圧から生み出される小手先の指標
> ・エンジニア**だけ**が生産性を求められる重圧 / 後ろの工程ほど、遅さが”みつかりやすい”

いずれも`「重圧」` というキーワードが課題の表現を示していると感じました。Kent 氏のKeynoteでも指標による "Pressure" がグッドハートの法則のトリガーである、といった説明がなされています。
グッドハートの法則の具体例をより日本企業視点、かつ組織スケールで共有してもらえたことはとても勉強になりました。AIが "重圧" となるケースは今後も議論されていきそうです（次項で少し触れます）。

また開発組織を企画の部分からリードタイムとして捉えていく姿勢は素晴らしいなと思います。企画や仕様を練っている時間のパフォーマンスは可視化されにくく、画面デザインのリードタイムもAI活用があっても醜い部分なので、ここは今後の開発トピックのヒントにもなりました。

エンジニア組織の規模がかなり大きいので、指標を計測して詳細な分析や傾向の把握できるのはすごいなと思いました。

#### なぜ「無責任な横軸」がうまくいかないのか

<iframe style="max-width: 100%;" width="560" height="315" class="speakerdeck-iframe" frameborder="0" src="https://speakerdeck.com/player/a39206356e88458689787edc488f995f" title="なぜ「無責任な横軸」がうまくいかないのか 〜 組織の生産性にインパクトを与える振る舞いを考える" allowfullscreen="true" style="border: 0px; background: padding-box padding-box rgba(0, 0, 0, 0.1); margin: 0px; padding: 0px; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.2) 0px 5px 40px; width: 100%; height: auto; aspect-ratio: 560 / 315;" data-ratio="1.7777777777777777"></iframe>

[Speaker Deck](https://speakerdeck.com/ahomu/naze-wu-ze-ren-naheng-zhou-gaumakuikanainoka-zu-zhi-nosheng-chan-xing-niinpakutowoyu-eruzhen-ruwu-iwokao-eru-6ad0a515-e895-4ed1-8740-1088e0d05ae2)

> ・責任のある横軸 / 役割と責任（≒一定の影響力がある）
> ・無責任な横軸 / 重要な関心であるが優先順位が付かない
> ・関係者を"その気"にさせることは難しい

これもこのAI変革期の組織においてのあるあるなのではないかと思いました。
どの組織もAI活用を **"横軸で"** 進めているだろうと思いますが、AIコーディングに全振りしてしまう人、使っているツールでAIが動くようになって初めて触る受け身な人、バランスよく使えている（けど共有したりはしない）人、などなど様々なメンバーがいるでしょう。組織全体が **AIから引き出せる性能は、組織の能力にそのまま比例する** を意識したしくみや文化づくりはまだそれほど進んでいないのではないでしょうか。

上記の DMM.com さんもKINTOテクノロジー さんも組織メンバーが大きいからこそ顕在化した課題だったのだろうと推察しますが、現代の開発組織が `出遅れた理由` として数年後に反省するトピックではないかと感じます。

## AIと労働圧縮、ジェボンズのパラドックス

今回聴講したSessionでたびたび目にしたのが **ジェボンズのパラドックス** [Wikipedia](https://ja.wikipedia.org/wiki/%E3%82%B8%E3%82%A7%E3%83%9C%E3%83%B3%E3%82%BA%E3%81%AE%E3%83%91%E3%83%A9%E3%83%89%E3%83%83%E3%82%AF%E3%82%B9) の話題でした。

> ジェボンズのパラドックス（英語: Jevons paradox）とは、技術の進歩により資源利用の効率性が向上したにもかかわらず、資源の消費量は減らずにむしろ増加してしまうというパラドックス。
> 技術の進歩によって石炭をより効率的に利用することができるようになった結果より広範な産業で石炭が使われるようになった
> 効率性の改善はある特定の利用に必要な資源量を減らす一方で、資源利用コストを下げ新たな資源需要を増やすため、効率性の向上によって得たエネルギー節約分は相殺される。
> ジェボンズのパラドックスは、需要の増加が節約効果よりも大きく、全体として資源利用が増えるときに起こる。

この石炭を工数におきかえたのが現代のプログラミング現場です。AIによってプログラミングに必要な資源（工数）は劇的に効率化されたが、その分の工数が浮くわけではない、といったところでしょうか。
ジェボンズのパラドックスが示すのは、「開発生産性」のなかでも「労働生産性」に着目した変化かなと思います。

広木氏のSessionでは[ジェボンズのパラドックス](https://hirokidaichi.github.io/presentation/prod.html#10)の次に、[ジョブレスリカバリー](https://hirokidaichi.github.io/presentation/prod.html#21)という概念にも触れていました。不景気による雇用減退によって労働者個人の生産性が（ショック療法的に）向上することで、景気回復後に雇用需要がすぐに回復しない（人を取らなくても元通りとなる現象です。
AIエージェントが仕事を奪うのか？といった不安に対して、歴史的にも同様の労働圧縮があったこと、今回もその１つと考えることが重要そうです。

また、t-wada氏のスライドでも歴史をひもとく場面がありました。

<iframe style="max-width: 100%;" width="560" height="315" class="speakerdeck-iframe" frameborder="0" src="https://speakerdeck.com/player/8ea3dd02d66343099e2099f5000880c6?slide=9" title="AI時代のソフトウェア開発を考える（2025/07版） / Agentic Software Engineering Findy 2025-07 Edition" allowfullscreen="true" style="border: 0px; background: padding-box padding-box rgba(0, 0, 0, 0.1); margin: 0px; padding: 0px; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.2) 0px 5px 40px; width: 100%; height: auto; aspect-ratio: 560 / 315;" data-ratio="1.7777777777777777"></iframe>

AIに限らず「一部の人が頭をつかえば、作る過程に高度な技術はいらない（超訳）」といった誤った認識・言説はこれまでも繰り返されてきたというのです。

- 確かにAIは物的生産性と労働生産性を劇的に向上させ、労働圧縮をした
- 近頃の「AI疲れ」の本質は労働圧縮である。単位効率が上がって生まれた余剰は需要が相殺する。
- 物的生産性向上はさらに（元よりも）需要を加速させる。これらは歴史的に繰り返されてきている。
- AI（ツール）が代替できるものとできないものをわけて見よう。均質性よりも多様性に目を向けよう。
- エンジニアの仕事が「AIに取って代わる」は一部で正解、全体では不正解

現時点でのまとめはこれくらいでしょうか。

## プログラミングの終わり

**「明らかに、もう元にはもどらない」**

今回のカンファレンスで最も刺さった言葉がこれでした。t-wada氏がKeynoteでなにげなく放ったひとことです。

去年末から今年のはじめ頃まで、僕はAIコーディングに肯定的ではありませんでした。
GitHub Copilotを使い始めた頃、[ジュニアが使ったらいいんじゃない？](https://shoota.work/posts/cdd)くらいに思っていました。
v0でUIを作ったとき、これでいいのかと不安でした。
Clineにすべてを賭ける流れは、「きっと落とし穴がある」と懐疑的でした。
Devinはエンジニアのおもちゃに収まるだろうと思っていました。

しかし今では、Devinにリファクタリングの作業を進めさせながら、Clineに技術負債の規模を見積もらせています。
ChatGPTに変数の命名を相談し、GitHub Copilotにプルリクエストの説明をしてもらいます。
AIに委託できる仕事、できない仕事を分けて、僕のプルリクエスト数は劇的伸びる期間がうまれて波打つようになりました。

![2025 PR transition](/assets/blog/202507-PR.png)

明らかに、もう元にはもどれません。

### プログラミングは終わったが、エンジニアリングはおわらない

今回の開発生産性カンファレンスは、開発生産性という指標を多くの方々がみていくことでプログラミングとエンジニアリングの境目、変化を共有する場でもありました。
AIが生産性にもたらした影響はプログラミングだけでなく、組織のあり方や、労働、そしてキャリアや生き方にまで及んだのだと思います。

エンジニアリングについて考え、見直す機会となるように、いくつかのセッションの言葉ももういちど反芻して考えるのは楽しいかもしれません。

<div style="display: flex; flex-direction:column; gap: 24px; margin-bottom: 24px;">
  <div style="display: flex; flex-direction:row; gap: 12px">
  <iframe style="max-width: 100%;" width="560" height="315" frameborder="0" src="https://hirokidaichi.github.io/presentation/prod.html#35" allowfullscreen="true" style="border: 0px; background: padding-box padding-box rgba(0, 0, 0, 0.1); margin: 0px; padding: 0px; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.2) 0px 5px 40px; width: 100%; height: auto; aspect-ratio: 560 / 315;" ></iframe>
  <iframe style="max-width: 100%;" width="560" height="315" class="speakerdeck-iframe" frameborder="0" src="https://speakerdeck.com/player/7d644c5a8a0b4a6eb64eaf25cab95f7d?slide=112" title="ペアプロ × 生成AI  現場での実践と課題について / generative-ai-in-pair-programming" allowfullscreen="true" style="border: 0px; background: padding-box padding-box rgba(0, 0, 0, 0.1); margin: 0px; padding: 0px; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.2) 0px 5px 40px; width: 100%; height: auto; aspect-ratio: 560 / 315;" data-ratio="1.7777777777777777"></iframe>
  </div>

  <div style="display: flex; flex-direction:row; gap: 12px">
  <iframe style="max-width: 100%;" width="560" height="315" class="speakerdeck-iframe" frameborder="0" src="https://speakerdeck.com/player/a7272742fa8a4c09a2d90700ba7299d7?slide=15" title="AIエージェントが変える開発組織のEnabling #開発生産性con_findy" allowfullscreen="true" style="border: 0px; background: padding-box padding-box rgba(0, 0, 0, 0.1); margin: 0px; padding: 0px; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.2) 0px 5px 40px; width: 100%; height: auto; aspect-ratio: 560 / 315;" data-ratio="1.7777777777777777"></iframe>

  <iframe style="max-width: 100%;" width="560" height="315" class="speakerdeck-iframe" frameborder="0" src="https://speakerdeck.com/player/1a2bf35b2d3d406a94658c0fbdd01f2a?slide=25" title="無意味な開発生産性の議論から抜け出すための予兆検知とお金とAI" allowfullscreen="true" style="border: 0px; background: padding-box padding-box rgba(0, 0, 0, 0.1); margin: 0px; padding: 0px; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.2) 0px 5px 40px; width: 100%; height: auto; aspect-ratio: 560 / 315;" data-ratio="1.7777777777777777"></iframe>
  </div>
</div>

そして直前まで内容を変更してくださったt-wada氏のセッションも、もういちど、見直して考えたいと思います。

<iframe style="max-width: 100%;" width="1120" height="630" class="speakerdeck-iframe" frameborder="0" src="https://speakerdeck.com/player/8ea3dd02d66343099e2099f5000880c6" title="AI時代のソフトウェア開発を考える（2025/07版） / Agentic Software Engineering Findy 2025-07 Edition" allowfullscreen="true" style="border: 0px; background: padding-box padding-box rgba(0, 0, 0, 0.1); margin: 0px; padding: 0px; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.2) 0px 5px 40px; width: 100%; height: auto; aspect-ratio: 560 / 315;" data-ratio="1.7777777777777777"></iframe>

---

**この記事の参考資料**

- [Tidy First?](https://www.oreilly.co.jp/books/9784814400911/)
- [The 2019 Accelerate State of DevOps: Elite performance, productivity, and scaling](https://cloud.google.com/blog/products/devops-sre/the-2019-accelerate-state-of-devops-elite-performance-productivity-and-scaling?hl=en)
- [エリート DevOps チームであることを Four Keys プロジェクトで確認する](https://cloud.google.com/blog/ja/products/gcp/using-the-four-keys-to-measure-your-devops-performance)
- [開発生産性について議論する前に知っておきたいこと](https://qiita.com/hirokidaichi/items/53f0865398829bdebef1)
- [【資料公開】開発組織の進化・スケーリングと「開発生産性」](https://www.ryuzee.com/contents/blog/14602)
- [ジェボンズのパラドックス](https://ja.wikipedia.org/wiki/%E3%82%B8%E3%82%A7%E3%83%9C%E3%83%B3%E3%82%BA%E3%81%AE%E3%83%91%E3%83%A9%E3%83%89%E3%83%83%E3%82%AF%E3%82%B9)
  (記事内に記載したスライドを除く)

---

ここまでは開発生産性の真面目な（？）内容をまとめてきましたが、カンファレンスの別の面、人との関わりについてもレポートを残しておきます。

# オフラインイベントはやっぱりたのしかった

## Kent Beck 氏のサイン会

とにかく"Tidy First?"が刺さりまくっていたので今回のカンファレンスに参加する重要な、大事な理由の１つが生のKent Beck氏に会えることでした。
当然のようにサイン会にならんでサインと写真撮影をしていただきました。

"Tidy First?" には投資に関する章でじゃがいもが出てくるので、ジョークのつもりでじゃがいもを持っていきました。
"I bought this in yesterday." とジョークを言ったつもりでしたが、あんまり伝わっていなかったぽい。

![shoota-potato-kent](/assets/blog/shoota_kent.jpg)
_青森からじゃがいもを持ち込む金髪中年男性_

Kent氏は非常に気さくで、なぜか緊張せずにお会いできたのでとても幸せでした。サイン本を手にした勢いでそのまま家に帰りそうなくらい嬉しかったです。
なお、DAY1 終了後に「なぜじゃがいもを持ってきたのか？」と仲の良い運営スタッフに聞かれたので必死で説明したりもしました。

![言い訳時間](/assets/blog/potato-reason.jpg)
_じゃがいもの正当性を説明する金髪中年男性_

## ご挨拶させてもらったみなさま

#### t-wada氏

Day2でブースなどの巡回をしているとt-wada氏に偶然、お会いできました。
自分の所属部署名が変わっていたので改めて名刺をお渡ししたところ、「あ！いぬのひとだ！」とアイコンを認識くださっており、感無量でした....。

![shootaとt-wada氏](/assets/blog/shoota_t-wada.jpg)

#### うひょ氏

以前にReact メジャーアップデートのオンラインイベントでご一緒させていただいた uhyo\_氏にもお会いできました。
たびたびご一緒させてもらっていて、フレンドリーにお話してくださる方が社外の会場にいらっしゃるのはとても心強いです。

![shoota-uhyo](/assets/blog/shoota_uhyo.jpg)

他にも様々な方や登壇者のみなさんとコミュニケーションをさせてもらい（写真とるのわすれてました）、いろいろなお話を聞けました。
生の会話でしか得られない栄養をたくさん摂取できてとてもよかったです。また来年もお会いできればと思います。

_あとから気づいたのですが、お話する機会がなかった知り合いの方もたくさんいらしていたみたいです。_
_自分から話しかけるの下手くそなのでどこかでみかけたら話しかけてくれると泣いて喜びます。_

## 会場アクセス form 青森県

僕は青森県に住んでいるので、3日朝の始発の新幹線に飛び乗って向かいました。今回は会場が東京駅直通ということもあり、関東圏外からの参加もしやすかったのではないかと思います。
4日のt-wada氏のKeynoteを聴講してからも帰りの新幹線までだいぶ余裕があったし、JPタワーは全国から人を集める機会には良い場所だと思いました。

ビル内にコンビニや飲食店、喫煙所があり、昼食や急な仕事などがあっても動きやすかったのではないかと思いました。

---

### 最後のつぶやき

今回のカンファレンス終了後に興奮さめやらぬ帰り道、いままで [Kent Beck 氏のサイト](https://kentbeck.com/)を見たことがなかったことに気づいたので新幹線でみていました。
するとエンジニアリング以外のカテゴリーもあり、 「Music」のカテゴリを覗くと、そこには エリック・サティの `"Gymnopedie"`の演奏データが！

実は僕も `"Gymnopedie"` が大好きで、このブログのReactコンポーネントライブラリに [gymnopedies](https://github.com/shoota/gymnopedies) (ギリシャ語スペル)という名前をつけています。
何たる偶然...もはや運命では...？？？と勝手にシンパシーを感じた帰り道でした。
