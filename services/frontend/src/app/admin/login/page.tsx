"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/brand";

export default function AdminLoginPage() {
  const router = useRouter();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/admin");
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-surface-container-low px-margin py-xl">
      <div className="w-[min(100%,500px)] min-w-0 rounded-[2rem] border border-outline-variant bg-surface-container-lowest p-lg shadow-panel md:p-xl">
        <div className="mb-lg flex justify-center">
          <Brand showTagline />
        </div>

        <h1 className="mb-sm text-center type-headline-md">Вход в админ-панель</h1>
        <p className="mb-lg text-center type-body-md text-on-surface-variant">
          Введите логин и пароль для продолжения
        </p>

        <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-xs">
            <span className="type-label-md text-on-surface-variant">Логин</span>
            <input
              autoComplete="username"
              className="h-xl rounded-full border border-outline-variant bg-surface-container-lowest px-md type-body-md text-on-surface outline-none transition-colors placeholder:text-outline focus:border-primary"
              name="login"
              placeholder="Логин"
              type="text"
            />
          </label>

          <label className="flex flex-col gap-xs">
            <span className="type-label-md text-on-surface-variant">Пароль</span>
            <input
              autoComplete="current-password"
              className="h-xl rounded-full border border-outline-variant bg-surface-container-lowest px-md type-body-md text-on-surface outline-none transition-colors placeholder:text-outline focus:border-primary"
              name="password"
              placeholder="Пароль"
              type="password"
            />
          </label>

          <button
            className="mt-sm h-xl rounded-full bg-primary px-md type-label-md text-on-primary transition-colors hover:bg-primary-container"
            type="submit"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}
