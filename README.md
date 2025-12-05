# 🚀 JMeter MCP Server (TypeScript Edition)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-1.0-purple.svg)](https://modelcontextprotocol.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A powerful Model Context Protocol (MCP) server that enables AI assistants like Claude to interact with Apache JMeter for performance testing. Built with TypeScript for enhanced type safety and reliability.

## ✨ Features

### 🎯 Core Features
- **Execute JMeter Tests**: Run tests in non-GUI mode with comprehensive options
- **GUI Mode**: Launch JMeter GUI for test development
- **Test Plan Creation**: Programmatically create HTTP test plans
- **Results Analysis**: Advanced parsing and analysis of JTL files
- **HTML Reports**: Generate beautiful dashboard reports
- **Distributed Testing**: Execute tests across multiple remote servers

### 📊 Advanced Analysis
- **Performance Metrics**: Calculate comprehensive statistics (avg, median, percentiles)
- **Bottleneck Detection**: Automatically identify slow endpoints and high error rates
- **Error Analysis**: Group and analyze errors by type and endpoint
- **Time Series Data**: Generate data for performance visualization
- **Recommendations**: AI-powered suggestions for performance improvements

### 🛠️ Management Tools
- **Plugin Management**: List installed JMeter plugins
- **Property Management**: Get and set JMeter properties
- **Validation**: Verify JMeter installation and version

## 📋 Prerequisites

- **Node.js**: Version 18 or higher
- **JMeter**: Apache JMeter 5.0 or higher
- **npm** or **yarn**: For package management

## 🔧 Installation

### 1. Clone or Download

```bash
cd jmeter-mcp-server-ts
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and set your JMeter path:

```env
JMETER_HOME=C:/apache-jmeter-5.6.3
```

### 4. Build

```bash
npm run build
```

## 🚀 Usage

### With Claude Desktop

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "jmeter": {
      "command": "node",
      "args": [
        "C:/Users/YourUser/Documents/jmeter-mcp-server-ts/dist/index.js"
      ],
      "env": {
        "JMETER_HOME": "C:/apache-jmeter-5.6.3"
      }
    }
  }
}
```

### With Cursor / Windsurf

Add to your MCP settings:

```json
{
  "jmeter": {
    "command": "node",
    "args": ["path/to/dist/index.js"],
    "env": {
      "JMETER_HOME": "/path/to/jmeter"
    }
  }
}
```

## 🔨 Available Tools

### 1. validate_jmeter
Validate JMeter installation and get version info.

**Example:**
```
Validate my JMeter installation
```

### 2. execute_jmeter_test
Execute a test plan in non-GUI mode.

**Parameters:**
- `testPlan`: Path to .jmx file
- `resultsFile`: Path for .jtl results
- `logFile`: (Optional) Log file path
- `reportDir`: (Optional) Generate HTML report
- `properties`: (Optional) JMeter properties
- `systemProperties`: (Optional) System properties
- `remoteHosts`: (Optional) For distributed testing

**Example:**
```
Run JMeter test from C:/tests/my-test.jmx and save results to C:/results/output.jtl with HTML report in C:/reports
```

### 3. launch_jmeter_gui
Launch JMeter GUI for test development.

**Example:**
```
Open JMeter GUI with test plan C:/tests/my-test.jmx
```

### 4. generate_html_report
Generate HTML dashboard from existing results.

**Parameters:**
- `resultsFile`: Path to .jtl file
- `outputDir`: Directory for HTML report

**Example:**
```
Generate HTML report from C:/results/output.jtl to C:/reports/dashboard
```

### 5. analyze_test_results
Comprehensive analysis of test results.

**Example:**
```
Analyze JMeter results from C:/results/output.jtl
```

**Provides:**
- Performance summary (avg, median, percentiles)
- Per-endpoint metrics
- Error analysis
- Bottleneck identification
- Performance recommendations

### 6. create_http_test_plan
Create a new HTTP test plan programmatically.

**Parameters:**
- `name`: Test plan name
- `outputPath`: Where to save .jmx
- `threads`: Number of virtual users
- `rampUp`: Ramp-up period (seconds)
- `duration`: Test duration (seconds)
- `endpoint`: URL to test
- `method`: HTTP method (GET/POST/PUT/DELETE/PATCH)
- `headers`: (Optional) HTTP headers
- `body`: (Optional) Request body

**Example:**
```
Create a JMeter test plan named "API Load Test" to test https://api.example.com/users with 50 threads, 30 second ramp-up, and 120 second duration. Save it to C:/tests/api-test.jmx
```

### 7. execute_distributed_test
Run distributed test across multiple servers.

**Parameters:**
- `testPlan`: Path to test plan
- `resultsFile`: Path for results
- `remoteHosts`: Array of remote server IPs
- `startRemoteServers`: Auto-start servers
- `stopRemoteServers`: Auto-stop servers

