<template>
  <div class="d-flex flex-column">
    <div class="d-flex flex-column container">
      <h2 class="py-5 text-center">{{ trad('title') }}</h2>
      <div>
        <!-- Version Harmony -->
        <b-form-group id="input-group-harmony-version" label-for="input-harmony-version" class="configuration-item"
                      :label="$t('generic.harmonyVersion')" :description="trad('HARMONY_VERSION.description')">
          <b-form-input id="input-harmony-version" v-model.lazy.trim="config.HARMONY_VERSION" debounce="400" type="text" required placeholder="1.0.0.0" @blur="checkVersion()"
                        :state="checkVersion(config.HARMONY_VERSION)"/>
        </b-form-group>
        <!-- Chemins vers les mods Harmony -->
        <file-list class="configuration-item" :label="trad('PATH_TO_CHECK.label')" v-model="config.PATH_TO_CHECK"
                   :validation="pathsChecked" :description="`${$t('generic.byDefault')} : ~/.steam/steam/steamapps/workshop/content/294100/`" />
        <!-- Chemin vers la liste des mods actifs --> <!-- FIXME: Chopper le dossier Rimworld plutôt que le fichier précis. -->
        <file-handler class="configuration-item" :label="trad('MODLIST_PATH.label')" v-model="config.MODLIST_PATH"
                   :validation="pathsChecked" :description="`${$t('generic.byDefault')} : ~/.config/unity3d/Ludeon Studios/RimWorld by Ludeon Studios/Config/ModsConfig.xml`"/>
        <!-- La langue de l'application -->
        <b-form-group class="configuration-item" :id="`input-group-lang`" :label="trad('APP_LANGUAGE.label')">
          <b-form-select v-model="config.APP_LANGUAGE" :options="langs" />
        </b-form-group>

        <!-- Options moins importantes -->
        <div class="separator configuration-item"> </div>
        <div class="py-1 text-center">
          <h5>{{ trad('minorOptions.title') }}</h5>
          <b-button pill @click="expanded.minors = !expanded.minors" :variant="expanded.minors ? 'info' : 'outline-info'">
            <i class="fas" :class="expanded.minors ? 'fa-compress-alt' : 'fa-expand-alt'"/>
          </b-button>
        </div>
        <transition name="slide-fade">
          <div v-if="expanded.minors">
            <h6 class="sub-section-title">{{ trad('minorOptions.descriptionL1') }}<br />{{ trad('minorOptions.descriptionL2') }}</h6>
            <dynamic-list class="configuration-item" :label="trad('minorOptions.PATH_SEQUENCE_TO_INCLUDE.label')" :description="trad('minorOptions.PATH_SEQUENCE_TO_INCLUDE.description') " v-model="config.PATH_SEQUENCE_TO_INCLUDE" />
            <dynamic-list class="configuration-item" :label="trad('minorOptions.PATH_SEQUENCE_TO_IGNORE.label')" :description="trad('minorOptions.PATH_SEQUENCE_TO_IGNORE.description')" v-model="config.PATH_SEQUENCE_TO_IGNORE" />
          </div>
        </transition>
      </div>
    </div>
    <div class="d-flex flex-row-reverse footer">
      <button @click="saveConfiguration()" class="btn footer-btn" :class="anyChange ? 'btn-primary' : 'btn-outline-primary'" >{{ anyChange ? trad('saveChanges') : trad('goBackToModList') }}</button>
      <button @click="cancelModification()" v-show="anyChange" class="btn footer-btn" :class="anyChange ? 'btn-danger' : 'btn-outline-primary'" >{{ trad('cancelChanges') }}</button>
    </div>
    <!-- Le modal de sauvegarde, pour empêcher l'utilisateur de toucher à tout. -->
    <b-modal id="modal-save" hide-footer hide-header no-close-on-esc no-close-on-backdrop>
      <p>{{ trad('modal.currentlySaving') }}...</p>
    </b-modal>
    <!-- Le modal de confirmation d'annulation des changements -->
    <b-modal id="modal-cancel-modification" @ok="removeAnyChange" :title="trad('modal.cancellingModifications.title')">
      <div>
        <h6>{{ trad('modal.cancellingModifications') }} :</h6>
        <span v-for="prop of changeList" :key="prop">{{ prop }} <br /></span>
      </div>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Watch } from "vue-property-decorator";
