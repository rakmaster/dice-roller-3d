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
    
    // Animate the dice rolling
    await this.animateDiceRoll(parsed.count, parsed.sides, rolls);
    
    // Return result after animation completes
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
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
        this.camera.position.set(0, 10, 0);
        this.camera.lookAt(0, 0, 0);
        break;
      case 'side':
        this.camera.position.set(10, 5, 0);
        this.camera.lookAt(0, 0, 0);
        break;
      case 'angle':
      default:
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
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
   * Animate dice rolling
   */
  private async animateDiceRoll(count: number, sides: number, results: number[]): Promise<void> {
    if (!this.scene) return;

    // Create dice meshes
    const dice = this.createDice(count, sides);
    
    // Add to scene
    dice.forEach(die => this.scene!.add(die));

    // Throw dice with physics
    if (this.world && this.options.physics) {
      this.throwDice(dice, results);
    }

    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, this.options.duration));

    // Remove dice from scene
    dice.forEach(die => this.scene!.remove(die));
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
        roughness: 0.7
      });

      const die = new THREE.Mesh(geometry, material);
      die.castShadow = true;
      die.position.set(
        (i - count / 2) * 2,
        5,
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
      case 12:
        return new THREE.DodecahedronGeometry(1);
      case 20:
        return new THREE.IcosahedronGeometry(1);
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

  /**
   * Throw dice with physics
   */
  private throwDice(dice: THREE.Mesh[], results: number[]): void {
    // TODO: Implement physics-based throwing
    // For now, just animate rotation
    dice.forEach((die, index) => {
      const targetRotation = this.getRotationForResult(results[index]);
      // Animate to target rotation
    });
  }

  /**
   * Get rotation for dice result
   */
  private getRotationForResult(result: number): THREE.Euler {
    // TODO: Calculate proper rotation based on die face
    return new THREE.Euler(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );
  }
}

export default DiceRoller3DPlugin;
