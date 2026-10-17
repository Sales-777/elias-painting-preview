import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource-variable/manrope/wght.css'
import '@fontsource-variable/dm-sans/wght.css'
import './styles.css'
import App from './App'

const root = document.getElementById('root')!
if (root.querySelector('main')) hydrateRoot(root, <App />)
else createRoot(root).render(<App />)
