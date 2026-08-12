(function(){

const TIER_MAP = {};
TIERS.forEach(t => TIER_MAP[t.key] = t);

const ICONS = {
  overall: '<path d="M4 20h16M6 20V10l3-3 3 3v7M15 20V6l3-3 3 3v14" />',
  sword: '<path d="M14.5 3.5 20.5 9.5 11 19l-4 1 1-4 9.5-9.5z" /><path d="M6 18l2 2" /><path d="M3 21l2.5-2.5" />',
  smp: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 10h16M10 4v16"/>',
  mace: '<circle cx="17" cy="6" r="3"/><path d="M17 9v9M14 22h6" /><circle cx="15" cy="4.5" r=".6" fill="currentColor" stroke="none"/><circle cx="19.5" cy="4.5" r=".6" fill="currentColor" stroke="none"/><circle cx="17" cy="8.5" r=".6" fill="currentColor" stroke="none"/>',
  diasmp: '<path d="M12 3 20 9l-8 12L4 9z"/><path d="M4 9h16M12 3v18"/>',
  diapot: '<path d="M12 3 20 9l-8 12L4 9z"/><path d="M9 12c0-1.3 1.3-1.6 1.3-2.8 0-.7-.5-1-1-1.2M12 15c0-1.3 1.3-1.6 1.3-2.8" stroke-width="1.3"/>',
  uhc: '<path d="M12 21s-7-4.4-9.3-8.8C1.2 9 3 6 6.2 6c2 0 3.3 1.2 5.8 3.6C14.5 7.2 15.8 6 17.8 6 21 6 22.8 9 21.3 12.2 19 16.6 12 21 12 21z"/>',
  axe: '<path d="M13 3c3 0 6 2 6 5-1 1.5-3 2-5 1.5L10 14" /><path d="M9 12l6 6-2 2-6-6z" /><path d="M4 21l3-5" />',
};

// ---------- Supabase client ----------
let supabaseClient = null;
let supabaseReady = false;
try{
  if(SUPABASE_URL && !SUPABASE_URL.includes('YOUR-PROJECT') && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('YOUR-ANON')){
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    supabaseReady = true;
  }
}catch(e){ console.error('Supabase init failed', e); }

let state = {
  players: [],   // [{ id, name, name_key, tiers: { gm: {tier, order} | null } }]
  tab: 'overall',
  view: 'ranked', // 'ranked' | 'board' (board only applies to gamemode tabs)
  search: '',
  editingId: null,
  loaded: false,
  isAdmin: false,
};

function icon(name, extraClass){
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="${extraClass||''}">${ICONS[name]||''}</svg>`;
}
function skinUrl(name, size){ return `https://mc-heads.net/avatar/${encodeURIComponent(name)}/${size||36}`; }
function tierOf(player, gm){ return player.tiers && player.tiers[gm] ? player.tiers[gm].tier : null; }
function tierPoints(tierKey){ return tierKey && TIER_MAP[tierKey] ? TIER_MAP[tierKey].points : 0; }
function overallPoints(player){ return GAMEMODES.reduce((sum, gm) => sum + tierPoints(tierOf(player, gm.key)), 0); }
function tierClass(tierKey){
  const t = TIER_MAP[tierKey];
  if(!t) return '';
  return `tier-g${t.group}-${t.high ? 'ht' : 'lt'}`;
}
function titleFor(points){
  return TITLES.find(t => points >= t.min) || TITLES[TITLES.length - 1];
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* ---------- Data loading ---------- */
async function loadPlayers(){
  if(!supabaseReady){
    document.getElementById('setupBanner').classList.remove('hidden');
    state.players = [];
    state.loaded = true;
    render();
    return;
  }
  const { data, error } = await supabaseClient.from('players').select('*').order('name');
  if(error){
    console.error(error);
    document.getElementById('ctPanel').innerHTML = `<div class="ct-empty">Couldn't load the leaderboard. Check your Supabase config and that the table exists.</div>`;
    return;
  }
  state.players = (data || []).map(row => ({ ...row, tiers: row.tiers || {} }));
  state.loaded = true;
  render();
}

function subscribeRealtime(){
  if(!supabaseReady) return;
  supabaseClient
    .channel('players-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => {
      loadPlayers();
    })
    .subscribe();
}

/* ---------- Auth ---------- */
async function initAuth(){
  if(!supabaseReady) return;
  const { data: { session } } = await supabaseClient.auth.getSession();
  state.isAdmin = !!session;
  updateAdminUI();

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    state.isAdmin = !!session;
    updateAdminUI();
    render();
  });
}

function updateAdminUI(){
  document.getElementById('openAdd').classList.toggle('hidden', !state.isAdmin);
  const btn = document.getElementById('openAdmin');
  const label = document.getElementById('adminLabel');
  btn.classList.toggle('logged-in', state.isAdmin);
  label.textContent = state.isAdmin ? 'Admin (log out)' : 'Admin Login';
}

async function handleAdminBtnClick(){
  if(!supabaseReady){
    alert('Connect Supabase first (edit config.js) — see README.md.');
    return;
  }
  if(state.isAdmin){
    await supabaseClient.auth.signOut();
    return;
  }
  document.getElementById('ctLoginError').classList.add('hidden');
  document.getElementById('ctLoginEmail').value = '';
  document.getElementById('ctLoginPassword').value = '';
  document.getElementById('ctLoginOverlay').classList.remove('hidden');
  document.getElementById('ctLoginEmail').focus();
}

async function handleLoginSubmit(){
  const email = document.getElementById('ctLoginEmail').value.trim();
  const password = document.getElementById('ctLoginPassword').value;
  const errEl = document.getElementById('ctLoginError');
  errEl.classList.add('hidden');
  if(!email || !password) return;

  const btn = document.getElementById('ctLoginBtn');
  btn.disabled = true;
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  btn.disabled = false;

  if(error){
    errEl.textContent = error.message || 'Login failed.';
    errEl.classList.remove('hidden');
    return;
  }
  document.getElementById('ctLoginOverlay').classList.add('hidden');
}

function nextOrderFor(gm, tierKey){
  let max = -1;
  state.players.forEach(p => {
    const t = p.tiers[gm];
    if(t && t.tier === tierKey && typeof t.order === 'number') max = Math.max(max, t.order);
  });
  return max + 1;
}

/* ---------- Rendering: Tabs ---------- */
function renderTabs(){
  const tabs = [{key:'overall', label:'Overall'}, ...GAMEMODES];
  const el = document.getElementById('ctTabs');
  el.innerHTML = tabs.map(t => `
    <button class="ct-tab ${state.tab === t.key ? 'active' : ''}" data-tab="${t.key}">
      ${icon(t.key)}${t.label}
    </button>
  `).join('');
  el.querySelectorAll('.ct-tab').forEach(btn => {
    btn.addEventListener('click', () => { state.tab = btn.dataset.tab; render(); });
  });

  const toggle = document.getElementById('ctViewToggle');
  if(state.tab === 'overall'){
    toggle.classList.add('hidden');
  } else {
    toggle.classList.remove('hidden');
    toggle.querySelectorAll('.ct-vbtn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === state.view);
      btn.onclick = () => { state.view = btn.dataset.view; render(); };
    });
  }
}

