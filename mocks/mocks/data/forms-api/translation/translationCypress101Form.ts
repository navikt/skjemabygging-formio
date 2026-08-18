import { createCypress101Form, createCypress101Translations } from '../shared/createCypress101Form';

const translationCypress101Form = () => createCypress101Form({ path: 'translationcypress101' });

const translationCypress101Translations = () => createCypress101Translations('translationcypress101');

export { translationCypress101Form, translationCypress101Translations };
