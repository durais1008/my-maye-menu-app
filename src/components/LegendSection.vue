<!--
  =====================================================================
  LegendSection.vue — 马也传奇模块（密码保护 + 博客系统）
  =====================================================================
  功能：
    1. 默认显示密码输入框，需要输入正确密码才能进入
    2. 解锁后显示博客写作区和已发布的博客列表
    3. 博客数据存储在 Supabase 云数据库，多设备共享同步
    4. 支持发布新博客、删除已有博客

  内部子模块：
    - 密码验证区（未解锁时）
    - 博客写作区（解锁后）
    - 博客列表区（解锁后）

  使用方式：
    <LegendSection />
  无需传 Props，所有逻辑自包含
-->

<template>
  <div class="view-section">
    <h2>📖 马也传奇</h2>

    <!--
      ==================== 场景一：未解锁 → 显示密码框 ====================
      v-if="!isUnlocked" → 还没输入正确密码时显示
    -->
    <div v-if="!isUnlocked" class="password-box">
      <h3>🔒 访问受限</h3>
      <p>这是我的私人领地，需要密码才能访问哦。</p>

      <!--
        密码输入框
        type="password"           → 输入的内容显示为圆点（***），防偷窥
        v-model="inputPassword"   → 双向绑定：输入值自动同步到 JS 变量 inputPassword
        @keyup.enter="checkPassword" → 按下回车键直接验证，不用点按钮
        placeholder               → 输入框中显示的提示文字
      -->
      <input
        type="password"
        v-model="inputPassword"
        @keyup.enter="checkPassword"
        placeholder="请输入密码"
        class="pwd-input"
      />

      <!-- 验证按钮 -->
      <button @click="checkPassword" class="pwd-btn">验证解锁</button>
    </div>

    <!--
      ==================== 场景二：已解锁 → 显示博客系统 ====================
      v-else → 与上面 v-if 配对，解锁后渲染这里
    -->
    <div v-else class="legend-unlocked-area">

      <!-- ======== 子模块 A：博客写作区 ======== -->
      <div class="admin-write-box">
        <h3>✍️ 记录今天的生活</h3>

        <!--
          博客标题输入框
          v-model="newTitle" → 双向绑定到 JS 变量 newTitle
          placeholder        → 提示文字
        -->
        <input
          v-model="newTitle"
          placeholder="写个吸引人的标题..."
          class="blog-input"
        />

        <!--
          博客内容输入区（多行文本框）
          rows="4" → 显示 4 行高度
          v-model="newContent" → 双向绑定到 JS 变量 newContent
        -->
        <textarea
          v-model="newContent"
          placeholder="今天主厨又研究了什么新菜？还是有什么感悟？"
          rows="4"
          class="blog-textarea"
        ></textarea>

        <!--
          发布按钮
          @click="handlePublish"     → 点击触发发布逻辑
          :disabled="isPublishing"   → 发布中时按钮变灰且不可点击
          {{ ... }}                  → 根据发布状态动态显示文字
        -->
        <button
          @click="handlePublish"
          :disabled="isPublishing"
          class="publish-btn"
        >
          {{ isPublishing ? '正在同步到云端...' : '公开发布传奇' }}
        </button>
      </div>

      <!-- ======== 子模块 B：博客列表区 ======== -->
      <div class="blog-list">
        <!-- 空状态：没有博客时显示 -->
        <div v-if="blogPosts.length === 0" class="empty-cart">
          云端日记本还是空的，快去写第一篇吧！
        </div>

        <!--
          v-for：遍历 blogPosts，每篇博客生成一张卡片
          从 Supabase 数据库拉取的数据，包含 id、title、content、date
        -->
        <div v-for="post in blogPosts" :key="post.id" class="blog-card">
          <!-- 卡片头部：标题 + 删除按钮 -->
          <div class="blog-header">
            <h3 class="blog-title">{{ post.title }}</h3>
            <!-- 删除按钮：传入博客 id 确认后删除 -->
            <button @click="handleDelete(post.id)" class="delete-blog-btn">
              删除
            </button>
          </div>

          <!-- 日期标签 -->
          <span class="blog-date">{{ post.date }}</span>

          <!--
            博客正文
            white-space: pre-wrap → 保留换行符和空格，让排版和输入时一致
          -->
          <p class="blog-content">{{ post.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * ==================== 导入依赖 ====================
 *
 * ref：Vue 的响应式数据工厂
 * useSupabase：我们自己封装的云数据库工具箱（在 composables/ 目录里）
 */
import { ref } from 'vue'
import { useSupabase } from '../composables/useSupabase.js'

// ==================== 初始化 Supabase 连接 ====================
/**
 * 解构赋值：从 useSupabase() 返回的对象中取出需要的数据和方法
 * 就像从一个工具箱里取出需要用到的几件工具
 */
const {
  blogPosts,     // 博客列表（响应式，数据变了页面自动更新）
  isPublishing,  // 发布状态（true=正在发布中，按钮会禁用）
  fetchPosts,    // 从云端拉取博客的函数
  publishPost,   // 发布新博客到云端的函数
  deletePost     // 从云端删除博客的函数
} = useSupabase()

// ==================== 密码相关状态 ====================

/**
 * isUnlocked：是否已经解锁
 * false = 显示密码框
 * true  = 显示博客系统
 */
const isUnlocked = ref(false)

/**
 * inputPassword：用户在密码框中输入的内容
 * 因为是 ref，和模板中的 v-model 双向绑定
 * 用户在输入框里打字 → 这个变量自动更新
 */
const inputPassword = ref('')

/**
 * SECRET_CODE：正确的密码
 * 5201314 = 我爱你一生一世
 * 用 const 是因为密码不会改变
 */
const SECRET_CODE = '5201314'

// ==================== 博客写作状态 ====================

/**
 * newTitle：用户正在写的博客标题
 * 和模板中输入框的 v-model 双向绑定
 */
const newTitle = ref('')

/**
 * newContent：用户正在写的博客内容
 * 和模板中 textarea 的 v-model 双向绑定
 */
const newContent = ref('')

// ==================== 密码验证 ====================

/**
 * checkPassword —— 验证用户输入的密码
 *
 * 逻辑：
 *   1. 比对用户输入和预设密码
 *   2. 如果正确 → 解锁 + 清空输入 + 拉取云端博客
 *   3. 如果错误 → 弹窗提示 + 清空输入，让用户重试
 */
const checkPassword = () => {
  // .value：访问 ref 包裹的变量的实际值
  if (inputPassword.value === SECRET_CODE) {
    isUnlocked.value = true       // 解锁！
    inputPassword.value = ''      // 清空密码框（安全考虑）
    fetchPosts()                  // 拉取云端博客到页面
  } else {
    alert('密码好像不太对哦！再试一次？')
    inputPassword.value = ''      // 清空，方便重试
  }
}

// ==================== 发布博客 ====================

/**
 * handlePublish —— 处理发布按钮点击
 *
 * 把用户输入的标题和内容打包，调用 supabase 的 publishPost 方法
 * 发布成功后清空输入框
 */
const handlePublish = async () => {
  // 调用云端发布方法，传入标题和内容
  const success = await publishPost({
    title: newTitle.value,
    content: newContent.value
  })

  // 如果发布成功，清空输入框，方便写下一篇
  if (success) {
    newTitle.value = ''
    newContent.value = ''
  }
}

// ==================== 删除博客 ====================

/**
 * handleDelete —— 处理删除按钮点击
 *
 * @param {number} id - 要删除的博客的数据库 id
 * 直接调用 supabase 的 deletePost 方法
 */
const handleDelete = (id) => {
  deletePost(id)  // 删除后 supabase 内部会自动刷新列表
}
</script>

<style scoped>
/**
 * 极简黑白 + 粗犷手绘风格
 * box-shadow: 6px 6px 0px #000 → 偏移的纯黑阴影，做出"纸片叠加"效果
 */

/* ---------- 密码输入区容器 ---------- */
.password-box {
  text-align: center;
  padding: 40px 20px;
  border: 2px solid #000;
  background: #fff;
}

/* ---------- 密码输入框 ---------- */
.pwd-input {
  padding: 10px;
  border: 2px solid #000;
  margin-bottom: 15px;
  width: 80%;
  font-size: 16px;
  text-align: center;
  font-weight: bold;
}

/* ---------- 验证按钮 ---------- */
.pwd-btn {
  background: #000;                  /* 黑底 */
  color: #fff;                       /* 白字 */
  border: none;
  padding: 10px 30px;
  font-weight: bold;
  cursor: pointer;
  font-size: 16px;
  transition: 0.2s;                  /* 平滑过渡 */
}

.pwd-btn:hover {
  background: #333;                  /* 悬停变灰 */
}

/* ---------- 博客写作区容器 ---------- */
.admin-write-box {
  border: 3px solid #000;           /* 粗黑边框 */
  padding: 20px;
  background: #fff;
  margin-bottom: 30px;
  box-shadow: 6px 6px 0px #000;     /* 偏移阴影 → "贴纸"效果 */
}

/* ---------- 标题输入框 & 内容输入框通用样式 ---------- */
.blog-input,
.blog-textarea {
  width: 100%;                       /* 撑满容器 */
  box-sizing: border-box;            /* 包含边框和内边距在内的宽度计算方式 */
  border: 2px solid #000;
  padding: 10px;
  margin-bottom: 15px;
  font-size: 14px;
  font-family: inherit;              /* 继承父元素的字体（保持统一） */
}

/* ---------- 输入框获得焦点时的样式（用户正在输入）---------- */
.blog-input:focus,
.blog-textarea:focus {
  outline: none;                     /* 去掉浏览器默认的蓝色焦点框 */
  background: #f9f9f9;              /* 微微变灰，提示"你正在这里输入" */
}

/* ---------- 发布按钮 ---------- */
.publish-btn {
  background: #000;
  color: #fff;
  border: none;
  padding: 12px 24px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  width: 100%;
}

/* ---------- 发布按钮禁用状态（正在发布中）---------- */
.publish-btn:disabled {
  background: #999;                  /* 灰色背景 */
  cursor: not-allowed;               /* 鼠标变成"禁止"图标 */
}

/* ---------- 博客列表容器 ---------- */
.blog-list {
  display: flex;
  flex-direction: column;            /* 竖着排列各篇博客 */
  gap: 20px;                         /* 博客之间的间距 */
}

/* ---------- 每篇博客的卡片 ---------- */
.blog-card {
  border: 2px solid #000;
  padding: 20px;
  background: #fff;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 1);  /* 实黑偏移阴影 → 手绘感 */
}

/* ---------- 博客头部（标题 + 删除按钮）---------- */
.blog-header {
  display: flex;
  justify-content: space-between;    /* 标题靠左，删除按钮靠右 */
  align-items: flex-start;           /* 顶部对齐 */
}

.blog-title {
  margin: 0 0 10px 0;
  font-weight: 900;
}

/* ---------- 删除博客按钮 ---------- */
.delete-blog-btn {
  background: #ff4444;               /* 红色 */
  color: #fff;
  border: 2px solid #000;
  padding: 3px 8px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}

.delete-blog-btn:hover {
  background: #cc0000;               /* 悬停更深的红 */
}

/* ---------- 日期标签 ---------- */
.blog-date {
  display: inline-block;             /* 行内块元素，不会占满整行 */
  background: #000;                  /* 黑底白字 → 标签效果 */
  color: #fff;
  padding: 3px 8px;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 15px;
}

/* ---------- 博客正文 ---------- */
.blog-content {
  line-height: 1.6;                  /* 行高 1.6 倍 → 阅读舒适 */
  margin: 0;
  color: #333;                       /* 深灰色文字，比纯黑柔和 */
  white-space: pre-wrap;             /* 保留换行符和多余空格 */
}

/* ---------- 空状态提示 ---------- */
.empty-cart {
  text-align: center;
  color: #888;
  padding: 20px;
}
</style>
