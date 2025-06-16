# Tic Tac Toe Game

A modern implementation of the classic Tic Tac Toe game built with React, TypeScript, and Tailwind CSS.

## Features

- Fully functional Tic Tac Toe game
- Score tracking for X, O, and draws
- Game history with timestamps
- Highlights winning combinations
- Reset game and statistics
- Responsive design for all devices

## Technologies Used

- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Vite**
- **Vitest**
- **Lucide React** for icons

## Game Logic

The game implements the following rules:

1. X goes first, followed by O
2. The first player to get 3 of their marks in a row (horizontally, vertically, or diagonally) wins
3. If all 9 squares are filled and no player has 3 marks in a row, the game is a draw
4. Winning combinations are highlighted
5. Game statistics are tracked and displayed

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/chintanboghara/Tic-Tac-Toe.git
   cd Tic-Tac-Toe
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser:**

   Navigate to [http://localhost:5173](http://localhost:5173)

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The production build artifacts will be output to the `dist/` directory.

## Running with Docker

Run the application using Docker. Use the multi-stage Dockerfile provided in the project.

1. **Build the Docker image:**

   ```bash
   docker build -t tic-tac-toe .
   ```

2. **Run the Docker container:**

   ```bash
   docker run -p 80:80 tic-tac-toe
   ```

The application should now be accessible at [http://localhost](http://localhost).

## Running with Docker Compose

Using Docker Compose, you can use the provided `docker-compose.yml` file:

1. **Build and start the service:**

   ```bash
   docker-compose up --build
   ```

2. **Run in detached mode:**

   ```bash
   docker-compose up -d --build
   ```

## Infrastructure as Code (Terraform)

This project uses Terraform to manage and provision infrastructure, likely on a cloud provider such as AWS (inferred from typical Terraform usage and file names like `backend.tf`). The Terraform setup helps in automating the deployment environment for the Tic Tac Toe application.

Key files in the `Terraform/` directory:
- `main.tf`: Contains the main set of configurations for the infrastructure.
- `variables.tf`: Defines variables used in the Terraform configurations.
- `outputs.tf`: Specifies the output values after infrastructure provisioning.
- `backend.tf`: Configures the Terraform backend, often used for state storage (e.g., AWS S3).

### Common Terraform Commands

1.  **Initialize Terraform:**
    Navigate to the `Terraform/` directory and run:
    ```bash
    terraform init
    ```

2.  **Plan Changes:**
    (Optional but recommended) Preview the changes Terraform will make:
    ```bash
    terraform plan
    ```

3.  **Apply Changes:**
    Provision or update the infrastructure:
    ```bash
    terraform apply
    ```
    You will be prompted to confirm the changes before they are applied.

4.  **Destroy Infrastructure:**
    (Use with caution) Remove the infrastructure managed by Terraform:
    ```bash
    terraform destroy
    ```
