import { DynamicFirebaseService } from '../services/dynamicFirebaseService';
import { SecurityService } from '../services/securityService';

interface LoadTestResult {
  testName: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errors: string[];
}

interface LoadTestOptions {
  concurrentUsers: number;
  requestsPerUser: number;
  delayBetweenRequests: number;
  testDuration: number;
}

export class LoadTestingService {
  private dynamicService: DynamicFirebaseService;
  private securityService: SecurityService;

  constructor() {
    this.dynamicService = DynamicFirebaseService.getInstance();
    this.securityService = SecurityService.getInstance();
  }

  async runLoadTest(testName: string, options: LoadTestOptions): Promise<LoadTestResult> {
    console.log(`🚀 Starting load test: ${testName}`);
    console.log(`📊 Configuration: ${options.concurrentUsers} users, ${options.requestsPerUser} requests each`);

    const startTime = Date.now();
    const results: number[] = [];
    const errors: string[] = [];
    let successfulRequests = 0;
    let failedRequests = 0;

    // Create mock users
    const users = Array.from({ length: options.concurrentUsers }, (_, i) => ({
      id: `load-test-user-${i}`,
      role: i % 3 === 0 ? 'admin' : i % 2 === 0 ? 'user' : 'viewer',
      email: `user${i}@test.com`,
    }));

    // Run concurrent user simulations
    const userPromises = users.map(async (user, userIndex) => {
      this.securityService.setCurrentUser(user);
      
      for (let requestIndex = 0; requestIndex < options.requestsPerUser; requestIndex++) {
        const requestStartTime = Date.now();
        
        try {
          // Simulate different types of requests
          const requestType = requestIndex % 4;
          
          switch (requestType) {
            case 0:
              // Simulate data fetching
              await this.simulateDataFetch();
              break;
            case 1:
              // Simulate data creation
              await this.simulateDataCreation(userIndex, requestIndex);
              break;
            case 2:
              // Simulate data update
              await this.simulateDataUpdate(userIndex, requestIndex);
              break;
            case 3:
              // Simulate permission check
              await this.simulatePermissionCheck();
              break;
          }
          
          const responseTime = Date.now() - requestStartTime;
          results.push(responseTime);
          successfulRequests++;
          
        } catch (error) {
          const responseTime = Date.now() - requestStartTime;
          results.push(responseTime);
          failedRequests++;
          errors.push(`User ${userIndex}, Request ${requestIndex}: ${error}`);
        }
        
        // Delay between requests
        if (options.delayBetweenRequests > 0) {
          await this.delay(options.delayBetweenRequests);
        }
      }
    });

    // Wait for all users to complete
    await Promise.all(userPromises);

    const endTime = Date.now();
    const totalDuration = endTime - startTime;

    // Calculate statistics
    const averageResponseTime = results.reduce((sum, time) => sum + time, 0) / results.length;
    const minResponseTime = Math.min(...results);
    const maxResponseTime = Math.max(...results);
    const requestsPerSecond = (successfulRequests + failedRequests) / (totalDuration / 1000);

    const testResult: LoadTestResult = {
      testName,
      totalRequests: successfulRequests + failedRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      minResponseTime,
      maxResponseTime,
      requestsPerSecond,
      errors,
    };

    console.log(`✅ Load test completed: ${testName}`);
    console.log(`📈 Total requests: ${testResult.totalRequests}`);
    console.log(`✅ Successful: ${testResult.successfulRequests}`);
    console.log(`❌ Failed: ${testResult.failedRequests}`);
    console.log(`⏱️ Average response time: ${testResult.averageResponseTime.toFixed(2)}ms`);
    console.log(`🚀 Requests per second: ${testResult.requestsPerSecond.toFixed(2)}`);

    return testResult;
  }

  private async simulateDataFetch(): Promise<void> {
    // Simulate data fetching with random delay
    const delay = Math.random() * 100 + 50; // 50-150ms
    await this.delay(delay);
    
    // Simulate cache hit/miss
    const cacheHit = Math.random() > 0.3; // 70% cache hit rate
    if (!cacheHit) {
      await this.delay(Math.random() * 200 + 100); // Additional delay for cache miss
    }
  }

  private async simulateDataCreation(userIndex: number, requestIndex: number): Promise<void> {
    const data = {
      id: `item-${userIndex}-${requestIndex}-${Date.now()}`,
      name: `Test Item ${userIndex}-${requestIndex}`,
      amount: Math.random() * 1000,
      description: `Description for item ${userIndex}-${requestIndex}`,
      createdAt: new Date().toISOString(),
    };

    // Simulate data validation and sanitization
    const sanitizedData = this.securityService.sanitizeData(data);
    
    // Simulate permission check
    const hasPermission = this.securityService.hasPermission('dues', 'create', sanitizedData);
    if (!hasPermission) {
      throw new Error('Permission denied');
    }

    // Simulate database write
    await this.delay(Math.random() * 150 + 100); // 100-250ms
  }

  private async simulateDataUpdate(userIndex: number, requestIndex: number): Promise<void> {
    const data = {
      id: `item-${userIndex}-${requestIndex}`,
      name: `Updated Item ${userIndex}-${requestIndex}`,
      amount: Math.random() * 1000,
      updatedAt: new Date().toISOString(),
    };

    // Simulate permission check
    const hasPermission = this.securityService.hasPermission('dues', 'update', data);
    if (!hasPermission) {
      throw new Error('Permission denied');
    }

    // Simulate database update
    await this.delay(Math.random() * 120 + 80); // 80-200ms
  }

