<template>
  <div class="d-flex flex-column"
    @mouseover="hovered = true"
    @mouseleave="hovered = false"
  >
    <b-form-group :label="label" :description="description">
      <div class="d-flex flex-row">
        <!-- Le champ textuel -->
        <b-form-input
          spellcheck="false" readonly
          v-model="value" type="text" required
          :state="state"
          >
        </b-form-input>
      </div>
    </b-form-group>
    <!-- Un bouton pour changer de fichier. -->
    <div class="opacity-transition" :class="{ 'opacity-hidden': !hovered }">
      <button class="btn btn-link button-add" @click="addFolder()" :title="$t('generic.changeFolder')">
        <i class="fas fa-folder" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from "vue-class-component";
import { Prop, Watch, Model } from "vue-property-decorator";
import { v4 } from 'uuid';
import ipc from '@Web/services/ipc';

@Component({})
export default class DynamicList extends Vue {
  /** Est-ce que la souris est présente au dessus du composant. */
  hovered: boolean = false;

  @Model('change', {
    type: String,
    required: true,
  }) value!: string;

  /** Le label au dessus de la liste des éléments. */
  @Prop({
    type: String,
    required: true,
  }) readonly label!: string;

  /** La description des éléments. */
  @Prop({
    type: String,
  }) readonly description!: string;

  @Prop({
    type: Object,
    default: () => { return {}; },
  }) readonly validation!: Record<string, boolean>;

  get state(): null | boolean {
    if (!this.validation) {
      return null;
    }
    let result = this.validation[this.value];
    return typeof result === 'boolean' ? result : null;
  }

  updateValue(newValue: string): void {
    this.$emit('change', newValue || '');
  }

  addFolder(): void {
    const result = ipc.lookForFile({
      type: 'folder',
    })[0] || '';
    if (result) {
      this.$emit('change', result);
    }
  }
}
</script>

<style lang="less" scoped>
.opacity-transition { transition: opacity 300ms linear; }

.opacity-hidden {
  opacity: 0;
}

.button-add {
  height: 40px;
}

</style>