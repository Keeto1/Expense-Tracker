const balanceEl = document.getElementById("balance");
const incomeAmountEl = document.getElementById("income-amount");
const expenseAmountEl = document.getElementById("expense-amount");
const transactionListEl = document.getElementById("transaction-list");
const transactionFormEl = document.getElementById("transaction-form");
const descriptionEl = document.getElementById("description");
const amountEl = document.getElementById("amount");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Notification system
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => notification.classList.add('show'), 10);
  
  // Hide after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Form submission handler
transactionFormEl.addEventListener("submit", async function(e) {
  e.preventDefault();

  const description = descriptionEl.value.trim();
  const amount = parseFloat(amountEl.value);
  const id = Date.now();

  if (!description || isNaN(amount)) {
    showNotification('Please fill all fields correctly', 'error');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('amount', amount);
    
    const response = await fetch(scriptURL, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.result === 'success') {
      transactions.push({ id, description, amount });
      localStorage.setItem("transactions", JSON.stringify(transactions));
      
      updateUI();
      transactionFormEl.reset();
      showNotification('Transaction added successfully!');
    } else {
      throw new Error(data.error || 'Failed to save transaction');
    }
  } catch (error) {
    showNotification(error.message, 'error');
    console.error(error);
  }
});

function updateUI() {
  updateTransactionList();
  updateSummary();
}

function updateTransactionList() {
  transactionListEl.style.opacity = '0';
  transactionListEl.style.transition = 'opacity 0.2s ease';
  
  setTimeout(() => {
    transactionListEl.innerHTML = "";
    const sortedTransactions = [...transactions].reverse();

    sortedTransactions.forEach((transaction) => {
      const transactionEl = createTransactionElement(transaction);
      transactionListEl.appendChild(transactionEl);
    });
    
    transactionListEl.style.opacity = '1';
  }, 200);
}

function createTransactionElement(transaction) {
  const li = document.createElement("li");
  li.classList.add("transaction");
  li.classList.add(transaction.amount > 0 ? "income" : "expense");
  li.style.opacity = '0';
  li.style.transform = 'translateY(10px)';
  li.style.transition = 'all 0.3s ease';

  li.innerHTML = `
    <span>${transaction.description}</span>
    <span>
      ${formatCurrency(transaction.amount)}
      <button class="delete-btn" onclick="removeTransaction(${transaction.id})">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"></path>
        </svg>
      </button>
    </span>
  `;

  setTimeout(() => {
    li.style.opacity = '1';
    li.style.transform = 'translateY(0)';
  }, 10);

  return li;
}

function updateSummary() {
  const balance = transactions.reduce((acc, t) => acc + t.amount, 0);
  const income = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);

  balanceEl.textContent = formatCurrency(balance);
  incomeAmountEl.textContent = formatCurrency(income);
  expenseAmountEl.textContent = formatCurrency(Math.abs(expenses));
}

function formatCurrency(number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(number);
}

window.removeTransaction = function(id) {
  transactions = transactions.filter(transaction => transaction.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateUI();
  showNotification('Transaction removed');
}

// Initial render
updateUI();