'use client';

import { Package, Settings, Terminal } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { BuilderFormData } from '@/app/images/types';

interface BuildStepProps {
  formData: Partial<BuilderFormData>;
  onUpdate: (data: Partial<BuilderFormData>) => void;
}

const dependenciesPlaceholder = `# Example dependencies
apt-get update && apt-get install -y \\
    python3 \\
    python3-pip \\
    gcc \\
    make
pip3 install numpy scipy matplotlib`;

const environmentVariablesPlaceholder = `# Example environment variables
export PATH="/opt/myapp/bin:$PATH"
export PYTHONPATH="/opt/myapp/lib:$PYTHONPATH"
export OMP_NUM_THREADS=4`;

const buildCommandsPlaceholder = `# Example build commands
cd /opt
git clone https://github.com/myorg/myapp.git
cd myapp
make install

# Or copy local files
# COPY ./myapp /opt/myapp
# RUN chmod +x /opt/myapp/run.sh`;

export function BuildStep({ formData, onUpdate }: BuildStepProps) {
  return (
    <div className="space-y-8">
      {/* Dependencies */}
      <div className="space-y-4">
        <div className="mb-3 flex items-center gap-2">
          <Package className="text-primary h-5 w-5" />
          <h4 className="text-lg font-semibold">Dependencies (Optional)</h4>
        </div>

        <Textarea
          placeholder={dependenciesPlaceholder}
          value={formData.dependencies || ''}
          onChange={(e) => onUpdate({ dependencies: e.target.value })}
          className="min-h-[150px] font-mono text-sm"
        />
        <p className="text-muted-foreground text-sm">
          System packages and dependencies to install (shell commands)
        </p>
      </div>

      {/* Environment Variables */}
      <div className="space-y-4">
        <div className="mb-3 flex items-center gap-2">
          <Settings className="text-primary h-5 w-5" />
          <h4 className="text-lg font-semibold">
            Environment Variables (Optional)
          </h4>
        </div>

        <Textarea
          placeholder={environmentVariablesPlaceholder}
          value={formData.environment || ''}
          onChange={(e) => onUpdate({ environment: e.target.value })}
          className="min-h-[120px] font-mono text-sm"
        />
        <p className="text-muted-foreground text-sm">
          Environment variables to set during the build process
        </p>
      </div>

      {/* Build Commands */}
      <div className="space-y-4">
        <div className="mb-3 flex items-center gap-2">
          <Terminal className="text-primary h-5 w-5" />
          <h4 className="text-lg font-semibold">Build Commands (Optional)</h4>
        </div>

        <Textarea
          placeholder={buildCommandsPlaceholder}
          value={formData.commands || ''}
          onChange={(e) => onUpdate({ commands: e.target.value })}
          className="min-h-[100px] font-mono text-sm"
        />
        <p className="text-muted-foreground text-sm">
          Commands to build and configure your application inside the container
        </p>
      </div>
    </div>
  );
}
