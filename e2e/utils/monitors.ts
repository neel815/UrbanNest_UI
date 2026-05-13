import { Page } from '@playwright/test';

export class PageMonitor {
  private page: Page;
  private errors: string[] = [];
  private networkFailures: string[] = [];

  constructor(page: Page) {
    this.page = page;
    this.setupMonitors();
  }

  private setupMonitors() {
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        this.errors.push(`Console Error: ${msg.text()}`);
      }
    });

    this.page.on('response', (response) => {
      if (response.status() >= 400) {
        this.networkFailures.push(
          `API Error: ${response.request().url()} - ${response.status()}`
        );
      }
    });

    this.page.on('pageerror', (error) => {
      this.errors.push(`Page Error: ${error.message}`);
    });
  }

  getErrors(): string[] {
    return this.errors;
  }

  getNetworkFailures(): string[] {
    return this.networkFailures;
  }

  hasErrors(): boolean {
    return this.errors.length > 0 || this.networkFailures.length > 0;
  }

  clearErrors() {
    this.errors = [];
    this.networkFailures = [];
  }
}
