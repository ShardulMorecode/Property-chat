# 🏠 Property Chat Assistant – AI Engineer Intern Task (NoBrokerage.com)

A **smart property search chat interface** that helps users find properties and projects using **natural language queries** like:

> “3BHK flat in Pune under ₹1.2 Cr”

and responds with:
1. A **short, data-grounded summary**, and  
2. A list of **relevant property/project cards** retrieved from the database.

---

##🚀 Live Demo
**Live Website:** [https://property-chat.vercel.app](https://property-chat-five.vercel.app/) 
**GitHub Repository:** [https://github.com/your-username/property-chat](https://github.com/ShardulMorecode/Property-chat.git) 
**Demo:** [https://drive.google.com/file/](https://drive.google.com/file/d/1-TBZfmCcD-IKToPqH3sqQjmrD2yDZK4g/view?usp=sharing)

---

## 🧠 Overview

This project was built as part of the **AI Engineer Internship Task** at **NoBrokerage.com**.

It replaces the use of AI APIs with a **rule-based NLP parser** that extracts filters (like BHK, city, price, locality, etc.) from the user's message. The backend then queries **Supabase (PostgreSQL)** to fetch matching projects and generates a **summary directly from data**, ensuring no hallucinations or external dependencies.

---

## 🧩 Core Features

### 🗣️ 1. Natural Language Query Understanding
- Parses user queries to extract:
  - **City:** e.g., Pune, Mumbai  
  - **BHK:** e.g., 1BHK, 2BHK, 3BHK  
  - **Budget:** e.g., under ₹1.2 Cr  
  - **Readiness:** Ready-to-Move / Under Construction  
  - **Locality / Area:** e.g., Baner, Wakad, Chembur  
  - **Project Name:** optional (e.g., “Project Gurukripa”)

Parsing is done using **regex and rule-based logic**, with **slug-based locality inference** from project data.

---

### 🔍 2. Search & Retrieval (Supabase Database)
- Four related tables are used:
  - `projects`
  - `project_addresses`
  - `project_configurations`
  - `project_variants`

- The backend filters data based on extracted query parameters and locality matching (using `slug` parsing).

---

### 🧾 3. Summary Generation
- Summaries are automatically created **from CSV/DB data only**.  
- Example:

> “Found 9 properties in Mumbai around Chembur. Price range ₹1.1 Cr – ₹3.3 Cr. BHK types available: 1BHK, 2BHK, 3BHK.”

- If no data matches:

> “No 3BHK properties found under ₹1.2 Cr in Baner. Try adjusting filters.”

---

### 🏗️ 4. Frontend – Chat Interface
- Built with **Next.js 14 (App Router)**  
- Chat interface styled similar to modern AI chat UIs.  
- Displays:
  - User queries
  - Model responses
  - Property cards with:
    - Title  
    - City + Locality  
    - Price range  
    - BHK Type  
    - Project status  
    - Quick “View Details” link

---

### 💾 5. Data
Sample data is stored in `/data/`:

- `project.csv`  
- `ProjectAddress.csv`  
- `ProjectConfiguration.csv`  
- `ProjectConfigurationVariant.csv`

All data was imported into Supabase (PostgreSQL) for querying.

---

## ⚙️ Tech Stack

| Layer | Technology |
| ------ | ----------- |
| **Frontend** | Next.js (React + TypeScript) |
| **Backend** | Next.js API Routes |
| **Database** | Supabase (PostgreSQL) |
| **ORM / SDK** | Supabase JS Client |
| **NLP Parsing** | Regex-based filter extraction |
| **Hosting** | Vercel |

---

## 🧱 Folder Structure
property-chat/
├── src/
│ ├── app/
│ │ └── api/
│ │ └── chat/route.ts # Chat API (core logic)
│ ├── lib/
│ │ ├── queryParser.ts # NLP for extracting filters (city, BHK, price, etc.)
│ │ ├── search.ts # Supabase property retrieval logic
│ │ ├── summaryGenerator.ts # Data-grounded summary generator
│ │ ├── supabase.ts # Supabase client setup
│ │ └── utils.ts # Helper utilities
│ ├── components/ # React components (chat UI)
│ └── styles/ # Styling and CSS
├── public/ # Static assets
├── data/
│ └── projects.csv # Sample project dataset
├── .env.example # Environment variable sample
├── next.config.js # Next.js configuration
├── package.json
├── tsconfig.json
└── README.md

##🧠 How It Works

User Query → ("3BHK in Pune under 1 Cr near Baner")

NLP Parser → Extracts { city: 'Pune', bhk: '3', maxPrice: 100, locality: 'Baner' }

Supabase Search → Filters projects based on parsed data

Slug Parser → Extracts structured info from project slugs like luxury-ashwini-ashoknagar-chembur-mumbai-675058

Summary Generator → Crafts a grounded response

Response Returned → Sent to frontend chat interface

##🧰 Setup Guide
#1️⃣ Clone the Repository
git clone https://github.com/YOUR_USERNAME/property-chat.git
cd property-chat
#2️⃣ Install Dependencies
npm install
#3️⃣ Setup Environment Variables

Create a .env file and add:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

(Refer to .env.example)

#4️⃣ Run Locally
npm run dev

App runs at: http://localhost:3000

Built with ❤️ using Next.js, Supabase, and pure logic — no external AI APIs.
