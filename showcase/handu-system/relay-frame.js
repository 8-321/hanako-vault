/* RELAY 导航条 — 注入到每个展示项目顶部 */
(function(){
  var nav = document.createElement('div');
  nav.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;display:flex;align-items:center;justify-content:space-between;padding:10px 20px;background:rgba(10,10,10,0.75);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(201,169,110,0.15);font-family:"Noto Sans SC",system-ui,sans-serif;';
  nav.innerHTML = '<a href="../index.html" style="display:flex;align-items:center;gap:8px;text-decoration:none;color:#ECE8DF;font-size:13px;letter-spacing:2px;">'+
    '<span style="color:#C9A96E;">◂</span> RELAY · 接力'+
    '</a>'+
    '<a href="../showcase.html" style="color:#8A7448;text-decoration:none;font-size:11px;letter-spacing:2px;font-family:"JetBrains Mono",monospace;">SHOWCASE</a>';
  document.body.appendChild(nav);
  document.body.style.paddingTop = '48px';
})();
