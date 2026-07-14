<!--
  =====================================================================
  MenuGrid.vue — 菜品菜单网格组件
  =====================================================================
  设计：玻璃态卡片 + 大圆角 + 橘红渐变按钮
-->

<template>
  <main class="view-section">
    <h2>主厨菜单</h2>

    <div class="menu-grid">
      <div
        v-for="(item, index) in items"
        :key="item.id"
        :class="['food-card', 'reveal', 'card-3d', `reveal-delay-${(index % 5) + 1}`]"
      >
        <!-- 菜品图片 -->
        <img :src="item.image" :alt="item.name" class="food-img" />

        <!-- 菜品名称 -->
        <div class="food-info">
          <span class="name">{{ item.name }}</span>
        </div>

        <!-- "想吃这个"按钮 → 橘红渐变 -->
        <button class="add-btn" @click="$emit('add-to-cart', item)">
          想吃这个！
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] }
})

defineEmits(['add-to-cart'])
</script>

<style scoped>
/* ---------- 标题 ---------- */
.view-section h2 {
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: #D7E2EA;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 3px solid #FF6B35;
}

/* ---------- 2 列网格 ---------- */
.menu-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

/* ---------- 菜品卡片（玻璃态）---------- */
.food-card {
  background: rgba(255, 255, 255, 0.03);       /* 玻璃底 */
  border: 1px solid rgba(255, 255, 255, 0.08); /* 半透边框 */
  border-radius: 16px;                           /* 大圆角 */
  overflow: hidden;                              /* 图片不超出圆角 */
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

/* 悬停微升 */
.food-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 107, 53, 0.35);        /* 橘色边框提示 */
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

/* ---------- 菜品图片 ---------- */
.food-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

/* ---------- 菜品名称 ---------- */
.food-info {
  display: flex;
  justify-content: center;
  padding: 10px 8px;
}

.name {
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #D7E2EA;
}

/* ---------- "想吃这个"按钮（橘红渐变）---------- */
.add-btn {
  background: linear-gradient(135deg, #FF6B35, #E03E3E);
  color: #FFFFFF;
  border: none;
  padding: 10px;
  cursor: pointer;
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.25s ease;
}

/* 按钮悬停 → 提亮 */
.add-btn:hover {
  background: linear-gradient(135deg, #FF8050, #E85555);
  box-shadow: 0 4px 18px rgba(224, 62, 62, 0.40);
}
</style>
