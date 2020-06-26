<template>
  <div class="root d-flex flex-row row">
    <div class="col-9 d-flex flex-column">
      <info-screen class="row-element" />
      <div class="row-element">
        <detail-mod :id="'mod.' + md.uuid" v-for="md of filteredModList" :key="md.uuid" :value="md" />
      </div>
    </div>
    <right-menu class="col" />
  </div>
</template>

<script lang="ts">
import { Component, Watch } from "vue-property-decorator";
import Vue from "vue";
import { ModProperties } from '@Common/properties'
import { Getters } from '@Web/store/getter';

import DetailMod from './detail-mod.vue';
import InfoScreen from './info-screen.vue';
import RightMenu from './right-menu.vue';
@Component({
  components: {
    DetailMod,
    InfoScreen,
    RightMenu,
  }
})
export default class RimmodPage extends Vue {
  get filteredModList() {
    return (this.$store.getters as Getters).filteredModList;
  }
}
</script>

<style scoped lang="less">
.row-element + .row-element {
  margin-top: 0.8cm;
}
.root {
  padding: 2em;
}

</style>
