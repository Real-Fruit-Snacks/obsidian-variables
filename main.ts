import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface VariableData {
	[key: string]: string;
}

interface VariablesSettings {
	variableGroups: { [groupName: string]: VariableData };
	activeGroup: string;
	autoExtract: boolean;
	showVariableCount: boolean;
	newGroupTemplate: VariableData;
}

const DEFAULT_SETTINGS: VariablesSettings = {
	variableGroups: {
		'Default': {
			'TargetIP': '10.0.0.1',
			'TargetDomain': 'example.com',
			'TargetPort': '80',
			'Username': 'admin',
			'Password': 'password123',
			'Wordlist': '/usr/share/wordlists/rockyou.txt',
			'LHOST': '10.0.0.100',
			'LPORT': '4444',
			'OutputDir': './output',
			'Interface': 'eth0'
		}
	},
	activeGroup: 'Default',
	autoExtract: true,
	showVariableCount: true,
	newGroupTemplate: {
		'TargetIP': '',
		'TargetDomain': '',
		'TargetPort': '',
		'Username': '',
		'Password': '',
		'LHOST': '',
		'LPORT': '',
		'OutputDir': '',
		'Interface': ''
	}
}

// Embedded CSS to ensure it's always loaded
const PLUGIN_CSS = `
/* SIMPLE MODAL - NO HORIZONTAL SCROLL */
.modal.variables-modal {
    width: 900px !important;
    max-width: 85vw !important;
}

.variables-modal {
    width: 100% !important;
    max-width: 100% !important;
    max-height: 85vh;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 20px;
    box-sizing: border-box;
}

.modal-container.variables-modal {
    width: 900px !important;
    max-width: 85vw !important;
}

.modal.mod-dim .modal-container.variables-modal {
    width: 900px !important;
    max-width: 85vw !important;
}

.variables-modal h2 {
    margin-bottom: 20px;
    color: var(--text-accent);
    border-bottom: 1px solid var(--background-modifier-border);
    padding-bottom: 10px;
}

/* ADD SECTION */
.variable-add-section {
    margin-bottom: 20px;
    padding: 12px;
    background: var(--background-secondary);
    border-radius: 8px;
    border: 1px solid var(--background-modifier-border);
}

.variable-add-section h3 {
    margin: 0 0 16px 0;
    color: var(--text-accent);
}

.add-row {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}

.add-row input {
    flex: 1;
    padding: 8px;
    border: 1px solid var(--background-modifier-border);
    border-radius: 4px;
    background: var(--background-primary);
    color: var(--text-normal);
    font-family: var(--font-monospace);
    font-size: 13px;
    min-width: 0;
}

.add-row button {
    padding: 8px 16px;
    background: var(--interactive-accent);
    color: var(--text-on-accent);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    font-size: 13px;
    flex-shrink: 0;
    white-space: nowrap;
}

.add-row button:hover {
    background: var(--interactive-accent-hover);
}

/* VARIABLES SECTION */
.variables-section h3 {
    margin: 0 0 16px 0;
    color: var(--text-accent);
}

.variables-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.variables-actions {
    display: flex;
    gap: 8px;
}

.variables-actions button {
    padding: 6px 12px;
    border: 1px solid var(--background-modifier-border);
    border-radius: 4px;
    background: var(--background-primary);
    color: var(--text-normal);
    cursor: pointer;
    font-size: 12px;
}

.variables-actions button:hover {
    background: var(--background-modifier-hover);
}

/* VARIABLES LIST */
.variables-list {
    background: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 6px;
    overflow: visible;
    display: flex;
    flex-direction: column;
    min-height: fit-content;
}

.variable-row {
    display: flex;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid var(--background-modifier-border);
    gap: 12px;
}

.variable-row:last-child {
    border-bottom: none;
}

.variable-row:hover {
    background: var(--background-modifier-hover);
}

.var-name-display {
    font-family: var(--font-monospace);
    font-weight: bold;
    color: var(--text-accent);
    background: var(--code-background);
    padding: 4px 8px;
    border-radius: 3px;
    font-size: 12px;
    min-width: 90px;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-shrink: 0;
}

.var-value-input {
    flex: 1;
    padding: 6px 10px;
    border: 1px solid var(--background-modifier-border);
    border-radius: 4px;
    background: var(--background-primary);
    color: var(--text-normal);
    font-family: var(--font-monospace);
    font-size: 13px;
    min-width: 0;
    width: 1px; /* Force flex sizing */
}

.var-value-input:focus {
    border-color: var(--interactive-accent);
    outline: none;
}

.var-value-input.empty {
    background: var(--background-modifier-error-rgb);
    border-color: var(--text-error);
    color: var(--text-normal);
}

.var-value-input.empty::placeholder {
    color: var(--text-error);
    font-style: italic;
    font-weight: 500;
}

.var-value-input.empty:focus {
    border-color: var(--interactive-accent);
    background: var(--background-primary);
}

.var-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
}

.var-btn {
    padding: 4px 8px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 500;
    border: none;
    min-width: 45px;
}

.var-copy-btn {
    background: var(--interactive-normal);
    color: var(--text-normal);
}

.var-copy-btn:hover {
    background: var(--interactive-hover);
}

.var-delete-btn {
    background: var(--text-error);
    color: white;
}

.var-delete-btn:hover {
    opacity: 0.8;
}

/* QUICK INSERT MODAL */
.modal.quick-insert-modal {
    width: 600px !important;
    max-width: 80vw !important;
}

.quick-insert-modal {
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: hidden;
}

.modal-container.quick-insert-modal {
    width: 600px !important;
    max-width: 80vw !important;
}

.modal.mod-dim .modal-container.quick-insert-modal {
    width: 600px !important;
    max-width: 80vw !important;
}

.quick-insert-modal h3 {
    margin: 0 0 16px 0;
    color: var(--text-accent);
}

.quick-search {
    width: 100%;
    padding: 10px;
    margin-bottom: 16px;
    border: 1px solid var(--background-modifier-border);
    border-radius: 4px;
    background: var(--background-primary);
    color: var(--text-normal);
    box-sizing: border-box;
}

.quick-list {
    max-height: 300px;
    overflow-y: auto;
    overflow-x: hidden;
    border: 1px solid var(--background-modifier-border);
    border-radius: 4px;
    background: var(--background-primary);
}

.quick-item {
    padding: 10px;
    cursor: pointer;
    border-bottom: 1px solid var(--background-modifier-border);
}

.quick-item:last-child {
    border-bottom: none;
}

.quick-item:hover {
    background: var(--background-modifier-hover);
}

.quick-name {
    font-family: var(--font-monospace);
    font-weight: bold;
    color: var(--text-accent);
    margin-bottom: 4px;
}

.quick-value {
    font-family: var(--font-monospace);
    color: var(--text-muted);
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* PREVIEW MODAL */
.modal.preview-modal {
    width: 1200px !important;
    max-width: 90vw !important;
    max-height: 80vh;
}

.preview-modal {
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: hidden;
    padding: 24px;
}

.modal-container.preview-modal {
    width: 1200px !important;
    max-width: 90vw !important;
}

.modal.mod-dim .modal-container.preview-modal {
    width: 1200px !important;
    max-width: 90vw !important;
}

.preview-modal h2 {
    margin-bottom: 20px;
    color: var(--text-accent);
    border-bottom: 1px solid var(--background-modifier-border);
    padding-bottom: 10px;
}

.preview-info {
    margin-bottom: 16px;
    padding: 12px;
    background: var(--background-secondary);
    border-radius: 6px;
    border-left: 3px solid var(--interactive-accent);
}

.preview-info-text {
    color: var(--text-muted);
    font-size: 14px;
    margin: 0;
}

.preview-content {
    margin-bottom: 20px;
}

.preview-label {
    font-weight: 600;
    color: var(--text-accent);
    margin-bottom: 8px;
    font-size: 14px;
}

.preview-result {
    background: var(--code-background);
    border: 1px solid var(--background-modifier-border);
    border-radius: 6px;
    padding: 16px;
    font-family: var(--font-monospace);
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
    overflow-y: auto;
    max-height: 400px;
    color: var(--text-normal);
    width: 100%;
    box-sizing: border-box;
}

.preview-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding-top: 16px;
    border-top: 1px solid var(--background-modifier-border);
}

.preview-btn {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    border: none;
}

.preview-btn-primary {
    background: var(--interactive-accent);
    color: var(--text-on-accent);
}

.preview-btn-primary:hover {
    background: var(--interactive-accent-hover);
}

.preview-btn-secondary {
    background: var(--background-primary);
    color: var(--text-normal);
    border: 1px solid var(--background-modifier-border);
}

.preview-btn-secondary:hover {
    background: var(--background-modifier-hover);
}

/* RESPONSIVE */
@media (max-width: 550px) {
    .variables-modal {
        width: 95vw;
    }
    
    .variable-row {
        flex-direction: column;
        align-items: stretch;
        gap: 6px;
        padding: 10px 8px;
    }
    
    .var-name-display {
        max-width: none;
        text-align: center;
        min-width: auto;
    }
    
    .add-row {
        flex-direction: column;
        gap: 8px;
    }
    
    .variables-header {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
    }
    
    .var-actions {
        justify-content: center;
    }
}

@media (max-width: 520px) {
    .add-row {
        flex-direction: column;
        gap: 8px;
    }
    
    .add-row button {
        align-self: stretch;
    }
}

/* CLICKABLE STATUS BAR */
.clickable-status-item {
    cursor: pointer !important;
    transition: opacity 0.2s ease;
    user-select: none;
    position: relative;
    padding-right: 18px !important;
}

.clickable-status-item:hover {
    opacity: 0.8;
}

.clickable-status-item::after {
    content: '';
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 3px solid transparent;
    border-right: 3px solid transparent;
    border-top: 3px solid var(--text-muted);
    opacity: 0.5;
    pointer-events: none;
}

.clickable-status-item:hover::after {
    opacity: 0.8;
}

/* VARIABLE HOVER TOOLTIPS */
.variable-tooltip {
    position: fixed;
    z-index: 10000;
    background: var(--background-primary);
    color: var(--text-normal);
    border: 1px solid var(--background-modifier-border);
    border-radius: 6px;
    padding: 8px 12px;
    font-family: var(--font-monospace);
    font-size: 12px;
    line-height: 1.4;
    max-width: 300px;
    word-wrap: break-word;
    box-shadow: var(--shadow-s);
    transition: opacity 0.2s ease;
}

.variable-tooltip:hover {
    box-shadow: var(--shadow-l);
    transform: translateY(-1px);
}

.variable-tooltip-header {
    font-weight: bold;
    color: var(--text-accent);
    margin-bottom: 4px;
}

.variable-tooltip-value {
    color: var(--text-normal);
    white-space: pre-wrap;
}

.variable-tooltip-empty {
    color: var(--text-error);
    font-style: italic;
}

.variable-tooltip-group {
    color: var(--text-muted);
    font-size: 10px;
    margin-top: 4px;
    padding-top: 4px;
    border-top: 1px solid var(--background-modifier-border);
}

/* STATUS BAR TOOLTIP */
.status-bar-tooltip {
    min-width: 320px;
    max-width: 450px;
    max-height: 400px;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 12px 16px;
    line-height: 1.4;
    scroll-behavior: smooth;
}

.status-bar-tooltip::-webkit-scrollbar {
    width: 8px;
}

.status-bar-tooltip::-webkit-scrollbar-track {
    background: var(--background-secondary);
    border-radius: 4px;
}

.status-bar-tooltip::-webkit-scrollbar-thumb {
    background: var(--background-modifier-border);
    border-radius: 4px;
}

.status-bar-tooltip::-webkit-scrollbar-thumb:hover {
    background: var(--text-muted);
}

.status-bar-tooltip .variable-tooltip-header {
    font-size: 14px;
    font-weight: bold;
    color: var(--text-accent);
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--background-modifier-border);
}

.status-bar-var-item {
    display: grid;
    grid-template-columns: minmax(90px, auto) 1fr;
    gap: 12px;
    margin-bottom: 8px;
    padding: 6px 0;
    align-items: center;
    border-bottom: 1px solid var(--background-modifier-border-hover);
}

.status-bar-var-item:last-of-type {
    border-bottom: none;
    margin-bottom: 0;
}

.status-bar-var-item .variable-tooltip-header {
    font-family: var(--font-monospace);
    font-weight: bold;
    font-size: 12px;
    color: var(--text-accent);
    background: var(--code-background);
    padding: 3px 6px;
    border-radius: 3px;
    margin: 0;
    border-bottom: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.status-bar-var-item .variable-tooltip-value {
    font-family: var(--font-monospace);
    font-size: 12px;
    color: var(--text-normal);
    word-break: break-word;
    padding: 3px 6px;
    background: var(--background-secondary);
    border-radius: 3px;
}

.status-bar-var-item .variable-tooltip-empty {
    font-family: var(--font-monospace);
    font-size: 12px;
    color: var(--text-error);
    font-style: italic;
    font-weight: 500;
    padding: 3px 6px;
    background: var(--background-modifier-error-rgb);
    border-radius: 3px;
}

.status-bar-tooltip .variable-tooltip-group {
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px solid var(--background-modifier-border);
    font-size: 11px;
    color: var(--text-muted);
    text-align: center;
    font-weight: 500;
}

/* GROUP MANAGEMENT */
.group-section {
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid var(--background-modifier-border);
    border-radius: 6px;
    background: var(--background-secondary);
}

.group-row {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    min-height: 50px;
}

.variables-modal .group-selector {
    width: 300px !important;
    min-width: 300px !important;
    max-width: none !important;
    padding: 10px 12px !important;
    border: 1px solid var(--background-modifier-border) !important;
    border-radius: 4px !important;
    background: var(--background-primary) !important;
    color: var(--text-normal) !important;
    font-size: 14px !important;
    font-family: var(--font-ui) !important;
    line-height: 1.5 !important;
    height: 40px !important;
    appearance: auto !important;
    flex: none !important;
    box-sizing: border-box !important;
}

.variables-modal .group-selector option {
    background: var(--background-primary) !important;
    color: var(--text-normal) !important;
    padding: 6px 8px !important;
    font-size: 14px !important;
}

.group-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.group-btn {
    padding: 8px 12px;
    border: 1px solid var(--interactive-accent);
    background: var(--interactive-accent);
    color: var(--text-on-accent);
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s ease;
}

.group-btn:hover {
    background: var(--interactive-accent-hover);
    border-color: var(--interactive-accent-hover);
}

.group-btn-danger {
    background: var(--text-error);
    border-color: var(--text-error);
}

.group-btn-danger:hover {
    background: #ff6b6b;
    border-color: #ff6b6b;
}

@media (max-width: 700px) {
    .group-row {
        flex-direction: column;
        align-items: stretch;
    }
    
    .variables-modal .group-selector {
        width: 100% !important;
        min-width: 100% !important;
        max-width: 100% !important;
    }
    
    .group-actions {
        justify-content: center;
    }
}

/* GROUP NAME MODAL */
.group-name-modal {
    max-width: 450px;
    padding: 20px;
}

.group-name-modal h2 {
    margin: 0 0 12px 0;
    color: var(--text-accent);
    font-size: 18px;
}

.group-name-modal p {
    margin: 0 0 20px 0;
    color: var(--text-muted);
    font-size: 14px;
}

.input-container {
    margin-bottom: 20px;
}

.group-name-modal input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--background-modifier-border);
    border-radius: 4px;
    background: var(--background-primary);
    color: var(--text-normal);
    font-size: 14px;
    font-family: var(--font-ui);
    box-sizing: border-box;
}

.group-name-modal input:focus {
    border-color: var(--interactive-accent);
    outline: none;
}

.button-container {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.group-name-modal button {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    border: none;
    min-width: 70px;
}

.submit-btn {
    background: var(--interactive-accent);
    color: var(--text-on-accent);
}

.submit-btn:hover {
    background: var(--interactive-accent-hover);
}

.cancel-btn {
    background: var(--background-primary);
    color: var(--text-normal);
    border: 1px solid var(--background-modifier-border);
}

.cancel-btn:hover {
    background: var(--background-modifier-hover);
}

/* CONFIRM DELETE MODAL */
.confirm-delete-modal {
    max-width: 450px;
    padding: 20px;
}

.confirm-delete-modal h2 {
    margin: 0 0 12px 0;
    color: var(--text-error);
    font-size: 18px;
}

.confirm-delete-modal p {
    margin: 0 0 20px 0;
    color: var(--text-normal);
    font-size: 14px;
    line-height: 1.4;
}

.delete-btn {
    background: var(--text-error);
    color: white;
}

.delete-btn:hover {
    background: #ff6b6b;
}

/* TEMPLATE MODAL */
.template-modal {
    width: 100% !important;
    max-width: 100% !important;
    max-height: 85vh;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 20px;
    box-sizing: border-box;
}

.modal.template-modal {
    width: 800px !important;
    max-width: 85vw !important;
}

.modal-container.template-modal {
    width: 800px !important;
    max-width: 85vw !important;
}

.template-description {
    color: var(--text-muted);
    font-size: 14px;
    margin-bottom: 20px;
}

.template-add-section {
    margin-bottom: 20px;
    padding: 12px;
    background: var(--background-secondary);
    border-radius: 8px;
    border: 1px solid var(--background-modifier-border);
}

.template-add-section h3 {
    margin: 0 0 16px 0;
    color: var(--text-accent);
}

.template-variables-section h3 {
    margin: 0 0 16px 0;
    color: var(--text-accent);
}

.template-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.template-actions {
    display: flex;
    gap: 8px;
}

.template-actions button {
    padding: 6px 12px;
    border: 1px solid var(--background-modifier-border);
    border-radius: 4px;
    background: var(--background-primary);
    color: var(--text-normal);
    cursor: pointer;
    font-size: 12px;
}

.template-actions button:hover {
    background: var(--background-modifier-hover);
}

.template-variables-list {
    background: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 6px;
    overflow: visible;
    display: flex;
    flex-direction: column;
    min-height: fit-content;
    margin-bottom: 20px;
}

.template-row {
    display: flex;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid var(--background-modifier-border);
    gap: 12px;
}

.template-row:last-child {
    border-bottom: none;
}

.template-row:hover {
    background: var(--background-modifier-hover);
}

.template-var-name {
    font-family: var(--font-monospace);
    font-weight: bold;
    color: var(--text-accent);
    background: var(--code-background);
    padding: 4px 8px;
    border-radius: 3px;
    font-size: 12px;
    min-width: 90px;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-shrink: 0;
}

.template-var-value {
    flex: 1;
    padding: 6px 10px;
    border: 1px solid var(--background-modifier-border);
    border-radius: 4px;
    background: var(--background-primary);
    color: var(--text-normal);
    font-family: var(--font-monospace);
    font-size: 13px;
    min-width: 0;
}

.template-var-value:focus {
    border-color: var(--interactive-accent);
    outline: none;
}

.template-delete-btn {
    padding: 4px 8px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 500;
    border: none;
    min-width: 60px;
    background: var(--text-error);
    color: white;
}

.template-delete-btn:hover {
    opacity: 0.8;
}

.template-empty {
    padding: 20px;
    text-align: center;
    color: var(--text-muted);
    font-style: italic;
}

.template-action-section {
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
    border-top: 1px solid var(--background-modifier-border);
}

.template-save-btn {
    padding: 8px 16px;
    background: var(--interactive-accent);
    color: var(--text-on-accent);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    font-size: 13px;
}

.template-save-btn:hover {
    background: var(--interactive-accent-hover);
}

@media (max-width: 600px) {
    .template-row {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
    }
    
    .template-var-name {
        max-width: none;
        text-align: center;
    }
    
    .template-header {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
    }
}
`;

