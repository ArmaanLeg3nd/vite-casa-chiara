const getToken = () => {
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, '$1');

    try {
        // Verify the token to ensure it's valid before returning it
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decoding JWT payload
        const currentTime = Date.now() / 1000; // Convert milliseconds to seconds
    
        if (decodedToken.exp && decodedToken.exp > currentTime) {
            console.log('Token is valid');
          return token;
        }
      } catch (error) {
        console.error('Error parsing or validating token:', error);
      }
    
      // If the token is invalid or expired, return null
      return null;
};

const saveToken = (userToken) => {
    document.cookie = `token=${userToken.token}; path=/`;
};

export { getToken, saveToken };
