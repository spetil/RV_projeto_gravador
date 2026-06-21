<template>
  <div class="praca-container">

    <!-- Tela inicial: pede permissão de câmera/localização -->
    <div v-if="status === 'idle'" class="start-screen">
      <h2>Bem-vindo à Praça do Leão 🦁</h2>
      <p>Toque para liberar a câmera e a localização. A experiência começa sozinha quando você chegar perto do ponto certo.</p>
      <button @click="iniciarExperiencia" class="btn-play">Permitir câmera e localização</button>
    </div>

    <!-- Buscando localização -->
    <div v-if="status === 'localizando'" class="start-screen">
      <h2>Procurando sua localização...</h2>
      <p>Mantenha o GPS ativado.</p>
    </div>

    <!-- Longe do ponto -->
    <div v-if="status === 'longe'" class="start-screen">
      <h2>Aproxime-se da Praça do Leão 🦁</h2>
      <p v-if="distanciaAtual !== null">
        Faltam aproximadamente <strong>{{ Math.round(distanciaAtual) }}m</strong>
      </p>
      <p v-else>Calculando distância...</p>
    </div>

    <!-- Erro de permissão -->
    <div v-if="status === 'erro'" class="start-screen">
      <h2>Não foi possível iniciar 😕</h2>
      <p>{{ mensagemErro }}</p>
      <button @click="iniciarExperiencia" class="btn-play">Tentar novamente</button>
    </div>

    <!-- AR ativa: modelo 3D + áudio tocando sozinho -->
    <div v-if="status === 'ar'" class="ar-wrapper">
      <a-scene
        vr-mode-ui="enabled: false"
        arjs="sourceType: webcam; videoTexture: true; debugUIEnabled: false;"
        renderer="logarithmicDepthBuffer: true;"
        embedded
      >
        <a-camera gps-camera rotation-reading-method="game-rotation-vector"></a-camera>

        <a-entity
          ref="modeloRef"
          gltf-model="url(/vintage radio.glb)"
          scale="1 1 1"
          gps-entity-place="latitude: -4.466107; longitude: -38.900730;"
          rotation="0 180 0"
        ></a-entity>
      </a-scene>

      <audio
        ref="meuAudio"
        :src="audioAtualUrl"
        @ended="tocarProximo"
        class="audio-hidden"
      ></audio>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { createClient } from '@supabase/supabase-js'

// não coloquei essa bomba em variável de ambiente pq é só leitura mesmo, n tem segredo nenhum
const supabaseUrl = 'https://ppsdcoifaifrfgzovwwu.supabase.co'
const supabaseKey = 'sb_publishable_I1kgINGoMJ6h5UYt-q2Kyw_j7-ZP-Wv'
const supabase = createClient(supabaseUrl, supabaseKey)

// ======================================================================
// 👉 CONFIGURAÇÃO DO PONTO DA PRAÇA DO LEÃO — EDITE AQUI
// ======================================================================
const PONTO_PRACA = {
  latitude: -4.466138,   // <-- -4.466138, -38.900819
  longitude: -38.900819, // <-- TROQUE pela longitude real da Praça do Leão
}

// Raio de ativação: distância (em metros) que o usuário precisa estar
// do PONTO_PRACA para a câmera AR abrir e o áudio começar a tocar.
const RAIO_ATIVACAO_METROS = 2001
// ======================================================================

// 👉 ARQUIVO DO MODELO 3D — coloque o seu .glb em:
//    /public/models/modelo-praca.glb
// (o nome do arquivo precisa ser exatamente esse, ou então troque o
// caminho usado no atributo gltf-model lá no <template> acima)

const status = ref('idle') // idle | localizando | longe | ar | erro
const mensagemErro = ref('')
const distanciaAtual = ref(null)

const playlist = ref([])
const audioAtualUrl = ref('')
const meuAudio = ref(null)
const modeloRef = ref(null)

let watchId = null
let dentroDoRaio = false

