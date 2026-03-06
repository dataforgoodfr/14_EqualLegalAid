/** @type {import('stylelint').Config} */
export default {
  plugins: ['stylelint-order'],
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-property-sort-order-smacss',
  ],
  overrides: [
    {
      files: ['**/*.{scss,sass}'],
      customSyntax: 'postcss-scss',
    },
    {
      files: ['**/*.css'],
      rules: {
        'at-rule-no-unknown': [
          true,
          { ignoreAtRules: ['custom-variant', 'theme', 'utility', 'variants', 'responsive'] },
        ],
      },
    },
  ],
  rules: {
    'media-feature-name-unit-allowed-list': {
      'width': ['rem', 'px'],
      '/height/': ['rem', 'px'],
    },
    'no-irregular-whitespace': true,
    'no-empty-source': null,
    'selector-max-id': 1,
    'selector-max-class': 3,
    'selector-max-type': 3,
    'no-descending-specificity': null,
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['deep', 'global'] }],
    'selector-pseudo-element-no-unknown': [true, { ignorePseudoElements: ['v-deep'] }],
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'use',
          'forward',
          'theme',
          'mixin',
          'utility',
          'include',
          'for',
          'custom-variant',
        ],
      },
    ],
    'declaration-property-value-no-unknown': [
      true,
      {
        ignoreProperties: {
          '/^animation-/': 'auto',
          'top': '/^anchor/',
          'right': '/^anchor/',
          'bottom': '/^anchor/',
          'left': '/^anchor/',
        },
      },
    ],

    'property-no-vendor-prefix': [
      true,
      {
        ignoreProperties: [
          'mask',
          'mask-size',
          'mask-position',
          'line-clamp',
          'backdrop-filter',
          'user-select',
          'initial-letter',
          'box-decoration-break',
          'text-fill-color',
          'text-stroke',
          'tap-highlight-color',
          'box-orient',
        ],
      },
    ],

    'declaration-block-no-redundant-longhand-properties': [true, { ignoreShorthands: ['grid-template'] }],

    'declaration-property-unit-disallowed-list': {
      '/^font|^font-size/': ['px'],
    },
    'import-notation': 'string',
    'max-nesting-depth': 4,
    'media-feature-range-notation': 'context',
    'font-family-no-duplicate-names': null,
    'font-weight-notation': 'numeric',
    'color-hex-length': 'long',
    'color-function-notation': 'modern',
    'lightness-notation': 'percentage',
    'alpha-value-notation': 'percentage',
    'hue-degree-notation': 'number',
  },
}
