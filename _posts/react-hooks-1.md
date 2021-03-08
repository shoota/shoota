---
title: React Hooks を雑にメモってまとめる vol.1
date: 2019-03-10 00:20:29
tags: react
---


# 超訳・React歴史的経緯

- Class Base ComponentからFunctional Componentへ
- SFC(Stateless Functional Component) と関数の入れ子（compose）で振る舞いと見た目を決める
- State管理とRenderingライフサイクルとしてReduxが関数ミルフィーユを支える
- React本体が振る舞い自体を関数化しちゃえ！からの _React Hooks_ 爆誕

---

# React Hooks API

https://reactjs.org/docs/hooks-reference.html


### useState

`const [state, setState] = useState(initialState)`

- state: 状態変数
- setState: 状態を更新する関数
- initialState: 状態変数の初期値

SFCにState（とそのupdater）を持たせるための関数。`SFC + S = FC`。
stateの更新を望む振る舞いごとに、updaterを利用した関数を定義して`export`してあげればView側でその関数をbindするだけでよい。

```typescript
export const useCount = () => {
  const [count, setCount] = React.useState(0);
  const add = () => setCount(count + 1);
  const reduce = () => setCount(count - 1);
  return { value: count, add, reduce };
};

export default useCount;
```

[サンプル](https://codesandbox.io/s/y3x70j1opx)


### useEffect

`useEffect(実行する関数[, 変更を監視するStateの配列])`

Rendering完了後に実行したいことを詰め込む。`componentDidMount`とか`componentDidUpdate`的なやつ。
第二引数にどのSteteの変更に由来したRenderingであるかを限定する配列を指定できる。
第二引数を省略した場合はすべてのStateをしたことになる（いつも動く）。
`useState`で初期値をセットしたときにもHookされるので、`componentDidMount`相当のことができる。

```typescript
const [data, setData] = React.useState({ count: 0, message: "initialize" });

// define any functions use `setData`.....


React.useEffect(
  () => {
    console.log(`now value is ${data.count}`);
  },
  [data.count]
);
```

[サンプル](https://codesandbox.io/s/pmz0npz0lm)


### useContext

`useContext(AnyContext)`

プロダクト開発ではまあめったに使わないし、使えるほどの設計パワーが足りないのでほとんど使わなそう（読むことはきっとある）。
`createContext` で生成したPropsを下位のコンポーネントが受け取る場合、従来はConsumerのrender props引数から受け取っていたが、
`useContext` の返却値として受け取れるようになった。Contextからattributeを取り出すようなイメージ。


## useReducer

`const [state, dispatch] = useReducer(reducer, initialArg, init);`

- reducer: reducer。 actionを受け取ってstateを返す関数
- initialArg: stateの初期値。
- init: stateを初期化する関数。任意引数で、`init(initialArg)` の形で実行される。明示的に初期化を実行する場合(Lazy initialization)などに使用する。


`useStete`と似たAPIだが、updaterではなくdispatch関数を返す。dispatchで指定したActionはreducerに渡される。
reducerは現在のstateとactionの値をもとに更新後のstateを回答する。dispatchが更新後のStateを適用してViewが更新される。

`useState` が個々のStateに対してupdaterを関数化するのに対して、dispatchが全体のStateの更新手順(Action)を指定する。
書いてる分にはreduxと大差ない。updaterがreducerに集合してState更新のルーティングが見え、振る舞いの隠蔽とカプセル化ができる。よい。


[サンプル](https://codesandbox.io/s/y21wylyq1z)


## useMemo


`const memoizedValue = useMemo(() => func(a, b), [a, b]);`

memo化関数。第二引数に指定した値に変化がある場合のみ、第一引数の関数を実行する。
ReactではRenderingの過程に必要な計算処理はRenderingが起きるたびに毎回実行してしまうが、useMemoを使って関数を定義しておけば監視対象となる値が変化した場合のみRendering過程の計算を再実行し、値が変化していない場合は実行せずに前回の値を使用してくれる。すなわち、複数のPropsのうち、計算が必要なPropsが変更された場合のみrendering過程でのコンピューティングを実行するように最適化できる。

[サンプル](https://codesandbox.io/s/y0823mznqv)


## useCallback

`const memoizedCallback = useMemo(() => func(a, b), [a, b]);`

useMemoとほぼ同じだが、関数オブジェクトそのものをmemo化する。

[サンプル](https://codesandbox.io/s/mmj6547woy)

`useMemo` と `useCallback` のサンプルの違いは

```diff
- <p>msg</p>
+ <p>msg()</p>
```

だけ。
関数オブジェクトをmemo化することによって、Propsに与えている関数が再生性されることを抑制するなどができそう。

 
---



> vol.1では一旦ここまで。次回、useRefなどの ~~あまりつかわなそう~~ 使用頻度の低い、Hooks APIにふれる。
