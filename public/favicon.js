// public/favicon.js

function initFavicon() {
  const faviconLink = document.getElementById('dynamic-favicon');
  if (!faviconLink) return;

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const updateFavicon = (e) => {
    const color = e.matches ? '#ffffff' : '#111111';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="${color}" /></svg>`;
    faviconLink.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
  };

  // 최초 실행
  updateFavicon(mediaQuery);

  // 다크모드 실시간 감지
  mediaQuery.addEventListener('change', updateFavicon);
}

// 1. 처음 페이지가 로드될 때 실행
initFavicon();

// 2. ⭐️ View Transitions로 페이지가 부드럽게 전환될 때마다 파비콘 스크립트 재실행
document.addEventListener('astro:page-load', initFavicon);