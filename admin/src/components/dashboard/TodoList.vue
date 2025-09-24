<template>
    <div class="todo-list">
        <div class="todo-placeholder">
            <el-icon size="32" color="#F56C6C">
                <Bell />
            </el-icon>
            <p>待办事项列表开发中...</p>
        </div>
    </div>
</template>

<script setup>
import { Bell } from '@element-plus/icons-vue'
</script>

<style scoped>
.todo-list {
    padding: 20px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.todo-placeholder {
    text-align: center;
    color: #999;
}

.todo-placeholder p {
    margin: 10px 0 0 0;
    font-size: 14px;
}
</style>
