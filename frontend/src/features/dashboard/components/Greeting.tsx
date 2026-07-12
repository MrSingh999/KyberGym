import React from "react";
import { useAuthStore } from "../../../../store/auth.store";
import { useCurrentTenant } from "../../../tenant/hooks/useCurrentTenant";
import { Stack } from "../../../../components/layout/Stack";

export function Greeting() {
  const { user } = useAuthStore();
  const { data: tenant } = useCurrentTenant();

  const hour = new Date().getHours();
  let timeOfDay = "Evening";
  if (hour < 12) timeOfDay = "Morning";
  else if (hour < 18) timeOfDay = "Afternoon";

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <Stack gap="xs">
        <h1 className="text-3xl font-heading font-bold tracking-tight text-primary">
          Good {timeOfDay}, {user?.name.split(" ")[0]}
        </h1>
        <p className="text-secondary text-sm">
          Here is what's happening at <span className="font-medium text-primary">{tenant?.name}</span> today.
        </p>
      </Stack>
    </div>
  );
}
