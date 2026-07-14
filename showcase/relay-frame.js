(function(){
  var nav = document.createElement('div');
  nav.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;display:flex;align-items:center;justify-content:space-between;padding:12px 24px;background:rgba(10,10,10,0.82);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid rgba(201,169,110,0.12);font-family:"Noto Sans SC",system-ui,sans-serif;';
  nav.innerHTML = '<a href="../index.html" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:#ECE8DF;font-family:serif;font-size:14px;letter-spacing:2px;"><span style="color:#C9A96E;font-size:16px;">◂</span> RELAY <span style="color:#756F64;font-size:11px;font-family:monospace;">· 接力</span></a>'+
    '<div style="display:flex;gap:20px;align-items:center;">'+
    '<a href="../showcase.html" style="color:#8A7448;text-decoration:none;font-size:11px;letter-spacing:2px;font-family:monospace;">SHOWCASE</a>'+
    '</div>';
  document.body.prepend(nav);
  document.body.style.paddingTop = '52px';
})();
