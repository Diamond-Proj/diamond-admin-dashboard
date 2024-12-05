'use client'

import { useState, useEffect } from 'react'
import { defineStepper } from '@stepperize/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Control, useForm, useFormContext, UseFormReturn } from 'react-hook-form'
import { Schema, z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'


const endpointSchema = z.object({
  endpoint: z.string().min(1, 'Endpoint selection is required'),
  partition: z.string().min(1, 'Partition is required'),
})

const containerSchema = z.object({
  containerName: z.string().min(1, 'Container name is required'),
  location: z.string().min(1, 'Image location is required'),
  baseImage: z.string().min(1, 'Base image is required')
})

const dependenciesSchema = z.object({
  dependencies: z.string().optional()
})

const environmentSchema = z.object({
  environment: z.string().optional(),
  location: z.string().optional()
})

const commandsSchema = z.object({
  commands: z.string().min(1, 'At least one build command is required')
})

const reviewSchema = z.object({})


const { Scoped, useStepper } = defineStepper(
  { id: 'endpointinfo', title: 'Select Endpoint', schema: endpointSchema },
  { id: 'containerinfo', title: 'Container Info', schema: containerSchema },
  { id: 'dependencies', title: 'Dependencies', schema: dependenciesSchema },
  { id: 'environment', title: 'Environment', schema: environmentSchema },
  { id: 'commands', title: 'Build Commands', schema: commandsSchema },
  { id: 'review', title: 'Review', schema: reviewSchema }
)

type FormData = z.infer<typeof endpointSchema> &
  z.infer<typeof containerSchema> &
  z.infer<typeof dependenciesSchema> &
  z.infer<typeof environmentSchema> &
  z.infer<typeof commandsSchema>

type EndpointFormValues = z.infer<typeof endpointSchema>
type ContainerFormValues = z.infer<typeof containerSchema>
type DependenciesFormValues = z.infer<typeof dependenciesSchema>
type EnvironmentFormValues = z.infer<typeof environmentSchema>
type CommandsFormValues = z.infer<typeof commandsSchema>

type FullFormValues = EndpointFormValues &
  ContainerFormValues &
  DependenciesFormValues &
  EnvironmentFormValues &
  CommandsFormValues


export function ImageBuilderStepper() {
  const [formData, setFormData] = useState<Partial<FormData>>({})
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [endpoints, setEndpoints] = useState<
    { endpoint_uuid: string; endpoint_name: string }[]
  >([])

  const form = useForm<FormData>({
    resolver: zodResolver(z.object({})),
    defaultValues: formData
  })

  const endpointValue = form.watch('endpoint');

  const { control, register } = form;

  const handleStepSubmit = (stepData: Partial<FormData>) => {
    console.log(stepData);
    setFormData((prev) => ({ ...prev, ...stepData }))
  }

  const handleFinalSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const payload = {
        endpoint: data.endpoint,
        partition: data.partition,
        name: data.containerName,
        base_image: data.baseImage,
        location: data.location,
        dependencies: data.dependencies,
        environment: data.environment,
        commands: data.commands,
      }

      const response = await fetch('/api/image_builder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to submit image build configuration')

      const result = await response.json()
      console.log('Submitted data:', result)
      toast({
        title: 'Success',
        description: 'Image build configuration submitted successfully!',
        className: 'bg-green-500 text-white'
      })
    } catch (error) {
      console.error('Error submitting data:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit image build configuration. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    async function fetchEndpoints() {
      try {
        const response = await fetch('/api/list_active_endpoints')
        const data = await response.json()
        setEndpoints(data)
      } catch (error) {
        console.error('Error fetching endpoints:', error)
      }
    }

    fetchEndpoints();
    //Fetch endpoints on the first call and then wait 5s after
    const timeout = setTimeout(fetchEndpoints, 5000);
    return () => clearTimeout(timeout);
  }, [])

  return (
    <Scoped>
      <StepperContent
        form={form}
        formData={formData}
        onStepSubmit={handleStepSubmit}
        onFinalSubmit={handleFinalSubmit}
        isLoading={isLoading}
        control={control}
        endpoints={endpoints}
        endpointValue={endpointValue}
      />
    </Scoped>
  )
}

