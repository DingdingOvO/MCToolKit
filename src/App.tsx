import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Items from './pages/Items'
import Blocks from './pages/Blocks'
import Sounds from './pages/Sounds'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='items' element={<Items />} />
          <Route path='blocks' element={<Blocks />} />
          <Route path='sounds' element={<Sounds />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}