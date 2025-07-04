// Hello World Chrome Extension - Popup Script
console.log("Hello Extensions popup loaded!");

// 当DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM loaded, initializing popup...");
  
  // 获取按钮元素
  const clickButton = document.getElementById('clickMe');
  
  if (clickButton) {
    // 添加点击事件监听器
    clickButton.addEventListener('click', function() {
      console.log("Button clicked!");
      
      // 创建一些有趣的交互效果
      const messages = [
        "🎉 太棒了！",
        "✨ 你点击了按钮！",
        "🚀 Chrome扩展正在工作！",
        "💫 Hello World!",
        "🎈 继续探索吧！"
      ];
      
      // 随机选择一个消息
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      // 更新按钮文本
      const originalText = clickButton.textContent;
      clickButton.textContent = randomMessage;
      
      // 添加一些视觉效果
      clickButton.style.transform = 'scale(1.1)';
      clickButton.style.background = 'rgba(255,255,255,0.4)';
      
      // 2秒后恢复原始状态
      setTimeout(() => {
        clickButton.textContent = originalText;
        clickButton.style.transform = 'translateY(-2px)';
        clickButton.style.background = 'rgba(255,255,255,0.2)';
      }, 2000);
      
      // 在控制台输出一些调试信息
      console.log(`User clicked button at: ${new Date().toLocaleTimeString()}`);
      console.log(`Random message shown: ${randomMessage}`);
    });
  }
  
  // 添加一些初始化的欢迎信息
  console.log("🎯 Chrome Extension initialized successfully!");
  console.log("📝 Extension name: Hello Extensions");
  console.log("🔧 Manifest version: 3");
  console.log("💡 Ready for user interaction!");
});

// 添加一个简单的键盘事件监听器
document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    const clickButton = document.getElementById('clickMe');
    if (clickButton) {
      clickButton.click();
    }
  }
});

// 当popup关闭时的清理工作
window.addEventListener('beforeunload', function() {
  console.log("Popup is closing...");
});
