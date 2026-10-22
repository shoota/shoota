import { readFileSync } from 'node:fs'
import path from 'node:path'

import type { NextApiRequest, NextApiResponse } from 'next'

import { renderProfileSvg } from '@/lib/profileSvg'

/**
 * アバターを data URI にして SVG に埋め込む。`<img>` 経由の SVG は外部画像を
 * 読まないので、埋め込むしかない。読めなければイニシャルで代えるので、
 * 失敗しても応答は返す。`process.cwd()` と文字列リテラルの組み合わせで書くのは
 * Next のファイルトレースに拾わせて Vercel の関数に同梱させるため。
 */
const loadAvatar = (): string | null => {
  try {
    const file = readFileSync(
      path.join(process.cwd(), 'public', 'assets', 'img', 'avt.jpg')
    )
    return `data:image/jpeg;base64,${file.toString('base64')}`
  } catch {
    return null
  }
}

/**
 * `GET /api/profile.svg`。GitHub の README から `<img>` で読む想定。
 * 内容はコードから決まるので、1 時間はキャッシュしてよい。
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    res.status(405).end()
    return
  }
  const svg = renderProfileSvg({ avatarDataUri: loadAvatar() })
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
  res.status(200).send(req.method === 'HEAD' ? undefined : svg)
}
