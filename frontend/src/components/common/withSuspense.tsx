import React, { Suspense } from "react";
import Loading from "@Components/common/Loading";

export const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
);
