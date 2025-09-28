<template>
  <div class="equipment-page">
    <!-- 页面头部 -->
    <div class="equipment-header">
      <div class="container">
        <h1>设备资源</h1>
        <p>实验室仪器设备与技术平台展示</p>
      </div>
    </div>

    <div class="container">
      <!-- 筛选工具栏 -->
      <div class="filter-toolbar">
        <div class="filter-left">
          <el-input
            v-model="filters.search"
            placeholder="搜索设备名称、型号、厂商..."
            style="width: 300px"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="filter-right">
          <el-select
            v-model="filters.category"
            placeholder="选择分类"
            clearable
            style="width: 150px"
            @change="loadEquipment"
          >
            <el-option
              v-for="category in categories"
              :key="category.category"
              :label="category.category"
              :value="category.category"
            />
          </el-select>

          <el-select v-model="viewMode" style="width: 120px">
            <el-option label="卡片视图" value="card" />
            <el-option label="列表视图" value="list" />
          </el-select>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section" v-if="!loading">
        <div class="stats-item">
          <span class="stats-number">{{ pagination.total }}</span>
          <span class="stats-label">台设备</span>
        </div>
        <div class="stats-item">
          <span class="stats-number">{{ uniqueCategories }}</span>
          <span class="stats-label">个分类</span>
        </div>
        <div class="stats-item">
          <span class="stats-number">{{ uniqueManufacturers }}</span>
          <span class="stats-label">个厂商</span>
        </div>
      </div>

      <!-- 设备列表 -->
      <div class="equipment-list" v-loading="loading">
        <!-- 卡片视图 -->
        <div v-if="viewMode === 'card'" class="equipment-grid">
          <div
            v-for="equipment in equipmentList"
            :key="equipment.id"
            class="equipment-card"
            @click="viewDetails(equipment)"
          >
            <div class="equipment-image">
              <img
                v-if="equipment.image_url"
                :src="equipment.image_url"
                :alt="equipment.name"
                @error="handleImageError"
              />
              <div v-else class="no-image">
                <el-icon><Monitor /></el-icon>
              </div>
              
              <div class="equipment-category">
                <el-tag size="small">{{ equipment.category }}</el-tag>
              </div>
            </div>

            <div class="equipment-info">
              <h3 class="equipment-name">{{ equipment.name }}</h3>
              <p class="equipment-model">{{ equipment.model }}</p>
              <p class="equipment-manufacturer">{{ equipment.manufacturer }}</p>
              
              <div class="equipment-meta">
                <span v-if="equipment.location" class="location">
                  <el-icon><Location /></el-icon>
                  {{ equipment.location }}
                </span>
                <span v-if="equipment.purchase_date" class="purchase-date">
                  {{ formatYear(equipment.purchase_date) }}年
                </span>
              </div>

              <p class="equipment-description">
                {{ equipment.description?.substring(0, 80) }}{{ equipment.description?.length > 80 ? '...' : '' }}
              </p>
            </div>
          </div>
        </div>

        <!-- 列表视图 -->
        <div v-else class="equipment-table">
          <div
            v-for="equipment in equipmentList"
            :key="equipment.id"
            class="equipment-row"
            @click="viewDetails(equipment)"
          >
            <div class="equipment-basic">
              <div class="equipment-image-small">
                <img
                  v-if="equipment.image_url"
                  :src="equipment.image_url"
                  :alt="equipment.name"
                  @error="handleImageError"
                />
                <el-icon v-else><Monitor /></el-icon>
              </div>

              <div class="equipment-details">
                <h3>{{ equipment.name }}</h3>
                <div class="equipment-specs">
                  <span class="model">{{ equipment.model }}</span>
                  <span class="manufacturer">{{ equipment.manufacturer }}</span>
                  <el-tag size="small">{{ equipment.category }}</el-tag>
                </div>
                <p class="description">{{ equipment.description }}</p>
              </div>
            </div>

            <div class="equipment-actions">
              <span v-if="equipment.location" class="location">
                <el-icon><Location /></el-icon>
                {{ equipment.location }}
              </span>
              <el-button type="primary" size="small" @click.stop="viewDetails(equipment)">
                查看详情
              </el-button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && equipmentList.length === 0" class="empty-state">
          <el-empty description="暂无设备数据" />
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container" v-if="pagination.total > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[12, 24, 36, 48]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadEquipment"
          @current-change="loadEquipment"
        />
      </div>
    </div>

    <!-- 设备详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      :title="selectedEquipment?.name"
      width="800px"
      destroy-on-close
    >
      <div v-if="selectedEquipment" class="equipment-detail">
        <div class="detail-header">
          <div class="detail-image">
            <img
              v-if="selectedEquipment.image_url"
              :src="selectedEquipment.image_url"
              :alt="selectedEquipment.name"
            />
            <div v-else class="no-image-large">
              <el-icon><Monitor /></el-icon>
            </div>
          </div>

          <div class="detail-info">
            <h2>{{ selectedEquipment.name }}</h2>
            <div class="detail-meta">
              <div class="meta-item">
                <span class="label">型号:</span>
                <span class="value">{{ selectedEquipment.model || '未提供' }}</span>
              </div>
              <div class="meta-item">
                <span class="label">厂商:</span>
                <span class="value">{{ selectedEquipment.manufacturer || '未提供' }}</span>
              </div>
              <div class="meta-item">
                <span class="label">分类:</span>
                <el-tag>{{ selectedEquipment.category }}</el-tag>
              </div>
              <div class="meta-item">
                <span class="label">位置:</span>
                <span class="value">{{ selectedEquipment.location || '未提供' }}</span>
              </div>
              <div class="meta-item">
                <span class="label">购买时间:</span>
                <span class="value">{{ formatDate(selectedEquipment.purchase_date) || '未提供' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-content">
          <div v-if="selectedEquipment.description" class="detail-section">
            <h3>设备描述</h3>
            <p>{{ selectedEquipment.description }}</p>
          </div>

          <div v-if="selectedEquipment.specifications" class="detail-section">
            <h3>技术规格</h3>
            <p class="specifications">{{ selectedEquipment.specifications }}</p>
          </div>

          <div v-if="selectedEquipment.usage_notes" class="detail-section">
            <h3>使用说明</h3>
            <p>{{ selectedEquipment.usage_notes }}</p>
          </div>

          <div v-if="selectedEquipment.contact_person" class="detail-section">
            <h3>联系人</h3>
            <p>{{ selectedEquipment.contact_person }}</p>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'
import {
  Search, Monitor, Location
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const equipmentList = ref([])
const categories = ref([])
const viewMode = ref('card') // card | list
const detailVisible = ref(false)
const selectedEquipment = ref(null)

// 筛选条件
const filters = reactive({
  search: '',
  category: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  limit: 12,
  total: 0
})

// 搜索防抖
let searchTimeout = null

// 计算属性
const uniqueCategories = computed(() => {
  const categories = new Set(equipmentList.value.map(eq => eq.category))
  return categories.size
})

const uniqueManufacturers = computed(() => {
  const manufacturers = new Set(equipmentList.value.map(eq => eq.manufacturer).filter(m => m))
  return manufacturers.size
})

// 加载设备列表
const loadEquipment = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      sort: 'sort_order',
      order: 'DESC',
      ...filters
    }

    const response = await api.get('/equipment/list', { params })
    
    if (response.data) {
      equipmentList.value = response.data.data || []
      if (response.data.pagination) {
        pagination.total = response.data.pagination.total
        pagination.page = response.data.pagination.page
        pagination.limit = response.data.pagination.limit
      }
    }
  } catch (error) {
    console.error('加载设备列表失败:', error)
    ElMessage.error('加载设备列表失败')
  } finally {
    loading.value = false
  }
}

