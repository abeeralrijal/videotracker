type DailyPoint = {
  label: string;
  incidents: number;
  critical: number;
};

type CategoryStat = {
  label: string;
  count: number;
  trend: number;
};

type Incident = {
  id: string;
  time: string;
  category: string;
  severity: "Critical" | "High" | "Medium";
  location: string;
  summary: string;
  status: "Open" | "Investigating" | "Resolved";
};

const categories = [
  "Theft",
  "Assault",
  "Medical Emergency",
  "Vandalism",
  "Trespass",
  "Traffic Collision",
  "Fire/Smoke",
];

const locations = [
  "North Lot",
  "Main Entrance",
  "Retail Block A",
  "Transit Bay",
  "Dorm Perimeter",
  "Service Alley",
];

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function generateFakeAnalytics(days: number = 14, seed?: number) {
  const rand = seededRandom(seed ?? Date.now());

  const daily: DailyPoint[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const incidents = Math.floor(6 + rand() * 20);
    const critical = Math.min(incidents, Math.floor(rand() * 6));
    daily.push({
      label: formatDateLabel(date),
      incidents,
      critical,
    });
  }

  const categoryStats: CategoryStat[] = categories.map((label) => ({
    label,
    count: Math.floor(6 + rand() * 28),
    trend: Math.round((rand() * 20 - 10) * 10) / 10,
  }));
  categoryStats.sort((a, b) => b.count - a.count);

  const recentIncidents: Incident[] = Array.from({ length: 8 }).map((_, idx) => {
    const category = categories[Math.floor(rand() * categories.length)];
    const severityPool: Incident["severity"][] = ["Critical", "High", "Medium"];
    const severity = severityPool[Math.floor(rand() * severityPool.length)];
    const location = locations[Math.floor(rand() * locations.length)];
    const time = new Date(Date.now() - idx * 45 * 60 * 1000).toLocaleTimeString(
      "en-US",
      { hour: "2-digit", minute: "2-digit" }
    );
    const statusPool: Incident["status"][] = ["Open", "Investigating", "Resolved"];
    return {
      id: `INC-${Math.floor(1000 + rand() * 9000)}`,
      time,
      category,
      severity,
      location,
      status: statusPool[Math.floor(rand() * statusPool.length)],
      summary: `${category} reported near ${location}. Responding units notified.`,
    };
  });

  return { daily, categoryStats, recentIncidents, locations };
}

export function buildLinePath(points: number[], width: number, height: number) {
  const maxValue = Math.max(...points, 1);
  const minValue = Math.min(...points, 0);
  const range = Math.max(maxValue - minValue, 1);
  return points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((value - minValue) / range) * height;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export function buildBars(points: number[], width: number, height: number) {
  const maxValue = Math.max(...points, 1);
  const gap = 8;
  const barWidth = (width - gap * (points.length - 1)) / points.length;
  return points.map((value, index) => {
    const barHeight = (value / maxValue) * height;
    const x = index * (barWidth + gap);
    const y = height - barHeight;
    return { x, y, width: barWidth, height: barHeight };
  });
}
