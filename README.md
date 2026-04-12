# 💬 YapIt | Real-Time Messaging Platform

![YapIt Banner](https://via.placeholder.com/1200x400/6366f1/ffffff?text=YapIt+-+Secure+Real-Time+Messaging)

> A modern, robust, and dynamically scalable real-time chat application built using a microservices architecture. 

YapIt is designed to offer a seamless messaging experience with secure OTP-based authentication, real-time socket connections, robust file sharing, and granular message controls. Engineered with Next.js on the frontend and distributed Node.js microservices on the backend, fully containerized with Docker.

---

## ✨ Features

- **Real-Time Communication:** Instant messaging powered by Socket.io, featuring live typing indicators and instant delivery.
- **Secure Authentication:** Passwordless OTP-based login and signup backed by Upstash Redis.
- **Rich Media Sharing:** Seamlessly share images and documents (PDF, DOCX, XLSX, TXT) up to 20MB, securely stored using AWS S3 natively integrated system downloads.
- **Advanced Message Controls:** Edit messages, delete for me/everyone, and track read receipts (unseen count & exact seen times).
- **Social Graph:** Send, accept, and reject connection requests. Manage your friendships and chat strictly with approved connections.
- **Smart UI:** Dynamic WhatsApp-style date separators, intelligent link previews dynamically fetched, and an intuitive, responsive sidebar.

## 🏗️ Architecture

YapIt utilizes a microservices architecture orchestrated by Docker Compose, ensuring scalability, independent deployments, and a clean separation of concerns.

- **Frontend (Client):** Next.js application utilizing React, TailwindCSS, Axios, and Socket.io-client.
- **User Service:** Node.js/Express service managing user profiles, authentication (OTP limits), and connection requests. Communicates asynchronously via RabbitMQ.
- **Mail Service:** Node.js microservice consuming RabbitMQ queues to handle automated outbound email deliveries (e.g. OTP validation, connection alerts).
- **Chat Service:** Node.js/Express/Socket.IO service handling real-time chat events, message persistence, media proxying, and global socket state mapping.

### Tech Stack
* **Frontend:** Next.js (App Router), React, TailwindCSS
* **Backend:** Node.js, Express.js, Socket.IO, Axios 
* **Databases/Cache:** MongoDB Atlas (NoSQL), Upstash Redis (Caching, Rate-Limiting)
* **Message Broker:** RabbitMQ
* **Cloud Storage:** AWS S3
* **DevOps:** Docker, Docker Compose, Nginx, Certbot (Let's Encrypt SSL), AWS EC2, GitHub Actions

## 🚀 Getting Started (Local Development)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- Node.js (v18+)
- MongoDB Cluster URI, Redis Database URL, CloudAMQP/RabbitMQ Instance
- AWS S3 Credentials (Bucket Name, Region, Access Key, Secret)

### Environment Variables
You need to create `.env` files in your service directories. Use `.env.example` files as a template if available.

**Key Environment Variables for Backend:**
```env
# Database & Network
MONGO_URI=your_mongo_db_uri
REDIS_URL=your_upstash_redis_url
RABBITMQ_URL=amqps://your-rabbitmq-url
JWT_SECRET=your_secret

# AWS S3 Settings
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your_bucket_name
```

### Running the App Locally

Start the entire microservice stack using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/abhinavkarnatak-dev/YapIt.git
cd YapIt

# Build and start all containers in detached mode
docker-compose up -d --build
```

The application sub-services will be accessible at:
- **Frontend:** `http://localhost:3000`
- **User Service API:** `http://localhost:8080/api/v1`
- **Chat Service API:** `http://localhost:5002/api/v1`

## ☁️ Deployment Architecture

YapIt is production-ready for deployment on virtual machines like AWS EC2. 
- **Reverse Proxy:** Nginx handles SSL termination on port 443 with Let's Encrypt certificates managed dynamically via **Certbot**.
- **Internal Routing:** Nginx handles WebSocket protocol upgrades (`/socket.io/`) seamlessly and routes internal REST API calls explicitly to their respective Docker container ports using `proxy_pass`.
- **CI/CD:** Integrated GitHub Actions workflow to automate building and orchestrating remote Docker container restarts (`deploy.yml`).

## 👨‍💻 Author

Built and designed by **Abhinav Karnatak** ([@abhinavkarnatak-dev](https://github.com/abhinavkarnatak-dev)).
