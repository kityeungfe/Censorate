// Domain Floating Box Chrome Extension - Popup Script
console.log("[Censorate] Domain Floating Box popup loaded!");

// 当DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  console.log("[Censorate] DOM loaded, initializing popup...");

  // 获取DOM元素
  const domainInput = document.getElementById('domainInput');
  const addDomainBtn = document.getElementById('addDomain');
  const domainList = document.getElementById('domainList');

  // 加载并显示已保存的域名
  loadDomains();

  // 添加域名按钮点击事件
  if (addDomainBtn) {
    addDomainBtn.addEventListener('click', addDomain);
  }

  // 输入框回车事件
  if (domainInput) {
    domainInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        addDomain();
      }
    });
  }

  // 添加域名函数
  function addDomain() {
    const domain = domainInput.value.trim();

    if (!domain) {
      alert('请输入域名');
      return;
    }

    // 域名格式验证
    if (!isValidDomain(domain)) {
      alert('请输入有效的域名格式 (例: example.com)');
      return;
    }

    // 获取已保存的域名列表
    chrome.storage.sync.get(['domains'], function(result) {
      const domains = result.domains || [];

      // 检查域名是否已存在
      if (domains.includes(domain)) {
        alert('该域名已存在');
        return;
      }

      // 添加新域名
      domains.push(domain);

      // 保存到Chrome存储
      chrome.storage.sync.set({domains: domains}, function() {
        if (chrome.runtime.lastError) {
          alert('保存域名失败，请重试');
          return;
        }

        domainInput.value = '';
        loadDomains(); // 重新加载显示

        // 通知background script更新域名列表
        chrome.runtime.sendMessage({action: 'updateDomains', domains: domains});
      });
    });
  }

  // 加载并显示域名列表
  function loadDomains() {
    chrome.storage.sync.get(['domains'], function(result) {
      const domains = result.domains || [];
      displayDomains(domains);
    });
  }

  // 显示域名列表
  function displayDomains(domains) {
    if (!domainList) return;

    domainList.innerHTML = '';

    if (domains.length === 0) {
      domainList.innerHTML = '<li style="text-align: center; opacity: 0.7;">暂无域名</li>';
      return;
    }

    domains.forEach(function(domain) {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="domain-name">${domain}</span>
        <button class="delete-btn" data-domain="${domain}">删除</button>
      `;

      // 添加删除按钮事件
      const deleteBtn = li.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', function() {
        deleteDomain(domain);
      });

      domainList.appendChild(li);
    });
  }

  // 删除域名函数
  function deleteDomain(domainToDelete) {
    chrome.storage.sync.get(['domains'], function(result) {
      const domains = result.domains || [];
      const updatedDomains = domains.filter(domain => domain !== domainToDelete);

      chrome.storage.sync.set({domains: updatedDomains}, function() {
        loadDomains(); // 重新加载显示

        // 通知background script更新域名列表
        chrome.runtime.sendMessage({action: 'updateDomains', domains: updatedDomains});
      });
    });
  }

  // 域名格式验证 - 支持复杂的多级域名
  function isValidDomain(domain) {
    // 基本检查：不能为空，不能包含空格，必须包含点
    if (!domain || domain.includes(' ') || !domain.includes('.')) {
      return false;
    }

    // 检查域名长度
    if (domain.length > 253) {
      return false;
    }

    // 分割域名各部分进行检查
    const parts = domain.split('.');

    // 至少要有两部分（如 example.com）
    if (parts.length < 2) {
      return false;
    }

    // 检查每个部分
    for (let part of parts) {
      // 每部分不能为空，不能超过63字符
      if (!part || part.length > 63) {
        return false;
      }

      // 每部分不能以连字符开头或结尾
      if (part.startsWith('-') || part.endsWith('-')) {
        return false;
      }

      // 每部分只能包含字母、数字和连字符
      if (!/^[a-zA-Z0-9-]+$/.test(part)) {
        return false;
      }
    }

    // 最后一部分（顶级域名）必须至少2个字符且只包含字母
    const tld = parts[parts.length - 1];
    if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
      return false;
    }

    return true;
  }

});

// 当popup关闭时的清理工作
window.addEventListener('beforeunload', function() {
  console.log("[Censorate] Popup is closing...");
});
