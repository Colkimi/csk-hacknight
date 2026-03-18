import './style.css'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'


const LEVELS = [
  {
    id: 1,
    name: 'Lemme hack you',
    subtitle: 'OSINT & Port Scanning',
    description: 'An adversary is mapping your perimeter. Passive probes flood each exposed port. Identify the source vectors before they escalate.',
    nodeColor: 0x72f4ff,
    nodeEmissive: 0x105a6a,
    linkColor: 0x3be0ff,
    packetColor: 0x00e5ff,
    bgAccent: 'rgba(0,229,255,0.06)',
    packetsToWin: 30,
    spawnRate: 900,
    spawnBurst: 1,
    nodeCount: 60,
    linkDistance: 5.2,
    terminalEvents: [
      ['info', 'nmap -sS -T4 192.168.0.0/24 — SYN scan initiated.'],
      ['warn', 'shodan.io recon matched 3 public endpoints.'],
      ['info', 'Passive DNS enumeration detected from AS14061.'],
      ['info', 'Banner grab attempt on port 22 and 443.'],
      ['warn', 'Subdomain takeover probe against wildcard DNS.'],
    ],
  },
  {
    id: 2,
    name: 'Now lemme hack your friend',
    subtitle: 'Social Engineering Blitz',
    description: 'Thousands of spear-phish emails carry credential harvesters. Each packet reaching a node exfiltrates a user token. Stop the credential flood.',
    nodeColor: 0xffd06c,
    nodeEmissive: 0x7a5000,
    linkColor: 0xffb84d,
    packetColor: 0xffc34a,
    bgAccent: 'rgba(255,195,74,0.07)',
    packetsToWin: 55,
    spawnRate: 700,
    spawnBurst: 2,
    nodeCount: 70,
    linkDistance: 4.6,
    terminalEvents: [
      ['warn', 'Mass phishing campaign detected — 2,400 targets.'],
      ['crit', 'Credential harvester at phish-kit.ru delivered payload.'],
      ['warn', 'OAuth token theft detected from spoofed login portal.'],
      ['crit', 'MFA bypass via SIM-swap coordinated across 12 accounts.'],
      ['info', 'Email gateway blocked 1,840 of 2,400 malicious messages.'],
    ],
  },
  {
    id: 3,
    name: 'Now I\'LL hack your neighbor',
    subtitle: 'CVE-2026-00X Remote Code Execution',
    description: 'An unpatched RCE in the edge router is being weaponised. Exploit packets race through kernel space. Patch windows are closing fast.',
    nodeColor: 0xff5031,
    nodeEmissive: 0x7a1800,
    linkColor: 0xff6b4a,
    packetColor: 0xff3b2f,
    bgAccent: 'rgba(255,59,47,0.08)',
    packetsToWin: 70,
    spawnRate: 550,
    spawnBurst: 2,
    nodeCount: 75,
    linkDistance: 4.2,
    terminalEvents: [
      ['crit', 'CVE-2026-00X heap overflow triggered in edge-router firmware.'],
      ['crit', 'Shellcode injected into kernel thread 0x7fff4a12.'],
      ['warn', 'Reverse shell established — attacker → 10.0.0.1:4444.'],
      ['crit', 'Root privilege escalation succeeded on node cluster B.'],
      ['warn', 'Patch KB-2026-03 not applied on 18 of 24 edge hosts.'],
    ],
  },
  {
    id: 4,
    name: 'Finally your company this time',
    subtitle: 'WannaCrypt-X Lateral Spread',
    description: 'Ransomware is encrypting and propagating across SMB shares. Every compromised node becomes a new origin point. Break the chain.',
    nodeColor: 0xb8ff43,
    nodeEmissive: 0x3a6200,
    linkColor: 0x9edb30,
    packetColor: 0xabf02c,
    bgAccent: 'rgba(184,255,67,0.07)',
    packetsToWin: 90,
    spawnRate: 450,
    spawnBurst: 3,
    nodeCount: 80,
    linkDistance: 4.0,
    terminalEvents: [
      ['crit', 'WannaCrypt-X encrypting /var/data on host-07 through host-19.'],
      ['crit', 'SMBv1 relay attack spreading payload over subnet 10.10.0.0/16.'],
      ['warn', 'Shadow copy deletion detected — VSS cleared on 12 hosts.'],
      ['crit', 'Bitcoin ransom note deployed: 4.2 BTC per cluster.'],
      ['warn', 'Network isolation triggered for zone C — segmenting spread.'],
    ],
  },
  {
    id: 5,
    name: 'And boom we\'re in your life',
    subtitle: 'Nation-State Data Extraction',
    description: 'A deeply embedded APT group is silently draining terabytes. Packets tunnel through legitimate HTTPS beacons. Detect and sever the C2 channel.',
    nodeColor: 0x63ffd1,
    nodeEmissive: 0x0c5a46,
    linkColor: 0x72ffe9,
    packetColor: 0x2df3d5,
    bgAccent: 'rgba(99,255,209,0.08)',
    packetsToWin: 120,
    spawnRate: 380,
    spawnBurst: 3,
    nodeCount: 90,
    linkDistance: 3.8,
    terminalEvents: [
      ['crit', 'C2 beacon detected: HTTPS POST to cdn-update[.]io every 60s.'],
      ['warn', 'DNS tunnelling exfiltrating 4.7 TB over 48-hour window.'],
      ['crit', 'Steganographic payload found in outbound JPEG stream.'],
      ['warn', 'Living-off-the-land: certutil.exe used as download cradle.'],
      ['crit', 'Lateral movement via pass-the-hash to domain controller.'],
    ],
  },
]

const app = document.querySelector('#app')

