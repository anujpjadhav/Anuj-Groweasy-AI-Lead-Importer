# GrowEasy AI CSV Importer & Map Engine

An intelligent, AI-powered CSV importer built for **GrowEasy** that extracts CRM lead information from arbitrary CSV file layouts and mapping structures.

This repository implements a highly optimized web interface designed to handle messy data, parse columns client-side without locking the UI thread, and audit records before and after mapping.

---

## 🚀 Submission details

*   **Position:** Software Developer (Intern / Full-Time)
*   **Hosted Application URL:** https://anuj-groweasy-ai-lead-importer-fxb36sty0.vercel.app/
*   **GitHub Repository URL:** https://github.com/anujpjadhav/Anuj-Groweasy-AI-Lead-Importer
*   **Submission Date:** July 12, 2026
*   **Recipient:** varun@groweasy.ai

---

## 📋 Assignment Overview

The primary goal is to build a CSV Importer that intelligently extracts CRM lead information from any valid CSV format.
The challenge is allowing users to upload CSVs with completely different column names, layouts, and structures, while the system accurately maps and extracts the required CRM fields using AI. 

This layout-agnostic processing allows seamless integration with:
*   Facebook Lead Exports
*   Google Ads Exports
*   Excel Sheets
*   Real Estate CRM exports
*   Sales reports & Marketing agency CSVs
*   Manually created spreadsheets

---

## 🛠️ Tech Stack & Architecture

*   **Frontend:** Next.js (App Router, Turbopack enabled)
*   **Styling:** Vanilla CSS & Tailwind CSS v4 (CSS-first variables setup)
*   **UI Components:** Base UI (`@base-ui/react`), Lucide React icons
*   **CSV Parsing:** PapaParse (Worker-enabled)
*   **Virtual List Rendering:** `@tanstack/react-virtual`
*   **State Management:** Client React hooks (Stateless orchestration)

---

## ⚙️ Getting Started & Local Setup

### Prerequisites
*   Node.js (v18.x or later recommended)
*   npm (v9.x or later)

### Steps to Run

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/anujpjadhav/Anuj-Groweasy-AI-Lead-Importer.git
    cd Anuj-Groweasy-AI-Lead-Importer
    ```

2.  **Navigate to the Frontend Directory:**
    ```bash
    cd frontend
    ```

3.  **Install Dependencies:**
    Run the installer with `--ignore-scripts` to bypass native compilation hooks:
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

## ⚙️ Functional Requirements

The application separates parsing concerns to ensure performance, responsiveness, and AI correctness:

### Frontend Flow

*   **Step 1 — Upload CSV:** Allow users to drag-and-drop or select any valid CSV file (up to 5MB limit).
*   **Step 2 — Preview:** Parsed asynchronously in a background Web Worker. It renders rows dynamically using virtualized views, keeping the UI completely responsive. Headers remain sticky. **No AI processing occurs at this stage.**
*   **Step 3 — Confirm Import:** A dedicated "Confirm Import" button starts the mapping.
*   **Step 4 — Display Parsed Result:** The backend maps headers and rows into structured GrowEasy CRM records. The UI audits these records, showing totals, mapped/skipped counts, status indicators, text searching, and filter tabs.

---

## 📁 CRM Field Schema

The AI maps and extracts the following fields into the CRM layout:

| Field | Description |
| :--- | :--- |
| `created_at` | Lead creation date |
| `name` | Lead name |
| `email` | Primary email |
| `country_code` | Country code |
| `mobile_without_country_code` | Mobile number |
| `company` | Company name |
| `city` | City |
| `state` | State |
| `country` | Country |
| `lead_owner` | Lead owner |
| `crm_status` | Lead status |
| `crm_note` | Notes / Remarks |
| `data_source` | Source |
| `possession_time` | Property possession time |
| `description` | Additional description |

---

## 🧠 AI Instructions & Formatting Rules

The extraction follows strict logical checks to ensure database compatibility:

1.  **Allowed CRM Status Values:**
    Must match one of:
    *   `GOOD_LEAD_FOLLOW_UP`
    *   `DID_NOT_CONNECT`
    *   `BAD_LEAD`
    *   `SALE_DONE`
2.  **Allowed Data Source Values:**
    Must match one of:
    *   `leads_on_demand`
    *   `meridian_tower`
    *   `eden_park`
    *   `varah_swamy`
    *   `sarjapur_plots`
    *(If none match confidently, this is left blank)*
3.  **Date Format:**
    `created_at` must be convertible using JavaScript: `new Date(created_at)`.
4.  **CRM Notes:**
    `crm_note` aggregates remarks, follow-ups, extra phone numbers, extra email addresses, and general overflow values.
5.  **Multiple Email / Mobile Numbers:**
    *   **Emails:** Use the first email. Append remaining emails into `crm_note`.
    *   **Mobile Numbers:** Use the first mobile number. Append remaining mobile numbers into `crm_note`.
6.  **CSV Compatibility:**
    Each record remains a single CSV row (no raw line breaks; line breaks are escaped as `\n`).
7.  **Skip Invalid Records:**
    If a record contains **neither** an email **nor** a mobile number, it is skipped.

---

## 💎 Bonus Points Completed

- [x] **Drag & Drop Upload:** Built-in dropzone with type validation.
- [x] **Progress Indicators:** Simulated batch progress panel for contact extraction.
- [x] **Virtualized Table:** `@tanstack/react-virtual` handles long spreadsheets efficiently.
- [x] **Dark Mode:** Class-based theme toggling supported via Tailwind CSS v4 variables.
- [x] **Well-written README:** Comprehensive documentation for setup and review.
