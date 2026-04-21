
# Finomic - Financial Assistant Dashboardtest

  

**CISC3003 Web Programming - Group 03**

  

A comprehensive financial tracking application built with vanilla HTML, CSS, and JavaScript, powered by Firebase Authentication and Vite.

  

## 📁 Project Structure

  

```
PROJECT/
├── public/
│ ├── index.html # Entry point (redirects to login/dashboard)
│ ├── login.html # Login page
│ ├── signup.html # Sign up page
│ ├── forgot-password.html # Forgot password page
│ ├── reset-password.html # Reset password page
│ ├── dashboard.html # Main dashboard
│ ├── transactions.html # Transaction management
│ ├── categories.html # Category insights
│ ├── reports.html # Financial reports
│ ├── help.html # Help & tips page
│ ├── css/
│ │ ├── global.css # Global shared styles
│ │ ├── auth.css # Authentication page styles
│ │ ├── app-layout.css # App layout & sidebar styles
│ │ ├── dashboard.css # Dashboard-specific styles
│ │ ├── transactions.css # Transactions page styles
│ │ ├── categories.css # Categories page styles
│ │ ├── reports.css # Reports page styles
│ │ └── help.css # Help page styles
│ ├── js/
│ │ ├── firebase/
│ │ │ ├── config.js # Firebase configuration (uses .env)
│ │ │ └── auth.js # Firebase authentication functions
│ │ ├── modules/
│ │ │ ├── helpers.js # Utility functions (formatCurrency, formatDate)
│ │ │ ├── state.js # Application state management
│ │ │ └── transactions.js # Transaction CRUD operations
│ │ ├── pages/
│ │ │ ├── auth-guard.js # Route protection
│ │ │ ├── login.js # Login page logic
│ │ │ ├── signup.js # Signup page logic
│ │ │ ├── forgot-password.js # Forgot password logic
│ │ │ ├── reset-password.js # Password reset logic
│ │ │ ├── dashboard.js # Dashboard page logic
│ │ │ ├── transactions.js # Transactions page logic
│ │ │ ├── categories.js # Categories page logic
│ │ │ ├── reports.js # Reports page logic
│ │ │ ├── sidebar.js # Sidebar component & navigation
```

## 🚀 Getting Started (For Developers)

  

### Prerequisites

  

- Node.js (v16 or higher)

- npm (comes with Node.js)

  

### Installation

  

1.  **Clone the repository**

  

```bash

git  clone  https://github.com/your-repo/CISC3003-GROUP03-Project.git
cd  CISC3003-GROUP03-Project

```

  

2.  **Install dependencies**

  

```bash

npm  install

```

3.  **Set up environment variables**

  

Copy the example environment file and add your Firebase credentials:

  

```bash

cp  .env.example  .env

```

  

Edit `.env` and fill in your Firebase project credentials:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

⚠️ **Important**: Never commit the .env file to version control. It's already ignored via .gitignore.


4.  **Run the development server**

```bash

npm  run  dev

```

5.  **Open your browser**

  

Navigate to `http://localhost:5173`

## 🔧 Tech Stack
| Technology  | Purpose |
|--|--|
| **Vite**   |Build tool and development server  |
|**Firebase Auth** | User authentication (email/password, email verification, password reset) |
| **HTML5 + CSS3**   | Structure and styling (vanilla, no frameworks)|
| **JavaScript (ES6)**| Application logic (modular ES modules)|
| **localStorage**| Data persistence (transactions) |
  
 
## 🔐 Environment Variables

  
| Variable | Description |
|--|--|
|  `VITE_FIREBASE_API_KEY`  | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN`  | Firebase authentication domain |
|  `VITE_FIREBASE_PROJECT_ID`  | Firebase project ID |
|  `VITE_FIREBASE_STORAGE_BUCKET`  | Firebase storage bucket |
|  `VITE_FIREBASE_MESSAGING_SENDER_ID`  | Firebase messaging sender ID |
|  `VITE_FIREBASE_APP_ID`  | Firebase app ID |
|  `VITE_FIREBASE_MEASUREMENT_ID`  | Firebase measurement ID |


  

## ✨ Features

  

### Authentication (Firebase)

- User signup with email verification

- User login

- Forgot password / password reset via email

- Protected routes (auth-guard)

- User profile (displayName stored in Firebase)

  

### Dashboard

- Total balance overview

- Income and expense tracking

- Financial health indicators (savings rate, expense ratio)

- Recent transactions list

  

### Transaction Management

- Add, view, and delete transactions

- Search and filter by type, category, or description

- Categorized by income/expense

  

### Category Insights

- Expense and income breakdown by category

- Visual progress bars

- Top spending categories

- Category averages

  

### Financial Reports

- Monthly trend visualization (bar chart)

- Monthly breakdown table

- Net savings calculation

- Monthly savings rate

  

### Help & Tips

- Financial best practices (50/30/20 rule)

- App usage instructions

- Savings tips

  

## 📱 Responsive Design

  

| Breakpoint | Layout |
|------------|--------|
| < 768px | Mobile (collapsible sidebar, touch-friendly) |
| ≥ 768px | Desktop (full sidebar, multi-column layouts) |

  

## 🗄️ Data Persistence

  
Currently using `localStorage` for transaction data:

- Key: `finomic_transactions`

- Future: Will migrate to Firebase Firestore

  

## 👥 Team Members

  

- Tatiana Muniz Rodriguez

- Diogo Barros

- LIN CHO KIO, Diana

- Effy

- Edith

  

## 📚 Course Information

  

| Field | Value |
|-------|-------|
|  **Course**  | CISC3003 Web Programming |
|  **Group**  | 03 |
|  **Year**  | 2026 |

  
## ✅ Course Requirements Met

  
-  [x] Full-stack authentication (signup, login, email verification, password reset)

-  [x] Responsive design (mobile + desktop)

-  [x] Search and filter functionality

-  [x] Data persistence

-  [x] Clean, modular file structure

-  [x] Modern UI/UX design

-  [x] Vanilla JavaScript (no frameworks)

-  [x] Environment variables for sensitive data

-  [x] Ready for deployment

  
## 📝 Notes for Contributors


1.  **Always work on a feature branch** before merging to main

2.  **Never commit `.env`** - it contains sensitive credentials

3.  **Run `npm run dev`** to test locally before pushing

4.  **Follow ES6 module patterns** - imports/exports are required

5.  **Keep Firebase logic in `js/firebase/`** - separate from UI logic
