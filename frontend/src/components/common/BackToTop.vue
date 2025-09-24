<template>
  <Transition name="fade">
    <button 
      v-show="isVisible" 
      class="back-to-top" 
      @click="scrollToTop"
      :title="'返回顶部'"
    >
      <svg class="arrow-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
      </svg>
    </button>
  </Transition>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'BackToTop',
  setup() {
    const isVisible = ref(false)
    
    // 监听滚动事件
    const handleScroll = () => {
      isVisible.value = window.scrollY > 300
    }
    
    // 滚动到顶部
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
    
    onMounted(() => {
      window.addEventListener('scroll', handleScroll, { passive: true })
    })
    
    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })
    
    return {
      isVisible,
      scrollToTop
    }
  }
}
</script>

<style lang="scss" scoped>
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-medium);
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--primary-hover);
    transform: translateY(-3px);
    box-shadow: var(--shadow-heavy);
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    bottom: 20px;
    right: 20px;
    width: 45px;
    height: 45px;
  }
}

.arrow-icon {
  width: 24px;
  height: 24px;
  transition: transform 0.3s ease;
  
  .back-to-top:hover & {
    transform: translateY(-2px);
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.8);
}
</style>
