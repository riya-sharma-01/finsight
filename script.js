// ------------------ ELEMENTS ------------------
const welcomeModal = document.getElementById('welcome-modal');
const userNameInput = document.getElementById('user-name');
const startBtn = document.getElementById('start-btn');
const cancelName = document.getElementById('cancel-name');
const greeting = document.getElementById('greeting');
const editNameBtn = document.getElementById('edit-name');

const expenseForm = document.getElementById('expense-form');
const expenseName = document.getElementById('name');
const expenseAmount = document.getElementById('amount');
const expenseCategory = document.getElementById('category');
const expenseList = document.getElementById('expense-list');

const totalDisplay = document.getElementById('total');
const goalInput = document.getElementById('goal-input');
const progressBar = document.getElementById('progress-bar');
const goalText = document.getElementById('goal-text');
const clearBtn = document.getElementById('clear-btn');
const themeSelect = document.getElementById('theme-select');


// ------------------ DATA ------------------
let expenses = [];
let total = 0;
let goal = 0;
let categoryTotals = { Food:0, Travel:0, Entertainment:0, Shopping:0, Others:0 };

// ------------------ CHART ------------------
const ctx = document.getElementById('expenseChart').getContext('2d');
const expenseChart = new Chart(ctx, {
  type: 'pie',
  data: {
    labels: ['Food','Travel','Entertainment','Shopping','Others'],
    datasets: [{ 
      data:[0,0,0,0,0], 
      backgroundColor: ['#FF6B6B','#4D96FF','#FFCE56','#8A2BE2','#FF7F50'] 
    }]
  },
  options: { 
    responsive:true, 
    maintainAspectRatio:false, 
    plugins:{legend:{position:'bottom'}} 
  }
});

// ------------------ HELPERS ------------------
function saveAll(){
  localStorage.setItem('expenses', JSON.stringify(expenses));
  localStorage.setItem('total', total);
  localStorage.setItem('categoryTotals', JSON.stringify(categoryTotals));
  localStorage.setItem('goal', goal);
  localStorage.setItem('userName', localStorage.getItem('userName') || '');
  localStorage.setItem('theme', document.body.className || '');
}

function loadAll(){
  expenses = JSON.parse(localStorage.getItem('expenses')) || [];
  total = parseFloat(localStorage.getItem('total')) || 0;
  categoryTotals = JSON.parse(localStorage.getItem('categoryTotals')) || { Food:0, Travel:0, Entertainment:0, Shopping:0, Others:0 };
  goal = parseFloat(localStorage.getItem('goal')) || 0;

  const storedName = localStorage.getItem('userName');
  if(storedName){
    greeting.textContent = `${timeGreeting()}, ${storedName}!`;
    hideModal();
  } else showModal();

  const storedTheme = localStorage.getItem('theme');
  if(storedTheme && ['theme-sunset','theme-stars','theme-ocean','theme-candy'].includes(storedTheme)){
    document.body.classList.remove('theme-sunset','theme-stars','theme-ocean','theme-candy');
    document.body.classList.add(storedTheme);
    themeSelect.value = storedTheme;
  } else {
    document.body.classList.add('theme-sunset');
    themeSelect.value = 'theme-sunset';
  }

  if(goal>0) goalInput.value = goal;
  updateExpenseList(); updateTotal(); updateProgressBar(); updateChart();
}

// ------------------ MODAL ------------------
function showModal(){ welcomeModal.style.display = 'flex'; }
function hideModal(){ welcomeModal.style.display = 'none'; }

function timeGreeting(){
  const h = new Date().getHours();
  if(h < 12) return 'Good Morning';
  if(h < 18) return 'Good Afternoon';
  return 'Good Evening';
}

// ------------------ EVENTS ------------------
// Start button
startBtn.addEventListener('click', () => {
  const name = userNameInput.value.trim();
  if(!name){ alert('Please enter your name'); return; }
  localStorage.setItem('userName', name);
  greeting.textContent = `${timeGreeting()}, ${name}!`;
  hideModal();
  saveAll();
});

// Cancel name
cancelName.addEventListener('click', () => {
  if(localStorage.getItem('userName')) hideModal();
  else userNameInput.value = '';
});

