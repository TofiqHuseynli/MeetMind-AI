import { createBrowserRouter, Navigate } from "react-router";
import { NotFoundRoute } from "./routes/not-found";
import { RootLayout } from "./routes/root-layout";

// Each page is its own chunk, loaded on the first visit, so the first screen does not wait for
// the charts, the board and the tables of the others. The shell stays in the main chunk.
export const router = createBrowserRouter([
  // Before the app: no shell, no session needed.
  {
    path: "/login",
    lazy: { Component: async () => (await import("./routes/login")).LoginRoute },
  },
  {
    path: "/set-password",
    lazy: { Component: async () => (await import("./routes/set-password")).SetPasswordRoute },
  },
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: "dashboard",
        lazy: { Component: async () => (await import("./routes/dashboard")).DashboardRoute },
      },
      {
        path: "meetings",
        lazy: { Component: async () => (await import("./routes/meetings")).MeetingsRoute },
      },
      {
        path: "meetings/:id",
        lazy: { Component: async () => (await import("./routes/meeting")).MeetingRoute },
      },
      {
        path: "action-items",
        lazy: {
          Component: async () => (await import("./routes/action-items")).ActionItemsRoute,
        },
      },
      {
        path: "upload",
        lazy: { Component: async () => (await import("./routes/upload")).UploadRoute },
      },
      { path: "*", Component: NotFoundRoute },
    ],
  },
]);
