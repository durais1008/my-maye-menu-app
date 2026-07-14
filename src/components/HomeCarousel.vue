<!--
  =====================================================================
  HomeCarousel.vue — 首页轮播图组件
  =====================================================================
  设计：玻璃态容器 + 大圆角 + 打字机动效 + 淡入
-->

<template>
  <main class="view-section">
    <!-- 打字机标题 -->
    <h2 class="reveal">
      {{ displayText }}<span v-if="isTyping" class="typewriter-cursor">|</span>
    </h2>

    <!-- 轮播容器（带淡入延迟） -->
    <div class="carousel reveal reveal-delay-2" ref="carouselRef">
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
import { useTypewriter } from '../composables/useTypewriter.js'

/**
 * 打字机效果：页面加载后，"今日推荐"四个字逐字打出
 */
const { displayText, isTyping } = useTypewriter({
  text: '今日推荐',
  speed: 60,        // 每字 60ms（切换回来快速打出）
  startDelay: 100   // 100ms 后立即开始
})

// ==================== Props ====================
defineProps({
  images: { type: Array, default: () => [] }
})

// ==================== 轮播图滚动 ====================
const carouselRef = ref(null)
let scrollTimer = null

const startAutoScroll = () => {
  scrollTimer = setInterval(() => {
    if (!carouselRef.value) return
    const container = carouselRef.value
    const scrollAmount = container.clientWidth
    if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
      container.scrollTo({ left: 0, behavior: 'smooth' })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }, 3000)
}

onMounted(() => { startAutoScroll() })
onUnmounted(() => {
  if (scrollTimer) { clearInterval(scrollTimer); scrollTimer = null }
})
</script>

<style scoped>
.view-section h2 {
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: #D7E2EA;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 3px solid #FF6B35;
}

.carousel {
  display: flex;
  overflow-x: auto;
  gap: 12px;
  scroll-snap-type: x mandatory;
  padding: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.carousel-img {
  width: 100%;
  max-height: 250px;
  object-fit: cover;
  scroll-snap-align: start;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  flex-shrink: 0;
}
</style>
