<template>
  <div class="publication-form-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" type="text">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          返回列表
        </el-button>
        <h2>{{ isEdit ? '编辑论文' : '添加论文' }}</h2>
      </div>
      <div class="header-right">
        <el-button @click="handleSave" type="primary" :loading="saving">
          <el-icon>
            <Check />
          </el-icon>
          保存
        </el-button>
      </div>
    </div>

    <!-- 表单内容 -->
    <el-card class="form-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" label-position="left">
        <!-- 基本信息 -->
        <div class="form-section">
          <h3>基本信息</h3>

          <el-form-item label="论文标题" prop="title" required>
            <el-input v-model="form.title" placeholder="请输入论文标题" maxlength="500" show-word-limit type="textarea"
              :rows="3" />
          </el-form-item>

          <el-form-item label="作者" prop="authors" required>
            <el-input v-model="form.authors" placeholder="请输入作者，多个作者用逗号分隔" maxlength="1000" show-word-limit />
          </el-form-item>

          <el-form-item label="参与成员">
            <el-select v-model="form.member_ids" multiple filterable placeholder="请选择实验室参与成员" style="width: 100%"
              :loading="membersLoading">
              <el-option v-for="member in allMembers" :key="member.id"
                :label="`${member.name}${member.name_en ? ' (' + member.name_en + ')' : ''} - ${getCategoryLabel(member.category)}`"
                :value="Number(member.id)" />
            </el-select>
            <div class="form-tip">
              <span v-if="!matchResult.message">选择实验室中参与此论文的成员，将在成员个人主页中显示此论文</span>
              <span v-else
                :style="{ color: matchResult.type === 'success' ? '#67c23a' : matchResult.type === 'warning' ? '#e6a23c' : '#909399' }">
                <el-icon>
                  <InfoFilled />
                </el-icon>
                {{ matchResult.message }}
              </span>
            </div>
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="期刊/会议" prop="journal">
                <el-input v-model="form.journal" placeholder="请输入期刊或会议名称" maxlength="200" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="论文类型" prop="type" required>
                <el-select v-model="form.type" placeholder="请选择论文类型" style="width: 100%">
                  <el-option label="期刊论文" value="journal" />
                  <el-option label="会议论文" value="conference" />
                  <el-option label="专著章节" value="book_chapter" />
                  <el-option label="专利" value="patent" />
                  <el-option label="学位论文" value="thesis" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="发表年份" prop="year" required>
                <el-date-picker v-model="form.year" type="year" placeholder="选择年份" style="width: 100%"
                  value-format="YYYY" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="卷号" prop="volume">
                <el-input v-model="form.volume" placeholder="请输入卷号" maxlength="50" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="期号" prop="issue">
                <el-input v-model="form.issue" placeholder="请输入期号" maxlength="50" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="页码" prop="pages">
                <el-input v-model="form.pages" placeholder="例如：1-10 或 123-145" maxlength="50" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="DOI" prop="doi">
                <el-input v-model="form.doi" placeholder="数字对象标识符" maxlength="100" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="论文链接" prop="url">
            <el-input v-model="form.url" placeholder="论文在线链接地址" maxlength="500" />
          </el-form-item>
        </div>

        <!-- 详细信息 -->
        <div class="form-section">
          <h3>详细信息</h3>

          <el-form-item label="摘要" prop="abstract">
            <el-input v-model="form.abstract" type="textarea" :rows="6" placeholder="请输入论文摘要" maxlength="2000"
              show-word-limit />
          </el-form-item>

          <el-form-item label="关键词" prop="keywords">
            <el-input v-model="form.keywords" placeholder="请输入关键词，多个关键词用逗号分隔" maxlength="500" show-word-limit />
            <div class="form-tip">
              多个关键词请用英文逗号分隔，例如：机器学习,深度学习,神经网络
            </div>
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="影响因子" prop="impact_factor">
                <el-input-number v-model="form.impact_factor" :precision="3" :step="0.001" :min="0" :max="100"
                  placeholder="影响因子" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="引用次数" prop="citations">
                <el-input-number v-model="form.citations" :min="0" :max="10000" placeholder="引用次数"
                  style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="重点论文">
            <el-switch v-model="form.is_featured" active-text="是" inactive-text="否" />
            <div class="form-tip">
              重点论文将在前端页面中突出显示
            </div>
          </el-form-item>
        </div>

        <!-- 文件上传 -->
        <div class="form-section">
          <h3>文件上传</h3>

          <el-form-item label="封面图片" prop="cover_image">
            <div class="upload-section">
              <el-upload ref="coverUploadRef" :auto-upload="false" :show-file-list="true" :limit="1"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" :on-change="handleCoverImageChange"
                :on-remove="handleCoverImageRemove" :before-upload="beforeCoverImageUpload" list-type="picture-card">
                <el-icon>
                  <Plus />
                </el-icon>
                <template #tip>
                  <div class="upload-tip">
                    建议上传论文框架图、Demo图或效果图，支持 JPG、PNG、GIF、WebP 格式，不超过10MB
                  </div>
                </template>
              </el-upload>

              <!-- 当前封面图片显示 -->
              <div v-if="currentCoverImage && !uploadCoverImage" class="current-cover-preview">
                <img :src="`/uploads/publications/${currentCoverImage}`" alt="当前封面" />
                <div class="preview-actions">
                  <el-button type="text" @click="viewCurrentCover">查看大图</el-button>
                  <el-button type="text" @click="removeCurrentCover">删除</el-button>
                </div>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="PDF文件" prop="pdf_file">
            <div class="upload-section">
              <el-upload ref="uploadRef" :auto-upload="false" :show-file-list="true" :limit="1" accept=".pdf,.doc,.docx"
                :on-change="handleFileChange" :on-remove="handleFileRemove" :before-upload="beforeUpload">
                <el-button type="primary">
                  <el-icon>
                    <Upload />
                  </el-icon>
                  选择文件
                </el-button>
                <template #tip>
                  <div class="upload-tip">
                    只能上传PDF、DOC、DOCX格式文件，且不超过10MB
                  </div>
                </template>
              </el-upload>

              <!-- 当前文件显示 -->
              <div v-if="currentPdfFile && !uploadFile" class="current-file">
                <div class="file-info">
                  <el-icon>
                    <Document />
                  </el-icon>
                  <span>当前文件：{{ currentPdfFile }}</span>
                  <el-button type="text" @click="viewCurrentPDF">预览</el-button>
                  <el-button type="text" @click="removeCurrentPDF">删除</el-button>
                </div>
              </div>
            </div>
          </el-form-item>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Check, Upload, Document, InfoFilled, Plus } from '@element-plus/icons-vue'
