// 번역 기능
if (typeof window !== 'undefined') {
  const initLanguageToggle = () => {
    const toggleBtns = document.querySelectorAll('.lang-toggle-btn');
    const targetElements = document.querySelectorAll('.translate');
    
    if (toggleBtns.length === 0) return;

    let isEnglish = localStorage.getItem('isEnglish') === 'true'; 

    // 💡 1. [버튼 전용] 스크램블 함수 (롤링 span 구조 유지)
    const scrambleBtnText = (el, finalTxt) => {
      const chars = 'abcdefghijklmnopqrstuvwxyz'; 
      let count = 0;
      const astroAttr = Array.from(el.attributes).find(attr => attr.name.startsWith('data-astro-cid'))?.name || '';
      
      const interval = setInterval(() => {
        el.textContent = finalTxt.split('').map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
        if (++count > 5) { 
          clearInterval(interval);
          el.innerHTML = finalTxt.split('').map((c, i) => 
            `<span class="char" data-char="${c}" style="--i: ${i+1};" aria-hidden="true" ${astroAttr}>${c}</span>`
          ).join('');
        }
      }, 50);
    };

    // 💡 2. [본문 전용] 스크램블 함수 추가!
    const scrambleBodyText = (el, finalHTML) => {
      const chars = 'abcdefghijklmnopqrstuvwxyz'; 
      let count = 0;
      
      // 본문 안에 있는 <br> 같은 HTML 태그가 텍스트로 노출되지 않도록 순수 텍스트만 추출
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = finalHTML;
      const plainText = tempDiv.textContent || '';
      
      const interval = setInterval(() => {
        // 띄어쓰기(공백)는 그대로 둬서 레이아웃이 무너지는 걸 방지하고, 글자만 스크램블
        el.textContent = plainText.split('').map(char => 
          char.trim() === '' ? char : chars[Math.floor(Math.random() * chars.length)]
        ).join('');
        
        if (++count > 5) { 
          clearInterval(interval);
          // 스크램블이 끝나면 원래의 줄바꿈(<br>) 등을 포함한 완전한 HTML로 렌더링
          el.innerHTML = finalHTML; 
        }
      }, 50); // 버튼과 똑같이 0.05초 간격으로 돌아감
    };

    // 3. 통합 적용 함수 
    const applyLanguageState = (isInitialLoad = false) => {
      
      // [본문 업데이트]
      if (targetElements.length > 0) {
        targetElements.forEach(el => {
          if (!el.hasAttribute('data-ko')) {
            el.setAttribute('data-ko', el.innerHTML.trim());
          }
          const targetHTML = isEnglish ? el.getAttribute('data-en') : el.getAttribute('data-ko');
          
          if (targetHTML) {
            if (isInitialLoad) {
              // 처음 접속 시에는 애니메이션 없이 텍스트 즉시 표시
              el.innerHTML = targetHTML; 
            } else {
              // ★ 버튼을 클릭해서 언어를 바꿀 때는 본문도 스크램블 효과 실행!
              scrambleBodyText(el, targetHTML); 
            }
          }
        });
      }

      // [버튼 업데이트]
      toggleBtns.forEach(btn => {
        btn.classList.toggle('active', isEnglish);
        
        const langText = btn.querySelector('.lang-text');
        if (langText) {
          const targetTxt = isEnglish ? 'eng' : 'kor';
          
          if (isInitialLoad) {
            const astroAttr = Array.from(langText.attributes).find(attr => attr.name.startsWith('data-astro-cid'))?.name || '';
            langText.innerHTML = targetTxt.split('').map((c, i) => 
              `<span class="char" data-char="${c}" style="--i: ${i+1};" aria-hidden="true" ${astroAttr}>${c}</span>`
            ).join('');
          } else {
            scrambleBtnText(langText, targetTxt);
          }
        }
      });
    };

    applyLanguageState(true);

    toggleBtns.forEach(btn => {
      btn.onclick = () => {
        isEnglish = !isEnglish; 
        localStorage.setItem('isEnglish', isEnglish); 
        applyLanguageState(false); 
      };
    });
  };

  document.addEventListener('DOMContentLoaded', initLanguageToggle);
  document.addEventListener('astro:page-load', initLanguageToggle);
}

// 스크롤
import Lenis from 'lenis';

let lenis;
let rafId; // 무한 반복되는 애니메이션 프레임을 멈추기 위한 아이디 변수

const initLenis = () => {
  // 1. 기존 Lenis 인스턴스 파괴
  if (lenis) {
    lenis.destroy();
  }

  if (rafId) {
    cancelAnimationFrame(rafId);
  }

  // Lenis 기본 세팅
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
  });

  // 애니메이션 프레임에 Lenis 업데이트 연동
  const raf = (time) => {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf); // 💡 아이디를 저장하면서 반복
  };

  rafId = requestAnimationFrame(raf); // 최초 실행
};

document.addEventListener('DOMContentLoaded', initLenis);
document.addEventListener('astro:page-load', initLenis);

// 이미지 draggable="false"
document.querySelectorAll('img').forEach(img => img.setAttribute('draggable', 'false'));





