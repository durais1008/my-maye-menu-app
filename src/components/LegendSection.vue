<!--
  =====================================================================
  LegendSection.vue — 马也传奇模块（密码保护 + 博客系统）
  =====================================================================
  设计：玻璃态面板 + 大圆角 + 橘红渐变按钮
-->

<template>
  <div class="view-section">
    <h2>📖 马也传奇</h2>

    <!-- 未解锁：密码框 -->
    <div v-if="!isUnlocked" class="password-box">
      <h3>🔒 访问受限</h3>
      <p>这是我的私人领地，需要密码才能访问哦。</p>
      <input
        type="password"
        v-model="inputPassword"
        @keyup.enter="checkPassword"
        placeholder="请输入密码"
        class="pwd-input"
      />
      <button @click="checkPassword" class="pwd-btn">验证解锁</button>
    </div>

    <!-- 已解锁：博客系统 -->
    <div v-else class="legend-unlocked-area">

      <!-- 写博客 -->
      <div class="admin-write-box">
        <h3>✍️ 记录今天的生活</h3>
        <input
          v-model="newTitle"
          placeholder="写个吸引人的标题..."
          class="blog-input"
        />
        <textarea
          v-model="newContent"
          placeholder="今天主厨又研究了什么新菜？还是有什么感悟？"
          rows="4"
          class="blog-textarea"
        ></textarea>
        <button
          @click="handlePublish"
          :disabled="isPublishing"
          class="publish-btn"
        >
          {{ isPublishing ? '正在同步到云端...' : '公开发布传奇' }}
        </button>
      </div>

      <!-- 博客列表 -->
      <div class="blog-list">
        <div v-if="blogPosts.length === 0" class="empty-cart">
          云端日记本还是空的，快去写第一篇吧！
        </div>

        <div
          v-for="post in blogPosts"
          :key="post.id"
        >
          <BlogCard
            :post="post"
            @delete="handleDelete"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSupabase } from '../composables/useSupabase.js'
import BlogCard from './BlogCard.vue'

// 直接初始化 Supabase
const { blogPosts, isPublishing, fetchPosts, publishPost, deletePost } = useSupabase()

const isUnlocked = ref(false)
const inputPassword = ref('')
const SECRET_CODE = '5201314'

const newTitle = ref('')
const newContent = ref('')

/**
 * checkPassword —— 验证密码
 * 正确后解锁并拉取云端博客
 */
const checkPassword = async () => {
  if (inputPassword.value === SECRET_CODE) {
    isUnlocked.value = true
    inputPassword.value = ''
    // 拉取博客并捕获错误
    try {
      await fetchPosts()
      console.log('✅ 博客数据拉取成功，共', blogPosts.value.length, '篇')
    } catch (err) {
      console.error('❌ 拉取博客失败:', err)
      alert('拉取博客失败，请检查控制台（F12）查看错误详情。')
    }
  } else {
    alert('密码好像不太对哦！再试一次？')
    inputPassword.value = ''
  }
}

const handlePublish = async () => {
  const success = await publishPost({ title: newTitle.value, content: newContent.value })
  if (success) {
    newTitle.value = ''
    newContent.value = ''
  }
}

const handleDelete = (id) => { deletePost(id) }
</script>

<style scoped>
/* ==================== 通用 ==================== */
.view-section h2 {
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: #D7E2EA;
  margin-bottom: 20px;
  padding-left: 12px;
  border-left: 3px solid #FF6B35;
}

/* ==================== 密码框 ==================== */
.password-box {
  text-align: center;
  padding: 40px 20px;
  background: rgba(255, 255, 255, 0.03);        /* 玻璃底 */
  border: 1px solid rgba(255, 255, 255, 0.10);  /* 半透边框 */
  border-radius: 20px;
}

.password-box h3 {
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 700;
  color: #D7E2EA;
  margin: 0 0 10px;
}

.password-box p {
  color: rgba(215, 226, 234, 0.55);
  margin: 0 0 20px;
  font-size: 14px;
}

.pwd-input {
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50px;
  margin-bottom: 16px;
  width: 80%;
  font-size: 16px;
  text-align: center;
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 600;
  color: #D7E2EA;
  outline: none;
  transition: border-color 0.25s;
}

.pwd-input:focus {
  border-color: #FF6B35;
}

.pwd-input::placeholder {
  color: rgba(215, 226, 234, 0.30);
}

/* 验证按钮 */
.pwd-btn {
  background: linear-gradient(135deg, #FF6B35, #E03E3E);
  color: #FFFFFF;
  border: none;
  padding: 12px 32px;
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 600;
  font-size: 15px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 18px rgba(224, 62, 62, 0.30);
}

.pwd-btn:hover {
  box-shadow: 0 6px 24px rgba(224, 62, 62, 0.45);
  transform: translateY(-1px);
}

/* ==================== 博客写作区 ==================== */
.admin-write-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 28px;
}

.admin-write-box h3 {
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 700;
  color: #D7E2EA;
  margin: 0 0 16px;
}

.blog-input,
.blog-textarea {
  width: 100%;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 14px;
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-size: 14px;
  color: #D7E2EA;
  outline: none;
  transition: border-color 0.25s;
}

.blog-input:focus,
.blog-textarea:focus {
  border-color: #FF6B35;
}

.blog-input::placeholder,
.blog-textarea::placeholder {
  color: rgba(215, 226, 234, 0.30);
}

.blog-textarea {
  resize: vertical;                /* 只允许上下拖拽 */
}

/* 发布按钮 */
.publish-btn {
  background: linear-gradient(135deg, #FF6B35, #E03E3E);
  color: #FFFFFF;
  border: none;
  padding: 14px 24px;
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  width: 100%;
  border-radius: 50px;
  box-shadow: 0 4px 18px rgba(224, 62, 62, 0.30);
}

.publish-btn:disabled {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(215, 226, 234, 0.35);
  box-shadow: none;
  cursor: not-allowed;
}

/* ==================== 博客列表 ==================== */
.blog-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 空状态 */
.empty-cart {
  text-align: center;
  color: rgba(215, 226, 234, 0.40);
  padding: 24px;
  font-size: 14px;
}
</style>
