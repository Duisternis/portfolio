import type { ShikiTransformer, ThemeRegistration } from 'shiki';

const palette = {
  bg: '#121211',
  text: '#d8d4c8',
  muted: '#8b8376',
  dim: '#4f4b44',
  accent: '#d39b2e',
  accent2: '#f3c471',
  added: '#8a9a5b',
  removed: '#b0655c',
};

export const theme: ThemeRegistration = {
  name: 'instrument',
  type: 'dark',
  colors: {
    'editor.background': palette.bg,
    'editor.foreground': palette.text,
  },
  settings: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: palette.dim } },
    {
      scope: ['keyword', 'storage', 'storage.type', 'keyword.control', 'keyword.operator.new'],
      settings: { foreground: palette.text },
    },
    {
      scope: ['string', 'string.quoted', 'constant.other.symbol', 'meta.embedded.line'],
      settings: { foreground: palette.accent2 },
    },
    {
      scope: ['constant.numeric', 'constant.language', 'constant.character.escape'],
      settings: { foreground: palette.accent },
    },
    {
      scope: ['entity.name.function', 'support.function', 'entity.name.tag'],
      settings: { foreground: palette.text },
    },
    {
      scope: ['variable', 'variable.parameter', 'meta.object-literal.key', 'entity.name.type'],
      settings: { foreground: palette.muted },
    },
    {
      scope: ['punctuation', 'meta.brace', 'keyword.operator'],
      settings: { foreground: palette.dim },
    },
    { scope: ['markup.inserted', 'meta.diff.header.to-file'], settings: { foreground: palette.added } },
    { scope: ['markup.deleted', 'meta.diff.header.from-file'], settings: { foreground: palette.removed } },
    { scope: ['meta.diff.range', 'meta.diff.header'], settings: { foreground: palette.dim } },
  ],
};

export const codeLabel: ShikiTransformer = {
  name: 'code-label',
  pre(node) {
    const file = this.options.meta?.__raw?.trim();
    if (file) node.properties['data-file'] = file;
  },
};
