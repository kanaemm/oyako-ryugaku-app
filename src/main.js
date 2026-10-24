import './style.css';
import { categories, initialProfile, matches, dueDate, progress, validProfile } from './model.js';
const base = import.meta.env.BASE_URL;
const key = 'oyako-preparation-v1';
let profile = structuredClone(initialProfile), completed = {}, configured = false, storageWarning = '';
try {
 const saved = JSON.parse(localStorage.getItem(key));
 if (saved && validProfile(saved.profile)) { profile = saved.profile; completed = saved.completed && typeof saved.completed === 'object' ? saved.completed : {}; configured = true; }
} catch { storageWarning = '保存データを読み込めませんでした。ブラウザの保存設定を確認してください。'; }
let tasks = [], category = 'all', filter = 'all', editing = false;
const app = document.querySelector('#app');
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save() {
 try { localStorage.setItem(key, JSON.stringify({profile, completed})); storageWarning = ''; }
 catch { storageWarning = '端末に保存できません。ブラウザの保存設定や空き容量を確認してください。この画面を閉じると変更が失われます。'; }
}
const dateLabel = date => date ? new Intl.DateTimeFormat('ja-JP', { month:'long', day:'numeric', timeZone:'UTC' }).format(new Date(`${date}T12:00:00Z`)) : '';
function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function header() { return `<header><a class="brand" href="${base}" aria-label="おやこ旅支度 ホーム"><span class="brand-icon">✳</span><span>おやこ旅支度<small>OYAKO JOURNEY</small></span></a><span class="private">端末に保存 · 登録不要</span></header>`; }
function options(name, items, value) { return items.map(([v,label,sub]) => `<label class="option"><input type="radio" name="${name}" value="${v}" ${value===v?'checked':''} required><span><strong>${label}</strong>${sub?`<small>${sub}</small>`:''}</span></label>`).join(''); }
function form() {
 return `<section class="setup"><div class="eyebrow">YOUR FAMILY, YOUR JOURNEY</div><h1>${configured?'旅のプランを見直す':'親子の新しい毎日へ。<br>準備は、ひとつずつ。'}</h1><p class="intro">いくつかの質問から、あなたの家族に合った<br class="mobile-break">マレーシア留学の準備リストをつくります。</p><form id="profile-form"><fieldset><legend><span>01</span>どのくらい滞在する予定ですか？</legend><div class="choices three">${options('duration',[['short','短期','休暇を使って体験'],['year','約1年','暮らすように学ぶ'],['move','長期・移住','新しい生活の拠点へ']],profile.duration)}</div></fieldset><fieldset><legend><span>02</span>お母さんは現地でどう過ごしますか？</legend><div class="choices two">${options('activity',[['guardian','子どもの留学に付き添う','ガーディアンとして滞在'],['work','現地で働く','雇用主と就労パスを確認'],['nomad','リモートワークをする','DE Rantauの条件を確認'],['study','自分も学校で学ぶ','学生パスと帯同条件を確認']],profile.activity)}</div></fieldset><fieldset><legend><span>03</span>お子さんの年齢は？<small>複数選択できます</small></legend><div class="choices three">${[['preschool','未就学'],['elementary','小学生'],['secondary','中学生以上']].map(([v,l])=>`<label class="option"><input type="checkbox" name="children" value="${v}" ${profile.children.includes(v)?'checked':''}><span><strong>${l}</strong></span></label>`).join('')}</div></fieldset><div class="form-bottom"><label class="date-input">出発予定日 <small>未定でも始められます</small><input type="date" name="departure" value="${escape(profile.departure)}"></label><fieldset><legend>現地で運転する予定は？</legend><div class="choices">${options('driving',[['yes','ある・検討中'],['no','ない']],profile.driving)}</div></fieldset></div><p id="form-error" class="error" role="alert"></p><div class="form-actions">${configured?'<button type="button" class="secondary" id="cancel-edit">戻る</button>':''}<button class="primary" type="submit">${configured?'プランを更新する':'わが家の準備リストをつくる'} <span>→</span></button></div><p class="privacy-note">回答と進捗は、このブラウザだけに保存されます。</p></form></section>`;
}
function taskCard(task) {
 const checked = !!completed[task.id], due = dueDate(profile.departure,task.daysBefore), overdue = due && due < today() && !checked;
 return `<article class="task ${checked?'done':''}"><div class="task-main"><label class="check"><input type="checkbox" data-task="${task.id}" ${checked?'checked':''} aria-label="${escape(task.title)}を完了"><span aria-hidden="true"></span></label><div class="task-text"><div class="task-meta"><span>${categories[task.category]}</span><span class="${overdue?'overdue':''}">${due?`${dateLabel(due)}まで${overdue?' · 期限を確認':''}`:`出発${task.daysBefore}日前が目安`}</span></div><h3>${escape(task.title)}</h3><details><summary>準備のヒントを見る</summary><p>${escape(task.description)}</p><p class="task-note">${escape(task.note)}</p><div class="source"><span class="badge">要確認</span><span>最終確認：${task.lastVerified || '未確認'}</span>${task.sourceUrl?`<a href="${escape(task.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escape(task.sourceLabel)} ↗</a>`:'<span>家族で相談する項目</span>'}</div>${task.sourceUrl?'<small>リンクは確認窓口です。最新条件を確認したことを示すものではありません。</small>':''}</details></div></div></article>`;
}
function dashboard() {
 const selected = tasks.filter(t=>matches(t,profile)), counts = progress(selected,completed), percent = Math.round(counts.done/counts.total*100)||0;
 const visible = selected.filter(t => (category==='all'||t.category===Number(category)) && (filter==='all'||(filter==='done'?completed[t.id]:!completed[t.id])));
 const days = profile.departure ? Math.round((new Date(`${profile.departure}T12:00:00Z`)-new Date(`${today()}T12:00:00Z`))/86400000) : null;
 return `<section class="dashboard"><div class="page-top"><div><div class="eyebrow">A LITTLE CLOSER, EVERY DAY</div><h1>わが家の、留学準備。</h1><p class="intro">あせらず、一歩ずつ。今日できることから始めよう。</p></div><button class="secondary" id="edit">プランを変更 <span>↗</span></button></div><div class="overview"><div class="journey"><div class="journey-top"><span class="pill">MY FAMILY PLAN</span><span>✈</span></div><h2>日本 <span>··········· →</span> マレーシア</h2><p>${{short:'短期留学',year:'約1年の留学',move:'長期・移住'}[profile.duration]} <span>／</span> ${{guardian:'子どもの留学に付き添う',work:'現地で働く',nomad:'リモートワーク',study:'自分も学校で学ぶ'}[profile.activity]}</p><div class="departure">${days===null?'出発日は、決まってからで大丈夫。':`出発予定 ${escape(profile.departure.replaceAll('-','.'))}<strong>${days>0?`あと ${days} 日`:days===0?'今日が出発日':'出発予定日を過ぎています'}</strong>`}</div></div><div class="progress-card"><div><span class="eyebrow">YOUR PROGRESS</span><h2>少しずつ、準備できています。</h2><p><strong>${counts.done}</strong> / ${counts.total} 個の準備が完了</p></div><div class="ring" style="--percent:${percent}%"><span>${percent}<small>%</small></span></div><progress value="${counts.done}" max="${counts.total}" aria-label="全体の準備進捗"></progress></div></div><div class="workspace"><aside><h2>準備のカテゴリー</h2><nav aria-label="カテゴリー"><button data-category="all" class="${category==='all'?'active':''}"><span>すべての準備</span><b>${counts.done}/${counts.total}</b></button>${categories.map((c,i)=>{const ct=progress(selected.filter(t=>t.category===i),completed);return `<button data-category="${i}" class="${category===String(i)?'active':''}"><span>${c}</span><b>${ct.done}/${ct.total}</b></button>`;}).join('')}</nav><div class="aside-note"><span>✳</span><p>大きな一歩も、<br>小さな準備の積み重ねから。</p></div></aside><section class="task-list"><div class="list-header"><div><h2>${category==='all'?'準備のチェックリスト':categories[Number(category)]}</h2><span>${visible.length}件の準備</span></div><div class="filters" aria-label="完了状態で絞り込み">${[['all','すべて'],['todo','未完了'],['done','完了']].map(([v,l])=>`<button data-filter="${v}" aria-pressed="${filter===v}" class="${filter===v?'active':''}">${l}</button>`).join('')}</div></div><p class="list-help">期限は準備を進める目安です。学校・申請先の締切を優先してください。</p>${visible.length?visible.map(taskCard).join(''):'<div class="empty">✳<h3>この条件の準備はありません</h3><p>ほかのカテゴリーや表示条件を選んでみましょう。</p></div>'}</section></div></section>`;
}
function render() {
 app.innerHTML = `${header()}<main>${storageWarning?`<p class="warning" role="alert">${escape(storageWarning)}</p>`:''}${!configured||editing?form():dashboard()}</main><footer><span>✳ おやこ旅支度</span><p>このリストは準備の目安で、法的アドバイスではありません。<br>ビザ・就労・入学条件は、必ず各窓口で最新情報をご確認ください。</p><small>あなたと家族の、新しい一歩に。</small></footer>`;
 document.querySelector('#profile-form')?.addEventListener('submit',e=>{
 e.preventDefault(); const fd=new FormData(e.target); const children=fd.getAll('children');
 if(!children.length) { document.querySelector('#form-error').textContent='お子さんの年齢を1つ以上選んでください。'; return; }
 profile={duration:fd.get('duration'),activity:fd.get('activity'),children,departure:fd.get('departure'),driving:fd.get('driving')};
 configured=true;editing=false;save();render();window.scrollTo(0,0);
 });
 document.querySelector('#edit')?.addEventListener('click',()=>{editing=true;render();window.scrollTo(0,0);});
 document.querySelector('#cancel-edit')?.addEventListener('click',()=>{editing=false;render();});
 document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category;render();}));
 document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;render();}));
 document.querySelectorAll('[data-task]').forEach(b=>b.addEventListener('change',()=>{const y=window.scrollY;completed[b.dataset.task]=b.checked;save();render();window.scrollTo(0,y);document.querySelector(`[data-task="${b.dataset.task}"]`)?.focus({preventScroll:true});}));
}
try {
 const response=await fetch(`${base}tasks.json`); if(!response.ok) throw Error('load'); tasks=await response.json();render();
} catch { app.innerHTML=`${header()}<main><h1>準備リストを読み込めませんでした</h1><p>通信を確認して、もう一度お試しください。</p><button class="primary" onclick="location.reload()">再読み込み</button></main>`; }
if('serviceWorker' in navigator) navigator.serviceWorker.register(`${base}sw.js`).catch(()=>{});
