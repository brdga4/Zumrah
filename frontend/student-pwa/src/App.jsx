import { useState } from 'react'
import { API_BASE_URL } from './config'
import LoginPage from './Features/Auth/Components/LoginPage'
function App() {
  const [message, setMessage] = useState('')

  async function getMessage() {
    const response = await fetch(`${API_BASE_URL}/api/example`)
    setMessage(await response.text())
  }

  return (
    <div>
      <LoginPage/>
    </div>
  )
}

export default App