app.innerHTML = `
  <div class="noise-overlay" aria-hidden="true"></div>
  <div class="cinema-overlay" aria-hidden="true">
    <div class="cinema-row">
      <span class="rec-dot"></span>
      <span id="rec-status">REC LIVE</span>
      <span id="timecode">00:00:00</span>
    </div>
    <div class="cinema-row right">
      <span>AUTO DIRECTOR</span>
      <span id="threat-level">THREAT: ELEVATED</span>
    </div>
  </div>
  <div class="canvas-wrap" aria-hidden="true"><canvas id="sim-canvas"></canvas></div>

  <div class="center-brand" aria-hidden="true">
    <h1 class="glitch-title" data-text="CSK HACKNIGHT 2026">CSK HACKNIGHT 2026</h1>
    <p class="brand-sub">GENIUS HACKERS CYBERSECURITY LIVE ATTACK TELESYMMETRY</p>
  </div>

  <aside class="right-stack">
    <section class="camera-card">
      <div class="panel-head">
        <span id="camera-status">BOOTING HACKNIGHT</span>
      </div>

    </section>
    <section class="hacklist-card">
      <div class="panel-head">
        <span>Hack List</span>
        <span>Right on top</span>
      </div>
      <ul id="hack-list" class="hack-list">
        <li>Your leaking credentials - Priority 1</li>
        <li>The info you carelessly leave public - Priority 2</li>
        <li>Your magenta vibe coded app - Priority 3</li>
        <li>Your lazy API - Priority 4</li>
      </ul>
    </section>
  </aside>

  <!-- GAME HUD (visible during simulation) -->
  <div id="hud" class="hud">
    <div class="hud-top">
      <div class="hud-left">
        <span id="hud-level" class="hud-value">...</span>
        <span id="hud-levelname" class="hud-levelname"></span>
      </div>
      <div class="hud-center">
        <div class="integrity-bar-wrap">
          <div id="integrity-bar" class="integrity-bar"></div>
          <span id="integrity-pct">100%</span>
        </div>
      </div>
      <div class="hud-right">
        <span class="hud-label"></span>
        <span id="hud-packets" class="hud-value"></span>
        <span class="hud-label" style="margin-top:4px"></span>
        <span id="hud-nodes" class="hud-value hot"></span>
      </div>
    </div>
    <div class="hud-bottom">
      <div class="terminal-hud">
        <div class="terminal-hud-head">
          <span>BOOTING HACKNIGHT...</span>
          <span id="hud-status" class="status-badge">● LIVE</span>
        </div>
        <ul id="terminal-lines" class="terminal-lines"></ul>
        <div class="terminal-input-row">
          <span class="prompt">&gt;_</span>
          <input id="cmd-input" class="cmd-input" type="text" placeholder="type: scan  isolate  patch  status" spellcheck="false" autocomplete="off" />
        </div>
      </div>
    </div>
  </div>
`

const DEVICE_PROFILE = {
  memory: navigator.deviceMemory || 4,
  cores: navigator.hardwareConcurrency || 4,
  mobile: /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
}

const PERF_MODE = (DEVICE_PROFILE.mobile || DEVICE_PROFILE.memory <= 4 || DEVICE_PROFILE.cores <= 4) ? 'balanced' : 'high'
const PERF = PERF_MODE === 'high'
  ? {
      antialias: true,
      pixelRatioMax: 1.6,
      starCount: 1200,
      nodeCountScale: 1,
  terminalCanvas: { w: 352, h: 176 },
      terminalRefreshBase: 0.45,
      terminalRefreshCompromised: 0.2,
      spawnBurstScale: 1,
      spawnRateScale: 1,
      maxPackets: 220,
      beamChance: 0.3,
      bloomStrengthBase: 0.75,
      bloomStrengthMul: 0.7,
      bloomRadiusBase: 0.35,
      bloomRadiusMul: 0.25,
      frameLimitMs: 0,
      reducedMotion: false,
    }
  : {
      antialias: false,
      pixelRatioMax: 1.1,
      starCount: 520,
      nodeCountScale: 0.72,
      terminalCanvas: { w: 224, h: 112 },
      terminalRefreshBase: 1.1,
      terminalRefreshCompromised: 0.55,
      spawnBurstScale: 0.75,
      spawnRateScale: 1.2,
      maxPackets: 110,
      beamChance: 0.08,
      bloomStrengthBase: 0.45,
      bloomStrengthMul: 0.25,
      bloomRadiusBase: 0.2,
      bloomRadiusMul: 0.12,
      frameLimitMs: 1000 / 45,
      reducedMotion: true,
    }

const canvas = document.querySelector('#sim-canvas')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: PERF.antialias, alpha: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, PERF.pixelRatioMax))
renderer.setSize(window.innerWidth, window.innerHeight)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 120)
camera.position.set(0, 0, 18)

const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.8,  
  0.4,  
  0.85  
)
composer.addPass(bloomPass)

const glitchPass = { enabled: false }

const ambient = new THREE.AmbientLight(0x55ffff, 0.5)
const keyLight = new THREE.PointLight(0xff3b3b, 1.4, 60)
keyLight.position.set(10, 6, 10)
const rimLight = new THREE.PointLight(0xa6ff00, 0.8, 50)
rimLight.position.set(-10, -8, 9)
scene.add(ambient, keyLight, rimLight)

scene.fog = new THREE.FogExp2(0x030d14, 0.02)

const root = new THREE.Group()
root.scale.setScalar(1.2)
scene.add(root)

const starGeometry = new THREE.BufferGeometry()
const starCount = PERF.starCount
const starPositions = new Float32Array(starCount * 3)
for (let i = 0; i < starCount * 3; i += 1) starPositions[i] = (Math.random() - 0.5) * 90
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
const stars = new THREE.Points(
  starGeometry,
  new THREE.PointsMaterial({ color: 0x9efff0, size: 0.05, transparent: true, opacity: 0.5 }),
)
scene.add(stars)

