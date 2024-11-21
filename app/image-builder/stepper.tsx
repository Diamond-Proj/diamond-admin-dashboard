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

// const endpointSchema = z.object({
//   endpoint: z.string().min(1, 'Endpoint selection is required'),
//   // endpoint_uuid: z.string().min(1, 'Endpoint selection is required'),
//   // endpoint_name: z.string().min(1, 'Endpoint name is required')
// })

const containerNameSchema = z.object({
  containerName: z.string().min(1, 'Container name is required')
})

const baseImageSchema = z.object({
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

const endpointSchema = z.object({
  endpoint: z.string().min(1, 'Endpoint selection is required'),
  name: z.string().min(1, 'Container name is required'),
  imageLocation: z.string().min(1, 'Image location is required') // New validation rule
})

const { Scoped, useStepper } = defineStepper(
  { id: 'endpoint', title: 'Select Endpoint', schema: endpointSchema },
  { id: 'base-image', title: 'Base Image', schema: baseImageSchema },
  { id: 'dependencies', title: 'Dependencies', schema: dependenciesSchema },
  { id: 'environment', title: 'Environment', schema: environmentSchema },
  { id: 'commands', title: 'Build Commands', schema: commandsSchema },
  { id: 'review', title: 'Review', schema: reviewSchema }
)

type FormData = z.infer<typeof endpointSchema> &
  z.infer<typeof containerNameSchema> &
  z.infer<typeof baseImageSchema> &
  z.infer<typeof dependenciesSchema> &
  z.infer<typeof environmentSchema> &
  z.infer<typeof commandsSchema>

type EndpointFormValues = z.infer<typeof endpointSchema>
type ContainerNameFormValues = z.infer<typeof containerNameSchema>
type BaseImageFormValues = z.infer<typeof baseImageSchema>
type DependenciesFormValues = z.infer<typeof dependenciesSchema>
type EnvironmentFormValues = z.infer<typeof environmentSchema>
type CommandsFormValues = z.infer<typeof commandsSchema>

type FullFormValues = EndpointFormValues &
  ContainerNameFormValues &
  BaseImageFormValues &
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
        base_image: data.baseImage,
        dependencies: data.dependencies,
        environment: data.environment,
        location: data.location,
        commands: data.commands,
        image_location: data.imageLocation,
        // name: data.name,  // Uncomment if you want to send a name
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
    fetchEndpoints()
  }, [])

  return (
    <Scoped>
      <StepperContent
        formData={formData}
        onStepSubmit={handleStepSubmit}
        onFinalSubmit={handleFinalSubmit}
        isLoading={isLoading}
        control={control}
        endpoints={endpoints}
      />
    </Scoped>
  )
}

function StepperContent({
  formData,
  onStepSubmit,
  onFinalSubmit,
  isLoading,
  control,
  endpoints
}: {
  formData: Partial<FormData>
  onStepSubmit: (data: Partial<FormData>) => void
  onFinalSubmit: (data: FormData) => void
  isLoading: boolean
  control: Control<FormData>
  endpoints: { endpoint_uuid: string; endpoint_name: string }[]
}) {
  const stepper = useStepper()
  const form = useForm<FormData>({
    resolver: zodResolver(z.object({})),
    defaultValues: formData
  })

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
            endpoint: () => <EndpointStep control={control} endpoints={endpoints} />,
            // 'container-name': () => <ContainerNameStep />,
            'base-image': () => <BaseImageStep />,
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

function ContainerNameStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ContainerNameFormValues>();
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Container Name</h2>
      <label htmlFor={register('containerName').name}>Container Name</label>
      <Input placeholder="myContainer" {...register('containerName')} />
    </div>
  );
}

function BaseImageStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<BaseImageFormValues>();
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Base Image</h2>
      <label htmlFor={register('baseImage').name}>Base Image</label>
      <Input placeholder="e.g., python:3.9-slim" {...register('baseImage')} />
    </div>
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

      <div>
        <h2 className="text-2xl font-bold mb-4">Location</h2>
        <label htmlFor={register('location').name}>Build Location</label>
        <Input 
          placeholder="e.g., /home/user/builds" 
          {...register('location')}
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

function EndpointStep({ control, endpoints }: { control: Control<FormData>, endpoints: { endpoint_uuid: string; endpoint_name: string }[] }) {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext<EndpointFormValues>()

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

      {/* Image Location Text Box */}
      <FormField
        control={control}
        name="imageLocation"
        render={({ field }) => (
          <FormItem className="w-[60%] md:w-[20%] mt-4">
            <FormLabel>Image Location</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter image location"
                {...register("imageLocation")}
              />
            </FormControl>
            <FormDescription>
              Provide the location of the image as a string.
            </FormDescription>
            <FormMessage>{errors.imageLocation?.message}</FormMessage>
          </FormItem>
        )}
      />
    </div>
  )
}
