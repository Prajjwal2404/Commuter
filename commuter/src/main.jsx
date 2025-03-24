import { createRoot } from 'react-dom/client'
import { UserProvider } from './Components/useUser.jsx'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(<UserProvider><App /></UserProvider>)
