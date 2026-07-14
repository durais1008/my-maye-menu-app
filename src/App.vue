<!--
  =====================================================================
  App.vue — 应用根组件（总指挥中心）
  =====================================================================

  【角色定位】
    这个文件是整个应用的"组装车间"，职责只有三个：
      1. 管理全局导航状态（用户当前在哪个页面）
      2. 管理购物车数据（点菜 → 购物车 → 导出订单）
      3. 组装所有子组件，像搭积木一样拼出完整页面

  【组件树结构】
    App.vue（根）
    ├── MusicFloatingBtn   → 音乐播放器
    ├── MainNavBar         → 顶部导航（马也菜单 / 马也传奇 / 马也简介）
    ├── [马也菜单模块]（v-if="currentMainTab === 'menu'"）
    │   ├── SubNavBar      → 二级导航（首页 / 点菜 / 已选）
    │   ├── HomeCarousel   → 今日推荐轮播图
    │   ├── MenuGrid       → 菜品菜单网格
    │   └── CartPanel      → 购物车 + 订单导出
    ├── [马也传奇模块]（v-if="currentMainTab === 'legend'"）
    │   └── LegendSection  → 密码验证 + 博客系统
    └── [马也简介模块]（v-if="currentMainTab === 'intro'"）
        └── IntroSection   → 占位页面

  【如何修改某个模块？】
    想要修改轮播图 → 打开 src/components/HomeCarousel.vue
    想要修改博客系统 → 打开 src/components/LegendSection.vue
    想要修改数据库逻辑 → 打开 src/composables/useSupabase.js
    想要修改整体布局 → 就在这个文件里改

  【数据流向】
    App.vue（数据源）──Props──→ 子组件（接收数据）
                           ←── Emit（事件通知）──
    例如：App.vue 把 cart 数组传给 CartPanel 显示，
          CartPanel 通过 emit('remove-from-cart') 告诉 App.vue 删某道菜
-->

<template>
  <!--
    页面最外层容器
    class="app-container" → 白色半透明内容区，最大宽度 600px，居中
    背景图在全局样式中设置（见下方 <style> 块）
  -->
  <div class="app-container">

    <!--
      ==================== 模块 0：音乐播放器 ====================
      固定在右下角的悬浮按钮，独立工作，不依赖其他组件
    -->
    <MusicFloatingBtn />

    <!-- 访问计数器 -->
    <div class="visit-counter reveal">
      👁️ 已有 <span class="visit-count-num">{{ visitCount }}</span> 次访问
    </div>

    <!--
      ==================== 模块 1：顶部导航栏 ====================
      :current-tab    → 告诉导航栏当前选中了哪个标签（用于高亮）
      @tab-change     → 监听用户点击了哪个标签，更新 currentMainTab
      $event          → Vue 的魔法变量，代表子组件 emit 传过来的值
    -->
    <MainNavBar
      :current-tab="currentMainTab"
      @tab-change="currentMainTab = $event"
    />

    <!--
      ==================== 模块 2：马也菜单 ====================
      v-if → 只有当前标签是 'menu' 时才渲染
            （切换到其他标签时，这个区域会被销毁，切换回来时重新创建）
    -->
    <div v-if="currentMainTab === 'menu'">

      <!--
        二级导航栏
        :current-view  → 当前二级页面（home / menu / cart）
        :cart-count    → 购物车里有多少道菜，显示在"已选"按钮上
        @view-change   → 用户点击二级导航时，更新 currentMenuView
      -->
      <SubNavBar
        :current-view="currentMenuView"
        :cart-count="cart.length"
        @view-change="currentMenuView = $event"
      />

      <!--
        首页：今日推荐轮播图
        v-if → 只有二级页面是 'home' 时才显示
        :images → 传入轮播图片路径数组
      -->
      <HomeCarousel
        v-if="currentMenuView === 'home'"
        :images="homeImages"
      />

      <!--
        点菜页：菜品菜单网格
        v-if → 只有二级页面是 'menu' 时才显示
        :items → 传入菜品数据数组（每项包含 id, name, image）
        @add-to-cart → 用户点"想吃这个"时，把菜品加入购物车
      -->
      <MenuGrid
        v-if="currentMenuView === 'menu'"
        :items="menuItems"
        @add-to-cart="addToCart"
      />

      <!--
        购物车页：已选订单 + 导出功能
        v-if → 只有二级页面是 'cart' 时才显示
        :cart → 传入购物车数组
        @remove-from-cart → 用户点 × 删除某道菜时，从购物车移除
      -->
      <CartPanel
        v-if="currentMenuView === 'cart'"
        :cart="cart"
        @remove-from-cart="removeFromCart"
      />
    </div>

    <!--
      ==================== 模块 3：马也传奇 ====================
      v-if → 只有当前标签是 'legend' 时才渲染
      LegendSection 自己管理所有的密码和博客逻辑，
      App.vue 不需要关心内部细节，只需要"挂载"它
    -->
    <LegendSection v-if="currentMainTab === 'legend'" />

    <!--
      ==================== 模块 3.5：AI 智能厨房 ====================
    -->
    <RecipeAI v-if="currentMainTab === 'recipe'" />

    <!--
      ==================== 模块 4：马也简介 ====================
      v-if → 只有当前标签是 'intro' 时才渲染
      目前是施工中的占位页面
    -->
    <IntroSection v-if="currentMainTab === 'intro'" />

  </div>
