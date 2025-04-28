# RentSync

> **Smart Rental Management for Vacation Hosts**  
> Manage bookings, guests and revenue—all in one place.

---

## 🏷️ One-Line Pitch

**RentSync** is a React/Tailwind web app that helps small property owners streamline bookings, guest info, and revenue tracking with minimal effort.

---

## 🎯 Problem & Solution

**Problem:**  
Small vacation-rental hosts often juggle spreadsheets, email threads and calendar reminders to track bookings, guest details and payments. This manual work leads to double-bookings, missed communications, and lost revenue.

**Solution:**  
RentSync centralizes all rental operations in one dashboard—integrating a calendar view, guest database, automated email notifications, and revenue statistics—so hosts can focus on providing great stays instead of managing logistics.

---

## 🚀 Key Features

- **Authentication** (Signup / Login) via Supabase  
- **Dashboard** with sidebar navigation (Bookings, Guests, Statistics, Logout)  
- **Bookings**  
  - Calendar view  
  - Table view (Guest, Check-in, Check-out, Price, Notes)  
  - Add / Edit / Delete bookings  
- **Guests**  
  - CRUD for guest records (Name, Email, Phone, Notes)  
- **Statistics**  
  - Total bookings count  
  - Total revenue calculation  
- **Email Notifications** on new bookings using EmailJS  
- **Responsive** design with Tailwind CSS (blue-white-gray palette)

---

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS, Vite  
- **Backend:** Supabase (Auth & PostgreSQL)  
- **Notifications:** EmailJS  
- **Deployment:** Vercel (or Netlify)

---

## 📦 Setup & Installation

1. Clone repo  
   ```bash
   git clone https://github.com/FurtulaIgor/RentSync.git
   cd RentSync
