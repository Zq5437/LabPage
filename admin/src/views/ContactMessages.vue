<template>
    <div class="contact-messages-page">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <h1>联系留言管理</h1>
                <p>管理来自网站的联系表单和留言信息</p>
            </div>
            <div class="header-actions">
                <el-button @click="refreshData" :loading="loading">
                    <el-icon>
                        <Refresh />
                    </el-icon>
                    刷新数据
                </el-button>
            </div>
        </div>

        <!-- 统计卡片 -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">
                    <el-icon>
                        <Message />
                    </el-icon>
                </div>
                <div class="stat-content">
                    <div class="stat-number">{{ stats.total_messages || 0 }}</div>
                    <div class="stat-label">总留言数</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon unread">
                    <el-icon>
                        <Bell />
                    </el-icon>
                </div>
                <div class="stat-content">
                    <div class="stat-number">{{ unreadCount || 0 }}</div>
                    <div class="stat-label">未读留言</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon today">
                    <el-icon>
                        <Calendar />
                    </el-icon>
                </div>
                <div class="stat-content">
                    <div class="stat-number">{{ stats.today_messages || 0 }}</div>
                    <div class="stat-label">今日留言</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon month">
                    <el-icon>
                        <TrendCharts />
                    </el-icon>
                </div>
                <div class="stat-content">
                    <div class="stat-number">{{ stats.month_messages || 0 }}</div>
                    <div class="stat-label">本月留言</div>
                </div>
            </div>
        </div>

        <!-- 筛选和搜索 -->
        <div class="filter-section">
            <div class="filter-form">
                <el-form :model="filterForm" inline>
                    <el-form-item label="状态">
                        <el-select v-model="filterForm.status" placeholder="全部状态" clearable style="width: 120px;">
                            <el-option label="未读" value="unread" />
                            <el-option label="已读" value="read" />
                            <el-option label="已回复" value="replied" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="主题">
                        <el-select v-model="filterForm.subject" placeholder="全部主题" clearable style="width: 120px;">
                            <el-option label="学术合作" value="academic" />
                            <el-option label="项目咨询" value="project" />
                            <el-option label="招生咨询" value="admission" />
                            <el-option label="设备使用" value="equipment" />
                            <el-option label="其他咨询" value="other" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="搜索">
                        <el-input v-model="filterForm.keyword" placeholder="搜索姓名、邮箱或内容" clearable style="width: 200px;"
                            @keyup.enter="loadMessages">
                            <template #prefix>
                                <el-icon>
                                    <Search />
                                </el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="loadMessages">
                            <el-icon>
                                <Search />
                            </el-icon>
                            搜索
                        </el-button>
                        <el-button @click="resetFilter">
                            <el-icon>
                                <RefreshLeft />
                            </el-icon>
                            重置
                        </el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>

        <!-- 留言列表 -->
        <div class="messages-section">
            <el-card>
                <template #header>
                    <div class="card-header">
                        <span>留言列表</span>
                        <div class="batch-actions">
                            <el-button size="small" @click="batchMarkRead" :disabled="!hasUnreadSelected">
                                标记已读
                            </el-button>
                            <el-popconfirm title="确定要删除选中的留言吗？" @confirm="batchDelete">
                                <template #reference>
                                    <el-button size="small" type="danger" :disabled="selectedMessages.length === 0">
                                        批量删除
                                    </el-button>
                                </template>
                            </el-popconfirm>
                        </div>
                    </div>
                </template>

                <el-table ref="messagesTableRef" v-loading="loading" :data="messages"
                    @selection-change="handleSelectionChange" @sort-change="handleSort" empty-text="暂无留言数据"
                    style="width: 100%">
                    <el-table-column type="selection" width="50" />

                    <el-table-column prop="id" label="ID" width="80" sortable="custom" />

                    <el-table-column prop="status" label="状态" width="100" sortable="custom">
                        <template #default="{ row }">
                            <el-tag :type="getStatusType(row.status)" size="small">
                                {{ getStatusText(row.status) }}
                            </el-tag>
                        </template>
                    </el-table-column>

                    <el-table-column prop="name" label="联系人" width="150" sortable="custom">
                        <template #default="{ row }">
                            <div class="contact-info">
                                <div class="name">{{ row.name }}</div>
                                <div class="email">{{ row.email }}</div>
                                <div v-if="row.phone" class="phone">{{ row.phone }}</div>
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column prop="subject" label="主题" width="120" sortable="custom">
                        <template #default="{ row }">
                            <el-tag :type="getSubjectTagType(row.subject)" size="small">{{ getSubjectText(row.subject)
                                }}</el-tag>
                        </template>
                    </el-table-column>

                    <el-table-column label="留言内容" min-width="300">
                        <template #default="{ row }">
                            <div class="message-content">
                                <p>{{ truncateText(row.message, 100) }}</p>
                                <el-button v-if="row.message.length > 100" link type="primary" size="small"
                                    @click="viewMessage(row)">
                                    查看全文
                                </el-button>
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column prop="created_at" label="提交时间" width="160" sortable="custom">
                        <template #default="{ row }">
                            {{ formatDateTime(row.created_at) }}
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" width="180" fixed="right">
                        <template #default="{ row }">
                            <div class="action-buttons">
                                <el-tooltip content="查看详情" placement="top">
                                    <el-button size="small" @click="viewMessage(row)" circle>
                                        <el-icon>
                                            <View />
                                        </el-icon>
                                    </el-button>
                                </el-tooltip>
                                <el-tooltip v-if="row.status === 'unread'" content="标记已读" placement="top">
                                    <el-button size="small" type="primary" @click="markAsRead(row)" circle>
                                        <el-icon>
                                            <Check />
                                        </el-icon>
                                    </el-button>
                                </el-tooltip>
                                <el-tooltip v-else content="标记未读" placement="top">
                                    <el-button size="small" type="warning" @click="markAsUnread(row)" circle>
                                        <el-icon>
                                            <Bell />
                                        </el-icon>
                                    </el-button>
                                </el-tooltip>
                                <el-tooltip content="回复留言" placement="top">
                                    <el-button size="small" type="success" @click="replyMessage(row)" circle>
                                        <el-icon>
                                            <ChatDotRound />
                                        </el-icon>
                                    </el-button>
                                </el-tooltip>
                                <el-popconfirm title="确定要删除这条留言吗？" @confirm="deleteMessage(row.id)">
                                    <template #reference>
                                        <el-tooltip content="删除留言" placement="top">
                                            <el-button size="small" type="danger" circle>
                                                <el-icon>
                                                    <Delete />
                                                </el-icon>
                                            </el-button>
                                        </el-tooltip>
                                    </template>
                                </el-popconfirm>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 分页 -->
                <div class="pagination-wrapper">
                    <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.limit"
                        :total="pagination.total" :page-sizes="[10, 20, 50, 100]"
                        layout="total, sizes, prev, pager, next, jumper" @size-change="loadMessages"
                        @current-change="loadMessages" />
                </div>
            </el-card>
        </div>

        <!-- 查看留言详情对话框 -->
        <el-dialog v-model="viewDialogVisible" title="留言详情" width="800px" :before-close="handleViewClose">
            <div v-if="currentMessage" class="message-detail">
                <div class="detail-section">
                    <h3>联系人信息</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>姓名：</label>
                            <span>{{ currentMessage.name }}</span>
                        </div>
                        <div class="info-item">
                            <label>邮箱：</label>
                            <span>{{ currentMessage.email }}</span>
                        </div>
                        <div class="info-item">
                            <label>电话：</label>
                            <span>{{ currentMessage.phone || '未提供' }}</span>
                        </div>
                        <div class="info-item">
                            <label>主题：</label>
                            <el-tag size="small">{{ getSubjectText(currentMessage.subject) }}</el-tag>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>留言内容</h3>
                    <div class="message-text">
                        {{ currentMessage.message }}
                    </div>
                </div>

                <div class="detail-section">
                    <h3>提交信息</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>提交时间：</label>
                            <span>{{ formatDateTime(currentMessage.created_at) }}</span>
                        </div>
                        <div class="info-item">
                            <label>状态：</label>
                            <el-tag :type="getStatusType(currentMessage.status)">
                                {{ getStatusText(currentMessage.status) }}
                            </el-tag>
                        </div>
                    </div>
                </div>

                <div v-if="currentMessage.admin_reply" class="detail-section">
                    <h3>管理员回复</h3>
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
                    <el-button type="success" @click="replyMessage(currentMessage)">
                        回复留言
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 回复留言对话框 -->
        <el-dialog v-model="replyDialogVisible" title="回复留言" width="600px">
            <div v-if="currentReplyMessage" class="reply-form">
                <div class="original-message">
                    <h4>原留言内容：</h4>
                    <p>{{ currentReplyMessage.message }}</p>
                </div>

                <el-form :model="replyForm" label-width="80px">
                    <el-form-item label="回复内容" required>
                        <el-input v-model="replyForm.reply" type="textarea" :rows="6" placeholder="请输入回复内容..."
                            maxlength="1000" show-word-limit />
                    </el-form-item>
                </el-form>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="replyDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitReply" :loading="submitting">
                        发送回复
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/utils/api'
import {
    Refresh, Message, Bell, Calendar, TrendCharts, Search, RefreshLeft,
    View, Check, ChatDotRound, Delete
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const messages = ref([])
const selectedMessages = ref([])
const stats = ref({})
const messagesTableRef = ref()

// 分页
const pagination = reactive({
    page: 1,
    limit: 20,
    total: 0
})

// 排序
const sort = reactive({
    field: 'created_at',
    order: 'DESC'
})

// 筛选表单
const filterForm = reactive({
    status: '',
    subject: '',
    keyword: ''
})

// 对话框
const viewDialogVisible = ref(false)
const replyDialogVisible = ref(false)
const currentMessage = ref(null)
const currentReplyMessage = ref(null)

// 回复表单
const replyForm = reactive({
    reply: ''
})

// 计算属性
const unreadCount = computed(() => {
    return messages.value.filter(msg => msg.status === 'unread').length
})

const hasUnreadSelected = computed(() => {
    return selectedMessages.value.some(msg => msg.status === 'unread')
})

// 加载统计信息
const loadStats = async () => {
    try {
        const response = await api.get('/contact/stats')
        if (response.data) {
            stats.value = response.data.overview || {}
        }
    } catch (error) {
        console.error('加载统计信息失败:', error)
    }
}

// 加载留言列表
const loadMessages = async () => {
    try {
        loading.value = true
        const params = {
            page: pagination.page,
            limit: pagination.limit,
            sort: sort.field,
            order: sort.order,
            ...filterForm
        }

        // 移除空值参数
        Object.keys(params).forEach(key => {
            if (params[key] === '' || params[key] === null || params[key] === undefined) {
                delete params[key]
            }
        })

        const response = await api.get('/contact/messages', { params })

        if (response.data) {
            messages.value = response.data || []
            if (response.pagination) {
                pagination.total = response.pagination.total
            }
        }
    } catch (error) {
        console.error('加载留言列表失败:', error)
        ElMessage.error('加载留言列表失败')
    } finally {
        loading.value = false
    }
}

// 刷新数据
const refreshData = async () => {
    await Promise.all([loadStats(), loadMessages()])
    ElMessage.success('数据刷新成功')
}

// 重置筛选
const resetFilter = () => {
    Object.keys(filterForm).forEach(key => {
        filterForm[key] = ''
    })
    pagination.page = 1
    loadMessages()
}

// 表格选择变化
const handleSelectionChange = (selection) => {
    selectedMessages.value = selection
}

// 排序处理
const handleSort = ({ prop, order }) => {
    if (prop) {
        sort.field = prop
        sort.order = order === 'ascending' ? 'ASC' : 'DESC'
    } else {
        // 取消排序，恢复默认
        sort.field = 'created_at'
        sort.order = 'DESC'
    }
    loadMessages()
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

// 关闭查看对话框
const handleViewClose = () => {
    viewDialogVisible.value = false
    currentMessage.value = null
}

// 标记为已读
const markAsRead = async (message, showMessage = true) => {
    try {
        await api.put(`/contact/messages/${message.id}/read`)

        // 更新本地状态
        message.status = 'read'

        if (showMessage) {
            ElMessage.success('已标记为已读')
        }
    } catch (error) {
        console.error('标记已读失败:', error)
        ElMessage.error('标记已读失败')
    }
}

// 标记为未读
const markAsUnread = async (message) => {
    try {
        await api.put(`/contact/messages/${message.id}/unread`)

        // 更新本地状态
        message.status = 'unread'

        ElMessage.success('已标记为未读')
    } catch (error) {
        console.error('标记未读失败:', error)
        ElMessage.error('标记未读失败')
    }
}

// 批量标记已读
const batchMarkRead = async () => {
    try {
        const unreadMessages = selectedMessages.value.filter(msg => msg.status === 'unread')
        if (unreadMessages.length === 0) {
            ElMessage.warning('没有未读留言需要标记')
            return
        }

        const ids = unreadMessages.map(msg => msg.id)
        await api.put('/contact/messages/batch-read', { ids })

        // 更新本地状态
        unreadMessages.forEach(msg => {
            msg.status = 'read'
        })

        ElMessage.success(`已标记 ${unreadMessages.length} 条留言为已读`)
    } catch (error) {
        console.error('批量标记已读失败:', error)
        ElMessage.error('批量标记已读失败')
    }
}

// 回复留言
const replyMessage = (message) => {
    currentReplyMessage.value = message
    replyForm.reply = ''
    replyDialogVisible.value = true
}

// 提交回复
const submitReply = async () => {
    if (!replyForm.reply.trim()) {
        ElMessage.warning('请输入回复内容')
        return
    }

    try {
        submitting.value = true
        await api.put(`/contact/messages/${currentReplyMessage.value.id}/reply`, {
            reply: replyForm.reply
        })

        // 更新本地状态
        currentReplyMessage.value.status = 'replied'
        currentReplyMessage.value.admin_reply = replyForm.reply

        ElMessage.success('回复发送成功')
        replyDialogVisible.value = false

        // 如果查看对话框也打开着，需要更新
        if (currentMessage.value && currentMessage.value.id === currentReplyMessage.value.id) {
            currentMessage.value = { ...currentReplyMessage.value }
        }
    } catch (error) {
        console.error('发送回复失败:', error)
        ElMessage.error('发送回复失败')
    } finally {
        submitting.value = false
    }
}

// 删除留言
const deleteMessage = async (id) => {
    try {
        await api.delete(`/contact/messages/${id}`)

        // 从列表中移除
        const index = messages.value.findIndex(msg => msg.id === id)
        if (index > -1) {
            messages.value.splice(index, 1)
            pagination.total--
        }

        ElMessage.success('删除成功')
    } catch (error) {
        console.error('删除留言失败:', error)
        ElMessage.error('删除留言失败')
    }
}

// 批量删除
const batchDelete = async () => {
    try {
        const ids = selectedMessages.value.map(msg => msg.id)
        await api.delete('/contact/messages/batch', { data: { ids } })

        // 从列表中移除
        ids.forEach(id => {
            const index = messages.value.findIndex(msg => msg.id === id)
            if (index > -1) {
                messages.value.splice(index, 1)
            }
        })

        pagination.total -= ids.length
        ElMessage.success(`已删除 ${ids.length} 条留言`)

        // 清空选择
        messagesTableRef.value.clearSelection()
    } catch (error) {
        console.error('批量删除失败:', error)
        ElMessage.error('批量删除失败')
    }
}

// 工具函数
const getStatusType = (status) => {
    const typeMap = {
        'unread': 'danger',
        'read': 'warning',
        'replied': 'success'
    }
    return typeMap[status] || 'info'
}

const getStatusText = (status) => {
    const textMap = {
        'unread': '未读',
        'read': '已读',
        'replied': '已回复'
    }
    return textMap[status] || status
}

const getSubjectTagType = (subject) => {
    const typeMap = {
        'academic': 'primary',    // 蓝色 - 学术合作
        'project': 'success',     // 绿色 - 项目咨询
        'admission': 'warning',   // 橙色 - 招生咨询
        'equipment': 'danger',    // 红色 - 设备使用
        'other': 'info'           // 灰色 - 其他咨询
    }
    return typeMap[subject] || ''
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

const truncateText = (text, maxLength) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const formatDateTime = (dateTime) => {
    if (!dateTime) return ''
    return new Date(dateTime).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
    loadStats()
    loadMessages()
})
</script>

<style scoped>
.contact-messages-page {
    padding: 20px;
    background: #f5f5f5;
    min-height: 100vh;
}

/* 页面头部 */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content h1 {
    margin: 0 0 5px 0;
    color: #2c3e50;
    font-size: 1.8rem;
}

.header-content p {
    margin: 0;
    color: #666;
}

/* 统计卡片 */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
}

.stat-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    margin-right: 15px;
    background: #3498db;
    color: white;
}

