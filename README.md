# RaktRakshak

**RaktRakshak – Connecting Donors with Lives in Need**

RaktRakshak is a full-stack **Digital Blood Bank Management System** designed to connect blood donors with patients and hospitals during emergencies. The platform allows donors to register, recipients to request blood, and administrators to manage requests efficiently.

The goal of this project is to reduce the time required to find compatible blood donors and make blood donation more accessible using modern web technologies.

---

# Features

### Donor

* Register as a blood donor
* Provide blood group, city, and contact details
* View active blood requests
* Be discoverable through donor search

### Recipient

* Search donors by blood group
* Create blood requests for patients
* Contact available donors

### Admin

* View all registered donors
* Monitor blood requests
* Update request status (Pending → Fulfilled)
* Manage the system

---

# Tech Stack

### Frontend

* React

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas

### Tools

* Git & GitHub
* Postman (API testing)
* Morgan (API logging)
* Nodemon (development server)

---

# Project Architecture

```
RaktRakshak
│
├── client                # React Frontend
│
├── server                # Node.js Backend
│   │
│   ├── config
│   │   └── db.js
│   │
│   ├── controllers
│   │   ├── userController.js
│   │   ├── requestController.js
│   │   └── authController.js
│   │
│   ├── middleware
│   │   └── errorMiddleware.js
│   │
│   ├── models
│   │   ├── User.js
│   │   └── Request.js
│   │
│   ├── routes
│   │   ├── userRoutes.js
│   │   ├── requestRoutes.js
│   │   └── authRoutes.js
│   │
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── README.md
└── .gitignore
```

---

# API Endpoints

## User APIs

Register User

POST /api/users/register

Example Request

```
{
  "name": "Tejas",
  "bloodGroup": "O+",
  "phone": "9876543210",
  "city": "Pune",
  "role": "donor"
}
```

---

Get All Donors

GET /api/users/donors

---

Find Donors by Blood Group

GET /api/users/blood/:group

Example

```
GET /api/users/blood/O+
```

---

# Blood Request APIs

Create Blood Request

POST /api/requests

Example Request

```
{
  "patientName": "Rahul",
  "bloodGroup": "O+",
  "hospital": "Pune City Hospital",
  "city": "Pune",
  "contact": "9876543210"
}
```

---

Get All Requests

GET /api/requests

---

Update Request Status

PUT /api/requests/:id

Used by admin to mark a request as **fulfilled**.

---

# Authentication

Login User

POST /api/auth/login

Example Request

```
{
  "phone": "9876543210"
}
---

# Installation

Clone the repository

```
git clone https://github.com/TEJAS-PARKAR/digital-blood-bank.git
```

Move into the project

```
cd digital-blood-bank
```

---

## Backend Setup

Navigate to server folder

```
cd server
```

Install dependencies

```
npm install
```

Create `.env` file

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Start backend server

```
npm run dev
```

Server will run on

```
http://localhost:5000
```

---

## Frontend Setup

Navigate to client folder

```
cd client
```

Install dependencies

```
npm install
```

Run frontend

```
npm run dev
```

Frontend runs on

```
http://localhost:5173
```

---

# Future Improvements

* Google Authentication
* Admin dashboard UI
* Donor availability status
* Location-based donor search
* Email / SMS notifications
* Deployment on AWS

---

# Author

**Tejas Parkar**

GitHub
https://github.com/TEJAS-PARKAR

---
