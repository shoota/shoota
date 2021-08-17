---
title: Apache-Tomcatのプロキシ設定を変更したらsessionがとれなくなった
excerpt: 'リバースプロキシの設定をいじりながら開発を進めていたらハマったときの事故記録'
coverImage:
  url: '/assets/blog/keyboard.jpg'
  provider: 'Ken Suarez'
  providerUrl: https://unsplash.com/@kensuarez
date: '2014-09-22'
ogImage:
  url: '/assets/blog/keyboard.jpg'
---

Java アプリで session スコープに保存した POJO を取得できずにハマったときのメモ。

<span class="more"></span>

### 構成

- アプリのフレームワークは Spring3。通常の Servlet アプリケーション。
- 前段の Web サーバに Apache、Java アプリのコンテナとして Tomcat を用いて、両者の連携は mod_proxy_ajp を利用。

### やりたいこと

ふつうに session スコープに保存した object を別のパスで取得する。
イメージとしては下の感じ。

```javascript

package hoge.foo.contoroller


import hoge.foo.LoginForm

@RequestMapping(value="/user")
public class UserController{

    private static final String SESSION_FORM_NAME = "user_input_data"

    /**
    * ログイン
    */
    @RequestMapping(value="/login", method=RequestMethod.POST)
    public String login(
        @Valid @ModelAttribute LoginForm form,
        BindingResult result,
        HttpServletRequest request,
        Model model)　{

      if(result.hasError){
        return "login";      //入力エラー
      }

      // ログインに関する処理

      request.getSession().setAttribute(SESSION_FORM_NAME, form);  //session格納
      return "dashboard";
    }



    /**
    * セッションのユーザデータを参照して編集画面を表示する
    */
    @RequestMapping(value="/edit", method=RequestMethod.GET)
    public String editView(
        HttpServletRequest request,
        Model model) {

      LoginForm form = request.getSession().getAttribute(SESSION_FORM_NAME);

      if(form == null) {
        return "login";     // ログイン画面に戻る
      }
      //後続処理

      return "edit";
    }

}

```

### session からデータがとれない！

`/user/edit`を叩いても常に`/user/login`に遷移する。つまり`form == null`が常に true となってしまっている。
念のためデバッガでステップ実行してみても、やはり`form`が null である。

セッションタイムアウトの設定や Spring でのセッションの利用方法など、あらゆるドキュメントを確認するも、
まったく解決の糸口が掴めない。なんだ....なにが悪いっていうんだ....！！

### あっ！

ここで、前日の開発で別のコンテキストパスで動作させるために、server.xml と httpd.conf の`ProxyPass`を変更したことを思い出す。
httpd.conf はこんな感じ。

```
ProxyPassMatch  /  ajp://localhost:8009/spring/
```

そして`JSESSIONID`がクッキーに保存されていて、クッキーには Path があって......！？

あれ...？もしかしてセッション ID のクッキーの Path、ずれてるんじゃない...？

とりあえずリバースプロキシの設定を戻し、Apache と Tomcat を再起動。

```
ProxyPassMatch  /  ajp://localhost:8009/
```

##あー、とれたわー。session から普通に object 取得できたわー。

ちなみにリバースプロキシでパス階層がずれる場合は、`ProxyPassReverseCookiePath`ディレクティブを使う[らしい](http://kadoppe.com/archives/2011/04/tomcat-cookie-path-mod-proxy.html)です。

---
