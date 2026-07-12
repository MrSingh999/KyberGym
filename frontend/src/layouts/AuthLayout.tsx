import { Outlet } from "react-router";

export function AuthLayout() {
  return (
    <div className="min-h-screen w-full bg-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight font-heading text-primary">
          KyberGym
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-4 shadow-card sm:rounded-2xl sm:px-10 border border-default">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
