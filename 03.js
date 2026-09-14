


// img slider 
document.addEventListener("DOMContentLoaded", function() {
  const sliders = document.querySelectorAll('.custom-slider');
  
  sliders.forEach(container => {
    const track = container.querySelector('.slider-track');
    if (!track) return; 

    const images = track.querySelectorAll('img');
    const dots = container.querySelectorAll('.slider-dots .dot');
    const progressBars = container.querySelectorAll('.slider-dots .dot .progress'); 
    
    // 무한 롤링을 위한 앞뒤 복제본 생성
    const firstClone = images[0].cloneNode(true);
    const lastClone = images[images.length - 1].cloneNode(true);
    track.appendChild(firstClone);
    track.insertBefore(lastClone, track.firstChild);
    
    let currentIdx = 1;
    let isAnimating = false; 
    
    const style = getComputedStyle(container);
    // 슬라이드 머무는 시간 (CSS 변수가 없으면 기본값 3000ms)
    const SLIDE_DURATION = parseFloat(style.getPropertyValue('--slide-duration')) || 3000;

    let startTime = null;
    let animationReq;
    let isDragging = false;
    let startPos = 0;
    let prevTranslate = -100;

    track.addEventListener('dragstart', (e) => e.preventDefault());

    function updateSlide(index, withTransition = true) {
      if (isAnimating && withTransition) return;
      
      currentIdx = index;
      isAnimating = withTransition; 
      
      track.style.transition = withTransition ? 'transform 0.3s ease-out' : 'none';
      track.style.transform = `translateX(-${currentIdx * 100}%)`;
      prevTranslate = -currentIdx * 100;

      // 슬라이드가 넘어갈 때 모든 게이지를 0%로 초기화
      dots.forEach((dot, i) => {
        dot.classList.remove('active');
        if(progressBars[i]) progressBars[i].style.width = '0%';
      });
      
      let dotIdx = (currentIdx - 1 + dots.length) % dots.length;
      if(dots[dotIdx]) dots[dotIdx].classList.add('active');
    }

    track.addEventListener('transitionend', () => {
      isAnimating = false;
      if (currentIdx === 0) {
        updateSlide(dots.length, false);
      } else if (currentIdx === dots.length + 1) {
        updateSlide(1, false);
      }
    });

    function startProgress(timestamp) {
      if (isDragging || isAnimating) {
        startTime = null;
        animationReq = requestAnimationFrame(startProgress);
        return;
      }

      if (!startTime) startTime = timestamp;
      
      const elapsed = timestamp - startTime;
      let progressRatio = Math.min(elapsed / SLIDE_DURATION, 1);

      let dotIdx = (currentIdx - 1 + dots.length) % dots.length;
      
      // 픽셀 대신 퍼센트(%)로 게이지를 채움
      if(progressBars[dotIdx]) {
         progressBars[dotIdx].style.width = (progressRatio * 100) + '%';
      }

      // 100% 다 차면 다음 슬라이드로
      if (progressRatio >= 1) {
        updateSlide(currentIdx + 1);
        startTime = null; 
      }
      
      animationReq = requestAnimationFrame(startProgress);
    }

    function getClientX(e) { 
      if (e.type.includes('mouse')) return e.pageX;
      return e.type.includes('end') ? e.changedTouches[0].clientX : e.touches[0].clientX;
    }

    function dragStart(e) { 
      if (isAnimating) return; 
      isDragging = true; 
      startPos = getClientX(e); 
      track.style.transition = 'none'; 
      cancelAnimationFrame(animationReq); 
    }

    function dragMove(e) { 
      if (!isDragging) return; 
      const currentPos = getClientX(e);
      const diff = currentPos - startPos; 
      track.style.transform = `translateX(${prevTranslate + (diff / container.offsetWidth) * 100}%)`; 
    }

    function dragEnd(e) {
      if (!isDragging) return;
      isDragging = false;
      const endPos = getClientX(e);
      const diff = endPos - startPos;

      if (Math.abs(diff) > 30) { 
        if (diff < 0) updateSlide(currentIdx + 1); 
        else updateSlide(currentIdx - 1); 
      } else {
        track.style.transform = `translateX(${prevTranslate}%)`;
      }
      startTime = null;
      animationReq = requestAnimationFrame(startProgress); 
    }

    container.addEventListener('mousedown', dragStart);
    container.addEventListener('mousemove', dragMove);
    window.addEventListener('mouseup', dragEnd);
    container.addEventListener('touchstart', dragStart, {passive: true});
    container.addEventListener('touchmove', dragMove, {passive: true});
    window.addEventListener('touchend', dragEnd);

    updateSlide(1, false);
    animationReq = requestAnimationFrame(startProgress);
  });
});