/* ---------- Rendering: Ranked table ---------- */
function getFilteredPlayers(){
  const q = state.search.trim().toLowerCase();
  let list = state.players;
  if(q) list = list.filter(p => p.name.toLowerCase().includes(q));
  return list;
}

function renderPanel(){
  const panel = document.getElementById('ctPanel');
  const meta = document.getElementById('ctTabMeta');

  if(!state.loaded){
    panel.innerHTML = `<div class="ct-empty">Loading leaderboard...</div>`;
    meta.textContent = '';
    return;
  }

  if(state.tab !== 'overall' && state.view === 'board'){
    renderBoard(panel, meta);
    return;
  }

  let list = getFilteredPlayers();

  if(state.tab === 'overall'){
    list = list.map(p => ({ p, pts: overallPoints(p) }))
                .sort((a,b) => b.pts - a.pts || a.p.name.localeCompare(b.p.name));
    meta.textContent = `${list.length} player${list.length===1?'':'s'}`;

    if(list.length === 0){ panel.innerHTML = emptyState(); bindEmptyState(); return; }

    panel.innerHTML = `
      <div class="ct-row head overall" style="grid-template-columns:40px 40px 1fr 80px 1fr 64px;">
        <div>#</div><div></div><div>Player</div><div>PTS</div><div>Tiers</div><div></div>
      </div>
      ${list.map((entry, i) => overallRowHtml(entry.p, entry.pts, i+1)).join('')}
    `;
  } else {
    const gm = state.tab;
    list = list.filter(p => tierOf(p, gm))
                .map(p => ({ p, tier: tierOf(p, gm), pts: tierPoints(tierOf(p, gm)) }))
                .sort((a,b) => b.pts - a.pts || a.p.name.localeCompare(b.p.name));
    meta.textContent = `${list.length} ranked player${list.length===1?'':'s'}`;

    if(list.length === 0){ panel.innerHTML = emptyState(gm); bindEmptyState(); return; }

    panel.innerHTML = `
      <div class="ct-row head mode" style="grid-template-columns:40px 40px 1fr 100px 70px 64px;">
        <div>#</div><div></div><div>Player</div><div>Tier</div><div>PTS</div><div></div>
      </div>
      ${list.map((entry, i) => modeRowHtml(entry.p, entry.tier, entry.pts, i+1)).join('')}
    `;
  }

  bindRowActions();
}