export default class VariablesPlugin extends Plugin {
	settings: VariablesSettings;
	statusBarItem: HTMLElement;

	// Helper methods for group management
	getCurrentVariables(): VariableData {
		if (!this.settings.variableGroups[this.settings.activeGroup]) {
			// Create default group if it doesn't exist
			this.settings.variableGroups[this.settings.activeGroup] = {};
		}
		return this.settings.variableGroups[this.settings.activeGroup];
	}

	setCurrentVariable(name: string, value: string): void {
		if (!this.settings.variableGroups[this.settings.activeGroup]) {
			this.settings.variableGroups[this.settings.activeGroup] = {};
		}
		this.settings.variableGroups[this.settings.activeGroup][name] = value;
	}

	deleteCurrentVariable(name: string): void {
		if (this.settings.variableGroups[this.settings.activeGroup]) {
			delete this.settings.variableGroups[this.settings.activeGroup][name];
		}
	}

	createGroup(groupName: string): boolean {
		if (this.settings.variableGroups[groupName]) {
			return false; // Group already exists
		}
		// Create new group with template variables
		this.settings.variableGroups[groupName] = { ...this.settings.newGroupTemplate };
		return true;
	}

	deleteGroup(groupName: string): boolean {
		if (groupName === 'Default') {
			return false; // Cannot delete default group
		}
		if (!this.settings.variableGroups[groupName]) {
			return false; // Group doesn't exist
		}
		delete this.settings.variableGroups[groupName];
		// Switch to Default if we deleted the active group
		if (this.settings.activeGroup === groupName) {
			this.settings.activeGroup = 'Default';
		}
		return true;
	}

