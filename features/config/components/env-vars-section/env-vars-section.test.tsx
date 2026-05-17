import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EnvVarsSection } from "./env-vars-section";

const dict = {
  envVarsTitle: "Environment Variables",
  envVarsEndpointLabel: "AWS_ENDPOINT_URL",
  envVarsRegionLabel: "AWS_REGION",
  envVarsAccessKeyLabel: "AWS_ACCESS_KEY_ID",
  envVarsProfileLabel: "AWS_PROFILE",
  envVarsDefault: "(default)",
  notSet: "Not set",
};

afterEach(() => {
  cleanup();
});

describe("EnvVarsSection", () => {
  it("renders the section title", () => {
    render(
      <EnvVarsSection
        endpointUrl=""
        region="us-east-1"
        isRegionDefault={true}
        accessKeyId=""
        profile=""
        dict={dict}
      />,
    );

    expect(screen.getByText(dict.envVarsTitle)).toBeInTheDocument();
  });

  it("renders all four env var labels", () => {
    render(
      <EnvVarsSection
        endpointUrl="http://localhost:4566"
        region="eu-west-1"
        isRegionDefault={false}
        accessKeyId="AKIAIOSFODNN7EXAMPLE"
        profile="my-profile"
        dict={dict}
      />,
    );

    expect(screen.getByText(dict.envVarsEndpointLabel)).toBeInTheDocument();
    expect(screen.getByText(dict.envVarsRegionLabel)).toBeInTheDocument();
    expect(screen.getByText(dict.envVarsAccessKeyLabel)).toBeInTheDocument();
    expect(screen.getByText(dict.envVarsProfileLabel)).toBeInTheDocument();
  });

  it("shows (default) annotation when region is default", () => {
    render(
      <EnvVarsSection
        endpointUrl=""
        region="us-east-1"
        isRegionDefault={true}
        accessKeyId=""
        profile=""
        dict={dict}
      />,
    );

    expect(screen.getByText(dict.envVarsDefault)).toBeInTheDocument();
  });

  it("does not show (default) annotation when region is set explicitly", () => {
    render(
      <EnvVarsSection
        endpointUrl=""
        region="eu-west-1"
        isRegionDefault={false}
        accessKeyId=""
        profile=""
        dict={dict}
      />,
    );

    expect(screen.queryByText(dict.envVarsDefault)).not.toBeInTheDocument();
  });

  it("shows Not set for empty values", () => {
    render(
      <EnvVarsSection
        endpointUrl=""
        region="us-east-1"
        isRegionDefault={true}
        accessKeyId=""
        profile=""
        dict={dict}
      />,
    );

    const notSetElements = screen.getAllByText(dict.notSet);
    expect(notSetElements.length).toBeGreaterThan(0);
  });
});
