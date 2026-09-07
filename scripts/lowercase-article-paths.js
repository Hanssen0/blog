'use strict';

const ARTICLE_PERMALINK = 'articles/:title/';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Keep one canonical spelling for article URLs. This also restores the
// lowercase pathnames that Giscus saw while the site was hosted on Netlify.
hexo.extend.filter.register('post_permalink', permalink => {
  return typeof permalink === 'string' ? permalink.toLowerCase() : permalink;
}, 20);

function redirectPage({ canonicalUrl, metadata, openGraph }) {
  const title = metadata.title || hexo.config.title;
  const image = metadata.image
    ? hexo.extend.helper.get('full_url_for').call(hexo, metadata.image)
    : '';
  const openGraphTags = openGraph.call({
    config: hexo.config,
    is_post: () => true,
    page: metadata.post,
    url: canonicalUrl
  }, {
    author: hexo.config.author,
    description: metadata.description,
    image,
    title,
    twitter_card: 'summary_large_image',
    twitter_id: 'Hanssen0',
    twitter_image: image,
    type: 'article',
    url: canonicalUrl
  });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Redirecting to ${escapeHtml(title)}…</title>
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  ${openGraphTags}
  ${image ? `<meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(title)}">` : ''}
  <meta http-equiv="refresh" content="0; url=${escapeHtml(canonicalUrl)}">
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(canonicalUrl)}">${escapeHtml(title)}</a>…</p>
</body>
</html>`;
}

// GitHub Pages is case-sensitive, so retain the paths Hexo generated before
// canonicalization as redirect pages. The redirect reuses the canonical post's
// generated metadata and image, allowing social crawlers to preview old URLs.
hexo.extend.generator.register('case-compatible-article-paths', function caseCompatibleArticlePaths(locals) {
  if (this.config.permalink !== ARTICLE_PERMALINK) return [];

  const generatedOpenGraph = this.extend.helper.get('generated_open_graph');
  const openGraph = this.extend.helper.get('open_graph');
  const fullUrlFor = this.extend.helper.get('full_url_for');

  return locals.posts.toArray().flatMap(post => {
    if (!post.slug || post.__permalink) return [];

    const legacyPath = ARTICLE_PERMALINK.replace(':title', post.slug);
    if (legacyPath === legacyPath.toLowerCase()) return [];

    const generated = generatedOpenGraph(post) || {};
    const canonicalUrl = fullUrlFor.call(this, post.path);

    return [{
      path: legacyPath,
      data: redirectPage({
        canonicalUrl,
        metadata: {
          ...generated,
          post,
          title: generated.title || post.title
        },
        openGraph
      })
    }];
  });
});
