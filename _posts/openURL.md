---
title: iOSのopenURLでハマった
excerpt: 'iOSアプリ、仕様の解釈がむずい。二度と作らねえ。'
coverImage:
  url: '/assets/blog/keyboard.jpg'
  provider: 'Ken Suarez'
  providerUrl: https://unsplash.com/@kensuarez
date: '2015-03-23'
ogImage:
  url: '/assets/blog/keyboard.jpg'
---

iOS アプリから電話発信をしたい場合に openURL で標準アプリ（Phone.app）を呼び出すことができる。
それでウキウキと開発していたら発信できない番号に出会い、泥沼にハマったのでメモ。

<span class="more"></span>

### openURL について

電話にかぎらず、iOS では URL オブジェクトを開くことでアプリからアプリを呼び出す事ができる。ただし、これは見かけ上の話で、実際には間に URL を解決する
ナニカが iOS 上で働いているようなので、Android でいうインテントとはちょっと趣向の違う仕組みだ。
あくまでも URL を開く処理をアプリで実行すると、該当の URL スキーマを持っているアプリが起動するということで、アプリ自体を指定して起動しているわけではない。

例えば`http://`なら Safari、`tel://`なら Phone.app がそのスキーマに対応しているので、iOS から URL を受け取って動作する。
電話の場合は下のように URL を開くことで電話発信が開始する。

```objectivec
    NSString *url_string = [@"tel:" stringByAppendingString: @"117"]; //時報にかける
    NSURL URL = [NSURL URLWithString:url_string];
    [[UIApplication sharedApplication] openURL:URL];    // tel:のURLスキーマに対応する電話アプリが起動
```

実際にこれで発信自体うまくいくので、大したことはないと思っていたのだが、実際、めちゃくちゃハマった。

### 1. URL スキーマが曖昧(基礎理解編)

まず、電話アプリの URL スキーマがいろいろあって戸惑う。
調べていると、電話発信の URL スキーマは`tel:`、`tel://`、`telprompt://`があり、`tel:`、`tel://`は大別が無く、どっちも同じ挙動となるらしい。
`telprompt://`は発信をするのではなく、確認ダイアログを表示し、発信ダイヤルを入力した状態で電話アプリを起動させるスキーマで、iOS の公式リファレンスにはないということだ。
リファレンスに載っていないとなると、正常に動作しようと、審査を通過できようと、どうにも使たくない。

### 2. 電話番号の仕様がよくわからない（困惑編）

電話番号は一般的には 090-XXXX-XXXX など、数字の羅列なのだが、普段使わないそれ以外の文字もある。`*`や`#`だ。

そして、`*`や`#`を上の`[[UIApplication sharedApplication] openURL:URL]`で開くと電話アプリが開いてくれない。
（正式にはアスタリスクや井桁じゃなために）そもそも`*/#`が発信する文字列として間違っているのか??

しかし iOS の連絡先アプリ（Contact.app）や UIKeyBoardTypePhonePad などを見てみると、それぞれの文字列が電話番号の入力文字として間違っていないことが確認できた。

余談だが、電話で「＊」を押すボタンは「アスタリスク」ではなく、[「＊」を 90˚ 回転させた記号](http://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Sextile-symbol.svg/50px-Sextile-symbol.svg.png)だ。
そして「#」の名称は「シャープ」ではなく、日本名は「井げた（いげた）」などという。井げたの記号は「#」ではなく「＃」である（もう見た目違いがわからない）。

僕の iPhone では【しゃーぷ】の変換候補に「＃（井桁）」が出てくるし、【いげた】の変換候補に「#（シャープ）」が出てくるし、[「＊」を 90˚ 回転させたアレ](http://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Sextile-symbol.svg/50px-Sextile-symbol.svg.png)は
Unicode5.1 で採用された特殊文字で普通は使われていないらしい。はー、紛らわしい。

### 3. ポーズすると発信できる（混乱編）

`*`や`#`以外にも電話番号には数字以外の文字が存在する。国際番号を示す`+`や、ダイヤルの発信を一時停止する`,`である。
ちなみに、`,`は[ポーズ信号]と呼ばれ、iOS の場合は次の番号の発信まで、発信が 3 秒間スリープする。
そして`*`や`#`はこのポーズ信号の後だとちゃんと電話アプリに渡り、電話発信が始まるのである。

oh...意味がわからない。

### 4. 公式リファレンスの説明が曖昧（解決編）

`*`や`#`が含まれていると電話発信できなかったので、iOS のリファレンスをちゃんと読んでみよう。
[Phone Links](https://developer.apple.com/library/ios/featuredarticles/iPhoneURLScheme_Reference/PhoneLinks/PhoneLinks.html)

> To prevent users from maliciously redirecting phone calls or changing the behavior of a phone or account, the Phone app supports most, but not all, of the special characters in the tel scheme. Specifically, if a URL contains the \* or # characters, the Phone app does not attempt to dial the corresponding phone number. If your app receives URL strings from the user or an unknown source, you should also make sure that any special characters that might not be appropriate in a URL are escaped properly. For native apps, use the stringByAddingPercentEscapesUsingEncoding: method of NSString to escape characters, which returns a properly escaped version of your original string.

さっと読んだ感じだと、URL なんだから特殊文字は`stringByAddingPercentEscapesUsingEncoding:`でエスケープしてって書いている。
実際、多くの方がそう解釈しているのを StackOverflow などでみたし、僕自身、「Escape すればいいんだ！」って嬉々としてコードを書いた。
ところが`*`や`#`が含まれているとやはり発信できない。Escape につかっている Encode 用の文字コードが悪いのかとか、いろいろ試行してみるも、ダメ。

そこで調べなおしてみると、どうやら上のリファレンスは説明がかなりひどい。

- 電話の URL スキーマ`tel:`については、`*`や`#`が含まれていたら URL 開かない仕様ですよ。

> To prevent users from maliciously redirecting phone calls or changing the behavior of a phone or account, the Phone app supports most, but not all, of the special characters in the tel scheme. Specifically, if a URL contains the \* or # characters, the Phone app does not attempt to dial the corresponding phone number.

- （一般の）URL スキーマを使う場合に特殊文字があるのであれば、URL エスケープしてね

> If your app receives URL strings from the user or an unknown source, you should also make sure that any special characters that might not be appropriate in a URL are escaped properly. For native apps, use the stringByAddingPercentEscapesUsingEncoding: method of NSString to escape characters, which returns a properly escaped version of your original string.

ってことらしい（英語圏の方が勘違いしていたくらいなので、英語力の問題ではないと信じたい）。

### 結論

`*`や`#`が含まれる`tel:`はどうやっても開かない。ちなみに URL が開けるかどうかを判定する`[[UIApplication sharedApplication] canOpenURL:(NSURL *)]`という
メソッドがありますが、こいつはふつーに`YES`を返すので、チェックとして機能しない。開かないのに。

---