	renameGroup(oldName: string, newName: string): boolean {
		if (oldName === 'Default' || newName === 'Default') {
			return false; // Cannot rename from/to Default
		}
		if (!this.settings.variableGroups[oldName] || this.settings.variableGroups[newName]) {
			return false; // Old group doesn't exist or new name already exists
		}
		this.settings.variableGroups[newName] = this.settings.variableGroups[oldName];
		delete this.settings.variableGroups[oldName];
		if (this.settings.activeGroup === oldName) {
			this.settings.activeGroup = newName;
		}
		return true;
	}

	switchToGroup(groupName: string): boolean {
		if (!this.settings.variableGroups[groupName]) {
			return false; // Group doesn't exist
		}
		this.settings.activeGroup = groupName;
		return true;
	}

	getGroupNames(): string[] {
		return Object.keys(this.settings.variableGroups).sort();
	}

	cycleToNextGroup(): boolean {
		const groups = this.getGroupNames();
		if (groups.length <= 1) {
			return false; // No groups to cycle through
		}
		
		const currentIndex = groups.indexOf(this.settings.activeGroup);
		const nextIndex = (currentIndex + 1) % groups.length;
		const nextGroup = groups[nextIndex];
		
		if (this.switchToGroup(nextGroup)) {
			this.saveSettings();
			this.updateStatusBar();
			return true;
		}
		return false;
	}

	async onload() {
		await this.loadSettings();

		// Inject CSS styles to ensure they're loaded
		this.injectCSS();

		// Add ribbon icon
		this.addRibbonIcon('dollar-sign', 'Variable Manager', () => {
			new VariableManagerModal(this.app, this).open();
		});

		// Commands
		this.addCommand({
			id: 'open-variable-manager',
			name: 'Open Variable Manager',
			callback: () => new VariableManagerModal(this.app, this).open()
		});

		this.addCommand({
			id: 'substitute-variables',
			name: 'Substitute Variables in Selection/Line',
			editorCallback: (editor: Editor) => this.substituteVariables(editor)
		});

		this.addCommand({
			id: 'substitute-all-variables',
			name: 'Substitute All Variables in File',
			editorCallback: (editor: Editor) => this.substituteAllVariables(editor)
		});

		this.addCommand({
			id: 'extract-variables',
			name: 'Extract Variables from Selection/Line',
			editorCallback: (editor: Editor) => this.extractVariables(editor)
		});

		this.addCommand({
			id: 'quick-insert-variable',
			name: 'Quick Insert Variable',
			editorCallback: (editor: Editor) => new QuickInsertModal(this.app, this, editor).open()
		});

		this.addCommand({
			id: 'preview-variables',
			name: 'Preview Variable Substitutions',
			editorCallback: (editor: Editor) => this.previewVariables(editor)
		});

		this.addCommand({
			id: 'cycle-variable-group',
			name: 'Cycle to Next Variable Group',
			callback: () => {
				if (this.cycleToNextGroup()) {
					const groups = this.getGroupNames();
					if (groups.length > 1) {
						new Notice(`Switched to group: ${this.settings.activeGroup}`);
					}
				} else {
					new Notice('No other groups to cycle to');
				}
			}
		});

		// Settings tab
		this.addSettingTab(new VariablesSettingTab(this.app, this));

		// Status bar
		if (this.settings.showVariableCount) {
			this.statusBarItem = this.addStatusBarItem();
			this.statusBarItem.addClass('clickable-status-item');
			this.statusBarItem.title = 'Left-click: Variable Manager • Right-click: Cycle groups • Hover: Show all variables';
			this.statusBarItem.onclick = () => {
				new VariableManagerModal(this.app, this).open();
			};
			this.statusBarItem.oncontextmenu = (e) => {
				e.preventDefault();
				if (this.cycleToNextGroup()) {
					const groups = this.getGroupNames();
					if (groups.length > 1) {
						new Notice(`Switched to group: ${this.settings.activeGroup}`);
					}
				}
			};
			this.setupStatusBarHover();
			this.updateStatusBar();
		}

		// Auto-extract variables when typing (if enabled)
		if (this.settings.autoExtract) {
			this.registerDomEvent(document, 'keyup', (evt: KeyboardEvent) => {
				if (evt.key === ' ' || evt.key === 'Enter') {
					const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
					if (activeView) {
						setTimeout(() => this.autoExtractFromCurrentLine(activeView.editor), 500);
					}
				}
			});
		}

		// Register hover tooltips for variables
		this.registerHoverTooltips();
	}

