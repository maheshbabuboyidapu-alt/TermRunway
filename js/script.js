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
        heroSection.style.opacity = '0';
    } else {
        glassNav.classList.remove('visible');
        heroSection.style.opacity = '1';
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

    incomeDesc.innerText =
        "How much money do you have for the semester?";

    expenseDesc.innerText =
        "What are your estimated costs?";

});


btnMonthly.addEventListener('click', () => {

    isMonthlyMode = true;

    btnMonthly.className = 'active-mode';
    btnSemester.className = 'inactive-mode';

    incomeDesc.innerText =
        "Enter your average MONTHLY income.";

    expenseDesc.innerText =
        "Enter your average MONTHLY costs.";

});


// --- 5. DATE CALCULATION ---

function getDaysRemaining(endDateString) {

    if (!endDateString) {
        return 0;
    }

    const today = new Date();

    const todayDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    const endDate = new Date(
        `${endDateString}T00:00:00`
    );

    if (Number.isNaN(endDate.getTime())) {
        return 0;
    }

    const differenceInTime =
        endDate.getTime() - todayDate.getTime();

    return Math.max(
        0,
        Math.ceil(
            differenceInTime /
            (1000 * 60 * 60 * 24)
        )
    );

}


// --- 6. CALCULATE MONTH FRACTION ---

function getCalendarMonthFraction(endDateString) {

    if (!endDateString) {
        return 0;
    }

    const today = new Date();

    let start = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    const endDate = new Date(
        `${endDateString}T00:00:00`
    );

    if (
        Number.isNaN(endDate.getTime()) ||
        endDate <= start
    ) {
        return 0;
    }

    let fraction = 0;


    // Remaining part of current month

    const daysInCurrentMonth =
        new Date(
            start.getFullYear(),
            start.getMonth() + 1,
            0
        ).getDate();


    const lastDayOfCurrentMonth =
        new Date(
            start.getFullYear(),
            start.getMonth(),
            daysInCurrentMonth
        );


    const currentMonthDaysRemaining =
        Math.floor(
            (
                lastDayOfCurrentMonth - start
            ) /
            (1000 * 60 * 60 * 24)
        );


    fraction +=
        currentMonthDaysRemaining /
        daysInCurrentMonth;


    // Move to first day of next month

    start = new Date(
        start.getFullYear(),
        start.getMonth() + 1,
        1
    );


    // Count complete months

    while (
        start.getFullYear() < endDate.getFullYear() ||
        (
            start.getFullYear() === endDate.getFullYear() &&
            start.getMonth() < endDate.getMonth()
        )
    ) {

        fraction += 1;

        start = new Date(
            start.getFullYear(),
            start.getMonth() + 1,
            1
        );

    }


    // Final partial month

    if (
        start.getFullYear() === endDate.getFullYear() &&
        start.getMonth() === endDate.getMonth()
    ) {

        const daysInFinalMonth =
            new Date(
                start.getFullYear(),
                start.getMonth() + 1,
                0
            ).getDate();


        fraction +=
            endDate.getDate() /
            daysInFinalMonth;

    }


    return fraction;

}


// --- 7. CALCULATE BUTTON ---

