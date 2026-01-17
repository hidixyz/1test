import { test, expect } from '@playwright/test';

test.describe('打卡应用功能测试', () => {

  test.beforeEach(async ({ request }) => {
    // 清理测试数据 - 删除所有打卡记录
    const checkins = await request.get('http://localhost:3001/api/checkins');
    const data = await checkins.json();
    for (const checkin of data) {
      await request.delete(`http://localhost:3001/api/checkins/${checkin.id}`);
    }
  });

  test('1. 首页 - 显示统计数据和任务数量', async ({ page }) => {
    await page.goto('/');

    // 验证页面标题
    await expect(page.locator('h1')).toContainText('欢迎回来');

    // 验证显示任务数量
    await expect(page.locator('.card').first()).toContainText('今日目标');
    await expect(page.locator('.card').first()).toContainText('项打卡任务');

    // 验证连续打卡卡片
    await expect(page.locator('.card').nth(1)).toContainText('连续打卡');

    // 验证累计打卡卡片
    await expect(page.locator('.card').nth(2)).toContainText('累计打卡');

    console.log('✅ 首页统计数据显示正常');
  });

  test('2. 打卡页面 - 加载任务列表', async ({ page }) => {
    await page.goto('/checkin');

    // 验证页面标题
    await expect(page.locator('h1')).toContainText('打卡');

    // 等待任务列表加载 - 使用 .list-item (实际 UI 结构)
    await page.waitForSelector('.list-item');

    // 验证有任务显示（默认应有3个任务）
    const tasks = page.locator('.list-item');
    const count = await tasks.count();
    expect(count).toBeGreaterThan(0);

    console.log(`✅ 打卡页面任务列表加载成功，共 ${count} 个任务`);
  });

  test('3. 打卡功能 - 点击打卡按钮创建记录', async ({ page, request }) => {
    await page.goto('/checkin');

    // 等待任务列表加载
    await page.waitForSelector('.list-item');

    // 找到并点击第一个"立即打卡"按钮
    const checkinButton = page.locator('button:has-text("立即打卡")').first();
    await expect(checkinButton).toBeVisible();
    await checkinButton.click();

    // 等待按钮状态变化为"已打卡"
    await expect(page.locator('button:has-text("已打卡")').first()).toBeVisible({ timeout: 5000 });

    // 验证打卡记录已创建
    const today = new Date().toISOString().split('T')[0];
    const response = await request.get(`http://localhost:3001/api/checkins?date=${today}`);
    const checkins = await response.json();

    expect(checkins.length).toBeGreaterThan(0);
    console.log(`✅ 打卡成功，创建了 ${checkins.length} 条记录`);
  });

  test('4. 记录页面 - 显示打卡历史', async ({ page, request }) => {
    // 先创建一条打卡记录
    const today = new Date().toISOString().split('T')[0];
    await request.post('http://localhost:3001/api/checkins', {
      data: { task_id: 1, date: today, note: '测试记录' }
    });

    await page.goto('/records');

    // 验证页面标题
    await expect(page.locator('h1')).toContainText('记录');

    // 等待表格数据加载 - 使用 .table-row (实际 UI 结构)
    await page.waitForSelector('.table-row:not(.table-head)');

    // 验证有记录显示
    const rows = page.locator('.table-row:not(.table-head)');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // 验证显示任务名
    await expect(page.locator('.table-row').nth(1)).toContainText('晨间冥想');

    console.log(`✅ 记录页面显示打卡历史正常，共 ${count} 条记录`);
  });

  test('5. 日历页面 - 显示月历视图', async ({ page }) => {
    await page.goto('/calendar');

    // 验证页面标题
    await expect(page.locator('h1')).toContainText('月历视图');

    // 验证显示当前月份
    const monthLabel = page.locator('.calendar-month');
    await expect(monthLabel).toBeVisible();

    // 验证显示星期行
    await expect(page.locator('.calendar-weekday').first()).toBeVisible();

    // 等待日历格子加载完成
    await page.waitForSelector('.calendar-cell:not(.empty)', { timeout: 10000 });

    // 验证显示日期格子
    const dayCells = page.locator('.calendar-cell:not(.empty)');
    const count = await dayCells.count();
    expect(count).toBeGreaterThan(0);

    console.log(`✅ 日历页面显示正常，共 ${count} 个日期格子`);
  });

  test('6. 日历页面 - 显示打卡状态', async ({ page, request }) => {
    // 先创建一条打卡记录
    const today = new Date().toISOString().split('T')[0];
    await request.post('http://localhost:3001/api/checkins', {
      data: { task_id: 1, date: today }
    });

    await page.goto('/calendar');

    // 等待数据加载
    await page.waitForSelector('.calendar-cell.success', { timeout: 5000 });

    // 验证有"已打卡"状态显示
    const successCell = page.locator('.calendar-cell.success');
    await expect(successCell.first()).toBeVisible();

    console.log('✅ 日历页面正确显示打卡状态');
  });

  test('7. 日历详情页 - 点击日期进入详情', async ({ page }) => {
    await page.goto('/calendar');

    // 等待加载
    await page.waitForSelector('.calendar-cell:not(.empty)');

    // 点击今天的日期 (非未来日期)
    const todayCell = page.locator('.calendar-cell:not(.empty):not(.future)').first();
    await todayCell.click();

    // 验证跳转到详情页
    await expect(page).toHaveURL(/\/calendar\/\d{4}-\d{2}-\d{2}/);

    // 验证详情页内容 - 使用 .first() 避免 strict mode violation
    await expect(page.locator('h1').first()).toBeVisible();

    console.log('✅ 日历详情页跳转正常');
  });

  test('8. 日历详情页 - 显示当日打卡记录', async ({ page, request }) => {
    // 先创建打卡记录
    const today = new Date().toISOString().split('T')[0];
    await request.post('http://localhost:3001/api/checkins', {
      data: { task_id: 1, date: today, note: '详情页测试' }
    });

    await page.goto(`/calendar/${today}`);

    // 等待加载
    await page.waitForTimeout(1000);

    // 验证显示打卡记录
    const content = await page.textContent('body');
    expect(content).toContain('晨间冥想'); // 默认任务名

    console.log('✅ 日历详情页显示当日打卡记录正常');
  });

  test('9. 删除打卡记录', async ({ page, request }) => {
    // 先创建打卡记录
    const today = new Date().toISOString().split('T')[0];
    const createResponse = await request.post('http://localhost:3001/api/checkins', {
      data: { task_id: 1, date: today }
    });
    const created = await createResponse.json();

    await page.goto('/records');

    // 等待表格加载
    await page.waitForSelector('.table-row:not(.table-head)');

    // 处理确认对话框
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // 找到删除按钮并点击
    const deleteButton = page.locator('button:has-text("删除")').first();
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // 等待删除完成
    await page.waitForTimeout(1000);

    // 验证记录被删除
    const response = await request.get(`http://localhost:3001/api/checkins?date=${today}`);
    const checkins = await response.json();
    const stillExists = checkins.some(c => c.id === created.id);

    expect(stillExists).toBe(false);
    console.log('✅ 删除打卡记录功能正常');
  });

  test('10. 导航功能 - 所有页面可访问', async ({ page }) => {
    const pages = [
      { path: '/', title: '首页' },
      { path: '/checkin', title: '打卡' },
      { path: '/records', title: '记录' },
      { path: '/calendar', title: '日历' },
    ];

    for (const p of pages) {
      await page.goto(p.path);
      await expect(page).toHaveURL(p.path);
      console.log(`  ✓ ${p.title} 页面 (${p.path}) 可访问`);
    }

    console.log('✅ 所有页面导航正常');
  });

  test('11. API 健康检查', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/health');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('ok');

    console.log('✅ API 健康检查通过');
  });

  test('12. 任务 API - 获取任务列表', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/tasks');
    expect(response.ok()).toBeTruthy();

    const tasks = await response.json();
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBeGreaterThan(0);

    // 验证任务结构
    expect(tasks[0]).toHaveProperty('id');
    expect(tasks[0]).toHaveProperty('name');

    console.log(`✅ 任务 API 正常，共 ${tasks.length} 个任务`);
  });

  test('13. 统计 API - 获取统计数据', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/stats');
    expect(response.ok()).toBeTruthy();

    const stats = await response.json();
    expect(stats).toHaveProperty('totalCheckins');
    expect(stats).toHaveProperty('streakDays');
    expect(stats).toHaveProperty('todayCheckins');

    console.log('✅ 统计 API 正常');
  });

  test('14. 打卡 API - 完整 CRUD 流程', async ({ request }) => {
    const today = new Date().toISOString().split('T')[0];

    // Create
    const createResponse = await request.post('http://localhost:3001/api/checkins', {
      data: { task_id: 1, date: today, note: 'CRUD测试' }
    });
    expect(createResponse.ok()).toBeTruthy();
    const created = await createResponse.json();
    expect(created.id).toBeDefined();
    console.log('  ✓ Create 成功');

    // Read
    const readResponse = await request.get(`http://localhost:3001/api/checkins?date=${today}`);
    expect(readResponse.ok()).toBeTruthy();
    const checkins = await readResponse.json();
    expect(checkins.some(c => c.id === created.id)).toBe(true);
    console.log('  ✓ Read 成功');

    // Delete
    const deleteResponse = await request.delete(`http://localhost:3001/api/checkins/${created.id}`);
    expect(deleteResponse.ok()).toBeTruthy();
    console.log('  ✓ Delete 成功');

    // Verify deletion
    const verifyResponse = await request.get(`http://localhost:3001/api/checkins?date=${today}`);
    const remaining = await verifyResponse.json();
    expect(remaining.some(c => c.id === created.id)).toBe(false);
    console.log('  ✓ 验证删除成功');

    console.log('✅ 打卡 API CRUD 流程完整测试通过');
  });
});
