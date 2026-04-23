export const uiText = {
  nav: {
    home: '首页',
    archive: '归档',
    github: 'GitHub',
    about: '关于我',
  },
  common: {
    home: '首页',
    about: '关于我',
    posts: '文章',
    tags: '标签',
    series: '系列',
    comments: '评论',
    tableOfContents: '目录',
    morePosts: '更多文章',
    latestPosts: '最近发布',
    allPosts: '归档',
    previousPage: '上一页',
    nextPage: '下一页',
    newerPosts: '上一页',
    olderPosts: '下一页',
    readMore: '阅读更多',
    continueReading: '继续阅读',
    nextPost: '下一篇',
  },
  descriptions: {
    allPosts: '所有文章列表',
    taggedPosts: (tag: string) => `包含标签“${tag}”的所有文章`,
    seriesPosts: (series: string) => `“${series}”系列下的所有文章`,
  },
  search: {
    open: '打开搜索',
    label: '搜索',
    devNotice: '搜索功能仅在生产构建中可用。请先执行构建并预览站点以测试搜索。',
  },
}

export function formatPagedTitle(base: string, currentPage: number) {
  return currentPage > 1 ? `${base} - 第 ${currentPage} 页` : base
}

export function formatReadingTime(minutes: number) {
  return `${minutes} min read`
}

export function formatWordCount(words: number) {
  return `${words.toLocaleString('zh-CN')} 字`
}
