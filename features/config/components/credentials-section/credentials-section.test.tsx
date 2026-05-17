import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CredentialsSection } from "./credentials-section";

const dict = {
  credentialsTitle: "Credentials",
  credentialsAccessKeyLabel: "Access Key ID",
  credentialsSecretKeyLabel: "Secret Access Key",
  notSet: "Not set",
};

afterEach(() => {
  cleanup();
});

describe("CredentialsSection", () => {
  it("renders the section title", () => {
    render(
      <CredentialsSection
        accessKeyId="AKIAIOSFODNN7EXAMPLE"
        maskedSecret="••••••••wXyZ"
        dict={dict}
      />,
    );

    expect(screen.getByText(dict.credentialsTitle)).toBeInTheDocument();
  });

  it("renders access key label", () => {
    render(
      <CredentialsSection
        accessKeyId="AKIAIOSFODNN7EXAMPLE"
        maskedSecret="••••••••wXyZ"
        dict={dict}
      />,
    );

    expect(screen.getByText(dict.credentialsAccessKeyLabel)).toBeInTheDocument();
  });

  it("renders secret key label", () => {
    render(
      <CredentialsSection
        accessKeyId="AKIAIOSFODNN7EXAMPLE"
        maskedSecret="••••••••wXyZ"
        dict={dict}
      />,
    );

    expect(screen.getByText(dict.credentialsSecretKeyLabel)).toBeInTheDocument();
  });

  it("renders the masked secret (already masked by server)", () => {
    render(
      <CredentialsSection
        accessKeyId="AKIAIOSFODNN7EXAMPLE"
        maskedSecret="••••••••wXyZ"
        dict={dict}
      />,
    );

    expect(screen.getByText("••••••••wXyZ")).toBeInTheDocument();
  });

  it("renders the access key id verbatim", () => {
    render(
      <CredentialsSection
        accessKeyId="AKIAIOSFODNN7EXAMPLE"
        maskedSecret="••••••••wXyZ"
        dict={dict}
      />,
    );

    expect(screen.getByText("AKIAIOSFODNN7EXAMPLE")).toBeInTheDocument();
  });

  it("shows Not set when accessKeyId is empty", () => {
    render(
      <CredentialsSection
        accessKeyId=""
        maskedSecret=""
        dict={dict}
      />,
    );

    const notSetElements = screen.getAllByText(dict.notSet);
    expect(notSetElements.length).toBeGreaterThan(0);
  });
});
