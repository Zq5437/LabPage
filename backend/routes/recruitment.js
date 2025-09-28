const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const db = require('../database/connection');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// 文件上传配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/recruitment');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('只允许上传图片或文档文件！'));
        }
    }
});

// 获取招生信息列表 (公开)
router.get('/list', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            type,
            status = 'open',
            search,
            sort = 'created_at',
            order = 'DESC'
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        let whereClause = 'WHERE 1=1';
        const params = [];

        // 状态筛选
        if (status) {
            whereClause += ' AND status = ?';
            params.push(status);
        }

        // 类型筛选
        if (type) {
            whereClause += ' AND type = ?';
            params.push(type);
        }

        // 搜索功能
        if (search) {
            whereClause += ' AND (title LIKE ? OR description LIKE ? OR requirements LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // 获取总数
        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM recruitment ${whereClause}`,
            params
        );

        const total = countResult && countResult[0] && countResult[0].total ? countResult[0].total : 0;

        // 获取招生信息列表
        const recruitment = await db.query(
            `SELECT id, title, type, positions, description, requirements,
                    contact_info, deadline, status, is_featured,
                    created_at, updated_at 
             FROM recruitment ${whereClause} 
             ORDER BY ${sort} ${order} 
             LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
            [...params]
        );

        res.json({
            success: true,
            data: recruitment || [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('获取招生信息列表错误:', error);
        res.status(500).json({
            success: false,
            message: '获取招生信息列表失败'
        });
    }
});

// 获取单个招生信息详情 (公开)
router.get('/:id', async (req, res) => {
    try {
        const recruitmentId = req.params.id;

        const recruitment = await db.query(
            'SELECT * FROM recruitment WHERE id = ? AND status = "active"',
            [recruitmentId]
        );

        if (!recruitment || recruitment.length === 0) {
            return res.status(404).json({
                success: false,
                message: '招生信息不存在'
            });
        }

        res.json({
            success: true,
            data: recruitment[0]
        });
    } catch (error) {
        console.error('获取招生信息详情错误:', error);
        res.status(500).json({
            success: false,
            message: '获取招生信息详情失败'
        });
    }
});

// 获取招生类型统计 (公开)
router.get('/stats/types', async (req, res) => {
    try {
        const stats = await db.query(
            `SELECT type, COUNT(*) as count 
             FROM recruitment 
             WHERE status = "active" 
             GROUP BY type 
             ORDER BY count DESC`
        );

        res.json({
            success: true,
            data: stats || []
        });
    } catch (error) {
        console.error('获取招生类型统计错误:', error);
        res.status(500).json({
            success: false,
            message: '获取统计数据失败'
        });
    }
});

// ============== 管理员接口 ==============

// 获取招生信息列表 (管理员)
router.get('/admin/list', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            type,
            status,
            search,
            sort = 'created_at',
            order = 'DESC'
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        let whereClause = 'WHERE 1=1';
        const params = [];

        // 状态筛选
        if (status) {
            whereClause += ' AND status = ?';
            params.push(status);
        }

        // 类型筛选
        if (type) {
            whereClause += ' AND type = ?';
            params.push(type);
        }

        // 搜索功能
        if (search) {
            whereClause += ' AND (title LIKE ? OR description LIKE ? OR requirements LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // 获取总数
        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM recruitment ${whereClause}`,
            params
        );

        const total = countResult && countResult[0] && countResult[0].total ? countResult[0].total : 0;

        // 获取招生信息列表
        const recruitment = await db.query(
            `SELECT * FROM recruitment ${whereClause} 
             ORDER BY ${sort} ${order} 
             LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
            [...params]
        );

        res.json({
            success: true,
            data: recruitment || [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('获取招生信息列表错误:', error);
        res.status(500).json({
            success: false,
            message: '获取招生信息列表失败'
        });
    }
});

// 创建招生信息 (管理员)
router.post('/admin/create', verifyToken, verifyAdmin, upload.single('attachment'), async (req, res) => {
    try {
        const {
            title, type, description, requirements, benefits,
            contact_info, deadline, status = 'active'
        } = req.body;

        // 验证必填字段
        if (!title || !type || !description) {
            return res.status(400).json({
                success: false,
                message: '请填写标题、类型和描述'
            });
        }

        let attachment_url = null;
        if (req.file) {
            attachment_url = `/uploads/recruitment/${req.file.filename}`;
        }

        const result = await db.query(
            `INSERT INTO recruitment 
             (title, type, description, requirements, benefits, contact_info,
              deadline, attachment_url, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [title, type, description, requirements, benefits, contact_info,
                deadline, attachment_url, status]
        );

        res.status(201).json({
            success: true,
            message: '招生信息创建成功',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('创建招生信息错误:', error);
        res.status(500).json({
            success: false,
            message: '创建招生信息失败'
        });
    }
});

// 更新招生信息 (管理员)
router.put('/admin/update/:id', verifyToken, verifyAdmin, upload.single('attachment'), async (req, res) => {
    try {
        const recruitmentId = req.params.id;
        const {
            title, type, description, requirements, benefits,
            contact_info, deadline, status
        } = req.body;

        // 检查招生信息是否存在
        const recruitment = await db.query('SELECT * FROM recruitment WHERE id = ?', [recruitmentId]);
        if (!recruitment || recruitment.length === 0) {
            return res.status(404).json({
                success: false,
                message: '招生信息不存在'
            });
        }

        const currentRecruitment = recruitment[0];
        let attachment_url = currentRecruitment.attachment_url;

        // 处理附件上传
        if (req.file) {
            // 删除旧附件
            if (currentRecruitment.attachment_url) {
                const oldFilePath = path.join(__dirname, '..', currentRecruitment.attachment_url);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            attachment_url = `/uploads/recruitment/${req.file.filename}`;
        }

        await db.query(
            `UPDATE recruitment SET 
             title = ?, type = ?, description = ?, requirements = ?, benefits = ?,
             contact_info = ?, deadline = ?, attachment_url = ?, status = ?, updated_at = NOW()
             WHERE id = ?`,
            [title, type, description, requirements, benefits, contact_info,
                deadline, attachment_url, status, recruitmentId]
        );

        res.json({
            success: true,
            message: '招生信息更新成功'
        });
    } catch (error) {
        console.error('更新招生信息错误:', error);
        res.status(500).json({
            success: false,
            message: '更新招生信息失败'
        });
    }
});

// 删除招生信息 (管理员)
router.delete('/admin/delete/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const recruitmentId = req.params.id;

        // 获取招生信息以删除关联文件
        const recruitment = await db.query('SELECT attachment_url FROM recruitment WHERE id = ?', [recruitmentId]);

        if (!recruitment || recruitment.length === 0) {
            return res.status(404).json({
                success: false,
                message: '招生信息不存在'
            });
        }

        const currentRecruitment = recruitment[0];

        // 删除关联附件
        if (currentRecruitment.attachment_url) {
            const filePath = path.join(__dirname, '..', currentRecruitment.attachment_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // 删除数据库记录
        await db.query('DELETE FROM recruitment WHERE id = ?', [recruitmentId]);

        res.json({
            success: true,
            message: '招生信息删除成功'
        });
    } catch (error) {
        console.error('删除招生信息错误:', error);
        res.status(500).json({
            success: false,
            message: '删除招生信息失败'
        });
    }
});

// ==================== 管理员接口 ====================

// 获取招生信息列表（管理员）
router.get('/admin/list', [
    verifyToken,
    verifyAdmin
], async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            type,
            status,
            search,
            sort = 'created_at',
            order = 'DESC'
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        let whereClause = 'WHERE 1=1';
        const params = [];

        // 类型筛选
        if (type) {
            whereClause += ' AND type = ?';
            params.push(type);
        }

        // 状态筛选
        if (status) {
            whereClause += ' AND status = ?';
            params.push(status);
        }

        // 搜索功能
        if (search) {
            whereClause += ' AND (title LIKE ? OR description LIKE ? OR requirements LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // 获取总数
        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM recruitment ${whereClause}`,
            params
        );

        const total = countResult && countResult[0] && countResult[0].total ? countResult[0].total : 0;

        // 获取招生信息列表
        const recruitment = await db.query(
            `SELECT id, title, type, positions, description, requirements,
                    contact_info, deadline, status, is_featured,
                    created_at, updated_at 
             FROM recruitment ${whereClause} 
             ORDER BY ${sort} ${order} 
             LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
            [...params]
        );

        res.json({
            success: true,
            data: recruitment || [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('获取管理员招生信息列表错误:', error);
        res.status(500).json({
            success: false,
            message: '获取招生信息列表失败'
        });
    }
});

// 获取单个招生信息详情（管理员）
router.get('/admin/:id', [
    verifyToken,
    verifyAdmin
], async (req, res) => {
    try {
        const recruitmentId = req.params.id;

        const recruitment = await db.query(
            'SELECT * FROM recruitment WHERE id = ?',
            [recruitmentId]
        );

        if (recruitment.length === 0) {
            return res.status(404).json({
                success: false,
                message: '招生信息不存在'
            });
        }

        res.json({
            success: true,
            data: recruitment[0]
        });

    } catch (error) {
        console.error('获取招生信息详情错误:', error);
        res.status(500).json({
            success: false,
            message: '获取招生信息详情失败'
        });
    }
});

// 创建招生信息（管理员）
router.post('/admin', [
    verifyToken,
    verifyAdmin,
    upload.single('attachment')
], async (req, res) => {
    try {
        const {
            title, type, positions, description, requirements,
            contact_info, deadline, status = 'open', is_featured = 0
        } = req.body;

        // 处理附件
        let attachment_url = null;
        if (req.file) {
            attachment_url = `/uploads/recruitment/${req.file.filename}`;
        }

        const result = await db.query(
            `INSERT INTO recruitment (
                title, type, positions, description, requirements,
                contact_info, deadline, status, is_featured
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title, type, parseInt(positions) || 1, description, requirements,
                contact_info, deadline, status, is_featured ? 1 : 0
            ]
        );

        res.json({
            success: true,
            message: '招生信息创建成功',
            data: {
                id: result.insertId,
                title,
                type,
                status
            }
        });

    } catch (error) {
        console.error('创建招生信息错误:', error);
        res.status(500).json({
            success: false,
            message: '创建招生信息失败'
        });
    }
});

// 更新招生信息（管理员）
router.put('/admin/:id', [
    verifyToken,
    verifyAdmin,
    upload.single('attachment')
], async (req, res) => {
    try {
        const recruitmentId = req.params.id;

        // 检查招生信息是否存在
        const existingRecruitment = await db.query('SELECT * FROM recruitment WHERE id = ?', [recruitmentId]);
        if (existingRecruitment.length === 0) {
            return res.status(404).json({
                success: false,
                message: '招生信息不存在'
            });
        }

        const {
            title, type, positions, description, requirements,
            contact_info, deadline, status, is_featured
        } = req.body;

        // 处理附件
        let attachment_url = existingRecruitment[0].attachment_url;
        if (req.file) {
            attachment_url = `/uploads/recruitment/${req.file.filename}`;
        }

        await db.query(
            `UPDATE recruitment SET 
             title = ?, type = ?, positions = ?, description = ?, requirements = ?,
             contact_info = ?, deadline = ?, status = ?, is_featured = ?, 
             updated_at = NOW() 
             WHERE id = ?`,
            [
                title, type, parseInt(positions) || 1, description, requirements,
                contact_info, deadline, status, is_featured ? 1 : 0, recruitmentId
            ]
        );

        res.json({
            success: true,
            message: '招生信息更新成功'
        });

    } catch (error) {
        console.error('更新招生信息错误:', error);
        res.status(500).json({
            success: false,
            message: '更新招生信息失败'
        });
    }
});

// 删除招生信息（管理员）
router.delete('/admin/:id', [
    verifyToken,
    verifyAdmin
], async (req, res) => {
    try {
        const recruitmentId = req.params.id;

        // 检查招生信息是否存在
        const existingRecruitment = await db.query('SELECT * FROM recruitment WHERE id = ?', [recruitmentId]);
        if (existingRecruitment.length === 0) {
            return res.status(404).json({
                success: false,
                message: '招生信息不存在'
            });
        }

        await db.query('DELETE FROM recruitment WHERE id = ?', [recruitmentId]);

        res.json({
            success: true,
            message: '招生信息删除成功'
        });

    } catch (error) {
        console.error('删除招生信息错误:', error);
        res.status(500).json({
            success: false,
            message: '删除招生信息失败'
        });
    }
});

module.exports = router;
