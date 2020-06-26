<template>
  <div class="d-flex flex-column">
    <div class="f-flex flex-row menu">
      <router-link to="/config" v-slot="{ href, route, navigate, isActive }">
        <a :active="isActive" :href="href" @click="navigate">
          <button class="btn menu-link" :class="{ 'btn-primary': isActive, 'btn-link': !isActive, 'router-link-active': isActive }">{{ $t('mainView.link-configuration') }}</button>
        </a >
      </router-link>
      <router-link to="/rimmod" v-slot="{ href, route, navigate, isActive }">
        <a :active="isActive" :href="href" @click="navigate">
          <button class="btn menu-link" :class="{ 'btn-primary': isActive, 'btn-link': !isActive, 'router-link-active': isActive }">{{ $t('mainView.link-mods') }}</button>
        </a >
      </router-link>
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { Component, Watch } from "vue-property-decorator";
import Vue from "vue";
import ipcSvc from "@Web/services/ipc";

@Component({})
export default class MainView extends Vue {
  mounted() {
    ipcSvc.requestConfigGet();
    ipcSvc.getModsConfig();
    ipcSvc.requestDataModDataGet();
  }
}
</script>

<style scoped lang="less">
.menu {
  background-color: lightgray;
  border-bottom: 1px solid black;
}
.menu-link {
  min-width: 128px;
  font-size: larger;
}
</style>
