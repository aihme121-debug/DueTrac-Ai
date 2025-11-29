import { DynamicFirebaseService } from '../services/dynamicFirebaseService';

export interface PerformanceMetric {
  timestamp: number;
  operation: string;
  duration: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  operationsPerSecond: number;
  slowestOperations: PerformanceMetric[];
  mostFrequentOperations: Record<string, number>;
  errorRate: number;
  recommendations: string[];
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics: number = 10000;
  private dynamicService: DynamicFirebaseService;

  constructor() {
    this.dynamicService = DynamicFirebaseService.getInstance();
    this.startAutoMonitoring();
  }

  recordMetric(operation: string, duration: number, success: boolean, error?: string, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      timestamp: Date.now(),
      operation,
      duration,
      success,
      error,
      metadata,
    };

    this.metrics.push(metric);

    // Keep only recent metrics to prevent memory issues
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations
    if (duration > 1000) {
      console.warn(`⚠️ Slow operation detected: ${operation} took ${duration}ms`);
    }
  }

  async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      this.recordMetric(operation, duration, true, undefined, metadata);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(operation, duration, false, error instanceof Error ? error.message : String(error), metadata);
      throw error;
    }
  }

  measureSync<T>(
    operation: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    const startTime = performance.now();
    
    try {
      const result = fn();
      const duration = performance.now() - startTime;
      this.recordMetric(operation, duration, true, undefined, metadata);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(operation, duration, false, error instanceof Error ? error.message : String(error), metadata);
      throw error;
    }
  }

  generateReport(timeWindow?: number): PerformanceReport {
    const now = Date.now();
    const windowStart = timeWindow ? now - timeWindow : 0;
    
    const relevantMetrics = this.metrics.filter(m => m.timestamp >= windowStart);
    
    if (relevantMetrics.length === 0) {
      return this.createEmptyReport();
    }

    const durations = relevantMetrics.map(m => m.duration);
    const successfulOps = relevantMetrics.filter(m => m.success);
    const failedOps = relevantMetrics.filter(m => !m.success);
    
    const operationCounts = relevantMetrics.reduce((acc, m) => {
      acc[m.operation] = (acc[m.operation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const slowestOperations = relevantMetrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    const totalDuration = Math.max(...relevantMetrics.map(m => m.timestamp)) - 
                           Math.min(...relevantMetrics.map(m => m.timestamp));
    const operationsPerSecond = totalDuration > 0 ? (relevantMetrics.length / totalDuration) * 1000 : 0;

    const report: PerformanceReport = {
      totalOperations: relevantMetrics.length,
      successfulOperations: successfulOps.length,
      failedOperations: failedOps.length,
      averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      operationsPerSecond,
      slowestOperations,
      mostFrequentOperations: operationCounts,
      errorRate: failedOps.length / relevantMetrics.length,
      recommendations: this.generateRecommendations(relevantMetrics),
    };

    return report;
  }

  private createEmptyReport(): PerformanceReport {
    return {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageDuration: 0,
      minDuration: 0,
      maxDuration: 0,
      operationsPerSecond: 0,
      slowestOperations: [],
      mostFrequentOperations: {},
      errorRate: 0,
      recommendations: ['No performance data available yet'],
    };
  }

  private generateRecommendations(metrics: PerformanceMetric[]): string[] {
    const recommendations: string[] = [];
    
    const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
    const errorRate = metrics.filter(m => !m.success).length / metrics.length;
    const slowOperations = metrics.filter(m => m.duration > 1000);
    
    if (avgDuration > 500) {
      recommendations.push('Consider implementing caching for frequently accessed data');
      recommendations.push('Optimize database queries to reduce response times');
    }
    
    if (errorRate > 0.05) {
      recommendations.push('High error rate detected - investigate failing operations');
      recommendations.push('Implement retry mechanisms for transient failures');
    }
    
    if (slowOperations.length > metrics.length * 0.1) {
      recommendations.push('Significant number of slow operations - consider performance optimization');
      recommendations.push('Review and optimize the slowest operations identified');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Performance is within acceptable parameters');
      recommendations.push('Continue monitoring for trends and anomalies');
    }
    
    return recommendations;
  }

  private startAutoMonitoring(): void {
    // Monitor memory usage
    setInterval(() => {
      if (typeof process !== 'undefined' && process.memoryUsage) {
        const memoryUsage = process.memoryUsage();
        if (memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
          console.warn(`⚠️ High memory usage detected: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
        }
      }
    }, 30000); // Check every 30 seconds

    // Generate periodic reports
    setInterval(() => {
      const report = this.generateReport(300000); // Last 5 minutes
      if (report.totalOperations > 0) {
        console.log('📊 Performance Report (Last 5 minutes):');
        console.log(`- Operations: ${report.totalOperations} (${report.successfulOperations} successful)`);
        console.log(`- Average Duration: ${report.averageDuration.toFixed(2)}ms`);
        console.log(`- Error Rate: ${(report.errorRate * 100).toFixed(2)}%`);
        console.log(`- Throughput: ${report.operationsPerSecond.toFixed(2)} ops/sec`);
        
        if (report.recommendations.length > 0) {
          console.log('- Recommendations:');
          report.recommendations.forEach(rec => console.log(`  • ${rec}`));
        }
        
        console.log('');
      }
    }, 300000); // Every 5 minutes
  }

  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'operation', 'duration', 'success', 'error'];
      const rows = this.metrics.map(m => [
        new Date(m.timestamp).toISOString(),
        m.operation,
        m.duration.toString(),
        m.success.toString(),
        m.error || ''
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    } else {
      return JSON.stringify(this.metrics, null, 2);
    }
  }

  clearMetrics(): void {
    this.metrics = [];
    console.log('📊 Performance metrics cleared');
  }

  getMetricsCount(): number {
    return this.metrics.length;
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export for use in other modules
export default performanceMonitor;