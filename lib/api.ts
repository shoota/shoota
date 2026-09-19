import fs from 'fs'
import { join } from 'path'

import matter from 'gray-matter'

const postsDirectory = join(process.cwd(), '_posts')

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory)
}

type Items = {
  [key: string]: string
}

export function getPostBySlug(slug: string, fields: string[] = []) {
  const realSlug = slug.replace(/\.md$/, '')
  const fullPath = join(postsDirectory, `${realSlug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  const items: Items = {}

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === 'slug') {
      items[field] = realSlug
    }
    if (field === 'content') {
      items[field] = content
    }

    if (data[field]) {
      items[field] = data[field]
    }
  })

  return items
}

type Sortable = {
  slug?: string
  date?: string
}

/**
 * Newest first by the front-matter `date` (an ISO `YYYY-MM-DD` string, so
 * plain string comparison orders it). Posts sharing a date fall back to the
 * slug so the order is deterministic, and a missing date sorts last rather
 * than making the comparison inconsistent.
 */
export function comparePostsNewestFirst(a: Sortable, b: Sortable): number {
  const dateA = a.date ?? ''
  const dateB = b.date ?? ''
  if (dateA !== dateB) {
    return dateA > dateB ? -1 : 1
  }
  const slugA = a.slug ?? ''
  const slugB = b.slug ?? ''
  if (slugA === slugB) return 0
  return slugA < slugB ? -1 : 1
}

/**
 * Every post, newest first. The order is always by `date` even when the
 * caller does not ask for that field, so the blog index and the per-post
 * navigation never disagree; `date` and `slug` are read for sorting and then
 * dropped from the result unless they were requested.
 */
export function getAllPosts(fields: string[] = []) {
  const sortFields = ['date', 'slug']
  const requested = new Set(fields)
  const extra = sortFields.filter((field) => !requested.has(field))
  const posts = getPostSlugs()
    .map((slug) => getPostBySlug(slug, [...fields, ...extra]))
    .sort(comparePostsNewestFirst)
  if (extra.length === 0) return posts
  return posts.map((post) => {
    const copy = { ...post }
    extra.forEach((field) => delete copy[field])
    return copy
  })
}