let gameState = 'title'  
let currentLevelIndex = 0
let integrity = 100
let packetsBlocked = 0
let nodesHit = 0
let levelNodes = []
let levelLinks = []
let attackPackets = []
let impactFlashes = []
let pulseRings = []
let particleSystems = []  
let terminals3d = []   
let tracers = []        
let attackBeams = []
let spawnIntervalId = null
let logIntervalId = null
let telemetryIntervalId = null
let intelIntervalId = null
let levelStartTime = 0
let introTimeoutId = null
let clearTimeoutId = null
let overTimeoutId = null
let loopTimeoutId = null
let glitchOverlay = document.querySelector('.glitch-overlay') || document.createElement('div')
if (!glitchOverlay.classList.contains('glitch-overlay')) {
  glitchOverlay.className = 'glitch-overlay'
  document.body.appendChild(glitchOverlay)
}

const LEVEL_TRANSITION_MS = 650

let cinematicTime = 0
let cameraShake = { x: 0, y: 0, z: 0, intensity: 0 }
const cameraAnchor = new THREE.Vector3(0, 0, 0)
const cameraTarget = new THREE.Vector3(0, 0, 21)
const cameraShots = [
  { x: 14, y: 6.5, z: 17 },
  { x: -13, y: 5, z: 15.5 },
  { x: 0, y: 10, z: 14.5 },
  { x: 8.5, y: -7.5, z: 20 },
  { x: -9.5, y: -5.5, z: 18.5 },
]
let currentShot = 0
let shotTimer = 0
let attackIntensity = 0.35
let timecodeStartedAt = performance.now()
let intelCursor = 0

let audioContext = null
let masterGain = null
let pulseOsc = null
let pulseLfo = null
let pulseLfoGain = null
let analyser = null
let analyserBins = null
let audioEnabled = false
let audioEnergy = 0

const hudEl           = document.querySelector('#hud')
const hudLevelEl      = document.querySelector('#hud-level')
const hudLevelNameEl  = document.querySelector('#hud-levelname')
const hudPacketsEl    = document.querySelector('#hud-packets')
const hudNodesEl      = document.querySelector('#hud-nodes')
const integrityBarEl  = document.querySelector('#integrity-bar')
const integrityPctEl  = document.querySelector('#integrity-pct')
const terminalLinesEl = document.querySelector('#terminal-lines')
const cmdInput        = document.querySelector('#cmd-input')
const hudStatusEl     = document.querySelector('#hud-status')
const threatLevelEl   = document.querySelector('#threat-level')
const timecodeEl      = document.querySelector('#timecode')
const liveCameraEl    = document.querySelector('#live-camera')
const cameraStatusEl  = document.querySelector('#camera-status')
const cameraSourceEl  = document.querySelector('#camera-source')
const glitchTitleEl   = document.querySelector('.glitch-title')

const ATTACK_TOOLS = ['nmap', 'masscan', 'mimikatz', 'cobalt', 'metasploit', 'hydra', 'responder']
const ATTACK_PHASES = ['recon', 'delivery', 'exploit', 'lateral', 'exfil', 'persistence']
const YOUTUBE_FEED_URL = 'https://www.youtube.com/embed/CJ3dAAna7jQ?autoplay=1&mute=1&controls=0&loop=1&playlist=CJ3dAAna7jQ&modestbranding=1&rel=0'

const FALLBACK_INTEL = [
  'C2 beacon anomaly observed on edge segment D.',
  'Threat actor campaign retooling with signed loader binaries.',
  'SOC raised containment priority on exfiltration channel.',
  'Credential stuffing burst detected across SSO endpoints.',
  'Regional honeynet recorded fresh SMB worm propagation.',
]

function randomIp() {
  return `${10 + Math.floor(Math.random() * 220)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`
}

function randomPort() {
  const common = [21, 22, 53, 80, 123, 135, 139, 389, 443, 445, 1433, 3306, 3389, 4444, 8080]
  return common[Math.floor(Math.random() * common.length)]
}

function makeNodeTerminalLine() {
  const tool = ATTACK_TOOLS[Math.floor(Math.random() * ATTACK_TOOLS.length)]
  const phase = ATTACK_PHASES[Math.floor(Math.random() * ATTACK_PHASES.length)]
  const port = randomPort()
  const style = Math.random()
  const nodeId = String(Math.floor(Math.random() * 99)).padStart(2, '0')

  if (style < 0.34) return `${tool.toUpperCase()} ${phase.toUpperCase()}`
  if (style < 0.67) return `PORT ${port} FLOW +${Math.floor(10 + Math.random() * 90)}`
  return `NODE-${nodeId} ${phase.toUpperCase()} OK`
}

function drawNodeTerminal(ctx, lines, compromised) {
  const w = ctx.canvas.width
  const h = ctx.canvas.height
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = compromised ? 'rgba(30,8,6,0.98)' : 'rgba(1,10,14,0.98)'
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = compromised ? 'rgba(255,124,96,0.7)' : 'rgba(114,244,255,0.56)'
  ctx.lineWidth = 2.5
  ctx.strokeRect(1, 1, w - 2, h - 2)

  ctx.fillStyle = compromised ? 'rgba(255,138,112,0.95)' : 'rgba(148,255,235,0.95)'
  const titleFontPx = Math.max(16, Math.floor(h * 0.18))
  ctx.font = `${titleFontPx}px "Share Tech Mono", monospace`
  ctx.shadowColor = compromised ? 'rgba(255,124,96,0.4)' : 'rgba(114,244,255,0.35)'
  ctx.shadowBlur = 8
  ctx.fillText('SOC NODE LIVE', Math.floor(w * 0.05), Math.floor(h * 0.18))

  ctx.fillStyle = compromised ? 'rgba(255,190,170,0.98)' : 'rgba(166,255,245,0.98)'
  const lineFontPx = Math.max(14, Math.floor(h * 0.15))
  const lineGap = Math.max(22, Math.floor(lineFontPx * 1.4))
  ctx.font = `${lineFontPx}px "Share Tech Mono", monospace`
  ctx.shadowBlur = 7
  const maxLineWidth = Math.floor(w * 0.94)

  const trimLine = (line) => {
    if (ctx.measureText(line).width <= maxLineWidth) return line
    let out = line
    while (out.length > 3 && ctx.measureText(`${out}..`).width > maxLineWidth) {
      out = out.slice(0, -1)
    }
    return `${out}..`
  }

  for (let i = 0; i < lines.length; i += 1) {
    ctx.fillText(trimLine(lines[i]), Math.floor(w * 0.04), Math.floor(h * 0.36) + i * lineGap)
  }
  ctx.shadowBlur = 0
}

