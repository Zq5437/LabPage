<template>
  <div class="recruitment-management">
    <!-- 搜索和操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input v-model="searchForm.search" placeholder="搜索招生标题、描述..." style="width: 300px" clearable
          @keyup.enter="handleSearch">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>

        <el-select v-model="searchForm.type" placeholder="选择类型" clearable style="width: 150px" @change="handleSearch">
          <el-option label="硕士研究生" value="master" />
          <el-option label="博士研究生" value="phd" />
          <el-option label="博士后" value="postdoc" />
          <el-option label="访问学者" value="visiting" />
        </el-select>

        <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 120px" @change="handleSearch">
          <el-option label="正在招生" value="open" />
          <el-option label="已结束" value="closed" />
          <el-option label="已满员" value="filled" />
        </el-select>

        <el-button type="primary" @click="handleSearch">
          <el-icon>
            <Search />
          </el-icon>
          搜索
        </el-button>
      </div>

      <div class="toolbar-right">
        <el-button type="primary" @click="handleCreate">
          <el-icon>
            <Plus />
          </el-icon>
          发布招生信息
        </el-button>
      </div>
    </div>

    <!-- 招生信息列表 -->
    <el-table :data="recruitment" v-loading="loading" empty-text="暂无招生信息">
      <el-table-column prop="title" label="招生标题" min-width="200" />

      <el-table-column prop="type" label="招生类型" width="120">
        <template #default="{ row }">
          <el-tag size="small">{{ row.type }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="deadline" label="截止日期" width="120">
        <template #default="{ row }">
          <span :class="{ 'deadline-warning': isDeadlineNear(row.deadline) }">
            {{ formatDate(row.deadline) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column prop="contact_info" label="联系信息" width="150">
        <template #default="{ row }">
          <div class="contact-info">
            {{ row.contact_info?.substring(0, 30) }}{{ row.contact_info?.length > 30 ? '...' : '' }}
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="created_at" label="创建时间" width="120">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.limit"
        :page-sizes="[10, 20, 50]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadRecruitment" @current-change="loadRecruitment" />
    </div>

    <!-- 添加/编辑招生信息对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="招生标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入招生标题" maxlength="100" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="招生类型" prop="type">
              <el-select v-model="form.type" placeholder="选择招生类型" style="width: 100%" filterable allow-create>
                <el-option label="硕士研究生" value="master" />
                <el-option label="博士研究生" value="phd" />
                <el-option label="博士后" value="postdoc" />
                <el-option label="访问学者" value="visiting" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="招生名额" prop="positions">
              <el-input-number v-model="form.positions" :min="1" :max="100" style="width: 100%" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="是否置顶">
              <el-switch v-model="form.is_featured" active-text="置顶" inactive-text="普通" />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="招生描述" prop="description">
              <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入详细的招生描述" maxlength="2000"
                show-word-limit />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="招生要求">
              <el-input v-model="form.requirements" type="textarea" :rows="4" placeholder="请输入招生要求和条件" maxlength="2000"
                show-word-limit />
            </el-form-item>
          </el-col>


          <el-col :span="12">
            <el-form-item label="联系信息" prop="contact_info">
              <el-input v-model="form.contact_info" type="textarea" :rows="3" placeholder="请输入联系方式（邮箱、电话等）"
                maxlength="500" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="截止日期">
              <el-date-picker v-model="form.deadline" type="date" placeholder="选择申请截止日期" style="width: 100%"
                format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
            </el-form-item>

            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio label="open">正在招生</el-radio>
                <el-radio label="closed">已结束</el-radio>
                <el-radio label="filled">已满员</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="附件">
              <el-upload ref="uploadRef" :auto-upload="false" :limit="1" accept=".pdf,.doc,.docx,image/*"
                :on-change="handleFileChange" :on-remove="handleFileRemove" :file-list="fileList">
                <el-button type="primary">
                  <el-icon>
                    <Upload />
                  </el-icon>
                  选择文件
                </el-button>
                <template #tip>
                  <div class="el-upload__tip">
                    可上传PDF、Word文档或图片，文件大小不超过10MB
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ dialogMode === 'create' ? '创建' : '更新' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { recruitmentApi } from '@/utils/api'
import {
  Search, Plus, Edit, Delete, Upload
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const recruitment = ref([])
const dialogVisible = ref(false)
const dialogMode = ref('create') // create | edit
const currentId = ref(null)
const formRef = ref()
const uploadRef = ref()
const fileList = ref([])

// 搜索表单
const searchForm = reactive({
  search: '',
  type: '',
  status: ''
})

// 分页数据
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

// 表单数据
const form = reactive({
  title: '',
  type: '',
  positions: 1,
  description: '',
  requirements: '',
  contact_info: '',
  deadline: '',
  status: 'open',
  is_featured: false,
  attachment: null
})

// 对话框标题
const dialogTitle = computed(() => {
  return dialogMode.value === 'create' ? '发布招生信息' : '编辑招生信息'
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入招生标题', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择招生类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入招生描述', trigger: 'blur' }
  ],
  contact_info: [
    { required: true, message: '请输入联系信息', trigger: 'blur' }
  ]
}

// 加载招生信息列表
const loadRecruitment = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm
    }

    const response = await recruitmentApi.getList(params)
    recruitment.value = response.data || []

    if (response.pagination) {
      pagination.total = response.pagination.total
      pagination.page = response.pagination.page
      pagination.limit = response.pagination.limit
    }
  } catch (error) {
    console.error('加载招生信息列表失败:', error)
    ElMessage.error('加载招生信息列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadRecruitment()
}

// 创建招生信息
const handleCreate = () => {
  dialogMode.value = 'create'
  currentId.value = null
  resetForm()
  dialogVisible.value = true
}

// 编辑招生信息
const handleEdit = (row) => {
  dialogMode.value = 'edit'
  currentId.value = row.id

  // 填充表单数据
  Object.keys(form).forEach(key => {
    if (key in row) {
      form[key] = row[key]
    }
  })

  // 处理现有附件
  if (row.attachment_url) {
    fileList.value = [{
      name: '当前附件',
      url: row.attachment_url
    }]
  }

  dialogVisible.value = true
}

// 删除招生信息
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除招生信息"${row.title}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await recruitmentApi.delete(row.id)
    ElMessage.success('删除成功')
    loadRecruitment()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 文件上传处理
const handleFileChange = (file) => {
  form.attachment = file.raw
}

const handleFileRemove = () => {
  form.attachment = null
}

// 检查截止日期是否临近
const isDeadlineNear = (deadline) => {
  if (!deadline) return false
  const deadlineDate = new Date(deadline)
  const now = new Date()
  const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24))
  return diffDays <= 7 && diffDays >= 0
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true

    const submitData = { ...form }

    if (dialogMode.value === 'create') {
      await recruitmentApi.create(submitData)
      ElMessage.success('招生信息创建成功')
    } else {
      await recruitmentApi.update(currentId.value, submitData)
      ElMessage.success('招生信息更新成功')
    }

    dialogVisible.value = false
    loadRecruitment()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  fileList.value = []
  form.attachment = null
  Object.keys(form).forEach(key => {
    if (key === 'status') {
      form[key] = 'active'
    } else if (key !== 'attachment') {
      form[key] = ''
    }
  })
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    open: 'success',
    closed: 'info',
    filled: 'warning'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    open: '正在招生',
    closed: '已结束',
    filled: '已满员'
  }
  return statusMap[status] || status
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 初始化
onMounted(() => {
  loadRecruitment()
})
</script>

<style scoped>
.recruitment-management {
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.toolbar-left {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.toolbar-right {
  display: flex;
  gap: 10px;
}

.contact-info {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.deadline-warning {
  color: var(--el-color-warning);
  font-weight: 500;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
  }

  .toolbar-left,
  .toolbar-right {
    flex-direction: column;
  }

  .toolbar-left .el-input,
  .toolbar-left .el-select {
    width: 100% !important;
  }
}
</style>