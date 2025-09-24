import React from "react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CardData {
  title: string;
  subtitle?: React.ReactNode;
  description: string;
  value: string;
  icon: React.ReactNode;
}

interface SectionCardsProps {
  data: CardData[];
}

export function SectionCards({ data }: SectionCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {data.map((card, index) => (
        <Card key={index} className="@container/card gap-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardDescription>{card.title}</CardDescription>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                {card.icon}
              </div>
            </div>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.value}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start text-sm">
            {card.subtitle && (
              <div className="text-sm text-muted-foreground">
                {card.subtitle}
              </div>
            )}
            <div className="text-muted-foreground">{card.description}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
