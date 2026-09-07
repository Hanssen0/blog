'use strict';

const ARTICLE_PERMALINK = 'articles/:title/';

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.slice() : [value];
}

// Keep one canonical spelling for article URLs. This also restores the
// lowercase pathnames that Giscus saw while the site was hosted on Netlify.
hexo.extend.filter.register('post_permalink', permalink => {
  return typeof permalink === 'string' ? permalink.toLowerCase() : permalink;
}, 20);

// GitHub Pages is case-sensitive, so retain the paths Hexo generated before
// canonicalization as redirect pages. This covers every historically published
// mixed-case article URL without having to list them in _config.yml.
hexo.extend.filter.register('before_generate', function addCaseAliases() {
  if (this.config.permalink !== ARTICLE_PERMALINK) return;

  this.locals.get('posts').forEach(post => {
    if (!post.slug || post.__permalink) return;

    const legacyPath = ARTICLE_PERMALINK.replace(':title', post.slug);
    if (legacyPath === legacyPath.toLowerCase()) return;

    const aliases = asArray(post.alias || post.aliases);
    if (!aliases.includes(legacyPath)) aliases.push(legacyPath);
    post.alias = aliases;
  });
}, 20);
