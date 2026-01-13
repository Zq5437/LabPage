# 数据库升级指南

## 论文封面图片功能（2025-10-20）

### 功能说明

论文管理系统支持封面图片功能，管理员可以在后台为每篇论文上传封面图片（如框架图、Demo图、效果图等），提升前端展示效果。

### 新安装用户

使用 `database/schema.sql` 创建数据库时，`publications` 表已包含 `cover_image` 字段，无需额外操作。

### 旧数据库升级

如果你的数据库是在 2025-10-20 之前创建的，需要手动添加 `cover_image` 字段：

1. **备份数据库**（重要！）
   ```bash
   mysqldump -u root -p lab_website > lab_website_backup_$(date +%Y%m%d).sql
   ```

2. **执行升级SQL**
   ```sql
   USE lab_website;
   ALTER TABLE publications 
   ADD COLUMN cover_image VARCHAR(500) COMMENT '封面图片路径（论文框架图/Demo图/效果图）' 
   AFTER pdf_path;
   ```

3. **验证升级结果**
   ```sql
   DESC publications;
   ```
   
   确认输出中包含 `cover_image` 字段（VARCHAR(500)）

### 使用说明

1. 进入管理后台的"论文发表管理"
2. 新建或编辑论文时，可在"文件上传"区域上传封面图片
3. 支持的格式：JPG、PNG、GIF、WebP
4. 文件大小限制：10MB
5. 封面图片为可选项，未上传时前端会显示默认的图标+年份样式

### 注意事项

- 封面图片存储在 `backend/uploads/publications/` 目录
- 已有论文可选择性添加封面图片，不影响现有功能
- 建议封面图片尺寸：宽度800px，高度600px左右，保持4:3或16:9比例
