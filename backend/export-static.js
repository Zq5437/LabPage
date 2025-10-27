const fs = require('fs');
const path = require('path');
const db = require('./database/connection');

// 导出静态网站的函数
async function exportStaticWebsite(outputDir = '../docs') {
    try {
        console.log('开始导出静态网站数据...');

        // 设置输出目录
        const exportDir = path.join(__dirname, outputDir);
        const dataDir = path.join(exportDir, 'data');
        const uploadsDir = path.join(exportDir, 'uploads');

        // 创建必要的目录
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // 导出实验室信息
        console.log('导出实验室信息...');
        const labInfo = await db.query('SELECT * FROM lab_info LIMIT 1');
        fs.writeFileSync(
            path.join(dataDir, 'lab-info.json'),
            JSON.stringify({ success: true, data: labInfo[0] || {} }, null, 2)
        );

        // 导出研究方向
        console.log('导出研究方向...');
        const researchAreas = await db.query(
            'SELECT * FROM research_areas WHERE status = "active" ORDER BY sort_order DESC, id ASC'
        );
        fs.writeFileSync(
            path.join(dataDir, 'research-areas.json'),
            JSON.stringify({ success: true, data: researchAreas }, null, 2)
        );

        // 导出网站配置
        console.log('导出网站配置...');
        const configs = await db.query('SELECT config_key, config_value, type FROM site_config');
        const configObj = {};
        if (Array.isArray(configs) && configs.length > 0) {
            configs.forEach(config => {
                let value = config.config_value;
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
                        break;
                }
                configObj[config.config_key] = value;
            });
        }
        fs.writeFileSync(
            path.join(dataDir, 'site-config.json'),
            JSON.stringify({ success: true, data: configObj }, null, 2)
        );

        // 导出论文列表（所有论文）
        console.log('导出论文列表...');
        const publications = await db.query(
            'SELECT * FROM publications ORDER BY is_featured DESC, year DESC, id DESC'
        );
        // 格式与后端 API 一致：{ success: true, data: [...], pagination: {...} }
        fs.writeFileSync(
            path.join(dataDir, 'publications.json'),
            JSON.stringify({
                success: true,
                data: publications,
                pagination: {
                    page: 1,
                    limit: publications.length,
                    total: publications.length,
                    pages: Math.ceil(publications.length / (publications.length || 1))
                }
            }, null, 2)
        );

        // 导出招生信息
        console.log('导出招生信息...');
        const recruitment = await db.query(
            'SELECT * FROM recruitment WHERE status = "open" ORDER BY is_featured DESC, created_at DESC'
        );
        fs.writeFileSync(
            path.join(dataDir, 'recruitment.json'),
            JSON.stringify({ success: true, data: recruitment }, null, 2)
        );

        // 导出设备资源
        console.log('导出设备资源...');
        const equipment = await db.query(
            'SELECT id, name, model, manufacturer, description, specifications, location, status, image_url FROM equipment WHERE status = "active" ORDER BY name ASC'
        );
        equipment.forEach(item => {
            item.images = item.image_url ? [item.image_url] : [];
        });
        fs.writeFileSync(
            path.join(dataDir, 'equipment.json'),
            JSON.stringify({ success: true, data: equipment }, null, 2)
        );

        // 导出成员列表
        console.log('导出成员列表...');
        const members = await db.query(
            `SELECT id, name, name_en, title, category, email, avatar, bio, research_interests, 
              homepage, google_scholar, orcid, join_date, graduation_date, sort_order
       FROM members WHERE status = "active" 
       ORDER BY sort_order DESC, join_date DESC`
        );
        const groupedMembers = members.reduce((acc, member) => {
            if (!acc[member.category]) {
                acc[member.category] = [];
            }
            acc[member.category].push(member);
            return acc;
        }, {});
        fs.writeFileSync(
            path.join(dataDir, 'members.json'),
            JSON.stringify({ success: true, data: { members, groupedMembers } }, null, 2)
        );

        // 导出每个成员的详细信息
        console.log('导出成员详情...');
        const memberDetailsDir = path.join(dataDir, 'members');
        if (!fs.existsSync(memberDetailsDir)) {
            fs.mkdirSync(memberDetailsDir, { recursive: true });
        }
        for (const member of members) {
            const memberDetail = await db.query(
                'SELECT * FROM members WHERE id = ? AND status IN ("active", "alumni")',
                [member.id]
            );
            if (memberDetail.length > 0) {
                fs.writeFileSync(
                    path.join(memberDetailsDir, `${member.id}.json`),
                    JSON.stringify({ success: true, data: memberDetail[0] }, null, 2)
                );

                // 导出成员的论文
                const memberPublications = await db.query(
                    `SELECT * FROM publications 
                     WHERE JSON_CONTAINS(member_ids, ?, '$')
                     ORDER BY year DESC, created_at DESC`,
                    [String(member.id)]
                );
                fs.writeFileSync(
                    path.join(memberDetailsDir, `${member.id}-publications.json`),
                    JSON.stringify({ success: true, data: memberPublications || [] }, null, 2)
                );
            }
        }

        // 导出新闻列表
        console.log('导出新闻列表...');
        const news = await db.query(
            `SELECT id, title, summary, author, cover_image, category, is_top, views, publish_time, created_at 
       FROM news WHERE status = "published" 
       ORDER BY is_top DESC, publish_time DESC`
        );
        fs.writeFileSync(
            path.join(dataDir, 'news.json'),
            JSON.stringify({ success: true, data: { news, pagination: { page: 1, limit: news.length, total: news.length, totalPages: 1 } } }, null, 2)
        );

        // 导出每条新闻的详细信息
        console.log('导出新闻详情...');
        const newsDetailsDir = path.join(dataDir, 'news');
        if (!fs.existsSync(newsDetailsDir)) {
            fs.mkdirSync(newsDetailsDir, { recursive: true });
        }
        for (const newsItem of news) {
            const newsDetail = await db.query(
                'SELECT * FROM news WHERE id = ? AND status = "published"',
                [newsItem.id]
            );
            if (newsDetail.length > 0) {
                fs.writeFileSync(
                    path.join(newsDetailsDir, `${newsItem.id}.json`),
                    JSON.stringify({ success: true, data: newsDetail[0] }, null, 2)
                );
            }
        }

        // 导出项目列表
        console.log('导出项目列表...');
        const projects = await db.query(
            `SELECT id, title, title_en, description, category, funding_agency, funding_amount,
              principal_investigator, participants, start_date, end_date, status, cover_image
       FROM projects ORDER BY start_date DESC`
        );
        fs.writeFileSync(
            path.join(dataDir, 'projects.json'),
            JSON.stringify({ success: true, data: { projects, pagination: { page: 1, limit: projects.length, total: projects.length, totalPages: 1 } } }, null, 2)
        );

        // 导出每个项目的详细信息
        console.log('导出项目详情...');
        const projectDetailsDir = path.join(dataDir, 'projects');
        if (!fs.existsSync(projectDetailsDir)) {
            fs.mkdirSync(projectDetailsDir, { recursive: true });
        }
        for (const project of projects) {
            const projectDetail = await db.query(
                'SELECT * FROM projects WHERE id = ?',
                [project.id]
            );
            if (projectDetail.length > 0) {
                const detail = projectDetail[0];
                if (detail.attachments) {
                    try {
                        detail.attachments = JSON.parse(detail.attachments);
                    } catch (e) {
                        detail.attachments = [];
                    }
                }
                fs.writeFileSync(
                    path.join(projectDetailsDir, `${project.id}.json`),
                    JSON.stringify({ success: true, data: detail }, null, 2)
                );
            }
        }

        // 导出访问统计（基础数据）
        console.log('导出访问统计...');
        const totalVisitsResult = await db.query('SELECT COUNT(*) as total FROM site_statistics');
        const totalVisits = totalVisitsResult.length > 0 ? (totalVisitsResult[0].total || 0) : 0;
        const recentVisitsResult = await db.query(
            'SELECT COUNT(*) as total FROM site_statistics WHERE visit_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
        );
        const recentVisits = recentVisitsResult.length > 0 ? (recentVisitsResult[0].total || 0) : 0;
        const dailyStats = await db.query(
            `SELECT DATE(visit_time) as date, COUNT(*) as visits 
             FROM site_statistics 
             WHERE visit_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             GROUP BY DATE(visit_time)
             ORDER BY date DESC`
        );
        fs.writeFileSync(
            path.join(dataDir, 'statistics.json'),
            JSON.stringify({
                success: true,
                data: {
                    totalVisits: totalVisits || 0,
                    recentVisits: recentVisits || 0,
                    days: 30,
                    dailyStats: dailyStats || []
                }
            }, null, 2)
        );

        // 复制上传的文件
        console.log('复制上传文件...');
        const sourceUploadsDir = path.join(__dirname, 'uploads');
        if (fs.existsSync(sourceUploadsDir)) {
            copyDirectory(sourceUploadsDir, uploadsDir);
        }

        // 创建配置文件，标识这是静态模式
        const staticConfig = {
            mode: 'static',
            exportTime: new Date().toISOString(),
            version: '1.0.0'
        };
        fs.writeFileSync(
            path.join(exportDir, 'static-config.json'),
            JSON.stringify(staticConfig, null, 2)
        );

        console.log('✓ 数据导出完成！');
        console.log(`导出位置: ${exportDir}`);

        return {
            success: true,
            message: '静态网站数据导出成功',
            exportDir: exportDir,
            files: {
                labInfo: '实验室信息',
                researchAreas: '研究方向',
                siteConfig: '网站配置',
                publications: '论文列表',
                recruitment: '招生信息',
                equipment: '设备资源',
                members: '成员列表和详情',
                news: '新闻列表和详情',
                projects: '项目列表和详情',
                statistics: '访问统计',
                uploads: '上传文件'
            }
        };

    } catch (error) {
        console.error('导出静态网站时出错:', error);
        throw error;
    }
}

// 递归复制目录
function copyDirectory(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const files = fs.readdirSync(source);
    files.forEach(file => {
        const sourcePath = path.join(source, file);
        const targetPath = path.join(target, file);

        if (fs.statSync(sourcePath).isDirectory()) {
            copyDirectory(sourcePath, targetPath);
        } else {
            fs.copyFileSync(sourcePath, targetPath);
        }
    });
}

// 如果直接运行此脚本
if (require.main === module) {
    exportStaticWebsite()
        .then(result => {
            console.log('\n导出摘要:');
            console.log(JSON.stringify(result, null, 2));
            process.exit(0);
        })
        .catch(error => {
            console.error('导出失败:', error);
            process.exit(1);
        });
}

module.exports = { exportStaticWebsite };

