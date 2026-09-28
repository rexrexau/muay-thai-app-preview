import { Route, Switch } from 'wouter';
import JabPoc from './pages/JabPoc';

function Home() {
  return (
    <main style={{ padding: '2rem', color: '#f5f5f5', background: '#0d1117' }}>
      <h1>Muay Thai Training</h1>
      <p>Landing page placeholder — main training flow will be added here.</p>
      <nav style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <a href="/jab-poc">Open Jab POC</a>
      </nav>
    </main>
  );
}

export default function App() {
  return (
    <Switch>
      <Route path="/jab-poc"><JabPoc /></Route>
      <Route><Home /></Route>
    </Switch>
  );
}
