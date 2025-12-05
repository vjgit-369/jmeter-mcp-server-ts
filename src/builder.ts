import * as fs from 'fs/promises';
import type { TestCreationOptions } from './types.js';

/**
 * Builder for creating JMeter test plans programmatically
 */
export class TestPlanBuilder {
  /**
   * Create a basic HTTP test plan
   */
  async createHttpTestPlan(options: TestCreationOptions, outputPath: string): Promise<{
    success: boolean;
    message: string;
    filePath?: string;
  }> {
    try {
      const jmx = this.generateHttpTestPlan(options);
      await fs.writeFile(outputPath, jmx, 'utf-8');

      return {
        success: true,
        message: `Test plan created successfully at ${outputPath}`,
        filePath: outputPath
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create test plan'
      };
    }
  }

  /**
   * Generate HTTP test plan XML
   */
  private generateHttpTestPlan(options: TestCreationOptions): string {
    const {
      name,
      threads,
      rampUp,
      duration,
      endpoint,
      method = 'GET',
      headers = {},
      body,
      assertions = [],
      listeners = []
    } = options;

    // GUIDs generated for future use in extended features
    // const testPlanGuid = this.generateGuid();
    // const threadGroupGuid = this.generateGuid();
    // const samplerGuid = this.generateGuid();
    // const headerManagerGuid = this.generateGuid();

    let jmx = `<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.6.3">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="${this.escapeXml(name)}" enabled="true">
      <stringProp name="TestPlan.comments">Created by JMeter MCP Server</stringProp>
      <boolProp name="TestPlan.functional_mode">false</boolProp>
      <boolProp name="TestPlan.tearDown_on_shutdown">true</boolProp>
      <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments" guiclass="ArgumentsPanel" testclass="Arguments" testname="User Defined Variables" enabled="true">
        <collectionProp name="Arguments.arguments"/>
      </elementProp>
      <stringProp name="TestPlan.user_define_classpath"></stringProp>
    </TestPlan>
    <hashTree>
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="Thread Group" enabled="true">
        <stringProp name="ThreadGroup.on_sample_error">continue</stringProp>
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController" guiclass="LoopControllerGui" testclass="LoopController" testname="Loop Controller" enabled="true">
          <boolProp name="LoopController.continue_forever">false</boolProp>
          <intProp name="LoopController.loops">-1</intProp>
        </elementProp>
        <stringProp name="ThreadGroup.num_threads">${threads}</stringProp>
        <stringProp name="ThreadGroup.ramp_time">${rampUp}</stringProp>
        <boolProp name="ThreadGroup.scheduler">true</boolProp>
        <stringProp name="ThreadGroup.duration">${duration}</stringProp>
        <stringProp name="ThreadGroup.delay">0</stringProp>
        <boolProp name="ThreadGroup.same_user_on_next_iteration">true</boolProp>
      </ThreadGroup>
      <hashTree>`;

    // Add HTTP Header Manager if headers are provided
    if (Object.keys(headers).length > 0) {
      jmx += `
        <HeaderManager guiclass="HeaderPanel" testclass="HeaderManager" testname="HTTP Header Manager" enabled="true">
          <collectionProp name="HeaderManager.headers">`;
      
      for (const [headerName, headerValue] of Object.entries(headers)) {
        jmx += `
            <elementProp name="" elementType="Header">
              <stringProp name="Header.name">${this.escapeXml(headerName)}</stringProp>
              <stringProp name="Header.value">${this.escapeXml(headerValue)}</stringProp>
            </elementProp>`;
      }
      
      jmx += `
          </collectionProp>
        </HeaderManager>
        <hashTree/>`;
    }

    // Parse URL
    const url = new URL(endpoint);
    const protocol = url.protocol.replace(':', '');
    const domain = url.hostname;
    const port = url.port || (protocol === 'https' ? '443' : '80');
    const path = url.pathname + url.search;

    // Add HTTP Request Sampler
    jmx += `
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="HTTP Request" enabled="true">
          <elementProp name="HTTPsampler.Arguments" elementType="Arguments" guiclass="HTTPArgumentsPanel" testclass="Arguments" testname="User Defined Variables" enabled="true">
            <collectionProp name="Arguments.arguments">`;

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      jmx += `
              <elementProp name="" elementType="HTTPArgument">
                <boolProp name="HTTPArgument.always_encode">false</boolProp>
                <stringProp name="Argument.value">${this.escapeXml(body)}</stringProp>
                <stringProp name="Argument.metadata">=</stringProp>
              </elementProp>`;
    }

