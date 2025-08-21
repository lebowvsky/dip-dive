<template>
  <aside class="sidebar">
    <ul class="sidebar__nav">
      <li class="sidebar__item">
        <v-icon name="ri-home-2-line" scale="1.3" />
        <span>Accueil</span>
      </li>
      <li class="sidebar__item"><v-icon name="ri-ship-line" scale="1.3" /><span>plongées</span></li>
      <li class="sidebar__item"><v-icon name="ri-mail-line" scale="1.3" /><span>contact</span></li>
    </ul>
  </aside>
</template>

<style lang="scss" scoped>
.sidebar {
  width: $sidebar-width;
  height: $sidebar-height;
  padding: $xxl $m;
  border-radius: 0 $s $s 0;
  box-sizing: border-box;
  background-color: color('primary', 70);

  &__nav {
    display: flex;
    flex-direction: column;
    align-items: start;
    padding: 0;
    list-style-type: none;
    gap: $xl;
  }

  &__item {
    display: flex;
    align-items: end;
    box-sizing: border-box;
    font-size: $xl;
    cursor: pointer;
    gap: $xs;

    &:hover {
      filter: opacity(55%);
    }

    span {
      font-size: $font-size-s;
    }
  }
}
</style>
