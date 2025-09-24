module.exports = {
    // 数据库配置
    database: {
        host: 'localhost',
        port: 3306,
        database: 'lab_website',
        user: 'root',
        password: 'your_password'
    },

    // JWT配置
    jwt: {
        secret: 'your_jwt_secret_key_here',
        expiresIn: '24h'
    },

    // 服务器配置
    server: {
        port: 8000
    },

    // 文件上传配置
    upload: {
        path: './uploads',
        maxFileSize: 5 * 1024 * 1024 // 5MB
    }
};
