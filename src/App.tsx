import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout'

const Home = lazy(() => import('./pages/Home'))
const Items = lazy(() => import('./pages/Items'))
const Blocks = lazy(() => import('./pages/Blocks'))
const Sounds = lazy(() => import('./pages/Sounds'))

export default function App() {
  return (
    <BrowserRouter basename='/MCToolKit'>
      <Suspense fallback={null}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path='items' element={<Items />} />
            <Route path='blocks' element={<Blocks />} />
            <Route path='sounds' element={<Sounds />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}