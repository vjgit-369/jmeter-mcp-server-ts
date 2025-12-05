import { execFile, spawn } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import type {
  JMeterConfig,
  TestExecutionOptions,
  DistributedTestConfig,
  PluginInfo
} from './types.js';

const execFileAsync = promisify(execFile);

/**
 * JMeter executor class for running tests and managing JMeter operations
 */
export class JMeterExecutor {
  private config: JMeterConfig;

  constructor(config: JMeterConfig) {
    this.config = config;
  }

  /**
   * Get the JMeter binary path based on the platform
   */
  private getJMeterBinary(): string {
    if (this.config.jmeterBin) {
      return this.config.jmeterBin;
    }
    
    const isWindows = os.platform() === 'win32';
    const binName = isWindows ? 'jmeter.bat' : 'jmeter';
    return path.join(this.config.jmeterHome, 'bin', binName);
  }

  /**
   * Validate that JMeter is installed and accessible
   */
  async validateJMeter(): Promise<{ valid: boolean; version?: string; error?: string }> {
    try {
      const binary = this.getJMeterBinary();
      
      // Check if binary exists
      await fs.access(binary, fs.constants.X_OK);
      
      // Get version
      const { stdout } = await execFileAsync(binary, ['--version']);
      const versionMatch = stdout.match(/Apache JMeter (\d+\.\d+(?:\.\d+)?)/);
      const version = versionMatch ? versionMatch[1] : 'unknown';
      
      return { valid: true, version };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error validating JMeter'
      };
    }
  }

  /**
   * Execute JMeter test in non-GUI mode
   */
  async executeTest(options: TestExecutionOptions): Promise<{
    success: boolean;
    stdout: string;
    stderr: string;
    exitCode: number;
    resultsFile: string;
  }> {
    const binary = this.getJMeterBinary();
    const args: string[] = ['-n', '-t', options.testPlan, '-l', options.resultsFile];

    // Add log file if specified
    if (options.logFile) {
      args.push('-j', options.logFile);
    }

    // Add report directory if specified
    if (options.reportDir) {
      // Create report directory if it doesn't exist
      await fs.mkdir(options.reportDir, { recursive: true });
      args.push('-e', '-o', options.reportDir);
    }

    // Add properties
    if (options.properties) {
      for (const [key, value] of Object.entries(options.properties)) {
        args.push('-J', `${key}=${value}`);
      }
    }

    // Add system properties
    if (options.systemProperties) {
      for (const [key, value] of Object.entries(options.systemProperties)) {
        args.push('-D', `${key}=${value}`);
      }
    }

    // Add JMeter properties file
    if (options.jmeterProperties) {
      for (const propFile of options.jmeterProperties) {
        args.push('-q', propFile);
      }
    }

    // Add remote hosts for distributed testing
    if (options.remoteHosts && options.remoteHosts.length > 0) {
      args.push('-R', options.remoteHosts.join(','));
    }

    // Add proxy settings
    if (options.proxyHost) {
      args.push('-H', options.proxyHost);
      if (options.proxyPort) {
        args.push('-P', options.proxyPort.toString());
      }
      if (options.nonProxyHosts) {
        args.push('-N', options.nonProxyHosts);
      }
    }

    return new Promise((resolve) => {
      const process = spawn(binary, args);
      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        resolve({
          success: code === 0,
          stdout,
          stderr,
          exitCode: code || 0,
          resultsFile: options.resultsFile
        });
      });

      process.on('error', (error) => {
        resolve({
          success: false,
          stdout,
          stderr: stderr + '\n' + error.message,
          exitCode: 1,
          resultsFile: options.resultsFile
        });
      });
    });
  }

  /**
   * Launch JMeter GUI mode
   */
  async launchGui(testPlan?: string): Promise<{
    success: boolean;
    message: string;
    pid?: number;
  }> {
    try {
      const binary = this.getJMeterBinary();
      const args: string[] = [];

      if (testPlan) {
        args.push('-t', testPlan);
      }

      const process = spawn(binary, args, {
        detached: true,
        stdio: 'ignore'
      });

      process.unref();

      return {
        success: true,
        message: `JMeter GUI launched${testPlan ? ` with test plan: ${testPlan}` : ''}`,
        pid: process.pid
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to launch JMeter GUI'
      };
    }
  }

  /**
   * Generate HTML report from existing results file
   */
  async generateReport(resultsFile: string, outputDir: string): Promise<{
    success: boolean;
    message: string;
    reportPath?: string;
  }> {
    try {
      const binary = this.getJMeterBinary();

      // Check if results file exists
      await fs.access(resultsFile);

      // Create output directory
      await fs.mkdir(outputDir, { recursive: true });

      // Check if output directory is empty
      const files = await fs.readdir(outputDir);
      if (files.length > 0) {
        return {
          success: false,
          message: `Output directory ${outputDir} is not empty. Please use an empty directory.`
        };
      }

      const args = ['-g', resultsFile, '-o', outputDir];

      await execFileAsync(binary, args);

      const reportIndexPath = path.join(outputDir, 'index.html');
      
      return {
        success: true,
        message: 'Report generated successfully',
        reportPath: reportIndexPath
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate report'
      };
    }
  }

  /**
   * Execute distributed test
   */
  async executeDistributedTest(config: DistributedTestConfig): Promise<{
    success: boolean;
    stdout: string;
    stderr: string;
    exitCode: number;
  }> {
    const binary = this.getJMeterBinary();
    const args: string[] = [
      '-n',
      '-t', config.testPlan,
      '-l', config.resultsFile,
      '-R', config.remoteHosts.join(',')
    ];

    if (config.startRemoteServers) {
      args.push('-r');
    }

    if (config.stopRemoteServers) {
      args.push('-X');
    }

    return new Promise((resolve) => {
      const process = spawn(binary, args);
      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        resolve({
          success: code === 0,
          stdout,
          stderr,
          exitCode: code || 0
        });
      });
    });
  }

  /**
   * List installed JMeter plugins
   */
  async listPlugins(): Promise<PluginInfo[]> {
    try {
      const pluginsDir = path.join(this.config.jmeterHome, 'lib', 'ext');
      const files = await fs.readdir(pluginsDir);
      
      const plugins: PluginInfo[] = files
        .filter(file => file.endsWith('.jar'))
        .map(file => {
          // Extract plugin name and version from filename
          const match = file.match(/^(.+?)-(\d+\.\d+(?:\.\d+)?(?:-\w+)?)\.jar$/);
          return {
            name: match ? match[1] : file.replace('.jar', ''),
            version: match ? match[2] : 'unknown',
            description: `JMeter plugin from ${file}`,
            installed: true
          };
        });

      return plugins;
    } catch (error) {
      return [];
    }
  }

  /**
   * Get JMeter properties
   */
  async getProperties(): Promise<Record<string, string>> {
    try {
      const propsFile = path.join(this.config.jmeterHome, 'bin', 'jmeter.properties');
      const content = await fs.readFile(propsFile, 'utf-8');
      
      const properties: Record<string, string> = {};
      const lines = content.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...valueParts] = trimmed.split('=');
          properties[key.trim()] = valueParts.join('=').trim();
        }
      }
      
      return properties;
    } catch (error) {
      return {};
    }
  }

  /**
   * Set JMeter property
   */
  async setProperty(key: string, value: string): Promise<{ success: boolean; message: string }> {
    try {
      const propsFile = path.join(this.config.jmeterHome, 'bin', 'user.properties');
      
      let content = '';
      try {
        content = await fs.readFile(propsFile, 'utf-8');
      } catch {
        // File doesn't exist, create it
        content = '# User-defined JMeter properties\n';
      }

      // Check if property already exists
      const lines = content.split('\n');
      let found = false;
      
      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (trimmed.startsWith(key + '=')) {
          lines[i] = `${key}=${value}`;
          found = true;
          break;
        }
      }

      if (!found) {
        lines.push(`${key}=${value}`);
      }

      await fs.writeFile(propsFile, lines.join('\n'), 'utf-8');

      return {
        success: true,
        message: `Property ${key} set to ${value}`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to set property'
      };
    }
  }
}