.stat-icon.unread {
    background: #e74c3c;
}

.stat-icon.today {
    background: #2ecc71;
}

.stat-icon.month {
    background: #f39c12;
}

.stat-content {
    flex: 1;
}

.stat-number {
    font-size: 2rem;
    font-weight: bold;
    color: #2c3e50;
    line-height: 1;
}

.stat-label {
    color: #666;
    font-size: 0.9rem;
    margin-top: 5px;
}

/* 筛选区域 */
.filter-section {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 留言区域 */
.messages-section {
    background: transparent;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.batch-actions {
    display: flex;
    gap: 10px;
}

/* 表格样式 */
.action-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
    align-items: center;
}

.contact-info {
    line-height: 1.4;
}

.contact-info .name {
    font-weight: bold;
    color: #2c3e50;
}

.contact-info .email {
    color: #666;
    font-size: 0.9rem;
}

.contact-info .phone {
    color: #666;
    font-size: 0.9rem;
}

.message-content p {
    margin: 0;
    line-height: 1.4;
    color: #555;
}

/* 分页 */
.pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

/* 对话框样式 */
.message-detail {
    max-height: 600px;
    overflow-y: auto;
}

.detail-section {
    margin-bottom: 30px;
}

.detail-section h3 {
    margin: 0 0 15px 0;
    color: #2c3e50;
    font-size: 1.2rem;
    border-bottom: 2px solid #eee;
    padding-bottom: 8px;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.info-item {
    display: flex;
    align-items: center;
}

.info-item label {
    font-weight: bold;
    color: #666;
    margin-right: 8px;
    min-width: 60px;
}

.message-text,
.reply-text {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 6px;
    line-height: 1.6;
    color: #555;
    white-space: pre-wrap;
}

.reply-text {
    background: #e8f5e8;
}

/* 回复表单 */
.reply-form {
    margin-bottom: 20px;
}

.original-message {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 20px;
}

.original-message h4 {
    margin: 0 0 10px 0;
    color: #666;
    font-size: 1rem;
}

.original-message p {
    margin: 0;
    color: #555;
    line-height: 1.6;
}

@media (max-width: 768px) {
    .contact-messages-page {
        padding: 10px;
    }

    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }

    .header-actions {
        width: 100%;
        display: flex;
        justify-content: flex-end;
    }

    .stats-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }

    .info-grid {
        grid-template-columns: 1fr;
        gap: 10px;
    }

    .batch-actions {
        flex-direction: column;
        width: 100%;
    }
}
</style>
