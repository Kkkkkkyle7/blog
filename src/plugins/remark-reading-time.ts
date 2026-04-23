import type { RemarkPlugin } from '@astrojs/markdown-remark'
import getReadingTime from 'reading-time'
import { toString } from 'mdast-util-to-string'
import { formatReadingTime, formatWordCount } from '../i18n'

const remarkReadingTime: RemarkPlugin = (_options?) => {
  return function (tree, { data }) {
    if (data.astro?.frontmatter) {
      const textOnPage = toString(tree)
      const readingTime = getReadingTime(textOnPage)
      const minutes = Math.max(1, Math.round(readingTime.minutes))
      const words = Math.round(readingTime.words)
      data.astro.frontmatter.minutesRead = formatReadingTime(minutes)
      data.astro.frontmatter.wordCount = formatWordCount(words)
    }
  }
}

export default remarkReadingTime