// 加载分类列表
const loadCategories = async () => {
  try {
    const response = await api.get('/equipment/stats/categories')
    if (response.data) {
      categories.value = response.data.data || []
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 搜索处理（防抖）
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    pagination.page = 1
    loadEquipment()
  }, 500)
}

// 查看详情
const viewDetails = (equipment) => {
  selectedEquipment.value = equipment
  detailVisible.value = true
}

// 图片加载错误处理
const handleImageError = (e) => {
  e.target.style.display = 'none'
}

// 格式化年份
const formatYear = (date) => {
  if (!date) return ''
  return new Date(date).getFullYear()
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

// 初始化
onMounted(() => {
  loadEquipment()
  loadCategories()
})
</script>

<style scoped>
.equipment-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.equipment-header {
  background: linear-gradient(135deg, #43a047 0%, #66bb6a 100%);
  color: white;
  padding: 60px 0 40px;
  text-align: center;
}

.equipment-header h1 {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.equipment-header p {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.filter-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 30px 0;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-right {
  display: flex;
  gap: 15px;
}

.stats-section {
  display: flex;
  gap: 40px;
  margin: 30px 0;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-item {
  text-align: center;
}

.stats-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #43a047;
}

.stats-label {
  font-size: 0.9rem;
  color: #666;
}

.equipment-list {
  min-height: 400px;
}

/* 卡片视图样式 */
.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.equipment-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.equipment-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.equipment-image {
  position: relative;
  height: 200px;
  background: #f5f5f5;
}

.equipment-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 3rem;
}

.equipment-category {
  position: absolute;
  top: 10px;
  right: 10px;
}

.equipment-info {
  padding: 20px;
}

.equipment-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.equipment-model {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 4px 0;
}

.equipment-manufacturer {
  color: #888;
  font-size: 0.85rem;
  margin: 0 0 12px 0;
}

.equipment-meta {
  display: flex;
  gap: 15px;
  margin: 12px 0;
  font-size: 0.85rem;
  color: #666;
}

.location,
.purchase-date {
  display: flex;
  align-items: center;
  gap: 4px;
}

.equipment-description {
  color: #555;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

/* 列表视图样式 */
.equipment-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.equipment-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.equipment-row:last-child {
  border-bottom: none;
}

.equipment-row:hover {
  background: #f8f9fa;
}

.equipment-basic {
  display: flex;
  gap: 15px;
  flex: 1;
}

.equipment-image-small {
  width: 60px;
  height: 60px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.equipment-image-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.equipment-details h3 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #2c3e50;
}

.equipment-specs {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #666;
}

.description {
  color: #555;
  font-size: 0.85rem;
  margin: 0;
}

.equipment-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* 详情对话框样式 */
.equipment-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.detail-image {
  width: 200px;
  height: 150px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image-large {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 2rem;
}

.detail-info h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.detail-meta {
  display: grid;
  gap: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

.value {
  color: #333;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section h3 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 1.1rem;
}

.detail-section p {
  color: #555;
  line-height: 1.6;
  margin: 0;
}

.specifications {
  white-space: pre-line;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin: 40px 0;
}

@media (max-width: 768px) {
  .equipment-header h1 {
    font-size: 2rem;
  }

  .filter-toolbar {
    flex-direction: column;
    gap: 15px;
  }

  .filter-right {
    flex-direction: column;
    width: 100%;
  }

  .filter-right .el-select {
    width: 100% !important;
  }

  .stats-section {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .equipment-grid {
    grid-template-columns: 1fr;
  }

  .equipment-row {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .equipment-basic {
    flex-direction: column;
  }

  .detail-header {
    flex-direction: column;
  }

  .detail-image {
    width: 100%;
    height: 200px;
  }
}
</style>
