
import { useState } from 'react'

function App() {
  const [message, setMessage] = useState('')

  async function getMessage() {
    const response = await fetch('/api/example')
    setMessage(await response.text())
  }

  return (
    <div>
      <h1>Zumrah</h1>
      <button onClick={getMessage}>Get Message</button>
      <p>{message}</p>
    </div>
  )
}

export default App
