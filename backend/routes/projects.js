const express = require('express');
const { body, validationResult, query } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const db = require('../database/connection');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 配置项目文件上传
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/projects');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'project-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

        if (extname) {
            return cb(null, true);
        } else {
            cb(new Error('只允许上传图片和文档文件'));
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB限制
});

// 获取项目列表（公开接口）
router.get('/', [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('category').optional().isIn(['national', 'provincial', 'institutional', 'enterprise', 'international']).withMessage('分类参数无效'),
    query('status').optional().isIn(['ongoing', 'completed', 'suspended']).withMessage('状态参数无效')
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
            `SELECT COUNT(*) as total FROM projects ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        // 获取项目列表
        const projects = await db.query(
            `SELECT id, title, title_en, description, category, funding_agency, funding_amount,
              principal_investigator, participants, start_date, end_date, status, cover_image
       FROM projects ${whereClause} 
       ORDER BY start_date DESC 
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
            [...params]
        );

        res.json({
            success: true,
            data: {
                projects,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('获取项目列表错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 获取项目详情（公开接口）
router.get('/:id', async (req, res) => {
    try {
        const projectId = req.params.id;

        const projects = await db.query(
            'SELECT * FROM projects WHERE id = ?',
            [projectId]
        );

        if (projects.length === 0) {
            return res.status(404).json({
                success: false,
                message: '项目不存在'
            });
        }

        // 解析JSON字段
        const project = projects[0];
        if (project.attachments) {
            try {
                project.attachments = JSON.parse(project.attachments);
            } catch (e) {
                project.attachments = [];
            }
        }

        res.json({
            success: true,
            data: project
        });

    } catch (error) {
        console.error('获取项目详情错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 创建项目（管理员接口）
router.post('/', [
    authenticateToken,
    requireAdmin,
    upload.fields([
        { name: 'cover_image', maxCount: 1 },
        { name: 'attachments', maxCount: 5 }
    ]),
    body('title').notEmpty().withMessage('项目标题不能为空'),
    body('category').optional().isIn(['national', 'provincial', 'institutional', 'enterprise', 'international']).withMessage('项目类别无效'),
    body('status').optional().isIn(['ongoing', 'completed', 'suspended']).withMessage('项目状态无效')
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
            title, title_en, description, category, funding_agency, funding_amount,
            principal_investigator, participants, start_date, end_date, status = 'ongoing'
        } = req.body;

        let cover_image = null;
        let attachments = [];

        // 处理封面图片
        if (req.files && req.files.cover_image) {
            cover_image = `/uploads/projects/${req.files.cover_image[0].filename}`;
        }

        // 处理附件
        if (req.files && req.files.attachments) {
            attachments = req.files.attachments.map(file => ({
                filename: file.originalname,
                path: `/uploads/projects/${file.filename}`,
                size: file.size
            }));
        }

        const result = await db.query(
            `INSERT INTO projects (
        title, title_en, description, category, funding_agency, funding_amount,
        principal_investigator, participants, start_date, end_date, status, 
        cover_image, attachments
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title, title_en, description, category, funding_agency, funding_amount,
                principal_investigator, participants, start_date, end_date, status,
                cover_image, JSON.stringify(attachments)
            ]
        );

        res.json({
            success: true,
            message: '项目创建成功',
            data: {
                id: result.insertId,
                title,
                category,
                status
            }
        });

    } catch (error) {
        console.error('创建项目错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 更新项目（管理员接口）
router.put('/:id', [
    authenticateToken,
    requireAdmin,
    upload.fields([
        { name: 'cover_image', maxCount: 1 },
        { name: 'attachments', maxCount: 5 }
    ]),
    body('title').optional().notEmpty().withMessage('项目标题不能为空'),
    body('category').optional().isIn(['national', 'provincial', 'institutional', 'enterprise', 'international']).withMessage('项目类别无效'),
    body('status').optional().isIn(['ongoing', 'completed', 'suspended']).withMessage('项目状态无效')
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

        const projectId = req.params.id;
        const updates = { ...req.body };

        // 处理新上传的封面图片
        if (req.files && req.files.cover_image) {
            updates.cover_image = `/uploads/projects/${req.files.cover_image[0].filename}`;
        }

        // 处理新上传的附件
        if (req.files && req.files.attachments) {
            const newAttachments = req.files.attachments.map(file => ({
                filename: file.originalname,
                path: `/uploads/projects/${file.filename}`,
                size: file.size
            }));

            // 获取现有附件
            const [currentProject] = await db.query('SELECT attachments FROM projects WHERE id = ?', [projectId]);
            let existingAttachments = [];
            if (currentProject.length > 0 && currentProject[0].attachments) {
                try {
                    existingAttachments = JSON.parse(currentProject[0].attachments);
                } catch (e) {
                    existingAttachments = [];
                }
            }

            // 合并附件
            updates.attachments = JSON.stringify([...existingAttachments, ...newAttachments]);
        }

        // 构建更新SQL
        const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const updateValues = Object.values(updates);

        await db.query(
            `UPDATE projects SET ${updateFields}, updated_at = NOW() WHERE id = ?`,
            [...updateValues, projectId]
        );

        res.json({
            success: true,
            message: '项目更新成功'
        });

    } catch (error) {
        console.error('更新项目错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 删除项目（管理员接口）
router.delete('/:id', [authenticateToken, requireAdmin], async (req, res) => {
    try {
        const projectId = req.params.id;

        // 获取项目信息以删除关联文件
        const [projects] = await db.query('SELECT cover_image, attachments FROM projects WHERE id = ?', [projectId]);

        if (projects.length === 0) {
            return res.status(404).json({
                success: false,
                message: '项目不存在'
            });
        }

        const project = projects[0];

        // 删除数据库记录
        await db.query('DELETE FROM projects WHERE id = ?', [projectId]);

        // 删除关联的文件
        if (project.cover_image) {
            const imagePath = path.join(__dirname, '../', project.cover_image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // 删除附件
        if (project.attachments) {
            try {
                const attachments = JSON.parse(project.attachments);
                attachments.forEach(attachment => {
                    const filePath = path.join(__dirname, '../', attachment.path);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                });
            } catch (e) {
                console.error('删除附件时出错:', e);
            }
        }

        res.json({
            success: true,
            message: '项目删除成功'
        });

    } catch (error) {
        console.error('删除项目错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 获取管理员项目列表
router.get('/admin/list', [
    authenticateToken,
    requireAdmin,
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('category').optional().isIn(['national', 'provincial', 'institutional', 'enterprise', 'international']).withMessage('分类参数无效'),
    query('status').optional().isIn(['ongoing', 'completed', 'suspended']).withMessage('状态参数无效')
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
        const status = req.query.status;
        const sortParam = (req.query.sort || 'created_at');
        const orderParam = (req.query.order || 'DESC').toUpperCase();

        // 允许的排序字段白名单，防止SQL注入
        const allowedSortFields = [
            'id', 'title', 'category', 'principal_investigator', 'funding_amount', 'status', 'start_date', 'end_date', 'created_at', 'updated_at'
        ];
        const sortField = allowedSortFields.includes(sortParam) ? sortParam : 'created_at';
        const sortOrder = orderParam === 'ASC' ? 'ASC' : 'DESC';

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
            `SELECT COUNT(*) as total FROM projects ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        // 获取项目列表（支持排序）
        const projects = await db.query(
            `SELECT * FROM projects ${whereClause} 
       ORDER BY ${sortField} ${sortOrder}, id DESC 
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
            [...params]
        );

        // 解析JSON字段
        projects.forEach(project => {
            if (project.attachments) {
                try {
                    project.attachments = JSON.parse(project.attachments);
                } catch (e) {
                    project.attachments = [];
                }
            }
        });

        res.json({
            success: true,
            data: {
                projects,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('获取管理员项目列表错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 上传项目封面（管理员接口）
router.post('/upload-cover', [
    authenticateToken,
    requireAdmin,
    upload.single('cover_image')
], async (req, res) => {
    try {
        console.log('收到封面上传请求');
        console.log('Request file:', req.file);
        console.log('Request body:', req.body);

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '请选择要上传的封面图片文件'
            });
        }

        const coverUrl = `/uploads/projects/${req.file.filename}`;
        console.log('生成的封面URL:', coverUrl);

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
            message: '服务器内部错误: ' + error.message
        });
    }
});

// 创建项目（管理员接口）
router.post('/admin', [
    authenticateToken,
    requireAdmin,
    upload.single('cover_image'),
    body('title').notEmpty().withMessage('项目标题不能为空'),
    body('category').isIn(['national', 'provincial', 'institutional', 'enterprise', 'international']).withMessage('项目类别无效'),
    body('status').optional().isIn(['ongoing', 'completed', 'suspended']).withMessage('项目状态无效')
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
            title, title_en, description, category, funding_agency, funding_amount,
            principal_investigator, participants, start_date, end_date, status = 'ongoing',
            cover_image
        } = req.body;

        // 使用提交的封面图片URL，如果上传了新文件则优先使用新文件
        let finalCoverImage = cover_image || null;
        if (req.file) {
            finalCoverImage = `/uploads/projects/${req.file.filename}`;
        }

        console.log('创建项目 - 收到的封面URL:', cover_image);
        console.log('最终使用的封面URL:', finalCoverImage);

        const result = await db.query(
            `INSERT INTO projects (
                title, title_en, description, category, funding_agency, funding_amount,
                principal_investigator, participants, start_date, end_date, status, cover_image
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title, title_en, description, category, funding_agency, funding_amount,
                principal_investigator, participants, start_date, end_date, status, finalCoverImage
            ]
        );

        res.json({
            success: true,
            message: '项目创建成功',
            data: {
                id: result.insertId,
                title,
                category,
                status
            }
        });

    } catch (error) {
        console.error('创建项目错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 更新项目（管理员接口）
router.put('/admin/:id', [
    authenticateToken,
    requireAdmin,
    upload.single('cover_image'),
    body('title').optional().notEmpty().withMessage('项目标题不能为空'),
    body('category').optional().isIn(['national', 'provincial', 'institutional', 'enterprise', 'international']).withMessage('项目类别无效'),
    body('status').optional().isIn(['ongoing', 'completed', 'suspended']).withMessage('项目状态无效')
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

        const projectId = req.params.id;

        // 检查项目是否存在
        const existingProject = await db.query('SELECT * FROM projects WHERE id = ?', [projectId]);
        if (existingProject.length === 0) {
            return res.status(404).json({
                success: false,
                message: '项目不存在'
            });
        }

        const {
            title, title_en, description, category, funding_agency, funding_amount,
            principal_investigator, participants, start_date, end_date, status, cover_image
        } = req.body;

        // 使用提交的封面图片URL，如果没有则保持原有的
        let finalCoverImage = cover_image !== undefined ? cover_image : existingProject[0].cover_image;

        // 如果上传了新图片文件，优先使用新上传的
        if (req.file) {
            finalCoverImage = `/uploads/projects/${req.file.filename}`;
        }

        console.log('更新项目 - 收到的封面URL:', cover_image);
        console.log('最终使用的封面URL:', finalCoverImage);

        await db.query(
            `UPDATE projects SET 
             title = ?, title_en = ?, description = ?, category = ?, 
             funding_agency = ?, funding_amount = ?, principal_investigator = ?, 
             participants = ?, start_date = ?, end_date = ?, status = ?, 
             cover_image = ?, updated_at = NOW() 
             WHERE id = ?`,
            [
                title, title_en, description, category, funding_agency, funding_amount,
                principal_investigator, participants, start_date, end_date, status,
                finalCoverImage, projectId
            ]
        );

        res.json({
            success: true,
            message: '项目更新成功'
        });

    } catch (error) {
        console.error('更新项目错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 删除项目（管理员接口）
router.delete('/admin/:id', [
    authenticateToken,
    requireAdmin
], async (req, res) => {
    try {
        const projectId = req.params.id;

        // 检查项目是否存在
        const project = await db.query('SELECT * FROM projects WHERE id = ?', [projectId]);
        if (project.length === 0) {
            return res.status(404).json({
                success: false,
                message: '项目不存在'
            });
        }

        // 删除项目
        await db.query('DELETE FROM projects WHERE id = ?', [projectId]);

        res.json({
            success: true,
            message: '项目删除成功'
        });

    } catch (error) {
        console.error('删除项目错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 获取项目详情（管理员接口）
router.get('/admin/:id', [
    authenticateToken,
    requireAdmin
], async (req, res) => {
    try {
        const projectId = req.params.id;
        const project = await db.query('SELECT * FROM projects WHERE id = ?', [projectId]);

        if (project.length === 0) {
            return res.status(404).json({
                success: false,
                message: '项目不存在'
            });
        }

        res.json({
            success: true,
            data: project[0]
        });

    } catch (error) {
        console.error('获取项目详情错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

module.exports = router;