	private autoExtractFromCurrentLine(editor: Editor) {
		const cursor = editor.getCursor();
		const line = editor.getLine(cursor.line);
		
		const variableRegex = /\$([A-Za-z_][A-Za-z0-9_]*)/g;
		const matches = [...line.matchAll(variableRegex)];
		
		let newVariables = 0;
		const currentVars = this.getCurrentVariables();
		matches.forEach(match => {
			const varName = match[1];
			if (!currentVars.hasOwnProperty(varName)) {
				this.setCurrentVariable(varName, '');
				newVariables++;
			}
		});

		if (newVariables > 0) {
			this.saveSettings();
			this.updateStatusBar();
		}
	}

	extractVariables(editor: Editor) {
		const selection = editor.getSelection();
		const text = selection || editor.getLine(editor.getCursor().line);
		
		const variableRegex = /\$([A-Za-z_][A-Za-z0-9_]*)/g;
		const matches = [...text.matchAll(variableRegex)];
		
		if (matches.length === 0) {
			new Notice('No variables found');
			return;
		}

		let newVariables = 0;
		const foundVariables: string[] = [];
		const currentVars = this.getCurrentVariables();
		
		matches.forEach(match => {
			const varName = match[1];
			foundVariables.push(varName);
			if (!currentVars.hasOwnProperty(varName)) {
				this.setCurrentVariable(varName, '');
				newVariables++;
			}
		});

		this.saveSettings();
		this.updateStatusBar();
		
		if (newVariables > 0) {
			new Notice(`Found ${matches.length} variables, ${newVariables} new: ${foundVariables.join(', ')}`);
		} else {
			new Notice(`Found ${matches.length} existing variables: ${foundVariables.join(', ')}`);
		}
	}

	substituteVariables(editor: Editor) {
		const selection = editor.getSelection();
		let text: string;
		let replaceSelection = false;

		if (selection) {
			text = selection;
			replaceSelection = true;
		} else {
			const cursor = editor.getCursor();
			text = editor.getLine(cursor.line);
		}

		const result = this.performSubstitution(text);
		
		if (result.substitutionCount === 0) {
			new Notice('No variables found to substitute');
			return;
		}

		if (replaceSelection) {
			editor.replaceSelection(result.substitutedText);
		} else {
			const cursor = editor.getCursor();
			editor.setLine(cursor.line, result.substitutedText);
		}

		new Notice(`${result.substitutionCount} variables substituted${result.missingVars.length > 0 ? ` (${result.missingVars.length} undefined)` : ''}`);
		
		if (result.missingVars.length > 0) {
			new Notice(`Undefined variables: ${result.missingVars.join(', ')}`, 5000);
		}
	}

	substituteAllVariables(editor: Editor) {
		const content = editor.getValue();
		const result = this.performSubstitution(content);
		
		if (result.substitutionCount === 0) {
			new Notice('No variables found to substitute in file');
			return;
		}

		editor.setValue(result.substitutedText);
		new Notice(`File updated: ${result.substitutionCount} variables substituted${result.missingVars.length > 0 ? ` (${result.missingVars.length} undefined)` : ''}`);
		
		if (result.missingVars.length > 0) {
			new Notice(`Undefined variables: ${result.missingVars.join(', ')}`, 5000);
		}
	}

	previewVariables(editor: Editor) {
		const selection = editor.getSelection();
		const text = selection || editor.getValue();
		
		const result = this.performSubstitution(text);
		
		if (result.substitutionCount === 0) {
			new Notice('No variables found to preview');
			return;
		}

		new VariablePreviewModal(this.app, text, result.substitutedText, result.substitutionCount, result.missingVars).open();
	}

	private performSubstitution(text: string): {
		substitutedText: string;
		substitutionCount: number;
		missingVars: string[];
	} {
		let substitutionCount = 0;
		const missingVars: string[] = [];
		const currentVars = this.getCurrentVariables();
		
		const variableRegex = /\$([A-Za-z_][A-Za-z0-9_]*)/g;
		const substitutedText = text.replace(variableRegex, (match, varName) => {
			if (currentVars.hasOwnProperty(varName) && currentVars[varName] !== '') {
				substitutionCount++;
				return currentVars[varName];
			} else {
				if (!missingVars.includes(varName)) {
					missingVars.push(varName);
				}
				return match; // Keep original if variable not found or empty
			}
		});

		return { substitutedText, substitutionCount, missingVars };
	}

	updateStatusBar() {
		if (this.statusBarItem) {
			const currentVars = this.getCurrentVariables();
			const definedVars = Object.values(currentVars).filter(v => v !== '').length;
			const totalVars = Object.keys(currentVars).length;
			this.statusBarItem.setText(`${this.settings.activeGroup}: ${definedVars}/${totalVars}`);
		}
	}

	setupStatusBarHover() {
		if (!this.statusBarItem) return;

		this.statusBarItem.addEventListener('mouseenter', () => {
			this.statusBarHoverTimeout = setTimeout(() => {
				this.showStatusBarTooltip();
			}, 300);
		});

		this.statusBarItem.addEventListener('mouseleave', () => {
			if (this.statusBarHoverTimeout) {
				clearTimeout(this.statusBarHoverTimeout);
				this.statusBarHoverTimeout = null;
			}
			
			// Give user time to move to tooltip (100ms grace period)
			setTimeout(() => {
				// Only hide if mouse is not over the tooltip itself
				if (this.statusBarTooltip && !this.statusBarTooltip.matches(':hover')) {
					this.hideStatusBarTooltip();
				}
			}, 100);
		});
	}

	private showStatusBarTooltip() {
		this.hideStatusBarTooltip();

		const currentVars = this.getCurrentVariables();
		const entries = Object.entries(currentVars).sort(([a], [b]) => a.localeCompare(b));

		if (entries.length === 0) {
			return; // No variables to show
		}

		// Create tooltip element
		const tooltip = document.createElement('div');
		tooltip.className = 'variable-tooltip status-bar-tooltip';
		tooltip.style.cursor = 'pointer';
		tooltip.title = 'Click to open Variable Manager';

		// Make tooltip clickable
		tooltip.addEventListener('click', () => {
			this.hideStatusBarTooltip();
			new VariableManagerModal(this.app, this).open();
		});

		// Add header
		const header = tooltip.createDiv('variable-tooltip-header');
		header.textContent = `${this.settings.activeGroup} Variables`;

		// Add variables list
		entries.forEach(([name, value]) => {
			const varDiv = tooltip.createDiv('status-bar-var-item');
			
			const nameSpan = varDiv.createSpan('variable-tooltip-header');
			nameSpan.textContent = `$${name}`;
			
			const valueSpan = varDiv.createSpan();
			if (value && value.trim() !== '') {
				valueSpan.className = 'variable-tooltip-value';
				valueSpan.textContent = value;
			} else {
				valueSpan.className = 'variable-tooltip-empty';
				valueSpan.textContent = '(empty)';
			}
		});

		// Add group info footer
		const footer = tooltip.createDiv('variable-tooltip-group');
		const definedVars = Object.values(currentVars).filter(v => v !== '').length;
		const totalVars = Object.keys(currentVars).length;
		const footerText = `${definedVars}/${totalVars} variables defined`;
		const interactionHint = entries.length > 8 ? ' • Scroll or click to interact' : ' • Click to manage';
		footer.textContent = footerText + interactionHint;

		// Position tooltip relative to status bar
		const statusBarRect = this.statusBarItem.getBoundingClientRect();
		tooltip.style.left = `${statusBarRect.left}px`;
		tooltip.style.top = `${statusBarRect.top - 10}px`; // Above status bar
		tooltip.style.transform = 'translateY(-100%)'; // Position above

		// Setup tooltip hover behavior to keep it open when interacting
		tooltip.addEventListener('mouseenter', () => {
			// Keep tooltip open when hovering over it
		});

		tooltip.addEventListener('mouseleave', () => {
			// Hide tooltip when leaving tooltip area
			setTimeout(() => {
				// Only hide if also not hovering over status bar
				if (!this.statusBarItem.matches(':hover')) {
					this.hideStatusBarTooltip();
				}
			}, 100);
		});

		// Add to document
		document.body.appendChild(tooltip);
		this.statusBarTooltip = tooltip;

		// Adjust position if tooltip goes off screen
		const rect = tooltip.getBoundingClientRect();
		if (rect.left < 0) {
			tooltip.style.left = '10px';
		}
		if (rect.right > window.innerWidth) {
			tooltip.style.left = `${window.innerWidth - rect.width - 10}px`;
		}
		if (rect.top < 0) {
			// If it goes above screen, show below status bar instead
			tooltip.style.top = `${statusBarRect.bottom + 10}px`;
			tooltip.style.transform = 'none';
		}
	}

