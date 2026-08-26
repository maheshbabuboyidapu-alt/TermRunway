# TermRunway 💸

> **Manage your student budget, smarter.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-00C853?style=for-the-badge)](https://termrunway.netlify.app/)
[![Status](https://img.shields.io/badge/Status-Active%20Development-orange?style=for-the-badge)](https://github.com/)

**Live App:** https://termrunway.netlify.app/

---

## 📌 Overview

**TermRunway** is a web-based student budget planning application designed to help students understand their available money, track planned income and expenses, and calculate how much they can safely spend each day until their semester ends.

Instead of functioning as only an expense tracker, TermRunway combines **budget planning, timeline calculations, spending limits, and financial guidelines** in one application.

The project is under **continuous development**, with new features, improvements, testing, and refinements being added over time.

---

## 🎯 Problem

Students often know how much money they have, but may not know:

* How much they have already allocated to expenses
* How much money will remain
* How long the remaining money needs to last
* How much they can reasonably spend per day
* How to divide their available money between needs, wants, and savings

TermRunway is designed to make these calculations easier and present them in a simple interface.

---

## 🚀 Features

### 💰 Income Management

Users can enter multiple sources of income:

* Scholarship
* Part-Time Job
* Parents Support
* Freelance / Gigs
* Prior Savings
* Other Income

### 💸 Expense Management

Users can plan different expense categories:

* Rent
* Food
* Transport
* Utilities
* Entertainment
* Other Expenses

### 📅 Semester Calculation Mode

Users can enter the **total amount available for the semester**.

TermRunway then uses the semester end date to determine the remaining time and calculate the daily spending limit.

### 🗓️ Monthly Calculation Mode

Users can instead enter **monthly income and expense amounts**.

The application estimates the corresponding values for the remaining semester period.

### 🧮 Automatic Budget Calculations

The dashboard calculates:

* Total Income
* Total Expenses
* Remaining Balance
* Days Remaining
* Daily Spending Limit

### 📊 50/30/20 Budget Breakdown

The application provides a simple budgeting reference:

| Category | Percentage |
| -------- | ---------: |
| Needs    |        50% |
| Wants    |        30% |
| Savings  |        20% |

The values are calculated automatically from the selected income amount.

### 💾 Persistent Data

TermRunway uses browser `localStorage` to preserve the user's budget data.

Users can refresh the application without immediately losing their entered information.

### 🔄 Reset Budget

A dedicated **Reset Budget** action clears the saved data and returns the dashboard to its initial state.

### 📄 PDF Summary

The **Download PDF Summary** feature uses the browser's print functionality to create a clean printable version of the calculated budget.

The print layout hides unnecessary interface elements and focuses on the results.

### 📱 Responsive Design

The application adapts to different screen sizes:

* Mobile phones
* Tablets
* Laptops
* Desktop screens

On larger displays, the inputs and dashboard are arranged in a split-screen layout.

On smaller displays, the interface automatically switches to a compact vertical layout.

### 🎨 Aurora Glass UI

The current interface uses a custom **Aurora Glass** visual style featuring:

* Glassmorphism
* Gradient backgrounds
* Frosted cards
* Responsive layouts
* Interactive controls
* Smooth transitions
* Desktop dashboard layout
* Mobile-friendly forms

---

## 🧠 Calculation Logic

TermRunway uses the selected mode to determine the calculation strategy.

### Semester Mode

```text
Total Income
      ↓
Total Expenses
      ↓
Remaining Balance
      ↓
Days Until Semester End
      ↓
Daily Spending Limit
```

### Monthly Mode

```text
Monthly Income / Expenses
          ↓
Remaining Semester Period
          ↓
Estimated Semester Totals
          ↓
Remaining Balance
          ↓
Daily Spending Limit
```

The application also handles situations such as:

* No semester end date
* Expired semester dates
* Zero income
* Expenses exceeding available income
* Invalid numeric input

---

## 🛠️ Technology Stack

### Frontend

* **HTML5**
* **CSS3**
* **Vanilla JavaScript**

### Browser APIs

* `localStorage`
* DOM APIs
* Browser date handling
* Browser print functionality

### Development & Deployment

* **Git**
* **GitHub**
* **Netlify**

No frontend framework is currently required.

---

## 📂 Project Structure

```text
TermRunway/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   └── script.js
│
└── README.md
```

---

## 🔍 Input Validation

The application includes custom handling for numeric input fields.

Because HTML `input[type="number"]` fields can accept characters associated with scientific notation, TermRunway adds additional JavaScript validation to prevent unwanted characters such as:

```text
e
E
+
-
```

This keeps financial input predictable and helps prevent unexpected calculations.

---

## 🐛 Testing & Bug Fixing

TermRunway is actively tested during development rather than being treated as a one-time implementation.

Testing has resulted in improvements such as:

* Correcting monthly date calculations
* Handling expired semester dates
* Handling negative remaining balances
* Improving number-input validation
* Fixing desktop dashboard layout issues
* Improving mobile responsiveness
* Refining the PDF print layout

The application continues to be tested as new features are introduced.

---

## 🔄 Continuous Development

TermRunway is an **active development project**.

The current version is not considered the final version.

Future development may include:

* More income categories
* More expense categories
* Advanced budget analytics
* Visual charts and statistics
* Improved dashboard insights
* Additional export options
* Accessibility improvements
* More personalization
* Additional student-focused financial tools

The feature roadmap will evolve as the application grows.

---

## 📈 Development History

The project has evolved through multiple iterations:

```text
Basic Budget Calculator
        ↓
Budget Calculation Engine
        ↓
Daily Spending Limit
        ↓
50/30/20 Breakdown
        ↓
Persistent Storage
        ↓
Reset Functionality
        ↓
Semester / Monthly Modes
        ↓
Additional Categories
        ↓
Responsive Design
        ↓
Aurora Glass UI
        ↓
Desktop Dashboard
        ↓
PDF Export
        ↓
Input Validation
        ↓
Continuous Improvement
```

The Git history records this evolution through incremental commits.

---

## 🌐 Live Demo

### [🚀 Open TermRunway](https://termrunway.netlify.app/)

The live application represents the latest deployed version of the project.

---

## 👨‍💻 Developer

**Mahesh Babu Boyidapu**

Diploma in Computer Science Engineering student and the developer of TermRunway.

GitHub: [@maheshbabuboyidapu-alt](https://github.com/maheshbabuboyidapu-alt)

---

## 📌 Project Status

**🟢 Active Development**

TermRunway will continue to receive new features, fixes, experiments, and UI/UX improvements.

> **Current version today. Better version tomorrow.**
