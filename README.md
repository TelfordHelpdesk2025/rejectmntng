# 📘 Project Setup Guide

A quickstart guide to install and run the application locally.

---

## 📦 Install Dependencies

### 1. Composer

```bash
composer install
```

### 2. NPM

```bash
npm install
```

### 3. laravel excel

```bash
composer require "maatwebsite/excel:^3.1"
```

### 4. laravel pdf

````bash
composer require barryvdh/laravel-dompdf
composer npm install recharts
composer npm install jspdf dom-to-image
composer npm install dom-to-image-more
composer npm install jspdf jspdf-autotable
composer composer require guzzlehttp/guzzle

---

## ⚙️ Environment Setup

Copy the example environment file and set the required variables (duplicate and rename or by terminal):

```bash
cp .env.example .env
````

Then generate the application key:

```bash
php artisan key:generate
```

---

## 🗃️ Database

Make sure the following table exists in your database:

-   `admin`

Note: locate the System_Tables.sql from the root level of the template and copy and create the admin table in your database

---

## ✅ Done

You’re now ready to start the application!

```bash
composer run dev
```

---
