"use strict";

const apiBaseUrl = "https://line-tool.ame-x.net/api/@/search";
const searchBtn = document.getElementById("searchBtn");
const keywordInput = document.getElementById("keywordInput");
const resultsContainer = document.getElementById("results");
const loadingElem = document.getElementById("loading");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const resultCountElem = document.getElementById("resultCount");
const memberMinInput = document.getElementById("memberMin");
const memberMaxInput = document.getElementById("memberMax");
const toggleFilterBtn = document.getElementById("toggleFilterBtn");
const filterSection = document.getElementById("filterSection");

let currentResults = [];
let displayCount = 0;
const pageSize = 20;
let filterEnabled = true;

toggleFilterBtn.addEventListener("click", () => {
  filterEnabled = !filterEnabled;
  filterSection.style.display = filterEnabled ? "flex" : "none";
  toggleFilterBtn.textContent = filterEnabled ? "フィルターON" : "フィルターOFF";
});

function createRoomCard(room) {
  const card = document.createElement("a");
  card.className = "room-card";
  card.href = `line://square/join?emid=${room.square.emid}`;
  card.target = "_blank";
  card.rel = "noopener noreferrer";

  const img = document.createElement("img");
  img.src = `https://obs.line-scdn.net/${room.square.profileImageObsHash}/preview.100x100`;
  img.alt = `${room.square.name} アイコン`;
  img.onerror = () => {
    img.src = "https://via.placeholder.com/100?text=No+Image";
  };

  const info = document.createElement("div");
  info.className = "room-info";

  const name = document.createElement("div");
  name.className = "room-name";
  name.textContent = room.square.name;

  const desc = document.createElement("div");
  desc.className = "room-desc";
  desc.textContent = room.square.desc || "(説明なし)";

  const members = document.createElement("div");
  members.className = "room-members";
  members.textContent = `メンバー数: ${room.memberCount}`;

  info.appendChild(name);
  info.appendChild(desc);
  info.appendChild(members);

  card.appendChild(img);
  card.appendChild(info);

  return card;
}

function filterResults(results) {
  if (!filterEnabled) return results;
  const min = parseInt(memberMinInput.value) || 0;
  const max = parseInt(memberMaxInput.value) || Number.MAX_SAFE_INTEGER;
  return results.filter(r => r.memberCount >= min && r.memberCount <= max);
}

function renderResults(reset = false) {
  if (reset) {
    resultsContainer.innerHTML = "";
    displayCount = 0;
  }

  const filtered = filterResults(currentResults);
  const toDisplay = filtered.slice(displayCount, displayCount + pageSize);

  toDisplay.forEach(room => {
    const card = createRoomCard(room);
    resultsContainer.appendChild(card);
  });

  displayCount += toDisplay.length;

  resultCountElem.textContent = `検索結果: ${filtered.length}件`;

  if (displayCount >= filtered.length) {
    loadMoreBtn.classList.add("hidden");
  } else {
    loadMoreBtn.classList.remove("hidden");
  }
}

async function search() {
  const keyword = keywordInput.value.trim();
  if (!keyword) {
    alert("検索ワードを入力してください");
    return;
  }
  searchBtn.disabled = true;
  resultsContainer.innerHTML = "";
  resultCountElem.textContent = "";
  loadMoreBtn.classList.add("hidden");
  loadingElem.classList.remove("hidden");

  try {
    const res = await fetch(`${apiBaseUrl}?query=${encodeURIComponent(keyword)}&limit=100`);
    if (!res.ok) throw new Error("検索に失敗しました");

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      resultsContainer.innerHTML = "<p>検索結果がありませんでした。</p>";
      resultCountElem.textContent = "検索結果: 0件";
      currentResults = [];
    } else {
      currentResults = data;
      renderResults(true);
    }
  } catch (err) {
    resultsContainer.innerHTML = `<p style="color:red;">エラーが発生しました: ${err.message}</p>`;
  } finally {
    loadingElem.classList.add("hidden");
    searchBtn.disabled = false;
  }
}

searchBtn.addEventListener("click", () => search());
keywordInput.addEventListener("keyup", e => {
  if (e.key === "Enter") search();
});

loadMoreBtn.addEventListener("click", () => renderResults());

memberMinInput.addEventListener("input", () => {
  renderResults(true);
});
memberMaxInput.addEventListener("input", () => {
  renderResults(true);
});
