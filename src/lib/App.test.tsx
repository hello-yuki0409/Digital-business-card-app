import { render, screen } from "@testing-library/react";
import App from "../App";
import { MemoryRouter } from "react-router-dom";

test("renders navigation links", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

  // 👇 getByTextからgetByRoleに変更し、役割(role)と名前(name)で指定する
  expect(screen.getByRole("link", { name: /ホーム/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /概要/i })).toBeInTheDocument();
});
