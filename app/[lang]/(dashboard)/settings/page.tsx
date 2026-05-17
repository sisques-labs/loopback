import { cookies } from "next/headers";
import { LocaleSwitcher } from "@/features/shared/components/locale-switcher/locale-switcher";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { ENDPOINT_COOKIE_NAME, maskSecret } from "@/lib/aws/config";
import { EndpointForm } from "@/features/config/components/endpoint-form/endpoint-form";
import { EnvVarsSection } from "@/features/config/components/env-vars-section/env-vars-section";
import { CredentialsSection } from "@/features/config/components/credentials-section/credentials-section";
import { ProfileSection } from "@/features/config/components/profile-section/profile-section";

type CredentialSource = "env" | "profile" | "instance-metadata" | "fallback";

function resolveCredentialSource(): CredentialSource {
  if (process.env.AWS_PROFILE) return "profile";
  if (process.env.AWS_ACCESS_KEY_ID) return "env";
  return "fallback";
}

export default async function SettingsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const s = dict.shared.settings;

  // Read cookie for endpoint override
  const store = await cookies();
  const cookieEndpoint = store.get(ENDPOINT_COOKIE_NAME)?.value ?? "";
  const currentEndpoint = cookieEndpoint || process.env.AWS_ENDPOINT_URL?.trim() || "";

  // Read env vars for display (server-only — never passed to client components)
  const region = process.env.AWS_REGION ?? "us-east-1";
  const isRegionDefault = !process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID ?? "";
  const profile = process.env.AWS_PROFILE ?? "";
  const endpointUrl = process.env.AWS_ENDPOINT_URL?.trim() ?? "";

  // Mask secret — raw value NEVER leaves this server component
  const rawSecret = process.env.AWS_SECRET_ACCESS_KEY ?? "";
  const maskedSecret = rawSecret ? maskSecret(rawSecret) : "";

  const credentialSource = resolveCredentialSource();
  const profileName = process.env.AWS_PROFILE;

  const endpointDict = {
    endpointInputLabel: s.endpointInputLabel,
    endpointInputPlaceholder: s.endpointInputPlaceholder,
    endpointSave: s.endpointSave,
    endpointClear: s.endpointClear,
    endpointSaving: s.endpointSaving,
    endpointSuccess: s.endpointSuccess,
    endpointInvalidUrl: s.endpointInvalidUrl,
  };

  const envVarsDict = {
    envVarsTitle: s.envVarsTitle,
    envVarsEndpointLabel: s.envVarsEndpointLabel,
    envVarsRegionLabel: s.envVarsRegionLabel,
    envVarsAccessKeyLabel: s.envVarsAccessKeyLabel,
    envVarsProfileLabel: s.envVarsProfileLabel,
    envVarsDefault: s.envVarsDefault,
    notSet: s.notSet,
  };

  const credentialsDict = {
    credentialsTitle: s.credentialsTitle,
    credentialsAccessKeyLabel: s.credentialsAccessKeyLabel,
    credentialsSecretKeyLabel: s.credentialsSecretKeyLabel,
    notSet: s.notSet,
  };

  const profileDict = {
    profileTitle: s.profileTitle,
    credentialSourceEnv: s.credentialSourceEnv,
    credentialSourceProfile: s.credentialSourceProfile,
    credentialSourceInstanceMetadata: s.credentialSourceInstanceMetadata,
    credentialSourceFallback: s.credentialSourceFallback,
    profileActiveLabel: s.profileActiveLabel,
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <h1 className="text-2xl font-semibold tracking-tight">{s.title}</h1>

      {/* Language section — unchanged */}
      <section className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-sm font-medium text-muted-foreground">{s.languageTitle}</h2>
        <LocaleSwitcher
          currentLocale={locale}
          dict={dict.shared.localeSwitcher}
          hideLabel
        />
      </section>

      {/* Endpoint section — editable */}
      <section className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-sm font-medium text-muted-foreground">{s.endpointSectionTitle}</h2>
        <EndpointForm currentEndpoint={currentEndpoint} dict={endpointDict} />
      </section>

      {/* Environment Variables — read-only */}
      <section className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm md:p-6">
        <EnvVarsSection
          endpointUrl={endpointUrl}
          region={region}
          isRegionDefault={isRegionDefault}
          accessKeyId={accessKeyId}
          profile={profile}
          dict={envVarsDict}
        />
      </section>

      {/* Credentials — read-only, masked */}
      <section className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm md:p-6">
        <CredentialsSection
          accessKeyId={accessKeyId}
          maskedSecret={maskedSecret}
          dict={credentialsDict}
        />
      </section>

      {/* Active Credential Source — read-only */}
      <section className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm md:p-6">
        <ProfileSection
          credentialSource={credentialSource}
          profileName={profileName}
          dict={profileDict}
        />
      </section>
    </div>
  );
}
