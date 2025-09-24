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

const TicketIssuerConfiguration = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex text-xl font-semibold items-center gap-2">
          <User className="h-4 w-4" /> Ticket Issuer Configuration
        </CardTitle>
        <CardDescription>
          Configure the primary ticket booking service provider
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ticketIssuerName">Ticket Issuer Name</Label>
            <Input placeholder="Ticket Issuer" id="ticketIssuerName" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="emailAddress">Email Address</Label>
            <Input
              placeholder="ticketissuer@example.com"
              id="emailAddress"
              type="email"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input placeholder="+91 9876543210" id="phoneNumber" type="tel" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketIssuerConfiguration;
