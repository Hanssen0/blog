'use strict';

const { format } = require('util');

hexo.extend.generator.register('grouped-index', function groupedIndex(locals) {
  const config = this.config;
  const indexConfig = config.index_generator;
  const perPage = indexConfig.per_page;
  const paginationDir = indexConfig.pagination_dir || config.pagination_dir || 'page';
  let base = indexConfig.path || '';

  if (base && !base.endsWith('/')) base += '/';

  const posts = locals.posts.sort(indexConfig.order_by).toArray();
  posts.sort((a, b) => (b.sticky || 0) - (a.sticky || 0));

  const groups = [];
  posts.forEach(post => {
    const previous = groups[groups.length - 1];

    if (!post.title && previous && previous.type === 'notes') {
      previous.posts.push(post);
    } else if (!post.title) {
      groups.push({ type: 'notes', posts: [post] });
    } else {
      groups.push({ type: 'post', post });
    }
  });

  const total = perPage ? Math.ceil(groups.length / perPage) : 1;
  const pageUrl = page => page > 1 ? base + format(`${paginationDir}/%d/`, page) : base;
  const pages = [];

  for (let current = 1; current <= total; current++) {
    pages.push({
      path: pageUrl(current),
      layout: ['index', 'archive'],
      data: {
        __index: true,
        base,
        total,
        current,
        current_url: pageUrl(current),
        groups: perPage ? groups.slice(perPage * (current - 1), perPage * current) : groups,
        prev: current > 1 ? current - 1 : 0,
        prev_link: current > 1 ? pageUrl(current - 1) : '',
        next: current < total ? current + 1 : 0,
        next_link: current < total ? pageUrl(current + 1) : ''
      }
    });
  }

  return pages;
});
