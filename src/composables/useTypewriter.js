/**
 * =====================================================================
 * useTypewriter.js — 打字机文字动画引擎
 * =====================================================================
 *
 * 【功能说明】
 *   让文字像打字机一样逐字显示出来，模拟"正在输入"的效果。
 *   支持自定义打字速度、闪烁光标、循环播放。
 *
 * 【使用方式】
 *   import { useTypewriter } from '../composables/useTypewriter.js'
 *
 *   const { displayText, isTyping, startTyping } = useTypewriter({
 *     text: 'Hello World',   // 要显示的文字
 *     speed: 80,              // 每个字的打字速度（毫秒）
 *     showCursor: true        // 是否显示闪烁光标
 *   })
 *
 *   在模板中：
 *   <span>{{ displayText }}</span><span v-if="isTyping" class="cursor">|</span>
 */

import { ref } from 'vue'

/**
 * useTypewriter —— 打字机效果
 *
 * @param {Object} options - 配置选项
 * @param {string} options.text       - 要逐字显示的文字
 * @param {number} options.speed      - 每个字符的打字速度（ms），默认 80
 * @param {boolean} options.showCursor - 是否显示光标，默认 true
 * @param {boolean} options.autoStart  - 是否自动开始，默认 true
 * @param {number} options.startDelay  - 开始前的延迟（ms），默认 300
 *
 * @returns {Object} { displayText, isTyping, startTyping }
 *
 * 原理：
 *   使用 setInterval 每隔 speed 毫秒从原始文字中多取一个字符，
 *   追加到 displayText 后面，直到文字全部显示完毕。
 */
export function useTypewriter(options = {}) {

  // ==================== 配置 ====================
  const {
    text = '',           // 完整文字
    speed = 80,          // 每字间隔
    showCursor = true,   // 光标开关
    autoStart = true,    // 自动开始
    startDelay = 300     // 开始延迟
  } = options

  // ==================== 响应式状态 ====================

  /** displayText：当前已经"打出来"的文字 */
  const displayText = ref('')

  /** isTyping：是否正在打字中（光标闪烁用） */
  const isTyping = ref(false)

  // 定时器 ID，用于清除
  let timer = null
  let delayTimer = null

  // ==================== 核心方法 ====================

  /**
   * startTyping —— 开始打字动画
   *
   * 逻辑：
   *   1. 等待 startDelay 毫秒
   *   2. 每 speed 毫秒从 text 中取一个字符追加到 displayText
   *   3. 全部打完后设置 isTyping = false，关闭光标
   */
  const startTyping = () => {
    // 先清理之前的定时器
    stopTyping()

    // 从第一个字符重新开始
    displayText.value = ''
    let index = 0           // 当前字符位置（从 0 到 text.length）

    // 延迟后开始
    delayTimer = setTimeout(() => {
      isTyping.value = true // 开始打字 → 显示光标

      timer = setInterval(() => {
        if (index < text.length) {
          // 取出第 index 个字符，追加到已显示的文字后面
          displayText.value += text[index]
          index++
        } else {
          // 文字全部显示完毕
          clearInterval(timer)
          timer = null
          isTyping.value = false // 打完 → 隐藏光标
        }
      }, speed)
    }, startDelay)
  }

  /**
   * stopTyping —— 立即停止打字动画
   */
  const stopTyping = () => {
    if (delayTimer) {
      clearTimeout(delayTimer)
      delayTimer = null
    }
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    isTyping.value = false
  }

  // ==================== 自动开始 ====================
  if (autoStart && text) {
    startTyping()
  }

  // ==================== 返回 ====================
  return {
    displayText,   // 当前显示的文字（模板中绑定 {{ displayText }}）
    isTyping,      // 是否打字中
    startTyping,   // 手动重新开始
    stopTyping     // 手动停止
  }
}
