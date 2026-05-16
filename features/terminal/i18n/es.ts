import type { TerminalDict } from "./en";
import type { WidenStringLiterals } from "@/features/shared/i18n/widen-literals";

type TerminalDictTranslated = WidenStringLiterals<TerminalDict>;

const dict = {
  title: "Terminal",
  underConstruction: "Esta función es experimental y los comandos pueden fallar.",
} as const satisfies TerminalDictTranslated;

export default dict;
