/**
 * Type definitions for JMeter MCP Server
 */

export interface JMeterConfig {
  jmeterHome: string;
  jmeterBin: string;
  defaultThreads?: number;
  defaultDuration?: number;
  defaultRampUp?: number;
}

export interface TestExecutionOptions {
  testPlan: string;
  resultsFile: string;
  logFile?: string;
  reportDir?: string;
  properties?: Record<string, string>;
  systemProperties?: Record<string, string>;
  jmeterProperties?: string[];
  remoteHosts?: string[];
  proxyHost?: string;
  proxyPort?: number;
  nonProxyHosts?: string;
}

export interface TestCreationOptions {
  name: string;
  threads: number;
  rampUp: number;
  duration: number;
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string;
  assertions?: Assertion[];
  listeners?: Listener[];
}

export interface Assertion {
  type: 'response' | 'duration' | 'size';
  value: string | number;
  operator?: 'equals' | 'contains' | 'matches' | 'greaterThan' | 'lessThan';
}

export interface Listener {
  type: 'results-tree' | 'summary' | 'aggregate' | 'graph';
  filename?: string;
}

export interface JTLResult {
  timestamp: number;
  elapsed: number;
  label: string;
  responseCode: string;
  responseMessage: string;
  threadName: string;
  dataType: string;
  success: boolean;
  failureMessage?: string;
  bytes: number;
  sentBytes: number;
  grpThreads: number;
  allThreads: number;
  latency: number;
  idleTime: number;
  connect: number;
}

export interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  errorRate: number;
  averageResponseTime: number;
  medianResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  percentile90: number;
  percentile95: number;
  percentile99: number;
  throughput: number;
  receivedKBPerSec: number;
  sentKBPerSec: number;
  avgBytes: number;
  avgLatency: number;
  avgConnectTime: number;
}

export interface EndpointMetrics {
  label: string;
  samples: number;
  average: number;
  median: number;
  min: number;
  max: number;
  percentile90: number;
  percentile95: number;
  percentile99: number;
  errorRate: number;
  throughput: number;
  receivedKBPerSec: number;
  sentKBPerSec: number;
}

export interface AnalysisResult {
  summary: PerformanceMetrics;
  endpoints: EndpointMetrics[];
  errors: ErrorAnalysis[];
  bottlenecks: Bottleneck[];
  recommendations: string[];
  timeSeriesData?: TimeSeriesData[];
}

export interface ErrorAnalysis {
  responseCode: string;
  responseMessage: string;
  count: number;
  percentage: number;
  affectedEndpoints: string[];
}

export interface Bottleneck {
  type: 'slow-endpoint' | 'high-error-rate' | 'high-latency' | 'low-throughput';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedEndpoint: string;
  metric: string;
  value: number;
  threshold: number;
}

export interface TimeSeriesData {
  timestamp: number;
  responseTime: number;
  throughput: number;
  activeThreads: number;
  errorCount: number;
}

export interface ReportGenerationOptions {
  resultsFile: string;
  outputDir: string;
  reportTitle?: string;
  includeGraphs?: boolean;
  includeDetailedStats?: boolean;
}

export interface PluginInfo {
  name: string;
  version: string;
  description: string;
  installed: boolean;
}

export interface DistributedTestConfig {
  remoteHosts: string[];
  testPlan: string;
  resultsFile: string;
  startRemoteServers?: boolean;
  stopRemoteServers?: boolean;
}
