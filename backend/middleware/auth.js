const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../database/connection');

// JWT认证中间件
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: '访问令牌不存在'
        });
    }

    try {
        const decoded = jwt.verify(token, config.jwt.secret);

        // 验证用户是否还存在且状态正常
        const users = await db.query(
            'SELECT id, username, email, name, role, status FROM admins WHERE id = ? AND status = "active"',
            [decoded.userId]
        );

        if (!users || users.length === 0) {
            return res.status(401).json({
                success: false,
                message: '用户不存在或已被禁用'
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: '令牌已过期'
            });
        }

        return res.status(403).json({
            success: false,
            message: '无效的访问令牌'
        });
    }
};

// 权限检查中间件
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: '未认证的用户'
            });
        }

        const userRole = req.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: '权限不足'
            });
        }

        next();
    };
};

// 超级管理员权限检查
const requireSuperAdmin = requireRole('super_admin');

// 管理员权限检查（包含超级管理员）
const requireAdmin = requireRole(['admin', 'super_admin']);

module.exports = {
    authenticateToken,
    verifyToken: authenticateToken,  // 别名
    requireRole,
    requireSuperAdmin,
    requireAdmin,
    verifyAdmin: requireAdmin  // 别名
};
