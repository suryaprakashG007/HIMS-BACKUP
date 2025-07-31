import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { TooltipCarbon } from "./TooltipCarbon";

describe("TooltipCarbon", () => {
  beforeAll(() => {
    const { getComputedStyle } = window;
    window.getComputedStyle = (elt) => getComputedStyle(elt);
  });
  it("matches snapshot", () => {
    const { container, getByText } = render(
      <TooltipCarbon content="TestContent" />
    );
    expect(
      container.getElementsByClassName("bx--tooltip__label").length
    ).toEqual(1);
    fireEvent.click(container.querySelector(".bx--tooltip__trigger"));
    expect(getByText("TestContent")).toBeTruthy();
  });
});
