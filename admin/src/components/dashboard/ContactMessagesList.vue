<template>
    <div class="contact-messages-list">
        <div v-if="loading" class="loading-container">
            <el-skeleton :rows="5" animated />
        </div>
        <div v-else-if="messages.length === 0" class="empty-container">
            <el-empty description="暂无联系留言" :image-size="80">
                <el-button type="primary" size="small" @click="$router.push('/contact-messages')">
                    查看全部留言
                </el-button>
            </el-empty>
        </div>
        <div v-else class="messages-container">
            <div class="messages-items">
                <div v-for="message in messages" :key="message.id" class="message-item"
                    :class="{ 'unread': message.status === 'unread' }" @click="viewMessage(message)">
                    <div class="message-status">
                        <el-badge v-if="message.status === 'unread'" is-dot type="danger" />
                        <el-icon v-else-if="message.status === 'replied'" color="#67c23a">
                            <Check />
                        </el-icon>
                    </div>

                    <div class="message-content">
                        <div class="message-header">
                            <span class="sender-name">{{ message.name }}</span>
                            <span class="message-time">{{ formatTime(message.created_at) }}</span>
                        </div>

                        <div class="message-subject">
                            <el-tag size="small" type="info">{{ getSubjectText(message.subject) }}</el-tag>
                        </div>

                        <div class="message-preview">
                            {{ truncateText(message.message, 60) }}
                        </div>
                    </div>

                    <div class="message-actions">
                        <el-dropdown @command="(command) => handleCommand(command, message)" trigger="click">
                            <el-icon class="action-icon" @click.stop>
                                <MoreFilled />
                            </el-icon>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item command="view">查看详情</el-dropdown-item>
                                    <el-dropdown-item v-if="message.status === 'unread'"
                                        command="read">标记已读</el-dropdown-item>
                                    <el-dropdown-item command="reply">回复留言</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                </div>
            </div>
        </div>

        <!-- 查看留言详情对话框 -->
        <el-dialog v-model="viewDialogVisible" title="留言详情" width="600px">
            <div v-if="currentMessage" class="message-detail">
                <div class="detail-section">
                    <div class="contact-info">
                        <div class="info-row">
                            <span class="label">联系人：</span>
                            <span>{{ currentMessage.name }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">邮箱：</span>
                            <span>{{ currentMessage.email }}</span>
                        </div>
                        <div v-if="currentMessage.phone" class="info-row">
                            <span class="label">电话：</span>
                            <span>{{ currentMessage.phone }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">主题：</span>
                            <el-tag size="small">{{ getSubjectText(currentMessage.subject) }}</el-tag>
                        </div>
                        <div class="info-row">
                            <span class="label">时间：</span>
                            <span>{{ formatDateTime(currentMessage.created_at) }}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>留言内容</h4>
                    <div class="message-text">
                        {{ currentMessage.message }}
                    </div>
                </div>

                <div v-if="currentMessage.admin_reply" class="detail-section">
                    <h4>管理员回复</h4>
                    <div class="reply-text">
                        {{ currentMessage.admin_reply }}
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="viewDialogVisible = false">关闭</el-button>
                    <el-button v-if="currentMessage && currentMessage.status === 'unread'" type="primary"
                        @click="markAsRead(currentMessage)">
                        标记已读
                    </el-button>
                    <el-button type="success" @click="goToContactMessages">
                        前往管理页面
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowRight, Check, MoreFilled } from '@element-plus/icons-vue'
import { contactApi } from '@/utils/api'
import dayjs from 'dayjs'

const router = useRouter()

// 定义emit
const emit = defineEmits(['stats-update'])

// 响应式数据
const loading = ref(false)
const messages = ref([])
const viewDialogVisible = ref(false)
const currentMessage = ref(null)

// 计算属性
const unreadCount = computed(() => {
    return messages.value.filter(msg => msg.status === 'unread').length
})

const todayCount = computed(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return messages.value.filter(msg => {
        return dayjs(msg.created_at).format('YYYY-MM-DD') === today
    }).length
})

// 加载最新留言
const loadMessages = async () => {
    try {
        loading.value = true
        const response = await contactApi.getMessages({
            page: 1,
            limit: 8, // 只显示最新8条
            sort: 'created_at',
            order: 'desc'
        })

        if (response.data) {
            messages.value = response.data || []
            // 发射统计信息给父组件
            emit('stats-update', {
                unreadCount: unreadCount.value,
                todayCount: todayCount.value
            })
        }
    } catch (error) {
        console.error('加载联系留言失败:', error)
        messages.value = []
        emit('stats-update', { unreadCount: 0, todayCount: 0 })
    } finally {
        loading.value = false
    }
}

