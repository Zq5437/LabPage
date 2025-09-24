<template>
  <section class="hero-banner">
    <div class="hero-background">
      <div class="hero-overlay"></div>
      <img v-if="labInfo.banner" :src="labInfo.banner" alt="实验室横幅" class="hero-image">
      <div v-else class="hero-gradient"></div>
    </div>
    
    <div class="hero-content">
      <div class="container">
        <div class="hero-text">
          <h1 class="hero-title fade-in">
            {{ siteTitle }}
          </h1>
          <h2 v-if="labInfo.name_en" class="hero-subtitle fade-in">
            {{ labInfo.name_en }}
          </h2>
          <p v-if="siteDescription" class="hero-description fade-in">
            {{ siteDescription }}
          </p>
          <div class="hero-actions fade-in">
            <router-link to="/about" class="btn btn-primary btn-lg">了解更多</router-link>
            <router-link to="/research" class="btn btn-outline btn-lg">研究方向</router-link>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 滚动提示 -->
    <div class="scroll-indicator">
      <div class="scroll-arrow"></div>
      <span class="scroll-text">向下滚动</span>
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
    background: rgba(0, 0, 0, 0.4);
    z-index: 2;
  }
  
  .hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .hero-gradient {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, 
      var(--primary-color) 0%, 
      #40a9ff 50%, 
      #1890ff 100%
    );
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
  
  .hero-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    animation-delay: 0.2s;
  }
  
  .hero-subtitle {
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    font-weight: 300;
    margin-bottom: 1.5rem;
    opacity: 0.9;
    animation-delay: 0.4s;
  }
  
  .hero-description {
    font-size: clamp(1rem, 2vw, 1.2rem);
    line-height: 1.6;
    margin-bottom: 2.5rem;
    opacity: 0.9;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    animation-delay: 0.6s;
  }
  
  .hero-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    animation-delay: 0.8s;
    
    .btn {
      min-width: 140px;
      
      &.btn-outline {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.3);
        color: #fff;
        backdrop-filter: blur(10px);
        
        &:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
          color: #fff;
        }
      }
    }
    
    @media (max-width: 480px) {
      flex-direction: column;
      align-items: center;
      
      .btn {
        width: 200px;
      }
    }
  }
}

.scroll-indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
  animation: bounce 2s infinite;
  
  @media (max-width: 768px) {
    display: none;
  }
  
  .scroll-arrow {
    width: 20px;
    height: 20px;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(45deg);
    margin-bottom: 8px;
  }
  
  .scroll-text {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
}

// 动画
.fade-in {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 1s ease-out forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-10px);
  }
  60% {
    transform: translateX(-50%) translateY(-5px);
  }
}

// 视差效果
.hero-background {
  transform: translateZ(0);
  
  .hero-image {
    transform: scale(1.1);
    transition: transform 0.3s ease-out;
  }
}

.hero-banner:hover .hero-image {
  transform: scale(1.05);
}
</style>