// 그라디언트 
function initGradient(canvasId, containerSelector, colorVars) {
    const canvas = document.getElementById(canvasId);
    const container = document.querySelector(containerSelector);

    // 요소가 없으면 에러 안 나게 그냥 넘어감
    if (!canvas || !container) return; 

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
        console.warn('WebGL 미지원 환경입니다. 정적 배경으로 대체합니다.');
        canvas.style.display = 'none'; 
        return; 
    }

    // 💡 수정된 색상 파싱 함수 (CSS 변수와 Hex 코드 모두 지원)
    function parseColor(colorStr) {
        let hex = colorStr.trim();
        
        // '--'로 시작하면 CSS 변수로 간주하고 값을 가져옴
        if (hex.startsWith('--')) {
            const rootStyles = getComputedStyle(document.documentElement);
            hex = rootStyles.getPropertyValue(hex).trim();
        }
        
        if (!hex) hex = "#000000"; // 값이 없으면 검은색으로 방어

        hex = hex.replace(/^#/, '');
        
        // #fff 같은 3자리 헥스 코드를 6자리로 변환
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }

        let bigint = parseInt(hex, 16);
        if (isNaN(bigint)) return [0.0, 0.0, 0.0]; // 변환 실패 시 검은색 반환

        let r = (bigint >> 16) & 255;
        let g = (bigint >> 8) & 255;
        let b = bigint & 255;
        return [r / 255.0, g / 255.0, b / 255.0];
    }

    const vsSource = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    const fsSource = `
        precision highp float;
        
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform vec2 u_mouse;

        uniform vec3 u_color1;
        uniform vec3 u_color2;
        uniform vec3 u_color3;
        uniform vec3 u_color4;

        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            float aspect = u_resolution.x / u_resolution.y;
            uv.x *= aspect;
            
            vec2 m = u_mouse / u_resolution.xy;
            m.x *= aspect;

            vec2 dir = m - uv;
            float dist = length(dir);
            
            float pull = exp(-dist * 2.5); 
            
            float angle = -pull * 3.0 + u_time * 0.2; 
            mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
            
            vec2 p = uv - (rot * dir) * pull * 2.5; 
            
            p *= max(1.0, 800.0 / u_resolution.x);

            for(float i = 1.0; i <= 3.0; i++) {
                p.x += 0.35 / i * sin(i * 2.5 * p.y + u_time * 0.25 + pull);
                p.y += 0.35 / i * cos(i * 2.0 * p.x + u_time * 0.25 + pull);
            }

            float n1 = sin(p.x * 2.2 + u_time * 0.2) * 0.5 + 0.5;
            float n2 = cos(p.y * 2.5 - u_time * 0.2) * 0.5 + 0.5;
            float n3 = sin((p.x + p.y) * 2.0) * 0.5 + 0.5;

            vec3 baseCol = mix(u_color1, u_color2, n1);
            vec3 patternCol = mix(u_color3, u_color4, n2);
            
            float sharpN3 = smoothstep(0.15, 0.85, n3);
            
            float waveMix = clamp(sharpN3 + pull * 0.4, 0.0, 1.0);
            vec3 finalCol = mix(baseCol, patternCol, waveMix);

            gl_FragColor = vec4(finalCol, 1.0);
        }
    `;

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, "position");
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1.0, -1.0,  1.0, -1.0,  -1.0,  1.0,  1.0,  1.0
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uColor1 = gl.getUniformLocation(program, "u_color1");
    const uColor2 = gl.getUniformLocation(program, "u_color2");
    const uColor3 = gl.getUniformLocation(program, "u_color3");
    const uColor4 = gl.getUniformLocation(program, "u_color4");

    // 💡 핵심: 무조건 4개의 색상을 셰이더로 넘겨주기 (개수가 부족하면 자동으로 순환해서 채움)
    const finalColors = [];
    for (let i = 0; i < 4; i++) {
        // 배열 길이가 2라면: 0, 1, 0, 1 순서로 인덱스 접근
        const colStr = colorVars.length > 0 ? colorVars[i % colorVars.length] : '#000000';
        finalColors.push(parseColor(colStr));
    }

    gl.uniform3fv(uColor1, finalColors[0]);
    gl.uniform3fv(uColor2, finalColors[1]);
    gl.uniform3fv(uColor3, finalColors[2]);
    gl.uniform3fv(uColor4, finalColors[3]);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetX = mouseX;
    let targetY = mouseY;

    let isHovering = false; 
    let isVisible = true;   

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isVisible = entry.isIntersecting;
        });
    });
    observer.observe(container);

    container.addEventListener('mousemove', (e) => {
        isHovering = true;
        const rect = canvas.getBoundingClientRect();
        targetX = e.clientX - rect.left;
        targetY = rect.height - (e.clientY - rect.top); 
    });

    container.addEventListener('mouseleave', () => {
        isHovering = false;
    });

    function resize() {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener('resize', resize);
    resize(); 

    function render(time) {
        if (!isVisible) {
            requestAnimationFrame(render);
            return;
        }

        if (!isHovering) {
            const timeSec = time * 0.001;
            const radiusX = canvas.width * 0.25; 
            const radiusY = canvas.height * 0.25;
            
            targetX = canvas.width / 2 + Math.sin(timeSec * 0.5) * radiusX;
            targetY = canvas.height / 2 + Math.cos(timeSec * 0.7) * radiusY;
        }

        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        gl.uniform2f(uResolution, canvas.width, canvas.height);
        gl.uniform1f(uTime, time * 0.001);
        gl.uniform2f(uMouse, mouseX, mouseY);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}
// 스크립트 실행부 

// 1. 2개만 넣어도 알아서 ['--iw-2', '--iw-3', '--iw-2', '--iw-3'] 로 채워짐
initGradient(
    'glcanvas', 
    '.gradient-box', 
    ['--iw-2', '#424748' ]
);






// font / is-visible
document.addEventListener("DOMContentLoaded", function() {
  const textObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      } else {
        entry.target.classList.remove('is-visible');
      }
    });
  }, {
    threshold: 0.5, // 한계값

    rootMargin: "300px 0px" 
  });

  const targetTexts = document.querySelectorAll
  ('.scroll-animate-text, .sub-title, .grid-container, .expand-box');
  
  targetTexts.forEach(text => {
    textObserver.observe(text);
  });
});




