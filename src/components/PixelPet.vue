<template>
  <button class="pet-wrap tap" @click="poke" aria-label="像素宠物">
    <div v-if="message" class="pet-bubble">{{ message }}</div>
    <div class="pet-stage">
      <div :class="['pet pixelated', mood]">
        <span class="eye left"></span>
        <span class="eye right"></span>
        <span class="mouth"></span>
      </div>
      <div class="pet-shadow"></div>
    </div>
  </button>
</template>

<script setup>
import { ref } from 'vue'

const mood = ref('idle')
const message = ref('')

function poke() {
  mood.value = 'happy'
  message.value = ['今天也很棒', '哒咔一下', '我在陪你', '完成一个就很厉害'][Math.floor(Math.random() * 4)]
  setTimeout(() => {
    mood.value = 'idle'
    message.value = ''
  }, 1800)
}

defineExpose({ poke })
</script>

<style scoped>
.pet-wrap {
  position: fixed;
  right: 18px;
  bottom: 92px;
  z-index: 45;
  border: 0;
  background: transparent;
}

.pet-stage {
  position: relative;
  display: grid;
  height: 86px;
  width: 86px;
  place-items: center;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, .22);
  background: linear-gradient(145deg, rgba(82, 210, 115, .88), rgba(56, 189, 248, .88));
  box-shadow: 0 18px 44px rgba(0, 0, 0, .32), 0 0 38px rgba(82, 210, 115, .36);
  backdrop-filter: blur(18px);
}

.pet-bubble {
  position: absolute;
  right: 4px;
  bottom: 94px;
  width: 132px;
  border-radius: 14px;
  background: #111318;
  color: white;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 14px 32px rgba(0, 0, 0, .28);
}

.pet {
  width: 56px;
  height: 48px;
  position: relative;
  border: 4px solid #121212;
  background: #f7ff5f;
  box-shadow: inset -8px -8px 0 #52d273;
  border-radius: 6px;
  animation: idle 2.4s ease-in-out infinite;
}

.pet::before,
.pet::after {
  content: "";
  position: absolute;
  top: -12px;
  width: 10px;
  height: 12px;
  background: #f7ff5f;
  border: 4px solid #121212;
  border-bottom: 0;
}

.pet::before { left: 8px; }
.pet::after { right: 8px; }

.eye {
  position: absolute;
  top: 17px;
  width: 7px;
  height: 7px;
  background: #121212;
}

.left { left: 13px; }
.right { right: 13px; }

.mouth {
  position: absolute;
  left: 22px;
  bottom: 10px;
  width: 12px;
  height: 4px;
  background: #121212;
}

.pet-shadow {
  position: absolute;
  bottom: 12px;
  height: 8px;
  width: 42px;
  border-radius: 999px;
  background: rgba(0, 0, 0, .26);
  filter: blur(2px);
}

.happy {
  animation: bounce .45s ease-in-out 2;
}

.happy .mouth {
  height: 8px;
  border-radius: 0 0 8px 8px;
}

@media (min-width: 900px) {
  :global(.mode-auto) .pet-wrap,
  :global(.mode-desktop) .pet-wrap {
    right: 34px;
    bottom: 34px;
  }

  :global(.mode-auto) .pet-stage,
  :global(.mode-desktop) .pet-stage {
    height: 112px;
    width: 112px;
    border-radius: 30px;
  }
}

@keyframes idle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0) rotate(0); }
  35% { transform: translateY(-16px) rotate(-4deg); }
  70% { transform: translateY(-6px) rotate(4deg); }
}
</style>