function emptyState(gm){
  const msg = gm
    ? `No one&rsquo;s been ranked in ${GAMEMODES.find(g=>g.key===gm).label} yet.`
    : `No players yet.`;
  return `<div class="ct-empty">
    <div class="big">${msg}</div>
    <div>${state.isAdmin ? 'Add a player and assign their tiers to start the board.' : 'Check back once the admin ranks some players.'}</div>
    ${state.isAdmin ? `<button id="ctEmptyAdd">+ Add Player</button>` : ''}
  </div>`;
}
function bindEmptyState(){
  const btn = document.getElementById('ctEmptyAdd');
  if(btn) btn.addEventListener('click', openAddModal);
}

function rankClass(i){
  if(i===1) return 'r1'; if(i===2) return 'r2'; if(i===3) return 'r3'; return '';
}

function overallRowHtml(p, pts, rank){
  const chips = GAMEMODES.map(gm => {
    const t = tierOf(p, gm.key);
    if(!t) return `<span class="ct-chip empty">&mdash;</span>`;
    return `<span class="ct-chip ${tierClass(t)}">${t}</span>`;
  }).join('');
  const title = titleFor(pts);
  return `
    <div class="ct-row body overall ${rank===1?'rank1':''}" data-id="${p.id}" style="grid-template-columns:40px 40px 1fr 80px 1fr 64px;">
      <div class="ct-rank ${rankClass(rank)}">${rank}</div>
      <img class="ct-skin" src="${skinUrl(p.name,36)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
      <div class="ct-player">
        <div class="ct-pname-col">
          <span class="ct-pname">${escapeHtml(p.name)}</span>
          <span class="ct-ptitle ${title.color}">${title.label}</span>
        </div>
      </div>
      <div class="ct-points">${pts}</div>
      <div class="ct-chips">${chips}</div>
      <div class="ct-actions">
        ${state.isAdmin ? `
          <button class="ct-iconbtn edit" data-id="${p.id}" aria-label="Edit ${escapeHtml(p.name)}">${editSvg()}</button>
          <button class="ct-iconbtn danger del" data-id="${p.id}" aria-label="Remove ${escapeHtml(p.name)}">${trashSvg()}</button>
        ` : ''}
      </div>
    </div>`;
}

