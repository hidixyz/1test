import { Router } from 'express';
import db from '../db.js';

const router = Router();

// 获取统计数据
router.get('/', (req, res) => {
  try {
    // 总打卡次数
    const totalCheckins = db.prepare('SELECT COUNT(*) as count FROM checkins').get().count;

    // 总任务数
    const totalTasks = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;

    // 获取所有有打卡记录的日期（去重）
    const checkinDates = db.prepare(`
      SELECT DISTINCT date FROM checkins ORDER BY date DESC
    `).all().map(row => row.date);

    // 计算连续打卡天数
    let streakDays = 0;
    if (checkinDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 检查今天或昨天是否有打卡
      const todayStr = today.toISOString().slice(0, 10);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      let checkDate;
      if (checkinDates.includes(todayStr)) {
        checkDate = new Date(today);
        streakDays = 1;
      } else if (checkinDates.includes(yesterdayStr)) {
        checkDate = new Date(yesterday);
        streakDays = 1;
      }

      if (checkDate) {
        // 向前检查连续天数
        let prevDate = new Date(checkDate);
        prevDate.setDate(prevDate.getDate() - 1);

        while (checkinDates.includes(prevDate.toISOString().slice(0, 10))) {
          streakDays++;
          prevDate.setDate(prevDate.getDate() - 1);
        }
      }
    }

    // 今日打卡数
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayCheckins = db.prepare('SELECT COUNT(*) as count FROM checkins WHERE date = ?').get(todayStr).count;

    // 本周打卡数
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // 周一开始
    weekStart.setHours(0, 0, 0, 0);
    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const weekCheckins = db.prepare('SELECT COUNT(*) as count FROM checkins WHERE date >= ?').get(weekStartStr).count;

    // 最近打卡记录
    const recentCheckins = db.prepare(`
      SELECT c.*, t.name as task_name
      FROM checkins c
      LEFT JOIN tasks t ON c.task_id = t.id
      ORDER BY c.date DESC, c.created_at DESC
      LIMIT 5
    `).all();

    res.json({
      totalCheckins,
      totalTasks,
      streakDays,
      todayCheckins,
      weekCheckins,
      recentCheckins
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
