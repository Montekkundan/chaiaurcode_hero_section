# Youtube Tutorial

[![Make a Dynamic 3D Website with Animated Fluid | Three.js & React Tutorial](https://img.youtube.com/vi/dsRwaNpZ5K4/maxresdefault.jpg)](https://youtu.be/dsRwaNpZ5K4)

# ChaiCode

A React Three Fiber (R3F) scene featuring a realistic chai cup with liquid simulation and advanced text/particle effects.

## Overview

This project uses React Three Fiber to render a 3D chai cup with a custom liquid shader. The liquid simulation is achieved using a custom shader material that simulates wobble, tilt, and ripples. The scene is controlled using Leva panels for adjusting scale, rotation, position, and liquid properties.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url> chaiaurcode
   cd chaiaurcode
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Project

To start the development server, run:
```bash
npm run dev
```

This will start the Vite development server, and you can view the project in your browser at `http://localhost:5173`.

## Project Structure

- `src/components/scene/model.jsx`: Contains the main 3D model and liquid simulation logic.
- `src/components/scene/materials/liquidRefractionMaterial.js`: Custom shader material for the liquid effect.
- `public/models/chai.glb`: The 3D model of the chai cup.
- `public/fonts/PPNeueMontreal-Bold.otf`: Font used for the text in the scene.

## Features

- Realistic liquid simulation with wobble, tilt, and ripple effects.
- Interactive controls for adjusting the cup's scale, rotation, and position.
- Customizable liquid properties such as height, color, opacity, and ripple amplitude.
- Click on the cup to trigger ripple effects.

## Technologies Used

- React
- React Three Fiber
- Three.js
- Leva for UI controls
- Vite for development and building

## License

This project is licensed under the MIT License.
