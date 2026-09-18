import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/fc")({
  beforeLoad: () => {
    throw redirect({
      to: "/",
      search: {
        utm_source: "forocoches",
        utm_medium: "community",
        utm_campaign: "launch",
      },
      replace: true,
      reloadDocument: true,
      statusCode: 302,
    });
  },
});
