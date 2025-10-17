# 🎲 Dice Roller Plugins

Animation and effect plugins for [@dice-roller](https://github.com/rakmaster/dice-roller).

## Packages

- **[@dice-roller/3d-plugin](packages/3d-plugin)** - Three.js 3D dice with physics simulation
- **[@dice-roller/sprite-plugin](packages/sprite-plugin)** - 2D sprite animations (coming soon)
- **[@dice-roller/sound-plugin](packages/sound-plugin)** - Sound effects (coming soon)

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

## Features

### 3D Plugin
- ✨ Realistic 3D dice models
- 🎮 Physics-based rolling simulation
- 🎨 Multiple themes (fantasy, modern, neon, etc.)
- 🎯 Support for all dice types (d4, d6, d8, d10, d12, d20, d100)
- ⚡ Optimized performance
- 📱 Mobile-friendly

## Documentation

- [Main Dice Roller Docs](https://rakmaster.github.io/dice-roller/)
- [Plugin API Reference](https://rakmaster.github.io/dice-roller/plugins.html)

## License

MIT
