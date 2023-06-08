import { useLocation, Navigate } from 'react-router-dom';


const ProtectedRouter = ({children}) => {
    const location = useLocation();

    if (!sessionStorage.getItem('access')) {
        return <Navigate  to="/login" replace state={{from: location}} />;
    }

    return children;
}

export {ProtectedRouter};
