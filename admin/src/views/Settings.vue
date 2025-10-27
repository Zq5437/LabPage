<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>系统设置</h3>
          <el-button type="primary" @click="handleSave" :loading="saving">
            保存设置
          </el-button>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" v-loading="loading"
        style="max-width: 800px;">
        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane label="基础信息" name="basic">
            <el-form-item label="网站标题" prop="site_title">
              <el-input v-model="form.site_title" placeholder="请输入网站标题" maxlength="50" />
            </el-form-item>
            <el-form-item label="网站描述" prop="site_description">
              <el-input type="textarea" :rows="3" v-model="form.site_description" placeholder="请输入网站描述" maxlength="200"
                show-word-limit />
            </el-form-item>
            <el-form-item label="前台网站地址" prop="front_site_url">
              <el-input v-model="form.front_site_url" placeholder="例如：https://lab.example.com 或 /" />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="联系方式" name="contact">
            <el-form-item label="联系邮箱" prop="contact_email">
              <el-input v-model="form.contact_email" placeholder="请输入联系邮箱" />
            </el-form-item>
            <el-form-item label="联系电话" prop="contact_phone">
              <el-input v-model="form.contact_phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="显示与分页" name="display">
            <el-form-item label="显示访问统计" prop="show_visitor_count">
              <el-switch v-model="form.show_visitor_count" />
            </el-form-item>
            <el-form-item label="每页新闻数量" prop="max_news_per_page">
              <el-input-number v-model="form.max_news_per_page" :min="5" :max="50" />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="静态导出" name="export">
            <el-alert title="导出静态网站" type="info" :closable="false" style="margin-bottom: 20px;">
              <template #default>
                <p>点击下方按钮可将当前网站数据导出为静态版本，用于部署到 GitHub Pages 等静态托管服务。</p>
                <p style="margin-top: 10px;">导出内容包括：</p>
                <ul style="margin-left: 20px; margin-top: 5px;">
                  <li>所有已发布的内容（新闻、成员、项目、论文等）</li>
                  <li>实验室信息和网站配置</li>
                  <li>上传的图片和文件</li>
                </ul>
                <p style="margin-top: 10px; color: #E6A23C;">
                  <strong>注意：</strong>导出后的文件位于项目根目录的 <code>docs/</code> 文件夹中
                </p>
              </template>
            </el-alert>

            <el-button type="success" size="large" :loading="exporting" :disabled="exporting"
              @click="handleExportStatic">
              <el-icon v-if="!exporting">
                <Download />
              </el-icon>
              {{ exporting ? '正在导出...' : '导出静态网站' }}
            </el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>

</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { publicApi } from '@/utils/api'

const loading = ref(false)
const saving = ref(false)
const exporting = ref(false)
const activeTab = ref('basic')
const formRef = ref()

const form = reactive({
  site_title: '',
  site_description: '',
  contact_email: '',
  contact_phone: '',
  show_visitor_count: true,
  max_news_per_page: 10,
  front_site_url: ''
})

const rules = {
  site_title: [{ required: true, message: '请输入网站标题', trigger: 'blur' }],
  contact_email: [{ type: 'email', message: '请输入正确邮箱', trigger: 'blur' }],
  max_news_per_page: [{ type: 'number', required: true, message: '请输入每页数量', trigger: 'change' }],
  front_site_url: [
    {
      validator: (rule, value, callback) => {
        if (!value) return callback()
        // 允许相对根路径或 http(s) URL
        const isAbsolute = /^(https?:)\/\//i.test(value)
        const isRootRelative = value === '/' || value.startsWith('/')
        if (!isAbsolute && !isRootRelative) {
          callback(new Error('请输入以 http(s):// 开头的地址，或以 / 开头的根路径'))
        } else {
          callback()
        }
      }, trigger: 'blur'
    }
  ]
}

const loadConfig = async () => {
  try {
    loading.value = true
    const resp = await publicApi.getSiteConfig()
    const data = resp?.data || {}
    Object.assign(form, {
      site_title: data.site_title ?? form.site_title,
      site_description: data.site_description ?? form.site_description,
      contact_email: data.contact_email ?? form.contact_email,
      contact_phone: data.contact_phone ?? form.contact_phone,
      show_visitor_count: data.show_visitor_count ?? form.show_visitor_count,
      max_news_per_page: typeof data.max_news_per_page === 'number' ? data.max_news_per_page : form.max_news_per_page,
      front_site_url: data.front_site_url ?? form.front_site_url
    })
  } catch (e) {
    ElMessage.error('加载配置失败')
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  try {
    await formRef.value.validate()
    saving.value = true
    const configs = [
      { config_key: 'site_title', config_value: form.site_title, description: '网站标题', type: 'text' },
      { config_key: 'site_description', config_value: form.site_description, description: '网站描述', type: 'text' },
      { config_key: 'contact_email', config_value: form.contact_email, description: '联系邮箱', type: 'text' },
      { config_key: 'contact_phone', config_value: form.contact_phone, description: '联系电话', type: 'text' },
      { config_key: 'show_visitor_count', config_value: String(!!form.show_visitor_count), description: '是否显示访问统计', type: 'boolean' },
      { config_key: 'max_news_per_page', config_value: String(Number(form.max_news_per_page)), description: '每页新闻数量', type: 'number' },
      { config_key: 'front_site_url', config_value: form.front_site_url || '', description: '前台网站地址', type: 'text' }
    ]
    await publicApi.updateSiteConfig({ configs })
    ElMessage.success('保存成功')
    loadConfig()
  } catch (e) {
    // 已由拦截器提示或本地校验提示
  } finally {
    saving.value = false
  }
}

const handleExportStatic = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要导出静态网站吗？这将把当前所有已发布的内容导出为静态文件。',
      '确认导出',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    exporting.value = true
    ElMessage.info('开始导出，请稍候...')

    const result = await publicApi.exportStatic()

    ElMessage.success({
      message: '静态网站导出成功！文件已保存到 docs/ 目录',
      duration: 5000,
      showClose: true
    })

    console.log('导出结果:', result)
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('导出失败: ' + (e.message || '未知错误'))
    }
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  loadConfig()
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
</style>
