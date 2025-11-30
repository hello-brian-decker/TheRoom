/**
 * PhysicsDocumentation - Reusable Documentation Panel Component
 * 
 * Displays mathematical documentation for physics demonstrations
 */

export class PhysicsDocumentation {
    constructor(content) {
        this.content = content;
        this.panel = null;
        this.isVisible = false;
    }

    /**
     * Create and return the documentation panel element
     */
    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'physics-documentation-panel';
        panel.style.cssText = `
            position: fixed;
            right: ${this.isVisible ? '0' : '-400px'};
            top: 60px;
            width: 400px;
            max-height: calc(100vh - 60px);
            background: rgba(255, 255, 255, 0.98);
            border-left: 2px solid #0066cc;
            box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
            z-index: 2000;
            transition: right 0.3s ease;
            overflow-y: auto;
            font-family: 'Georgia', 'Times New Roman', serif;
            color: #333;
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            background: #0066cc;
            color: white;
            padding: 15px 20px;
            font-weight: bold;
            font-size: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 10;
        `;
        
        const title = document.createElement('div');
        title.textContent = 'Mathematical Documentation';
        header.appendChild(title);

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            background: transparent;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            line-height: 30px;
        `;
        closeBtn.addEventListener('click', () => this.toggle());
        header.appendChild(closeBtn);

        panel.appendChild(header);

        // Content
        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = `
            padding: 20px;
            line-height: 1.6;
        `;
        contentDiv.innerHTML = this.formatContent(this.content);
        panel.appendChild(contentDiv);

        this.panel = panel;
        return panel;
    }

    /**
     * Format content with proper styling for equations and sections
     */
    formatContent(content) {
        let html = '';

        // Overview section
        if (content.overview) {
            html += `<section style="margin-bottom: 30px;">
                <h2 style="color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 5px; margin-bottom: 15px;">Overview</h2>
                <p style="text-align: justify; margin-bottom: 10px;">${content.overview}</p>
            </section>`;
        }

        // Mathematical Foundation
        if (content.mathematicalFoundation) {
            html += `<section style="margin-bottom: 30px;">
                <h2 style="color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 5px; margin-bottom: 15px;">Mathematical Foundation</h2>`;
            
            if (content.mathematicalFoundation.equations) {
                html += `<h3 style="color: #333; margin-top: 20px; margin-bottom: 10px;">Core Equations</h3>`;
                content.mathematicalFoundation.equations.forEach(eq => {
                    html += `<div style="background: #f5f5f5; padding: 15px; margin-bottom: 10px; border-left: 4px solid #0066cc; border-radius: 4px;">
                        <div style="font-family: 'Courier New', monospace; font-size: 16px; margin-bottom: 8px; text-align: center; font-weight: bold;">
                            ${eq.formula}
                        </div>
                        <div style="font-size: 13px; color: #666; font-style: italic;">
                            ${eq.description}
                        </div>
                        ${eq.variables ? `<div style="margin-top: 8px; font-size: 12px; color: #555;">
                            <strong>Variables:</strong> ${eq.variables}
                        </div>` : ''}
                    </div>`;
                });
            }

            if (content.mathematicalFoundation.concepts) {
                html += `<h3 style="color: #333; margin-top: 20px; margin-bottom: 10px;">Key Concepts</h3>`;
                content.mathematicalFoundation.concepts.forEach(concept => {
                    html += `<div style="margin-bottom: 15px;">
                        <strong style="color: #0066cc;">${concept.name}:</strong>
                        <p style="margin-top: 5px; text-align: justify;">${concept.description}</p>
                    </div>`;
                });
            }

            html += `</section>`;
        }

        // Real-World Applications
        if (content.realWorldApplications) {
            html += `<section style="margin-bottom: 30px;">
                <h2 style="color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 5px; margin-bottom: 15px;">Real-World Applications</h2>`;
            
            if (content.realWorldApplications.engineering) {
                html += `<h3 style="color: #333; margin-top: 20px; margin-bottom: 10px;">Engineering Applications</h3>
                <ul style="padding-left: 20px; margin-bottom: 15px;">`;
                content.realWorldApplications.engineering.forEach(app => {
                    html += `<li style="margin-bottom: 8px;">${app}</li>`;
                });
                html += `</ul>`;
            }

            if (content.realWorldApplications.physics) {
                html += `<h3 style="color: #333; margin-top: 20px; margin-bottom: 10px;">Physics Research</h3>
                <ul style="padding-left: 20px; margin-bottom: 15px;">`;
                content.realWorldApplications.physics.forEach(app => {
                    html += `<li style="margin-bottom: 8px;">${app}</li>`;
                });
                html += `</ul>`;
            }

            if (content.realWorldApplications.examples) {
                html += `<h3 style="color: #333; margin-top: 20px; margin-bottom: 10px;">Everyday Examples</h3>
                <ul style="padding-left: 20px; margin-bottom: 15px;">`;
                content.realWorldApplications.examples.forEach(example => {
                    html += `<li style="margin-bottom: 8px;">${example}</li>`;
                });
                html += `</ul>`;
            }

            html += `</section>`;
        }

        // Numerical Methods
        if (content.numericalMethods) {
            html += `<section style="margin-bottom: 30px;">
                <h2 style="color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 5px; margin-bottom: 15px;">Numerical Methods</h2>`;
            
            if (content.numericalMethods.integration) {
                html += `<h3 style="color: #333; margin-top: 20px; margin-bottom: 10px;">Integration Techniques</h3>`;
                content.numericalMethods.integration.forEach(method => {
                    html += `<div style="background: #f9f9f9; padding: 12px; margin-bottom: 10px; border-radius: 4px;">
                        <strong style="color: #0066cc;">${method.name}:</strong>
                        <p style="margin-top: 5px; font-size: 13px;">${method.description}</p>
                    </div>`;
                });
            }

            if (content.numericalMethods.stability) {
                html += `<h3 style="color: #333; margin-top: 20px; margin-bottom: 10px;">Stability Considerations</h3>
                <p style="text-align: justify;">${content.numericalMethods.stability}</p>`;
            }

            html += `</section>`;
        }

        // Further Reading
        if (content.furtherReading) {
            html += `<section style="margin-bottom: 30px;">
                <h2 style="color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 5px; margin-bottom: 15px;">Further Reading</h2>
                <ul style="padding-left: 20px;">`;
            content.furtherReading.forEach(ref => {
                html += `<li style="margin-bottom: 8px; font-size: 13px;">${ref}</li>`;
            });
            html += `</ul></section>`;
        }

        return html;
    }

    /**
     * Toggle panel visibility
     */
    toggle() {
        this.isVisible = !this.isVisible;
        if (this.panel) {
            this.panel.style.right = this.isVisible ? '0' : '-400px';
        }
    }

    /**
     * Show panel
     */
    show() {
        this.isVisible = true;
        if (this.panel) {
            this.panel.style.right = '0';
        }
    }

    /**
     * Hide panel
     */
    hide() {
        this.isVisible = false;
        if (this.panel) {
            this.panel.style.right = '-400px';
        }
    }

    /**
     * Dispose of the panel
     */
    dispose() {
        if (this.panel && this.panel.parentNode) {
            this.panel.parentNode.removeChild(this.panel);
        }
        this.panel = null;
    }
}

