# Meme Search App

## About The Project
This is a monorepo for a meme search application that uses **OCR** to recognize text in memes and Elasticsearch to perform efficient text-based searches.

## Preview
![preview](/.github/preview.mp4)

### Tech stack

<p>
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/next.js-4f46e5?style=for-the-badge&logo=next.js&logoColor=white" alt="NextJS Official Website"/>
  </a>

  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/tailwind-4f46e5?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS Official Website"/>
  </a>

  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/typescript-4f46e5?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Official Website"/>
  </a>

  <a href="https://nestjs.com/">
    <img src="https://img.shields.io/badge/nestjs-4f46e5?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS Official Website"/>
  </a>

  <a href="https://www.elastic.co/elasticsearch">
    <img src="https://img.shields.io/badge/elasticsearch-4f46e5?style=for-the-badge&logo=elasticsearch&logoColor=white" alt="Elasticsearch Official Website"/>
  </a>

  <a href="https://www.docker.com/">
    <img src="https://img.shields.io/badge/docker-4f46e5?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Official Website"/>
  </a>

  <a href="https://www.prisma.io/">
    <img src="https://img.shields.io/badge/prisma-4f46e5?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma Official Website"/>
  </a>

  <a href="https://www.postgresql.org/">
    <img src="https://img.shields.io/badge/postgresql-4f46e5?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL Official Website"/>
  </a>
</p>

## Features
- **OCR Processing:** Extract text from memes for indexing.
- **Elasticsearch Integration:** Quickly search memes by recognized text.
- **PostgreSQL Database:** Backend data storage.
- **Frontend and Backend:** Web app with a RESTful API.
- **Dockerized Environment:** Easy to set up and deploy using Docker Compose.

## Directory Structure
```
/app
  |- apps
      |- backend   # Backend service
      |- web       # Frontend service
  |- .env
  |- docker-compose.yml
```

## Prerequisites
- Docker and Docker Compose installed

## Environment Variables
All environment variables are defined in a `.env` file. Below is a breakdown:

### Database Configuration
```env
DATABASE_USER=memes
DATABASE_PASSWORD=<secure_password>
DATABASE_NAME=appdb
DATABASE_PORT=5432
DATABASE_URL=postgres://<user>:<password>@db:5432/<database>
```

### JWT Secret
```env
JWT_SECRET=<secure_jwt_secret>
```

### Elasticsearch Configuration
```env
ELASTICSEARCH_PORT=9200
ELASTICSEARCH_NODE_URL=http://elasticsearch:9200
```

### Backend Configuration
```env
BACKEND_PORT=3000
```

### Frontend Configuration
```env
FRONTEND_PORT=3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

### Upload Configuration
```env
UPLOAD_PUBLIC_URL=${NEXT_PUBLIC_BACKEND_URL}/uploads
```

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/JefferMarcelino/memes-app.git
cd memes-app
```

### 2. Create and Configure `.env`
Copy the example below or adjust the provided `.env` file:
```env
DATABASE_USER=memes
DATABASE_PASSWORD=<secure_password>
DATABASE_NAME=appdb
DATABASE_PORT=5432
DATABASE_URL=postgres://<user>:<password>@db:5432/<database>
JWT_SECRET=<secure_jwt_secret>
ELASTICSEARCH_PORT=9200
ELASTICSEARCH_NODE_URL=http://elasticsearch:9200
BACKEND_PORT=3000
FRONTEND_PORT=3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
UPLOAD_PUBLIC_URL=${NEXT_PUBLIC_BACKEND_URL}/uploads
```

### 3. Build and Run the Services
#### Build and Run
```bash
docker compose --env-file .env up --build
```
#### Run without Rebuilding
```bash
docker compose --env-file .env up
```

### 4. Access the Application
- **Frontend:** [http://localhost:3001](http://localhost:3001)
- **Backend API:** [http://localhost:3000](http://localhost:3000)

## Contributing
Feel free to fork this repository and contribute by submitting a pull request.

---