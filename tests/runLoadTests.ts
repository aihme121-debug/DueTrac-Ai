import { loadTestingService } from './loadTestingService';

async function runAllTests() {
  console.log('🚀 Starting Dynamic Architecture Load Testing Suite...\n');
  
  try {
    // Run standard load tests
    console.log('📊 Running Standard Load Tests...\n');
    const results = await loadTestingService.runStandardLoadTests();
    
    // Generate and display report
    console.log('\n📋 Generating Load Test Report...\n');
    const report = loadTestingService.generateLoadTestReport(results);
    
    console.log('📄 Load Test Report:');
    console.log('='.repeat(50));
    console.log(report);
    console.log('='.repeat(50));
    
    // Save report to file
    const fs = require('fs');
    const path = require('path');
    
    const reportPath = path.join(__dirname, 'load-test-report.md');
    fs.writeFileSync(reportPath, report);
    
    console.log(`\n✅ Load test report saved to: ${reportPath}`);
    
    // Performance summary
    const avgResponseTimes = results.map(r => r.averageResponseTime);
    const avgRequestsPerSecond = results.map(r => r.requestsPerSecond);
    const overallSuccessRate = (results.reduce((sum, r) => sum + r.successfulRequests, 0) / 
                                results.reduce((sum, r) => sum + r.totalRequests, 0)) * 100;
    
    console.log('\n📈 Performance Summary:');
    console.log(`- Best Response Time: ${Math.min(...avgResponseTimes).toFixed(2)}ms`);
    console.log(`- Worst Response Time: ${Math.max(...avgResponseTimes).toFixed(2)}ms`);
    console.log(`- Best Throughput: ${Math.max(...avgRequestsPerSecond).toFixed(2)} req/s`);
    console.log(`- Overall Success Rate: ${overallSuccessRate.toFixed(1)}%`);
    
    // Recommendations based on results
    console.log('\n💡 Recommendations:');
    
    if (overallSuccessRate < 95) {
      console.log('- ⚠️  Success rate below 95% - investigate failures');
    }
    
    if (Math.max(...avgResponseTimes) > 1000) {
      console.log('- ⚠️  Response times exceeding 1 second - optimize performance');
    }
    
    if (Math.max(...avgRequestsPerSecond) < 10) {
      console.log('- ⚠️  Low throughput - consider scaling infrastructure');
    }
    
    if (overallSuccessRate >= 95 && Math.max(...avgResponseTimes) <= 1000) {
      console.log('- ✅ System performing well under tested load conditions');
      console.log('- ✅ Consider testing with higher loads for capacity planning');
    }
    
  } catch (error) {
    console.error('❌ Load testing failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().then(() => {
    console.log('\n🎉 Load testing completed successfully!');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Load testing failed:', error);
    process.exit(1);
  });
}

export { runAllTests };