import api from '@/utils/api'

const router = useRouter()
const route = useRoute()

// 响应式数据
const formRef = ref()
const uploadRef = ref()
const coverUploadRef = ref()
const saving = ref(false)
const isEdit = ref(false)
const publicationId = ref(null)
const uploadFile = ref(null)
const uploadCoverImage = ref(null)
const currentPdfFile = ref('')
const currentCoverImage = ref('')
const allMembers = ref([])
const membersLoading = ref(false)
const matchResult = reactive({
  message: '',
  type: '' // success, warning, info
})

// 表单数据
const form = reactive({
  title: '',
  authors: '',
  member_ids: [],
  journal: '',
  volume: '',
  issue: '',
  pages: '',
  year: '',
  doi: '',
  url: '',
  abstract: '',
  keywords: '',
  type: 'journal',
  impact_factor: null,
  citations: 0,
  is_featured: false
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入论文标题', trigger: 'blur' },
    { max: 500, message: '标题长度不能超过500个字符', trigger: 'blur' }
  ],
  authors: [
    { required: true, message: '请输入作者', trigger: 'blur' },
    { max: 1000, message: '作者长度不能超过1000个字符', trigger: 'blur' }
  ],
  year: [
    { required: true, message: '请选择发表年份', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择论文类型', trigger: 'change' }
  ],
  journal: [
    { max: 200, message: '期刊名称长度不能超过200个字符', trigger: 'blur' }
  ],
  doi: [
    { max: 100, message: 'DOI长度不能超过100个字符', trigger: 'blur' }
  ],
  url: [
    { max: 500, message: 'URL长度不能超过500个字符', trigger: 'blur' },
    { type: 'url', message: '请输入正确的URL格式', trigger: 'blur' }
  ]
}

// 返回列表
const goBack = () => {
  router.push('/publications')
}

// 加载论文数据（编辑模式）
const loadPublication = async (id) => {
  try {
    const resp = await api.get(`/publications/${id}`)

    if (resp.success && resp.code === 200) {
      const data = resp.data

      if (data) {
        Object.keys(form).forEach(key => {
          if (data[key] !== undefined) {
            // 特殊处理 member_ids
            if (key === 'member_ids') {
              // 处理 member_ids：可能是字符串或数组
              let memberIds = data[key]

              if (typeof memberIds === 'string') {
                try {
                  memberIds = JSON.parse(memberIds)
                } catch (e) {
                  memberIds = []
                }
              }
              // 确保是数组，并且元素都是数字类型（与el-option的value类型一致）
              if (Array.isArray(memberIds)) {
                form[key] = memberIds.map(id => Number(id))
              } else {
                form[key] = []
              }
            }
            // 特殊处理 year 字段：确保是字符串格式
            else if (key === 'year' && data[key]) {
              form[key] = String(data[key])
            }
            // 特殊处理数值字段：确保是数字类型（el-input-number 组件要求）
            else if (['impact_factor', 'citations'].includes(key) && data[key] !== null) {
              form[key] = Number(data[key])
            }
            else {
              form[key] = data[key]
            }
          }
        })

        // 处理PDF文件信息
        if (data.pdf_path) {
          currentPdfFile.value = data.pdf_path.split('/').pop()
        }

        // 处理封面图片信息
        if (data.cover_image) {
          currentCoverImage.value = data.cover_image.split('/').pop()
        }
      }
    }
  } catch (error) {
    console.error('加载论文数据失败:', error)
    ElMessage.error('加载论文数据失败')
    goBack()
  }
}

// PDF文件选择处理
const handleFileChange = (file) => {
  uploadFile.value = file
}

// PDF文件移除处理
const handleFileRemove = () => {
  uploadFile.value = null
}

// PDF文件上传前验证
const beforeUpload = (file) => {
  const isValidType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isValidType) {
    ElMessage.error('只能上传PDF、DOC、DOCX格式的文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('上传文件大小不能超过10MB!')
    return false
  }
  return true
}

// 封面图片选择处理
const handleCoverImageChange = (file) => {
  uploadCoverImage.value = file
}

// 封面图片移除处理
const handleCoverImageRemove = () => {
  uploadCoverImage.value = null
}

// 封面图片上传前验证
const beforeCoverImageUpload = (file) => {
  const isValidType = file.type.startsWith('image/')
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isValidType) {
    ElMessage.error('只能上传图片格式的文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('上传文件大小不能超过10MB!')
    return false
  }
  return true
}

// 查看当前PDF
const viewCurrentPDF = () => {
  if (currentPdfFile.value) {
    const url = `/uploads/publications/${currentPdfFile.value}`
    window.open(url, '_blank')
  }
}

// 删除当前PDF
const removeCurrentPDF = async () => {
  try {
    await ElMessageBox.confirm('确定要删除当前PDF文件吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    currentPdfFile.value = ''
  } catch (error) {
    // 用户取消
  }
}

// 查看当前封面图片
const viewCurrentCover = () => {
  if (currentCoverImage.value) {
    const url = `/uploads/publications/${currentCoverImage.value}`
    window.open(url, '_blank')
  }
}

// 删除当前封面图片
const removeCurrentCover = async () => {
  try {
    await ElMessageBox.confirm('确定要删除当前封面图片吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    currentCoverImage.value = ''
  } catch (error) {
    // 用户取消
  }
}

// 保存表单
const handleSave = async () => {
  try {
    // 表单验证
    await formRef.value.validate()

    saving.value = true

    // 创建FormData对象
    const formData = new FormData()

    // 添加表单字段
    Object.keys(form).forEach(key => {
      if (form[key] !== null && form[key] !== '') {
        // member_ids 需要转为 JSON 字符串
        if (key === 'member_ids') {
          formData.append(key, JSON.stringify(form[key]))
        } else {
          formData.append(key, form[key])
        }
      }
    })

    // 添加PDF文件
    if (uploadFile.value) {
      formData.append('pdf_file', uploadFile.value.raw)
    }

    // 添加封面图片
    if (uploadCoverImage.value) {
      formData.append('cover_image', uploadCoverImage.value.raw)
    }

    // 发送请求
    let resp
    if (isEdit.value) {
      resp = await api.put(`/publications/admin/update/${publicationId.value}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    } else {
      resp = await api.post('/publications/admin/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }

    if (resp.success && resp.code === 200) {
      ElMessage.success(resp.message || (isEdit.value ? '更新成功' : '创建成功'))
      goBack()
    }

  } catch (error) {
    if (error.message && error.message.includes('validation')) {
      // 表单验证错误，不显示消息
      return
    }
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 加载成员列表
const loadMembers = async () => {
  try {
    membersLoading.value = true
    const response = await api.get('/members/admin/list')

    if (response && response.data && response.data.members) {
      allMembers.value = response.data.members
    }
  } catch (error) {
    console.error('加载成员列表失败:', error)
  } finally {
    membersLoading.value = false
  }
}

// 获取成员类别标签
const getCategoryLabel = (category) => {
  const labels = {
    faculty: '教师',
    postdoc: '博士后',
    phd: '博士生',
    master: '硕士生',
    undergraduate: '本科生',
    alumni: '校友'
  }
  return labels[category] || category
}

// 智能识别作者并匹配成员
const handleAuthorsChange = () => {
  if (!form.authors || !allMembers.value.length) {
    matchResult.message = ''
    return
  }

  // 解析作者名字（按逗号、分号、顿号分隔）
  const authorNames = form.authors
    .split(/[,，;；、]/)
    .map(name => name.trim())
    .filter(name => name)

  const matchedMembers = []
  const duplicateMatches = []

  // 遍历每个作者名字
  authorNames.forEach(authorName => {
    const matches = allMembers.value.filter(member => {
      // 匹配中文名或英文名（不区分大小写）
      const nameMatch = member.name && member.name.includes(authorName)
      const enNameMatch = member.name_en && member.name_en.toLowerCase().includes(authorName.toLowerCase())

      // 匹配别名（支持多个别名，分号分隔）
      let aliasMatch = false
      if (member.aliases) {
        const aliases = member.aliases.split(/[;；]/).map(a => a.trim()).filter(a => a)
        aliasMatch = aliases.some(alias =>
          alias.toLowerCase().includes(authorName.toLowerCase()) ||
          authorName.toLowerCase().includes(alias.toLowerCase())
        )
      }

      return nameMatch || enNameMatch || aliasMatch
    })

    if (matches.length === 1) {
      // 唯一匹配
      if (!matchedMembers.find(m => m.id === matches[0].id)) {
        matchedMembers.push(matches[0])
      }
    } else if (matches.length > 1) {
      // 重复匹配
      duplicateMatches.push({
        name: authorName,
        matches: matches
      })
    }
  })

  // 处理匹配结果
  if (duplicateMatches.length > 0) {
    // 有重复的，提示管理员
    const names = duplicateMatches.map(d => d.name).join('、')
    matchResult.message = `检测到重名作者「${names}」，请手动选择对应成员`
    matchResult.type = 'warning'
  } else if (matchedMembers.length > 0) {
    // 自动勾选唯一匹配的成员
    const newIds = matchedMembers.map(m => Number(m.id))
    // 保留已手动选择的ID，合并自动匹配的ID
    const existingIds = (form.member_ids || []).map(id => Number(id))
    form.member_ids = [...new Set([...existingIds, ...newIds])]

    matchResult.message = `已自动识别并选择 ${matchedMembers.length} 位成员`
    matchResult.type = 'success'
  } else {
    matchResult.message = '未识别到实验室成员，请手动选择'
    matchResult.type = 'info'
  }
}

// 监听作者变化，自动识别成员
watch(() => form.authors, () => {
  // 如果有作者但还没选择成员，自动触发识别
  if (form.authors && (!form.member_ids || form.member_ids.length === 0) && allMembers.value.length > 0) {
    handleAuthorsChange()
  }
}, { immediate: false })

// 监听成员列表加载完成，如果有作者但没选成员，自动识别
watch(() => allMembers.value.length, (newLength) => {
  if (newLength > 0 && form.authors && (!form.member_ids || form.member_ids.length === 0)) {
    handleAuthorsChange()
  }
})

// 初始化
onMounted(() => {
  loadMembers()
  const id = route.params.id
  if (id) {
    isEdit.value = true
    publicationId.value = id
    loadPublication(id)
  }
})
</script>

<style scoped>
.publication-form-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-left h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
}

.form-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.form-section h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.4;
}

.upload-section {
  width: 100%;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.current-file {
  margin-top: 15px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-info span {
  flex: 1;
  color: #606266;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-textarea__inner) {
  resize: vertical;
}

:deep(.el-upload-dragger) {
  width: 100%;
}

.current-cover-preview {
  margin-top: 15px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.current-cover-preview img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
  display: block;
  margin-bottom: 10px;
}

.preview-actions {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .header-left {
    width: 100%;
  }

  .header-right {
    width: 100%;
  }

  .header-right .el-button {
    width: 100%;
  }

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-col) {
    margin-bottom: 10px;
  }
}
</style>