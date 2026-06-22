<template>
  <Teleport to="body">
    <section v-if="modelValue" class="welcome-layer" aria-modal="true" role="dialog">
      <div class="barrage" aria-hidden="true">
        <span v-for="item in barrage" :key="item.text" :style="{ '--top': item.top, '--delay': item.delay, '--speed': item.speed }">
          {{ item.text }}
        </span>
      </div>

      <article class="welcome-card">
        <div class="pet-drop">
          <div class="mini-stage">
            <div class="blue-rose">
              <span class="rose-head"></span>
              <span class="rose-stem"></span>
              <span class="rose-leaf rose-left"></span>
              <span class="rose-leaf rose-right"></span>
              <span class="rose-pot"></span>
            </div>
            <div class="welcome-pet">
              <span class="ear ear-l"></span>
              <span class="ear ear-r"></span>
              <span class="eye eye-l"></span>
              <span class="eye eye-r"></span>
              <span class="spark spark-l"></span>
              <span class="spark spark-r"></span>
              <span class="cheek cheek-l"></span>
              <span class="cheek cheek-r"></span>
              <span class="mouth"></span>
              <span class="foot foot-l"></span>
              <span class="foot foot-r"></span>
            </div>
            <div class="drop-shadow"></div>
          </div>
        </div>

        <div class="welcome-copy">
          <p class="eyebrow">DakaBa Garden</p>
          <h2>嗨，终于等到你了啦!</h2>
          <p class="body">
            这里是Dakaba，你的专属秘密花园。不想发朋友圈的话，就安静记下来吧。先试试写点今天的日程，或者给生活拍张照片?
          </p>
        </div>

        <button class="start-button" type="button" @click="$emit('close')">开始我的第一页</button>
        <p class="signature">Dakaba · Design by MEIGL | 用心记录每一个日常</p>
      </article>
    </section>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close'])

const barrage = [
  { text: '今天也要好好记录', top: '8%', delay: '0s', speed: '7s' },
  { text: 'Daka一下', top: '18%', delay: '.3s', speed: '8s' },
  { text: '秘密花园已开启', top: '32%', delay: '.1s', speed: '7.6s' },
  { text: '拍张照片也可以', top: '68%', delay: '.2s', speed: '8.4s' },
  { text: '点点滴滴都值得记录', top: '82%', delay: '.45s', speed: '7.2s' },
]
</script>

