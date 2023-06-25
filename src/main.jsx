import React from 'react'
import ReactDOM from 'react-dom/client'
import ImageToZoomVideo from './zoom2'
import './index.css'
import { Analytics } from '@vercel/analytics/react';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ImageToZoomVideo />
    <Analytics/>
  </React.StrictMode>,
)