function setThreatHud() {
  if (!threatLevelEl) return
  const level = attackIntensity > 0.72 ? 'THREAT: CRITICAL' : attackIntensity > 0.45 ? 'THREAT: HIGH' : 'THREAT: ELEVATED'
  threatLevelEl.textContent = level
}

function tickTimecode() {
  if (!timecodeEl) return
  const sec = Math.floor((performance.now() - timecodeStartedAt) / 1000)
  const hh = String(Math.floor(sec / 3600)).padStart(2, '0')
  const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, '0')
  const ss = String(sec % 60).padStart(2, '0')
  timecodeEl.textContent = `${hh}:${mm}:${ss}`
}

function clearAutoTimers() {
  clearTimeout(introTimeoutId)
  clearTimeout(clearTimeoutId)
  clearTimeout(overTimeoutId)
}

function clearGameplayIntervals() {
  clearInterval(spawnIntervalId)
  clearInterval(logIntervalId)
  clearInterval(telemetryIntervalId)
  clearInterval(intelIntervalId)
}

function hideHud() { hudEl.classList.add('hidden') }
function showHud() { hudEl.classList.remove('hidden') }


function pushLine(severity, msg) {
  const li = document.createElement('li')
  li.className = `line-${severity}`
  const ts = new Date().toLocaleTimeString('en-US', { hour12: false })
  li.textContent = `${ts}  ${msg}`
  terminalLinesEl.prepend(li)
  while (terminalLinesEl.childElementCount > 10) {
    terminalLinesEl.removeChild(terminalLinesEl.lastElementChild)
  }
}

function pushAutoTelemetry(levelDef) {
  const srcIp = randomIp()
  const dstIp = randomIp()
  const port = randomPort()
  const tool = ATTACK_TOOLS[Math.floor(Math.random() * ATTACK_TOOLS.length)]
  const phase = ATTACK_PHASES[Math.floor(Math.random() * ATTACK_PHASES.length)]
  const styleRoll = Math.random()

  if (styleRoll < 0.34) {
    pushLine('info', `cmd> ${tool} --phase ${phase} --target ${dstIp} --port ${port}`)
  } else if (styleRoll < 0.68) {
    pushLine('warn', `${srcIp}:${port} -> ${dstIp}:${port}  anomalous burst ${Math.floor(120 + Math.random() * 900)} pps`)
  } else {
    const lvlEvent = levelDef.terminalEvents[Math.floor(Math.random() * levelDef.terminalEvents.length)]
    pushLine(lvlEvent[0], `${lvlEvent[1]} [src=${srcIp}]`)
  }
}

const CMD_RESPONSES = {
  scan:    [['info', 'Network scan: 6 anomalous flows detected on segments B and D.']],
  isolate: [['warn', 'Segment isolation applied — 4 compromised routes quarantined.'], ['info', 'Integrity recovery +3%. Monitoring restarted.']],
  patch:   [['info', 'Emergency patch KB-0037 applied — 2 attack vectors closed.'], ['info', 'Blue team deployed countermeasures on cluster 3.']],
  status:  () => {
    const lvl = LEVELS[currentLevelIndex]
    return [
      ['info', `Level ${lvl.id}: ${lvl.name} — ${lvl.subtitle}`],
      ['info', `Integrity: ${Math.round(integrity)}%  |  Packets blocked: ${packetsBlocked}  |  Nodes hit: ${nodesHit}`],
    ]
  },
  help:    [['info', 'Commands: scan | isolate | patch | status']],
}

async function initLiveCameraFeed() {
  if (!liveCameraEl || !cameraStatusEl || !cameraSourceEl) return

  cameraStatusEl.textContent = 'YT LIVE'
  cameraSourceEl.textContent = 'YouTube CCTV Stream'
  try {
    liveCameraEl.src = YOUTUBE_FEED_URL
    pushLine('info', '[CCTV] YouTube feed connected.')
  } catch {
    cameraStatusEl.textContent = 'SOURCE ERROR'
    cameraSourceEl.textContent = 'Feed unavailable'
    pushLine('warn', '[CCTV] failed to attach YouTube feed.')
  }
}

async function pushThreatIntelLine() {
  const timeout = new AbortController()
  const timer = setTimeout(() => timeout.abort(), 5000)
  try {
    const resp = await fetch('https://hn.algolia.com/api/v1/search?query=cybersecurity&tags=story', {
      signal: timeout.signal,
    })
    if (!resp.ok) throw new Error('feed request failed')
    const data = await resp.json()
    const hits = (data.hits || []).filter((item) => item.title)
    if (!hits.length) throw new Error('empty intel feed')
    const item = hits[intelCursor % hits.length]
    intelCursor += 1
    pushLine('info', `[INTEL API] ${item.title}`)
  } catch {
    const fallback = FALLBACK_INTEL[Math.floor(Math.random() * FALLBACK_INTEL.length)]
    pushLine('warn', `[INTEL CACHE] ${fallback}`)
  } finally {
    clearTimeout(timer)
  }
}

function startThreatIntelFeed() {
  pushThreatIntelLine()
  intelIntervalId = setInterval(() => {
    pushThreatIntelLine()
  }, 14000)
}

