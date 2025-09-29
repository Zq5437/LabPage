const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// 提交联系表单
router.post('/submit', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        // 验证必填字段
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: '请填写所有必填字段'
            });
        }

        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: '请输入正确的邮箱格式'
            });
        }

        // 验证留言长度
        if (message.length < 10) {
            return res.status(400).json({
                success: false,
                message: '留言内容至少需要10个字符'
            });
        }

        // 保存到数据库
        await db.query(
            `INSERT INTO contact_messages 
             (name, email, phone, subject, message, created_at) 
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [name, email, phone || null, subject, message]
        );

        console.log('收到新的联系留言:', { name, email, subject });

        res.json({
            success: true,
            message: '留言提交成功！我们会尽快回复您。'
        });

    } catch (error) {
        console.error('处理联系表单错误:', error);
        res.status(500).json({
            success: false,
            message: '提交失败，请稍后重试'
        });
    }
});

// 获取联系统计信息
router.get('/stats', async (req, res) => {
    try {
        const stats = await db.query(`
            SELECT 
                COUNT(*) as total_messages,
                COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_messages,
                COUNT(CASE WHEN WEEK(created_at) = WEEK(NOW()) THEN 1 END) as week_messages,
                COUNT(CASE WHEN MONTH(created_at) = MONTH(NOW()) THEN 1 END) as month_messages
            FROM contact_messages
        `);

        const subjectStats = await db.query(`
            SELECT 
                subject,
                COUNT(*) as count
            FROM contact_messages 
            GROUP BY subject 
            ORDER BY count DESC
        `);

        res.json({
            success: true,
            data: {
                overview: stats[0] || {
                    total_messages: 0,
                    today_messages: 0,
                    week_messages: 0,
                    month_messages: 0
                },
                by_subject: subjectStats || []
            }
        });

    } catch (error) {
        console.error('获取联系统计错误:', error);
        res.status(500).json({
            success: false,
            message: '获取统计信息失败'
        });
    }
});

// 获取联系留言列表（管理员）
router.get('/messages', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        console.log('查询参数:', { page, limit, offset });

        // 获取总数
        const countResult = await db.query('SELECT COUNT(*) as total FROM contact_messages');
        const total = countResult[0].total;

        // 获取列表数据  
        const messages = await db.query(
            `SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
        );

        res.json({
            success: true,
            data: messages,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('获取联系留言列表错误:', error);
        res.status(500).json({
            success: false,
            message: '获取留言列表失败'
        });
    }
});

// 标记留言为已读（管理员）
router.put('/messages/:id/read', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(
            'UPDATE contact_messages SET status = ?, updated_at = NOW() WHERE id = ?',
            ['read', id]
        );

        res.json({
            success: true,
            message: '已标记为已读'
        });

    } catch (error) {
        console.error('标记已读错误:', error);
        res.status(500).json({
            success: false,
            message: '标记已读失败'
        });
    }
});

// 回复留言（管理员）
router.put('/messages/:id/reply', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reply } = req.body;

        if (!reply || !reply.trim()) {
            return res.status(400).json({
                success: false,
                message: '请输入回复内容'
            });
        }

        await db.query(
            'UPDATE contact_messages SET status = ?, admin_reply = ?, updated_at = NOW() WHERE id = ?',
            ['replied', reply.trim(), id]
        );

        res.json({
            success: true,
            message: '回复发送成功'
        });

    } catch (error) {
        console.error('回复留言错误:', error);
        res.status(500).json({
            success: false,
            message: '回复留言失败'
        });
    }
});

// 删除留言（管理员）
router.delete('/messages/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        await db.query('DELETE FROM contact_messages WHERE id = ?', [id]);

        res.json({
            success: true,
            message: '删除成功'
        });

    } catch (error) {
        console.error('删除留言错误:', error);
        res.status(500).json({
            success: false,
            message: '删除留言失败'
        });
    }
});

module.exports = router;
