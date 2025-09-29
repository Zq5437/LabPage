<template>
    <div class="contact-messages-simple">
        <h1>联系留言管理 (简化版)</h1>

        <div class="stats">
            <p>总留言数: {{ messages.length }}</p>
            <p>加载状态: {{ loading ? '加载中...' : '加载完成' }}</p>
            <p>错误信息: {{ error || '无' }}</p>
        </div>

        <button @click="loadMessages" :disabled="loading">
            {{ loading ? '加载中...' : '刷新数据' }}
        </button>

        <div class="messages-list">
            <div v-if="messages.length === 0" class="no-data">
                暂无留言数据
            </div>

            <div v-for="message in messages" :key="message.id" class="message-item">
                <div class="message-header">
                    <strong>{{ message.name }}</strong> ({{ message.email }})
                    <span class="date">{{ formatDate(message.created_at) }}</span>
                </div>
                <div class="message-subject">主题: {{ getSubjectText(message.subject) }}</div>
                <div class="message-content">{{ message.message }}</div>
                <div class="message-status">状态: {{ message.status }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const messages = ref([])
const loading = ref(false)
const error = ref('')

const loadMessages = async () => {
    try {
        loading.value = true
        error.value = ''

        console.log('开始加载留言...')
        const response = await api.get('/contact/messages')
        console.log('API响应:', response)

        if (response.data) {
            messages.value = response.data
            console.log('加载成功，留言数量:', messages.value.length)
        } else {
            error.value = '没有返回数据'
        }
    } catch (err) {
        console.error('加载留言失败:', err)
        error.value = err.message || '加载失败'
    } finally {
        loading.value = false
    }
}

const getSubjectText = (subject) => {
    const textMap = {
        'academic': '学术合作',
        'project': '项目咨询',
        'admission': '招生咨询',
        'equipment': '设备使用',
        'other': '其他咨询'
    }
    return textMap[subject] || subject
}

const formatDate = (dateTime) => {
    if (!dateTime) return ''
    return new Date(dateTime).toLocaleString('zh-CN')
}

onMounted(() => {
    loadMessages()
})
</script>

<style scoped>
.contact-messages-simple {
    padding: 20px;
    max-width: 1000px;
    margin: 0 auto;
}

h1 {
    color: #2c3e50;
    margin-bottom: 20px;
}

.stats {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 5px;
    margin-bottom: 20px;
}

.stats p {
    margin: 5px 0;
}

button {
    background: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    margin-bottom: 20px;
}

button:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.no-data {
    text-align: center;
    color: #666;
    padding: 40px;
    font-size: 16px;
}

.message-item {
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 15px;
    margin-bottom: 15px;
    background: white;
}

.message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-weight: bold;
}

.date {
    font-size: 12px;
    color: #666;
    font-weight: normal;
}

.message-subject {
    color: #666;
    margin-bottom: 8px;
}

.message-content {
    background: #f8f9fa;
    padding: 10px;
    border-radius: 3px;
    margin-bottom: 8px;
    line-height: 1.5;
}

.message-status {
    font-size: 12px;
    color: #666;
}
</style>
