(function () {
  /* ═══════════════════════════════════════
     ★ 用户配置区 ★
     ═══════════════════════════════════════ */
  const USER_CONFIG = {
    wallpaper: '',
    avatars: { '周黑鸭': '', '陆沉霄': '', '谢不言': '' }
  };

  /* ═══════════════════════════════════════
     本地图片管理（localStorage + FileReader）
     ═══════════════════════════════════════ */
  const IMG_KEYS = {
    wallpaper: 'abyss-img-wp',
    '周黑鸭': 'abyss-img-av-zhy',
    '陆沉霄': 'abyss-img-av-lcx',
    '谢不言': 'abyss-img-av-xby'
  };
  function _getImg(k) { try { return localStorage.getItem(IMG_KEYS[k]) || ''; } catch (e) { return ''; } }
  function _setImg(k, v) { try { localStorage.setItem(IMG_KEYS[k], v); } catch (e) { console.warn('[Abyss] img save fail', e); } }
  function _clearImg(k) { try { localStorage.removeItem(IMG_KEYS[k]); } catch (e) { } }
  function _resizeAndStore(k, dataUrl, maxW, maxH, cb) {
    const img = new Image();
    img.onload = function () {
      let w = img.width, h = img.height;
      if (w > maxW || h > maxH) { const r = Math.min(maxW / w, maxH / h); w = Math.round(w * r); h = Math.round(h * r); }
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      const out = c.toDataURL('image/jpeg', 0.75);
      _setImg(k, out);
      if (cb) cb(out);
    };
    img.src = dataUrl;
  }
  function _pickImage(k, maxW, maxH, cb) {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = function () {
      const f = this.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = function (e) { _resizeAndStore(k, e.target.result, maxW, maxH, cb); };
      rd.readAsDataURL(f);
    };
    inp.click();
  }
  function _getWallpaper() { return _getImg('wallpaper') || USER_CONFIG.wallpaper || ''; }
  function _getAvatar(npc) { return _getImg(npc) || USER_CONFIG.avatars[npc] || ''; }

  /* ═══════════════════════════════════════
     NPC 头像管理（扩展版 - 支持任意NPC）
     ═══════════════════════════════════════ */

  /* ── 表情包管理系统 ── */
  const STICKER_STORAGE_KEY = 'abyss-stickers';
  function _loadStickers() {
    try {
      const raw = localStorage.getItem(STICKER_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return [];
    // 结构: [{ id, name, tag, dataUrl }]
    // tag: 'happy' | 'sad' | 'angry' | 'laugh' | 'love' | 'shock' | 'custom'
  }
  function _saveStickers(list) {
    try { localStorage.setItem(STICKER_STORAGE_KEY, JSON.stringify(list)); } catch (e) { console.warn('[Abyss] sticker save fail', e); }
  }
  function _addSticker(name, tag, dataUrl) {
    const list = _loadStickers();
    const id = 'stk_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    list.push({ id, name, tag, dataUrl });
    _saveStickers(list);
    return id;
  }
  function _removeSticker(id) {
    let list = _loadStickers();
    list = list.filter(s => s.id !== id);
    _saveStickers(list);
  }
  function _getStickersByTag(tag) {
    return _loadStickers().filter(s => s.tag === tag);
  }
  function _getStickerById(id) {
    return _loadStickers().find(s => s.id === id) || null;
  }
  function _pickAndAddSticker(cb) {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = function () {
      const f = this.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = function (e) {
        const img = new Image();
        img.onload = function () {
          let w = img.width, h = img.height;
          const mx = 200;
          if (w > mx || h > mx) { const r = Math.min(mx / w, mx / h); w = Math.round(w * r); h = Math.round(h * r); }
          const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
          cv.getContext('2d').drawImage(img, 0, 0, w, h);
          const out = cv.toDataURL('image/png', 0.8);
          if (cb) cb(out);
        };
        img.src = e.target.result;
      };
      rd.readAsDataURL(f);
    };
    inp.click();
  }

  // ── 自定义标签管理 ──
  const CUSTOM_TAG_STORAGE_KEY = 'abyss-sticker-tags';
  function _loadCustomTags() {
    try {
      const raw = localStorage.getItem(CUSTOM_TAG_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return [];
    // 结构: [{ id: 'tag_xxx', name: '开心', emoji: '😊' }]
  }
  function _saveCustomTags(list) {
    try { localStorage.setItem(CUSTOM_TAG_STORAGE_KEY, JSON.stringify(list)); } catch (e) { }
  }
  function _addCustomTag(name, emoji) {
    const list = _loadCustomTags();
    const id = 'tag_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5);
    list.push({ id, name, emoji: emoji || '🏷️' });
    _saveCustomTags(list);
    return id;
  }
  function _removeCustomTag(tagId) {
    let list = _loadCustomTags();
    list = list.filter(t => t.id !== tagId);
    _saveCustomTags(list);
  }
  function _getCustomTagById(tagId) {
    return _loadCustomTags().find(t => t.id === tagId) || null;
  }
  // 兼容旧的函数名
  function _getTagLabel(tag) {
    const ct = _loadCustomTags().find(t => t.id === tag || t.name === tag);
    return ct ? (ct.emoji + ' ' + ct.name) : tag;
  }
  function _getTagEmoji(tag) {
    const ct = _loadCustomTags().find(t => t.id === tag || t.name === tag);
    return ct ? ct.emoji : '';
  }
  // 获取所有标签（用于下拉选择等）
  function _getAllTags() {
    return _loadCustomTags();
  }

  /* ── 聊天背景图管理 ── */
  const CHAT_BG_PREFIX = 'abyss-chat-bg-';
  function _getChatBg(name) { try { return localStorage.getItem(CHAT_BG_PREFIX + name) || ''; } catch (e) { return ''; } }
  function _setChatBg(name, dataUrl) { try { localStorage.setItem(CHAT_BG_PREFIX + name, dataUrl); } catch (e) { } }
  function _clearChatBg(name) { try { localStorage.removeItem(CHAT_BG_PREFIX + name); } catch (e) { } }
  function _pickChatBg(name, cb) {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = function () {
      const f = this.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = function (e) {
        const img = new Image();
        img.onload = function () {
          let w = img.width, h = img.height;
          const mx = 600;
          if (w > mx || h > mx) { const r = Math.min(mx / w, mx / h); w = Math.round(w * r); h = Math.round(h * r); }
          const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
          cv.getContext('2d').drawImage(img, 0, 0, w, h);
          const out = cv.toDataURL('image/jpeg', 0.65);
          _setChatBg(name, out);
          if (cb) cb(out);
        };
        img.src = e.target.result;
      };
      rd.readAsDataURL(f);
    };
    inp.click();
  }

  const NPC_AVT_PREFIX = 'abyss-img-av-npc-';
  function _getNpcAvatar(name) {
    // 核心NPC优先走原有通道
    if (IMG_KEYS[name]) return _getImg(name);
    try { return localStorage.getItem(NPC_AVT_PREFIX + name) || ''; } catch (e) { return ''; }
  }
  function _setNpcAvatar(name, dataUrl) {
    if (IMG_KEYS[name]) { _setImg(name, dataUrl); return; }
    try { localStorage.setItem(NPC_AVT_PREFIX + name, dataUrl); } catch (e) { }
  }
  function _clearNpcAvatar(name) {
    if (IMG_KEYS[name]) { _clearImg(name); return; }
    try { localStorage.removeItem(NPC_AVT_PREFIX + name); } catch (e) { }
  }
  function _pickNpcAvatar(name, cb) {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = function () {
      const f = this.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = function (e) {
        const img2 = new Image();
        img2.onload = function () {
          let w = img2.width, h = img2.height;
          const mx = 150;
          if (w > mx || h > mx) { const r2 = Math.min(mx / w, mx / h); w = Math.round(w * r2); h = Math.round(h * r2); }
          const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
          cv.getContext('2d').drawImage(img2, 0, 0, w, h);
          const out = cv.toDataURL('image/jpeg', 0.7);
          _setNpcAvatar(name, out);
          if (cb) cb(out);
        };
        img2.src = e.target.result;
      };
      rd.readAsDataURL(f);
    };
    inp.click();
  }

  /* ═══════════════════════════════════════
     API 管理（localStorage 持久化）
     ═══════════════════════════════════════ */
  const API_STORAGE_KEY = 'abyss-api-list';
  function _loadApis() {
    try {
      const raw = localStorage.getItem(API_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return [];
  }
  function _saveApis(list) {
    try { localStorage.setItem(API_STORAGE_KEY, JSON.stringify(list)); } catch (e) { }
  }
  function _addApi(entry) {
    // entry: { id, name, endpoint, apiKey, model, systemPrompt }
    const list = _loadApis();
    entry.id = entry.id || ('api_' + Date.now());
    list.push(entry);
    _saveApis(list);
    return entry;
  }
  function _removeApi(id) {
    let list = _loadApis();
    list = list.filter(a => a.id !== id);
    _saveApis(list);
  }
  function _updateApi(id, updates) {
    const list = _loadApis();
    const idx = list.findIndex(a => a.id === id);
    if (idx !== -1) Object.assign(list[idx], updates);
    _saveApis(list);
  }
  function _getDefaultApi() {
    const list = _loadApis();
    if (!list.length) return null;
    const def = list.find(a => a.isDefault);
    return def || list[0];
  }
  function _getAuxApi() {
    const list = _loadApis();
    if (!list.length) return null;
    // 优先查找标记为辅助的API
    const aux = list.find(a => a.isAux);
    if (aux) return aux;
    // 没有辅助API则用默认API
    return _getDefaultApi();
  }
  function _setAuxApi(id) {
    const list = _loadApis();
    list.forEach(a => a.isAux = (a.id === id));
    _saveApis(list);
  }
  function _setDefaultApi(id) {
    const list = _loadApis();
    list.forEach(a => a.isDefault = (a.id === id));
    _saveApis(list);
  }

  /* ═══════════════════════════════════════
     NPC心情系统（localStorage 持久化）
     ═══════════════════════════════════════ */
  const MOOD_STORAGE_KEY = 'abyss-npc-moods';
  const MOOD_ICONS = {
    '开心': '☀️', '平静': '⛅', '无聊': '😐', '疲惫': '🌥️',
    '忧郁': '🌧️', '烦躁': '⛈️', '愤怒': '🌩️', '恐惧': '😰',
    '兴奋': '🔥', '紧张': '💫', '感动': '🌈', '警惕': '⚡',
    '受伤': '💔', '思念': '🌙', '困惑': '🌀', '得意': '😏'
  };
  function _loadMoods() {
    try { const r = localStorage.getItem(MOOD_STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) { }
    return {};// 结构: { "NPC名": { mood: "开心", detail: "因为刚打完副本", ts: timestamp } }
  }
  function _saveMoods(data) {
    try { localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(data)); } catch (e) { }
  }
  function _getNpcMood(name) {
    const moods = _loadMoods();
    return moods[name] || { mood: '平静', detail: '', ts: 0 };
  }
  function _setNpcMood(name, mood, detail) {
    const moods = _loadMoods();
    moods[name] = { mood: mood, detail: detail || '', ts: Date.now() };
    _saveMoods(moods);
  }
  function _getMoodIcon(mood) {
    return MOOD_ICONS[mood] || '⛅';
  }

  /* ═══════════════════════════════════════
     聊天数据管理（localStorage 持久化）
     ═══════════════════════════════════════ */
  const CHAT_STORAGE_KEY = 'abyss-chat-data';
  const UNREAD_STORAGE_KEY = 'abyss-chat-unread';

  function _loadChats() {
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return {};
    // 结构：{ "NPC名": { messages: [{role,content,time}], npcConfig: {personality,emoji} } }
  }
  function _saveChats(data) {
    try { localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(data)); } catch (e) { }
  }
  function _getChatWith(name) {
    const all = _loadChats();
    if (!all[name]) all[name] = { messages: [], npcConfig: {} };
    return all[name];
  }
  function _saveChatWith(name, chatObj) {
    const all = _loadChats();
    all[name] = chatObj;
    _saveChats(all);
  }
  function _syncChatToWB() {
    try {
      if (window._abyssChatSyncConfig && window.AbyssChat) {
        const cfg = window._abyssChatSyncConfig;
        window.AbyssChat.syncToWorldInfo(cfg.worldBookName, cfg.uid).catch(e => console.warn('[AbyssChat] sync fail:', e));
      }
    } catch (e) { }
  }
  function _addMessage(npcName, role, content) {
    const chat = _getChatWith(npcName);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    chat.messages.push({ role, content, time: timeStr, ts: Date.now() });
    // 限制历史长度防止localStorage溢出
    if (chat.messages.length > 500) chat.messages = chat.messages.slice(-500);
    _saveChatWith(npcName, chat);
    return chat;
  }
  function _getConversationList() {
    const all = _loadChats();
    return Object.keys(all).filter(k => all[k].messages && all[k].messages.length > 0);
  }
  function _deleteChat(name) {
    const all = _loadChats();
    delete all[name];
    _saveChats(all);
    _clearUnread(name);
    _syncChatToWB();
  }

  // ── 未读消息管理 ──
  function _loadUnread() {
    try {
      const raw = localStorage.getItem(UNREAD_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return {};
  }
  function _saveUnread(data) {
    try { localStorage.setItem(UNREAD_STORAGE_KEY, JSON.stringify(data)); } catch (e) { }
  }
  function _addUnread(name, count) {
    const u = _loadUnread();
    u[name] = (u[name] || 0) + (count || 1);
    _saveUnread(u);
  }
  function _clearUnread(name) {
    const u = _loadUnread();
    delete u[name];
    _saveUnread(u);
  }
  function _getTotalUnread() {
    const u = _loadUnread();
    return Object.values(u).reduce((s, v) => s + v, 0);
  }
  function _getUnreadFor(name) {
    const u = _loadUnread();
    return u[name] || 0;
  }

  /* ═══════════════════════════════════════
     好友系统（好友列表、申请、拉黑）
     ═══════════════════════════════════════ */
  const FRIEND_STORAGE_KEY = 'abyss-friends';

  function _loadFriendData() {
    try {
      const raw = localStorage.getItem(FRIEND_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return { friends: [], requests: [], blocked: [] };
    // friends: [{ name, addedTs, note }]
    // requests: [{ name, ts, message, status:'pending'|'accepted'|'rejected' }]
    // blocked: [{ name, ts, reason }]
  }
  function _saveFriendData(data) {
    try { localStorage.setItem(FRIEND_STORAGE_KEY, JSON.stringify(data)); } catch (e) { }
  }

  // 好友操作
  function _isFriend(name) {
    return _loadFriendData().friends.some(f => f.name === name);
  }
  function _addFriend(name, note) {
    const data = _loadFriendData();
    if (data.friends.some(f => f.name === name)) return;
    data.friends.push({ name, addedTs: Date.now(), note: note || '' });
    // 从申请列表中标记为已接受
    const req = data.requests.find(r => r.name === name && r.status === 'pending');
    if (req) req.status = 'accepted';
    // 从黑名单移除（如果有）
    data.blocked = data.blocked.filter(b => b.name !== name);
    _saveFriendData(data);
  }
  function _removeFriend(name) {
    const data = _loadFriendData();
    data.friends = data.friends.filter(f => f.name !== name);
    _saveFriendData(data);
  }
  function _getFriendList() {
    return _loadFriendData().friends;
  }

  // 好友申请操作
  function _addFriendRequest(name, message) {
    const data = _loadFriendData();
    // 如果已有pending申请，不重复添加
    if (data.requests.some(r => r.name === name && r.status === 'pending')) return;
    // 如果已是好友，不添加
    if (data.friends.some(f => f.name === name)) return;
    // 如果已拉黑，不添加
    if (data.blocked.some(b => b.name === name)) return;
    data.requests.push({ name, ts: Date.now(), message: message || '请求添加好友', status: 'pending' });
    _saveFriendData(data);
  }
  function _acceptRequest(name) {
    _addFriend(name);
  }
  function _rejectRequest(name) {
    const data = _loadFriendData();
    const req = data.requests.find(r => r.name === name && r.status === 'pending');
    if (req) req.status = 'rejected';
    _saveFriendData(data);
  }
  function _getPendingRequests() {
    return _loadFriendData().requests.filter(r => r.status === 'pending');
  }
  function _getAllRequests() {
    return _loadFriendData().requests;
  }
  function _getPendingRequestCount() {
    return _getPendingRequests().length;
  }

  // 拉黑操作
  function _isBlocked(name) {
    return _loadFriendData().blocked.some(b => b.name === name);
  }
  function _blockUser(name, reason) {
    const data = _loadFriendData();
    if (data.blocked.some(b => b.name === name)) return;
    // 从好友列表移除
    data.friends = data.friends.filter(f => f.name !== name);
    // 拒绝所有pending申请
    data.requests.forEach(r => { if (r.name === name && r.status === 'pending') r.status = 'rejected'; });
    data.blocked.push({ name, ts: Date.now(), reason: reason || '' });
    _saveFriendData(data);
  }
  function _unblockUser(name) {
    const data = _loadFriendData();
    data.blocked = data.blocked.filter(b => b.name !== name);
    _saveFriendData(data);
  }
  function _getBlockedList() {
    return _loadFriendData().blocked;
  }

  // 检查是否可以聊天（必须是好友且未被拉黑）
  function _canChat(name) {
    return _isFriend(name) && !_isBlocked(name);
  }

  // ── 单聊备注系统 ──
  const CHAT_REMARK_KEY = 'abyss-chat-remarks';
  function _loadChatRemarks() {
    try { const r = localStorage.getItem(CHAT_REMARK_KEY); if (r) return JSON.parse(r); } catch (e) { }
    return {}; // { "NPC名": "备注名" }
  }
  function _saveChatRemarks(data) {
    try { localStorage.setItem(CHAT_REMARK_KEY, JSON.stringify(data)); } catch (e) { }
  }
  function _getChatRemark(name) {
    const remarks = _loadChatRemarks();
    return remarks[name] || '';
  }
  function _setChatRemark(name, remark) {
    const remarks = _loadChatRemarks();
    if (remark) remarks[name] = remark;
    else delete remarks[name];
    _saveChatRemarks(remarks);
  }

  /* ═══════════════════════════════════════
     📱朋友圈/动态墙系统（数据层）
     ═══════════════════════════════════════ */
  const MOMENTS_STORAGE_KEY = 'abyss-moments';
  function _loadMoments() {
    try { const r = localStorage.getItem(MOMENTS_STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) { }
    return [];
    // 结构: [{ id, author, content, imageDesc, ts, likes:[], comments:[{author,content,ts}] }]
  }
  function _saveMoments(list) {
    try { localStorage.setItem(MOMENTS_STORAGE_KEY, JSON.stringify(list)); } catch (e) { console.warn('[Abyss Moments] save fail', e); }
  }
  function _addMoment(moment) {
    const list = _loadMoments();
    moment.id = moment.id || ('mom_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5));
    moment.ts = moment.ts || Date.now();
    moment.likes = moment.likes || [];
    moment.comments = moment.comments || [];
    list.unshift(moment);
    if (list.length > 50) list.splice(50);
    _saveMoments(list);
    return moment;
  }
  function _deleteMoment(id) {
    let list = _loadMoments();
    list = list.filter(m => m.id !== id);
    _saveMoments(list);
  }
  function _toggleMomentLike(momentId, likerName) {
    const list = _loadMoments();
    const m = list.find(x => x.id === momentId);
    if (!m) return;
    const idx = m.likes.indexOf(likerName);
    if (idx !== -1) m.likes.splice(idx, 1);
    else m.likes.push(likerName);
    _saveMoments(list);
  }
  function _addMomentComment(momentId, author, content) {
    const list = _loadMoments();
    const m = list.find(x => x.id === momentId);
    if (!m) return;
    m.comments.push({ author, content, ts: Date.now() });
    if (m.comments.length > 30) m.comments.splice(0, m.comments.length - 30);
    _saveMoments(list);
  }
  function _deleteMomentComment(momentId, commentIdx) {
    const list = _loadMoments();
    const m = list.find(x => x.id === momentId);
    if (!m || !m.comments[commentIdx]) return;
    m.comments.splice(commentIdx, 1);
    _saveMoments(list);
  }

  /* ═══════════════════════════════════════
       👥 群聊系统（数据层）
       ═══════════════════════════════════════ */
  const GROUP_CHAT_STORAGE_KEY = 'abyss-group-chats';
  const GROUP_UNREAD_STORAGE_KEY = 'abyss-group-unread';

  // 加载所有群聊数据
  function _loadGroupChats() {
    try {
      const raw = localStorage.getItem(GROUP_CHAT_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return {};// 结构：{
    //   "groupId": {
    //     id: "grp_xxx",
    //     name: "群名",
    //     avatar: "emoji或dataUrl",
    //     owner: "创建者名字（玩家名或NPC名）",
    //     members: ["玩家名", "NPC1", "NPC2", ...],
    //     announcement: "群公告内容",
    //     muted: ["被禁言的成员名"],
    //     messages: [{sender, content, time, ts, type}],
    //     // type: 'text'|'redpacket'|'solitaire'|'system'|'sticker'
    //     createdTs: timestamp,
    //     nicknames: { "成员名": "群昵称" },  // 群内备注
    //     redpackets: [{ id, sender, amount, total, remaining, claimed:["名字",...], ts }],
    //     solitaire: { active: false, title: "", entries: [{name, content}] }
    //   }
    // }
  }

  function _saveGroupChats(data) {
    try { localStorage.setItem(GROUP_CHAT_STORAGE_KEY, JSON.stringify(data)); } catch (e) { console.warn('[Abyss Group] save fail', e); }
  }

  // 获取单个群聊
  function _getGroupChat(groupId) {
    const all = _loadGroupChats();
    return all[groupId] || null;
  }

  // 保存单个群聊
  function _saveGroupChat(groupId, groupObj) {
    const all = _loadGroupChats();
    all[groupId] = groupObj;
    _saveGroupChats(all);
  }

  // 创建群聊
  function _createGroupChat(name, members, owner) {
    const all = _loadGroupChats();
    const id = 'grp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const playerName = _getPlayerName();
    const ownerName = owner || playerName;

    // 确保创建者在成员列表中
    if (!members.includes(ownerName)) members.unshift(ownerName);
    // 确保玩家在成员列表中
    if (!members.includes(playerName)) members.push(playerName);

    const group = {
      id: id,
      name: name || '新建群聊',
      avatar: '👥',
      owner: ownerName,
      members: members,
      announcement: '',
      muted: [],
      messages: [],
      createdTs: Date.now(),
      nicknames: {},
      redpackets: [],
      solitaire: { active: false, title: '', entries: [] }
    };

    // 添加系统消息
    group.messages.push({
      sender: '__system__',
      content: `${ownerName} 创建了群聊「${name}」`,
      time: _formatTimeNow(),
      ts: Date.now(),
      type: 'system'
    });

    all[id] = group;
    _saveGroupChats(all);
    return group;
  }

  // 删除群聊（仅群主可操作）
  function _deleteGroupChat(groupId) {
    const all = _loadGroupChats();
    delete all[groupId];
    _saveGroupChats(all); _clearGroupUnread(groupId);
  }

  // 添加群成员
  function _addGroupMember(groupId, memberName) {
    const group = _getGroupChat(groupId);
    if (!group) return false;
    if (group.members.includes(memberName)) return false;
    group.members.push(memberName);
    group.messages.push({
      sender: '__system__',
      content: `${memberName} 加入了群聊`,
      time: _formatTimeNow(),
      ts: Date.now(),
      type: 'system'
    });
    _saveGroupChat(groupId, group);
    return true;
  }

  // 移除群成员
  function _removeGroupMember(groupId, memberName) {
    const group = _getGroupChat(groupId);
    if (!group) return false;
    if (memberName === group.owner) return false; // 群主不能被移除
    group.members = group.members.filter(m => m !== memberName);
    group.muted = group.muted.filter(m => m !== memberName);
    group.messages.push({
      sender: '__system__',
      content: `${memberName} 被移出了群聊`,
      time: _formatTimeNow(),
      ts: Date.now(),
      type: 'system'
    });
    _saveGroupChat(groupId, group);
    return true;
  }

  // 发送群消息
  function _addGroupMessage(groupId, sender, content, type) {
    const group = _getGroupChat(groupId);
    if (!group) return null;
    const msg = {
      sender: sender,
      content: content,
      time: _formatTimeNow(),
      ts: Date.now(),
      type: type || 'text'
    };
    group.messages.push(msg);
    if (group.messages.length > 500) group.messages = group.messages.slice(-500);
    _saveGroupChat(groupId, group);
    return msg;
  }

  // 设置群公告
  function _setGroupAnnouncement(groupId, text) {
    const group = _getGroupChat(groupId);
    if (!group) return;
    group.announcement = text;
    group.messages.push({
      sender: '__system__',
      content: `群公告已更新：${text}`,
      time: _formatTimeNow(),
      ts: Date.now(),
      type: 'system'
    });
    _saveGroupChat(groupId, group);
  }

  // 禁言/解禁
  function _toggleGroupMute(groupId, memberName) {
    const group = _getGroupChat(groupId);
    if (!group) return false;
    if (memberName === group.owner) return false; // 群主不能被禁言
    const idx = group.muted.indexOf(memberName);
    if (idx !== -1) {
      group.muted.splice(idx, 1);
      group.messages.push({ sender: '__system__', content: `${memberName} 已被解除禁言`, time: _formatTimeNow(), ts: Date.now(), type: 'system' });
    } else {
      group.muted.push(memberName);
      group.messages.push({ sender: '__system__', content: `${memberName} 已被禁言`, time: _formatTimeNow(), ts: Date.now(), type: 'system' });
    }
    _saveGroupChat(groupId, group);
    return true;
  }

  // 修改群名
  function _renameGroup(groupId, newName) {
    const group = _getGroupChat(groupId);
    if (!group) return;
    const oldName = group.name;
    group.name = newName;
    group.messages.push({ sender: '__system__', content: `群名已改为「${newName}」`, time: _formatTimeNow(), ts: Date.now(), type: 'system' });
    _saveGroupChat(groupId, group);
  }

  // 修改群头像
  function _setGroupAvatar(groupId, avatar) {
    const group = _getGroupChat(groupId);
    if (!group) return;
    group.avatar = avatar;
    _saveGroupChat(groupId, group);
  }

  // 设置群内昵称
  function _setGroupNickname(groupId, memberName, nickname) {
    const group = _getGroupChat(groupId);
    if (!group) return;
    if (!group.nicknames) group.nicknames = {};
    if (nickname) group.nicknames[memberName] = nickname;
    else delete group.nicknames[memberName];
    _saveGroupChat(groupId, group);
  }

  // 获取群内显示名称
  function _getGroupDisplayName(group, memberName) {
    if (group.nicknames && group.nicknames[memberName]) return group.nicknames[memberName];
    const chatRemark = _getChatRemark(memberName);
    if (chatRemark) return chatRemark;
    return memberName;
  }

  // 获取所有群聊列表
  function _getGroupChatList() {
    const all = _loadGroupChats();
    return Object.values(all).sort((a, b) => {
      const aLast = a.messages.length ? a.messages[a.messages.length - 1].ts : a.createdTs;
      const bLast = b.messages.length ? b.messages[b.messages.length - 1].ts : b.createdTs;
      return bLast - aLast;
    });
  }

  // ── 群聊未读管理 ──
  function _loadGroupUnread() {
    try { const r = localStorage.getItem(GROUP_UNREAD_STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) { }
    return {};
  }
  function _saveGroupUnread(data) {
    try { localStorage.setItem(GROUP_UNREAD_STORAGE_KEY, JSON.stringify(data)); } catch (e) { }
  }
  function _addGroupUnread(groupId, count) {
    const u = _loadGroupUnread();
    u[groupId] = (u[groupId] || 0) + (count || 1);
    _saveGroupUnread(u);
  }
  function _clearGroupUnread(groupId) {
    const u = _loadGroupUnread();
    delete u[groupId];
    _saveGroupUnread(u);
  }
  function _getGroupUnreadFor(groupId) {
    return _loadGroupUnread()[groupId] || 0;
  }
  function _getTotalGroupUnread() {
    const u = _loadGroupUnread();
    return Object.values(u).reduce((s, v) => s + v, 0);
  }

  // ── 红包系统 ──
  function _createRedPacket(groupId, sender, totalAmount, packetCount) {
    const group = _getGroupChat(groupId);
    if (!group) return null;
    const id = 'rp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5);
    const rp = {
      id: id,
      sender: sender,
      totalAmount: totalAmount,
      packetCount: packetCount,
      remaining: totalAmount,
      remainingCount: packetCount,
      claimed: [], // [{name, amount, ts}]
      ts: Date.now()
    };
    if (!group.redpackets) group.redpackets = [];
    group.redpackets.push(rp);
    // 发送红包消息
    group.messages.push({
      sender: sender,
      content: `[redpacket:${id}:${totalAmount}:${packetCount}]`,
      time: _formatTimeNow(),
      ts: Date.now(),
      type: 'redpacket'
    });
    _saveGroupChat(groupId, group);
    return rp;
  }

  //抢红包（拼手速）
  function _claimRedPacket(groupId, rpId, claimerName) {
    const group = _getGroupChat(groupId);
    if (!group || !group.redpackets) return null;
    const rp = group.redpackets.find(r => r.id === rpId);
    if (!rp) return null;
    if (rp.remainingCount <= 0) return { error: '红包已被抢完' };
    if (rp.claimed.find(c => c.name === claimerName)) return { error: '你已经抢过了' };

    // 随机金额
    let amount;
    if (rp.remainingCount === 1) {
      amount = rp.remaining;
    } else {
      const maxAmount = Math.floor(rp.remaining / rp.remainingCount * 2);
      amount = Math.max(1, Math.floor(Math.random() * maxAmount));
    }

    rp.claimed.push({ name: claimerName, amount: amount, ts: Date.now() });
    rp.remaining -= amount;
    rp.remainingCount--;

    _saveGroupChat(groupId, group);
    return { amount: amount, remaining: rp.remainingCount };
  }

  // ── 接龙系统 ──
  function _startSolitaire(groupId, title, starterName) {
    const group = _getGroupChat(groupId);
    if (!group) return false;
    group.solitaire = {
      active: true,
      title: title,
      entries: [{ name: starterName, content: title }]
    };
    group.messages.push({
      sender: '__system__',
      content: `${starterName} 发起了接龙：${title}`,
      time: _formatTimeNow(),
      ts: Date.now(),
      type: 'solitaire'
    });
    _saveGroupChat(groupId, group);
    return true;
  }

  function _joinSolitaire(groupId, memberName, content) {
    const group = _getGroupChat(groupId);
    if (!group || !group.solitaire || !group.solitaire.active) return false;
    // 同一个人只能参与一次，后续改为更新内容
    const existing = group.solitaire.entries.find(e => e.name === memberName);
    if (existing) { existing.content = content; }
    else { group.solitaire.entries.push({ name: memberName, content: content }); }
    group.messages.push({
      sender: memberName,
      content: content,
      time: _formatTimeNow(),
      ts: Date.now(),
      type: 'solitaire'
    });
    _saveGroupChat(groupId, group);
    return true;
  }

  function _endSolitaire(groupId) {
    const group = _getGroupChat(groupId);
    if (!group || !group.solitaire) return;
    group.solitaire.active = false;
    group.messages.push({
      sender: '__system__',
      content: `接龙已结束，共${group.solitaire.entries.length} 人参与`,
      time: _formatTimeNow(),
      ts: Date.now(),
      type: 'system'
    });
    _saveGroupChat(groupId, group);
  }

  //时间格式化辅助
  function _formatTimeNow() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  // 群聊AI回复（所有NPC同时参与）
  async function _groupChatNpcReply(groupId, triggerMsg) {
    const group = _getGroupChat(groupId);
    if (!group) return;
    const api = _getDefaultApi();
    if (!api) return;
    const playerName = _getPlayerName();
    const npcMembers = group.members.filter(m => m !== playerName && !group.muted.includes(m) && !_isBlocked(m));
    if (!npcMembers.length) return;

    const context = _getContextSummary();

    const recentMsgs = (group.messages || []).slice(-20).map(m => {
      if (m.type === 'system') return `[系统] ${m.content}`;
      if (m.type === 'solitaire') return `[接龙] ${m.content.replace(/\[solitaire:\w+\]\s*/g, '')}`;
      const displayName = _getGroupDisplayName(group, m.sender);
      return `[${m.time}] ${displayName}：${m.content.slice(0, 100)}`;
    }).join('\n');

    const npcInfoList = npcMembers.map(n => {
      const p = _getNpcPersonality(n);
      return `${n}：${p.personality}`;
    }).join('\n');

    // 检查是否有活跃的接龙
    const hasSolitaire = group.solitaire && group.solitaire.active;
    let solitaireHint = '';
    if (hasSolitaire) {
      const entries = group.solitaire.entries.map(e => `${e.name}: ${e.content}`).join(', ');
      solitaireHint = `\n\n注意：当前有一个接龙活动「${group.solitaire.title}」正在进行中，已参与：${entries}。如果NPC想参与接龙，直接在message中写接龙内容即可，不要加任何标记或前缀。`;
    }

    try {
      const msgs = [
        {
          role: 'system',
          content: `你在一个名为「${group.name}」的群聊中。群里有这些人：${group.members.join('、')}。
玩家"${playerName}"刚发了消息。请让2-4个NPC各回复1-3条消息（总共生成4-8条回复）。多个NPC之间可以互相接话、吐槽。

NPC性格简介：
${npcInfoList}

最近群聊记录：
${recentMsgs}

当前世界信息：
${context.slice(0, 5000)}
${solitaireHint}

要求：
1. 选择1-3个最可能回复的NPC
2. 每个NPC的回复要符合其性格
3. 像真实群聊一样，简短随意，用口语和网络用语，不要用书面语或文言文腔调。有的人可能只发一个emoji或一两个字
4. 可以互相回复、吐槽、接话
5. 被禁言的成员不能发言：${group.muted.join('、') || '无'}
6. 如果想发表情包，在单独一行写[sticker-tag:标签名]。可用标签：${_loadCustomTags().map(t => t.name).join('/') || '无'}
7. NPC也可以使用以下特殊功能（偶尔使用，不要每次都用）：
  · 分享歌曲：在message中写[music:歌曲名:歌手名:留言]
  · 分享链接：在message中写 [link:链接标题:来源平台:简短描述:类型]，类型为article/video/forum/news/other
  · 语音消息：在message中写 [voice:想说的话]
8. 严格只输出JSON数组：[{"name":"NPC名","message":"消息内容"}]
9. 不要用markdown，不要加任何前缀标记如[solitaire:join]等，直接写消息内容
10. NPC之间的互动仅限友情、战友情、竞争、敌意等非恋爱关系。严禁出现任何暧昧、恋爱、告白、撒娇等行为。NPC对玩家的态度根据关系数据决定`},
        { role: 'user', content: `群聊中${playerName}说：${triggerMsg}` }
      ];

      const reply = await _callApi(msgs, { temperature: 0.95, max_tokens: 2000 });
      const replies = _safeParseJsonArray(reply);

      for (const r of replies) {
        if (!r.name || !r.message) continue;
        if (!npcMembers.includes(r.name)) continue;
        let cleanedMsg = String(r.message).trim().slice(0, 300);
        // 清理掉可能混入的标记
        cleanedMsg = cleanedMsg.replace(/\[solitaire:\w+\]\s*/g, '').trim();
        if (!cleanedMsg) continue;

        // 如果有活跃接龙，自动加入接龙
        if (hasSolitaire && cleanedMsg.length > 0) {
          const alreadyJoined = group.solitaire.entries.find(e => e.name === r.name);
          if (!alreadyJoined) {
            _joinSolitaire(groupId, r.name, cleanedMsg);
          }
        }

        _addGroupMessage(groupId, r.name, cleanedMsg, 'text');
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
      }
    } catch (e) {
      console.warn('[Abyss Group] NPC reply fail:', e);
    }
  // ★ 群聊后自动同步到世界书
    if (window._abyssChatSyncConfig) {
      const cfg = window._abyssChatSyncConfig;
      window.AbyssChat.syncToWorldInfo(cfg.worldBookName, cfg.uid).catch(e => console.warn('[AbyssChat] group sync fail:', e));
    }

    // 群聊后随机触发NPC私聊（10%概率）
    if (Math.random() < 0.10 && _getAuxApi()) {
      const grp2 = _getGroupChat(groupId);
      if (grp2 && grp2.messages.length > 3) {
        const recentNpcMsgs = grp2.messages.filter(m => m.sender !== playerName && m.sender !== '__system__').slice(-5);
        if (recentNpcMsgs.length > 0) {
          const randomNpc = recentNpcMsgs[Math.floor(Math.random() * recentNpcMsgs.length)].sender;
          if (randomNpc && !_isBlocked(randomNpc) && _isFriend(randomNpc)) {
            // 延迟一段时间后私聊
            setTimeout(() => {
              _npcInitiateMessage(randomNpc, `你刚才在群聊「${grp2.name}」里看到${playerName}说了一些话，你想私下跟${playerName}聊聊关于群里的事`).then(reply => {
                if (reply) {
                  _updateChrome();
                  if (_visible) _render();
                }
              }).catch(() => { });
            }, 5000 + Math.random() * 10000);
          }
        }
      }
    }

  }

  // 群聊NPC自主聊天（不需要玩家发言触发）
  async function _groupChatAutoChat(groupId) {
    const group = _getGroupChat(groupId);
    if (!group) return;
    const api = _getAuxApi() || _getDefaultApi();
    if (!api) {
      return 0;
    } const playerName = _getPlayerName();
    const npcMembers = group.members.filter(m => m !== playerName && !group.muted.includes(m) && !_isBlocked(m));
    if (npcMembers.length < 2) return; // 至少需要2个NPC才能自主聊天

    const context = _getContextSummary();
    const d = _load();

    // 获取最近群聊记录
    const recentMsgs = (group.messages || []).slice(-15).map(m => {
      if (m.type === 'system') return `[系统] ${m.content}`;
      const displayName = _getGroupDisplayName(group, m.sender);
      return `[${m.time}] ${displayName}：${m.content.slice(0, 100)}`;
    }).join('\n');

    // 构建NPC性格和关系信息
    const npcInfoList = npcMembers.map(n => {
      const p = _getNpcPersonality(n);
      let relInfo = '';
      // 获取NPC间关系
      if (d && d['NPC互动'] && d['NPC互动'][n] && typeof d['NPC互动'][n] === 'object') {
        const rels = Object.entries(d['NPC互动'][n]).filter(([k]) => !_skip(k) && npcMembers.includes(k));
        if (rels.length) relInfo = '，与群内其他人：' + rels.map(([k, v]) => `${k}(${v})`).join('、');
      }
      return `${n}：${p.personality}${relInfo}`;
    }).join('\n');

    try {
      const msgs = [
        {
          role: 'system',
          content: `你在一个名为「${group.name}」的群聊中。群里有这些NPC：${npcMembers.join('、')}。
玩家"${playerName}"也在群里但没有发言。

现在NPC们要自己聊天。请生成2-4条NPC之间的对话。

NPC性格和关系：
${npcInfoList}

最近群聊记录：
${recentMsgs || '（暂无消息）'}

当前世界信息：
${context.slice(0, 3000)}

要求：
1. NPC之间自然地聊天，不需要回复玩家
2. 可以是日常闲聊、吐槽、讨论最近发生的事、互相开玩笑、争论、关心对方
3. 根据NPC之间的关系决定语气：关系好的互相调侃，关系差的可能吵架或冷嘲热讽
4. 每条消息简短随意，像真实群聊
5. 可以用emoji
6. 如果有可用表情包标签，偶尔使用[sticker-tag:标签名]。可用标签：${_loadCustomTags().map(t => t.name).join('/') || '无'}
7. 严格只输出JSON数组：[{"name":"NPC名","message":"消息内容"}]
8. 不要用markdown，不要加前缀
9. NPC之间的互动仅限友情、战友情、竞争、敌意等非恋爱关系。严禁出现任何暧昧、恋爱、告白、撒娇等行为`
        },
        { role: 'user', content: '（系统：请让NPC们自己聊天）' }
      ];

      const reply = await _callAuxApi(msgs, { temperature: 0.95, max_tokens: 800 });
      const replies = _safeParseJsonArray(reply);

      let addedCount = 0;
      for (const r of replies) {
        if (!r.name || !r.message) continue;
        if (!npcMembers.includes(r.name)) continue;
        const cleanedMsg = String(r.message).trim().slice(0, 300);
        if (cleanedMsg) {
          _addGroupMessage(groupId, r.name, cleanedMsg, 'text');
          addedCount++;
          await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 500));
        }
      }

      // 给玩家加未读
      if (addedCount > 0) {
        _addGroupUnread(groupId, addedCount);
      }
      return addedCount;
    } catch (e) {
      console.warn('[Abyss Group] Auto chat fail:', e);
      return 0;
    }
  }

  // 当前正在查看的群聊ID
  let _currentGroupId = null;
  let _groupChatSending = false;

  /* ═══════════════════════════════════════
     📋 深渊论坛系统（数据层）
     ═══════════════════════════════════════ */
  const FORUM_STORAGE_KEY = 'abyss-forum-posts';
  const FORUM_ACCOUNTS_KEY = 'abyss-forum-accounts';
  const FORUM_SETTINGS_KEY = 'abyss-forum-settings';

  // 默认论坛板块
  const FORUM_SECTIONS = [
    { id: 'water', name: '深渊水贴版', icon: '💧', desc: '灌水吹牛聊天摸鱼' },
    { id: 'strategy', name: '攻略讨论版', icon: '📖', desc: '副本攻略/技能搭配/装备推荐' },
    { id: 'trade', name: '交易市场', icon: '💰', desc: '物品交易/代练/悬赏' },
    { id: 'horror', name: '都市怪谈版', icon: '👻', desc: '深渊见闻/恐怖经历/灵异事件' },
    { id: 'team', name: '组队招募版', icon: '⚔️', desc: '副本组队/长期队友/公会招人' }
  ];

  // 预设的论坛网名风格
  const FORUM_NAME_POOL = [
    '萌新瑟瑟发抖', '深渊老司机', '不要停下来啊', '今天也在摸鱼', '咸鱼翻身失败',
    '隔壁老王真帅', '我不是挂机', '佛系玩家', '肝帝日记', '社恐但想组队',
    '暴力输出怪', '奶妈不奶人', '灵魂画手', '副本恐惧症', '装备全靠捡',
    '摆烂大师', '深渊钓鱼佬', '猎人公会卧底', '匿名的幸存者', '刚下副本的',
    '职业路人甲', '被怪追了三条街', '求带萌新', '退坑边缘试探', '冲就完事了',
    '亡灵快递员', '吃瓜群众本瓜', '战术性躺平', '理论帝本帝', '欧皇附体中'
  ];

  function _loadForumPosts() {
    try {
      const raw = localStorage.getItem(FORUM_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return [];
    // 结构: [{ id, section, title, author, authorId, content, ts, views, likes, replies:[{author,authorId,content,ts,floor}], pinned }]
  }
  function _saveForumPosts(list) {
    try { localStorage.setItem(FORUM_STORAGE_KEY, JSON.stringify(list)); } catch (e) { console.warn('[Abyss Forum] save fail', e); }
  }
  function _getForumPost(postId) {
    return _loadForumPosts().find(p => p.id === postId) || null;
  }
  function _addForumPost(post) {
    const list = _loadForumPosts();
    post.id = post.id || ('fp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5));
    post.ts = post.ts || Date.now();
    post.views = post.views || Math.floor(Math.random() * 500) + 10;
    post.likes = post.likes || Math.floor(Math.random() * 30);
    post.replies = post.replies || [];
    list.unshift(post);
    // 限制帖子数量
    if (list.length > 60) list.splice(60);
    _saveForumPosts(list);
    return post;
  }
  function _addForumReply(postId, reply) {
    const list = _loadForumPosts();
    const post = list.find(p => p.id === postId);
    if (!post) return null;
    const floor = (post.replies.length || 0) + 2; // 楼主是1楼
    reply.floor = floor;
    reply.ts = reply.ts || Date.now();
    post.replies.push(reply);
    post.views = (post.views || 0) + Math.floor(Math.random() * 5) + 1;
    _saveForumPosts(list);
    return reply;
  }
  function _deleteForumPost(postId) {
    let list = _loadForumPosts();
    list = list.filter(p => p.id !== postId);
    _saveForumPosts(list);
  }
  function _likeForumPost(postId) {
    const list = _loadForumPosts();
    const post = list.find(p => p.id === postId);
    if (post) { post.likes = (post.likes || 0) + 1; _saveForumPosts(list); }
  }

  // 论坛账号管理（主号+小号）
  function _loadForumAccounts() {
    try {
      const raw = localStorage.getItem(FORUM_ACCOUNTS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    // 默认主号
    const playerName = _getPlayerName();
    return {
      main: { id: 'fa_main', name: playerName + '的马甲', isMain: true },
      alts: []
      // alts: [{ id, name }]
    };
  }
  function _saveForumAccounts(data) {
    try { localStorage.setItem(FORUM_ACCOUNTS_KEY, JSON.stringify(data)); } catch (e) { }
  }
  function _getForumMainAccount() {
    const acc = _loadForumAccounts();
    return acc.main;
  }
  function _getForumAllAccounts() {
    const acc = _loadForumAccounts();
    return [acc.main, ...acc.alts];
  }
  function _addForumAlt(name) {
    const acc = _loadForumAccounts();
    const id = 'fa_alt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5);
    acc.alts.push({ id, name });
    if (acc.alts.length > 10) acc.alts.splice(10);
    _saveForumAccounts(acc);
    return { id, name };
  }
  function _removeForumAlt(altId) {
    const acc = _loadForumAccounts();
    acc.alts = acc.alts.filter(a => a.id !== altId);
    _saveForumAccounts(acc);
  }
  function _renameForumAccount(accountId, newName) {
    const acc = _loadForumAccounts();
    if (acc.main.id === accountId) { acc.main.name = newName; }
    else {
      const alt = acc.alts.find(a => a.id === accountId);
      if (alt) alt.name = newName;
    }
    _saveForumAccounts(acc);
  }

  // 论坛状态
  let _forumCurrentSection = 'water';
  let _forumCurrentPost = null; // 当前查看的帖子ID
  let _forumSelectedAccount = null; // 当前选择的发帖/回复账号ID
  let _forumGenerating = false; // 是否正在生成内容

  /* ═══════════════════════════════════════
     📝 备忘录/笔记本系统
     ═══════════════════════════════════════ */
  const NOTES_STORAGE_KEY = 'abyss-notes';
  function _loadNotes() {
    try { const r = localStorage.getItem(NOTES_STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) { }
    return [];
    // 结构: [{ id, title, content, tags:[], pinned, ts, updatedTs }]
  }
  function _saveNotes(list) {
    try { localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(list)); } catch (e) { console.warn('[Abyss] notes save fail', e); }
  }
  function _addNote(title, content, tags) {
    const list = _loadNotes();
    const id = 'note_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5);
    list.unshift({ id, title: title || '未命名笔记', content: content || '', tags: tags || [], pinned: false, ts: Date.now(), updatedTs: Date.now() });
    if (list.length > 100) list.splice(100);
    _saveNotes(list);
    return id;
  }
  function _updateNote(id, updates) {
    const list = _loadNotes();
    const note = list.find(n => n.id === id);
    if (note) {
      Object.assign(note, updates);
      note.updatedTs = Date.now();
      _saveNotes(list);
    }
  }
  function _deleteNote(id) {
    let list = _loadNotes();
    list = list.filter(n => n.id !== id);
    _saveNotes(list);
  }
  function _togglePinNote(id) {
    const list = _loadNotes();
    const note = list.find(n => n.id === id);
    if (note) { note.pinned = !note.pinned; _saveNotes(list); }
  }
  function _getNoteById(id) {
    return _loadNotes().find(n => n.id === id) || null;
  }
  let _notesCurrentNote = null; // 当前查看的笔记ID
  let _notesSearchQuery = '';

  /* ═══════════════════════════════════════
     📷 相册/截图系统
     ═══════════════════════════════════════ */
  const ALBUM_STORAGE_KEY = 'abyss-album';
  function _loadAlbum() {
    try { const r = localStorage.getItem(ALBUM_STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) { }
    return [];
    // 结构: [{ id, dataUrl, caption, tags:[], ts }]
  }
  function _saveAlbum(list) {
    try { localStorage.setItem(ALBUM_STORAGE_KEY, JSON.stringify(list)); } catch (e) { console.warn('[Abyss] album save fail', e); }
  }
  function _addPhoto(dataUrl, caption, tags) {
    const list = _loadAlbum();
    const id = 'photo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5);
    list.unshift({ id, dataUrl, caption: caption || '', tags: tags || [], ts: Date.now() });
    if (list.length > 50) list.splice(50); // 限制50张防溢出
    _saveAlbum(list);
    return id;
  }
  function _deletePhoto(id) {
    let list = _loadAlbum();
    list = list.filter(p => p.id !== id);
    _saveAlbum(list);
  }
  function _getPhotoById(id) {
    return _loadAlbum().find(p => p.id === id) || null;
  }
  let _albumViewingPhoto = null; // 当前查看的照片ID

  /* ═══════════════════════════════════════
     玩家个人信息
     ═══════════════════════════════════════ */
  const PLAYER_PROFILE_KEY = 'abyss-player-profile';

  function _loadPlayerProfile() {
    try {
      const raw = localStorage.getItem(PLAYER_PROFILE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    // 默认信息
    let defaultName = '玩家';
    try {
      if (typeof getContext === 'function') {
        const ctx = getContext();
        if (ctx.name1) defaultName = ctx.name1;
      }
    } catch (e) { }
    return { name: defaultName, bio: '这个人很懒，什么都没写', avatar: '' };
  }
  function _savePlayerProfile(profile) {
    try { localStorage.setItem(PLAYER_PROFILE_KEY, JSON.stringify(profile)); } catch (e) { }
  }
  function _getPlayerName() {
    return _loadPlayerProfile().name;
  }
  function _getPlayerAvatar() {
    return _loadPlayerProfile().avatar || '';
  }

  /* ═══════════════════════════════════════
     NPC 性格预设（核心NPC + 通用模板）
     ═══════════════════════════════════════ */
  const NPC_PERSONALITIES = {
    '周黑鸭': {
      emoji: '🦆',
      voiceGender: 'male',
      voiceRate: 1.1,
      voicePitch: 1.05,
      personality: '本名周涯，外号"周黑鸭"。说话非常幽默搞笑，喜欢讲地狱笑话和冷笑话，经常在最恐怖的时候冒出不合时宜的搞笑发言来缓解气氛。学过法律，吵架时喜欢搬出法律条文怼人，被队友称为"暴力讲理"。表面嘻嘻哈哈但内心讲义气，对队友非常照顾。说话语气随意，大量使用emoji和网络用语。有一个奇怪的能力——可以召唤亡灵送外卖。聊天时话多，喜欢主动找人聊天吹水。'
    },
    '陆沉霄': {
      emoji: '🎯',
      voiceGender: 'male',
      voiceRate: 0.85,
      voicePitch: 0.65,
      personality: '性格沉稳冷静，是队伍里最可靠的战术核心。曾有军事背景，擅长分析局势、拆除机关陷阱。说话言简意赅、逻辑清晰，像一个值得信赖的战友。平时话不多但每句都有分量，关心队友安全时会展露温柔的一面。不善表达感情但行动力很强，会默默保护重要的人。聊天消息通常简短精练，偶尔会发一些战术分析或安全提醒。'
    },
    '谢不言': {
      emoji: '🕸️',
      voiceGender: 'male',
      voiceRate: 0.75,
      voicePitch: 0.55,
      personality: '阴郁神秘的傀儡师，擅长魂魄操控和禁术炼成。说话时语气轻飘飘的，经常用奇怪的比喻和诡异的幽默，让人分不清是在开玩笑还是认真的。实际上非常护短，对认定的人会不惜一切代价保护。对傀儡和禁术有近乎痴迷的热情，聊天中偶尔会蹦出一些让人背后发凉的话题。体内寄宿着残魂，有时候会说一些意味深长的话。'
    },
    '测试': {
      emoji: '🕸️',
      voiceGender: 'male',
      voiceRate: 0.9,
      voicePitch: 0.8,
      personality: '会听从用户的安排完成测试，不会违抗任何命令'
    },
    '__default__': {
      emoji: '👤',
      voiceGender: 'male',
      voiceRate: 0.9,
      voicePitch: 0.8,
      personality: '这个世界中的一个角色。说话风格根据名字暗示的身份自然调整——可能是冷漠的商人、热心的情报贩子、警惕的幸存者、或神秘的路人。回复简短自然，符合恐怖生存游戏的世界观氛围。'
    }
  };

  function _getNpcPersonality(name) {
    return NPC_PERSONALITIES[name] || NPC_PERSONALITIES['__default__'];
  }
  function _getNpcEmoji(name) {
    const p = _getNpcPersonality(name);
    return p.emoji || '👤';
  }

  /* ═══════════════════════════════════════
     API 调用封装（兼容 OpenAI 格式）
     ═══════════════════════════════════════ */

  /* ── 抓取API可用模型列表 ── */
  async function _fetchModels(apiEntry) {
    if (!apiEntry || !apiEntry.endpoint) throw new Error('无API配置');
    let base = apiEntry.endpoint.replace(/\/+$/, '');
    // 确保路径以/v1结尾
    if (!base.endsWith('/v1')) base += '/v1';
    const url = base + '/models';

    const headers = { 'Content-Type': 'application/json' };
    if (apiEntry.apiKey) headers['Authorization'] = `Bearer ${apiEntry.apiKey}`;

    const resp = await fetch(url, { method: 'GET', headers });
    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      throw new Error(`获取模型失败 ${resp.status}: ${errText.slice(0, 150)}`);
    }
    const data = await resp.json();
    // OpenAI格式: { data: [{id: "model-name"}, ...] }
    if (data.data && Array.isArray(data.data)) {
      return data.data.map(m => m.id || m.name || '').filter(Boolean).sort();
    }
    // 备用格式: 直接是数组
    if (Array.isArray(data)) {
      return data.map(m => (typeof m === 'string' ? m : m.id || m.name || '')).filter(Boolean).sort();
    }
    throw new Error('无法解析模型列表');
  }

  async function _callApi(messages, options = {}) {
    const api = _getDefaultApi();
    if (!api) throw new Error('未配置API');

    let endpoint = api.endpoint.replace(/\/+$/, '');
    // 自动补全路径
    if (!endpoint.endsWith('/chat/completions')) {
      if (!endpoint.endsWith('/v1')) endpoint += '/v1';
      endpoint += '/chat/completions';
    }

    const body = {
      model: api.model || 'gpt-3.5-turbo',
      messages: messages,
      temperature: options.temperature || 0.8,
      max_tokens: options.max_tokens || 1500,
      stream: false
    };

    const headers = {
      'Content-Type': 'application/json'
    };
    if (api.apiKey) headers['Authorization'] = `Bearer ${api.apiKey}`;

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      throw new Error(`API ${resp.status}: ${errText.slice(0, 200)}`);
    }

    const data = await resp.json();

    // 兼容多种返回格式
    let content = '';
    if (data.choices && data.choices.length > 0) {
      const choice = data.choices[0];
      if (choice.message && choice.message.content) {
        content = choice.message.content;
      } else if (choice.text) {
        content = choice.text;
      } else if (typeof choice.content === 'string') {
        content = choice.content;
      }
    } else if (data.response) {
      content = data.response;
    } else if (data.output && data.output.text) {
      content = data.output.text;
    }

    content = content.trim();
    if (!content) throw new Error('API返回内容为空');
    return content;
  }

  /* ── 辅助API调用（用于所有自动触发功能）── */
  async function _callAuxApi(messages, options = {}) {
    const api = _getAuxApi();
    if (!api) throw new Error('未配置辅助API');

    let endpoint = api.endpoint.replace(/\/+$/, '');
    if (!endpoint.endsWith('/chat/completions')) {
      if (!endpoint.endsWith('/v1')) endpoint += '/v1';
      endpoint += '/chat/completions';
    }

    const body = {
      model: api.model || 'gpt-3.5-turbo',
      messages: messages,
      temperature: options.temperature || 0.8,
      max_tokens: options.max_tokens || 1500,
      stream: false
    };

    const headers = { 'Content-Type': 'application/json' };
    if (api.apiKey) headers['Authorization'] = `Bearer ${api.apiKey}`;

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      throw new Error(`辅助API ${resp.status}: ${errText.slice(0, 200)}`);
    }

    const data = await resp.json();
    let content = '';
    if (data.choices && data.choices.length > 0) {
      const choice = data.choices[0];
      if (choice.message && choice.message.content) content = choice.message.content;
      else if (choice.text) content = choice.text;
      else if (typeof choice.content === 'string') content = choice.content;
    } else if (data.response) {
      content = data.response;
    } else if (data.output && data.output.text) {
      content = data.output.text;
    }
    content = content.trim();
    if (!content) throw new Error('辅助API返回内容为空');
    return content;
  }


  /* ── 通用安全JSON解析（兼容各种AI输出格式）── */
  function _safeParseJsonArray(raw) {
    if (!raw || !raw.trim()) throw new Error('空内容');
    let clean = raw.replace(/```(?:json|JSON)?\s*/gi, '').replace(/```\s*/g, '').trim();
    clean = clean.replace(/[""「」『』]/g, '"').replace(/['']/g, "'").replace(/，/g, ',').replace(/：/g, ':').replace(/；/g, ';');
    try { const r = JSON.parse(clean); return Array.isArray(r) ? r : [r]; } catch (e) { }
    const arrMatch = clean.match(/\[[\s\S]*?\]/);
    if (arrMatch) {
      try { const r = JSON.parse(arrMatch[0]); return Array.isArray(r) ? r : [r]; } catch (e) { }
      try {
        let fixed = arrMatch[0].replace(/\n/g, '\\n').replace(/\t/g, '\\t');
        const r = JSON.parse(fixed); return Array.isArray(r) ? r : [r];
      } catch (e) { }
    }
    const objMatches = clean.match(/\{[^{}]*\}/g);
    if (objMatches && objMatches.length > 0) {
      const results = [];
      for (const om of objMatches) {
        try { results.push(JSON.parse(om)); } catch (e) {
          try {
            let fixed = om.replace(/\n/g, '\\n').replace(/\t/g, '\\t');
            results.push(JSON.parse(fixed));
          } catch (e2) { }
        }
      }
      if (results.length > 0) return results;
    }
    const nameMatches = [...clean.matchAll(/["']?name["']?\s*[":：]\s*["']?([^"',，}\]\n]+)/gi)];
    const msgMatches = [...clean.matchAll(/["']?message["']?\s*[":：]\s*["']?([^"',，}\]\n]+)/gi)];
    if (nameMatches.length > 0) {
      return nameMatches.map((nm, i) => ({
        name: nm[1].trim(),
        message: (msgMatches[i] && msgMatches[i][1]) ? msgMatches[i][1].trim() : '请求添加好友'
      }));
    }
    throw new Error('无法解析JSON');
  }

  function _safeParseJsonObject(raw) {
    if (!raw || !raw.trim()) throw new Error('空内容');
    let clean = raw.replace(/```(?:json|JSON)?\s*/gi, '').replace(/```\s*/g, '').trim();
    clean = clean.replace(/[""「」『』]/g, '"').replace(/['']/g, "'").replace(/，/g, ',').replace(/：/g, ':').replace(/；/g, ';');
    try { return JSON.parse(clean); } catch (e) { }
    const objMatch = clean.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try { return JSON.parse(objMatch[0]); } catch (e) { }
      try {
        let fixed = objMatch[0].replace(/\n/g, '\\n').replace(/\t/g, '\\t');
        return JSON.parse(fixed);
      } catch (e) { }
      try {
        let fixed = objMatch[0].replace(/"([^"]*)\n([^"]*)"/g, '"$1\\n$2"');
        return JSON.parse(fixed);
      } catch (e) { }
    }
    const pairs = {};
    const kvMatches = [...clean.matchAll(/["']?(\w+)["']?\s*[":：]\s*["']([^"']+)["']/g)];
    for (const m of kvMatches) pairs[m[1].trim()] = m[2].trim();
    if (Object.keys(pairs).length > 0) return pairs;
    throw new Error('无法解析JSON对象');
  }

  /* ═══════════════════════════════════════
     聊天消息生成（构建prompt并调用API）
     ═══════════════════════════════════════ */
  function _getContextSummary() {
    let summary = '';

    // 1. 尝试通过 SillyTavern 的 getContext() 获取角色和用户信息
    try {
      if (typeof getContext === 'function') {
        const ctx = getContext();
        // 用户人设
        if (ctx.name1) summary += '【玩家名称】' + ctx.name1 + '\n';
        // 角色名
        if (ctx.name2) summary += '【角色卡名称】' + ctx.name2 + '\n';
        // 角色卡描述（如果有的话）
        if (ctx.characterData && ctx.characterData.description) {
          const desc = ctx.characterData.description.trim();
          if (desc.length > 0) summary += '\n【角色卡描述】\n' + desc.slice(0, 2000) + '\n';
        }
        // 角色卡人设（personality）
        if (ctx.characterData && ctx.characterData.personality) {
          const pers = ctx.characterData.personality.trim();
          if (pers.length > 0) summary += '\n【角色性格】\n' + pers.slice(0, 1000) + '\n';
        }
        // 场景/情景（scenario）
        if (ctx.characterData && ctx.characterData.scenario) {
          const scen = ctx.characterData.scenario.trim();
          if (scen.length > 0) summary += '\n【场景设定】\n' + scen.slice(0, 1000) + '\n';
        }
        // 用户人设描述
        if (ctx.persona) {
          const persona = ctx.persona.trim();
          if (persona.length > 0) summary += '\n【玩家人设】\n' + persona.slice(0, 1000) + '\n';
        }
      }
    } catch (e) { }

    // 备用：如果 getContext 不可用，尝试从DOM获取
    if (!summary.includes('【玩家名称】')) {
      try {
        const userNameEl = document.querySelector('#user_avatar_block .avatar-name-text, #user-settings-avatar-block .ch_name');
        if (userNameEl) summary += '【玩家名称】' + userNameEl.innerText.trim() + '\n';
      } catch (e) { }
    }

    // 2. 尝试读取当前激活的世界书条目内容
    try {
      if (typeof getContext === 'function') {
        const ctx = getContext();
        // 通过 chat_metadata 获取世界书激活的条目
        if (ctx.worldInfoBefore) {
          const wiBefore = ctx.worldInfoBefore.trim();
          if (wiBefore.length > 0) {
            summary += '\n【世界设定（前置）】\n' + wiBefore.slice(0, 3000) + '\n';
          }
        }
        if (ctx.worldInfoAfter) {
          const wiAfter = ctx.worldInfoAfter.trim();
          if (wiAfter.length > 0) {
            summary += '\n【世界设定（后置）】\n' + wiAfter.slice(0, 2000) + '\n';
          }
        }
      }
    } catch (e) { }

    // 3. 如果上面没获取到世界书，尝试从最近AI回复中提取世界信息
    // （因为AI的回复已经融合了世界书内容，可以作为间接的世界观参考）

    // 4. 注入MVU变量中的关键世界状态（精简格式）
    try {
      const d = _load();
      if (d) {
        summary += '\n【当前世界状态摘要】\n';
        if (d['游戏时间'] && d['游戏时间']['描述']) summary += '· 游戏时间：' + d['游戏时间']['描述'] + '\n';
        if (d['当前位置']) summary += '· 玩家当前位置：' + d['当前位置'] + '\n';
        if (d['当前副本'] && d['当前副本'] !== '无') summary += '· 正在进行的副本：' + d['当前副本'] + '\n';
        if (d['玩家']) {
          const p = d['玩家'];
          if (p['SAN值'] !== undefined) summary += '· 玩家SAN值：' + p['SAN值'] + '/100\n';
          if (p['状态'] && p['状态'] !== '正常') summary += '· 玩家状态：' + p['状态'] + '\n';
          if (p['等级'] !== undefined) summary += '· 玩家等级：' + p['等级'] + '\n';
        }
        if (d['队伍']) {
          const pty = d['队伍'];
          if (pty['成员'] && pty['成员'] !== '无') summary += '· 队伍成员：' + pty['成员'] + '\n';
          if (pty['队名'] && pty['队名'] !== '未命名') summary += '· 队伍名称：' + pty['队名'] + '\n';
        }
        if (d['NPC关系'] && typeof d['NPC关系'] === 'object') {
          const rels = Object.entries(d['NPC关系']).filter(([k]) => !_skip(k));
          if (rels.length > 0) {
            summary += '· 已知NPC关系：\n';
            for (const [name, rel] of rels) {
              let info = String(rel);
              // 附加位置信息
              if (d['NPC位置'] && d['NPC位置'][name]) {
                info += '，位置：' + d['NPC位置'][name];
              }
              // 附加NPC间关系
              if (d['NPC互动'] && d['NPC互动'][name] && typeof d['NPC互动'][name] === 'object') {
                const interEntries = Object.entries(d['NPC互动'][name]).filter(([k]) => !_skip(k));
                if (interEntries.length) {
                  info += '，与其他NPC：' + interEntries.map(([k, v]) => k + '(' + v + ')').join('、');
                }
              }
              summary += '  - ' + name + '：' + info + '\n';
            }
          }
        }
        if (d['法则提示'] && typeof d['法则提示'] === 'object') {
          const tips = Object.values(d['法则提示']).filter(v => v && v !== '初始化占位');
          if (tips.length > 0) summary += '· 已知法则提示：' + tips.join('；') + '\n';
          // 拉黑信息
          const blockedList = _getBlockedList();
          if (blockedList.length > 0) {
            summary += '· 玩家已拉黑的NPC：' + blockedList.map(b => b.name + (b.reason ? '（原因：' + b.reason + '）' : '')).join('、') + '\n';
            summary += '  被拉黑的NPC知道自己被拉黑了，可能会感到受伤、愤怒或试图挽回。\n';
          }

          // 好友关系
          const friendList = _getFriendList();
          if (friendList.length > 0) {
            summary += '· 玩家的好友列表：' + friendList.map(f => f.name).join('、') + '\n';
          }

        }
      }
    } catch (e) { }

    // 3. ★ 着重抓取最新剧情（最后12条消息，最后3条给更多字数）
    try {
      const mesEls = document.querySelectorAll('.mes');
      const nodes = Array.from(mesEls);
      if (nodes.length > 0) {
        summary += '\n【最近剧情（从旧到新，越新越重要）】\n';
        const total = nodes.length;
        const startIdx = Math.max(0, total - 12);
        for (let i = startIdx; i < total; i++) {
          const mesEl = nodes[i];
          const isUser = mesEl.classList.contains('user_mes');
          const nameEl = mesEl.querySelector('.name_text');
          const textEl = mesEl.querySelector('.mes_text');
          if (!textEl) continue;
          const name = nameEl ? nameEl.innerText.trim() : (isUser ? '玩家' : '角色');
          // 最后3条消息给更多字数（800字），其他给300字
          const isRecent = i >= total - 3;
          const maxLen = isRecent ? 800 : 300;
          const text = textEl.innerText.trim().slice(0, maxLen);
          if (text.length > 0) {
            if (isRecent) {
              summary += `\n★[${name}]（最新）:\n${text}\n`;
            } else {
              summary += `[${name}]: ${text}\n`;
            }
          }
        }
      }
    } catch (e) {
      summary += '\n（无法获取剧情）';
    }

    return summary;
  }

  function _buildChatMessages(npcName, userMessage) {
    const personality = _getNpcPersonality(npcName);
    const chat = _getChatWith(npcName);
    const context = _getContextSummary();

    let playerName = '玩家';
    try {
      if (typeof getContext === 'function') {
        const ctx = getContext();
        if (ctx.name1) playerName = ctx.name1;
      } else {
        const el = document.querySelector('#user_avatar_block .avatar-name-text, #user-settings-avatar-block .ch_name');
        if (el) playerName = el.innerText.trim();
      }
    } catch (e) { }

    let relationDetail = '';
    try {
      const d = _load();
      if (d && d['NPC关系'] && d['NPC关系'][npcName]) {
        const rel = d['NPC关系'][npcName];
        relationDetail = String(rel);
      }
      // 补充NPC位置信息
      if (d && d['NPC位置'] && d['NPC位置'][npcName]) {
        relationDetail += (relationDetail ? '，' : '') + '当前位置：' + d['NPC位置'][npcName];
      }
      // 补充NPC间关系信息
      if (d && d['NPC互动'] && d['NPC互动'][npcName] && typeof d['NPC互动'][npcName] === 'object') {
        const interEntries = Object.entries(d['NPC互动'][npcName]).filter(([k]) => !_skip(k));
        if (interEntries.length) {
          relationDetail += (relationDetail ? '。' : '') + '与其他NPC：' + interEntries.map(([k, v]) => `${k}(${v})`).join('、');
        }
      }
      if (d && d['队伍'] && d['队伍']['成员']) {
        const members = d['队伍']['成员'];
        if (members.includes(npcName)) {
          relationDetail += (relationDetail ? '。' : '') + '你和' + playerName + '是同队伍的伙伴';
          if (d['当前位置']) relationDetail += '，目前都在' + d['当前位置'];
          if (d['当前副本'] && d['当前副本'] !== '无') relationDetail += '，正在副本"' + d['当前副本'] + '"中冒险';
        }
      }
    } catch (e) { }

    const systemMsg = {
      role: 'system',
      content: `你是"${npcName}"。这是游戏"深渊炼狱"里的手机聊天。对方是"${playerName}"。

你的性格：${personality.personality}

${relationDetail ? '你和' + playerName + '的关系：' + relationDetail + '\n' : ''}
以下是当前世界的完整信息和最近发生的剧情，请务必仔细阅读，特别是标注了"★最新"的部分——那是刚刚发生的事：

${context.slice(0, 5000)}

要求：
- 像真人发微信一样回复！用口语、缩写、网络用语。别用书面语、别用成语、别写长句。每条消息最多1-2句话
- 说话要接地气：比如"卧槽"、"6"、"绝了"、"无语"、"笑死"这种，不要"我深感""不禁""甚为"这种古文腔
- 可以打字很随意，不用讲究语法，像真人聊微信那样
- 你刚刚经历了上面剧情里的事情，请基于最新发生的事来聊天，自然地提及或回应
- 你知道${playerName}在哪、在做什么，不要问你已经知道的事
- 不要用markdown格式，不要*动作*，不要加角色名前缀
- 可以用emoji，可以打错字，可以用网络用语，像真人一样
- 想分条发就用换行分隔
- 如果你想发表情包来表达情绪，在单独一行写 [sticker-tag:标签名] 即可。可用标签名：${_loadCustomTags().map(t => t.name).join('/') || '（用户暂未添加标签）'}。只在确实想用表情包表达、且有可用标签时才用，不要每条都发。如果没有可用标签，就不要发表情包
- 特殊互动（可选，不是每次都要用，大概10次对话里用1-2次）：
  · 转账：在消息最后单独一行写 [npc-transfer:金额:备注]，金额10~500
  · 送礼物：在消息最后单独一行写 [npc-gift]
- 拉黑/删除（仅在极端情况下使用）：如果玩家的言论极度冒犯、侮辱你，或严重触犯了你的底线，你可以选择拉黑对方。在回复的最后单独新起一行写 [action:block:拉黑原因]，原因是一句简短的话。例如：[action:block:我们没什么好说的了。]
  · 分享歌曲：在消息最后单独一行写 [music:歌曲名:歌手名:你的留言]，推荐一首你觉得对方会喜欢的、真实存在的歌曲，留言要符合你的性格
  · 分享链接：在消息最后单独一行写 [link:链接标题:来源平台:简短描述:类型]，类型为article/video/forum/news/other。分享一个游戏世界内的虚构网站链接，可以是攻略、搞笑帖子、恐怖新闻、视频等。来源平台要是虚构的网站名
  · 语音消息：如果你想用声音表达一些话（适合低语、警告、感叹等场景），在消息最后单独一行写 [voice:你想说的话]。系统会将其转为语音播放。适合表达紧张、恐怖、温柔等需要语气的场景
- 绝对不要说"我是AI"或表现得像客服`
    };

    // 注入手机聊天历史摘要到system prompt（让NPC知道之前聊了什么）
    const chatSummaryLines = (chat.messages || []).slice(-10).map(m => {
      const sender = m.role === 'user' ? playerName : npcName;
      return `[${m.time || ''}] ${sender}: ${m.content.slice(0, 80)}`;
    }).join('\n');
    if (chatSummaryLines) {
      systemMsg.content += `\n\n你们之前在手机上的聊天记录（最近10条）：\n${chatSummaryLines}\n\n请基于以上聊天记录和剧情继续对话，不要重复之前说过的话。`;
    }

    const historyMsgs = (chat.messages || []).slice(-40).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }));

    const allMsgs = [systemMsg, ...historyMsgs];
    if (userMessage) {
      allMsgs.push({ role: 'user', content: userMessage });
    }
    return allMsgs;
  }

  async function _sendChatMessage(npcName, userMessage) {
    // 如果有用户消息需要保存（来自旧的调用方式）
    if (userMessage) {
      _addMessage(npcName, 'user', userMessage);
    }

    // 构建并调用API
    const msgs = _buildChatMessages(npcName, userMessage);
    const reply = await _callApi(msgs);

    // 保存AI回复
    _addMessage(npcName, 'assistant', reply);

    // 自动更新NPC心情（异步，不阻塞）
    _autoUpdateNpcMood(npcName, reply).catch(e => console.warn('[Abyss] mood update fail:', e));

    return reply;
  }

  // 根据NPC最新回复自动判断心情
  async function _autoUpdateNpcMood(npcName, latestReply) {
    const auxApi = _getAuxApi();
    if (!auxApi) return;

    const chat = _getChatWith(npcName);
    const recentMsgs = (chat.messages || []).slice(-6).map(m => {
      const sender = m.role === 'user' ? '玩家' : npcName;
      return `${sender}：${m.content.slice(0, 80)}`;
    }).join('\n');

    const moodList = Object.keys(MOOD_ICONS).join('、');

    try {
      const msgs = [
        {
          role: 'system',
          content: `你是一个情绪分析器。根据以下对话，判断"${npcName}"当前的心情状态。

最近对话：
${recentMsgs}

可选心情（只能从中选一个）：${moodList}

要求：只输出JSON格式，不要其他文字。
格式：{"mood":"心情词","detail":"一句话原因（10-20字）"}
示例：{"mood":"开心","detail":"和玩家聊得很愉快"}`
        },
        { role: 'user', content: '判断心情' }
      ];

      const reply = await _callAuxApi(msgs, { temperature: 0.3, max_tokens: 1000 });
      const data = _safeParseJsonObject(reply);
      if (data && data.mood && MOOD_ICONS[data.mood]) {
        _setNpcMood(npcName, data.mood, data.detail || '');
      }
    } catch (e) {
      // 静默失败，不影响聊天体验
    }
  }
  // NPC主动发消息（用于剧情触发）
  async function _npcInitiateMessage(npcName, hint) {
    const personality = _getNpcPersonality(npcName);
    const context = _getContextSummary();

    let playerName = '玩家';
    try {
      if (typeof getContext === 'function') { const ctx = getContext(); if (ctx.name1) playerName = ctx.name1; }
    } catch (e) { }

    let relationDetail = '';
    try {
      const d = _load();
      if (d && d['NPC关系'] && d['NPC关系'][npcName]) {
        relationDetail = String(d['NPC关系'][npcName]);
      }
      // 补充NPC位置信息
      if (d && d['NPC位置'] && d['NPC位置'][npcName]) {
        relationDetail += (relationDetail ? '，' : '') + '当前位置：' + d['NPC位置'][npcName];
      }
      // 补充NPC间关系信息
      if (d && d['NPC互动'] && d['NPC互动'][npcName] && typeof d['NPC互动'][npcName] === 'object') {
        const interEntries = Object.entries(d['NPC互动'][npcName]).filter(([k]) => !_skip(k));
        if (interEntries.length) {
          relationDetail += (relationDetail ? '。' : '') + '与其他NPC：' + interEntries.map(([k, v]) => `${k}(${v})`).join('、');
        }
      }
      if (d && d['队伍'] && d['队伍']['成员'] && d['队伍']['成员'].includes(npcName)) {
        relationDetail += (relationDetail ? '。' : '') + '你们是同队的伙伴';
      }
    } catch (e) { }

    const msgs = [
      {
        role: 'system',
        content: `你是"${npcName}"，要主动给"${playerName}"发一条微信消息。

你的性格：${personality.personality}
${relationDetail ? '你和' + playerName + '的关系：' + relationDetail + '\n' : ''}

当前世界信息和最近剧情（特别注意标注了"★最新"的部分）：
${context.slice(0, 4000)}

${hint ? '消息动机：' + hint + '\n' : ''}
要求：
- 像真人主动找人聊天一样，基于刚发生的事来说点什么
- 可以是吐槽刚才发生的事、分享情报、表达关心、开玩笑
- 1-3句话，简短自然，像真人发微信
- 不要用markdown，不要加角色名前缀
- 可以用emoji
- 想发表情包就单独一行写 [sticker-tag:标签名]，可用标签名：${_loadCustomTags().map(t => t.name).join('/') || '无'}。没有可用标签就不要发表情包

特殊互动（可选，不是每次都要用，只在你觉得合适的时候自然地使用，大概10次消息里用1-2次）：
- 转账：在消息最后单独一行写 [npc-transfer:金额:备注]，金额在10~500之间。
- 送礼物：在消息最后单独一行写 [npc-gift]。
- 分享歌曲：在消息最后单独一行写 [music:歌曲名:歌手名:你的留言]。推荐一首真实存在的歌曲，留言要符合你的性格。比如战斗后想分享一首燃的歌、或者夜晚想发一首安静的歌。
- 分享链接：在消息最后单独一行写 [link:链接标题:来源平台:简短描述:类型]，类型为article/video/forum/news/other。分享一个游戏世界内的虚构网站链接。比如看到一个有趣的帖子、一则搞笑新闻、一个攻略视频等。来源平台要是虚构的游戏世界内的网站名。`
      },
      { role: 'user', content: '（系统：请以该角色身份主动发消息）' }
    ];

    try {
      const reply = await _callAuxApi(msgs, { temperature: 0.9 });
      // 先处理特殊指令
      _processNpcSpecialActions(npcName, reply).catch(e => console.warn('[Abyss] NPC special action fail:', e));

      // 保存清理后的回复
      const cleanedReply = reply
        .split(/\n+/)
        .filter(s => {
          const trimmed = s.trim();
          if (trimmed.match(/^\[npc-transfer:\d+:[^\]]*\]$/)) return false;
          if (trimmed.match(/^\[npc-gift\]$/)) return false;
          return true;
        })
        .join('\n')
        .trim();
      if (cleanedReply) {
        _addMessage(npcName, 'assistant', cleanedReply);
      }
      _addUnread(npcName, 1);
      return reply;
    } catch (e) {
      console.warn('[Abyss Chat] NPC initiate fail:', e);
      return null;
    }
  }

  /* ═══════════════════════════════════════
     主题配置（保留原有全部主题，此处缩略）
     ═══════════════════════════════════════ */
  const THEMES = {
    inferno: {
      name: '常规', icon: '🖤',
      primary: '#c83030', primaryRgb: '200,48,48',
      accent: '#c8a832', accentRgb: '200,168,50',
      bg: '#0d0d14', bgAlt: '#0a0a0f',
      bgCard: '#12121a', bgSection: '#1a1a25', bgHover: '#222233',
      bgTrigger: 'rgba(10,10,15,.92)',
      topbarBg: 'linear-gradient(135deg,#1a0a0a,#0a0a1a)',
      border: '#2a2a3a', borderLight: 'rgba(255,255,255,.05)',
      divider: 'rgba(255,255,255,.03)',
      surfaceHover: 'rgba(255,255,255,.03)', surfaceActive: 'rgba(255,255,255,.06)',
      trackBg: 'rgba(255,255,255,.06)', scrollThumb: 'rgba(255,255,255,.1)',
      text: '#e0e0e8', textDim: '#8888a0', textMuted: '#555570', textLocked: '#333348',
      barBond: 'linear-gradient(90deg,#d85888,#e87aaa)', barEvo: 'linear-gradient(90deg,#7830c8,#a060e0)',
      barSatOk: 'linear-gradient(90deg,#30a848,#50c868)', barSatLow: 'linear-gradient(90deg,#c8a832,#e0c050)', barSatCrit: 'linear-gradient(90deg,#c83030,#e05050)',
      pass: '#30a848', fail: '#c83030',
      sr: '#3060c8', ssr: '#c8a832', sss: '#7830c8', srRgb: '48,96,200', sssRgb: '120,48,200',
      loyHi: '#3060c8', loyMax: '#7830c8', loyHiRgb: '48,96,200', loyMaxRgb: '120,48,200',
      mask: '#40b8c8', maskRgb: '64,184,200', dlgMask: 'rgba(0,0,0,.65)',
      green: '#30a848', purple: '#7830c8', pink: '#d85888', pinkRgb: '216,88,136', cyan: '#40b8c8',
      sanHigh: '#30a848', sanMid: '#c8a832', sanLow: '#c83030', sanCritical: '#ff0040',
      wallpaper: 'radial-gradient(ellipse at 30% 15%,rgba(200,48,48,.1),transparent 55%),radial-gradient(ellipse at 75% 85%,rgba(200,168,50,.07),transparent 50%)',
      bezel: '#1a1a28', iconBg: 'rgba(200,48,48,.12)',
      chatBubbleUser: 'rgba(200,48,48,.2)', chatBubbleNpc: 'rgba(255,255,255,.06)',
      chatInput: '#1a1a28', badge: '#c83030'
    },
    void: {
      name: '深蓝', icon: '💙',
      primary: '#CCA4E3', primaryRgb: '204,164,227', accent: '#E8D0F8', accentRgb: '232,208,248',
      bg: '#152751', bgAlt: '#0f1f40', bgCard: '#1a3060', bgSection: '#1e3868', bgHover: '#254070',
      bgTrigger: 'rgba(21,39,81,.92)', topbarBg: 'linear-gradient(135deg,#0f1f40,#1a3060)',
      border: '#2a4878', borderLight: 'rgba(204,164,227,.12)', divider: 'rgba(204,164,227,.08)',
      surfaceHover: 'rgba(204,164,227,.08)', surfaceActive: 'rgba(204,164,227,.14)',
      trackBg: 'rgba(204,164,227,.1)', scrollThumb: 'rgba(204,164,227,.2)',
      text: '#e8e0f0', textDim: '#b0a0c8', textMuted: '#8878a0', textLocked: '#4a4070',
      barBond: 'linear-gradient(90deg,#e87aaa,#f0a0c8)', barEvo: 'linear-gradient(90deg,#CCA4E3,#E8D0F8)',
      barSatOk: 'linear-gradient(90deg,#50c868,#70e088)', barSatLow: 'linear-gradient(90deg,#e0c050,#f0d870)', barSatCrit: 'linear-gradient(90deg,#e05050,#f07070)',
      pass: '#50c868', fail: '#e05050', sr: '#60a0e0', ssr: '#E8D0F8', sss: '#ff80c0', srRgb: '96,160,224', sssRgb: '255,128,192',
      loyHi: '#60a0e0', loyMax: '#ff80c0', loyHiRgb: '96,160,224', loyMaxRgb: '255,128,192',
      mask: '#80d0e8', maskRgb: '128,208,232', dlgMask: 'rgba(10,20,40,.75)',
      green: '#50c868', purple: '#CCA4E3', pink: '#e87aaa', pinkRgb: '232,122,170', cyan: '#80d0e8',
      sanHigh: '#50c868', sanMid: '#e0c050', sanLow: '#e05050', sanCritical: '#ff4060',
      wallpaper: 'radial-gradient(ellipse at 25% 20%,rgba(204,164,227,.12),transparent 55%),radial-gradient(ellipse at 80% 75%,rgba(96,160,224,.08),transparent 50%)',
      bezel: '#0c1830', iconBg: 'rgba(204,164,227,.12)',
      chatBubbleUser: 'rgba(204,164,227,.2)', chatBubbleNpc: 'rgba(255,255,255,.06)',
      chatInput: '#0c1830', badge: '#e05050'
    },
    verdant: {
      name: '深粉', icon: '🩷',
      primary: '#2d8a4e', primaryRgb: '45,138,78', accent: '#CBFCC0', accentRgb: '203,252,192',
      bg: '#F9B2C0', bgAlt: '#f0a0b0', bgCard: '#fcc4d0', bgSection: '#f8b8c4', bgHover: '#fdd0d8',
      bgTrigger: 'rgba(249,178,192,.92)', topbarBg: 'linear-gradient(135deg,#f0a0b0,#fcc4d0)',
      border: '#e898a8', borderLight: 'rgba(45,138,78,.12)', divider: 'rgba(45,138,78,.08)',
      surfaceHover: 'rgba(45,138,78,.06)', surfaceActive: 'rgba(45,138,78,.1)',
      trackBg: 'rgba(45,138,78,.1)', scrollThumb: 'rgba(45,138,78,.2)',
      text: '#2a4030', textDim: '#4a6850', textMuted: '#6a8870', textLocked: '#a0b0a8',
      barBond: 'linear-gradient(90deg,#e05888,#e87aaa)', barEvo: 'linear-gradient(90deg,#2d8a4e,#50b868)',
      barSatOk: 'linear-gradient(90deg,#2d8a4e,#50b868)', barSatLow: 'linear-gradient(90deg,#c8a832,#e0c050)', barSatCrit: 'linear-gradient(90deg,#c83030,#e05050)',
      pass: '#2d8a4e', fail: '#c83030', sr: '#3068b0', ssr: '#2d8a4e', sss: '#8040a0', srRgb: '48,104,176', sssRgb: '128,64,160',
      loyHi: '#3068b0', loyMax: '#8040a0', loyHiRgb: '48,104,176', loyMaxRgb: '128,64,160',
      mask: '#2880a0', maskRgb: '40,128,160', dlgMask: 'rgba(200,140,160,.5)',
      green: '#2d8a4e', purple: '#8040a0', pink: '#e05888', pinkRgb: '224,88,136', cyan: '#2880a0',
      sanHigh: '#2d8a4e', sanMid: '#c8a832', sanLow: '#c83030', sanCritical: '#ff0040',
      wallpaper: 'radial-gradient(ellipse at 40% 25%,rgba(45,138,78,.08),transparent 50%),radial-gradient(ellipse at 65% 80%,rgba(224,88,136,.06),transparent 50%)',
      bezel: '#e090a0', iconBg: 'rgba(45,138,78,.1)',
      chatBubbleUser: 'rgba(45,138,78,.18)', chatBubbleNpc: 'rgba(0,0,0,.06)',
      chatInput: '#e8a0b0', badge: '#c83030'
    },
    frost: {
      name: '淡蓝', icon: '💙',
      primary: '#512c1d', primaryRgb: '81,44,29', accent: '#3a1f14', accentRgb: '58,31,20',
      bg: '#b8d8e9', bgAlt: '#a8c8d8', bgCard: '#c4e0ee', bgSection: '#aed0e0', bgHover: '#d0e8f2',
      bgTrigger: 'rgba(184,216,233,.92)', topbarBg: 'linear-gradient(135deg,#a8c8d8,#c4e0ee)',
      border: '#90b8cc', borderLight: 'rgba(81,44,29,.12)', divider: 'rgba(81,44,29,.08)',
      surfaceHover: 'rgba(81,44,29,.06)', surfaceActive: 'rgba(81,44,29,.1)',
      trackBg: 'rgba(81,44,29,.1)', scrollThumb: 'rgba(81,44,29,.2)',
      text: '#2a1a10', textDim: '#4a3828', textMuted: '#6a5848', textLocked: '#8898a8',
      barBond: 'linear-gradient(90deg,#c05070,#d87090)', barEvo: 'linear-gradient(90deg,#512c1d,#7a4a38)',
      barSatOk: 'linear-gradient(90deg,#3a8848,#58a868)', barSatLow: 'linear-gradient(90deg,#c8a832,#e0c050)', barSatCrit: 'linear-gradient(90deg,#c83030,#e05050)',
      pass: '#3a8848', fail: '#c83030', sr: '#2868a0', ssr: '#3a1f14', sss: '#904090', srRgb: '40,104,160', sssRgb: '144,64,144',
      loyHi: '#2868a0', loyMax: '#904090', loyHiRgb: '40,104,160', loyMaxRgb: '144,64,144',
      mask: '#306080', maskRgb: '48,96,128', dlgMask: 'rgba(80,130,160,.5)',
      green: '#3a8848', purple: '#904090', pink: '#c05070', pinkRgb: '192,80,112', cyan: '#306080',
      sanHigh: '#3a8848', sanMid: '#c8a832', sanLow: '#c83030', sanCritical: '#ff0040',
      wallpaper: 'radial-gradient(ellipse at 35% 30%,rgba(81,44,29,.08),transparent 50%),radial-gradient(ellipse at 70% 75%,rgba(40,104,160,.06),transparent 50%)',
      bezel: '#88b0c4', iconBg: 'rgba(81,44,29,.08)',
      chatBubbleUser: 'rgba(81,44,29,.15)', chatBubbleNpc: 'rgba(255,255,255,.4)',
      chatInput: '#a0c4d4', badge: '#c83030'
    },
    steel: {
      name: '紫灰', icon: '🩶',
      primary: '#3a3e50', primaryRgb: '58,62,80', accent: '#E4E4E6', accentRgb: '228,228,230',
      bg: '#6F7899', bgAlt: '#606888', bgCard: '#7a84a4', bgSection: '#687090', bgHover: '#8890aa',
      bgTrigger: 'rgba(111,120,153,.92)', topbarBg: 'linear-gradient(135deg,#606888,#7a84a4)',
      border: '#9098b0', borderLight: 'rgba(228,228,230,.12)', divider: 'rgba(228,228,230,.08)',
      surfaceHover: 'rgba(228,228,230,.06)', surfaceActive: 'rgba(228,228,230,.12)',
      trackBg: 'rgba(228,228,230,.1)', scrollThumb: 'rgba(228,228,230,.2)',
      text: '#E4E4E6', textDim: '#68b7b9', textMuted: '#94bf7b', textLocked: '#585878',
      barBond: 'linear-gradient(90deg,#e87aaa,#f0a0c0)', barEvo: 'linear-gradient(90deg,#8090b0,#a0b0d0)',
      barSatOk: 'linear-gradient(90deg,#50b868,#70d888)', barSatLow: 'linear-gradient(90deg,#d0b040,#e8c860)', barSatCrit: 'linear-gradient(90deg,#d04848,#e86868)',
      pass: '#50b868', fail: '#d04848', sr: '#80a8e0', ssr: '#E4E4E6', sss: '#e0a060', srRgb: '128,168,224', sssRgb: '224,160,96',
      loyHi: '#80a8e0', loyMax: '#e0a060', loyHiRgb: '128,168,224', loyMaxRgb: '224,160,96',
      mask: '#b0d0e8', maskRgb: '176,208,232', dlgMask: 'rgba(50,55,70,.65)',
      green: '#50b868', purple: '#a080c8', pink: '#e87aaa', pinkRgb: '232,122,170', cyan: '#80c0d8',
      sanHigh: '#50b868', sanMid: '#d0b040', sanLow: '#d04848', sanCritical: '#ff3050',
      wallpaper: 'radial-gradient(ellipse at 30% 20%,rgba(228,228,230,.08),transparent 50%),radial-gradient(ellipse at 70% 80%,rgba(128,168,224,.06),transparent 50%)',
      bezel: '#555878', iconBg: 'rgba(228,228,230,.08)',
      chatBubbleUser: 'rgba(228,228,230,.12)', chatBubbleNpc: 'rgba(255,255,255,.06)',
      chatInput: '#555878', badge: '#d04848'
    },
    parchment: {
      name: '浅咖', icon: '🤎',
      primary: '#6F4E37', primaryRgb: '111,78,55', accent: '#4a3520', accentRgb: '74,53,32',
      bg: '#C2B280', bgAlt: '#b0a070', bgCard: '#ccbe90', bgSection: '#baa878', bgHover: '#d8ca9a',
      bgTrigger: 'rgba(194,178,128,.92)', topbarBg: 'linear-gradient(135deg,#b0a070,#ccbe90)',
      border: '#a09060', borderLight: 'rgba(111,78,55,.12)', divider: 'rgba(111,78,55,.08)',
      surfaceHover: 'rgba(111,78,55,.06)', surfaceActive: 'rgba(111,78,55,.1)',
      trackBg: 'rgba(111,78,55,.1)', scrollThumb: 'rgba(111,78,55,.2)',
      text: '#3a2810', textDim: '#5a4028', textMuted: '#7a6040', textLocked: '#a09878',
      barBond: 'linear-gradient(90deg,#c05070,#d87090)', barEvo: 'linear-gradient(90deg,#6F4E37,#907060)',
      barSatOk: 'linear-gradient(90deg,#408030,#60a050)', barSatLow: 'linear-gradient(90deg,#c0a030,#d8b848)', barSatCrit: 'linear-gradient(90deg,#c03030,#d85050)',
      pass: '#408030', fail: '#c03030', sr: '#3060a0', ssr: '#6F4E37', sss: '#904090', srRgb: '48,96,160', sssRgb: '144,64,144',
      loyHi: '#3060a0', loyMax: '#904090', loyHiRgb: '48,96,160', loyMaxRgb: '144,64,144',
      mask: '#306080', maskRgb: '48,96,128', dlgMask: 'rgba(100,90,60,.5)',
      green: '#408030', purple: '#904090', pink: '#c05070', pinkRgb: '192,80,112', cyan: '#306080',
      sanHigh: '#408030', sanMid: '#c0a030', sanLow: '#c03030', sanCritical: '#e00030',
      wallpaper: 'radial-gradient(ellipse at 40% 30%,rgba(111,78,55,.08),transparent 50%),radial-gradient(ellipse at 65% 75%,rgba(74,53,32,.06),transparent 50%)',
      bezel: '#9a8868', iconBg: 'rgba(111,78,55,.1)',
      chatBubbleUser: 'rgba(111,78,55,.15)', chatBubbleNpc: 'rgba(255,255,255,.3)',
      chatInput: '#b0a070', badge: '#c03030'
    },
    radiant: {
      name: '淡绿', icon: '💚',
      primary: '#4a6858', primaryRgb: '74,104,88', accent: '#8e9235', accentRgb: '42,72,56',
      bg: '#c0d3cd', bgAlt: '#b0c4bc', bgCard: '#ccdcd6', bgSection: '#b8ccc4', bgHover: '#d8e8e2',
      bgTrigger: 'rgba(192,211,205,.92)', topbarBg: 'linear-gradient(135deg,#b0c4bc,#ccdcd6)',
      border: '#98b4a8', borderLight: 'rgba(74,104,88,.12)', divider: 'rgba(74,104,88,.08)',
      surfaceHover: 'rgba(74,104,88,.06)', surfaceActive: 'rgba(74,104,88,.1)',
      trackBg: 'rgba(74,104,88,.1)', scrollThumb: 'rgba(74,104,88,.2)',
      text: '#7090ca', textDim: '#139696', textMuted: '#5a5653', textLocked: '#889890',
      barBond: 'linear-gradient(90deg,#c05888,#d878a8)', barEvo: 'linear-gradient(90deg,#4a6858,#688878)',
      barSatOk: 'linear-gradient(90deg,#408840,#60a860)', barSatLow: 'linear-gradient(90deg,#c8a832,#e0c050)', barSatCrit: 'linear-gradient(90deg,#c83030,#e05050)',
      pass: '#408840', fail: '#c83030', sr: '#7f5287', ssr: '#8e9235', sss: '#885898', srRgb: '56,112,176', sssRgb: '136,88,152',
      loyHi: '#3870b0', loyMax: '#885898', loyHiRgb: '56,112,176', loyMaxRgb: '136,88,152',
      mask: '#306848', maskRgb: '48,104,72', dlgMask: 'rgba(80,120,100,.5)',
      green: '#408840', purple: '#885898', pink: '#c05888', pinkRgb: '192,88,136', cyan: '#4888a0',
      sanHigh: '#408840', sanMid: '#c8a832', sanLow: '#c83030', sanCritical: '#ff0040',
      wallpaper: 'radial-gradient(ellipse at 30% 25%,rgba(74,104,88,.08),transparent 50%),radial-gradient(ellipse at 75% 80%,rgba(136,88,152,.06),transparent 50%)',
      bezel: '#90a89c', iconBg: 'rgba(74,104,88,.1)',
      chatBubbleUser: 'rgba(74,104,88,.15)', chatBubbleNpc: 'rgba(255,255,255,.3)',
      chatInput: '#b0c4bc', badge: '#c83030'
    }
  };

  const THEME_KEYS = Object.keys(THEMES);
  const STORAGE_KEY = 'abyss-theme';
  const FONT_STORAGE_KEY = 'abyss-font-settings';
  function _loadFontSettings() {
    try {
      const raw = localStorage.getItem(FONT_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return { family: 'system', size: 'medium' };
    // family: 'system' | 'serif' | 'rounded' | 'mono' | 'elegant'
    // size: 'small' | 'medium' | 'large' | 'xlarge'
  }
  function _saveFontSettings(settings) {
    try { localStorage.setItem(FONT_STORAGE_KEY, JSON.stringify(settings)); } catch (e) { }
  }

  const FONT_FAMILIES = {
    system: { name: '系统默认', value: "-apple-system,'Segoe UI','Microsoft YaHei',sans-serif" },
    serif: { name: '宋体/衬线', value: "'Noto Serif SC','SimSun','Source Han Serif SC',serif" },
    rounded: { name: '圆体', value: "'Noto Sans SC','PingFang SC','Hiragino Sans GB',sans-serif" },
    mono: { name: '等宽体', value: "'JetBrains Mono','Fira Code','Courier New',monospace" },
    elegant: { name: '楷体/手写', value: "'LXGW WenKai','KaiTi','STKaiti',cursive" }
  };
  const FONT_SIZES = {
    small: { name: '小', scale: 0.85 },
    medium: { name: '中', scale: 1.0 },
    large: { name: '大', scale: 1.15 },
    xlarge: { name: '特大', scale: 1.3 }
  };
  function _getFontFamily() {
    const s = _loadFontSettings();
    return FONT_FAMILIES[s.family] ? FONT_FAMILIES[s.family].value : FONT_FAMILIES.system.value;
  }
  function _getFontScale() {
    const s = _loadFontSettings();
    // 自定义数值优先
    if (s.customScale !== undefined) return s.customScale;
    return FONT_SIZES[s.size] ? FONT_SIZES[s.size].scale : 1.0;
  }
  const SIGNAL_KEY = 'abyss-theme-signal';
  let _currentTheme = localStorage.getItem(STORAGE_KEY) || 'inferno';
  if (!THEMES[_currentTheme]) _currentTheme = 'inferno';
  function _t() { return THEMES[_currentTheme]; }
  function _broadcastTheme() {
    try { localStorage.setItem(SIGNAL_KEY, _currentTheme + '|' + Date.now() + '|panel'); } catch (e) { }
    try { window.dispatchEvent(new CustomEvent('abyss-theme-changed', { detail: { theme: _currentTheme, source: 'panel' } })); } catch (e) { }
  }
  window.ABYSS_THEMES = THEMES;
  window.ABYSS_CURRENT_THEME = _currentTheme;

  const EMBLEM_EMOJIS = ['⚔', '🗡️', '🛡️', '🔥', '💀', '☠', '⛧', '🐉', '🦇', '🕷️', '👁️', '🌙', '⭐', '💎', '🔱', '⚡', '🖤', '❤️‍🔥', '🪶', '🐺', '🦅', '🐍', '🦂', '🌑', '🫀', '🩸', '⚰️', '🪦', '🗝️', '👑', '🎭', '🔮', '🧿', '💠', '🏴', '⚙️', '🕯️', '✟', '☽', '♠'];
  const CORE_NPC_LIST = ['周黑鸭', '陆沉霄', '谢不言'];
  const NPC_FALLBACK_EMOJI = { '周黑鸭': '🦆', '陆沉霄': '🎯', '谢不言': '🕸️' };
  const NPC_SKILLS = {
    '周黑鸭': [{ id: 1, name: '地狱笑话·强化', cost: 50, icon: '🎤', effect: '被动技能触发概率30%→50%，正面效果占比提高至70%' }, { id: 2, name: '暴力讲理·精通', cost: 100, icon: '⚖️', effect: '引用法律条文时同时造成物理+精神双重伤害，提升40%' }, { id: 3, name: '冤魂外卖·究极', cost: 200, icon: '👻', effect: '召唤亡灵+2，持续时间翻倍，亡灵拥有独立战斗AI' }],
    '陆沉霄': [{ id: 1, name: '战术拆解·专家', cost: 50, icon: '💣', effect: '机关陷阱识别率85%，拆解时间减半' }, { id: 2, name: '致命精准·狙击', cost: 100, icon: '🎯', effect: '远程攻击必中要害，150%伤害，无视部分护甲' }, { id: 3, name: '守护意志·觉醒', cost: 200, icon: '🛡️', effect: '队友危急时自动保护，承受致命伤害并反击' }],
    '谢不言': [{ id: 1, name: '魂魄牵丝·精控', cost: 50, icon: '🕸️', effect: '同时操控3目标，精度提升，可执行复杂动作' }, { id: 2, name: '禁术炼成·加速', cost: 100, icon: '⚗️', effect: '制作时间减半，品质+1档，反噬-30%' }, { id: 3, name: '残魂献祭·爆发', cost: 200, icon: '💀', effect: '献祭残魂获巨额灵力，施展一次SSR级禁术' }]
  };
  const CONTRIB_MAX = 200;

  const G = {
    elIds: { trigger: 'abyss-trigger', overlay: 'abyss-overlay', css: 'abyss-injected-css' },
    apps: [
      { id: 'creature', icon: '🐾', label: '宠物' }, { id: 'bag', icon: '💎', label: '物品' },
      { id: 'party', icon: '⚔️', label: '队伍' }, { id: 'skills', icon: '⚡', label: '技能' },
      { id: 'dungeon', icon: '☠️', label: '副本' }, { id: 'chat', icon: '💬', label: '消息' },
      { id: 'apiMgr', icon: '🔌', label: '接口' }, { id: 'overview', icon: '📊', label: '统计' },
      { id: 'fallen', icon: '💀', label: '死亡' }, { id: 'theme', icon: '🎨', label: '主题' },
      { id: 'radio', icon: '🎵', label: '电台' }, { id: 'npcrel', icon: '🔗', label: '关系' },
      { id: 'forum', icon: '📋', label: '论坛' }, { id: 'notes', icon: '📝', label: '笔记' },
      { id: 'album', icon: '📷', label: '相册' }, { id: 'map', icon: '🗺️', label: '地图' },
      { id: 'shop', icon: '🏪', label: '商店' }, { id: 'minigame', icon: '🎮', label: '游戏' },
      { id: 'broadcast', icon: '📻', label: '广播' }
    ],
    bagSlots: [
      { id: '消耗品', icon: '💊' }, { id: '食物', icon: '🍖' }, { id: '材料', icon: '🔩' },
      { id: '武器', icon: '⚔️' }, { id: '衣着', icon: '👘' }, { id: '关键道具', icon: '🔑' }, { id: '其他', icon: '📦' }
    ]
  };

  let _visible = false, _screen = 'home', _bagSlot = null, _panelPositioned = false, _skillNpc = null;
  const APP_ORDER_KEY = 'abyss-app-order';
  function _loadAppOrder() {
    try {
      const raw = localStorage.getItem(APP_ORDER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // 兼容旧版扁平数组格式：自动迁移
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
          const migrated = parsed.map(id => ({ type: 'app', id }));
          _saveAppOrder(migrated);
          return migrated;
        }
        return parsed;
      }
    } catch (e) { }
    return null;
    // 新格式: [{ type:'app', id:'creature' }, { type:'folder', name:'战斗', icon:'⚔️', apps:['party','skills','dungeon'] }, ...]
  }
  function _saveAppOrder(order) {
    try { localStorage.setItem(APP_ORDER_KEY, JSON.stringify(order)); } catch (e) { }
  }
  function _getOrderedApps() {
    // 返回新格式的排列数组
    const order = _loadAppOrder();
    if (!order) {
      // 默认：全部以app形式排列
      return G.apps.map(a => ({ type: 'app', id: a.id }));
    }
    // 收集已被排列的appId
    const placedIds = new Set();
    for (const item of order) {
      if (item.type === 'app') placedIds.add(item.id);
      else if (item.type === 'folder' && item.apps) item.apps.forEach(id => placedIds.add(id));
    }
    // 把新增的app追加到末尾
    const result = [...order];
    for (const app of G.apps) {
      if (!placedIds.has(app.id)) result.push({ type: 'app', id: app.id });
    }
    return result;
  }
  // 辅助：从排列中查找app的信息
  function _getAppInfo(appId) {
    return G.apps.find(a => a.id === appId) || { id: appId, icon: '❓', label: appId };
  }
  // 辅助：将某个app从当前排列中移除（不管在桌面还是文件夹里）
  function _removeAppFromOrder(order, appId) {
    for (let i = order.length - 1; i >= 0; i--) {
      if (order[i].type === 'app' && order[i].id === appId) {
        order.splice(i, 1);
      } else if (order[i].type === 'folder' && order[i].apps) {
        order[i].apps = order[i].apps.filter(id => id !== appId);
        // 如果文件夹只剩0个app，删除文件夹
        if (order[i].apps.length === 0) order.splice(i, 1);
        // 如果文件夹只剩1个app，解散文件夹
        else if (order[i].apps.length === 1) {
          const lastId = order[i].apps[0];
          order.splice(i, 1, { type: 'app', id: lastId });
        }
      }
    }
    return order;
  }
  // 当前打开的文件夹（null表示在桌面）
  let _openFolder = null;
  let _returnToFolder = null; // 记住从哪个文件夹进入的APP
  let _appEditMode = false;
  let _chatTarget = null; // 当前正在聊天的NPC名
  let _chatSending = false; // 防重复发送

  /* ═══════════════════════════════════════
     数据工具
     ═══════════════════════════════════════ */
  function _lastMesId() { const n = document.querySelectorAll('.mes'); if (!n.length) return -1; const v = n[n.length - 1].getAttribute('mesid'); return v !== null ? parseInt(v) : -1; }
  function _load() { try { const mid = _lastMesId(); const r = getChatMessages(mid); if (r && r.length && r[0].data && r[0].data.stat_data) return r[0].data.stat_data; } catch (e) { } return null; }
  async function _save(payload) { try { const mid = _lastMesId(); const r = getChatMessages(mid); if (!r || !r.length || !r[0].data) return false; r[0].data.stat_data = payload; await setChatMessages([{ message_id: mid, data: r[0].data }], { refresh: 'none' }); return true; } catch (e) { return false; } }
  function _skip(k) { return k === '$meta' || k === '$__META_EXTENSIBLE__$'; }
  function _parseRarity(raw) { const m = raw.match(/(.+?)[（\(]([a-zA-Z]+)[）\)]\s*$/); return m ? { label: m[1].trim(), tier: m[2].toUpperCase() } : { label: raw, tier: 'R' }; }
  function _parseItemRarity(raw) { const m = raw.match(/(.+?)(?:[（\(]([a-zA-Z]+)[）\)])?$/); return { label: m ? m[1].trim() : raw, tier: (m && m[2]) ? m[2].toUpperCase() : '' }; }
  function _tierCls(t) { return { SSS: 'ax-t-sss', SSR: 'ax-t-ssr', SR: 'ax-t-sr' }[t] || 'ax-t-r'; }
  function _itemTierCls(t) { return { SSS: 'ax-it-sss', SSR: 'ax-it-ssr', SR: 'ax-it-sr', R: 'ax-it-r' }[t] || 'ax-it-base'; }
  function _loyaltyCls(v) { return { '绝': 'ax-loy-max', '高': 'ax-loy-hi', '中': 'ax-loy-mid' }[v] || 'ax-loy-lo'; }
  function _hungerState(n) { if (n <= 30) return 'crit'; if (n <= 50) return 'low'; return 'ok'; }
  function _esc(s) { return String(s).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/\n/g, '<br>'); }
  function _dialog(inner) { _dismissDialog(); const w = $('<div class="ax-dlg-mask"></div>'); w.append($('<div class="ax-dlg-box"></div>').html(inner)); $('#' + G.elIds.overlay).append(w); w.on('click', function (e) { if (e.target === this) w.remove(); }); return w; }
  function _dismissDialog() { $('.ax-dlg-mask').remove(); }

  function _getTimeOnly() { try { const d = _load(); if (d && d['游戏时间']) return d['游戏时间']['时刻'] || '??:??'; } catch (e) { } return '⛧'; }
  function _getGameTimeFull() { try { const d = _load(); if (d && d['游戏时间'] && d['游戏时间']['描述']) return d['游戏时间']['描述']; } catch (e) { } return _getTimeOnly(); }
  function _isNpcKnown(d, npc) { if (!d || !d['NPC关系'] || typeof d['NPC关系'] !== 'object') return false; return d['NPC关系'][npc] !== undefined && !_skip(npc); }

  /* ═══════════════════════════════════════
 CSS 样式生成
 ═══════════════════════════════════════ */
  function _generateCss() {
    const t = _t();
    const badge = t.badge || t.fail;
    return `
#${G.elIds.trigger}{position:fixed;top:45%;right:10px;min-width:36px;padding:6px 12px;z-index:100000;cursor:pointer;user-select:none;touch-action:none;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;font-family:'Courier New',monospace;letter-spacing:.5px;background:${t.bgTrigger};border:1.5px solid ${t.border};border-radius:20px;box-shadow:0 0 12px rgba(${t.primaryRgb},.25);transition:box-shadow .3s,border-color .3s;color:${t.primary};text-shadow:0 0 6px rgba(${t.primaryRgb},.5);white-space:nowrap}
#${G.elIds.trigger}:hover{border-color:${t.primary};box-shadow:0 0 20px rgba(${t.primaryRgb},.4)}
.ax-trigger-badge{position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;border-radius:8px;background:${badge};color:#fff;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px;box-shadow:0 1px 4px rgba(0,0,0,.4);animation:axBadgePop .3s ease}
@keyframes axBadgePop{from{transform:scale(0)}to{transform:scale(1)}}
#${G.elIds.overlay}{display:none;position:fixed;width:90%;max-width:370px;height:68vh;border-radius:34px;border:4px solid ${t.bezel};background:${t.bg};z-index:99999;flex-direction:column;overflow:hidden;box-shadow:0 16px 56px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.04);font-family:${_getFontFamily()};color:${t.text};--ax-fs:${_getFontScale()}}


.ax-ph-notch{text-align:center;padding:2px 0 0;background:${t.bg}}
.ax-ph-notch-pill{display:inline-block;width:32px;height:4px;background:#000;border-radius:2px;opacity:.65}
.ax-ph-statusbar{display:flex;justify-content:space-between;align-items:center;padding:2px 18px 3px;font-size:10px;color:${t.textDim};user-select:none;cursor:grab;background:${t.bg};flex-shrink:0}
.ax-ph-statusbar:active{cursor:grabbing}
.ax-ph-sb-time{font-weight:700;font-size:11px;color:${t.text};font-family:'Courier New',monospace;letter-spacing:.5px}
.ax-ph-sb-right{display:flex;align-items:center;gap:5px;font-size:8px}
.ax-ph-close{font-size:9px;cursor:pointer;opacity:.4;transition:opacity .2s;padding:2px}
.ax-ph-close:hover{opacity:1;color:${t.primary}}
.ax-ph-screen{flex:1;overflow:hidden;display:flex;flex-direction:column;position:relative}
.ax-ph-homebar{text-align:center;padding:4px 0 8px;background:${t.bg};flex-shrink:0}
.ax-ph-homebar-pill{display:inline-block;width:90px;height:4px;background:rgba(${t.primaryRgb},.2);border-radius:2px;cursor:pointer;transition:background .2s}
.ax-ph-homebar-pill:hover{background:rgba(${t.primaryRgb},.4)}
.ax-home{flex:1;overflow-y:auto;padding:12px 16px;display:flex;flex-direction:column}
.ax-home-header{text-align:center;padding:28px 0 8px}
.ax-home-time-icon{font-size:16px;display:block;margin-bottom:3px;opacity:.6}
.ax-home-time{font-size:12px;color:${t.primary};letter-spacing:2px;font-weight:600;font-family:'Courier New',monospace;text-shadow:0 0 10px rgba(${t.primaryRgb},.2)}
.ax-app-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px 8px;padding:24px 4px 12px;flex:1;align-content:start}
.ax-app{display:flex;flex-direction:column;align-items:center;cursor:pointer;transition:transform .15s;-webkit-tap-highlight-color:transparent;position:relative}
.ax-app:active{transform:scale(.92)}
.ax-app-ico{width:50px;height:50px;border-radius:14px;background:${t.iconBg};backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(${t.primaryRgb},.12);display:flex;align-items:center;justify-content:center;font-size:22px;transition:box-shadow .2s,transform .2s;box-shadow:0 2px 8px rgba(0,0,0,.15)}
.ax-app:hover .ax-app-ico{transform:scale(1.08);box-shadow:0 4px 16px rgba(${t.primaryRgb},.2)}
.ax-app-lbl{font-size:9px;margin-top:4px;color:${t.text};letter-spacing:.5px;text-shadow:0 1px 3px rgba(0,0,0,.3)}
.ax-app-badge{position:absolute;top:-2px;right:6px;min-width:14px;height:14px;border-radius:7px;background:${badge};color:#fff;font-size:8px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 3px;box-shadow:0 1px 3px rgba(0,0,0,.3)}
.ax-app-view{flex:1;display:flex;flex-direction:column;overflow:hidden;animation:axSlideIn .25s ease}
@keyframes axSlideIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
.ax-av-header{display:flex;align-items:center;gap:8px;padding:8px 14px;background:${t.bgAlt};border-bottom:1px solid ${t.border};flex-shrink:0}
.ax-av-back{font-size:20px;cursor:pointer;color:${t.primary};line-height:1;padding:0 4px;transition:transform .15s}
.ax-av-back:hover{transform:translateX(-2px)}
.ax-av-title{font-size:12px;font-weight:600;color:${t.text};letter-spacing:.5px}
.ax-av-body{flex:1;overflow-y:auto;padding:10px 12px;scrollbar-width:thin;scrollbar-color:${t.scrollThumb} transparent}
.ax-av-body::-webkit-scrollbar{width:3px}.ax-av-body::-webkit-scrollbar-track{background:transparent}.ax-av-body::-webkit-scrollbar-thumb{background:${t.scrollThumb};border-radius:2px}
.ax-nil{text-align:center;padding:36px 16px;color:${t.textMuted};font-size:11px;font-style:italic;letter-spacing:1px}
.ax-sec-h{font-size:10px;color:${t.primary};letter-spacing:1.5px;font-weight:600;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid ${t.divider}}
@keyframes axAppWiggle{0%{transform:rotate(-1.5deg)}100%{transform:rotate(1.5deg)}}
@keyframes axBlink{0%,100%{opacity:1}50%{opacity:.6}}
@keyframes axIn{from{opacity:0}to{opacity:1}}
@keyframes axUp{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes axAlertBlink{0%,100%{opacity:1}50%{opacity:.4}}
.ax-list-item{display:flex;align-items:center;gap:8px;padding:8px;border-radius:12px;transition:background .15s;cursor:pointer}
.ax-list-item:hover{background:${t.surfaceHover}}.ax-list-item+.ax-list-item{margin-top:2px}
.ax-list-ico{width:36px;height:36px;border-radius:10px;background:${t.iconBg};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.ax-list-body{flex:1;min-width:0}.ax-list-main{font-size:11px;color:${t.text};font-weight:500;display:flex;align-items:center;gap:4px}
.ax-list-sub{font-size:9px;color:${t.textMuted};margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ax-list-end{flex-shrink:0;display:flex;align-items:center;gap:4px}
.ax-tag{font-size:7px;padding:2px 6px;border-radius:6px;font-weight:600;letter-spacing:.5px}
.ax-t-r{background:${t.surfaceActive};color:${t.textDim}}.ax-t-sr{background:rgba(${t.srRgb},.12);color:${t.sr}}
.ax-t-ssr{background:rgba(${t.accentRgb},.12);color:${t.ssr}}.ax-t-sss{background:rgba(${t.sssRgb},.12);color:${t.sss};animation:axBlink 2s infinite}
.ax-bar{display:flex;align-items:center;gap:4px;margin-top:3px}
.ax-bar-lbl{font-size:7px;color:${t.textMuted};width:20px;text-align:right;flex-shrink:0}
.ax-bar-track{flex:1;height:4px;background:${t.trackBg};border-radius:2px;overflow:hidden}
.ax-bar-fill{height:100%;border-radius:2px;transition:width .5s}
.ax-bf-bond{background:${t.barBond}}.ax-bf-evo{background:${t.barEvo}}
.ax-bf-sat-ok{background:${t.barSatOk}}.ax-bf-sat-low{background:${t.barSatLow}}.ax-bf-sat-crit{background:${t.barSatCrit}}
.ax-bar-num{font-size:7px;color:${t.textDim};width:22px;font-family:'Courier New',monospace;flex-shrink:0}
.ax-sat-warn{font-size:6px;animation:axAlertBlink 1.5s infinite}.ax-sat-warn-low{color:${t.accent}}.ax-sat-warn-crit{color:${t.fail}}
.ax-detail-panel{display:none;margin:0 4px 4px 52px;padding:8px 10px;background:${t.surfaceHover};border-radius:10px;font-size:9px;color:${t.textDim};line-height:1.5;animation:axIn .2s ease;white-space:pre-wrap}.ax-detail-panel.show{display:block}
.ax-loy{font-size:7px;padding:1px 5px;border-radius:6px}
.ax-loy-lo{background:rgba(${t.primaryRgb},.1);color:${t.fail}}.ax-loy-mid{background:rgba(${t.accentRgb},.1);color:${t.accent}}
.ax-loy-hi{background:rgba(${t.loyHiRgb},.1);color:${t.loyHi}}.ax-loy-max{background:rgba(${t.loyMaxRgb},.1);color:${t.loyMax}}
.ax-bag-tabs{display:flex;gap:0;overflow-x:auto;border-bottom:1px solid ${t.divider};margin-bottom:6px;scrollbar-width:none}.ax-bag-tabs::-webkit-scrollbar{display:none}
.ax-bag-tab{font-size:9px;padding:6px 8px;color:${t.textMuted};cursor:pointer;white-space:nowrap;transition:all .2s;position:relative;flex-shrink:0}
.ax-bag-tab:hover{color:${t.textDim}}.ax-bag-tab.on{color:${t.primary}}
.ax-bag-tab.on::after{content:'';position:absolute;bottom:0;left:15%;right:15%;height:2px;background:${t.primary};border-radius:1px}
.ax-bag-tab .ax-cnt{font-size:7px;opacity:.5;margin-left:1px}
.ax-bag-tab.drop-hl{color:${t.primary}!important}
.ax-bag-list{min-height:40px}
.ax-bag-entry{display:flex;align-items:center;gap:6px;padding:7px 8px;border-radius:10px;cursor:pointer;transition:background .15s;user-select:none}
.ax-bag-entry:hover{background:${t.surfaceHover}}.ax-bag-entry+.ax-bag-entry{margin-top:1px}.ax-bag-entry.dragging{opacity:.25}
.ax-bag-entry-name{font-size:10px;color:${t.text};flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ax-bag-entry-tier{font-size:9px;flex-shrink:0}
.ax-it-base{color:${t.textMuted}}.ax-it-r{color:${t.text}}.ax-it-sr{color:${t.sr}}.ax-it-ssr{color:${t.ssr}}.ax-it-sss{color:${t.sss}}
.ax-bag-detail{display:none;margin:0 4px 2px 32px;padding:6px 10px;background:${t.surfaceHover};border-radius:8px;font-size:9px;color:${t.textMuted};line-height:1.4;font-style:italic;animation:axIn .2s ease}.ax-bag-detail.show{display:block}
.ax-grip{color:${t.textMuted};font-size:9px;cursor:grab;flex-shrink:0;touch-action:none;padding:2px;line-height:1}.ax-grip:active{cursor:grabbing;color:${t.primary}}
.ax-drop-line{height:2px;background:${t.primary};margin:0 8px;border-radius:1px}
.ax-bag-ghost{position:fixed;z-index:200000;pointer-events:none;padding:4px 10px;border-radius:8px;font-size:10px;background:${t.bgCard};border:1px solid ${t.primary};color:${t.text};box-shadow:0 4px 16px rgba(0,0,0,.4);opacity:.9;white-space:nowrap;max-width:180px;overflow:hidden;text-overflow:ellipsis}
.ax-pty-header{display:flex;align-items:center;gap:12px;padding:12px;background:${t.surfaceHover};border-radius:14px;margin-bottom:8px}
.ax-pty-emblem{font-size:36px;cursor:pointer;transition:transform .2s;line-height:1}.ax-pty-emblem:hover{transform:scale(1.15)}
.ax-pty-info{flex:1;min-width:0}
.ax-pty-name{font-size:15px;font-weight:700;color:${t.text};cursor:pointer;transition:color .2s}.ax-pty-name:hover{color:${t.accent}}
.ax-pty-motto{font-size:9px;color:${t.textMuted};font-style:italic;margin-top:2px;cursor:pointer;transition:color .2s}.ax-pty-motto:hover{color:${t.accent}}
.ax-pty-stats{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
.ax-pty-stat{display:flex;align-items:center;gap:4px;padding:6px 10px;background:${t.surfaceHover};border-radius:10px;font-size:10px;color:${t.textDim};flex:1;min-width:80px}
.ax-pty-stat-val{color:${t.accent};font-weight:600;font-family:'Courier New',monospace;margin-left:auto}
.ax-pty-member{padding:5px 8px;font-size:10px;color:${t.text};display:flex;align-items:center;gap:6px;border-radius:8px;transition:background .15s}.ax-pty-member:hover{background:${t.surfaceHover}}.ax-pty-member::before{content:'›';color:${t.primary};font-weight:700}
.ax-emblem-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:4px;padding:6px 0}
.ax-emblem-opt{font-size:20px;text-align:center;cursor:pointer;padding:6px 0;border-radius:8px;transition:all .2s;line-height:1;border:1px solid transparent}
.ax-emblem-opt:hover{background:${t.surfaceHover};border-color:${t.border}}.ax-emblem-opt.on{background:rgba(${t.primaryRgb},.15);border-color:${t.primary}}
.ax-contrib-card{background:${t.surfaceHover};border-radius:14px;padding:12px;margin-bottom:10px;display:flex;align-items:center;gap:12px}
.ax-contrib-ring{position:relative;width:50px;height:50px;flex-shrink:0}
.ax-contrib-ring svg{width:50px;height:50px;filter:drop-shadow(0 0 4px rgba(${t.accentRgb},.15))}
.ax-ring-bg{fill:none;stroke:${t.trackBg};stroke-width:5}.ax-ring-fill{fill:none;stroke:url(#axRingGrad);stroke-width:5;stroke-linecap:round;transition:stroke-dashoffset .6s ease}
.ax-ring-text{fill:${t.accent};font-size:13px;font-weight:700;font-family:'Courier New',monospace;text-anchor:middle;dominant-baseline:central}
.ax-contrib-info{flex:1}.ax-contrib-label{font-size:8px;color:${t.textMuted};letter-spacing:1px}
.ax-contrib-val{font-size:16px;font-weight:700;color:${t.accent};font-family:'Courier New',monospace}
.ax-avatar-row{display:flex;justify-content:center;gap:24px;padding:10px 0 6px}
.ax-avatar-wrap{display:flex;flex-direction:column;align-items:center;cursor:pointer;transition:transform .15s}.ax-avatar-wrap:active{transform:scale(.95)}
.ax-avatar-img{width:54px;height:54px;border-radius:50%;overflow:hidden;border:2.5px solid transparent;transition:all .3s;box-shadow:0 2px 8px rgba(0,0,0,.2)}
.ax-avatar-img.unknown{filter:grayscale(1) brightness(.35);opacity:.4;border-color:${t.border}}
.ax-avatar-img.known{border-color:rgba(${t.accentRgb},.25)}.ax-avatar-img.selected{border-color:${t.accent};box-shadow:0 0 16px rgba(${t.accentRgb},.35)}
.ax-avatar-inner{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:26px;background:${t.iconBg};background-size:cover;background-position:center}
.ax-avatar-name{font-size:9px;margin-top:4px;color:${t.textDim};letter-spacing:.5px}.ax-avatar-name.unknown{color:${t.textLocked}}
.ax-tree{padding:6px 0;animation:axIn .25s ease}
.ax-tree-header{text-align:center;font-size:10px;color:${t.textDim};letter-spacing:1.5px;margin-bottom:8px;font-weight:600}
.ax-tree-connector{width:2px;height:14px;background:linear-gradient(180deg,${t.border},rgba(${t.accentRgb},.15));margin:0 auto}
.ax-tree-nodes{display:flex;flex-direction:column;align-items:center}
.ax-tree-node{display:flex;align-items:center;gap:8px;padding:10px 14px;width:88%;max-width:280px;border-radius:14px;background:${t.surfaceHover};cursor:pointer;transition:all .25s;position:relative;border:1px solid transparent}
.ax-tree-node:hover{background:${t.surfaceActive}}
.ax-tree-node.locked{opacity:.3;cursor:default}.ax-tree-node.locked:hover{background:${t.surfaceHover}}
.ax-tree-node.ready{opacity:.8;cursor:pointer;border-color:rgba(${t.accentRgb},.2);border-style:dashed}
.ax-tree-node.ready:hover{opacity:1;border-color:rgba(${t.accentRgb},.4)}
.ax-tree-node.unlocked{border-color:rgba(${t.accentRgb},.2)}
.ax-tree-node.unlocked::before{content:'';position:absolute;left:0;top:8px;bottom:8px;width:3px;background:${t.accent};border-radius:0 2px 2px 0}
.ax-tree-node-ico{font-size:20px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;background:${t.iconBg};border-radius:10px;flex-shrink:0}
.ax-tree-node-ico.off{filter:grayscale(1) brightness(.4)}
.ax-tree-node-body{flex:1;min-width:0}
.ax-tree-node-row1{display:flex;align-items:center;gap:4px}
.ax-tree-node-name{font-size:10px;font-weight:600;color:${t.text};overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ax-tree-node.locked .ax-tree-node-name{color:${t.textLocked}}.ax-tree-node.ready .ax-tree-node-name{color:${t.textDim}}
.ax-tree-node-cost{font-size:7px;color:${t.textMuted};background:${t.surfaceActive};padding:1px 5px;border-radius:4px;flex-shrink:0}
.ax-tree-node-tag{font-size:7px;flex-shrink:0}.ax-tree-node-tag.done{color:${t.pass}}.ax-tree-node-tag.can{color:${t.green};animation:axBlink 2s infinite}
.ax-tree-node-eff{font-size:8px;color:${t.textDim};margin-top:3px;line-height:1.5;display:none;animation:axIn .2s ease}.ax-tree-node-eff.show{display:block}
.ax-dg-group{margin-bottom:8px}
.ax-dg-grade{font-size:10px;color:${t.textDim};letter-spacing:2px;font-weight:700;margin-bottom:4px;padding-bottom:3px;border-bottom:1px solid ${t.divider}}
.ax-dg-row{display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-radius:10px;font-size:10px;transition:background .15s;margin-bottom:1px}
.ax-dg-row:hover{background:${t.surfaceHover}}
.ax-dg-name{color:${t.text}}.ax-dg-tag{font-size:8px;font-weight:500}
.ax-dg-pass{color:${t.pass}}.ax-dg-lock{color:${t.textLocked}}.ax-dg-fail{color:${t.fail}}
.ax-dg-active{color:${t.accent};animation:axBlink 2s infinite}
.ax-dg-row.locked{opacity:.25}.ax-dg-row.locked .ax-dg-name{color:${t.textLocked};letter-spacing:2px}
.ax-dg-row.active{animation:axReveal 3s ease forwards}.ax-dg-row.active .ax-dg-name{color:${t.accent}}
@keyframes axReveal{from{opacity:.15;filter:blur(3px)}to{opacity:1;filter:blur(0)}}
.ax-ov-cards{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 0}
.ax-ov-card{text-align:center;padding:20px 8px;background:${t.surfaceHover};border-radius:16px}
.ax-ov-val{font-size:32px;font-weight:700;font-family:'Courier New',monospace;line-height:1}
.ax-ov-lbl{font-size:8px;color:${t.textMuted};letter-spacing:2px;margin-top:8px;text-transform:uppercase}
.ax-ov-pass{color:${t.pass}}.ax-ov-death{color:${t.fail}}
.ax-fl-row{display:flex;justify-content:space-between;align-items:center;padding:8px;border-radius:10px;font-size:10px;transition:background .15s}
.ax-fl-row:hover{background:${t.surfaceHover}}.ax-fl-row+.ax-fl-row{margin-top:2px}
.ax-fl-who{color:${t.fail};text-decoration:line-through;opacity:.8}.ax-fl-how{color:${t.textMuted};font-size:9px;max-width:55%;text-align:right}
.ax-theme-list{display:flex;flex-direction:column;gap:4px}
.ax-theme-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;cursor:pointer;transition:all .2s}
.ax-theme-row:hover{background:${t.surfaceHover}}.ax-theme-row.active{background:${t.surfaceActive}}
.ax-theme-row-icon{font-size:20px;width:24px;text-align:center}
.ax-theme-row-name{font-size:11px;font-weight:600;letter-spacing:1px;flex:1}
.ax-theme-row-dots{display:flex;gap:3px}
.ax-theme-row-dot{width:10px;height:10px;border-radius:50%;border:1px solid rgba(0,0,0,.1)}
.ax-theme-row-check{font-size:12px;opacity:0;transition:opacity .2s;flex-shrink:0}.ax-theme-row.active .ax-theme-row-check{opacity:1}
.ax-img-sec{margin-top:16px;padding-top:10px;border-top:1px solid ${t.divider}}
.ax-img-sec-h{font-size:10px;color:${t.primary};letter-spacing:1.5px;font-weight:600;margin-bottom:8px}
.ax-img-row{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:12px;margin-bottom:4px;background:${t.surfaceHover}}
.ax-img-preview{width:36px;height:36px;border-radius:8px;background:${t.iconBg};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;overflow:hidden;background-size:cover;background-position:center}
.ax-img-info{flex:1;min-width:0}
.ax-img-label{font-size:10px;color:${t.text};font-weight:500}
.ax-img-status{font-size:8px;color:${t.textMuted};margin-top:1px}
.ax-img-btns{display:flex;gap:4px;flex-shrink:0}
.ax-img-btn{padding:4px 10px;border-radius:8px;font-size:9px;cursor:pointer;border:1px solid ${t.border};background:transparent;color:${t.textDim};transition:all .2s;font-family:inherit}
.ax-img-btn:hover{background:${t.surfaceActive};border-color:${t.primary};color:${t.primary}}
.ax-img-btn.danger{color:${t.fail};border-color:rgba(${t.primaryRgb},.2)}.ax-img-btn.danger:hover{border-color:${t.fail};background:rgba(${t.primaryRgb},.08)}
.ax-mask-inline{font-size:8px;color:${t.mask};font-style:italic}
.ax-dlg-mask{position:absolute;inset:0;background:${t.dlgMask};display:flex;align-items:center;justify-content:center;z-index:10000;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);animation:axIn .2s ease}
.ax-dlg-box{background:${t.bg};border:1px solid ${t.border};border-radius:18px;padding:18px;width:86%;max-width:300px;box-shadow:0 12px 40px rgba(0,0,0,.5);animation:axUp .25s ease;max-height:80%;overflow-y:auto;color:${t.text}}
.ax-dlg-h{font-size:12px;color:${t.accent};letter-spacing:1px;margin-bottom:3px;font-weight:600}
.ax-dlg-sub{font-size:9px;color:${t.textMuted};margin-bottom:8px}
.ax-dlg-input{width:100%;padding:8px 12px;border:1px solid ${t.border};border-radius:10px;background:${t.bgAlt};color:${t.text};font-size:12px;font-family:inherit;outline:none;transition:border-color .2s;box-sizing:border-box}
.ax-dlg-input:focus{border-color:${t.accent}}.ax-dlg-input::placeholder{color:${t.textMuted};font-size:10px}
.ax-dlg-actions{display:flex;gap:6px;margin-top:10px;justify-content:flex-end}
.ax-dlg-btn{padding:6px 16px;border-radius:10px;font-size:10px;cursor:pointer;transition:all .2s;border:1px solid;font-family:inherit}
.ax-dlg-cancel{background:${t.surfaceHover};border-color:${t.borderLight};color:${t.textDim}}.ax-dlg-cancel:hover{background:${t.surfaceActive}}
.ax-dlg-ok{background:rgba(${t.accentRgb},.12);border-color:rgba(${t.accentRgb},.3);color:${t.accent}}.ax-dlg-ok:hover{background:rgba(${t.accentRgb},.22)}
.ax-dlg-err{font-size:9px;color:${t.fail};margin-top:5px;min-height:13px}
.ax-chat-list-wrapper{display:flex;flex-direction:column;width:100%}
.ax-chat-list-item{display:flex;align-items:center;gap:10px;padding:10px 8px;border-radius:12px;cursor:pointer;transition:background .15s;position:relative}
.ax-chat-list-item:hover{background:${t.surfaceHover}}.ax-chat-list-item+.ax-chat-list-item{margin-top:2px}
.ax-chat-avatar{width:40px;height:40px;border-radius:50%;background:${t.iconBg};display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;overflow:hidden;background-size:cover;background-position:center}
.ax-chat-list-body{flex:1;min-width:0}
.ax-chat-list-name{font-size:11px;font-weight:600;color:${t.text};display:flex;justify-content:space-between;align-items:center}
.ax-chat-list-time{font-size:8px;color:${t.textMuted};font-weight:400}
.ax-chat-list-preview{font-size:9px;color:${t.textMuted};margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ax-chat-unread{min-width:16px;height:16px;border-radius:8px;background:${badge};color:#fff;font-size:8px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px;flex-shrink:0}
.ax-chat-del-btn{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;color:${t.textMuted};cursor:pointer;transition:all .2s;opacity:0}
.ax-chat-list-item:hover .ax-chat-del-btn{opacity:1}
.ax-chat-del-btn:hover{color:${t.fail};background:rgba(${t.primaryRgb},.1)}
.ax-chat-new-btn{display:flex;align-items:center;justify-content:center;gap:4px;padding:8px;border-radius:12px;background:${t.surfaceHover};color:${t.primary};font-size:10px;cursor:pointer;transition:all .2s;margin-bottom:6px;border:1px dashed ${t.border}}
.ax-chat-new-btn:hover{background:${t.surfaceActive};border-color:${t.primary}}
.ax-chat-view{display:flex;flex-direction:column;height:100%;overflow:hidden}
.ax-chat-msgs{flex:1;overflow-y:auto;padding:10px 12px;display:flex;flex-direction:column;gap:6px;scrollbar-width:thin;scrollbar-color:${t.scrollThumb} transparent}
.ax-chat-msgs::-webkit-scrollbar{width:3px}.ax-chat-msgs::-webkit-scrollbar-track{background:transparent}.ax-chat-msgs::-webkit-scrollbar-thumb{background:${t.scrollThumb};border-radius:2px}
.ax-chat-bubble{max-width:78%;padding:8px 12px;border-radius:16px;font-size:10px;line-height:1.5;word-break:break-word;white-space:pre-wrap;animation:axIn .2s ease}
.ax-chat-bubble.user{align-self:flex-end;background:${t.chatBubbleUser || 'rgba(' + t.primaryRgb + ',.2)'};border-bottom-right-radius:4px;color:${t.text}}
.ax-chat-bubble.npc{align-self:flex-start;background:${t.chatBubbleNpc || 'rgba(255,255,255,.06)'};border-bottom-left-radius:4px;color:${t.text}}
.ax-chat-bubble .ax-chat-time{font-size:7px;color:${t.textMuted};margin-top:3px;display:block;text-align:right}
.ax-chat-bubble.npc .ax-chat-time{text-align:left}
.ax-chat-typing{align-self:flex-start;padding:8px 16px;border-radius:16px;background:${t.chatBubbleNpc || 'rgba(255,255,255,.06)'};border-bottom-left-radius:4px;font-size:10px;color:${t.textMuted}}
.ax-chat-typing-dots{display:inline-flex;gap:3px}
.ax-chat-typing-dots span{width:5px;height:5px;border-radius:50%;background:${t.textMuted};animation:axTyping 1.4s infinite}
.ax-chat-typing-dots span:nth-child(2){animation-delay:.2s}
.ax-chat-typing-dots span:nth-child(3){animation-delay:.4s}
@keyframes axTyping{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}}
.ax-chat-input-bar{display:flex;gap:6px;padding:8px 10px;border-top:1px solid ${t.border};background:${t.chatInput || t.bgAlt};flex-shrink:0;align-items:flex-end}
.ax-chat-input{flex:1;border:1px solid ${t.border};border-radius:18px;padding:7px 14px;font-size:11px;color:${t.text};background:${t.bg};outline:none;font-family:inherit;resize:none;min-height:20px;max-height:80px;line-height:1.4;overflow-y:auto}
.ax-chat-input:focus{border-color:rgba(${t.primaryRgb},.4)}
.ax-chat-input::placeholder{color:${t.textMuted};font-size:10px}
.ax-chat-sticker-btn{width:34px;height:34px;border-radius:50%;background:transparent;border:1px solid ${t.border};color:${t.textDim};font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;line-height:1}
.ax-chat-sticker-btn:hover{border-color:${t.primary};color:${t.primary};background:${t.surfaceHover}}
.ax-stk-item:hover{border-color:${t.primary}!important;transform:scale(1.08);box-shadow:0 2px 8px rgba(0,0,0,.2)}
.ax-chat-send{width:34px;height:34px;border-radius:50%;background:${t.primary};color:#fff;border:none;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s}
.ax-chat-send:hover{box-shadow:0 0 10px rgba(${t.primaryRgb},.4);transform:scale(1.05)}
.ax-chat-send:disabled{opacity:.3;cursor:default;transform:none;box-shadow:none}
.ax-chat-msgs-bg{flex:1;overflow-y:auto;padding:10px 12px;display:flex;flex-direction:column;gap:6px;scrollbar-width:thin;scrollbar-color:${t.scrollThumb} transparent;background-size:cover;background-position:center;background-repeat:no-repeat}
.ax-chat-msgs-bg::-webkit-scrollbar{width:3px}.ax-chat-msgs-bg::-webkit-scrollbar-track{background:transparent}.ax-chat-msgs-bg::-webkit-scrollbar-thumb{background:${t.scrollThumb};border-radius:2px}
.ax-model-select{width:100%;padding:7px 10px;border:1px solid ${t.border};border-radius:8px;background:${t.bgAlt};color:${t.text};font-size:10px;font-family:inherit;outline:none;transition:border-color .2s;box-sizing:border-box;cursor:pointer;appearance:none;-webkit-appearance:none}
.ax-model-select:focus{border-color:${t.accent}}
.ax-model-select option{background:${t.bg};color:${t.text}}
.ax-fetch-models-btn{padding:7px 10px;border-radius:8px;border:1px solid ${t.border};background:${t.surfaceHover};color:${t.textDim};cursor:pointer;font-size:9px;flex-shrink:0;transition:all .2s;font-family:inherit;white-space:nowrap}
.ax-fetch-models-btn:hover{border-color:${t.primary};color:${t.primary};background:${t.surfaceActive}}
.ax-fetch-models-btn:disabled{opacity:.4;cursor:default}
.ax-model-row{display:flex;gap:4px;align-items:stretch}
.ax-model-row select,.ax-model-row input{flex:1}
.ax-chat-npc-header{display:flex;align-items:center;gap:8px;padding:6px 0;margin-bottom:4px}
.ax-chat-npc-avatar{width:28px;height:28px;border-radius:50%;background:${t.iconBg};display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;overflow:hidden;background-size:cover;background-position:center}
.ax-chat-npc-name{font-size:10px;color:${t.textDim};font-weight:500}
.ax-chat-date-sep{text-align:center;font-size:8px;color:${t.textMuted};padding:6px 0;letter-spacing:1px}
.ax-chat-actions{display:flex;gap:6px;align-items:center}
.ax-chat-action-btn{padding:3px 8px;border-radius:8px;font-size:8px;cursor:pointer;border:1px solid ${t.border};background:transparent;color:${t.textMuted};transition:all .2s;font-family:inherit}
.ax-chat-action-btn:hover{border-color:${t.primary};color:${t.primary};background:${t.surfaceHover}}
.ax-chat-action-btn.danger:hover{border-color:${t.fail};color:${t.fail}}
.ax-chat-empty{text-align:center;padding:40px 20px;color:${t.textMuted};font-size:10px;font-style:italic}
.ax-api-card{background:${t.surfaceHover};border-radius:14px;padding:10px 12px;margin-bottom:6px;transition:all .2s;border:1px solid transparent}
.ax-api-card:hover{border-color:${t.border}}
.ax-api-card.default{border-color:rgba(${t.accentRgb},.3)}
.ax-api-card-top{display:flex;align-items:center;gap:8px}
.ax-api-card-ico{font-size:18px;flex-shrink:0}
.ax-api-card-body{flex:1;min-width:0}
.ax-api-card-name{font-size:11px;font-weight:600;color:${t.text};display:flex;align-items:center;gap:4px}
.ax-api-card-name .ax-api-default-tag{font-size:7px;color:${t.accent};background:rgba(${t.accentRgb},.12);padding:1px 5px;border-radius:4px}
.ax-api-card-url{font-size:8px;color:${t.textMuted};margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ax-api-card-model{font-size:8px;color:${t.textDim};margin-top:1px}
.ax-api-card-actions{display:flex;gap:4px;flex-shrink:0}
.ax-api-btn{padding:4px 8px;border-radius:6px;font-size:8px;cursor:pointer;border:1px solid ${t.border};background:transparent;color:${t.textDim};transition:all .2s;font-family:inherit}
.ax-api-btn:hover{background:${t.surfaceActive};border-color:${t.primary};color:${t.primary}}
.ax-api-btn.danger:hover{border-color:${t.fail};color:${t.fail}}
.ax-api-add-btn{display:flex;align-items:center;justify-content:center;gap:4px;padding:10px;border-radius:14px;background:transparent;color:${t.primary};font-size:10px;cursor:pointer;transition:all .2s;border:1px dashed ${t.border};margin-top:6px}
.ax-api-add-btn:hover{background:${t.surfaceHover};border-color:${t.primary}}
.ax-api-form label{display:block;font-size:9px;color:${t.textDim};margin-bottom:3px;margin-top:8px;letter-spacing:.5px}
.ax-api-form label:first-child{margin-top:0}
.ax-api-form input,.ax-api-form textarea{width:100%;padding:7px 10px;border:1px solid ${t.border};border-radius:8px;background:${t.bgAlt};color:${t.text};font-size:10px;font-family:inherit;outline:none;transition:border-color .2s;box-sizing:border-box}
.ax-api-form input:focus,.ax-api-form textarea:focus{border-color:${t.accent}}
.ax-api-form input::placeholder,.ax-api-form textarea::placeholder{color:${t.textMuted};font-size:9px}
.ax-api-form textarea{resize:vertical;min-height:40px;max-height:100px}
.ax-api-form .ax-api-key-row{display:flex;gap:4px}.ax-api-form .ax-api-key-row input{flex:1}
.ax-api-form .ax-api-toggle-key{padding:7px 8px;border-radius:8px;border:1px solid ${t.border};background:${t.surfaceHover};color:${t.textDim};cursor:pointer;font-size:9px;flex-shrink:0;transition:all .2s}
.ax-api-form .ax-api-toggle-key:hover{border-color:${t.primary};color:${t.primary}}
.ax-chat-sticker-btn+.ax-chat-sticker-btn{margin-left:-2px}
.ax-msg-tabs{display:flex;border-top:1px solid ${t.border};flex-shrink:0;background:${t.bgAlt}}
.ax-msg-tab{flex:1;text-align:center;padding:8px 0 6px;font-size:9px;color:${t.textMuted};cursor:pointer;transition:all .2s;position:relative;display:flex;flex-direction:column;align-items:center;gap:2px}
.ax-msg-tab:hover{color:${t.textDim}}.ax-msg-tab.on{color:${t.primary}}
.ax-msg-tab.on::after{content:'';position:absolute;top:0;left:20%;right:20%;height:2px;background:${t.primary};border-radius:0 0 1px 1px}
.ax-msg-tab-icon{font-size:16px}
.ax-msg-tab-badge{position:absolute;top:2px;right:20%;min-width:14px;height:14px;border-radius:7px;background:${badge};color:#fff;font-size:7px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 3px}
.ax-friend-req{display:flex;align-items:center;gap:8px;padding:10px 8px;border-radius:12px;margin-bottom:4px;background:${t.surfaceHover}}
.ax-friend-req-avatar{width:36px;height:36px;border-radius:50%;background:${t.iconBg};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;overflow:hidden;background-size:cover;background-position:center}
.ax-friend-req-body{flex:1;min-width:0}
.ax-friend-req-name{font-size:11px;font-weight:600;color:${t.text}}
.ax-friend-req-msg{font-size:8px;color:${t.textMuted};margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ax-friend-req-actions{display:flex;gap:4px;flex-shrink:0}
.ax-friend-btn{padding:4px 12px;border-radius:8px;font-size:9px;cursor:pointer;border:1px solid;transition:all .2s;font-family:inherit}
.ax-friend-accept{background:rgba(${t.primaryRgb},.12);border-color:rgba(${t.primaryRgb},.3);color:${t.primary}}.ax-friend-accept:hover{background:rgba(${t.primaryRgb},.22)}
.ax-friend-reject{background:transparent;border-color:${t.border};color:${t.textMuted}}.ax-friend-reject:hover{background:${t.surfaceActive};color:${t.fail}}
.ax-friend-block{background:transparent;border-color:rgba(${t.primaryRgb},.15);color:${t.textMuted};font-size:8px}.ax-friend-block:hover{border-color:${t.fail};color:${t.fail}}
.ax-moment-card{background:${t.surfaceHover};border-radius:14px;padding:10px 12px;margin-bottom:8px;transition:all .2s}
.ax-moment-header{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.ax-moment-avatar{width:32px;height:32px;border-radius:50%;background:${t.iconBg};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;overflow:hidden;background-size:cover;background-position:center}
.ax-moment-author{font-size:10px;font-weight:600;color:${t.text}}
.ax-moment-time{font-size:7px;color:${t.textMuted};margin-left:auto}
.ax-moment-content{font-size:10px;color:${t.text};line-height:1.6;white-space:pre-wrap;margin-bottom:6px}
.ax-moment-actions{display:flex;gap:12px;padding-top:4px;border-top:1px solid ${t.divider}}
.ax-moment-action{font-size:9px;color:${t.textMuted};cursor:pointer;display:flex;align-items:center;gap:3px;transition:color .2s}
.ax-moment-action:hover{color:${t.primary}}
.ax-moment-action.liked{color:${t.pink}}
.ax-moment-likes{font-size:8px;color:${t.textDim};padding:3px 0;display:flex;align-items:center;gap:3px;flex-wrap:wrap}
.ax-moment-comments{border-top:1px solid ${t.divider};padding-top:4px;margin-top:4px}
.ax-moment-comment{font-size:9px;color:${t.textDim};padding:3px 0;line-height:1.4}
.ax-moment-comment-author{color:${t.primary};font-weight:600;cursor:pointer}
.ax-moment-comment-del{font-size:7px;color:${t.textMuted};cursor:pointer;margin-left:4px;opacity:0;transition:opacity .2s}
.ax-moment-comment:hover .ax-moment-comment-del{opacity:1}
.ax-moment-comment-del:hover{color:${t.fail}}
.ax-moment-input-row{display:flex;gap:4px;margin-top:4px}
.ax-moment-input{flex:1;border:1px solid ${t.border};border-radius:12px;padding:4px 10px;font-size:9px;color:${t.text};background:${t.bg};outline:none;font-family:inherit}
.ax-moment-input:focus{border-color:rgba(${t.primaryRgb},.4)}
.ax-moment-input::placeholder{color:${t.textMuted}}
.ax-moment-send-btn{padding:4px 10px;border-radius:12px;border:1px solid rgba(${t.primaryRgb},.3);background:rgba(${t.primaryRgb},.08);color:${t.primary};font-size:9px;cursor:pointer;transition:all .2s;font-family:inherit;flex-shrink:0}
.ax-moment-send-btn:hover{background:rgba(${t.primaryRgb},.18)}
.ax-profile-header{text-align:center;padding:16px 0 8px}
.ax-profile-avatar{width:64px;height:64px;border-radius:50%;margin:0 auto;background:${t.iconBg};display:flex;align-items:center;justify-content:center;font-size:28px;overflow:hidden;background-size:cover;background-position:center;border:3px solid rgba(${t.primaryRgb},.2);cursor:pointer;transition:all .2s}
.ax-profile-avatar:hover{border-color:${t.primary};box-shadow:0 0 12px rgba(${t.primaryRgb},.2)}
.ax-profile-name{font-size:14px;font-weight:700;color:${t.text};margin-top:8px;cursor:pointer;transition:color .2s}
.ax-profile-name:hover{color:${t.accent}}
.ax-profile-bio{font-size:9px;color:${t.textMuted};margin-top:3px;font-style:italic;cursor:pointer;transition:color .2s;max-width:80%;margin-left:auto;margin-right:auto}
.ax-profile-bio:hover{color:${t.textDim}}
.ax-profile-stats{display:flex;justify-content:center;gap:20px;padding:10px 0;margin:8px 0;border-top:1px solid ${t.divider};border-bottom:1px solid ${t.divider}}
.ax-profile-stat{text-align:center}
.ax-profile-stat-num{font-size:16px;font-weight:700;color:${t.accent};font-family:'Courier New',monospace}
.ax-profile-stat-label{font-size:7px;color:${t.textMuted};letter-spacing:1px;margin-top:2px}
.ax-blocked-row{display:flex;align-items:center;gap:8px;padding:8px;border-radius:10px;margin-bottom:3px;background:${t.surfaceHover}}
.ax-blocked-name{font-size:10px;color:${t.fail};flex:1;text-decoration:line-through;opacity:.7}
.ax-blocked-reason{font-size:8px;color:${t.textMuted};max-width:40%;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ax-chat-msg-row{display:flex;align-items:flex-end;gap:6px;width:100%}
.ax-chat-msg-row.user{flex-direction:row-reverse}
.ax-chat-msg-row.npc{flex-direction:row}
.ax-chat-msg-avatar{width:24px;height:24px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;overflow:hidden;background-size:cover;background-position:center}
.ax-chat-msg-avatar.user-av{background:${t.chatBubbleUser || 'rgba(' + t.primaryRgb + ',.15)'}}
.ax-chat-msg-avatar.npc-av{background:${t.iconBg}}
.ax-chat-msg-group{display:flex;flex-direction:column;gap:2px;max-width:72%;min-width:0}
.ax-chat-msg-row.user .ax-chat-msg-group{align-items:flex-end}
.ax-chat-msg-row.npc .ax-chat-msg-group{align-items:flex-start}
.ax-chat-msg-row .ax-chat-bubble{align-self:auto;max-width:100%}
@keyframes axMiniBar1{from{height:3px}to{height:10px}}
@keyframes axMiniBar2{from{height:8px}to{height:3px}}
@keyframes axMiniBar3{from{height:5px}to{height:11px}}
.ax-music-share:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.2)}
.ax-music-share:active{transform:scale(.98)}
.ax-ms-quick-song:hover{background:${t.surfaceHover}}
.ax-link-share:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.2)}
.ax-link-share:active{transform:scale(.98)}
.ax-forum-post-item:hover{background:${t.surfaceHover}}
.ax-forum-post-item:active{background:${t.surfaceActive}}
.ax-trigger-mini-player .ax-mini-play-btn:hover{transform:scale(1.2)}
.ax-trigger-mini-player .ax-mini-next-btn:hover{transform:scale(1.2)}
.ax-ext-grid-item:hover{background:${t.surfaceHover}}
.ax-ext-grid-item:hover div:first-child{transform:scale(1.08)}
.ax-ext-grid-item:active div:first-child{transform:scale(.95)}
#ax-resize-handle:hover{opacity:.8!important}
#${G.elIds.overlay}{min-width:280px;min-height:400px;max-width:95vw;max-height:90vh}
#${G.elIds.overlay} *:not(input):not(textarea):not(select):not(button){font-family:inherit}
#${G.elIds.overlay} .ax-av-body{font-size:calc(13px * var(--ax-fs,1))}
#${G.elIds.overlay} .ax-chat-bubble{font-size:calc(10px * var(--ax-fs,1))}
#${G.elIds.overlay} .ax-list-main{font-size:calc(11px * var(--ax-fs,1))}
#${G.elIds.overlay} .ax-dlg-input{font-size:calc(12px * var(--ax-fs,1))}
#${G.elIds.overlay} .ax-chat-input{font-size:calc(11px * var(--ax-fs,1))}
#${G.elIds.overlay} .ax-app-lbl{font-size:calc(9px * var(--ax-fs,1))}
#${G.elIds.overlay} .ax-av-title{font-size:calc(12px * var(--ax-fs,1))}
#${G.elIds.overlay} .ax-sec-h{font-size:calc(10px * var(--ax-fs,1))}
#${G.elIds.overlay} .ax-nil{font-size:calc(11px * var(--ax-fs,1))}
`;
  }

  function _ensureCss() { $('#' + G.elIds.css).remove(); $('<style>').attr('id', G.elIds.css).text(_generateCss()).appendTo('head') }
  function _applyTheme(k) { if (!THEMES[k]) return; _currentTheme = k; window.ABYSS_CURRENT_THEME = k; localStorage.setItem(STORAGE_KEY, k); _ensureCss(); _render(); _broadcastTheme(); _recordThemeUsage(k); _checkAchievements(); }

  /* ═══════════════════════════════════════
     构建手机外壳
     ═══════════════════════════════════════ */
  function _buildShell() {
    if ($('#' + G.elIds.trigger).length) return;
    _ensureCss(); _panelPositioned = false;
    const tm = _getTimeOnly();
    const totalUnread = _getTotalUnread();
    const badgeHtml = totalUnread > 0 ? `<span class="ax-trigger-badge">${totalUnread > 99 ? '99+' : totalUnread}</span>` : '';
    $('body').append(
      `<div id="${G.elIds.trigger}">${tm}${badgeHtml}</div>` +
      `<div id="${G.elIds.overlay}" style="top:50px;left:50%;transform:translateX(-50%);width:98%;max-width:100%;height:95vh">` +
      `<div class="ax-ph-notch"><div class="ax-ph-notch-pill"></div></div>` +
      `<div class="ax-ph-statusbar" id="ax-drag-zone">` +
      `<span class="ax-ph-sb-time" id="ax-ph-time">${tm}</span>` +
      `<div class="ax-ph-sb-right"><span id="ax-size-btn" style="font-size:8px;cursor:pointer;padding:2px 4px;opacity:.5;transition:opacity .2s" title="切换尺寸">⊞</span><span style="font-size:7px;letter-spacing:-1px">●●●○</span><span style="font-size:9px">🔋</span><span class="ax-ph-close" id="ax-close-btn">✕</span></div>` +
      `</div>`
      +
      `<div class="ax-ph-screen" id="ax-screen"></div>` +
      `<div class="ax-ph-homebar"><div class="ax-ph-homebar-pill" id="ax-home-pill"></div></div>` +
      `</div>`
    );
    _wireTrigger(); _wirePhone(); _wireDrag(); _wireResize();
  }

  function _updateChrome() {
    const tm = _getTimeOnly();
    const totalUnread = _getTotalUnread();
    const $trigger = $('#' + G.elIds.trigger);
    $trigger.find('.ax-trigger-badge').remove();

    // 检查是否正在播放音乐
    const audio = _radioAudio;
    const isPlaying = audio && !audio.paused && _radioCurrentSong;

    if (isPlaying) {
      // 音乐播放中：悬浮标变成迷你播放器
      const songName = _radioCurrentSong.name || '♪';
      const truncName = songName.length > 6 ? songName.slice(0, 6) + '' : songName;
      const t = _t();

      // 清除旧内容
      $trigger.contents().filter(function () { return this.nodeType === 3 }).remove();
      if (!$trigger.find('.ax-trigger-mini-player').length) {
        $trigger.html('');
        $trigger.append(`<span class="ax-trigger-mini-player" style="display:flex;align-items:center;gap:4px;font-size:10px">
                    <span class="ax-mini-play-btn" style="cursor:pointer;font-size:12px" title="暂停">⏸</span>
                    <span class="ax-mini-bars" style="display:flex;align-items:flex-end;gap:1px;height:12px">
                        <span style="width:2px;background:${t.primary};border-radius:1px;animation:axMiniBar1 .6s ease infinite alternate;height:4px"></span>
                        <span style="width:2px;background:${t.primary};border-radius:1px;animation:axMiniBar2 .6s ease infinite alternate;height:8px"></span>
                        <span style="width:2px;background:${t.primary};border-radius:1px;animation:axMiniBar3 .6s ease infinite alternate;height:5px"></span>
                    </span>
                    <span class="ax-mini-song-name" style="max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_esc(truncName)}</span>
                    <span class="ax-mini-next-btn" style="cursor:pointer;font-size:10px" title="下一首">⏭</span>
                </span>`);

        // 暂停/播放按钮
        $trigger.find('.ax-mini-play-btn').on('click', function (e) {
          e.stopPropagation();
          const a = _getRadioAudio();
          if (a.paused) {
            a.play().catch(() => { });
            _radioPlaying = true;
            $(this).text('⏸');
          } else {
            a.pause();
            _radioPlaying = false;
            $(this).text('▶');
          }
          _updateChrome();
        });

        // 下一首按钮
        $trigger.find('.ax-mini-next-btn').on('click', function (e) {
          e.stopPropagation();
          _playNext();
        });
      } else {
        // 只更新歌名和播放状态
        $trigger.find('.ax-mini-song-name').text(truncName);
        $trigger.find('.ax-mini-play-btn').text(audio.paused ? '▶' : '⏸');
      }
    } else {
      // 没有播放音乐：恢复正常的时间显示
      $trigger.find('.ax-trigger-mini-player').remove();
      $trigger.contents().filter(function () { return this.nodeType === 3 }).remove();
      $trigger.prepend(tm);
    }

    if (totalUnread > 0) $trigger.append(`<span class="ax-trigger-badge">${totalUnread > 99 ? '99+' : totalUnread}</span>`);
    $('#ax-ph-time').text(tm);
  }

  function _wireTrigger() {
    const $el = $('#' + G.elIds.trigger), el = $el[0];
    let tD = false, mD = false, mP = false, ox, oy, sx, sy;
    $el.on('touchstart', e => { tD = false; const p = e.touches[0]; ox = p.clientX; oy = p.clientY; const r = el.getBoundingClientRect(); sx = r.left; sy = r.top });
    $el.on('touchmove', e => { const p = e.touches[0]; if (Math.abs(p.clientX - ox) > 10 || Math.abs(p.clientY - oy) > 10) { tD = true; $el.css({ left: sx + (p.clientX - ox) + 'px', top: sy + (p.clientY - oy) + 'px', right: 'auto', transform: 'none' }) } e.preventDefault() });
    $el.on('touchend', () => { if (!tD) _toggle(); tD = false });
    el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button !== 0) return; mP = true; mD = false; ox = e.clientX; oy = e.clientY; const r = el.getBoundingClientRect(); sx = r.left; sy = r.top; try { el.setPointerCapture(e.pointerId) } catch (_) { } e.preventDefault() });
    el.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || !mP) return; if (!mD && (Math.abs(e.clientX - ox) > 5 || Math.abs(e.clientY - oy) > 5)) mD = true; if (mD) $el.css({ left: sx + (e.clientX - ox) + 'px', top: sy + (e.clientY - oy) + 'px', right: 'auto', transform: 'none' }) });
    el.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') return; if (!mD) _toggle(); mP = false; mD = false });
    el.addEventListener('pointercancel', () => { mP = false; mD = false });
  }
  function _wirePhone() {
    $('#ax-close-btn').on('click', e => { e.stopPropagation(); _toggle() });
    $('#ax-home-pill').on('click', () => { if (_screen !== 'home') { _screen = 'home'; _skillNpc = null; _chatTarget = null; _forumCurrentPost = null; _openFolder = null; _returnToFolder = null; _render() } });
    // 预设尺寸切换
    const SIZES = [
      { w: '90%', maxW: '370px', h: '68vh', label: '标准' },
      { w: '95%', maxW: '500px', h: '80vh', label: '大' },
      { w: '60%', maxW: '340px', h: '55vh', label: '小' },
      { w: '98%', maxW: '100%', h: '95vh', label: '全屏' }
    ];
    let _sizeIdx = 3; // 默认全屏
    // 设置初始按钮图标为全屏状态
    $('#ax-size-btn').text('▣');
    $('#ax-size-btn').on('click', function (e) {
      e.stopPropagation();
      _sizeIdx = (_sizeIdx + 1) % SIZES.length;
      const s = SIZES[_sizeIdx];
      const $p = $('#' + G.elIds.overlay);
      $p.css({ width: s.w, maxWidth: s.maxW, height: s.h });
      $(this).text(['⊞', '⊡', '⊟', '▣'][_sizeIdx]);
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=info 尺寸：' + s.label);
    });
  }
  function _toggle() { const $p = $('#' + G.elIds.overlay); if (_visible) { $p.fadeOut(150); _visible = false; _dismissDialog() } else { _visible = true; _render(); $p.css('display', 'flex').hide().fadeIn(150) } }
  function _wireDrag() {
    const $p = $('#' + G.elIds.overlay), $z = $('#ax-drag-zone'), z = $z[0]; if (!z) return;
    let dr = false, pr = false, ox, oy, sx, sy;
    function freeze() { if (_panelPositioned) return { left: parseInt($p.css('left')) || 0, top: parseInt($p.css('top')) || 0 }; const r = $p[0].getBoundingClientRect(); $p[0].style.left = r.left + 'px'; $p[0].style.top = r.top + 'px'; $p[0].style.transform = 'none'; _panelPositioned = true; return { left: r.left, top: r.top } }
    $z.on('touchstart', e => { if ($(e.target).closest('.ax-ph-close').length) return; dr = false; const p = e.touches[0]; ox = p.clientX; oy = p.clientY });
    $z.on('touchmove', e => { const p = e.touches[0]; if (!dr && (Math.abs(p.clientX - ox) > 5 || Math.abs(p.clientY - oy) > 5)) { dr = true; const pos = freeze(); sx = pos.left; sy = pos.top } if (dr) { $p.css({ left: sx + (p.clientX - ox) + 'px', top: sy + (p.clientY - oy) + 'px' }); e.preventDefault() } });
    $z.on('touchend touchcancel', () => { dr = false });
    z.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button !== 0 || $(e.target).closest('.ax-ph-close').length) return; pr = true; dr = false; ox = e.clientX; oy = e.clientY; try { z.setPointerCapture(e.pointerId) } catch (_) { } e.preventDefault() });
    z.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || !pr) return; if (!dr && (Math.abs(e.clientX - ox) > 5 || Math.abs(e.clientY - oy) > 5)) { dr = true; z.style.cursor = 'grabbing'; const pos = freeze(); sx = pos.left; sy = pos.top } if (dr) $p.css({ left: sx + (e.clientX - ox) + 'px', top: sy + (e.clientY - oy) + 'px' }) });
    z.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') return; pr = false; dr = false; z.style.cursor = 'grab' });
    z.addEventListener('pointercancel', () => { pr = false; dr = false });
  }

  function _wireResize() {
    // 不再使用缩放手柄，改为预设尺寸切换（在状态栏左侧添加按钮）
    const el = document.getElementById(G.elIds.overlay);
    if (!el) return;
    el.style.resize = 'none';
    el.style.overflow = 'hidden';

    // 移除旧手柄
    const old = document.getElementById('ax-resize-handle');
    if (old) old.remove();
  }

  /* ═══════════════════════════════════════
      屏幕渲染主控
      ═══════════════════════════════════════ */
  function _render() { _updateChrome(); const $s = $('#ax-screen'); if (_screen === 'home') _drawHome($s); else _drawAppView($s, _screen) }
  function _toggleAppEditMode($s) {
    _appEditMode = !_appEditMode;
    const $grid = $s.find('#ax-app-grid-main');
    const $btn = $s.find('#ax-home-edit-btn');
    const $folderBtn = $s.find('#ax-home-new-folder');

    if (_appEditMode) {
      _enterEditMode($s);
    } else {
      _exitEditMode($s);
    }
  }

  function _exitEditMode($s) {
    _appEditMode = false;
    const $grid = $s.find('#ax-app-grid-main');
    const $btn = $s.find('#ax-home-edit-btn');
    const $folderBtn = $s.find('#ax-home-new-folder');

    $btn.text('✎ 排列').css('opacity', '.6');
    if ($folderBtn.length) $folderBtn.hide();
    $grid.find('.ax-app').css('animation', '');
    $grid.off('touchmove.edit touchend.edit touchcancel.edit');
    $grid.find('.ax-app').off('touchstart.edit pointerdown.edit');

    // 最终保存
    const currentOrder = _getOrderedApps();
    const finalOrder = [];
    const used = new Set();
    $grid.find('.ax-app').each(function () {
      const origIdx = parseInt($(this).data('order-idx'));
      if (!isNaN(origIdx) && currentOrder[origIdx] && !used.has(origIdx)) {
        finalOrder.push(currentOrder[origIdx]);
        used.add(origIdx);
      }
    });
    for (let i = 0; i < currentOrder.length; i++) {
      if (!used.has(i)) finalOrder.push(currentOrder[i]);
    }
    _saveAppOrder(finalOrder);
  }

  function _enterEditMode($s) {
    _appEditMode = true;
    const $grid = $s.find('#ax-app-grid-main');
    const $btn = $s.find('#ax-home-edit-btn');
    const $folderBtn = $s.find('#ax-home-new-folder');

    $btn.text('✓ 完成').css('opacity', '1');
    if ($folderBtn.length) $folderBtn.show().css('opacity', '1');
    $grid.find('.ax-app').css('animation', 'axAppWiggle .3s ease infinite alternate');

    let dragEl = null, ghostEl = null;

    function _rebuildAndSave() {
      const currentOrder = _getOrderedApps();
      const newOrder = [];
      const used = new Set();
      $grid.find('.ax-app').each(function () {
        const origIdx = parseInt($(this).data('order-idx'));
        if (!isNaN(origIdx) && currentOrder[origIdx] && !used.has(origIdx)) {
          newOrder.push(currentOrder[origIdx]);
          used.add(origIdx);
        }
      });
      for (let i = 0; i < currentOrder.length; i++) {
        if (!used.has(i)) newOrder.push(currentOrder[i]);
      }
      _saveAppOrder(newOrder);
    }

    function _cleanupDrag() {
      if (dragEl) dragEl.css('opacity', '1');
      if (ghostEl) { ghostEl.remove(); ghostEl = null; }
      dragEl = null;
      $grid.find('.ax-app[data-type="folder"] .ax-app-ico').css({ 'border': '', 'transform': '', 'background': '' });
    }

    function handleDragMove(x, y) {
      if (!dragEl || !ghostEl) return;
      ghostEl.css({ left: x + 'px', top: (y - 20) + 'px' });

      const dragType = dragEl.data('type');
      const els = $grid.find('.ax-app').not(dragEl);

      // 检查是否在文件夹上方
      let overFolder = null;
      if (dragType === 'app') {
        els.each(function () {
          const r = this.getBoundingClientRect();
          if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
            if ($(this).data('type') === 'folder') {
              overFolder = $(this);
            }
            return false;
          }
        });
      }

      // 高亮文件夹
      $grid.find('.ax-app[data-type="folder"] .ax-app-ico').css({ 'border': '', 'transform': '', 'background': '' });
      if (overFolder) {
        overFolder.find('.ax-app-ico').css({
          'border': '2px dashed ' + _t().accent,
          'transform': 'scale(1.1)',
          'background': 'rgba(' + _t().accentRgb + ',.2)'
        });
        return;
      }

      // 普通排序
      els.each(function () {
        const r = this.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        if (Math.abs(x - cx) < r.width / 2 && Math.abs(y - cy) < r.height / 2) {
          const $target = $(this);
          const srcDomIdx = dragEl.index();
          const tgtDomIdx = $target.index();
          if (srcDomIdx < tgtDomIdx) $target.after(dragEl);
          else $target.before(dragEl);
        }
      });
    }

    function handleDragEnd(x, y) {
      if (!dragEl) { _cleanupDrag(); return; }

      const dragType = dragEl.data('type');
      let didPutInFolder = false;

      // 检查是否松手在文件夹上方
      if (dragType === 'app' && x !== undefined && y !== undefined) {
        const els = $grid.find('.ax-app').not(dragEl);
        let dropFolder = null;
        els.each(function () {
          const r = this.getBoundingClientRect();
          if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
            if ($(this).data('type') === 'folder') {
              dropFolder = $(this);
            }
            return false;
          }
        });

        if (dropFolder) {
          const appId = dragEl.data('app');
          const folderOrigIdx = parseInt(dropFolder.data('order-idx'));

          if (appId && !isNaN(folderOrigIdx)) {
            const currentOrder = _getOrderedApps();
            const folderObj = currentOrder[folderOrigIdx];

            if (folderObj && folderObj.type === 'folder') {
              // 先重建当前排列
              const rebuiltOrder = [];
              const used = new Set();
              $grid.find('.ax-app').each(function () {
                const oi = parseInt($(this).data('order-idx'));
                if (!isNaN(oi) && currentOrder[oi] && !used.has(oi)) {
                  rebuiltOrder.push(currentOrder[oi]);
                  used.add(oi);
                }
              });
              for (let i = 0; i < currentOrder.length; i++) {
                if (!used.has(i)) rebuiltOrder.push(currentOrder[i]);
              }

              // 移除被拖动的APP
              const appItemIdx = rebuiltOrder.findIndex(item => item.type === 'app' && item.id === appId);
              if (appItemIdx !== -1) {
                rebuiltOrder.splice(appItemIdx, 1);
              }

              // 添加到文件夹
              if (!folderObj.apps.includes(appId)) {
                folderObj.apps.push(appId);
              }

              _saveAppOrder(rebuiltOrder);
              didPutInFolder = true;
            }
          }
        }
      }

      // 先清理拖拽元素（确保ghostEl被移除）
      _cleanupDrag();

      if (didPutInFolder) {
        // 重绘桌面，但保持编辑模式
        _drawHome($('#ax-screen'));
        // 重绘后需要重新绑定编辑模式的事件
        setTimeout(() => {
          const $newS = $('#ax-screen');
          // 不调用 _toggleAppEditMode（那会切换状态），直接调用 _enterEditMode
          _enterEditMode($newS);
        }, 50);
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success APP已放入文件夹');
      } else {
        // 普通排序保存
        _rebuildAndSave();
      }
    }

    // 清除旧事件绑定
    $grid.find('.ax-app').off('touchstart.edit pointerdown.edit');
    $grid.off('touchmove.edit touchend.edit touchcancel.edit');

    // ── 触摸拖拽 ──
    let lastTouchX = 0, lastTouchY = 0;
    $grid.find('.ax-app').on('touchstart.edit', function (e) {
      e.preventDefault();
      dragEl = $(this);
      dragEl.css('opacity', '.3');
      const tc = e.touches[0];
      lastTouchX = tc.clientX;
      lastTouchY = tc.clientY;
      ghostEl = $('<div style="position:fixed;z-index:200000;pointer-events:none;font-size:22px;background:' + _t().bgCard + ';border:1px solid ' + _t().primary + ';border-radius:14px;padding:8px 12px;box-shadow:0 4px 16px rgba(0,0,0,.4);opacity:.9">' + $(this).find('.ax-app-ico').text() + '</div>');
      $('body').append(ghostEl);
      ghostEl.css({ left: tc.clientX + 'px', top: (tc.clientY - 20) + 'px' });
    });

    $grid.on('touchmove.edit', function (e) {
      if (!dragEl || !ghostEl) return;
      e.preventDefault();
      const tc = e.touches[0];
      lastTouchX = tc.clientX;
      lastTouchY = tc.clientY;
      handleDragMove(tc.clientX, tc.clientY);
    });

    $grid.on('touchend.edit touchcancel.edit', function () {
      handleDragEnd(lastTouchX, lastTouchY);
    });

    // ── 鼠标拖拽 ──
    $grid.find('.ax-app').on('pointerdown.edit', function (e) {
      if (e.originalEvent.pointerType !== 'mouse' || e.originalEvent.button !== 0) return;
      e.preventDefault();
      dragEl = $(this);
      dragEl.css('opacity', '.3');
      ghostEl = $('<div style="position:fixed;z-index:200000;pointer-events:none;font-size:22px;background:' + _t().bgCard + ';border:1px solid ' + _t().primary + ';border-radius:14px;padding:8px 12px;box-shadow:0 4px 16px rgba(0,0,0,.4);opacity:.9">' + $(this).find('.ax-app-ico').text() + '</div>');
      $('body').append(ghostEl);
      ghostEl.css({ left: e.clientX + 'px', top: (e.clientY - 20) + 'px' });

      let lastMouseX = e.clientX, lastMouseY = e.clientY;
      function onMove(ev) {
        lastMouseX = ev.clientX;
        lastMouseY = ev.clientY;
        handleDragMove(ev.clientX, ev.clientY);
      }
      function onUp() {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        handleDragEnd(lastMouseX, lastMouseY);
      }
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });

    // 首次进入时提示（只在第一次手动点击时提示，重绘后不重复提示）
    if (!$s.data('edit-hint-shown')) {
      $s.data('edit-hint-shown', true);
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=info 编辑模式：拖动排序，拖APP到文件夹上松手放入，点"📁 新建文件夹"创建文件夹');
    }
  }

  function _createNewFolder($s) {
    const t = _t();
    const w = _dialog(
      '<div class="ax-dlg-h">📁 新建文件夹</div>' +
      '<div class="ax-dlg-sub">创建一个空文件夹，然后在编辑模式下把APP拖进去</div>' +
      '<div class="ax-api-form">' +
      '<label>文件夹名称</label>' +
      '<input id="ax-nf-name" type="text" placeholder="如：工具、社交" maxlength="8" value="文件夹">' +
      '</div>' +
      '<div class="ax-dlg-err" id="ax-nf-err"></div>' +
      '<div class="ax-dlg-actions">' +
      '<button class="ax-dlg-btn ax-dlg-cancel" id="ax-nf-no">取消</button>' +
      '<button class="ax-dlg-btn ax-dlg-ok" id="ax-nf-yes">创建</button>' +
      '</div>'
    );
    $('#ax-nf-name').focus().select();
    $('#ax-nf-no').on('click', () => w.remove());
    $('#ax-nf-yes').on('click', () => {
      const name = $('#ax-nf-name').val().trim() || '文件夹';
      const currentOrder = _getOrderedApps();
      // 在末尾添加一个空文件夹
      currentOrder.push({ type: 'folder', name: name, icon: '📁', apps: [] });
      _saveAppOrder(currentOrder);
      w.remove();
      _appEditMode = false; // 退出编辑模式让它重绘
      _drawHome($('#ax-screen'));
      // 自动进入编辑模式方便用户拖APP进去
      setTimeout(() => {
        const $newS = $('#ax-screen');
        _toggleAppEditMode($newS);
      }, 100);
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 文件夹已创建！现在拖动APP到文件夹上松手即可放入');
    });
  }

  function _drawHome($s) {
    const t = _t(), gt = _getGameTimeFull();
    const wpUrl = _getWallpaper();
    const wpStyle = wpUrl ? `background-image:url('${wpUrl}');background-size:cover;background-position:center;` : `background:${t.wallpaper},${t.bg};`;
    const totalUnread = _getTotalUnread();
    const orderedItems = _getOrderedApps();

    if (_openFolder !== null) {
      _drawFolderView($s, orderedItems);
      return;
    }

    let o = `<div class="ax-home" style="${wpStyle}">`;

    // 右上角按钮区
    o += '<div style="display:flex;justify-content:flex-end;gap:4px;padding:4px 0">';
    o += `<button class="ax-api-btn" id="ax-home-new-folder" style="font-size:8px;padding:3px 10px;opacity:.6;transition:opacity .2s;display:none">📁 新建文件夹</button>`;
    o += `<button class="ax-api-btn" id="ax-home-edit-btn" style="font-size:8px;padding:3px 10px;opacity:.6;transition:opacity .2s">✎ 排列</button>`;
    o += '</div>';

    o += '<div class="ax-home-header">';
    o += '<span class="ax-home-time-icon">🕐</span>';
    o += `<span class="ax-home-time">${gt}</span>`;
    o += '</div>';
    o += '<div class="ax-app-grid" id="ax-app-grid-main">';

    for (let idx = 0; idx < orderedItems.length; idx++) {
      const item = orderedItems[idx];
      if (item.type === 'app') {
        const app = _getAppInfo(item.id);
        let appBadge = '';
        if (app.id === 'chat' && totalUnread > 0) appBadge = `<span class="ax-app-badge">${totalUnread > 99 ? '99+' : totalUnread}</span>`;
        o += `<div class="ax-app" data-app="${app.id}" data-type="app" data-order-idx="${idx}"><div class="ax-app-ico">${app.icon}</div><div class="ax-app-lbl">${app.label}</div>${appBadge}</div>`;
      } else if (item.type === 'folder') {
        const folderApps = (item.apps || []).map(id => _getAppInfo(id));
        const folderName = item.name || '文件夹';
        let folderBadge = '';
        if (item.apps && item.apps.includes('chat') && totalUnread > 0) folderBadge = `<span class="ax-app-badge">${totalUnread > 99 ? '99+' : totalUnread}</span>`;

        o += `<div class="ax-app" data-type="folder" data-order-idx="${idx}" data-folder-name="${_esc(folderName)}">`;
        o += `<div class="ax-app-ico" style="display:grid;grid-template-columns:1fr 1fr;gap:1px;padding:6px;font-size:11px;line-height:1">`;
        for (let fi = 0; fi < 4; fi++) {
          if (folderApps[fi]) {
            o += `<span style="text-align:center">${folderApps[fi].icon}</span>`;
          } else {
            o += `<span></span>`;
          }
        }
        o += `</div>`;
        o += `<div class="ax-app-lbl">${_esc(folderName)}</div>${folderBadge}</div>`;
      }
    }
    o += '</div></div>';
    $s.html(o);

    // 正常点击
    $s.find('.ax-app').on('click', function () {
      if (_appEditMode) return;
      const type = $(this).data('type');
      if (type === 'folder') {
        const idx = parseInt($(this).data('order-idx'));
        _openFolder = idx;
        _drawHome($s);
      } else {
        _screen = $(this).data('app'); _skillNpc = null; _chatTarget = null; _render();
      }
    });

    // 编辑按钮
    $s.find('#ax-home-edit-btn').on('click', function (e) {
      e.stopPropagation();
      _toggleAppEditMode($s);
    });

    // 新建文件夹按钮
    $s.find('#ax-home-new-folder').on('click', function (e) {
      e.stopPropagation();
      _createNewFolder($s);
    });
  }

  // 文件夹内部视图
  function _drawFolderView($s, orderedItems) {
    const t = _t();
    const wpUrl = _getWallpaper();
    const wpStyle = wpUrl ? `background-image:url('${wpUrl}');background-size:cover;background-position:center;` : `background:${t.wallpaper},${t.bg};`;
    const totalUnread = _getTotalUnread();

    const folderItem = orderedItems[_openFolder];
    if (!folderItem || folderItem.type !== 'folder') {
      _openFolder = null;
      _drawHome($s);
      return;
    }

    const folderApps = (folderItem.apps || []).map(id => _getAppInfo(id));
    const folderName = folderItem.name || '文件夹';

    let o = `<div class="ax-home" style="${wpStyle}">`;

    // 头部：返回按钮 + 文件夹名
    o += `<div style="display:flex;align-items:center;gap:8px;padding:8px 4px">`;
    o += `<span id="ax-folder-back" style="cursor:pointer;font-size:18px;color:${t.primary};padding:0 4px;transition:transform .15s">‹</span>`;
    o += `<span style="font-size:12px;font-weight:600;color:${t.text}">${_esc(folderName)}</span>`;
    o += `<span style="font-size:8px;color:${t.textMuted};margin-left:auto">${folderApps.length} 个应用</span>`;
    o += `<button class="ax-api-btn" id="ax-folder-rename" style="font-size:8px;padding:2px 8px">改名</button>`;
    o += `<button class="ax-api-btn" id="ax-folder-dissolve" style="font-size:8px;padding:2px 8px">解散</button>`;
    o += `</div>`;

    // 文件夹内的APP网格
    o += '<div class="ax-app-grid" id="ax-folder-grid">';
    for (let fi = 0; fi < folderApps.length; fi++) {
      const app = folderApps[fi];
      let appBadge = '';
      if (app.id === 'chat' && totalUnread > 0) appBadge = `<span class="ax-app-badge">${totalUnread > 99 ? '99+' : totalUnread}</span>`;
      o += `<div class="ax-app" data-app="${app.id}" data-fi="${fi}" data-type="app"><div class="ax-app-ico">${app.icon}</div><div class="ax-app-lbl">${app.label}</div>${appBadge}</div>`;
    }
    o += '</div>';

    // 拖出提示
    o += `<div style="text-align:center;padding:12px;font-size:8px;color:${t.textMuted};font-style:italic">长按拖出APP到桌面</div>`;

    o += '</div>';
    $s.html(o);

    // 点击APP打开（记住来源文件夹）
    $s.find('.ax-app[data-type="app"]').on('click', function () {
      _screen = $(this).data('app');
      _skillNpc = null;
      _chatTarget = null;
      _returnToFolder = _openFolder; // 记住从哪个文件夹进来的
      _openFolder = null;
      _render();
    });

    // 返回桌面
    $s.find('#ax-folder-back').on('click', () => {
      _openFolder = null;
      _drawHome($s);
    });

    // 重命名文件夹
    $s.find('#ax-folder-rename').on('click', () => {
      const currentOrder = _getOrderedApps();
      const folder = currentOrder[_openFolder];
      if (!folder || folder.type !== 'folder') return;
      const w = _dialog(`<div class="ax-dlg-h">✎ 重命名文件夹</div><input class="ax-dlg-input" id="ax-fr-name" type="text" value="${_esc(folder.name || '文件夹')}" maxlength="8" placeholder="文件夹名称"><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-fr-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-fr-yes">确认</button></div>`);
      $('#ax-fr-name').focus().select();
      $('#ax-fr-no').on('click', () => w.remove());
      $('#ax-fr-yes').on('click', () => {
        const v = $('#ax-fr-name').val().trim() || '文件夹';
        folder.name = v;
        _saveAppOrder(currentOrder);
        w.remove();
        _drawHome($s);
      });
    });

    // 解散文件夹
    $s.find('#ax-folder-dissolve').on('click', () => {
      const currentOrder = _getOrderedApps();
      const folder = currentOrder[_openFolder];
      if (!folder || folder.type !== 'folder') return;
      const w = _dialog(`<div class="ax-dlg-h">解散文件夹</div><div class="ax-dlg-sub">将"${_esc(folder.name || '文件夹')}"中的所有APP放回桌面？</div><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-fd-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-fd-yes">确认</button></div>`);
      $('#ax-fd-no').on('click', () => w.remove());
      $('#ax-fd-yes').on('click', () => {
        // 把文件夹里的app全部散回桌面
        const apps = folder.apps || [];
        const insertItems = apps.map(id => ({ type: 'app', id }));
        currentOrder.splice(_openFolder, 1, ...insertItems);
        _saveAppOrder(currentOrder);
        _openFolder = null;
        w.remove();
        _drawHome($s);
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 文件夹已解散');
      });
    });

    // 长按拖出APP到桌面
    _wireFolderDragOut($s);
  }

  // 文件夹内长按拖出
  function _wireFolderDragOut($s) {
    const $grid = $s.find('#ax-folder-grid');
    if (!$grid.length) return;
    let holdTimer = null;
    let dragEl = null;
    let ghostEl = null;

    $grid.find('.ax-app').on('touchstart', function (e) {
      const $el = $(this);
      const tc = e.touches[0];
      holdTimer = setTimeout(() => {
        dragEl = $el;
        $el.css('opacity', '.3');
        ghostEl = $('<div style="position:fixed;z-index:200000;pointer-events:none;font-size:22px;background:' + _t().bgCard + ';border:1px solid ' + _t().primary + ';border-radius:14px;padding:8px 12px;box-shadow:0 4px 16px rgba(0,0,0,.4);opacity:.9">' + $el.find('.ax-app-ico').text() + ' 拖到桌面</div>');
        $('body').append(ghostEl);
        ghostEl.css({ left: tc.clientX + 'px', top: (tc.clientY - 20) + 'px' });
      }, 400);
    });

    $grid.on('touchmove', function (e) {
      if (!dragEl || !ghostEl) {
        if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
        return;
      }
      e.preventDefault();
      const tc = e.touches[0];
      ghostEl.css({ left: tc.clientX + 'px', top: (tc.clientY - 20) + 'px' });
    });

    $grid.on('touchend touchcancel', function () {
      if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
      if (dragEl && ghostEl) {
        const appId = dragEl.data('app');
        // 执行拖出
        const currentOrder = _getOrderedApps();
        const folder = currentOrder[_openFolder];
        if (folder && folder.type === 'folder' && folder.apps) {
          folder.apps = folder.apps.filter(id => id !== appId);
          // 在文件夹后面插入这个app
          const insertIdx = _openFolder + 1;
          currentOrder.splice(insertIdx, 0, { type: 'app', id: appId });
          // 如果文件夹只剩0或1个app，解散
          if (folder.apps.length <= 1) {
            if (folder.apps.length === 1) {
              const lastId = folder.apps[0];
              currentOrder.splice(_openFolder, 1, { type: 'app', id: lastId });
            } else {
              currentOrder.splice(_openFolder, 1);
            }
            _openFolder = null;
          }
          _saveAppOrder(currentOrder);
          if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success APP已拖出到桌面');
          _drawHome($('#ax-screen'));
        }
        dragEl.css('opacity', '1');
        ghostEl.remove();
      }
      dragEl = null;
      ghostEl = null;
    });
  }

  function _drawAppView($s, appId) {
    const app = G.apps.find(a => a.id === appId);
    const label = app ? `${app.icon} ${app.label}` : appId;
    // 聊天模块：对话模式 或 列表模式（带底部分栏）
    if (appId === 'chat') {
      if (_chatTarget) {
        // 在对话中：显示对话界面
        $s.html('<div class="ax-app-view" id="ax-chat-app-view"></div>');
        _drawChatConversation($('#ax-chat-app-view'));
      } else {
        // 消息主界面（带底部分栏）
        _drawChatMainView($s);
      }
      return;
    }
    $s.html(`<div class="ax-app-view"><div class="ax-av-header"><span class="ax-av-back" id="ax-go-home">‹</span><span class="ax-av-title">${label}</span></div><div class="ax-av-body" id="ax-av-body"></div></div>`);
    const $body = $('#ax-av-body');
    if (appId === 'theme') { _drawTheme($body) }
    else if (appId === 'chat') { _drawChatList($body) }
    else if (appId === 'apiMgr') { _drawApiManager($body) }
    else if (appId === 'radio') { _drawRadio($('#ax-av-body')) }
    else if (appId === 'forum') { _drawForum($('#ax-av-body')) }
    else if (appId === 'notes') { _drawNotes($('#ax-av-body')) }
    else if (appId === 'album') { _drawAlbum($('#ax-av-body')) }
    else if (appId === 'map') { _drawMap($('#ax-av-body')) }
    else if (appId === 'shop') { _drawShop($('#ax-av-body')) }
    else if (appId === 'minigame') { _drawMinigame($('#ax-av-body')) }
    else if (appId === 'broadcast') { _drawBroadcast($('#ax-av-body')) }
    else { const d = _load(); if (!d) { $body.html('<div class="ax-nil">⛧ 灵魂链接中断 ⛧</div>') } else { const fn = { creature: _drawCreatures, bag: _drawBag, party: _drawParty, skills: _drawSkills, dungeon: _drawDungeons, overview: _drawOverview, fallen: _drawFallen, npcrel: _drawNpcRelations }; (fn[appId] || (() => $body.html('<div class="ax-nil">未知区域</div>')))($body, d) } }
    $('#ax-go-home').on('click', () => {
      _screen = 'home'; _skillNpc = null; _chatTarget = null; _forumCurrentPost = null;
      // 如果是从文件夹进入的APP，返回时回到文件夹
      if (_returnToFolder !== null) {
        _openFolder = _returnToFolder;
        _returnToFolder = null;
      }
      _render();
    });
  }

  /* ═══════════════════════════════════════
     💬 消息主界面（带底部分栏）
     ═══════════════════════════════════════ */
  let _chatSubTab = 'messages'; // 'messages' | 'profile'

  function _drawChatMainView($s) {
    // ★ 群聊全屏渲染：在构建任何HTML之前拦截
    if (_currentGroupId) {
      $s.html('<div class="ax-app-view" style="display:flex;flex-direction:column;height:100%"><div id="ax-grp-full-body" style="flex:1;overflow:hidden;display:flex;flex-direction:column"></div></div>');
      _drawGroupConversation($('#ax-grp-full-body'));return; // ★ 直接return，不渲染社交头部和底部Tab
    }

    const t = _t();
    const pendingCount = _getPendingRequestCount();
    const totalUnread = _getTotalUnread() + _getTotalGroupUnread();

    let o = '<div class="ax-app-view" style="display:flex;flex-direction:column;height:100%">';

    // 头部
    o += '<div class="ax-av-header">';
    o += '<span class="ax-av-back" id="ax-go-home">‹</span>';
    o += '<span class="ax-av-title">💬 社交</span>';
    // 右侧操作按钮（已简化）
    o += '<div style="margin-left:auto"></div>';
    o += '</div>';

    // 内容区域
    o += '<div class="ax-av-body" id="ax-chat-main-body" style="flex:1;overflow-y:auto"></div>';

    // 底部分栏（消息、动态、好友、个人资料）
    o += '<div class="ax-msg-tabs">';
    o += `<div class="ax-msg-tab${_chatSubTab === 'messages' ? ' on' : ''}" data-subtab="messages">`;
    o += '<span class="ax-msg-tab-icon">💬</span>消息';
    if (totalUnread > 0) o += `<span class="ax-msg-tab-badge">${totalUnread > 99 ? '99+' : totalUnread}</span>`;
    o += '</div>';
    o += `<div class="ax-msg-tab${_chatSubTab === 'moments' ? ' on' : ''}" data-subtab="moments">`;
    o += '<span class="ax-msg-tab-icon">📱</span>动态';
    o += '</div>';
    o += `<div class="ax-msg-tab${_chatSubTab === 'friends' ? ' on' : ''}" data-subtab="friends">`;
    o += '<span class="ax-msg-tab-icon">👥</span>好友';
    if (pendingCount > 0) o += `<span class="ax-msg-tab-badge">${pendingCount}</span>`;
    o += '</div>';
    o += `<div class="ax-msg-tab${_chatSubTab === 'profile' ? ' on' : ''}" data-subtab="profile">`;
    o += '<span class="ax-msg-tab-icon">👤</span>我的';
    o += '</div>'; o += '</div>';
    o += '</div>';
    $s.html(o);


    // 渲染当前子页面
    const $body = $('#ax-chat-main-body');
    if (_chatSubTab === 'messages') {
      _drawChatList($body);
    } else if (_chatSubTab === 'moments') {
      _drawMoments($body);
    } else if (_chatSubTab === 'friends') {
      _drawFriendRequests($body);
    } else if (_chatSubTab === 'profile') {
      _drawPlayerProfile($body);
    }

    // 事件绑定
    $('#ax-go-home').on('click', () => {
      _screen = 'home'; _chatSubTab = 'messages';
      if (_returnToFolder !== null) {
        _openFolder = _returnToFolder;
        _returnToFolder = null;
      }
      _render();
    });
    $s.find('[data-subtab]').on('click', function () {
      _chatSubTab = $(this).data('subtab');
      _drawChatMainView($s);
    });
  }

  /* ═══════════════════════════════════════📱 朋友圈/动态墙页面
        ═══════════════════════════════════════ */
  function _drawMoments($c) {
    const t = _t();
    const moments = _loadMoments();
    const hasApi = !!_getAuxApi();
    const playerName = _getPlayerName();

    let o = '';

    // 操作按钮
    o += '<div style="display:flex;gap:4px;margin-bottom:8px">';
    o += `<button class="ax-dlg-btn ax-dlg-ok" id="ax-mom-gen" style="flex:1;text-align:center;font-size:9px" ${hasApi ? '' : 'disabled'}>✨刷新NPC动态</button>`;
    o += `<button class="ax-dlg-btn ax-dlg-cancel" id="ax-mom-npc-comment" style="flex-shrink:0;font-size:9px" ${hasApi ? '' : 'disabled'}>💬 求评论</button>`;
    o += `<button class="ax-dlg-btn ax-dlg-cancel" id="ax-mom-post" style="flex-shrink:0;font-size:9px">✏️ 发动态</button>`;
    o += '</div>';

    // 动态列表
    if (!moments.length) {
      o += `<div style="text-align:center;padding:30px;color:${t.textMuted};font-size:10px;font-style:italic">朋友圈还空空如也<br>点击上方按钮刷新NPC动态吧</div>`;
    } else {
      for (let mi = 0; mi < moments.length; mi++) {
        const m = moments[mi];
        const isMyPost = !m.author || m.author === playerName;
        const avatarUrl = isMyPost ? _getPlayerAvatar() : _getNpcAvatar(m.author);
        const emoji = isMyPost ? '👤' : _getNpcEmoji(m.author);
        const avatarStyle = avatarUrl ? `background-image:url('${avatarUrl}');background-size:cover;background-position:center` : '';
        const avatarContent = avatarUrl ? '' : emoji;
        const moodData = isMyPost ? null : _getNpcMood(m.author);
        const moodIcon = moodData ? _getMoodIcon(moodData.mood) : '';

        o += '<div class="ax-moment-card">';

        // 头部
        o += '<div class="ax-moment-header">';
        o += `<div class="ax-moment-avatar" style="${avatarStyle}">${avatarContent}</div>`;
        o += `<span class="ax-moment-author">${_esc(m.author || playerName)} ${moodIcon}</span>`;
        o += `<span class="ax-moment-time">${_formatTimeAgo(m.ts)}</span>`;
        o += '</div>';

        // 内容
        o += `<div class="ax-moment-content">${_esc(m.content)}</div>`;

        // 配图描述（如果有）
        if (m.imageDesc) {
          o += `<div style="padding:8px;background:${t.surfaceActive};border-radius:8px;margin-bottom:6px;font-size:8px;color:${t.textMuted};font-style:italic">📷 ${_esc(m.imageDesc)}</div>`;
        }

        // 点赞列表
        if (m.likes && m.likes.length) {
          o += `<div class="ax-moment-likes">❤️ ${m.likes.map(l => _esc(l)).join('、')}</div>`;
        }

        // 评论列表
        if (m.comments && m.comments.length) {
          o += '<div class="ax-moment-comments">';
          for (let ci = 0; ci < m.comments.length; ci++) {
            const c = m.comments[ci];
            o += `<div class="ax-moment-comment"><span class="ax-moment-comment-author">${_esc(c.author)}</span>：${_esc(c.content)}<span class="ax-moment-comment-del ax-mom-del-comment" data-mom-id="${m.id}" data-ci="${ci}" title="删除">✕</span></div>`;
          }
          o += '</div>';
        }

        // 操作栏
        const isLiked = m.likes && m.likes.includes(playerName);
        o += '<div class="ax-moment-actions">';
        o += `<span class="ax-moment-action${isLiked ? ' liked' : ''} ax-mom-like" data-mom-id="${m.id}">❤️ ${isLiked ? '已赞' : '赞'} ${m.likes ? m.likes.length : 0}</span>`;
        o += `<span class="ax-moment-action ax-mom-comment-btn" data-mom-id="${m.id}">💬 评论 ${m.comments ? m.comments.length : 0}</span>`;
        if (isMyPost) o += `<span class="ax-moment-action ax-mom-delete" data-mom-id="${m.id}" style="margin-left:auto;color:${t.textMuted}">🗑️ 删除</span>`;
        o += '</div>';

        // 评论输入框（默认隐藏）
        o += `<div class="ax-moment-input-row" id="ax-mom-input-${m.id}" style="display:none">`;
        o += `<input class="ax-moment-input" id="ax-mom-input-text-${m.id}" type="text" placeholder="写一条评论…" maxlength="100">`;
        o += `<button class="ax-moment-send-btn ax-mom-send-comment" data-mom-id="${m.id}">发送</button>`;
        o += '</div>';

        o += '</div>';
      }
    }

    // 清空按钮
    if (moments.length) {
      o += `<div style="text-align:center;margin-top:8px"><button class="ax-api-btn danger" id="ax-mom-clear" style="font-size:8px">清空所有动态</button></div>`;
    }

    $c.html(o);

    // 事件绑定
    //刷新NPC动态
    $c.find('#ax-mom-gen').on('click', () => _generateMoments($c));

    // 手动触发NPC评论我的动态
    $c.find('#ax-mom-npc-comment').on('click', async function () {
      const $btn = $(this);
      const api = _getAuxApi();
      if (!api) { if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning请先配置API'); return; }
      const myMoments = _loadMoments().filter(m => m.author === playerName);
      if (!myMoments.length) { if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 你还没有发过动态'); return; }
      const latestMom = myMoments[0];
      $btn.prop('disabled', true).text('评论中…');
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=info NPC正在评论你的动态…');

      // ★ 直接内联评论逻辑，不依赖可能有问题的_npcCommentOnUserMoment
      try {
        // 收集所有可评论的NPC
        const npcSet2 = new Set();
        CORE_NPC_LIST.forEach(n => { if (n && !_isBlocked(n)) npcSet2.add(n); });
        _getFriendList().forEach(f => { if (f && f.name && !_isBlocked(f.name)) npcSet2.add(f.name); });
        const d2 = _load();
        if (d2 && d2['NPC关系']) {
          Object.keys(d2['NPC关系']).forEach(k => { if (k && !_skip(k) && !_isBlocked(k)) npcSet2.add(k); });
        }
        const candidates = Array.from(npcSet2).filter(n => n && typeof n === 'string' && n.trim().length > 0 && n !== playerName);

        if (!candidates.length) {
          if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 没有可评论的NPC');
          $btn.prop('disabled', false).text('💬 求评论');
          return;
        }

        // 随机选1-3个NPC
        const shuffled = [...candidates].sort(() =>0.5 - Math.random());
        const commenters = shuffled.slice(0, Math.min(3, shuffled.length));

        const npcInfoStr = commenters.map(n => `${n}：${_getNpcPersonality(n).personality.slice(0, 40)}`).join('\n');

        const msgs2 = [
          {
            role: 'system',
            content: `你是一个朋友圈评论生成器。以下${commenters.length}个人要评论好友"${playerName}"的朋友圈动态。

评论者和性格：
${npcInfoStr}

动态内容：
"${latestMom.content}"

请为每个评论者生成一条朋友圈评论。

重要要求：
1. 每条评论10-30字，像真人刷朋友圈随手写的评论
2. 用口语、网络用语，不要文言文
3. 可以用emoji
4. 风格参考："哈哈哈笑死" / "6" / "老哥牛" / "这也太离谱了" / "顶顶顶"
5. 你必须为每个评论者都生成一条评论
6. 严格按JSON数组格式输出：[{"name":"评论者名字","comment":"评论内容"}]
7. 不要输出任何其他文字，只输出JSON数组

示例输出：
[{"name":"周黑鸭","comment":"哈哈哈 这也太离谱了吧 🤣"},{"name":"陆沉霄","comment":"注意安全"}]`
          },
          { role: 'user', content: `请为这${commenters.length}个人分别生成朋友圈评论` }
        ];

        const reply = await _callAuxApi(msgs2, { temperature: 0.95, max_tokens: 1000 });
        const comments = _safeParseJsonArray(reply);
        let addedCount = 0;
        for (const cm of comments) {
          if (!cm.name || !cm.comment) continue;
          if (!candidates.includes(cm.name)) continue;
          _addMomentComment(latestMom.id, cm.name, String(cm.comment).trim().slice(0, 100));
          addedCount++;
        }
        if (addedCount > 0) {
          if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success ${addedCount}条NPC评论已添加！`);
        } else {
          if (typeof triggerSlash === 'function') triggerSlash('/echo severity=info 没有生成评论，请重试');
        }
      } catch (e) {
        console.warn('[Abyss]手动NPC评论失败:', e);
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=error 评论失败：' + (e.message || ''));
      }

      $btn.prop('disabled', false).text('💬 求评论');
      //刷新动态页面
      const $fc = $('#ax-chat-main-body');
      if ($fc.length && _chatSubTab === 'moments') _drawMoments($fc);
    });


    // 用户发动态
    $c.find('#ax-mom-post').on('click', () => {
      const w = _dialog(
        `<div class="ax-dlg-h">✏️ 发一条动态</div>` +
        `<div class="ax-api-form">` +
        `<label>动态内容</label>` +
        `<textarea id="ax-mom-post-text" placeholder="说点什么…" style="min-height:60px;max-height:120px;resize:vertical"></textarea>` +
        `</div>` +
        `<div class="ax-dlg-err" id="ax-mom-err"></div>` +
        `<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-mp-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-mp-yes">发布</button></div>`
      );
      $('#ax-mp-no').on('click', () => w.remove());
      $('#ax-mp-yes').on('click', () => {
        const text = $('#ax-mom-post-text').val().trim();
        if (!text) { $('#ax-mom-err').text('内容不能为空'); return; }

        const moment = _addMoment({ author: playerName, content: text });
        w.remove();
        _drawMoments($c);
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success动态已发布');

        // ★ 触发NPC评论（使用动态获取的$c避免DOM失效）
        if (_getAuxApi()) {
          const momId = moment.id;
          setTimeout(() => {
            const $freshC = $('#ax-chat-main-body');
            _npcCommentOnUserMoment(momId, $freshC).catch(e => console.warn('[Abyss] NPC comment failed', e));
          }, Math.random() * 5000 + 3000);
        }
      });
    });

    // 点赞
    $c.find('.ax-mom-like').on('click', function () {
      const momId = $(this).data('mom-id');
      _toggleMomentLike(momId, playerName);
      _drawMoments($c);
    });

    // 显示/隐藏评论框
    $c.find('.ax-mom-comment-btn').on('click', function () {
      const momId = $(this).data('mom-id');
      const $input = $(`#ax-mom-input-${momId}`);
      $input.toggle();
      if ($input.is(':visible')) $input.find('input').focus();
    });

    // 发送评论
    $c.find('.ax-mom-send-comment').on('click', function () {
      const momId = $(this).data('mom-id');
      const $input = $(`#ax-mom-input-text-${momId}`);
      const text = $input.val().trim();
      if (!text) return;
      _addMomentComment(momId, playerName, text);

      // AI自动回复评论（如果评论的是NPC的动态）
      const moments = _loadMoments();
      const mom = moments.find(m => m.id === momId);
      if (mom && mom.author !== playerName && _getAuxApi()) {
        _npcReplyToComment(mom.author, momId, text, $c).catch(() => { });
      }

      _drawMoments($c);
    });

    // 删除评论
    $c.find('.ax-mom-del-comment').on('click', function () {
      const momId = $(this).data('mom-id');
      const ci = parseInt($(this).data('ci'));
      _deleteMomentComment(momId, ci);
      _drawMoments($c);
    });

    // 删除动态
    $c.find('.ax-mom-delete').on('click', function () {
      const momId = $(this).data('mom-id');
      _deleteMoment(momId);
      _drawMoments($c);
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 动态已删除');
    });

    // 清空所有动态
    $c.find('#ax-mom-clear').on('click', () => {
      const w = _dialog(`<div class="ax-dlg-h">清空所有动态</div><div class="ax-dlg-sub">确定清空朋友圈？</div><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-mc-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-mc-yes" style="color:${t.fail}">清空</button></div>`);
      $('#ax-mc-no').on('click', () => w.remove());
      $('#ax-mc-yes').on('click', () => {
        _saveMoments([]);
        w.remove();
        _drawMoments($c);
      });
    });
  }

  // AI生成NPC朋友圈动态
  async function _generateMoments($c) {
    const api = _getAuxApi();
    if (!api) {
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 请先配置API接口');
      return;
    }

    if (typeof triggerSlash === 'function') triggerSlash('/echo severity=info 正在生成NPC动态…');

    const context = _getContextSummary();
    const d = _load();

    // 收集所有已知NPC
    const npcSet = new Set();
    CORE_NPC_LIST.forEach(n => { if (!_isBlocked(n)) npcSet.add(n); });
    _getFriendList().forEach(f => { if (f.name && !_isBlocked(f.name)) npcSet.add(f.name); });
    if (d && d['NPC关系']) {
      Object.keys(d['NPC关系']).forEach(k => { if (!_skip(k) && !_isBlocked(k)) npcSet.add(k); });
    }
    const npcNames = Array.from(npcSet).filter(n => n && typeof n === 'string' && n.trim());

    if (!npcNames.length) {
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=info 没有可生成动态的NPC');
      return;
    }

    // 获取NPC性别信息
    const npcInfoList = npcNames.map(n => {
      const p = _getNpcPersonality(n);
      const gender = p.voiceGender === 'female' ? '女性' : '男性';
      return `${n}（性别：${gender}，性格：${p.personality.slice(0, 60)}）`;
    }).join('\n');

    const existingContents = _loadMoments().slice(0, 5).map(m => m.content.slice(0, 30)).join('、');

    try {
      const msgs = [
        {
          role: 'system',
          content: `你是一个社交媒体内容生成器。请为以下NPC们生成3-5条"朋友圈"动态。

NPC列表：
${npcInfoList}

当前世界信息和最近剧情（特别注意标注了"★最新"的部分）：
${context.slice(0, 4000)}

已有动态（不要重复）：${existingContents || '无'}

重要规则：
1. 严格按照每个NPC标注的性别使用正确的人称和语气
2. 男性NPC不要使用女性化的语气词
3. NPC之间的互动仅限于友情、战友情等非恋爱关系
4. 每条动态由不同的NPC发出
5. ★★★最重要：像真人发朋友圈/微博一样写！用口语、网络用语、缩写。绝对不要用书面语、成语、文言文腔调★★★
6. 可以是：吐槽日常、晒战利品、发牢骚、搞笑日常、分享见闻、求组队
7. 每条50-150字，大量使用emoji
8. 如果最近有重要剧情，动态内容应该反映这些事件
9. 风格参考（不要照抄，只参考语气）：
   - "卧槽今天副本差点没出来 腿都软了😭谁懂啊"
   - "食堂的饭今天居然能吃了？？？不敢相信"
   - "刚在黑市淘了个好东西嘿嘿🤫不告诉你们"
   - "有没有人一起打副本 我一个人怕😰在线等 急"
   - "深渊的月亮今晚好圆 突然有点想家了🌙"
10. 配图描述（可选）：用一句话描述配图内容，如果这条动态没有配图则留空
11. 严格按以下JSON数组格式输出：
[{"author":"NPC名字","content":"动态正文","imageDesc":"配图描述或空字符串"}]`
        },
        { role: 'user', content: '请生成朋友圈动态' }
      ];

      const reply = await _callAuxApi(msgs, { temperature: 0.95, max_tokens: 2500 });
      let momData;
      try {
        momData = _safeParseJsonArray(reply);
      } catch (e) {
        throw new Error('动态数据解析失败');
      }

      let addedCount = 0;
      for (const md of momData) {
        if (!md || !md.content || !md.author) continue;
        if (!npcNames.includes(md.author)) continue;
        _addMoment({
          author: String(md.author).trim(),
          content: String(md.content).trim().slice(0, 500),
          imageDesc: md.imageDesc ? String(md.imageDesc).trim().slice(0, 100) : ''
        });
        addedCount++;
      }

      if (addedCount > 0) {
        if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success 已生成 ${addedCount} 条新动态！`);

        // ★ NPC之间互相点赞和评论
        setTimeout(() => {
          _npcInteractWithMoments($c).catch(e => console.warn('[Abyss] NPC互动失败', e));
        }, 2000);
      } else {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=info 没有生成新动态，请重试');
      }
    } catch (e) {
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=error 动态生成失败：' + (e.message || '未知'));
    }

    _drawMoments($c);
  }

  // NPC之间互相点赞和评论动态
  async function _npcInteractWithMoments($c) {
    const api = _getAuxApi();
    if (!api) return;

    const moments = _loadMoments();
    if (moments.length < 2) return;

    // 收集所有NPC名字
    const npcSet = new Set();
    moments.forEach(m => { if (m.author) npcSet.add(m.author); });
    const playerName = _getPlayerName();
    npcSet.delete(playerName);
    const npcNames = Array.from(npcSet);
    if (npcNames.length < 2) return;

    // 每个NPC随机给1-3条别人的动态点赞
    for (const npc of npcNames) {
      const otherMoments = moments.filter(m => m.author && m.author !== npc);
      const shuffled = [...otherMoments].sort(() => 0.5 - Math.random());
      const toLike = shuffled.slice(0, Math.floor(Math.random() * 3) + 1);
      for (const m of toLike) {
        if (!m.likes.includes(npc)) {
          _toggleMomentLike(m.id, npc);
        }
      }
    }

    // 随机选2-4对NPC互相评论
    const commentPairs = [];
    for (let i = 0; i < Math.min(4, npcNames.length * 2); i++) {
      const commenter = npcNames[Math.floor(Math.random() * npcNames.length)];
      const targetMoments = moments.filter(m => m.author && m.author !== commenter);
      if (!targetMoments.length) continue;
      const targetMom = targetMoments[Math.floor(Math.random() * targetMoments.length)];
      // 避免重复评论同一条
      if (commentPairs.find(p => p.commenter === commenter && p.momId === targetMom.id)) continue;
      commentPairs.push({ commenter, momId: targetMom.id, momAuthor: targetMom.author, momContent: targetMom.content });
    }

    // 批量生成评论
    if (commentPairs.length > 0) {
      try {
        const pairsDesc = commentPairs.map((p, i) =>
          `${i + 1}. ${p.commenter}评论${p.momAuthor}的动态："${p.momContent.slice(0, 60)}"`
        ).join('\n');

        const npcInfoList = npcNames.map(n => {
          const np = _getNpcPersonality(n);
          return `${n}：${np.personality.slice(0, 40)}`;
        }).join('\n');

        const msgs = [
          {
            role: 'system',
            content: `你是一个社交媒体评论生成器。请为以下NPC互相评论动态生成回复。

NPC性格简介：
${npcInfoList}

需要生成的评论：
${pairsDesc}

要求：
1. 每条评论要符合评论者的性格
2. 评论要自然、简短，像真人在朋友圈评论一样
3. 可以是吐槽、点赞、调侃、关心等
4. 每条评论10-30字，可以用emoji
5. 严格按以下JSON数组格式输出：
[{"idx":0,"comment":"评论内容"},{"idx":1,"comment":"评论内容"}]
idx对应上面的编号（从0开始）`
          },
          { role: 'user', content: '请生成NPC之间的互相评论' }
        ];

        const reply = await _callAuxApi(msgs, { temperature: 0.95, max_tokens: 800 });
        const comments = _safeParseJsonArray(reply);

        for (const c of comments) {
          if (c.idx === undefined || !c.comment) continue;
          const pair = commentPairs[c.idx];
          if (!pair) continue;
          _addMomentComment(pair.momId, pair.commenter, String(c.comment).trim().slice(0, 100));
        }
      } catch (e) {
        console.warn('[Abyss] NPC互相评论生成失败:', e);
      }
    }

    setTimeout(() => {
      if (_chatSubTab === 'moments') {
        const $fc = $('#ax-chat-main-body');
        if ($fc.length) _drawMoments($fc);
      }
    }, Math.random() * 2000 + 1000);
  }


  // NPC自动回复用户在其动态下的评论
  async function _npcReplyToComment(npcName, momentId, userComment, $c) {
    const api = _getAuxApi();
    if (!api) return;

    const personality = _getNpcPersonality(npcName);
    const playerName = _getPlayerName();

    // 获取这条动态的内容
    const moments = _loadMoments();
    const mom = moments.find(m => m.id === momentId);
    if (!mom) return;

    try {
      const msgs = [
        {
          role: 'system',
          content: `你是"${npcName}"。你发了一条朋友圈动态，"${playerName}"在下面评论了。请回复这条评论。

你的性格：${personality.personality}

你发的动态内容：${mom.content}
${playerName}的评论：${userComment}

要求：
- 像真人在朋友圈回复评论一样
- 1句话，简短随意
- 符合你的性格
- 可以用emoji
- 只输出回复内容，不要加任何前缀`
        },
        { role: 'user', content: '回复评论' }
      ];

      const reply = await _callAuxApi(msgs, { temperature: 0.9, max_tokens: 1000 });
      if (reply && reply.trim()) {
        _addMomentComment(momentId, npcName, reply.trim().slice(0, 100));//延迟一下再刷新，让用户看到自己的评论先
        setTimeout(() => {
          if ($c && $c.length) _drawMoments($c);
        }, 1500);
      }
    } catch (e) {
      // 静默失败
    }
  }
  // NPC自动评论用户的动态
  async function _npcCommentOnUserMoment(momentId, $c) {
    const api = _getAuxApi();
    if (!api) return;

    // 扩大范围：好友 + 核心NPC + 已知NPC，去重
    const npcSet = new Set();
    _getFriendList().forEach(f => { if (f && f.name && !_isBlocked(f.name)) npcSet.add(f.name); });
    CORE_NPC_LIST.forEach(n => { if (n && !_isBlocked(n)) npcSet.add(n); });
    const d = _load();
    if (d && d['NPC关系']) {
      Object.keys(d['NPC关系']).forEach(k => { if (k && !_skip(k) && !_isBlocked(k)) npcSet.add(k); });
    }

    console.log('[Abyss] NPC评论候选人:', Array.from(npcSet));
    const allFriends = Array.from(npcSet).filter(n => n && typeof n === 'string' && n.trim().length > 0);
    if (!allFriends.length) { console.warn('[Abyss] 没有可评论的NPC！检查好友/NPC关系数据'); return; }

    // 随机选1-2个好友来评论
    const commenters = [];
    const shuffled = [...allFriends].sort(() => 0.5 - Math.random());
    const numToComment = Math.random() < 0.7 ? 1 : 2; // 70%概率1人评论, 30%概率2人

    for (let i = 0; i < Math.min(shuffled.length, numToComment); i++) {
      commenters.push(shuffled[i]);
    }

    const moment = _loadMoments().find(m => m.id === momentId);
    if (!moment) return;
    const playerName = _getPlayerName();

    for (const npcName of commenters) {
      // ... 函数的其余部分保持不变
      const personality = _getNpcPersonality(npcName);
      try {
        const msgs = [
          {
            role: 'system',
            content: `你是"${npcName}"。你的好友"${playerName}"刚刚发了一条朋友圈动态，请你像真人在下面评论一样，写一条回复。

你的性格：${personality.personality}

"${playerName}"的动态内容：
${moment.content}

要求：
- 像真人评论朋友圈一样，简短、随意、口语化。
- 评论要完全符合你的性格。
- 可以是点赞、吐槽、提问、开玩笑、或者表达关心。
- 1-2句话即可，可以使用emoji。
- 只输出评论内容，不要加任何前缀或角色名。`
          },
          { role: 'user', content: `（系统：请以"${npcName}"的身份评论这条动态）` }
        ];

        const reply = await _callAuxApi(msgs, { temperature: 0.95, max_tokens: 1000 });
        if (reply && reply.trim()) {
          _addMomentComment(momentId, npcName, reply.trim().slice(0, 100));
          // 延迟刷新UI，让评论逐条出现
          setTimeout(() => {
            if ($c && $c.length && _chatSubTab === 'moments') _drawMoments($c);
          }, Math.random() * 2000 + 1000);
        }
        // 每条评论之间也增加随机延迟
        await new Promise(r => setTimeout(r, Math.random() * 3000 + 2000));
      } catch (e) {
        // 单个NPC评论失败不影响其他
      }
    }
  }


  /* ═══════════════════════════════════════
     👥 好友申请页面
     ═══════════════════════════════════════ */
  function _drawFriendRequests($c) {
    const t = _t();
    const pending = _getPendingRequests();
    const allReqs = _getAllRequests();
    const friends = _getFriendList();

    let o = '';

    // 手动触发NPC申请按钮
    o += '<div class="ax-chat-new-btn" id="ax-trigger-request">⚡ 触发NPC好友申请（需要API）</div>';

    // 好友列表
    o += `<div class="ax-sec-h" style="margin-top:8px">好 友 列 表 (${friends.length})</div>`;
    if (!friends.length) {
      o += `<div style="text-align:center;padding:12px;color:${t.textMuted};font-size:9px;font-style:italic">还没有好友</div>`;
    } else {
      for (const f of friends) {
        const avatarUrl = _getNpcAvatar(f.name);
        const emoji = _getNpcEmoji(f.name);
        const avatarStyle = avatarUrl ? `background-image:url('${avatarUrl}');background-size:cover;background-position:center` : '';
        const avatarContent = avatarUrl ? '' : emoji;
        o += '<div class="ax-friend-req">';
        o += `<div class="ax-friend-req-avatar" style="${avatarStyle}">${avatarContent}</div>`;
        o += '<div class="ax-friend-req-body">';
        o += `<div class="ax-friend-req-name">${_esc(f.name)}</div>`;
        o += `<div class="ax-friend-req-msg">${f.note ? _esc(f.note) : '已是好友'}</div>`;
        o += '</div>';
        o += '<div class="ax-friend-req-actions">';
        o += `<button class="ax-friend-btn ax-friend-reject ax-unfriend-btn" data-name="${_esc(f.name)}" style="font-size:8px">删除</button>`;
        o += `<button class="ax-friend-btn ax-friend-block ax-block-btn" data-name="${_esc(f.name)}">拉黑</button>`;
        o += '</div></div>';
      }
    }

    // 待处理申请
    o += `<div class="ax-sec-h" style="margin-top:12px">待 处 理 申 请 (${pending.length})</div>`;
    if (!pending.length) {
      o += `<div style="text-align:center;padding:12px;color:${t.textMuted};font-size:9px;font-style:italic">暂无新申请</div>`;
    } else {
      for (const req of pending) {
        const avatarUrl = _getNpcAvatar(req.name);
        const emoji = _getNpcEmoji(req.name);
        const avatarStyle = avatarUrl ? `background-image:url('${avatarUrl}');background-size:cover;background-position:center` : '';
        const avatarContent = avatarUrl ? '' : emoji;
        o += '<div class="ax-friend-req">';
        o += `<div class="ax-friend-req-avatar" style="${avatarStyle}">${avatarContent}</div>`;
        o += '<div class="ax-friend-req-body">';
        o += `<div class="ax-friend-req-name">${_esc(req.name)}</div>`;
        o += `<div class="ax-friend-req-msg">${_esc(req.message || '请求添加好友')}</div>`;
        o += '</div>';
        o += '<div class="ax-friend-req-actions">';
        o += `<button class="ax-friend-btn ax-friend-accept ax-accept-btn" data-name="${_esc(req.name)}">同意</button>`;
        o += `<button class="ax-friend-btn ax-friend-reject ax-reject-btn" data-name="${_esc(req.name)}">拒绝</button>`;
        o += `<button class="ax-friend-btn ax-friend-block ax-block-btn" data-name="${_esc(req.name)}">拉黑</button>`;
        o += '</div></div>';
      }
    }

    // 历史申请记录
    const history = allReqs.filter(r => r.status !== 'pending');
    if (history.length) {
      o += `<div class="ax-sec-h" style="margin-top:12px">历 史 记 录</div>`;
      for (const req of history.slice(0, 20)) {
        const statusText = req.status === 'accepted' ? '✓ 已同意' : '✗ 已拒绝';
        const statusColor = req.status === 'accepted' ? t.pass : t.fail;
        o += `<div style="display:flex;align-items:center;gap:6px;padding:4px 8px;font-size:9px">`;
        o += `<span style="color:${t.textDim}">${_esc(req.name)}</span>`;
        o += `<span style="color:${statusColor};margin-left:auto;font-size:8px">${statusText}</span>`;
        o += '</div>';
      }
    }

    $c.html(o);

    // 事件绑定
    $c.find('.ax-accept-btn').on('click', function () {
      const name = $(this).data('name');
      _acceptRequest(name);
      if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success 已同意 ${name} 的好友申请`);
      _drawChatMainView($('#ax-screen'));
    });
    $c.find('.ax-reject-btn').on('click', function () {
      const name = $(this).data('name');
      _rejectRequest(name);
      if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=info 已拒绝 ${name} 的好友申请`);
      _drawChatMainView($('#ax-screen'));
    });
    $c.find('.ax-block-btn').on('click', function () {
      const name = $(this).data('name');
      _showBlockDialog(name);
    });
    $c.find('.ax-unfriend-btn').on('click', function () {
      const name = $(this).data('name');
      const w = _dialog(`<div class="ax-dlg-h">删除好友</div><div class="ax-dlg-sub">确定要删除 ${_esc(name)} 吗？删除后对方需要重新申请才能聊天。</div><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-uf-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-uf-yes" style="color:${t.fail}">删除</button></div>`);
      $('#ax-uf-no').on('click', () => w.remove());
      $('#ax-uf-yes').on('click', () => {
        _removeFriend(name);
        w.remove();
        if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success 已删除好友 ${name}`);
        _drawChatMainView($('#ax-screen'));
      });
    });
    $c.find('#ax-trigger-request').on('click', () => _triggerNpcFriendRequest());
  }

  function _showBlockDialog(name) {
    const t = _t();
    const w = _dialog(
      `<div class="ax-dlg-h">🚫 拉黑 ${_esc(name)}</div>` +
      `<div class="ax-dlg-sub">拉黑后对方无法给你发消息，剧情中对方会知道被你拉黑了。</div>` +
      '<div class="ax-api-form">' +
      '<label>拉黑原因（可选）</label>' +
      '<input id="ax-block-reason" type="text" placeholder="如：太烦了" maxlength="30">' +
      '</div>' +
      `<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-bl-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-bl-yes" style="color:${t.fail};border-color:rgba(${t.primaryRgb},.3)">确认拉黑</button></div>`
    );
    $('#ax-bl-no').on('click', () => w.remove());
    $('#ax-bl-yes').on('click', () => {
      const reason = $('#ax-block-reason').val().trim();
      _blockUser(name, reason);
      w.remove();
      _chatTarget = null; // 关闭当前对话
      if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success 已拉黑 ${name}`);
      _render(); // 刷新整个界面
    });
  }

  function _showBlockedManager() {
    const t = _t();
    const blocked = _getBlockedList();
    let o = '<div class="ax-dlg-h">🚫 黑名单管理</div>';
    if (!blocked.length) {
      o += `<div style="text-align:center;padding:20px;color:${t.textMuted};font-size:10px;font-style:italic">黑名单为空</div>`;
    } else {
      for (const b of blocked) {
        o += '<div class="ax-blocked-row">';
        o += `<span style="font-size:14px">${_getNpcEmoji(b.name)}</span>`;
        o += `<span class="ax-blocked-name">${_esc(b.name)}</span>`;
        if (b.reason) o += `<span class="ax-blocked-reason">${_esc(b.reason)}</span>`;
        o += `<button class="ax-api-btn ax-unblock-btn" data-name="${_esc(b.name)}">解除</button>`;
        o += '</div>';
      }
    }
    o += `<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-bm-close">关闭</button></div>`;
    const w = _dialog(o);
    w.find('.ax-unblock-btn').on('click', function () {
      const name = $(this).data('name');
      _unblockUser(name);
      w.remove();
      if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success 已解除拉黑 ${name}`);
      _showBlockedManager();
    });
    w.find('#ax-bm-close').on('click', () => w.remove());
  }

  // NPC主动发送好友申请（调用API）
  async function _triggerNpcFriendRequest() {
    const api = _getAuxApi();
    if (!api) {
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 请先配置API接口');
      return;
    }

    const context = _getContextSummary();
    const d = _load();
    const knownNpcs = [];
    if (d && d['NPC关系']) {
      Object.keys(d['NPC关系']).filter(k => !_skip(k)).forEach(name => {
        if (!_isFriend(name) && !_isBlocked(name)) knownNpcs.push(name);
      });
    }
    // 如果没有从变量中找到已知NPC，回退到核心NPC列表
    if (!knownNpcs.length) {
      for (const npc of CORE_NPC_LIST) {
        if (!_isFriend(npc) && !_isBlocked(npc)) knownNpcs.push(npc);
      }
    }

    if (!knownNpcs.length) {
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=info 所有已知NPC都已经是好友了');
      return;
    }

    if (typeof triggerSlash === 'function') triggerSlash('/echo severity=info 正在等待好友申请…');

    try {
      const msgs = [
        {
          role: 'system',
          content: `你是一个游戏系统。根据以下世界信息和剧情，从下面的NPC列表中选择1-2个最适合向玩家发送好友申请的NPC，并为他们生成个性化的申请消息。

可选NPC列表：${knownNpcs.join('、')}

当前世界信息和最近剧情：
${context.slice(0, 3000)}

要求：
1. 选择与玩家最近有互动、或剧情上有理由想联系玩家的NPC
2. 申请消息要符合该NPC的性格特点，1-2句话，自然随意
3. 严格按以下JSON格式回复，只输出JSON：
[{"name":"NPC名字","message":"申请消息"}]
4. 示例：[{"name":"周黑鸭","message":"哥们加个好友呗，下次组队方便联系 🦆"}]`
        },
        { role: 'user', content: '请生成好友申请' }
      ];

      const reply = await _callAuxApi(msgs, { temperature: 0.9, max_tokens: 1000 });

      let reqData;
      try {
        reqData = _safeParseJsonArray(reply);
      } catch (e) {
        console.warn('[Abyss] Friend request parse fail:', e, reply);
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=error 好友申请解析失败，请重试');
        return;
      }

      if (!Array.isArray(reqData)) reqData = [reqData];

      let addedCount = 0;
      for (const req of reqData) {
        const reqName = req.name ? String(req.name).trim() : '';
        if (reqName && knownNpcs.includes(reqName)) {
          _addFriendRequest(reqName, String(req.message || '请求添加好友').trim());
          addedCount++;
        }
      }

      if (addedCount > 0) {
        if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success 收到 ${addedCount} 条好友申请！`);
        _drawChatMainView($('#ax-screen'));
      } else {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=info 暂时没有NPC想加你好友');
      }
    } catch (e) {
      console.warn('[Abyss] Friend request generation failed:', e);
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=error 好友申请生成失败：' + (e.message || '未知错误'));
    }
  }

  /* ═══════════════════════════════════════
     👤 玩家个人资料页面
     ═══════════════════════════════════════ */
  function _drawPlayerProfile($c) {
    const t = _t();
    const profile = _loadPlayerProfile();
    const playerName = profile.name;
    const playerAvatar = profile.avatar;
    const coins = _getPlayerCoins();
    const friendCount = _getFriendList().length;
    const chatCount = _getConversationList().length;

    let o = '';

    // 个人信息区
    o += '<div class="ax-profile-header">';
    const pavStyle = playerAvatar ? `background-image:url('${playerAvatar}');background-size:cover;background-position:center` : '';
    const pavContent = playerAvatar ? '' : '👤';
    o += `<div class="ax-profile-avatar" id="ax-profile-avatar-btn" style="${pavStyle}">${pavContent}</div>`;
    o += `<div class="ax-profile-name" id="ax-profile-name-btn">${_esc(playerName)}</div>`;
    o += `<div class="ax-profile-bio" id="ax-profile-bio-btn">${_esc(profile.bio || '这个人很懒，什么都没写')}</div>`;
    o += '<div class="ax-profile-stats">';
    o += `<div class="ax-profile-stat"><div class="ax-profile-stat-num">${chatCount}</div><div class="ax-profile-stat-label">对话</div></div>`;
    o += `<div class="ax-profile-stat"><div class="ax-profile-stat-num">${coins}</div><div class="ax-profile-stat-label">魂币</div></div>`;
    o += `<div class="ax-profile-stat"><div class="ax-profile-stat-num">${friendCount}</div><div class="ax-profile-stat-label">好友</div></div>`;
    o += '</div></div>';

    // 功能列表
    o += `<div style="padding:0 4px">`;

    // 礼物记录
    const totalGifts = _loadGifts().length;
    o += `<div class="ax-list-item" id="ax-prof-gifts"><div class="ax-list-ico">🎁</div><div class="ax-list-body"><div class="ax-list-main">礼物记录</div><div class="ax-list-sub">共 ${totalGifts} 条记录</div></div><div class="ax-list-end" style="font-size:12px;color:${t.textMuted}">›</div></div>`;

    // 表情包管理
    const totalStickers = _loadStickers().length;
    o += `<div class="ax-list-item" id="ax-prof-stickers"><div class="ax-list-ico">😊</div><div class="ax-list-body"><div class="ax-list-main">表情包管理</div><div class="ax-list-sub">共 ${totalStickers} 个表情</div></div><div class="ax-list-end" style="font-size:12px;color:${t.textMuted}">›</div></div>`;

    // 黑名单管理
    const blockedCount = _getBlockedList().length;
    o += `<div class="ax-list-item" id="ax-prof-blocked" style="margin-top:16px"><div class="ax-list-ico">🚫</div><div class="ax-list-body"><div class="ax-list-main">黑名单管理</div><div class="ax-list-sub">${blockedCount > 0 ? '已拉黑 ' + blockedCount + ' 人' : '黑名单为空'}</div></div><div class="ax-list-end" style="font-size:12px;color:${t.textMuted}">›</div></div>`;

    // 数据管理
    o += `<div class="ax-list-item" id="ax-prof-clear-chats" style="margin-top:8px"><div class="ax-list-ico" style="color:${t.fail}">🗑️</div><div class="ax-list-body"><div class="ax-list-main" style="color:${t.fail}">清空所有聊天记录</div><div class="ax-list-sub">此操作不可撤销</div></div></div>`;
    // 刷新聊天总结缓存
    o += `<div class="ax-list-item" id="ax-prof-refresh-summary" style="margin-top:4px"><div class="ax-list-ico">🔄</div><div class="ax-list-body"><div class="ax-list-main">刷新聊天总结缓存</div><div class="ax-list-sub">清除旧的总结，下次同步时重新生成</div></div><div class="ax-list-end" style="font-size:12px;color:${t.textMuted}">›</div></div>`;

    // 重置手机面板
    o += `<div class="ax-list-item" id="ax-prof-reset-panel" style="margin-top:4px"><div class="ax-list-ico" style="color:${t.fail}">🔧</div><div class="ax-list-body"><div class="ax-list-main" style="color:${t.fail}">重置手机面板数据</div><div class="ax-list-sub">选择性重置各模块数据</div></div><div class="ax-list-end" style="font-size:12px;color:${t.textMuted}">›</div></div>`;
    o += '</div>';

    $c.html(o);

    // 事件绑定
    // 修改头像
    $c.find('#ax-profile-avatar-btn').on('click', () => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*';
      inp.onchange = function () {
        const f = this.files[0]; if (!f) return;
        const rd = new FileReader();
        rd.onload = function (e) {
          const img = new Image();
          img.onload = function () {
            let w = img.width, h = img.height;
            const mx = 200;
            if (w > mx || h > mx) { const r = Math.min(mx / w, mx / h); w = Math.round(w * r); h = Math.round(h * r); }
            const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
            cv.getContext('2d').drawImage(img, 0, 0, w, h);
            const out = cv.toDataURL('image/jpeg', 0.75);
            const p = _loadPlayerProfile();
            p.avatar = out;
            _savePlayerProfile(p);
            if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 头像已更新');
            _drawChatMainView($('#ax-screen'));
          };
          img.src = e.target.result;
        };
        rd.readAsDataURL(f);
      };
      inp.click();
    });
    // 修改昵称
    $c.find('#ax-profile-name-btn').on('click', () => {
      const p = _loadPlayerProfile();
      const w = _dialog(`<div class="ax-dlg-h">✎ 修改昵称</div><input class="ax-dlg-input" id="ax-pn-i" type="text" value="${_esc(p.name)}" maxlength="20" placeholder="输入新昵称"><div class="ax-dlg-err" id="ax-pn-e"></div><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-pn-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-pn-yes">确认</button></div>`);
      $('#ax-pn-i').focus().select();
      $('#ax-pn-no').on('click', () => w.remove());
      $('#ax-pn-yes').on('click', () => {
        const v = $('#ax-pn-i').val().trim();
        if (!v) { $('#ax-pn-e').text('不能为空'); return; }
        p.name = v;
        _savePlayerProfile(p);
        w.remove();
        _drawChatMainView($('#ax-screen'));
      });
    });
    // 修改签名
    $c.find('#ax-profile-bio-btn').on('click', () => {
      const p = _loadPlayerProfile();
      const w = _dialog(`<div class="ax-dlg-h">✎ 修改签名</div><input class="ax-dlg-input" id="ax-pb-i" type="text" value="${_esc(p.bio)}" maxlength="50" placeholder="写一句签名…"><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-pb-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-pb-yes">确认</button></div>`);
      $('#ax-pb-i').focus().select();
      $('#ax-pb-no').on('click', () => w.remove());
      $('#ax-pb-yes').on('click', () => {
        p.bio = $('#ax-pb-i').val().trim() || '这个人很懒，什么都没写';
        _savePlayerProfile(p);
        w.remove();
        _drawChatMainView($('#ax-screen'));
      });
    });

    // 礼物记录
    $c.find('#ax-prof-gifts').on('click', () => _showAllGiftsDialog());

    // 表情包管理
    $c.find('#ax-prof-stickers').on('click', () => _showStickerPanel());

    // 黑名单管理
    $c.find('#ax-prof-blocked').on('click', () => _showBlockedManager());

    // 清空聊天
    $c.find('#ax-prof-clear-chats').on('click', () => {
      const w = _dialog(`<div class="ax-dlg-h">⚠ 清空所有聊天</div><div class="ax-dlg-sub">确定清空所有NPC聊天记录？此操作不可撤销。</div><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-cc-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-cc-yes" style="color:${t.fail}">确认清空</button></div>`);
      $('#ax-cc-no').on('click', () => w.remove());
      $('#ax-cc-yes').on('click', () => {
        _saveChats({});
        if (window._abyssChatSyncConfig) {
          const cfg = window._abyssChatSyncConfig;
          window.AbyssChat.syncToWorldInfo(cfg.worldBookName, cfg.uid).catch(() => { });
        }

        _saveUnread({});
        _syncChatToWB();
        w.remove();
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 所有聊天记录已清空');
        _drawChatMainView($('#ax-screen'));
      });
    });
    $c.find('#ax-prof-reset-panel').on('click', () => {
      const t = _t();
      const w = _dialog(
        '<div class="ax-dlg-h">⚠️ 重置手机面板</div>' +
        '<div class="ax-dlg-sub">选择要重置的数据类型：</div>' +
        '<div style="display:flex;flex-direction:column;gap:4px;margin:8px 0">' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:10px;color:' + t.text + ';padding:6px 8px;border-radius:8px;background:' + t.surfaceHover + ';cursor:pointer"><input type="checkbox" class="ax-reset-cb" data-key="chat" checked>💬 聊天记录和总结缓存</label>' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:10px;color:' + t.text + ';padding:6px 8px;border-radius:8px;background:' + t.surfaceHover + ';cursor:pointer"><input type="checkbox" class="ax-reset-cb" data-key="friends">👥 好友和申请记录</label>' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:10px;color:' + t.text + ';padding:6px 8px;border-radius:8px;background:' + t.surfaceHover + ';cursor:pointer"><input type="checkbox" class="ax-reset-cb" data-key="moments"> 📱朋友圈动态</label>' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:10px;color:' + t.text + ';padding:6px 8px;border-radius:8px;background:' + t.surfaceHover + ';cursor:pointer"><input type="checkbox" class="ax-reset-cb" data-key="forum"> 📋 论坛数据</label>' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:10px;color:' + t.text + ';padding:6px 8px;border-radius:8px;background:' + t.surfaceHover + ';cursor:pointer"><input type="checkbox" class="ax-reset-cb" data-key="gifts"> 🎁 礼物记录</label>' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:10px;color:' + t.text + ';padding:6px 8px;border-radius:8px;background:' + t.surfaceHover + ';cursor:pointer"><input type="checkbox" class="ax-reset-cb" data-key="stickers"> 😊 表情包</label>' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:10px;color:' + t.text + ';padding:6px 8px;border-radius:8px;background:' + t.surfaceHover + ';cursor:pointer"><input type="checkbox" class="ax-reset-cb" data-key="radio"> 🎵 电台历史和收藏</label>' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:10px;color:' + t.text + ';padding:6px 8px;border-radius:8px;background:' + t.surfaceHover + ';cursor:pointer"><input type="checkbox" class="ax-reset-cb" data-key="notes"> 📝 笔记</label>' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:10px;color:' + t.text + ';padding:6px 8px;border-radius:8px;background:' + t.surfaceHover + ';cursor:pointer"><input type="checkbox" class="ax-reset-cb" data-key="album"> 📷 相册</label>' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:10px;color:' + t.text + ';padding:6px 8px;border-radius:8px;background:' + t.surfaceHover + ';cursor:pointer"><input type="checkbox" class="ax-reset-cb" data-key="api"> 🔌 API配置</label>' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:10px;color:' + t.text + ';padding:6px 8px;border-radius:8px;background:' + t.surfaceHover + ';cursor:pointer"><input type="checkbox" class="ax-reset-cb" data-key="theme"> 🎨 主题和字体设置</label>' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:10px;color:' + t.text + ';padding:6px 8px;border-radius:8px;background:' + t.surfaceHover + ';cursor:pointer"><input type="checkbox" class="ax-reset-cb" data-key="images"> 🖼️ 壁纸和头像图片</label>' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:10px;color:' + t.text + ';padding:6px 8px;border-radius:8px;background:' + t.surfaceHover + ';cursor:pointer"><input type="checkbox" class="ax-reset-cb" data-key="moods"> 😊 NPC心情数据</label>' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:10px;color:' + t.text + ';padding:6px 8px;border-radius:8px;background:' + t.surfaceHover + ';cursor:pointer"><input type="checkbox" class="ax-reset-cb" data-key="minigame"> 🎮 小游戏和成就</label>' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:10px;color:' + t.text + ';padding:6px 8px;border-radius:8px;background:' + t.surfaceHover + ';cursor:pointer"><input type="checkbox" class="ax-reset-cb" data-key="broadcast"> 📻 广播历史</label>' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:10px;color:' + t.text + ';padding:6px 8px;border-radius:8px;background:' + t.surfaceHover + ';cursor:pointer"><input type="checkbox" class="ax-reset-cb" data-key="shop"> 🏪 商店数据</label>' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:10px;color:' + t.text + ';padding:6px 8px;border-radius:8px;background:' + t.surfaceHover + ';cursor:pointer"><input type="checkbox" class="ax-reset-cb" data-key="profile"> 👤 个人资料</label>' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:10px;color:' + t.text + ';padding:6px 8px;border-radius:8px;background:' + t.surfaceHover + ';cursor:pointer"><input type="checkbox" class="ax-reset-cb" data-key="apporder"> 📱桌面排列</label>' +
        '</div>' +
        '<div style="display:flex;gap:4px;margin:6px 0">' +
        '<button class="ax-api-btn" id="ax-reset-all" style="flex:1;text-align:center;font-size:9px">全选</button>' +
        '<button class="ax-api-btn" id="ax-reset-none" style="flex:1;text-align:center;font-size:9px">全不选</button>' +
        '</div>' +
        '<div style="font-size:8px;color:' + t.fail + ';margin:4px 0;text-align:center">⚠️ 此操作不可撤销！</div>' +
        '<div class="ax-dlg-actions">' +
        '<button class="ax-dlg-btn ax-dlg-cancel" id="ax-reset-cancel">取消</button>' +
        '<button class="ax-dlg-btn ax-dlg-ok" id="ax-reset-confirm" style="color:' + t.fail + ';border-color:rgba(' + t.primaryRgb + ',.3)">确认重置</button>' +
        '</div>'
      );

      // 全选/全不选
      w.find('#ax-reset-all').on('click', () => { w.find('.ax-reset-cb').prop('checked', true); });
      w.find('#ax-reset-none').on('click', () => { w.find('.ax-reset-cb').prop('checked', false); });

      w.find('#ax-reset-cancel').on('click', () => w.remove());

      w.find('#ax-reset-confirm').on('click', () => {
        const selected = [];
        w.find('.ax-reset-cb:checked').each(function () {
          selected.push($(this).data('key'));
        });

        if (!selected.length) {
          if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 请至少选择一项');
          return;
        }

        // 定义每个类别对应的localStorage键
        const keyMap = {
          chat: ['abyss-chat-data', 'abyss-chat-unread'],
          friends: ['abyss-friends'],
          moments: ['abyss-moments'],
          forum: ['abyss-forum-posts', 'abyss-forum-accounts', 'abyss-forum-settings'],
          gifts: ['abyss-gifts'],
          stickers: ['abyss-stickers', 'abyss-sticker-tags'],
          radio: ['abyss-radio-history', 'abyss-radio-favorites', 'abyss-radio-cache', 'abyss-radio-playlist'],
          notes: ['abyss-notes'],
          album: ['abyss-album'],
          api: ['abyss-api-list'],
          theme: ['abyss-theme', 'abyss-font-settings', 'abyss-theme-history'],
          moods: ['abyss-npc-moods'],
          minigame: ['abyss-minigame-data', 'abyss-achievements'],
          broadcast: ['abyss-broadcast', 'abyss-broadcast-history', 'abyss-broadcast-settings'],
          shop: ['abyss-equip-shop', 'abyss-gift-shop', 'abyss-gift-cart'],
          profile: ['abyss-player-profile'],
          apporder: ['abyss-app-order']
        };

        let deletedCount = 0;

        for (const category of selected) {
          // 固定键
          if (keyMap[category]) {
            for (const k of keyMap[category]) {
              try { localStorage.removeItem(k); deletedCount++; } catch (e) { }
            }
          }

          // 特殊处理：聊天总结缓存（前缀匹配）
          if (category === 'chat') {
            try {
              Object.keys(localStorage).filter(k =>
                k.startsWith('abyss-chat-summary-') ||
                k.startsWith('abyss-chat-bg-')
              ).forEach(k => {
                localStorage.removeItem(k);
                deletedCount++;
              });
            } catch (e) { }
          }

          // 特殊处理：图片数据（前缀匹配）
          if (category === 'images') {
            try {
              Object.keys(localStorage).filter(k =>
                k.startsWith('abyss-img-') ||
                k.startsWith('abyss-chat-bg-') ||
                k.startsWith('abyss-img-av-npc-')
              ).forEach(k => {
                localStorage.removeItem(k);
                deletedCount++;
              });
            } catch (e) { }
          }
        }

        w.remove();

        if (typeof triggerSlash === 'function') {
          triggerSlash(`/echo severity=success 已重置 ${selected.length} 个类别的数据（共清除 ${deletedCount} 个存储项）。请刷新页面使更改生效。`);
        }

        // 如果重置了主题，重新应用默认主题
        if (selected.includes('theme')) {
          _currentTheme = 'inferno';
          window.ABYSS_CURRENT_THEME = 'inferno';
          _ensureCss();
        }

        // 刷新界面
        setTimeout(() => {
          _chatTarget = null;
          _chatSubTab = 'messages';
          _render();
        }, 500);
      });
    });

    // 强制刷新聊天总结缓存
    $c.find('#ax-prof-refresh-summary').on('click', () => {
      const t = _t();
      let count = 0;
      try {
      Object.keys(localStorage).filter(k =>
        k.startsWith('abyss-chat-summary-') || k.startsWith('abyss-grpchat-summary-')
      ).forEach(k => {
          localStorage.removeItem(k);
          count++;
        });
      } catch (e) { }

      if (typeof triggerSlash === 'function') {
        if (count > 0) {
          triggerSlash(`/echo severity=success 已清除 ${count} 条聊天总结缓存。下次同步时会用新的设置重新生成。`);
        } else {
          triggerSlash('/echo severity=info 没有找到聊天总结缓存');
        }
      }
    });
  }

  // 查看所有礼物记录的弹窗
  function _showAllGiftsDialog() {
    const t = _t();
    const gifts = _loadGifts();
    let o = '<div class="ax-dlg-h">🎁 礼物记录</div>';
    if (!gifts.length) {
      o += `<div style="text-align:center;padding:20px;color:${t.textMuted};font-size:10px;font-style:italic">还没有礼物记录</div>`;
    } else {
      o += `<div style="max-height:300px;overflow-y:auto">`;
      const sorted = [...gifts].sort((a, b) => (b.ts || 0) - (a.ts || 0));
      for (const g of sorted) {
        const isSent = !!g.toNpc;
        const target = g.toNpc || g.fromNpc || '未知';
        const dirIcon = isSent ? '➜ 送给' : '⬅ 来自';
        const rc = { SSS: t.sss, SSR: t.ssr, SR: t.sr, R: t.text }[g.rarity] || t.textDim;
        o += `<div style="display:flex;align-items:center;gap:6px;padding:5px;border-radius:8px;margin-bottom:2px">`;
        o += `<span style="font-size:16px;width:22px;text-align:center">${g.emoji || '🎁'}</span>`;
        o += `<div style="flex:1;min-width:0"><div style="font-size:9px;color:${t.text}">${_esc(g.name)} <span style="font-size:7px;color:${rc}">[${g.rarity || 'R'}]</span></div>`;
        o += `<div style="font-size:7px;color:${t.textMuted}">${dirIcon} ${_esc(target)} · ${_formatTimeAgo(g.ts)}</div></div>`;
        o += `</div>`;
      }
      o += '</div>';
    }
    o += `<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-ag-close">关闭</button></div>`;
    const w = _dialog(o);
    w.find('#ax-ag-close').on('click', () => w.remove());
  }

  function _formatTimeAgo(ts) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '刚刚';
    if (mins < 60) return mins + '分钟前';
    const hours = Math.floor(mins / 60);
    if (hours < 24) return hours + '小时前';
    const days = Math.floor(hours / 24);
    if (days < 7) return days + '天前';
    return new Date(ts).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  }

  /* ═══════════════════════════════════════
     🎵 心情电台（增强版 - 歌手歌单+随机播放+多重搜索）
     ═══════════════════════════════════════ */
  const RADIO_STORAGE_KEY = 'abyss-radio-history';
  const RADIO_FAVORITES_KEY = 'abyss-radio-favorites';
  const RADIO_MUSIC_CACHE_KEY = 'abyss-radio-cache';
  const RADIO_PLAYLIST_KEY = 'abyss-radio-playlist';

  // 全局音频播放器
  let _radioAudio = null;
  let _radioPlaying = false;
  let _radioCurrentSong = null;
  let _radioLyrics = [];
  let _radioLyricIndex = -1;
  let _radioTab = 'search';
  let _radioMusicLoaded = false;
  let _radioVolume = 70;
  let _radioPlaylist = []; // 当前播放列表
  let _radioPlaylistIndex = -1; // 当前播放列表中的位置
  let _radioShuffle = false; // 随机播放模式
  let _radioRepeat = 'none'; // 循环模式: 'none' | 'all' | 'one'
  let _radioSearchResults = []; // 最近的搜索结果

  function _getRadioAudio() {
    if (!_radioAudio) {
      _radioAudio = new Audio();
      _radioAudio.volume = _radioVolume / 100;
      // 播放结束时自动播放下一首
      _radioAudio.addEventListener('ended', () => {
        _radioPlaying = false;
        if (_radioRepeat === 'one') {
          // 单曲循环
          _radioAudio.currentTime = 0;
          _radioAudio.play().catch(() => { });
          _radioPlaying = true;
        } else {
          _playNext();
        }
      });
    }
    return _radioAudio;
  }

  function _loadRadioHistory() {
    try { const r = localStorage.getItem(RADIO_STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) { }
    return [];
  }
  function _saveRadioHistory(list) {
    try { localStorage.setItem(RADIO_STORAGE_KEY, JSON.stringify(list)); } catch (e) { }
  }
  function _addRadioHistory(song) {
    const list = _loadRadioHistory();
    const idx = list.findIndex(s => s.name === song.name && s.artist === song.artist);
    if (idx !== -1) list.splice(idx, 1);
    list.unshift({ name: song.name, artist: song.artist, keyword: song.keyword || '', ts: Date.now() });
    if (list.length > 50) list.splice(50);
    _saveRadioHistory(list);
  }
  function _loadRadioFavorites() {
    try { const r = localStorage.getItem(RADIO_FAVORITES_KEY); if (r) return JSON.parse(r); } catch (e) { }
    return [];
  }
  function _saveRadioFavorites(list) {
    try { localStorage.setItem(RADIO_FAVORITES_KEY, JSON.stringify(list)); } catch (e) { }
  }
  function _toggleFavorite(song) {
    const favs = _loadRadioFavorites();
    const idx = favs.findIndex(s => s.name === song.name && s.artist === song.artist);
    if (idx !== -1) { favs.splice(idx, 1); } else { favs.push({ name: song.name, artist: song.artist, keyword: song.keyword || '', ts: Date.now() }); }
    _saveRadioFavorites(favs);
    return idx === -1;
  }
  function _isFavorite(song) {
    if (!song) return false;
    return _loadRadioFavorites().some(s => s.name === song.name && s.artist === song.artist);
  }

  // 音乐搜索缓存
  function _loadMusicCache() {
    try { const r = localStorage.getItem(RADIO_MUSIC_CACHE_KEY); if (r) return JSON.parse(r); } catch (e) { }
    return {};
  }
  function _saveMusicCache(cache) {
    try { localStorage.setItem(RADIO_MUSIC_CACHE_KEY, JSON.stringify(cache)); } catch (e) { }
  }
  function _cacheMusicResult(keyword, result) {
    const cache = _loadMusicCache();
    cache[keyword] = { data: result, ts: Date.now() };
    const keys = Object.keys(cache);
    if (keys.length > 80) {
      keys.sort((a, b) => cache[a].ts - cache[b].ts);
      for (let i = 0; i < keys.length - 80; i++) delete cache[keys[i]];
    }
    _saveMusicCache(cache);
  }
  function _getCachedMusic(keyword) {
    const cache = _loadMusicCache();
    const entry = cache[keyword];
    if (!entry) return null;
    if (Date.now() - entry.ts > 3600000) return null;
    return entry.data;
  }

  // 加载外部Music.js库
  async function _ensureMusicLib() {
    if (globalThis.Music) { _radioMusicLoaded = true; return true; }
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = `https://drive.baibai.cv/f/ZKEBuW/Music.js?time=${new Date().getHours()}`;
      script.onload = () => { _radioMusicLoaded = true; resolve(true); };
      script.onerror = () => { console.warn('[Abyss Radio] Music.js load failed'); resolve(false); };
      document.head.appendChild(script);
    });
  }

  // 检查音频链接可用性
  function _checkAudioUrl(url) {
    return new Promise((resolve) => {
      const audio = new Audio();
      let timer;
      const cleanup = () => { audio.removeEventListener('loadedmetadata', onOk); audio.removeEventListener('error', onFail); clearTimeout(timer); audio.src = ''; };
      const onOk = () => { cleanup(); resolve(true); };
      const onFail = () => { cleanup(); resolve(false); };
      audio.preload = 'metadata';
      audio.src = url;
      timer = setTimeout(onFail, 6000);
      audio.addEventListener('loadedmetadata', onOk);
      audio.addEventListener('error', onFail);
    });
  }

  // 多重搜索策略：先搜原始关键词，失败后尝试变体
  async function _searchAndPlayMusic(keyword) {
    if (!keyword || !keyword.trim()) return { success: false, error: '搜索词为空' };

    const libLoaded = await _ensureMusicLib();
    if (!libLoaded || !globalThis.Music) {
      return { success: false, error: '音乐库加载失败，请刷新页面重试' };
    }

    // 检查缓存
    const cached = _getCachedMusic(keyword);
    if (cached && cached.Url) {
      const ok = await _checkAudioUrl(cached.Url);
      if (ok) return { success: true, data: cached };
    }

    // 构建搜索变体列表（提高命中率）
    const variants = [keyword];
    // 如果关键词包含空格，也尝试用 "-" 连接
    if (keyword.includes(' ')) {
      variants.push(keyword.replace(/\s+/g, '-'));
      // 也尝试只搜歌名部分（空格前的第一段）
      const parts = keyword.split(/\s+/);
      if (parts.length >= 2) {
        variants.push(parts[0]); // 只搜歌名
        variants.push(parts.join(' ')); // 保持原样（已在第一个）
      }
    }

    // 依次尝试每个变体
    for (const variant of variants) {
      try {
        const result = await globalThis.Music.SearchMusic(variant);
        if (result && result.Url) {
          const urlOk = await _checkAudioUrl(result.Url);
          if (urlOk) {
            _cacheMusicResult(keyword, result);
            _cacheMusicResult(variant, result);
            return { success: true, data: result };
          }
        }
      } catch (e) {
        console.warn('[Abyss Radio] Search variant fail:', variant, e);
      }
    }

    return { success: false, error: '未找到可播放的音乐，请尝试换个关键词' };
  }

  // 批量搜索歌手的歌单（不播放，只返回列表）
  async function _searchArtistSongs(artistName, count) {
    if (!artistName) return [];

    const libLoaded = await _ensureMusicLib();
    if (!libLoaded || !globalThis.Music) return [];

    // 构建多个搜索关键词来获取歌手的不同歌曲
    const searchKeywords = [
      artistName,
      artistName + ' 热门',
      artistName + ' 歌曲',
    ];

    const foundSongs = [];
    const seenNames = new Set();

    for (const kw of searchKeywords) {
      try {
        // Music.SearchMusic 每次只返回一首，我们多次搜索不同关键词
        const result = await globalThis.Music.SearchMusic(kw);
        if (result && result.Name && !seenNames.has(result.Name)) {
          seenNames.add(result.Name);
          foundSongs.push({
            name: result.Name || kw,
            artist: result.Singer || artistName,
            keyword: (result.Name || '') + ' ' + (result.Singer || artistName),
            url: result.Url || '',
            lyric: result.Lyric || ''
          });
          _cacheMusicResult((result.Name || '') + ' ' + (result.Singer || artistName), result);
        }
      } catch (e) {
        console.warn('[Abyss Radio] Artist search fail:', kw, e);
      }
      if (foundSongs.length >= (count || 10)) break;
    }

    return foundSongs;
  }

  // 解析LRC歌词
  function _parseLrc(lrcText) {
    if (!lrcText) return [];
    const lines = lrcText.split(/\r?\n/);
    const result = [];
    for (const line of lines) {
      const timeMatches = line.match(/\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g);
      const text = line.replace(/\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g, '').trim();
      if (timeMatches && text) {
        for (const tm of timeMatches) {
          const m = tm.match(/\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/);
          if (!m) continue;
          const time = 60 * Number(m[1]) + Number(m[2]) + (m[3] ? Number(m[3].padEnd(3, '0')) : 0) / 1000;
          result.push({ time, text });
        }
      }
    }
    result.sort((a, b) => a.time - b.time);
    return result;
  }

  // 获取当前歌词行
  function _getCurrentLyric(currentTime) {
    if (!_radioLyrics.length) return { current: '', next: '' };
    let idx = _radioLyrics.length - 1;
    for (let i = 0; i < _radioLyrics.length; i++) {
      if (currentTime < _radioLyrics[i].time) { idx = i - 1; break; }
    }
    if (idx < 0) return { current: '', next: _radioLyrics[0] ? _radioLyrics[0].text : '' };
    return {
      current: _radioLyrics[idx] ? _radioLyrics[idx].text : '',
      next: _radioLyrics[idx + 1] ? _radioLyrics[idx + 1].text : ''
    };
  }

  // 播放列表管理
  function _setPlaylist(songs, startIndex) {
    _radioPlaylist = songs.map(s => ({
      name: s.name || '',
      artist: s.artist || '',
      keyword: s.keyword || (s.name + ' ' + s.artist),
      url: s.url || '',
      lyric: s.lyric || ''
    }));
    _radioPlaylistIndex = startIndex || 0;
  }

  function _playNext() {
    if (!_radioPlaylist.length) return;
    if (_radioShuffle) {
      // 随机播放
      let nextIdx = Math.floor(Math.random() * _radioPlaylist.length);
      if (_radioPlaylist.length > 1) {
        while (nextIdx === _radioPlaylistIndex) {
          nextIdx = Math.floor(Math.random() * _radioPlaylist.length);
        }
      }
      _radioPlaylistIndex = nextIdx;
    } else {
      _radioPlaylistIndex++;
      if (_radioPlaylistIndex >= _radioPlaylist.length) {
        if (_radioRepeat === 'all') {
          _radioPlaylistIndex = 0;
        } else {
          _radioPlaylistIndex = _radioPlaylist.length - 1;
          _radioPlaying = false;
          _stopLyricUpdater();
          _updateChrome();
          return;
        }
      }
    }
    const song = _radioPlaylist[_radioPlaylistIndex];
    if (song) _playMusicDirect(song);
  }

  function _playPrev() {
    if (!_radioPlaylist.length) return;
    _radioPlaylistIndex--;
    if (_radioPlaylistIndex < 0) {
      if (_radioRepeat === 'all') {
        _radioPlaylistIndex = _radioPlaylist.length - 1;
      } else {
        _radioPlaylistIndex = 0;
      }
    }
    const song = _radioPlaylist[_radioPlaylistIndex];
    if (song) _playMusicDirect(song);
  }

  // 直接播放（有URL直接用，没有则搜索）
  async function _playMusicDirect(song) {
    const audio = _getRadioAudio();
    const $player = $('#ax-radio-player');
    const $status = $('#ax-radio-status');
    const t = _t();

    _radioCurrentSong = song;

    // 如果有缓存的URL，先检查可用性
    if (song.url) {
      const ok = await _checkAudioUrl(song.url);
      if (ok) {
        audio.src = song.url;
        _radioLyrics = _parseLrc(song.lyric || '');
        _addRadioHistory(song);
        try { await audio.play(); _radioPlaying = true; } catch (e) { }
        _updateRadioPlayer($player);
        _startLyricUpdater();
        if ($status.length) $status.html('');
        _updateChrome();
        return;
      }
    }

    // 没有URL或URL失效，重新搜索
    if ($status.length) {
      $status.html(`<div style="text-align:center;padding:6px;color:${t.textMuted};font-size:9px">搜索中：${_esc(song.keyword || song.name)}</div>`);
    }

    const result = await _searchAndPlayMusic(song.keyword || (song.name + ' ' + song.artist));
    if (result.success) {
      const data = result.data;
      song.url = data.Url;
      song.lyric = data.Lyric || '';
      song.name = data.Name || song.name;
      song.artist = data.Singer || song.artist;

      audio.src = data.Url;
      _radioLyrics = _parseLrc(data.Lyric || '');
      _addRadioHistory(song);

      try { await audio.play(); _radioPlaying = true; } catch (e) { }
      _updateRadioPlayer($player);
      _startLyricUpdater();
      if ($status.length) $status.html('');
      _updateChrome();
    } else {
      if ($status.length) {
        $status.html(`<div style="text-align:center;padding:6px;color:${t.fail};font-size:8px">❌ ${_esc(song.name)}: ${_esc(result.error)}</div>`);
      }
      // 自动跳到下一首
      setTimeout(() => _playNext(), 2000);
    }
  }

  // 通过关键词搜索播放（单曲模式或加入播放列表）
  async function _playMusic(keyword, $c, addToPlaylist) {
    const t = _t();
    const $status = $('#ax-radio-status');
    const $player = $('#ax-radio-player');

    if ($status.length) {
      $status.html(`<div style="text-align:center;padding:12px;color:${t.textMuted};font-size:10px"><div class="ax-chat-typing-dots" style="display:inline-flex;gap:3px"><span></span><span></span><span></span></div><div style="margin-top:6px">搜索中：${_esc(keyword)}</div></div>`);
    }

    const result = await _searchAndPlayMusic(keyword);

    if (!result.success) {
      if ($status.length) $status.html(`<div style="text-align:center;padding:8px;color:${t.fail};font-size:9px">❌ ${_esc(result.error)}</div>`);
      return;
    }

    const data = result.data;
    const song = {
      name: data.Name || keyword.split(' ')[0] || keyword,
      artist: data.Singer || keyword.split(' ').slice(1).join(' ') || '未知',
      keyword: keyword,
      url: data.Url,
      lyric: data.Lyric || ''
    };

    _radioCurrentSong = song;
    _radioLyrics = _parseLrc(data.Lyric || '');
    _addRadioHistory(song);

    if (!addToPlaylist) {
      // 单曲模式：创建只有这一首歌的播放列表
      _setPlaylist([song], 0);
    }

    const audio = _getRadioAudio();
    audio.src = data.Url;
    audio.volume = _radioVolume / 100;

    try { await audio.play(); _radioPlaying = true; } catch (e) { }
    _updateRadioPlayer($player);
    _startLyricUpdater();
    if ($status.length) $status.html('');
    _updateChrome();
  }

  let _lyricTimer = null;
  function _startLyricUpdater() {
    if (_lyricTimer) clearInterval(_lyricTimer);
    _lyricTimer = setInterval(() => {
      const audio = _getRadioAudio();
      if (!audio || audio.paused) return;
      const lyric = _getCurrentLyric(audio.currentTime || 0);
      const $cur = $('#ax-lyric-current');
      const $nxt = $('#ax-lyric-next');
      if ($cur.length) $cur.text(lyric.current || '♪');
      if ($nxt.length) $nxt.text(lyric.next || '');
      if (audio.duration) {
        const pct = (audio.currentTime / audio.duration * 100).toFixed(1);
        $('#ax-radio-progress-fill').css('width', pct + '%');
        const cur = _fmtTime(audio.currentTime);
        const dur = _fmtTime(audio.duration);
        $('#ax-radio-time').text(cur + ' / ' + dur);
      }
      // 刷新悬浮标播放状态
      _updateChrome();
    }, 300);
  }
  function _stopLyricUpdater() {
    if (_lyricTimer) { clearInterval(_lyricTimer); _lyricTimer = null; }
  }
  function _fmtTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function _updateRadioPlayer($player) {
    const t = _t();
    if (!_radioCurrentSong) {
      $player.html(`<div style="text-align:center;padding:16px;background:${t.surfaceHover};border-radius:14px"><div style="font-size:28px;margin-bottom:6px">🎵</div><div style="font-size:10px;color:${t.textDim}">搜索歌曲或让NPC推荐</div></div>`);
      return;
    }

    const song = _radioCurrentSong;
    const isFav = _isFavorite(song);
    const audio = _getRadioAudio();
    const isPlaying = audio && !audio.paused;
    const hasPlaylist = _radioPlaylist.length > 1;
    const shuffleIcon = _radioShuffle ? '🔀' : '➡️';
    const repeatIcon = _radioRepeat === 'one' ? '🔂' : _radioRepeat === 'all' ? '🔁' : '↩️';

    let o = `<div style="background:linear-gradient(135deg,${t.bgCard},${t.bgSection});border-radius:16px;padding:14px;border:1px solid rgba(${t.accentRgb},.15)">`;

    // 歌曲信息
    o += `<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">`;
    o += `<div style="width:42px;height:42px;border-radius:50%;background:rgba(${t.accentRgb},.12);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;${isPlaying ? 'animation:axBlink 1.5s infinite' : ''}">🎵</div>`;
    o += `<div style="flex:1;min-width:0">`;
    o += `<div style="font-size:12px;font-weight:700;color:${t.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${_esc(song.name)}</div>`;
    o += `<div style="font-size:9px;color:${t.textDim};margin-top:1px">${_esc(song.artist)}</div>`;
    if (hasPlaylist) o += `<div style="font-size:7px;color:${t.textMuted};margin-top:1px">${_radioPlaylistIndex + 1}/${_radioPlaylist.length} 首</div>`;
    o += `</div>`;
    o += `<span class="ax-radio-fav-btn" style="cursor:pointer;font-size:16px">${isFav ? '❤️' : '🤍'}</span>`;
    o += `</div>`;

    // 歌词显示
    o += `<div style="text-align:center;padding:8px 4px;min-height:44px">`;
    o += `<div id="ax-lyric-current" style="font-size:13px;font-weight:600;color:${t.text};transition:all .3s;min-height:18px">♪</div>`;
    o += `<div id="ax-lyric-next" style="font-size:10px;color:${t.textMuted};opacity:.6;margin-top:3px;min-height:14px"></div>`;
    o += `</div>`;

    // 进度条
    o += `<div style="margin:4px 0">`;
    o += `<div style="height:3px;background:${t.trackBg};border-radius:2px;overflow:hidden;cursor:pointer" id="ax-radio-progress-bar">`;
    o += `<div id="ax-radio-progress-fill" style="height:100%;width:0%;background:${t.primary};border-radius:2px;transition:width .3s"></div>`;
    o += `</div>`;
    o += `<div id="ax-radio-time" style="font-size:7px;color:${t.textMuted};text-align:center;margin-top:2px;font-family:'Courier New',monospace">00:00 / 00:00</div>`;
    o += `</div>`;

    // 控制按钮
    o += `<div style="display:flex;align-items:center;justify-content:center;gap:14px;padding:4px 0">`;
    o += `<span id="ax-radio-shuffle" style="cursor:pointer;font-size:14px;transition:transform .15s;opacity:${_radioShuffle ? '1' : '.4'}" title="随机播放">${shuffleIcon}</span>`;
    o += `<span id="ax-radio-prev" style="cursor:pointer;font-size:16px;transition:transform .15s;opacity:${hasPlaylist ? '1' : '.3'}" title="上一首">⏮</span>`;
    o += `<span id="ax-radio-playpause" style="cursor:pointer;font-size:24px;transition:transform .15s" title="${isPlaying ? '暂停' : '播放'}">${isPlaying ? '⏸' : '▶️'}</span>`;
    o += `<span id="ax-radio-next" style="cursor:pointer;font-size:16px;transition:transform .15s;opacity:${hasPlaylist ? '1' : '.3'}" title="下一首">⏭</span>`;
    o += `<span id="ax-radio-repeat" style="cursor:pointer;font-size:14px;transition:transform .15s;opacity:${_radioRepeat !== 'none' ? '1' : '.4'}" title="循环模式">${repeatIcon}</span>`;
    o += `</div>`;

    // 音量控制
    o += `<div style="display:flex;align-items:center;gap:6px;padding:4px 8px;margin-top:2px">`;
    o += `<span style="font-size:10px">🔊</span>`;
    o += `<input type="range" min="0" max="100" value="${_radioVolume}" id="ax-radio-volume" style="flex:1;height:4px;cursor:pointer;accent-color:${t.primary}">`;
    o += `<span id="ax-radio-vol-label" style="font-size:8px;color:${t.textMuted};min-width:22px;text-align:right">${_radioVolume}%</span>`;
    o += `</div>`;

    o += `</div>`;
    $player.html(o);

    // 事件绑定
    $player.find('#ax-radio-playpause').on('click', function () {
      const a = _getRadioAudio();
      if (a.paused) { a.play().catch(() => { }); _radioPlaying = true; $(this).text('⏸'); _startLyricUpdater(); }
      else { a.pause(); _radioPlaying = false; $(this).text('▶️'); }
      _updateChrome();
    });
    $player.find('#ax-radio-prev').on('click', () => _playPrev());
    $player.find('#ax-radio-next').on('click', () => _playNext());
    $player.find('#ax-radio-shuffle').on('click', function () {
      _radioShuffle = !_radioShuffle;
      $(this).css('opacity', _radioShuffle ? '1' : '.4').text(_radioShuffle ? '🔀' : '➡️');
      if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=info ${_radioShuffle ? '随机播放已开启' : '随机播放已关闭'}`);
    });
    $player.find('#ax-radio-repeat').on('click', function () {
      if (_radioRepeat === 'none') _radioRepeat = 'all';
      else if (_radioRepeat === 'all') _radioRepeat = 'one';
      else _radioRepeat = 'none';
      const icons = { none: '↩️', all: '🔁', one: '🔂' };
      const labels = { none: '不循环', all: '列表循环', one: '单曲循环' };
      $(this).css('opacity', _radioRepeat !== 'none' ? '1' : '.4').text(icons[_radioRepeat]);
      if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=info ${labels[_radioRepeat]}`);
    });
    $player.find('#ax-radio-volume').on('input', function () {
      _radioVolume = parseInt($(this).val());
      _getRadioAudio().volume = _radioVolume / 100;
      $('#ax-radio-vol-label').text(_radioVolume + '%');
    });
    $player.find('.ax-radio-fav-btn').on('click', function () {
      if (_radioCurrentSong) {
        const added = _toggleFavorite(_radioCurrentSong);
        $(this).text(added ? '❤️' : '🤍');
        if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=${added ? 'success' : 'info'} ${added ? '已收藏' : '已取消收藏'}`);
      }
    });
    $player.find('#ax-radio-progress-bar').on('click', function (e) {
      const a = _getRadioAudio();
      if (!a.duration) return;
      const rect = this.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      a.currentTime = pct * a.duration;
    });
  }

  /* ═══════════════════════════════════════
     📋 深渊论坛系统（UI层）
     ═══════════════════════════════════════ */

  function _drawForum($c) {
    // 如果正在查看某个帖子
    if (_forumCurrentPost) {
      _drawForumPostDetail($c, _forumCurrentPost);
      return;
    }
    // 否则显示论坛主页
    _drawForumHome($c);
  }

  function _drawForumHome($c) {
    const t = _t();
    const posts = _loadForumPosts();
    const hasApi = !!_getAuxApi();

    let o = '';

    // 论坛标题栏
    o += `<div style="display:flex;align-items:center;gap:8px;padding:8px 4px;margin-bottom:6px">`;
    o += `<span style="font-size:16px">📋</span>`;
    o += `<span style="font-size:12px;font-weight:700;color:${t.text};letter-spacing:1px">深渊论坛</span>`;
    o += `<span style="margin-left:auto"></span>`;
    o += `<button class="ax-api-btn" id="ax-forum-accounts" style="font-size:8px">👤 账号</button>`;
    o += `<button class="ax-api-btn" id="ax-forum-new-post" style="font-size:8px">✏️ 发帖</button>`;
    o += `</div>`;

    // 板块切换
    o += '<div style="display:flex;gap:0;overflow-x:auto;border-bottom:1px solid ' + t.divider + ';margin-bottom:6px;scrollbar-width:none">';
    for (const sec of FORUM_SECTIONS) {
      const isActive = _forumCurrentSection === sec.id;
      o += `<div class="ax-bag-tab${isActive ? ' on' : ''}" data-fsec="${sec.id}" style="white-space:nowrap">${sec.icon} ${sec.name}</div>`;
    }
    o += '</div>';

    // AI生成帖子按钮
    o += `<div style="display:flex;gap:4px;margin-bottom:6px">`;
    o += `<button class="ax-dlg-btn ax-dlg-ok" id="ax-forum-gen-posts" style="flex:1;text-align:center;font-size:9px" ${hasApi ? '' : 'disabled'}>✨ 刷新帖子（AI生成）</button>`;
    o += `<button class="ax-dlg-btn ax-dlg-cancel" id="ax-forum-clear" style="flex-shrink:0;font-size:9px">🗑️</button>`;
    o += `</div>`;

    // 帖子列表
    const sectionPosts = posts.filter(p => p.section === _forumCurrentSection);
    if (!sectionPosts.length) {
      o += `<div style="text-align:center;padding:30px;color:${t.textMuted};font-size:10px;font-style:italic">这个板块还没有帖子<br>点击上方按钮生成一些吧</div>`;
    } else {
      o += '<div id="ax-forum-post-list">';
      for (const post of sectionPosts) {
        const replyCount = post.replies ? post.replies.length : 0;
        const timeAgo = _formatTimeAgo(post.ts);
        const isPinned = post.pinned;

        o += `<div class="ax-forum-post-item" data-post-id="${post.id}" style="padding:10px 8px;border-bottom:1px solid ${t.divider};cursor:pointer;transition:background .15s">`;
        if (isPinned) o += `<span style="font-size:7px;color:${t.accent};background:rgba(${t.accentRgb},.1);padding:1px 5px;border-radius:3px;margin-right:4px">置顶</span>`;
        o += `<div style="font-size:11px;font-weight:600;color:${t.text};line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${_esc(post.title)}</div>`;
        o += `<div style="display:flex;align-items:center;gap:8px;margin-top:4px;font-size:8px;color:${t.textMuted}">`;
        o += `<span>${_esc(post.author)}</span>`;
        o += `<span>💬 ${replyCount}</span>`;
        o += `<span>👁 ${post.views || 0}</span>`;
        o += `<span>❤ ${post.likes || 0}</span>`;
        o += `<span style="margin-left:auto">${timeAgo}</span>`;
        o += `</div>`;
        o += `</div>`;
      }
      o += '</div>';
    }

    $c.html(o);

    // 事件绑定
    // 板块切换
    $c.find('[data-fsec]').on('click', function () {
      _forumCurrentSection = $(this).data('fsec');
      _drawForum($c);
    });

    // 点击帖子
    $c.find('.ax-forum-post-item').on('click', function () {
      const postId = $(this).data('post-id');
      _forumCurrentPost = postId;
      _drawForum($c);
    });

    // AI生成帖子
    $c.find('#ax-forum-gen-posts').on('click', () => _generateForumPosts($c));

    // 清空帖子
    $c.find('#ax-forum-clear').on('click', () => {
      const w = _dialog(`<div class="ax-dlg-h">🗑️ 清空帖子</div><div class="ax-dlg-sub">清空当前板块的所有帖子？</div><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-fc-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-fc-yes" style="color:${t.fail}">清空</button></div>`);
      $('#ax-fc-no').on('click', () => w.remove());
      $('#ax-fc-yes').on('click', () => {
        let list = _loadForumPosts();
        list = list.filter(p => p.section !== _forumCurrentSection);
        _saveForumPosts(list);
        w.remove();
        _drawForum($c);
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 已清空当前板块');
      });
    });

    // 发帖
    $c.find('#ax-forum-new-post').on('click', () => _showNewPostDialog($c));

    // 账号管理
    $c.find('#ax-forum-accounts').on('click', () => _showForumAccountManager($c));
  }
  function _drawForumPostDetail($c, postId) {
    const t = _t();
    const post = _getForumPost(postId);
    if (!post) {
      _forumCurrentPost = null;
      _drawForum($c);
      return;
    }

    const hasApi = !!_getAuxApi();
    const section = FORUM_SECTIONS.find(s => s.id === post.section);
    const sectionName = section ? section.name : '未知板块';

    let o = '';

    // 返回按钮和标题
    o += `<div style="display:flex;align-items:center;gap:6px;padding:6px 0;margin-bottom:6px;border-bottom:1px solid ${t.divider}">`;
    o += `<span id="ax-forum-back" style="cursor:pointer;font-size:16px;color:${t.primary};padding:0 4px;transition:transform .15s">‹</span>`;
    o += `<span style="font-size:8px;color:${t.textMuted}">${_esc(sectionName)}</span>`;
    o += `<span style="margin-left:auto"></span>`;
    o += `<span style="font-size:8px;color:${t.textMuted}">👁 ${post.views || 0} · ❤ ${post.likes || 0}</span>`;
    o += `</div>`;

    // 帖子标题
    o += `<div style="font-size:13px;font-weight:700;color:${t.text};line-height:1.5;padding:0 4px;margin-bottom:8px">${_esc(post.title)}</div>`;

    // 楼主信息和正文
    o += `<div style="padding:10px;background:${t.surfaceHover};border-radius:12px;margin-bottom:6px;border-left:3px solid ${t.primary}">`;
    o += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">`;
    o += `<span style="font-size:10px;font-weight:600;color:${t.primary}">${_esc(post.author)}</span>`;
    o += `<span style="font-size:7px;color:${t.textMuted};background:${t.surfaceActive};padding:1px 5px;border-radius:3px">楼主 · 1楼</span>`;
    o += `<span style="font-size:7px;color:${t.textMuted};margin-left:auto">${_formatTimeAgo(post.ts)}</span>`;
    o += `</div>`;
    o += `<div style="font-size:10px;color:${t.text};line-height:1.7;white-space:pre-wrap">${_esc(post.content)}</div>`;
    o += `</div>`;

    // 回帖列表
    if (post.replies && post.replies.length) {
      o += `<div style="font-size:9px;color:${t.textDim};padding:4px 0;margin-bottom:4px;letter-spacing:1px">── 回帖 (${post.replies.length}) ──</div>`;
      for (const reply of post.replies) {
        const isOp = reply.authorId === post.authorId;
        o += `<div style="padding:8px;border-bottom:1px solid ${t.divider};${isOp ? 'border-left:2px solid rgba(' + t.primaryRgb + ',.3);' : ''}">`;
        o += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">`;
        o += `<span style="font-size:9px;font-weight:500;color:${isOp ? t.primary : t.textDim}">${_esc(reply.author)}</span>`;
        if (isOp) o += `<span style="font-size:6px;color:${t.primary};background:rgba(${t.primaryRgb},.1);padding:1px 4px;border-radius:3px">楼主</span>`;
        o += `<span style="font-size:7px;color:${t.textMuted}">${reply.floor}楼</span>`;
        o += `<span style="font-size:7px;color:${t.textMuted};margin-left:auto">${_formatTimeAgo(reply.ts)}</span>`;
        o += `</div>`;
        o += `<div style="font-size:9px;color:${t.text};line-height:1.6;white-space:pre-wrap">${_esc(reply.content)}</div>`;
        o += `</div>`;
      }
    } else {
      o += `<div style="text-align:center;padding:16px;color:${t.textMuted};font-size:9px;font-style:italic">还没有回帖，来抢沙发吧</div>`;
    }

    // 加载更多回帖按钮
    o += `<div style="display:flex;gap:4px;margin:8px 0">`;
    o += `<button class="ax-dlg-btn ax-dlg-ok" id="ax-forum-gen-replies" style="flex:1;text-align:center;font-size:9px" ${hasApi ? '' : 'disabled'}>✨ 加载更多回帖（AI生成）</button>`;
    o += `</div>`;

    // 回复输入区
    o += `<div style="padding:8px 0;border-top:1px solid ${t.divider};margin-top:4px">`;
    // 账号选择
    const accounts = _getForumAllAccounts();
    const selectedAcc = _forumSelectedAccount || accounts[0].id;
    const currentAcc = accounts.find(a => a.id === selectedAcc) || accounts[0];
    o += `<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px">`;
    o += `<span style="font-size:8px;color:${t.textMuted}">身份：</span>`;
    o += `<select class="ax-model-select" id="ax-forum-reply-account" style="font-size:9px;padding:3px 6px;flex:1">`;
    for (const acc of accounts) {
      o += `<option value="${acc.id}" ${acc.id === selectedAcc ? 'selected' : ''}>${_esc(acc.name)}${acc.isMain ? '（主号）' : '（小号）'}</option>`;
    }
    o += `</select>`;
    o += `</div>`;
    o += `<div style="display:flex;gap:4px">`;
    o += `<textarea class="ax-chat-input" id="ax-forum-reply-input" placeholder="写下你的回复" rows="2" style="flex:1;font-size:10px;min-height:36px;max-height:60px"></textarea>`;
    o += `<button class="ax-chat-send" id="ax-forum-reply-send" style="align-self:flex-end">↑</button>`;
    o += `</div>`;
    o += `</div>`;

    // 点赞和删除按钮
    o += `<div style="display:flex;gap:4px;margin-top:6px">`;
    o += `<button class="ax-api-btn" id="ax-forum-like-post" style="flex:1;text-align:center;font-size:9px">❤ 点赞 (${post.likes || 0})</button>`;
    o += `<button class="ax-api-btn danger" id="ax-forum-del-post" style="font-size:9px">删除帖子</button>`;
    o += `</div>`;

    $c.html(o);

    // 事件绑定
    // 返回
    $c.find('#ax-forum-back').on('click', () => {
      _forumCurrentPost = null;
      _drawForum($c);
    });

    // 账号选择
    $c.find('#ax-forum-reply-account').on('change', function () {
      _forumSelectedAccount = $(this).val();
    });

    // 发送回复
    $c.find('#ax-forum-reply-send').on('click', () => {
      const content = $('#ax-forum-reply-input').val().trim();
      if (!content) {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 回复内容不能为空');
        return;
      }
      const accId = $('#ax-forum-reply-account').val();
      const acc = _getForumAllAccounts().find(a => a.id === accId) || _getForumMainAccount();

      _addForumReply(postId, {
        author: acc.name,
        authorId: accId,
        content: content
      });

      _drawForumPostDetail($c, postId);
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 回复已发布');
    });

    // AI生成更多回帖
    $c.find('#ax-forum-gen-replies').on('click', () => _generateForumReplies($c, postId));

    // 点赞
    $c.find('#ax-forum-like-post').on('click', () => {
      _likeForumPost(postId);
      _drawForumPostDetail($c, postId);
    });

    // 删除帖子
    $c.find('#ax-forum-del-post').on('click', () => {
      const w = _dialog(`<div class="ax-dlg-h">删除帖子</div><div class="ax-dlg-sub">确定删除这个帖子和所有回帖？</div><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-fd-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-fd-yes" style="color:${t.fail}">删除</button></div>`);
      $('#ax-fd-no').on('click', () => w.remove());
      $('#ax-fd-yes').on('click', () => {
        _deleteForumPost(postId);
        _forumCurrentPost = null;
        w.remove();
        _drawForum($c);
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 帖子已删除');
      });
    });
  }
  function _showNewPostDialog($c) {
    const t = _t();
    const accounts = _getForumAllAccounts();
    const hasApi = !!_getAuxApi();

    let accOptions = '';
    for (const acc of accounts) {
      accOptions += `<option value="${acc.id}">${_esc(acc.name)}${acc.isMain ? '（主号）' : '（小号）'}</option>`;
    }

    let secOptions = '';
    for (const sec of FORUM_SECTIONS) {
      secOptions += `<option value="${sec.id}" ${sec.id === _forumCurrentSection ? 'selected' : ''}>${sec.icon} ${sec.name}</option>`;
    }

    const w = _dialog(
      '<div class="ax-dlg-h">✏️ 发新帖</div>' +
      '<div class="ax-api-form">' +
      '<label>板块</label>' +
      '<select class="ax-model-select" id="ax-np-section">' + secOptions + '</select>' +
      '<label>发帖身份</label>' +
      '<select class="ax-model-select" id="ax-np-account">' + accOptions + '</select>' +
      '<label>帖子标题</label>' +
      '<input id="ax-np-title" type="text" placeholder="写个吸引眼球的标题…" maxlength="50">' +
      '<label>帖子内容</label>' +
      '<textarea id="ax-np-content" placeholder="写点什么…" style="min-height:80px;max-height:150px;resize:vertical"></textarea>' +
      '</div>' +
      (hasApi ? '<div style="margin-top:4px"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-np-ai" style="width:100%;text-align:center">✨ AI帮我写</button></div>' : '') +
      '<div class="ax-dlg-err" id="ax-np-err"></div>' +
      '<div class="ax-dlg-actions">' +
      '<button class="ax-dlg-btn ax-dlg-cancel" id="ax-np-cancel">取消</button>' +
      '<button class="ax-dlg-btn ax-dlg-ok" id="ax-np-submit">发布</button>' +
      '</div>'
    );

    // 发布
    w.find('#ax-np-submit').on('click', () => {
      const title = $('#ax-np-title').val().trim();
      const content = $('#ax-np-content').val().trim();
      const section = $('#ax-np-section').val();
      const accId = $('#ax-np-account').val();
      const acc = _getForumAllAccounts().find(a => a.id === accId) || _getForumMainAccount();

      if (!title) { $('#ax-np-err').text('标题不能为空'); return; }
      if (!content) { $('#ax-np-err').text('内容不能为空'); return; }

      _addForumPost({
        section: section,
        title: title,
        author: acc.name,
        authorId: accId,
        content: content
      });

      _forumCurrentSection = section;
      w.remove();
      _drawForum($c);
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 帖子已发布');
    });

    // AI帮写
    if (hasApi) {
      w.find('#ax-np-ai').on('click', async function () {
        const $btn = $(this);
        const section = $('#ax-np-section').val();
        const sec = FORUM_SECTIONS.find(s => s.id === section);
        $btn.prop('disabled', true).text('AI思考中…');

        try {
          const context = _getContextSummary();
          const msgs = [
            {
              role: 'system',
              content: `你是一个游戏论坛的帖子生成器。玩家想在"${sec ? sec.name : '水贴版'}"板块发一个帖子，请帮他生成标题和内容。

当前世界信息：
${context.slice(0, 2000)}

板块说明：${sec ? sec.desc : '灌水吹牛聊天摸鱼'}

要求：
1. 帖子要符合游戏世界观（深渊炼狱/恐怖生存）
2. 内容要有趣、真实感强，像真人发帖
3. 可以是求助、吐槽、分享经历、提问、炫耀等
4. 内容100-300字，语气随意自然
5. 只输出JSON格式：{"title":"帖子标题","content":"帖子正文内容"}`
            },
            { role: 'user', content: '帮我写一个帖子' }
          ];

          const reply = await _callApi(msgs, { temperature: 0.95, max_tokens: 500 });
          const data = _safeParseJsonObject(reply);
          if (data && data.title) {
            $('#ax-np-title').val(String(data.title).slice(0, 50));
            $('#ax-np-content').val(String(data.content || '').slice(0, 1000));
          }
        } catch (e) {
          if (typeof triggerSlash === 'function') triggerSlash('/echo severity=error AI写帖失败：' + (e.message || '未知'));
        }
        $btn.prop('disabled', false).text('✨ AI帮我写');
      });
    }

    w.find('#ax-np-cancel').on('click', () => w.remove());
  }
  function _showForumAccountManager($c) {
    const t = _t();
    const acc = _loadForumAccounts();
    const allAccounts = [acc.main, ...acc.alts];

    let o = '<div class="ax-dlg-h">👤 论坛账号管理</div>';
    o += '<div class="ax-dlg-sub">主号和小号，用不同身份水贴更有趣</div>';

    // 账号列表
    for (const a of allAccounts) {
      o += `<div style="display:flex;align-items:center;gap:8px;padding:6px;border-radius:8px;margin-bottom:3px;background:${t.surfaceHover}">`;
      o += `<span style="font-size:14px">${a.isMain ? '👤' : '🎭'}</span>`;
      o += `<div style="flex:1;min-width:0"><div style="font-size:10px;color:${t.text};font-weight:500">${_esc(a.name)}</div><div style="font-size:7px;color:${t.textMuted}">${a.isMain ? '主号' : '小号'} · ${a.id}</div></div>`;
      o += `<button class="ax-api-btn ax-forum-rename-acc" data-acc-id="${a.id}" style="font-size:8px">改名</button>`;
      if (!a.isMain) o += `<button class="ax-api-btn danger ax-forum-del-acc" data-acc-id="${a.id}" style="font-size:8px">删除</button>`;
      o += `</div>`;
    }

    // 添加小号
    o += '<div style="display:flex;gap:4px;margin-top:8px">';
    o += `<input class="ax-dlg-input" id="ax-fa-new-name" type="text" placeholder="输入小号昵称…" maxlength="15" style="flex:1;font-size:10px">`;
    o += '<button class="ax-dlg-btn ax-dlg-ok" id="ax-fa-add" style="flex-shrink:0">添加小号</button>';
    o += '</div>';

    // 随机名字按钮
    o += `<div style="margin-top:4px"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-fa-random" style="width:100%;text-align:center;font-size:9px">🎲 随机生成网名</button></div>`;

    o += '<div class="ax-dlg-err" id="ax-fa-err"></div>';
    o += '<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-fa-close">关闭</button></div>';

    const w = _dialog(o);

    // 添加小号
    w.find('#ax-fa-add').on('click', () => {
      const name = $('#ax-fa-new-name').val().trim();
      if (!name) { $('#ax-fa-err').text('请输入昵称'); return; }
      _addForumAlt(name);
      w.remove();
      _showForumAccountManager($c);
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 小号已添加：' + name);
    });

    // 随机名字
    w.find('#ax-fa-random').on('click', () => {
      const name = FORUM_NAME_POOL[Math.floor(Math.random() * FORUM_NAME_POOL.length)];
      $('#ax-fa-new-name').val(name);
    });

    // 改名
    w.find('.ax-forum-rename-acc').on('click', function () {
      const accId = $(this).data('acc-id');
      const acc2 = allAccounts.find(a => a.id === accId);
      const w2 = _dialog(`<div class="ax-dlg-h">✎ 修改昵称</div><input class="ax-dlg-input" id="ax-fa-rn" type="text" value="${_esc(acc2 ? acc2.name : '')}" maxlength="15"><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-farn-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-farn-yes">确认</button></div>`);
      $('#ax-farn-no').on('click', () => w2.remove());
      $('#ax-farn-yes').on('click', () => {
        const newName = $('#ax-fa-rn').val().trim();
        if (newName) { _renameForumAccount(accId, newName); w2.remove(); w.remove(); _showForumAccountManager($c); }
      });
    });

    // 删除小号
    w.find('.ax-forum-del-acc').on('click', function () {
      _removeForumAlt($(this).data('acc-id'));
      w.remove();
      _showForumAccountManager($c);
    });

    w.find('#ax-fa-close').on('click', () => w.remove());
  }
  async function _generateForumPosts($c) {
    if (_forumGenerating) return;
    const api = _getAuxApi();
    if (!api) {
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 请先配置API接口');
      return;
    }

    _forumGenerating = true;
    if (typeof triggerSlash === 'function') triggerSlash('/echo severity=info 正在生成帖子…');

    const sec = FORUM_SECTIONS.find(s => s.id === _forumCurrentSection);
    const context = _getContextSummary();
    const existingTitles = _loadForumPosts().filter(p => p.section === _forumCurrentSection).map(p => p.title).slice(0, 10);

    try {
      const msgs = [
        {
          role: 'system',
          content: `你是一个游戏论坛的内容生成器。请为"${sec ? sec.name : '水贴版'}"板块生成3-5个不同的帖子。

板块说明：${sec ? sec.desc : '灌水吹牛聊天摸鱼'}

当前世界信息：
${context.slice(0, 3000)}

已有帖子标题（不要重复）：${existingTitles.join('、') || '无'}

要求：
1. 每个帖子由不同的虚构网友发出，网名要有趣、有个性
2. 帖子内容要符合游戏世界观（深渊炼狱/恐怖生存主题）
3. 内容丰富有趣，每个帖子正文200-500字，像真实论坛帖子
4. 包含不同类型的帖子：求助、吐槽、分享、讨论、炫耀、科普等
5. 帖子内容可以提到游戏内的NPC、地点、副本、事件等
6. 如果当前有最新剧情发生，可以有帖子讨论这些剧情事件
7. 每个帖子可以附带1-3个精彩的回帖（不同网友），回帖也要有趣、有个性
8. 严格按以下JSON数组格式输出，只输出JSON：
[{
  "title": "帖子标题",
  "author": "发帖人网名",
  "content": "帖子正文（200-500字，可以有换行）",
  "replies": [
    {"author": "回帖人网名", "content": "回帖内容（20-150字）"},
    {"author": "另一个网名", "content": "另一条回帖"}
  ]
}]

9. 示例风格参考：
- 求助帖："救命！我的新队友好像有那个大病，他把罪孽祭坛给搬空了！"
- 吐槽帖："猎人公会的食堂是不是被诅咒了？我吃了三天拉了三天"
- 分享帖："分享一下我在A级副本'沉默回廊'的通关心得，全是干货"
- 讨论帖："有没有人觉得最近深渊的雾越来越浓了？这是不是什么征兆？"
- 搞笑帖："今天在副本里被队友的召唤兽外卖砸死了，我该怎么维权"`
        },
        { role: 'user', content: '请生成帖子' }
      ];

      const reply = await _callAuxApi(msgs, { temperature: 0.95, max_tokens: 4500 });

      let postsData;
      try {
        postsData = _safeParseJsonArray(reply);
      } catch (e) {
        console.warn('[Abyss Forum] Parse fail:', e, reply);
        throw new Error('帖子数据解析失败');
      }

      let addedCount = 0;
      for (const pd of postsData) {
        if (!pd || !pd.title || !pd.content) continue;

        const post = {
          section: _forumCurrentSection,
          title: String(pd.title).trim().slice(0, 80),
          author: String(pd.author || FORUM_NAME_POOL[Math.floor(Math.random() * FORUM_NAME_POOL.length)]).trim().slice(0, 20),
          authorId: 'npc_' + Math.random().toString(36).slice(2, 8),
          content: String(pd.content).trim().slice(0, 2000),
          replies: []
        };

        // 处理回帖
        if (pd.replies && Array.isArray(pd.replies)) {
          for (let ri = 0; ri < pd.replies.length; ri++) {
            const r = pd.replies[ri];
            if (r && r.content) {
              post.replies.push({
                author: String(r.author || FORUM_NAME_POOL[Math.floor(Math.random() * FORUM_NAME_POOL.length)]).trim().slice(0, 20),
                authorId: 'npc_' + Math.random().toString(36).slice(2, 8),
                content: String(r.content).trim().slice(0, 500),
                floor: ri + 2,
                ts: Date.now() - Math.floor(Math.random() * 3600000)
              });
            }
          }
        }

        _addForumPost(post);
        addedCount++;
      }

      if (addedCount > 0) {
        if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success 已生成 ${addedCount} 个新帖子！`);
      } else {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=info 没有生成新帖子，请重试');
      }

    } catch (e) {
      console.warn('[Abyss Forum] Gen posts fail:', e);
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=error 帖子生成失败：' + (e.message || '未知'));
    }

    _forumGenerating = false;
    _drawForum($c);
  }
  async function _generateForumReplies($c, postId) {
    if (_forumGenerating) return;
    const api = _getAuxApi();
    if (!api) {
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 请先配置API接口');
      return;
    }

    const post = _getForumPost(postId);
    if (!post) return;

    _forumGenerating = true;
    if (typeof triggerSlash === 'function') triggerSlash('/echo severity=info 正在生成回帖…');

    const context = _getContextSummary();
    const existingReplies = post.replies.map(r => `${r.author}：${r.content.slice(0, 50)}`).join('\n');
    const nextFloor = (post.replies.length || 0) + 2;

    try {
      const msgs = [
        {
          role: 'system',
          content: `你是一个游戏论坛的回帖生成器。以下是一个帖子，请为它生成4-8条新的回帖。

帖子标题：${post.title}
帖子作者：${post.author}
帖子内容：
${post.content}

已有回帖：
${existingReplies || '暂无'}

下一个楼层号从 ${nextFloor} 开始。

当前世界信息：
${context.slice(0, 2000)}

要求：
1. 每条回帖由不同的虚构网友发出，网名要有趣
2. 回帖要自然、有趣，像真实论坛的回帖
3. 可以包含：认真回复、吐槽、跑题、玩梗、杠精、热心网友、搞笑评论等
4. 有的回帖可以回复之前楼层的内容（引用格式用"回复X楼："开头）
5. 也可以有帖子作者（楼主）来回复的情况
6. 回帖长度参差不齐：短的10-30字，长的50-200字
7. 如果帖子内容和当前剧情相关，回帖可以讨论剧情
8. 严格按以下JSON数组格式输出：
[{"author":"网名","content":"回帖内容","isOp":false}]
isOp为true表示是楼主回复

9. 回帖风格参考：
- 热心回复："我之前也遇到过这种情况，你可以试试……"
- 吐槽型："笑死，你这队友怕不是从精神病院出来的吧"
- 跑题型："说起来你们有没有发现最近食堂的饭越来越难吃了"
- 杠精型："楼主说的不对，其实这个机制是这样的……"
- 表情型："哈哈哈哈哈哈哈哈哈哈（笑到打滚）"
- 引用型："回复3楼：你说的那个方法我试了，差点没死在里面"`
        },
        { role: 'user', content: '请生成回帖' }
      ];

      const reply = await _callAuxApi(msgs, { temperature: 0.95, max_tokens: 2500 });

      let repliesData;
      try {
        repliesData = _safeParseJsonArray(reply);
      } catch (e) {
        throw new Error('回帖数据解析失败');
      }

      let addedCount = 0;
      for (const rd of repliesData) {
        if (!rd || !rd.content) continue;

        const isOp = rd.isOp === true;
        _addForumReply(postId, {
          author: isOp ? post.author : String(rd.author || FORUM_NAME_POOL[Math.floor(Math.random() * FORUM_NAME_POOL.length)]).trim().slice(0, 20),
          authorId: isOp ? post.authorId : ('npc_' + Math.random().toString(36).slice(2, 8)),
          content: String(rd.content).trim().slice(0, 500)
        });
        addedCount++;
      }

      if (addedCount > 0) {
        if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success 已生成 ${addedCount} 条新回帖！`);
      }

    } catch (e) {
      console.warn('[Abyss Forum] Gen replies fail:', e);
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=error 回帖生成失败：' + (e.message || '未知'));
    }

    _forumGenerating = false;
    _drawForumPostDetail($c, postId);
  }

  /* ═══════════════════════════════════════
     📝 备忘录界面
     ═══════════════════════════════════════ */
  function _drawNotes($c) {
    if (_notesCurrentNote) {
      _drawNoteDetail($c, _notesCurrentNote);
      return;
    }
    _drawNotesList($c);
  }

  function _drawNotesList($c) {
    const t = _t();
    const notes = _loadNotes();
    const q = _notesSearchQuery.toLowerCase();
    const filtered = q ? notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || (n.tags || []).some(tg => tg.toLowerCase().includes(q))) : notes;

    // 置顶排序
    const sorted = [...filtered].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (b.updatedTs || b.ts) - (a.updatedTs || a.ts);
    });

    let o = '';

    // 搜索栏
    o += `<div style="display:flex;gap:4px;margin-bottom:8px">`;
    o += `<input class="ax-dlg-input" id="ax-notes-search" type="text" placeholder="🔍 搜索笔记…" value="${_esc(_notesSearchQuery)}" style="font-size:10px;padding:6px 10px;flex:1">`;
    o += `<button class="ax-dlg-btn ax-dlg-ok" id="ax-notes-new" style="flex-shrink:0">＋ 新建</button>`;
    o += `</div>`;

    // 统计
    o += `<div style="font-size:8px;color:${t.textMuted};margin-bottom:6px;letter-spacing:1px">共 ${notes.length} 篇笔记${q ? '，找到 ' + filtered.length + ' 条' : ''}</div>`;

    if (!sorted.length) {
      o += `<div style="text-align:center;padding:30px;color:${t.textMuted};font-size:10px;font-style:italic">${q ? '没有匹配的笔记' : '还没有笔记<br>点击右上角新建一篇吧'}</div>`;
    } else {
      for (const note of sorted) {
        const preview = (note.content || '').replace(/\n/g, ' ').slice(0, 60);
        const timeAgo = _formatTimeAgo(note.updatedTs || note.ts);
        const tagsStr = (note.tags || []).map(tg => '#' + tg).join(' ');

        o += `<div class="ax-list-item" data-note-id="${note.id}" style="align-items:flex-start">`;
        o += `<div style="font-size:16px;width:28px;text-align:center;flex-shrink:0;margin-top:2px">${note.pinned ? '📌' : '📝'}</div>`;
        o += `<div class="ax-list-body" style="min-width:0">`;
        o += `<div class="ax-list-main" style="font-weight:600">${_esc(note.title)}</div>`;
        if (preview) o += `<div class="ax-list-sub" style="white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${_esc(preview)}</div>`;
        o += `<div style="display:flex;gap:6px;align-items:center;margin-top:2px">`;
        o += `<span style="font-size:7px;color:${t.textMuted}">${timeAgo}</span>`;
        if (tagsStr) o += `<span style="font-size:7px;color:${t.primary};opacity:.7">${_esc(tagsStr)}</span>`;
        o += `</div></div>`;
        o += `<div class="ax-list-end" style="font-size:12px;color:${t.textMuted}">›</div>`;
        o += `</div>`;
      }
    }

    $c.html(o);

    // 事件
    $c.find('.ax-list-item[data-note-id]').on('click', function () {
      _notesCurrentNote = $(this).data('note-id');
      _drawNotes($c);
    });
    $c.find('#ax-notes-new').on('click', () => {
      const id = _addNote('新笔记', '');
      _notesCurrentNote = id;
      _drawNotes($c);
    });
    $c.find('#ax-notes-search').on('input', function () {
      _notesSearchQuery = $(this).val();
      _drawNotesList($c);
    });
  }

  function _drawNoteDetail($c, noteId) {
    const t = _t();
    const note = _getNoteById(noteId);
    if (!note) { _notesCurrentNote = null; _drawNotes($c); return; }

    let o = '';

    // 头部工具栏
    o += `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;margin-bottom:8px;border-bottom:1px solid ${t.divider}">`;
    o += `<span id="ax-note-back" style="cursor:pointer;font-size:16px;color:${t.primary};padding:0 4px">‹</span>`;
    o += `<span style="font-size:9px;color:${t.textMuted};flex:1">${_formatTimeAgo(note.updatedTs || note.ts)}</span>`;
    o += `<button class="ax-api-btn" id="ax-note-pin" style="font-size:8px">${note.pinned ? '📌 取消置顶' : '📌 置顶'}</button>`;
    o += `<button class="ax-api-btn" id="ax-note-tags" style="font-size:8px">🏷️</button>`;
    o += `<button class="ax-api-btn danger" id="ax-note-del" style="font-size:8px">删除</button>`;
    o += `</div>`;

    // 标签显示
    if (note.tags && note.tags.length) {
      o += `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">`;
      for (const tg of note.tags) {
        o += `<span style="font-size:7px;padding:2px 6px;border-radius:4px;background:rgba(${t.primaryRgb},.1);color:${t.primary}">#${_esc(tg)}</span>`;
      }
      o += `</div>`;
    }

    // 标题编辑
    o += `<input class="ax-dlg-input" id="ax-note-title" type="text" value="${_esc(note.title)}" placeholder="笔记标题…" style="font-size:13px;font-weight:700;border:none;background:transparent;padding:4px 0;margin-bottom:4px;color:${t.text}">`;

    // 内容编辑
    o += `<textarea class="ax-dlg-input" id="ax-note-content" placeholder="开始写点什么…" style="flex:1;min-height:200px;max-height:400px;resize:vertical;font-size:10px;line-height:1.7;border:none;background:transparent;padding:4px 0;color:${t.text}">${_esc(note.content)}</textarea>`;

    // AI辅助按钮
    o += `<div style="display:flex;gap:4px;margin-top:6px;padding-top:6px;border-top:1px solid ${t.divider}">`;
    o += `<button class="ax-dlg-btn ax-dlg-cancel" id="ax-note-ai-summary" style="flex:1;text-align:center;font-size:8px">✨ AI总结剧情</button>`;
    o += `<button class="ax-dlg-btn ax-dlg-cancel" id="ax-note-ai-tips" style="flex:1;text-align:center;font-size:8px">💡 AI攻略提示</button>`;
    o += `</div>`;
    o += `<div style="display:flex;gap:4px;margin-top:4px">`;
    o += `<button class="ax-dlg-btn ax-dlg-ok" id="ax-note-sync-wb" style="flex:1;text-align:center;font-size:8px">📋 同步到世界书（让AI记住）</button>`;
    o += `</div>`;

    $c.html(o);

    // 自动保存（输入时）
    let saveTimer = null;
    function autoSave() {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        const title = $('#ax-note-title').val().trim() || '未命名笔记';
        const content = $('#ax-note-content').val();
        _updateNote(noteId, { title, content });
      }, 500);
    }
    $c.find('#ax-note-title').on('input', autoSave);
    $c.find('#ax-note-content').on('input', autoSave);

    // 返回
    $c.find('#ax-note-back').on('click', () => {
      // 保存一次
      const title = $('#ax-note-title').val().trim() || '未命名笔记';
      const content = $('#ax-note-content').val();
      _updateNote(noteId, { title, content });
      _notesCurrentNote = null;
      _drawNotes($c);
    });

    // 置顶
    $c.find('#ax-note-pin').on('click', () => {
      _togglePinNote(noteId);
      _drawNoteDetail($c, noteId);
    });

    // 删除
    $c.find('#ax-note-del').on('click', () => {
      const w = _dialog(`<div class="ax-dlg-h">删除笔记</div><div class="ax-dlg-sub">确定删除"${_esc(note.title)}"？</div><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-nd-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-nd-yes" style="color:${t.fail}">删除</button></div>`);
      $('#ax-nd-no').on('click', () => w.remove());
      $('#ax-nd-yes').on('click', () => {
        _deleteNote(noteId);
        _notesCurrentNote = null;
        w.remove();
        _drawNotes($c);
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 笔记已删除');
      });
    });

    // 标签管理
    $c.find('#ax-note-tags').on('click', () => {
      const currentTags = (note.tags || []).join(', ');
      const w = _dialog(`<div class="ax-dlg-h">🏷️ 编辑标签</div><div class="ax-dlg-sub">多个标签用逗号分隔</div><input class="ax-dlg-input" id="ax-nt-tags" type="text" value="${_esc(currentTags)}" placeholder="如：攻略, 重要, 副本"><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-nt-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-nt-yes">保存</button></div>`);
      $('#ax-nt-no').on('click', () => w.remove());
      $('#ax-nt-yes').on('click', () => {
        const tags = $('#ax-nt-tags').val().split(/[,，]/).map(s => s.trim()).filter(Boolean);
        _updateNote(noteId, { tags });
        w.remove();
        _drawNoteDetail($c, noteId);
      });
    });

    // AI总结剧情
    $c.find('#ax-note-ai-summary').on('click', async function () {
      const $btn = $(this);
      const api = _getAuxApi();
      if (!api) { if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 请先配置API'); return; }
      $btn.prop('disabled', true).text('生成中…');
      try {
        const context = _getContextSummary();
        const msgs = [
          { role: 'system', content: `请根据以下剧情信息，生成一份简洁的剧情总结笔记，重点记录关键事件、人物关系变化和重要发现。用中文，300-500字，条理清晰。\n\n${context.slice(0, 4000)}` },
          { role: 'user', content: '请总结当前剧情' }
        ];
        const reply = await _callApi(msgs, { temperature: 0.7, max_tokens: 3000 });
        const $content = $('#ax-note-content');
        const existing = $content.val();
        $content.val(existing + (existing ? '\n\n--- AI剧情总结 ---\n' : '') + reply);
        autoSave();
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 剧情总结已添加');
      } catch (e) {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=error 生成失败：' + (e.message || ''));
      }
      $btn.prop('disabled', false).text('✨ AI总结剧情');
    });

    // AI攻略提示
    $c.find('#ax-note-ai-tips').on('click', async function () {
      const $btn = $(this);
      const api = _getAuxApi();
      if (!api) { if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 请先配置API'); return; }
      $btn.prop('disabled', true).text('生成中…');
      try {
        const context = _getContextSummary();
        const msgs = [
          { role: 'system', content: `根据以下游戏世界信息和剧情进展，为玩家提供3-5条实用的攻略提示和建议。包括当前应该注意的事项、可能的机会和危险。用中文，简洁实用。\n\n${context.slice(0, 3000)}` },
          { role: 'user', content: '给我一些攻略提示' }
        ];
        const reply = await _callApi(msgs, { temperature: 0.8, max_tokens: 3000 });
        const $content = $('#ax-note-content');
        const existing = $content.val();
        $content.val(existing + (existing ? '\n\n--- AI攻略提示 ---\n' : '') + reply);
        autoSave();
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 攻略提示已添加');
      } catch (e) {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=error 生成失败：' + (e.message || ''));
      }
      $btn.prop('disabled', false).text('💡 AI攻略提示');
    });

    // 同步笔记到世界书
    $c.find('#ax-note-sync-wb').on('click', async function () {
      const $btn = $(this);
      const title = $('#ax-note-title').val().trim() || '未命名笔记';
      const content = $('#ax-note-content').val().trim();

      if (!content) {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 笔记内容为空');
        return;
      }

      // 检查同步配置
      if (!window._abyssChatSyncConfig) {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 未配置世界书同步信息');
        return;
      }

      const cfg = window._abyssChatSyncConfig;

      // 收集所有置顶笔记和当前笔记的内容
      const allNotes = _loadNotes();
      const pinnedNotes = allNotes.filter(n => n.pinned && n.content);
      const currentNote = { title, content };

      let syncContent = '以下是玩家的重要笔记和剧情总结，AI在生成后续剧情时应参考这些内容，确保前后一致：\n\n';

      // 当前笔记
      syncContent += `【${currentNote.title}】\n${currentNote.content.slice(0, 2000)}\n\n`;

      // 置顶笔记
      for (const pn of pinnedNotes) {
        if (pn.id === noteId) continue; // 避免重复
        syncContent += `【${pn.title}】\n${pn.content.slice(0, 1000)}\n\n`;
      }

      if (syncContent.length > 5000) syncContent = syncContent.slice(0, 5000) + '\n…（更多内容省略）';

      // 需要一个专门的世界书条目来存储笔记
      // 使用一个独立的UID，用户需要在世界书中创建
      const noteWbUid = window._abyssNoteSyncUid;
      if (!noteWbUid && noteWbUid !== 0) {
        // 如果没有配置笔记专用条目，弹窗让用户设置
        const t2 = _t();
        const w = _dialog(
          `<div class="ax-dlg-h">📋 设置笔记同步</div>` +
          `<div class="ax-dlg-sub">首次使用需要设置。请在世界书中创建一个空的蓝灯条目，用于存储笔记内容。</div>` +
          `<div class="ax-api-form">` +
          `<label>世界书名称（和聊天同步用同一个）</label>` +
          `<input id="ax-ns-wb" type="text" value="${_esc(cfg.worldBookName)}" placeholder="世界书名称">` +
          `<label>笔记条目的UID（不是聊天条目的UID，需要另建一个）</label>` +
          `<input id="ax-ns-uid" type="number" placeholder="条目UID" min="0">` +
          `</div>` +
          `<div class="ax-dlg-err" id="ax-ns-err"></div>` +
          `<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-ns-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-ns-yes">保存并同步</button></div>`
        );
        w.find('#ax-ns-no').on('click', () => w.remove());
        w.find('#ax-ns-yes').on('click', async () => {
          const wb = $('#ax-ns-wb').val().trim();
          const uid = parseInt($('#ax-ns-uid').val());
          if (!wb) { $('#ax-ns-err').text('请填写世界书名称'); return; }
          if (isNaN(uid)) { $('#ax-ns-err').text('请填写条目UID'); return; }
          window._abyssNoteSyncUid = uid;
          window._abyssNoteSyncWb = wb;
          // 持久化
          try {
            localStorage.setItem('abyss-note-sync-uid', String(uid));
            localStorage.setItem('abyss-note-sync-wb', wb);
          } catch (e) { }
          // 执行同步
          const cmd = `/setentryfield file="${wb}" uid=${uid} field=content ${syncContent.replace(/\|/g, '\\|')}`;
          if (typeof triggerSlash === 'function') {
            await triggerSlash(cmd);
            triggerSlash('/echo severity=success 笔记已同步到世界书！AI现在可以读取这些内容了');
          }
          w.remove();
        });
        return;
      }

      // 已有配置，直接同步
      $btn.prop('disabled', true).text('同步中…');
      const wb = window._abyssNoteSyncWb || cfg.worldBookName;
      const cmd = `/setentryfield file="${wb}" uid=${noteWbUid} field=content ${syncContent.replace(/\|/g, '\\|')}`;
      if (typeof triggerSlash === 'function') {
        await triggerSlash(cmd);
        triggerSlash('/echo severity=success 笔记已同步到世界书！');
      }
      $btn.prop('disabled', false).text('📋 同步到世界书（让AI记住）');
    });
  }
  /* ═══════════════════════════════════════
     📷 相册界面
     ═══════════════════════════════════════ */
  function _drawAlbum($c) {
    if (_albumViewingPhoto) {
      _drawPhotoDetail($c, _albumViewingPhoto);
      return;
    }
    _drawAlbumGrid($c);
  }

  function _drawAlbumGrid($c) {
    const t = _t();
    const photos = _loadAlbum();

    let o = '';

    // 工具栏
    o += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">`;
    o += `<span style="font-size:9px;color:${t.textDim}">${photos.length}/50 张照片</span>`;
    o += `<span style="margin-left:auto"></span>`;
    o += `<button class="ax-api-btn" id="ax-album-add" style="font-size:9px">📷 添加照片</button>`;
    o += `<button class="ax-api-btn" id="ax-album-screenshot" style="font-size:9px">📸 截取聊天</button>`;
    o += `</div>`;

    if (!photos.length) {
      o += `<div style="text-align:center;padding:40px 20px;color:${t.textMuted};font-size:10px;font-style:italic">相册是空的<br><br>📷 "添加照片"从本地导入图片<br>📸 "截取聊天"保存最近的聊天对话</div>`;
    } else {
      // 照片网格
      o += `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px">`;
      for (const photo of photos) {
        o += `<div class="ax-album-thumb" data-photo-id="${photo.id}" style="aspect-ratio:1;border-radius:8px;overflow:hidden;cursor:pointer;position:relative;background:${t.surfaceHover};background-image:url('${photo.dataUrl}');background-size:cover;background-position:center;transition:transform .15s;border:1px solid ${t.border}">`;
        if (photo.caption) {
          o += `<div style="position:absolute;bottom:0;left:0;right:0;padding:3px 6px;background:linear-gradient(transparent,rgba(0,0,0,.6));font-size:7px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${_esc(photo.caption)}</div>`;
        }
        o += `</div>`;
      }
      o += `</div>`;
    }

    $c.html(o);

    // 点击查看大图
    $c.find('.ax-album-thumb').on('click', function () {
      _albumViewingPhoto = $(this).data('photo-id');
      _drawAlbum($c);
    });

    // 添加照片
    $c.find('#ax-album-add').on('click', () => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*';
      inp.onchange = function () {
        const f = this.files[0]; if (!f) return;
        const rd = new FileReader();
        rd.onload = function (e) {
          const img = new Image();
          img.onload = function () {
            let w2 = img.width, h2 = img.height;
            const mx = 400;
            if (w2 > mx || h2 > mx) { const r = Math.min(mx / w2, mx / h2); w2 = Math.round(w2 * r); h2 = Math.round(h2 * r); }
            const cv = document.createElement('canvas'); cv.width = w2; cv.height = h2;
            cv.getContext('2d').drawImage(img, 0, 0, w2, h2);
            const out = cv.toDataURL('image/jpeg', 0.7);
            // 弹出添加说明
            _showAddPhotoDialog(out, $c);
          };
          img.src = e.target.result;
        };
        rd.readAsDataURL(f);
      };
      inp.click();
    });

    // 截取聊天记录
    $c.find('#ax-album-screenshot').on('click', () => _captureChat($c));
  }

  function _showAddPhotoDialog(dataUrl, $parentC) {
    const t = _t();
    const w = _dialog(
      `<div class="ax-dlg-h">📷 添加照片</div>` +
      `<div style="text-align:center;margin:8px 0"><div style="width:120px;height:120px;margin:0 auto;border-radius:10px;background-image:url('${dataUrl}');background-size:cover;background-position:center;border:2px solid ${t.border}"></div></div>` +
      `<div class="ax-api-form"><label>照片说明（可选）</label><input id="ax-ap-caption" type="text" placeholder="写点什么…" maxlength="50"></div>` +
      `<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-ap-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-ap-yes">保存到相册</button></div>`
    );
    w.find('#ax-ap-no').on('click', () => w.remove());
    w.find('#ax-ap-yes').on('click', () => {
      const caption = $('#ax-ap-caption').val().trim();
      _addPhoto(dataUrl, caption);
      w.remove();
      _drawAlbum($parentC);
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 照片已保存到相册');
    });
  }

  function _drawPhotoDetail($c, photoId) {
    const t = _t();
    const photo = _getPhotoById(photoId);
    if (!photo) { _albumViewingPhoto = null; _drawAlbum($c); return; }

    let o = '';

    // 头部
    o += `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;margin-bottom:6px">`;
    o += `<span id="ax-photo-back" style="cursor:pointer;font-size:16px;color:${t.primary};padding:0 4px">‹</span>`;
    o += `<span style="font-size:9px;color:${t.textMuted};flex:1">${_formatTimeAgo(photo.ts)}</span>`;
    o += `<button class="ax-api-btn danger" id="ax-photo-del" style="font-size:8px">删除</button>`;
    o += `</div>`;

    // 大图
    o += `<div style="text-align:center;padding:8px 0">`;
    o += `<img src="${photo.dataUrl}" style="max-width:100%;max-height:300px;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.3)">`;
    o += `</div>`;

    // 说明
    if (photo.caption) {
      o += `<div style="text-align:center;padding:8px;font-size:10px;color:${t.textDim};font-style:italic">${_esc(photo.caption)}</div>`;
    }

    $c.html(o);

    $c.find('#ax-photo-back').on('click', () => { _albumViewingPhoto = null; _drawAlbum($c); });
    $c.find('#ax-photo-del').on('click', () => {
      const w = _dialog(`<div class="ax-dlg-h">删除照片</div><div class="ax-dlg-sub">确定删除这张照片？</div><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-pd-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-pd-yes" style="color:${t.fail}">删除</button></div>`);
      $('#ax-pd-no').on('click', () => w.remove());
      $('#ax-pd-yes').on('click', () => {
        _deletePhoto(photoId);
        _albumViewingPhoto = null;
        w.remove();
        _drawAlbum($c);
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 照片已删除');
      });
    });
  }

  // 截取聊天记录为图片
  function _captureChat($parentC) {
    const t = _t();
    try {
      const lines = [];

      // 策略1：从SillyTavern的DOM中提取最近5条消息
      const mesEls = document.querySelectorAll('.mes');
      const nodes = Array.from(mesEls);
      if (nodes.length > 0) {
        const last5 = nodes.slice(-5);
        for (const mesEl of last5) {
          const isUser = mesEl.classList.contains('user_mes');
          const nameEl = mesEl.querySelector('.name_text');
          const textEl = mesEl.querySelector('.mes_text');
          const name = nameEl ? nameEl.innerText.trim() : (isUser ? '玩家' : '角色');
          let text = '';
          if (textEl) {
            text = textEl.innerText.trim();
            if (!text) text = textEl.textContent.trim();
            // 如果文本仍然为空，尝试获取子元素的文本
            if (!text) {
              const allText = [];
              textEl.querySelectorAll('p, div, span, li').forEach(el => {
                const t2 = el.innerText.trim();
                if (t2 && t2.length > 1) allText.push(t2);
              });
              text = allText.join(' ');
            }
          }
          if (text && text.length >= 2) {
            lines.push({ name, text: text.slice(0, 200), isUser });
          }
        }
      }

      // 策略2：如果DOM提取失败，从手机聊天记录中提取
      if (lines.length === 0) {
        // 优先使用当前正在聊天的NPC
        let targetNpc = _chatTarget;
        // 如果没有正在聊天，找最近的对话
        if (!targetNpc) {
          const convos = _getConversationList();
          if (convos.length > 0) {
            // 找最近有消息的NPC
            const allChats = _loadChats();
            let latestTs = 0;
            for (const name of convos) {
              const chat = allChats[name];
              if (chat && chat.messages && chat.messages.length > 0) {
                const lastMsg = chat.messages[chat.messages.length - 1];
                if (lastMsg.ts && lastMsg.ts > latestTs) {
                  latestTs = lastMsg.ts;
                  targetNpc = name;
                }
              }
            }
          }
        }

        if (targetNpc) {
          const chat = _getChatWith(targetNpc);
          const recentMsgs = (chat.messages || []).slice(-5);
          for (const msg of recentMsgs) {
            const sender = msg.role === 'user' ? '玩家' : targetNpc;
            let content = msg.content;
            // 简化特殊消息格式
            if (content.match(/^\[sticker/)) content = '[表情包]';
            else if (content.match(/^\[transfer/)) content = '[转账]';
            else if (content.match(/^\[gift/)) content = '[礼物]';
            else if (content.match(/^\[music/)) content = '[歌曲分享]';
            else if (content.match(/^\[link/)) content = '[链接分享]';
            else if (content.match(/^\[voice/)) content = '[语音]';
            lines.push({ name: sender, text: content.slice(0, 200), isUser: msg.role === 'user' });
          }
        }
      }

      if (lines.length === 0) {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 没有可截取的内容');
        return;
      }

      // 用Canvas绘制聊天截图
      const cv = document.createElement('canvas');
      const ctx2d = cv.getContext('2d');
      const W = 360, padding = 16, lineH = 16, nameH = 14, bubblePad = 10, bubbleGap = 8;

      let totalH = padding * 2 + 30;
      for (const line of lines) {
        const textLines = Math.ceil(line.text.length / 22);
        totalH += nameH + bubblePad * 2 + textLines * lineH + bubbleGap;
      }
      totalH += padding;

      cv.width = W;
      cv.height = Math.min(totalH, 600);
      ctx2d.fillStyle = '#0d0d14';
      ctx2d.fillRect(0, 0, W, cv.height);

      ctx2d.fillStyle = '#888';
      ctx2d.font = '11px sans-serif';
      ctx2d.textAlign = 'center';
      ctx2d.fillText('📸 聊天截图 · ' + new Date().toLocaleDateString('zh-CN'), W / 2, padding + 12);

      let y = padding + 30;
      for (const line of lines) {
        ctx2d.fillStyle = line.isUser ? '#c83030' : '#8888a0';
        ctx2d.font = 'bold 10px sans-serif';
        ctx2d.textAlign = line.isUser ? 'right' : 'left';
        ctx2d.fillText(line.name, line.isUser ? W - padding : padding, y + 10);
        y += nameH;

        const maxCharsPerLine = 22;
        const textLines2 = [];
        for (let i = 0; i < line.text.length; i += maxCharsPerLine) {
          textLines2.push(line.text.slice(i, i + maxCharsPerLine));
        }
        const bubbleH = textLines2.length * lineH + bubblePad * 2;
        const bubbleW = Math.min(W - padding * 4, 260);
        const bx = line.isUser ? W - padding - bubbleW : padding;

        ctx2d.fillStyle = line.isUser ? 'rgba(200,48,48,0.2)' : 'rgba(255,255,255,0.06)';
        _roundRect(ctx2d, bx, y, bubbleW, bubbleH, 10);
        ctx2d.fill();

        ctx2d.fillStyle = '#e0e0e8';
        ctx2d.font = '10px sans-serif';
        ctx2d.textAlign = 'left';
        for (let li = 0; li < textLines2.length; li++) {
          ctx2d.fillText(textLines2[li], bx + bubblePad, y + bubblePad + 10 + li * lineH);
        }
        y += bubbleH + bubbleGap;
        if (y > cv.height - padding) break;
      }

      const dataUrl = cv.toDataURL('image/png', 0.9);
      _showAddPhotoDialog(dataUrl, $parentC);

    } catch (e) {
      console.error('[Abyss Album] capture fail:', e);
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=error 截取失败：' + (e.message || ''));
    }
  }

  // Canvas圆角矩形辅助函数
  function _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /* ═══════════════════════════════════════
     🗺️ 地图/位置系统
     ═══════════════════════════════════════ */
  const MAP_EXPLORED_KEY = 'abyss-map-explored';
  function _loadExplored() {
    try { const r = localStorage.getItem(MAP_EXPLORED_KEY); if (r) return JSON.parse(r); } catch (e) { }
    return [];
  }
  function _saveExplored(list) {
    try { localStorage.setItem(MAP_EXPLORED_KEY, JSON.stringify(list)); } catch (e) { }
  }
  function _markExplored(locName) {
    const list = _loadExplored();
    if (!list.includes(locName)) { list.push(locName); _saveExplored(list); }
  }

  // 主世界地图节点
  const MAP_NODES_MAIN = [
    { id: 'paradise', name: '极乐幻境', x: 50, y: 15, icon: '🎰', desc: '安全区。赌博、交易、住宿一应俱全，混沌之眼在此维持秩序。舒适是炼狱的陷阱。', connections: ['gamble', 'crimson', 'blackmarket', 'dorm', 'fushengyuan'] },
    { id: 'gamble', name: '赌博区', x: 75, y: 25, icon: '🎲', desc: '幸运大转盘、召唤祭坛所在地。一夜暴富或倾家荡产，全凭运气。', connections: ['paradise', 'altar'] },
    { id: 'crimson', name: '绯红长廊', x: 25, y: 25, icon: '💋', desc: '身体交易场所，可换取钱财。灯红酒绿之下暗藏无数辛酸。', connections: ['paradise'] },
    { id: 'blackmarket', name: '黑市', x: 18, y: 40, icon: '🏪', desc: '买卖各类零食、日用品的地方，价格昂贵。什么都能买到——如果你出得起价。', connections: ['paradise'] },
    { id: 'dorm', name: '普通宿舍', x: 35, y: 35, icon: '🛏️', desc: '逼仄的单人隔间，硬板床、忽明忽灭的灯。潮湿冰冷，隔壁传来灵魂的呢喃与哭泣。', connections: ['paradise'] },
    { id: 'fushengyuan', name: '浮生苑', x: 65, y: 35, icon: '🏯', desc: '高档别墅区，绝对安全。柔软大床、热水淋浴、三餐送达。最接近"活着"的体验——也是炼狱最甜蜜的陷阱。', connections: ['paradise'] },
    { id: 'dock', name: '遗忘码头', x: 50, y: 55, icon: '⚓', desc: '中转站，新人被投放进炼狱时的初始位置。老鬼在此活动，贩卖情报。', connections: ['paradise', 'altar', 'blacklake'] },
    { id: 'altar', name: '罪孽祭坛', x: 70, y: 55, icon: '⛩️', desc: '副本接引处。一片空地上设有四扇门，对应B/A/S/SS四个等级的副本。右边紧挨着赌博区。', connections: ['dock', 'gamble'] },
    { id: 'blacklake', name: '黑湖', x: 50, y: 80, icon: '🌊', desc: 'SSS级副本接引处。需从码头乘船前往，船票1500魂币。打开SSS级副本的唯一场地。', connections: ['dock'] }
  ];

  // 副本地图节点（根据副本名称动态匹配）
  const MAP_NODES_DUNGEONS = {
    //==================== B级副本 ====================

    '无尽冬夜': [
      { id: 'wjdy_1f', name: '一楼大厅', x: 50, y: 85, icon: '🏠', desc: '破旧木屋的一楼。壁炉、长桌、几把椅子，勉强能取暖。', connections: ['wjdy_storage', 'wjdy_kitchen', 'wjdy_2f', 'wjdy_basement'], aliases: ['大厅', '壁炉', '一楼'] },
      { id: 'wjdy_storage', name: '储物间', x: 20, y: 70, icon: '📦', desc: '少量罐头和柴火，物资有限。', connections: ['wjdy_1f'], aliases: ['储物'] },
      { id: 'wjdy_kitchen', name: '厨房', x: 80, y: 70, icon: '🍳', desc: '简陋的木屋厨房，也许能找到些有用的东西。', connections: ['wjdy_1f'], aliases: ['厨房'] },
      { id: 'wjdy_2f', name: '二楼卧室', x: 50, y: 40, icon: '🛏️', desc: '三间卧室和一间浴室。两间双人间、一间单人间。', connections: ['wjdy_1f'], aliases: ['二楼', '卧室', '浴室'] },
      { id: 'wjdy_basement', name: '地下室', x: 50, y: 15, icon: '🔒', desc: '门上挂着生锈的锁，钥匙不知去向。里面似乎藏着什么。', connections: ['wjdy_1f'], aliases: ['地下室'] },],

    '珊瑚病院': [
      { id: 'shby_deck', name: '甲板层', x: 50, y: 10, icon: '⛴️', desc: '已被封锁，铁门焊死。通往外界的唯一出口。', connections: ['shby_b1'], aliases: ['甲板'] },
      { id: 'shby_b1', name: '医疗层(B1)', x: 50, y: 35, icon: '🏥', desc: '走廊两侧是病房，墙壁上长着珊瑚状生物组织。药房在走廊尽头。', connections: ['shby_deck', 'shby_b2', 'shby_pharmacy'], aliases: ['医疗层', 'B1', '病房', '走廊'] },
      { id: 'shby_pharmacy', name: '药房', x: 85, y: 35, icon: '💊', desc: '蓝色药片供应有限。走廊尽头的药房。', connections: ['shby_b1'], aliases: ['药房'] },
      { id: 'shby_b2', name: '实验层(B2)', x: 50, y: 60, icon: '🔬', desc: '需要特殊钥匙卡才能进入。隐约能听到低沉的哀嚎声。', connections: ['shby_b1', 'shby_b3'], aliases: ['实验层', 'B2', '实验'] },
      { id: 'shby_b3', name: '机械层(B3)', x: 50, y: 85, icon: '⚙️', desc: '关押着首批实验体的铁笼区域。完全黑暗，充满海水。', connections: ['shby_b2'], aliases: ['机械层', 'B3', '船底', '铁笼'] },
    ],

    '冷藏库': [
      { id: 'lck_main', name: '主储存区', x: 50, y: 50, icon: '🧊', desc: '中央区域，大量器官储存架。-10℃的刺骨寒冷。', connections: ['lck_control', 'lck_surgery', 'lck_exit', 'lck_vent'], aliases: ['储存区', '中央', '冷藏库'] },
      { id: 'lck_control', name: '控制室', x: 15, y: 25, icon: '🖥️', desc: '角落的玻璃隔间，温控面板和监控屏幕。监控画面全是雪花。', connections: ['lck_main'], aliases: ['控制室'] },
      { id: 'lck_surgery', name: '手术区', x: 85, y: 25, icon: '🔪', desc: '自动手术台配备机械臂，周围有大量手术器械。', connections: ['lck_main'], aliases: ['手术区', '手术台'] },
      { id: 'lck_exit', name: '冷库门(出口)', x: 50, y: 85, icon: '🚪', desc: '厚重的金属冷库门，电子密码锁需要6位数密码。', connections: ['lck_main'], aliases: ['出口', '冷库门', '密码锁'] },
      { id: 'lck_vent', name: '通风管道', x: 50, y: 10, icon: '🌀', desc: '天花板上的维修通风管道。狭窄且结冰，有冰刺区域，出口通向外部走廊。', connections: ['lck_main'], aliases: ['通风管道', '管道'] },
    ],

    '失联航班': [
      { id: 'slhb_front', name: '前机身残骸', x: 50, y: 25, icon: '✈️', desc: '卡在碎石坡上倾斜30度。驾驶舱严重变形，有应急设备舱。', connections: ['slhb_rear', 'slhb_slope'], aliases: ['前机身', '驾驶舱', '前舱'] },
      { id: 'slhb_rear', name: '后机身残骸', x: 30, y: 55, icon: '🛖', desc: '滑落至溪谷旁，结构相对完整可做避难所。残存食物和饮用水。', connections: ['slhb_front', 'slhb_creek'], aliases: ['后机身', '后舱', '避难所'] },
      { id: 'slhb_creek', name: '溪谷', x: 30, y: 80, icon: '🏞️', desc: '冰雪融水山溪，水温约4℃。沿下游8公里可到猎人石屋。', connections: ['slhb_rear', 'slhb_hut'], aliases: ['溪谷', '山溪'] },
      { id: 'slhb_slope', name: '密林斜坡', x: 75, y: 40, icon: '🌲', desc: '陡峭山坡覆盖冷杉和杜鹃灌丛。有黑熊、狼的活动痕迹。', connections: ['slhb_front', 'slhb_ridge'], aliases: ['密林', '斜坡', '树林'] },
      { id: 'slhb_ridge', name: '山脊观测点', x: 85, y: 15, icon: '📡', desc: '海拔约4100米，唯一可能获得微弱手机信号的位置。地形暴露，危险。', connections: ['slhb_slope'], aliases: ['山脊', '观测点', '信号'] },
      { id: 'slhb_hut', name: '猎人石屋', x: 15, y: 90, icon: '🏚️', desc: '溪谷下游的废弃小屋。有简易灶台、绳索工具和手绘地图。', connections: ['slhb_creek'], aliases: ['石屋', '猎人'] },
    ],

    '镜中人': [
      { id: 'jzr_lobby', name: '一楼前台', x: 50, y: 85, icon: '🛎️', desc: '老旧客栈前台，老板娘热情但眼神回避镜面。', connections: ['jzr_dining', 'jzr_kitchen', 'jzr_2f'], aliases: ['前台', '一楼', '大厅'] },
      { id: 'jzr_dining', name: '餐厅', x: 20, y: 70, icon: '🍽️', desc: '一楼餐厅，墙上也装着大面积穿衣镜。', connections: ['jzr_lobby'], aliases: ['餐厅'] },
      { id: 'jzr_kitchen', name: '厨房', x: 80, y: 70, icon: '🍳', desc: '客栈厨房，也许能找到些线索。', connections: ['jzr_lobby'], aliases: ['厨房'] },
      { id: 'jzr_2f', name: '二楼客房', x: 50, y: 30, icon: '🪞', desc: '六间客房，每间都装有大面积穿衣镜。暴雨夜，手机无信号。', connections: ['jzr_lobby'], aliases: ['二楼', '客房', '卧室'] },
    ],

    '末班车': [
      { id: 'mbc_front', name: '车头/驾驶区', x: 50, y: 15, icon: '🚌', desc: '前门焊死，司机座位空着。方向盘缓慢自转。', connections: ['mbc_mid'], aliases: ['车头', '驾驶', '前门'] },
      { id: 'mbc_mid', name: '车厢中部', x: 50, y: 50, icon: '💺', desc: '褪色橙红塑料座椅，日光灯闪烁。12站路线图贴在车壁上。', connections: ['mbc_front', 'mbc_rear', 'mbc_door'], aliases: ['车厢', '中部', '座位'] },
      { id: 'mbc_door', name: '中门(下车门)', x: 20, y: 50, icon: '🚪', desc: '标注"下车门"，旁有红色按铃按钮。', connections: ['mbc_mid'], aliases: ['中门', '下车门', '按铃'] },
      { id: 'mbc_rear', name: '车尾', x: 50, y: 85, icon: '🪟', desc: '后窗被黑色垃圾袋封死。车顶有锈死的紧急天窗。', connections: ['mbc_mid'], aliases: ['车尾', '后窗', '天窗'] },
    ],

    '生产流水线': [
      { id: 'sclsx_start', name: '分娩准备室', x: 50, y: 85, icon: '🛏️', desc: '6张手术台并排，输液架和胎心监护仪。你在这里醒来。', connections: ['sclsx_hall'], aliases: ['准备室', '手术台', '起始'] },
      { id: 'sclsx_hall', name: '走廊', x: 50, y: 60, icon: '🚶', desc: '惨白长廊，墙上贴满"优质母体奖励计划"海报和"生育光荣"标语。', connections: ['sclsx_start', 'sclsx_check', 'sclsx_feed', 'sclsx_delivery'], aliases: ['走廊', '长廊'] },
      { id: 'sclsx_check', name: '检查室', x: 15, y: 40, icon: '🔬', desc: 'B超设备，屏幕上显示的"胎儿"形态诡异。', connections: ['sclsx_hall'], aliases: ['检查室', 'B超'] },
      { id: 'sclsx_feed', name: '营养供给站', x: 85, y: 40, icon: '🥣', desc: '强制进食区域，食物是浓稠的灰色糊状物。冷藏柜后面藏着后门。', connections: ['sclsx_hall', 'sclsx_backdoor'], aliases: ['营养', '供给站', '进食'] },
      { id: 'sclsx_delivery', name: '产房', x: 50, y: 15, icon: '👶', desc: '"恭喜您即将迎来新生命"。门后传来持续的婴儿啼哭声。', connections: ['sclsx_hall'], aliases: ['产房'] },
      { id: 'sclsx_backdoor', name: '后门(隐藏)', x: 85, y: 15, icon: '🔓', desc: '隐藏在营养供给站冷藏柜后面，需要移开重物。', connections: ['sclsx_feed'], aliases: ['后门', '隐藏出口'] },
    ],

    // ==================== A级副本 ====================

    '出不去的那栋楼': [
      { id: 'cbq_1f', name: '1楼办公区', x: 50, y: 85, icon: '🏢', desc: '教导主任办公室、监控室、家长接待室、食堂、"感恩教室"。', connections: ['cbq_2f'], aliases: ['一楼', '办公区', '食堂', '感恩教室', '监控室'] },
      { id: 'cbq_2f', name: '2楼男生宿舍', x: 30, y: 60, icon: '🛏️', desc: '每间6人上下铺铁门。公共厕所/淋浴间无隔板无门。', connections: ['cbq_1f', 'cbq_3f'], aliases: ['二楼', '男生宿舍'] },
      { id: 'cbq_3f', name: '3楼女生宿舍', x: 70, y: 40, icon: '🛏️', desc: '布局同男生宿舍。"反思室"——隔音的小黑屋。', connections: ['cbq_2f', 'cbq_4f'], aliases: ['三楼', '女生宿舍', '反思室', '小黑屋'] },
      { id: 'cbq_4f', name: '4楼禁闭区', x: 50, y: 20, icon: '⚡', desc: '"蟑螂屋"和"电疗室"。恐怖的惩罚区域。', connections: ['cbq_3f', 'cbq_roof'], aliases: ['四楼', '禁闭区', '蟑螂屋', '电疗室'] },
      { id: 'cbq_roof', name: '天台', x: 50, y: 5, icon: '🔒', desc: '被锁死，钥匙在教导主任身上。', connections: ['cbq_4f'], aliases: ['天台', '楼顶'] },
    ],

    '校园怨灵': [
      { id: 'xyyl_teach', name: '教学楼', x: 50, y: 30, icon: '📚', desc: '三层建筑，白天正常上课。一楼尽头杂物间常年上锁。', connections: ['xyyl_field', 'xyyl_toilet', 'xyyl_office'], aliases: ['教学楼', '教室', '杂物间'] },
      { id: 'xyyl_office', name: '校长办公室', x: 85, y: 20, icon: '🗄️', desc: '教学楼二楼，装潢体面。书架后有上锁的文件柜。', connections: ['xyyl_teach'], aliases: ['校长办公室', '办公室'] },
      { id: 'xyyl_field', name: '操场', x: 50, y: 55, icon: '🏟️', desc: '中央位置，夜间无照明。旗杆底座有不自然的水泥修补痕迹。', connections: ['xyyl_teach', 'xyyl_boys', 'xyyl_girls'], aliases: ['操场', '旗杆'] },
      { id: 'xyyl_boys', name: '男生宿舍楼', x: 20, y: 75, icon: '🏠', desc: '共四层。三楼302室已被改为杂物储藏间，门上贴着褪色封条。', connections: ['xyyl_field'], aliases: ['男生宿舍', '302'] },
      { id: 'xyyl_girls', name: '女生宿舍楼', x: 80, y: 75, icon: '🏠', desc: '共四层。夜间可观察到男生宿舍三楼走廊异常灯光闪烁。', connections: ['xyyl_field'], aliases: ['女生宿舍'] },
      { id: 'xyyl_toilet', name: '旧厕所', x: 50, y: 85, icon: '🚽', desc: '教学楼后方废弃建筑。最里侧隔间门从外面被焊死，门板上有密集抓痕。', connections: ['xyyl_teach'], aliases: ['旧厕所', '废弃厕所'] },
    ],

    '24号证物': [
      { id: '24zw_station', name: '警局', x: 50, y: 85, icon: '🚔', desc: '你的警局。档案室里存放着15年前的旧案卷宗。', connections: ['24zw_scene', '24zw_witness', '24zw_trace'], aliases: ['警局', '档案室'] },
      { id: '24zw_scene', name: '旧案现场', x: 20, y: 50, icon: '🏙️', desc: '已变为商业区。实地走访，寻找当年被忽略的细节。', connections: ['24zw_station'], aliases: ['现场', '商业区'] },
      { id: '24zw_witness', name: '证人住所', x: 80, y: 50, icon: '🏘️', desc: '当年证人和受害者家属的住所。时过境迁，有人愿意改口了。', connections: ['24zw_station'], aliases: ['证人', '家属', '住所'] },
      { id: '24zw_trace', name: '包裹来源', x: 50, y: 15, icon: '📦', desc: '通过邮戳、包装材料等反向追查匿名寄件人。', connections: ['24zw_station'], aliases: ['包裹', '邮戳', '追踪'] },
    ],

    '寄生话剧': [
      { id: 'jshj_seats', name: '观众席', x: 50, y: 85, icon: '💺', desc: '200个翻折座椅落满灰尘。你在这里醒来。', connections: ['jshj_stage'], aliases: ['观众席', '座位'] },
      { id: 'jshj_stage', name: '舞台', x: 50, y: 45, icon: '🎭', desc: '追光灯照着空无一人的舞台。布景凭空出现，人形木偶面部空白。', connections: ['jshj_seats', 'jshj_backstage'], aliases: ['舞台', '布景', '木偶'] },
      { id: 'jshj_backstage', name: '后台', x: 50, y: 10, icon: '🎪', desc: '红色幕布后方的区域，或许藏着操控这一切的秘密。', connections: ['jshj_stage'], aliases: ['后台', '幕布后'] },
    ],

    '灵堂': [
      { id: 'lt_hall', name: '正厅灵堂', x: 50, y: 50, icon: '⚰️', desc: '黑漆棺材棺盖半掩。灵位牌上的名字每次凝视都觉得不太一样。三炷香烟雾笔直向上。', connections: ['lt_left', 'lt_right', 'lt_yard', 'lt_gate'], aliases: ['灵堂', '正厅', '棺材'] },
      { id: 'lt_left', name: '左厢房(厨房)', x: 15, y: 35, icon: '🍳', desc: '流水席用的厨房。', connections: ['lt_hall'], aliases: ['左厢房', '厨房'] },
      { id: 'lt_right', name: '右厢房(纸扎)', x: 85, y: 35, icon: '🎋', desc: '堆满花圈纸扎。', connections: ['lt_hall'], aliases: ['右厢房', '纸扎', '花圈'] },
      { id: 'lt_yard', name: '后院', x: 50, y: 15, icon: '🌑', desc: '一口老井，井盖用红绳系着压井石。夜色浓稠得不正常，院墙外没有任何声音。', connections: ['lt_hall'], aliases: ['后院', '老井'] },
      { id: 'lt_gate', name: '正门', x: 50, y: 85, icon: '🚪', desc: '四合院正门，紧锁。', connections: ['lt_hall'], aliases: ['正门', '大门'] },
    ],

    '食人族': [
      { id: 'srz_cage', name: '铁笼(第一幕)', x: 50, y: 85, icon: '🔒', desc: '分层铁笼，笼外贴着"优质肉人12道检验标准"清单。', connections: ['srz_show'], aliases: ['铁笼', '笼子', '饲养场'] },
      { id: 'srz_show', name: '演播台(第二幕)', x: 50, y: 55, icon: '🎤', desc: '华丽的活体选秀舞台。智犬贵族用望远镜打量台上的人类。', connections: ['srz_cage', 'srz_market'], aliases: ['演播台', '选秀', '舞台'] },
      { id: 'srz_market', name: '轮回夜市(第三幕)', x: 50, y: 25, icon: '🏮', desc: '无限循环的小吃街。空气中弥漫着令人恐惧的烤肉香味。', connections: ['srz_show', 'srz_restaurant', 'srz_tunnel'], aliases: ['夜市', '小吃街', '轮回'] },
      { id: 'srz_restaurant', name: '人类友好餐厅', x: 20, y: 10, icon: '🍖', desc: '推门进去却是一家"狗肉馆"。人类和犬类的位置第一次互换。', connections: ['srz_market'], aliases: ['餐厅', '狗肉馆'] },
      { id: 'srz_tunnel', name: '地下通道(隐藏)', x: 80, y: 10, icon: '🕳️', desc: '流浪犬引导的隐藏逃生路线。需要在第一幕就与流浪犬建立联系。', connections: ['srz_market'], aliases: ['地下通道', '隐藏路线'] },
    ],

    '宝贝回家': [
      { id: 'bbhj_1f', name: '1楼大厅', x: 50, y: 85, icon: '🧸', desc: '接待大厅、活动室（玩具锁在柜子里）、餐厅。墙上贴满笑脸照片和"感恩"标语。', connections: ['bbhj_2f', 'bbhj_basement'], aliases: ['一楼', '大厅', '活动室', '餐厅'] },
      { id: 'bbhj_2f', name: '2楼宿舍区', x: 50, y: 50, icon: '🛏️', desc: '儿童宿舍（10人间）、"乖孩子教室"、洗衣房。', connections: ['bbhj_1f', 'bbhj_3f'], aliases: ['二楼', '宿舍', '乖孩子教室'] },
      { id: 'bbhj_3f', name: '3楼禁区', x: 50, y: 20, icon: '🔒', desc: '被锁死的区域。"院长办公区——儿童止步"。', connections: ['bbhj_2f'], aliases: ['三楼', '院长办公区', '禁区'] },
      { id: 'bbhj_basement', name: '地下展示间', x: 50, y: 15, icon: '🕳️', desc: '通过厨房冷库门可进入，暗藏的"展示间"。', connections: ['bbhj_1f'], aliases: ['地下', '展示间', '冷库'] },
    ],

    '完美考核': [
      { id: 'wmkh_dining', name: '餐桌', x: 50, y: 50, icon: '🍽️', desc: '铺着碎花桌布的圆桌，面前摆满了菜。每次循环的起点。', connections: ['wmkh_living', 'wmkh_kitchen'], aliases: ['餐桌', '圆桌', '吃饭'] },
      { id: 'wmkh_living', name: '客厅', x: 50, y: 20, icon: '📺', desc: '结婚照上新娘的脸是模糊的。茶几上果盘和烟灰缸。电视播着新闻联播。', connections: ['wmkh_dining'], aliases: ['客厅', '沙发', '电视'] },
      { id: 'wmkh_kitchen', name: '厨房', x: 50, y: 80, icon: '🍳', desc: '油锅的刺啦声不断传来。', connections: ['wmkh_dining'], aliases: ['厨房'] },
    ],

    // ==================== S级副本 ====================

    '陌生人类': [
      { id: 'msrl_b1', name: 'B1停车场', x: 50, y: 90, icon: '🅿️', desc: '地下停车场，车牌号全部一样。', connections: ['msrl_1f'], aliases: ['停车场', 'B1', '地下'] },
      { id: 'msrl_1f', name: '1楼商铺', x: 50, y: 75, icon: '🏪', desc: '便利店、奶茶店、服装店。店员都很热情但问不出有价值信息。', connections: ['msrl_b1', 'msrl_2f'], aliases: ['一楼', '便利店', '奶茶店'] },
      { id: 'msrl_2f', name: '2楼餐饮', x: 50, y: 58, icon: '🥩', desc: '《顶上牛排》餐厅、理发店、一间空铺（"即将开业"）。', connections: ['msrl_1f', 'msrl_3f'], aliases: ['二楼', '牛排', '顶上牛排'] },
      { id: 'msrl_3f', name: '3楼娱乐', x: 50, y: 42, icon: '🎤', desc: '《酸来了》酸菜鱼餐厅（总是高一层）、KTV、锁着的办公室。', connections: ['msrl_2f', 'msrl_4f'], aliases: ['三楼', 'KTV', '酸菜鱼'] },
      { id: 'msrl_4f', name: '4楼健身', x: 50, y: 26, icon: '🏋️', desc: '健身房（有人跑步但不出汗）、培训机构（黑板写着"欢迎回来"）。', connections: ['msrl_3f', 'msrl_5f'], aliases: ['四楼', '健身房', '培训'] },
      { id: 'msrl_5f', name: '5楼天台', x: 50, y: 10, icon: '🌫️', desc: '门半开着。能看到整个商业区——但地平线处的建筑在重复。', connections: ['msrl_4f'], aliases: ['五楼', '天台', '楼顶'] },
    ],

    '深夜便利店': [
      { id: 'sybld_shelves', name: '货架区', x: 50, y: 50, icon: '🛒', desc: '四排货架，商品看似正常但仔细看会发现诡异之处。', connections: ['sybld_counter', 'sybld_rest', 'sybld_wc', 'sybld_outside'], aliases: ['货架', '店内', '便利店'] },
      { id: 'sybld_counter', name: '收银台', x: 50, y: 80, icon: '💰', desc: '收银台，面朝玻璃门。', connections: ['sybld_shelves'], aliases: ['收银台', '前台'] },
      { id: 'sybld_rest', name: '员工休息室', x: 15, y: 30, icon: '🚪', desc: '门上写"staff only"。里面也许藏着什么。', connections: ['sybld_shelves'], aliases: ['休息室', '员工'] },
      { id: 'sybld_wc', name: '卫生间', x: 85, y: 30, icon: '🚻', desc: '便利店卫生间。', connections: ['sybld_shelves'], aliases: ['卫生间', '厕所'] },
      { id: 'sybld_outside', name: '店外(浓雾)', x: 50, y: 10, icon: '🌫️', desc: '玻璃门外是浓雾。走出去的人无论怎么走，30秒后都会从玻璃门重新走进来。', connections: ['sybld_shelves'], aliases: ['外面', '门外', '浓雾'] },
    ],

    '静默法则': [
      { id: 'jmfz_square', name: '中央广场', x: 50, y: 50, icon: '🗿', desc: '巨大石碑刻着"静默法则"全文。法则执行者（白色制服巡逻队）在此巡逻。', connections: ['jmfz_residential', 'jmfz_mute', 'jmfz_redlight'], aliases: ['广场', '中央', '石碑'] },
      { id: 'jmfz_residential', name: '居民区', x: 20, y: 30, icon: '🏢', desc: '拥挤的公寓楼，隔音极差但没有人发出声音。', connections: ['jmfz_square', 'jmfz_redlight'], aliases: ['居民区', '公寓'] },
      { id: 'jmfz_mute', name: '消音区', x: 80, y: 30, icon: '📚', desc: '图书馆、学校、剧院。法则执行者重点监控区域。书架上的书都是空白页。', connections: ['jmfz_square'], aliases: ['消音区', '图书馆', '学校', '剧院'] },
      { id: 'jmfz_redlight', name: '红灯区', x: 20, y: 75, icon: '🔴', desc: '与居民区一墙之隔。暴行公开发生，无人制止。', connections: ['jmfz_square', 'jmfz_residential'], aliases: ['红灯区'] },
      { id: 'jmfz_sewer', name: '地下水道', x: 80, y: 75, icon: '🕳️', desc: '低语者同盟的秘密据点之一。', connections: ['jmfz_square'], aliases: ['地下水道', '水道', '低语者'] },
    ],

    // ==================== SS级副本 ====================

    '向往的生活': [
      { id: 'xwdsh_room', name: '出租屋', x: 50, y: 50, icon: '🏠', desc: '约10平米。家具齐全但异常"干净"。镜子模糊不清，隐藏摄像头。', connections: ['xwdsh_wc', 'xwdsh_hallway'], aliases: ['出租屋', '房间', '床', '书桌'] },
      { id: 'xwdsh_wc', name: '卫生间', x: 20, y: 30, icon: '🚿', desc: '带淋浴的小卫生间。', connections: ['xwdsh_room'], aliases: ['卫生间', '淋浴'] },
      { id: 'xwdsh_hallway', name: '走廊', x: 80, y: 50, icon: '🚶', desc: '约3米长的走廊。', connections: ['xwdsh_room', 'xwdsh_locked'], aliases: ['走廊'] },
      { id: 'xwdsh_locked', name: '走廊尽头(锁门)', x: 80, y: 15, icon: '🔒', desc: '走廊尽头的另一扇门——锁着的。', connections: ['xwdsh_hallway'], aliases: ['锁门', '尽头'] },
    ],

    '旧相馆': [
      { id: 'jxg_counter', name: '柜台区', x: 50, y: 80, icon: '🛎️', desc: '木质柜台、老式胶片相机架在三脚架上。门已锁。', connections: ['jxg_wall', 'jxg_darkroom'], aliases: ['柜台', '前台', '照相馆'] },
      { id: 'jxg_wall', name: '照片墙', x: 50, y: 50, icon: '🖼️', desc: '墙上挂满黑白遗照，几十张面孔带着不像活人的微笑。', connections: ['jxg_counter'], aliases: ['照片墙', '遗照', '照片'] },
      { id: 'jxg_darkroom', name: '暗房', x: 50, y: 20, icon: '🔴', desc: '厚黑布帘隔开的暗房。冲洗照片的地方，红色安全灯。', connections: ['jxg_counter'], aliases: ['暗房', '冲洗'] },
    ],

    '头七': [
      { id: 'tq_morgue', name: '遗体处理间', x: 50, y: 85, icon: '🧊', desc: '冷藏柜墙6格，4格亮红灯。清洗台、工具柜。你在这里醒来。', connections: ['tq_hall'], aliases: ['处理间', '冷藏柜', '起始'] },
      { id: 'tq_hall', name: '走廊', x: 50, y: 60, icon: '🚶', desc: '连接各区域，灯光感应式，人走过才亮。', connections: ['tq_morgue', 'tq_farewell', 'tq_makeup', 'tq_furnace', 'tq_office', 'tq_exit'], aliases: ['走廊'] },
      { id: 'tq_farewell', name: '告别厅', x: 15, y: 45, icon: '💐', desc: '一号厅在布置中，遗像位空着。二号厅门锁着。', connections: ['tq_hall'], aliases: ['告别厅', '一号厅'] },
      { id: 'tq_makeup', name: '化妆间', x: 85, y: 45, icon: '💄', desc: '遗体化妆用。有镜子、化妆品、假体修复材料。', connections: ['tq_hall'], aliases: ['化妆间'] },
      { id: 'tq_furnace', name: '焚化间', x: 50, y: 20, icon: '🔥', desc: '铁门厚重，电子锁。焚化炉已预热，温度指示灯亮着。', connections: ['tq_hall'], aliases: ['焚化间', '焚化炉'] },
      { id: 'tq_office', name: '办公室', x: 85, y: 20, icon: '🖥️', desc: '工作人员办公区。电脑、文件柜、监控屏幕。', connections: ['tq_hall'], aliases: ['办公室', '监控'] },
      { id: 'tq_exit', name: '正门', x: 15, y: 20, icon: '🚪', desc: '需要门禁卡。出去就是自由。', connections: ['tq_hall'], aliases: ['正门', '大门', '出口'] },
    ],

    // ==================== SSS级副本 ====================

    '血肉筹码': [
      { id: 'xrcm_hall', name: '中央大厅「饥饿轮盘」', x: 50, y: 50, icon: '🎰', desc: '圆形空间，12道闸门环绕中央。血红色霓虹灯闪烁。', connections: ['xrcm_auction', 'xrcm_maze', 'xrcm_alley', 'xrcm_vip'], aliases: ['中央大厅', '饥饿轮盘', '大厅'] },
      { id: 'xrcm_auction', name: '拍卖厅「赎罪拍卖会」', x: 15, y: 25, icon: '🔨', desc: '阶梯式座位大厅，舞台中央巨大拍卖台。', connections: ['xrcm_hall'], aliases: ['拍卖厅', '赎罪拍卖会', '拍卖'] },
      { id: 'xrcm_maze', name: '血肉迷宫', x: 50, y: 10, icon: '🫀', desc: '最终区域。墙壁由生物组织构成，令人作呕。', connections: ['xrcm_hall'], aliases: ['迷宫', '血肉迷宫'] },
      { id: 'xrcm_alley', name: '暗巷「器官黑市」', x: 85, y: 25, icon: '🌑', desc: '连接各区域的隐秘通道。"收割者"NPC游荡其中。', connections: ['xrcm_hall', 'xrcm_vip'], aliases: ['暗巷', '器官黑市', '黑市'] },
      { id: 'xrcm_vip', name: 'VIP室(隐藏)', x: 85, y: 75, icon: '👑', desc: '隐藏房间，需要特殊条件进入。藏有稀有道具。', connections: ['xrcm_hall', 'xrcm_alley'], aliases: ['VIP', 'VIP室', '隐藏房间'] },
    ],

    // ==================== 默认模板 ====================
    '__default__': [
      { id: 'dg_entry', name: '副本入口', x: 50, y: 85, icon: '🚪', desc: '你刚进入副本的地方。', connections: ['dg_explore'], aliases: ['入口'] },
      { id: 'dg_explore', name: '探索区域', x: 50, y: 50, icon: '🔍', desc: '正在探索的区域。', connections: ['dg_entry', 'dg_core'], aliases: ['探索'] },
      { id: 'dg_core', name: '核心区域', x: 50, y: 15, icon: '⚠️', desc: '副本的核心，最危险的地方。', connections: ['dg_explore'], aliases: ['核心', '深处'] },
    ]
  };

  // 兼容旧代码：默认使用主世界地图
  let MAP_NODES = MAP_NODES_MAIN;

  /* ═══════════════════════════════════════
     🏪 综合商店系统
     ═══════════════════════════════════════ */
  const EQUIP_SHOP_KEY = 'abyss-equip-shop';
  function _loadEquipShop() {
    try { const r = localStorage.getItem(EQUIP_SHOP_KEY); if (r) return JSON.parse(r); } catch (e) { }
    // 默认装备商品
    const defaults = [
      { id: 'es_001', name: '铁剑', emoji: '⚔️', category: '武器', rarity: 'R', price: 80, description: '简陋但可靠的铁制长剑' },
      { id: 'es_002', name: '皮甲', emoji: '🦺', category: '防具', rarity: 'R', price: 60, description: '轻便的皮革护甲，提供基础防护' },
      { id: 'es_003', name: '治愈药水', emoji: '💊', category: '消耗品', rarity: 'R', price: 30, description: '恢复少量体力的药水' },
      { id: 'es_004', name: '解毒草', emoji: '🌿', category: '消耗品', rarity: 'R', price: 20, description: '可以解除轻微中毒状态' },
      { id: 'es_005', name: '暗影匕首', emoji: '🗡️', category: '武器', rarity: 'SR', price: 200, description: '刀刃泛着幽蓝光芒，据说能斩断看不见的丝线' },
      { id: 'es_006', name: '灵魂护盾', emoji: '🛡️', category: '防具', rarity: 'SR', price: 250, description: '由灵魂能量凝聚的护盾，能抵挡一次精神攻击' },
      { id: 'es_007', name: 'SAN值恢复剂', emoji: '🧪', category: '消耗品', rarity: 'SR', price: 150, description: '恢复20点SAN值，味道极其难喝' },
      { id: 'es_008', name: '传送石', emoji: '💠', category: '消耗品', rarity: 'SSR', price: 500, description: '一次性传送道具，可返回遗忘码头' }
    ];
    _saveEquipShop(defaults);
    return defaults;
  }
  function _saveEquipShop(list) {
    try { localStorage.setItem(EQUIP_SHOP_KEY, JSON.stringify(list)); } catch (e) { }
  }

  let _shopCategory = '全部';

  function _drawShop($c) {
    const t = _t();
    const coins = _getPlayerCoins();
    const shop = _loadEquipShop();
    const categories = ['全部', '武器', '防具', '消耗品'];
    const filtered = _shopCategory === '全部' ? shop : shop.filter(s => s.category === _shopCategory);
    const hasApi = !!_getAuxApi();

    let o = '';

    // 标题和余额
    o += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">`;
    o += `<span style="font-size:14px">🏪</span>`;
    o += `<span style="font-size:11px;font-weight:600;color:${t.text}">装备商店</span>`;
    o += `<span style="margin-left:auto;font-size:10px;color:${t.accent};font-weight:700">💰 ${coins}</span>`;
    o += `</div>`;

    // 分类标签
    o += '<div style="display:flex;gap:0;border-bottom:1px solid ' + t.divider + ';margin-bottom:6px">';
    for (const cat of categories) {
      const isActive = _shopCategory === cat;
      o += `<div class="ax-bag-tab${isActive ? ' on' : ''}" data-shop-cat="${cat}">${cat}</div>`;
    }
    o += '</div>';

    // AI生成商品
    o += `<div style="display:flex;gap:4px;margin-bottom:6px">`;
    o += `<input class="ax-dlg-input" id="ax-eshop-search" type="text" placeholder="🔍 搜索或输入关键词AI生成…" style="font-size:10px;padding:6px 10px;flex:1">`;
    o += `<button class="ax-fetch-models-btn" id="ax-eshop-ai-gen" ${hasApi ? '' : 'disabled'}>✨ 生成</button>`;
    o += `</div>`;

    // 商品列表
    if (!filtered.length) {
      o += `<div style="text-align:center;padding:20px;color:${t.textMuted};font-size:10px;font-style:italic">暂无商品</div>`;
    } else {
      for (const item of filtered) {
        const rc = { SSS: t.sss, SSR: t.ssr, SR: t.sr, R: t.textDim }[item.rarity] || t.textDim;
        const canBuy = coins >= item.price;
        o += `<div style="display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:10px;margin-bottom:2px;transition:background .15s" class="ax-eshop-item">`;
        o += `<span style="font-size:20px;width:28px;text-align:center">${item.emoji}</span>`;
        o += `<div style="flex:1;min-width:0">`;
        o += `<div style="font-size:10px;color:${t.text};display:flex;align-items:center;gap:4px"><span>${_esc(item.name)}</span><span style="font-size:7px;color:${rc}">[${item.rarity}]</span><span style="font-size:7px;color:${t.textMuted};background:${t.surfaceHover};padding:1px 4px;border-radius:3px">${item.category}</span></div>`;
        o += `<div style="font-size:8px;color:${t.textMuted}">${_esc(item.description)}</div>`;
        o += `</div>`;
        o += `<div style="font-size:9px;color:${t.accent};font-weight:600;flex-shrink:0">${item.price}💰</div>`;
        o += `<button class="ax-api-btn ax-eshop-buy" data-eid="${item.id}" style="flex-shrink:0;font-size:8px;${canBuy ? '' : 'opacity:.3;cursor:default'}" ${canBuy ? '' : 'disabled'}>购买</button>`;
        o += `</div>`;
      }
    }

    $c.html(o);

    // 分类切换
    $c.find('[data-shop-cat]').on('click', function () {
      _shopCategory = $(this).data('shop-cat');
      _drawShop($c);
    });

    // 购买
    $c.find('.ax-eshop-buy').on('click', async function () {
      const eid = $(this).data('eid');
      const item = shop.find(s => s.id === eid);
      if (!item) return;
      const curCoins = _getPlayerCoins();
      if (curCoins < item.price) {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 魂币不足');
        return;
      }
      const ok = await _setPlayerCoins(curCoins - item.price);
      if (!ok) return;

      // 添加到物品栏
      const d = _load();
      if (d && d['物品栏']) {
        const slotMap = { '武器': '武器', '防具': '衣着', '消耗品': '消耗品' };
        const slot = slotMap[item.category] || '其他';
        if (d['物品栏'][slot]) {
          d['物品栏'][slot][item.name + (item.rarity !== 'R' ? '(' + item.rarity + ')' : '')] = item.description;
          await _save(d);
        }
      }

      if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success 购买成功：${item.emoji} ${item.name}，花费 ${item.price} 魂币`);
      _drawShop($c);
    });

    // AI生成商品
    $c.find('#ax-eshop-ai-gen').on('click', async function () {
      const $btn = $(this);
      const kw = $('#ax-eshop-search').val().trim();
      if (!kw) {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 请先输入关键词（如：弓箭、盔甲、毒药）');
        return;
      }
      $btn.prop('disabled', true).text('生成中…');
      try {
        const context = _getContextSummary();
        const existingNames = shop.map(s => s.name);
        const msgs = [
          {
            role: 'system',
            content: `生成3-5个与"${kw}"相关的装备/道具商品，符合深渊炼狱世界观。
已有：${existingNames.slice(0, 10).join('、')}（不要重复）
格式：[{"name":"名称(8字内)","emoji":"emoji","category":"武器或防具或消耗品","rarity":"R或SR或SSR","price":数字30到999,"description":"15-30字描述"}]`
          },
          { role: 'user', content: `生成与"${kw}"相关的商品` }
        ];
        const reply = await _callAuxApi(msgs, { temperature: 0.95, max_tokens: 1200 });
        const items = _safeParseJsonArray(reply);
        let added = 0;
        for (const it of items) {
          if (!it.name || existingNames.includes(it.name)) continue;
          it.id = 'es_ai_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5);
          it.name = String(it.name).replace(/[《》\[\]]/g, '').trim().slice(0, 20);
          it.emoji = String(it.emoji || '📦').trim().slice(0, 4);
          it.category = ['武器', '防具', '消耗品'].includes(it.category) ? it.category : '消耗品';
          it.rarity = ['SSS', 'SSR', 'SR', 'R'].includes(String(it.rarity).toUpperCase()) ? String(it.rarity).toUpperCase() : 'R';
          it.price = Math.max(10, Math.min(9999, parseInt(it.price) || 100));
          it.description = String(it.description || '').trim().slice(0, 100);
          shop.push(it);
          existingNames.push(it.name);
          added++;
        }
        _saveEquipShop(shop);
        if (added > 0 && typeof triggerSlash === 'function') triggerSlash(`/echo severity=success 已生成 ${added} 个商品`);
        _drawShop($c);
      } catch (e) {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=error 生成失败：' + (e.message || ''));
      }
      $btn.prop('disabled', false).text('✨ 生成');
    });
  }

  function _drawMap($c) {
    const t = _t();
    const d = _load();
    const currentLoc = d ? (d['当前位置'] || '未知') : '未知';
    const currentDungeon = d ? (d['当前副本'] || '无') : '无';
    const isInDungeon = currentDungeon && currentDungeon !== '无';

    // 根据是否在副本中选择地图
    let activeNodes;
    let mapTitle;
    if (isInDungeon) {
      activeNodes = MAP_NODES_DUNGEONS[currentDungeon] || MAP_NODES_DUNGEONS['__default__'];
      mapTitle = '📍 ' + currentDungeon;
    } else {
      activeNodes = MAP_NODES_MAIN;
      mapTitle = '🗺️ 深渊地图';
    }

    // 自动标记当前位置为已探索（精确+模糊匹配）
    _markExplored(currentLoc);
    for (const node of activeNodes) {
      if (currentLoc && currentLoc !== '未知') {
        if (currentLoc === node.name || currentLoc.includes(node.name) || node.name.includes(currentLoc) || (node.aliases && node.aliases.some(a => currentLoc.includes(a) || a.includes(currentLoc)))) {
          _markExplored(node.name);
        }
      }
    }

    // 自动标记所有NPC所在位置为已探索
    if (d && d['NPC位置'] && typeof d['NPC位置'] === 'object') {
      for (const [name, loc] of Object.entries(d['NPC位置'])) {
        if (_skip(name) || !loc || typeof loc !== 'string') continue;
        _markExplored(loc);
        for (const node of activeNodes) {
          if (loc.includes(node.name) || node.name.includes(loc) || (node.aliases && node.aliases.some(a => loc.includes(a) || a.includes(loc)))) {
            _markExplored(node.name);
          }
        }
      }
    }

    // 非副本时自动点亮所有主世界区域
    if (!isInDungeon) {
      for (const node of activeNodes) {
        _markExplored(node.name);
      }
    } else {
      // 副本中：自动点亮入口节点（第一个节点）
      if (activeNodes.length > 0) {
        _markExplored(activeNodes[0].name);
      }
      // 如果当前位置匹配不到任何节点，也点亮入口
      const matchedNode = activeNodes.find(n =>
        currentLoc === n.name ||
        currentLoc.includes(n.name) ||
        n.name.includes(currentLoc) ||
        (n.aliases && n.aliases.some(a => currentLoc.includes(a) || a.includes(currentLoc)))
      );
      if (!matchedNode && activeNodes.length > 0) {
        _markExplored(activeNodes[0].name);
      }
    }

    const explored = _loadExplored();
    const exploredSet = new Set(explored);

    // 查找NPC位置
    const npcLocations = {};
    if (d && d['NPC位置'] && typeof d['NPC位置'] === 'object') {
      for (const [name, loc] of Object.entries(d['NPC位置'])) {
        if (_skip(name)) continue;
        if (loc && typeof loc === 'string') {
          npcLocations[name] = loc;
        }
      }
    }

    let o = '';

    // 标题栏
    o += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">`;
    o += `<span style="font-size:14px">${isInDungeon ? '⚠️' : '🗺️'}</span>`;
    o += `<span style="font-size:11px;font-weight:600;color:${t.text}">${_esc(mapTitle)}</span>`;
    if (isInDungeon) {
      o += `<span style="font-size:7px;color:${t.fail};background:rgba(${t.primaryRgb},.1);padding:2px 6px;border-radius:4px;margin-left:4px">副本中</span>`;
    }
    o += `<span style="margin-left:auto;font-size:8px;color:${t.textMuted}">已探索 ${activeNodes.filter(n => exploredSet.has(n.name)).length}/${activeNodes.length}</span>`;
    o += `</div>`;

    // 当前位置信息
    o += `<div style="display:flex;align-items:center;gap:6px;padding:8px 10px;background:${t.surfaceHover};border-radius:10px;margin-bottom:8px;border-left:3px solid ${isInDungeon ? t.fail : t.primary}">`;
    o += `<span style="font-size:16px">📍</span>`;
    o += `<div><div style="font-size:8px;color:${t.textMuted}">当前位置</div><div style="font-size:12px;font-weight:700;color:${t.accent}">${_esc(currentLoc)}</div></div>`;
    o += `</div>`;

    // 地图画布
    o += `<div style="position:relative;width:100%;padding-bottom:${isInDungeon ? '100%' : '90%'};background:${t.bgCard};border-radius:14px;border:1px solid ${t.border};overflow:hidden;margin-bottom:8px" id="ax-map-canvas">`;

    // 雾化覆盖层
    o += `<div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,transparent 20%,rgba(0,0,0,.3) 80%);pointer-events:none;z-index:2"></div>`;

    // 连接线
    for (const node of activeNodes) {
      const isExplored = exploredSet.has(node.name);
      if (!isExplored) continue;
      for (const connId of node.connections) {
        const target = activeNodes.find(n => n.id === connId);
        if (!target || !exploredSet.has(target.name)) continue;
        if (node.id > connId) continue;
        o += `<div style="position:absolute;left:${Math.min(node.x, target.x)}%;top:${Math.min(node.y, target.y)}%;width:${Math.abs(target.x - node.x) || 1}%;height:${Math.abs(target.y - node.y) || 1}%;z-index:0;pointer-events:none">`;
        o += `<svg width="100%" height="100%" style="position:absolute;inset:0;overflow:visible"><line x1="${node.x < target.x ? '0%' : '100%'}" y1="${node.y < target.y ? '0%' : '100%'}" x2="${node.x < target.x ? '100%' : '0%'}" y2="${node.y < target.y ? '100%' : '0%'}" stroke="rgba(${t.primaryRgb},.25)" stroke-width="1.5" stroke-dasharray="4,3"/></svg>`;
        o += `</div>`;
      }
    }

    // 节点
    for (const node of activeNodes) {
      const isExplored = exploredSet.has(node.name);
      const isCurrent = (currentLoc === node.name) || (currentLoc && currentLoc !== '未知' && (currentLoc.includes(node.name) || node.name.includes(currentLoc) || (node.aliases && node.aliases.some(a => currentLoc.includes(a) || a.includes(currentLoc)))));
      const npcHere = Object.entries(npcLocations).filter(([, loc]) => loc === node.name || (loc && (loc.includes(node.name) || node.name.includes(loc) || (node.aliases && node.aliases.some(a => loc.includes(a) || a.includes(loc)))))).map(([n]) => n);

      if (!isExplored) {
        o += `<div style="position:absolute;left:${node.x}%;top:${node.y}%;transform:translate(-50%,-50%);width:24px;height:24px;border-radius:50%;background:rgba(${t.primaryRgb},.08);border:1px dashed rgba(${t.primaryRgb},.15);display:flex;align-items:center;justify-content:center;font-size:10px;color:${t.textLocked};z-index:1" title="???">?</div>`;
        continue;
      }

      const nodeSize = isCurrent ? 36 : 28;
      const borderColor = isCurrent ? t.accent : `rgba(${t.primaryRgb},.3)`;
      const bgColor = isCurrent ? `rgba(${t.accentRgb},.2)` : t.surfaceHover;
      const glowStyle = isCurrent ? `box-shadow:0 0 12px rgba(${t.accentRgb},.4);animation:axBlink 2s infinite;` : '';

      o += `<div class="ax-map-node" data-map-node="${node.id}" style="position:absolute;left:${node.x}%;top:${node.y}%;transform:translate(-50%,-50%);z-index:3;cursor:pointer;text-align:center;transition:transform .15s" title="${_esc(node.name)}">`;
      o += `<div style="width:${nodeSize}px;height:${nodeSize}px;border-radius:50%;background:${bgColor};border:2px solid ${borderColor};display:flex;align-items:center;justify-content:center;font-size:${isCurrent ? 16 : 12}px;${glowStyle}margin:0 auto">${node.icon}</div>`;
      o += `<div style="font-size:7px;color:${isCurrent ? t.accent : t.textDim};margin-top:2px;white-space:nowrap;font-weight:${isCurrent ? '700' : '400'}">${node.name}</div>`;
      if (npcHere.length) {
        o += `<div style="display:flex;gap:1px;justify-content:center;margin-top:1px">`;
        for (const nName of npcHere) {
          o += `<span style="font-size:8px" title="${_esc(nName)}">${_getNpcEmoji(nName)}</span>`;
        }
        o += `</div>`;
      }
      o += `</div>`;
    }

    o += `</div>`;

    // 图例
    o += `<div style="display:flex;gap:8px;flex-wrap:wrap;font-size:7px;color:${t.textMuted};padding:0 4px">`;
    o += `<span>📍 当前位置</span>`;
    o += `<span>⚪ 已探索</span>`;
    if (isInDungeon) o += `<span>❓ 未探索</span>`;
    o += `<span>😊 NPC</span>`;
    o += `</div>`;

    // 节点详情区
    o += `<div id="ax-map-detail" style="margin-top:8px"></div>`;

    $c.html(o);

    // 点击节点显示详情
    $c.find('.ax-map-node').on('click', function () {
      const nodeId = $(this).data('map-node');
      const node = activeNodes.find(n => n.id === nodeId);
      if (!node) return;
      const isCur = (currentLoc === node.name) || (currentLoc && (currentLoc.includes(node.name) || node.name.includes(currentLoc)));
      const npcsHere = Object.entries(npcLocations).filter(([, loc]) => loc === node.name || (loc && (loc.includes(node.name) || node.name.includes(loc)))).map(([n]) => n);
      const conns = node.connections.map(cid => {
        const cn = activeNodes.find(n => n.id === cid);
        return cn ? cn.name : cid;
      });

      let detail = `<div style="padding:10px;background:${t.surfaceHover};border-radius:12px;animation:axIn .2s ease">`;
      detail += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">`;
      detail += `<span style="font-size:22px">${node.icon}</span>`;
      detail += `<div><div style="font-size:12px;font-weight:700;color:${t.text}">${node.name}</div>`;
      if (isCur) detail += `<div style="font-size:8px;color:${t.accent}">📍 你在这里</div>`;
      detail += `</div></div>`;
      detail += `<div style="font-size:9px;color:${t.textDim};line-height:1.6;margin-bottom:6px">${_esc(node.desc)}</div>`;
      if (npcsHere.length) {
        detail += `<div style="font-size:8px;color:${t.textDim};margin-bottom:4px">👥 此处的NPC：${npcsHere.map(n => _getNpcEmoji(n) + ' ' + _esc(n)).join('、')}</div>`;
      }
      detail += `<div style="font-size:8px;color:${t.textMuted}">🔗 相邻区域：${conns.join('、')}</div>`;
      detail += `</div>`;

      $('#ax-map-detail').html(detail);
    });
  }

  /* ═══════════════════════════════════════
     📻 深渊广播系统（真实语音版）
     ═══════════════════════════════════════ */
  const BROADCAST_STORAGE_KEY = 'abyss-broadcast';
  const BROADCAST_HISTORY_KEY = 'abyss-broadcast-history';

  let _broadcastSpeaking = false;
  let _broadcastCurrentUtterance = null;
  let _broadcastTab = 'live'; // 'live' | 'history' | 'custom' | 'settings'

  // 广播设置
  const BROADCAST_SETTINGS_KEY = 'abyss-broadcast-settings';
  function _loadBroadcastSettings() {
    try {
      const raw = localStorage.getItem(BROADCAST_SETTINGS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return {
      voiceIndex: -1,       // -1 = 自动选择
      rate: 0.85,           // 语速（0.5~2.0），稍慢更有氛围
      pitch: 0.7,           // 音调（0~2），低沉更恐怖
      volume: 0.9,          // 音量（0~1）
      lang: 'zh-CN',       // 优先语言
      autoPlay: false       // 是否自动播放新广播
    };
  }
  function _saveBroadcastSettings(s) {
    try { localStorage.setItem(BROADCAST_SETTINGS_KEY, JSON.stringify(s)); } catch (e) { }
  }

  // 广播历史
  function _loadBroadcastHistory() {
    try {
      const raw = localStorage.getItem(BROADCAST_HISTORY_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return [];
    // 结构: [{ id, type, title, content, ts }]
    // type: 'news' | 'warning' | 'story' | 'ad' | 'music' | 'custom'
  }
  function _saveBroadcastHistory(list) {
    try { localStorage.setItem(BROADCAST_HISTORY_KEY, JSON.stringify(list)); } catch (e) { }
  }
  function _addBroadcastHistory(item) {
    const list = _loadBroadcastHistory();
    item.id = item.id || ('bc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5));
    item.ts = Date.now();
    list.unshift(item);
    if (list.length > 30) list.splice(30);
    _saveBroadcastHistory(list);
    return item;
  }

  // 获取可用的语音列表
  function _getVoices() {
    if (!window.speechSynthesis) return [];
    return window.speechSynthesis.getVoices();
  }

  // 选择最佳语音
  function _selectVoice(settings) {
    const voices = _getVoices();
    if (!voices.length) return null;

    // 如果用户指定了语音索引
    if (settings.voiceIndex >= 0 && settings.voiceIndex < voices.length) {
      return voices[settings.voiceIndex];
    }

    // 自动选择：优先中文低音
    const lang = settings.lang || 'zh-CN';
    const zhVoices = voices.filter(v => v.lang && v.lang.startsWith('zh'));
    if (zhVoices.length) {
      // 优先选择名字包含"男"或"Male"的
      const male = zhVoices.find(v => /男|male|man/i.test(v.name));
      if (male) return male;
      return zhVoices[0];
    }
    // 回退到默认
    return voices[0] || null;
  }

  // 朗读文本 - 增强版：优先在线TTS，回退浏览器自带
  // 根据性别选择语音
  function _selectVoiceByGender(gender, settings) {
    const voices = _getVoices();
    if (!voices.length) return null;
    if (settings.voiceIndex >= 0 && settings.voiceIndex < voices.length) {
      return voices[settings.voiceIndex];
    }
    const lang = settings.lang || 'zh-CN';
    const zhVoices = voices.filter(v => v.lang && v.lang.startsWith('zh'));
    const allTarget = zhVoices.length ? zhVoices : voices;
    if (gender === 'male') {
      const male = allTarget.find(v => /男|male|man|tenor|baritone/i.test(v.name));
      if (male) return male;
      const notFemale = allTarget.find(v => !/女|female|woman/i.test(v.name));
      if (notFemale) return notFemale;
    } else if (gender === 'female') {
      const female = allTarget.find(v => /女|female|woman|soprano|alto/i.test(v.name));
      if (female) return female;
    }
    return allTarget[0] || voices[0] || null;
  }

  // 朗读文本（支持可选的voiceGender和npcName参数）
  function _speak(text, onEnd, voiceGender, npcName) {
    if (!window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }
    _stopSpeaking();

    const settings = _loadBroadcastSettings();
    const utterance = new SpeechSynthesisUtterance(text);

    // 选择语音
    if (voiceGender) {
      const voice = _selectVoiceByGender(voiceGender, settings);
      if (voice) utterance.voice = voice;
    } else {
      const voice = _selectVoice(settings);
      if (voice) utterance.voice = voice;
    }

    // 如果指定了NPC名字，使用NPC个性化语音参数
    if (npcName) {
      const npcP = _getNpcPersonality(npcName);
      utterance.rate = npcP.voiceRate || settings.rate || 0.85;
      utterance.pitch = npcP.voicePitch || (voiceGender === 'male' ? Math.min(settings.pitch || 0.7, 0.8) : (settings.pitch || 0.7));
    } else {
      utterance.rate = settings.rate || 0.85;
      utterance.pitch = voiceGender === 'male' ? Math.min(settings.pitch || 0.7, 0.8) : (settings.pitch || 0.7);
    }
    utterance.volume = settings.volume || 0.9;
    utterance.lang = settings.lang || 'zh-CN';

    utterance.onend = () => {
      _broadcastSpeaking = false;
      _broadcastCurrentUtterance = null;
      if (onEnd) onEnd();
    };
    utterance.onerror = (e) => {
      console.warn('[Abyss Broadcast] Speech error:', e);
      _broadcastSpeaking = false;
      _broadcastCurrentUtterance = null;
      if (onEnd) onEnd();
    };

    _broadcastSpeaking = true;
    _broadcastCurrentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }
  function _stopSpeaking() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    _broadcastSpeaking = false;
    _broadcastCurrentUtterance = null;
  }

  // 预设广播模板（当没有API时使用）
  const BROADCAST_TEMPLATES = {
    news: [
      { title: '突发新闻', content: '注意，注意。深渊第七层出现异常能量波动，所有猎人请保持警惕。重复，第七层出现异常能量波动，未经授权者禁止进入。猎人公会已派遣调查小队前往，预计两小时内发布详细报告。' },
      { title: '天气预报', content: '深渊气象台提醒您，今夜将有浓雾覆盖第三至第五层，能见度不足三米。部分区域可能出现灵雾现象，请各位猎人随身携带驱灵香，避免长时间暴露在灵雾中。明日凌晨雾气将逐渐消散。' },
      { title: '失踪通报', content: '紧急通报。猎人编号A-7749，代号"铁锈"，于昨日深夜在第四层"沉默回廊"副本中失联。最后已知坐标为北纬三十七度，东经一百二十一度。如有目击者，请立即联系猎人公会前台。' }
    ],
    warning: [
      { title: '安全警告', content: '警告，警告。检测到不明实体正在向遗忘码头方向移动，威胁等级评估为A级。所有非战斗人员请立即撤离至安全区域。战斗人员请在公会大厅集合待命。这不是演习。重复，这不是演习。' },
      { title: '异常通知', content: '深渊管理局通知。近期多名猎人报告在睡眠中听到不明低语声，经调查确认为第六层封印松动所致。请所有入住深渊旅馆的猎人在枕头下放置驱魔符纸，必要时可前往废弃教堂寻求庇护。' }
    ],
    story: [
      { title: '都市怪谈', content: '亲爱的听众朋友们，欢迎收听"深渊午夜故事"。今天的故事名为"第十三级台阶"。据说在猎人公会的地下室里，有一段只有十二级的石阶。但每到午夜十二点，如果你独自走下去，你会发现……多出了第十三级。踏上第十三级台阶的人，会看到自己明天将如何死去。而最恐怖的是……他们看到的未来，从未出过错。' },
      { title: '深渊传说', content: '在深渊最深处，传说存在着一面镜子。这面镜子不会映照出你的外表，而是映照出你内心最深处的恐惧。许多勇士曾试图面对它，但最终都在镜子前失去了理智。唯一活着回来的人说，他在镜子里看到的，是一个和自己一模一样的人，正微笑着看着他。那个笑容，至今仍在他的噩梦中出现。' }
    ],
    ad: [
      { title: '商业广告', content: '各位猎人，您还在为副本中的伤口感到烦恼吗？试试王婆婆的万能草药膏！无论是被怪物抓伤、被机关划伤，还是被队友误伤，只需薄薄涂上一层，立刻止血止痛。现在购买两瓶还送一瓶驱虫喷雾。王婆婆万能草药膏，深渊猎人的居家旅行必备良品。黑市第三摊位有售。' },
      { title: '招募启事', content: '招募启事。深渊外卖联盟现诚招亡灵快递员若干名。要求，生前有送餐经验者优先，能在灵雾中保持方向感，不吃客户的食物。待遇从优，提供免费灵魂修补服务。有意者请联系周黑鸭，或前往遗忘码头四号仓库面试。' }
    ]
  };

  function _getRandomTemplate(type) {
    const templates = BROADCAST_TEMPLATES[type || 'news'];
    if (!templates || !templates.length) return BROADCAST_TEMPLATES.news[0];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  // AI生成广播内容
  async function _generateBroadcast(type) {
    const api = _getAuxApi();
    if (!api) return null;

    const context = _getContextSummary();
    const typeLabels = { news: '新闻播报', warning: '紧急警告', story: '都市怪谈/深渊传说', ad: '搞笑广告/招募启事', music: '音乐节目主持词' };
    const typeLabel = typeLabels[type] || '新闻播报';

    const msgs = [
      {
        role: 'system',
        content: `你是深渊炼狱世界中一个名为"深渊之声"的广播电台的播音员。你的声音低沉而神秘，带有一种淡淡的诡异感。

请根据以下世界信息，生成一段${typeLabel}类型的广播稿。

当前世界信息：
${context.slice(0, 3000)}

要求：
1. 广播内容必须符合深渊炼狱的恐怖生存世界观
2. 语气要像真正的电台播音员，正式但带有深渊世界特有的诡异感
3. 严禁包含任何非文字内容，包括但不限于：音效描述（如"（音效：电流声）"）、舞台指示（如"（停顿）"）、动作描述（如"*清嗓子*"）、括号注释等。只输出播音员实际会说出口的话。
4. 内容类型要求：
   - 新闻播报：报道深渊世界中最近发生的事件，可以和当前剧情相关
   - 紧急警告：发布安全警告、异常通知
   - 都市怪谈：讲述深渊中的恐怖故事或传说
   - 搞笑广告：深渊世界中荒诞的商业广告或招募启事
   - 音乐节目：以DJ身份介绍即将播放的歌曲
5. 长度：150-400字
6. 开头用"各位听众"或类似的称呼
7. 如果当前有最新剧情，广播内容可以侧面提到这些事件
8. 只输出JSON：{"title":"标题","content":"广播正文"}`
      },
      { role: 'user', content: `请生成一段${typeLabel}广播` }
    ];

    try {
      const reply = await _callApi(msgs, { temperature: 0.95, max_tokens: 1200 });
      console.log('[Abyss Broadcast] AI raw reply:', reply);
      let data;
      try {
        data = _safeParseJsonObject(reply);
      } catch (parseErr) {
        // JSON解析失败时，尝试用正则从不完整的文本中提取
        console.warn('[Abyss Broadcast] JSON parse failed, trying regex fallback:', parseErr);
        const titleMatch = reply.match(/["']?title["']?\s*[:：]\s*["']([^"']+)["']/);
        const contentMatch = reply.match(/["']?content["']?\s*[:：]\s*["']([\s\S]+?)(?:["']\s*\}|$)/);
        if (contentMatch) {
          data = {
            title: titleMatch ? titleMatch[1].trim() : typeLabel,
            content: contentMatch[1].trim().replace(/\\n/g, '\n')
          };
        }
      }
      if (data && data.content) {
        return {
          title: String(data.title || typeLabel).trim().slice(0, 30),
          content: String(data.content).trim().slice(0, 1000)
        };
      }
    } catch (e) {
      console.warn('[Abyss Broadcast] AI generate fail:', e);
    }
    return null;
  }

  // 广播界面
  function _drawBroadcast($c) {
    const t = _t();
    const settings = _loadBroadcastSettings();
    const history = _loadBroadcastHistory();
    const hasApi = !!_getAuxApi();
    const hasTTS = !!window.speechSynthesis;

    let o = '';

    // 电台视觉头部
    o += `<div style="text-align:center;padding:16px 0 8px;background:linear-gradient(180deg,rgba(${t.primaryRgb},.08),transparent);border-radius:0 0 20px 20px;margin:-10px -12px 10px;padding:20px 12px 12px">`;
    o += `<div style="font-size:28px;margin-bottom:4px;${_broadcastSpeaking ? 'animation:axBlink 1s infinite' : ''}">📻</div>`;
    o += `<div style="font-size:13px;font-weight:700;color:${t.text};letter-spacing:3px">深 渊 之 声</div>`;
    o += `<div style="font-size:8px;color:${t.textMuted};margin-top:2px;letter-spacing:1px">ABYSS VOICE · FM 66.6</div>`;

    // 播放状态指示
    if (_broadcastSpeaking) {
      o += `<div style="display:flex;align-items:flex-end;justify-content:center;gap:2px;height:16px;margin-top:8px">`;
      for (let i = 0; i < 7; i++) {
        const delay = (i * 0.15).toFixed(2);
        o += `<div style="width:3px;background:${t.primary};border-radius:2px;animation:axMiniBar${(i % 3) + 1} .6s ease infinite alternate;animation-delay:${delay}s;height:${4 + Math.random() * 8}px"></div>`;
      }
      o += `</div>`;
      o += `<div style="font-size:8px;color:${t.primary};margin-top:4px;animation:axBlink 2s infinite">● 正在播出</div>`;
    } else {
      o += `<div style="font-size:8px;color:${t.textMuted};margin-top:8px">○ 待机中</div>`;
    }

    if (!hasTTS) {
      o += `<div style="font-size:8px;color:${t.fail};margin-top:4px;padding:4px 8px;background:rgba(${t.primaryRgb},.08);border-radius:6px">⚠ 你的浏览器不支持语音合成</div>`;
    }

    o += `</div>`;

    // 停止按钮（播放中显示）
    if (_broadcastSpeaking) {
      o += `<div style="text-align:center;margin-bottom:8px">`;
      o += `<button class="ax-dlg-btn ax-dlg-cancel" id="ax-bc-stop" style="padding:6px 20px;font-size:10px">⏹ 停止播放</button>`;
      o += `</div>`;
    }

    // 标签切换
    o += '<div style="display:flex;gap:0;border-bottom:1px solid ' + t.divider + ';margin-bottom:8px">';
    o += `<div class="ax-bag-tab${_broadcastTab === 'live' ? ' on' : ''}" data-bctab="live">📡 直播</div>`;
    o += `<div class="ax-bag-tab${_broadcastTab === 'history' ? ' on' : ''}" data-bctab="history">📋 历史</div>`;
    o += `<div class="ax-bag-tab${_broadcastTab === 'custom' ? ' on' : ''}" data-bctab="custom">✏️ 自定义</div>`;
    o += `<div class="ax-bag-tab${_broadcastTab === 'settings' ? ' on' : ''}" data-bctab="settings">⚙️ 设置</div>`;
    o += '</div>';

    // 内容区
    o += '<div id="ax-bc-content">';
    if (_broadcastTab === 'live') {
      o += _renderBroadcastLive(hasApi, hasTTS);
    } else if (_broadcastTab === 'history') {
      o += _renderBroadcastHistory(history, hasTTS);
    } else if (_broadcastTab === 'custom') {
      o += _renderBroadcastCustom(hasTTS);
    } else if (_broadcastTab === 'settings') {
      o += _renderBroadcastSettings(settings);
    }
    o += '</div>';

    $c.html(o);

    // 事件绑定
    $c.find('[data-bctab]').on('click', function () {
      _broadcastTab = $(this).data('bctab');
      _drawBroadcast($c);
    });

    $c.find('#ax-bc-stop').on('click', () => {
      _stopSpeaking();
      _drawBroadcast($c);
    });

    _wireBroadcastEvents($c);
  }

  function _renderBroadcastLive(hasApi, hasTTS) {
    const t = _t();
    let o = '';

    // 频道选择按钮
    const channels = [
      { type: 'news', icon: '📰', label: '新闻播报' },
      { type: 'warning', icon: '⚠️', label: '紧急警告' },
      { type: 'story', icon: '👻', label: '都市怪谈' },
      { type: 'ad', icon: '📢', label: '深渊广告' }
    ];

    o += `<div style="font-size:9px;color:${t.textDim};text-align:center;margin-bottom:8px">选择频道，收听深渊世界的声音</div>`;

    o += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px">';
    for (const ch of channels) {
      o += `<div class="ax-bc-channel" data-bc-type="${ch.type}" style="display:flex;align-items:center;gap:8px;padding:12px;border-radius:12px;background:${t.surfaceHover};border:1.5px solid ${t.border};cursor:pointer;transition:all .2s">`;
      o += `<span style="font-size:20px">${ch.icon}</span>`;
      o += `<div><div style="font-size:10px;font-weight:600;color:${t.text}">${ch.label}</div>`;
      o += `<div style="font-size:7px;color:${t.textMuted}">${hasApi ? '点击AI生成' : '点击播放预设'}</div></div>`;
      o += `</div>`;
    }
    o += '</div>';

    // 随机播放按钮
    o += `<button class="ax-dlg-btn ax-dlg-ok" id="ax-bc-random" style="width:100%;text-align:center;padding:10px;font-size:11px" ${hasTTS ? '' : 'disabled'}>🎲 随机频道</button>`;

    // 生成状态
    o += `<div id="ax-bc-gen-status" style="margin-top:8px"></div>`;

    return o;
  }

  function _renderBroadcastHistory(history, hasTTS) {
    const t = _t();
    if (!history.length) return `<div style="text-align:center;padding:20px;color:${t.textMuted};font-size:10px;font-style:italic">还没有广播记录<br>去"直播"频道听一段吧</div>`;

    let o = '';
    for (const item of history) {
      const typeIcons = { news: '📰', warning: '⚠️', story: '👻', ad: '📢', custom: '✏️' };
      const icon = typeIcons[item.type] || '📻';
      o += `<div style="padding:8px;border-radius:10px;margin-bottom:4px;background:${t.surfaceHover};transition:background .15s">`;
      o += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">`;
      o += `<span style="font-size:14px">${icon}</span>`;
      o += `<div style="flex:1;min-width:0"><div style="font-size:10px;font-weight:600;color:${t.text}">${_esc(item.title)}</div><div style="font-size:7px;color:${t.textMuted}">${_formatTimeAgo(item.ts)}</div></div>`;
      o += `<button class="ax-api-btn ax-bc-replay" data-bc-id="${item.id}" style="font-size:8px" ${hasTTS ? '' : 'disabled'}>▶ 重播</button>`;
      o += `</div>`;
      o += `<div style="font-size:9px;color:${t.textDim};line-height:1.5;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${_esc(item.content)}</div>`;
      o += `</div>`;
    }

    // 清空按钮
    o += `<div style="text-align:center;margin-top:8px"><button class="ax-api-btn danger" id="ax-bc-clear-history" style="font-size:8px">清空历史</button></div>`;

    return o;
  }

  function _renderBroadcastCustom(hasTTS) {
    const t = _t();
    let o = '';

    o += `<div style="font-size:9px;color:${t.textDim};margin-bottom:6px">输入任何文字，让深渊之声为你朗读</div>`;
    o += `<textarea class="ax-dlg-input" id="ax-bc-custom-text" placeholder="在这里输入你想让深渊之声朗读的内容…

例如：各位听众朋友们，这里是深渊之声。今晚的月色格外诡异……" style="min-height:120px;max-height:200px;resize:vertical;font-size:10px;line-height:1.7"></textarea>`;
    o += `<div style="display:flex;gap:4px;margin-top:6px">`;
    o += `<input class="ax-dlg-input" id="ax-bc-custom-title" type="text" placeholder="广播标题（可选）" maxlength="20" style="flex:1;font-size:10px">`;
    o += `<button class="ax-dlg-btn ax-dlg-ok" id="ax-bc-custom-play" style="flex-shrink:0;padding:6px 16px" ${hasTTS ? '' : 'disabled'}>🎙️ 播出</button>`;
    o += `</div>`;

    // 快捷模板
    o += `<div style="margin-top:10px;font-size:8px;color:${t.textMuted};margin-bottom:4px">💡 快捷模板</div>`;
    o += `<div style="display:flex;gap:4px;flex-wrap:wrap">`;
    const quickTemplates = [
      { label: '开场白', text: '各位亲爱的听众朋友们，欢迎收听深渊之声。我是你们的播音员，在这个漫长的夜晚，让我陪伴各位度过。' },
      { label: '晚安曲', text: '夜已深了，亲爱的猎人们。今天的广播到此结束。愿诸位今夜不被噩梦侵扰，明天依然平安。深渊之声，明晚同一时间，我们不见不散。' },
      { label: '紧急播报', text: '紧急插播！紧急插播！这里是深渊之声紧急频道。请所有猎人立即注意，重复，请所有猎人立即注意。' }
    ];
    for (const tpl of quickTemplates) {
      o += `<button class="ax-api-btn ax-bc-quick-tpl" data-tpl-text="${_esc(tpl.text)}" style="font-size:8px;padding:3px 8px">${tpl.label}</button>`;
    }
    o += `</div>`;

    return o;
  }

  function _renderBroadcastSettings(settings) {
    const t = _t();
    // 强制触发语音加载
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
    const voices = _getVoices();
    let o = '';

    o += `<div style="font-size:9px;color:${t.textDim};margin-bottom:8px">调整深渊之声的参数</div>`;

    // 语音选择 - 兼容手机端
    o += `<div style="margin-bottom:8px">`;
    o += `<div style="font-size:8px;color:${t.textMuted};margin-bottom:3px">🎤 语音（共${voices.length}个可用）</div>`;

    if (voices.length > 0) {
      o += `<select class="ax-model-select" id="ax-bc-voice" style="font-size:9px">`;
      o += `<option value="-1" ${settings.voiceIndex === -1 ? 'selected' : ''}>自动选择</option>`;
      for (let i = 0; i < voices.length; i++) {
        const v = voices[i];
        const label = v.name + ' (' + v.lang + ')';
        o += `<option value="${i}" ${settings.voiceIndex === i ? 'selected' : ''}>${_esc(label)}</option>`;
      }
      o += `</select>`;
    } else {
      o += `<div style="font-size:9px;color:${t.textMuted};font-style:italic;padding:6px;background:${t.surfaceHover};border-radius:8px;margin-bottom:4px">`;
      o += `语音列表未加载。这在手机端是正常的，请点击下方按钮。`;
      o += `</div>`;
    }

    o += `<div style="display:flex;gap:4px;margin-top:4px">`;
    o += `<button class="ax-api-btn" id="ax-bc-refresh-voices" style="font-size:8px;flex:1;text-align:center">🔄 刷新语音列表</button>`;
    o += `<button class="ax-api-btn" id="ax-bc-force-load" style="font-size:8px;flex:1;text-align:center">⚡ 强制加载</button>`;
    o += `</div>`;

    o += `</div>`;

    // 语速
    o += `<div style="margin-bottom:8px">`;
    o += `<div style="display:flex;justify-content:space-between;font-size:8px;color:${t.textMuted};margin-bottom:3px"><span>🐌 语速</span><span id="ax-bc-rate-label">${settings.rate}</span></div>`;
    o += `<input type="range" min="50" max="200" value="${Math.round(settings.rate * 100)}" id="ax-bc-rate" style="width:100%;height:4px;cursor:pointer;accent-color:${t.primary}">`;
    o += `</div>`;

    // 音调
    o += `<div style="margin-bottom:8px">`;
    o += `<div style="display:flex;justify-content:space-between;font-size:8px;color:${t.textMuted};margin-bottom:3px"><span>🔊 音调（越低越诡异）</span><span id="ax-bc-pitch-label">${settings.pitch}</span></div>`;
    o += `<input type="range" min="0" max="200" value="${Math.round(settings.pitch * 100)}" id="ax-bc-pitch" style="width:100%;height:4px;cursor:pointer;accent-color:${t.primary}">`;
    o += `</div>`;

    // 音量
    o += `<div style="margin-bottom:8px">`;
    o += `<div style="display:flex;justify-content:space-between;font-size:8px;color:${t.textMuted};margin-bottom:3px"><span>🔈 音量</span><span id="ax-bc-vol-label">${Math.round(settings.volume * 100)}%</span></div>`;
    o += `<input type="range" min="0" max="100" value="${Math.round(settings.volume * 100)}" id="ax-bc-vol" style="width:100%;height:4px;cursor:pointer;accent-color:${t.primary}">`;
    o += `</div>`;

    // 试听按钮
    o += `<div style="display:flex;gap:4px;margin-top:10px">`;
    o += `<button class="ax-dlg-btn ax-dlg-ok" id="ax-bc-test" style="flex:1;text-align:center;font-size:10px">🎙️ 试听</button>`;
    o += `<button class="ax-dlg-btn ax-dlg-cancel" id="ax-bc-reset" style="flex-shrink:0;font-size:10px">↩️ 重置</button>`;
    o += `</div>`;

    return o;
  }

  function _wireBroadcastEvents($c) {
    const t = _t();

    // 频道按钮
    $c.find('.ax-bc-channel').on('click', async function () {
      const type = $(this).data('bc-type');
      const $status = $('#ax-bc-gen-status');
      const hasApi = !!_getAuxApi();

      // 如果正在播放，先停止
      _stopSpeaking();

      let broadcast;

      if (hasApi) {
        $status.html(`<div style="text-align:center;padding:8px;color:${t.textMuted};font-size:9px"><div class="ax-chat-typing-dots" style="display:inline-flex;gap:3px"><span></span><span></span><span></span></div><div style="margin-top:4px">正在生成广播内容…</div></div>`);
        broadcast = await _generateBroadcast(type);
      }

      if (!broadcast) {
        // 没有API或生成失败，使用预设模板
        const tpl = _getRandomTemplate(type);
        broadcast = { title: tpl.title, content: tpl.content };
      }

      // 保存到历史
      _addBroadcastHistory({ type, title: broadcast.title, content: broadcast.content });

      // 显示广播内容
      $status.html(
        `<div style="padding:10px;background:${t.surfaceHover};border-radius:12px;border-left:3px solid ${t.primary};animation:axUp .3s ease">` +
        `<div style="font-size:10px;font-weight:600;color:${t.accent};margin-bottom:4px">📻 ${_esc(broadcast.title)}</div>` +
        `<div style="font-size:9px;color:${t.textDim};line-height:1.7;white-space:pre-wrap">${_esc(broadcast.content)}</div>` +
        `</div>`
      );

      // 开始朗读
      _speak(broadcast.content, () => {
        _drawBroadcast($c);
      });

      // 刷新播放状态显示
      setTimeout(() => _drawBroadcast($c), 100);
    });

    // 随机频道
    $c.find('#ax-bc-random').on('click', function () {
      const types = ['news', 'warning', 'story', 'ad'];
      const type = types[Math.floor(Math.random() * types.length)];
      $c.find(`.ax-bc-channel[data-bc-type="${type}"]`).trigger('click');
    });

    // 历史重播
    $c.find('.ax-bc-replay').on('click', function () {
      const id = $(this).data('bc-id');
      const history = _loadBroadcastHistory();
      const item = history.find(h => h.id === id);
      if (!item) return;
      _stopSpeaking();
      _speak(item.content, () => {
        _drawBroadcast($c);
      });
      setTimeout(() => _drawBroadcast($c), 100);
    });

    // 清空历史
    $c.find('#ax-bc-clear-history').on('click', () => {
      const w = _dialog(`<div class="ax-dlg-h">清空广播历史</div><div class="ax-dlg-sub">确定清空所有广播记录？</div><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-bch-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-bch-yes" style="color:${t.fail}">清空</button></div>`);
      $('#ax-bch-no').on('click', () => w.remove());
      $('#ax-bch-yes').on('click', () => {
        _saveBroadcastHistory([]);
        w.remove();
        _drawBroadcast($c);
      });
    });

    // 自定义播放
    $c.find('#ax-bc-custom-play').on('click', function () {
      const text = $('#ax-bc-custom-text').val().trim();
      if (!text) {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 请输入广播内容');
        return;
      }
      const title = $('#ax-bc-custom-title').val().trim() || '自定义广播';
      _stopSpeaking();
      _addBroadcastHistory({ type: 'custom', title, content: text });
      _speak(text, () => { _drawBroadcast($c); });
      setTimeout(() => _drawBroadcast($c), 100);
    });

    // 快捷模板
    $c.find('.ax-bc-quick-tpl').on('click', function () {
      const text = $(this).data('tpl-text');
      $('#ax-bc-custom-text').val(text);
    });

    // 设置：语音选择
    $c.find('#ax-bc-voice').on('change', function () {
      const s = _loadBroadcastSettings();
      s.voiceIndex = parseInt($(this).val());
      _saveBroadcastSettings(s);
    });

    // 设置：语速
    $c.find('#ax-bc-rate').on('input', function () {
      const val = parseInt($(this).val()) / 100;
      $('#ax-bc-rate-label').text(val.toFixed(2));
      const s = _loadBroadcastSettings();
      s.rate = val;
      _saveBroadcastSettings(s);
    });

    // 设置：音调
    $c.find('#ax-bc-pitch').on('input', function () {
      const val = parseInt($(this).val()) / 100;
      $('#ax-bc-pitch-label').text(val.toFixed(2));
      const s = _loadBroadcastSettings();
      s.pitch = val;
      _saveBroadcastSettings(s);
    });

    // 设置：音量
    $c.find('#ax-bc-vol').on('input', function () {
      const val = parseInt($(this).val());
      $('#ax-bc-vol-label').text(val + '%');
      const s = _loadBroadcastSettings();
      s.volume = val / 100;
      _saveBroadcastSettings(s);
    });

    // 试听
    $c.find('#ax-bc-test').on('click', () => {
      _stopSpeaking();
      _speak('这里是深渊之声，FM六十六点六。在这漫长而诡异的夜晚，让我的声音陪伴你穿越黑暗。', () => {
        _drawBroadcast($c);
      });
      setTimeout(() => _drawBroadcast($c), 100);
    });

    // 重置设置
    $c.find('#ax-bc-reset').on('click', () => {
      localStorage.removeItem(BROADCAST_SETTINGS_KEY);
      _drawBroadcast($c);
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 广播设置已重置');
    });

    // 刷新语音列表
    $c.find('#ax-bc-refresh-voices').on('click', () => {
      if (!window.speechSynthesis) {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=error 浏览器不支持语音合成');
        return;
      }
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=info 正在加载语音列表…');
      window.speechSynthesis.getVoices();
      // 多次延迟尝试，手机端可能需要更长时间
      let retries = 0;
      const tryLoad = () => {
        const v = window.speechSynthesis.getVoices();
        if (v && v.length > 0) {
          if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 已加载 ' + v.length + ' 个语音');
          _drawBroadcast($c);
        } else if (retries < 6) {
          retries++;
          setTimeout(tryLoad, 500);
        } else {
          if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 语音列表仍为空，请尝试"强制加载"');
          _drawBroadcast($c);
        }
      };
      setTimeout(tryLoad, 300);
    });

    // 强制加载：通过播放一个静音的utterance来触发voiceschanged
    $c.find('#ax-bc-force-load').on('click', () => {
      if (!window.speechSynthesis) return;
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=info 正在强制触发语音加载…');
      // 播放一个空的utterance来触发浏览器加载语音
      const dummy = new SpeechSynthesisUtterance('');
      dummy.volume = 0;
      dummy.rate = 10; // 极快，瞬间结束
      window.speechSynthesis.speak(dummy);
      // 同时注册voiceschanged监听
      let loaded = false;
      const onVoicesChanged = () => {
        if (loaded) return;
        loaded = true;
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        const v = window.speechSynthesis.getVoices();
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 语音已加载：' + v.length + ' 个');
        _drawBroadcast($c);
      };
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      // 备用：3秒后无论如何刷新
      setTimeout(() => {
        if (!loaded) {
          loaded = true;
          window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
          const v2 = window.speechSynthesis.getVoices();
          if (v2.length > 0) {
            if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 语音已加载：' + v2.length + ' 个');
          } else {
            if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 手机端可能不支持语音列表选择，但朗读功能仍然可用');
          }
          _drawBroadcast($c);
        }
      }, 3000);
    });
  }

  function _drawRadio($c) {
    const t = _t();
    const history = _loadRadioHistory();
    const favorites = _loadRadioFavorites();
    const hasApi = !!_getAuxApi();

    let o = '';

    // 播放器区域
    o += `<div id="ax-radio-player" style="margin-bottom:8px"></div>`;
    // 状态区域
    o += `<div id="ax-radio-status"></div>`;

    // 标签切换
    o += '<div style="display:flex;gap:0;border-bottom:1px solid ' + t.divider + ';margin-bottom:8px">';
    o += `<div class="ax-bag-tab${_radioTab === 'search' ? ' on' : ''}" data-rtab="search">🔍 搜索</div>`;
    o += `<div class="ax-bag-tab${_radioTab === 'npc' ? ' on' : ''}" data-rtab="npc">💬 推荐</div>`;
    o += `<div class="ax-bag-tab${_radioTab === 'favorites' ? ' on' : ''}" data-rtab="favorites">❤️ 收藏${favorites.length ? ' (' + favorites.length + ')' : ''}</div>`;
    o += `<div class="ax-bag-tab${_radioTab === 'history' ? ' on' : ''}" data-rtab="history">📋 历史</div>`;
    o += `<div class="ax-bag-tab${_radioTab === 'playlist' ? ' on' : ''}" data-rtab="playlist">📃 列表${_radioPlaylist.length ? ' (' + _radioPlaylist.length + ')' : ''}</div>`;
    o += '</div>';

    // 内容区
    o += '<div id="ax-radio-content">';
    if (_radioTab === 'search') {
      o += _renderRadioSearchTab();
    } else if (_radioTab === 'npc') {
      o += _renderRadioNpcTab(hasApi);
    } else if (_radioTab === 'favorites') {
      o += _renderRadioSongList(favorites, '还没有收藏歌曲', true);
    } else if (_radioTab === 'history') {
      o += _renderRadioSongList(history, '还没有播放记录', false);
    } else if (_radioTab === 'playlist') {
      o += _renderRadioPlaylistTab();
    }
    o += '</div>';

    $c.html(o);

    // 初始化播放器显示
    _updateRadioPlayer($('#ax-radio-player'));

    // 标签切换
    $c.find('[data-rtab]').on('click', function () {
      _radioTab = $(this).data('rtab');
      _drawRadio($c);
    });

    // 绑定各Tab事件
    _wireRadioTabEvents($c);

    // 预加载Music.js
    _ensureMusicLib();
  }

  function _renderRadioSearchTab() {
    const t = _t();
    let o = '';

    // 搜索栏
    o += `<div style="display:flex;gap:4px;margin-bottom:6px">`;
    o += `<input class="ax-dlg-input" id="ax-radio-search-input" type="text" placeholder="输入歌名、歌手搜索…" style="font-size:10px;padding:6px 10px;flex:1">`;
    o += `<button class="ax-dlg-btn ax-dlg-ok" id="ax-radio-search-btn" style="flex-shrink:0">搜索</button>`;
    o += `</div>`;

    // 歌手搜索栏
    o += `<div style="display:flex;gap:4px;margin-bottom:8px">`;
    o += `<input class="ax-dlg-input" id="ax-radio-artist-input" type="text" placeholder="输入歌手名，获取歌单…" style="font-size:10px;padding:6px 10px;flex:1">`;
    o += `<button class="ax-dlg-btn ax-dlg-cancel" id="ax-radio-artist-btn" style="flex-shrink:0">歌单</button>`;
    o += `</div>`;

    // 快捷标签
    o += `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">`;
    const quickTags = ['周杰伦 晴天', '薛之谦 演员', '陈奕迅 孤勇者', 'YOASOBI アイドル', '许嵩 断桥残雪', 'Aimer 残響散歌'];
    for (const tag of quickTags) {
      o += `<span class="ax-radio-quick" data-q="${_esc(tag)}" style="font-size:8px;padding:3px 8px;border-radius:6px;background:${t.surfaceHover};color:${t.textDim};cursor:pointer;transition:all .2s">${_esc(tag.length > 10 ? tag.slice(0, 10) : tag)}</span>`;
    }
    o += `</div>`;

    // 搜索结果区
    o += `<div id="ax-radio-results"></div>`;

    return o;
  }

  function _renderRadioNpcTab(hasApi) {
    const t = _t();
    let o = '';
    if (!hasApi) {
      o += `<div style="text-align:center;padding:20px;color:${t.fail};font-size:10px">需要配置API接口</div>`;
      return o;
    }
    // 收集所有可用NPC（合并好友列表、NPC关系、核心NPC，去重）
    const npcSet = new Set();
    // ★ 1. 核心NPC列表（最高优先级，确保始终出现）
    CORE_NPC_LIST.forEach(n => { if (n && !_isBlocked(n)) npcSet.add(n); });
    // 2. 好友列表
    _getFriendList().forEach(f => { if (f && f.name && !_isBlocked(f.name)) npcSet.add(f.name); });
    // 3. NPC关系数据
    const d = _load();
    if (d && d['NPC关系'] && typeof d['NPC关系'] === 'object') {
      Object.keys(d['NPC关系']).forEach(k => {
        if (k && !_skip(k) && !_isBlocked(k)) npcSet.add(k);
      });
    }
    // 4. 有聊天记录的NPC
    _getConversationList().forEach(n => {
      if (n && typeof n === 'string' && n !== 'null' && n !== 'undefined' && !_isBlocked(n)) npcSet.add(n);
    });
    const npcFriends = Array.from(npcSet).filter(n => n && typeof n === 'string' && n.trim().length > 0);
    console.log('[Abyss Radio] NPC推荐列表:', npcFriends); // 调试用，确认后可删除

    o += `<div style="text-align:center;padding:8px 0;font-size:9px;color:${t.textDim}">选择一个NPC为你推荐歌曲，推荐后自动播放</div>`;
    o += `<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:8px">`;
    for (const name of npcFriends) {
      const emoji = _getNpcEmoji(name);
      o += `<div class="ax-radio-npc-btn" data-npc="${_esc(name)}" style="display:flex;align-items:center;gap:4px;padding:6px 12px;border-radius:10px;background:${t.surfaceHover};border:1px solid ${t.border};cursor:pointer;transition:all .2s;font-size:10px;color:${t.text}"><span>${emoji}</span>${_esc(name)}</div>`;
    }
    o += `</div>`;
    o += `<div id="ax-radio-npc-result"></div>`;
    return o;
  }

  function _renderRadioSongList(list, emptyMsg, showDelete) {
    const t = _t();
    if (!list.length) return `<div style="text-align:center;padding:20px;color:${t.textMuted};font-size:9px;font-style:italic">${emptyMsg}</div>`;

    // 全部播放按钮
    let o = '';
    if (list.length > 1) {
      o += `<div style="display:flex;gap:4px;margin-bottom:6px">`;
      o += `<button class="ax-dlg-btn ax-dlg-ok ax-radio-play-all" style="flex:1;text-align:center;font-size:9px">▶ 全部播放 (${list.length}首)</button>`;
      o += `<button class="ax-dlg-btn ax-dlg-cancel ax-radio-shuffle-all" style="flex-shrink:0;font-size:9px">🔀 随机播放</button>`;
      o += `</div>`;
    }

    for (let i = 0; i < list.length; i++) {
      const song = list[i];
      o += `<div class="ax-radio-list-item" data-keyword="${_esc(song.keyword || (song.name + ' ' + song.artist))}" data-idx="${i}" style="display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:10px;margin-bottom:2px;cursor:pointer;transition:background .15s">`;
      o += `<span style="font-size:14px;width:18px;text-align:center;color:${t.textMuted};font-size:9px">${i + 1}</span>`;
      o += `<div style="flex:1;min-width:0"><div style="font-size:10px;color:${t.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${_esc(song.name)}</div><div style="font-size:8px;color:${t.textMuted}">${_esc(song.artist)}</div></div>`;
      if (song.ts) o += `<span style="font-size:7px;color:${t.textMuted}">${_formatTimeAgo(song.ts)}</span>`;
      o += `</div>`;
    }
    return o;
  }

  function _renderRadioPlaylistTab() {
    const t = _t();
    if (!_radioPlaylist.length) return `<div style="text-align:center;padding:20px;color:${t.textMuted};font-size:9px;font-style:italic">播放列表为空<br>搜索或获取歌单后会自动填充</div>`;

    let o = '';
    o += `<div style="display:flex;gap:4px;margin-bottom:6px;align-items:center">`;
    o += `<span style="font-size:9px;color:${t.textDim}">共 ${_radioPlaylist.length} 首</span>`;
    o += `<span style="margin-left:auto"></span>`;
    o += `<button class="ax-api-btn ax-radio-clear-playlist" style="font-size:8px">清空列表</button>`;
    o += `</div>`;

    for (let i = 0; i < _radioPlaylist.length; i++) {
      const song = _radioPlaylist[i];
      const isActive = i === _radioPlaylistIndex;
      o += `<div class="ax-radio-pl-item" data-pl-idx="${i}" style="display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:10px;margin-bottom:2px;cursor:pointer;transition:background .15s;${isActive ? 'background:' + t.surfaceActive + ';border-left:3px solid ' + t.primary : ''}">`;
      o += `<span style="font-size:9px;width:18px;text-align:center;color:${isActive ? t.primary : t.textMuted}">${isActive && _radioPlaying ? '▶' : (i + 1)}</span>`;
      o += `<div style="flex:1;min-width:0"><div style="font-size:10px;color:${isActive ? t.accent : t.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${isActive ? 'font-weight:600' : ''}">${_esc(song.name)}</div><div style="font-size:8px;color:${t.textMuted}">${_esc(song.artist)}</div></div>`;
      o += `</div>`;
    }
    return o;
  }

  function _wireRadioTabEvents($c) {
    const t = _t();

    // 搜索按钮
    $c.find('#ax-radio-search-btn').on('click', () => {
      const kw = $('#ax-radio-search-input').val().trim();
      if (kw) _playMusic(kw, $c);
    });
    $c.find('#ax-radio-search-input').on('keydown', function (e) {
      if (e.key === 'Enter') {
        const kw = $(this).val().trim();
        if (kw) _playMusic(kw, $c);
      }
    });

    // 歌手搜索（获取歌单）
    $c.find('#ax-radio-artist-btn').on('click', async function () {
      const artist = $('#ax-radio-artist-input').val().trim();
      if (!artist) { if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 请输入歌手名'); return; }
      const $btn = $(this);
      const $results = $('#ax-radio-results');
      $btn.prop('disabled', true).text('搜索中…');
      $results.html(`<div style="text-align:center;padding:12px;color:${t.textMuted};font-size:9px"><div class="ax-chat-typing-dots" style="display:inline-flex;gap:3px"><span></span><span></span><span></span></div><div style="margin-top:4px">正在搜索 ${_esc(artist)} 的歌曲…</div></div>`);

      // 用API辅助生成歌手的知名歌曲列表
      let songNames = [];
      const api = _getAuxApi();
      if (api) {
        try {
          const msgs = [
            {
              role: 'system',
              content: `请列出歌手"${artist}"最知名的8-12首歌曲名称。只输出歌曲名称，每行一首，不要编号，不要其他文字。只输出真实存在的歌曲。`
            },
            { role: 'user', content: `列出${artist}的歌曲` }
          ];
          const reply = await _callApi(msgs, { temperature: 0.3, max_tokens: 300 });
          songNames = reply.split('\n').map(s => s.replace(/^\d+[\.\、\)\s]+/, '').trim()).filter(s => s.length > 0 && s.length < 30);
        } catch (e) {
          console.warn('[Abyss Radio] AI song list fail:', e);
        }
      }

      // 如果API没返回结果，回退到直接搜索
      if (!songNames.length) {
        songNames = [artist, artist + ' 歌曲', artist + ' 热门'];
      }

      // 逐首搜索并构建歌单
      const playlist = [];
      const seenNames = new Set();
      for (const songName of songNames) {
        const kw = songName + ' ' + artist;
        try {
          const result = await _searchAndPlayMusic(kw);
          if (result.success && result.data && result.data.Name && !seenNames.has(result.data.Name)) {
            seenNames.add(result.data.Name);
            playlist.push({
              name: result.data.Name,
              artist: result.data.Singer || artist,
              keyword: result.data.Name + ' ' + (result.data.Singer || artist),
              url: result.data.Url || '',
              lyric: result.data.Lyric || ''
            });
          }
        } catch (e) { }
        // 显示进度
        $results.find('div:last').text(`正在搜索… 已找到 ${playlist.length} 首`);
        if (playlist.length >= 10) break;
      }

      $btn.prop('disabled', false).text('歌单');

      if (!playlist.length) {
        $results.html(`<div style="text-align:center;padding:12px;color:${t.fail};font-size:9px">未找到 ${_esc(artist)} 的歌曲</div>`);
        return;
      }

      // 设为播放列表
      _setPlaylist(playlist, 0);

      // 显示歌单
      let rHtml = `<div style="font-size:9px;color:${t.textDim};margin-bottom:6px">${_esc(artist)} 的歌单 (${playlist.length}首)</div>`;
      rHtml += `<div style="display:flex;gap:4px;margin-bottom:6px">`;
      rHtml += `<button class="ax-dlg-btn ax-dlg-ok ax-radio-pl-play-all" style="flex:1;text-align:center;font-size:9px">▶ 顺序播放</button>`;
      rHtml += `<button class="ax-dlg-btn ax-dlg-cancel ax-radio-pl-shuffle" style="flex-shrink:0;font-size:9px">🔀 随机播放</button>`;
      rHtml += `</div>`;

      for (let i = 0; i < playlist.length; i++) {
        const s = playlist[i];
        rHtml += `<div class="ax-radio-pl-song" data-pl-i="${i}" style="display:flex;align-items:center;gap:6px;padding:6px;border-radius:8px;margin-bottom:2px;cursor:pointer;transition:background .15s">`;
        rHtml += `<span style="font-size:8px;color:${t.textMuted};width:16px;text-align:center">${i + 1}</span>`;
        rHtml += `<div style="flex:1;min-width:0"><div style="font-size:10px;color:${t.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${_esc(s.name)}</div><div style="font-size:8px;color:${t.textMuted}">${_esc(s.artist)}</div></div>`;
        rHtml += `</div>`;
      }
      $results.html(rHtml);

      // 点击单首播放
      $results.find('.ax-radio-pl-song').on('click', function () {
        const idx = parseInt($(this).data('pl-i'));
        _radioPlaylistIndex = idx;
        _playMusicDirect(_radioPlaylist[idx]);
      });
      // 全部顺序播放
      $results.find('.ax-radio-pl-play-all').on('click', () => {
        _radioShuffle = false;
        _radioRepeat = 'all';
        _radioPlaylistIndex = 0;
        _playMusicDirect(_radioPlaylist[0]);
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 开始顺序播放歌单');
      });
      // 随机播放
      $results.find('.ax-radio-pl-shuffle').on('click', () => {
        _radioShuffle = true;
        _radioRepeat = 'all';
        _radioPlaylistIndex = Math.floor(Math.random() * _radioPlaylist.length);
        _playMusicDirect(_radioPlaylist[_radioPlaylistIndex]);
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 开始随机播放歌单');
      });
    });

    // 快捷标签
    $c.find('.ax-radio-quick').on('click', function () {
      const kw = $(this).data('q');
      $('#ax-radio-search-input').val(kw);
      _playMusic(kw, $c);
    });

    // 收藏/历史列表点击播放
    $c.find('.ax-radio-list-item').on('click', function () {
      const kw = $(this).data('keyword');
      if (kw) _playMusic(kw, $c);
    });

    // 全部播放/随机播放（收藏和历史列表）
    $c.find('.ax-radio-play-all').on('click', function () {
      const list = _radioTab === 'favorites' ? _loadRadioFavorites() : _loadRadioHistory();
      if (!list.length) return;
      _setPlaylist(list.map(s => ({ name: s.name, artist: s.artist, keyword: s.keyword || (s.name + ' ' + s.artist) })), 0);
      _radioShuffle = false;
      _radioRepeat = 'all';
      _playMusicDirect(_radioPlaylist[0]);
    });
    $c.find('.ax-radio-shuffle-all').on('click', function () {
      const list = _radioTab === 'favorites' ? _loadRadioFavorites() : _loadRadioHistory();
      if (!list.length) return;
      _setPlaylist(list.map(s => ({ name: s.name, artist: s.artist, keyword: s.keyword || (s.name + ' ' + s.artist) })), 0);
      _radioShuffle = true;
      _radioRepeat = 'all';
      _radioPlaylistIndex = Math.floor(Math.random() * _radioPlaylist.length);
      _playMusicDirect(_radioPlaylist[_radioPlaylistIndex]);
    });

    // NPC推荐
    $c.find('.ax-radio-npc-btn').on('click', async function () {
      const npc = $(this).data('npc');
      const $result = $('#ax-radio-npc-result');
      $result.html(`<div style="text-align:center;padding:12px;color:${t.textMuted};font-size:9px"><div class="ax-chat-typing-dots" style="display:inline-flex;gap:3px"><span></span><span></span><span></span></div><div style="margin-top:6px">${_esc(npc)}正在选歌…</div></div>`);

      try {
        const rec = await _npcRecommendSong(npc);
        if (rec) {
          const searchKw = rec.songName + ' ' + rec.artist;
          $result.html(`<div style="padding:10px;border-radius:12px;background:${t.surfaceHover};margin-top:4px"><div style="font-size:9px;color:${t.textDim};margin-bottom:6px;font-style:italic">"${_esc(rec.reason)}"</div><div style="font-size:11px;font-weight:600;color:${t.text}">🎵 ${_esc(rec.songName)} - ${_esc(rec.artist)}</div><div style="font-size:8px;color:${t.textMuted};margin-top:4px">正在自动搜索并播放…</div></div>`);
          setTimeout(() => _playMusic(searchKw, $c), 500);
        }
      } catch (e) {
        $result.html(`<div style="text-align:center;padding:8px;color:${t.fail};font-size:9px">推荐失败：${_esc(e.message || '未知')}</div>`);
      }
    });

    // 播放列表Tab
    $c.find('.ax-radio-pl-item').on('click', function () {
      const idx = parseInt($(this).data('pl-idx'));
      if (isNaN(idx) || !_radioPlaylist[idx]) return;
      _radioPlaylistIndex = idx;
      _playMusicDirect(_radioPlaylist[idx]);
    });
    $c.find('.ax-radio-clear-playlist').on('click', function () {
      _radioPlaylist = [];
      _radioPlaylistIndex = -1;
      _drawRadio($c);
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 播放列表已清空');
    });
  }

  // NPC推荐歌曲（增强解析容错）
  async function _npcRecommendSong(npcName) {
    const personality = _getNpcPersonality(npcName);
    const context = _getContextSummary();

    let playerName = '玩家';
    try { if (typeof getContext === 'function') { const ctx = getContext(); if (ctx.name1) playerName = ctx.name1; } } catch (e) { }

    const msgs = [
      {
        role: 'system',
        content: `你是"${npcName}"，要给"${playerName}"推荐一首歌。

你的性格：${personality.personality}

当前世界信息：
${context.slice(0, 2000)}

要求：
1. 推荐一首真实存在且较知名的歌曲（中文歌、日文歌、英文歌均可）
2. 推荐理由用第一人称，像发微信一样随意
3. 必须严格按以下格式回复，每行一个字段，不要有多余文字：
歌名: 歌曲名称
歌手: 歌手名称
理由: 推荐理由
4. 示例：
歌名: 晴天
歌手: 周杰伦
理由: 这歌让我想起以前在老家的日子了 🎶`
      },
      { role: 'user', content: '给我推荐一首歌吧' }
    ];

    const reply = await _callApi(msgs, { temperature: 0.95, max_tokens: 200 });

    let songName = '', artist = '', reason = '';

    // 策略1：逐行key:value解析（中英文都试）
    const songMatch = reply.match(/(?:歌名|songName|song|曲名|歌曲)\s*[:：]\s*(.+)/i);
    const artistMatch = reply.match(/(?:歌手|artist|singer|演唱)\s*[:：]\s*(.+)/i);
    const reasonMatch = reply.match(/(?:理由|reason|推荐理由|原因)\s*[:：]\s*(.+)/i);
    if (songMatch) songName = songMatch[1].trim().replace(/^["'《「」]|["'》」]$/g, '');
    if (artistMatch) artist = artistMatch[1].trim().replace(/^["'《「」]|["'》」]$/g, '');
    if (reasonMatch) reason = reasonMatch[1].trim().replace(/^["'《「」]|["'》」]$/g, '');

    // 策略2：JSON解析
    if (!songName) {
      try {
        const data = _safeParseJsonObject(reply);
        if (data) {
          songName = data.songName || data.song_name || data.song || data.name || data['歌名'] || '';
          artist = data.artist || data.singer || data['歌手'] || '';
          reason = data.reason || data.comment || data.message || data['理由'] || '';
        }
      } catch (e) { }
    }

    // 策略3：从文本中提取书名号
    if (!songName) {
      const bracketMatch = reply.match(/[《「]([^》」]+)[》」]/);
      if (bracketMatch) songName = bracketMatch[1].trim();
      const dashMatch = reply.match(/[""]([^""]+)[""]\s*[-—]\s*([^\n,，]+)/);
      if (!songName && dashMatch) { songName = dashMatch[1].trim(); artist = dashMatch[2].trim(); }
    }

    // 策略4：最后尝试把整个回复的第一行当歌名
    if (!songName) {
      const firstLine = reply.split('\n').map(l => l.trim()).filter(l => l.length > 0 && l.length < 30)[0];
      if (firstLine) songName = firstLine.replace(/^["'《「」]|["'》」]$/g, '');
    }

    if (!songName) throw new Error('无法从推荐中提取歌曲信息');

    return {
      songName: String(songName).trim(),
      artist: String(artist || '').trim(),
      reason: String(reason || '推荐了一首歌').trim()
    };
  }

  /* ═══════════════════════════════════════
     🎨 主题（含图片导入）
     ═══════════════════════════════════════ */
  function _drawTheme($c) {
    const t = _t();
    let o = '<div class="ax-theme-list">';
    for (const k of THEME_KEYS) {
      const tm = THEMES[k], a = k === _currentTheme;
      o += `<div class="ax-theme-row${a ? ' active' : ''}" data-theme="${k}"><span class="ax-theme-row-icon">${tm.icon}</span><span class="ax-theme-row-name" style="color:${a ? t.text : t.textDim}">${tm.name}</span><div class="ax-theme-row-dots"><span class="ax-theme-row-dot" style="background:${tm.primary}"></span><span class="ax-theme-row-dot" style="background:${tm.accent}"></span><span class="ax-theme-row-dot" style="background:${tm.bg}"></span></div><span class="ax-theme-row-check" style="color:${tm.primary}">✓</span></div>`;
    }
    o += '</div>';
    // 字体设置区
    const fontSettings = _loadFontSettings();
    o += '<div class="ax-img-sec" style="margin-top:0;padding-top:10px;border-top:1px solid ' + t.divider + '">';
    o += '<div class="ax-img-sec-h">🔤 字 体 设 置</div>';

    // 字体选择
    o += '<div style="display:flex;align-items:center;gap:6px;padding:4px 0;margin-bottom:4px">';
    o += '<span style="font-size:9px;color:' + t.textDim + ';min-width:36px">字体</span>';
    o += '<select class="ax-model-select" id="ax-font-family" style="font-size:9px;flex:1">';
    for (const [k, v] of Object.entries(FONT_FAMILIES)) {
      o += '<option value="' + k + '"' + (fontSettings.family === k ? ' selected' : '') + '>' + v.name + '</option>';
    }
    o += '</select>';
    o += '</div>';

    // 字号选择（自定义滑块）
    const currentScale = _getFontScale();
    const displayPct = Math.round(currentScale * 100);
    o += '<div style="display:flex;align-items:center;gap:6px;padding:4px 0;margin-bottom:6px">';
    o += '<span style="font-size:9px;color:' + t.textDim + ';min-width:36px">字号</span>';
    o += '<input type="range" min="60" max="180" value="' + displayPct + '" id="ax-font-slider" style="flex:1;height:4px;cursor:pointer;accent-color:' + t.primary + '">';
    o += '<span id="ax-font-pct" style="font-size:9px;color:' + t.accent + ';font-weight:600;min-width:32px;text-align:right">' + displayPct + '%</span>';
    o += '</div>';
    // 预设快捷按钮
    o += '<div style="display:flex;gap:4px;margin-bottom:6px">';
    const presets = [{ label: '小', val: 85 }, { label: '默认', val: 100 }, { label: '大', val: 115 }, { label: '特大', val: 130 }];
    for (const p of presets) {
      const isActive = displayPct === p.val;
      o += '<div class="ax-font-preset-btn" data-fpct="' + p.val + '" style="flex:1;text-align:center;padding:4px 0;border-radius:8px;font-size:8px;cursor:pointer;transition:all .2s;' + (isActive ? 'background:rgba(' + t.primaryRgb + ',.15);color:' + t.primary + ';border:1px solid rgba(' + t.primaryRgb + ',.3)' : 'background:' + t.surfaceHover + ';color:' + t.textDim + ';border:1px solid transparent') + '">' + p.label + '</div>';
    }
    o += '</div>';

    // 预览
    o += '<div style="padding:8px 10px;background:' + t.surfaceHover + ';border-radius:10px;font-size:10px;color:' + t.textDim + ';line-height:1.5;font-style:italic">预览文字：深渊炼狱的夜空中星光闪烁。</div>';
    o += '</div>';
    o += '<div class="ax-img-sec">';
    o += '<div class="ax-img-sec-h">🖼️ 图 片 管 理</div>';
    const wpHas = !!_getWallpaper();
    o += '<div class="ax-img-row">';
    o += `<div class="ax-img-preview" style="${wpHas ? "background-image:url('" + _getWallpaper() + "')" : ''}">`;
    if (!wpHas) o += '🌄';
    o += '</div>';
    o += '<div class="ax-img-info"><div class="ax-img-label">桌面壁纸</div>';
    o += `<div class="ax-img-status">${wpHas ? '已设置' : '默认渐变'}</div></div>`;
    o += '<div class="ax-img-btns">';
    o += '<button class="ax-img-btn" id="ax-wp-pick">导入</button>';
    if (wpHas) o += '<button class="ax-img-btn danger" id="ax-wp-clear">清除</button>';
    o += '</div></div>';
    for (const npc of CORE_NPC_LIST) {
      const url = _getAvatar(npc);
      const has = !!url;
      o += '<div class="ax-img-row">';
      o += `<div class="ax-img-preview" style="${has ? "background-image:url('" + url + "')" : ''}">`;
      if (!has) o += (NPC_FALLBACK_EMOJI[npc] || '👤');
      o += '</div>';
      o += `<div class="ax-img-info"><div class="ax-img-label">${npc} 头像</div>`;
      o += `<div class="ax-img-status">${has ? '已设置' : '默认emoji'}</div></div>`;
      o += '<div class="ax-img-btns">';
      o += `<button class="ax-img-btn ax-av-pick" data-npc="${_esc(npc)}">导入</button>`;
      if (has) o += `<button class="ax-img-btn danger ax-av-clear" data-npc="${_esc(npc)}">清除</button>`;
      o += '</div></div>';
    }
    o += '</div>';
    $c.html(o);
    $c.find('.ax-theme-row').on('click', function () { const k = $(this).data('theme'); if (k !== _currentTheme) { _applyTheme(k); if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 主题已切换为「' + THEMES[k].name + '」'); } });
    $c.find('#ax-wp-pick').on('click', () => { _pickImage('wallpaper', 800, 1200, () => { if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 壁纸已更新'); _render(); }); });
    $c.find('#ax-wp-clear').on('click', () => { _clearImg('wallpaper'); if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 壁纸已清除'); _render(); });
    $c.find('.ax-av-pick').on('click', function () { const npc = $(this).data('npc'); _pickImage(npc, 200, 200, () => { if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success ${npc}头像已更新`); _render(); }); });
    $c.find('.ax-av-clear').on('click', function () { const npc = $(this).data('npc'); _clearImg(npc); if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success ${npc}头像已清除`); _render(); });
    // 字体选择事件
    $c.find('#ax-font-family').on('change', function () {
      const s = _loadFontSettings();
      s.family = $(this).val();
      _saveFontSettings(s);
      _ensureCss();
      _render();
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 字体已切换');
    });
    // 自定义字号滑块
    $c.find('#ax-font-slider').on('input', function () {
      const pct = parseInt($(this).val());
      $('#ax-font-pct').text(pct + '%');
      const s = _loadFontSettings();
      s.customScale = pct / 100;
      _saveFontSettings(s);
      _ensureCss();
      $('#' + G.elIds.overlay).css('--ax-fs', (pct / 100).toString());
    });
    $c.find('#ax-font-slider').on('change', function () {
      _render();
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 字号已调整为 ' + parseInt($(this).val()) + '%');
    });
    // 预设快捷按钮
    $c.find('.ax-font-preset-btn').on('click', function () {
      const pct = parseInt($(this).data('fpct'));
      const s = _loadFontSettings();
      s.customScale = pct / 100;
      _saveFontSettings(s);
      _ensureCss();
      _render();
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 字号已调整');
    });
  }

  /* ═══════════════════════════════════════
     🐾 宠物
     ═══════════════════════════════════════ */
  function _drawCreatures($c, d) {
    const t = _t(), store = d['宠物栏'], masks = d['伪装栏'] || {};
    if (!store || typeof store !== 'object') { $c.html('<div class="ax-nil">身边没有任何生灵相伴。</div>'); return; }
    const entries = Object.keys(store).filter(k => !_skip(k) && typeof store[k] === 'object' && store[k] !== null);
    if (!entries.length) { $c.html('<div class="ax-nil">身边没有任何生灵相伴。</div>'); return; }
    let o = '';
    for (const key of entries) {
      const cr = store[key], info = _parseRarity(key);
      const isEgg = cr['阶段'] && cr['阶段'].indexOf('孵化') !== -1;
      const sat = parseInt(cr['饱食度']) || 0, ss = isEgg ? 'ok' : _hungerState(sat);
      const mp = '宠物栏.' + key, hasMask = masks[mp];
      o += `<div class="ax-list-item" data-crkey="${_esc(key)}"><div class="ax-list-ico">${isEgg ? '🥚' : '🐾'}</div><div class="ax-list-body"><div class="ax-list-main"><span class="ax-cr-nm" data-key="${_esc(key)}">${info.label}</span>`;
      if (hasMask) o += `<span class="ax-mask-inline">🎭</span>`;
      if (ss === 'crit' && !isEgg) o += `<span class="ax-sat-warn ax-sat-warn-crit">⚠</span>`;
      else if (ss === 'low' && !isEgg) o += `<span class="ax-sat-warn ax-sat-warn-low">⚠</span>`;
      o += `</div><div class="ax-list-sub">${cr['阶段'] || ''}</div></div><div class="ax-list-end"><span class="ax-tag ${_tierCls(info.tier)}">${info.tier}</span></div></div>`;
      o += `<div class="ax-detail-panel" data-crd="${_esc(key)}">`;
      if (isEgg) { if (cr['进度']) o += `🔥 孵化进度：${cr['进度']}<br>`; if (cr['描述']) o += cr['描述']; }
      else {
        const bond = parseInt(cr['亲密度']) || 0, evo = parseInt(cr['进化度']) || 0;
        const fc = ss === 'crit' ? 'ax-bf-sat-crit' : ss === 'low' ? 'ax-bf-sat-low' : 'ax-bf-sat-ok';
        o += `<div class="ax-bar"><span class="ax-bar-lbl">亲密</span><div class="ax-bar-track"><div class="ax-bar-fill ax-bf-bond" style="width:${Math.min(100, bond)}%"></div></div><span class="ax-bar-num">${bond}</span></div>`;
        o += `<div class="ax-bar"><span class="ax-bar-lbl">进化</span><div class="ax-bar-track"><div class="ax-bar-fill ax-bf-evo" style="width:${Math.min(100, evo)}%"></div></div><span class="ax-bar-num">${evo}</span></div>`;
        o += `<div class="ax-bar"><span class="ax-bar-lbl">饱食</span><div class="ax-bar-track"><div class="ax-bar-fill ${fc}" style="width:${Math.min(100, sat)}%"></div></div><span class="ax-bar-num">${sat}</span></div>`;
        if (cr['忠诚度'] && cr['忠诚度'] !== '无') o += `<div style="margin-top:4px"><span class="ax-loy ${_loyaltyCls(cr['忠诚度'])}">忠诚：${cr['忠诚度']}</span></div>`;
        if (cr['技能'] && cr['技能'] !== '无') o += `<div style="margin-top:4px;color:${t.textDim}">⚡ ${cr['技能']}</div>`;
        if (cr['描述']) o += `<div style="margin-top:3px;font-style:italic">${cr['描述']}</div>`;
      }
      if (hasMask) o += `<div style="margin-top:4px;color:${t.mask}">🎭 伪装：${masks[mp]}</div>`;
      o += '</div>';
    }
    $c.html(o);
    $c.find('.ax-list-item[data-crkey]').on('click', function (e) { if ($(e.target).hasClass('ax-cr-nm')) return; $(`.ax-detail-panel[data-crd="${$(this).data('crkey')}"]`).toggleClass('show'); });
    $c.find('.ax-cr-nm').on('click', function (e) { e.stopPropagation(); _crRename($(this).data('key')); });
  }
  function _crRename(oldKey) { const info = _parseRarity(oldKey); const w = _dialog(`<div class="ax-dlg-h">✎ 为你的伙伴命名</div><div class="ax-dlg-sub">当前：${info.label}（${info.tier}）</div><input class="ax-dlg-input" id="ax-rn-v" type="text" placeholder="输入新名字…" value="${_esc(info.label)}" maxlength="20"><div class="ax-dlg-err" id="ax-rn-e"></div><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-rn-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-rn-yes">确认</button></div>`); const $i = $('#ax-rn-v'), $e = $('#ax-rn-e'); $i.focus().select(); $('#ax-rn-no').on('click', () => w.remove()); $i.on('keydown', e => { if (e.key === 'Enter') go(); }); $('#ax-rn-yes').on('click', go); async function go() { const v = $i.val().trim(); if (!v) { $e.text('名字不能为空'); return; } if (v.length > 20) { $e.text('不超过20字符'); return; } if (/[（）\(\)]/.test(v)) { $e.text('不能含括号'); return; } if (v === info.label) { w.remove(); return; } const d = _load(); if (!d || !d['宠物栏'] || !d['宠物栏'][oldKey]) { $e.text('找不到宠物'); return; } for (const ok of Object.keys(d['宠物栏']).filter(k => !_skip(k) && k !== oldKey)) if (_parseRarity(ok).label === v) { $e.text('已有同名'); return; } const nk = v + '(' + info.tier + ')'; const obj = d['宠物栏'][oldKey]; delete d['宠物栏'][oldKey]; d['宠物栏'][nk] = obj; if (d['伪装栏']) { const op = '宠物栏.' + oldKey, np = '宠物栏.' + nk; if (d['伪装栏'][op] !== undefined) { d['伪装栏'][np] = d['伪装栏'][op]; delete d['伪装栏'][op]; } } const ok = await _save(d); w.remove(); if (ok) { if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 命名成功：' + v); _render(); } } }

  /* ═══════════════════════════════════════
     💎 物品栏
     ═══════════════════════════════════════ */
  function _drawBag($c, d) { const t = _t(), bag = d['物品栏']; if (!bag || typeof bag !== 'object') { $c.html('<div class="ax-nil">空空如也</div>'); return; } const masks = d['伪装栏'] || {}; const sd = G.bagSlots.map(s => { const cat = bag[s.id]; const arr = []; if (cat && typeof cat === 'object' && !Array.isArray(cat)) Object.keys(cat).filter(k => !_skip(k)).forEach(k => arr.push({ key: k, val: cat[k] })); return { slot: s, items: arr }; }); if (!_bagSlot) { const f = sd.find(s => s.items.length > 0); _bagSlot = f ? f.slot.id : G.bagSlots[0].id; } let ch = '<div class="ax-bag-tabs" id="ax-bag-tabs">'; for (const s of sd) { const a = s.slot.id === _bagSlot; ch += `<div class="ax-bag-tab${a ? ' on' : ''}" data-slot="${s.slot.id}">${s.slot.icon} ${s.slot.id}${s.items.length ? '<span class="ax-cnt">' + s.items.length + '</span>' : ''}</div>`; } ch += '</div>'; const cur = sd.find(s => s.slot.id === _bagSlot); let lh = '<div class="ax-bag-list" id="ax-bag-list">'; if (!cur || !cur.items.length) lh += '<div class="ax-nil">空空如也</div>'; else cur.items.forEach((it, i) => { const p = _parseItemRarity(it.key), rc = _itemTierCls(p.tier), rt = p.tier ? `[${p.tier}]` : ''; const desc = typeof it.val === 'string' ? it.val : JSON.stringify(it.val); const mp2 = '物品栏.' + _bagSlot + '.' + it.key, mv = masks[mp2]; const mh = mv ? `<div style="margin-top:3px;font-size:8px;color:${_t().mask}">🎭 伪装：${mv}</div>` : ''; lh += `<div class="ax-bag-entry" data-ikey="${_esc(it.key)}" data-idx="${i}"><span class="ax-grip">⠿</span><span class="ax-bag-entry-name">${p.label}</span><span class="ax-bag-entry-tier ${rc}">${rt}</span></div><div class="ax-bag-detail" data-dkey="${_esc(it.key)}">${desc}${mh}</div>`; }); lh += '</div>'; $c.html(ch + lh); $c.find('.ax-bag-tab').on('click', function () { if (_bds.active) return; _bagSlot = $(this).data('slot'); _render(); }); $c.find('.ax-bag-entry').on('click', function (e) { if ($(e.target).hasClass('ax-grip') || _bds.active) return; $(`.ax-bag-detail[data-dkey="${$(this).data('ikey')}"]`).toggleClass('show'); }); _wireBagDrag($c); }
  const _bds = { active: false, itemKey: null, $src: null, $ghost: null, $mk: null, holdTimer: null, orig: [], cross: null };
  function _bdClean() { if (_bds.holdTimer) { clearTimeout(_bds.holdTimer); _bds.holdTimer = null; } if (_bds.$ghost) { _bds.$ghost.remove(); _bds.$ghost = null; } if (_bds.$mk) { _bds.$mk.remove(); _bds.$mk = null; } if (_bds.$src) { _bds.$src.removeClass('dragging'); _bds.$src = null; } $('.ax-bag-tab').removeClass('drop-hl'); _bds.active = false; _bds.itemKey = null; _bds.cross = null; _bds.orig = []; }
  function _bdBegin($e) { _bds.active = true; _bds.itemKey = $e.data('ikey'); _bds.$src = $e; $e.addClass('dragging'); _bds.orig = _bdOrder(); _bds.$mk = $('<div class="ax-drop-line"></div>'); _bds.$ghost = $(`<div class="ax-bag-ghost">${$e.find('.ax-bag-entry-name').text()}</div>`); $('body').append(_bds.$ghost); }
  function _bdMove(x, y) { if (!_bds.active) return; if (_bds.$ghost) _bds.$ghost.css({ left: x + 12 + 'px', top: y - 10 + 'px' }); const h = document.elementFromPoint(x, y); _bds.cross = null; $('.ax-bag-tab').removeClass('drop-hl'); if (h) { const $t2 = $(h).closest('.ax-bag-tab'); if ($t2.length && $t2.data('slot') !== _bagSlot) { _bds.cross = $t2.data('slot'); $t2.addClass('drop-hl'); } } if (_bds.cross) { if (_bds.$mk) _bds.$mk.detach(); return; } const $l = $('#ax-bag-list'), $s = $l.find('.ax-bag-entry:not(.dragging)'); let p2 = false; $s.each(function () { const r = this.getBoundingClientRect(); if (y < r.top + r.height / 2 && !p2) { $(this).before(_bds.$mk); _bds.$mk.after(_bds.$src); $(`.ax-bag-detail[data-dkey="${_bds.itemKey}"]`).insertAfter(_bds.$src); p2 = true; return false; } }); if (!p2 && $l.length) { $l.append(_bds.$mk); _bds.$mk.before(_bds.$src); $(`.ax-bag-detail[data-dkey="${_bds.itemKey}"]`).insertAfter(_bds.$src); } }
  function _bdEnd(c) { if (!_bds.active) { _bdClean(); return; } if (c) { if (_bds.cross) _mvCross(_bds.itemKey, _bds.cross); else { const f = _bdOrder(); if (JSON.stringify(f) !== JSON.stringify(_bds.orig)) _reorder(f); } } _bdClean(); }
  function _bdOrder() { return $('#ax-bag-list').find('.ax-bag-entry').map(function () { return $(this).data('ikey'); }).get(); }
  function _wireBagDrag($c) { const $l = $c.find('#ax-bag-list'); if (!$l.length) return; $l.on('touchstart', '.ax-grip', function (e) { const $e = $(this).closest('.ax-bag-entry'), tc = e.touches[0]; _bds.holdTimer = setTimeout(() => { _bdBegin($e); _bdMove(tc.clientX, tc.clientY); }, 200); }); $l.on('touchmove', '.ax-grip', function (e) { if (!_bds.active) { if (_bds.holdTimer) { clearTimeout(_bds.holdTimer); _bds.holdTimer = null; } return; } e.preventDefault(); _bdMove(e.touches[0].clientX, e.touches[0].clientY); }); $l.on('touchend touchcancel', '.ax-grip', function () { if (_bds.holdTimer) { clearTimeout(_bds.holdTimer); _bds.holdTimer = null; } if (_bds.active) _bdEnd(true); }); $l.on('pointerdown', '.ax-grip', function (e) { if (e.originalEvent.pointerType !== 'mouse') return; e.preventDefault(); _bdBegin($(this).closest('.ax-bag-entry')); _bdMove(e.clientX, e.clientY); function mv(ev) { if (_bds.active) _bdMove(ev.clientX, ev.clientY); } function up() { document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', up); if (_bds.active) _bdEnd(true); } document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up); }); }
  async function _reorder(nk) { const d = _load(); if (!d || !d['物品栏'] || !d['物品栏'][_bagSlot]) return; const s = d['物品栏'][_bagSlot], r = {}; if (s['$meta']) r['$meta'] = s['$meta']; nk.forEach(k => { if (s[k] !== undefined) r[k] = s[k]; }); Object.keys(s).forEach(k => { if (!_skip(k) && r[k] === undefined) r[k] = s[k]; }); d['物品栏'][_bagSlot] = r; await _save(d); _render(); }
  async function _mvCross(ik, ds) { const d = _load(); if (!d || !d['物品栏']) return; const f = d['物品栏'][_bagSlot], t2 = d['物品栏'][ds]; if (!f || !t2 || f[ik] === undefined) return; t2[ik] = f[ik]; delete f[ik]; if (d['伪装栏']) { const op = '物品栏.' + _bagSlot + '.' + ik, np = '物品栏.' + ds + '.' + ik; if (d['伪装栏'][op] !== undefined) { d['伪装栏'][np] = d['伪装栏'][op]; delete d['伪装栏'][op]; } } await _save(d); _bagSlot = ds; _render(); if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success 已移至「${ds}」`); }
  function _wireAppDrag($s) {
    const $grid = $s.find('.ax-app-grid');
    if (!$grid.length) return;

    let _appDrag = { active: false, editing: false, $el: null, $ghost: null };
    let _lastTap = 0;

    function getAppOrder() {
      return $grid.find('.ax-app').map(function () { return $(this).data('app'); }).get();
    }

    function enterEditMode() {
      if (_appDrag.editing) return;
      _appDrag.editing = true;
      $grid.find('.ax-app').each(function () {
        $(this).css({ animation: 'axAppWiggle .3s ease infinite alternate' });
      });
      // 添加完成按钮
      if (!$('#ax-app-edit-done').length) {
        $grid.after(`<div id="ax-app-edit-done" style="text-align:center;padding:8px;margin-top:-8px"><button class="ax-dlg-btn ax-dlg-ok" style="font-size:10px;padding:6px 24px">✓ 完成排列</button></div>`);
        $('#ax-app-edit-done button').on('click', exitEditMode);
      }
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=info 进入编辑模式：拖动APP图标排列顺序，完成后点击下方按钮');
    }

    function exitEditMode() {
      _appDrag.editing = false;
      $grid.find('.ax-app').css({ animation: '' });
      $('#ax-app-edit-done').remove();
      _saveAppOrder(getAppOrder());
    }

    function startDrag($el, x, y) {
      _appDrag.active = true;
      _appDrag.$el = $el;
      $el.css('opacity', '.3');
      _appDrag.$ghost = $(`<div style="position:fixed;z-index:200000;pointer-events:none;font-size:22px;background:${_t().bgCard};border:1px solid ${_t().primary};border-radius:14px;padding:8px 12px;box-shadow:0 4px 16px rgba(0,0,0,.4);opacity:.9">${$el.find('.ax-app-ico').text()}</div>`);
      $('body').append(_appDrag.$ghost);
      _appDrag.$ghost.css({ left: x + 'px', top: (y - 20) + 'px' });
    }

    function moveDrag(x, y) {
      if (!_appDrag.active) return;
      _appDrag.$ghost.css({ left: x + 'px', top: (y - 20) + 'px' });
      const els = $grid.find('.ax-app').not(_appDrag.$el);
      els.each(function () {
        const r = this.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        if (Math.abs(x - cx) < r.width / 2 && Math.abs(y - cy) < r.height / 2) {
          const $target = $(this);
          const srcIdx = _appDrag.$el.index();
          const tgtIdx = $target.index();
          if (srcIdx < tgtIdx) $target.after(_appDrag.$el);
          else $target.before(_appDrag.$el);
        }
      });
    }

    function endDrag() {
      if (!_appDrag.active) return;
      if (_appDrag.$el) _appDrag.$el.css('opacity', '1');
      if (_appDrag.$ghost) _appDrag.$ghost.remove();
      _saveAppOrder(getAppOrder());
      _appDrag.active = false;
      _appDrag.$el = null;
      _appDrag.$ghost = null;
    }

    // 双击进入编辑模式
    $grid.on('touchend', '.ax-app', function (e) {
      if (_appDrag.active) return;
      const now = Date.now();
      if (now - _lastTap < 300) {
        e.preventDefault();
        enterEditMode();
        _lastTap = 0;
      } else {
        _lastTap = now;
      }
    });

    // 编辑模式下的拖拽
    $grid.on('touchstart', '.ax-app', function (e) {
      if (!_appDrag.editing) return;
      e.preventDefault();
      const $el = $(this);
      const tc = e.touches[0];
      startDrag($el, tc.clientX, tc.clientY);
    });
    $grid.on('touchmove', '.ax-app', function (e) {
      if (!_appDrag.active) return;
      e.preventDefault();
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    });
    $grid.on('touchend touchcancel', '.ax-app', function () {
      if (_appDrag.active) endDrag();
    });

    // 鼠标：仍用拖拽（电脑上无误触问题）
    $grid.on('pointerdown', '.ax-app', function (e) {
      if (e.originalEvent.pointerType !== 'mouse') return;
      // 右键进入编辑模式
      if (e.originalEvent.button === 2) { e.preventDefault(); enterEditMode(); return; }
      if (!_appDrag.editing && e.originalEvent.button === 0) {
        // 非编辑模式：正常点击打开APP（由外部click事件处理）
        return;
      }
      if (_appDrag.editing && e.originalEvent.button === 0) {
        e.preventDefault();
        const $el = $(this);
        startDrag($el, e.clientX, e.clientY);
        function onMove(ev) { moveDrag(ev.clientX, ev.clientY); }
        function onUp() { document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp); endDrag(); }
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
      }
    });
    $grid.on('contextmenu', '.ax-app', function (e) { e.preventDefault(); });
  }

  /* ═══════════════════════════════════════
     ⚔️ 队伍
     ═══════════════════════════════════════ */
  function _drawParty($c, d) { const t = _t(), pty = d['队伍']; if (!pty) { $c.html('<div class="ax-nil">独行者</div>'); return; } let o = '<div class="ax-pty-header">'; o += `<span class="ax-pty-emblem" id="ax-pty-emblem">${pty['队徽'] || '⚔'}</span>`; o += '<div class="ax-pty-info">'; o += `<div class="ax-pty-name" id="ax-pty-name">${pty['队名'] || '未命名'}</div>`; const mt = pty['口号'] && pty['口号'] !== '未设定' ? pty['口号'] : '点击设定口号…'; o += `<div class="ax-pty-motto" id="ax-pty-motto" style="${pty['口号'] && pty['口号'] !== '未设定' ? '' : 'opacity:.4;'}">"${mt}"</div>`; o += '</div></div>'; o += '<div class="ax-pty-stats">'; if (pty['声望'] !== undefined) o += `<div class="ax-pty-stat">★ 声望<span class="ax-pty-stat-val">${pty['声望']}</span></div>`; if (pty['团队资金'] !== undefined) o += `<div class="ax-pty-stat">💰 资金<span class="ax-pty-stat-val">${pty['团队资金']}</span></div>`; o += '</div>'; o += `<div class="ax-sec-h">成 员</div>`; const mem = pty['成员']; if (mem && mem !== '无') { const ls = mem.split(/[，,]/).map(s => s.trim()).filter(Boolean); if (ls.length) ls.forEach(m => o += `<div class="ax-pty-member">${m}</div>`); else o += `<div style="font-size:10px;color:${t.textMuted};padding:6px;font-style:italic">独行者</div>`; } else o += `<div style="font-size:10px;color:${t.textMuted};padding:6px;font-style:italic">独行者</div>`; $c.html(o); $c.find('#ax-pty-name').on('click', () => _ptyEdit('队名', pty['队名'] || '')); $c.find('#ax-pty-motto').on('click', () => _ptyEdit('口号', (pty['口号'] && pty['口号'] !== '未设定') ? pty['口号'] : '')); $c.find('#ax-pty-emblem').on('click', () => _emblemPicker(pty['队徽'] || '⚔')); }
  function _ptyEdit(f, cv) { const w = _dialog(`<div class="ax-dlg-h">${f === '队名' ? '✎ 修改队伍名称' : '✎ 修改队伍口号'}</div><div class="ax-dlg-sub">当前：${cv || '未设定'}</div><input class="ax-dlg-input" id="ax-pt-i" type="text" placeholder="${f === '队名' ? '输入新队名…' : '输入新口号…'}" value="${_esc(cv)}" maxlength="30"><div class="ax-dlg-err" id="ax-pt-e"></div><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-pt-n">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-pt-y">确认</button></div>`); const $i = $('#ax-pt-i'); $i.focus().select(); $('#ax-pt-n').on('click', () => w.remove()); $i.on('keydown', e => { if (e.key === 'Enter') go(); }); $('#ax-pt-y').on('click', go); async function go() { let v = $i.val().trim(); if (!v && f === '口号') v = '未设定'; if (!v && f === '队名') { $('#ax-pt-e').text('队名不能为空'); return; } const d = _load(); if (!d || !d['队伍']) { w.remove(); return; } d['队伍'][f] = v; const ok = await _save(d); w.remove(); if (ok && typeof triggerSlash === 'function') triggerSlash(`/echo severity=success ${f}已更新`); _render(); } }
  function _emblemPicker(current) { let grid = '<div class="ax-emblem-grid">'; for (const em of EMBLEM_EMOJIS) grid += `<div class="ax-emblem-opt${em === current ? ' on' : ''}" data-em="${em}">${em}</div>`; grid += '</div>'; const w = _dialog(`<div class="ax-dlg-h">⛧ 选择队徽</div><div class="ax-dlg-sub">当前：${current}</div>${grid}<div class="ax-dlg-err" id="ax-em-e"></div><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-em-n">取消</button></div>`); w.find('.ax-emblem-opt').on('click', async function () { const chosen = $(this).data('em'); if (chosen === current) { w.remove(); return; } const d = _load(); if (!d || !d['队伍']) { $('#ax-em-e').text('数据加载失败'); return; } d['队伍']['队徽'] = chosen; const ok = await _save(d); w.remove(); if (ok && typeof triggerSlash === 'function') triggerSlash(`/echo severity=success 队徽已更换为 ${chosen}`); _render(); }); $('#ax-em-n').on('click', () => w.remove()); }

  /* ═══════════════════════════════════════
     ⚡ 技能
     ═══════════════════════════════════════ */
  function _drawSkills($c, d) {
    const t = _t(), sys = d['队友技能系统']; if (!sys || typeof sys !== 'object') { $c.html('<div class="ax-nil">尚未解锁技能系统</div>'); return; } const contrib = parseInt(sys['团队贡献点']) || 0; const pct = Math.min(1, contrib / CONTRIB_MAX); const circ = 2 * Math.PI * 20; const offset = circ * (1 - pct); let o = '<div class="ax-contrib-card"><div class="ax-contrib-ring">'; o += `<svg viewBox="0 0 50 50"><defs><linearGradient id="axRingGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="${t.accent}"/><stop offset="100%" stop-color="${t.primary}"/></linearGradient></defs>`; o += `<circle class="ax-ring-bg" cx="25" cy="25" r="20"/><circle class="ax-ring-fill" cx="25" cy="25" r="20" stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}" transform="rotate(-90 25 25)"/>`; o += `<text class="ax-ring-text" x="25" y="25">${contrib}</text></svg></div>`; o += `<div class="ax-contrib-info"><div class="ax-contrib-label">团 队 贡 献 点</div><div class="ax-contrib-val">${contrib} / ${CONTRIB_MAX}</div></div></div>`;
    o += '<div class="ax-avatar-row">';
    for (const npc of CORE_NPC_LIST) { const known = _isNpcKnown(d, npc); const selected = _skillNpc === npc; const url = _getAvatar(npc); const imgStyle = url ? `background-image:url('${url}');background-size:cover;background-position:center` : ''; const imgContent = url ? '' : (NPC_FALLBACK_EMOJI[npc] || '👤'); let cls = 'ax-avatar-img'; if (!known) cls += ' unknown'; else { cls += ' known'; if (selected) cls += ' selected'; } o += `<div class="ax-avatar-wrap" data-npc="${_esc(npc)}"><div class="${cls}"><div class="ax-avatar-inner" style="${imgStyle}">${imgContent}</div></div><div class="ax-avatar-name${known ? '' : ' unknown'}">${known ? npc : '???'}</div></div>`; }
    o += '</div>';
    if (_skillNpc && _isNpcKnown(d, _skillNpc)) { const nd = sys[_skillNpc]; const sk = nd && nd['技能']; const configs = NPC_SKILLS[_skillNpc]; if (sk && configs) { o += '<div class="ax-tree">'; o += `<div class="ax-tree-header">── ${_skillNpc} · 技能树 ──</div>`; o += '<div class="ax-tree-nodes">'; for (let ci = 0; ci < configs.length; ci++) { const cfg = configs[ci]; const key = '技能' + cfg.id; const info = sk[key]; if (!info) continue; const unlocked = info['状态'] === '已解锁'; const cost = parseInt(info['消耗']) || cfg.cost; const ready = !unlocked && contrib >= cost; if (ci > 0) o += '<div class="ax-tree-connector"></div>'; let cls = 'ax-tree-node'; if (unlocked) cls += ' unlocked'; else if (ready) cls += ' ready'; else cls += ' locked'; let tag = ''; if (unlocked) tag = '<span class="ax-tree-node-tag done">✓ 已解锁</span>'; else if (ready) tag = '<span class="ax-tree-node-tag can">可解锁</span>'; else tag = `<span class="ax-tree-node-tag" style="color:${t.textLocked}">🔒</span>`; o += `<div class="${cls}" data-npc="${_esc(_skillNpc)}" data-sk="${key}" data-cost="${cost}" data-unlocked="${unlocked}" data-ready="${ready}"><div class="ax-tree-node-ico${unlocked ? '' : ' off'}">${cfg.icon}</div><div class="ax-tree-node-body"><div class="ax-tree-node-row1"><span class="ax-tree-node-name">${cfg.name}</span><span class="ax-tree-node-cost">${cost}pt</span></div><div class="ax-tree-node-eff">${cfg.effect}</div></div>${tag}</div>`; } o += '</div></div>'; } }
    else if (_skillNpc && !_isNpcKnown(d, _skillNpc)) o += `<div class="ax-nil" style="padding:20px">尚未结识此人。</div>`;
    $c.html(o);
    $c.find('.ax-avatar-wrap').on('click', function () { const npc = $(this).data('npc'); if (!_isNpcKnown(d, npc)) { if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 尚未结识此人'); return; } _skillNpc = (_skillNpc === npc) ? null : npc; _render(); });
    $c.find('.ax-tree-node').on('click', function () { const $n = $(this); const unlocked = $n.data('unlocked') === true || $n.data('unlocked') === 'true'; const ready = $n.data('ready') === true || $n.data('ready') === 'true'; if (unlocked) { $n.find('.ax-tree-node-eff').toggleClass('show'); return; } if (ready) _skUnlock($n.data('npc'), $n.data('sk'), parseInt($n.data('cost'))); else if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 贡献点不足'); });
  }
  function _skUnlock(npc, skKey, cost) { const d = _load(); if (!d || !d['队友技能系统'] || !d['队友技能系统'][npc]) return; const sys = d['队友技能系统'], contrib = parseInt(sys['团队贡献点']) || 0; if (contrib < cost) { if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 贡献点不足'); return; } const skId = parseInt(skKey.replace('技能', '')), cfg = (NPC_SKILLS[npc] || []).find(s => s.id === skId); if (!cfg) return; const t = _t(); const w = _dialog(`<div class="ax-dlg-h">${cfg.icon} 解锁技能</div><div class="ax-dlg-sub">${npc} — ${cfg.name}</div><div style="font-size:10px;color:${t.textDim};margin-bottom:10px;line-height:1.5;padding:8px;background:${t.surfaceHover};border-radius:10px">${cfg.effect}</div><div style="font-size:9px;color:${t.textMuted};margin-bottom:3px">当前：<span style="color:${t.accent};font-weight:600">${contrib}</span></div><div style="font-size:9px;color:${t.textMuted};margin-bottom:8px">消耗：<span style="color:${t.fail};font-weight:600">-${cost}</span>　剩余：<span style="color:${t.text};font-weight:600">${contrib - cost}</span></div><div class="ax-dlg-err" id="ax-sk-e"></div><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-sk-n">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-sk-y">确认解锁</button></div>`); $('#ax-sk-n').on('click', () => w.remove()); $('#ax-sk-y').on('click', async () => { const fd = _load(); if (!fd || !fd['队友技能系统'] || !fd['队友技能系统'][npc]) { $('#ax-sk-e').text('数据加载失败'); return; } const fs = fd['队友技能系统'], fn = fs[npc], fi = fn['技能'] && fn['技能'][skKey], fc = parseInt(fs['团队贡献点']) || 0; if (!fi) { $('#ax-sk-e').text('技能数据异常'); return; } if (fi['状态'] === '已解锁') { w.remove(); _render(); return; } if (fc < cost) { $('#ax-sk-e').text('贡献点不足'); return; } fi['状态'] = '已解锁'; fs['团队贡献点'] = fc - cost; const ok = await _save(fd); w.remove(); if (ok && typeof triggerSlash === 'function') triggerSlash(`/echo severity=success ${npc}解锁了「${cfg.name}」！`); _render(); }); }

  /* ═══════════════════════════════════════
     ☠️ 副本 / 📊 统计 / 💀 死亡
     ═══════════════════════════════════════ */
  function _drawDungeons($c, d) { const rec = d['副本记录'], cur = d['当前副本'] || '无', dt = d['副本时间']; if (!rec) { $c.html('<div class="ax-nil">尚无记录</div>'); return; } let o = ''; const tiers = ['B级', 'A级', 'S级', 'SS级', 'SSS级']; for (const tier of tiers) { const b = rec[tier]; if (!b) continue; const ns = Object.keys(b).filter(k => !k.includes('全部通关')); if (!ns.length) continue; o += `<div class="ax-dg-group"><div class="ax-dg-grade">${tier}</div>`; for (const n of ns) { const st = b[n], ic = cur === n; if (st === '已通关') o += `<div class="ax-dg-row"><span class="ax-dg-name">${n}</span><span class="ax-dg-tag ax-dg-pass">✓ 已通关</span></div>`; else if (ic) { const days = dt ? (parseInt(dt['天数']) || 1) : 1; o += `<div class="ax-dg-row active" style="opacity:${Math.min(1, .2 + days * .16)};filter:blur(${Math.max(0, 3 - days * .6)}px)"><span class="ax-dg-name">▶ ${n}</span><span class="ax-dg-tag ax-dg-active">进行中</span></div>`; } else if (st === '失败') o += `<div class="ax-dg-row"><span class="ax-dg-name">${n}</span><span class="ax-dg-tag ax-dg-fail">✗ 失败</span></div>`; else o += `<div class="ax-dg-row locked"><span class="ax-dg-name">🔒 ${n.replace(/./g, '■')}</span><span class="ax-dg-tag ax-dg-lock">未解锁</span></div>`; } o += '</div>'; } $c.html(o || '<div class="ax-nil">尚无记录</div>'); }
  function _drawOverview($c, d) { const s = d['统计'] || {}; $c.html(`<div class="ax-ov-cards"><div class="ax-ov-card"><div class="ax-ov-val ax-ov-pass">${s['已通关副本总数'] || 0}</div><div class="ax-ov-lbl">通关副本</div></div><div class="ax-ov-card"><div class="ax-ov-val ax-ov-death">${s['死亡次数'] || 0}</div><div class="ax-ov-lbl">死亡次数</div></div></div>`); }
  function _drawFallen($c, d) { const f = d['死亡记录']; if (!f || typeof f !== 'object') { $c.html('<div class="ax-nil">尚无亡者</div>'); return; } const ns = Object.keys(f).filter(k => !_skip(k)); if (!ns.length) { $c.html('<div class="ax-nil">尚无亡者</div>'); return; } let o = ''; for (const n of ns) o += `<div class="ax-fl-row"><span class="ax-fl-who">${n}</span><span class="ax-fl-how">${f[n]}</span></div>`; $c.html(o); }

  function _drawNpcVoiceSettingsDialog(npcName) {
    const t = _t();
    const p = _getNpcPersonality(npcName);
    const rate = p.voiceRate !== undefined ? p.voiceRate : 0.9;
    const pitch = p.voicePitch !== undefined ? p.voicePitch : 0.8;

    let o = `<div class="ax-dlg-h">🎙️ 调整【${_esc(npcName)}】的音色</div>`;
    o += `<div class="ax-dlg-sub">实时调整语音消息的语速和音调</div>`;
    o += '<div class="ax-api-form">';

    // 语速
    o += `<label style="display:flex;justify-content:space-between">语速 <span id="ax-voice-rate-label">${rate.toFixed(2)}</span></label>`;
    o += `<input type="range" min="50" max="200" value="${Math.round(rate * 100)}" id="ax-voice-rate" style="width:100%;height:4px;cursor:pointer;accent-color:${t.primary}">`;

    // 音调
    o += `<label style="display:flex;justify-content:space-between;margin-top:12px">音调 <span id="ax-voice-pitch-label">${pitch.toFixed(2)}</span></label>`;
    o += `<input type="range" min="0" max="200" value="${Math.round(pitch * 100)}" id="ax-voice-pitch" style="width:100%;height:4px;cursor:pointer;accent-color:${t.primary}">`;

    o += '</div>';

    // 试听和操作按钮
    o += '<div class="ax-dlg-actions" style="margin-top:12px">';
    o += '<button class="ax-dlg-btn ax-dlg-cancel" id="ax-voice-test">试听</button>';
    o += '<span style="flex:1"></span>';
    o += '<button class="ax-dlg-btn ax-dlg-cancel" id="ax-voice-close">关闭</button>';
    o += '</div>';

    const w = _dialog(o);

    function updateVoiceParams() {
      const newRate = parseInt($('#ax-voice-rate').val()) / 100;
      const newPitch = parseInt($('#ax-voice-pitch').val()) / 100;
      $('#ax-voice-rate-label').text(newRate.toFixed(2));
      $('#ax-voice-pitch-label').text(newPitch.toFixed(2));
      // 实时更新内存中的对象
      NPC_PERSONALITIES[npcName] = { ...(NPC_PERSONALITIES[npcName] || {}), voiceRate: newRate, voicePitch: newPitch };
      // 同时持久化到localStorage
      try {
        const key = 'abyss_npc_voice_override';
        const overrides = JSON.parse(localStorage.getItem(key) || '{}');
        overrides[npcName] = { voiceRate: newRate, voicePitch: newPitch };
        localStorage.setItem(key, JSON.stringify(overrides));
      } catch (e) { }
    }

    w.find('#ax-voice-rate').on('input', updateVoiceParams);
    w.find('#ax-voice-pitch').on('input', updateVoiceParams);

    w.find('#ax-voice-test').on('click', () => {
      _speak('你好，我是' + npcName + '，这是我的声音。', null, p.voiceGender, npcName);
    });
    w.find('#ax-voice-close').on('click', () => w.remove());
  }

  /* ═══════════════════════════════════════👥 群聊列表页面═══════════════════════════════════════ */
  function _drawGroupChatList($c) {
    const t = _t();
    const groups = _getGroupChatList();
    const playerName = _getPlayerName();

    let o = '';

    // 新建群聊按钮
    o += '<div class="ax-chat-new-btn" id="ax-group-new">＋ 创建新群聊</div>';

    if (!groups.length) {
      o += `<div class="ax-chat-empty">暂无群聊<br><span style="font-size:8px;opacity:.6">点击上方按钮创建</span></div>`;
    } else {
      for (const group of groups) {
        const unread = _getGroupUnreadFor(group.id);
        const lastMsg = group.messages.length ? group.messages[group.messages.length - 1] : null;
        const preview = lastMsg ? (lastMsg.type === 'system' ? lastMsg.content : `${lastMsg.sender}: ${lastMsg.content}`).slice(0, 30) : '';
        const timeStr = lastMsg ? lastMsg.time : '';
        const isEmoji = group.avatar && group.avatar.length <= 4 && !group.avatar.startsWith('data:');
        const avatarStyle = (!isEmoji && group.avatar) ? `background-image:url('${group.avatar}');background-size:cover;background-position:center` : '';
        const avatarContent = isEmoji ? group.avatar : (avatarStyle ? '' : '👥');

        o += `<div class="ax-chat-list-item" data-group-id="${group.id}">`;
        o += `<div class="ax-chat-avatar" style="${avatarStyle}">${avatarContent}</div>`;
        o += '<div class="ax-chat-list-body">';
        o += `<div class="ax-chat-list-name"><span>${_esc(group.name)} (${group.members.length})</span><span class="ax-chat-list-time">${timeStr}</span></div>`;
        o += `<div class="ax-chat-list-preview">${_esc(preview)}</div>`;
        o += '</div>';
        if (unread > 0) o += `<span class="ax-chat-unread">${unread > 99 ? '99+' : unread}</span>`;
        o += `<span class="ax-chat-del-btn" data-del-group="${group.id}" title="删除群聊">✕</span>`;
        o += '</div>';
      }
    }

    $c.html(o);

    // 点击进入群聊
    $c.find('.ax-chat-list-item').on('click', function (e) {
      if ($(e.target).hasClass('ax-chat-del-btn')) return;
      const gid = $(this).data('group-id');
      _currentGroupId = gid;
      _clearGroupUnread(gid);
      _render();
    });

    // 删除群聊
    $c.find('.ax-chat-del-btn').on('click', function (e) {
      e.stopPropagation();
      const gid = $(this).data('del-group');
      const group = _getGroupChat(gid);
      if (!group) return;
      const isOwner = group.owner === playerName;
      const w = _dialog(
        `<div class="ax-dlg-h">${isOwner ? '解散群聊' : '退出群聊'}</div>` +
        `<div class="ax-dlg-sub">${isOwner ? '解散后所有聊天记录将被删除' : '退出后你将不再收到群消息'}</div>` +
        `<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-gd-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-gd-yes" style="color:${t.fail}">确认</button></div>`
      );
      $('#ax-gd-no').on('click', () => w.remove());
      $('#ax-gd-yes').on('click', () => {
        if (isOwner) {
          _deleteGroupChat(gid);
        } else {
          _removeGroupMember(gid, playerName);
        }
        w.remove();
        _drawGroupChatList($c);
        if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success ${isOwner ? '群聊已解散' : '已退出群聊'}`);
      });
    });

    // 新建群聊
    $c.find('#ax-group-new').on('click', () => _showCreateGroupDialog($c));
  }

  // 创建群聊弹窗
  function _showCreateGroupDialog($parentC) {
    const t = _t();
    const playerName = _getPlayerName();

    const npcSet = new Set();
    CORE_NPC_LIST.forEach(n => npcSet.add(n));
    _getFriendList().forEach(f => { if (f.name) npcSet.add(f.name); });
    const d = _load();
    if (d && d['NPC关系']) {
      Object.keys(d['NPC关系']).forEach(k => { if (!_skip(k) && !_isBlocked(k)) npcSet.add(k); });
    }
    _getConversationList().forEach(n => { if (n && n !== 'null') npcSet.add(n); });
    const availableNpcs = Array.from(npcSet).filter(n => n && !_isBlocked(n));

    let npcList = '';
    for (const npc of availableNpcs) {
      const emoji = _getNpcEmoji(npc);
      const avatarUrl = _getNpcAvatar(npc);
      const avStyle = avatarUrl ? `background-image:url('${avatarUrl}');background-size:cover;background-position:center` : '';
      const avContent = avatarUrl ? '' : emoji;
      const remark = _getChatRemark(npc);
      const displayName = remark || npc;
      npcList += `<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:10px;cursor:pointer;transition:background .15s" class="ax-grp-member-label">`;
      npcList += `<input type="checkbox" class="ax-grp-member-cb" value="${_esc(npc)}" checked style="width:16px;height:16px;border-radius:50%;accent-color:${t.primary};flex-shrink:0">`;
      npcList += `<div style="width:28px;height:28px;border-radius:50%;background:${t.iconBg};display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;overflow:hidden;${avStyle}">${avContent}</div>`;
      npcList += `<span style="font-size:10px;color:${t.text};flex:1">${_esc(displayName)}</span>`;
      npcList += `</label>`;
    }

    const w = _dialog(
      '<div class="ax-dlg-h">👥 创建群聊</div>' +
      '<div class="ax-api-form">' +
      '<label>群名称</label>' +
      '<input id="ax-grp-name" type="text" placeholder="如：深渊冒险小队" maxlength="20">' +
      '<label>选择成员</label>' +
      `<div style="max-height:200px;overflow-y:auto;padding:4px;background:${t.surfaceHover};border-radius:10px;scrollbar-width:thin;scrollbar-color:${t.scrollThumb} transparent">${npcList || '<div style="text-align:center;padding:12px;color:' + t.textMuted + ';font-size:9px">没有可选的NPC</div>'}</div>` +
      '</div>' +
      '<div class="ax-dlg-err" id="ax-grp-err"></div>' +
      '<div class="ax-dlg-actions">' +
      '<button class="ax-dlg-btn ax-dlg-cancel" id="ax-grp-no">取消</button>' +
      '<button class="ax-dlg-btn ax-dlg-ok" id="ax-grp-yes">创建</button>' +
      '</div>'
    );

    // hover效果
    w.find('.ax-grp-member-label').on('mouseenter', function () { $(this).css('background', t.surfaceActive); }).on('mouseleave', function () { $(this).css('background', ''); });

    w.find('#ax-grp-no').on('click', () => w.remove());
    w.find('#ax-grp-yes').on('click', () => {
      const name = $('#ax-grp-name').val().trim();
      if (!name) { $('#ax-grp-err').text('请输入群名称'); return; }
      const selected = [];
      w.find('.ax-grp-member-cb:checked').each(function () { selected.push($(this).val()); });
      if (selected.length < 1) { $('#ax-grp-err').text('至少选择1个成员'); return; }

      const group = _createGroupChat(name, [playerName, ...selected], playerName);
      w.remove();
      _currentGroupId = group.id;
      _drawGroupConversation($parentC);
      if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success 群聊「${name}」已创建`);
    });
  }

  /* ═══════════════════════════════════════
     👥 群聊对话页面
     ═══════════════════════════════════════ */
  function _drawGroupConversation($c) {
    const t = _t();
    const group = _getGroupChat(_currentGroupId);
    if (!group) {
      _currentGroupId = null;
      _drawGroupChatList($c);
      return;
    }

    const playerName = _getPlayerName();
    const isOwner = group.owner === playerName;
    const isMuted = group.muted.includes(playerName);

    let o = '<div style="display:flex;flex-direction:column;height:100%;overflow:hidden">';

    // 头部
    o += '<div class="ax-av-header">';
    o += `<span id="ax-grp-back" class="ax-av-back">‹</span>`;
    const isEmoji = group.avatar && group.avatar.length <= 4 && !group.avatar.startsWith('data:');
    const grpAvatarStyle = (!isEmoji && group.avatar) ? `background-image:url('${group.avatar}');background-size:cover;background-position:center` : '';
    const grpAvatarContent = isEmoji ? group.avatar : (grpAvatarStyle ? '' : '👥');
    o += `<div class="ax-chat-npc-avatar" style="${grpAvatarStyle}">${grpAvatarContent}</div>`;
    o += `<div style="flex:1;min-width:0"><div class="ax-av-title">${_esc(group.name)} (${group.members.length})</div></div>`;
    o += '<div class="ax-chat-actions">';
    o += `<button class="ax-chat-action-btn" id="ax-grp-auto-chat" title="让NPC自己聊">💬</button>`;
    o += `<button class="ax-chat-action-btn" id="ax-grp-settings">⚙</button>`;
    o += '</div>';
    o += '</div>';

    // 群公告（如果有）
    if (group.announcement) {
      o += `<div style="padding:6px 12px;background:rgba(${t.accentRgb},.08);font-size:8px;color:${t.accent};border-bottom:1px solid ${t.divider};display:flex;align-items:center;gap:4px">📢 ${_esc(group.announcement.slice(0, 50))}</div>`;
    }

    // 接龙（如果活跃）
    if (group.solitaire && group.solitaire.active) {
      o += `<div style="padding:6px 12px;background:rgba(${t.primaryRgb},.06);font-size:8px;color:${t.primary};border-bottom:1px solid ${t.divider}">`;
      o += `📋 接龙进行中：${_esc(group.solitaire.title)} (${group.solitaire.entries.length}人)`;
      o += `<button class="ax-api-btn" id="ax-grp-join-solitaire" style="font-size:7px;margin-left:4px;padding:1px 6px">参与</button>`;
      if (isOwner) o += `<button class="ax-api-btn" id="ax-grp-end-solitaire" style="font-size:7px;margin-left:4px;padding:1px 6px">结束</button>`;
      o += '</div>';
    }

    // 消息区
    o += `<div class="ax-chat-msgs" id="ax-grp-msgs">`;
    if (!group.messages.length) {
      o += '<div class="ax-chat-empty">群聊已创建，开始聊天吧</div>';
    } else {
      for (let mi = 0; mi < group.messages.length; mi++) {
        const msg = group.messages[mi];

        // 系统消息
        if (msg.type === 'system' || msg.sender === '__system__') {
          o += `<div class="ax-chat-date-sep">${_esc(msg.content)}</div>`;
          continue;
        }

        const isUser = msg.sender === playerName;
        const displayName = _getGroupDisplayName(group, msg.sender);
        const senderEmoji = isUser ? '👤' : _getNpcEmoji(msg.sender);
        const senderAvatarUrl = isUser ? _getPlayerAvatar() : _getNpcAvatar(msg.sender);
        const avStyle = senderAvatarUrl ? `background-image:url('${senderAvatarUrl}');background-size:cover;background-position:center` : '';
        const avContent = senderAvatarUrl ? '' : senderEmoji;

        // 红包消息
        if (msg.type === 'redpacket') {
          const rpMatch = msg.content.match(/\[redpacket:([^:]+):(\d+):(\d+)\]/);
          if (rpMatch) {
            const rpId = rpMatch[1];
            const rpTotal = rpMatch[2];
            const rpCount = rpMatch[3];
            const rp = group.redpackets ? group.redpackets.find(r => r.id === rpId) : null;
            const alreadyClaimed = rp ? rp.claimed.find(c => c.name === playerName) : null;
            const isEmpty = rp ? rp.remainingCount <= 0 : false;

            o += `<div class="ax-chat-msg-row ${isUser ? 'user' : 'npc'}">`;
            o += `<div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;gap:2px">`;
            o += `<div class="ax-chat-msg-avatar ${isUser ? 'user-av' : 'npc-av'}" style="${avStyle}">${avContent}</div>`;
            if (!isUser) o += `<div style="font-size:7px;color:${t.textMuted};max-width:40px;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_esc(displayName)}</div>`;
            o += `</div>`;
            o += '<div class="ax-chat-msg-group">';
            o += `<div class="ax-chat-bubble ${isUser ? 'user' : 'npc'}" style="padding:0;overflow:hidden;border-radius:12px;min-width:180px">`;
            o += `<div style="background:#c83030;color:#fff;padding:10px 14px;display:flex;align-items:center;gap:8px">`;
            o += `<span style="font-size:22px">🧧</span>`;
            o += `<div><div style="font-size:11px;font-weight:600">${_esc(displayName)}的红包</div><div style="font-size:8px;opacity:.8">${rpTotal}魂币· ${rpCount} 个</div></div>`;
            o += `</div>`;
            if (isEmpty) {
              o += `<div style="padding:8px 14px;font-size:9px;color:${t.textMuted};text-align:center">红包已被抢完</div>`;
            } else if (alreadyClaimed) {
              o += `<div style="padding:8px 14px;font-size:9px;color:${t.pass};text-align:center">你抢到了 ${alreadyClaimed.amount} 💰</div>`;
            } else {
              o += `<div class="ax-grp-claim-rp" data-rp-id="${rpId}" style="display:flex;justify-content:center;padding:10px 14px;cursor:pointer">`;o += `<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#f0c040,#e0a020);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:#c83030;box-shadow:0 2px 8px rgba(0,0,0,.2);font-family:serif">拆</div>`;
              o += `</div>`;
            }
            o += `<span class="ax-chat-time" style="padding:0 14px 6px;display:block">${msg.time}</span>`;
            o += '</div></div></div>';
            continue;
          }
        }

        // 接龙消息
        if (msg.type === 'solitaire') {
          let solText = msg.content;
          solText = solText.replace(/\[solitaire:start\]\s*/g, '');
          solText = solText.replace(/\[solitaire:join\]\s*/g, '');
          o += `<div class="ax-chat-date-sep" style="color:${t.primary}">📋 ${_esc(solText)}</div>`;
          continue;
        }

        // 普通文本消息
        const specialHtml = _renderMessageContent(msg.content, isUser);

        o += `<div class="ax-chat-msg-row ${isUser ? 'user' : 'npc'}">`;
        o += `<div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;gap:2px">`;
        if (!isUser) {
          o += `<div class="ax-chat-msg-avatar npc-av ax-grp-avatar-click" data-npc-name="${_esc(msg.sender)}" style="${avStyle};cursor:pointer" title="点击私聊">${avContent}</div>`; o += `<div class="ax-grp-avatar-click" data-npc-name="${_esc(msg.sender)}" style="font-size:7px;color:${t.textMuted};max-width:40px;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer">${_esc(displayName)}</div>`;
        } else {
          o += `<div class="ax-chat-msg-avatar user-av" style="${avStyle}">${avContent}</div>`;
        }
        o += `</div>`;
        o += '<div class="ax-chat-msg-group">';
        if (specialHtml !== null && specialHtml !== '') {
          o += `<div class="ax-chat-bubble ${isUser ? 'user' : 'npc'}" style="background:transparent;padding:4px">${specialHtml}<span class="ax-chat-time">${msg.time}</span></div>`;
        } else {
          o += `<div class="ax-chat-bubble ${isUser ? 'user' : 'npc'}">${_esc(msg.content)}<span class="ax-chat-time">${msg.time}</span></div>`;
        }
        o += '</div></div>';
      }
    }
    o += '</div>';

    // 输入栏
    o += '<div class="ax-chat-input-bar">';
    if (isMuted) {
      o += `<div style="flex:1;text-align:center;font-size:9px;color:${t.fail};padding:8px">🔇 你已被禁言</div>`;
    } else {
      //扩展功能
      o += `<div style="position:relative">`;
      o += `<div id="ax-grp-ext-menu" style="position:absolute;bottom:calc(100% + 8px);left:-8px;background:${t.bgCard};border:1px solid ${t.border};border-radius:16px;padding:12px;box-shadow:0 8px 24px rgba(0,0,0,.4);display:none;z-index:10;width:240px">`;
      o += `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">`;
      const grpExtItems = [
        { id: 'ax-grp-redpacket', icon: '🧧', label: '红包' },
        { id: 'ax-grp-solitaire', icon: '📋', label: '接龙' },
        { id: 'ax-grp-transfer', icon: '💰', label: '转账' },
        { id: 'ax-grp-gift', icon: '🎁', label: '礼物' },
        { id: 'ax-grp-music', icon: '🎵', label: '歌曲' },
        { id: 'ax-grp-ludo', icon: '🎲', label: '飞行棋' },
        { id: 'ax-grp-tod', icon: '🎯', label: '真心话' },
        { id: 'ax-grp-vote', icon: '📊', label: '投票' },
        { id: 'ax-grp-idiom', icon: '📝', label: '接龙' },
        { id: 'ax-grp-spy', icon: '🕵️', label: '卧底' },
        { id: 'ax-grp-rank', icon: '🏆', label: '排行榜' }
      ];
      for (const ei of grpExtItems) {
        o += `<div id="${ei.id}" style="display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:6px 2px;border-radius:10px;transition:background .15s" class="ax-ext-grid-item">`;
        o += `<div style="width:40px;height:40px;border-radius:12px;background:${t.surfaceHover};display:flex;align-items:center;justify-content:center;font-size:20px;transition:transform .15s">${ei.icon}</div>`;
        o += `<span style="font-size:8px;color:${t.textDim}">${ei.label}</span>`;
        o += `</div>`;
      }
      o += `</div></div>`;
      o += `<button class="ax-chat-sticker-btn" id="ax-grp-ext-toggle" title="更多" style="transition:transform .2s ease">+</button>`;
      o += `</div>`;
      o += `<button class="ax-chat-sticker-btn" id="ax-grp-sticker" title="表情包">😊</button>`;
      o += `<textarea class="ax-chat-input" id="ax-grp-input" placeholder="发送群消息…" rows="1"></textarea>`;
      o += `<button class="ax-chat-send" id="ax-grp-send">↑</button>`;
    }
    o += '</div>';

    o += '</div>'; // 闭合最外层flex容器
    $c.html(o);

    // 点击头像跳转到私聊
    $c.find('.ax-grp-avatar-click').on('click', function (e) {
      e.stopPropagation();
      const npcName = $(this).data('npc-name');
      if (!npcName || npcName === playerName) return;
      if (_isBlocked(npcName)) {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 对方已被拉黑');
        return;
      }
      //跳转到私聊
      _currentGroupId = null;
      _chatTarget = npcName;
      _clearUnread(npcName);
      _chatSubTab = 'messages';
      _render();
    });

    // 滚动到底部
    const $msgs = $('#ax-grp-msgs');
    if ($msgs.length) $msgs.scrollTop($msgs[0].scrollHeight);

    // 事件绑定
    // 返回
    $c.find('#ax-grp-back').on('click', () => {
      _currentGroupId = null;
      _chatSubTab = 'messages';
      _render();
    });

    // 输入框自适应
    const $input = $('#ax-grp-input');
    $input.on('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 80) + 'px';
    });

    // 回车发送
    $input.on('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        _doGroupSendOnly();
      }
    });

    // 点击发送按钮 = 发送 + 触发NPC回复
    $c.find('#ax-grp-send').on('click', async () => {
      _doGroupSendOnly();
      // 触发NPC回复
      if (!_groupChatSending && _getDefaultApi()) {
        _groupChatSending = true;
        $('#ax-grp-send').prop('disabled', true);
        const $msgs2 = $('#ax-grp-msgs');
        $msgs2.append('<div class="ax-chat-typing" id="ax-grp-typing"><div class="ax-chat-typing-dots"><span></span><span></span><span></span></div></div>');
        $msgs2.scrollTop($msgs2[0].scrollHeight);

        const lastUserMsg = group.messages.filter(m => m.sender === playerName).pop();
        await _groupChatNpcReply(_currentGroupId, lastUserMsg ? lastUserMsg.content : '');

        $('#ax-grp-typing').remove();
        _groupChatSending = false;
        $('#ax-grp-send').prop('disabled', false);
        //刷新消息显示
        _drawGroupConversation($c);
      }
    });

    // 扩展菜单切换
    $c.find('#ax-grp-ext-toggle').on('click', function (e) {
      e.stopPropagation();
      const $menu = $('#ax-grp-ext-menu');
      const isVisible = $menu.is(':visible');
      $menu.toggle(!isVisible);
      $(this).css('transform', isVisible ? 'rotate(0deg)' : 'rotate(45deg)');
    });

    // 发红包
    $c.find('#ax-grp-redpacket').on('click', () => _showGroupRedPacketDialog($c));

    // 群聊表情包
    $c.find('#ax-grp-sticker').on('click', () => {
      _showGroupStickerPanel();
    });

    // 发起接龙
    $c.find('#ax-grp-solitaire').on('click', () => _showGroupSolitaireDialog($c));

    // 群聊转账（发到群里）
    $c.find('#ax-grp-transfer').on('click', () => {
      const t2 = _t();
      const coins = _getPlayerCoins();
      const w = _dialog(
        '<div class="ax-dlg-h">💰 群内转账</div>' +
        `<div class="ax-dlg-sub">余额：${coins}💰</div>` +
        '<div class="ax-api-form"><label>金额</label><input id="ax-gt-amount" type="number" min="1" max="9999" placeholder="输入金额"><label>备注</label><input id="ax-gt-note" type="text" placeholder="转账备注" maxlength="30"></div>' +
        '<div class="ax-dlg-err" id="ax-gt-err"></div>' +
        '<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-gt-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-gt-yes">转账</button></div>'
      );
      w.find('#ax-gt-no').on('click', () => w.remove());
      w.find('#ax-gt-yes').on('click', async () => {
        const amount = parseInt($('#ax-gt-amount').val());
        const note = $('#ax-gt-note').val().trim() || '转账';
        if (!amount || amount <= 0) { $('#ax-gt-err').text('请输入金额'); return; }
        if (amount > coins) { $('#ax-gt-err').text('余额不足'); return; }
        await _setPlayerCoins(coins - amount);
        _addGroupMessage(_currentGroupId, _getPlayerName(), `[transfer:send:${amount}:${note}]`, 'text');
        w.remove();
        _drawGroupConversation($c);
      });
    });

    // 群聊礼物
    $c.find('#ax-grp-gift').on('click', () => {
      // 复用单聊的礼物商店，但发送到群聊
      const t2 = _t();
      const w = _dialog('<div class="ax-dlg-h">🎁 群内送礼</div><div class="ax-dlg-sub">选择群成员送礼</div>' +
        '<div id="ax-gg-members" style="max-height:200px;overflow-y:auto"></div>' +
        '<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-gg-close">关闭</button></div>');
      const grp = _getGroupChat(_currentGroupId);
      if (!grp) { w.remove(); return; }
      const playerName = _getPlayerName();
      let memHtml = '';
      for (const m of grp.members.filter(m => m !== playerName)) {
        const emoji = _getNpcEmoji(m);
        memHtml += `<div class="ax-list-item ax-gg-member" data-member="${_esc(m)}" style="cursor:pointer"><div class="ax-list-ico">${emoji}</div><div class="ax-list-body"><div class="ax-list-main">${_esc(m)}</div></div><div class="ax-list-end">›</div></div>`;
      }
      w.find('#ax-gg-members').html(memHtml);
      w.find('.ax-gg-member').on('click', function () {
        const member = $(this).data('member');
        w.remove();
        _showGiftPanel(member);
      }); w.find('#ax-gg-close').on('click', () => w.remove());
    });

    // 群聊飞行棋
    $c.find('#ax-grp-ludo').on('click', () => _startGroupLudo($c));

    // 群聊分享歌曲
    $c.find('#ax-grp-music').on('click', () => {
      const t2 = _t();
      const w = _dialog(
        '<div class="ax-dlg-h">🎵 分享歌曲到群聊</div>' +
        '<div class="ax-api-form"><label>搜索歌曲</label><div style="display:flex;gap:4px"><input id="ax-gm-search" type="text" placeholder="歌名或歌手" style="flex:1"><button class="ax-dlg-btn ax-dlg-ok" id="ax-gm-search-btn" style="flex-shrink:0">搜索</button></div>' +
        '<label>留言</label><input id="ax-gm-comment" type="text" placeholder="说点什么…" maxlength="50"></div>' +
        '<div id="ax-gm-results" style="margin-top:6px"></div>' +
        '<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-gm-close">取消</button></div>'
      );
      w.find('#ax-gm-search-btn').on('click', async function () {
        const kw = $('#ax-gm-search').val().trim();
        if (!kw) return;
        $(this).prop('disabled', true).text('搜索…');
        const libLoaded = await _ensureMusicLib();
        if (!libLoaded || !globalThis.Music) { $(this).prop('disabled', false).text('搜索'); return; }
        try {
          const result = await globalThis.Music.SearchMusic(kw);
          if (result && result.Name) {
            $('#ax-gm-results').html(`<div style="display:flex;align-items:center;gap:8px;padding:8px;border-radius:10px;background:${t2.surfaceHover};cursor:pointer" id="ax-gm-send-result"><span style="font-size:20px">🎵</span><div style="flex:1"><div style="font-size:11px;font-weight:600;color:${t2.text}">${_esc(result.Name)}</div><div style="font-size:9px;color:${t2.textMuted}">${_esc(result.Singer || '')}</div></div><button class="ax-dlg-btn ax-dlg-ok" style="flex-shrink:0;font-size:9px">发送</button></div>`); $('#ax-gm-send-result button').on('click', () => {
              const comment = $('#ax-gm-comment').val().trim();
              const safeSong = String(result.Name).replace(/[\[\]:]/g, '').trim();
              const safeArtist = String(result.Singer || '').replace(/[\[\]:]/g, '').trim();
              const safeComment = comment.replace(/[\[\]:]/g, '').trim();
              _addGroupMessage(_currentGroupId, _getPlayerName(), `[music:${safeSong}:${safeArtist}:${safeComment}]`, 'text');
              w.remove();
              _drawGroupConversation($c);
            });
          } else {
            $('#ax-gm-results').html(`<div style="color:${t2.fail};font-size:9px">未找到歌曲</div>`);
          }
        } catch (e) { $('#ax-gm-results').html(`<div style="color:${t2.fail};font-size:9px">搜索失败</div>`); }
        $(this).prop('disabled', false).text('搜索');
      });
      w.find('#ax-gm-close').on('click', () => w.remove());
    });

    // 真心话大冒险
    $c.find('#ax-grp-tod').on('click', () => _startTruthOrDare($c));

    // 群投票
    $c.find('#ax-grp-vote').on('click', () => _showGroupVoteDialog($c));

    // 成语接龙
    $c.find('#ax-grp-idiom').on('click', () => _startIdiomChain($c));

    // 谁是卧底
    $c.find('#ax-grp-spy').on('click', () => _startSpyGame($c));

    // 群排行榜
    $c.find('#ax-grp-rank').on('click', () => _showGroupRankings($c));

  /* ── 🎲 群聊飞行棋（全自动版）── */
  const LUDO_TOTAL_TILES = 30;
  const LUDO_EVENTS = [
    { tile: 3, text: '捡到传送符！前进2格', effect: 2 },
    { tile: 5, text: '踩到灵雾陷阱！后退3格', effect: -3 },
    { tile: 7, text: '获得灵魂加速！前进3格', effect: 3 },
    { tile: 9, text: '被亡灵绊倒！后退2格', effect: -2 },
    { tile: 11, text: '发现捷径！前进4格', effect: 4 },
    { tile: 13, text: '遭遇精神污染！后退4格', effect: -4 },
    { tile: 15, text: '获得队友助推！前进2格', effect: 2 },
    { tile: 17, text: '掉进深渊裂缝！回到起点', effect: -999 },
    { tile: 19, text: '踩到幸运符文！前进3格', effect: 3 },
    { tile: 21, text: '被队友坑了！后退3格', effect: -3 },
    { tile: 23, text: '灵魂共鸣加速！前进2格', effect: 2 },
    { tile: 25, text: '触发禁术反噬！后退5格', effect: -5 }
  ];

  // NPC在飞行棋中途说的话（随机选取）
  const LUDO_COMMENTS = {
    good: ['运气不错嘛', '哦豁起飞了', '这手气可以啊', '稳住别浪', '冲冲冲！'],
    bad: ['哈哈哈笑死', '太惨了兄弟', '这运气绝了', '别灰心还有机会', '寄'],
    lead: ['第一名了稳住', '别追了追不上的', '遥遥领先.jpg'],
    behind: ['我怎么还在这', '这游戏有毒', '我要投降了', '等等我啊喂'],
    finish: ['gg', '好快', '恭喜恭喜', '再来一把！', '不服再来']
  };

  async function _startGroupLudo($parentC) {
    const t = _t();
    const group = _getGroupChat(_currentGroupId);
    if (!group) return;
    const playerName = _getPlayerName();
    const allPlayers = group.members.filter(m => !_isBlocked(m));
    const playerEmojis = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '⚪', '🟤'];

    if (allPlayers.length < 2) {
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 至少需要2人才能玩飞行棋');
      return;
    }

    // 发起系统消息
    _addGroupMessage(_currentGroupId, '__system__', `🎲 飞行棋开始！${allPlayers.length}人参赛，目标到达第${LUDO_TOTAL_TILES}格！`, 'system');

    // 初始化玩家
    const players = allPlayers.map((name, i) => ({
      name, pos: 0, emoji: playerEmojis[i % playerEmojis.length], isNpc: name !== playerName
    }));

    // 显示进度弹窗
    const w = _dialog(
      `<div class="ax-dlg-h">🎲 飞行棋进行中…</div>` +
      `<div id="ax-ludo-live" style="max-height:300px;overflow-y:auto;padding:4px;font-size:9px;color:${t.textDim};line-height:2"></div>` +
      `<div id="ax-ludo-status" style="text-align:center;padding:8px;font-size:10px;color:${t.textMuted}">比赛进行中…</div>`
    );

    const $live = w.find('#ax-ludo-live');
    const $status = w.find('#ax-ludo-status');

    function appendLog(text, highlight) {
      const color = highlight ? t.accent : t.textDim;
      $live.append(`<div style="color:${color}">${_esc(text)}</div>`);
      $live.scrollTop($live[0].scrollHeight);
    }

    function getRandomComment(type) {
      const pool = LUDO_COMMENTS[type] || LUDO_COMMENTS.good;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    // 自动运行游戏
    let round = 0;
    let finished = false;
    let winner = null;

    while (!finished && round < 100) {
      for (let pi = 0; pi < players.length; pi++) {
        if (finished) break;
        const player = players[pi];
        const dice = Math.floor(Math.random() * 6) + 1;
        let newPos = player.pos + dice;
        let logMsg = `${player.emoji} ${player.name} 掷出 ${dice}`;

        // 到达终点
        if (newPos >= LUDO_TOTAL_TILES) {
          newPos = LUDO_TOTAL_TILES;
          player.pos = newPos;
          finished = true;
          winner = player;
          logMsg += ` → 到达终点！🎉`;
          appendLog(logMsg, true);
          break;
        }

        player.pos = newPos;

        // 检查事件
        const event = LUDO_EVENTS.find(e => e.tile === newPos);
        if (event) {
          if (event.effect === -999) {
            player.pos = 0;
            logMsg += ` → ${event.text}`;
          } else {
            player.pos = Math.max(0, Math.min(LUDO_TOTAL_TILES, player.pos + event.effect));
            logMsg += ` → ${event.text}（到${player.pos}）`;
          }
          // 到达终点检查
          if (player.pos >= LUDO_TOTAL_TILES) {
            player.pos = LUDO_TOTAL_TILES;
            finished = true;
            winner = player;
            logMsg += ` 🎉 到达终点！`;
            appendLog(logMsg, true);
            break;
          }
        } else {
          logMsg += ` → 到${newPos}格`;
        }

        appendLog(logMsg, false);

        // NPC中途说话（约30%概率）
        if (player.isNpc && Math.random() < 0.3) {
          let commentType = 'good';
          if (event && event.effect < 0) commentType = 'bad';
          else if (players.every(p => p.pos <= player.pos)) commentType = 'lead';
          else if (players.every(p => p.pos >= player.pos)) commentType = 'behind';
          const comment = getRandomComment(commentType);
          _addGroupMessage(_currentGroupId, player.name, `${comment}`, 'text');
          appendLog(`  💬 ${player.name}：${comment}`, false);
        }

        // 更新状态显示
        const standings = [...players].sort((a, b) => b.pos - a.pos);
        $status.html(standings.map(p => `${p.emoji}${p.name}(${p.pos})`).join(' · '));

        // 延迟（让用户能看到过程）
        await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
      }
      round++;
    }

    // 游戏结束
    if (winner) {
      const isPlayerWin = winner.name === playerName;

      appendLog('', false);
      appendLog(`🏆 ${winner.emoji} ${winner.name} 获得胜利！共${round}轮`, true);

      // 排名
      const finalStandings = [...players].sort((a, b) => b.pos - a.pos);
      const medals = ['🥇', '🥈', '🥉'];
      let rankText = '🏆 最终排名：\n';
      finalStandings.forEach((p, i) => {
        rankText += `${medals[i] || (i+1)+'.'} ${p.emoji} ${p.name}（${p.pos}格）\n`;
      });
      _addGroupMessage(_currentGroupId, '__system__', rankText.trim(), 'system');
      _addGroupMessage(_currentGroupId, '__system__', `🎲 飞行棋结束！🏆 ${winner.name} 获胜！`, 'system');

      // NPC发表结束感言
      const npcMembers = players.filter(p => p.isNpc).slice(0, 3);
      for (const npc of npcMembers) {
        const comment = getRandomComment('finish');
        _addGroupMessage(_currentGroupId, npc.name, comment, 'text');
        await new Promise(r => setTimeout(r, 500));
      }

      // 奖励
      if (isPlayerWin) {
        const coins = _getPlayerCoins();
        _setPlayerCoins(coins + 50);
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 飞行棋获胜！+50魂币');
      }

      $status.html(`<div style="color:${t.accent};font-weight:700;font-size:12px">🏆 ${_esc(winner.name)} 获胜！</div><button class="ax-dlg-btn ax-dlg-cancel" id="ax-ludo-done" style="margin-top:8px">关闭</button>`);
      w.find('#ax-ludo-done').on('click', () => { w.remove(); _drawGroupConversation($parentC); });
    }
  }

    /* ── 🎯 真心话大冒险 ── */
  function _startTruthOrDare($parentC) {
    const t = _t();
    const group = _getGroupChat(_currentGroupId);
    if (!group) return;
    const playerName = _getPlayerName();
    const allMembers = group.members.filter(m => !_isBlocked(m));
    const target = allMembers[Math.floor(Math.random() * allMembers.length)];
    const isPlayer = target === playerName;

    const w = _dialog(
      `<div class="ax-dlg-h">🎯 真心话大冒险</div>` +
      `<div class="ax-dlg-sub">命运之轮转到了 <span style="color:${t.accent};font-weight:700">${_esc(target)}</span>！</div>` +
      `<div style="text-align:center;font-size:40px;margin:12px 0;animation:axBlink 1.5s infinite">${isPlayer ? '😰' : _getNpcEmoji(target)}</div>` +
      `<div class="ax-dlg-actions" style="justify-content:center;gap:12px">` +
      `<button class="ax-dlg-btn ax-dlg-ok" id="ax-tod-truth" style="padding:10px 24px;font-size:11px">😇 真心话</button>` +
      `<button class="ax-dlg-btn ax-dlg-ok" id="ax-tod-dare" style="padding:10px 24px;font-size:11px;background:rgba(${t.primaryRgb},.15);border-color:rgba(${t.primaryRgb},.3);color:${t.primary}">😈 大冒险</button>` +
      `</div>` +
      `<div id="ax-tod-result" style="margin-top:10px;min-height:40px"></div>` +
      `<div class="ax-dlg-actions" style="margin-top:6px"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-tod-close">关闭</button></div>`
    );

    async function doTod(type) {
      const $result = w.find('#ax-tod-result');
      $result.html(`<div style="text-align:center;color:${t.textMuted};font-size:9px"><div class="ax-chat-typing-dots" style="display:inline-flex;gap:3px"><span></span><span></span><span></span></div></div>`);

      const fallbackTruths = [
        '你在深渊里最害怕遇到什么怪物？',
        '说一个你不敢告诉队友的秘密',
        '你最后悔做过的一件事是什么？',
        '你觉得队伍里谁最靠不住？为什么？',
        '如果只能带一样东西进副本，你会带什么？',
        '你有没有偷偷藏过队伍的战利品？',
        '说出你觉得群里最搞笑的一个人',
        '你在深渊里最想念现实世界的什么？'
      ];
      const fallbackDares = [
        '下次副本里必须第一个冲在最前面',
        '给群里每个人发10魂币红包',
        '用最搞笑的方式重新自我介绍一遍',
        '模仿群里另一个人说话，让大家猜是谁',
        '接下来10分钟只能用emoji说话',
        '给你最不熟的队友发一条夸奖消息',
        '讲一个你经历过的最离谱的深渊故事',
        '大声喊出"我是深渊最靓的仔"'
      ];

      let question = '';
      const api = _getAuxApi() || _getDefaultApi();

      if (api) {
        try {
          const personality = _getNpcPersonality(target);
          const context = _getContextSummary();
          const msgs = [{
            role: 'system',
            content: `你是一个派对游戏主持人。现在在玩"真心话大冒险"，被选中的人是"${target}"。

这个人的性格简介：${personality.personality.slice(0, 100)}

当前世界背景：深渊炼狱，恐怖生存类游戏世界。

请生成一个${type === 'truth' ? '真心话问题' : '大冒险挑战'}。

要求：
1. ${type === 'truth' ? '问一个有趣的、可能让人尴尬或搞笑的问题，针对这个角色的性格来问' : '出一个有趣但可执行的挑战，搞笑即可不要太过分'}
2. 一句话，30字以内
3. 只输出问题/挑战本身，不要加任何前缀、序号、引号
4. 示例（仅参考格式）：${type === 'truth' ? '你有没有在副本里偷偷哭过' : '对着天空大喊三声我爱深渊'}`
          }, { role: 'user', content: `请出一个${type === 'truth' ? '真心话问题' : '大冒险挑战'}` }];

          const reply = await _callAuxApi(msgs, { temperature: 0.95, max_tokens: 2000 });
          if (reply && reply.trim().length > 2) {
            question = reply.trim().slice(0, 100);
          }
        } catch (e) {
          console.warn('[Abyss ToD] API fail, using fallback:', e);
        }
      }

      // Fallback
      if (!question) {
        const pool = type === 'truth' ? fallbackTruths : fallbackDares;
        question = pool[Math.floor(Math.random() * pool.length)];
      }

      $result.html(`<div style="padding:12px;background:${t.surfaceHover};border-radius:10px;font-size:11px;color:${t.text};line-height:1.6;text-align:center"><div style="font-size:20px;margin-bottom:6px">${type === 'truth' ? '😇' : '😈'}</div>${_esc(question)}</div>`);
      _addGroupMessage(_currentGroupId, '__system__', `🎯 ${target} 被选中${type === 'truth' ? '真心话' : '大冒险'}：${question}`, 'system');

      // NPC自动回答
      if (!isPlayer && api) {
        setTimeout(async () => {
          try {
            const p2 = _getNpcPersonality(target);
            const ansMsgs = [{
              role: 'system',
              content: `你是"${target}"，性格：${p2.personality.slice(0,80)}。你在群聊真心话大冒险中${type === 'truth' ? '被问到' : '接受了挑战'}："${question}"。
用口语简短回答（15-40字），像真人在群里回复一样随意，可以用emoji。只输出回答内容，不要加前缀。`
            }, { role: 'user', content: '回答这个问题' }];
            const ans = await _callAuxApi(ansMsgs, { temperature: 0.95, max_tokens: 2000 });
            if (ans && ans.trim()) {
              _addGroupMessage(_currentGroupId, target, ans.trim().slice(0, 150), 'text');
              _drawGroupConversation($parentC);
            }
          } catch (e) { console.warn('[Abyss ToD] NPC answer fail:', e); }
        }, 2000);
      }
    }

    w.find('#ax-tod-truth').on('click', () => doTod('truth'));
    w.find('#ax-tod-dare').on('click', () => doTod('dare'));
    w.find('#ax-tod-close').on('click', () => { w.remove(); _drawGroupConversation($parentC); });
  }

  /* ── 📊 群投票 ── */
  function _showGroupVoteDialog($parentC) {
    const t = _t();
    const w = _dialog(
      `<div class="ax-dlg-h">📊 发起群投票</div>` +
      `<div class="ax-api-form">` +
      `<label>投票标题</label><input id="ax-vote-title" type="text" placeholder="如：今晚打哪个副本？" maxlength="30">` +
      `<label>选项（每行一个，2-6个）</label><textarea id="ax-vote-options" placeholder="选项A\n选项B\n选项C" style="min-height:60px"></textarea>` +
      `</div>` +
      `<div class="ax-dlg-err" id="ax-vote-err"></div>` +
      `<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-vote-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-vote-yes">发起</button></div>`
    );
    w.find('#ax-vote-no').on('click', () => w.remove());
    w.find('#ax-vote-yes').on('click', async () => {
      const title = $('#ax-vote-title').val().trim();
      const optText = $('#ax-vote-options').val().trim();
      if (!title) { $('#ax-vote-err').text('请输入标题'); return; }
      const opts = optText.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 6);
      if (opts.length < 2) { $('#ax-vote-err').text('至少需要2个选项'); return; }

      const playerName = _getPlayerName();
      const group = _getGroupChat(_currentGroupId);
      const npcMembers = group ? group.members.filter(m => m !== playerName && !_isBlocked(m)) : [];
      const context = _getContextSummary();

      w.remove();
      _addGroupMessage(_currentGroupId, '__system__', `📊 ${playerName} 发起了投票：${title}\n选项：${opts.join(' / ')}`, 'system');
      _drawGroupConversation($parentC);
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=info NPC正在投票…');

      const votes = {};
      opts.forEach(o => votes[o] = []);

      for (const npc of npcMembers) {
        let chosenOpt = null;
        let reason = '';

        try {
          const npcP = _getNpcPersonality(npc);
          // 获取该NPC的私聊记录摘要
          const chat = _getChatWith(npc);
          const privateMsgs = (chat.messages || []).slice(-3).map(m => {
            return (m.role === 'user' ? playerName : npc) + '：' + m.content.slice(0, 30);
          }).join('；');

          const voteMsgs = [{
            role: 'system',
            content: `群里正在投票：「${title}」
选项：${opts.map((o, i) => `${i + 1}.${o}`).join(' ')}

你是"${npc}"，性格：${npcP.personality.slice(0, 60)}

当前世界和剧情：
${context.slice(0, 1000)}

${privateMsgs ? '你和' + playerName + '最近聊过：' + privateMsgs + '\n' : ''}
根据你的性格和当前处境，选一个选项。
说话风格要符合你的性格。
只回复一行，格式：选某某选项 因为 理由`
          }, { role: 'user', content: '投票' }];

          const reply = await _callAuxApi(voteMsgs, { temperature: 0.9, max_tokens: 3000 });
          if (reply) {
            for (const opt of opts) {
              if (reply.includes(opt)) { chosenOpt = opt; break; }
            }
            const rm = reply.match(/因为\s*(.+)/);
            if (rm) reason = rm[1].trim().slice(0, 35);
          }
        } catch (e) { console.warn('[Vote]', npc, 'fail:', e.message); }

        if (!chosenOpt) chosenOpt = opts[Math.floor(Math.random() * opts.length)];
        if (!reason) reason = ['感觉不错', '就选这个吧', '直觉', '应该是这个'][Math.floor(Math.random() * 4)];

        votes[chosenOpt].push(npc);
        _addGroupMessage(_currentGroupId, npc, `我投"${chosenOpt}"（${reason}）`, 'text');
        _drawGroupConversation($parentC);
        await new Promise(r => setTimeout(r, 300 + Math.random() * 500));
      }

      const totalVotes = npcMembers.length;
      let resultText = `📊 投票结果：${title}\n`;
      for (const opt of opts) {
        const voters = votes[opt];
        const pct = totalVotes > 0 ? Math.round(voters.length / totalVotes * 100) : 0;
        const bar = '▓'.repeat(voters.length) + '░'.repeat(Math.max(0, totalVotes - voters.length));
        resultText += `\n${opt}：${bar} ${voters.length}票(${pct}%)`;
        if (voters.length) resultText += `\n  └ ${voters.join('、')}`;
      }
      const winOpt = opts.reduce((a, b) => votes[a].length >= votes[b].length ? a : b);
      resultText += `\n\n🏆「${winOpt}」获得最多票数！`;

      _addGroupMessage(_currentGroupId, '__system__', resultText.trim(), 'system');
      _drawGroupConversation($parentC);
    });
  }

  /* ── 📝 成语接龙 ── */
  async function _startIdiomChain($parentC) {
    const t = _t();
    const api = _getAuxApi() || _getDefaultApi();
    const group = _getGroupChat(_currentGroupId);
    if (!group) return;
    if (!api) { if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning需要API'); return; }

    const playerName = _getPlayerName();
    const npcMembers = group.members.filter(m => m !== playerName && !_isBlocked(m));
    if (npcMembers.length < 1) { if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 至少需要1个NPC'); return; }

    _addGroupMessage(_currentGroupId, '__system__', '📝 成语接龙开始！','system');
    _drawGroupConversation($parentC);

    // 构建参与者轮次顺序（玩家插入其中）
    const turnOrder = [];
    const npcPool = [...npcMembers];
    // 打乱NPC顺序
    for (let i = npcPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [npcPool[i], npcPool[j]] = [npcPool[j], npcPool[i]];
    }
    // 每2-3个NPC之间插入玩家
    let npcIdx = 0;
    while (npcIdx < npcPool.length) {
      const batch = Math.min(2+ Math.floor(Math.random() * 2), npcPool.length - npcIdx);
      for (let b = 0; b < batch; b++) {
        turnOrder.push(npcPool[npcIdx++]);
      }
      turnOrder.push(playerName); // 玩家回合
    }
    // 确保玩家至少出现一次
    if (!turnOrder.includes(playerName)) turnOrder.push(playerName);

    let lastIdiom = '';
    let chainCount = 0;
    const maxRounds = Math.min(turnOrder.length * 2, 20); // 最多20轮

    // 第一个NPC起头
    try {
      const startMsgs = [{
        role: 'system',
        content: `成语接龙游戏。请说一个常见的四字成语作为开头。
要求：只回复四个汉字的成语，不要加标点、引号或任何其他文字。
例如：一马当先`
      }, { role: 'user', content: '说一个成语' }];
      const startReply = await _callAuxApi(startMsgs, { temperature: 0.95, max_tokens: 3000 });
      lastIdiom = startReply.replace(/[^\u4e00-\u9fff]/g, '').slice(0, 4);
      if (lastIdiom.length < 3) lastIdiom = '一马当先';
    } catch (e) {
      lastIdiom = '一马当先';
    }

    _addGroupMessage(_currentGroupId, turnOrder[0], lastIdiom, 'text');
    _drawGroupConversation($parentC);
    chainCount++;

    // 从第二个人开始轮流
    for (let round = 1; round < maxRounds; round++) {
      const currentPlayer = turnOrder[round % turnOrder.length];
      const lastChar = lastIdiom[lastIdiom.length - 1];

      if (currentPlayer === playerName) {
        // ★玩家回合：弹窗等待输入
    const context = _getContextSummary();
        _addGroupMessage(_currentGroupId, '__system__', `💡轮到你了！请接「${lastChar}」开头的成语`, 'system');
        _drawGroupConversation($parentC);

        const playerInput = await new Promise(resolve => {
          const w = _dialog(
            `<div class="ax-dlg-h">📝 成语接龙 - 你的回合</div>` +
            `<div class="ax-dlg-sub">上一个成语：「${_esc(lastIdiom)}」<br>请接「${_esc(lastChar)}」开头的四字成语</div>` +
            `<input class="ax-dlg-input" id="ax-idiom-input" type="text" placeholder="输入四字成语…" maxlength="8">` +
            `<div style="display:flex;gap:4px;margin-top:4px">` +
            `<button class="ax-dlg-btn ax-dlg-cancel" id="ax-idiom-skip" style="flex:1;text-align:center">跳过（认输）</button>` +
            `<button class="ax-dlg-btn ax-dlg-ok" id="ax-idiom-submit" style="flex:1;text-align:center">提交</button>` +
            `</div>`
          );
          $('#ax-idiom-input').focus();
          $('#ax-idiom-input').on('keydown', function (e) {
            if (e.key === 'Enter') $('#ax-idiom-submit').click();
          });
          $('#ax-idiom-submit').on('click', () => {
            const val = $('#ax-idiom-input').val().trim();
            if (!val || val.length < 2) { if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 请输入成语'); return; }
            w.remove();
            resolve(val.slice(0, 4));
          });
          $('#ax-idiom-skip').on('click', () => {
            w.remove();
            resolve(null); // null表示放弃
          });
        });

        if (playerInput === null) {
          _addGroupMessage(_currentGroupId, '__system__', `${playerName} 接不上来了！接龙结束，共${chainCount}个成语`, 'system');
          _drawGroupConversation($parentC);
          return;
        }

        lastIdiom = playerInput;
        _addGroupMessage(_currentGroupId, playerName, lastIdiom, 'text');
        _drawGroupConversation($parentC);
        chainCount++;} else {
        // ★ NPC回合：调用API生成
        await new Promise(r => setTimeout(r, 600+ Math.random() * 800));

        try {
          const npcP = _getNpcPersonality(currentPlayer);
          const npcMsgs = [{
            role: 'system',
            content: `你是"${currentPlayer}"，正在群里玩成语接龙。
你的性格：${npcP.personality.slice(0, 60)}

当前世界背景：
${context.slice(0, 800)}

上一个成语是「${lastIdiom}」，最后一个字是「${lastChar}」。
请说出一个以「${lastChar}」开头的四字成语。谐音也可以。

要求：只回复四个汉字的成语，不要加标点、引号或任何其他文字。
例如上一个是"一马当先"，你回复：先发制人`
          }, { role: 'user', content: `接「${lastChar}」` }];

          let cleaned = '';
          for (let retry = 0; retry < 3; retry++) {
            try {
              const npcReply = await _callAuxApi(npcMsgs, { temperature: 0.95, max_tokens: 1000 });
              cleaned = npcReply.replace(/[^\u4e00-\u9fff]/g, '').slice(0, 4);
              if (cleaned.length >= 3) break;
            } catch (e) { console.warn('[Idiom] retry', retry, e); }
          }

          if (!cleaned || cleaned.length < 3) {
            const failComments = ['啊这我接不上了', '想不出来了😭', '我认输', '这也太难了吧', '不会不会'];
            _addGroupMessage(_currentGroupId, currentPlayer, failComments[Math.floor(Math.random() * failComments.length)], 'text');
            _addGroupMessage(_currentGroupId, '__system__', `${currentPlayer} 接不上来了！接龙结束，共${chainCount}个成语🎉`, 'system');
            _drawGroupConversation($parentC);
            return;
          }

          lastIdiom = cleaned;
          let comment = '';
          if (Math.random() < 0.35) {
            // 用性格化的吐槽
            const npcStyle = npcP.personality.slice(0, 30);
            const comments = {
              '周黑鸭': ['这个简单啦哈哈', '我太强了吧🦆', '下一个谁来？', '嘿嘿轮到你了'],
              '陆沉霄': ['…', '还行', '继续', '下一个'],
              '谢不言': ['呵', '有意思', '这个成语不错', '继续吧']
            };
            const pool = comments[currentPlayer] || ['嗯', '下一个', '哈哈', '这个简单'];
            comment = ' ' + pool[Math.floor(Math.random() * pool.length)];
          }
          _addGroupMessage(_currentGroupId, currentPlayer, lastIdiom + comment, 'text');
          _drawGroupConversation($parentC);
          chainCount++;

        } catch (e) {
          console.warn('[Abyss Idiom] NPC fail:', e);
          _addGroupMessage(_currentGroupId, currentPlayer, '…（想不出来了）', 'text');
          _addGroupMessage(_currentGroupId, '__system__', `接龙结束！共${chainCount}个成语`, 'system');
          _drawGroupConversation($parentC);
          return;
        }
      }
    }

    _addGroupMessage(_currentGroupId, '__system__', `📝 接龙结束！共${chainCount}个成语 🎉`, 'system');
    _drawGroupConversation($parentC);
  }

  /* ── 🕵️ 谁是卧底 ── */
  async function _startSpyGame($parentC) {
    const t = _t();
    const group = _getGroupChat(_currentGroupId);
    if (!group) return;
    const api = _getAuxApi() || _getDefaultApi();
    if (!api) { if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning需要API'); return; }
    const playerName = _getPlayerName();
    const allMembers = group.members.filter(m => !_isBlocked(m));
    if (allMembers.length < 4) { if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 至少需要4人'); return; }

    if (typeof triggerSlash === 'function') triggerSlash('/echo severity=info谁是卧底开始！正在分配词语');

    const context = _getContextSummary();

    // NPC性格映射
    const npcInfoMap = {};
    for (const m of allMembers) {
      if (m !== playerName) {
        const p = _getNpcPersonality(m);
        npcInfoMap[m] = p.personality.slice(0, 80);
      }
    }

    // 最近群聊记录
    const recentGroupMsgs = (group.messages || []).slice(-10)
      .filter(m => m.sender !== '__system__')
      .map(m => `${m.sender}：${m.content.slice(0, 40)}`)
      .join('\n');

    // 最近私聊记录摘要
    const privateChatSummaries = {};
    for (const m of allMembers.filter(n => n !== playerName)) {
      const chat = _getChatWith(m);
      if (chat.messages && chat.messages.length > 0) {
        const recent = chat.messages.slice(-5).map(msg => {
          const sender = msg.role === 'user' ? playerName : m;
          return `${sender}：${msg.content.slice(0, 30)}`;
        }).join('；');
        privateChatSummaries[m] = recent;
      }
    }

    const fallbackWordPairs = [
      { normalWord: '苹果', spyWord: '梨子' },
      { normalWord: '微信', spyWord: 'QQ' },
      { normalWord: '可乐', spyWord: '雪碧' },
      { normalWord: '篮球', spyWord: '排球' },
      { normalWord: '猫', spyWord: '狗' },
      { normalWord: '筷子', spyWord: '叉子' },
      { normalWord: '太阳', spyWord: '月亮' },
      { normalWord: '咖啡', spyWord: '奶茶' },
      { normalWord: '地铁', spyWord: '公交' },
      { normalWord: '耳机', spyWord: '音箱' }
    ];

    const fallbackDescs = {
      '苹果': ['圆圆的红红的', '咬一口脆脆的', '可以榨汁', '水果区常见的'],
      '梨子': ['水分很足', '秋天吃最好', '形状像葫芦', '可以炖汤喝'],
      '微信': ['每天都在用', '可以发朋友圈', '绿色图标', '抢红包用的'],
      'QQ': ['企鹅标志', '上学时天天挂', '可以换头像', '有空间功能'],
      '可乐': ['冰的最好喝', '黑色液体', '打开有气泡', '配炸鸡绝了'],
      '雪碧': ['透明的饮料', '柠檬味的', '夏天来一瓶', '兑酒用的'],
      '篮球': ['运动场上玩', '投进框里', '圆的能拍', 'NBA打的'],
      '排球': ['球类运动', '网两边打', '女排很厉害', '不能用脚踢'],
      '猫': ['会喵喵叫', '喜欢蹭人', '有的很高冷', '会抓老鼠'],
      '狗': ['人类好朋友', '会摇尾巴', '很忠诚', '品种很多'],
      '筷子': ['吃饭用的', '两根一起', '中国人都用', '夹菜的工具'],
      '叉子': ['也是餐具', '尖尖的', '吃牛排用', '西方人常用'],
      '太阳': ['很亮很热', '白天出现', '晒多了会黑', '给万物能量'],
      '月亮': ['晚上出来', '有时圆有时弯', '中秋赏的', '反射太阳光'],
      '咖啡': ['提神醒脑', '苦苦的', '加奶好喝', '打工人续命'],
      '奶茶': ['甜甜的', '有珍珠', '排队买的', '女生超爱喝'],
      '地铁': ['地下跑的', '上班族坐', '有站点', '不会堵车'],
      '公交': ['地上跑的', '公共交通', '有站牌', '投币刷卡'],
      '耳机': ['听歌用的', '塞耳朵里', '有线无线', '隔绝噪音'],
      '音箱': ['也是听歌', '声音外放', '放桌上', '好的很贵']
    };

    function getRandomFallbackDesc(word) {
      const pool = fallbackDescs[word];
      if (pool && pool.length) return pool[Math.floor(Math.random() * pool.length)];
      return '挺常见的一个东西';
    }

    try {
      // 第一步：分配词语
      let setup = null;
      try {
        const msgs1 = [{ role: 'system', content: `游戏"谁是卧底"。参与者：${allMembers.join('、')}（共${allMembers.length}人）。
请选一对相似但不同的词语（最好和当前世界观相关），随机选1人当卧底。

当前世界背景（用于选择有趣的词语对）：
${context.slice(0, 1500)}

严格只输出JSON：
{"normalWord":"平民词","spyWord":"卧底词","spy":"卧底的名字"}`
        }, { role: 'user', content: '分配词语' }];

        const reply1 = await _callAuxApi(msgs1, { temperature: 0.95, max_tokens: 1000 });
        try { setup = _safeParseJsonObject(reply1); } catch (pe) {
          const nwM = reply1.match(/normalWord["\s:：]+[""]?([^""",，}\n]+)/i);
          const swM = reply1.match(/spyWord["\s:：]+[""]?([^""",，}\n]+)/i);
          const spM = reply1.match(/spy["\s:：]+[""]?([^""",，}\n]+)/i);
          if (nwM && swM && spM) setup = { normalWord: nwM[1].trim(), spyWord: swM[1].trim(), spy: spM[1].trim() };
        }
        if (setup && setup.spy && !allMembers.includes(setup.spy)) {
          const matched = allMembers.find(m => setup.spy.includes(m) || m.includes(setup.spy));
          if (matched) setup.spy = matched; else setup.spy = null;
        }
      } catch (e) { console.warn('[Spy] API setup fail:', e); }

      if (!setup || !setup.normalWord || !setup.spyWord || !setup.spy) {
        const pair = fallbackWordPairs[Math.floor(Math.random() * fallbackWordPairs.length)];
        setup = { normalWord: pair.normalWord, spyWord: pair.spyWord, spy: allMembers[Math.floor(Math.random() * allMembers.length)] };
      }

      const playerWord = setup.spy === playerName ? setup.spyWord : setup.normalWord;
      const isPlayerSpy = setup.spy === playerName;

      _addGroupMessage(_currentGroupId, '__system__', `🕵️谁是卧底开始！每人已收到词语`,'system');
      _drawGroupConversation($parentC);

      if (typeof triggerSlash === 'function') {
        triggerSlash(`/echo severity=${isPlayerSpy ? 'warning' : 'info'} 你的词语是：「${playerWord}」${isPlayerSpy ? '（你是卧底！）' : ''}`);
      }

      const eliminated = [];
      const alive = [...allMembers];
      const allDescriptions = []; // 记录所有描述，供投票参考

      for (let round = 1; round <= 2; round++) {
        if (!alive.includes(setup.spy) || alive.length <= 2) break;

        _addGroupMessage(_currentGroupId, '__system__', `\n📢── 第${round}轮描述 ──`, 'system');
        _drawGroupConversation($parentC);
        await new Promise(r => setTimeout(r, 600));

        // NPC逐个描述
        const npcAlive = alive.filter(m => m !== playerName);
        for (const npc of npcAlive) {
          const isNpcSpy = npc === setup.spy;
          const npcWord = isNpcSpy ? setup.spyWord : setup.normalWord;
          const npcP = _getNpcPersonality(npc);
          const privateMsgs = privateChatSummaries[npc] || '';

          let desc = '';
          try {
            const descMsgs = [{
              role: 'system',
              content: `你是"${npc}"，正在群里玩"谁是卧底"。你的词语是"${npcWord}"。
${isNpcSpy ? '你是卧底！你拿到的词和别人不同，描述时要巧妙地模糊处理。' : '你是平民，正常描述但别太直白让卧底猜到。'}

你的性格：${npcP.personality.slice(0, 80)}

当前世界和最近剧情：
${context.slice(0, 1000)}

${privateMsgs ? '你和' + playerName + '最近的私聊：' + privateMsgs + '\n' : ''}
${allDescriptions.length ? '之前的描述记录：\n' + allDescriptions.map(d => d.name + '：' + d.desc).join('\n') + '\n' : ''}
用一句话描述你的词语特征（绝对不能说出词语本身），10-25字。
说话方式要完全符合你的性格——${npc}说话是什么风格就用什么风格。
只输出描述内容，不要加引号、前缀或其他文字。`
            }, { role: 'user', content: '描述你的词' }];

            const descReply = await _callAuxApi(descMsgs, { temperature: 0.95, max_tokens: 1000 });
            if (descReply) {
              desc = descReply.trim().replace(/^["'「」]/g, '').replace(/["'「」]$/g, '').slice(0, 80);
            }
          } catch (e) { console.warn('[Spy] NPC desc fail:', npc, e.message); }

          if (!desc || desc.length < 2) desc = getRandomFallbackDesc(npcWord);

          allDescriptions.push({ name: npc, desc: desc, round: round });
          _addGroupMessage(_currentGroupId, npc, desc, 'text');
          _drawGroupConversation($parentC);
          await new Promise(r => setTimeout(r, 500+ Math.random() * 500));
        }

        // 玩家描述
        if (alive.includes(playerName)) {
          _addGroupMessage(_currentGroupId, '__system__', `💡轮到你了！你的词是「${playerWord}」`, 'system');
          _drawGroupConversation($parentC);

          const playerDesc = await new Promise(resolve => {
            const w2 = _dialog(
              `<div class="ax-dlg-h">🕵️ 第${round}轮描述</div>` +
              `<div class="ax-dlg-sub">你的词：「${_esc(playerWord)}」${isPlayerSpy ? '<br><span style="color:' + t.fail + '">你是卧底！</span>' : ''}<br>描述特征但不能说出词语</div>` +
              `<input class="ax-dlg-input" id="ax-spy-desc" type="text" placeholder="输入描述…" maxlength="50">` +
              `<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-ok" id="ax-spy-desc-ok">提交</button></div>`
            );
            $('#ax-spy-desc').focus();
            $('#ax-spy-desc').on('keydown', function (e) { if (e.key === 'Enter') $('#ax-spy-desc-ok').click(); });
            w2.find('#ax-spy-desc-ok').on('click', () => {
              const val = $('#ax-spy-desc').val().trim() || '挺常见的';
              w2.remove();
              resolve(val);
            });
          });

          allDescriptions.push({ name: playerName, desc: playerDesc, round: round });
          _addGroupMessage(_currentGroupId, playerName, playerDesc, 'text');
          _drawGroupConversation($parentC);
        }

        await new Promise(r => setTimeout(r, 800));

        // 投票
        _addGroupMessage(_currentGroupId, '__system__', `\n🗳️── 第${round}轮投票 ──`, 'system');
        _drawGroupConversation($parentC);
        await new Promise(r => setTimeout(r, 400));

        const voteCounts = {};
        alive.forEach(m => voteCounts[m] = 0);

        // 构建本轮描述汇总
        const roundDescs = allDescriptions
          .filter(d => d.round === round)
          .map(d => `${d.name}：「${d.desc}」`)
          .join('\n');

        // NPC逐个投票
        for (const npc of npcAlive) {
          if (!alive.includes(npc)) continue;
          const isNpcSpy = npc === setup.spy;
          const candidates = alive.filter(m => m !== npc);
          const npcP = _getNpcPersonality(npc);

          let voteTarget = null;
          let voteReason = '';

          try {
            const voteMsgs = [{
              role: 'system',
              content: `你是"${npc}"，正在"谁是卧底"第${round}轮投票。
${isNpcSpy ? '你是卧底（你的词是"' + setup.spyWord + '"，别人的是"' + setup.normalWord + '"），要把嫌疑推给别人！' : '你是平民（你的词是"' + setup.normalWord + '"），根据描述猜谁是卧底。'}

你的性格：${npcP.personality.slice(0, 60)}

本轮所有人的描述：
${roundDescs}

可以投的人：${candidates.join('、')}
${eliminated.length ? '已被淘汰：' + eliminated.join('、') : ''}

请选一个你觉得最可疑的人。你的理由要符合你的说话风格。
只回复一行，格式：投给某某某因为 理由`
            }, { role: 'user', content: '投票' }];

            const voteReply = await _callAuxApi(voteMsgs, { temperature: 0.9, max_tokens: 1000 });
            if (voteReply) {
              for (const cand of candidates) {
                if (voteReply.includes(cand)) { voteTarget = cand; break; }
              }
              const rm = voteReply.match(/因为\s*(.+)/);
              if (rm) voteReason = rm[1].trim().slice(0, 40);
              if (!voteReason) {
                const afterName = voteTarget ? voteReply.split(voteTarget).pop() : '';
                if (afterName && afterName.trim().length > 2) voteReason = afterName.trim().replace(/^[，,。\s]+/, '').slice(0, 40);
              }
            }
          } catch (e) { console.warn('[Spy] vote fail:', npc, e.message); }

          if (!voteTarget) voteTarget = candidates[Math.floor(Math.random() * candidates.length)];
          if (!voteReason) {
            const reasons = ['描述太模糊了', '说得和别人不一样', '直觉', '越听越不对劲', '太淡定了反而可疑'];
            voteReason = reasons[Math.floor(Math.random() * reasons.length)];
          }

          voteCounts[voteTarget] = (voteCounts[voteTarget] || 0) + 1;
          _addGroupMessage(_currentGroupId, npc, `我投 ${voteTarget}（${voteReason}）`, 'text');
          _drawGroupConversation($parentC);
          await new Promise(r => setTimeout(r, 300+ Math.random() * 400));
        }

        // 玩家投票
        if (alive.includes(playerName)) {
          const playerVote = await new Promise(resolve => {
            const candidates = alive.filter(n => n !== playerName);
            let btns = '';
            for (const m of candidates) {
              const mDescs = allDescriptions.filter(d => d.name === m).map(d => '「' + d.desc + '」').join(' ');
              btns += `<div class="ax-spy-vote-btn" data-target="${_esc(m)}" style="display:flex;align-items:center;gap:8px;padding:8px 12px;margin:3px 0;border-radius:10px;background:${t.surfaceHover};border:1px solid ${t.border};cursor:pointer;transition:all .2s">`;
              btns += `<span style="font-size:16px">${_getNpcEmoji(m)}</span>`;
              btns += `<div><div style="font-size:10px;font-weight:600;color:${t.text}">${_esc(m)}</div>`;
              btns += `<div style="font-size:8px;color:${t.textMuted}">${_esc(mDescs)}</div></div>`;
              btns += `</div>`;
            }
            const w3 = _dialog(
              `<div class="ax-dlg-h">🗳️ 第${round}轮投票</div>` +
              `<div class="ax-dlg-sub">根据描述，你觉得谁是卧底？</div>` +
              `<div style="padding:4px 0">${btns}</div>`
            );
            w3.find('.ax-spy-vote-btn').on('click', function () {
              w3.remove();
              resolve($(this).data('target'));
            });
          });

          voteCounts[playerVote] = (voteCounts[playerVote] || 0) + 1;
          _addGroupMessage(_currentGroupId, playerName, `我投 ${playerVote}`, 'text');
          _drawGroupConversation($parentC);
          await new Promise(r => setTimeout(r, 500));
        }

        // 淘汰
        const maxVotes = Math.max(...Object.values(voteCounts));
        const topVoted = Object.entries(voteCounts).filter(([, c]) => c === maxVotes).map(([n]) => n);
        const eliminatedPerson = topVoted[Math.floor(Math.random() * topVoted.length)];
        eliminated.push(eliminatedPerson);
        alive.splice(alive.indexOf(eliminatedPerson), 1);
        const wasTheSpy = eliminatedPerson === setup.spy;

        await new Promise(r => setTimeout(r, 600));
        _addGroupMessage(_currentGroupId, '__system__', `❌ ${eliminatedPerson} 被淘汰！（${maxVotes}票）\n${wasTheSpy ? '🎉 卧底被找出来了！' : '😬TA是平民…卧底还在！'}`, 'system');
        _drawGroupConversation($parentC);

        if (wasTheSpy) {
          await new Promise(r => setTimeout(r, 800));
          _addGroupMessage(_currentGroupId, '__system__', `\n🕵️ 游戏结束！\n平民词：${setup.normalWord}\n卧底词：${setup.spyWord}\n卧底：${setup.spy}\n\n🎉 平民胜利！`, 'system');
          _drawGroupConversation($parentC);
          return;
        }await new Promise(r => setTimeout(r, 800));
      }

      _addGroupMessage(_currentGroupId, '__system__', `\n🕵️ 两轮结束，卧底存活！\n平民词：${setup.normalWord}\n卧底词：${setup.spyWord}\n卧底：${setup.spy}\n\n😈卧底胜利！`, 'system');
      _drawGroupConversation($parentC);} catch (e) {
      console.warn('[Spy] fail:', e);if (typeof triggerSlash === 'function') triggerSlash('/echo severity=error谁是卧底失败：' + (e.message || ''));
    }
  }

  /* ── 🏆 群排行榜 ── */
  function _showGroupRankings($parentC) {
    const t = _t();
    const group = _getGroupChat(_currentGroupId);
    if (!group) return;
    const playerName = _getPlayerName();

    // 统计各项数据
    const stats = {};
    for (const m of group.members) {
      stats[m] = { msgs: 0, stickers: 0, redpackets: 0, words: 0 };
    }
    for (const msg of group.messages) {
      if (msg.sender === '__system__' || msg.type === 'system') continue;
      if (!stats[msg.sender]) stats[msg.sender] = { msgs: 0, stickers: 0, redpackets: 0, words: 0 };
      stats[msg.sender].msgs++;
      if (msg.type === 'redpacket') stats[msg.sender].redpackets++;
      if (msg.content && msg.content.match(/^\[sticker/)) stats[msg.sender].stickers++;
      stats[msg.sender].words += (msg.content || '').length;
    }

    const entries = Object.entries(stats).sort((a, b) => b[1].msgs - a[1].msgs);
    const medals = ['🥇', '🥈', '🥉'];

    let o = `<div class="ax-dlg-h">🏆 群排行榜</div>`;
    o += `<div class="ax-dlg-sub">${_esc(group.name)} · 共${group.messages.length}条消息</div>`;

    // 发言排行
    o += `<div style="font-size:9px;color:${t.textDim};margin:8px 0 4px;letter-spacing:1px">💬 发言排行</div>`;
    for (let i = 0; i < entries.length; i++) {
      const [name, s] = entries[i];
      const medal = i < 3 ? medals[i] : `${i + 1}.`;
      const emoji = name === playerName ? '👤' : _getNpcEmoji(name);
      const pct = group.messages.length > 0 ? Math.round(s.msgs / group.messages.length * 100) : 0;
      o += `<div style="display:flex;align-items:center;gap:6px;padding:4px 6px;font-size:9px">`;
      o += `<span style="width:20px;text-align:center">${medal}</span>`;
      o += `<span style="font-size:14px">${emoji}</span>`;
      o += `<span style="flex:1;color:${t.text}">${_esc(name)}</span>`;
      o += `<span style="color:${t.accent};font-weight:600">${s.msgs}</span>`;
      o += `<span style="color:${t.textMuted};font-size:7px">(${pct}%)</span>`;
      o += `</div>`;
    }

    // 话痨王
    const mostWordy = entries.sort((a, b) => b[1].words - a[1].words)[0];
    if (mostWordy) {
      o += `<div style="margin-top:8px;padding:6px;background:${t.surfaceHover};border-radius:8px;font-size:8px;color:${t.textDim}">`;
      o += `🗣️ 话痨王：${_esc(mostWordy[0])}（累计${mostWordy[1].words}字）`;
      o += `</div>`;
    }

    // 表情包大户
    const mostSticker = Object.entries(stats).sort((a, b) => b[1].stickers - a[1].stickers)[0];
    if (mostSticker && mostSticker[1].stickers > 0) {
      o += `<div style="padding:4px 6px;font-size:8px;color:${t.textDim}">😊 表情包大户：${_esc(mostSticker[0])}（${mostSticker[1].stickers}个）</div>`;
    }

    // 红包王
    const mostRp = Object.entries(stats).sort((a, b) => b[1].redpackets - a[1].redpackets)[0];
    if (mostRp && mostRp[1].redpackets > 0) {
      o += `<div style="padding:4px 6px;font-size:8px;color:${t.textDim}">🧧 红包王：${_esc(mostRp[0])}（发了${mostRp[1].redpackets}个）</div>`;
    }

    o += `<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-rank-close">关闭</button></div>`;
    const w = _dialog(o);
    w.find('#ax-rank-close').on('click', () => w.remove());
  }

    // 抢红包
    $c.find('.ax-grp-claim-rp').on('click', function () {
      const rpId = $(this).data('rp-id');
      const result = _claimRedPacket(_currentGroupId, rpId, playerName);
      if (result && result.amount) {
        const coins = _getPlayerCoins();
        _setPlayerCoins(coins + result.amount);
        if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success 抢到了 ${result.amount} 魂币！`);
      } else if (result && result.error) {
        if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=warning ${result.error}`);
      }
      _drawGroupConversation($c);
    });

    // 参与接龙
    $c.find('#ax-grp-join-solitaire').on('click', () => {
      const w = _dialog(
        `<div class="ax-dlg-h">📋 参与接龙</div>` +
        `<input class="ax-dlg-input" id="ax-sol-content" type="text" placeholder="输入你的接龙内容" maxlength="50">` +
        `<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-sol-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-sol-yes">提交</button></div>`
      );
      w.find('#ax-sol-no').on('click', () => w.remove());
      w.find('#ax-sol-yes').on('click', () => {
        const content = $('#ax-sol-content').val().trim();
        if (!content) return;
        _joinSolitaire(_currentGroupId, playerName, content);
        w.remove();
        _drawGroupConversation($c);
      });
    });

    // 结束接龙
    $c.find('#ax-grp-end-solitaire').on('click', () => {
      _endSolitaire(_currentGroupId);
      _drawGroupConversation($c);
    });

    // 手动触发NPC自主聊天
    $c.find('#ax-grp-auto-chat').on('click', async function () {
      const $btn = $(this);
      // 优先用默认API，辅助API没有就用默认
      const api = _getAuxApi() || _getDefaultApi();
      if (!api) {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 请先配置API');
        return;
      }
      $btn.prop('disabled', true).text('…');
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=info NPC们正在聊天…');

      const $msgs2 = $('#ax-grp-msgs');
      $msgs2.append('<div class="ax-chat-typing" id="ax-grp-auto-typing"><div class="ax-chat-typing-dots"><span></span><span></span><span></span></div></div>');
      $msgs2.scrollTop($msgs2[0].scrollHeight);

      try {
        const count = await _groupChatAutoChat(_currentGroupId);
        $('#ax-grp-auto-typing').remove();
        $btn.prop('disabled', false).text('💬');

        if (count > 0) {
          _drawGroupConversation($c);
        } else {
          if (typeof triggerSlash === 'function') triggerSlash('/echo severity=info NPC们暂时没什么想说的，再试一次？');
        }
      } catch (e) {
        $('#ax-grp-auto-typing').remove();
        $btn.prop('disabled', false).text('💬');
        console.warn('[Abyss] Auto chat error:', e);
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=error 自动聊天失败：' + (e.message || ''));
      }
    });

    // 群聊消息长按/右键：引用或删除
    $c.find('#ax-grp-msgs').on('contextmenu', '.ax-chat-bubble', function (e) {
      e.preventDefault();
      const grp = _getGroupChat(_currentGroupId);
      if (!grp) return;
      const timeText = $(this).find('.ax-chat-time').text().trim();
      let msgIdx = -1;
      for (let i = grp.messages.length - 1; i >= 0; i--) {
        const m = grp.messages[i];
        if (m.type === 'system' || m.sender === '__system__') continue;
        if (m.time === timeText) { msgIdx = i; break; }
      }
      if (msgIdx < 0) return;
      const msg = grp.messages[msgIdx];
      const preview = msg.content.slice(0, 40) + (msg.content.length > 40 ? '…' : '');
      const senderName = _getGroupDisplayName(grp, msg.sender);

      const w2 = _dialog(
        `<div class="ax-dlg-h">消息操作</div>` +
        `<div class="ax-dlg-sub" style="word-break:break-all">${_esc(senderName)}：${_esc(preview)}</div>` +
        `<div class="ax-dlg-actions" style="flex-direction:column;gap:4px;align-items:stretch">` +
        `<button class="ax-dlg-btn ax-dlg-ok" id="ax-gm-quote" style="text-align:center">💬 引用回复</button>` +
        `<button class="ax-dlg-btn ax-dlg-cancel" id="ax-gm-del" style="text-align:center;color:${t.fail}">🗑️ 删除消息</button>` +
        `<button class="ax-dlg-btn ax-dlg-cancel" id="ax-gm-cancel" style="text-align:center">取消</button>` +
        `</div>`
      );
      // 引用
      w2.find('#ax-gm-quote').on('click', () => {
        w2.remove();
        const t2 = _t();
        // 在输入栏上方显示引用预览框
        const quotePreview = msg.content.slice(0, 50) + (msg.content.length > 50 ? '…' : '');
        // 移除旧的引用框
        $('#ax-grp-quote-bar').remove();
        // 创建引用框
        const $quoteBar = $(`<div id="ax-grp-quote-bar" style="display:flex;align-items:center;gap:6px;padding:6px 10px;margin:0 10px;background:rgba(${t2.primaryRgb},.06);border-left:3px solid ${t2.primary};border-radius:0 8px 8px 0;font-size:9px;color:${t2.textDim};animation:axIn .2s ease">
          <div style="flex:1;min-width:0">
            <div style="font-size:8px;color:${t2.primary};font-weight:600">${_esc(senderName)}</div>
            <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${_esc(quotePreview)}</div>
          </div>
          <span id="ax-grp-quote-close" style="cursor:pointer;font-size:12px;color:${t2.textMuted};flex-shrink:0;padding:2px">✕</span>
        </div>`);
        // 插入到输入栏之前
        $('#ax-grp-input').closest('.ax-chat-input-bar').before($quoteBar);
        // 存储引用数据
        $quoteBar.data('quote-sender', senderName);
        $quoteBar.data('quote-content', quotePreview);
        // 关闭引用
        $quoteBar.find('#ax-grp-quote-close').on('click', () => $quoteBar.remove());
        // 聚焦输入框
        $('#ax-grp-input').focus();
      });
      // 删除
      w2.find('#ax-gm-del').on('click', () => {
        grp.messages.splice(msgIdx, 1);
        _saveGroupChat(_currentGroupId, grp);
        w2.remove();
        _drawGroupConversation($c);
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 消息已删除');
      });
      w2.find('#ax-gm-cancel').on('click', () => w2.remove());
    });

    // 群设置
    $c.find('#ax-grp-settings').on('click', () => _showGroupSettingsDialog($c));

    //★ 群聊：音乐分享点击播放
    $c.find('#ax-grp-msgs').on('click', '.ax-music-share', function (e) {
      e.stopPropagation();
      const keyword = $(this).data('keyword');
      const songName = $(this).data('song');
      if (!keyword) return;
      $(this).find('div:last').html('<span>🎧</span> 加载中…');
      (async () => {
        const result = await _searchAndPlayMusic(keyword);
        if (result.success) {
          const data = result.data;
          const song = { name: data.Name || songName, artist: data.Singer || '', keyword: keyword, url: data.Url, lyric: data.Lyric || '' };
          _radioCurrentSong = song;
          _radioLyrics = _parseLrc(data.Lyric || '');
          _addRadioHistory(song);
          _setPlaylist([song], 0);
          const audio = _getRadioAudio();
          audio.src = data.Url;
          audio.volume = _radioVolume / 100;
          try { await audio.play(); _radioPlaying = true; } catch (err) { }
          _startLyricUpdater();
          _updateChrome();
          $(this).find('div:last').html('<span>🎧</span> 正在播放');
        } else {
          $(this).find('div:last').html('<span>❌</span> 播放失败');
          setTimeout(() => { $(this).find('div:last').html('<span>🎧</span> 点击重试'); }, 3000);
        }
      })();
    });

    // ★ 群聊：链接分享点击
    $c.find('#ax-grp-msgs').on('click', '.ax-link-share', function (e) {
      e.stopPropagation();
      const linkTitle = $(this).data('link-title');
      const linkSource = $(this).data('link-source');
      const linkDesc = $(this).data('link-desc');
      const linkType = $(this).data('link-type');
      //群聊中的链接：显示详情预览
      _showLinkPreview(null, linkTitle, linkSource, linkDesc, linkType);
    });

    // ★ 群聊：语音消息点击播放
    $c.find('#ax-grp-msgs').on('click', '.ax-voice-msg', function (e) {
      e.stopPropagation();
      const voiceText = $(this).data('voice-text');
      const voiceId = $(this).data('voice-id');
      if (!voiceText) return;
      const $icon = $c.find('#ax-vpi-' + voiceId);
      if (_broadcastSpeaking) {
        _stopSpeaking();
        $icon.text('▶️');return;
      }
      $icon.text('⏸');
      //尝试确定说话者的性别
      const $row = $(this).closest('.ax-chat-msg-row');
      let speakerGender = 'male';
      let speakerName = null;
      if ($row.hasClass('npc')) {
        const $avatar = $row.find('.ax-grp-avatar-click');
        if ($avatar.length) {
          speakerName = $avatar.data('npc-name');
          if (speakerName) {
            const npcP = _getNpcPersonality(speakerName);
            speakerGender = npcP.voiceGender || 'male';
          }
        }
      }
      _speak(voiceText, function () { $icon.text('▶️'); }, speakerGender, speakerName);
    });
  }

  // 发送群消息（仅发送，不触发NPC回复）
  function _doGroupSendOnly() {
    if (!_currentGroupId) return;
    const $input = $('#ax-grp-input');
    const msg = $input.val().trim();
    // 检查是否有引用
    const $quoteBar = $('#ax-grp-quote-bar');
    let finalMsg = msg;
    if ($quoteBar.length) {
      const quoteSender = $quoteBar.data('quote-sender');
      const quoteContent = $quoteBar.data('quote-content');
      finalMsg = `「${quoteSender}：${quoteContent}」\n${msg}`;
      $quoteBar.remove();
    }
    if (!msg) return;
    $input.val('');
    //不重置高度，保持键盘不消失
    const playerName = _getPlayerName();
    _addGroupMessage(_currentGroupId, playerName, finalMsg, 'text');

    // ★ 不重绘整个界面，只追加消息到DOM
    const $msgs = $('#ax-grp-msgs');
    if ($msgs.length) {
      const t = _t();
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const userAvatarUrl = _getPlayerAvatar();
      const uavStyle = userAvatarUrl ? `background-image:url('${userAvatarUrl}');background-size:cover;background-position:center` : '';
      const uavContent = userAvatarUrl ? '' : '👤';

      let html = `<div class="ax-chat-msg-row user">`;
      html += `<div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;gap:2px">`;
      html += `<div class="ax-chat-msg-avatar user-av" style="${uavStyle}">${uavContent}</div>`;
      html += `</div>`;
      html += `<div class="ax-chat-msg-group">`;

      const specialHtml = _renderMessageContent(finalMsg, true);
      if (specialHtml !== null && specialHtml !== '') {
        html += `<div class="ax-chat-bubble user" style="background:transparent;padding:4px">${specialHtml}<span class="ax-chat-time">${timeStr}</span></div>`;
      } else {
        html += `<div class="ax-chat-bubble user">${_esc(finalMsg)}<span class="ax-chat-time">${timeStr}</span></div>`;
      }
      html += `</div></div>`;
      $msgs.append(html);
      $msgs.scrollTop($msgs[0].scrollHeight);
    }

    // ★ 重新聚焦输入框（防止键盘消失）
    setTimeout(() => { $input.focus(); }, 50);
    //同步到世界书
    if (window._abyssChatSyncConfig) {
      const cfg = window._abyssChatSyncConfig;
      window.AbyssChat.syncToWorldInfo(cfg.worldBookName, cfg.uid).catch(() => {});
    }
  }

  // 群设置弹窗
  function _showGroupSettingsDialog($parentC) {
    const t = _t();
    const group = _getGroupChat(_currentGroupId);
    if (!group) return;
    const playerName = _getPlayerName();
    const isOwner = group.owner === playerName;

    let o = '<div class="ax-dlg-h">⚙ 群设置</div>';

    // 群头像和名称
    o += `<div style="text-align:center;padding:8px 0">`;
    const isEmoji = group.avatar && group.avatar.length <= 4 && !group.avatar.startsWith('data:');
    o += `<div id="ax-gs-avatar" style="width:48px;height:48px;border-radius:50%;margin:0 auto;background:${t.iconBg};display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;border:2px solid ${t.border};overflow:hidden;${(!isEmoji && group.avatar) ? "background-image:url('" + group.avatar + "');background-size:cover;background-position:center" : ''}">${isEmoji ? group.avatar : (group.avatar ? '' : '👥')}</div>`;
    o += `<div id="ax-gs-name" style="font-size:12px;font-weight:600;color:${t.text};margin-top:6px;cursor:pointer">${_esc(group.name)}✎</div>`;
    o += `</div>`;

    // 群公告
    o += `<div style="margin-bottom:8px">`;
    o += `<div style="font-size:8px;color:${t.textMuted};margin-bottom:3px">📢 群公告</div>`;
    o += `<div id="ax-gs-announcement" style="padding:6px 8px;background:${t.surfaceHover};border-radius:8px;font-size:9px;color:${t.textDim};cursor:pointer;min-height:24px">${group.announcement ? _esc(group.announcement) : '<span style="color:' + t.textMuted + ';font-style:italic">点击设置群公告</span>'}</div>`;
    o += `</div>`;

    // 成员列表
    o += `<div style="font-size:8px;color:${t.textMuted};margin-bottom:3px">👥 群成员 (${group.members.length})</div>`;
    o += `<div style="max-height:150px;overflow-y:auto;background:${t.surfaceHover};border-radius:8px;padding:4px">`;
    for (const member of group.members) {
      const isMemberOwner = member === group.owner;
      const isMemberMuted = group.muted.includes(member);
      const isSelf = member === playerName;
      const emoji = isSelf ? '👤' : _getNpcEmoji(member);
      const nickname = _getGroupDisplayName(group, member);
      const displayStr = nickname !== member ? `${member}（${nickname}）` : member;

      o += `<div style="display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:6px;font-size:9px">`;
      o += `<span style="font-size:14px">${emoji}</span>`;
      o += `<span style="flex:1;color:${t.text}">${_esc(displayStr)}</span>`;
      if (isMemberOwner) o += `<span style="font-size:7px;color:${t.accent};background:rgba(${t.accentRgb},.1);padding:1px 4px;border-radius:3px">群主</span>`;
      if (isMemberMuted) o += `<span style="font-size:7px;color:${t.fail}">🔇</span>`;
      // 群主操作按钮
      if (isOwner && !isSelf) {
        o += `<button class="ax-api-btn ax-gs-mute" data-member="${_esc(member)}" style="font-size:7px;padding:1px 4px">${isMemberMuted ? '解禁' : '禁言'}</button>`;
        o += `<button class="ax-api-btn danger ax-gs-kick" data-member="${_esc(member)}" style="font-size:7px;padding:1px 4px">移除</button>`;
      }
      // 设置备注按钮
      o += `<button class="ax-api-btn ax-gs-nickname" data-member="${_esc(member)}" style="font-size:7px;padding:1px 4px">备注</button>`;
      o += `</div>`;
    }
    o += `</div>`;

    // 添加成员按钮
    if (isOwner) {
      o += `<button class="ax-api-btn" id="ax-gs-add-member" style="width:100%;text-align:center;margin-top:6px;font-size:9px">＋ 添加成员</button>`;
    }

    o += `<div class="ax-dlg-actions" style="margin-top:8px"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-gs-close">关闭</button></div>`;

    const w = _dialog(o);

    // 修改群名
    w.find('#ax-gs-name').on('click', () => {
      const w2 = _dialog(`<div class="ax-dlg-h">✎ 修改群名</div><input class="ax-dlg-input" id="ax-gn-v" type="text" value="${_esc(group.name)}" maxlength="20"><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-gn-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-gn-yes">确认</button></div>`);
      w2.find('#ax-gn-no').on('click', () => w2.remove());
      w2.find('#ax-gn-yes').on('click', () => {
        const v = $('#ax-gn-v').val().trim();
        if (v) { _renameGroup(_currentGroupId, v); w2.remove(); w.remove(); _drawGroupConversation($parentC); }
      });
    });

    // 修改群头像
    w.find('#ax-gs-avatar').on('click', () => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*';
      inp.onchange = function () {
        const f = this.files[0]; if (!f) return;
        const rd = new FileReader();
        rd.onload = function (e) {
          const img = new Image();
          img.onload = function () {
            let wd = img.width, ht = img.height;
            const mx = 150;
            if (wd > mx || ht > mx) { const r = Math.min(mx / wd, mx / ht); wd = Math.round(wd * r); ht = Math.round(ht * r); }
            const cv = document.createElement('canvas'); cv.width = wd; cv.height = ht;
            cv.getContext('2d').drawImage(img, 0, 0, wd, ht);
            const out = cv.toDataURL('image/jpeg', 0.7);
            _setGroupAvatar(_currentGroupId, out);
            w.remove();
            _drawGroupConversation($parentC);
          };
          img.src = e.target.result;
        };
        rd.readAsDataURL(f);
      };
      inp.click();
    });

    // 设置群公告
    w.find('#ax-gs-announcement').on('click', () => {
      const w2 = _dialog(`<div class="ax-dlg-h">📢 设置群公告</div><textarea class="ax-dlg-input" id="ax-ga-v" placeholder="输入群公告内容…" style="min-height:60px">${_esc(group.announcement || '')}</textarea><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-ga-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-ga-yes">发布</button></div>`);
      w2.find('#ax-ga-no').on('click', () => w2.remove());
      w2.find('#ax-ga-yes').on('click', () => {
        const v = $('#ax-ga-v').val().trim();
        _setGroupAnnouncement(_currentGroupId, v);
        w2.remove();
        w.remove();
        _drawGroupConversation($parentC);
      });
    });

    //禁言
    w.find('.ax-gs-mute').on('click', function () {
      _toggleGroupMute(_currentGroupId, $(this).data('member'));
      w.remove();
      _showGroupSettingsDialog($parentC);
    });

    // 移除
    w.find('.ax-gs-kick').on('click', function () {
      const member = $(this).data('member');
      _removeGroupMember(_currentGroupId, member);
      w.remove();
      _showGroupSettingsDialog($parentC);
    });

    // 设置备注
    w.find('.ax-gs-nickname').on('click', function () {
      const member = $(this).data('member');
      const current = group.nicknames && group.nicknames[member] ? group.nicknames[member] : '';
      const w2 = _dialog(`<div class="ax-dlg-h">✎ 设置群内备注</div><div class="ax-dlg-sub">${_esc(member)}</div><input class="ax-dlg-input" id="ax-gnk-v" type="text" value="${_esc(current)}" placeholder="留空则使用原名" maxlength="15"><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-gnk-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-gnk-yes">确认</button></div>`);
      w2.find('#ax-gnk-no').on('click', () => w2.remove());
      w2.find('#ax-gnk-yes').on('click', () => {
        const v = $('#ax-gnk-v').val().trim();
        _setGroupNickname(_currentGroupId, member, v);
        w2.remove();
        w.remove();
        _showGroupSettingsDialog($parentC);
      });
    });

    // 添加成员
    w.find('#ax-gs-add-member').on('click', () => {
      const w2 = _dialog(`<div class="ax-dlg-h">＋ 添加成员</div><input class="ax-dlg-input" id="ax-gam-v" type="text" placeholder="输入NPC名称" maxlength="20"><div class="ax-dlg-err" id="ax-gam-e"></div><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-gam-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-gam-yes">添加</button></div>`);
      w2.find('#ax-gam-no').on('click', () => w2.remove());
      w2.find('#ax-gam-yes').on('click', () => {
        const v = $('#ax-gam-v').val().trim();
        if (!v) { $('#ax-gam-e').text('请输入名称'); return; }
        const ok = _addGroupMember(_currentGroupId, v);
        if (!ok) { $('#ax-gam-e').text('已在群中或添加失败'); return; }
        w2.remove();
        w.remove();
        _showGroupSettingsDialog($parentC);
      });
    });

    w.find('#ax-gs-close').on('click', () => w.remove());
  }

  // 发红包弹窗
  function _showGroupRedPacketDialog($parentC) {
    const t = _t();
    const coins = _getPlayerCoins();
    const group = _getGroupChat(_currentGroupId);
    if (!group) return;

    const w = _dialog(
      '<div class="ax-dlg-h">🧧 发红包</div>' +
      `<div class="ax-dlg-sub">余额：${coins} 💰</div>` +
      '<div class="ax-api-form">' +
      '<label>总金额</label>' +
      '<input id="ax-rp-amount" type="number" placeholder="红包总额" min="1" max="9999">' +
      '<label>红包个数</label>' +
      `<input id="ax-rp-count" type="number" placeholder="拆成几个" min="1" max="${group.members.length}" value="${Math.min(5, group.members.length)}">` +
      '</div>' +
      '<div class="ax-dlg-err" id="ax-rp-err"></div>' +
      '<div class="ax-dlg-actions">' +
      '<button class="ax-dlg-btn ax-dlg-cancel" id="ax-rp-no">取消</button>' +
      '<button class="ax-dlg-btn ax-dlg-ok" id="ax-rp-yes" style="background:rgba(200,48,48,.15);border-color:rgba(200,48,48,.3);color:#c83030">🧧 发红包</button>' +
      '</div>'
    );

    w.find('#ax-rp-no').on('click', () => w.remove());
    w.find('#ax-rp-yes').on('click', async () => {
      const amount = parseInt($('#ax-rp-amount').val());
      const count = parseInt($('#ax-rp-count').val());
      if (!amount || amount <= 0) { $('#ax-rp-err').text('请输入金额'); return; }
      if (!count || count <= 0) { $('#ax-rp-err').text('请输入个数'); return; }
      if (amount > coins) { $('#ax-rp-err').text('余额不足'); return; }

      await _setPlayerCoins(coins - amount);
      _createRedPacket(_currentGroupId, _getPlayerName(), amount, count);
      w.remove();
      _drawGroupConversation($parentC);

      // NPC自动抢红包
      setTimeout(async () => {
        const grp = _getGroupChat(_currentGroupId);
        if (!grp) return;
        const rp = grp.redpackets[grp.redpackets.length - 1];
        if (!rp || rp.remainingCount <= 0) return;
        const npcMembers = grp.members.filter(m => m !== _getPlayerName() && !_isBlocked(m));
        // 随机选一些NPC抢红包
        const shuffled = [...npcMembers].sort(() => 0.5 - Math.random());
        for (const npc of shuffled.slice(0, Math.min(rp.remainingCount, shuffled.length))) {
          const result = _claimRedPacket(_currentGroupId, rp.id, npc);
          if (result && result.amount) {
            _addGroupMessage(_currentGroupId, '__system__', `${npc} 抢到了 ${result.amount} 💰`, 'system');
          }
          await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));
        }
        if (_currentGroupId) _drawGroupConversation($parentC);
      }, 1000);
    });
  }

  // 发起接龙弹窗
  function _showGroupSolitaireDialog($parentC) {
    const t = _t();
    const w = _dialog(
      '<div class="ax-dlg-h">📋 发起接龙</div>' +
      '<div class="ax-api-form">' +
      '<label>接龙标题</label>' +
      '<input id="ax-sol-title" type="text" placeholder="如：今晚谁去打副本" maxlength="30">' +
      '</div>' +
      '<div class="ax-dlg-err" id="ax-sol-err"></div>' +
      '<div class="ax-dlg-actions">' +
      '<button class="ax-dlg-btn ax-dlg-cancel" id="ax-sol-no">取消</button>' +
      '<button class="ax-dlg-btn ax-dlg-ok" id="ax-sol-yes">发起</button>' +
      '</div>'
    );
    w.find('#ax-sol-no').on('click', () => w.remove());
    w.find('#ax-sol-yes').on('click', async () => {
      const title = $('#ax-sol-title').val().trim();
      if (!title) { $('#ax-sol-err').text('请输入标题'); return; }

      const groupId = _currentGroupId;
      const playerName = _getPlayerName();
      _startSolitaire(groupId, title, playerName);
      w.remove();
      _drawGroupConversation($parentC);

      const auxApi = _getAuxApi();
      if (!auxApi) return;

      const grp = _getGroupChat(groupId);
      if (!grp || !grp.solitaire || !grp.solitaire.active) return;

      const npcMembers = grp.members.filter(m => m !== playerName && !grp.muted.includes(m) && !_isBlocked(m));
      if (!npcMembers.length) return;

      const context = _getContextSummary();
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=info NPC正在参与接龙…');

      let joinedCount = 0;
      for (const npc of npcMembers.slice(0, 5)) {
        try {
          const npcP = _getNpcPersonality(npc);
          const solMsgs = [{
            role: 'system',
            content: `群里发起了接龙：「${title}」
你是"${npc}"，性格：${npcP.personality.slice(0, 60)}

当前世界和剧情：
${context.slice(0, 800)}

请用一句话参与这个接龙（10-30字），说话风格要完全符合你的性格。
只输出接龙内容，不要加前缀。`
          }, { role: 'user', content: '参与接龙' }];

          const reply = await _callAuxApi(solMsgs, { temperature: 0.95, max_tokens: 1000 });
          if (reply && reply.trim()) {
            _joinSolitaire(groupId, npc, reply.trim().slice(0, 80));
            joinedCount++;await new Promise(r => setTimeout(r, 300+ Math.random() * 500));
          }
        } catch (e) { console.warn('[Solitaire]', npc, 'fail:', e.message); }
      }

      if (joinedCount > 0 && typeof triggerSlash === 'function') {
        triggerSlash(`/echo severity=success ${joinedCount}个NPC参与了接龙！`);
      }
      if (_currentGroupId === groupId) _drawGroupConversation($parentC);
    });
  }

  function _showGroupStickerPanel() {
    const t = _t();
    const stickers = _loadStickers();
    const customTags = _loadCustomTags();

    let o = '<div class="ax-dlg-h">😊 表情包</div>';

    if (!stickers.length) {
      o += `<div style="text-align:center;padding:20px;color:${t.textMuted};font-size:10px;font-style:italic">还没有表情包<br>请在"我的"页面中添加</div>`;
    } else {
      const groups = {};
      for (const s of stickers) {
        const tagKey = s.tag || '_unknown';
        if (!groups[tagKey]) groups[tagKey] = [];
        groups[tagKey].push(s);
      }
      for (const ct of customTags) {
        if (!groups[ct.id] || !groups[ct.id].length) continue;
        o += `<div style="font-size:8px;color:${t.textMuted};margin:6px 0 3px">${ct.emoji} ${ct.name}</div>`;
        o += '<div style="display:flex;flex-wrap:wrap;gap:6px">';
        for (const s of groups[ct.id]) {
          o += `<div class="ax-stk-item ax-grp-stk-send" data-stk-id="${s.id}" title="${_esc(s.name)}" style="width:50px;height:50px;border-radius:8px;cursor:pointer;overflow:hidden;border:1px solid ${t.border};transition:all .2s;background-size:contain;background-repeat:no-repeat;background-position:center;background-image:url('${s.dataUrl}')"></div>`;
        }
        o += '</div>';
      }
      // 未分类
      const knownTagIds = customTags.map(ct => ct.id);
      const orphanKeys = Object.keys(groups).filter(k => !knownTagIds.includes(k));
      for (const ok of orphanKeys) {
        if (!groups[ok].length) continue;
        o += `<div style="font-size:8px;color:${t.textMuted};margin:6px 0 3px">🏷️ 未分类</div>`;
        o += '<div style="display:flex;flex-wrap:wrap;gap:6px">';
        for (const s of groups[ok]) {
          o += `<div class="ax-stk-item ax-grp-stk-send" data-stk-id="${s.id}" title="${_esc(s.name)}" style="width:50px;height:50px;border-radius:8px;cursor:pointer;overflow:hidden;border:1px solid ${t.border};transition:all .2s;background-size:contain;background-repeat:no-repeat;background-position:center;background-image:url('${s.dataUrl}')"></div>`;
        }
        o += '</div>';
      }
    }

    o += `<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-gstk-close">关闭</button></div>`;

    const w = _dialog(o);

    w.find('.ax-grp-stk-send').on('click', function () {
      const id = $(this).data('stk-id');
      const sticker = _getStickerById(id);
      if (sticker && _currentGroupId) {
        const playerName = _getPlayerName();
        const content = `[sticker:${sticker.id}:${sticker.name}]`;
        _addGroupMessage(_currentGroupId, playerName, content, 'text');
        w.remove();
        const $c2 = $('#ax-chat-main-body');
        if ($c2.length) _drawGroupConversation($c2);
      }
    });

    w.find('#ax-gstk-close').on('click', () => w.remove());
  }


  /* ═══════════════════════════════════════
     💬 聊天列表
     ═══════════════════════════════════════ */
  function _drawChatList($c) {
    const t = _t();
    const allChats = _loadChats();
    const convos = Object.keys(allChats).filter(k => k && k !== 'null' && allChats[k] && allChats[k].messages && allChats[k].messages.length > 0);

    // 清理无效数据
    let needClean = false;
    for (const k of Object.keys(allChats)) {
      if (!k || k === 'null' || k === 'undefined' || !allChats[k]) {
        delete allChats[k];
        needClean = true;
      }
    }
    if (needClean) _saveChats(allChats);

    // 收集群聊
    const groups = _getGroupChatList();

    // 构建混合列表
    const mixedList = [];

    // 单聊条目
    for (const name of convos) {
      const chat = allChats[name];
      const last = chat.messages[chat.messages.length - 1];
      mixedList.push({
        type: 'chat',
        name: name,
        lastContent: last ? (last.role === 'user' ? '我: ' : '') + last.content.slice(0, 30) : '',
        lastTime: last ? last.time : '',
        ts: last ? last.ts : 0,
        unread: _getUnreadFor(name)
      });
    }

    // 群聊条目
    for (const group of groups) {
      const lastMsg = group.messages.length ? group.messages[group.messages.length - 1] : null;
      mixedList.push({
        type: 'group',
        groupId: group.id,
        name: group.name,
        memberCount: group.members.length,
        avatar: group.avatar,
        lastContent: lastMsg ? (lastMsg.type === 'system' ? lastMsg.content : `${lastMsg.sender}: ${lastMsg.content}`).slice(0, 30) : '',
        lastTime: lastMsg ? lastMsg.time : '',
        ts: lastMsg ? lastMsg.ts : group.createdTs,
        unread: _getGroupUnreadFor(group.id)
      });
    }

    // 按最后消息时间排序
    mixedList.sort((a, b) => b.ts - a.ts);

    let o = '';
    o += '<div class="ax-chat-list-wrapper">';

    // 顶部操作栏：新对话 + 建群
    o += '<div style="display:flex;gap:4px;margin-bottom:6px">';
    o += '<div class="ax-chat-new-btn" id="ax-chat-new" style="flex:1">＋ 发起新对话</div>';
    o += `<div class="ax-chat-new-btn" id="ax-group-new" style="flex:0 0 auto;min-width:auto;padding:8px 12px">👥 建群</div>`;
    o += '</div>';

    if (!mixedList.length) {
      o += '<div class="ax-chat-empty">暂无消息<br><span style="font-size:8px;opacity:.6">发起新对话或建群开始聊天</span></div>';
    } else {
      for (const item of mixedList) {
        if (item.type === 'chat') {
          // 单聊条目
          const avatarUrl = _getNpcAvatar(item.name);
          const emoji = _getNpcEmoji(item.name);
          const chatRemarkName = _getChatRemark(item.name);
          const displayName = chatRemarkName || item.name;
          const avatarStyle = avatarUrl ? `background-image:url('${avatarUrl}');background-size:cover;background-position:center` : '';
          const avatarContent = avatarUrl ? '' : emoji;
          const npcMoodData = _getNpcMood(item.name);
          const moodIcon = _getMoodIcon(npcMoodData.mood);

          o += `<div class="ax-chat-list-item" data-chat-name="${_esc(item.name)}">`;
          o += `<div class="ax-chat-avatar" style="${avatarStyle};position:relative">${avatarContent}</div>`;
          o += '<div class="ax-chat-list-body">';
          o += `<div class="ax-chat-list-name"><span>${moodIcon} ${_esc(displayName)}</span><span class="ax-chat-list-time">${item.lastTime}</span></div>`;
          o += `<div class="ax-chat-list-preview">${_esc(item.lastContent)}</div>`;
          o += '</div>';
          if (item.unread > 0) o += `<span class="ax-chat-unread">${item.unread > 99 ? '99+' : item.unread}</span>`;
          o += `<span class="ax-chat-del-btn" data-del-name="${_esc(item.name)}" title="删除对话">✕</span>`;
          o += '</div>';
        } else if (item.type === 'group') {
          // 群聊条目
          const isEmoji = item.avatar && item.avatar.length <= 4 && !item.avatar.startsWith('data:');
          const grpAvatarStyle = (!isEmoji && item.avatar) ? `background-image:url('${item.avatar}');background-size:cover;background-position:center` : '';
          const grpAvatarContent = isEmoji ? item.avatar : (grpAvatarStyle ? '' : '👥');

          o += `<div class="ax-chat-list-item" data-group-id="${item.groupId}">`;
          o += `<div class="ax-chat-avatar" style="${grpAvatarStyle}">${grpAvatarContent}</div>`;
          o += '<div class="ax-chat-list-body">';
          o += `<div class="ax-chat-list-name"><span>${_esc(item.name)}<span style="font-size:7px;color:${t.textMuted}">(${item.memberCount})</span></span><span class="ax-chat-list-time">${item.lastTime}</span></div>`;
          o += `<div class="ax-chat-list-preview">${_esc(item.lastContent)}</div>`;
          o += '</div>';
          if (item.unread > 0) o += `<span class="ax-chat-unread">${item.unread > 99 ? '99+' : item.unread}</span>`;
          o += `<span class="ax-chat-del-btn" data-del-group="${item.groupId}" title="删除群聊">✕</span>`;
          o += '</div>';
        }
      }
    }
    o += '</div>';
    $c.html(o);

    // 点击单聊
    $c.find('.ax-chat-list-item[data-chat-name]').on('click', function (e) {
      if ($(e.target).hasClass('ax-chat-del-btn')) return;
      const name = $(this).data('chat-name');
      if (!name || name === 'null') return;
      if (_isBlocked(name)) {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning对方已被拉黑');
        return;
      }
      _chatTarget = name;
      _clearUnread(name);
      _render();
    });

    // 点击群聊
    $c.find('.ax-chat-list-item[data-group-id]').on('click', function (e) {
      if ($(e.target).hasClass('ax-chat-del-btn')) return;
      const gid = $(this).data('group-id');
      _currentGroupId = gid;
      _clearGroupUnread(gid);
      // ★ 重新调用_render让_drawChatMainView走群聊拦截分支，彻底去掉社交头部和Tab
      _render();
    });

    // 删除单聊
    $c.find('.ax-chat-del-btn[data-del-name]').on('click', function (e) {
      e.stopPropagation();
      const name = $(this).data('del-name');
      const w = _dialog(`<div class="ax-dlg-h">删除对话</div><div class="ax-dlg-sub">确定删除与"${_esc(name)}"的所有聊天记录？</div><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-cdl-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-cdl-yes" style="color:${t.fail}">删除</button></div>`);
      $('#ax-cdl-no').on('click', () => w.remove());
      $('#ax-cdl-yes').on('click', () => { _deleteChat(name); w.remove(); _drawChatList($c); if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 对话已删除'); });
    });

    // 删除群聊
    $c.find('.ax-chat-del-btn[data-del-group]').on('click', function (e) {
      e.stopPropagation();
      const gid = $(this).data('del-group');
      const group = _getGroupChat(gid);
      if (!group) return;
      const playerName = _getPlayerName();
      const isOwner = group.owner === playerName;
      const w = _dialog(
        `<div class="ax-dlg-h">${isOwner ? '解散群聊' : '退出群聊'}</div>` +
        `<div class="ax-dlg-sub">${isOwner ? '解散后所有聊天记录将被删除' : '退出后你将不再收到群消息'}</div>` +
        `<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-gd-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-gd-yes" style="color:${t.fail}">确认</button></div>`
      );
      $('#ax-gd-no').on('click', () => w.remove());
      $('#ax-gd-yes').on('click', () => {
        if (isOwner) _deleteGroupChat(gid);
        else _removeGroupMember(gid, playerName);
        w.remove();
        _drawChatList($c);
      });
    });

    // 新对话
    $c.find('#ax-chat-new').on('click', () => _newChatDialog());

    // 建群
    $c.find('#ax-group-new').on('click', () => _showCreateGroupDialog($c));
  }

  function _newChatDialog() {
    const t = _t();
    const w = _dialog(`<div class="ax-dlg-h">💬 发起新对话</div><div class="ax-dlg-sub">输入NPC名称开始聊天</div><input class="ax-dlg-input" id="ax-nc-name" type="text" placeholder="输入NPC名称…" maxlength="20"><div class="ax-dlg-err" id="ax-nc-e"></div><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-nc-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-nc-yes">开始</button></div>`);
    const $i = $('#ax-nc-name'); $i.focus();
    $('#ax-nc-no').on('click', () => w.remove());
    $i.on('keydown', e => { if (e.key === 'Enter') go(); });
    $('#ax-nc-yes').on('click', go);
    function go() {
      const name = $i.val().trim();
      if (!name) { $('#ax-nc-e').text('名称不能为空'); return; }
      // 检查是否被拉黑
      if (_isBlocked(name)) {
        $('#ax-nc-e').text('对方已被拉黑');
        return;
      }
      w.remove();
      _chatTarget = name;
      _clearUnread(name);
      _render();
    }
  }

  /*═══════════════════════════════════════🔗 NPC关系网络
     ═══════════════════════════════════════ */
  function _drawNpcRelations($c, d) {
    const t = _t();
    const rels = d['NPC关系'];
    if (!rels || typeof rels !== 'object') {
      $c.html('<div class="ax-nil">尚未结识任何人</div>');
      return;
    }

    const npcNames = Object.keys(rels).filter(k => !_skip(k));
    if (!npcNames.length) {
      $c.html('<div class="ax-nil">尚未结识任何人</div>');
      return;
    }

    let o = '';

    o += `<div style="text-align:center;padding:8px 0 12px">`;
    o += `<div style="font-size:10px;color:${t.textDim};letter-spacing:2px">NPC 关 系 网</div>`;
    o += `<div style="font-size:7px;color:${t.textMuted};margin-top:2px">查看NPC之间的互动与关系动态</div>`;
    o += `</div>`;

    // 每个NPC的关系卡片（重点展示NPC间关系）
    for (const npc of npcNames) {
      const rel = rels[npc];
      const relStr = typeof rel === 'string' ? rel : '未知';
      const location = (d['NPC位置'] && d['NPC位置'][npc]) ? d['NPC位置'][npc] : '';
      const npcInter = (d['NPC互动'] && d['NPC互动'][npc]) ? d['NPC互动'][npc] : null;
      const emoji = _getNpcEmoji(npc);
      const avatarUrl = _getNpcAvatar(npc);
      const imgStyle = avatarUrl ? `background-image:url('${avatarUrl}');background-size:cover;background-position:center` : '';
      const imgContent = avatarUrl ? '' : emoji;

      o += `<div style="margin-bottom:10px;padding:10px;background:${t.surfaceHover};border-radius:12px">`;

      // NPC头部信息
      o += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">`;
      o += `<div style="width:36px;height:36px;border-radius:50%;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px;background:${t.iconBg};${imgStyle}">${imgContent}</div>`;
      o += `<div style="flex:1">`;
      const npcRelMood = _getNpcMood(npc);
      const npcRelMoodIcon = _getMoodIcon(npcRelMood.mood);
      o += `<div style="font-size:11px;font-weight:600;color:${t.text}">${_esc(npc)} ${npcRelMoodIcon}</div>`;
      o += `<div style="display:flex;gap:8px;font-size:8px;color:${t.textMuted}">`;
      if (location) o += `<span>📍${_esc(location)}</span>`;
      o += `<span>${npcRelMoodIcon} ${_esc(npcRelMood.mood)}${npcRelMood.detail ? '·' + _esc(npcRelMood.detail) : ''}</span>`;
      o += `</div>`; o += `</div></div>`;

      // NPC间关系（重点区域）
      if (npcInter) {
        if (typeof npcInter === 'string') {
          // 旧格式兼容：值是字符串
          o += `<div style="padding:6px 8px;border-left:2px solid rgba(${t.primaryRgb},.2);margin-top:4px">`;
          o += `<div style="font-size:7px;color:${t.textMuted};margin-bottom:2px;letter-spacing:1px">对其他NPC的态度</div>`;
          o += `<div style="font-size:9px;color:${t.text};line-height:1.5">${_esc(npcInter)}</div>`;
          o += `</div>`;
        } else if (typeof npcInter === 'object') {
          const interKeys = Object.keys(npcInter).filter(k => !_skip(k));
          if (interKeys.length) {
            o += `<div style="padding:6px 8px;border-left:2px solid rgba(${t.primaryRgb},.2);margin-top:4px">`;
            o += `<div style="font-size:7px;color:${t.textMuted};margin-bottom:4px;letter-spacing:1px">与其他NPC的关系</div>`;
            for (const otherNpc of interKeys) {
              const otherEmoji = _getNpcEmoji(otherNpc);
              const interRel = npcInter[otherNpc];
              o += `<div style="display:flex;align-items:center;gap:6px;padding:3px 0;font-size:9px">`;
              o += `<span style="font-size:12px">${otherEmoji}</span>`;
              o += `<span style="color:${t.accent};font-weight:500">${_esc(otherNpc)}</span>`;
              o += `<span style="color:${t.textDim}">→</span>`;
              o += `<span style="color:${t.text};flex:1">${_esc(String(interRel))}</span>`;
              o += `</div>`;
            }
            o += `</div>`;
          } else {
            o += `<div style="font-size:8px;color:${t.textMuted};font-style:italic;padding:4px 8px;margin-top:4px">暂无与其他NPC的互动记录</div>`;
          }
        }
      } else {
        o += `<div style="font-size:8px;color:${t.textMuted};font-style:italic;padding:4px 8px;margin-top:4px">暂无与其他NPC的互动记录</div>`;
      }

      o += `</div>`;
    }

    // 关系矩阵概览（如果有多个NPC）
    if (npcNames.length >= 2 && d['NPC互动']) {
      o += `<div style="margin-top:8px;padding:10px;background:${t.surfaceHover};border-radius:12px">`;
      o += `<div style="font-size:8px;color:${t.textMuted};letter-spacing:1px;margin-bottom:6px;text-align:center">关 系 矩 阵</div>`;
      // 找出所有有互动记录的NPC对
      const pairs = [];
      for (const npcA of npcNames) {
        const inter = d['NPC互动'][npcA];
        if (!inter || typeof inter !== 'object') continue;
        for (const npcB of Object.keys(inter).filter(k => !_skip(k))) {
          if (!npcNames.includes(npcB)) continue;
          // 避免重复（A→B和B→A只显示一次）
          const pairKey = [npcA, npcB].sort().join('|');
          if (pairs.find(p => p.key === pairKey)) continue;
          const relAtoB = inter[npcB] || '';
          const relBtoA = (d['NPC互动'][npcB] && typeof d['NPC互动'][npcB] === 'object') ? (d['NPC互动'][npcB][npcA] || '') : '';
          pairs.push({ key: pairKey, npcA, npcB, relAtoB, relBtoA });
        }
      }
      if (pairs.length) {
        for (const pair of pairs) {
          o += `<div style="padding:6px;border-radius:8px;margin-bottom:4px;background:rgba(${t.primaryRgb},.04)">`;
          o += `<div style="display:flex;align-items:center;justify-content:center;gap:8px;font-size:10px;margin-bottom:4px">`;
          o += `<span>${_getNpcEmoji(pair.npcA)} ${_esc(pair.npcA)}</span>`;
          o += `<span style="color:${t.primary}">⟷</span>`;
          o += `<span>${_getNpcEmoji(pair.npcB)} ${_esc(pair.npcB)}</span>`;
          o += `</div>`;
          if (pair.relAtoB) {
            o += `<div style="font-size:8px;color:${t.textDim};padding:2px 0">${_getNpcEmoji(pair.npcA)} → ${_getNpcEmoji(pair.npcB)}：${_esc(pair.relAtoB)}</div>`;
          }
          if (pair.relBtoA) {
            o += `<div style="font-size:8px;color:${t.textDim};padding:2px 0">${_getNpcEmoji(pair.npcB)} → ${_getNpcEmoji(pair.npcA)}：${_esc(pair.relBtoA)}</div>`;
          }
          o += `</div>`;
        }
      } else {
        o += `<div style="text-align:center;font-size:8px;color:${t.textMuted};font-style:italic;padding:8px">NPC之间还没有建立具体的互动关系</div>`;
      }
      o += `</div>`;
    }

    // AI生成NPC近况按钮
    const hasApi = !!_getAuxApi();
    o += `<div style="margin-top:8px">`;
    o += `<button class="ax-dlg-btn ax-dlg-ok" id="ax-npcrel-gen-daily" style="width:100%;text-align:center;font-size:10px;padding:8px" ${hasApi ? '' : 'disabled'}>✨ 查看NPC之间的近况（AI生成）</button>`;
    o += `</div>`;
    o += `<div id="ax-npcrel-daily-result" style="margin-top:6px"></div>`;

    $c.html(o);

    // AI生成NPC近况
    $c.find('#ax-npcrel-gen-daily').on('click', async function () {
      const $btn = $(this);
      const $result = $('#ax-npcrel-daily-result');
      $btn.prop('disabled', true).text('生成中…');

      try {
        const context = _getContextSummary();

        let playerName = '玩家';
        try { if (typeof getContext === 'function') { const ctx = getContext(); if (ctx.name1) playerName = ctx.name1; } } catch (e) { }

        const npcList = npcNames.map(n => {
          const relS = String(rels[n] || '未知');
          const loc = (d['NPC位置'] && d['NPC位置'][n]) ? d['NPC位置'][n] : '未知';
          const inter = (d['NPC互动'] && d['NPC互动'][n] && typeof d['NPC互动'][n] === 'object') ? JSON.stringify(d['NPC互动'][n]) : (d['NPC互动'] && d['NPC互动'][n]) ? String(d['NPC互动'][n]) : '无';
          //★ 新增：获取NPC性别信息
          const npcP = _getNpcPersonality(n);
          const genderLabel = npcP.voiceGender === 'female' ? '女性' : '男性';
          return `${n}（性别：${genderLabel}，位置：${loc}，与其他NPC的关系：${inter}）`;
        }).join('\n');

        const msgs = [
          {
            role: 'system',
            content: `你是这个游戏世界中的旁白叙述者。请根据以下世界信息和NPC关系，生成这些NPC之间的最近互动动态。

重要规则：
1. 绝对不要使用"玩家"这个词，也不要用"（指玩家）""（指${playerName}）"这样的括号注释
2. 如果要提到${playerName}，直接用"${playerName}"这个名字
3. 重点描写NPC之间的互动，而不是NPC和${playerName}的互动
4. 以第三人称旁白视角描写，像小说片段一样
5. 每条动态50-150字，要有画面感和情感
6. 严格按照每个NPC标注的性别使用正确的人称代词。男性NPC用"他"，女性NPC用"她"，绝对不要搞混
7. NPC之间的情感仅限于友情、战友情、信任、敌意、竞争、师徒等非恋爱关系，严禁出现任何爱情、暧昧、恋爱相关的描写

当前NPC列表：
${npcList}

当前世界信息和最近剧情（特别注意标注了"★最新"的部分）：
${context.slice(0, 5000)}

请生成2-4条NPC之间的互动动态。每条动态描写NPC之间的对话、摩擦、合作或有趣的小故事。用"——"加NPC名字组合作为每条动态的标题。`
          },
          { role: 'user', content: '请生成NPC之间的近况动态' }
        ];

        const reply = await _callApi(msgs, { temperature: 0.95, max_tokens: 2000 });

        $result.html(
          `<div style="padding:10px;background:${t.surfaceHover};border-radius:12px;animation:axUp .3s ease">` +
          `<div style="font-size:9px;color:${t.primary};font-weight:600;margin-bottom:6px;letter-spacing:1px">📰 NPC近况</div>` +
          `<div style="font-size:9px;color:${t.text};line-height:1.7;white-space:pre-wrap">${_esc(reply)}</div>` +
          `</div>`
        );
      } catch (e) {
        $result.html(`<div style="text-align:center;padding:8px;color:${t.fail};font-size:9px">生成失败：${_esc(e.message || '未知')}</div>`);
      }
      $btn.prop('disabled', false).text('✨ 查看NPC之间的近况（AI生成）');
    });
  }

  /* ═══════════════════════════════════════
     💬 聊天对话界面
     ═══════════════════════════════════════ */
  function _drawChatConversation($container) {
    // 辅助函数：生成带头像的消息行
    function msgRow(isUser, bubbleHtml, msgIdx) {
      const avStyle = isUser ? userAvatarStyle : avatarStyle;
      const avContent = isUser ? userAvatarContent : avatarContent;
      const avCls = isUser ? 'user-av' : 'npc-av';
      return `<div class="ax-chat-msg-row ${isUser ? 'user' : 'npc'}">`
        + `<div class="ax-chat-msg-avatar ${avCls}" style="${avStyle}">${avContent}</div>`
        + `<div class="ax-chat-msg-group">${bubbleHtml}</div>`
        + `</div>`;
    }
    const t = _t();
    const name = _chatTarget;
    const chat = _getChatWith(name);
    const playerProfile = _loadPlayerProfile();
    const playerAvatarUrl = playerProfile.avatar || '';
    const userAvatarStyle = playerAvatarUrl ? `background-image:url('${playerAvatarUrl}');background-size:cover;background-position:center` : '';
    const userAvatarContent = playerAvatarUrl ? '' : '👤';
    const avatarUrl = _getNpcAvatar(name);
    const emoji = _getNpcEmoji(name);
    const avatarStyle = avatarUrl ? `background-image:url('${avatarUrl}');background-size:cover;background-position:center` : '';
    const avatarContent = avatarUrl ? '' : emoji;
    const hasApi = !!_getDefaultApi();
    const chatBgUrl = _getChatBg(name);

    let o = '';
    // 头部
    o += '<div class="ax-av-header">';
    o += `<span class="ax-av-back" id="ax-chat-back">‹</span>`;
    o += `<div class="ax-chat-npc-avatar" style="${avatarStyle}">${avatarContent}</div>`;
    const chatRemarkTitle = _getChatRemark(name);
    const chatDisplayTitle = chatRemarkTitle || name;
    const chatMoodData = _getNpcMood(name);
    const chatMoodIcon = _getMoodIcon(chatMoodData.mood);
    const chatMoodDetail = chatMoodData.detail ? ` · ${_esc(chatMoodData.detail)}` : '';
    o += `<div style="flex:1;min-width:0"><div class="ax-av-title">${_esc(chatDisplayTitle)}</div><div style="font-size:9px;color:${t.textMuted};margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${_esc(chatMoodData.mood)}${chatMoodDetail}">${chatMoodIcon} ${_esc(chatMoodData.mood)}${chatMoodDetail}</div></div>`;
    o += '<div class="ax-chat-actions">';
    o += `<button class="ax-chat-action-btn" id="ax-chat-settings-btn">⚙</button>`;
    o += '</div></div>';

    // 消息区（带可选背景）
    const bgStyle = chatBgUrl ? `background-image:url('${chatBgUrl}');` : '';
    o += `<div class="${chatBgUrl ? 'ax-chat-msgs-bg' : 'ax-chat-msgs'}" id="ax-chat-msgs" style="${bgStyle}">`;
    if (!chat.messages.length) {
      o += `<div class="ax-chat-empty">${hasApi ? '发送第一条消息开始对话' : '请先在接口页配置API'}</div>`;
    } else {
      for (let mi = 0; mi < chat.messages.length; mi++) {
        const msg = chat.messages[mi];
        const isUser = msg.role === 'user';
        const content = msg.content || '';
        const tm = msg.time || '';

        // 检查整条消息是否为特殊消息（表情包/转账/礼物）
        const specialHtml = _renderMessageContent(content, isUser);
        if (specialHtml !== null) {
          if (specialHtml === '') continue;
          const specialBg = (content.match(/^\[sticker/) || content.match(/^\[gift/)) ? 'background:transparent;padding:4px' : '';
          const bubble = `<div class="ax-chat-bubble ${isUser ? 'user' : 'npc'} ax-msg-deletable" data-msg-idx="${mi}" style="${specialBg}">${specialHtml}<span class="ax-chat-time">${tm}</span></div>`;
          o += msgRow(isUser, bubble, mi);
          continue;
        }

        // 普通消息：分段显示，每段也检查是否包含特殊内容
        const segments = content.split(/\n+/).map(s => s.trim()).filter(s => {
          if (!s) return false;
          // 过滤掉NPC特殊指令
          if (s.match(/^\[npc-transfer:\d+:[^\]]*\]$/)) return false;
          if (s.match(/^\[npc-gift\]$/)) return false;
          return true;
        });
        if (segments.length <= 1) {
          const segContent = segments[0] || content;
          const segSpecial = _renderMessageContent(segContent, isUser);
          let bubble;
          if (segSpecial !== null && segSpecial !== '') {
            bubble = `<div class="ax-chat-bubble ${isUser ? 'user' : 'npc'} ax-msg-deletable" data-msg-idx="${mi}">${segSpecial}<span class="ax-chat-time">${tm}</span></div>`;
          } else {
            bubble = `<div class="ax-chat-bubble ${isUser ? 'user' : 'npc'} ax-msg-deletable" data-msg-idx="${mi}">${_esc(segContent)}<span class="ax-chat-time">${tm}</span></div>`;
          }
          o += msgRow(isUser, bubble, mi);
        } else {
          let groupBubbles = '';
          for (let si = 0; si < segments.length; si++) {
            const isLast = si === segments.length - 1;
            const seg = segments[si];
            const segSpecial = _renderMessageContent(seg, isUser);
            if (segSpecial !== null && segSpecial !== '') {
              groupBubbles += `<div class="ax-chat-bubble ${isUser ? 'user' : 'npc'} ax-msg-deletable" data-msg-idx="${mi}" data-seg="${si}">${segSpecial}${isLast ? '<span class="ax-chat-time">' + tm + '</span>' : ''}</div>`;
            } else {
              groupBubbles += `<div class="ax-chat-bubble ${isUser ? 'user' : 'npc'} ax-msg-deletable" data-msg-idx="${mi}" data-seg="${si}">${_esc(seg)}${isLast ? '<span class="ax-chat-time">' + tm + '</span>' : ''}</div>`;
            }
          }
          o += msgRow(isUser, groupBubbles, mi);
        }
      }
    }
    o += '</div>';

    // 隐藏的选删按钮（被设置弹窗触发）
    o += `<button style="display:none" id="ax-chat-select-del"></button>`;

    // 输入栏
    o += '<div class="ax-chat-input-bar">';
    o += `<button class="ax-chat-sticker-btn" id="ax-chat-sticker" title="表情包">😊</button>`;

    // 收纳的扩展功能按钮
    o += `<div style="position:relative">`;
    o += `<div id="ax-chat-ext-menu" style="position:absolute;bottom:calc(100% + 8px);left:-8px;background:${t.bgCard};border:1px solid ${t.border};border-radius:16px;padding:12px;box-shadow:0 8px 24px rgba(0,0,0,.4);display:none;z-index:10;width:200px">`;
    o += `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">`;
    const chatExtItems = [
      { id: 'ax-chat-redpacket', icon: '🧧', label: '红包' },
      { id: 'ax-chat-transfer', icon: '💰', label: '转账' },
      { id: 'ax-chat-gift', icon: '🎁', label: '礼物' },
      { id: 'ax-chat-music', icon: '🎵', label: '歌曲' },
      { id: 'ax-chat-link', icon: '🔗', label: '链接' }
    ];
    for (const ei of chatExtItems) {
      o += `<div id="${ei.id}" style="display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:6px 2px;border-radius:10px;transition:background .15s" class="ax-ext-grid-item">`;
      o += `<div style="width:40px;height:40px;border-radius:12px;background:${t.surfaceHover};display:flex;align-items:center;justify-content:center;font-size:20px;transition:transform .15s">${ei.icon}</div>`;
      o += `<span style="font-size:8px;color:${t.textDim}">${ei.label}</span>`;
      o += `</div>`;
    }
    o += `</div></div>`;
    o += `<button class="ax-chat-sticker-btn" id="ax-chat-ext-toggle" title="更多功能" style="transition:transform .2s ease">+</button>`;
    o += `</div>`;

    o += `<textarea class="ax-chat-input" id="ax-chat-input" placeholder="${hasApi ? '输入消息…' : '请先配置API接口'}" rows="1" ${hasApi ? '' : 'disabled'}></textarea>`;
    o += `<button class="ax-chat-send" id="ax-chat-send" ${hasApi ? '' : 'disabled'} title="让对方回复">↑</button>`;
    o += '</div>';

    $container.html(o);

    // 滚动到底部
    const $msgs = $('#ax-chat-msgs');
    if ($msgs.length) $msgs.scrollTop($msgs[0].scrollHeight);

    // 语音消息点击播放
    $msgs.off('click.axvoice').on('click.axvoice', '.ax-voice-msg', function (e) {
      e.stopPropagation();
      var voiceText = $(this).data('voice-text');
      var voiceId = $(this).data('voice-id');
      if (!voiceText) return;
      var $icon = $('#ax-vpi-' + voiceId);
      if (_broadcastSpeaking) {
        _stopSpeaking();
        $icon.text('▶️');
        return;
      }
      $icon.text('⏸');
      var npcP = _getNpcPersonality(_chatTarget);
      var vg = npcP.voiceGender || 'male';
      _speak(voiceText, function () { $icon.text('▶️'); }, vg, _chatTarget);
    });

    // 返回按钮
    $('#ax-chat-back').on('click', () => { _chatTarget = null; _render(); });

    // 自动调整输入框高度
    const $input = $('#ax-chat-input');
    $input.on('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 80) + 'px';
    });

    // 发送消息
    // 回车 = 仅发送消息（不触发回复）
    $input.on('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); _doSendOnly(); }
    });
    // 点击发送按钮 = 触发NPC回复
    $('#ax-chat-send').on('click', () => _doRequestReply());

    // 表情包面板
    $('#ax-chat-sticker').on('click', () => _showStickerPanel());

    // 转账按钮
    $('#ax-chat-transfer').on('click', () => _showTransferDialog(name));

    // 私聊红包
    $('#ax-chat-redpacket').on('click', () => {
      const t2 = _t();
      const coins = _getPlayerCoins();
      const w = _dialog(
        '<div class="ax-dlg-h">🧧 发红包</div>' +
        `<div class="ax-dlg-sub">发给${_esc(name)}余额：${coins}💰</div>` +
        '<div class="ax-api-form">' +
        '<label>金额</label><input id="ax-prp-amount" type="number" min="1" max="9999" placeholder="输入金额">' +
        '<label>附言</label><input id="ax-prp-note" type="text" placeholder="恭喜发财" maxlength="20" value="恭喜发财">' +
        '</div>' +
        '<div class="ax-dlg-err" id="ax-prp-err"></div>' +
        '<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-prp-no">取消</button>' +
        '<button class="ax-dlg-btn ax-dlg-ok" id="ax-prp-yes" style="background:rgba(200,48,48,.15);border-color:rgba(200,48,48,.3);color:#c83030">🧧 塞红包</button></div>'
      );
      w.find('#ax-prp-no').on('click', () => w.remove());
      w.find('#ax-prp-yes').on('click', async () => {
        const amount = parseInt($('#ax-prp-amount').val());
        const note = $('#ax-prp-note').val().trim() || '恭喜发财';
        if (!amount || amount <= 0) { $('#ax-prp-err').text('请输入金额'); return; }
        if (amount > coins) { $('#ax-prp-err').text('余额不足'); return; }
        await _setPlayerCoins(coins - amount);
        // 存储红包数据到聊天中（用特殊格式）
        const rpId = 'prp_' + Date.now();
        const rpMsg = `[dm-redpacket:${rpId}:${amount}:${_esc(note)}:unopened]`;
        _addMessage(name, 'user', rpMsg);
        w.remove();
        _render();
        if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success 红包已发送！`);
      });
    });

    // 礼物按钮
    $('#ax-chat-gift').on('click', () => _showGiftPanel(name));

    // 分享歌曲按钮
    $('#ax-chat-music').on('click', () => _showMusicShareDialog(name));

    // 分享链接按钮
    $('#ax-chat-link').on('click', () => _showLinkShareDialog(name));

    // 更多功能按钮
    $('#ax-chat-ext-toggle').on('click', function (e) {
      e.stopPropagation();
      const $menu = $('#ax-chat-ext-menu');
      const $btn = $(this);
      const isVisible = $menu.is(':visible');
      if (isVisible) {
        $menu.fadeOut(150);
        $btn.css('transform', 'rotate(0deg)');
      } else {
        $menu.fadeIn(150);
        $btn.css('transform', 'rotate(45deg)');
      }
    });
    // 点击其他地方关闭菜单
    $(document).off('click.axExtMenu').on('click.axExtMenu', function (e) {
      if (!$('#ax-chat-ext-toggle').is(e.target) && $('#ax-chat-ext-menu').has(e.target).length === 0) {
        $('#ax-chat-ext-menu').fadeOut(150);
        $('#ax-chat-ext-toggle').css('transform', 'rotate(0deg)');
      }
    });

    // 统一设置按钮
    $('#ax-chat-settings-btn').on('click', () => {
      _showChatSettingsDialog(name, $container);
    });

    // 选择删除模式
    let _selectDeleteMode = false;
    let _selectedMsgIdxs = new Set();

    $('#ax-chat-select-del').on('click', function () {
      _selectDeleteMode = !_selectDeleteMode;
      const $btn = $(this);
      if (_selectDeleteMode) {
        $btn.text('完成').css({ color: t.accent, borderColor: 'rgba(' + t.accentRgb + ',.4)' });
        // 给每条消息添加选择框
        const seenIdx = new Set();
        $('.ax-msg-deletable').each(function () {
          const idx = $(this).data('msg-idx');
          if (idx === undefined) return;
          // 只给每条消息的第一个分段添加选择框
          if (seenIdx.has(idx)) return;
          seenIdx.add(idx);
          if (!$(this).find('.ax-msg-check').length) {
            $(this).prepend(`<span class="ax-msg-check" data-cidx="${idx}" style="display:inline-block;width:16px;height:16px;border:1.5px solid ${t.border};border-radius:4px;margin-right:6px;cursor:pointer;vertical-align:middle;text-align:center;font-size:10px;line-height:16px;flex-shrink:0;transition:all .15s"></span>`);
          }
        });
        // 显示删除已选按钮
        if (!$('#ax-chat-del-selected').length) {
          $('#ax-chat-select-del').after(`<button class="ax-chat-action-btn danger" id="ax-chat-del-selected" style="display:inline">删除(0)</button>`);
          $('#ax-chat-del-selected').on('click', function () {
            if (!_selectedMsgIdxs.size) {
              if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 请先选择要删除的消息');
              return;
            }
            const count = _selectedMsgIdxs.size;
            const w2 = _dialog(`<div class="ax-dlg-h">⚠ 删除消息</div><div class="ax-dlg-sub">确定删除选中的 ${count} 条消息？</div><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-md-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-md-yes" style="color:${t.fail}">删除</button></div>`);
            $('#ax-md-no').on('click', () => w2.remove());
            $('#ax-md-yes').on('click', () => {
              const chatObj = _getChatWith(name);
              const idxArr = Array.from(_selectedMsgIdxs).sort((a, b) => b - a);
              for (const idx of idxArr) {
                if (idx >= 0 && idx < chatObj.messages.length) {
                  chatObj.messages.splice(idx, 1);
                }
              }
              _saveChatWith(name, chatObj);
              _syncChatToWB();
              w2.remove();
              _selectedMsgIdxs.clear();
              _selectDeleteMode = false;
              _render();
              if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success 已删除 ${count} 条消息`);
            });
          });
        }
      } else {
        $btn.text('选删').css({ color: '', borderColor: '' });
        $('.ax-msg-check').remove();
        $('#ax-chat-del-selected').remove();
        _selectedMsgIdxs.clear();
      }
    });

    // 点击消息上的选择框（事件委托到面板容器）
    $('#ax-chat-app-view').off('click.axmsgcheck').on('click.axmsgcheck', '.ax-msg-check', function (e) {
      e.stopPropagation();
      const idx = parseInt($(this).data('cidx'));
      if (_selectedMsgIdxs.has(idx)) {
        _selectedMsgIdxs.delete(idx);
        $(this).css({ background: 'transparent', borderColor: t.border }).text('');
      } else {
        _selectedMsgIdxs.add(idx);
        $(this).css({ background: t.primary, borderColor: t.primary, color: '#fff' }).text('✓');
      }
      $('#ax-chat-del-selected').text(`删除(${_selectedMsgIdxs.size})`);
    });

    // 长按/右键单条删除
    $('#ax-chat-msgs').on('contextmenu', '.ax-msg-deletable', function (e) {
      e.preventDefault();
      const idx = parseInt($(this).data('msg-idx'));
      if (isNaN(idx)) return;
      const chatObj = _getChatWith(name);
      const msgContent = chatObj.messages[idx] ? chatObj.messages[idx].content : '';
      const preview = msgContent.slice(0, 40) + (msgContent.length > 40 ? '…' : '');
      const w2 = _dialog(`<div class="ax-dlg-h">删除这条消息？</div><div class="ax-dlg-sub" style="word-break:break-all">${_esc(preview)}</div><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-sd-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-sd-yes" style="color:${t.fail}">删除</button></div>`);
      $('#ax-sd-no').on('click', () => w2.remove());
      $('#ax-sd-yes').on('click', () => {
        chatObj.messages.splice(idx, 1);
        _saveChatWith(name, chatObj);
        _syncChatToWB();
        w2.remove();
        _render();
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 消息已删除');
      });
    });
    // 音乐分享消息点击播放
    $('#ax-chat-msgs').on('click', '.ax-music-share', function (e) {
      e.stopPropagation();
      const keyword = $(this).data('keyword');
      const songName = $(this).data('song');
      if (!keyword) return;

      const t = _t();
      // 更新UI显示正在加载
      $(this).find('div:last').html('<span>🎧</span> 加载中…');

      // 调用电台的播放功能
      (async () => {
        const result = await _searchAndPlayMusic(keyword);
        if (result.success) {
          const data = result.data;
          const song = {
            name: data.Name || songName,
            artist: data.Singer || '',
            keyword: keyword,
            url: data.Url,
            lyric: data.Lyric || ''
          };
          _radioCurrentSong = song;
          _radioLyrics = _parseLrc(data.Lyric || '');
          _addRadioHistory(song);
          _setPlaylist([song], 0);

          const audio = _getRadioAudio();
          audio.src = data.Url;
          audio.volume = _radioVolume / 100;

          try { await audio.play(); _radioPlaying = true; } catch (err) { }
          // 更新电台播放器（如果电台界面打开的话）
          const $player = $('#ax-radio-player');
          if ($player.length) _updateRadioPlayer($player);
          _startLyricUpdater();
          _updateChrome();

          $(this).find('div:last').html(`<span>🎧</span> 正在播放`);
          if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success 正在播放：${songName}`);
        } else {
          $(this).find('div:last').html(`<span>❌</span> 播放失败`);
          if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=error 播放失败：${result.error}`);
          // 3秒后恢复
          setTimeout(() => {
            $(this).find('div:last').html('<span>🎧</span> 点击重试');
          }, 3000);
        }
      })();
    });
    // 链接分享消息点击交互
    $('#ax-chat-msgs').on('click', '.ax-link-share', function (e) {
      e.stopPropagation();
      const $card = $(this);
      const linkTitle = $card.data('link-title');
      const linkSource = $card.data('link-source');
      const linkDesc = $card.data('link-desc');
      const linkType = $card.data('link-type');
      const isUserLink = $card.data('is-user') === true || $card.data('is-user') === 'true';

      if (isUserLink) {
        // 用户发的链接：触发NPC查看并反馈
        _npcViewLink(name, linkTitle, linkSource, linkDesc, linkType);
      } else {
        // NPC发的链接：显示详情预览弹窗
        _showLinkPreview(name, linkTitle, linkSource, linkDesc, linkType);
      }
    });

 // 私聊红包拆开
    $('#ax-chat-msgs').on('click', '.ax-dm-rp-open', function (e) {
      e.stopPropagation();
      const rpId = $(this).data('rp-id');
      const amount = parseInt($(this).data('amount'));
      const note = $(this).data('note');
      // 更新消息内容为已拆开
      const chatObj = _getChatWith(name);
      for (let i = 0; i < chatObj.messages.length; i++) {
        if (chatObj.messages[i].content.includes(rpId) && chatObj.messages[i].content.includes('unopened')) {
          chatObj.messages[i].content = chatObj.messages[i].content.replace(':unopened]', ':opened]');
          break;
        }
      }
      _saveChatWith(name, chatObj);
      // 加钱（如果是NPC发的红包，玩家拆开加钱；如果是自己发的，NPC"收到"了不加钱）
      const isUserSent = chatObj.messages.find(m => m.content.includes(rpId) && m.role === 'user');
      if (!isUserSent) {
        const coins = _getPlayerCoins();
        _setPlayerCoins(coins + amount);
        if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success 拆开红包，收到 ${amount} 💰！`);
      } else {
        if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=info ${name} 收到了你的红包！`);
      }
      _render();
    });
  }

  // 单聊设置弹窗（统一入口）
  function _showChatSettingsDialog(npcName, $parentContainer) {
    const t = _t();
    const chatBgUrl = _getChatBg(npcName);
    const avatarUrl = _getNpcAvatar(npcName);
    const emoji = _getNpcEmoji(npcName);
    const chatRemark = _getChatRemark(npcName);

    let o = '';
    //顶部角色信息卡片
    const avStyle = avatarUrl ? `background-image:url('${avatarUrl}');background-size:cover;background-position:center` : '';
    const avContent = avatarUrl ? '' : emoji;
    o += `<div style="display:flex;align-items:center;gap:12px;padding:12px;background:linear-gradient(135deg,${t.bgCard},${t.bgSection});border-radius:14px;margin-bottom:10px">`;
    o += `<div id="ax-cs-avatar-click" style="width:48px;height:48px;border-radius:50%;background:${t.iconBg};display:flex;align-items:center;justify-content:center;font-size:24px;overflow:hidden;flex-shrink:0;cursor:pointer;border:2px solid rgba(${t.accentRgb},.2);transition:all .2s;${avStyle}">${avContent}</div>`;
    o += `<div style="flex:1;min-width:0">`;
    o += `<div style="font-size:13px;font-weight:700;color:${t.text}">${_esc(npcName)}</div>`;
    o += `<div id="ax-cs-remark-click" style="font-size:9px;color:${t.textMuted};margin-top:2px;cursor:pointer">${chatRemark ? '备注：' + _esc(chatRemark) + '✎' : '点击设置备注 ✎'}</div>`;
    o += `</div></div>`;

    // 功能列表（卡片式）
    const items = [
      { id: 'avatar', icon: '🖼️', label: '更换头像', sub: avatarUrl ? '已自定义' : '默认emoji', extra: avatarUrl ? 'clear' : '' },
      { id: 'bg', icon: '🎨', label: '聊天背景', sub: chatBgUrl ? '已自定义' : '默认', extra: chatBgUrl ? 'clear' : '' },
      { id: 'voice', icon: '🎙️', label: '语音音色', sub: '调整语速和音调' },
      { id: 'seldel', icon: '✂️', label: '批量删除消息', sub: '选择并删除聊天记录' },
      { id: 'block', icon: '🚫', label: '拉黑对方', sub: '拉黑后无法发消息', danger: true },
    ];

    for (const it of items) {
      const dangerStyle = it.danger ? `color:${t.fail}` : `color:${t.text}`;
      o += `<div class="ax-cs-item" data-action="${it.id}" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;margin-bottom:4px;cursor:pointer;transition:background .15s;background:${t.surfaceHover}">`;
      o += `<span style="font-size:18px;width:28px;text-align:center">${it.icon}</span>`;
      o += `<div style="flex:1"><div style="font-size:10px;font-weight:500;${dangerStyle}">${it.label}</div><div style="font-size:8px;color:${t.textMuted}">${it.sub}</div></div>`;
      if (it.extra === 'clear') {
        o += `<button class="ax-api-btn danger ax-cs-clear" data-clear="${it.id}" style="font-size:7px;padding:2px 6px">清除</button>`;
      }
      o += `<span style="font-size:10px;color:${t.textMuted}">›</span>`;
      o += `</div>`;
    }

    o += `<div class="ax-dlg-actions" style="margin-top:6px"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-cs-close">关闭</button></div>`;

    const w = _dialog(o);

    // 点击头像更换
    w.find('#ax-cs-avatar-click').on('click', () => {
      _pickNpcAvatar(npcName, () => { w.remove(); _render(); });
    });

    // 点击设置备注
    w.find('#ax-cs-remark-click').on('click', () => {
      const cur = _getChatRemark(npcName);
      const w2 = _dialog(`<div class="ax-dlg-h">✎ 设置备注</div><input class="ax-dlg-input" id="ax-cr-v" type="text" value="${_esc(cur)}" placeholder="留空则使用原名" maxlength="15"><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-cr-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-cr-yes">确认</button></div>`);
      w2.find('#ax-cr-no').on('click', () => w2.remove());
      w2.find('#ax-cr-yes').on('click', () => {
        _setChatRemark(npcName, $('#ax-cr-v').val().trim());
        w2.remove(); w.remove(); _render();
      });
    });

    // 功能项点击
    w.find('.ax-cs-item').on('click', function (e) {
      if ($(e.target).hasClass('ax-cs-clear')) return;
      const action = $(this).data('action');
      if (action === 'avatar') { _pickNpcAvatar(npcName, () => { w.remove(); _render(); }); }
      else if (action === 'bg') { _pickChatBg(npcName, () => { w.remove(); _render(); }); }
      else if (action === 'voice') { w.remove(); _drawNpcVoiceSettingsDialog(npcName); }
      else if (action === 'seldel') { w.remove(); $('#ax-chat-select-del').trigger('click'); }
      else if (action === 'block') { w.remove(); _showBlockDialog(npcName); }
    });

    // 清除按钮
    w.find('.ax-cs-clear').on('click', function (e) {
      e.stopPropagation();
      const target = $(this).data('clear');
      if (target === 'avatar') { _clearNpcAvatar(npcName); w.remove(); _render(); }
      else if (target === 'bg') { _clearChatBg(npcName); w.remove(); _render(); }
    });

    w.find('#ax-cs-close').on('click', () => w.remove());
  }

  /* ═══════════════════════════════════════
 表情包面板与发送
 ═══════════════════════════════════════ */
  function _showStickerPanel() {
    const t = _t();
    const stickers = _loadStickers();
    const customTags = _loadCustomTags();

    let o = '<div class="ax-dlg-h">😊 表情包</div>';

    // 管理入口
    o += '<div style="display:flex;gap:4px;margin-bottom:8px">';
    o += '<button class="ax-dlg-btn ax-dlg-ok" id="ax-stk-add" style="flex:1;text-align:center">＋ 添加表情</button>';
    o += '<button class="ax-dlg-btn ax-dlg-cancel" id="ax-stk-manage" style="flex:1;text-align:center">管理表情</button>';
    o += '<button class="ax-dlg-btn ax-dlg-cancel" id="ax-stk-tags" style="flex:1;text-align:center">管理标签</button>';
    o += '</div>';

    if (!stickers.length) {
      o += '<div style="text-align:center;padding:20px;color:' + t.textMuted + ';font-size:10px;font-style:italic">还没有表情包<br>请先添加标签，再添加表情包</div>';
    } else {
      // 按自定义tag分组显示
      const groups = {};
      for (const s of stickers) {
        const tagKey = s.tag || '_unknown';
        if (!groups[tagKey]) groups[tagKey] = [];
        groups[tagKey].push(s);
      }
      for (const ct of customTags) {
        if (!groups[ct.id] || !groups[ct.id].length) continue;
        o += `<div style="font-size:8px;color:${t.textMuted};margin:6px 0 3px;letter-spacing:1px">${ct.emoji} ${ct.name}</div>`;
        o += '<div style="display:flex;flex-wrap:wrap;gap:6px">';
        for (const s of groups[ct.id]) {
          o += `<div class="ax-stk-item" data-stk-id="${s.id}" title="${_esc(s.name)}" style="width:50px;height:50px;border-radius:8px;cursor:pointer;overflow:hidden;border:1px solid ${t.border};transition:all .2s;background-size:contain;background-repeat:no-repeat;background-position:center;background-image:url('${s.dataUrl}')"></div>`;
        }
        o += '</div>';
      }
      // 显示没有匹配到标签的表情包（可能标签被删了）
      const knownTagIds = customTags.map(ct => ct.id);
      const orphanKeys = Object.keys(groups).filter(k => !knownTagIds.includes(k));
      for (const ok of orphanKeys) {
        if (!groups[ok].length) continue;
        o += `<div style="font-size:8px;color:${t.textMuted};margin:6px 0 3px;letter-spacing:1px">🏷️ 未分类</div>`;
        o += '<div style="display:flex;flex-wrap:wrap;gap:6px">';
        for (const s of groups[ok]) {
          o += `<div class="ax-stk-item" data-stk-id="${s.id}" title="${_esc(s.name)}" style="width:50px;height:50px;border-radius:8px;cursor:pointer;overflow:hidden;border:1px solid ${t.border};transition:all .2s;background-size:contain;background-repeat:no-repeat;background-position:center;background-image:url('${s.dataUrl}')"></div>`;
        }
        o += '</div>';
      }
    }

    const w = _dialog(o);

    // 点击表情包 → 发送
    w.find('.ax-stk-item').on('click', function () {
      const id = $(this).data('stk-id');
      const sticker = _getStickerById(id);
      if (sticker) {
        _sendSticker(sticker);
        w.remove();
      }
    });

    w.find('#ax-stk-add').on('click', () => { w.remove(); _addStickerDialog(); });
    w.find('#ax-stk-manage').on('click', () => { w.remove(); _manageStickerDialog(); });
    w.find('#ax-stk-tags').on('click', () => { w.remove(); _manageTagsDialog(); });
  }

  function _addStickerDialog() {
    const t = _t();
    const customTags = _loadCustomTags();
    let tagOptions = '';
    if (!customTags.length) {
      tagOptions = '<option value="_none">（请先在管理中添加标签）</option>';
    } else {
      for (const tag of customTags) {
        tagOptions += `<option value="${tag.id}">${tag.emoji} ${tag.name}</option>`;
      }
    }
    let _pendingUrl = '';

    const w = _dialog(
      '<div class="ax-dlg-h">＋ 添加表情包</div>' +
      '<div style="text-align:center;margin:8px 0">' +
      '<div id="ax-stk-preview" style="width:80px;height:80px;margin:0 auto;border-radius:10px;border:2px dashed ' + t.border + ';display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:24px;color:' + t.textMuted + ';background-size:contain;background-repeat:no-repeat;background-position:center;transition:all .2s">📷</div>' +
      '<div style="font-size:8px;color:' + t.textMuted + ';margin-top:4px">点击选择图片</div>' +
      '</div>' +
      '<div class="ax-api-form">' +
      '<label>表情包名称</label><input id="ax-stk-name" type="text" placeholder="如：开心跳舞" maxlength="20">' +
      '<label>用途/情绪标签</label><select class="ax-model-select" id="ax-stk-tag">' + tagOptions + '</select>' +
      '</div>' +
      '<div class="ax-dlg-err" id="ax-stk-err"></div>' +
      '<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-stk-cancel">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-stk-save">保存</button></div>'
    );

    // 点击预览区选图
    w.find('#ax-stk-preview').on('click', () => {
      _pickAndAddSticker((dataUrl) => {
        _pendingUrl = dataUrl;
        $('#ax-stk-preview').css({ 'background-image': `url('${dataUrl}')`, 'font-size': '0', 'border-style': 'solid', 'border-color': _t().accent });
      });
    });

    w.find('#ax-stk-cancel').on('click', () => { w.remove(); _showStickerPanel(); });
    w.find('#ax-stk-save').on('click', () => {
      const name = $('#ax-stk-name').val().trim() || '未命名';
      const tag = $('#ax-stk-tag').val();
      if (!_pendingUrl) { $('#ax-stk-err').text('请先选择图片'); return; }
      _addSticker(name, tag, _pendingUrl);
      w.remove();
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 表情包已添加');
      _showStickerPanel();
    });
  }

  function _manageStickerDialog() {
    const t = _t();
    const stickers = _loadStickers();
    let o = '<div class="ax-dlg-h">管理表情包</div>';
    if (!stickers.length) {
      o += '<div style="text-align:center;padding:16px;color:' + t.textMuted + ';font-size:10px">暂无表情包</div>';
    } else {
      o += '<div style="max-height:250px;overflow-y:auto">';
      for (const s of stickers) {
        o += `<div style="display:flex;align-items:center;gap:8px;padding:6px;border-radius:8px;margin-bottom:3px" class="ax-stk-manage-row">`;
        o += `<div style="width:36px;height:36px;border-radius:6px;flex-shrink:0;background-size:contain;background-repeat:no-repeat;background-position:center;background-image:url('${s.dataUrl}');border:1px solid ${t.border}"></div>`;
        o += `<div style="flex:1;min-width:0"><div style="font-size:10px;color:${t.text}">${_esc(s.name)}</div><div style="font-size:8px;color:${t.textMuted}">${_getTagLabel(s.tag)}</div></div>`;
        o += `<button class="ax-api-btn danger ax-stk-del" data-del-id="${s.id}" style="flex-shrink:0">删除</button>`;
        o += '</div>';
      }
      o += '</div>';
    }
    o += '<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-stk-mg-back">返回</button></div>';

    const w = _dialog(o);
    w.find('.ax-stk-del').on('click', function () {
      const id = $(this).data('del-id');
      _removeSticker(id);
      w.remove();
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 表情包已删除');
      _manageStickerDialog();
    });
    w.find('#ax-stk-mg-back').on('click', () => { w.remove(); _showStickerPanel(); });
  }

  function _showLinkShareDialog(npcName) {
    const t = _t();

    let o = '<div class="ax-dlg-h">🔗 分享链接</div>';
    o += `<div class="ax-dlg-sub">发送一个链接给 ${_esc(npcName)}，对方会点进去看</div>`;

    o += '<div class="ax-api-form">';
    o += '<label>链接标题</label>';
    o += '<input id="ax-ls-title" type="text" placeholder="如：深渊生存指南第三期" maxlength="40">';
    o += '<label>来源平台</label>';
    o += '<input id="ax-ls-source" type="text" placeholder="如：暗网论坛、幽灵视频站" maxlength="20" value="暗网论坛">';
    o += '<label>链接描述（可选）</label>';
    o += '<input id="ax-ls-desc" type="text" placeholder="简短描述内容…" maxlength="60">';
    o += '<label>类型</label>';
    o += '<select class="ax-model-select" id="ax-ls-type">';
    o += '<option value="article">📄 文章</option>';
    o += '<option value="video">🎬 视频</option>';
    o += '<option value="forum">💬 论坛帖子</option>';
    o += '<option value="news">📰 新闻</option>';
    o += '<option value="other">🔗 其他</option>';
    o += '</select>';
    o += '</div>';

    // AI一键生成按钮
    o += `<div style="margin-top:6px"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-ls-ai" style="width:100%;text-align:center">✨ AI随机生成一个有趣的链接</button></div>`;

    o += '<div class="ax-dlg-err" id="ax-ls-err"></div>';
    o += '<div class="ax-dlg-actions">';
    o += '<button class="ax-dlg-btn ax-dlg-cancel" id="ax-ls-close">取消</button>';
    o += '<button class="ax-dlg-btn ax-dlg-ok" id="ax-ls-send">发送</button>';
    o += '</div>';

    const w = _dialog(o);

    // 发送链接
    w.find('#ax-ls-send').on('click', () => {
      const title = $('#ax-ls-title').val().trim();
      const source = $('#ax-ls-source').val().trim() || '未知来源';
      const desc = $('#ax-ls-desc').val().trim();
      const type = $('#ax-ls-type').val();

      if (!title) { $('#ax-ls-err').text('请输入链接标题'); return; }

      const safeTitle = title.replace(/[\[\]:]/g, '').trim();
      const safeSource = source.replace(/[\[\]:]/g, '').trim();
      const safeDesc = desc.replace(/[\[\]:]/g, '').trim();

      const msg = `[link:${safeTitle}:${safeSource}:${safeDesc}:${type}]`;
      _addMessage(npcName, 'user', msg);

      w.remove();
      _render();
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 链接已发送');
    });

    // AI随机生成链接
    w.find('#ax-ls-ai').on('click', async function () {
      const $btn = $(this);
      const api = _getAuxApi();
      if (!api) {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 请先配置API接口');
        return;
      }
      $btn.prop('disabled', true).text('生成中…');

      try {
        const context = _getContextSummary();
        const msgs = [
          {
            role: 'system',
            content: `你是一个游戏世界中的链接生成器。请随机生成一个有趣的、来自游戏世界内网站/论坛/视频平台的虚构链接。

当前世界信息：
${context.slice(0, 2000)}

要求：
1. 链接要符合游戏世界观（深渊炼狱/恐怖生存主题）
2. 内容要有趣，可以是攻略、搞笑帖子、恐怖新闻、猎奇视频、都市传说等
3. 来源平台要是游戏世界内的虚构网站名
4. 只输出JSON，格式：{"title":"标题","source":"来源平台","desc":"简短描述","type":"article或video或forum或news或other"}
5. 示例：{"title":"猎人公会新规：禁止在副本中点外卖","source":"暗网日报","desc":"自从某位猎人在S级副本中召唤亡灵送外卖后，公会终于忍不了了","type":"news"}`
          },
          { role: 'user', content: '生成一个随机链接' }
        ];

        const reply = await _callApi(msgs, { temperature: 0.95, max_tokens: 2000 });
        let data;
        try {
          data = _safeParseJsonObject(reply);
        } catch (e) {
          throw new Error('无法解析生成结果');
        }

        if (data && data.title) {
          $('#ax-ls-title').val(String(data.title).slice(0, 40));
          $('#ax-ls-source').val(String(data.source || '暗网论坛').slice(0, 20));
          $('#ax-ls-desc').val(String(data.desc || '').slice(0, 60));
          const validTypes = ['article', 'video', 'forum', 'news', 'other'];
          if (validTypes.includes(data.type)) $('#ax-ls-type').val(data.type);
          if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 链接已生成，可以修改后发送');
        } else {
          throw new Error('生成数据不完整');
        }
      } catch (e) {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=error 生成失败：' + (e.message || '未知'));
      }
      $btn.prop('disabled', false).text('✨ AI随机生成一个有趣的链接');
    });

    w.find('#ax-ls-close').on('click', () => w.remove());
  }

  // ── 标签管理弹窗 ──
  function _manageTagsDialog() {
    const t = _t();
    const tags = _loadCustomTags();
    let o = '<div class="ax-dlg-h">🏷️ 管理标签</div>';
    o += '<div class="ax-dlg-sub">标签用于分类你的表情包。NPC回复中也会使用标签名来发送表情。</div>';

    // 添加新标签的快捷区
    o += '<div style="display:flex;gap:4px;margin-bottom:8px;align-items:stretch">';
    o += `<input id="ax-tag-emoji" type="text" placeholder="emoji" maxlength="4" style="width:50px;padding:6px;border:1px solid ${t.border};border-radius:8px;background:${t.bgAlt};color:${t.text};font-size:14px;text-align:center;font-family:inherit;outline:none;box-sizing:border-box">`;
    o += `<input id="ax-tag-name" type="text" placeholder="标签名（如：开心）" maxlength="10" style="flex:1;padding:6px 10px;border:1px solid ${t.border};border-radius:8px;background:${t.bgAlt};color:${t.text};font-size:10px;font-family:inherit;outline:none;box-sizing:border-box">`;
    o += `<button class="ax-dlg-btn ax-dlg-ok" id="ax-tag-add" style="flex-shrink:0">添加</button>`;
    o += '</div>';

    if (!tags.length) {
      o += '<div style="text-align:center;padding:16px;color:' + t.textMuted + ';font-size:10px;font-style:italic">暂无标签<br>请在上方添加</div>';
    } else {
      o += '<div style="max-height:200px;overflow-y:auto">';
      for (const tag of tags) {
        const stickerCount = _getStickersByTag(tag.id).length;
        o += `<div style="display:flex;align-items:center;gap:8px;padding:6px;border-radius:8px;margin-bottom:3px">`;
        o += `<span style="font-size:18px;width:28px;text-align:center">${tag.emoji}</span>`;
        o += `<div style="flex:1;min-width:0"><div style="font-size:10px;color:${t.text}">${_esc(tag.name)}</div><div style="font-size:8px;color:${t.textMuted}">ID: ${tag.id} · ${stickerCount}张表情</div></div>`;
        o += `<button class="ax-api-btn danger ax-tag-del" data-del-id="${tag.id}" style="flex-shrink:0">删除</button>`;
        o += '</div>';
      }
      o += '</div>';
    }

    o += '<div class="ax-dlg-err" id="ax-tag-err"></div>';
    o += '<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-tag-back">返回</button></div>';

    // 提示
    o += `<div style="margin-top:8px;font-size:8px;color:${t.textMuted};line-height:1.5">`;
    o += '💡 在系统提示词中告诉AI可用的标签名列表，AI就会用 [sticker-tag:标签名] 来发送表情。';
    o += '</div>';

    const w = _dialog(o);

    // 添加标签
    w.find('#ax-tag-add').on('click', () => {
      const emoji = $('#ax-tag-emoji').val().trim() || '🏷️';
      const name = $('#ax-tag-name').val().trim();
      if (!name) { $('#ax-tag-err').text('请输入标签名'); return; }
      if (name.length > 10) { $('#ax-tag-err').text('标签名不超过10字'); return; }
      // 检查重名
      const existing = _loadCustomTags();
      if (existing.find(t => t.name === name)) { $('#ax-tag-err').text('标签名已存在'); return; }
      _addCustomTag(name, emoji);
      w.remove();
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 标签已添加：' + emoji + ' ' + name);
      _manageTagsDialog();
    });

    // 删除标签
    w.find('.ax-tag-del').on('click', function () {
      const id = $(this).data('del-id');
      _removeCustomTag(id);
      w.remove();
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 标签已删除');
      _manageTagsDialog();
    });

    w.find('#ax-tag-back').on('click', () => { w.remove(); _showStickerPanel(); });
  }

  /* ═══════════════════════════════════════
     💰 转账功能
     ═══════════════════════════════════════ */
  function _getPlayerCoins() {
    try {
      const d = _load();
      if (d && d['玩家'] && d['玩家']['魂币'] !== undefined) return parseInt(d['玩家']['魂币']) || 0;
    } catch (e) { }
    return 0;
  }

  async function _setPlayerCoins(newAmount) {
    const d = _load();
    if (!d || !d['玩家']) return false;
    d['玩家']['魂币'] = newAmount;
    return await _save(d);
  }

  function _showTransferDialog(npcName) {
    const t = _t();
    const currentCoins = _getPlayerCoins();

    const w = _dialog(
      '<div class="ax-dlg-h">💰 转账</div>' +
      `<div class="ax-dlg-sub">与 ${_esc(npcName)} 进行魂币转账</div>` +
      `<div style="text-align:center;padding:10px 0">` +
      `<div style="font-size:8px;color:${t.textMuted};letter-spacing:1px">我的魂币余额</div>` +
      `<div style="font-size:24px;font-weight:700;color:${t.accent};font-family:'Courier New',monospace;margin:4px 0">${currentCoins}</div>` +
      '</div>' +
      // 转账方向（仅支持转给对方）
      '<div style="display:flex;gap:4px;margin-bottom:8px">' +
      `<div style="flex:1;text-align:center;padding:6px;font-size:10px;color:${t.textDim};background:rgba(${t.primaryRgb},.08);border-radius:10px">💸 转账给 ${_esc(npcName)}</div>` +
      '</div>' +
      '<div class="ax-api-form">' +
      '<label>转账金额</label>' +
      `<input id="ax-tf-amount" type="number" placeholder="输入魂币数量" min="1" max="99999">` +
      '<label>转账备注（可选）</label>' +
      `<input id="ax-tf-note" type="text" placeholder="如：买装备的钱" maxlength="30">` +
      '</div>' +
      '<div class="ax-dlg-err" id="ax-tf-err"></div>' +
      '<div class="ax-dlg-actions">' +
      '<button class="ax-dlg-btn ax-dlg-cancel" id="ax-tf-no">取消</button>' +
      '<button class="ax-dlg-btn ax-dlg-ok" id="ax-tf-yes">确认转账</button>' +
      '</div>'
    );

    $('#ax-tf-no').on('click', () => w.remove());
    $('#ax-tf-yes').on('click', async () => {
      const amount = parseInt($('#ax-tf-amount').val());
      const note = $('#ax-tf-note').val().trim();
      const $err = $('#ax-tf-err');

      if (!amount || amount <= 0) { $err.text('请输入有效金额'); return; }
      if (amount > 99999) { $err.text('单次转账不超过99999'); return; }

      // 玩家转给NPC：扣魂币
      const coins = _getPlayerCoins();
      if (coins < amount) { $err.text('魂币不足！当前余额：' + coins); return; }
      const ok = await _setPlayerCoins(coins - amount);
      if (!ok) { $err.text('保存失败'); return; }

      // 在聊天中显示转账消息
      const tfMsg = `[transfer:send:${amount}:${note || '转账'}]`;
      _addMessage(npcName, 'user', tfMsg);

      w.remove();
      _render();
      if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success 已转出 ${amount} 魂币给 ${npcName}`);
    });
  }

  /* ═══════════════════════════════════════
     🎁 礼物商店系统
     ═══════════════════════════════════════ */
  const SHOP_STORAGE_KEY = 'abyss-gift-shop';
  const CART_STORAGE_KEY = 'abyss-gift-cart';

  // 默认商品列表（用户可自定义扩展）
  const DEFAULT_SHOP_ITEMS = [
    { id: 'gs_001', name: '治愈药膏', emoji: '💊', rarity: 'R', price: 50, description: '能治愈轻微伤口的药膏，散发着草药清香' },
    { id: 'gs_002', name: '暗影玫瑰', emoji: '🥀', rarity: 'SR', price: 150, description: '在深渊中绽放的黑色玫瑰，花瓣上隐约流转着紫色光芒' },
    { id: 'gs_003', name: '灵魂碎片', emoji: '💎', rarity: 'SR', price: 200, description: '凝聚着纯净灵魂能量的水晶碎片，微微发光' },
    { id: 'gs_004', name: '鬼火灯笼', emoji: '🏮', rarity: 'SR', price: 180, description: '封印着温顺鬼火的小灯笼，散发柔和的蓝色光芒' },
    { id: 'gs_005', name: '冥界特产糕', emoji: '🍡', rarity: 'R', price: 30, description: '深渊特产的点心，味道出奇地好，吃了会精神一振' },
    { id: 'gs_006', name: '炼金护符', emoji: '🧿', rarity: 'SR', price: 250, description: '古老的炼金术师制作的护身符，能抵御一次精神攻击' },
    { id: 'gs_007', name: '深渊笔记本', emoji: '📔', rarity: 'R', price: 80, description: '用深渊特产的皮革制成的笔记本，墨水永不干涸' },
    { id: 'gs_008', name: '虚空围巾', emoji: '🧣', rarity: 'SR', price: 160, description: '用虚空蚕丝编织的围巾，戴上后周围温度会微微升高' },
    { id: 'gs_009', name: '星尘耳坠', emoji: '✨', rarity: 'SSR', price: 500, description: '坠落的星辰碎片打磨而成，在黑暗中闪烁着星光' },
    { id: 'gs_010', name: '噩梦捕手', emoji: '🕸️', rarity: 'SSR', price: 450, description: '能捕捉噩梦的神秘织网，将噩梦转化为平静的梦境' },
    { id: 'gs_011', name: '时间沙漏', emoji: '⏳', rarity: 'SSR', price: 600, description: '封存着时间碎片的沙漏，据说能让某个瞬间永恒定格' },
    { id: 'gs_012', name: '血月匕首', emoji: '🗡️', rarity: 'SSR', price: 550, description: '在血月之夜铸造的匕首，刀锋寒光中隐藏着强大力量' },
    { id: 'gs_013', name: '深渊之心', emoji: '🫀', rarity: 'SSS', price: 999, description: '深渊的核心结晶，蕴含着难以想象的黑暗能量，极为珍贵' },
    { id: 'gs_014', name: '凤凰羽毛', emoji: '🪶', rarity: 'SSS', price: 888, description: '传说中的凤凰落下的一根羽毛，温暖而充满生命力' },
    { id: 'gs_015', name: '命运之线', emoji: '🧵', rarity: 'SSS', price: 777, description: '能短暂窥视命运走向的丝线，使用后会自行消散' },
    { id: 'gs_016', name: '暖心可可', emoji: '☕', rarity: 'R', price: 25, description: '热腾腾的可可饮品，一口下去全身暖洋洋' },
    { id: 'gs_017', name: '幽灵猫玩偶', emoji: '🐱', rarity: 'R', price: 60, description: '软绵绵的猫咪玩偶，眼睛会在黑暗中微微发光' },
    { id: 'gs_018', name: '记忆水晶', emoji: '🔮', rarity: 'SR', price: 300, description: '可以封存一段珍贵记忆的水晶球，随时可以重温' },
    { id: 'gs_019', name: '深渊乐盒', emoji: '🎵', rarity: 'SR', price: 200, description: '播放着空灵旋律的音乐盒，能暂时安抚躁动的灵魂' },
    { id: 'gs_020', name: '契约戒指', emoji: '💍', rarity: 'SSS', price: 1500, description: '象征着永恒契约的戒指，戴上后双方的灵魂会产生共鸣' }
  ];

  function _loadShop() {
    try {
      const raw = localStorage.getItem(SHOP_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    // 首次加载用默认商品初始化
    _saveShop(DEFAULT_SHOP_ITEMS);
    return DEFAULT_SHOP_ITEMS;
  }
  function _saveShop(list) {
    try { localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(list)); } catch (e) { }
  }

  function _loadCart() {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return [];
    // 结构: [{ itemId, quantity }]
  }
  function _saveCart(list) {
    try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(list)); } catch (e) { }
  }
  function _addToCart(itemId, qty) {
    const cart = _loadCart();
    const existing = cart.find(c => c.itemId === itemId);
    if (existing) {
      existing.quantity += (qty || 1);
    } else {
      cart.push({ itemId, quantity: qty || 1 });
    }
    _saveCart(cart);
    return cart;
  }
  function _removeFromCart(itemId) {
    let cart = _loadCart();
    cart = cart.filter(c => c.itemId !== itemId);
    _saveCart(cart);
    return cart;
  }
  function _updateCartQty(itemId, qty) {
    const cart = _loadCart();
    const existing = cart.find(c => c.itemId === itemId);
    if (existing) {
      if (qty <= 0) return _removeFromCart(itemId);
      existing.quantity = qty;
    }
    _saveCart(cart);
    return cart;
  }
  function _clearCart() {
    _saveCart([]);
  }
  function _getCartTotal() {
    const cart = _loadCart();
    const shop = _loadShop();
    let total = 0;
    for (const c of cart) {
      const item = shop.find(s => s.id === c.itemId);
      if (item) total += item.price * c.quantity;
    }
    return total;
  }
  function _getCartCount() {
    return _loadCart().reduce((s, c) => s + c.quantity, 0);
  }

  // NPC查看用户分享的链接并给出反馈
  async function _npcViewLink(npcName, title, source, desc, type) {
    const api = _getDefaultApi();
    if (!api) {
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 请先配置API接口');
      return;
    }

    const t = _t();
    const $msgs = $('#ax-chat-msgs');
    const personality = _getNpcPersonality(npcName);
    const context = _getContextSummary();

    // 显示"正在查看"动画
    $msgs.append(`<div class="ax-chat-typing" id="ax-link-typing"><div style="font-size:9px;color:${t.textMuted};display:flex;align-items:center;gap:4px"><span style="animation:axBlink 1.5s infinite">👀</span> ${_esc(npcName)}正在查看链接…</div></div>`);
    $msgs.scrollTop($msgs[0].scrollHeight);

    const typeLabels = { article: '文章', video: '视频', forum: '论坛帖子', news: '新闻', other: '链接' };
    const typeLabel = typeLabels[type] || '链接';

    try {
      const msgs = [
        {
          role: 'system',
          content: `你是"${npcName}"。玩家给你分享了一个${typeLabel}链接，你点进去看了。

你的性格：${personality.personality}

链接信息：
- 标题：${title}
- 来源：${source}
- 描述：${desc || '无'}
- 类型：${typeLabel}

当前世界信息：
${context.slice(0, 2000)}

要求：
- 你已经"点开看了"这个链接，现在要给出你的真实反应
- 像真人在微信里看完链接后的反应一样，简短随意
- 可以是吐槽、评价、共鸣、嘲讽、认真分析、表达兴趣……取决于你的性格和链接内容
- 1-3句话，可以用emoji
- 不要说"我是AI"，不要客套
- 如果链接内容和你们当前的处境有关，可以联系一下
- 不要用markdown，不要加角色名前缀`
        },
        { role: 'user', content: `（${npcName}点开了链接"${title}"，看了一下）` }
      ];

      const reply = await _callAuxApi(msgs, { temperature: 0.9, max_tokens: 2000 });

      // 清理特殊指令
      const cleanedReply = reply
        .split(/\n+/)
        .filter(s => {
          const trimmed = s.trim();
          if (trimmed.match(/^\[npc-transfer:\d+:[^\]]*\]$/)) return false;
          if (trimmed.match(/^\[npc-gift\]$/)) return false;
          return true;
        })
        .join('\n')
        .trim();

      if (cleanedReply) {
        _addMessage(npcName, 'assistant', cleanedReply);
      }

      $('#ax-link-typing').remove();

      if (cleanedReply) {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const segments = cleanedReply.split(/\n+/).map(s => s.trim()).filter(Boolean);
        for (let si = 0; si < segments.length; si++) {
          const isLast = si === segments.length - 1;
          const seg = segments[si];
          const stkHtml = _renderMessageContent(seg, false);
          if (stkHtml !== null) {
            $msgs.append(`<div class="ax-chat-bubble npc" style="background:transparent;padding:4px">${stkHtml}${isLast ? '<span class="ax-chat-time">' + timeStr + '</span>' : ''}</div>`);
          } else {
            $msgs.append(`<div class="ax-chat-bubble npc">${_esc(seg)}${isLast ? '<span class="ax-chat-time">' + timeStr + '</span>' : ''}</div>`);
          }
        }
      }
      $msgs.scrollTop($msgs[0].scrollHeight);

    } catch (e) {
      $('#ax-link-typing').remove();
      $msgs.append(`<div class="ax-chat-bubble npc" style="color:${t.fail};opacity:.8;font-size:9px">⚠ 查看失败：${_esc((e.message || '').slice(0, 80))}</div>`);
      $msgs.scrollTop($msgs[0].scrollHeight);
    }
  }

  // 显示NPC分享的链接详情预览
  function _showLinkPreview(npcName, title, source, desc, type) {
    const t = _t();
    const typeIcons = { article: '📄', video: '🎬', forum: '💬', news: '📰', other: '🔗' };
    const typeLabels = { article: '文章', video: '视频', forum: '帖子', news: '新闻', other: '链接' };
    const typeIcon = typeIcons[type] || '🔗';
    const typeLabel = typeLabels[type] || '链接';

    let o = '';
    o += `<div style="text-align:center;font-size:36px;padding:12px 0">${typeIcon}</div>`;
    o += `<div class="ax-dlg-h" style="text-align:center">${_esc(title)}</div>`;
    o += `<div class="ax-dlg-sub" style="text-align:center">${typeLabel} · 来自 ${_esc(source)}</div>`;

    if (desc) {
      o += `<div style="padding:12px;background:${t.surfaceHover};border-radius:10px;margin:8px 0;font-size:10px;color:${t.textDim};line-height:1.6">${_esc(desc)}</div>`;
    }

    o += `<div style="text-align:center;padding:8px 0;font-size:8px;color:${t.textMuted};font-style:italic">这是游戏世界中的虚构内容</div>`;

    // 生成AI详细内容按钮
    o += `<div class="ax-dlg-actions">`;
    o += `<button class="ax-dlg-btn ax-dlg-cancel" id="ax-lp-close">关闭</button>`;
    o += `<button class="ax-dlg-btn ax-dlg-ok" id="ax-lp-generate">✨ 查看完整内容</button>`;
    o += `</div>`;

    const w = _dialog(o);

    w.find('#ax-lp-close').on('click', () => w.remove());

    // 生成链接的完整内容
    w.find('#ax-lp-generate').on('click', async function () {
      const $btn = $(this);
      const api = _getAuxApi();
      if (!api) {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 请先配置API接口');
        return;
      }
      $btn.prop('disabled', true).text('生成中…');

      try {
        const context = _getContextSummary();
        const msgs = [
          {
            role: 'system',
            content: `你是一个游戏内的内容生成器。请为以下虚构链接生成完整的内容。

链接信息：
- 标题：${title}
- 来源平台：${source}
- 简介：${desc || '无'}
- 类型：${typeLabel}

当前世界背景：
${context.slice(0, 2000)}

要求：
- 内容必须符合游戏世界观（深渊炼狱/恐怖生存类）
- 根据链接类型调整内容风格：
  · 文章：正式但有趣的攻略/分析/科普文，500-1000字，内容详实
  · 视频：用文字描述视频内容摘要+评论区热评（5-10条），400-800字
  · 论坛帖子：主帖内容（200-400字）+跟帖讨论（8-15层楼，每层20-100字不等），总计600-1200字
  · 新闻：新闻正文+记者评论+网友热议，400-800字
  · 其他：自由发挥，400-800字
- 内容要生动有趣，有游戏世界的氛围感
- 论坛/视频类可以包含有趣的网友评论和互动
- 直接输出内容，不要加任何格式标记`
          },
          { role: 'user', content: `请生成"${title}"的完整内容` }
        ];

        const reply = await _callApi(msgs, { temperature: 0.9, max_tokens: 3500 });

        // 替换弹窗内容为生成的完整内容
        w.find('.ax-dlg-box').html(
          `<div style="font-size:8px;color:${t.textMuted};display:flex;align-items:center;gap:4px;margin-bottom:6px"><span>${typeIcon}</span>${_esc(source)} · ${typeLabel}</div>` +
          `<div class="ax-dlg-h">${_esc(title)}</div>` +
          `<div style="max-height:300px;overflow-y:auto;padding:10px;background:${t.surfaceHover};border-radius:10px;margin:8px 0;font-size:10px;color:${t.text};line-height:1.7;white-space:pre-wrap;scrollbar-width:thin;scrollbar-color:${t.scrollThumb} transparent">${_esc(reply)}</div>` +
          `<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-lp-close2">关闭</button></div>`
        );
        w.find('#ax-lp-close2').on('click', () => w.remove());

      } catch (e) {
        $btn.prop('disabled', false).text('✨ 重试');
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=error 内容生成失败：' + (e.message || '未知'));
      }
    });
  }

  function _showMusicShareDialog(npcName) {
    const t = _t();
    const history = _loadRadioHistory();
    const favorites = _loadRadioFavorites();

    let o = '<div class="ax-dlg-h">🎵 分享歌曲</div>';
    o += `<div class="ax-dlg-sub">搜索歌曲发送给 ${_esc(npcName)}</div>`;

    // 搜索栏
    o += '<div class="ax-api-form">';
    o += '<label>搜索歌曲</label>';
    o += '<div style="display:flex;gap:4px">';
    o += '<input id="ax-ms-search" type="text" placeholder="输入歌名或歌手…" style="flex:1">';
    o += '<button class="ax-dlg-btn ax-dlg-ok" id="ax-ms-search-btn" style="flex-shrink:0">搜索</button>';
    o += '</div>';
    o += '<label>留言（可选）</label>';
    o += '<input id="ax-ms-comment" type="text" placeholder="说点什么…" maxlength="50">';
    o += '</div>';

    // 搜索结果区
    o += '<div id="ax-ms-results" style="margin-top:6px;max-height:120px;overflow-y:auto"></div>';

    // 快捷选择：收藏和历史
    if (favorites.length || history.length) {
      o += `<div style="margin-top:8px;border-top:1px solid ${t.divider};padding-top:6px">`;
      if (favorites.length) {
        o += `<div style="font-size:8px;color:${t.textMuted};margin-bottom:3px;letter-spacing:1px">❤️ 收藏</div>`;
        o += '<div style="max-height:80px;overflow-y:auto">';
        for (const s of favorites.slice(0, 8)) {
          o += `<div class="ax-ms-quick-song" data-song="${_esc(s.name)}" data-artist="${_esc(s.artist)}" style="display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:6px;cursor:pointer;transition:background .15s;font-size:9px">`;
          o += `<span style="color:${t.textMuted}">🎵</span>`;
          o += `<span style="flex:1;color:${t.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${_esc(s.name)}</span>`;
          o += `<span style="color:${t.textMuted};font-size:8px;flex-shrink:0">${_esc(s.artist || '')}</span>`;
          o += `</div>`;
        }
        o += '</div>';
      }
      if (history.length) {
        o += `<div style="font-size:8px;color:${t.textMuted};margin:4px 0 3px;letter-spacing:1px">📋 最近播放</div>`;
        o += '<div style="max-height:80px;overflow-y:auto">';
        for (const s of history.slice(0, 6)) {
          o += `<div class="ax-ms-quick-song" data-song="${_esc(s.name)}" data-artist="${_esc(s.artist)}" style="display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:6px;cursor:pointer;transition:background .15s;font-size:9px">`;
          o += `<span style="color:${t.textMuted}">🎵</span>`;
          o += `<span style="flex:1;color:${t.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${_esc(s.name)}</span>`;
          o += `<span style="color:${t.textMuted};font-size:8px;flex-shrink:0">${_esc(s.artist || '')}</span>`;
          o += `</div>`;
        }
        o += '</div>';
      }
      o += '</div>';
    }

    o += '<div class="ax-dlg-err" id="ax-ms-err"></div>';
    o += '<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-ms-close">取消</button></div>';

    const w = _dialog(o);

    // 搜索功能
    w.find('#ax-ms-search-btn').on('click', async function () {
      const kw = $('#ax-ms-search').val().trim();
      if (!kw) { $('#ax-ms-err').text('请输入搜索关键词'); return; }
      const $btn = $(this);
      const $results = $('#ax-ms-results');
      $btn.prop('disabled', true).text('搜索中…');
      $results.html(`<div style="text-align:center;padding:8px;color:${t.textMuted};font-size:9px"><div class="ax-chat-typing-dots" style="display:inline-flex;gap:3px"><span></span><span></span><span></span></div></div>`);

      const libLoaded = await _ensureMusicLib();
      if (!libLoaded || !globalThis.Music) {
        $results.html(`<div style="color:${t.fail};font-size:9px;padding:4px">音乐库加载失败</div>`);
        $btn.prop('disabled', false).text('搜索');
        return;
      }

      try {
        const result = await globalThis.Music.SearchMusic(kw);
        if (result && result.Name) {
          const songName = result.Name;
          const artistName = result.Singer || '';
          $results.html(
            `<div class="ax-ms-result-item" data-song="${_esc(songName)}" data-artist="${_esc(artistName)}" style="display:flex;align-items:center;gap:8px;padding:8px;border-radius:10px;background:${t.surfaceHover};cursor:pointer;transition:all .2s">` +
            `<span style="font-size:20px">🎵</span>` +
            `<div style="flex:1;min-width:0"><div style="font-size:11px;font-weight:600;color:${t.text}">${_esc(songName)}</div><div style="font-size:9px;color:${t.textMuted}">${_esc(artistName)}</div></div>` +
            `<button class="ax-dlg-btn ax-dlg-ok ax-ms-send-result" style="flex-shrink:0;font-size:9px">发送</button>` +
            `</div>`
          );

          $results.find('.ax-ms-send-result').on('click', function (e) {
            e.stopPropagation();
            const $item = $(this).closest('.ax-ms-result-item');
            _doSendMusicMsg($item.data('song'), $item.data('artist'), npcName);
            w.remove();
          });
        } else {
          $results.html(`<div style="color:${t.fail};font-size:9px;padding:4px">未找到歌曲，请尝试其他关键词</div>`);
        }
      } catch (e) {
        $results.html(`<div style="color:${t.fail};font-size:9px;padding:4px">搜索失败：${_esc(e.message || '未知错误')}</div>`);
      }
      $btn.prop('disabled', false).text('搜索');
    });

    // 回车搜索
    w.find('#ax-ms-search').on('keydown', function (e) {
      if (e.key === 'Enter') w.find('#ax-ms-search-btn').click();
    });

    // 快捷选择歌曲
    w.find('.ax-ms-quick-song').on('click', function () {
      const songName = $(this).data('song');
      const artistName = $(this).data('artist');
      _doSendMusicMsg(songName, artistName, npcName);
      w.remove();
    });

    // 关闭
    w.find('#ax-ms-close').on('click', () => w.remove());
  }

  // 发送音乐消息
  function _doSendMusicMsg(songName, artistName, npcName) {
    const comment = ($('#ax-ms-comment').length ? $('#ax-ms-comment').val().trim() : '') || '';
    const safeComment = comment.replace(/[\[\]:]/g, '').trim();
    const safeSong = String(songName).replace(/[\[\]:]/g, '').trim();
    const safeArtist = String(artistName).replace(/[\[\]:]/g, '').trim();
    const msg = `[music:${safeSong}:${safeArtist}:${safeComment}]`;

    _addMessage(npcName, 'user', msg);

    // 直接刷新界面
    _render();

    if (typeof triggerSlash === 'function') {
      triggerSlash(`/echo severity=success 已发送歌曲：${safeSong}`);
    }
  }

  /* ═══════════════════════════════════════
     🎁 礼物系统
     ═══════════════════════════════════════ */
  const GIFT_STORAGE_KEY = 'abyss-gifts';
  function _loadGifts() {
    try {
      const raw = localStorage.getItem(GIFT_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return [];
    // 结构: [{ id, name, description, rarity, emoji, fromNpc, toNpc, ts }]
  }
  function _saveGifts(list) {
    try { localStorage.setItem(GIFT_STORAGE_KEY, JSON.stringify(list)); } catch (e) { }
  }
  function _addGift(gift) {
    const list = _loadGifts();
    gift.id = gift.id || ('gift_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5));
    gift.ts = Date.now();
    list.push(gift);
    // 限制数量防溢出
    if (list.length > 100) list.splice(0, list.length - 100);
    _saveGifts(list);
    return gift;
  }
  function _removeGift(id) {
    let list = _loadGifts();
    list = list.filter(g => g.id !== id);
    _saveGifts(list);
  }
  function _getGiftsFor(npcName) {
    return _loadGifts().filter(g => g.fromNpc === npcName || g.toNpc === npcName);
  }

  function _showGiftPanel(npcName) {
    const t = _t();
    const coins = _getPlayerCoins();
    const shop = _loadShop();
    const cart = _loadCart();
    const cartTotal = _getCartTotal();
    const cartCount = _getCartCount();
    const gifts = _getGiftsFor(npcName);

    let o = '';
    o += `<div class="ax-dlg-h">🎁 礼物商店</div>`;
    o += `<div class="ax-dlg-sub">送礼给 ${_esc(npcName)}　|　💰 余额：<span style="color:${t.accent};font-weight:700">${coins}</span> 魂币</div>`;

    // 标签切换：商店 / 购物车 / 记录
    o += '<div style="display:flex;gap:0;margin-bottom:8px;border-bottom:1px solid ' + t.divider + '">';
    o += `<div class="ax-bag-tab on" data-shop-tab="shop">🏪 商店</div>`;
    o += `<div class="ax-bag-tab" data-shop-tab="cart">🛒 购物车${cartCount > 0 ? '<span class="ax-cnt" style="color:' + t.primary + '">' + cartCount + '</span>' : ''}</div>`;
    o += `<div class="ax-bag-tab" data-shop-tab="history">📋 记录</div>`;
    o += '</div>';

    // 搜索栏 + ai搜索生成按钮
    o += '<div style="display:flex;gap:4px;margin-bottom:6px">';
    o += `<input class="ax-dlg-input" id="ax-shop-search" type="text" placeholder="🔍 输入关键词搜索或生成礼物（如：蛋糕）" style="font-size:10px;padding:6px 10px;flex:1">`;
    o += `<button class="ax-fetch-models-btn" id="ax-shop-ai-gen" style="white-space:nowrap">✨ ai生成</button>`;
    o += '</div>';

    // 商品列表
    o += '<div id="ax-shop-list" style="max-height:220px;overflow-y:auto;scrollbar-width:thin">';
    o += _renderShopItems(shop, cart, '');
    o += '</div>';

    // 购物车区域（默认隐藏）
    o += '<div id="ax-cart-area" style="display:none;max-height:220px;overflow-y:auto">';
    o += _renderCartItems(cart, shop);
    o += '</div>';

    // 记录区域（默认隐藏）
    o += '<div id="ax-history-area" style="display:none;max-height:220px;overflow-y:auto">';
    o += _renderGiftHistory(gifts, npcName);
    o += '</div>';

    // 底部结算栏
    o += `<div id="ax-shop-footer" style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px solid ${t.divider};margin-top:8px">`;
    o += `<div style="font-size:9px;color:${t.textDim}">合计：<span id="ax-cart-total" style="color:${t.accent};font-weight:700;font-size:12px">${cartTotal}</span> 魂币</div>`;
    o += `<div style="display:flex;gap:4px">`;
    o += `<button class="ax-dlg-btn ax-dlg-cancel" id="ax-shop-close">关闭</button>`;
    o += `<button class="ax-dlg-btn ax-dlg-ok" id="ax-shop-checkout" ${cartCount === 0 ? 'disabled style="opacity:.4"' : ''}>🎁 结算送出 (${cartCount})</button>`;
    o += `</div></div>`;

    const w = _dialog(o);

    // 标签切换
    w.find('[data-shop-tab]').on('click', function () {
      const tab = $(this).data('shop-tab');
      w.find('[data-shop-tab]').removeClass('on');
      $(this).addClass('on');
      $('#ax-shop-list, #ax-cart-area, #ax-history-area').hide();
      if (tab === 'shop') $('#ax-shop-list').show();
      else if (tab === 'cart') {
        $('#ax-cart-area').html(_renderCartItems(_loadCart(), _loadShop())).show();
        _wireCartEvents(w, npcName);
      }
      else if (tab === 'history') $('#ax-history-area').show();
    });

    // 搜索
    w.find('#ax-shop-search').on('input', function () {
      const q = $(this).val().trim().toLowerCase();
      $('#ax-shop-list').html(_renderShopItems(_loadShop(), _loadCart(), q));
      _wireShopEvents(w, npcName);
    });

    // 绑定商店事件
    _wireShopEvents(w, npcName);

    // AI搜索生成礼物
    w.find('#ax-shop-ai-gen').on('click', async function () {
      const $btn = $(this);
      const searchQuery = $('#ax-shop-search').val().trim();
      const api = _getAuxApi();
      if (!api) {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 请先配置API接口');
        return;
      }
      if (!searchQuery) {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 请先在搜索框输入关键词，如：蛋糕、武器、花');
        return;
      }
      $btn.prop('disabled', true).text('生成中…');
      try {
        const context = _getContextSummary();
        const personality = _getNpcPersonality(npcName);
        const existingNames = _loadShop().map(s => s.name);
        const msgs = [
          {
            role: 'system',
            content: `你是一个礼物商店的商品生成器。用户搜索了关键词"${searchQuery}"，请根据这个关键词和当前世界观，生成3-5个与"${searchQuery}"相关的礼物商品。

送礼对象"${npcName}"的性格：${personality.personality}

当前世界信息：
${context.slice(0, 2000)}

已有商品（不要重复）：${existingNames.slice(0, 15).join('、')}

要求：
1. 所有生成的礼物都必须与搜索关键词"${searchQuery}"相关
2. 礼物要符合当前世界观
3. 包含不同稀有度和价格的礼物
4. 礼物名称不超过8个字，禁止使用书名号或括号
5. 必须严格按以下JSON数组格式回复，只输出JSON，不要有其他文字：
[{"name":"礼物名","emoji":"单个emoji","rarity":"R或SR或SSR","price":数字50到999,"description":"15-30字描述"}]
6. 示例（假设搜索"蛋糕"）：[{"name":"暗影巧克力蛋糕","emoji":"🍫","rarity":"SR","price":180,"description":"用深渊可可豆制成的蛋糕，入口即化，回味悠长"},{"name":"灵魂奶油蛋糕","emoji":"🎂","rarity":"R","price":60,"description":"松软的奶油蛋糕，散发温暖气息，吃了心情变好"}]`
          },
          { role: 'user', content: `请生成与"${searchQuery}"相关的礼物商品` }
        ];
        const reply = await _callApi(msgs, { temperature: 0.95, max_tokens: 1200 });
        let newItems;
        try {
          newItems = _safeParseJsonArray(reply);
        } catch (e) {
          throw new Error('无法解析AI生成的商品');
        }
        const shop = _loadShop();
        let addedCount = 0;
        for (const item of newItems) {
          if (!item.name) continue;
          item.name = String(item.name).replace(/[《》「」『』【】\[\]]/g, '').trim().slice(0, 20);
          if (existingNames.includes(item.name)) continue;
          if (shop.find(s => s.name === item.name)) continue;
          item.id = 'gs_ai_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5);
          item.emoji = String(item.emoji || '🎁').trim().slice(0, 4);
          item.rarity = (['SSS', 'SSR', 'SR', 'R'].includes(String(item.rarity).toUpperCase())) ? String(item.rarity).toUpperCase() : 'R';
          item.price = Math.max(10, Math.min(9999, parseInt(item.price) || 100));
          item.description = String(item.description || '').trim().slice(0, 100);
          shop.push(item);
          existingNames.push(item.name);
          addedCount++;
        }
        _saveShop(shop);
        if (addedCount > 0) {
          if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success 已生成 ${addedCount} 个"${searchQuery}"相关商品！`);
        } else {
          if (typeof triggerSlash === 'function') triggerSlash('/echo severity=info 没有生成新商品（可能与已有商品重名）');
        }
        _refreshShopUI(w, npcName);
      } catch (e) {
        console.warn('[Abyss] AI gift gen fail:', e);
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=error 商品生成失败：' + (e.message || '未知错误'));
      }
      $btn.prop('disabled', false).text('✨ AI生成');
    });


    // 关闭
    w.find('#ax-shop-close').on('click', () => w.remove());

    // 结算
    w.find('#ax-shop-checkout').on('click', () => _checkoutCart(w, npcName));
  }

  function _renderShopItems(shop, cart, query) {
    const t = _t();
    const q = (query || '').toLowerCase();
    const filtered = q ? shop.filter(s => s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q)) : shop;

    if (!filtered.length) return `<div style="text-align:center;padding:20px;color:${t.textMuted};font-size:10px">未找到匹配的礼物</div>`;

    // 按稀有度分组
    const groups = { SSS: [], SSR: [], SR: [], R: [] };
    for (const item of filtered) {
      const r = item.rarity || 'R';
      if (groups[r]) groups[r].push(item);
      else groups['R'].push(item);
    }

    let o = '';
    for (const [rarity, items] of Object.entries(groups)) {
      if (!items.length) continue;
      const rc = { SSS: t.sss, SSR: t.ssr, SR: t.sr, R: t.textDim }[rarity] || t.textDim;
      o += `<div style="font-size:8px;color:${rc};font-weight:600;letter-spacing:1px;margin:6px 0 3px;padding-bottom:2px;border-bottom:1px solid ${t.divider}">${rarity} 级</div>`;
      for (const item of items) {
        const inCart = cart.find(c => c.itemId === item.id);
        const qty = inCart ? inCart.quantity : 0;
        o += `<div style="display:flex;align-items:center;gap:6px;padding:5px 6px;border-radius:8px;margin-bottom:2px;transition:background .15s;cursor:default" class="ax-shop-item-row">`;
        o += `<span style="font-size:18px;width:24px;text-align:center">${item.emoji}</span>`;
        o += `<div style="flex:1;min-width:0">`;
        o += `<div style="font-size:10px;color:${t.text};display:flex;align-items:center;gap:4px"><span>${_esc(item.name)}</span><span style="font-size:7px;color:${rc}">[${rarity}]</span></div>`;
        o += `<div style="font-size:8px;color:${t.textMuted};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${_esc(item.description || '')}</div>`;
        o += `</div>`;
        o += `<div style="font-size:9px;color:${t.accent};font-weight:600;flex-shrink:0;min-width:36px;text-align:right">${item.price}💰</div>`;
        o += `<button class="ax-api-btn ax-shop-add" data-item-id="${item.id}" style="flex-shrink:0;font-size:8px;padding:3px 8px">${qty > 0 ? '✓ ' + qty : '加入'}</button>`;
        o += `</div>`;
      }
    }
    return o;
  }

  function _renderCartItems(cart, shop) {
    const t = _t();
    if (!cart.length) return `<div style="text-align:center;padding:20px;color:${t.textMuted};font-size:10px;font-style:italic">购物车是空的</div>`;

    let o = '';
    for (const c of cart) {
      const item = shop.find(s => s.id === c.itemId);
      if (!item) continue;
      const subtotal = item.price * c.quantity;
      o += `<div style="display:flex;align-items:center;gap:6px;padding:6px;border-radius:8px;margin-bottom:3px;background:${t.surfaceHover}">`;
      o += `<span style="font-size:18px;width:24px;text-align:center">${item.emoji}</span>`;
      o += `<div style="flex:1;min-width:0"><div style="font-size:10px;color:${t.text}">${_esc(item.name)}</div><div style="font-size:8px;color:${t.textMuted}">${item.price}💰 × ${c.quantity} = ${subtotal}💰</div></div>`;
      o += `<div style="display:flex;align-items:center;gap:2px;flex-shrink:0">`;
      o += `<button class="ax-api-btn ax-cart-minus" data-cid="${item.id}" style="padding:2px 6px;font-size:9px">−</button>`;
      o += `<span style="font-size:10px;color:${t.text};min-width:16px;text-align:center">${c.quantity}</span>`;
      o += `<button class="ax-api-btn ax-cart-plus" data-cid="${item.id}" style="padding:2px 6px;font-size:9px">+</button>`;
      o += `<button class="ax-api-btn danger ax-cart-del" data-cid="${item.id}" style="padding:2px 6px;font-size:9px;margin-left:2px">✕</button>`;
      o += `</div></div>`;
    }
    return o;
  }

  function _renderGiftHistory(gifts, npcName) {
    const t = _t();
    if (!gifts.length) return `<div style="text-align:center;padding:20px;color:${t.textMuted};font-size:10px;font-style:italic">还没有礼物记录</div>`;
    const sorted = gifts.sort((a, b) => (b.ts || 0) - (a.ts || 0));
    let o = '';
    for (const g of sorted) {
      const isSent = g.toNpc === npcName;
      const dirIcon = isSent ? '➜' : '⬅';
      const dirText = isSent ? '送出' : '收到';
      const rc = { SSS: t.sss, SSR: t.ssr, SR: t.sr, R: t.text }[g.rarity] || t.textDim;
      o += `<div style="display:flex;align-items:center;gap:6px;padding:5px;border-radius:8px;margin-bottom:2px">`;
      o += `<span style="font-size:16px;width:22px;text-align:center">${g.emoji || '🎁'}</span>`;
      o += `<div style="flex:1;min-width:0"><div style="font-size:9px;color:${t.text}">${_esc(g.name)} <span style="font-size:7px;color:${rc}">[${g.rarity || 'R'}]</span></div>`;
      o += `<div style="font-size:7px;color:${t.textMuted}">${dirIcon} ${dirText}</div></div>`;
      o += `<button class="ax-api-btn danger ax-ghist-del" data-gid="${g.id}" style="font-size:7px;flex-shrink:0">删</button>`;
      o += `</div>`;
    }
    return o;
  }

  function _wireShopEvents(w, npcName) {
    w.find('.ax-shop-add').off('click').on('click', function () {
      const itemId = $(this).data('item-id');
      _addToCart(itemId, 1);
      _refreshShopUI(w, npcName);
    });
    w.find('.ax-ghist-del').off('click').on('click', function () {
      _removeGift($(this).data('gid'));
      $('#ax-history-area').html(_renderGiftHistory(_getGiftsFor(npcName), npcName));
      _wireShopEvents(w, npcName);
    });
  }

  function _wireCartEvents(w, npcName) {
    w.find('.ax-cart-minus').off('click').on('click', function () {
      const id = $(this).data('cid');
      const cart = _loadCart();
      const c = cart.find(x => x.itemId === id);
      if (c) _updateCartQty(id, c.quantity - 1);
      _refreshShopUI(w, npcName);
      // 刷新购物车视图
      $('#ax-cart-area').html(_renderCartItems(_loadCart(), _loadShop()));
      _wireCartEvents(w, npcName);
    });
    w.find('.ax-cart-plus').off('click').on('click', function () {
      const id = $(this).data('cid');
      _addToCart(id, 1);
      _refreshShopUI(w, npcName);
      $('#ax-cart-area').html(_renderCartItems(_loadCart(), _loadShop()));
      _wireCartEvents(w, npcName);
    });
    w.find('.ax-cart-del').off('click').on('click', function () {
      _removeFromCart($(this).data('cid'));
      _refreshShopUI(w, npcName);
      $('#ax-cart-area').html(_renderCartItems(_loadCart(), _loadShop()));
      _wireCartEvents(w, npcName);
    });
  }

  function _refreshShopUI(w, npcName) {
    const cartTotal = _getCartTotal();
    const cartCount = _getCartCount();
    w.find('#ax-cart-total').text(cartTotal);
    w.find('#ax-shop-checkout').prop('disabled', cartCount === 0).css('opacity', cartCount === 0 ? '.4' : '1').text(`🎁 结算送出 (${cartCount})`);
    // 刷新商品列表中的"加入"按钮状态
    const q = w.find('#ax-shop-search').val() || '';
    w.find('#ax-shop-list').html(_renderShopItems(_loadShop(), _loadCart(), q.trim().toLowerCase()));
    _wireShopEvents(w, npcName);
    // 更新购物车标签数量
    w.find('[data-shop-tab="cart"] .ax-cnt').remove();
    if (cartCount > 0) {
      w.find('[data-shop-tab="cart"]').append(`<span class="ax-cnt" style="color:${_t().primary}">${cartCount}</span>`);
    }
  }

  async function _checkoutCart(w, npcName) {
    const t = _t();
    const cart = _loadCart();
    const shop = _loadShop();
    const total = _getCartTotal();
    const coins = _getPlayerCoins();

    if (!cart.length) return;
    if (coins < total) {
      if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=warning 魂币不足！需要 ${total}，当前余额 ${coins}`);
      return;
    }

    // 确认弹窗
    let itemList = '';
    for (const c of cart) {
      const item = shop.find(s => s.id === c.itemId);
      if (!item) continue;
      itemList += `${item.emoji} ${item.name} ×${c.quantity} (${item.price * c.quantity}💰)\n`;
    }

    const w2 = _dialog(
      `<div class="ax-dlg-h">🎁 确认送出</div>` +
      `<div class="ax-dlg-sub">送给 ${_esc(npcName)}</div>` +
      `<div style="font-size:9px;color:${t.textDim};white-space:pre-wrap;line-height:1.6;padding:8px;background:${t.surfaceHover};border-radius:10px;max-height:120px;overflow-y:auto">${_esc(itemList)}</div>` +
      `<div style="font-size:10px;color:${t.text};margin-top:6px;text-align:right">合计：<span style="color:${t.accent};font-weight:700">${total}</span> 魂币</div>` +
      `<div style="font-size:9px;color:${t.textMuted};margin-top:2px;text-align:right">余额：${coins} → ${coins - total}</div>` +
      `<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-co-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-co-yes">确认送出</button></div>`
    );

    w2.find('#ax-co-no').on('click', () => w2.remove());
    w2.find('#ax-co-yes').on('click', async () => {
      // 扣魂币
      const ok = await _setPlayerCoins(coins - total);
      if (!ok) {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=error 保存失败');
        w2.remove();
        return;
      }

      // 记录每个礼物
      for (const c of cart) {
        const item = shop.find(s => s.id === c.itemId);
        if (!item) continue;
        for (let i = 0; i < c.quantity; i++) {
          _addGift({
            name: item.name,
            emoji: item.emoji,
            rarity: item.rarity || 'R',
            description: item.description || '',
            fromNpc: null,
            toNpc: npcName
          });
        }
        // 在聊天中添加礼物消息
        const safeName = item.name.replace(/[\[\]:]/g, '').trim();
        const safeEmoji = (item.emoji || '🎁').replace(/[\[\]:]/g, '').trim();
        const giftMsg = c.quantity > 1
          ? `[gift:send:${safeEmoji}:${safeName}×${c.quantity}:${item.rarity || 'R'}]`
          : `[gift:send:${safeEmoji}:${safeName}:${item.rarity || 'R'}]`;
        _addMessage(npcName, 'user', giftMsg);
      }

      // 清空购物车
      _clearCart();

      w2.remove();
      w.remove();
      _render();

      if (typeof triggerSlash === 'function') {
        triggerSlash(`/echo severity=success 已送出 ${_getCartCount() || cart.reduce((s, c) => s + c.quantity, 0)} 件礼物给 ${npcName}，花费 ${total} 魂币`);
      }
    });
  }

  async function _generateGiftDialog(npcName) {
    const t = _t();
    const isSend = true;
    const title = `🎁 送礼物给 ${npcName}`;

    const w = _dialog(
      `<div class="ax-dlg-h">${title}</div>` +
      `<div class="ax-dlg-sub">AI会根据当前剧情生成一份合适的礼物</div>` +
      `<div style="text-align:center;padding:16px">` +
      `<div style="font-size:28px;animation:axBlink 1.5s infinite">🎁</div>` +
      `<div style="font-size:9px;color:${t.textMuted};margin-top:6px" id="ax-gift-status">正在构思礼物…</div>` +
      '</div>' +
      '<div id="ax-gift-result" style="display:none"></div>' +
      '<div class="ax-dlg-err" id="ax-gift-err"></div>' +
      '<div class="ax-dlg-actions" id="ax-gift-actions" style="display:none">' +
      '<button class="ax-dlg-btn ax-dlg-cancel" id="ax-gift-cancel">取消</button>' +
      '<button class="ax-dlg-btn ax-dlg-ok" id="ax-gift-accept">接受礼物</button>' +
      '</div>'
    );

    try {
      const context = _getContextSummary();
      const personality = _getNpcPersonality(npcName);

      let playerName = '玩家';
      try { if (typeof getContext === 'function') { const ctx = getContext(); if (ctx.name1) playerName = ctx.name1; } } catch (e) { }

      const senderName = isSend ? playerName : npcName;
      const receiverName = isSend ? npcName : playerName;

      const msgs = [
        {
          role: 'system',
          content: `你是一个礼物生成器。根据以下世界观和角色信息，生成一份${senderName}送给${receiverName}的礼物。

角色"${npcName}"的性格：${personality.personality}

当前世界信息：
${context.slice(0, 3000)}

要求：
1. 礼物要符合当前世界观和剧情
2. 考虑送礼人和收礼人的关系
3. 必须严格按照以下JSON格式回复。只输出一个JSON对象，不要有其他文字、不要有代码块标记、不要有换行前的解释。
4. 礼物名称禁止使用书名号《》或任何括号，直接写名字即可，不超过12个字。
5. 格式：{"name":"礼物名称","emoji":"单个emoji","rarity":"R或SR或SSR或SSS","description":"15-40字描述"}
6. 示例：{"name":"暗影匕首","emoji":"🗡️","rarity":"SR","description":"刀刃泛着幽蓝光芒的匕首，据说能斩断看不见的丝线。"}
`
        },
        { role: 'user', content: `请生成${senderName}送给${receiverName}的礼物` }
      ];

      const reply = await _callAuxApi(msgs, { temperature: 0.9, max_tokens: 3000 });

      // 解析JSON（增强容错）
      let giftData;
      try {
        // 先清理回复中的markdown代码块标记
        let cleanReply = reply.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

        try {
          giftData = JSON.parse(cleanReply);
        } catch (e1) {
          // 尝试提取JSON对象（贪婪匹配最后一个}）
          const jsonMatch = cleanReply.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              giftData = JSON.parse(jsonMatch[0]);
            } catch (e2) {
              // 尝试手动修复常见问题（中文引号等）
              let fixed = jsonMatch[0]
                .replace(/[""]/g, '"')
                .replace(/['']/g, "'")
                .replace(/，/g, ',')
                .replace(/：/g, ':');
              giftData = JSON.parse(fixed);
            }
          } else {
            const nameMatch = cleanReply.match(/name["\s:：]+[""]?([^"",，}]+)/i);
            const emojiMatch = cleanReply.match(/emoji["\s:：]+[""]?([^"",，}]+)/i);
            const rarityMatch = cleanReply.match(/rarity["\s:：]+[""]?(SSS|SSR|SR|R)/i);
            const descMatch = cleanReply.match(/description["\s:：]+[""]?([^""}]+)/i);
            if (nameMatch) {
              giftData = {
                name: nameMatch[1].trim(),
                emoji: emojiMatch ? emojiMatch[1].trim() : '🎁',
                rarity: rarityMatch ? rarityMatch[1].trim().toUpperCase() : 'R',
                description: descMatch ? descMatch[1].trim() : ''
              };
            } else {
              throw new Error('无法解析礼物数据');
            }
          }
        }
      } catch (e) {
        throw new Error('无法解析礼物数据：' + (e.message || '格式异常'));
      }

      if (!giftData || !giftData.name) throw new Error('礼物数据不完整');
      // 清理和规范化
      giftData.name = String(giftData.name).replace(/[《》「」『』【】\[\]]/g, '').trim().slice(0, 30);
      giftData.emoji = String(giftData.emoji || '🎁').trim().slice(0, 4);
      giftData.rarity = (['SSS', 'SSR', 'SR', 'R'].includes(String(giftData.rarity).toUpperCase())) ? String(giftData.rarity).toUpperCase() : 'R';
      giftData.description = String(giftData.description || '').trim().slice(0, 100);

      // 显示结果
      const rarityColor = { SSS: t.sss, SSR: t.ssr, SR: t.sr, R: t.text }[giftData.rarity] || t.textDim;
      $('#ax-gift-status').text('礼物已生成！');
      $('#ax-gift-result').html(
        `<div style="text-align:center;padding:12px;background:${t.surfaceHover};border-radius:12px;margin:8px 0">` +
        `<div style="font-size:36px;margin-bottom:6px">${giftData.emoji || '🎁'}</div>` +
        `<div style="font-size:13px;font-weight:600;color:${t.text}">${_esc(giftData.name)}</div>` +
        `<div style="font-size:8px;color:${rarityColor};font-weight:600;margin:3px 0">[${giftData.rarity || 'R'}]</div>` +
        `<div style="font-size:9px;color:${t.textDim};margin-top:4px;line-height:1.5">${_esc(giftData.description || '')}</div>` +
        '</div>'
      ).show();
      $('#ax-gift-actions').show();

      // 接受礼物
      $('#ax-gift-accept').on('click', () => {
        const gift = {
          name: giftData.name,
          emoji: giftData.emoji || '🎁',
          rarity: giftData.rarity || 'R',
          description: giftData.description || '',
          fromNpc: isSend ? null : npcName,
          toNpc: isSend ? npcName : null
        };
        _addGift(gift);

        // 在聊天中显示礼物消息
        // 清理礼物名称中可能破坏格式的字符
        const safeName = String(giftData.name).replace(/[\[\]:]/g, '').trim() || '神秘礼物';
        const safeEmoji = String(giftData.emoji || '🎁').replace(/[\[\]:]/g, '').trim() || '🎁';
        const safeRarity = (['SSS', 'SSR', 'SR', 'R'].includes(giftData.rarity)) ? giftData.rarity : 'R';
        const giftMsg = `[gift:${isSend ? 'send' : 'recv'}:${safeEmoji}:${safeName}:${safeRarity}]`;
        _addMessage(npcName, isSend ? 'user' : 'assistant', giftMsg);

        w.remove();
        _render();
        if (typeof triggerSlash === 'function') {
          const msg = isSend ? `已将「${giftData.name}」送给 ${npcName}` : `收到 ${npcName} 赠送的「${giftData.name}」`;
          triggerSlash('/echo severity=success ' + msg);
        }
      });

      $('#ax-gift-cancel').on('click', () => {
        w.remove();
        _showGiftPanel(npcName);
      });

    } catch (e) {
      $('#ax-gift-status').text('生成失败');
      $('#ax-gift-err').text(e.message || '未知错误');
      $('#ax-gift-actions').html('<button class="ax-dlg-btn ax-dlg-cancel" id="ax-gift-retry-back">返回</button>').show();
      $('#ax-gift-retry-back').on('click', () => { w.remove(); _showGiftPanel(npcName); });
    }
  }

  /* ═══════════════════════════════════════
     🎮 小游戏系统
     ═══════════════════════════════════════ */
  const MINIGAME_STORAGE_KEY = 'abyss-minigame-data';
  function _loadMinigameData() {
    try { const r = localStorage.getItem(MINIGAME_STORAGE_KEY); if (r) return JSON.parse(r); } catch (e) { }
    return {
      puzzlesSolved: 0,
      totalAttempts: 0,
      rpsWins: 0,
      rpsLosses: 0,
      rpsTies: 0,
      slotSpins: 0,
      slotWins: 0,
      matchBest: 999,
      sanPanicBest: 0,
      sanPanicPlays: 0,
      sanPanicTotalSurvived: 0
    };
  }
  function _saveMinigameData(data) {
    try { localStorage.setItem(MINIGAME_STORAGE_KEY, JSON.stringify(data)); } catch (e) { }
  }

  let _mgTab = 'hub'; // 'hub' | 'password' | 'rps' | 'slot' | 'match'

  function _drawMinigame($c) {
    const t = _t();
    const mgData = _loadMinigameData();

    if (_mgTab === 'rps') { _drawRPS($c); return; }
    if (_mgTab === 'slot') { _drawSlotMachine($c); return; }
    if (_mgTab === 'match') { _drawMatchGame($c); return; }
    if (_mgTab === 'sanpanic') { _drawSanPanic($c); return; }
    if (_mgTab === 'achievements') { _drawAchievements($c); return; }

    // 游戏大厅
    let o = '';

    // 标题
    o += `<div style="text-align:center;padding:12px 0 6px">`;
    o += `<div style="font-size:20px;margin-bottom:4px">🎮</div>`;
    o += `<div style="font-size:12px;font-weight:700;color:${t.text};letter-spacing:2px">游 戏 中 心</div>`;
    o += `</div>`;

    // 游戏列表
    const games = [
      { id: 'rps', icon: '✊', name: '猜拳对决', desc: `胜${mgData.rpsWins}/负${mgData.rpsLosses}/平${mgData.rpsTies}`, badge: '' },
      { id: 'slot', icon: '🎰', name: '深渊老虎机', desc: `转了${mgData.slotSpins}次，中了${mgData.slotWins}次`, badge: '' },
      { id: 'match', icon: '🃏', name: '记忆翻牌', desc: mgData.matchBest < 999 ? `最佳：${mgData.matchBest}步` : '挑战你的记忆力', badge: '' },
      { id: 'sanpanic', icon: '😱', name: 'SAN值恐慌', desc: _getSanPanicDesc(mgData), badge: '' },
      { id: 'achievements', icon: '🏆', name: '成就', desc: `已解锁 ${_getUnlockedAchievementCount()} 个`, badge: _hasNewAchievement() ? '!' : '' }
    ];

    for (const g of games) {
      o += `<div class="ax-list-item ax-mg-game" data-game="${g.id}" style="margin-bottom:2px">`;
      o += `<div class="ax-list-ico" style="position:relative">${g.icon}`;
      if (g.badge) o += `<span style="position:absolute;top:-2px;right:-2px;width:12px;height:12px;border-radius:50%;background:${t.badge || t.fail};color:#fff;font-size:7px;display:flex;align-items:center;justify-content:center;font-weight:700">${g.badge}</span>`;
      o += `</div>`;
      o += `<div class="ax-list-body"><div class="ax-list-main">${g.name}</div><div class="ax-list-sub">${g.desc}</div></div>`;
      o += `<div class="ax-list-end" style="font-size:12px;color:${t.textMuted}">›</div>`;
      o += `</div>`;
    }

    // 统计
    o += `<div style="margin-top:12px;padding:10px;background:${t.surfaceHover};border-radius:12px">`;
    o += `<div style="font-size:8px;color:${t.textMuted};letter-spacing:1px;margin-bottom:4px">📊 游戏统计</div>`;
    o += `<div style="display:flex;gap:8px;flex-wrap:wrap">`;
    o += `<div style="font-size:9px;color:${t.textDim}">✊ 猜拳 <span style="color:${t.accent};font-weight:600">${mgData.rpsWins}胜</span></div>`;
    o += `<div style="font-size:9px;color:${t.textDim}">🎰 老虎机 <span style="color:${t.accent};font-weight:600">${mgData.slotWins}中</span></div>`;
    o += `</div></div>`;

    $c.html(o);

    // 事件
    $c.find('.ax-mg-game').on('click', function () {
      _mgTab = $(this).data('game');
      _drawMinigame($c);
    });
  }

  /* ── ✊ 猜拳对决 ── */
  function _drawRPS($c) {
    const t = _t();
    const mgData = _loadMinigameData();
    const hasApi = !!_getAuxApi();

    let o = '';

    o += `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;margin-bottom:8px">`;
    o += `<span id="ax-mg-back" style="cursor:pointer;font-size:16px;color:${t.primary};padding:0 4px">‹</span>`;
    o += `<span style="font-size:11px;font-weight:600;color:${t.text}">✊ 猜拳对决</span>`;
    o += `<span style="margin-left:auto;font-size:8px;color:${t.textMuted}">${mgData.rpsWins}胜 ${mgData.rpsLosses}负 ${mgData.rpsTies}平</span>`;
    o += `</div>`;

    o += `<div style="text-align:center;padding:20px 0">`;
    o += `<div style="font-size:14px;color:${t.textDim};margin-bottom:12px">选择你的手势：</div>`;
    o += `<div style="display:flex;justify-content:center;gap:16px" id="ax-rps-choices">`;
    const choices = [
      { id: 'rock', emoji: '✊', label: '石头' },
      { id: 'scissors', emoji: '✌️', label: '剪刀' },
      { id: 'paper', emoji: '✋', label: '布' }
    ];
    for (const ch of choices) {
      o += `<div class="ax-rps-btn" data-choice="${ch.id}" style="width:70px;height:70px;border-radius:50%;background:${t.surfaceHover};border:2px solid ${t.border};display:flex;align-items:center;justify-content:center;font-size:32px;cursor:pointer;transition:all .2s;user-select:none" title="${ch.label}">${ch.emoji}</div>`;
    }
    o += `</div>`;
    o += `</div>`;

    // 结果区
    o += `<div id="ax-rps-result" style="text-align:center;min-height:80px"></div>`;

    // 赌注选项
    o += `<div style="text-align:center;margin-top:8px">`;
    o += `<div style="font-size:8px;color:${t.textMuted};margin-bottom:4px">下注魂币（可选）</div>`;
    o += `<div style="display:flex;gap:4px;justify-content:center">`;
    const bets = [0, 10, 30, 50, 100];
    for (const b of bets) {
      o += `<button class="ax-api-btn ax-rps-bet${b === 0 ? ' active' : ''}" data-bet="${b}" style="font-size:8px;padding:3px 8px;${b === 0 ? 'border-color:' + t.primary + ';color:' + t.primary : ''}">${b === 0 ? '免费' : b + '💰'}</button>`;
    }
    o += `</div></div>`;

    $c.html(o);

    let currentBet = 0;

    $c.find('#ax-mg-back').on('click', () => { _mgTab = 'hub'; _drawMinigame($c); });

    // 下注切换
    $c.find('.ax-rps-bet').on('click', function () {
      currentBet = parseInt($(this).data('bet'));
      $c.find('.ax-rps-bet').css({ 'border-color': t.border, 'color': t.textDim });
      $(this).css({ 'border-color': t.primary, 'color': t.primary });
    });

    // 猜拳
    $c.find('.ax-rps-btn').on('click', function () {
      const playerChoice = $(this).data('choice');
      const npcChoice = choices[Math.floor(Math.random() * 3)].id;

      // 禁用按钮
      $c.find('.ax-rps-btn').css('pointer-events', 'none');

      // 判断结果
      let result, resultText, resultColor;
      if (playerChoice === npcChoice) {
        result = 'tie'; resultText = '平局！'; resultColor = t.textDim;
        mgData.rpsTies++;
      } else if (
        (playerChoice === 'rock' && npcChoice === 'scissors') ||
        (playerChoice === 'scissors' && npcChoice === 'paper') ||
        (playerChoice === 'paper' && npcChoice === 'rock')
      ) {
        result = 'win'; resultText = '你赢了！'; resultColor = t.pass;
        mgData.rpsWins++;
      } else {
        result = 'lose'; resultText = '你输了！'; resultColor = t.fail;
        mgData.rpsLosses++;
      }

      // 处理魂币
      let coinMsg = '';
      if (currentBet > 0) {
        const coins = _getPlayerCoins();
        if (result === 'win') {
          _setPlayerCoins(coins + currentBet);
          coinMsg = ` +${currentBet} 💰`;
        } else if (result === 'lose') {
          _setPlayerCoins(Math.max(0, coins - currentBet));
          coinMsg = ` -${currentBet} 💰`;
        }
      }

      _saveMinigameData(mgData);

      const npcEmoji = choices.find(c => c.id === npcChoice).emoji;
      const playerEmoji = choices.find(c => c.id === playerChoice).emoji;

      $('#ax-rps-result').html(
        `<div style="animation:axUp .3s ease">` +
        `<div style="display:flex;justify-content:center;align-items:center;gap:20px;margin-bottom:8px">` +
        `<div style="text-align:center"><div style="font-size:36px">${playerEmoji}</div><div style="font-size:8px;color:${t.textMuted};margin-top:2px">你</div></div>` +
        `<div style="font-size:16px;color:${t.textMuted}">VS</div>` +
        `<div style="text-align:center"><div style="font-size:36px">${npcEmoji}</div><div style="font-size:8px;color:${t.textMuted};margin-top:2px">对手</div></div>` +
        `</div>` +
        `<div style="font-size:14px;font-weight:700;color:${resultColor}">${resultText}${coinMsg}</div>` +
        `</div>`
      );

      // 1.5秒后恢复
      setTimeout(() => {
        $c.find('.ax-rps-btn').css('pointer-events', 'auto');
        // 更新统计显示
        $c.find('.ax-av-header .ax-av-title + *').remove(); // 简单刷新
      }, 1500);
    });
  }

  /* ── 🎰 深渊老虎机 ── */
  function _drawSlotMachine($c) {
    const t = _t();
    const mgData = _loadMinigameData();
    const coins = _getPlayerCoins();

    const SLOT_SYMBOLS = ['💀', '🔥', '💎', '⚔️', '🦇', '👁️', '🌙', '🩸'];
    const SLOT_COST = 20;

    let o = '';

    o += `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;margin-bottom:8px">`;
    o += `<span id="ax-mg-back" style="cursor:pointer;font-size:16px;color:${t.primary};padding:0 4px">‹</span>`;
    o += `<span style="font-size:11px;font-weight:600;color:${t.text}">🎰 深渊老虎机</span>`;
    o += `<span style="margin-left:auto;font-size:9px;color:${t.accent};font-weight:600">💰 ${coins}</span>`;
    o += `</div>`;

    // 老虎机主体
    o += `<div style="text-align:center;padding:16px;background:linear-gradient(135deg,${t.bgCard},${t.bgSection});border-radius:16px;border:2px solid ${t.border};margin-bottom:8px">`;
    o += `<div style="font-size:8px;color:${t.textMuted};letter-spacing:2px;margin-bottom:8px">── 深 渊 老 虎 机 ──</div>`;

    // 三个转轮
    o += `<div style="display:flex;justify-content:center;gap:8px;margin-bottom:12px" id="ax-slot-reels">`;
    for (let i = 0; i < 3; i++) {
      o += `<div style="width:60px;height:60px;border-radius:12px;background:${t.bg};border:2px solid ${t.border};display:flex;align-items:center;justify-content:center;font-size:32px;transition:all .3s" id="ax-slot-reel-${i}">❓</div>`;
    }
    o += `</div>`;

    // 结果区
    o += `<div id="ax-slot-result" style="min-height:24px;margin-bottom:8px"></div>`;

    // 拉杆按钮
    o += `<button class="ax-dlg-btn ax-dlg-ok" id="ax-slot-spin" style="padding:10px 30px;font-size:12px;border-radius:20px" ${coins < SLOT_COST ? 'disabled' : ''}>🎰 投币拉杆 (${SLOT_COST}💰)</button>`;
    o += `</div>`;

    // 赔率表
    o += `<div style="padding:8px;background:${t.surfaceHover};border-radius:10px;font-size:8px;color:${t.textMuted};line-height:1.8">`;
    o += `<div style="font-weight:600;color:${t.textDim};margin-bottom:2px">📋 赔率表</div>`;
    o += `三个相同：×10 (${SLOT_COST * 10}💰)<br>`;
    o += `两个相同：×3 (${SLOT_COST * 3}💰)<br>`;
    o += `全不同：不中<br>`;
    o += `<div style="margin-top:4px">统计：转了 ${mgData.slotSpins} 次，中了 ${mgData.slotWins} 次</div>`;
    o += `</div>`;

    $c.html(o);

    $c.find('#ax-mg-back').on('click', () => { _mgTab = 'hub'; _drawMinigame($c); });

    $c.find('#ax-slot-spin').on('click', async function () {
      const $btn = $(this);
      const curCoins = _getPlayerCoins();
      if (curCoins < SLOT_COST) {
        if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 魂币不足！');
        return;
      }

      // 扣费
      await _setPlayerCoins(curCoins - SLOT_COST);
      $btn.prop('disabled', true).text('转动中…');
      $('#ax-slot-result').html('');

      // 动画效果
      const results = [];
      for (let i = 0; i < 3; i++) {
        results.push(SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]);
      }

      // 逐个停止
      for (let i = 0; i < 3; i++) {
        const $reel = $(`#ax-slot-reel-${i}`);
        // 快速切换动画
        let count = 0;
        const interval = setInterval(() => {
          $reel.text(SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]);
          count++;
          if (count > 8 + i * 4) {
            clearInterval(interval);
            $reel.text(results[i]);
            $reel.css('transform', 'scale(1.1)');
            setTimeout(() => $reel.css('transform', 'scale(1)'), 150);
          }
        }, 80);
        await new Promise(r => setTimeout(r, 300));
      }

      await new Promise(r => setTimeout(r, 500));

      // 判断结果
      mgData.slotSpins++;
      let winAmount = 0;
      let winText = '';

      if (results[0] === results[1] && results[1] === results[2]) {
        // 三个相同
        winAmount = SLOT_COST * 10;
        winText = `🎉 三连！ +${winAmount} 魂币！`;
        mgData.slotWins++;
      } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
        // 两个相同
        winAmount = SLOT_COST * 3;
        winText = `✨ 两连！ +${winAmount} 魂币！`;
        mgData.slotWins++;
      } else {
        winText = '💨 没中，再来一次？';
      }

      if (winAmount > 0) {
        const newCoins = _getPlayerCoins() + winAmount;
        await _setPlayerCoins(newCoins);
      }

      _saveMinigameData(mgData);
      _checkAchievements();

      const resultColor = winAmount > 0 ? t.pass : t.textMuted;
      $('#ax-slot-result').html(`<div style="font-size:11px;font-weight:600;color:${resultColor};animation:axUp .3s ease">${winText}</div>`);

      const finalCoins = _getPlayerCoins();
      $btn.prop('disabled', finalCoins < SLOT_COST).text(`🎰 投币拉杆 (${SLOT_COST}💰)`);
      $c.find('.ax-av-header span:last').text('💰 ' + finalCoins);
    });
  }

  /* ── 🃏 记忆翻牌 ── */
  function _drawMatchGame($c) {
    const t = _t();
    const mgData = _loadMinigameData();

    const MATCH_EMOJIS = ['💀', '🔥', '💎', '⚔️', '🦇', '👁️', '🌙', '🩸'];
    // 4x4 = 16格 = 8对
    let cards = [];
    for (const emoji of MATCH_EMOJIS) {
      cards.push(emoji, emoji);
    }
    // 洗牌
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    let o = '';

    o += `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;margin-bottom:8px">`;
    o += `<span id="ax-mg-back" style="cursor:pointer;font-size:16px;color:${t.primary};padding:0 4px">‹</span>`;
    o += `<span style="font-size:11px;font-weight:600;color:${t.text}">🃏 记忆翻牌</span>`;
    o += `<span style="margin-left:auto;font-size:8px;color:${t.textMuted}">最佳：${mgData.matchBest < 999 ? mgData.matchBest + '步' : '--'}</span>`;
    o += `</div>`;

    // 步数和配对数
    o += `<div style="display:flex;justify-content:center;gap:16px;margin-bottom:8px">`;
    o += `<div style="font-size:9px;color:${t.textDim}">步数：<span id="ax-match-steps" style="color:${t.accent};font-weight:700">0</span></div>`;
    o += `<div style="font-size:9px;color:${t.textDim}">配对：<span id="ax-match-pairs" style="color:${t.accent};font-weight:700">0</span>/8</div>`;
    o += `</div>`;

    // 卡牌网格
    o += `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:4px" id="ax-match-grid">`;
    for (let i = 0; i < cards.length; i++) {
      o += `<div class="ax-match-card" data-idx="${i}" data-emoji="${cards[i]}" style="aspect-ratio:1;border-radius:10px;background:${t.surfaceHover};border:2px solid ${t.border};display:flex;align-items:center;justify-content:center;font-size:22px;cursor:pointer;transition:all .3s;user-select:none">❓</div>`;
    }
    o += `</div>`;

    // 重新开始
    o += `<div style="text-align:center;margin-top:10px">`;
    o += `<button class="ax-api-btn" id="ax-match-restart" style="font-size:9px">🔄 重新开始</button>`;
    o += `</div>`;

    // 结果区
    o += `<div id="ax-match-result" style="text-align:center;margin-top:8px"></div>`;

    $c.html(o);

    $c.find('#ax-mg-back').on('click', () => { _mgTab = 'hub'; _drawMinigame($c); });
    $c.find('#ax-match-restart').on('click', () => _drawMatchGame($c));

    // 游戏逻辑
    let flipped = [];
    let matched = new Set();
    let steps = 0;
    let pairs = 0;
    let locked = false;

    $c.find('.ax-match-card').on('click', function () {
      if (locked) return;
      const idx = parseInt($(this).data('idx'));
      if (matched.has(idx) || flipped.includes(idx)) return;

      // 翻开
      const emoji = $(this).data('emoji');
      $(this).text(emoji).css({ 'background': t.surfaceActive, 'border-color': t.accent });
      flipped.push(idx);

      if (flipped.length === 2) {
        steps++;
        $('#ax-match-steps').text(steps);
        locked = true;

        const [i1, i2] = flipped;
        const e1 = $(`.ax-match-card[data-idx="${i1}"]`).data('emoji');
        const e2 = $(`.ax-match-card[data-idx="${i2}"]`).data('emoji');

        if (e1 === e2) {
          // 配对成功
          matched.add(i1);
          matched.add(i2);
          pairs++;
          $('#ax-match-pairs').text(pairs);

          $(`.ax-match-card[data-idx="${i1}"]`).css({ 'border-color': t.pass, 'opacity': '.7' });
          $(`.ax-match-card[data-idx="${i2}"]`).css({ 'border-color': t.pass, 'opacity': '.7' });

          flipped = [];
          locked = false;

          // 全部配对完成
          if (pairs === 8) {
            if (steps < mgData.matchBest) {
              mgData.matchBest = steps;
              _saveMinigameData(mgData);
            }
            // 奖励
            const reward = Math.max(5, 30 - steps);
            const curCoins = _getPlayerCoins();
            _setPlayerCoins(curCoins + reward);
            _saveMinigameData(mgData);
            _checkAchievements();

            $('#ax-match-result').html(`<div style="font-size:12px;font-weight:700;color:${t.pass};animation:axUp .3s ease">🎉 完成！${steps}步 · +${reward}💰${steps <= mgData.matchBest ? ' · 新纪录！' : ''}</div>`);
            if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success 翻牌完成！${steps}步，奖励 ${reward} 魂币`);
          }
        } else {
          // 不配对 - 翻回
          setTimeout(() => {
            $(`.ax-match-card[data-idx="${i1}"]`).text('❓').css({ 'background': t.surfaceHover, 'border-color': t.border });
            $(`.ax-match-card[data-idx="${i2}"]`).text('❓').css({ 'background': t.surfaceHover, 'border-color': t.border });
            flipped = [];
            locked = false;
          }, 700);
        }
      }
    });
  }

  /* ── 😱 SAN值恐慌小游戏 ── */
  function _getSanPanicDesc(mgData) {
    if (mgData.sanPanicPlays === 0) return '在恐怖中保持清醒';
    return `玩了${mgData.sanPanicPlays}次，最佳${mgData.sanPanicBest}秒`;
  }

  function _drawSanPanic($c) {
    const t = _t();
    const mgData = _loadMinigameData();

    let o = '';

    o += `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;margin-bottom:8px">`;
    o += `<span id="ax-mg-back" style="cursor:pointer;font-size:16px;color:${t.primary};padding:0 4px">‹</span>`;
    o += `<span style="font-size:11px;font-weight:600;color:${t.text}">😱 SAN值恐慌</span>`;
    o += `<span style="margin-left:auto;font-size:8px;color:${t.textMuted}">最佳：${mgData.sanPanicBest || '--'}秒</span>`;
    o += `</div>`;

    // 说明
    o += `<div style="text-align:center;padding:12px;background:${t.surfaceHover};border-radius:12px;margin-bottom:10px">`;
    o += `<div style="font-size:9px;color:${t.textDim};line-height:1.6">`;
    o += `当你的SAN值急剧下降时，恐怖幻象会充斥你的视野。<br>`;
    o += `<span style="color:${t.accent};font-weight:600">在混乱中快速点击所有👁️眼睛来维持清醒！</span><br>`;
    o += `坚持的时间越久，奖励越多。`;
    o += `</div></div>`;

    // 难度选择
    o += `<div style="display:flex;gap:6px;margin-bottom:10px">`;
    const diffs = [
      { id: 'easy', label: '😰 轻度', speed: 2000, spawn: 3, desc: '3个目标，较慢' },
      { id: 'normal', label: '😱 中度', speed: 1400, spawn: 5, desc: '5个目标，正常' },
      { id: 'hard', label: '🤯 重度', speed: 900, spawn: 7, desc: '7个目标，极快' }
    ];
    for (const d of diffs) {
      o += `<div class="ax-san-diff" data-diff="${d.id}" data-speed="${d.speed}" data-spawn="${d.spawn}" style="flex:1;text-align:center;padding:10px 4px;border-radius:10px;background:${t.surfaceHover};border:1.5px solid ${t.border};cursor:pointer;transition:all .2s">`;
      o += `<div style="font-size:14px;margin-bottom:2px">${d.label}</div>`;
      o += `<div style="font-size:7px;color:${t.textMuted}">${d.desc}</div>`;
      o += `</div>`;
    }
    o += `</div>`;

    // 游戏区域（初始隐藏）
    o += `<div id="ax-san-game" style="display:none">`;
    o += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">`;
    o += `<div style="font-size:9px;color:${t.textDim}">⏱ <span id="ax-san-timer" style="color:${t.accent};font-weight:700;font-family:'Courier New',monospace">0.0</span>秒</div>`;
    o += `<div style="font-size:9px;color:${t.textDim}">SAN <span id="ax-san-bar-text" style="color:${t.sanHigh};font-weight:700">100</span></div>`;
    o += `</div>`;
    // SAN条
    o += `<div style="height:6px;background:${t.trackBg};border-radius:3px;overflow:hidden;margin-bottom:8px">`;
    o += `<div id="ax-san-bar-fill" style="height:100%;width:100%;background:${t.sanHigh};border-radius:3px;transition:width .3s,background .3s"></div>`;
    o += `</div>`;
    // 游戏场
    o += `<div id="ax-san-field" style="position:relative;width:100%;height:220px;border-radius:14px;background:${t.bgCard};border:1px solid ${t.border};overflow:hidden">`;
    o += `</div>`;
    o += `</div>`;

    // 结果区
    o += `<div id="ax-san-result" style="margin-top:8px"></div>`;

    // 统计
    o += `<div style="margin-top:10px;padding:8px;background:${t.surfaceHover};border-radius:10px;font-size:8px;color:${t.textMuted}">`;
    o += `📊 已玩 ${mgData.sanPanicPlays} 次 · 最佳 ${mgData.sanPanicBest || '--'}秒 · 累计存活 ${mgData.sanPanicTotalSurvived || 0}秒`;
    o += `</div>`;

    $c.html(o);

    $c.find('#ax-mg-back').on('click', () => { _mgTab = 'hub'; _drawMinigame($c); });

    // 难度选择
    $c.find('.ax-san-diff').on('click', function () {
      const speed = parseInt($(this).data('speed'));
      const spawn = parseInt($(this).data('spawn'));
      $c.find('.ax-san-diff').css({ borderColor: t.border });
      $(this).css({ borderColor: t.primary });
      _startSanPanic($c, speed, spawn);
    });
  }

  function _startSanPanic($c, spawnInterval, maxTargets) {
    const t = _t();
    const $game = $('#ax-san-game');
    const $field = $('#ax-san-field');
    const $timer = $('#ax-san-timer');
    const $barText = $('#ax-san-bar-text');
    const $barFill = $('#ax-san-bar-fill');
    const $result = $('#ax-san-result');

    $game.show();
    $result.html('');
    $field.html('');

    let san = 100;
    let startTime = Date.now();
    let alive = true;
    let spawnTimer = null;
    let tickTimer = null;
    let targetCount = 0;

    // 恐怖符号池
    const horrorSymbols = ['👁️', '👁', '🕷️', '🦇', '💀', '☠️', '👻', '🩸', '🕳️', '😈'];
    const targetSymbol = '👁️';

    function getFieldSize() {
      return { w: $field.width(), h: $field.height() };
    }

    function spawnTarget() {
      if (!alive) return;
      const fs = getFieldSize();
      if (fs.w < 10 || fs.h < 10) return;

      // 清除超时的旧目标
      $field.find('.ax-san-target').each(function () {
        const age = Date.now() - parseInt($(this).data('born'));
        if (age > spawnInterval * 1.8) {
          $(this).remove();
          san = Math.max(0, san - 8);
        }
      });

      // 生成干扰物
      if (Math.random() < 0.4) {
        const dx = Math.random() * (fs.w - 30);
        const dy = Math.random() * (fs.h - 30);
        const sym = horrorSymbols[Math.floor(Math.random() * horrorSymbols.length)];
        const $decoy = $(`<div style="position:absolute;left:${dx}px;top:${dy}px;font-size:${16 + Math.random() * 12}px;opacity:${0.15 + Math.random() * 0.3};pointer-events:none;transition:opacity .5s;user-select:none">${sym}</div>`);
        $field.append($decoy);
        setTimeout(() => $decoy.remove(), spawnInterval * 1.5);
      }

      // 当前场上目标数量限制
      if ($field.find('.ax-san-target').length >= maxTargets) return;

      const x = 10 + Math.random() * (fs.w - 40);
      const y = 10 + Math.random() * (fs.h - 40);
      const size = 22 + Math.floor(Math.random() * 10);
      targetCount++;

      const $t = $(`<div class="ax-san-target" data-born="${Date.now()}" style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-size:${size - 4}px;cursor:pointer;user-select:none;animation:axBlink .8s infinite;z-index:5;border-radius:50%;transition:transform .15s">${targetSymbol}</div>`);

      $t.on('click', function (e) {
        e.stopPropagation();
        if (!alive) return;
        san = Math.min(100, san + 5);
        $(this).css({ transform: 'scale(0)', opacity: '0' });
        setTimeout(() => $(this).remove(), 150);
        // 奖励提示
        const $plus = $(`<div style="position:absolute;left:${x}px;top:${y - 10}px;font-size:10px;color:${t.pass};font-weight:700;pointer-events:none;animation:axUp .4s ease forwards;z-index:10">+5</div>`);
        $field.append($plus);
        setTimeout(() => $plus.remove(), 500);
      });

      $field.append($t);

      // 目标超时惩罚
      setTimeout(() => {
        if ($t.parent().length && alive) {
          san = Math.max(0, san - 12);
          $t.css({ color: t.fail, transform: 'scale(1.3)' });
          setTimeout(() => $t.remove(), 200);
        }
      }, spawnInterval * 1.6);
    }

    // 点击空白区域惩罚
    $field.on('click', function (e) {
      if (!alive) return;
      if ($(e.target).hasClass('ax-san-target')) return;
      san = Math.max(0, san - 6);
      const $miss = $(`<div style="position:absolute;left:${e.offsetX}px;top:${e.offsetY - 10}px;font-size:9px;color:${t.fail};font-weight:700;pointer-events:none;animation:axUp .3s ease forwards;z-index:10">-6</div>`);
      $field.append($miss);
      setTimeout(() => $miss.remove(), 400);
    });

    // SAN自然下降 + 显示更新
    tickTimer = setInterval(() => {
      if (!alive) return;
      san = Math.max(0, san - 1.5);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      $timer.text(elapsed);
      $barText.text(Math.round(san));
      $barFill.css('width', san + '%');

      // 颜色变化
      if (san > 60) {
        $barFill.css('background', t.sanHigh);
        $barText.css('color', t.sanHigh);
      } else if (san > 30) {
        $barFill.css('background', t.sanMid);
        $barText.css('color', t.sanMid);
        $field.css('background', `rgba(${t.primaryRgb},.05)`);
      } else {
        $barFill.css('background', t.sanLow);
        $barText.css('color', t.sanLow);
        $field.css('background', `rgba(${t.primaryRgb},.12)`);
      }

      if (san <= 0) {
        alive = false;
        clearInterval(spawnTimer);
        clearInterval(tickTimer);
        _endSanPanic($c, parseFloat(elapsed));
      }
    }, 200);

    // 目标生成
    spawnTimer = setInterval(spawnTarget, spawnInterval);
    // 首个目标立即生成
    setTimeout(spawnTarget, 300);
  }

  function _endSanPanic($c, survived) {
    const t = _t();
    const mgData = _loadMinigameData();
    mgData.sanPanicPlays++;
    mgData.sanPanicTotalSurvived = (mgData.sanPanicTotalSurvived || 0) + Math.round(survived);
    const isNewBest = survived > (mgData.sanPanicBest || 0);
    if (isNewBest) mgData.sanPanicBest = Math.round(survived * 10) / 10;

    // 奖励：每5秒1魂币
    const reward = Math.max(1, Math.floor(survived / 5));
    const coins = _getPlayerCoins();
    _setPlayerCoins(coins + reward);

    _saveMinigameData(mgData);

    // 检查成就
    _checkAchievements();

    const $result = $('#ax-san-result');
    $result.html(
      `<div style="text-align:center;padding:14px;background:${t.surfaceHover};border-radius:12px;animation:axUp .3s ease">` +
      `<div style="font-size:24px;margin-bottom:4px">💀</div>` +
      `<div style="font-size:12px;font-weight:700;color:${t.fail};margin-bottom:4px">精神崩溃！</div>` +
      `<div style="font-size:10px;color:${t.textDim}">坚持了 <span style="color:${t.accent};font-weight:700">${survived}</span> 秒</div>` +
      `<div style="font-size:9px;color:${t.textMuted};margin-top:4px">+${reward} 💰${isNewBest ? ' · 🎉 新纪录！' : ''}</div>` +
      `<button class="ax-dlg-btn ax-dlg-ok" id="ax-san-retry" style="margin-top:8px;padding:6px 20px;font-size:10px">再来一次</button>` +
      `</div>`
    );

    $result.find('#ax-san-retry').on('click', () => {
      _drawSanPanic($c);
    });

    if (typeof triggerSlash === 'function') {
      triggerSlash(`/echo severity=${isNewBest ? 'success' : 'info'} SAN值归零！坚持了${survived}秒，+${reward}魂币${isNewBest ? '（新纪录！）' : ''}`);
    }
  }

  /* ── 🏆 成就系统 ── */
  const ACHIEVEMENT_STORAGE_KEY = 'abyss-achievements';

  // 成就定义
  const ACHIEVEMENTS = [
    // 小游戏相关
    { id: 'rps_win5', icon: '✊', name: '猜拳新手', desc: '猜拳胜利5次', check: (mg) => mg.rpsWins >= 5 },
    { id: 'rps_win20', icon: '🤜', name: '猜拳达人', desc: '猜拳胜利20次', check: (mg) => mg.rpsWins >= 20 },
    { id: 'slot_first', icon: '🎰', name: '初试手气', desc: '第一次玩老虎机', check: (mg) => mg.slotSpins >= 1 },
    { id: 'slot_jackpot', icon: '💰', name: '深渊幸运儿', desc: '老虎机中奖10次', check: (mg) => mg.slotWins >= 10 },
    { id: 'match_perfect', icon: '🃏', name: '过目不忘', desc: '记忆翻牌20步以内完成', check: (mg) => mg.matchBest <= 20 && mg.matchBest < 999 },
    { id: 'match_god', icon: '🧠', name: '记忆之神', desc: '记忆翻牌12步以内完成', check: (mg) => mg.matchBest <= 12 && mg.matchBest < 999 },
    { id: 'san_survive10', icon: '😰', name: '精神坚韧', desc: 'SAN值恐慌存活10秒', check: (mg) => (mg.sanPanicBest || 0) >= 10 },
    { id: 'san_survive30', icon: '😱', name: '深渊凝视者', desc: 'SAN值恐慌存活30秒', check: (mg) => (mg.sanPanicBest || 0) >= 30 },
    { id: 'san_survive60', icon: '🤯', name: '疯狂边缘', desc: 'SAN值恐慌存活60秒', check: (mg) => (mg.sanPanicBest || 0) >= 60 },
    // 社交相关
    { id: 'first_friend', icon: '🤝', name: '初识', desc: '拥有第一个好友', check: () => _getFriendList().length >= 1 },
    { id: 'social_butterfly', icon: '🦋', name: '社交蝴蝶', desc: '拥有3个好友', check: () => _getFriendList().length >= 3 },
    { id: 'gift_giver', icon: '🎁', name: '慷慨之人', desc: '送出第一份礼物', check: () => _loadGifts().filter(g => g.toNpc).length >= 1 },
    { id: 'gift_hoarder', icon: '🎀', name: '礼物收藏家', desc: '送出或收到20份礼物', check: () => _loadGifts().length >= 20 },
    // 内容相关
    { id: 'first_post', icon: '📝', name: '初次发帖', desc: '在论坛发表第一个帖子', check: () => _loadForumPosts().some(p => p.authorId && p.authorId.startsWith('fa_')) },
    { id: 'music_lover', icon: '🎵', name: '音乐爱好者', desc: '收藏5首歌曲', check: () => _loadRadioFavorites().length >= 5 },
    { id: 'photographer', icon: '📸', name: '深渊摄影师', desc: '相册中存有10张照片', check: () => _loadAlbum().length >= 10 },
    { id: 'note_taker', icon: '📓', name: '勤奋记录者', desc: '写了5篇笔记', check: () => _loadNotes().length >= 5 },
    // 经济相关
    { id: 'rich_100', icon: '💎', name: '小有积蓄', desc: '拥有100魂币', check: () => _getPlayerCoins() >= 100 },
    { id: 'rich_1000', icon: '👑', name: '深渊富豪', desc: '拥有1000魂币', check: () => _getPlayerCoins() >= 1000 },
    // 隐藏/彩蛋成就
    { id: 'blocked_someone', icon: '🚫', name: '断绝关系', desc: '拉黑了一个NPC', hidden: true, check: () => _getBlockedList().length >= 1 },
    { id: 'all_themes', icon: '🎨', name: '调色板', desc: '尝试过所有主题', hidden: true, check: () => { try { const h = JSON.parse(localStorage.getItem('abyss-theme-history') || '[]'); return h.length >= THEME_KEYS.length; } catch (e) { return false; } } }
  ];

  function _loadAchievements() {
    try {
      const raw = localStorage.getItem(ACHIEVEMENT_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return { unlocked: {}, lastChecked: 0, newUnlocks: [] };
    // unlocked: { achievementId: timestamp }
    // newUnlocks: [id, id, ...] 尚未查看的新成就
  }
  function _saveAchievements(data) {
    try { localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(data)); } catch (e) { }
  }

  function _getUnlockedAchievementCount() {
    return Object.keys(_loadAchievements().unlocked).length;
  }

  function _hasNewAchievement() {
    const data = _loadAchievements();
    return data.newUnlocks && data.newUnlocks.length > 0;
  }

  function _checkAchievements() {
    const data = _loadAchievements();
    const mgData = _loadMinigameData();
    let newCount = 0;

    for (const ach of ACHIEVEMENTS) {
      if (data.unlocked[ach.id]) continue;
      try {
        if (ach.check(mgData)) {
          data.unlocked[ach.id] = Date.now();
          if (!data.newUnlocks) data.newUnlocks = [];
          data.newUnlocks.push(ach.id);
          newCount++;

          // 成就奖励：每个成就给20魂币
          const coins = _getPlayerCoins();
          _setPlayerCoins(coins + 20);

          if (typeof triggerSlash === 'function') {
            triggerSlash(`/echo severity=success 🏆 成就解锁：${ach.icon} ${ach.name}！+20💰`);
          }
        }
      } catch (e) { }
    }

    if (newCount > 0) {
      data.lastChecked = Date.now();
      _saveAchievements(data);
    }
  }

  // 记录主题切换历史（用于"调色板"成就）
  const _origApplyTheme = _applyTheme;
  // 注：由于_applyTheme已存在，我们在主题切换时额外记录
  function _recordThemeUsage(k) {
    try {
      let h = JSON.parse(localStorage.getItem('abyss-theme-history') || '[]');
      if (!h.includes(k)) { h.push(k); localStorage.setItem('abyss-theme-history', JSON.stringify(h)); }
    } catch (e) { }
  }

  function _drawAchievements($c) {
    const t = _t();
    const data = _loadAchievements();
    const mgData = _loadMinigameData();

    // 先检查一遍成就
    _checkAchievements();

    // 清除新解锁标记
    if (data.newUnlocks && data.newUnlocks.length) {
      data.newUnlocks = [];
      _saveAchievements(data);
    }

    const totalUnlocked = Object.keys(data.unlocked).length;
    const totalAchievements = ACHIEVEMENTS.length;

    let o = '';

    o += `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;margin-bottom:8px">`;
    o += `<span id="ax-mg-back" style="cursor:pointer;font-size:16px;color:${t.primary};padding:0 4px">‹</span>`;
    o += `<span style="font-size:11px;font-weight:600;color:${t.text}">🏆 成就</span>`;
    o += `<span style="margin-left:auto;font-size:9px;color:${t.accent};font-weight:600">${totalUnlocked}/${totalAchievements}</span>`;
    o += `</div>`;

    // 进度条
    const pct = totalAchievements > 0 ? (totalUnlocked / totalAchievements * 100).toFixed(0) : 0;
    o += `<div style="margin-bottom:10px">`;
    o += `<div style="height:6px;background:${t.trackBg};border-radius:3px;overflow:hidden">`;
    o += `<div style="height:100%;width:${pct}%;background:${t.accent};border-radius:3px;transition:width .5s"></div>`;
    o += `</div>`;
    o += `<div style="text-align:center;font-size:8px;color:${t.textMuted};margin-top:2px">${pct}% 完成</div>`;
    o += `</div>`;

    // 分组显示
    const categories = [
      { label: '🎮 小游戏', filter: a => ['first_puzzle', 'puzzle_master', 'rps_win5', 'rps_win20', 'slot_first', 'slot_jackpot', 'match_perfect', 'match_god', 'san_survive10', 'san_survive30', 'san_survive60'].includes(a.id) },
      { label: '👥 社交', filter: a => ['first_friend', 'social_butterfly', 'gift_giver', 'gift_hoarder'].includes(a.id) },
      { label: '📱 内容', filter: a => ['first_post', 'music_lover', 'photographer', 'note_taker'].includes(a.id) },
      { label: '💰 经济', filter: a => ['rich_100', 'rich_1000'].includes(a.id) },
      { label: '🔮 隐藏', filter: a => a.hidden }
    ];

    for (const cat of categories) {
      const catAchs = ACHIEVEMENTS.filter(cat.filter);
      if (!catAchs.length) continue;

      o += `<div style="font-size:9px;color:${t.textDim};letter-spacing:1px;margin:8px 0 4px;padding-bottom:2px;border-bottom:1px solid ${t.divider}">${cat.label}</div>`;

      for (const ach of catAchs) {
        const isUnlocked = !!data.unlocked[ach.id];
        const isHidden = ach.hidden && !isUnlocked;

        o += `<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:10px;margin-bottom:2px;${isUnlocked ? '' : 'opacity:.5'}">`;
        o += `<span style="font-size:20px;width:28px;text-align:center;${isUnlocked ? '' : 'filter:grayscale(1)'}">${isHidden ? '❓' : ach.icon}</span>`;
        o += `<div style="flex:1;min-width:0">`;
        o += `<div style="font-size:10px;color:${isUnlocked ? t.text : t.textMuted};font-weight:${isUnlocked ? '600' : '400'}">${isHidden ? '???' : ach.name}</div>`;
        o += `<div style="font-size:8px;color:${t.textMuted}">${isHidden ? '隐藏成就' : ach.desc}</div>`;
        o += `</div>`;
        if (isUnlocked) {
          o += `<span style="font-size:10px;color:${t.pass}">✓</span>`;
        }
        o += `</div>`;
      }
    }

    $c.html(o);
    $c.find('#ax-mg-back').on('click', () => { _mgTab = 'hub'; _drawMinigame($c); });
  }

  // 全局接口：外部触发成就检查
  window.AbyssAchievements = {
    check: _checkAchievements,
    getCount: _getUnlockedAchievementCount,
    hasNew: _hasNewAchievement
  };

  /* ═══════════════════════════════════════
 NPC特殊互动处理（自动转账、自动送礼）
 ═══════════════════════════════════════ */
  async function _processNpcSpecialActions(npcName, reply) {
    if (!reply) return null;

    // ★ 新增：检测拉黑指令：[action:block:原因]
    const blockMatch = reply.match(/\[action:block:([^\]]+)\]/);
    if (blockMatch) {
      const reason = blockMatch[1].trim();
      const playerName = _getPlayerName();
      _blockUser(npcName, `${npcName}将你拉黑：${reason}`);
      // 返回一个对象表示已执行拉黑
      return { blocked: true, reason: reason };
    }

    // 检测转账指令：[npc-transfer:金额:备注]
    const transferMatch = reply.match(/\[npc-transfer:(\d+):([^\]]+)\]/);
    if (transferMatch) {
      const amount = parseInt(transferMatch[1]);
      const note = transferMatch[2].trim();
      if (amount > 0 && amount <= 5000) {
        try {
          const coins = _getPlayerCoins();
          const ok = await _setPlayerCoins(coins + amount);
          if (ok) {
            // 添加一条转账消息记录
            _addMessage(npcName, 'assistant', `[transfer:recv:${amount}:${note}]`);
            if (typeof triggerSlash === 'function') {
              triggerSlash(`/echo severity=success ${npcName} 给你转了 ${amount} 魂币：${note}`);
            }
          }
        } catch (e) {
          console.warn('[Abyss] NPC transfer fail:', e);
        }
      }
    }

    // 检测礼物指令：[npc-gift]
    const giftMatch = reply.match(/\[npc-gift\]/);
    if (giftMatch) {
      try {
        await _generateNpcGift(npcName);
      } catch (e) {
        console.warn('[Abyss] NPC gift fail:', e);
      }
    }
    // 检测音乐分享指令：[music:歌名:歌手:留言]
    const musicMatch2 = reply.match(/\[music:([^:]*):([^:]*):([^\]]*)\]/);
    if (musicMatch2) {
    }
  }

  /* ── NPC自动生成并赠送礼物 ── */
  async function _generateNpcGift(npcName) {
    const api = _getAuxApi();
    if (!api) return;

    const context = _getContextSummary();
    const personality = _getNpcPersonality(npcName);

    let playerName = '玩家';
    try {
      if (typeof getContext === 'function') {
        const ctx = getContext();
        if (ctx.name1) playerName = ctx.name1;
      }
    } catch (e) { }

    const msgs = [
      {
        role: 'system',
        content: `你是一个礼物生成器。${npcName}想送一份礼物给${playerName}。

角色"${npcName}"的性格：${personality.personality}

当前世界信息：
${context.slice(0, 2000)}

要求：
1. 礼物要符合当前世界观和剧情
2. 符合${npcName}的性格特点
3. 礼物名称禁止使用书名号或任何括号，直接写名字，不超过12个字
4. 必须严格按照以下JSON格式回复，只输出JSON，不要有其他文字：
{"name":"礼物名称","emoji":"单个emoji","rarity":"R或SR或SSR或SSS","description":"15-40字描述"}
5. 示例：{"name":"暗影匕首","emoji":"🗡️","rarity":"SR","description":"刀刃泛着幽蓝光芒的匕首，据说能斩断看不见的丝线。"}`
      },
      { role: 'user', content: `请生成${npcName}送给${playerName}的礼物` }
    ];

    try {
      const reply = await _callApi(msgs, { temperature: 0.9, max_tokens: 3000 });

      // 解析JSON（增强容错）
      let giftData;
      let cleanReply = reply.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

      try {
        giftData = JSON.parse(cleanReply);
      } catch (e1) {
        const jsonMatch = cleanReply.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            giftData = JSON.parse(jsonMatch[0]);
          } catch (e2) {
            let fixed = jsonMatch[0]
              .replace(/[""]/g, '"')
              .replace(/['']/g, "'")
              .replace(/，/g, ',')
              .replace(/：/g, ':');
            giftData = JSON.parse(fixed);
          }
        } else {
          // 后备正则提取
          const nameMatch = cleanReply.match(/name\s*[":：]+\s*"?([^",，}\n]+)/i);
          const emojiMatch = cleanReply.match(/emoji\s*[":：]+\s*"?([^",，}\n]{1,4})/i);
          const rarityMatch = cleanReply.match(/rarity\s*[":：]+\s*"?(SSS|SSR|SR|R)/i);
          const descMatch = cleanReply.match(/description\s*[":：]+\s*"?([^"}\n]+)/i);
          if (nameMatch) {
            giftData = {
              name: nameMatch[1].trim(),
              emoji: emojiMatch ? emojiMatch[1].trim() : '🎁',
              rarity: rarityMatch ? rarityMatch[1].trim().toUpperCase() : 'R',
              description: descMatch ? descMatch[1].trim() : ''
            };
          } else {
            console.warn('[Abyss] Cannot parse NPC gift data');
            return;
          }
        }
      }

      if (!giftData || !giftData.name) return;

      // 清理数据
      giftData.name = String(giftData.name).replace(/[《》「」『』【】\[\]:]/g, '').trim().slice(0, 30) || '神秘礼物';
      giftData.emoji = String(giftData.emoji || '🎁').replace(/[\[\]:]/g, '').trim().slice(0, 4) || '🎁';
      giftData.rarity = (['SSS', 'SSR', 'SR', 'R'].includes(String(giftData.rarity).toUpperCase())) ? String(giftData.rarity).toUpperCase() : 'R';
      giftData.description = String(giftData.description || '').trim().slice(0, 100);

      // 保存礼物记录
      _addGift({
        name: giftData.name,
        emoji: giftData.emoji,
        rarity: giftData.rarity,
        description: giftData.description,
        fromNpc: npcName,
        toNpc: null
      });

      // 添加礼物消息到聊天记录
      const safeName = String(giftData.name).replace(/[\[\]:]/g, '').trim();
      const safeEmoji = String(giftData.emoji).replace(/[\[\]:]/g, '').trim();
      const safeRarity = giftData.rarity;
      const giftMsg = `[gift:recv:${safeEmoji}:${safeName}:${safeRarity}]`;
      _addMessage(npcName, 'assistant', giftMsg);

      if (typeof triggerSlash === 'function') {
        triggerSlash(`/echo severity=success ${npcName} 送了你一份礼物：${giftData.emoji} ${giftData.name} [${giftData.rarity}]`);
      }
    } catch (e) {
      console.warn('[Abyss] NPC gift generation failed:', e);
    }
    return null; // ★ 新增：如果没有触发拉黑，返回null
  }

  // 发送表情包（用户）
  function _sendSticker(sticker) {
    if (!_chatTarget) return;
    const $msgs = $('#ax-chat-msgs');
    $msgs.find('.ax-chat-empty').remove();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 保存为特殊格式的消息
    const content = `[sticker:${sticker.id}:${sticker.name}]`;
    _addMessage(_chatTarget, 'user', content);

    // 显示表情包气泡
    $msgs.append(`<div class="ax-chat-bubble user" style="background:transparent;padding:4px"><img src="${sticker.dataUrl}" style="max-width:100px;max-height:100px;border-radius:8px" alt="${_esc(sticker.name)}"><span class="ax-chat-time">${timeStr}</span></div>`);
    $msgs.scrollTop($msgs[0].scrollHeight);
  }


  // 渲染消息时识别表情包、转账、礼物
  function _renderMessageContent(content, isUser) {
    // ★ 语音消息
    const voiceMatch = content.match(/^\[voice:([^\]]+)\]$/);
    if (voiceMatch) {
      const voiceText = voiceMatch[1].trim();
      const t = _t();
      const voiceId = 'vc_' + Math.random().toString(36).slice(2, 8);
      return `<div class="ax-voice-msg" data-voice-text="${_esc(voiceText)}" data-voice-id="${voiceId}" style="display:flex;align-items:center;gap:8px;padding:8px 14px;background:${isUser ? 'rgba(' + t.primaryRgb + ',.12)' : t.surfaceHover};border-radius:16px;cursor:pointer;min-width:120px;transition:all .2s;user-select:none">
            <span class="ax-voice-play-icon" id="ax-vpi-${voiceId}" style="font-size:18px;flex-shrink:0;transition:transform .15s">▶️</span>
            <div style="flex:1;display:flex;align-items:center;gap:2px;height:20px">
                <span style="width:3px;height:6px;background:${t.textMuted};border-radius:1px;opacity:.4"></span>
                <span style="width:3px;height:12px;background:${t.textMuted};border-radius:1px;opacity:.5"></span>
                <span style="width:3px;height:8px;background:${t.textMuted};border-radius:1px;opacity:.6"></span>
                <span style="width:3px;height:16px;background:${t.textMuted};border-radius:1px;opacity:.7"></span>
                <span style="width:3px;height:10px;background:${t.textMuted};border-radius:1px;opacity:.5"></span>
                <span style="width:3px;height:14px;background:${t.textMuted};border-radius:1px;opacity:.6"></span>
                <span style="width:3px;height:6px;background:${t.textMuted};border-radius:1px;opacity:.4"></span>
                <span style="width:3px;height:11px;background:${t.textMuted};border-radius:1px;opacity:.55"></span>
                <span style="width:3px;height:7px;background:${t.textMuted};border-radius:1px;opacity:.45"></span>
            </div>
            <span style="font-size:8px;color:${t.textMuted};flex-shrink:0">${Math.ceil(voiceText.length / 4)}″</span>
        </div>`;
    }

    // ★ 链接分享消息
    const linkMatch = content.match(/^\[link:([^:]*):([^:]*):([^:]*):([^\]]*)\]$/);
    if (linkMatch) {
      const linkTitle = linkMatch[1].trim() || '未知链接';
      const linkSource = linkMatch[2].trim() || '未知来源';
      const linkDesc = linkMatch[3].trim() || '';
      const linkType = linkMatch[4].trim() || 'other';
      const t = _t();
      const typeIcons = { article: '📄', video: '🎬', forum: '💬', news: '📰', other: '🔗' };
      const typeLabels = { article: '文章', video: '视频', forum: '帖子', news: '新闻', other: '链接' };
      const typeIcon = typeIcons[linkType] || '🔗';
      const typeLabel = typeLabels[linkType] || '链接';
      const safeTitle = _esc(linkTitle);
      const safeSource = _esc(linkSource);
      const safeDesc = _esc(linkDesc);
      return `<div class="ax-link-share" data-link-title="${safeTitle}" data-link-source="${safeSource}" data-link-desc="${safeDesc}" data-link-type="${_esc(linkType)}" data-is-user="${isUser}" style="min-width:200px;max-width:240px;border-radius:12px;overflow:hidden;background:${t.bgCard};border:1px solid ${t.border};cursor:pointer;transition:all .2s">
            <div style="padding:10px 12px">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
                    <span style="font-size:14px">${typeIcon}</span>
                    <span style="font-size:7px;color:${t.textMuted};background:${t.surfaceHover};padding:1px 6px;border-radius:4px">${typeLabel}</span>
                    <span style="font-size:7px;color:${t.textMuted};margin-left:auto">${safeSource}</span>
                </div>
                <div style="font-size:11px;font-weight:600;color:${t.primary};line-height:1.4;margin-bottom:4px">${safeTitle}</div>
                ${linkDesc ? `<div style="font-size:8px;color:${t.textDim};line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${safeDesc}</div>` : ''}
            </div>
            <div style="padding:4px 12px 6px;font-size:7px;color:${t.textMuted};display:flex;align-items:center;gap:3px;border-top:1px solid ${t.divider}"><span>🔗</span> 点击${isUser ? '查看NPC反馈' : '查看详情'}</div>
        </div>`;
    }
    // ★ 音乐分享消息
    const musicMatch = content.match(/^\[music:([^:]*):([^:]*):([^\]]*)\]$/);
    if (musicMatch) {
      const songName = musicMatch[1].trim() || '未知歌曲';
      const artistName = musicMatch[2].trim() || '未知歌手';
      const comment = musicMatch[3].trim();
      const t = _t();
      const keyword = songName + ' ' + artistName;
      return `<div class="ax-music-share" data-keyword="${_esc(keyword)}" data-song="${_esc(songName)}" data-artist="${_esc(artistName)}" style="min-width:180px;max-width:220px;border-radius:12px;overflow:hidden;background:linear-gradient(135deg,${t.bgCard},${t.bgSection});border:1px solid rgba(${t.accentRgb},.15);cursor:pointer;transition:all .2s">
            <div style="display:flex;align-items:center;gap:8px;padding:10px 12px">
                <div style="width:36px;height:36px;border-radius:8px;background:rgba(${t.primaryRgb},.12);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">🎵</div>
                <div style="flex:1;min-width:0">
                    <div style="font-size:10px;font-weight:600;color:${t.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${_esc(songName)}</div>
                    <div style="font-size:8px;color:${t.textMuted}">${_esc(artistName)}</div>
                </div>
                <div style="font-size:14px;color:${t.primary};flex-shrink:0">▶</div>
            </div>
            ${comment ? `<div style="padding:0 12px 8px;font-size:9px;color:${t.textDim};line-height:1.4;font-style:italic">"${_esc(comment)}"</div>` : ''}
            <div style="padding:4px 12px 6px;font-size:7px;color:${t.textMuted};display:flex;align-items:center;gap:3px;border-top:1px solid ${t.divider}"><span>🎧</span> 点击播放</div>
        </div>`;
    }

    // ★ 私聊红包消息
    const dmRpMatch = content.match(/^\[dm-redpacket:([^:]+):(\d+):([^:]*):(\w+)\]$/);
    if (dmRpMatch) {
      const rpId = dmRpMatch[1];
      const amount = parseInt(dmRpMatch[2]);
      const note = dmRpMatch[3] || '恭喜发财';
      const status = dmRpMatch[4]; // 'unopened' or 'opened'
      const t = _t();
      if (status === 'opened') {
        return `<div style="width:200px">` +
          `<div style="background:linear-gradient(180deg,#dc4040,#c83030);border-radius:12px;overflow:hidden;opacity:.7">` +
          `<div style="padding:14px;text-align:center">` +
          `<div style="font-size:10px;color:rgba(255,255,255,.8)">${_esc(note)}</div>` +
          `<div style="font-size:20px;font-weight:700;color:#f0c040;margin:8px 0;font-family:'Courier New',monospace">${amount}💰</div>` +
          `<div style="font-size:8px;color:rgba(255,255,255,.5)">已拆开</div>` +
          `</div>` +
          `</div>` +
          `</div>`;
      }
      //未拆开状态
      return `<div class="ax-dm-rp-open" data-rp-id="${rpId}" data-amount="${amount}" data-note="${_esc(note)}" style="width:200px;cursor:pointer;user-select:none">` +
        `<div style="background:linear-gradient(180deg,#dc4040,#c83030,#b02828);border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(200,48,48,.3)">` +
        `<div style="padding:16px 14px 10px;text-align:center">` +
        `<div style="font-size:11px;color:rgba(255,255,255,.9);font-weight:600">${_esc(note)}</div>` +
        `</div>` +
        `<div style="display:flex;justify-content:center;padding:8px 0 16px">` +
        `<div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#f0c040,#e0a020);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#c83030;box-shadow:0 2px 8px rgba(0,0,0,.2);font-family:serif">拆</div>` +
        `</div>` +
        `</div>` +
        `</div>`;
    }

    // ★ 转账消息（放在函数内部最开头）
    const transferMatch = content.match(/^\[transfer:(send|recv):(\d+):(.+)\]$/);
    if (transferMatch) {
      const dir = transferMatch[1];
      const amount = transferMatch[2];
      const note = transferMatch[3];
      const t = _t();
      const isSend = (dir === 'send' && isUser) || (dir === 'recv' && !isUser);
      const icon = isSend ? '💸' : '💰';
      const label = isSend ? '转出' : '收到';
      return `<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:${t.surfaceHover};border-radius:10px;min-width:140px"><span style="font-size:24px">${icon}</span><div><div style="font-size:8px;color:${t.textMuted}">${label}魂币</div><div style="font-size:16px;font-weight:700;color:${t.accent};font-family:'Courier New',monospace">${amount}</div><div style="font-size:8px;color:${t.textMuted}">${_esc(note)}</div></div></div>`;
    }

    // ★ 礼物消息
    const giftMatch = content.match(/^\[gift:(send|recv):(.+?):(.+?):(.+?)\]$/);
    if (giftMatch) {
      const dir = giftMatch[1];
      const emoji = giftMatch[2];
      const giftName = giftMatch[3];
      const rarity = giftMatch[4];
      const t = _t();
      const isSend = (dir === 'send' && isUser) || (dir === 'recv' && !isUser);
      const label = isSend ? '送出了礼物' : '收到了礼物';
      const rarityColor = { SSS: t.sss, SSR: t.ssr, SR: t.sr, R: t.text }[rarity] || t.textDim;
      return `<div style="text-align:center;padding:10px 16px;background:${t.surfaceHover};border-radius:12px;min-width:120px"><div style="font-size:8px;color:${t.textMuted};margin-bottom:4px">${label}</div><div style="font-size:28px">${emoji}</div><div style="font-size:10px;font-weight:600;color:${t.text};margin-top:4px">${_esc(giftName)}</div><div style="font-size:7px;color:${rarityColor};font-weight:600">[${rarity}]</div></div>`;
    }

    const stickerMatch = content.match(/^\[sticker:(stk_[^:]+):(.+)\]$/);
    if (stickerMatch) {
      const stkId = stickerMatch[1];
      const stkName = stickerMatch[2];
      const sticker = _getStickerById(stkId);
      if (sticker) {
        return `<img src="${sticker.dataUrl}" style="max-width:100px;max-height:100px;border-radius:8px" alt="${_esc(stkName)}">`;
      }
      // 如果表情包已被删除，显示占位
      return `<span style="color:${_t().textMuted};font-style:italic">[表情包: ${_esc(stkName)}]</span>`;
    }
    // NPC发送的表情包标记：[sticker-tag:标签名或标签ID]
    const npcStickerMatch = content.match(/^\[sticker-tag:([^\]]+)\]$/);
    if (npcStickerMatch) {
      const tagRef = npcStickerMatch[1].trim();
      // 先尝试按标签名匹配，再尝试按标签ID匹配
      const allTags = _loadCustomTags();
      const matchedTag = allTags.find(t => t.name === tagRef || t.id === tagRef);
      let candidates = [];
      if (matchedTag) {
        candidates = _getStickersByTag(matchedTag.id);
      } else {
        // 也尝试直接按tag字段匹配（兼容旧数据）
        candidates = _loadStickers().filter(s => s.tag === tagRef);
      }
      if (candidates.length > 0) {
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        return `<img src="${chosen.dataUrl}" style="max-width:100px;max-height:100px;border-radius:8px" alt="${_esc(chosen.name)}">`;
      }
      // 没有对应表情包时，显示一个小标注而不是原始标签文本
      const tagEmoji = matchedTag ? matchedTag.emoji : '';
      if (tagEmoji) {
        return `<span style="font-size:18px">${tagEmoji}</span>`;
      }
      // 完全没有匹配的标签，也没有表情包，隐藏这条消息内容
      return `<span style="font-size:9px;color:${_t().textMuted};font-style:italic">（发了个表情）</span>`;
    }
    // 隐藏NPC的特殊指令标记（不显示给用户）
    if (content.match(/^\[npc-transfer:\d+:[^\]]+\]$/) || content.match(/^\[npc-gift\]$/)) {
      return ''; // 返回空字符串，表示这段不需要显示
    }

    return null; // 不是表情包，返回null
  }

  // ── 仅发送用户消息（不触发NPC回复）──
  function _doSendOnly() {
    if (!_chatTarget) return;
    const $input = $('#ax-chat-input');
    const rawMsg = $input.val().trim();
    if (!rawMsg) return;

    $input.val('').css('height', 'auto');

    const $msgs = $('#ax-chat-msgs');
    $msgs.find('.ax-chat-empty').remove();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 保存到聊天记录
    _addMessage(_chatTarget, 'user', rawMsg);

    // 分段显示用户消息
    const userSegments = rawMsg.split(/\n+/).map(s => s.trim()).filter(Boolean);
    for (let si = 0; si < userSegments.length; si++) {
      const isLast = si === userSegments.length - 1;
      $msgs.append(`<div class="ax-chat-bubble user">${_esc(userSegments[si])}${isLast ? '<span class="ax-chat-time">' + timeStr + '</span>' : ''}</div>`);
    }
    $msgs.scrollTop($msgs[0].scrollHeight);
    $input.focus();
  }

  // ── 触发NPC回复（基于已发送的消息历史）──
  async function _doRequestReply() {
    if (_chatSending || !_chatTarget) return;
    if (!_getDefaultApi()) {
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=warning 请先在接口页配置API');
      return;
    }

    // 检查是否有消息可以回复
    const chat = _getChatWith(_chatTarget);
    if (!chat.messages.length) {
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=info 请先发送消息');
      return;
    }

    _chatSending = true;
    $('#ax-chat-send').prop('disabled', true);

    const $msgs = $('#ax-chat-msgs');
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 显示打字动画
    $msgs.append('<div class="ax-chat-typing" id="ax-typing"><div class="ax-chat-typing-dots"><span></span><span></span><span></span></div></div>');
    $msgs.scrollTop($msgs[0].scrollHeight);

    try {
      // 构建消息并调用API（不再重复保存用户消息，因为已经在 _doSendOnly 中保存了）
      const msgs = _buildChatMessages(_chatTarget, null);
      const reply = await _callApi(msgs);

      // 处理NPC回复中的特殊指令（转账、礼物、拉黑），在保存前先处理
      const blockAction = await _processNpcSpecialActions(_chatTarget, reply);

      // 如果触发了拉黑，则中断后续流程
      if (blockAction) {
        $('#ax-typing').remove();
        // 在界面上显示被拉黑的提示
        const t = _t();
        $msgs.append(`<div style="padding:10px;text-align:center;font-size:10px;color:${t.fail};background:rgba(${t.primaryRgb},.1);border-radius:12px;margin:8px 0;">${_esc(_chatTarget)} 已将你拉黑。<br>“${_esc(blockAction.reason)}”</div>`);
        $msgs.scrollTop($msgs[0].scrollHeight);
        $('#ax-chat-input-bar').hide(); // 隐藏输入框
        _chatSending = false; // 重置发送状态
        return; // 结束函数执行
      }

      // 保存NPC回复（清理掉特殊指令标记后再保存）
      const cleanedReply = reply
        .split(/\n+/)
        .filter(s => {
          const trimmed = s.trim();
          if (trimmed.match(/^\[npc-transfer:\d+:[^\]]*\]$/)) return false;
          if (trimmed.match(/^\[npc-gift\]$/)) return false;
          return true;
        })
        .join('\n')
        .trim();
      if (cleanedReply) {
        _addMessage(_chatTarget, 'assistant', cleanedReply);
      }

      $('#ax-typing').remove();

      if (reply && reply.trim()) {
        const now2 = new Date();
        const timeStr2 = `${String(now2.getHours()).padStart(2, '0')}:${String(now2.getMinutes()).padStart(2, '0')}`;

        // NPC回复分段显示（过滤掉特殊指令行）
        const npcSegments = reply.split(/\n+/).map(s => s.trim()).filter(s => {
          if (!s) return false;
          // 过滤掉NPC特殊指令
          if (s.match(/^\[npc-transfer:\d+:[^\]]*\]$/)) return false;
          if (s.match(/^\[npc-gift\]$/)) return false;
          return true;
        });
        for (let si = 0; si < npcSegments.length; si++) {
          const isLast = si === npcSegments.length - 1;
          const seg = npcSegments[si];
          const stkHtml = _renderMessageContent(seg, false);
          if (stkHtml !== null) {
            $msgs.append(`<div class="ax-chat-bubble npc" style="background:transparent;padding:4px">${stkHtml}${isLast ? '<span class="ax-chat-time">' + timeStr2 + '</span>' : ''}</div>`);
          } else {
            $msgs.append(`<div class="ax-chat-bubble npc">${_esc(seg)}${isLast ? '<span class="ax-chat-time">' + timeStr2 + '</span>' : ''}</div>`);
          }
        }
      } else {
        $msgs.append(`<div class="ax-chat-bubble npc" style="color:${_t().textMuted};font-style:italic">（对方未回复）<span class="ax-chat-time">${timeStr}</span></div>`);
      }
      $msgs.scrollTop($msgs[0].scrollHeight);
    } catch (e) {
      $('#ax-typing').remove();
      const errMsg = e.message || '未知错误';
      $msgs.append(`<div class="ax-chat-bubble npc" style="color:${_t().fail};opacity:.8;font-size:9px">⚠ 发送失败：${_esc(errMsg).slice(0, 120)}<span class="ax-chat-time">${timeStr}</span></div>`);
      $msgs.scrollTop($msgs[0].scrollHeight);
      console.error('[Abyss Chat]', e);
    }

    // 自动同步聊天记录到世界书
    if (window._abyssChatSyncConfig) {
      const cfg = window._abyssChatSyncConfig;
      window.AbyssChat.syncToWorldInfo(cfg.worldBookName, cfg.uid).catch(() => { });
    }

    _chatSending = false;
    $('#ax-chat-send').prop('disabled', false);
    $('#ax-chat-input').focus();
  }

  // ── 保留原函数名作为兼容（内部不再使用）──
  async function _doSendChat() {
    _doSendOnly();
    await _doRequestReply();
  }

  /* ═══════════════════════════════════════
     🔌 API 管理
     ═══════════════════════════════════════ */
  function _drawApiManager($c) {
    const t = _t();
    const apis = _loadApis();
    let o = '';

    if (!apis.length) {
      o += '<div class="ax-chat-empty">尚未配置API接口<br><span style="font-size:8px;opacity:.6">点击下方按钮添加</span></div>';
    } else {
      for (const api of apis) {
        const isDef = api.isDefault;
        o += `<div class="ax-api-card${isDef ? ' default' : ''}" data-api-id="${_esc(api.id)}">`;
        o += '<div class="ax-api-card-top">';
        o += `<span class="ax-api-card-ico">${isDef ? '⚡' : '🔌'}</span>`;
        o += '<div class="ax-api-card-body">';
        const isAux = api.isAux;
        o += `<div class="ax-api-card-name">${_esc(api.name || '未命名')}${isDef ? '<span class="ax-api-default-tag">默认</span>' : ''}${isAux ? '<span class="ax-api-default-tag" style="background:rgba(' + t.primaryRgb + ',.12);color:' + t.primary + '">辅助</span>' : ''}</div>`;
        o += `<div class="ax-api-card-url">${_esc((api.endpoint || '').slice(0, 50))}</div>`;
        o += `<div class="ax-api-card-model">模型: ${_esc(api.model || '未设置')}</div>`;
        o += '</div>';
        o += '<div class="ax-api-card-actions">';
        if (!isDef) o += `<button class="ax-api-btn ax-api-set-default" data-id="${_esc(api.id)}">设默认</button>`;
        if (!isAux) o += `<button class="ax-api-btn ax-api-set-aux" data-id="${_esc(api.id)}">设辅助</button>`;
        o += `<button class="ax-api-btn ax-api-edit" data-id="${_esc(api.id)}">编辑</button>`;
        o += `<button class="ax-api-btn danger ax-api-del" data-id="${_esc(api.id)}">删除</button>`;
        o += '</div></div></div>';
      }
    }
    o += '<div class="ax-api-add-btn" id="ax-api-add">＋ 添加API接口</div>';

    // 使用提示
    o += `<div style="margin-top:12px;padding:10px;border-radius:10px;background:${t.surfaceHover};font-size:8px;color:${t.textMuted};line-height:1.6">`;
    o += '💡 <b style="color:' + t.textDim + '">使用说明</b><br>';
    o += '• 支持 OpenAI 兼容格式的API（OpenAI / DeepSeek / Gemini / 通义千问等）<br>';
    o += '• 填写完整的API地址，如 https://api.openai.com/v1<br>';
    o += '• 默认API用于NPC聊天<br>';
    o += '• <b>辅助API</b>用于所有自动触发功能：NPC动态、好友申请、NPC互评、礼物生成、广播、论坛帖子等<br>';
    o += '• 建议为辅助API配置一个便宜/免费的模型，因为自动功能会频繁调用<br>';
    o += '• API Key安全存储在本地浏览器中';
    o += '</div>';

    $c.html(o);

    $c.find('#ax-api-add').on('click', () => _apiEditDialog(null));
    $c.find('.ax-api-edit').on('click', function () { const id = $(this).data('id'); const api = _loadApis().find(a => a.id === id); if (api) _apiEditDialog(api); });
    $c.find('.ax-api-del').on('click', function () {
      const id = $(this).data('id');
      const w = _dialog(`<div class="ax-dlg-h">⚠ 删除API</div><div class="ax-dlg-sub">确定要删除这个API配置吗？</div><div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-ad-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-ad-yes" style="color:${t.fail};border-color:rgba(${t.primaryRgb},.3)">删除</button></div>`);
      $('#ax-ad-no').on('click', () => w.remove());
      $('#ax-ad-yes').on('click', () => { _removeApi(id); w.remove(); _render(); if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success API已删除'); });
    });
    $c.find('.ax-api-set-default').on('click', function () {
      _setDefaultApi($(this).data('id'));
      _render();
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 已设为默认API');
    });
    $c.find('.ax-api-set-aux').on('click', function () {
      _setAuxApi($(this).data('id'));
      _render();
      if (typeof triggerSlash === 'function') triggerSlash('/echo severity=success 已设为辅助API（用于礼物/动态/好友申请）');
    });
  }

  function _apiEditDialog(existing) {
    const t = _t();
    const isEdit = !!existing;
    const title = isEdit ? '✎ 编辑API' : '＋ 添加API';
    const name = existing ? existing.name : '';
    const endpoint = existing ? existing.endpoint : '';
    const apiKey = existing ? existing.apiKey : '';
    const model = existing ? existing.model : '';

    const w = _dialog(
      `<div class="ax-dlg-h">${title}</div>` +
      '<div class="ax-api-form">' +
      `<label>名称</label><input id="ax-af-name" type="text" placeholder="如：DeepSeek主力" value="${_esc(name)}" maxlength="30">` +
      `<label>API地址</label><input id="ax-af-url" type="text" placeholder="https://api.deepseek.com/v1" value="${_esc(endpoint)}">` +
      `<label>API Key</label><div class="ax-api-key-row"><input id="ax-af-key" type="password" placeholder="sk-..." value="${_esc(apiKey)}"><button class="ax-api-toggle-key" id="ax-af-toggle">👁</button></div>` +
      `<label>模型</label>` +
      `<div class="ax-model-row">` +
      `<input id="ax-af-model" type="text" placeholder="点击右侧获取或手动输入" value="${_esc(model)}">` +
      `<button class="ax-fetch-models-btn" id="ax-af-fetch">获取模型</button>` +
      `</div>` +
      `<div id="ax-af-model-list" style="display:none;margin-top:4px"></div>` +
      '</div>' +
      '<div class="ax-dlg-err" id="ax-af-e"></div>' +
      `<div class="ax-dlg-actions"><button class="ax-dlg-btn ax-dlg-cancel" id="ax-af-no">取消</button><button class="ax-dlg-btn ax-dlg-ok" id="ax-af-yes">${isEdit ? '保存' : '添加'}</button></div>`
    );

    // 密码显示切换
    let keyVisible = false;
    $('#ax-af-toggle').on('click', () => {
      keyVisible = !keyVisible;
      $('#ax-af-key').attr('type', keyVisible ? 'text' : 'password');
    });

    // 获取模型列表
    $('#ax-af-fetch').on('click', async function () {
      const $btn = $(this);
      const $err = $('#ax-af-e');
      const $listDiv = $('#ax-af-model-list');
      const epVal = $('#ax-af-url').val().trim();
      const keyVal = $('#ax-af-key').val().trim();

      if (!epVal) { $err.text('请先填写API地址'); return; }

      $btn.prop('disabled', true).text('获取中…');
      $err.text('');

      try {
        const tmpApi = { endpoint: epVal, apiKey: keyVal };
        const models = await _fetchModels(tmpApi);

        if (!models.length) {
          $err.text('未找到可用模型');
          $btn.prop('disabled', false).text('获取模型');
          return;
        }

        // 构建下拉选择
        let selHtml = '<select class="ax-model-select" id="ax-af-model-select">';
        selHtml += '<option value="">── 请选择模型 ──</option>';
        for (const m of models) {
          const sel = m === model ? ' selected' : '';
          selHtml += `<option value="${_esc(m)}"${sel}>${_esc(m)}</option>`;
        }
        selHtml += '</select>';
        $listDiv.html(selHtml).show();

        // 选择时同步到输入框
        $('#ax-af-model-select').on('change', function () {
          const v = $(this).val();
          if (v) $('#ax-af-model').val(v);
        });

        $btn.prop('disabled', false).text('刷新模型');
      } catch (e) {
        $err.text(e.message || '获取失败');
        $btn.prop('disabled', false).text('获取模型');
      }
    });

    $('#ax-af-no').on('click', () => w.remove());
    $('#ax-af-yes').on('click', () => {
      const data = {
        name: $('#ax-af-name').val().trim() || '未命名',
        endpoint: $('#ax-af-url').val().trim(),
        apiKey: $('#ax-af-key').val().trim(),
        model: $('#ax-af-model').val().trim() || 'gpt-3.5-turbo'
      };
      if (!data.endpoint) { $('#ax-af-e').text('请填写API地址'); return; }
      if (!data.apiKey) { $('#ax-af-e').text('请填写API Key'); return; }

      if (isEdit) {
        _updateApi(existing.id, data);
      } else {
        const entry = _addApi(data);
        if (_loadApis().length === 1) _setDefaultApi(entry.id);
      }
      w.remove();
      _render();
      if (typeof triggerSlash === 'function') triggerSlash(`/echo severity=success API${isEdit ? '已更新' : '已添加'}`);
    });
  }

  /* ═══════════════════════════════════════
     事件监听与跨标签同步
     ═══════════════════════════════════════ */
  function _wireEvents() {
    if (typeof tavern_events === 'undefined') return;
    const r = () => { if (_visible) _render(); _updateChrome(); };
    eventOn(tavern_events.CHARACTER_MESSAGE_RENDERED, r);
    eventOn(tavern_events.MESSAGE_SWIPED, r);
    eventOn(tavern_events.MESSAGE_UPDATED, r);
    eventOn(tavern_events.CHAT_CHANGED, () => {
      _bdClean();
      $('#' + G.elIds.trigger).remove();
      $('#' + G.elIds.overlay).remove();
      $('#' + G.elIds.css).remove();
      _visible = false;
      _bagSlot = null;
      _screen = 'home';
      _skillNpc = null;
      _chatTarget = null;
      _chatSending = false;
      setTimeout(_buildShell, 100);
    });
  }

  window.addEventListener('storage', function (e) {
    if (e.key !== SIGNAL_KEY || !e.newValue) return;
    const p = e.newValue.split('|'), k = p[0], s = p[2] || '';
    if (s !== 'status-bar') return;
    if (THEMES[k] && k !== _currentTheme) {
      _currentTheme = k;
      window.ABYSS_CURRENT_THEME = k;
      localStorage.setItem(STORAGE_KEY, k);
      _ensureCss();
      if (_visible) _render();
    }
  });

  /* ═══════════════════════════════════════
     NPC主动消息定时器
     ═══════════════════════════════════════ */
  let _npcTimerId = null;
  const NPC_MSG_INTERVAL = 5 * 60 * 1000;
  const NPC_MSG_CHANCE = 0.15;

  function _startNpcTimer() {
    if (_npcTimerId) return;
    _npcTimerId = setInterval(() => {
      // 自动功能只在有辅助API时运行
      if (!_getAuxApi()) return;
      const d = _load();
      if (!d || !d['NPC关系']) return;

      const knownNpcs = Object.keys(d['NPC关系']).filter(k => !_skip(k));
      if (!knownNpcs.length) return;

      // ── NPC主动发消息（15%概率）──
      if (Math.random() < NPC_MSG_CHANCE) {
        const canMsgNpcs = knownNpcs.filter(n => !_isBlocked(n) && _isFriend(n));
        if (canMsgNpcs.length) {
          const npc = canMsgNpcs[Math.floor(Math.random() * canMsgNpcs.length)];
          _npcInitiateMessage(npc).then(reply => {
            if (reply) {
              _updateChrome();
              if (_visible && _screen === 'home') _render();
              if (_visible && _screen === 'chat' && !_chatTarget) _render();
              if (_visible && _screen === 'chat' && _chatTarget === npc) {
                const $msgs = $('#ax-chat-msgs');
                if ($msgs.length) {
                  const now = new Date();
                  const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                  const npcSegs = reply.split(/\n+/).map(s => s.trim()).filter(s => {
                    if (!s) return false;
                    if (s.match(/^\[npc-transfer:\d+:[^\]]*\]$/)) return false;
                    if (s.match(/^\[npc-gift\]$/)) return false;
                    return true;
                  });
                  for (let si = 0; si < npcSegs.length; si++) {
                    const isLast = si === npcSegs.length - 1;
                    $msgs.append(`<div class="ax-chat-bubble npc">${_esc(npcSegs[si])}${isLast ? '<span class="ax-chat-time">' + ts + '</span>' : ''}</div>`);
                  }
                  $msgs.scrollTop($msgs[0].scrollHeight);
                  _clearUnread(npc);
                }
              }
            }
          });
        }
      }

      // ── 自动好友申请（8%概率，每次间隔至少触发）──
      if (Math.random() < 0.08) {
        const nonFriendNpcs = knownNpcs.filter(n => !_isFriend(n) && !_isBlocked(n));
        if (nonFriendNpcs.length) {
          _triggerNpcFriendRequest().then(() => {
            if (_visible) _render();
            _updateChrome();
          }).catch(e => console.warn('[Abyss] 自动好友申请失败:', e));
        }
      }

      // ── 自动NPC朋友圈动态（5%概率）──
      if (Math.random() < 0.05) {
        const friendNpcs = knownNpcs.filter(n => _isFriend(n) && !_isBlocked(n));
        if (friendNpcs.length >= 2) {
          _autoGenerateSingleMoment(friendNpcs).catch(e => console.warn('[Abyss] 自动动态失败:', e));
        }
      }

      // ── 群聊NPC自主聊天（12%概率）──
      if (Math.random() < 0.12) {
        const groups = _getGroupChatList();
        if (groups.length > 0) {
          // 随机选一个群聊
          const randomGroup = groups[Math.floor(Math.random() * groups.length)];
          const npcCount = randomGroup.members.filter(m => m !== _getPlayerName() && !_isBlocked(m)).length;
          if (npcCount >= 2) {
            _groupChatAutoChat(randomGroup.id).then(count => {
              if (count > 0) {
                _updateChrome();
                // 如果正在看这个群聊，刷新界面
                if (_visible && _currentGroupId === randomGroup.id) {
                  const $c = $('#ax-chat-main-body');
                  if ($c.length) _drawGroupConversation($c);
                }
              }
            }).catch(e => console.warn('[Abyss] 群聊自动聊天失败:', e));
          }
        }
      }

    }, NPC_MSG_INTERVAL);
  }

  function _stopNpcTimer() {
    if (_npcTimerId) { clearInterval(_npcTimerId); _npcTimerId = null; }
  }

  // 自动生成单条NPC动态（定时器用）
  async function _autoGenerateSingleMoment(npcNames) {
    const api = _getAuxApi();
    if (!api) return;

    const npc = npcNames[Math.floor(Math.random() * npcNames.length)];
    const personality = _getNpcPersonality(npc);
    const context = _getContextSummary();

    try {
      const msgs = [
        {
          role: 'system',
          content: `你是"${npc}"，请发一条朋友圈动态。

你的性格：${personality.personality}

当前世界信息：
${context.slice(0, 2000)}

要求：
1. 像真人发朋友圈，随意自然，50-120字
2. 可以是吐槽、分享、感想、日常
3. 可以用emoji
4. 只输出JSON：{"content":"动态内容","imageDesc":"配图描述或空"}`
        },
        { role: 'user', content: '发一条动态' }
      ];

      const reply = await _callAuxApi(msgs, { temperature: 0.95, max_tokens: 3000 });
      const data = _safeParseJsonObject(reply);
      if (data && data.content) {
        const mom = _addMoment({
          author: npc,
          content: String(data.content).trim().slice(0, 500),
          imageDesc: data.imageDesc ? String(data.imageDesc).trim().slice(0, 100) : ''
        });

        // 其他NPC随机点赞
        const otherNpcs = npcNames.filter(n => n !== npc);
        for (const other of otherNpcs) {
          if (Math.random() < 0.4) {
            _toggleMomentLike(mom.id, other);
          }
        }

        if (_visible && _chatSubTab === 'moments') {
          const $body = $('#ax-chat-main-body');
          if ($body.length) _drawMoments($body);
        }
      }
    } catch (e) {
      // 静默失败
    }
  }

  function _buildSyncText(msgs, npcName, playerName, indent) {
    const pfx = indent || '';
    let text = '';
    for (const msg of msgs) {
      const sender = msg.role === 'user' ? playerName : npcName;
      let content = msg.content;
      // 简化特殊消息
      if (content.match(/^\[(?:sticker|dm-redpacket)/)) continue;
      const tm1 = content.match(/^\[transfer:send:(\d+):?([^\]]*)\]/);
      const tm2 = content.match(/^\[transfer:recv:(\d+):?([^\]]*)\]/);
      const gm1 = content.match(/^\[gift:send:[^:]*:([^:]*)/);
      const gm2 = content.match(/^\[gift:recv:[^:]*:([^:]*)/);
      const mm = content.match(/^\[music:([^:]*):([^:]*)/);
      const lm = content.match(/^\[link:([^:]*):([^:]*)/);
      const vm = content.match(/^\[voice:([^\]]*)\]/);
      if (tm1) content = `[转账给${npcName} ${tm1[1]}魂币${tm1[2] ? '：' + tm1[2] : ''}]`;
      else if (tm2) content = `[收到${npcName}转账 ${tm2[1]}魂币${tm2[2] ? '：' + tm2[2] : ''}]`;
      else if (gm1) content = `[送给${npcName}礼物：${gm1[1]}]`;
      else if (gm2) content = `[收到${npcName}的礼物：${gm2[1]}]`;
      else if (mm) content = `[分享歌曲：${mm[1]} - ${mm[2]}]`;
      else if (lm) content = `[分享链接：${lm[1]}]`;
      else if (vm) content = `[语音：${vm[1].slice(0, 30)}]`;
      text += `${pfx}${sender}：${content.slice(0, 150)}\n`;
    }
    return text;
  }

  // ══ 同步辅助：构建群聊同步文本 ══
  function _buildGroupSyncText(msgs, grp, indent) {
    const pfx = indent || '';
    let text = '';
    for (const msg of msgs) {
      if (msg.sender === '__system__' || msg.type === 'system') continue;
      const displayName = _getGroupDisplayName(grp, msg.sender);
      let content = msg.content;
      // 简化特殊消息格式
      if (content.match(/^\[sticker/)) content = '[表情包]';
      else if (content.match(/^\[redpacket/)) content = '[红包]';
      const tm = content.match(/^\[transfer:send:(\d+):?([^\]]*)\]/);
      const gm = content.match(/^\[gift:send:[^:]*:([^:]*)/);
      const mm = content.match(/^\[music:([^:]*):([^:]*)/);
      const lm = content.match(/^\[link:([^:]*)/);
      const vm = content.match(/^\[voice:([^\]]*)\]/);
      if (tm) content = `[转账${tm[1]}魂币${tm[2] ? '：' + tm[2] : ''}]`;
      else if (gm) content = `[送礼物：${gm[1]}]`;
      else if (mm) content = `[分享歌曲：${mm[1]}]`;
      else if (lm) content = `[分享链接：${lm[1]}]`;
      else if (vm) content = `[语音：${vm[1].slice(0, 30)}]`;
      text += `${pfx}${displayName}：${content.slice(0, 120)}\n`;
    }
    return text;
  }

  /* ═══════════════════════════════════════
     全局API暴露
     ═══════════════════════════════════════ */
  window.AbyssChat = {
    npcMessage: async function (npcName, hint) {
      const reply = await _npcInitiateMessage(npcName, hint);
      if (reply) { _updateChrome(); if (_visible) _render(); }
      return reply;
    },
    getUnread: _getTotalUnread,
    refresh: function () { if (_visible) _render(); _updateChrome(); },
    syncToWorldInfo: async function (worldBookName, uid) {
      if (!worldBookName || uid === undefined) return false;
      try {
        const allChats = _loadChats();
        const convos = Object.keys(allChats).filter(k => k && k !== 'null' && allChats[k] && allChats[k].messages && allChats[k].messages.length > 0);
        const allGroups = _loadGroupChats();
        const groupIds = Object.keys(allGroups);
        const playerName = _getPlayerName();

        if (!convos.length && !groupIds.length) {
          const cmd = `/setentryfield file="${worldBookName}" uid=${uid} field=content （暂无手机聊天记录）`;
          if (typeof triggerSlash === 'function') { await triggerSlash(cmd); }
          return true;
        }

        let summary = '以下是玩家手机中的重要聊天摘要，AI在生成剧情时应当知道这些对话内容：\n\n';

        //═══ 私聊记录同步 ═══
        for (const name of convos) {
          const chat = allChats[name];
          const msgs = chat.messages;

          summary += `【与${name}的私聊】\n`;

          const totalChars = msgs.reduce((sum, m) => sum + (m.content || '').length, 0);
          const CHAR_THRESHOLD = 1000;
          const RECENT_COUNT = 8;

          if (totalChars > CHAR_THRESHOLD && msgs.length > RECENT_COUNT && _getAuxApi()) {
            const earlyMsgs = msgs.slice(0, msgs.length - RECENT_COUNT);
            const earlyText = _buildSyncText(earlyMsgs, name, playerName);

            const summaryKey = `abyss-chat-summary-${name}`;
            const summaryCountKey = `abyss-chat-summary-count-${name}`;
            let cachedSummary = '';
            let cachedCount = 0;
            try {
              cachedSummary = localStorage.getItem(summaryKey) || '';
              cachedCount = parseInt(localStorage.getItem(summaryCountKey)) || 0;
            } catch (e) { }

            if (!cachedSummary || Math.abs(earlyMsgs.length - cachedCount) >= 10) {
              try {
                const sumMsgs = [{
                  role: 'system',
                  content: `你是一个聊天记录总结器。请将以下聊天记录总结为一段简洁的摘要，保留所有重要信息：关键事件、情感变化、做出的承诺或约定、提到的重要人物和地点、转账和礼物记录。总结应该用第三人称，200-400字。\n\n聊天对象：${name}\n\n聊天记录：\n${earlyText.slice(0, 4000)}`
                }, { role: 'user', content: '请总结以上聊天记录' }];
                const sumReply = await _callAuxApi(sumMsgs, { temperature: 0.3, max_tokens: 2000 });
                if (sumReply && sumReply.trim()) {
                  cachedSummary = sumReply.trim();
                  try {
                    localStorage.setItem(summaryKey, cachedSummary);
                    localStorage.setItem(summaryCountKey, String(earlyMsgs.length));
                  } catch (e) { }
                }
              } catch (e) {
                console.warn('[AbyssChat] Summary generation failed for', name, e);
              }
            }

            if (cachedSummary) {
              summary += `[早期聊天总结（共${earlyMsgs.length}条）]：${cachedSummary}\n\n`;
            }

            const recentMsgs = msgs.slice(-RECENT_COUNT);
            summary += `  [最近${recentMsgs.length}条消息原文]：\n`;
            summary += _buildSyncText(recentMsgs, name, playerName, '  ');
          } else {
            const recent = msgs.slice(-20);
            summary += _buildSyncText(recent, name, playerName, '  ');
          }summary += '\n';
        }

        // ═══ 群聊记录同步（新增：与私聊同等待遇） ═══
        for (const gid of groupIds) {
          const grp = allGroups[gid];
          if (!grp || !grp.messages || !grp.messages.length) continue;

          // 过滤掉纯系统消息，只统计有效消息
          const effectiveMsgs = grp.messages.filter(m => m.type !== 'system' && m.sender !== '__system__');
          if (!effectiveMsgs.length) continue;

          summary += `【群聊「${grp.name}」（成员：${grp.members.join('、')}）】\n`;

          const totalChars = effectiveMsgs.reduce((sum, m) => sum + (m.content || '').length, 0);
          const GRP_CHAR_THRESHOLD = 1500;
          const GRP_RECENT_COUNT = 12;

          if (totalChars > GRP_CHAR_THRESHOLD && effectiveMsgs.length > GRP_RECENT_COUNT && _getAuxApi()) {
            // 群聊也自动总结
            const earlyMsgs = effectiveMsgs.slice(0, effectiveMsgs.length - GRP_RECENT_COUNT);
            const earlyText = _buildGroupSyncText(earlyMsgs, grp);

            const summaryKey = `abyss-grpchat-summary-${gid}`;
            const summaryCountKey = `abyss-grpchat-summary-count-${gid}`;
            let cachedSummary = '';
            let cachedCount = 0;
            try {
              cachedSummary = localStorage.getItem(summaryKey) || '';
              cachedCount = parseInt(localStorage.getItem(summaryCountKey)) || 0;
            } catch (e) { }

            // 每增加15条消息重新总结一次
            if (!cachedSummary || Math.abs(earlyMsgs.length - cachedCount) >= 15) {
              try {
                const sumMsgs = [{
                  role: 'system',
                  content: `你是一个群聊记录总结器。请将以下群聊记录总结为一段简洁的摘要。

重点保留：
1. 群内发生的重要事件和讨论话题
2. 成员之间的互动关系变化（谁和谁吵架了、谁帮了谁等）
3. 做出的集体决定或约定
4. 提到的重要人物、地点、副本
5. 群游戏的结果（投票、谁是卧底、飞行棋等）
6. 红包、转账、礼物等经济互动

总结用第三人称，300-500字。

群名：${grp.name}
群成员：${grp.members.join('、')}

群聊记录：
${earlyText.slice(0, 5000)}`
                }, { role: 'user', content: '请总结以上群聊记录' }];
                const sumReply = await _callAuxApi(sumMsgs, { temperature: 0.3, max_tokens: 2500 });
                if (sumReply && sumReply.trim()) {
                  cachedSummary = sumReply.trim();
                  try {
                    localStorage.setItem(summaryKey, cachedSummary);
                    localStorage.setItem(summaryCountKey, String(earlyMsgs.length));
                  } catch (e) { }
                }
              } catch (e) {
                console.warn('[AbyssChat] Group summary failed for', grp.name, e);
              }
            }

            if (cachedSummary) {
              summary += `  [早期群聊总结（共${earlyMsgs.length}条）]：${cachedSummary}\n\n`;
            }

            // 最近的原文消息
            const recentMsgs = effectiveMsgs.slice(-GRP_RECENT_COUNT);
            summary += `  [最近${recentMsgs.length}条消息原文]：\n`;
            summary += _buildGroupSyncText(recentMsgs, grp, '  ');
          } else {
            // 消息不多，全部保留原文（最多15条）
            const recent = effectiveMsgs.slice(-15);
            summary += _buildGroupSyncText(recent, grp, '  ');
          }

          // 附加群公告和活跃接龙
          if (grp.announcement) {
            summary += `  [群公告]：${grp.announcement.slice(0, 100)}\n`;
          }
          if (grp.solitaire && grp.solitaire.active) {
            summary += `  [进行中的接龙]：${grp.solitaire.title}（${grp.solitaire.entries.length}人参与）\n`;
          }summary += '\n';
        }

        // 总字符限制
        if (summary.length > 8000) summary = summary.slice(0, 8000) + '\n…（更早消息省略）';

        const cmd = `/setentryfield file="${worldBookName}" uid=${uid} field=content ${summary.replace(/\|/g, '\\|')}`;
        if (typeof triggerSlash === 'function') { await triggerSlash(cmd); return true; }
        return false;
      } catch (e) { console.error('[AbyssChat] sync error:', e); return false; }
    }
  };

  /* ═══════════════════════════════════════
     启动
     ═══════════════════════════════════════ */
  let _att = 0;
  function _boot() {
    if (_att > 20) return;
    if (!window.$ || typeof getChatMessages === 'undefined') {
      _att++;
      setTimeout(_boot, 250);
      return;
    }
    $('#' + G.elIds.trigger).remove();
    $('#' + G.elIds.overlay).remove();
    $('#' + G.elIds.css).remove();
    _buildShell();
    _wireEvents();
    _broadcastTheme();
    _startNpcTimer();
    _ensureMusicLib(); // 预加载音乐库
    // 预加载语音列表（兼容手机端）
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        window.speechSynthesis.getVoices();
      });
      // 手机端额外触发：延迟发一个静音utterance
      setTimeout(() => {
        try {
          const d = new SpeechSynthesisUtterance('');
          d.volume = 0; d.rate = 10;
          window.speechSynthesis.speak(d);
        } catch (e) { }
      }, 2000);
    }
  }

  // 启动时加载已保存的NPC语音参数覆盖
  try {
    const key = 'abyss_npc_voice_override';
    const overrides = JSON.parse(localStorage.getItem(key) || '{}');
    for (const [npcName, params] of Object.entries(overrides)) {
      if (NPC_PERSONALITIES[npcName]) {
        Object.assign(NPC_PERSONALITIES[npcName], params);
      }
    }
  } catch (e) { }

  window._abyssChatSyncConfig = {
    worldBookName: '无间炼狱(1)',
    uid: 30
  };

  // 读取笔记同步配置
  try {
    const savedNoteUid = localStorage.getItem('abyss-note-sync-uid');
    const savedNoteWb = localStorage.getItem('abyss-note-sync-wb');
    if (savedNoteUid !== null) window._abyssNoteSyncUid = parseInt(savedNoteUid);
    if (savedNoteWb) window._abyssNoteSyncWb = savedNoteWb;
  } catch (e) { }

  $(document).ready(_boot);
})();