	private hideStatusBarTooltip() {
		if (this.statusBarTooltip) {
			this.statusBarTooltip.remove();
			this.statusBarTooltip = null;
		}
	}

	private registerHoverTooltips() {
		console.log('Variables Plugin: Registering hover tooltips');
		
		// Register mouse move event to track hover over variables
		this.registerDomEvent(document, 'mousemove', (evt: MouseEvent) => {
			this.handleMouseMove(evt);
		});

		// Register mouse leave event to hide tooltips
		this.registerDomEvent(document, 'mouseleave', () => {
			this.hideTooltip();
		});
	}

	private currentTooltip: HTMLElement | null = null;
	private hoverTimeout: NodeJS.Timeout | null = null;
	private statusBarTooltip: HTMLElement | null = null;
	private statusBarHoverTimeout: NodeJS.Timeout | null = null;

	private handleMouseMove(evt: MouseEvent) {
		// Clear previous timeout
		if (this.hoverTimeout) {
			clearTimeout(this.hoverTimeout);
			this.hoverTimeout = null;
		}

		// Hide current tooltip if mouse moved away
		this.hideTooltip();

		// Only check if we're hovering over editor content
		const target = evt.target as HTMLElement;
		const editorElement = target.closest('.cm-editor, .markdown-source-view, .cm-content');
		if (!editorElement) {
			return;
		}

		// Set a delay before showing tooltip
		this.hoverTimeout = setTimeout(() => {
			this.checkForVariableAtPrecisePosition(evt);
		}, 300);
	}

	private checkForVariableAtPrecisePosition(evt: MouseEvent) {
		// Get the character position under the mouse cursor
		const charInfo = this.getCharacterAtPosition(evt.clientX, evt.clientY);
		if (!charInfo) {
			return;
		}
		
		// Check if this character position is within a variable
		const variableMatch = this.findVariableAtCharacterPosition(charInfo.textContent, charInfo.offset);
		
		if (variableMatch) {
			console.log('Variables Plugin: Showing tooltip for variable:', variableMatch.name);
			this.showTooltip(variableMatch.name, evt.clientX, evt.clientY);
		}
	}

	private getCharacterAtPosition(x: number, y: number): { textContent: string; offset: number } | null {
		try {
			let range: Range | null = null;
			
			// Try modern API first (Chrome/Safari)
			if ((document as any).caretPositionFromPoint) {
				const caretPos = (document as any).caretPositionFromPoint(x, y);
				if (caretPos && caretPos.offsetNode) {
					range = document.createRange();
					range.setStart(caretPos.offsetNode, caretPos.offset);
				}
			}
			// Fallback to older API (Firefox)
			else if ((document as any).caretRangeFromPoint) {
				range = (document as any).caretRangeFromPoint(x, y);
			}
			
			if (!range || !range.startContainer) {
				console.log('Variables Plugin: No range found at position');
				return null;
			}
			
			// Get the text content and offset
			const textNode = range.startContainer;
			if (textNode.nodeType !== Node.TEXT_NODE) {
				console.log('Variables Plugin: Not a text node');
				return null;
			}
			
			const textContent = textNode.textContent || '';
			const offset = range.startOffset;
			
			// Only return if text contains variables
			if (!textContent.includes('$')) {
				return null;
			}
			
			return { textContent, offset };
		} catch (error) {
			console.log('Variables Plugin: Error getting character position:', error);
			return null;
		}
	}

	private findVariableAtCharacterPosition(text: string, charOffset: number): { name: string } | null {
		const variableRegex = /\$([A-Za-z_][A-Za-z0-9_]*)/g;
		let match;
		
		// Find all variables in the text
		while ((match = variableRegex.exec(text)) !== null) {
			const varStartPos = match.index; // Position of $
			const varEndPos = match.index + match[0].length; // End of variable name
			
			// Check if cursor position is within this variable
			if (charOffset >= varStartPos && charOffset <= varEndPos) {
				return { name: match[1] };
			}
		}
		
		return null;
	}



	private showTooltip(variableName: string, x: number, y: number) {
		// Remove existing tooltip
		this.hideTooltip();

		// Get variable value
		const currentVars = this.getCurrentVariables();
		const value = currentVars[variableName];
		const hasValue = value !== undefined && value !== '';

		// Create tooltip element
		const tooltip = document.createElement('div');
		tooltip.className = 'variable-tooltip';
		tooltip.style.cursor = 'pointer';
		tooltip.title = 'Click to open Variable Manager';
		
		// Make tooltip clickable to open Variable Manager
		tooltip.addEventListener('click', () => {
			this.hideTooltip();
			new VariableManagerModal(this.app, this).open();
		});
		
		// Add header
		const header = tooltip.createDiv('variable-tooltip-header');
		header.textContent = `$${variableName}`;
		
		// Add value
		const valueDiv = tooltip.createDiv();
		if (hasValue) {
			valueDiv.className = 'variable-tooltip-value';
			valueDiv.textContent = value;
		} else {
			valueDiv.className = 'variable-tooltip-empty';
			if (value === undefined) {
				valueDiv.textContent = '(undefined - not in current group)';
			} else {
				valueDiv.textContent = '(empty - click to set value)';
			}
		}
		
		// Add group info
		const groupDiv = tooltip.createDiv('variable-tooltip-group');
		groupDiv.textContent = `Group: ${this.settings.activeGroup}`;

		// Position tooltip
		tooltip.style.left = `${x + 10}px`;
		tooltip.style.top = `${y - 10}px`;

		// Add to document
		document.body.appendChild(tooltip);
		this.currentTooltip = tooltip;

		// Adjust position if tooltip goes off screen
		const rect = tooltip.getBoundingClientRect();
		if (rect.right > window.innerWidth) {
			tooltip.style.left = `${x - rect.width - 10}px`;
		}
		if (rect.bottom > window.innerHeight) {
			tooltip.style.top = `${y - rect.height - 10}px`;
		}
	}

	private hideTooltip() {
		if (this.currentTooltip) {
			this.currentTooltip.remove();
			this.currentTooltip = null;
		}
	}

	// Public method for debugging - can be called from console
	testTooltip(variableName: string = 'TargetIP', x: number = 200, y: number = 200) {
		console.log('Variables Plugin: Manual tooltip test');
		this.showTooltip(variableName, x, y);
	}

	async loadSettings() {
		const loadedData = await this.loadData();
		this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
		
		// Migration: Convert old format to new group format
		if (loadedData && (loadedData as any).variables && !loadedData.variableGroups) {
			this.settings.variableGroups = {
				'Default': (loadedData as any).variables
			};
			this.settings.activeGroup = 'Default';
			await this.saveSettings(); // Save migrated settings
			new Notice('Variables migrated to new group format. You can now create multiple variable groups!');
		}

		// Migration: Add newGroupTemplate if missing
		if (loadedData && !loadedData.newGroupTemplate) {
			this.settings.newGroupTemplate = { ...DEFAULT_SETTINGS.newGroupTemplate };
			await this.saveSettings();
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.updateStatusBar();
	}

	onunload() {
		// Clean up tooltips when plugin is unloaded
		this.hideTooltip();
		if (this.hoverTimeout) {
			clearTimeout(this.hoverTimeout);
			this.hoverTimeout = null;
		}
		
		// Clean up status bar hover
		this.hideStatusBarTooltip();
		if (this.statusBarHoverTimeout) {
			clearTimeout(this.statusBarHoverTimeout);
			this.statusBarHoverTimeout = null;
		}
	}

	private injectCSS() {
		const style = document.createElement('style');
		style.textContent = PLUGIN_CSS;
		document.head.appendChild(style);
	}
}

class VariableManagerModal extends Modal {
	plugin: VariablesPlugin;
	variablesList: HTMLElement;
	groupSelector: HTMLSelectElement;
	addSectionHeader: HTMLElement;
	variablesSectionHeader: HTMLElement;

