const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const config = require('./config');
const db = require('./database/connection');

// 导入路由
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const membersRoutes = require('./routes/members');
const projectsRoutes = require('./routes/projects');
const publicationsRoutes = require('./routes/publications');
const equipmentRoutes = require('./routes/equipment');
const researchAreasRoutes = require('./routes/research-areas');
const recruitmentRoutes = require('./routes/recruitment');
const labInfoRoutes = require('./routes/lab-info');
const contactRoutes = require('./routes/contact');
const publicRoutes = require('./routes/public');

const app = express();

// 安全中间件
app.use(helmet());

// 跨域配置
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));

// 请求限制
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100 // 限制每个IP 15分钟内最多100个请求
});
app.use('/api', limiter);

// 解析JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// 路由配置
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/publications', publicationsRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/research-areas', researchAreasRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/lab-info', labInfoRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/public', publicRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: '服务器内部错误'
    });
});

// 404处理
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: '接口不存在'
    });
});

// 启动服务器
const PORT = config.server.port || 8000;

app.listen(PORT, () => {
    console.log(`🚀 服务器启动成功！`);
    console.log(`📡 API服务地址: http://localhost:${PORT}`);
    console.log(`📚 API文档: http://localhost:${PORT}/api/health`);

    // 测试数据库连接
    db.getConnection()
        .then(connection => {
            console.log('✅ 数据库连接成功');
            connection.release();
        })
        .catch(err => {
            console.error('❌ 数据库连接失败:', err.message);
            console.log('请确保MySQL服务已启动，并检查配置文件中的数据库信息');
        });
});
