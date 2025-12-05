# Quick Start Guide - JMeter MCP Server (TypeScript)

## 🚀 Get Started in 5 Minutes

### Step 1: Prerequisites Check

Make sure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ JMeter installed (download from [jmeter.apache.org](https://jmeter.apache.org/))
- ✅ npm or yarn package manager

### Step 2: Install Dependencies

Open terminal in the project directory:

```bash
npm install
```

### Step 3: Configure JMeter Path

Create `.env` file:

```bash
# Windows
JMETER_HOME=C:/apache-jmeter-5.6.3

# Linux/Mac
JMETER_HOME=/opt/apache-jmeter-5.6.3
```

### Step 4: Build the Project

```bash
npm run build
```

You should see a `dist/` folder created with compiled JavaScript.

### Step 5: Configure Claude Desktop

#### Windows

1. Open: `%APPDATA%\Claude\claude_desktop_config.json`
2. Add this configuration:

```json
{
  "mcpServers": {
    "jmeter": {
      "command": "node",
      "args": [
        "C:/Users/Vijay/Documents/jmeter-mcp-server-ts/dist/index.js"
      ],
      "env": {
        "JMETER_HOME": "C:/apache-jmeter-5.6.3"
      }
    }
  }
}
```

#### macOS

1. Open: `~/Library/Application Support/Claude/claude_desktop_config.json`
2. Add:

```json
{
  "mcpServers": {
    "jmeter": {
      "command": "node",
      "args": [
        "/Users/yourusername/jmeter-mcp-server-ts/dist/index.js"
      ],
      "env": {
        "JMETER_HOME": "/opt/apache-jmeter-5.6.3"
      }
    }
  }
}
```

#### Linux

1. Open: `~/.config/Claude/claude_desktop_config.json`
2. Add:

```json
{
  "mcpServers": {
    "jmeter": {
      "command": "node",
      "args": [
        "/home/yourusername/jmeter-mcp-server-ts/dist/index.js"
      ],
      "env": {
        "JMETER_HOME": "/opt/apache-jmeter-5.6.3"
      }
    }
  }
}
```

### Step 6: Restart Claude Desktop

Close and reopen Claude Desktop completely.

### Step 7: Test It!

In Claude, try:

```
Validate my JMeter installation
```

You should see JMeter version and installation details!

## 🎯 Your First Test

### 1. Create a Test Plan

Ask Claude:

```
Create a JMeter test plan named "My First Test" to test https://jsonplaceholder.typicode.com/posts with 5 threads, 3 second ramp-up, and 30 second duration. Save it to C:/Users/Vijay/Documents/my-first-test.jmx
```

### 2. Execute the Test

```
Execute JMeter test from C:/Users/Vijay/Documents/my-first-test.jmx and save results to C:/Users/Vijay/Documents/results.jtl
```

### 3. Analyze Results

```
Analyze JMeter results from C:/Users/Vijay/Documents/results.jtl
```

### 4. Generate Report

```
Generate HTML report from C:/Users/Vijay/Documents/results.jtl to C:/Users/Vijay/Documents/report
```

## 🔧 Common Issues

### Issue: "JMETER_HOME not set"

**Solution**: Check your `.env` file and Claude config both have correct `JMETER_HOME` path.

### Issue: "JMeter not found"

**Solution**: 
1. Verify JMeter is installed: `C:/apache-jmeter-5.6.3/bin/jmeter.bat` (Windows)
2. Make sure the path in `JMETER_HOME` is correct
3. On Linux/Mac, make jmeter executable: `chmod +x /path/to/jmeter/bin/jmeter`

### Issue: "Module not found"

**Solution**: 
```bash
rm -rf node_modules
npm install
npm run build
```

### Issue: Claude doesn't see the tools

**Solution**:
1. Check the paths in `claude_desktop_config.json` are absolute paths
2. Make sure you restarted Claude Desktop completely
3. Check Claude Desktop logs for errors

### Issue: Build errors

**Solution**:
```bash
npm run clean
npm install
npm run build
```

## 📁 Recommended Directory Structure

```
C:/Users/Vijay/Documents/
├── jmeter-mcp-server-ts/     # The MCP server
├── jmeter-tests/              # Your test plans
│   ├── test1.jmx
│   └── test2.jmx
├── jmeter-results/            # Test results
│   ├── results1.jtl
│   └── results2.jtl
└── jmeter-reports/            # HTML reports
    ├── report1/
    └── report2/
```

## 🎓 Next Steps

1. **Read the full README**: Learn about all available tools
2. **Check examples**: See `examples/USAGE_EXAMPLES.md` for more scenarios
3. **Explore advanced features**: Distributed testing, custom properties, etc.
4. **Share feedback**: Report issues or suggestions on GitHub

## 💡 Pro Tips

1. **Use absolute paths** in Claude commands for reliability
2. **Start with small tests** (few threads, short duration) to verify setup
3. **Always analyze results** to get valuable insights
4. **Generate HTML reports** for visual analysis and sharing
5. **Save your test plans** in version control (Git)

## 🆘 Need Help?

- Check the [README.md](README.md) for detailed documentation
- See [USAGE_EXAMPLES.md](examples/USAGE_EXAMPLES.md) for more examples
- Check [CHANGELOG.md](CHANGELOG.md) for version history
- Report issues on GitHub

## ✅ Verification Checklist

Before asking for help, verify:

- [ ] Node.js 18+ is installed
- [ ] JMeter is installed and accessible
- [ ] `npm install` completed successfully
- [ ] `npm run build` completed successfully
- [ ] `.env` file has correct `JMETER_HOME`
- [ ] Claude config has correct absolute paths
- [ ] Claude Desktop was completely restarted
- [ ] JMeter validation command works

---

**Ready to start performance testing with AI assistance!** 🚀
