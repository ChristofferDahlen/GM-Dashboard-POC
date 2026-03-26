<script setup>
defineProps({
  myPeerId: String,
  connectedCount: Number,
})

const emit = defineEmits(['openPlayerApp', 'broadcastAll', 'disconnectAll'])
</script>

<template>
  <div class="panel">
    <h2>Connection</h2>
    <p v-if="myPeerId">Your Peer ID: <span class="peer-id">{{ myPeerId }}</span></p>
    <button @click="emit('openPlayerApp')" style="margin: 10px 8px 12px 0">Open Player App</button>
    <button @click="emit('broadcastAll')" :disabled="connectedCount === 0">Broadcast All</button>

    <div class="status">
      <span :class="['dot', connectedCount > 0 ? 'active' : 'idle']"></span>
      {{ connectedCount }} player{{ connectedCount === 1 ? '' : 's' }} connected
    </div>

    <button v-if="connectedCount > 0" @click="emit('disconnectAll')" class="danger">
      Disconnect All
    </button>
  </div>
</template>

<style scoped>
.status { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; margin: 12px 0 8px; }
.dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.dot.active { background: #6f6; box-shadow: 0 0 6px #6f6; }
.dot.idle { background: #666; }
.danger { background: #8b0000; color: #f0d9a0; }
.danger:hover { background: #b00000; }
</style>
