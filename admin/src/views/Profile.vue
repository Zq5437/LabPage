<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>个人资料</h3>
          <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" v-loading="loading"
        style="max-width: 600px;">
        <el-form-item label="头像">
          <div class="avatar-box">
            <el-avatar :size="80" :src="avatarPreview">
              <el-icon>
                <Avatar />
              </el-icon>
            </el-avatar>
            <el-upload :auto-upload="false" :limit="1" accept="image/*" :on-change="onAvatarChange"
              :on-remove="onAvatarRemove" :file-list="avatarList" class="avatar-uploader" list-type="picture-card">
              <el-icon>
                <Plus />
              </el-icon>
            </el-upload>
          </div>
        </el-form-item>

        <el-form-item label="用户名">
          <el-input v-model="form.username" disabled />
        </el-form-item>

        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import api, { adminApi } from '@/utils/api'
import { Avatar, Plus } from '@element-plus/icons-vue'

const authStore = useAuthStore()
const loading = ref(false)
const saving = ref(false)
const formRef = ref()
const avatarList = ref([])
const avatarFile = ref(null)
const avatarPreview = ref('')

const form = reactive({
  username: '',
  name: '',
  email: ''
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确邮箱', trigger: 'blur' }]
}

const loadProfile = async () => {
  try {
    loading.value = true
    // 优先使用已缓存用户
    if (!authStore.user) {
      await authStore.checkAuth()
    }
    const u = authStore.user || {}
    form.username = u.username || ''
    form.name = u.name || ''
    form.email = u.email || ''
    // 头像预览（如果数据库有 avatar 字段且存储）
    if (u.avatar) {
      avatarPreview.value = u.avatar
      avatarList.value = [{ name: '当前头像', url: u.avatar }]
    } else {
      avatarPreview.value = ''
      avatarList.value = []
    }
  } catch (e) {
    // 忽略
  } finally {
    loading.value = false
  }
}

const onAvatarChange = (file) => {
  avatarFile.value = file.raw
  avatarList.value = [file]
  const reader = new FileReader()
  reader.onload = (e) => { avatarPreview.value = e.target.result }
  reader.readAsDataURL(file.raw)
}

const onAvatarRemove = () => {
  avatarFile.value = null
  avatarList.value = []
}

const uploadAvatarIfNeeded = async () => {
  if (!avatarFile.value) return
  const fd = new FormData()
  fd.append('avatar', avatarFile.value)
  // 使用 auth 路由上传头像
  await api.post('/auth/profile/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
}

const handleSave = async () => {
  try {
    await formRef.value.validate()
    saving.value = true
    // 先更新资料
    await api.put('/auth/profile', { name: form.name, email: form.email })
    // 再上传头像（如果选择了新头像）
    await uploadAvatarIfNeeded()
    // 刷新 authStore 中的用户
    const me = await adminApi.getCurrentUser()
    authStore.updateUser(me?.data || {})
    ElMessage.success('保存成功')
  } catch (e) {
    // 错误提示由拦截器处理
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
}

.avatar-box {
  display: flex;
  align-items: center;
  gap: 16px;
}

avatar-uploader {
  margin-left: 12px;
}
</style>
