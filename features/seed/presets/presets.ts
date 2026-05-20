import type { Preset, PresetSlug } from "./schema";
import { ecommercePreset } from "./ecommerce";
import { blogPreset } from "./blog";
import { eventDrivenPreset } from "./event-driven";

export const PRESETS: Record<PresetSlug, Preset> = {
  ecommerce: ecommercePreset,
  blog: blogPreset,
  "event-driven": eventDrivenPreset,
};
