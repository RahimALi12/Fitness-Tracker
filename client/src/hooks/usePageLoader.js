// hooks/usePageLoader.js
import { useEffect } from 'react';
import { useLoading } from '../context/GlobalLoadingContext';

const usePageLoader = (promiseFn) => {
  const { setIsLoading } = useLoading();

  useEffect(() => {
    setIsLoading(true);
    promiseFn().finally(() => setIsLoading(false));
  }, []);
};

export default usePageLoader;
