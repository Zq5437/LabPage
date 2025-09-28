<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="header-row">
          <h3>成员管理</h3>
          <el-button type="primary" @click="showCreateDialog">
            <el-icon>
              <Plus />
            </el-icon>
            添加成员
          </el-button>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="filter-row">
        <div class="filter-left">
          <el-input v-model="searchQuery" placeholder="搜索成员姓名..." style="width: 250px" clearable @input="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>

        <div class="filter-right">
          <el-select v-model="filters.category" placeholder="选择类别" clearable style="width: 130px; margin-right: 10px"
            @change="loadMembers">
            <el-option label="教师" value="faculty" />
            <el-option label="博士后" value="postdoc" />
            <el-option label="博士生" value="phd" />
            <el-option label="硕士生" value="master" />
            <el-option label="本科生" value="undergraduate" />
            <el-option label="校友" value="alumni" />
          </el-select>

          <el-select v-model="filters.status" placeholder="选择状态" clearable style="width: 120px" @change="loadMembers">
            <el-option label="活跃" value="active" />
            <el-option label="非活跃" value="inactive" />
            <el-option label="校友" value="alumni" />
          </el-select>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table :data="members" v-loading="loading" style="width: 100%" @sort-change="handleSort">
        <el-table-column prop="id" label="ID" width="60" sortable="custom" />

        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="50" :src="row.avatar" :icon="UserFilled" style="border: 1px solid #dcdfe6" />
          </template>
        </el-table-column>

        <el-table-column prop="name" label="姓名" min-width="120" sortable="custom">
          <template #default="{ row }">
            <div>
              <div style="font-weight: 500">{{ row.name }}</div>
              <div style="font-size: 12px; color: #999; font-style: italic">{{ row.name_en }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="title" label="职位" min-width="150" />

        <el-table-column prop="category" label="类别" width="100">
          <template #default="{ row }">
            <el-tag :type="getCategoryTagType(row.category)" size="small">
              {{ getCategoryText(row.category) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="email" label="邮箱" min-width="180" />

        <el-table-column prop="research_interests" label="研究兴趣" min-width="200">
          <template #default="{ row }">
            <div v-if="row.research_interests" class="interests-tags">
              <el-tag v-for="interest in getInterests(row.research_interests)" :key="interest" size="small"
                style="margin-right: 4px; margin-bottom: 4px" effect="light">
                {{ interest }}
              </el-tag>
            </div>
            <span v-else style="color: #ccc">-</span>
          </template>
        </el-table-column>

        <el-table-column prop="sort_order" label="排序" width="80" sortable="custom" />

        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="创建时间" width="180" sortable="custom">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editMember(row)">
              <el-icon>
                <Edit />
              </el-icon>
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="deleteMember(row)">
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
    <el-dialog v-model="dialogVisible" :title="editingMember ? '编辑成员' : '添加成员'" width="700px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="中文姓名" prop="name">
              <el-input v-model="formData.name" placeholder="请输入中文姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="英文姓名" prop="name_en">
              <el-input v-model="formData.name_en" placeholder="请输入英文姓名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="职位" prop="title">
              <el-input v-model="formData.title" placeholder="请输入职位" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类别" prop="category">
              <el-select v-model="formData.category" placeholder="选择类别" style="width: 100%">
                <el-option label="教师" value="faculty" />
                <el-option label="博士后" value="postdoc" />
                <el-option label="博士生" value="phd" />
                <el-option label="硕士生" value="master" />
                <el-option label="本科生" value="undergraduate" />
                <el-option label="校友" value="alumni" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="formData.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话">
              <el-input v-model="formData.phone" placeholder="请输入电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="办公室">
          <el-input v-model="formData.office" placeholder="请输入办公室" />
        </el-form-item>

        <el-form-item label="头像">
          <el-upload class="avatar-uploader" :action="uploadUrl" :headers="uploadHeaders" :show-file-list="false"
            name="avatar" :before-upload="beforeAvatarUpload" :on-success="handleAvatarSuccess"
            :on-error="handleUploadError">
            <img v-if="formData.avatar" :src="formData.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="个人简介">
          <el-input v-model="formData.bio" type="textarea" :rows="3" placeholder="请输入个人简介" />
        </el-form-item>

        <el-form-item label="研究兴趣">
          <el-input v-model="formData.research_interests" placeholder="多个兴趣请用英文逗号分隔" />
        </el-form-item>

        <el-form-item label="教育背景">
          <el-input v-model="formData.education" type="textarea" :rows="2" placeholder="请输入教育背景" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="个人主页">
              <el-input v-model="formData.homepage" placeholder="个人主页链接" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Google Scholar">
              <el-input v-model="formData.google_scholar" placeholder="Google Scholar链接" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="ORCID">
              <el-input v-model="formData.orcid" placeholder="ORCID" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="入学/入职日期">
              <el-date-picker v-model="formData.join_date" type="date" placeholder="选择日期" style="width: 100%"
                value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="毕业日期">
              <el-date-picker v-model="formData.graduation_date" type="date" placeholder="选择日期" style="width: 100%"
                value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="排序">
              <el-input-number v-model="formData.sort_order" :min="0" :max="999" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio value="active">活跃</el-radio>
            <el-radio value="inactive">非活跃</el-radio>
            <el-radio value="alumni">校友</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveMember">
          {{ editingMember ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete, UserFilled } from '@element-plus/icons-vue'
import api from '@/utils/api'
import { useAuthStore } from '@/stores/auth'

// 状态管理
const authStore = useAuthStore()
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingMember = ref(null)

// 数据
const members = ref([])
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
  field: 'sort_order',
  order: 'DESC'
})

// 表单
const formRef = ref()
const formData = reactive({
  name: '',
  name_en: '',
  title: '',
  category: '',
  email: '',
  phone: '',
  office: '',
  avatar: '',
  bio: '',
  research_interests: '',
  education: '',
  homepage: '',
  google_scholar: '',
  orcid: '',
  join_date: '',
  graduation_date: '',
  sort_order: 0,
  status: 'active'
})

const formRules = {
  name: [{ required: true, message: '请输入中文姓名', trigger: 'blur' }],
  category: [{ required: true, message: '请选择类别', trigger: 'change' }],
  email: [{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }]
}

// 上传配置
const uploadUrl = computed(() => '/api/members/upload-avatar')
const uploadHeaders = computed(() => ({
  'Authorization': `Bearer ${authStore.token}`
}))

// 搜索防抖
let searchTimeout = null

// 加载成员列表
const loadMembers = async () => {
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

    const response = await api.get('/members/admin/list', { params })

    if (response && response.data) {
      members.value = response.data.members || []
      pagination.total = response.data.pagination?.total || 0
    }
  } catch (error) {
    console.error('加载成员列表失败:', error)
    ElMessage.error('加载成员列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.page = 1
    loadMembers()
  }, 500)
}

// 排序处理
const handleSort = ({ prop, order }) => {
  sort.field = prop || 'sort_order'
  sort.order = order === 'ascending' ? 'ASC' : 'DESC'
  pagination.page = 1
  loadMembers()
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.limit = size
  pagination.page = 1
  loadMembers()
}

const handlePageChange = (page) => {
  pagination.page = page
  loadMembers()
}

// 显示创建对话框
const showCreateDialog = () => {
  editingMember.value = null
  resetForm()
  dialogVisible.value = true
}

// 编辑成员
const editMember = (member) => {
  editingMember.value = member
  Object.keys(formData).forEach(key => {
    formData[key] = member[key] || (key === 'sort_order' ? 0 : '')
  })
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  Object.keys(formData).forEach(key => {
    formData[key] = key === 'sort_order' ? 0 : (key === 'status' ? 'active' : '')
  })
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 保存成员
const saveMember = async () => {
  try {
    await formRef.value.validate()
    saving.value = true

    const submitData = { ...formData }
    // 清理空值
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '') submitData[key] = null
    })

    if (editingMember.value) {
      await api.put(`/members/${editingMember.value.id}`, submitData)
      ElMessage.success('更新成员成功')
    } else {
      await api.post('/members', submitData)
      ElMessage.success('创建成员成功')
    }

    dialogVisible.value = false
    loadMembers()
  } catch (error) {
    console.error('保存成员失败:', error)
    ElMessage.error('保存成员失败')
  } finally {
    saving.value = false
  }
}

