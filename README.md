# 🎯 VenueKart — Venue Booking Web Application

VenueKart is a **full-stack venue booking platform** that allows users to search, view, and book venues, while giving venue owners an easy way to list and manage their properties.  
Built with **React + Tailwind CSS + Vite** on the frontend and **Node.js + Express** on the backend, VenueKart delivers a sleek, modern, and responsive experience.

---

## 📌 Table of Contents
1. [Overview](#-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Installation & Setup](#-installation--setup)
5. [Project Structure](#-project-structure)
6. [Usage Guide](#-usage-guide)
7. [Deployment](#-deployment)
8. [Contributing](#-contributing)
9. [License](#-license)

---

## 📖 Overview
VenueKart bridges the gap between **venue owners** and **event planners**. Whether you are hosting a wedding, corporate meeting, or private party, VenueKart lets you **discover the perfect location** with ease.  
On the other side, venue owners get tools to **list, edit, and manage** their venues efficiently.

---

## ✨ Features

### 🛒 User Features
- Browse venues with filters (location, price, amenities, etc.)
- View detailed venue pages with images & descriptions
- Contact venue owners directly
- Book venues securely

### 🏢 Venue Owner Features
- Sign up & sign in securely
- Add, edit, or remove venue listings
- Upload venue images
- Track booking requests

### 🛠 Technical Features
- **Responsive UI** (Mobile, Tablet, Desktop)
- **Authentication & Authorization**
- **Reusable UI Components** (Shadcn/UI & Tailwind)
- **API-based architecture** for scalable backend
- **Netlify Deployment** ready (`netlify.toml` included)

---

## 🖥 Tech Stack

**Frontend**
- React.js
- Tailwind CSS
- Vite
- Shadcn/UI components

**Backend**
- Node.js
- Express.js

**Other Tools**
- Netlify (Frontend hosting)
- REST API for data exchange
- Context API for global state management
- PostCSS for CSS processing

---

## ⚙ Installation & Setup

> **Prerequisites:**  
> - Node.js ≥ 16  
> - npm or yarn

```bash
# 1️⃣ Clone the repository
git clone https://github.com/yourusername/venuekart.git
cd venuekart/VenueKart

# 2️⃣ Install dependencies
npm install

# 3️⃣ Start the development server
npm run dev

# 4️⃣ Start backend server
cd server
npm install
node index.js
```

---

## 📂 Project Structure

```
VenueKart/
│
├── client/                # React frontend
│   ├── components/         # Reusable UI components
│   ├── contexts/           # Context API (Auth management)
│   ├── pages/              # Page-level components
│   ├── global.css          # Global styles
│   └── App.jsx             # App entry
│
├── server/                 # Node.js backend
│   ├── routes/             # API route handlers
│   ├── index.js             # Main server file
│   └── node-build.js        # Build script
│
├── public/                 # Static assets
├── package.json            # Dependencies & scripts
├── netlify.toml            # Netlify config
└── tailwind.config.js      # Tailwind setup
```

---

## 🚀 Usage Guide

### For Users
1. Open VenueKart in your browser
2. Browse venues using search and filters
3. Click a venue to view details
4. Contact or book directly

### For Venue Owners
1. Create an account
2. Navigate to the dashboard
3. Add a venue with details & images
4. Manage bookings

---

## 🌐 Deployment

**Frontend (Netlify)**
```bash
npm run build
# Deploy the /dist folder to Netlify
```

**Backend**
- Deploy on services like Render, Railway, or Heroku
- Update API base URLs in frontend `.env`

---

## 🤝 Contributing
We welcome contributions!  
1. Fork the repo
2. Create a new branch (`feature/awesome-feature`)
3. Commit changes
4. Submit a pull request

---

## 📜 License
This project is licensed under the **MIT License** — feel free to use and modify.

---

## 📧 Contact
For queries or support, email: **info@venuekart.in**
