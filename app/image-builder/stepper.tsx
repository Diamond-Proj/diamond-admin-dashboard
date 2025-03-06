'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  account: z.string().min(1, 'Account name is required')
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
})

const commandsSchema = z.object({
  commands: z.string().min(1, 'At least one build command is required')
})

const reviewSchema = z.object({})


const { Scoped, useStepper } = defineStepper(
  { id: 'endpointinfo', title: 'Endpoint Info', schema: endpointSchema },
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
  const [buildLogs, setBuildLogs] = useState<string>('')
  const [stderrLogs, setStderrLogs] = useState<string>('')
  const [endpoints, setEndpoints] = useState<
    { endpoint_uuid: string; endpoint_name: string }[]
  >([])
  const [isPolling, setIsPolling] = useState(false)
  const [isPollingStderr, setIsPollingStderr] = useState(false)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollStderrIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentEndpointRef = useRef<string | null>(null)
  const currentLogPathRef = useRef<string | null>(null)
  const currentStderrLogPathRef = useRef<string | null>(null)
  const currentTaskIdRef = useRef<string | null>(null)
  const currentLogTaskIdRef = useRef<string | null>(null)
  const currentStderrLogTaskIdRef = useRef<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

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

  // const onSubmit = (values: z.infer<typeof stepper))

  const fetchBuildLogs = useCallback(async (endpoint_id: string, log_path: string, build_task_id?: string, log_task_id?: string) => {
    try {
        const url = new URL('/api/get_build_log', window.location.origin)
        url.searchParams.append('endpoint_id', endpoint_id)
        url.searchParams.append('log_path', log_path)
        if (build_task_id) {
            url.searchParams.append('task_id', build_task_id)
        }
        if (log_task_id) {
            url.searchParams.append('log_task_id', log_task_id)
        }
        
        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch build logs')
        
        const data = await response.json()
        
        // Store the new log task ID for next poll
        if (data.log_task_id) {
            currentLogTaskIdRef.current = data.log_task_id
        }
        
        // Update UI based on status
        const logElement = document.getElementById('buildLogs')
        const statusElement = document.getElementById('pollingStatus')
        
        if (logElement && statusElement) {
            logElement.textContent = data.log_content || 'Waiting for logs...'
            statusElement.textContent = `Build status: ${data.status}`
            
            // Return true to stop polling if build is complete or failed
            return data.status === 'completed' || data.status === 'failed' || data.status === 'error'
        }
    } catch (error) {
        console.error('Error fetching build logs:', error)
        const statusElement = document.getElementById('pollingStatus')
        if (statusElement) {
            statusElement.textContent = 'Error fetching build logs'
        }
        return true // Stop polling on error
    }
    return false
  }, [])

  const startPolling = useCallback((endpoint_id: string, log_path: string, build_task_id: string) => {
    if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
    }

    currentEndpointRef.current = endpoint_id
    currentLogPathRef.current = log_path
    currentTaskIdRef.current = build_task_id
    currentLogTaskIdRef.current = null  // Reset log task ID

    setIsPolling(true)
    
    // Initial fetch
    fetchBuildLogs(endpoint_id, log_path, build_task_id)

    // Start polling
    pollIntervalRef.current = setInterval(async () => {
        if (currentEndpointRef.current && currentLogPathRef.current && currentTaskIdRef.current) {
            const shouldStop = await fetchBuildLogs(
                currentEndpointRef.current,
                currentLogPathRef.current,
                currentTaskIdRef.current,
                currentLogTaskIdRef.current as string
            )
            
            if (shouldStop) {
                setIsPolling(false)
                if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current)
                }
            }
        }
    }, 5000)

    // Safety timeout after 5 minutes
    setTimeout(() => {
        setIsPolling(false)
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
        }
    }, 300000)
  }, [fetchBuildLogs])

  const fetchStderrLogs = useCallback(async (endpoint_id: string, log_path: string, build_task_id?: string, log_task_id?: string) => {
    try {
        const url = new URL('/api/get_build_log', window.location.origin)
        url.searchParams.append('endpoint_id', endpoint_id)
        url.searchParams.append('log_path', log_path)
        if (build_task_id) {
            url.searchParams.append('task_id', build_task_id)
        }
        if (log_task_id) {
            url.searchParams.append('log_task_id', log_task_id)
        }
        
        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch stderr logs')
        
        const data = await response.json()
        
        if (data.log_task_id) {
            currentStderrLogTaskIdRef.current = data.log_task_id
        }
        
        const stderrLogElement = document.getElementById('stderrLogs')
        const stderrStatusElement = document.getElementById('stderrPollingStatus')
        
        if (stderrLogElement && stderrStatusElement) {
            stderrLogElement.textContent = data.log_content || 'Waiting for stderr logs...'
            stderrStatusElement.textContent = `Stderr status: ${data.status}`
            
            return data.status === 'completed' || data.status === 'failed' || data.status === 'error'
        }
    } catch (error) {
        console.error('Error fetching stderr logs:', error)
        const stderrStatusElement = document.getElementById('stderrPollingStatus')
        if (stderrStatusElement) {
            stderrStatusElement.textContent = 'Error fetching stderr logs'
        }
        return true
    }
    return false
  }, [])

  const startPollingStderr = useCallback((endpoint_id: string, log_path: string, build_task_id: string) => {
    if (pollStderrIntervalRef.current) {
        clearInterval(pollStderrIntervalRef.current)
    }

    currentEndpointRef.current = endpoint_id
    currentStderrLogPathRef.current = log_path
    currentTaskIdRef.current = build_task_id
    currentStderrLogTaskIdRef.current = null

    setIsPollingStderr(true)
    
    fetchStderrLogs(endpoint_id, log_path, build_task_id)

    pollStderrIntervalRef.current = setInterval(async () => {
        if (currentEndpointRef.current && currentStderrLogPathRef.current && currentTaskIdRef.current) {
            const shouldStop = await fetchStderrLogs(
                currentEndpointRef.current,
                currentStderrLogPathRef.current,
                currentTaskIdRef.current,
                currentStderrLogTaskIdRef.current as string
            )
            
            if (shouldStop) {
                setIsPollingStderr(false)
                if (pollStderrIntervalRef.current) {
                    clearInterval(pollStderrIntervalRef.current)
                }
            }
        }
    }, 5000)

    setTimeout(() => {
        setIsPollingStderr(false)
        if (pollStderrIntervalRef.current) {
            clearInterval(pollStderrIntervalRef.current)
        }
    }, 300000)
  }, [fetchStderrLogs])

  const handleFinalSubmit = async (data: FormData) => {
    setIsLoading(true)
    setIsSubmitted(true)
    const logComponents = document.getElementById('logComponents')
    if (logComponents) {
        logComponents.classList.remove('hidden')
    }
    const logElement = document.getElementById('buildLogs')
    const statusElement = document.getElementById('pollingStatus')
    const stderrLogElement = document.getElementById('stderrLogs')
    const stderrStatusElement = document.getElementById('stderrPollingStatus')
    
    if (logElement) {
        logElement.textContent = 'Starting new build...'
    }
    if (statusElement) {
        statusElement.textContent = 'Preparing build...'
    }
    if (stderrLogElement) {
        stderrLogElement.textContent = 'Waiting for stderr logs...'
    }
    if (stderrStatusElement) {
        stderrStatusElement.textContent = 'Preparing stderr logs...'
    }

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
        account: data.account,
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
        const { task_id, container_name } = result
        const logPath = `${data.location}${data.location.endsWith('/') ? '' : '/'}${container_name}_log.stdout`
        const stderrLogPath = `${data.location}${data.location.endsWith('/') ? '' : '/'}${container_name}_log.stderr`
        console.log('logPath:', logPath)
        console.log('stderrLogPath:', stderrLogPath)
        startPolling(data.endpoint, logPath, task_id)
        startPollingStderr(data.endpoint, stderrLogPath, task_id)

        toast({
            title: 'Success',
            description: 'Image build configuration submitted successfully! Fetching build logs...',
            className: 'bg-green-500 text-white'
        })
    } catch (error) {
        console.error('Error submitting data:', error)
        toast({
            title: 'Error',
            description: 'Failed to submit image build configuration. Please try again.',
            variant: 'destructive'
        })
        setIsSubmitted(false)
        const logComponents = document.getElementById('logComponents')
        if (logComponents) {
            logComponents.classList.add('hidden')
        }
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

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
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
        isSubmitted={isSubmitted}
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
  endpointValue,
  isSubmitted
}: {
  form: UseFormReturn<FormData>
  formData: Partial<FormData>
  onStepSubmit: (data: Partial<FormData>) => void
  onFinalSubmit: (data: FormData) => void
  isLoading: boolean
  control: Control<FormData>
  endpoints: { endpoint_uuid: string; endpoint_name: string }[]
  endpointValue: string
  isSubmitted: boolean
}) {
  const { current, next, prev, isFirst, isLast } = useStepper()

  const onSubmit = (values: z.infer<typeof stepper.current.schema>) => {
    onStepSubmit(values)
    if (isLast) {
      onFinalSubmit(form.getValues() as FormData)
    } else {
      next()
    }
  }

  return (
    <div className="card p-6">
      <StepIndicator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {current.id === 'endpointinfo' && (
            <EndpointStep control={control} endpoints={endpoints} endpointValue={endpointValue} />
          )}
          {current.id === 'containerinfo' && <ContainerStep />}
          {current.id === 'dependencies' && <DependenciesStep />}
          {current.id === 'environment' && <EnvironmentStep />}
          {current.id === 'commands' && <CommandsStep />}
          {current.id === 'review' && (
            <ReviewStep 
              onSubmit={() => onFinalSubmit(form.getValues() as FormData)} 
              isLoading={isLoading}
              isSubmitted={isSubmitted}
            />
          )}

          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prev}
              disabled={isFirst || isLoading}
            >
              Previous
            </Button>
            {!isLast ? (
              <Button type="submit" disabled={isLoading}>
                Next
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isLoading || isSubmitted}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Building...
                  </>
                ) : isSubmitted ? (
                  "Submitted"
                ) : (
                  "Submit"
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
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
  const [accounts, setAccounts] = useState<string[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  useEffect(() => {
    if (endpoints && endpointValue) {
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

  useEffect(() => {
    if (endpoints && endpointValue) {
      const fetchAccounts = async () => {
        setIsLoadingAccounts(true);
        try {
          const response = await fetch('/api/list_accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: endpointValue }),
          });
          const data = await response.json();
          // Transform data to extract account and project info
          const accountsWithProjects = data.map((line: string) => {
            const matches = line.match(/^(\S+)\s+\d+\s+\d+\s+(.+)$/);
            if (matches) {
              return {
                account: matches[1],
                project: matches[2].trim()
              };
            }
            return null;
          }).filter(Boolean);
          
          setAccounts(accountsWithProjects.map((a: { account: string }) => a.account));
        } catch (error) {
          console.error('Error fetching accounts:', error);
        } finally {
          setIsLoadingAccounts(false);
        }
      };
      fetchAccounts();
    }
  }, [endpointValue]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {/* Endpoint Selection */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Select Endpoint</h2>
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
        </div>
        {/* Partition Selection Dropdown */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Select Partition</h2>
          <FormField
            control={control}
            name="partition"
            render={({ field }) => (
              <FormItem className="w-[60%] md:w-[20%]">
            <FormLabel>Partition</FormLabel>
            <div className="flex items-center gap-2">
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
              {isLoadingPartitions && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              )}
            </div>
              <FormDescription>
                Select a partition from the list.
              </FormDescription>
                <FormMessage />
              </FormItem>
            )}
            />
          </div>
        {/* Account Selection Dropdown */}
        <div>
          <h2 className="text-2xl font-bold mb-4">HPC Account Name</h2>
          <FormField
          control={control}
          name="account"
          render={({ field }) => (
            <FormItem className="w-[60%] md:w-[20%]">
              <FormLabel>Account</FormLabel>
              <div className="flex items-center gap-2">
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoadingAccounts}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingAccounts ? "Loading..." : "Select account"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem
                        key={account}
                        value={account}
                      >
                        {account}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isLoadingAccounts && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
              </div>
              <FormDescription>
                Select your account.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
      </div>
    </>
  )
}

function ContainerStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ContainerFormValues>();
  
  return (
    <>
      <div className="grid grid-cols-1 gap-4">
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
          <h2 className="text-2xl font-bold mb-4">Base Image</h2>
          <label htmlFor={register('baseImage').name}>Base Image</label>
          <Input placeholder="python:3.9-slim" {...register('baseImage')} />
        </div>
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

function ReviewStep({ onSubmit, isLoading, isSubmitted }: { 
  onSubmit: (values: FullFormValues) => void, 
  isLoading: boolean,
  isSubmitted: boolean 
}) {
  const { getValues } = useFormContext<FullFormValues>()
  const values = getValues()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Selected Endpoint:</h3>
        <div className="card-muted p-4 rounded-md">
          <p><strong>Endpoint:</strong> {values.endpoint}</p>
          <p><strong>Partition:</strong> {values.partition}</p>
          <p><strong>HPC Account:</strong> {values.account}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Container name:</h3>
        <div className="card-muted p-4 rounded-md">
          <p>{values.containerName}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Base Image:</h3>
        <div className="card-muted p-4 rounded-md">
          <p>{values.baseImage}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Location:</h3>
        <div className="card-muted p-4 rounded-md">
          <p>{values.location}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Dependencies:</h3>
        <div className="card-muted p-4 rounded-md font-mono whitespace-pre-wrap">
          {values.dependencies || 'No dependencies specified'}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Environment:</h3>
        <div className="card-muted p-4 rounded-md font-mono whitespace-pre-wrap">
          {values.environment || 'No environment variables specified'}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Build Commands:</h3>
        <div className="card-muted p-4 rounded-md font-mono whitespace-pre-wrap">
          {values.commands}
        </div>
      </div>
    </div>
  )
}


