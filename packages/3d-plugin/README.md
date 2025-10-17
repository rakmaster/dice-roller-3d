# @dice-roller/3d-plugin

Three.js 3D dice animation plugin for [@dice-roller](https://github.com/rakmaster/dice-roller).

## Installation

```bash
npm install @dice-roller/3d-plugin
```

## Usage

```vue
<script setup>
import { VDiceRoller } from '@dice-roller/vue';
import { DiceRoller3DPlugin } from '@dice-roller/3d-plugin';

const plugin3D = new DiceRoller3DPlugin({
  theme: 'fantasy',
  physics: true,
  duration: 1200
});
</script>

<template>
  <VDiceRoller 
    notation="2d6"
    :animation-plugin="plugin3D"
  />
</template>
```

## Options

```typescript
interface DiceRoller3DOptions {
  theme?: 'default' | 'fantasy' | 'modern' | 'neon';  // Default: 'default'
  physics?: boolean;                                   // Default: true
  duration?: number;                                   // Default: 1200ms
  gravity?: number;                                    // Default: -9.82
  cameraAngle?: 'top' | 'angle' | 'side';            // Default: 'angle'
}
```

## Features

- ✨ **Realistic 3D dice** - Proper geometry for d4, d6, d8, d10, d12, d20
- 🎮 **Physics simulation** - Powered by Cannon.js
- 🎨 **Multiple themes** - Fantasy, modern, neon, and more
- ⚡ **Optimized** - Efficient rendering and cleanup
- 📱 **Mobile-friendly** - Works on all devices

## Themes

### Default
Clean blue dice with standard lighting

### Fantasy
Purple mystical dice with magical atmosphere

### Modern
Green minimalist dice with clean aesthetics

### Neon
Red glowing dice with cyberpunk vibes

## API

### Constructor

```typescript
const plugin = new DiceRoller3DPlugin(options);
```

### Methods

#### `mount(container: HTMLElement): void`
Mount the 3D scene to a container element.

#### `unmount(): void`
Clean up Three.js resources.

#### `roll(notation: string, options?: any): Promise<RollResult>`
Roll dice with 3D animation. Returns result after animation completes.

## How It Works

1. **Parse notation** - Extract dice count, sides, and modifiers
2. **Calculate result** - Generate random rolls
3. **Create 3D scene** - Initialize Three.js and Cannon.js
4. **Animate dice** - Throw dice with physics simulation
5. **Return result** - After animation completes, result is displayed

## Performance

The plugin is optimized for performance:
- Reuses Three.js scene between rolls
- Efficient geometry and materials
- Automatic cleanup of unused resources
- Adjustable animation duration

## Browser Support

Requires WebGL support. Works in all modern browsers:
- Chrome 56+
- Firefox 51+
- Safari 11+
- Edge 79+

## License

MIT
