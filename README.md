# TermRunway Student Budget Calculator 🚀

TermRunway Student Budget Calculator is a lightweight, frontend-only financial web application designed specifically to help college and university students navigate the fiscal challenges of higher education, manage limited resources, and avoid debt.

---

## 🌟 Key Features

- **50/30/20 Rule Analyzer:** Automatically categorizes income into needs, wants, and savings against student-friendly benchmark ratios with real-time feedback.
- **Daily Safe-to-Spend Allowance:** Computes a real-time daily spending limit so you know exactly what you can afford each day without overdrawing.
- **Semester Runway Simulator:** Models how long your grant, stipend, or student loan will last across your entire academic term based on current burn rates.
- **Savings Goal Tracker:** Visualizes progress toward specific financial targets like textbooks, emergency funds, or travel.
- **Smart Dynamic Recommendation Engine:** Delivers context-aware, actionable financial advice based on spending health and runway depletion.
- **Multi-Currency & Timeframe Scaler:** Switch easily between weekly, monthly, and semester views across multiple currencies ($ USD, € EUR, £ GBP, ₹ INR).
- **Offline Privacy:** Uses browser `localStorage` to keep all your personal financial data secure and accessible offline.
- **Data Portability:** Export your budget data instantly as **JSON** or **CSV**, or use the built-in **Save as PDF** feature for easy reporting.

---

## 📁 File Structure

The project follows a clean, zero-dependency, front-end architecture:

```text
/TermRunway_Student_Budget_Calculator
├── index.html       # Application structure and UI markup
├── styles.css       # Responsive styling and print templates
└── app.js           # Core calculation engine, local storage, and export logic