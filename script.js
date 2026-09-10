const $ = (id) => document.getElementById(id);

const welcomeModal = $('welcome-modal');
const userNameInput = $('user-name');
const startBtn = $('start-btn');
const cancelName = $('cancel-name');
const greeting = $('greeting');
const editNameBtn = $('edit-name');
const expenseForm = $('expense-form');
const expenseName = $('name');
const expenseAmount = $('amount');
const transactionType = $('transaction-type');
const expenseCategory = $('category');
const transactionDate = $('transaction-date');
const expenseList = $('expense-list');
const emptyState = $('empty-state');
const totalDisplay = $('expense-total');
const incomeDisplay = $('income-total');
const balanceDisplay = $('net-balance');
const averageDisplay = $('average-expense');
const transactionCount = $('transaction-count');
const goalInput = $('goal-input');
const progressBar = $('progress-bar');
const goalText = $('goal-text');
const clearBtn = $('clear-btn');
const themeSelect = $('theme-select');
const insightTitle = $('insight-title');
const insightText = $('insight');
const topCategoryDisplay = $('top-category');
const topShareDisplay = $('top-share');
const highestExpenseDisplay = $('highest-expense');
const anomalyCountDisplay = $('anomaly-count');
const filterType = $('filter-type');
const filterCategory = $('filter-category');
const filterSummary = $('filter-summary');

const categories = ['Food', 'Travel', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Education', 'Others'];
const storageKey = 'finsightTransactions';
let transactions = [];
let goal = 0;
let expenseChart;
let trendChart;

const currency = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().slice(0, 10);

function timeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function showModal() { welcomeModal.style.display = 'flex'; }
function hideModal() { welcomeModal.style.display = 'none'; }

function saveAll() {
  localStorage.setItem(storageKey, JSON.stringify(transactions));
  localStorage.setItem('finsightGoal', String(goal));
  localStorage.setItem('userName', localStorage.getItem('userName') || '');
  localStorage.setItem('theme', document.body.className || 'theme-sunset');
}

function normaliseTransaction(item) {
  return {
    id: item.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: String(item.name || 'Untitled'),
    amount: Math.max(0, Number(item.amount) || 0),
    category: categories.includes(item.category) ? item.category : 'Others',
    type: item.type === 'income' ? 'income' : 'expense',
    date: item.date || today()
  };
}

function loadAll() {
  try {
    transactions = (JSON.parse(localStorage.getItem(storageKey)) || []).map(normaliseTransaction);
  } catch {
    transactions = [];
  }

  goal = Math.max(0, Number(localStorage.getItem('finsightGoal')) || Number(localStorage.getItem('goal')) || 0);
  const storedName = localStorage.getItem('userName');
  greeting.textContent = storedName ? `${timeGreeting()}, ${storedName}!` : 'FinSight';
  if (storedName) hideModal(); else showModal();

  const storedTheme = localStorage.getItem('theme');
  const validThemes = ['theme-sunset', 'theme-stars', 'theme-ocean', 'theme-candy'];
  const theme = validThemes.includes(storedTheme) ? storedTheme : 'theme-sunset';
  document.body.className = theme;
  themeSelect.value = theme;
  if (goal > 0) goalInput.value = goal;
  transactionDate.value = today();
  populateCategoryFilter();
  renderAll();
}

function populateCategoryFilter() {
  filterCategory.innerHTML = '<option value="all">All categories</option>' + categories.map((category) => `<option value="${category}">${category}</option>`).join('');
}

function addTransaction(transaction) {
  transactions.unshift(normaliseTransaction(transaction));
  saveAll();
  renderAll();
}

expenseForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = expenseName.value.trim();
  const amount = Number(expenseAmount.value);
  if (!name || !Number.isFinite(amount) || amount <= 0 || !transactionDate.value) {
    alert('Please enter a valid description, amount and date.');
    return;
  }

  addTransaction({
    name,
    amount,
    category: expenseCategory.value,
    type: transactionType.value,
    date: transactionDate.value
  });

  expenseForm.reset();
  transactionType.value = 'expense';
  expenseCategory.value = 'Food';
  transactionDate.value = today();
});

