const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const config = require('../config');
const db = require('../database/connection');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// 头像上传配置（管理员头像与成员头像复用同目录）
const avatarStorage = multer.diskStorage({
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

const uploadAvatar = multer({
    storage: avatarStorage,
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
    limits: { fileSize: 2 * 1024 * 1024 }
});

// 登录
router.post('/login', [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空')
], async (req, res) => {
    try {
        // 验证输入
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '输入验证失败',
                errors: errors.array()
            });
        }

        const { username, password } = req.body;

        // 查询用户（优先尝试包含 avatar 字段，失败则回退）
        let users;
        try {
            users = await db.query(
                'SELECT id, username, password, email, name, role, status, avatar FROM admins WHERE username = ?',
                [username]
            );
        } catch (e) {
            users = await db.query(
                'SELECT id, username, password, email, name, role, status FROM admins WHERE username = ?',
                [username]
            );
        }

        if (!users || users.length === 0) {
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }

        const user = users[0];

        // 检查用户状态
        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: '用户账户已被禁用'
            });
        }

        // 验证密码
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }

        // 更新最后登录时间
        await db.query(
            'UPDATE admins SET last_login = NOW() WHERE id = ?',
            [user.id]
        );

        // 生成JWT令牌
        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                role: user.role
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        // 返回用户信息（不包含密码）
        const { password: _, ...userInfo } = user;

        res.json({
            success: true,
            message: '登录成功',
            data: {
                token,
                user: userInfo
            }
        });

    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 获取当前用户信息
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        try {
            // 优先尝试查询包含 avatar 字段
            const users = await db.query(
                'SELECT id, username, email, name, role, status, last_login, created_at, updated_at, avatar FROM admins WHERE id = ? AND status = "active"',
                [userId]
            );
            if (!users || users.length === 0) {
                return res.status(404).json({ success: false, message: '用户不存在' });
            }
            return res.json({ success: true, data: users[0] });
        } catch (e) {
            // 兼容没有 avatar 字段的情况
            const users = await db.query(
                'SELECT id, username, email, name, role, status, last_login, created_at, updated_at FROM admins WHERE id = ? AND status = "active"',
                [userId]
            );
            if (!users || users.length === 0) {
                return res.status(404).json({ success: false, message: '用户不存在' });
            }
            return res.json({ success: true, data: users[0] });
        }
    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// 修改密码
router.post('/change-password', [
    authenticateToken,
    body('oldPassword').notEmpty().withMessage('原密码不能为空'),
    body('newPassword').isLength({ min: 6 }).withMessage('新密码至少6位')
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

        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        // 获取当前密码（返回结果为数组）
        const users = await db.query(
            'SELECT password FROM admins WHERE id = ?',
            [userId]
        );

        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        // 验证原密码
        const isValidPassword = await bcrypt.compare(oldPassword, users[0].password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: '原密码错误'
            });
        }

        // 加密新密码
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // 更新密码
        await db.query(
            'UPDATE admins SET password = ?, updated_at = NOW() WHERE id = ?',
            [hashedNewPassword, userId]
        );

        res.json({
            success: true,
            message: '密码修改成功'
        });

    } catch (error) {
        console.error('修改密码错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 创建新管理员（仅超级管理员可操作）
router.post('/create-admin', [
    authenticateToken,
    requireSuperAdmin,
    body('username').isLength({ min: 3 }).withMessage('用户名至少3位'),
    body('password').isLength({ min: 6 }).withMessage('密码至少6位'),
    body('email').isEmail().withMessage('邮箱格式不正确'),
    body('name').notEmpty().withMessage('姓名不能为空')
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

        const { username, password, email, name, role = 'admin' } = req.body;

        // 检查用户名和邮箱是否已存在
        const [existingUsers] = await db.query(
            'SELECT id FROM admins WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: '用户名或邮箱已存在'
            });
        }

        // 加密密码
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 创建新管理员
        const result = await db.query(
            'INSERT INTO admins (username, password, email, name, role) VALUES (?, ?, ?, ?, ?)',
            [username, hashedPassword, email, name, role]
        );

        res.json({
            success: true,
            message: '管理员创建成功',
            data: {
                id: result.insertId,
                username,
                email,
                name,
                role
            }
        });

    } catch (error) {
        console.error('创建管理员错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 获取管理员列表（仅超级管理员可查看）
router.get('/admins', [authenticateToken, requireSuperAdmin], async (req, res) => {
    try {
        const [admins] = await db.query(
            'SELECT id, username, email, name, role, status, last_login, created_at FROM admins ORDER BY created_at DESC'
        );

        res.json({
            success: true,
            data: admins
        });

    } catch (error) {
        console.error('获取管理员列表错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 登出（前端删除token即可，这里主要用于记录）
router.post('/logout', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: '登出成功'
    });
});

// 更新个人资料（姓名、邮箱）
router.put('/profile', [
    authenticateToken,
    body('name').optional().isLength({ min: 1 }).withMessage('姓名不能为空'),
    body('email').optional().isEmail().withMessage('邮箱格式不正确')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: '输入验证失败', errors: errors.array() });
        }

        const userId = req.user.id;
        const updates = {};
        const { name, email } = req.body;
        if (typeof name !== 'undefined') updates.name = name;
        if (typeof email !== 'undefined') updates.email = email;

        if (Object.keys(updates).length === 0) {
            return res.json({ success: true, message: '无更新内容' });
        }

        const updateFields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
        const updateValues = Object.values(updates);
        await db.query(`UPDATE admins SET ${updateFields}, updated_at = NOW() WHERE id = ?`, [...updateValues, userId]);

        res.json({ success: true, message: '资料更新成功' });
    } catch (error) {
        console.error('更新资料错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// 上传或更新个人头像
router.post('/profile/avatar', [
    authenticateToken,
    uploadAvatar.single('avatar')
], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: '请选择要上传的头像文件' });
        }
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        const userId = req.user.id;
        // 确保 avatar 字段存在
        try {
            await db.query('ALTER TABLE admins ADD COLUMN avatar VARCHAR(500) NULL');
        } catch (e) {
            // 字段已存在则忽略
        }
        await db.query('UPDATE admins SET avatar = ?, updated_at = NOW() WHERE id = ?', [avatarUrl, userId]);
        res.json({ success: true, message: '头像更新成功', data: { avatar: avatarUrl } });
    } catch (error) {
        console.error('上传头像错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

module.exports = router;
