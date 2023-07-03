---
title: ファインディで働いた半年間のデータ
excerpt: 'ファインディ株式会社でフロントエンドを半年間やったらどれくらいのパフォーマンスが出たかを計測しました'
coverImage:
  url: '/assets/blog/stack-stones.jpg'
  provider: 'Kentaro Komada'
  providerUrl: https://unsplash.com/@kenta_k
date: '2023-07-04'
ogImage:
  url: '/assets/blog/stack-stones.jpg'
---

Findy で働きはじめてから早いもので半年が経ちました。
[入社エントリ](/posts/findy-one-month)でも書いた通り、**プレイヤーとしての自分に挑戦したい** と転職を決意し、いちエンジニアとしてコードを書くことにフルコミットさせてもらっています。

開発に関わっている[Findy Team+](https://findy-team.io/)は、エンジニアのパフォーマンスを集計・可視化して、チームや個人の改善をサポートするツールです。
これらの一部は GitHub や GitLab などでも表示できますが、プロダクト開発の視点からこれらを提供するという点では、[Findy Team+](https://findy-team.io/)がいまのところもっとも優位なツールだと自負しています。

そこで今回も例に漏れず、この[Findy Team+](https://findy-team.io/)をベースに振り返っていこうと思います。

---

## 数値で振り返る

#### コーディング関連

- **プルリクエスト: 471 件**
- **マージ済みプルリクエスト：462 件**
- **コミット数：1,820 件**
- **平均変更行数：385.9 行**
- **平均変更ファイル数：8.3 件**

```
💡 振り返り

半年間で作成した 471 件の PR のうち 462 件がマージされました。作成した PR の 98.09% がマージされたことになります。

PRあたりの平均コミット数は 1820/471 で3.86 commits/PRとなりました。
PRの粒度をできるだけ小さくしたいので、「実装とテストとリファクタ」の 3 commitsくらいが理想的かなぁと思いつつ、まぁまぁ現実的な数字に落ち着いたかなと思います。

変更行数はやや多めですが、自動生成しているコードが相当量含まれていることも要因の一つ可と思います。
特に大々的なリファクタのプロジェクト（※1）に参加したことで、自動生成コードはかなりの比率が加わっています。
```

### プルリクエストのコミュニケーション

- **オープンからマージまでの平均時間： 2.5 h**
- **自分がレビューしたプルリク数：450 件**
- **レビュー数(※2)：635 件**
- **プルリクに対する自分のコメント数：856 件**

```
💡 振り返り

自分のポリシーでもあるのですが、自分が立てたプルリクエストは誰が読んでもスッと読めるようなインラインコメントをいれています。
図形問題に補助線を入れるような気持ちで、コメントひとつで読みやすさをもたせるのがプルリクエストを書く側のたしなみとさえ思っています。

故に自分のコメント数は他者へのコメント数よりもかなり多くなりました。

また後にも分析を示しますが、読みやすいプルリクエストは 「オープンからマージまでの時間」が短い時間で安定するという効果が得られていると思います。
```

### その他

- **コーディング延べ日数：119 日**

```
💡 振り返り

コードを書いていない日がない。これがどれだけ嬉しいことか。と思います。

文頭に記載の通り、「自分自身がフルでプレイヤーとして活動したときの限界に挑戦したい」という気持ちから転職を決意したため、このフルプレイヤー環境が与えられているということにまずは満足感が高くあります。

プルリクエストが471件でこれを119日で行ったので、3.96 PR/dayがこの半年間の平均PR作成数ということになりました。
これはオンボーディング期間やgood first issueを実施していた期間もふくめての数値(※3)なので、自分としては大いに満足できる結果です。
```

- ※1：リファクタの詳しい話は[こちらの記事](https://note.com/hamchance/n/n4a074eb0193c)にありますので、これを読み終えたら読んでください。後でね。
- ※2：1 つの PR に複数回コメントした場合はレビュー数はそのコメント数分カウントされます
- ※3：ちなみに完全に開発環境に慣れきった 4 月〜6 月では 259 件/60 日であり、**4.31 PR/day**となっています。

---

## グラフで振り返る

つぎに、[Findy Team+](https://findy-team.io/)でグラフ化したパフォーマンスを見ていきたいと思います。

### プルリクエスト作成数とマージまでの時間

まずはプルリクエストの作成数とマージまでの時間の[移動平均推移](https://www.stat.go.jp/naruhodo/10_tokucho/sonota.html#:~:text=%E7%A7%BB%E5%8B%95%E5%B9%B3%E5%9D%87%EF%BC%88%E5%8D%98%E7%B4%94%E7%A7%BB%E5%8B%95%E5%B9%B3%E5%9D%87,%E7%A7%BB%E5%8B%95%E5%B9%B3%E5%9D%87%E3%81%AA%E3%81%A9%E3%81%8C%E3%81%82%E3%82%8A%E3%81%BE%E3%81%99%E3%80%82)で表示したグラフです。
水色のバーが PR 作成数の移動平均推移、濃い青の線がオープンからマージまでの時間（h）の移動平均です。

![PR and merge lead time](/assets/blog/202306-PR.png)

```
💡 振り返り

Team+を使ってみないとなんとも感覚的に捉えにくいかもしれませんが、これだけ日毎の変化が小さく、見た目につまらないグラフはなかなか出てこないようです。
裏を返せば、開発対象やフェーズ、個人の状況が変わっても常にPR数とマージまでの時間が淡々と変わらずに仕事ができていると言えます。
```

### コミット数とマージまでの時間

先程のグラフのプルリクエスト作成数をコミット数に置き換えてみました。PR 数の遷移とコミット数の遷移を見比べることで、「PR の作り方」や「PR の分割度」が変わったかどうかを確認できるかと思ったからです。
というのも 3〜4 月ころから PR の粒度をもう１段細かくして（つまり 1PR のコミットを少なくして）みよう、と思って作業をするようにしてみたので、それがグラフに現れるかどうかを見てみたいと思いました。

![commits and merge lead time](/assets/blog/202306-commits.png)

```
💡 振り返り

コミット数とPR数の遷移はほぼ同等の傾向となっており、「PRの作り方」にそれほど大きな変化はなかったように見えます。

むしろ後半2ヶ月くらいがなんとなくPR数に対してコミット数が多いようにも見えます。
これは開発対象がリファクタから新機能開発にシフトした時期に重なるので、PRの粒度が技術的な切れ目よりも機能的な切れ目にウエイトを移動しているからのように思います。
```

### PR 数の実数

ここまでは移動平均線で見てきましたが、じゃあ実際は PR 数がどれくらいであったのか？をグラフ化したのがこれです。

![PR real number](/assets/blog/202306-pr-number.png)

そしてこれを高さではなく色で表し、二次元的に表現したものが GitHub の草グラフです。

![contribute](/assets/blog/202306-contrib.png)

_GitHub は実際にはイシュー作成なども含まれるので正確に一致はしません_

```
💡 振り返り

バラツキは日によってあるものの、「多い日：いつも通り：少ない日」がだいたい「2:6:2」になっているように見えます。
いわゆるバイオリズム的なものでしょうか、[262の法則](https://mba.globis.ac.jp/about_mba/glossary/detail-20908.html)がPR作成数にもあるのかもしれません。

ゴールデンウィークはちゃんと休みをとってリフレッシュしていました。とてもよかったです。
```

---

## まとめ

- 良い意味でも悪い意味でもサプライズのない開発パフォーマンスが発揮できたように思います。
- 高いパフォーマンスを安定的に出力する点が自分の特徴だというのがわかりました。
  - これについてはさらに働き方や関わり方などの内省をしています。
  - 安定がいいことなのか、成長していないと捉えるべきなのかはまだ迷っています。
- なんやかんやと半年間、すっかり馴染んで元気に開発しているので、これからはもっと（いい意味で）暴れていくのもいいかも。