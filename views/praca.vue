<!--<template>
  <div class="praca-container">
    
    <div v-if="!isPlaying" class="start-screen">
      <h2>Bem-vindo à Praça do Leão 🦁</h2>
      <p>Prepare-se para ouvir as mensagens da cidade.</p>
      <button @click="iniciarExperiencia" class="btn-play">Iniciar Experiência Sonora</button>
    </div>

    <div v-else class="playing-screen">
      <h2>Tocando os sons da praça... 🔊</h2>
      <p>Quantidade de mensagens enviadas: {{ playlist.length }}</p>

      <audio
        ref="meuAudio"
        :src="audioAtualUrl"
        @ended="tocarProximo"
        controls
        class="audio-player"
      ></audio>
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'
//n coloquei essa bomba em variavel de ambiente pq é só leitura mesmo, n tem segredo nenhum
const supabaseUrl = 'https://ppsdcoifaifrfgzovwwu.supabase.co'
const supabaseKey = 'sb_publishable_I1kgINGoMJ6h5UYt-q2Kyw_j7-ZP-Wv'
const supabase = createClient(supabaseUrl, supabaseKey)

const playlist = ref([])
const audioAtualUrl = ref('')
const isPlaying = ref(false)

const meuAudio = ref(null) 

onMounted(async () => {
  const { data, error } = await supabase
    .from('mensagens')
    .select('audio_url')
  
  if (data && data.length > 0) {
    playlist.value = data.map(item => item.audio_url).sort(() => Math.random() - 0.5)
  }
})

const iniciarExperiencia = () => {
  if (playlist.value.length === 0) {
    alert('A praça está silenciosa... Volte ao museu e grave a primeira mensagem!')
    return
  }
  
  isPlaying.value = true
  audioAtualUrl.value = playlist.value[0]
  
  setTimeout(() => {
    if (meuAudio.value) meuAudio.value.play()
  }, 100)
}

