// --- 1. BLOCK INVALID CHARACTERS IN NUMBER INPUTS ---
const numberInputs = document.querySelectorAll('input[type="number"]');
numberInputs.forEach(input => {
    input.addEventListener('keydown', function(event) {
        const invalidChars = ["-", "+", "e", "E"]; 
        if (invalidChars.includes(event.key)) {
            event.preventDefault();
        }
    });
});

// --- 2. CROSS-FADE ANIMATION SCROLL LISTENER ---
window.addEventListener('scroll', function() {
    const glassNav = document.getElementById('glass-nav');
    const heroSection = document.getElementById('hero-section');
    
    if (window.scrollY > 80) {
        glassNav.classList.add('visible');
        heroSection.style.opacity = '0'; // Fade out Big Logo
    } else {
        glassNav.classList.remove('visible');
        heroSection.style.opacity = '1'; // Bring back Big Logo
    }
});

// --- 3. DOM ELEMENTS ---
const btnSemester = document.getElementById('btn-semester');
const btnMonthly = document.getElementById('btn-monthly');
const incomeDesc = document.getElementById('income-desc');
const expenseDesc = document.getElementById('expense-desc');

let isMonthlyMode = false;

// --- 4. MODE TOGGLE LOGIC ---
btnSemester.addEventListener('click', () => {
    isMonthlyMode = false;
    btnSemester.className = 'active-mode';
    btnMonthly.className = 'inactive-mode';
    incomeDesc.innerText = "How much money do you have for the semester?";
    expenseDesc.innerText = "What are your estimated costs?";
});

btnMonthly.addEventListener('click', () => {
    isMonthlyMode = true;
    btnMonthly.className = 'active-mode';
    btnSemester.className = 'inactive-mode';
    incomeDesc.innerText = "Enter your average MONTHLY income.";
    expenseDesc.innerText = "Enter your average MONTHLY costs.";
});

// --- 5. CORE CALCULATE FUNCTION ---
document.getElementById('calculate-btn').addEventListener('click', function() {
    // 1. Gather all inputs
    let totalIncome = 0;
    let totalExpenses = 0;

    const incomeFields = ['income-scholarship', 'income-part-time', 'income-parents', 'income-freelance', 'income-savings', 'income-other'];
    const expenseFields = ['expense-rent', 'expense-food', 'expense-transport', 'expense-utilities', 'expense-entertainment', 'expense-other'];

    incomeFields.forEach(id => {
        let val = parseFloat(document.getElementById(id).value) || 0;
        totalIncome += val;
    });

    expenseFields.forEach(id => {
        let val = parseFloat(document.getElementById(id).value) || 0;
        totalExpenses += val;
    });

    // 2. Adjust Math if Monthly Mode is ON
    let endDate = document.getElementById('semester-end').value;
    let daysRemaining = 0;

    if (endDate) {
        let end = new Date(endDate);
        let today = new Date();
        let differenceInTime = end.getTime() - today.getTime();
        daysRemaining = Math.ceil(differenceInTime / (1000 * 3600 * 24));

        if (isMonthlyMode && daysRemaining > 0) {
            // FIXED MATH BUG: Accurate month calculation
            let monthsRemaining = daysRemaining / (365 / 12); 
            totalIncome = totalIncome * monthsRemaining;
            totalExpenses = totalExpenses * monthsRemaining;
        }
    }

    // 3. Calculate Balance & 50/30/20 Rule
    let balance = totalIncome - totalExpenses;
    let needs = totalIncome * 0.50;
    let wants = totalIncome * 0.30;
    let savings = totalIncome * 0.20;

    // 4. Update the Dashboard Text
    document.getElementById('display-income').innerText = totalIncome.toFixed(2);
    document.getElementById('display-expenses').innerText = totalExpenses.toFixed(2);
    document.getElementById('display-balance').innerText = balance.toFixed(2);
    document.getElementById('display-needs').innerText = needs.toFixed(2);
    document.getElementById('display-wants').innerText = wants.toFixed(2);
    document.getElementById('display-savings').innerText = savings.toFixed(2);

    // 5. Daily Limit Message
    let messageBox = document.getElementById('daily-limit-message');
    if (endDate && daysRemaining > 0) {
        let dailyLimit = balance / daysRemaining;
        if (dailyLimit > 0) {
            messageBox.innerHTML = `<p>You have <strong>${daysRemaining} days</strong> left in the semester.</p>
                                    <h3 style="color: #10b981;">You can safely spend <strong>₹${dailyLimit.toFixed(2)}</strong> per day!</h3>`;
        } else {
            messageBox.innerHTML = `<p style="color: #f87171;"><strong>Warning:</strong> You are out of money or in debt. Please cut back on expenses!</p>`;
        }
    } else {
        messageBox.innerHTML = `<p><em>🗓️ Pick a valid Semester End Date above to calculate your daily limit!</em></p>`;
    }
    
    saveData();
});

// --- 6. LOCAL STORAGE SAVE & LOAD ---
function saveData() {
    const allInputs = document.querySelectorAll('input');
    const budgetData = {};
    allInputs.forEach(input => {
        budgetData[input.id] = input.value;
    });
    localStorage.setItem('termRunwayData', JSON.stringify(budgetData));
}

function loadData() {
    const savedData = localStorage.getItem('termRunwayData');
    if (savedData) {
        const budgetData = JSON.parse(savedData);
        for (const id in budgetData) {
            if (document.getElementById(id)) {
                document.getElementById(id).value = budgetData[id];
            }
        }
        document.getElementById('calculate-btn').click();
    }
}
window.onload = loadData;

// --- 7. RESET & PDF BUTTONS ---
document.getElementById('reset-btn').addEventListener('click', function() {
    document.querySelectorAll('input').forEach(input => input.value = '');
    localStorage.removeItem('termRunwayData');
    document.getElementById('calculate-btn').click();
});

document.getElementById('download-btn').addEventListener('click', function() {
    window.print();
});