  private async simulatePermissionCheck(): Promise<void> {
    const resources = ['dues', 'customers', 'payments', 'reports'];
    const actions = ['read', 'write', 'update', 'delete'];
    
    const resource = resources[Math.floor(Math.random() * resources.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    
    // Simulate permission check
    await this.delay(Math.random() * 20 + 10); // 10-30ms
    
    // Simulate random permission result (90% success rate)
    const hasPermission = Math.random() > 0.1;
    if (!hasPermission) {
      throw new Error(`Permission denied for ${action} on ${resource}`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async runStandardLoadTests(): Promise<LoadTestResult[]> {
    const tests = [
      {
        name: 'Light Load Test',
        options: {
          concurrentUsers: 10,
          requestsPerUser: 20,
          delayBetweenRequests: 100,
          testDuration: 30000, // 30 seconds
        },
      },
      {
        name: 'Medium Load Test',
        options: {
          concurrentUsers: 50,
          requestsPerUser: 50,
          delayBetweenRequests: 50,
          testDuration: 60000, // 1 minute
        },
      },
      {
        name: 'Heavy Load Test',
        options: {
          concurrentUsers: 100,
          requestsPerUser: 100,
          delayBetweenRequests: 10,
          testDuration: 120000, // 2 minutes
        },
      },
      {
        name: 'Stress Test',
        options: {
          concurrentUsers: 200,
          requestsPerUser: 200,
          delayBetweenRequests: 0,
          testDuration: 180000, // 3 minutes
        },
      },
    ];

    const results: LoadTestResult[] = [];
    
    for (const test of tests) {
      console.log(`\n🔄 Running ${test.name}...`);
      const result = await this.runLoadTest(test.name, test.options);
      results.push(result);
      
      // Brief pause between tests
      await this.delay(5000);
    }

    return results;
  }

  generateLoadTestReport(results: LoadTestResult[]): string {
    const report = [
      '# Dynamic Architecture Load Test Report',
      `Generated on: ${new Date().toISOString()}`,
      '',
      '## Test Summary',
      '',
      '| Test Name | Total Requests | Success Rate | Avg Response Time | Requests/Second |',
      '|-----------|---------------|--------------|-------------------|-----------------|',
    ];

    results.forEach(result => {
      const successRate = ((result.successfulRequests / result.totalRequests) * 100).toFixed(1);
      report.push(
        `| ${result.testName} | ${result.totalRequests} | ${successRate}% | ${result.averageResponseTime.toFixed(2)}ms | ${result.requestsPerSecond.toFixed(2)} |`
      );
    });

    report.push('', '## Detailed Results', '');

    results.forEach(result => {
      report.push(`### ${result.testName}`);
      report.push(`- **Total Requests**: ${result.totalRequests}`);
      report.push(`- **Successful Requests**: ${result.successfulRequests}`);
      report.push(`- **Failed Requests**: ${result.failedRequests}`);
      report.push(`- **Success Rate**: ${((result.successfulRequests / result.totalRequests) * 100).toFixed(1)}%`);
      report.push(`- **Average Response Time**: ${result.averageResponseTime.toFixed(2)}ms`);
      report.push(`- **Min Response Time**: ${result.minResponseTime}ms`);
      report.push(`- **Max Response Time**: ${result.maxResponseTime}ms`);
      report.push(`- **Requests per Second**: ${result.requestsPerSecond.toFixed(2)}`);
      
      if (result.errors.length > 0) {
        report.push(`- **Errors**: ${result.errors.length}`);
        report.push('', '**Error Samples**:');
        result.errors.slice(0, 5).forEach(error => {
          report.push(`  - ${error}`);
        });
      }
      
      report.push('');
    });

    report.push('## Performance Analysis', '');
    
    const avgResponseTimes = results.map(r => r.averageResponseTime);
    const avgRequestsPerSecond = results.map(r => r.requestsPerSecond);
    
    report.push(`- **Best Average Response Time**: ${Math.min(...avgResponseTimes).toFixed(2)}ms`);
    report.push(`- **Worst Average Response Time**: ${Math.max(...avgResponseTimes).toFixed(2)}ms`);
    report.push(`- **Best Throughput**: ${Math.max(...avgRequestsPerSecond).toFixed(2)} requests/second`);
    report.push(`- **Overall Success Rate**: ${((results.reduce((sum, r) => sum + r.successfulRequests, 0) / results.reduce((sum, r) => sum + r.totalRequests, 0)) * 100).toFixed(1)}%`);

    report.push('', '## Recommendations', '');
    
    const hasPerformanceIssues = results.some(r => r.averageResponseTime > 500);
    const hasReliabilityIssues = results.some(r => (r.failedRequests / r.totalRequests) > 0.05);
    
    if (hasPerformanceIssues) {
      report.push('- **Performance**: Consider implementing additional caching strategies');
      report.push('- **Performance**: Optimize database queries for better response times');
      report.push('- **Performance**: Consider using CDN for static content');
    }
    
    if (hasReliabilityIssues) {
      report.push('- **Reliability**: Implement circuit breakers for failing services');
      report.push('- **Reliability**: Add retry mechanisms with exponential backoff');
      report.push('- **Reliability**: Improve error handling and logging');
    }
    
    if (!hasPerformanceIssues && !hasReliabilityIssues) {
      report.push('- **Status**: System is performing well under tested load conditions');
      report.push('- **Recommendation**: Continue monitoring performance metrics');
      report.push('- **Recommendation**: Consider testing with higher loads for capacity planning');
    }

    return report.join('\n');
  }
}

// Export a singleton instance
export const loadTestingService = new LoadTestingService();