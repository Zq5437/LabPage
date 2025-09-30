<template>
  <section class="labintro-section">
    <div class="container">
      <div class="intro-grid">
        <div class="intro-media">
          <img v-if="labInfo.logo" :src="labInfo.logo" alt="实验室Logo" class="intro-logo" />
          <div v-else class="intro-logo placeholder">ICL</div>
        </div>

        <div class="intro-content">
          <h2 class="intro-title">{{ labInfo.name || '实验室简介' }}</h2>
          <p v-if="labInfo.name_en" class="intro-subtitle">{{ labInfo.name_en }}</p>
          <p class="intro-description">{{ descriptionText }}</p>

          <div class="intro-meta">
            <div v-if="labInfo.director" class="meta-item">
              <span class="meta-label">主任</span>
              <span class="meta-value">{{ labInfo.director }}</span>
            </div>
            <div v-if="labInfo.established_year" class="meta-item">
              <span class="meta-label">成立年份</span>
              <span class="meta-value">{{ labInfo.established_year }}</span>
            </div>
            <div v-if="labInfo.email" class="meta-item">
              <span class="meta-label">邮箱</span>
              <span class="meta-value">{{ labInfo.email }}</span>
            </div>
          </div>

          <div class="intro-actions">
            <router-link to="/about" class="btn btn-primary">了解实验室</router-link>
            <router-link to="/members" class="btn btn-outline">团队成员</router-link>
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
  name: 'LabIntro',
  setup() {
    const siteStore = useSiteStore()
    const labInfo = computed(() => siteStore.labInfo)
    const descriptionText = computed(() => labInfo.value.description || '我们专注于人工智能、机器学习、计算机视觉、自然语言处理等前沿领域的研究，致力于推动智能计算技术在实际问题中的应用。')

    return {
      labInfo,
      descriptionText
    }
  }
}
</script>

<style scoped>
.labintro-section {
  padding: 80px 0;
  background: #fff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.intro-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 40px;
  align-items: center;
}

.intro-media {
  display: flex;
  align-items: center;
  justify-content: center;
}

.intro-logo {
  width: 220px;
  height: 220px;
  object-fit: contain;
}

.intro-logo.placeholder {
  width: 220px;
  height: 220px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  font-weight: 700;
}

.intro-content {
  color: #2c3e50;
}

.intro-title {
  font-size: 2rem;
  margin: 0 0 8px 0;
}

.intro-subtitle {
  color: #7f8c8d;
  margin: 0 0 20px 0;
}

.intro-description {
  line-height: 1.8;
  color: #555;
  margin-bottom: 24px;
}

.intro-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px 20px;
  margin-bottom: 24px;
}

.meta-item {
  display: flex;
  gap: 8px;
  color: #555;
}

.meta-label {
  color: #7f8c8d;
}

.intro-actions {
  display: flex;
  gap: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid transparent;
}

.btn.btn-primary {
  background: #667eea;
  color: #fff;
}

.btn.btn-outline {
  background: transparent;
  color: #667eea;
  border-color: #667eea;
}

@media (max-width: 768px) {
  .intro-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .intro-media {
    order: 1;
  }

  .intro-content {
    order: 2;
  }
}
</style>
