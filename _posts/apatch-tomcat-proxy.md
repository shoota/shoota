---
title: Apache-Tomcatのプロキシ設定を変更したらsessionがとれなくなった
excerpt: 'あああ'
coverImage:
  url: '/assets/blog/keyboard.jpg'
  provider: 'Ken Suarez'
  providerUrl: https://unsplash.com/@kensuarez
date: '2014-09-22'
ogImage:
  url: '/assets/blog/keyboard.jpg'
---

Javaアプリでsessionスコープに保存したPOJOを取得できずにハマったときのメモ。

<span class="more"></span>

### 構成

- アプリのフレームワークはSpring3。通常のServletアプリケーション。
- 前段のWebサーバにApache、JavaアプリのコンテナとしてTomcatを用いて、両者の連携はmod_proxy_ajpを利用。

### やりたいこと

ふつうにsessionスコープに保存したobjectを別のパスで取得する。
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


### sessionからデータがとれない！

`/user/edit`を叩いても常に`/user/login`に遷移する。つまり`form == null`が常にtrueとなってしまっている。
念のためデバッガでステップ実行してみても、やはり`form`がnullである。


セッションタイムアウトの設定やSpringでのセッションの利用方法など、あらゆるドキュメントを確認するも、
まったく解決の糸口が掴めない。なんだ....なにが悪いっていうんだ....！！


### あっ！

ここで、前日の開発で別のコンテキストパスで動作させるために、server.xmlとhttpd.confの`ProxyPass`を変更したことを思い出す。
httpd.confはこんな感じ。

```
ProxyPassMatch  /  ajp://localhost:8009/spring/
```
そして`JSESSIONID`がクッキーに保存されていて、クッキーにはPathがあって......！？


あれ...？もしかしてセッションIDのクッキーのPath、ずれてるんじゃない...？



とりあえずリバースプロキシの設定を戻し、ApacheとTomcatを再起動。
```
ProxyPassMatch  /  ajp://localhost:8009/
```

##あー、とれたわー。sessionから普通にobject取得できたわー。




ちなみにリバースプロキシでパス階層がずれる場合は、`ProxyPassReverseCookiePath`ディレクティブを使う[らしい](http://kadoppe.com/archives/2011/04/tomcat-cookie-path-mod-proxy.html)です。



---
