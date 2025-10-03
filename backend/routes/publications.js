const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads/publications');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'publication-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB限制
    }
});

// 获取论文列表（公开接口）
router.get('/list', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            category = '',
            year = '',
            sort = 'year',
            order = 'DESC'
        } = req.query;

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const offset = (pageNum - 1) * limitNum;
        let whereClause = '1=1';
        const params = [];

        // 搜索条件
        if (search) {
            whereClause += ` AND (title LIKE ? OR authors LIKE ? OR journal LIKE ? OR keywords LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // 分类筛选
        if (category) {
            whereClause += ` AND type = ?`;
            params.push(category);
        }

        // 年份筛选
        if (year) {
            whereClause += ` AND year = ?`;
            params.push(year);
        }

        // 构建排序
        const validSorts = ['year', 'citations', 'impact_factor', 'created_at', 'publish_date'];
        const validOrders = ['ASC', 'DESC'];
        let sortField = validSorts.includes(sort) ? sort : 'year';
        // 将publish_date映射为year字段
        if (sortField === 'publish_date') {
            sortField = 'year';
        }
        const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

        // 查询总数
        const countQuery = `SELECT COUNT(*) as total FROM publications WHERE ${whereClause}`;
        const countResult = await db.query(countQuery, params);
        const total = countResult[0].total;

        // 查询数据（将 LIMIT/OFFSET 以安全整数直接写入SQL，避免占位符导致错误）
        const dataQuery = `
      SELECT id, title, authors, member_ids, journal, volume, issue, pages, year, 
             year as publish_date, doi, url, pdf_path, abstract, keywords, 
             type, impact_factor, citations as citation_count, is_featured,
             created_at, updated_at
      FROM publications 
      WHERE ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT ${limitNum} OFFSET ${offset}
    `;

        const publications = await db.query(dataQuery, params);

        // 处理PDF路径
        publications.forEach(pub => {
            if (pub.pdf_path) {
                pub.pdf_url = `/uploads/publications/${path.basename(pub.pdf_path)}`;
            }
        });

        res.json({
            success: true,
            code: 200,
            message: 'success',
            data: publications,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: total,
                pages: Math.ceil(total / limitNum)
            }
        });

    } catch (error) {
        console.error('获取论文列表失败:', error);
        res.status(500).json({
            success: false,
            code: 500,
            message: '获取论文列表失败',
            error: error.message
        });
    }
});

// 获取论文统计信息（公开接口）
router.get('/stats/categories', async (req, res) => {
    try {
        const query = `
      SELECT type as category, COUNT(*) as count 
      FROM publications 
      GROUP BY type 
      ORDER BY count DESC
    `;

        const result = await db.query(query);

        res.json({
            success: true,
            code: 200,
            message: 'success',
            data: result
        });
    } catch (error) {
        console.error('获取分类统计失败:', error);
        res.status(500).json({
            success: false,
            code: 500,
            message: '获取分类统计失败',
            error: error.message
        });
    }
});

// 获取论文年份统计（公开接口）
router.get('/stats/years', async (req, res) => {
    try {
        const query = `
      SELECT year, COUNT(*) as count 
      FROM publications 
      GROUP BY year 
      ORDER BY year DESC
    `;

        const result = await db.query(query);

        res.json({
            success: true,
            code: 200,
            message: 'success',
            data: result
        });
    } catch (error) {
        console.error('获取年份统计失败:', error);
        res.status(500).json({
            success: false,
            code: 500,
            message: '获取年份统计失败',
            error: error.message
        });
    }
});

// 获取论文详情（公开接口）
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
      SELECT id, title, authors, member_ids, journal, volume, issue, pages, year, doi, url, 
             pdf_path, abstract, keywords, type, impact_factor, citations, is_featured,
             created_at, updated_at
      FROM publications 
      WHERE id = ?
    `;

        const result = await db.query(query, [id]);

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: '论文不存在'
            });
        }

        const publication = result[0];

        // 处理PDF路径
        if (publication.pdf_path) {
            publication.pdf_url = `/uploads/publications/${path.basename(publication.pdf_path)}`;
        }

        res.json({
            success: true,
            code: 200,
            message: 'success',
            data: publication
        });

    } catch (error) {
        console.error('获取论文详情失败:', error);
        res.status(500).json({
            success: false,
            code: 500,
            message: '获取论文详情失败',
            error: error.message
        });
    }
});

// ==================== 管理员接口 ====================