</template>

<script setup>
/**
 * ==================== 导入子组件 ====================
 *
 * 每个 import 语句引入一个 .vue 文件，就像一个零件
 * 把所有零件组装起来，就是完整的网页
 */
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import MusicFloatingBtn from './components/MusicFloatingBtn.vue'
import MainNavBar from './components/MainNavBar.vue'
import SubNavBar from './components/SubNavBar.vue'
import HomeCarousel from './components/HomeCarousel.vue'
import MenuGrid from './components/MenuGrid.vue'
import CartPanel from './components/CartPanel.vue'
import LegendSection from './components/LegendSection.vue'
import RecipeAI from './components/RecipeAI.vue'
import IntroSection from './components/IntroSection.vue'
import { useScrollReveal } from './composables/useScrollReveal.js'
import { useVisitorCount } from './composables/useVisitorCount.js'

// ==================== 访问计数器 ====================
const { visitCount } = useVisitorCount()

// ==================== 全局导航状态 ====================

/**
 * currentMainTab：一级导航标签
 * 可选值：'menu' | 'legend' | 'intro'
 * 默认值 'menu' → 打开网站首先显示"马也菜单"
 *
 * 当用户点击顶部导航按钮时，MainNavBar 会 emit 'tab-change' 事件，
 * 然后通过 @tab-change="currentMainTab = $event" 更新这个值
 */
const currentMainTab = ref('menu')

/**
 * currentMenuView：菜单模块下的二级页面
 * 可选值：'home' | 'menu' | 'cart'
 * 默认值 'home' → 进入菜单后先显示"今日推荐"
 *
 * 当用户点击二级导航按钮时，SubNavBar 会 emit 'view-change' 事件更新它
 */
const currentMenuView = ref('home')

// ==================== 菜单数据 ====================

/**
 * homeImages：首页轮播图的图片列表
 * 图片存放在 public/images/ 目录下
 * 以后想换图，直接改这里的路径即可
 */
const homeImages = ref([
  '/images/马也红烩牛肉抱蛋.jpg',
  '/images/超美味咖喱饭.jpg',
  '/images/鲫鱼豆腐汤.jpg'
])

/**
 * menuItems：主厨菜单的菜品数据
 * 每道菜是一个对象，包含三个属性：
 *   id    → 唯一标识（数字）
 *   name  → 菜品名称（显示在卡片上）
 *   image → 菜品图片路径（.webp 格式，比 jpg 更小更快）
 *
 * 如果要新增一道菜，只需在数组里加一个对象：
 *   { id: 9, name: '新菜名', image: '/images/新菜名.webp' }
 * 页面会自动显示新卡片，不需要改其他任何代码
 */
const menuItems = ref([
  { id: 1, name: '马也红烩牛肉抱蛋',  image: '/images/马也红烩牛肉抱蛋.webp' },
  { id: 2, name: '超美味咖喱饭',       image: '/images/超美味咖喱饭.webp' },
  { id: 3, name: '萝卜炖牛肉丸',       image: '/images/萝卜炖牛肉丸.webp' },
  { id: 4, name: '韭菜炒蛋配黑椒牛肉', image: '/images/韭菜炒蛋配黑椒牛肉.webp' },
  { id: 5, name: '鸡丝凉面',           image: '/images/鸡丝凉面.webp' },
  { id: 6, name: '小炒坤',             image: '/images/小炒坤.webp' },
  { id: 7, name: '巫毒饮料',           image: '/images/巫毒饮料.webp' },
  { id: 8, name: 'Damn Ber Fan',      image: '/images/damn ber fan.webp' }
])

