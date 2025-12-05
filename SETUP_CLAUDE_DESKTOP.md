# 🚀 Claude Desktop Integration Setup

## Prerequisites
- ✅ Claude Desktop installed ([Download here](https://claude.ai/download))
- ✅ Node.js 18+ installed
- ✅ Apache JMeter installed and accessible
- ✅ JMeter MCP Server built (already done!)

## Step 1: Locate Claude Desktop Config File

### On Windows:
Navigate to:
```
%APPDATA%\Claude\claude.json
```

Or in Explorer:
```
C:\Users\<YourUsername>\AppData\Roaming\Claude\claude.json
```

### If it doesn't exist, create it.

## Step 2: Update JMeter Home Path (IMPORTANT!)

Before using, verify your JMeter installation path. Edit `claude_desktop_config.json` in this folder:

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

⚠️ **Update `JMETER_HOME`** to your actual JMeter installation path!

Common locations:
- `C:/Program Files/apache-jmeter-5.6.3`
- `C:/apache-jmeter-5.6.3`
- `C:/tools/jmeter`

To find it:
```powershell
jmeter --version
# Note the path shown
```

## Step 3: Add to Claude Desktop Config

Copy the entire JSON content and paste it into `%APPDATA%\Claude\claude.json`:

```json
{
  "mcpServers": {
    "jmeter": {
      "command": "node",
      "args": [
        "C:/Users/Vijay/Documents/jmeter-mcp-server-ts/dist/index.js"
      ],
      "env": {
        "JMETER_HOME": "C:/path/to/your/jmeter"
      }
    }
  }
}
```

## Step 4: Restart Claude Desktop

Close and reopen Claude Desktop completely.

## Step 5: Verify Installation

In Claude, you should see a notification about the JMeter MCP server connecting. You can now ask Claude things like:

- "Validate my JMeter installation"
- "Run a load test on my API"
- "Create a test plan for my REST endpoints"
- "Analyze these JMeter results"
- "Generate an HTML report"

## Troubleshooting

### MCP Server not connecting?
1. Check that Node.js is in PATH: `node --version`
2. Verify JMETER_HOME path is correct
3. Check Claude Desktop logs: `%APPDATA%\Claude\logs\`
4. Try restarting Claude Desktop

### JMeter not found?
1. Verify JMeter is installed: `jmeter --version`
2. Update JMETER_HOME in config
3. Ensure it's the correct path with forward slashes `/` not backslashes `\`

### Port conflicts?
The MCP server uses stdin/stdout, no specific port needed. If issues persist, check other Node processes.

## Advanced Usage

### Watch Mode Development
In VS Code terminal:
```powershell
npm run watch
```
This auto-recompiles TypeScript on file changes.

### Manual Testing
```powershell
npm run dev
# This builds and starts the server
```

---

**Questions?** Check:
- `README.md` - Full documentation
- `examples/USAGE_EXAMPLES.md` - Usage examples
- `PROJECT_SUMMARY.md` - Feature details
