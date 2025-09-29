<template>
  <div class="publications-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>论文发表管理</h2>
      <p>管理实验室发表的学术论文</p>
    </div>

    <!-- 操作工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="handleAdd">
          <el-icon>
            <Plus />
          </el-icon>
          添加论文
        </el-button>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          <el-icon>
            <Delete />
          </el-icon>
          批量删除
        </el-button>
      </div>

      <div class="toolbar-right">
        <el-input v-model="filters.search" placeholder="搜索论文标题、作者、期刊..." style="width: 300px" clearable
          @input="handleSearch">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>

        <el-select v-model="filters.type" placeholder="论文类型" clearable @change="loadData">
          <el-option label="期刊论文" value="journal" />
          <el-option label="会议论文" value="conference" />
          <el-option label="专著章节" value="book_chapter" />
          <el-option label="专利" value="patent" />
          <el-option label="学位论文" value="thesis" />
        </el-select>

        <el-select v-model="filters.year" placeholder="发表年份" clearable @change="loadData">
          <el-option v-for="year in years" :key="year" :label="year" :value="year" />
        </el-select>

        <el-button @click="resetFilters">重置</el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stats-card">
        <div class="stats-number">{{ stats.total || 0 }}</div>
        <div class="stats-label">总论文数</div>
      </div>
      <div class="stats-card">
        <div class="stats-number">{{ stats.totalCitations || 0 }}</div>
        <div class="stats-label">总引用数</div>
      </div>
      <div class="stats-card">
        <div class="stats-number">{{ stats.featuredCount || 0 }}</div>
        <div class="stats-label">重点论文</div>
      </div>
    </div>

    <!-- 论文表格 -->
    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" @selection-change="handleSelectionChange" stripe
        style="width: 100%">
        <el-table-column type="selection" width="55" />

        <el-table-column prop="title" label="论文标题" min-width="300">
          <template #default="{ row }">
            <div class="paper-title">
              <span>{{ row.title }}</span>
              <el-tag v-if="row.is_featured" type="success" size="small" style="margin-left: 8px">
                重点
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="authors" label="作者" width="200" show-overflow-tooltip />

        <el-table-column prop="journal" label="期刊/会议" width="180" show-overflow-tooltip />

        <el-table-column prop="year" label="年份" width="80" align="center" />

        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)" size="small">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="impact_factor" label="影响因子" width="100" align="center">
          <template #default="{ row }">
            {{ row.impact_factor || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="citations" label="引用数" width="80" align="center" />

        <el-table-column label="PDF" width="80" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.pdf_path" color="#67c23a" size="16">
              <Document />
            </el-icon>
            <span v-else style="color: #ccc">-</span>
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="创建时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="success" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-popconfirm title="确定要删除这篇论文吗？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button type="danger" size="small">
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 30, 50]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData" @current-change="loadData" />
      </div>
    </el-card>

    <!-- 论文详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="论文详情" width="80%" top="5vh">
      <div v-if="currentPaper" class="paper-detail">
        <div class="detail-section">
          <h3>{{ currentPaper.title }}</h3>
          <div class="paper-meta">
            <p><strong>作者：</strong>{{ currentPaper.authors }}</p>
            <p><strong>期刊/会议：</strong>{{ currentPaper.journal }}</p>
            <p><strong>发表年份：</strong>{{ currentPaper.year }}</p>
            <p v-if="currentPaper.volume"><strong>卷号：</strong>{{ currentPaper.volume }}</p>
            <p v-if="currentPaper.issue"><strong>期号：</strong>{{ currentPaper.issue }}</p>
            <p v-if="currentPaper.pages"><strong>页码：</strong>{{ currentPaper.pages }}</p>
            <p v-if="currentPaper.doi"><strong>DOI：</strong>
              <a :href="`https://doi.org/${currentPaper.doi}`" target="_blank">
                {{ currentPaper.doi }}
              </a>
            </p>
            <p v-if="currentPaper.impact_factor"><strong>影响因子：</strong>{{ currentPaper.impact_factor }}</p>
            <p><strong>引用数：</strong>{{ currentPaper.citations }}</p>
          </div>
        </div>

        <div v-if="currentPaper.abstract" class="detail-section">
          <h4>摘要</h4>
          <p class="abstract-text">{{ currentPaper.abstract }}</p>
        </div>

        <div v-if="currentPaper.keywords" class="detail-section">
          <h4>关键词</h4>
          <div class="keywords">
            <el-tag v-for="keyword in getKeywords(currentPaper.keywords)" :key="keyword"
              style="margin-right: 8px; margin-bottom: 8px;">
              {{ keyword }}
            </el-tag>
          </div>
        </div>

        <div v-if="currentPaper.pdf_path" class="detail-section">
          <h4>PDF文件</h4>
          <el-button type="primary" @click="viewPDF(currentPaper.pdf_path)">
            <el-icon>
              <Document />
            </el-icon>
            查看PDF
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Search, Document } from '@element-plus/icons-vue'
import api from '@/utils/api'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const selectedIds = ref([])
const stats = ref({})
const detailDialogVisible = ref(false)
const currentPaper = ref(null)

