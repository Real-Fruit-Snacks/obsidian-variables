# Obsidian Variables Plugin

A powerful plugin for Obsidian that helps you manage and substitute variables in your notes and commands.

## 🚀 Features

- **Variable Management**: Easy-to-use modal for creating and managing variables
- **Quick Substitution**: Replace variables in selected text or entire notes
- **Auto-extraction**: Automatically detect and create variables while typing
- **Variable Preview**: Preview substitutions before applying them
- **Quick Insert**: Fast variable insertion with search and filtering
- **Import/Export**: Share variable definitions via clipboard
- **Pre-loaded Variables**: Comes with common variables ready to use
- **Status Bar Integration**: Track your variable count at a glance

## 📦 Installation

### From Obsidian Community Plugins

1. Open Obsidian Settings
2. Go to Community Plugins
3. Disable Safe Mode if needed
4. Browse Community Plugins
5. Search for "Variables"
6. Install and enable the plugin

### Pre-loaded Variables
The plugin comes with these common variables:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `$TargetIP` | `10.0.0.1` | Target IP address |
| `$TargetDomain` | `example.com` | Target domain name |
| `$LHOST` | `10.0.0.100` | Local host IP |
| `$LPORT` | `4444` | Local port number |
| `$Interface` | `eth0` | Network interface |
| `$OutputDir` | `/output` | Output directory path |
| `$Password` | `password123` | Password field |
| `$Username` | `admin` | Username field |
| `$Wordlist` | `/usr/share/wordlists/rockyou.txt` | Wordlist file path |
| `$TargetPort` | `80` | Target port number |

## 🎯 Usage Examples

### Command Templates

```bash
# Network scanning
nmap -sV $TargetIP

# Web application testing
gobuster dir -u http://$TargetDomain -w $Wordlist

# Remote connection
ssh $Username@$TargetIP

# File operations
cp $OutputDir/*.txt /backup/
```

### Basic Workflow

1. **Write your notes** with variable placeholders using `$VariableName` format
2. **Set variable values** using the Variables Manager (ribbon icon or command palette)
3. **Substitute variables** using commands or keyboard shortcuts
4. **Preview changes** before applying them

## ⌨️ Commands

- **Manage Variables**: Open the variables management modal
- **Substitute Variables in Selection**: Replace variables in selected text
- **Substitute All Variables in Note**: Replace all variables in the current note
- **Extract Variables from Selection**: Auto-detect and add new variables
- **Quick Insert Variable**: Fast variable insertion with search
- **Preview Variable Substitution**: Preview before applying changes

## 🛠️ Manual Installation

1. Download the latest release
2. Extract to your vault's plugins folder:
   ```
   /path/to/obsidian/vault/.obsidian/plugins/variables/
   ```
3. Reload Obsidian
4. Enable the plugin in Community Plugins settings

### Development Installation

```bash
git clone https://github.com/Real-Fruit-Snacks/obsidian-variables
cd obsidian-variables
npm install
npm run build
```

Copy the built files to your plugins directory:

```
variables/
├── main.js
├── manifest.json
└── styles.css
```

## ⚙️ Settings

- **Auto-extract variables**: Automatically detect new variables while typing
- **Show variable count**: Display variable count in the status bar
- **Reset to defaults**: Restore default variable set
- **Import/Export**: Manage variable definitions via JSON

### 1. Command Templates

Create reusable command templates with variables:

```markdown
## Server Setup Commands

### Initial Reconnaissance
```bash
nmap -sC -sV $TargetIP
```

### Service Enumeration  
```bash
gobuster dir -u http://$TargetDomain -w $Wordlist -x php,html,txt
```

### Database Connection
```bash
mysql -h $TargetIP -u $Username -p$Password
```
```

This allows you to quickly update all your commands by changing variable values instead of manually editing each occurrence.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Repository**: [GitHub](https://github.com/Real-Fruit-Snacks/obsidian-variables)
- **Issues**: [GitHub Issues](https://github.com/Real-Fruit-Snacks/obsidian-variables/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Real-Fruit-Snacks/obsidian-variables/discussions)

## 🔒 Security Note

This plugin is designed to help manage variables and command templates in your notes and workflows. 