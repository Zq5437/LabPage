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
        const uploadPath = path.join(__dirname, '../uploads/research');
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
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('只允许上传图片文件！'));
        }
    }
});

// 获取研究方向列表 (公开)
router.get('/list', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status = 'active',
            search,
            sort = 'sort_order',
            order = 'DESC'
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        let whereClause = 'WHERE status = ?';
        const params = [status];

        // 搜索功能
        if (search) {
            whereClause += ' AND (name LIKE ? OR description LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        // 获取总数
        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM research_areas ${whereClause}`,
            params
        );

        const total = countResult && countResult[0] && countResult[0].total ? countResult[0].total : 0;

        // 获取研究方向列表
        const researchAreas = await db.query(
            `SELECT id, name as title, description, keywords, cover_image as image_url, sort_order,
                    created_at, updated_at 
             FROM research_areas ${whereClause} 
             ORDER BY ${sort} ${order} 
             LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
            [...params]
        );

        res.json({
            success: true,
            data: researchAreas || [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('获取研究方向列表错误:', error);
        res.status(500).json({
            success: false,
            message: '获取研究方向列表失败'
        });
    }
});

// 获取单个研究方向详情 (公开)
router.get('/:id', async (req, res) => {
    try {
        const areaId = req.params.id;

        const researchAreas = await db.query(
            'SELECT id, name as title, description, keywords, cover_image as image_url, status, sort_order, created_at, updated_at FROM research_areas WHERE id = ? AND status = "active"',
            [areaId]
        );

        if (!researchAreas || researchAreas.length === 0) {
            return res.status(404).json({
                success: false,
                message: '研究方向不存在'
            });
        }

        res.json({
            success: true,
            data: researchAreas[0]
        });
    } catch (error) {
        console.error('获取研究方向详情错误:', error);
        res.status(500).json({
            success: false,
            message: '获取研究方向详情失败'
        });
    }
});

// ============== 管理员接口 ==============

// 获取研究方向列表 (管理员)
router.get('/admin/list', verifyToken, verifyAdmin, async (req, res) => {
    try {
        // 安全的参数解析
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const search = req.query.search;
        const sort = req.query.sort || 'created_at';
        const order = (req.query.order || 'DESC').toUpperCase();

        // 参数验证
        page = Math.max(1, page);
        limit = Math.min(Math.max(1, limit), 100); // 限制最大100条
        const offset = (page - 1) * limit;

        // 验证排序字段
        const allowedSortFields = ['id', 'name', 'status', 'sort_order', 'created_at', 'updated_at'];
        const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
        const sortOrder = ['ASC', 'DESC'].includes(order) ? order : 'DESC';

        // 构建WHERE条件
        let whereClause = '';
        const params = [];
        const conditions = [];

        if (status && ['active', 'inactive'].includes(status)) {
            conditions.push('status = ?');
            params.push(status);
        }

        if (search && search.trim()) {
            conditions.push('(name LIKE ? OR description LIKE ?)');
            const searchTerm = `%${search.trim()}%`;
            params.push(searchTerm, searchTerm);
        }

        whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        console.log('研究方向查询参数:', {
            page, limit, offset, sortField, sortOrder,
            status, search, whereClause, params
        });

        // 获取总数
        const countSql = `SELECT COUNT(*) as total FROM research_areas ${whereClause}`;
        const countResult = await db.query(countSql, params);
        const total = (countResult && countResult[0] && countResult[0].total) ? parseInt(countResult[0].total) : 0;

        // 获取数据
        const dataSql = `SELECT id, name as title, description, keywords, cover_image as image_url, 
                               status, sort_order, created_at, updated_at 
                        FROM research_areas ${whereClause} 
                        ORDER BY ${sortField} ${sortOrder} 
                        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

        const dataParams = [...params];

        console.log('执行SQL:', dataSql);
        console.log('参数:', dataParams);

        const researchAreas = await db.query(dataSql, dataParams);

        res.json({
            success: true,
            data: researchAreas || [],
            pagination: {
                page: page,
                limit: limit,
                total: total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('获取研究方向列表错误:', error);
        res.status(500).json({
            success: false,
            message: '获取研究方向列表失败'
        });
    }
});

// 创建研究方向 (管理员)
router.post('/admin/create', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
    try {
        const {
            title, description, keywords, status = 'active', sort_order = 0
        } = req.body;

        // 验证必填字段
        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: '请填写标题和描述'
            });
        }

        let image_url = null;
        if (req.file) {
            image_url = `/uploads/research/${req.file.filename}`;
        }

        const result = await db.query(
            `INSERT INTO research_areas 
             (name, description, keywords, cover_image, status, sort_order, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [title, description, keywords || null, image_url, status, sort_order]
        );

        res.status(201).json({
            success: true,
            message: '研究方向创建成功',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('创建研究方向错误:', error);
        res.status(500).json({
            success: false,
            message: '创建研究方向失败'
        });
    }
});

// 更新研究方向 (管理员)
router.put('/admin/update/:id', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
    try {
        const areaId = req.params.id;
        const {
            title, description, keywords, status, sort_order
        } = req.body;

        // 检查研究方向是否存在
        const researchAreas = await db.query('SELECT id, name, description, keywords, cover_image as image_url, status, sort_order FROM research_areas WHERE id = ?', [areaId]);
        if (!researchAreas || researchAreas.length === 0) {
            return res.status(404).json({
                success: false,
                message: '研究方向不存在'
            });
        }

        const currentArea = researchAreas[0];
        let image_url = currentArea.image_url;

        // 处理图片上传
        if (req.file) {
            // 删除旧图片
            if (currentArea.image_url) {
                const oldImagePath = path.join(__dirname, '..', currentArea.image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            image_url = `/uploads/research/${req.file.filename}`;
        }

        await db.query(
            `UPDATE research_areas SET 
             name = ?, description = ?, keywords = ?, cover_image = ?,
             status = ?, sort_order = ?, updated_at = NOW()
             WHERE id = ?`,
            [title, description, keywords || null, image_url, status, sort_order, areaId]
        );

        res.json({
            success: true,
            message: '研究方向更新成功'
        });
    } catch (error) {
        console.error('更新研究方向错误:', error);
        res.status(500).json({
            success: false,
            message: '更新研究方向失败'
        });
    }
});

// 删除研究方向 (管理员)
router.delete('/admin/delete/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const areaId = req.params.id;

        // 获取研究方向信息以删除关联文件
        const researchAreas = await db.query('SELECT cover_image as image_url FROM research_areas WHERE id = ?', [areaId]);

        if (!researchAreas || researchAreas.length === 0) {
            return res.status(404).json({
                success: false,
                message: '研究方向不存在'
            });
        }

        const currentArea = researchAreas[0];

        // 删除关联图片
        if (currentArea.image_url) {
            const imagePath = path.join(__dirname, '..', currentArea.image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // 删除数据库记录
        await db.query('DELETE FROM research_areas WHERE id = ?', [areaId]);

        res.json({
            success: true,
            message: '研究方向删除成功'
        });
    } catch (error) {
        console.error('删除研究方向错误:', error);
        res.status(500).json({
            success: false,
            message: '删除研究方向失败'
        });
    }
});

module.exports = router;