// 筛选条件
const filters = reactive({
  search: '',
  type: '',
  year: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

// 搜索防抖
let searchTimeout = null

// 年份选项
const years = computed(() => {
  const currentYear = new Date().getFullYear()
  const yearList = []
  for (let i = currentYear; i >= currentYear - 20; i--) {
    yearList.push(i)
  }
  return yearList
})

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filters
    }

    const resp = await api.get('/publications/admin/list', { params })

    if (resp.success && resp.code === 200) {
      tableData.value = resp.data.list || []
      pagination.total = resp.data.pagination.total
      pagination.page = resp.data.pagination.page
      pagination.limit = resp.data.pagination.limit
    }
  } catch (error) {
    console.error('加载论文列表失败:', error)
    ElMessage.error('加载论文列表失败')
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const resp = await api.get('/publications/admin/stats')
    if (resp.success && resp.code === 200) {
      stats.value = resp.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 搜索处理（防抖）
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    pagination.page = 1
    loadData()
  }, 500)
}

// 重置筛选条件
const resetFilters = () => {
  filters.search = ''
  filters.type = ''
  filters.year = ''
  pagination.page = 1
  loadData()
}

// 选择变化处理
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

// 添加论文
const handleAdd = () => {
  router.push('/publications/form')
}

// 编辑论文
const handleEdit = (row) => {
  router.push(`/publications/form/${row.id}`)
}

// 查看论文详情
const handleView = (row) => {
  currentPaper.value = row
  detailDialogVisible.value = true
}

// 删除论文
const handleDelete = async (id) => {
  try {
    const resp = await api.delete(`/publications/admin/delete/${id}`)
    if (resp.success && resp.code === 200) {
      ElMessage.success(resp.message || '删除成功')
      loadData()
      loadStats()
    }
  } catch (error) {
    console.error('删除论文失败:', error)
    ElMessage.error('删除失败')
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

    const resp = await api.delete('/publications/admin/batch-delete', {
      data: { ids: selectedIds.value }
    })

    if (resp.success && resp.code === 200) {
      ElMessage.success(resp.message || '批量删除成功')
      selectedIds.value = []
      loadData()
      loadStats()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 查看PDF
const viewPDF = (pdfPath) => {
  if (pdfPath) {
    const url = `/uploads/publications/${pdfPath.split('/').pop()}`
    window.open(url, '_blank')
  }
}

// 获取关键词数组
const getKeywords = (keywords) => {
  if (!keywords) return []
  return keywords.split(',').map(k => k.trim()).filter(k => k)
}

// 获取类型标签
const getTypeLabel = (type) => {
  const typeMap = {
    journal: '期刊',
    conference: '会议',
    book_chapter: '专著',
    patent: '专利',
    thesis: '学位'
  }
  return typeMap[type] || type
}

// 获取类型颜色
const getTypeColor = (type) => {
  const colorMap = {
    journal: 'success',
    conference: 'primary',
    book_chapter: 'warning',
    patent: 'danger',
    thesis: 'info'
  }
  return colorMap[type] || 'default'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

// 初始化
onMounted(() => {
  loadData()
  loadStats()
})
</script>

<style scoped>
.publications-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.toolbar-left {
  display: flex;
  gap: 10px;
}

.toolbar-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stats-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stats-number {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.stats-label {
  color: #909399;
  font-size: 14px;
}

.table-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.paper-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.paper-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 18px;
  line-height: 1.4;
}

.detail-section h4 {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 16px;
}

.paper-meta p {
  margin: 8px 0;
  line-height: 1.6;
}

.abstract-text {
  line-height: 1.8;
  text-align: justify;
  color: #606266;
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 16px;
  }

  .toolbar-left,
  .toolbar-right {
    width: 100%;
    justify-content: center;
  }

  .toolbar-right {
    flex-direction: column;
    gap: 12px;
  }

  .toolbar-right .el-input,
  .toolbar-right .el-select {
    width: 100%;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>