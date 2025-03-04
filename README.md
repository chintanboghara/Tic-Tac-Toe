# Tic Tac Toe Game

A modern implementation of the classic Tic Tac Toe game built with React, TypeScript, and Tailwind CSS.

![Tic Tac Toe Screenshot](https://github.com/user-attachments/assets/5b2813a5-f493-4665-8964-77359b5be93a)

## Features

- **Fully Functional Game:** Enjoy a classic Tic Tac Toe experience.
- **Score Tracking:** Monitor wins for X, O, and draws.
- **Game History:** View past game outcomes with timestamps.
- **Winning Highlights:** Winning combinations are visually emphasized.
- **Reset Options:** Easily reset the game board and statistics.
- **Responsive Design:** Optimized for all devices.

## Technologies Used

- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** for icons

## Project Structure

```plaintext
src/
├── components/
│   ├── Board.tsx       # Game board component
│   ├── Square.tsx      # Individual square component
│   ├── ScoreBoard.tsx  # Score tracking component
│   └── GameHistory.tsx # Game history component
├── utils/
│   └── gameLogic.ts    # Game logic utilities
├── App.tsx             # Main application component
└── main.tsx            # Entry point
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