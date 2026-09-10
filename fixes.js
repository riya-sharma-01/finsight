// Compatibility fixes kept separate so the 2.0 upgrade remains easy to review.
(function () {
  const STORAGE = 'finsightTransactions';
  const LEGACY = 'expenses';
  const categories = ['Food', 'Travel', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Education', 'Others'];

  const localDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Migrate the original FinSight schema once. The legacy app did not store dates,
  // so migrated records receive today's date rather than inventing historical dates.
  const existing = localStorage.getItem(STORAGE);
  if (!existing) {
    try {
      const legacy = JSON.parse(localStorage.getItem(LEGACY) || '[]');
      if (Array.isArray(legacy) && legacy.length) {
        const migrated = legacy.map((item, index) => ({
          id: `legacy-${Date.now()}-${index}`,
          name: String(item.name || 'Untitled'),
          amount: Math.max(0, Number(item.amount) || 0),
          category: categories.includes(item.category) ? item.category : 'Others',
          type: 'expense',
          date: localDate()
        }));
        localStorage.setItem(STORAGE, JSON.stringify(migrated));
        location.reload();
        return;
      }
    } catch { /* Ignore malformed legacy data. */ }
  }

  const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const readTransactions = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE) || '[]'); } catch { return []; }
  };
  const writeTransactions = (items) => localStorage.setItem(STORAGE, JSON.stringify(items));
  const currentMonth = () => localDate().slice(0, 7);

  // Prevent the old destructive edit handler from running. Edit is now a true update:
  // the existing record stays in storage until the replacement is submitted.
  document.addEventListener('click', (event) => {
    const button = event.target.closest('.edit-btn');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    const item = readTransactions().find((tx) => tx.id === button.dataset.id);
    if (!item) return;
    document.getElementById('name').value = item.name;
    document.getElementById('amount').value = item.amount;
    document.getElementById('transaction-type').value = item.type;
    document.getElementById('category').value = item.category;
    document.getElementById('transaction-date').value = item.date;
    sessionStorage.setItem('finsightEditingId', item.id);
    document.getElementById('name').focus();
  }, true);

  document.addEventListener('submit', (event) => {
    if (event.target.id !== 'expense-form') return;
    const editingId = sessionStorage.getItem('finsightEditingId');
    if (!editingId) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    const name = document.getElementById('name').value.trim();
    const amount = Number(document.getElementById('amount').value);
    const type = document.getElementById('transaction-type').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('transaction-date').value;
    if (!name || !Number.isFinite(amount) || amount <= 0 || !date) return;

    const updated = readTransactions().map((tx) => tx.id === editingId ? { ...tx, name, amount, type, category, date } : tx);
    writeTransactions(updated);
    sessionStorage.removeItem('finsightEditingId');
    location.reload();
  }, true);

  // Make the displayed budget genuinely monthly.
  document.addEventListener('change', (event) => {
    if (event.target.id !== 'goal-input') return;
    event.stopImmediatePropagation();
    const goal = Number(event.target.value);
    localStorage.setItem('finsightGoal', String(Number.isFinite(goal) && goal > 0 ? goal : 0));
    const monthly = readTransactions().filter((tx) => tx.type === 'expense' && String(tx.date).startsWith(currentMonth())).reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const percent = goal > 0 ? Math.min((monthly / goal) * 100, 100) : 0;
    document.getElementById('progress-bar').style.width = `${percent}%`;
    document.getElementById('goal-text').textContent = goal > 0 ? `${money(monthly)} of ${money(goal)} · ${Math.round(percent)}% used` : 'Goal not set';
  }, true);
})();
