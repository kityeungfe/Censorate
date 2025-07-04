// Domain Floating Box Chrome Extension - Background Script
console.log("[Censorate] Background script loaded!");

// 存储当前的域名列表
let watchedDomains = [];

// 扩展安装时初始化
chrome.runtime.onInstalled.addListener(function() {
  console.log("[Censorate] Extension installed, initializing...");
  loadWatchedDomains();
});

// 扩展启动时初始化
chrome.runtime.onStartup.addListener(function() {
  console.log("[Censorate] Extension startup, loading domains...");
  loadWatchedDomains();
});

// 监听来自popup的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'updateDomains') {
    watchedDomains = request.domains || [];
    console.log("[Censorate] Updated watched domains:", watchedDomains);
  }
});

// 监听标签页更新事件
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  // 只在页面完全加载后处理
  if (changeInfo.status === 'complete' && tab.url) {
    checkAndInjectFloatingBox(tabId, tab.url);
  }
});

// 监听标签页激活事件
chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function(tab) {
    if (tab.url) {
      checkAndInjectFloatingBox(activeInfo.tabId, tab.url);
    }
  });
});

// 加载监控的域名列表
function loadWatchedDomains() {
  chrome.storage.sync.get(['domains'], function(result) {
    watchedDomains = result.domains || [];
    console.log("[Censorate] Loaded watched domains:", watchedDomains);
  });
}

// 检查URL是否匹配监控的域名，如果匹配则通知content script
function checkAndInjectFloatingBox(tabId, url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // 检查是否匹配任何监控的域名
    const shouldInject = watchedDomains.some(domain => {
      // 支持精确匹配和子域名匹配
      return hostname === domain || hostname.endsWith('.' + domain);
    });

    if (shouldInject) {
      console.log(`[Censorate] Domain matches for floating box: ${hostname}`);

      // 发送消息给content script，让它处理悬浮框的创建
      chrome.tabs.sendMessage(tabId, {
        action: 'showFloatingBox',
        domain: hostname
      }).catch(error => {
        console.log("[Censorate] Message sending failed:", error);
        // 如果消息发送失败，可能是content script还没加载，忽略错误
      });
    }
  } catch (error) {
    console.log("[Censorate] URL parsing error:", error);
  }
}



// 初始化时加载域名列表
loadWatchedDomains();
