<!--
  =====================================================================
  HomeCarousel.vue — 首页轮播图组件
  =====================================================================
  功能：在"首页"视图中展示几张推荐菜品的图片
  每 3 秒自动滚动一张，滚到最后一张后回到开头
  用户也可以手动左右滑动（在手机上）

  使用方式：
    <HomeCarousel :images="homeImages" />

  Props：
    images — 图片路径的数组，如 ['/images/菜1.jpg', '/images/菜2.jpg']
-->

<template>
  <main class="view-section">
    <h2>今日推荐</h2>

    <!--
      轮播图容器
      ref="carouselRef" → JS 通过它拿到这个 DOM 元素进行滚动控制
      class="carousel"  → 横向滚动布局
    -->
    <div class="carousel" ref="carouselRef">
      <!--
        v-for：遍历 images 数组，每张图片生成一个 <img> 标签
        :key="index" → Vue 需要的唯一标识，用于高效更新 DOM
        :src="img"   → 动态绑定图片路径（冒号表示"这是 JS 表达式"）
                                               alt="轮播图" → 图片加载失败时显示的替代文字
      -->
      <img
        v-for="(img, index) in images"
        :key="index"
        :src="img"
        alt="轮播图"
        class="carousel-img"
      />
    </div>
  </main>
</template>

<script setup>
/**
 * ==================== 导入依赖 ====================
 */
import { ref, onMounted, onUnmounted } from 'vue'
// ref         → 创建响应式引用（关联 DOM 元素）
// onMounted   → 组件挂载后执行
// onUnmounted → 组件销毁前执行（打扫战场，防止内存泄漏）

/**
 * ==================== Props 定义 ====================
 * images：轮播图片的路径数组，由父组件传入
 */
defineProps({
  images: {
    type: Array,    // 数组类型
    default: () => []  // 默认值为空数组（用函数返回，避免引用共享问题）
  }
})

// ==================== 轮播图滚动控制 ====================

/**
 * carouselRef：关联模板中的轮播图容器 div
 * 通过 carouselRef.value 可以操作这个 DOM 元素
 */
const carouselRef = ref(null)

/**
 * scrollTimer：存储定时器的 ID
 * 用 let 而不是 const，因为之后要清除它
 * 初始值为 null，onMounted 后赋值
 */
let scrollTimer = null

/**
 * startAutoScroll —— 启动自动轮播滚动
 *
 * setInterval(callback, 3000)：
 *   每 3000 毫秒（= 3 秒）执行一次 callback 函数
 *   返回值是一个 ID，用于 clearInterval 停止
 *
 * 滚动逻辑：
 *   1. 获取容器可见宽度（一屏的宽度）
 *   2. 判断是否已经滚到底（scrollLeft + 可见宽度 >= 内容总宽度）
 *   3. 如果到底了 → 平滑滚回开头
 *   4. 如果没到底 → 向右滚动一屏
 */
const startAutoScroll = () => {
  scrollTimer = setInterval(() => {
    if (!carouselRef.value) return  // 安全检查：如果元素不存在就跳过

    const container = carouselRef.value
    const scrollAmount = container.clientWidth  // 每次滚动的距离 = 容器可见宽度

    /**
     * 判断是否已经滚动到最右边：
     *   scrollLeft  → 已经向左滚动了多少像素
     *   clientWidth → 容器可见宽度
     *   scrollWidth → 内容的实际总宽度
     *   如果 "已滚动距离 + 可见宽度 >= 总宽度 - 10（容错值）"
     *   说明已经滚到底了，该回到开头
     */
    if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
      // 滚到底了 → 回到第一张
      container.scrollTo({ left: 0, behavior: 'smooth' })
    } else {
      // 没到底 → 向右滚动一屏
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }, 3000)  // 3000ms = 3 秒
}

// ==================== 生命周期钩子 ====================

/**
 * onMounted：组件被挂载到页面上之后执行
 * 启动自动轮播
 */
onMounted(() => {
  startAutoScroll()
})

/**
 * onUnmounted：组件从页面上移除之前执行
 * 清除定时器，防止内存泄漏
 * 如果不清理，即使离开页面，定时器还会一直跑
 */
onUnmounted(() => {
  if (scrollTimer) {
    clearInterval(scrollTimer)  // 停止 setInterval
    scrollTimer = null
  }
})
</script>

<style scoped>
/* ---------- 标题左侧装饰线 ---------- */
.view-section h2 {
  border-left: 5px solid #000;  /* 左侧 5px 黑色竖线 → 工业/粗犷风格 */
  padding-left: 10px;
  margin-bottom: 20px;
}

/* ---------- 轮播图容器 ---------- */
.carousel {
  display: flex;                 /* 横向排列子元素（图片横着排） */
  overflow-x: auto;              /* 超出容器宽度时允许横向滚动 */
  gap: 15px;                     /* 图片之间的间距 */
  scroll-snap-type: x mandatory; /* CSS 滚动捕捉：每次滚动自动对齐到图片边缘 */
  padding-bottom: 10px;
}

/* ---------- 单张轮播图片 ---------- */
.carousel-img {
  width: 100%;                   /* 宽度撑满容器 */
  max-height: 250px;             /* 限制最大高度 */
  object-fit: cover;             /* 图片按比例裁剪填充（不变形） */
  scroll-snap-align: start;      /* 滚动对齐到图片起始位置 */
  border: 2px solid #000;       /* 黑色边框 */
  flex-shrink: 0;                /* 不允许图片被压缩（保持原始宽度） */
}
</style>
