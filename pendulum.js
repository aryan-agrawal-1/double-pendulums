let gridSize = 20; // 20x20 grid
let pendulums = [];
const R = 20; // Screen-space length for the rods
let mode = 3;

function setup() {
  createCanvas(1280, 720);
  angleMode(RADIANS);
  
  if (mode == 3) {
    gridSize = 170;
  }
  
  // create the grid of pendulums  
  for (let i = 0; i < gridSize; i++) {
    pendulums[i] = [];
    for (let j = 0; j < gridSize; j++) {
      pendulums[i][j] = {
        // initial angles mapped from -PI/2 to PI/2 from left to right for theta1 and top to bottom for theta2
        theta1: map(i, 0, gridSize, -PI / 2, PI / 2),
        theta2: map(j, 0, gridSize, -PI / 2, PI / 2),
        omega1: 0,
        omega2: 0
      };
    }
  }

  if (mode === 3) noStroke();
}

function draw() {
    background(10);
    
    // R is the screen length of the rods
    let spacing = width / gridSize; 
  
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        let p = pendulums[i][j];
        updatePendulum(p);
        
        // compute color mappings for all modes
        let r = map(sin(p.theta1), -1, 1, 0, 255);
        let g = map(sin(p.theta2), -1, 1, 0, 255);
        let b = map(cos(p.theta1 - p.theta2), -1, 1, 0, 255);
        
        if (mode === 1) {
          drawPendulum(p, i, j, spacing);
        } else if (mode === 2) {
          fill(r, g, b);
          noStroke();
          rect(i * spacing, j * spacing, spacing, spacing);
        } else if (mode === 3) {
          fill(r, g, b, 170);
          rect(i * spacing, j * spacing, spacing, spacing);
        }
      }
    }
}

function drawPendulum(p, i, j, spacing) {
    // Pivot Point (Center of the cell)
    let cx = i * spacing + spacing / 2;
    let cy = j * spacing + spacing / 2;

    // Calculate the position of the first mass (m1)
    let x1 = cx + R * sin(p.theta1);
    let y1 = cy + R * cos(p.theta1);

    // Calculate the position of the second mass (m2)
    // It pivots around (x1, y1)
    let x2 = x1 + R * sin(p.theta2);
    let y2 = y1 + R * cos(p.theta2);
    
    // Rod 1 (Pivot to m1)
    stroke('#00f5d4'); // Color for rod 1
    strokeWeight(1);
    line(cx, cy, x1, y1);

    // Rod 2 (m1 to m2)
    stroke('#f15bb5'); // Color for rod 2
    line(x1, y1, x2, y2);

    // Mass 1
    noStroke();
    fill('#00f5d4');
    ellipse(x1, y1, 3); // Draw a small circle for the mass

    // Mass 2
    fill('#f15bb5');
    ellipse(x2, y2, 3);
    
    // Draw a small dot for the pivot
    fill(255);
    ellipse(cx, cy, 1);
}

// Simplified physics
function updatePendulum(p) {
  // Constants
  let g = 1;   // Gravitational constant
  let m1 = 1;  
  let m2 = 1;  
  let L1 = 1;  
  let L2 = 1;

  // reached equation using lagrangian

  // calculate the top for alpha1 (angular acceleration of the first mass)
  let num1 = -g * (2 * m1 + m2) * sin(p.theta1);
  let num2 = -m2 * g * sin(p.theta1 - 2 * p.theta2);
  let num3 = -2 * sin(p.theta1 - p.theta2) * m2 *
             (p.omega2 * p.omega2 * L2 + p.omega1 * p.omega1 * L1 * cos(p.theta1 - p.theta2));
  // denominator for alpha1
  let den = L1 * (2 * m1 + m2 - m2 * cos(2 * p.theta1 - 2 * p.theta2));

  let a1 = (num1 + num2 + num3) / den;

  // same process for alpha2
  let num4 = 2 * sin(p.theta1 - p.theta2) *
             (p.omega1 * p.omega1 * L1 * (m1 + m2) +
              g * (m1 + m2) * cos(p.theta1) +
              p.omega2 * p.omega2 * L2 * m2 * cos(p.theta1 - p.theta2));

  let den2 = L2 * (2 * m1 + m2 - m2 * cos(2 * p.theta1 - 2 * p.theta2));

  let a2 = num4 / den2;

  // update angular velocities using Euler Integration
  p.omega1 += a1 * 0.02; // 0.02 is the timestep
  p.omega2 += a2 * 0.02;

  // Update angles
  p.theta1 += p.omega1 * 0.02;
  p.theta2 += p.omega2 * 0.02;
}
