import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/layouts/app-layout";

export default function Login({ logs }) {
  return (
    <AppLayout>
    <Card className="max-w-4xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>📜 سجل النشاط</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-sm">لا يوجد نشاط مسجل حتى الآن.</p>
          ) : (
            <ul className="space-y-4">
              {logs.map((log) => (
                <li key={log.id} className="border-b pb-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{log.causer?.name} {log.description}</span>
                    <Badge variant="outline" className="text-xs">
                      {new Date(log.created_at).toLocaleString("ar-EG")}
                    </Badge>
                  </div>
                  {log.properties && (
                    <p className="text-xs text-muted-foreground mt-1">
                      IP: {log.properties.ip} | Agent: {log.properties.user_agent}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
    </AppLayout>
  );
}
