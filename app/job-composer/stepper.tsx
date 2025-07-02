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
import { StatusSelectItem } from '@/components/ui/status-select'
import { submitTask } from '@/lib/taskHandlers'

const endpointSchema = z.object({
  endpoint: z.string().min(1, 'Endpoint selection is required'),
  partition: z.string().min(1, 'Partition is required'),
  account: z.string().min(1, 'Account name is required'),
  reservation: z.string().optional(),
})

const taskDetailsSchema = z.object({
  taskName: z.string().min(2, {
    message: 'Task name must be at least 2 characters.'
  }),
  num_of_nodes: z
    .string()
    .regex(/^\d+$/, { message: 'Must be a positive integer' })
    .transform((value) => parseInt(value, 10))
    .optional(),
  time_duration: z.string().optional(),
  log_path: z.string().min(1, 'Log path is required'),
})

const taskConfigSchema = z.object({
  container: z.string().min(1, 'Container selection is required'),
  task: z.string().optional(),
  work_path: z.string().optional(),
})

const reviewSchema = z.object({})

const { Scoped, useStepper } = defineStepper(
  { id: 'endpointinfo', title: 'Endpoint Info', schema: endpointSchema },
  { id: 'taskdetails', title: 'Task Details', schema: taskDetailsSchema },
  { id: 'taskconfig', title: 'Task Config', schema: taskConfigSchema },
  { id: 'review', title: 'Review', schema: reviewSchema }
)

type FormData = z.infer<typeof endpointSchema> &
  z.infer<typeof taskDetailsSchema> &
  z.infer<typeof taskConfigSchema>

type EndpointFormValues = z.infer<typeof endpointSchema>
type TaskDetailsFormValues = z.infer<typeof taskDetailsSchema>
type TaskConfigFormValues = z.infer<typeof taskConfigSchema>

type FullFormValues = EndpointFormValues &
  TaskDetailsFormValues &
  TaskConfigFormValues

