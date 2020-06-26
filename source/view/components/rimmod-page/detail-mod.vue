<!-- Les informations détaillés d'un mod. -->
<template>
  <div class="d-flex flex-column rimmod-root" :class="{ replied }">
    <div class="d-flex flex-row justify-content-between align-items-start">
      <div class="d-flex flex-column">
        <!-- Nom du mod -->
        <div class="d-flex flex-row">
          <span class="rimmod-name">{{ value.name }}</span>
        </div>
        <!-- Lien + Auteur -->
        <span>
          <!-- Le lien vers la page du mod, si présent. -->
          <a href="javascript: void(0)" @click="navigateToUrl(value.url)" :title="value.url ? `${trad('urlModPage')} : \n${value.url}` : ''">
            <i class="icone-link fas" :class="{ disabled: !value.url, 'fa-link': value.url, 'fa-unlink': !value.url }"/>
          </a>
          <!-- Le lien vers la page steam du mod, si présent. (Généré à partir de l'id steam) -->
          <a href="javascript: void(0)" @click="navigateToUrl(steamWorkshopUrl)" :title="steamWorkshopUrl ? `${trad('urlWorkshop')} : \n${steamWorkshopUrl}` : ''">
            <i class="icone-steam fab fa-steam" :class="{ disabled: !steamWorkshopUrl }"/>
          </a>
          <!-- Le lien vers le dossier du mod. -->
          <a href="javascript: void(0)" @click="navigateToPath(value.rootPath)" :title="`${trad('urlFolder')} : \n${value.rootPath}`"
            @mouseover="folderPathHover = true"
            @mouseleave="folderPathHover = false"
          ><i class="icone-folder fas" :class="{ 'fa-folder': !folderPathHover, 'fa-folder-open': folderPathHover }"/>
          </a>
          <span class="rimmod-author">{{ value.author }}</span>
        </span>
        <!-- Version Harmony -->
        <div class="d-flex flex-row align-items-center">
          <i class="icone-harmony fab fa-gg-circle" :title="harmonyTooltip" :class="harmonyIconClass" />
          <span :title="harmonyPathsTooltip">{{ harmonyVersionText }}</span>
        </div>
      </div>
      <!-- Bouton de pliage -->
      <button class="btn rimmmod-folding-button btn-sm" :class="replied ? 'btn-secondary' : 'btn-info'" v-show="canBeReplied" @click="replied = !replied"  >
        {{ replied ? $t('generic.fold') : $t('generic.unfold') }}
      </button>
    </div>
    <div class="separator" v-if="desc.length > 0"></div>
    <span class="rimmod-desc" v-html="desc"></span>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import compareVersion from "compare-versions";

import ipcSvc from "@Web/services/ipc";
import { ModProperties } from "@Common/properties";
import { AppState } from "@Web/store/state";
import he from "he";

interface HarmonyIconClass {
  active: boolean;
  'text-warning'?: boolean;
  'text-info'?: boolean;
  'text-success'?: boolean;
  'text-danger'?: boolean;
}

@Component({})
export default class RimMod extends Vue {
  @Prop({
    type: Object,
    required: true
  })
  readonly value!: ModProperties;
  /** Est-ce que la vue est repliée ? */
  replied: boolean = true;
  /** Est-ce que la vue peut être repliée ? */
  canBeReplied: boolean = true;
  /** Est-ce que la souris est présente au dessus du lien vers le dossier du mod. */
  folderPathHover: boolean = false;

  mounted() {
    // On regarde si la description du mod dépasse la taille du bloc.
    const rootHeight = this.$el.clientHeight;
    const children = this.$el.children;
    let childrenHeight: number = 0;
    for (let i = 0; i < children.length; i++) {
      const el = children[i];
      childrenHeight += el.clientHeight;
    }
    this.canBeReplied = childrenHeight > rootHeight;
  }

  trad(path: string) {
    return this.$t(`rimmod.detailMod.${path}`);
  }

  /** Ouvre le lien passé en paramètre dans le navigateur. */
  navigateToUrl(url: string) {
    if (url) {
      ipcSvc.urlOpen(url);
    }
  }

  /** Ouvre le chemin passé dans l'explorateur */
  navigateToPath(path: string): void {
    if (path) {
      ipcSvc.pathOpen(path);
    }
  }

  /** La description du mod, reformattée pour avoir l'air correcte sur la page. */
  get desc(): string {
    let result = this.value.description.replace(/\\n/gi, "\n");
    result = result.trim();
    result = he.encode(result);
    // <b>, [b]
    result = result.replace(/(&#x3C;b&#x3E;)|(\[b\])/g, '<span style="font-weight:bold;">');
    result = result.replace(/(&#x3C;\/b&#x3E;)|(\[\/b\])/g, "</span>");
    // <url>, [url]
    result = result.replace(new RegExp(["\\[url=([^\\]]+)\\]", "([^\\]]+)", "\\[\\/url\\]"].join(""), "g"), '<span title="$1" style="color:blue">$2</a>');

    return result;
  }

  /** Do the mod include an harmony dll ? */
  get includeHarmony(): boolean {
    return this.harmonyVersion.length > 0;
  }

  /** La/Les versions de Harmony du mod. Peut trouver plusieurs DLLs harmony selon les autres options de configuration. */
  get harmonyVersion(): string[] {
    return this.value.harmonyDependancy.reduce((acc, curVer) => {
      if (acc.indexOf(curVer.AssemblyVersion) === -1) {
        acc.push(curVer.AssemblyVersion);
      }
      return acc;
    }, [] as string[]);
  }

  /** Où sont présentes les différentes version d'harmony. */
  get harmonyPathsTooltip(): string {
    if (!this.value.harmonyDependancy.length) {
      return '';
    }
    const array = this.value.harmonyDependancy;
    return `${ this.trad(array.length === 1 ? 'pathToDLL' : 'pathToDLLs')} :\n ${array.map(hd => hd.SourceFile).join('\n')}`;
  }

  /** Le tooltip harmony. */
  get harmonyTooltip(): string {
    const cls = this.harmonyIconClass;
    if (cls['text-danger']) {
      return this.trad('version.older').toString();
    } else if (cls['text-warning']) {
      return this.trad('version.multiple').toString();
    } else if (cls['text-info']) {
      return this.trad('version.newer').toString();
    } else if (cls['text-success']) {
      return this.trad('version.current').toString();
    }

    return '';
  }

  get harmonyIconClass(): HarmonyIconClass {
    const result: HarmonyIconClass = {
      active: this.includeHarmony
    };

    /** La version de Harmony à comparer. */
    const configHarmonyVersion = (this.$store.state as AppState).config.HARMONY_VERSION;

    if (this.harmonyVersion.length > 1) {
      result['text-warning'] = true;
    } else if (this.harmonyVersion.length === 1) {
      switch (compareVersion(configHarmonyVersion, this.harmonyVersion[0])) {
        case -1:
          result['text-info'] = true;
          break;
        case 0:
          result['text-success'] = true;
          break;
        case 1:
          result['text-danger'] = true;
          break;
      }
    }
    return result;
  }

  /** Retourne le texte utilisé pour l'affichage de la version locale d'Harmony. */
  get harmonyVersionText(): string {
    switch (this.harmonyVersion.length) {
      case 0:
        return this.trad('version.noLocal').toString();
      case 1:
        return `${this.trad('version.single')} : ${this.harmonyVersion.join(';')}`;
      default:
        return `${this.trad('version.plural')} : ${this.harmonyVersion.join(';')}`;
    }
  }

  /** Retourne l'url vers la page steam du mod, si il est possible de la déterminer. */
  get steamWorkshopUrl(): string {
    const id = ModProperties.GetSteamWorkshopId(this.value);
    return `https://steamcommunity.com/sharedfiles/filedetails/?id=${id}`;
  }
}
</script>

<style lang="less" scoped>
.rimmod-root {
  border: 1px solid black;
  padding: 2px 5px;
  margin-bottom: 3px;
  background-color: lightgray;

  &.replied {
    max-height: 5cm;
    overflow: hidden;
  }

  &:not(.replied) {
    outline: 5px auto darkcyan;
    // overflow: initial</transition>;
  }
}

.rimmod-name {
  font-weight: bold;
}

.rimmod-author {
  font-style: italic;
}

.rimmod-desc {
  white-space: pre-line;
}

.separator {
  margin: 7px 0;
}

.icone-harmony {
  color: gray;
  padding-right: 5px;

  .active {
    color: black;
  }
}

.icone-link, .icone-steam, .icone-folder {
  margin-right: 2.5px;
  color: black;

  &.disabled {
    color: gray;
  }

  &:hover:not(.disabled) {
    color: blue;
  }
}
.icone-folder {
  min-width: 18.5px; // Taille minimum imposée à cause de la différence de largeur entre l'icone 'fa-folder-open' et 'fa-folder'
}
.rimmod-author {
  margin-left: -2.5px; // Offset présent à cause de la taille minimum imposée à l'icone de dossier.
}
.rimmmod-folding-button {
  min-width: 80px;
}
.rimmod-used-mod-icon {
  padding: 8px;
  padding-top: 4px;
  width: 40px;
}
</style>
