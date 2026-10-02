import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
}));
const authErrorMock = vi.hoisted(() => {
  class MockAuthError extends Error {}
  return { AuthError: MockAuthError };
});

vi.mock("@/lib/auth", () => authMocks);
vi.mock("next-auth", () => authErrorMock);

import { loginAction, logoutAction } from "./auth.action";

describe("auth actions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("mengirim kredensial dan mengembalikan sukses saat login berhasil", async () => {
    const formData = new FormData();
    formData.set("username", "admin");
    formData.set("password", "secret123");
    authMocks.signIn.mockResolvedValue(undefined);

    const result = await loginAction(formData);

    expect(authMocks.signIn).toHaveBeenCalledWith("credentials", {
      username: "admin",
      password: "secret123",
      redirect: false,
    });
    expect(result).toEqual({ success: true });
  });

  it("mengembalikan pesan umum saat proses login mengalami error tak terduga", async () => {
    const formData = new FormData();
    formData.set("username", "admin");
    formData.set("password", "secret123");
    authMocks.signIn.mockRejectedValue(new Error("network error"));

    const result = await loginAction(formData);

    expect(result).toEqual({ success: false, message: "Terjadi kesalahan. Coba lagi." });
  });

  it("mengembalikan pesan kredensial saat login ditolak", async () => {
    const formData = new FormData();
    formData.set("username", "admin");
    formData.set("password", "wrong-password");
    authMocks.signIn.mockRejectedValue(new authErrorMock.AuthError("CredentialsSignin"));

    const result = await loginAction(formData);

    expect(result).toEqual({ success: false, message: "Username atau password salah." });
  });

  it("mengarahkan logout ke halaman login", async () => {
    await logoutAction();

    expect(authMocks.signOut).toHaveBeenCalledWith({ redirectTo: "/login" });
  });
});