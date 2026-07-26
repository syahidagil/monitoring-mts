"use client";

import { useRef } from "react";

/**
 * Bungkus <form> filter di Server Component agar setiap <select>/<input>
 * di dalamnya bisa auto-submit saat berubah, tanpa memasang event handler
 * langsung di elemen milik Server Component (yang tidak diizinkan React).
 */
export default function AutoSubmitForm({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      className={className}
      onChange={() => formRef.current?.requestSubmit()}
    >
      {children}
    </form>
  );
}