function deleteTransaction(id) {
  const transaction = transactions.find((item) => item.id === id);
  if (!transaction) return;
  if (!confirm(`Delete "${transaction.name}" of ${currency(transaction.amount)}?`)) return;
  transactions = transactions.filter((item) => item.id !== id);
  saveAll();
  renderAll();
}

function editTransaction(id) {
  const transaction = transactions.find((item) => item.id === id);
  if (!transaction) return;
  expenseName.value = transaction.name;
  expenseAmount.value = transaction.amount;
  transactionType.value = transaction.type;
  expenseCategory.value = transaction.category;
  transactionDate.value = transaction.date;
  transactions = transactions.filter((item) => item.id !== id);
  saveAll();
  renderAll();
  expenseName.focus();
}

function getFilteredTransactions() {
  return transactions.filter((item) => {
    const matchesType = filterType.value === 'all' || item.type === filterType.value;
    const matchesCategory = filterCategory.value === 'all' || item.category === filterCategory.value;
    return matchesType && matchesCategory;
  });
}

function renderTransactionList() {
  const filtered = getFilteredTransactions();
  expenseList.innerHTML = '';
  emptyState.style.display = filtered.length ? 'none' : 'block';
  filterSummary.textContent = `${filtered.length} of ${transactions.length} shown`;

  filtered.slice(0, 100).forEach((transaction) => {
    const li = document.createElement('li');
    li.className = transaction.type === 'income' ? 'income-row' : '';
    li.innerHTML = `
      <div class="left"><strong>${escapeHtml(transaction.name)}</strong><small>${escapeHtml(transaction.category)} · ${formatDate(transaction.date)}</small></div>
      <div class="right"><span class="${transaction.type === 'income' ? 'income-text' : 'expense-text'}">${transaction.type === 'income' ? '+' : '-'}${currency(transaction.amount)}</span><button class="edit-btn" data-id="${transaction.id}" aria-label="Edit transaction">Edit</button><button class="del-btn" data-id="${transaction.id}" aria-label="Delete transaction">Delete</button></div>`;
    expenseList.appendChild(li);
  });

  expenseList.querySelectorAll('.del-btn').forEach((button) => button.addEventListener('click', () => deleteTransaction(button.dataset.id)));
  expenseList.querySelectorAll('.edit-btn').forEach((button) => button.addEventListener('click', () => editTransaction(button.dataset.id)));
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function calculateMetrics() {
  const expenses = transactions.filter((item) => item.type === 'expense');
  const income = transactions.filter((item) => item.type === 'income');
  const expenseTotal = expenses.reduce((sum, item) => sum + item.amount, 0);
  const incomeTotal = income.reduce((sum, item) => sum + item.amount, 0);
  const categoryTotals = Object.fromEntries(categories.map((category) => [category, 0]));
  expenses.forEach((item) => { categoryTotals[item.category] += item.amount; });
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0];
  const highest = expenses.reduce((max, item) => Math.max(max, item.amount), 0);
  const average = expenses.length ? expenseTotal / expenses.length : 0;
  const anomalies = detectAnomalies(expenses);
  return { expenses, expenseTotal, incomeTotal, balance: incomeTotal - expenseTotal, average, categoryTotals, topCategory, highest, anomalies };
}

function detectAnomalies(expenses) {
  if (expenses.length < 4) return [];
  const amounts = expenses.map((item) => item.amount);
  const mean = amounts.reduce((sum, value) => sum + value, 0) / amounts.length;
  const variance = amounts.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / amounts.length;
  const standardDeviation = Math.sqrt(variance);
  if (!standardDeviation) return [];
  return expenses.filter((item) => item.amount > mean + (2 * standardDeviation));
}

