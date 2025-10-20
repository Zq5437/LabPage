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
        const uploadPath = path.join(__dirname, '../uploads/equipment');
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

// 获取设备列表 (公开)
router.get('/list', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            status = 'active',
            search,
            sort = 'sort_order',
            order = 'DESC'
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        let whereClause = 'WHERE status = ?';
        const params = [status];

        // 分类筛选
        if (category) {
            whereClause += ' AND category = ?';
            params.push(category);
        }

        // 搜索功能
        if (search) {
            whereClause += ' AND (name LIKE ? OR description LIKE ? OR specifications LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // 获取总数
        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM equipment ${whereClause}`,
            params
        );

        const total = countResult && countResult[0] && countResult[0].total ? countResult[0].total : 0;

        // 获取设备列表
        const equipment = await db.query(
            `SELECT id, name, category, model, manufacturer, description,
                    image_url, location, status, purchase_date, sort_order,
                    created_at, updated_at 
             FROM equipment ${whereClause} 
             ORDER BY ${sort} ${order} 
             LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
            [...params]
        );

        res.json({
            success: true,
            data: equipment || [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('获取设备列表错误:', error);
        res.status(500).json({
            success: false,
            message: '获取设备列表失败'
        });
    }
});

// 获取单个设备详情 (公开)
router.get('/:id', async (req, res) => {
    try {
        const equipmentId = req.params.id;

        const equipment = await db.query(
            'SELECT * FROM equipment WHERE id = ? AND status = "active"',
            [equipmentId]
        );

        if (!equipment || equipment.length === 0) {
            return res.status(404).json({
                success: false,
                message: '设备不存在'
            });
        }

        res.json({
            success: true,
            data: equipment[0]
        });
    } catch (error) {
        console.error('获取设备详情错误:', error);
        res.status(500).json({
            success: false,
            message: '获取设备详情失败'
        });
    }
});

// 获取设备分类统计 (公开)
router.get('/stats/categories', async (req, res) => {
    try {
        const stats = await db.query(
            `SELECT category, COUNT(*) as count 
             FROM equipment 
             WHERE status = "active" 
             GROUP BY category 
             ORDER BY count DESC`
        );

        res.json({
            success: true,
            data: stats || []
        });
    } catch (error) {
        console.error('获取设备分类统计错误:', error);
        res.status(500).json({
            success: false,
            message: '获取统计数据失败'
        });
    }
});

// ============== 管理员接口 ==============

// 获取设备列表 (管理员)
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

        const offset = (parseInt(page) - 1) * parseInt(limit);
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
            whereClause += ' AND (name LIKE ? OR description LIKE ? OR model LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // 排序字段白名单验证
        const allowedSortFields = ['id', 'name', 'category', 'manufacturer', 'location', 'purchase_date', 'status', 'created_at', 'updated_at'];
        const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        // 获取总数
        const countResult = await db.query(
            `SELECT COUNT(*) as total FROM equipment ${whereClause}`,
            params
        );

        const total = countResult && countResult[0] && countResult[0].total ? countResult[0].total : 0;

        // 获取设备列表
        const equipment = await db.query(
            `SELECT * FROM equipment ${whereClause} 
             ORDER BY ${sortField} ${sortOrder} 
             LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
            [...params]
        );

        res.json({
            success: true,
            data: equipment || [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('获取设备列表错误:', error);
        res.status(500).json({
            success: false,
            message: '获取设备列表失败'
        });
    }
});

// 创建设备 (管理员)
router.post('/admin/create', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
    try {
        const {
            name, category, model, manufacturer, description,
            specifications, location, purchase_date, price,
            contact_person, usage_notes, status = 'active',
            sort_order = 0
        } = req.body;

        // 验证必填字段
        if (!name || !category) {
            return res.status(400).json({
                success: false,
                message: '请填写设备名称和分类'
            });
        }

        let image_url = null;
        if (req.file) {
            image_url = `/uploads/equipment/${req.file.filename}`;
        }

        // 处理日期字段 - 空字符串转换为null
        const processedPurchaseDate = purchase_date && purchase_date.trim() !== '' ? purchase_date : null;
        // 处理价格字段 - 空字符串转换为null
        const processedPrice = price && price.toString().trim() !== '' ? parseFloat(price) : null;
        // 处理排序字段
        const processedSortOrder = sort_order ? parseInt(sort_order) : 0;

        const result = await db.query(
            `INSERT INTO equipment 
             (name, category, model, manufacturer, description, specifications,
              image_url, location, purchase_date, price, contact_person, 
              usage_notes, status, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, category, model || null, manufacturer || null, description || null, specifications || null,
                image_url, location || null, processedPurchaseDate, processedPrice, contact_person || null,
                usage_notes || null, status, processedSortOrder]
        );

        res.status(201).json({
            success: true,
            message: '设备创建成功',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('创建设备错误:', error);
        res.status(500).json({
            success: false,
            message: '创建设备失败'
        });
    }
});

