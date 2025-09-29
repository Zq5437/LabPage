<template>
    <div class="contact-page">
      <!-- 页面头部 -->
      <div class="contact-header">
        <div class="header-background">
          <div class="floating-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>
          </div>
        </div>
        <div class="container">
          <h1>联系我们</h1>
          <p>欢迎与我们取得联系，我们期待与您的交流合作</p>
        </div>
      </div>
  
      <div class="container">
        <!-- 联系信息卡片 -->
        <section class="contact-info-section" v-loading="loading">
          <div class="contact-cards">
            <div class="contact-card" v-for="(item, index) in contactItems" :key="index">
              <div class="contact-icon">
                <el-icon>
                  <component :is="item.icon" />
                </el-icon>
              </div>
              <div class="contact-content">
                <h3>{{ item.title }}</h3>
                <p>{{ item.value }}</p>
              </div>
              <div class="card-glow"></div>
            </div>
          </div>
        </section>
  
        <!-- 实验室信息 -->
        <section class="lab-overview" v-if="labInfo.name">
          <div class="overview-content">
            <div class="overview-text">
              <h2>{{ labInfo.name }}</h2>
              <h3 v-if="labInfo.name_en" class="english-name">{{ labInfo.name_en }}</h3>
              <div class="description">
                {{ labInfo.description || '暂无实验室描述信息' }}
              </div>
              <div class="lab-details">
                <div class="detail-item" v-if="labInfo.director">
                  <span class="detail-label">实验室主任：</span>
                  <span class="detail-value">{{ labInfo.director }}</span>
                </div>
                <div class="detail-item" v-if="labInfo.established_year">
                  <span class="detail-label">成立时间：</span>
                  <span class="detail-value">{{ labInfo.established_year }}年</span>
                </div>
              </div>
            </div>
            <div class="overview-image" v-if="labInfo.banner">
              <img :src="labInfo.banner" alt="实验室" @error="handleImageError" />
              <div class="image-overlay"></div>
            </div>
          </div>
        </section>
  
        <!-- 联系表单 -->
        <section class="contact-form-section">
          <div class="form-header">
            <h2>在线留言</h2>
            <p>请填写以下信息，我们将尽快回复您</p>
          </div>
          <div class="form-container">
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
          <h2>快速链接</h2>
          <div class="links-grid">
            <router-link v-for="(link, index) in quickLinks" :key="index" :to="link.path" class="link-card">
              <div class="link-icon">
                <el-icon>
                  <component :is="link.icon" />
                </el-icon>
              </div>
              <h3>{{ link.title }}</h3>
              <p>{{ link.description }}</p>
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
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    position: relative;
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
  }
  
  .floating-shapes {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  
  .shape {
    position: absolute;
    opacity: 0.1;
    animation: float 6s ease-in-out infinite;
  }
  
  .shape-1 {
    top: 20%;
    left: 10%;
    width: 80px;
    height: 80px;
    background: white;
    border-radius: 50%;
    animation-delay: 0s;
  }
  
  .shape-2 {
    top: 50%;
    right: 15%;
    width: 60px;
    height: 60px;
    background: white;
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    animation-delay: 2s;
  }
  
  .shape-3 {
    bottom: 30%;
    left: 20%;
    width: 100px;
    height: 100px;
    background: white;
    border-radius: 20px;
    transform: rotate(45deg);
    animation-delay: 4s;
  }
  
  @keyframes float {
  
    0%,
    100% {
      transform: translateY(0px) rotate(0deg);
    }
  
    50% {
      transform: translateY(-20px) rotate(180deg);
    }
  }
  
  .contact-header h1 {
    font-size: 4rem;
    margin: 0 0 25px 0;
    font-weight: 900;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
    animation: slideInDown 1s ease-out;
    position: relative;
    z-index: 2;
  }
  
  .contact-header p {
    font-size: 1.5rem;
    margin: 0;
    opacity: 0.95;
    animation: slideInUp 1s ease-out 0.3s both;
    position: relative;
    z-index: 2;
  }
  
  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-50px);
    }
  
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
  
    to {
      opacity: 0.95;
      transform: translateY(0);
    }
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  section {
    margin: 100px 0;
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
    margin-top: -60px;
    position: relative;
    z-index: 10;
  }
  
  .contact-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 40px;
    animation: fadeInUp 1s ease-out 0.6s both;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(80px);
    }
  
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .contact-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    padding: 50px 40px;
    border-radius: 25px;
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1);
    text-align: center;
    transition: all 0.4s ease;
    border: 1px solid rgba(255, 255, 255, 0.8);
    position: relative;
    overflow: hidden;
  }
  
  .contact-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.2), transparent);
    transition: left 0.6s ease;
  }
  
  .contact-card:hover {
    transform: translateY(-15px) scale(1.03);
    box-shadow: 0 25px 60px rgba(102, 126, 234, 0.3);
  }
  
  .contact-card:hover::before {
    left: 100%;
  }
  
  .card-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, rgba(102, 126, 234, 0.2) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  
  .contact-card:hover .card-glow {
    opacity: 1;
  }
  
  .contact-icon {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 35px;
    font-size: 2.5rem;
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    transition: all 0.4s ease;
    position: relative;
  }
  
  .contact-icon::after {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 50%;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  
  .contact-card:hover .contact-icon {
    transform: scale(1.15) rotate(10deg);
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
  }
  
  .contact-card:hover .contact-icon::after {
    opacity: 0.4;
  }
  
  .contact-content h3 {
    color: #2c3e50;
    margin: 0 0 20px 0;
    font-size: 1.5rem;
    font-weight: 800;
    transition: color 0.3s ease;
  }
  
  .contact-card:hover .contact-content h3 {
    color: #667eea;
  }
  
  .contact-content p {
    color: #666;
    margin: 0;
    font-size: 1.1rem;
    line-height: 1.7;
    transition: color 0.3s ease;
  }
  
  .contact-card:hover .contact-content p {
    color: #555;
  }
  
  /* 实验室概览 */
  .lab-overview {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 30px;
    padding: 70px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.9);
    animation: fadeInUp 1s ease-out 0.9s both;
    position: relative;
    overflow: hidden;
  }
  
  .lab-overview::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(118, 75, 162, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(50%, -50%);
  }
  
  .overview-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 60px;
    align-items: center;
  }
  
  .overview-text h2 {
    font-size: 3.2rem;
    margin: 0 0 20px 0;
    text-align: left;
    font-weight: 900;
  }
  
  .english-name {
    color: #666;
    font-size: 1.3rem;
    font-weight: 400;
    margin: 0 0 35px 0;
    font-style: italic;
  }
  
  .description {
    color: #555;
    line-height: 1.9;
    font-size: 1.2rem;
    margin-bottom: 35px;
  }
  
  .lab-details {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  
  .detail-item {
    display: flex;
    align-items: center;
  }
  
  .detail-label {
    font-weight: 700;
    color: #2c3e50;
    margin-right: 12px;
  }
  
  .detail-value {
    color: #666;
  }
  
  .overview-image {
    width: 100%;
    height: 350px;
    border-radius: 20px;
    overflow: hidden;
    background: #f5f5f5;
    position: relative;
  }
  
  .overview-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }
  
  .overview-image:hover img {
    transform: scale(1.05);
  }
  
  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .overview-image:hover .image-overlay {
    opacity: 1;
  }
  
  /* 联系表单 */
  .contact-form-section {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 30px;
    padding: 70px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.9);
    animation: fadeInUp 1s ease-out 1.2s both;
    position: relative;
    overflow: hidden;
  }
  
  .contact-form-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
  
  .form-header {
    text-align: center;
    margin-bottom: 60px;
    position: relative;
  }
  
  .form-header::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 2px;
  }
  
  .form-header h2 {
    margin-bottom: 20px;
    font-size: 2.8rem;
    font-weight: 900;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: none;
    position: relative;
  }
  
  .form-header h2::after {
    content: '✉️';
    position: absolute;
    top: -10px;
    right: -40px;
    font-size: 1.5rem;
    animation: bounce 2s infinite;
  }
  
  @keyframes bounce {
  
    0%,
    20%,
    50%,
    80%,
    100% {
      transform: translateY(0);
    }
  
    40% {
      transform: translateY(-10px);
    }
  
    60% {
      transform: translateY(-5px);
    }
  }
  
  .form-header p {
    color: #555;
    font-size: 1.2rem;
    margin: 0;
    font-weight: 500;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto;
    background: rgba(102, 126, 234, 0.05);
    padding: 15px 25px;
    border-radius: 25px;
    border: 1px solid rgba(102, 126, 234, 0.1);
  }
  
  .form-container {
    max-width: 900px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 20px;
    padding: 40px;
    border: 1px solid #e0e0e0;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }
  
  .form-item-half {
    width: 100%;
  }
  
  /* 确保表单项可见 */
  :deep(.el-form-item) {
    margin-bottom: 24px;
  }
  
  :deep(.el-form-item__content) {
    position: relative;
    min-height: 48px;
  }
  
  :deep(.el-form-item__label) {
    font-weight: 800;
    color: #2c3e50;
    font-size: 1.1rem;
    margin-bottom: 12px;
  }
  
  :deep(.el-input__wrapper) {
    border-radius: 8px;
    border: 2px solid #d0d7de !important;
    background: #ffffff !important;
    min-height: 48px;
    position: relative;
    display: flex;
    align-items: center;
  }
  
  :deep(.el-input__wrapper:hover) {
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    border-color: #667eea !important;
  }
  
  :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.25);
    border-color: #667eea !important;
  }
  
  :deep(.el-textarea__inner) {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 2px solid #d0d7de !important;
    transition: all 0.3s ease;
    background: #ffffff !important;
    min-height: 120px;
  }
  
  :deep(.el-textarea__inner:hover) {
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    border-color: #667eea !important;
  }
  
  :deep(.el-textarea__inner:focus) {
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.25);
    border-color: #667eea !important;
  }
  
  :deep(.el-select .el-input__wrapper) {
    border-radius: 12px;
    border: 2px solid #d0d7de !important;
    background: #ffffff !important;
  }
  
  /* 确保输入框内文字可见 */
  :deep(.el-input__inner) {
    background: #ffffff !important;
    color: #333333 !important;
    border: none !important;
  }
  
  :deep(.el-textarea__inner) {
    color: #333333 !important;
  }
  
  :deep(.el-input input) {
    background: #ffffff !important;
    color: #333333 !important;
  }
  
  :deep(.el-select input) {
    background: #ffffff !important;
    color: #333333 !important;
  }
  
  .submit-form-item {
    text-align: center;
    margin-top: 40px;
    position: relative;
  }
  
  .submit-form-item::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 2px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 1px;
    opacity: 0.5;
  }
  
  .submit-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 30px;
    padding: 18px 50px;
    font-size: 1.2rem;
    font-weight: 800;
    min-width: 220px;
    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
    transition: all 0.4s ease;
    position: relative;
    overflow: hidden;
  }
  
  .submit-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s ease;
  }
  
  .submit-button:hover::before {
    left: 100%;
  }
  
  .submit-button:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 18px 50px rgba(102, 126, 234, 0.6);
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  }
  
  .submit-button:active {
    transform: translateY(-2px) scale(1.02);
  }
  
  .submit-button .el-icon {
    width: 16px !important;
    height: 16px !important;
    font-size: 16px !important;
  }
  
  .submit-button .el-icon svg {
    width: 16px !important;
    height: 16px !important;
  }
  
  /* 快速链接 */
  .links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
    animation: fadeInUp 1s ease-out 1.5s both;
  }
  
  .link-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    padding: 40px 30px;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    text-align: center;
    text-decoration: none;
    color: inherit;
    transition: all 0.4s ease;
    border: 1px solid rgba(255, 255, 255, 0.8);
    position: relative;
    overflow: hidden;
  }
  
  .link-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 50px rgba(102, 126, 234, 0.25);
    text-decoration: none;
    color: inherit;
  }
  
  .link-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 25px;
    font-size: 2rem;
    transition: all 0.4s ease;
  }
  
  .link-card:hover .link-icon {
    transform: scale(1.1) rotate(-5deg);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
  }
  
  .link-card h3 {
    color: #2c3e50;
    margin: 0 0 15px 0;
    font-size: 1.3rem;
    font-weight: 700;
    transition: color 0.3s ease;
  }
  
  .link-card:hover h3 {
    color: #667eea;
  }
  
  .link-card p {
    color: #666;
    margin: 0 0 20px 0;
    font-size: 1rem;
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
    .contact-header h1 {
      font-size: 2.5rem;
    }
  
    .contact-header p {
      font-size: 1.2rem;
    }
  
    .contact-cards {
      grid-template-columns: 1fr;
      gap: 25px;
    }
  
    .overview-content {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  
    .overview-text h2 {
      font-size: 2.2rem;
      text-align: center;
    }
  
    .overview-image {
      height: 250px;
    }
  
    .form-row {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  
    .links-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  
    .lab-overview,
    .contact-form-section {
      padding: 40px 30px;
    }
  
    .form-container {
      padding: 30px 20px;
    }
  
    .form-header h2 {
      font-size: 2.2rem;
    }
  
    .form-header h2::after {
      right: -25px;
      font-size: 1.2rem;
    }
  
    .form-header p {
      font-size: 1.1rem;
      padding: 12px 20px;
    }
  
    .submit-button {
      min-width: 180px;
      padding: 16px 40px;
      font-size: 1.1rem;
    }
  
    section h2 {
      font-size: 2rem;
    }
  }
  </style>
  