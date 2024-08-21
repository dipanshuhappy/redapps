import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import React from "react";
// MakeFetchingEasy
export const QueryBoundaries = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary onReset={reset} FallbackComponent={ErrorView}>
        <React.Suspense fallback={<LoadingView />}>{children}</React.Suspense>
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
);

// Spinner
const LoadingView = () => <div>Loading...</div>;

// Error + retry
const ErrorView = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div>
      <div>{error.message}</div>
      <button title="Retry" onClick={resetErrorBoundary} />
    </div>
  );
};
