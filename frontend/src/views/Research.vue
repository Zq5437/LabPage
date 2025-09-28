<template>
  <div class="research-page">
    <!-- 页面头部 -->
    <div class="research-header">
      <div class="container">
        <h1>研究方向</h1>
        <p>探索前沿科技，引领学术创新</p>
      </div>
    </div>

    <div class="container">
      <!-- 搜索栏 -->
      <div class="search-section">
        <el-input v-model="searchQuery" placeholder="搜索研究方向、关键词..." style="width: 400px" clearable
          @input="handleSearch">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>

      <!-- 统计信息 -->
      <div class="stats-overview" v-if="!loading">
        <div class="stats-item">
          <span class="stats-number">{{ researchAreas.length }}</span>
          <span class="stats-label">个研究方向</span>
        </div>
        <div class="stats-item">
          <span class="stats-number">{{ totalKeywords }}</span>
          <span class="stats-label">个关键词</span>
        </div>
        <div class="stats-item">
          <span class="stats-number">{{ activeAreas }}</span>
          <span class="stats-label">个活跃领域</span>
        </div>
      </div>

      <!-- 研究方向列表 -->
      <div class="research-areas" v-loading="loading">
        <div v-for="(area, index) in filteredAreas" :key="area.id" class="research-area-card"
          :class="{ 'animate-in': true }" :style="{ animationDelay: `${index * 0.1}s` }">
          <div class="area-image">
            <img v-if="area.image_url" :src="area.image_url" :alt="area.title" @error="handleImageError" />
            <div v-else class="no-image">
              <el-icon>
                <TrendCharts />
              </el-icon>
            </div>
            <div class="area-overlay">
              <el-button type="primary" @click="viewDetails(area)">
                了解更多
              </el-button>
            </div>
          </div>

          <div class="area-content">
            <h3 class="area-title">{{ area.title }}</h3>

            <p class="area-description">
              {{ area.description }}
            </p>

            <div class="area-keywords" v-if="area.keywords">
              <el-tag v-for="keyword in getKeywords(area.keywords)" :key="keyword" size="small"
                style="margin-right: 8px; margin-bottom: 8px;" effect="light">
                {{ keyword }}
              </el-tag>
            </div>

            <div class="area-actions">
              <el-button type="text" @click="viewDetails(area)">
                <el-icon>
                  <View />
                </el-icon>
                查看详情
              </el-button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && filteredAreas.length === 0" class="empty-state">
          <el-empty :description="searchQuery ? '未找到相关研究方向' : '暂无研究方向数据'" />
        </div>
      </div>

      <!-- 研究亮点部分 -->
      <div v-if="!searchQuery && researchAreas.length > 0" class="research-highlights">
        <h2>研究亮点</h2>
        <div class="highlights-grid">
          <div v-for="area in researchAreas.slice(0, 3)" :key="`highlight-${area.id}`" class="highlight-card">
            <div class="highlight-icon">
              <el-icon>
                <TrendCharts />
              </el-icon>
            </div>
            <h4>{{ area.title }}</h4>
            <p>{{ area.description.substring(0, 120) }}...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" :title="selectedArea?.title" width="900px" destroy-on-close>
      <div v-if="selectedArea" class="area-detail">
        <div class="detail-header">
          <div class="detail-image">
            <img v-if="selectedArea.image_url" :src="selectedArea.image_url" :alt="selectedArea.title" />
            <div v-else class="no-image-large">
              <el-icon>
                <TrendCharts />
              </el-icon>
            </div>
          </div>

          <div class="detail-info">
            <h2>{{ selectedArea.title }}</h2>
            <div class="detail-keywords" v-if="selectedArea.keywords">
              <h4>关键技术</h4>
              <div class="keywords-list">
                <el-tag v-for="keyword in getKeywords(selectedArea.keywords)" :key="keyword" size="medium"
                  style="margin-right: 10px; margin-bottom: 10px;" effect="dark">
                  {{ keyword }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-content">
          <div class="detail-section">
            <h3>研究内容</h3>
            <p class="detailed-description">{{ selectedArea.description }}</p>
          </div>

          <div v-if="selectedArea.objectives" class="detail-section">
            <h3>研究目标</h3>
            <p>{{ selectedArea.objectives }}</p>
          </div>

          <div v-if="selectedArea.achievements" class="detail-section">
            <h3>主要成果</h3>
            <p>{{ selectedArea.achievements }}</p>
          </div>

          <div class="detail-section">
            <h3>应用前景</h3>
            <p>该研究方向具有广阔的应用前景，在相关领域具有重要的理论意义和实用价值。</p>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="contactResearch">
          合作咨询
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'
import {
  Search, TrendCharts, View
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const researchAreas = ref([])
const searchQuery = ref('')
const detailVisible = ref(false)
const selectedArea = ref(null)

// 搜索防抖
let searchTimeout = null

// 计算属性
const filteredAreas = computed(() => {
  if (!searchQuery.value) {
    return researchAreas.value
  }

  const query = searchQuery.value.toLowerCase()
  return researchAreas.value.filter(area => {
    return area.title.toLowerCase().includes(query) ||
      area.description.toLowerCase().includes(query) ||
      (area.keywords && area.keywords.toLowerCase().includes(query))
  })
})

const totalKeywords = computed(() => {
  const allKeywords = researchAreas.value
    .map(area => area.keywords)
    .filter(keywords => keywords)
    .join(',')
    .split(',')
    .map(k => k.trim())
    .filter(k => k)

  return new Set(allKeywords).size
})

const activeAreas = computed(() => {
  // 由于API已经过滤了active状态，所以所有返回的数据都是活跃的
  return researchAreas.value.length
})

// 加载研究方向列表
const loadResearchAreas = async () => {
  try {
    loading.value = true
    const response = await api.get('/research-areas/list', {
      params: {
        status: 'active',
        sort: 'sort_order',
        order: 'DESC'
      }
    })

    if (response && response.data) {
      researchAreas.value = response.data || []
    }
  } catch (error) {
    console.error('加载研究方向失败:', error)
    ElMessage.error('加载研究方向失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理（防抖）
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    // 搜索逻辑在 computed 中处理
  }, 300)
}

// 查看详情
const viewDetails = (area) => {
  selectedArea.value = area
  detailVisible.value = true
}

// 联系合作
const contactResearch = () => {
  ElMessage.info('请通过联系我们页面获取合作咨询信息')
  detailVisible.value = false
}

// 获取关键词数组
const getKeywords = (keywords) => {
  if (!keywords) return []
  return keywords.split(',').map(k => k.trim()).filter(k => k)
}

// 图片加载错误处理
const handleImageError = (e) => {
  e.target.style.display = 'none'
}

// 初始化
onMounted(() => {
  loadResearchAreas()
})
</script>

<style scoped>
.research-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.research-header {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  padding: 80px 0 60px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.research-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.research-header h1 {
  font-size: 3rem;
  margin: 0 0 15px 0;
  font-weight: 700;
  position: relative;
  z-index: 1;
}

.research-header p {
  font-size: 1.3rem;
  margin: 0;
  opacity: 0.95;
  position: relative;
  z-index: 1;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-section {
  text-align: center;
  margin: 40px 0;
}

.stats-overview {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin: 40px 0 60px;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stats-item {
  text-align: center;
}

.stats-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: #ff6b6b;
  margin-bottom: 5px;
}

.stats-label {
  font-size: 1rem;
  color: #666;
  font-weight: 500;
}

.research-areas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.research-area-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.4s ease;
  opacity: 0;
  transform: translateY(30px);
}

.research-area-card.animate-in {
  animation: slideInUp 0.6s ease forwards;
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.research-area-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.area-image {
  position: relative;
  height: 220px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  overflow: hidden;
}

.area-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.research-area-card:hover .area-image img {
  transform: scale(1.05);
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.8);
  font-size: 4rem;
}

.area-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.research-area-card:hover .area-overlay {
  opacity: 1;
}

.area-content {
  padding: 25px;
}

.area-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 15px 0;
  line-height: 1.3;
}

.area-description {
  color: #555;
  line-height: 1.7;
  margin: 0 0 20px 0;
  font-size: 0.95rem;
}

.area-keywords {
  margin: 20px 0;
  min-height: 32px;
}

.area-actions {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.research-highlights {
  margin: 80px 0;
  text-align: center;
}

.research-highlights h2 {
  font-size: 2.2rem;
  color: #2c3e50;
  margin: 0 0 50px 0;
  font-weight: 600;
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.highlight-card {
  background: white;
  padding: 40px 25px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.highlight-card:hover {
  transform: translateY(-5px);
}

.highlight-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  font-size: 2rem;
}

.highlight-card h4 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin: 0 0 15px 0;
  font-weight: 600;
}

.highlight-card p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* 详情对话框样式 */
.area-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
}

.detail-image {
  width: 250px;
  height: 180px;
  background: #f5f5f5;
  border-radius: 12px;
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
  font-size: 3rem;
}

.detail-info h2 {
  margin: 0 0 25px 0;
  color: #2c3e50;
  font-size: 1.8rem;
}

.detail-keywords h4 {
  color: #666;
  margin: 0 0 15px 0;
  font-size: 1rem;
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section h3 {
  color: #2c3e50;
  margin: 0 0 15px 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.detail-section p {
  color: #555;
  line-height: 1.8;
  margin: 0;
  font-size: 1rem;
}

.detailed-description {
  font-size: 1.05rem !important;
  line-height: 1.9 !important;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px 0;
}

@media (max-width: 768px) {
  .research-header h1 {
    font-size: 2.2rem;
  }

  .research-header p {
    font-size: 1.1rem;
  }

  .stats-overview {
    flex-direction: column;
    gap: 30px;
    text-align: center;
  }

  .research-areas {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .highlights-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .detail-header {
    flex-direction: column;
  }

  .detail-image {
    width: 100%;
    height: 200px;
  }
}

@media (max-width: 480px) {
  .search-section .el-input {
    width: 100% !important;
  }

  .area-content {
    padding: 20px;
  }

  .highlight-card {
    padding: 30px 20px;
  }
}
</style>