const tocarProximo = () => {
  if (playlist.value.length <= 1) {
    meuAudio.value.currentTime = 0
    meuAudio.value.play()
    return
  }

  const tocado = playlist.value.shift()
  playlist.value.push(tocado)
  
  audioAtualUrl.value = playlist.value[0]

  setTimeout(() => {
    if (meuAudio.value) {
      meuAudio.value.play()
    }
  }, 150)
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

.start-screen, .playing-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.start-screen h2, .playing-screen h2 {
  font-family: sans-serif;
  font-size: 2rem;
  margin-bottom: 10px;
}

.start-screen p, .playing-screen p {
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

.audio-player {
  margin-top: 20px;
  width: 300px;
}
</style>

-->

<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Praça do Leão — Experiência de RA</title>
    <script src="https://aframe.io/releases/1.6.0/aframe.min.js"></script>
    <script type='text/javascript' src='https://raw.githack.com/AR-js-org/AR.js/3.4.7/three.js/build/ar-threex-location-only.js'></script>
    <script type='text/javascript' src='https://raw.githack.com/AR-js-org/AR.js/3.4.7/aframe/build/aframe-ar.js'></script>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <style>
      #debug-panel {
        position: fixed; top: 0; left: 0; right: 0;
        z-index: 9999;
        background: rgba(0,0,0,0.75);
        color: #fff;
        font-family: monospace;
        font-size: 0.8rem;
        padding: 6px 10px;
        line-height: 1.6;
        pointer-events: none;
      }
      .ui-container {
        position: fixed;
        bottom: 30px; left: 50%;
        transform: translateX(-50%);
        z-index: 9999; text-align: center;
        display: flex; flex-direction: column; gap: 12px; align-items: center;
      }
      .btn {
        background-color: #ff2d55; color: white;
        padding: 15px 30px; border: none;
        border-radius: 50px; font-size: 1.1rem;
        font-family: monospace; font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        display: none;
      }
      #fora-btn {
        background-color: #555;
        display: none;
      }
    </style>
  </head>
  <body style="margin:0;overflow:hidden;">

    <div id="debug-panel">🔄 Aguardando GPS...</div>

    <div class="ui-container">
      <button id="play-btn" class="btn">🔊 Ouvir próxima mensagem</button>
      <button id="fora-btn" class="btn">📍 Vá até a praça para ouvir</button>
    </div>

    <a-scene
      vr-mode-ui='enabled: false'
      arjs='sourceType: webcam; videoTexture: true; debugUIEnabled: false'
      renderer='antialias: true; alpha: true'
      loading-screen='enabled: false'
    >
      <a-camera gps-new-camera='gpsMinDistance: 5; positionMinAccuracy: 3000'></a-camera>

      <a-box
        color="red"
        gps-new-entity-place="latitude: -4.466122627460742; longitude: -38.90073652916311"
        scale="20 20 20">
      </a-box>

      <a-box
        color="green"
        gps-new-entity-place="latitude: -4.466122627460742; longitude: -38.90073652916311"
        scale="20 20 20"
        animation="property: rotation; to: 0 360 0; loop: true; dur: 8000; easing: linear">
      </a-box>
    </a-scene>

    <script>
      // ── Config ────────────────────────────────────────────────────────
      const TARGET_LAT = -4.9664902521832;
      const TARGET_LNG = -39.01973978446488;
      const RAIO_METROS = 100;

      -4.9664902521832, -39.01973978446488

      <!-- Praça do leao       const TARGET_LAT = -4.466122627460742; -->
      <!--                     const TARGET_LNG = -38.90073652916311; -->
      <!--                     const RAIO_METROS = 100;               -->

      // ── Debug ─────────────────────────────────────────────────────────
      const debugEl = document.getElementById('debug-panel');
      function log(msg) { debugEl.innerHTML = msg; }

      // ── Distância ─────────────────────────────────────────────────────
      function calcDist(lat1, lng1, lat2, lng2) {
        const R = 6371000;
        const dL = (lat2 - lat1) * Math.PI / 180;
        const dG = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dL/2)**2 +
                  Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dG/2)**2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      }

      // ── Estado ────────────────────────────────────────────────────────
      let fila = [];
      let indiceAtual = 0;
      let estaNoLocal = false;
      let tocando = false;
      const audioPlayer = new Audio();

      const playBtn  = document.getElementById('play-btn');
      const foraBtn  = document.getElementById('fora-btn');

      // ── Supabase ──────────────────────────────────────────────────────
      const supabase = window.supabase.createClient(
        'https://ppsdcoifaifrfgzovwwu.supabase.co',
        'sb_publishable_I1kgINGoMJ6h5UYt-q2Kyw_j7-ZP-Wv'
      );

      async function carregarFila() {
        try {
          const { data, error } = await supabase.from('mensagens').select('id, audio_url');
          if (error) throw error;
          if (data && data.length > 0) {
            fila = [...data];
            for (let i = fila.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [fila[i], fila[j]] = [fila[j], fila[i]];
            }
            indiceAtual = 0;
            log(`✅ GPS OK | 🎵 ${fila.length} mensagem(ns) na fila`);
          } else {
            log('⚠️ Nenhuma mensagem gravada ainda');
          }
        } catch (e) {
          log('❌ Erro ao carregar mensagens: ' + e.message);
        }
      }

      function tocarProximo() {
        if (fila.length === 0) {
          log('⚠️ Nenhuma mensagem disponível');
          return;
        }

        if (indiceAtual >= fila.length) {
          for (let i = fila.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [fila[i], fila[j]] = [fila[j], fila[i]];
          }
          indiceAtual = 0;
          log(`🔀 Fila reiniciada com ${fila.length} mensagem(ns)`);
        }

        const mensagem = fila[indiceAtual];
        audioPlayer.src = mensagem.audio_url;
        audioPlayer.play();
        tocando = true;
        playBtn.innerText = '⏸️ Pausar';
        log(`▶️ Tocando mensagem ${indiceAtual + 1} de ${fila.length}`);
      }

      audioPlayer.addEventListener('ended', () => {
        indiceAtual++;
        tocando = false;
        playBtn.innerText = '🔊 Ouvir próxima mensagem';
        log(`✅ Mensagem ${indiceAtual} de ${fila.length} concluída`);
      });

      playBtn.addEventListener('click', () => {
        if (!estaNoLocal) return;

        if (tocando && !audioPlayer.paused) {
          audioPlayer.pause();
          tocando = false;
          playBtn.innerText = '▶️ Continuar';
        } else if (!audioPlayer.paused || audioPlayer.currentTime === 0 || audioPlayer.ended) {
          tocarProximo();
        } else {
          audioPlayer.play();
          tocando = true;
          playBtn.innerText = '⏸️ Pausar';
        }
      });

      navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const dist = calcDist(latitude, longitude, TARGET_LAT, TARGET_LNG);
          const distFmt = dist.toFixed(0);
          const precFmt = accuracy.toFixed(0);

          estaNoLocal = dist <= RAIO_METROS;

          if (estaNoLocal) {
            log(`✅ GPS OK | precisão: ${precFmt}m | 📍 Você está no local! (${distFmt}m)`);
            playBtn.style.display  = 'inline-block';
            foraBtn.style.display  = 'none';
          } else {
            log(`✅ GPS OK | precisão: ${precFmt}m | 🚶 ${distFmt}m do ponto`);
            playBtn.style.display  = 'none';
            foraBtn.style.display  = 'inline-block';
            if (tocando && !audioPlayer.paused) {
              audioPlayer.pause();
              tocando = false;
              playBtn.innerText = '🔊 Ouvir próxima mensagem';
            }
          }
        },
        (err) => {
          log(`❌ GPS erro ${err.code}: ${err.message}`);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
      );

      carregarFila();
    </script>
  </body>
</html>
