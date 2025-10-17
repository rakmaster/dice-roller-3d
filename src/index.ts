import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export interface DiceRoller3DOptions {
  theme?: 'default' | 'fantasy' | 'modern' | 'neon';
  physics?: boolean;
  duration?: number;
  gravity?: number;
  cameraAngle?: 'top' | 'angle' | 'side';
}

export interface RollResult {
  notation: string;
  total: number;
  rolls: number[];
  modifier?: number;
}

export class DiceRoller3DPlugin {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private world: CANNON.World | null = null;
  private container: HTMLElement | null = null;
  private options: Required<DiceRoller3DOptions>;
  private animationId: number | null = null;
  private currentDice: THREE.Mesh[] | null = null;

  constructor(options: DiceRoller3DOptions = {}) {
    this.options = {
      theme: options.theme || 'default',
      physics: options.physics !== false,
      duration: options.duration || 1200,
      gravity: options.gravity || -9.82,
      cameraAngle: options.cameraAngle || 'angle'
    };
  }

  /**
   * Mount the 3D scene to a container element
   */
  mount(container: HTMLElement): void {
    this.container = container;
    this.initScene();
    this.initPhysics();
    this.initLighting();
    this.initCamera();
    this.startRenderLoop();
  }

  /**
   * Clean up Three.js resources
   */
  unmount(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.world = null;
    this.container = null;
  }

  /**
   * Roll dice with 3D animation
   * This is the main plugin interface method
   */
  async roll(notation: string, options?: any): Promise<RollResult> {
    // Parse notation (e.g., "2d6+3")
    const parsed = this.parseNotation(notation);
    
    // Calculate result
    const rolls = this.calculateRolls(parsed.count, parsed.sides);
    const total = rolls.reduce((sum, roll) => sum + roll, 0) + (parsed.modifier || 0);
    
    // Start animation (don't wait for fade)
    this.animateDiceRoll(parsed.count, parsed.sides, rolls, parsed);
    
    // Wait only for bounce + settle phases (70% + 30% = 100% of duration)
    await new Promise(resolve => setTimeout(resolve, this.options.duration));
    
    // Return result after settling (dice are visible, result can be shown)
    return {
      notation,
      total,
      rolls,
      modifier: parsed.modifier
    };
  }

