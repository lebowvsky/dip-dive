<template>
  <div class="wrapper">
    <div class="content">
      <slot name="main" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  justify-content: start;
  width: 100%;

  .content {
    flex: 1;
    max-width: $content-width;
    padding: $s;
    border-radius: $s;
    background-color: color('primary', 90);
  }
}
</style>
