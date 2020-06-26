<template>
    <div class="mod-menu">
      <div class="d-flex flex-row justify-content-between">
        <div class="d-flex flex-column">
          <span v-show="configHarmonyVersion">{{ `${$t('generic.harmonyVersion')} : ${configHarmonyVersion}` }} </span>
          <span v-if="anyMoreRecentHarmonyVersion" class="text-warning">
            {{ $t('infoScreen.moreRecentHarmonyVersion') }} <span class="font-weight-bold">({{ newestHarmonyVersion }})</span>
          </span>
        </div>
      </div>
    </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import Vue from "vue";
import { AppState } from '@Web/store/state';
import { Getters } from '@Web/store/getter';
import version from 'compare-versions';
import _last from 'lodash/last';

Component({ })
export default class ModMenu extends Vue {
  get configHarmonyVersion() { return (this.$store.state as AppState).config.HARMONY_VERSION; }
  get newestHarmonyVersion() { return (this.$store.getters as Getters).newestHarmonyVersion; }

  get anyMoreRecentHarmonyVersion(): boolean {
    if (!this.configHarmonyVersion || !this.newestHarmonyVersion) {
      return false;
    }
    return version.compare(this.configHarmonyVersion, this.newestHarmonyVersion, '<'); // -1
  }
}
</script>

<style scoped lang="less">
.mod-menu {
  border: 1.5px solid black;
  border-radius: 2px;
  // min-height: 3cm;
  padding: 5px;
  background-color: lighten(lightgrey, 15%);
}

.badge {
  vertical-align: middle;
}
</style>