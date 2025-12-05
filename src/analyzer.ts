import * as fs from 'fs/promises';
import { XMLParser } from 'fast-xml-parser';
import type {
  JTLResult,
  PerformanceMetrics,
  EndpointMetrics,
  AnalysisResult,
  ErrorAnalysis,
  Bottleneck,
  TimeSeriesData
} from './types.js';

/**
 * Analyzer for JMeter test results
 */
export class ResultsAnalyzer {
  /**
   * Parse JTL results file (supports both XML and CSV formats)
   */
  async parseResults(filePath: string): Promise<JTLResult[]> {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Detect format
    const isXml = content.trim().startsWith('<?xml') || content.trim().startsWith('<testResults');
    
    if (isXml) {
      return this.parseXmlResults(content);
    } else {
      return this.parseCsvResults(content);
    }
  }

  /**
   * Parse XML format JTL results
   */
  private parseXmlResults(content: string): JTLResult[] {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      parseAttributeValue: true
    });

    const parsed = parser.parse(content);
    const samples = parsed.testResults?.httpSample || parsed.testResults?.sample || [];
    const sampleArray = Array.isArray(samples) ? samples : [samples];

    return sampleArray.map((sample: any) => ({
      timestamp: parseInt(sample.t) || parseInt(sample.ts) || 0,
      elapsed: parseInt(sample.t) || 0,
      label: sample.lb || sample.label || 'Unknown',
      responseCode: sample.rc || '',
      responseMessage: sample.rm || '',
      threadName: sample.tn || '',
      dataType: sample.dt || '',
      success: sample.s === 'true' || sample.success === 'true',
      failureMessage: sample.failureMessage || undefined,
      bytes: parseInt(sample.by) || 0,
      sentBytes: parseInt(sample.sby) || 0,
      grpThreads: parseInt(sample.ng) || 0,
      allThreads: parseInt(sample.na) || 0,
      latency: parseInt(sample.lt) || 0,
      idleTime: parseInt(sample.it) || 0,
      connect: parseInt(sample.ct) || 0
    }));
  }

  /**
   * Parse CSV format JTL results
   */
  private parseCsvResults(content: string): JTLResult[] {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const results: JTLResult[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]);
      if (values.length === 0) continue;

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      results.push({
        timestamp: parseInt(row.timeStamp) || 0,
        elapsed: parseInt(row.elapsed) || 0,
        label: row.label || 'Unknown',
        responseCode: row.responseCode || '',
        responseMessage: row.responseMessage || '',
        threadName: row.threadName || '',
        dataType: row.dataType || '',
        success: row.success === 'true',
        failureMessage: row.failureMessage || undefined,
        bytes: parseInt(row.bytes) || 0,
        sentBytes: parseInt(row.sentBytes) || 0,
        grpThreads: parseInt(row.grpThreads) || 0,
        allThreads: parseInt(row.allThreads) || 0,
        latency: parseInt(row.Latency) || parseInt(row.latency) || 0,
        idleTime: parseInt(row.IdleTime) || parseInt(row.idleTime) || 0,
        connect: parseInt(row.Connect) || parseInt(row.connect) || 0
      });
    }

    return results;
  }

  /**
   * Parse CSV line handling quoted values
   */
  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  }

  /**
   * Calculate overall performance metrics
   */
  calculateMetrics(results: JTLResult[]): PerformanceMetrics {
    if (results.length === 0) {
      return this.getEmptyMetrics();
    }

    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);
    
    const responseTimes = results.map(r => r.elapsed).sort((a, b) => a - b);
    const totalTime = Math.max(...results.map(r => r.timestamp)) - Math.min(...results.map(r => r.timestamp));
    const totalTimeInSeconds = totalTime / 1000;

    return {
      totalRequests: results.length,
      successfulRequests: successfulResults.length,
      failedRequests: failedResults.length,
      errorRate: (failedResults.length / results.length) * 100,
      averageResponseTime: this.average(responseTimes),
      medianResponseTime: this.percentile(responseTimes, 50),
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      percentile90: this.percentile(responseTimes, 90),
      percentile95: this.percentile(responseTimes, 95),
      percentile99: this.percentile(responseTimes, 99),
      throughput: totalTimeInSeconds > 0 ? results.length / totalTimeInSeconds : 0,
      receivedKBPerSec: totalTimeInSeconds > 0 
        ? results.reduce((sum, r) => sum + r.bytes, 0) / 1024 / totalTimeInSeconds 
        : 0,
      sentKBPerSec: totalTimeInSeconds > 0 
        ? results.reduce((sum, r) => sum + r.sentBytes, 0) / 1024 / totalTimeInSeconds 
        : 0,
      avgBytes: results.reduce((sum, r) => sum + r.bytes, 0) / results.length,
      avgLatency: this.average(results.map(r => r.latency)),
      avgConnectTime: this.average(results.map(r => r.connect))
    };
  }

  /**
   * Calculate metrics per endpoint
   */
  calculateEndpointMetrics(results: JTLResult[]): EndpointMetrics[] {
    const endpointGroups = this.groupBy(results, 'label');
    const metrics: EndpointMetrics[] = [];

    for (const [label, endpointResults] of Object.entries(endpointGroups)) {
      const responseTimes = endpointResults.map(r => r.elapsed).sort((a, b) => a - b);
      const failedCount = endpointResults.filter(r => !r.success).length;
      const totalTime = Math.max(...endpointResults.map(r => r.timestamp)) - 
                       Math.min(...endpointResults.map(r => r.timestamp));
      const totalTimeInSeconds = totalTime / 1000;

      metrics.push({
        label,
        samples: endpointResults.length,
        average: this.average(responseTimes),
        median: this.percentile(responseTimes, 50),
        min: Math.min(...responseTimes),
        max: Math.max(...responseTimes),
        percentile90: this.percentile(responseTimes, 90),
        percentile95: this.percentile(responseTimes, 95),
        percentile99: this.percentile(responseTimes, 99),
        errorRate: (failedCount / endpointResults.length) * 100,
        throughput: totalTimeInSeconds > 0 ? endpointResults.length / totalTimeInSeconds : 0,
        receivedKBPerSec: totalTimeInSeconds > 0 
          ? endpointResults.reduce((sum, r) => sum + r.bytes, 0) / 1024 / totalTimeInSeconds 
          : 0,
        sentKBPerSec: totalTimeInSeconds > 0 
          ? endpointResults.reduce((sum, r) => sum + r.sentBytes, 0) / 1024 / totalTimeInSeconds 
          : 0
      });
    }

    return metrics.sort((a, b) => b.average - a.average);
  }

  /**
   * Analyze errors
   */
  analyzeErrors(results: JTLResult[]): ErrorAnalysis[] {
    const failedResults = results.filter(r => !r.success);
    if (failedResults.length === 0) return [];

    const errorGroups: Record<string, JTLResult[]> = {};
    
    for (const result of failedResults) {
      const key = `${result.responseCode}-${result.responseMessage}`;
      if (!errorGroups[key]) {
        errorGroups[key] = [];
      }
      errorGroups[key].push(result);
    }

    return Object.entries(errorGroups).map(([_, errors]) => {
      const affectedEndpoints = [...new Set(errors.map(e => e.label))];
      return {
        responseCode: errors[0].responseCode,
        responseMessage: errors[0].responseMessage,
        count: errors.length,
        percentage: (errors.length / results.length) * 100,
        affectedEndpoints
      };
    }).sort((a, b) => b.count - a.count);
  }

  /**
   * Identify performance bottlenecks
   */
  identifyBottlenecks(
    metrics: PerformanceMetrics,
    endpointMetrics: EndpointMetrics[]
  ): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];

    // Check for slow endpoints (>2s average)
    for (const endpoint of endpointMetrics) {
      if (endpoint.average > 2000) {
        bottlenecks.push({
          type: 'slow-endpoint',
          severity: endpoint.average > 5000 ? 'critical' : endpoint.average > 3000 ? 'high' : 'medium',
          description: `Endpoint "${endpoint.label}" has slow response time`,
          affectedEndpoint: endpoint.label,
          metric: 'Average Response Time',
          value: endpoint.average,
          threshold: 2000
        });
      }

      // Check for high error rates (>5%)
      if (endpoint.errorRate > 5) {
        bottlenecks.push({
          type: 'high-error-rate',
          severity: endpoint.errorRate > 20 ? 'critical' : endpoint.errorRate > 10 ? 'high' : 'medium',
          description: `Endpoint "${endpoint.label}" has high error rate`,
          affectedEndpoint: endpoint.label,
          metric: 'Error Rate',
          value: endpoint.errorRate,
          threshold: 5
        });
      }

      // Check for high latency (>1s)
      if (endpoint.percentile95 > 1000) {
        bottlenecks.push({
          type: 'high-latency',
          severity: endpoint.percentile95 > 3000 ? 'critical' : endpoint.percentile95 > 2000 ? 'high' : 'medium',
          description: `Endpoint "${endpoint.label}" has high latency at 95th percentile`,
          affectedEndpoint: endpoint.label,
          metric: '95th Percentile',
          value: endpoint.percentile95,
          threshold: 1000
        });
      }
    }

    // Check overall error rate
    if (metrics.errorRate > 5) {
      bottlenecks.push({
        type: 'high-error-rate',
        severity: metrics.errorRate > 20 ? 'critical' : metrics.errorRate > 10 ? 'high' : 'medium',
        description: 'Overall error rate is high',
        affectedEndpoint: 'All endpoints',
        metric: 'Error Rate',
        value: metrics.errorRate,
        threshold: 5
      });
    }

    return bottlenecks.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(
    metrics: PerformanceMetrics,
    bottlenecks: Bottleneck[],
    errors: ErrorAnalysis[]
  ): string[] {
    const recommendations: string[] = [];

    // Recommendations based on bottlenecks
    for (const bottleneck of bottlenecks) {
      if (bottleneck.type === 'slow-endpoint') {
        recommendations.push(
          `Optimize "${bottleneck.affectedEndpoint}": Consider database query optimization, caching, or code profiling.`
        );
      } else if (bottleneck.type === 'high-error-rate') {
        recommendations.push(
          `Investigate errors in "${bottleneck.affectedEndpoint}": Check server logs, validate input data, and review error handling.`
        );
      } else if (bottleneck.type === 'high-latency') {
        recommendations.push(
          `Reduce latency for "${bottleneck.affectedEndpoint}": Review network configuration, enable compression, or use CDN.`
        );
      }
    }

    // Recommendations based on error patterns
    for (const error of errors.slice(0, 3)) {
      if (error.responseCode.startsWith('5')) {
        recommendations.push(
          `Server errors (${error.responseCode}): Review server capacity, check for memory leaks, and monitor resource usage.`
        );
      } else if (error.responseCode === '404') {
        recommendations.push(
          `404 errors found: Verify API endpoints are correctly configured and accessible.`
        );
      } else if (error.responseCode === '401' || error.responseCode === '403') {
        recommendations.push(
          `Authentication/Authorization errors: Check credentials, tokens, and permission configurations.`
        );
      }
    }

    // General recommendations based on metrics
    if (metrics.errorRate > 1 && metrics.errorRate <= 5) {
      recommendations.push(
        'Monitor error trends: Error rate is slightly elevated. Set up alerts to catch increases early.'
      );
    }

    if (metrics.percentile95 > metrics.averageResponseTime * 2) {
      recommendations.push(
        'Inconsistent response times: Consider implementing request queuing or load balancing to stabilize performance.'
      );
    }

    if (metrics.throughput < 10) {
      recommendations.push(
        'Low throughput detected: Consider horizontal scaling, optimizing resource usage, or increasing connection pools.'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'Performance looks good! Continue monitoring and consider stress testing with higher loads.'
      );
    }

    return recommendations;
  }

  /**
   * Generate time series data for visualization
   */
  generateTimeSeriesData(results: JTLResult[], intervalMs: number = 10000): TimeSeriesData[] {
    if (results.length === 0) return [];

    const minTime = Math.min(...results.map(r => r.timestamp));
    const maxTime = Math.max(...results.map(r => r.timestamp));
    
    const timeSeriesData: TimeSeriesData[] = [];
    
    for (let time = minTime; time <= maxTime; time += intervalMs) {
      const intervalResults = results.filter(
        r => r.timestamp >= time && r.timestamp < time + intervalMs
      );

      if (intervalResults.length > 0) {
        const avgResponseTime = this.average(intervalResults.map(r => r.elapsed));
        const errorCount = intervalResults.filter(r => !r.success).length;
        const maxThreads = Math.max(...intervalResults.map(r => r.allThreads));

        timeSeriesData.push({
          timestamp: time,
          responseTime: avgResponseTime,
          throughput: intervalResults.length / (intervalMs / 1000),
          activeThreads: maxThreads,
          errorCount
        });
      }
    }

    return timeSeriesData;
  }

  /**
   * Perform complete analysis
   */
  async analyzeResults(filePath: string): Promise<AnalysisResult> {
    const results = await this.parseResults(filePath);
    const metrics = this.calculateMetrics(results);
    const endpointMetrics = this.calculateEndpointMetrics(results);
    const errors = this.analyzeErrors(results);
    const bottlenecks = this.identifyBottlenecks(metrics, endpointMetrics);
    const recommendations = this.generateRecommendations(metrics, bottlenecks, errors);
    const timeSeriesData = this.generateTimeSeriesData(results);

    return {
      summary: metrics,
      endpoints: endpointMetrics,
      errors,
      bottlenecks,
      recommendations,
      timeSeriesData
    };
  }

  // Helper methods
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }

  private percentile(sortedNumbers: number[], percentile: number): number {
    if (sortedNumbers.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * sortedNumbers.length) - 1;
    return sortedNumbers[Math.max(0, index)];
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  private getEmptyMetrics(): PerformanceMetrics {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      errorRate: 0,
      averageResponseTime: 0,
      medianResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      percentile90: 0,
      percentile95: 0,
      percentile99: 0,
      throughput: 0,
      receivedKBPerSec: 0,
      sentKBPerSec: 0,
      avgBytes: 0,
      avgLatency: 0,
      avgConnectTime: 0
    };
  }
}