function renderMetrics() {
  const metrics = calculateMetrics();
  totalDisplay.textContent = currency(metrics.expenseTotal);
  incomeDisplay.textContent = currency(metrics.incomeTotal);
  balanceDisplay.textContent = currency(metrics.balance);
  averageDisplay.textContent = currency(metrics.average);
  transactionCount.textContent = transactions.length;

  const [category, categoryAmount] = metrics.topCategory || ['—', 0];
  topCategoryDisplay.textContent = categoryAmount ? category : '—';
  topShareDisplay.textContent = metrics.expenseTotal ? `${Math.round((categoryAmount / metrics.expenseTotal) * 100)}%` : '0%';
  highestExpenseDisplay.textContent = currency(metrics.highest);
  anomalyCountDisplay.textContent = metrics.anomalies.length;

  if (!transactions.length) {
    insightTitle.textContent = 'Start building your data';
    insightText.textContent = 'Add a few transactions and FinSight will identify your largest category, spending concentration, and unusual expenses.';
  } else if (metrics.anomalies.length) {
    insightTitle.textContent = `${metrics.anomalies.length} unusual expense${metrics.anomalies.length > 1 ? 's' : ''} detected`;
    insightText.textContent = `Some transactions are more than two standard deviations above your average expense. Review them to understand whether they are one-off purchases or a recurring pattern.`;
  } else if (metrics.topCategory && metrics.topCategory[1] > 0) {
    const share = Math.round((metrics.topCategory[1] / metrics.expenseTotal) * 100);
    insightTitle.textContent = `${metrics.topCategory[0]} is your biggest category`;
    insightText.textContent = `${share}% of your recorded spending is in ${metrics.topCategory[0]}. Keep watching this category as your dataset grows.`;
  }
}

function updateGoal() {
  if (!goal) {
    progressBar.style.width = '0%';
    goalText.textContent = 'Goal not set';
    return;
  }
  const spending = calculateMetrics().expenseTotal;
  const percent = Math.min((spending / goal) * 100, 100);
  progressBar.style.width = `${percent}%`;
  goalText.textContent = `${currency(spending)} of ${currency(goal)} · ${Math.round(percent)}% used`;
}

goalInput.addEventListener('change', () => {
  const value = Number(goalInput.value);
  if (!Number.isFinite(value) || value <= 0) {
    goal = 0;
    goalInput.value = '';
  } else {
    goal = value;
  }
  saveAll();
  updateGoal();
});

function updateCharts() {
  const metrics = calculateMetrics();
  const categoryValues = categories.map((category) => metrics.categoryTotals[category]);
  const pieData = { labels: categories, datasets: [{ data: categoryValues, backgroundColor: ['#7c5cff', '#4d96ff', '#ffb84d', '#e56bff', '#34c38f', '#ff6b6b', '#4ecdc4', '#9aa0a6'], borderWidth: 2 }] };
  if (expenseChart) expenseChart.destroy();
  expenseChart = new Chart($('expenseChart'), { type: 'doughnut', data: pieData, options: { responsive: true, maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'bottom' } } } });

  const months = getLastSixMonths();
  const monthlyValues = months.map((month) => metrics.expenses.filter((item) => item.date.startsWith(month.key)).reduce((sum, item) => sum + item.amount, 0));
  if (trendChart) trendChart.destroy();
  trendChart = new Chart($('trendChart'), { type: 'line', data: { labels: months.map((month) => month.label), datasets: [{ label: 'Expenses', data: monthlyValues, borderWidth: 3, tension: 0.35, fill: true }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { callback: (value) => `₹${Number(value).toLocaleString('en-IN')}` } } }, plugins: { legend: { display: false } } } });
}

function getLastSixMonths() {
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    result.push({ key, label: date.toLocaleDateString('en-IN', { month: 'short' }) });
  }
  return result;
}

function renderAll() {
  renderMetrics();
  updateGoal();
  renderTransactionList();
  updateCharts();
}

filterType.addEventListener('change', renderTransactionList);
filterCategory.addEventListener('change', renderTransactionList);

clearBtn.addEventListener('click', () => {
  if (!transactions.length && !goal) return;
  if (!confirm('Clear all transactions and the spending goal?')) return;
  transactions = [];
  goal = 0;
  goalInput.value = '';
  saveAll();
  renderAll();
});

startBtn.addEventListener('click', () => {
  const name = userNameInput.value.trim();
  if (!name) return alert('Please enter your name.');
  localStorage.setItem('userName', name);
  greeting.textContent = `${timeGreeting()}, ${name}!`;
  hideModal();
  saveAll();
});

cancelName.addEventListener('click', () => {
  if (localStorage.getItem('userName')) hideModal();
  else userNameInput.value = '';
});

editNameBtn.addEventListener('click', () => {
  userNameInput.value = localStorage.getItem('userName') || '';
  showModal();
});

themeSelect.addEventListener('change', (event) => {
  document.body.className = event.target.value;
  saveAll();
});

loadAll();
