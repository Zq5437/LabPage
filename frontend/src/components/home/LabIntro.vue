<template>
  <section class="labintro-section">
    <div class="container">
      <div class="intro-grid">
        <div class="intro-media" data-aos="fade-right" data-aos-delay="100">
          <img v-if="labInfo.logo" :src="labInfo.logo" alt="实验室Logo" class="intro-logo hover-scale" />
          <div v-else class="intro-logo placeholder hover-scale">ICL</div>
        </div>

        <div class="intro-content" data-aos="fade-left" data-aos-delay="200">
          <h2 class="intro-title" data-aos="fade-up" data-aos-delay="300">{{ labInfo.name || '实验室简介' }}</h2>
          <p v-if="labInfo.name_en" class="intro-subtitle" data-aos="fade-up" data-aos-delay="400">{{ labInfo.name_en }}
          </p>
          <p class="intro-description" data-aos="fade-up" data-aos-delay="500">{{ descriptionText }}</p>

          <div class="intro-meta" data-aos="fade-up" data-aos-delay="600">
            <div v-if="labInfo.director" class="meta-item hover-scale">
              <span class="meta-label">主任</span>
              <span class="meta-value">{{ labInfo.director }}</span>
            </div>
            <div v-if="labInfo.established_year" class="meta-item hover-scale">
              <span class="meta-label">成立年份</span>
              <span class="meta-value">{{ labInfo.established_year }}</span>
            </div>
            <div v-if="labInfo.email" class="meta-item hover-scale">
              <span class="meta-label">邮箱</span>
              <span class="meta-value">{{ labInfo.email }}</span>
            </div>
          </div>

          <div class="intro-actions" data-aos="fade-up" data-aos-delay="700">
            <router-link to="/about" class="btn btn-primary hover-scale">了解实验室</router-link>
            <router-link to="/members" class="btn btn-outline hover-scale">团队成员</router-link>
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
  padding: 12px 24px;
  border-radius: 8px;
  border: 2px solid transparent;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.6s ease, height 0.6s ease;
  }

  &:hover::before {
    width: 300px;
    height: 300px;
  }
}

.btn.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  border: none;
  /* 确保没有边框 */
  position: relative;
  z-index: 1;
  /* 确保渐变背景在最上层 */

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: inherit;
    /* 继承父元素的渐变背景 */
    border-radius: inherit;
    z-index: -1;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
}

.btn.btn-outline {
  background: transparent;
  color: #667eea;
  border-color: #667eea;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    transform: translateY(-2px);
  }
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
