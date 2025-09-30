<template>
  <section class="latestnews-section">
    <div class="container">
      <div class="section-header">
        <h2>最新新闻</h2>
        <router-link to="/news" class="more-link">查看全部</router-link>
      </div>

      <div class="news-grid" v-loading="loading">
        <div v-for="item in news" :key="item.id" class="news-card" @click="goDetail(item)">
          <div class="cover">
            <img v-if="item.cover_image" :src="item.cover_image" :alt="item.title" />
            <div v-else class="default-cover">ICL</div>
            <div class="badge" v-if="item.is_top === 1">置顶</div>
          </div>
          <div class="content">
            <div class="meta">
              <el-tag size="small" :type="getCategoryTagType(item.category)">{{ getCategoryText(item.category)
              }}</el-tag>
              <span class="date">{{ formatDate(item.publish_time) }}</span>
            </div>
            <h3 class="title">{{ item.title }}</h3>
            <p class="summary">{{ item.summary }}</p>
          </div>
        </div>
      </div>

      <div v-if="!loading && news.length === 0" class="empty">
        <el-empty description="暂无新闻" />
      </div>
    </div>
  </section>
</template>

<script>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

export default {
  name: 'LatestNews',
  setup(_, { emit }) {
    const news = ref([])
    const loading = ref(false)

    const loadNews = async () => {
      try {
        loading.value = true
        const response = await api.get('/news', { params: { page: 1, limit: 6, status: 'published' } })
        news.value = response?.data?.news || []
      } catch (e) {
        news.value = []
      } finally {
        loading.value = false
      }
    }

    const goDetail = (item) => {
      window.location.href = `/news/${item.id}`
    }

    const getCategoryText = (category) => ({
      news: '学术新闻',
      announcement: '活动通知',
      achievement: '获奖信息',
      activity: '学术活动'
    })[category] || category

    const getCategoryTagType = (category) => ({
      news: 'primary',
      announcement: 'warning',
      achievement: 'success',
      activity: 'info'
    })[category] || ''

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
    }

    onMounted(loadNews)

    return { news, loading, goDetail, getCategoryText, getCategoryTagType, formatDate }
  }
}
</script>

<style scoped>
.latestnews-section {
  padding: 80px 0;
  background: #fff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-header h2 {
  margin: 0;
  font-size: 1.8rem;
}

.more-link {
  color: #667eea;
  text-decoration: none;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.news-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform .2s ease;
}

.news-card:hover {
  transform: translateY(-4px);
}

.cover {
  position: relative;
  height: 160px;
  background: #f0f2f5;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-cover {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  font-size: 2rem;
}

.badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #f39c12;
  color: #fff;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: .75rem;
}

.content {
  padding: 16px 18px 20px;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  color: #999;
  font-size: .9rem;
}

.title {
  margin: 6px 0 8px 0;
  font-size: 1.1rem;
  color: #2c3e50;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.summary {
  margin: 0;
  color: #666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty {
  padding: 20px 0;
}

@media (max-width: 768px) {
  .news-grid {
    grid-template-columns: 1fr;
  }
}
</style>
