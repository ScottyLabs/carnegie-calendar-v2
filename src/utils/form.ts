import { zodResolver } from "@hookform/resolvers/zod";
import type { UseFormProps } from "react-hook-form";
import { useForm as RHFUseForm } from "react-hook-form";
import type { z } from "zod";

export function useForm<TSchema extends z.ZodType>(
  props: Omit<UseFormProps<TSchema["_input"]>, "resolver"> & {
    schema: TSchema;
  }
) {
  const form = RHFUseForm<TSchema["_input"]>({
    ...props,
    resolver: zodResolver(props.schema),
  });

  return form;
}
