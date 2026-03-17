emailjs.init('e2bXYgkPJxNQ2vK2V');
  const SERVICE_ID  = 'service_dz6zoh6';
  const TEMPLATE_ID = 'template_uktmfkp';

  /* ── Toast ── */
  function showToast(msg, isError = false) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast' + (isError ? ' error' : '');
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 5000);
  }

  /* ── Form Validation ── */
  function validateField(input, errId, rule) {
    const err = document.getElementById(errId);
    const ok  = rule(input.value.trim());
    input.classList.toggle('valid', ok);
    input.classList.toggle('invalid', !ok);
    err.classList.toggle('show', !ok);
    return ok;
  }
  const rules = {
    from_name:  v => v.length >= 2,
    from_email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    subject:    v => v.length >= 3,
    message:    v => v.length >= 10,
  };
  ['from_name','from_email','subject','message'].forEach(id => {
    const errMap = { from_name:'err-name', from_email:'err-email', subject:'err-subject', message:'err-message' };
    document.getElementById(id).addEventListener('blur', () => validateField(document.getElementById(id), errMap[id], rules[id]));
    document.getElementById(id).addEventListener('input', function() {
      if (this.classList.contains('invalid')) {
        this.classList.remove('invalid');
        document.getElementById(errMap[id])?.classList.remove('show');
      }
    });
  });

  document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const fields = ['from_name','from_email','subject','message'];
    const errMap = { from_name:'err-name', from_email:'err-email', subject:'err-subject', message:'err-message' };
    const valid = fields.every(id => validateField(document.getElementById(id), errMap[id], rules[id]));
    if (!valid) { showToast('⚠ Please fix the errors above.', true); return; }
    const btn = document.getElementById('sendBtn');
    const lbl = document.getElementById('btnLabel');
    btn.disabled = true; lbl.textContent = '⏳ Sending...';
    emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      from_name:  document.getElementById('from_name').value.trim(),
      from_email: document.getElementById('from_email').value.trim(),
      subject:    document.getElementById('subject').value.trim(),
      message:    document.getElementById('message').value.trim(),
      reply_to:   document.getElementById('from_email').value.trim(),
    })
    .then(() => { showToast("✅ Message sent! I'll get back to you soon."); this.reset(); fields.forEach(id => document.getElementById(id).classList.remove('valid','invalid')); })
    .catch(() => { showToast('❌ Failed to send. Please try again.', true); })
    .finally(() => { btn.disabled = false; lbl.textContent = 'Send Message →'; });
  });

  /* ── Scroll Reveal ── */
  const revealObs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; }}), { threshold: 0.1 });
  document.querySelectorAll('.skill-card,.project-card,.contact-wrap').forEach(el => { el.style.cssText += 'opacity:0;transform:translateY(32px);transition:opacity 0.7s ease,transform 0.7s ease;'; revealObs.observe(el); });

  /* ── Theme ── */
  const themeToggle       = document.getElementById('themeToggle');
  const themeToggleMobile = document.getElementById('themeToggleMobile');
  if (localStorage.getItem('theme') === 'light') { document.body.classList.add('light'); themeToggle.textContent = '🌙 Dark'; themeToggleMobile.textContent = '🌙 Dark'; }
  function toggleTheme() {
    document.body.classList.toggle('light');
    const lbl = document.body.classList.contains('light') ? '🌙 Dark' : '☀ Light';
    themeToggle.textContent = lbl; themeToggleMobile.textContent = lbl;
    localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
  }
  themeToggle.addEventListener('click', toggleTheme);
  themeToggleMobile.addEventListener('click', toggleTheme);

  /* ── Mobile Menu ── */
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuOverlay = document.getElementById('menuOverlay');
  function closeMenu() { menuBtn.classList.remove('open'); mobileMenu.classList.remove('open'); menuOverlay.classList.remove('open'); }
  menuBtn.addEventListener('click', () => { menuBtn.classList.toggle('open'); mobileMenu.classList.toggle('open'); menuOverlay.classList.toggle('open'); });
  menuOverlay.addEventListener('click', closeMenu);
  document.getElementById('closeBtn').addEventListener('click', closeMenu);
  document.querySelectorAll('.nav-link').forEach(link => { link.addEventListener('click', () => { if (['loginLink','signupLink','signoutLink'].includes(link.id)) return; closeMenu(); }); });

  /* ── Auth ── */
  const loginModal  = document.getElementById('loginModal');
  const signupModal = document.getElementById('signupModal');
  document.getElementById('loginLink').addEventListener('click',  e => { e.preventDefault(); loginModal.classList.add('show'); });
  document.getElementById('signupLink').addEventListener('click', e => { e.preventDefault(); signupModal.classList.add('show'); });
  document.getElementById('loginModalClose').addEventListener('click',  () => loginModal.classList.remove('show'));
  document.getElementById('signupModalClose').addEventListener('click', () => signupModal.classList.remove('show'));
  loginModal.addEventListener('click',  e => { if (e.target === loginModal)  loginModal.classList.remove('show'); });
  signupModal.addEventListener('click', e => { if (e.target === signupModal) signupModal.classList.remove('show'); });
  document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass  = document.getElementById('loginPassword').value;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user  = users.find(u => u.email === email && u.password === pass);
    if (user) { localStorage.setItem('currentUser', JSON.stringify(user)); showToast('✅ Login successful!'); loginModal.classList.remove('show'); updateAuthUI(); }
    else { showToast('❌ Invalid credentials', true); }
  });
  document.getElementById('signupForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const pass  = document.getElementById('signupPassword').value;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) { showToast('❌ Email already exists', true); return; }
    users.push({ name, email, password: pass });
    localStorage.setItem('users', JSON.stringify(users));
    showToast('✅ Account created! Please login.');
    signupModal.classList.remove('show');
  });
  function signOut() { localStorage.removeItem('currentUser'); showToast('👋 Signed out successfully'); updateAuthUI(); }
  document.getElementById('signoutLink').addEventListener('click', e => { e.preventDefault(); signOut(); });
  document.getElementById('navSignoutBtn').addEventListener('click', signOut);
  function updateAuthUI() {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const sl = document.getElementById('signoutLink'), ll = document.getElementById('loginLink');
    const sig = document.getElementById('signupLink'), nb = document.getElementById('navSignoutBtn');
    if (user) { ll.style.display='none'; sig.style.display='none'; sl.style.display='block'; sl.textContent=`Sign Out (${user.name})`; nb.style.display='inline-block'; }
    else { ll.style.display='block'; sig.style.display='block'; sl.style.display='none'; nb.style.display='none'; }
  }
  updateAuthUI();

  /* ══════════════════════════════════════════════
     AI CHAT WIDGET LOGIC
  ══════════════════════════════════════════════ */
  const AI_SYSTEM = `You are Roman Ali's personal AI assistant embedded on his portfolio website.
Answer questions about Roman in a friendly, professional, and concise way.

ROMAN ALI — FULL PROFILE:
- Role: Frontend Web Developer (seeking internship)
- Location: Pakistan
- Status: Open to internship opportunities
- Website: romanportfoliowebsite.com

SKILLS:
- HTML5 (Advanced) — Semantic markup, accessibility, SEO
- CSS3/SCSS (Advanced) — Flexbox, Grid, Animations, Responsive Design
- JavaScript (Intermediate) — ES6+, DOM, Fetch API
- React.js (Intermediate) — Hooks, Components, State Management
- Dev Tools — Git, GitHub, Figma, VS Code
- Responsive Design — Mobile-first, media queries, cross-browser

PROJECTS:
1. E-Commerce Landing Page — Responsive product landing page with animations & cart UI. Stack: HTML/CSS/JS
2. Task Manager App — React drag-and-drop task manager with localStorage. Stack: React, CSS Modules
3. Weather Dashboard — Live weather app using OpenWeatherMap API with geolocation & 5-day forecast. Stack: JS, REST API

CONTACT:
- LinkedIn: linkedin.com/in/romanali
- GitHub: github.com/romanaliengineer-jpg

RULES:
- Keep answers SHORT (2-4 sentences max unless asked for detail)
- Professional but warm tone
- Only answer about Roman — politely decline unrelated questions
- Encourage visitors to reach out or hire Roman when appropriate`;

  const aiChatBtn   = document.getElementById('ai-chat-btn');
  const aiWindow    = document.getElementById('ai-chat-window');
  const aiCloseBtn  = document.getElementById('ai-close-btn');
  const aiMessages  = document.getElementById('ai-messages');
  const aiInput     = document.getElementById('ai-input');
  const aiSendBtn   = document.getElementById('ai-send-btn');
  const aiSuggestions = document.getElementById('ai-suggestions');

  let aiOpen = false, aiLoading = false;
  const aiHistory = [];

  /* Open/close */
  aiChatBtn.addEventListener('click', () => setAiOpen(true));
  aiCloseBtn.addEventListener('click', () => setAiOpen(false));
  function setAiOpen(open) {
    aiOpen = open;
    aiWindow.classList.toggle('open', open);
    if (open) { const dot = aiChatBtn.querySelector('.ai-notif-dot'); if (dot) dot.style.display = 'none'; }
  }

  /* Greeting */
  aiAppendMsg('ai', "Hi! 👋 I'm Roman's AI assistant. Ask me about his skills, projects, or how to hire him!");

  /* Suggestion chips */
  aiSuggestions.querySelectorAll('.ai-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (aiLoading) return;
      setAiOpen(true);
      aiSend(chip.textContent.trim());
    });
  });

  /* Enter to send */
  aiInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); aiHandleSend(); } });
  aiSendBtn.addEventListener('click', aiHandleSend);

  /* Auto-resize */
  aiInput.addEventListener('input', () => { aiInput.style.height = 'auto'; aiInput.style.height = Math.min(aiInput.scrollHeight, 80) + 'px'; });

  function aiHandleSend() {
    const text = aiInput.value.trim();
    if (!text || aiLoading) return;
    aiInput.value = ''; aiInput.style.height = 'auto';
    aiSend(text);
  }

  async function aiSend(text) {
    aiLoading = true;
    aiSendBtn.disabled = true;
    aiSuggestions.style.display = 'none';
    aiAppendMsg('user', text);
    aiHistory.push({ role: 'user', content: text });
    const typingId = aiAppendTyping();
    aiScrollBottom();

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions.memo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1000,
          system: AI_SYSTEM,
          messages: aiHistory,
        })
      });
      const data = await res.json();
      aiRemoveTyping(typingId);
      const reply = data?.content?.[0]?.text || "Sorry, I couldn't respond right now. Please try again!";
      aiAppendMsg('ai', reply);
      aiHistory.push({ role: 'assistant', content: reply });
    } catch {
      aiRemoveTyping(typingId);
      aiAppendMsg('ai', "Connection issue! Please check your internet and try again. 🔌");
    }

    aiLoading = false;
    aiSendBtn.disabled = false;
    aiScrollBottom();
  }

  function aiAppendMsg(role, text) {
    const div = document.createElement('div');
    div.className = `ai-msg ${role}`;
    div.innerHTML = `
      <div class="ai-msg-icon">${role === 'ai' ? '🤖' : '👤'}</div>
      <div class="ai-msg-bubble">${aiEscape(text)}</div>`;
    aiMessages.appendChild(div);
    aiScrollBottom();
  }

  function aiAppendTyping() {
    const id = 'aiTyping-' + Date.now();
    const div = document.createElement('div');
    div.className = 'ai-msg ai'; div.id = id;
    div.innerHTML = `<div class="ai-msg-icon">🤖</div><div class="ai-msg-bubble"><div class="ai-typing"><span></span><span></span><span></span></div></div>`;
    aiMessages.appendChild(div);
    aiScrollBottom();
    return id;
  }

  function aiRemoveTyping(id) { const el = document.getElementById(id); if (el) el.remove(); }
  function aiScrollBottom() { aiMessages.scrollTop = aiMessages.scrollHeight; }
  function aiEscape(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/\n/g,'<br>');
  }