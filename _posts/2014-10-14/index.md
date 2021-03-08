---
title: Hibernate ValidatorはTomcat6だと動かない
author: shoota
date: 2014-10-14
template: article.jade
---

JavaなWebアプリで入力チェックを実装する上でとても便利な[Hibernate Validator](http://hibernate.org/validator/)。
その名の通り、一連のValidationをannotationベースで実装できる。元の仕様は`JSR 303`と呼ばれるもので、Spring MVCでは3.x系から取り込まれたらしく、annotation-drivenなコードが書ける。

だけど、Tomcat6だとチョットだけ問題があった。

<span class="more"></span>

### Hibernate Validator?

`JSR 303`で定義されているannotationベースのvalidationに[独自の拡張](http://docs.jboss.org/hibernate/validator/4.3/reference/en-US/html_single/#table-custom-constraints)
を与えたもの。Webアプリでの入力チェックあるあるをほぼ網羅しているので、よく使われる形式のデータはannotationを記述するだけで入力チェックとして機能する。

Mavenプロジェクトなら、pom.xmlに追加すればよい（現時点での最新は5.x系）。って、[ここ](http://hibernate.org/validator/downloads/)に書いてる。

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
`@Valid Human`annotationで`@NotNull`のチェックを実行させ、その結果を`BindeingResult`が保持（参照？）している。

複数の制約で一つの入力チェックとしたい場合は独自でannotationを実装する。これについてはこの[エントリ](http://yamkazu.hatenablog.com/entry/20110206/1296985545)が
非常にわかりやすくてためになった。ちなみに、validationのエラー時のメッセージはpropetyファイルで管理されているので、メッセージの日本語化に関しても、上記のエントリがすごく役立った。ありがとうござます。




### 本題

で、だ。悲しい事件が起きたのはサーバにデプロイしたときである。なんか見覚えのないエラーが吐かれた。

```
NoSuchMethodError: javax.el.ExpressionFactory.newInstance()Ljavax/el/ExpressionFactory)
```

ググる。[あった。](http://hibernate.org/validator/faq/#does-hibernate-validator-5-x-work-with-tomcat-6)

>Hibernate Validator 5 requires the Unified Expression Language (EL) in version 2.2 or later.
>While Tomcat 7 provides EL 2.2 out of the box, Tomcat 6 only comes with an EL 2.1 implementation which does not work with Hibernate Validator.

`$CATALINE_HOME/lib`のELが2.2と2.1の間で互換性がないせいで、5.x系はtomcat6そのままだと動かないんだー。

>You can therefore either upgrade to Tomcat 7 or update the EL libs in your Tomcat 6 installation.
>To do the latter, replace the JAR files el-api.jar and and jasper-el.jar in $CATALINE_HOME/lib with an EL 2.2 implementation, e.g. from Tomcat 7.

Tomcat7のlibから2.2を持ってきて上書きすればいいよ、と添えられています。


僕の環境ではjarに対してシンボリックリンクが貼られていたので、上書きではなくリンク先をすげ替えることで無事動作しました。


### おまけ

そもそもEL(el-api.jar)ってなに？

[JSR 341](https://jcp.org/en/jsr/detail?id=341)で3.0について説明されていました。

上の例だと、`Human.class`のインスタンス`human`のプロパティに対して、通常のjavaコードではアクセサメソッドを経由しなければならない。
一方JSTLを呼び込んでいるJSPなどでは`human.name`で取得できる。この辺を旨いことやってくれているものがEL(Unified Expression Language)らしい。
CDIにも関わるとか。詳細はわかりません。


---