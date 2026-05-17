type CredentialSource = "env" | "profile" | "instance-metadata" | "fallback";

type ProfileSectionDict = {
  profileTitle: string;
  credentialSourceEnv: string;
  credentialSourceProfile: string;
  credentialSourceInstanceMetadata: string;
  credentialSourceFallback: string;
  profileActiveLabel: string;
};

type Props = {
  credentialSource: CredentialSource;
  profileName?: string;
  dict: ProfileSectionDict;
};

const SOURCE_LABEL_MAP = {
  env: "credentialSourceEnv",
  profile: "credentialSourceProfile",
  "instance-metadata": "credentialSourceInstanceMetadata",
  fallback: "credentialSourceFallback",
} as const satisfies Record<CredentialSource, keyof ProfileSectionDict>;

export function ProfileSection({ credentialSource, profileName, dict }: Props) {
  const sourceLabel = dict[SOURCE_LABEL_MAP[credentialSource]];

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted-foreground">{dict.profileTitle}</h2>
      <dl className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium text-muted-foreground">Active source</dt>
          <dd className="text-sm">{sourceLabel}</dd>
        </div>
        {credentialSource === "profile" && profileName && (
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium text-muted-foreground">
              {dict.profileActiveLabel}
            </dt>
            <dd className="text-sm font-mono">{profileName}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
