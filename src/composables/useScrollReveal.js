/**
 * =====================================================================
 * useScrollReveal.js — 滚动淡入动画引擎
 * =====================================================================
 *
 * 【功能说明】
 *   当页面上的元素滚动进入可视区域时，自动触发淡入 + 上移动画。
 *   基于 IntersectionObserver API，性能高、不卡顿。
 *
 * 【使用方式】
 *   在组件中这样用：
 *     import { useScrollReveal } from '../composables/useScrollReveal.js'
 *     const { observe } = useScrollReveal()
 *     然后在模板中给元素加 ref，再 observe(el)
 *
 *   或者更简单：在模板中给任何元素加上 class="reveal"，再在
 *   onMounted 中调用 observeAll()，自动扫描所有 .reveal 元素。
 *
 * 【动画效果】
 *   元素从下方 30px 处淡入（opacity 0→1, translateY 30→0）
 *   每个元素有 0.1s 的延迟渐变，产生"依次出现"的效果
 */

// ==================== 核心函数 ====================

/**
 * useScrollReveal —— 返回观察器的控制方法
 *
 * 原理：
 *   IntersectionObserver（交叉观察器）是浏览器内置 API，
 *   它告诉你"某个元素是否进入了屏幕可见范围"。
 *   我们利用这个机制，在元素进入屏幕时给它添加 .is-revealed 类，
 *   CSS 中的过渡动画自动触发。
 *
 * 默认配置：
 *   threshold: 0.1  → 元素露出 10% 就触发（不用全部露出）
 *   rootMargin: -20px → 提前 20px 触发（元素还没完全进入就开始动画）
 */
export function useScrollReveal(options = {}) {

  // 合并默认配置和用户自定义配置
  const config = {
    threshold: 0.1,        // 元素露出 10% 触发
    rootMargin: '-20px 0px', // 提前 20px 触发
    ...options
  }

  /**
   * observer：IntersectionObserver 实例
   * 创建时传入回调函数和配置
   */
  let observer = null

  /**
   * ensureObserver —— 确保观察器已创建（惰性初始化）
   * 第一次调用 observe() 时才创建，避免不必要的开销
   */
  const ensureObserver = () => {
    if (observer) return // 已经创建过，直接返回

    // 创建 IntersectionObserver
    observer = new IntersectionObserver((entries) => {
      // entries 是所有被观察元素的交叉状态数组
      entries.forEach(entry => {
        // entry.isIntersecting = true → 元素进入了可视区域
        if (entry.isIntersecting) {
          // 给元素添加 .is-revealed 类 → CSS 动画触发
          entry.target.classList.add('is-revealed')
          // 动画只需要触发一次，触发后停止观察这个元素
          observer.unobserve(entry.target)
        }
      })
    }, {
      threshold: config.threshold,
      rootMargin: config.rootMargin
    })
  }

  /**
   * observe —— 开始观察一个元素
   *
   * @param {HTMLElement} el - 要观察的 DOM 元素
   *
   * 用法：const { observe } = useScrollReveal()
   *       observe(document.querySelector('.my-card'))
   */
  const observe = (el) => {
    if (!el) return
    ensureObserver()
    observer.observe(el)
  }

  /**
   * observeAll —— 自动扫描并观察所有带 .reveal 类的元素
   *
   * @param {HTMLElement} root - 搜索的根元素，默认整个 document
   *
   * 这是最方便的方法：
   *   1. 在模板中给想要动画的元素加上 class="reveal"
   *   2. 在 onMounted 中调用 observeAll()
   *   3. 完成！
   */
  const observeAll = (root = document) => {
    ensureObserver()
    const elements = root.querySelectorAll('.reveal')
    elements.forEach(el => observer.observe(el))
  }

  /**
   * cleanup —— 销毁观察器（组件卸载时调用，防止内存泄漏）
   */
  const cleanup = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  // 返回对外暴露的方法
  return { observe, observeAll, cleanup }
}
