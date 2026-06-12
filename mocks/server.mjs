import { createServer } from 'http'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const allAnime = JSON.parse(
  readFileSync(join(__dirname, 'anime.json'), 'utf-8')
)

const PORT = 8080

createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'GET') {
    res.writeHead(405)
    res.end(JSON.stringify({ title: 'Method Not Allowed', status: 405 }))
    return
  }

  if (url.pathname === '/v1/anime/jikan') {
    const genre = url.searchParams.get('genre')
    const orderBy = url.searchParams.get('orderBy') ?? 'Popularity'

    let result = [...allAnime]

    if (genre) {
      result = result.filter((a) => a.genres.split(',').includes(genre))
    }

    const sorters = {
      Score: (a, b) => (b.score ?? 0) - (a.score ?? 0),
      Popularity: (a, b) => (a.rank ?? 999) - (b.rank ?? 999),
      Latest: (a, b) => (b.year ?? 0) - (a.year ?? 0),
      Comments: (a, b) => b.malId - a.malId,
    }

    result.sort(sorters[orderBy] ?? sorters.Popularity)

    res.writeHead(200)
    res.end(JSON.stringify(result))
    console.log(`GET /v1/anime/jikan  genre=${genre ?? '-'}  orderBy=${orderBy}  → ${result.length}개`)
    return
  }

  res.writeHead(404)
  res.end(
    JSON.stringify({
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
      detail: '요청한 리소스를 찾을 수 없습니다.',
      instance: url.pathname,
    })
  )
}).listen(PORT, () => {
  console.log(`Mock API server  →  http://localhost:${PORT}`)
  console.log('엔드포인트: GET /v1/anime/jikan?genre=Action&orderBy=Popularity')
})
