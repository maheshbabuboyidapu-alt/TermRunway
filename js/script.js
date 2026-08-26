// --- BRICK 12: Mode Toggle Logic ---
let isMonthlyMode = false;

document.getElementById('btn-semester').addEventListener('click', function() {
    isMonthlyMode = false;
    this.className = 'active-mode';
    document.getElementById('btn-monthly').className = 'inactive-mode';
    document.getElementById('income-desc').innerText = "How much money do you have for the semester?";
    document.getElementById('expense-desc').innerText = "What are your estimated costs?";
    document.getElementById('calculate-btn').click(); // Auto-recalculate
});

document.getElementById('btn-monthly').addEventListener('click', function() {
    isMonthlyMode = true;
    this.className = 'active-mode';
    document.getElementById('btn-semester').className = 'inactive-mode';
    document.getElementById('income-desc').innerText = "How much money do you get per month?";
    document.getElementById('expense-desc').innerText = "What are your estimated costs per month?";
    document.getElementById('calculate-btn').click(); // Auto-recalculate
});


// --- BRICK 4: Smooth Typing (Enter Key Logic) ---
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.code === 'NumpadEnter') {
        let currentBox = document.activeElement;
        if (currentBox.tagName === 'INPUT') {
            event.preventDefault(); 
            let allInputs = Array.from(document.querySelectorAll('input'));
            let currentIndex = allInputs.indexOf(currentBox);
            if (currentIndex > -1 && currentIndex < allInputs.length - 1) {
                allInputs[currentIndex + 1].focus();
            } else if (currentIndex === allInputs.length - 1) {
                document.getElementById('calculate-btn').focus();
            }
        }
    }
});

// --- BRICK 5, 6, 7, 8 & 12: The Math Engine ---
document.getElementById('calculate-btn').addEventListener('click', function() {
    
    // 1. GATHER RAW INPUTS
    let scholarship = Number(document.getElementById('income-scholarship').value) || 0;
    let partTime = Number(document.getElementById('income-part-time').value) || 0;
    let parents = Number(document.getElementById('income-parents').value) || 0;
    let otherIncome = Number(document.getElementById('income-other').value) || 0;
    let rawIncome = scholarship + partTime + parents + otherIncome;

    let rent = Number(document.getElementById('expense-rent').value) || 0;
    let food = Number(document.getElementById('expense-food').value) || 0;
    let transport = Number(document.getElementById('expense-transport').value) || 0;
    let otherExpenses = Number(document.getElementById('expense-other').value) || 0;
    let rawExpenses = rent + food + transport + otherExpenses;

    // 2. CALCULATE TIME (Days & Months Remaining)
    let endDateInput = document.getElementById('semester-end').value;
    let messageBox = document.getElementById('daily-limit-message');
    let daysRemaining = 0;
    let monthsRemaining = 1; // Default to 1 month

    if (endDateInput) {
        let endDate = new Date(endDateInput);
        let today = new Date();
        let timeDiff = endDate.getTime() - today.getTime();
        daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (daysRemaining > 0) {
            monthsRemaining = daysRemaining / (365 / 12); // exact mathematical month
        } else {
            daysRemaining = 0;
            monthsRemaining = 0;
        }
    }

    // 3. APPLY MONTHLY MULTIPLIER (If in Monthly Mode)
    let totalIncome = isMonthlyMode ? (rawIncome * monthsRemaining) : rawIncome;
    let totalExpenses = isMonthlyMode ? (rawExpenses * monthsRemaining) : rawExpenses;
    
    let remainingBalance = totalIncome - totalExpenses;

    // 4. CALCULATE DAILY LIMIT & MESSAGING
    let dailyLimit = "0.00";
    if (endDateInput) {
        if (daysRemaining > 0 && remainingBalance > 0) {
            dailyLimit = (remainingBalance / daysRemaining).toFixed(2);
            let modeText = isMonthlyMode ? "(calculated from your monthly inputs)" : "";
            messageBox.innerHTML = `<h3>Daily Spending Limit: ₹${dailyLimit}</h3>
                                    <p>You have ₹${remainingBalance.toFixed(2)} remaining ${modeText} to last for the next ${daysRemaining} days.</p>`;
        } else if (remainingBalance <= 0) {
            messageBox.innerHTML = `<p>🚨 You are out of money! No daily limit available.</p>`;
        } else {
            messageBox.innerHTML = `<p>⚠️ Your semester end date has already passed!</p>`;
        }
    } else {
        if (isMonthlyMode) {
             messageBox.innerHTML = `<p><em>🗓️ Pick a Semester End Date above so we can multiply your monthly numbers by the remaining months!</em></p>`;
        } else {
             messageBox.innerHTML = `<p><em>🗓️ Pick a Semester End Date above to calculate your daily spending limit!</em></p>`;
        }
    }

    // 5. CALCULATE 50/30/20 RULE
    let needs, wants, savings;
    if (remainingBalance < 0) {
        needs = "0.00 (Over Budget! 🚨)";
        wants = "0.00 (Over Budget! 🚨)";
        savings = "0.00 (Over Budget! 🚨)";
    } else {
        needs = (totalIncome * 0.50).toFixed(2);
        wants = (totalIncome * 0.30).toFixed(2);
        savings = (totalIncome * 0.20).toFixed(2);
    }

    // 6. UPDATE THE DASHBOARD
    document.getElementById('display-income').innerText = totalIncome.toFixed(2);
    document.getElementById('display-expenses').innerText = totalExpenses.toFixed(2);
    document.getElementById('display-balance').innerText = remainingBalance.toFixed(2);
    
    document.getElementById('display-needs').innerText = needs;
    document.getElementById('display-wants').innerText = wants;
    document.getElementById('display-savings').innerText = savings;
    
    // --- BRICK 8: SAVE DATA ---
    let budgetData = {
        scholarship: scholarship || "",
        partTime: partTime || "",
        parents: parents || "",
        otherIncome: otherIncome || "",
        rent: rent || "",
        food: food || "",
        transport: transport || "",
        otherExpenses: otherExpenses || "",
        endDate: endDateInput || ""
    };
    localStorage.setItem('termRunwayData', JSON.stringify(budgetData));
});

