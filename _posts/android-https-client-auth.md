---
title: Java(Android)でHTTPSクライアント認証
excerpt: 'あああ'
coverImage:
  url: '/assets/blog/keyboard.jpg'
  provider: 'Ken Suarez'
  providerUrl: https://unsplash.com/@kensuarez
date: '2014-12-29'
ogImage:
  url: '/assets/blog/keyboard.jpg'
---

日本語で簡潔に説明されているものを探せず苦労したので雑にメモ。検索するとサーバ証明書関連が多くて、Androidアプリをクライアント認証させるのはあまり多い事例じゃないっぽい。

<span class="more"></span>

### そもそもHTTPS認証ってなにかを雑に

証明書によって認証する。認証はドメイン(common name)単位で署名される。
サブドメインはワイルドカード指定可能(googleの場合だと`*.google.com`になってる)。
Androidに関する証明書形式の対応は[nexusのヘルプページ](https://support.google.com/nexus/answer/2844832?hl=ja)が参考になる。


#### HTTPSサーバ認証の雑な説明

  - https通信の信頼性を検証し、クライアントがサーバを信頼するために使用する。
  - クライアントは他者(認証局:CA)の署名を信頼し、その署名をもつサーバを信頼する。
  - 不特定多数のユーザに公開されているサービスで使用する。
  - 形式は`X.509`、拡張子は`.crt`が[一般的](http://httpd.apache.org/docs/2.2/mod/mod_ssl.html#sslcertificatefile)と思われる。
  - CAの署名（とその証明書）がサーバ証明書を証明する。
  - すなわちCA証明書はサーバ証明書の証明書
  - CAの証明書は自己証明書。
  - AndroidにはグローバルなCA証明書が最初から組込まれている。
  - Androidに後入れしたCA証明書はChromeで使用できる。

#### HTTPSクライアント認証の雑な説明

- httpsで認証されたサーバが、特定のクライアントのみを受け付けるために行う認証。
- 認証局が署名した証明書で署名される。通常、クライアント証明書には署名したCA証明書が含まれる。
- インターネット上の特定多数（特定多数がイントラネットでしばれない）ユーザにのみサービスを公開する場合のプロトコルレベルでの認証。
- 形式は`PKCS#12`、拡張子は`.p12`。


### HTTPSクライアント認証：サーバサイド(Apache2.2以上)

crt作成と認証局署名を行い、証明書をサーバに配置して通常のhttps設定の上、クライアント認証設定を追加する。
方法は[mod_sslのドキュメント](http://httpd.apache.org/docs/2.2/mod/mod_ssl.html#sslverifyclient)の通り、`SSLVerifyClient require`を特定ドメインに設定する。

クライアント認証の対象をpathで絞りたい場合は`<Directory>`や`<Location>`を使う。さらにajpでリバースプロキシしている場合は以下のように行う。

``` apache
# default is none.
SSLVerifyClient none
## ajp reverse proxy setting
ProxyPass / ajp://localhost/

# client certification for specific path
<IfModule mod_proxy_ajp.c>
  <Location /secret/>
  SSLVerifyClient require
　</Location>
</IfModule>
```

### HTTPSクライアント認証：Android app(APIレベル8,21で確認)

`org.apache.http.impl.client.DefaultHttpClient`でGET/POSTをするときに以下のメソッドでHttpsスキーマを登録しておく。
クライアント証明書は`/asset`に入れておく前提。

<script src="https://gist.github.com/shoota/7a0d629cb2d1c87dc328.js"></script>


### ついでに

通常のHTTPSサーバ認証については、[JSSECのサンプル](https://www.jssec.org/report/securecoding.html)が参考になる


---
