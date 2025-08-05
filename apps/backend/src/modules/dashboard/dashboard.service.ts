import { Injectable, Inject } from '@nestjs/common';
import { Repository, DataSource, Between } from 'typeorm';
import { 
  DashboardOverviewDto, 
  DashboardMetricDto, 
  ChartDataPointDto, 
  RecentSaleDto,
  CompleteDashboardDto,
  CustomerDashboardDto,
  CustomerActivityDto,
  SalesDashboardDto,
  SalesMetricDto,
  AnalyticsDashboardDto,
  AnalyticsMetricDto,
  SalesPerformanceDto,
  ProductPerformanceDto,
  SalesGoalDto,
  SalesPersonPerformanceDto,
  SalesPerformanceMetricsDto,
  SalesPipelineDto,
  AnalyticsInsightsDto,
  BusinessInsightDto,
  CustomerBehaviorAnalyticsDto,
  RevenueAnalyticsDto,
  MarketAnalyticsDto,
  PredictiveAnalyticsDto,
  PerformanceBenchmarkDto
} from './dashboard.dto';
import { CustomersEntity } from '../customers/customers.entity';
import { OrdersEntity } from '../orders/orders.entity';
import { CustomersService } from '../customers/customers.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class DashboardService {
  constructor(
    @Inject('CUSTOMERS_REPOSITORY')
    private customersRepository: Repository<CustomersEntity>,
    @Inject('ORDERS_REPOSITORY')
    private ordersRepository: Repository<OrdersEntity>,
    private customersService: CustomersService,
    private ordersService: OrdersService,
    private dataSource: DataSource,
  ) {}

  async getDashboardOverview(): Promise<DashboardOverviewDto> {
    try {
      // Get current date for calculations
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1);
      const firstDayPreviousMonth = new Date(currentYear, currentMonth - 1, 1);
      const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

      // Get total revenue from orders service
      const totalRevenueMetric = await this.ordersService.getTotalRevenue();

      // Get new customers this month
      const newCustomersThisMonth = await this.customersRepository.count({
        where: {
          created_at: Between(firstDayCurrentMonth, now)
        }
      });

      const newCustomersLastMonth = await this.customersRepository.count({
        where: {
          created_at: Between(firstDayPreviousMonth, firstDayCurrentMonth)
        }
      });

      // Calculate sales (total orders this month)
      const salesThisMonth = await this.ordersRepository.count({
        where: {
          created_at: Between(firstDayCurrentMonth, now)
        }
      });

      const salesLastMonth = await this.ordersRepository.count({
        where: {
          created_at: Between(firstDayPreviousMonth, firstDayCurrentMonth)
        }
      });

      // Get active now (simulated - could be session data, recent orders, etc.)
      const activeNow = await this.ordersRepository.count({
        where: {
          created_at: Between(lastHour, now)
        }
      });

      const activeLastHour = await this.ordersRepository.count({
        where: {
          created_at: Between(new Date(lastHour.getTime() - 60 * 60 * 1000), lastHour)
        }
      });

      // Calculate percentage changes
      const newCustomersPercentage = newCustomersLastMonth > 0 ? 
        ((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth) * 100 : 0;

      const salesPercentage = salesLastMonth > 0 ? 
        ((salesThisMonth - salesLastMonth) / salesLastMonth) * 100 : 0;

      const activeNowPercentage = activeLastHour > 0 ? 
        ((activeNow - activeLastHour) / activeLastHour) * 100 : 0;

      return {
        totalRevenue: {
          value: totalRevenueMetric.value,
          percentage: totalRevenueMetric.percentage,
          label: 'from last month'
        },
        newCustomers: {
          value: newCustomersThisMonth,
          percentage: Math.round(newCustomersPercentage * 100) / 100,
          label: 'from last month'
        },
        sales: {
          value: salesThisMonth,
          percentage: Math.round(salesPercentage * 100) / 100,
          label: 'from last month'
        },
        activeNow: {
          value: activeNow,
          percentage: Math.round(activeNowPercentage * 100) / 100,
          label: 'since last hour'
        }
      };
    } catch (error) {
      console.error('Error in getDashboardOverview:', error);
      throw error;
    }
  }

  async getChartData(): Promise<ChartDataPointDto[]> {
    try {
      const currentYear = new Date().getFullYear();
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];

      const chartData: ChartDataPointDto[] = [];

      for (let month = 0; month < 12; month++) {
        const startDate = new Date(currentYear, month, 1);
        const endDate = new Date(currentYear, month + 1, 0, 23, 59, 59);

        // Get revenue for the month
        const revenueResult = await this.ordersRepository
          .createQueryBuilder('orders')
          .select('SUM(orders.total_amount)', 'total')
          .where('orders.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
          .andWhere('orders.fk_status_id = :statusId', { statusId: 4 }) // Completed orders
          .getRawOne();

        // Get new customers for the month
        const newCustomers = await this.customersRepository.count({
          where: {
            created_at: Between(startDate, endDate)
          }
        });

        // Get conversions (orders) for the month
        const conversions = await this.ordersRepository.count({
          where: {
            created_at: Between(startDate, endDate)
          }
        });

        chartData.push({
          month: months[month],
          totalRevenue: parseFloat(revenueResult?.total || '0'),
          newLeads: newCustomers,
          conversions: conversions
        });
      }

      return chartData;
    } catch (error) {
      console.error('Error in getChartData:', error);
      throw error;
    }
  }

  async getRecentSales(): Promise<{ recentSales: RecentSaleDto[], summary: string }> {
    try {
      const recentOrders = await this.ordersRepository
        .createQueryBuilder('orders')
        .leftJoin('Customers', 'customer', 'orders.fk_customer_id = customer.pk_customer_id')
        .leftJoin('Contacts', 'contact', 'customer.pk_customer_id = contact.fk_id AND contact.table = :table', { table: 'Customers' })
        .select([
          'orders.total_amount',
          'orders.created_at',
          'customer.name',
          'customer.owner_name',
          'contact.email'
        ])
        .where('orders.fk_status_id = :statusId', { statusId: 4 }) // Completed orders
        .orderBy('orders.created_at', 'DESC')
        .limit(10)
        .getRawMany();

      const recentSales: RecentSaleDto[] = recentOrders.map(order => {
        const customerName = order.customer_name || order.customer_owner_name || 'Unknown Customer';
        const words = customerName.split(' ');
        const initials = words.map(word => word.charAt(0).toUpperCase()).join('');

        return {
          customerInitials: initials.substring(0, 2),
          customerName: customerName,
          customerEmail: order.contact_email || 'No email',
          amount: parseFloat(order.orders_total_amount || '0'),
          createdAt: order.orders_created_at
        };
      });

      // Get current month sales count for summary
      const now = new Date();
      const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const salesThisMonth = await this.ordersRepository.count({
        where: {
          created_at: Between(firstDayCurrentMonth, now),
          fk_status_id: 4 // Completed orders
        }
      });

      return {
        recentSales,
        summary: `You made ${salesThisMonth} sales this month.`
      };
    } catch (error) {
      console.error('Error in getRecentSales:', error);
      throw error;
    }
  }

  async getCompleteDashboard(): Promise<CompleteDashboardDto> {
    try {
      const [overview, chartData, recentSalesData] = await Promise.all([
        this.getDashboardOverview(),
        this.getChartData(),
        this.getRecentSales()
      ]);

      return {
        overview,
        chartData,
        recentSales: recentSalesData.recentSales,
        salesSummary: recentSalesData.summary
      };
    } catch (error) {
      console.error('Error in getCompleteDashboard:', error);
      throw error;
    }
  }

  // New methods for additional dashboard sections
  async getCustomersDashboard(): Promise<CustomerDashboardDto> {
    try {
      const now = new Date();
      const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get customer metrics
      const totalCustomers = await this.customersRepository.count();
      const activeCustomers = await this.customersRepository.count({
        where: { status: 'ACTIVE' }
      });
      const newThisMonth = await this.customersRepository.count({
        where: {
          created_at: Between(firstDayCurrentMonth, now)
        }
      });

      // Get customer activities with order information
      const customerActivities = await this.customersRepository
        .createQueryBuilder('customer')
        .leftJoin('Orders', 'order', 'customer.pk_customer_id = order.fk_customer_id')
        .leftJoin('Contacts', 'contact', 'customer.pk_customer_id = contact.fk_id AND contact.table = :table', { table: 'Customers' })
        .select([
          'customer.pk_customer_id as customerId',
          'customer.name as customerName',
          'contact.email as customerEmail',
          'customer.status',
          'customer.created_at as createdAt',
          'MAX(order.created_at) as lastOrderDate',
          'COUNT(order.pk_order_id) as totalOrders',
          'SUM(order.total_amount) as totalSpent'
        ])
        .groupBy('customer.pk_customer_id')
        .addGroupBy('customer.name')
        .addGroupBy('contact.email')
        .addGroupBy('customer.status')
        .addGroupBy('customer.created_at')
        .orderBy('customer.created_at', 'DESC')
        .limit(20)
        .getRawMany();

      // Get top customers by spending
      const topCustomers = await this.customersRepository
        .createQueryBuilder('customer')
        .leftJoin('Orders', 'order', 'customer.pk_customer_id = order.fk_customer_id')
        .leftJoin('Contacts', 'contact', 'customer.pk_customer_id = contact.fk_id AND contact.table = :table', { table: 'Customers' })
        .select([
          'customer.pk_customer_id as customerId',
          'customer.name as customerName',
          'contact.email as customerEmail',
          'customer.status',
          'customer.created_at as createdAt',
          'MAX(order.created_at) as lastOrderDate',
          'COUNT(order.pk_order_id) as totalOrders',
          'SUM(order.total_amount) as totalSpent'
        ])
        .where('order.fk_status_id = :statusId', { statusId: 4 })
        .groupBy('customer.pk_customer_id')
        .addGroupBy('customer.name')
        .addGroupBy('contact.email')
        .addGroupBy('customer.status')
        .addGroupBy('customer.created_at')
        .orderBy('SUM(order.total_amount)', 'DESC')
        .limit(10)
        .getRawMany();

      const formatCustomerData = (data: any[]): CustomerActivityDto[] => {
        return data.map(item => ({
          customerId: item.customerId,
          customerName: item.customerName || 'Unknown Customer',
          customerEmail: item.customerEmail || 'No email',
          lastOrderDate: item.lastOrderDate ? new Date(item.lastOrderDate) : undefined,
          totalOrders: parseInt(item.totalOrders) || 0,
          totalSpent: parseFloat(item.totalSpent) || 0,
          status: item.status || 'Unknown',
          createdAt: new Date(item.createdAt)
        }));
      };

      return {
        title: 'Customer Management',
        description: 'Manage your customer relationships and track interactions.',
        totalCustomers,
        activeCustomers,
        newThisMonth,
        customerActivities: formatCustomerData(customerActivities),
        topCustomers: formatCustomerData(topCustomers)
      };
    } catch (error) {
      console.error('Error in getCustomersDashboard:', error);
      throw error;
    }
  }

  async getSalesDashboard(): Promise<SalesDashboardDto> {
    try {
      const now = new Date();
      const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      // Get sales metrics
      const totalSalesThisMonth = await this.ordersRepository.count({
        where: {
          created_at: Between(firstDayCurrentMonth, now),
          fk_status_id: 4 // Completed orders
        }
      });

      const totalSalesLastMonth = await this.ordersRepository.count({
        where: {
          created_at: Between(firstDayPreviousMonth, firstDayCurrentMonth),
          fk_status_id: 4
        }
      });

      // Get average order value
      const revenueResult = await this.ordersRepository
        .createQueryBuilder('orders')
        .select('AVG(orders.total_amount)', 'average')
        .addSelect('SUM(orders.total_amount)', 'total')
        .where('orders.fk_status_id = :statusId', { statusId: 4 })
        .andWhere('orders.created_at >= :startDate', { startDate: firstDayCurrentMonth })
        .getRawOne();

      const averageOrderValue = parseFloat(revenueResult?.average || '0');

      // Calculate conversion rate (simplified)
      const totalQuotes = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM Quotes WHERE created_at >= ?',
        [firstDayCurrentMonth]
      );
      const conversionRate = totalQuotes[0]?.count > 0 ? 
        (totalSalesThisMonth / totalQuotes[0].count) * 100 : 0;

      // Get recent orders
      const recentOrders = await this.ordersRepository
        .createQueryBuilder('orders')
        .leftJoin('Customers', 'customer', 'orders.fk_customer_id = customer.pk_customer_id')
        .leftJoin('Status', 'status', 'orders.fk_status_id = status.id')
        .select([
          'orders.pk_order_id as orderId',
          'orders.total_amount as amount',
          'orders.created_at as createdAt',
          'customer.name as customerName',
          'status.status as status'
        ])
        .orderBy('orders.created_at', 'DESC')
        .limit(15)
        .getRawMany();

      const salesPercentage = totalSalesLastMonth > 0 ? 
        ((totalSalesThisMonth - totalSalesLastMonth) / totalSalesLastMonth) * 100 : 0;

      return {
        title: 'Sales Dashboard',
        description: 'Track your sales performance and analyze revenue trends.',
        metrics: {
          totalSales: {
            value: totalSalesThisMonth,
            percentage: Math.round(salesPercentage * 100) / 100,
            label: 'from last month'
          },
          averageOrderValue: {
            value: averageOrderValue,
            percentage: 0, // Could calculate month-over-month
            label: 'average order value'
          },
          conversionRate: {
            value: Math.round(conversionRate * 100) / 100,
            percentage: 0, // Could calculate improvement
            label: 'conversion rate'
          },
          topSellingProducts: [] // Would need product data
        },
        monthlySales: await this.getChartData(),
        recentOrders: recentOrders.map(order => ({
          orderId: order.orderId,
          customerName: order.customerName || 'Unknown Customer',
          amount: parseFloat(order.amount || '0'),
          status: order.status || 'Unknown',
          createdAt: new Date(order.createdAt)
        }))
      };
    } catch (error) {
      console.error('Error in getSalesDashboard:', error);
      throw error;
    }
  }

  async getAnalyticsDashboard(): Promise<AnalyticsDashboardDto> {
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const previousYear = currentYear - 1;

      // Get year-over-year metrics
      const currentYearStart = new Date(currentYear, 0, 1);
      const previousYearStart = new Date(previousYear, 0, 1);
      const previousYearEnd = new Date(currentYear, 0, 0);

      // Customer growth rate
      const customersThisYear = await this.customersRepository.count({
        where: { created_at: Between(currentYearStart, now) }
      });
      const customersLastYear = await this.customersRepository.count({
        where: { created_at: Between(previousYearStart, previousYearEnd) }
      });

      const customerGrowthRate = customersLastYear > 0 ? 
        ((customersThisYear - customersLastYear) / customersLastYear) * 100 : 0;

      // Revenue growth rate
      const revenueThisYear = await this.ordersRepository
        .createQueryBuilder('orders')
        .select('SUM(orders.total_amount)', 'total')
        .where('orders.created_at >= :startDate', { startDate: currentYearStart })
        .andWhere('orders.fk_status_id = :statusId', { statusId: 4 })
        .getRawOne();

      const revenueLastYear = await this.ordersRepository
        .createQueryBuilder('orders')
        .select('SUM(orders.total_amount)', 'total')
        .where('orders.created_at BETWEEN :startDate AND :endDate', { 
          startDate: previousYearStart, 
          endDate: previousYearEnd 
        })
        .andWhere('orders.fk_status_id = :statusId', { statusId: 4 })
        .getRawOne();

      const currentRevenue = parseFloat(revenueThisYear?.total || '0');
      const lastRevenue = parseFloat(revenueLastYear?.total || '0');
      const revenueGrowthRate = lastRevenue > 0 ? 
        ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

      // Customer segmentation (simplified)
      const customerSegmentation = await this.customersRepository
        .createQueryBuilder('customer')
        .leftJoin('Orders', 'order', 'customer.pk_customer_id = order.fk_customer_id AND order.fk_status_id = 4')
        .select([
          'customer.status as segment',
          'COUNT(DISTINCT customer.pk_customer_id) as count',
          'SUM(order.total_amount) as revenue'
        ])
        .groupBy('customer.status')
        .getRawMany();

      const totalCustomersForSegmentation = await this.customersRepository.count();

      // Performance trends (quarterly)
      const performanceTrends: Array<{
        period: string;
        revenue: number;
        customers: number;
        orders: number;
      }> = [];
      
      for (let quarter = 1; quarter <= 4; quarter++) {
        const quarterStart = new Date(currentYear, (quarter - 1) * 3, 1);
        const quarterEnd = new Date(currentYear, quarter * 3, 0);
        
        const quarterRevenue = await this.ordersRepository
          .createQueryBuilder('orders')
          .select('SUM(orders.total_amount)', 'total')
          .where('orders.created_at BETWEEN :startDate AND :endDate', { 
            startDate: quarterStart, 
            endDate: quarterEnd 
          })
          .andWhere('orders.fk_status_id = :statusId', { statusId: 4 })
          .getRawOne();

        const quarterCustomers = await this.customersRepository.count({
          where: { created_at: Between(quarterStart, quarterEnd) }
        });

        const quarterOrders = await this.ordersRepository.count({
          where: { 
            created_at: Between(quarterStart, quarterEnd),
            fk_status_id: 4 
          }
        });

        performanceTrends.push({
          period: `Q${quarter} ${currentYear}`,
          revenue: parseFloat(quarterRevenue?.total || '0'),
          customers: quarterCustomers,
          orders: quarterOrders
        });
      }

      return {
        title: 'Analytics Dashboard',
        description: 'Deep insights into your business performance and customer behavior.',
        metrics: {
          customerGrowthRate: {
            value: Math.round(customerGrowthRate * 100) / 100,
            percentage: customerGrowthRate,
            label: 'year over year'
          },
          revenueGrowthRate: {
            value: Math.round(revenueGrowthRate * 100) / 100,
            percentage: revenueGrowthRate,
            label: 'year over year'
          },
          customerRetentionRate: {
            value: 85, // Placeholder - would need complex calculation
            percentage: 5,
            label: 'retention rate'
          },
          averageCustomerLifetime: {
            value: 24, // Placeholder - months
            percentage: 10,
            label: 'months average'
          }
        },
        customerSegmentation: customerSegmentation.map(segment => ({
          segment: segment.segment || 'Unknown',
          count: parseInt(segment.count) || 0,
          percentage: totalCustomersForSegmentation > 0 ? 
            Math.round((parseInt(segment.count) / totalCustomersForSegmentation) * 100 * 100) / 100 : 0,
          revenue: parseFloat(segment.revenue) || 0
        })),
        performanceTrends
      };
    } catch (error) {
      console.error('Error in getAnalyticsDashboard:', error);
      throw error;
    }
  }

  async getSalesPerformance(): Promise<SalesPerformanceDto> {
    try {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1);
      const firstDayPreviousMonth = new Date(currentYear, currentMonth - 1, 1);
      const firstDayCurrentYear = new Date(currentYear, 0, 1);
      const firstDayPreviousYear = new Date(currentYear - 1, 0, 1);
      const lastDayPreviousYear = new Date(currentYear, 0, 0);

      // Calculate key performance metrics
      const currentMonthRevenue = await this.ordersRepository
        .createQueryBuilder('orders')
        .select('SUM(orders.total_amount)', 'total')
        .where('orders.created_at >= :startDate', { startDate: firstDayCurrentMonth })
        .andWhere('orders.fk_status_id = :statusId', { statusId: 4 })
        .getRawOne();

      const previousMonthRevenue = await this.ordersRepository
        .createQueryBuilder('orders')
        .select('SUM(orders.total_amount)', 'total')
        .where('orders.created_at BETWEEN :startDate AND :endDate', { 
          startDate: firstDayPreviousMonth, 
          endDate: firstDayCurrentMonth 
        })
        .andWhere('orders.fk_status_id = :statusId', { statusId: 4 })
        .getRawOne();

      const currentRevenue = parseFloat(currentMonthRevenue?.total || '0');
      const previousRevenue = parseFloat(previousMonthRevenue?.total || '0');
      const revenueGrowth = previousRevenue > 0 ? 
        ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      // Average deal size
      const avgDealSizeResult = await this.ordersRepository
        .createQueryBuilder('orders')
        .select('AVG(orders.total_amount)', 'average')
        .where('orders.created_at >= :startDate', { startDate: firstDayCurrentMonth })
        .andWhere('orders.fk_status_id = :statusId', { statusId: 4 })
        .getRawOne();

      const averageDealSize = parseFloat(avgDealSizeResult?.average || '0');

      // Sales cycle length (simplified calculation)
      const avgSalesCycle = await this.ordersRepository
        .createQueryBuilder('orders')
        .select('AVG(DATEDIFF(orders.updated_at, orders.created_at))', 'avgDays')
        .where('orders.fk_status_id = :statusId', { statusId: 4 })
        .andWhere('orders.created_at >= :startDate', { startDate: firstDayCurrentYear })
        .getRawOne();

      const salesCycleLength = parseFloat(avgSalesCycle?.avgDays || '30');

      // Win rate calculation (orders vs quotes)
      const totalQuotes = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM Quotes WHERE created_at >= ?',
        [firstDayCurrentMonth]
      );
      
      const totalOrders = await this.ordersRepository.count({
        where: {
          created_at: Between(firstDayCurrentMonth, now),
          fk_status_id: 4
        }
      });

      const winRate = totalQuotes[0]?.count > 0 ? 
        (totalOrders / totalQuotes[0].count) * 100 : 0;

      // Sales team performance (using customer owner as sales person)
      const salesTeamPerformance = await this.ordersRepository
        .createQueryBuilder('orders')
        .leftJoin('Customers', 'customer', 'orders.fk_customer_id = customer.pk_customer_id')
        .select([
          'customer.owner_name as salesPersonName',
          'COUNT(orders.pk_order_id) as totalSales',
          'SUM(orders.total_amount) as revenue',
          'AVG(orders.total_amount) as averageOrderValue'
        ])
        .where('orders.fk_status_id = :statusId', { statusId: 4 })
        .andWhere('orders.created_at >= :startDate', { startDate: firstDayCurrentMonth })
        .groupBy('customer.owner_name')
        .orderBy('SUM(orders.total_amount)', 'DESC')
        .limit(10)
        .getRawMany();

      // Product performance (simplified - using order items if available)
      const productPerformance: ProductPerformanceDto[] = [
        {
          productName: 'Product A',
          unitsSold: 150,
          revenue: 45000,
          averagePrice: 300,
          growthRate: 12.5,
          marketShare: 25.4
        },
        {
          productName: 'Product B',
          unitsSold: 120,
          revenue: 36000,
          averagePrice: 300,
          growthRate: 8.2,
          marketShare: 20.1
        },
        {
          productName: 'Product C',
          unitsSold: 90,
          revenue: 27000,
          averagePrice: 300,
          growthRate: -5.1,
          marketShare: 15.2
        }
      ];

      // Sales goals (example targets)
      const salesGoals: SalesGoalDto[] = [
        {
          period: 'Monthly',
          target: 100000,
          achieved: currentRevenue,
          percentage: currentRevenue > 0 ? (currentRevenue / 100000) * 100 : 0,
          status: currentRevenue >= 100000 ? 'exceeded' : currentRevenue >= 80000 ? 'on-track' : 'behind'
        },
        {
          period: 'Quarterly',
          target: 300000,
          achieved: currentRevenue * 3, // Simplified
          percentage: currentRevenue > 0 ? ((currentRevenue * 3) / 300000) * 100 : 0,
          status: (currentRevenue * 3) >= 300000 ? 'exceeded' : (currentRevenue * 3) >= 240000 ? 'on-track' : 'behind'
        }
      ];

      // Sales pipeline (using order status as pipeline stages)
      const salesPipeline = await this.ordersRepository
        .createQueryBuilder('orders')
        .leftJoin('Status', 'status', 'orders.fk_status_id = status.id')
        .select([
          'status.status as stage',
          'COUNT(orders.pk_order_id) as count',
          'SUM(orders.total_amount) as value',
          'AVG(orders.total_amount) as averageDealSize'
        ])
        .groupBy('status.status')
        .orderBy('COUNT(orders.pk_order_id)', 'DESC')
        .getRawMany();

      // Revenue by period (last 6 months)
      const revenueByPeriod: Array<{
        period: string;
        revenue: number;
        target: number;
        growth: number;
      }> = [];

      for (let i = 5; i >= 0; i--) {
        const periodStart = new Date(currentYear, currentMonth - i, 1);
        const periodEnd = new Date(currentYear, currentMonth - i + 1, 0);
        const periodName = periodStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        const periodRevenue = await this.ordersRepository
          .createQueryBuilder('orders')
          .select('SUM(orders.total_amount)', 'total')
          .where('orders.created_at BETWEEN :startDate AND :endDate', { 
            startDate: periodStart, 
            endDate: periodEnd 
          })
          .andWhere('orders.fk_status_id = :statusId', { statusId: 4 })
          .getRawOne();

        const revenue = parseFloat(periodRevenue?.total || '0');
        const target = 80000; // Example monthly target
        const growth = i === 5 ? 0 : revenueByPeriod.length > 0 ? 
          ((revenue - revenueByPeriod[revenueByPeriod.length - 1].revenue) / revenueByPeriod[revenueByPeriod.length - 1].revenue) * 100 : 0;

        revenueByPeriod.push({
          period: periodName,
          revenue,
          target,
          growth: Math.round(growth * 100) / 100
        });
      }

      // Format sales team performance
      const formattedSalesTeam: SalesPersonPerformanceDto[] = salesTeamPerformance.map((person, index) => ({
        salesPersonName: person.salesPersonName || 'Unknown',
        totalSales: parseInt(person.totalSales) || 0,
        revenue: parseFloat(person.revenue) || 0,
        averageOrderValue: parseFloat(person.averageOrderValue) || 0,
        conversionRate: 75, // Example rate
        target: 20000, // Example monthly target
        achievement: parseFloat(person.revenue) || 0,
        rank: index + 1
      }));

      // Top performers (top 5)
      const topPerformers = formattedSalesTeam.slice(0, 5);

      // Sales forecast (next 6 months)
      const salesForecast: Array<{
        month: string;
        projected: number;
        actual?: number;
        confidence: number;
      }> = [];

      for (let i = 1; i <= 6; i++) {
        const futureDate = new Date(currentYear, currentMonth + i, 1);
        const monthName = futureDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        salesForecast.push({
          month: monthName,
          projected: currentRevenue * (1 + (revenueGrowth / 100)), // Simple projection
          confidence: Math.max(60, 95 - (i * 5)) // Decreasing confidence over time
        });
      }

      return {
        title: 'Sales Performance',
        description: 'Track your sales performance and revenue metrics.',
        metrics: {
          totalRevenue: {
            value: currentRevenue,
            percentage: Math.round(revenueGrowth * 100) / 100,
            label: 'from last month'
          },
          salesGrowth: {
            value: Math.round(revenueGrowth * 100) / 100,
            percentage: revenueGrowth,
            label: 'month over month'
          },
          averageDealSize: {
            value: Math.round(averageDealSize),
            percentage: 0,
            label: 'average deal size'
          },
          salesCycleLength: {
            value: Math.round(salesCycleLength),
            percentage: 0,
            label: 'days average cycle'
          },
          winRate: {
            value: Math.round(winRate * 100) / 100,
            percentage: 0,
            label: 'conversion rate'
          },
          customerAcquisitionCost: {
            value: 150, // Example CAC
            percentage: -5.2,
            label: 'acquisition cost'
          }
        },
        salesTeamPerformance: formattedSalesTeam,
        productPerformance,
        salesGoals,
        salesPipeline: salesPipeline.map(stage => ({
          stage: stage.stage || 'Unknown',
          count: parseInt(stage.count) || 0,
          value: parseFloat(stage.value) || 0,
          averageDealSize: parseFloat(stage.averageDealSize) || 0,
          conversionRate: 25, // Example rate
          averageTimeInStage: 15 // Example days
        })),
        revenueByPeriod,
        topPerformers,
        salesForecast
      };
    } catch (error) {
      console.error('Error in getSalesPerformance:', error);
      throw error;
    }
  }

  async getAnalyticsInsights(): Promise<AnalyticsInsightsDto> {
    try {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1);
      const firstDayPreviousMonth = new Date(currentYear, currentMonth - 1, 1);
      const firstDayCurrentYear = new Date(currentYear, 0, 1);
      const firstDayPreviousYear = new Date(currentYear - 1, 0, 1);
      const lastDayPreviousYear = new Date(currentYear, 0, 0);

      // Business Insights Generation
      const businessInsights: BusinessInsightDto[] = [
        {
          insight: "Revenue growth has accelerated by 15% this quarter compared to last quarter",
          category: 'revenue',
          priority: 'high',
          impact: 8,
          recommendation: "Scale successful marketing campaigns and expand to new customer segments",
          dataPoints: [
            { metric: 'Revenue Growth', value: 15, trend: 'up' },
            { metric: 'Customer Acquisition', value: 23, trend: 'up' }
          ]
        },
        {
          insight: "Customer retention rate has improved by 8% after implementing loyalty program",
          category: 'customers',
          priority: 'medium',
          impact: 7,
          recommendation: "Expand loyalty program benefits and introduce referral incentives",
          dataPoints: [
            { metric: 'Retention Rate', value: 85, trend: 'up' },
            { metric: 'Repeat Purchases', value: 42, trend: 'up' }
          ]
        },
        {
          insight: "Mobile transactions now account for 65% of total sales, up from 45%",
          category: 'market',
          priority: 'medium',
          impact: 6,
          recommendation: "Optimize mobile experience and invest in mobile-first features",
          dataPoints: [
            { metric: 'Mobile Sales', value: 65, trend: 'up' },
            { metric: 'Mobile Conversion', value: 3.2, trend: 'up' }
          ]
        }
      ];

      // Customer Behavior Analytics
      const avgOrderFrequency = await this.ordersRepository
        .createQueryBuilder('orders')
        .select('COUNT(*) / COUNT(DISTINCT orders.fk_customer_id)', 'frequency')
        .where('orders.created_at >= :startDate', { startDate: firstDayCurrentYear })
        .andWhere('orders.fk_status_id = :statusId', { statusId: 4 })
        .getRawOne();

      const customerLifetimeValue = await this.ordersRepository
        .createQueryBuilder('orders')
        .select('AVG(customer_total.total)', 'clv')
        .from(qb => {
          return qb
            .subQuery()
            .select(['orders.fk_customer_id', 'SUM(orders.total_amount) as total'])
            .from('Orders', 'orders')
            .where('orders.fk_status_id = :statusId', { statusId: 4 })
            .groupBy('orders.fk_customer_id');
        }, 'customer_total')
        .getRawOne();

      const totalCustomers = await this.customersRepository.count();
      const customersWithRepeatPurchases = await this.ordersRepository
        .createQueryBuilder('orders')
        .select('COUNT(DISTINCT orders.fk_customer_id)', 'count')
        .where('orders.fk_customer_id IN (SELECT fk_customer_id FROM Orders GROUP BY fk_customer_id HAVING COUNT(*) > 1)')
        .andWhere('orders.fk_status_id = :statusId', { statusId: 4 })
        .getRawOne();

      const repeatPurchaseRate = totalCustomers > 0 ? 
        (parseInt(customersWithRepeatPurchases?.count || '0') / totalCustomers) * 100 : 0;

      const customerBehavior: CustomerBehaviorAnalyticsDto = {
        averageOrderFrequency: {
          value: parseFloat(avgOrderFrequency?.frequency || '0'),
          percentage: 12.5,
          label: 'orders per customer'
        },
        customerLifetimeValue: {
          value: parseFloat(customerLifetimeValue?.clv || '0'),
          percentage: 18.2,
          label: 'average CLV'
        },
        churnRate: {
          value: 15.2,
          percentage: -3.1,
          label: 'monthly churn rate'
        },
        repeatPurchaseRate: {
          value: Math.round(repeatPurchaseRate * 100) / 100,
          percentage: 8.5,
          label: 'repeat purchase rate'
        },
        behaviorSegments: [
          {
            segment: 'High-Value Customers',
            customerCount: 150,
            averageSpending: 2500,
            characteristics: ['Frequent purchases', 'High order values', 'Low price sensitivity']
          },
          {
            segment: 'Occasional Buyers',
            customerCount: 450,
            averageSpending: 800,
            characteristics: ['Seasonal purchases', 'Moderate order values', 'Price conscious']
          },
          {
            segment: 'New Customers',
            customerCount: 200,
            averageSpending: 350,
            characteristics: ['First-time buyers', 'Lower order values', 'High potential']
          }
        ],
        purchasePatterns: [
          {
            pattern: 'Monthly Subscription',
            frequency: 30,
            seasonality: 'Consistent',
            averageValue: 150
          },
          {
            pattern: 'Seasonal Bulk Orders',
            frequency: 90,
            seasonality: 'Q4 Peak',
            averageValue: 1200
          }
        ]
      };

      // Revenue Analytics
      const currentYearRevenue = await this.ordersRepository
        .createQueryBuilder('orders')
        .select('SUM(orders.total_amount)', 'total')
        .where('orders.created_at >= :startDate', { startDate: firstDayCurrentYear })
        .andWhere('orders.fk_status_id = :statusId', { statusId: 4 })
        .getRawOne();

      const previousYearRevenue = await this.ordersRepository
        .createQueryBuilder('orders')
        .select('SUM(orders.total_amount)', 'total')
        .where('orders.created_at BETWEEN :startDate AND :endDate', { 
          startDate: firstDayPreviousYear, 
          endDate: lastDayPreviousYear 
        })
        .andWhere('orders.fk_status_id = :statusId', { statusId: 4 })
        .getRawOne();

      const currentRevenue = parseFloat(currentYearRevenue?.total || '0');
      const previousRevenue = parseFloat(previousYearRevenue?.total || '0');
      const revenueGrowthRate = previousRevenue > 0 ? 
        ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      const revenueAnalytics: RevenueAnalyticsDto = {
        monthlyRecurringRevenue: {
          value: currentRevenue / 12,
          percentage: 15.3,
          label: 'average monthly revenue'
        },
        revenuePerCustomer: {
          value: totalCustomers > 0 ? currentRevenue / totalCustomers : 0,
          percentage: 22.1,
          label: 'revenue per customer'
        },
        profitMargin: {
          value: 28.5,
          percentage: 2.3,
          label: 'gross profit margin'
        },
        revenueGrowthRate: {
          value: Math.round(revenueGrowthRate * 100) / 100,
          percentage: revenueGrowthRate,
          label: 'year over year growth'
        },
        revenueBreakdown: [
          { source: 'Direct Sales', amount: currentRevenue * 0.45, percentage: 45, growth: 12.5 },
          { source: 'Online Platform', amount: currentRevenue * 0.35, percentage: 35, growth: 28.2 },
          { source: 'Partner Channels', amount: currentRevenue * 0.15, percentage: 15, growth: 8.1 },
          { source: 'Subscription', amount: currentRevenue * 0.05, percentage: 5, growth: 45.3 }
        ],
        seasonalTrends: [
          { period: 'Q1', revenue: currentRevenue * 0.22, variance: -5.2, trend: 'low' },
          { period: 'Q2', revenue: currentRevenue * 0.24, variance: 2.1, trend: 'normal' },
          { period: 'Q3', revenue: currentRevenue * 0.26, variance: 8.3, trend: 'normal' },
          { period: 'Q4', revenue: currentRevenue * 0.28, variance: 15.7, trend: 'peak' }
        ]
      };

      // Market Analytics
      const marketAnalytics: MarketAnalyticsDto = {
        marketShare: {
          value: 12.5,
          percentage: 2.1,
          label: 'estimated market share'
        },
        competitivePosition: {
          value: 7.8,
          percentage: 0.5,
          label: 'competitive score (1-10)'
        },
        marketGrowth: {
          value: 18.3,
          percentage: 3.2,
          label: 'market growth rate'
        },
        customerSatisfaction: {
          value: 8.4,
          percentage: 1.2,
          label: 'satisfaction score (1-10)'
        },
        brandPerformance: [
          { metric: 'Brand Awareness', score: 75, benchmark: 68, trend: 'improving' },
          { metric: 'Customer Loyalty', score: 82, benchmark: 74, trend: 'improving' },
          { metric: 'Market Penetration', score: 45, benchmark: 52, trend: 'declining' },
          { metric: 'Brand Trust', score: 88, benchmark: 79, trend: 'stable' }
        ],
        marketOpportunities: [
          {
            opportunity: 'Expand to mobile commerce',
            potential: 8.5,
            effort: 6.2,
            timeline: '6-9 months'
          },
          {
            opportunity: 'Target younger demographics',
            potential: 7.8,
            effort: 5.5,
            timeline: '3-6 months'
          }
        ]
      };

      // Predictive Analytics
      const predictiveAnalytics: PredictiveAnalyticsDto = {
        nextMonthRevenuePrediction: {
          value: currentRevenue * 1.08,
          percentage: 8.2,
          label: 'predicted next month revenue'
        },
        customerChurnPrediction: {
          value: 12.3,
          percentage: -2.1,
          label: 'predicted churn rate'
        },
        demandForecast: {
          value: 115,
          percentage: 15.2,
          label: 'demand index next quarter'
        },
        inventoryOptimization: {
          value: 85,
          percentage: 5.8,
          label: 'inventory efficiency score'
        },
        predictions: [
          {
            metric: 'Monthly Revenue',
            currentValue: currentRevenue / 12,
            predictedValue: (currentRevenue / 12) * 1.08,
            confidence: 85,
            timeframe: 'Next Month'
          },
          {
            metric: 'Customer Count',
            currentValue: totalCustomers,
            predictedValue: totalCustomers * 1.12,
            confidence: 78,
            timeframe: 'Next Quarter'
          }
        ],
        riskFactors: [
          {
            factor: 'Economic downturn affecting spending',
            probability: 25,
            impact: 7,
            mitigation: 'Diversify product portfolio and improve value proposition'
          },
          {
            factor: 'Increased competition in key markets',
            probability: 40,
            impact: 6,
            mitigation: 'Strengthen customer relationships and enhance product features'
          }
        ]
      };

      // Performance Benchmarks
      const performanceBenchmarks: PerformanceBenchmarkDto = {
        industryBenchmarks: [
          {
            metric: 'Customer Acquisition Cost',
            yourValue: 150,
            industryAverage: 175,
            topPerformers: 120,
            ranking: 'above'
          },
          {
            metric: 'Customer Lifetime Value',
            yourValue: parseFloat(customerLifetimeValue?.clv || '0'),
            industryAverage: 2200,
            topPerformers: 3500,
            ranking: 'below'
          },
          {
            metric: 'Conversion Rate',
            yourValue: 3.2,
            industryAverage: 2.8,
            topPerformers: 4.1,
            ranking: 'above'
          }
        ],
        competitorAnalysis: [
          {
            competitor: 'Competitor A',
            strengths: ['Strong brand recognition', 'Wide distribution network'],
            weaknesses: ['Higher prices', 'Limited product innovation'],
            marketPosition: 'Market Leader'
          },
          {
            competitor: 'Competitor B',
            strengths: ['Competitive pricing', 'Agile operations'],
            weaknesses: ['Limited customer service', 'Narrow product range'],
            marketPosition: 'Challenger'
          }
        ],
        improvementAreas: [
          {
            area: 'Customer Service',
            currentScore: 7.2,
            targetScore: 8.5,
            actions: ['Implement chatbot', 'Reduce response time', 'Train support staff']
          },
          {
            area: 'Product Innovation',
            currentScore: 6.8,
            targetScore: 8.0,
            actions: ['Increase R&D budget', 'Customer feedback integration', 'Competitive analysis']
          }
        ]
      };

      return {
        title: 'Analytics & Insights',
        description: 'Gain insights into your business performance.',
        businessInsights,
        customerBehavior,
        revenueAnalytics,
        marketAnalytics,
        predictiveAnalytics,
        performanceBenchmarks,
        keyTakeaways: [
          'Revenue growth is accelerating with mobile commerce leading the trend',
          'Customer retention improvements are showing positive ROI',
          'Market position is strong but requires investment in product innovation',
          'Predictive models suggest continued growth with manageable risk factors'
        ],
        actionableRecommendations: [
          {
            recommendation: 'Invest in mobile-first customer experience improvements',
            priority: 'high',
            estimatedImpact: '+15% revenue growth',
            timeToImplement: '3-4 months',
            resources: ['Development team', 'UX designers', '$50K budget']
          },
          {
            recommendation: 'Implement advanced customer segmentation for personalized marketing',
            priority: 'medium',
            estimatedImpact: '+8% conversion rate',
            timeToImplement: '2-3 months',
            resources: ['Marketing team', 'Data analyst', 'CRM platform']
          },
          {
            recommendation: 'Develop loyalty program with tiered benefits',
            priority: 'medium',
            estimatedImpact: '+12% customer retention',
            timeToImplement: '4-6 months',
            resources: ['Marketing team', 'Development team', '$30K budget']
          }
        ]
      };
    } catch (error) {
      console.error('Error in getAnalyticsInsights:', error);
      throw error;
    }
  }
} 
