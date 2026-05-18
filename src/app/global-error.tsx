"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
          padding: "1rem",
          textAlign: "center",
          background: "#fafafa",
          color: "#111111",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Something went wrong
        </h1>
        <p style={{ color: "#666", marginBottom: "1.5rem", maxWidth: "400px" }}>
          A critical error occurred. Please reload the page.
        </p>
        {error.digest && (
          <p style={{ fontSize: "0.75rem", color: "#888", marginBottom: "1rem", fontFamily: "monospace" }}>
            Error ID: {error.digest}
          </p>
        )}
        <button
          onClick={unstable_retry}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
