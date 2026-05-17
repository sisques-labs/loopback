import { ConfigRow } from "@/features/config/components/config-row/config-row";

type CredentialsSectionDict = {
  credentialsTitle: string;
  credentialsAccessKeyLabel: string;
  credentialsSecretKeyLabel: string;
  notSet: string;
};

type Props = {
  /** Shown verbatim — access key ID is a non-secret identifier */
  accessKeyId: string;
  /** Pre-masked by the server — raw secret NEVER passed as prop */
  maskedSecret: string;
  dict: CredentialsSectionDict;
};

export function CredentialsSection({ accessKeyId, maskedSecret, dict }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted-foreground">{dict.credentialsTitle}</h2>
      <dl className="flex flex-col gap-3">
        <ConfigRow
          label={dict.credentialsAccessKeyLabel}
          value={accessKeyId || dict.notSet}
        />
        <ConfigRow
          label={dict.credentialsSecretKeyLabel}
          value={maskedSecret || dict.notSet}
        />
      </dl>
    </div>
  );
}
