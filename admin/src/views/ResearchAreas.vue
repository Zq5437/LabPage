<template>
  <div class="research-areas-management">
    <!-- 搜索和操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchForm.search"
          placeholder="搜索研究方向标题、关键词..."
          style="width: 300px"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="searchForm.status"
          placeholder="选择状态"
          clearable
          style="width: 120px"
          @change="handleSearch"
        >
          <el-option label="活跃" value="active" />
          <el-option label="已停用" value="inactive" />
        </el-select>

        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>

      <div class="toolbar-right">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          添加研究方向
        </el-button>
      </div>
    </div>

    <!-- 研究方向列表 -->
    <el-table
      :data="researchAreas"
      v-loading="loading"
      empty-text="暂无研究方向数据"
    >
      <el-table-column prop="title" label="研究方向" min-width="200">
        <template #default="{ row }">
          <div class="area-cell">
            <img
              v-if="row.image_url"
              :src="row.image_url"
              class="area-image"
              @error="handleImageError"
            />
            <div class="area-info">
              <h4>{{ row.title }}</h4>
              <p>{{ row.description?.substring(0, 50) }}{{ row.description?.length > 50 ? '...' : '' }}</p>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="keywords" label="关键词" width="200">
        <template #default="{ row }">
          <el-tag
            v-for="keyword in getKeywords(row.keywords)"
            :key="keyword"
            size="small"
            style="margin-right: 5px; margin-bottom: 5px;"
          >
            {{ keyword }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="sort_order" label="排序" width="80" align="center" />

      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag
            :type="getStatusType(row.status)"
            size="small"
          >
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
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :page-sizes="[10, 20, 50]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadResearchAreas"
        @current-change="loadResearchAreas"
      />
    </div>

    <!-- 添加/编辑研究方向对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="方向标题" prop="title">
              <el-input
                v-model="form.title"
                placeholder="请输入研究方向标题"
                maxlength="100"
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="方向描述" prop="description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="5"
                placeholder="请详细描述该研究方向的内容、目标和特色"
                maxlength="2000"
                show-word-limit
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="关键词">
              <el-input
                v-model="form.keywords"
                placeholder="关键词，多个关键词用逗号分隔"
                maxlength="200"
              />
              <div class="form-tip">
                例如：机器学习,深度学习,计算机视觉,自然语言处理
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="配图">
              <el-upload
                ref="uploadRef"
                :auto-upload="false"
                :limit="1"
                accept="image/*"
                :on-change="handleImageChange"
                :on-remove="handleImageRemove"
                :file-list="imageList"
                list-type="picture-card"
              >
                <el-icon><Plus /></el-icon>
                <template #tip>
                  <div class="el-upload__tip">
                    只能上传图片文件，且不超过5MB
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="active">活跃</el-radio>
                <el-radio label="inactive">已停用</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="排序权重">
              <el-input-number
                v-model="form.sort_order"
                :min="0"
                style="width: 100%"
                placeholder="数值越大排序越靠前"
              />
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
import { researchAreasApi } from '@/utils/api'
import {
  Search, Plus, Edit, Delete
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const researchAreas = ref([])
const dialogVisible = ref(false)
const dialogMode = ref('create') // create | edit
const currentId = ref(null)
const formRef = ref()
const uploadRef = ref()
const imageList = ref([])

// 搜索表单
const searchForm = reactive({
  search: '',
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
  description: '',
  keywords: '',
  status: 'active',
  sort_order: 0,
  image: null
})

// 对话框标题
const dialogTitle = computed(() => {
  return dialogMode.value === 'create' ? '添加研究方向' : '编辑研究方向'
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入研究方向标题', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入方向描述', trigger: 'blur' }
  ]
}

// 加载研究方向列表
const loadResearchAreas = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm
    }
    
    const response = await researchAreasApi.getAdminList(params)
    researchAreas.value = response.data || []
    
    if (response.pagination) {
      pagination.total = response.pagination.total
      pagination.page = response.pagination.page
      pagination.limit = response.pagination.limit
    }
  } catch (error) {
    console.error('加载研究方向列表失败:', error)
    ElMessage.error('加载研究方向列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadResearchAreas()
}

// 创建研究方向
const handleCreate = () => {
  dialogMode.value = 'create'
  currentId.value = null
  resetForm()
  dialogVisible.value = true
}

// 编辑研究方向
const handleEdit = (row) => {
  dialogMode.value = 'edit'
  currentId.value = row.id
  
  // 填充表单数据
  Object.keys(form).forEach(key => {
    if (key in row) {
      form[key] = row[key]
    }
  })

  // 处理现有图片
  if (row.image_url) {
    imageList.value = [{
      name: '当前图片',
      url: row.image_url
    }]
  }

  dialogVisible.value = true
}

// 删除研究方向
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除研究方向"${row.title}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await researchAreasApi.delete(row.id)
    ElMessage.success('删除成功')
    loadResearchAreas()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 图片上传处理
const handleImageChange = (file) => {
  form.image = file.raw
}

const handleImageRemove = () => {
  form.image = null
}

// 图片加载错误处理
const handleImageError = (e) => {
  e.target.src = '/placeholder-research.png'
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true

    const submitData = { ...form }
    
    if (dialogMode.value === 'create') {
      await researchAreasApi.create(submitData)
      ElMessage.success('研究方向创建成功')
    } else {
      await researchAreasApi.update(currentId.value, submitData)
      ElMessage.success('研究方向更新成功')
    }

    dialogVisible.value = false
    loadResearchAreas()
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
  imageList.value = []
  form.image = null
  Object.keys(form).forEach(key => {
    if (key === 'status') {
      form[key] = 'active'
    } else if (key === 'sort_order') {
      form[key] = 0
    } else if (key !== 'image') {
      form[key] = ''
    }
  })
}

// 获取关键词数组
const getKeywords = (keywords) => {
  if (!keywords) return []
  return keywords.split(',').map(k => k.trim()).filter(k => k)
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    active: 'success',
    inactive: 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    active: '活跃',
    inactive: '已停用'
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
  loadResearchAreas()
})
</script>

<style scoped>
.research-areas-management {
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

.area-cell {
  display: flex;
  align-items: center;
  gap: 15px;
}

.area-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--el-border-color);
}

.area-info h4 {
  margin: 0 0 8px 0;
  font-weight: 500;
  color: var(--el-text-color-primary);
  font-size: 16px;
}

.area-info p {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.form-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 5px;
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
  
  .area-cell {
    flex-direction: column;
    text-align: center;
  }
}
</style>