// 번역 기능
if (typeof window !== 'undefined') {
  const initLanguageToggle = () => {
    const toggleBtns = document.querySelectorAll('.lang-toggle-btn');
    const targetElements = document.querySelectorAll('.translate');
    
    if (toggleBtns.length === 0) return;

    let isEnglish = localStorage.getItem('isEnglish') === 'true'; 

    // 1. [버튼/네비게이션 전용] 스크램블 함수
    const scrambleBtnText = (el, finalTxt) => {
      const chars = 'abcdefghijklmnopqrstuvwxyz'; 
      let count = 0;
      const astroAttr = Array.from(el.attributes).find(attr => attr.name.startsWith('data-astro-cid'))?.name || '';
      
      const interval = setInterval(() => {
        // 띄어쓰기는 스크램블 시 문자열 길이 유지를 위해 공백 유지
        el.textContent = finalTxt.split('').map(char => 
          char === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]
        ).join('');
        
        if (++count > 5) { 
          clearInterval(interval);
          el.innerHTML = finalTxt.split('').map((c, i) => {
            const charContent = c === ' ' ? '&nbsp;' : c;
            return `<span class="char" data-char="${charContent}" style="--i: ${i+1};" aria-hidden="true" ${astroAttr}>${charContent}</span>`;
          }).join('');
        }
      }, 50);
    };

    // 2. [본문 전용] 스크램블 함수
    const scrambleBodyText = (el, finalHTML) => {
      const chars = 'abcdefghijklmnopqrstuvwxyz'; 
      let count = 0;
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = finalHTML;
      const plainText = tempDiv.textContent || '';
      
      const interval = setInterval(() => {
        el.textContent = plainText.split('').map(char => 
          char.trim() === '' ? char : chars[Math.floor(Math.random() * chars.length)]
        ).join('');
        
        if (++count > 5) { 
          clearInterval(interval);
          el.innerHTML = finalHTML; 
        }
      }, 50); 
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
              el.innerHTML = targetHTML; 
            } else {
              scrambleBodyText(el, targetHTML); 
            }

            const innerInput = el.querySelector('input');
            if (innerInput) {
              innerInput.placeholder = targetHTML;
              innerInput.setAttribute('aria-label', targetHTML);
            }
          }
        });
      }

      // ==========================================
      // 💡 1. [ENG/KOR 토글 버튼 고유 업데이트]
      // ==========================================
      toggleBtns.forEach(btn => {
        btn.classList.toggle('active', isEnglish);
        const langText = btn.querySelector('.lang-text');
        
        if (langText) {
          // 한국어 모드일 때 'kor' 대신 '한글'로 표시되게 수정
          const targetTxt = isEnglish ? 'eng' : '한글';
          
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

      // ==========================================
      // 💡 [검색창 스크램블 연동] 기존 버튼용 스크램블 원리 적용
      // ==========================================
      const searchInput = document.getElementById('work-search');
      if (searchInput) {
        const targetPlaceholder = isEnglish ? 'search' : '검색';

        if (isInitialLoad) {
          searchInput.placeholder = targetPlaceholder;
          searchInput.setAttribute('aria-label', targetPlaceholder);
        } else {
          // 버튼들에서 쓰던 scrambleBtnText와 완전히 똑같은 원리의 스크램블 효과!
          const chars = 'abcdefghijklmnopqrstuvwxyz'; 
          let count = 0;
          
          const interval = setInterval(() => {
            searchInput.placeholder = targetPlaceholder.split('').map(() => 
              chars[Math.floor(Math.random() * chars.length)]
            ).join('');
            
            if (++count > 5) { 
              clearInterval(interval);
              searchInput.placeholder = targetPlaceholder;
              searchInput.setAttribute('aria-label', targetPlaceholder);
            }
          }, 50);
        }
      }

      // ==========================================
      // [필터, 연/월, PC/모바일 메뉴 통합 업데이트]
      // ==========================================
      const uiElements = document.querySelectorAll('.filter-btn, .timeline_filter_btn, .nav-links a:not(.logo-link), .mobile-nav a');

      uiElements.forEach(el => {
        const srText = el.querySelector('.sr-only');
        const rollingText = el.querySelector('.rolling-text');
        
        if (!srText || !rollingText) return;

        if (!el.dataset.eng) {
          const engChars = Array.from(rollingText.querySelectorAll('.char'))
            .map(c => c.getAttribute('data-char'))
            .join('');
          el.dataset.eng = engChars || el.dataset.filter || '';
        }

        const korStr = srText.textContent.trim();
        const engStr = el.dataset.eng;
        const targetStr = isEnglish ? engStr : korStr;
        
        if (isInitialLoad) {
          const astroAttr = Array.from(rollingText.attributes).find(attr => attr.name.startsWith('data-astro-cid'))?.name || '';
          rollingText.innerHTML = targetStr.split('').map((char, index) => {
            const charContent = char === ' ' ? '&nbsp;' : char;
            return `<span class="char" data-char="${charContent}" style="--i: ${index + 1};" aria-hidden="true" ${astroAttr}>${charContent}</span>`;
          }).join('');
        } else {
          scrambleBtnText(rollingText, targetStr);
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





