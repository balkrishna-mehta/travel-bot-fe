import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Check, FileText, Clock, CreditCard } from "lucide-react";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

const ProgressSteps = ({ currentStep }: { currentStep: number }) => {
  const steps: Step[] = [
    {
      id: 0,
      title: "Select Travel Options",
      description: "Choose your preferred travel and accommodation",
      icon: FileText,
    },
    {
      id: 1,
      title: "Manager Approval",
      description: "Awaiting management review",
      icon: Clock,
    },
    {
      id: 2,
      title: "Ticket Processing",
      description: "Booking confirmation and ticket issuance",
      icon: CreditCard,
    },
  ];

  const getStepStatus = (stepIndex: number): string => {
    if (stepIndex < currentStep) return "completed";
    if (stepIndex === currentStep) return "current";
    return "pending";
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center">
          Travel Booking Request
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="w-full max-w-2xl mx-auto">
          {/* Desktop and Tablet Layout */}
          <div className="hidden sm:block">
            <div className="relative">
              {/* Icons Row - For Line Positioning */}
              <div className="flex items-center justify-center mb-6">
                {steps.map((step, index) => {
                  const status = getStepStatus(index);
                  const IconComponent =
                    status === "completed" ? Check : step.icon;

                  return (
                    <React.Fragment key={step.id}>
                      {/* Step Circle */}
                      <div className="px-6">
                        <div
                          className={`
                        w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-lg
                        ${
                          status === "completed"
                            ? "bg-primary border-primary text-primary-foreground shadow-primary/25"
                            : status === "current"
                            ? "bg-primary border-primary text-primary-foreground shadow-primary/25 ring-4 ring-primary/20"
                            : "bg-background border-muted-foreground/30 text-muted-foreground"
                        }
                      `}
                        >
                          <IconComponent className="h-5 w-5" />
                        </div>
                      </div>

                      {/* Connection Line */}
                      {index < steps.length - 1 && (
                        <div className="flex-1 mx-6 md:mx-8 lg:mx-12">
                          <div
                            className={`h-0.5 w-full transition-all duration-500 ${
                              index < currentStep
                                ? "bg-primary"
                                : "bg-muted-foreground/30"
                            }`}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Labels Row */}
              <div className="flex items-start justify-center">
                {steps.map((step, index) => {
                  const status = getStepStatus(index);

                  return (
                    <React.Fragment key={`label-${step.id}`}>
                      {/* Step Label - matches icon width */}
                      <div className="flex-1 text-center">
                        <p
                          className={`text-sm font-medium leading-tight ${
                            status === "current"
                              ? "text-primary font-semibold"
                              : status === "completed"
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.title}
                        </p>
                        {status === "current" && (
                          <div className="mt-2">
                            <div className="h-0.5 w-12 bg-primary mx-auto rounded-full"></div>
                          </div>
                        )}
                      </div>

                      {/* Spacer - matches icon connection line spacing exactly */}
                      {index < steps.length - 1 && (
                        <div className="flex-1 mx-6 md:mx-8 lg:mx-12"></div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="block sm:hidden">
            <div className="relative">
              {steps.map((step, index) => {
                const status = getStepStatus(index);
                const IconComponent = step.icon;

                return (
                  <div key={step.id} className="relative">
                    <div className="flex items-center space-x-4 pb-6">
                      {/* Step Circle */}
                      <div
                        className={`
                        w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-lg flex-shrink-0 relative z-10
                        ${
                          status === "completed"
                            ? "bg-primary border-primary text-primary-foreground shadow-primary/25"
                            : status === "current"
                            ? "bg-primary border-primary text-primary-foreground shadow-primary/25 ring-4 ring-primary/20"
                            : "bg-background border-muted-foreground/30 text-muted-foreground"
                        }
                      `}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>

                      {/* Step Content */}
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            status === "current"
                              ? "text-primary font-semibold"
                              : status === "completed"
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      </div>

                      {/* Status Indicator */}
                      <div className="flex-shrink-0">
                        {status === "completed" && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                        {status === "current" && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>

                    {/* Vertical Line */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-5 top-10 w-0.5 h-6 bg-muted-foreground/20 z-0"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressSteps;
