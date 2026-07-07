# GrowEasy AI CSV Importer & Map Engine

An intelligent, AI-powered CSV importer built for **GrowEasy** that extracts CRM lead information from arbitrary CSV file layouts and mapping structures.

This repository implements a highly optimized web interface designed to handle messy data, parse columns client-side without locking the UI thread, and audit records before and after mapping.

---

## 🚀 Submission Details

*   **Position:** Software Developer (Intern / Full-Time)
*   **Hosted Application URL:** `[Insert your deployment URL here]`
*   **GitHub Repository URL:** `[Insert your public GitHub repository URL here]`
*   **Submission Date:** July 12, 2026
*   **Recipient:** varun@groweasy.ai

---

## 🌟 Key Features Implemented

### Frontend Architecture (Next.js 16 + Tailwind CSS v4)
*   **Step 1: Drag & Drop / File Picker Upload Zone:** Supports drag-and-drop or manual selection of CSV files with rigid validation (up to 5MB size limit).
*   **Step 2: Client-side Preview Table:** 
    *   **High Performance:** Parsed asynchronously in a background Web Worker using **PapaParse** to avoid blocking the main JS execution thread.
    *   **Virtualized Rendering:** Designed using `@tanstack/react-virtual` to display large lists smoothly with sticky table headers and responsive column offsets.
    *   **No Early AI Processing:** Ensures that files are only previewed and analyzed locally before sending any backend payload.
*   **Step 3: Interactive Ingestion Progress:** Provides user-controlled ingestion triggers and displays batch completion progress animations.
*   **Step 4: Mapping Audit Report:** 
    *   **Dynamic Search:** Filters records instantly by name, email, or skip reasons.
    *   **Status Tabs:** Segment imported contacts into tabs (All / Mapped / Skipped).
    *   **Stacked Lead Info:** Supports rendering multiple email addresses (split dynamically and stacked vertically).
    *   **Vertical Mapping Details:** Displays extracted attributes (e.g. data source and crm status) inside badge pills, preventing overflow collision in tables.
*   **Responsive Theme System:** Uses `next-themes` and a Base UI dropdown to toggle seamlessly between Light, Dark, and System modes with a robust hydration mount guard.

---

## 📂 Project Structure

```text
Assignment/
├── frontend/                     # Next.js Frontend
│   ├── app/
│   │   ├── globals.css           # Tailwind CSS v4 directives & theme variables
│   │   ├── layout.tsx            # Global layout wrapper with theme provider
│   │   └── page.tsx              # Main state orchestrator page
│   ├── components/
│   │   ├── ThemeToggle.tsx       # Theme toggle menu with hydration guard
│   │   ├── UploadZone.tsx        # Drag & drop upload handler
│   │   ├── CSVPreviewTable.tsx   # Virtualized CSV viewer
│   │   ├── ProgressPanel.tsx     # Ingest process tracker
│   │   ├── SummaryStats.tsx      # Evaluated/Mapped metric summaries
│   │   └── ResultsTable.tsx      # Detailed CRM mappings view
│   ├── hooks/
│   │   └── useCsvImport.ts       # CSV orchestration hook & logic rules
│   ├── lib/
│   │   ├── parseCsvClient.ts     # Asynchronous worker parser
│   │   ├── types.ts              # TS interfaces & schemas
│   │   └── utils.ts              # cn merger utility
│   ├── package.json              # Client packages and build scripts
│   └── tsconfig.json             # TypeScript configuration
├── sample.csv                    # Messy CSV test file for import validation
└── README.md                     # Setup instructions & project notes
```

---

## 🛠️ Tech Stack

*   **Framework:** Next.js (App Router, Turbopack enabled)
*   **Styling:** Tailwind CSS v4 (CSS-first variables configuration)
*   **UI Components:** Base UI (`@base-ui/react`), Lucide React icons
*   **CSV Parsing:** PapaParse (Worker-enabled)
*   **Virtual List:** `@tanstack/react-virtual`
*   **State Management:** React hooks / Stateless orchestration

---

## ⚙️ Getting Started & Local Setup

### Prerequisites
*   Node.js (v18.x or later recommended)
*   npm (v9.x or later)

### Steps to Run

1.  **Clone the Repository:**
    ```bash
    git clone <your-repository-url>
    cd Assignment
    ```

2.  **Navigate to the Frontend Directory:**
    ```bash
    cd frontend
    ```

3.  **Install Dependencies:**
    Run the installer with `--ignore-scripts` to prevent postinstall hooks from interfering:
    ```bash
    npm install --ignore-scripts
    ```

4.  **Start the Development Server:**
    ```bash
    npm run dev
    ```
    The frontend will start running locally at: **`http://localhost:3000`**

5.  **Build and Validate Production Build:**
    Ensure compilation and typechecks pass cleanly:
    ```bash
    npm run build
    ```

---

## 🧪 Validation & Sample CSV

The codebase includes a pre-packaged [sample.csv](file:///c:/Users/Admin/Desktop/Assignment/sample.csv) file that can be uploaded to verify the ingestion engine rules:
*   **Rahul Mohammad:** Extracted into a `MAPPED` row.
*   **Jane Doe:** Extracted into a `MAPPED` row.
*   **Row 4 (Empty Contact):** Lacks both email and mobile number, and is correctly processed as a `SKIPPED` record.
*   **Double Contact:** Contains multiple emails (`double@test.com;another@test.com`), demonstrating vertical stacking in the contact details view.
