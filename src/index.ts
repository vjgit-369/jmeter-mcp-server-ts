#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { JMeterExecutor } from './executor.js';
import { ResultsAnalyzer } from './analyzer.js';
import { TestPlanBuilder } from './builder.js';
import type { JMeterConfig } from './types.js';

// Environment configuration
const JMETER_HOME = process.env.JMETER_HOME || '';
const JMETER_BIN = process.env.JMETER_BIN || '';

if (!JMETER_HOME) {
  console.error('ERROR: JMETER_HOME environment variable is not set');
  process.exit(1);
}

// Initialize components
const config: JMeterConfig = {
  jmeterHome: JMETER_HOME,
  jmeterBin: JMETER_BIN,
  defaultThreads: 10,
  defaultDuration: 60,
  defaultRampUp: 10
};

const executor = new JMeterExecutor(config);
const analyzer = new ResultsAnalyzer();
const builder = new TestPlanBuilder();

// Define all available tools
const TOOLS: Tool[] = [
  {
    name: 'validate_jmeter',
    description: 'Validate that JMeter is installed and accessible, and get version information',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'execute_jmeter_test',
    description: 'Execute a JMeter test plan in non-GUI mode with comprehensive options',
    inputSchema: {
      type: 'object',
      properties: {
        testPlan: {
          type: 'string',
          description: 'Path to the JMeter test plan (.jmx file)'
        },
        resultsFile: {
          type: 'string',
          description: 'Path where test results will be saved (.jtl file)'
        },
        logFile: {
          type: 'string',
          description: 'Optional path for JMeter log file'
        },
        reportDir: {
          type: 'string',
          description: 'Optional directory to generate HTML report dashboard'
        },
        properties: {
          type: 'object',
          description: 'JMeter properties to set (-J flags)',
          additionalProperties: { type: 'string' }
        },
        systemProperties: {
          type: 'object',
          description: 'System properties to set (-D flags)',
          additionalProperties: { type: 'string' }
        },
        remoteHosts: {
          type: 'array',
          items: { type: 'string' },
          description: 'Remote hosts for distributed testing'
        },
        proxyHost: {
          type: 'string',
          description: 'Proxy server hostname'
        },
        proxyPort: {
          type: 'number',
          description: 'Proxy server port'
        }
      },
      required: ['testPlan', 'resultsFile']
    }
  },
  {
    name: 'launch_jmeter_gui',
    description: 'Launch JMeter in GUI mode for test development',
    inputSchema: {
      type: 'object',
      properties: {
        testPlan: {
          type: 'string',
          description: 'Optional path to test plan to open in GUI'
        }
      },
      required: []
    }
  },
  {
    name: 'generate_html_report',
    description: 'Generate an HTML dashboard report from existing JTL results',
    inputSchema: {
      type: 'object',
      properties: {
        resultsFile: {
          type: 'string',
          description: 'Path to the JTL results file'
        },
        outputDir: {
          type: 'string',
          description: 'Directory where the HTML report will be generated'
        }
      },
      required: ['resultsFile', 'outputDir']
    }
  },
  {
    name: 'analyze_test_results',
    description: 'Analyze JMeter test results and provide comprehensive performance metrics, bottleneck identification, and recommendations',
    inputSchema: {
      type: 'object',
      properties: {
        resultsFile: {
          type: 'string',
          description: 'Path to the JTL results file to analyze'
        }
      },
      required: ['resultsFile']
    }
  },
  {
    name: 'create_http_test_plan',
    description: 'Create a new HTTP test plan programmatically with customizable options',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the test plan'
        },
        outputPath: {
          type: 'string',
          description: 'Path where the test plan will be saved (.jmx file)'
        },
        threads: {
          type: 'number',
          description: 'Number of concurrent threads (virtual users)',
          default: 10
        },
        rampUp: {
          type: 'number',
          description: 'Ramp-up period in seconds',
          default: 10
        },
        duration: {
          type: 'number',
          description: 'Test duration in seconds',
          default: 60
        },
        endpoint: {
          type: 'string',
          description: 'HTTP endpoint URL to test'
        },
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
          description: 'HTTP method',
          default: 'GET'
        },
        headers: {
          type: 'object',
          description: 'HTTP headers as key-value pairs',
          additionalProperties: { type: 'string' }
        },
        body: {
          type: 'string',
          description: 'Request body for POST/PUT/PATCH requests'
        }
      },
      required: ['name', 'outputPath', 'endpoint']
    }
  },
  {
    name: 'execute_distributed_test',
    description: 'Execute a distributed test across multiple remote JMeter servers',
    inputSchema: {
      type: 'object',
      properties: {
        testPlan: {
          type: 'string',
          description: 'Path to the test plan'
        },
        resultsFile: {
          type: 'string',
          description: 'Path for results file'
        },
        remoteHosts: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of remote host addresses (e.g., ["192.168.1.10", "192.168.1.11"])'
        },
        startRemoteServers: {
          type: 'boolean',
          description: 'Start all remote servers before test',
          default: true
        },
        stopRemoteServers: {
          type: 'boolean',
          description: 'Stop all remote servers after test',
          default: true
        }
      },
      required: ['testPlan', 'resultsFile', 'remoteHosts']
    }
  },
  {
    name: 'list_jmeter_plugins',
    description: 'List all installed JMeter plugins',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_jmeter_properties',
    description: 'Get JMeter properties from jmeter.properties file',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'set_jmeter_property',
    description: 'Set a JMeter property in user.properties file',
    inputSchema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'Property key'
        },
        value: {
          type: 'string',
          description: 'Property value'
        }
      },
      required: ['key', 'value']
    }
  }
];

