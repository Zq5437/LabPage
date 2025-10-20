<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="header-row">
          <h3>项目管理</h3>
          <el-button type="primary" @click="showCreateDialog">
            <el-icon>
              <Plus />
            </el-icon>
            创建项目
          </el-button>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="filter-row">
        <div class="filter-left">
          <el-input v-model="searchQuery" placeholder="搜索项目标题..." style="width: 250px" clearable @input="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>

        <div class="filter-right">
          <el-select v-model="filters.category" placeholder="选择类别" clearable style="width: 150px; margin-right: 10px"
            @change="loadProjects">
            <el-option label="国家级" value="national" />
            <el-option label="省部级" value="provincial" />
            <el-option label="校级" value="institutional" />
            <el-option label="企业合作" value="enterprise" />
            <el-option label="国际合作" value="international" />
          </el-select>

          <el-select v-model="filters.status" placeholder="选择状态" clearable style="width: 120px" @change="loadProjects">
            <el-option label="进行中" value="ongoing" />
            <el-option label="已完成" value="completed" />
            <el-option label="暂停" value="suspended" />
          </el-select>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table :data="projectsList" v-loading="loading" style="width: 100%" @sort-change="handleSort">
        <el-table-column prop="id" label="ID" width="80" sortable="custom" />

        <el-table-column prop="title" label="项目标题" min-width="200" sortable="custom">
          <template #default="{ row }">
            <div class="title-cell">
              <div class="title">{{ row.title }}</div>
              <div v-if="row.title_en" class="title-en">{{ row.title_en }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="category" label="类别" width="120" sortable="custom">
          <template #default="{ row }">
            <el-tag :type="getCategoryTagType(row.category)" size="small">
              {{ getCategoryText(row.category) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="principal_investigator" label="负责人" width="120" sortable="custom" />

        <el-table-column prop="funding_amount" label="资助金额" width="120" sortable="custom">
          <template #default="{ row }">
            <span v-if="row.funding_amount">{{ formatCurrency(row.funding_amount) }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" sortable="custom">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="start_date" label="开始时间" width="120" sortable="custom">
          <template #default="{ row }">
            {{ formatDate(row.start_date) }}
          </template>
        </el-table-column>

        <el-table-column prop="end_date" label="结束时间" width="120" sortable="custom">
          <template #default="{ row }">
            {{ formatDate(row.end_date) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editProject(row)">
              <el-icon>
                <Edit />
              </el-icon>
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="deleteProject(row)">
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
          :total="pagination.total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handlePageChange" />
      </div>
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="editingProject ? '编辑项目' : '创建项目'" width="900px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目标题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入项目标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="英文标题" prop="title_en">
              <el-input v-model="formData.title_en" placeholder="请输入英文标题（可选）" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="项目类别" prop="category">
              <el-select v-model="formData.category" placeholder="选择类别" style="width: 100%">
                <el-option label="国家级" value="national" />
                <el-option label="省部级" value="provincial" />
                <el-option label="校级" value="institutional" />
                <el-option label="企业合作" value="enterprise" />
                <el-option label="国际合作" value="international" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="项目状态" prop="status">
              <el-select v-model="formData.status" placeholder="选择状态" style="width: 100%">
                <el-option label="进行中" value="ongoing" />
                <el-option label="已完成" value="completed" />
                <el-option label="暂停" value="suspended" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="资助金额" prop="funding_amount">
              <el-input-number v-model="formData.funding_amount" placeholder="资助金额" style="width: 100%" :precision="2"
                :min="0" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目负责人" prop="principal_investigator">
              <el-input v-model="formData.principal_investigator" placeholder="请输入项目负责人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资助机构" prop="funding_agency">
              <el-input v-model="formData.funding_agency" placeholder="请输入资助机构" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="start_date">
              <el-date-picker v-model="formData.start_date" type="date" placeholder="选择开始时间" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="end_date">
              <el-date-picker v-model="formData.end_date" type="date" placeholder="选择结束时间" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="项目描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入项目描述" />
        </el-form-item>

        <el-form-item label="参与人员" prop="participants">
          <el-input v-model="formData.participants" type="textarea" :rows="3" placeholder="请输入参与人员（多人用逗号分隔）" />
        </el-form-item>

        <el-form-item label="项目封面">
          <el-upload class="cover-uploader" :action="uploadUrl" :headers="uploadHeaders" :show-file-list="false"
            name="cover_image" :before-upload="beforeCoverUpload" :on-success="handleCoverSuccess"
            :on-error="handleUploadError" accept="image/*">
            <img v-if="formData.cover_image" :src="formData.cover_image" class="cover-image" />
            <el-icon v-else class="cover-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
          <div class="upload-tip">
            支持 JPG、PNG、GIF 格式，大小不超过 2MB
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="saving" @click="saveProject">
            {{ editingProject ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'
import api from '@/utils/api'
import { useAuthStore } from '@/stores/auth'

// 状态管理
const authStore = useAuthStore()
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingProject = ref(null)

// 数据
const projectsList = ref([])
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
  title_en: '',
  description: '',
  category: '',
  funding_agency: '',
  funding_amount: null,
  principal_investigator: '',
  participants: '',
  start_date: '',
  end_date: '',
  status: 'ongoing',
  cover_image: ''
})

const formRules = {
  title: [{ required: true, message: '请输入项目标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择项目类别', trigger: 'change' }],
  principal_investigator: [{ required: true, message: '请输入项目负责人', trigger: 'blur' }],
  description: [{ required: true, message: '请输入项目描述', trigger: 'blur' }]
}

// 上传配置
const uploadUrl = computed(() => '/api/projects/upload-cover')
const uploadHeaders = computed(() => ({
  'Authorization': `Bearer ${authStore.token}`
}))

// 搜索防抖
let searchTimeout = null

// 加载项目列表
const loadProjects = async () => {
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

    const response = await api.get('/projects/admin/list', { params })

    if (response && response.data) {
      projectsList.value = response.data.projects || []
      pagination.total = response.data.pagination?.total || 0
    }
  } catch (error) {
    console.error('加载项目列表失败:', error)
    ElMessage.error('加载项目列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.page = 1
    loadProjects()
  }, 500)
}

// 排序处理
const handleSort = ({ prop, order }) => {
  sort.field = prop
  sort.order = order === 'ascending' ? 'ASC' : 'DESC'
  loadProjects()
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.limit = size
  pagination.page = 1
  loadProjects()
}

const handlePageChange = (page) => {
  pagination.page = page
  loadProjects()
}

// 显示创建对话框
const showCreateDialog = () => {
  editingProject.value = null
  resetForm()
  dialogVisible.value = true
}

// 编辑项目
const editProject = (project) => {
  editingProject.value = project
  Object.keys(formData).forEach(key => {
    if (key === 'start_date' || key === 'end_date') {
      formData[key] = project[key] ? new Date(project[key]) : ''
    } else {
      formData[key] = project[key] || ''
    }
  })
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  Object.keys(formData).forEach(key => {
    if (key === 'status') {
      formData[key] = 'ongoing'
    } else if (key === 'funding_amount') {
      formData[key] = null
    } else {
      formData[key] = ''
    }
  })
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 保存项目
const saveProject = async () => {
  try {
    await formRef.value.validate()
    saving.value = true

    const submitData = { ...formData }
    // 处理日期格式
    if (submitData.start_date) {
      submitData.start_date = submitData.start_date.toISOString().split('T')[0]
    }
    if (submitData.end_date) {
      submitData.end_date = submitData.end_date.toISOString().split('T')[0]
    }

    // 清理空值
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '') submitData[key] = null
    })

    console.log('保存项目数据:', submitData)
    console.log('封面图片URL:', submitData.cover_image)

    if (editingProject.value) {
      await api.put(`/projects/admin/${editingProject.value.id}`, submitData)
      ElMessage.success('更新项目成功')
    } else {
      await api.post('/projects/admin', submitData)
      ElMessage.success('创建项目成功')
    }

    dialogVisible.value = false
    loadProjects()
  } catch (error) {
    console.error('保存项目失败:', error)
    ElMessage.error('保存项目失败')
  } finally {
    saving.value = false
  }
}

// 删除项目
const deleteProject = async (project) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除项目 "${project.title}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await api.delete(`/projects/admin/${project.id}`)
    ElMessage.success('删除项目成功')
    loadProjects()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除项目失败:', error)
      ElMessage.error('删除项目失败')
    }
  }
}

