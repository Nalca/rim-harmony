import Vue from 'vue';
import Component from "vue-class-component";
import { Prop, Model } from "vue-property-decorator";
import { v4 } from 'uuid';

@Component({})
export default class ListHandler extends Vue {
  /** L'id du composant. Permet d'assigner un id unique aux listes */
  id: string = v4();
  /** L'id de la ligne possèdant actuellement le focus. Utilisé pour afficher / cacher le bouton supprimer de la ligne. */
  focused: string = '';
  /** Est-ce que la souris est présente au dessus du composant. */
  hovered: boolean = false;

  /** La liste des éléments à afficher. */
  @Model('change', {
    type: Array,
    required: true,
    validator: (v: boolean) => { return Array.isArray(v) && v.every(s => typeof s === 'string'); }
  }) readonly list!: string[];

  /** Le label au dessus de la liste des éléments. */
  @Prop({
    type: String,
    required: true,
  }) readonly label!: string;

  /** La description des éléments. */
  @Prop({
    type: String,
  }) readonly description!: string;

  // /** Le nombre maximum d'élément dans la liste */
  // @Prop({
  //   type: Number,
  //   default: -1,
  // }) readonly limite!: number;

  /** Met à jour un élément de la liste.
   *  @param position La position de l'élément.
   *  @param newValue la nouvelle valeur de l'élément.
   */
  updateListElem(position: number, newValue: string): void {
    // if (this.limite !== -1 || this.limite > position) {
      Vue.set(this.list, position, newValue.trim());
    // }
  }

  /** Ajoute un élément dans la liste interne.
   *  @param content Le contenu à ajouter.
  */
  addListElem(content?: string): void {
    // if (this.limite !== -1 || this.limite > this.list.length) {
      this.list.push(content || '');
    // }
  }

  /** Supprime un élément de la liste interne.
   *  @param position La position de l'élément à supprimer
   */
  removeListElem(position: number): void {
    const targetValue = this.list[position];
    if (this.list.length > position) {
      this.list.splice(position, 1);
    }
    if (typeof targetValue === 'string' && targetValue === this.focused) {
      this.focused = '';
    }
  }

  /** Retourne un id composé  à partir de l'id du composant et de la place de l'élément dans la list. */
  getId(elemNum: number): string {
    return `${this.id}-${elemNum}`;
  }
}