function initAudioPulseEngine() {
  if (audioContext) return
  audioContext = new window.AudioContext()
  masterGain = audioContext.createGain()
  masterGain.gain.value = 0

  pulseOsc = audioContext.createOscillator()
  pulseOsc.type = 'sawtooth'
  pulseOsc.frequency.value = 120

  pulseLfo = audioContext.createOscillator()
  pulseLfo.type = 'sine'
  pulseLfo.frequency.value = 5.5

  pulseLfoGain = audioContext.createGain()
  pulseLfoGain.gain.value = 14

  analyser = audioContext.createAnalyser()
  analyser.fftSize = 64
  analyserBins = new Uint8Array(analyser.frequencyBinCount)

  pulseLfo.connect(pulseLfoGain)
  pulseLfoGain.connect(pulseOsc.frequency)
  pulseOsc.connect(masterGain)
  masterGain.connect(analyser)
  analyser.connect(audioContext.destination)

  pulseOsc.start()
  pulseLfo.start()
}

async function enableAudioPulse() {
  try {
    initAudioPulseEngine()
    if (!audioContext) return
    if (audioContext.state !== 'running') await audioContext.resume()
    audioEnabled = true
    pushLine('info', '[AUDIO] Reactive pulse engine enabled.')
  } catch {
    pushLine('warn', '[AUDIO] Browser blocked audio autoplay.')
  }
}

function armAudioGestureUnlock() {
  window.addEventListener('pointerdown', enableAudioPulse, { once: true })
  window.addEventListener('keydown', enableAudioPulse, { once: true })
}


function updateHud() {
  const pct = Math.max(0, Math.round(integrity))
  hudPacketsEl.textContent = packetsBlocked
  hudNodesEl.textContent   = nodesHit
  integrityPctEl.textContent = `${pct}%`
  integrityBarEl.style.width = `${pct}%`
  integrityBarEl.style.background =
    pct > 60 ? 'linear-gradient(90deg, #72f4ff, #b8ff43)' :
    pct > 30 ? 'linear-gradient(90deg, #ffd06c, #ff8746)' :
               'linear-gradient(90deg, #ff5031, #ff3b2f)'
}

function buildScene(lvl) {
  for (const n of levelNodes) {
    root.remove(n)
    if (n.userData?.screenTexture) n.userData.screenTexture.dispose()
    n.traverse((child) => {
      if (!child.geometry) return
      child.geometry.dispose()
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => {
          if (m.map) m.map.dispose()
          m.dispose()
        })
      } else if (child.material) {
        if (child.material.map) child.material.map.dispose()
        child.material.dispose()
      }
    })
  }
  for (const l of levelLinks) { root.remove(l); l.geometry.dispose(); l.material.dispose() }
  for (const r of pulseRings) { root.remove(r); r.geometry.dispose(); r.material.dispose() }
  for (const p of attackPackets) { root.remove(p); p.geometry.dispose(); p.material.dispose() }
  for (const f of impactFlashes) { root.remove(f); f.geometry.dispose(); f.material.dispose() }
  for (const beam of attackBeams) { root.remove(beam); beam.geometry.dispose(); beam.material.dispose() }
  for (const shard of terminals3d) { root.remove(shard); shard.geometry.dispose(); shard.material.dispose() }
  levelNodes = []; levelLinks = []; pulseRings = []; attackPackets = []; impactFlashes = []
  attackBeams = []
  terminals3d = []

  const targetNodeCount = Math.max(26, Math.floor(lvl.nodeCount * PERF.nodeCountScale))
  for (let i = 0; i < targetNodeCount; i += 1) {
    const nodeGeo = new THREE.BoxGeometry(0.54, 0.36, 0.18)
    const mat = new THREE.MeshStandardMaterial({
      color: lvl.nodeColor,
      emissive: lvl.nodeEmissive,
      metalness: 0.45,
      roughness: 0.35,
    })
    const mesh = new THREE.Mesh(nodeGeo, mat)
    const terminalCanvas = document.createElement('canvas')
    terminalCanvas.width = PERF.terminalCanvas.w
    terminalCanvas.height = PERF.terminalCanvas.h
    const terminalCtx = terminalCanvas.getContext('2d')
    const terminalLineCount = terminalCanvas.height <= 112 ? 1 : 2
    const terminalLines = []
    for (let line = 0; line < terminalLineCount; line += 1) terminalLines.push(makeNodeTerminalLine())
    drawNodeTerminal(terminalCtx, terminalLines, false)
    const screenTexture = new THREE.CanvasTexture(terminalCanvas)
    screenTexture.generateMipmaps = false
    screenTexture.minFilter = THREE.LinearFilter
    screenTexture.magFilter = THREE.NearestFilter
    screenTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4)
    screenTexture.needsUpdate = true

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.62, 0.4),
      new THREE.MeshBasicMaterial({
        map: screenTexture,
        color: 0xffffff,
        transparent: true,
        opacity: 1,
      }),
    )
    screen.position.z = 0.102
    const screenGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.76, 0.48),
      new THREE.MeshBasicMaterial({
        color: lvl.linkColor,
        transparent: true,
        opacity: 0.52,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    screenGlow.position.z = 0.096
    mesh.add(screen)
    mesh.add(screenGlow)
    const radius = 7.5 + Math.random() * 4.5
    const theta = Math.random() * Math.PI * 2
    const phi   = Math.acos(2 * Math.random() - 1)
    mesh.position.set(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi),
    )
    mesh.userData = {
      base: mesh.position.clone(),
      speed: 0.35 + Math.random() * 0.7,
      offset: Math.random() * Math.PI * 2,
      compromised: false,
      screen,
      screenGlow,
      terminalCanvas,
      terminalCtx,
      terminalLines,
      terminalTimer: PERF.terminalRefreshBase + Math.random() * 1.8,
      screenTexture,
    }
    levelNodes.push(mesh)
    root.add(mesh)
  }

  for (let i = 0; i < levelNodes.length; i += 1) {
    for (let j = i + 1; j < levelNodes.length; j += 1) {
      const d = levelNodes[i].position.distanceTo(levelNodes[j].position)
      if (d < lvl.linkDistance && Math.random() > 0.52) {
        const geo = new THREE.BufferGeometry().setFromPoints([
          levelNodes[i].position, levelNodes[j].position,
        ])
        const mat = new THREE.LineBasicMaterial({ color: lvl.linkColor, transparent: true, opacity: 0.28 })
        const line = new THREE.Line(geo, mat)
        line.userData = { a: levelNodes[i], b: levelNodes[j] }
        levelLinks.push(line)
        root.add(line)
      }
    }
  }

  for (let i = 0; i < 4; i += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.5 + i * 1.8, 0.025, 8, 80),
      new THREE.MeshBasicMaterial({ color: lvl.nodeColor, transparent: true, opacity: 0.14 }),
    )
    ring.rotation.x = Math.PI / 2.2
    ring.position.z = -2.5 + i * 1.2
    pulseRings.push(ring)
    root.add(ring)
  }

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.8, 2),
    new THREE.MeshStandardMaterial({
      color: lvl.nodeColor,
      emissive: lvl.nodeColor,
      emissiveIntensity: 0.35,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    }),
  )
  core.userData = { core: true }
  terminals3d.push(core)
  root.add(core)

  for (let i = 0; i < 20; i += 1) {
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(1.55, 0.95),
      new THREE.MeshBasicMaterial({
        color: lvl.packetColor,
        transparent: true,
        opacity: 0.16 + Math.random() * 0.2,
        side: THREE.DoubleSide,
      }),
    )
    const a = (i / 20) * Math.PI * 2
    const r = 9.5 + Math.random() * 3
    panel.position.set(Math.cos(a) * r, -6 + Math.random() * 12, Math.sin(a) * r)
    panel.lookAt(0, 0, 0)
    panel.userData = { spin: 0.3 + Math.random() * 1.4, wobble: Math.random() * Math.PI * 2 }
    terminals3d.push(panel)
    root.add(panel)
  }

  keyLight.color.setHex(lvl.packetColor)
}