// 查看留言详情
const viewMessage = (message) => {
    currentMessage.value = message
    viewDialogVisible.value = true

    // 如果是未读状态，自动标记为已读
    if (message.status === 'unread') {
        markAsRead(message, false)
    }
}

// 标记为已读
const markAsRead = async (message, showMessage = true) => {
    try {
        await contactApi.markAsRead(message.id)

        // 更新本地状态
        message.status = 'read'

        // 重新发射统计信息
        emit('stats-update', {
            unreadCount: unreadCount.value,
            todayCount: todayCount.value
        })

        if (showMessage) {
            ElMessage.success('已标记为已读')
        }
    } catch (error) {
        console.error('标记已读失败:', error)
        if (showMessage) {
            ElMessage.error('标记已读失败')
        }
    }
}

// 处理下拉菜单命令
const handleCommand = (command, message) => {
    switch (command) {
        case 'view':
            viewMessage(message)
            break
        case 'read':
            markAsRead(message)
            break
        case 'reply':
            goToContactMessages(message.id)
            break
    }
}

// 前往联系留言管理页面
const goToContactMessages = (messageId = null) => {
    const route = messageId ? `/contact-messages?id=${messageId}` : '/contact-messages'
    router.push(route)
}

// 工具函数
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

const truncateText = (text, maxLength) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const formatTime = (dateTime) => {
    if (!dateTime) return ''
    const now = dayjs()
    const msgTime = dayjs(dateTime)

    if (now.diff(msgTime, 'day') === 0) {
        return msgTime.format('HH:mm')
    } else if (now.diff(msgTime, 'day') === 1) {
        return '昨天'
    } else if (now.diff(msgTime, 'day') < 7) {
        return msgTime.format('MM-DD')
    } else {
        return msgTime.format('MM-DD')
    }
}

const formatDateTime = (dateTime) => {
    if (!dateTime) return ''
    return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss')
}

// 暴露未读数量给父组件
defineExpose({
    unreadCount,
    loadMessages
})

onMounted(() => {
    loadMessages()
})
</script>

<style scoped>
.contact-messages-list {
    padding: 20px;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.loading-container,
.empty-container {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.messages-container {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.messages-items {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
}

.message-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #f5f5f5;
    cursor: pointer;
    transition: background-color 0.2s;
}

.message-item:hover {
    background-color: #fafafa;
    border-radius: 4px;
    margin: 0 -8px;
    padding-left: 8px;
    padding-right: 8px;
}

.message-item.unread {
    background-color: #f0f9ff;
}

.message-item.unread:hover {
    background-color: #e0f2fe;
}

.message-item:last-child {
    border-bottom: none;
}

.message-status {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2px;
}

.message-content {
    flex: 1;
    min-width: 0;
}

.message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.sender-name {
    font-weight: 500;
    color: #2c3e50;
    font-size: 14px;
}

.message-time {
    font-size: 11px;
    color: #999;
}

.message-subject {
    margin-bottom: 6px;
}

.message-preview {
    font-size: 12px;
    color: #666;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

.message-actions {
    width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2px;
}

.action-icon {
    cursor: pointer;
    color: #999;
    transition: color 0.2s;
    font-size: 16px;
}

.action-icon:hover {
    color: #409eff;
}

/* 对话框样式 */
.message-detail {
    max-height: 500px;
    overflow-y: auto;
}

.detail-section {
    margin-bottom: 20px;
}

.detail-section h4 {
    margin: 0 0 10px 0;
    color: #2c3e50;
    font-size: 14px;
    font-weight: 600;
}

.contact-info {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 6px;
}

.info-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.info-row:last-child {
    margin-bottom: 0;
}

.label {
    font-weight: 500;
    color: #666;
    margin-right: 8px;
    min-width: 50px;
    font-size: 13px;
}

.message-text {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 6px;
    line-height: 1.6;
    color: #555;
    white-space: pre-wrap;
    font-size: 13px;
}

.reply-text {
    background: #e8f5e8;
    padding: 15px;
    border-radius: 6px;
    line-height: 1.6;
    color: #555;
    white-space: pre-wrap;
    font-size: 13px;
}

/* 响应式 */
@media (max-width: 768px) {
    .contact-messages-list {
        padding: 15px;
    }

    .message-item {
        gap: 10px;
    }
}
</style>