	constructor(app: App, plugin: VariablesPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('variables-modal');

		contentEl.createEl('h2', { text: 'Variable Manager' });

		// Group management section
		const groupSection = contentEl.createDiv('group-section');
		groupSection.createEl('h3', { text: 'Variable Groups' });
		
		const groupRow = groupSection.createDiv('group-row');
		
		// Group selector
		this.groupSelector = groupRow.createEl('select', { cls: 'group-selector' });
		this.updateGroupSelector();
		
		this.groupSelector.addEventListener('change', () => {
			const selectedGroup = this.groupSelector.value;
			if (this.plugin.switchToGroup(selectedGroup)) {
				this.plugin.saveSettings();
				this.updateSectionHeaders();
				this.refreshVariableList();
				this.plugin.updateStatusBar();
				new Notice(`Switched to group: ${selectedGroup}`);
			}
		});

		// Group management buttons
		const groupActions = groupRow.createDiv('group-actions');
		
		const newGroupBtn = groupActions.createEl('button', { text: 'New Group', cls: 'group-btn' });
		const renameGroupBtn = groupActions.createEl('button', { text: 'Rename', cls: 'group-btn' });
		const deleteGroupBtn = groupActions.createEl('button', { text: 'Delete', cls: 'group-btn group-btn-danger' });

		newGroupBtn.onclick = () => this.showCreateGroupDialog();
		renameGroupBtn.onclick = () => this.showRenameGroupDialog();
		deleteGroupBtn.onclick = () => this.showDeleteGroupDialog();

		// Add new variable section
		const addSection = contentEl.createDiv('variable-add-section');
		this.addSectionHeader = addSection.createEl('h3', { text: `Add Variable to "${this.plugin.settings.activeGroup}"` });
		
		const addRow = addSection.createDiv('add-row');
		const nameInput = addRow.createEl('input', { 
			type: 'text', 
			placeholder: 'Variable name (e.g., TargetIP)'
		});
		const valueInput = addRow.createEl('input', { 
			type: 'text', 
			placeholder: 'Variable value (e.g., 10.0.0.1)'
		});
		const addButton = addRow.createEl('button', { text: 'Add' });

		const addVariable = () => {
			const name = nameInput.value.trim();
			const value = valueInput.value.trim();
			
			if (!name) {
				new Notice('Variable name cannot be empty');
				return;
			}

			if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
				new Notice('Variable name must start with letter/underscore and contain only letters, numbers, and underscores');
				return;
			}

			this.plugin.setCurrentVariable(name, value);
			this.plugin.saveSettings();
			nameInput.value = '';
			valueInput.value = '';
			this.refreshVariableList();
			this.plugin.updateStatusBar();
			new Notice(`Variable "${name}" ${value ? 'added' : 'added (empty value)'} to ${this.plugin.settings.activeGroup}`);
		};

		addButton.onclick = addVariable;
		[nameInput, valueInput].forEach(input => {
			input.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') addVariable();
			});
		});

		// Existing variables section
		const variablesSection = contentEl.createDiv('variables-section');
		this.variablesSectionHeader = variablesSection.createEl('h3', { text: `Variables in "${this.plugin.settings.activeGroup}"` });
		
		const headerContainer = variablesSection.createDiv('variables-header');
		
		const actionsContainer = headerContainer.createDiv('variables-actions');
		const exportButton = actionsContainer.createEl('button', { text: 'Export Group' });
		const importButton = actionsContainer.createEl('button', { text: 'Import to Group' });
		const clearButton = actionsContainer.createEl('button', { text: 'Clear Empty' });

		exportButton.onclick = () => {
			const currentVars = this.plugin.getCurrentVariables();
			const dataStr = JSON.stringify(currentVars, null, 2);
			navigator.clipboard.writeText(dataStr);
			new Notice(`Variables from "${this.plugin.settings.activeGroup}" group exported to clipboard`);
		};

		importButton.onclick = async () => {
			try {
				const clipboardText = await navigator.clipboard.readText();
				const importedVars = JSON.parse(clipboardText);
				
				if (typeof importedVars === 'object' && importedVars !== null) {
					Object.assign(this.plugin.getCurrentVariables(), importedVars);
					this.plugin.saveSettings();
					this.refreshVariableList();
					this.plugin.updateStatusBar();
					new Notice(`${Object.keys(importedVars).length} variables imported to "${this.plugin.settings.activeGroup}" group`);
				} else {
					new Notice('Invalid JSON format in clipboard');
				}
			} catch (error) {
				new Notice('Failed to import variables. Please check clipboard content.');
			}
		};

		clearButton.onclick = () => {
			const currentVars = this.plugin.getCurrentVariables();
			const emptyVars = Object.keys(currentVars).filter(
				key => currentVars[key] === ''
			);
			
			emptyVars.forEach(key => this.plugin.deleteCurrentVariable(key));
			this.plugin.saveSettings();
			this.refreshVariableList();
			this.plugin.updateStatusBar();
			new Notice(`${emptyVars.length} empty variables removed from "${this.plugin.settings.activeGroup}"`);
		};
		
		this.variablesList = variablesSection.createDiv('variables-list');
		this.refreshVariableList();
	}

	updateGroupSelector() {
		this.groupSelector.empty();
		const groupNames = this.plugin.getGroupNames();
		
		groupNames.forEach(groupName => {
			const option = this.groupSelector.createEl('option');
			option.value = groupName;
			option.textContent = groupName;
			option.innerText = groupName;
			if (groupName === this.plugin.settings.activeGroup) {
				option.selected = true;
			}
		});
	}

	updateSectionHeaders() {
		if (this.addSectionHeader) {
			this.addSectionHeader.textContent = `Add Variable to "${this.plugin.settings.activeGroup}"`;
		}
		if (this.variablesSectionHeader) {
			this.variablesSectionHeader.textContent = `Variables in "${this.plugin.settings.activeGroup}"`;
		}
	}

	showCreateGroupDialog() {
		new GroupNameModal(this.app, 'Create New Group', 'Enter new group name:', '', (groupName: string) => {
			if (this.plugin.createGroup(groupName)) {
				this.plugin.switchToGroup(groupName);
				this.plugin.saveSettings();
				this.updateGroupSelector();
				this.updateSectionHeaders();
				this.refreshVariableList();
				this.plugin.updateStatusBar();
				const templateCount = Object.keys(this.plugin.settings.newGroupTemplate).length;
				if (templateCount > 0) {
					new Notice(`Created group "${groupName}" with ${templateCount} template variables`);
				} else {
					new Notice(`Created group "${groupName}" (no template variables defined)`);
				}
			} else {
				new Notice('Group already exists');
			}
		}).open();
	}

	showRenameGroupDialog() {
		const currentGroup = this.plugin.settings.activeGroup;
		if (currentGroup === 'Default') {
			new Notice('Cannot rename the Default group');
			return;
		}
		
		new GroupNameModal(this.app, 'Rename Group', `Rename group "${currentGroup}" to:`, currentGroup, (newName: string) => {
			if (newName === currentGroup) return;
			
			if (this.plugin.renameGroup(currentGroup, newName)) {
				this.plugin.saveSettings();
				this.updateGroupSelector();
				this.updateSectionHeaders();
				this.plugin.updateStatusBar();
				new Notice(`Renamed group to: ${newName}`);
			} else {
				new Notice('Failed to rename group (name may already exist)');
			}
		}).open();
	}

	showDeleteGroupDialog() {
		const currentGroup = this.plugin.settings.activeGroup;
		if (currentGroup === 'Default') {
			new Notice('Cannot delete the Default group');
			return;
		}
		
		new ConfirmDeleteModal(this.app, `Delete "${currentGroup}" Group`, 
			`Are you sure you want to delete the "${currentGroup}" group and all its variables? This action cannot be undone.`,
			() => {
				if (this.plugin.deleteGroup(currentGroup)) {
					this.plugin.saveSettings();
					this.updateGroupSelector();
					this.updateSectionHeaders();
					this.refreshVariableList();
					this.plugin.updateStatusBar();
					new Notice(`Deleted group: ${currentGroup}. Switched to Default.`);
				} else {
					new Notice('Failed to delete group');
				}
			}
		).open();
	}

	refreshVariableList() {
		this.variablesList.empty();
		
		const currentVars = this.plugin.getCurrentVariables();
		Object.entries(currentVars)
			.sort(([a], [b]) => a.localeCompare(b))
			.forEach(([name, value]) => {
				const row = this.variablesList.createDiv('variable-row');
				
				// Variable name
				row.createEl('div', { 
					text: `$${name}`, 
					cls: 'var-name-display' 
				});
				
				// Variable value input
				const valueInput = row.createEl('input', {
					type: 'text',
					value: value,
					cls: 'var-value-input',
					placeholder: value ? 'Enter value...' : 'Value required!'
				});

				// Add empty class if no value
				if (!value || value.trim() === '') {
					valueInput.addClass('empty');
				}

				valueInput.addEventListener('input', () => {
					this.plugin.setCurrentVariable(name, valueInput.value);
					this.plugin.saveSettings();
					this.plugin.updateStatusBar();
					
					// Update empty state
					if (!valueInput.value || valueInput.value.trim() === '') {
						valueInput.addClass('empty');
						valueInput.placeholder = 'Value required!';
					} else {
						valueInput.removeClass('empty');
						valueInput.placeholder = 'Enter value...';
					}
				});

				// Actions container
				const actions = row.createDiv('var-actions');

				const copyButton = actions.createEl('button', { 
					text: 'Copy',
					cls: 'var-btn var-copy-btn'
				});

				copyButton.onclick = () => {
					navigator.clipboard.writeText(`$${name}`);
					new Notice(`Variable $${name} copied`);
				};

				const deleteButton = actions.createEl('button', { 
					text: 'Delete',
					cls: 'var-btn var-delete-btn'
				});

				deleteButton.onclick = () => {
					this.plugin.deleteCurrentVariable(name);
					this.plugin.saveSettings();
					this.refreshVariableList();
					this.plugin.updateStatusBar();
					new Notice(`Variable "$${name}" deleted from "${this.plugin.settings.activeGroup}"`);
				};
			});
	}

	onClose() {
		this.contentEl.empty();
	}
}