function modeRowHtml(p, tier, pts, rank){
  return `
    <div class="ct-row body mode ${rank===1?'rank1':''}" data-id="${p.id}" style="grid-template-columns:40px 40px 1fr 100px 70px 64px;">
      <div class="ct-rank ${rankClass(rank)}">${rank}</div>
      <img class="ct-skin" src="${skinUrl(p.name,36)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
      <div class="ct-player"><span class="ct-pname">${escapeHtml(p.name)}</span></div>
      <div><span class="ct-badge ${tierClass(tier)}">${tier}</span></div>
      <div class="ct-points">${pts}</div>
      <div class="ct-actions">
        ${state.isAdmin ? `
          <button class="ct-iconbtn edit" data-id="${p.id}" aria-label="Edit ${escapeHtml(p.name)}">${editSvg()}</button>
          <button class="ct-iconbtn danger del" data-id="${p.id}" aria-label="Remove ${escapeHtml(p.name)}">${trashSvg()}</button>
        ` : ''}
      </div>
    </div>`;
}

function editSvg(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>`; }
function trashSvg(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/></svg>`; }
function upSvg(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 15l7-7 7 7"/></svg>`; }
function downSvg(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9l7 7 7-7"/></svg>`; }

function bindRowActions(){
  document.querySelectorAll('.ct-iconbtn.edit').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); openEditModal(btn.dataset.id); });
  });
  document.querySelectorAll('.ct-iconbtn.del').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); confirmDelete(btn.dataset.id); });
  });
}

/* ---------- Rendering: Tier board ---------- */
function renderBoard(panel, meta){
  const gm = state.tab;
  const q = state.search.trim().toLowerCase();
  meta.textContent = `Tier board`;

  const cols = TIERS.map(t => {
    let players = state.players.filter(p => tierOf(p, gm) === t.key);
    if(q) players = players.filter(p => p.name.toLowerCase().includes(q));
    players = players.sort((a,b) => (a.tiers[gm].order ?? 0) - (b.tiers[gm].order ?? 0));

    const rows = players.map((p, i) => `
      <div class="ct-board-row" data-id="${p.id}">
        <img src="${skinUrl(p.name,22)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
        <span class="nm" ${state.isAdmin ? `data-edit-id="${p.id}" style="cursor:pointer"` : ''}>${escapeHtml(p.name)}</span>
        ${state.isAdmin ? `
          <div class="ct-board-arrows">
            <button class="ct-arrow up" data-gm="${gm}" data-tier="${t.key}" data-id="${p.id}" ${i===0?'disabled':''} aria-label="Move up">${upSvg()}</button>
            <button class="ct-arrow down" data-gm="${gm}" data-tier="${t.key}" data-id="${p.id}" ${i===players.length-1?'disabled':''} aria-label="Move down">${downSvg()}</button>
          </div>
        ` : ''}
      </div>
    `).join('');

    return `
      <div class="ct-board-col">
        <div class="ct-board-head ${tierClass(t.key)}"><span>${t.key}</span><span class="cnt">${players.length} &middot; ${t.points}pt</span></div>
        <div class="ct-board-list">${rows || `<div class="ct-board-empty">Empty</div>`}</div>
      </div>
    `;
  }).join('');

  panel.className = 'ct-board';
  panel.innerHTML = cols;

  panel.querySelectorAll('.nm').forEach(el => {
    el.addEventListener('click', () => openEditModal(el.dataset.editId));
  });
  panel.querySelectorAll('.ct-arrow').forEach(btn => {
    btn.addEventListener('click', () => {
      movePlayerInTier(btn.dataset.gm, btn.dataset.tier, btn.dataset.id, btn.classList.contains('up') ? 'up' : 'down');
    });
  });
}