    jmx += `
            </collectionProp>
          </elementProp>
          <stringProp name="HTTPSampler.domain">${domain}</stringProp>
          <stringProp name="HTTPSampler.port">${port}</stringProp>
          <stringProp name="HTTPSampler.protocol">${protocol}</stringProp>
          <stringProp name="HTTPSampler.contentEncoding"></stringProp>
          <stringProp name="HTTPSampler.path">${this.escapeXml(path)}</stringProp>
          <stringProp name="HTTPSampler.method">${method}</stringProp>
          <boolProp name="HTTPSampler.follow_redirects">true</boolProp>
          <boolProp name="HTTPSampler.auto_redirects">false</boolProp>
          <boolProp name="HTTPSampler.use_keepalive">true</boolProp>
          <boolProp name="HTTPSampler.DO_MULTIPART_POST">false</boolProp>
          <stringProp name="HTTPSampler.embedded_url_re"></stringProp>
          <stringProp name="HTTPSampler.connect_timeout"></stringProp>
          <stringProp name="HTTPSampler.response_timeout"></stringProp>
        </HTTPSamplerProxy>
        <hashTree>`;

    // Add assertions
    for (const assertion of assertions) {
      if (assertion.type === 'response') {
        jmx += this.generateResponseAssertion(assertion.value as string, assertion.operator || 'contains');
      } else if (assertion.type === 'duration') {
        jmx += this.generateDurationAssertion(assertion.value as number);
      } else if (assertion.type === 'size') {
        jmx += this.generateSizeAssertion(assertion.value as number);
      }
    }

    jmx += `
        </hashTree>`;

    // Add listeners
    for (const listener of listeners) {
      if (listener.type === 'results-tree') {
        jmx += this.generateResultsTreeListener();
      } else if (listener.type === 'summary') {
        jmx += this.generateSummaryListener(listener.filename);
      } else if (listener.type === 'aggregate') {
        jmx += this.generateAggregateListener(listener.filename);
      }
    }

    jmx += `
      </hashTree>
    </hashTree>
  </hashTree>
</jmeterTestPlan>`;

