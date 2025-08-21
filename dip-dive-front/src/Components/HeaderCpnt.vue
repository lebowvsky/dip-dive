<script setup lang="ts">
import AvatarCpnt from './AvatarCpnt.vue';
</script>

<template>
  <header class="header">
    <p class="header__logo">DipDive</p>
    <AvatarCpnt />
  </header>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: $navbar-height;
  padding: $l $xxl $l $l;
  box-sizing: border-box;
  background-color: color('primary', 50);
}
</style>
