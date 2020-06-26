<template>
  <div class="short-list-mod d-flex flex-column">
    <!-- Filtrage par nom -->
    <b-form-input class="short-list-element short-list-mod-search" type="search"
      v-model="modSearchValue"
      :placeholder="trad('filterByName')" debounce="200" />
    <b-form-select  class="short-list-element" v-model="typeTriage" :options="listTypeTriage" />
    <!-- Checkbox de filtrage -->
    <b-form-checkbox class="short-list-element"
      v-model="modFilterByHarmonyIncluded" name="checkbox-filter-by-harmony">{{ trad('filterByHarmonyIncluded') }}</b-form-checkbox>
    <b-form-checkbox class="short-list-element offset-1" :disabled="!modFilterByHarmonyIncluded"
      v-model="modFilterByDifferentVersion" name="checkbox-filter-by-different-harmony-version">{{ trad('filterByDifferentVersion') }}</b-form-checkbox>
    <div class="short-list-element" :title="!filterByUsedModEnabled ? 'Le fichier \'ModsConfig.xml\' n\'a pas été trouvé.' : ''">
      <b-form-checkbox :disabled="!filterByUsedModEnabled"
        v-model="modFilterByIsUsed" name="checkbox-filter-by-harmony">{{ trad('filterByUsedModEnabled') }}</b-form-checkbox>
    </div>
    <!-- Liste mods -->
    <div class="short-list-element separator"></div>
    <div class="d-flex flex-column short-list-element">
      <a class="short-list-mod-element" v-for="(mod, i) of modList" :key="mod.uuid" :href="hrefToMod(mod)">
        {{ `${i}. ${mod.name}` }}
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Prop } from "vue-property-decorator";
import Vue from "vue";
import { ModProperties } from "@Common/properties";
import { AppState} from "@Web/store/state";
import { CommitType } from '@Web/store/mutation';
import { Getters } from '@Web/store/getter';

@Component({})
export default class RimModFloatingMenu extends Vue {
  modSearchValue: string = '';
  modFilterByHarmonyIncluded: boolean = false;
  modFilterByDifferentVersion: boolean = false;
  modFilterByIsUsed: boolean = false;
  typeTriage: AppState.modList.sortingType = 'name';

  /** Effectue une traduction, en version raccourcie. */
  trad(path: string) {
    return this.$t(`rimmod.rightMenu.${path}`);
  }

  /** Est-ce qu'il est possible d'utiliser le filtrage par mod utilisé ? */
  get filterByUsedModEnabled(): boolean  {
    return !!(this.$store.state as AppState).modsConfig;
  }

  /** La liste des mods, filtrés et triés par le store. */
  get modList(): ModProperties[] {
    return (this.$store.getters as Getters).filteredModList
  }

  /** Les différents types de triage disponibles. */
  get listTypeTriage(): Array<{value: AppState.modList.sortingType, text: string}> {
    return [
      { value: 'name', text: this.trad('listTypeTriage.name').toString() },
      { value: 'harmonyVersion+name', text: this.trad('listTypeTriage.harmonyVersion+name').toString() },
      { value: 'author', text: this.trad('listTypeTriage.author').toString() },
    ];
  }

  /** Le lien vers le détail du mod en question. Permet de naviguer directement jusqu'au mod en question. */
  hrefToMod(mod: ModProperties): string {
    return `#mod.${mod.uuid}`;
  }

  @Watch('modFilterByHarmonyIncluded')
  onModFilterByHarmonyIncluded(newValue: boolean) {
    (this.$store as CommitType).commit('Change_ModListParameters', {
      showOnlyWithIncludedHarmony: newValue,
    });
  }

  @Watch('modFilterByDifferentVersion')
  onModFilterByDifferentVersion(newValue: boolean) {
    (this.$store as CommitType).commit('Change_ModListParameters', {
      showOnlyWithDifferentHarmony: newValue,
    });
  }

  @Watch('modSearchValue')
  onModSearchValueChange(newValue: string) {
    (this.$store as CommitType).commit('Change_ModListParameters', {
      searchWord: newValue,
    });
  }

  @Watch('typeTriage')
  onTypeTriageChange(newValue: AppState.modList.sortingType) {
    (this.$store as CommitType).commit('Change_ModListParameters', {
      sortingType: newValue
    });
  }

  @Watch('modFilterByIsUsed')
  onModFilterByIsUsedChange(newValue: boolean) {
    (this.$store as CommitType).commit('Change_ModListParameters', {
      showOnlymodFilterByIsUsed: newValue
    });
  }
}
</script>

<style scoped lang="less">
.short-list-mod {
  font-family: monospace;
  border: 1px solid black;
  padding-top: 10px;
  padding-bottom: 10px;
  align-self: baseline;
}
.short-list-element {
  & + & {
    margin-top: 10px;
  }
}
.short-list-mod-element {
  font-size: 0.8rem;
  color: black;

  &:hover {
    color: #0056b3;
    text-decoration: underline;
  }

  & + & {
    margin-bottom: 1.5px;
  }
}
.offset-1 {
  margin-left: 10px;
}
</style>
