import fr from './fr.json';
import en from './en.json';

const exportation = {
  'en': en,
  'fr_FR': fr,
  'fr': fr,
};

export const availableLanguages = Object.freeze(Object.keys(exportation));

export default exportation;