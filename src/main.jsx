import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "./components/ui/sonner.jsx";
import Header from "./components/custom/Header.jsx";

const App = React.lazy(() => import("./App.jsx"));
const CreateTrip = React.lazy(() => import("./create-trip/index.jsx"));
const Viewtrip = React.lazy(() => import("./view-trip/[tripId]/index.jsx"));
const MyTrips = React.lazy(() => import("./my-trips/index.jsx"));

const LoadingScreen = () => (
  <div className="grid h-screen w-full place-items-center text-sm text-gray-500">
    Loading content...
  </div>
);

const withSuspense = (Component) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component />
  </Suspense>
);

// Console log attribution
console.log(`
██╗    ██╗██████╗ ██╗██╗ ██████╗
██║    ██║██╔══██╗██║██║██╔════╝
██║ █╗ ██║██████╔╝██║██║██║     
██║███╗██║██╔══██╗██║██║██║     
╚███╔███╔╝██████╔╝██║██║╚██████╗
 ╚══╝╚══╝ ╚═════╝ ╚═╝╚═╝ ╚═════╝

This website was made by WBIIC
`);

// Router Setup
const router = createBrowserRouter([
  {
    path: "/",
    element: withSuspense(App),
  },
  {
    path: "/create-trip",
    element: withSuspense(CreateTrip),
  },
  {
    path: "/view-trip/:tripId",
    element: withSuspense(Viewtrip),
  },
  {
    path: "/my-trips",
    element: withSuspense(MyTrips),
  },
]);

// Ambil Google Client ID dari .env
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Render App
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <Header />
      <Toaster />

      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
