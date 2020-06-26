<template>
  <div class="d-flex flex-column dynamic-list"
    @mouseover="hovered = true"
    @mouseleave="hovered = false"
  >
    <b-form-group :id="`input-group-${id}`" :label="label" :description="description">
      <div class="line-root d-flex flex-row" v-for="(item, i) of list" :key="item" >
        <!-- Le champ textuel -->
        <b-form-input
          @click="focused = getId(i)" @blur="focused = ''" spellcheck="false"
          :id="getId(i)" :value="item" type="text" required @change="updateListElem(i, $event)" >
        </b-form-input>
        <!-- Un bouton (-) pour supprimer la ligne. -->
        <button class="btn btn-link line-remove-button" :class="{ selected: focused === getId(i) }" @click="removeListElem(i)" :title="$t('generic.removeElement')" >
          <i class="text-danger fas fa-minus-circle" />
        </button>
      </div>
      <!-- Un bouton (+) pour ajouter une line à la liste. Le rendu est différent si il y a plus de zéro élément dans la liste.-->
      <div class="opacity-transition" :class="{ 'opacity-hidden': !hovered && list.length }">
        <button v-if="list.length > 0" class="line-add btn btn-link" @click="addListElem()" :title="$t('generic.addOneElement')"
                v-show="!!(list[list.length - 1])"  >
          <i class="fas fa-plus-circle" />
        </button>
        <b-form-input v-else class="line-add" type="text" @change="addListElem($event)" spellcheck="false" />
      </div>
    </b-form-group>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from "vue-class-component";
import { Prop, Watch, Model } from "vue-property-decorator";
import { v4 } from 'uuid';
import ipc from '@Web/services/ipc';
import ListHandler from './list-handler';

@Component({})
export default class DynamicList extends ListHandler {
}
</script>

<style lang="less" scoped>
.line-root {
  position: relative;

  & + & {
    margin-top: 2px;
  }
}

.opacity-transition { transition: opacity 300ms linear; }

.opacity-hidden {
  opacity: 0;
}

.line-remove-button {
  position: absolute;
  float: right;
  right: -40px;
  align-self: center;
  .opacity-transition();
  .opacity-hidden();

  &.selected, &:hover {
    opacity: initial;
  }
}
.line-add {
  height: 40px;
}

</style>