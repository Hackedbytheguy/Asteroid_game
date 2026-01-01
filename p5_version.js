// Paste this into the p5.js editor to play the asteroid game there

let t_width = 25;
let t_height = 35;

let width = window.innerWidth - 35;
let height =window.innerHeight - 35;

let xpos = width/2;
let ypos = width/2;
let angle = 0;

let vx = 0;
let vy = 0;
let speed = 0.125;

let projectiles = [];
let p_speed = 9;
let cooldown = 0;

let asteroid = {};
let num_asteroids = 0;
let a_cooldown = 0;
let asteroids = [];
let a_speed = 8;
let a_size = 0;
let ax = 0;
let ay = 0;
let a_angle = 0;
let a_shape = 0;
let d = 0;

let gameover = false;
let score = 0;

let powerup_x = 0;
let powerup_y = 0;
let powerup_size = 25;
let powerup_spawn = false;
let powerup_active = false;
let powerup_cooldown = 0;
let powerup_end = 0;

let sheild_x = 0;
let sheild_y = 0;
let sheild_spawn = false;
let sheild_active = false;
let sheild_end = 0;

let level = 1;
let levelstep = 50;
let speedup = 1;
let max_asteroids = 10;
let minDistFromShip = 150;


function setup() {
  createCanvas(width, height);
  frameRate(60);
}

