<template>
    <div class="todo-list">
        <div v-if="loading" class="loading-container">
            <el-skeleton :rows="5" animated />
        </div>
        <div v-else-if="todoList.length === 0" class="empty-container">
            <el-empty description="暂无待办事项">
                <el-button type="primary" size="small" @click="addTodo">
                    添加待办事项
                </el-button>
            </el-empty>
        </div>
        <div v-else class="todo-container">
            <div class="todo-header">
                <el-button type="primary" size="small" @click="addTodo">
                    <el-icon>
                        <Plus />
                    </el-icon>
                    添加
                </el-button>
            </div>
            <div class="todo-items">
                <div v-for="todo in todoList" :key="todo.id" class="todo-item" :class="{ completed: todo.completed }">
                    <el-checkbox v-model="todo.completed" @change="toggleTodo(todo)" />
                    <div class="todo-content" @click="editTodo(todo)">
                        <div class="todo-title">{{ todo.title }}</div>
                        <div class="todo-meta">
                            <span class="todo-priority" :class="getPriorityClass(todo.priority)">
                                {{ getPriorityText(todo.priority) }}
                            </span>
                            <span class="todo-date">{{ formatDate(todo.due_date || todo.created_at) }}</span>
                        </div>
                    </div>
                    <el-dropdown @command="(command) => handleCommand(command, todo)">
                        <el-icon class="todo-actions">
                            <MoreFilled />
                        </el-icon>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="edit">编辑</el-dropdown-item>
                                <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </div>
        </div>

        <!-- 添加/编辑对话框 -->
        <el-dialog v-model="dialogVisible" :title="editingTodo ? '编辑待办事项' : '添加待办事项'" width="400px">
            <el-form :model="todoForm" label-width="80px">
                <el-form-item label="标题">
                    <el-input v-model="todoForm.title" placeholder="请输入待办事项标题" />
                </el-form-item>
                <el-form-item label="优先级">
                    <el-select v-model="todoForm.priority" placeholder="选择优先级">
                        <el-option label="低" value="low" />
                        <el-option label="中" value="medium" />
                        <el-option label="高" value="high" />
                    </el-select>
                </el-form-item>
                <el-form-item label="截止日期">
                    <el-date-picker v-model="todoForm.due_date" type="date" placeholder="选择截止日期" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="saveTodo">保存</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, MoreFilled } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

// 响应式数据
const loading = ref(false)
const todoList = ref([])
const dialogVisible = ref(false)
const editingTodo = ref(null)

// 表单数据
const todoForm = reactive({
    title: '',
    priority: 'medium',
    due_date: null
})

// 模拟的待办事项数据（实际项目中应该连接到真实的API）
const mockTodos = [
    {
        id: 1,
        title: '更新实验室网站内容',
        priority: 'high',
        completed: false,
        due_date: '2024-01-15',
        created_at: '2024-01-10'
    },
    {
        id: 2,
        title: '准备下周的组会PPT',
        priority: 'medium',
        completed: false,
        due_date: '2024-01-12',
        created_at: '2024-01-08'
    },
    {
        id: 3,
        title: '审核新提交的论文',
        priority: 'high',
        completed: true,
        due_date: '2024-01-10',
        created_at: '2024-01-05'
    },
    {
        id: 4,
        title: '联系合作实验室',
        priority: 'low',
        completed: false,
        due_date: '2024-01-20',
        created_at: '2024-01-09'
    },
    {
        id: 5,
        title: '整理实验数据',
        priority: 'medium',
        completed: false,
        due_date: '2024-01-18',
        created_at: '2024-01-07'
    }
]

// 加载待办事项
const loadTodos = async () => {
    try {
        loading.value = true
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500))

        // 在实际项目中，这里应该调用真实的API
        // const response = await todoApi.getList()
        // todoList.value = response.data || []

        todoList.value = [...mockTodos]
    } catch (error) {
        console.error('加载待办事项失败:', error)
        todoList.value = []
    } finally {
        loading.value = false
    }
}

// 格式化日期
const formatDate = (dateString) => {
    return dayjs(dateString).format('MM-DD')
}

// 获取优先级文本
const getPriorityText = (priority) => {
    const priorityMap = {
        low: '低',
        medium: '中',
        high: '高'
    }
    return priorityMap[priority] || '中'
}

