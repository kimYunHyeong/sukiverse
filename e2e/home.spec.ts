import { test, expect } from '@playwright/test'

test.describe('메인 페이지 — 애니메이션 목록', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('초기 로드: 헤더·필터·카드가 렌더링된다', async ({ page }) => {
    // 검색 입력창
    await expect(page.getByPlaceholder('애니메이션 검색')).toBeVisible()

    // 장르 필터 칩 (첫 번째 장르 '액션')
    await expect(page.getByRole('button', { name: '액션' })).toBeVisible()

    // 카드가 1개 이상 렌더링
    const firstCard = page.locator('.grid > div').first()
    await expect(firstCard).toBeVisible()
  })

  test('장르 필터: 클릭하면 URL에 genre 파라미터가 추가된다', async ({ page }) => {
    await page.getByRole('button', { name: '액션' }).click()
    await expect(page).toHaveURL(/genre=Action/)
  })

  test('장르 필터: 같은 장르를 다시 클릭하면 genre 파라미터가 제거된다', async ({ page }) => {
    await page.getByRole('button', { name: '액션' }).click()
    await expect(page).toHaveURL(/genre=Action/)

    await page.getByRole('button', { name: '액션' }).click()
    await expect(page).not.toHaveURL(/genre=Action/)
  })

  test('장르 필터: 복수 선택이 가능하다', async ({ page }) => {
    await page.getByRole('button', { name: '액션' }).click()
    await page.getByRole('button', { name: '판타지' }).click()

    const url = page.url()
    expect(url).toContain('genre=Action')
    expect(url).toContain('genre=Fantasy')
  })

  test('검색: 입력 후 500ms 디바운스가 지나면 URL에 aniName이 반영된다', async ({ page }) => {
    await page.getByPlaceholder('애니메이션 검색').fill('나루토')
    // 디바운스 500ms + 여유 200ms
    await page.waitForTimeout(700)
    await expect(page).toHaveURL(/aniName=%EB%82%98%EB%A3%A8%ED%86%A0/)
  })

  test('검색: 입력을 지우면 aniName 파라미터가 제거된다', async ({ page }) => {
    await page.getByPlaceholder('애니메이션 검색').fill('나루토')
    await page.waitForTimeout(700)

    await page.getByPlaceholder('애니메이션 검색').clear()
    await page.waitForTimeout(700)
    await expect(page).not.toHaveURL(/aniName/)
  })

  test('검색 결과 없음: "검색 결과가 없습니다" 메시지가 표시된다', async ({ page }) => {
    await page.getByPlaceholder('애니메이션 검색').fill('xyzxyzxyz없는애니메이션')
    await page.waitForTimeout(700)
    await expect(page.getByText('검색 결과가 없습니다.')).toBeVisible()
  })
})
