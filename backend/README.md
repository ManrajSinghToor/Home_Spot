# HomeSpot Java Spring Boot Backend API

Production-ready Java Spring Boot backend for the **HomeSpot 3D Rental Platform**, built with **Spring Boot 3.3**, **Spring Data MongoDB**, **Spring Security**, and **JWT Authentication**.

---

## Features & Highlights
- **100% API Parity**: Full feature parity with the previous Node.js Express backend.
- **MongoDB Atlas Integration**: Direct connection to MongoDB Atlas with auto-seeding.
- **BCrypt Compatibility**: Seamless user login for existing database accounts.
- **Stateless JWT Security**: Secure authorization via Bearer JWT tokens.
- **Auto Sold/Rented Cascade**: Automatic property status update and competing booking cancellation notifications.
- **Docker & Cloud Ready**: Production containerization with Dockerfile included.

---

## Local Development Setup

### Prerequisites
- **Java 17+ or 21**
- **Apache Maven 3.9+** (or use workspace Maven `./apache-maven-3.9.9/bin/mvn`)

### Run Locally
```bash
cd backend
../apache-maven-3.9.9/bin/mvn spring-boot:run
```
The server will start on `http://localhost:5001`.

### Build Executable JAR
```bash
cd backend
../apache-maven-3.9.9/bin/mvn clean package -DskipTests
java -jar target/homespot-backend-1.0.0.jar
```

---

## Cloud Deployment Guide

### Deployment Options:

#### 1. Deployment via Render / Railway (Docker Support)
1. Push your changes to your GitHub repository (`ManrajSinghToor/Home_Spot`).
2. In **Render** or **Railway**, create a new **Web Service**.
3. Select **Docker** as the Environment / Build Type.
4. Set Environment Variables:
   - `PORT`: `5001` (or let Render dynamically bind port)
   - `MONGODB_URI`: `mongodb+srv://manrajtoorsingh_db_user:Manrajtoor22@cluster0.ezmbhek.mongodb.net/homespot?appName=Cluster0`
   - `JWT_SECRET`: `supersecretkey123`
5. Deploy!

#### 2. Native Java Maven Build (No Docker)
- Build Command: `mvn clean package -DskipTests` (inside `backend/`)
- Start Command: `java -jar target/homespot-backend-1.0.0.jar`
