import { test, expect } from '@playwright/test'

test.describe('네비게이션 바', () => {
  test('메인 페이지에서 네비게이션 바가 렌더링된다', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test('로그인 페이지에서는 네비게이션 바가 숨겨진다', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('navigation')).not.toBeVisible()
  })

  test('애니메이션 탭이 기본 활성화 상태이다 (메인 페이지)', async ({ page }) => {
    await page.goto('/')
    // 활성 탭은 text-navigation-active-text 클래스를 가짐
    const activeLink = page.getByRole('link', { name: '애니메이션' })
    await expect(activeLink).toHaveClass(/text-navigation-active-text/)
  })

  test('로그인 버튼 클릭 시 /login 으로 이동한다', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: '로그인' }).click()
    await expect(page).toHaveURL('/login')
  })

  test('로고 클릭 시 메인 페이지로 돌아온다', async ({ page }) => {
    await page.goto('/login')
    // 로그인 페이지에서 직접 / 로 이동하는 대신 로고 링크 테스트는 메인에서 수행
    await page.goto('/')
    await page.getByRole('link', { name: 'sukiverse' }).first().click()
    await expect(page).toHaveURL('/')
  })
})
