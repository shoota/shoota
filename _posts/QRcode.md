---
title: iOSでQRコードを読み取ってみる
excerpt: 'あああ'
coverImage:
  url: '/assets/blog/keyboard.jpg'
  provider: 'Ken Suarez'
  providerUrl: https://unsplash.com/@kensuarez
date: '2015-03-20'
ogImage:
  url: '/assets/blog/keyboard.jpg'
---

iOS7からQRコードの読み取りが簡単になっていたらしいのですが、そもそも最近はQRコードをあんまり見なくなったのでした。
思い立って（？）、QRコード読み取りのアプリを作ってみたのでメモ。あ、言語はObjective-Cです。

<span class="more"></span>

### プロジェクト作成

いつもどおり、[New Project]から、[Single View Application]を選択、LanugageはObjective-C.
プロジェクトの[General] > [Deployment Info] > [Device Orientation]で`Portrait`だけにしておく（面倒なので）。
今日現在でiOS 8.2がでてますが、iPhone6を8.1からアップデートしてなかったので[Deployment Target]を8.1にしておいた。 

カメラプレビューはView全体を使っちゃうので、storyboardは特に変更なし。


### ViewController.h

カメラ入出力を扱うので`AVFoundation`関係のimportと、画像認識のメタデータを扱うdelegateが必要です。
あとカメラのセッションをインスタンスで持っておかないと使えないので、これもプロパティを用意しておきます。

```objectivec

#import <UIKit/UIKit.h>
#import <AVFoundation/AVFoundation.h>

@interface ViewController : UIViewController <AVCaptureMetadataOutputObjectsDelegate>

@property (strong, nonatomic) AVCaptureSession* session;

@end

```


### ViewController.m

#### viewDidload

とりあえず`viewDidLoad`でカメラ周りのインスタンスを生成しつつ、sessionを作成します。
本当はカメラが使えるかー？とかの判定があるべきですが、カメラある前提で書いていきます。
全コードをまず書いてしまうと、こんな感じ。

```objectivec
- (void)viewDidLoad {
    [super viewDidLoad];
    
    // Device
    AVCaptureDevice *device = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo];
    // session
    self.session = [[AVCaptureSession alloc] init];
    
    // Input
    AVCaptureDeviceInput *input = [AVCaptureDeviceInput deviceInputWithDevice:device error:nil];
    if (input) {
        [self.session addInput:input];
    } else {
        NSLog(@"error");
    }
    
    // Output
    AVCaptureMetadataOutput *output = [[AVCaptureMetadataOutput alloc] init];
    [self.session addOutput:output];
    [output setMetadataObjectsDelegate:self queue:dispatch_get_main_queue()];
    [output setMetadataObjectTypes:@[AVMetadataObjectTypeQRCode, AVMetadataObjectTypeEAN13Code]];
    
    
    // Preview
    AVCaptureVideoPreviewLayer *preview = [AVCaptureVideoPreviewLayer layerWithSession:self.session];
    preview.videoGravity = AVLayerVideoGravityResizeAspectFill;
    preview.frame = CGRectMake(0, 0, self.view.frame.size.width, self.view.frame.size.height);
    [self.view.layer insertSublayer:preview atIndex:0];
    
    // Start
    [self.session startRunning];
}

```

ビデオデバイスとセッション、inputを作る。
previewや`[self.session startRunning]`特筆することはなく、カメラを使いたいときのいつもの感じです。


#### QRコード認識

delegateを受けておいて、delegateメソッドで認識した時の処理を定義します。
`@[AVMetadataObjectTypeQRCode, AVMetadataObjectTypeEAN13Code]`を指定しているとこでQRコードの認識を設定。

```objectivec
    // Output
    AVCaptureMetadataOutput *output = [[AVCaptureMetadataOutput alloc] init];
    [self.session addOutput:output];
    [output setMetadataObjectsDelegate:self queue:dispatch_get_main_queue()];
    [output setMetadataObjectTypes:@[AVMetadataObjectTypeQRCode, AVMetadataObjectTypeEAN13Code]];

```


### 認識時処理

認識したら`captureOutput`がdelegateメソッドで呼ばれるので、読み取ります。
`[(AVMetadataMachineReadableCodeObject *)data stringValue]`で文字列化しています。
顔認識の場合とか、他の識別が動作した場合もこのメソッドが呼ばれてしまうので、`data.type`が`AVMetadataObjectTypeQRCode`の
ときだけ読み取り文字列をURLとしてSafariで開くようにしています。


```objectivec
- (void)captureOutput:(AVCaptureOutput *)captureOutput didOutputMetadataObjects:(NSArray *)metadataObjects
       fromConnection:(AVCaptureConnection *)connection
{
    // 複数のmetadataが来るので順に調べる
    for (AVMetadataObject *data in metadataObjects) {
        if (![data isKindOfClass:[AVMetadataMachineReadableCodeObject class]]) continue;
        // QR code data
        NSString *strValue = [(AVMetadataMachineReadableCodeObject *)data stringValue];
        // type ?
        if ([data.type isEqualToString:AVMetadataObjectTypeQRCode]) {
            // QRコードの場合
            NSURL *url = [NSURL URLWithString:strValue];
            if ([[UIApplication sharedApplication] canOpenURL:url]) {
                [[UIApplication sharedApplication] openURL:url];
            }
        }
    }
}
```

### 試してみる

試しにこのブログのURLをQRコードにしてみた。識別されたらこのブログを自動的にSafariで開きます。

<div class="img">![qrcode](/img/qrcode.gif)</div>

---