// colors
const showBtn = document.querySelector('.iw-color .show-colors-btn');
const colorBox = document.querySelector('.iw-color .color');
if (showBtn && colorBox) {
  showBtn.addEventListener('click', () => {
    // 버튼 회전 클래스 토글
    showBtn.classList.toggle('active');
    
    // 색상 박스 활성화 클래스 토글
    colorBox.classList.toggle('show-all');
  });
}


// font input
document.addEventListener("DOMContentLoaded", () => {
  
  // ==========================================
  // [1] 오른쪽 영역: 글자 입력 및 슬라이더 로직 (기존 유지)
  // ==========================================
  const wghtText = document.getElementById('wghtText');

  if (wghtText) {
    wghtText.style.setProperty('--wght', 200);
    wghtText.style.fontWeight = '200';
    wghtText.style.fontStyle = 'normal';
    wghtText.style.fontVariationSettings = "'wght' 200, 'ital' 0";

    // 1. 엔터 키 및 글자 수 초과 방지
    wghtText.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        return;
      }
      const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      if (allowedKeys.includes(e.key)) return;

      if (this.innerText.length >= getMaxLength()) {
        e.preventDefault();
      }
    });

    // 2. 타이핑 시 한글/특수문자 입력 즉시 제거 (영문 대소문자, 공백만 허용)
    wghtText.addEventListener('input', function() {
      const originalText = this.innerText;
      // 영문(a-z, A-Z)과 공백(\s)을 제외한 모든 글자 탐색
      const regex = /[^a-zA-Z\s]/g;

      if (regex.test(originalText)) {
        this.innerText = originalText.replace(regex, '');

        // 텍스트 교체 후 커서를 맨 뒤로 복구
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(this);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });

    // 3. 붙여넣기 시 영문 및 공백만 통과
    wghtText.addEventListener('paste', function(e) {
      e.preventDefault();
      let paste = (e.clipboardData || window.clipboardData).getData('text');
      paste = paste.replace(/\n/g, ' ');

      // 영문과 공백 외의 문자 제거
      paste = paste.replace(/[^a-zA-Z\s]/g, '');

      const currentLength = this.innerText.length;
      const currentMaxLength = getMaxLength();

      if (currentLength + paste.length > currentMaxLength) {
        paste = paste.substring(0, currentMaxLength - currentLength);
      }
      document.execCommand('insertText', false, paste);
    });
  }

  const weightRange = document.getElementById('weightRange');
  const italicRange = document.getElementById('italicRange');
  
  function updateSliderFont() {
    if (!weightRange || !italicRange || !wghtText) return;
    const wghtValue = weightRange.value;
    const italValue = italicRange.value;
    
    wghtText.style.fontVariationSettings = `'wght' ${wghtValue}, 'ital' ${italValue}`;
    wghtText.style.setProperty('--wght', wghtValue);

    wghtText.style.fontWeight = wghtValue;
    wghtText.style.fontStyle = italValue > 0 ? 'italic' : 'normal';
  }

  if (weightRange && italicRange && wghtText) {
    weightRange.addEventListener('input', updateSliderFont);
    italicRange.addEventListener('input', updateSliderFont);
  }

  // ==========================================
  // [2] 새로 추가된 왼쪽 영역: 한글 전용 입력 로직
  // ==========================================
  const koreanText = document.getElementById('koreanText');

  if (koreanText) {
    
    // 1. 엔터 키 및 글자 수 제한 방지
    koreanText.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        return;
      }
      const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      if (allowedKeys.includes(e.key)) return;

      if (this.innerText.length >= getMaxLength()) {
        e.preventDefault();
      }
    });

    // 2. 타이핑할 때 한글과 띄어쓰기 외의 문자(영어, 숫자, 특수기호)가 들어가면 즉시 삭제
    koreanText.addEventListener('input', function() {
      const originalText = this.innerText;
      // 정규식: 한글(자음/모음/완성형)과 공백(\s)을 제외한 모든 글자 찾기
      const regex = /[^ㄱ-ㅎㅏ-ㅣ가-힣\s]/g; 
      
      if (regex.test(originalText)) {
        // 영문 등 불필요한 글자를 빈칸으로 치환
        this.innerText = originalText.replace(regex, '');
        
        // 글자가 강제로 바뀌면 커서가 앞으로 튕기므로, 커서를 다시 맨 뒤로 보내줌
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(this);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });

    // 3. 복사/붙여넣기 할 때도 한글만 남기고 붙여넣기
    koreanText.addEventListener('paste', function(e) {
      e.preventDefault();
      let paste = (e.clipboardData || window.clipboardData).getData('text');
      paste = paste.replace(/\n/g, ' '); 
      
      // 붙여넣은 텍스트에서 한글 제외하고 모두 삭제
      paste = paste.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣\s]/g, '');

      const currentLength = this.innerText.length;
      const currentMaxLength = getMaxLength(); 

      if (currentLength + paste.length > currentMaxLength) {
        paste = paste.substring(0, currentMaxLength - currentLength);
      }
      document.execCommand('insertText', false, paste);
    });
  }
});