async function movePlayerInTier(gm, tierKey, playerId, direction){
  const list = state.players.filter(p => tierOf(p, gm) === tierKey)
                              .sort((a,b) => (a.tiers[gm].order ?? 0) - (b.tiers[gm].order ?? 0));
  const idx = list.findIndex(p => p.id === playerId);
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if(idx === -1 || swapIdx < 0 || swapIdx >= list.length) return;

  const a = list[idx], b = list[swapIdx];
  const aOrder = a.tiers[gm].order, bOrder = b.tiers[gm].order;
  a.tiers[gm] = { ...a.tiers[gm], order: bOrder };
  b.tiers[gm] = { ...b.tiers[gm], order: aOrder };

  render(); // optimistic

  if(supabaseReady){
    await Promise.all([
      supabaseClient.from('players').update({ tiers: a.tiers }).eq('id', a.id),
      supabaseClient.from('players').update({ tiers: b.tiers }).eq('id', b.id),
    ]);
  }
}

/* ---------- Delete ---------- */
async function confirmDelete(id){
  const p = state.players.find(pl => pl.id === id);
  if(!p) return;
  if(!confirm(`Remove ${p.name} from the leaderboard?`)) return;

  state.players = state.players.filter(pl => pl.id !== id);
  render();

  if(supabaseReady){
    const { error } = await supabaseClient.from('players').delete().eq('id', id);
    if(error) console.error(error);
  }
}

/* ---------- Modal ---------- */
function renderGamemodeGrid(tiers){
  const grid = document.getElementById('ctGamemodeGrid');
  grid.innerHTML = GAMEMODES.map(gm => `
    <div class="ct-gfield">
      <label>${icon(gm.key)}${gm.label}</label>
      <select data-gm="${gm.key}">
        <option value="">Untested</option>
        ${TIERS.map(t => `<option value="${t.key}" ${tiers[gm.key] && tiers[gm.key].tier===t.key?'selected':''}>${t.key} &middot; ${t.points}pt</option>`).join('')}
      </select>
    </div>
  `).join('');
}

function openAddModal(){
  state.editingId = null;
  document.getElementById('ctModalTitle').innerHTML = 'ADD PLAYER<button id="ctCloseModal" aria-label="Close">&times;</button>';
  document.getElementById('ctCloseModal').addEventListener('click', closeModal);
  document.getElementById('ctNameInput').value = '';
  document.getElementById('ctSkinPreview').src = '';
  document.getElementById('ctPreviewLabel').textContent = 'Skin preview';
  document.getElementById('ctDeleteBtn').classList.add('hidden');
  document.getElementById('ctSaveBtn').disabled = true;
  renderGamemodeGrid({});
  showModal();
  document.getElementById('ctNameInput').focus();
}

function openEditModal(id){
  const p = state.players.find(pl => pl.id === id);
  if(!p) return;
  state.editingId = id;
  document.getElementById('ctModalTitle').innerHTML = 'EDIT PLAYER<button id="ctCloseModal" aria-label="Close">&times;</button>';
  document.getElementById('ctCloseModal').addEventListener('click', closeModal);
  document.getElementById('ctNameInput').value = p.name;
  updateSkinPreview(p.name);
  document.getElementById('ctDeleteBtn').classList.remove('hidden');
  document.getElementById('ctSaveBtn').disabled = false;
  renderGamemodeGrid(p.tiers);
  showModal();
}

function showModal(){ document.getElementById('ctOverlay').classList.remove('hidden'); }
function closeModal(){ document.getElementById('ctOverlay').classList.add('hidden'); }

