'use client';
import {useEffect, useState} from 'react';

interface Props {
  children: React.ReactElement | React.ReactElement[];
}

const Hydration: React.FC<Props> = ({children}: Props) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return <>{isHydrated ? <div>{children}</div> : null}</>;
};

export default Hydration;
