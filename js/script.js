// Apply saved theme on page load
const savedTheme = localStorage.getItem("mode");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
}

let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = localStorage.getItem("currentUser");
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let editingId = null;
let barChart, pieChart;

// INIT DASHBOARD
function initDashboard() {
  if (!currentUser) return window.location = "login.html";

  document.querySelector(".dashboard").classList.remove("hidden");

  const userData = users.find(u => u.username === currentUser);
  document.getElementById("userDisplay").textContent = userData?.fullName || currentUser;

  const hour = new Date().getHours();
  if (hour >= 18 || hour <= 6) document.body.classList.add("dark");

  renderExpenses();
  renderChart();
}

// SIGNUP
function handleSignup(event) {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const fullName = document.getElementById("fullName").value;
  const phone = document.getElementById("phone").value;

  if (!username || !password || !fullName || !phone) {
    return Swal.fire("Error", "Please fill all fields", "error");
  }

  if (users.find(u => u.username === username)) {
    return Swal.fire("Oops!", "Username already exists", "warning");
  }

  users.push({ username, password, fullName, phone });
  localStorage.setItem("users", JSON.stringify(users));

  Swal.fire("Success", "Signup complete", "success").then(() => {
    window.location.href = "login.html";
  });
}

// LOGIN
function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  const found = users.find(u => u.username === username && u.password === password);
  if (!found) {
    return Swal.fire("Error", "Invalid username or password", "error");
  }

  localStorage.setItem("currentUser", username);
  Swal.fire("Welcome!", "Login successful", "success").then(() => {
    window.location.href = "dashboard.html";
  });
}

// ADD or UPDATE EXPENSE
function addOrUpdateExpense() {
  const amount = +document.getElementById("amount").value;
  const date = document.getElementById("date").value;
  const category = document.getElementById("category").value;
  const note = document.getElementById("note").value;
  const recurring = document.getElementById("recurring").checked;

  if (!amount || !date) {
    return Swal.fire("Warning", "Amount and Date are required", "warning");
  }

  if (editingId) {
    expenses = expenses.map(e =>
      e.id === editingId ? { ...e, amount, date, category, note, recurring } : e
    );
    editingId = null;
    Swal.fire("Updated!", "Expense updated", "success");
  } else {
    expenses.push({
      id: Date.now(),
      user: currentUser,
      amount,
      date,
      category,
      note,
      recurring
    });
    Swal.fire("Added!", "Expense added", "success");
  }

  localStorage.setItem("expenses", JSON.stringify(expenses));
  document.querySelector(".expense-form button").textContent = "Add Expense";
  clearForm();
  renderExpenses();
  renderChart();
}

// CLEAR FORM
function clearForm() {
  document.getElementById("amount").value = "";
  document.getElementById("date").value = "";
  document.getElementById("category").value = "Food";
  document.getElementById("note").value = "";
  document.getElementById("recurring").checked = false;
}

