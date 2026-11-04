"use client";

import { CalendarClock, Grid3X3 } from "lucide-react";
import { ScheduleManager } from "@/components/admin/schedule-manager";
import { WeeklyScheduleEditor } from "@/components/admin/weekly-schedule-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ApiMaster } from "@/lib/types";

export function ScheduleWorkspace({ masters }: { masters: ApiMaster[] }) {
  return (
    <Tabs defaultValue="slots">
      <TabsList className="h-auto">
        <TabsTrigger value="slots">
          <Grid3X3 className="mr-1.5 h-3.5 w-3.5" />
          Слоты
        </TabsTrigger>
        <TabsTrigger value="week">
          <CalendarClock className="mr-1.5 h-3.5 w-3.5" />
          График недели
        </TabsTrigger>
      </TabsList>

      <TabsContent value="slots">
        <ScheduleManager masters={masters} />
      </TabsContent>

      <TabsContent value="week">
        <WeeklyScheduleEditor masters={masters} />
      </TabsContent>
    </Tabs>
  );
}
