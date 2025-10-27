const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 从命令行参数获取基础路径
const args = process.argv.slice(2);
let basePath = '/';

// 解析命令行参数
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--base' && args[i + 1]) {
        basePath = args[i + 1];
        // 确保路径以 / 开头和结尾
        if (!basePath.startsWith('/')) basePath = '/' + basePath;
        if (!basePath.endsWith('/')) basePath = basePath + '/';
        break;
    }
}

console.log('===============================================');
console.log('  构建静态网站');
console.log('===============================================');
console.log(`基础路径: ${basePath}`);
if (basePath === '/') {
    console.log('模式: 用户/组织网站 (username.github.io)');
} else {
    console.log('模式: 项目网站 (username.github.io' + basePath.slice(0, -1) + ')');
}
console.log('===============================================\n');

// 1. 先导出数据
console.log('步骤 1: 导出数据...');
try {
    execSync('node backend/export-static.js', { stdio: 'inherit' });
    console.log('✓ 数据导出完成\n');
} catch (error) {
    console.error('✗ 数据导出失败:', error.message);
    process.exit(1);
}

// 2. 构建前端
console.log('步骤 2: 构建前端...');
try {
    process.chdir('frontend');
    // 设置环境变量 VITE_BASE_PATH
    const buildEnv = { ...process.env, VITE_BASE_PATH: basePath };
    execSync('npm run build', { stdio: 'inherit', env: buildEnv });
    process.chdir('..');
    console.log('✓ 前端构建完成\n');
} catch (error) {
    console.error('✗ 前端构建失败:', error.message);
    process.exit(1);
}

// 3. 复制构建产物到 docs 目录
console.log('步骤 3: 复制构建产物...');
try {
    const distDir = path.join(__dirname, 'frontend/dist');
    const targetDir = path.join(__dirname, 'docs');

    // 复制 dist 目录的内容到 docs
    copyDirectory(distDir, targetDir);

    console.log('✓ 构建产物复制完成\n');
} catch (error) {
    console.error('✗ 复制失败:', error.message);
    process.exit(1);
}

// 3.5. 复制 404.html 用于 SPA 路由支持
console.log('步骤 3.5: 配置 SPA 路由支持...');
try {
    const source404 = path.join(__dirname, 'static-404.html');
    const target404 = path.join(__dirname, 'docs/404.html');

    if (fs.existsSync(source404)) {
        fs.copyFileSync(source404, target404);
        console.log('✓ 404.html 已配置（支持直接访问路由）\n');
    } else {
        console.log('⚠ static-404.html 文件不存在，跳过\n');
    }
} catch (error) {
    console.error('✗ 配置 404.html 失败:', error.message);
    // 不退出，这不是致命错误
}

// 4. 创建 README.md 说明文件
console.log('步骤 4: 创建说明文件...');
try {
    let deploymentInstructions = '';

    if (basePath === '/') {
        // 用户/组织网站
        deploymentInstructions = `## 部署到 GitHub Pages (用户/组织网站)

**重要：此构建版本适用于用户/组织网站**

1. 在 GitHub 上创建一个名为 \`your-username.github.io\` 的仓库
2. 将此目录的内容推送到该仓库：
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/your-username.github.io.git
   git push -u origin main
   \`\`\`
3. 在仓库设置中启用 GitHub Pages：
   - Source: 选择 "Deploy from a branch"
   - Branch: 选择 "main"
   - Folder: 选择 "/docs"
4. 访问 \`https://your-username.github.io\` 查看你的网站`;
    } else {
        // 项目网站
        const repoName = basePath.slice(1, -1); // 移除前后的 /
        deploymentInstructions = `## 部署到 GitHub Pages (项目网站)

**重要：此构建版本适用于项目网站，基础路径为 \`${basePath}\`**

1. 在 GitHub 上创建一个新仓库（名称必须是：\`${repoName}\`）
2. 将此目录的内容推送到该仓库：
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/${repoName}.git
   git push -u origin main
   \`\`\`
3. 在仓库设置中启用 GitHub Pages：
   - Source: 选择 "Deploy from a branch"
   - Branch: 选择 "main"
   - Folder: 选择 "/docs"
4. 访问 \`https://your-username.github.io/${repoName}/\` 查看你的网站`;
    }

    const readmeContent = `# 实验室网站静态版本

这是从动态网站导出的静态版本，可以直接部署到 GitHub Pages 或其他静态托管服务。

**构建信息：**
- 基础路径：\`${basePath}\`
- 构建时间：${new Date().toLocaleString('zh-CN')}
${basePath === '/' ? '- 部署类型：用户/组织网站' : `- 部署类型：项目网站`}

${deploymentInstructions}

## 部署到其他平台

你也可以将此目录部署到：
- Netlify
- Vercel
- Cloudflare Pages
- GitLab Pages

只需将整个目录上传到这些平台即可。

## 更新内容

如果你需要更新网站内容：
1. 在管理员后台修改数据
2. 在管理员后台的"设置"页面点击"导出静态网站"按钮
3. 或者运行 \`npm run build:static\` 命令
4. 将更新后的文件重新推送到 GitHub

---

导出时间: ${new Date().toLocaleString('zh-CN')}
`;

    fs.writeFileSync(
        path.join(__dirname, 'docs/README.md'),
        readmeContent
    );

    console.log('✓ 说明文件创建完成\n');
} catch (error) {
    console.error('✗ 创建说明文件失败:', error.message);
}

console.log('===============================================');
console.log('  ✓ 静态网站构建完成！');
console.log('  输出目录: docs/');
console.log('===============================================');

// 辅助函数：递归复制目录
function copyDirectory(source, target) {
    // 如果目标目录存在，先删除 dist 相关的文件
    if (fs.existsSync(target)) {
        const entries = fs.readdirSync(target);
        for (const entry of entries) {
            const entryPath = path.join(target, entry);
            const stat = fs.statSync(entryPath);

            // 只删除前端构建产物相关的文件，保留 data 和 uploads 目录
            if (entry !== 'data' && entry !== 'uploads' && entry !== 'static-config.json' && entry !== 'README.md') {
                if (stat.isDirectory()) {
                    fs.rmSync(entryPath, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(entryPath);
                }
            }
        }
    } else {
        fs.mkdirSync(target, { recursive: true });
    }

    // 复制源目录的所有内容
    const files = fs.readdirSync(source);
    files.forEach(file => {
        const sourcePath = path.join(source, file);
        const targetPath = path.join(target, file);

        if (fs.statSync(sourcePath).isDirectory()) {
            copyDirectoryRecursive(sourcePath, targetPath);
        } else {
            fs.copyFileSync(sourcePath, targetPath);
        }
    });
}

function copyDirectoryRecursive(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const files = fs.readdirSync(source);
    files.forEach(file => {
        const sourcePath = path.join(source, file);
        const targetPath = path.join(target, file);

        if (fs.statSync(sourcePath).isDirectory()) {
            copyDirectoryRecursive(sourcePath, targetPath);
        } else {
            fs.copyFileSync(sourcePath, targetPath);
        }
    });
}

