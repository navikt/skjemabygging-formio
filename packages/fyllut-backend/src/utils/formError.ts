import { logger } from '../logger';

export const containsIgnoredString = (formPath: string) => {
  // There are bots that try to find vulnerabilities in the server by requesting forms that don't exist.
  // Ignore these requests to avoid spamming the logs.
  const ignoredStrings = [
    '.php',
    '.asp',
    '.bat',
    '.ini',
    '.jsp',
    '.asmx',
    '.dll',
    'cgi',
    '.exe',
    '.pl',
    '.pt',
    '.do',
    '.txt',
    '.sh',
    '.fts',
    '.cfm',
    '.swp',
    '.tmp',
    '.copy',
    '.bak',
    '.old',
    '.html',
    '.md',
    'assets',
    'projects_site',
    'lib',
    'atomicboard',
    'samples',
    'workarea',
    'contenido',
    'claroline',
    'subsystems',
    'sql',
    'hosting',
    'vendor',
    'ideabox',
    'backend',
    'classes',
    'docs',
    'loudblog',
    'man2html',
    'contacts',
    'gallery',
    'server',
    'nucleus',
    'nx',
    'member',
    'contrib',
    'shared',
    'www',
    'pajax',
    'phf',
    'docbuilder',
    'common',
    'phpping',
    'evb',
    'pm',
    'faces',
    'resource',
    'captcha',
    'serverview',
    'addschup',
    'tinybrowser',
    'faq',
    'upgrade',
    'tests',
    'bin',
    'forum',
    'stats',
    'cfide',
    'active',
    'history',
    'portal',
    'artifactory',
    'ncbook',
    'supporter',
    'op',
    'interface',
    'data',
    'nessus',
    'perl',
    'pfdispaly',
    'wizard',
    'identity',
    'billing',
    'pollit',
    'backoffice',
    'index',
    'module',
    'plugin',
    'admin',
    'config',
    'include',
    'misc',
    'login',
    'editor',
    'catalog',
    'librar',
    'users',
    'core',
    'adodb',
    'achievo',
    'embed',
    'patch',
    'docman',
    'kernel',
    'tool',
    'wiki',
    'break',
    'account',
    'home',
    'dynamic',
    'starnet',
    'web',
    'lang',
    'spaw',
    'cart',
    'inc',
    'mail',
    'upload',
    'texis',
    'engine',
    'tomcat',
    'search',
    'chat',
    'photo',
    'public',
    'shop',
    'help',
    'session',
    'news',
    'demo',
  ];
  return ignoredStrings.some((ignoredString) => formPath.toLowerCase().includes(ignoredString.toLowerCase()));
};

const FORM_PATH_REGEX = /nav\d{6}/;

export const logFormNotFound = (formPath: string) => {
  if (FORM_PATH_REGEX.test(formPath)) {
    logger.warn('Form not found', { formPath });
  } else if (!containsIgnoredString(formPath)) {
    logger.info('Form not found', { formPath });
  }
};
