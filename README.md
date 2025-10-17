# 🎲 Dice Roller 3D

Beautiful 3D dice animations powered by Three.js with realistic physics and smooth settling.

## ✨ Features

- 🎲 **All standard dice types** - d4, d6, d8, d10, d12, d20, d100
- 🎯 **Smart settling** - Dice automatically orient to flat faces (d4, d6, d8)
- 💨 **Smoke effects** - Dice fade out with particle effects
- 🎨 **Multiple themes** - Default, fantasy, modern, neon
- ⚡ **Smooth animations** - Realistic bounce physics with energy dissipation
- 🎬 **Three animation phases** - Bounce → Settle → Fade
- 📱 **Mobile-friendly** - Works on all devices

## 📦 Installation

```bash
npm install @dice-roller/3d
```

## 🚀 Quick Start

```typescript
import { DiceRoller3DPlugin } from '@dice-roller/3d';

// Create plugin instance
const dicePlugin = new DiceRoller3DPlugin({
  theme: 'fantasy',
  duration: 1200,
  cameraAngle: 'angle'
});

// Mount to container
const container = document.getElementById('dice-container');
dicePlugin.mount(container);

// Roll dice
const result = await dicePlugin.roll('2d6+3');
console.log(result); // { notation: '2d6+3', total: 11, rolls: [4, 4], modifier: 3 }

// Clean up when done
dicePlugin.unmount();
```

## ⚙️ Configuration

```typescript
interface DiceRoller3DOptions {
  theme?: 'default' | 'fantasy' | 'modern' | 'neon';  // Color theme
  physics?: boolean;                                   // Enable physics (default: true)
  duration?: number;                                   // Animation duration in ms (default: 1200)
  gravity?: number;                                    // Gravity strength (default: -9.82)
  cameraAngle?: 'top' | 'angle' | 'side';             // Camera position (default: 'angle')
}
```

## 🎨 Themes

| Theme | Color | Description |
|-------|-------|-------------|
| `default` | Blue (#3498db) | Clean and professional |
| `fantasy` | Purple (#9b59b6) | Mystical and magical |
| `modern` | Green (#2ecc71) | Fresh and minimalist |
| `neon` | Red (#e74c3c) | Bold and cyberpunk |

## 🎲 Supported Dice

- **d4** (Tetrahedron) - Settles flat with magic angles
- **d6** (Cube) - Snaps to 90° during bounce
- **d8** (Octahedron) - Settles flat with symmetric angles
- **d10** (Dodecahedron) - Natural landing
- **d12** (Dodecahedron) - Natural landing
- **d20** (Icosahedron) - Natural landing
- **d100** (Dodecahedron) - Natural landing

## 🎬 Animation Phases

1. **Bounce Phase** (70% of duration)
   - Realistic bouncing with energy dissipation
   - Rotation slows down over time
   - d6 snaps to flat orientation during final bounce

2. **Settle Phase** (30% of duration)
   - d4 and d8 snap to stable orientations
   - Smooth position adjustment
   - Dice come to rest on ground

3. **Fade Phase** (2 seconds after result shown)
   - Dice fade out with opacity
   - Smoke particle effects
   - Scale up and drift animation

## 📖 API Reference

### `DiceRoller3DPlugin`

#### Constructor
```typescript
new DiceRoller3DPlugin(options?: DiceRoller3DOptions)
```

#### Methods

**`mount(container: HTMLElement): void`**
- Mounts the 3D scene to a DOM container
- Initializes Three.js renderer, camera, and lighting

**`unmount(): void`**
- Cleans up Three.js resources
- Removes event listeners and stops render loop

**`roll(notation: string): Promise<RollResult>`**
- Rolls dice with 3D animation
- Returns result after settling (before fade)
- Notation examples: `'1d20'`, `'2d6+3'`, `'4d4-1'`

### `RollResult`

```typescript
interface RollResult {
  notation: string;    // Original notation (e.g., '2d6+3')
  total: number;       // Final total (e.g., 11)
  rolls: number[];     // Individual die results (e.g., [4, 4])
  modifier?: number;   // Modifier value (e.g., 3)
}
```

## 🎯 Example: Vue Integration

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { DiceRoller3DPlugin } from '@dice-roller/3d';

const container = ref<HTMLElement>();
const plugin = new DiceRoller3DPlugin({ theme: 'fantasy' });
const result = ref<string>('');

onMounted(() => {
  if (container.value) {
    plugin.mount(container.value);
  }
});

onUnmounted(() => {
  plugin.unmount();
});

async function rollDice() {
  const res = await plugin.roll('2d6+3');
  result.value = `Rolled ${res.total}!`;
}
</script>

<template>
  <div>
    <div ref="container" style="width: 600px; height: 400px;"></div>
    <button @click="rollDice">Roll 2d6+3</button>
    <p>{{ result }}</p>
  </div>
</template>
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run demo
open demo.html

# Build plugin
npm run build

# Test rotation angles
open test-rotation.html
```

## 📝 Technical Details

### Dice Settling Angles

- **d4**: X=230°, Y=45° increments, Z=0°, Height=0.5
- **d6**: Snaps to 90° increments during bounce, Height=1.0
- **d8**: X=45°, Y=30°, Z=30° (symmetric), Height=0.7
- **Others**: Natural landing at Height=1.0

### Animation Timing

- Total duration: Configurable (default 1200ms)
- Bounce phase: 70% of duration
- Settle phase: 30% of duration
- Display time: 2000ms before fade
- Fade duration: 800ms

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📄 License

MIT © Logan

## 🔗 Links

- [Demo](https://rakmaster.github.io/dice-roller-3d/)
- [GitHub](https://github.com/rakmaster/dice-roller-3d)
- [npm](https://www.npmjs.com/package/@dice-roller/3d)
