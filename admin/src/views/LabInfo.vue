<template>
  <div class="lab-info-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>实验室信息管理</h3>
          <el-button type="primary" @click="handleSave" :loading="saving">
            <el-icon>
              <Check />
            </el-icon>
            保存修改
          </el-button>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" style="max-width: 900px"
        v-loading="loading">
        <el-tabs v-model="activeTab" type="border-card">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="实验室名称" prop="name">
                  <el-input v-model="form.name" placeholder="请输入实验室中文名称" maxlength="100" />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="英文名称">
                  <el-input v-model="form.name_en" placeholder="请输入实验室英文名称" maxlength="200" />
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="实验室简介" prop="description">
                  <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入实验室简介" maxlength="500"
                    show-word-limit />
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="详细介绍">
                  <el-input v-model="form.introduction" type="textarea" :rows="6" placeholder="请输入实验室详细介绍"
                    maxlength="2000" show-word-limit />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="实验室主任">
                  <el-input v-model="form.director" placeholder="请输入实验室主任姓名" maxlength="50" />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="成立年份">
                  <el-input-number v-model="form.founded_year" :min="1900" :max="new Date().getFullYear()"
                    style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <!-- 联系信息 -->
          <el-tab-pane label="联系信息" name="contact">
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="地址">
                  <el-input v-model="form.address" placeholder="请输入实验室地址" maxlength="200" />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="联系电话">
                  <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="20" />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="邮箱地址">
                  <el-input v-model="form.email" placeholder="请输入邮箱地址" maxlength="100" />
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="官方网站">
                  <el-input v-model="form.website" placeholder="请输入官方网站地址" maxlength="200" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <!-- 图片设置 -->
          <el-tab-pane label="图片设置" name="images">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="实验室Logo">
                  <el-upload ref="logoUploadRef" :auto-upload="false" :limit="1" accept="image/*"
                    :on-change="handleLogoChange" :on-remove="handleLogoRemove" :file-list="logoList"
                    list-type="picture-card">
                    <el-icon>
                      <Plus />
                    </el-icon>
                    <template #tip>
                      <div class="el-upload__tip">
                        建议尺寸：200x200px，仅支持图片格式
                      </div>
                    </template>
                  </el-upload>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="首页横幅">
                  <el-upload ref="bannerUploadRef" :auto-upload="false" :limit="1" accept="image/*"
                    :on-change="handleBannerChange" :on-remove="handleBannerRemove" :file-list="bannerList"
                    list-type="picture-card">
                    <el-icon>
                      <Plus />
                    </el-icon>
                    <template #tip>
                      <div class="el-upload__tip">
                        建议尺寸：1920x600px，仅支持图片格式
                      </div>
                    </template>
                  </el-upload>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { labInfoApi } from '@/utils/api'
import {
  Check, Plus
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const activeTab = ref('basic')
const formRef = ref()
const logoUploadRef = ref()
const bannerUploadRef = ref()
const logoList = ref([])
const bannerList = ref([])

// 表单数据
const form = reactive({
  name: '',
  name_en: '',
  description: '',
  introduction: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  founded_year: new Date().getFullYear(),
  director: '',
  logo: null,
  banner: null
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入实验室名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入实验室简介', trigger: 'blur' }
  ]
}

// 加载实验室信息
const loadLabInfo = async () => {
  try {
    loading.value = true
    const resp = await labInfoApi.getInfo()
    const data = resp?.data || resp || {}

    if (data) {
      // 映射基础字段（跳过文件字段，避免将字符串路径写入文件对象）
      Object.keys(form).forEach(key => {
        if (key === 'logo' || key === 'banner') return
        if (key in data) {
          form[key] = data[key]
        }
      })

      // 年份字段兼容 established_year / founded_year（总是以后端为准）
      if (data.established_year !== undefined && data.established_year !== null) {
        form.founded_year = Number(data.established_year) || null
      } else if (data.founded_year !== undefined && data.founded_year !== null) {
        form.founded_year = Number(data.founded_year) || null
      }

      // 处理现有图片
      if (data.logo_url || data.logo) {
        logoList.value = [{
          name: '当前Logo',
          url: data.logo_url || data.logo
        }]
      } else {
        logoList.value = []
      }

      if (data.banner_url || data.banner) {
        bannerList.value = [{
          name: '当前横幅',
          url: data.banner_url || data.banner
        }]
      } else {
        bannerList.value = []
      }
    }
  } catch (error) {
    console.error('加载实验室信息失败:', error)
    ElMessage.error('加载实验室信息失败')
  } finally {
    loading.value = false
  }
}

// Logo上传处理
const handleLogoChange = (file) => {
  form.logo = file.raw
}

const handleLogoRemove = () => {
  form.logo = null
}

// 横幅上传处理
const handleBannerChange = (file) => {
  form.banner = file.raw
}

const handleBannerRemove = () => {
  form.banner = null
}

// 保存信息
const handleSave = async () => {
  try {
    await formRef.value.validate()
    saving.value = true

    await labInfoApi.update(form)
    ElMessage.success('实验室信息保存成功')

    // 重新加载数据
    loadLabInfo()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

// 初始化
onMounted(() => {
  loadLabInfo()
})
</script>

<style scoped>
.lab-info-management {
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

:deep(.el-tabs__content) {
  padding: 20px 0;
}

:deep(.el-upload-list) {
  margin-top: 10px;
}

:deep(.el-upload__tip) {
  margin-top: 5px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .card-header .el-button {
    width: 100%;
  }
}
</style>