// 上传处理
const beforeCoverUpload = (file) => {
  console.log('准备上传文件:', file)
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('文件大小不能超过 2MB!')
    return false
  }

  ElMessage.info('正在上传封面图片...')
  return true
}

const handleCoverSuccess = (response) => {
  console.log('上传成功响应:', response)
  if (response && response.success) {
    formData.cover_image = response.data.cover_url
    ElMessage.success('封面上传成功')
  } else {
    ElMessage.error('上传响应格式错误')
  }
}

const handleUploadError = (error) => {
  console.error('上传失败:', error)
  ElMessage.error('封面上传失败: ' + (error.message || '未知错误'))
}

// 生命周期
onMounted(() => {
  loadProjects()
})

// 工具函数
const getCategoryText = (category) => {
  const map = {
    national: '国家级',
    provincial: '省部级',
    institutional: '校级',
    enterprise: '企业合作',
    international: '国际合作'
  }
  return map[category] || category
}

const getCategoryTagType = (category) => {
  const map = {
    national: 'danger',
    provincial: 'warning',
    institutional: 'info',
    enterprise: 'success',
    international: 'primary'
  }
  return map[category] || ''
}

const getStatusText = (status) => {
  const map = {
    ongoing: '进行中',
    completed: '已完成',
    suspended: '暂停'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    ongoing: 'success',
    completed: 'info',
    suspended: 'warning'
  }
  return map[status] || ''
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const formatCurrency = (amount) => {
  if (!amount) return '0'
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}

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
}

.filter-right {
  display: flex;
  gap: 10px;
}

.pagination-row {
  margin-top: 20px;
  text-align: right;
}

.title-cell .title {
  font-weight: 500;
  color: #303133;
}

.title-cell .title-en {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.text-muted {
  color: #c0c4cc;
}

.dialog-footer {
  text-align: right;
}

/* 封面上传样式 */
.cover-uploader {
  display: inline-block;
}

.cover-image {
  width: 148px;
  height: 148px;
  object-fit: cover;
  border-radius: 6px;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 148px;
  height: 148px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fafafa;
}

.cover-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.cover-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
}

.upload-tip {
  margin-top: 5px;
  font-size: 12px;
  color: #999;
}
</style>