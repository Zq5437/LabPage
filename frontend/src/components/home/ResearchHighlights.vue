<template>
  <section class="researchhighlights-section" ref="sectionRef">
    <div class="container">
      <div class="section-header" data-aos="fade-up">
        <div class="header-content">
          <h2>研究方向</h2>
          <p class="header-subtitle">探索前沿科技，推动创新发展</p>
        </div>
        <router-link to="/research" class="more-link hover-scale">
          查看全部
          <span class="arrow">→</span>
        </router-link>
      </div>

      <div class="areas-list">
        <div v-for="(area, index) in areasToShow" :key="area.id" class="area-item"
          :class="{ 'reverse': index % 2 === 1 }" :data-aos="index % 2 === 0 ? 'fade-right' : 'fade-left'"
          :data-aos-delay="index * 100">
          <div class="area-media">
            <div class="media-wrapper hover-scale">
              <img v-if="area.cover_image" :src="area.cover_image" :alt="area.name" class="area-image" />
              <div v-else class="default-image">
                <span class="icon" v-if="area.icon">{{ area.icon }}</span>
                <span v-else>🔬</span>
              </div>
            </div>
            <div class="number-badge" data-aos="zoom-in" :data-aos-delay="index * 100 + 200">
              {{ String(index + 1).padStart(2, '0') }}
            </div>
          </div>

          <div class="area-content">
            <div class="content-inner">
              <h3 class="area-title" data-aos="fade-up" :data-aos-delay="index * 100 + 300">{{ area.name }}</h3>
              <p class="area-description" data-aos="fade-up" :data-aos-delay="index * 100 + 400">{{ area.description }}
              </p>
              <div class="area-actions" data-aos="fade-up" :data-aos-delay="index * 100 + 500">
                <router-link :to="`/research#area-${area.id}`" class="learn-more hover-scale">
                  了解更多 <span class="arrow-icon">→</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 装饰性背景元素 -->
    <div class="bg-decoration decoration-1"></div>
    <div class="bg-decoration decoration-2"></div>
  </section>
</template>

<script>
import { computed } from 'vue'
import { useSiteStore } from '@/stores/site'

export default {
  name: 'ResearchHighlights',
  setup() {
    const siteStore = useSiteStore()
    const areasToShow = computed(() => (siteStore.researchAreas || []).slice(0, 4))

    return {
      areasToShow
    }
  }
}
</script>

<style scoped>
.researchhighlights-section {
  padding: 100px 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow: hidden;
}

/* 装饰性背景元素 */
.bg-decoration {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  pointer-events: none;
}

.decoration-1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  top: -100px;
  right: -100px;
  animation: float 20s infinite ease-in-out;
}

.decoration-2 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  bottom: -50px;
  left: -50px;
  animation: float 15s infinite ease-in-out reverse;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 60px;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.section-header.visible {
  opacity: 1;
  transform: translateY(0);
}

.header-content h2 {
  font-size: 2.5rem;
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  margin: 0;
  color: #666;
  font-size: 1.1rem;
}

.more-link {
  color: #667eea;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  padding: 10px 20px;
  border-radius: 25px;
  background: rgba(102, 126, 234, 0.1);
}

.more-link:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateX(5px);
}

.more-link .arrow {
  transition: transform 0.3s ease;
}

.more-link:hover .arrow {
  transform: translateX(5px);
}

.areas-list {
  display: flex;
  flex-direction: column;
  gap: 60px;
}

.area-item {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  opacity: 0;
  transform: translateY(60px);
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.area-item.visible {
  opacity: 1;
  transform: translateY(0);
}

.area-item.reverse {
  direction: rtl;
}

.area-item.reverse>* {
  direction: ltr;
}

.area-media {
  position: relative;
}

.media-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.area-item:hover .media-wrapper {
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
}

.area-image {
  width: 100%;
  height: 360px;
  object-fit: cover;
  display: block;
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.area-item:hover .area-image {
  transform: scale(1.1);
}

.default-image {
  width: 100%;
  height: 360px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.area-item:hover .default-image {
  transform: scale(1.1);
}

.number-badge {
  position: absolute;
  top: -15px;
  right: -15px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

.area-content {
  padding: 20px;
}

.content-inner {
  background: #fff;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.content-inner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scaleY(0);
  transition: transform 0.4s ease;
}

.area-item:hover .content-inner::before {
  transform: scaleY(1);
}

.area-item:hover .content-inner {
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
}

.area-title {
  font-size: 2rem;
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-weight: 700;
  line-height: 1.3;
  position: relative;
  padding-bottom: 15px;
}

.area-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  transition: width 0.4s ease;
}

.area-item:hover .area-title::after {
  width: 120px;
}

.area-description {
  line-height: 1.9;
  color: #555;
  margin: 0 0 24px 0;
  font-size: 1.05rem;
}

.area-actions {
  margin-top: 24px;
}

.learn-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.05rem;
  transition: all 0.3s ease;
  padding: 12px 24px;
  border-radius: 25px;
  background: rgba(102, 126, 234, 0.1);
}

.learn-more:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateX(5px);
}

.arrow-icon {
  transition: transform 0.3s ease;
  font-size: 1.2rem;
}

.learn-more:hover .arrow-icon {
  transform: translateX(5px);
}

@media (max-width: 968px) {
  .area-item {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .area-item.reverse {
    direction: ltr;
  }

  .area-image,
  .default-image {
    height: 280px;
  }

  .content-inner {
    padding: 30px;
  }

  .area-title {
    font-size: 1.6rem;
  }
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .header-content h2 {
    font-size: 2rem;
  }

  .areas-list {
    gap: 40px;
  }

  .area-image,
  .default-image {
    height: 220px;
  }

  .number-badge {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
    top: -10px;
    right: -10px;
  }
}
</style>