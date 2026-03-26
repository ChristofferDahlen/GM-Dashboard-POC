import { ref, computed } from 'vue'
import { Peer } from 'peerjs'

export function usePeer() {
  const myPeerId = ref('')
  const conns = ref([]) // array of active DataConnections
  const log = ref([])
  let peer = null

  const connectedCount = computed(() => conns.value.length)

  function addLog(msg) {
    const time = new Date().toLocaleTimeString()
    log.value.unshift(`[${time}] ${msg}`)
    if (log.value.length > 50) log.value.pop()
  }

  function init(onData) {
    peer = new Peer()
    peer.on('open', id => {
      myPeerId.value = id
      localStorage.setItem('gm-peer-id', id)
      addLog(`Your Peer ID: ${id}`)
    })
    peer.on('connection', incoming => {
      setupConn(incoming, onData)
      addLog(`Incoming connection from ${incoming.peer}`)
    })
    peer.on('error', err => addLog(`Peer error: ${err.message}`))
  }

  function setupConn(c, onData) {
    c.on('open', () => {
      conns.value.push(c)
      addLog(`Connected: ${c.peer} (${conns.value.length} total)`)
    })
    c.on('data', data => {
      addLog(`Received from ${c.peer}: ${data.type}`)
      onData?.(data)
    })
    c.on('close', () => {
      conns.value = conns.value.filter(x => x.peer !== c.peer)
      addLog(`Disconnected: ${c.peer} (${conns.value.length} remaining)`)
    })
    c.on('error', err => addLog(`Connection error (${c.peer}): ${err.message}`))
  }

  function send(data) {
    conns.value.forEach(c => c.send(data))
  }

  function sendTo(peerId, data) {
    const c = conns.value.find(x => x.peer === peerId)
    c?.send(data)
  }

  function disconnectAll() {
    conns.value.forEach(c => c.close())
  }

  return { myPeerId, conns, connectedCount, log, init, send, sendTo, disconnectAll, addLog }
}
