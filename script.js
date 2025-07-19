// goToCareerStep 함수 브라우저에서 접근 가능하도록 등록
window.goToCareerStep = goToCareerStep;
// ===== Firebase 초기화 =====
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyAG8jJNSsBs2FHaBOskaND3-vSmD4vYfRA",
    authDomain: "metabus-newsapi.firebaseapp.com",
    projectId: "metabus-newsapi",
    storageBucket: "metabus-newsapi.firebasestorage.app",
    messagingSenderId: "23840202779",
    appId: "1:23840202779:web:dfcc3eee2872c8f1edd8be",
    measurementId: "G-STLRSQYGGH"
  });
}
window.auth = firebase.auth();
window.db = firebase.firestore();

// 로그아웃
function logout() {
  auth.signOut().then(() => {
    showLogin();
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('mySummaryList').innerHTML = '';
  });
}

// 내 학습자료 목록 불러오기
function loadMySummaries() {
  const user = auth.currentUser;
  const listDiv = document.getElementById('mySummaryList');
  listDiv.innerHTML = '불러오는 중...';
  if (!user) {
    listDiv.innerHTML = '로그인 후 불러옵니다';
    return;
  }
  db.collection('newsSummaries')
    .where('uid', '==', user.uid)
    .orderBy('date', 'desc')
    .limit(10)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        listDiv.innerHTML = '저장된 학습자료가 없습니다.';
        return;
      }
      let html = '';
      snapshot.forEach(doc => {
        const d = doc.data();
        html += `<div class="news-card">
          <strong>${d.title}</strong><br>
          <span style='font-size:0.95em;color:#6366f1;'>${d.interestTag || ''} | ${d.date ? new Date(d.date).toLocaleString('ko-KR') : ''}</span><br>
          <div style='margin:0.5em 0;'>${d.summary || ''}</div>
          <div style='font-size:0.97em;color:#555;'>${d.reflection || ''}</div>
        </div>`;
      });
      listDiv.innerHTML = html;
    })
    .catch(err => {
      listDiv.innerHTML = '불러오기 실패: ' + (err && err.message ? err.message : '네트워크 오류');
    });
}

// 로그인/회원가입/로그아웃 시 내 학습자료 목록 자동 갱신
auth.onAuthStateChanged(user => {
  // 모든 섹션 숨김 처리
  document.getElementById('loginSection').classList.remove('active');
  document.getElementById('registerSection').classList.remove('active');
  document.getElementById('mainSection').classList.remove('active');
  document.getElementById('summarySection').classList.remove('active');
  if (user) {
    showMain();
    loadMySummaries();
    // 요약 섹션도 항상 초기화
    document.getElementById('summarySection').classList.remove('active');
    document.getElementById('selectedNewsTitle').innerText = '';
    document.getElementById('summaryText').innerText = '(GPT API 요약 결과 출력)';
    document.getElementById('relatedCareers').innerText = '(GPT 추천 직업)';
    document.getElementById('myReflection').value = '';
  } else {
    showLogin();
    document.getElementById('mySummaryList').innerHTML = '';
    document.getElementById('summarySection').classList.remove('active');
  }
});

// 로그인/회원가입/메인 섹션 표시 제어
function showLogin() {
  document.getElementById('loginSection').classList.add('active');
  document.getElementById('registerSection').classList.remove('active');
  document.getElementById('mainSection').classList.remove('active');
  document.getElementById('summarySection').classList.remove('active');
}
function showRegister() {
  document.getElementById('loginSection').classList.remove('active');
  document.getElementById('registerSection').classList.add('active');
  document.getElementById('mainSection').classList.remove('active');
  document.getElementById('summarySection').classList.remove('active');
}
function showMain() {
  document.getElementById('loginSection').classList.remove('active');
  document.getElementById('registerSection').classList.remove('active');
  document.getElementById('mainSection').classList.add('active');
  document.getElementById('summarySection').classList.remove('active');
}
function showSummary() {
  document.getElementById('summarySection').classList.add('active');
}