function spawnPackets(lvl) {
  if (levelLinks.length === 0) return
  if (attackPackets.length >= PERF.maxPackets) return

  const burstCount = Math.max(1, Math.floor(lvl.spawnBurst * PERF.spawnBurstScale + Math.random() * 0.45))
  for (let b = 0; b < burstCount; b += 1) {
    const link = levelLinks[Math.floor(Math.random() * levelLinks.length)]
    const reverse = Math.random() > 0.5
    const packet = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 8),
      new THREE.MeshBasicMaterial({ color: lvl.packetColor, transparent: true, opacity: 1.0 }),
    )
    packet.userData = {
      link, reverse,
      progress: 0,
      speed: 0.65 + Math.random() * 0.8,
      tracer: null
    }
    attackPackets.push(packet)
    root.add(packet)

    const tracerGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.3, 8)
    const tracerMat = new THREE.MeshStandardMaterial({
      color: lvl.packetColor, 
      transparent: true, 
      opacity: 0.9,
      emissive: lvl.packetColor,
      emissiveIntensity: 0.5
    })
    const tracer = new THREE.Mesh(tracerGeo, tracerMat)
    tracer.rotation.z = Math.PI / 2
    packet.userData.tracer = tracer
    tracers.push(tracer)
    root.add(tracer)

    if (Math.random() < PERF.beamChance) {
      const beamGeo = new THREE.TubeGeometry(
        new THREE.LineCurve3(link.userData.a.position.clone(), link.userData.b.position.clone()),
        20,
        0.015,
        6,
        false,
      )
      const beam = new THREE.Mesh(
        beamGeo,
        new THREE.MeshBasicMaterial({ color: lvl.packetColor, transparent: true, opacity: 0.24 }),
      )
      beam.userData = { life: 0.36 }
      attackBeams.push(beam)
      root.add(beam)
    }

    packetsBlocked += 1
  }
  attackIntensity = Math.min(1, attackIntensity + 0.012)
  setThreatHud()
  updateHud()
  checkWin()
}

function impactNode(node, lvl) {
  const flash = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 10, 10),
    new THREE.MeshBasicMaterial({ color: lvl.packetColor, transparent: true, opacity: 1.2 }),
  )
  flash.position.copy(node.position)
  flash.userData = { life: 0.6 }
  impactFlashes.push(flash)
  root.add(flash)

  cameraShake.x = (Math.random() - 0.5) * 2
  cameraShake.y = (Math.random() - 0.5) * 2
  cameraShake.z = Math.random() * 1
  cameraShake.intensity = 1.5
  attackIntensity = Math.min(1, attackIntensity + 0.08)
  setThreatHud()

  if (!node.userData.compromised && Math.random() < 0.28) {
    node.userData.compromised = true
    node.material.color.setHex(0xff4422)
    node.material.emissive.setHex(0x881100)
    if (node.userData.screen?.material) {
      node.userData.screen.material.color.setHex(0xffb39d)
      node.userData.screen.material.opacity = 1
    }
    if (node.userData.screenGlow?.material) {
      node.userData.screenGlow.material.color.setHex(0xff8d72)
      node.userData.screenGlow.material.opacity = 0.72
    }
    if (node.userData.terminalCtx) {
      drawNodeTerminal(node.userData.terminalCtx, node.userData.terminalLines, true)
      if (node.userData.screenTexture) node.userData.screenTexture.needsUpdate = true
    }
    node.scale.set(1.4, 1.4, 1.4)
    nodesHit += 1
    integrity = Math.max(0, integrity - (2.2 + currentLevelIndex * 0.7))
    const lvlDef = LEVELS[currentLevelIndex]
    const events = lvlDef.terminalEvents
    pushLine('crit', events[Math.floor(Math.random() * events.length)][1])
    updateHud()
    checkGameOver()
    hudStatusEl.textContent = '● BREACH'
    hudStatusEl.style.color = 'var(--hot)'
    setTimeout(() => { hudStatusEl.textContent = '● LIVE'; hudStatusEl.style.color = '' }, 1200)
  }
}

