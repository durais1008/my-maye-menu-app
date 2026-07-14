<!--
  =====================================================================
  MusicFloatingBtn.vue — 音乐播放悬浮按钮
  =====================================================================
  设计：玻璃态圆形按钮 + 橘红渐变激活态旋转
-->

<template>
  <div
    class="music-float-btn"
    :class="{ 'is-playing': isPlaying }"
    @click="toggleMusic"
  >
    💿
  </div>
  <audio ref="audioRef" loop src="/music/bgm.mp3"></audio>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const audioRef = ref(null)
const isPlaying = ref(false)

const toggleMusic = () => {
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play()
  }
  isPlaying.value = !isPlaying.value
}

onMounted(() => {
  const autoPlayBgm = () => {
    if (!isPlaying.value && audioRef.value) {
      audioRef.value.play().then(() => {
        isPlaying.value = true
      }).catch(err => {
        console.log("浏览器拦截自动播放:", err)
      })
    }
    document.removeEventListener('click', autoPlayBgm)
    document.removeEventListener('touchstart', autoPlayBgm)
  }
  document.addEventListener('click', autoPlayBgm)
  document.addEventListener('touchstart', autoPlayBgm)
})
</script>

<style scoped>
/* ---------- 按钮基础（玻璃态圆形）---------- */
.music-float-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  width: clamp(44px, 8vw, 60px);
  height: clamp(44px, 8vw, 60px);
  font-size: clamp(22px, 4vw, 30px);
  border-radius: 50%;                          /* 正圆形 */
  /* 玻璃态 */
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.40);
  cursor: pointer;
  transition: all 0.3s ease;
}

/* 悬停 */
.music-float-btn:hover {
  transform: scale(1.10);
  border-color: rgba(255, 107, 53, 0.50);
  box-shadow: 0 6px 28px rgba(0, 0, 0, 0.55);
}

/* 旋转动画 */
@keyframes spinRecord {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 播放态 → 橘色光晕 + 旋转 */
.music-float-btn.is-playing {
  animation: spinRecord 3s linear infinite;
  border-color: rgba(255, 107, 53, 0.60);
  box-shadow: 0 0 28px rgba(255, 107, 53, 0.45);
  background: rgba(255, 107, 53, 0.08);
}
</style>
