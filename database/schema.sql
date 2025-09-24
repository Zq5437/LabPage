-- 实验室网站数据库结构
-- 创建数据库
CREATE DATABASE IF NOT EXISTS lab_website CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lab_website;

-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码哈希',
    email VARCHAR(100) UNIQUE NOT NULL COMMENT '邮箱',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    role ENUM('super_admin', 'admin') DEFAULT 'admin' COMMENT '角色',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
    last_login TIMESTAMP NULL COMMENT '最后登录时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='管理员表';

-- 实验室信息表
CREATE TABLE IF NOT EXISTS lab_info (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL COMMENT '实验室名称',
    name_en VARCHAR(200) COMMENT '英文名称',
    description TEXT COMMENT '实验室简介',
    director VARCHAR(100) COMMENT '实验室主任',
    address TEXT COMMENT '地址',
    phone VARCHAR(20) COMMENT '联系电话',
    email VARCHAR(100) COMMENT '联系邮箱',
    website VARCHAR(200) COMMENT '官方网站',
    logo VARCHAR(500) COMMENT 'Logo图片路径',
    banner VARCHAR(500) COMMENT '横幅图片路径',
    established_year YEAR COMMENT '成立年份',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='实验室基本信息表';

-- 新闻动态表
CREATE TABLE IF NOT EXISTS news (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL COMMENT '标题',
    summary TEXT COMMENT '摘要',
    content LONGTEXT NOT NULL COMMENT '内容',
    author VARCHAR(100) COMMENT '作者',
    cover_image VARCHAR(500) COMMENT '封面图片',
    category ENUM('news', 'announcement', 'achievement', 'activity') DEFAULT 'news' COMMENT '分类',
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft' COMMENT '状态',
    is_top BOOLEAN DEFAULT FALSE COMMENT '是否置顶',
    views INT DEFAULT 0 COMMENT '浏览次数',
    publish_time TIMESTAMP NULL COMMENT '发布时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_publish_time (publish_time)
) COMMENT='新闻动态表';

-- 实验室成员表
CREATE TABLE IF NOT EXISTS members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '姓名',
    name_en VARCHAR(100) COMMENT '英文姓名',
    title VARCHAR(100) COMMENT '职位/职称',
    category ENUM('faculty', 'postdoc', 'phd', 'master', 'undergraduate', 'alumni') NOT NULL COMMENT '成员类别',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '电话',
    office VARCHAR(100) COMMENT '办公室',
    avatar VARCHAR(500) COMMENT '头像图片路径',
    bio TEXT COMMENT '个人简介',
    research_interests TEXT COMMENT '研究兴趣',
    education TEXT COMMENT '教育背景',
    homepage VARCHAR(200) COMMENT '个人主页',
    google_scholar VARCHAR(200) COMMENT 'Google Scholar链接',
    orcid VARCHAR(50) COMMENT 'ORCID',
    join_date DATE COMMENT '加入日期',
    graduation_date DATE COMMENT '毕业日期（适用于学生）',
    sort_order INT DEFAULT 0 COMMENT '排序权重',
    status ENUM('active', 'inactive', 'alumni') DEFAULT 'active' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_status (status)
) COMMENT='实验室成员表';

-- 研究项目表
CREATE TABLE IF NOT EXISTS projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL COMMENT '项目标题',
    title_en VARCHAR(200) COMMENT '英文标题',
    description TEXT COMMENT '项目描述',
    category ENUM('national', 'provincial', 'institutional', 'enterprise', 'international') COMMENT '项目类别',
    funding_agency VARCHAR(200) COMMENT '资助机构',
    funding_amount DECIMAL(15,2) COMMENT '资助金额',
    principal_investigator VARCHAR(100) COMMENT '项目负责人',
    participants TEXT COMMENT '参与人员',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '结束日期',
    status ENUM('ongoing', 'completed', 'suspended') DEFAULT 'ongoing' COMMENT '项目状态',
    cover_image VARCHAR(500) COMMENT '项目封面图',
    attachments JSON COMMENT '相关附件',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_category (category)
) COMMENT='研究项目表';

-- 发表论文表
CREATE TABLE IF NOT EXISTS publications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(500) NOT NULL COMMENT '论文标题',
    authors TEXT NOT NULL COMMENT '作者列表',
    journal VARCHAR(200) COMMENT '期刊/会议名称',
    volume VARCHAR(50) COMMENT '卷号',
    issue VARCHAR(50) COMMENT '期号',
    pages VARCHAR(50) COMMENT '页码',
    year YEAR NOT NULL COMMENT '发表年份',
    doi VARCHAR(100) COMMENT 'DOI',
    url VARCHAR(500) COMMENT '论文链接',
    pdf_path VARCHAR(500) COMMENT 'PDF文件路径',
    abstract TEXT COMMENT '摘要',
    keywords VARCHAR(500) COMMENT '关键词',
    type ENUM('journal', 'conference', 'book_chapter', 'patent', 'thesis') DEFAULT 'journal' COMMENT '类型',
    impact_factor DECIMAL(5,3) COMMENT '影响因子',
    citations INT DEFAULT 0 COMMENT '引用次数',
    is_featured BOOLEAN DEFAULT FALSE COMMENT '是否为重点论文',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_year (year),
    INDEX idx_type (type)
) COMMENT='发表论文表';

