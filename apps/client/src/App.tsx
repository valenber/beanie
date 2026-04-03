import { useEffect, useState } from 'react';

function App() {
  const [apiStatus, setApiStatus] = useState<string>('loading...');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data: { status: string }) => setApiStatus(data.status))
      .catch(() => setApiStatus('unreachable'));
  }, []);

  return (
    <main>
      <h1>Beannie</h1>
      <p>API status: <strong>{apiStatus}</strong></p>
    </main>
  );
}

export default App;
