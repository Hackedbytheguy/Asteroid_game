import { link } from "fs";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="mainscreen">
      <h1 className="title">Asteroid!</h1>
      <div className="centersection">
        <h2>How to play</h2>
        <br></br>
        <p>1. Use the arrows keys (Up/Left/Right) to traverse the map and avoid
          asteroids.</p>
        <br></br>

        <p>2. Fire projectiles from your ship with the spacebar.</p>
        <br></br>

        <p>3. Collect the blue powerup to increase fire rate. Collect the yellow powerup
          to activate a sheild for a short time.</p>
        <br></br>

        <p>4. Difficulty increases every level (every 25 score).</p>
        <Link href="/asteroid" className="start">Start Game</Link>

      </div>
      <Image src="/asteroidimg3.png" alt="Asteroid Game" height={475} width={475} className="asteroidimage"></Image>
      <h1 className="footer">Created by Dawson</h1>
    </div>
  );
}
