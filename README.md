# Tic Tac Toe Game

A modern implementation of the classic Tic Tac Toe game built with React, TypeScript, and Tailwind CSS.

## Features

- **Fully Functional Game:** Enjoy a classic Tic Tac Toe experience.
- **Score Tracking:** Monitor wins for X, O, and draws.
- **Game History:** View past game outcomes with timestamps.
- **Winning Highlights:** Winning combinations are visually emphasized.
- **Reset Options:** Easily reset the game board and statistics.
- **Responsive Design:** Optimized for all devices.
- **Theme Customization:** Switch between light and dark modes using the sun/moon icon button located in the top-right of the header.
- **AI Opponents (Easy & Medium):** Challenge a computer-controlled opponent! Select your desired game mode (Player vs Player, Play vs AI Easy, or Play vs AI Medium) using the buttons provided.
  - **Easy AI:** Makes random valid moves.
  - **Medium AI:** Implements a more strategic approach, attempting to win, block opponent wins, and control key board positions (center, corners).
- **Subtle Animations:** Enjoy smooth animations for placing marks (X/O) and highlighting the winning line, enhancing the visual feedback.
- **Sound Effects:** Audible feedback for game actions (moves, wins, draws, button clicks). Includes a toggle button (volume icon) in the header to mute/unmute sounds.
- **Detailed Game Statistics:** Tracks your performance with stats for total games played, plus separate win, loss (for Player X in PvA), and draw counts for both "Player vs Player" and "Player vs AI" game modes. Statistics are saved locally in your browser.
- **Game Replay (History View):** Review your past games move by move! Click on any game in the "Game History" list to enter replay mode. Use the "Previous Move" and "Next Move" buttons to step through the board states of that game. Click "Return to Current Game" to exit the replay.
- **Choose Your Symbol:** Select whether you want to play as 'X' or 'O' at the start of a new game. The game will adjust turn order, AI opponent's symbol, and display accordingly.

## Technologies Used

- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Vite**
- **Vitest**
- **Lucide React** for icons

## Project Structure

```plaintext
.
├── Terraform/
│   ├── main.tf         # Main Terraform configuration for AWS infrastructure
│   ├── variables.tf    # Terraform variables
│   ├── outputs.tf      # Terraform outputs
│   └── backend.tf      # Terraform backend configuration (e.g., S3)
├── public/             # Static assets
│   └── vite.svg        # Vite logo (example)
├── src/
│   ├── __tests__/
│   │   └── gameLogic.test.ts # Unit tests for game logic
│   ├── components/
│   │   ├── __tests__/      # Unit tests for React components
│   │   │   ├── App.test.tsx
│   │   │   ├── GameHistory.test.tsx
│   │   │   └── ThemeSwitcher.test.tsx
│   │   ├── Board.tsx       # Game board component
│   │   ├── GameHistory.tsx # Game history component
│   │   ├── ScoreBoard.tsx  # Score tracking component
│   │   ├── SoundToggler.tsx # Component to toggle sound
│   │   ├── Square.tsx      # Individual square component
│   │   └── ThemeSwitcher.tsx # Component to switch themes
│   ├── contexts/
│   │   ├── __tests__/      # Unit tests for React contexts
│   │   │   ├── SoundContext.test.tsx
│   │   │   └── ThemeContext.test.tsx
│   │   ├── SoundContext.tsx # Context for sound settings
│   │   └── ThemeContext.tsx  # Context for theme settings
│   ├── utils/
│   │   └── gameLogic.ts    # Game logic utilities
│   ├── App.tsx             # Main application component
│   ├── index.css           # Global CSS styles
│   ├── main.tsx            # Entry point for the React application
│   ├── types.ts            # TypeScript type definitions
│   └── vite-env.d.ts       # Vite environment variables declaration
├── .dockerignore           # Specifies intentionally untracked files that Docker should ignore
├── .eslintrc.json          # ESLint configuration (older format, consider eslint.config.js)
├── .gitignore              # Specifies intentionally untracked files that Git should ignore
├── Dockerfile              # Docker configuration for building the application image
├── README.md               # Project overview and instructions
├── docker-compose.yml      # Docker Compose configuration for multi-container setups
├── eslint.config.js        # ESLint configuration for code linting
├── index.html              # Main HTML file
├── package-lock.json       # Records exact versions of dependencies
├── package.json            # Project metadata and dependencies
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript compiler options
├── tsconfig.node.json      # TypeScript compiler options for Node.js environment
└── vite.config.ts          # Vite configuration
```

## Game Logic

The game follows these rules:

1. **First Move:** X goes first, followed by O.
2. **Win Condition:** The first player to achieve 3 marks in a row (horizontally, vertically, or diagonally) wins.
3. **Draw:** If all 9 squares are filled without a winner, the game ends in a draw.
4. **Highlighting:** Winning combinations are visually highlighted.
5. **Statistics:** Game outcomes and statistics are tracked and displayed.

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
