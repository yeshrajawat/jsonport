import { BrowserRouter, Routes, Route } from "react-router-dom";
import JsonViewer from "./components/JsonViewer";
import JsonDiffViewer from "./components/JsonDiffViewer";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<JsonViewer />} />

        <Route path="/diff" element={<JsonDiffViewer />} />

      </Routes>

    </BrowserRouter>

  );

}

export default App;