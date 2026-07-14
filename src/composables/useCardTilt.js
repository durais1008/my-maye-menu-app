/**
 * =====================================================================
 * useCardTilt.js — 3D 悬浮倾斜 + 动态阴影
 * =====================================================================
 *
 * 【效果】
 *   光标在右上角 → 左下角翘起  + 阴影偏左下（光从右上照来）
 *   光标在左下角 → 右上角翘起  + 阴影偏右上（光从左下照来）
 *
 * 【原理】
 *   rotateX / rotateY 旋转卡片，perspective 提供 3D 深度。
 *   阴影和倾斜方向一致，视觉不自相矛盾。
 */

import { ref } from 'vue'

export function useCardTilt(options = {}) {
  const {
    maxTilt = 8,       // 最大倾斜角度（度）
    maxOffset = 28,    // 阴影最大偏移（px）
    maxBlur = 55,      // 阴影最大模糊（px）
    baseOpacity = 0.06, // 默认阴影透明度
    maxOpacity = 0.32   // 最大阴影透明度
  } = options

  const defaultStyle = {
    boxShadow: `0 4px 20px rgba(0, 0, 0, ${baseOpacity})`,
    transform: 'perspective(600px) rotateX(0deg) rotateY(0deg)'
  }

  const tiltStyle = ref({ ...defaultStyle })

  let rafId = null

  const onMouseMove = (e) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()

    // 光标相对位置（0 ~ 1）
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top)  / rect.height

    // 光标相对中心的比例（-1 ~ 1）
    const rx = (px - 0.5) * 2   // -1左 ~ 1右
    const ry = (py - 0.5) * 2   // -1上 ~ 1下

    // ====== 旋转 ======
    // 光标在右边(rx>0) → 右边向后倾 → rotateY > 0
    // 光标在上边(ry<0) → 上边向后倾 → rotateX > 0
    const rotateY =  rx * maxTilt   // 左右倾斜
    const rotateX = -ry * maxTilt   // 上下倾斜（取反：光标上→上边后倾）

    // ====== 阴影 ======
    // 阴影与倾斜同向：右边翘起(rotateY>0) → 阴影偏右(ox>0)
    const ox = rx * maxOffset
    const oy = ry * maxOffset

    // ====== 强度 ======
    const dist = Math.sqrt(rx * rx + ry * ry)
    const op = baseOpacity + dist * (maxOpacity - baseOpacity)
    const bl = 16 + dist * (maxBlur - 16)

    if (rafId) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => {
      tiltStyle.value = {
        boxShadow: `${ox}px ${oy}px ${bl}px rgba(0, 0, 0, ${op.toFixed(3)})`,
        transform: `perspective(600px) rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg)`
      }
      rafId = null
    })
  }

  const onMouseLeave = () => {
    if (rafId) cancelAnimationFrame(rafId)
    tiltStyle.value = { ...defaultStyle }
    rafId = null
  }

  return { tiltStyle, onMouseMove, onMouseLeave }
}
