import { createBrowserRouter, RouterProvider } from "react-router";
import { SessionProvider } from "../lib/session-context";

import { IntroPage } from "../routes/intro-page";
import { LocationPage } from "../routes/location-page";
import { PhotoPage } from "../routes/photo-page";
import { TestIntroPage } from "../routes/test-intro-page";
import { QuestionPage } from "../routes/question-page";
import { AnalyzingPage } from "../routes/analyzing-page";
import { ResultPage } from "../routes/result-page";
import { CharacterPage } from "../routes/character-page";
import { PledgePage } from "../routes/pledge-page";
import { CardFrontPage } from "../routes/card-front-page";
import { CardBackPage } from "../routes/card-back-page";
import { DrawPage } from "../routes/draw-page";
import { AdminPage } from "../routes/admin-page";

const router = createBrowserRouter([
  { path: "/", element: <IntroPage /> },
  { path: "/start", element: <LocationPage /> },
  { path: "/s/:id/photo", element: <PhotoPage /> },
  { path: "/s/:id/test/intro", element: <TestIntroPage /> },
  { path: "/s/:id/test", element: <QuestionPage /> },
  { path: "/s/:id/analyzing", element: <AnalyzingPage /> },
  { path: "/s/:id/result", element: <ResultPage /> },
  { path: "/s/:id/character", element: <CharacterPage /> },
  { path: "/s/:id/pledge", element: <PledgePage /> },
  { path: "/s/:id/card", element: <CardFrontPage /> },
  { path: "/s/:id/card/back", element: <CardBackPage /> },
  { path: "/s/:id/draw", element: <DrawPage /> },
  { path: "/admin", element: <AdminPage /> },
]);

export default function App() {
  return (
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  );
}
