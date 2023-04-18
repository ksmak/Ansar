import { useLocation, Navigate } from 'react-router-dom';

const ProtectedRouter = ({children}) => {
    const location = useLocation();
    const access_token = localStorage.getItem('access');
    const refresh_token = localStorage.getItem('refresh');

    if (!access_token || !refresh_token) {
        return <Navigate  to="/login" replace state={{from: location}} />
    }

    return children;
}

export {ProtectedRouter};