// 获取管理员论文列表
router.get('/admin/list', authenticateToken, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            type = '',
            year = '',
            sort = 'created_at',
            order = 'DESC'
        } = req.query;

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const offset = (pageNum - 1) * limitNum;
        let whereClause = '1=1';
        const params = [];

        // 搜索条件
        if (search) {
            whereClause += ` AND (title LIKE ? OR authors LIKE ? OR journal LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // 类型筛选
        if (type) {
            whereClause += ` AND type = ?`;
            params.push(type);
        }

        // 年份筛选
        if (year) {
            whereClause += ` AND year = ?`;
            params.push(year);
        }

        // 构建排序
        const validSorts = ['year', 'citations', 'impact_factor', 'created_at', 'updated_at'];
        const validOrders = ['ASC', 'DESC'];
        const sortField = validSorts.includes(sort) ? sort : 'created_at';
        const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

        // 查询总数
        const countQuery = `SELECT COUNT(*) as total FROM publications WHERE ${whereClause}`;
        const countResult = await db.query(countQuery, params);
        const total = countResult[0].total;

        // 查询数据（将 LIMIT/OFFSET 以安全整数直接写入SQL，避免占位符导致错误）
        const dataQuery = `
      SELECT * FROM publications 
      WHERE ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT ${limitNum} OFFSET ${offset}
    `;

        const publications = await db.query(dataQuery, params);

        res.json({
            success: true,
            code: 200,
            message: 'success',
            data: {
                list: publications,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: total,
                    pages: Math.ceil(total / limitNum)
                }
            }
        });

    } catch (error) {
        console.error('获取管理员论文列表失败:', error);
        res.status(500).json({
            success: false,
            code: 500,
            message: '获取管理员论文列表失败',
            error: error.message
        });
    }
});

// 创建论文
router.post('/admin/create', authenticateToken, upload.single('pdf_file'), async (req, res) => {
    try {
        const {
            title, authors, member_ids, journal, volume, issue, pages, year, doi, url,
            abstract, keywords, type, impact_factor, citations, is_featured
        } = req.body;

        // 验证必填字段
        if (!title || !authors || !year) {
            return res.status(400).json({
                success: false,
                code: 400,
                message: '标题、作者和年份为必填项'
            });
        }

        let pdf_path = null;
        if (req.file) {
            pdf_path = req.file.path;
        }

        // 处理 member_ids：确保是有效的 JSON
        let memberIdsValue = null;
        if (member_ids) {
            try {
                memberIdsValue = typeof member_ids === 'string' ? member_ids : JSON.stringify(member_ids);
            } catch (e) {
                memberIdsValue = null;
            }
        }

        const query = `
      INSERT INTO publications (
        title, authors, member_ids, journal, volume, issue, pages, year, doi, url,
        pdf_path, abstract, keywords, type, impact_factor, citations, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const values = [
            title, authors, memberIdsValue, journal || null, volume || null, issue || null,
            pages || null, year, doi || null, url || null, pdf_path,
            abstract || null, keywords || null, type || 'journal',
            impact_factor || null, citations || 0, is_featured === 'true' || is_featured === true
        ];

        const result = await db.query(query, values);

        res.json({
            success: true,
            code: 200,
            message: '论文创建成功',
            data: { id: result.insertId }
        });

    } catch (error) {
        console.error('创建论文失败:', error);

        // 如果有文件上传失败，删除已上传的文件
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            code: 500,
            message: '创建论文失败',
            error: error.message
        });
    }
});

