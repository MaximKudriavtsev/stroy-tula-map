"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/brand";
import { login } from "@/lib/api/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось войти");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-surface-container-low px-margin py-xl">
      <div className="w-[min(100%,500px)] min-w-0 rounded-[2rem] border border-outline-variant bg-surface-container-lowest p-lg shadow-panel md:p-xl">
        <div className="mb-lg flex justify-center">
          <Brand showTagline />
        </div>

        <h1 className="mb-sm text-center type-headline-md">Вход в админ-панель</h1>
        <p className="mb-lg text-center type-body-md text-on-surface-variant">
          Введите email и пароль для продолжения
        </p>

        <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-xs">
            <span className="type-label-md text-on-surface-variant">Email</span>
            <input
              autoComplete="username"
              className="h-xl rounded-full border border-outline-variant bg-surface-container-lowest px-md type-body-md text-on-surface outline-none transition-colors placeholder:text-outline focus:border-primary"
              disabled={submitting}
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              type="email"
              value={email}
            />
          </label>

          <label className="flex flex-col gap-xs">
            <span className="type-label-md text-on-surface-variant">Пароль</span>
            <input
              autoComplete="current-password"
              className="h-xl rounded-full border border-outline-variant bg-surface-container-lowest px-md type-body-md text-on-surface outline-none transition-colors placeholder:text-outline focus:border-primary"
              disabled={submitting}
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Пароль"
              type="password"
              value={password}
            />
          </label>

          {error ? <p className="type-body-md text-error">{error}</p> : null}

          <button
            className="mt-sm h-xl rounded-full bg-primary px-md type-label-md text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Вход…" : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
