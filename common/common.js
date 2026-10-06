// common.js 파일 내용

// 1. 헤더 불러오기
fetch('.common/header.html')
  .then(res => res.text())
  .then(data => {
    const headerArea = document.getElementById('header-area');
    if (headerArea) headerArea.innerHTML = data;
  });

// 2. 바디(공통 콘텐츠) 불러오기
fetch('.common/body.html')
  .then(res => res.text())
  .then(data => {
    const bodyArea = document.getElementById('body-area');
    if (bodyArea) bodyArea.innerHTML = data;
  });

// 3. 푸터 불러오기
fetch('.common/footer.html')
  .then(res => res.text())
  .then(data => {
    const footerArea = document.getElementById('footer-area');
    if (footerArea) footerArea.innerHTML = data;
  });