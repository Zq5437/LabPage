const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const config = require('../config');
const db = require('../database/connection');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

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

        // 查询用户
        const users = await db.query(
            'SELECT id, username, password, email, name, role, status FROM admins WHERE username = ?',
            [username]
        );

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
        res.json({
            success: true,
            data: req.user
        });
    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
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

        // 获取当前密码
        const [users] = await db.query(
            'SELECT password FROM admins WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
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

module.exports = router;