// Edit name
editNameBtn.addEventListener('click', () => {
  userNameInput.value = localStorage.getItem('userName') || '';
  showModal();
});

// Add expense
expenseForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = expenseName.value.trim();
  const amount = parseFloat(expenseAmount.value);
  const category = expenseCategory.value;
  if(!name || isNaN(amount) || amount <= 0){ alert('Enter valid description and amount'); return; }

  expenses.push({ name, amount, category });
  total += amount;
  categoryTotals[category] = (categoryTotals[category] || 0) + amount;

  saveAll();
  updateExpenseList(); updateTotal(); updateProgressBar(); updateChart();

  expenseName.value = ''; expenseAmount.value = ''; expenseCategory.value = 'Food';
});

// Update list
function updateExpenseList(){
  expenseList.innerHTML = '';
  expenses.forEach((exp, idx)=>{
    const li = document.createElement('li');
    li.innerHTML = `<div class="left"><strong>${exp.name}</strong><small> • ${exp.category}</small></div>
                    <div class="right"><span>₹${exp.amount.toFixed(2)}</span>
                    <button class="edit-btn" data-i="${idx}">✏️</button>
                    <button class="del-btn" data-i="${idx}">❌</button></div>`;
    expenseList.appendChild(li);
  });

  document.querySelectorAll('.del-btn').forEach(b => b.onclick = function(){ deleteExpense(parseInt(this.dataset.i)); });
  document.querySelectorAll('.edit-btn').forEach(b => b.onclick = function(){ editExpense(parseInt(this.dataset.i)); });
}

// Delete expense
function deleteExpense(i){
  const exp = expenses[i];
  if(!exp) return;
  if(confirm(`Delete "${exp.name}" of ₹${exp.amount.toFixed(2)}?`)){
    total -= exp.amount;
    categoryTotals[exp.category] -= exp.amount;
    expenses.splice(i,1);
    saveAll(); updateExpenseList(); updateTotal(); updateProgressBar(); updateChart();
  }
}

// Edit expense
function editExpense(i){
  const exp = expenses[i];
  if(!exp) return;
  expenseName.value = exp.name;
  expenseAmount.value = exp.amount;
  expenseCategory.value = exp.category;

  total -= exp.amount;
  categoryTotals[exp.category] -= exp.amount;
  expenses.splice(i,1);

  saveAll(); updateExpenseList(); updateTotal(); updateProgressBar(); updateChart();
}

// Totals & goal
function updateTotal(){ totalDisplay.textContent = `₹${total.toFixed(2)}`; }

goalInput.addEventListener('change', () => {
  const v = parseFloat(goalInput.value);
  if(!isNaN(v) && v>0){ goal = v; saveAll(); updateProgressBar(); }
  else { alert('Enter valid goal'); goalInput.value = ''; }
});

function updateProgressBar(){
  if(goal===0){ progressBar.style.width='0%'; goalText.textContent='Goal not set'; return; }
  let pct = (total/goal)*100; if(pct>100) pct=100;
  progressBar.style.width = pct + '%';
  goalText.textContent = `You've used ₹${total.toFixed(2)} of ₹${goal}`;
}

// Update chart
function updateChart(){
  expenseChart.data.datasets[0].data = [
    categoryTotals.Food || 0,
    categoryTotals.Travel || 0,
    categoryTotals.Entertainment || 0,
    categoryTotals.Shopping || 0,
    categoryTotals.Others || 0
  ];
  expenseChart.update();
}

// Clear all
clearBtn.addEventListener('click', ()=>{
  if(confirm('Clear all expenses?')){
    expenses=[]; total=0; goal=0;
    categoryTotals = { Food:0, Travel:0, Entertainment:0, Shopping:0, Others:0 };
    saveAll(); updateExpenseList(); updateTotal(); updateProgressBar(); updateChart();
    goalInput.value=''; expenseName.value=''; expenseAmount.value=''; expenseCategory.value='Food';
  }
});

// Theme switch
themeSelect.addEventListener('change', (e)=>{
  const cls = e.target.value;
  document.body.classList.remove('theme-sunset','theme-stars','theme-ocean','theme-candy');
  document.body.classList.add(cls);
  localStorage.setItem('theme', cls);
});

// ------------------ INITIAL LOAD ------------------
loadAll();
