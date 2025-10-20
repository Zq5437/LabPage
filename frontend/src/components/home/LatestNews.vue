<template>
  <section class="latestnews-section">
    <div class="container">
      <div class="section-header">
        <h2>最新新闻</h2>
        <router-link to="/news" class="more-link">查看全部 →</router-link>
      </div>

      <div class="news-list" v-loading="loading">
        <div v-for="item in news" :key="item.id" class="news-item" @click="goDetail(item)">
          <div class="news-media">
            <img v-if="item.cover_image" :src="getCoverImageUrl(item.cover_image)" :alt="item.title" class="news-image" />
            <div v-else class="default-image">📰</div>
            <div class="badge" v-if="item.is_top === 1">置顶</div>
          </div>

          <div class="news-content">
            <div class="news-meta">
              <el-tag size="small" :type="getCategoryTagType(item.category)">
                {{ getCategoryText(item.category) }}
              </el-tag>
              <span class="date">{{ formatDate(item.publish_time) }}</span>
            </div>
            <h3 class="news-title">{{ item.title }}</h3>
            <p class="news-summary">{{ item.summary }}</p>
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
  setup() {
    const news = ref([])
    const loading = ref(false)

    const loadNews = async () => {
      try {
        loading.value = true
        const response = await api.get('/news', { params: { page: 1, limit: 4, status: 'published' } })
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

    onMounted(loadNews)

    return { news, loading, goDetail, getCategoryText, getCategoryTagType, formatDate, getCoverImageUrl }
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
  margin-bottom: 40px;
}

.section-header h2 {
  margin: 0;
  font-size: 2rem;
  color: #2c3e50;
}

.more-link {
  color: #667eea;
  text-decoration: none;
  font-size: 1rem;
  transition: opacity 0.2s;
}

.more-link:hover {
  opacity: 0.8;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.news-item {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
  align-items: center;
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.news-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.news-media {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
}

.news-image {
  width: 280px;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
}

.default-image {
  width: 280px;
  height: 180px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  border-radius: 8px;
}

.badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #f39c12;
  color: #fff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.news-content {
  color: #2c3e50;
}

.news-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.date {
  color: #999;
  font-size: 0.9rem;
}

.news-title {
  font-size: 1.5rem;
  margin: 0 0 12px 0;
  color: #2c3e50;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-summary {
  margin: 0;
  color: #555;
  line-height: 1.8;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty {
  padding: 40px 0;
}

@media (max-width: 768px) {
  .news-item {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .news-media {
    order: 1;
  }

  .news-content {
    order: 2;
  }

  .news-image,
  .default-image {
    width: 100%;
    height: 200px;
  }
}
</style>