// 获取优先级样式类
const getPriorityClass = (priority) => {
    return `priority-${priority}`
}

// 切换待办事项状态
const toggleTodo = (todo) => {
    // 在实际项目中，这里应该调用API更新状态
    // await todoApi.update(todo.id, { completed: todo.completed })
    ElMessage.success(todo.completed ? '已完成' : '已取消完成')
}

// 添加待办事项
const addTodo = () => {
    editingTodo.value = null
    todoForm.title = ''
    todoForm.priority = 'medium'
    todoForm.due_date = null
    dialogVisible.value = true
}

// 编辑待办事项
const editTodo = (todo) => {
    editingTodo.value = todo
    todoForm.title = todo.title
    todoForm.priority = todo.priority
    todoForm.due_date = todo.due_date ? new Date(todo.due_date) : null
    dialogVisible.value = true
}

// 保存待办事项
const saveTodo = async () => {
    if (!todoForm.title.trim()) {
        ElMessage.warning('请输入待办事项标题')
        return
    }

    try {
        if (editingTodo.value) {
            // 编辑模式
            const index = todoList.value.findIndex(t => t.id === editingTodo.value.id)
            if (index !== -1) {
                todoList.value[index] = {
                    ...todoList.value[index],
                    title: todoForm.title,
                    priority: todoForm.priority,
                    due_date: todoForm.due_date ? dayjs(todoForm.due_date).format('YYYY-MM-DD') : null
                }
            }
            ElMessage.success('待办事项已更新')
        } else {
            // 添加模式
            const newTodo = {
                id: Date.now(),
                title: todoForm.title,
                priority: todoForm.priority,
                completed: false,
                due_date: todoForm.due_date ? dayjs(todoForm.due_date).format('YYYY-MM-DD') : null,
                created_at: dayjs().format('YYYY-MM-DD')
            }
            todoList.value.unshift(newTodo)
            ElMessage.success('待办事项已添加')
        }

        dialogVisible.value = false
    } catch (error) {
        console.error('保存待办事项失败:', error)
        ElMessage.error('保存失败')
    }
}

// 处理下拉菜单命令
const handleCommand = (command, todo) => {
    if (command === 'edit') {
        editTodo(todo)
    } else if (command === 'delete') {
        deleteTodo(todo)
    }
}

// 删除待办事项
const deleteTodo = async (todo) => {
    try {
        await ElMessageBox.confirm('确定要删除这个待办事项吗？', '确认删除', {
            type: 'warning'
        })

        const index = todoList.value.findIndex(t => t.id === todo.id)
        if (index !== -1) {
            todoList.value.splice(index, 1)
            ElMessage.success('待办事项已删除')
        }
    } catch (error) {
        // 用户取消删除
    }
}

onMounted(() => {
    loadTodos()
})
</script>

<style scoped>
.todo-list {
    padding: 20px;
    height: 100%;
    overflow-y: auto;
}

.loading-container,
.empty-container {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.todo-container {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.todo-header {
    margin-bottom: 16px;
    display: flex;
    justify-content: flex-end;
}

.todo-items {
    flex: 1;
    overflow-y: auto;
}

.todo-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    transition: opacity 0.3s;
}

.todo-item.completed {
    opacity: 0.6;
}

.todo-item.completed .todo-title {
    text-decoration: line-through;
    color: #999;
}

.todo-item:last-child {
    border-bottom: none;
}

.todo-content {
    flex: 1;
    cursor: pointer;
    min-width: 0;
}

.todo-title {
    font-size: 14px;
    font-weight: 500;
    color: #2c3e50;
    line-height: 1.4;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.todo-meta {
    display: flex;
    align-items: center;
    gap: 8px;
}

.todo-priority {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 4px;
    color: white;
    font-weight: 500;
}

.priority-low {
    background-color: #95a5a6;
}

.priority-medium {
    background-color: #f39c12;
}

.priority-high {
    background-color: #e74c3c;
}

.todo-date {
    font-size: 11px;
    color: #666;
}

.todo-actions {
    cursor: pointer;
    color: #999;
    transition: color 0.2s;
}

.todo-actions:hover {
    color: #409eff;
}

/* 响应式 */
@media (max-width: 768px) {
    .todo-list {
        padding: 15px;
    }

    .todo-item {
        gap: 10px;
    }
}
</style>