// --- BRICK 8: LOAD SAVED DATA ---
window.addEventListener('DOMContentLoaded', function() {
    let savedData = localStorage.getItem('termRunwayData');
    if (savedData) {
        let budgetData = JSON.parse(savedData);
        
        document.getElementById('income-scholarship').value = budgetData.scholarship;
        document.getElementById('income-part-time').value = budgetData.partTime;
        document.getElementById('income-parents').value = budgetData.parents;
        document.getElementById('income-other').value = budgetData.otherIncome;
        
        document.getElementById('expense-rent').value = budgetData.rent;
        document.getElementById('expense-food').value = budgetData.food;
        document.getElementById('expense-transport').value = budgetData.transport;
        document.getElementById('expense-other').value = budgetData.otherExpenses;
        document.getElementById('semester-end').value = budgetData.endDate;
        
        document.getElementById('calculate-btn').click();
    }
});

// --- BRICK 11: The Reset Button ---
document.getElementById('reset-btn').addEventListener('click', function() {
    localStorage.removeItem('termRunwayData');
    
    let allInputs = document.querySelectorAll('input');
    allInputs.forEach(input => input.value = '');
    
    document.getElementById('display-income').innerText = "0.00";
    document.getElementById('display-expenses').innerText = "0.00";
    document.getElementById('display-balance').innerText = "0.00";
    document.getElementById('display-needs').innerText = "0.00";
    document.getElementById('display-wants').innerText = "0.00";
    document.getElementById('display-savings').innerText = "0.00";
    
    document.getElementById('daily-limit-message').innerHTML = `<p><em>🗓️ Pick a Semester End Date above to calculate your daily spending limit!</em></p>`;
});
// --- BRICK 14: The Download Button ---
document.getElementById('download-btn').addEventListener('click', function() {
    window.print();
});