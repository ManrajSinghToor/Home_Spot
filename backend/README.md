# HomeSpot Java Spring Boot Backend API (PostgreSQL)

Production-ready Java Spring Boot backend for the **HomeSpot 3D Rental Platform**, built with **Spring Boot 3.3**, **Spring Data JPA (Hibernate)**, **PostgreSQL Database**, **Spring Security**, and **JWT Authentication**.

---

## Features & Highlights
- **100% API Parity**: Full feature parity with all REST API contracts expected by the React frontend.
- **PostgreSQL Database Integration**: Uses Spring Data JPA (Hibernate) with auto table generation (`spring.jpa.hibernate.ddl-auto=update`) and automatic data seeding.
- **BCrypt Password Hashing**: Secure password encoding via Spring Security.
- **Stateless JWT Security**: Secure authorization via Bearer JWT tokens.
- **Auto Sold/Rented Cascade**: Automatic property status update and competing booking cancellation notifications.
- **Docker & Cloud Ready**: Production containerization with multi-stage Dockerfile included.

---

## Local Development Setup

### Prerequisites
- **Java 17+ or 21**
- **Apache Maven 3.9+** (or use workspace Maven `./apache-maven-3.9.9/bin/mvn`)
- **PostgreSQL 14+** running locally with database `rental_hub`.

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

## Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5001` | HTTP Port for the Spring Boot server |
| `DB_URL` | `jdbc:postgresql://localhost:5432/rental_hub` | PostgreSQL Connection URL |
| `DB_USERNAME` | `postgres` | PostgreSQL Database Username |
| `DB_PASSWORD` | `postgres` | PostgreSQL Database Password |
| `JWT_SECRET` | `supersecretkey123` | Secret Key for signing JWT tokens |

---

## Cloud Deployment Guide

### Deployment Options:

#### Deployment via Render / Railway / Supabase / Neon (Docker Support)
1. Push your changes to your GitHub repository (`ManrajSinghToor/Home_Spot`).
2. Create a managed **PostgreSQL Database** on Render, Railway, Supabase, or Neon.
3. In **Render** or **Railway**, create a new **Web Service**.
4. Select **Docker** as the Environment / Build Type.
5. Set Environment Variables:
   - `PORT`: `5001`
   - `DB_URL`: `jdbc:postgresql://<host>:5432/<database>`
   - `DB_USERNAME`: `<username>`
   - `DB_PASSWORD`: `<password>`
   - `JWT_SECRET`: `supersecretkey123`
6. Deploy!
