import { useState } from 'react';
import { getToken, saveToken } from './tokenService';

const useToken = () => {
    const initialToken = getToken();
    const [token, setToken] = useState(initialToken);

    const setNewToken = (userToken) => {
        if (userToken) {
            saveToken(userToken);
            setToken(userToken.token);
        }
    };

    return {
        setToken: setNewToken,
        token,
    };
};

export default useToken;