// 최초 진입 시 로그인 화면 표시 (auth 상태에 따라)
window.onload = () => {
  // Firebase auth.onAuthStateChanged가 자동으로 처리하므로 별도 showLogin() 호출 불필요
};

// 로그인/회원가입 (파이어베이스 연동 전 임시)
function login() {
  const email = document.getElementById('loginEmail').value;
  const pw = document.getElementById('loginPassword').value;
  if (!email || !pw) {
    document.getElementById('loginError').innerText = '이메일과 비밀번호를 입력하세요.';
    return;
  }
  auth.signInWithEmailAndPassword(email, pw)
    .then(() => {
      document.getElementById('loginError').innerText = '';
      showMain();
    })
    .catch(err => {
      document.getElementById('loginError').innerText = '로그인 실패: ' + (err.message || '이메일/비밀번호를 확인하세요.');
    });
}

function register() {
  const email = document.getElementById('registerEmail').value;
  const pw = document.getElementById('registerPassword').value;
  if (!email || pw.length < 6) {
    document.getElementById('registerError').innerText = '이메일과 6자 이상 비밀번호를 입력하세요.';
    return;
  }
  auth.createUserWithEmailAndPassword(email, pw)
    .then(() => {
      document.getElementById('registerError').innerText = '';
      alert('회원가입 완료! 로그인 해주세요.');
      showLogin();
    })
    .catch(err => {
      document.getElementById('registerError').innerText = '회원가입 실패: ' + (err.message || '이미 가입된 이메일일 수 있습니다.');
    });
}

// 뉴스 검색/요약/저장 기존 코드 (로그인 후에만 동작)
async function fetchNews() {
  const keyword = document.getElementById('keyword').value.trim();
  const apiKey = '861eb3faed9d4942a1fc56eea14c13f5'; // NewsAPI 키
  let keywords = [keyword];
  // 대표적인 한글 키워드에 대해 영문도 함께 검색
  const korToEng = {
    '환경': 'environment',
    '의료': 'medical',
    '의학': 'medical',
    '인공지능': 'AI',
    '교육': 'education',
    '법률': 'law',
    '경제': 'economy',
    '정치': 'politics',
    '사회': 'society',
    '기술': 'technology',
    '과학': 'science',
    '스포츠': 'sports',
    '문화': 'culture',
    '예술': 'art',
    '건강': 'health',
    '환경오염': 'pollution',
    '기후': 'climate',
    '기후변화': 'climate change'
  };
  let searchCombos = [];
  const isKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(keyword);
  if (isKorean && korToEng[keyword]) {
    // 한글 키워드: 한글(ko), 한글(en), 영문(en)
    searchCombos.push({q: keyword, lang: 'ko'});
    searchCombos.push({q: keyword, lang: 'en'});
    searchCombos.push({q: korToEng[keyword], lang: 'en'});
  } else if (isKorean) {
    // 한글 키워드지만 매핑 없음: 한글(ko), 한글(en)
    searchCombos.push({q: keyword, lang: 'ko'});
    searchCombos.push({q: keyword, lang: 'en'});
  } else {
    // 영문 키워드: 영문(en)
    searchCombos.push({q: keyword, lang: 'en'});
  }
  let allArticles = [];
  let errorCount = 0;
  let lastErrorMsg = '';
  for (let combo of searchCombos) {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(combo.q)}&language=${combo.lang}&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'error') {
        lastErrorMsg = data.message || 'API 오류';
        continue;
      }
      if (data.articles && data.articles.length > 0) {
        allArticles = allArticles.concat(data.articles);
      }
    } catch (e) {
      lastErrorMsg = e.message || '네트워크 오류';
      errorCount++;
    }
  }
  // 중복 기사 제거 (url 기준)
  const seen = new Set();
  allArticles = allArticles.filter(a => {
    if (!a.url || seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });
  const newsDiv = document.getElementById('newsResults');
  newsDiv.innerHTML = '';
  if (allArticles.length === 0) {
    if (lastErrorMsg) {
      newsDiv.innerHTML = `<div style='color:#e11d48;'>뉴스API 오류: ${lastErrorMsg}</div>`;
    } else {
      newsDiv.innerHTML = '<div style="color:#888;">검색 결과가 없습니다.</div>';
    }
    window.newsArticles = [];
    return;
  }
  window.newsArticles = allArticles;
  allArticles.forEach((article, index) => {
    const div = document.createElement('div');
    div.className = 'news-card';
    div.innerHTML = `
      <strong>${article.title}</strong><br>
      <em>${article.description || ''}</em><br>
      <button class="summarize-btn" data-index="${index}">이 뉴스 요약하기</button>
    `;
    newsDiv.appendChild(div);
  });
  // 버튼 이벤트 바인딩 (동적 생성 대응)
  document.querySelectorAll('.summarize-btn').forEach(btn => {
    btn.onclick = function() {
      const idx = parseInt(this.getAttribute('data-index'));
      summarizeNews(idx);
    };
  });
}

