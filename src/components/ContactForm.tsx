import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const contactSchema = z.object({
  parentName: z
    .string()
    .trim()
    .nonempty({ message: "Parent name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z
    .string()
    .trim()
    .email({ message: "Enter a valid email" })
    .max(255, { message: "Email must be less than 255 characters" }),
  phone: z
    .string()
    .trim()
    .max(30, { message: "Phone must be less than 30 characters" })
    .optional()
    .or(z.literal("")),
  playerAge: z
    .string()
    .trim()
    .nonempty({ message: "Player age is required" })
    .max(10, { message: "Age must be less than 10 characters" }),
  city: z
    .string()
    .trim()
    .nonempty({ message: "City / neighborhood is required" })
    .max(120, { message: "City must be less than 120 characters" }),
  program: z
    .string()
    .trim()
    .nonempty({ message: "Please select a program" })
    .max(80, { message: "Program must be less than 80 characters" }),
  message: z
    .string()
    .trim()
    .nonempty({ message: "Please tell us a bit about your player" })
    .max(1000, { message: "Message must be less than 1000 characters" }),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormProps {
  onSubmitted?: () => void;
}

export const ContactForm = ({ onSubmitted }: ContactFormProps) => {
  const { toast } = useToast();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      parentName: "",
      email: "",
      phone: "",
      playerAge: "",
      city: "",
      program: "",
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    try {
      const response = await fetch("https://webhook.automab.dev/webhook/forms/pr-soccer-school", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      toast({
        title: "Form submitted",
        description:
          "Thank you for reaching out. We have received your information and will get back to you shortly.",
      });
      form.reset();
      onSubmitted?.();
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Submission failed",
        description: "There was an error sending your message. Please try again or call us directly.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FormField
          control={form.control}
          name="parentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent / Guardian Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Full name" autoComplete="name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="you@example.com" autoComplete="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="" autoComplete="tel" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="playerAge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Player Age</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. 11" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City / Neighborhood</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="program"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program of Interest</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a program</option>
                  <option value="Academy Training">Academy Training</option>
                  <option value="Clinics & Camps">Clinics & Camps</option>
                  <option value="Private Training">Private Training</option>
                  <option value="Goalkeeper Training">Goalkeeper Training</option>
                  <option value="Not sure yet">Not sure yet</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tell us about your player</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
                  placeholder="Current experience, club/school team, goals, and any questions you have."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting..." : "Submit Request"}
        </Button>
      </form>
    </Form>
  );
};
