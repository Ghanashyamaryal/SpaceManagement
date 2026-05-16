import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "@/components/ui/Button";
import JoditEditor from "jodit-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
// import { useRef } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/BreadCrumb";
import Loading from "@/components/common/Loading";
import { Textarea } from "@/components/ui/TextArea";

export function DialogCreateForm({
  fields,
  defaultValue,
  onSubmit,
  validationSchema,
  title1,
  // title2,
  titleLink1,
  titleLink2,
  isSubmitting,
  hideBreadcrumb,
}: any) {
  const form = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: defaultValue,
  });

  // ...
  // const fileInputRefs = useRef({});

  const handleFileChange = (e: any, name: any) => {
    const file = e.target.files[0];
    form.setValue(name, file);
  };

  const handleSubmit = async (data: any) => {
    onSubmit(data);
  };

  return (
    <>
      <Breadcrumb className={`${hideBreadcrumb ? "hidden" : ""}`}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={titleLink1}>{title1}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={titleLink2}>Create</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className={`mb-4 ${hideBreadcrumb ? "hidden" : ""}`}>
        <h3 className="text-3xl font-bold text-gray-800 mb-2">
          Create {title1}
        </h3>
        <p className="text-md text-gray-600">
          Fill out the form below to create a new {title1.toLowerCase()}.
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="grid grid-cols-1 gap-4"
        >
          {fields.map((item: any) => (
            <FormField
              control={form.control}
              name={item.name}
              key={item.name}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{item.label}</FormLabel>
                  <FormControl>
                    {item.type === "select" ? (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose your option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel className="capitalize">
                              {item.name}
                            </SelectLabel>
                            {item.options.map((option: any) => (
                              <SelectItem
                                value={option.value}
                                key={option.value}
                              >
                                <div></div>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    ) : item.type === "jodit" ? (
                      <JoditEditor
                        {...field}
                        value={field.value}
                        // placeholder={field.placeholder || ""}
                        tabIndex={1}
                        onBlur={(newContent) =>
                          form.setValue(field.name, newContent)
                        }
                      />
                    ) : item.type === "file" ? (
                      <Input
                        type="file"
                        accept={item.accept || "image/*"}
                        name={item.name}
                        // ref={(ref) => {
                        //   fileInputRefs.current[item.name] = ref;
                        // }}
                        onChange={(e) => handleFileChange(e, item.name)}
                      />
                    ) : item.type === "textarea" ? (
                      <Textarea placeholder={item.label} {...field} />
                    ) : (
                      <Input
                        type={item.type}
                        placeholder={item.label}
                        {...field}
                      />
                    )}
                  </FormControl>
                  <FormMessage>
                    {fieldState.error ? fieldState.error.message : null}
                  </FormMessage>
                </FormItem>
              )}
            />
          ))}
          {isSubmitting ? (
            <Button type="button" disabled>
              <Loading login="true" />
            </Button>
          ) : (
            <Button type="submit" className="">
              Submit
            </Button>
          )}
        </form>
      </Form>
    </>
  );
}
