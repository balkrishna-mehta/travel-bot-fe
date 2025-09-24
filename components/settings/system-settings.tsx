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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SystemSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex text-xl font-semibold items-center gap-2">
          <User className="h-4 w-4" /> System Settings
        </CardTitle>
        <CardDescription>
          General system configuration and defaults
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="autoApprovalLimit">Auto-Approval Limit ($)</Label>
            <Input
              placeholder="Auto-Approval Limit"
              id="autoApprovalLimit"
              type="number"
            />
            <p className="text-sm text-muted-foreground">
              Requests below this amount are auto-approved
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="defaultCurrency">Default Currency</Label>
            <Select value="INR">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value="indian-time">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="indian-time">
                  Indian Standard Time
                </SelectItem>
                <SelectItem value="eastern-time">Eastern Time (EST)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemSettings;