**Example:**
```
Execute distributed test with test plan C:/tests/my-test.jmx across servers 192.168.1.10 and 192.168.1.11
```

### 8. list_jmeter_plugins
List all installed JMeter plugins.

**Example:**
```
Show me installed JMeter plugins
```

### 9. get_jmeter_properties
Get JMeter configuration properties.

**Example:**
```
Show JMeter properties
```

### 10. set_jmeter_property
Set a JMeter property.

**Parameters:**
- `key`: Property name
- `value`: Property value

**Example:**
```
Set JMeter property jmeter.save.saveservice.output_format to xml
```

## 📊 Example Workflows

### Basic Load Test

```
1. Create a test plan for https://api.example.com/products with 100 users over 60 seconds
2. Execute the test and save results to C:/results/load-test.jtl
3. Analyze the results and show me bottlenecks
4. Generate an HTML report in C:/reports/load-test
```

### Advanced Analysis

```
Analyze the JMeter results from C:/results/stress-test.jtl and:
- Show me the top 5 slowest endpoints
- Identify all endpoints with error rates above 5%
- Give me recommendations for improving performance
- Show the 95th percentile response times
```

### Distributed Testing

```
1. Create a test plan for https://api.example.com with 500 threads
2. Execute it as a distributed test across servers 192.168.1.10, 192.168.1.11, and 192.168.1.12
3. Analyze the combined results
```

## 🏗️ Project Structure

```
jmeter-mcp-server-ts/
├── src/
│   ├── index.ts          # Main MCP server
│   ├── types.ts          # TypeScript type definitions
│   ├── executor.ts       # JMeter test execution
│   ├── analyzer.ts       # Results analysis engine
│   └── builder.ts        # Test plan generation
├── dist/                 # Compiled JavaScript (generated)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .env.example          # Environment template
└── README.md            # This file
```

## 🔍 Analysis Capabilities

The analyzer provides deep insights into your test results:

### Performance Metrics
- Total requests and success rate
- Response time statistics (avg, median, min, max)
- Percentiles (90th, 95th, 99th)
- Throughput (requests/second)
- Bandwidth usage (sent/received)
- Latency and connection time

### Bottleneck Detection
- **Slow Endpoints**: Identifies endpoints with high response times
- **High Error Rates**: Flags endpoints with frequent failures
- **High Latency**: Detects network or processing delays
- **Severity Levels**: Critical, High, Medium, Low

### Error Analysis
- Groups errors by response code and message
- Shows affected endpoints per error type
- Calculates error percentages
- Identifies error patterns

### Recommendations
AI-powered suggestions for:
- Database optimization
- Caching strategies
- Server capacity planning
- Network configuration
- Load balancing
- Error handling improvements

## 🛠️ Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

### Clean

```bash
npm run clean
```

## 🐛 Troubleshooting

### JMeter Not Found

```
Error: JMETER_HOME environment variable is not set
```

**Solution:** Set `JMETER_HOME` in your `.env` file or system environment.

### Permission Errors (Linux/Mac)

```bash
chmod +x /path/to/jmeter/bin/jmeter
```

### Node Version Issues

Ensure Node.js 18+ is installed:

```bash
node --version
```

### Build Errors

Clear and reinstall:

```bash
npm run clean
rm -rf node_modules
npm install
npm run build
```

## 📝 Configuration

### Environment Variables

- `JMETER_HOME`: Path to JMeter installation (required)
- `JMETER_BIN`: Path to JMeter binary (optional, auto-detected)
- `JMETER_JAVA_OPTS`: Java options for JMeter (optional)

### JMeter Properties

Properties can be set via the `set_jmeter_property` tool or directly in:
- `jmeter.properties`: Main configuration
- `user.properties`: User-specific settings

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built on [Model Context Protocol](https://modelcontextprotocol.io/) by Anthropic
- Powered by [Apache JMeter](https://jmeter.apache.org/)
- Inspired by the original [Python implementation](https://github.com/QAInsights/jmeter-mcp-server)

## 📧 Support

For issues and questions:
- GitHub Issues: [Report a bug](https://github.com/QAInsights/jmeter-mcp-server-ts/issues)
- Documentation: Check this README
- JMeter Docs: [jmeter.apache.org](https://jmeter.apache.org/)

## 🌟 Features Coming Soon

- [ ] GraphQL test plan creation
- [ ] WebSocket testing support
- [ ] Advanced visualization exports
- [ ] CI/CD pipeline integration
- [ ] Performance regression detection
- [ ] Custom plugin support

---

** Enjoy Testing ❤️ by Vj369 **

**⭐ Star this repo if you find it useful!**