  /**
   * Initialize Three.js scene
   */
  private initScene(): void {
    if (!this.container) return;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    // Add ground plane
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x16213e });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  /**
   * Initialize physics world
   */
  private initPhysics(): void {
    if (!this.options.physics) return;

    this.world = new CANNON.World();
    this.world.gravity.set(0, this.options.gravity, 0);

    // Add ground plane to physics
    const groundBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane()
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(groundBody);
  }

  /**
   * Initialize lighting
   */
  private initLighting(): void {
    if (!this.scene) return;

    // Brighter ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    // Main directional light (key light)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // Fill light from opposite side
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(-5, 5, -5);
    this.scene.add(fillLight);
  }

  /**
   * Initialize camera
   */
  private initCamera(): void {
    if (!this.container) return;

    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );

    // Set camera position based on angle option
    switch (this.options.cameraAngle) {
      case 'top':
        this.camera.position.set(0, 12, 0);
        this.camera.lookAt(0, 1, 0);
        break;
      case 'side':
        this.camera.position.set(12, 3, 0);
        this.camera.lookAt(0, 1, 0);
        break;
      case 'angle':
      default:
        this.camera.position.set(6, 4, 6);
        this.camera.lookAt(0, 1, 0);
    }
  }

  /**
   * Start render loop
   */
  private startRenderLoop(): void {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);

      if (this.world) {
        this.world.step(1 / 60);
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };

    animate();
  }

  /**
   * Parse dice notation
   */
  private parseNotation(notation: string): { count: number; sides: number; modifier?: number } {
    const match = notation.match(/(\d+)d(\d+)([+-]\d+)?/);
    if (!match) {
      throw new Error(`Invalid notation: ${notation}`);
    }

    return {
      count: parseInt(match[1]),
      sides: parseInt(match[2]),
      modifier: match[3] ? parseInt(match[3]) : undefined
    };
  }

  /**
   * Calculate random rolls
   */
  private calculateRolls(count: number, sides: number): number[] {
    const rolls: number[] = [];
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1);
    }
    return rolls;
  }

  /**
   * Animate dice rolling with full physics and settling
   */
  private async animateDiceRoll(count: number, sides: number, results: number[], parsed: { count: number; sides: number; modifier?: number }): Promise<void> {
    if (!this.scene) return;

    // Remove old dice if they exist
    if (this.currentDice) {
      this.currentDice.forEach(die => this.scene!.remove(die));
    }

    const dice = this.createDice(count, sides);
    this.currentDice = dice;
    dice.forEach(die => this.scene!.add(die));

    // Phase 1: Bounce animation with realistic physics
    const bounceStart = Date.now();
    const bounceDuration = this.options.duration * 0.7; // 70% of total time for bouncing

    await new Promise<void>(resolve => {
      const animate = () => {
        const elapsed = Date.now() - bounceStart;
        const progress = Math.min(elapsed / bounceDuration, 1);

        dice.forEach((die, i) => {
          // Rotate dice (slows down over time)
          const rotationSpeed = 1 - (progress * 0.8); // Slow down to 20% speed
          die.rotation.x += 0.15 * rotationSpeed;
          die.rotation.y += 0.12 * rotationSpeed;
          die.rotation.z += 0.10 * rotationSpeed;
          
          // For d6, snap to nearest 90° during the final bounce (progress > 0.85)
          if (parsed.sides === 6 && progress > 0.85) {
            die.rotation.x = Math.round(die.rotation.x / (Math.PI / 2)) * (Math.PI / 2);
            die.rotation.y = Math.round(die.rotation.y / (Math.PI / 2)) * (Math.PI / 2);
            die.rotation.z = Math.round(die.rotation.z / (Math.PI / 2)) * (Math.PI / 2);
          }
          
          // Realistic bounce with energy dissipation
          const bounceCount = 4; // 4 bounces
          const bounceProgress = progress * bounceCount;
          const currentBounce = Math.floor(bounceProgress);
          const bouncePhase = bounceProgress - currentBounce;
          
          // Each bounce is smaller (geometric decay)
          const bounceHeight = 2 * Math.pow(0.35, currentBounce); // 35% energy retained
          const height = 1 + Math.abs(Math.sin(bouncePhase * Math.PI)) * bounceHeight;
          
          die.position.y = height;
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      animate();
    });

    // Phase 2: Settle - animate to stable orientation
    
    // Calculate target rotations and positions
    const startRotations = dice.map(die => ({
      x: die.rotation.x,
      y: die.rotation.y,
      z: die.rotation.z
    }));
    
    const targetRotations = dice.map((die, i) => {
      if (parsed.sides === 4) {
        // d4: Magic numbers - X: 230°, Y: snap to 45°, Z: 0°
        const targetX = 230 * Math.PI / 180;
        const currentX = die.rotation.x;
        
        // Find the closest equivalent angle
        let diff = targetX - currentX;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        
        const closestX = currentX + diff;
        
        return {
          x: closestX,
          y: Math.round(die.rotation.y / (Math.PI / 4)) * (Math.PI / 4),
          z: 0
        };
      } else if (parsed.sides === 8) {
        // d8: Magic numbers - X: 45°, Y: 30°, Z: 30° (symmetric!)
        const targetX = 45 * Math.PI / 180;
        const targetY = 30 * Math.PI / 180;
        const targetZ = 30 * Math.PI / 180;
        
        // Find closest equivalent angles
        let diffX = targetX - die.rotation.x;
        while (diffX > Math.PI) diffX -= Math.PI * 2;
        while (diffX < -Math.PI) diffX += Math.PI * 2;
        
        let diffY = targetY - die.rotation.y;
        while (diffY > Math.PI) diffY -= Math.PI * 2;
        while (diffY < -Math.PI) diffY += Math.PI * 2;
        
        let diffZ = targetZ - die.rotation.z;
        while (diffZ > Math.PI) diffZ -= Math.PI * 2;
        while (diffZ < -Math.PI) diffZ += Math.PI * 2;
        
        return {
          x: die.rotation.x + diffX,
          y: die.rotation.y + diffY,
          z: die.rotation.z + diffZ
        };
      } else {
        // Keep current rotation
        return {
          x: die.rotation.x,
          y: die.rotation.y,
          z: die.rotation.z
        };
      }
    });
    
    // Animate to target
    const settleStart = Date.now();
    const settleDuration = this.options.duration * 0.3;
    
    await new Promise<void>(resolve => {
      const animate = () => {
        const elapsed = Date.now() - settleStart;
        const progress = Math.min(elapsed / settleDuration, 1);
        
        // Ease out cubic for smooth settling
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        dice.forEach((die, i) => {
          if (parsed.sides === 4) {
            // d4: Snap instantly to avoid visible rotation
            die.rotation.x = targetRotations[i].x;
            die.rotation.y = targetRotations[i].y;
            die.rotation.z = targetRotations[i].z;
            // Smoothly settle position
            die.position.y = 1 + (0.5 - 1) * easeProgress; // From 1 to 0.5
          } else if (parsed.sides === 8) {
            // d8: Snap instantly to avoid visible rotation
            die.rotation.x = targetRotations[i].x;
            die.rotation.y = targetRotations[i].y;
            die.rotation.z = targetRotations[i].z;
            // Smoothly settle position
            die.position.y = 1 + (0.7 - 1) * easeProgress; // From 1 to 0.7
          } else {
            // Other dice: keep rotation as-is
            die.rotation.x = startRotations[i].x;
            die.rotation.y = startRotations[i].y;
            die.rotation.z = startRotations[i].z;
            die.position.y = 1;
          }
          
          // Ensure scale is 1
          die.scale.set(1, 1, 1);
        });
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      animate();
    });

    // Phase 3: Display result (dice are settled, now show the number)
    // Return here so the result can be displayed
    // Dice stay visible for viewing
    
    // Phase 4: Wait, then fade out with smoke effect
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    // Create smoke particles
    const particles: THREE.Mesh[] = [];
    dice.forEach(die => {
      for (let i = 0; i < 8; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
          color: this.getThemeColor(),
          transparent: true,
          opacity: 0.6
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.copy(die.position);
        (particle as any).userData = {
          velocity: {
            x: (Math.random() - 0.5) * 0.02,
            y: Math.random() * 0.03 + 0.02,
            z: (Math.random() - 0.5) * 0.02
          }
        };
        this.scene!.add(particle);
        particles.push(particle);
      }
    });
    
    const fadeStart = Date.now();
    const fadeDuration = 800; // Longer for smoke effect
    
    await new Promise<void>(resolve => {
      const fadeAnimate = () => {
        const elapsed = Date.now() - fadeStart;
        const fadeProgress = Math.min(elapsed / fadeDuration, 1);
        
        dice.forEach((die, i) => {
          // Fade opacity
          (die.material as THREE.MeshStandardMaterial).opacity = 1 - fadeProgress;
          
          // Smoke effect: scale up and drift upward
          const scale = 1 + (fadeProgress * 0.5); // Grow 50%
          die.scale.set(scale, scale, scale);
          
          // Drift upward slightly
          die.position.y += 0.005;
          
          // Add slight rotation for smoke swirl
          die.rotation.y += 0.02 * (1 - fadeProgress);
        });
        
        // Animate particles
        particles.forEach(particle => {
          const vel = (particle as any).userData.velocity;
          particle.position.x += vel.x;
          particle.position.y += vel.y;
          particle.position.z += vel.z;
          
          // Scale up and fade out
          const particleScale = 1 + (fadeProgress * 2);
          particle.scale.set(particleScale, particleScale, particleScale);
          (particle.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - fadeProgress);
        });
        
        if (fadeProgress < 1) {
          requestAnimationFrame(fadeAnimate);
        } else {
          resolve();
        }
      };
      fadeAnimate();
    });
    
    // Remove particles
    particles.forEach(particle => this.scene!.remove(particle));

    // Remove dice after fade
    dice.forEach(die => this.scene!.remove(die));
    this.currentDice = null;
  }

  /**
   * Create dice meshes
   */
  private createDice(count: number, sides: number): THREE.Mesh[] {
    const dice: THREE.Mesh[] = [];

    for (let i = 0; i < count; i++) {
      const geometry = this.getDiceGeometry(sides);
      const material = new THREE.MeshStandardMaterial({
        color: this.getThemeColor(),
        metalness: 0.3,
        roughness: 0.7,
        transparent: true,  // Enable transparency for fade effect
        opacity: 1.0        // Start fully opaque
      });

      const die = new THREE.Mesh(geometry, material);
      die.castShadow = true;
      die.position.set(
        (i - count / 2) * 2,
        3,
        0
      );

      dice.push(die);
    }

    return dice;
  }

  /**
   * Get geometry for dice type
   */
  private getDiceGeometry(sides: number): THREE.BufferGeometry {
    switch (sides) {
      case 4:
        return new THREE.TetrahedronGeometry(1);
      case 6:
        return new THREE.BoxGeometry(1, 1, 1);
      case 8:
        return new THREE.OctahedronGeometry(1);
      case 10:
        // d10 is a pentagonal trapezohedron - approximate with dodecahedron
        return new THREE.DodecahedronGeometry(0.9);
      case 12:
        return new THREE.DodecahedronGeometry(1);
      case 20:
        return new THREE.IcosahedronGeometry(1);
      case 100:
        // d100 (percentile die) - use dodecahedron slightly larger
        return new THREE.DodecahedronGeometry(1.1);
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }

  /**
   * Get theme color
   */
  private getThemeColor(): number {
    const colors = {
      default: 0x3498db,
      fantasy: 0x9b59b6,
      modern: 0x2ecc71,
      neon: 0xe74c3c
    };
    return colors[this.options.theme];
  }

}

export default DiceRoller3DPlugin;
