<!--
  =====================================================================
  MainNavBar.vue — 顶部一级导航栏
  =====================================================================
  功能：显示网站标题 "MAYE'S WORLD" 和三个一级标签按钮
  - 马也菜单（menu）
  - 马也传奇（legend）
  - 马也简介（intro）
  点击按钮会通过 emit 事件通知父组件切换页面

  使用方式：
    <MainNavBar :current-tab="currentMainTab" @tab-change="currentMainTab = $event" />

  Props（父传子）：
    currentTab — 当前选中的标签名（用于高亮显示）

  Emits（子传父）：
    tab-change — 用户点击了某个标签，把标签名传给父组件
-->

<template>
  <!--
    顶部导航栏容器
    <header> 是 HTML5 语义化标签，表示页面的头部区域
  -->
  <header class="main-nav-bar">
    <!-- 网站标题 -->
    <h1>MAYE'S WORLD</h1>

    <!-- 导航按钮组 -->
    <div class="main-nav-links">
      <!--
        按钮循环：用 v-for 遍历 navItems 数组，批量生成三个导航按钮
        这样如果以后要增加/删除标签，只需要修改 navItems 数组即可
      -->
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
/**
 * ==================== Props 定义（父组件传入的数据）====================
 *
 * defineProps：Vue 3 的宏函数，声明这个组件接收的参数
 * currentTab：当前激活的标签名（'menu' / 'legend' / 'intro'）
 * type: String → 类型是字符串
 * default: 'menu' → 如果不传，默认为 'menu'
 */
defineProps({
  currentTab: {
    type: String,      // 数据类型：字符串
    default: 'menu'    // 默认值：默认显示"马也菜单"
  }
})

/**
 * ==================== Emits 定义（子组件向父组件发送事件）====================
 *
 * defineEmits：Vue 3 的宏函数，声明这个组件可以发出哪些事件
 * 'tab-change'：当用户点击导航按钮时，把这个事件发给父组件
 * 父组件用 @tab-change="处理函数" 来接收
 */
defineEmits(['tab-change'])

/**
 * ==================== 导航配置数据 ====================
 *
 * navItems：导航按钮的配置数组
 * 每个按钮有三个属性：
 *   key   → 按钮唯一标识，对应标签名，传给父组件做切换判断
 *   label → 按钮上显示的文字
 *   icon  → 按钮前的图标（暂时没用到，但保留以后扩展）
 *
 * 这样设计的好处：如果要新增一个标签，只需在数组里加一行即可，
 * 模板会自动生成对应的按钮
 */
const navItems = [
  { key: 'menu',   label: '马也菜单', icon: '' },
  { key: 'legend', label: '马也传奇', icon: '' },
  { key: 'intro',  label: '马也简介', icon: '' }
]
</script>

<style scoped>
/**
 * 【模块样式】
 * 极简黑白风格
 * border-bottom: 4px solid #000  → 底部 4px 粗黑线，分隔导航和内容
 */

/* ---------- 导航栏整体布局 ---------- */
.main-nav-bar {
  display: flex;                    /* 弹性布局 */
  justify-content: space-between;  /* 标题靠左，按钮组靠右 */
  align-items: center;             /* 垂直居中对齐 */
  border-bottom: 4px solid #000;  /* 底部粗黑分隔线 */
  padding-bottom: 15px;
  margin-bottom: 20px;
}

/* ---------- 网站标题 ---------- */
.main-nav-bar h1 {
  margin: 0;                       /* 去掉默认外边距 */
  font-weight: 900;                /* 极粗字体 */
  letter-spacing: -1px;            /* 字间距紧缩 1px，更紧凑有力 */
  font-size: 24px;
}

/* ---------- 导航按钮基础样式 ---------- */
.main-nav-links button {
  background: none;                /* 无背景色 */
  border: 2px solid #000;         /* 2px 黑色实线边框 */
  padding: 8px 12px;
  margin-left: 5px;               /* 按钮之间的间距 */
  cursor: pointer;                 /* 鼠标变手指 */
  font-weight: bold;               /* 加粗 */
  border-radius: 4px;              /* 微微圆角 */
  transition: all 0.2s;            /* 所有变化 0.2 秒平滑过渡 */
}

/* ---------- 按钮激活状态（当前选中的标签）---------- */
.main-nav-links button.active {
  background: #000;                /* 黑底 */
  color: #fff;                     /* 白字 */
  transform: translateY(-2px);     /* 向上移 2px → "浮起来"的立体效果 */
  box-shadow: 0 4px 0px #000;     /* 底部 4px 纯黑阴影 → 粗犷的立体感 */
}
</style>
