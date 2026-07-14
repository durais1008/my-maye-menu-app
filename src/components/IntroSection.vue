<!--
  =====================================================================
  IntroSection.vue — 马也简介模块（占位页面）
  =====================================================================
  设计：玻璃态虚线框 + 大圆角
-->

<template>
  <div class="view-section">
    <h2>🚧 马也简介</h2>

    <div class="placeholder-box">
      <p>自我介绍模块正在施工中，暂时搁置...</p>
      <p>敬请期待！</p>
    </div>
  </div>
</template>

<script setup>
// 暂无逻辑，后续开发
</script>

<style scoped>
/* ---------- 标题 ---------- */
.view-section h2 {
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: #D7E2EA;
  margin-bottom: 20px;
  padding-left: 12px;
  border-left: 3px solid #FF6B35;
}

/* ---------- 占位容器（玻璃态虚线框）---------- */
.placeholder-box {
  text-align: center;
  padding: 50px 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.15);  /* 虚线 → 施工感 */
  border-radius: 20px;
}

.placeholder-box p {
  color: rgba(215, 226, 234, 0.40);
  font-size: 15px;
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 400;
  margin: 6px 0;
}
</style>
