<!--
  =====================================================================
  MusicFloatingBtn.vue — 音乐播放悬浮按钮
  =====================================================================
  功能：右下角一个圆形的 CD 按钮，点击切换背景音乐播放/暂停
  播放时按钮会旋转（模拟唱片转动效果）
  由于浏览器禁止自动播放，组件会在用户首次点击/触摸页面时启动音乐

  使用方式：
    <MusicFloatingBtn />
  无需传任何参数，独立运行
-->

<template>
  <!--
    音乐悬浮按钮
    :class 动态绑定：
      - 默认一直是 'music-float-btn'
      - 当 isPlaying 为 true 时，额外添加 'is-playing' → 触发 CSS 旋转动画
    @click 点击事件：调用 toggleMusic 方法切换播放/暂停
  -->
  <div
    class="music-float-btn"
    :class="{ 'is-playing': isPlaying }"
    @click="toggleMusic"
  >
    💿
  </div>

  <!--
    <audio> 标签：HTML5 音频播放器
    ref="audioRef"    → 在 JS 中通过 audioRef 获取这个元素，用于控制播放
    loop              → 循环播放（放完自动从头开始）
    src="/music/bgm.mp3" → 音乐文件路径（放在 public/music/ 目录下）
    这个标签在页面上不可见，纯粹是后台播放器
  -->
  <audio ref="audioRef" loop src="/music/bgm.mp3"></audio>
</template>

<script setup>
/**
 * ==================== 导入依赖 ====================
 * ref        → 创建响应式变量
 * onMounted  → 组件挂载完成后的生命周期钩子（类似"页面加载完毕"）
 */
import { ref, onMounted } from 'vue'

// ==================== 音乐控制状态 ====================

/**
 * audioRef：关联模板中 <audio ref="audioRef"> 元素
 * 初始值为 null，组件挂载后自动填充为 <audio> DOM 元素
 * 通过 audioRef.value.play() / .pause() 控制播放
 */
const audioRef = ref(null)

/**
 * isPlaying：当前是否正在播放音乐
 * 初始值 false（暂停状态）
 * 用于切换按钮样式（旋转动画）和切换播放/暂停逻辑
 */
const isPlaying = ref(false)

// ==================== 播放/暂停切换 ====================

/**
 * toggleMusic：切换音乐播放状态
 * 如果正在播放 → 暂停
 * 如果已暂停   → 播放
 * 最后翻转 isPlaying 的值（true 变 false，false 变 true）
 */
const toggleMusic = () => {
  if (isPlaying.value) {
    audioRef.value.pause()   // 暂停音频播放
  } else {
    audioRef.value.play()    // 开始音频播放
  }
  isPlaying.value = !isPlaying.value  // 翻转状态（!表示"取反"）
}

// ==================== 生命周期钩子 ====================

/**
 * onMounted：组件挂载到 DOM 后执行
 * 这里处理浏览器"自动播放限制"问题：
 * 现代浏览器不允许网页在用户没有任何操作的情况下自动播放音频，
 * 所以我们在用户第一次点击或触摸页面时，才开始播放音乐
 */
onMounted(() => {
  /**
   * autoPlayBgm：等待用户首次交互后自动播放背景音乐
   * 监听到 click（鼠标点击）或 touchstart（手指触摸）后执行
   * 播放成功后移除这两个事件监听器（只需要触发一次）
   */
  const autoPlayBgm = () => {
    // 如果音乐还没播放 且 audio 元素存在
    if (!isPlaying.value && audioRef.value) {
      // .play() 返回一个 Promise（异步操作），浏览器可能会拒绝
      audioRef.value.play().then(() => {
        isPlaying.value = true  // 播放成功，更新状态
      }).catch(err => {
        // 如果浏览器还是拦截了，就在控制台打印日志，不影响正常使用
        console.log("浏览器拦截自动播放:", err)
      })
    }
    // 无论成功与否，移除事件监听器（只需要触发一次就够了）
    document.removeEventListener('click', autoPlayBgm)
    document.removeEventListener('touchstart', autoPlayBgm)
  }

  // 在 document（整个页面）上绑定事件监听器
  document.addEventListener('click', autoPlayBgm)       // 监听鼠标点击
  document.addEventListener('touchstart', autoPlayBgm)  // 监听触摸（手机端）
})
</script>

<style scoped>
/**
 * 【模块样式说明】
 * 这个组件的设计语言：极简黑白 + 粗犷手绘感
 *
 * position: fixed → 相对于浏览器窗口固定定位，不随滚动条移动
 * z-index: 9999  → 确保按钮在所有内容的最上层
 */

/* ---------- 按钮基础样式 ---------- */
.music-float-btn {
  position: fixed;           /* 固定定位，不随页面滚动 */
  bottom: 20px;              /* 距离窗口底部 20px */
  right: 20px;               /* 距离窗口右侧 20px */
  z-index: 9999;             /* 层级最高，确保不被其他元素遮挡 */
  width: clamp(40px, 8vw, 60px);   /* 响应式宽度：最小40px，最大60px，首选屏幕宽度8% */
  height: clamp(40px, 8vw, 60px);  /* 响应式高度，和宽度保持一致 */
  font-size: clamp(20px, 4vw, 30px); /* 响应式字体大小 */
  border-radius: 50%;        /* 50% 圆角 = 正圆形 */
  background-color: rgba(255, 255, 255, 0.9);  /* 半透明白色背景 */
  display: flex;
  justify-content: center;   /* emoji 水平居中 */
  align-items: center;       /* emoji 垂直居中 */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);  /* 柔和的阴影 */
  cursor: pointer;           /* 鼠标悬停时变成手指形状 */
  transition: all 0.3s ease; /* 所有属性变化都平滑过渡 0.3 秒 */
}

/* ---------- 按钮悬停效果 ---------- */
.music-float-btn:hover {
  transform: scale(1.1);     /* 放大到 110% */
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4); /* 阴影变大变深 */
}

/* ---------- 旋转动画定义 ---------- */
@keyframes spinRecord {
  0%   { transform: rotate(0deg); }    /* 动画开始：0 度 */
  100% { transform: rotate(360deg); }  /* 动画结束：360 度（一圈） */
}

/* ---------- 播放状态：应用旋转动画 ---------- */
.music-float-btn.is-playing {
  animation: spinRecord 3s linear infinite;
  /* 3s      → 转一圈用 3 秒 */
  /* linear  → 匀速旋转 */
  /* infinite → 无限循环 */
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5); /* 播放时发光效果 */
}
</style>
