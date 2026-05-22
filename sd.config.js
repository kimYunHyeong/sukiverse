import StyleDictionary from 'style-dictionary'
import fs from 'fs'
import path from 'path'

// camelCase → kebab-case 변환 (예: primaryBg → primary-bg, bgHover → bg-hover)
function toKebab(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

// tokens.json의 semantic.color 토큰을 --color-{category}-{name}: value 형태로 변환
StyleDictionary.registerFormat({
  name: 'tailwind/theme-inline',
  format: ({ dictionary }) => {
    const colorTokens = dictionary.allTokens.filter(
      (token) => token.path[0] === 'semantic' && token.path[1] === 'color'
    )

    const lines = colorTokens.map((token) => {
      // path: ['semantic', 'color', 'background', 'page'] → background-page
      const nameParts = token.path.slice(2).map(toKebab)
      const varName = `--color-${nameParts.join('-')}`
      return `  ${varName}: ${token.value};`
    })

    return lines.join('\n')
  },
})

const sd = new StyleDictionary({
  source: ['design/tokens.json'],
  platforms: {
    // 기존: tokens.css 생성 (primitive + semantic 전체)
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

// globals.css의 @theme inline 색상 블록을 자동 생성된 값으로 교체
const globalsPath = path.resolve('src/app/globals.css')
const globalsContent = fs.readFileSync(globalsPath, 'utf-8')

// semantic.color 토큰을 직접 읽어서 값 추출 (outputReferences: false 적용)
const tokensRaw = JSON.parse(fs.readFileSync('design/tokens.json', 'utf-8'))

// primitive 값 해석 (예: {primitive.gray.900} → #1A1A1A)
function resolvePrimitive(value, tokens) {
  if (typeof value !== 'string') return value
  const refMatch = value.match(/^\{(.+)\}$/)
  if (!refMatch) return value

  const parts = refMatch[1].split('.')
  let resolved = tokens
  for (const part of parts) {
    resolved = resolved?.[part]
  }
  return resolved?.['$value'] ?? value
}

function buildColorLines(colorObj, tokens, parentPath = []) {
  const lines = []
  for (const [key, val] of Object.entries(colorObj)) {
    if (key.startsWith('$')) continue
    const currentPath = [...parentPath, toKebab(key)]
    if (val['$type'] === 'color') {
      const resolved = resolvePrimitive(val['$value'], tokens)
      lines.push(`  --color-${currentPath.join('-')}: ${resolved.toLowerCase()};`)
    } else {
      lines.push(...buildColorLines(val, tokens, currentPath))
    }
  }
  return lines
}

const colorLines = buildColorLines(tokensRaw.semantic.color, tokensRaw)
const generatedBlock = colorLines.join('\n')

// 마커 사이의 색상 블록만 교체
const START_MARKER = '  /* ↓↓↓ AUTO-GENERATED — do not edit. run: npm run build:tokens ↓↓↓ */'
const END_MARKER = '  /* ↑↑↑ AUTO-GENERATED END ↑↑↑ */'

const startIdx = globalsContent.indexOf(START_MARKER)
const endIdx = globalsContent.indexOf(END_MARKER)

if (startIdx === -1 || endIdx === -1) {
  console.error('globals.css에서 AUTO-GENERATED 마커를 찾지 못했습니다.')
  process.exit(1)
}

const before = globalsContent.slice(0, startIdx)
const after = globalsContent.slice(endIdx + END_MARKER.length)
const newContent = before + START_MARKER + '\n' + generatedBlock + '\n' + END_MARKER + after

fs.writeFileSync(globalsPath, newContent, 'utf-8')
console.log('✓ src/styles/tokens.css 생성 완료')
console.log('✓ src/app/globals.css @theme inline 색상 블록 업데이트 완료')
