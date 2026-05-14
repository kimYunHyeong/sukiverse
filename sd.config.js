import StyleDictionary from 'style-dictionary'

const sd = new StyleDictionary({
  source: ['design/tokens.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      prefix: 'token',
      buildPath: 'src/styles/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            selector: ':root',
            outputReferences: false,
          },
        },
      ],
    },
  },
})

await sd.buildAllPlatforms()
