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
        const uploadPath = path.join(__dirname, '../uploads/publications');
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
        const allowedTypes = /pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('只允许上传 PDF、DOC、DOCX 格式的文件！'));
        }
    }
});

// 获取论文列表 (公开)
router.get('/list', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            year,
            search,
            sort = 'created_at',
            order = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        let whereClause = 'WHERE status = "published"';
        const params = [];

        // 分类筛选
        if (category) {
            whereClause += ' AND category = ?';
            params.push(category);
        }

        // 年份筛选
        if (year) {
            whereClause += ' AND YEAR(publish_date) = ?';
            params.push(year);
        }

        // 搜索功能
        if (search) {
            whereClause += ' AND (title LIKE ? OR authors LIKE ? OR journal LIKE ? OR keywords LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // 获取总数
        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM publications ${whereClause}`,
            params
        );

        const total = countResult && countResult[0] && countResult[0].total ? countResult[0].total : 0;

        // 获取论文列表
        const publications = await db.query(
            `SELECT id, title, authors, journal, publish_date, category, 
                    doi, pdf_url, abstract, keywords, citation_count, impact_factor,
                    created_at, updated_at 
             FROM publications ${whereClause} 
             ORDER BY ${sort} ${order} 
             LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
            [...params]
        );

        res.json({
            success: true,
            data: publications || [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('获取论文列表错误:', error);
        res.status(500).json({
            success: false,
            message: '获取论文列表失败'
        });
    }
});

// 获取单个论文详情 (公开)
router.get('/:id', async (req, res) => {
    try {
        const publicationId = req.params.id;

        const publications = await db.query(
            'SELECT * FROM publications WHERE id = ? AND status = "published"',
            [publicationId]
        );

        if (!publications || publications.length === 0) {
            return res.status(404).json({
                success: false,
                message: '论文不存在'
            });
        }

        res.json({
            success: true,
            data: publications[0]
        });
    } catch (error) {
        console.error('获取论文详情错误:', error);
        res.status(500).json({
            success: false,
            message: '获取论文详情失败'
        });
    }
});

// 获取论文分类统计 (公开)
router.get('/stats/categories', async (req, res) => {
    try {
        const stats = await db.query(
            `SELECT category, COUNT(*) as count 
             FROM publications 
             WHERE status = "published" 
             GROUP BY category 
             ORDER BY count DESC`
        );

        res.json({
            success: true,
            data: stats || []
        });
    } catch (error) {
        console.error('获取论文分类统计错误:', error);
        res.status(500).json({
            success: false,
            message: '获取统计数据失败'
        });
    }
});

// 获取年份统计 (公开)
router.get('/stats/years', async (req, res) => {
    try {
        const stats = await db.query(
            `SELECT YEAR(publish_date) as year, COUNT(*) as count 
             FROM publications 
             WHERE status = "published" 
             GROUP BY YEAR(publish_date) 
             ORDER BY year DESC`
        );

        res.json({
            success: true,
            data: stats || []
        });
    } catch (error) {
        console.error('获取论文年份统计错误:', error);
        res.status(500).json({
            success: false,
            message: '获取统计数据失败'
        });
    }
});

// ============== 管理员接口 ==============

// 获取论文列表 (管理员)
router.get('/admin/list', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            status,
            search,
            sort = 'created_at',
            order = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        let whereClause = 'WHERE 1=1';
        const params = [];

        // 状态筛选
        if (status) {
            whereClause += ' AND status = ?';
            params.push(status);
        }

        // 分类筛选
        if (category) {
            whereClause += ' AND category = ?';
            params.push(category);
        }

        // 搜索功能
        if (search) {
            whereClause += ' AND (title LIKE ? OR authors LIKE ? OR journal LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // 获取总数
        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM publications ${whereClause}`,
            params
        );

        const total = countResult && countResult[0] && countResult[0].total ? countResult[0].total : 0;

        // 获取论文列表
        const publications = await db.query(
            `SELECT * FROM publications ${whereClause} 
             ORDER BY ${sort} ${order} 
             LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
            [...params]
        );

        res.json({
            success: true,
            data: publications || [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('获取论文列表错误:', error);
        res.status(500).json({
            success: false,
            message: '获取论文列表失败'
        });
    }
});

// 创建论文 (管理员)
router.post('/admin/create', verifyToken, verifyAdmin, upload.single('pdf'), async (req, res) => {
    try {
        const {
            title, authors, journal, publish_date, category, doi,
            abstract, keywords, citation_count = 0, impact_factor,
            status = 'published'
        } = req.body;

        // 验证必填字段
        if (!title || !authors || !journal || !publish_date || !category) {
            return res.status(400).json({
                success: false,
                message: '请填写所有必填字段'
            });
        }

        let pdf_url = null;
        if (req.file) {
            pdf_url = `/uploads/publications/${req.file.filename}`;
        }

        const result = await db.query(
            `INSERT INTO publications 
             (title, authors, journal, publish_date, category, doi, pdf_url,
              abstract, keywords, citation_count, impact_factor, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [title, authors, journal, publish_date, category, doi, pdf_url,
                abstract, keywords, citation_count, impact_factor, status]
        );

        res.status(201).json({
            success: true,
            message: '论文创建成功',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('创建论文错误:', error);
        res.status(500).json({
            success: false,
            message: '创建论文失败'
        });
    }
});

// 更新论文 (管理员)
router.put('/admin/update/:id', verifyToken, verifyAdmin, upload.single('pdf'), async (req, res) => {
    try {
        const publicationId = req.params.id;
        const {
            title, authors, journal, publish_date, category, doi,
            abstract, keywords, citation_count, impact_factor, status
        } = req.body;

        // 检查论文是否存在
        const publications = await db.query('SELECT * FROM publications WHERE id = ?', [publicationId]);
        if (!publications || publications.length === 0) {
            return res.status(404).json({
                success: false,
                message: '论文不存在'
            });
        }

        const publication = publications[0];
        let pdf_url = publication.pdf_url;

        // 处理文件上传
        if (req.file) {
            // 删除旧文件
            if (publication.pdf_url) {
                const oldFilePath = path.join(__dirname, '..', publication.pdf_url);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            pdf_url = `/uploads/publications/${req.file.filename}`;
        }

        await db.query(
            `UPDATE publications SET 
             title = ?, authors = ?, journal = ?, publish_date = ?, category = ?,
             doi = ?, pdf_url = ?, abstract = ?, keywords = ?, citation_count = ?,
             impact_factor = ?, status = ?, updated_at = NOW()
             WHERE id = ?`,
            [title, authors, journal, publish_date, category, doi, pdf_url,
                abstract, keywords, citation_count, impact_factor, status, publicationId]
        );

        res.json({
            success: true,
            message: '论文更新成功'
        });
    } catch (error) {
        console.error('更新论文错误:', error);
        res.status(500).json({
            success: false,
            message: '更新论文失败'
        });
    }
});

// 删除论文 (管理员)
router.delete('/admin/delete/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const publicationId = req.params.id;

        // 获取论文信息以删除关联文件
        const publications = await db.query('SELECT pdf_url FROM publications WHERE id = ?', [publicationId]);

        if (!publications || publications.length === 0) {
            return res.status(404).json({
                success: false,
                message: '论文不存在'
            });
        }

        const publication = publications[0];

        // 删除关联文件
        if (publication.pdf_url) {
            const filePath = path.join(__dirname, '..', publication.pdf_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // 删除数据库记录
        await db.query('DELETE FROM publications WHERE id = ?', [publicationId]);

        res.json({
            success: true,
            message: '论文删除成功'
        });
    } catch (error) {
        console.error('删除论文错误:', error);
        res.status(500).json({
            success: false,
            message: '删除论文失败'
        });
    }
});

// 批量删除论文 (管理员)
router.delete('/admin/batch-delete', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: '请提供要删除的论文ID'
            });
        }

        // 获取所有要删除的论文信息
        const placeholders = ids.map(() => '?').join(',');
        const publications = await db.query(
            `SELECT id, pdf_url FROM publications WHERE id IN (${placeholders})`,
            ids
        );

        // 删除关联文件
        if (publications && publications.length > 0) {
            publications.forEach(publication => {
                if (publication.pdf_url) {
                    const filePath = path.join(__dirname, '..', publication.pdf_url);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
            });
        }

        // 删除数据库记录
        await db.query(
            `DELETE FROM publications WHERE id IN (${placeholders})`,
            ids
        );

        res.json({
            success: true,
            message: `成功删除 ${ids.length} 篇论文`
        });
    } catch (error) {
        console.error('批量删除论文错误:', error);
        res.status(500).json({
            success: false,
            message: '批量删除失败'
        });
    }
});

// 更新论文状态 (管理员)
router.patch('/admin/status/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const publicationId = req.params.id;
        const { status } = req.body;

        if (!['draft', 'published', 'archived'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: '无效的状态值'
            });
        }

        await db.query(
            'UPDATE publications SET status = ?, updated_at = NOW() WHERE id = ?',
            [status, publicationId]
        );

        res.json({
            success: true,
            message: '状态更新成功'
        });
    } catch (error) {
        console.error('更新论文状态错误:', error);
        res.status(500).json({
            success: false,
            message: '更新状态失败'
        });
    }
});

// 获取论文分类列表 (管理员)
router.get('/admin/categories', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const categories = await db.query(
            `SELECT category, COUNT(*) as count 
             FROM publications 
             GROUP BY category 
             ORDER BY count DESC, category ASC`
        );

        res.json({
            success: true,
            data: categories || []
        });
    } catch (error) {
        console.error('获取论文分类错误:', error);
        res.status(500).json({
            success: false,
            message: '获取分类失败'
        });
    }
});

// 获取年份列表 (管理员)
router.get('/admin/years', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const years = await db.query(
            `SELECT YEAR(publish_date) as year, COUNT(*) as count 
             FROM publications 
             GROUP BY YEAR(publish_date) 
             ORDER BY year DESC`
        );

        res.json({
            success: true,
            data: years || []
        });
    } catch (error) {
        console.error('获取论文年份错误:', error);
        res.status(500).json({
            success: false,
            message: '获取年份失败'
        });
    }
});

module.exports = router;
