const express = require('express');
const { body, validationResult, query } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const db = require('../database/connection');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 配置头像上传
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/avatars');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
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
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB限制
});

// 获取成员列表（公开接口）
router.get('/', [
    query('category').optional().isIn(['faculty', 'postdoc', 'phd', 'master', 'undergraduate', 'alumni']).withMessage('分类参数无效'),
    query('status').optional().isIn(['active', 'inactive', 'alumni']).withMessage('状态参数无效')
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

        const category = req.query.category;
        const status = req.query.status || 'active';

        let whereClause = 'WHERE status = ?';
        let params = [status];

        if (category) {
            whereClause += ' AND category = ?';
            params.push(category);
        }

        const members = await db.query(
            `SELECT id, name, name_en, title, category, email, avatar, bio, research_interests, 
              homepage, google_scholar, orcid, join_date, graduation_date, sort_order
       FROM members ${whereClause} 
       ORDER BY sort_order DESC, join_date DESC`,
            params
        );

        // 按分类分组
        const groupedMembers = members.reduce((acc, member) => {
            if (!acc[member.category]) {
                acc[member.category] = [];
            }
            acc[member.category].push(member);
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                members,
                groupedMembers
            }
        });

    } catch (error) {
        console.error('获取成员列表错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 获取成员详情（公开接口）
router.get('/:id', async (req, res) => {
    try {
        const memberId = req.params.id;

        const members = await db.query(
            'SELECT * FROM members WHERE id = ? AND status IN ("active", "alumni")',
            [memberId]
        );

        if (members.length === 0) {
            return res.status(404).json({
                success: false,
                message: '成员不存在'
            });
        }

        res.json({
            success: true,
            data: members[0]
        });

    } catch (error) {
        console.error('获取成员详情错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 上传头像（管理员接口）
router.post('/upload-avatar', [
    authenticateToken,
    requireAdmin,
    upload.single('avatar')
], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '请选择要上传的头像文件'
            });
        }

        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        res.json({
            success: true,
            message: '头像上传成功',
            data: {
                avatar_url: avatarUrl
            }
        });

    } catch (error) {
        console.error('上传头像错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 创建成员（管理员接口）
router.post('/', [
    authenticateToken,
    requireAdmin,
    upload.single('avatar'),
    body('name').notEmpty().withMessage('姓名不能为空'),
    body('category').isIn(['faculty', 'postdoc', 'phd', 'master', 'undergraduate', 'alumni']).withMessage('成员类别无效'),
    body('email').optional().isEmail().withMessage('邮箱格式不正确')
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

        const {
            name, name_en, title, category, email, phone, office, bio,
            research_interests, education, homepage, google_scholar, orcid,
            join_date, graduation_date, sort_order = 0, status = 'active'
        } = req.body;

        const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : null;

        const result = await db.query(
            `INSERT INTO members (
        name, name_en, title, category, email, phone, office, avatar, bio,
        research_interests, education, homepage, google_scholar, orcid,
        join_date, graduation_date, sort_order, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name, name_en, title, category, email, phone, office, avatar, bio,
                research_interests, education, homepage, google_scholar, orcid,
                join_date, graduation_date, sort_order, status
            ]
        );

        res.json({
            success: true,
            message: '成员创建成功',
            data: {
                id: result.insertId,
                name,
                category
            }
        });

    } catch (error) {
        console.error('创建成员错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 更新成员（管理员接口）
router.put('/:id', [
    authenticateToken,
    requireAdmin,
    upload.single('avatar'),
    body('name').optional().notEmpty().withMessage('姓名不能为空'),
    body('category').optional().isIn(['faculty', 'postdoc', 'phd', 'master', 'undergraduate', 'alumni']).withMessage('成员类别无效'),
    body('email').optional().isEmail().withMessage('邮箱格式不正确')
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

        const memberId = req.params.id;
        const updates = { ...req.body };

        // 如果上传了新头像
        if (req.file) {
            updates.avatar = `/uploads/avatars/${req.file.filename}`;
        }

        // 构建更新SQL
        const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const updateValues = Object.values(updates);

        await db.query(
            `UPDATE members SET ${updateFields}, updated_at = NOW() WHERE id = ?`,
            [...updateValues, memberId]
        );

        res.json({
            success: true,
            message: '成员信息更新成功'
        });

    } catch (error) {
        console.error('更新成员错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 删除成员（管理员接口）
router.delete('/:id', [authenticateToken, requireAdmin], async (req, res) => {
    try {
        const memberId = req.params.id;

        // 获取成员信息以删除关联文件
        const [members] = await db.query('SELECT avatar FROM members WHERE id = ?', [memberId]);

        if (members.length === 0) {
            return res.status(404).json({
                success: false,
                message: '成员不存在'
            });
        }

        // 删除数据库记录
        await db.query('DELETE FROM members WHERE id = ?', [memberId]);

        // 删除关联的头像文件
        if (members[0].avatar) {
            const avatarPath = path.join(__dirname, '../', members[0].avatar);
            if (fs.existsSync(avatarPath)) {
                fs.unlinkSync(avatarPath);
            }
        }

        res.json({
            success: true,
            message: '成员删除成功'
        });

    } catch (error) {
        console.error('删除成员错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 获取管理员成员列表（包含所有状态）
router.get('/admin/list', [
    authenticateToken,
    requireAdmin,
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('category').optional().isIn(['faculty', 'postdoc', 'phd', 'master', 'undergraduate', 'alumni']).withMessage('分类参数无效'),
    query('status').optional().isIn(['active', 'inactive', 'alumni']).withMessage('状态参数无效')
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

        let whereClause = '';
        let params = [];

        const conditions = [];
        if (category) {
            conditions.push('category = ?');
            params.push(category);
        }
        if (status) {
            conditions.push('status = ?');
            params.push(status);
        }

        if (conditions.length > 0) {
            whereClause = 'WHERE ' + conditions.join(' AND ');
        }

        // 获取总数
        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM members ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        // 获取成员列表
        const members = await db.query(
            `SELECT * FROM members ${whereClause} 
       ORDER BY sort_order DESC, created_at DESC 
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
            [...params]
        );

        res.json({
            success: true,
            data: {
                members,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('获取管理员成员列表错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

module.exports = router;
