import Login from "@/pages/Login";
import Map from "@/pages/Map";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/map",
    element: <Map />
  }
]);