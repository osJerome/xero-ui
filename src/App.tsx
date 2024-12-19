import "./App.css";
import { useXero } from "./components/hooks/useXero";

function App() {
  const { connectXero, getAccounts, isAuthenticated, loading } =
    useXero();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h1>Xero Testing UI</h1>
      <div className="auth-status">
        Status: {isAuthenticated ? "Connected" : "Not Connected"}
      </div>
      <button onClick={connectXero} disabled={isAuthenticated}>
        {isAuthenticated ? "Connected to Xero" : "Connect to Xero"}
      </button>

      {isAuthenticated && (
        <div className="actions">
          <h2>Available Actions</h2>
          <button onClick={getAccounts}>Accounts</button>
        </div>
      )}
    </>
  );
}

export default App;
