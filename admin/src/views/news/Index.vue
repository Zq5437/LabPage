<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="header-row">
          <h3>新闻管理</h3>
          <el-button type="primary" @click="showCreateDialog">
            <el-icon>
              <Plus />
            </el-icon>
            发布新闻
          </el-button>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="filter-row">
        <div class="filter-left">
          <el-input v-model="searchQuery" placeholder="搜索新闻标题..." style="width: 250px" clearable @input="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>

        <div class="filter-right">
          <el-select v-model="filters.category" placeholder="选择分类" clearable style="width: 130px; margin-right: 10px"
            @change="loadNews">
            <el-option label="学术新闻" value="news" />
            <el-option label="活动通知" value="announcement" />
            <el-option label="获奖信息" value="achievement" />
            <el-option label="学术活动" value="activity" />
          </el-select>

          <el-select v-model="filters.status" placeholder="选择状态" clearable style="width: 120px" @change="loadNews">
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table :data="newsList" v-loading="loading" style="width: 100%" @sort-change="handleSort">
        <el-table-column prop="id" label="ID" width="80" sortable="custom" />

        <el-table-column prop="title" label="标题" min-width="200" sortable="custom">
          <template #default="{ row }">
            <div>
              <div style="font-weight: 500">{{ row.title }}</div>
              <div style="font-size: 12px; color: #999; margin-top: 4px">{{ row.summary }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag :type="getCategoryTagType(row.category)" size="small">
              {{ getCategoryText(row.category) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="author" label="作者" width="120" />

        <el-table-column prop="is_top" label="置顶" width="80">
          <template #default="{ row }">
            <el-tag :type="row.is_top ? 'warning' : 'info'" size="small">
              {{ row.is_top ? '置顶' : '普通' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="views" label="浏览量" width="100" sortable="custom" />

        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="publish_time" label="发布时间" width="180" sortable="custom">
          <template #default="{ row }">
            {{ formatDate(row.publish_time) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editNews(row)">
              <el-icon>
                <Edit />
              </el-icon>
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="deleteNews(row)">
              <el-icon>
                <Delete />
              </el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-row">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handlePageChange" />
      </div>
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="editingNews ? '编辑新闻' : '发布新闻'" width="900px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="新闻标题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入新闻标题" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分类" prop="category">
              <el-select v-model="formData.category" placeholder="选择分类" style="width: 100%">
                <el-option label="学术新闻" value="news" />
                <el-option label="活动通知" value="announcement" />
                <el-option label="获奖信息" value="achievement" />
                <el-option label="学术活动" value="activity" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="作者" prop="author">
              <el-input v-model="formData.author" placeholder="请输入作者" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发布时间">
              <el-date-picker v-model="formData.publish_time" type="datetime" placeholder="选择发布时间" style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="新闻摘要" prop="summary">
          <el-input v-model="formData.summary" type="textarea" :rows="3" placeholder="请输入新闻摘要" />
        </el-form-item>

        <el-form-item label="封面图片">
          <div class="cover-upload-container">
            <el-upload class="cover-uploader" :action="uploadUrl" :headers="uploadHeaders" :show-file-list="false"
              name="cover_image" :before-upload="beforeCoverUpload" :on-success="handleCoverSuccess"
              :on-error="handleUploadError">
              <div v-if="formData.cover_image" class="cover-preview">
                <img :src="getCoverImageUrl(formData.cover_image)" class="cover-image" />
                <div class="cover-mask">
                  <el-icon class="cover-icon">
                    <View />
                  </el-icon>
                  <span class="cover-text">点击重新上传</span>
                </div>
              </div>
              <div v-else class="cover-upload-placeholder">
                <el-icon class="upload-icon">
                  <Plus />
                </el-icon>
                <div class="upload-text">点击上传封面</div>
                <div class="upload-hint">支持 jpg、png、gif 格式，不超过 5MB</div>
              </div>
            </el-upload>
            <div v-if="formData.cover_image" class="cover-actions">
              <el-button type="danger" size="small" :icon="Delete" @click="removeCoverImage">删除封面</el-button>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="新闻内容" prop="content">
          <el-input v-model="formData.content" type="textarea" :rows="10" placeholder="请输入新闻内容" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="状态">
              <el-radio-group v-model="formData.status">
                <el-radio value="draft">草稿</el-radio>
                <el-radio value="published">发布</el-radio>
                <el-radio value="archived">归档</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否置顶">
              <el-switch v-model="formData.is_top" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveNews">
          {{ editingNews ? '更新' : '发布' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete, View } from '@element-plus/icons-vue'
import api from '@/utils/api'
import { useAuthStore } from '@/stores/auth'

// 状态管理
const authStore = useAuthStore()
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingNews = ref(null)

// 数据
const newsList = ref([])
const searchQuery = ref('')
const filters = reactive({
  category: '',
  status: ''
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

// 排序
const sort = reactive({
  field: 'created_at',
  order: 'DESC'
})

// 表单
const formRef = ref()
const formData = reactive({
  title: '',
  summary: '',
  content: '',
  author: '',
  category: '',
  cover_image: '',
  status: 'draft',
  is_top: 0,
  publish_time: ''
})

const formRules = {
  title: [{ required: true, message: '请输入新闻标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  summary: [{ required: true, message: '请输入新闻摘要', trigger: 'blur' }],
  content: [{ required: true, message: '请输入新闻内容', trigger: 'blur' }]
}

// 上传配置
const uploadUrl = computed(() => '/api/news/upload-cover')
const uploadHeaders = computed(() => ({
  'Authorization': `Bearer ${authStore.token}`
}))

// 搜索防抖
let searchTimeout = null

// 加载新闻列表
const loadNews = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      sort: sort.field,
      order: sort.order
    }

    if (filters.category) params.category = filters.category
    if (filters.status) params.status = filters.status
    if (searchQuery.value) params.search = searchQuery.value

    const response = await api.get('/news/admin/list', { params })

    if (response && response.data) {
      newsList.value = response.data.news || []
      pagination.total = response.data.pagination?.total || 0
    }
  } catch (error) {
    console.error('加载新闻列表失败:', error)
    ElMessage.error('加载新闻列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.page = 1
    loadNews()
  }, 500)
}

// 排序处理
const handleSort = ({ prop, order }) => {
  sort.field = prop || 'created_at'
  sort.order = order === 'ascending' ? 'ASC' : 'DESC'
  pagination.page = 1
  loadNews()
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.limit = size
  pagination.page = 1
  loadNews()
}

const handlePageChange = (page) => {
  pagination.page = page
  loadNews()
}

// 显示创建对话框
const showCreateDialog = () => {
  editingNews.value = null
  resetForm()
  dialogVisible.value = true
}

// 编辑新闻
const editNews = (news) => {
  editingNews.value = news
  Object.keys(formData).forEach(key => {
    if (key === 'is_top') {
      formData[key] = news[key] ? 1 : 0
    } else {
      formData[key] = news[key] || ''
    }
  })
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  Object.keys(formData).forEach(key => {
    formData[key] = key === 'is_top' ? 0 : (key === 'status' ? 'draft' : '')
  })
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 保存新闻
const saveNews = async () => {
  try {
    await formRef.value.validate()
    saving.value = true

    const submitData = { ...formData }
    // 清理空值和数据类型转换
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '') {
        submitData[key] = null
      } else if (key === 'is_top') {
        submitData[key] = submitData[key] ? 1 : 0
      }
    })

    if (editingNews.value) {
      await api.put(`/news/admin/${editingNews.value.id}`, submitData)
      ElMessage.success('更新新闻成功')
    } else {
      await api.post('/news/admin', submitData)
      ElMessage.success('发布新闻成功')
    }

    dialogVisible.value = false
    loadNews()
  } catch (error) {
    console.error('保存新闻失败:', error)
    ElMessage.error('保存新闻失败')
  } finally {
    saving.value = false
  }
}

// 删除新闻
const deleteNews = async (news) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除新闻 "${news.title}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await api.delete(`/news/admin/${news.id}`)
    ElMessage.success('删除新闻成功')
    loadNews()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除新闻失败:', error)
      ElMessage.error('删除新闻失败')
    }
  }
}

// 封面上传
const beforeCoverUpload = (file) => {
  const isImage = /^image\//.test(file.type)
  const isLt2M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

const handleCoverSuccess = (response) => {
  if (response.success) {
    formData.cover_image = response.data.cover_url
    ElMessage.success('封面上传成功')
  } else {
    ElMessage.error('封面上传失败')
  }
}

const handleUploadError = (error) => {
  console.error('封面上传失败:', error)
  ElMessage.error('封面上传失败，请重试')
}

// 删除封面图片
const removeCoverImage = () => {
  formData.cover_image = ''
  ElMessage.success('已删除封面图片')
}

// 获取封面图片URL
const getCoverImageUrl = (coverImage) => {
  if (!coverImage) return ''
  // 如果已经是完整URL，直接返回
  if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
    return coverImage
  }
  // 直接返回相对路径，Vite会通过代理转发到后端
  if (coverImage.startsWith('/')) {
    return coverImage
  }
  return `/${coverImage}`
}

// 工具函数
const getCategoryText = (category) => {
  const map = {
    news: '学术新闻',
    announcement: '活动通知',
    achievement: '获奖信息',
    activity: '学术活动'
  }
  return map[category] || category
}

const getCategoryTagType = (category) => {
  const map = {
    news: 'primary',
    announcement: 'warning',
    achievement: 'success',
    activity: 'info'
  }
  return map[category] || ''
}

const getStatusText = (status) => {
  const map = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    draft: 'info',
    published: 'success',
    archived: 'warning'
  }
  return map[status] || ''
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  loadNews()
})
</script>

<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-left {
  display: flex;
  gap: 15px;
  align-items: center;
}

.filter-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

.pagination-row {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.cover-upload-container {
  width: 100%;
}

.cover-uploader :deep(.el-upload) {
  border: 2px dashed var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 400px;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}

.cover-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
  background-color: #f5f7fa;
}

/* 上传占位符样式 */
.cover-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #8c939d;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 12px;
  color: #c0c4cc;
}

.upload-text {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
}

/* 封面预览样式 */
.cover-preview {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.cover-preview .cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
}

.cover-preview:hover .cover-mask {
  opacity: 1;
}

.cover-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.cover-text {
  font-size: 14px;
  font-weight: 500;
}

/* 操作按钮区域 */
.cover-actions {
  margin-top: 12px;
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-left,
  .filter-right {
    width: 100%;
    justify-content: flex-start;
  }

  .cover-uploader :deep(.el-upload) {
    max-width: 100%;
    height: 200px;
  }

  .upload-icon {
    font-size: 36px;
  }

  .cover-icon {
    font-size: 28px;
  }
}
</style>