import Vue from "vue";
import _cloneDeep from "lodash/cloneDeep";
import compareVersions from 'compare-versions';

import { AppState } from "@Web/store/state";
import ipc from '@Web/services/ipc';
import DynamicList from './dynamic-list.vue';
import FileList from './file-list.vue';
import FileHandler from './file-handler.vue';
import { PayloadView } from '@Common/events';
import { availableLanguages } from '@Common/translation';

@Component({
  components: {
    DynamicList,
    FileList,
    FileHandler,
  }
})
export default class ConfigPage extends Vue {
  /** Une copie de la configuration présente dans le store. */
  config: AppState["config"];
  /** Un dictionnaire des chemins vérifiés. */
  pathsChecked: Record<string, boolean> = {};
  /** Est-ce que les options moins utiles aux utilisateurs sont affichées ? */
  expanded = {
    minors: false,
  }

  get langs() {
    return availableLanguages.map(s => { return { value: s, text: s }});
  }

  /** Est-ce qu'un changement a été détecté dans la configuration ? */
  get anyChange(): boolean {
    return this.changeList.length > 0
  }

  trad(path: string) {
    return this.$t(`config.${path}`);
  }

  /** La liste des changements de la configuration, par propriétés. */
  get changeList(): string[] {
    const result: string[] = []
    const currentConfig = (this.$store.state as AppState).config;

    for (const prop of (Object.keys(currentConfig) as Array<keyof typeof currentConfig>)) {
      if (JSON.stringify(currentConfig[prop]) !== JSON.stringify(this.config[prop])) {
        result.push(prop);
      }
    }

    return result;
  }

  constructor() {
    super();
    this.config = _cloneDeep((this.$store.state as AppState).config);
  }

  /** Vérifie que la version harmony correspond bien à la norme semver */
  checkVersion(newVersion: string = this.config.HARMONY_VERSION): boolean {
    return compareVersions.validate(newVersion);
  }

  /** Sauvegarde la configuration et retourne sur la page des mods. */
  async saveConfiguration() {
    if (this.anyChange) {
      this.$bvModal.show('modal-save');

      await Promise.all([ // On attend 500ms, histoire de donner l'impression d'avoir fait quelque chose...
        new Promise((resolve) => setTimeout(() => resolve(), 500)),
        ipc.saveNewConfig(this.config),
      ]);
    }
    this.$router.push('/rimmod');
  }

  /** Demande la confirmation de l'utilisateur pour annuler les modifications. */
  cancelModification() {
    if (this.anyChange) {
      this.$bvModal.show('modal-cancel-modification');
    }
  }

  /** Annule les modifications de l'utilisateur */
  removeAnyChange() {
    this.config = _cloneDeep((this.$store.state as AppState).config);
  }

  /** Vérifie si un chemin de la configuration existe ET est disponible en lecture. */
  async checkPaths(value: string | string[]) {
    if (!Array.isArray(value)) {
      value = [value];
    }
    const result = await ipc.checkPath(value.map(s => { return { path: s } }));

    // Mise à jour du dictionnaire interne de l'état des répertoires.
    let answer: PayloadView<'CheckPath'>[0];
    for (answer of result) {
      Vue.set(this.pathsChecked, answer.path, answer.accessible);
    }
  }

  @Watch('config.PATH_TO_CHECK', { immediate: true })
  OnPathToCheckChange(newValue: string[]) {
    this.checkPaths(newValue);
  }

  @Watch('config.MODLIST_PATH', { immediate: true })
  OnModlistPathChange(newValue: string) {
    this.checkPaths([newValue]);
  }
}
</script>

<style scoped lang="less">
.footer {
  margin-top: 20px;
  border-top: 1px solid black;
}

.footer-btn {
  margin: 10px;
}

.configuration-item {
  &:not(.separator) {
    padding-bottom: 10px;
  }
  &.separator {
    // margin-top: 10px;
    margin-bottom: calc(40px - 0.25rem);
  }
}

.sub-section-title {
  margin-top: 10px;
  margin-bottom: 20px;
  text-align: center;
}

/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all .45s ease;
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