// ==================== 购物车状态 ====================

/**
 * cart：购物车数组
 * 初始值为空数组 [] → 用户啥都没选
 * 用户点"想吃这个"时，通过 addToCart() 往里面加菜
 * 用户点 × 时，通过 removeFromCart() 从里面删菜
 *
 * 这个数组被 CartPanel 和 SubNavBar 同时使用：
 *   - SubNavBar 用 cart.length 显示"已选 (3)"
 *   - CartPanel 用 cart 数组显示具体是哪些菜
 */
const cart = ref([])

// ==================== 核心业务方法 ====================

/**
 * addToCart —— 把一道菜加入购物车
 *
 * @param {Object} item - 菜品对象 { id, name, image }
 *
 * push()：数组方法，在末尾追加一个新元素
 * 因为 cart 是 ref 包裹的响应式数组，
 * push 之后页面会自动更新（购物车数量、订单列表都会刷新）
 */
const addToCart = (item) => {
  cart.value.push(item)  // .value：ref 包裹的值要通过 .value 访问
  alert(`【${item.name}】已加入今日菜单！`)
}

/**
 * removeFromCart —— 从购物车中移除一道菜
 *
 * @param {number} index - 要删除的菜品在数组中的位置（从 0 开始）
 *
 * splice(index, 1)：数组方法，从 index 位置开始删除 1 个元素
 * 例如：cart = ['牛肉', '咖喱', '凉面']
 *       splice(1, 1) → 删除 '咖喱'，cart 变成 ['牛肉', '凉面']
 */
const removeFromCart = (index) => {
  cart.value.splice(index, 1)
}

// ==================== 动效系统：滚动淡入 + 背景视差 ====================

/**
 * 初始化 scrollReveal 引擎
 * observeAll() 会自动扫描页面上所有带 class="reveal" 的元素，
 * 当它们进入可视区域时触发淡入动画
 */
const { observeAll, cleanup } = useScrollReveal()

/**
 * 背景视差效果：
 * 监听页面滚动，微调背景图位置，产生"背景慢慢移动"的深度感
 */
let parallaxRaf = null  // requestAnimationFrame ID（用于性能优化）
const handleParallax = () => {
  // 用 requestAnimationFrame 确保在浏览器刷新帧时才计算（不浪费性能）
  if (parallaxRaf) return
  parallaxRaf = requestAnimationFrame(() => {
    const scrollY = window.scrollY
    // 背景图随滚动向下偏移 30% 速度 → 视差深度感
    document.body.style.backgroundPositionY = `${scrollY * 0.3}px`
    parallaxRaf = null
  })
}

onMounted(() => {
  // 启动滚动淡入观察
  nextTick(() => observeAll())
  // 启动背景视差
  window.addEventListener('scroll', handleParallax, { passive: true })
})

/**
 * 监听标签切换：
 * v-if 会销毁/重建组件，新 DOM 元素带 .reveal 类但还没被观察，
 * 所以每次切换后需要用 nextTick 等待 DOM 更新完成，再重新扫描
 */
watch([currentMainTab, currentMenuView], () => {
  nextTick(() => observeAll())
})

onUnmounted(() => {
  // 销毁观察器
  cleanup()
  // 移除视差监听
  window.removeEventListener('scroll', handleParallax)
  if (parallaxRaf) cancelAnimationFrame(parallaxRaf)
})
</script>

<!--
  ==================== 全局样式（不加 scoped）====================
  这里只定义影响整个页面的样式（如 body 背景图）
  加了 scoped 的样式只影响当前组件，这里不加 scoped 就是为了让 body 生效
-->
<style>
/**
 * ==================== 全局样式 ====================
 *
 * 设计风格：照片背景 × 玻璃态 × 橘红渐变 × 动效增强
 */

