---
title: Hibernate ValidatorはTomcat6だと動かない
excerpt: 'Tomcatのバージョンを急にさげることになったらドハマリしたときの供養'
coverImage:
  url: '/assets/blog/keyboard.jpg'
  provider: 'Ken Suarez'
  providerUrl: https://unsplash.com/@kensuarez
date: '2014-10-14'
ogImage:
  url: '/assets/blog/keyboard.jpg'
---

Java な Web アプリで入力チェックを実装する上でとても便利な[Hibernate Validator](http://hibernate.org/validator/)。
その名の通り、一連の Validation を annotation ベースで実装できる。元の仕様は`JSR 303`と呼ばれるもので、Spring MVC では 3.x 系から取り込まれたらしく、annotation-driven なコードが書ける。

だけど、Tomcat6 だとチョットだけ問題があった。

<span class="more"></span>

### Hibernate Validator?

`JSR 303`で定義されている annotation ベースの validation に[独自の拡張](http://docs.jboss.org/hibernate/validator/4.3/reference/en-US/html_single/#table-custom-constraints)
を与えたもの。Web アプリでの入力チェックあるあるをほぼ網羅しているので、よく使われる形式のデータは annotation を記述するだけで入力チェックとして機能する。

Maven プロジェクトなら、pom.xml に追加すればよい（現時点での最新は 5.x 系）。って、[ここ](http://hibernate.org/validator/downloads/)に書いてる。

```xml
<dependency>
    <groupId>org.hibernate</groupId>
    <artifactId>hibernate-validator</artifactId>
    <version>5.1.2.Final</version>
</dependency>
```

#### 実装例

```javascript
/**
 * Human.java
 */
public class Human {

  // 必須入力！
  @NotNull
  private String name;

  public String getName(){
    return this.name;
  }

  public void setName(String name){
    this.name = name;
  }

}
```

```javascript
/**
 * RootController.java
 */
@RequestMapping("/")
@Controller
public class RootController {

    /**
     * app rootへのアクセス
     */
    @RequestMapping(method = RequestMethod.GET)
    public String index(
        @Valid @ModelAttribute Human human,
        BindingResult bindingResult
        ) {

        if(bindingResult.hasErrors()){
          // 入力チェックエラーの処理
        }

        return "index";
    }
}

```

`@Valid Human`annotation で`@NotNull`のチェックを実行させ、その結果を`BindeingResult`が保持（参照？）している。

複数の制約で一つの入力チェックとしたい場合は独自で annotation を実装する。これについてはこの[エントリ](http://yamkazu.hatenablog.com/entry/20110206/1296985545)が
非常にわかりやすくてためになった。ちなみに、validation のエラー時のメッセージは propety ファイルで管理されているので、メッセージの日本語化に関しても、上記のエントリがすごく役立った。ありがとうござます。

### 本題

で、だ。悲しい事件が起きたのはサーバにデプロイしたときである。なんか見覚えのないエラーが吐かれた。

```
NoSuchMethodError: javax.el.ExpressionFactory.newInstance()Ljavax/el/ExpressionFactory)
```

ググる。[あった。](http://hibernate.org/validator/faq/#does-hibernate-validator-5-x-work-with-tomcat-6)

> Hibernate Validator 5 requires the Unified Expression Language (EL) in version 2.2 or later.
> While Tomcat 7 provides EL 2.2 out of the box, Tomcat 6 only comes with an EL 2.1 implementation which does not work with Hibernate Validator.

`$CATALINE_HOME/lib`の EL が 2.2 と 2.1 の間で互換性がないせいで、5.x 系は tomcat6 そのままだと動かないんだー。

> You can therefore either upgrade to Tomcat 7 or update the EL libs in your Tomcat 6 installation.
> To do the latter, replace the JAR files el-api.jar and and jasper-el.jar in $CATALINE_HOME/lib with an EL 2.2 implementation, e.g. from Tomcat 7.

Tomcat7 の lib から 2.2 を持ってきて上書きすればいいよ、と添えられています。

僕の環境では jar に対してシンボリックリンクが貼られていたので、上書きではなくリンク先をすげ替えることで無事動作しました。

### おまけ

そもそも EL(el-api.jar)ってなに？

[JSR 341](https://jcp.org/en/jsr/detail?id=341)で 3.0 について説明されていました。

上の例だと、`Human.class`のインスタンス`human`のプロパティに対して、通常の java コードではアクセサメソッドを経由しなければならない。
一方 JSTL を呼び込んでいる JSP などでは`human.name`で取得できる。この辺を旨いことやってくれているものが EL(Unified Expression Language)らしい。
CDI にも関わるとか。詳細はわかりません。

---
