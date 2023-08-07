import { logger } from "../logger";

export const containsIgnoredString = (formPath: string) => {
  // There are bots that try to find vulnerabilities in the server by requesting forms that don't exist.
  // Ignore these requests to avoid spamming the logs.
  const ignoredStrings = [
    ".php",
    ".asp",
    ".asmx",
    "cgi",
    ".exe",
    ".pl",
    ".do",
    ".txt",
    ".sh",
    ".fts",
    "backoffice",
    "index",
    "module",
    "plugin",
    "admin",
    "config",
    "include",
    "misc",
    "login",
    "editor",
    "catalog",
    "librar",
    "users",
    "core",
    "adodb",
    "achievo",
    "embed",
    "patch",
    "docman",
    "kernel",
    "tool",
    "wiki",
    "break",
    "account",
    "home",
    "dynamic",
    "starnet",
    "web",
    "lang",
    "spaw",
    "cart",
    "inc",
    "mail",
    "upload",
    "texis",
    "engine",
    "tomcat",
    "search",
    "chat",
    "photo",
    "public",
    "shop",
    "help",
    "session",
    "news",
    "demo",
  ];
  return ignoredStrings.some((ignoredString) => formPath.toLowerCase().includes(ignoredString.toLowerCase()));
};

export const logFormNotFound = (formPath: string) => {
  if (!containsIgnoredString(formPath)) {
    logger.error("Form not found", { formPath });
  }
};
