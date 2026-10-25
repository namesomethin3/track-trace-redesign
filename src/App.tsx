import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Codes from './pages/Codes'
import Complaint from './pages/Complaint'
import Entry from './pages/Entry'
import Track from './pages/Track'
import { AppProvider } from './state'
import { Layout } from './ui/Layout'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Entry />} />
            <Route path="track/:id" element={<Track />} />
            <Route path="complaint/:id" element={<Complaint />} />
            <Route path="codes" element={<Codes />} />
            <Route path="*" element={<Entry />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