class GroupNameModal extends Modal {
	title: string;
	description: string;
	defaultValue: string;
	onSubmit: (value: string) => void;

	constructor(app: App, title: string, description: string, defaultValue: string, onSubmit: (value: string) => void) {
		super(app);
		this.title = title;
		this.description = description;
		this.defaultValue = defaultValue;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('group-name-modal');

		contentEl.createEl('h2', { text: this.title });
		contentEl.createEl('p', { text: this.description });

		const inputContainer = contentEl.createDiv('input-container');
		const nameInput = inputContainer.createEl('input', {
			type: 'text',
			placeholder: 'Group name',
			value: this.defaultValue
		});

		const buttonContainer = contentEl.createDiv('button-container');
		const submitBtn = buttonContainer.createEl('button', {
			text: 'Submit',
			cls: 'submit-btn'
		});
		const cancelBtn = buttonContainer.createEl('button', {
			text: 'Cancel',
			cls: 'cancel-btn'
		});

		const submit = () => {
			const groupName = nameInput.value.trim();
			
			if (!groupName) {
				new Notice('Group name cannot be empty');
				return;
			}

			if (!/^[A-Za-z0-9_\-\s]+$/.test(groupName)) {
				new Notice('Group name can only contain letters, numbers, spaces, hyphens, and underscores');
				return;
			}

			this.close();
			this.onSubmit(groupName);
		};

		submitBtn.onclick = submit;
		cancelBtn.onclick = () => this.close();

		nameInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') submit();
			if (e.key === 'Escape') this.close();
		});

		// Focus and select text
		nameInput.focus();
		if (this.defaultValue) {
			nameInput.select();
		}
	}

	onClose() {
		this.contentEl.empty();
	}
}

class ConfirmDeleteModal extends Modal {
	title: string;
	message: string;
	onConfirm: () => void;

	constructor(app: App, title: string, message: string, onConfirm: () => void) {
		super(app);
		this.title = title;
		this.message = message;
		this.onConfirm = onConfirm;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('confirm-delete-modal');

		contentEl.createEl('h2', { text: this.title });
		contentEl.createEl('p', { text: this.message });

		const buttonContainer = contentEl.createDiv('button-container');
		const deleteBtn = buttonContainer.createEl('button', {
			text: 'Delete',
			cls: 'delete-btn'
		});
		const cancelBtn = buttonContainer.createEl('button', {
			text: 'Cancel',
			cls: 'cancel-btn'
		});

		deleteBtn.onclick = () => {
			this.close();
			this.onConfirm();
		};

		cancelBtn.onclick = () => this.close();

		// Focus cancel button by default for safety
		cancelBtn.focus();
	}

	onClose() {
		this.contentEl.empty();
	}
}

class NewGroupTemplateModal extends Modal {
	plugin: VariablesPlugin;
	variablesList: HTMLElement;

	constructor(app: App, plugin: VariablesPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('template-modal');

		contentEl.createEl('h2', { text: 'New Group Template' });
		contentEl.createEl('p', { 
			text: 'Configure which variables are automatically added to new groups. Set default values or leave empty.',
			cls: 'template-description'
		});

		// Add new variable section
		const addSection = contentEl.createDiv('template-add-section');
		addSection.createEl('h3', { text: 'Add Template Variable' });
		
		const addRow = addSection.createDiv('add-row');
		const nameInput = addRow.createEl('input', { 
			type: 'text', 
			placeholder: 'Variable name (e.g., TargetIP)'
		});
		const valueInput = addRow.createEl('input', { 
			type: 'text', 
			placeholder: 'Default value (optional)'
		});
		const addButton = addRow.createEl('button', { text: 'Add' });

		const addVariable = () => {
			const name = nameInput.value.trim();
			const value = valueInput.value.trim();
			
			if (!name) {
				new Notice('Variable name cannot be empty');
				return;
			}

			if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
				new Notice('Variable name must start with letter/underscore and contain only letters, numbers, and underscores');
				return;
			}

			this.plugin.settings.newGroupTemplate[name] = value;
			this.plugin.saveSettings();
			nameInput.value = '';
			valueInput.value = '';
			this.refreshVariableList();
			new Notice(`Template variable "${name}" ${value ? 'added with default value' : 'added (empty default)'}`);
		};

		addButton.onclick = addVariable;
		[nameInput, valueInput].forEach(input => {
			input.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') addVariable();
			});
		});

		// Template variables section
		const variablesSection = contentEl.createDiv('template-variables-section');
		variablesSection.createEl('h3', { text: 'Template Variables' });
		
		const headerContainer = variablesSection.createDiv('template-header');
		
		const actionsContainer = headerContainer.createDiv('template-actions');
		const clearAllButton = actionsContainer.createEl('button', { text: 'Clear All' });
		const resetButton = actionsContainer.createEl('button', { text: 'Reset to Defaults' });

		clearAllButton.onclick = () => {
			this.plugin.settings.newGroupTemplate = {};
			this.plugin.saveSettings();
			this.refreshVariableList();
			new Notice('All template variables cleared');
		};

		resetButton.onclick = () => {
			this.plugin.settings.newGroupTemplate = { ...DEFAULT_SETTINGS.newGroupTemplate };
			this.plugin.saveSettings();
			this.refreshVariableList();
			new Notice('Template reset to defaults');
		};
		
		this.variablesList = variablesSection.createDiv('template-variables-list');
		
		// Action buttons
		const actionSection = contentEl.createDiv('template-action-section');
		const saveButton = actionSection.createEl('button', { 
			text: 'Save & Close',
			cls: 'template-save-btn'
		});
		
		saveButton.onclick = () => {
			this.close();
			new Notice('Template settings saved');
		};

		this.refreshVariableList();
	}

	refreshVariableList() {
		this.variablesList.empty();
		
		const templateVars = this.plugin.settings.newGroupTemplate;
		
		if (Object.keys(templateVars).length === 0) {
			const emptyMsg = this.variablesList.createDiv('template-empty');
			emptyMsg.setText('No template variables defined. New groups will start empty.');
			return;
		}
		
		Object.entries(templateVars)
			.sort(([a], [b]) => a.localeCompare(b))
			.forEach(([name, value]) => {
				const row = this.variablesList.createDiv('template-row');
				
				// Variable name
				row.createEl('div', { 
					text: `$${name}`, 
					cls: 'template-var-name' 
				});
				
				// Variable value input
				const valueInput = row.createEl('input', {
					type: 'text',
					value: value,
					cls: 'template-var-value',
					placeholder: 'Default value (optional)'
				});

				valueInput.addEventListener('input', () => {
					this.plugin.settings.newGroupTemplate[name] = valueInput.value;
					this.plugin.saveSettings();
				});

				// Actions container
				const actions = row.createDiv('template-actions');

				const deleteButton = actions.createEl('button', { 
					text: 'Remove',
					cls: 'template-delete-btn'
				});

				deleteButton.onclick = () => {
					delete this.plugin.settings.newGroupTemplate[name];
					this.plugin.saveSettings();
					this.refreshVariableList();
					new Notice(`Template variable "$${name}" removed`);
				};
			});
	}

	onClose() {
		this.contentEl.empty();
	}
}

class QuickInsertModal extends Modal {
	plugin: VariablesPlugin;
	editor: Editor;