// 删除成员
const deleteMember = async (member) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除成员 "${member.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await api.delete(`/members/${member.id}`)
    ElMessage.success('删除成员成功')
    loadMembers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除成员失败:', error)
      ElMessage.error('删除成员失败')
    }
  }
}

// 头像上传
const beforeAvatarUpload = (file) => {
  const isImage = /^image\//.test(file.type)
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

const handleAvatarSuccess = (response) => {
  if (response.success) {
    formData.avatar = response.data.avatar_url
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error('头像上传失败')
  }
}

const handleUploadError = () => {
  ElMessage.error('头像上传失败')
}

// 工具函数
const getCategoryText = (category) => {
  const map = {
    faculty: '教师',
    postdoc: '博士后',
    phd: '博士生',
    master: '硕士生',
    undergraduate: '本科生',
    alumni: '校友'
  }
  return map[category] || category
}

const getCategoryTagType = (category) => {
  const map = {
    faculty: 'danger',
    postdoc: 'warning',
    phd: 'primary',
    master: 'success',
    undergraduate: 'info',
    alumni: ''
  }
  return map[category] || ''
}

const getStatusText = (status) => {
  const map = {
    active: '活跃',
    inactive: '非活跃',
    alumni: '校友'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    active: 'success',
    inactive: 'warning',
    alumni: 'info'
  }
  return map[status] || ''
}

const getInterests = (interests) => {
  if (!interests) return []
  return interests.split(',').map(item => item.trim()).filter(item => item)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  loadMembers()
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

.interests-tags {
  max-width: 200px;
}

.pagination-row {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  border-radius: 6px;
  display: block;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
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
}
</style>
