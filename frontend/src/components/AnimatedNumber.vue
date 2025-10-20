<template>
    <span ref="elementRef" class="animated-number">{{ displayValue }}</span>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
    value: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number,
        default: 2000 // 动画持续时间（毫秒）
    },
    startOnVisible: {
        type: Boolean,
        default: true // 是否在元素可见时才开始动画
    }
})

const displayValue = ref(0)
const hasAnimated = ref(false)
const elementRef = ref(null)
let observer = null

// 缓动函数 - easeOutQuart，让动画有减速效果
const easeOutQuart = (t) => {
    return 1 - Math.pow(1 - t, 4)
}

const animateNumber = (startValue, endValue, duration) => {
    if (hasAnimated.value && props.startOnVisible) return

    const startTime = Date.now()

    const animate = () => {
        const currentTime = Date.now()
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // 使用缓动函数让动画更自然
        const easedProgress = easeOutQuart(progress)

        displayValue.value = Math.floor(startValue + (endValue - startValue) * easedProgress)

        if (progress < 1) {
            requestAnimationFrame(animate)
        } else {
            displayValue.value = endValue
            hasAnimated.value = true
        }
    }

    animate()
}

const isVisible = ref(false)

// 监听 value 变化
watch(() => props.value, (newValue) => {
    if (newValue && !hasAnimated.value) {
        if (!props.startOnVisible) {
            // 不需要等待可见，直接播放
            animateNumber(0, newValue, props.duration)
        } else if (isVisible.value) {
            // 需要等待可见，且已经可见了，播放动画
            animateNumber(0, newValue, props.duration)
        }
        // 如果需要等待可见但还不可见，等待 observer 触发
    }
})

onMounted(() => {
    if (!props.startOnVisible) {
        // 不需要等待可见，如果有值就直接播放
        if (props.value) {
            animateNumber(0, props.value, props.duration)
        }
    } else {
        // 需要等待可见，设置 observer
        const element = elementRef.value

        if (element && 'IntersectionObserver' in window) {
            observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting && !hasAnimated.value) {
                            isVisible.value = true
                            // 如果此时已经有值了，播放动画
                            if (props.value) {
                                animateNumber(0, props.value, props.duration)
                            }
                            // 否则等待 watch 触发
                            if (observer) {
                                observer.disconnect()
                            }
                        }
                    })
                },
                {
                    threshold: 0.3 // 元素30%可见时触发，更早触发
                }
            )

            observer.observe(element)
        } else {
            // 如果不支持 IntersectionObserver，直接标记为可见
            isVisible.value = true
            if (props.value) {
                animateNumber(0, props.value, props.duration)
            }
        }
    }
})

onUnmounted(() => {
    if (observer) {
        observer.disconnect()
    }
})
</script>

<style scoped>
.animated-number {
    display: inline-block;
    font-variant-numeric: tabular-nums;
}
</style>