	constructor(app: App, plugin: VariablesPlugin, editor: Editor) {
		super(app);
		this.plugin = plugin;
		this.editor = editor;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('quick-insert-modal');

		contentEl.createEl('h3', { text: 'Quick Insert Variable' });

		const searchInput = contentEl.createEl('input', {
			type: 'text',
			placeholder: 'Search variables...',
			cls: 'quick-search'
		});

		const variablesList = contentEl.createDiv('quick-list');

		const updateList = () => {
			const searchTerm = searchInput.value.toLowerCase();
			variablesList.empty();

			const currentVars = this.plugin.getCurrentVariables();
			Object.entries(currentVars)
				.filter(([name, value]) => 
					name.toLowerCase().includes(searchTerm) || 
					value.toLowerCase().includes(searchTerm)
				)
				.sort(([a], [b]) => a.localeCompare(b))
				.forEach(([name, value]) => {
					const item = variablesList.createDiv('quick-item');
					item.createEl('div', { text: `$${name}`, cls: 'quick-name' });
					
					const valueEl = item.createEl('div', { 
						text: value || '(empty)', 
						cls: 'quick-value' 
					});
					
					// Highlight empty values in quick insert too
					if (!value || value.trim() === '') {
						valueEl.style.color = 'var(--text-error)';
						valueEl.style.fontStyle = 'italic';
						valueEl.style.fontWeight = '500';
					}
					
					item.onclick = () => {
						this.editor.replaceSelection(`$${name}`);
						this.close();
						new Notice(`Inserted $${name} from ${this.plugin.settings.activeGroup}`);
					};
				});
		};

		searchInput.addEventListener('input', updateList);
		searchInput.focus();

		searchInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				const firstItem = variablesList.querySelector('.quick-item') as HTMLElement;
				if (firstItem) firstItem.click();
			}
		});

		updateList();
	}

	onClose() {
		this.contentEl.empty();
	}
}

class VariablePreviewModal extends Modal {
	originalText: string;
	substitutedText: string;
	substitutionCount: number;
	missingVars: string[];

	constructor(app: App, originalText: string, substitutedText: string, substitutionCount: number, missingVars: string[]) {
		super(app);
		this.originalText = originalText;
		this.substitutedText = substitutedText;
		this.substitutionCount = substitutionCount;
		this.missingVars = missingVars;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('preview-modal');

		// Title
		contentEl.createEl('h2', { text: 'Variable Substitution Preview' });

		// Info section
		const info = contentEl.createDiv('preview-info');
		info.createEl('p', { 
			text: `Found ${this.substitutionCount} variable substitutions`,
			cls: 'preview-info-text'
		});

		// Warning for missing variables
		if (this.missingVars.length > 0) {
			const warningInfo = contentEl.createDiv('preview-info');
			warningInfo.style.borderLeftColor = 'var(--text-error)';
			warningInfo.style.backgroundColor = 'var(--background-modifier-error-rgb)';
			warningInfo.createEl('p', { 
				text: `⚠️ Missing variables: ${this.missingVars.join(', ')}`,
				cls: 'preview-info-text'
			});
		}

		// Result section
		const resultSection = contentEl.createDiv('preview-content');
		resultSection.createEl('div', { text: 'Substituted Result:', cls: 'preview-label' });
		
		const resultBox = resultSection.createDiv('preview-result');
		resultBox.textContent = this.substitutedText;

		// Action buttons
		const actions = contentEl.createDiv('preview-actions');
		
		const copyButton = actions.createEl('button', { 
			text: 'Copy Result',
			cls: 'preview-btn preview-btn-primary'
		});
		copyButton.onclick = () => {
			navigator.clipboard.writeText(this.substitutedText);
			new Notice('Substituted text copied to clipboard');
		};

		const closeButton = actions.createEl('button', { 
			text: 'Close',
			cls: 'preview-btn preview-btn-secondary'
		});
		closeButton.onclick = () => {
			this.close();
		};
	}

	onClose() {
		this.contentEl.empty();
	}
}

class VariablesSettingTab extends PluginSettingTab {
	plugin: VariablesPlugin;

	constructor(app: App, plugin: VariablesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Variables Settings' });

		containerEl.createEl('p', { 
			text: 'This plugin helps you manage variables in your notes and commands. Use $VariableName format in your notes.'
		});

		new Setting(containerEl)
			.setName('Auto-extract variables')
			.setDesc('Automatically detect and add new variables while typing')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoExtract)
				.onChange(async (value) => {
					this.plugin.settings.autoExtract = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Show variable count in status bar')
			.setDesc('Display the number of defined variables in the status bar')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showVariableCount)
				.onChange(async (value) => {
					this.plugin.settings.showVariableCount = value;
					await this.plugin.saveSettings();
					
									if (value && !this.plugin.statusBarItem) {
					this.plugin.statusBarItem = this.plugin.addStatusBarItem();
					this.plugin.statusBarItem.addClass('clickable-status-item');
					this.plugin.statusBarItem.title = 'Left-click: Variable Manager • Right-click: Cycle groups • Hover: Show all variables';
					this.plugin.statusBarItem.onclick = () => {
						new VariableManagerModal(this.plugin.app, this.plugin).open();
					};
					this.plugin.statusBarItem.oncontextmenu = (e) => {
						e.preventDefault();
						if (this.plugin.cycleToNextGroup()) {
							const groups = this.plugin.getGroupNames();
							if (groups.length > 1) {
								new Notice(`Switched to group: ${this.plugin.settings.activeGroup}`);
							}
						}
					};
					this.plugin.setupStatusBarHover();
					this.plugin.updateStatusBar();
					} else if (!value && this.plugin.statusBarItem) {
						this.plugin.statusBarItem.remove();
						this.plugin.statusBarItem = null;
					}
				}));

		new Setting(containerEl)
			.setName('Reset current group to defaults')
			.setDesc('Reset all variables in the current group to default values')
			.addButton(button => button
				.setButtonText('Reset Current Group')
				.setWarning()
				.onClick(async () => {
					const currentGroup = this.plugin.settings.activeGroup;
					if (currentGroup === 'Default') {
						this.plugin.settings.variableGroups['Default'] = { ...DEFAULT_SETTINGS.variableGroups['Default'] };
					} else {
						// Clear the current group
						this.plugin.settings.variableGroups[currentGroup] = {};
					}
					await this.plugin.saveSettings();
					new Notice(`Variables in "${currentGroup}" group reset`);
				}));

		new Setting(containerEl)
			.setName('Export/Import Current Group')
			.setDesc('Export or import variables for the currently active group')
			.addButton(button => button
				.setButtonText('Export Current Group')
				.onClick(() => {
					const currentVars = this.plugin.getCurrentVariables();
					const dataStr = JSON.stringify(currentVars, null, 2);
					navigator.clipboard.writeText(dataStr);
					new Notice(`Variables from "${this.plugin.settings.activeGroup}" group exported to clipboard`);
				}))
			.addButton(button => button
				.setButtonText('Import to Current Group')
				.onClick(async () => {
					try {
						const clipboardText = await navigator.clipboard.readText();
						const importedVars = JSON.parse(clipboardText);
						
						if (typeof importedVars === 'object' && importedVars !== null) {
							Object.assign(this.plugin.getCurrentVariables(), importedVars);
							await this.plugin.saveSettings();
							new Notice(`${Object.keys(importedVars).length} variables imported to "${this.plugin.settings.activeGroup}" group`);
							this.display(); // Refresh settings display
						} else {
							new Notice('Invalid JSON format in clipboard');
						}
					} catch (error) {
						new Notice('Failed to import variables. Please check clipboard content.');
					}
				}));

		// New Group Template section
		containerEl.createEl('h3', { text: 'New Group Template' });
		containerEl.createEl('p', { 
			text: 'Define which variables are automatically added to new groups. Set default values or leave empty.'
		});

		new Setting(containerEl)
			.setName('Manage template variables')
			.setDesc('Configure which variables are pre-populated when creating new groups')
			.addButton(button => button
				.setButtonText('Edit Template')
				.onClick(() => {
					new NewGroupTemplateModal(this.app, this.plugin).open();
				}));

		new Setting(containerEl)
			.setName('Copy current group to template')
			.setDesc('Use the variables from the current active group as the template for new groups')
			.addButton(button => button
				.setButtonText('Copy to Template')
				.onClick(async () => {
					const currentVars = this.plugin.getCurrentVariables();
					// Copy variable names but clear values for template
					const templateVars: VariableData = {};
					Object.keys(currentVars).forEach(key => {
						templateVars[key] = '';
					});
					this.plugin.settings.newGroupTemplate = templateVars;
					await this.plugin.saveSettings();
					new Notice(`Template updated with ${Object.keys(currentVars).length} variables from "${this.plugin.settings.activeGroup}" group`);
				}));

		new Setting(containerEl)
			.setName('Reset template to defaults')
			.setDesc('Reset the new group template to the default pentesting variables')
			.addButton(button => button
				.setButtonText('Reset Template')
				.setWarning()
				.onClick(async () => {
					this.plugin.settings.newGroupTemplate = { ...DEFAULT_SETTINGS.newGroupTemplate };
					await this.plugin.saveSettings();
					new Notice('Template reset to defaults');
				}));
	}
} 