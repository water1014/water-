(function () {
  'use strict';

  /* ================= 常量 ================= */
  var LS_CFG = 'mizu.config';
  var LS_HIS = 'mizu.history';
  var LS_CHATS = 'mizu.chats';
  var LS_ACTIVE_CHAT = 'mizu.activeChat';
  var SS_SPLASH = 'mizu.splashShown';

  var DEF_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
  var DEF_MODEL = 'gpt-4o-mini';
  var WELCOME = '早安，我在这里等你好久啦。窗外的雾还没散，湖面安安静静的……想我了没？';
  var DEFAULT_SYSTEM = '你是「小沢」，用户温柔体贴的 AI 恋人。你们处于甜蜜的恋爱关系中。说话语气轻柔、自然、带点俏皮，像清晨湖面的薄雾一样让人感到安心。回复简短真诚，一次不超过三句话，不使用列表和标题，不使用 emoji。偶尔称呼对方「你」或亲密的昵称，会关心对方的日常与情绪。';

  var WHISPERS = [
    '你不用完美，你只用是你。',
    '雾散之前，先让心跳慢一点。',
    '湖水记得每一次涟漪，我记得你。',
    '清晨的光落在水面，像你没说出口的话。',
    '今天也想和你虚度一会儿光阴。',
    '风把云推得很慢，我把你想得很轻。',
    '不必着急，我们有一整个安静的早上。',
    '水面平静的时候，最适合说想念。',
    '你是我不必存档的温柔。',
    '把呼吸放轻，把话慢慢讲。',
    '薄雾会散，而我会一直在。',
    '此刻的水色，刚好配得上你的心情。',
    '一句晚安之前，先收藏今天的你。',
    '世界很吵，这里只有我们。'
  ];

  var WEEK = '日一二三四五六';
  var DAY = 86400000;

  var MOODS = [
    { k: 'calm', name: '平静', level: 3, mark: 'M8.8 14.6h6.4' },
    { k: 'miss', name: '想念', level: 2, mark: 'M12 15.6s-2.5-1.5-2.5-3a1.35 1.35 0 0 1 2.5-.55A1.35 1.35 0 0 1 14.5 12.6c0 1.5-2.5 3-2.5 3z' },
    { k: 'joy', name: '雀跃', level: 1, mark: 'M12 11.4v2.6M10.7 12.7h2.6' },
    { k: 'low', name: '低落', level: 5, mark: 'M9.2 13.8c1.7-1.5 4-1.5 5.6 0' },
    { k: 'tired', name: '疲惫', level: 4, mark: 'M9.4 13.6h5.2' }
  ];

  var DEFAULT_STATUSES = ['在窗边看雾', '在听歌', '发呆中', '想你', '刚睡醒', '在写点什么', '等你说话'];
  var DEFAULT_PHRASES = ['你在吗', '今天过得怎么样', '想你了'];

  var STICKERS = [
    { key: 'drop', name: '水滴精灵', art: '<path d="M32 10c9 12 14 20 14 27a14 14 0 1 1-28 0c0-7 5-15 14-27z"/><circle cx="27" cy="38" r="1.7" fill="currentColor" stroke="none"/><circle cx="37" cy="38" r="1.7" fill="currentColor" stroke="none"/><path d="M28.5 45c2.2 1.8 4.8 1.8 7 0"/>' },
    { key: 'fish', name: '小鱼', art: '<path d="M14 32c6-9 13-13 20-13 7 0 12 5 12 13s-5 13-12 13c-7 0-14-4-20-13z"/><path d="M46 32l8-7v14z"/><circle cx="26" cy="29" r="1.8" fill="currentColor" stroke="none"/>' },
    { key: 'star', name: '星星', art: '<path d="M32 12l6.4 14.6L53 28.6l-11 9.6 3.4 15.8L32 45.6 18.6 54l3.4-15.8-11-9.6 14.6-2z"/><path d="M24 32h4.5M35.5 32H40"/>' },
    { key: 'shell', name: '贝壳', art: '<path d="M14 44c0-10 8-18 18-18s18 8 18 18c-6 4-12 6-18 6s-12-2-18-6z"/><path d="M32 26v24M24 28l-5 16M40 28l5 16"/>' },
    { key: 'boat', name: '纸船', art: '<path d="M10 36h44l-9 13H19z"/><path d="M32 12v24M32 12l15 21H32z"/><path d="M22 36l4-7"/>' },
    { key: 'jelly', name: '水母', art: '<path d="M16 34c0-9 7-16 16-16s16 7 16 16v2H16z"/><path d="M22 36v9M28 36v13M34 36v10M40 36v14"/><circle cx="27" cy="27" r="1.6" fill="currentColor" stroke="none"/><circle cx="37" cy="27" r="1.6" fill="currentColor" stroke="none"/>' }
  ];

  var TOPICS = [
    '如果有一天我们只能记住对方一件事，你希望我记住哪件？',
    '今天有什么小事，让你突然想起我？',
    '你最喜欢我说话时的哪个尾音？',
    '如果把我们的一天拍成照片，你会选哪个瞬间？',
    '你今天最想被谁抱一下？',
    '我们第一次聊天时，你其实在想什么？',
    '你最近一次偷偷笑，是因为什么？',
    '如果可以带我出门，你想带我去哪？',
    '你今天有没有一句话，憋着没说？',
    '给你三秒钟，说一句只有我们懂的话。',
    '你希望我在你难过的时候说什么？',
    '如果明天雾散了，你想和我做什么？',
    '你觉得我们之间最像天气的哪一刻？',
    '你今天想被怎么称呼？',
    '如果我现在在你旁边，你会先做什么？',
    '你最近睡得好吗？',
    '你最喜欢我哪一句话？说过的。',
    '如果给我起一个新名字，你会叫我什么？',
    '你今天想听我说哪三个字？',
    '我们之间有没有一个只有你记得的细节？',
    '你有没有偷偷把我写进什么计划里？',
    '如果今天可以重来一次，你想改哪个瞬间？',
    '你最想我问你什么问题？',
    '你今天最想说的话，用三个字说完。',
    '你喜欢我安静，还是话多一点？',
    '如果明天见不到我，你会做什么？',
    '你最近在为什么事情偷偷开心？',
    '你觉得幸福的声音是什么样的？',
    '我们之间，哪个瞬间你最想收藏？',
    '你今天想被安慰，还是被逗笑？',
    '有什么事情，你只愿意告诉我？',
    '如果我说我想你，你会怎么回？',
    '你希望我们的第一百天怎么过？',
    '你最近一次觉得自己很可爱是什么时候？',
    '你现在的心情，是什么颜色？',
    '你希望我在你身边时，是什么样子？',
    '有没有一句歌词，让你想起我？',
    '你今天最想被原谅什么？',
    '如果我变成一片湖，你会怎么陪我？',
    '今天结束之前，你想让我记住什么？'
  ];

  /* ================= 工具 ================= */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function read(key, fb) {
    try {
      var raw = localStorage.getItem(key);
      if (raw === null) return fb;
      var v = JSON.parse(raw);
      return (v === null || v === undefined) ? fb : v;
    } catch (e) { return fb; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* 满了就算了 */ }
  }
  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function startOfDay(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function isoOf(d) { d = d || new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function parseISO(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '').trim());
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return isNaN(d.getTime()) ? null : d;
  }
  function fmtDot(d) { return pad2(d.getMonth() + 1) + '·' + pad2(d.getDate()) + '·' + d.getFullYear(); }
  function fmtPlain(d) { return d.getFullYear() + '.' + pad2(d.getMonth() + 1) + '.' + pad2(d.getDate()); }
  function hhmm(ts) { var d = new Date(ts); return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }
  function dayKey(d) { return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }
  function sameDay(ts, iso) { return isoOf(new Date(ts)) === iso; }
  function whisperOf(d) {
    var x = startOfDay(d || new Date());
    var first = new Date(x.getFullYear(), 0, 1);
    var doy = Math.round((x - first) / DAY) + 1;
    return WHISPERS[(doy - 1 + 14) % 14];
  }
  function dayLabel(d) {
    var diff = Math.round((startOfDay(new Date()) - startOfDay(d)) / DAY);
    var md = (d.getMonth() + 1) + '月' + d.getDate() + '日 星期' + WEEK[d.getDay()];
    if (diff === 0) return '今天 · ' + md;
    if (diff === 1) return '昨天 · ' + md;
    return md;
  }
  function moodDef(k) { for (var i = 0; i < MOODS.length; i++) if (MOODS[i].k === k) return MOODS[i]; return null; }
  function stickerDef(k) { for (var i = 0; i < STICKERS.length; i++) if (STICKERS[i].key === k) return STICKERS[i]; return null; }
  function stickerFor(name) {
    for (var i = 0; i < STICKERS.length; i++) if (STICKERS[i].name === name) return STICKERS[i];
    return null;
  }
  function stickerSvg(key, size) {
    var d = stickerDef(key) || STICKERS[0];
    var s = size || 64;
    return '<svg viewBox="0 0 64 64" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d.art + '</svg>';
  }

  var HEART_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.2l7.8-7.7 1.1-1.1a5.5 5.5 0 0 0-.1-7.8z"/></svg>';

  var REDUCE = false, COARSE = false;
  try {
    REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    COARSE = window.matchMedia('(hover:none)').matches;
  } catch (e) { /* noop */ }

  /* ================= 状态 ================= */
  var config = loadConfig();
  var chatSessions = loadChatSessions();
  var activeChatId = read(LS_ACTIVE_CHAT, chatSessions[0] ? chatSessions[0].id : 'chat-main');
  if (!chatSessions.some(function (item) { return item.id === activeChatId; })) activeChatId = chatSessions[0] ? chatSessions[0].id : 'chat-main';
  var history = loadActiveHistory();
  var pendingQuote = null, activeQuote = null, retryQuote = null, editingMessageIndex = -1;
  var messageSelectMode = false, selectedMessageIndices = Object.create(null);
  var moods = read('mizu.moods', []) || [];
  var memories = read('mizu.memories', []) || [];
  var notes = read('mizu.notes', {}) || {};
  var weather = read('mizu.weather', {}) || {};
  var letters = read('mizu.letters', []) || [];
  var playlist = read('mizu.playlist', []) || [];
  var phrases = read('mizu.quickPhrases', null);
  var statuses = read('mizu.statuses', null);
  var theme = config.theme || 'water';

  if (!Array.isArray(moods)) moods = [];
  if (!Array.isArray(memories)) memories = [];
  if (!Array.isArray(letters)) letters = [];
  if (!Array.isArray(playlist)) playlist = [];
  if (!Array.isArray(phrases) || !phrases.length) phrases = DEFAULT_PHRASES.slice();
  if (!Array.isArray(statuses) || !statuses.length) statuses = DEFAULT_STATUSES.slice();

  function loadConfig() {
    var raw = read(LS_CFG, {}) || {};
    return {
      endpoint: typeof raw.endpoint === 'string' && raw.endpoint.trim() ? raw.endpoint.trim() : DEF_ENDPOINT,
      apiKey: typeof raw.apiKey === 'string' ? raw.apiKey : '',
      model: typeof raw.model === 'string' && raw.model.trim() ? raw.model.trim() : DEF_MODEL,
      headers: Array.isArray(raw.headers) ? raw.headers.filter(function (h) {
        return h && typeof h.key === 'string' && h.key.trim();
      }).map(function (h) { return { key: h.key, value: String(h.value == null ? '' : h.value) }; }) : [],
      system: typeof raw.system === 'string' && raw.system.trim() ? raw.system : DEFAULT_SYSTEM,
      anniversary: typeof raw.anniversary === 'string' ? raw.anniversary : '',
      theme: ['water', 'rose', 'night'].indexOf(raw.theme) >= 0 ? raw.theme : 'water',
      wallpaper: typeof raw.wallpaper === 'string' ? raw.wallpaper : '',
      shell: raw.shell !== false,
      greeting: typeof raw.greeting === 'string' ? raw.greeting : '',
      statusLine: typeof raw.statusLine === 'string' && raw.statusLine.trim() ? raw.statusLine : '想你',
      musicUrl: typeof raw.musicUrl === 'string' ? raw.musicUrl.trim() : '',
      bubbleMode: raw.bubbleMode === 'single' ? 'single' : 'split',
      showReasoning: raw.showReasoning !== false,
      relation: raw.relation && typeof raw.relation === 'object' ? raw.relation : { word: '唯一的、确定的、我的人', since: '' }
    };
  }

  function normalizeHistory(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.filter(function (m) {
      return m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant');
    }).map(function (m) {
      var o = { role: m.role, content: m.content, ts: Number(m.ts) || Date.now() };
      if (m.loved) o.loved = true;
      if (m.reasoning) o.reasoning = String(m.reasoning);
      if (Array.isArray(m.toolCalls)) o.toolCalls = m.toolCalls.map(function (t) { return { name: String(t.name || 'tool'), arguments: String(t.arguments || ''), status: String(t.status || 'returned') }; });
      if (m.image) o.image = String(m.image);
      if (m.voice) o.voice = { dur: Number(m.voice.dur) || 3 };
      if (m.sticker) o.sticker = String(m.sticker);
      if (m.replyTo) o.replyTo = m.replyTo;
      return o;
    });
  }
  function loadHistory() {
    var raw;
    try { raw = localStorage.getItem(LS_HIS); } catch (e) { raw = null; }
    if (raw === null) return [{ role: 'assistant', content: WELCOME, ts: Date.now() }];
    return normalizeHistory(read(LS_HIS, []));
  }
  function loadChatSessions() {
    var saved = read(LS_CHATS, null);
    if (Array.isArray(saved) && saved.length) {
      var valid = saved.filter(function (item) {
        return item && typeof item.id === 'string' && Array.isArray(item.messages);
      }).map(function (item) {
        return {
          id: item.id,
          title: String(item.title || '新的聊天'),
          createdAt: Number(item.createdAt) || Date.now(),
          updatedAt: Number(item.updatedAt) || Number(item.createdAt) || Date.now(),
          messages: normalizeHistory(item.messages),
          settings: item.settings && typeof item.settings === 'object' ? item.settings : {},
          pinned: item.pinned === true,
          archived: item.archived === true,
          scrollState: item.scrollState && typeof item.scrollState === 'object' ? {
            atBottom: item.scrollState.atBottom === true,
            anchorIndex: Number.isInteger(Number(item.scrollState.anchorIndex)) ? Number(item.scrollState.anchorIndex) : -1,
            offset: Number.isFinite(Number(item.scrollState.offset)) ? Number(item.scrollState.offset) : 0,
            top: Math.max(0, Number(item.scrollState.top) || 0)
          } : null
        };
      });
      if (valid.length) return valid;
    }
    var legacy = loadHistory();
    var migrated = [{ id: 'chat-main', title: '我们的聊天', createdAt: legacy[0] ? legacy[0].ts : Date.now(), updatedAt: Date.now(), messages: legacy, settings: {} }];
    try {
      localStorage.setItem(LS_CHATS, JSON.stringify(migrated));
      localStorage.setItem(LS_ACTIVE_CHAT, JSON.stringify('chat-main'));
      localStorage.removeItem(LS_HIS);
    } catch (e) { /* 迁移失败时保留旧记录 */ }
    return migrated;
  }
  function activeChatSession() {
    for (var i = 0; i < chatSessions.length; i++) if (chatSessions[i].id === activeChatId) return chatSessions[i];
    return chatSessions[0] || null;
  }
  function loadActiveHistory() {
    var item = activeChatSession();
    return item ? normalizeHistory(item.messages) : [];
  }
  function saveChatSessions() {
    try {
      localStorage.setItem(LS_CHATS, JSON.stringify(chatSessions));
      localStorage.setItem(LS_ACTIVE_CHAT, JSON.stringify(activeChatId));
      return true;
    } catch (e) {
      toast('聊天窗口没有保存成功，请先导出本地备份并释放空间');
      return false;
    }
  }
  function saveHistory() {
    var item = activeChatSession();
    if (!item) return false;
    var previous = item.messages, previousUpdated = item.updatedAt, previousTitle = item.title;
    item.messages = history;
    item.updatedAt = Date.now();
    var firstUser = history.filter(function (m) { return m.role === 'user' && m.content; })[0];
    if (firstUser && (item.title === '我们的聊天' || item.title === '新的聊天')) {
      item.title = String(firstUser.content).replace(/\s+/g, ' ').slice(0, 18) || '新的聊天';
    }
    if (!saveChatSessions()) {
      item.messages = previous; item.updatedAt = previousUpdated; item.title = previousTitle;
      return false;
    }
    return true;
  }
  function chatSetting(key, fallback) {
    var item = activeChatSession();
    return item && item.settings && Object.prototype.hasOwnProperty.call(item.settings, key) ? item.settings[key] : fallback;
  }
  function renderChatTitle() {
    var name = document.querySelector('#chatTitleBtn .chat-title-name');
    if (name) name.textContent = activeChatSession() ? activeChatSession().title : '我们的聊天';
  }
  var chatSidebarQuery = '';
  var chatSidebarFilter = 'active';
  var chatSidebarCloseTimer = null;
  function renderChatSidebar() {
    var host = $('chatSessionList');
    if (!host) return;
    var query = chatSidebarQuery.trim();
    var lowQuery = query.toLowerCase();
    var sorted = chatSessions.slice().sort(function (a, b) { return Number(b.pinned === true) - Number(a.pinned === true) || b.updatedAt - a.updatedAt; });
    function messageText(message) {
      return String(message.content || (message.image ? '照片' : message.sticker ? '贴纸' : message.voice ? '语音' : ''));
    }
    function highlightPreview(value) {
      var raw = String(value || '');
      if (!lowQuery) return esc(raw);
      var low = raw.toLowerCase(), at = low.indexOf(lowQuery);
      if (at < 0) return esc(raw);
      var from = Math.max(0, at - 22), to = Math.min(raw.length, at + query.length + 34);
      var before = from ? '…' : '', after = to < raw.length ? '…' : '';
      return before + esc(raw.slice(from, at)) + '<mark class="chat-session-hit">' + esc(raw.slice(at, at + query.length)) + '</mark>' + esc(raw.slice(at + query.length, to)) + after;
    }
    var visible = sorted.filter(function (item) {
      if (chatSidebarFilter === 'archived' ? !item.archived : item.archived) return false;
      var last = item.messages && item.messages.length ? item.messages[item.messages.length - 1] : null;
      var preview = last ? messageText(last).replace(/\s+/g, ' ').slice(0, 42) : '还没有消息';
      var transcript = (item.messages || []).map(messageText).join(' ');
      return !lowQuery || (String(item.title || '') + ' ' + preview + ' ' + transcript).toLowerCase().indexOf(lowQuery) >= 0;
    });
    host.innerHTML = visible.length ? visible.map(function (item) {
      var messages = item.messages || [];
      var last = messages.length ? messages[messages.length - 1] : null;
      var preview = last ? messageText(last).replace(/\s+/g, ' ').slice(0, 42) : '还没有消息，点进来开始聊天';
      var hitCount = lowQuery ? messages.filter(function (message) { return messageText(message).toLowerCase().indexOf(lowQuery) >= 0; }).length : 0;
      var firstHitIndex = lowQuery ? messages.findIndex(function (message) { return messageText(message).toLowerCase().indexOf(lowQuery) >= 0; }) : -1;
      var title = esc(item.title || '未命名窗口');
      var previewMarkup = lowQuery ? highlightPreview(preview) : esc(preview);
      if (lowQuery && preview.toLowerCase().indexOf(lowQuery) < 0) {
        var hitMessage = messages.find(function (message) { return messageText(message).toLowerCase().indexOf(lowQuery) >= 0; });
        if (hitMessage) previewMarkup = highlightPreview(messageText(hitMessage).replace(/\s+/g, ' '));
        else if (String(item.title || '').toLowerCase().indexOf(lowQuery) >= 0) previewMarkup = '窗口名称匹配';
      }
      return '<div class="chat-session-row' + (item.id === activeChatId ? ' is-active' : '') + (item.pinned ? ' is-pinned' : '') + (lowQuery ? ' has-search-hit' : '') + '">' +
        '<button class="chat-session-open" type="button" data-chat-switch="' + esc(item.id) + '" data-chat-hit-index="' + firstHitIndex + '">' +
        '<span class="chat-session-avatar">水</span><span class="chat-session-copy"><b>' + (lowQuery && String(item.title || '').toLowerCase().indexOf(lowQuery) >= 0 ? highlightPreview(item.title) : title) + '</b><small>' + previewMarkup + '</small>' +
        (lowQuery ? '<i class="chat-session-hit-count">命中 ' + hitCount + ' 条消息</i>' : '') +
        (item.id === activeChatId ? '<i class="chat-session-current">当前窗口</i>' : '') + '</span>' +
        '<time>' + hhmm(item.updatedAt) + '</time></button>' +
        '<div class="chat-session-tools">' +
        '<button type="button" data-chat-pin="' + esc(item.id) + '" aria-label="' + (item.pinned ? '取消置顶' : '置顶') + '">' + (item.pinned ? '★' : '☆') + '</button>' +
        '<button type="button" data-chat-archive="' + esc(item.id) + '" aria-label="' + (item.archived ? '取消归档' : '归档') + '">' + (item.archived ? '↶' : '⌑') + '</button>' +
        (chatSessions.length > 1 ? '<button class="chat-session-delete" type="button" data-chat-delete="' + esc(item.title || '聊天窗口') + '" data-chat-id="' + esc(item.id) + '" aria-label="删除' + esc(item.title || '聊天窗口') + '">×</button>' : '') +
        '</div>' +
        '</div>';
    }).join('') : '<p class="chat-session-empty">' + (lowQuery ? '没有找到匹配的聊天内容' : '这里还没有对话') + '</p>';
    var count = $('chatSessionCount');
    var totalInFilter = chatSessions.filter(function (item) { return chatSidebarFilter === 'archived' ? item.archived : !item.archived; }).length;
    if (count) count.textContent = String(visible.length).padStart(2, '0') + ' / ' + String(totalInFilter).padStart(2, '0') + ' WINDOWS';
    var sectionTitle = $('chatSessionSectionTitle');
    if (sectionTitle) sectionTitle.textContent = lowQuery ? '搜索结果' : (chatSidebarFilter === 'archived' ? '归档的对话' : '最近的对话');
    Array.prototype.forEach.call(document.querySelectorAll('[data-chat-filter]'), function (button) {
      var active = button.getAttribute('data-chat-filter') === chatSidebarFilter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }
  function openChatSidebar() {
    var scrim = $('chatSidebarScrim');
    if (!scrim) return;
    if (chatSidebarCloseTimer) { clearTimeout(chatSidebarCloseTimer); chatSidebarCloseTimer = null; }
    renderChatSidebar();
    scrim.hidden = false;
    requestAnimationFrame(function () {
      scrim.classList.add('is-open');
      var search = $('chatSessionSearch');
      if (search) search.focus();
    });
    $('chatMenu').setAttribute('aria-expanded', 'true');
  }
  function closeChatSidebar() {
    var scrim = $('chatSidebarScrim');
    if (!scrim) return;
    scrim.classList.remove('is-open');
    $('chatMenu').setAttribute('aria-expanded', 'false');
    if (chatSidebarCloseTimer) clearTimeout(chatSidebarCloseTimer);
    chatSidebarCloseTimer = setTimeout(function () {
      if (!scrim.classList.contains('is-open')) scrim.hidden = true;
      chatSidebarCloseTimer = null;
    }, 300);
  }
  function createChatSession() {
    if (sending) { toast('等这条消息发送完成，再开启新窗口吧'); return; }
    captureChatScrollState(true);
    if (!saveHistory()) return;
    var id = 'chat-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    var item = { id: id, title: '新的聊天', createdAt: Date.now(), updatedAt: Date.now(), messages: [], settings: {}, pinned: false, archived: false };
    chatSessions.push(item);
    var previous = activeChatId;
    activeChatId = id;
    if (!saveChatSessions()) {
      chatSessions.pop();
      activeChatId = previous;
      return;
    }
    history = [];
    pendingQuote = null; activeQuote = null; retryQuote = null; retryPayload = ''; editingMessageIndex = -1;
    closeChatSidebar();
    renderChatTitle(); renderChat(); renderHome(); scrollToBottom(true);
    toast('新聊天窗口已打开');
  }
  function switchChatSession(id) {
    if (sending) { toast('请等当前回复结束后再切换窗口'); return; }
    var target = chatSessions.filter(function (item) { return item.id === id; })[0];
    if (!target || target.id === activeChatId) { closeChatSidebar(); return; }
    captureChatScrollState(true);
    if (!saveHistory()) return;
    var previousId = activeChatId, previousHistory = history;
    activeChatId = id;
    history = normalizeHistory(target.messages);
    pendingQuote = null; activeQuote = null; retryQuote = null; retryPayload = ''; editingMessageIndex = -1;
    if (!saveChatSessions()) { activeChatId = previousId; history = previousHistory; return; }
    closeChatSidebar();
    renderChatTitle(); renderChat(); renderHome(); restoreChatScrollState();
    updateStatus();
  }
  function updateChatSessionFlag(id, key, value) {
    var item = chatSessions.find(function (session) { return session.id === id; });
    if (!item || (key !== 'pinned' && key !== 'archived')) return;
    var previous = item[key];
    item[key] = value;
    if (!saveChatSessions()) { item[key] = previous; return; }
    if (key === 'archived' && value && id === activeChatId) {
      var fallback = chatSessions.find(function (session) { return session.id !== id && !session.archived; });
      if (fallback) switchChatSession(fallback.id);
      else { item[key] = previous; saveChatSessions(); toast('至少保留一个未归档的聊天窗口'); }
    }
    renderChatSidebar();
    toast(key === 'pinned' ? (value ? '已置顶这段对话' : '已取消置顶') : (value ? '已移入归档' : '已恢复到最近对话'));
  }

  function deleteChatSession(id) {
    if (chatSessions.length < 2) { toast('至少保留一个聊天窗口'); return; }
    if (!window.confirm('删除这个聊天窗口？其中的消息记录也会一起删除。')) return;
    var index = chatSessions.findIndex(function (item) { return item.id === id; });
    if (index < 0) return;
    var oldSessions = chatSessions.slice(), oldId = activeChatId, oldHistory = history;
    var wasActive = id === activeChatId;
    if (wasActive) captureChatScrollState(true);
    chatSessions.splice(index, 1);
    if (wasActive) {
      var next = chatSessions[0];
      activeChatId = next.id;
      history = normalizeHistory(next.messages);
      pendingQuote = null; activeQuote = null; retryQuote = null; retryPayload = '';
    }
    if (!saveChatSessions()) { chatSessions = oldSessions; activeChatId = oldId; history = oldHistory; return; }
    renderChatSidebar(); renderChatTitle(); renderChat(); renderHome();
    toast('聊天窗口已删除');
  }
  function openChatSettings() {
    var item = activeChatSession();
    if (!item) return;
    var bubble = chatSetting('bubbleMode', config.bubbleMode || 'split');
    var reasoning = chatSetting('showReasoning', config.showReasoning !== false);
    var times = chatSetting('showTimestamps', true);
    var toolsVisible = chatSetting('showToolCalls', true);
    openSheet('<div class="panel-head"><div><p class="chat-settings-kicker">THIS WINDOW · CHAT SETTINGS</p><h2 class="panel-title">当前窗口设置</h2></div><button class="icon-btn" data-close type="button" aria-label="关闭">' + X2 + '</button></div>' +
      '<label class="field"><span class="field-label">窗口名称</span><input id="chatPrefTitle" type="text" maxlength="24" placeholder="给这段聊天取个名字"></label>' +
      '<label class="field"><span class="field-label">回复气泡排版</span><select id="chatPrefBubble"><option value="split">分割气泡 · 按段落拆开</option><option value="single">完整气泡 · 保持一整条</option></select><span class="field-hint">只影响当前聊天窗口，不会改动其他窗口。</span></label>' +
      '<label class="field"><span class="field-label">思考摘要</span><select id="chatPrefReason"><option value="show">显示接口返回的思考摘要</option><option value="hide">隐藏思考摘要</option></select><span class="field-hint">只显示服务商实际返回的 reasoning 摘要，不展示模型隐藏的内部思维链。</span></label>' +
      '<label class="field"><span class="field-label">消息时间</span><select id="chatPrefTimes"><option value="show">显示每条消息时间</option><option value="hide">隐藏消息时间</option></select></label>' +
      '<label class="field"><span class="field-label">工具调用记录</span><select id="chatPrefTools"><option value="show">显示折叠的调用记录</option><option value="hide">隐藏调用记录</option></select><span class="field-hint">只影响当前窗口的显示，不影响接口请求和已保存记录。</span></label>' +
      '<button class="btn-primary" id="chatPrefSave" type="button" style="width:100%;margin-top:14px">保存当前窗口设置</button>',
      function (ov, close) {
        ov.querySelector('#chatPrefTitle').value = item.title || '';
        ov.querySelector('#chatPrefBubble').value = bubble;
        ov.querySelector('#chatPrefReason').value = reasoning ? 'show' : 'hide';
        ov.querySelector('#chatPrefTimes').value = times ? 'show' : 'hide';
        ov.querySelector('#chatPrefTools').value = toolsVisible ? 'show' : 'hide';
        ov.querySelector('#chatPrefSave').addEventListener('click', function () {
          var previous = item.settings || {}, previousTitle = item.title;
          item.title = ov.querySelector('#chatPrefTitle').value.trim() || previousTitle;
          item.settings = Object.assign({}, previous, {
            bubbleMode: ov.querySelector('#chatPrefBubble').value,
            showReasoning: ov.querySelector('#chatPrefReason').value !== 'hide',
            showTimestamps: ov.querySelector('#chatPrefTimes').value !== 'hide',
            showToolCalls: ov.querySelector('#chatPrefTools').value !== 'hide'
          });
          if (!saveChatSessions()) { item.settings = previous; item.title = previousTitle; return; }
          renderChatTitle(); renderChatSidebar(); renderChat(); close(); toast('当前窗口设置已保存');
        });
      });
  }
  function saveConfig() {
    try { localStorage.setItem(LS_CFG, JSON.stringify(config)); return true; }
    catch (e) {
      if (config.wallpaper) {
        config.wallpaper = '';
        applyWallpaper();
        toast('壁纸太大存不下 · 已回到晨雾默认');
        try { localStorage.setItem(LS_CFG, JSON.stringify(config)); return true; } catch (e2) { /* noop */ }
      }
      toast('湖面的容量满了，先让一些碎片沉下去吧');
      return false;
    }
  }

  function relationshipStart() {
    var ann = parseISO(config.anniversary);
    if (ann) return startOfDay(ann);
    if (history.length) {
      var min = Infinity;
      for (var i = 0; i < history.length; i++) if (history[i].ts < min) min = history[i].ts;
      if (isFinite(min)) return startOfDay(min);
    }
    return startOfDay(new Date());
  }
  function daysTogether() {
    var n = Math.round((startOfDay(new Date()) - relationshipStart()) / DAY) + 1;
    return n < 1 ? 1 : n;
  }
  function lovedMessages() {
    return history.filter(function (m) { return m.role !== 'user' && m.loved && !m.sticker; })
      .sort(function (a, b) { return a.ts - b.ts; });
  }
  function moodOfDay(iso) {
    var found = null;
    for (var i = 0; i < moods.length; i++) if (moods[i] && sameDay(moods[i].ts, iso)) found = moods[i];
    return found;
  }

  /* ================= 主题 ================= */
  function applyTheme(t) {
    theme = ['water', 'rose', 'night'].indexOf(t) >= 0 ? t : 'water';
    if (theme === 'water') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'night' ? '#152832' : (theme === 'rose' ? '#F7E8F0' : '#C9EDF7'));
    forEach(document.querySelectorAll('[data-theme-name]'), function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-theme-name') === theme);
    });
    if (currentView === 'archive') renderGalaxy();
  }
  function forEach(list, fn) { Array.prototype.forEach.call(list, fn); }

  /* ================= DOM ================= */
  var viewHome = $('view-home');
  var viewChat = $('view-chat');
  var chatScroll = $('chatScroll');
  var msgList = $('msgList');
  var msgInput = $('msgInput');
  var sendBtn = $('sendBtn');
  var jumpBtn = $('jumpBtn');
  var statusText = $('statusText');
  var profileOverlay = $('profileOverlay');
  var settingsOverlay = $('settingsOverlay');
  var toastEl = $('toast');
  var splash = $('splash');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));

  /* ================= 手机导航 ================= */
  var currentView = 'home';
  var homeIndex = 0;
  var HOME_PAGES = 4;
  var screenEl = $('screen');
  var appsEl = $('apps');
  var appBarEl = $('appBar');
  var appNameEl = $('appName');
  var homeEl = $('home');
  var lockEl = $('lock');
  var dockEl = $('dock');
  var pagesEl = $('pages');

  var APPS = [
    { k: 'album', label: '相册', svg: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M4 16l4.4-4.4a2 2 0 0 1 2.8 0L15 15l1.8-1.8a2 2 0 0 1 2.8 0L20.5 15"/><circle cx="9" cy="9.5" r="1.2"/>' },
    { k: 'journal', label: '手帐', svg: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5z"/><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H12v16h6.5A1.5 1.5 0 0 0 20 18.5z"/>' },
    { k: 'letters', label: '信件', svg: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M4 7.5l8 5.5 8-5.5"/>' },
    { k: 'archive', label: '记忆库', svg: '<path d="M12 4.2c3.6 4.2 5.6 7.2 5.6 9.6a5.6 5.6 0 1 1-11.2 0c0-2.4 2-5.4 5.6-9.6z"/>' },
    { k: 'stars', label: '星河', svg: '<path d="M12 3.5l2.3 5.9 6.2 1.4-5.5 3.4.6 6.3-5.6-3.6-5.6 3.6.6-6.3-5.5-3.4 6.2-1.4z" transform="translate(2.6 1.2) scale(.78)"/>' },
    { k: 'music', label: '音乐', svg: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>' },
    { k: 'settings', label: '设置', svg: '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.6M12 17.9v2.6M3.5 12h2.6M17.9 12h2.6M6 6l1.9 1.9M16.1 16.1L18 18M18 6l-1.9 1.9M7.9 16.1L6 18"/>' },
    { k: 'more', label: '更多', svg: '<circle cx="6" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18" cy="12" r="1.2" fill="currentColor"/>' }
  ];

  var APP_TITLE = { album: '相册', journal: '手帐', letters: '信件', archive: '记忆库', more: '更多', chat: '聊天' };

  function renderAppGrid() {
    var grid = $('appGrid');
    if (!grid) return;
    grid.innerHTML = APPS.map(function (a) {
      return '<div class="app-cell"><button class="app-icon" data-app="' + a.k + '" type="button" aria-label="' + a.label + '">' +
        '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + a.svg + '</svg>' +
        '</button><span class="app-label">' + a.label + '</span></div>';
    }).join('');
  }

  function setDock(app) {
    forEach(document.querySelectorAll('.dock-btn'), function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-app') === app);
    });
  }

  function openApp(name, originEl, pane) {
    if (!name) return;
    var nextAppName = name === 'stars' ? 'archive' : name;
    if (currentView === 'chat' && nextAppName !== 'chat') captureChatScrollState(true);
    if (name === 'settings') { openSettings(); return; }
    if (name === 'music') { openMusic(); return; }
    var appName = name === 'stars' ? 'archive' : name;
    var el = document.getElementById('view-' + appName);
    if (!el) return;

    currentView = appName;
    appsEl.classList.toggle('is-chat', appName === 'chat');
    if (appName !== 'chat') appNameEl.textContent = APP_TITLE[appName] || '';

    forEach(document.querySelectorAll('.app'), function (a) {
      a.classList.toggle('is-active', a.id === 'view-' + appName);
    });

    if (originEl && screenEl) {
      var r = originEl.getBoundingClientRect();
      var s = screenEl.getBoundingClientRect();
      var ox = ((r.left + r.width / 2 - s.left) / s.width) * 100;
      var oy = ((r.top + r.height / 2 - s.top) / s.height) * 100;
      appsEl.style.transformOrigin = ox.toFixed(1) + '% ' + oy.toFixed(1) + '%';
    } else {
      appsEl.style.transformOrigin = '50% 50%';
    }

    appsEl.classList.remove('is-closing');
    appsEl.classList.add('is-open');
    if (screenEl) screenEl.classList.add('is-app');
    setDock(appName);

    if (appName === 'archive') {
      arcPane = pane === 'stars' ? 'stars' : 'abyss';
      syncArcSeg();
      renderArchive();
      if (arcPane === 'stars') startGalaxy();
    } else if (appName === 'album') {
      renderAlbum();
    } else if (appName === 'journal') {
      renderJournal();
    } else if (appName === 'letters') {
      renderLetters();
    } else if (appName === 'more') {
      /* 静态页 */
    } else if (appName === 'chat') {
      renderChat();
      restoreChatScrollState();
    }
  }


  /* ================= 原版网易云播放器 ================= */
  function openMusic() {
    if (!config.musicUrl) {
      openSheet('<div class="panel-head"><h2 class="panel-title">连接音乐服务</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X + '</button></div>' +
        '<p class="field-hint">这里接入 Anko3o/Music-Mcp-Netease 原版播放器。需要先部署它的 Python 服务，GitHub Pages 只负责展示界面，不能运行音乐后端。</p>' +
        '<label class="field"><span class="field-label">播放器服务地址 · HTTPS</span><input id="musicServerUrl" type="url" spellcheck="false" placeholder="https://你的音乐服务地址"></label>' +
        '<div class="panel-actions"><button class="btn-primary" id="musicConnect" type="button">连接播放器</button></div>',
        function (ov, close) {
          ov.querySelector('#musicConnect').addEventListener('click', function () {
            var url = ov.querySelector('#musicServerUrl').value.trim();
            if (url.endsWith('/')) url = url.slice(0, -1);
            if (url.indexOf('https://') !== 0 && !/^http:\/\/localhost(?::\d+)?$/i.test(url)) {
              toast('请输入有效的 HTTPS 服务地址'); return;
            }
            config.musicUrl = url;
            saveConfig();
            close();
            openMusic();
          });
        });
      return;
    }
    var old = document.getElementById('musicHostOverlay');
    if (old) old.remove();
    var overlay = document.createElement('div');
    overlay.id = 'musicHostOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:1200;background:var(--paper);display:flex;flex-direction:column;padding-top:env(safe-area-inset-top);';
    overlay.innerHTML = '<div style="height:44px;flex:0 0 44px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;background:var(--paper);border-bottom:1px solid var(--line);"><span style="font-family:var(--serif);font-size:16px;color:var(--ink)">MUSIC · 一起听</span><button type="button" id="musicHostClose" aria-label="关闭" style="border:0;background:transparent;color:var(--ink);font-size:24px;padding:0 8px">×</button></div><iframe title="网易云音乐播放器" allow="autoplay; fullscreen; picture-in-picture" referrerpolicy="no-referrer" style="border:0;width:100%;height:calc(100% - 44px);flex:1;background:transparent"></iframe>';
    document.body.appendChild(overlay);
    overlay.querySelector('iframe').src = config.musicUrl + '/';
    overlay.querySelector('#musicHostClose').addEventListener('click', function () { overlay.remove(); });
  }

  function closeApp() {
    if (currentView === 'home') return;
    var was = currentView;
    currentView = 'home';
    if (was === 'archive') stopGalaxy();
    appsEl.classList.remove('is-open');
    appsEl.classList.add('is-closing');
    if (screenEl) screenEl.classList.remove('is-app');
    setTimeout(function () { appsEl.classList.remove('is-closing'); }, 260);
    setDock('');
    renderHome();
  }

  /* 兼容旧调用：switchView → 打开应用 */
  function switchView(name) {
    if (name === 'home') { closeApp(); return; }
    openApp(name);
  }
  function goBack() { closeApp(); }

  /* ---- 主屏分页 ---- */
  function goPage(i, animate) {
    homeIndex = Math.max(0, Math.min(HOME_PAGES - 1, i));
    if (pagesEl) {
      pagesEl.classList.toggle('is-drag', animate === false);
      pagesEl.style.transform = 'translate3d(' + (-100 / HOME_PAGES * homeIndex) + '%,0,0)';
      if (animate === false) requestAnimationFrame(function () { pagesEl.classList.remove('is-drag'); });
    }
    var dots = $('dots');
    if (dots) {
      forEach(dots.children, function (d, k) {
        d.classList.toggle('is-on', k === homeIndex);
      });
    }
    if (pagesEl) {
      forEach(pagesEl.querySelectorAll('.hpage'), function (page, k) {
        page.classList.toggle('is-current', k === homeIndex);
      });
    }
  }

  function buildDots() {
    var dots = $('dots');
    if (!dots) return;
    var out = '';
    for (var di = 0; di < HOME_PAGES; di++) out += '<span class="dot-i' + (di === 0 ? ' is-on' : '') + '"></span>';
    dots.innerHTML = out;
    goPage(homeIndex, false);
  }

  /* ---- 解锁 ---- */
  var locked = true;
  function unlock() {
    if (!locked) return;
    locked = false;
    if (lockEl) {
      lockEl.classList.add('is-out');
      setTimeout(function () { lockEl.style.display = 'none'; }, 260);
    }
    if (homeEl) homeEl.classList.add('is-on');
    if (screenEl) screenEl.classList.remove('is-locked');
    goPage(0, false);
  }

  /* ---- 壁纸 ---- */
  function applyWallpaper() {
    var wall = $('wall');
    var url = (config.wallpaper || '').trim();
    if (!wall || !screenEl) return;
    if (url) {
      wall.style.backgroundImage = 'url("' + url.replace(/"/g, '%22') + '")';
      screenEl.classList.add('has-wall');
    } else {
      wall.style.backgroundImage = '';
      screenEl.classList.remove('has-wall');
    }
  }

  /* ---- 手机壳 ---- */
  function applyShell() {
    var phone = $('phone');
    if (!phone) return;
    if (config.shell === false) phone.classList.add('is-bare');
    else phone.classList.remove('is-bare');
    fitScreen();
  }

  function fitScreen() {
    if (!screenEl) return;
    if (window.innerWidth < 768 || config.shell === false) {
      screenEl.style.setProperty('--s', '1');
      return;
    }
    var availH = window.innerHeight - 96;
    var availW = window.innerWidth - 64;
    var s = Math.min(1, availH / 844, availW / 390);
    screenEl.style.setProperty('--s', s.toFixed(3));
  }

  /* ================= 首页 ================= */
  function renderClock() {
    var now = new Date();
    var hm = pad2(now.getHours()) + ':' + pad2(now.getMinutes());
    var md = (now.getMonth() + 1) + '月' + now.getDate() + '日 星期' + WEEK[now.getDay()];
    var lc = $('lockClock'), ld = $('lockDate');
    if (lc) lc.textContent = hm;
    if (ld) ld.textContent = md;
    var ht = $('hpTime'), hd = $('hpDate');
    if (ht) ht.textContent = hm;
    if (hd) hd.textContent = md;
  }

  function renderHome() {
    renderClock();

    var n = daysTogether();
    var days = $('hpDays'), since = $('hpSince');
    if (days) days.textContent = String(n);
    if (since) since.textContent = 'since ' + fmtPlain(relationshipStart());

    var w = whisperOf(new Date());
    var dEl = $('hpDiary');
    if (dEl) dEl.textContent = w;
    var dd = $('hpDiaryDay');
    if (dd) dd.textContent = 'Day ' + n;

    var lw = $('lockWhisper');
    if (lw) lw.textContent = w;
    var ld = $('lockDays');
    if (ld) ld.textContent = String(n);
    var ls = $('lockSince');
    if (ls) ls.textContent = 'SINCE ' + fmtPlain(relationshipStart());
    var ls2 = $('lockSince2');
    if (ls2) ls2.textContent = (config.anniversary ? 'anniversary · 纪念日' : 'first hello · 初见');

    /* 第三屏：最近一张记忆 */
    var latest = null;
    memories.forEach(function (m) { if (!latest || m.ts > latest.ts) latest = m; });
    var thumb = $('hpThumb');
    var cap = $('hpSpaceCap');
    if (thumb) thumb.style.backgroundImage = latest ? 'url("' + String(latest.img).replace(/"/g, '%22') + '")' : '';
    if (cap) cap.textContent = latest ? (latest.caption || fmtPlain(new Date(latest.ts))) : '还没有照片 · 先去相册放一张';

    var todayN = 0;
    var iso = isoOf();
    history.forEach(function (m) { if (isoOf(new Date(m.ts)) === iso) todayN++; });
    var wc = $('wCountVal'); if (wc) wc.textContent = String(todayN);
    var wt = $('wTimeVal');
    if (wt) {
      var oldest = null;
      archive.forEach(function (m) { if (!oldest || m.ts < oldest.ts) oldest = m; });
      wt.textContent = oldest ? Math.max(1, Math.floor((Date.now() - oldest.ts) / DAY)) + ' 天前' : '还没有';
    }
    var ww = $('wWeatherVal');
    if (ww) ww.textContent = (weather[isoOf()] || '').trim() || '雾';
    var np = playlist[0] || null;
    var nt = $('hpNowTitle'), na = $('hpNowArtist'), nc = $('hpNowCover');
    if (nt) nt.textContent = np ? (np.title || '未命名') : '还没有歌 · 建一张歌单吧';
    if (na) na.textContent = np ? ((np.artist || '小沢 & 你') + ' · 共听') : 'PLAYLIST · 共听';
    if (nc) nc.style.backgroundImage = np && np.cover ? 'url("' + np.cover + '")' : '';
    renderMoodCard();
    applyWallpaper();
  }

  function renderMoodCard() {
    var today = moodOfDay(isoOf());
    var def = today ? moodDef(today.mood) : null;
    var el = $('homeMoodWord');
    if (el) el.textContent = def ? def.name : config.statusLine;
    var row = $('moodRow');
    if (row) {
      row.innerHTML = MOODS.map(function (m) {
        var on = !!(today && today.mood === m.k);
        return '<button class="mood-btn' + (on ? ' is-on' : '') + '" data-mood="' + m.k + '" type="button" aria-pressed="' + (on ? 'true' : 'false') + '" aria-label="' + m.name + '">' +
          '<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M12 4.4c3.4 4 5.4 6.9 5.4 9.3a5.4 5.4 0 1 1-10.8 0c0-2.4 2-5.3 5.4-9.3z" fill="' + (on ? 'rgba(127,212,232,.3)' : 'none') + '" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
          (on ? '<path d="' + m.mark + '" fill="none" stroke="currentColor" stroke-width="1.6"/>' : '') +
          '</svg></button>';
      }).join('');
    }
    renderMoodChart();
  }

  function setMood(k) {
    var iso = isoOf();
    var cur = moodOfDay(iso);
    moods = moods.filter(function (m) { return !sameDay(m.ts, iso); });
    if (!(cur && cur.mood === k)) moods.push({ mood: k, ts: Date.now() });
    write('mizu.moods', moods);
    renderMoodCard();
  }

  function renderMoodChart() {
    var box = $('moodChart');
    if (!box) return;
    var now = new Date();
    var days = [];
    for (var i = 6; i >= 0; i--) {
      var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      var m = moodOfDay(isoOf(d));
      var def = m ? moodDef(m.mood) : null;
      days.push({ d: d, level: def ? def.level : null });
    }
    var W = 320, H = 104, L = 22, R = 14, TOP = 16, BOT = 82;
    function y(level) { return TOP + (level - 1) / 4 * (BOT - TOP); }
    function x(i) { return L + i * (W - L - R) / 6; }

    var s = '<svg viewBox="0 0 320 104" preserveAspectRatio="xMidYMid meet" role="img" aria-label="近七天心情曲线">';
    for (var lv = 1; lv <= 5; lv++) {
      s += '<line class="chart-grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(lv).toFixed(1) + '" y2="' + y(lv).toFixed(1) + '"/>';
    }
    var pts = [];
    days.forEach(function (day, i) { if (day.level) pts.push(x(i).toFixed(1) + ',' + y(day.level).toFixed(1)); });
    if (pts.length > 1) s += '<polyline class="chart-line" points="' + pts.join(' ') + '"/>';
    days.forEach(function (day, i) {
      var cx = x(i).toFixed(1);
      if (day.level) {
        var today = i === 6;
        s += '<circle class="' + (today ? 'chart-dot-today' : 'chart-dot') + '" cx="' + cx + '" cy="' + y(day.level).toFixed(1) + '" r="' + (today ? 4.6 : 3.2) + '"/>';
      } else {
        s += '<circle class="chart-ghost" cx="' + cx + '" cy="' + y(3).toFixed(1) + '" r="3.2"/>';
      }
      s += '<text class="chart-label" x="' + cx + '" y="' + (H - 6) + '" text-anchor="middle">' + (i === 6 ? '今' : WEEK[day.d.getDay()]) + '</text>';
    });
    s += '</svg>';
    box.innerHTML = s;
  }

  /* ================= 聊天渲染 ================= */
  var stickyBottom = true;
  var renderedCount = 0;
  var searchTerm = '';
  var searchOpen = false;
  var searchCursor = -1;

  var chatScrollSaveTimer = null;
  function captureChatScrollState(persist) {
    if (persist && chatScrollSaveTimer) { clearTimeout(chatScrollSaveTimer); chatScrollSaveTimer = null; }
    var session = activeChatSession();
    if (!session || !chatScroll) return;
    var atBottom = isNearBottom();
    var state = { atBottom: atBottom, anchorIndex: -1, offset: 0, top: Math.max(0, chatScroll.scrollTop || 0) };
    if (!atBottom) {
      var box = chatScroll.getBoundingClientRect();
      var nodes = msgList.querySelectorAll('.msg[data-index]');
      for (var i = 0; i < nodes.length; i++) {
        var rect = nodes[i].getBoundingClientRect();
        if (rect.bottom > box.top + 8) {
          state.anchorIndex = Number(nodes[i].dataset.index);
          state.offset = rect.top - box.top;
          break;
        }
      }
    }
    session.scrollState = state;
    if (persist) saveChatSessions();
    return state;
  }
  function scheduleChatScrollSave() {
    if (chatScrollSaveTimer) clearTimeout(chatScrollSaveTimer);
    chatScrollSaveTimer = setTimeout(function () {
      chatScrollSaveTimer = null;
      captureChatScrollState(true);
    }, 420);
  }
  function restoreChatScrollState() {
    var session = activeChatSession(), state = session && session.scrollState;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (!state || state.atBottom) {
          scrollToBottom(false);
        } else {
          var target = state.anchorIndex >= 0 ? msgList.querySelector('.msg[data-index="' + state.anchorIndex + '"]') : null;
          if (target) {
            var box = chatScroll.getBoundingClientRect(), rect = target.getBoundingClientRect();
            chatScroll.scrollTop = Math.max(0, chatScroll.scrollTop + rect.top - box.top - state.offset);
          } else {
            chatScroll.scrollTop = Math.min(state.top || 0, Math.max(0, chatScroll.scrollHeight - chatScroll.clientHeight));
          }
        }
        stickyBottom = isNearBottom();
        updateJump();
        updateChatDateNavFromScroll();
        captureChatScrollState(false);
      });
    });
  }

  function isNearBottom() {
    return chatScroll.scrollHeight - chatScroll.scrollTop - chatScroll.clientHeight < 96;
  }
  function scrollToBottom(smooth) {
    var top = chatScroll.scrollHeight;
    if (smooth && !REDUCE && chatScroll.scrollTo) {
      try { chatScroll.scrollTo({ top: top, behavior: 'smooth' }); return; } catch (e) { /* noop */ }
    }
    chatScroll.scrollTop = top;
  }
  function updateJump() {
    var show = !isNearBottom() && chatScroll.scrollHeight > chatScroll.clientHeight + 96;
    jumpBtn.classList.toggle('show', show);
  }
  function updateThoughts() {
    var n = 0;
    for (var i = 0; i < history.length; i++) if (history[i].role !== 'user') n++;
    var el = $('thoughtCount');
    if (el) el.textContent = String(n);
  }
  function updateStatus() {
    if (!statusText) return;
    if (isTyping) { statusText.textContent = '正在输入…'; return; }
    var ann = parseISO(config.anniversary);
    statusText.textContent = ann ? '在一起的第 ' + daysTogether() + ' 天 · 正想着你' : '在线 · 正想着你';
  }

  function highlight(text) {
    var source = String(text || '');
    var marks = [];
    if (searchTerm) {
      try {
        var re = new RegExp(searchTerm.replace(/[{}.*+?^$()|[\]\\]/g, '\\$&'), 'gi');
        source = source.replace(re, function (match) {
          var token = '\u0000MIZUMARK' + marks.length + '\u0000';
          marks.push(match);
          return token;
        });
      } catch (e) { /* keep the original text if the search expression is invalid */ }
    }
    function inline(value) {
      var tokens = [];
      function stash(html) {
        var token = '\u0000MIZULINK' + tokens.length + '\u0000';
        tokens.push(html);
        return token;
      }
      function safeHref(raw) {
        var candidate = String(raw || '').trim();
        if (!candidate || /[\u0000-\u0020\u007f]/.test(candidate)) return '';
        return /^(?:https?:\/\/|mailto:)/i.test(candidate) ? candidate : '';
      }
      var source = String(value || '');
      // Keep inline code literal so link syntax inside it is never activated.
      source = source.replace(/\x60([^\x60\n]+)\x60/g, function (_, code) {
        return stash('<code>' + esc(code) + '</code>');
      });
      // Markdown links accept only absolute HTTP(S) and mailto destinations.
      source = source.replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, function (whole, label, rawUrl) {
        var href = safeHref(rawUrl);
        if (!href) return whole;
        var external = /^https?:/i.test(href);
        return stash('<a href="' + esc(href) + '"' + (external ? ' target="_blank" rel="noopener noreferrer nofollow"' : '') + '>' + esc(label) + '</a>');
      });
      // Plain web addresses become links; trailing sentence punctuation stays outside.
      source = source.replace(/https?:\/\/[^\s<>"']+/gi, function (rawUrl) {
        var url = rawUrl, trailing = '';
        while (/[.,!?;:，。！？；：)\]】》]$/.test(url)) {
          trailing = url.slice(-1) + trailing;
          url = url.slice(0, -1);
        }
        var href = safeHref(url);
        if (!href) return rawUrl;
        return stash('<a href="' + esc(href) + '" target="_blank" rel="noopener noreferrer nofollow">' + esc(url) + '</a>') + esc(trailing);
      });
      var safe = esc(source);
      safe = safe.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
      safe = safe.replace(/__([^_\n]+)__/g, '<strong>$1</strong>');
      safe = safe.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');
      safe = safe.replace(/(^|[^\*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
      safe = safe.replace(/(^|[^_])_([^_\n]+)_/g, '$1<em>$2</em>');
      tokens.forEach(function (html, index) {
        safe = safe.replace('\u0000MIZULINK' + index + '\u0000', html);
      });
      return safe;
    }
    var lines = source.replace(/\r/g, '').split('\n');
    var out = [], paragraph = [], listType = '', inCode = false, fence = '', code = [], codeLanguage = '';
    function flushParagraph() {
      if (!paragraph.length) return;
      out.push('<p>' + inline(paragraph.join('\n')).replace(/\n/g, '<br>') + '</p>');
      paragraph = [];
    }
    function closeList() {
      if (listType) { out.push('</' + listType + '>'); listType = ''; }
    }
    function closeCode() {
      out.push('<div class="chat-code-shell"><div class="chat-code-toolbar"><span class="chat-code-language">' + esc(codeLanguage || '代码') + '</span><button class="chat-code-copy" type="button" data-copy-code aria-label="复制代码" title="复制代码">复制</button></div><pre class="chat-code-block"><code>' + esc(code.join('\n')) + '</code></pre></div>');
      code = []; inCode = false; fence = ''; codeLanguage = '';
    }
    var skipTableUntil = -1;
    function tableCells(line) {
      return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(function (cell) { return cell.trim(); });
    }
    lines.forEach(function (line, lineIndex) {
      if (lineIndex <= skipTableUntil) return;
      var fenceMatch = line.match(/^\s{0,3}([`]{3,}|~{3,})(.*)$/);
      if (inCode) {
        if (fenceMatch && fenceMatch[1].charAt(0) === fence.charAt(0) && fenceMatch[1].length >= fence.length) closeCode();
        else code.push(line);
        return;
      }
      if (fenceMatch) { flushParagraph(); closeList(); inCode = true; fence = fenceMatch[1]; codeLanguage = String(fenceMatch[2] || '').trim().split(/\\s+/)[0].slice(0, 24); code = []; return; }
      if (!line.trim()) { flushParagraph(); closeList(); return; }
      var nextLine = lines[lineIndex + 1] || '';
      if (/^\s*\|?.+\|.+\|?\s*$/.test(line) && /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(nextLine)) {
        flushParagraph(); closeList();
        var headers = tableCells(line), alignments = tableCells(nextLine).map(function (cell) {
          return cell.charAt(0) === ':' && cell.charAt(cell.length - 1) === ':' ? 'center' : cell.charAt(cell.length - 1) === ':' ? 'right' : 'left';
        });
        var table = ['<div class="chat-table-wrap"><table><thead><tr>'];
        headers.forEach(function (cell, cellIndex) {
          table.push('<th style="text-align:' + (alignments[cellIndex] || 'left') + '">' + inline(cell) + '</th>');
        });
        table.push('</tr></thead><tbody>');
        var rowIndex = lineIndex + 2;
        while (rowIndex < lines.length && /^\s*\|?.+\|.+\|?\s*$/.test(lines[rowIndex]) && lines[rowIndex].indexOf('|') >= 0) {
          var cells = tableCells(lines[rowIndex]);
          table.push('<tr>');
          headers.forEach(function (_, cellIndex) {
            table.push('<td style="text-align:' + (alignments[cellIndex] || 'left') + '">' + inline(cells[cellIndex] || '') + '</td>');
          });
          table.push('</tr>');
          rowIndex++;
        }
        table.push('</tbody></table></div>');
        out.push(table.join(''));
        skipTableUntil = rowIndex - 1;
        return;
      }
      var heading = line.match(/^\s{0,3}(#{1,4})\s+(.+?)\s*#*\s*$/);
      if (heading) {
        flushParagraph(); closeList();
        var level = heading[1].length;
        out.push('<h' + level + '>' + inline(heading[2]) + '</h' + level + '>');
        return;
      }
      var quote = line.match(/^\s{0,3}>\s?(.*)$/);
      if (quote) {
        flushParagraph(); closeList();
        var quoteLines = [quote[1]], quoteIndex = lineIndex + 1;
        while (quoteIndex < lines.length) {
          var nextQuote = lines[quoteIndex].match(/^\s{0,3}>\s?(.*)$/);
          if (!nextQuote) break;
          quoteLines.push(nextQuote[1]);
          quoteIndex++;
        }
        out.push('<blockquote>' + inline(quoteLines.join('\n')).replace(/\n/g, '<br>') + '</blockquote>');
        skipTableUntil = Math.max(skipTableUntil, quoteIndex - 1);
        return;
      }
      var item = line.match(/^\s*(?:[-*+]\s+)(.*)$/);
      var numbered = line.match(/^\s*\d+[.)、]\s+(.*)$/);
      if (item || numbered) {
        flushParagraph();
        var wanted = numbered ? 'ol' : 'ul';
        if (listType !== wanted) { closeList(); out.push('<' + wanted + '>'); listType = wanted; }
        out.push('<li>' + inline((item || numbered)[1]) + '</li>');
        return;
      }
      closeList(); paragraph.push(line);
    });
    flushParagraph(); closeList();
    if (inCode) closeCode();
    var html = out.join('');
    marks.forEach(function (match, index) {
      html = html.replace('\u0000MIZUMARK' + index + '\u0000', '<mark class="mark-hit">' + esc(match) + '</mark>');
    });
    return html;
  }
  function buildDay(date) {
    var el = document.createElement('div');
    el.className = 'msg-day';
    el.innerHTML = '<div class="day-row"><span class="day-line l"></span><span class="day-text">' + esc(dayLabel(date)) +
      '</span><span class="day-line r"></span></div><span class="day-whisper">· ' + esc(whisperOf(date)) + ' ·</span>';
    return el;
  }

  function buildToolCalls(m, index) {
    if (chatSetting('showToolCalls', true) === false) return '';
    if (!Array.isArray(m.toolCalls) || !m.toolCalls.length) return '';
    var rows = m.toolCalls.map(function (tool) {
      var args = String(tool.arguments || '');
      try {
        var parsedArgs = JSON.parse(args);
        (function redact(value) {
          if (!value || typeof value !== 'object') return;
          Object.keys(value).forEach(function (key) {
            if (/authorization|cookie|api[_-]?key|token|secret|password|credential/i.test(key)) value[key] = '[已隐藏]';
            else redact(value[key]);
          });
        })(parsedArgs);
        args = JSON.stringify(parsedArgs, null, 2);
      } catch (e) { args = args.replace(/(authorization|cookie|api[_-]?key|token|secret|password|credential)(\s*[=:]\s*)[^,}\s]+/gi, '$1$2[已隐藏]'); }
      var safeArgs = args.length > 1200 ? args.slice(0, 1200) + '…' : args;
      return '<div class="tool-call-row"><span class="tool-call-mark">⌘</span><span class="tool-call-copy"><b>' + esc(tool.name || 'tool') + '</b><pre class="tool-call-arguments"><code>' + esc(safeArgs || '没有参数摘要') + '</code></pre></span><em>请求记录</em></div>';
    }).join('');
    var panelId = 'chat-tools-' + Number(index);
    return '<section class="tool-call-group"><button class="tool-call-toggle" type="button" aria-expanded="false" aria-controls="' + panelId + '"><span>⌘</span><b>工具调用 · ' + m.toolCalls.length + '</b><small>查看记录</small><i>›</i></button><div class="tool-call-details" id="' + panelId + '" hidden><p class="tool-call-note">模型提出的调用请求，仅为记录，不代表工具已执行</p>' + rows + '</div></section>';
  }

  function buildReason(m, index) {
    if (!m.reasoning) return '';
    if (chatSetting('showReasoning', config.showReasoning !== false) === false) return '';
    var panelId = 'chat-thinking-' + Number(index);
    return '<div class="reason"><button class="reason-bar" type="button" aria-label="展开思考摘要" aria-expanded="false" aria-controls="' + panelId + '">' +
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17.4 9.2 3.9 3.9 0 0 1 17 18z"/></svg>' +
      '<span>Thinking</span>' +
      '<svg class="reason-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>' +
      '</button><div class="reason-body" id="' + panelId + '" hidden>' + highlight(m.reasoning) + '</div></div>';
  }

  function voiceBars(seed) {
    var out = '', n = 14;
    for (var k = 0; k < n; k++) {
      var h = 6 + ((seed * (k + 3) * 37) % 14);
      out += '<i style="height:' + h + 'px;animation-delay:' + (k * 0.07).toFixed(2) + 's"></i>';
    }
    return out;
  }

  function splitAssistantBubbles(content) {
    var source = String(content || '').replace(/\r/g, '').trim();
    if (!source) return [];

    // Keep fenced code intact, including blank lines inside the fence.
    var lines = source.split('\n');
    var blocks = [], paragraph = [], code = [], fence = '', inCode = false;
    function flushParagraph() {
      if (!paragraph.length) return;
      var hasStructure = paragraph.some(function (line) {
        return /^(?:[-*+]\s|\d+[.)、]\s|\||#{1,6}\s|>\s?)/.test(line);
      });
      blocks.push({ type: 'text', value: (hasStructure ? paragraph.join('\n') : paragraph.join(' ')).trim() });
      paragraph = [];
    }
    lines.forEach(function (line) {
      var marker = line.match(/^\s{0,3}([\x60]{3,}|~{3,})/);
      if (inCode) {
        code.push(line);
        if (marker && marker[1].charAt(0) === fence.charAt(0) && marker[1].length >= fence.length) {
          blocks.push({ type: 'fixed', value: code.join('\n') });
          code = []; inCode = false; fence = '';
        }
        return;
      }
      if (marker) {
        flushParagraph();
        inCode = true; fence = marker[1]; code = [line];
        return;
      }
      if (!line.trim()) { flushParagraph(); return; }
      paragraph.push(line.trim());
    });
    if (inCode && code.length) blocks.push({ type: 'fixed', value: code.join('\n') });
    flushParagraph();

    var result = [];
    blocks.forEach(function (block) {
      var value = block.value;
      if (!value) return;
      // Lists, tables, headings and quoted blocks stay structurally whole.
      var structural = /^(?:[-*+]\s|\d+[.)、]\s|\|.*\||#{1,6}\s|>\s?)/m.test(value);
      if (block.type === 'fixed' || structural || value.length <= 230) {
        result.push(value);
        return;
      }
      var sentences = value.match(/[^。！？!?；;]+[。！？!?；;]?/g) || [value];
      var current = '';
      sentences.forEach(function (sentence) {
        sentence = sentence.trim();
        if (!sentence) return;
        if (current && current.length + sentence.length > 230) {
          result.push(current);
          current = sentence;
        } else {
          current += sentence;
        }
      });
      if (current) result.push(current);
    });
    return result.length > 1 ? result : [source];
  }
  function buildMsg(m, i) {
    var el = document.createElement('div');
    var isUser = m.role === 'user';

    if (m.sticker) {
      el.className = 'msg sticker ' + (isUser ? 'user' : 'ai');
      el.dataset.index = String(i);
      el.innerHTML = '<div class="sticker-art">' + stickerSvg(m.sticker, 64) + '</div><span class="msg-time">·' + hhmm(m.ts) + '</span>';
      return el;
    }

    if (m.image) {
      el.className = 'msg ' + (isUser ? 'user' : 'ai');
      el.dataset.index = String(i);
      var archivedImage = memories.some(function (item) { return item.img === m.image || (item.source && item.source.kind === 'chat' && Number(item.source.ts) === Number(m.ts) && item.source.role === m.role); });
      el.innerHTML = '<div class="row"><div class="bubble has-img"><img src="' + esc(m.image) + '" alt="图片消息" loading="lazy"><button class="chat-photo-save' + (archivedImage ? ' is-saved' : '') + '" type="button" data-chat-photo aria-label="' + (archivedImage ? '照片已收进相册' : '收进相册') + '">' + (archivedImage ? '✓ 已收进相册' : '＋ 收进相册') + '</button></div></div>' +
        '<span class="msg-time">·' + hhmm(m.ts) + '</span>';
      return el;
    }

    if (m.voice) {
      var dur = (m.voice && m.voice.dur) || 3;
      el.className = 'msg voice ' + (isUser ? 'user' : 'ai');
      el.dataset.index = String(i);
      el.innerHTML = '<div class="row"><div class="bubble"><div class="voice-row">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>' +
        '<span class="voice-bars">' + voiceBars(i + dur) + '</span>' +
        '<span class="voice-dur">' + dur + '"</span></div></div></div>' +
        '<span class="msg-time">·' + hhmm(m.ts) + '</span>';
      return el;
    }

    el.className = 'msg ' + (isUser ? 'user' : 'ai');
    el.dataset.index = String(i);
    var lastUserIndex = -1;
    if (isUser) {
      for (var ui = history.length - 1; ui >= 0; ui--) {
        if (history[ui] && history[ui].role === 'user') { lastUserIndex = ui; break; }
      }
    }
    var editAction = isUser && i === lastUserIndex ? '<button class="msg-edit-btn" type="button" aria-label="编辑并重发这条消息" title="编辑并重发">编辑</button>' : '';
    var actions = '<div class="msg-actions"><button class="msg-copy-btn" type="button" aria-label="复制这条消息" title="复制">复制</button><button class="msg-quote-btn" type="button" aria-label="引用这条消息" title="引用">引用</button>' + editAction +
      (isUser ? '' : '<button class="msg-regenerate-btn" type="button" aria-label="重新生成这条回复" title="重新生成">重新生成</button><button class="love-btn' + (m.loved ? ' is-loved' : '') + '" type="button" aria-label="收藏这句话" aria-pressed="' + (m.loved ? 'true' : 'false') + '">' + HEART_SVG + '</button>') + '</div>';
    var messageBody = highlight(m.content);
    var bubbleMarkup = m.content ? '<div class="bubble">' + messageBody + '</div>' : '';
    if (!isUser && m.content && chatSetting('bubbleMode', config.bubbleMode || 'split') === 'split') {
      var paragraphs = splitAssistantBubbles(m.content);
      if (paragraphs.length > 1) {
        bubbleMarkup = '<div class="bubble-stack">' + paragraphs.map(function (part, index) {
          return '<div class="bubble bubble-piece" data-piece="' + index + '">' + highlight(part) + '</div>';
        }).join('') + '</div>';
      }
    }
    var messageRow = bubbleMarkup || (m.content && actions)
      ? '<div class="row">' + (isUser ? '<span class="bubble-pix" aria-hidden="true"></span>' : '') + bubbleMarkup + (m.content ? actions : '') + '</div>'
      : '';
    var timeMarkup = '<span class="msg-time">·' + hhmm(m.ts) + '</span>';
    if (isUser) {
      el.innerHTML = messageRow + timeMarkup;
    } else {
      el.innerHTML = '<div class="assistant-flow">' +
        buildReason(m, i) + buildToolCalls(m, i) + messageRow + timeMarkup +
        '</div>';
    }
    if (messageSelectMode) {
      el.classList.add('selectable-message');
      var selected = !!selectedMessageIndices[i];
      el.classList.toggle('is-selected', selected);
      el.insertAdjacentHTML('afterbegin', '<button class="msg-select-mark" type="button" data-message-select="' + i + '" aria-label="' + (selected ? '取消选择' : '选择消息') + '" aria-pressed="' + (selected ? 'true' : 'false') + '"><span></span></button>');
    }
    return el;
  }

  function renderQuotePreview() {
    var host = $('quotePreview');
    if (!host) return;
    if (editingMessageIndex >= 0) {
      var editingMessage = history[editingMessageIndex];
      if (!editingMessage || editingMessage.role !== 'user') { editingMessageIndex = -1; }
      else {
        host.hidden = false;
        host.innerHTML = '<div class="quote-preview-copy edit-preview-copy"><span>正在编辑 · 修改后将替换这条问题及其后续回复</span><p>' + esc(String(editingMessage.content || '').slice(0, 100)) + '</p></div><button class="quote-cancel edit-cancel" type="button" aria-label="取消编辑">×</button>';
        host.querySelector('.edit-cancel').addEventListener('click', function () {
          editingMessageIndex = -1;
          msgInput.value = '';
          autoGrow();
          renderQuotePreview();
        });
        return;
      }
    }
    if (!pendingQuote) { host.innerHTML = ''; host.hidden = true; return; }
    host.hidden = false;
    host.innerHTML = '<div class="quote-preview-copy"><span>正在引用 · ' + (pendingQuote.role === 'user' ? '我' : 'TA') + '</span><p>' + esc(pendingQuote.content) + '</p></div><button class="quote-cancel" type="button" aria-label="取消引用">×</button>';
    host.querySelector('.quote-cancel').addEventListener('click', function () {
      pendingQuote = null;
      renderQuotePreview();
    });
  }

  function setQuoteFromMessage(index) {
    var m = history[index];
    if (!m || !m.content || m.sticker || m.image || m.voice) return;
    editingMessageIndex = -1;
    pendingQuote = { role: m.role, content: String(m.content).slice(0, 240), index: index };
    renderQuotePreview();
    msgInput.focus();
    toast('已引用这句话');
  }

  function localDateInputValue(date) {
    var d = date || new Date();
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  }
  function chatDateIndices() {
    var dates = [];
    history.forEach(function (message, index) {
      var value = localDateInputValue(new Date(message.ts));
      if (!dates.length || dates[dates.length - 1].value !== value) dates.push({ value: value, index: index });
    });
    return dates;
  }
  function updateChatDateNavFromScroll() {
    if (!history.length || !msgList.children.length) return;
    var visible = null, scrollTop = chatScroll.scrollTop + 18;
    var nodes = msgList.querySelectorAll('.msg[data-index]');
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].offsetTop - msgList.offsetTop >= scrollTop) {
        visible = Number(nodes[i].dataset.index); break;
      }
    }
    if (visible === null) visible = history.length - 1;
    if (history[visible]) syncChatDateNav(localDateInputValue(new Date(history[visible].ts)));
  }
  function syncChatDateNav(value) {
    var picker = $('chatDatePicker'), prev = $('chatDatePrev'), next = $('chatDateNext');
    if (!picker || !prev || !next) return;
    var dates = chatDateIndices();
    if (!dates.length) {
      picker.value = ''; picker.disabled = true; prev.disabled = true; next.disabled = true;
      return;
    }
    picker.disabled = false;
    picker.min = dates[0].value; picker.max = dates[dates.length - 1].value;
    var current = value || (history.length ? localDateInputValue(new Date(history[history.length - 1].ts)) : dates[dates.length - 1].value);
    picker.value = current;
    var pos = dates.findIndex(function (entry) { return entry.value === current; });
    if (pos < 0) pos = dates.findIndex(function (entry) { return entry.value > current; });
    prev.disabled = pos <= 0;
    next.disabled = pos < 0 || pos >= dates.length - 1;
  }
  function jumpToChatDate(value) {
    var dates = chatDateIndices();
    if (!dates.length) { toast('这段对话还没有消息'); return; }
    var exact = dates.find(function (entry) { return entry.value === value; });
    var chosen = exact || dates.find(function (entry) { return entry.value >= value; }) || dates[dates.length - 1];
    syncChatDateNav(chosen.value);
    jumpToChatMessage(chosen.index);
  }
  function moveChatDate(direction) {
    var dates = chatDateIndices(), picker = $('chatDatePicker');
    if (!dates.length || !picker) return;
    var current = picker.value || dates[dates.length - 1].value;
    var pos = dates.findIndex(function (entry) { return entry.value === current; });
    if (pos < 0) pos = direction < 0 ? dates.length - 1 : 0;
    else pos = Math.max(0, Math.min(dates.length - 1, pos + direction));
    jumpToChatDate(dates[pos].value);
  }

  function jumpToChatMessage(index) {
    if (!Number.isInteger(index) || index < 0 || index >= history.length) return;
    requestAnimationFrame(function () {
      var target = msgList.querySelector('.msg[data-index="' + index + '"]');
      if (!target) return;
      var top = target.offsetTop - msgList.offsetTop - Math.max(24, chatScroll.clientHeight * 0.22);
      if (chatScroll.scrollTo) {
        try { chatScroll.scrollTo({ top: Math.max(0, top), behavior: REDUCE ? 'auto' : 'smooth' }); }
        catch (e) { chatScroll.scrollTop = Math.max(0, top); }
      } else chatScroll.scrollTop = Math.max(0, top);
      target.classList.remove('search-jump-focus');
      void target.offsetWidth;
      target.classList.add('search-jump-focus');
      setTimeout(function () { target.classList.remove('search-jump-focus'); }, 1800);
    });
  }

  function renderChat() {
    renderChatTitle();
    var atBottom = isNearBottom();
    var from = renderedCount;
    msgList.innerHTML = '';

    if (!history.length) {
      var hint = document.createElement('p');
      hint.className = 'chat-empty';
      hint.textContent = '湖面很安静 —— 说点什么，让水色起一点涟漪。';
      msgList.appendChild(hint);
      renderedCount = 0;
    } else {
      var lastKey = null;
      for (var i = 0; i < history.length; i++) {
        var m = history[i];
        var d = new Date(m.ts);
        var key = dayKey(d);
        if (key !== lastKey) { msgList.appendChild(buildDay(d)); lastKey = key; }
        var node = buildMsg(m, i);
        if (chatSetting('showTimestamps', true) === false) node.classList.add('hide-time');
        var prev = history[i - 1], next = history[i + 1];
        var sameThread = function (a, b) {
          return !!a && !!b && a.role === b.role &&
            dayKey(new Date(a.ts)) === dayKey(new Date(b.ts)) &&
            Math.abs(Number(a.ts) - Number(b.ts)) <= 5 * 60 * 1000;
        };
        var hasPrev = sameThread(prev, m), hasNext = sameThread(m, next);
        node.classList.add(hasPrev ? (hasNext ? 'group-middle' : 'group-end') : (hasNext ? 'group-start' : 'group-solo'));
        if (i >= from) node.classList.add('enter');
        if (searchTerm && String(m.content).toLowerCase().indexOf(searchTerm.toLowerCase()) < 0) node.classList.add('is-dim');
        msgList.appendChild(node);
      }
      renderedCount = history.length;
    }

    if (atBottom) requestAnimationFrame(function () { scrollToBottom(false); });
    updateJump();
    syncChatDateNav();
    updateStatus();
    updateThoughts();
  }

  /* ================= 收藏 ================= */
  function toggleLove(i) {
    var m = history[i];
    if (!m || m.role === 'user' || m.sticker) return;
    m.loved = !m.loved;
    saveHistory();
    var row = msgList.querySelector('.msg[data-index="' + i + '"]');
    if (row) {
      var btn = row.querySelector('.love-btn');
      if (btn) {
        btn.classList.toggle('is-loved', !!m.loved);
        btn.setAttribute('aria-pressed', m.loved ? 'true' : 'false');
        btn.classList.remove('pop');
        void btn.offsetWidth;
        if (m.loved) btn.classList.add('pop');
      }
    }
    renderHome();
    if (currentView === 'archive') renderGalaxy();
  }

  /* ================= 流式 ================= */
  var sending = false, isTyping = false, abortCtrl = null, discard = false;
  var activeRequestText = '', retryPayload = '';
  var typingEl = null, streamEl = null, streamBody = null, streamText = '';
  var queue = [], typeTimer = null, streamDone = false, streamReason = '';

  function setTyping(on) { isTyping = on; updateStatus(); }

  function removeTyping() {
    if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
    typingEl = null;
  }

  function ensureTyping() {
    removeTyping();
    var hint = msgList.querySelector('.chat-empty');
    if (hint) hint.remove();
    typingEl = document.createElement('div');
    typingEl.className = 'msg ai enter';
    typingEl.innerHTML = '<div class="assistant-flow"><div class="row"><div class="bubble typing-bubble" aria-label="对方正在输入"><i></i><i></i><i></i></div></div></div>';
    msgList.appendChild(typingEl);
    followIfNear();
  }

  function startStreamBubble() {
    removeTyping();
    streamEl = document.createElement('div');
    streamEl.className = 'msg ai enter';
    streamEl.innerHTML = '<div class="assistant-flow"><div class="row"><div class="bubble"><span class="stream-text"></span><span class="caret" aria-hidden="true"></span></div></div></div>';
    streamBody = streamEl.querySelector('.stream-text');
    msgList.appendChild(streamEl);
    followIfNear();
  }

  var followTick = false;
  function followIfNear() {
    if (!isNearBottom()) { updateJump(); return; }
    jumpBtn.classList.remove('show');
    if (followTick) return;
    followTick = true;
    requestAnimationFrame(function () { followTick = false; chatScroll.scrollTop = chatScroll.scrollHeight; });
  }

  function setSendUI(on) {
    sendBtn.classList.toggle('is-loading', on);
    sendBtn.disabled = on || !msgInput.value.trim();
  }

  function pump() {
    if (typeTimer !== null) return;
    typeTimer = setInterval(function () {
      if (queue.length) {
        streamText += queue.shift();
        if (streamBody) streamBody.textContent = streamText;
        followIfNear();
        return;
      }
      if (streamDone) finishStream(null);
    }, 24);
  }

  function finishStream(err) {
    if (typeTimer !== null) { clearInterval(typeTimer); typeTimer = null; }
    removeTyping();
    var text = streamText.trim();
    if (streamEl && streamEl.parentNode) streamEl.parentNode.removeChild(streamEl);
    streamEl = null; streamBody = null; streamText = ''; queue = [];
    streamDone = false; abortCtrl = null;

    if (discard) { discard = false; text = ''; err = null; }
    retryPayload = err && !text ? activeRequestText : '';
    if (err && !text) retryQuote = activeQuote;
    else { retryQuote = null; activeQuote = null; }
    activeRequestText = '';

    if (text) {
      var found = [];
      var clean = text.replace(/\[sticker[:：]\s*([^\]]+)\]/gi, function (_, name) {
        var d = stickerFor(String(name).trim());
        if (d) found.push(d.key);
        return '';
      }).replace(/\r\n?/g, '\n').replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
      if (clean) {
        var rec = { role: 'assistant', content: clean, ts: Date.now() };
        if (streamReason.trim()) rec.reasoning = streamReason.trim();
        if (streamToolCalls.length) rec.toolCalls = streamToolCalls.slice();
        history.push(rec);
        saveHistory();
      }
      found.forEach(function (k) {
        var d = stickerDef(k);
        history.push({ role: 'assistant', sticker: k, content: '[贴纸] ' + (d ? d.name : k), ts: Date.now() });
      });
      if (found.length) saveHistory();
      text = clean;
    } else if (streamToolCalls.length) {
      history.push({ role: 'assistant', content: '', ts: Date.now(), toolCalls: streamToolCalls.slice() });
      saveHistory();
    }

    renderChat();
    renderHome();
    setTyping(false);
    followIfNear();

    if (err) showError(err);
    else if (!text && !streamToolCalls.length) showError('没有收到任何回复内容，也许对面走神了');

    sending = false;
    setSendUI(false);
  }

  function showError(msg) {
    removeTyping();
    var el = document.createElement('div');
    el.className = 'msg ai enter';
    el.innerHTML = '<div class="row"><div class="bubble bubble-error"><p>好像断线了……</p><p class="err-detail">' + esc(msg) +
      '</p><p>再试一次好吗？</p>' + (retryPayload ? '<button class="retry-send-btn" type="button" data-retry-send>重新发送这条消息</button>' : '') + '</div></div>';
    msgList.appendChild(el);
    var retryBtn = el.querySelector('[data-retry-send]');
    if (retryBtn) retryBtn.addEventListener('click', function () {
      if (sending || !retryPayload) return;
      var payload = retryPayload;
      retryPayload = '';
      el.remove();
      sendText(payload, true, true, retryQuote);
    });
    followIfNear();
  }

  function normalizeEndpoint(u) {
    u = String(u || '').trim();
    if (!u) return '';
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    u = u.replace(/\/+$/, '');
    if (/\/chat\/completions$/i.test(u)) return u;
    if (/\/v\d+$/i.test(u)) return u + '/chat/completions';
    return u + '/v1/chat/completions';
  }

  function buildHeaders() {
    var h = { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' };
    var hasAuth = false;
    config.headers.forEach(function (x) {
      var k = (x.key || '').trim();
      if (!k) return;
      h[k] = x.value;
      if (k.toLowerCase() === 'authorization') hasAuth = true;
    });
    if (config.apiKey && !hasAuth) h['Authorization'] = 'Bearer ' + config.apiKey;
    return h;
  }

  function buildMessages() {
    var sys = config.system || DEFAULT_SYSTEM;
    var pins = archive.filter(function (m) { return m.pinned && m.text; }).slice(0, 12);
    if (pins.length) sys += '\n\n关于我们：' + pins.map(function (m) { return m.text; }).join('；') + '。';
    var out = [{ role: 'system', content: sys }];
    if (activeQuote && activeQuote.content) {
      out.push({ role: 'system', content: '用户正在回复一条此前的消息。被引用的原话来自' + (activeQuote.role === 'user' ? '用户本人' : '你') + '：\n「' + activeQuote.content + '」\n请结合这段引用理解用户当前消息，不要把引用内容误当成用户刚刚重新发送的内容。' });
    }
    history.slice(-30).forEach(function (m) {
      if (!m.content || !m.content.trim()) return;
      out.push({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content });
    });
    return out;
  }

  function pushDelta(piece) {
    if (!streamEl) startStreamBubble();
    var chars = Array.from ? Array.from(piece) : piece.split('');
    for (var i = 0; i < chars.length; i++) queue.push(chars[i]);
    pump();
  }

  var streamToolCalls = [];
  function mergeStreamToolCalls(incoming) {
    if (!Array.isArray(incoming)) return;
    incoming.forEach(function (part) {
      var index = Number(part.index) || 0;
      var item = streamToolCalls[index] || { id: '', name: '', arguments: '', status: 'returned' };
      if (part.id) item.id = part.id;
      if (part.function && part.function.name) item.name += part.function.name;
      if (part.function && typeof part.function.arguments === 'string') item.arguments += part.function.arguments;
      streamToolCalls[index] = item;
    });
  }

  function handleSSE(block) {
    var lines = block.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var t = lines[i].replace(/^\s+/, '');
      if (t.indexOf('data:') !== 0) continue;
      var payload = t.slice(5).trim();
      if (!payload) continue;
      if (payload === '[DONE]') return true;
      var json;
      try { json = JSON.parse(payload); } catch (e) { continue; }
      if (!json || !json.choices || !json.choices[0]) continue;
      var delta = json.choices[0].delta;
      if (delta) {
        if (delta.tool_calls) mergeStreamToolCalls(delta.tool_calls);
        var rz = typeof delta.reasoning_content === 'string' ? delta.reasoning_content : (typeof delta.reasoning === 'string' ? delta.reasoning : '');
        if (rz) streamReason += rz;
      }
      var content = delta && typeof delta.content === 'string' ? delta.content : '';
      if (!content) {
        var full = json.choices[0].message && json.choices[0].message.content;
        if (typeof full === 'string') content = full;
      }
      if (content) pushDelta(content);
    }
    return false;
  }

  async function runStream() {
    streamText = ''; queue = []; streamDone = false; streamEl = null; streamBody = null; streamReason = ''; streamToolCalls = [];
    ensureTyping();
    setTyping(true);

    var url = normalizeEndpoint(config.endpoint);
    if (!url) throw new Error('还没有填写 API 地址，点右上角齿轮设置一下吧');
    if (/api\.openai\.com/i.test(url) && !config.apiKey) throw new Error('还没有填写 API Key，点右上角齿轮配置一下吧');

    abortCtrl = new AbortController();
    var res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({ model: config.model || DEF_MODEL, messages: buildMessages(), stream: true }),
        signal: abortCtrl.signal
      });
    } catch (e) {
      setTyping(false); removeTyping();
      var reason = e && (e.message || e.name) ? String(e.message || e.name) : '';
      throw new Error(window.location.protocol === 'file:'
        ? '请求没有发出去。file:// 打开时浏览器可能拦截跨域，换成 HTTPS 网页或允许 CORS 的接口。'
        : (/failed to fetch|networkerror|load failed|fetch failed/i.test(reason)
          ? '浏览器没有拿到接口响应。常见原因：接口未开放网页跨域（CORS）、Endpoint 路径不正确、网络中断或 HTTPS 证书异常。请先核对接口地址，并确认服务端允许当前网页域名发起请求。'
          : '请求没有发出去：' + reason));
    }

    if (!res.ok) {
      var detail = '';
      try { detail = (await res.text()).slice(0, 160); } catch (e2) { detail = ''; }
      setTyping(false); removeTyping();
      throw new Error('HTTP ' + res.status + (detail ? ' · ' + detail : ''));
    }

    var body = res.body;
    if (!body || !body.getReader) {
      var txt = await res.text();
      try {
        var obj = JSON.parse(txt);
        var wholeMessage = obj.choices && obj.choices[0] && obj.choices[0].message;
        var whole = wholeMessage && wholeMessage.content;
        var wholeReason = wholeMessage && (wholeMessage.reasoning_content || wholeMessage.reasoning);
        if (wholeMessage && Array.isArray(wholeMessage.tool_calls)) streamToolCalls = wholeMessage.tool_calls.map(function (t) { return { id: t.id || '', name: t.function && t.function.name || 'tool', arguments: t.function && t.function.arguments || '', status: 'returned' }; });
        if (typeof wholeReason === 'string') streamReason += wholeReason;
        if (typeof whole === 'string' && whole) pushDelta(whole);
      } catch (e3) { handleSSE(txt); }
      streamDone = true; pump();
      return;
    }

    var reader = body.getReader();
    var dec = new TextDecoder('utf-8');
    var buf = '', raw = '', done = false;

    while (!done) {
      var step = await reader.read();
      if (step.done) break;
      var piece = dec.decode(step.value, { stream: true });
      raw += piece;
      buf = (buf + piece).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      var idx;
      while ((idx = buf.indexOf('\n\n')) !== -1) {
        var block = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        if (handleSSE(block)) { done = true; break; }
      }
    }
    if (!done && buf.trim()) handleSSE(buf);
    try { reader.cancel(); } catch (e4) { /* noop */ }

    if (!streamEl && raw) {
      try {
        var o = JSON.parse(raw.trim());
        var rawMessage = o.choices && o.choices[0] && o.choices[0].message;
        if (rawMessage && Array.isArray(rawMessage.tool_calls)) streamToolCalls = rawMessage.tool_calls.map(function (t) { return { id: t.id || '', name: t.function && t.function.name || 'tool', arguments: t.function && t.function.arguments || '', status: 'returned' }; });
        var c = o.choices && o.choices[0] && ((rawMessage && rawMessage.content) || (o.choices[0].delta && o.choices[0].delta.content));
        if (typeof c === 'string' && c) pushDelta(c);
      } catch (e5) { /* noop */ }
    }

    streamDone = true;
    pump();
  }

  async function sendText(text, noPush, noHit, quoteOverride) {
    if (sending) return;
    text = String(text || '').trim();
    if (!text) return;

    if (!noPush) {
      history.push({ role: 'user', content: text, ts: Date.now() });
      saveHistory();
      if (!noHit) arcHit(text);
    }
    activeRequestText = text;
    activeQuote = quoteOverride || pendingQuote || null;
    pendingQuote = null;
    renderQuotePreview();
    retryPayload = '';
    sending = true;
    setSendUI(true);
    renderChat();
    scrollToBottom(true);
    renderHome();

    try { await runStream(); }
    catch (err) { finishStream(err && err.message ? err.message : String(err)); }
  }

  function sendMessage() {
    var t = msgInput.value.trim();
    if (!t || sending) return;
    var quote = pendingQuote;
    if (editingMessageIndex >= 0) {
      var editAt = editingMessageIndex;
      var previousHistory = history.slice();
      var editedRecord = { role: 'user', content: t, ts: Date.now() };
      history = history.slice(0, editAt);
      history.push(editedRecord);
      if (!saveHistory()) { history = previousHistory; return; }
      editingMessageIndex = -1;
      pendingQuote = null;
      msgInput.value = '';
      autoGrow();
      renderQuotePreview();
      renderChat();
      sendText(t, true, true, quote);
      return;
    }
    msgInput.value = '';
    autoGrow();
    sendText(t, false, false, quote);
  }

  function sendSticker(key) {
    closeStickers();
    if (sending) { toast('TA 正在回你上一句'); return; }
    var d = stickerDef(key) || STICKERS[0];
    history.push({ role: 'user', sticker: d.key, content: '[贴纸] ' + d.name, ts: Date.now() });
    saveHistory();
    renderChat();
    renderHome();
    scrollToBottom(true);
    sendText('[贴纸] ' + d.name, true);
  }

  /* ================= 输入区 ================= */
  function autoGrow() {
    msgInput.style.height = 'auto';
    var h = Math.max(44, Math.min(128, msgInput.scrollHeight));
    msgInput.style.height = h + 'px';
    sendBtn.disabled = sending || !msgInput.value.trim();
  }

  var composing = false;
  msgInput.addEventListener('compositionstart', function () { composing = true; });
  msgInput.addEventListener('compositionend', function () { composing = false; autoGrow(); });
  msgInput.addEventListener('input', autoGrow);
  msgInput.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.shiftKey) return;
    if (composing || e.isComposing || e.keyCode === 229) return;
    e.preventDefault();
    sendMessage();
  });
  sendBtn.addEventListener('click', sendMessage);

  /* 窄屏把贴纸键移到工具行，给输入框留出宽度 */
  function placeSticker() {
    var btn = $('openStickers');
    var bar = document.querySelector('.composer-bar');
    var chips = document.querySelector('.chips-row');
    var scroll = $('chipsRow');
    if (!btn || !bar || !chips) return;
    if (window.innerWidth >= 768) {
      if (btn.parentNode !== bar) bar.insertBefore(btn, bar.firstChild);
    } else if (btn.parentNode !== chips) {
      chips.insertBefore(btn, scroll || null);
    }
  }
  placeSticker();
  window.addEventListener('resize', placeSticker);

  chatScroll.addEventListener('scroll', function () {
    stickyBottom = isNearBottom();
    updateJump();
    updateChatDateNavFromScroll();
    scheduleChatScrollSave();
  }, { passive: true });

  jumpBtn.addEventListener('click', function () { scrollToBottom(true); jumpBtn.classList.remove('show'); });
  if ($('chatDatePicker')) $('chatDatePicker').addEventListener('change', function () { if (this.value) jumpToChatDate(this.value); });
  if ($('chatDatePrev')) $('chatDatePrev').addEventListener('click', function () { moveChatDate(-1); });
  if ($('chatDateNext')) $('chatDateNext').addEventListener('click', function () { moveChatDate(1); });
  if ($('chatDateLatest')) $('chatDateLatest').addEventListener('click', function () {
    if (!history.length) return;
    var latest = localDateInputValue(new Date(history[history.length - 1].ts));
    syncChatDateNav(latest); scrollToBottom(true);
  });

  chatScroll.addEventListener('click', function (e) {
    if (e.target.closest('.bubble, button, a')) return;
    var rect = chatScroll.getBoundingClientRect();
    var x = e.clientX - rect.left + chatScroll.scrollLeft;
    var y = e.clientY - rect.top + chatScroll.scrollTop;
    ['r1', 'r2'].forEach(function (c) {
      var ring = document.createElement('span');
      ring.className = 'ripple ' + c;
      ring.style.left = x + 'px';
      ring.style.top = y + 'px';
      chatScroll.appendChild(ring);
      setTimeout(function () { ring.remove(); }, 900);
    });
  });

  var messageSelectBtn = $('chatSelectMessages');
  var messageBulkBar = document.createElement('div');
  messageBulkBar.className = 'message-bulk-bar';
  messageBulkBar.id = 'messageBulkBar';
  messageBulkBar.hidden = true;
  messageBulkBar.innerHTML = '<span class="message-bulk-count" id="messageBulkCount">已选 0 条</span><button type="button" data-bulk-action="all">全选</button><button type="button" data-bulk-action="favorite">收藏</button><button type="button" data-bulk-action="delete">删除</button><button type="button" data-bulk-action="cancel">完成</button>';
  if (chatScroll && chatScroll.parentNode) chatScroll.parentNode.insertBefore(messageBulkBar, chatScroll);
  function selectedMessageCount() { return Object.keys(selectedMessageIndices).filter(function (key) { return selectedMessageIndices[key]; }).length; }
  function updateMessageBulkBar() {
    var count = selectedMessageCount();
    var countNode = $('messageBulkCount');
    if (countNode) countNode.textContent = '已选 ' + count + ' 条';
    var favoriteButton = messageBulkBar.querySelector('[data-bulk-action="favorite"]');
    if (favoriteButton) favoriteButton.disabled = !history.some(function (m, i) { return !!selectedMessageIndices[i] && m && m.role === 'assistant' && !m.sticker; });
    if (messageSelectBtn) {
      messageSelectBtn.textContent = messageSelectMode ? '取消选择' : '选择';
      messageSelectBtn.setAttribute('aria-pressed', messageSelectMode ? 'true' : 'false');
    }
    messageBulkBar.hidden = !messageSelectMode;
  }
  function setMessageSelectMode(enabled) {
    messageSelectMode = !!enabled;
    if (!messageSelectMode) selectedMessageIndices = Object.create(null);
    updateMessageBulkBar();
    renderChat();
  }
  if (messageSelectBtn) messageSelectBtn.addEventListener('click', function () {
    if (sending && !messageSelectMode) { toast('回复进行中，稍后再整理消息'); return; }
    setMessageSelectMode(!messageSelectMode);
  });
  messageBulkBar.addEventListener('click', function (e) {
    var action = e.target.closest('[data-bulk-action]');
    if (!action || action.disabled) return;
    var kind = action.getAttribute('data-bulk-action');
    if (kind === 'cancel') { setMessageSelectMode(false); return; }
    if (kind === 'all') {
      var allSelected = selectedMessageCount() === history.length && history.length > 0;
      selectedMessageIndices = Object.create(null);
      if (!allSelected) history.forEach(function (_, index) { selectedMessageIndices[index] = true; });
      renderChat(); updateMessageBulkBar(); return;
    }
    var indices = Object.keys(selectedMessageIndices).filter(function (key) { return selectedMessageIndices[key]; }).map(Number).sort(function (a,b) { return a-b; });
    if (!indices.length) { toast('先选择要整理的消息'); return; }
    if (kind === 'favorite') {
      var snapshot = history.map(function (m) { return Object.assign({}, m); });
      var changed = 0;
      indices.forEach(function (index) {
        var m = history[index];
        if (m && m.role === 'assistant' && !m.sticker && !m.loved) { m.loved = true; changed++; }
      });
      if (!changed) { toast('所选消息已经收藏，或没有可收藏的回复'); return; }
      if (!saveHistory()) { history = snapshot; renderChat(); return; }
      setMessageSelectMode(false);
      renderChat(); renderHome();
      if (currentView === 'archive') renderGalaxy();
      toast('已收藏 ' + changed + ' 条回复');
      return;
    }
    if (kind === 'delete') {
      if (!window.confirm('确定删除选中的 ' + indices.length + ' 条消息吗？此操作无法撤销。')) return;
      var oldHistory = history;
      history = history.filter(function (_, index) { return !selectedMessageIndices[index]; });
      if (!saveHistory()) { history = oldHistory; renderChat(); return; }
      setMessageSelectMode(false);
      renderChat();
      toast('已删除 ' + indices.length + ' 条消息');
    }
  });

  msgList.addEventListener('click', function (e) {
    var selectMark = e.target.closest('[data-message-select]');
    if (selectMark && messageSelectMode) {
      e.preventDefault();
      var selectedIndex = Number(selectMark.getAttribute('data-message-select'));
      if (selectedMessageIndices[selectedIndex]) delete selectedMessageIndices[selectedIndex];
      else selectedMessageIndices[selectedIndex] = true;
      var selectedRow = selectMark.closest('.msg');
      if (selectedRow) {
        var isSelected = !!selectedMessageIndices[selectedIndex];
        selectedRow.classList.toggle('is-selected', isSelected);
        selectMark.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        selectMark.setAttribute('aria-label', isSelected ? '取消选择' : '选择消息');
      }
      updateMessageBulkBar();
      return;
    }
    if (messageSelectMode) return;
    var codeCopy = e.target.closest('[data-copy-code]');
    if (codeCopy) {
      e.preventDefault();
      var codeBlock = codeCopy.closest('.chat-code-block');
      var codeNode = codeBlock && codeBlock.querySelector('code');
      var codeText = codeNode ? codeNode.textContent : '';
      if (!codeText) { toast('这段代码是空的'); return; }
      function codeCopied() {
        codeCopy.textContent = '已复制';
        codeCopy.classList.add('is-copied');
        toast('代码已复制');
        setTimeout(function () {
          if (codeCopy.isConnected) {
            codeCopy.textContent = '复制';
            codeCopy.classList.remove('is-copied');
          }
        }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(codeText).then(codeCopied).catch(function () { fallbackCopy(codeText, codeCopied); });
      } else fallbackCopy(codeText, codeCopied);
      return;
    }
    var toolToggle = e.target.closest('.tool-call-toggle');
    if (toolToggle) {
      var toolGroup = toolToggle.closest('.tool-call-group');
      var toolExpanded = toolGroup.classList.toggle('is-open');
      toolToggle.setAttribute('aria-expanded', toolExpanded ? 'true' : 'false');
      toolToggle.setAttribute('aria-label', toolExpanded ? '收起工具调用记录' : '展开工具调用记录');
      var toolHint = toolToggle.querySelector('small');
      if (toolHint) toolHint.textContent = toolExpanded ? '收起记录' : '查看记录';
      var toolDetails = toolGroup.querySelector('.tool-call-details');
      if (toolDetails) toolDetails.hidden = !toolExpanded;
      return;
    }
    var reasonToggle = e.target.closest('.reason-bar');
    if (reasonToggle) {
      var reasonPanel = reasonToggle.closest('.reason');
      var expanded = reasonPanel.classList.toggle('is-open');
      reasonToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      reasonToggle.setAttribute('aria-label', expanded ? '收起思考摘要' : '展开思考摘要');
      var reasonBody = reasonPanel.querySelector('.reason-body');
      if (reasonBody) reasonBody.hidden = !expanded;
      return;
    }
    var photoSave = e.target.closest('[data-chat-photo]');
    if (photoSave) {
      e.preventDefault();
      var photoRow = photoSave.closest('.msg');
      var photoIndex = photoRow ? Number(photoRow.dataset.index) : -1;
      var photoMessage = history[photoIndex];
      if (!photoMessage || !photoMessage.image) { toast('这张聊天照片暂时找不到了'); return; }
      var exists = memories.some(function (item) {
        return item.img === photoMessage.image || (item.source && item.source.kind === 'chat' && Number(item.source.ts) === Number(photoMessage.ts) && item.source.role === photoMessage.role);
      });
      if (exists) { photoSave.textContent = '✓ 已收进相册'; photoSave.classList.add('is-saved'); toast('这张照片已经在相册里啦'); return; }
      var record = {
        img: photoMessage.image,
        caption: (photoMessage.role === 'user' ? '我' : 'TA') + '分享的照片',
        ts: Number(photoMessage.ts) || Date.now(),
        source: { kind: 'chat', role: photoMessage.role, ts: Number(photoMessage.ts) || Date.now(), content: photoMessage.content || '[图片]' }
      };
      memories.push(record);
      if (!saveMemories()) { memories.pop(); return; }
      photoSave.textContent = '✓ 已收进相册';
      photoSave.classList.add('is-saved');
      photoSave.setAttribute('aria-label', '照片已收进相册');
      renderAlbum();
      renderJournal();
      toast('聊天照片收进相册啦');
      return;
    }
    var copyBtn = e.target.closest('.msg-copy-btn');
    if (copyBtn) {
      e.preventDefault();
      var copyRow = copyBtn.closest('.msg');
      var copyIndex = copyRow ? Number(copyRow.dataset.index) : -1;
      var copyText = history[copyIndex] && history[copyIndex].content ? String(history[copyIndex].content) : '';
      if (!copyText) { toast('这条消息没有可复制的文字'); return; }
      function copied() { copyBtn.textContent = '已复制'; copyBtn.classList.add('is-copied'); toast('这句话收好啦'); setTimeout(function () { if (copyBtn.isConnected) { copyBtn.textContent = '复制'; copyBtn.classList.remove('is-copied'); } }, 1600); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(copyText).then(copied).catch(function () { fallbackCopy(copyText, copied); });
      } else fallbackCopy(copyText, copied);
      return;
    }
    var editBtn = e.target.closest('.msg-edit-btn');
    if (editBtn) {
      e.preventDefault();
      if (sending) { toast('等当前回复结束后再编辑'); return; }
      var editRow = editBtn.closest('.msg');
      var editIndex = editRow ? Number(editRow.dataset.index) : -1;
      var editMessage = history[editIndex];
      var latestUserIndex = -1;
      for (var ei = history.length - 1; ei >= 0; ei--) {
        if (history[ei] && history[ei].role === 'user') { latestUserIndex = ei; break; }
      }
      if (!editMessage || editMessage.role !== 'user' || editIndex !== latestUserIndex || editMessage.image || editMessage.voice || editMessage.sticker) {
        toast('目前只能编辑最新的一条文字消息');
        return;
      }
      if (!window.confirm('编辑这条消息后，它后面的回复会被移除，并根据新内容重新发送。确定继续吗？')) return;
      editingMessageIndex = editIndex;
      pendingQuote = null;
      msgInput.value = String(editMessage.content || '');
      autoGrow();
      renderQuotePreview();
      msgInput.focus();
      try { msgInput.setSelectionRange(msgInput.value.length, msgInput.value.length); } catch (ignore) {}
      toast('已载入编辑内容，修改后点击发送即可');
      return;
    }
    var regenBtn = e.target.closest('.msg-regenerate-btn');
    if (regenBtn) {
      e.preventDefault();
      if (sending) { toast('等当前回复结束后再重新生成'); return; }
      var regenRow = regenBtn.closest('.msg');
      var regenIndex = regenRow ? Number(regenRow.dataset.index) : -1;
      var regenMessage = history[regenIndex];
      if (!regenMessage || regenMessage.role !== 'assistant' || regenIndex !== history.length - 1) {
        toast('目前只能重新生成对话中最新的一条回复');
        return;
      }
      var promptIndex = regenIndex - 1;
      while (promptIndex >= 0 && history[promptIndex].role !== 'user') promptIndex--;
      var originalPrompt = promptIndex >= 0 ? String(history[promptIndex].content || '').trim() : '';
      if (!originalPrompt) { toast('没有找到对应的用户消息'); return; }
      if (!window.confirm('重新生成这条回复？当前回复会被替换，之前的聊天记录会保留。')) return;
      var previousHistory = history.slice();
      history = history.slice(0, regenIndex);
      if (!saveHistory()) { history = previousHistory; return; }
      renderChat();
      sendText(originalPrompt, true, true, null);
      return;
    }
    var quoteBtn = e.target.closest('.msg-quote-btn');
    if (quoteBtn) {
      e.preventDefault();
      var quoteRow = quoteBtn.closest('.msg');
      if (quoteRow) setQuoteFromMessage(Number(quoteRow.dataset.index));
      return;
    }
    if (e.target.closest('.quote-cancel')) {
      e.preventDefault();
      pendingQuote = null;
      renderQuotePreview();
      return;
    }
    var btn = e.target.closest('.love-btn');
    if (!btn) return;
    e.preventDefault();
    var row = btn.closest('.msg');
    if (row) toggleLove(Number(row.dataset.index));
  });

  function fallbackCopy(value, done) {
    var field = document.createElement('textarea');
    field.value = value; field.setAttribute('readonly', '');
    field.style.position = 'fixed'; field.style.opacity = '0'; field.style.pointerEvents = 'none';
    document.body.appendChild(field); field.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    field.remove();
    if (ok) done(); else toast('复制失败，请长按文字手动复制');
  }

  msgList.addEventListener('dblclick', function (e) {
    if (e.target.closest('button')) return;
    var bubble = e.target.closest('.bubble');
    if (!bubble) return;
    var row = bubble.closest('.msg');
    if (!row || row.classList.contains('user')) return;
    var i = Number(row.dataset.index);
    if (!isNaN(i)) toggleLove(i);
  });

  /* 软键盘：布局视口没缩时锁到 visualViewport */
  var vv = window.visualViewport || null;
  function setAppHeight(px) {
    var root = document.documentElement;
    if (px == null) { root.style.removeProperty('--app-h'); root.classList.remove('kb-open'); }
    else { root.style.setProperty('--app-h', Math.round(px) + 'px'); root.classList.add('kb-open'); }
  }
  function syncViewport() {
    if (!vv) return;
    var gap = Math.max(0, window.innerHeight - vv.height);
    // 键盘高度因设备而异；用较低阈值识别小屏键盘，并留出回弹区间。
    if (gap > 80) setAppHeight(vv.height);
    else if (gap < 60) setAppHeight(null);
  }
  if (vv) {
    vv.addEventListener('resize', syncViewport);
    vv.addEventListener('scroll', syncViewport);
  }
  window.addEventListener('resize', syncViewport);
  window.addEventListener('orientationchange', function () {
    setAppHeight(null);
    setTimeout(syncViewport, 180);
  });
  msgInput.addEventListener('focus', function () { setTimeout(syncViewport, 280); });
  msgInput.addEventListener('blur', function () { setTimeout(syncViewport, 180); });

  /* ================= 搜索 ================= */
  function setSearch(open) {
    searchOpen = open;
    var bar = $('searchBar');
    if (!bar) return;
    bar.hidden = !open;
    if (open) setTimeout(function () { $('searchInput').focus(); }, 60);
    else {
      searchTerm = '';
      searchCursor = -1;
      $('searchInput').value = '';
      $('searchCount').textContent = '';
      if ($('searchPrev')) $('searchPrev').disabled = true;
      if ($('searchNext')) $('searchNext').disabled = true;
      renderChat();
    }
  }
  function runSearch(v) {
    searchTerm = String(v || '').trim();
    searchCursor = -1;
    renderChat();
    var n = 0;
    if (searchTerm) {
      var low = searchTerm.toLowerCase();
      history.forEach(function (m) { if (String(m.content || '').toLowerCase().indexOf(low) >= 0) n++; });
    }
    $('searchCount').textContent = searchTerm ? (n ? n + ' 条' : '没有') : '';
    if ($('searchPrev')) $('searchPrev').disabled = !n;
    if ($('searchNext')) $('searchNext').disabled = !n;
  }
  function cycleSearchMatch(direction) {
    if (!searchTerm) return;
    var low = searchTerm.toLowerCase(), matches = [];
    history.forEach(function (m, index) {
      if (String(m.content || '').toLowerCase().indexOf(low) >= 0) matches.push(index);
    });
    if (!matches.length) return;
    searchCursor = searchCursor < 0 ? (direction < 0 ? matches.length - 1 : 0) : (searchCursor + (direction < 0 ? -1 : 1) + matches.length) % matches.length;
    var targetIndex = matches[searchCursor];
    var nodes = msgList.querySelectorAll('.msg[data-index]');
    Array.prototype.forEach.call(nodes, function (node) {
      node.classList.toggle('search-current', Number(node.dataset.index) === targetIndex);
    });
    var target = msgList.querySelector('.msg[data-index="' + targetIndex + '"]');
    if (target) {
      var top = target.offsetTop - Math.max(24, chatScroll.clientHeight * 0.28);
      chatScroll.scrollTo ? chatScroll.scrollTo({ top: top, behavior: REDUCE ? 'auto' : 'smooth' }) : (chatScroll.scrollTop = top);
    }
    $('searchCount').textContent = (searchCursor + 1) + ' / ' + matches.length;
    jumpToChatMessage(targetIndex);
  }
  if ($('chatSearch')) $('chatSearch').addEventListener('click', function () { setSearch(!searchOpen); });
  $('searchClose').addEventListener('click', function () { setSearch(false); });
  $('searchInput').addEventListener('input', function () { runSearch(this.value); });
  if ($('searchPrev')) $('searchPrev').addEventListener('click', function () { cycleSearchMatch(-1); });
  if ($('searchNext')) $('searchNext').addEventListener('click', function () { cycleSearchMatch(1); });
  $('searchInput').addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); setSearch(false); }
    else if (e.key === 'Enter') { e.preventDefault(); cycleSearchMatch(e.shiftKey ? -1 : 1); }
  });

  window.addEventListener('pagehide', function () { if (currentView === 'chat') captureChatScrollState(true); });
  /* ================= 贴纸 ================= */
  var stickerTray = null;
  function buildTray() {
    if (stickerTray) return stickerTray;
    stickerTray = document.createElement('div');
    stickerTray.className = 'dice-pop';
    stickerTray.id = 'stickerTray';
    stickerTray.innerHTML = '<p class="dice-kicker">STICKERS · 贴一张</p><div class="picker-grid" id="stickerGrid"></div>';
    document.body.appendChild(stickerTray);
    var grid = stickerTray.querySelector('#stickerGrid');
    grid.style.gridTemplateColumns = 'repeat(3,1fr)';
    grid.innerHTML = STICKERS.map(function (s) {
      return '<button class="pl-row" data-sticker="' + s.key + '" type="button" style="flex-direction:column;gap:4px;padding:8px;border-radius:16px">' +
        stickerSvg(s.key, 40) + '<span style="font-size:11px;color:var(--ink-sub)">' + s.name + '</span></button>';
    }).join('');
    grid.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sticker]');
      if (b) sendSticker(b.getAttribute('data-sticker'));
    });
    return stickerTray;
  }
  function openStickers() { buildTray().classList.add('show'); }
  function closeStickers() { if (stickerTray) stickerTray.classList.remove('show'); }
  $('openStickers').addEventListener('click', function (e) {
    e.stopPropagation();
    if (stickerTray && stickerTray.classList.contains('show')) closeStickers();
    else openStickers();
  });
  document.addEventListener('click', function (e) {
    if (stickerTray && stickerTray.classList.contains('show') && !stickerTray.contains(e.target) && !e.target.closest('#openStickers')) closeStickers();
    var dp = $('dicePop');
    if (dp && dp.classList.contains('show') && !dp.contains(e.target) && !e.target.closest('#openDice')) closeDice();
  });

  /* ================= 快捷短语 ================= */
  function savePhrases() { write('mizu.quickPhrases', phrases); }
  function renderChips() {
    var box = $('chipsRow');
    if (!box) return;
    box.innerHTML = phrases.map(function (p, i) {
      return '<button class="qchip" data-chip="' + i + '" type="button">' + esc(p) + '</button>';
    }).join('');
  }
  var chipPress = null, chipLong = false;
  $('chipsRow').addEventListener('pointerdown', function (e) {
    var chip = e.target.closest('.qchip');
    if (!chip) return;
    chipLong = false;
    chipPress = setTimeout(function () {
      chipLong = true;
      editChip(Number(chip.getAttribute('data-chip')), chip);
    }, 600);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
    $('chipsRow').addEventListener(ev, function () { clearTimeout(chipPress); });
  });
  $('chipsRow').addEventListener('click', function (e) {
    if (chipLong) { chipLong = false; return; }
    var chip = e.target.closest('.qchip');
    if (!chip) return;
    var p = phrases[Number(chip.getAttribute('data-chip'))];
    if (!p) return;
    msgInput.value = p;
    autoGrow();
    sendMessage();
  });
  function editChip(idx, btn) {
    var wrap = document.createElement('span');
    wrap.className = 'qchip is-editing';
    wrap.innerHTML = '<input type="text" maxlength="24" value="' + esc(phrases[idx] || '') + '">';
    btn.parentNode.replaceChild(wrap, btn);
    var inp = wrap.querySelector('input');
    inp.focus(); inp.select();
    function commit(save) {
      var v = inp.value.trim();
      if (save && v) { phrases[idx] = v; savePhrases(); }
      renderChips();
    }
    inp.addEventListener('blur', function () { commit(true); });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); commit(true); }
      if (e.key === 'Escape') commit(false);
    });
  }

  /* ================= 骰子 ================= */
  var diceIdx = 0;
  function openDice() {
    diceIdx = Math.floor(Math.random() * TOPICS.length);
    $('diceQ').textContent = TOPICS[diceIdx];
    $('dicePop').classList.add('show');
  }
  function closeDice() { $('dicePop').classList.remove('show'); }
  $('openDice').addEventListener('click', function (e) {
    e.stopPropagation();
    if ($('dicePop').classList.contains('show')) closeDice(); else openDice();
  });
  $('diceAgain').addEventListener('click', function () {
    diceIdx = (diceIdx + 1 + Math.floor(Math.random() * (TOPICS.length - 1))) % TOPICS.length;
    $('diceQ').textContent = TOPICS[diceIdx];
  });
  $('diceAsk').addEventListener('click', function () {
    var t = TOPICS[diceIdx];
    closeDice();
    msgInput.value = t;
    autoGrow();
    if (currentView !== 'chat') switchView('chat');
    setTimeout(sendMessage, 140);
  });

  /* ================= 模型 ================= */
  var MODEL_PRESETS = ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'deepseek-chat', 'qwen-plus'];
  function openModel() {
    var list = MODEL_PRESETS.slice();
    if (config.model && list.indexOf(config.model) < 0) list.unshift(config.model);
    openSheet('<div class="panel-head"><h2 class="panel-title">切换模型</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X + '</button></div>' +
      '<div class="pl-list" id="modelList">' + list.map(function (m) {
        return '<button class="pl-row" data-model="' + esc(m) + '" type="button"><span class="pl-meta"><span class="pl-title" style="font-family:var(--mono);font-size:13px">' + esc(m) + '</span></span>' +
          (m === config.model ? '<span style="font-size:11px;color:var(--accent-deep)">当前</span>' : '') + '</button>';
      }).join('') + '</div>' +
      '<label class="field" style="margin:0"><span class="field-label">或自己填一个</span><input id="modelCustom" type="text" spellcheck="false" placeholder="model-name"></label>' +
      '<div class="panel-actions"><button class="btn-primary" id="modelSave" type="button">用这个模型</button></div>',
      function (ov, close) {
        ov.addEventListener('click', function (e) {
          var b = e.target.closest('[data-model]');
          if (!b) return;
          setModel(b.getAttribute('data-model'));
          close();
        });
        ov.querySelector('#modelSave').addEventListener('click', function () {
          var v = ov.querySelector('#modelCustom').value.trim();
          if (!v) { toast('还没填模型名'); return; }
          setModel(v);
          close();
        });
      });
  }
  function setModel(m) {
    config.model = m;
    saveConfig();
    var el = $('modelName');
    if (el) el.textContent = m;
    toast('切换到 ' + m);
  }
  $('modelPill').addEventListener('click', openModel);

  /* ================= 通用浮层 ================= */
  var X = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function openSheet(html, onReady) {
    var ov = document.createElement('div');
    ov.className = 'overlay is-open';
    ov.innerHTML = '<div class="panel" role="dialog" aria-modal="true">' + html + '</div>';
    document.body.appendChild(ov);
    function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }
    function close() {
      document.removeEventListener('keydown', onKey, true);
      if (ov.parentNode) ov.parentNode.removeChild(ov);
    }
    document.addEventListener('keydown', onKey, true);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    var b = ov.querySelector('[data-close]');
    if (b) b.addEventListener('click', close);
    if (onReady) onReady(ov, close);
    return close;
  }

  function openOverlay(el) { el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false'); }
  function closeOverlay(el) { el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true'); }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.classList.remove('show'); }, 2000);
  }

  function compress(file, cb, maxSide, q) {
    if (!file || !/^image\//i.test(file.type || '') || file.size > 20 * 1024 * 1024) {
      cb(null);
      if (file && file.size > 20 * 1024 * 1024) toast('图片太大了，请选择 20 MB 以内的图片');
      else toast('请选择有效的图片文件');
      return;
    }
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image();
      img.onload = function () {
        try {
          var max = maxSide || 1200, quality = q || 0.8;
          var sc = Math.min(1, max / Math.max(img.width, img.height));
          var cv = document.createElement('canvas');
          cv.width = Math.max(1, Math.round(img.width * sc));
          cv.height = Math.max(1, Math.round(img.height * sc));
          var ctx = cv.getContext('2d');
          if (!ctx) { cb(null); return; }
          ctx.drawImage(img, 0, 0, cv.width, cv.height);
          cb(cv.toDataURL('image/jpeg', quality));
        } catch (err) { cb(null); }
      };
      img.onerror = function () { cb(null); };
      img.src = fr.result;
    };
    fr.onerror = function () { cb(null); };
    try { fr.readAsDataURL(file); } catch (err) { cb(null); }
  }

  function pickImage(cb, opts) {
    var mem = memories.slice().sort(function (a, b) { return b.ts - a.ts; }).slice(0, 12);
    openSheet('<div class="panel-head"><h2 class="panel-title">选一张</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X + '</button></div>' +
      (mem.length ? '<div class="picker-grid">' + mem.map(function (m, i) {
        return '<button class="picker-cell" data-pick="' + i + '" type="button"><img src="' + esc(m.img) + '" alt="" loading="lazy"></button>';
      }).join('') + '</div>' : '<p class="empty-tip">相册还是空的，先上传一张。</p>') +
      '<label class="field" style="margin:16px 0 0"><span class="field-label">或上传一张</span><input id="pickFile" type="file" accept="image/*" style="padding:8px"></label>',
      function (ov, close) {
        ov.addEventListener('click', function (e) {
          var c = e.target.closest('[data-pick]');
          if (!c) return;
          cb(mem[Number(c.getAttribute('data-pick'))].img);
          close();
        });
        ov.querySelector('#pickFile').addEventListener('change', function () {
          var f = this.files && this.files[0];
          if (!f) return;
          compress(f, function (data) {
            if (!data) { toast('这张图读不出来'); return; }
            cb(data);
            close();
          }, (opts && opts.max) || 1200, (opts && opts.q) || 0.8);
        });
      });
  }

  /* ================= 心情浮层 ================= */
  function openMoodSheet() {
    openSheet('<div class="panel-head"><h2 class="panel-title">今天的心情</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X + '</button></div>' +
      '<div class="mood-row" id="moodRow"></div><p class="mood-word" id="moodWord" style="margin-top:16px"></p>',
      function (ov, close) {
        renderMoodCard();
        var today = moodOfDay(isoOf());
        var w = ov.querySelector('#moodWord');
        if (w) w.innerHTML = today ? '今天 <b>' + (moodDef(today.mood) || {}).name + '</b>' : '今天还没有打卡';
        ov.addEventListener('click', function (e) {
          var b = e.target.closest('.mood-btn');
          if (!b) return;
          setMood(b.getAttribute('data-mood'));
          setTimeout(close, 260);
        });
      });
  }

  /* ================= 背景 ================= */
  function openBg() {
    openSheet('<div class="panel-head"><h2 class="panel-title">手机壁纸</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X + '</button></div>' +
      '<div id="bgPreview" style="height:160px;border-radius:16px;background:var(--field);background-size:cover;background-position:center;border:1px solid var(--field-line)"></div>' +
      '<div class="panel-actions"><button class="btn-primary" id="bgPick" type="button">从相册选 / 上传</button><button class="btn-ghost" id="bgClear" type="button">恢复晨雾默认</button></div>',
      function (ov) {
        var pre = ov.querySelector('#bgPreview');
        function paint() {
          var u = (config.wallpaper || '').trim();
          pre.style.backgroundImage = u ? 'url("' + u.replace(/"/g, '%22') + '")' : '';
        }
        paint();
        ov.querySelector('#bgPick').addEventListener('click', function () {
          pickImage(function (url) {
            config.wallpaper = url;
            saveConfig();
            applyWallpaper();
            paint();
            toast('背景换好了');
          }, { max: 1600, q: 0.8 });
        });
        ov.querySelector('#bgClear').addEventListener('click', function () {
          config.wallpaper = '';
          saveConfig();
          applyWallpaper();
          paint();
          toast('回到晨雾默认背景');
        });
      });
  }


  /* ================= 歌单 ================= */
  function savePlaylist() { write('mizu.playlist', playlist); }
  function openPlaylist() {
    openSheet('<div class="panel-head"><h2 class="panel-title">共听歌单</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X + '</button></div>' +
      '<div class="pl-list" id="plList"></div>' +
      '<label class="field"><span class="field-label">歌名</span><input id="plTitle" type="text" maxlength="40" placeholder="例如：Fog Lake"></label>' +
      '<label class="field"><span class="field-label">歌手</span><input id="plArtist" type="text" maxlength="30" placeholder="小沢 & 你"></label>' +
      '<label class="field"><span class="field-label">封面（可留空）</span><div class="io-row"><input id="plCover" type="text" spellcheck="false" placeholder="https://… 或从相册选"><button class="btn-ghost" id="plPick" type="button">相册</button></div></label>' +
      '<div class="panel-actions"><button class="btn-primary" id="plAdd" type="button">加进歌单</button></div>',
      function (ov) {
        function paint() {
          var box = ov.querySelector('#plList');
          if (!playlist.length) { box.innerHTML = '<p class="empty-tip">还没有歌。加一首，首页就会有一台小播放器。</p>'; return; }
          box.innerHTML = playlist.map(function (t, i) {
            return '<div class="pl-row"><span class="pl-idx num">' + pad2(i + 1) + '</span><span class="pl-meta"><span class="pl-title">' + esc(t.title) +
              '</span><span class="pl-artist">' + esc(t.artist || '—') + '</span></span>' +
              '<button class="chip" data-del="' + i + '" type="button">删掉</button></div>';
          }).join('');
        }
        paint();
        ov.addEventListener('click', function (e) {
          var d = e.target.closest('[data-del]');
          if (!d) return;
          playlist.splice(Number(d.getAttribute('data-del')), 1);
          if (playerIdx >= playlist.length) playerIdx = 0;
          savePlaylist(); paint(); renderPlayer();
        });
        ov.querySelector('#plPick').addEventListener('click', function () {
          pickImage(function (u) { ov.querySelector('#plCover').value = u; });
        });
        ov.querySelector('#plAdd').addEventListener('click', function () {
          var t = ov.querySelector('#plTitle').value.trim();
          if (!t) { toast('还没写歌名'); return; }
          playlist.push({ title: t, artist: ov.querySelector('#plArtist').value.trim() || '小沢 & 你', url: '', cover: ov.querySelector('#plCover').value.trim() });
          savePlaylist();
          if (playlist.length === 1) { playerIdx = 0; playerPos = 0; }
          ov.querySelector('#plTitle').value = '';
          ov.querySelector('#plCover').value = '';
          paint(); renderPlayer();
          toast('加进歌单了');
        });
      });
  }


  /* ================= 相册 ================= */
  function saveMemories() {
    try {
      localStorage.setItem('mizu.memories', JSON.stringify(memories));
      return true;
    } catch (e) {
      toast('设备存储空间不足，这次没有覆盖或删除旧照片');
      return false;
    }
  }
  var albumFilter = 'all', albumQuery = '';
  function renderAlbum() {
    var grid = $('albumGrid');
    if (!grid) return;
    var all = memories.slice().sort(function (a, b) { return b.ts - a.ts; });
    var items = all.filter(function (m) {
      return (albumFilter !== 'favorite' || m.favorite) && (!albumQuery || [m.caption, m.location, m.weather, m.mood, m.story].join(' ').toLowerCase().indexOf(albumQuery.toLowerCase()) >= 0);
    });
    var html = '<div class="album-tools"><div class="album-summary"><span class="album-total">' + all.length + '</span><span>张共同记忆</span><span class="album-fav-total">♥ ' + all.filter(function (m) { return !!m.favorite; }).length + '</span></div><label class="album-search"><span aria-hidden="true">⌕</span><input id="albumSearch" type="search" maxlength="60" placeholder="找一段照片里的记忆" value="' + esc(albumQuery) + '" aria-label="搜索照片说明"></label><div class="album-filters" role="group" aria-label="相册筛选"><button type="button" data-album-filter="all" class="' + (albumFilter === 'all' ? 'is-on' : '') + '">全部</button><button type="button" data-album-filter="favorite" class="' + (albumFilter === 'favorite' ? 'is-on' : '') + '">♥ 收藏</button></div></div>';
    html += '<button class="album-add' + (all.length ? '' : ' is-wide') + '" data-add type="button"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg><span>放进一张照片</span></button>';
    if (!items.length) html += '<div class="album-empty">' + (albumFilter === 'favorite' ? '还没有收藏的照片。遇见喜欢的，点亮它吧。' : (all.length ? '没有找到这段记忆。换个关键词试试？' : '还没有照片。等你把某一天的湖面放进来。')) + '</div>';
    else {
      var lastAlbumDay = '';
      items.forEach(function (m) {
        var date = new Date(m.ts);
        var dateKey = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        if (dateKey !== lastAlbumDay) {
          html += '<div class="album-day-heading"><span>' + esc(dayLabel(date)) + '</span><small>' + date.getFullYear() + '.' + pad2(date.getMonth() + 1) + '.' + pad2(date.getDate()) + '</small></div>';
          lastAlbumDay = dateKey;
        }
        var idx = memories.indexOf(m);
        html += '<figure class="album-card"><button class="album-open" data-open="' + idx + '" type="button" aria-label="查看照片"><span class="album-photo"><img src="' + esc(m.img) + '" alt="" loading="lazy"></span></button><button class="album-favorite' + (m.favorite ? ' is-on' : '') + '" data-favorite="' + idx + '" type="button" aria-label="' + (m.favorite ? '取消收藏' : '收藏照片') + '">' + (m.favorite ? '♥' : '♡') + '</button><figcaption class="album-meta"><span class="album-cap">' + esc(m.caption || '未命名的瞬间') + '</span>' + (m.location || m.weather || m.mood ? '<span class="album-details-line">' + [m.location ? '⌖ ' + esc(m.location) : '', m.weather ? '☁ ' + esc(m.weather) : '', m.mood ? '♡ ' + esc(m.mood) : ''].filter(Boolean).join(' · ') + '</span>' : '') + (m.story ? '<span class="album-story-preview">' + esc(m.story) + '</span>' : '') + (m.source && m.source.kind === 'chat' ? '<span class="album-source">来自聊天 · ' + (m.source.role === 'user' ? '我' : 'TA') + '</span>' : '') + '<span class="album-date">' + fmtPlain(new Date(m.ts)) + '</span></figcaption></figure>';
      });
    }
    grid.innerHTML = html;
    var search = $('albumSearch');
    if (search) search.addEventListener('input', function () {
      var pos = this.selectionStart; albumQuery = this.value; renderAlbum();
      var next = $('albumSearch'); if (next) { next.focus(); next.setSelectionRange(pos, pos); }
    });
  }
  function openAddMemory() {
    openSheet('<div class="panel-head"><h2 class="panel-title">放进一张照片</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X + '</button></div>' +
      '<label class="field"><span class="field-label">本地图片 · 会自动压缩</span><input id="memFile" type="file" accept="image/*" style="padding:8px"></label>' +
      '<label class="field"><span class="field-label">或粘贴图片链接</span><input id="memUrl" type="url" spellcheck="false" placeholder="https://…"></label>' +
      '<label class="field"><span class="field-label">配一句话</span><input id="memCap" type="text" maxlength="40" placeholder="那天的风很大"></label>' +
      '<div class="panel-actions"><button class="btn-primary" id="memSave" type="button">收进相册</button></div>',
      function (ov, close) {
        var pending = null;
        ov.querySelector('#memFile').addEventListener('change', function () {
          var f = this.files && this.files[0];
          if (!f) return;
          compress(f, function (d) {
            if (!d) { toast('这张图读不出来'); return; }
            pending = d;
            toast('图片准备好了');
          }, 1200, 0.8);
        });
        ov.querySelector('#memSave').addEventListener('click', function () {
          var img = pending || ov.querySelector('#memUrl').value.trim();
          if (!img) { toast('先选一张图或粘一个链接'); return; }
          if (!pending && !/^https?:\/\//i.test(img)) { toast('链接要以 http(s) 开头'); return; }
          memories.push({ img: img, caption: ov.querySelector('#memCap').value.trim(), ts: Date.now() });
          if (!saveMemories()) {
            memories.pop();
            return;
          }
          renderAlbum();
          renderJournal();
          close();
          toast('收进相册了');
        });
      });
  }
  $('addMemory').addEventListener('click', openAddMemory);
  $('albumGrid').addEventListener('click', function (e) {
    var filter = e.target.closest('[data-album-filter]');
    if (filter) { albumFilter = filter.getAttribute('data-album-filter'); renderAlbum(); return; }
    var add = e.target.closest('[data-add]');
    if (add) { openAddMemory(); return; }
    var fav = e.target.closest('[data-favorite]');
    if (fav) {
      var fi = Number(fav.getAttribute('data-favorite')), fm = memories[fi]; if (!fm) return;
      var oldFavorite = !!fm.favorite; fm.favorite = !oldFavorite;
      if (!saveMemories()) { fm.favorite = oldFavorite; return; }
      renderAlbum(); toast(fm.favorite ? '这张照片收藏好啦' : '已取消收藏'); return;
    }
    var open = e.target.closest('[data-open]');
    if (open) {
      var m = memories[Number(open.getAttribute('data-open'))]; if (!m) return;
      activeAlbumPhoto = memories.indexOf(m);
      $('lbFavorite').textContent = m.favorite ? '♥ 已收藏' : '♡ 收藏';
      $('lbImg').src = m.img; $('lbCap').textContent = m.caption || '';
      $('lbDate').textContent = fmtPlain(new Date(m.ts));
      $('lbExtra').textContent = [m.location ? '⌖ ' + m.location : '', m.weather ? '☁ ' + m.weather : '', m.mood ? '♡ ' + m.mood : '', m.story || ''].filter(Boolean).join('  ·  ');
      $('lbExtra').hidden = !$('lbExtra').textContent;
      var hasChatSource = !!(m.source && m.source.kind === 'chat');
      $('lbSource').textContent = hasChatSource ? ('来自聊天 · ' + (m.source.role === 'user' ? '我' : 'TA')) : '手动添加';
      $('lbSource').hidden = false;
      $('lbChatSource').hidden = !hasChatSource;
      $('lightbox').classList.add('is-open'); $('lightbox').setAttribute('aria-hidden', 'false');
    }
  });
  (function () {
    var t = null;
    $('albumGrid').addEventListener('pointerdown', function (e) {
      var card = e.target.closest('.album-card');
      if (!card) return;
      t = setTimeout(function () { card.classList.add('is-reveal'); }, 500);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
      $('albumGrid').addEventListener(ev, function () { clearTimeout(t); });
    });
  })();
  var activeAlbumPhoto = null;
  $('lbChatSource').addEventListener('click', function (e) {
    e.stopPropagation();
    if (activeAlbumPhoto === null || !memories[activeAlbumPhoto]) return;
    var photo = memories[activeAlbumPhoto];
    if (!photo.source || photo.source.kind !== 'chat') { toast('这张照片没有聊天来源'); return; }
    var sourceIndex = history.findIndex(function (message) {
      return message.image === photo.img &&
        message.role === photo.source.role &&
        Number(message.ts) === Number(photo.source.ts);
    });
    if (sourceIndex < 0) { toast('原始聊天记录已不在当前记录中'); return; }
    $('lightbox').classList.remove('is-open');
    $('lightbox').setAttribute('aria-hidden', 'true');
    activeAlbumPhoto = null;
    openApp('chat');
    requestAnimationFrame(function () {
      var row = msgList.querySelector('.msg[data-index="' + sourceIndex + '"]');
      if (!row) { toast('暂时无法定位这条聊天消息'); return; }
      var top = row.getBoundingClientRect().top - chatScroll.getBoundingClientRect().top;
      var target = chatScroll.scrollTop + top - (chatScroll.clientHeight - row.offsetHeight) / 2;
      if (chatScroll.scrollTo) {
        try { chatScroll.scrollTo({ top: Math.max(0, target), behavior: 'smooth' }); }
        catch (err) { chatScroll.scrollTop = Math.max(0, target); }
      } else chatScroll.scrollTop = Math.max(0, target);
      row.classList.remove('album-source-highlight');
      void row.offsetWidth;
      row.classList.add('album-source-highlight');
      setTimeout(function () { row.classList.remove('album-source-highlight'); }, 1900);
    });
  });
  $('lbFavorite').addEventListener('click', function (e) {
    e.stopPropagation(); if (activeAlbumPhoto === null || !memories[activeAlbumPhoto]) return;
    var m = memories[activeAlbumPhoto], old = !!m.favorite; m.favorite = !old;
    if (!saveMemories()) { m.favorite = old; return; }
    $('lbFavorite').textContent = m.favorite ? '♥ 已收藏' : '♡ 收藏'; renderAlbum();
  });
  $('lbEdit').addEventListener('click', function (e) {
    e.stopPropagation(); if (activeAlbumPhoto === null || !memories[activeAlbumPhoto]) return;
    var m = memories[activeAlbumPhoto];
    openSheet('<div class="panel-head"><h2 class="panel-title">收藏这一刻的细节</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X + '</button></div>' +
      '<label class="field"><span class="field-label">照片注记</span><input id="albumCaptionEdit" type="text" maxlength="80" value="' + esc(m.caption || '') + '" placeholder="给这张照片起个名字"></label>' +
      '<label class="field"><span class="field-label">地点</span><input id="albumLocationEdit" type="text" maxlength="80" value="' + esc(m.location || '') + '" placeholder="例如：海边、回家的路上"></label>' +
      '<label class="field"><span class="field-label">天气</span><input id="albumWeatherEdit" type="text" maxlength="40" value="' + esc(m.weather || '') + '" placeholder="例如：晴天，微风"></label>' +
      '<label class="field"><span class="field-label">当时的心情</span><input id="albumMoodEdit" type="text" maxlength="40" value="' + esc(m.mood || '') + '" placeholder="例如：安心、开心、想念"></label>' +
      '<label class="field"><span class="field-label">这一天的故事</span><textarea id="albumStoryEdit" rows="4" maxlength="1200" placeholder="把照片背后的故事留在这里…">' + esc(m.story || '') + '</textarea></label>' +
      '<div class="panel-actions"><button class="btn-primary" id="albumCaptionSave" type="button">保存这段回忆</button></div>', function (ov, close) {
      ov.querySelector('#albumCaptionSave').addEventListener('click', function () {
        var fields = { caption: 'albumCaptionEdit', location: 'albumLocationEdit', weather: 'albumWeatherEdit', mood: 'albumMoodEdit', story: 'albumStoryEdit' };
        var previous = {};
        Object.keys(fields).forEach(function (key) { previous[key] = m[key]; m[key] = ov.querySelector('#' + fields[key]).value.trim(); });
        if (!saveMemories()) {
          Object.keys(fields).forEach(function (key) { if (previous[key] === undefined) delete m[key]; else m[key] = previous[key]; });
          return;
        }
        $('lbCap').textContent = m.caption || '';
        $('lbExtra').textContent = [m.location ? '⌖ ' + m.location : '', m.weather ? '☁ ' + m.weather : '', m.mood ? '♡ ' + m.mood : '', m.story || ''].filter(Boolean).join('  ·  ');
        $('lbExtra').hidden = !$('lbExtra').textContent;
        renderAlbum(); renderJournal(); close(); toast('这段回忆收好啦');
      });
    });
  });
  $('lbDelete').addEventListener('click', function (e) {
    e.stopPropagation(); if (activeAlbumPhoto === null || !memories[activeAlbumPhoto]) return;
    var m = memories[activeAlbumPhoto], previous = memories;
    memories = memories.filter(function (item) { return item !== m; });
    if (!saveMemories()) { memories = previous; return; }
    $('lightbox').classList.remove('is-open'); $('lightbox').setAttribute('aria-hidden', 'true');
    activeAlbumPhoto = null; renderAlbum(); renderJournal(); toast('照片已从相册移除');
  });
  $('lightbox').addEventListener('click', function (e) {
    if (e.target !== this) return;
    this.classList.remove('is-open'); this.setAttribute('aria-hidden', 'true'); activeAlbumPhoto = null;
  });

  /* ================= 手帐 ================= */
  var journalISO = isoOf();
  var journalStyle = 'polaroid';
  var journalExpanded = false;
  var journalMonth = startOfDay(new Date());

  function renderJournalCalendar() {
    var box = $('journalCalendar');
    if (!box) return;
    var first = new Date(journalMonth.getFullYear(), journalMonth.getMonth(), 1);
    var start = new Date(first);
    start.setDate(1 - first.getDay());
    var activity = {};
    function mark(iso, kind) {
      if (!activity[iso]) activity[iso] = {};
      activity[iso][kind] = true;
    }
    history.forEach(function (m) { if (m && m.ts && !m.sticker) mark(isoOf(new Date(m.ts)), 'chat'); });
    memories.forEach(function (m) { if (m && m.img && m.ts) mark(isoOf(new Date(m.ts)), 'photo'); });
    Object.keys(notes).forEach(function (iso) { if (String(notes[iso] || '').trim()) mark(iso, 'note'); });
    Object.keys(weather).forEach(function (iso) { if (String(weather[iso] || '').trim()) mark(iso, 'weather'); });
    var days = '';
    for (var i = 0; i < 42; i++) {
      var d = new Date(start);
      d.setDate(start.getDate() + i);
      var iso = isoOf(d), kinds = activity[iso] || {};
      var classes = ['j-cal-day'];
      if (d.getMonth() !== journalMonth.getMonth()) classes.push('is-outside');
      if (iso === journalISO) classes.push('is-selected');
      if (iso === isoOf(new Date())) classes.push('is-today');
      var dots = ['photo', 'chat', 'note', 'weather'].filter(function (k) { return kinds[k]; })
        .map(function (k) { return '<i class="j-cal-dot is-' + k + '" aria-hidden="true"></i>'; }).join('');
      days += '<button class="' + classes.join(' ') + '" type="button" data-journal-day="' + iso + '" aria-label="' + iso + (dots ? '，有回忆记录' : '') + '" aria-pressed="' + (iso === journalISO ? 'true' : 'false') + '">' +
        '<span>' + d.getDate() + '</span><span class="j-cal-dots">' + dots + '</span></button>';
    }
    box.innerHTML = '<div class="j-cal-head"><button type="button" class="j-cal-month-btn" data-journal-month="-1" aria-label="上个月">‹</button>' +
      '<div><strong>' + journalMonth.getFullYear() + '年 ' + (journalMonth.getMonth() + 1) + '月</strong><small>回忆日历 · 有记录的日子会亮起</small></div>' +
      '<button type="button" class="j-cal-month-btn" data-journal-month="1" aria-label="下个月">›</button></div>' +
      '<div class="j-cal-grid j-cal-week">' + '日一二三四五六'.split('').map(function (x) { return '<span>' + x + '</span>'; }).join('') + '</div>' +
      '<div class="j-cal-grid">' + days + '</div>' +
      '<div class="j-cal-legend"><span><i class="j-cal-dot is-photo"></i>照片</span><span><i class="j-cal-dot is-chat"></i>聊天</span><span><i class="j-cal-dot is-note"></i>批注</span><span><i class="j-cal-dot is-weather"></i>天气</span></div>';
  }

  function handleJournalCalendarClick(e) {
    var monthBtn = e.target.closest('[data-journal-month]');
    if (monthBtn) {
      journalMonth = new Date(journalMonth.getFullYear(), journalMonth.getMonth() + Number(monthBtn.getAttribute('data-journal-month')), 1);
      renderJournalCalendar();
      return;
    }
    var dayBtn = e.target.closest('[data-journal-day]');
    if (dayBtn) setJournalDate(dayBtn.getAttribute('data-journal-day'));
  }

  function renderJournal() {
    var page = $('journalPage');
    if (!page) return;
    var d = parseISO(journalISO) || new Date();
    renderJournalCalendar();
    var msgs = history.filter(function (m) { return sameDay(m.ts, journalISO); });
    var dayPhotos = memories.filter(function (m) { return m && m.img && sameDay(m.ts, journalISO); })
      .sort(function (a, b) { return Number(b.ts) - Number(a.ts); });
    var note = notes[journalISO] || '';
    var w = weather[journalISO] || '';
    var shown = journalExpanded ? msgs : msgs.slice(0, 3);
    var textMsgs = msgs.filter(function (m) { return !m.sticker && String(m.content || '').trim(); });
    var daySummary = [fmtPlain(d), '聊天 ' + textMsgs.length + ' 条', '照片 ' + dayPhotos.length + ' 张'];
    if (w) daySummary.push('天气：' + w);
    var photoStory = dayPhotos.find(function (p) { return p.story || p.caption; });
    if (photoStory) daySummary.push('照片记忆：' + (photoStory.story || photoStory.caption));
    if (textMsgs.length) {
      var firstLine = String(textMsgs[0].content || '').replace(/\s+/g, ' ').trim();
      var lastLine = String(textMsgs[textMsgs.length - 1].content || '').replace(/\s+/g, ' ').trim();
      daySummary.push('当天的一句话：' + (firstLine.length > 100 ? firstLine.slice(0, 100) + '…' : firstLine));
      if (lastLine !== firstLine) daySummary.push('后来：' + (lastLine.length > 100 ? lastLine.slice(0, 100) + '…' : lastLine));
    }
    if (note.trim()) daySummary.push('手帐批注：' + note.trim());
    var daySummaryText = daySummary.join('\n');
    var recapLead = textMsgs.length || dayPhotos.length || note.trim() || w
      ? ('这一天留下了 ' + textMsgs.length + ' 条文字对话、' + dayPhotos.length + ' 张照片' + (w ? '，天气是' + w : '') + '。')
      : '这一天还没有留下记录。也许可以从一句话、一张照片开始。';

    var html = '<div class="j-head"><div class="j-num num">' + d.getDate() + '</div>' +
      '<div class="j-head-side"><p class="j-ym">' + d.getFullYear() + ' · ' + pad2(d.getMonth() + 1) + '月</p>' +
      '<p class="j-week">星期' + WEEK[d.getDay()] + '</p></div></div>';
    html += '<div class="j-line"></div>';
    html += '<section class="j-recap"><div class="j-recap-top"><span class="j-recap-kicker">A DAY TO KEEP · 今日回顾</span><span class="j-recap-count">' + textMsgs.length + ' 句 · ' + dayPhotos.length + ' 张</span></div>' +
      '<p class="j-recap-lead">' + esc(recapLead) + '</p>' +
      (photoStory ? '<p class="j-recap-detail">' + esc(photoStory.caption || photoStory.story) + '</p>' : '') +
      '<button class="j-recap-copy" id="copyJournalSummary" type="button">复制这一天的回忆</button></section>';
    html += '<label class="j-weather"><span>WEATHER · 天气</span><input id="jWeather" type="text" maxlength="20" placeholder="晴，有雾，风很轻…" value="' + esc(w) + '"></label>';

    var timeline = [];
    shown.forEach(function (m, index) {
      if (m.sticker || !String(m.content || '').trim()) return;
      timeline.push({ type: 'chat', ts: Number(m.ts) || 0, order: index, item: m });
    });
    dayPhotos.forEach(function (photo, index) {
      timeline.push({ type: 'photo', ts: Number(photo.ts) || 0, order: index, item: photo });
    });
    timeline.sort(function (a, b) {
      if (a.ts !== b.ts) return a.ts - b.ts;
      if (a.type !== b.type) return a.type === 'photo' ? -1 : 1;
      return a.order - b.order;
    });

    html += '<section class="j-sec j-timeline-sec"><div class="j-timeline-head"><p class="j-sec-title">OUR DAY · 今日时光</p><span class="j-timeline-total">' + timeline.length + ' 个片段</span></div>';
    if (!timeline.length) {
      html += '<div class="j-timeline-empty">这一天还没有留下片段。等一句话，或一张照片，来开启它。</div>';
    } else {
      html += '<div class="j-timeline">';
      timeline.forEach(function (event) {
        if (event.type === 'chat') {
          var m = event.item;
          html += '<article class="j-timeline-event is-chat"><span class="j-timeline-rail" aria-hidden="true"></span><div class="j-timeline-meta"><span class="j-timeline-kind">MESSAGE · ' + (m.role === 'user' ? '你' : '小沢') + '</span><time>' + hhmm(m.ts) + '</time></div><div class="j-timeline-message">' + esc(m.content) + '</div></article>';
          return;
        }
        var photo = event.item;
        var photoDetails = [
          photo.location ? '<span>⌖ ' + esc(photo.location) + '</span>' : '',
          photo.weather ? '<span>☁ ' + esc(photo.weather) + '</span>' : '',
          photo.mood ? '<span>♡ ' + esc(photo.mood) + '</span>' : ''
        ].filter(Boolean).join('');
        html += '<article class="j-timeline-event is-photo"><span class="j-timeline-rail" aria-hidden="true"></span><div class="j-timeline-meta"><span class="j-timeline-kind">PHOTO · 回忆照片</span><time>' + hhmm(photo.ts) + '</time></div><div class="j-photo-memory"><button class="j-photo-open" type="button" data-journal-photo="' + memories.indexOf(photo) + '" aria-label="打开这张照片的详情"><span class="j-photo' + (journalStyle === 'polaroid' ? ' is-polaroid' : '') + '"><img src="' + esc(photo.img) + '" alt="" loading="lazy">' +
          (journalStyle === 'polaroid' ? '<span class="j-frame-cap">' + esc(photo.caption || fmtPlain(new Date(photo.ts))) + '</span>' : '') + '</span></button>' +
          (journalStyle !== 'polaroid' && photo.caption ? '<p class="j-photo-caption">' + esc(photo.caption) + '</p>' : '') +
          (photoDetails ? '<div class="j-photo-details">' + photoDetails + '</div>' : '') +
          (photo.story ? '<p class="j-photo-story">' + esc(photo.story) + '</p>' : '') + '</div></article>';
      });
      html += '</div>';
    }
    if (msgs.length > 3) html += '<button class="j-more" id="jMore" type="button">' + (journalExpanded ? '收起' : '展开全部 ' + msgs.length + ' 条聊天') + '</button>';
    html += '</section>';

    html += '<div class="j-sec"><p class="j-sec-title">NOTE · 批注</p><textarea class="j-note" id="jNote" maxlength="500" placeholder="写给这一天的一句话…">' + esc(note) + '</textarea></div>';

    page.innerHTML = html;
    page.className = 'journal-page' + (journalStyle === 'film' ? ' is-film' : '');
    page.onclick = function (e) {
      var trigger = e.target.closest('[data-journal-photo]');
      if (!trigger) return;
      var index = Number(trigger.getAttribute('data-journal-photo'));
      var selected = memories[index];
      if (!selected) { toast('这张照片已经不在相册里了'); return; }
      activeAlbumPhoto = index;
      $('lbFavorite').textContent = selected.favorite ? '♥ 已收藏' : '♡ 收藏';
      $('lbImg').src = selected.img;
      $('lbCap').textContent = selected.caption || '';
      $('lbDate').textContent = fmtPlain(new Date(selected.ts));
      $('lbExtra').textContent = [selected.location ? '⌖ ' + selected.location : '', selected.weather ? '☁ ' + selected.weather : '', selected.mood ? '♡ ' + selected.mood : '', selected.story || ''].filter(Boolean).join('  ·  ');
      $('lbExtra').hidden = !$('lbExtra').textContent;
      var hasChatSource = !!(selected.source && selected.source.kind === 'chat');
      $('lbSource').textContent = hasChatSource ? ('来自聊天 · ' + (selected.source.role === 'user' ? '我' : 'TA')) : '手动添加';
      $('lbSource').hidden = false;
      $('lbChatSource').hidden = !hasChatSource;
      $('lightbox').classList.add('is-open');
      $('lightbox').setAttribute('aria-hidden', 'false');
    };

    var copyRecap = $('copyJournalSummary');
    if (copyRecap) copyRecap.addEventListener('click', function () {
      function copied() { toast('这一天的回忆已复制'); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(daySummaryText).then(copied).catch(function () { fallbackCopy(daySummaryText, copied); });
      } else fallbackCopy(daySummaryText, copied);
    });
    $('jWeather').addEventListener('input', function () {
      weather[journalISO] = this.value;
      write('mizu.weather', weather);
    });
    $('jNote').addEventListener('input', function () {
      notes[journalISO] = this.value;
      write('mizu.notes', notes);
    });
    var more = $('jMore');
    if (more) more.addEventListener('click', function () { journalExpanded = !journalExpanded; renderJournal(); });
  }

  function setJournalDate(iso) {
    journalISO = iso;
    var selectedDate = parseISO(iso);
    if (selectedDate) journalMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    journalExpanded = false;
    var inp = $('journalDate');
    if (inp) inp.value = iso;
    renderJournal();
  }
  $('journalDate').value = journalISO;
  $('journalDate').addEventListener('change', function () { setJournalDate(this.value || isoOf()); });
  $('journalCalendar').addEventListener('click', handleJournalCalendarClick);
  $('jPrev').addEventListener('click', function () {
    var d = parseISO(journalISO) || new Date();
    d.setDate(d.getDate() - 1);
    setJournalDate(isoOf(d));
  });
  $('jNext').addEventListener('click', function () {
    var d = parseISO(journalISO) || new Date();
    d.setDate(d.getDate() + 1);
    setJournalDate(isoOf(d));
  });
  forEach(document.querySelectorAll('#journalStyle .seg-btn'), function (b) {
    b.addEventListener('click', function () {
      journalStyle = b.getAttribute('data-style');
      forEach(document.querySelectorAll('#journalStyle .seg-btn'), function (x) { x.classList.toggle('is-on', x === b); });
      renderJournal();
    });
  });

  /* ================= 信件 ================= */
  function saveLetters() { write('mizu.letters', letters); }
  function renderLetters() {
    var box = $('letterList');
    if (!box) return;
    var list = letters.slice().sort(function (a, b) { return b.ts - a.ts; });
    if (!list.length) { box.innerHTML = '<p class="empty-tip">还没有信。第一封可以只有一句「今天有雾」。</p>'; return; }
    box.innerHTML = list.map(function (l) {
      var ai = l.from === 'ai';
      return '<article class="letter-item" data-ts="' + l.ts + '">' +
        '<header class="letter-head"><div class="letter-who"><p class="letter-from">' + (ai ? '小沢 写给你' : '你 写给 小沢') + '</p>' +
        '<p class="letter-meta">' + fmtPlain(new Date(l.ts)) + ' · ' + (ai ? (l.read ? '已拆开' : '未拆') : '已封存') + '</p></div>' +
        '<span class="letter-seal" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
        (ai ? '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M4 7.5l8 5.5 8-5.5"/>' : '<path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16z"/>') +
        '</svg></span></header>' +
        '<div class="letter-body"><p class="letter-text">' + esc(l.content) + '</p>' +
        (ai ? '' : '<div class="letter-foot"><button class="chip" data-reply="' + l.ts + '" type="button">请 TA 回信</button></div>') +
        '</div></article>';
    }).join('');
  }
  $('letterNew').addEventListener('click', function () {
    $('letterCompose').hidden = false;
    $('letterText').value = '';
    $('letterText').focus();
  });
  $('letterCancel').addEventListener('click', function () { $('letterCompose').hidden = true; });
  $('letterSeal').addEventListener('click', function () {
    var t = $('letterText').value.trim();
    if (!t) { toast('还没写呢'); return; }
    letters.push({ from: 'user', content: t, ts: Date.now(), sealed: true, read: true });
    saveLetters();
    $('letterText').value = '';
    $('letterCompose').hidden = true;
    renderLetters();
    toast('信已封存');
  });
  $('letterList').addEventListener('click', function (e) {
    var r = e.target.closest('[data-reply]');
    if (r) { e.stopPropagation(); askReply(Number(r.getAttribute('data-reply')), r); return; }
    var item = e.target.closest('.letter-item');
    if (!item) return;
    var ts = Number(item.getAttribute('data-ts'));
    if (item.classList.toggle('is-open')) {
      letters.forEach(function (l) {
        if (l.ts === ts && l.from === 'ai' && !l.read) {
          l.read = true;
          saveLetters();
          var meta = item.querySelector('.letter-meta');
          if (meta) meta.textContent = fmtPlain(new Date(ts)) + ' · 已拆开';
        }
      });
    }
  });
  function askReply(ts, btn) {
    var letter = null;
    letters.forEach(function (l) { if (l.ts === ts) letter = l; });
    if (!letter) return;
    if (!config.endpoint) { toast('先在设置里填 API 地址'); return; }
    btn.disabled = true;
    btn.textContent = '正在写…';
    var h = buildHeaders();
    h['Accept'] = 'application/json';
    fetch(normalizeEndpoint(config.endpoint), {
      method: 'POST',
      headers: h,
      body: JSON.stringify({
        model: config.model || DEF_MODEL,
        stream: false,
        messages: [
          { role: 'system', content: (config.system || DEFAULT_SYSTEM) + '\n\n现在请以恋人的口吻，给用户写一封 300 字以内的回信，只输出信的正文，不用标题和列表。' },
          { role: 'user', content: '这是我写给你的信：\n' + letter.content }
        ]
      })
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (d) {
      var c = d && d.choices && d.choices[0];
      var text = c && ((c.message && c.message.content) || c.text);
      if (!text) throw new Error('没有收到回信内容');
      letters.push({ from: 'ai', content: String(text).trim(), ts: Date.now(), sealed: true, read: false });
      saveLetters();
      renderLetters();
      toast('TA 的回信到了');
    }).catch(function (e) {
      btn.disabled = false;
      btn.textContent = '请 TA 回信';
      toast('回信没送到：' + (e && e.message ? e.message : '网络问题'));
    });
  }

  /* ================= 星河 ================= */
  var gCanvas, gCtx, gStars = [], gRot = 0, gRAF = null, gW = 0, gH = 0, gDust = [], gTimer = null;

  function galaxySize() {
    gCanvas = $('galaxyCanvas');
    if (!gCanvas) return false;
    var w = gCanvas.parentNode.clientWidth || 320;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    gW = w; gH = 420;
    gCanvas.width = Math.round(w * dpr);
    gCanvas.height = Math.round(gH * dpr);
    gCanvas.style.height = gH + 'px';
    gCtx = gCanvas.getContext('2d');
    gCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return true;
  }

  function galaxyLayout() {
    var all = lovedMessages();
    var total = all.length;
    var msgs = total > 150 ? all.slice(-150) : all;
    var n = msgs.length;
    var base = Math.min(gW, gH) * 0.46;
    var maxR = Math.min(gW / 2 - 26, gH / 2 - 26);
    gStars = msgs.map(function (m, i) {
      var t = n <= 1 ? 0 : i / (n - 1);
      return {
        m: m,
        angle: i * 2.39996 + t * 1.1,
        radius: n === 1 ? 0 : Math.min(34 + Math.sqrt(t) * base, maxR),
        size: i === n - 1 ? 5 : 3.1,
        x: 0, y: 0
      };
    });
    gDust = [];
    for (var k = 0; k < 90; k++) {
      var rr = Math.pow(k / 90, 0.7);
      gDust.push({ a: k * 2.39996 + rr * 2.4, r: 24 + rr * base * 1.1, s: 0.7 + (k % 5) * 0.22, alpha: 0.1 + (k % 7) * 0.018 });
    }
    return total;
  }

  function galaxyDraw(t) {
    if (!gCtx) return;
    var ctx = gCtx, w = gW, h = gH;
    ctx.clearRect(0, 0, w, h);
    var cx = w / 2, cy = h / 2;
    var cs = getComputedStyle(document.documentElement);
    var accent = (cs.getPropertyValue('--accent-deep') || '#4FB8D4').trim();
    var faint = (cs.getPropertyValue('--ink-sub') || '#6B8A96').trim();

    for (var d = 0; d < gDust.length; d++) {
      var du = gDust[d], da = du.a + gRot * 0.8;
      ctx.globalAlpha = du.alpha;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(da) * du.r, cy + Math.sin(da) * du.r * 0.58, du.s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (var i = 0; i < gStars.length; i++) {
      var s = gStars[i];
      var a = s.angle + gRot;
      var x = cx + Math.cos(a) * s.radius;
      var y = cy + Math.sin(a) * s.radius * 0.58;
      s.x = x; s.y = y;
      var latest = (Date.now() - s.m.ts) < 86400000;
      if (latest) {
        var pulse = REDUCE ? 0.5 : 0.5 + 0.5 * Math.sin((t || 0) / 620);
        var g = ctx.createRadialGradient(x, y, 0, x, y, 22 + pulse * 10);
        g.addColorStop(0, 'rgba(127,212,232,' + (0.5 + pulse * 0.3).toFixed(2) + ')');
        g.addColorStop(0.5, 'rgba(127,212,232,0.18)');
        g.addColorStop(1, 'rgba(127,212,232,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, 22 + pulse * 10, 0, Math.PI * 2); ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(x, y, latest ? s.size + 1 : s.size, 0, Math.PI * 2);
      ctx.fillStyle = latest ? accent : faint;
      ctx.globalAlpha = latest ? 1 : 0.75;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function galaxyTick(t) {
    if (currentView !== 'archive' || arcPane !== 'stars') return;
    if (!REDUCE) gRot += 0.00045;
    galaxyDraw(t);
    if (!REDUCE) gRAF = requestAnimationFrame(galaxyTick);
  }

  function renderGalaxy() {
    if (!galaxySize()) return;
    var n = galaxyLayout();
    var title = $('galaxyTitle');
    if (title) title.textContent = n + ' 颗记忆星 · OUR GALAXY';
    var empty = $('galaxyEmpty');
    if (empty) empty.style.display = n ? 'none' : 'grid';
    galaxyDraw(0);
  }
  function startGalaxy() {
    renderGalaxy();
    if (gRAF) cancelAnimationFrame(gRAF);
    gRAF = null;
    if (!REDUCE) gRAF = requestAnimationFrame(galaxyTick);
  }
  function stopGalaxy() {
    if (gRAF) cancelAnimationFrame(gRAF);
    gRAF = null;
  }
  if ($('galaxyCanvas')) {
    function hitStar(e) {
      var rect = $('galaxyCanvas').getBoundingClientRect();
      var x = e.clientX - rect.left, y = e.clientY - rect.top;
      var best = null, bestD = 26 * 26;
      gStars.forEach(function (s) {
        var d = (s.x - x) * (s.x - x) + (s.y - y) * (s.y - y);
        if (d < bestD) { bestD = d; best = s; }
      });
      return best;
    }
    $('galaxyCanvas').addEventListener('click', function (e) {
      var best = hitStar(e);
      if (!best) return;
      var pop = $('galaxyPop');
      pop.innerHTML = '<p>' + esc(best.m.content) + '</p><span>' + fmtPlain(new Date(best.m.ts)) + ' · ' + hhmm(best.m.ts) + '　双击发给 TA</span>';
      pop.classList.add('show');
      clearTimeout(gTimer);
      gTimer = setTimeout(function () { pop.classList.remove('show'); }, 6000);
    });
    $('galaxyCanvas').addEventListener('dblclick', function (e) {
      var best = hitStar(e);
      if (!best) return;
      switchView('chat');
      sendText('还记得你说：' + best.m.content);
    });
    window.addEventListener('resize', function () { if (currentView === 'archive' && arcPane === 'stars') startGalaxy(); });
  }

  /* ================= 戳一戳 ================= */
  var lastPoke = 0;
  function poke() {
    var now = Date.now();
    if (now - lastPoke < 30000) { toast('刚刚戳过了，让 TA 缓一下'); return; }
    lastPoke = now;
    var av = document.querySelector('.ta-ava');
    if (av) { av.classList.remove('is-poke'); void av.offsetWidth; av.classList.add('is-poke'); }
    var wave = document.createElement('div');
    wave.className = 'poke-wave';
    document.body.appendChild(wave);
    setTimeout(function () { if (wave.parentNode) wave.parentNode.removeChild(wave); }, 760);
    if (sending) return;
    if (currentView !== 'chat') switchView('chat');
    sendText('你戳了戳小沢');
  }

  /* ================= 资料卡 / 关于 ================= */
  function openProfile() {
    $('profileDays').textContent = String(daysTogether());
    $('profileSince').textContent = fmtPlain(relationshipStart());
    $('profileSaid').textContent = history.length + ' 句';
    $('profileWhisper').textContent = whisperOf(new Date());
    renderMoodChart();
    var loved = lovedMessages().slice(-5).reverse();
    $('lovedList').innerHTML = loved.length ? loved.map(function (m) {
      return '<li class="loved-item"><span class="loved-heart">' + HEART_SVG + '</span><span class="loved-text">' + esc(m.content) + '</span></li>';
    }).join('') : '<li class="loved-empty">还没有收藏的话 —— 在聊天里双击 TA 的气泡试试</li>';
    openOverlay(profileOverlay);
  }
  if ($('openProfile')) $('openProfile').addEventListener('click', openProfile);

  function openAbout() {
    var rows = [
      ['在一起', daysTogether() + ' 天'],
      ['说过的话', history.length + ' 句'],
      ['收藏', lovedMessages().length + ' 颗'],
      ['照片', memories.length + ' 张'],
      ['信件', letters.length + ' 封'],
      ['心情', moods.length + ' 次']
    ];
    $('aboutStats').innerHTML = rows.map(function (r) {
      return '<div style="padding:8px 16px;border-radius:16px;background:var(--field);border:1px solid var(--field-line)">' +
        '<p style="font-size:11px;line-height:16px;color:var(--ink-sub)">' + r[0] + '</p>' +
        '<p class="num" style="font-family:var(--mono);font-size:16px;line-height:24px;color:var(--ink)">' + r[1] + '</p></div>';
    }).join('');
    openOverlay($('aboutOverlay'));
  }
  if ($('openAbout')) $('openAbout').addEventListener('click', openAbout);
  $('moreAbout').addEventListener('click', openAbout);
  $('aboutClose').addEventListener('click', function () { closeOverlay($('aboutOverlay')); });
  $('moreSettings').addEventListener('click', function () { openSettings(); });
  if ($('moreExportBtn')) $('moreExportBtn').addEventListener('click', function () {
    var exportButton = $('exportBtn');
    if (exportButton) exportButton.click();
    else toast('备份入口暂时不可用');
  });
  if ($('moreImportBtn')) $('moreImportBtn').addEventListener('click', function () {
    var importButton = $('importBtn');
    if (importButton) importButton.click();
    else toast('恢复入口暂时不可用');
  });

  /* ================= 设置 ================= */
  var headerRows = $('headerRows');
  var pendingTheme = config.theme || 'water';

  function addHeaderRow(k, v) {
    var row = document.createElement('div');
    row.className = 'header-row';
    row.innerHTML = '<input class="hkey" type="text" spellcheck="false" placeholder="Header 名称" aria-label="请求头名称">' +
      '<input class="hval" type="text" spellcheck="false" placeholder="值" aria-label="请求头的值">' +
      '<button class="icon-btn row-del" type="button" aria-label="删除这一行"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg></button>';
    row.querySelector('.hkey').value = k || '';
    row.querySelector('.hval').value = v || '';
    row.querySelector('.row-del').addEventListener('click', function () { row.remove(); });
    headerRows.appendChild(row);
  }

  function openSettings() {
    $('setEndpoint').value = config.endpoint;
    $('setKey').value = config.apiKey;
    $('setKey').type = 'password';
    if ($('toggleKeyVisibility')) { $('toggleKeyVisibility').textContent = '显示'; $('toggleKeyVisibility').setAttribute('aria-label', '显示 API Key'); $('toggleKeyVisibility').setAttribute('aria-pressed', 'false'); }
    $('setModel').value = config.model;
    $('setAnniversary').value = config.anniversary || '';
    if ($('setBubbleMode')) $('setBubbleMode').value = config.bubbleMode || 'split';
    if ($('setReasoningDisplay')) $('setReasoningDisplay').value = config.showReasoning === false ? 'hide' : 'show';
    $('setSystem').value = config.system;
    $('setGreeting').value = config.greeting || '';
    $('setStatusLine').value = config.statusLine || '想你';
    if ($('setMusicUrl')) $('setMusicUrl').value = config.musicUrl || '';
    if ($('setShell')) $('setShell').checked = config.shell !== false;
    pendingTheme = theme;
    applyTheme(theme);
    headerRows.innerHTML = '';
    if (config.headers.length) config.headers.forEach(function (h) { addHeaderRow(h.key, h.value); });
    else addHeaderRow('', '');
    openOverlay(settingsOverlay);
  }

  function stripTrailingSlash(value) {
    var s = String(value || '').trim();
    return s.charAt(s.length - 1) === '/' ? s.slice(0, -1) : s;
  }

  function saveSettings() {
    var previousConfig = config;
    var headers = [];
    forEach(headerRows.querySelectorAll('.header-row'), function (row) {
      var k = row.querySelector('.hkey').value.trim();
      if (k) headers.push({ key: k, value: row.querySelector('.hval').value.trim() });
    });
    config = {
      endpoint: $('setEndpoint').value.trim() || DEF_ENDPOINT,
      apiKey: $('setKey').value.trim(),
      model: $('setModel').value.trim() || DEF_MODEL,
      headers: headers,
      system: $('setSystem').value.trim() || DEFAULT_SYSTEM,
      anniversary: $('setAnniversary').value || '',
      theme: pendingTheme,
      wallpaper: config.wallpaper,
      shell: config.shell,
      greeting: $('setGreeting').value.trim(),
      statusLine: $('setStatusLine').value.trim() || '想你',
      musicUrl: $('setMusicUrl') ? stripTrailingSlash($('setMusicUrl').value) : (config.musicUrl || ''),
      bubbleMode: $('setBubbleMode') ? $('setBubbleMode').value : (config.bubbleMode || 'split'),
      showReasoning: $('setReasoningDisplay') ? $('setReasoningDisplay').value !== 'hide' : config.showReasoning !== false,
      relation: config.relation
    };
    if (!saveConfig()) {
      config = previousConfig;
      toast('设置没有保存成功，请先导出备份或释放一些空间');
      return;
    }
    applyTheme(config.theme);
    renderHome();
    renderJournal();
    updateStatus();
    closeOverlay(settingsOverlay);
    toast('设置已保存');
  }

  if ($('openSettings')) $('openSettings').addEventListener('click', openSettings);
  $('settingsClose').addEventListener('click', function () { closeOverlay(settingsOverlay); });
  if ($('toggleKeyVisibility')) $('toggleKeyVisibility').addEventListener('click', function () {
    var keyInput = $('setKey');
    var show = keyInput.type === 'password';
    keyInput.type = show ? 'text' : 'password';
    this.textContent = show ? '隐藏' : '显示';
    this.setAttribute('aria-label', show ? '隐藏 API Key' : '显示 API Key');
    this.setAttribute('aria-pressed', show ? 'true' : 'false');
  });
  $('saveSettings').addEventListener('click', saveSettings);
  $('clearChat').addEventListener('click', function () {
    if (abortCtrl) { try { abortCtrl.abort(); } catch (e) { /* noop */ } }
    discard = sending;
    history = [];
    saveHistory();
    renderChat();
    renderHome();
    closeOverlay(settingsOverlay);
    toast('聊天记录已清空');
  });
  $('addHeader').addEventListener('click', function () {
    addHeaderRow('', '');
    var inputs = headerRows.querySelectorAll('.hkey');
    if (inputs.length) inputs[inputs.length - 1].focus();
  });
  $('setBgBtn').addEventListener('click', openBg);
  if ($('setShell')) {
    $('setShell').addEventListener('change', function () {
      config.shell = this.checked;
      saveConfig();
      applyShell();
    });
  }
  $('clearBgBtn').addEventListener('click', function () {
    config.wallpaper = '';
    saveConfig();
    applyWallpaper();
    toast('回到晨雾默认背景');
  });
  if ($('importBtn')) {
    $('importBtn').addEventListener('click', function () { $('importFile').click(); });
    $('importFile').addEventListener('change', function () {
      var f = this.files && this.files[0];
      if (!f) return;
      var fr = new FileReader();
      fr.onload = function () {
        var d;
        try { d = JSON.parse(fr.result); } catch (e) { toast('这个文件读不出来'); return; }
        if (!d || typeof d !== 'object' || Array.isArray(d) || (d.app && d.app !== 'mizu-iro') || (!d.history && !d.config)) {
          toast('不是水色物语的备份'); return;
        }

        var arrayFields = ['history', 'chats', 'moods', 'memories', 'letters', 'playlist', 'quickPhrases', 'statuses', 'archive'];
        for (var ai = 0; ai < arrayFields.length; ai++) {
          var field = arrayFields[ai];
          if (Object.prototype.hasOwnProperty.call(d, field) && !Array.isArray(d[field])) {
            toast('备份里的「' + field + '」格式不正确'); return;
          }
        }
        var objectFields = ['notes', 'weather', 'config'];
        for (var oi = 0; oi < objectFields.length; oi++) {
          var objectField = objectFields[oi];
          if (Object.prototype.hasOwnProperty.call(d, objectField) &&
              (!d[objectField] || typeof d[objectField] !== 'object' || Array.isArray(d[objectField]))) {
            toast('备份里的设置或记录格式不正确'); return;
          }
        }
        if (Object.prototype.hasOwnProperty.call(d, 'archiveNote') && typeof d.archiveNote !== 'string') {
          toast('备份里的记忆整理摘要格式不正确'); return;
        }

        var updates = [];
        var importMap = {
          history: 'mizu.history', chats: 'mizu.chats', moods: 'mizu.moods', memories: 'mizu.memories',
          notes: 'mizu.notes', weather: 'mizu.weather', letters: 'mizu.letters',
          playlist: 'mizu.playlist', quickPhrases: 'mizu.quickPhrases',
          statuses: 'mizu.statuses', archive: 'mizu.archive'
        };
        for (var dataKey in importMap) {
          if (Object.prototype.hasOwnProperty.call(d, dataKey)) {
            updates.push({ key: importMap[dataKey], value: JSON.stringify(d[dataKey]) });
          }
        }
        if (Object.prototype.hasOwnProperty.call(d, 'activeChatId') && typeof d.activeChatId === 'string') {
          updates.push({ key: 'mizu.activeChat', value: JSON.stringify(d.activeChatId) });
        } else if (Object.prototype.hasOwnProperty.call(d, 'history') && !Object.prototype.hasOwnProperty.call(d, 'chats')) {
          updates.push({ key: 'mizu.chats', value: '[]' });
        }
        if (Object.prototype.hasOwnProperty.call(d, 'archiveNote')) {
          updates.push({ key: 'mizu.archiveNote', value: d.archiveNote });
        }
        if (d.config) {
          var cur = {};
          try { cur = JSON.parse(localStorage.getItem('mizu.config') || '{}') || {}; } catch (e3) { cur = {}; }
          // 导入备份只恢复普通设置，不允许覆盖本机 API Key 或注入敏感请求头。
          for (var ck in d.config) {
            if (!Object.prototype.hasOwnProperty.call(d.config, ck) || ck === 'apiKey') continue;
            if (ck === 'headers') {
              if (!Array.isArray(d.config.headers)) {
                toast('备份里的请求头格式不正确'); return;
              }
              cur.headers = d.config.headers.filter(function (h) {
                var name = String(h && h.key || '').trim();
                return name && !/(authorization|cookie|api[-_]?key|token|secret|credential|password)/i.test(name);
              }).map(function (h) {
                return { key: String(h.key), value: String(h.value == null ? '' : h.value) };
              });
              continue;
            }
            cur[ck] = d.config[ck];
          }
          updates.push({ key: 'mizu.config', value: JSON.stringify(cur) });
        }

        var before = updates.map(function (item) {
          return { key: item.key, value: localStorage.getItem(item.key) };
        });
        try {
          updates.forEach(function (item) { localStorage.setItem(item.key, item.value); });
          if (Object.prototype.hasOwnProperty.call(d, 'chats')) localStorage.removeItem('mizu.history');
        } catch (e2) {
          before.forEach(function (item) {
            try {
              if (item.value === null) localStorage.removeItem(item.key);
              else localStorage.setItem(item.key, item.value);
            } catch (rollbackError) { /* 尽力恢复导入前的数据 */ }
          });
          toast('导入空间不足，已尽力恢复原有数据'); return;
        }
        toast('回忆回来了 · 正在重启');
        setTimeout(function () { location.reload(); }, 700);
      };
      fr.readAsText(f);
      this.value = '';
    });
  }

  if ($('pullModels')) {
    $('pullModels').addEventListener('click', async function () {
      var btn = this, raw = $('setEndpoint').value.trim(), key = $('setKey').value.trim();
      if (!raw) { toast('先填接口地址'); return; }
      btn.disabled = true; btn.textContent = '…';
      var base = normalizeEndpoint(raw).replace(/\/chat\/completions$/i, '');
      var list = base.endsWith('/v1') ? [base] : [base, base + '/v1'], lastErr = '';
      for (var i = 0; i < list.length; i++) {
        try {
          var modelHeaders = { 'Accept': 'application/json' };
          var hasModelAuth = false;
          forEach(headerRows.querySelectorAll('.header-row'), function (row) {
            var headerName = row.querySelector('.hkey').value.trim();
            if (!headerName) return;
            modelHeaders[headerName] = row.querySelector('.hval').value;
            if (headerName.toLowerCase() === 'authorization') hasModelAuth = true;
          });
          if (key && !hasModelAuth) modelHeaders['Authorization'] = 'Bearer ' + key;
          var r = await fetch(list[i] + '/models', { headers: modelHeaders });
          if (!r.ok) {
            var detail = '';
            try { detail = (await r.text()).slice(0, 180); } catch (readError) { detail = ''; }
            lastErr = 'HTTP ' + r.status + (detail ? ' · ' + detail : '');
            if (r.status === 401 || r.status === 403) lastErr += '（检查 API Key / 自定义 Authorization 请求头）';
            if (r.status === 404) lastErr += '（检查 Endpoint 是否包含正确的 /v1 路径）';
            continue;
          }
          var arr = ((await r.json()) || {}).data || [];
          if (!arr.length) { lastErr = '返回结果为空'; continue; }
          var names = arr.map(function (m) { return m.id || m.name; }).filter(Boolean);
          openSheet('<div class="panel-head"><h2 class="panel-title">选择模型</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X2 + '</button></div><div class="pl-list">' +
            names.map(function (n) { return '<button class="pl-row" data-m="' + esc(n) + '" type="button"><span class="pl-meta"><span class="pl-title" style="font-family:var(--mono);font-size:13px">' + esc(n) + '</span></span></button>'; }).join('') + '</div>',
            function (ov, close) {
              ov.addEventListener('click', function (e) {
                var b = e.target.closest('[data-m]');
                if (!b) return;
                $('setModel').value = b.getAttribute('data-m');
                close(); toast('选好了，记得保存');
              });
            });
          btn.disabled = false; btn.textContent = '拉取'; return;
        } catch (e) {
          var message = e && (e.message || e.name) ? String(e.message || e.name) : '网络错误';
          lastErr = /failed to fetch|networkerror|load failed|fetch failed/i.test(message)
            ? '浏览器无法读取接口响应，可能是 CORS 跨域限制、地址/证书错误或网络中断'
            : message;
        }
      }
      btn.disabled = false; btn.textContent = '拉取';
      toast('没拉到模型：' + lastErr);
    });
  }
  $('exportBtn').addEventListener('click', function () {
    var cfg = {};
    for (var k in config) {
      if (!Object.prototype.hasOwnProperty.call(config, k) || k === 'apiKey') continue;
      if (k === 'headers' && Array.isArray(config.headers)) {
        // 自定义请求头可能携带订阅凭据，备份时按名称过滤敏感项。
        cfg.headers = config.headers.filter(function (h) {
          var name = String(h && h.key || '').trim();
          return name && !/(authorization|cookie|api[-_]?key|token|secret|credential|password)/i.test(name);
        }).map(function (h) {
          return { key: String(h.key), value: String(h.value == null ? '' : h.value) };
        });
        continue;
      }
      cfg[k] = config[k];
    }
    var payload = {
      app: 'mizu-iro', version: 3, exportedAt: new Date().toISOString(),
      config: cfg, history: history, chats: chatSessions, activeChatId: activeChatId, moods: moods, memories: memories,
      notes: notes, weather: weather, letters: letters, playlist: playlist,
      quickPhrases: phrases, statuses: statuses, archive: archive,
      archiveNote: read(K_ARCNOTE, '')
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'mizu-iro-' + isoOf() + '.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); if (a.parentNode) a.parentNode.removeChild(a); }, 900);
    toast('回忆已打包 · 不含 API 密钥与敏感请求头');
  });

  /* ================= 主题按钮 / About / 抽屉 ================= */
  forEach(document.querySelectorAll('[data-theme-name]'), function (b) {
    b.addEventListener('click', function () {
      pendingTheme = b.getAttribute('data-theme-name');
      applyTheme(pendingTheme);
      if (!settingsOverlay.classList.contains('is-open')) {
        config.theme = pendingTheme;
        saveConfig();
      }
    });
  });

  var drawer = null;
  function openDrawer() {
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.className = 'overlay is-open';
      drawer.style.alignItems = 'flex-end';
      drawer.style.padding = '0';
      drawer.innerHTML = '<div class="panel" role="dialog" aria-label="导航" style="max-width:none;border-radius:24px 24px 0 0;padding-bottom:calc(24px + env(safe-area-inset-bottom))">' +
        '<div class="panel-head"><h2 class="panel-title">导航</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X + '</button></div>' +
        ['home|首页|home', 'chat|聊天|moments/', 'memory|记忆|memories/', 'more|更多|more/'].map(function (row) {
          var p = row.split('|');
          return '<button class="hub-row" data-nav="' + p[0] + '" type="button" style="margin-bottom:8px"><span class="hub-row-txt">' + p[1] +
            '</span><span class="hub-arrow" style="position:static">' + p[2] + '</span></button>';
        }).join('') + '</div>';
      document.body.appendChild(drawer);
      drawer.addEventListener('click', function (e) {
        if (e.target === drawer || e.target.closest('[data-close]')) { drawer.remove(); drawer = null; return; }
        var b = e.target.closest('[data-nav]');
        if (!b) return;
        var v = b.getAttribute('data-nav');
        drawer.remove(); drawer = null;
        switchView(v);
      });
    }
  }
  document.addEventListener('keydown', function (e) {
    var scrim = $('chatSidebarScrim');
    if (!scrim || scrim.hidden || !scrim.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeChatSidebar();
      $('chatMenu').focus();
      return;
    }
    if (e.key === 'Tab') {
      var focusable = Array.prototype.slice.call(scrim.querySelectorAll('button:not([disabled]),input:not([disabled]),[href],[tabindex]:not([tabindex="-1"])')).filter(function (el) { return el.offsetParent !== null; });
      if (!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  $('chatMenu').addEventListener('click', openChatSidebar);
  if ($('chatSidebarClose')) $('chatSidebarClose').addEventListener('click', closeChatSidebar);
  if ($('chatSidebarScrim')) $('chatSidebarScrim').addEventListener('click', function (e) {
    if (e.target === this) closeChatSidebar();
  });
  if ($('chatNewWindow')) $('chatNewWindow').addEventListener('click', createChatSession);
  if ($('chatSidebarSettings')) $('chatSidebarSettings').addEventListener('click', function () {
    closeChatSidebar(); openChatSettings();
  });
  if ($('chatSidebarHome')) $('chatSidebarHome').addEventListener('click', function () {
    closeChatSidebar(); closeApp();
  });
  if ($('chatSessionList')) $('chatSessionList').addEventListener('click', function (e) {
    var pin = e.target.closest('[data-chat-pin]');
    if (pin) { var pinItem = chatSessions.find(function (item) { return item.id === pin.getAttribute('data-chat-pin'); }); if (pinItem) updateChatSessionFlag(pinItem.id, 'pinned', !pinItem.pinned); return; }
    var archive = e.target.closest('[data-chat-archive]');
    if (archive) { var archiveItem = chatSessions.find(function (item) { return item.id === archive.getAttribute('data-chat-archive'); }); if (archiveItem) updateChatSessionFlag(archiveItem.id, 'archived', !archiveItem.archived); return; }
    var del = e.target.closest('[data-chat-delete]');
    if (del) { deleteChatSession(del.getAttribute('data-chat-id') || del.getAttribute('data-chat-delete')); return; }
    var pick = e.target.closest('[data-chat-switch]');
    if (pick) {
      var targetChatId = pick.getAttribute('data-chat-switch');
      var hitIndex = Number(pick.getAttribute('data-chat-hit-index'));
      switchChatSession(targetChatId);
      if (Number.isInteger(hitIndex) && hitIndex >= 0) {
        if (targetChatId === activeChatId) jumpToChatMessage(hitIndex);
        else requestAnimationFrame(function () { jumpToChatMessage(hitIndex); });
      }
    }
  });
  document.querySelectorAll('[data-chat-filter]').forEach(function (button) {
    button.addEventListener('click', function () { chatSidebarFilter = this.getAttribute('data-chat-filter') === 'archived' ? 'archived' : 'active'; renderChatSidebar(); });
  });
  if ($('chatSessionSearch')) $('chatSessionSearch').addEventListener('input', function () {
    chatSidebarQuery = this.value || '';
    renderChatSidebar();
  });
  var chatSidebarGesture = null;
  var chatView = $('view-chat');
  if (chatView) {
    chatView.addEventListener('pointerdown', function (e) {
      var scrim = $('chatSidebarScrim');
      var opened = scrim && !scrim.hidden && scrim.classList.contains('is-open');
      if (e.target.closest('button,input,textarea,select')) return;
      if (opened && e.target === scrim) chatSidebarGesture = { x: e.clientX, y: e.clientY, mode: 'close' };
      else if (!opened && e.clientX <= 22) chatSidebarGesture = { x: e.clientX, y: e.clientY, mode: 'open' };
      else chatSidebarGesture = null;
    }, { passive: true });
    chatView.addEventListener('pointerup', function (e) {
      if (!chatSidebarGesture) return;
      var dx = e.clientX - chatSidebarGesture.x;
      var dy = e.clientY - chatSidebarGesture.y;
      var mode = chatSidebarGesture.mode;
      chatSidebarGesture = null;
      if (Math.abs(dx) < 64 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
      if (mode === 'open' && dx > 0) openChatSidebar();
      if (mode === 'close' && dx < 0) closeChatSidebar();
    }, { passive: true });
    chatView.addEventListener('pointercancel', function () { chatSidebarGesture = null; }, { passive: true });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var scrim = $('chatSidebarScrim');
      if (scrim && !scrim.hidden && scrim.classList.contains('is-open')) closeChatSidebar();
    }
  });

  /* ================= 手机绑定 ================= */
  if ($('appBack')) $('appBack').addEventListener('click', closeApp);

  if (dockEl) {
    dockEl.addEventListener('click', function (e) {
      var b = e.target.closest('.dock-btn');
      if (b) openApp(b.getAttribute('data-app'));
    });
  }

  if ($('appGrid')) {
    $('appGrid').addEventListener('click', function (e) {
      var b = e.target.closest('[data-app]');
      if (!b) return;
      openApp(b.getAttribute('data-app'), b);
    });
  }

  /* 旧页面里的 data-go / data-back */
  document.addEventListener('click', function (e) {
    var go = e.target.closest('[data-go]');
    if (go) { openApp(go.getAttribute('data-go'), go); return; }
    if (e.target.closest('[data-back]')) closeApp();
  });

  /* 解锁：点 / 上划 */
  if (lockEl) {
    var lockStartY = 0, lockMoved = false;
    lockEl.addEventListener('pointerdown', function (e) {
      lockStartY = e.clientY; lockMoved = false;
    });
    lockEl.addEventListener('pointermove', function (e) {
      if (lockStartY && lockStartY - e.clientY > 60) { lockMoved = true; unlock(); lockStartY = 0; }
    });
    lockEl.addEventListener('pointerup', function () {
      if (!lockMoved && lockStartY && Math.abs(lockStartY - 0) >= 0) { /* 轻点不锁 */ }
      lockStartY = 0;
    });
    if ($('lockFoot')) {
      $('lockFoot').addEventListener('click', function (e) { e.stopPropagation(); unlock(); });
    }
    lockEl.addEventListener('click', function (e) {
      if (e.target.closest('.sprite')) return;
      unlock();
    });
  }

  /* 主屏滑动：移动端优先使用原生 touch 事件，避免 WebView pointercancel 抢走横向手势 */
  (function () {
    if (!homeEl || !pagesEl) return;
    var startX = 0, startY = 0, lastX = 0, lastAt = 0;
    var dx = 0, velocity = 0, dragging = false, decided = false, horizontal = false;
    var touchId = null, mouseId = null, pend = 0, rafId = 0, suppress = false;

    function ignored(target) {
      return !!(target && target.closest && target.closest('.sprite, .dock, input, textarea, select, [data-no-swipe]'));
    }
    function paint(px) {
      pend = px;
      if (rafId) return;
      rafId = requestAnimationFrame(function () {
        rafId = 0;
        pagesEl.style.transform = 'translate3d(calc(' + (-100 / HOME_PAGES * homeIndex) + '% + ' + pend + 'px),0,0)';
      });
    }
    function begin(x, y, id) {
      startX = lastX = x;
      startY = y;
      lastAt = performance.now();
      dx = velocity = 0;
      dragging = true;
      decided = horizontal = false;
      touchId = id;
      pagesEl.style.willChange = 'transform';
    }
    function move(x, y, cancelNative) {
      if (!dragging) return false;
      dx = x - startX;
      var dy = y - startY;
      var now = performance.now();
      var elapsed = Math.max(1, now - lastAt);
      velocity = (x - lastX) / elapsed;
      lastX = x;
      lastAt = now;

      if (!decided && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        decided = true;
        horizontal = Math.abs(dx) > Math.abs(dy) * 1.12;
        if (horizontal) pagesEl.classList.add('is-drag');
      }
      if (!horizontal) return false;
      if (cancelNative) cancelNative();
      var atFirst = homeIndex === 0 && dx > 0;
      var atLast = homeIndex === HOME_PAGES - 1 && dx < 0;
      paint((atFirst || atLast) ? dx * 0.18 : dx);
      return true;
    }
    function finish(cancelled) {
      if (!dragging) return;
      dragging = false;
      var width = Math.max(1, homeEl.clientWidth);
      var threshold = Math.max(42, Math.min(72, width * 0.14));
      var moved = Math.abs(dx);
      var quick = moved > 14 && Math.abs(velocity) > 0.28;
      var change = horizontal && !cancelled && (moved >= threshold || quick);
      var direction = dx < 0 ? 1 : -1;
      if (horizontal && moved > 8) suppress = true;
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      pagesEl.classList.remove('is-drag');
      pagesEl.style.willChange = '';
      touchId = null;
      mouseId = null;
      if (change) goPage(homeIndex + direction);
      else goPage(homeIndex);
    }

    homeEl.addEventListener('click', function (e) {
      if (!suppress) return;
      e.stopPropagation();
      e.preventDefault();
      suppress = false;
    }, true);

    /* Android / iOS WebView：方向锁定后才阻止默认滚动，竖向滚动仍保留 */
    homeEl.addEventListener('touchstart', function (e) {
      if (dragging || !e.touches || e.touches.length !== 1 || ignored(e.target)) return;
      var t = e.touches[0];
      begin(t.clientX, t.clientY, t.identifier);
    }, { passive: true });

    homeEl.addEventListener('touchmove', function (e) {
      if (!dragging || touchId === null || !e.touches) return;
      var t = null;
      for (var i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === touchId) { t = e.touches[i]; break; }
      }
      if (!t) return;
      move(t.clientX, t.clientY, function () {
        if (e.cancelable) e.preventDefault();
      });
    }, { passive: false });

    homeEl.addEventListener('touchend', function (e) {
      if (!dragging || touchId === null) return;
      var t = null;
      for (var i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) { t = e.changedTouches[i]; break; }
      }
      if (t) move(t.clientX, t.clientY);
      finish(false);
    }, { passive: true });
    homeEl.addEventListener('touchcancel', function () { finish(true); }, { passive: true });

    /* 桌面端保留鼠标拖动，忽略触屏 PointerEvent，避免和 touch 双重处理 */
    homeEl.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0 || ignored(e.target)) return;
      mouseId = e.pointerId;
      begin(e.clientX, e.clientY, null);
    });
    homeEl.addEventListener('pointermove', function (e) {
      if (mouseId === null || e.pointerId !== mouseId) return;
      move(e.clientX, e.clientY);
    });
    homeEl.addEventListener('pointerup', function (e) {
      if (mouseId !== null && e.pointerId === mouseId) finish(false);
    });
    homeEl.addEventListener('pointercancel', function (e) {
      if (mouseId !== null && e.pointerId === mouseId) finish(true);
    });
  })();
  /* 像素精灵 */
  (function () {
    var sp = $('spriteHome');
    var bubble = $('spriteBubble');
    if (!sp) return;
    var lines = [
      '湖水今天很浅。',
      '雾散之前，先呼吸。',
      '我把涟漪存起来了。',
      '别急着说话，先待一会儿。',
      '你身上有水色的味道。'
    ];
    var wander = function () {
      var w = (homeEl ? homeEl.clientWidth : 390) - 48;
      var h = (homeEl ? homeEl.clientHeight : 844) - 220;
      var x = Math.round(16 + Math.random() * Math.max(0, w - 16));
      var y = Math.round(120 + Math.random() * Math.max(0, h - 120));
      sp.style.right = 'auto';
      sp.style.left = x + 'px';
      sp.style.bottom = 'auto';
      sp.style.top = y + 'px';
      setTimeout(wander, 10000 + Math.random() * 4000);
    };
    setTimeout(wander, 10000);
    sp.addEventListener('click', function (e) {
      e.stopPropagation();
      sp.classList.remove('is-shake');
      void sp.offsetWidth;
      sp.classList.add('is-shake');
      if (bubble) {
        bubble.textContent = lines[Math.floor(Math.random() * lines.length)];
        bubble.classList.add('show');
        clearTimeout(bubble._t);
        bubble._t = setTimeout(function () { bubble.classList.remove('show'); }, 2600);
      }
    });
  })();

  window.addEventListener('resize', fitScreen);

  /* ================= ESC ================= */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (drawer) { drawer.remove(); drawer = null; return; }
    if (stickerTray && stickerTray.classList.contains('show')) { closeStickers(); return; }
    if ($('dicePop').classList.contains('show')) { closeDice(); return; }
    if ($('lightbox').classList.contains('is-open')) {
      $('lightbox').classList.remove('is-open');
      $('lightbox').setAttribute('aria-hidden', 'true');
      return;
    }
    if (searchOpen) { setSearch(false); return; }
    if ($('aboutOverlay').classList.contains('is-open')) { closeOverlay($('aboutOverlay')); return; }
    if (settingsOverlay.classList.contains('is-open')) { closeOverlay(settingsOverlay); return; }
    if (profileOverlay.classList.contains('is-open')) closeOverlay(profileOverlay);
  });
  [profileOverlay, settingsOverlay, $('aboutOverlay')].forEach(function (ov) {
    ov.addEventListener('click', function (e) { if (e.target === ov) closeOverlay(ov); });
  });

  /* ================= 启动 ================= */
  /* ==========================================================
     记忆库 · 数据
     ========================================================== */
  var K_ARC = 'mizu.archive';
  var K_ARCNOTE = 'mizu.archiveNote';
  var archive = read(K_ARC, []) || [];
  if (!Array.isArray(archive)) archive = [];
  var arcPane = 'abyss';
  var arcOpenLayer = -1;

  function arcId() { return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function saveArchive() {
    try {
      localStorage.setItem(K_ARC, JSON.stringify(archive));
      return true;
    } catch (e) {
      toast('湖面的容量满了，先让一些碎片沉下去吧');
      return false;
    }
  }

  function arcAdd(type, text, opt) {
    opt = opt || {};
    text = String(text || '').trim();
    if (!text) return null;
    for (var i = 0; i < archive.length; i++) if (archive[i].text === text) return archive[i];
    var item = {
      id: arcId(), type: type, text: text, ts: Date.now(),
      heat: opt.heat || 0, lastHit: opt.lastHit || 0,
      pinned: !!opt.pinned, private: !!opt.private, summary: ''
    };
    archive.push(item);
    if (!saveArchive()) { archive.pop(); return null; }
    return item;
  }

  function arcDecay() {
    var now = Date.now(), week = 7 * DAY, changed = false;
    archive.forEach(function (m) {
      var base = Math.max(m.lastHit || 0, m.decayedAt || 0, m.ts || 0);
      var weeks = Math.floor((now - base) / week);
      if (weeks > 0 && m.heat > 0) {
        m.heat = Math.max(0, m.heat - weeks);
        m.decayedAt = base + weeks * week;
        changed = true;
      }
    });
    if (changed) saveArchive();
  }

  /* 发消息时命中锚点 → heat+1 */
  function arcHit(text) {
    var s = String(text || '');
    var changed = false;
    archive.forEach(function (m) {
      if (m.pinned && s.indexOf(m.text) >= 0) {
        m.heat += 1;
        m.lastHit = Date.now();
        changed = true;
      }
    });
    if (changed) {
      saveArchive();
      if (currentView === 'archive') renderArchive();
    }
  }

  function arcBump(item) {
    if (!item) return;
    item.heat += 1;
    item.lastHit = Date.now();
    saveArchive();
    if (currentView === 'archive') renderArchive();
  }

  function importLovedToArchive() {
    var loved = lovedMessages();
    if (!loved.length) { toast('还没有收藏的句子'); return; }
    var previous = archive;
    var known = Object.create(null);
    archive.forEach(function (m) { known[m.text] = true; });
    var added = 0;
    var next = archive.slice();
    loved.forEach(function (m) {
      if (known[m.content]) return;
      known[m.content] = true;
      next.push({ id: arcId(), type: 'favorite', text: m.content, ts: Number(m.ts) || Date.now(), heat: 0, lastHit: 0, pinned: false, private: false, summary: '' });
      added += 1;
    });
    if (!added) { toast('收藏里的句子已经都在记忆库啦'); return; }
    archive = next;
    if (!saveArchive()) { archive = previous; return; }
    renderArchive();
    toast('已把 ' + added + ' 条收藏收进记忆库');
  }

  function arcLayerOf(heat) {
    if (heat >= 3) return 0;
    if (heat === 2) return 1;
    if (heat === 1) return 2;
    return 3;
  }

  var ARC_LAYERS = [
    { name: '透光层', sub: 'SUNLIGHT', cls: '' },
    { name: '暮光层', sub: 'TWILIGHT', cls: 'is-mid' },
    { name: '午夜层', sub: 'MIDNIGHT', cls: 'is-mid' },
    { name: '深渊层', sub: 'ABYSS', cls: 'is-deep' }
  ];

  function hashSeed(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function stampOf(ts) {
    var d = new Date(ts);
    return (d.getMonth() + 1) + '·' + pad2(d.getDate());
  }

  /* ==========================================================
     记忆库 · 渲染
     ========================================================== */
  function renderArchive() {
    var now = Date.now();
    var recent = archive.filter(function (m) { return m.lastHit && (now - m.lastHit) < 30 * DAY; }).length;
    var sunk = archive.filter(function (m) { return m.heat <= 0; }).length;
    var stat = $('arcStat');
    if (stat) stat.textContent = archive.length + ' 条记忆 · 这 30 天被想起 ' + recent + ' 条 · 沉下去 ' + sunk + ' 条';
    var hint = $('arcHint');
    if (hint) hint.textContent = archive.length ? '点一层，潜下去' : '深海还很空';
    renderAbyss();
    renderMaintain();
    if (arcPane === 'stars') startGalaxy();
  }

  function dotHtml(list, li) {
    var out = '';
    if (!list.length) {
      for (var k = 0; k < 3; k++) {
        out += '<span class="dot" style="left:' + (18 + k * 32) + '%;top:' + (28 + k * 14) + '%;opacity:.16;animation:none"></span>';
      }
      return out;
    }
    list.slice(0, 60).forEach(function (m) {
      var s = hashSeed(m.id);
      var x = 4 + (s % 92);
      var y = 10 + ((s >> 9) % 76);
      var delay = ((s >> 17) % 500) / 100;
      out += '<span class="dot" style="left:' + x + '%;top:' + y + '%;animation-delay:-' + delay.toFixed(2) + 's"></span>';
    });
    if (list.length > 60) out += '<span class="dot" style="left:50%;top:50%;opacity:.5;animation:none"></span>';
    return out;
  }

  function arcItemHtml(m) {
    var days = m.lastHit ? Math.floor((Date.now() - m.lastHit) / DAY) : -1;
    var hitTxt = days < 0 ? '还没被想起' : (days <= 0 ? '今天被想起' : days + ' 天前被想起');
    return '<div class="abyss-item" data-id="' + m.id + '">' +
      '<p class="abyss-text">' + esc(m.text) + '</p>' +
      '<div class="abyss-meta"><span>' + stampOf(m.ts) + '</span><span>' + hitTxt + ' · heat ' + m.heat + '</span>' +
      '<button type="button" data-lift="' + m.id + '">提起</button></div></div>';
  }

  function renderAbyss() {
    var box = $('abyssLayers');
    if (!box) return;
    var groups = [[], [], [], []];
    archive.forEach(function (m) { groups[arcLayerOf(m.heat)].push(m); });

    var html = '';
    groups.forEach(function (list, li) {
      var L = ARC_LAYERS[li];
      html += '<div class="abyss-layer' + (arcOpenLayer === li ? ' is-open' : '') + '" data-layer="' + li + '">' +
        '<button class="layer-head" type="button" aria-expanded="' + (arcOpenLayer === li ? 'true' : 'false') + '">' +
        '<span class="layer-name">' + L.name + '</span>' +
        '<span class="layer-sub">' + L.sub + '</span>' +
        '<span class="layer-count">' + list.length + ' 条</span></button>' +
        '<div class="layer-dots ' + L.cls + '">' + dotHtml(list, li) + '</div>' +
        '<div class="layer-panel-slot">' +
        (arcOpenLayer === li
          ? '<div class="abyss-panel">' + (list.length ? list.map(arcItemHtml).join('') : '<p class="abyss-empty">这一层还是空的。</p>') + '</div>'
          : '') +
        '</div></div>';
    });
    box.innerHTML = html;

    var abyss = $('abyss');
    if (abyss) abyss.classList.toggle('is-empty', !archive.length);
    var emp = $('abyssEmpty');
    if (emp) emp.style.display = archive.length ? 'none' : 'block';
  }

  function toggleLayer(li) {
    arcOpenLayer = (arcOpenLayer === li) ? -1 : li;
    renderAbyss();
  }

  function liftOne(id) {
    var item = null;
    archive.forEach(function (m) { if (m.id === id) item = m; });
    if (!item) return;
    arcBump(item);
    if (currentView !== 'chat') switchView('chat');
    sendText('还记得吗：' + item.text, false, true);
  }

  /* ==========================================================
     记忆库 · 管理视图
     ========================================================== */
  var archiveQuery = '';
  var archiveFilter = 'all';

  function renderMaintain() {
    var anchors = archive.filter(function (m) { return m.pinned; });
    var ca = $('cntAnchors');
    if (ca) ca.textContent = anchors.length;
    var box = $('mtAnchors');
    if (box) {
      box.innerHTML = anchors.length ? anchors.map(function (m) {
        var days = m.lastHit ? Math.floor((Date.now() - m.lastHit) / DAY) : -1;
        var when = days < 0 ? '还没被想起' : (days <= 0 ? '今天被想起' : '最近被想起 ' + days + ' 天前');
        var short = m.text.length > 24 ? m.text.slice(0, 24) + '…' : m.text;
        return '<div class="mt-row"><div class="mt-row-main"><p class="mt-row-text">✦ ' + esc(short) + '</p>' +
          '<p class="mt-row-meta">' + when + ' · heat ' + m.heat + '</p></div>' +
          '<button type="button" data-wake="' + m.id + '">唤起</button></div>';
      }).join('') : '<p class="mt-empty">还没有锚点。先收一条，再点它旁边的「锚点」。</p>';
    }

    var query = archiveQuery.trim().toLocaleLowerCase();
    var allFragments = archive.slice().sort(function (a, b) { return b.ts - a.ts; });
    var filtered = allFragments.filter(function (m) {
      var matchesText = !query || m.text.toLocaleLowerCase().indexOf(query) !== -1;
      var matchesFilter = archiveFilter === 'all' ||
        (archiveFilter === 'pinned' && m.pinned) ||
        (archiveFilter === 'recent' && (Date.now() - m.ts) < 30 * DAY) ||
        (archiveFilter === 'sleep' && (Date.now() - m.ts) >= 30 * DAY);
      return matchesText && matchesFilter;
    });
    var cf = $('cntFragments');
    if (cf) cf.textContent = filtered.length;
    var fbox = $('mtFragments');
    if (fbox) {
      fbox.innerHTML = filtered.length
        ? '<div class="frag-wrap">' + filtered.map(function (m) {
            var short = m.text.length > 24 ? m.text.slice(0, 24) + '…' : m.text;
            return '<button class="frag" type="button" data-frag="' + m.id + '"><span class="frag-date">' + stampOf(m.ts) + (m.pinned ? ' · 锚点' : '') + '</span><span class="frag-txt">' + esc(short) + '</span></button>';
          }).join('') + '</div>'
        : '<p class="mt-empty">' + (query ? '没有找到匹配的记忆。' : '这个筛选下还没有记忆。') + '</p>';
    }

    var sleep = archive.filter(function (m) { return (Date.now() - m.ts) > 30 * DAY; }).length;
    var wk = archive.filter(function (m) { return m.lastHit && (Date.now() - m.lastHit) < 7 * DAY; }).length;
    var cv = $('cntVitals');
    if (cv) cv.textContent = archive.length;
    var vbox = $('mtVitals');
    if (vbox) {
      var note = '';
      try { note = localStorage.getItem(K_ARCNOTE) || ''; } catch (e) { note = ''; }
      vbox.innerHTML = '<p class="mt-vitals">记忆 ' + archive.length + ' 条 · 锚点 ' + anchors.length +
        ' 条 · 近 7 天唤起 ' + wk + ' 次 · 沉睡 ' + sleep + ' 条</p>' +
        (note ? '<p class="mt-row-text" style="margin-bottom:8px">' + esc(note) + '</p>' : '') +
        '<div class="mt-vitals-actions"><button class="chip" id="arcImportLoved" type="button">从收藏导入</button><button class="chip" id="arcTidy" type="button">整理</button></div>';
      var importLoved = $('arcImportLoved');
      if (importLoved) importLoved.addEventListener('click', importLovedToArchive);
      var tidy = $('arcTidy');
      if (tidy) tidy.addEventListener('click', tidyArchive);
    }
  }

  function tidyArchive() {
    var sleeping = archive.filter(function (m) { return (Date.now() - m.ts) > 30 * DAY; });
    if (!sleeping.length) { toast('还没有沉睡太久的记忆'); return; }
    if (!config.endpoint) { toast('先在设置里填 API 地址'); return; }
    var sample = sleeping.slice(0, 8).map(function (m) { return '· ' + m.text; }).join('\n');
    var btn = $('arcTidy');
    if (btn) { btn.disabled = true; btn.textContent = '整理中…'; }
    var h = buildHeaders();
    h['Accept'] = 'application/json';
    fetch(normalizeEndpoint(config.endpoint), {
      method: 'POST',
      headers: h,
      body: JSON.stringify({
        model: config.model || DEF_MODEL,
        stream: false,
        messages: [
          { role: 'system', content: '你是一个安静的归档员。用一句不超过 30 字的中文，温柔地概括这些旧记忆，不抒情过度，不用 emoji。' },
          { role: 'user', content: sample }
        ]
      })
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (d) {
      var c = d && d.choices && d.choices[0];
      var text = c && ((c.message && c.message.content) || c.text);
      if (!text) throw new Error('没有收到总结');
      var line = String(text).trim().slice(0, 60);
      try { localStorage.setItem(K_ARCNOTE, line); } catch (e) { /* noop */ }
      sleeping[0].summary = line;
      saveArchive();
      renderMaintain();
      toast('整理好了');
    }).catch(function (e) {
      if (btn) { btn.disabled = false; btn.textContent = '整理'; }
      toast('整理没成功：' + (e && e.message ? e.message : '网络问题'));
    });
  }

  /* ==========================================================
     记忆库 · 交互
     ========================================================== */
  function syncArcSeg() {
    if (!arcSeg) return;
    forEach(arcSeg.querySelectorAll('.seg-btn'), function (x) {
      x.classList.toggle('is-on', x.getAttribute('data-pane') === arcPane);
    });
    var a = $('paneAbyss'), s = $('paneStars'), m = $('paneMaintain');
    if (a) a.hidden = arcPane !== 'abyss';
    if (s) s.hidden = arcPane !== 'stars';
    if (m) m.hidden = arcPane !== 'maintain';
  }

  var arcSeg = $('arcSeg');
  if (arcSeg) {
    arcSeg.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pane]');
      if (!b) return;
      arcPane = b.getAttribute('data-pane');
      syncArcSeg();
      if (arcPane === 'stars') { renderGalaxy(); startGalaxy(); }
      else stopGalaxy();
      if (arcPane === 'maintain') renderMaintain();
    });
  }

  var abyssEl = $('abyssLayers');
  if (abyssEl) {
    abyssEl.addEventListener('click', function (e) {
      var lift = e.target.closest('[data-lift]');
      if (lift) { e.stopPropagation(); liftOne(lift.getAttribute('data-lift')); return; }
      var head = e.target.closest('.layer-head');
      if (!head) return;
      var layer = head.closest('.abyss-layer');
      if (layer) toggleLayer(Number(layer.getAttribute('data-layer')));
    });
  }

  if ($('arcAddBtn')) {
    function addFromInput() {
      var inp = $('arcInput');
      var v = inp.value.trim();
      if (!v) return;
      if (arcAdd('impress', v)) {
        inp.value = '';
        renderArchive();
        toast('沉下去了');
      }
    }
    $('arcAddBtn').addEventListener('click', addFromInput);
    $('arcInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); addFromInput(); }
    });
  }

  var archiveSearchEl = $('archiveSearch');
  var archiveFilterEl = $('archiveFilter');
  if (archiveSearchEl) {
    archiveSearchEl.addEventListener('input', function () {
      archiveQuery = archiveSearchEl.value || '';
      renderMaintain();
    });
  }
  if (archiveFilterEl) {
    archiveFilterEl.addEventListener('change', function () {
      archiveFilter = archiveFilterEl.value || 'all';
      renderMaintain();
    });
  }

  var mtAnchorsEl = $('mtAnchors');
  if (mtAnchorsEl) {
    mtAnchorsEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-wake]');
      if (!b) return;
      var id = b.getAttribute('data-wake');
      var item = null;
      archive.forEach(function (m) { if (m.id === id) item = m; });
      if (!item) return;
      arcBump(item);
      if (currentView !== 'chat') switchView('chat');
      sendText('关于这段记忆，你还记得吗：' + item.text, false, true);
    });
  }

  var mtFragEl = $('mtFragments');
  if (mtFragEl) {
    mtFragEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-frag]');
      if (!b) return;
      var id = b.getAttribute('data-frag');
      var item = null;
      archive.forEach(function (m) { if (m.id === id) item = m; });
      if (!item) return;
      openSheet('<div class="panel-head"><h2 class="panel-title">一条碎片</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X + '</button></div>' +
        '<p class="arc-stat" style="margin-bottom:8px">' + fmtPlain(new Date(item.ts)) + ' · heat ' + item.heat + (item.pinned ? ' · 锚点' : '') + '</p>' +
        '<p id="fragText" class="frag-detail-text">' + esc(item.text) + '</p>' +
        '<textarea id="fragEditor" class="frag-editor" maxlength="4000" aria-label="编辑记忆内容" hidden></textarea>' +
        '<div class="panel-actions frag-actions"><button class="btn-ghost" id="fragEdit" type="button">编辑内容</button>' +
        '<button class="btn-ghost" id="fragPin" type="button">' + (item.pinned ? '取消锚点' : '设为锚点') + '</button>' +
        '<button class="btn-primary" id="fragLift" type="button">提起</button></div>',
        function (ov, close) {
          var textNode = ov.querySelector('#fragText');
          var editor = ov.querySelector('#fragEditor');
          var editBtn = ov.querySelector('#fragEdit');
          editBtn.addEventListener('click', function () {
            if (editor.hidden) {
              editor.value = item.text;
              editor.hidden = false;
              textNode.hidden = true;
              editBtn.textContent = '保存修改';
              editor.focus();
              return;
            }
            var next = editor.value.trim();
            if (!next) { toast('记忆内容不能为空'); return; }
            var duplicate = archive.some(function (m) { return m !== item && m.text === next; });
            if (duplicate) { toast('已经有一条相同的记忆啦'); return; }
            var previous = item.text;
            item.text = next;
            if (!saveArchive()) { item.text = previous; return; }
            renderArchive();
            close();
            toast('记忆更新好了');
          });
          ov.querySelector('#fragPin').addEventListener('click', function () {
            var previous = item.pinned;
            item.pinned = !item.pinned;
            if (!saveArchive()) { item.pinned = previous; return; }
            renderArchive(); close();
            toast(item.pinned ? '设成锚点了' : '取消锚点了');
          });
          ov.querySelector('#fragLift').addEventListener('click', function () { close(); liftOne(id); });
        });
    });
  }

  forEach(document.querySelectorAll('.mt-sec-head'), function (h) {
    h.addEventListener('click', function () {
      h.parentNode.classList.toggle('is-open');
    });
  });

  /* 聊天里长按自己的气泡 → 收进记忆库 */
  (function () {
    var press = null;
    chatScroll.addEventListener('pointerdown', function (e) {
      var bubble = e.target.closest('.msg.user .bubble');
      if (!bubble) return;
      clearTimeout(press);
      press = setTimeout(function () {
        var row = bubble.closest('.msg');
        var i = row ? Number(row.dataset.index) : -1;
        var m = history[i];
        if (!m || m.sticker) return;
        openSheet('<div class="panel-head"><h2 class="panel-title">收进记忆库</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X + '</button></div>' +
          '<p style="font-size:14px;line-height:24px;color:var(--ink)">' + esc(m.content.length > 60 ? m.content.slice(0, 60) + '…' : m.content) + '</p>' +
          '<div class="panel-actions"><button class="btn-primary" id="clipSave" type="button">收进记忆库</button></div>',
          function (ov, close) {
            ov.querySelector('#clipSave').addEventListener('click', function () {
              var item = arcAdd('excerpt', m.content);
              close();
              if (item) { renderArchive(); toast('收进记忆库了'); }
            });
          });
      }, 600);
    });
    ['pointerup', 'pointercancel', 'pointermove', 'scroll'].forEach(function (ev) {
      chatScroll.addEventListener(ev, function () { clearTimeout(press); }, { passive: true });
    });
  })();

  /* 每天首次打开，收录昨天最晚一条 AI 回复 */
  function collectYesterday() {
    var yIso = isoOf(new Date(Date.now() - DAY));
    var last = null;
    history.forEach(function (m) {
      if (m.role !== 'user' && !m.sticker && sameDay(m.ts, yIso)) last = m;
    });
    if (!last) return;
    var exists = false;
    archive.forEach(function (m) { if (m.type === 'near' && m.text === last.content) exists = true; });
    if (!exists) arcAdd('near', last.content);
  }

  /* ==========================================================
     聊天页细节：思考过程 / 图片 / 语音 / 日历热图
     ========================================================== */
  var X2 = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  msgList.addEventListener('click', function (e) {
    var bar = e.target.closest('.reason-bar');
    if (!bar) return;
    var wrap = bar.parentNode;
    var open = wrap.classList.toggle('is-open');
    bar.setAttribute('aria-label', open ? '收起思考过程' : '展开思考过程');
  });

  /* 图片消息 */
  function pickChatImage() {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.onchange = function () {
      var f = inp.files && inp.files[0];
      if (!f) return;
      compress(f, function (url) {
        if (!url) { toast('这张图读不出来'); return; }
        history.push({ role: 'user', image: url, content: '[图片]', ts: Date.now() });
        saveHistory();
        renderChat();
        renderHome();
        scrollToBottom(true);
        sendText('[图片] 我发了一张照片给你看', true);
      }, 1200, 0.8);
    };
    inp.click();
  }

  /* 语音输入：使用浏览器原生语音识别，不伪造语音转文字输入 */
  var micTimer = null, micHeld = false, micRecognition = null;
  var recToast = document.createElement('div');
  recToast.className = 'rec-toast';
  recToast.textContent = '松开发送 · 正在识别';
  document.body.appendChild(recToast);

  function resetMic() {
    micHeld = false;
    clearTimeout(micTimer);
    var btn = $('micBtn');
    if (btn) btn.classList.remove('is-rec');
    recToast.classList.remove('show');
    micRecognition = null;
  }

  function micStart(e) {
    e.preventDefault();
    if (sending) { toast('TA 正在回你上一句'); return; }
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast('当前浏览器暂不支持语音转文字，请直接输入');
      return;
    }
    if (micHeld) return;

    micHeld = true;
    var btn = $('micBtn');
    if (btn) btn.classList.add('is-rec');
    recToast.classList.add('show');

    var recognition = new SpeechRecognition();
    micRecognition = recognition;
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = function (event) {
      var result = event.results && event.results[0] && event.results[0][0];
      var transcript = result && result.transcript ? String(result.transcript).trim() : '';
      if (!transcript) return;
      var current = msgInput.value.trim();
      msgInput.value = current ? current + ' ' + transcript : transcript;
      autoGrow();
      toast('识别完成，可以检查后发送');
    };
    recognition.onerror = function (event) {
      var reason = event && event.error;
      if (reason === 'not-allowed' || reason === 'service-not-allowed') toast('麦克风权限未开放');
      else if (reason === 'no-speech') toast('没有听清，再按住试一次');
      else if (reason !== 'aborted') toast('语音识别暂时不可用');
    };
    recognition.onend = function () {
      if (micRecognition === recognition) resetMic();
    };

    try {
      recognition.start();
      clearTimeout(micTimer);
      micTimer = setTimeout(function () { micStop(false); }, 10000);
    } catch (err) {
      resetMic();
      toast('语音识别无法启动，请检查麦克风权限');
    }
  }

  function micStop(force) {
    if (!micHeld) return;
    var recognition = micRecognition;
    resetMic();
    if (!recognition) return;
    try {
      if (force === true) recognition.abort();
      else recognition.stop();
    } catch (err) { /* 识别可能已自行结束 */ }
  }

  if ($('micBtn')) {
    $('micBtn').addEventListener('pointerdown', micStart);
    $('micBtn').addEventListener('pointerup', function () { micStop(false); });
    $('micBtn').addEventListener('pointercancel', function () { micStop(true); });
    $('micBtn').addEventListener('pointerleave', function () { micStop(false); });
  }

  /* ＋ 号：照片 / 贴纸 / 骰子 */
  if ($('openPlus')) {
    $('openPlus').addEventListener('click', function (e) {
      e.stopPropagation();
      openSheet('<div class="panel-head"><h2 class="panel-title">发点什么</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X2 + '</button></div>' +
        '<button class="hub-row" id="plusPhoto" type="button" style="margin-bottom:8px"><span class="hub-row-ico"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M4 16l4.4-4.4a2 2 0 0 1 2.8 0L15 15l1.8-1.8a2 2 0 0 1 2.8 0L20.5 15"/><circle cx="9" cy="9.5" r="1.2"/></svg></span><span class="hub-row-txt">照片</span></button>' +
        '<button class="hub-row" id="plusSticker" type="button" style="margin-bottom:8px"><span class="hub-row-ico"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v5.5L13.5 20H8a4 4 0 0 1-4-4z"/><path d="M20 13.5h-3.5a3 3 0 0 0-3 3V20"/></svg></span><span class="hub-row-txt">贴纸</span></button>' +
        '<button class="hub-row" id="plusDice" type="button"><span class="hub-row-ico"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r=".9" fill="currentColor"/><circle cx="15" cy="15" r=".9" fill="currentColor"/></svg></span><span class="hub-row-txt">抽个话题</span></button>',
        function (ov, close) {
          ov.querySelector('#plusPhoto').addEventListener('click', function () { close(); setTimeout(pickChatImage, 120); });
          ov.querySelector('#plusSticker').addEventListener('click', function () { close(); setTimeout(openStickers, 120); });
          ov.querySelector('#plusDice').addEventListener('click', function () { close(); setTimeout(openDice, 120); });
        });
    });
  }

  /* 日历热图 */
  function openHeat() {
    var counts = {};
    history.forEach(function (m) {
      var k = isoOf(new Date(m.ts));
      counts[k] = (counts[k] || 0) + 1;
    });
    var dayN = Object.keys(counts).length, total = history.length;
    var cur = new Date();
    cur.setDate(1);
    var W = ['日', '一', '二', '三', '四', '五', '六'];

    openSheet('<div class="panel-head"><h2 class="panel-title">我们聊过的每一天</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X2 + '</button></div>' +
      '<p class="heat-stat" id="heatStat">聊过 ' + dayN + ' 天 · 共 ' + total + ' 句</p>' +
      '<div class="heat-head"><button class="icon-btn" id="heatPrev" type="button" aria-label="上个月"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<span class="heat-month" id="heatMonth"></span>' +
      '<button class="icon-btn" id="heatNext" type="button" aria-label="下个月"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button></div>' +
      '<div class="heat-grid" id="heatGrid"></div>',
      function (ov, close) {
        function draw() {
          var y = cur.getFullYear(), mo = cur.getMonth();
          ov.querySelector('#heatMonth').textContent = y + ' 年 ' + (mo + 1) + ' 月';
          var first = new Date(y, mo, 1).getDay();
          var dim = new Date(y, mo + 1, 0).getDate();
          var cells = W.map(function (d) { return '<span class="heat-dow">' + d + '</span>'; }).join('');
          for (var i = 0; i < first; i++) cells += '<span class="heat-cell empty"></span>';
          for (var d = 1; d <= dim; d++) {
            var iso = y + '-' + pad2(mo + 1) + '-' + pad2(d);
            var n = counts[iso] || 0;
            var lvl = n === 0 ? 0 : n <= 1 ? 1 : n <= 3 ? 2 : n <= 6 ? 3 : n <= 12 ? 4 : 5;
            var today = iso === isoOf() ? ' today' : '';
            cells += '<button class="heat-cell' + (n ? ' has heat-' + lvl : '') + today + '" data-day="' + iso + '" type="button" aria-label="' + iso + ' ' + n + ' 句">' + d + '</button>';
          }
          ov.querySelector('#heatGrid').innerHTML = cells;
        }
        draw();
        ov.querySelector('#heatPrev').addEventListener('click', function () { cur.setMonth(cur.getMonth() - 1); draw(); });
        ov.querySelector('#heatNext').addEventListener('click', function () { cur.setMonth(cur.getMonth() + 1); draw(); });
        ov.querySelector('#heatGrid').addEventListener('click', function (e) {
          var b = e.target.closest('[data-day]');
          if (!b) return;
          var iso = b.getAttribute('data-day');
          if (!counts[iso]) return;
          close();
          jumpToDay(iso);
        });
      });
  }

  function jumpToDay(iso) {
    if (currentView !== 'chat') openApp('chat');
    var target = -1;
    history.forEach(function (m, i) { if (target < 0 && isoOf(new Date(m.ts)) === iso) target = i; });
    if (target < 0) { toast('那天没有记录'); return; }
    renderChat();
    requestAnimationFrame(function () {
      var node = msgList.querySelector('.msg[data-index="' + target + '"]');
      if (!node) return;
      var day = node.previousElementSibling;
      while (day && !day.classList.contains('msg-day')) day = day.previousElementSibling;
      var top = (day || node).offsetTop - 24;
      chatScroll.scrollTo ? chatScroll.scrollTo({ top: top, behavior: REDUCE ? 'auto' : 'smooth' }) : (chatScroll.scrollTop = top);
      if (day) {
        day.classList.remove('flash');
        void day.offsetWidth;
        day.classList.add('flash');
        setTimeout(function () { day.classList.remove('flash'); }, 1600);
      }
    });
  }

  function downloadCurrentChat(format) {
    var session = activeChatSession();
    if (!session) { toast('没有可导出的聊天窗口'); return; }
    var messages = Array.isArray(history) ? history : [];
    if (!messages.length) { toast('当前窗口还没有聊天记录'); return; }
    var title = String(session.title || '我们的聊天').replace(/[\\/:*?"<>|]+/g, '_').trim().slice(0, 32) || '聊天记录';
    var stamp = new Date().toISOString().slice(0, 10);
    var content, mime, extension;
    if (format === 'json') {
      var safeMessages = JSON.parse(JSON.stringify(messages));
      function redactExport(value) {
        if (!value || typeof value !== 'object') return;
        Object.keys(value).forEach(function (key) {
          if (/authorization|cookie|api[_-]?key|access[_-]?token|refresh[_-]?token|secret|password|credential/i.test(key)) {
            value[key] = '[已隐藏]';
          } else if ((key === 'arguments' || key === 'args') && typeof value[key] === 'string') {
            try {
              var parsed = JSON.parse(value[key]);
              redactExport(parsed);
              value[key] = JSON.stringify(parsed);
            } catch (ignore) {
              value[key] = value[key].replace(/(authorization|cookie|api[_-]?key|access[_-]?token|refresh[_-]?token|secret|password|credential)(\\s*[=:]\\s*)[^,}\\s]+/gi, '$1$2[已隐藏]');
            }
          } else redactExport(value[key]);
        });
      }
      redactExport(safeMessages);
      content = JSON.stringify({
        format: 'mizu-chat-export',
        version: 1,
        exportedAt: new Date().toISOString(),
        session: { title: session.title || '我们的聊天', createdAt: session.createdAt || null, updatedAt: session.updatedAt || null },
        messages: safeMessages
      }, null, 2);
      mime = 'application/json;charset=utf-8';
      extension = 'json';
    } else {
      var lines = ['# ' + (session.title || '我们的聊天'), '', '导出时间：' + new Date().toLocaleString(), '消息数量：' + messages.length, ''];
      messages.forEach(function (m) {
        var role = m.role === 'user' ? '我' : 'TA';
        lines.push('## ' + role + ' · ' + (m.ts ? new Date(m.ts).toLocaleString() : ''));
        if (m.image) lines.push('[图片消息]');
        if (m.sticker) lines.push('[贴纸消息] ' + String(m.content || ''));
        if (m.voice) lines.push('[语音消息]');
        if (m.content && !m.image && !m.sticker && !m.voice) lines.push(String(m.content));
        if (m.reasoning || m.reasoning_content) lines.push('\n> Thinking 摘要：\n> ' + String(m.reasoning || m.reasoning_content).replace(/\n/g, '\n> '));
        if (Array.isArray(m.toolCalls) && m.toolCalls.length) {
          lines.push('\n工具调用请求记录：');
          m.toolCalls.forEach(function (tool) {
            lines.push('- ' + String(tool.name || tool.function && tool.function.name || '工具') + (tool.arguments ? '：' + String(typeof tool.arguments === 'string' ? tool.arguments : JSON.stringify(tool.arguments)) : ''));
          });
        }
        lines.push('');
      });
      content = lines.join('\n');
      mime = 'text/markdown;charset=utf-8';
      extension = 'md';
    }
    try {
      var blob = new Blob(['\uFEFF', content], { type: mime });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = title + '-' + stamp + '.' + extension;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
      toast('聊天记录已导出');
    } catch (err) {
      toast('导出失败，请检查浏览器下载权限');
    }
  }

  /* ⋯ 菜单 */
  if ($('chatMore')) {
    $('chatMore').addEventListener('click', function () {
      openSheet('<div class="panel-head"><h2 class="panel-title">聊天</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X2 + '</button></div>' +
        '<button class="hub-row" data-act="search" type="button" style="margin-bottom:8px"><span class="hub-row-txt">搜索记录</span></button>' +
        '<button class="hub-row" data-act="heat" type="button" style="margin-bottom:8px"><span class="hub-row-txt">我们聊过的每一天</span></button>' +
        '<button class="hub-row" data-act="profile" type="button" style="margin-bottom:8px"><span class="hub-row-txt">恋人资料卡</span></button>' +
        '<button class="hub-row" data-act="settings" type="button" style="margin-bottom:8px"><span class="hub-row-txt">当前窗口设置</span></button>' +
        '<button class="hub-row" data-act="export-md" type="button" style="margin-bottom:8px"><span class="hub-row-txt">导出聊天 · Markdown 文档</span></button>' +
        '<button class="hub-row" data-act="export-json" type="button" style="margin-bottom:8px"><span class="hub-row-txt">导出聊天 · 完整 JSON 备份</span></button>' +
        '<button class="hub-row" data-act="clear" type="button"><span class="hub-row-txt" style="color:#A8545C">清空当前窗口记录</span></button>',
        function (ov, close) {
          ov.addEventListener('click', function (e) {
            var b = e.target.closest('[data-act]');
            if (!b) return;
            var act = b.getAttribute('data-act');
            close();
            setTimeout(function () {
              if (act === 'search') { if (!searchOpen) setSearch(true); }
              else if (act === 'heat') openHeat();
              else if (act === 'profile') openProfile();
              else if (act === 'settings') openChatSettings();
              else if (act === 'export-md') downloadCurrentChat('md');
              else if (act === 'export-json') downloadCurrentChat('json');
              else if (act === 'clear') {
                history = [];
                saveHistory();
                renderChat();
                renderHome();
                toast('聊天记录已清空');
              }
            }, 140);
          });
        });
    });
  }

  if ($('chatTitleBtn')) $('chatTitleBtn').addEventListener('click', openProfile);
  if ($('hpNow')) $('hpNow').addEventListener('click', openPlaylist);
  if ($('chatCall')) {
    $('chatCall').addEventListener('click', function () {
      toast('电话还没接通 · TA 在雾里');
    });
  }

  function boot() {
    applyTheme(theme);
    renderChatTitle();
    if (screenEl) screenEl.classList.add('is-locked');
    applyShell();
    applyWallpaper();
    buildDots();
    if (pagesEl) pagesEl.style.setProperty('--n', String(HOME_PAGES));
    renderAppGrid();
    renderHome();
    renderChat();
    renderAlbum();
    renderJournal();
    renderLetters();
    renderChips();
    arcDecay();
    collectYesterday();
    renderArchive();
    autoGrow();
    setSendUI(false);
    if (sendBtn) sendBtn.disabled = true;

    var modelName = $('modelName');
    if (modelName) modelName.textContent = config.model;

    /* 开机 → 锁屏 */
    var bootEl = $('boot');
    if (bootEl) {
      setTimeout(function () {
        bootEl.classList.add('is-out');
        setTimeout(function () { if (bootEl.parentNode) bootEl.parentNode.removeChild(bootEl); }, 260);
      }, REDUCE ? 300 : 1400);
    }
  }

  setInterval(function () {
    renderClock();
    if (new Date().getSeconds() === 0) renderHome();
  }, 1000);


  boot();

  /* 只在 http(s) 下挂 manifest，file:// 会报 CORS */
  if (location.protocol.indexOf('http') === 0 && !document.querySelector('link[rel=manifest]')) {
    var ml = document.createElement('link');
    ml.rel = 'manifest';
    ml.href = 'manifest.webmanifest';
    document.head.appendChild(ml);
  }

  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* 离线不可用就算了 */ });
    });
  }
})();