async function summarizeNews(index) {
  const article = window.newsArticles[index];
  document.getElementById('selectedNewsTitle').innerText = article.title;
  // 뉴스 링크 표시
  const newsLinkDiv = document.getElementById('selectedNewsLink');
  if (newsLinkDiv) {
    newsLinkDiv.innerHTML = `<a href="${article.url}" target="_blank" style="color:#2563eb;word-break:break-all;">원문 기사 보기</a>`;
  }
  document.getElementById('summarySection').classList.add('active');
  document.getElementById('mainSection').style.display = 'none';
  document.getElementById('summarySection').style.display = '';
  // 1단계: 학생 요약 입력만 보이기, 2단계 완전히 숨김
  document.getElementById('studentSummary').value = '';
  document.getElementById('summaryStep').style.display = '';
  document.getElementById('careerStep').style.display = 'none';
  document.getElementById('goToCareerBtn').style.display = '';
  document.getElementById('saveFeedback').innerText = '';
  document.getElementById('myReflection').value = '';
  // 학습자료 목록은 2단계에서만 보이므로 숨김
  const mySummaryListWrap = document.getElementById('mySummaryListWrap');
  if (mySummaryListWrap) mySummaryListWrap.style.display = 'none';
}

function goToCareerStep() {
  const summary = document.getElementById('studentSummary').value.trim();
  if (!summary) {
    document.getElementById('studentSummary').focus();
    document.getElementById('saveFeedback').innerText = '요약을 입력해주세요.';
    return;
  }
  // 2단계: 진로/생각 입력란만 보이기, 1단계 완전히 숨김
  document.getElementById('summaryStep').style.display = 'none';
  document.getElementById('careerStep').style.display = '';
  document.getElementById('saveFeedback').innerText = '';
  // "내 학습자료 목록"도 함께 보이기
  const mySummaryListWrap = document.getElementById('mySummaryListWrap');
  if (mySummaryListWrap) {
    mySummaryListWrap.style.display = '';
    loadMySummaries();
  }
  // 3단계: 결과/피드백/재검색 화면으로 전환
  // 입력값, 뉴스 정보, 진로, 생각 등 결과 페이지에 표시
  const title = document.getElementById('selectedNewsTitle').innerText;
  const summaryVal = document.getElementById('studentSummary').value.trim();
  const interestTag = document.getElementById('interestTag').value;
  const reflection = document.getElementById('myReflection').value.trim();
  const newsLinkDiv = document.getElementById('selectedNewsLink');
  let url = '';
  if (newsLinkDiv && newsLinkDiv.querySelector('a')) {
    url = newsLinkDiv.querySelector('a').href;
  }
  document.getElementById('mainSection').style.display = 'none';
  document.getElementById('summarySection').style.display = 'none';
  document.getElementById('resultSection').style.display = '';
  document.getElementById('resultNewsTitle').innerText = title;
  document.getElementById('resultNewsLink').innerHTML = url ? `<a href="${url}" target="_blank" style="color:#2563eb;word-break:break-all;">원문 기사 보기</a>` : '';
  document.getElementById('resultSummary').innerHTML = `<strong>내 요약:</strong> <br>${summaryVal}`;
  document.getElementById('resultCareer').innerHTML = `<strong>진로 관심 분야:</strong> ${interestTag}`;
  document.getElementById('resultReflection').innerHTML = `<strong>나의 생각:</strong> <br>${reflection}`;
  // 내 학습자료 목록도 결과 페이지에 표시
  loadMySummariesToResult();
  // 결과 페이지의 뉴스 검색창 초기화
  document.getElementById('resultKeyword').value = '';
}

