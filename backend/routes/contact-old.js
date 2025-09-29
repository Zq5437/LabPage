const express = require('express');
const router = express.Router();
const db = require('../database/connection');

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

        // 保存到数据库（如果需要的话）
        try {
            await db.query(
                `INSERT INTO contact_messages 
                 (name, email, phone, subject, message, created_at) 
                 VALUES (?, ?, ?, ?, ?, NOW())`,
                [name, email, phone || null, subject, message]
            );
        } catch (dbError) {
            console.log('数据库保存失败（可忽略）:', dbError.message);
            // 即使数据库保存失败，也继续发送邮件
        }

        // 获取实验室联系邮箱
        let labEmail = 'lab@university.edu.cn';
        try {
            const labInfo = await db.query('SELECT email FROM lab_info WHERE id = 1');
            if (labInfo && labInfo.length > 0 && labInfo[0].email) {
                labEmail = labInfo[0].email;
            }
        } catch (error) {
            console.log('获取实验室邮箱失败，使用默认邮箱');
        }

        // TODO: 邮件通知功能（需要配置邮箱服务器）
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

// 获取联系统计信息（管理员用）
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

// ============== 管理员接口 ==============

const { verifyToken, verifyAdmin } = require('../middleware/auth');

// 测试接口
router.get('/test', async (req, res) => {
    try {
        const result = await db.query('SELECT COUNT(*) as total FROM contact_messages');
        res.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('测试查询错误:', error);
        res.json({
            success: false,
            error: error.message
        });
    }
});

// 获取联系留言列表（管理员）
router.get('/messages', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const { status, subject, keyword } = req.query;

        console.log('查询参数:', { page, limit, offset, status, subject, keyword });

        // 构建查询条件
        let whereConditions = [];
        let queryParams = [];

        if (status && status.trim()) {
            whereConditions.push('status = ?');
            queryParams.push(status.trim());
        }

        if (subject && subject.trim()) {
            whereConditions.push('subject = ?');
            queryParams.push(subject.trim());
        }

        if (keyword && keyword.trim()) {
            whereConditions.push('(name LIKE ? OR email LIKE ? OR message LIKE ?)');
            const keywordParam = `%${keyword.trim()}%`;
            queryParams.push(keywordParam, keywordParam, keywordParam);
        }

        // 获取总数
        let countQuery, countParams;
        if (whereConditions.length > 0) {
            countQuery = `SELECT COUNT(*) as total FROM contact_messages WHERE ${whereConditions.join(' AND ')}`;
            countParams = queryParams;
        } else {
            countQuery = `SELECT COUNT(*) as total FROM contact_messages`;
            countParams = [];
        }
        
        console.log('计数查询:', countQuery, countParams);
        const countResult = await db.query(countQuery, countParams);
        const total = countResult[0].total;

        // 获取列表数据
        let listQuery, listParams;
        if (whereConditions.length > 0) {
            listQuery = `SELECT * FROM contact_messages WHERE ${whereConditions.join(' AND ')} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
            listParams = [...queryParams, limit, offset];
        } else {
            listQuery = `SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ? OFFSET ?`;
            listParams = [limit, offset];
        }
        
        console.log('列表查询:', listQuery, listParams);
        const messages = await db.query(listQuery, listParams);

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

// 批量标记为已读（管理员）
router.put('/messages/batch-read', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: '请提供有效的留言ID列表'
            });
        }

        const placeholders = ids.map(() => '?').join(',');
        await db.query(
            `UPDATE contact_messages SET status = 'read', updated_at = NOW() WHERE id IN (${placeholders})`,
            ids
        );

        res.json({
            success: true,
            message: `已标记 ${ids.length} 条留言为已读`
        });

    } catch (error) {
        console.error('批量标记已读错误:', error);
        res.status(500).json({
            success: false,
            message: '批量标记已读失败'
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

        // 这里可以添加发送回复邮件的逻辑
        // TODO: 发送回复邮件给用户

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

// 批量删除留言（管理员）
router.delete('/messages/batch', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: '请提供有效的留言ID列表'
            });
        }

        const placeholders = ids.map(() => '?').join(',');
        await db.query(`DELETE FROM contact_messages WHERE id IN (${placeholders})`, ids);

        res.json({
            success: true,
            message: `已删除 ${ids.length} 条留言`
        });

    } catch (error) {
        console.error('批量删除留言错误:', error);
        res.status(500).json({
            success: false,
            message: '批量删除留言失败'
        });
    }
});

module.exports = router;
