# 🏠 Property Chat

An interactive real-estate platform that lets users explore, chat, and analyze property data in real-time.
Built with **Next.js**, **Node.js**, and integrated APIs for property listings and insights.

---

## 📁 Project Structure

```
property-chat/
│
├── /data/                → contains sample dataset (sample.csv)
├── /pages/               → frontend routes (Next.js)
├── /api/                 → backend API routes
├── /components/          → reusable UI components
├── package.json          → dependencies & scripts
├── .env.example          → template for environment variables
├── README.md             → setup & usage guide
└── .gitignore            → ignored build and env files
```

---

## ⚙️ Tech Stack

* **Frontend:** Next.js (React + TailwindCSS)
* **Backend:** Node.js / Express (via Next.js API routes)
* **Database:** Optional (MongoDB / Firebase / Local CSV)
* **Deployment:** Vercel
* **Version Control:** Git + GitHub

---

## 📊 Sample Data

You can find a small sample dataset inside `/data/sample.csv`.
This file helps test CSV reading and backend parsing features.

Example:

```csv
id,property_name,price,location
1,Sunshine Residency,9500000,Mumbai
2,Lake View Apartments,8500000,Pune
3,Green Valley Homes,7200000,Nashik
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/property-chat.git
cd property-chat
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

Copy the example file and update values as needed:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual keys (don’t commit it):

```
NEXT_PUBLIC_API_URL=https://your-api-url.com
DATABASE_URL=mongodb+srv://...
```

### 4. Run locally

```bash
npm run dev
```

This starts the development server at [http://localhost:3000](http://localhost:3000).

---

## 🧱 Build for production

```bash
npm run build
npm start
```

---

## 🌐 Live Demo

Live link (deployed on Vercel):
👉 [https://property-chat-five.vercel.app/](https://property-chat-five.vercel.app/)

---

## 🧩 Notes

* Do **not** commit `.env.local` (keep secrets private).
* `.env.example` is provided as a template.
* The `/data/` folder includes a sample CSV for testing.
* The repo is cleaned up (no `node_modules` or `.next` folders).

---

## 💡 Example Commands

| Purpose                 | Command         |
| ----------------------- | --------------- |
| Start dev server        | `npm run dev`   |
| Build for production    | `npm run build` |
| Start production server | `npm start`     |
| Format code             | `npm run lint`  |

---

## 🏁 End Notes

This project demonstrates a clean full-stack setup with Next.js + Node.js, environment-based configuration, and a structured data flow.
For any issues or suggestions, feel free to open a pull request or report them in GitHub Issues.

---
