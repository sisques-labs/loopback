import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProfileSection } from "./profile-section";

const dict = {
  profileTitle: "Active Credential Source",
  credentialSourceEnv: "Environment variables",
  credentialSourceProfile: "AWS profile",
  credentialSourceInstanceMetadata: "Instance metadata",
  credentialSourceFallback: "Fallback (test/test)",
  profileActiveLabel: "Profile",
};

afterEach(() => {
  cleanup();
});

describe("ProfileSection", () => {
  it("renders the section title", () => {
    render(
      <ProfileSection credentialSource="env" dict={dict} />,
    );

    expect(screen.getByText(dict.profileTitle)).toBeInTheDocument();
  });

  it("shows 'Environment variables' label for env source", () => {
    render(<ProfileSection credentialSource="env" dict={dict} />);

    expect(screen.getByText(dict.credentialSourceEnv)).toBeInTheDocument();
  });

  it("shows 'AWS profile' label for profile source", () => {
    render(<ProfileSection credentialSource="profile" dict={dict} />);

    expect(screen.getByText(dict.credentialSourceProfile)).toBeInTheDocument();
  });

  it("shows 'Fallback (test/test)' label for fallback source", () => {
    render(<ProfileSection credentialSource="fallback" dict={dict} />);

    expect(screen.getByText(dict.credentialSourceFallback)).toBeInTheDocument();
  });

  it("shows 'Instance metadata' label for instance-metadata source", () => {
    render(<ProfileSection credentialSource="instance-metadata" dict={dict} />);

    expect(screen.getByText(dict.credentialSourceInstanceMetadata)).toBeInTheDocument();
  });

  it("shows profile name when credentialSource is profile and profileName is provided", () => {
    render(
      <ProfileSection credentialSource="profile" profileName="my-dev-profile" dict={dict} />,
    );

    expect(screen.getByText("my-dev-profile")).toBeInTheDocument();
  });

  it("does not show profile label when credentialSource is env", () => {
    render(<ProfileSection credentialSource="env" dict={dict} />);

    expect(screen.queryByText(dict.profileActiveLabel)).not.toBeInTheDocument();
  });
});