function checkWin() {
  const lvl = LEVELS[currentLevelIndex]
  if (packetsBlocked >= lvl.packetsToWin) {
    endLevel('clear')
  }
}

function checkGameOver() {
  if (integrity <= 0) {
    endLevel('over')
  }
}

function endLevel(result) {
  clearGameplayIntervals()
  clearAutoTimers()
  gameState = 'transition'

  if (result === 'clear') {
    const justCleared = LEVELS[currentLevelIndex]
    pushLine('info', `[LEVEL CLEARED] ${justCleared.name} neutralised.`)
    currentLevelIndex = (currentLevelIndex + 1) % LEVELS.length
    clearTimeoutId = setTimeout(() => startLevel('next'), LEVEL_TRANSITION_MS)
    return
  }

  pushLine('crit', '[BREACH] Integrity reached zero. Rebuilding mesh and restarting level.')
  overTimeoutId = setTimeout(() => startLevel('retry'), LEVEL_TRANSITION_MS)
}

function startLevel(mode = 'fresh') {
  clearAutoTimers()
  const lvl = LEVELS[currentLevelIndex]
  integrity = 100
  packetsBlocked = 0
  nodesHit = 0
  levelStartTime = Date.now()
  buildScene(lvl)

  hudLevelEl.textContent   = '...'
  hudLevelNameEl.textContent = lvl.name
  if (mode === 'fresh') terminalLinesEl.innerHTML  = '...'
  if (mode === 'fresh') pushLine('info', `[PERF MODE] ${PERF_MODE.toUpperCase()} (cores=${DEVICE_PROFILE.cores}, memory=${DEVICE_PROFILE.memory}GB)`)
  pushLine('info', `[SIM START] Level ${lvl.id}: ${lvl.name} — ${lvl.subtitle}`)
  if (mode === 'next') pushLine('warn', '[AUTO TRANSITION] Injecting next threat profile.')
  if (mode === 'retry') pushLine('warn', '[AUTO RECOVERY] Rehydrating compromised topology.')
  updateHud()

  showHud()
  gameState = 'playing'
  attackIntensity = 0.4 + currentLevelIndex * 0.08
  setThreatHud()

  spawnIntervalId = setInterval(() => spawnPackets(lvl), Math.floor(lvl.spawnRate * PERF.spawnRateScale))
  logIntervalId   = setInterval(() => {
    const events = lvl.terminalEvents
    const [sev, msg] = events[Math.floor(Math.random() * events.length)]
    pushLine(sev, msg)
  }, 2200)
  telemetryIntervalId = setInterval(() => {
    pushAutoTelemetry(lvl)
  }, 520)
  startThreatIntelFeed()
}

showHud()
startLevel('fresh')
initLiveCameraFeed()
armAudioGestureUnlock()

window.addEventListener('pointermove', () => {}) // no-op
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)
})

const clock = new THREE.Clock()
let frameIndex = 0
let lastRenderAt = 0