export function JobComposerStepper() {
  const [formData, setFormData] = useState<Partial<FormData>>({})
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [endpoints, setEndpoints] = useState<
    { endpoint_uuid: string; endpoint_name: string; endpoint_status: string }[]
  >([])
  const [partitions, setPartitions] = useState<string[]>([])
  const [partitionsCache, setPartitionsCache] = useState<{ [key: string]: string[] }>({})
  const [isLoadingPartitions, setIsLoadingPartitions] = useState(false)
  const [accounts, setAccounts] = useState<string[]>([])
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false)
  const [containers, setContainers] = useState<{ [key: string]: any }>({})
  const [isLoadingContainers, setIsLoadingContainers] = useState(false)
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

  const endpointValue = form.watch('endpoint')
  const { control, register } = form

  const handleStepSubmit = (stepData: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...stepData }))
  }

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
        console.log('data response from fetchBuildLogs:', data)
        
        if (data.log_task_id) {
            currentLogTaskIdRef.current = data.log_task_id
        }
        
        const logElement = document.getElementById('stdoutLogs')
        const statusElement = document.getElementById('taskStdoutPollingStatus')
        
        if (logElement && statusElement) {
            logElement.textContent = data.log_content || 'Waiting for logs...'
            statusElement.textContent = `Stdout status: ${data.status}`
            
            return data.status === 'completed' || data.status === 'failed' || data.status === 'error'
        }
    } catch (error) {
        console.error('Error fetching task stdout logs:', error)
        const statusElement = document.getElementById('taskStdoutPollingStatus')
        if (statusElement) {
            statusElement.textContent = 'Error fetching task stdout logs'
        }
        return true
    }
    return false
  }, [])

  const startPollingStdout = useCallback((endpoint_id: string, log_path: string, build_task_id: string) => {
    if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
    }

    currentEndpointRef.current = endpoint_id
    currentLogPathRef.current = log_path
    currentTaskIdRef.current = build_task_id
    currentLogTaskIdRef.current = null

    setIsPolling(true)
    
    fetchBuildLogs(endpoint_id, log_path, build_task_id)

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
        const stderrStatusElement = document.getElementById('taskStderrPollingStatus')
        
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
    const logElement = document.getElementById('stdoutLogs')
    const stdoutStatusElement = document.getElementById('taskStdoutPollingStatus')
    const stderrLogElement = document.getElementById('stderrLogs')
    const stderrStatusElement = document.getElementById('taskStderrPollingStatus')
    
    if (logElement) {
        logElement.textContent = 'Waiting for task to start...'
    }
    if (stdoutStatusElement) {
        stdoutStatusElement.textContent = 'Preparing stdout logs...'
    }
    if (stderrLogElement) {
        stderrLogElement.textContent = 'Waiting for stderr logs...'
    }
    if (stderrStatusElement) {
        stderrStatusElement.textContent = 'Preparing stderr logs...'
    }

    try {
      const response = await submitTask({
        taskName: data.taskName,
        endpoint: data.endpoint,
        partition: data.partition,
        account: data.account,
        reservation: data.reservation,
        log_path: data.log_path,
        num_of_nodes: data.num_of_nodes,
        task: data.task,
        container: data.container,
        work_path: data.work_path,
        time_duration: data.time_duration
      })

      if (response !== null) {
        console.log('Task submitted successfully!', response)
        toast({
          title: 'Success',
          description: 'Task submitted successfully! Fetching logs...',
          className: 'bg-green-500 text-white'
        })

        const task_id = response.task_id
        const stdoutLogPath = `${data.log_path}${data.log_path!.endsWith('/') ? '' : '/'}${data.taskName}.stdout`
        const stderrLogPath = `${data.log_path}${data.log_path!.endsWith('/') ? '' : '/'}${data.taskName}.stderr`
        console.log('Task stdoutLogPath:', stdoutLogPath)
        console.log('Task stderrLogPath:', stderrLogPath)
        startPollingStdout(data.endpoint!, stdoutLogPath, task_id)
        startPollingStderr(data.endpoint!, stderrLogPath, task_id)
      }
    } catch (error) {
      console.error('Error triggering task:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit task. Please try again.',
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
        const response = await fetch('/api/list_all_endpoints')
        const data = await response.json()
        setEndpoints(data)
      } catch (error) {
        console.error('Error fetching endpoints:', error)
      }
    }
    fetchEndpoints()
  }, [])

  useEffect(() => {
    if (endpointValue) {
      if (partitionsCache[endpointValue]) {
        setPartitions(partitionsCache[endpointValue])
      } else {
        const fetchPartitions = async () => {
          setIsLoadingPartitions(true)
          try {
            const response = await fetch('/api/list_partitions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ endpoint: endpointValue }),
            })
            const data = await response.json()
            setPartitions(data)
            setPartitionsCache((prevCache) => ({
              ...prevCache,
              [endpointValue]: data,
            }))
          } catch (error) {
            console.error('Error fetching partitions:', error)
          } finally {
            setIsLoadingPartitions(false)
          }
        }
        fetchPartitions()
      }
    } else {
      setPartitions([])
    }
  }, [endpointValue])

  useEffect(() => {
    if (endpoints && endpointValue) {
      const fetchAccounts = async () => {
        setIsLoadingAccounts(true)
        try {
          const response = await fetch('/api/list_accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: endpointValue }),
          })
          const data = await response.json()
          setAccounts(data)
        } catch (error) {
          console.error('Error fetching accounts:', error)
        } finally {
          setIsLoadingAccounts(false)
        }
      }
      fetchAccounts()
    }
  }, [endpointValue])

  useEffect(() => {
    async function fetchContainers() {
      setIsLoadingContainers(true)
      try {
        const response = await fetch('/api/get_containers')
        const data = await response.json()
        setContainers(data)
      } catch (error) {
        console.error('Error fetching containers:', error)
      } finally {
        setIsLoadingContainers(false)
      }
    }
    fetchContainers()
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
      if (pollStderrIntervalRef.current) {
        clearInterval(pollStderrIntervalRef.current)
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
        partitions={partitions}
        isLoadingPartitions={isLoadingPartitions}
        accounts={accounts}
        isLoadingAccounts={isLoadingAccounts}
        containers={containers}
        isLoadingContainers={isLoadingContainers}
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
  partitions,
  isLoadingPartitions,
  accounts,
  isLoadingAccounts,
  containers,
  isLoadingContainers,
  isSubmitted
}: {
  form: UseFormReturn<FormData>
  formData: Partial<FormData>
  onStepSubmit: (data: Partial<FormData>) => void
  onFinalSubmit: (data: FormData) => void
  isLoading: boolean
  control: Control<FormData>
  endpoints: { endpoint_uuid: string; endpoint_name: string; endpoint_status: string }[]
  endpointValue: string
  partitions: string[]
  isLoadingPartitions: boolean
  accounts: string[]
  isLoadingAccounts: boolean
  containers: { [key: string]: any }
  isLoadingContainers: boolean
  isSubmitted: boolean
}) {
  const { current, next, prev, isFirst, isLast } = useStepper()

  const onSubmit = (values: z.infer<typeof current.schema>) => {
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
            <EndpointStep 
              control={control} 
              endpoints={endpoints} 
              endpointValue={endpointValue}
              partitions={partitions}
              isLoadingPartitions={isLoadingPartitions}
              accounts={accounts}
              isLoadingAccounts={isLoadingAccounts}
            />
          )}
          {current.id === 'jobdetails' && <JobDetailsStep />}
          {current.id === 'taskconfig' && (
            <TaskConfigStep 
              containers={containers}
              isLoadingContainers={isLoadingContainers}
            />
          )}
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
                    Submitting...
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
          className={`flex flex-col items-center cursor-pointer ${
            index <= stepper.all.indexOf(stepper.current)
              ? 'text-primary'
              : 'text-muted-foreground'
          }`}
          onClick={() => stepper.goTo(step.id)}
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

function EndpointStep({ 
  control, 
  endpoints, 
  endpointValue,
  partitions,
  isLoadingPartitions,
  accounts,
  isLoadingAccounts
}: { 
  control: Control<FormData>
  endpoints: { endpoint_uuid: string; endpoint_name: string; endpoint_status: string }[]
  endpointValue: string
  partitions: string[]
  isLoadingPartitions: boolean
  accounts: string[]
  isLoadingAccounts: boolean
}) {
  const {
    register,
    formState: { errors },
    setValue,
    getValues
  } = useFormContext<EndpointFormValues>()
  const [accountInputValue, setAccountInputValue] = useState('')
  const [selectedAccount, setSelectedAccount] = useState('')

  useEffect(() => {
    const reservation = getValues('reservation')
    if (reservation) {
      setValue('reservation', reservation)
    }
  }, [getValues, setValue])

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-4">Select Endpoint</h2>
          <FormField
            control={control}
            name="endpoint"
            render={({ field }) => (
              <FormItem className="w-full md:w-[60%]">
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
                        <StatusSelectItem
                          key={endpoint.endpoint_uuid}
                          value={endpoint.endpoint_uuid}
                          disabled={endpoint.endpoint_status !== "online"}
                          status={endpoint.endpoint_status === "online" ? "online" : "offline"}
                        >
                          {endpoint.endpoint_name} {endpoint.endpoint_status !== "online" && "(offline)"}
                        </StatusSelectItem>
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

        <div>
          <h2 className="text-2xl font-bold mb-4">Select Partition</h2>
          <FormField
            control={control}
            name="partition"
            render={({ field }) => (
              <FormItem className="w-full md:w-[60%]">
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

        <div>
          <h2 className="text-2xl font-bold mb-4">HPC Account Name</h2>
          <FormField
            control={control}
            name="account"
            render={({ field }) => (
              <FormItem className="w-full md:w-[80%]">
                <FormLabel>Account</FormLabel>
                <div className="flex items-center gap-2">
                  <Select
                    onValueChange={(value) => {
                      setSelectedAccount(value)
                      setAccountInputValue('')
                      setValue('account', value)
                      field.onChange(value)
                    }}
                    value={selectedAccount}
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
                  <Input
                    id="accountInput"
                    placeholder="Or enter account name"
                    value={accountInputValue}
                    onChange={(e) => {
                      const value = e.target.value
                      setAccountInputValue(value)
                      setSelectedAccount('')
                      setValue('account', value, { shouldValidate: true, shouldDirty: true })
                      field.onChange(value)
                    }}
                    className="ml-2 w-full md:w-[60%]"
                  />
                </div>
                <FormDescription>
                  Select your account.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Reservation</h2>
          <FormField
            control={control}
            name="reservation"
            render={({ field }) => (
              <FormItem className="w-full md:w-[80%]">
                <FormLabel>Reservation</FormLabel>
                <Input
                  placeholder="Optional reservation"
                  {...register('reservation')}
                  className="w-full"
                />
                <FormDescription>
                  Optional reservation for the job.
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

function JobDetailsStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<JobDetailsFormValues>()
  
  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-4">Task Name</h2>
          <FormField
            name="taskName"
            render={({ field }) => (
              <FormItem className="w-full md:w-[60%]">
                <FormLabel>Task Name</FormLabel>
                <Input placeholder="Enter task name" {...register('taskName')} />
                <FormDescription>
                  Provide a name for the task.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Number of Nodes</h2>
          <FormField
            name="num_of_nodes"
            render={({ field }) => (
              <FormItem className="w-full md:w-[60%]">
                <FormLabel>Number of Nodes</FormLabel>
                <Input
                  placeholder="1"
                  {...register('num_of_nodes')}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Time Duration</h2>
          <FormField
            name="time_duration"
            render={({ field }) => (
              <FormItem className="w-full md:w-[60%]">
                <FormLabel>Time Duration (HH:MM:SS)</FormLabel>
                <Input
                  placeholder="01:00:00"
                  {...register('time_duration')}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Log Path</h2>
          <FormField
            name="log_path"
            render={({ field }) => (
              <FormItem className="w-full md:w-[60%]">
                <FormLabel>Log Path</FormLabel>
                <Input placeholder="Log Path" {...register('log_path')} />
                <FormDescription>
                  Path where log files will be stored.
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

function TaskConfigStep({ containers, isLoadingContainers }: { 
  containers: { [key: string]: any }
  isLoadingContainers: boolean
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TaskConfigFormValues>()

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-4">Container Selection</h2>
          <FormField
            name="container"
            render={({ field }) => (
              <FormItem className="w-full md:w-[60%]">
                <FormLabel>Container</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoadingContainers}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingContainers ? "Loading..." : "Select container"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.keys(containers).length > 0 ? (
                      Object.keys(containers).map((key) => (
                        <SelectItem
                          key={key}
                          value={key}
                        >
                          {key}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No containers available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select a container from the list.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Task Commands</h2>
          <FormField
            name="task"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Task</FormLabel>
                <Textarea 
                  placeholder="Task details" 
                  {...register('task')} 
                  className="min-h-[200px] w-full"
                />
                <FormDescription>
                  Enter the commands or script to execute.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Working Directory</h2>
          <FormField
            name="work_path"
            render={({ field }) => (
              <FormItem className="w-full md:w-[60%]">
                <FormLabel>Working Directory</FormLabel>
                <Input 
                  placeholder="Working directory path" 
                  {...register('work_path')} 
                />
                <FormDescription>
                  Optional: Specify the working directory for the task.
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
        <h3 className="text-lg font-medium mb-2">Endpoint Configuration:</h3>
        <div className="card-muted p-4 rounded-md">
          <p><strong>Endpoint:</strong> {values.endpoint}</p>
          <p><strong>Partition:</strong> {values.partition}</p>
          <p><strong>HPC Account:</strong> {values.account}</p>
          <p><strong>Reservation:</strong> {values.reservation || 'None'}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Task Details:</h3>
        <div className="card-muted p-4 rounded-md">
          <p><strong>Task Name:</strong> {values.taskName}</p>
          <p><strong>Number of Nodes:</strong> {values.num_of_nodes || '1'}</p>
          <p><strong>Time Duration:</strong> {values.time_duration || 'Not specified'}</p>
          <p><strong>Log Path:</strong> {values.log_path}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Task Configuration:</h3>
        <div className="card-muted p-4 rounded-md">
          <p><strong>Container:</strong> {values.container}</p>
          <p><strong>Working Directory:</strong> {values.work_path || 'Not specified'}</p>
          <p><strong>Task Commands:</strong></p>
          <div className="font-mono whitespace-pre-wrap bg-background p-2 rounded">
            {values.task || 'No task commands specified'}
          </div>
        </div>
      </div>
    </div>
  )
} 