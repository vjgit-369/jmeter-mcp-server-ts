# JMeter MCP Server - Usage Examples

## Example 1: Basic Load Test

```
Create a JMeter test plan named "Basic API Test" to test https://jsonplaceholder.typicode.com/posts with 10 threads, 5 second ramp-up, and 30 second duration. Save it to C:/Users/Vijay/Documents/examples/basic-test.jmx
```

Then execute it:

```
Execute JMeter test from C:/Users/Vijay/Documents/examples/basic-test.jmx and save results to C:/Users/Vijay/Documents/examples/results.jtl with HTML report in C:/Users/Vijay/Documents/examples/report
```

Finally analyze:

```
Analyze JMeter results from C:/Users/Vijay/Documents/examples/results.jtl
```

## Example 2: POST Request with JSON Body

```
Create a JMeter test plan named "POST API Test" to test https://jsonplaceholder.typicode.com/posts with method POST, 5 threads, 3 second ramp-up, 20 second duration. Add header Content-Type: application/json and body: {"title": "foo", "body": "bar", "userId": 1}. Save to C:/Users/Vijay/Documents/examples/post-test.jmx
```

## Example 3: Advanced Analysis

```
Analyze the test results from C:/Users/Vijay/Documents/examples/results.jtl and show me:
1. Overall performance summary
2. Top 5 slowest endpoints
3. All endpoints with error rates above 1%
4. Performance bottlenecks with severity levels
5. Recommendations for improvement
```

## Example 4: Distributed Testing

```
Execute a distributed test using test plan C:/Users/Vijay/Documents/examples/stress-test.jmx across remote servers 192.168.1.10 and 192.168.1.11, save results to C:/Users/Vijay/Documents/examples/distributed-results.jtl
```

## Example 5: Property Management

Check current properties:
```
Show me all JMeter properties
```

Set a property:
```
Set JMeter property jmeter.save.saveservice.output_format to csv
```

## Example 6: Plugin Management

```
Show me all installed JMeter plugins and their versions
```

## Example 7: Complex Test Plan

```
Create a comprehensive test plan named "E-Commerce Load Test" with the following:
- Test https://api.example.com/products endpoint with GET method
- 100 concurrent users
- 60 second ramp-up period
- 300 second (5 minute) test duration
- Add headers: Content-Type: application/json, Authorization: Bearer test-token
- Save to C:/Users/Vijay/Documents/examples/ecommerce-test.jmx
```

## Example 8: Report Generation

```
Generate an HTML dashboard report from existing results file C:/Users/Vijay/Documents/examples/results.jtl and save it to C:/Users/Vijay/Documents/examples/dashboard
```

## Example 9: Validation

```
Validate my JMeter installation and show version information
```

## Example 10: GUI Launch

```
Launch JMeter GUI with test plan C:/Users/Vijay/Documents/examples/basic-test.jmx
```

## Tips for Best Results

1. **Always analyze results** after running tests to get insights
2. **Use HTML reports** for visual dashboards and sharing with team
3. **Start small** with low thread counts and increase gradually
4. **Monitor bottlenecks** and fix issues before scaling up
5. **Use distributed testing** for high-load scenarios
6. **Set properties** for custom configurations
7. **Version control** your test plans (.jmx files)

## Common Patterns

### Pattern 1: Create → Execute → Analyze → Report

```
1. Create test plan
2. Execute test and save results
3. Analyze results for bottlenecks
4. Generate HTML report
```

### Pattern 2: Iterative Testing

```
1. Execute test with low load
2. Analyze results
3. Fix identified issues
4. Execute with higher load
5. Repeat until satisfactory
```

### Pattern 3: Comparison Testing

```
1. Execute baseline test
2. Make system changes
3. Execute new test
4. Compare results from both runs
```

## Environment-Specific Examples

### Windows Paths
```
C:/Users/Vijay/Documents/examples/test.jmx
C:/apache-jmeter-5.6.3
```

### Linux/Mac Paths
```
/home/user/jmeter/tests/test.jmx
/opt/apache-jmeter-5.6.3
```

## Troubleshooting Commands

Check installation:
```
Validate JMeter installation
```

Check properties:
```
Show JMeter properties
```

Check plugins:
```
List installed JMeter plugins
```
