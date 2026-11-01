// AIデイリー：data.js（build.py が作る）を読み、最新号・バックナンバー・記事・保存を表示する
const ISSUES = window.AI_DAILY_ISSUES || [];
const app = document.getElementById("app");
const WEEK = ["日", "月", "火", "水", "木", "金", "土"];

// 保存・既読はこのPCのブラウザにだけ残す（消えても表示は壊れない）
function loadSet(key) {
  try { return new Set(JSON.parse(localStorage.getItem(key) || "[]")); } catch { return new Set(); }
}
function saveSet(key, set) {
  try { localStorage.setItem(key, JSON.stringify([...set])); } catch {}
}
const saved = loadSet("aidaily.saved");
const read = loadSet("aidaily.read");

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return `${d.getMonth() + 1}月${d.getDate()}日(${WEEK[d.getDay()]})`;
}
function storyId(date, no) { return `${date}/${no}`; }
function findIssue(date) { return ISSUES.find(i => i.date === date); }

function card(issue, s) {
  const img = s.image ? `<img src="${esc(s.image)}" alt="" loading="lazy">` : "";
  const unread = read.has(storyId(issue.date, s.no)) ? "" : ` <span class="unread-dot">● 未読</span>`;
  return `<a class="card" href="#/story/${issue.date}/${s.no}">
    ${img}
    <div class="card-body">
      <div class="card-no">STORY ${String(s.no).padStart(2, "0")}${unread}</div>
      <h2 class="card-title">${esc(s.title)}</h2>
      <p class="card-lead">${esc(s.lead)}</p>
    </div></a>`;
}

function viewLatest() {
  const issue = ISSUES[0];
  if (!issue) return `<p class="empty">まだ号がありません。issues/ に号を作ってから「開く.bat」を実行してください。</p>`;
  return `<div class="issue-head">
      <h1 class="issue-date">${fmtDate(issue.date)}</h1>
      <span class="issue-label">DAILY ISSUE</span>
    </div>
    ${issue.stories.map(s => card(issue, s)).join("")}`;
}

function matches(s, q) {
  const text = [s.title, s.lead, ...(s.briefing || []), s.why].join(" ").toLowerCase();
  return text.includes(q);
}

function dayBlock(issue, stories) {
  const unread = stories.filter(s => !read.has(storyId(issue.date, s.no))).length;
  return `<section class="day">
    <div class="issue-head">
      <h2>${fmtDate(issue.date)}</h2>
      ${unread ? `<span class="unread-dot">● 未読${unread}本</span>` : ""}
    </div>
    <ol>${stories.map(s => `<li><a href="#/story/${issue.date}/${s.no}">
      <span class="n">${String(s.no).padStart(2, "0")}</span><span class="t">${esc(s.title)}</span></a></li>`).join("")}</ol>
  </section>`;
}

function viewArchive(q = "") {
  const query = q.trim().toLowerCase();
  const blocks = ISSUES.map(issue => {
    const stories = query ? issue.stories.filter(s => matches(s, query)) : issue.stories;
    return stories.length ? dayBlock(issue, stories) : "";
  }).join("");
  return `<input class="search" type="search" placeholder="キーワードで検索（例：Codex、値下げ）" value="${esc(q)}">
    <div id="archive-list">${blocks || `<p class="empty">見つかりませんでした。</p>`}</div>`;
}

function viewSaved() {
  const groups = ISSUES.map(issue => {
    const stories = issue.stories.filter(s => saved.has(storyId(issue.date, s.no)));
    return stories.length ? dayBlock(issue, stories) : "";
  }).join("");
  return groups || `<p class="empty">保存した記事はまだありません。記事の「保存」ボタンで追加できます。</p>`;
}

function viewStory(date, no) {
  const issue = findIssue(date);
  const s = issue && issue.stories.find(x => x.no === Number(no));
  if (!s) return `<p class="empty">記事が見つかりません。</p>`;
  const id = storyId(date, s.no);
  read.add(id); saveSet("aidaily.read", read);

  const prev = issue.stories.find(x => x.no === s.no - 1);
  const next = issue.stories.find(x => x.no === s.no + 1);
  const isSaved = saved.has(id);
  const list = (arr) => `<ul>${(arr || []).map(b => `<li>${esc(b)}</li>`).join("")}</ul>`;
  // 「用語：説明」の形なら用語を太字にする
  const terms = (arr) => `<dl class="terms">${arr.map(t => {
    const [word, ...rest] = String(t).split("：");
    return rest.length ? `<dt>${esc(word)}</dt><dd>${esc(rest.join("："))}</dd>` : `<dd>${esc(t)}</dd>`;
  }).join("")}</dl>`;
  const sources = (s.sources || []).map(src =>
    `<li><a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(src.name || src.url)}</a></li>`).join("");

  return `<div class="story-nav">
      <a class="btn" href="#/latest">← ${fmtDate(date)}号</a>
      <span>
        <button class="btn ${isSaved ? "saved" : ""}" id="save-btn" data-id="${id}">${isSaved ? "保存済み" : "保存"}</button>
        <a class="btn" href="#/story/${date}/${s.no - 1}" aria-disabled="${!prev}">前へ</a>
        <a class="btn" href="#/story/${date}/${s.no + 1}" aria-disabled="${!next}">次へ</a>
      </span>
    </div>
    <article class="story">
      ${s.image ? `<img src="${esc(s.image)}" alt="">` : ""}
      <div class="card-no">STORY ${String(s.no).padStart(2, "0")}</div>
      <h1>${esc(s.title)}</h1>
      <p class="lead">${esc(s.lead)}</p>
      ${s.background ? `<h3>そもそも何の話？</h3><p class="body">${esc(s.background)}</p>` : ""}
      <h3>ポイント</h3>
      ${list(s.briefing)}
      ${s.why ? `<h3>動画づくりとの関係</h3><p class="why">${esc(s.why)}</p>` : ""}
      ${s.terms && s.terms.length ? `<h3>言葉の説明</h3>${terms(s.terms)}` : ""}
      <h3>出典</h3>
      <ul class="sources">${sources}</ul>
      ${s.note ? `<p class="lead">※ ${esc(s.note)}</p>` : ""}
    </article>`;
}

function render() {
  const parts = location.hash.replace(/^#\/?/, "").split("/");
  const tab = parts[0] || "latest";
  document.querySelectorAll(".tabs a").forEach(a => a.classList.toggle("active", a.dataset.tab === tab));

  if (tab === "archive") app.innerHTML = viewArchive();
  else if (tab === "saved") app.innerHTML = viewSaved();
  else if (tab === "story") app.innerHTML = viewStory(parts[1], parts[2]);
  else app.innerHTML = viewLatest();
  window.scrollTo(0, 0);
}

app.addEventListener("input", e => {
  if (!e.target.classList.contains("search")) return;
  const q = e.target.value;
  const html = viewArchive(q);
  // 入力欄はそのまま残し、一覧だけ差し替える（入力中のカーソルが飛ばないように）
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  document.getElementById("archive-list").replaceWith(tmp.querySelector("#archive-list"));
});

app.addEventListener("click", e => {
  const btn = e.target.closest("#save-btn");
  if (!btn) return;
  const id = btn.dataset.id;
  if (saved.has(id)) saved.delete(id); else saved.add(id);
  saveSet("aidaily.saved", saved);
  btn.classList.toggle("saved", saved.has(id));
  btn.textContent = saved.has(id) ? "保存済み" : "保存";
});

window.addEventListener("hashchange", render);
render();
