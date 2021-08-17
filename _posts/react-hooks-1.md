---
title: React Hooks を雑にメモってまとめる
excerpt: 'React Hooksで必要そうなやつのDocを読んだから自分語でまとめておく'
coverImage:
  url: '/assets/blog/keyboard.jpg'
  provider: 'Ken Suarez'
  providerUrl: https://unsplash.com/@kensuarez
date: '2019-03-10'
ogImage:
  url: '/assets/blog/keyboard.jpg'
---

# 超訳・React 歴史的経緯

- Class Base Component から Functional Component へ
- SFC(Stateless Functional Component) と関数の入れ子（compose）で振る舞いと見た目を決める
- State 管理と Rendering ライフサイクルとして Redux が関数ミルフィーユを支える
- React 本体が振る舞い自体を関数化しちゃえ！からの _React Hooks_ 爆誕

---

# React Hooks API

https://reactjs.org/docs/hooks-reference.html

### useState

`const [state, setState] = useState(initialState)`

- state: 状態変数
- setState: 状態を更新する関数
- initialState: 状態変数の初期値

SFC に State（とその updater）を持たせるための関数。`SFC + S = FC`。
state の更新を望む振る舞いごとに、updater を利用した関数を定義して`export`してあげれば View 側でその関数を bind するだけでよい。

```tsx
export const useCount = () => {
  const [count, setCount] = React.useState(0)
  const add = () => setCount(count + 1)
  const reduce = () => setCount(count - 1)
  return { value: count, add, reduce }
}

export default useCount
```

[サンプル](https://codesandbox.io/s/y3x70j1opx)

### useEffect

`useEffect(実行する関数[, 変更を監視するStateの配列])`

Rendering 完了後に実行したいことを詰め込む。`componentDidMount`とか`componentDidUpdate`的なやつ。
第二引数にどの Stete の変更に由来した Rendering であるかを限定する配列を指定できる。
第二引数を省略した場合はすべての State をしたことになる（いつも動く）。
`useState`で初期値をセットしたときにも Hook されるので、`componentDidMount`相当のことができる。

```typescript
const [data, setData] = React.useState({ count: 0, message: 'initialize' })

// define any functions use `setData`.....

React.useEffect(() => {
  console.log(`now value is ${data.count}`)
}, [data.count])
```

[サンプル](https://codesandbox.io/s/pmz0npz0lm)

### useContext

`useContext(AnyContext)`

プロダクト開発ではまあめったに使わないし、使えるほどの設計パワーが足りないのでほとんど使わなそう（読むことはきっとある）。
`createContext` で生成した Props を下位のコンポーネントが受け取る場合、従来は Consumer の render props 引数から受け取っていたが、
`useContext` の返却値として受け取れるようになった。Context から attribute を取り出すようなイメージ。

#### useReducer

`const [state, dispatch] = useReducer(reducer, initialArg, init);`

- reducer: reducer。 action を受け取って state を返す関数
- initialArg: state の初期値。
- init: state を初期化する関数。任意引数で、`init(initialArg)` の形で実行される。明示的に初期化を実行する場合(Lazy initialization)などに使用する。

`useStete`と似た API だが、updater ではなく dispatch 関数を返す。dispatch で指定した Action は reducer に渡される。
reducer は現在の state と action の値をもとに更新後の state を回答する。dispatch が更新後の State を適用して View が更新される。

`useState` が個々の State に対して updater を関数化するのに対して、dispatch が全体の State の更新手順(Action)を指定する。
書いてる分には redux と大差ない。updater が reducer に集合して State 更新のルーティングが見え、振る舞いの隠蔽とカプセル化ができる。よい。

[サンプル](https://codesandbox.io/s/y21wylyq1z)

## useMemo

`const memoizedValue = useMemo(() => func(a, b), [a, b]);`

memo 化関数。第二引数に指定した値に変化がある場合のみ、第一引数の関数を実行する。
React では Rendering の過程に必要な計算処理は Rendering が起きるたびに毎回実行してしまうが、useMemo を使って関数を定義しておけば監視対象となる値が変化した場合のみ Rendering 過程の計算を再実行し、値が変化していない場合は実行せずに前回の値を使用してくれる。すなわち、複数の Props のうち、計算が必要な Props が変更された場合のみ rendering 過程でのコンピューティングを実行するように最適化できる。

[サンプル](https://codesandbox.io/s/y0823mznqv)

## useCallback

`const memoizedCallback = useMemo(() => func(a, b), [a, b]);`

useMemo とほぼ同じだが、関数オブジェクトそのものを memo 化する。

[サンプル](https://codesandbox.io/s/mmj6547woy)

`useMemo` と `useCallback` のサンプルの違いは

```diff
- <p>msg</p>
+ <p>msg()</p>
```

だけ。
関数オブジェクトを memo 化することによって、Props に与えている関数が再生性されることを抑制するなどができそう。

---

> vol.1 では一旦ここまで。次回、useRef などの ~~あまりつかわなそう~~ 使用頻度の低い、Hooks API にふれる。