function updateSkinPreview(name){
  const img = document.getElementById('ctSkinPreview');
  const label = document.getElementById('ctPreviewLabel');
  if(name && name.trim()){
    img.src = skinUrl(name.trim(), 40);
    label.textContent = name.trim();
  } else {
    img.src = '';
    label.textContent = 'Skin preview';
  }
}

function collectTiersFromGrid(existingTiers){
  const tiers = {};
  document.querySelectorAll('#ctGamemodeGrid select').forEach(sel => {
    const gm = sel.dataset.gm;
    const val = sel.value;
    if(!val){ tiers[gm] = null; return; }
    const prev = existingTiers && existingTiers[gm];
    if(prev && prev.tier === val){
      tiers[gm] = prev; // unchanged, keep its order
    } else {
      tiers[gm] = { tier: val, order: nextOrderFor(gm, val) };
    }
  });
  return tiers;
}

async function savePlayerFromModal(){
  const nameInput = document.getElementById('ctNameInput');
  const name = nameInput.value.trim();
  if(!name) return;
  const nameKey = name.toLowerCase();
  const existing = state.editingId ? state.players.find(p => p.id === state.editingId) : null;
  const tiers = collectTiersFromGrid(existing ? existing.tiers : null);

  document.getElementById('ctSaveBtn').disabled = true;

  if(!supabaseReady){
    // No backend configured — just reflect locally so the UI is still usable/previewable.
    if(existing){
      existing.name = name; existing.name_key = nameKey; existing.tiers = tiers;
    } else {
      state.players.push({ id: 'local-' + Date.now(), name, name_key: nameKey, tiers });
    }
    closeModal(); render();
    return;
  }

  const { data, error } = await supabaseClient
    .from('players')
    .upsert({ id: existing ? existing.id : undefined, name, name_key: nameKey, tiers }, { onConflict: 'name_key' })
    .select();

  if(error){
    console.error(error);
    alert('Could not save that player — see console for details.');
    document.getElementById('ctSaveBtn').disabled = false;
    return;
  }

  await loadPlayers();
  closeModal();
}

/* ---------- Wiring ---------- */
function wireStatic(){
  document.getElementById('openAdd').addEventListener('click', openAddModal);
  document.getElementById('openAdmin').addEventListener('click', handleAdminBtnClick);
  document.getElementById('ctCloseLogin').addEventListener('click', () => {
    document.getElementById('ctLoginOverlay').classList.add('hidden');
  });
  document.getElementById('ctLoginOverlay').addEventListener('click', (e) => {
    if(e.target.id === 'ctLoginOverlay') e.currentTarget.classList.add('hidden');
  });
  document.getElementById('ctLoginBtn').addEventListener('click', handleLoginSubmit);
  document.getElementById('ctLoginPassword').addEventListener('keydown', (e) => {
    if(e.key === 'Enter') handleLoginSubmit();
  });
  document.getElementById('ctOverlay').addEventListener('click', (e) => {
    if(e.target.id === 'ctOverlay') closeModal();
  });
  document.getElementById('ctNameInput').addEventListener('input', (e) => {
    updateSkinPreview(e.target.value);
    document.getElementById('ctSaveBtn').disabled = !e.target.value.trim();
  });
  document.getElementById('ctSaveBtn').addEventListener('click', savePlayerFromModal);
  document.getElementById('ctDeleteBtn').addEventListener('click', async () => {
    if(state.editingId && confirm('Remove this player from the leaderboard?')){
      const id = state.editingId;
      closeModal();
      await confirmDelete(id);
    }
  });
  document.getElementById('ctSearch').addEventListener('input', (e) => {
    state.search = e.target.value;
    render();
  });
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      closeModal();
      document.getElementById('ctLoginOverlay').classList.add('hidden');
    }
  });
}

function render(){
  const panel = document.getElementById('ctPanel');
  panel.className = 'ct-panel';
  renderTabs();
  renderPanel();
}

wireStatic();
loadPlayers();
subscribeRealtime();
initAuth();

})();