// RENDER EXPENSES TABLE
function renderExpenses() {
  const tbody = document.querySelector("#expenseTable tbody");
  tbody.innerHTML = "";

  const from = document.getElementById("fromDate").value;
  const to = document.getElementById("toDate").value;
  const search = document.getElementById("search").value.toLowerCase();

  const filtered = expenses.filter(e => {
    if (e.user !== currentUser) return false;
    if (from && e.date < from) return false;
    if (to && e.date > to) return false;
    if (search && ![e.category, e.note, e.amount.toString()].some(val => val.toLowerCase().includes(search))) return false;
    return true;
  });

  let total = 0;
  const thisMonth = new Date().getMonth();

  filtered.forEach(e => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${e.date}</td>
      <td>Rs ${e.amount}</td>
      <td>${e.category}</td>
      <td>${e.note}</td>
      <td>
        <button onclick="startEdit(${e.id})">✏️</button>
        <button onclick="deleteExpense(${e.id})">❌</button>
      </td>`;
    tbody.appendChild(row);

    const expMonth = new Date(e.date).getMonth();
    if (expMonth === thisMonth) total += e.amount;
  });

  document.getElementById("totalSpent").textContent = `Total this month: Rs ${total}`;
}

// START EDIT
function startEdit(id) {
  const exp = expenses.find(e => e.id === id);
  editingId = id;
  document.getElementById("amount").value = exp.amount;
  document.getElementById("date").value = exp.date;
  document.getElementById("category").value = exp.category;
  document.getElementById("note").value = exp.note;
  document.getElementById("recurring").checked = !!exp.recurring;
  document.querySelector(".expense-form button").textContent = "Update Expense";
}

// DELETE EXPENSE
function deleteExpense(id) {
  Swal.fire({
    title: "Delete this expense?",
    icon: "warning",
    showCancelButton: true
  }).then(result => {
    if (result.isConfirmed) {
      expenses = expenses.filter(e => e.id !== id);
      localStorage.setItem("expenses", JSON.stringify(expenses));
      renderExpenses();
      renderChart();
    }
  });
}

// LOGOUT
function logout() {
  localStorage.removeItem("currentUser");
  location = "login.html";
}

// TOGGLE DARK MODE
function toggleDarkMode() {
  const isDark = document.body.style.background === "rgb(18, 18, 18)";
  if (isDark) {
    applyLightTheme();
    localStorage.setItem("mode", "light");
  } else {
    applyDarkTheme();
    localStorage.setItem("mode", "dark");
  }
}

function applyDarkTheme() {
  document.body.style.background = "#121212";
  document.body.style.color = "#ffffff";

  const containers = document.querySelectorAll(".container");
  containers.forEach(c => {
    c.style.background = "#1e1e1e";
    c.style.color = "#ffffff";
    c.style.boxShadow = "0 0 10px rgba(255,255,255,0.1)";
  });

  const inputs = document.querySelectorAll("input, select, button, textarea");
  inputs.forEach(el => {
    el.style.backgroundColor = "#333";
    el.style.color = "#fff";
    el.style.borderColor = "#666";
  });
}

function applyLightTheme() {
  document.body.style.background = "#f0f2f5";
  document.body.style.color = "#333";

  const containers = document.querySelectorAll(".container");
  containers.forEach(c => {
    c.style.background = "#fff";
    c.style.color = "#333";
    c.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
  });

  const inputs = document.querySelectorAll("input, select, button, textarea");
  inputs.forEach(el => {
    el.style.backgroundColor = "#fff";
    el.style.color = "#000";
    el.style.borderColor = "#ccc";
  });
}

// CLEAR ALL DATA
function clearAllData() {
  Swal.fire({
    title: "Clear all your expenses?",
    icon: "warning",
    showCancelButton: true
  }).then(result => {
    if (result.isConfirmed) {
      expenses = expenses.filter(e => e.user !== currentUser);
      localStorage.setItem("expenses", JSON.stringify(expenses));
      renderExpenses();
      renderChart();
      Swal.fire("Done!", "All your data is cleared.", "success");
    }
  });
}

// PLACEHOLDER PDF EXPORT
async function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Expense Report", 14, 20);

  const table = document.querySelector("#expenseTable");
  let headers = [], rows = [];

  // Get header row
  table.querySelectorAll("thead th").forEach(th => {
    headers.push(th.innerText);
  });

  // Get data rows
  table.querySelectorAll("tbody tr").forEach(tr => {
    let row = [];
    tr.querySelectorAll("td").forEach(td => row.push(td.innerText));
    rows.push(row);
  });

  if (rows.length === 0) {
    return Swal.fire("No Data", "No expenses to export!", "info");
  }

  // Draw table
  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 30
  });

  doc.save(`Expense_Report_${new Date().toISOString().split("T")[0]}.pdf`);
}

// RENDER CHARTS
function renderChart() {
  const data = expenses.filter(e => e.user === currentUser);
  const monthly = {}, categories = {};

  const today = new Date();

  data.forEach(e => {
    const month = new Date(e.date).toLocaleString('default', { month: 'short' });
    monthly[month] = (monthly[month] || 0) + e.amount;
    categories[e.category] = (categories[e.category] || 0) + e.amount;

    // Recurring check: Add next month's copy only if it's not duplicated
    if (e.recurring && !data.find(x =>
      x.user === e.user &&
      x.date === getNextMonthDate(e.date) &&
      x.amount === e.amount &&
      x.note === e.note
    )) {
      const next = getNextMonthDate(e.date);
      expenses.push({
        ...e,
        id: Date.now() + Math.random(),
        date: next,
        recurring: true
      });
    }
  });

  localStorage.setItem("expenses", JSON.stringify(expenses));

  // Bar Chart
  const ctxBar = document.getElementById("expenseChart").getContext("2d");
  barChart?.destroy();
  barChart = new Chart(ctxBar, {
    type: "bar",
    data: {
      labels: Object.keys(monthly),
      datasets: [{
        label: "Monthly Spending",
        data: Object.values(monthly),
        backgroundColor: "#6a5acd"
      }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });

  // Pie Chart
  const ctxPie = document.getElementById("categoryChart").getContext("2d");
  pieChart?.destroy();
  pieChart = new Chart(ctxPie, {
    type: "pie",
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0", "#9966cc"]
      }]
    },
    options: { responsive: true }
  });
}

// Recurring helper
function getNextMonthDate(dateStr) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split("T")[0];
}

// INIT on Dashboard load
if (window.location.pathname.includes("dashboard.html")) {
  window.onload = initDashboard;
}