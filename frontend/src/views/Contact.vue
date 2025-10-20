<template>
  <div class="contact-page">
    <!-- 页面头部 -->
    <div class="contact-header">
      <div class="header-background">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>
      <div class="container">
        <div class="hero-badge" data-aos="fade-down">保持联系 · 共同进步</div>
        <h1 data-aos="fade-up" data-aos-delay="100">联系我们</h1>
        <p data-aos="fade-up" data-aos-delay="200">欢迎与我们取得联系，我们期待与您的交流合作</p>
      </div>
    </div>

    <div class="container">
      <!-- 联系信息卡片 -->
      <section class="contact-info-section" v-loading="loading">
        <div class="contact-cards">
          <div class="contact-card" v-for="(item, index) in contactItems" :key="index" data-aos="fade-up"
            :data-aos-delay="index * 100">
            <div class="contact-icon" data-aos="zoom-in" :data-aos-delay="index * 100 + 200">
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="contact-content">
              <h3 data-aos="fade-up" :data-aos-delay="index * 100 + 300">{{ item.title }}</h3>
              <p data-aos="fade-up" :data-aos-delay="index * 100 + 400">{{ item.value }}</p>
            </div>
            <div class="card-glow"></div>
          </div>
        </div>
      </section>

      <!-- 实验室信息 -->
      <section class="lab-overview" v-if="labInfo.name">
        <div class="overview-content">
          <div class="overview-text" data-aos="fade-right">
            <h2 data-aos="fade-up">{{ labInfo.name }}</h2>
            <h3 v-if="labInfo.name_en" class="english-name" data-aos="fade-up" data-aos-delay="100">{{ labInfo.name_en
            }}</h3>
            <div class="description" data-aos="fade-up" data-aos-delay="200">
              {{ labInfo.description || '暂无实验室描述信息' }}
            </div>
            <div class="lab-details">
              <div class="detail-item" v-if="labInfo.director" data-aos="fade-up" data-aos-delay="300">
                <span class="detail-label">实验室主任：</span>
                <span class="detail-value">{{ labInfo.director }}</span>
              </div>
              <div class="detail-item" v-if="labInfo.established_year" data-aos="fade-up" data-aos-delay="400">
                <span class="detail-label">成立时间：</span>
                <span class="detail-value">{{ labInfo.established_year }}年</span>
              </div>
            </div>
          </div>
          <div class="overview-image" v-if="labInfo.banner || labInfo.banner_url" data-aos="fade-left"
            data-aos-delay="200">
            <img :src="labInfo.banner || labInfo.banner_url" alt="实验室" @error="handleImageError" />
            <div class="image-overlay"></div>
          </div>
        </div>
      </section>

      <!-- 联系表单 -->
      <section class="contact-form-section">
        <div class="form-header" data-aos="fade-up">
          <h2>在线留言</h2>
          <p>请填写以下信息，我们将尽快回复您</p>
        </div>
        <div class="form-container" data-aos="fade-up" data-aos-delay="200">
          <el-form ref="contactFormRef" :model="contactForm" :rules="contactFormRules" label-position="top" size="large"
            class="beautiful-form">
            <div class="form-row">
              <el-form-item label="姓名" prop="name" class="form-item-half">
                <el-input v-model="contactForm.name" placeholder="请输入您的姓名" :prefix-icon="User"
                  class="beautiful-input" />
              </el-form-item>
              <el-form-item label="邮箱" prop="email" class="form-item-half">
                <el-input v-model="contactForm.email" placeholder="请输入您的邮箱" :prefix-icon="Message"
                  class="beautiful-input" />
              </el-form-item>
            </div>

            <div class="form-row">
              <el-form-item label="电话" prop="phone" class="form-item-half">
                <el-input v-model="contactForm.phone" placeholder="请输入您的电话（可选）" :prefix-icon="Phone"
                  class="beautiful-input" />
              </el-form-item>
              <el-form-item label="主题" prop="subject" class="form-item-half">
                <el-select v-model="contactForm.subject" placeholder="请选择联系主题" style="width: 100%"
                  class="beautiful-select">
                  <el-option label="学术合作" value="academic" />
                  <el-option label="项目咨询" value="project" />
                  <el-option label="招生咨询" value="admission" />
                  <el-option label="设备使用" value="equipment" />
                  <el-option label="其他咨询" value="other" />
                </el-select>
              </el-form-item>
            </div>

            <el-form-item label="留言内容" prop="message">
              <el-input v-model="contactForm.message" type="textarea" :rows="6" placeholder="请详细描述您的问题或需求..."
                maxlength="1000" show-word-limit class="beautiful-textarea" />
            </el-form-item>

            <el-form-item class="submit-form-item">
              <el-button type="primary" size="large" @click="submitForm" :loading="submitting" class="submit-button">
                {{ submitting ? '发送中...' : '✉️ 发送留言' }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>

      <!-- 快速链接 -->
      <section class="quick-links">
        <h2 data-aos="fade-up">快速链接</h2>
        <div class="links-grid">
          <router-link v-for="(link, index) in quickLinks" :key="index" :to="link.path" class="link-card"
            data-aos="fade-up" :data-aos-delay="index * 100">
            <div class="link-icon" data-aos="zoom-in" :data-aos-delay="index * 100 + 200">
              <el-icon>
                <component :is="link.icon" />
              </el-icon>
            </div>
            <h3 data-aos="fade-up" :data-aos-delay="index * 100 + 300">{{ link.title }}</h3>
            <p data-aos="fade-up" :data-aos-delay="index * 100 + 400">{{ link.description }}</p>
            <div class="link-arrow">
              <el-icon>
                <ArrowRight />
              </el-icon>
            </div>
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { contactApi } from '@/utils/api'
import {
  Location, Phone, Message, Link, User, Position, Avatar,
  DataAnalysis, Bell, ArrowRight, Promotion
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const labInfo = ref({})
const contactFormRef = ref()

// 联系表单
const contactForm = reactive({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

// 表单验证规则
const contactFormRules = {
  name: [
    { required: true, message: '请输入您的姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  subject: [
    { required: true, message: '请选择联系主题', trigger: 'change' }
  ],
  message: [
    { required: true, message: '请输入留言内容', trigger: 'blur' },
    { min: 10, message: '留言内容至少10个字符', trigger: 'blur' }
  ]
}

// 联系信息项目
const contactItems = computed(() => [
  {
    icon: Location,
    title: '实验室地址',
    value: labInfo.value.address || '地址信息加载中...'
  },
  {
    icon: Phone,
    title: '联系电话',
    value: labInfo.value.phone || '电话信息加载中...'
  },
  {
    icon: Message,
    title: '邮箱地址',
    value: labInfo.value.email || '邮箱信息加载中...'
  },
  {
    icon: Link,
    title: '官方网站',
    value: labInfo.value.website || '网站信息加载中...'
  }
])

// 快速链接
const quickLinks = [
  {
    path: '/members',
    icon: Avatar,
    title: '团队成员',
    description: '了解我们的研究团队'
  },
  {
    path: '/research',
    icon: DataAnalysis,
    title: '研究方向',
    description: '探索我们的研究领域'
  },
  {
    path: '/recruitment',
    icon: User,
    title: '招生信息',
    description: '加入我们的研究团队'
  },
  {
    path: '/news',
    icon: Bell,
    title: '新闻动态',
    description: '了解最新研究进展'
  }
]

// 加载实验室信息
const loadLabInfo = async () => {
  try {
    loading.value = true
    console.log('开始加载实验室信息...')
    const response = await contactApi.getLabInfo()
    console.log('实验室信息响应:', response)

    if (response.data) {
      labInfo.value = response.data || {}
      console.log('实验室信息加载成功:', labInfo.value)
    } else {
      console.warn('实验室信息响应中没有data字段')
      labInfo.value = {}
    }
  } catch (error) {
    console.error('加载实验室信息失败:', error)
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      response: error.response
    })
    ElMessage.error('加载实验室信息失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 提交联系表单
const submitForm = async () => {
  console.log('contactFormRef.value:', contactFormRef.value)
  console.log('contactFormRef类型:', typeof contactFormRef.value)

  if (!contactFormRef.value) {
    console.error('表单引用不存在')
    ElMessage.error('表单初始化失败，请刷新页面重试')
    return
  }

  try {
    console.log('开始验证表单...')
    console.log('validate方法存在吗:', typeof contactFormRef.value?.validate)

    // 使用Element Plus表单验证
    if (contactFormRef.value && typeof contactFormRef.value.validate === 'function') {
      const valid = await contactFormRef.value.validate()
      if (!valid) {
        console.log('表单验证失败')
        return
      }
    } else {
      // 回退到手动验证
      console.log('Element Plus表单验证不可用，使用手动验证')
      if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
        ElMessage.error('请填写所有必填字段')
        return
      }

      if (contactForm.message.length < 10) {
        ElMessage.error('留言内容至少需要10个字符')
        return
      }
    }

    console.log('表单验证通过，准备提交数据:', contactForm)
    submitting.value = true

    // 提交联系表单到后端
    const response = await contactApi.submit(contactForm)
    console.log('提交成功，服务器响应:', response)

    ElMessage.success('留言发送成功！我们会尽快回复您。')

    // 重置表单
    if (contactFormRef.value && typeof contactFormRef.value.resetFields === 'function') {
      contactFormRef.value.resetFields()
    }

    // 手动重置表单数据
    Object.keys(contactForm).forEach(key => {
      contactForm[key] = ''
    })

  } catch (error) {
    console.error('发送留言失败:', error)
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      response: error.response
    })

    let errorMessage = '发送留言失败，请稍后重试'
    if (error.message) {
      errorMessage = error.message
    }

    ElMessage.error(errorMessage)
  } finally {
    submitting.value = false
  }
}

// 图片加载错误处理
const handleImageError = (e) => {
  e.target.style.display = 'none'
}

// 初始化
onMounted(() => {
  loadLabInfo()
})
</script>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafb 0%, #ffffff 100%);
  position: relative;
  overflow-x: hidden;
}

/* 页面头部 */
.contact-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 120px 0 100px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  opacity: 0.15;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  animation: float 20s infinite ease-in-out;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: #fff;
  top: -200px;
  left: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: #4facfe;
  top: 50%;
  right: -150px;
  animation-delay: 7s;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: #f093fb;
  bottom: -150px;
  left: 50%;
  animation-delay: 14s;
}

@keyframes float {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(30px, -50px) scale(1.1);
  }

  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.hero-badge {
  display: inline-block;
  padding: 8px 24px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 2px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.contact-header .container {
  position: relative;
  z-index: 1;
}

.contact-header h1 {
  font-size: 3.5rem;
  margin: 0 0 16px 0;
  font-weight: 800;
  letter-spacing: -1px;
}

.contact-header p {
  font-size: 1.5rem;
  margin: 0;
  opacity: 0.95;
  font-weight: 300;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

section {
  margin: 80px 0;
}

section h2 {
  font-size: 2.5rem;
  color: #2c3e50;
  text-align: center;
  margin: 0 0 60px 0;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 联系信息卡片 */
.contact-info-section {
  margin-top: -80px;
  position: relative;
  z-index: 10;
}

.contact-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

@media (max-width: 1200px) {
  .contact-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .contact-cards {
    grid-template-columns: 1fr;
  }
}

.contact-card {
  background: #fff;
  padding: 40px 30px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
}

.contact-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}

.contact-card:hover::before {
  transform: scaleX(1);
}

.contact-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
  border-color: #e2e8f0;
}

.card-glow {
  display: none;
}

.contact-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 2rem;
  transition: all 0.3s ease;
  position: relative;
}

.contact-card:hover .contact-icon {
  transform: scale(1.1) rotate(5deg);
}

.contact-content h3 {
  color: #1a202c;
  margin: 0 0 12px 0;
  font-size: 1.2rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.contact-card:hover .contact-content h3 {
  color: #667eea;
}

.contact-content p {
  color: #718096;
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
}

/* 实验室概览 */
.lab-overview {
  background: #fff;
  border-radius: 24px;
  padding: 60px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.overview-content {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 40px;
  align-items: center;
}

.overview-text h2 {
  font-size: 2.5rem;
  margin: 0 0 12px 0;
  text-align: left;
  font-weight: 700;
  color: #1a202c;
}

.english-name {
  color: #718096;
  font-size: 1.1rem;
  font-weight: 400;
  margin: 0 0 24px 0;
  font-style: italic;
}

.description {
  color: #4a5568;
  line-height: 1.9;
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.lab-details {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8fafb 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.detail-label {
  font-weight: 600;
  color: #1a202c;
  margin-right: 12px;
}

.detail-value {
  color: #718096;
}

.overview-image {
  width: 100%;
  height: 350px;
  border-radius: 20px;
  overflow: hidden;
  background: #f5f5f5;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.overview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.overview-image:hover img {
  transform: scale(1.08);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  pointer-events: none;
}

/* 联系表单 */
.contact-form-section {
  background: #fff;
  border-radius: 24px;
  padding: 60px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.form-header {
  text-align: center;
  margin-bottom: 50px;
  position: relative;
}

.form-header h2 {
  color: #1a202c;
  font-size: 2.5rem;
  margin: 0 0 16px 0;
  font-weight: 700;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-item-half {
  width: 100%;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #1a202c;
  font-size: 1rem;
  margin-bottom: 8px;
}

:deep(.el-input__wrapper) {
  border-radius: 12px;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  border-color: #c0c4cc;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #667eea !important;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
}

:deep(.el-textarea__inner) {
  border-radius: 12px;
  transition: all 0.3s ease;
}

:deep(.el-textarea__inner:focus) {
  border-color: #667eea !important;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
  border: none !important;
}

.submit-form-item {
  text-align: center;
  margin-top: 40px;
}

.submit-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50px;
  padding: 14px 48px;
  font-size: 1.1rem;
  font-weight: 600;
  min-width: 200px;
  transition: all 0.3s ease;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

/* 快速链接 */
.quick-links h2 {
  text-align: center;
  font-size: 2.5rem;
  color: #1a202c;
  margin: 0 0 50px 0;
  font-weight: 700;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

@media (max-width: 1200px) {
  .links-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .links-grid {
    grid-template-columns: 1fr;
  }
}

.link-card {
  background: #fff;
  padding: 35px 25px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  text-align: center;
  text-decoration: none;
  color: inherit;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
}

.link-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}

.link-card:hover::before {
  transform: scaleX(1);
}

.link-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
  border-color: #e2e8f0;
  text-decoration: none;
}

.link-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 1.8rem;
  transition: all 0.3s ease;
}

.link-card:hover .link-icon {
  transform: scale(1.1) rotate(5deg);
}

.link-card h3 {
  color: #1a202c;
  margin: 0 0 12px 0;
  font-size: 1.2rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.link-card:hover h3 {
  color: #667eea;
}

.link-card p {
  color: #718096;
  margin: 0 0 16px 0;
  font-size: 0.95rem;
  line-height: 1.6;
}

.link-arrow {
  color: #667eea;
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.link-card:hover .link-arrow {
  transform: translateX(5px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-badge {
    font-size: 0.75rem;
    padding: 6px 18px;
  }

  .contact-header h1 {
    font-size: 2rem;
  }

  .contact-header p {
    font-size: 1.2rem;
  }

  .contact-info-section {
    margin-top: -40px;
  }

  .lab-overview,
  .contact-form-section {
    padding: 40px 30px;
  }

  .overview-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .overview-text h2 {
    font-size: 2rem;
    text-align: center;
  }

  .overview-image {
    height: 250px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-header h2,
  .quick-links h2 {
    font-size: 2rem;
  }
}
</style>