/* ---------- 页面背景 + 视差 ---------- */
body {
  background-image: url('/images/background.jpg');
  background-size: cover;
  background-position: center top;
  background-attachment: scroll;
  /* 改为 scroll → JS 视差控制 backgroundPositionY */
  margin: 0;
  padding: 0;
}

/* ==================== 滚动淡入动画系统 ==================== */
/**
 * .reveal：标记需要淡入动画的元素
 * 初始状态 → 透明 + 下移 40px
 */
.reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.7s cubic-bezier(0.22, 0.61, 0.36, 1),
              transform 0.7s cubic-bezier(0.22, 0.61, 0.36, 1);
}

/**
 * .is-revealed：由 JS 在元素进入视口时自动添加
 * 最终状态 → 完全不透明 + 回到原位置
 */
.reveal.is-revealed {
  opacity: 1;
  transform: translateY(0);
}

/* 延迟变量：让多个元素依次出现，而不是一起弹出 */
.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }
.reveal-delay-3 { transition-delay: 0.3s; }
.reveal-delay-4 { transition-delay: 0.4s; }
.reveal-delay-5 { transition-delay: 0.5s; }

/* ==================== 全局按钮悬浮发光 ==================== */
/**
 * 所有 <button> 和带 .btn-glow 的元素，
 * 在 hover 时都会出现光晕 + 上浮效果
 */
@keyframes btnPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(255, 107, 53, 0.3); }
  50%      { box-shadow: 0 0 20px rgba(255, 107, 53, 0.55); }
}

button {
  transition: all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(255, 107, 53, 0.35);
}

/* 主操作按钮（橘红渐变底）hover 发光增强 */
button[class*="add-btn"]:hover,
button[class*="export-btn"]:hover,
button[class*="publish-btn"]:hover,
button[class*="pwd-btn"]:hover {
  animation: btnPulse 2s ease-in-out infinite;
  filter: brightness(1.1);
}

/* ==================== 打字机光标闪烁 ==================== */
@keyframes blinkCursor {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0; }
}

.typewriter-cursor {
  display: inline-block;
  color: #FF6B35;
  font-weight: 300;
  animation: blinkCursor 0.8s ease-in-out infinite;
}

/* ==================== 3D 卡片悬浮 ==================== */
.card-3d {
  transition: transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1),
              box-shadow 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.card-3d:hover {
  transform: perspective(600px) rotateX(2deg) rotateY(-2deg) translateY(-4px);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.45),
    0 0 30px rgba(255, 107, 53, 0.15);
}
</style>

<!--
  ==================== 组件样式（scoped = 只影响当前组件内部）====================
  scoped 是 Vue 的魔法属性：加了它，这里的 CSS 不会泄露到子组件
  每个子组件有自己的 scoped 样式，互不干扰
-->
<style scoped>
/**
 * ==================== 内容容器 ====================
 *
 * 玻璃态面板：
 *   - 极低透明度的白色底 → 微妙的"毛玻璃"质感
 *   - 半透白色边框 → 面板边界若隐若现
 *   - 微弱的 box-shadow → 面板稍微"浮"在暗色背景上
 */
.app-container {
  max-width: 600px;
  /* 移动端撑满，桌面端居中 */
  margin: 0 auto;
  /* 水平居中 */
  padding: 24px 20px;
  /* 上下 24px，左右 20px */
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  /* 字体栈：英文用 Kanit（几何现代感），中文用 Noto Sans SC（思源黑体） */
  background-color: rgba(255, 255, 255, 0.12);
  /* 半透明白色玻璃底 → 12% 不透明度，在照片背景上清晰可见 */
  min-height: 100vh;
  /* 最小高度铺满整个视口 */
  border-left: 1px solid rgba(255, 255, 255, 0.15);
  border-right: 1px solid rgba(255, 255, 255, 0.15);
  /* 左右两侧半透明边框 → 给容器"边界感" */
  backdrop-filter: blur(10px);
  /* 毛玻璃模糊效果 → 背景图透过容器时变模糊 */
  -webkit-backdrop-filter: blur(10px);
  color: #D7E2EA;
}

/* ==================== 访问计数器 ==================== */
.visit-counter {
  text-align: center;
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(215, 226, 234, 0.55);
  padding: 0 0 8px;
  letter-spacing: 0.5px;
}

.visit-count-num {
  color: #FF6B35;
  font-weight: 700;
  font-size: 16px;
}

</style>
