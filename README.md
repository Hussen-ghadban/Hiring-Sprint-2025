# 🚗 AI-Powered Vehicle Damage Detection

This project contains two main folders:

- frontend — React + Vite
- backend — Express.js

The system allows you to upload two images of a vehicle, sends each image to a Roboflow model to detect damages, then compares both responses. A static price is assigned to each detected class, and the total repair cost is calculated based on these detections.

---

## 📂 Project Structure

root  
│── frontend/   → React + Vite client  
│── backend/    → Express.js server  

---

## 🚀 How to Run the Project

### 1️⃣ Frontend (React + Vite)

cd frontend  
yarn install  
yarn dev  

### 2️⃣ Backend (Express.js)

cd backend  
yarn install  
yarn dev  

---

## ⚙️ How the System Works

1. The frontend allows the user to upload two vehicle images:
   - One image from the pickup
   - One from the return

2. The backend receives both images and sends them to the Roboflow API for damage detection.

3. The API returns a list of detected damage classes for each image.

4. Each class has a fixed static price in the backend.

5. The backend compares both images:
   - Detects new damages
   - Calculates repair cost based on damage types
   - Returns a structured result to the frontend

6. The frontend displays:
   - Results for both images
   - New damages
   - Estimated repair cost

---

## 🧠 Tech Stack

### Frontend
- React
- Vite
- Axios

### Backend
- Node.js
- Express.js
- Roboflow API integration

---

## 📝 Notes

- The backend expects two images per request.
- cost calculation are static based on predefined price mappings.
- The project is designed as a prototype for the Hiring Sprint.

---

## 📄 Deployment
- Backend → Render  
- Frontend → Vercel

---
