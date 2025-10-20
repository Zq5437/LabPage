<template>
  <section class="hero-banner">
    <div class="hero-background" data-aos="fade">
      <div class="hero-overlay"></div>
      <img v-if="labInfo.banner" :src="labInfo.banner" alt="实验室横幅" class="hero-image">
      <div v-else class="hero-gradient"></div>
    </div>

    <div class="hero-content">
      <div class="container">
        <div class="hero-text">
          <h1 class="hero-title" data-aos="fade-up" data-aos-delay="200">
            {{ siteTitle }}
          </h1>
          <h2 v-if="labInfo.name_en" class="hero-subtitle" data-aos="fade-up" data-aos-delay="400">
            {{ labInfo.name_en }}
          </h2>
          <p v-if="siteDescription" class="hero-description" data-aos="fade-up" data-aos-delay="600">
            {{ siteDescription }}
          </p>
          <div class="hero-actions" data-aos="fade-up" data-aos-delay="800">
            <router-link to="/about" class="btn btn-primary btn-lg hover-scale">
              了解更多
              <span class="btn-icon">→</span>
            </router-link>
            <router-link to="/research" class="btn btn-outline btn-lg hover-scale">
              研究方向
              <span class="btn-icon">→</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 滚动提示 -->
    <div class="scroll-indicator" data-aos="fade-up" data-aos-delay="1000">
      <div class="mouse">
        <div class="wheel"></div>
      </div>
      <div class="arrows">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </section>
</template>

<script>
import { computed } from 'vue'
import { useSiteStore } from '@/stores/site'

export default {
  name: 'HeroBanner',
  setup() {
    const siteStore = useSiteStore()

    const labInfo = computed(() => siteStore.labInfo)
    const siteTitle = computed(() => siteStore.siteTitle)
    const siteDescription = computed(() => siteStore.siteDescription)

    return {
      labInfo,
      siteTitle,
      siteDescription
    }
  }
}
</script>

<style lang="scss" scoped>
.hero-banner {
  position: relative;
  height: 100vh;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #0a0a0a;

  @media (max-width: 768px) {
    height: 80vh;
    min-height: 500px;
  }
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;

  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2;
  }

  .hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.1);
    transition: transform 8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hero-gradient {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

}

.hero-content {
  position: relative;
  z-index: 3;
  text-align: center;
  color: #fff;
  width: 100%;
}

.hero-text {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;

  .hero-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
    -webkit-background-clip: text;
    // -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-subtitle {
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    font-weight: 300;
    margin-bottom: 1.5rem;
    opacity: 0.9;
    color: rgba(255, 255, 255, 0.9);
  }

  .hero-description {
    font-size: clamp(1rem, 2vw, 1.2rem);
    line-height: 1.8;
    margin-bottom: 2.5rem;
    opacity: 0.9;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    color: rgba(255, 255, 255, 0.8);
  }

  .hero-actions {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    flex-wrap: wrap;

    .btn {
      min-width: 160px;
      height: 48px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 24px;
      font-size: 1rem;
      font-weight: 500;
      border-radius: 24px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      .btn-icon {
        margin-left: 8px;
        transition: transform 0.3s ease;
      }

      &:hover .btn-icon {
        transform: translateX(4px);
      }

      &.btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: #fff;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
      }

      &.btn-outline {
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.3);
        color: #fff;
        backdrop-filter: blur(10px);

        &:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
        }
      }
    }

    @media (max-width: 480px) {
      flex-direction: column;
      align-items: center;
      gap: 1rem;

      .btn {
        width: 200px;
      }
    }
  }
}

.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    display: none;
  }

  .mouse {
    width: 26px;
    height: 40px;
    border: 2px solid rgba(255, 255, 255, 0.8);
    border-radius: 20px;
    position: relative;

    .wheel {
      width: 4px;
      height: 8px;
      background: #fff;
      border-radius: 2px;
      position: absolute;
      top: 6px;
      left: 50%;
      transform: translateX(-50%);
      animation: mouseWheel 1.5s infinite;
    }
  }

  .arrows {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    span {
      display: block;
      width: 10px;
      height: 10px;
      border-right: 2px solid rgba(255, 255, 255, 0.8);
      border-bottom: 2px solid rgba(255, 255, 255, 0.8);
      transform: rotate(45deg);
      animation: arrowDown 1.5s infinite;

      &:nth-child(2) {
        animation-delay: 0.2s;
      }

      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
}

@keyframes mouseWheel {
  0% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(15px);
  }
}

@keyframes arrowDown {
  0% {
    opacity: 0;
    transform: rotate(45deg) translate(-5px, -5px);
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: rotate(45deg) translate(5px, 5px);
  }
}


// 视差效果
.hero-banner:hover .hero-image {
  transform: scale(1.15);
}
</style>
