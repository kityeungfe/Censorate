// Domain Floating Box Chrome Extension - Content Script
console.log("[Censorate] Content script loaded for:", window.location.hostname);

// 防止重复注入
if (!window.domainFloatingBoxInjected) {
  window.domainFloatingBoxInjected = true;
  
  // 等待DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFloatingBox);
  } else {
    initFloatingBox();
  }
}

function initFloatingBox() {
  // 获取当前域名
  const currentDomain = window.location.hostname;
  
  // 从存储中获取监控的域名列表
  chrome.storage.sync.get(['domains'], function(result) {
    const watchedDomains = result.domains || [];
    
    // 检查当前域名是否在监控列表中
    const shouldShowFloatingBox = watchedDomains.some(domain => {
      return currentDomain === domain || currentDomain.endsWith('.' + domain);
    });
    
    if (shouldShowFloatingBox) {
      createFloatingBox(currentDomain);
    }
  });
}

function createFloatingBox(domain) {
  // 检查是否已经存在悬浮框
  if (document.getElementById('domain-floating-box')) {
    return;
  }
  
  // 创建悬浮框容器
  const floatingBox = document.createElement('div');
  floatingBox.id = 'domain-floating-box';
  floatingBox.className = 'domain-floating-box';
  
  // 创建悬浮框内容
  floatingBox.innerHTML = `
    <div class="floating-box-header">
      <span class="floating-box-icon">🌐</span>
      <span class="floating-box-title">${domain}</span>
      <div class="floating-box-controls">
        <button class="floating-box-minimize" title="最小化">−</button>
      </div>
    </div>
    <div class="floating-box-content">
      <div class="floating-box-info">
        <p><strong>域名监控激活</strong></p>
        <p>当前域名: <code>${domain}</code></p>
        <p>页面URL: <code>${window.location.href}</code></p>
        <p>加载时间: ${new Date().toLocaleString()}</p>
      </div>
      <div class="floating-box-actions">
        <button class="action-btn" onclick="window.domainFloatingBoxActions.refreshPage()">刷新页面</button>
        <button class="action-btn" onclick="window.domainFloatingBoxActions.copyUrl()">复制URL</button>
      </div>
    </div>
  `;
  
  // 添加到页面
  document.body.appendChild(floatingBox);

  // 设置初始位置（右上角）
  setInitialPosition(floatingBox);

  // 添加事件监听器
  setupFloatingBoxEvents(floatingBox);
  
  // 添加全局操作函数
  window.domainFloatingBoxActions = {
    refreshPage: function() {
      window.location.reload();
    },
    copyUrl: function() {
      navigator.clipboard.writeText(window.location.href).then(function() {
        showNotification('URL已复制到剪贴板');
      }).catch(function() {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('URL已复制到剪贴板');
      });
    }
  };
  
  console.log(`[Censorate] Floating box created for domain: ${domain}`);
}

function setInitialPosition(element) {
  // 等待元素渲染完成后设置位置
  setTimeout(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const elementWidth = element.offsetWidth;
    const elementHeight = element.offsetHeight;

    // 计算右上角位置（距离边缘20px）
    const initialX = viewportWidth - elementWidth - 20;
    const initialY = 20;

    // 确保位置在边界内
    const finalX = Math.max(20, Math.min(viewportWidth - elementWidth - 20, initialX));
    const finalY = Math.max(20, Math.min(viewportHeight - elementHeight - 20, initialY));

    // 设置初始位置
    element.style.transform = `translate(${finalX}px, ${finalY}px)`;

    console.log('[Censorate] Set initial position:', { finalX, finalY, elementWidth, elementHeight });
  }, 100);
}

