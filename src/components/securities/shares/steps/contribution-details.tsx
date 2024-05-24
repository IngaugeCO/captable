"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  StepperModalFooter,
  StepperPrev,
  useStepper,
} from "@/components/ui/stepper";
import { useAddShareFormValues } from "@/providers/add-share-form-provider";
import type { RouterOutputs } from "@/trpc/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { EmptySelect } from "../../shared/EmptySelect";

interface ContributionDetailsProps {
  stakeholders: RouterOutputs["stakeholder"]["getStakeholders"];
}

const formSchema = z.object({
  stakeholderId: z.string(),
  capitalContribution: z.coerce.number().min(0),
  ipContribution: z.coerce.number().min(0),
  debtCancelled: z.coerce.number().min(0),
  otherContributions: z.coerce.number().min(0),
});

type TFormSchema = z.infer<typeof formSchema>;

export const ContributionDetails = ({
  stakeholders,
}: ContributionDetailsProps) => {
  const form = useForm<TFormSchema>({ resolver: zodResolver(formSchema) });
  const { next } = useStepper();
  const { setValue } = useAddShareFormValues();

  const handleSubmit = (data: TFormSchema) => {
    console.log({ data });
    setValue(data);
    next();
  };
  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-y-4"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="stakeholderId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stakeholder</FormLabel>
                {/* eslint-disable-next-line  @typescript-eslint/no-unsafe-assignment */}
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select stakeholder" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {stakeholders.length ? (
                      stakeholders.map((sh) => (
                        <SelectItem key={sh.id} value={sh.id}>
                          {sh.company.name} - {sh.name}
                        </SelectItem>
                      ))
                    ) : (
                      <EmptySelect
                        title="Stakeholders not found"
                        description="Please add stakeholders in company."
                      />
                    )}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs font-light" />
              </FormItem>
            )}
          />
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="capitalContribution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capital contribution</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs font-light" />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="ipContribution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intellectual property</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs font-light" />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="debtCancelled"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Debt cancelled</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs font-light" />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="otherContributions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other contributions</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs font-light" />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        <StepperModalFooter>
          <StepperPrev>Back</StepperPrev>
          <Button type="submit">Save & Continue</Button>
        </StepperModalFooter>
      </form>
    </Form>
  );
};
