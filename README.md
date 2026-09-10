# FinSight 2.0

**Personal Finance Intelligence Dashboard**

FinSight is a browser-based finance dashboard that turns transaction data into useful summaries, category analysis, monthly trends, budget progress, and explainable spending signals.

## What changed in 2.0

The original project focused on recording expenses and displaying a basic category chart. Version 2.0 expands it into a small analytics-focused application while keeping the project lightweight and client-side.

### Core features

- Add income and expense transactions
- Edit and delete transactions without losing the original record
- Migrate legacy FinSight expense data into the new transaction model
- Categorize transactions across 8 spending categories
- Record transaction dates for time-based analysis
- Calculate total income, total expenses, net balance, and average expense
- Set and monitor a current-month spending goal
- Filter transactions by type and category
- View category spending as a doughnut chart
- View a six-month expense trend
- Detect unusually large expenses using a statistical threshold
- Generate explainable spending insights
- Persist data in browser Local Storage
- Responsive dashboard UI with theme selection
- Automated smoke tests with Node.js and GitHub Actions

## Analytics logic

FinSight calculates metrics directly from the transaction dataset:

**Net balance**

`total income - total expenses`

**Average expense**

`total expenses / number of expense transactions`

**Category share**

`category spending / total spending × 100`

**Unusual expense signal**

For datasets with at least four expense transactions, FinSight calculates the mean and standard deviation of expense amounts. A transaction is flagged when its amount is greater than:

`mean + 2 × standard deviation`

This is intentionally presented as a **signal**, not a claim of fraud or financial risk. The goal is to demonstrate a transparent, explainable analytics technique.

## Tech stack

- **HTML5** — semantic dashboard structure
- **CSS3** — responsive UI, themes, glassmorphism-inspired cards
- **JavaScript ES6+** — state management, calculations, filtering and rendering
- **Chart.js** — category and time-series visualizations
- **Local Storage** — browser-side persistence
- **Node.js test runner** — automated smoke tests
- **GitHub Actions** — continuous testing on pushes and pull requests
- **Git/GitHub** — version control and portfolio workflow

## Project structure

```text
finsight/
├── assets/
├── tests/
│   └── smoke.test.js
├── .github/workflows/
│   └── test.yml
├── index.html
├── style.css
├── script.js
├── fixes.js
├── package.json
├── README.md
└── LICENSE
```

## Run locally

No frontend build system is required.

1. Clone the repository.
2. Open the project folder.
3. Run `npm test` to execute the automated smoke tests.
4. Open `index.html` in a modern browser.

The Chart.js library is loaded through a CDN, so an internet connection is recommended when running the dashboard.

## Data and privacy

FinSight currently stores transactions only in the browser's Local Storage. No backend database or authentication is included in this version. Clearing the browser's site data can remove stored transactions.

When upgrading from the original FinSight version, legacy expense records are migrated into the new transaction model. Because the old schema did not contain dates, migrated records receive the current local date rather than an invented historical date.

## Limitations

- The analytics are based only on the transactions entered by the user.
- The anomaly detector is a simple statistical heuristic and needs a larger dataset for stronger signals.
- The monthly goal is a spending threshold, not a complete budgeting system.
- Local Storage is suitable for this learning project but is not a replacement for a secure production database.

## Roadmap

Possible future versions could add:

- CSV import/export
- More robust monthly/yearly reports
- Recurring transactions
- Backend API and database storage
- Authentication
- More advanced forecasting and anomaly detection
- Deployment with a production data layer

## Learning outcomes

This project demonstrates practical experience with:

- Data modeling in JavaScript
- CRUD operations
- Aggregation and derived metrics
- Statistical reasoning
- Data visualization
- Client-side persistence and migration
- Responsive interface design
- Automated testing and CI
- Git branching and incremental feature development

## Author

**Riya Sharma**  
B.Sc. Data Science

GitHub: https://github.com/riya-sharma-01
