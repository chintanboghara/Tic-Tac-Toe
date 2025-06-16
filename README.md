# Tic Tac Toe

A sleek, modern implementation of the classic Tic Tac Toe game built with React, TypeScript, and Tailwind CSS.

## Features

- Fully functional game with X and O
- Persistent score tracking for X, O, and draws
- Timestamped game history
- Highlighted winning combinations
- Reset game board and statistics
- Responsive across all screen sizes

## Tech Stack

- **React 18**  
- **TypeScript**  
- **Tailwind CSS**  
- **Vite**  
- **Vitest**  
- **Lucide React** (icons)  

## Game Rules

1. X always starts, then players alternate.
2. First to align three marks (horizontal, vertical, or diagonal) wins.
3. If all squares fill without a winner, the game ends in a draw.
4. Winning line is visually highlighted.
5. All results are tracked and displayed.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v14 or higher  
- npm or Yarn  

### Installation

1. Clone the repo  
   ```bash
   git clone https://github.com/chintanboghara/Tic-Tac-Toe.git
   cd Tic-Tac-Toe
   ````

2. Install dependencies

   ```bash
   npm install
   # or
   yarn
   ```
3. Launch the dev server

   ```bash
   npm run dev
   # or
   yarn dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Production Build

```bash
npm run build
# or
yarn build
```

Build artifacts will be output to the `dist/` directory.

## Docker

### Build & Run

1. Build the image

   ```bash
   docker build -t tic-tac-toe .
   ```
2. Run the container

   ```bash
   docker run -p 80:80 tic-tac-toe
   ```

Visit [http://localhost](http://localhost).

### Docker Compose

```bash
docker-compose up --build
# or, to run in detached mode:
docker-compose up -d --build
```

## Infrastructure as Code (Terraform)

Terraform scripts automate your cloud resources.

Key files in `Terraform/`:

* `main.tf` — Core infrastructure definitions
* `variables.tf` — Input variable definitions
* `outputs.tf` — Provisioning outputs
* `backend.tf` — Remote state configuration

### Common Commands

```bash
cd Terraform
terraform init    # Initialize
terraform plan    # Preview changes
terraform apply   # Apply changes
terraform destroy # Tear down resources
```