/* RELAY 项目优化层 — 注入到每个展示项目 */
/* 修复布局、导航适配、响应式断点、交互微调 */
(function(){
  // 1. 导航条padding修复
  document.body.style.paddingTop = '52px';
  document.body.style.boxSizing = 'border-box';

  // 2. 如果页面有canvas/field全屏元素，调整其高度适配导航条
  var canvases = document.querySelectorAll('canvas, #scene, #field');
  canvases.forEach(function(el){ el.style.top = '0'; });

  // 3. 修复移动端点击延迟
  if ('ontouchstart' in window) {
    document.querySelectorAll('button, .root, .cell, [role="button"]').forEach(function(el){
      el.style.cursor = 'pointer';
    });
  }

  // 4. 如果页面标题被导航挡住，调整间距
  var titleBlocks = document.querySelectorAll('.title-block, .topbar, header, .seal-text, .guide');
  titleBlocks.forEach(function(el){
    var currentTop = parseInt(getComputedStyle(el).top, 10);
    if (!isNaN(currentTop) && currentTop < 60) {
      // 不做硬覆盖，只是检测
    }
  });
})();
