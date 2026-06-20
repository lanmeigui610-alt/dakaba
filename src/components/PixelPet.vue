<template>
  <div class="pet-wrap" :style="{ transform: `translateX(${x}px)` }">
    <div v-if="message" class="pet-bubble">{{ message }}</div>

    <button v-if="isAway" class="sign tap" @click="showTravelMessage" aria-label="宠物留言牌">
      <span class="sign-board">!</span>
      <span class="sign-stick"></span>
    </button>

    <button v-else class="pet-button tap" @click="poke" aria-label="绿色像素宠物">
      <div class="pet-stage">
        <div :class="['pet pixelated', mood, direction]">
          <span class="ear ear-l"></span>
          <span class="ear ear-r"></span>
          <span class="eye left"></span>
          <span class="eye right"></span>
          <span class="cheek cheek-l"></span>
          <span class="cheek cheek-r"></span>
          <span class="mouth"></span>
          <span class="foot foot-l"></span>
          <span class="foot foot-r"></span>
        </div>
        <div class="pet-shadow"></div>
      </div>
    </button>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const mood = ref('idle')
const message = ref('')
const isAway = ref(false)
const x = ref(0)
const direction = ref('face-right')
let walkTimer
let awayTimer
let returnTimer

function poke() {
  mood.value = 'happy'
  message.value = ['😊 你好呀，今天也要哒咔。', '🌿 我是一颗会散步的小绿点。', '💪 完成一个任务，我就蹦一下。'][Math.floor(Math.random() * 3)]
  setTimeout(() => {
    mood.value = 'idle'
    message.value = ''
  }, 1800)
}

function showTravelMessage() {
  message.value = '🌍 我去环游世界喽，别想我哦'
  setTimeout(() => {
    message.value = ''
  }, 2600)
}

function startWalking() {
  walkTimer = window.setInterval(() => {
    if (isAway.value) return
    const next = Math.max(-36, Math.min(28, x.value + (Math.random() > 0.5 ? 12 : -12)))
    direction.value = next >= x.value ? 'face-right' : 'face-left'
    x.value = next
    mood.value = 'walking'
    setTimeout(() => {
      if (!isAway.value) mood.value = 'idle'
    }, 650)
  }, 2600)
}

function scheduleTrips() {
  awayTimer = window.setInterval(() => {
    isAway.value = true
    message.value = ''
    returnTimer = window.setTimeout(() => {
      isAway.value = false
      x.value = 0
      mood.value = 'happy'
      message.value = '🌹 我回来啦，带了一点风。'
      setTimeout(() => {
        mood.value = 'idle'
        message.value = ''
      }, 1800)
    }, 9000)
  }, 22000)
}

onMounted(() => {
  startWalking()
  scheduleTrips()
})

onBeforeUnmount(() => {
  window.clearInterval(walkTimer)
  window.clearInterval(awayTimer)
  window.clearTimeout(returnTimer)
})

defineExpose({ poke })
</script>

<style scoped>
.pet-wrap {
  position: fixed;
  right: 18px;
  bottom: 92px;
  z-index: 45;
  transition: transform .7s steps(3);
}

.pet-button,
.sign {
  border: 0;
  background: transparent;
}

.pet-stage {
  position: relative;
  display: grid;
  height: 104px;
  width: 104px;
  place-items: center;
  border-radius: 18px;
  background: rgba(255, 255, 255, .76);
  box-shadow: 0 18px 42px rgba(31, 142, 82, .22);
  backdrop-filter: blur(14px);
}

.pet-bubble {
  position: absolute;
  right: 0;
  bottom: 112px;
  width: 180px;
  border: 4px solid #123f2a;
  background: #f5fff9;
  color: #123f2a;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 900;
  box-shadow: 6px 6px 0 rgba(18, 63, 42, .16);
}

.pet {
  position: relative;
  width: 58px;
  height: 50px;
  border: 4px solid #123f2a;
  border-radius: 8px;
  background: #5ee48b;
  box-shadow: inset -9px -8px 0 #25a957;
  animation: idle 2.2s ease-in-out infinite;
}

.ear {
  position: absolute;
  top: -15px;
  width: 14px;
  height: 16px;
  border: 4px solid #123f2a;
  border-bottom: 0;
  background: #5ee48b;
}

.ear-l { left: 7px; }
.ear-r { right: 7px; }
.eye {
  position: absolute;
  top: 18px;
  width: 7px;
  height: 9px;
  background: #123f2a;
}
.left { left: 14px; }
.right { right: 14px; }
.cheek {
  position: absolute;
  top: 29px;
  width: 8px;
  height: 5px;
  background: #ff91b3;
}
.cheek-l { left: 6px; }
.cheek-r { right: 6px; }
.mouth {
  position: absolute;
  left: 25px;
  bottom: 9px;
  width: 10px;
  height: 4px;
  background: #123f2a;
}
.foot {
  position: absolute;
  bottom: -11px;
  width: 14px;
  height: 9px;
  border: 4px solid #123f2a;
  background: #25a957;
}
.foot-l { left: 8px; }
.foot-r { right: 8px; }
.pet-shadow {
  position: absolute;
  bottom: 18px;
  height: 8px;
  width: 48px;
  border-radius: 999px;
  background: rgba(31, 142, 82, .24);
  filter: blur(2px);
}
.walking { animation: walk .52s steps(2) infinite; }
.happy { animation: bounce .42s ease-in-out 2; }
.happy .mouth {
  height: 8px;
  border-radius: 0 0 8px 8px;
}
.face-left { transform: scaleX(-1); }
.sign {
  position: relative;
  width: 72px;
  height: 94px;
}
.sign-board {
  position: absolute;
  left: 6px;
  top: 0;
  display: grid;
  width: 58px;
  height: 44px;
  place-items: center;
  border: 4px solid #5a3a22;
  background: #f6d28d;
  color: #5a3a22;
  font-size: 24px;
  font-weight: 900;
  box-shadow: inset -6px -6px 0 #d69b55;
}
.sign-stick {
  position: absolute;
  left: 32px;
  top: 42px;
  width: 10px;
  height: 48px;
  background: #8b5a32;
  box-shadow: inset -3px 0 0 #5a3a22;
}
@media (min-width: 900px) {
  :global(.mode-auto) .pet-wrap,
  :global(.mode-desktop) .pet-wrap {
    right: 34px;
    bottom: 34px;
  }
}
@keyframes idle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
@keyframes walk {
  0% { translate: 0 0; }
  50% { translate: 0 -4px; }
  100% { translate: 0 0; }
}
@keyframes bounce {
  0%, 100% { transform: translateY(0) rotate(0); }
  40% { transform: translateY(-14px) rotate(-4deg); }
  70% { transform: translateY(-6px) rotate(4deg); }
}
</style>
