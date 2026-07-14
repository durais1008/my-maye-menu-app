<!--
  =====================================================================
  IntroSection.vue — 马也简介模块（占位页面）
  =====================================================================
  功能：显示"正在施工中"的占位页面
  后续可以在这个文件里编写自我介绍的内容

  使用方式：
    <IntroSection />
  无需传 Props，独立使用
-->

<template>
  <div class="view-section">
    <h2>🚧 马也简介</h2>

    <!-- 占位容器：虚线边框 + 居中文字，表示模块还在开发中 -->
    <div class="placeholder-box">
      <p>自我介绍模块正在施工中，暂时搁置...</p>
      <p>敬请期待！</p>
    </div>
  </div>
</template>

<script setup>
/**
 * 目前没有交互逻辑，组件只负责展示
 * 以后要加内容时，在这里写 JavaScript 逻辑
 */
</script>

<style scoped>
/* ---------- 占位容器 ---------- */
.placeholder-box {
  text-align: center;            /* 文字居中 */
  padding: 50px;                 /* 大内边距，显得页面有内容 */
  border: 2px dashed #999;      /* 灰色虚线边框 → "正在建设中"的视觉语言 */
  color: #666;                   /* 灰色文字 */
  font-weight: bold;
}
</style>
