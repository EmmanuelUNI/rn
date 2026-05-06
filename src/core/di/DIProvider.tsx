import React, { createContext, useContext, useMemo } from 'react';
import { Container } from './container';
import { TOKENS } from './tokens';

import { AuthRemoteDataSourceImpl } from '@/src/features/auth/data/datasources/AuthRemoteDataSourceImpl';
import { AuthRepositoryImpl } from '@/src/features/auth/data/repositories/AuthRepositoryImpl';
import { CourseRemoteDataSourceImpl } from '@/src/features/courses/data/datasources/CourseRemoteDataSourceImpl';
import { CourseRepositoryImpl } from '@/src/features/courses/data/repositories/CourseRepositoryImpl';

const DIContext = createContext<Container | null>(null);

export function DIProvider({ children }: { children: React.ReactNode }) {
  const container = useMemo(() => {
    const c = new Container();

    const authDS   = new AuthRemoteDataSourceImpl();
    const authRepo = new AuthRepositoryImpl(authDS);
    c.register(TOKENS.AuthRemoteDS, authDS)
     .register(TOKENS.AuthRepo, authRepo);

    const courseDS   = new CourseRemoteDataSourceImpl(authDS);
    const courseRepo = new CourseRepositoryImpl(courseDS);
    c.register(TOKENS.CourseRemoteDS, courseDS)
     .register(TOKENS.CourseRepo, courseRepo);

    return c;
  }, []);

  return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
}

export function useDI() {
  const c = useContext(DIContext);
  if (!c) throw new Error('DIProvider missing');
  return c;
}