function loadMySummariesToResult() {
  const user = auth.currentUser;
  const listDiv = document.getElementById('resultMySummaryList');
  listDiv.innerHTML = '불러오는 중...';
  if (!user) {
    listDiv.innerHTML = '로그인 후 불러옵니다';
    return;
  }
  db.collection('newsSummaries')
    .where('uid', '==', user.uid)
    .orderBy('date', 'desc')
    .limit(10)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        listDiv.innerHTML = '저장된 학습자료가 없습니다.';
        return;
      }
      let html = '';
      snapshot.forEach(doc => {
        const d = doc.data();
        const docId = doc.id;
        html += `<div class=\"news-card\">`
          + `<strong>${d.title}</strong><br>`
          + `<span style='font-size:0.95em;color:#6366f1;'>${d.dateDisplay || (d.date ? new Date(d.date).toLocaleString('ko-KR') : '')}</span><br>`
          + `<div style='margin:0.5em 0;'>${d.summary || ''}</div>`
          + (d.url ? `<div><a href='${d.url}' target='_blank' style='color:#2563eb;'>기사 링크</a></div>` : '')
          + `<div class=\"summary-actions\">`
          + `<button onclick=\"editSummary('${docId}')\">수정</button>`
          + `<button onclick=\"deleteSummary('${docId}')\">삭제</button>`
          + `</div>`
          + `</div>`;
      });
      listDiv.innerHTML = html;
    })
    .catch(err => {
      listDiv.innerHTML = '불러오기 실패: ' + (err && err.message ? err.message : '네트워크 오류');
    });
}

function deleteSummary(docId) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  db.collection('newsSummaries').doc(docId).delete()
    .then(() => {
      loadMySummariesToResult();
    });
}

