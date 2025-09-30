<template>
    <el-dialog v-model="dialogVisible" title="修改密码" width="400px" @close="handleClose">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="原密码" prop="oldPassword">
                <el-input v-model="form.oldPassword" type="password" placeholder="请输入原密码" show-password />
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="form.newPassword" type="password" placeholder="请输入新密码" show-password />
            </el-form-item>

            <el-form-item label="确认密码" prop="confirmPassword">
                <el-input v-model="form.confirmPassword" type="password" placeholder="请确认新密码" show-password />
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="handleClose">取消</el-button>
            <el-button type="primary" :loading="loading" @click="handleSubmit">
                确定
            </el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:visible', 'success'])

const formRef = ref()
const loading = ref(false)
const authStore = useAuthStore()

const form = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
})

const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
})

const validateConfirmPassword = (rule, value, callback) => {
    if (value !== form.newPassword) {
        callback(new Error('两次输入的密码不一致'))
    } else {
        callback()
    }
}

const rules = {
    oldPassword: [
        { required: true, message: '请输入原密码', trigger: 'blur' }
    ],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少6位', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        { validator: validateConfirmPassword, trigger: 'blur' }
    ]
}

const handleSubmit = async () => {
    if (!formRef.value) return

    try {
        await formRef.value.validate()
        loading.value = true

        const { success, message } = await authStore.changePassword({
            oldPassword: form.oldPassword,
            newPassword: form.newPassword
        })
        if (!success) {
            throw new Error(message || '修改密码失败')
        }

        ElMessage.success('密码修改成功')
        emit('success')
        handleClose()
    } catch (error) {
        console.error('修改密码失败:', error)
        ElMessage.error(error.message || '修改密码失败')
    } finally {
        loading.value = false
    }
}

const handleClose = () => {
    form.oldPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
    formRef.value?.clearValidate()
    emit('update:visible', false)
}
</script>