// 更新设备 (管理员)
router.put('/admin/update/:id', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
    try {
        const equipmentId = req.params.id;
        const {
            name, category, model, manufacturer, description,
            specifications, location, purchase_date, price,
            contact_person, usage_notes, status, sort_order
        } = req.body;

        // 检查设备是否存在
        const equipment = await db.query('SELECT * FROM equipment WHERE id = ?', [equipmentId]);
        if (!equipment || equipment.length === 0) {
            return res.status(404).json({
                success: false,
                message: '设备不存在'
            });
        }

        const currentEquipment = equipment[0];
        let image_url = currentEquipment.image_url;

        // 处理图片上传
        if (req.file) {
            // 删除旧图片
            if (currentEquipment.image_url) {
                const oldImagePath = path.join(__dirname, '..', currentEquipment.image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            image_url = `/uploads/equipment/${req.file.filename}`;
        }

        // 处理日期字段 - 空字符串转换为null
        const processedPurchaseDate = purchase_date && purchase_date.trim() !== '' ? purchase_date : null;
        // 处理价格字段 - 空字符串转换为null
        const processedPrice = price && price.toString().trim() !== '' ? parseFloat(price) : null;
        // 处理排序字段
        const processedSortOrder = sort_order ? parseInt(sort_order) : 0;

        await db.query(
            `UPDATE equipment SET 
             name = ?, category = ?, model = ?, manufacturer = ?, description = ?,
             specifications = ?, image_url = ?, location = ?, purchase_date = ?,
             price = ?, contact_person = ?, usage_notes = ?, status = ?,
             sort_order = ?, updated_at = NOW()
             WHERE id = ?`,
            [name, category, model || null, manufacturer || null, description || null, specifications || null,
                image_url, location || null, processedPurchaseDate, processedPrice, contact_person || null,
                usage_notes || null, status, processedSortOrder, equipmentId]
        );

        res.json({
            success: true,
            message: '设备更新成功'
        });
    } catch (error) {
        console.error('更新设备错误:', error);
        res.status(500).json({
            success: false,
            message: '更新设备失败'
        });
    }
});

// 删除设备 (管理员)
router.delete('/admin/delete/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const equipmentId = req.params.id;

        // 获取设备信息以删除关联文件
        const equipment = await db.query('SELECT image_url FROM equipment WHERE id = ?', [equipmentId]);

        if (!equipment || equipment.length === 0) {
            return res.status(404).json({
                success: false,
                message: '设备不存在'
            });
        }

        const currentEquipment = equipment[0];

        // 删除关联图片
        if (currentEquipment.image_url) {
            const imagePath = path.join(__dirname, '..', currentEquipment.image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // 删除数据库记录
        await db.query('DELETE FROM equipment WHERE id = ?', [equipmentId]);

        res.json({
            success: true,
            message: '设备删除成功'
        });
    } catch (error) {
        console.error('删除设备错误:', error);
        res.status(500).json({
            success: false,
            message: '删除设备失败'
        });
    }
});

module.exports = router;
