import { Route, Routes } from "react-router-dom";
import Home from "../features/home/Home";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />}></Route>
    </Routes>
  );
}
