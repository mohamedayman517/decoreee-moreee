const mongoose = require('mongoose');
const { redisManager } = require('../config/redis');
const logger = require('../utils/Logger');

class HealthController {
  /**
   * Get comprehensive health status
   */
  async getHealth() {
    try {
      const startTime = Date.now();
      
      // Check database connection
      const dbHealth = await this.checkDatabase();
      
      // Check Redis connection
      const redisHealth = await this.checkRedis();
      
      // Check system resources
      const systemHealth = this.checkSystem();
      
      // Overall health status
      const isHealthy = dbHealth.status === 'healthy' && 
                       redisHealth.status === 'healthy' && 
                       systemHealth.status === 'healthy';
      
      const health = {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime: Date.now() - startTime,
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        checks: {
          database: dbHealth,
          redis: redisHealth,
          system: systemHealth
        }
      };
      
      logger.info('Health check completed', { 
        status: health.status,
        responseTime: health.responseTime 
      });
      
      return health;
    } catch (error) {
      logger.error('Health check failed', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Check database connection health
   */
  async checkDatabase() {
    try {
      const startTime = Date.now();
      
      // Check MongoDB connection
      const dbState = mongoose.connection.readyState;
      const isConnected = dbState === 1; // 1 = connected
      
      if (isConnected) {
        // Test database operation
        await mongoose.connection.db.admin().ping();
        
        return {
          status: 'healthy',
          message: 'Database connection is healthy',
          responseTime: Date.now() - startTime,
          details: {
            state: this.getConnectionState(dbState),
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            name: mongoose.connection.name
          }
        };
      } else {
        return {
          status: 'unhealthy',
          message: 'Database connection is not healthy',
          responseTime: Date.now() - startTime,
          details: {
            state: this.getConnectionState(dbState)
          }
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'Database health check failed',
        error: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }
  
  /**
   * Check Redis connection health
   */
  async checkRedis() {
    try {
      const startTime = Date.now();
      
      if (!redisManager || !redisManager.isConnected) {
        return {
          status: 'unhealthy',
          message: 'Redis is not connected',
          responseTime: Date.now() - startTime
        };
      }
      
      // Test Redis operation
      const testKey = 'health:check:test';
      const testValue = 'ping';
      
      await redisManager.set(testKey, testValue, 10); // 10 seconds TTL
      const result = await redisManager.get(testKey);
      await redisManager.del(testKey);
      
      if (result === testValue) {
        return {
          status: 'healthy',
          message: 'Redis connection is healthy',
          responseTime: Date.now() - startTime
        };
      } else {
        return {
          status: 'unhealthy',
          message: 'Redis test operation failed',
          responseTime: Date.now() - startTime
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'Redis health check failed',
        error: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }
  
  /**
   * Check system resources
   */
  checkSystem() {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      // Memory usage in MB
      const memoryUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
      const memoryTotal = Math.round(memUsage.heapTotal / 1024 / 1024);
      const memoryUsagePercent = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
      
      // Determine health based on memory usage
      const isHealthy = memoryUsagePercent < 90; // Consider unhealthy if > 90%
      
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        message: isHealthy ? 'System resources are healthy' : 'High memory usage detected',
        details: {
          memory: {
            used: `${memoryUsed}MB`,
            total: `${memoryTotal}MB`,
            usage: `${memoryUsagePercent}%`,
            external: Math.round(memUsage.external / 1024 / 1024) + 'MB'
          },
          cpu: {
            user: cpuUsage.user,
            system: cpuUsage.system
          },
          uptime: Math.round(process.uptime()),
          pid: process.pid,
          platform: process.platform,
          nodeVersion: process.version
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'System health check failed',
        error: error.message
      };
    }
  }
  
  /**
   * Get human-readable connection state
   */
  getConnectionState(state) {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[state] || 'unknown';
  }
  
  /**
   * Get simple health status (for quick checks)
   */
  async getSimpleHealth() {
    try {
      const health = await this.getHealth();
      return {
        status: health.status,
        timestamp: health.timestamp,
        uptime: health.uptime
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }
}

const healthController = new HealthController();
module.exports = { healthController };
