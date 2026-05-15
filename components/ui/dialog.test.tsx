import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "./dialog";

describe("DialogContent", () => {
  it("renders closeLabel in sr-only text for the icon close control", () => {
    render(
      <Dialog open>
        <DialogContent closeLabel="Cerrar">
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByText("Cerrar", { selector: ".sr-only" })).toBeInTheDocument();
  });
});
