import { ConfigRow } from "@/features/config/components/config-row/config-row";

type EnvVarsSectionDict = {
  envVarsTitle: string;
  envVarsEndpointLabel: string;
  envVarsRegionLabel: string;
  envVarsAccessKeyLabel: string;
  envVarsProfileLabel: string;
  envVarsDefault: string;
  notSet: string;
};

type Props = {
  endpointUrl: string;
  region: string;
  isRegionDefault: boolean;
  accessKeyId: string;
  profile: string;
  dict: EnvVarsSectionDict;
};

export function EnvVarsSection({
  endpointUrl,
  region,
  isRegionDefault,
  accessKeyId,
  profile,
  dict,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted-foreground">{dict.envVarsTitle}</h2>
      <dl className="flex flex-col gap-3">
        <ConfigRow
          label={dict.envVarsEndpointLabel}
          value={endpointUrl || dict.notSet}
        />
        <ConfigRow
          label={dict.envVarsRegionLabel}
          value={region}
          annotation={isRegionDefault ? dict.envVarsDefault : undefined}
        />
        <ConfigRow
          label={dict.envVarsAccessKeyLabel}
          value={accessKeyId || dict.notSet}
        />
        <ConfigRow
          label={dict.envVarsProfileLabel}
          value={profile || dict.notSet}
        />
      </dl>
    </div>
  );
}
