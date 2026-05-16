const dict = {
  title: "Terminal",
  underConstruction: "This feature is experimental and commands may fail.",
} as const;

export default dict;
export type TerminalDict = typeof dict;
