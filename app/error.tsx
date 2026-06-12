"use client";

import React from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
};

export default function ErrorPage({ error }: ErrorPageProps) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen w-full items-center justify-center">
      <section className="w-full max-w-lg rounded-xl border border-red-500 bg-red-950 p-6 shadow-xl">
        <p className="font-mono text-sm font-bold uppercase leading-none tracking-normal text-red-300">
          App error
        </p>

        <h1 className="mt-5 text-4xl font-black leading-none tracking-normal">
          An error has happened
        </h1>

        <p className="mt-5 text-lg leading-snug text-red-100">
          Please reload the page to continue.
        </p>

        <button
          className="mt-8 w-full rounded-lg border border-red-300 bg-red-200 px-4 py-3 font-bold text-red-950 transition-colors hover:bg-white"
          onClick={() => window.location.reload()}
          type="button"
        >
          Reload page
        </button>
      </section>
    </main>
  );
}
