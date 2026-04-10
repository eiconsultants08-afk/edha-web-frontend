import React, { useContext, useEffect } from 'react';
import './layout.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';
import { UserContext } from '../context/UserProvider';
import { updateTokenAndUserDetails } from '../shared/utils/utils.jsx';
import Sidebar from '../components/sidebar/sidebar.jsx';
import Header from '../components/header/header.jsx';
import Footer from '../components/footer/footer.jsx';
import Routing from '../routing/Routing.jsx';

export default function Layout() {
  const Outside = ['/login'];
  const Location = useLocation();
  const isOutside = Outside.some((path) => Location.pathname.includes(path)) || Location.pathname === '/';
  const { auth,updateAuth } = useContext(AuthContext);
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    updateTokenAndUserDetails(updateAuth, updateUser).then((success) => {
      if (!success) {
        if (Location.pathname.includes('/login')) {
          return;
        } else {
          return navigate('/login');
        }
      }
      // if (isOutside) return navigate('/dashboard');

      if(isOutside){
        if (auth?.role === 'ADMIN') {
          return navigate('/admin/dashboard');
        }
        if (auth?.role === 'TECHNICIAN') {
          return navigate('/technician/patients');
        }
      }

    }, (err) => {
      console.warn(err);
    });
  }, [Location.pathname]);

  return (
    <>
      {isOutside ?
        (
          <main className='login-container'>
            <Routing />
          </main>
        ) : (
          <>
            <Sidebar />

            <main className='container'>
              <Header/>
              <section className='content-route'>
                <Routing />
              </section>
            </main>
            
            <Footer />
          </>
        )
      }
    </>
  );
}