document
    .getElementById('calculate-btn')
    .addEventListener('click', function() {


        const incomeFields = [
            'income-scholarship',
            'income-part-time',
            'income-parents',
            'income-freelance',
            'income-savings',
            'income-other'
        ];


        const expenseFields = [
            'expense-rent',
            'expense-food',
            'expense-transport',
            'expense-utilities',
            'expense-entertainment',
            'expense-other'
        ];


        const endDate =
            document.getElementById(
                'semester-end'
            ).value;


        const daysRemaining =
            getDaysRemaining(endDate);


        let totalIncome = 0;
        let totalExpenses = 0;


        // --- SEMESTER MODE ---

        if (!isMonthlyMode) {

            incomeFields.forEach(id => {

                const value =
                    parseFloat(
                        document.getElementById(id).value
                    ) || 0;

                totalIncome += value;

            });


            expenseFields.forEach(id => {

                const value =
                    parseFloat(
                        document.getElementById(id).value
                    ) || 0;

                totalExpenses += value;

            });

        }


        // --- MONTHLY MODE ---

        else {

            // Money already available now
            const currentMoney =
                parseFloat(
                    document.getElementById(
                        'income-savings'
                    ).value
                ) || 0;


            // Recurring monthly income
            let monthlyIncome = 0;

            [
                'income-scholarship',
                'income-part-time',
                'income-parents',
                'income-freelance',
                'income-other'
            ].forEach(id => {

                const value =
                    parseFloat(
                        document.getElementById(id).value
                    ) || 0;

                monthlyIncome += value;

            });


            // Recurring monthly expenses
            let monthlyExpenses = 0;

            expenseFields.forEach(id => {

                const value =
                    parseFloat(
                        document.getElementById(id).value
                    ) || 0;

                monthlyExpenses += value;

            });


            const monthFraction =
                getCalendarMonthFraction(
                    endDate
                );


            const futureIncome =
                monthlyIncome *
                monthFraction;


            const futureExpenses =
                monthlyExpenses *
                monthFraction;


            totalIncome =
                currentMoney +
                futureIncome;


            totalExpenses =
                futureExpenses;

        }


        // --- 8. BALANCE ---

        const balance =
            totalIncome -
            totalExpenses;


        // --- 9. 50 / 30 / 20 REFERENCE ---

        const needs =
            totalIncome * 0.50;

        const wants =
            totalIncome * 0.30;

        const savings =
            totalIncome * 0.20;


        // --- 10. UPDATE DASHBOARD ---

        document
            .getElementById('display-income')
            .innerText =
            totalIncome.toFixed(2);


        document
            .getElementById('display-expenses')
            .innerText =
            totalExpenses.toFixed(2);


        document
            .getElementById('display-balance')
            .innerText =
            balance.toFixed(2);


        document
            .getElementById('display-needs')
            .innerText =
            needs.toFixed(2);


        document
            .getElementById('display-wants')
            .innerText =
            wants.toFixed(2);


        document
            .getElementById('display-savings')
            .innerText =
            savings.toFixed(2);


        // --- 11. DAILY SPENDING LIMIT ---

        const messageBox =
            document.getElementById(
                'daily-limit-message'
            );


        if (
            endDate &&
            daysRemaining > 0
        ) {

            const dailyLimit =
                balance /
                daysRemaining;


            if (dailyLimit > 0) {

                messageBox.innerHTML = `
                    <p>
                        You have
                        <strong>
                            ${daysRemaining} days
                        </strong>
                        left in the semester.
                    </p>

                    <h3 style="color: #10b981;">
                        You can safely spend
                        <strong>
                            ₹${dailyLimit.toFixed(2)}
                        </strong>
                        per day!
                    </h3>
                `;

            } else {

                messageBox.innerHTML = `
                    <p style="color: #f87171;">
                        <strong>
                            Warning:
                        </strong>

                        You are out of money or
                        in debt. Please cut back
                        on expenses!
                    </p>
                `;

            }

        } else {

            messageBox.innerHTML = `
                <p>
                    <em>
                        🗓️ Pick a valid Semester End Date
                        above to calculate your daily limit!
                    </em>
                </p>
            `;

        }


        saveData();

    });


// --- 12. LOCAL STORAGE SAVE ---

function saveData() {

    const allInputs =
        document.querySelectorAll('input');

    const budgetData = {};


    allInputs.forEach(input => {

        budgetData[input.id] =
            input.value;

    });


    budgetData.mode =
        isMonthlyMode
            ? 'monthly'
            : 'semester';


    localStorage.setItem(
        'termRunwayData',
        JSON.stringify(budgetData)
    );

}


// --- 13. LOCAL STORAGE LOAD ---

function loadData() {

    const savedData =
        localStorage.getItem(
            'termRunwayData'
        );


    if (!savedData) {
        return;
    }


    try {

        const budgetData =
            JSON.parse(savedData);


        for (
            const id in budgetData
        ) {

            if (id === 'mode') {
                continue;
            }


            const input =
                document.getElementById(id);


            if (input) {
                input.value =
                    budgetData[id];
            }

        }


        if (
            budgetData.mode === 'monthly'
        ) {

            btnMonthly.click();

        } else {

            btnSemester.click();

        }


        document
            .getElementById('calculate-btn')
            .click();

    } catch (error) {

        console.error(
            'Error loading saved data:',
            error
        );

        localStorage.removeItem(
            'termRunwayData'
        );

    }

}


window.addEventListener(
    'load',
    loadData
);


// --- 14. RESET BUTTON ---

document
    .getElementById('reset-btn')
    .addEventListener('click', function() {

        document
            .querySelectorAll('input')
            .forEach(input => {
                input.value = '';
            });


        localStorage.removeItem(
            'termRunwayData'
        );


        btnSemester.click();


        document
            .getElementById('calculate-btn')
            .click();

    });


// --- 15. PDF / PRINT BUTTON ---

document
    .getElementById('download-btn')
    .addEventListener(
        'click',
        function() {

            window.print();

        }
    );