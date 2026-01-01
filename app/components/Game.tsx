"use client";

import { useEffect, useRef } from "react";
import p5 from "p5";

export default function P5Game() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const p5Ref = useRef<p5 | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      let t_width = 25;
      let t_height = 35;

      let border = 5;
      let width = window.innerWidth;
      let height = window.innerHeight - border;

      p.setup = () => {
        p.createCanvas(width, height);
        p.frameRate(60);
      };

      p.windowResized = () => {
        width = window.innerWidth;
        height = window.innerHeight - border;
        p.resizeCanvas(width, height);
      };


      let xpos = width / 2;
      let ypos = height / 2;
      let angle = 0;

      let vx = 0;
      let vy = 0;
      let speed = 0.135;

      let projectiles: any[] = [];
      let p_speed = 10;
      let cooldown = 0;

      let asteroid: any = {};
      let num_asteroids = 0;
      let a_cooldown = 0;
      let asteroids: any[] = [];
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
      let levelstep = 25;
      let speedup = 1;
      let max_asteroids = 12;
      let asteroid_min = 30;
      let asteroid_max = 150;
      let minDistFromShip = 150;

      p.setup = () => {
        p.createCanvas(width, height);
        p.frameRate(60);
      };

      p.draw = () => {
        if (gameover) {
          p.fill(255, 0, 0, 100);
          p.textSize(30);
          p.textAlign(p.CENTER);
          p.text("Game Over", width / 2, height / 2);
          p.fill(255, 255, 255, 100);
          p.textSize(30);
          p.textAlign(p.CENTER);
          p.text("\nR to restart", width / 2, height / 2 + 10);
          return;
        }

        p.background(200);
        p.fill(0, 200, 0, 200);
        p.textSize(30);
        p.textAlign(p.CENTER);
        p.text("Score: " + score, width / 15, height / 15);
        p.fill(0, 0, 0, 200);
        p.textSize(30);
        p.textAlign(p.CENTER);
        p.text("Level: " + level, width / 15, height / 10);

        level = Math.floor(score / levelstep) + 1;
        speedup = 1 + (level - 1) * 0.05;
        max_asteroids = 10 + (level - 1) * 1;

        if (score % 10 == 0 && powerup_spawn === false && score != 0) {
          powerup_x = p.random(0, width);
          powerup_y = p.random(0, height);
          powerup_spawn = true;
        }

        if (score % 10 == 0 && sheild_spawn === false && score != 0) {
          sheild_x = p.random(0, width);
          sheild_y = p.random(0, height);
          sheild_spawn = true;
        }

        if (powerup_spawn === true) {
          p.fill(0, 0, 240, 100);
          p.circle(powerup_x, powerup_y, powerup_size);
          d = p.dist(xpos, ypos, powerup_x, powerup_y);
          if (d < powerup_size / 2 + t_height / 3) {
            powerup_active = true;
            powerup_spawn = false;
            powerup_end = p.millis() + 4000;
          }
        }

        if (sheild_spawn === true) {
          p.fill(245, 245, 0, 100);
          p.circle(sheild_x, sheild_y, powerup_size);
          d = p.dist(xpos, ypos, sheild_x, sheild_y);
          if (d < powerup_size / 2 + t_height / 3) {
            sheild_active = true;
            sheild_spawn = false;
            sheild_end = p.millis() + 7000;
          }
        }

        if (sheild_active && p.millis() > sheild_end) {
          sheild_active = false;
        }

        if (
          powerup_active === true &&
          powerup_cooldown <= 0 &&
          p.millis() <= powerup_end
        ) {
          let dir = angle - p.HALF_PI;
          let px = xpos + p.cos(dir) * (t_height / 2);
          let py = ypos + p.sin(dir) * (t_height / 2);
          projectiles.push({ px, py, dir });
          powerup_cooldown = 3;
        }
        powerup_cooldown--;

        if (num_asteroids < max_asteroids && a_cooldown < 5) {
          asteroid = spawnAsteroid();
          if (asteroid) {
            asteroids.push(asteroid);
            num_asteroids++;
            a_cooldown = 5;
          }
        }
        a_cooldown--;

        for (let a of asteroids) {
          let sizeNorm = p.map(a.a_size, 10, 120, 0, 1);
          let speedNorm = p.map(a.a_speed, 1, 4, 0, 1);
          let danger = (sizeNorm + speedNorm) / 2;
          let gray = p.map(danger, 0, 1, 255, 50);
          p.fill(gray);

          a.ax += p.cos(a.a_angle) * a.a_speed;
          a.ay += p.sin(a.a_angle) * a.a_speed;

          if (a.a_shape == 1) p.circle(a.ax, a.ay, a.a_size);
          if (a.a_shape == 2)
            p.ellipse(a.ax, a.ay, a.a_size, a.a_size / 3);

          if (a.ax > width) a.ax = 0;
          if (a.ax < 0) a.ax = width;
          if (a.ay > height) a.ay = 0;
          if (a.ay < 0) a.ay = height;

          d = p.dist(xpos, ypos, a.ax, a.ay);
          if (d < a.a_size / 2 + t_height / 4 && sheild_active === false) {
            gameover = true;
          }
        }

        num_asteroids = asteroids.length;

        for (let p_ of projectiles) {
          p_.px += p.cos(p_.dir) * p_speed;
          p_.py += p.sin(p_.dir) * p_speed;
          p.fill(0, 0, 255, 150);
          p.circle(p_.px, p_.py, 2);
        }

        for (let p_ of projectiles) {
          for (let a of asteroids) {
            d = p.dist(p_.px, p_.py, a.ax, a.ay);
            if (d < a.a_size / 2) {
              a.hit = true;
              p_.hit = true;
              score++;
            }
          }
        }

        asteroids = asteroids.filter((a) => !a.hit);
        projectiles = projectiles.filter((p_) => !p_.hit);

        if (p.keyIsDown(p.RIGHT_ARROW)) {
          vx += speed * p.cos(angle);
          vy += speed * p.sin(angle);
          angle += 0.1;
        }
        if (p.keyIsDown(p.LEFT_ARROW)) {
          vx -= speed * p.cos(angle);
          vy -= speed * p.sin(angle);
          angle -= 0.1;
        }
        if (p.keyIsDown(p.UP_ARROW)) {
          vx += speed * p.cos(angle - p.HALF_PI);
          vy += speed * p.sin(angle - p.HALF_PI);
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

        p.push();
        p.translate(xpos, ypos);
        p.rotate(angle);
        p.fill(255, 165, 0);
        p.stroke(30, 30, 30, 150);
        p.triangle(
          0,
          -t_height / 2,
          -t_width / 2,
          t_height / 2,
          t_width / 2,
          t_height / 2
        );
        p.noStroke();

        if (sheild_active === true && p.millis() <= sheild_end) {
          p.stroke(255, 255, 255);
          p.fill(245, 245, 0, 150);
          p.circle(t_width / 15, t_height / 10, t_height + 18);
        }
        p.pop();
      };

      function spawnAsteroid() {
        let edge = Math.floor(p.random(4));

        if (edge === 0) {
          ax = p.random(0, width);
          ay = -20;
        } else if (edge === 1) {
          ax = width + 20;
          ay = p.random(0, height);
        } else if (edge === 2) {
          ax = p.random(0, width);
          ay = height + 20;
        } else {
          ax = -20;
          ay = p.random(0, height);
        }

        if (p.dist(ax, ay, xpos, ypos) < minDistFromShip) {
          return null;
        } else {
          a_size = p.random(asteroid_min, asteroid_max);
          a_angle = p.random(p.TWO_PI);
          a_speed = p.random(1, 4) * speedup;
          a_shape = Math.floor(p.random(1, 3));

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

      p.keyPressed = () => {
        if (p.key === "r" || p.key === "R") {
          if (gameover) resetGame();
        }

        if (p.keyCode === 32 && cooldown <= 0 && !gameover) {
          let dir = angle - p.HALF_PI;
          let px = xpos + p.cos(dir) * (t_height / 2);
          let py = ypos + p.sin(dir) * (t_height / 2);
          projectiles.push({ px, py, dir });
          cooldown = 8;
        }
      };
    };

    p5Ref.current = new p5(sketch, containerRef.current);

    return () => {
      p5Ref.current?.remove();
      p5Ref.current = null;
    };
  }, []);

  return <div ref={containerRef} />;
}
