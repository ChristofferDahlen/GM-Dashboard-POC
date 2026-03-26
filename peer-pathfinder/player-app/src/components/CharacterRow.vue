<script setup>
const props = defineProps({ char: Object })

function hpPercent(char) {
  return Math.max(0, Math.min(100, (char.hp / char.hpMax) * 100))
}

function hpColor(char) {
  const pct = hpPercent(char)
  if (pct > 60) return '#4caf50'
  if (pct > 30) return '#ff9800'
  return '#f44336'
}
</script>

<template>
  <div class="row">
    <div class="init-badge">{{ char.initiative }}</div>
    <div class="info">
      <div class="name">{{ char.name }} <span class="player">{{ char.player }}</span></div>
      <div class="stats">
        <div class="stat-box">
          <div class="val" :style="{ color: hpColor(char) }">{{ char.hp }}/{{ char.hpMax }}</div>
          <div class="lbl">HP</div>
          <div class="hp-bar">
            <div class="hp-fill" :style="{ width: hpPercent(char) + '%', background: hpColor(char) }"></div>
          </div>
        </div>
        <div class="stat-box">
          <div class="val">{{ char.ac }}</div>
          <div class="lbl">AC</div>
        </div>
      </div>
      <div class="conditions" v-if="char.conditions?.length">
        <span class="badge" v-for="cond in char.conditions" :key="cond">{{ cond }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.row { display: flex; align-items: center; gap: 12px; background: #0a0a1a; border: 1px solid #7ab0e033; border-radius: 6px; padding: 10px 14px; }
.init-badge { background: #7ab0e0; color: #0a0a1a; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem; flex-shrink: 0; }
.info { flex: 1; }
.name { font-size: 1rem; font-weight: bold; color: #c8d8f0; }
.player { font-size: 0.75rem; color: #7ab0e0; font-weight: normal; margin-left: 6px; }
.stats { display: flex; gap: 16px; margin-top: 4px; }
.stat-box { text-align: center; }
.val { font-size: 1.1rem; font-weight: bold; }
.lbl { font-size: 0.65rem; color: #7ab0e0; text-transform: uppercase; }
.hp-bar { width: 80px; height: 8px; background: #1a1a3a; border-radius: 4px; overflow: hidden; margin-top: 4px; }
.hp-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
.conditions { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.badge { padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; background: #1a1a4a; border: 1px solid #7ab0e066; color: #a0b8d0; }
</style>