// 更新论文
router.put('/admin/update/:id', authenticateToken, upload.single('pdf_file'), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title, authors, member_ids, journal, volume, issue, pages, year, doi, url,
            abstract, keywords, type, impact_factor, citations, is_featured
        } = req.body;

        // 验证必填字段
        if (!title || !authors || !year) {
            return res.status(400).json({
                success: false,
                code: 400,
                message: '标题、作者和年份为必填项'
            });
        }

        // 检查论文是否存在
        const checkQuery = 'SELECT * FROM publications WHERE id = ?';
        const existing = await db.query(checkQuery, [id]);

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: '论文不存在'
            });
        }

        let pdf_path = existing[0].pdf_path;

        // 如果有新文件上传
        if (req.file) {
            // 删除旧文件
            if (pdf_path && fs.existsSync(pdf_path)) {
                fs.unlinkSync(pdf_path);
            }
            pdf_path = req.file.path;
        }

        // 处理 member_ids：确保是有效的 JSON
        let memberIdsValue = null;
        if (member_ids) {
            try {
                memberIdsValue = typeof member_ids === 'string' ? member_ids : JSON.stringify(member_ids);
            } catch (e) {
                memberIdsValue = null;
            }
        }

        const updateQuery = `
      UPDATE publications SET 
        title = ?, authors = ?, member_ids = ?, journal = ?, volume = ?, issue = ?, 
        pages = ?, year = ?, doi = ?, url = ?, pdf_path = ?,
        abstract = ?, keywords = ?, type = ?, impact_factor = ?, 
        citations = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

        const values = [
            title, authors, memberIdsValue, journal || null, volume || null, issue || null,
            pages || null, year, doi || null, url || null, pdf_path,
            abstract || null, keywords || null, type || 'journal',
            impact_factor || null, citations || 0,
            is_featured === 'true' || is_featured === true, id
        ];

        await db.query(updateQuery, values);

        res.json({
            success: true,
            code: 200,
            message: '论文更新成功'
        });

    } catch (error) {
        console.error('更新论文失败:', error);

        // 如果有文件上传失败，删除已上传的文件
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            code: 500,
            message: '更新论文失败',
            error: error.message
        });
    }
});

// 删除论文
router.delete('/admin/delete/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // 检查论文是否存在
        const checkQuery = 'SELECT pdf_path FROM publications WHERE id = ?';
        const existing = await db.query(checkQuery, [id]);

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: '论文不存在'
            });
        }

        // 删除关联的PDF文件
        if (existing[0].pdf_path && fs.existsSync(existing[0].pdf_path)) {
            fs.unlinkSync(existing[0].pdf_path);
        }

        // 删除数据库记录
        const deleteQuery = 'DELETE FROM publications WHERE id = ?';
        await db.query(deleteQuery, [id]);

        res.json({
            success: true,
            code: 200,
            message: '论文删除成功'
        });

    } catch (error) {
        console.error('删除论文失败:', error);
        res.status(500).json({
            success: false,
            code: 500,
            message: '删除论文失败',
            error: error.message
        });
    }
});

// 批量删除论文
router.delete('/admin/batch-delete', authenticateToken, async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                code: 400,
                message: '请提供要删除的论文ID列表'
            });
        }

        // 获取要删除的论文信息（用于删除文件）
        const placeholders = ids.map(() => '?').join(',');
        const selectQuery = `SELECT id, pdf_path FROM publications WHERE id IN (${placeholders})`;
        const publications = await db.query(selectQuery, ids);

        // 删除关联的PDF文件
        publications.forEach(pub => {
            if (pub.pdf_path && fs.existsSync(pub.pdf_path)) {
                fs.unlinkSync(pub.pdf_path);
            }
        });

        // 删除数据库记录
        const deleteQuery = `DELETE FROM publications WHERE id IN (${placeholders})`;
        const result = await db.query(deleteQuery, ids);

        res.json({
            success: true,
            code: 200,
            message: `成功删除 ${result.affectedRows} 条论文记录`
        });

    } catch (error) {
        console.error('批量删除论文失败:', error);
        res.status(500).json({
            success: false,
            code: 500,
            message: '批量删除论文失败',
            error: error.message
        });
    }
});

// 获取论文统计数据
router.get('/admin/stats', authenticateToken, async (req, res) => {
    try {
        // 总论文数
        const totalQuery = 'SELECT COUNT(*) as total FROM publications';
        const totalResult = await db.query(totalQuery);
        const total = totalResult[0].total;

        // 按类型统计
        const typeQuery = `
      SELECT type, COUNT(*) as count 
      FROM publications 
      GROUP BY type 
      ORDER BY count DESC
    `;
        const typeStats = await db.query(typeQuery);

        // 按年份统计
        const yearQuery = `
      SELECT year, COUNT(*) as count 
      FROM publications 
      GROUP BY year 
      ORDER BY year DESC 
      LIMIT 10
    `;
        const yearStats = await db.query(yearQuery);

        // 总引用数
        const citationQuery = 'SELECT SUM(citations) as total_citations FROM publications';
        const citationResult = await db.query(citationQuery);
        const totalCitations = citationResult[0].total_citations || 0;

        // 重点论文数
        const featuredQuery = 'SELECT COUNT(*) as featured_count FROM publications WHERE is_featured = true';
        const featuredResult = await db.query(featuredQuery);
        const featuredCount = featuredResult[0].featured_count;

        res.json({
            success: true,
            code: 200,
            message: 'success',
            data: {
                total,
                totalCitations,
                featuredCount,
                typeStats,
                yearStats
            }
        });

    } catch (error) {
        console.error('获取论文统计失败:', error);
        res.status(500).json({
            success: false,
            code: 500,
            message: '获取论文统计失败',
            error: error.message
        });
    }
});

module.exports = router;