// Carrega a playlist de áudios do banco assim que o componente monta
onMounted(async () => {
  const { data } = await supabase
    .from('mensagens')
    .select('audio_url')

  if (data && data.length > 0) {
    playlist.value = data.map(item => item.audio_url).sort(() => Math.random() - 0.5)
  }
})

onUnmounted(() => {
  pararMonitoramento()
})

// Calcula a distância em metros entre duas coordenadas (fórmula de Haversine)
function calcularDistanciaMetros(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const toRad = (deg) => (deg * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const iniciarExperiencia = async () => {
  if (playlist.value.length === 0) {
    mensagemErro.value = 'A praça está silenciosa... Volte ao museu e grave a primeira mensagem!'
    status.value = 'erro'
    return
  }

  if (!navigator.geolocation) {
    mensagemErro.value = 'Seu navegador não suporta geolocalização.'
    status.value = 'erro'
    return
  }

  try {
    // Pede permissão de câmera aqui mesmo, no clique do usuário,
    // pra já aproveitar o gesto e poder destravar o áudio depois.
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    stream.getTracks().forEach(track => track.stop()) // o AR.js vai pedir a sua própria

    status.value = 'localizando'
    iniciarMonitoramentoDeLocalizacao()
  } catch (err) {
    mensagemErro.value = 'Permita o acesso à câmera para continuar.'
    status.value = 'erro'
  }
}

function iniciarMonitoramentoDeLocalizacao() {
  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      const distancia = calcularDistanciaMetros(
        latitude,
        longitude,
        PONTO_PRACA.latitude,
        PONTO_PRACA.longitude
      )
      distanciaAtual.value = distancia

      if (distancia <= RAIO_ATIVACAO_METROS) {
        if (!dentroDoRaio) {
          dentroDoRaio = true
          entrarNaAR()
        }
      } else {
        if (dentroDoRaio) {
          dentroDoRaio = false
          sairDaAR()
        } else {
          status.value = 'longe'
        }
      }
    },
    (err) => {
      mensagemErro.value = 'Não foi possível acessar sua localização. Verifique as permissões de GPS.'
      status.value = 'erro'
    },
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 10000,
    }
  )
}

function pararMonitoramento() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId)
    watchId = null
  }
  pararAudio()
}

async function entrarNaAR() {
  status.value = 'ar'

  await nextTick()

  // Ajusta a posição do modelo 3D para a coordenada exata configurada
  if (modeloRef.value) {
    modeloRef.value.setAttribute(
      'gps-entity-place',
      `latitude: ${PONTO_PRACA.latitude}; longitude: ${PONTO_PRACA.longitude};`
    )
  }

  tocarAleatorio()
}

function sairDaAR() {
  pararAudio()
  status.value = 'longe'
}

function pararAudio() {
  if (meuAudio.value) {
    meuAudio.value.pause()
  }
}

function tocarAleatorio() {
  if (playlist.value.length === 0) return

  const indiceAleatorio = Math.floor(Math.random() * playlist.value.length)
  audioAtualUrl.value = playlist.value[indiceAleatorio]

  nextTick(() => {
    if (meuAudio.value) {
      meuAudio.value.play().catch(() => {})
    }
  })
}

// Quando uma mensagem termina, escolhe outra aleatoriamente sozinho,
// sem precisar de nenhum botão de play
function tocarProximo() {
  if (status.value !== 'ar') return
  tocarAleatorio()
}
</script>

<style scoped>
.praca-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #050505;
  color: white;
  text-align: center;
}

.start-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 0 24px;
}

.start-screen h2 {
  font-family: sans-serif;
  font-size: 1.8rem;
  margin-bottom: 10px;
}

.start-screen p {
  color: #aaa;
  font-size: 1.1rem;
}

.btn-play {
  background: #ff2d55;
  color: white;
  border: none;
  padding: 16px 32px;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.btn-play:hover {
  background: #ff0033;
  transform: scale(1.05);
}

.ar-wrapper {
  width: 100%;
  height: 100vh;
  position: relative;
}

.ar-wrapper a-scene {
  width: 100%;
  height: 100%;
}

/* O áudio toca sozinho, então o player fica escondido — sem botão */
.audio-hidden {
  display: none;
}
</style>