function draw() {
  if (gameover) {
    fill(255, 0, 0, 100);
    textSize(24);
    textAlign(CENTER);
    text("Game Over", width / 2, height / 2);
    fill(255, 255, 255, 100);
    textSize(24);
    textAlign(CENTER);
    text("\nR to restart", width/2, height/2 + 10)
    return;
  }

  background(200);
  fill(0, 200, 0, 200);
  textSize(24);
  textAlign(CENTER);
  text("Score: " + score, width / 15, height / 15);
  fill(0, 0, 0, 200);
  textSize(24);
  textAlign(CENTER);
  text("Level: " + level, width / 15, height / 10);

  level = floor(score / levelstep) + 1;
  speedup = 1 + (level - 1) * 0.05;
  max_asteroids = 10 + (level - 1) * 1;

  //spawn powerup
  if(score % 10 == 0 && powerup_spawn === false && score != 0){
    powerup_x = random(0, width);
    powerup_y = random(0, height);;
    powerup_spawn = true;
  }
  
  //sheild spawn
  if(score % 10 == 0 && sheild_spawn === false && score != 0){
    sheild_x = random(0, width);
    sheild_y = random(0, height);
    sheild_spawn = true;
  }
  
  //check for powerup collision
  if(powerup_spawn === true){
    fill(0, 0, 240, 100);
    circle(powerup_x, powerup_y, powerup_size);
    d = dist(xpos, ypos, powerup_x, powerup_y);
    if (d < powerup_size / 2 + t_height /  3){
        powerup_active = true;
        powerup_spawn = false
        powerup_end = millis() + 4000;
    }
  }
  
  if(sheild_spawn === true){
    fill(245, 245, 0, 100);
    circle(sheild_x, sheild_y, powerup_size);
    d = dist(xpos, ypos, sheild_x, sheild_y); 
    if (d < powerup_size /2 + t_height / 3){
      sheild_active = true;
      sheild_spawn = false;
      sheild_end = millis() + 7000;
    }
  }
  
  // shield timeout
  if (sheild_active && millis() > sheild_end) {
    sheild_active = false;
  }

  
  if(powerup_active === true && powerup_cooldown <= 0 && millis() <= powerup_end){
    let dir = angle - HALF_PI;
    let px = xpos + cos(dir) * (t_height / 2);
    let py = ypos + sin(dir) * (t_height / 2);
    projectiles.push({ px, py, dir });
    powerup_cooldown = 3;
  }    
  powerup_cooldown --;
  


  if (num_asteroids < max_asteroids && a_cooldown < 5) {
    asteroid = spawnAsteroid();
    if (asteroid) {
      asteroids.push(asteroid);
      num_asteroids++;
      a_cooldown = 5;
    }
  }
  a_cooldown --;
  
  // draw asteroids
  for (let a of asteroids) {
  let sizeNorm  = map(a.a_size, 10, 120, 0, 1);
  let speedNorm = map(a.a_speed, 1, 4, 0, 1);
  let danger = (sizeNorm + speedNorm) / 2;
  let gray = map(danger, 0, 1, 255, 50);
  fill(gray);


    a.ax += cos(a.a_angle) * a.a_speed;
    a.ay += sin(a.a_angle) * a.a_speed;

    if (a.a_shape == 1) circle(a.ax, a.ay, a.a_size);
    if (a.a_shape == 2) ellipse(a.ax, a.ay, a.a_size, a.a_size / 3);

    if (a.ax > width) a.ax = 0;
    if (a.ax < 0) a.ax = width;
    if (a.ay > height) a.ay = 0;
    if (a.ay < 0) a.ay = height;

    d = dist(xpos, ypos, a.ax, a.ay);
    if (d < a.a_size / 2 + t_height / 4 && sheild_active === false){
    gameover = true;   
    }
  }

  num_asteroids = asteroids.length;

  // projectiles
  for (let p_ of projectiles) {
    p_.px += cos(p_.dir) * p_speed;
    p_.py += sin(p_.dir) * p_speed;
    fill(0, 0, 255, 150);
    circle(p_.px, p_.py, 2);
  }

  // collisions
  for (let p_ of projectiles) {
    for (let a of asteroids) {
      d = dist(p_.px, p_.py, a.ax, a.ay);
      if (d < a.a_size / 2) {
        a.hit = true;
        p_.hit = true;
        score++;
      }
    }
  }

  asteroids = asteroids.filter((a) => !a.hit);
  projectiles = projectiles.filter((p_) => !p_.hit);

  // movement
  if (keyIsDown(RIGHT_ARROW)) {
    vx += speed * cos(angle);
    vy += speed * sin(angle);
    angle += 0.1;
  }
  if (keyIsDown(LEFT_ARROW)) {
    vx -= speed * cos(angle);
    vy -= speed * sin(angle);
    angle -= 0.1;
  }
  if (keyIsDown(UP_ARROW)) {
    vx += speed * cos(angle - HALF_PI);
    vy += speed * sin(angle - HALF_PI);
  }

  cooldown -= 2;
  vx *= 0.995;
  vy *= 0.995;
  xpos += vx;
  ypos += vy;

  if (xpos > width) xpos = 0;
  if (xpos < 0) xpos = width;
  if (ypos > height) ypos = 0;
  if (ypos < 0) ypos = height;

  // draw ship
  push();
  translate(xpos, ypos);
  rotate(angle);
  fill(255, 165, 0);
  stroke(30, 30, 30, 150);
  triangle(0, -t_height / 2, -t_width / 2, t_height / 2, t_width / 2, t_height / 2);
  noStroke();
  
  if(sheild_active === true && millis() <= sheild_end)
  {
    stroke(255,255,255);
    fill(245, 245, 0 , 150);
    circle(t_width/15, t_height/10, t_height + 18);
  }
  pop();
  
}
function spawnAsteroid() {

    let edge = floor(random(4));

    if (edge === 0) {           // top
      ax = random(0, width);
      ay = -20;
    } else if (edge === 1) {    // right
      ax = width + 20;
      ay = random(0, height);
    } else if (edge === 2) {    // bottom
      ax = random(0, width);
      ay = height + 20;
    } else {                    // left
      ax = -20;
      ay = random(0, height);
    } 
      if (dist(ax, ay, xpos, ypos) < minDistFromShip) {
    return null;
      }else{
      a_size = random(10, 120);
      a_angle = random(TWO_PI);
      a_speed = random(1, 4) * speedup;
      a_shape = floor(random(1, 3));

      return { ax, ay, a_size, a_angle, a_speed, a_shape };
      }
  }

function resetGame() {
  xpos = width / 2;
  ypos = height / 2;
  angle = 0;
  vx = 0;
  vy = 0;

  projectiles = [];
  asteroids = [];
  num_asteroids = 0;
  a_cooldown = 0;

  score = 0;
  gameover = false;
  powerup_active = false;
  powerup_spawn = false;
  sheild_active = false;
  sheild_spawn = false;
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    if (gameover) resetGame();
  }
  
  if (keyCode === 32 && cooldown <= 0 && !gameover) {
    let dir = angle - HALF_PI;
    let px = xpos + cos(dir) * (t_height / 2);
    let py = ypos + sin(dir) * (t_height / 2);
    projectiles.push({ px, py, dir });
    cooldown = 8;
  }
  }