// Create MCP server
const server = new Server(
  {
    name: 'jmeter-mcp-server',
    version: '2.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'validate_jmeter': {
        const result = await executor.validateJMeter();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'execute_jmeter_test': {
        const schema = z.object({
          testPlan: z.string(),
          resultsFile: z.string(),
          logFile: z.string().optional(),
          reportDir: z.string().optional(),
          properties: z.record(z.string()).optional(),
          systemProperties: z.record(z.string()).optional(),
          remoteHosts: z.array(z.string()).optional(),
          proxyHost: z.string().optional(),
          proxyPort: z.number().optional()
        });

        const params = schema.parse(args);
        const result = await executor.executeTest(params);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: result.success,
                exitCode: result.exitCode,
                resultsFile: result.resultsFile,
                output: result.stdout,
                errors: result.stderr
              }, null, 2)
            }
          ]
        };
      }

      case 'launch_jmeter_gui': {
        const schema = z.object({
          testPlan: z.string().optional()
        });

        const params = schema.parse(args);
        const result = await executor.launchGui(params.testPlan);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'generate_html_report': {
        const schema = z.object({
          resultsFile: z.string(),
          outputDir: z.string()
        });

        const params = schema.parse(args);
        const result = await executor.generateReport(params.resultsFile, params.outputDir);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'analyze_test_results': {
        const schema = z.object({
          resultsFile: z.string()
        });

        const params = schema.parse(args);
        const analysis = await analyzer.analyzeResults(params.resultsFile);

        // Format the analysis for better readability
        const formatted = {
          summary: {
            totalRequests: analysis.summary.totalRequests,
            successRate: `${((analysis.summary.successfulRequests / analysis.summary.totalRequests) * 100).toFixed(2)}%`,
            errorRate: `${analysis.summary.errorRate.toFixed(2)}%`,
            averageResponseTime: `${analysis.summary.averageResponseTime.toFixed(2)}ms`,
            medianResponseTime: `${analysis.summary.medianResponseTime.toFixed(2)}ms`,
            percentile90: `${analysis.summary.percentile90.toFixed(2)}ms`,
            percentile95: `${analysis.summary.percentile95.toFixed(2)}ms`,
            percentile99: `${analysis.summary.percentile99.toFixed(2)}ms`,
            throughput: `${analysis.summary.throughput.toFixed(2)} req/sec`,
            bandwidth: {
              received: `${analysis.summary.receivedKBPerSec.toFixed(2)} KB/sec`,
              sent: `${analysis.summary.sentKBPerSec.toFixed(2)} KB/sec`
            }
          },
          topEndpoints: analysis.endpoints.slice(0, 10),
          errors: analysis.errors,
          bottlenecks: analysis.bottlenecks,
          recommendations: analysis.recommendations
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(formatted, null, 2)
            }
          ]
        };
      }

      case 'create_http_test_plan': {
        const schema = z.object({
          name: z.string(),
          outputPath: z.string(),
          threads: z.number().default(10),
          rampUp: z.number().default(10),
          duration: z.number().default(60),
          endpoint: z.string(),
          method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('GET'),
          headers: z.record(z.string()).optional(),
          body: z.string().optional()
        });

        const params = schema.parse(args);
        const result = await builder.createHttpTestPlan({
          ...params,
          assertions: [],
          listeners: [{ type: 'summary' }, { type: 'aggregate' }]
        }, params.outputPath);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'execute_distributed_test': {
        const schema = z.object({
          testPlan: z.string(),
          resultsFile: z.string(),
          remoteHosts: z.array(z.string()),
          startRemoteServers: z.boolean().default(true),
          stopRemoteServers: z.boolean().default(true)
        });

        const params = schema.parse(args);
        const result = await executor.executeDistributedTest(params);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'list_jmeter_plugins': {
        const plugins = await executor.listPlugins();

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ plugins, count: plugins.length }, null, 2)
            }
          ]
        };
      }

      case 'get_jmeter_properties': {
        const properties = await executor.getProperties();

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(properties, null, 2)
            }
          ]
        };
      }

      case 'set_jmeter_property': {
        const schema = z.object({
          key: z.string(),
          value: z.string()
        });

        const params = schema.parse(args);
        const result = await executor.setProperty(params.key, params.value);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Unknown tool: ${name}` })
            }
          ],
          isError: true
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          })
        }
      ],
      isError: true
    };
  }
});

// Start the server
async function main() {
  // Validate JMeter installation on startup
  const validation = await executor.validateJMeter();
  if (!validation.valid) {
    console.error('JMeter validation failed:', validation.error);
    console.error('Please ensure JMETER_HOME is set correctly and JMeter is installed');
    process.exit(1);
  }

  console.error('JMeter MCP Server v2.0.0 starting...');
  console.error(`JMeter ${validation.version} detected at ${JMETER_HOME}`);
  console.error('Available tools:', TOOLS.length);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('JMeter MCP Server started successfully');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
