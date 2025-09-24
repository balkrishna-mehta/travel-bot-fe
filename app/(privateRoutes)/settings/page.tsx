import React from "react";
import { SaveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import TicketIssuerConfiguration from "@/components/settings/ticket-issuer-configuration";
import ApiKeysIntegration from "@/components/settings/api-keys-integration";
import NotificationSetting from "@/components/settings/notification-setting";
import SystemSettings from "@/components/settings/system-settings";

const SettingsPage = () => {
  return (
    <div className="px-4 lg:px-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Configure system settings and integrations
            </p>
          </div>
          <Button variant="secondary">
            <SaveIcon className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TicketIssuerConfiguration />
        <ApiKeysIntegration />
        <NotificationSetting />
        <SystemSettings />
      </div>
    </div>
  );
};

export default SettingsPage;
