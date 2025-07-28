const keywordInput = document.getElementById('keywordInput');
const searchBtn = document.getElementById('searchBtn');
const results = document.getElementById('results');
const loading = document.getElementById('loading');
const resultCount = document.getElementById('resultCount');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const memberMin = document.getElementById('memberMin');
const memberMax = document.getElementById('memberMax');

let allResults = [];
let currentIndex = 0;
const PAGE_SIZE = 10;

searchBtn.addEventListener('click', () => search());
loadMoreBtn.addEventListener('click', showMore);

async function search() {
  const keyword = keywordInput.value.trim();
  if (!keyword) return;

  loading.classList.remove('hidden');
  results.innerHTML = '';
  resultCount.textContent = '';
  loadMoreBtn.classList.add('hidden');

  try {
    const res = await fetch(`https://line-tool.ame-x.net/api/@/search?query=${encodeURIComponent(keyword)}&limit=100`);
    const data = await res.json();

    // フィルター処理
    const min = parseInt(memberMin.value) || 0;
    const max = parseInt(memberMax.value) || Infinity;
    allResults = data.filter(item => item.memberCount >= min && item.memberCount <= max);

    resultCount.textContent = `${allResults.length}件見つかりました`;
    currentIndex = 0;
    showMore();
  } catch (e) {
    results.innerHTML = '<p>検索に失敗しました。</p>';
  } finally {
    loading.classList.add('hidden');
  }
}

function showMore() {
  const slice = allResults.slice(currentIndex, currentIndex + PAGE_SIZE);
  for (const item of slice) {
    results.appendChild(createCard(item));
  }
  currentIndex += PAGE_SIZE;
  if (currentIndex < allResults.length) {
    loadMoreBtn.classList.remove('hidden');
  } else {
    loadMoreBtn.classList.add('hidden');
  }
}

function createCard(item) {
  const div = document.createElement('div');
  div.className = 'room-card';

  const imgHash = item.square.profileImageObsHash;
  const imgUrl = imgHash
    ? `https://obs.line-scdn.net/${imgHash}/preview.100x100`
    : 'https://via.placeholder.com/100';

  div.innerHTML = `
    <img src="${imgUrl}" alt="icon">
    <div class="room-info">
      <div>
        <div class="room-name">${item.square.name}</div>
        <div class="room-desc">${(item.square.desc || '').slice(0, 50)}...</div>
        <div class="room-members">人数: ${item.memberCount}</div>
      </div>
      <a class="join-btn" href="line://square/join?emid=${item.square.emid}">
        開く
      </a>
    </div>
  `;
  return div;
}
