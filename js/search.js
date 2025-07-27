const limit = 20;

let currentKeyword = '';
let allResults = [];
let displayedCount = 0;
let loading = false;

const resultsDiv = document.getElementById('results');
const loadMoreBtn = document.getElementById('loadMoreBtn');

function setLoadingMessage() {
  resultsDiv.innerHTML = `
    <div class="loading-container">
      <div class="spinner"></div>
      <div>検索中...</div>
    </div>
  `;
}

function showMessage(message) {
  resultsDiv.innerHTML = `<p style="text-align:center; color:#555;">${message}</p>`;
}

function createRoomElement(item) {
  const name = item.square.name;
  const desc = item.square.desc || '';
  const members = item.memberCount;
  const emid = item.square.emid;
  const profileImageObsHash = item.square.profileImageObsHash || '';

  const joinUrl = `line://square/join?emid=${emid}`;
  const imgUrl = profileImageObsHash
    ? `https://obs.line-scdn.net/${profileImageObsHash}/preview.100x100`
    : 'https://via.placeholder.com/100?text=No+Image';

  const div = document.createElement('div');
  div.className = 'room';
  div.innerHTML = `
    <img src="${imgUrl}" alt="アイコン" />
    <h3>${name}</h3>
    <p>メンバー数: ${members}</p>
    <p>${desc.length > 60 ? desc.slice(0, 60) + '...' : desc}</p>
    <button class="join-btn">LINEで開く</button>
  `;

  div.querySelector('.join-btn').addEventListener('click', () => {
    window.location.href = joinUrl;
  });

  return div;
}

async function performSearch(keyword) {
  if (loading) return;
  loading = true;
  setLoadingMessage();

  try {
    const url = `https://line-tool.ame-x.net/api/@/search?query=${encodeURIComponent(keyword)}&limit=100`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('検索失敗');
    const data = await res.json();

    allResults = data || [];
    displayedCount = 0;

    if (allResults.length === 0) {
      showMessage('結果が見つかりませんでした。');
      loadMoreBtn.style.display = 'none';
      loading = false;
      return;
    }

    resultsDiv.innerHTML = '';
    appendMoreResults();

  } catch (e) {
    console.error(e);
    showMessage('検索に失敗しました。');
    loadMoreBtn.style.display = 'none';
  } finally {
    loading = false;
  }
}

function appendMoreResults() {
  const nextBatch = allResults.slice(displayedCount, displayedCount + limit);
  nextBatch.forEach(item => {
    resultsDiv.appendChild(createRoomElement(item));
  });
  displayedCount += nextBatch.length;

  if (displayedCount < allResults.length) {
    loadMoreBtn.style.display = 'block';
  } else {
    loadMoreBtn.style.display = 'none';
  }
}

document.getElementById('searchBtn').addEventListener('click', () => {
  const keyword = document.getElementById('keyword').value.trim();
  if (!keyword) {
    showMessage('検索ワードを入力してください。');
    loadMoreBtn.style.display = 'none';
    return;
  }
  currentKeyword = keyword;
  performSearch(keyword);
});

document.getElementById('keyword').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    document.getElementById('searchBtn').click();
  }
});

loadMoreBtn.addEventListener('click', () => {
  if (loading) return;
  appendMoreResults();
});

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const percent = (scrollTop / scrollHeight) * 100;
  document.getElementById('scrollProgress').style.width = percent + '%';
});