function editSummary(docId) {
  db.collection('newsSummaries').doc(docId).get().then(doc => {
    if (!doc.exists) return;
    const d = doc.data();
    // summarySection에 값 채우고, 수정모드로 전환
    document.getElementById('mainSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('summarySection').style.display = '';
    document.getElementById('summarySection').classList.add('active');
    document.getElementById('selectedNewsTitle').innerText = d.title;
    document.getElementById('selectedNewsLink').innerHTML = d.url ? `<a href='${d.url}' target='_blank' style='color:#2563eb;'>원문 기사 보기</a>` : '';
    document.getElementById('studentSummary').value = d.summary;
    // 수정 저장 시 기존 문서 덮어쓰기
    document.getElementById('saveBtn').onclick = function() {
      const summary = document.getElementById('studentSummary').value.trim();
      if (!summary) {
        document.getElementById('saveFeedback').innerText = '요약을 입력하세요.';
        return;
      }
      db.collection('newsSummaries').doc(docId).update({
        summary,
        date: new Date().toISOString(),
        dateDisplay: new Date().toLocaleString('ko-KR')
      }).then(() => {
        document.getElementById('saveFeedback').innerText = '수정 완료!';
        setTimeout(() => {
          document.getElementById('summarySection').classList.remove('active');
          document.getElementById('summarySection').style.display = 'none';
          document.getElementById('resultSection').style.display = '';
          loadMySummariesToResult();
        }, 800);
      });
    };
  });
}

// 뉴스 검색/요약/저장 기존 코드 (로그인 후에만 동작)
async function fetchNews() {
  const keyword = document.getElementById('keyword').value.trim();
  const apiKey = '861eb3faed9d4942a1fc56eea14c13f5'; // NewsAPI 키
  let keywords = [keyword];
  // 대표적인 한글 키워드에 대해 영문도 함께 검색
  const korToEng = {
    '환경': 'environment',
    '의료': 'medical',
    '의학': 'medical',
    '인공지능': 'AI',
    '교육': 'education',
    '법률': 'law',
    '경제': 'economy',
    '정치': 'politics',
    '사회': 'society',
    '기술': 'technology',
    '과학': 'science',
    '스포츠': 'sports',
    '문화': 'culture',
    '예술': 'art',
    '건강': 'health',
    '환경오염': 'pollution',
    '기후': 'climate',
    '기후변화': 'climate change'
  };
  if (korToEng[keyword]) {
    keywords.push(korToEng[keyword]);
  }
  // 여러 키워드로 각각 검색 후 결과 합치기
  let allArticles = [];
  let errorCount = 0;
  for (let k of keywords) {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(k)}&language=ko&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.articles && data.articles.length > 0) {
        allArticles = allArticles.concat(data.articles);
      }
    } catch (e) {
      errorCount++;
    }
  }
  // 중복 기사 제거 (url 기준)
  const seen = new Set();
  allArticles = allArticles.filter(a => {
    if (!a.url || seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });
  const newsDiv = document.getElementById('newsResults');
  newsDiv.innerHTML = '';
  if (allArticles.length === 0) {
    newsDiv.innerHTML = '<div style="color:#888;">검색 결과가 없습니다.</div>';
    window.newsArticles = [];
    return;
  }
  window.newsArticles = allArticles;
  allArticles.forEach((article, index) => {
    const div = document.createElement('div');
    div.className = 'news-card';
    div.innerHTML = `
      <strong>${article.title}</strong><br>
      <em>${article.description || ''}</em><br>
      <button class="summarize-btn" data-index="${index}">이 뉴스 요약하기</button>
    `;
    newsDiv.appendChild(div);
  });
  // 버튼 이벤트 바인딩 (동적 생성 대응)
  document.querySelectorAll('.summarize-btn').forEach(btn => {
    btn.onclick = function() {
      const idx = parseInt(this.getAttribute('data-index'));
      summarizeNews(idx);
    };
  });
}

async function summarizeNews(index) {
  const article = window.newsArticles[index];
  document.getElementById('selectedNewsTitle').innerText = article.title;
  // 뉴스 링크 표시
  const newsLinkDiv = document.getElementById('selectedNewsLink');
  if (newsLinkDiv) {
    newsLinkDiv.innerHTML = `<a href="${article.url}" target="_blank" style="color:#2563eb;word-break:break-all;">원문 기사 보기</a>`;
  }
  document.getElementById('summarySection').classList.add('active');
  document.getElementById('mainSection').style.display = 'none';
  document.getElementById('summarySection').style.display = '';
  // 1단계: 학생 요약 입력만 보이기, 2단계 완전히 숨김
  document.getElementById('studentSummary').value = '';
  document.getElementById('summaryStep').style.display = '';
  document.getElementById('careerStep').style.display = 'none';
  document.getElementById('goToCareerBtn').style.display = '';
  document.getElementById('saveFeedback').innerText = '';
  document.getElementById('myReflection').value = '';
  // 학습자료 목록은 2단계에서만 보이므로 숨김
  const mySummaryListWrap = document.getElementById('mySummaryListWrap');
  if (mySummaryListWrap) mySummaryListWrap.style.display = 'none';
}