-- 研究方向表
CREATE TABLE IF NOT EXISTS research_areas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '研究方向名称',
    name_en VARCHAR(100) COMMENT '英文名称',
    description TEXT COMMENT '方向描述',
    icon VARCHAR(500) COMMENT '图标路径',
    cover_image VARCHAR(500) COMMENT '封面图片',
    sort_order INT DEFAULT 0 COMMENT '排序权重',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='研究方向表';

-- 设备资源表
CREATE TABLE IF NOT EXISTS equipment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL COMMENT '设备名称',
    model VARCHAR(100) COMMENT '型号',
    manufacturer VARCHAR(100) COMMENT '生产厂商',
    description TEXT COMMENT '设备描述',
    specifications TEXT COMMENT '技术规格',
    location VARCHAR(100) COMMENT '存放位置',
    purchase_date DATE COMMENT '购买日期',
    purchase_price DECIMAL(15,2) COMMENT '购买价格',
    status ENUM('available', 'in_use', 'maintenance', 'retired') DEFAULT 'available' COMMENT '设备状态',
    responsible_person VARCHAR(100) COMMENT '负责人',
    images JSON COMMENT '设备图片',
    manual_path VARCHAR(500) COMMENT '使用手册路径',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) COMMENT='设备资源表';

-- 招生信息表
CREATE TABLE IF NOT EXISTS recruitment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL COMMENT '招生标题',
    type ENUM('master', 'phd', 'postdoc', 'visiting') NOT NULL COMMENT '招生类型',
    positions INT DEFAULT 1 COMMENT '招生人数',
    requirements TEXT COMMENT '招生要求',
    description TEXT COMMENT '详细说明',
    contact_info TEXT COMMENT '联系方式',
    deadline DATE COMMENT '截止日期',
    status ENUM('open', 'closed', 'filled') DEFAULT 'open' COMMENT '招生状态',
    is_featured BOOLEAN DEFAULT FALSE COMMENT '是否重点推荐',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_status (status)
) COMMENT='招生信息表';

-- 网站配置表
CREATE TABLE IF NOT EXISTS site_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) UNIQUE NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    description VARCHAR(200) COMMENT '配置说明',
    type ENUM('text', 'number', 'boolean', 'json', 'image') DEFAULT 'text' COMMENT '配置类型',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='网站配置表';

-- 访问统计表
CREATE TABLE IF NOT EXISTS site_statistics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    page_url VARCHAR(500) NOT NULL COMMENT '页面URL',
    visitor_ip VARCHAR(45) COMMENT '访客IP',
    user_agent TEXT COMMENT '用户代理',
    referer VARCHAR(500) COMMENT '来源页面',
    visit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '访问时间',
    INDEX idx_page_url (page_url(255)),
    INDEX idx_visit_time (visit_time)
) COMMENT='访问统计表';

-- 插入默认管理员账户 (用户名: admin, 密码: admin123)
INSERT INTO admins (username, password, email, name, role) VALUES 
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@lab.com', '系统管理员', 'super_admin');

-- 插入默认实验室信息
INSERT INTO lab_info (name, name_en, description, director, address, email, established_year) VALUES 
('智能计算实验室', 'Intelligent Computing Lab', '本实验室专注于人工智能、机器学习、深度学习等前沿技术研究', '张教授', '某某大学计算机学院', 'lab@university.edu.cn', 2020);

-- 插入默认网站配置
INSERT INTO site_config (config_key, config_value, description, type) VALUES 
('site_title', '智能计算实验室', '网站标题', 'text'),
('site_description', '专注于人工智能与机器学习研究', '网站描述', 'text'),
('contact_email', 'contact@lab.com', '联系邮箱', 'text'),
('contact_phone', '010-12345678', '联系电话', 'text'),
('show_visitor_count', 'true', '是否显示访问统计', 'boolean'),
('max_news_per_page', '10', '每页新闻数量', 'number');

-- 插入示例研究方向
INSERT INTO research_areas (name, name_en, description, sort_order) VALUES 
('机器学习', 'Machine Learning', '研究各种机器学习算法及其应用', 1),
('深度学习', 'Deep Learning', '专注于神经网络和深度学习技术', 2),
('计算机视觉', 'Computer Vision', '图像处理、目标检测、图像识别等技术研究', 3),
('自然语言处理', 'Natural Language Processing', '文本分析、语言理解、机器翻译等', 4);
