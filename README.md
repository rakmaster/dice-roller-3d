# 🎲 Dice Roller 3D

Three.js 3D dice animation plugin for [@dice-roller](https://github.com/rakmaster/dice-roller).

## Installation

```bash
npm install @dice-roller/3d
```

## Usage

```vue
<script setup>
import { VDiceRoller } from '@dice-roller/vue';
import { DiceRoller3DPlugin } from '@dice-roller/3d';

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

- ✨ **Realistic 3D dice** - Proper geometry for d4, d6, d8, d10, d12, d20
- 🎮 **Physics simulation** - Powered by Cannon.js
- 🎨 **Multiple themes** - Fantasy, modern, neon, and more
- ⚡ **Optimized** - Efficient rendering and cleanup
- 📱 **Mobile-friendly** - Works on all devices

## Themes

- **default** - Clean blue dice with standard lighting
- **fantasy** - Purple mystical dice with magical atmosphere
- **modern** - Green minimalist dice with clean aesthetics
- **neon** - Red glowing dice with cyberpunk vibes

## Documentation

- [Main Dice Roller Docs](https://rakmaster.github.io/dice-roller/)
- [Plugin Interface](https://rakmaster.github.io/dice-roller/#animation-plugins)

## License

MIT