    return jmx;
  }

  /**
   * Generate response assertion
   */
  private generateResponseAssertion(pattern: string, operator: string): string {
    const testType = operator === 'contains' ? '16' : operator === 'equals' ? '8' : '1';
    
    return `
          <ResponseAssertion guiclass="AssertionGui" testclass="ResponseAssertion" testname="Response Assertion" enabled="true">
            <collectionProp name="Asserion.test_strings">
              <stringProp name="assertion_pattern">${this.escapeXml(pattern)}</stringProp>
            </collectionProp>
            <stringProp name="Assertion.custom_message"></stringProp>
            <stringProp name="Assertion.test_field">Assertion.response_data</stringProp>
            <boolProp name="Assertion.assume_success">false</boolProp>
            <intProp name="Assertion.test_type">${testType}</intProp>
          </ResponseAssertion>
          <hashTree/>`;
  }

  /**
   * Generate duration assertion
   */
  private generateDurationAssertion(maxDuration: number): string {
    return `
          <DurationAssertion guiclass="DurationAssertionGui" testclass="DurationAssertion" testname="Duration Assertion" enabled="true">
            <stringProp name="DurationAssertion.duration">${maxDuration}</stringProp>
          </DurationAssertion>
          <hashTree/>`;
  }

  /**
   * Generate size assertion
   */
  private generateSizeAssertion(expectedSize: number): string {
    return `
          <SizeAssertion guiclass="SizeAssertionGui" testclass="SizeAssertion" testname="Size Assertion" enabled="true">
            <stringProp name="Assertion.test_field">SizeAssertion.response_network_size</stringProp>
            <stringProp name="SizeAssertion.size">${expectedSize}</stringProp>
            <intProp name="SizeAssertion.operator">1</intProp>
          </SizeAssertion>
          <hashTree/>`;
  }

  /**
   * Generate Results Tree Listener
   */
  private generateResultsTreeListener(): string {
    return `
        <ResultCollector guiclass="ViewResultsFullVisualizer" testclass="ResultCollector" testname="View Results Tree" enabled="true">
          <boolProp name="ResultCollector.error_logging">false</boolProp>
          <objProp>
            <name>saveConfig</name>
            <value class="SampleSaveConfiguration">
              <time>true</time>
              <latency>true</latency>
              <timestamp>true</timestamp>
              <success>true</success>
              <label>true</label>
              <code>true</code>
              <message>true</message>
              <threadName>true</threadName>
              <dataType>true</dataType>
              <encoding>false</encoding>
              <assertions>true</assertions>
              <subresults>true</subresults>
              <responseData>false</responseData>
              <samplerData>false</samplerData>
              <xml>false</xml>
              <fieldNames>true</fieldNames>
              <responseHeaders>false</responseHeaders>
              <requestHeaders>false</requestHeaders>
              <responseDataOnError>false</responseDataOnError>
              <saveAssertionResultsFailureMessage>true</saveAssertionResultsFailureMessage>
              <assertionsResultsToSave>0</assertionsResultsToSave>
              <bytes>true</bytes>
              <sentBytes>true</sentBytes>
              <url>true</url>
              <threadCounts>true</threadCounts>
              <idleTime>true</idleTime>
              <connectTime>true</connectTime>
            </value>
          </objProp>
          <stringProp name="filename"></stringProp>
        </ResultCollector>
        <hashTree/>`;
  }

  /**
   * Generate Summary Report Listener
   */
  private generateSummaryListener(filename?: string): string {
    return `
        <ResultCollector guiclass="SummaryReport" testclass="ResultCollector" testname="Summary Report" enabled="true">
          <boolProp name="ResultCollector.error_logging">false</boolProp>
          <objProp>
            <name>saveConfig</name>
            <value class="SampleSaveConfiguration">
              <time>true</time>
              <latency>true</latency>
              <timestamp>true</timestamp>
              <success>true</success>
              <label>true</label>
              <code>true</code>
              <message>true</message>
              <threadName>true</threadName>
              <dataType>true</dataType>
              <encoding>false</encoding>
              <assertions>true</assertions>
              <subresults>true</subresults>
              <responseData>false</responseData>
              <samplerData>false</samplerData>
              <xml>false</xml>
              <fieldNames>true</fieldNames>
              <responseHeaders>false</responseHeaders>
              <requestHeaders>false</requestHeaders>
              <responseDataOnError>false</responseDataOnError>
              <saveAssertionResultsFailureMessage>true</saveAssertionResultsFailureMessage>
              <assertionsResultsToSave>0</assertionsResultsToSave>
              <bytes>true</bytes>
              <sentBytes>true</sentBytes>
              <url>true</url>
              <threadCounts>true</threadCounts>
              <idleTime>true</idleTime>
              <connectTime>true</connectTime>
            </value>
          </objProp>
          <stringProp name="filename">${filename || ''}</stringProp>
        </ResultCollector>
        <hashTree/>`;
  }

  /**
   * Generate Aggregate Report Listener
   */
  private generateAggregateListener(filename?: string): string {
    return `
        <ResultCollector guiclass="StatVisualizer" testclass="ResultCollector" testname="Aggregate Report" enabled="true">
          <boolProp name="ResultCollector.error_logging">false</boolProp>
          <objProp>
            <name>saveConfig</name>
            <value class="SampleSaveConfiguration">
              <time>true</time>
              <latency>true</latency>
              <timestamp>true</timestamp>
              <success>true</success>
              <label>true</label>
              <code>true</code>
              <message>true</message>
              <threadName>true</threadName>
              <dataType>true</dataType>
              <encoding>false</encoding>
              <assertions>true</assertions>
              <subresults>true</subresults>
              <responseData>false</responseData>
              <samplerData>false</samplerData>
              <xml>false</xml>
              <fieldNames>true</fieldNames>
              <responseHeaders>false</responseHeaders>
              <requestHeaders>false</requestHeaders>
              <responseDataOnError>false</responseDataOnError>
              <saveAssertionResultsFailureMessage>true</saveAssertionResultsFailureMessage>
              <assertionsResultsToSave>0</assertionsResultsToSave>
              <bytes>true</bytes>
              <sentBytes>true</sentBytes>
              <url>true</url>
              <threadCounts>true</threadCounts>
              <idleTime>true</idleTime>
              <connectTime>true</connectTime>
            </value>
          </objProp>
          <stringProp name="filename">${filename || ''}</stringProp>
        </ResultCollector>
        <hashTree/>`;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