<style scoped>
.welcome-layer {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 22px;
  background:
    radial-gradient(circle at 20% 10%, rgba(0, 189, 91, .18), transparent 26%),
    radial-gradient(circle at 86% 22%, rgba(59, 130, 246, .22), transparent 28%),
    rgba(239, 248, 255, .84);
  backdrop-filter: blur(18px);
  animation: layer-in .28s ease both;
}
.barrage {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.barrage span {
  position: absolute;
  top: var(--top);
  left: 100%;
  white-space: nowrap;
  border: 1px solid rgba(37, 99, 235, .14);
  border-radius: 999px;
  background: rgba(255, 255, 255, .72);
  padding: 8px 14px;
  color: #2563eb;
  font-size: 13px;
  font-weight: 900;
  box-shadow: 0 12px 28px rgba(37, 99, 235, .12);
  animation: barrage var(--speed) linear var(--delay) infinite;
}
.welcome-card {
  position: relative;
  width: min(440px, 100%);
  overflow: hidden;
  border: 1px solid rgba(191, 219, 254, .9);
  border-radius: 32px;
  background: rgba(255, 255, 255, .94);
  padding: 28px;
  text-align: center;
  box-shadow: 0 32px 90px rgba(37, 99, 235, .22);
}
.welcome-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 26% 0%, rgba(0, 189, 91, .18), transparent 30%),
    radial-gradient(circle at 76% 12%, rgba(96, 165, 250, .22), transparent 34%);
  pointer-events: none;
}
.pet-drop {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  height: 176px;
}
.mini-stage {
  position: relative;
  width: 220px;
  height: 140px;
  border-radius: 30px;
  background: linear-gradient(135deg, #f8fcff, #e8f6ff);
  box-shadow: inset 0 0 0 1px #dbeafe, 0 20px 44px rgba(37, 99, 235, .16);
  animation: pet-spring 1s cubic-bezier(.19, 1.28, .45, 1.05) both;
  transform-origin: 50% 88%;
}
.welcome-pet {
  position: absolute;
  right: 42px;
  bottom: 36px;
  width: 68px;
  height: 58px;
  border: 5px solid #123f2a;
  border-radius: 10px;
  background: #5ee48b;
  box-shadow: inset -11px -10px 0 #25a957;
  animation: face-pop 1s ease both;
}
.ear {
  position: absolute;
  top: -18px;
  width: 16px;
  height: 18px;
  border: 5px solid #123f2a;
  border-bottom: 0;
  background: #5ee48b;
}
.ear-l { left: 8px; }
.ear-r { right: 8px; }
.eye {
  position: absolute;
  top: 20px;
  width: 8px;
  height: 11px;
  background: #123f2a;
}
.eye-l { left: 17px; }
.eye-r { right: 17px; }
.spark {
  position: absolute;
  top: 17px;
  width: 3px;
  height: 3px;
  background: #eafff2;
}
.spark-l { left: 20px; }
.spark-r { right: 20px; }
.cheek {
  position: absolute;
  top: 35px;
  width: 10px;
  height: 6px;
  background: #ff88ad;
}
.cheek-l { left: 7px; }
.cheek-r { right: 7px; }
.mouth {
  position: absolute;
  left: 28px;
  bottom: 10px;
  width: 13px;
  height: 9px;
  border-radius: 0 0 10px 10px;
  background: #123f2a;
}
.foot {
  position: absolute;
  bottom: -13px;
  width: 16px;
  height: 10px;
  border: 5px solid #123f2a;
  background: #25a957;
}
.foot-l { left: 10px; }
.foot-r { right: 10px; }
.blue-rose {
  position: absolute;
  left: 46px;
  bottom: 30px;
  width: 54px;
  height: 78px;
}
.rose-stem {
  position: absolute;
  left: 25px;
  bottom: 23px;
  width: 5px;
  height: 38px;
  background: #159a5d;
}
.rose-leaf {
  position: absolute;
  width: 17px;
  height: 10px;
  border-radius: 100% 0 100% 0;
  background: #24c573;
}
.rose-left { left: 9px; bottom: 40px; transform: rotate(-28deg); }
.rose-right { right: 4px; bottom: 32px; transform: rotate(30deg); }
.rose-head {
  position: absolute;
  left: 15px;
  top: 8px;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: #4aa3ff;
  box-shadow: -6px 0 0 #1d7dff, 6px 0 0 #7cc7ff, 0 -6px 0 #9bd7ff, 0 6px 0 #0d68dd;
}
.rose-pot {
  position: absolute;
  left: 9px;
  bottom: 0;
  width: 38px;
  height: 24px;
  border-radius: 4px 4px 12px 12px;
  background: linear-gradient(#a7734b, #70452d);
}
.drop-shadow {
  position: absolute;
  right: 45px;
  bottom: 22px;
  width: 60px;
  height: 10px;
  border-radius: 999px;
  background: rgba(31, 142, 82, .22);
  filter: blur(2px);
  animation: shadow-pop 1s ease both;
}
.welcome-copy {
  position: relative;
  z-index: 1;
}
.eyebrow {
  color: #00a651;
  font-size: 12px;
  font-weight: 950;
  letter-spacing: .04em;
}
h2 {
  margin-top: 8px;
  color: #0f172a;
  font-size: clamp(30px, 7vw, 35px);
  font-weight: 600;
  line-height: 1.08;
}
.body {
  margin-top: 14px;
  border-radius: 18px;
  background: #ffffff;
  color: #0070fa;
  padding: 12px 14px;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.85;
}
.start-button {
  position: relative;
  z-index: 1;
  width: 100%;
  margin-top: 20px;
  border: 0;
  border-radius: 20px;
  background: linear-gradient(135deg, #00bd5b, #49d98b);
  padding: 15px;
  color: white;
  font-size: 16px;
  font-weight: 950;
  box-shadow: 0 18px 38px rgba(0, 189, 91, .26);
}
.signature {
  position: relative;
  z-index: 1;
  margin-top: 14px;
  color: #ff0000;
  font-size: 11px;
  font-weight: 800;
}
@keyframes layer-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes barrage {
  from { transform: translateX(0); }
  to { transform: translateX(calc(-100vw - 100%)); }
}
@keyframes pet-spring {
  0% { transform: translateY(-260px) scale(.2) rotate(-12deg); opacity: 0; }
  32% { transform: translateY(34px) scale(1.24, .72) rotate(7deg); opacity: 1; }
  54% { transform: translateY(-48px) scale(.86, 1.22) rotate(-5deg); }
  72% { transform: translateY(18px) scale(1.12, .88) rotate(3deg); }
  88% { transform: translateY(-10px) scale(.96, 1.05) rotate(-1deg); }
  100% { transform: translateY(0) scale(1) rotate(0); opacity: 1; }
}
@keyframes face-pop {
  0%, 28% { filter: saturate(.8); }
  45% { filter: saturate(1.35); }
  100% { filter: saturate(1); }
}
@keyframes shadow-pop {
  0% { transform: scale(.2); opacity: 0; }
  34% { transform: scale(1.3); opacity: .25; }
  100% { transform: scale(1); opacity: 1; }
}
@media (max-width: 520px) {
  .welcome-layer {
    padding: 14px;
  }
  .welcome-card {
    padding: 22px;
    border-radius: 28px;
  }
  .pet-drop {
    height: 160px;
  }
}
</style>
