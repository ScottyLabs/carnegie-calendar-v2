import { Event } from "@prisma/client";
import { format } from "date-fns";
import { CalendarIcon, ClockIcon, LinkIcon } from "lucide-react";
import Head from "next/head";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import { api } from "~/utils/api";
import { useForm } from "~/utils/form";
import { eventSearchSchema } from "~/utils/schemas";

interface EventProps {
  event: Event;
}
function Event({ event }: EventProps) {
  return (
    <div
      key={event.id}
      className="flex h-64 cursor-pointer flex-col gap-1 rounded-md p-8 text-center ring-1 ring-black ring-opacity-30 hover:shadow-lg"
    >
      <div className="text-lg font-bold">{event.summary}</div>
      <span className="inline-flex items-center gap-2 text-sm opacity-70">
        <ClockIcon className="h-4 w-4" />
        <span>
          {format(event.start, "mm/dd/yy hh:mm aa")} -{" "}
          {format(event.end, "hh:mm aa")}
        </span>
      </span>
      {event.url && (
        <span className="inline-flex items-center gap-2 text-sm opacity-70">
          <LinkIcon className="h-4 w-4" />
          <span className="truncate text-blue-400 underline">
            <a href={event.url} target="_blank" rel="noreferrer">
              Open Link
            </a>
          </span>
        </span>
      )}
      <span className="overflow-hidden text-ellipsis">{event.description}</span>
    </div>
  );
}

function Events() {
  const events = api.event.getAll.useQuery();

  if (!events.isSuccess) {
    return (
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.data.map((event) => (
        <Dialog key={event.id}>
          <DialogTrigger asChild>
            <button>
              <Event event={event} />
            </button>
          </DialogTrigger>
          <DialogContent>
            <div className="text-lg font-bold">{event.summary}</div>
            <span className="inline-flex items-center gap-2 text-sm opacity-70">
              <ClockIcon className="h-4 w-4" />
              <span>
                {format(event.start, "mm/dd/yy hh:mm aa")} -{" "}
                {format(event.end, "hh:mm aa")}
              </span>
            </span>
            {event.url && (
              <div className="flex items-center gap-2 text-sm opacity-70">
                <LinkIcon className="h-4 w-4" />
                <span className="truncate text-blue-400 underline">
                  <a href={event.url} target="_blank" rel="noreferrer">
                    {event.url}
                  </a>
                </span>
              </div>
            )}
            <div
              className="w-full"
              dangerouslySetInnerHTML={{ __html: event.description }}
            ></div>
            <div className="space-x-2">
              {event.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}

export default function Home() {
  const form = useForm({
    schema: eventSearchSchema,
  });

  // const events = api.event.search.useQuery(form.getValues());

  return (
    <>
      <Head>
        <title>Carnegie Calendar</title>
        <meta
          name="description"
          content="A calendar compiler for all the events happening at CMU."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen">
        <nav className="fixed z-50 flex h-20 w-full items-center border-b bg-background p-8">
          <h1 className="text-xl font-bold tracking-widest">
            Carnegie Calendar
          </h1>
        </nav>
        <div className="container mt-20 flex flex-col gap-12 px-4 py-16">
          <Form {...form}>
            <form
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onSubmit={form.handleSubmit(console.log, console.error)}
              className="max-w-md space-y-8"
            >
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Query</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Search for space-separated keyword(s)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="range"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Range</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value?.from ? (
                              field.value.to ? (
                                <>
                                  {format(field.value.from, "LLL dd, y")} -{" "}
                                  {format(field.value.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(field.value.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Search for events within a timeframe.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
          <div>
            <Events />
          </div>
        </div>
      </main>
    </>
  );
}