function animate(now = 0) {
  if (PERF.frameLimitMs > 0 && (now - lastRenderAt) < PERF.frameLimitMs) {
    requestAnimationFrame(animate)
    return
  }

  lastRenderAt = now
  const deltaFactor = Math.min(clock.getDelta(), 0.05) * 60
  const t = clock.getElapsedTime()
  cinematicTime += 0.016 * deltaFactor
  frameIndex += 1
  const isReducedFrame = PERF.reducedMotion && (frameIndex % 2 === 1)
  tickTimecode()

  shotTimer += 0.016 * deltaFactor
  if (shotTimer > 4.2) {
    currentShot = (currentShot + 1) % cameraShots.length
    shotTimer = 0
  }
  const shot = cameraShots[currentShot]
  cameraTarget.x = shot.x + Math.sin(t * 0.35 + currentShot) * 2.2
  cameraTarget.y = shot.y + Math.cos(t * 0.28 + currentShot) * 1.5
  cameraTarget.z = shot.z + Math.sin(t * 0.18) * 2.5
  camera.position.lerp(cameraTarget, 0.022)
  camera.position.x += cameraShake.x * cameraShake.intensity
  camera.position.y += cameraShake.y * cameraShake.intensity
  camera.position.z += cameraShake.z * cameraShake.intensity
  camera.lookAt(cameraAnchor)
  cameraShake.intensity *= 0.92 // decay

  root.rotation.y = t * (PERF.reducedMotion ? 0.05 : 0.07)
  root.rotation.x = Math.sin(t * 0.03) * (PERF.reducedMotion ? 0.05 : 0.08)
  stars.rotation.y = -t * 0.009

  for (const node of levelNodes) {
    node.position.x = node.userData.base.x + Math.sin(t * node.userData.speed + node.userData.offset) * 0.28
    node.position.y = node.userData.base.y + Math.cos(t * (node.userData.speed + 0.2) + node.userData.offset) * 0.28
    node.position.z = node.userData.base.z + Math.sin(t * (node.userData.speed + 0.1)) * 0.18
    node.lookAt(camera.position)
    if (!node.userData.compromised) {
      node.material.emissiveIntensity = 0.38 + 0.34 * Math.sin(t * 2.1 + node.userData.offset)
      if (node.userData.screen?.material) {
        node.userData.screen.material.opacity = 0.95 + Math.abs(Math.sin(t * 3.2 + node.userData.offset)) * 0.05
      }
      if (node.userData.screenGlow?.material) {
        node.userData.screenGlow.material.opacity = 0.46 + Math.abs(Math.sin(t * 2.4 + node.userData.offset)) * 0.26
      }
    } else {
      node.material.emissiveIntensity = 0.7 + 0.5 * Math.abs(Math.sin(t * 4 + node.userData.offset))
      if (node.userData.screen?.material) {
        node.userData.screen.material.opacity = 0.97 + Math.abs(Math.sin(t * 5.2 + node.userData.offset)) * 0.03
      }
      if (node.userData.screenGlow?.material) {
        node.userData.screenGlow.material.opacity = 0.68 + Math.abs(Math.sin(t * 5.1 + node.userData.offset)) * 0.24
      }
    }

    node.userData.terminalTimer -= 0.016 * deltaFactor
    if (node.userData.terminalTimer <= 0 && node.userData.terminalCtx) {
      node.userData.terminalTimer = (node.userData.compromised ? PERF.terminalRefreshCompromised : PERF.terminalRefreshBase) + Math.random() * 1.2
      node.userData.terminalLines.shift()
      node.userData.terminalLines.push(makeNodeTerminalLine())
      drawNodeTerminal(node.userData.terminalCtx, node.userData.terminalLines, node.userData.compromised)
      if (node.userData.screenTexture) node.userData.screenTexture.needsUpdate = true
    }
  }

  for (const line of levelLinks) {
    const { a, b } = line.userData
    if (!isReducedFrame) {
      const pos = line.geometry.attributes.position
      pos.setXYZ(0, a.position.x, a.position.y, a.position.z)
      pos.setXYZ(1, b.position.x, b.position.y, b.position.z)
      pos.needsUpdate = true
    }
    line.material.opacity = 0.15 + Math.abs(Math.sin(t * 1.3 + a.userData.offset)) * 0.22
  }

  pulseRings.forEach((ring, i) => {
    ring.scale.setScalar(1 + Math.sin(t * 1.5 + i) * 0.055)
    ring.material.opacity = 0.08 + Math.abs(Math.sin(t * 1.1 + i)) * 0.16
  })

  for (const beam of attackBeams) {
    beam.userData.life -= 0.016 * deltaFactor
    beam.material.opacity = Math.max(0, beam.userData.life * 0.65)
  }
  for (let i = attackBeams.length - 1; i >= 0; i -= 1) {
    const beam = attackBeams[i]
    if (beam.userData.life <= 0) {
      root.remove(beam)
      beam.geometry.dispose()
      beam.material.dispose()
      attackBeams.splice(i, 1)
    }
  }

  for (const panel of terminals3d) {
    panel.rotation.y += 0.003 + (panel.userData.spin || 0.2) * 0.002
    panel.position.y += Math.sin(t * (panel.userData.spin || 0.4) + (panel.userData.wobble || 0)) * 0.002
  }

  if (audioEnabled && audioContext && pulseOsc && masterGain) {
    const now = audioContext.currentTime
    const pulseFreq = 100 + attackIntensity * 220 + Math.sin(t * 4.6) * 9
    const pulseGain = 0.006 + attackIntensity * 0.022
    pulseOsc.frequency.setTargetAtTime(pulseFreq, now, 0.08)
    masterGain.gain.setTargetAtTime(pulseGain, now, 0.1)
    if (analyser && analyserBins) {
      analyser.getByteFrequencyData(analyserBins)
      let total = 0
      for (let i = 0; i < analyserBins.length; i += 1) total += analyserBins[i]
      audioEnergy = (total / analyserBins.length) / 255
    }
  } else {
    audioEnergy = 0
  }

  for (let i = attackPackets.length - 1; i >= 0; i -= 1) {
    const pkt = attackPackets[i]
    const { link, reverse, tracer } = pkt.userData
    const src = reverse ? link.userData.b : link.userData.a
    const tgt = reverse ? link.userData.a : link.userData.b
    pkt.userData.progress += pkt.userData.speed * 0.006 * deltaFactor
    pkt.position.lerpVectors(src.position, tgt.position, pkt.userData.progress)
    pkt.material.opacity = 0.4 + 0.6 * (1 - pkt.userData.progress)

    if (tracer) {
      tracer.position.copy(pkt.position)
      tracer.lookAt(tgt.position)
      tracer.material.opacity = pkt.material.opacity
      tracer.material.emissiveIntensity = 0.3 + pkt.userData.progress * 0.7
    }

    if (pkt.userData.progress >= 1) {
      if (gameState === 'playing') impactNode(tgt, LEVELS[currentLevelIndex])
      if (tracer) {
        root.remove(tracer)
        tracer.geometry.dispose()
        tracer.material.dispose()
        tracers.splice(tracers.indexOf(tracer), 1)
      }
      root.remove(pkt); pkt.geometry.dispose(); pkt.material.dispose()
      attackPackets.splice(i, 1)
    }
  }

  for (let i = impactFlashes.length - 1; i >= 0; i -= 1) {
    const f = impactFlashes[i]
    f.userData.life -= 0.018 * deltaFactor
    f.scale.setScalar(1 + (0.5 - f.userData.life) * 3.5)
    f.material.opacity = Math.max(0, f.userData.life * 1.6)
    if (f.userData.life <= 0) {
      root.remove(f); f.geometry.dispose(); f.material.dispose()
      impactFlashes.splice(i, 1)
    }
  }

  bloomPass.strength = PERF.bloomStrengthBase + attackIntensity * PERF.bloomStrengthMul
  bloomPass.radius = PERF.bloomRadiusBase + attackIntensity * PERF.bloomRadiusMul
  attackIntensity = Math.max(0.32, attackIntensity * Math.pow(0.998, deltaFactor))
  if (glitchTitleEl) {
    glitchTitleEl.style.setProperty('--audio-level', String(audioEnergy.toFixed(3)))
  }
  setThreatHud()
  composer.render()
  requestAnimationFrame(animate)
}

animate()
