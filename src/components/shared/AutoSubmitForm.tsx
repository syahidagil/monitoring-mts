"use client";

import { ChangeEvent, FormHTMLAttributes } from "react";

type Props = FormHTMLAttributes<HTMLFormElement>;

// Form yang otomatis submit ketika salah satu field di dalamnya berubah
// (mis. select/input filter). Dibungkus sebagai Client Component karena
// event handler tidak bisa dilewatkan langsung dari Server Component.
export default function AutoSubmitForm({ children, ...props }: Props) {
  function handleChange(e: ChangeEvent<HTMLFormElement>) {
    e.currentTarget.requestSubmit();
  }

  return (
    <form {...props} onChange={handleChange}>
      {children}
    </form>
  );
}
