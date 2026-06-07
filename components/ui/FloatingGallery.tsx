'use client';
import Image from 'next/image';
import { useRef } from 'react';
import styles from './FloatingGallery.module.css';
import { floating1 , floating2  , floating3  , floating4  , floating5  , floating6  , floating7  , floating8 } from '@/app/data';

export default function FloatingGallery({children}: {children: React.ReactNode}) {
  
    const plane1 = useRef(null);
    const plane2 = useRef(null);
    const plane3 = useRef(null);

    return (
    <main className={styles.main}>
      <div ref={plane1} className={styles.plane}>
          <Image 
            src={floating1}
            alt='image'
            width={300}
            className='hidden md:block'
          />
           <Image 
            src={floating2}
            alt='image'
            width={300}
            className='w-30 md:w-[300px]'
          />
          <Image 
            src={floating7}
            alt='image'
            width={225}
            className='hidden md:block'
          />
      </div>
      <div ref={plane2} className={styles.plane}>
          <Image 
            src={floating4}
            alt='image'
            // width={250}
            className='w-30 md:w-[250px]'
          />
           <Image 
            src={floating6}
            alt='image'
            // width={200}
            className='w-30 md:w-[200px]'
          />
          <Image 
            src={floating8}
            alt='image'
            width={225}
            className='w-50 md:w-[225px]'
          />
      </div>
      <div ref={plane3} className={styles.plane}>
          <Image 
            src={floating3}
            alt='image'
            width={150}
            className='hidden md:block'
          />
           <Image 
            src={floating5}
            alt='image'
            width={200}
            className='hidden md:block'
          />
      </div>
        {children}
     </main>
  )
}