interface HomeHeaderViewProps {
  greeting: string;
  memberName: string;
  formattedDate: string;
}

export function HomeHeaderView({ greeting, memberName, formattedDate }: HomeHeaderViewProps) {
  return (
    <header className="mb-6">
      <div className="flex items-center justify-between">
        <p className="text-xs sm:text-sm font-semibold text-text-secondary uppercase tracking-wider">
          {greeting}
        </p>
        <span className="text-xs text-text-muted font-medium">
          {formattedDate}
        </span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mt-1 tracking-tight">
        {memberName}
      </h1>
    </header>
  );
}
