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
        const uploadPath = path.join(__dirname, '../uploads/lab');
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

// 获取实验室信息 (公开)
router.get('/', async (req, res) => {
    try {
        const labInfo = await db.query(
            'SELECT * FROM lab_info WHERE id = 1'
        );

        if (!labInfo || labInfo.length === 0) {
            return res.json({
                success: true,
                data: {
                    name: '智能计算实验室',
                    name_en: 'Intelligent Computing Lab',
                    description: '专注于人工智能、机器学习等前沿技术研究',
                    address: '某某大学某某楼',
                    phone: '010-12345678',
                    email: 'lab@university.edu.cn',
                    website: 'https://lab.university.edu.cn',
                    established_year: new Date().getFullYear(),
                    director: '张教授',
                    introduction: '',
                    logo: null,
                    banner: null
                }
            });
        }

        res.json({
            success: true,
            data: labInfo[0]
        });
    } catch (error) {
        console.error('获取实验室信息错误:', error);
        res.status(500).json({
            success: false,
            message: '获取实验室信息失败'
        });
    }
});

// ============== 管理员接口 ==============

// 更新实验室信息 (管理员)
router.put('/admin/update', verifyToken, verifyAdmin, upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), async (req, res) => {
    try {
        const {
            name, name_en, description, address, phone, email,
            website, director
        } = req.body;
        const established_year = req.body.established_year || req.body.founded_year || null;
        const introduction = req.body.introduction || null;

        // 确保 introduction 字段存在（若数据库已添加会抛出重复字段错误，忽略即可）
        try {
            await db.query('ALTER TABLE lab_info ADD COLUMN introduction TEXT NULL');
        } catch (e) {
            // ER_DUP_FIELDNAME 重复字段，说明已存在，忽略
        }

        // 验证必填字段
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: '请填写实验室名称和描述'
            });
        }

        // 检查是否已存在记录
        const existingInfo = await db.query('SELECT * FROM lab_info WHERE id = 1');

        let logo_url = null;
        let banner_url = null;

        if (existingInfo && existingInfo.length > 0) {
            logo_url = existingInfo[0].logo;
            banner_url = existingInfo[0].banner;
        }

        // 处理文件上传
        if (req.files) {
            if (req.files.logo && req.files.logo[0]) {
                // 删除旧logo
                if (logo_url) {
                    const oldLogoPath = path.join(__dirname, '..', logo_url);
                    if (fs.existsSync(oldLogoPath)) {
                        fs.unlinkSync(oldLogoPath);
                    }
                }
                logo_url = `/uploads/lab/${req.files.logo[0].filename}`;
            }

            if (req.files.banner && req.files.banner[0]) {
                // 删除旧banner
                if (banner_url) {
                    const oldBannerPath = path.join(__dirname, '..', banner_url);
                    if (fs.existsSync(oldBannerPath)) {
                        fs.unlinkSync(oldBannerPath);
                    }
                }
                banner_url = `/uploads/lab/${req.files.banner[0].filename}`;
            }
        }

        if (existingInfo && existingInfo.length > 0) {
            // 更新现有记录（与当前数据库字段对齐）
            await db.query(
                `UPDATE lab_info SET 
                 name = ?, name_en = ?, description = ?, address = ?, phone = ?,
                 email = ?, website = ?, established_year = ?, director = ?,
                 introduction = ?, logo = ?, banner = ?, updated_at = NOW()
                 WHERE id = 1`,
                [name || null, name_en || null, description || null, address || null, phone || null,
                email || null, website || null, established_year || null, director || null,
                introduction || null, logo_url || null, banner_url || null]
            );
        } else {
            // 创建新记录（与当前数据库字段对齐）
            await db.query(
                `INSERT INTO lab_info 
                 (id, name, name_en, description, address, phone, email, website,
                  established_year, director, introduction, logo, banner, created_at, updated_at)
                 VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [name || null, name_en || null, description || null, address || null, phone || null,
                email || null, website || null, established_year || null, director || null,
                introduction || null, logo_url || null, banner_url || null]
            );
        }

        res.json({
            success: true,
            message: '实验室信息更新成功'
        });
    } catch (error) {
        console.error('更新实验室信息错误:', error);
        res.status(500).json({
            success: false,
            message: '更新实验室信息失败'
        });
    }
});

// 获取实验室信息 (管理员)
router.get('/admin/info', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const labInfo = await db.query('SELECT * FROM lab_info WHERE id = 1');

        res.json({
            success: true,
            data: labInfo && labInfo.length > 0 ? labInfo[0] : {}
        });
    } catch (error) {
        console.error('获取实验室信息错误:', error);
        res.status(500).json({
            success: false,
            message: '获取实验室信息失败'
        });
    }
});

module.exports = router;
