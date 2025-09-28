<template>
  <div class="publication-form">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>{{ isEdit ? '编辑论文' : '添加论文' }}</h3>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 800px"
      >
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="论文标题" prop="title">
              <el-input
                v-model="form.title"
                placeholder="请输入论文标题"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="作者" prop="authors">
              <el-input
                v-model="form.authors"
                placeholder="作者姓名，多个作者用逗号分隔"
                maxlength="500"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="期刊名称" prop="journal">
              <el-input
                v-model="form.journal"
                placeholder="请输入期刊名称"
                maxlength="200"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="发布日期" prop="publish_date">
              <el-date-picker
                v-model="form.publish_date"
                type="date"
                placeholder="选择发布日期"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select
                v-model="form.category"
                placeholder="选择或输入分类"
                filterable
                allow-create
                style="width: 100%"
              >
                <el-option
                  v-for="category in categories"
                  :key="category.category"
                  :label="category.category"
                  :value="category.category"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="DOI">
              <el-input
                v-model="form.doi"
                placeholder="请输入DOI"
                maxlength="100"
              />
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="引用数">
              <el-input-number
                v-model="form.citation_count"
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="影响因子">
              <el-input-number
                v-model="form.impact_factor"
                :min="0"
                :precision="3"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="摘要">
              <el-input
                v-model="form.abstract"
                type="textarea"
                :rows="4"
                placeholder="请输入论文摘要"
                maxlength="1000"
                show-word-limit
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="关键词">
              <el-input
                v-model="form.keywords"
                placeholder="关键词，多个关键词用逗号分隔"
                maxlength="200"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="PDF文件">
              <el-upload
                ref="uploadRef"
                :auto-upload="false"
                :limit="1"
                accept=".pdf,.doc,.docx"
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
                :file-list="fileList"
              >
                <el-button type="primary">
                  <el-icon><Upload /></el-icon>
                  选择文件
                </el-button>
                <template #tip>
                  <div class="el-upload__tip">
                    只能上传PDF、DOC、DOCX文件，且不超过10MB
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="published">已发布</el-radio>
                <el-radio label="draft">草稿</el-radio>
                <el-radio label="archived">已归档</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { publicationsApi } from '@/utils/api'
import { Upload } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 表单引用
const formRef = ref()
const uploadRef = ref()

// 是否为编辑模式
const isEdit = computed(() => !!route.params.id)

// 响应式数据
const submitting = ref(false)
const categories = ref([])
const fileList = ref([])

// 表单数据
const form = reactive({
  title: '',
  authors: '',
  journal: '',
  publish_date: '',
  category: '',
  doi: '',
  abstract: '',
  keywords: '',
  citation_count: 0,
  impact_factor: 0,
  status: 'published',
  pdf: null
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入论文标题', trigger: 'blur' }
  ],
  authors: [
    { required: true, message: '请输入作者', trigger: 'blur' }
  ],
  journal: [
    { required: true, message: '请输入期刊名称', trigger: 'blur' }
  ],
  publish_date: [
    { required: true, message: '请选择发布日期', trigger: 'change' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ]
}

// 文件上传处理
const handleFileChange = (file) => {
  form.pdf = file.raw
}

const handleFileRemove = () => {
  form.pdf = null
}

// 加载分类列表
const loadCategories = async () => {
  try {
    const data = await publicationsApi.getCategories()
    categories.value = data || []
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 加载论文详情（编辑模式）
const loadPublicationDetail = async () => {
  if (!isEdit.value) return

  try {
    const data = await publicationsApi.getDetail(route.params.id)
    Object.keys(form).forEach(key => {
      if (key in data) {
        form[key] = data[key]
      }
    })

    // 处理现有PDF文件
    if (data.pdf_url) {
      fileList.value = [{
        name: '当前PDF文件',
        url: data.pdf_url
      }]
    }
  } catch (error) {
    console.error('加载论文详情失败:', error)
    ElMessage.error('加载论文详情失败')
    router.back()
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true

    const submitData = { ...form }
    
    if (isEdit.value) {
      await publicationsApi.update(route.params.id, submitData)
      ElMessage.success('论文更新成功')
    } else {
      await publicationsApi.create(submitData)
      ElMessage.success('论文创建成功')
    }

    router.push('/publications')
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}

// 重置表单
const handleReset = () => {
  formRef.value.resetFields()
  fileList.value = []
  form.pdf = null
}

// 初始化
onMounted(() => {
  loadCategories()
  if (isEdit.value) {
    loadPublicationDetail()
  }
})
</script>

<style scoped>
.publication-form {
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

:deep(.el-upload-list) {
  margin-top: 10px;
}

:deep(.el-upload__tip) {
  margin-top: 5px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
