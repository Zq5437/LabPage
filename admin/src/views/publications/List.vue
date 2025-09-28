<template>
  <div class="publications-list">
    <!-- 搜索和操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchForm.search"
          placeholder="搜索论文标题、作者、期刊..."
          style="width: 300px"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="searchForm.category"
          placeholder="选择分类"
          clearable
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option
            v-for="category in categories"
            :key="category.category"
            :label="category.category"
            :value="category.category"
          />
        </el-select>

        <el-select
          v-model="searchForm.year"
          placeholder="选择年份"
          clearable
          style="width: 120px"
          @change="handleSearch"
        >
          <el-option
            v-for="year in years"
            :key="year.year"
            :label="year.year"
            :value="year.year"
          />
        </el-select>

        <el-select
          v-model="searchForm.status"
          placeholder="选择状态"
          clearable
          style="width: 120px"
          @change="handleSearch"
        >
          <el-option label="已发布" value="published" />
          <el-option label="草稿" value="draft" />
          <el-option label="已归档" value="archived" />
        </el-select>

        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>

      <div class="toolbar-right">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          添加论文
        </el-button>
        <el-button
          type="danger"
          :disabled="selectedIds.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除 ({{ selectedIds.length }})
        </el-button>
      </div>
    </div>

    <!-- 论文列表 -->
    <el-table
      :data="publications"
      v-loading="loading"
      @selection-change="handleSelectionChange"
      empty-text="暂无论文数据"
    >
      <el-table-column type="selection" width="55" />
      
      <el-table-column prop="title" label="标题" min-width="200">
        <template #default="{ row }">
          <div class="title-cell">
            <h4>{{ row.title }}</h4>
            <p class="authors">{{ row.authors }}</p>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="journal" label="期刊" width="180" />

      <el-table-column prop="category" label="分类" width="120">
        <template #default="{ row }">
          <el-tag size="small">{{ row.category }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="publish_date" label="发布日期" width="120">
        <template #default="{ row }">
          {{ formatDate(row.publish_date) }}
        </template>
      </el-table-column>

      <el-table-column prop="citation_count" label="引用数" width="80" align="center" />

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

      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-dropdown @command="(command) => handleStatusChange(row, command)">
            <el-button type="warning" size="small">
              状态 <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="published">发布</el-dropdown-item>
                <el-dropdown-item command="draft">草稿</el-dropdown-item>
                <el-dropdown-item command="archived">归档</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadPublications"
        @current-change="loadPublications"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { publicationsApi } from '@/utils/api'
import {
  Search, Plus, Delete, ArrowDown
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const publications = ref([])
const selectedIds = ref([])
const categories = ref([])
const years = ref([])

// 搜索表单
const searchForm = reactive({
  search: '',
  category: '',
  year: '',
  status: ''
})

// 分页数据
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

// 加载论文列表
const loadPublications = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm
    }
    
    const response = await publicationsApi.getAdminList(params)
    publications.value = response.data || []
    
    if (response.pagination) {
      pagination.total = response.pagination.total
      pagination.page = response.pagination.page
      pagination.limit = response.pagination.limit
    }
  } catch (error) {
    console.error('加载论文列表失败:', error)
    ElMessage.error('加载论文列表失败')
  } finally {
    loading.value = false
  }
}

// 加载分类列表
const loadCategories = async () => {
  try {
    const data = await publicationsApi.getCategories()
    categories.value = data || []
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 加载年份列表
const loadYears = async () => {
  try {
    const data = await publicationsApi.getYears()
    years.value = data || []
  } catch (error) {
    console.error('加载年份失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadPublications()
}

// 创建论文
const handleCreate = () => {
  router.push('/publications/create')
}

// 编辑论文
const handleEdit = (row) => {
  router.push(`/publications/edit/${row.id}`)
}

// 删除论文
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除论文"${row.title}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await publicationsApi.delete(row.id)
    ElMessage.success('删除成功')
    loadPublications()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 篇论文吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await publicationsApi.batchDelete(selectedIds.value)
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    loadPublications()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
    }
  }
}

// 状态变更
const handleStatusChange = async (row, status) => {
  try {
    await publicationsApi.updateStatus(row.id, status)
    ElMessage.success('状态更新成功')
    loadPublications()
  } catch (error) {
    console.error('状态更新失败:', error)
  }
}

// 选择变更
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    published: 'success',
    draft: 'warning',
    archived: 'info'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    published: '已发布',
    draft: '草稿',
    archived: '已归档'
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
  loadPublications()
  loadCategories()
  loadYears()
})
</script>

<style scoped>
.publications-list {
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

.title-cell h4 {
  margin: 0 0 4px 0;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.title-cell .authors {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
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
