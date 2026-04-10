import './App.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthProvider';
import { UserProvider } from './context/UserProvider';
import Layout from './layout/layout';

function App() {

  return (
    <>
      <AuthProvider>
        <UserProvider>
          <Layout/>
          <ToastContainer
            closeOnClick={true}
            draggable
            pauseOnHover
            theme="light"
            className="toast-container"
          />
        </UserProvider>
      </AuthProvider>

    </>
  )
}

export default App
