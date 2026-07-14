<!--
  =====================================================================
  MainNavBar.vue — 顶部一级导航栏
  =====================================================================
  设计：大圆角玻璃态 + 橘红渐变激活态
-->

<template>
  <header class="main-nav-bar reveal">
    <!-- 网站标题 -->
    <h1>MAYE'S WORLD</h1>

    <!-- 导航按钮组 -->
    <div class="main-nav-links">
      <button
        v-for="item in navItems"
        :key="item.key"
        :class="{ active: currentTab === item.key }"
        @click="$emit('tab-change', item.key)"
      >
        {{ item.label }}
      </button>
    </div>
  </header>
</template>

<script setup>
defineProps({
  currentTab: { type: String, default: 'menu' }
})

defineEmits(['tab-change'])

const navItems = [
  { key: 'menu',   label: '马也菜单', icon: '' },
  { key: 'legend', label: '马也传奇', icon: '' },
  { key: 'recipe', label: 'AI厨房',  icon: '' },
  { key: 'intro',  label: '马也简介', icon: '' }
]
</script>

<style scoped>
/**
 * 【设计语言】暗黑 + 玻璃态面板 + 橘红渐变
 * 导航栏：毛玻璃效果，按钮为大圆角胶囊形
 */

/* ---------- 导航栏整体 ---------- */
.main-nav-bar {
  display: flex;
  justify-content: space-between;   /* 标题靠左，按钮靠右 */
  align-items: center;
  padding: 14px 18px;
  margin-bottom: 24px;
  /* ---- 玻璃态面板 ---- */
  background: rgba(255, 255, 255, 0.04);     /* 极淡白底 → 玻璃感 */
  border: 1px solid rgba(255, 255, 255, 0.08); /* 半透明边框 */
  border-radius: 20px;                         /* 大圆角 */
  backdrop-filter: blur(12px);                  /* 毛玻璃模糊 */
  -webkit-backdrop-filter: blur(12px);          /* Safari 兼容 */
}

/* ---------- 标题 ---------- */
.main-nav-bar h1 {
  margin: 0;
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 900;                  /* 极粗 */
  font-size: 22px;
  letter-spacing: -0.5px;
  color: #D7E2EA;                    /* 迷雾白 */
}

/* ---------- 导航按钮（默认态）---------- */
.main-nav-links button {
  background: rgba(255, 255, 255, 0.04);       /* 玻璃底 */
  border: 1px solid rgba(255, 255, 255, 0.10); /* 半透白边框 */
  color: rgba(215, 226, 234, 0.70);             /* 迷雾白 70% 透明度 */
  padding: 9px 16px;
  margin-left: 6px;
  cursor: pointer;
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 500;
  font-size: 13px;
  border-radius: 50px;              /* 完全胶囊形 */
  transition: all 0.25s ease;        /* 平滑过渡 */
}

/* ---------- 悬停态 ---------- */
.main-nav-links button:hover {
  border-color: rgba(255, 255, 255, 0.25);
  color: #D7E2EA;
  background: rgba(255, 255, 255, 0.08);
}

/* ---------- 激活态（当前选中的标签）---------- */
.main-nav-links button.active {
  background: linear-gradient(135deg, #FF6B35, #E03E3E);
  /* 橘红渐变 → 视觉焦点 */
  border-color: transparent;
  color: #FFFFFF;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(224, 62, 62, 0.35);
  /* 橘红发光 → 让激活的按钮"亮起来" */
}
</style>