function StepperContent({
  form,
  formData,
  onStepSubmit,
  onFinalSubmit,
  isLoading,
  control,
  endpoints,
  endpointValue
}: {
  form: UseFormReturn<FormData, any, undefined>
  formData: Partial<FormData>
  onStepSubmit: (data: Partial<FormData>) => void
  onFinalSubmit: (data: FormData) => void
  isLoading: boolean
  control: Control<FormData>
  endpoints: { endpoint_uuid: string; endpoint_name: string }[]
  endpointValue: string
}) {
  const stepper = useStepper()

  const onSubmit = (values: z.infer<typeof stepper.current.schema>) => {
    console.log(`Form values for step ${stepper.current.id}:`, values);
    if(stepper.isLast){
      onFinalSubmit(values as FormData);
      stepper.reset();
    } else {
      stepper.next();
    }
    onStepSubmit(values as FormData);
  }

  return (
    <div className="bg-card dark:bg-card/80 shadow-lg rounded-xl p-6 border border-border">
      <div className="mb-8">
        <StepIndicator />
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {stepper.switch({
            endpointinfo: () => <EndpointStep control={control} endpoints={endpoints} endpointValue={endpointValue} />,
            containerinfo: () => <ContainerStep />,
            dependencies: () => <DependenciesStep />,
            environment: () => <EnvironmentStep />,
            commands: () => <CommandsStep />,
            review: () => <ReviewStep onSubmit={onSubmit} isLoading={isLoading} />
          })}
        </form>
      </Form>
      <div className="mt-8 flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={stepper.prev}
          disabled={stepper.isFirst || isLoading}
          className="bg-background dark:bg-background/80 text-foreground hover:bg-muted"
        >
          Previous
        </Button>
        {stepper.isLast ? (
          <Button
            type="button"
            onClick={() => onSubmit(form.getValues() as FormData)}
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={stepper.next}
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  )
}

function StepIndicator() {
  const stepper = useStepper()
  return (
    <div className="flex justify-between">
      {stepper.all.map((step, index) => (
        <div
          key={step.id}
          className={`flex flex-col items-center ${
            index <= stepper.all.indexOf(stepper.current)
              ? 'text-primary'
              : 'text-muted-foreground'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 border-2 ${
              index <= stepper.all.indexOf(stepper.current)
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-muted-foreground bg-background text-muted-foreground'
            }`}
          >
            {index + 1}
          </div>
          <span className="text-sm">{step.title}</span>
        </div>
      ))}
    </div>
  )
}

function EndpointStep({ control, endpoints, endpointValue }: { control: Control<FormData>, endpoints: { endpoint_uuid: string; endpoint_name: string }[], endpointValue: string }) {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext<EndpointFormValues>()
  const [partitions, setPartitions] = useState<string[]>([]);
  const [partitionsCache, setPartitionsCache] = useState<{ [key: string]: string[] }>({});
  const [isLoadingPartitions, setIsLoadingPartitions] = useState(false);

  useEffect(() => {
    if (endpoints) {
      if (partitionsCache[endpointValue]) {
        setPartitions(partitionsCache[endpointValue]);
      } else {
        const fetchPartitions = async () => {
          setIsLoadingPartitions(true);
          try {
            const response = await fetch('/api/list_partitions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ endpoint: endpointValue }),
            });
            const data = await response.json();
            setPartitions(data);
            setPartitionsCache((prevCache) => ({
              ...prevCache,
              [endpointValue]: data,
            }));
          } catch (error) {
            console.error('Error fetching partitions:', error);
          } finally {
            setIsLoadingPartitions(false);
          }
        };
        fetchPartitions();
      }
    } else {
      setPartitions([]);
    }
  }, [endpointValue]);


  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Select Endpoint</h2>
      
      {/* Endpoint Selection */}
      <FormField
        control={control}
        name="endpoint"
        render={({ field }) => (
          <FormItem className="w-[60%] md:w-[20%]">
            <FormLabel>Endpoint</FormLabel>
            <Select
              onValueChange={(value) => {
                setValue('endpoint', value)
                field.onChange(value)
              }}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select endpoint" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {endpoints.length > 0 ? (
                  endpoints.map((endpoint) => (
                    <SelectItem
                      key={endpoint.endpoint_uuid}
                      value={endpoint.endpoint_uuid}
                    >
                      {endpoint.endpoint_name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No endpoints available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormMessage>{errors.endpoint?.message}</FormMessage>
          </FormItem>
        )}
      />

      {/* Partition Selection Dropdown */}
      <FormField
        control={control}
        name="partition"
        render={({ field }) => (
          <FormItem className="w-[60%] md:w-[20%]">
            <FormLabel>Partition</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={isLoadingPartitions || partitions.length === 0}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingPartitions ? "Loading..." : "Select partition"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {partitions.length > 0 ? (
                  partitions.map((partition) => (
                    <SelectItem
                      key={partition}
                      value={partition}
                    >
                      {partition}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No partitions available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormDescription>
              Select a partition from the list.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
        />
    </div>
  )
}

function ContainerStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ContainerFormValues>();
  
  return (
    <>
      <div>
        <h2 className="text-2xl font-bold mb-4">Container Name</h2>
        <label htmlFor={register('containerName').name}>Container Name</label>
        <Input placeholder="myContainer" {...register('containerName')} />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Location</h2>
        <label htmlFor={register('location').name}>Build Location</label>
        <Input 
          placeholder="e.g., /home/user/builds" 
          {...register('location')}
        />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Container Name</h2>
        <label htmlFor={register('baseImage').name}>Container Name</label>
        <Input placeholder="python:3.9-slim" {...register('baseImage')} />
      </div>
    </>
    
  );
}

function DependenciesStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<DependenciesFormValues>();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dependencies</h2>
      <label htmlFor={register('dependencies').name}>Copy Pasta your requirements.txt here</label>
      <Input placeholder="e.g., numpy==1.21.0&#10;pandas==1.3.0" {...register('dependencies')} />
    </div>
  )
}

function EnvironmentStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<EnvironmentFormValues>();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-4">Environment</h2>
        <label htmlFor={register('environment').name}>Environment Variables</label>
        <Textarea 
          placeholder="e.g., DEBUG=1&#10;API_KEY=your_api_key" 
          {...register('environment')}
          className="min-h-[100px]"
        />
      </div>
    </div>
  )
}

function CommandsStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CommandsFormValues>();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Build Commands</h2>
      <label htmlFor={register('commands').name}>Insert your build commands here</label>
      <Textarea 
        placeholder={`Enter commands, one per line. For example:
pip install -r requirements.txt
python setup.py install
python -m pytest`}
        className="min-h-[100px]"
        {...register('commands')} 
      />
    </div>
  )
}

function ReviewStep({ onSubmit, isLoading }: { onSubmit: (data: FullFormValues) => void, isLoading: boolean }) {
  const {
    watch,
    formState: { errors },
  } = useFormContext<FullFormValues>();
  const formData = watch();
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-foreground">Review</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-foreground">Selected Endpoint:</h3>
          <p className="bg-muted/50 dark:bg-muted p-2 rounded-md">{formData.endpoint}</p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Container name:</h3>
          <p className="bg-muted/50 dark:bg-muted p-2 rounded-md">{formData.containerName}</p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Base Image:</h3>
          <p className="bg-muted/50 dark:bg-muted p-2 rounded-md">{formData.baseImage}</p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Dependencies:</h3>
          <pre className="bg-muted/50 dark:bg-muted p-2 rounded-md">{formData.dependencies}</pre>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Environment:</h3>
          <pre className="bg-muted/50 dark:bg-muted p-2 rounded-md">{formData.environment}</pre>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Location:</h3>
          <pre className="bg-muted/50 dark:bg-muted p-2 rounded-md">{formData.location}</pre>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Build Commands:</h3>
          <pre className="bg-muted/50 dark:bg-muted p-2 rounded-md">{formData.commands}</pre>
        </div>
      </div>
    </div>
  )
}