function goToCareerStep() {
  const summary = document.getElementById('studentSummary').value.trim();
  if (!summary) {
    document.getElementById('studentSummary').focus();
    document.getElementById('saveFeedback').innerText = '요약을 입력해주세요.';
    return;
  }
  // 2단계: 진로/생각 입력란만 보이기, 1단계 완전히 숨김
  document.getElementById('summaryStep').style.display = 'none';
  document.getElementById('careerStep').style.display = '';
  document.getElementById('saveFeedback').innerText = '';
  // "내 학습자료 목록"도 함께 보이기
  const mySummaryListWrap = document.getElementById('mySummaryListWrap');
  if (mySummaryListWrap) {
    mySummaryListWrap.style.display = '';
    loadMySummaries();
  }
  // 3단계: 결과/피드백/재검색 화면으로 전환
  // 입력값, 뉴스 정보, 진로, 생각 등 결과 페이지에 표시
  const title = document.getElementById('selectedNewsTitle').innerText;
  const summaryVal = document.getElementById('studentSummary').value.trim();
  const interestTag = document.getElementById('interestTag').value;
  const reflection = document.getElementById('myReflection').value.trim();
  const newsLinkDiv = document.getElementById('selectedNewsLink');
  let url = '';
  if (newsLinkDiv && newsLinkDiv.querySelector('a')) {
    url = newsLinkDiv.querySelector('a').href;
  }
  document.getElementById('mainSection').style.display = 'none';
  document.getElementById('summarySection').style.display = 'none';
  document.getElementById('resultSection').style.display = '';
  document.getElementById('resultNewsTitle').innerText = title;
  document.getElementById('resultNewsLink').innerHTML = url ? `<a href="${url}" target="_blank" style="color:#2563eb;word-break:break-all;">원문 기사 보기</a>` : '';
  document.getElementById('resultSummary').innerHTML = `<strong>내 요약:</strong> <br>${summaryVal}`;
  document.getElementById('resultCareer').innerHTML = `<strong>진로 관심 분야:</strong> ${interestTag}`;
  document.getElementById('resultReflection').innerHTML = `<strong>나의 생각:</strong> <br>${reflection}`;
  // 내 학습자료 목록도 결과 페이지에 표시
  loadMySummariesToResult();
  // 결과 페이지의 뉴스 검색창 초기화
  document.getElementById('resultKeyword').value = '';
}

function loadMySummariesToResult() {
  const user = auth.currentUser;
  const listDiv = document.getElementById('resultMySummaryList');
  listDiv.innerHTML = '불러오는 중...';
  if (!user) {
    listDiv.innerHTML = '로그인 후 불러옵니다';
    return;
  }
  db.collection('newsSummaries')
    .where('uid', '==', user.uid)
    .orderBy('date', 'desc')
    .limit(10)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        listDiv.innerHTML = '저장된 학습자료가 없습니다.';
        return;
      }
      let html = '';
      snapshot.forEach(doc => {
        const d = doc.data();
        const docId = doc.id;
        html += `<div class=\"news-card\">`
          + `<strong>${d.title}</strong><br>`
          + `<span style='font-size:0.95em;color:#6366f1;'>${d.dateDisplay || (d.date ? new Date(d.date).toLocaleString('ko-KR') : '')}</span><br>`
          + `<div style='margin:0.5em 0;'>${d.summary || ''}</div>`
          + (d.url ? `<div><a href='${d.url}' target='_blank' style='color:#2563eb;'>기사 링크</a></div>` : '')
          + `<div class=\"summary-actions\">`
          + `<button onclick=\"editSummary('${docId}')\">수정</button>`
          + `<button onclick=\"deleteSummary('${docId}')\">삭제</button>`
          + `</div>`
          + `</div>`;
      });
      listDiv.innerHTML = html;
    })
    .catch(err => {
      listDiv.innerHTML = '불러오기 실패: ' + (err && err.message ? err.message : '네트워크 오류');
    });
}

function deleteSummary(docId) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  db.collection('newsSummaries').doc(docId).delete()
    .then(() => {
      loadMySummariesToResult();
    });
}

