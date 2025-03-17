import { toast } from '@/components/ui/use-toast';

export async function updateUserProfile(data: any) {
  try {
    const response = await fetch(`/api/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const responseData = await response.json();
    console.log('  responseData:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
  }
}


export async function submitTask(data: any) {
  try {
    const response = await fetch(`/api/submit_task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const responseData = await response.json();
    console.log('submitTask responseData:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error in task submitting:', error);
  }
}

export async function registerContainer(data: {
  endpoint: string;
  base_image: string;
  location: string;
  name: string;
  description: string;
}): Promise<any> {
  try {
    const response = await fetch('/api/register_container', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    if (!response.ok) {
      console.log('response:', response);
      throw new Error('Network response was not ok');
    }
    const responseData = await response.json();
    console.log('register container response: ', responseData);
    toast({
      title: 'Success',
      description: responseData.message
    });
    return responseData;
  } catch (error) {
    console.error('Error in registerContainer:', error);
  }
}
