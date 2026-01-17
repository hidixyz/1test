import { Router } from 'express';
import db from '../db.js';

const router = Router();

// 获取打卡记录
router.get('/', (req, res) => {
  try {
    const { date, month } = req.query;
    let sql = `
      SELECT c.*, t.name as task_name
      FROM checkins c
      LEFT JOIN tasks t ON c.task_id = t.id
    `;
    const params = [];

    if (date) {
      sql += ' WHERE c.date = ?';
      params.push(date);
    } else if (month) {
      sql += ' WHERE c.date LIKE ?';
      params.push(`${month}%`);
    }

    sql += ' ORDER BY c.date DESC, c.created_at DESC';

    const checkins = db.prepare(sql).all(...params);
    res.json(checkins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单条打卡记录
router.get('/:id', (req, res) => {
  try {
    const checkin = db.prepare(`
      SELECT c.*, t.name as task_name
      FROM checkins c
      LEFT JOIN tasks t ON c.task_id = t.id
      WHERE c.id = ?
    `).get(req.params.id);
    if (!checkin) {
      return res.status(404).json({ error: '记录不存在' });
    }
    res.json(checkin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 新增打卡记录
router.post('/', (req, res) => {
  try {
    const { task_id, date, time, note } = req.body;
    if (!task_id || !date) {
      return res.status(400).json({ error: '任务ID和日期不能为空' });
    }

    // 检查任务是否存在
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(task_id);
    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    // 检查是否已经打卡
    const existing = db.prepare('SELECT * FROM checkins WHERE task_id = ? AND date = ?').get(task_id, date);
    if (existing) {
      return res.status(400).json({ error: '该任务今日已打卡' });
    }

    const currentTime = time || new Date().toTimeString().slice(0, 5);
    const result = db.prepare('INSERT INTO checkins (task_id, date, time, note) VALUES (?, ?, ?, ?)').run(
      task_id,
      date,
      currentTime,
      note || ''
    );

    const checkin = db.prepare(`
      SELECT c.*, t.name as task_name
      FROM checkins c
      LEFT JOIN tasks t ON c.task_id = t.id
      WHERE c.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(checkin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除打卡记录
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM checkins WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: '记录不存在' });
    }
    db.prepare('DELETE FROM checkins WHERE id = ?').run(req.params.id);
    res.json({ message: '记录已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
