const express = require('express');
const { body, validationResult } = require('express-validator');

const db = require('../database/connection');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 获取实验室基本信息（公开接口）
router.get('/lab-info', async (req, res) => {
    try {
        const [labInfo] = await db.query('SELECT * FROM lab_info LIMIT 1');

        if (labInfo.length === 0) {
            return res.status(404).json({
                success: false,
                message: '实验室信息未配置'
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
            message: '服务器内部错误'
        });
    }
});

// 获取研究方向列表（公开接口）
router.get('/research-areas', async (req, res) => {
    try {
        const [areas] = await db.query(
            'SELECT * FROM research_areas WHERE status = "active" ORDER BY sort_order DESC, id ASC'
        );

        res.json({
            success: true,
            data: areas
        });

    } catch (error) {
        console.error('获取研究方向错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 获取发表论文列表（公开接口）
router.get('/publications', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const year = req.query.year;
        const type = req.query.type;

        let whereClause = '';
        let params = [];

        const conditions = [];
        if (year) {
            conditions.push('year = ?');
            params.push(year);
        }
        if (type) {
            conditions.push('type = ?');
            params.push(type);
        }

        if (conditions.length > 0) {
            whereClause = 'WHERE ' + conditions.join(' AND ');
        }

        // 获取总数
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total FROM publications ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        // 获取论文列表
        const [publications] = await db.query(
            `SELECT * FROM publications ${whereClause} 
       ORDER BY is_featured DESC, year DESC, id DESC 
       LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        res.json({
            success: true,
            data: {
                publications,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('获取论文列表错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 获取招生信息（公开接口）
router.get('/recruitment', async (req, res) => {
    try {
        const [recruitment] = await db.query(
            'SELECT * FROM recruitment WHERE status = "open" ORDER BY is_featured DESC, created_at DESC'
        );

        res.json({
            success: true,
            data: recruitment
        });

    } catch (error) {
        console.error('获取招生信息错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 获取设备资源列表（公开接口）
router.get('/equipment', async (req, res) => {
    try {
        const status = req.query.status || 'available';

        const [equipment] = await db.query(
            'SELECT id, name, model, manufacturer, description, specifications, location, status, images FROM equipment WHERE status = ? ORDER BY name ASC',
            [status]
        );

        // 解析图片JSON字段
        equipment.forEach(item => {
            if (item.images) {
                try {
                    item.images = JSON.parse(item.images);
                } catch (e) {
                    item.images = [];
                }
            }
        });

        res.json({
            success: true,
            data: equipment
        });

    } catch (error) {
        console.error('获取设备列表错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 获取网站配置（公开接口）
router.get('/site-config', async (req, res) => {
    try {
        const configs = await db.query('SELECT config_key, config_value, type FROM site_config');

        const configObj = {};
        if (Array.isArray(configs) && configs.length > 0) {
            configs.forEach(config => {
                let value = config.config_value;

                // 根据类型转换值
                switch (config.type) {
                    case 'number':
                        value = Number(value);
                        break;
                    case 'boolean':
                        value = value === 'true';
                        break;
                    case 'json':
                        try {
                            value = JSON.parse(value);
                        } catch (e) {
                            value = null;
                        }
                        break;
                    default:
                        // 保持字符串类型
                        break;
                }

                configObj[config.config_key] = value;
            });
        }

        res.json({
            success: true,
            data: configObj
        });

    } catch (error) {
        console.error('获取网站配置错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 记录访问统计（公开接口）
router.post('/visit-log', [
    body('page_url').notEmpty().withMessage('页面URL不能为空')
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

        const { page_url, referer } = req.body;
        const visitor_ip = req.ip || req.connection.remoteAddress;
        const user_agent = req.get('User-Agent');

        await db.query(
            'INSERT INTO site_statistics (page_url, visitor_ip, user_agent, referer) VALUES (?, ?, ?, ?)',
            [page_url, visitor_ip, user_agent, referer]
        );

        res.json({
            success: true,
            message: '访问记录成功'
        });

    } catch (error) {
        console.error('记录访问统计错误:', error);
        // 访问统计失败不应该影响用户体验，所以仍然返回成功
        res.json({
            success: true,
            message: '访问记录成功'
        });
    }
});

// 获取访问统计（管理员接口）
router.get('/admin/statistics', [authenticateToken, requireAdmin], async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;

        // 获取总访问量
        const [totalVisits] = await db.query('SELECT COUNT(*) as total FROM site_statistics');

        // 获取最近N天的访问量
        const [recentVisits] = await db.query(
            'SELECT COUNT(*) as total FROM site_statistics WHERE visit_time >= DATE_SUB(NOW(), INTERVAL ? DAY)',
            [days]
        );

        // 获取页面访问排行
        const [pageStats] = await db.query(
            `SELECT page_url, COUNT(*) as visits 
       FROM site_statistics 
       WHERE visit_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY page_url 
       ORDER BY visits DESC 
       LIMIT 10`,
            [days]
        );

        // 获取每日访问趋势
        const [dailyStats] = await db.query(
            `SELECT DATE(visit_time) as date, COUNT(*) as visits 
       FROM site_statistics 
       WHERE visit_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(visit_time) 
       ORDER BY date DESC`,
            [days]
        );

        res.json({
            success: true,
            data: {
                totalVisits: totalVisits[0].total,
                recentVisits: recentVisits[0].total,
                pageStats,
                dailyStats
            }
        });

    } catch (error) {
        console.error('获取访问统计错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 更新实验室信息（管理员接口）
router.put('/admin/lab-info', [
    authenticateToken,
    requireAdmin,
    body('name').notEmpty().withMessage('实验室名称不能为空')
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

        const updates = { ...req.body };

        // 检查是否已存在实验室信息
        const [existing] = await db.query('SELECT id FROM lab_info LIMIT 1');

        if (existing.length === 0) {
            // 创建新记录
            const updateFields = Object.keys(updates).join(', ');
            const updatePlaceholders = Object.keys(updates).map(() => '?').join(', ');
            const updateValues = Object.values(updates);

            await db.query(
                `INSERT INTO lab_info (${updateFields}) VALUES (${updatePlaceholders})`,
                updateValues
            );
        } else {
            // 更新现有记录
            const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
            const updateValues = Object.values(updates);

            await db.query(
                `UPDATE lab_info SET ${updateFields}, updated_at = NOW() WHERE id = ?`,
                [...updateValues, existing[0].id]
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
            message: '服务器内部错误'
        });
    }
});

// 更新网站配置（管理员接口）
router.put('/admin/site-config', [
    authenticateToken,
    requireAdmin,
    body('configs').isArray().withMessage('配置必须是数组格式')
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

        const { configs } = req.body;

        // 使用事务更新配置
        await db.transaction(async (connection) => {
            for (const config of configs) {
                const { config_key, config_value, description, type = 'text' } = config;

                await connection.execute(
                    `INSERT INTO site_config (config_key, config_value, description, type) 
           VALUES (?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
           config_value = VALUES(config_value), 
           description = VALUES(description), 
           type = VALUES(type), 
           updated_at = NOW()`,
                    [config_key, config_value, description, type]
                );
            }
        });

        res.json({
            success: true,
            message: '网站配置更新成功'
        });

    } catch (error) {
        console.error('更新网站配置错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

module.exports = router;
