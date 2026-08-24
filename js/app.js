/* ==========================================================================
   TermRunway — Student Budget Calculator
   app.js — all interactivity: calculations, charts, storage, export, theme.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Constants & storage keys                                           */
  /* ------------------------------------------------------------------ */
  const STORAGE_KEY = 'termrunway_budget_v1';
  const THEME_KEY = 'termrunway_theme_v1';

  const INCOME_FIELDS = ['scholarship', 'partTime', 'parentsSupport', 'studentLoan', 'otherIncome'];
  const EXPENSE_FIELDS = ['rent', 'food', 'transport', 'utilities', 'entertainment', 'shopping', 'education', 'medical', 'otherExpenses'];
  const NEEDS_FIELDS = ['rent', 'food', 'transport', 'utilities', 'medical'];
  const WANTS_FIELDS = ['entertainment', 'shopping', 'education', 'otherExpenses'];

  const EXPENSE_LABELS = {
    rent: 'Rent', food: 'Food', transport: 'Transport', utilities: 'Utilities',
    entertainment: 'Entertainment', shopping: 'Shopping', education: 'Education',
    medical: 'Medical', otherExpenses: 'Other'
  };

  const PIE_COLORS = ['#4F46E5', '#7C3AED', '#22C55E', '#F59E0B', '#EF4444', '#0EA5E9', '#EC4899', '#14B8A6', '#A855F7'];

  /* ------------------------------------------------------------------ */
  /* DOM helpers                                                        */
  /* ------------------------------------------------------------------ */
  const $ = (id) => document.getElementById(id);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const round = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

  function formatNumber(n) {
    if (!isFinite(n)) return '0';
    return Math.round(n).toLocaleString('en-IN');
  }

  /* ------------------------------------------------------------------ */
  /* State                                                              */
  /* ------------------------------------------------------------------ */
  let state = getDefaultState();
  let lastResult = null;

  function getDefaultState() {
    const state = { currency: '₹', timeframe: 'monthly' };
    [...INCOME_FIELDS, ...EXPENSE_FIELDS].forEach((f) => (state[f] = 0));
    state.currentSavings = 0;
    state.savingsGoal = 0;
    state.semesterLength = 120;
    state.remainingDays = 90;
    return state;
  }

  /* ------------------------------------------------------------------ */
  /* Theme                                                              */
  /* ------------------------------------------------------------------ */
  function initTheme() {
    const saved = safeGet(THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    applyTheme(theme, false);

    $('themeToggle').addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next, true);
    });
  }

  function applyTheme(theme, persist) {
    document.documentElement.setAttribute('data-theme', theme);
    $('themeToggle').setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    $('themeToggle').setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    if (persist) safeSet(THEME_KEY, theme);
  }

  /* ------------------------------------------------------------------ */
  /* Safe localStorage wrappers (private browsing / quota can throw)    */
  /* ------------------------------------------------------------------ */
  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); return true; } catch (e) { return false; }
  }

  /* ------------------------------------------------------------------ */
  /* Navbar: scroll shadow + mobile menu                                */
  /* ------------------------------------------------------------------ */
  function initNavbar() {
    const navbar = $('navbar');
    const toggle = $('navToggle');

    window.addEventListener('scroll', () => {
      navbar.classList.toggle('is-scrolled', window.scrollY > 8);
    }, { passive: true });

    toggle.addEventListener('click', () => {
      const isOpen = navbar.classList.toggle('is-menu-open');
      toggle.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    document.querySelectorAll('.nav-links a').forEach((a) => {
      a.addEventListener('click', () => {
        navbar.classList.remove('is-menu-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Reveal-on-scroll                                                   */
  /* ------------------------------------------------------------------ */
  function initReveal() {
    const targets = document.querySelectorAll('.stat-card, .chart-card, .rule-card, .feature-card, .savings-card, .recommend-card, .export-card, .budget-card');
    targets.forEach((el) => el.classList.add('reveal'));

    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------ */
  /* Button ripple                                                      */
  /* ------------------------------------------------------------------ */
  function initRipple() {
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        btn.classList.remove('is-rippling');
        void btn.offsetWidth; // restart animation
        btn.classList.add('is-rippling');
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Animated counters                                                  */
  /* ------------------------------------------------------------------ */
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCounter(el, from, to, opts) {
    if (!el) return;
    opts = opts || {};
    const duration = reducedMotion ? 1 : (opts.duration || 900);
    const decimals = opts.decimals || 0;
    const suffix = opts.suffix || '';
    const startTime = performance.now();
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    function tick(now) {
      const elapsed = now - startTime;
      const t = clamp(elapsed / duration, 0, 1);
      const eased = easeOutCubic(t);
      const value = from + (to - from) * eased;
      el.textContent = formatCounterValue(value, decimals) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = formatCounterValue(to, decimals) + suffix;
    }
    requestAnimationFrame(tick);
  }

  function formatCounterValue(value, decimals) {
    if (decimals > 0) return value.toFixed(decimals);
    return formatNumber(value);
  }

  /* ------------------------------------------------------------------ */
  /* Form: build state from inputs                                      */
  /* ------------------------------------------------------------------ */
  function readFormState() {
    const s = {};
    [...INCOME_FIELDS, ...EXPENSE_FIELDS, 'currentSavings', 'savingsGoal'].forEach((f) => {
      const el = $(f);
      const val = parseFloat(el.value);
      s[f] = isFinite(val) && val >= 0 ? val : 0;
    });
    const semLen = parseInt($('semesterLength').value, 10);
    const remDays = parseInt($('remainingDays').value, 10);
    s.semesterLength = isFinite(semLen) && semLen > 0 ? semLen : 120;
    s.remainingDays = isFinite(remDays) && remDays >= 0 ? clamp(remDays, 0, s.semesterLength) : Math.min(90, s.semesterLength);
    s.currency = $('currency').value || '₹';
    s.timeframe = $('timeframe').value || 'monthly';
    return s;
  }

  function writeFormState(s) {
    [...INCOME_FIELDS, ...EXPENSE_FIELDS, 'currentSavings', 'savingsGoal', 'semesterLength', 'remainingDays'].forEach((f) => {
      const el = $(f);
      if (el && s[f] !== undefined && s[f] !== 0) el.value = s[f];
    });
    if (s.currency) $('currency').value = s.currency;
    if (s.timeframe) $('timeframe').value = s.timeframe;
    updateCurrencyPrefixes(s.currency || '₹');
  }

  function updateCurrencyPrefixes(symbol) {
    document.querySelectorAll('.input-prefix').forEach((el) => (el.textContent = symbol));
    $('dailyCurrency').textContent = symbol;
    $('savingsCurrentCurrency').textContent = symbol;
    $('savingsTargetCurrency').textContent = symbol;
    $('savingsRemainingCurrency').textContent = symbol;
  }

  /* ------------------------------------------------------------------ */
  /* Core calculation engine                                            */
  /* ------------------------------------------------------------------ */
  function calculate(s) {
    const totalIncome = INCOME_FIELDS.reduce((sum, f) => sum + s[f], 0);
    const totalExpenses = EXPENSE_FIELDS.reduce((sum, f) => sum + s[f], 0);
    
    // Grab raw rule totals before normalization
    const needsTotalRaw = NEEDS_FIELDS.reduce((sum, f) => sum + s[f], 0);
    const wantsTotalRaw = WANTS_FIELDS.reduce((sum, f) => sum + s[f], 0);

    // Normalize to monthly figures if the user entered semester totals
    const isSemester = s.timeframe === 'semester';
    const monthsInSemester = Math.max(s.semesterLength / 30, 0.1);
    
    const monthlyIncome = isSemester ? totalIncome / monthsInSemester : totalIncome;
    const monthlyExpenses = isSemester ? totalExpenses / monthsInSemester : totalExpenses;
    
    // Fix: Needs and Wants must also be scaled down if timeframe is semester
    const needsTotal = isSemester ? needsTotalRaw / monthsInSemester : needsTotalRaw;
    const wantsTotal = isSemester ? wantsTotalRaw / monthsInSemester : wantsTotalRaw;

    const remainingBalance = monthlyIncome - monthlyExpenses;
    
    // Fix: Daily limit should be calculated over a standard 30-day month, 
    // since remainingBalance is a monthly figure.
    const dailyLimit = remainingBalance > 0 ? remainingBalance / 30 : 0;

    // Savings goal progress
    const savingsGoal = s.savingsGoal;
    const currentSavings = s.currentSavings;
    const savingsRemaining = Math.max(savingsGoal - currentSavings, 0);
    const savingsPercent = savingsGoal > 0 ? clamp((currentSavings / savingsGoal) * 100, 0, 100) : 0;

    // Fix: Semester runway calculates how many days current savings will last based on monthly deficit.
    let runwayDays;
    if (remainingBalance >= 0) {
      runwayDays = 9999; // Generating a surplus, funds won't run out
    } else {
      const dailyDeficit = Math.abs(remainingBalance) / 30;
      runwayDays = currentSavings / dailyDeficit;
    }
    runwayDays = clamp(runwayDays, 0, 9999);
    const runwayMonths = runwayDays / 30;

    const semesterElapsed = clamp(s.semesterLength - s.remainingDays, 0, s.semesterLength);
    const semesterCompletionPct = s.semesterLength > 0 ? clamp((semesterElapsed / s.semesterLength) * 100, 0, 100) : 0;

    // 50/30/20 rule — percentages of income
    const incomeForPct = monthlyIncome > 0 ? monthlyIncome : (monthlyExpenses > 0 ? monthlyExpenses : 1);
    const needsPct = clamp((needsTotal / incomeForPct) * 100, 0, 999);
    const wantsPct = clamp((wantsTotal / incomeForPct) * 100, 0, 999);
    const savingsRuleAmount = Math.max(remainingBalance, 0);
    const savingsRulePct = clamp((savingsRuleAmount / incomeForPct) * 100, 0, 999);

    return {
      totalIncome: monthlyIncome,
      totalExpenses: monthlyExpenses,
      remainingBalance,
      dailyLimit,
      currentSavings,
      savingsGoal,
      savingsRemaining,
      savingsPercent,
      runwayDays,
      runwayMonths,
      semesterCompletionPct,
      needsTotal, wantsTotal,
      needsPct, wantsPct, savingsRulePct,
      currency: s.currency,
      remainingDays: s.remainingDays,
      semesterLength: s.semesterLength,
      isOverspending: remainingBalance < 0,
      expenseBreakdown: EXPENSE_FIELDS.map((f) => ({ key: f, label: EXPENSE_LABELS[f], value: s[f] / (isSemester ? monthsInSemester : 1) })).filter((e) => e.value > 0)
    };
  }

  /* ------------------------------------------------------------------ */
  /* Render: dashboard summary cards                                    */
  /* ------------------------------------------------------------------ */
  function renderSummary(r) {
    const maxScale = Math.max(r.totalIncome, r.totalExpenses, 1) * 1.15;

    animateCounter($('statIncome'), 0, r.totalIncome);
    $('barIncome').style.width = clamp((r.totalIncome / maxScale) * 100, 0, 100) + '%';

    animateCounter($('statExpenses'), 0, r.totalExpenses);
    $('barExpenses').style.width = clamp((r.totalExpenses / maxScale) * 100, 0, 100) + '%';

    animateCounter($('statBalance'), 0, Math.abs(r.remainingBalance));
    $('barBalance').style.width = clamp((Math.abs(r.remainingBalance) / maxScale) * 100, 0, 100) + '%';
    $('barBalance').className = 'mini-bar__fill ' + (r.remainingBalance >= 0 ? 'mini-bar__fill--success' : 'mini-bar__fill--danger');
    $('noteBalance').textContent = r.remainingBalance >= 0 ? 'Income minus expenses' : 'You are over budget this month';

    animateCounter($('statDaily'), 0, Math.max(r.dailyLimit, 0));
    $('barDaily').style.width = clamp((r.dailyLimit / (maxScale / 30)) * 100, 0, 100) + '%';

    animateCounter($('statSavings'), 0, r.currentSavings);
    $('barSavings').style.width = clamp(r.savingsPercent, 0, 100) + '%';
    $('noteSavings').textContent = r.savingsGoal > 0 ? `${Math.round(r.savingsPercent)}% toward your goal` : 'Set a savings goal below';

    const runwayVal = r.runwayDays >= 9999 ? 999 : Math.round(r.runwayDays);
    animateCounter($('statRunway'), 0, runwayVal);
    $('runwayUnit').textContent = r.runwayDays >= 9999 ? 'days+' : 'days';
    $('barRunway').style.width = clamp((r.runwayDays / (r.semesterLength || 120)) * 100, 0, 100) + '%';

    document.querySelectorAll('.currency-symbol').forEach((el) => (el.textContent = r.currency));
  }

  /* ------------------------------------------------------------------ */
  /* Render: 50/30/20 rule cards                                        */
  /* ------------------------------------------------------------------ */
  function renderRule(r) {
    renderRuleCard('needs', r.needsPct, 50, {
      good: 'Right on target — needs are well covered.',
      warn: 'Needs are a little high — worth reviewing rent or utilities.',
      bad: 'Needs are eating most of your income.'
    });
    renderRuleCard('wants', r.wantsPct, 30, {
      good: 'Healthy spending on wants.',
      warn: 'A bit above target — entertainment or shopping may be creeping up.',
      bad: 'Too much going to wants this month.'
    });
    renderRuleCard('savings', r.savingsRulePct, 20, {
      good: 'Great saving habit — keep it up.',
      warn: 'Some savings, but below the 20% target.',
      bad: 'Little to nothing is being saved right now.'
    });
  }

  function renderRuleCard(key, pct, target, messages) {
    const pctEl = $(key + 'Pct');
    const barEl = $(key + 'Bar');
    const statusEl = $(key + 'Status');
    animateCounter(pctEl, 0, Math.min(round(pct), 999), { decimals: pct < 10 && pct > 0 ? 1 : 0 });
    barEl.style.width = clamp(pct, 0, 100) + '%';

    const diff = pct - target;
    let status, label;
    if (key === 'savings') {
      if (pct >= target) { status = 'good'; label = 'Excellent — ' + messages.good; }
      else if (pct >= target * 0.5) { status = 'warn'; label = messages.warn; }
      else { status = 'bad'; label = messages.bad; }
    } else {
      if (diff <= 2) { status = 'good'; label = 'On track — ' + messages.good; }
      else if (diff <= 10) { status = 'warn'; label = messages.warn; }
      else { status = 'bad'; label = messages.bad; }
    }
    statusEl.textContent = label;
    statusEl.className = 'rule-card__status status--' + status;
  }

  /* ------------------------------------------------------------------ */
  /* Render: daily spending card                                        */
  /* ------------------------------------------------------------------ */
  function renderDaily(r) {
    animateCounter($('dailyAmount'), 0, Math.max(Math.round(r.dailyLimit), 0));
    const card = $('dailyCard');
    card.classList.toggle('is-overspending', r.isOverspending);

    if (r.isOverspending) {
      $('dailyStatus').textContent = `Your expenses exceed income by ${r.currency}${formatNumber(Math.abs(r.remainingBalance))} this month. Consider trimming a category below.`;
    } else if (r.dailyLimit === 0) {
      $('dailyStatus').textContent = 'Fill in the budget form to see your daily limit.';
    } else {
      $('dailyStatus').textContent = `You can safely spend up to ${r.currency}${formatNumber(r.dailyLimit)} per day for the rest of this month.`;
    }

    // Fix: Scale the ring appropriately using semesterLength
    drawDailyRing(clamp(r.remainingDays / (r.semesterLength || 1), 0, 1));
    $('dailyRingLabel').textContent = Math.min(r.remainingDays, 999);
  }

  /* ------------------------------------------------------------------ */
  /* Render: semester runway card                                       */
  /* ------------------------------------------------------------------ */
  function renderRunway(r) {
    const monthsLeft = r.runwayDays >= 9999 ? '99+' : (Math.round(r.runwayMonths * 10) / 10).toFixed(1);
    $('runwayMonths').textContent = monthsLeft;
    $('semesterCompletion').textContent = Math.round(r.semesterCompletionPct) + '%';
    $('remainingBudgetVal').textContent = r.currency + formatNumber(Math.max(r.remainingBalance, 0));

    const trackPct = clamp((r.runwayDays / (r.semesterLength || 120)) * 100, 2, 100);
    $('runwayTrackFill').style.width = trackPct + '%';
    $('runwayPlane').style.left = trackPct + '%';

    if (r.semesterLength === 0) {
      $('runwayNote').textContent = 'Enter your semester length and expenses to calculate.';
    } else if (r.runwayDays >= r.semesterLength) {
      $('runwayNote').textContent = 'Your budget comfortably covers the rest of the semester.';
    } else {
      const shortfallDays = Math.round(r.semesterLength - r.runwayDays);
      $('runwayNote').textContent = `At this rate, your funds may run out about ${shortfallDays} day${shortfallDays === 1 ? '' : 's'} before the semester ends.`;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Render: savings goal tracker                                       */
  /* ------------------------------------------------------------------ */
  function renderSavingsGoal(r) {
    animateCounter($('savingsCurrentVal'), 0, r.currentSavings);
    animateCounter($('savingsTargetVal'), 0, r.savingsGoal);
    animateCounter($('savingsRemainingVal'), 0, r.savingsRemaining);
    animateCounter($('savingsCompletionVal'), 0, Math.round(r.savingsPercent));
    animateCounter($('savingsGoalPercent'), 0, Math.round(r.savingsPercent), { suffix: '%' });
    drawRingChart('savingsGoalRing', r.savingsPercent / 100, '#7C3AED');
  }

  /* ------------------------------------------------------------------ */
  /* Render: smart recommendations                                      */
  /* ------------------------------------------------------------------ */
  function renderRecommendations(r) {
    const grid = $('recommendGrid');
    const recs = buildRecommendations(r);
    grid.innerHTML = '';

    if (recs.length === 0) {
      grid.innerHTML = `<li class="recommend-card recommend-card--placeholder">
        <span class="recommend-card__icon" aria-hidden="true">${iconInfo()}</span>
        <p>Fill in the budget form and hit <strong>Calculate</strong> to see personalized recommendations here.</p>
      </li>`;
      return;
    }

    recs.forEach((rec) => {
      const li = document.createElement('li');
      li.className = 'recommend-card reveal recommend-card--' + rec.tone;
      li.innerHTML = `<span class="recommend-card__icon" aria-hidden="true">${rec.icon}</span><p>${rec.text}</p>`;
      grid.appendChild(li);
    });

    requestAnimationFrame(() => {
      grid.querySelectorAll('.reveal').forEach((el, i) => {
        setTimeout(() => el.classList.add('is-visible'), i * 60);
      });
    });
  }

  function buildRecommendations(r) {
    const recs = [];
    const hasData = r.totalIncome > 0 || r.totalExpenses > 0;
    if (!hasData) return recs;

    if (r.isOverspending) {
      recs.push({ tone: 'danger', icon: iconAlert(), text: `Expenses exceed income by <strong>${r.currency}${formatNumber(Math.abs(r.remainingBalance))}</strong>. Review your biggest categories first.` });
    } else if (r.dailyLimit > 0 && r.dailyLimit < 100) {
      recs.push({ tone: 'warning', icon: iconAlert(), text: `Your daily limit is tight at <strong>${r.currency}${formatNumber(r.dailyLimit)}/day</strong> — small purchases will add up fast.` });
    } else if (r.dailyLimit >= 100) {
      recs.push({ tone: 'success', icon: iconCheck(), text: `Semester budget looks healthy — <strong>${r.currency}${formatNumber(r.dailyLimit)}/day</strong> to work with.` });
    }

    const income = r.totalIncome > 0 ? r.totalIncome : r.totalExpenses;
    const foodShare = income > 0 ? (r.expenseBreakdown.find((e) => e.key === 'food')?.value || 0) / income : 0;
    const entShare = income > 0 ? (r.expenseBreakdown.find((e) => e.key === 'entertainment')?.value || 0) / income : 0;
    const shopShare = income > 0 ? (r.expenseBreakdown.find((e) => e.key === 'shopping')?.value || 0) / income : 0;

    if (foodShare > 0.25) {
      recs.push({ tone: 'warning', icon: iconFood(), text: 'Food spending is a large share of your budget — batch cooking or a meal plan could help.' });
    }
    if (entShare > 0.12) {
      recs.push({ tone: 'warning', icon: iconAlert(), text: 'Entertainment is above average this month — consider a lighter week.' });
    }
    if (shopShare > 0.15) {
      recs.push({ tone: 'warning', icon: iconBag(), text: 'Shopping is taking a notable slice of income — a short cooling-off period before purchases can help.' });
    }

    if (r.savingsGoal > 0) {
      if (r.savingsPercent >= 75) {
        recs.push({ tone: 'success', icon: iconCheck(), text: `Excellent savings habit — you're <strong>${Math.round(r.savingsPercent)}%</strong> toward your goal.` });
      } else if (r.savingsPercent >= 25) {
        recs.push({ tone: 'success', icon: iconPiggy(), text: `Your emergency fund is growing — <strong>${Math.round(r.savingsPercent)}%</strong> of the way to your goal.` });
      } else {
        recs.push({ tone: 'info', icon: iconPiggy(), text: 'Consider automating a small transfer to savings right after each deposit.' });
      }
    }

    if (r.runwayDays < r.semesterLength && r.semesterLength > 0 && !r.isOverspending) {
      recs.push({ tone: 'warning', icon: iconAlert(), text: 'At the current pace, funds may not stretch to the end of the semester — trimming a category now helps.' });
    } else if (r.runwayDays >= r.semesterLength && r.semesterLength > 0) {
      recs.push({ tone: 'success', icon: iconCheck(), text: 'Semester budget looks healthy at your current spending rate.' });
    }

    if (r.needsPct <= 55 && r.wantsPct <= 32 && r.savingsRulePct >= 15) {
      recs.push({ tone: 'success', icon: iconCheck(), text: 'Your spending closely matches the healthy 50/30/20 split.' });
    }

    return recs.slice(0, 6);
  }

  function iconWrap(path) { return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`; }
  const iconCheck = () => iconWrap('<circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/>');
  const iconAlert = () => iconWrap('<path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="9"/>');
  const iconInfo = () => iconWrap('<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>');
  const iconFood = () => iconWrap('<path d="M7 2v20M11 2v7a3 3 0 0 1-6 0V2M17 2c-2 2-2 6 0 8s2 6 0 8"/>');
  const iconBag = () => iconWrap('<path d="M6 2l1.5 4h9L18 2"/><rect x="3" y="6" width="18" height="16" rx="2"/><path d="M9 11a3 3 0 0 0 6 0"/>');
  const iconPiggy = () => iconWrap('<path d="M19 5c-1.5-1.5-4-2-6-1L5 12l3 3-8 4 4-8 3 3 8-8c1-2 .5-4.5-1-6z"/>');

  /* ------------------------------------------------------------------ */
  /* Canvas: Bar chart — Income vs Expenses                             */
  /* ------------------------------------------------------------------ */
  function drawBarChart(income, expenses, currency) {
    const canvas = $('chartBar');
    const ctx = canvas.getContext('2d');
    
    // Fix: Cancel overlapping animations
    if (canvas.animId) cancelAnimationFrame(canvas.animId);

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || 480;
    const cssH = 260;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.height = cssH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.06)';
    const textColor = isDark ? '#9CA3AF' : '#6B7280';

    const max = Math.max(income, expenses, 1) * 1.2;
    const padTop = 24, padBottom = 40, padLeft = 10, padRight = 10;
    const chartH = cssH - padTop - padBottom;

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padTop + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(cssW - padRight, y);
      ctx.stroke();
    }

    const barW = 90;
    const gap = 60;
    const totalW = barW * 2 + gap;
    const startX = (cssW - totalW) / 2;

    const bars = [
      { label: 'Income', value: income, colorA: '#22C55E', colorB: '#4ADE80', x: startX },
      { label: 'Expenses', value: expenses, colorA: '#EF4444', colorB: '#F87171', x: startX + barW + gap }
    ];

    const duration = reducedMotion ? 1 : 900;
    const start = performance.now();

    function frame(now) {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.strokeStyle = gridColor;
      for (let i = 0; i <= 4; i++) {
        const y = padTop + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(cssW - padRight, y);
        ctx.stroke();
      }

      bars.forEach((bar) => {
        const h = (bar.value / max) * chartH * eased;
        const y = padTop + chartH - h;
        const grad = ctx.createLinearGradient(0, y, 0, padTop + chartH);
        grad.addColorStop(0, bar.colorB);
        grad.addColorStop(1, bar.colorA);
        ctx.fillStyle = grad;
        roundRectPath(ctx, bar.x, y, barW, h, 10);
        ctx.fill();

        ctx.fillStyle = textColor;
        ctx.font = '600 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(bar.label, bar.x + barW / 2, padTop + chartH + 22);

        if (eased > 0.5) {
          ctx.fillStyle = isDark ? '#F3F4F6' : '#111827';
          ctx.font = '700 13px Poppins, sans-serif';
          ctx.globalAlpha = clamp((eased - 0.5) * 2, 0, 1);
          ctx.fillText(currency + formatNumber(bar.value), bar.x + barW / 2, y - 10);
          ctx.globalAlpha = 1;
        }
      });

      if (t < 1) {
        canvas.animId = requestAnimationFrame(frame);
      }
    }
    canvas.animId = requestAnimationFrame(frame);
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    if (h < r) r = h / 2;
    if (h <= 0) return;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
  }

  /* ------------------------------------------------------------------ */
  /* Canvas: Pie chart — Expense breakdown                              */
  /* ------------------------------------------------------------------ */
  function drawPieChart(breakdown) {
    const canvas = $('chartPie');
    const ctx = canvas.getContext('2d');
    
    // Fix: Cancel overlapping animations
    if (canvas.animId) cancelAnimationFrame(canvas.animId);

    const dpr = window.devicePixelRatio || 1;
    const size = Math.min(canvas.clientWidth || 200, 200);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const legend = $('pieLegend');
    legend.innerHTML = '';

    const total = breakdown.reduce((s, e) => s + e.value, 0);
    if (total <= 0) {
      ctx.strokeStyle = 'rgba(107,114,128,0.25)';
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 12, 0, Math.PI * 2);
      ctx.stroke();
      const li = document.createElement('li');
      li.textContent = 'Add expenses to see the breakdown';
      legend.appendChild(li);
      return;
    }

    const sorted = [...breakdown].sort((a, b) => b.value - a.value);
    const cx = size / 2, cy = size / 2, radius = size / 2 - 8;
    const duration = reducedMotion ? 1 : 900;
    const start = performance.now();

    function frame(now) {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      ctx.clearRect(0, 0, size, size);
      let angle = -Math.PI / 2;
      sorted.forEach((slice, i) => {
        const sliceAngle = (slice.value / total) * Math.PI * 2 * eased;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, angle, angle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = PIE_COLORS[i % PIE_COLORS.length];
        ctx.fill();
        angle += sliceAngle;
      });

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.56, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#131826' : '#FFFFFF';
      ctx.fill();

      if (t < 1) {
        canvas.animId = requestAnimationFrame(frame);
      }
    }
    canvas.animId = requestAnimationFrame(frame);

    sorted.forEach((slice, i) => {
      const li = document.createElement('li');
      const pct = Math.round((slice.value / total) * 100);
      li.innerHTML = `<span class="swatch" style="background:${PIE_COLORS[i % PIE_COLORS.length]}"></span>${slice.label} · ${pct}%`;
      legend.appendChild(li);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Canvas: generic ring chart (savings progress rings)                */
  /* ------------------------------------------------------------------ */
  function drawRingChart(canvasId, fraction, color) {
    const canvas = $(canvasId);
    const ctx = canvas.getContext('2d');
    
    // Fix: Cancel overlapping animations
    if (canvas.animId) cancelAnimationFrame(canvas.animId);

    const dpr = window.devicePixelRatio || 1;
    const size = canvas.getAttribute('width') ? parseInt(canvas.getAttribute('width'), 10) : 220;
    const cssSize = Math.min(canvas.clientWidth || size, size);
    canvas.width = cssSize * dpr;
    canvas.height = cssSize * dpr;
    canvas.style.width = cssSize + 'px';
    canvas.style.height = cssSize + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const trackColor = isDark ? '#232B3E' : '#E7EAF3';
    const cx = cssSize / 2, cy = cssSize / 2, radius = cssSize / 2 - 14;
    const lineWidth = 14;
    const target = clamp(fraction, 0, 1);
    const duration = reducedMotion ? 1 : 1000;
    const start = performance.now();

    function frame(now) {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = target * eased;
      ctx.clearRect(0, 0, cssSize, cssSize);

      ctx.strokeStyle = trackColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, 0, cssSize, cssSize);
      grad.addColorStop(0, '#4F46E5');
      grad.addColorStop(1, color || '#7C3AED');
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * current);
      ctx.stroke();

      if (t < 1) {
        canvas.animId = requestAnimationFrame(frame);
      }
    }
    canvas.animId = requestAnimationFrame(frame);
  }

  function drawDailyRing(fraction) {
    const canvas = $('dailyRing');
    const ctx = canvas.getContext('2d');
    
    // Fix: Cancel overlapping animations
    if (canvas.animId) cancelAnimationFrame(canvas.animId);

    const dpr = window.devicePixelRatio || 1;
    const size = 180;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cx = size / 2, cy = size / 2, radius = size / 2 - 12;
    const lineWidth = 12;
    const target = clamp(fraction, 0, 1);
    const duration = reducedMotion ? 1 : 1000;
    const start = performance.now();

    function frame(now) {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = target * eased;
      ctx.clearRect(0, 0, size, size);

      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * current);
      ctx.stroke();

      if (t < 1) {
        canvas.animId = requestAnimationFrame(frame);
      }
    }
    canvas.animId = requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------------ */
  /* Master render: calls every render function from one result object  */
  /* ------------------------------------------------------------------ */
  function renderAll(r) {
    renderSummary(r);
    renderRule(r);
    renderDaily(r);
    renderRunway(r);
    renderSavingsGoal(r);
    renderRecommendations(r);
    drawBarChart(r.totalIncome, r.totalExpenses, r.currency);
    drawPieChart(r.expenseBreakdown);
    drawRingChart('chartSavingsRing', r.savingsPercent / 100, '#7C3AED');
    $('ringPercent').textContent = Math.round(r.savingsPercent) + '%';
    lastResult = r;
  }

  /* ------------------------------------------------------------------ */
  /* Form events: calculate / save / reset                              */
  /* ------------------------------------------------------------------ */
  function initForm() {
    const form = $('budgetForm');
    
    // Fix: Trigger instant update on any keystroke or form change
    form.addEventListener('input', () => {
      state = readFormState();
      const result = calculate(state);
      renderAll(result);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      state = readFormState();
      const result = calculate(state);
      renderAll(result);
      flashStatus('Calculated');
    });

    $('saveBtn').addEventListener('click', () => {
      state = readFormState();
      const ok = safeSet(STORAGE_KEY, JSON.stringify(state));
      if (ok) {
        showToast('Budget saved to this device');
        flashStatus('Saved');
      } else {
        showToast('Could not save — storage may be full or disabled');
      }
    });

    $('resetBtn').addEventListener('click', () => {
      if (!confirm('Reset all fields? This clears the form but keeps any previously saved data until you save again.')) return;
      form.reset();
      state = getDefaultState();
      updateCurrencyPrefixes('₹');
      const result = calculate(state);
      renderAll(result);
      showToast('Form reset');
    });

    $('currency').addEventListener('change', (e) => updateCurrencyPrefixes(e.target.value));

    form.querySelectorAll('input[type="number"]').forEach((input) => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          form.requestSubmit();
        }
      });
    });
  }

  function flashStatus(msg) {
    const el = $('formStatus');
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(flashStatus._t);
    flashStatus._t = setTimeout(() => el.classList.remove('is-visible'), 2200);
  }

  /* ------------------------------------------------------------------ */
  /* Toast                                                              */
  /* ------------------------------------------------------------------ */
  function showToast(msg) {
    const toast = $('toast');
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  /* ------------------------------------------------------------------ */
  /* Persisted data: load on startup                                    */
  /* ------------------------------------------------------------------ */
  function loadSavedData() {
    const raw = safeGet(STORAGE_KEY);
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw);
      state = Object.assign(getDefaultState(), parsed);
      writeFormState(state);
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Export: JSON, CSV, Print                                           */
  /* ------------------------------------------------------------------ */
  function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function initExport() {
    $('exportJson').addEventListener('click', () => {
      const data = { budget: readFormState(), calculatedAt: new Date().toISOString(), result: lastResult };
      downloadFile('termrunway-budget.json', JSON.stringify(data, null, 2), 'application/json');
      showToast('JSON file downloaded');
    });

    $('exportCsv').addEventListener('click', () => {
      const s = readFormState();
      const rows = [['Category', 'Type', 'Amount']];
      INCOME_FIELDS.forEach((f) => rows.push([labelize(f), 'Income', s[f]]));
      EXPENSE_FIELDS.forEach((f) => rows.push([EXPENSE_LABELS[f], 'Expense', s[f]]));
      rows.push(['Current Savings', 'Savings', s.currentSavings]);
      rows.push(['Savings Goal', 'Savings', s.savingsGoal]);
      const csv = rows.map((row) => row.map(csvEscape).join(',')).join('\n');
      downloadFile('termrunway-budget.csv', csv, 'text/csv');
      showToast('CSV file downloaded');
    });

    $('exportPdf').addEventListener('click', () => {
      window.print();
    });
  }

  function csvEscape(val) {
    const s = String(val);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function labelize(field) {
    return field.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
  }

  /* ------------------------------------------------------------------ */
  /* Privacy link — small inline notice, no navigation needed           */
  /* ------------------------------------------------------------------ */
  function initFooterLinks() {
    $('privacyLink').addEventListener('click', (e) => {
      e.preventDefault();
      showToast('All data stays in your browser — nothing is sent anywhere');
    });
  }

  /* ------------------------------------------------------------------ */
  /* Resize: redraw canvases responsively (debounced)                   */
  /* ------------------------------------------------------------------ */
  function initResize() {
    let timer;
    window.addEventListener('resize', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (lastResult) renderAll(lastResult);
      }, 220);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Init                                                               */
  /* ------------------------------------------------------------------ */
  function init() {
    initTheme();
    initNavbar();
    initRipple();
    initForm();
    initExport();
    initFooterLinks();
    initReveal();
    initResize();

    const hadSavedData = loadSavedData();
    state = readFormState();
    const result = calculate(state);
    renderAll(result);

    if (hadSavedData) flashStatus('Loaded saved budget');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();