"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Bot, FileText, Loader2, Send, ShieldAlert, User, MessageSquare, Instagram } from "lucide-react";

import { analyzeSocialMediaContent, AnalyzeSocialMediaContentOutput } from "@/ai/flows/analyze-social-media-content";
import { assessDrugTraffickingRisk, AssessDrugTraffickingRiskOutput } from "@/ai/flows/assess-drug-trafficking-risk";
import { generateReportFromAnalysis, GenerateReportFromAnalysisOutput } from "@/ai/flows/generate-report-from-analysis";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { RiskMeter } from "@/components/risk-meter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "./ui/separator";

const formSchema = z.object({
  platform: z.enum(["Telegram", "WhatsApp", "Instagram"], {
    required_error: "Please select a platform.",
  }),
  content: z.string().min(20, { message: "Content must be at least 20 characters." }),
});

const PlatformIcons: Record<string, React.ElementType> = {
  Telegram: Send,
  WhatsApp: MessageSquare,
  Instagram: Instagram,
};

export function Dashboard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState<AnalyzeSocialMediaContentOutput | null>(null);
  const [riskResult, setRiskResult] = React.useState<AssessDrugTraffickingRiskOutput | null>(null);
  const [reportResult, setReportResult] = React.useState<GenerateReportFromAnalysisOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAnalysisResult(null);
    setRiskResult(null);
    setReportResult(null);

    try {
      const analysis = await analyzeSocialMediaContent({
        platform: values.platform,
        content: values.content,
      });
      setAnalysisResult(analysis);

      const risk = await assessDrugTraffickingRisk({
        contentAnalysis: JSON.stringify(analysis, null, 2),
      });
      setRiskResult(risk);

      const report = await generateReportFromAnalysis({
        contentAnalysis: JSON.stringify(analysis, null, 2),
        riskAssessment: JSON.stringify(risk, null, 2),
      });
      setReportResult(report);
    } catch (error) {
      console.error("Analysis pipeline failed:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const renderResults = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      );
    }

    if (!analysisResult && !riskResult) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg h-full">
          <div className="p-4 bg-secondary rounded-full mb-4">
              <Bot className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">Awaiting Analysis</h3>
          <p className="text-muted-foreground mt-1">Submit content to begin the analysis process.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {riskResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="text-accent" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RiskMeter score={riskResult.riskScore} level={riskResult.riskLevel} />
              <Separator />
              <h4 className="font-semibold">Risk Indicators</h4>
              <div className="flex flex-wrap gap-2">
                {riskResult.indicators.map((indicator, i) => (
                  <Badge key={i} variant="secondary" className="bg-accent/10 text-accent border-accent/20">{indicator}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {analysisResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot />
                AI Content Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Potential Indicators</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.indicators.map((indicator, i) => (
                    <Badge key={i} variant="outline">{indicator}</Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold">AI Reasoning</h4>
                <p className="text-muted-foreground text-sm mt-2">{analysisResult.reasoning}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {reportResult && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText />
                Generated Summary Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{reportResult.report}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <div className="xl:col-span-1 xl:sticky top-8">
          <Card>
            <CardHeader>
              <CardTitle>Content Submission</CardTitle>
              <CardDescription>Enter social media content for analysis.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Telegram">
                                <div className="flex items-center gap-2"><Send className="h-4 w-4"/> Telegram</div>
                            </SelectItem>
                            <SelectItem value="WhatsApp">
                                <div className="flex items-center gap-2"><MessageSquare className="h-4 w-4"/> WhatsApp</div>
                            </SelectItem>
                            <SelectItem value="Instagram">
                                <div className="flex items-center gap-2"><Instagram className="h-4 w-4"/> Instagram</div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paste text content here..."
                            className="resize-y min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Run Analysis"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-2 space-y-6">
            {renderResults()}
        </div>
      </div>
    </main>
  );
}
