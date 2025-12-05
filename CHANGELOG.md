# Changelog

All notable changes to the JMeter MCP Server TypeScript edition will be documented in this file.

## [2.0.0] - 2024-12-05

### Added - Initial TypeScript Release

#### Core Features
- Complete TypeScript rewrite of JMeter MCP Server
- Full type safety with Zod validation
- MCP SDK 1.0 integration
- Comprehensive error handling

#### Test Execution
- `validate_jmeter` - Validate JMeter installation
- `execute_jmeter_test` - Execute tests with advanced options
- `launch_jmeter_gui` - Launch JMeter GUI mode
- `execute_distributed_test` - Distributed testing support

#### Test Plan Management
- `create_http_test_plan` - Programmatically create test plans
- Support for GET, POST, PUT, DELETE, PATCH methods
- Custom headers and request body support
- Assertion and listener configuration

#### Results Analysis
- `analyze_test_results` - Comprehensive analysis engine
- Parse both XML and CSV JTL formats
- Calculate performance metrics (avg, median, percentiles)
- Per-endpoint metrics calculation
- Time series data generation

#### Bottleneck Detection
- Automatic identification of slow endpoints
- High error rate detection
- High latency analysis
- Severity classification (critical, high, medium, low)

#### Report Generation
- `generate_html_report` - Create HTML dashboards
- Beautiful JMeter dashboard reports
- Visual performance charts and graphs

#### Configuration Management
- `list_jmeter_plugins` - List installed plugins
- `get_jmeter_properties` - View JMeter properties
- `set_jmeter_property` - Modify properties

#### Advanced Features
- Proxy support for test execution
- Remote host configuration
- Custom JMeter and system properties
- Environment variable configuration
- Cross-platform support (Windows, Linux, macOS)

#### Analysis & Insights
- Error pattern analysis
- Performance recommendations
- Bottleneck severity assessment
- Throughput calculations
- Bandwidth analysis

### Technical Improvements
- Modular architecture with separate modules:
  - `executor.ts` - Test execution
  - `analyzer.ts` - Results analysis
  - `builder.ts` - Test plan generation
  - `types.ts` - TypeScript definitions
- Async/await for all operations
- Stream-based XML/CSV parsing
- Comprehensive error handling
- Type-safe parameter validation

### Documentation
- Comprehensive README with examples
- Detailed usage examples document
- API documentation for all tools
- Configuration guide
- Troubleshooting section

### Developer Experience
- TypeScript for type safety
- ESM module support
- Source maps for debugging
- Watch mode for development
- Clean build scripts

## Future Roadmap

### Planned for 2.1.0
- [ ] GraphQL test plan support
- [ ] WebSocket testing
- [ ] Advanced visualization exports (PNG, SVG)
- [ ] Performance regression detection
- [ ] Custom assertion types

### Planned for 2.2.0
- [ ] CI/CD pipeline integration helpers
- [ ] Test result comparison tools
- [ ] Advanced distributed testing features
- [ ] Plugin installation support
- [ ] Test plan validation

### Planned for 3.0.0
- [ ] Real-time test monitoring
- [ ] Live performance metrics streaming
- [ ] Database integration for result storage
- [ ] REST API for remote control
- [ ] Web dashboard interface

## Contributing

We welcome contributions! Please see our contributing guidelines for more information.

## Credits

- Original Python implementation: [jmeter-mcp-server](https://github.com/QAInsights/jmeter-mcp-server)
- Built with [Model Context Protocol](https://modelcontextprotocol.io/)
- Powered by [Apache JMeter](https://jmeter.apache.org/)

---

**Version**: 2.0.0  
**Release Date**: December 5, 2024  
**Author**: QAInsights  
**License**: MIT
