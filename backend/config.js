require('dotenv').config();

module.exports = {
    // 数据库配置
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        database: process.env.DB_DATABASE || 'lab_website',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || ''
    },

    // JWT配置
    jwt: {
        secret: process.env.JWT_SECRET || 'lab_website_jwt_secret_2024',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },

    // 服务器配置
    server: {
        port: parseInt(process.env.SERVER_PORT) || 5080
    },

    // 文件上传配置
    upload: {
        path: process.env.UPLOAD_PATH || './uploads',
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
    }
};
