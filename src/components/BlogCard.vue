<!--
  =====================================================================
  BlogCard.vue — 带光标跟随阴影的博客卡片
  =====================================================================
  阴影方向跟随光标位置，CSS transition 保证丝滑过渡
-->

<template>
  <div
    class="blog-card card-3d"
    :style="tiltStyle"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <div class="blog-header">
      <h3 class="blog-title">{{ post.title }}</h3>
      <button @click="$emit('delete', post.id)" class="delete-blog-btn">删除</button>
    </div>
    <span class="blog-date">{{ post.date }}</span>
    <p class="blog-content">{{ post.content }}</p>
  </div>
</template>

<script setup>
import { useCardTilt } from '../composables/useCardTilt.js'

defineProps({
  post: { type: Object, required: true }
})

defineEmits(['delete'])

const { tiltStyle, onMouseMove, onMouseLeave } = useCardTilt({ maxTilt: 4 })
</script>

<style scoped>
/**
 * CSS 变量驱动阴影：
 *   --shadow-x, --shadow-y, --shadow-blur, --shadow-opacity
 *   由 JS 通过 card.style.setProperty() 实时更新
 *   transition 平滑过渡变量变化（0.3s）
 */
.blog-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;

  /* 无鼠标时默认无阴影；JS 通过 :style 动态注入 box-shadow */
  /* transition 让阴影和倾斜都平滑过渡 */
  transition: box-shadow 0.35s cubic-bezier(0.22, 0.61, 0.36, 1),
              transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1),
              border-color 0.3s ease;
}

.blog-card:hover {
  border-color: rgba(255, 107, 53, 0.30);
}

.blog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.blog-title {
  margin: 0 0 10px 0;
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 700;
  font-size: 17px;
  color: #D7E2EA;
}

.delete-blog-btn {
  background: rgba(255, 68, 68, 0.15);
  color: rgba(255, 100, 100, 0.85);
  border: 1px solid rgba(255, 68, 68, 0.25);
  padding: 5px 12px;
  font-size: 12px;
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-blog-btn:hover {
  background: rgba(255, 68, 68, 0.30);
  border-color: rgba(255, 68, 68, 0.50);
}

.blog-date {
  display: inline-block;
  background: linear-gradient(135deg, #FF6B35, #E03E3E);
  color: #FFFFFF;
  padding: 4px 12px;
  font-size: 11px;
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 600;
  border-radius: 50px;
  margin-bottom: 14px;
}

.blog-content {
  line-height: 1.7;
  margin: 0;
  color: rgba(215, 226, 234, 0.75);
  font-size: 14px;
  white-space: pre-wrap;
}
</style>
