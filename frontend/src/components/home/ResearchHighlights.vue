<template>
  <section class="researchhighlights-section">
    <div class="container">
      <div class="section-header">
        <h2>研究方向</h2>
        <router-link to="/research" class="more-link">查看全部</router-link>
      </div>

      <div class="areas-grid">
        <div v-for="area in areasToShow" :key="area.id" class="area-card">
          <div class="area-cover">
            <img v-if="area.cover_image" :src="area.cover_image" :alt="area.name" />
            <div v-else class="default-cover">
              <span class="icon" v-if="area.icon">{{ area.icon }}</span>
              <span v-else>RA</span>
            </div>
          </div>
          <div class="area-content">
            <h3 class="area-title">{{ area.name }}</h3>
            <p class="area-desc">{{ area.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { computed } from 'vue'
import { useSiteStore } from '@/stores/site'

export default {
  name: 'ResearchHighlights',
  setup() {
    const siteStore = useSiteStore()
    const areasToShow = computed(() => (siteStore.researchAreas || []).slice(0, 6))

    return {
      areasToShow
    }
  }
}
</script>

<style scoped>
.researchhighlights-section {
  padding: 80px 0;
  background: #f8f9fa;
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
  font-size: 1.8rem;
  margin: 0;
}

.more-link {
  color: #667eea;
  text-decoration: none;
}

.areas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.area-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: transform .2s ease;
}

.area-card:hover {
  transform: translateY(-4px);
}

.area-cover {
  height: 140px;
  background: #eef2ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.area-cover img {
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
  color: #667eea;
  font-weight: 600;
}

.area-content {
  padding: 18px;
}

.area-title {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #2c3e50;
}

.area-desc {
  margin: 0;
  color: #666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 768px) {
  .areas-grid {
    grid-template-columns: 1fr;
  }
}
</style>
