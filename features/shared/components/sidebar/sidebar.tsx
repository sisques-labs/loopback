import { NavLinks } from "@/features/shared/components/mobile-nav/nav-links";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

type Props = {
  dict: AppDict["shared"]["sidebar"];
  localePrefix: string;
};

export function Sidebar({ dict, localePrefix }: Props) {
  return (
    <aside className="hidden h-full w-56 flex-col border-r bg-sidebar px-4 py-6 md:flex">
      <NavLinks localePrefix={localePrefix} servicesLabel={dict.services} />
    </aside>
  );
}