function editSummary(docId) {
  db.collection('newsSummaries').doc(docId).get().then(doc => {
    if (!doc.exists) return;
    const d = doc.data();
    // summarySection에 값 채우고, 수정모드로 전환
    document.getElementById('mainSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('summarySection').style.display = '';
    document.getElementById('summarySection').classList.add('active');
    document.getElementById('selectedNewsTitle').innerText = d.title;
    document.getElementById('selectedNewsLink').innerHTML = d.url ? `<a href='${d.url}' target='_blank' style='color:#2563eb;'>원문 기사 보기</a>` : '';
    document.getElementById('studentSummary').value = d.summary;
    // 수정 저장 시 기존 문서 덮어쓰기
    document.getElementById('saveBtn').onclick = function() {
      const summary = document.getElementById('studentSummary').value.trim();
      if (!summary) {
        document.getElementById('saveFeedback').innerText = '요약을 입력하세요.';
        return;
      }
      db.collection('newsSummaries').doc(docId).update({
        summary,
        date: new Date().toISOString(),
        dateDisplay: new Date().toLocaleString('ko-KR')
      }).then(() => {
        document.getElementById('saveFeedback').innerText = '수정 완료!';
        setTimeout(() => {
          document.getElementById('summarySection').classList.remove('active');
          document.getElementById('summarySection').style.display = 'none';
          document.getElementById('resultSection').style.display = '';
          loadMySummariesToResult();
        }, 800);
      });
    };
  });
}

function editMySummariesMode() {
  // 가장 최근 학습자료(최상단) 기준으로 수정화면으로 이동
  const user = auth.currentUser;
  if (!user) return;
  db.collection('newsSummaries')
    .where('uid', '==', user.uid)
    .orderBy('date', 'desc')
    .limit(1)
    .get()
    .then(snapshot => {
      if (snapshot.empty) return;
      const doc = snapshot.docs[0];
      editSummary(doc.id);
    });
}

// 저장
function saveToFirebase() {
  const summary = document.getElementById('studentSummary').value.trim();
  const title = document.getElementById('selectedNewsTitle').innerText;
  // 뉴스 링크도 저장
  let url = '';
  const newsLinkDiv = document.getElementById('selectedNewsLink');
  if (newsLinkDiv && newsLinkDiv.querySelector('a')) {
    url = newsLinkDiv.querySelector('a').href;
  }
  const user = auth.currentUser;
  if (!user) {
    document.getElementById('saveFeedback').innerText = '로그인 후 저장할 수 있습니다.';
    return;
  }
  if (!summary || !title) {
    document.getElementById('saveFeedback').innerText = '요약과 제목을 모두 입력해주세요.';
    return;
  }
  const now = new Date();
  const data = {
    uid: user.uid,
    email: user.email,
    title,
    summary,
    url,
    date: now.toISOString(),
    dateDisplay: now.toLocaleString('ko-KR')
  };
  db.collection('newsSummaries').add(data)
    .then(() => {
      document.getElementById('saveFeedback').innerText = '저장 완료!';
      // 입력값 초기화 및 요약 입력란 숨기기
      document.getElementById('studentSummary').value = '';
      setTimeout(() => {
        document.getElementById('summarySection').classList.remove('active');
        document.getElementById('summarySection').style.display = 'none';
        // 결과 화면으로 전환 및 목록 표시
        document.getElementById('resultSection').style.display = '';
        loadMySummariesToResult();
      }, 800);
    })
    .catch(err => {
      document.getElementById('saveFeedback').innerText = '저장 실패: ' + (err && err.message ? err.message : '네트워크 오류');
    });
}

// 뉴스 추가하기 버튼 클릭 시 완전히 처음(메인) 화면으로 돌아가도록, 내 학습자료 목록도 새로고침
function goToMainFromResult() {
  // resultSection 숨기고 mainSection 보이기, 검색어 입력값 초기화
  document.getElementById('resultSection').style.display = 'none';
  document.getElementById('mainSection').style.display = '';
  document.getElementById('keyword').value = '';
  document.getElementById('newsResults').innerHTML = '';
  // 내 학습자료 목록도 초기화
  loadMySummaries();
}
