const express = require('express');
const { body, validationResult, query } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const db = require('../database/connection');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/news');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'news-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('只允许上传图片文件'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB限制
});

// 获取新闻列表（公开接口）
router.get('/', [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('category').optional().isIn(['news', 'announcement', 'achievement', 'activity']).withMessage('分类参数无效'),
    query('status').optional().isIn(['draft', 'published', 'archived']).withMessage('状态参数无效')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '参数验证失败',
                errors: errors.array()
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const category = req.query.category;
        const status = req.query.status || 'published'; // 默认只显示已发布的

        let whereClause = 'WHERE status = ?';
        let params = [status];

        if (category) {
            whereClause += ' AND category = ?';
            params.push(category);
        }

        // 获取总数
        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM news ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        // 获取新闻列表
        const news = await db.query(
            `SELECT id, title, summary, author, cover_image, category, is_top, views, publish_time, created_at 
       FROM news ${whereClause} 
       ORDER BY is_top DESC, publish_time DESC 
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
            [...params]
        );

        res.json({
            success: true,
            data: {
                news,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('获取新闻列表错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 获取新闻详情（公开接口）
router.get('/:id', async (req, res) => {
    try {
        const newsId = req.params.id;

        // 获取新闻详情
        const news = await db.query(
            'SELECT * FROM news WHERE id = ? AND status = "published"',
            [newsId]
        );

        if (news.length === 0) {
            return res.status(404).json({
                success: false,
                message: '新闻不存在或未发布'
            });
        }

        // 增加浏览次数
        await db.query(
            'UPDATE news SET views = views + 1 WHERE id = ?',
            [newsId]
        );

        res.json({
            success: true,
            data: news[0]
        });

    } catch (error) {
        console.error('获取新闻详情错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 增加新闻浏览量（公开接口）
router.post('/:id/view', async (req, res) => {
    try {
        const newsId = req.params.id;

        // 增加浏览次数
        await db.query(
            'UPDATE news SET views = views + 1 WHERE id = ? AND status = "published"',
            [newsId]
        );

        res.json({
            success: true,
            message: '浏览量已更新'
        });

    } catch (error) {
        console.error('更新浏览量错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 获取新闻列表（管理员接口）
router.get('/admin/list', [
    authenticateToken,
    requireAdmin,
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('category').optional().isIn(['news', 'announcement', 'achievement', 'activity']).withMessage('分类参数无效'),
    query('status').optional().isIn(['draft', 'published', 'archived']).withMessage('状态参数无效')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '参数验证失败',
                errors: errors.array()
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const category = req.query.category;
        const status = req.query.status;
        const search = req.query.search;
        const sort = req.query.sort || 'created_at';
        const order = req.query.order || 'DESC';

        let whereClause = 'WHERE 1=1';
        let params = [];

        if (category) {
            whereClause += ' AND category = ?';
            params.push(category);
        }
        if (status) {
            whereClause += ' AND status = ?';
            params.push(status);
        }
        if (search) {
            whereClause += ' AND (title LIKE ? OR summary LIKE ? OR content LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // 获取总数
        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM news ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        // 获取新闻列表
        const news = await db.query(
            `SELECT * FROM news ${whereClause} 
       ORDER BY ${sort} ${order}
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
            [...params]
        );

        res.json({
            success: true,
            data: {
                news,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('获取管理员新闻列表错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 创建新闻（管理员接口）
router.post('/admin', [
    authenticateToken,
    requireAdmin,
    upload.single('cover_image'),
    body('title').notEmpty().withMessage('标题不能为空'),
    body('content').notEmpty().withMessage('内容不能为空'),
    body('category').isIn(['news', 'announcement', 'achievement', 'activity']).withMessage('分类无效'),
    body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('状态无效')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '输入验证失败',
                errors: errors.array()
            });
        }

        const { title, summary, content, author, category, status = 'draft', is_top = false } = req.body;
        const cover_image = req.file ? `/uploads/news/${req.file.filename}` : null;
        const publish_time = status === 'published' ? new Date() : null;

        // 确保is_top为布尔值
        const isTop = is_top ? 1 : 0;

        const result = await db.query(
            `INSERT INTO news (title, summary, content, author, cover_image, category, status, is_top, publish_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, summary, content, author, cover_image, category, status, isTop, publish_time]
        );

        res.json({
            success: true,
            message: '新闻创建成功',
            data: {
                id: result.insertId,
                title,
                category,
                status
            }
        });

    } catch (error) {
        console.error('创建新闻错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 上传封面图片（管理员接口）
router.post('/upload-cover', [
    authenticateToken,
    requireAdmin,
    upload.single('cover_image')
], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '请选择要上传的封面图片'
            });
        }

        const coverUrl = `/uploads/news/${req.file.filename}`;

        res.json({
            success: true,
            message: '封面上传成功',
            data: {
                cover_url: coverUrl
            }
        });

    } catch (error) {
        console.error('上传封面错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 更新新闻（管理员接口）
router.put('/admin/:id', [
    authenticateToken,
    requireAdmin,
    upload.single('cover_image'),
    body('title').optional().notEmpty().withMessage('标题不能为空'),
    body('content').optional().notEmpty().withMessage('内容不能为空'),
    body('category').optional().isIn(['news', 'announcement', 'achievement', 'activity']).withMessage('分类无效'),
    body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('状态无效')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '输入验证失败',
                errors: errors.array()
            });
        }

        const newsId = req.params.id;

        // 检查新闻是否存在
        const existingNews = await db.query('SELECT * FROM news WHERE id = ?', [newsId]);
        if (existingNews.length === 0) {
            return res.status(404).json({
                success: false,
                message: '新闻不存在'
            });
        }

        const { title, summary, content, author, category, status, is_top } = req.body;
        let cover_image = existingNews[0].cover_image;
        let publish_time = existingNews[0].publish_time;

        // 如果上传了新图片
        if (req.file) {
            cover_image = `/uploads/news/${req.file.filename}`;
        }

        // 如果状态改为发布且之前未发布，设置发布时间
        if (status === 'published' && existingNews[0].status !== 'published') {
            publish_time = new Date();
        }

        // 确保is_top为布尔值
        const isTop = is_top ? 1 : 0;

        await db.query(
            `UPDATE news SET 
             title = ?, summary = ?, content = ?, author = ?, 
             category = ?, status = ?, is_top = ?, cover_image = ?, 
             publish_time = ?, updated_at = NOW() 
             WHERE id = ?`,
            [title, summary, content, author, category, status, isTop, cover_image, publish_time, newsId]
        );

        res.json({
            success: true,
            message: '新闻更新成功'
        });

    } catch (error) {
        console.error('更新新闻错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 删除新闻（管理员接口）
router.delete('/admin/:id', [
    authenticateToken,
    requireAdmin
], async (req, res) => {
    try {
        const newsId = req.params.id;

        // 检查新闻是否存在
        const news = await db.query('SELECT * FROM news WHERE id = ?', [newsId]);
        if (news.length === 0) {
            return res.status(404).json({
                success: false,
                message: '新闻不存在'
            });
        }

        // 删除新闻
        await db.query('DELETE FROM news WHERE id = ?', [newsId]);

        res.json({
            success: true,
            message: '新闻删除成功'
        });

    } catch (error) {
        console.error('删除新闻错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 获取新闻详情（管理员接口）
router.get('/admin/:id', [
    authenticateToken,
    requireAdmin
], async (req, res) => {
    try {
        const newsId = req.params.id;
        const news = await db.query('SELECT * FROM news WHERE id = ?', [newsId]);

        if (news.length === 0) {
            return res.status(404).json({
                success: false,
                message: '新闻不存在'
            });
        }

        res.json({
            success: true,
            data: news[0]
        });

    } catch (error) {
        console.error('获取新闻详情错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

module.exports = router;
