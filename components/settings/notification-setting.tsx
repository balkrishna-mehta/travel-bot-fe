import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const NotificationSetting = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex text-xl font-semibold items-center gap-2">
          <User className="h-4 w-4" /> Notification Setting
        </CardTitle>
        <CardDescription>
          Configure how and when notifications are sent
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="rapidAPIKey">RapidAPI Key</Label>
            <Input
              placeholder="RapidAPI Key"
              id="rapidAPIKey"
              type="password"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="whatsappBusinessAPIKey">
              WhatsApp Business API Key
            </Label>
            <Input
              placeholder="WhatsApp Business API Key"
              id="whatsappBusinessAPIKey"
              type="password"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="openAIAPIKey">OpenAI API Key</Label>
            <Input
              placeholder="OpenAI API Key"
              id="openAIAPIKey"
              type="password"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSetting;
