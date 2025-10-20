<template>
  <section class="researchhighlights-section">
    <div class="container">
      <div class="section-header" data-aos="fade-up">
        <h2>研究方向</h2>
        <p class="header-subtitle">探索前沿科技，推动创新发展</p>
      </div>

      <div class="areas-showcase">
        <div v-for="(area, index) in areasToShow" :key="area.id" class="area-item"
          :class="{ 'reverse': index % 2 === 1 }" data-aos="fade-up">
          <div class="item-media" data-aos="fade-right" :data-aos-delay="index * 100">
            <div class="media-wrapper">
              <img v-if="area.cover_image" :src="area.cover_image" :alt="area.name" class="area-image" />
              <div v-else class="default-image">
                <span class="icon" v-if="area.icon">{{ area.icon }}</span>
                <span v-else>🔬</span>
              </div>
            </div>
          </div>

          <div class="item-content" data-aos="fade-left" :data-aos-delay="index * 100 + 100">
            <div class="content-inner">
              <div class="area-tags" v-if="area.keywords">
                <span v-for="keyword in area.keywords.split(',')" :key="keyword" class="tag">
                  {{ keyword.trim() }}
                </span>
              </div>
              <h3 class="area-title">{{ area.name }}</h3>
              <p class="area-description">{{ area.description }}</p>
              <router-link :to="`/research#area-${area.id}`" class="learn-more">
                了解更多 <span class="arrow-icon">→</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="section-footer" data-aos="fade-up">
        <router-link to="/research" class="view-all-btn">
          查看全部研究方向
          <span class="btn-icon">→</span>
        </router-link>
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
    const areasToShow = computed(() => (siteStore.researchAreas || []).slice(0, 4))

    return {
      areasToShow
    }
  }
}
</script>

<style lang="scss" scoped>
.researchhighlights-section {
  padding: 100px 0;
  background: #fff;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 300px;
    background: linear-gradient(180deg,
        rgba(102, 126, 234, 0.05) 0%,
        rgba(255, 255, 255, 0) 100%);
    pointer-events: none;
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 80px;

  h2 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-subtitle {
    font-size: 1.2rem;
    color: #666;
    margin: 0;
  }
}

.areas-showcase {
  margin-bottom: 60px;
}

.area-item {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 60px;
  align-items: center;
  padding: 40px 0;

  &.reverse {
    grid-template-columns: 1.2fr 1fr;
    direction: rtl;

    .item-content {
      direction: ltr;
    }

    .item-media {
      direction: ltr;
    }
  }

  &:not(:last-child) {
    border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  }
}

.item-media {
  .media-wrapper {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 30px 60px rgba(102, 126, 234, 0.2);
    }
  }

  .area-image {
    width: 100%;
    aspect-ratio: 16/9;
    object-fit: cover;
    display: block;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .default-image {
    width: 100%;
    aspect-ratio: 16/9;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    color: #fff;
  }
}

.item-content {
  .content-inner {
    max-width: 480px;
  }

  .area-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;

    .tag {
      padding: 6px 12px;
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(102, 126, 234, 0.2);
        transform: translateY(-2px);
      }
    }
  }

  .area-title {
    font-size: 1.8rem;
    font-weight: 600;
    margin: 0 0 16px;
    color: #2c3e50;
    line-height: 1.3;
  }

  .area-description {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #666;
    margin-bottom: 24px;
  }

  .learn-more {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
    font-size: 1rem;
    padding: 12px 24px;
    border-radius: 25px;
    background: rgba(102, 126, 234, 0.1);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(102, 126, 234, 0.2);
      transform: translateX(5px);

      .arrow-icon {
        transform: translateX(3px);
      }
    }

    .arrow-icon {
      transition: transform 0.3s ease;
    }
  }
}

.section-footer {
  text-align: center;
  margin-top: 40px;

  .view-all-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 16px 32px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    text-decoration: none;
    border-radius: 25px;
    font-weight: 500;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);

      .btn-icon {
        transform: translateX(5px);
      }
    }

    .btn-icon {
      transition: transform 0.3s ease;
    }
  }
}

@media (max-width: 1024px) {
  .area-item {
    grid-template-columns: 1fr !important;
    gap: 30px;
    direction: ltr !important;
    padding: 30px 0;

    .item-content {
      direction: ltr !important;

      .content-inner {
        max-width: none;
      }
    }
  }

  .item-media .media-wrapper {
    max-width: 600px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .section-header {
    margin-bottom: 40px;

    h2 {
      font-size: 2rem;
    }

    .header-subtitle {
      font-size: 1.1rem;
    }
  }

  .item-content {
    .area-title {
      font-size: 1.5rem;
    }

    .area-description {
      font-size: 1rem;
    }
  }
}
</style>