function setupFloatingBoxEvents(floatingBox) {
  const header = floatingBox.querySelector('.floating-box-header');
  const minimizeBtn = floatingBox.querySelector('.floating-box-minimize');
  const content = floatingBox.querySelector('.floating-box-content');

  // 最小化/展开功能
  let isMinimized = false;
  minimizeBtn.addEventListener('click', function(e) {
    e.stopPropagation(); // 防止触发拖拽

    if (isMinimized) {
      // 展开
      content.style.display = 'block';
      content.style.animation = 'expandContent 0.3s ease-out';
      minimizeBtn.textContent = '−';
      minimizeBtn.title = '最小化';
      floatingBox.classList.remove('minimized');
      isMinimized = false;
    } else {
      // 最小化
      content.style.animation = 'collapseContent 0.3s ease-in';
      setTimeout(() => {
        content.style.display = 'none';
      }, 300);
      minimizeBtn.textContent = '+';
      minimizeBtn.title = '展开';
      floatingBox.classList.add('minimized');
      isMinimized = true;
    }
  });

  // 拖拽功能
  makeDraggable(floatingBox, header, minimizeBtn);
}

function makeDraggable(element, handle, excludeElement) {
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let elementStartX = 0;
  let elementStartY = 0;

  // 设置拖拽样式
  handle.style.cursor = 'grab';

  // 初始化元素位置 - 确保元素有明确的初始位置
  if (!element.style.transform || element.style.transform === 'none') {
    element.style.transform = 'translate(0px, 0px)';
  }

  // 鼠标按下事件
  handle.addEventListener('mousedown', dragStart, { passive: false });

  // 触摸事件支持
  handle.addEventListener('touchstart', dragStart, { passive: false });

  function dragStart(e) {
    // 防止在最小化按钮上开始拖拽
    if (excludeElement && (e.target === excludeElement || excludeElement.contains(e.target))) {
      return;
    }

    // 防止文本选择和默认行为
    e.preventDefault();
    e.stopPropagation();

    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    // 记录鼠标起始位置
    dragStartX = clientX;
    dragStartY = clientY;

    // 获取元素当前的transform位置
    const currentTransform = element.style.transform;
    const transformMatch = currentTransform.match(/translate\((-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px\)/);

    if (transformMatch) {
      elementStartX = parseFloat(transformMatch[1]);
      elementStartY = parseFloat(transformMatch[2]);
    } else {
      elementStartX = 0;
      elementStartY = 0;
    }

    isDragging = true;

    // 添加拖拽状态样式
    element.classList.add('dragging');
    handle.style.cursor = 'grabbing';

    // 禁用过渡动画，确保拖拽时位置立即响应
    element.style.transition = 'none';

    // 添加全局事件监听器
    document.addEventListener('mousemove', drag, { passive: false });
    document.addEventListener('mouseup', dragEnd, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', dragEnd, { passive: false });

    // 防止页面滚动
    document.body.style.overflow = 'hidden';
    document.body.style.userSelect = 'none';
  }

  function drag(e) {
    if (!isDragging) return;

    e.preventDefault();
    e.stopPropagation();

    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

    // 计算鼠标移动的距离
    const deltaX = clientX - dragStartX;
    const deltaY = clientY - dragStartY;

    // 计算新的元素位置
    let newX = elementStartX + deltaX;
    let newY = elementStartY + deltaY;

    // 获取视窗尺寸
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 获取元素尺寸
    const elementWidth = element.offsetWidth;
    const elementHeight = element.offsetHeight;

    // 计算边界限制 - 确保元素完全在视窗内
    const minX = 0; // 左边界：元素左边不能超出屏幕左侧
    const minY = 0; // 上边界：元素顶部不能超出屏幕顶部
    const maxX = viewportWidth - elementWidth; // 右边界：元素右边不能超出屏幕右侧
    const maxY = viewportHeight - elementHeight; // 下边界：元素底部不能超出屏幕底部

    // 应用边界限制
    newX = Math.max(minX, Math.min(maxX, newX));
    newY = Math.max(minY, Math.min(maxY, newY));

    // 立即应用新位置
    element.style.transform = `translate(${newX}px, ${newY}px)`;

    // 调试信息（可选）
    // console.log('[Censorate] Drag position:', { newX, newY, deltaX, deltaY, bounds: { minX, minY, maxX, maxY } });
  }

  function dragEnd(e) {
    if (!isDragging) return;

    e.preventDefault();
    e.stopPropagation();

    isDragging = false;

    // 移除拖拽状态样式
    element.classList.remove('dragging');
    handle.style.cursor = 'grab';

    // 恢复过渡动画
    element.style.transition = 'transform 0.2s ease-out';

    // 移除全局事件监听器
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', dragEnd);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', dragEnd);

    // 恢复页面状态
    document.body.style.overflow = '';
    document.body.style.userSelect = '';

    // 边界吸附效果
    snapToBoundaries();
  }

  function snapToBoundaries() {
    // 获取当前位置
    const currentTransform = element.style.transform;
    const transformMatch = currentTransform.match(/translate\((-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px\)/);

    if (!transformMatch) return;

    let currentX = parseFloat(transformMatch[1]);
    let currentY = parseFloat(transformMatch[2]);

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const elementWidth = element.offsetWidth;
    const elementHeight = element.offsetHeight;

    let newX = currentX;
    let newY = currentY;
    let needsSnap = false;

    const snapMargin = 20; // 吸附边距

    // 计算元素的实际位置（考虑transform）
    const elementLeft = currentX;
    const elementTop = currentY;
    const elementRight = currentX + elementWidth;
    const elementBottom = currentY + elementHeight;

    // 水平边界吸附
    if (elementLeft < snapMargin) {
      // 吸附到左边界
      newX = snapMargin;
      needsSnap = true;
    } else if (elementRight > viewportWidth - snapMargin) {
      // 吸附到右边界
      newX = viewportWidth - elementWidth - snapMargin;
      needsSnap = true;
    }

    // 垂直边界吸附
    if (elementTop < snapMargin) {
      // 吸附到上边界
      newY = snapMargin;
      needsSnap = true;
    } else if (elementBottom > viewportHeight - snapMargin) {
      // 吸附到下边界
      newY = viewportHeight - elementHeight - snapMargin;
      needsSnap = true;
    }

    // 应用吸附位置
    if (needsSnap) {
      element.style.transform = `translate(${newX}px, ${newY}px)`;
      console.log('[Censorate] Snapped to boundaries:', { newX, newY });
    }
  }

  // 窗口大小改变时重新计算位置
  window.addEventListener('resize', function() {
    if (!isDragging) {
      // 确保悬浮框仍在可见范围内
      adjustPositionOnResize();
    }
  });

  function adjustPositionOnResize() {
    const currentTransform = element.style.transform;
    const transformMatch = currentTransform.match(/translate\((-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px\)/);

    if (!transformMatch) return;

    let currentX = parseFloat(transformMatch[1]);
    let currentY = parseFloat(transformMatch[2]);

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const elementWidth = element.offsetWidth;
    const elementHeight = element.offsetHeight;

    // 确保元素完全在新的视窗范围内
    const maxX = viewportWidth - elementWidth - 20;
    const maxY = viewportHeight - elementHeight - 20;

    const newX = Math.max(20, Math.min(maxX, currentX));
    const newY = Math.max(20, Math.min(maxY, currentY));

    if (newX !== currentX || newY !== currentY) {
      element.style.transform = `translate(${newX}px, ${newY}px)`;
      console.log('[Censorate] Adjusted position on resize:', { newX, newY });
    }
  }
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'floating-box-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 10001;
    font-family: Arial, sans-serif;
    font-size: 14px;
    animation: fadeInOut 2s ease-in-out;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 2000);
}

// 监听来自background script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'showFloatingBox') {
    createFloatingBox(request.domain);
  }
});

// 监听存储变化，动态更新悬浮框显示
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace === 'sync' && changes.domains) {
    const currentDomain = window.location.hostname;
    const newDomains = changes.domains.newValue || [];
    const shouldShow = newDomains.some(domain => {
      return currentDomain === domain || currentDomain.endsWith('.' + domain);
    });

    const existingBox = document.getElementById('domain-floating-box');

    if (shouldShow && !existingBox) {
      // 需要显示但不存在，创建悬浮框
      createFloatingBox(currentDomain);
    } else if (!shouldShow && existingBox) {
      // 不需要显示但存在，移除悬浮框
      existingBox.remove();
    }
  }
});
