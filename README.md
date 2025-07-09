# Variables Plugin for Obsidian

<div align="center">

![Variables Plugin](https://img.shields.io/badge/Obsidian-Variables-blueviolet?style=for-the-badge&logo=obsidian)
![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Transform your workflow with organized, multi-group variable management**

*Never lose track of your variables again!*

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Usage Guide](#-usage-guide)
- [Multi-Group Management](#-multi-group-management)
- [Commands & Shortcuts](#-commands--shortcuts)
- [Configuration](#-configuration)

- [Contributing](#-contributing)
- [Support](#-support)
- [License](#-license)

## 🎯 Overview

The Variables plugin revolutionizes how you manage variables in Obsidian by introducing **multi-group organization**. Perfect for penetration testers managing different targets, developers handling multiple environments, writers tracking character details, or anyone who needs organized, reusable text substitutions.

### Why Variables Plugin?

- **🏷️ Multi-Group Organization** - Organize variables by context, project, or target
- **🔄 Seamless Switching** - Instantly switch between different variable sets
- **🎨 Intuitive Interface** - Beautiful, user-friendly modals and hover tooltips
- **⚡ Lightning Fast** - Quick insert, auto-detection, hover previews, and instant substitution
- **📦 Template System** - Define templates for new groups
- **🔧 Powerful Operations** - Extract, substitute, preview, and manage with ease

## ✨ Key Features

### 🏗️ **Multi-Group Variable Management**
- **Organize variables into groups** for different contexts (targets, projects, environments)
- **Switch between groups instantly** with dropdown selection
- **Group operations**: Create, rename, delete, and duplicate groups
- **Template system**: Define default variables for new groups
- **Migration safe**: Existing variables automatically migrate to "Default" group

### 🚀 **Smart Variable Operations**
- **`$VariableName` syntax** - Clean, intuitive variable references
- **Auto-detection** - Variables recognized as you type
- **Substitute & Extract** - Replace variables or extract new ones from text
- **Preview mode** - See changes before applying them
- **Import/Export** - Share variable groups via JSON

### 🎨 **Enhanced User Experience**
- **Variable Manager** - Comprehensive group and variable management
- **Quick Insert Modal** - Rapid variable insertion with search
- **Hover Tooltips** - See variable values instantly by hovering over `$variables` in notes
- **Status Bar Integration** - Shows active group and variable count with hover tooltip
- **Empty Variable Highlighting** - Visual indicators for missing values
- **Variable Manager Ribbon Icon** - Easy access to Variable Manager

## 📦 Installation

### From Obsidian Community Plugins (Recommended)

1. Open **Settings** in Obsidian
2. Navigate to **Community Plugins**
3. Disable **Safe Mode** if enabled
4. Click **Browse** and search for "**Variables**"
5. **Install** and **Enable** the plugin

### Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/Real-Fruit-Snacks/obsidian-variables/releases)
2. Extract to your vault's plugins folder: `VaultFolder/.obsidian/plugins/variables/`
3. Reload Obsidian and enable the plugin

## 🚀 Quick Start

### 1. **Access the Variable Manager**
- Click the **Variable Manager ribbon icon** (dollar sign)
- Or use **Command Palette**: "Open Variable Manager"

### 2. **Create Your First Group**
- Click "**New Group**" to create a project-specific group
- Name it (e.g., "Web App Testing", "Client Project", "Research Notes")

### 3. **Add Variables**
- Click "**Add Variable**" in your group
- Use format: `$VariableName` with your desired value
- Example: `$TargetIP` → `192.168.1.100`

### 4. **Use Variables in Notes**
- Write notes using `$VariableName` format
- Example: `$TargetIP`, `$TargetDomain`, `$Username`
- Variables work in any text content

### 5. **Substitute Variables**
- Select text with variables
- Use **Command Palette**: "Substitute Variables in Selection"
- Or substitute entire note: "Substitute All Variables in Note"

## 📚 Usage Guide

### Creating and Managing Groups

**Groups** help you organize variables by context:

- **Penetration Testing**: Different targets or clients
- **Development**: Staging, production, development environments  
- **Writing**: Different stories, characters, or settings
- **Research**: Various projects or datasets

### Variable Syntax

Variables use the `$VariableName` format:
- `$TargetIP` - Target IP address
- `$DatabaseURL` - Database connection string
- `$CharacterName` - Character name in your story
- `$ProjectPath` - File system path

### Template System

**Set up templates** for consistent new groups:
1. Configure your most-used variables in "Edit Template"
2. Or use "Copy Current Group" to use an existing group as template
3. New groups automatically populate with template variables

### Hover Tooltips

**View variable values instantly** without opening the Variable Manager:
- **Hover over variables**: Place your cursor over any `$VariableName` in your notes
- **Instant display**: Variable values appear in a tooltip after a brief delay
- **Status bar tooltips**: Hover over the status bar to see all variables in the active group
- **Works everywhere**: Tooltips work in editor view, reading view, and preview mode

## 🏷️ Multi-Group Management

### Group Operations

| Operation | Description |
|-----------|-------------|
| **Create** | Add new variable groups for different contexts |
| **Switch** | Change active group using dropdown selector |
| **Rename** | Update group names (except "Default") |
| **Delete** | Remove groups (except "Default") |
| **Template** | Set default variables for new groups |

### Example Group Structure

```
📁 Default (5 variables)
📁 Web App Testing (12 variables)
📁 Network Assessment (8 variables)
📁 Client Project Alpha (15 variables)
📁 Research Project (6 variables)
```

### Group-Specific Operations

All variable operations work within the **active group**:
- Add/edit/delete variables
- Import/export group data
- Substitute variables
- Preview changes

## ⌨️ Commands & Shortcuts

### Core Commands

| Command | Description | Access |
|---------|-------------|--------|
| **Open Variable Manager** | Access main interface | Ribbon icon or Command Palette |
| **Quick Insert Variable** | Fast variable insertion | Command Palette |
| **Substitute Selection** | Replace variables in selection | Command Palette |
| **Substitute All in Note** | Replace all variables in note | Command Palette |
| **Extract Variables** | Auto-detect variables from text | Command Palette |
| **Preview Substitution** | Preview changes before applying | Command Palette |

### Variable Manager Features

- **Group selector dropdown** - Switch between groups
- **Add/Edit/Delete** variables with validation
- **Import/Export** group data via JSON
- **Template management** for new groups
- **Search and filter** variables

## ⚙️ Configuration

### Plugin Settings

| Setting | Description | Default |
|---------|-------------|---------|
| **Show Status Bar** | Display active group info with hover tooltip | ✅ Enabled |
| **Hover Tooltips** | Show variable values on hover | ✅ Enabled |
| **Auto-Extract Variables** | Detect variables while typing | ✅ Enabled |
| **Template Variables** | Default variables for new groups | Pre-configured |

### Pre-loaded Variables

The plugin includes common variables for immediate use:

| Variable | Default Value | Use Case |
|----------|---------------|----------|
| `$TargetIP` | `10.0.0.1` | Network/security testing |
| `$TargetDomain` | `example.com` | Web application testing |
| `$LHOST` | `10.0.0.100` | Reverse shell connections |
| `$LPORT` | `4444` | Local port binding |
| `$Username` | `admin` | Authentication |
| `$Password` | `password123` | Authentication |
| `$Wordlist` | `/usr/share/wordlists/rockyou.txt` | Brute force attacks |
| `$OutputDir` | `/output` | File operations |
| `$Interface` | `eth0` | Network interface |
| `$TargetPort` | `80` | Service enumeration |

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### 🐛 **Bug Reports**
- Use our [Issue Template](https://github.com/Real-Fruit-Snacks/obsidian-variables/issues/new?template=bug_report.md)
- Include steps to reproduce, expected vs actual behavior
- Provide your Obsidian version and plugin version

### 💡 **Feature Requests**
- Check [existing requests](https://github.com/Real-Fruit-Snacks/obsidian-variables/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)
- Use our [Feature Request Template](https://github.com/Real-Fruit-Snacks/obsidian-variables/issues/new?template=feature_request.md)
- Explain the use case and expected behavior

### 🔧 **Development**
```bash
# Clone the repository
git clone https://github.com/Real-Fruit-Snacks/obsidian-variables.git
cd obsidian-variables

# Install dependencies
npm install

# Start development mode
npm run dev

# Build for production
npm run build
```

## 📞 Support

### 📚 **Documentation**
- [GitHub Wiki](https://github.com/Real-Fruit-Snacks/obsidian-variables/wiki)
- [FAQ](https://github.com/Real-Fruit-Snacks/obsidian-variables/wiki/FAQ)

### 💬 **Community**
- [GitHub Discussions](https://github.com/Real-Fruit-Snacks/obsidian-variables/discussions)
- [GitHub Issues](https://github.com/Real-Fruit-Snacks/obsidian-variables/issues)

### 🔗 **Links**
- **Repository**: [GitHub](https://github.com/Real-Fruit-Snacks/obsidian-variables)
- **Releases**: [GitHub Releases](https://github.com/Real-Fruit-Snacks/obsidian-variables/releases)
- **License**: [MIT License](LICENSE)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ for the Obsidian community**

*Transform your workflow with organized, multi-group variable management*

</div> 