<template>
    <span class="animated-number">{{ displayValue }}</span>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
    value: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number,
        default: 2000
    }
})

const displayValue = ref(0)

const animateNumber = (startValue, endValue, duration) => {
    const startTime = Date.now()
    const animate = () => {
        const currentTime = Date.now()
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        displayValue.value = Math.floor(startValue + (endValue - startValue) * progress)

        if (progress < 1) {
            requestAnimationFrame(animate)
        }
    }
    animate()
}

watch(() => props.value, (newValue, oldValue) => {
    animateNumber(oldValue || 0, newValue, props.duration)
}, { immediate: true })

onMounted(() => {
    animateNumber(0, props.value, props.duration)
})
</script>

<style scoped>
.animated-number {
    font-weight: 600;
    transition: color 0.3s ease;
}
</style>
